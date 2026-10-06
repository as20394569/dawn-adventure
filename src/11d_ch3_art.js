/* ===================== v12.39 第三章序章「東方的海」：美術（海邊的地圖主題、椰子樹、NPC 外觀、房子、兩張戰鬥背景） ===================== */
// a palm tree (16×21, same footprint as Tiles.tree), drawn pixel by pixel: a leaning trunk, six drooping fronds, a 1 px outline
function palmImg13() { const c = mkCanvas(16, 21), x = c.getContext('2d'), P = {};
  const put = (X, Y, col) => { X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X > 15 || Y > 20) return; P[X + ',' + Y] = col; };
  // trunk: three columns (light / mid / dark), a darker ring every third row
  for (let y = 8; y <= 20; y++) { const cx = 8 + Math.round(Math.sin((20 - y) / 12 * 1.3) * 1.6) - 1, ring = y % 3 === 0;
    put(cx - 1, y, ring ? '#a87840' : '#e0b070'); put(cx, y, ring ? '#8a5c30' : '#b88448'); put(cx + 1, y, ring ? '#6a4020' : '#8a5c30'); }
  // fronds: a quadratic curve from the crown, rising then drooping; thick at the base
  const C = [8, 6], F = [[-7, -3, -8, 4], [-5, -6, -7, -1], [-1, -7, -3, -6], [2, -7, 4, -6], [6, -6, 7, -1], [7, -3, 8, 4], [-3, 0, -5, 6], [3, 0, 5, 6]];
  for (const [cx1, cy1, ex, ey] of F) for (let i = 0; i <= 14; i++) { const t = i / 14, X = C[0] + 2 * (1 - t) * t * cx1 + t * t * ex, Y = C[1] + 2 * (1 - t) * t * cy1 + t * t * ey;
    put(X, Y, t < 0.5 ? '#78c850' : '#5cae44'); put(X, Y + 1, t < 0.7 ? '#3e8a34' : '#2e6e2a'); if (t < 0.35) put(X, Y - 1, '#b0e878'); }
  put(7, 7, '#5a3a1a'); put(9, 7, '#5a3a1a'); put(8, 8, '#4a2e14'); put(7, 6, '#8a6030');
  // outline every empty pixel next to the tree
  const O = {}; for (const k in P) { const [X, Y] = k.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (X + dx) + ',' + (Y + dy); if (!P[q] && X + dx >= 0 && X + dx < 16 && Y + dy >= 0 && Y + dy < 21) O[q] = 1; } }
  for (const k in O) P[k] = '#1c3018';
  for (const k in P) { const [X, Y] = k.split(',').map(Number); x.fillStyle = P[k]; x.fillRect(X, Y, 1, 1); }
  return c; }

/* ---------- map themes: the sandy shore and the sea cave ---------- */
CH2_THEMES.beach13 = {
  ground: (h, s, l) => thGreen(h, s) ? [44 + (l - 0.5) * 14, clamp(s * 0.45 + 0.12, 0, 0.55), clamp(l * 0.7 + 0.3, 0, 0.92)] : null,
  tall: (h, s, l) => thGreen(h, s) ? [62 + (l - 0.5) * 16, clamp(s * 0.6, 0, 0.55), clamp(l * 0.9 + 0.08, 0, 0.82)] : null,
  path: (h, s, l) => thGreen(h, s) ? [44 + (l - 0.5) * 14, clamp(s * 0.45 + 0.12, 0, 0.55), clamp(l * 0.7 + 0.3, 0, 0.92)] : [32, clamp(s * 0.55 + 0.1, 0, 0.6), clamp(l * 0.85 + 0.08, 0, 0.85)],
  water: (h, s, l) => [186 + (l - 0.5) * 20, clamp(s * 0.9 + 0.1, 0, 0.85), clamp(l * 0.95 + 0.04, 0, 0.92)],
  tree: { L: '#78c850', l: '#5cae44', m: '#3e8a34', d: '#2e6e2a' },
};
THEME_CACHE.beach13tree = palmImg13();
CH2_THEMES.seacave13 = { stone: (h, s, l) => [190 + (l - 0.5) * 16, clamp(s + 0.12, 0, 0.32), clamp(l * 0.62, 0, 1)], wall: (h, s, l) => [196, clamp(s + 0.15, 0, 0.36), clamp(l * 0.48, 0, 1)],
  water: (h, s, l) => [192, clamp(s * 0.7, 0, 0.7), clamp(l * 0.55, 0, 0.7)] };
