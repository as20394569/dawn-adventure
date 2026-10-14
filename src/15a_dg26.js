/* ===================== 副本式探索 試玩原型（只在 window.DG_DEMO 的試玩連結裡開） =====================
   玩家 2026-10-14：試玩玩家大多 Lv20 左右就不玩了 → 核心玩法重做 → 選「城鎮據點＋副本」「手工迷宮＋隨機內容」
   「血量帶著走＋休息點」「回合制，節奏加快」，然後「先做一個試試」。
   這個原型：
   · 萌芽鎮是據點，廣場多一位冒險者公會的接待員，從她那裡選副本出發（試玩版只有「風車丘陵」，其他寫準備中）。
     試玩版城鎮的出口封住（不走大地圖）。
   · 風車丘陵 3 層：1F 丘陵入口（柵欄裡的上鎖寶箱、鑰匙、一段只能往下跳的崖）、2F 風車小徑（小溪、營火、隨機事件、
     巡邏的菁英）、3F 磨石風車（營火、頭目磨石魔像擋在出口前）。
   · 每次進去不一樣：魔物群的位置・種類・數量，寶箱和鑰匙在哪個候選點、寶箱裡是什麼，2F 的事件（迷路商人／祭壇）。
   · 魔物看得到、一群 1〜3 隻一起打（一場戰鬥），碰到才打，可以繞路；有的會追人。
   · 戰鬥加快：副本裡一般魔物血量 ×0.55、菁英 ×0.75、頭目 ×0.7，菁英・頭目攻擊 ×0.8（磨石魔像跟主線一樣用菁英強度，頭目強度在 Lv7 幾乎打不過）。打完不回血；營火回一半（每個用一次）。
   · 樓梯：往下一層／帶著戰利品回城。倒下：回城，這趟拿到的錢、道具、裝備只帶出一半。
   · 寶箱：隨機品質（藍紫紅金）的武器或防具，上鎖的寶箱比較好；第一次打倒頭目給金色武器和 300 G。
   · 回城時列出這趟的收穫。試玩不存檔。 */
const DG26 = { on: () => typeof window !== 'undefined' && !!window.DG_DEMO, FLOORS: {}, LIST: [] };
// ---------- 地圖小工具 ----------
function dgGrid26(w, h) { const g = []; for (let y = 0; y < h; y++) g.push(Array(w).fill('.')); const o = { g, w, h,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; return o; }, rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.set(x, y, c); return o; },
    box(x0, y0, x1, y1, c) { for (let x = x0; x <= x1; x++) { o.set(x, y0, c); o.set(x, y1, c); } for (let y = y0; y <= y1; y++) { o.set(x0, y, c); o.set(x1, y, c); } return o; },
    rows() { return g.map(r => r.join('')); } };
  o.rect(0, 0, w - 1, 0, 'T').rect(0, h - 1, w - 1, h - 1, 'T').rect(0, 0, 1, h - 1, 'T').rect(w - 2, 0, w - 1, h - 1, 'T'); return o; }
