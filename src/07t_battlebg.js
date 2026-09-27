/* ===================== v20.6 battle backgrounds: more variety (playtest: "戰鬥時背景需要多樣化") =====================
   - The mine, the sewer and the catacomb had all been using the ruins hall: each now has its own stage.
   - Big outdoor maps get variants picked by where the fight happens (the map is cut into ~7×7-tile patches), so a
     patch always looks the same but walking on changes the scenery:
       晨霧道路: castle meadow / flower meadow / sunset road    迷霧森林: deep forest / sunlit glade / glowing mushroom grove
       古岩遺跡: torch-lit hall / broken colonnade under a storm sky    廢棄礦坑: timbered tunnel / crystal vein cavern
   Every stage is a 176×218 pixel painting like the others; the HD-2D pass (depth of field, light, motes) runs on top. */
const BG_VARIANTS = { route: ['field', 'meadow', 'dusk'], forest: ['forest', 'glade', 'mushwood'], ruins: ['ruins', 'ruinsOut'], mine: ['mine', 'crystalCave'], sewer: ['sewer'], catacomb: ['catacomb'] };
function battleBgFor(ow, cfg) {
  const m = ow.map, base = (m.d && m.d.battleBg) || 'field', L = BG_VARIANTS[m.id];
  if (!L || !ow.p) return base; if (cfg && (cfg.kind === 'boss')) return L[0]; // scripted bosses keep the map's signature stage
  const ax = Math.floor(ow.p.x / 7), ay = Math.floor(ow.p.y / 7), h = ((ax * 73856093) ^ (ay * 19349663)) >>> 0;
  return L[h % L.length];
}
{ const V = ['meadow', 'dusk', 'glade', 'mushwood', 'ruinsOut', 'mine', 'crystalCave', 'sewer', 'catacomb'];
  const _bb = buildBattleBG; buildBattleBG = function (kind) {
    if (!V.includes(kind)) return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(41 + V.indexOf(kind) * 7);
    const band = (y0, cols, h) => cols.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, y0 + i * h, W, h); });
    const grad = (y0, y1, stops) => { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
    const glow = (X, Y, R, rgb, a) => { const g = x.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(X - R, Y - R, R * 2, R * 2); };
    const ground = (y0, from, to) => { const a = hex2rgb(from), b = hex2rgb(to); for (let y = y0; y < BH; y++) { const t = (y - y0) / (BH - y0); x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; x.fillRect(0, y, W, 1); } };
    const tufts = (y0, cols, n) => { for (let i = 0; i < n; i++) { const py = y0 + 3 + Math.floor(r() * (BH - y0 - 4)), px = Math.floor(r() * W), s = 1 + Math.floor((py - y0) / 45); x.fillStyle = cols[i % cols.length]; x.fillRect(px, py, s + 1, 1); x.fillRect(px + 1, py - s, 1, s); } };
    const bricks = (y0, y1, a, b, line, bw = 16, bh = 8) => { for (let y = y0, row = 0; y < y1; y += bh, row++) for (let i = (row % 2) * (bw / 2) - bw; i < W; i += bw) { x.fillStyle = r() < 0.5 ? a : b; x.fillRect(i + 1, y + 1, bw - 2, bh - 2); x.fillStyle = line; x.fillRect(i + 1, y + 1, bw - 2, 1); } };
    if (kind === 'meadow') { // flower meadow, bright morning, a windmill on the hill
      grad(0, 72, [[0, '#8ccaf0'], [0.7, '#cfe9f4'], [1, '#f2f6e8']]); glow(140, 16, 40, '255,250,220', 0.7); pxEllipse(x, 140, 16, 7, 7, '#fffbe8');
      x.fillStyle = '#ffffff'; for (const [a1, b1, w] of [[8, 18, 26], [70, 10, 34], [118, 34, 22]]) { x.fillRect(a1, b1, w, 3); x.fillRect(a1 + 5, b1 - 2, w - 12, 2); }
      pxPoly(x, [[0, 72], [0, 54], [30, 46], [58, 52], [90, 42], [120, 50], [150, 44], [176, 50], [176, 72]], '#a6cf8e');
      pxPoly(x, [[0, 74], [0, 62], [40, 58], [80, 64], [118, 56], [176, 62], [176, 74]], '#88bd72');
      x.fillStyle = '#e8e0d0'; x.fillRect(96, 30, 6, 14); x.fillStyle = '#b05a40'; pxPoly(x, [[95, 30], [99, 25], [103, 30]], '#b05a40');
      x.fillStyle = '#6a5a4a'; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.3; pxLine(x, 99, 28, Math.round(99 + Math.cos(a) * 11), Math.round(28 + Math.sin(a) * 11), '#6a5a4a'); }
      ground(72, '#86c66a', '#3f7c38'); tufts(72, ['#a6dc88', '#5a9a4a'], 70);
      const FL = ['#ff8ab0', '#ffe060', '#ffffff', '#c8a0ff', '#ff7050'];
      for (let i = 0; i < 150; i++) { const py = 74 + Math.floor(Math.pow(r(), 0.8) * (BH - 76)), px = Math.floor(r() * W), s = py > 150 ? 2 : 1, col = FL[i % FL.length]; x.fillStyle = col; x.fillRect(px, py, s, s); if (s > 1) { x.fillStyle = '#fff6c0'; x.fillRect(px, py, 1, 1); x.fillStyle = '#3e7a38'; x.fillRect(px, py + 2, 1, 2); } }
    } else if (kind === 'dusk') { // sunset over rolling hills, a dirt road and a fence
      grad(0, 76, [[0, '#2c2452'], [0.45, '#8a3c68'], [0.8, '#e0704e'], [1, '#f6b060']]); glow(60, 70, 60, '255,190,110', 0.55); pxEllipse(x, 60, 72, 16, 16, '#ffd890'); pxEllipse(x, 60, 72, 12, 12, '#fff0c0');
      x.fillStyle = 'rgba(80,40,90,0.6)'; for (const [a1, b1, w] of [[0, 30, 60], [90, 22, 70], [40, 48, 50], [120, 44, 56]]) x.fillRect(a1, b1, w, 2);
      pxPoly(x, [[0, 78], [0, 62], [26, 58], [52, 66], [84, 56], [112, 64], [140, 54], [176, 60], [176, 78]], '#4a2e4c');
      for (const [X, h] of [[20, 14], [128, 18], [150, 12]]) { x.fillStyle = '#2e1c30'; x.fillRect(X, 62 - h, 2, h); pxEllipse(x, X + 1, 62 - h, 5, 5, '#2e1c30'); }
      ground(76, '#7a6a3e', '#2a2a20'); tufts(76, ['#9a8a50', '#4a4028'], 60);
      pxPoly(x, [[80, 76], [96, 76], [150, BH], [30, BH]], '#a07650'); x.fillStyle = '#c09060'; for (let y = 80; y < BH; y += 5) { const t = (y - 76) / (BH - 76), l = lerp(80, 30, t), rr = lerp(96, 150, t); x.fillRect(Math.round(l + 2), y, 1, 1); x.fillRect(Math.round(rr - 3), y + 2, 1, 1); }
      for (let k = 0; k < 7; k++) { const t = k / 6, X = Math.round(lerp(70, 0, t)), Y = Math.round(lerp(80, 206, t * t * 0.3 + t * 0.7)), h = Math.round(4 + t * 14); x.fillStyle = '#3a2418'; x.fillRect(X, Y - h, 1 + Math.round(t * 2), h); if (k) { const pX = Math.round(lerp(70, 0, (k - 1) / 6)), pY = Math.round(lerp(80, 206, ((k - 1) / 6) ** 2 * 0.3 + (k - 1) / 6 * 0.7)); pxLine(x, pX, pY - Math.round(4 + (k - 1) / 6 * 14) + 2, X, Y - h + 2, '#4a3020'); } }
    } else if (kind === 'glade') { // sunlit forest clearing
      grad(0, 80, [[0, '#16301e'], [1, '#2c5234']]);
      for (let i = -4; i < W; i += 13) { const w = 4 + Math.floor(r() * 5); x.fillStyle = r() < 0.5 ? '#2a1f16' : '#35281c'; x.fillRect(i, 10, w, 72); x.fillStyle = '#4a3a2a'; x.fillRect(i, 10, 1, 72); }
      for (let i = -10; i < W; i += 12) pxEllipse(x, i + 5, 8 + Math.floor(r() * 10), 11, 8, r() < 0.5 ? '#1c3a22' : '#23462a');
      x.save(); x.globalCompositeOperation = 'lighter'; for (const [x0, w] of [[40, 14], [72, 22], [110, 12]]) { const g = x.createLinearGradient(0, 0, 0, 150); g.addColorStop(0, 'rgba(255,240,170,0.28)'); g.addColorStop(1, 'rgba(255,240,170,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(x0, 0); x.lineTo(x0 + w, 0); x.lineTo(x0 + w + 30, 150); x.lineTo(x0 + 20, 150); x.closePath(); x.fill(); } x.restore();
      ground(80, '#5a8a44', '#23401e'); const cg = x.createRadialGradient(92, 140, 10, 92, 140, 90); cg.addColorStop(0, 'rgba(190,230,120,0.55)'); cg.addColorStop(1, 'rgba(190,230,120,0)'); x.fillStyle = cg; x.fillRect(0, 80, W, BH - 80);
      tufts(80, ['#8ac060', '#3a6a30'], 70);
      for (const [X, Y, s] of [[8, 120, 1], [164, 110, 1], [4, 190, 2], [170, 196, 2]]) { x.fillStyle = '#2e6a2e'; for (let k = -3; k <= 3; k++) pxLine(x, X, Y, X + k * 3 * s, Y - (8 - Math.abs(k)) * s * 1.4, k % 2 ? '#3e8a3a' : '#2e6a2e'); }
      x.fillStyle = '#5a3e26'; x.fillRect(128, 150, 34, 7); x.fillStyle = '#7a5836'; x.fillRect(128, 150, 34, 2); pxEllipse(x, 128, 153, 3, 4, '#8a6a44'); x.fillStyle = '#6aa048'; x.fillRect(134, 149, 10, 1); x.fillRect(150, 149, 6, 1);
      for (let i = 0; i < 18; i++) { x.fillStyle = r() < 0.5 ? '#fff4a0' : '#ffffff'; x.fillRect(Math.floor(r() * W), 90 + Math.floor(r() * 120), 1, 1); }
    } else if (kind === 'mushwood') { // glowing giant mushrooms at dusk
      grad(0, 90, [[0, '#0a1a24'], [1, '#1c3c40']]);
      for (let i = 0; i < 20; i++) { x.fillStyle = r() < 0.5 ? '#6ae0ff' : '#c8a0ff'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 70), 1, 1); }
      const shroom = (X, Y, sw, sh, cr, col, rim) => { x.fillStyle = '#c8c0b0'; x.fillRect(X - sw, Y - sh, sw * 2, sh); x.fillStyle = '#a8a090'; x.fillRect(X + sw - 2, Y - sh, 2, sh); glow(X, Y - sh - 2, cr * 2.2, rim === '#8af0ff' ? '120,230,255' : '200,150,255', 0.35); pxEllipse(x, X, Y - sh, cr, Math.round(cr * 0.55), col); x.fillStyle = rim; x.fillRect(X - cr + 2, Y - sh + Math.round(cr * 0.4), cr * 2 - 4, 1); for (let k = 0; k < 4; k++) { x.fillStyle = '#ffffff'; x.fillRect(X - cr + 4 + Math.floor(r() * (cr * 2 - 8)), Y - sh - Math.floor(r() * cr * 0.4), 2, 1); } };
      shroom(20, 92, 4, 40, 18, '#2a6a8a', '#8af0ff'); shroom(150, 94, 5, 50, 22, '#5a3a8a', '#d8a8ff'); shroom(92, 84, 2, 22, 10, '#2a6a8a', '#8af0ff'); shroom(118, 88, 2, 16, 8, '#5a3a8a', '#d8a8ff');
      ground(90, '#23483a', '#0e1e16'); tufts(90, ['#3a7a5a', '#1a3a2a'], 60);
      for (let i = 0; i < 16; i++) { const X = Math.floor(r() * W), Y = 100 + Math.floor(r() * 110), c2 = r() < 0.5 ? '#8af0ff' : '#d8a8ff'; glow(X, Y - 2, 6, c2 === '#8af0ff' ? '120,230,255' : '200,150,255', 0.3); x.fillStyle = '#c8c0b0'; x.fillRect(X, Y - 2, 1, 3); x.fillStyle = c2; x.fillRect(X - 1, Y - 3, 3, 1); }
    } else if (kind === 'ruinsOut') { // broken colonnade under a storm sky
      grad(0, 92, [[0, '#262a3e'], [0.6, '#4a5470'], [1, '#8a92a8']]);
      x.fillStyle = 'rgba(20,20,34,0.55)'; for (const [a1, b1, w] of [[0, 14, 90], [60, 28, 116], [0, 40, 70]]) { x.fillRect(a1, b1, w, 6); x.fillRect(a1 + 8, b1 - 3, w - 20, 3); }
      pxLine(x, 128, 0, 122, 18, '#e8f0ff'); pxLine(x, 122, 18, 130, 30, '#e8f0ff'); glow(126, 16, 26, '200,220,255', 0.25);
      pxPoly(x, [[0, 92], [0, 76], [40, 70], [80, 78], [130, 68], [176, 74], [176, 92]], '#3e4458');
      const col = (X, top, w) => { x.fillStyle = '#8a8a9a'; x.fillRect(X, top, w, 100 - top); x.fillStyle = '#a6a6b6'; x.fillRect(X + 1, top, 2, 100 - top); x.fillStyle = '#6a6a7a'; x.fillRect(X + w - 2, top, 2, 100 - top); x.fillStyle = '#9a9aaa'; x.fillRect(X - 2, 96, w + 4, 4); pxPoly(x, [[X, top], [X + w * 0.4, top - 4], [X + w * 0.7, top + 1], [X + w, top - 2], [X + w, top + 3], [X, top + 3]], '#8a8a9a'); x.fillStyle = '#5a8a44'; x.fillRect(X + 1, top + 6, 1, 14); x.fillRect(X + 2, top + 12, 1, 8); };
      col(10, 34, 12); col(46, 58, 10); col(120, 26, 14); col(156, 50, 12);
      x.fillStyle = '#7a7a8a'; x.fillRect(64, 52, 40, 6); x.fillStyle = '#9a9aaa'; x.fillRect(64, 52, 40, 1);
      ground(98, '#6a6a78', '#34343e'); for (let k = 0, y = 98; y < BH; k++, y += 6 + k * 2) { x.fillStyle = '#50505c'; x.fillRect(0, y, W, 1); } for (let i = -6; i <= 6; i++) pxLine(x, 88 + i * 12, 98, 88 + i * 36, BH, '#50505c');
      for (const [X, Y, w, h] of [[20, 120, 16, 8], [140, 112, 12, 7], [150, 180, 22, 10]]) { x.fillStyle = '#7a7a8a'; x.fillRect(X, Y, w, h); x.fillStyle = '#9a9aaa'; x.fillRect(X, Y, w, 1); x.fillStyle = '#44444e'; x.fillRect(X, Y + h, w, 1); }
      tufts(98, ['#6aa048', '#4a7a38'], 30);
    } else if (kind === 'mine' || kind === 'crystalCave') { // timbered tunnel receding to the dark / a cavern with a crystal vein
      const deep = kind === 'crystalCave';
      x.fillStyle = deep ? '#1e1a2a' : '#2e241e'; x.fillRect(0, 0, W, BH);
      for (let i = 0; i < 220; i++) { const X = Math.floor(r() * W), Y = Math.floor(r() * 100); x.fillStyle = deep ? (r() < 0.5 ? '#2a2438' : '#161222') : (r() < 0.5 ? '#3a2e26' : '#241c16'); x.fillRect(X, Y, 2 + Math.floor(r() * 4), 1 + Math.floor(r() * 2)); }
      pxEllipse(x, 88, 64, 26, 30, deep ? '#0a0812' : '#0e0a08');
      if (!deep) { for (const [s, a] of [[1, 1], [0.62, 0.8], [0.4, 0.6]]) { const hw = Math.round(70 * s), top = Math.round(64 - 56 * s), bot = Math.round(64 + 38 * s), tw = Math.max(2, Math.round(7 * s)); x.globalAlpha = a; x.fillStyle = '#6a4a2a'; x.fillRect(88 - hw, top, tw, bot - top); x.fillRect(88 + hw - tw, top, tw, bot - top); x.fillRect(88 - hw - 2, top, hw * 2 + 4, tw); x.fillStyle = '#8a6438'; x.fillRect(88 - hw, top, 1, bot - top); x.fillRect(88 - hw - 2, top, hw * 2 + 4, 1); x.globalAlpha = 1; }
        for (const X of [30, 146]) { x.fillStyle = '#2a2a30'; x.fillRect(X - 1, 40, 3, 2); glow(X, 46, 22, '255,170,80', 0.55); x.fillStyle = '#ffd070'; x.fillRect(X - 1, 44, 3, 4); x.fillStyle = '#5a4a3a'; x.fillRect(X - 2, 43, 5, 1); x.fillRect(X - 2, 48, 5, 1); } }
      else { for (let i = 0; i < 9; i++) { const X = Math.floor(r() * W), Y = 20 + Math.floor(r() * 70), h = 6 + Math.floor(r() * 10), c1 = r() < 0.5 ? '#7ad0ff' : '#c090ff'; glow(X, Y, h * 1.6, c1 === '#7ad0ff' ? '120,210,255' : '190,140,255', 0.3); pxPoly(x, [[X, Y - h], [X + 3, Y], [X, Y + 2], [X - 3, Y]], c1); x.fillStyle = '#ffffff'; x.fillRect(X, Y - h + 2, 1, Math.max(1, h - 4)); }
        x.fillStyle = 'rgba(140,120,200,0.12)'; x.fillRect(0, 70, W, 30); }
      ground(100, deep ? '#3a3448' : '#4a3a2e', deep ? '#16121e' : '#1e1814'); for (let i = 0; i < 90; i++) { const py = 102 + Math.floor(r() * (BH - 104)), px = Math.floor(r() * W); x.fillStyle = deep ? '#4a4460' : '#5a4a3a'; x.fillRect(px, py, 1 + Math.floor((py - 100) / 40), 1); }
      if (!deep) { for (const s of [-1, 1]) pxLine(x, 88 + s * 6, 100, 88 + s * 46, BH, '#8a8a92', 2); for (let k = 0, y = 102; y < BH; k++, y += 4 + k * 2) { const t = (y - 100) / (BH - 100), hw = Math.round(lerp(8, 50, t)); x.fillStyle = '#5a3e24'; x.fillRect(88 - hw, y, hw * 2, 1 + Math.floor(t * 3)); } }
      else for (let i = 0; i < 6; i++) { const X = Math.floor(r() * W), Y = 120 + Math.floor(r() * 90), c1 = r() < 0.5 ? '#7ad0ff' : '#c090ff'; pxPoly(x, [[X, Y - 7], [X + 3, Y], [X - 3, Y]], c1); pxPoly(x, [[X + 5, Y - 4], [X + 7, Y], [X + 3, Y]], shade(c1, -0.2)); }
    } else if (kind === 'sewer') { // brick tunnel with a water channel behind the walkway
      x.fillStyle = '#222c2c'; x.fillRect(0, 0, W, BH); bricks(0, 96, '#34403e', '#2e3a38', '#44504c');
      pxEllipse(x, 88, 60, 34, 40, '#0c1212'); x.fillStyle = '#4a5654'; for (let a = 0; a < Math.PI; a += 0.08) x.fillRect(Math.round(88 + Math.cos(Math.PI + a) * 36), Math.round(60 - Math.sin(a) * 42), 3, 3);
      for (const X of [16, 150]) { x.fillStyle = '#4a4a44'; x.fillRect(X, 20, 8, 60); x.fillStyle = '#5e5e56'; x.fillRect(X + 1, 20, 2, 60); x.fillStyle = '#3a3a34'; x.fillRect(X - 2, 30, 12, 3); x.fillRect(X - 2, 64, 12, 3); x.fillStyle = '#6a8a7a'; x.fillRect(X + 3, 80, 2, 6); }
      x.fillStyle = '#2a3432'; for (let i = 0; i < 5; i++) x.fillRect(40 + i * 6, 70, 2, 16); x.fillRect(38, 70, 30, 2); x.fillRect(38, 84, 30, 2);
      x.fillStyle = '#1e3a38'; x.fillRect(0, 96, W, 16); for (let i = 0; i < 26; i++) { x.fillStyle = r() < 0.5 ? '#3a6a62' : '#2a504a'; x.fillRect(Math.floor(r() * W), 98 + Math.floor(r() * 12), 4 + Math.floor(r() * 6), 1); }
      x.fillStyle = '#4a5452'; x.fillRect(0, 112, W, 3); ground(115, '#3e4846', '#1a2020');
      for (let k = 0, y = 115; y < BH; k++, y += 6 + k * 2) { x.fillStyle = '#2e3634'; x.fillRect(0, y, W, 1); } for (let i = -6; i <= 6; i++) pxLine(x, 88 + i * 14, 115, 88 + i * 34, BH, '#2e3634');
      for (let i = 0; i < 5; i++) { const X = Math.floor(r() * W), Y = 130 + Math.floor(r() * 80), w = 8 + Math.floor(r() * 12); x.fillStyle = 'rgba(80,140,120,0.35)'; x.fillRect(X, Y, w, 2); }
    } else if (kind === 'catacomb') { // burial niches, candles and a blue fog
      x.fillStyle = '#1c1826'; x.fillRect(0, 0, W, BH); bricks(0, 100, '#2c2638', '#262032', '#363046', 20, 10);
      for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const X = 6 + i * 29, Y = 10 + row * 28; if ((i === 2 || i === 3) && row > 0) continue; x.fillStyle = '#0e0c14'; x.fillRect(X, Y, 20, 14); x.fillStyle = '#3e3850'; x.fillRect(X, Y, 20, 1); if (r() < 0.6) { x.fillStyle = '#d8d0b8'; x.fillRect(X + 4, Y + 7, 7, 5); x.fillStyle = '#0e0c14'; x.fillRect(X + 5, Y + 8, 2, 2); x.fillRect(X + 8, Y + 8, 2, 2); x.fillStyle = '#b8b098'; x.fillRect(X + 12, Y + 10, 6, 2); } }
      x.fillStyle = '#0a0810'; x.fillRect(66, 40, 44, 60); pxEllipse(x, 88, 42, 22, 14, '#0a0810');
      for (const X of [30, 146, 60, 116]) { const Y = X === 60 || X === 116 ? 94 : 88; x.fillStyle = '#e8e0c8'; x.fillRect(X, Y - 6, 2, 6); glow(X + 1, Y - 9, 14, '255,190,110', 0.5); x.fillStyle = '#ffd070'; x.fillRect(X, Y - 9, 2, 3); x.fillStyle = '#fff4c0'; x.fillRect(X, Y - 8, 1, 1); }
      ground(100, '#3a3448', '#15121c'); for (let k = 0, y = 100; y < BH; k++, y += 6 + k * 2) { x.fillStyle = '#2a2436'; x.fillRect(0, y, W, 1); } for (let i = -6; i <= 6; i++) pxLine(x, 88 + i * 12, 100, 88 + i * 34, BH, '#2a2436');
      x.fillStyle = '#4a4058'; x.fillRect(4, 150, 30, 14); x.fillStyle = '#5a5068'; x.fillRect(4, 150, 30, 2); x.fillStyle = '#3a3048'; x.fillRect(4, 164, 30, 2); x.fillStyle = '#6a6078'; x.fillRect(17, 153, 2, 8); x.fillRect(14, 156, 8, 2);
      for (let i = 0; i < 8; i++) { const X = Math.floor(r() * W), Y = 110 + Math.floor(r() * 100); x.fillStyle = '#c8c0a8'; x.fillRect(X, Y, 5, 1); x.fillRect(X - 1, Y - 1, 1, 3); x.fillRect(X + 5, Y - 1, 1, 3); }
      x.fillStyle = 'rgba(120,140,220,0.14)'; for (let i = 0; i < 4; i++) x.fillRect(0, 96 + i * 16, W, 7);
    }
    c.kind = kind; return c;
  };
}
Object.assign(HD2D_LOOK, {
  meadow: { key: [255, 244, 200], shaft: 'rgba(255,248,210,', haze: 'rgba(230,245,255,', mote: ['#fff6c8', '#ffffff', '#ffd0e8'], cool: [40, 60, 110], sharp: [96, 150], far: 70 },
  dusk: { key: [255, 180, 120], shaft: 'rgba(255,190,130,', haze: 'rgba(240,150,120,', mote: ['#ffd8a0', '#ffb080', '#ffe8c0'], cool: [50, 20, 70], sharp: [96, 150], far: 74 },
  glade: { key: [255, 240, 170], shaft: 'rgba(255,240,170,', haze: 'rgba(200,230,170,', mote: ['#fff4a0', '#ffffff', '#d8ffb0'], cool: [10, 40, 30], sharp: [96, 150], far: 78 },
  mushwood: { key: [150, 220, 255], shaft: 'rgba(140,220,255,', haze: 'rgba(120,160,220,', mote: ['#8af0ff', '#d8a8ff', '#c0ffe8'], cool: [20, 10, 50], sharp: [98, 150], far: 88 },
  ruinsOut: { key: [210, 220, 255], shaft: 'rgba(200,215,255,', haze: 'rgba(150,160,190,', mote: ['#e0e8ff', '#c0c8e0', '#ffffff'], cool: [20, 20, 50], sharp: [104, 150], far: 90 },
  mine: { key: [255, 180, 110], shaft: 'rgba(255,190,120,', haze: 'rgba(120,90,70,', mote: ['#ffd090', '#ffb060', '#e0c0a0'], cool: [30, 20, 20], sharp: [104, 150], far: 98 },
  crystalCave: { key: [170, 190, 255], shaft: 'rgba(170,190,255,', haze: 'rgba(130,110,190,', mote: ['#7ad0ff', '#c090ff', '#ffffff'], cool: [20, 10, 50], sharp: [104, 150], far: 98 },
  sewer: { key: [170, 230, 210], shaft: 'rgba(170,230,210,', haze: 'rgba(90,130,120,', mote: ['#a0e0c8', '#d0ffe8', '#80c0a8'], cool: [10, 30, 30], sharp: [110, 150], far: 104 },
  catacomb: { key: [255, 190, 130], shaft: 'rgba(170,180,255,', haze: 'rgba(110,110,170,', mote: ['#c0c8ff', '#ffd8a0', '#e0e0ff'], cool: [20, 10, 50], sharp: [104, 150], far: 98 },
});
