/* ===================== v14.0 卡組職業：成長、選單、商店 =====================
   · 存檔：st.k14 = { cls, decks: { 職業: [{id, up}] }, hpPlus, boss: { 頭目: 1 }, rem: 刪卡次數, shops }
   · 開場在村長那裡選職業（劍士・盜賊・法師・狂戰士）；城鎮裡（沒有野生魔物的地方）可以轉職，每個職業各有一副牌組
   · 卡從打怪（一般 30%、菁英和頭目必掉，三選一可跳過）、商店、任務得到；鐵匠改成「卡牌工坊」（升級 +1）；商店可以刪卡
   · 頭目第一次擊敗：最大 HP +5，得到牠的傳說卡，再三選一（稀有以上）
   · 等級、屬性、天賦、技能樹、裝備都拿掉了；拿到的裝備換成卡牌獎勵（戰鬥中掉的換成金幣） */
KD.state = (st = Game.st) => { if (!st) return { cls: 'sw', decks: {}, hpPlus: 0, boss: {}, rem: 0 }; const K = st.k14 || (st.k14 = { cls: 'sw', decks: {}, hpPlus: 0, boss: {}, rem: 0, v: 1 }); K.decks = K.decks || {}; K.boss = K.boss || {}; return K; };
KD.clsKey = (st = Game.st) => { const k = KD.state(st).cls; return KD.CLASSES[k] ? k : 'sw'; };
KD.clsOf = (st = Game.st) => KD.CLASSES[KD.clsKey(st)];
KD.startDeck = cls => { const out = []; for (const [id, n] of KD.CLASSES[cls].start) for (let i = 0; i < n; i++) out.push({ id, up: 0 }); return out; };
KD.deck = (st = Game.st) => { const K = KD.state(st), k = KD.clsKey(st); if (!K.decks[k] || !K.decks[k].length) { K.decks[k] = KD.startDeck(k); KD.markSeen(K, K.decks[k]); } K.decks[k] = K.decks[k].filter(c => KD.CARDS[c.id]); KD.syncU(K, k, K.decks[k]); return K.decks[k]; };
// v14.2 one-of-a-kind cards (頭目傳說卡・任務卡) belong to the hero, not the class: every class's deck gets each one once (a removed one stays removed)
KD.uniq = K => Object.keys(K.boss || {}).map(sp => KD.BOSS_CARD[sp]).concat(Object.keys(K.qc || {})).filter(id => KD.CARDS[id]);
KD.syncU = (K, k, D) => { const G = (K.gave = K.gave || {})[k] || (K.gave[k] = {}); for (const id of KD.uniq(K)) { if (G[id]) continue; G[id] = 1; if (!D.some(c => c.id === id)) D.push({ id, up: 0 }); (K.seen = K.seen || {})[id] = 1; } };
KD.fullDeck = (st = Game.st) => KD.deck(st); KD.deckN = (st = Game.st) => KD.fullDeck(st).length; KD.remNo = (st, D) => D.length <= 5; KD.remMsg = () => '牌組太少了，不能再刪。'; // v14.16: 裝備卡 (14s)
KD.markSeen = (K, L) => { K.seen = K.seen || {}; for (const c of L) K.seen[c.id] = 1; };
KD.maxHp = (st = Game.st) => KD.clsOf(st).hp + (KD.state(st).hpPlus || 0);
KD.bossN = (st = Game.st) => Object.keys(KD.state(st).boss).length;
KD.addCard = (st, c) => { const id = c.id || c, C = KD.CARDS[id], D = KD.deck(st); if (!(C && (C.boss || C.quest) && D.some(q => q.id === id))) D.push({ id, up: c.up ? 1 : 0 }); const K = KD.state(st); (K.seen = K.seen || {})[id] = 1; };
KD.wildRate = (cfg = {}, st = Game.st) => Math.min(0.8, 0.3 + (cfg.aevGold ? 0.2 : 0) + (cfg.aevExp && !cfg.aevGold ? 0.2 : 0) + (st && /^cave6_/.test(st.map || '') ? 0.15 : 0));
KD.gW = lv => Math.round(KD.tab([[1, 25], [7, 64], [12, 168], [17, 400], [22, 600], [30, 700], [45, 700], [60, 780]], lv));
KD.price = (rar, st = Game.st) => Math.round(KD.gW(st.lv || 1) * ({ C: 3, U: 5, R: 10, L: 20 }[rar] || 3) / 5) * 5;
KD.gearGold = g => { try { return Math.max(10, typeof gearSell === 'function' ? gearSell(g) : 50 * (g.q || 1)); } catch (e) { return 50; } };
// stats: only HP is left (from the class); talents are gone
{ const _hs = heroStats; heroStats = function (st = Game.st, ...a) { const S = _hs.call(this, st, ...a); if (Game.noV14 || !st) return S; return { ...S, hp: KD.maxHp(st), mp: 0, fx: {} }; }; }
if (typeof talentSum === 'function') talentSum = () => 0;
if (typeof tsumPre === 'function') tsumPre = () => ({});
/* ---------- card offers ---------- */
KD.RW = { wild: { C: 0.62, U: 0.33, R: 0.05 }, elite: { C: 0.35, U: 0.5, R: 0.15 }, boss: { U: 0.5, R: 0.5 }, catch: { C: 0.4, U: 0.45, R: 0.15 } };
KD.offer = (cls, kind, n = 3, rng = Math.random) => { const W = KD.RW[kind] || KD.RW.wild, out = [];
  for (let g = 0; out.length < n && g < 60; g++) { let r = rng(), rar = null; for (const k of ['C', 'U', 'R']) { const w = W[k] || 0; if (!w) continue; if (r < w) { rar = k; break; } r -= w; } if (!rar) rar = W.R ? 'R' : 'U';
    const mine = Object.keys(KD.CARDS).filter(id => { const C = KD.CARDS[id]; return C.cls === cls && C.rar === rar && !C.hidden && !out.includes(id); }), nt = KD.pool(cls, rar).filter(id => KD.CARDS[id].cls === 'nt' && !out.includes(id));
    const L = (rng() < 0.25 && nt.length) || !mine.length ? nt : mine; if (L.length) out.push(L[Math.floor(rng() * L.length)]); }
  return out; };
