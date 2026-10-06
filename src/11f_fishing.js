/* ===================== v12.40 釣魚（玩家 2026-10-06：「追加大量新內容」「做你認為好的遊戲內容與改動」） =====================
   萌芽鎮池塘邊的「釣魚老伯 羅德」送釣竿。面向水邊按 A 拋竿 → 浮標沉下去時按 A → 指針來回擺動，在綠色區域裡按 A 收線。
   魚依水域分（河川・湖・沼澤・冰原・海・洞窟），各水域之主只在一個地方出現；有幾種只在晚上出現；海裡偶爾會釣到沉船寶箱。
   記錄每種魚的最大尺寸（冒險手冊「釣魚紀錄」），收集獎勵找羅德領。 */
const FISH13 = { // key: [name, water, rarity 1 common / 2 uncommon / 3 rare / 4 lord, [min cm, max cm], sell, shape, colours [body, belly/fin], note]
  fish13_crucian: ['小鯽魚', 'river', 1, [8, 20], 30, 'fish', ['#9aa070', '#d8d0a0'], ''],
  fish13_minnow: ['溪哥', 'river', 1, [6, 14], 25, 'fish', ['#7aa0b8', '#e08060'], ''],
  fish13_shrimp: ['河蝦', 'river', 1, [4, 9], 35, 'shrimp', ['#c8b8a0', '#e8d8c0'], ''],
  fish13_trout: ['虹鱒', 'river', 2, [25, 55], 150, 'fish', ['#7a9a7a', '#e88aa0'], ''],
  fish13_goldcarp: ['金色鯉魚', 'river', 3, [40, 80], 600, 'fish', ['#f0b830', '#fff0a0'], ''],
  fish13_moonTrout: ['銀月鱒', 'lake', 2, [30, 60], 200, 'fish', ['#b8c8e0', '#f0f4ff'], ''],
  fish13_lakeEel: ['湖鰻', 'lake', 2, [40, 90], 220, 'long', ['#5a6a5a', '#c8c8a0'], ''],
  fish13_moonfish: ['月光魚', 'lake', 3, [15, 30], 700, 'flat', ['#e8e0ff', '#a8c8ff'], 'night'],
  fish13_loach: ['泥鰍', 'swamp', 1, [8, 18], 30, 'long', ['#6a5a3a', '#a89060'], ''],
  fish13_swampCat: ['沼澤鯰', 'swamp', 2, [35, 80], 180, 'fish', ['#4a5040', '#8a9070'], ''],
  fish13_lantern: ['瘴氣燈籠魚', 'swamp', 3, [12, 25], 650, 'flat', ['#5a3a7a', '#c0ff80'], 'night'],
  fish13_icefish: ['冰魚', 'ice', 1, [10, 20], 60, 'fish', ['#c8e8f8', '#ffffff'], ''],
  fish13_snowTrout: ['雪鱒', 'ice', 2, [30, 65], 260, 'fish', ['#a8b8c8', '#f0a0a0'], ''],
  fish13_crystalCod: ['冰晶鱈', 'ice', 3, [50, 90], 800, 'flat', ['#88d8f0', '#e0faff'], ''],
  fish13_horseMack: ['竹筴魚', 'sea', 1, [15, 35], 60, 'fish', ['#6a90b0', '#e0e8f0'], ''],
  fish13_blackBream: ['黑鯛', 'sea', 2, [25, 55], 250, 'flat', ['#3a3e48', '#8a90a0'], ''],
  fish13_octopus: ['章魚', 'sea', 2, [30, 80], 260, 'octo', ['#d06050', '#f0a090'], ''],
  fish13_marlin: ['旗魚', 'sea', 3, [150, 300], 1000, 'marlin', ['#3a5a9a', '#c8d8f0'], ''],
  fish13_blindfish: ['盲眼洞穴魚', 'cave', 2, [8, 16], 200, 'fish', ['#e8d8e0', '#ffffff'], ''],
  fish13_catKing: ['巨鯰王', 'river', 4, [120, 200], 3000, 'fish', ['#4a4030', '#a09060'], 'jadeCreek'],
  fish13_lakeLord: ['銀月巨鱒', 'lake', 4, [110, 160], 3000, 'fish', ['#d0d8f0', '#ffffff'], 'lake'],
  fish13_lungfish: ['古代肺魚', 'swamp', 4, [100, 170], 3000, 'long', ['#5a6a3a', '#c8b060'], 'swamp'],
  fish13_iceLord: ['千年冰鱈', 'ice', 4, [130, 210], 3500, 'flat', ['#6ac0e8', '#ffffff'], 'iceCave'],
  fish13_bluefin: ['藍鰭霸王', 'sea', 4, [250, 400], 4000, 'fish', ['#1a3a7a', '#c8d0e0'], 'coralCoast13'],
};
const FISH_KEYS13 = Object.keys(FISH13);
const FISH_RANK13 = { 1: '常見', 2: '少見', 3: '稀有', 4: '水域之主' };
const FISH_WATERN13 = { river: '河川', lake: '湖', swamp: '沼澤', ice: '冰原', sea: '海', cave: '洞窟' };
const FISH_WATER13 = { town: 'river', route: 'river', windHills: 'river', jadeCreek: 'river', forest: 'river', maplePass: 'river', northRoad: 'river', goldPlains: 'river', capital: 'river', canyon: 'river',
  lake: 'lake', swamp: 'swamp', sewer: 'swamp', capSewer: 'swamp', frostField: 'ice', iceCave: 'ice', frostVillage: 'ice', harbor13: 'sea', coralCoast13: 'sea', wreckCove13: 'sea' };