const DG_SP26 = ['hornHare', 'strawCrow', 'curlySheep'];
if (DG26.on()) {
  // 1F 丘陵入口
  { const G = dgGrid26(22, 26); G.rect(2, 1, 19, 1, 'T').set(11, 1, 'v'); for (let y = 2; y <= 24; y++) G.set(11, y, ':');
    G.box(3, 3, 8, 8, 'F').rect(4, 4, 7, 7, ',').set(5, 8, 'g'); // 柵欄＋上鎖的門
    G.rect(14, 4, 18, 6, '#').rect(3, 16, 7, 19, '#').rect(14, 18, 19, 21, '#');
    for (const [x, y] of [[16, 3], [8, 11], [15, 12], [4, 13], [17, 15], [9, 22]]) G.set(x, y, 'o');
    for (const [x, y] of [[13, 9], [17, 9], [6, 21], [2, 10]]) G.rect(x, y, x + 1, y + 1, 'T');
    G.rect(13, 13, 19, 13, 'L'); // 只能往下跳的崖（捷徑）
    for (const [x, y] of [[9, 4], [12, 6], [4, 11], [18, 11], [9, 15], [13, 20], [6, 23], [17, 23]]) G.set(x, y, (x + y) % 2 ? 'f' : 'y');
    DG26.FLOORS.dg_wh1 = { n: '風車丘陵 1F', start: [11, 21], rows: G.rows(), lv: [4, 5], mons: [[6, 14], [16, 7], [15, 17], [8, 20], [12, 10], [4, 10]], nMon: 4,
      chests: [[3, 12], [19, 7], [8, 18], [18, 22]], nChest: 2, locked: [5, 5], keys: [[18, 4], [4, 20], [19, 11]] }; }
  // 2F 風車小徑
  { const G = dgGrid26(22, 28); G.rect(2, 1, 19, 1, 'T').set(11, 1, 'v'); for (let y = 2; y <= 26; y++) G.set(11, y, ':');
    G.rect(2, 12, 19, 13, 'W').set(11, 12, '=').set(11, 13, '='); // 小溪＋橋
    G.box(14, 2, 19, 6, 'F').rect(15, 3, 18, 5, ',').set(16, 6, 'g');
    for (let x = 4; x <= 10; x++) G.set(x, 8, ':'); for (let x = 12; x <= 18; x++) G.set(x, 20, ':');
    G.rect(3, 3, 7, 5, '#').rect(14, 15, 18, 17, '#').rect(3, 22, 7, 24, '#');
    for (const [x, y] of [[8, 3], [13, 9], [5, 17], [17, 24], [9, 25]]) G.set(x, y, 'o');
    for (const [x, y] of [[2, 15], [18, 9], [13, 23], [4, 19]]) G.rect(x, y, x + 1, y + 1, 'T');
    for (const [x, y] of [[6, 10], [16, 10], [8, 16], [15, 22], [5, 26], [18, 19]]) G.set(x, y, (x + y) % 2 ? 'f' : 'y');
    DG26.FLOORS.dg_wh2 = { n: '風車丘陵 2F', start: [11, 23], rows: G.rows(), lv: [5, 6], mons: [[8, 5], [13, 7], [5, 15], [16, 19], [9, 22], [6, 9], [17, 15]], nMon: 5,
      chests: [[3, 9], [19, 8], [6, 24], [16, 25]], nChest: 2, locked: [16, 4], keys: [[3, 3], [4, 23], [19, 21]], camp: [13, 16], events: [[6, 18], [8, 9]], elite: [[5, 6], [16, 22]] }; }
  // 3F 磨石風車（頭目）
  { const G = dgGrid26(22, 24); G.rect(2, 1, 19, 8, 'T'); G.rect(7, 2, 15, 6, ','); G.set(11, 2, 'v'); for (let y = 7; y <= 22; y++) G.set(11, y, ':');
    G.set(10, 7, 'T').set(12, 7, 'T').set(11, 8, ':').set(10, 8, 'T').set(12, 8, 'T');
    G.rect(3, 14, 6, 17, '#').rect(15, 11, 18, 13, '#');
    for (const [x, y] of [[5, 11], [16, 16], [8, 19], [14, 20]]) G.set(x, y, 'o');
    for (const [x, y] of [[7, 10], [9, 13], [16, 18], [5, 21], [18, 21]]) G.set(x, y, (x + y) % 2 ? 'f' : 'y');
    DG26.FLOORS.dg_wh3 = { n: '風車丘陵 3F', start: [11, 19], rows: G.rows(), lv: [6, 7], mons: [[8, 15], [14, 12], [5, 19], [16, 17]], nMon: 3,
      chests: [[3, 10], [18, 19]], nChest: 1, camp: [13, 14], boss: [11, 7, 'millGolem', 7], reward: [11, 4], last: 1 }; }
  for (const id in DG26.FLOORS) { const F = DG26.FLOORS[id]; MAPS[id] = { name: F.n, outdoor: true, border: 'T', rows: F.rows, music: MAPS.windHills && MAPS.windHills.music, battleBg: MAPS.windHills && MAPS.windHills.battleBg, npcs: [], items: [], elites: [], triggers: [], encounters: [{ y0: 0, y1: 999, rate: 0.1, table: DG_SP26.map(s => [s, F.lv[0], F.lv[1], 1]) }], roam12: 1, dg26: id }; }
  DG26.LIST = [{ id: 'windHills', n: '風車丘陵', lv: '5〜8', floors: ['dg_wh1', 'dg_wh2', 'dg_wh3'], boss: '磨石魔像', reward: '【金】武器＋300 G' },
    { n: '翠溪谷', lv: '8〜11', soon: 1 }, { n: '迷霧森林', lv: '11〜14', soon: 1 }, { n: '廢棄礦坑', lv: '13〜17', soon: 1 }, { n: '古代遺跡', lv: '16〜20', soon: 1 }];
  // 冒險者公會的接待員（萌芽鎮廣場）
  MAPS.town.npcs = (MAPS.town.npcs || []).concat([{ id: 'dgGuild26', x: 13, y: 11, dir: 'left', look: 'girl', name: '公會接待員' }]);
}
// ---------- 一趟副本 ----------
const dgRun26 = () => Game.st && Game.st.dg;
function dgPick26(a, n) { const b = a.slice(), o = []; while (o.length < n && b.length) o.push(b.splice(Math.floor(Math.random() * b.length), 1)[0]); return o; }
function dgRollQ26(locked) { const r = Math.random() * 100; return locked ? (r < 55 ? 2 : r < 90 ? 3 : 4) : (r < 55 ? 1 : r < 87 ? 2 : r < 98 ? 3 : 4); }
// 進到某一層：決定這一層的寶箱・鑰匙・事件・魔物
function dgSetupFloor26(fid) { const st = Game.st, R = st.dg, F = DG26.FLOORS[fid], d = MAPS[fid], L = []; R.floor = fid; R.fl = R.fl || {}; const S = R.fl[fid] = R.fl[fid] || { opened: {}, taken: {}, camp: 0 };
  if (!S.made) { S.made = 1; S.chests = dgPick26(F.chests, F.nChest); S.key = F.keys ? dgPick26(F.keys, 1)[0] : null; S.ev = F.events ? (Math.random() < 0.85 ? [dgPick26(F.events, 1)[0], Math.random() < 0.5 ? 'merchant' : 'altar'] : null) : null; }
  S.chests.forEach(([x, y], i) => { const id = 'dgc_' + fid + '_' + i; L.push({ id, x, y, dir: 'down', dgObj: 'chest', get look() { return S.opened[id] ? 'dgChestOpen26' : 'dgChest26'; } }); });
  if (F.locked) { const id = 'dgl_' + fid; L.push({ id, x: F.locked[0], y: F.locked[1], dir: 'down', dgObj: 'chest', locked: 1, get look() { return S.opened[id] ? 'dgChestOpen26' : 'dgChest26'; } }); }
  if (S.key) L.push({ id: 'dgk_' + fid, x: S.key[0], y: S.key[1], dir: 'down', dgObj: 'key', look: 'dgKey26', show: () => !S.taken['dgk_' + fid] });
  if (F.camp) L.push({ id: 'dgf_' + fid, x: F.camp[0], y: F.camp[1], dir: 'down', dgObj: 'camp', look: 'campfire12' });
  if (S.ev) { const [[x, y], k] = S.ev; L.push({ id: 'dge_' + fid, x, y, dir: 'down', dgObj: k, look: k === 'merchant' ? 'traveler' : 'altar', name: k === 'merchant' ? '迷路的商人' : '古老的祭壇', show: () => !S.taken['dge_' + fid] }); }
  if (F.boss) { L.push({ id: 'dgb_' + fid, x: F.boss[0], y: F.boss[1], dir: 'down', dgObj: 'boss', look: 'dgBoss26', name: SPECIES[F.boss[2]].n, show: () => !R.bossDown });
    L.push({ id: 'dgr_' + fid, x: F.reward[0], y: F.reward[1], dir: 'down', dgObj: 'chest', reward: 1, get look() { return S.opened['dgr_' + fid] ? 'dgChestOpen26' : 'dgChest26'; }, show: () => !!R.bossDown }); }
  d.npcs = L; d.triggers = [{ x: F.last ? F.boss[0] : 11, y: F.last ? 2 : 1, id: 'dgExit26' }];
  S.mons = S.mons || null; }