// three cards on the screen: tap one to read it, tap again (or 「選這張」) to take it; 「跳過」 takes none
KD.pick3 = function* (ids, title, o = {}) { const S = { sel: -1, done: false, res: null }, cw = 54, ch = 108, gap = 5, X0 = Math.round((W - (ids.length * cw + (ids.length - 1) * gap)) / 2), Y = 36; // v14.20: bigger cards (was 50×78 at y 52) so the effect fits on the face; v14.21: 108 high (the text is smaller)
  const ui = { draw: x => { x.fillStyle = '#06040e'; x.fillRect(0, 0, W, H); Font.drawC(x, title, W / 2, 6, '#ffe0a0', '#000', 11); if (o.sub) Font.drawC(x, o.sub, W / 2, 19, '#c8c0e0', '#000', 8);
      ids.forEach((id, i) => { const X = X0 + i * (cw + gap), up = S.sel === i ? 6 : 0; KD.drawCard(x, { id, up: o.up ? 1 : 0 }, X, Y - up, cw, ch, { on: S.sel === i }); touchRegion(X, Y - up, cw, ch, () => { if (S.sel === i) S.res = id, S.done = true; else S.sel = i; }); });
      const id = ids[S.sel]; if (id) { const C = KD.CARDS[id], c = { id, up: o.up ? 1 : 0 }; { const tx = KD.atTag(x, c, 8, 157, 8); fontFit(x, KD.name(c) + '　' + KD.typeN(c) + '・' + KD.cost(c) + ' 能量・' + KD.RAR[C.rar].n, tx, 157 - 8, W - 8 - tx, KD.RAR[C.rar].c, '#000', 8); }
        wrap15(KD.desc(c), W - 16, 8).slice(0, 4).forEach((L, k) => Font.draw(x, L, 8, 170 + k * 11 - 8, '#e8e4f4', '#000', 8));
        x.fillStyle = '#c86030'; x.fillRect(W / 2 - 60, 220, 56, 18); KD.tc(x, o.okText || '選這張', W / 2 - 32, 229, '#fff4e0', '#000', 9); touchRegion(W / 2 - 60, 220, 56, 18, () => { S.res = id; S.done = true; }); }
      else KD.tc(x, '點卡片看說明', W / 2, 160, '#8a93b3', '#000', 8);
      if (!o.noSkip) { x.fillStyle = '#4a3a50'; x.fillRect(W / 2 + 4, 220, 56, 18); KD.tc(x, '跳過', W / 2 + 32, 229, '#e8e4f4', '#000', 9); touchRegion(W / 2 + 4, 220, 56, 18, () => { S.res = null; S.done = true; }); } } };
  UI.push(ui); Input.consume('a', 'b');
  while (!S.done) { yield; if (Input.pressed('left')) { S.sel = S.sel <= 0 ? ids.length - 1 : S.sel - 1; Sound.sfx('cursor'); } if (Input.pressed('right')) { S.sel = (S.sel + 1) % ids.length; Sound.sfx('cursor'); }
    if (Input.pressed('a') && S.sel >= 0) { S.res = ids[S.sel]; S.done = true; } if (Input.pressed('b') && !o.noSkip) { S.res = null; S.done = true; } }
  UI.remove(ui); Input.consume('a', 'b'); Sound.sfx(S.res ? 'select' : 'cursor'); return S.res; };
KD.pickFlow = function* (ids, title, o = {}) { if (!ids.length) return null; const id = yield* KD.pick3(ids, title, o); if (id) KD.addCard(Game.st, { id, up: o.up ? 1 : 0 }); return id; };
// one card shown big (a boss's legendary card)
KD.showCard = function* (id, title) { let done = false, t = 0; const ui = { draw: x => { x.fillStyle = 'rgba(6,4,14,0.9)'; x.fillRect(0, 0, W, H); Font.drawC(x, title, W / 2, 20, '#ffd060', '#000', 11);
      const s = Math.min(1, t / 14); KD.drawCard(x, { id }, W / 2 - 30, 44 + (1 - s) * 20, 60, 86, {}); wrap15(KD.desc({ id }), W - 20, 9).slice(0, 4).forEach((L, k) => Font.draw(x, L, 10, 140 + k * 12, '#e8e4f4', '#000', 9));
      Font.drawC(x, '（點一下繼續）', W / 2, 214, '#8a93b3', '#000', 8); touchRegion(0, 0, W, H, () => { if (t > 20) done = true; }); } };
  UI.push(ui); Sound.jingle('item'); while (!done) { t++; yield; if (t > 20 && (Input.pressed('a') || Input.pressed('b'))) done = true; } UI.remove(ui); Input.consume('a', 'b'); };
/* ---------- after a battle: boss firsts, then a card ---------- */
KD.battleRewards = function* (b) { const st = Game.st, K = KD.state(st), cfg = b.cfg || {}, kind = cfg.kind || 'wild', sp = cfg.id || (b.F && b.F.sp), rng = () => b.core.rng.next();
  if (kind === 'boss' && sp && !cfg.rematch && !K.boss[sp] && KD.BOSS_CARD[sp]) { K.boss[sp] = 1; K.hpPlus = (K.hpPlus || 0) + 5; st.hp = Math.min(KD.maxHp(st), st.hp + 5); Sound.jingle('levelup');
    yield* b.msg('打倒了頭目！最大 HP +5（現在 ' + KD.maxHp(st) + '）', { keep14: 1, hold: 40 }); const lg = KD.BOSS_CARD[sp]; KD.addCard(st, { id: lg }); yield* KD.showCard(lg, '得到了傳說卡！'); KD.dress(st); }
  const k = kind === 'boss' ? 'boss' : kind === 'elite' || cfg.champ12 ? 'elite' : rng() < KD.wildRate(cfg, st) ? 'wild' : null; if (!k) return;
  yield* KD.pickFlow(KD.offer(KD.clsKey(st), k, 3, rng), k === 'boss' ? '頭目的獎勵：選一張卡' : k === 'elite' ? '菁英的獎勵：選一張卡' : '得到了卡牌！選一張', { sub: '加入「' + KD.clsOf(st).n + '」的牌組' }); };
