/* ===================== v12.53 溪谷的水門（推石頭） =====================
   碧溪谷北邊（25,2）的小洞窟。把兩顆大石頭推到兩塊石板上，水門就會打開；裡面有寶箱（力量果實、飾品「溪谷石笛」）。
   房間用 tools/sokoban_gen.py 產生＋驗證：最少 13 次推動・22 步。推錯了跟石頭說話就能全部放回原位（推不進入口的走道，不會被關在裡面）。
   地圖字元：q 石板（站得上去）、G 水門（關著時不能走）。 */
const SLUICE13 = { start: [[4, 9], [3, 9]], plates: [[6, 5], [3, 6]], rows: [5, 10] };
MAPS.sluice13 = { name: '溪谷的水門', music: 'ruins', border: 'R', battleBg: 'ruins', popup: 1, type: '迷宮', sok13: 1,
  rows: ['RRRRRRRRRRR', 'RRRsssssRRR', 'RRRsssssRRR', 'RRRRRsRRRRR', 'RRRRRGRRRRR',
    'RsssssqsssR', 'RsRqssssssR', 'RsRsRsssssR', 'RsssssssssR', 'RssssRRsssR', 'RsssssssssR', 'RRRRRsRRRRR', 'RRRRsssRRRR', 'RRRRRsRRRRR'],
  exit: { x: 5, y: 13, to: ['jadeCreek', 25, 3] },
  npcs: SLUICE13.start.map(([x, y], i) => ({ id: 'bd13_' + i, x, y, dir: 'down', look: 'boulder13', name: '大石頭', boulder13: 1 })),
  items: [{ id: 'sl13a', x: 4, y: 1, item: 'powerFruit', n: 1 }, { id: 'sl13b', x: 6, y: 1, item: 'creekFlute13', q: 3 }],
  encounters: [] };
if (typeof MAP_TYPES !== 'undefined') MAP_TYPES.sluice13 = '迷宮'; EXPLORE.sluice13 = '溪谷的水門';
MAPS.jadeCreek.npcs.push({ id: 'sluiceDoor13', x: 25, y: 2, dir: 'down', look: 'caveDoor', name: '溪谷的水門' }); delete mapCache.jadeCreek;
if (typeof MAP_G !== 'undefined') MAP_G = null;
GEAR.creekFlute13 = { n: '溪谷石笛', slot: 'acc', t: 2, st: { hp: 8, spd: 2, spe: 2 }, sp: {}, fx: ['will'], trait: 'will', kind: '飾品', d: '用溪谷的石頭磨成的小笛子。吹起來像水聲，聽了心裡會安靜下來。', look: (GEAR.qHeroCrest || {}).look };
if (ACC_TRAIT.will) ACC_TRAIT.will[2] = (ACC_TRAIT.will[2] || []).concat(['溪谷石笛']); if (typeof BP_RARE !== 'undefined') BP_RARE.add('creekFlute13');
// a round boulder on a clear background (the map's rock tile has grass painted under it)
const BOULDER13 = (() => { const c = mkCanvas(16, 16), x = c.getContext('2d'), P = [[5, 1, 6], [3, 2, 10], [2, 3, 12], [1, 4, 14], [1, 5, 14], [0, 6, 16], [0, 7, 16], [0, 8, 16], [0, 9, 16], [0, 10, 16], [1, 11, 14], [1, 12, 14], [2, 13, 12], [3, 14, 10]];
  x.fillStyle = '#2a2e3a'; for (const [a, y, w] of P) x.fillRect(a, y, w, 1); x.fillStyle = '#7c8394'; for (const [a, y, w] of P) if (y > 1 && y < 14) x.fillRect(a + 1, y, w - 2, 1);
  x.fillStyle = '#5c6274'; for (const [a, y, w] of P) if (y >= 9 && y < 14) x.fillRect(a + 1, y, w - 2, 1); x.fillStyle = '#a8afbe'; x.fillRect(4, 3, 4, 2); x.fillRect(3, 5, 2, 2); x.fillStyle = '#464b5a'; x.fillRect(9, 7, 3, 1); x.fillRect(6, 10, 2, 1);
  x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(2, 15, 12, 1); return c; })();
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'boulder13') return propFrames(BOULDER13, 6); return _nf(look); }; }

// where the boulders are (kept in the save) and whether both plates are covered
const bd13 = (st = Game.st) => st.bd13 || (st.bd13 = SLUICE13.start.map(p => p.slice()));
const sluiceDone13 = (st = Game.st) => SLUICE13.plates.every(([x, y]) => bd13(st).some(b => b[0] === x && b[1] === y));
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { const r = _ld.apply(this, a);
    if (this.map && this.map.d.sok13) { const B = bd13(this.st); for (const n of this.npcs) if (n.boulder13) { const i = +n.id.split('_')[1], [x, y] = B[i]; n.x = n.hx = n.tx = x; n.y = n.hy = n.ty = y; n.px = x * 16; n.py = y * 16; n.walk = 0; } }
    return r; }; }