// 魔物群（看得到、一群一起打）
{ const _rs = Overworld.prototype.roamSpawn12; Overworld.prototype.roamSpawn12 = function () { const d = this.map.d; if (!d.dg26 || !dgRun26()) return _rs.call(this);
    const F = DG26.FLOORS[d.dg26], out = [], spots = dgPick26(F.mons, F.nMon);
    for (const [x, y] of spots) { const sp = DG_SP26[Math.floor(Math.random() * DG_SP26.length)], lv = F.lv[0] + Math.floor(Math.random() * (F.lv[1] - F.lv[0] + 1)), n = Math.random() < 0.25 ? 1 : Math.random() < 0.7 ? 2 : 3;
      const extra = []; for (let i = 1; i < n; i++) extra.push([DG_SP26[Math.floor(Math.random() * DG_SP26.length)], lv]); const img = roamImg12(sp); if (!img) continue;
      const e = new Entity({ roam: 1, dgMon: 1, sp, lv, extra, pack: n > 1 ? n : 0, x, y, dir: 'down', img, aggro: Math.random() < 0.45 }); e.home = [x, y, 'down']; e.timer = 20 + Math.floor(Math.random() * 100); out.push(e); }
    if (F.elite && Math.random() < 0.6) { const [x, y] = dgPick26(F.elite, 1)[0], sp = DG_SP26[Math.floor(Math.random() * DG_SP26.length)], img = roamImg12(sp); if (img) { const e = new Entity({ roam: 1, dgMon: 1, elite: 1, sp, lv: F.lv[1] + 1, extra: [], x, y, dir: 'down', img, aggro: true }); e.home = [x, y, 'down']; e.timer = 60; out.push(e); } }
    return out; }; }
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, theyCame) { if (!e.dgMon) return yield* _rf.call(this, e, theyCame);
    const p = this.p; e.chase = 0; p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; this.st.dir = p.dir;
    if (theyCame) { Sound.sfx('exclaim'); p.excl = 24; yield* wait(20); }
    const res = yield* this.battleScript({ sp: e.sp, lv: e.lv, kind: e.elite ? 'elite' : 'wild', extra: e.extra, roam12: 1, dg26: 1 });
    if (res === 'win') this.roamDrop12(e); else if (res === 'run' && this.elites.includes(e)) { e.calmUntil = (this.st.steps || 0) + 20; } }; }