/* ---------- the look: the class's weapon (better-looking as more bosses fall) ---------- */
KD.dress = (st = Game.st) => { const CL = KD.clsOf(st), L = (typeof BASE11 !== 'undefined' && BASE11.weapon[CL.wkind]) || []; if (!L.length) return; const t = Math.max(0, Math.min(L.length - 1, Math.floor(KD.bossN(st) / 2)));
  const cur = gearBy(st.equip && st.equip.weapon, st); if (cur && cur.b === L[t] && cur.k14c) return; if (cur) st.gear = st.gear.filter(g => g !== cur);
  const G0 = typeof GEAR11_GLAM !== 'undefined' ? GEAR11_GLAM : null; try { if (G0 != null) GEAR11_GLAM = false; const g = makeGear(L[t], 3); g.k14c = 1; st.equip.weapon = g.u; } finally { if (G0 != null) GEAR11_GLAM = G0; } };
/* ---------- a new game: the class is picked at the elder ---------- */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.k14 = { cls: 'sw', decks: {}, hpPlus: 0, boss: {}, rem: 0, v: 1 }; } return st; }; }
classSelectScreen = function* () { while (true) { const i = yield* ask('選一個職業吧。（之後在城鎮也能轉職）', KD.CLS_ORDER.map(k => KD.CLASSES[k].n + '　HP ' + KD.CLASSES[k].hp)); const k = KD.CLS_ORDER[Math.max(0, i)], C = KD.CLASSES[k];
    yield* say('「' + C.n + '」HP ' + C.hp + '。' + C.d); yield* say('職業能力「' + C.ab + '」：' + C.abd);
    if (yield* yesNo('就選「' + C.n + '」嗎？')) { KD.state().cls = k; NC_PICK12 = C.wkind; if (typeof CLASS_START !== 'undefined' && CLASS_START[NC12]) CLASS_START[NC12].gear = [BASE11.weapon[C.wkind][0], 'guardBadge']; return NC12; } } };
{ const _as = applyStartClass; applyStartClass = function (k) { _as(k); const st = Game.st; KD.deck(st); const w = gearBy(st.equip && st.equip.weapon, st); if (w) w.k14c = 1; st.hp = KD.maxHp(st); }; }
/* ---------- old saves: the new rules, a class from the main weapon, cards for the progress so far ---------- */
KD.KIND_CLS = { 劍: 'sw', 雙劍: 'sw', 單手盾: 'sw', 雙盾: 'sw', 長槍: 'sw', 短刀: 'rg', 雙刀: 'rg', 火槍: 'rg', 法杖: 'mg', 魔導書: 'mg', 樂器: 'mg', 斧: 'bk', 拳套: 'bk' };
KD.migrate = (st) => { if (!st || st.k14) return null; const kind = typeof mainKind11 === 'function' ? mainKind11(st) : null, K = KD.state(st); K.cls = KD.KIND_CLS[kind] || 'sw'; K.old = 1;
  for (const sp in KD.BOSS_CARD) if (st.dex && st.dex[sp] && st.dex[sp].won > 0) { K.boss[sp] = 1; K.hpPlus += 5; }
  const deck = KD.deck(st); KD.markSeen(K, deck);
  let gold = 0; const keep = new Set(Object.values(st.equip || {})); st.gear = (st.gear || []).filter(g => { if (keep.has(g.u) || (KD.gearOk16 && GEAR[g.b] && KD.gearOk16(g.b))) { g.k14c = 1; return true; } gold += KD.gearGold(g); return false; }); /* v14.16: weapons and armour that bring cards stay */
  for (const k in st.bag || {}) { const it = ITEMS[k]; if (it && ['mp', 'boost', 'tp', 'reset'].includes(it.use) && st.bag[k] > 0) { gold += Math.round((it.price || 100) * 0.5) * st.bag[k]; delete st.bag[k]; } }
  if (st.flags) { st.flags.tutMat12 = 1; const told = st.flags.zjTold12 || (st.flags.zjTold12 = {}); for (const q in KD.TEACH) if (st.flags[q]) told[q] = 1; }
  st.money = (st.money || 0) + gold; K.catchup = Math.min(10, 2 + KD.bossN(st)); st.hp = KD.maxHp(st); st.mp = 0; KD.dress(st); return gold; };
KD.catchupScript = function* (gold) { const st = Game.st, K = KD.state(st), CL = KD.clsOf(st);
  yield* say('（遊戲改版了！戰鬥變成卡牌，沒有等級了，強度看你的牌組；身上的武器和防具會帶卡。）');
  yield* say('（你的職業是「' + CL.n + '」。' + (gold ? '用不到的裝備和道具換成了 ' + gold + ' G。' : '') + '接下來依照目前的進度選 ' + K.catchup + ' 次卡。）');
  while (K.catchup > 0) { K.catchup--; yield* KD.pickFlow(KD.offer(KD.clsKey(st), 'catch'), '補卡：選一張（還有 ' + K.catchup + ' 次）', { sub: '加入「' + CL.n + '」的牌組' }); } };
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st, g = !Game.noV14 && st && !st.k14 && (st.lv || 1) > 1 ? KD.migrate(st) : null; const r = _so.apply(this, a);
    if (!Game.noV14 && st && st.k14 && (st.k14.catchup || 0) > 0 && Game.ow && !Game.ow.script) Game.ow.run(KD.catchupScript(g)); return r; }; }
