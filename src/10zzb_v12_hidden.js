/* ===================== v12.0.1 隱藏職業的任務線（玩家：「隱藏職業的解放條件與任務重新設計」→ 選了「各自一條任務線」） =====================
   Before: 異界勇者 = find the crystal golem behind the well (rope + an old side quest, no pointer at all); 魔劍士 = three sword
   pages, one of them in the 異界迴廊 that is now closed. Each class now has its own quest with a clear start, a quest-log entry,
   head marks and three steps:
   ・異界勇者「初代勇者的試煉」：打倒古岩魔像後，村長提起初代勇者 → 找到三個「曙光的印記」（萌芽鎮郊外花田・森之深處・風之丘頂，
     都在祕境裡）→ 井底出現發光的踏階，到地下水道深處打倒水晶魔像。
   ・魔劍士「失落的劍譜」：流浪的魔劍士先以 NPC 出現在銀月湖東岸，委託你找回三頁劍譜（湖心小島・蜥人隊長・湖之主）→ 與他決鬥。 */

/* ---------- 異界勇者：初代勇者的試煉 (flags.otwQ: 1 searching the marks, 2 trial open; done = hiddenCls) ---------- */
const OTW_SPOTS = ['town', 'forest', 'windHills'];
const otwMarks = (st = Game.st) => OTW_SPOTS.filter(m => ((st.flags.otwMark || {})[m])).length;
// a free, open tile inside each 祕境 area (away from the path, chest, spring and shrine)
for (const m of OTW_SPOTS) { const d = MAPS[m], E = EXT_AREA[m]; if (!d || !E) continue; const R = d.rows, H = R.length, Wd = R[0].length;
  const busy = new Set([...(d.npcs || []), ...(d.items || []), ...(d.gathers || [])].map(e => e.x + ',' + e.y)); for (const k in d.signs || {}) busy.add(k);
  const inExt = (x, y) => E.side === 'right' ? x >= E.from : y >= E.from, ok = (x, y) => y > 0 && x > 0 && y < H - 1 && x < Wd - 1 && !SOLID.has(R[y][x]) && R[y][x] !== ':' && !busy.has(x + ',' + y);
  let best = null, bs = -1; const cx = E.side === 'right' ? (E.from + Wd) / 2 : Wd / 2, cy = E.side === 'right' ? H / 2 : (E.from + H) / 2;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < Wd - 1; x++) { if (!inExt(x, y) || !ok(x, y)) continue; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].filter(([a, b]) => ok(x + a, y + b)).length;
    if (nb < 8) continue; const sc = 100 - Math.hypot(x - cx, y - cy); if (sc > bs) { bs = sc; best = [x, y]; } }
  if (best) { d.npcs.push({ id: 'otwMark_' + m, x: best[0], y: best[1], dir: 'down', look: 'loreStone', name: '曙光的印記', show: st => st.flags.otwQ === 1 && !(st.flags.otwMark || {})[m] }); NPC_ROLES.任務.push('otwMark_' + m);
    Events['otwMark_' + m] = function* (ow) { const st = Game.st, f = st.flags; (f.otwMark || (f.otwMark = {}))[m] = 1; Sound.sfx('charge'); Game.flashColor = '#fff2c0'; yield* tween(12, t => Game.flash = t * 0.6); yield* tween(16, t => Game.flash = 0.6 * (1 - t));
      yield* sayAll(['石頭上刻著和你手上一樣的太陽紋章……', '曙光之印發出了光。印記回應了你！（初代勇者的印記 ' + otwMarks(st) + '/3）']);
      if (otwMarks(st) >= 3) { f.otwQ = 2; yield* sayAll(['三個印記同時亮了起來。', '……遠處，萌芽鎮的方向，好像有什麼東西在呼喚你。', '（目標：到萌芽鎮的井邊看看。）']); }
      ow.load(ow.map.id, ow.p.x, ow.p.y, ow.p.dir, true); }; }
  else console.warn('otw: no spot in', m);
  if (typeof mapCache !== 'undefined') delete mapCache[m]; }