// 菁英巡邏的頭上標「菁英」
{ const _dm = Overworld.prototype.drawMon; Overworld.prototype.drawMon = function (x, e, camX, camY) { _dm.call(this, x, e, camX, camY);
    if (e.dgMon && e.elite) { const cx = Math.round(e.px) - camX + 8, top = Math.round(e.py) - camY + 15 - (e.img ? e.img.c.height : 24); Font.drawC(x, '菁英', cx, top - 12, '#ffb060', '#000000', 7); } }; }
// 副本裡的魔物：血量調低（一般戰 1〜3 回合）
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind, ...a) { const f = _mf(sp, lv, kind, ...a), st = Game.st;
    if (st && st.dg && f && f.maxhp) { const k = kind === 'boss' ? 0.7 : kind === 'elite' ? 0.75 : 0.55; f.maxhp = Math.max(1, Math.round(f.maxhp * k)); f.hp = f.maxhp; if (f.stats && f.stats.hp) f.stats.hp = f.maxhp; if (kind !== 'wild' && f.stats) for (const q of ['atk', 'spa']) if (f.stats[q]) f.stats[q] = Math.round(f.stats[q] * 0.8); } return f; }; }
// 祭壇的祝福：這趟攻擊 +15%
{ const _hs = heroStats; heroStats = function (st, ...a) { const S = _hs(st, ...a), s = st || Game.st; if (s && s.dg && s.dg.bless && S) { S.atk = Math.round(S.atk * 1.15); S.spa = Math.round(S.spa * 1.15); } return S; }; }
// ---------- 畫面：寶箱・鑰匙・頭目・樓梯・上鎖的門 ----------
const DGIMG26 = {};
function dgChestImg26(open) { const k = open ? 'o' : 'c'; if (DGIMG26[k]) return DGIMG26[k]; const c = mkCanvas(16, 22), x = c.getContext('2d'), r = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  r(2, 20, 12, 1, 'rgba(0,0,0,0.3)'); r(2, 12, 12, 8, '#2a1a10'); r(3, 13, 10, 6, '#8a5428'); r(3, 13, 10, 1, '#b07038'); r(2, 15, 12, 1, '#2a1a10'); r(7, 14, 2, 3, '#ffd84a');
  if (open) { r(2, 6, 12, 6, '#2a1a10'); r(3, 7, 10, 4, '#6a3c1c'); r(4, 11, 8, 2, '#fff0a0'); r(5, 9, 1, 1, '#ffffff'); r(10, 8, 1, 1, '#ffffff'); }
  else { r(2, 9, 12, 4, '#2a1a10'); r(3, 10, 10, 2, '#a86a34'); r(3, 10, 10, 1, '#d08a48'); r(7, 11, 2, 2, '#ffd84a'); }
  return (DGIMG26[k] = c); }