// the gate: solid until the plates are covered
{ const _sa = Overworld.prototype.solidAt; Overworld.prototype.solidAt = function (x, y) { if (this.map && this.map.d.sok13 && this.tileAt(x, y) === 'G' && !this.st.flags.sluice13) return true; return _sa.call(this, x, y); }; }
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) {
    if (!this.map || !this.map.d.sok13 || (c !== 'q' && c !== 'G')) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    _dt.call(this, x, 's', tx, ty, sx, sy, f, f2);
    if (c === 'q') { const on = this.npcs.some(n => n.boulder13 && n.x === tx && n.y === ty); x.fillStyle = '#3a3f52'; x.fillRect(sx + 1, sy + 1, 14, 14); x.fillStyle = on ? '#6ee7d2' : '#5a6180'; x.fillRect(sx + 3, sy + 3, 10, 10); x.fillStyle = on ? '#e8fff8' : '#3a3f52'; x.fillRect(sx + 7, sy + 4, 2, 8); x.fillRect(sx + 4, sy + 7, 8, 2); }
    else if (!this.st.flags.sluice13) { x.fillStyle = '#2a3a5a'; x.fillRect(sx, sy, 16, 16); x.fillStyle = '#7a8aa8'; for (let i = 1; i < 16; i += 4) x.fillRect(sx + i, sy, 2, 16); x.fillStyle = '#4a6a9a'; x.fillRect(sx, sy + 6, 16, 2); } }; }
// pushing: walking into a boulder moves it one tile if the tile behind it is free floor inside the room
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) { const p = this.p;
    if (this.map && this.map.d.sok13 && p && !p.moving) { const [dx, dy] = DIRS[d], nx = p.x + dx, ny = p.y + dy, e = this.npcs.find(n => n.boulder13 && n.x === nx && n.y === ny);
      if (e) { const bx = nx + dx, by = ny + dy, c = this.tileAt(bx, by), ok = (c === 's' || c === 'q') && by >= SLUICE13.rows[0] && by <= SLUICE13.rows[1] && !this.entityAt(bx, by);
        if (!ok) { p.dir = d; this.st.dir = d; return _tm.call(this, d, run); }
        const i = +e.id.split('_')[1]; bd13(this.st)[i] = [bx, by]; e.x = e.hx = e.tx = bx; e.y = e.hy = e.ty = by; Sound.sfx('rock');
        if (!this.st.flags.sluice13 && sluiceDone13(this.st)) this.sluiceOpen13 = 1; } }
    return _tm.call(this, d, run); }; }
// the boulder slides to its new tile; the gate opens once the player stops
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    if (this.map && this.map.d.sok13) { for (const n of this.npcs) if (n.boulder13) { const tx = n.x * 16, ty = n.y * 16; n.px += Math.sign(tx - n.px) * Math.min(2, Math.abs(tx - n.px)); n.py += Math.sign(ty - n.py) * Math.min(2, Math.abs(ty - n.py)); n.moving = false; }
      if (this.sluiceOpen13 && !this.p.moving && !this.script && !UI.stack.length) { this.sluiceOpen13 = 0; this.st.flags.sluice13 = 1; Sound.sfx('charge'); Game.shake = 12;
        this.run(sayAll(['兩塊石板都亮了起來……', '轟隆隆——水門慢慢升了上去！'])); } }
    return _u.apply(this, a); }; }

Object.assign(Events, {
  *sluiceDoor13(ow) { if (yield* yesNo('溪谷的水門。舊的石牆後面傳來水聲。\n要進去嗎？')) yield* ow.warp('sluice13', 5, 12, 'up'); },
});
SLUICE13.start.forEach((_, i) => { Events['bd13_' + i] = function* (ow) { const st = Game.st;
  if (st.flags.sluice13) { yield* say('壓在石板上的大石頭。水門已經打開了。'); return; }
  yield* say('一顆很重的大石頭。走過去就能推動它。');
  if (yield* yesNo('要把兩顆石頭都放回原來的地方嗎？')) { st.bd13 = SLUICE13.start.map(p => p.slice()); Sound.sfx('rock'); ow.load('sluice13', ow.p.x, ow.p.y, ow.p.dir, true); yield* say('石頭回到了原來的地方。'); } }; });
(NPC_ROLES.事件 || NPC_ROLES.情報).push('sluiceDoor13', ...SLUICE13.start.map((_, i) => 'bd13_' + i)); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.sluiceDoor13 = '碧溪谷・北邊';
ACHIEVEMENTS.push({ id: 'sluice13', n: '水門的謎', d: '打開溪谷的水門。', cat: '探索', ok: st => !!st.flags.sluice13 });
