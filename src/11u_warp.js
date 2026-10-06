/* ===================== v12.54 古代轉移陣 =====================
   落日峽谷北邊（29,1）的遺跡。八個被牆隔開的小房間，只能靠地上的轉移陣（地圖字元 j）來回。
   每一對轉移陣都是雙向的，所以永遠回得去；走上轉移陣就會傳到另一個，離開再踩上去才會再傳。
   正確的路：入口 → 左下第二間 → 上排第二間 → 右下 → 右上（飾品「轉移石墜飾」、智慧果實）；另一條路通到左下角（1500 G）。 */
const WARP13 = { pairs: [[[9, 5], [10, 2]], [[11, 5], [6, 6]], [[5, 5], [6, 2]], [[7, 3], [14, 6]], [[15, 5], [14, 2]], [[11, 1], [2, 2]], [[1, 1], [2, 6]]] };
MAPS.warpRuin13 = { name: '古代轉移陣', music: 'ruins', border: 'R', battleBg: 'canyon', theme: 'canyon', encAll: 1, popup: 1, type: '迷宮', warp13: 1,
  rows: ['RRRRRRRRRRRRRRRRR', 'RjssRsssRssjRsssR', 'RsjsRsjsRsjsRsjsR', 'RsssRssjRsssRsssR', 'RRRRRRRRRRRRRRRRR',
    'RsssRjssRjsjRssjR', 'RsjsRsjsRsssRsjsR', 'RsssRsssRsssRsssR', 'RRRRRRRRRRsRRRRRR', 'RRRRRRRRRRsRRRRRR', 'RRRRRRRRRRsRRRRRR'],
  exit: { x: 10, y: 10, to: ['canyon', 29, 2] },
  npcs: [], items: [{ id: 'wr13a', x: 13, y: 1, item: 'warpPendant13', q: 3 }, { id: 'wr13b', x: 15, y: 1, item: 'wisdomFruit', n: 1 }, { id: 'wr13c', x: 1, y: 7, gold: 1500 }],
  encounters: [] };
{ const T = MAPS.warpRuin13.rows.map(r => r.split('')); for (const [a, b] of WARP13.pairs) for (const [x, y] of [a, b]) if (T[y][x] !== 'j' && typeof bvErr === 'function') bvErr('warp13', 'no pad at ' + x + ',' + y); }
// the canyon's own wild monsters live in the ruin too
{ const E = (MAPS.canyon.encounters || [])[0]; if (E) MAPS.warpRuin13.encounters = [{ y0: 0, y1: 99, rate: 0.05, table: E.table.map(r => [r[0], r[1] + 1, (r[2] || r[1]) + 1, r[3]]) }]; }
if (typeof MAP_TYPES !== 'undefined') MAP_TYPES.warpRuin13 = '迷宮'; EXPLORE.warpRuin13 = '古代轉移陣';
MAPS.canyon.npcs.push({ id: 'warpDoor13', x: 29, y: 1, dir: 'down', look: 'caveDoor', name: '古代轉移陣' }); delete mapCache.canyon;
if (typeof MAP_G !== 'undefined') MAP_G = null;
GEAR.warpPendant13 = { n: '轉移石墜飾', slot: 'acc', t: 3, st: { hp: 10, spe: 5 }, sp: {}, fx: ['first'], trait: 'first', kind: '飾品', d: '轉移陣的碎片做成的墜飾。戴著它，身體總是比腦袋先動。', look: (GEAR.qHeroCrest || {}).look };
if (ACC_TRAIT.first) ACC_TRAIT.first[2] = (ACC_TRAIT.first[2] || []).concat(['轉移石墜飾']); if (typeof BP_RARE !== 'undefined') BP_RARE.add('warpPendant13');

const warpDest13 = (x, y) => { for (const [a, b] of WARP13.pairs) { if (a[0] === x && a[1] === y) return b; if (b[0] === x && b[1] === y) return a; } return null; };
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) {
    if (c !== 'j' || !this.map || !this.map.d.warp13) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    _dt.call(this, x, 's', tx, ty, sx, sy, f, f2); const k = (Math.sin((this.t + tx * 11 + ty * 7) / 12) + 1) / 2;
    x.fillStyle = '#3a2a5a'; x.fillRect(sx + 2, sy + 2, 12, 12); x.fillStyle = 'rgba(176,140,255,' + (0.45 + 0.4 * k) + ')'; x.fillRect(sx + 3, sy + 3, 10, 10);
    x.fillStyle = '#2a1a44'; x.fillRect(sx + 5, sy + 5, 6, 6); x.fillStyle = 'rgba(232,220,255,' + (0.5 + 0.5 * k) + ')'; x.fillRect(sx + 7, sy + 3, 2, 10); x.fillRect(sx + 3, sy + 7, 10, 2); }; }
// stepping onto a pad sends you to its partner; you have to step off and on again to go back
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function (...a) { const r = _os.apply(this, a), p = this.p;
    if (!this.map || !this.map.d.warp13 || !p) return r; const L = this.padLock13;
    if (this.tileAt(p.x, p.y) !== 'j') { this.padLock13 = null; return r; } if (L && L[0] === p.x && L[1] === p.y) return r;
    const d = warpDest13(p.x, p.y); if (!d || this.script) return r; this.padLock13 = d;
    this.run((function* (ow) { Sound.sfx('charge'); Game.flash = 0.6; Game.flashColor = '#b08cff'; yield* wait(10); ow.load(ow.map.id, d[0], d[1], ow.p.dir, true); ow.padLock13 = d; yield* wait(6); })(this));
    return r; }; }

Object.assign(Events, {
  *warpDoor13(ow) { if (yield* yesNo('峽谷的岩壁上有一扇古老的石門。門縫裡透出紫色的光。\n要進去嗎？')) { ow.padLock13 = null; yield* ow.warp('warpRuin13', 10, 9, 'up'); } },
});
(NPC_ROLES.事件 || NPC_ROLES.情報).push('warpDoor13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.warpDoor13 = '落日峽谷・北邊';
ACHIEVEMENTS.push({ id: 'warp13', n: '轉移陣的盡頭', d: '在古代轉移陣找到轉移石墜飾。', cat: '探索', ok: st => !!st.flags.wr13a });