// gear that turns up anyway (quests, chests, events) becomes a card pick
KD.sweep = (st = Game.st) => { if (!st || !st.gear) return []; const keep = new Set(Object.values(st.equip || {})), out = []; st.gear = st.gear.filter(g => { if (keep.has(g.u) || g.k14c) return true; out.push(g); return false; }); return out; };
KD.sweepScript = function* (L) { const st = Game.st; for (const g of L) { const nm = (typeof gearName === 'function' ? gearName(g) : (GEAR[g.b] || {}).n) || '裝備', q = g.q || 1;
    yield* say('（' + nm + '換成了卡牌獎勵。）'); yield* KD.pickFlow(KD.offer(KD.clsKey(st), q >= 4 ? 'elite' : 'wild'), '卡牌獎勵：選一張', { sub: '加入「' + KD.clsOf(st).n + '」的牌組' }); } };
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const r = _u.apply(this, a);
    if (!Game.noV14 && Game.scene === this && !this.script && !UI.stack.length && Game.st && Game.st.k14) { const L = KD.sweep(); if (L.length) this.run(KD.sweepScript(L)); } return r; }; }
/* ---------- the menu ---------- */
KD.isTown = (st = Game.st) => { const M = MAPS[st.map]; return !!M && !(M.encounters || []).length && !M.boss; };
{ const TILES = [['狀態', '職業・HP'], ['牌組', '查看卡牌'], ['裝備', '換裝・看帶的卡'], ['冒險手冊', '任務・圖鑑・紀錄'], ['背包', '道具・素材'], ['職業', '轉職（城鎮）'], ['存檔', '記錄進度'], ['設定', '音量・速度'], ['關閉', '回到遊戲']];
  const _sm = startMenu; startMenu = function* (...a) { if (Game.noV14) return yield* _sm.apply(this, a); Game.inMenu13 = (Game.inMenu13 || 0) + 1;
    try { Sound.sfx('menu'); let idx = Game.menuIdx || 0;
      while (true) { const st = Game.st, CL = KD.clsOf(st), mh = KD.maxHp(st);
        const hdr = { draw(x) { x.fillStyle = 'rgba(8,10,20,0.78)'; x.fillRect(0, 0, W, H); drawWin(x, 4, 4, 168, 40, 'menu'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 10, 8, 24, 33);
            const nx = Font.draw(x, st.name, 40, 3, UIC.text, UIC.textSh, 11); Font.draw(x, CL.n, nx + 4, 5, CL.c, UIC.textSh, 9);
            Font.draw(x, 'HP ' + st.hp + '/' + mh, 40, 16, UIC.good, UIC.textSh, 9); Font.draw(x, '牌組 ' + KD.deckN(st) + ' 張', 100, 16, '#ffd090', UIC.textSh, 9); Font.drawR(x, st.money + ' G', 166, 27, UIC.warm, UIC.textSh, 9);
            if (typeof dnMenuLoc12 === 'function') dnMenuLoc12(x, st, 40, 27, 166 - Font.width(st.money + ' G', 10)); else Font.draw(x, MAPS[st.map] ? MAPS[st.map].name || '' : '', 40, 27, UIC.muted, UIC.textSh, 9); } };
        UI.push(hdr);
        const items = TILES.map(([t, sub]) => ({ t: '', name: t, sub }));
        const r = yield* choose(items, { x: 4, y: 48, w: 168, h: 204, cols: 2, colW: 82, rowH: 40, ox: 4, oy: 3, buttons: true, style: 'menu', index: Math.min(idx, items.length - 1), drawExtra: (x, m) => { for (let k = 0; k < items.length; k++) { const c = k % 2, rr = Math.floor(k / 2), X = m.x + m.ox + c * m.colW, Y = m.y + m.oy + rr * m.rowH, on = k === m.i; Font.drawC(x, items[k].name, X + 39, Y + 4, on ? UIC.text : '#c9cfe4', UIC.textSh, 12); Font.drawC(x, items[k].sub, X + 39, Y + 20, on ? UIC.accent : UIC.muted, UIC.textSh, 8); } } });
        UI.remove(hdr);
        const name = r >= 0 ? TILES[r][0] : '關閉'; if (name === '關閉') break; idx = r; Game.menuIdx = r;
        if (name === '狀態') yield* KD.statusScreen(); if (name === '牌組') yield* KD.deckScreen(); if (name === '裝備') yield* KD.equipScreen(); if (name === '冒險手冊') yield* handbookScreen12(); if (name === '職業') yield* KD.classScreen();
        if (name === '背包') { yield* bagScreen('field'); if (Game.homeWarp) break; }
        if (name === '存檔') { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } }
        if (name === '設定') yield* optionsScreen(); }
      if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
    } finally { Game.inMenu13--; } }; }