function dgKeyImg26() { if (DGIMG26.k) return DGIMG26.k; const c = mkCanvas(16, 22), x = c.getContext('2d'), r = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  r(4, 19, 8, 1, 'rgba(0,0,0,0.3)'); r(5, 8, 5, 5, '#5a4010'); r(6, 9, 3, 3, '#ffd84a'); r(7, 10, 1, 1, '#5a4010'); r(7, 13, 2, 6, '#ffd84a'); r(9, 15, 2, 1, '#ffd84a'); r(9, 17, 2, 1, '#ffd84a'); r(6, 8, 1, 1, '#fffbe0'); return (DGIMG26.k = c); }
{ const _nf = npcFrames; npcFrames = function (look) { const one = c => { const a = [c, c, c, c]; return { down: a, up: a, left: a, right: a }; };
    if (look === 'dgChest26') return one(dgChestImg26(0)); if (look === 'dgChestOpen26') return one(dgChestImg26(1)); if (look === 'dgKey26') return one(dgKeyImg26());
    if (look === 'dgBoss26') { const F = DG26.FLOORS.dg_wh3, im = roamImg12(F.boss[2]), c = mkCanvas(16, 22); if (!im) return one(c); const src = im.c, sc = 1.5, w = Math.round(src.width * sc), h = Math.round(src.height * sc), o = Math.max(h - 22, Math.ceil(w / 2 - 8)) + 2, B = mkCanvas(w + 2 * o, h + o), bx = B.getContext('2d');
      bx.imageSmoothingEnabled = false; bx.fillStyle = 'rgba(0,0,0,0.3)'; bx.beginPath(); bx.ellipse(o + 8, o + 21, w * 0.35, 4, 0, 0, 7); bx.fill(); bx.drawImage(src, o + 8 - w / 2, o + 22 - h, w, h); B.o23 = o; c.ow23 = B; return one(c); }
    return _nf(look); }; }
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) {
    if (c === 'v') { x.drawImage(Tiles.grass(hash2(tx, ty) % 4), sx, sy); x.drawImage(Tiles.stairs, sx, sy); if (this.t % 60 < 30) { x.fillStyle = 'rgba(255,240,160,0.35)'; x.fillRect(sx + 2, sy + 2, 12, 12); } return; }
    if (c === 'g') { x.drawImage(Tiles.grass(hash2(tx, ty) % 4), sx, sy); const R = dgRun26(), open = R && R.fl && R.fl[R.floor] && R.fl[R.floor].gate;
      x.fillStyle = '#4a2c14'; x.fillRect(sx, sy + 2, 3, 14); x.fillRect(sx + 13, sy + 2, 3, 14); if (!open) { x.fillStyle = '#8a5428'; x.fillRect(sx + 3, sy + 4, 10, 3); x.fillRect(sx + 3, sy + 10, 10, 3); x.fillStyle = '#6a3c1c'; x.fillRect(sx + 5, sy + 4, 2, 9); x.fillRect(sx + 9, sy + 4, 2, 9); x.fillStyle = '#ffd84a'; x.fillRect(sx + 7, sy + 7, 2, 3); } return; }
    return _dt.call(this, x, c, tx, ty, sx, sy, f, f2); }; }
{ const _sa = Overworld.prototype.solidAt; Overworld.prototype.solidAt = function (x, y) { if (this.map && this.map.d.dg26 && this.tileAt(x, y) === 'g') { const R = dgRun26(); return !(R && R.fl && R.fl[R.floor] && R.fl[R.floor].gate); } return _sa.call(this, x, y); }; }
// ---------- 互動：寶箱・鑰匙・門・營火・事件・頭目 ----------
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const p = this.p, [dx, dy] = DIRS[p.dir], tx = p.x + dx, ty = p.y + dy, R = dgRun26();
    if (R && this.map.d.dg26) { const ent = this.npcs.find(n => n.x === tx && n.y === ty && n.dgObj); if (ent) { this.run(dgObj26(this, ent)); return true; }
      if (this.tileAt(tx, ty) === 'g') { this.run(dgGate26(this)); return true; } }
    if (this.map.id === 'town') { const g = this.npcs.find(n => n.x === tx && n.y === ty && n.id === 'dgGuild26'); if (g) { g.dir = OPP[p.dir]; this.run(talkAs(g, dgGuild26(this))); return true; } }
    return _in.call(this); }; }
function* dgGate26(ow) { const R = dgRun26(), S = R.fl[R.floor]; if (S.gate) return; if (!(R.keys > 0)) { Sound.sfx('bump'); yield* say('門上掛著一把大鎖。\n這一層的某個地方應該有鑰匙。'); return; }
  R.keys--; S.gate = 1; Sound.sfx('door'); yield* say('用鑰匙打開了門！'); }
function dgGearKey26(R) { const st = Game.st, kd = st.dg.kind, T = Math.random() < 0.35 ? 1 : 0;
  if (Math.random() < 0.45) return BASE11.weapon[kd][T]; const sys = pick(['重甲', '輕裝', '法衣']), sl = pick(['head', 'body', 'feet']); return BASE11.armor[sys][sl][T] || BASE11.weapon[kd][T]; }
