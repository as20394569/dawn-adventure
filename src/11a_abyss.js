/* ===================== v12.36 裂界深淵（破關後的主要玩法；玩家 2026-10-06：「追加大量新內容」「做你認為好的遊戲內容與改動」） =====================
   第二章結局（曙光鐘再次響起）之後，古岩遺跡的異界之門重新甦醒，門後是 30 層的「裂界深淵」：
   · 每次進入重新生成地形・寶箱・魔物（同一趟裡同一層的形狀固定，存檔讀檔也一樣）。
   · 魔物等級＝38＋層數×0.4（1F Lv38 → 30F Lv50；頭目再 +2。主角等級上限是 50，所以越深越要靠飾品・果實・強化）。
   · 每 5 層有頭目（第一・二章的頭目、25F 星之守護者、30F 新頭目「裂界之主」），打倒後開放檢查點，旁邊出現回復之光。
   · 每層一種「裂界異象」。
   · 踏破一層得到裂界碎片，頭目層得到星之碎片，寶箱有星塵——三種保留素材拿去找裂界看守人交換（藥・屬性果實・6 件新飾品）。 */
const ABY13 = { top: 30, W: 16, H: 22, map: 'abyss13' };
const abySt = (st = Game.st) => { const S = st.aby13 || (st.aby13 = { best: 0, cp: 0, run: 0, floor: 0, anom: 'calm', fruits: 0, boss: {} }); S.boss = S.boss || {}; return S; };
const abyLv = fl => 38 + Math.round(fl * 0.4);
const abyOpen = (st = Game.st) => !!st && ch2(st) >= 10;
const abyRng = seed => { const R = srand(Math.imul(seed | 0, 2654435761) >>> 0 || 1); R(); R(); R(); return R; }; // xorshift from a small seed starts near 0: mix and burn a few
const isAby = () => !!(Game.st && Game.st.map === ABY13.map);

/* ---------- 裂界異象 ---------- */
const ABY_ANOM13 = { rage: ['狂暴', '魔物的物攻・魔攻 +20%，經驗值 +25%'], shell: ['堅殼', '魔物的物防・魔防 +25%，素材多掉 1 個'], bounty: ['豐收', '寶箱多 1 個，金錢 ×1.5'],
  star: ['星光', '雙方的會心率 +15%'], hush: ['靜寂', '遇敵率減半'], tide: ['魔潮', '技能的 MP −30%'], calm: ['平穩', '沒有異象'] };
const ABY_ANOM_KEYS13 = Object.keys(ABY_ANOM13);
const abyAnom = () => (isAby() ? abySt().anom : null) || null;

/* ---------- 新魔物：裂界種（換色成虛空的紫） ---------- */
const ABY_MON13 = { // key: [name, base, family role, dex]
  abyWolf13: ['虛影狼', 'meadowWolf', 'fast', '裂界深淵裡遊蕩的狼。身體一半是影子，打下去像打在霧上。'],
  abyOoze13: ['裂界軟泥', 'mudSlug', 'tank', '從裂縫裡滲出來的軟泥，裡面閃著細碎的星光。'],
  abyBat13: ['蝕星蝠', 'emberBat', 'fast', '吃星光的蝙蝠。翅膀拍過的地方，光會暗下去一塊。'],
  abyLizard13: ['虛空蜥人', 'wallGecko', 'phys', '在深淵裡迷路太久的蜥人，鱗片已經被虛空染成紫色。'],
  abyStatue13: ['裂界石像', 'obsidianChunk', 'tank', '深淵的牆壁自己長出來的石像，會慢慢地追著入侵者。'],
  abySoul13: ['深淵亡魂', 'bladeGhost', 'mage', '沒能回到原來世界的冒險者的魂。手裡還握著斷掉的劍。'],
};
const ABY_LORD13 = 'riftLord13';
// late wild monsters copy the tuned panel of a 黯滅要塞-era monster with the same role (the raw ch2Panel formula is about twice as strong as the tuned ones)
const LATE_PANEL13 = (role, mul = 1) => { const ref = { phys: 'duskKnight', tank: 'duskKnight', mage: 'shadowMage', fast: 'voidHound' }[role] || 'duskKnight', P = { ...(MON_PANEL[ref] || ch2Panel(36, role, 'wild')) };
  if (role === 'phys') { P.atk = Math.round(P.atk * 1.2); P.def = Math.round(P.def * 0.9); }
  for (const k of ['hp', 'atk', 'def', 'spa', 'spd']) if (P[k]) P[k] = Math.round(P[k] * mul); return P; };
for (const k in ABY_MON13) { const [n, b, role, dex] = ABY_MON13[k], B = SPECIES[b]; if (!B) { bvErr('aby13', 'base ' + b); continue; }
  SPECIES[k] = { ...B, n, elite: 0, boss: 0, rare: 0, exp: Math.round((B.exp || 40) * 1.3), gold: Math.max(2, B.gold || 2), dex, aby13: 1 };
  MON_PANEL[k] = LATE_PANEL13(role, 1.1);
  HD_RIG_OF[k] = chibiOwn(b) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[k] = HD_RIG_OF[k];
  if (ART[b]) ART[k] = artRecolor(ART[b], 0, 1, 1); else if (ART[HD_RIG_OF[k]]) ART[k] = ART[HD_RIG_OF[k]];
  const E = DEF.enemies[b]; defPut('enemies', k, { tags: ['foe', 'fam:' + (B.fam || 'beast')], skills: E ? E.skills.slice() : ['m_tackle'], fam: B.fam, trait: null, profile: E ? E.profile : 'brute', script: null, metadata: { n } }); }