// a grid of cards (deck, workshop, shop, removal): returns the tapped index when `act` is given, else just browses
KD.grid = function* (title, cards, o = {}) { const S = { sel: -1, scroll: 0, done: false, res: -1 }, cw = 38, ch = 54, cols = 4, gap = o.tag ? 13 : 5, vis = o.tag ? Math.min(2, o.rows || 2) : (o.rows || 3), top = o.top || 22; // v14.9: a price line under each card needs its own gap (the next row used to cover it)
  if (o.tabs) S.tab = 0;
  const ui = { draw: x => { screenBG(x); headerBar(x, title); if (o.right) Font.drawR(x, o.right(), W - 6, 4, UIC.muted, UIC.textSh, 9);
      if (o.tabs) o.tabs.forEach((T, i) => { const bw = 48, X = W - 4 - (o.tabs.length - i) * (bw + 2), on = S.tab === i; x.fillStyle = on ? '#c86030' : '#3a3050'; x.fillRect(X, 2, bw, 14); fontFit(x, T.n, X + bw / 2, 3, bw - 4, on ? '#fff4e0' : '#c8c0e0', '#000', 8, 'c'); // v14.16: 職業卡／裝備卡
        touchRegion(X, 2, bw, 14, () => { if (S.tab !== i) { S.tab = i; cards = T.cards; S.sel = -1; S.scroll = 0; Sound.sfx('cursor'); } }); });
      const rows = Math.ceil(cards.length / cols); for (let i = 0; i < cards.length; i++) { const r = Math.floor(i / cols) - S.scroll; if (r < 0 || r >= vis) continue; const X = 6 + (i % cols) * (cw + 4), Y = top + r * (ch + gap);
        if (o.hide && o.hide(cards[i])) { x.fillStyle = '#0c0814'; x.fillRect(X - 1, Y - 1, cw + 2, ch + 2); x.fillStyle = '#241c34'; x.fillRect(X, Y, cw, ch); x.fillStyle = '#3a3050'; x.fillRect(X + 3, Y + 3, cw - 6, ch - 6); Font.drawC(x, '？', X + cw / 2, Y + ch / 2 - 8, '#6a6088', null, 12); }
        else KD.drawCard(x, cards[i], X, Y, cw, ch, { on: S.sel === i, dim: o.dim ? o.dim(cards[i], i) : false }); if (o.tag) { const t = o.tag(cards[i], i); if (t) Font.drawC(x, t, X + cw / 2, Y + ch + 1, '#ffe0a0', '#000', 7); }
        if (o.badge) { const t = o.badge(cards[i], i); if (t) { const bw = Math.ceil(Font.width(t, 7)) + 4; x.fillStyle = 'rgba(10,8,20,0.88)'; x.fillRect(X + cw - bw - 1, Y + 1, bw, 9); Font.drawR(x, t, X + cw - 3, Y, '#ffe8a0', '#000', 7); } }
        touchRegion(X, Y, cw, ch, () => { if (S.sel === i && o.act) { S.res = i; S.done = true; } else S.sel = i; }); }
      if (S.scroll > 0) { Font.drawC(x, '▲', W / 2, top - 8, '#c8a050', null, 8); touchRegion(40, top - 10, W - 80, 10, () => { S.scroll--; }); }
      const by = top + vis * (ch + gap); if (S.scroll + vis < rows) { Font.drawC(x, '▼', W / 2, by - 4, '#c8a050', null, 8); touchRegion(40, by - 6, W - 80, 10, () => { S.scroll++; }); }
      const c = cards[S.sel] && !(o.hide && o.hide(cards[S.sel])) ? cards[S.sel] : null; const dy = by + 6; if (c) { const C = KD.CARDS[c.id]; { const tx = KD.atTag(x, c, 6, dy + 6, 8); Font.draw(x, KD.name(c) + '　' + KD.typeN(c) + '・' + KD.cost(c) + ' 能量', tx, dy - 2, KD.RAR[C.rar].c, '#000', 9); }
        wrap15((o.detail ? o.detail(c) : KD.desc(c)), W - 12, 8).slice(0, 3).forEach((L, k) => Font.draw(x, L, 6, dy + 12 + k * 10, '#e8e4f4', '#000', 8)); if (o.act) Font.drawR(x, o.act(c), W - 6, H - 12, '#a8e0ff', '#000', 8); }
      else Font.draw(x, o.hint || '點卡片看說明。', 6, dy + 4, UIC.muted, UIC.textSh, 8);
      x.fillStyle = '#4a3a50'; x.fillRect(4, H - 16, 36, 14); Font.drawC(x, '返回', 22, H - 15, '#e8e4f4', '#000', 9); touchRegion(4, H - 16, 36, 14, () => { S.done = true; }); } };
  UI.push(ui); Input.consume('a', 'b');
  while (!S.done) { yield; if (Input.pressed('b')) break; const n = cards.length; if (Input.pressed('right')) S.sel = Math.min(n - 1, S.sel + 1); if (Input.pressed('left')) S.sel = Math.max(0, S.sel - 1); if (Input.pressed('down')) S.sel = Math.min(n - 1, S.sel + cols); if (Input.pressed('up')) S.sel = Math.max(0, S.sel - cols);
    if (S.sel >= 0) { const r = Math.floor(S.sel / cols); if (r < S.scroll) S.scroll = r; if (r >= S.scroll + vis) S.scroll = r - vis + 1; } if (Input.pressed('a') && S.sel >= 0 && o.act) { S.res = S.sel; S.done = true; } }
  UI.remove(ui); Input.consume('a', 'b'); return S.res; };
KD.sorted = L => L.slice().sort((a, b) => 'atkskpow'.indexOf(KD.CARDS[a.id].type.slice(0, 2)) - 'atkskpow'.indexOf(KD.CARDS[b.id].type.slice(0, 2)) || KD.cost(a) - KD.cost(b) || (a.id < b.id ? -1 : 1) || (b.up || 0) - (a.up || 0));
KD.deckScreen = function* () { const st = Game.st, G = []; for (const c of KD.sorted(KD.deck(st))) { const g = G[G.length - 1]; if (g && g.id === c.id && (g.up || 0) === (c.up || 0)) g.n++; else G.push({ id: c.id, up: c.up || 0, n: 1 }); } // v14.9: the same card shows once with ×N (a 60-card deck used to be 15 pages of 斬擊)
  yield* KD.grid('牌組・' + KD.clsOf(st).n, G, { right: () => KD.deck(st).length + ' 張', rows: 3, badge: c => c.n > 1 ? '×' + c.n : '' }); };