const fishWater13 = id => FISH_WATER13[id] || (/^cave6_/.test(id) ? 'cave' : null);
const LAVA13 = new Set(['emberPass', 'lavaTunnel']);
const ROD13 = [['rod13', '釣竿', 0, 1], ['rod13b', '好釣竿', 6, 1], ['rod13c', '大師釣竿', 12, 0.85]]; // [item, name, zone +px, needle speed ×]
const rodOf13 = (st = Game.st) => { const b = st.bag || {}; return b.rod13c ? 2 : b.rod13b ? 1 : b.rod13 ? 0 : -1; };
const fishSt13 = (st = Game.st) => st.fish13 || (st.fish13 = {});
const fishKinds13 = (st = Game.st) => FISH_KEYS13.filter(k => fishSt13(st)[k]).length;

/* ---------- items and their icons ---------- */
ITEM_CATS.splice(ITEM_CATS.indexOf('採集素材') + 1, 0, '魚'); ITEM_CAT_COL['魚'] = '#6ac8e8';
Object.assign(ITEMS, {
  rod13: { n: '釣竿', key: 1, price: 0, sell: 0, cat: '重要物品', d: '釣魚老伯羅德送的竹釣竿。面向水邊按 A 就能釣魚。' },
  rod13b: { n: '好釣竿', key: 1, price: 0, sell: 0, cat: '重要物品', d: '彈性很好的釣竿。收線時的綠色區域變寬。' },
  rod13c: { n: '大師釣竿', key: 1, price: 0, sell: 0, cat: '重要物品', d: '羅德年輕時用的釣竿。綠色區域更寬，指針也變慢。' },
});
for (const k of FISH_KEYS13) { const [n, w, r, sz, sell] = FISH13[k]; ITEMS[k] = { n, mat: 1, price: 0, sell, cat: '魚', d: FISH_RANK13[r] + '・' + FISH_WATERN13[w] + '的魚。' + (r === 4 ? '傳說中的' + FISH_WATERN13[w] + '之主。' : '') + '可以賣錢。' }; }
// a 16×16 icon drawn from a shape and two colours (outline from the body colour)
function fishIcon13(shape, body, belly, lord) { const c = mkCanvas(16, 16), x = c.getContext('2d'), P = {}, put = (X, Y, col) => { if (X >= 0 && Y >= 0 && X < 16 && Y < 16) P[X + ',' + Y] = col; };
  const dark = shade(body, -0.35), lite = shade(body, 0.25);
  if (shape === 'shrimp') { const C = [[4, 7, 2.2], [6, 6, 2.1], [8, 6, 2], [10, 7, 1.8], [11, 9, 1.5], [11, 11, 1.2], [10, 12, 1]];
    for (const [cx, cy, rr] of C) for (let y = Math.floor(cy - rr); y <= Math.ceil(cy + rr); y++) for (let X = Math.floor(cx - rr); X <= Math.ceil(cx + rr); X++) if ((X - cx) ** 2 + (y - cy) ** 2 <= rr * rr) put(X, y, y <= cy - 1 ? lite : y >= cy + 1 ? belly : body);
    for (const [X, Y] of [[8, 13], [9, 14], [10, 14], [11, 14], [12, 13]]) put(X, Y, body); // the tail fan
    for (const X of [5, 7, 9]) put(X, 9, dark); put(3, 6, '#101018'); for (let i = 0; i < 4; i++) { put(2 - Math.floor(i / 2), 5 - i, dark); put(4 + i, 4 - Math.floor(i / 2) - (i ? 1 : 0), dark); } }
  else if (shape === 'marlin') { for (let X = 3; X <= 12; X++) { const ry = X < 5 || X > 10 ? 1 : 2; for (let y = 8 - ry; y <= 8 + ry; y++) put(X, y, y < 8 ? body : y === 8 ? lite : belly); }
    for (let X = 0; X <= 2; X++) put(X, 8, '#c8d0e0'); for (let X = 5; X <= 9; X++) for (let y = 3 + Math.max(0, X - 7); y <= 5; y++) put(X, y, '#2a4a8a'); // the bill and the sail
    for (let y = 5; y <= 11; y++) { const w = Math.abs(y - 8); if (w <= 3) { put(13, y, body); if (w >= 1) put(14, y, dark); } } put(4, 7, '#101018'); }
  else if (shape === 'octo') { for (let y = 2; y <= 8; y++) for (let X = 4; X <= 11; X++) if ((X - 7.5) ** 2 / 16 + (y - 5.5) ** 2 / 12 <= 1) put(X, y, y < 5 ? lite : body); for (const X of [4, 6, 8, 10, 11]) for (let y = 9; y <= 13; y++) put(X + (y % 2 ? 0 : (X < 8 ? -1 : 1)), y, body); put(6, 5, '#101018'); put(9, 5, '#101018'); }
  else if (shape === 'long') { for (let X = 1; X <= 13; X++) { const Y = 8 + Math.round(Math.sin(X / 2.2) * 1.2); put(X, Y - 1, body); put(X, Y, body); put(X, Y + 1, belly); } put(14, 7, dark); put(14, 9, dark); put(3, 7, '#101018'); }
  else { const flat = shape === 'flat', ry = flat ? 4 : 3; for (let y = 8 - ry; y <= 8 + ry; y++) for (let X = 2; X <= 11; X++) { const d = (X - 6.5) ** 2 / 22 + (y - 8) ** 2 / (ry * ry + 0.5); if (d <= 1) put(X, y, y < 8 ? (y < 7 ? lite : body) : belly); }
    for (let y = 5; y <= 11; y++) { const w = Math.abs(y - 8); if (w <= 3) { put(12, y, body); if (w >= 1) put(13, y, dark); if (w >= 2) put(14, y, dark); } } put(4, 7, '#101018'); put(6, 4 - (flat ? 1 : 0), dark); put(7, 4 - (flat ? 1 : 0), dark); }
  const O = {}; for (const k in P) { const [X, Y] = k.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (X + dx) + ',' + (Y + dy); if (!P[q]) O[q] = 1; } }
  for (const k in O) { const [X, Y] = k.split(',').map(Number); if (X >= 0 && Y >= 0 && X < 16 && Y < 16) P[k] = lord ? '#c89020' : '#141420'; }
  for (const k in P) { const [X, Y] = k.split(',').map(Number); x.fillStyle = P[k]; x.fillRect(X, Y, 1, 1); }
  if (lord) { x.fillStyle = '#fff8c0'; x.fillRect(13, 1, 1, 3); x.fillRect(12, 2, 3, 1); } return c; }