// 裂界之主: the 異界守門者 gone dark and violet
{ const b = 'gatekeeper', B = SPECIES[b];
  SPECIES[ABY_LORD13] = { ...B, n: '裂界之主', boss: 1, elite: 0, exp: 2400, gold: 0, drop: null, aby13: 1, learn: [[1, 'm_gateBeam'], [1, 'm_gateCrush'], [1, 'm_gateJudgment'], [1, 'm_riftCall13']],
    dex: '裂界深淵最深處的守門者。守了太久，自己也變成了裂縫的一部分——牠一開口，深淵裡的東西就會從裂縫爬出來。' };
  { const P = MON_PANEL.shadowGeneral || ch2Panel(40, 'phys', 'boss'); MON_PANEL[ABY_LORD13] = { ...P, hp: Math.round(P.hp * 1.1) }; } // as strong as 影將 at the same level, a little more HP
  HD_RIG_OF[ABY_LORD13] = HD_RIG_OF[b] || b; if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[ABY_LORD13] = HD_RIG_OF[ABY_LORD13];
  if (ART[b]) ART[ABY_LORD13] = artRecolor(ART[b], 60, 1.1, 0.75);
  const E = DEF.enemies[b]; defPut('enemies', ABY_LORD13, { tags: ['foe', 'fam:construct'], skills: (E ? E.skills.filter(s => s !== 'm_dominate') : ['m_gateBeam']).concat(['m_riftCall13']), fam: 'construct', trait: null, profile: E ? E.profile : 'brute', script: null, metadata: { n: '裂界之主' } }); }
// the battle picture: the base chibi pulled toward violet (each keeps a little of its own colour)
const ABY_TINT13 = k => k === ABY_LORD13 ? [276, 0.12, 0.3, 0.8] : [268, 0.2, 0.12, 0.92]; // [hue, how much of its own hue each pixel keeps, saturation added, lightness ×]
{ const _ci = chibiImage; chibiImage = function (k) { if (!ABY_MON13[k] && k !== ABY_LORD13) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k];
    const b = k === ABY_LORD13 ? 'gatekeeper' : ABY_MON13[k][1], src = _ci(b); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const [hue, keep, sAdd, lMul] = ABY_TINT13(k), c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]); let dh = ((h - hue + 540) % 360) - 180;
      const grey = s < 0.12, nh = grey ? hue : hue + dh * keep, ns = grey ? sAdd + s : Math.min(1, s * 0.85 + sAdd), nl = Math.min(1, l * lMul + (k === ABY_LORD13 && l > 0.8 ? 0.1 : 0));
      const [r, g, bb] = hex2rgb(hsl2hex(nh, Math.min(1, ns), nl)); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }

/* ---------- 裂界之主：裂縫（第 2 回合起、場上沒有裂界種時每 4 回合叫一隻；有裂界種在場時受到的傷害 −40%）＋門扉審判（每 4 回合蓄力） ---------- */
MOVES.m_riftCall13 = { n: '裂界召喚', t: '一般', cat: '變', pow: 0, acc: null, pp: 10, fx: 'mbuff', foe: 1, cls: 'buff', d: '撕開裂縫，叫一隻裂界種出來。裂縫開著的時候，自己受到的傷害 −40%。' };
EFFECT_TYPES.riftCall13 = { exec(core, ef, ctx) { const u = ctx.owner, L = Object.keys(ABY_MON13), sp = L[Math.floor(core.rng.next ? core.rng.next() * L.length : Math.random() * L.length)];
    core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: null, text: '裂縫打開了！' + SPECIES[sp].n + '從裂縫裡爬了出來！' } });
    EFFECT_TYPES.summon.exec(core, { sp, count: 1, kind: 'minion', maxSide: 3, lv: Math.max(30, (u.lv || 50) - 8) }, ctx); } };
defPut('skills', 'm_riftCall13', { ...skillFromMove('m_riftCall13', MOVES.m_riftCall13, { kind: 'skill', extraTags: ['monster_skill'] }), override: true, target: 'self', noHitRoll: true, cooldown: 0,
  effects: [effRegister('skill:m_riftCall13#e0', { type: 'riftCall13', target: 'self' })], after: [] });
COND.riftOpen13 = (c, v) => { const u = c.tgt; return !!u && !!c.core && c.core.alive(u.side).some(q => q !== u && q.minion) === !!v; };
defPut('mechanics', 'b12_' + ABY_LORD13, { make: u => ({ mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { hasPower: 1, riftOpen13: 1 } }], triggers: [
  { on: EVT.SUMMON, phase: 'POST', cond: { ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'message', target: 'self', text: '（裂縫開著的時候，裂界之主受到的傷害 −40%！先打倒從裂縫出來的魔物，裂縫就會關上。）' }] }] }) });