function* dgObj26(ow, ent) { const st = ow.st, R = st.dg, S = R.fl[R.floor], k = ent.dgObj;
  if (k === 'chest') { if (S.opened[ent.id]) { yield* say('空的寶箱。'); return; }
    S.opened[ent.id] = 1; ent.frames = npcFrames('dgChestOpen26'); Sound.sfx('door'); R.chests = (R.chests || 0) + 1;
    if (ent.reward) { const first = !(st.dgClear26 || {})[R.id]; const g = makeGear(BASE11.weapon[R.kind][1], first ? 4 : 3); const gold = first ? 300 : 120; st.money += gold;
      yield* itemGet('打開了頭目的寶箱！\n' + gearName(g) + (first ? '（首通獎勵）' : '') + '\n＋ ' + gold + ' G'); return; }
    const q = dgRollQ26(ent.locked), g = makeGear(dgGearKey26(R), q), gold = 20 + Math.floor(Math.random() * 40) * (ent.locked ? 2 : 1); st.money += gold;
    const extra = Math.random() < 0.4 ? 'potion' : null; if (extra) st.bag[extra] = (st.bag[extra] || 0) + 1;
    yield* itemGet((ent.locked ? '打開了上鎖的寶箱！' : '打開了寶箱！') + '\n' + gearName(g) + '\n＋ ' + gold + ' G' + (extra ? '、' + ITEMS[extra].n : '')); return; }
  if (k === 'key') { S.taken[ent.id] = 1; ow.npcs = ow.npcs.filter(n => n !== ent); R.keys = (R.keys || 0) + 1; yield* itemGet('撿到了鑰匙！（這一層有上鎖的門）'); return; }
  if (k === 'camp') { if (S.camp) { yield* say('營火只剩下餘燼了。'); return; } const H = heroStats(st);
    if (!(yield* yesNo('在營火旁休息嗎？\n（HP・MP 回復一半；每個營火只能用一次）'))) return; S.camp = 1; st.hp = Math.min(H.hp, st.hp + Math.ceil(H.hp / 2)); st.mp = Math.min(H.mp, st.mp + Math.ceil(H.mp / 2)); Sound.jingle('heal'); yield* say('火光很溫暖。HP・MP 回復了！'); return; }
  if (k === 'merchant') { Game.talker = ent; try { yield* say('迷路的商人：「哎呀，終於見到人了！要不要買點東西？價錢……嘿嘿，副本裡比較貴喔。」');
      while (true) { const r = yield* choose(['傷藥　80 G', '好傷藥　300 G', '魔力藥水　220 G', '不用了'], { cancel: true }); if (r < 0 || r === 3) break; const [it, pr] = [['potion', 80], ['superPotion', 300], ['manaPotion', 220]][r];
        if (st.money < pr) { yield* say('「錢不夠喔。」'); continue; } st.money -= pr; st.bag[it] = (st.bag[it] || 0) + 1; Sound.sfx('item'); yield* say('買了' + ITEMS[it].n + '。（持有 ' + st.bag[it] + '）'); } } finally { Game.talker = null; } return; }
  if (k === 'altar') { const H = heroStats(st), cost = Math.max(1, Math.round(H.hp * 0.2));
    if (!(yield* yesNo('古老的祭壇刻著：「獻上血，得到力量。」\n獻上 ' + cost + ' HP，這趟攻擊・魔攻 +15%？'))) return; if (st.hp <= cost) { yield* say('現在的 HP 不夠……'); return; }
    st.hp -= cost; R.bless = 1; S.taken[ent.id] = 1; ow.npcs = ow.npcs.filter(n => n !== ent); Sound.sfx('statUp'); yield* say('祭壇亮起紅光……身體湧出力量！（離開副本前有效）'); return; }
  if (k === 'boss') { const F = DG26.FLOORS[R.floor]; Game.talker = ent; try { yield* say('磨石魔像：「……ゴゴゴ……（巨大的石臼轉了起來）」'); } finally { Game.talker = null; }
    const res = yield* ow.battleScript({ sp: F.boss[2], lv: F.boss[3], kind: 'elite', dg26: 1, dgBoss: 1 }); if (res === 'win') { R.bossDown = 1; ow.npcs = ow.npcs.filter(n => n !== ent); const rw = MAPS[R.floor].npcs.find(n => n.reward); if (rw) ow.npcs.push(new Entity({ ...rw, frames: npcFrames(rw.look) })); Sound.jingle('item'); yield* say('磨石魔像倒下了！\n後面出現了寶箱和回城的樓梯。'); } } }
// ---------- 公會・出發・樓梯・回城・倒下 ----------
function* dgGuild26(ow) { const st = ow.st;
  yield* say('公會接待員：「歡迎來到冒險者公會！要去哪個副本呢？」');
  while (true) { const L = DG26.LIST, r = yield* choose(L.map(D => D.n + '　推薦Lv' + D.lv + (D.soon ? '（準備中）' : (st.dgClear26 || {})[D.id] ? '　★' : '')).concat(['不用了']), { cancel: true }); if (r < 0 || r >= L.length) return; const D = L[r];
    if (D.soon) { yield* say('「這個副本還在整理中，下次再來吧！」'); continue; }
    const best = (st.dgBest26 || {})[D.id]; yield* say('【' + D.n + '】 推薦Lv' + D.lv + '\n全 ' + D.floors.length + ' 層｜頭目：' + D.boss + '\n首通獎勵：' + D.reward + ((st.dgClear26 || {})[D.id] ? '（已領）' : '') + (best ? '\n最佳紀錄：寶箱 ' + best.chests + ' 個' : ''));
    yield* say('「副本裡打完仗不會回血，營火可以休息一次。\n每層的樓梯可以選往下或回城；倒下的話，這趟拿到的東西只能帶出一半喔。」');
    if (yield* yesNo('出發嗎？')) { yield* dgEnter26(ow, D); return; } } }
function* dgEnter26(ow, D) { const st = ow.st; st.dg = { id: D.id, kind: dgKind26(st), floors: D.floors, idx: 0, keys: 0, money0: st.money, bag0: { ...st.bag }, gid0: st.gid || 0, lv0: st.lv, t0: Game.frame, chests: 0 };
  yield* fadeOut(20); dgGo26(ow, 0); yield* fadeIn(20); }