for (const k of FISH_KEYS13) { const F = FISH13[k]; ITEM_ICON[k] = fishIcon13(F[5], F[6][0], F[6][1], F[2] === 4); }
{ const rod = (tip) => { const c = mkCanvas(16, 16), x = c.getContext('2d'); for (let i = 0; i < 12; i++) { x.fillStyle = i < 4 ? '#6a4020' : '#c8a060'; x.fillRect(2 + i, 13 - i, 1, 1); x.fillStyle = '#141420'; x.fillRect(2 + i, 14 - i, 1, 1); } x.fillStyle = '#e8e8f0'; for (let y = 2; y < 11; y++) x.fillRect(14, y, 1, 1); x.fillStyle = tip; x.fillRect(13, 11, 3, 2); return c; };
  ITEM_ICON.rod13 = rod('#e04040'); ITEM_ICON.rod13b = rod('#40a0e0'); ITEM_ICON.rod13c = rod('#f0c040'); }

/* ---------- what bites ---------- */
function fishPick13(mapId, st = Game.st) { const w = fishWater13(mapId); if (!w) return null; const night = typeof dnNight12 === 'function' && dnNight12(st), rod = rodOf13(st);
  let L = FISH_KEYS13.filter(k => { const F = FISH13[k]; if (F[2] === 4) return F[7] === mapId && rod >= 1; if (F[1] !== w) return false; return F[7] !== 'night' || night; });
  if (w === 'lake' || w === 'cave') L = L.concat(['fish13_crucian', 'fish13_minnow']);
  const wt = k => ({ 1: 60, 2: 28, 3: 9, 4: 1.5 })[FISH13[k][2]] / L.filter(q => FISH13[q][2] === FISH13[k][2]).length;
  const treasure = w === 'sea' && chance(0.04); if (treasure) return 'treasure';
  let r = Math.random() * L.reduce((a, k) => a + wt(k), 0); for (const k of L) { r -= wt(k); if (r <= 0) return k; } return L[0]; }
