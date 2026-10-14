/* ===================== 第一人稱迷宮 試玩原型（只在 window.FP_DEMO 的試玩連結裡開） =====================
   玩家 2026-10-14：副本試玩「不行，想要改成傳統地牢式探索試試」→ 選「第一人稱迷宮」（像《巫術》《世界樹迷宮》），副本試玩刪掉。
   這個原型：
   · 古代地下迷宮 B1F〜B3F，一格一格走：↑ 前進、↓ 後退一步、← → 轉向；A 調查前面（寶箱・泉水・祭壇・頭目）；B 打開整張地圖；START 選單。
   · 畫面是 3D 走廊（石牆、木門、上鎖的門），走路和轉向有平滑的動畫；右上角小地圖會自己畫出走過的地方（指北）。
   · 暗雷遇敵：每走一步危險度上升，左下的寶珠由綠變黃變紅，遇到時一群 1〜3 隻一起打（沿用回合制戰鬥）。
   · B1F：上鎖的門＋鑰匙、寶箱、回復泉。B2F：看得到的強敵「F.O.E.」（狂牙狼）—— 你走一步牠走一步，被碰到就開打；祭壇、寶箱。
     B3F：回復泉、頭目磨石魔像擋在出口前。打倒後走進魔法陣＝通關。
   · 寶箱：隨機品質（藍紫紅金）的武器或防具＋金錢。B1F 的入口樓梯＝回到地面：HP・MP 全滿，列出這趟的收穫。
   · 倒下：回到入口，這趟撿到的金錢少一半。試玩不存檔。 */
const FP27 = { on: () => typeof window !== 'undefined' && !!window.FP_DEMO, VW: 176, VH: 166, FLOORS: {} };
// 地圖：# 牆 . 地板 D 門 K 上鎖的門 < 往上的樓梯 > 往下的樓梯 C 寶箱 k 鑰匙 ~ 泉水 A 祭壇 B 頭目 E 魔法陣（出口）
FP27.FLOORS.fp1 = { n: '古代地下迷宮 B1F', start: [1, 1, 'right'], tex: 0, bg: 'mine', lv: [3, 4], sp: ['slime', 'mush', 'pebble', 'mossBat'], rows: [
  '###############',
  '#<..#.....#..C#',
  '#.#.#.###.#.#.#',
  '#.#...#.....#.#',
  '#.#####.#####.#',
  '#...k.#.#...D.#',
  '###.#.#.#.#.#.#',
  '#...#...#.#...#',
  '#.#####D#.###.#',
  '#.#~....#...#.#',
  '#.#.###.###.#.#',
  '#...#C#.....#.#',
  '#.###K#####.#.#',
  '#.....#>....#.#',
  '###############'] };
FP27.FLOORS.fp2 = { n: '古代地下迷宮 B2F', start: [1, 1, 'down'], tex: 1, bg: 'catacomb', lv: [5, 6], sp: ['caveBat', 'skeleton', 'dewSprite', 'pebble'], rows: [
  '###############',
  '#<..#.......#.#',
  '#.#.#.#####.#.#',
  '#.#...#...#...#',
  '#.#####.#.#####',
  '#.....D.#.....#',
  '#####.#.#####.#',
  '#.....#.....#.#',
  '#.###.#####.#.#',
  '#.#A#.......#.#',
  '#.#.#####.###.#',
  '#.#...k...#...#',
  '#.#########K###',
  '#......>#....C#',
  '###############'],
  foe: { sp: 'wolf', lv: 7, path: (f => f.concat(f.slice(1, -1).reverse()))([[7, 5], [7, 6], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [11, 8], [11, 9], [10, 9], [9, 9], [8, 9], [7, 9], [6, 9], [5, 9]]) } };
FP27.FLOORS.fp3 = { n: '古代地下迷宮 B3F', start: [1, 1, 'right'], tex: 2, bg: 'ruins', lv: [6, 7], sp: ['skeleton', 'caveBat', 'pebble', 'dewSprite'], boss: { sp: 'millGolem', lv: 7 }, rows: [
  '###############',
  '#<....#.....C.#',
  '#.###.#.###.#.#',
  '#...#...#...#.#',
  '###.#####.###.#',
  '#...#.....#...#',
  '#.###.###.#.###',
  '#.....#~#.....#',
  '#####.#.#####.#',
  '#.....#.......#',
  '#.#######.#####',
  '#.#.......#...#',
  '#.#.#####.#.#.#',
  '#...#E.B....#.#',
  '###############'] };
