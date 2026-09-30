/* ===================== v10 階段四：地圖擴大 =====================
   Plan item 3 (地圖變大): 15 outdoor maps grow by a new area on a side that has no exit (right, or bottom when the right
   edge already leads somewhere). The old border opens with a path, and each new area has: a sign with its name, a
   treasure chest, a gathering spot and a 天氣祠 (its event changes with the weather, 09zv). The terrain is generated from
   the map's own tiles (grass, tall grass, trees, rocks, flowers), so the field art is unchanged; tall grass uses the
   encounter table of the same rows. Stepping into a new area for the first time shows its name (祕境發現). */
const MAP_EXT = {
  town: ['bottom', 7, '萌芽鎮郊外花田', '鎮民在這裡種花。春天會開滿一整片。', { item: 'luckClover', n: 1 }, 'herb'],
  forest: ['bottom', 9, '森之深處', '陽光幾乎照不進來的森林最深處。', { item: 'wisdomFruit' }, 'shroom'],
  lake: ['right', 10, '湖畔東岸', '湖水拍著岸邊的石頭，對岸就是王都的方向。', { item: 'enWater' }, 'mana', { id: 'painter', look: 'woman2', name: '畫家艾琳' }],
  canyon: ['right', 10, '赤岩祕谷', '被紅色岩壁包圍的小山谷。風吹過會發出笛聲。', { item: 'enRock' }, 'ore', { id: 'oldBarr', look: 'old', name: '老礦工巴爾' }],
  swamp: ['right', 10, '螢光沼地', '沼澤的水面浮著會發光的小蟲。', { item: 'enVenom' }, 'shroom', { id: 'ruby', look: 'girl', name: '露比' }],
  northRoad: ['right', 10, '北方林道', '旅人不常走的小徑，林子裡很安靜。', { gold: 1500 }, 'herb'],
  capital: ['right', 8, '王都外郭花園', '城牆外的花園，貴族以前常來這裡散步。', { item: 'hiEther', n: 2 }, 'herb'],
  goldPlains: ['bottom', 9, '金穗南坡', '麥田一路延伸到山坡上。', { item: 'enLeaf' }, 'herb'],
  frostVillage: ['right', 8, '冰湖', '結冰的湖面。村裡的孩子冬天會來這裡溜冰。', { item: 'enWater2' }, 'ice'],
  emberPass: ['right', 10, '熔岩溫泉', '地底的熱氣把雪融成了溫泉。', { item: 'enFire2' }, 'ore'],
  starShrine: ['right', 8, '星見台', '神殿旁的高台。晚上能看到整片星空。', { item: 'elixir' }, 'mana'],
  windHills: ['right', 10, '風之丘頂', '風車丘陵最高的地方，風從來沒停過。', { item: 'enBolt' }, 'herb', { id: 'kiteKid', look: 'kid', name: '小風' }],
  jadeCreek: ['bottom', 8, '碧溪下游', '溪水在這裡變寬，水邊長滿了草藥。', { item: 'superPotion', n: 3 }, 'herb'],
  maplePass: ['right', 10, '紅葉谷', '整座山谷都被楓葉染紅了。', { item: 'enFire' }, 'herb'],
  oldField: ['right', 10, '英靈之丘', '古戰場旁的小丘，插滿了無名戰士的劍。', { item: 'powerFruit' }, 'ore', { id: 'oldDuke', look: 'guard', name: '老兵杜克' }],
};
const EXT_AREA = {}; // map → { side, from, name }
function extendMap(id, side, size, name, desc, loot, gkind, npc) {
  const d = MAPS[id]; if (!d || !d.rows || EXT_AREA[id]) return; const rng = srand(hashK(id) + 77), R = d.rows.map(r => r.split('')), h = R.length, w = R[0].length;
  const solid = c => SOLID.has(c), tall = (d.rows.join('').match(/#/g) || []).length > 20 ? '#' : ',', grass = d.rows.join('').includes(',') && !d.rows.join('').includes('#') ? ',' : '.';
  const water = side === 'bottom' ? R[h - 1].map((c, x) => c === 'W' ? x : -1).filter(x => x >= 0) : [];
  const NW = side === 'right' ? size : w, NH = side === 'right' ? h : size, G = [];
  for (let y = 0; y < NH; y++) { G.push([]); for (let x = 0; x < NW; x++) { const edge = side === 'right' ? (x === NW - 1 || y === 0 || y === NH - 1) : (x === 0 || x === NW - 1 || y === NH - 1); G[y].push(edge ? 'T' : grass); } }
  const blob = (ch, n, rMax) => { for (let i = 0; i < n; i++) { const cx = 1 + Math.floor(rng() * (NW - 2)), cy = 1 + Math.floor(rng() * (NH - 2)), r = 1 + Math.floor(rng() * rMax); for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (x > 0 && y > 0 && x < NW - 1 && y < NH - 1 && (x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.5 && rng() < 0.85) G[y][x] = ch; } };
  blob(tall, Math.ceil(NW * NH / 40), 2); blob('T', Math.ceil(NW * NH / 55), 1); for (let i = 0; i < NW * NH / 30; i++) { const x = 1 + Math.floor(rng() * (NW - 2)), y = 1 + Math.floor(rng() * (NH - 2)); G[y][x] = rng() < 0.4 ? 'o' : 'f'; }
  for (const x of water) for (let y = 0; y < NH; y++) G[y][x] = 'W';
  // the opening in the old border and a path into the new area
  let o = -1; const L = side === 'right' ? h : w, mid = Math.floor(L / 2);
  const inside = i => side === 'right' ? !solid(R[i][w - 2]) && !solid(R[i + 1][w - 2]) : !solid(R[h - 2][i]) && !solid(R[h - 2][i + 1]) && !water.includes(i) && !water.includes(i + 1);
  for (let k = 0; k < mid && o < 0; k++) for (const i of [mid + k, mid - k]) if (o < 0 && i > 1 && i < L - 3 && inside(i)) o = i;
  if (o < 0) o = mid;
  for (const i of [o, o + 1]) { if (side === 'right') { R[i][w - 1] = ':'; if (solid(R[i][w - 2])) R[i][w - 2] = ':'; } else { R[h - 1][i] = ':'; if (solid(R[h - 2][i])) R[h - 2][i] = ':'; } }
  const cM = side === 'right' ? Math.floor(NW / 2) : Math.floor(NH / 2), cL = side === 'right' ? Math.floor(NH / 2) : Math.floor(NW / 2);
  const setP = (a, b) => { const [x, y] = side === 'right' ? [a, b] : [b, a]; if (x > 0 && y >= 0 && x < NW && y < NH && G[y][x] !== 'W' && !(side === 'right' ? x === NW - 1 || y === 0 || y === NH - 1 : x === 0 || x === NW - 1 || y === NH - 1)) G[y][x] = ':'; };
  for (let a = 0; a <= cM; a++) { setP(a, o); setP(a, o + 1); } for (let b = Math.min(o, cL); b <= Math.max(o + 1, cL); b++) setP(cM, b);
  if (side === 'right') for (let y = 0; y < h; y++) R[y].push(...G[y]); else for (const row of G) R.push(row);
  // points of interest on reachable tiles
  const W2 = R[0].length, H2 = R.length, inNew = (x, y) => side === 'right' ? x >= w : y >= h, key = (x, y) => x + ',' + y;
  const start = side === 'right' ? [w, o] : [o, h], dist = { [key(...start)]: 0 }, q = [start];
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W2 || ny >= H2 || !inNew(nx, ny) || solid(R[ny][nx]) || dist[key(nx, ny)] !== undefined) continue; dist[key(nx, ny)] = dist[key(x, y)] + 1; q.push([nx, ny]); } }
  const cells = Object.entries(dist).map(([k, v]) => [...k.split(',').map(Number), v]).sort((a, b) => b[2] - a[2]), used = new Set(), free = (x, y) => !used.has(key(x, y)) && R[y][x] !== ':';
  const take = (pred) => { const c = cells.find(([x, y, v]) => free(x, y) && pred(x, y, v)); if (c) { used.add(key(c[0], c[1])); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) used.add(key(c[0] + dx, c[1] + dy)); } return c; };
  const open4 = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => dist[key(x + dx, y + dy)] !== undefined).length >= 2;
  const chest = take((x, y, v) => v >= 4), shrine = take((x, y, v) => v >= 3 && open4(x, y)), gat = take((x, y, v) => v >= 2), who = npc && take((x, y, v) => v >= 2 && v <= 8 && open4(x, y));
  const sg = side === 'right' ? [w + 1, o - 1] : [o - 1, h + 1]; if (R[sg[1]] && !solid(R[sg[1]][sg[0]]) && R[sg[1]][sg[0]] !== ':') R[sg[1]][sg[0]] = 'S';
  d.rows = R.map(r => r.join('')); d.signs = d.signs || {}; if (R[sg[1]] && R[sg[1]][sg[0]] === 'S') d.signs[sg[0] + ',' + sg[1]] = '「' + name + '」\n' + desc;
  if (chest) (d.items = d.items || []).push({ id: 'x' + id, x: chest[0], y: chest[1], ...loot });
  if (gat && GATHER_KINDS[gkind]) (d.gathers = d.gathers || []).push({ id: 'gx' + id, x: gat[0], y: gat[1], kind: gkind, mat: GATHER_KINDS[gkind][1] });
  if (shrine) (d.npcs = d.npcs || []).push({ id: 'wshrine_' + id, x: shrine[0], y: shrine[1], dir: 'down', look: 'altar', name: '天氣祠' });
  if (who) (d.npcs = d.npcs || []).push({ ...npc, x: who[0], y: who[1], dir: 'left' });
  if (side === 'bottom' && d.encounters && d.encounters.length) { const last = d.encounters.reduce((a, e) => e.y1 > a.y1 ? e : a, d.encounters[0]); d.encounters.push({ ...last, y0: h, y1: h + size }); }
  EXT_AREA[id] = { side, from: side === 'right' ? w : h, name, shrine: shrine ? [shrine[0], shrine[1]] : null };
}
for (const id in MAP_EXT) extendMap(id, ...MAP_EXT[id]);
// first steps into a new area: its name pops up (and counts for 探索)
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st, E = st && EXT_AREA[st.map], p = this.p;
    if (E && p && !this.script && (E.side === 'right' ? p.x >= E.from : p.y >= E.from)) { const seen = st.extSeen || (st.extSeen = {}); if (!seen[st.map]) { seen[st.map] = 1; this.popup = { name: '祕境發現：' + E.name, t: 0 }; Sound.sfx('save'); } }
    return _u.apply(this, a); }; }
if (typeof ACHIEVEMENTS !== 'undefined') ACHIEVEMENTS.push({ id: 'extAll', n: '祕境探險家', d: '走遍15處祕境（地圖邊緣新開的區域）。', cat: '探索', ok: st => Object.keys(st.extSeen || {}).length >= Object.keys(MAP_EXT).length });