B12_SCRIPT[ABY_LORD13] = function (core, u) { const minions = core.alive(u.side).filter(q => q !== u && q.minion).length;
  if (minions < 1 && core.round >= 2 && core.round - (u.data.called ?? -9) >= 4) { u.data.called = core.round; return { type: 'skill', skill: 'm_riftCall13', targets: [u.id] }; }
  if (core.round >= 3 && core.round - (u.data.lastCharge ?? -9) >= 4 && DEF.skills.m_gateJudgment) return b12Charge(core, u, 'm_gateJudgment');
  return b12Pick(core, u, ['m_gateBeam', 'm_gateCrush', 'm_gateBeam']); };
if (typeof BOSS_HP12 !== 'undefined') BOSS_HP12[ABY_LORD13] = 1;
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s || !isAby()) return s;
    const a = abyAnom(); if (a === 'rage') { s.stats.atk = Math.round(s.stats.atk * 1.2); s.stats.spa = Math.round(s.stats.spa * 1.2); }
    if (a === 'shell') { s.stats.def = Math.round(s.stats.def * 1.25); s.stats.spd = Math.round(s.stats.spd * 1.25); }
    if (a === 'star') (s.data.mechanics || (s.data.mechanics = [])).push('aby13_star'); return s; }; }
defPut('mechanics', 'aby13_star', { make: u => ({ mods: [{ stage: 'attacker', who: 'attacker', critAdd: 15 }] }) });
PV('aby13tide', v => ({ mods: [{ costMul: 0.7, res: 'mp' }] }), { n: '魔潮' });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st || !isAby()) return s; const a = abyAnom();
    if (a === 'star') s.data.mechanics.push('aby13_star'); if (a === 'tide') s.passives.push({ key: 'aby13tide', v: 1, src: 'other' }); return s; }; }
// 狂暴: experience +25% · 豐收: gold ×1.5 · 堅殼: one more material
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (amount) { return yield* _ge.call(this, isAby() && abyAnom() === 'rage' ? Math.round(amount * 1.25) : amount); }; }
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const st = Game.st, m0 = st ? st.money : 0, r = yield* _v.call(this); if (!st || !isAby()) return r; const a = abyAnom();
    if (a === 'bounty') { const extra = Math.floor(Math.max(0, st.money - m0) * 0.5); if (extra > 0) { st.money += extra; yield* this.msg('豐收的異象：多得到了' + extra + ' G！', { hold: 24 }); } }
    if (a === 'shell') { const v = this.defeated().find(q => SPECIES[q.sp] && SPECIES[q.sp].mat && ITEMS[SPECIES[q.sp].mat]); if (v) { const m = SPECIES[v.sp].mat; st.bag[m] = (st.bag[m] || 0) + 1; yield* this.msg('堅殼的異象：多得到了' + ITEMS[m].n + '！', { hold: 24 }); } }
    return r; }; }

/* ---------- the floors ---------- */
MAPS[ABY13.map] = { name: '裂界深淵', music: 'rift', border: 'X', battleBg: 'rift', encAll: 1, popup: 1, type: '迷宮', theme: 'abyss13',
  rows: Array.from({ length: ABY13.H }, (_, y) => y === 0 || y === ABY13.H - 1 ? 'X'.repeat(ABY13.W) : 'X' + 's'.repeat(ABY13.W - 2) + 'X'), gearPool: [], encounters: [], items: [], npcs: [] };
if (typeof MAP_TYPES !== 'undefined') MAP_TYPES[ABY13.map] = '迷宮';
// the floor: dark violet stone; around it the void with a few slow motes
CH2_THEMES.abyss13 = { stone: (h, s, l) => [268 + (l - 0.5) * 20, clamp(s + 0.22, 0, 0.42), clamp(l * 0.5 + 0.04, 0, 1)], wall: (h, s, l) => [262, clamp(s + 0.25, 0, 0.45), clamp(l * 0.4, 0, 1)] };
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); if (!this.map || this.map.id !== ABY13.map) return; const t = this.t || 0;
    x.fillStyle = 'rgba(40,10,70,0.16)'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 16; i++) { const px = (i * 61 + Math.sin(t / 50 + i) * 14 + W) % W, py = H - ((i * 47 + t * (0.18 + (i % 4) * 0.07)) % (H + 16)); if ((t + i * 19) % 120 < 90) { x.fillStyle = i % 3 ? '#b890ff' : '#ffe8a0'; x.fillRect(Math.round(px), Math.round(py), 1, 1); } } }; }