FP27.ORDER = ['fp1', 'fp2', 'fp3'];
if (FP27.on()) for (const id of FP27.ORDER) { const F = FP27.FLOORS[id]; MAPS[id] = { name: F.n, rows: F.rows.map(r => r.replace(/[^#]/g, '.')), fp27: id, battleBg: F.bg, music: id === 'fp3' ? 'crypt' : 'cave', npcs: [], items: [], elites: [], triggers: [] }; }
const FPDIR = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }, FPANG = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }, FPTURN = { right: ['up', 'down'], down: ['right', 'left'], left: ['down', 'up'], up: ['left', 'right'] };
const FPNAME = { up: '北', right: '東', down: '南', left: '西' };
// ---------- 材質（程式畫的像素圖） ----------
const FPT27 = {};
function fpTex27(k) { if (FPT27[k]) return FPT27[k]; const c = mkCanvas(32, 32), x = c.getContext('2d'), R = srand(97 + k.length * 13 + k.charCodeAt(k.length - 1)), r = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  const pal = { w0: ['#5a5560', '#4a4550', '#6a6470', '#2a2630'], w1: ['#4a5a4a', '#3c4a3e', '#5a6c58', '#202a22'], w2: ['#4a5068', '#3c4258', '#5a6280', '#1e2232'] };
  if (k[0] === 'w') { const P = pal[k]; r(0, 0, 32, 32, P[3]);
    for (let row = 0; row < 4; row++) { const off = row % 2 ? 8 : 0; for (let b = -1; b < 3; b++) { const bx = b * 16 + off, by = row * 8, sh = R(); r(bx + 1, by + 1, 14, 6, sh < 0.33 ? P[1] : sh < 0.66 ? P[0] : P[2]); r(bx + 1, by + 1, 14, 1, P[2]);
        for (let i = 0; i < 3; i++) r(bx + 2 + Math.floor(R() * 12), by + 2 + Math.floor(R() * 4), 1, 1, R() < 0.5 ? P[3] : P[2]); } }
    if (k === 'w1') for (let i = 0; i < 14; i++) r(Math.floor(R() * 32), Math.floor(R() * 32), 2, 1, '#5a8a4a'); return (FPT27[k] = c); }
  if (k === 'door' || k === 'lock') { r(0, 0, 32, 32, '#2a1a10'); r(3, 2, 26, 30, '#6a4022'); for (let i = 0; i < 4; i++) { r(4 + i * 6.5, 3, 5, 29, i % 2 ? '#7a4a28' : '#86542c'); r(4 + i * 6.5, 3, 1, 29, '#a06a3a'); }
    r(3, 8, 26, 2, '#3a3a44'); r(3, 22, 26, 2, '#3a3a44'); r(22, 15, 3, 3, '#c8b060');
    if (k === 'lock') { r(12, 12, 8, 7, '#ffd84a'); r(13, 9, 6, 4, '#2a1a10'); r(14, 10, 4, 3, '#ffd84a'); r(15, 14, 2, 3, '#5a4010'); } return (FPT27[k] = c); }
  return c; }
function fpSprite27(k) { if (FPT27['s' + k]) return FPT27['s' + k]; const c = mkCanvas(32, 32), x = c.getContext('2d'), r = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  if (k === 'C' || k === 'c') { r(6, 30, 20, 2, 'rgba(0,0,0,0.35)'); r(5, 18, 22, 12, '#2a1a10'); r(6, 19, 20, 10, '#8a5428'); r(6, 19, 20, 1, '#b07038'); r(5, 23, 22, 1, '#2a1a10'); r(14, 22, 4, 4, '#ffd84a');
    if (k === 'C') { r(5, 13, 22, 6, '#2a1a10'); r(6, 14, 20, 4, '#a86a34'); r(6, 14, 20, 1, '#d08a48'); } else { r(5, 9, 22, 9, '#2a1a10'); r(6, 10, 20, 7, '#5a3418'); r(8, 17, 16, 2, '#fff0a0'); } }
  if (k === '>') { r(2, 22, 28, 10, '#0a0608'); for (let i = 0; i < 4; i++) r(4 + i * 2, 23 + i * 2, 24 - i * 4, 1, '#6a6470'); r(2, 22, 28, 1, '#8a8490'); }
  if (k === '<') { for (let i = 0; i < 6; i++) { r(6 + i, 28 - i * 4, 20 - i * 2, 3, '#7a7480'); r(6 + i, 28 - i * 4, 20 - i * 2, 1, '#a8a2b0'); } r(13, 0, 6, 6, 'rgba(255,240,180,0.5)'); }
  if (k === '~') { r(3, 22, 26, 9, '#3a3a48'); r(5, 23, 22, 6, '#3a8ad8'); r(7, 24, 10, 1, '#a8e0ff'); r(12, 8, 8, 15, 'rgba(160,220,255,0.35)'); r(15, 4, 2, 20, 'rgba(200,240,255,0.6)'); }
  if (k === 'k') { r(11, 8, 9, 9, '#5a4010'); r(13, 10, 5, 5, '#ffd84a'); r(15, 12, 1, 1, '#5a4010'); r(14, 17, 3, 11, '#ffd84a'); r(17, 21, 4, 2, '#ffd84a'); r(17, 25, 3, 2, '#ffd84a'); }
  if (k === 'A') { if (typeof ALTAR_IMG !== 'undefined') { x.imageSmoothingEnabled = false; x.drawImage(ALTAR_IMG, 0, 4, 32, 28); } else r(8, 12, 16, 20, '#8a8070'); }
  if (k === 'E') { x.strokeStyle = '#8ad8ff'; x.lineWidth = 2; x.beginPath(); x.ellipse(16, 27, 14, 4, 0, 0, 7); x.stroke(); x.fillStyle = 'rgba(120,200,255,0.35)'; x.fill(); r(14, 6, 4, 20, 'rgba(160,230,255,0.4)'); }
  return (FPT27['s' + k] = c); }
function fpMon27(sp) { const k = 'm' + sp; if (FPT27[k]) return FPT27[k]; const b = typeof chibiBase === 'function' && chibiBase(sp), M = b && BATTLE_PXC_META[b], im = b && chibiImage(sp); if (!M || !im || !(im.width > 0)) return null;
  const c = mkCanvas(M.w, M.h), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, M.frames.idle[0] * M.w, 0, M.w, M.h, 0, 0, M.w, M.h); return (FPT27[k] = c); }
// ---------- 一趟探索的狀態 ----------
const fpOn27 = ow => ow && ow.map && ow.map.d && ow.map.d.fp27;
function fpRun27(st) { const S = st.fp27 || (st.fp27 = { grid: {}, seen: {}, keys: 0, danger: 0, foe: {}, boss: 0 }); return S; }
function fpGrid27(st, id) { const S = fpRun27(st); return S.grid[id] || (S.grid[id] = FP27.FLOORS[id].rows.map(r => r.split(''))); }
function fpCell27(st, id, x, y) { const G = fpGrid27(st, id); return (G[y] && G[y][x]) || '#'; }
function fpSee27(st, id, x, y) { const S = fpRun27(st), m = S.seen[id] || (S.seen[id] = {}); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m[(x + dx) + ',' + (y + dy)] = 1; }
const fpBlock27 = c => c === '#' || c === 'D' || c === 'K' || c === 'B' || c === 'C' || c === 'c' || c === '~' || c === 'A';
function fpFoe27(st, id) { const F = FP27.FLOORS[id]; if (!F.foe) return null; const S = fpRun27(st), f = S.foe[id] || (S.foe[id] = { i: 0, dead: 0 }); if (f.dead) return null; const [x, y] = F.foe.path[f.i]; return { x, y, f, F: F.foe }; }
// ---------- 開始 ----------
function fpStart27(kind) { Game.st = newGameState('勇者'); const st = Game.st, F = FP27.FLOORS.fp1; st.lv = 4; st.exp = expForLevel(4); st.map = 'fp1'; st.x = F.start[0]; st.y = F.start[1]; st.dir = F.start[2]; st.status = null; st.clock = 300; st.dnHalf9 = 1; st.wx = {};
  Object.assign(st.flags, { woke: 1, license: 1, tutInert11: 1, tutPart11: 1, tutWard12: 1, tutIntent14: 1, tutStd20: 1, tutBreak: 1, tutMulti: 1 }); Game.settings.questHud = false; st.money = 200; st.bag.potion = 3;
  const w = makeGear(BASE11.weapon[kind][0], 2); st.equip.weapon = w.u; const sys = ['法杖', '魔導書', '樂器'].includes(kind) ? '法衣' : ['斧', '長槍'].includes(kind) ? '重甲' : '輕裝';
  for (const sl of ['head', 'body', 'feet']) { const k = BASE11.armor[sys][sl][0]; if (k) st.equip[sl] = makeGear(k, 1).u; }
  if (st.attr && typeof attrAvail === 'function') { const ks = sys === '法衣' ? ['int', 'int', 'vit'] : ['str', 'str', 'vit']; let n = attrAvail(st), i = 0; while (n-- > 0) { const k = ks[i++ % ks.length]; st.attr[k] = (st.attr[k] || 0) + 1; } }
  if (typeof treeNodes11 === 'function') { const T = tr11(st), N = treeNodes11(kind).filter(n => n.t === 'sk' && !n.pre && n.lv <= st.lv); let left = trLeft11(st); for (const n of N.slice(0, 3)) { const v = Math.min(2, left); if (v <= 0) break; T.lv[n.key] = v; left -= v; } st.slots = N.slice(0, 3).map(n => n.key).filter(k => T.lv[k]); }
  st.fp27 = null; const S = fpRun27(st); S.kind = kind; fpTrip27(st); healHero(); startOverworld(); UI.clear(); const ow = Game.scene; ow.script = null;
  ow.run((function* () { yield* wait(16); yield* say('（第一人稱迷宮試玩版）\n古代地下迷宮的入口。\n↑ 前進　↓ 後退　← → 轉向\nA 調查　B 地圖　START 選單'); })()); }
FP27.INTRO = { fp2: '空氣裡有野獸的味道……\n地圖上的紅點是 F.O.E.（很強的魔物）。\n你走一步，牠也走一步。\n可以看地圖繞開，也可以挑戰——打倒牠會掉好東西。', fp3: '最深處傳來石頭摩擦的聲音……\n通往出口的魔法陣，好像被什麼東西擋住了。' };
function fpTrip27(st) { const S = fpRun27(st); S.trip = { gold: st.money, gid: st.gid || 0, lv: st.lv, t: Game.frame, chests: 0 }; }
// ---------- 每一格的更新 ----------
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () { if (!fpOn27(this)) return _up.call(this);
    this.t++; if (this.script) { const r = this.script.next(); if (r.done) this.script = null; return; } if (UI.stack.length) return;
    const st = this.st, id = this.map.id, p = this.p, A = this.fpa || (this.fpa = { t: 0 });
    if (A.mv) { A.mv.t++; if (A.mv.t >= A.mv.n) { const m = A.mv; A.mv = null; if (m.kind === 'step') fpArrive27(this); } return; }
    if (this.fpMap) { if (Input.pressed('b') || Input.pressed('a') || Input.pressed('start')) { Input.consume('a', 'b', 'start'); this.fpMap = 0; } return; }
    if (Input.pressed('start')) { Input.consume('start'); this.run(startMenu()); return; }
    if (Input.pressed('b')) { Input.consume('b'); this.fpMap = 1; Sound.sfx('cursor'); return; }
    if (Input.pressed('a')) { Input.consume('a'); fpInteract27(this); return; }
    const d = Input.dir(); if (!d) return; const face = p.dir;
    if (d === 'left' || d === 'right') { const nd = FPTURN[face][d === 'left' ? 0 : 1]; A.mv = { kind: 'turn', t: 0, n: 7, a0: FPANG[face], a1: FPANG[face] + (d === 'left' ? -Math.PI / 2 : Math.PI / 2), x0: p.x, y0: p.y, x1: p.x, y1: p.y }; p.dir = st.dir = nd; return; }
    const back = d === 'down', [dx, dy] = FPDIR[face], tx = p.x + (back ? -dx : dx), ty = p.y + (back ? -dy : dy), c = fpCell27(st, id, tx, ty);
    if (!back && c === 'D') { fpGrid27(st, id)[ty][tx] = '.'; Sound.sfx('door'); A.mv = { kind: 'wait', t: 0, n: 6, a0: FPANG[face], a1: FPANG[face], x0: p.x, y0: p.y, x1: p.x, y1: p.y }; return; }
    if (!back && c === 'K') { this.run(fpLock27(this, tx, ty)); return; }
    if (fpBlock27(c)) { if (!A.bumpT || this.t - A.bumpT > 12) { Sound.sfx('bump'); A.bumpT = this.t; A.shake = 6; } return; }
    A.mv = { kind: 'step', t: 0, n: 9, a0: FPANG[face], a1: FPANG[face], x0: p.x, y0: p.y, x1: tx, y1: ty }; p.x = tx; p.y = ty; st.x = tx; st.y = ty; }; }
function fpArrive27(ow) { const st = ow.st, id = ow.map.id, p = ow.p, S = fpRun27(st); fpSee27(st, id, p.x, p.y); st.steps = (st.steps || 0) + 1;
  const c = fpCell27(st, id, p.x, p.y);
  if (c === 'k') { fpGrid27(st, id)[p.y][p.x] = '.'; S.keys++; ow.run(itemGet('撿到了鑰匙！')); return; }
  if (c === '>' || c === '<') { ow.run(fpStairs27(ow, c)); return; }
  if (c === 'E') { ow.run(fpClear27(ow)); return; }
  // F.O.E.：你走一步牠走一步
  const fo = fpFoe27(st, id); if (fo) { if (fo.x === p.x && fo.y === p.y) { ow.run(fpFoeFight27(ow)); return; } const P = fo.F.path; fo.f.i = (fo.f.i + 1) % P.length; const [nx, ny] = P[fo.f.i]; if (nx === p.x && ny === p.y) { ow.run(fpFoeFight27(ow)); return; } }
  // 暗雷
  S.danger++; const ch = Math.max(0, Math.min(0.32, (S.danger - 4) * 0.055)); if (Math.random() < ch) { S.danger = 0; ow.run(fpFight27(ow)); } }
function* fpFight27(ow) { const st = ow.st, F = FP27.FLOORS[ow.map.id], pool = F.sp.filter(s => typeof chibiBase === 'function' && chibiBase(s)), n = Math.random() < 0.3 ? 1 : Math.random() < 0.65 ? 2 : 3, lv = () => F.lv[0] + Math.floor(Math.random() * (F.lv[1] - F.lv[0] + 1)), sp = () => pool[Math.floor(Math.random() * pool.length)];
  Sound.sfx('exclaim'); Game.flash = 0.5; Game.flashColor = '#ffffff'; yield* wait(10); const extra = []; for (let i = 1; i < n; i++) extra.push([sp(), lv()]);
  yield* ow.battleScript({ sp: sp(), lv: lv(), kind: 'wild', extra, fp27: 1 }); }
function* fpFoeFight27(ow) { const st = ow.st, fo = fpFoe27(st, ow.map.id); if (!fo) return; Sound.sfx('exclaim'); ow.fpa.shake = 12; yield* say('F.O.E. 撲了過來！'); const res = yield* ow.battleScript({ sp: fo.F.sp, lv: fo.F.lv, kind: 'elite', fp27: 1 }); if (res === 'win') { fo.f.dead = 1; const g = makeGear(fpLootKey27(st), 3), gold = 150; st.money += gold; Sound.jingle('item'); yield* say('打倒了強敵！\n牠守著的東西掉了出來——\n' + gearName(g) + '\n＋ ' + gold + ' G'); } else if (res === 'run') { fo.f.i = (fo.f.i + 4) % fo.F.path.length; } }
function* fpLock27(ow, x, y) { const st = ow.st, S = fpRun27(st); if (!(S.keys > 0)) { Sound.sfx('bump'); yield* say('門被鎖住了。\n這一層的某個地方應該有鑰匙。'); return; } S.keys--; fpGrid27(st, ow.map.id)[y][x] = '.'; Sound.sfx('door'); yield* say('用鑰匙打開了門！'); }
function fpLootKey27(st) { const kd = fpRun27(st).kind || '劍', T = Math.random() < 0.35 ? 1 : 0; if (Math.random() < 0.45) return BASE11.weapon[kd][T]; const sys = pick(['重甲', '輕裝', '法衣']), sl = pick(['head', 'body', 'feet']); return BASE11.armor[sys][sl][T] || BASE11.weapon[kd][T]; }
function fpInteract27(ow) { const st = ow.st, id = ow.map.id, p = ow.p, [dx, dy] = FPDIR[p.dir], tx = p.x + dx, ty = p.y + dy, c = fpCell27(st, id, tx, ty), S = fpRun27(st);
  if (c === 'C') { fpGrid27(st, id)[ty][tx] = 'c'; S.trip.chests++; Sound.sfx('door'); const r = Math.random() * 100, q = id === 'fp1' ? (r < 60 ? 1 : r < 92 ? 2 : 3) : (r < 35 ? 1 : r < 75 ? 2 : r < 95 ? 3 : 4), g = makeGear(fpLootKey27(st), q), gold = 30 + Math.floor(Math.random() * 50) * (FP27.ORDER.indexOf(id) + 1); st.money += gold;
    ow.run(itemGet('打開了寶箱！\n' + gearName(g) + '\n＋ ' + gold + ' G')); return; }
  if (c === 'c') { ow.run(say('空的寶箱。')); return; }
  if (c === '~') { ow.run((function* () { yield* say('清澈的泉水……喝了一口。'); healHero(); Sound.jingle('heal'); yield* say('HP・MP 全部回復了！'); })()); return; }
  if (c === 'A') { ow.run((function* () { const H = heroStats(st), cost = Math.max(1, Math.round(H.hp * 0.2)); if (S.bless) { yield* say('祭壇的光已經熄了。'); return; } if (!(yield* yesNo('古老的祭壇刻著：「獻上血，得到力量。」\n獻上 ' + cost + ' HP，這趟攻擊・魔攻 +15%？'))) return; if (st.hp <= cost) { yield* say('HP 不夠……'); return; } st.hp -= cost; S.bless = 1; Sound.sfx('statUp'); yield* say('祭壇亮起紅光……身體湧出力量！（回到地面前有效）'); })()); return; }
  if (c === 'B') { ow.run((function* () { const F = FP27.FLOORS[id]; yield* say(SPECIES[F.boss.sp].n + '擋住了去路！\n巨大的石臼轟隆隆地轉了起來……'); FP27.bossFight = 1; let res; try { res = yield* ow.battleScript({ sp: F.boss.sp, lv: F.boss.lv, kind: 'elite', fp27: 1, fpBoss: 1 }); } finally { FP27.bossFight = 0; } if (res === 'win') { fpGrid27(st, id)[ty][tx] = '.'; S.boss = 1; Sound.jingle('item'); yield* say('打倒了' + SPECIES[F.boss.sp].n + '！\n後面的魔法陣亮起來了。'); } })()); return; }
  if (c === '#') { ow.run(say('冰冷的石牆。')); return; } ow.run(say('什麼都沒有。')); }
function* fpStairs27(ow, c) { const st = ow.st, id = ow.map.id, i = FP27.ORDER.indexOf(id);
  if (c === '>') { if (!(yield* yesNo('往下的樓梯。要下去 B' + (i + 2) + 'F 嗎？'))) return; yield* fadeOut(16); const nid = FP27.ORDER[i + 1], F = FP27.FLOORS[nid]; ow.load(nid, F.start[0], F.start[1], F.start[2], true); fpSee27(st, nid, F.start[0], F.start[1]); ow.fpa = { t: 0 }; yield* fadeIn(16); const S = fpRun27(st), T = FP27.INTRO[nid]; if (T && !(S.met = S.met || {})[nid]) { S.met[nid] = 1; yield* say(T); } return; }
  if (i > 0) { if (!(yield* yesNo('往上的樓梯。要回到 B' + i + 'F 嗎？'))) return; yield* fadeOut(16); const pid = FP27.ORDER[i - 1], P = FP27.FLOORS[pid], G = fpGrid27(st, pid); let sx = 1, sy = 1; G.forEach((row, y) => row.forEach((ch, x) => { if (ch === '>') { sx = x; sy = y; } }));
    const nb = [[0, -1, 'up'], [1, 0, 'right'], [0, 1, 'down'], [-1, 0, 'left']].find(([dx, dy]) => !fpBlock27(fpCell27(st, pid, sx + dx, sy + dy))); const [ax, ay] = nb ? [sx + nb[0], sy + nb[1]] : [sx, sy]; ow.load(pid, ax, ay, nb ? nb[2] : 'up', true); ow.fpa = { t: 0 }; yield* fadeIn(16); return; }
  if (!(yield* yesNo('通往地面的樓梯。\n要回到地面休息嗎？（HP・MP 全滿，結算這趟的收穫）'))) return; yield* fpSurface27(ow, false); }
function fpSum27(st) { const S = fpRun27(st), T = S.trip, gear = (st.gear || []).filter(g => g.u > T.gid), secs = Math.round((Game.frame - T.t) / 60);
  return ['【這趟的收穫】', '時間 ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '｜Lv' + T.lv + '→Lv' + st.lv, '寶箱 ' + T.chests + ' 個｜金錢 ' + (st.money - T.gold >= 0 ? '+' : '') + (st.money - T.gold) + ' G'].join('\n') + (gear.length ? '\n' + gear.slice(0, 3).map(g => gearName(g)).join('、') + (gear.length > 3 ? '…' : '') : ''); }
function* fpSurface27(ow, dead) { const st = ow.st, S = fpRun27(st), F = FP27.FLOORS.fp1; if (!dead) yield* fadeOut(20);
  if (dead) { const lost = Math.max(0, Math.ceil((st.money - S.trip.gold) / 2)); st.money -= lost; }
  const sum = fpSum27(st); S.bless = 0; S.danger = 0; healHero(); ow.load('fp1', F.start[0], F.start[1], F.start[2], true); ow.fpa = { t: 0 }; yield* fadeIn(20);
  yield* say((dead ? '……醒來時，已經被抬回迷宮入口了。\n（這趟撿到的金錢少了一半）\n' : '回到地面，在營地好好休息了一晚。\n') + 'HP・MP 全滿。'); yield* say(sum); fpTrip27(st); }
function* fpClear27(ow) { const st = ow.st; Sound.jingle('item'); yield* say('踏進魔法陣——光芒包圍了全身！\n古代地下迷宮 B3F 突破！\n（第一人稱迷宮試玩到這裡）');
  yield* say(fpSum27(st)); const r = yield* ask('接下來？', ['回到地面（迷宮保持原樣）', '留在這裡']); if (r === 0) yield* fpSurface27(ow, false); }
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { if (!fpOn27(this)) return yield* _wo.apply(this, a);
    Game.retry13 = null; Sound.stop(); UI.clear(); const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; UI.push(box); Game.fade = 0;
    try { yield* say(this.st.name + '眼前一片漆黑……', { style: 'dark', y: 98 }); } finally { UI.remove(box); } yield* fpSurface27(this, true); }; }
// 迷宮裡的魔物：血量低一點（遇敵比較多）。一般 HP ×0.6；F.O.E. HP ×0.5・攻擊 ×0.85；頭目 HP ×0.45・攻擊 ×0.6
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind, ...a) { const f = _mf(sp, lv, kind, ...a), ow = Game.scene && Game.scene.map ? Game.scene : null, st = Game.st;
    if (st && st.map && MAPS[st.map] && MAPS[st.map].fp27 && f && f.maxhp) { const k = kind === 'wild' ? 0.6 : FP27.bossFight ? 0.45 : 0.5; f.maxhp = Math.max(1, Math.round(f.maxhp * k)); f.hp = f.maxhp; if (f.stats) { if (f.stats.hp) f.stats.hp = f.maxhp; if (kind !== 'wild') for (const q of ['atk', 'spa']) if (f.stats[q]) f.stats[q] = Math.round(f.stats[q] * (FP27.bossFight ? 0.6 : 0.85)); } } return f; }; }
{ const _hs = heroStats; heroStats = function (st, ...a) { const S = _hs(st, ...a), s = st || Game.st; if (s && s.fp27 && s.fp27.bless && S) { S.atk = Math.round(S.atk * 1.15); S.spa = Math.round(S.spa * 1.15); } return S; }; }
// ---------- 畫面：第一人稱 ----------
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { if (!fpOn27(this)) return _dr.call(this, x); fpDraw27(this, x); }; }
function fpCam27(ow) { const p = ow.p, A = ow.fpa || {}, m = A.mv; let cx = p.x + 0.5, cy = p.y + 0.5, a = FPANG[p.dir], bob = 0;
  if (m) { const k = m.t / m.n, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; cx = m.x0 + 0.5 + (m.x1 - m.x0) * e; cy = m.y0 + 0.5 + (m.y1 - m.y0) * e; a = m.a0 + (m.a1 - m.a0) * e; if (m.kind === 'step') bob = Math.sin(k * Math.PI) * 2; }
  return { cx, cy, a, bob }; }
