/* ===================== v14.1 卡組職業：探索事件、後期商店、成就、卡牌圖鑑、文字 =====================
   · 區域事件：新增「古老祭壇」（免費升級或刪掉一張卡）；魔物潮・天候提高掉卡機率；兇暴化魔物照菁英掉卡
   · 迴廊看守人、深淵看守人：果實・天賦書・裝備換成卡（稀有以上／史詩三選一、免費升級）
   · 成就：等級・裝備・天賦・絕技的拿掉，換成卡牌成就；冒險手冊多「卡牌圖鑑」
   · 還在講等級、技能樹、裝備、打造的句子改成卡牌的說法 */
KD.RW.epic = { R: 1 };
// free upgrade / removal (祭壇・星塵)
KD.upOne = function* (title) { const st = Game.st, L = KD.sorted(KD.deck(st)).filter(KD.canUp); if (!L.length) { yield* say('牌組裡的卡都升級過了。'); return false; }
  const r = yield* KD.grid(title, L, { act: () => '再點一次：升級', detail: c => '升級後：' + KD.desc({ id: c.id, up: 1 }), hint: '選一張要升級的卡。' }); if (r < 0) return false;
  L[r].up = 1; Sound.sfx('levelup'); yield* say('「' + KD.CARDS[L[r].id].n + '」升級成「' + KD.name(L[r]) + '」了！'); return true; };
KD.remOne = function* (title) { const st = Game.st, D = KD.deck(st); if (KD.remNo(st, D)) { yield* say(KD.remMsg(st)); return false; }
  const L = KD.sorted(D), r = yield* KD.grid(title, L, { act: () => '再點一次：刪掉', hint: '選一張要從牌組刪掉的卡。' }); if (r < 0) return false;
  const c = L[r]; D.splice(D.indexOf(c), 1); KD.state(st).rem = (KD.state(st).rem || 0) + 1; Sound.sfx('select'); yield* say('「' + KD.name(c) + '」從牌組裡拿掉了。'); return true; };