const ABY_BOSS13 = { 5: ['banditBoss', 'golem', 'duneWorm', 'crystalGolem'], 10: ['silverWyrm', 'hydra', 'ratKing', 'harvestGolem'], 15: ['clockColossus', 'frostQueen', 'lavaGiant'], 20: ['victorDemon', 'shadowGeneral'], 25: ['starGuardian'], 30: [ABY_LORD13] };
const ABY_GEAR13 = () => { const S = new Set(); for (const m of ['emberPass', 'lavaTunnel', 'duskFort1', 'starShrine', 'cave6_emberPass', 'frostField', 'iceCave']) for (const k of (MAPS[m] && MAPS[m].gearPool) || []) if (GEAR[k]) S.add(k); return [...S]; };
function abyChest(fl, i, x, y, R) { const id = 'aby13_' + fl + '_' + i, r = R();
  if (r < 0.25) { const P = ABY_GEAR13(), u = R(), q = fl >= 20 && u < 0.08 ? 5 : fl >= 10 && u < 0.3 ? 5 : 4; return P.length ? { id, x, y, item: P[Math.floor(R() * P.length)], q } : { id, x, y, gold: 400 * fl }; }
  if (r < 0.5) return { id, x, y, item: 'starDust', n: 1 + Math.floor(R() * 2) + (fl >= 20 ? 1 : 0) };
  if (r < 0.75) return { id, x, y, item: ['megaPotion', 'megaEther', 'elixir'][Math.floor(R() * 3)], n: 1 };
  return { id, x, y, gold: 400 * fl }; }
function genAbyFloor(fl, run) {
  const W = ABY13.W, H = ABY13.H, R = abyRng(run * 131 + fl * 17), g = [...Array(H)].map(() => Array(W).fill('X')), boss = fl % 5 === 0, anom = boss ? 'calm' : ABY_ANOM_KEYS13[Math.floor(R() * ABY_ANOM_KEYS13.length)];
  const set = (x, y, c) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1) g[y][x] = c; };
  const sx = 7, sy = H - 2, start = [sx, sy];
  if (boss) { for (let y = 3; y < H - 1; y++) for (let x = 3; x < W - 3; x++) set(x, y, (x + y) % 5 ? 's' : 'm');
    for (let y = 1; y < 3; y++) for (let x = 6; x < 10; x++) set(x, y, 'm'); set(7, 1, 'Z');
    for (const [x, y] of [[4, 5], [11, 5], [4, 11], [11, 11], [4, 17], [11, 17]]) set(x, y, 'P');
    const sp = ABY_BOSS13[fl][Math.floor(R() * ABY_BOSS13[fl].length)];
    return { rows: g.map(r => r.join('')), start, anom, boss: { sp, lv: Math.min(50, abyLv(fl) + 2), x: 7, y: 3, flag: 'aby13b_' + fl, ev: 'abyBoss' }, items: [], rest: [9, 2] }; }
  // a winding corridor (2 wide) from the bottom to the stairs at the top, side rooms with chests
  let x = sx, y = sy; const path = [];
  while (y > 1) { set(x, y, 's'); set(x + 1, y, 's'); path.push([x, y]); const r = R(); if (r < 0.42) y--; else if (r < 0.71) x = Math.max(1, x - 1); else x = Math.min(W - 3, x + 1); }
  const rooms = []; for (let i = 0; i < 3 + Math.floor(R() * 3); i++) { const [px, py] = path[Math.floor(R() * path.length)], w = 3 + Math.floor(R() * 3), h = 2 + Math.floor(R() * 3), ox = R() < 0.5 ? -w - 1 : 2;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx <= w; xx++) set(px + ox + xx, py - yy, R() < 0.2 ? 'm' : 's'); rooms.push([px + ox + (ox < 0 ? 0 : w), py - h + 1]); }
  for (let i = 0; i < 12; i++) { const X = 1 + Math.floor(R() * (W - 2)), Y = 1 + Math.floor(R() * (H - 2)); if (g[Y][X] === 's' && !path.some(([a, b]) => (a === X || a + 1 === X) && Math.abs(b - Y) <= 0)) g[Y][X] = 'P'; }
  const top = path[path.length - 1]; set(top[0], top[1], 'Z'); set(top[0] + 1, top[1], 'm'); set(top[0], top[1] + 1, 'm'); set(top[0] + 1, top[1] + 1, 'm');
  for (let yy = sy - 1; yy <= sy; yy++) for (let xx = sx - 1; xx <= sx + 2; xx++) set(xx, yy, 'm');
  const items = [], nCh = 1 + Math.floor(R() * 3) + (anom === 'bounty' ? 1 : 0);
  rooms.slice(0, nCh).forEach(([X, Y], i) => { if (g[Y] && (g[Y][X] === 's' || g[Y][X] === 'm')) items.push(abyChest(fl, i, X, Y, R)); });
  if (anom === 'bounty' && items.length < nCh) { const [X, Y] = path[Math.floor(path.length / 2)]; if (g[Y][X + 1] === 's') items.push(abyChest(fl, 9, X + 1, Y, R)); }
  // a chest that a pillar walled off moves to a reachable tile off the main path
  const seen = new Set([sx + ',' + sy]), q = [[sx, sy]], open = (x, y) => g[y] && g[y][x] && g[y][x] !== 'X' && g[y][x] !== 'P' && g[y][x] !== 'Z';
  while (q.length) { const [a, b] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (a + dx) + ',' + (b + dy); if (!seen.has(k) && open(a + dx, b + dy)) { seen.add(k); q.push([a + dx, b + dy]); } } }
  const spare = [...seen].map(k => k.split(',').map(Number)).filter(([a, b]) => g[b][a] === 's' && !path.some(([c, d]) => (c === a || c + 1 === a) && d === b) && b < sy - 1);
  for (const it of items) if (!seen.has(it.x + ',' + it.y) && spare.length) { const [a, b] = spare.splice(Math.floor(R() * spare.length), 1)[0]; it.x = a; it.y = b; }
  return { rows: g.map(r => r.join('')), start, items, anom };
}
function abyEncounters(fl, run, anom) {
  const lv = abyLv(fl), R = abyRng(run * 37 + fl + 9001), pool = Object.keys(SPECIES).filter(k => { const s = SPECIES[k]; return !s.boss && !s.elite && !s.rare && !s.aby13 && MON_PANEL[k] && MON_PANEL[k].lv >= 15 && DEF.enemies[k] && !/^bty12_|^bandit$|^caravan$|^mineBat$|^oreSlime$/.test(k); });
  const table = []; for (let i = 0; i < 3; i++) { let k = pool[Math.floor(R() * pool.length)]; if (table.some(t => t[0] === k)) k = pool[Math.floor(R() * pool.length)]; table.push([k, lv - 1, lv + 1, 16]); }
  const own = Object.keys(ABY_MON13); for (let i = 0; i < 3; i++) table.push([own[(fl + i * 2) % own.length], lv - 1, lv + 1, 22]);
  return [{ y0: 0, y1: 99, rate: anom === 'hush' ? 0.045 : 0.09, table }];
}
// put floor `fl` of run `run` into the map (no warp); returns the floor
function abyApply(fl, run) { const S = abySt(), F = genAbyFloor(fl, run), M = MAPS[ABY13.map], A = ABY_ANOM13[F.anom];
  S.floor = fl; S.anom = F.anom; S.best = Math.max(S.best || 0, fl);
  Object.assign(M, { rows: F.rows, items: F.items, boss: F.boss || null, encounters: F.boss ? [] : abyEncounters(fl, run, F.anom), gearPool: ABY_GEAR13(), name: '裂界深淵 ' + fl + 'F' + (F.anom !== 'calm' ? '・' + A[0] : ''), _key: run + ':' + fl });
  M.npcs = [{ id: 'abyExit', x: F.start[0] + 2, y: F.start[1], dir: 'down', look: 'starGate', name: '回歸之光' }];
  if (F.rest) M.npcs.push({ id: 'abyRest', x: F.rest[0], y: F.rest[1], dir: 'down', look: 'starGate', name: '回復之光', show: st => !!st.flags['aby13b_' + fl] });
  delete mapCache[ABY13.map]; return F; }
