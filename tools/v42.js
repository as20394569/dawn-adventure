// chapter 2 map sanity: every object reachable from the map's entrances, events exist, warps land on walkable tiles
module.exports = async (g) => { g.log(await g.ev(() => {
  const ids = ['northRoad', 'capital', 'castle', 'church', 'clockShop', 'guild', 'bardHall', 'capInn', 'capShop', 'armory', 'capHouse', 'capHouse2', 'capSewer', 'goldPlains', 'clockTower1', 'clockTower2', 'frostField', 'frostVillage', 'frostInn', 'frostShop', 'temple', 'frostHouse', 'iceCave', 'emberPass', 'lavaTunnel', 'duskFort1', 'duskFort2', 'starShrine'];
  const out = [], SOL = new Set('TWobSFPRXYUNxwckhaBQKCpV'.split(''));
  // entrances: where warps from other maps land
  const ent = {}; const addE = (m, x, y) => (ent[m] = ent[m] || []).push([x, y]);
  for (const k in MAPS) { const d = MAPS[k]; for (const w of d.edgeWarps || []) addE(w.to[0], w.to[1], w.to[2]); if (d.exit) addE(d.exit.to[0], d.exit.to[1], d.exit.to[2]); for (const b of d.buildings || []) if (b.to) addE(b.to[0], b.to[1], b.to[2]); }
  const extra = { northRoad: [[10, 37]], capSewer: [[10, 22]], clockTower2: [[7, 13]], iceCave: [[9, 22]], lavaTunnel: [[10, 22]], duskFort1: [[10, 24]], duskFort2: [[8, 15]], starShrine: [[9, 19]], capital: [[5, 27]], frostVillage: [[2, 13]], town: [[19, 6]] };
  for (const k in extra) for (const p of extra[k]) addE(k, p[0], p[1]);
  for (const id of ids) {
    const d = MAPS[id]; if (!d) { out.push('MISSING ' + id); continue; } const R = d.rows, w = R[0].length, h = R.length;
    if (R.some(r => r.length !== w)) out.push(id + ' ragged rows');
    const block = new Set(); const doors = {}; for (const b of d.buildings || []) { for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) block.add(x + ',' + y); const dk = (b.x + b.door) + ',' + (b.y + b.h - 1); block.delete(dk); doors[dk] = 1; }
    const solidEnt = new Set(); for (const n of d.npcs || []) solidEnt.add(n.x + ',' + n.y); for (const it of d.items || []) solidEnt.add(it.x + ',' + it.y); for (const gg of d.gathers || []) solidEnt.add(gg.x + ',' + gg.y); if (d.boss) { solidEnt.add(d.boss.x + ',' + d.boss.y); solidEnt.add((d.boss.x + 1) + ',' + d.boss.y); }
    const walk = (x, y) => x >= 0 && y >= 0 && x < w && y < h && !SOL.has(R[y][x]) && !block.has(x + ',' + y) && R[y][x] !== 'L';
    const seen = new Set(), q = [];
    for (const [x, y] of ent[id] || []) { if (!walk(x, y)) out.push(id + ' entrance not walkable ' + x + ',' + y + ' "' + (R[y] || '')[x] + '"'); else { seen.add(x + ',' + y); q.push([x, y]); } }
    if (!q.length) { out.push(id + ' no entrance'); continue; }
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || !walk(nx, ny) || solidEnt.has(k) && !doors[k]) continue; seen.add(k); q.push([nx, ny]); } }
    const near = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    const chk = (what, x, y, solid) => { if (solid ? !near(x, y) : !seen.has(x + ',' + y)) out.push(id + ' unreachable ' + what + ' @' + x + ',' + y + ' "' + R[y][x] + '"'); };
    for (const n of d.npcs || []) { chk('npc ' + n.id, n.x, n.y, 1); if (!Events[n.id] && !(typeof COM_GIVER !== 'undefined' && Object.values(COM_GIVER).includes(n.id))) out.push(id + ' no event for npc ' + n.id); if (SOL.has(R[n.y][n.x])) out.push(id + ' npc in wall ' + n.id); }
    for (const it of d.items || []) chk('item ' + it.id, it.x, it.y, 1);
    for (const gg of d.gathers || []) chk('gather ' + gg.id, gg.x, gg.y, 1);
    for (const e of d.elites || []) { chk('elite ' + e.id, e.x, e.y, 0); if (!SPECIES[e.sp]) out.push('elite species ' + e.sp); }
    if (d.boss) { chk('boss', d.boss.x, d.boss.y, 1); if (!Events[d.boss.ev]) out.push(id + ' no boss event ' + d.boss.ev); }
    for (const t of d.triggers || []) { chk('trigger ' + t.id, t.x, t.y, 0); if (!Events[t.id]) out.push(id + ' no trigger event ' + t.id); }
    if (d.exit) chk('exit', d.exit.x, d.exit.y, 0);
    for (const k in doors) { const [x, y] = k.split(',').map(Number); if (!seen.has(x + ',' + (y + 1))) out.push(id + ' door not reachable ' + k); }
    for (const wv of d.edgeWarps || []) for (const a of wv.at) { const x = wv.dir === 'left' ? 0 : wv.dir === 'right' ? w - 1 : a, y = wv.dir === 'up' ? 0 : wv.dir === 'down' ? h - 1 : a; if (!seen.has(x + ',' + y)) out.push(id + ' edge ' + wv.dir + ' ' + a + ' not reachable'); }
    for (const e of (d.encounters || [])) for (const r of e.table) if (!SPECIES[r[0]]) out.push(id + ' enc species ' + r[0]);
    for (const it of d.items || []) if (it.item && !ITEMS[it.item] && !GEAR[it.item]) out.push(id + ' item missing ' + it.item);
    for (const gp of d.gearPool || []) if (!GEAR[gp]) out.push(id + ' gearPool missing ' + gp);
  }
  for (const n of MAPS.town.npcs) if (!Events[n.id] && !['farmer', 'auntie'].includes(n.id)) out.push('town npc no event ' + n.id);
  return out.length ? out.join('\n') : 'MAPS OK';
})); };