const FISH_DIFF13 = { 1: [2, 36, 2.2], 2: [3, 28, 2.8], 3: [4, 20, 3.4], 4: [5, 16, 4.0], 0: [2, 30, 2.6] }; // rarity → [hits needed, zone px, needle speed]; 0 = treasure

/* ---------- the minigame (a panel over the bottom of the map) ---------- */
function* fishReel13(key) { const st = Game.st, r = key === 'treasure' ? 0 : FISH13[key][2], [need, zone0, sp0] = FISH_DIFF13[r], R = ROD13[Math.max(0, rodOf13(st))];
  const zw = zone0 + R[2], sp = sp0 * R[3], BX = 18, BW = 140; let pos = 0, dir = 1, zx = BX + 20 + Math.random() * (BW - 40 - zw), hits = 0, miss = 0, flash = 0, flashOk = false, t = 0, tapped = false;
  const panel = { draw(x) { drawWin(x, 4, 150, 168, 98, 'menu'); Font.draw(x, '收線！', 12, 154, UIC.warm, UIC.textSh, 12); Font.drawR(x, 'A：在綠色區域裡按', 166, 156, UIC.muted, UIC.textSh, 9);
      // the fish under the water: a shadow that struggles
      const sx = 88 + Math.round(Math.sin(t / 7) * 14), sy = 190 + Math.round(Math.sin(t / 5) * 2); x.fillStyle = 'rgba(40,90,140,0.35)'; x.fillRect(12, 176, 152, 26); x.fillStyle = 'rgba(10,20,40,0.55)';
      const s = r >= 3 ? 1.6 : r === 2 ? 1.2 : 1; x.beginPath(); x.ellipse(sx, sy, 10 * s, 4 * s, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(sx + 9 * s, sy); x.lineTo(sx + 15 * s, sy - 4 * s); x.lineTo(sx + 15 * s, sy + 4 * s); x.fill();
      // the bar
      x.fillStyle = '#262b42'; x.fillRect(BX, 210, BW, 10); x.fillStyle = flash && !flashOk ? '#ff6b7a' : '#3ec070'; x.fillRect(Math.round(zx), 210, Math.round(zw), 10); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(Math.round(zx), 210, Math.round(zw), 1);
      x.strokeStyle = '#05060c'; x.strokeRect(BX - 0.5, 209.5, BW + 1, 11); x.fillStyle = flash && flashOk ? '#ffffff' : '#ffc46b'; x.fillRect(Math.round(BX + pos) - 1, 206, 3, 18);
      // progress and line strain
      for (let i = 0; i < need; i++) { x.fillStyle = i < hits ? '#6ee7d2' : '#3a4262'; x.fillRect(14 + i * 9, 230, 7, 7); }
      Font.drawR(x, '釣線', 132, 228, UIC.muted, UIC.textSh, 9); for (let i = 0; i < 3; i++) { x.fillStyle = i < 3 - miss ? '#e8e0c8' : '#ff6b7a'; x.fillRect(136 + i * 10, 230, 7, 7); }
      if (typeof touchRegion === 'function') touchRegion(0, 140, W, 116, () => { tapped = true; }); } };
  UI.push(panel); Input.clearAll();
  try { while (true) { t++; panel.s = { pos: BX + pos, zx, zw }; pos += dir * sp; if (pos >= BW) { pos = BW; dir = -1; } if (pos <= 0) { pos = 0; dir = 1; } if (flash) flash--;
      if (Input.pressed('a') || tapped) { tapped = false; Input.consume('a'); const X = BX + pos;
        if (X >= zx && X <= zx + zw) { hits++; flash = 8; flashOk = true; Sound.sfx('select'); if (hits >= need) { yield* wait(10); return true; } zx = BX + 6 + Math.random() * (BW - 12 - zw); }
        else { miss++; flash = 10; flashOk = false; Sound.sfx('bump'); if (miss >= 3) { yield* wait(10); return false; } } }
      yield; } } finally { UI.remove(panel); } }
// the bobber on the water tile the hero faces
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); const b = this.bob13; if (!b || !this.map || this.map.id !== b.map) return;
    const z = this._zc ? ZOOM_F : 1; let sx = b.x * 16 + 8 - this.camX, sy = b.y * 16 + 9 - this.camY; if (this._zc) { sx = this._zc[0] + (sx - this._zc[0]) * z; sy = this._zc[1] + (sy - this._zc[1]) * z; }
    const dip = b.bite ? 2 : Math.round(Math.sin(this.t / 9)), X = Math.round(sx), Y = Math.round(sy) + dip;
    x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(X - 4, Y + 3, 9, 1); x.fillStyle = '#141420'; x.fillRect(X - 2, Y - 3, 5, 6); x.fillStyle = '#e83a3a'; x.fillRect(X - 1, Y - 2, 3, 2); x.fillStyle = '#f8f8f8'; x.fillRect(X - 1, Y, 3, 2);
    if (b.bite) { x.fillStyle = '#ffc46b'; Font.drawC(x, '！', X, Y - 16, '#ffc46b', '#101018', 12); } }; }

