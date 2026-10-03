/* ===================== v12.0.8f 第八輪（六）：新支線 5 條・營地的 NPC（玩家在〈第八輪提案〉第二步 K、L 勾「照這樣做」） =====================
   K 每幕一條支線，用洞窟之主和地標串成小故事：霧裡的光・月光洞的歌・不倒的城門・黑羽的舊帳・溫泉的溫度。
   L 營地的 5 個人各有 3 段自己的故事（去一次聊一段），加一個小委託（選單「幫忙」）。 */

Object.assign(ITEMS, {
  glowShroom12: { n: '發光蘑菇', key: 1, cat: '重要物品', price: 0, d: '晨霧洞之主背上的蘑菇，還在發光。早晨放在霧之窪地的中央。' },
  ramHead12: { n: '攻城槌的鐵頭', key: 1, cat: '重要物品', price: 0, d: '地下壕道之主的鐵頭。拿去給老兵杜克。' },
  ledger12: { n: '黑羽的舊帳本', key: 1, cat: '重要物品', price: 0, d: '黑羽盜賊團的帳本。拿去給王都的公會長。' },
});
const SQ12 = (st = Game.st) => st.sq12 || (st.sq12 = {});
const lordDown12 = (cave, st = Game.st) => !!((st.kills || {})[cave + '_lord'] || st.flags[cave + '_lord']);
function* gainSq12(items, gold) { const st = Game.st, P = []; for (const [k, n] of items) { st.bag[k] = (st.bag[k] || 0) + n; P.push(ITEMS[k].n + (n > 1 ? '×' + n : '')); } if (gold) { st.money += gold; P.push(gold + ' G'); } Sound.jingle('item'); yield* itemGet('得到了' + P.join('、') + '！'); }

