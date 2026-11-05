/* ===================== v12.155 GBA 構圖的戰鬥背景（第一章 12 張）＋同材質底座 =====================
   玩家 2026-11-05：「底下圓盤建議跟背景圖統一 所以背景圖有些要重畫」→ Claude 程式重畫、底座跟地面同材質、先做第一章。
   · 舊背景是「一條路往畫面中間延伸」，跟 GBA 構圖（魔物在右上、主角在左下）對不上；新背景地平線拉高，下面整片是可以站的地面。
   · 每張都是 176×218 的像素畫，天空留給 13zz_sky21 畫（會跟時間・天氣變）；HD-2D 的景深・光線照舊套在上面。
   · 底座：魔物和主角腳下各一個，材質跟那張背景的地面一樣（草地＝草丘、遺跡＝石板、礦坑＝碎石……）。 */
const BG26 = { field: 26, meadow: 28, dusk: 30, ruinsOut: 30, forest: 0, glade: 0, mushwood: 0 }; // 天空的地平線（13zz_sky21）
for (const k of ['field', 'meadow', 'dusk', 'ruinsOut']) SKY21_HOR[k] = BG26[k];
{ const P26 = {};
  const mk = (kind, f) => { P26[kind] = f; };
  // ---- 小工具 ----
  const T = (x, r) => ({
    grad(y0, y1, stops) { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, c]) => g.addColorStop(t, c)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); },
    glow(X, Y, R, rgb, a) { const g = x.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(X - R, Y - R, R * 2, R * 2); },
    // 地面：遠處淡、近處深，一條一條水平的色帶（像素風的透視）
    ground(y0, far, near, jit = 6) { const a = hex2rgb(far), b = hex2rgb(near); for (let y = y0; y < BH; y++) { const t = Math.pow((y - y0) / (BH - y0), 0.8), j = (r() - 0.5) * jit * (y % 3 === 0 ? 1 : 0.3);
        x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t) + j)},${Math.round(lerp(a[1], b[1], t) + j)},${Math.round(lerp(a[2], b[2], t) + j)})`; x.fillRect(0, y, W, 1); } },
    // 山・樹林的剪影（從左到右起伏）
    ridge(yb, amp, step, col, seed = 1) { const pts = [[0, BH], [0, yb]]; let y = yb; for (let X = 0; X <= W + step; X += step) { y = yb - amp * (0.5 + 0.5 * Math.sin(X * 0.045 * seed + seed)) - r() * amp * 0.4; pts.push([Math.min(W, X), Math.round(y)]); } pts.push([W, BH]); pxPoly(x, pts, col); },
    // 草：越下面越大
    tufts(y0, y1, cols, n) { for (let i = 0; i < n; i++) { const py = y0 + Math.floor(Math.pow(r(), 0.7) * (y1 - y0)), px = Math.floor(r() * W), s = 1 + Math.floor((py - y0) / 55); x.fillStyle = cols[i % cols.length]; x.fillRect(px, py, 1, s + 1); x.fillRect(px + 1 + (s > 1 ? 1 : 0), py - 1, 1, s + 1); if (s > 1) x.fillRect(px - 1, py + 1, 1, s); } },
    dots(y0, y1, cols, n, sz = 1) { for (let i = 0; i < n; i++) { const py = y0 + Math.floor(Math.pow(r(), 0.8) * (y1 - y0)), px = Math.floor(r() * W), s = sz + (py > (y0 + y1) / 2 ? 1 : 0); x.fillStyle = cols[i % cols.length]; x.fillRect(px, py, s, s); } },
    // 遠方的小樹（一排）
    trees(yb, n, cols, hmin = 6, hmax = 12) { for (let i = 0; i < n; i++) { const X = Math.floor(r() * W), h = hmin + Math.floor(r() * (hmax - hmin)), w = Math.max(3, Math.round(h * 0.6)); x.fillStyle = cols[2]; x.fillRect(X, yb - 2, 1, 3); pxEllipse(x, X, yb - h / 2 - 1, w / 2, h / 2, cols[0]); pxEllipse(x, X - 1, yb - h / 2 - 2, w / 2 - 1, h / 2 - 1, cols[1]); } },
    // 石磚牆
    bricks(y0, y1, a, b, line, bw = 14, bh = 7) { for (let y = y0, row = 0; y < y1; y += bh, row++) for (let i = (row % 2) * (bw / 2) - bw; i < W; i += bw) { x.fillStyle = r() < 0.5 ? a : b; x.fillRect(i + 1, y + 1, bw - 2, Math.min(bh, y1 - y) - 2); x.fillStyle = line; x.fillRect(i, y, bw, 1); x.fillRect(i, y, 1, Math.min(bh, y1 - y)); } },
    // 地板磚（往遠處縮小，線往中間集中）
    tiles(y0, a, b, line, vx = W / 2) { for (let y = y0, k = 0; y < BH; k++) { const h = 3 + Math.floor(k * 1.6); for (let X = 0; X < W; X++) { const u = (X - vx) / (1 + (y - y0) / 28), cell = Math.floor(u / 10); x.fillStyle = (cell + k) % 2 ? a : b; x.fillRect(X, y, 1, h); }
        x.fillStyle = line; x.fillRect(0, y, W, 1); y += h; }
      for (let i = -12; i <= 12; i++) { const xb = vx + i * 10 * (1 + (BH - y0) / 28), xt = vx + i * 10; pxLine(x, Math.round(xt), y0, Math.round(xb), BH, line); } },
    pillar(X, Y, w, h, c, hi, sh) { x.fillStyle = c; x.fillRect(X, Y, w, h); x.fillStyle = hi; x.fillRect(X + 1, Y, 2, h); x.fillStyle = sh; x.fillRect(X + w - 2, Y, 2, h); x.fillStyle = sh; x.fillRect(X - 1, Y, w + 2, 2); x.fillRect(X - 1, Y + h - 2, w + 2, 2); },
    torch(X, Y) { x.fillStyle = '#4a3020'; x.fillRect(X - 1, Y, 2, 6); x.fillStyle = '#ffb040'; x.fillRect(X - 1, Y - 3, 3, 3); x.fillStyle = '#fff0a0'; x.fillRect(X, Y - 2, 1, 1); },
  });
  // ---- 第一章 ----
  mk('field', (x, t, r) => { if (!SKY21.cut) { t.grad(0, 30, [[0, '#8ccaf0'], [1, '#e2f2f4']]); }
    t.ridge(24, 7, 10, '#9cc4b0', 1.3); t.ridge(28, 5, 8, '#86b890', 2.1); t.trees(30, 14, ['#4a8a50', '#5ea060', '#3a5a34'], 4, 8);
    t.ground(30, '#a8d488', '#3f7c38'); t.tufts(34, BH, ['#c4e8a0', '#5a9a4a', '#8ccc6c'], 170); t.dots(40, BH, ['#fff6c0', '#ffffff', '#ffd0e0'], 26); });
  mk('meadow', (x, t, r) => { if (!SKY21.cut) { t.grad(0, 32, [[0, '#8ccaf0'], [1, '#f2f6e8']]); }
    t.ridge(26, 8, 10, '#b4d8a0', 1.1); t.ridge(31, 5, 8, '#98c884', 2.3);
    x.fillStyle = '#e8e0d0'; x.fillRect(132, 10, 5, 13); pxPoly(x, [[131, 10], [134, 6], [138, 10]], '#b05a40'); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; pxLine(x, 134, 9, Math.round(134 + Math.cos(a) * 9), Math.round(9 + Math.sin(a) * 9), '#6a5a4a'); }
    t.ground(32, '#9cd87c', '#3f7c38'); t.tufts(36, BH, ['#b4e494', '#5a9a4a'], 140); t.dots(36, BH, ['#ff8ab0', '#ffe060', '#ffffff', '#c8a0ff', '#ff7050'], 170); });
  mk('dusk', (x, t, r) => { if (!SKY21.cut) { t.grad(0, 34, [[0, '#4a3a78'], [0.55, '#e07a6a'], [1, '#ffc880']]); t.glow(140, 30, 26, '255,210,140', 0.8); pxEllipse(x, 140, 30, 6, 6, '#fff0c0'); }
    t.ridge(28, 8, 10, '#6a4a6a', 1.7); t.ridge(32, 4, 7, '#8a5a50', 2.5);
    for (let X = 4; X < W; X += 22) { x.fillStyle = '#5a3a28'; x.fillRect(X, 30, 2, 8); } x.fillStyle = '#6a4a30'; x.fillRect(0, 32, W, 1);
    t.ground(36, '#d8b060', '#6a6a2c'); t.tufts(38, BH, ['#f0d080', '#9a8a3a', '#c8a050'], 150); });
  mk('forest', (x, t, r) => { t.grad(0, 60, [[0, '#14281c'], [1, '#2a4a30']]);
    for (let i = 0; i < 11; i++) { const X = Math.floor(i * 17 + r() * 8), w = 6 + Math.floor(r() * 6); x.fillStyle = '#2e2418'; x.fillRect(X, 0, w, 54); x.fillStyle = '#4a3a26'; x.fillRect(X + 1, 0, 2, 54); }
    for (let i = 0; i < 40; i++) pxEllipse(x, Math.floor(r() * W), Math.floor(r() * 18), 6 + Math.floor(r() * 6), 4 + Math.floor(r() * 3), r() < 0.5 ? '#1e3a22' : '#2a5030');
    t.ground(50, '#5a7a3c', '#2c4422'); t.tufts(52, BH, ['#7aa050', '#3a5a2a', '#5a8040'], 150); t.dots(54, BH, ['#a07a40', '#7a5a2a', '#c09050'], 70); });
  mk('glade', (x, t, r) => { t.grad(0, 56, [[0, '#2a5a3a'], [1, '#6aa070']]);
    for (let i = 0; i < 8; i++) { const X = Math.floor(i * 23 + r() * 10), w = 5 + Math.floor(r() * 5); x.fillStyle = '#4a3a28'; x.fillRect(X, 0, w, 48); x.fillStyle = '#6a5438'; x.fillRect(X + 1, 0, 2, 48); }
    for (let i = 0; i < 30; i++) pxEllipse(x, Math.floor(r() * W), Math.floor(r() * 14), 7, 4, r() < 0.5 ? '#3a7a40' : '#4e9a4e');
    t.ground(46, '#b0d880', '#4a8a3a'); t.tufts(48, BH, ['#d0f0a0', '#6aa84a'], 160); t.dots(48, BH, ['#fff6a0', '#ffffff'], 40);
    for (let i = 0; i < 4; i++) { const X = 20 + i * 42 + Math.floor(r() * 10); x.save(); x.globalAlpha = 0.18; x.fillStyle = '#fff8d0'; pxPoly(x, [[X, 0], [X + 10, 0], [X + 26, BH], [X + 12, BH]], '#fff8d0'); x.restore(); } });
  mk('mushwood', (x, t, r) => { t.grad(0, 60, [[0, '#0e1a26'], [1, '#1c3040']]);
    for (let i = 0; i < 10; i++) { const X = Math.floor(i * 18 + r() * 8), w = 6 + Math.floor(r() * 5); x.fillStyle = '#1c1a22'; x.fillRect(X, 0, w, 52); x.fillStyle = '#2c2834'; x.fillRect(X + 1, 0, 2, 52); }
    for (let i = 0; i < 34; i++) pxEllipse(x, Math.floor(r() * W), Math.floor(r() * 16), 6, 4, r() < 0.5 ? '#14281e' : '#1e3a2a');
    t.ground(48, '#2e4a3c', '#14241c'); t.tufts(50, BH, ['#3a6a4a', '#1e3a2a'], 120);
    for (let i = 0; i < 16; i++) { const X = Math.floor(r() * W), Y = 52 + Math.floor(Math.pow(r(), 0.7) * (BH - 56)), s = 1 + Math.floor((Y - 50) / 60), c = r() < 0.5 ? ['#40e0e0', '#a0fff8'] : ['#ff70c0', '#ffc0e8'];
      t.glow(X, Y - s, 6 + s * 3, c === null ? '' : (c[0] === '#40e0e0' ? '64,224,224' : '255,112,192'), 0.35); x.fillStyle = '#d8d0c0'; x.fillRect(X, Y - s, 1, s + 1); pxEllipse(x, X, Y - s - 1, 1 + s, 1 + Math.floor(s / 2), c[0]); x.fillStyle = c[1]; x.fillRect(X - s + 1, Y - s - 2, 1, 1); } });
  mk('ruins', (x, t, r) => { t.grad(0, 52, [[0, '#2a2430'], [1, '#4a4048']]); t.bricks(0, 50, '#5a5058', '#4e4650', '#2a2430', 16, 8);
    for (const X of [14, 70, 126]) t.pillar(X, 0, 14, 50, '#7a7068', '#9a9088', '#4a4240');
    for (const X of [46, 104, 160]) { t.torch(X, 22); t.glow(X, 20, 22, '255,170,80', 0.45); }
    t.tiles(50, '#7a7064', '#6a6058', '#3a3430'); t.dots(52, BH, ['#5a524a', '#8a8070'], 60); });
  mk('ruinsOut', (x, t, r) => { if (!SKY21.cut) t.grad(0, 34, [[0, '#4a4a68'], [1, '#9a98a8']]);
    t.ridge(30, 6, 9, '#6a6a7a', 1.6);
    for (const [X, h] of [[16, 22], [40, 14], [118, 26], [150, 12]]) { t.pillar(X, 34 - h, 9, h, '#a8a090', '#c8c0b0', '#6a6458'); x.fillStyle = '#8a8274'; x.fillRect(X - 2, 34 - h - 2, 13, 2); }
    t.ground(34, '#b0a890', '#5a5444'); t.tiles(40, '#9a9280', '#8a8270', '#5a5444'); t.tufts(44, BH, ['#7a9a5a', '#5a7a3a'], 70); });
  mk('mine', (x, t, r) => { t.grad(0, 52, [[0, '#1a140e'], [1, '#3a2c20']]); t.dots(0, 50, ['#4a3a2a', '#2a2018', '#5a4834'], 220, 2);
    for (const X of [8, 64, 120, 168]) { x.fillStyle = '#5a3c1e'; x.fillRect(X, 0, 5, 50); x.fillStyle = '#7a5428'; x.fillRect(X + 1, 0, 1, 50); } x.fillStyle = '#5a3c1e'; x.fillRect(0, 4, W, 4); x.fillStyle = '#7a5428'; x.fillRect(0, 4, W, 1);
    for (const X of [36, 146]) { x.fillStyle = '#3a3030'; x.fillRect(X - 2, 12, 5, 6); x.fillStyle = '#ffd070'; x.fillRect(X - 1, 13, 3, 4); t.glow(X, 15, 20, '255,190,90', 0.4); }
    t.ground(50, '#7a6450', '#3a2c20'); t.dots(52, BH, ['#9a8268', '#5a4634', '#b0987a'], 220, 1); });
  mk('crystalCave', (x, t, r) => { t.grad(0, 54, [[0, '#0c0a1e'], [1, '#22203c']]); t.dots(0, 52, ['#2a2848', '#18162c'], 200, 2);
    const cry = (X, Y, h, c1, c2) => { pxPoly(x, [[X, Y], [X + 2, Y - h], [X + 4, Y]], c1); x.fillStyle = c2; x.fillRect(X + 2, Y - h + 2, 1, h - 3); };
    for (let i = 0; i < 12; i++) { const X = Math.floor(r() * W), Y = 30 + Math.floor(r() * 22), h = 6 + Math.floor(r() * 10), c = r() < 0.5; t.glow(X + 2, Y - h / 2, 14, c ? '120,220,255' : '200,140,255', 0.3); cry(X, Y, h, c ? '#60c8f0' : '#b080f0', c ? '#d0f4ff' : '#ecd8ff'); }
    t.ground(52, '#4a4660', '#1c1a2c'); t.dots(54, BH, ['#5a5674', '#2e2c42'], 160, 1);
    for (let i = 0; i < 8; i++) { const X = Math.floor(r() * W), Y = 70 + Math.floor(r() * (BH - 80)); cry(X, Y, 4 + Math.floor(r() * 4), r() < 0.5 ? '#60c8f0' : '#b080f0', '#ffffff'); } });
  mk('sewer', (x, t, r) => { t.grad(0, 52, [[0, '#1a2420'], [1, '#2e3a34']]); t.bricks(0, 40, '#4a5450', '#3e4844', '#1e2624', 14, 7);
    x.fillStyle = '#12181a'; pxEllipse(x, 88, 40, 26, 22, '#10161a'); x.fillRect(62, 40, 53, 4);
    x.fillStyle = '#2a4a50'; x.fillRect(0, 40, W, 6); x.fillStyle = '#4a7a80'; for (let X = 0; X < W; X += 7) x.fillRect(X + (Math.floor(X / 7) % 2) * 3, 42, 3, 1);
    t.ground(46, '#5a6662', '#28322e'); t.tiles(46, '#56625e', '#4a5652', '#2a3430'); t.dots(48, BH, ['#6a8a80', '#3a4a46'], 50); });
  mk('catacomb', (x, t, r) => { t.grad(0, 52, [[0, '#1a1614'], [1, '#34302a']]); t.bricks(0, 48, '#4a4440', '#3e3834', '#1e1a18', 12, 7);
    for (let i = 0; i < 6; i++) { const X = 8 + i * 28, Y = 12; x.fillStyle = '#16120e'; x.fillRect(X, Y, 14, 10); x.fillStyle = '#d8d0b8'; pxEllipse(x, X + 7, Y + 6, 3, 3, '#d8d0b8'); x.fillStyle = '#16120e'; x.fillRect(X + 5, Y + 5, 1, 2); x.fillRect(X + 8, Y + 5, 1, 2); }
    for (const X of [22, 88, 154]) { x.fillStyle = '#e8e0c8'; x.fillRect(X, 36, 2, 5); x.fillStyle = '#ffc860'; x.fillRect(X, 34, 2, 2); t.glow(X + 1, 34, 14, '255,190,100', 0.4); }
    t.tiles(48, '#6a625a', '#5a524a', '#2a2420'); t.dots(52, BH, ['#cfc4ae', '#8a8070'], 26, 1); });
  const _bb = buildBattleBG; buildBattleBG = function (kind) { if (!GBA26.on || !P26[kind]) return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(911 + Object.keys(P26).indexOf(kind) * 13); x.imageSmoothingEnabled = false;
    P26[kind](x, T(x, r), r); c.kind = kind; return c; };
  window.BG26_KINDS = Object.keys(P26); }

/* ---------- 底座 ---------- */
const PLAT26 = {
  grass: { top: '#7cc060', hi: '#a8dc80', lo: '#5a9a44', side: '#7a5a38', sideD: '#5a4028', line: '#2e4a1c', bits: ['#b8e890', '#4a8a3a'] },
  dusk: { top: '#c8a850', hi: '#e8cc78', lo: '#9a8038', side: '#6a4a2c', sideD: '#4a3420', line: '#3a2a14', bits: ['#f0d888', '#8a7030'] },
  moss: { top: '#5a8a44', hi: '#80b05a', lo: '#3e6a30', side: '#4a3a2a', sideD: '#33281c', line: '#1e2a14', bits: ['#9ac070', '#a07a40'] },
  glow: { top: '#3a6a50', hi: '#5a9a70', lo: '#24443a', side: '#2a2a34', sideD: '#1c1c24', line: '#0e1a14', bits: ['#60f0e0', '#ff90d0'] },
  stone: { top: '#a8a094', hi: '#cac4b8', lo: '#86807a', side: '#6a645c', sideD: '#4c4842', line: '#2a2624', bits: ['#d8d2c4', '#7a746a'], slab: 1 },
  rock: { top: '#8a7660', hi: '#ac9a80', lo: '#6a5846', side: '#4a3c30', sideD: '#342a22', line: '#1e1812', bits: ['#c0aa8a', '#5a4a3a'] },
  crystal: { top: '#5a5674', hi: '#7a76a0', lo: '#403c58', side: '#2e2c42', sideD: '#201e30', line: '#100e1c', bits: ['#80e0ff', '#c8a0ff'] },
  wet: { top: '#64746e', hi: '#8aa098', lo: '#4a5854', side: '#3a4642', sideD: '#2a3430', line: '#141c1a', bits: ['#a8d0c8', '#4a5a56'], slab: 1 },
  bone: { top: '#9c9280', hi: '#c4baa4', lo: '#7a7262', side: '#5a5246', sideD: '#423c34', line: '#221e1a', bits: ['#e0d8c0', '#6a6252'], slab: 1 },
  sand: { top: '#e0c890', hi: '#f4e0b0', lo: '#c0a470', side: '#a08050', sideD: '#7a6038', line: '#4a3820', bits: ['#fff0c8', '#b09060'] },
  snow: { top: '#e8f0f8', hi: '#ffffff', lo: '#c8d4e4', side: '#8a9ab0', sideD: '#6a7a90', line: '#3a4458', bits: ['#ffffff', '#b0c0d8'] },
  wood: { top: '#a07040', hi: '#c08a50', lo: '#7a5430', side: '#5a3c22', sideD: '#40281a', line: '#24160c', bits: ['#d0a060', '#6a4626'], plank: 1 } };
const PLAT26_OF = { field: 'grass', meadow: 'grass', glade: 'grass', lake: 'grass', plainsGold: 'dusk', dusk: 'dusk', forest: 'moss', mushwood: 'glow', swamp: 'moss',
  ruins: 'stone', ruinsOut: 'stone', tower: 'stone', fortress: 'stone', star: 'stone', rift: 'stone', arena13: 'stone',
  mine: 'rock', canyon: 'sand', volcano: 'rock', volcanoRim: 'rock', lava: 'rock', crystalCave: 'crystal', iceCave: 'snow', snow: 'snow', snowPeak: 'snow',
  sewer: 'wet', seacave13: 'wet', catacomb: 'bone', beach13: 'sand', deck14: 'wood' };
function platMat26(kind) { return PLAT26[PLAT26_OF[kind] || 'grass']; }
// 一個像素畫的底座：上面是橢圓（材質＋亮邊），下面一圈側面
function drawPlat26(x, M, cx, foot, w, b) { const rx = Math.round(w / 2), ry = Math.max(4, Math.round(w * 0.13)), sideH = Math.max(2, Math.round(ry * 0.45)), key = 'p26:' + (PLAT26_OF[b && b.cfgBg] || 'grass') + ':' + rx;
  const C = drawPlat26.cache || (drawPlat26.cache = {}); let cv = C[key];
  if (!cv) { cv = C[key] = mkCanvas(rx * 2 + 4, ry * 2 + sideH + 5); const g = cv.getContext('2d'), ox = rx + 2, oy = ry + 2, r = srand(rx * 7 + 3);
    pxEllipse(g, ox, oy + sideH + 1, rx + 1, ry + 1, M.line); pxEllipse(g, ox, oy + sideH, rx, ry, M.sideD); for (let k = sideH - 1; k >= 1; k--) pxEllipse(g, ox, oy + k, rx, ry, M.side);
    pxEllipse(g, ox, oy, rx + 1, ry + 1, M.line); pxEllipse(g, ox, oy, rx, ry, M.lo); pxEllipse(g, ox, oy - 1, rx - 1, ry - 1, M.top); pxEllipse(g, ox - Math.round(rx * 0.15), oy - Math.round(ry * 0.35), Math.round(rx * 0.55), Math.max(1, Math.round(ry * 0.4)), M.hi);
    const inE = (X, Y) => ((X - ox) / rx) ** 2 + ((Y - oy) / ry) ** 2 < 0.8;
    if (M.slab) for (let k = -3; k <= 3; k++) { const X = ox + k * Math.round(rx / 3.2); for (let Y = oy - ry; Y <= oy + ry; Y++) if (inE(X, Y)) { g.fillStyle = M.lo; g.fillRect(X, Y, 1, 1); } }
    if (M.plank) for (let Y = oy - ry + 2; Y < oy + ry; Y += 3) for (let X = ox - rx; X < ox + rx; X++) if (inE(X, Y)) { g.fillStyle = M.lo; g.fillRect(X, Y, 1, 1); }
    for (let i = 0; i < rx * 1.2; i++) { const X = ox + Math.round((r() * 2 - 1) * rx), Y = oy + Math.round((r() * 2 - 1) * ry); if (inE(X, Y)) { g.fillStyle = M.bits[i % M.bits.length]; g.fillRect(X, Y, 1, 1); } } }
  const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = false;
  // 光線：照背景的亮度微調（夜晚・室內暗一點）
  const E = b && typeof env21 === 'function' ? env21(b) : null, dim = E ? clamp(1 - (E.sunUp ? 0 : 0.45) - (E.oc || 0) * 0.25, 0.45, 1) : 1;
  x.save(); if (dim < 0.99) x.filter = 'brightness(' + dim.toFixed(2) + ')'; x.drawImage(cv, Math.round(cx - rx - 2), Math.round(foot - ry - 1)); x.restore(); x.imageSmoothingEnabled = sm; }
/* ---------- 景深：新背景只有遠景（地平線以上）一點點模糊，站人的地面和底座一樣清楚 ---------- */
{ const HOR = { field: 30, meadow: 32, dusk: 36, ruinsOut: 34, forest: 8, glade: 8, mushwood: 8, ruins: 8, mine: 8, crystalCave: 8, sewer: 8, catacomb: 8 };
  if (GBA26.on && typeof HD2D_LOOK !== 'undefined') for (const k in HOR) { const L = HD2D_LOOK[k] || HD2D_LOOK.field; HD2D_LOOK[k] = { ...L, far: HOR[k], sharp: [HOR[k] + 4, BH] }; } }