/* ---------- 區域事件 ---------- */
if (typeof AEV !== 'undefined') {
  AEV.surge.d = '魔物大量出沒了！\n一段時間內更容易遇到魔物，金錢 +50%，掉卡的機率也提高。';
  AEV.rage.d = '一隻兇暴化的魔物出現了！\n（牠很強，但打倒牠一定會掉卡）';
  for (const k in WEATHER_OF) WEATHER_OF[k][1] = WEATHER_OF[k][1].replace('（Lv+2），但經驗值+40%', '，但掉卡的機率提高');
  AEV.altar = { n: '古老祭壇', w: 1.3, dur: 180, d: '附近出現了一座發光的古老祭壇。\n（可以免費升級或刪掉一張卡）', end: '祭壇的光芒消失了。' };
  GATHER_IMG.aevAltar = spriteFrom(['................', '.......yy.......', '......yccy......', '.......yy.......', '................', '...kkkkkkkkkk...', '...kwwwwwwwwk...', '...kDDDDDDDDk...', '....kwddddwk....', '....kdDDDDdk....', '....kdDDDDdk....', '....kdDDDDdk....', '...kkkkkkkkkk...', '..kwwwwwwwwwwk..', '..kDDDDDDDDDDk..', '..kkkkkkkkkkkk..'],
    { k: '#1c1430', w: '#e8e4f0', d: '#a8a4b8', D: '#6e6a80', y: '#ffe070', c: '#fffbe8' });
  { const _st = aevStart; aevStart = function (ow, key) { const r = _st.call(this, ow, key), A = ow.st.aev; if (r !== false && A && A.k === 'altar' && A.x == null) { const t = aevTile(ow, 3, 8); if (t) { [A.x, A.y] = t; aevSpawn(ow); } } return r; }; }
  { const _sp = aevSpawn; aevSpawn = function (ow) { _sp.call(this, ow); const A = aevHere(ow); if (A && !A.done && A.k === 'altar' && A.x != null) { const e = new Entity({ id: 'aevAltar', x: A.x, y: A.y, gather: 1, kind: 'aevAltar' }); e.aev = 1; ow.items.push(e); } }; }
  { const _tk = aevTalk; aevTalk = function* (ow, e) { const st = ow.st, A = st.aev; if (!e || e.id !== 'aevAltar' || !A) return yield* _tk.call(this, ow, e);
      yield* say('古老的祭壇發出柔和的光……\n（只能使用一次）'); const r = yield* ask('要做什麼？', ['升級一張卡', '刪掉一張卡', '離開']);
      const ok = r === 0 ? yield* KD.upOne('祭壇：免費升級') : r === 1 ? yield* KD.remOne('祭壇：免費刪卡') : false;
      if (ok) { A.done = 1; ow.items = ow.items.filter(q => q !== e); yield* say('祭壇的光芒慢慢消失了。'); } }; }
}
/* ---------- 迴廊看守人・深淵看守人 ---------- */
{ const _w = Events.warden; Events.warden = function* (ow) { if (Game.noV14) return yield* _w.call(this, ow); const st = Game.st;
    yield* say('我是迴廊的看守人。迴廊的門已經關上了……\n你手上還有徽章吧？在我這裡還是可以換東西。');
    const O = [['稀有以上的卡（三選一）', 4, 'boss'], ['史詩卡（三選一）', 10, 'epic'], ['萬靈藥', 4, 'elixir'], ['裂界碎片', 2, 'riftShard']];
    while (true) { const tok = st.bag.riftToken || 0, r = yield* ask('要用迴廊徽章交換什麼嗎？（持有' + tok + '枚）', [...O.map(o => o[0] + '　' + o[1] + '枚'), '不用了']); if (r < 0 || r >= O.length) return;
      const [n, c, k] = O[r]; if (tok < c) { yield* say('徽章不夠喔。'); continue; } st.bag.riftToken -= c;
      if (KD.RW[k]) yield* KD.pickFlow(KD.offer(KD.clsKey(st), k), '迴廊的卡：選一張', { noSkip: true, sub: '加入「' + KD.clsOf(st).n + '」的牌組' }); else { st.bag[k] = (st.bag[k] || 0) + 1; yield* itemGet('換到了' + ITEMS[k].n + '！'); } } }; }
if (Events.abyKeeper) { const _ak = Events.abyKeeper; Events.abyKeeper = function* (ow) { if (Game.noV14) return yield* _ak.call(this, ow); const st = Game.st;
    if (!st.flags.aby13Keeper) { st.flags.aby13Keeper = 1; yield* sayAll(['……你就是讓曙光鐘響起來的人？', '我以前是迴廊的看守人。門醒過來以後，迴廊變成了深淵。', '深淵裡的碎片和星塵，我都收。拿來換你需要的東西吧。']); }
    const O = [['萬靈藥', 'riftShard', 4, 'elixir'], ['特級傷藥', 'riftShard', 3, 'megaPotion'], ['史詩卡（三選一）', 'starShard', 10, 'epic'], ['升級一張卡', 'starDust', 4, 'up']];
    while (true) { const have = '裂界碎片 ' + (st.bag.riftShard || 0) + '・星之碎片 ' + (st.bag.starShard || 0) + '\n星塵 ' + (st.bag.starDust || 0);
      const r = yield* ask(have + '　要換什麼？', [...O.map(o => o[0] + '（' + ABY_CUR13[o[1]] + ' ' + o[2] + '）'), '不用了']); if (r < 0 || r >= O.length) return; const [n, cur, c, k] = O[r];
      if ((st.bag[cur] || 0) < c) { yield* say(ABY_CUR13[cur] + '不夠喔。'); continue; }
      if (k === 'up') { if (yield* KD.upOne('星塵：升級一張卡')) st.bag[cur] -= c; continue; } st.bag[cur] -= c;
      if (k === 'epic') yield* KD.pickFlow(KD.offer(KD.clsKey(st), 'epic'), '深淵的卡：選一張', { noSkip: true, sub: '加入「' + KD.clsOf(st).n + '」的牌組' }); else { st.bag[k] = (st.bag[k] || 0) + 1; yield* itemGet('換到了' + ITEMS[k].n + '！'); } } }; }