function* abyGoto(ow, fl) { const st = Game.st, S = abySt(st), F = abyApply(fl, S.run || 1); yield* ow.warp(ABY13.map, F.start[0], F.start[1], 'up');
  if (F.boss) yield* say('第' + fl + '層……空氣很沉重。深處有強大的氣息。');
  else if (F.anom !== 'calm') { const A = ABY_ANOM13[F.anom]; yield* say('第' + fl + '層・裂界異象「' + A[0] + '」\n' + A[1] + '。'); } }
function abyNewRun(st) { const S = abySt(st); S.run = (S.run || 0) + 1; for (const k in st.flags) if (/^aby13_\d+_|^aby13b_\d+$|^aby13r_\d+$/.test(k)) delete st.flags[k]; }
// a save made inside the abyss comes back to the same floor (same run, same layout)
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) { if (id === ABY13.map) { const st = Game.st, S = abySt(st);
      if (!abyOpen(st) || !S.floor) return _ld.call(this, 'ruins', 7, 2, 'down', silent); if (MAPS[ABY13.map]._key !== (S.run || 1) + ':' + S.floor) abyApply(S.floor, S.run || 1); }
    const r = _ld.call(this, id, x, y, dir, silent); if (id === ABY13.map) this.npcs = this.npcs.filter(n => n.id !== 'stele'); return r; }; }

/* ---------- the door, the stairs, the bosses ---------- */
{ const _re = Overworld.prototype.riftEntry; Overworld.prototype.riftEntry = function* () { const st = Game.st; if (!abyOpen(st)) return yield* _re.call(this);
    const S = abySt(st);
    if (!st.flags.aby13Seen) { st.flags.aby13Seen = 1; Sound.sfx('charge'); Game.flash = 0.6; Game.flashColor = '#c8a0ff';
      yield* sayAll(['曙光鐘的聲音傳到這裡的時候，沉睡的異界之門醒過來了。', '門的另一邊不再是迴廊，而是一道往下延伸的裂縫——深不見底。', '（裂界深淵：共' + ABY13.top + '層，每次進入形狀都會改變。每 5 層有頭目，打倒後可以從那一層重新開始。）',
        '（踏破一層得到裂界碎片，頭目層得到星之碎片，寶箱裡有星塵。拿去找門旁邊的裂界看守人交換吧。）']); }
    const opts = ['從第1層開始']; const cps = [5, 10, 15, 20, 25].filter(c => (S.cp || 0) >= c); for (const c of cps) opts.push('從第' + c + '層開始'); opts.push('不進去');
    const r = yield* ask('要進入裂界深淵嗎？\n（最高紀錄：第' + (S.best || 0) + '層）', opts); if (r < 0 || r >= opts.length - 1) return;
    abyNewRun(st); yield* abyGoto(this, r === 0 ? 1 : cps[r - 1]); }; }
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { if (this.map.id === ABY13.map) { const p = this.p, [dx, dy] = DIRS[p.dir]; if (this.tileAt(p.x + dx, p.y + dy) === 'Z') { this.run(this.abyStairs()); return true; } }
    return _in.call(this); }; }