/* ---------- K: the scenes ---------- */
const SQ_TXT12 = {
  fogStart: ['莫奇：「對了，最近晨霧洞裡的光越來越亮了。」', '莫奇：「光一亮，霧就跟著變濃。再這樣下去，連這條路都要看不見了。」', '莫奇：「聽說洞裡那隻大蟾蜍背上長滿了發光的蘑菇……光大概就是從那裡來的。」', '（支線「霧裡的光」：打倒晨霧洞之主，拿到牠背上的發光蘑菇）'],
  fogGot: '晨霧洞之主背上的蘑菇掉了下來，還在發光。\n得到了「發光蘑菇」！（早晨把它放在霧之窪地的中央吧）',
  fogEnd: ['把發光蘑菇放在窪地的中央——', '蘑菇的光一閃，霧慢慢散開了。', '霧散掉的地方，露出一塊舊石碑。', '「曙光之名，與我同行。——一個從遠方來的旅人」', '……字跡很舊了。初代勇者，也走過這條路嗎？'],
  moonStart: ['湖畔隱士：「……對了。月圓的晚上，湖上會傳來歌聲。」', '湖畔隱士：「我在這裡等了三十年，每次都只聽得到，看不到唱歌的人。」', '湖畔隱士：「你晚上去舊碼頭等等看吧。也許……你看得到。」', '（支線「月光洞的歌」：晚上到銀月湖畔的舊碼頭等）'],
  moonSong: ['湖上傳來了歌聲……', '一隻發著銀光的大水母，從月光洞的方向飄到了湖面上。', '是月光洞之主！牠一邊唱歌，一邊朝這裡飄過來——'],
  moonWin: ['歌聲停了。湖面上只剩下月光。', '（回去告訴湖畔隱士吧）'],
  moonEnd: ['湖畔隱士：「……那首歌，是我妹妹常唱的。」', '湖畔隱士：「三十年前，她坐船出了湖，說要去看海。從那天起，就再也沒回來。」', '湖畔隱士：「每次聽到歌聲，我都以為是她回來了。……現在我知道了。謝謝你。」', '湖畔隱士：「這些你拿去吧。我也該往前走了。」'],
  gateStart: ['老兵杜克：「那份拓本，我又看了好幾遍。」', '杜克：「五百年前，魔王軍拿一根大攻城槌撞曙光軍的城門，撞了三天三夜，城門就是不倒。」', '杜克：「聽說那根攻城槌被亡魂附了身，到現在還在地下壕道裡找那扇門。」', '杜克：「……能讓它安息嗎？把它的鐵頭帶回來給我。」', '（支線「不倒的城門」：打倒地下壕道之主）'],
  gateGot: '攻城槌的鐵頭落在地上，再也不動了。\n得到了「攻城槌的鐵頭」！（拿去給老兵杜克吧）',
  gateEnd: ['杜克：「就是它……」', '杜克：「我把它立在英靈之丘吧。讓那些守門的人看看——它終究沒能撞開那扇門。」', '杜克：「這是我年輕時留著的果實，你拿去吧。」'],
  ledgerGot: ['大熊倒下的地方，掉著一本舊帳本。', '得到了「黑羽的舊帳本」！（拿去給王都的公會長看看吧）'],
  ledgerEnd: ['公會長：「這是黑羽的帳本？……我看看。」', '公會長：「黑色結晶，十箱、二十箱……全都賣給同一個買家。」', '公會長：「買家只留了一個印記——王冠形狀的封蠟。」', '公會長：「……這件事，先別跟任何人說。這是謝禮。」'],
  springStart: ['芙蘿：「最近溫泉熱得不對勁，連手都放不下去。」', '芙蘿：「東邊黑曜石洞裡好像有東西在噴熔岩，把地底的水路都堵住了。」', '（支線「溫泉的溫度」：打倒黑曜石洞之主）'],
  springGot: '黑曜石洞裡的熔岩，順著原本的水路流走了。\n（回溫泉小屋告訴芙蘿吧）',
  springEnd: ['芙蘿：「溫泉恢復了！剛好的溫度！」', '芙蘿：「謝謝你。以後來這裡休息，溫泉隨你泡！」'],
};
// the lords drop what the story needs
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this); const st = Game.st, Q = SQ12(st), id = this.cfg && this.cfg.id;
    if (id === 'cave6_route_lord' && Q.fog === 1) { Q.fog = 2; st.bag.glowShroom12 = 1; Sound.jingle('item'); yield* this.msg(SQ_TXT12.fogGot, { wait: true }); }
    if (id === 'cave6_oldField_lord' && Q.gate === 1) { Q.gate = 2; st.bag.ramHead12 = 1; Sound.jingle('item'); yield* this.msg(SQ_TXT12.gateGot, { wait: true }); }
    if (id === 'cave6_northRoad_lord' && !Q.ledger) { Q.ledger = 1; st.bag.ledger12 = 1; Sound.jingle('item'); for (const t of SQ_TXT12.ledgerGot) yield* this.msg(t, { wait: true }); }
    if (id === 'cave6_emberPass_lord' && Q.spring === 1) { Q.spring = 2; yield* this.msg(SQ_TXT12.springGot, { wait: true }); }
    return r; }; }
// a lord beaten before the story began: what it left is still lying where it stood
const SQ_SPOT12 = {
  cave6_route: { ok: st => SQ12(st).fog === 1 && lordDown12('cave6_route', st), run: function* () { const st = Game.st; SQ12(st).fog = 2; st.bag.glowShroom12 = 1; Sound.jingle('item'); yield* say(SQ_TXT12.fogGot); } },
  cave6_oldField: { ok: st => SQ12(st).gate === 1 && lordDown12('cave6_oldField', st), run: function* () { const st = Game.st; SQ12(st).gate = 2; st.bag.ramHead12 = 1; Sound.jingle('item'); yield* say(SQ_TXT12.gateGot); } },
  cave6_northRoad: { ok: st => !SQ12(st).ledger && lordDown12('cave6_northRoad', st), run: function* () { const st = Game.st; SQ12(st).ledger = 1; st.bag.ledger12 = 1; Sound.jingle('item'); yield* sayAll(SQ_TXT12.ledgerGot); } },
};
const sqSpotAt12 = ow => { const S = SQ_SPOT12[ow.map.id]; if (!S || !S.ok(ow.st)) return null; const e = (MAPS[ow.map.id].elites || [])[0]; if (!e) return null;
  // next to where the lord stood (it may come back there for a rematch)
  if (!ow._sq12 || ow._sq12.m !== ow.map.id) { const c = [[0, 1], [-1, 0], [1, 0], [0, -1], [-1, 1], [1, 1]].map(([dx, dy]) => [e.x + dx, e.y + dy]).find(([x, y]) => !ow.solidAt(x, y) && !(ow.map.d.items || []).some(i => i.x === x && i.y === y)) || [e.x, e.y]; ow._sq12 = { m: ow.map.id, x: c[0], y: c[1] }; }
  return { S, x: ow._sq12.x, y: ow._sq12.y }; };