KD.statusScreen = function* () { const st = Game.st, CL = KD.clsOf(st), K = KD.state(st), D = KD.fullDeck(st); let done = false;
  const cnt = t => D.filter(c => KD.CARDS[c.id].type === t).length;
  const ui = { draw: x => { screenBG(x); headerBar(x, '冒險者資料'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 10, 26, 32, 44);
      Font.draw(x, st.name, 48, 26, UIC.text, UIC.textSh, 12); Font.draw(x, CL.n, 48, 42, CL.c, UIC.textSh, 11); Font.draw(x, 'HP ' + st.hp + ' / ' + KD.maxHp(st), 48, 58, UIC.good, UIC.textSh, 10);
      { const bo = st.boost || {}, bl = (typeof KD.BOOST_HP === 'number' ? KD.BOOST_HP : 0) * ((bo.vit || 0) + (bo.str || 0)); Font.draw(x, '（職業 ' + CL.hp + '＋頭目 ' + (K.hpPlus || 0) + (bl ? '＋祝福 ' + bl : '') + '）', 48, 72, UIC.muted, UIC.textSh, 8); }
      Font.draw(x, '職業能力「' + CL.ab + '」', 8, 90, '#ffd090', UIC.textSh, 10); wrap15(CL.abd, W - 16, 9).forEach((L, k) => Font.draw(x, L, 8, 104 + k * 11, UIC.text, UIC.textSh, 9));
      Font.draw(x, '牌組 ' + D.length + ' 張（攻擊 ' + cnt('atk') + '・技能 ' + cnt('skl') + '・能力 ' + cnt('pow') + '）', 8, 136, UIC.text, UIC.textSh, 9);
      Font.draw(x, '升級過的卡 ' + D.filter(c => c.up).length + ' 張', 8, 150, UIC.muted, UIC.textSh, 9); Font.draw(x, '打倒的頭目 ' + KD.bossN(st), 8, 164, UIC.muted, UIC.textSh, 9); Font.draw(x, '金幣 ' + st.money + ' G', 8, 178, UIC.warm, UIC.textSh, 9);
      Font.draw(x, '變強：打怪拿卡、商店買卡和刪卡、', 8, 200, UIC.muted, UIC.textSh, 8); Font.draw(x, '鐵匠打造裝備、升級卡。', 8, 211, UIC.muted, UIC.textSh, 8);
      x.fillStyle = '#4a3a50'; x.fillRect(4, H - 16, 36, 14); Font.drawC(x, '返回', 22, H - 15, '#e8e4f4', '#000', 9); touchRegion(0, 0, W, H, () => { done = true; }); } };
  UI.push(ui); Input.consume('a', 'b'); while (!done) { yield; if (Input.pressed('a') || Input.pressed('b')) done = true; } UI.remove(ui); Input.consume('a', 'b'); };
KD.classScreen = function* () { const st = Game.st, K = KD.state(st), town = KD.isTown(st); let S = { sel: KD.CLS_ORDER.indexOf(KD.clsKey(st)), done: false, go: null };
  const ui = { draw: x => { screenBG(x); headerBar(x, '職業'); Font.drawR(x, town ? '可以轉職' : '在城鎮才能轉職', W - 6, 4, town ? UIC.good : UIC.muted, UIC.textSh, 8);
      KD.CLS_ORDER.forEach((k, i) => { const C = KD.CLASSES[k], Y = 22 + i * 44, on = S.sel === i, cur = KD.clsKey(st) === k, d = K.decks[k];
        drawWin(x, 4, Y, W - 8, 41, on ? 'menu' : 'ow'); Font.draw(x, C.n, 10, Y + 2, C.c, UIC.textSh, 11); Font.draw(x, 'HP ' + C.hp, 60, Y + 4, UIC.good, UIC.textSh, 8); Font.drawR(x, cur ? '目前' : d ? '職業卡 ' + d.length + ' 張' : '還沒用過', W - 10, Y + 4, cur ? UIC.accent : UIC.muted, UIC.textSh, 8);
        wrap15('「' + C.ab + '」' + C.abd, W - 22, 8).slice(0, 2).forEach((L, k) => fontFit(x, L, 10, Y + 14 + k * 11, W - 22, UIC.text, UIC.textSh, 8)); /* v14.16: the longer abilities wrap (font 8) */ touchRegion(4, Y, W - 8, 41, () => { if (S.sel === i) S.go = k; else S.sel = i; }); });
      Font.draw(x, town ? '點兩下轉職。每個職業有自己的牌組。' : '在沒有野生魔物的城鎮裡可以轉職。', 6, 202, UIC.muted, UIC.textSh, 8);
      x.fillStyle = '#4a3a50'; x.fillRect(4, H - 16, 36, 14); Font.drawC(x, '返回', 22, H - 15, '#e8e4f4', '#000', 9); touchRegion(4, H - 16, 36, 14, () => { S.done = true; }); } };
  UI.push(ui); Input.consume('a', 'b');
  while (!S.done) { yield; if (Input.pressed('b')) break; if (Input.pressed('down')) S.sel = (S.sel + 1) % 4; if (Input.pressed('up')) S.sel = (S.sel + 3) % 4; if (Input.pressed('a')) S.go = KD.CLS_ORDER[S.sel];
    if (S.go) { const k = S.go; S.go = null; if (k === KD.clsKey(st)) continue; if (!town) { Sound.sfx('buzz'); continue; } UI.remove(ui);
      const fresh = !K.decks[k]; if (yield* yesNo('轉職成「' + KD.CLASSES[k].n + '」嗎？' + (fresh ? '\n（第一次：拿到起始牌組，再依進度選幾張卡）' : ''))) { const r0 = st.hp / Math.max(1, KD.maxHp(st)); K.cls = k; KD.deck(st); KD.dress(st); st.hp = Math.max(1, Math.round(KD.maxHp(st) * r0)); Sound.sfx('levelup');
        if (fresh) { const n = Math.min(8, KD.bossN(st)); for (let i = 0; i < n; i++) yield* KD.pickFlow(KD.offer(k, 'catch'), '新職業：選一張（' + (i + 1) + '/' + n + '）', { sub: '加入「' + KD.CLASSES[k].n + '」的牌組' }); }
        yield* say(st.name + '轉職成了「' + KD.CLASSES[k].n + '」！'); }
      UI.push(ui); Input.consume('a', 'b'); } }
  UI.remove(ui); Input.consume('a', 'b'); };
/* ---------- shops: cards for sale and card removal next to the usual goods ---------- */
KD.shopStock = (st = Game.st) => { const K = KD.state(st), key = st.map + ':' + Math.floor((st.wins || 0) / 15) + ':' + KD.bossN(st) + ':' + KD.clsKey(st); K.shops = K.shops || {};
  let S = K.shops[st.map]; if (!S || S.key !== key) { const cls = KD.clsKey(st), R = () => Math.random(), pickR = () => { const r = R(); return r < 0.55 ? 'C' : r < 0.9 ? 'U' : 'R'; }, ids = [];
    for (let g = 0; ids.length < 5 && g < 80; g++) { const L = Object.keys(KD.CARDS).filter(id => { const C = KD.CARDS[id]; return C.cls === cls && C.rar === pickR() && !C.hidden && !ids.includes(id); }); if (L.length) ids.push(L[Math.floor(R() * L.length)]); }
    for (let g = 0; ids.length < 7 && g < 80; g++) { const L = KD.pool(cls, pickR()).filter(id => KD.CARDS[id].cls === 'nt' && !ids.includes(id)); if (L.length) ids.push(L[Math.floor(R() * L.length)]); }
    S = K.shops[st.map] = { key, ids, sold: [] }; } return S; };