function dgKind26(st) { const g = gearBy(st.equip.weapon, st); return (g && GEAR[g.b] && GEAR[g.b].kind && BASE11.weapon[GEAR[g.b].kind]) ? GEAR[g.b].kind : '劍'; }
function dgGo26(ow, i) { const R = Game.st.dg, fid = R.floors[i]; R.idx = i; dgSetupFloor26(fid); const F = DG26.FLOORS[fid]; ow.roam12 = null; ow.load(fid, F.start[0], F.start[1], 'up'); }
Events.dgExit26 = function (ow) { const R = dgRun26(); if (!R) return null; return (function* () { const last = R.idx >= R.floors.length - 1; if (Input.clearAll) Input.clearAll(); yield* wait(6); // 按著方向鍵走上樓梯時，不讓選單的游標跟著跑
    if (last) { if (!R.bossDown) return; yield* say('回城的樓梯在發光。'); yield* dgReturn26(ow, false); return; }
    const r = yield* ask('往下的樓梯。', ['前往 ' + (R.idx + 2) + 'F', '帶著戰利品回城', '再看看']); if (r === 0) { yield* fadeOut(16); dgGo26(ow, R.idx + 1); yield* fadeIn(16); } else if (r === 1) yield* dgReturn26(ow, false); })(); };
function dgSummary26(st, R) { const gear = (st.gear || []).filter(g => g.u > R.gid0), money = st.money - R.money0, items = Object.keys(st.bag).filter(k => (st.bag[k] || 0) > (R.bag0[k] || 0)).map(k => ITEMS[k] ? ITEMS[k].n + '×' + (st.bag[k] - (R.bag0[k] || 0)) : '').filter(Boolean);
  return { gear, money, items }; }
function* dgReturn26(ow, dead) { const st = ow.st, R = st.dg; let lostTxt = '';
  if (dead) { const gear = (st.gear || []).filter(g => g.u > R.gid0 && !Object.values(st.equip || {}).includes(g.u)), lose = dgPick26(gear, Math.ceil(gear.length / 2)); st.gear = st.gear.filter(g => !lose.includes(g));
    const m = st.money - R.money0; if (m > 0) st.money -= Math.ceil(m / 2); for (const k in st.bag) { const d = (st.bag[k] || 0) - (R.bag0[k] || 0); if (d > 0) st.bag[k] -= Math.ceil(d / 2); if (!st.bag[k]) delete st.bag[k]; }
    lostTxt = '\n（倒下了：這趟拿到的東西只帶出一半）'; }
  const won = !dead && R.bossDown, first = won && !(st.dgClear26 || {})[R.id]; if (won) { (st.dgClear26 = st.dgClear26 || {})[R.id] = 1; const b = (st.dgBest26 = st.dgBest26 || {}); if (!b[R.id] || b[R.id].chests < R.chests) b[R.id] = { chests: R.chests }; }
  const sum = dgSummary26(st, R), secs = Math.round((Game.frame - R.t0) / 60); delete st.dg; healHero();
  if (!dead) { yield* fadeOut(20); } ow.roam12 = null; ow.load('town', 12, 12, 'down', true); yield* fadeIn(20);
  const lines = ['【這趟的收穫】' + (won ? (first ? '首次通關！' : '通關！') : dead ? '' : '中途回城'), '時間 ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '｜Lv' + R.lv0 + '→Lv' + st.lv, '寶箱 ' + R.chests + ' 個｜金錢 ' + (sum.money >= 0 ? '+' : '') + sum.money + ' G'];
  if (sum.items.length) lines.push(sum.items.slice(0, 3).join('、'));
  yield* say(lines.join('\n') + lostTxt); if (sum.gear.length) yield* say('裝備：\n' + sum.gear.slice(0, 6).map(g => gearName(g)).join('\n') + (sum.gear.length > 6 ? '\n……共 ' + sum.gear.length + ' 件' : '') + '\n（選單→裝備 可以換上）');
  yield* say('回到了萌芽鎮。HP・MP 已經回滿。'); }
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { const st = this.st; if (!st || !st.dg) return yield* _wo.apply(this, a);
    Game.retry13 = null; Sound.stop(); UI.clear(); const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; UI.push(box); Game.fade = 0;
    try { yield* say(st.name + '眼前一片漆黑……', { style: 'dark', y: 98 }); } finally { UI.remove(box); } yield* dgReturn26(this, true); }; }