// the elder starts it once the golem has fallen and nothing else is waiting on him
{ const _se = STORY_MARKS.elder; const otwReady = st => st.flags.license && st.flags.golem && !st.flags.otwQ && !st.flags.hiddenCls;
  STORY_MARKS.elder = st => { const o = _se ? _se(st) : null; return o || (otwReady(st) ? '!' : null); };
  const _el = Events.elder; Events.elder = function* (ow) { const st = Game.st, f = st.flags;
    if (otwReady(st) && !(_se && _se(st))) { f.otwQ = 1;
      yield* sayAll(['……你手上的曙光之印，最近是不是越來越亮了？', '五百年前的初代勇者，也是從異界來的人。', '他在這一帶留下了三個「曙光的印記」。傳說找齊印記的人，才能接受他留下的試煉。',
        '印記好像都藏在地圖邊緣新開的小路後面——鎮外的花田、迷霧森林的深處、風車丘陵的山頂。']);
      yield* say('（任務「初代勇者的試煉」開始了。找到三個曙光的印記。推薦Lv14〜18）'); return; }
    yield* _el.call(this, ow); }; }
// the well: after the three marks, glowing steps lead down even without a rope
{ const _w = Events.well; Events.well = function* (ow) { const st = Game.st, f = st.flags;
    if (f.otwQ === 2 && !f.crystalBoss) { yield* say('井壁上浮現出一階一階發光的踏階，一直通到井底深處……');
      if (yield* yesNo('要沿著踏階下去嗎？')) { Sound.sfx('door'); yield* ow.warp('sewer', 7, 12, 'up'); } return; }
    yield* _w.call(this, ow); }; }
// the crystal golem waits for the trial
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) { _ld.call(this, id, x, y, dir, silent);
    const f = this.st.flags; if (id === 'sewer' && !f.crystalBoss && (f.otwQ || 0) < 2) this.boss = null; }; }
{ const _hb = Events.hiddenBoss; Events.hiddenBoss = function (ow) { const g = _hb.call(this, ow); if (!g) return g; return (function* () { yield* g; if (Game.st.flags.crystalBoss) Game.st.flags.otwQ = 3; })(); }; }
for (const m of OTW_SPOTS) STORY_MARKS['otwMark_' + m] = st => st.flags.otwQ === 1 && !(st.flags.otwMark || {})[m] ? '!' : null;
STORY_MARKS.well = st => st.flags.otwQ === 2 && !st.flags.crystalBoss ? '!' : null;