const abyShard13 = fl => 1 + Math.floor(fl / 5);
Overworld.prototype.abyStairs = function* () { const st = Game.st, S = abySt(st), fl = S.floor, bd = MAPS[ABY13.map].boss;
  if (bd && !st.flags[bd.flag]) { yield* say('強大的氣息擋住了樓梯……先打倒這一層的頭目吧。'); return; }
  if (fl >= ABY13.top) { yield* say('這裡就是裂界深淵的最深處了。'); if (yield* yesNo('要回到古岩遺跡嗎？')) yield* this.warp('ruins', 7, 2, 'down'); return; }
  if (!(yield* yesNo('要前往第' + (fl + 1) + '層嗎？'))) return;
  if (!st.flags['aby13r_' + fl]) { st.flags['aby13r_' + fl] = 1; const n = abyShard13(fl); st.bag.riftShard = (st.bag.riftShard || 0) + n; Sound.sfx('item'); yield* say('踏破第' + fl + '層！得到了裂界碎片×' + n + '。'); }
  yield* abyGoto(this, fl + 1); };
Object.assign(Events, {
  *abyExit(ow) { if (yield* yesNo('要離開裂界深淵，回到古岩遺跡嗎？\n（下次從檢查點重新開始）')) yield* ow.warp('ruins', 7, 2, 'down'); },
  *abyRest(ow) { const st = Game.st, fl = abySt(st).floor; if (st.flags['aby13h_' + fl + '_' + abySt(st).run]) { yield* say('回復之光已經變得很淡了。'); return; }
    if (!(yield* yesNo('溫暖的光從裂縫透進來……要休息一下嗎？'))) return; st.flags['aby13h_' + fl + '_' + abySt(st).run] = 1; yield* healRitual('體力和魔力都恢復了！'); },
  *abyBoss(ow) { const st = Game.st, S = abySt(st), bd = MAPS[ABY13.map].boss, fl = S.floor; if (!bd || st.flags[bd.flag]) return;
    if (!(yield* askFight(bd.sp, bd.lv, bd.sp, 'boss', '裂界深淵' + fl + 'F'))) return;
    const res = yield* ow.battleScript({ sp: bd.sp, lv: bd.lv, kind: 'boss', id: bd.sp, rematch: bd.sp !== ABY_LORD13 || (st.kills || {})[bd.sp] > 0, noMats: 0 });
    if (res !== 'win') return; st.flags[bd.flag] = 1; ow.boss = null; S.cp = Math.max(S.cp || 0, Math.min(25, fl));
    const first = !S.boss[fl]; S.boss[fl] = (S.boss[fl] || 0) + 1; const n = first ? 3 + Math.floor(fl / 10) : 1; st.bag.starShard = (st.bag.starShard || 0) + n; Sound.jingle('item'); yield* itemGet('得到了星之碎片×' + n + '！');
    if (bd.sp === ABY_LORD13) { const firstLord = !st.flags.aby13Lord; st.flags.aby13Lord = 1; if (firstLord) { st.bag.starShard += 7; yield* sayAll(['裂界之主崩塌了。牠胸口的門扉慢慢關上，裂縫裡的風停了下來。', '門扉的碎片裡，有一顆特別亮的星之碎片。（星之碎片 +7）', '（裂界深淵 踏破！之後也能繼續挑戰——每一趟的形狀都會不一樣。）']); } }
    else if (fl < 30) yield* say('第' + fl + '層的檢查點開放了！下次可以從這裡開始。\n（樓梯旁邊出現了回復之光。）');
    ow.load(ABY13.map, ow.p.x, ow.p.y, ow.p.dir, true); },
});