// places: 霧之窪地 at dawn, 舊碼頭 at night
const SQ_PLACE12 = [
  { map: 'route', lm: 'mist', ok: st => SQ12(st).fog === 2, run: function* (ow) { const st = Game.st;
      if (phase12(st) !== 'dawn') { yield* say('霧之窪地。\n（莫奇說，要在早晨把發光蘑菇放在窪地的中央）'); return; }
      delete st.bag.glowShroom12; SQ12(st).fog = 3; yield* sayAll(SQ_TXT12.fogEnd); yield* gainSq12([['trainBook', 1]], 1500); } },
  { map: 'lake', lm: 'pier', ok: st => SQ12(st).moon === 1, run: function* (ow) { const st = Game.st;
      if (phase12(st) !== 'night') { yield* say('舊碼頭。\n（湖畔隱士說，晚上才聽得到歌聲）'); return; }
      Sound.sfx('charge'); yield* sayAll(SQ_TXT12.moonSong); const L = (MAPS.cave6_lake.elites || [])[0], res = yield* ow.battleScript({ sp: 'moonJelly', lv: L ? L.lv : 20, kind: 'elite', id: 'sq12_moon', noMats: 0 });
      if (res !== 'win') return; SQ12(st).moon = 2; yield* sayAll(SQ_TXT12.moonWin); } },
];
const sqPlaceHere12 = ow => SQ_PLACE12.filter(P => P.map === ow.map.id && P.ok(ow.st)).map(P => { const E = LMEV12.find(q => q.id === P.lm); if (E && !E.spot) ow.lmSpots12(); return E && E.spot ? { P, x: E.spot[0], y: E.spot[1] } : null; }).filter(Boolean);
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const p = this.p, [dx, dy] = DIRS[p.dir], hit = q => q && ((q.x === p.x + dx && q.y === p.y + dy) || (q.x === p.x && q.y === p.y));
    const T = sqSpotAt12(this); if (hit(T)) { this.run(T.S.run()); return true; }
    for (const v of sqPlaceHere12(this)) if (hit(v)) { this.run(v.P.run(this)); return true; }
    return _in.call(this); }; }
function sqDraw12(ow, x) { const L = [sqSpotAt12(ow), ...sqPlaceHere12(ow)].filter(Boolean); for (const v of L) { const [sx, sy, z] = scr12(ow, v.x * 16 + 8, v.y * 16 + 8), k = 0.6 + 0.4 * Math.sin(ow.t / 8);
    x.save(); x.globalCompositeOperation = 'lighter'; const gr = x.createRadialGradient(sx, sy, 0, sx, sy, 10 * z); gr.addColorStop(0, 'rgba(255,220,140,' + (0.7 * k).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,200,100,0)'); x.fillStyle = gr; x.fillRect(sx - 10 * z, sy - 10 * z, 20 * z, 20 * z);
    x.fillStyle = '#fff4c8'; x.fillRect(Math.round(sx - 4 * z), Math.round(sy), Math.round(8 * z), 1); x.fillRect(Math.round(sx), Math.round(sy - 4 * z), 1, Math.round(8 * z)); x.restore(); } }
{ const _wp = owWorldPost; owWorldPost = function (ow, x) { _wp(ow, x); sqDraw12(ow, x); }; }
// people
if (Events.hermit) { const _h = Events.hermit; Events.hermit = function* (ow, ...a) { const st = Game.st, Q = SQ12(st);
    if (!Q.moon) { yield* _h.call(this, ow, ...a); Q.moon = 1; yield* sayAll(SQ_TXT12.moonStart); return; }
    if (Q.moon === 2) { Q.moon = 3; yield* sayAll(SQ_TXT12.moonEnd); yield* gainSq12([['moonDew', 5], ['hiEther', 2]], 0); return; }
    return yield* _h.call(this, ow, ...a); }; }