function fpDraw27(ow, x) { const st = ow.st, id = ow.map.id, F = FP27.FLOORS[id], VW = FP27.VW, VH = FP27.VH, A = ow.fpa || (ow.fpa = { t: 0 }); A.t++;
  const cv = ow.fpCv || (ow.fpCv = mkCanvas(VW, VH)), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const { cx, cy, a, bob } = fpCam27(ow), shake = A.shake > 0 ? (A.shake--, (Math.random() - 0.5) * 3) : 0, hz = Math.round(VH / 2 + bob + shake), dirX = Math.cos(a), dirY = Math.sin(a), plX = -dirY * 0.7, plY = dirX * 0.7;
  // 天花板・地板（火把照到的近處比較亮）
  let gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, '#2c2834'); gr.addColorStop(1, '#08070c'); g.fillStyle = gr; g.fillRect(0, 0, VW, hz);
  gr = g.createLinearGradient(0, hz, 0, VH); gr.addColorStop(0, '#0a080a'); gr.addColorStop(1, ['#4a3e34', '#34402e', '#343a4c'][F.tex]); g.fillStyle = gr; g.fillRect(0, hz, VW, VH - hz);
  const zb = new Float32Array(VW), wt = fpTex27('w' + F.tex);
  for (let col = 0; col < VW; col++) { const camX = 2 * col / VW - 1, rx = dirX + plX * camX, ry = dirY + plY * camX; let mx = Math.floor(cx), my = Math.floor(cy);
    const ddx = Math.abs(1 / (rx || 1e-9)), ddy = Math.abs(1 / (ry || 1e-9)), sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1; let sdx = rx < 0 ? (cx - mx) * ddx : (mx + 1 - cx) * ddx, sdy = ry < 0 ? (cy - my) * ddy : (my + 1 - cy) * ddy, side = 0, c = '#', n = 0;
    while (n++ < 40) { if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; } c = fpCell27(st, id, mx, my); if (c === '#' || c === 'D' || c === 'K') break; }
    const dist = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy); zb[col] = dist; const lh = VH / dist; let wx = side === 0 ? cy + dist * ry : cx + dist * rx; wx -= Math.floor(wx);
    const tex = c === 'D' ? fpTex27('door') : c === 'K' ? fpTex27('lock') : wt, tx = Math.min(31, Math.floor(wx * 32)), y0 = hz - lh / 2;
    g.drawImage(tex, tx, 0, 1, 32, col, y0, 1, lh); const dark = Math.min(0.88, dist / 5.5 + (side ? 0.12 : 0)); g.fillStyle = 'rgba(6,4,10,' + dark + ')'; g.fillRect(col, y0, 1, lh); }
  // 物件（寶箱・樓梯・泉水・鑰匙・祭壇・頭目・F.O.E.）
  const sprites = [], G = fpGrid27(st, id); G.forEach((row, yy) => row.forEach((ch, xx) => { if ('CckA~<>EB'.includes(ch)) sprites.push({ x: xx + 0.5, y: yy + 0.5, ch }); }));
  const fo = fpFoe27(st, id); if (fo) sprites.push({ x: fo.x + 0.5, y: fo.y + 0.5, ch: 'F', sp: fo.F.sp });
  const inv = 1 / (plX * dirY - dirX * plY);
  for (const s of sprites) { const rx = s.x - cx, ry = s.y - cy; s.tX = inv * (dirY * rx - dirX * ry); s.tY = inv * (-plY * rx + plX * ry); }
  sprites.sort((p, q) => q.tY - p.tY);
  for (const s of sprites) { if (s.tY < 0.2) continue; let img, scale = 0.62, lift = 0; const mon = s.ch === 'B' ? fpMon27(FP27.FLOORS[id].boss.sp) : s.ch === 'F' ? fpMon27(s.sp) : null;
    if (mon) { img = mon; scale = s.ch === 'B' ? 1.05 : 0.95; } else { img = fpSprite27(s.ch); if (s.ch === 'k') lift = 0.15 + Math.sin(A.t / 10) * 0.04; if (s.ch === '<') scale = 0.9; }
    if (!img) continue; const sxc = (VW / 2) * (1 + s.tX / s.tY), h = Math.abs(VH / s.tY) * scale, w = h * img.width / img.height, bot = hz + (VH / s.tY) / 2 - lift * VH / s.tY, top = bot - h, x0 = Math.round(sxc - w / 2), x1 = Math.round(sxc + w / 2);
    const dark = Math.min(0.85, s.tY / 5.5), sw = Math.max(1, x1 - x0), shh = Math.max(1, Math.round(h)), T = FP27.tmp || (FP27.tmp = mkCanvas(240, 240)), tg = T.getContext('2d'); if (sw > 240 || shh > 240) continue;
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, sw, shh); tg.imageSmoothingEnabled = false; tg.drawImage(img, 0, 0, sw, shh); if (dark > 0.03) { tg.globalCompositeOperation = 'source-atop'; tg.fillStyle = 'rgba(6,4,10,' + dark + ')'; tg.fillRect(0, 0, sw, shh); }
    for (let col = Math.max(0, x0); col < Math.min(VW, x1); col++) { if (s.tY >= zb[col]) continue; g.drawImage(T, col - x0, 0, 1, shh, col, Math.round(top), 1, shh); } }
  // 距離霧（整體稍微壓暗遠處的物件：直接再蓋一層很淡的暗角）
  const vg = g.createRadialGradient(VW / 2, hz, 20, VW / 2, hz, VW * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.imageSmoothingEnabled = false; x.drawImage(cv, 0, 0);
  fpHud27(ow, x, F); if (ow.fpMap) fpBigMap27(ow, x); }