/* ---------- 成就 ---------- */
{ const gone = new Set(['enh5', 'gold', 'cls2', 'lv20', 'rainbow', 'master', 'allMaster']); for (let i = ACHIEVEMENTS.length - 1; i >= 0; i--) if (gone.has(ACHIEVEMENTS[i].id)) ACHIEVEMENTS.splice(i, 1);
  const sb = ACHIEVEMENTS.find(a => a.id === 'spellblade'); if (sb) sb.d = '打贏流浪的魔劍士。';
  const legN = st => { const K = KD.state(st); let n = 0; for (const k in K.decks) n += K.decks[k].filter(c => KD.CARDS[c.id] && KD.CARDS[c.id].rar === 'L').length; return n; };
  ACHIEVEMENTS.push({ id: 'k14_deck30', cat: '收集', n: '大牌組', d: '牌組達到 30 張。', ok: st => !!st.k14 && KD.fullDeck(st).length >= 30 },
    { id: 'k14_up10', cat: '成長', n: '千錘百鍊', d: '升級過的職業卡達到 10 張。', ok: st => !!st.k14 && KD.deck(st).filter(c => c.up).length >= 10 },
    { id: 'k14_rem5', cat: '成長', n: '去蕪存菁', d: '刪卡 5 次。', ok: st => !!st.k14 && (st.k14.rem || 0) >= 5 },
    { id: 'k14_cls4', cat: '成長', n: '全能的旅人', d: '四個職業都用過。', ok: st => !!st.k14 && KD.CLS_ORDER.every(k => st.k14.decks[k]) },
    { id: 'k14_leg5', cat: '收集', n: '傳說收藏家', d: '擁有 5 張傳說卡。', ok: st => !!st.k14 && legN(st) >= 5 },
    { id: 'k14_dex50', cat: '收集', n: '卡牌學者', d: '卡牌圖鑑收集達到 50%。', ok: st => !!st.k14 && KD.dexPct(st) >= 0.5 }); }
/* ---------- 卡牌圖鑑 ---------- */
KD.dexList = () => Object.keys(KD.CARDS).filter(id => !KD.CARDS[id].hidden && KD.CARDS[id].rar !== 'T').sort((a, b) => { const A = KD.CARDS[a], B = KD.CARDS[b], O = ['sw', 'rg', 'mg', 'bk', 'nt'];
  const g = q => q.rar === 'L' ? 1 : q.rar === 'Q' ? 2 : 0; return g(A) - g(B) || O.indexOf(A.cls) - O.indexOf(B.cls) || 'BCURL'.indexOf(A.rar) - 'BCURL'.indexOf(B.rar) || A.cost - B.cost || (a < b ? -1 : 1); });
KD.dexPct = (st = Game.st) => { const L = KD.dexList(), S = KD.state(st).seen || {}; return L.filter(id => S[id]).length / L.length; };
KD.dexScreen = function* () { const st = Game.st, S = KD.state(st).seen || {}, L = KD.dexList();
  yield* KD.grid('卡牌圖鑑', L.map(id => ({ id })), { right: () => L.filter(id => S[id]).length + '／' + L.length, hide: c => !S[c.id], hint: '拿到過的卡會記在這裡（「？」是還沒拿過的）。' }); };
handbookScreen12 = (_hb => function* () { if (Game.noV14) return yield* _hb.call(this); let hi = 0;
  while (true) { const late = (Game.st.flags.ch2 || 0) >= 10, fish = typeof rodOf13 === 'function' && rodOf13() >= 0, opts = ['任務', '魔物圖鑑', '卡牌圖鑑', '紀錄', '變強的方法'].concat(fish ? ['釣魚紀錄'] : []).concat(late ? ['還能做什麼'] : []).concat(['返回']);
    const r = yield* ask('冒險手冊', opts, { index: hi }), o = opts[r]; hi = Math.max(0, r);
    if (o === '任務') yield* questScreen(); else if (o === '魔物圖鑑') yield* dexScreen(); else if (o === '卡牌圖鑑') yield* KD.dexScreen(); else if (o === '紀錄') yield* recordScreen();
    else if (o === '變強的方法') { const G = typeof growList12 === 'function' ? growList12() : GROW12; while (true) { const k = yield* ask('變強的方法', G.map(q => q[0]).concat('返回')); if (k < 0 || k >= G.length) break; yield* say(G[k][1]); } }
    else if (o === '釣魚紀錄') yield* listScreen9('釣魚紀錄', fishLines13()); else if (o === '還能做什麼') yield* todoScreen12(false); else break; } })(handbookScreen12);