// 副本裡：左上角顯示樓層、鑰匙、寶箱
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); const R = dgRun26(); if (!R || !this.map || !this.map.d.dg26 || Game.trans || (this.popup && this.popup.t < 160)) return;
    const S = R.fl && R.fl[R.floor], t = MAPS[R.floor].name + (R.bless ? '・祝福' : ''), t2 = '寶箱 ' + R.chests + (R.keys ? '｜鑰匙 ' + R.keys : '') + (S && S.camp ? '' : DG26.FLOORS[R.floor].camp ? '｜營火' : '');
    const w = Math.max(Font.width(t, 8), Font.width(t2, 7)) + 12; KB12.panel(x, 3, 3, w, 22, { r: 4, rim: '#ffd870', lw: 0.7 }); Font.draw(x, t, 9, 3, '#ffe8a0', UIC.textSh, 8); Font.draw(x, t2, 9, 13, '#d8e0f0', UIC.textSh, 7); }; }
// 城鎮：接待員頭上標「冒險者公會」
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); if (!DG26.on() || !this.map || this.map.id !== 'town' || Game.trans) return; const n = this.npcs.find(q => q.id === 'dgGuild26'); if (!n) return;
    let sx = n.px - this.camX + 8, sy = n.py - this.camY - 14; if (this._zc) { sx = this._zc[0] + (sx - this._zc[0]) * ZOOM_F; sy = this._zc[1] + (sy - this._zc[1]) * ZOOM_F; }
    const t = '冒險者公會', w = Font.width(t, 7) + 8, b = Math.sin(this.t / 12) * 1.5; KB12.panel(x, Math.round(sx - w / 2), Math.round(sy - 12 + b), w, 11, { r: 5, rim: '#ffd870', lw: 0.8 }); Font.drawC(x, t, sx, Math.round(sy - 12 + b), '#ffe8a0', UIC.textSh, 7); }; }
// 試玩版：城鎮的出口封住（從公會出發）
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) { if (DG26.on() && this.map && this.map.id === 'town') { const [dx, dy] = DIRS[d], nx = this.p.x + dx, ny = this.p.y + dy;
      if (ny < 0 || nx >= this.map.w || nx < 0 || ny >= this.map.h) { Sound.sfx('bump'); this.run(say('（試玩版：要出城的話，請到廣場的冒險者公會接待員那裡選副本。）')); return; } }
    return _tm.call(this, d, run); }; }
// ---------- 試玩開場 ----------
function dgLearn26(st, kind) { if (typeof treeNodes11 !== 'function') return; const T = tr11(st), N = treeNodes11(kind).filter(n => (n.t === 'sk' && !n.pre) || n.t === 'mast'), sk = N.filter(n => n.t === 'sk' && n.lv <= st.lv);
  let left = trLeft11(st); for (const n of sk.slice(0, 3)) { const v = Math.min(2, left); if (v <= 0) break; T.lv[n.key] = v; left -= v; } const m = N.find(n => n.t === 'mast'); if (m && left > 0) T.lv[m.key] = Math.min(m.max, left);
  st.slots = sk.slice(0, 3).map(n => n.key).filter(k => T.lv[k]); }
function dgStart26(kind) { Game.st = newGameState('勇者'); const st = Game.st; st.lv = 5; st.exp = expForLevel(5); st.map = 'town'; st.x = 12; st.y = 12; st.dir = 'right'; st.status = null; st.clock = 300; st.dnHalf9 = 1; st.wx = {};
  Object.assign(st.flags, { woke: 1, license: 1, tutInert11: 1, tutPart11: 1, tutWard12: 1, tutIntent14: 1, tutStd20: 1, tutBreak: 1, tutMulti: 1 }); Game.settings.questHud = false; st.money = 300; st.bag.potion = 3;
  const w = makeGear(BASE11.weapon[kind][0], 2); st.equip.weapon = w.u; const sys = ['法杖', '魔導書', '樂器'].includes(kind) ? '法衣' : ['斧', '長槍'].includes(kind) ? '重甲' : '輕裝';
  for (const sl of ['head', 'body', 'feet']) { const k = BASE11.armor[sys][sl][0]; if (k) st.equip[sl] = makeGear(k, 1).u; }
  if (st.attr && typeof attrAvail === 'function') { const ks = sys === '法衣' ? ['int', 'int', 'vit'] : ['str', 'str', 'vit']; let n = attrAvail(st), i = 0; while (n-- > 0) { const k = ks[i++ % ks.length]; st.attr[k] = (st.attr[k] || 0) + 1; } }
  dgLearn26(st, kind); healHero(); startOverworld(); UI.clear(); const ow = Game.scene; ow.script = null;
  ow.run((function* () { yield* wait(20); yield* say('（副本試玩版）\n萌芽鎮是冒險的據點。\n到廣場右邊的冒險者公會接待員那裡，選副本出發吧！'); })()); }
if (DG26.on()) { TitleScene.prototype.menu = function* () {
    const K = Object.keys(BASE11.weapon), r = yield* choose(K.map(k => '用' + k + '開始'), { x: 30, y: 96, w: 116, cancel: true }); if (r < 0) { this.stage = 'press'; return; }
    yield* fadeOut(20); dgStart26(K[r]); Game.sys.push(fadeIn(20)); };
  saveGame = function () { return true; }; }