// ambience: sun glints on the sea; in the cave, a teal gloom and falling drips
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); const th = this.map && this.map.d.theme, t = this.t || 0;
    if (th === 'beach13') { x.fillStyle = 'rgba(255,240,200,0.06)'; x.fillRect(0, 0, W, H); if (this.map.d.fog13 && !(Game.st.flags || {}).siren13) { x.fillStyle = 'rgba(220,230,240,0.22)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { const y = ((i * 89 + t * 0.12) % (H + 40)) - 20; x.fillStyle = 'rgba(240,244,250,0.10)'; x.fillRect(0, Math.round(y), W, 18); } } }
    else if (th === 'seacave13') { x.fillStyle = 'rgba(10,40,50,0.22)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 7; i++) { const px = (i * 37 + 11) % W, py = (t * (0.9 + (i % 3) * 0.3) + i * 53) % (H + 30) - 10; if ((t + i * 29) % 140 < 100) { x.fillStyle = 'rgba(170,230,240,0.6)'; x.fillRect(px, Math.round(py), 1, 2); } }
      if (!(Game.st.flags || {}).siren13) { x.fillStyle = 'rgba(200,220,230,0.10)'; x.fillRect(0, 0, W, H); } } }; }

/* ---------- people and houses ---------- */
Object.assign(LOOKS, {
  harborMaster13: { style: 'long', skirt: 1, H: '#2a3a5a', h: '#3e5478', j: '#6a84aa', Y: '#f4f4f0', y: '#d0d4dc', R: '#2a5a8a', r: '#1a3e66', P: '#2a5a8a' },
  fisher13: { style: 'beard', H: '#c8c8c0', h: '#e0e0d8', j: '#f4f4ee', W: '#f0f0ea', Y: '#e8c050', y: '#b89030', R: '#4a6a8a', r: '#30506e', P: '#4a4a58' },
  sailor13: { H: '#4a2e1a', h: '#6a4428', j: '#8a6038', Y: '#f4f4f8', y: '#3a5aa0', R: '#2a4a8a', r: '#1a3264', P: '#2a3248' },
  seaKid13: { H: '#3a2418', h: '#5a3a24', j: '#7a5034', Y: '#f8d8a0', y: '#d0a870', R: '#4ab0c8', r: '#2a88a0', P: '#4a5a6a' },
});
Object.assign(BUILD_STYLE, {
  seaInn13: { roof: '#2a6a9a', roofT: 'tile', wall: '#f4efe4', beam: '#3a4a5a', shut: '#2a8ab0', awning: ['#2a8ab0', '#f4efe4'] },
  seaShop13: { roof: '#c86a3a', roofT: 'tile', wall: '#f2eadc', beam: '#4a3226', shut: '#3a8a6a', awning: ['#c86a3a', '#f2eadc'] },
  seaHouse13: { roof: '#3a7a8a', roofT: 'slate', wall: '#ece6dc', beam: '#3a3a44', shut: '#c8a050', banner: '#2a6a9a' },
});
// a broken mast with a torn sail (props in the sea cave)
const MAST13_IMG = spriteFrom(['.......kk.......', '...kkkkTtkkk....', '..kSSSSTtSSSk...', '..kSssSTtsSSk...', '...kSsSTtSsk....', '....kSSTtSk.....', '.....kkTtkk.....', '.......Ttk......', '.......Ttk......', '.......Ttk......', '......kTtk......', '.....kTTttk.....', '....kkkkkkkk....', '................', '................', '................'],
  { k: '#1a1418', T: '#a8784a', t: '#6a4828', S: '#d8d0b8', s: '#a8a088' });
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'mast13') return propFrames(MAST13_IMG, 6); return _nf(look); }; }