function* fishCast13(ow, tx, ty) { const st = Game.st, p = ow.p;
  if (LAVA13.has(ow.map.id) || ow.map.d.theme === 'lava') { yield* say('這是岩漿……魚不可能住在這種地方。'); return; }
  const w = fishWater13(ow.map.id); if (!w) { yield* say('這裡的水好像沒有魚。'); return; }
  ow.bob13 = { map: ow.map.id, x: tx, y: ty, bite: false }; Sound.sfx('wind'); Input.clearAll();
  try { const wait0 = 50 + Math.floor(Math.random() * 110);
    for (let i = 0; i < wait0; i++) { const A = Input.pressed('a'), B = Input.pressed('b'); if (A || B) { Input.consume('a', 'b'); ow.bob13 = null; yield* say(B ? '收起了釣竿。' : '拉得太早了……什麼也沒釣到。'); return; } yield; }
    ow.bob13.bite = true; Sound.sfx('exclaim'); let hooked = false; for (let i = 0; i < 34; i++) { if (Input.pressed('a')) { Input.consume('a'); hooked = true; break; } yield; }
    if (!hooked) { ow.bob13 = null; yield* say('浮標彈了回來……魚跑掉了。'); return; }
    const key = fishPick13(ow.map.id, st); ow.bob13.bite = false; const ok = yield* fishReel13(key); ow.bob13 = null;
    if (!ok) { yield* say(key !== 'treasure' && FISH13[key][2] >= 3 ? '「噗通！」好大的影子……釣線斷了，跑掉了！' : '釣線一鬆……魚跑掉了。'); return; }
    if (key === 'treasure') { Sound.jingle('item'); const r = Math.random(); if (r < 0.45) { const g = 2000 + Math.floor(Math.random() * 3001); st.money += g; yield* itemGet('釣到了沉船寶箱！裡面有 ' + g + ' G！'); }
      else { const it = r < 0.7 ? 'megaPotion' : r < 0.88 ? 'elixir' : 'starDust'; st.bag[it] = (st.bag[it] || 0) + 1; yield* itemGet('釣到了沉船寶箱！裡面有' + ITEMS[it].n + '！'); } return; }
    const F = FISH13[key], [lo, hi] = F[3], skew = Math.pow(Math.random(), 1.8), size = Math.round((lo + (hi - lo) * skew) * 10) / 10, S = fishSt13(st), rec = S[key] || (S[key] = { n: 0, best: 0 }), first = !rec.n, best = size > rec.best;
    rec.n++; if (best) rec.best = size; st.bag[key] = (st.bag[key] || 0) + 1; st.fishN13 = (st.fishN13 || 0) + 1;
    if (F[2] >= 3) Sound.jingle('item'); else Sound.sfx('item');
    yield* itemGet('釣到了' + F[0] + '！（' + size + ' cm）' + (first ? '\n（第一次釣到！）' : best ? '\n（新紀錄！）' : '') + (F[2] === 4 ? '\n這就是傳說中的' + FISH_WATERN13[F[1]] + '之主……！' : ''));
  } finally { ow.bob13 = null; } }