function fpMini27(ow, x, X0, Y0, cs, R, full) { const st = ow.st, id = ow.map.id, S = fpRun27(st), seen = S.seen[id] || {}, p = ow.p, G = fpGrid27(st, id), fo = fpFoe27(st, id);
  const cols = { '#': '#2a2838', '.': '#8a8a9a', D: '#a8743c', K: '#e8c048', '<': '#8ae070', '>': '#ffd060', C: '#ffd84a', c: '#8a7a50', k: '#fff07a', '~': '#60b8ff', A: '#ff8a8a', B: '#ff4a5a', E: '#a8e8ff' };
  const ox = full ? 0 : p.x - R, oy = full ? 0 : p.y - R, nx = full ? G[0].length : 2 * R + 1, ny = full ? G.length : 2 * R + 1;
  for (let yy = 0; yy < ny; yy++) for (let xx = 0; xx < nx; xx++) { const mx = ox + xx, my = oy + yy; if (!seen[mx + ',' + my]) continue; const ch = (G[my] && G[my][mx]) || '#';
    x.fillStyle = cols[ch] || '#8a8a9a'; const X = X0 + xx * cs, Y = Y0 + yy * cs; x.fillRect(X, Y, cs - (ch === '#' ? 0 : 1), cs - (ch === '#' ? 0 : 1)); }
  if (fo && seen[fo.x + ',' + fo.y] && fo.x - ox >= 0 && fo.x - ox < nx && fo.y - oy >= 0 && fo.y - oy < ny) { x.fillStyle = '#ff8a2a'; x.fillRect(X0 + (fo.x - ox) * cs, Y0 + (fo.y - oy) * cs, cs - 1, cs - 1); }
  const px = X0 + (p.x - ox) * cs + cs / 2, py = Y0 + (p.y - oy) * cs + cs / 2, [dx, dy] = FPDIR[p.dir]; x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(px + dx * cs * 0.6, py + dy * cs * 0.6); x.lineTo(px - dy * cs * 0.45 - dx * cs * 0.35, py + dx * cs * 0.45 - dy * cs * 0.35); x.lineTo(px + dy * cs * 0.45 - dx * cs * 0.35, py - dx * cs * 0.45 - dy * cs * 0.35); x.closePath(); x.fill(); }