/* ---------- battle stages: the shore at noon, the sea cave ---------- */
{ const _bb = buildBattleBG; buildBattleBG = function (kind) { if (kind !== 'beach13' && kind !== 'seacave13') return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(kind === 'beach13' ? 4413 : 4414);
    const grad = (y0, y1, stops) => { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
    const glow = (X, Y, R, rgb, a) => { const g = x.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(X - R, Y - R, R * 2, R * 2); };
    if (kind === 'beach13') {
      grad(0, 58, [[0, '#5aaee8'], [0.75, '#bfe4f6'], [1, '#e8f6fa']]); glow(130, 18, 34, '255,250,220', 0.8); pxEllipse(x, 130, 18, 6, 6, '#fffbe8');
      x.fillStyle = '#ffffff'; for (const [a, b, w] of [[10, 12, 28], [70, 24, 22], [150, 34, 18]]) { x.fillRect(a, b, w, 2); x.fillRect(a + 4, b - 1, w - 10, 1); }
      grad(58, 86, [[0, '#2f8ac0'], [1, '#4ab8d0']]); // the sea
      for (let i = 0; i < 40; i++) { const px = Math.floor(r() * W), py = 60 + Math.floor(r() * 24); x.fillStyle = r() < 0.5 ? '#bfeaf6' : '#ffffff'; x.fillRect(px, py, 2 + Math.floor(r() * 4), 1); }
      x.fillStyle = 'rgba(255,255,255,0.65)'; for (let X = 0; X < W; X++) { const y = 86 + Math.round(Math.sin(X / 9) * 1.5); x.fillRect(X, y, 1, 2); } // surf line
      const sand = (y0) => { for (let y = y0; y < BH; y++) { const t = (y - y0) / (BH - y0), a = hex2rgb('#f0dca8'), b = hex2rgb('#c8a46a'); x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; x.fillRect(0, y, W, 1); } };
      sand(89); x.fillStyle = 'rgba(120,150,160,0.25)'; x.fillRect(0, 89, W, 4);
      for (let i = 0; i < 120; i++) { const py = 92 + Math.floor(r() * (BH - 94)), px = Math.floor(r() * W); x.fillStyle = r() < 0.5 ? '#fff0c8' : '#b89458'; x.fillRect(px, py, py > 160 ? 2 : 1, 1); }
      for (const [X, Y] of [[22, 150], [150, 120], [128, 196]]) { pxEllipse(x, X, Y, 3, 2, '#f8e8e0'); x.fillStyle = '#e8a8a0'; x.fillRect(X - 1, Y, 3, 1); } // shells
      // a palm leaning in from the left edge
      for (let y = 30; y < 120; y++) { const X = Math.round(6 + (120 - y) * 0.12); x.fillStyle = y % 6 < 2 ? '#8a5c30' : '#b88448'; x.fillRect(X, y, 5, 1); x.fillStyle = '#6a4020'; x.fillRect(X + 4, y, 1, 1); }
      for (const [ex, ey] of [[-10, 46], [6, 52], [30, 44], [40, 30], [26, 18], [2, 16]]) { for (let i = 0; i <= 18; i++) { const t = i / 18, X = 16 + 2 * (1 - t) * t * ((ex - 16) * 0.5) + t * t * (ex - 16), Y = 28 + 2 * (1 - t) * t * -10 + t * t * (ey - 28); x.fillStyle = '#3e8a34'; x.fillRect(Math.round(X), Math.round(Y) + 1, 2, 2); x.fillStyle = '#6cc048'; x.fillRect(Math.round(X), Math.round(Y), 2, 1); } }
    } else {
      grad(0, BH, [[0, '#06141c'], [0.5, '#0e2a34'], [1, '#123640']]);
      // rock walls with a mouth of light far behind
      glow(118, 52, 46, '150,220,230', 0.35); pxEllipse(x, 118, 52, 18, 22, '#3a7a88'); pxEllipse(x, 118, 54, 12, 16, '#8ad0d8');
      for (const [pts, col] of [[[[0, 0], [70, 0], [60, 40], [40, 90], [0, 96]], '#0a1e26'], [[[176, 0], [140, 0], [146, 50], [160, 96], [176, 96]], '#0c222a']]) pxPoly(x, pts, col);
      for (let i = 0; i < 14; i++) { const X = 10 + i * 12 + Math.floor(r() * 6), h = 6 + Math.floor(r() * 16); pxPoly(x, [[X - 3, 0], [X + 3, 0], [X, h]], '#0e2830'); } // stalactites
      // still water, then the wreck's broken deck in the middle distance
      grad(86, 104, [[0, '#1a4a58'], [1, '#2a6070']]); for (let i = 0; i < 26; i++) { x.fillStyle = 'rgba(160,230,240,0.35)'; x.fillRect(Math.floor(r() * W), 88 + Math.floor(r() * 14), 3 + Math.floor(r() * 5), 1); }
      pxPoly(x, [[18, 96], [74, 92], [80, 100], [24, 104]], '#4a3424'); x.fillStyle = '#6a4a30'; for (let X = 22; X < 76; X += 6) x.fillRect(X, 94, 1, 8); x.fillStyle = '#3a2618'; x.fillRect(46, 60, 3, 36); x.fillStyle = '#c8c0a8'; pxPoly(x, [[49, 62], [64, 68], [58, 80], [49, 78]], '#b8b098');
      for (let y = 104; y < BH; y++) { const t = (y - 104) / (BH - 104), a = hex2rgb('#3a5a60'), b = hex2rgb('#1a2c30'); x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; x.fillRect(0, y, W, 1); }
      for (let i = 0; i < 90; i++) { const py = 106 + Math.floor(r() * (BH - 108)), px = Math.floor(r() * W); x.fillStyle = r() < 0.5 ? '#4a7078' : '#142226'; x.fillRect(px, py, py > 160 ? 2 : 1, 1); }
      for (const [X, Y, R] of [[30, 170, 14], [146, 186, 18], [100, 140, 9]]) { x.fillStyle = 'rgba(120,200,210,0.18)'; x.beginPath(); x.ellipse(X, Y, R, R * 0.35, 0, 0, Math.PI * 2); x.fill(); } // puddles
    }
    return c; }; }