/* ---------- 裂界看守人：碎片換東西 ---------- */
const ABY_ACC13 = { // key: [name, trait, trait name, effect text, cost (星之碎片), description]
  abyEye13: ['深淵之瞳', '洞察', '打中弱點後，下一次攻擊必定會心', 8, '在深淵最暗的地方睜著的眼睛，凝成了一顆紫色的寶石。'],
  abySand13: ['裂界沙漏', '裂時', '回合開始時 15% 機率所有技能冷卻 −1', 10, '沙子往上流的沙漏。拿著它，時間偶爾會往回走一點點。'],
  abyCrown13: ['星辰之冠', '星輝', '會心傷害 +30%', 12, '用星之碎片串成的小冠。會心的那一下，會帶著星光。'],
  abyCharm13: ['虛空護符', '虛障', '每場戰鬥第一次受到的傷害 −50%', 10, '護符的中間是一小片虛空。打過來的力道，有一半會掉進去。'],
  abyRing13: ['星塵指環', '星塵', '戰鬥勝利後回復最大 HP・MP 的 10%', 8, '指環裡封著一撮星塵，打完一場就會亮一下。'],
  abySeal13: ['守門者之印', '守門', '戰鬥開始時展開護盾（最大 HP 20%，2 回合）', 12, '裂界之主胸口門扉上的紋章。'],
};
const ABY_ACC_ST13 = { abyEye13: { hp: 15, atk: 8, spa: 8, def: 3, spd: 3 }, abySand13: { hp: 20, atk: 5, spa: 5, def: 4, spd: 4, spe: 5 }, abyCrown13: { hp: 15, atk: 8, spa: 8, def: 2, spd: 2 },
  abyCharm13: { hp: 35, atk: 3, spa: 3, def: 6, spd: 6 }, abyRing13: { hp: 30, atk: 5, spa: 5, def: 4, spd: 4 }, abySeal13: { hp: 30, atk: 4, spa: 4, def: 6, spd: 6 } };
{ const ref = GEAR.qHeroCrest || GEAR.voidRing; for (const k in ABY_ACC13) { const [n, tn, td, , d] = ABY_ACC13[k];
    GEAR[k] = { n, slot: 'acc', t: 7, st: { ...ABY_ACC_ST13[k] }, sp: k === 'abyCrown13' ? { crit: 5 } : {}, fx: [k], trait: k, kind: '飾品', d, look: ref && ref.look };
    ACC_TRAIT[k] = [tn, td, [n]]; if (typeof SPECIALS !== 'undefined') SPECIALS[k] = { n: tn, d: td + '。', cat: { abyEye13: '攻擊', abySand13: '資源', abyCrown13: '攻擊', abyCharm13: '防禦', abyRing13: '回復', abySeal13: '防禦' }[k] }; if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); } }
PV('fx.abyEye13', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { weakHit: 1, evHit: 1, tgtSide: 'enemy', hasPower: 1 }, limit: { perAction: 1 }, effects: [{ type: 'status', target: 'self', status: 'critNext', quiet: 1 }] }] }), { n: '洞察' });
PV('fx.abySand13', v => ({ triggers: [{ on: EVT.ROUND_START, phase: 'POST', cond: { ownerAlive: 1 }, chance: 0.15, effects: [{ type: 'cooldown', target: 'self', how: 'all', n: 1, why: 'abySand13' }] }] }), { n: '裂時' });
PV('fx.abyCrown13', v => ({}), { n: '星輝' });
PV('fx.abyCharm13', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'modify', mul: 0.5, note: 'abyCharm13' }, { type: 'message', target: 'self', text: '虛空護符吸走了一半的衝擊！' }] }] }), { n: '虛障' });
PV('fx.abyRing13', v => ({}), { n: '星塵' });
PV('fx.abySeal13', v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'ward12', target: 'self', pct: 0.2, abs: { 特: 1, 物: 1 }, turns: 2, why: 'abySeal13' }] }] }), { n: '守門' });
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (s && s.fx && s.fx.abyCrown13) s.critDmg = (s.critDmg || 0) + 30; return s; }; }
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this), st = Game.st; let fx = null; try { fx = heroStats(st).fx; } catch (e) { fx = null; }
    if (st && fx && fx.abyRing13) { const S = heroStats(st), h = Math.ceil(S.hp * 0.1), m = Math.ceil(S.mp * 0.1); if (st.hp < S.hp || st.mp < S.mp) { st.hp = Math.min(S.hp, st.hp + h); st.mp = Math.min(S.mp, (st.mp || 0) + m); yield* this.msg('星塵指環亮了一下，體力和魔力回復了一點。', { hold: 20 }); } }
    return r; }; }
const ABY_SHOP13 = () => [
  ...['elixir:4', 'megaPotion:3', 'megaEther:5'].map(s => { const [k, c] = s.split(':'); return { k, cur: 'riftShard', c: +c }; }),
  ...['powerFruit', 'wisdomFruit', 'vitFruit', 'agiFruit', 'dexFruit', 'luckClover'].map(k => ({ k, cur: 'riftShard', c: 25 + 5 * (abySt().fruits || 0), fruit: 1 })),
  ...Object.keys(ABY_ACC13).map(k => ({ k, cur: 'starShard', c: ABY_ACC13[k][3], acc: 1 })),
  { k: 'attrReset', cur: 'starDust', c: 6 }, { k: 'talentReset', cur: 'starDust', c: 8 }];