function fpHud27(ow, x, F) { const st = ow.st, S = fpRun27(st), H = heroStats(st), VH = FP27.VH;
  KB12.panel(x, W - 50, 3, 47, 47, { r: 4 }); x.save(); x.beginPath(); x.rect(W - 48, 5, 43, 43); x.clip(); fpMini27(ow, x, W - 48 + 1, 5 + 1, 5, 4, false); x.restore(); Font.drawC(x, FPNAME[ow.p.dir], W - 26, 49, '#ffe8a0', UIC.textSh, 8);
  x.fillStyle = '#0c0a12'; x.fillRect(0, VH, W, H - VH); KB12.panel(x, 3, VH + 3, W - 6, 40, { r: 5 });
  Font.draw(x, F.n, 9, VH + 4, '#ffe8a0', UIC.textSh, 9); Font.drawR(x, 'Lv' + st.lv + '　' + st.money + ' G', W - 9, VH + 5, '#d8e0f0', UIC.textSh, 8);
  const hr = clamp(st.hp / H.hp, 0, 1); KB12.bar(x, 9, VH + 18, 100, 8, hr, KB12.hpCols(hr), null, Math.ceil(st.hp) + '/' + H.hp); KB12.bar(x, 9, VH + 29, 100, 5, clamp((st.mp || 0) / H.mp, 0, 1), ['#3a6ad8', '#7ab8ff'], null);
  const dg = S.danger, col = dg < 5 ? '#5ad86a' : dg < 9 ? '#ffd84a' : '#ff5a4a', pul = dg >= 9 ? 0.5 + 0.5 * Math.sin(ow.t / 4) : 1; x.save(); x.globalAlpha = 0.5 + 0.5 * pul; x.fillStyle = col; x.beginPath(); x.arc(126, VH + 25, 6, 0, 7); x.fill(); x.restore(); x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 0.8; x.beginPath(); x.arc(126, VH + 25, 6, 0, 7); x.stroke();
  Font.draw(x, (S.keys ? '鑰匙×' + S.keys + '　' : '') + (S.bless ? '祝福' : ''), 136, VH + 18, '#ffd870', UIC.textSh, 7); Font.draw(x, '危險度', 136, VH + 28, '#a8b0c0', UIC.textSh, 7);
  Font.drawC(x, '↑前進　↓後退　←→轉向　A調查　B地圖', W / 2, VH + 46, '#7880a0', null, 7); }