/* ---------- 魔劍士：失落的劍譜 (流浪的魔劍士 as an NPC until the pages are found) ---------- */
const swordPages = (st = Game.st) => st.bag.swordPage || 0;
{ const E = (MAPS.lake.elites || []).find(e => e.id === 'rogueBlade');
  MAPS.lake.npcs.push({ id: 'rogueNpc', x: E ? E.x : 20, y: E ? E.y : 9, dir: 'left', look: 'traveler', name: '流浪的魔劍士', show: st => !st.flags.spellbladeOk && !st.flags.rogueMet && swordPages(st) < 3 });
  NPC_ROLES.任務.push('rogueNpc'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.rogueNpc = '銀月湖畔・東岸'; delete mapCache.lake; }
// the page that was behind the 異界之門 now rests with the lake's lord (old saves that beat it already get it here)
function* wyrmPage12() { const st = Game.st, f = st.flags; if (!f.wyrm || f.pageWyrm || f.pageRift) return; f.pageWyrm = 1; st.bag.swordPage = swordPages(st) + 1;
  yield* itemGet('湖之主留下的鱗片之間，夾著一張舊紙……是「失落的劍譜」！'); }
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st, f = st && st.flags;
    if (f && this.map && this.map.id === 'lake' && !this.script && !UI.stack.length && !Game.trans && f.wyrm && !f.pageWyrm && !f.pageRift && !f.spellbladeOk) { const ow = this; this.run((function* () { yield* wyrmPage12(); ow.load('lake', ow.p.x, ow.p.y, ow.p.dir, true); })()); return; }
    return _u.apply(this, a); }; }
{ const _wb = Events.wyrmBoss; Events.wyrmBoss = function* (ow) { yield* _wb.call(this, ow); yield* wyrmPage12(); }; }
Events.rogueNpc = function* () { const st = Game.st, f = st.flags; yield* wyrmPage12();
  if (!f.rogueTalk) { f.rogueTalk = 1; f.q5 = 1;
    yield* sayAll(['……你的劍裡，有魔力的流動。', '我是個流浪的劍士。在找三頁失傳的「魔劍之道」劍譜。', '一頁被湖心小島的寶箱收著，一頁被蜥人隊長搶走了，還有一頁……沉進了湖底，被湖之主吞進了肚子裡。',
      '我已經老了，打不贏牠們了。如果你找齊三頁，就帶來給我吧。到時候……讓我看看你的劍。']);
    yield* say('（任務「失落的劍譜」開始了。收集三頁劍譜。）'); return; }
  yield* say(swordPages(st) >= 3 ? '……三頁都找齊了？' : '劍譜找到 ' + swordPages(st) + ' 頁了。湖心小島、蜥人隊長、湖之主……慢慢來吧。'); };
STORY_MARKS.rogueNpc = st => !st.flags.rogueTalk ? '!' : null;
{ const _h = Events.hermit; Events.hermit = function* (ow) { const st = Game.st, f = st.flags; yield* wyrmPage12();
    if (f.q5 && !f.spellbladeOk && swordPages(st) < 3) { yield* say('劍譜找到' + swordPages(st) + '頁了。湖心小島、蜥人隊長、湖之主……那個劍士在湖的東岸等你。'); if (!f.wyrm) yield* say('對了，喚醒湖之主要在祭壇供上月露×3。湖邊發光的「月露草」採得到。'); return; }
    yield* _h.call(this, ow); }; }

/* ---------- quest log ---------- */
Object.assign(QUEST_CATS, { '初代勇者的試煉': '隱藏', '失落的劍譜': '隱藏' });
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const f = st.flags;
    for (let i = L.length - 1; i >= 0; i--) if (L[i].n === '流浪的魔劍士') L.splice(i, 1);
    if (f.otwQ || f.hiddenCls) L.push({ n: '初代勇者的試煉', t: f.hiddenCls ? '完成：通過了初代勇者的試煉，覺醒了「異界勇者」。' : f.otwQ >= 2 ? '三個印記都找到了。從萌芽鎮的井往下，到地下水道深處接受試煉。（推薦Lv16〜18）'
      : '找到三個「曙光的印記」（' + otwMarks(st) + '/3）：萌芽鎮郊外花田（萌芽鎮的南邊）、森之深處（迷霧森林的南邊）、風之丘頂（風車丘陵的東邊）。', done: !!f.hiddenCls, rw: '隱藏職業「異界勇者」' });
    if (f.q5 || f.rogueTalk || f.spellbladeOk) L.push({ n: '失落的劍譜', t: f.spellbladeOk ? '完成：打贏了魔劍士，繼承了魔劍之道。' : swordPages(st) >= 3 ? '三頁劍譜都找齊了。到銀月湖畔的東岸，和流浪的魔劍士決鬥。'
      : '收集三頁「失落的劍譜」（' + swordPages(st) + '/3）：銀月湖畔的湖心小島、蜥人隊長、湖之主（銀鱗水龍）。', done: !!f.spellbladeOk, rw: '隱藏職業「魔劍士」' });
  }; }