const ABY_CUR13 = { riftShard: '裂界碎片', starShard: '星之碎片', starDust: '星塵' };
Object.assign(Events, {
  *abyKeeper(ow) { const st = Game.st;
    if (!st.flags.aby13Keeper) { st.flags.aby13Keeper = 1; yield* sayAll(['……你就是讓曙光鐘響起來的人？', '我以前是迴廊的看守人。門醒過來以後，迴廊變成了深淵。', '深淵裡的碎片和星塵，我都收。拿來換你需要的東西吧。']); }
    const CAT = [['藥品', o => !o.fruit && !o.acc && o.cur === 'riftShard'], ['屬性果實', o => o.fruit], ['飾品', o => o.acc], ['重置道具', o => o.cur === 'starDust']];
    while (true) { const have = '裂界碎片 ' + (st.bag.riftShard || 0) + '・星之碎片 ' + (st.bag.starShard || 0) + '\n星塵 ' + (st.bag.starDust || 0);
      const c = yield* ask(have + '　要換什麼？', [...CAT.map(c => c[0]), '飾品的效果', '不用了']); if (c < 0 || c === CAT.length + 1) return;
      if (c === CAT.length) { yield* sayAll(Object.keys(ABY_ACC13).map(k => '「' + ABY_ACC13[k][0] + '」' + ABY_ACC13[k][1] + '：' + ABY_ACC13[k][2] + '。')); continue; }
      while (true) { const L = ABY_SHOP13().filter(o => (ITEMS[o.k] || GEAR[o.k]) && CAT[c][1](o));
        const cur = L.length ? L[0].cur : 'riftShard', r = yield* ask(CAT[c][0] + '（' + ABY_CUR13[cur] + ' ' + (st.bag[cur] || 0) + '）' + (CAT[c][0] === '屬性果實' ? '\n每換一個，下一個 +5 碎片。' : ''), [...L.map(o => (GEAR[o.k] ? GEAR[o.k].n : ITEMS[o.k].n) + '　' + ABY_CUR13[o.cur] + '×' + o.c), '返回']);
        if (r < 0 || r >= L.length) break; const o = L[r];
        if ((st.bag[o.cur] || 0) < o.c) { yield* say(ABY_CUR13[o.cur] + '不夠喔。'); continue; }
        st.bag[o.cur] -= o.c; if (o.fruit) abySt(st).fruits = (abySt(st).fruits || 0) + 1;
        if (GEAR[o.k]) { const g = makeGear(o.k, 5); Sound.jingle('item'); yield* itemGet('換到了' + gearName(g) + '！'); }
        else { st.bag[o.k] = (st.bag[o.k] || 0) + 1; Sound.sfx('item'); yield* itemGet('換到了' + ITEMS[o.k].n + '！'); }
        break; } } },
});
NPC_ROLES.商店.push('abyKeeper');
MAPS.ruins.npcs = MAPS.ruins.npcs || []; MAPS.ruins.npcs.push({ id: 'abyKeeper', x: 5, y: 3, dir: 'down', look: 'warden', name: '裂界看守人', show: st => abyOpen(st) });
delete mapCache.ruins;

/* ---------- 成就・稱號・冒險手冊 ---------- */
ACHIEVEMENTS.push(
  { id: 'aby13_10', n: '深淵十層', d: '在裂界深淵到達第 10 層。', cat: '探索', ok: st => (abySt(st).best || 0) >= 10 },
  { id: 'aby13_20', n: '深淵二十層', d: '在裂界深淵到達第 20 層。', cat: '探索', ok: st => (abySt(st).best || 0) >= 20 },
  { id: 'aby13_30', n: '深淵的盡頭', d: '在裂界深淵到達第 30 層。', cat: '探索', ok: st => (abySt(st).best || 0) >= 30 },
  { id: 'aby13_lord', n: '裂界踏破', d: '打倒裂界之主。', cat: '戰鬥', ok: st => !!st.flags.aby13Lord });
TITLES.push({ id: 'aby13walker', n: '深淵行者', d: '在裂界深淵到達第 15 層。', st: { spe: 3, crit: 2 }, ok: st => (abySt(st).best || 0) >= 15 },
  { id: 'aby13lord', n: '裂界踏破者', d: '打倒裂界之主。', st: { atk: 3, spa: 3, def: 3, spd: 3 }, ok: st => !!st.flags.aby13Lord });
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); if (!abyOpen(st)) return; const S = abySt(st);
    L.push({ n: '裂界深淵', t: st.flags.aby13Lord ? '完成：打倒了第 30 層的裂界之主。（最高紀錄 ' + (S.best || 0) + '層，之後也能繼續挑戰）' : st.flags.aby13Seen ? '往裂界深淵的最深處前進。最高紀錄：' + (S.best || 0) + '層（檢查點 ' + (S.cp || 0) + '層）。' : '曙光鐘響起之後，古岩遺跡的異界之門好像醒過來了……',
      done: !!st.flags.aby13Lord, rw: '裂界碎片・星之碎片・星塵 → 裂界看守人的飾品', cat: '支線' }); }; }
if (typeof BATTLE2_MAPS !== 'undefined') BATTLE2_MAPS.add(ABY13.map); if (typeof FINAL_SONG !== 'undefined') FINAL_SONG[ABY_LORD13] = 'final';
if (typeof EXPLORE !== 'undefined') EXPLORE[ABY13.map] = EXPLORE[ABY13.map] || '裂界深淵';
