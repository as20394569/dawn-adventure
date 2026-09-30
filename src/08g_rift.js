/* ===================== v19 異界迴廊 (the Rift): 20 randomised floors behind the 異界之門 =====================
   Unlocked after the golem. Every visit generates new floors (layout, monsters, chests). Floors 5/10/15/20 hold a boss;
   checkpoints at 5/10/15 let you restart deeper. Clearing floors gives 迴廊徽章 to trade with the 迴廊看守人. */
const RIFT_W = 16, RIFT_H = 20, RIFT_TOP = 20;
const TOWER_LOOT = ['riftSword', 'riftStaff', 'riftDagger', 'riftTome', 'riftHelm', 'riftMail', 'riftRobe', 'riftBoots', 'riftRing'];
const TOWER_SHOP = [['elixir', 4], ['hiEther', 3], ['tpBook', 10], ['powerFruit', 8], ['wisdomFruit', 8], ['luckClover', 5], ['riftShard', 2], ['riftRing', 18], ['riftBoots', 18], ['riftHelm', 20]];
const RIFT_BOSS = { 5: ['banditBoss', 'golem'], 10: ['crystalGolem', 'silverWyrm', 'boneKnight'], 15: ['riftKnight', 'rogueBlade', 'lizardChief'], 20: ['gatekeeper'] };
MAPS.rift = { name: '異界迴廊', music: 'ruins', border: 'X', battleBg: 'rift', encAll: 1, popup: 1, rows: Array.from({ length: RIFT_H }, (_, y) => y === 0 || y === RIFT_H - 1 ? 'X'.repeat(RIFT_W) : 'X' + 's'.repeat(RIFT_W - 2) + 'X'), gearPool: TOWER_LOOT, encounters: [{ y0: 0, y1: 99, rate: 0.09, table: [['voidEye', 20, 22, 10], ['riftKnight', 20, 22, 10]] }], items: [], npcs: [], boss: { sp: 'gatekeeper', lv: 40, x: 7, y: 3, flag: 'riftBoss20', ev: 'riftBoss' } };
MAP_TYPES.rift = '迷宮'; MAPS.rift.type = '迷宮';
const riftSt = (st = Game.st) => st.rift || (st.rift = { best: 0, cp: 0, run: 0, floor: 0, tokens: 0 });
function riftLv(fl) { return Math.max(18 + fl, ((Game.st && Game.st.lv) || 1) - 3 + Math.ceil(fl / 2)); } // v25: never far below the hero // New Game+ levels are added in makeFoe
function genRiftFloor(fl) {
  const R = srand((Game.st.rift.run * 97 + fl * 13) | 0), g = [...Array(RIFT_H)].map(() => Array(RIFT_W).fill('X')), boss = fl % 5 === 0;
  const set = (x, y, c) => { if (x > 0 && y > 0 && x < RIFT_W - 1 && y < RIFT_H - 1) g[y][x] = c; };
  let sx = 7, sy = RIFT_H - 2; const start = [sx, sy];
  if (boss) { // arena: a wide hall with the stairs behind the boss
    for (let y = 3; y < RIFT_H - 1; y++) for (let x = 3; x < RIFT_W - 3; x++) set(x, y, (x + y) % 5 ? 's' : 'm');
    for (let y = 1; y < 3; y++) for (let x = 6; x < 10; x++) set(x, y, 'm'); set(7, 1, 'Z');
    for (const [x, y] of [[4, 5], [11, 5], [4, 11], [11, 11], [4, 16], [11, 16]]) set(x, y, 'P');
    return { rows: g.map(r => r.join('')), start, boss: { sp: pick(RIFT_BOSS[fl]), lv: riftLv(fl) + 2, x: 7, y: 3, flag: 'riftBoss' + fl, ev: 'riftBoss' }, items: [] };
  }
  // random walk upward with side wiggles; corridors 2 wide
  let x = sx, y = sy; const path = [];
  while (y > 1) { set(x, y, 's'); set(x + 1, y, 's'); path.push([x, y]); const r = R(); if (r < 0.45) y--; else if (r < 0.72) x = Math.max(1, x - 1); else x = Math.min(RIFT_W - 3, x + 1); }
  // side rooms
  const rooms = []; for (let i = 0; i < 3 + Math.floor(R() * 3); i++) { const [px, py] = path[Math.floor(R() * path.length)], w = 3 + Math.floor(R() * 3), h = 2 + Math.floor(R() * 3), ox = R() < 0.5 ? -w - 1 : 2; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx <= w; xx++) set(px + ox + xx, py - yy, R() < 0.2 ? 'm' : 's'); rooms.push([px + ox + (ox < 0 ? 0 : w), py - h + 1]); }
  // pillars off the main path, safe mossy tiles at the start and the stairs
  for (let i = 0; i < 10; i++) { const X = 1 + Math.floor(R() * (RIFT_W - 2)), Y = 1 + Math.floor(R() * (RIFT_H - 2)); if (g[Y][X] === 's' && !path.some(([a, b]) => (a === X || a + 1 === X) && b === Y)) g[Y][X] = 'P'; }
  const top = path[path.length - 1]; set(top[0], top[1], 'Z'); set(top[0] + 1, top[1], 'm'); set(top[0], top[1] + 1, 'm'); set(top[0] + 1, top[1] + 1, 'm');
  for (let yy = sy - 1; yy <= sy; yy++) for (let xx = sx - 1; xx <= sx + 2; xx++) set(xx, yy, 'm');
  // chests in the side rooms
  const items = []; rooms.slice(0, 1 + Math.floor(R() * 3)).forEach(([X, Y], i) => { if (g[Y] && (g[Y][X] === 's' || g[Y][X] === 'm')) items.push(riftChest(fl, i, X, Y, R)); });
  return { rows: g.map(r => r.join('')), start, items };
}
function riftChest(fl, i, x, y, R) {
  const id = 'rift' + fl + '_' + i, r = R();
  if (r < 0.22) { const u = R(), q = fl >= 18 && u < 0.03 ? 5 : fl >= 14 && u < 0.15 ? 4 : fl >= 14 ? 3 : fl >= 8 && u < 0.35 ? 3 : 2; return { id, x, y, item: TOWER_LOOT[Math.floor(R() * TOWER_LOOT.length)], q }; } // v25: 紫 early, 紅 from 8F, 金 only 14F+
  if (r < 0.46) return { id, x, y, item: 'riftShard', n: 1 + Math.floor(fl / 6) };
  if (r < 0.7) return { id, x, y, item: pick(['superPotion', 'hiEther', 'elixir']), n: 1 };
  return { id, x, y, gold: 300 * fl };
}
function riftEncounters(fl) {
  const pool = Object.keys(SPECIES).filter(k => { const s = SPECIES[k]; return !s.boss && !s.elite && !s.rare && MON_PANEL[k] && MON_PANEL[k].lv >= 8 && !['bandit', 'mineBat', 'oreSlime', 'caravan'].includes(k); });
  const R = srand(Game.st.rift.run * 31 + fl), pickN = []; for (let i = 0; i < 4; i++) pickN.push(pool[Math.floor(R() * pool.length)]);
  const lv = riftLv(fl), table = pickN.map(k => [k, lv - 1, lv + 1, 20]); table.push(['voidEye', lv, lv + 1, 10 + fl * 2], ['riftKnight', lv, lv + 1, 8 + fl * 2]);
  return [{ y0: 0, y1: 99, rate: 0.09, table }];
}
function* riftGoto(ow, fl) {
  const st = Game.st, S = riftSt(st); S.floor = fl; S.best = Math.max(S.best, fl);
  const F = genRiftFloor(fl); Object.assign(MAPS.rift, { rows: F.rows, items: F.items, boss: F.boss || null, encounters: riftEncounters(fl), name: '異界迴廊 ' + fl + 'F' });
  MAPS.rift.npcs = [{ id: 'riftExit', x: F.start[0] + 2, y: F.start[1], dir: 'down', look: 'warden', name: '回歸之光' }];
  delete mapCache.rift; yield* ow.warp('rift', F.start[0], F.start[1], 'up');
  if (fl % 5 === 0) yield* say('第' + fl + '層……空氣很沉重。深處有強大的氣息。');
}
function riftNewRun(st) { const S = riftSt(st); S.run = (S.run || 0) + 1; for (const k in st.flags) if (/^rift\d+_|^riftBoss\d+$/.test(k)) delete st.flags[k]; }
Object.assign(Events, {
  *riftExit(ow) { if (yield* yesNo('要離開異界迴廊，回到古岩遺跡嗎？\n（下次從檢查點重新開始）')) yield* ow.warp('ruins', 7, 2, 'down'); },
  *riftBoss(ow) {
    const st = Game.st, bd = MAPS.rift.boss, fl = riftSt(st).floor; if (!bd || st.flags[bd.flag]) return;
    if (!(yield* askFight(bd.sp, bd.lv + ngOf() * NG_LV, bd.sp, 'boss', '迴廊' + fl + 'F'))) return;
    const res = yield* ow.battleScript({ sp: bd.sp, lv: bd.lv, kind: 'boss', id: bd.sp, rematch: (st.kills || {})[bd.sp] > 0 });
    if (res !== 'win') return; st.flags[bd.flag] = 1; ow.boss = null; const S = riftSt(st); S.cp = Math.max(S.cp, Math.min(15, fl));
    const tok = fl * 2; st.bag.riftToken = (st.bag.riftToken || 0) + tok; yield* itemGet('得到了迴廊徽章×' + tok + '！');
    if (fl === 5 && !st.flags.pageRift) { st.flags.pageRift = 1; st.bag.swordPage = (st.bag.swordPage || 0) + 1; yield* itemGet('在頭目消失的地方，找到了「失落的劍譜」！'); }
    if (fl === RIFT_TOP) { st.flags.riftClear = 1; yield* sayAll(['異界守門者崩塌了，胸口的門扉靜靜地關上。', '門的另一邊，隱約傳來熟悉的聲音……', '（異界迴廊 踏破！ 之後也能繼續挑戰更高的難度。）']); }
    else if (fl % 5 === 0) yield* say('第' + fl + '層的檢查點開放了！下次可以從這裡開始。');
    ow.load('rift', ow.p.x, ow.p.y, ow.p.dir, true);
  },
  *warden(ow) {
    const st = Game.st, S = riftSt(st);
    yield* say('我是迴廊的看守人。異界之門的另一邊，是每次都會改變形狀的「迴廊」。\n最深處是第' + RIFT_TOP + '層。你的最高紀錄：' + (S.best || 0) + '層。');
    while (true) {
      const TS = TOWER_SHOP.filter(([k]) => !(k === 'tpBook' && typeof tpRaw === 'function' && tpRaw(st) >= TP_CAP)); // v9.2.4 talent cap
      const tok = st.bag.riftToken || 0, list = TS.map(([k, c]) => (ITEMS[k] || GEAR[k]).n + '　' + c + '枚');
      const r = yield* ask('要用迴廊徽章交換什麼嗎？（持有' + tok + '枚）', [...list, '不用了']); if (r < 0 || r >= TS.length) return;
      const [k, c] = TS[r]; if (tok < c) { yield* say('徽章不夠喔。'); continue; }
      st.bag.riftToken -= c; if (GEAR[k]) yield* itemGet('換到了' + gainBP(classGear(k), 2, Game.st, 2) + '！'); else { st.bag[k] = (st.bag[k] || 0) + 1; yield* itemGet('換到了' + ITEMS[k].n + '！'); }
    }
  },
});
MAPS.ruins.npcs = MAPS.ruins.npcs || []; MAPS.ruins.npcs.push({ id: 'warden', x: 10, y: 3, dir: 'down', look: 'warden', name: '迴廊看守人', show: st => st.flags.golem });
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () {
    const p = this.p, [dx, dy] = DIRS[p.dir], x = p.x + dx, y = p.y + dy, st = this.st, gt = this.map.d.gate;
    if (this.map.id === 'ruins' && gt && gt.big && (x === gt.x || x === gt.x + 1) && y === gt.y + 1 && st.flags.gateOpen) { this.run(this.riftEntry()); return true; }
    if (this.map.id === 'rift' && this.tileAt(x, y) === 'Z') { this.run(this.riftStairs()); return true; }
    return _in.call(this);
  };
}
Overworld.prototype.riftEntry = function* () {
  const st = Game.st, S = riftSt(st);
  if (!st.flags.riftSeen) { st.flags.riftSeen = 1; yield* sayAll(['異界之門的紋路發出光芒……', '門的另一邊，是一條扭曲的迴廊。每一次踏入，形狀都會改變。', '（異界迴廊：共' + RIFT_TOP + '層，每5層有頭目。越深處的寶物越好。）']); }
  const opts = ['從第1層開始']; const cps = [5, 10, 15].filter(c => S.cp >= c); for (const c of cps) opts.push('從第' + c + '層開始'); opts.push('不進去');
  const r = yield* ask('要進入異界迴廊嗎？', opts); if (r < 0 || r >= opts.length - 1) return;
  riftNewRun(st); yield* riftGoto(this, r === 0 ? 1 : cps[r - 1]);
};
Overworld.prototype.riftStairs = function* () {
  const st = Game.st, S = riftSt(st), fl = S.floor, bd = MAPS.rift.boss;
  if (bd && !st.flags[bd.flag]) { yield* say('強大的氣息擋住了樓梯……先打倒這一層的頭目吧。'); return; }
  if (fl >= RIFT_TOP) { yield* say('這裡就是迴廊的最深處了。'); if (yield* yesNo('要回到古岩遺跡嗎？')) yield* this.warp('ruins', 7, 2, 'down'); return; }
  if (!(yield* yesNo('要前往第' + (fl + 1) + '層嗎？'))) return;
  const tok = 1 + Math.floor(fl / 3); st.bag.riftToken = (st.bag.riftToken || 0) + tok; Sound.sfx('item'); yield* say('踏破第' + fl + '層！得到了迴廊徽章×' + tok + '。');
  yield* riftGoto(this, fl + 1);
};
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const S = st.rift; if (st.flags.riftSeen) L.push({ n: '異界迴廊', t: st.flags.riftClear ? '完成：打倒了第' + RIFT_TOP + '層的異界守門者。（最高紀錄 ' + S.best + '層）' : '穿過異界之門，挑戰每次都會改變的迴廊。最高紀錄：' + ((S && S.best) || 0) + '層。', done: !!st.flags.riftClear, rw: '裂界裝備、迴廊徽章、異界之鑰' }); }; }