// facing water with a rod → cast (anything else on that side keeps going first)
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const p = this.p, [dx, dy] = DIRS[p.dir], tx = p.x + dx, ty = p.y + dy;
    if (rodOf13(this.st) >= 0 && this.tileAt(tx, ty) === 'W' && !this.entityAt(tx, ty, p) && !this.script) { const r = _in.call(this); if (r || this.script) return r; this.run(fishCast13(this, tx, ty)); return true; }
    return _in.call(this); }; }

/* ---------- 釣魚老伯 羅德 ---------- */
const FISH_PRIZE13 = [[5, '好釣竿＋2000 G'], [10, '力量果實・體力果實'], [15, '大師釣竿＋5000 G'], [20, '稱號「釣魚名人」'], [24, '海神的鱗片']];
GEAR.seaGodScale13 = { n: '海神的鱗片', slot: 'acc', t: 7, st: { hp: 25, atk: 5, spa: 5, def: 5, spd: 5 }, sp: {}, fx: ['fortune'], trait: 'fortune', kind: '飾品', d: '羅德一輩子只見過一次的、海神掉下來的鱗片。據說能帶來好運。', look: (GEAR.qHeroCrest || {}).look };
if (ACC_TRAIT.fortune) ACC_TRAIT.fortune[2] = (ACC_TRAIT.fortune[2] || []).concat(['海神的鱗片']); if (typeof BP_RARE !== 'undefined') BP_RARE.add('seaGodScale13');
function fishLines13(st = Game.st) { const L = [], S = fishSt13(st), H = t => L.push([t, UIC.accent, 10, 0]);
  L.push(['釣到的種類：' + fishKinds13(st) + '／' + FISH_KEYS13.length + '　總共釣了 ' + (st.fishN13 || 0) + ' 條', UIC.warm, 10, 0]);
  for (const w of Object.keys(FISH_WATERN13)) { H('【' + FISH_WATERN13[w] + '】'); for (const k of FISH_KEYS13.filter(q => FISH13[q][1] === w)) { const F = FISH13[k], r = S[k];
      L.push([r ? F[0] + '　最大 ' + r.best + ' cm（' + r.n + ' 條）' : '？？？' + (F[2] === 4 ? '（' + (MAPS[F[7]] || {}).name + '的主）' : F[7] === 'night' ? '（晚上）' : ''), r ? (F[2] >= 3 ? UIC.warm : UIC.text) : UIC.dis, 10, 6]); } }
  return L; }