function fpBigMap27(ow, x) { const id = ow.map.id, rows = FP27.FLOORS[id].rows, n = rows.length, cs = Math.floor(160 / n); x.fillStyle = 'rgba(6,6,14,0.92)'; x.fillRect(0, 0, W, H);
  Font.drawC(x, FP27.FLOORS[id].n + '　地圖', W / 2, 8, '#ffe8a0', UIC.textSh, 9); const X0 = Math.floor((W - cs * n) / 2), Y0 = 28; fpMini27(ow, x, X0 - 0, Y0, cs, 0, true);
  Font.drawC(x, '綠＝往上　黃＝往下　金＝寶箱', W / 2, Y0 + cs * n + 6, '#a8b0c0', null, 7); Font.drawC(x, '藍＝泉水　紅＝頭目　橘＝F.O.E.', W / 2, Y0 + cs * n + 16, '#a8b0c0', null, 7); Font.drawC(x, '（按 A・B 關閉）', W / 2, Y0 + cs * n + 28, '#7880a0', null, 7); }
// ---------- 試玩開場 ----------
if (FP27.on()) { TitleScene.prototype.menu = function* () { const K = Object.keys(BASE11.weapon), r = yield* choose(K.map(k => '用' + k + '開始'), { x: 30, y: 96, w: 116, cancel: true }); if (r < 0) { this.stage = 'press'; return; }
    yield* fadeOut(20); fpStart27(K[r]); fpSee27(Game.st, 'fp1', 1, 1); Game.sys.push(fadeIn(20)); };
  saveGame = function () { return true; }; }
