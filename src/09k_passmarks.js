/* ===================== v24.13 small markers on entrances and passages to other maps =====================
   Playtest: "mark the entrances and passages that lead to other maps".
   · map-edge passages (edgeWarps, north / south warps, seamless connections): a gold chevron on the edge tile, pointing out of the map
     (grey when the way is still closed: a missing key / flag)
   · exit mats of interiors and dungeons, stair / gate triggers: a chevron on the tile
   · doors that lead to a dungeon (not to a room) and warp props (manhole, cave doors, the star gate): a chevron bobbing above them
   Drawn on the ground layer (right after the tile), so characters still walk over them. */
const WARP_TRIGS = new Set(['towerUp', 'toFort', 'fortUp']);
const WARP_PROPS = new Set(['manhole', 'iceCaveDoor', 'lavaDoor', 'starGate']);
function passMarks(ow) {
  const m = ow.map; if (m._pm) return m._pm; const d = m.d, L = {}, walk = (x, y) => !SOLID.has(ow.tileAt(x, y));
  const add = (x, y, dir, need) => { L[x + ',' + y] = { x, y, dir, need }; };
  for (const w of d.edgeWarps || []) for (const a of w.at) add(w.dir === 'left' ? 0 : w.dir === 'right' ? m.w - 1 : a, w.dir === 'up' ? 0 : w.dir === 'down' ? m.h - 1 : a, w.dir, w.need);
  if (d.northWarp) for (const a of d.northWarp.x) add(a, 0, 'up');
  if (d.southWarp) for (let x = 0; x < m.w; x++) if (walk(x, m.h - 1)) add(x, m.h - 1, 'down');
  for (const k in d.connect || {}) { const up = k === 'n', y = up ? 0 : m.h - 1; for (let x = 0; x < m.w; x++) if (walk(x, y)) add(x, y, up ? 'up' : 'down'); }
  if (d.exit) add(d.exit.x, d.exit.y, 'down');
  for (const t of d.triggers || []) if (WARP_TRIGS.has(t.id)) add(t.x, t.y, 'up');
  const above = [];
  for (const k in m.doors) { const b = m.doors[k], to = b.to && b.to[0]; if (to && typeof MAP_TYPES !== 'undefined' && MAP_TYPES[to] && MAP_TYPES[to] !== '室內') { const [x, y] = k.split(',').map(Number); above.push({ x, y }); } }
  return m._pm = { tiles: L, above };
}
function drawChevron(x, cx, cy, dir, col) {
  const P = { up: [[0, -2], [-3, 1], [3, 1]], down: [[0, 2], [-3, -1], [3, -1]], left: [[-2, 0], [1, -3], [1, 3]], right: [[2, 0], [-1, -3], [-1, 3]] }[dir];
  const tri = (dx, dy, c, g) => { x.fillStyle = c; x.beginPath(); P.forEach(([a, b], i) => { const X = cx + dx + a * g, Y = cy + dy + b * g; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); x.fill(); };
  tri(0, 0, 'rgba(16,18,30,0.75)', 1.45); tri(0, 0, col, 1);
}
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) {
    _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    if (Game.settings.passMarks === false || !this.map) return;
    const M = passMarks(this), mk = M.tiles[tx + ',' + ty]; if (!mk) return;
    const locked = mk.need && !this.st.flags[mk.need], bob = Math.round(Math.sin(this.t / 12 + tx) * 1), [dx, dy] = DIRS[mk.dir];
    const cx = sx + 8 + dx * 4 + (mk.dir === 'left' || mk.dir === 'right' ? bob * dx : 0), cy = sy + 8 + dy * 4 + (mk.dir === 'up' || mk.dir === 'down' ? bob * dy : 0);
    x.globalAlpha = locked ? 0.55 : 0.9; drawChevron(x, cx, cy, mk.dir, locked ? '#9aa0b0' : '#ffd860'); x.globalAlpha = 1;
  };
  const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    _dr.call(this, x); if (Game.settings.passMarks === false || !this.map) return;
    const M = passMarks(this), camX = this.camX, camY = this.camY, bob = Math.round(Math.sin(this.t / 10) * 1.5);
    const pts = M.above.map(q => [q.x, q.y - 1]).concat(this.npcs.filter(n => WARP_PROPS.has(n.id)).map(n => [n.x, n.y - 1]));
    for (const [tx, ty] of pts) { const X = tx * 16 - camX + 8, Y = ty * 16 - camY + 10 + bob; if (X < -8 || Y < -8 || X > W + 8 || Y > H) continue; x.globalAlpha = 0.9; drawChevron(x, X, Y, 'down', '#ffd860'); x.globalAlpha = 1; }
  };
}