KD.removePrice = (st = Game.st) => Math.round(KD.gW(st.lv || 1) * (4 + (KD.state(st).rem || 0)) / 5) * 5;
KD.cardShop = function* () { const st = Game.st, S = KD.shopStock(st);
  while (true) { const L = S.ids.map((id, i) => ({ id, i })).filter(q => !S.sold.includes(q.i)); if (!L.length) { yield* say('卡都賣完了，下次再來吧。'); return; }
    const r = yield* KD.grid('卡牌（' + st.money + ' G）', L.map(q => ({ id: q.id })), { right: () => '', tag: c => KD.price(KD.CARDS[c.id].rar) + 'G', act: c => '再點一次：' + KD.price(KD.CARDS[c.id].rar) + ' G 買下', rows: 3 });
    if (r < 0) return; const q = L[r], p = KD.price(KD.CARDS[q.id].rar); if (st.money < p) { Sound.sfx('buzz'); yield* say('金幣不夠。'); continue; }
    st.money -= p; S.sold.push(q.i); KD.addCard(st, { id: q.id }); Sound.sfx('item'); yield* say('買下了「' + KD.CARDS[q.id].n + '」！（加入' + KD.clsOf(st).n + '的牌組）'); } };
KD.removeFlow = function* () { const st = Game.st, D = KD.deck(st);
  if (KD.remNo(st, D)) { yield* say(KD.remMsg(st)); return; } const p = KD.removePrice(st);
  const L = KD.sorted(D), r = yield* KD.grid('刪卡（' + p + ' G）', L, { act: () => '再點一次：刪掉這張', hint: '選一張要從牌組刪掉的卡。' }); if (r < 0) return;
  if (st.money < p) { Sound.sfx('buzz'); yield* say('金幣不夠。'); return; } const c = L[r]; if (!(yield* yesNo('花 ' + p + ' G 把「' + KD.name(c) + '」從牌組刪掉嗎？'))) return;
  st.money -= p; D.splice(D.indexOf(c), 1); KD.state(st).rem = (KD.state(st).rem || 0) + 1; Sound.sfx('select'); yield* say('「' + KD.name(c) + '」從牌組裡拿掉了。'); };
{ const _sf = shopFlow; shopFlow = function* (stock, ...a) { if (Game.noV14) return yield* _sf.call(this, stock, ...a);
    while (true) { const r = yield* ask('歡迎光臨！', ['道具', '卡牌', '刪卡（' + KD.removePrice() + ' G）', '離開']);
      if (r === 0) { yield* _sf.call(this, stock, ...a); return; } if (r === 1) yield* KD.cardShop(); else if (r === 2) yield* KD.removeFlow(); else return; } }; }
// the goods: no gear, no MP potions, no fruits / books / resets
{ const _sb = shopBuy; shopBuy = function* (stock, ...a) { if (Game.noV14 || !Array.isArray(stock)) return yield* _sb.call(this, stock, ...a); const L = stock.filter(k => !GEAR[k] && !(ITEMS[k] && ['mp', 'boost', 'tp', 'reset'].includes(ITEMS[k].use))); return yield* _sb.call(this, L, ...a); }; }
/* ---------- the smith: 卡牌工坊 (upgrade a card: gold + 2 materials) ---------- */
// v14.6 each upgrade at the workshop costs a little more than the last (2× the area's wild-fight gold, +0.5× per upgrade so far)
KD.upPrice = (st = Game.st) => Math.round(KD.gW(st.lv || 1) * (2 + 0.5 * ((st.k14 && st.k14.upN) || 0)) / 5) * 5;
KD.mats = (st = Game.st) => Object.keys(st.bag || {}).filter(k => st.bag[k] > 0 && ((typeof MATCAT11 !== 'undefined' && MATCAT11[k]) || (ITEMS[k] && ITEMS[k].use == null && ITEMS[k].price === 0 && !/^(pt_|pr_)/.test(k)))).sort((a, b) => st.bag[b] - st.bag[a]);
KD.workshop = function* () { const st = Game.st;
  while (true) { const D = KD.deck(st), L = KD.sorted(D).filter(KD.canUp), p = KD.upPrice(st), M = KD.mats(st), m = M[0], have = m ? st.bag[m] : 0;
    if (!L.length) { yield* say('牌組裡的卡都升級過了！'); return; }
    const r = yield* KD.grid('卡牌工坊', L, { right: () => p + 'G＋素材2', act: () => '再點一次：升級', detail: c => '升級後：' + KD.desc({ id: c.id, up: 1 }) + (KD.CARDS[c.id].upCost != null ? '（費用 ' + KD.CARDS[c.id].upCost + '）' : ''), hint: '升級 ' + p + ' G＋素材 2 個（越升越貴）' });
    if (r < 0) return; const c = L[r]; if (st.money < p) { Sound.sfx('buzz'); yield* say('金幣不夠（要 ' + p + ' G）。'); continue; } if (!m || have < 2) { Sound.sfx('buzz'); yield* say('素材不夠（要 2 個同樣的素材）。打怪會掉素材。'); continue; }
    if (!(yield* yesNo('花 ' + p + ' G 和 2 個「' + ITEMS[m].n + '」升級「' + KD.CARDS[c.id].n + '」嗎？'))) continue;
    st.money -= p; st.bag[m] -= 2; if (!st.bag[m]) delete st.bag[m]; c.up = 1; st.k14.upN = (st.k14.upN || 0) + 1; Sound.sfx('levelup'); yield* say('「' + KD.CARDS[c.id].n + '」升級成「' + KD.name(c) + '」了！'); } };
{ const _sm = smithMenu; smithMenu = function* (...a) { if (Game.noV14) return yield* _sm.apply(this, a); yield* say('這裡是卡牌工坊。花點金幣和素材，可以把卡升級。'); yield* KD.workshop(); }; }
/* ---------- texts ---------- */
if (typeof GROW12 !== 'undefined') { for (let i = GROW12.length - 1; i >= 0; i--) if (/裝備|天賦|技能|打造|強化|屬性|晶石|賦予|幻化|武器|等級|Lv|經驗|MP|練等|刷寶/.test(GROW12[i][0] + GROW12[i][1])) GROW12.splice(i, 1); GROW12.unshift(['卡牌戰鬥', '每回合 3 能量、抽 5 張。連出好幾張卡後按「結束」，魔物才照頭上的意圖行動。'], ['拿卡', '打怪有機會掉卡（三選一），菁英和頭目一定會掉。商店也能買卡。'], ['刪卡', '商店可以付錢刪掉弱的卡，牌組越精簡，好卡越常抽到。'],
  ['升級', '鐵匠的卡牌工坊：金幣＋素材 2 個，把卡升級（數字變大，有些費用變少）。'], ['頭目', '第一次打倒頭目：最大 HP +5、得到牠的傳說卡。'], ['轉職', '在城鎮的選單「職業」可以轉職，每個職業有自己的牌組。']); }