Events.rod13 = function* () { const st = Game.st, f = st.flags;
  if (rodOf13(st) < 0) { yield* sayAll(['釣魚老伯羅德：「年輕人，喜歡釣魚嗎？」', '羅德：「這把竹釣竿送你吧。我年紀大了，一把就夠用了。」']);
    st.bag.rod13 = 1; Sound.jingle('item'); yield* itemGet(st.name + '得到了「釣竿」！');
    yield* sayAll(['羅德：「面向水邊按 A 拋竿。浮標一沉下去，馬上按 A！」', '羅德：「接著指針會來回擺，在綠色的地方按下去才收得了線。按錯三次，線就斷了。」', '羅德：「河、湖、沼澤、雪原、海……每個地方的魚都不一樣。晚上還有晚上才出來的傢伙。」', '羅德：「釣到新的魚就拿來給我看看。種類多了，我有好東西給你。」']); return; }
  const n = fishKinds13(st), got = st.fish13r || (st.fish13r = {});
  for (const [need, what] of FISH_PRIZE13) { if (n < need || got[need]) continue; got[need] = 1; Sound.jingle('item');
    if (need === 5) { st.bag.rod13b = 1; st.money += 2000; yield* say('羅德：「' + n + ' 種了？不錯嘛！這把好釣竿給你，收線會輕鬆很多。」'); yield* itemGet('得到了「好釣竿」和 2000 G！\n（各地的水域之主也會上鉤了）'); }
    else if (need === 10) { st.bag.powerFruit = (st.bag.powerFruit || 0) + 1; st.bag.vitFruit = (st.bag.vitFruit || 0) + 1; yield* say('羅德：「十種！比我兒子還厲害。這個拿去補補身體。」'); yield* itemGet('得到了力量果實和體力果實！'); }
    else if (need === 15) { st.bag.rod13c = 1; st.money += 5000; yield* say('羅德：「……這把是我年輕時的大師釣竿。交給你了。」'); yield* itemGet('得到了「大師釣竿」和 5000 G！'); }
    else if (need === 20) { yield* say('羅德：「二十種……你已經是釣魚名人了！」'); yield* say('得到了稱號「釣魚名人」！\n（可以在「稱號」裡裝備）'); }
    else if (need === 24) { const g = makeGear('seaGodScale13', 5); yield* sayAll(['羅德：「……全部？連五個水域之主都釣到了？」', '羅德：「這片鱗片，是我年輕的時候在海上撿到的。我一直在等一個配得上它的釣手。」']); yield* itemGet('得到了' + gearName(g) + '！'); } }
  const nx = FISH_PRIZE13.find(q => !got[q[0]]);
  const r = yield* ask('羅德：「釣到 ' + n + ' 種了。」' + (nx ? '\n（' + nx[0] + ' 種：' + nx[1] + '）' : ''), ['看看釣魚紀錄', '有什麼訣竅？', '沒事']);
  if (r === 0) yield* listScreen9('釣魚紀錄', fishLines13(st));
  else if (r === 1) yield* sayAll(['羅德：「稀有的魚，綠色的地方很窄，指針也快。別急，看準了再按。」', '羅德：「月光魚和瘴氣燈籠魚只在晚上出來。」', '羅德：「各地的水域之主，要有好釣竿才釣得到。碧溪谷、銀月湖、幽光沼澤、冰晶洞窟、珊瑚海岸……」']); };