if (Events.oldDuke) { const _dk = Events.oldDuke; Events.oldDuke = function* (ow, ...a) { const st = Game.st, Q = SQ12(st);
    if (st.flags.lmRub12 === 2 && !Q.gate) { Q.gate = 1; yield* sayAll(SQ_TXT12.gateStart); return; }
    if (Q.gate === 2 && st.bag.ramHead12) { delete st.bag.ramHead12; Q.gate = 3; yield* sayAll(SQ_TXT12.gateEnd); yield* gainSq12([['powerFruit', 1]], 0); return; }
    return yield* _dk.call(this, ow, ...a); }; }
if (Events.guildMaster) { const _gm = Events.guildMaster; Events.guildMaster = function* (ow, ...a) { const st = Game.st, Q = SQ12(st);
    if (Q.ledger === 1 && st.bag.ledger12) { delete st.bag.ledger12; Q.ledger = 2; yield* sayAll(SQ_TXT12.ledgerEnd); yield* gainSq12([['trainBook', 1]], 3000); return; }
    return yield* _gm.call(this, ow, ...a); }; }

/* ---------- L: the camps — three stories each (one a visit), a small request each ---------- */
const CAMP_STORY12 = {
  camp6_moki: ['我啊，在這條路上擺攤擺了十年了。旅人來來去去，只有這堆營火一直在。', '其實我在存錢。想在王都開一間自己的店——有招牌、有屋頂的那種。', '等店開了，你一定要來。第一個客人，我給你打折！'],
  camp6_karl: ['這支商隊，我帶了二十年了。', '團裡的孩子，都是我在路上撿到的。沒爹沒娘的，跟著我走，總比餓死好。', '現在他們都能自己扛貨、自己殺價了。……我這個老頭，也該找個地方停下來了吧。'],
  camp6_gavin: ['這間小屋是我爹蓋的。我跟哥哥小時候，每天都在關道上打獵。', '哥哥射箭比我準多了。後來他去了王都，當上了騎士。', '他好幾年沒回來了。……要是你在王都遇到一個左手有疤的騎士，替我跟他說，弓還幫他留著。'],
  camp6_lottie: ['我是旅行藥師。走到哪，就在哪裡幫人看病。', '最近在找一種只在晚上開的花。聽說能做治失眠的藥。', '金穗平原的村長失眠好久了……要是找得到那種花就好了。'],
  camp6_flora: ['這間溫泉小屋，是我祖母開的。', '你看屋頂——那是用火蜥鱗做的，熔岩噴過來也燒不起來。', '祖母說，溫泉是山的禮物。所以我們只收客人一點點錢，剩下的都要還給山。'],
};
const CAMPQ12 = {
  camp6_moki: { n: '修帳篷', d: '帶木材×3 來修帳篷', need: { wood: 3 }, items: [['superPotion', 2]], gold: 0, talk: '帳篷的柱子被風吹斷了……能幫我帶 3 根木材來嗎？' },
  camp6_karl: { n: '偷貨的砂鉗蠍', d: '打倒 3 隻偷貨的砂鉗蠍', kill: ['sandScorpion', 3], items: [], gold: 2000, talk: '砂鉗蠍晚上會來偷貨……幫我打倒 3 隻吧。' },
  camp6_gavin: { n: '新的弓', d: '帶赤鹿角×2 來做弓', need: { stagHorn: 2 }, items: [['megaPotion', 1]], gold: 0, talk: '我想做一把新弓。能幫我帶 2 支赤鹿角來嗎？' },
  camp6_lottie: { n: '晚上的魔力草', d: '帶晚上採的魔力草×2', need: { glowHerb12: 2 }, items: [['elixir', 1]], gold: 0, talk: '那種只在晚上開的花……說不定跟晚上發光的魔力草有關。能幫我帶 2 株晚上採的魔力草嗎？' },
  camp6_flora: { n: '水管降溫', d: '帶冰晶×2 來讓水管降溫', need: { iceCrystal: 2 }, items: [['megaEther', 1]], gold: 0, talk: '溫泉的水管太燙了……能幫我帶 2 塊冰晶來嗎？' },
};
const campSt12 = (k, st = Game.st) => { const C = st.camp12 || (st.camp12 = {}); return C[k] || (C[k] = { s: 0 }); };
const campProg12 = (k, st = Game.st) => { const Q = CAMPQ12[k], c = campSt12(k, st); if (Q.need) { let cur = 0, max = 0; for (const i in Q.need) { cur += Math.min(Q.need[i], st.bag[i] || 0); max += Q.need[i]; } return { cur, max, ready: cur >= max }; }
  const won = ((st.dex || {})[Q.kill[0]] || {}).won || 0, cur = Math.min(Q.kill[1], won - (c.k0 || 0)); return { cur, max: Q.kill[1], ready: cur >= Q.kill[1] }; };