/* ---------- 文字：等級・技能樹・裝備・打造 → 卡牌 ---------- */
KD.TXT.push([/【推薦Lv[^】]*】/g, ''], [/[。，]?\s*推薦Lv\d+(?:\s*[〜~～-]\s*\d*)?/g, ''], [/（建議Lv\d+以上?）/g, ''],
  [/每個職業都有自己的核心資源，戰鬥中會累積起來，用來施放.*?的職業招式。/g, '打開選單的「牌組」看看你的卡。打怪、商店、任務都能拿到新卡。'], [/技能來自職業和武器。/g, '戰鬥用的是卡牌，牌組就是你的力量。'],
  [/（設計圖＋打造券）/g, '（卡牌三選一）'], [/(沙蟲|九頭蛇)裝備/g, '卡牌三選一'], [/新的打造配方、砂漠彎刀/g, '卡牌三選一'], [/、?(?:水神的祝福或|力量\+1或)?天賦之書/g, ''],
  [/我是鎮上的鐵匠。把魔物身上的素材帶來，我就幫你打造好東西！/g, '我是鎮上的鐵匠。現在改做卡牌工坊：帶金幣和素材來，我幫你把卡升級！'], [/武器和防具大多要找鐵匠打造。/g, '鐵匠那裡可以升級卡牌。'],
  [/對了，天賦選錯的話，這裡有賣遺忘之書喔。/g, ''], [/王國騎士團的裝備，這裡都有。/g, '王國騎士團的補給，這裡都有。'], [/不過你的裝備，我照樣打得出來。/g, '不過你的卡，我照樣幫你升級。'], [/鐵匠說，拿來打造武器最合適。/g, '鐵匠說，這是很珍貴的素材。'],
  [/（打造清單增加了[^）]*）/g, '（鐵匠送了謝禮。）'], [/完成：鐵匠可以打造峽谷和沼澤的裝備了。/g, '完成：幫鐵匠拿到了岩角。'],
  [/^（(?:技能樹還有|技能點累積了|還有 \d+ 點屬性點|打不贏的時候，可以去鐵匠)[^）]*）$/g, '（打不贏的時候：去商店買卡、刪掉弱的卡，或在鐵匠的卡牌工坊把卡升級。）'],
  [/掉裝備和稀有掉落的機率都加倍，很適合練等、刷寶。/g, '掉卡的機率比較高。'], [/經驗值和金錢\+50%/g, '金錢 +50%'], [/（精煉石拿去給鐵匠，可以讓同名的裝備「升星」變強。）/g, '']);
// the say chain: the old weapon / skill-tree rewording (ncTxt12) first, then the card wording
{ const _say = say; say = function* (text, ...a) { if (!Game.noV14 && typeof text === 'string' && typeof ncTxt12 === 'function') text = KD.fixTxt(ncTxt12(text)); return yield* _say.call(this, text, ...a); }; }
{ const _ig = itemGet; itemGet = function* (text, ...a) { return yield* _ig.call(this, KD.fixTxt(text), ...a); }; }
// quest log / signs drawn straight to the screen: drop 「推薦Lv」
for (const f of ['draw', 'drawC', 'drawR']) { const _f = Font[f]; Font[f] = function (x, s, ...a) { if (typeof s === 'string' && s.indexOf('Lv') >= 0 && !Game.noV14 && /推薦Lv|建議Lv/.test(s)) s = KD.fixTxt(s); return _f.call(this, x, s, ...a); }; }
// the first-skill note of the old ceremony never shows
{ const _as = applyStartClass; applyStartClass = function (k) { _as(k); if (Game.st) Game.st.first13 = null; }; }