/* ===================== 祕境（玩家：「玩家普遍沒有進到秘境」） =====================
   The 15 areas past the map edges (09zu) were only announced once you stepped in, so most players never found them. Now:
   a signpost stands at each opening (on the border, so no path is blocked), the 探索地圖 marks unexplored openings with a blinking
   「?」, and the quest log keeps a 「祕境探索」 entry that names the ones next to places you have been (the quest arrow follows it).
   星見神殿 is closed, so its 星見台 no longer counts (祕境探險家 = all 14). */
const EXT_OPEN = {};
for (const m in EXT_AREA) { if (m === 'starShrine') continue; const E = EXT_AREA[m], d = MAPS[m], R = d.rows.map(r => r.split('')); let o = null;
  if (E.side === 'right') { for (let y = 1; y < R.length - 1; y++) if (R[y][E.from - 1] === ':') { o = [E.from - 1, y]; break; } }
  else { for (let x = 1; x < R[0].length - 1; x++) if (R[E.from - 1][x] === ':') { o = [x, E.from - 1]; break; } }
  if (!o) { console.warn('ext: no opening', m); continue; } EXT_OPEN[m] = o;
  const sg = E.side === 'right' ? [o[0], o[1] - 1] : [o[0] - 1, o[1]];
  if (R[sg[1]] && SOLID.has(R[sg[1]][sg[0]]) && R[sg[1]][sg[0]] !== 'S') { R[sg[1]][sg[0]] = 'S'; d.rows = R.map(r => r.join('')); d.signs = d.signs || {};
    d.signs[sg[0] + ',' + sg[1]] = (E.side === 'right' ? '→ 往東：' : '↓ 往南：') + '祕境「' + E.name + '」\n地圖邊緣新開的小路。裡面有寶箱、採集點和天氣祠。'; }
  if (typeof mapCache !== 'undefined') delete mapCache[m]; }
const extSeen = (m, st = Game.st) => !!((st.extSeen || {})[m]);
{ const A = ACHIEVEMENTS.find(a => a.id === 'extAll'); if (A) { const n = Object.keys(EXT_OPEN).length; A.d = '走遍' + n + '處祕境（地圖邊緣新開的區域）。'; A.ok = st => Object.keys(EXT_OPEN).every(m => extSeen(m, st)); } }
// the explore map: a blinking 「?」 on unexplored openings
{ const _dm = drawMiniMap; drawMiniMap = function (x, id, X0, Y0, maxW, maxH, st) { _dm(x, id, X0, Y0, maxW, maxH, st); const o = EXT_OPEN[id]; if (!o || extSeen(id, st)) return;
    const m = getMap(id), sc = Math.max(1, Math.floor(Math.min(maxW / m.w, maxH / m.h))), ox = X0 + Math.floor((maxW - m.w * sc) / 2), oy = Y0 + Math.floor((maxH - m.h * sc) / 2);
    if (Math.floor(Game.frame / 16) % 2) Font.drawC(x, '?', ox + o[0] * sc + sc / 2, oy + o[1] * sc + sc / 2 - 7, '#8af0ff', UIC.textSh, 10); }; }
// quest log
Object.assign(QUEST_CATS, { '祕境探索': '支線' });
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); if (!st.flags.license) return;
    const K = Object.keys(EXT_OPEN), seen = K.filter(m => extSeen(m, st)), near = K.filter(m => !extSeen(m, st) && st.vis && st.vis[m]);
    const name = m => EXT_AREA[m].name + '（' + MAPS[m].name + (EXT_AREA[m].side === 'right' ? '東邊' : '南邊') + '）';
    L.push({ n: '祕境探索', t: seen.length >= K.length ? '完成：走遍了所有的祕境。' : near.length ? '路口立著告示牌的小路。還沒去過：' + near.slice(0, 2).map(name).join('、') + '。（' + seen.length + '/' + K.length + '）'
      : '其他地圖的邊緣也有祕境。去新的地方看看吧。（' + seen.length + '/' + K.length + '）', done: seen.length >= K.length, rw: '每處：寶箱、採集點、天氣祠' }); }; }