Game.visit12 = Date.now() % 100000;
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { Game.visit12++; return _ld.apply(this, a); }; }
function* campHelp12(k) { const st = Game.st, Q = CAMPQ12[k], C = CAMP12[k], c = campSt12(k, st);
  if (c.q === 2) { yield* say(C.name + '：「上次真是謝謝你了！」'); return; }
  if (!c.q) { yield* say(C.name + '：「' + Q.talk + '」'); yield* say('報酬：' + Q.items.map(([i, n]) => ITEMS[i].n + (n > 1 ? '×' + n : '')).concat(Q.gold ? [Q.gold + ' G'] : []).join('、'));
    if (!(yield* yesNo('要幫' + C.name + '的忙嗎？'))) return; c.q = 1; if (Q.kill) c.k0 = ((st.dex || {})[Q.kill[0]] || {}).won || 0; Sound.sfx('select'); yield* say('接下了' + C.name + '的請求「' + Q.n + '」！'); return; }
  const p = campProg12(k, st); if (!p.ready) { yield* say(C.name + '：「' + Q.d + '，拜託了。」（' + p.cur + '／' + p.max + '）'); return; }
  if (Q.need) for (const i in Q.need) st.bag[i] -= Q.need[i]; c.q = 2; Sound.sfx('select'); yield* say(C.name + '：「太好了，謝謝你！」'); yield* gainSq12(Q.items, Q.gold); }
for (const k in CAMP12) Events[k] = function* (ow) { const C = CAMP12[k], st = Game.st, Q = SQ12(st), c = campSt12(k, st);
  if (yield* campDeliver12(k)) return;
  yield* say(C.name + '：「' + C.hi + '」');
  // the camp stories that lead into the side quests
  if (k === 'camp6_moki' && !Q.fog) { Q.fog = 1; yield* sayAll(SQ_TXT12.fogStart); }
  if (k === 'camp6_flora' && !Q.spring) { Q.spring = lordDown12('cave6_emberPass', st) ? 2 : 1; yield* sayAll(Q.spring === 2 ? ['芙蘿：「……咦？溫泉好像慢慢變正常了。」', '芙蘿：「黑曜石洞的熔岩，原本把水路堵住了……難道是你把它弄通的？」'] : SQ_TXT12.springStart); }
  if (k === 'camp6_flora' && Q.spring === 2) { Q.spring = 3; yield* sayAll(SQ_TXT12.springEnd); yield* gainSq12([['elixir', 2]], 0); }
  while (true) {
    const r = yield* ask('要做什麼？', ['休息', '買東西', '換東西', '聊天', '幫忙', '離開']);
    if (r === 0) { Game.dnRestMode = 'morning'; yield* healRitual(k === 'camp6_flora' && Q.spring === 3 ? '泡了溫泉，一覺睡到了早上。什麼疲勞都消了！' : '在營火旁休息了一下，一覺睡到了早上。體力完全恢復了！'); }
    else if (r === 1) yield* shopFlow(C.stock.filter(i => ITEMS[i]));
    else if (r === 2) {
      const T = C.trade.filter(t => ITEMS[t[0]] && ITEMS[t[2]]), opts = T.map(t => ITEMS[t[0]].n + '×' + t[1] + ' → ' + ITEMS[t[2]].n + '×' + t[3] + '（有' + (st.bag[t[0]] || 0) + '）').concat(['不換了']);
      const ch = yield* ask('用素材換東西：', opts); if (ch < 0 || ch >= T.length) continue; const t = T[ch];
      if ((st.bag[t[0]] || 0) < t[1]) { yield* say(C.name + '：「' + ITEMS[t[0]].n + '不夠喔。」'); continue; }
      st.bag[t[0]] -= t[1]; st.bag[t[2]] = (st.bag[t[2]] || 0) + t[3]; Sound.jingle('item'); yield* say('換到了' + ITEMS[t[2]].n + '×' + t[3] + '！'); }
    else if (r === 3) { const S = CAMP_STORY12[k];
      if (c.s < S.length && c.v !== Game.visit12) { c.v = Game.visit12; yield* say(C.name + '：「' + S[c.s] + '」'); c.s++; if (c.s === S.length) yield* say('（' + C.name + '的故事聽完了）'); }
      else yield* say(C.name + '：「' + C.tip + '」'); }
    else if (r === 4) yield* campHelp12(k);
    else break; } };