if (typeof BATTLE_HELP !== 'undefined') { BATTLE_HELP.length = 0; BATTLE_HELP.push(['卡牌戰鬥', ['點一張卡看說明，再點一次出牌（打單體的卡再點要打的魔物）。', '出完牌按「結束」，魔物才行動。格擋到你下一回合開始時消失。', '道具不花能量，每回合可以用 1 次。點「牌庫」、「棄牌」可以看裡面的卡。']],
  ['狀態', ['力量：每段傷害 +1。虛弱：造成的傷害 −25%。易傷：受到的傷害 +50%。', '毒：回合結束失去 HP，然後 −1。燃燒：回合結束失去 HP，不會減少。']]); }
// lines that talk about levels or gear
KD.TXT = [[/（建議\s*Lv\.?\s*\d+(?:\s*[〜~～-]\s*\d+)?\s*(?:以上)?）/g, ''], [/（裝備請找鐵匠打造喔）/g, ''], [/建議等級\s*Lv\.?\s*\d+(?:\s*[〜~～-]\s*\d+)?/g, ''], [/（可換[^）]*點）/g, ''],
  [/技能來自武器的技能樹。/g, '戰鬥用的是卡牌，牌組就是你的力量。'], [/打開選單的「技能樹」用技能點學招式；換一種武器就換一棵樹。戰技・護身・輔佐三棵共通樹，用什麼武器都有效。/g, '打開選單的「牌組」看看你的卡。打怪、商店、任務都能拿到新卡。'],
  [/解鎖了(戰技樹的)?絕技「[^」]*」「[^」]*」[^！]*！/g, '完成了試煉！'], [/學到了?[^。！]*的絕技/g, '完成了試煉'], [/王都有好幾位導師，完成他們的試煉就能學到絕技。/g, '王都有好幾位導師，完成他們的試煉會得到卡牌。']];
KD.fixTxt = s => { if (typeof s !== 'string' || Game.noV14) return s; for (const [re, r] of KD.TXT) s = s.replace(re, r); return s; };
{ const _say = say; say = function* (text, ...a) { return yield* _say.call(this, KD.fixTxt(text), ...a); }; const _ask = ask; ask = function* (text, ...a) { return yield* _ask.call(this, KD.fixTxt(text), ...a); }; }
{ const _ms = BPK.msg; BPK.msg = function* (text, o = {}) { return yield* _ms.call(this, KD.fixTxt(text), o); }; }
// 「推薦Lv」 / 建議等級 lines in the quest log: no levels any more
{ const _qt = questTips; questTips = function (...a) { const T = _qt.apply(this, a); return Game.noV14 ? T : T.filter(t => !/^建議等級/.test(t)); }; }
// the elder: class change instead of the skill-tree reset
{ const _ct = classTalk; classTalk = function* (...a) { const st = Game.st; if (Game.noV14 || !st.cls) return yield* _ct.apply(this, a);
    const r = yield* ask('要做什麼？', ['轉職', '聊天']); if (r !== 0) return false; yield* KD.classScreen(); return true; }; }
// the teachers' trials (詩人公會・鐘錶師・雪峰寺・龍騎士老人・異界人・魔劍士) give a card instead of a 絕技
KD.TEACH = { clsBard: '詩人公會', clsMachinist: '鐘錶師', clsMonk: '雪峰寺', clsDragoon: '龍騎士老人', hiddenCls: '異界人之力', spellbladeOk: '流浪魔劍士' };
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st, f = st && st.flags;
    if (!Game.noV14 && f && st.k14 && !this.script && !UI.stack.length && !Game.trans) { const told = f.zjTold12 || (f.zjTold12 = {}); const k = Object.keys(KD.TEACH).find(q => f[q] && !told[q]);
      if (k) { told[k] = 1; this.run((function* () { Sound.jingle('item'); yield* KD.pickFlow(KD.offer(KD.clsKey(st), 'boss'), '「' + KD.TEACH[k] + '」的試煉：選一張卡', { sub: '加入「' + KD.clsOf(st).n + '」的牌組' }); })()); return; }
      const bad = Object.keys(st.bag || {}).filter(q => ITEMS[q] && ['mp', 'boost', 'tp', 'reset'].includes(ITEMS[q].use) && st.bag[q] > 0);
      if (bad.length) { let g = 0; for (const q of bad) { g += Math.round((ITEMS[q].price || 100) * 0.5) * st.bag[q]; delete st.bag[q]; } st.money += g; this.run((function* () { yield* say('（用不到的道具換成了 ' + g + ' G。）'); })()); return; } }
    return _u.apply(this, a); }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st && st.flags) st.flags.tutMat12 = 1; return st; }; }
KD.slotTag = s => s && s.k14 && KD.CLASSES[s.k14.cls] ? KD.CLASSES[s.k14.cls].n : 'Lv' + ((s && s.lv) || 1);