MAPS.town.npcs.push({ id: 'rod13', x: 2, y: 19, dir: 'up', look: 'fisher13', name: '釣魚老伯羅德' }); delete mapCache.town;
NPC_ROLES.任務.push('rod13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.rod13 = '萌芽鎮・池塘邊';
// the handbook gets a 釣魚紀錄 page once you have a rod (same menu as 10zzx_v12_r9a_gear, one more line)
handbookScreen12 = function* () { let hi = 0;
  while (true) { const late = (Game.st.flags.ch2 || 0) >= 10, fish = rodOf13() >= 0, opts = ['任務', '圖鑑', '紀錄', '變強的方法', '效果一覽'].concat(fish ? ['釣魚紀錄'] : []).concat(late ? ['還能做什麼'] : []).concat(['返回']);
    const r = yield* ask('冒險手冊', opts, { index: hi }), o = opts[r]; hi = Math.max(0, r); // v12.66: the cursor stays on the page you came back from
    if (o === '任務') yield* questScreen(); else if (o === '圖鑑') yield* dexScreen(); else if (o === '紀錄') yield* recordScreen();
    else if (o === '變強的方法') { const G = typeof growList12 === 'function' ? growList12() : GROW12; while (true) { const k = yield* ask('變強的方法', G.map(q => q[0]).concat('返回')); if (k < 0 || k >= G.length) break; yield* say(G[k][1]); } }
    else if (o === '效果一覽') yield* listScreen9('效果一覽', effectLines9());
    else if (o === '釣魚紀錄') yield* listScreen9('釣魚紀錄', fishLines13());
    else if (o === '還能做什麼') yield* todoScreen12(false); else break; } };
TITLES.push({ id: 'fish13master', n: '釣魚名人', d: '釣到 20 種魚。', st: { spe: 2, crit: 2 }, ok: st => fishKinds13(st) >= 20 });
ACHIEVEMENTS.push({ id: 'fish13_first', n: '第一條魚', d: '第一次釣到魚。', cat: '探索', ok: st => (st.fishN13 || 0) >= 1 },
  { id: 'fish13_all', n: '釣盡天下', d: '釣到全部 24 種魚。', cat: '探索', ok: st => fishKinds13(st) >= FISH_KEYS13.length });
GROW12.push(['釣魚', '萌芽鎮池塘邊的釣魚老伯羅德會送你釣竿。面向水邊按 A 拋竿，浮標沉下去時按 A，再在綠色區域裡按 A 收線。釣到的魚可以賣錢，種類多了可以找羅德換獎勵。']);

/* ---------- where the new monsters live (the bestiary and the quest pages look at fixed map tables, these appear by script) ---------- */
{ const _sm = spawnMaps; spawnMaps = function (sp) { const L = _sm(sp);
    if (typeof ABY_MON13 !== 'undefined' && (ABY_MON13[sp] || sp === ABY_LORD13)) L.push(sp === ABY_LORD13 ? '裂界深淵 30F' : '裂界深淵');
    if (typeof BOUNTY13 !== 'undefined' && BOUNTY13[sp]) L.push(mapNm(BOUNTY13[sp][5]) + '（公會懸賞）');
    return [...new Set(L)]; }; }