// 洛蒂's request: night mana herbs glow for her too
{ const _dg = doGather; doGather = function (kind, st = Game.st) { const r = _dg(kind, st); const c = (st.camp12 || {}).camp6_lottie;
    if (kind === 'mana' && dnNight12(st) && c && c.q === 1 && !comOn12('c6', st)) { st.bag.glowHerb12 = (st.bag.glowHerb12 || 0) + 1; r.text += '、' + ITEMS.glowHerb12.n + '×1'; }
    return r; }; }

/* ---------- the quest log ---------- */
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const Q = SQ12(st);
    const add = (n, t, done) => L.push({ n, t, done: !!done });
    if (Q.fog) add('霧裡的光', Q.fog >= 3 ? '完成：霧散開了，窪地裡露出一塊舊的旅人石碑。' : Q.fog === 2 ? '早晨把發光蘑菇放在晨霧道路「霧之窪地」的中央。' : '打倒晨霧洞之主（晨霧道路的洞窟），拿到牠背上的發光蘑菇。', Q.fog >= 3);
    if (Q.moon) add('月光洞的歌', Q.moon >= 3 ? '完成：湖畔隱士說出了他在等的人。' : Q.moon === 2 ? '回去告訴銀月湖畔的湖畔隱士。' : '晚上到銀月湖畔的「舊碼頭」等。', Q.moon >= 3);
    if (Q.gate) add('不倒的城門', Q.gate >= 3 ? '完成：攻城槌的鐵頭立在英靈之丘。' : Q.gate === 2 ? '把攻城槌的鐵頭拿去給古戰場的老兵杜克。' : '打倒地下壕道之主（古戰場的洞窟）。', Q.gate >= 3);
    if (Q.ledger) add('黑羽的舊帳', Q.ledger >= 2 ? '完成：帳本上的買家，蓋著王冠形狀的封蠟。' : '把黑羽的舊帳本拿去給王都的公會長。', Q.ledger >= 2);
    if (Q.spring) add('溫泉的溫度', Q.spring >= 3 ? '完成：溫泉恢復了，之後在溫泉小屋休息會泡溫泉。' : Q.spring === 2 ? '回赤焰山道的溫泉小屋告訴芙蘿。' : '打倒黑曜石洞之主（赤焰山道的洞窟）。', Q.spring >= 3);
    for (const k in CAMPQ12) { const c = (st.camp12 || {})[k]; if (!c || !c.q) continue; const Q2 = CAMPQ12[k], p = campProg12(k, st);
      add(CAMP12[k].name + '的請求：' + Q2.n, c.q === 2 ? '完成。' : Q2.d + '（' + p.cur + '／' + p.max + '）' + (p.ready ? '——回去找' + CAMP12[k].name + '吧。' : ''), c.q === 2); } }; }
