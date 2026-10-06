/* ===================== v12.33 像素特效工具（玩家 2026-10-06：短刀・長槍・透勁・裂地神掌的特效「不像那種武器」「形狀粗糙，跟像素畫風不搭」） =====================
   查到的原因：戰鬥畫面是 176×256 的像素畫，畫布用 3 倍（或 2 倍）放大；舊特效用圓弧、斜線、多邊形直接畫在放大後的畫布上，
   邊緣是平滑的反鋸齒向量線，跟旁邊一格一格的魔物、主角放在一起就像貼上去的粗糙色塊。
   這裡的東西全部「對齊像素格」：只用整數座標的方塊（fillRect）和像素圖（spriteFrom，最近鄰放大），斜線用 Bresenham 一格一格畫，
   圓用中點畫法，多邊形逐列填滿——放大後每一格都是清楚的方塊，跟遊戲裡其他像素圖一樣。
   顏色漸變用「換色＋閃爍」而不是半透明淡出（像素遊戲的做法）。 */
const PXF = {
  sq(x, X, Y, s, c) { x.fillStyle = c; const h = s >> 1; x.fillRect(Math.round(X) - h, Math.round(Y) - h, s, s); },
  // Bresenham: the pixels from A to B
  pts(x0, y0, x1, y1) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const P = [], dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
    for (;;) { P.push([x0, y0]); if ((x0 === x1 && y0 === y1) || ++n > 600) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } return P; },
  line(x, x0, y0, x1, y1, c, s = 1) { x.fillStyle = c; const h = s >> 1; for (const [a, b] of PXF.pts(x0, y0, x1, y1)) x.fillRect(a - h, b - h, s, s); },
  // outline, body, 1-px core
  line3(x, x0, y0, x1, y1, col, s = 2) { PXF.line(x, x0, y0, x1, y1, col[2] || OL13, s + 2); PXF.line(x, x0, y0, x1, y1, col[0], s); if (s >= 2 && col[1]) PXF.line(x, x0, y0, x1, y1, col[1], 1); },
  // a polyline through points
  path3(x, P, col, s = 2) { for (let i = 1; i < P.length; i++) PXF.line(x, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], col[2] || OL13, s + 2);
    for (let i = 1; i < P.length; i++) PXF.line(x, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], col[0], s); if (s >= 2 && col[1]) for (let i = 1; i < P.length; i++) PXF.line(x, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], col[1], 1); },
  // a filled disc / ellipse, row by row
  ell(x, cx, cy, rx, ry, c) { x.fillStyle = c; cx = Math.round(cx); cy = Math.round(cy); const R = Math.ceil(ry); for (let dy = -R; dy <= R; dy++) { const k = 1 - (dy * dy) / Math.max(0.01, ry * ry); if (k < 0) continue; const w = Math.floor(rx * Math.sqrt(k) + 0.35); x.fillRect(cx - w, cy + dy, 2 * w + 1, 1); } },
  disc(x, cx, cy, r, c) { PXF.ell(x, cx, cy, r, r, c); },
  // a ring of square pixels (fl flattens it into an ellipse on the ground)
  ring(x, cx, cy, r, c, s = 1, fl = 1, a0 = 0, a1 = Math.PI * 2) { x.fillStyle = c; const n = Math.max(8, Math.round(Math.abs(a1 - a0) * r * 1.3)), h = s >> 1, seen = new Set();
    for (let i = 0; i <= n; i++) { const an = a0 + (a1 - a0) * i / n, X = Math.round(cx + Math.cos(an) * r), Y = Math.round(cy + Math.sin(an) * r * fl), k = X * 4096 + Y; if (seen.has(k)) continue; seen.add(k); x.fillRect(X - h, Y - h, s, s); } },
  // a polygon filled row by row (no anti-aliasing)
  poly(x, P, c) { x.fillStyle = c; let y0 = Infinity, y1 = -Infinity; for (const q of P) { if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) { const yc = y + 0.5, xs = []; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const ax = P[i][0], ay = P[i][1], bx = P[j][0], by = P[j][1]; if ((ay > yc) !== (by > yc)) xs.push(ax + (yc - ay) * (bx - ax) / (by - ay)); }
      xs.sort((a, b) => a - b); for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if (b > a) x.fillRect(a, y, b - a, 1); } } },
  polyO(x, P, c, o = OL13) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) PXF.poly(x, P.map(q => [q[0] + dx, q[1] + dy]), o); PXF.poly(x, P, c); },
  spr(x, img, X, Y, sc = 1) { if (!img) return; x.imageSmoothingEnabled = false; const w = img.width * sc, h = img.height * sc; x.drawImage(img, Math.round(X - w / 2), Math.round(Y - h / 2), w, h); },
};
// ---------- pixel sprites ----------
const PXS = (rows, pal) => spriteFrom(rows, Object.assign({ k: OL13 }, pal));
const PXV = rows => rows.slice().reverse(); // upside down
const PXI = {
  glint: PXS(['...w...', '...w...', '..wyw..', 'wwyyyww', '..wyw..', '...w...', '...w...'], { w: '#ffffff', y: '#ffe070' }),
  glintS: PXS(['..w..', '.wyw.', 'wyyyw', '.wyw.', '..w..'], { w: '#ffffff', y: '#ffe070' }),
  flameA: PXS(['...k...', '..krk..', '..krok.', '.kroork', '.kroyok', 'kroyyok', 'kroywok', 'kroyyok', '.kroook', '.kkkkk.'], { r: '#d8361a', o: '#ff8a1e', y: '#ffd84a', w: '#fff8d0' }),
  ice: PXS(['...w...', '.w.c.w.', '..ccc..', 'wcccccw', '..ccc..', '.w.c.w.', '...w...'], { w: '#ffffff', c: '#9ad8ff' }),
  leaf: PXS(['..kk.', '.kglk', 'kgglk', 'kggk.', '.kk..'], { g: '#3aa040', l: '#b8f080' }),
  cloud: PXS(['........kkkk............', '......kkllllkk..kkk.....', '....kkllllllllkkllkk....', '..kkmllllmmlllllllllkk..', '.kmmmmlmmmmmmllmmmmmmmk.',
    'kdmmmmmmmmmmmmmmmmmmmmdk', 'kddmmmdddmmmmmddmmmdddk.', '.kdddddddddddddddddddk..', '..kkkkkkkkkkkkkkkkkkk...'], { d: '#3a3a56', m: '#5e5e80', l: '#8a8ab0' }),
  shield: PXS(['kkkkkkkkkkkkk', 'ksssssssssssk', 'ksbbbbbbbbbSk', 'ksbbbbgbbbbSk', 'ksbbbgggbbbSk', 'ksbbbbgbbbbSk', 'ksbbbbgbbbbSk', 'ksbbbbgbbbBSk',
    '.ksbbbgbbBSk.', '.ksbbbgbbBSk.', '..ksbbgbBSk..', '..ksbbbBBSk..', '...ksbBBSk...', '....ksSSk....', '.....kkk.....'], { s: '#d8e2f2', S: '#7a88a8', b: '#3a6ad0', B: '#26449a', g: '#ffd040' }),
  fist: PXS(['.kkkkkkk.', 'kYYkYYkYk', 'kyykyykyk', 'kyykyykyk', 'kkkkkkkyk', 'kYYYYYkyk', 'kyyyyyyyk', 'kdyyyyydk', '.kdddddk.', '.kkkkkkk.'], { Y: '#ffe08a', y: '#ffb020', d: '#c07010' }),
  daggerDn: PXS(['.kkk.', '.kbk.', '.kbk.', 'kgggk', 'kwssk', 'kwssk', 'kwssk', 'kwssk', '.kwsk', '.kwk.', '..k..'], { b: '#3a2050', g: '#8a5ad0', w: '#ffffff', s: '#b8a8d8' }),
  moon: PXS(['...kkkkk...', '.kkwyyykk..', 'kwyyykk....', 'kwyyk......', 'kwyyk......', 'kwyyk......', 'kwyyk......', 'kwyyk......', 'kwyyykk....', '.kkwyyykk..', '...kkkkk...'], { w: '#fffbe0', y: '#f4e27a' }),
  rock: PXS(['.kkkk.', 'kRRrrk', 'kRrrdk', 'krrddk', '.kkkk.'], { R: '#d0a878', r: '#a07848', d: '#6a4a2a' }),
  skull: PXS(['.kkkkk.', 'kwwwwwk', 'kwkwkwk', 'kwwwwwk', '.kwkwk.', '.kkkkk.'], { w: '#ffe0e0' }),
  bubble: PXS(['.kkk.', 'kgwgk', 'kgggk', 'kgggk', '.kkk.'], { g: '#7ad048', w: '#e8ffd0' }),
  zap: PXS(['..kk', '.kyk', 'kyk.', 'kyyk', '.kyk', 'kyk.', 'kk..'], { y: '#ffe040' }),
  dizzy: PXS(['..k..', '.kyk.', 'kyyyk', '.kyk.', '..k..'], { y: '#ffe060' }),
  gem: c => PXS(['..k..', '.kwk.', 'kwcck', 'kccck', 'kcdck', '.kdk.', '..k..'], { w: '#ffffff', c: c[0], d: c[2] }),
};
PXI.flameB = flipCanvas(PXI.flameA);
// a grey armour plate (the 'defence' a spear or a fist goes through) and its two halves
PXI.plate = PXS(['kkkkkkkkkkkkk', 'kwwwwwwwwwwwk', 'kwssssgssssSk', 'kwsWssgssssSk', 'kwsssggssssSk', 'kwsssgggsssSk', 'kwssssgssssSk', 'kwssssgsssSSk', '.kwsssgssSSk.', '.kwsssgssSSk.', '..kwssgsSSk..', '...kwsgSSk...', '....kwgSk....', '.....kkk.....'], { w: '#f0f4fa', s: '#b0bccc', S: '#7a8498', W: '#ffffff', g: '#6a7488' });
PXI.half = (img, right) => { const w = Math.ceil(img.width / 2), c = mkCanvas(w, img.height), g = c.getContext('2d'); g.drawImage(img, right ? -Math.floor(img.width / 2) : 0, 0); return c; };
PXI.plateL = PXI.half(PXI.plate, 0); PXI.plateR = PXI.half(PXI.plate, 1);
PXI.upCh = c => PXS(['...k...', '..kck..', '.kcwck.', 'kck.kck', 'kk...kk'], { c, w: '#ffffff' });
PXI.dnCh = c => PXS(PXV(['...k...', '..kck..', '.kcwck.', 'kck.kck', 'kk...kk']), { c, w: '#ffffff' });
// colours: [body, light, outline]
const PXC = {
  steel: ['#c8d4e8', '#ffffff', OL13], blade: ['#e8f0ff', '#ffffff', '#1a1430'], venom: ['#5ad048', '#e0ffc0', '#0a2a0a'], volt: ['#ffd820', '#ffffff', '#3a2a00'], blood: ['#e8263e', '#ffd0d8', '#2a0410'],
  shade: ['#8a5ad0', '#efe0ff', '#12061e'], moon: ['#f4e27a', '#ffffff', '#1c1a3a'], gold: ['#ffcc33', '#fffbe0', '#3a2806'], chi: ['#ffb020', '#fff6d0', '#3a2000'], wind: ['#bfe8ff', '#ffffff', '#0a2a3a'],
  fire: ['#ff5a20', '#ffe08a', '#3a0a00'], fire2: ['#ff9a30', '#fff6c0', '#5a1800'], ice: ['#5ab8ff', '#e8f8ff', '#061a40'], leaf: ['#3aa040', '#c8f8a0', '#06300a'], azure: ['#3a8aff', '#d8ecff', '#06163a'],
  wood: ['#8a5a2a', '#c8904a', '#2a1406'], red: ['#ff3a2a', '#ffe0c0', '#2a0600'], rock: ['#a07848', '#d0a878', '#2a1a0a'], blue: ['#3a6ad0', '#c8e0ff', '#0a1440'],
};
const EL13PX = { 火: PXC.fire, 水: PXC.ice, 雷: PXC.volt, 草: PXC.leaf };
// ---------- particles ----------
Object.assign(HERO_PK, {
  // a pixel sprite; frames, integer scale; blinks out at the end
  p13spr(x, p, a) { if (p.t < (p.delay || 0)) return; if (p.blink !== 0 && a < 0.28 && p.t % 2) return; const F = p.frames || [p.img], i = p.fps ? (p.once ? Math.min(F.length - 1, Math.floor(p.t / p.fps)) : Math.floor(p.t / p.fps) % F.length) : 0;
    if (p.al != null) x.globalAlpha = p.al; PXF.spr(x, F[i], p.x, p.y, p.sc || 1); },
  // a pixel streak A→B: the head runs out in `grow` frames, the tail follows (hold: frames before the tail starts)
  p13line(x, p, a) { if (p.t < (p.delay || 0)) return; const t = p.t - (p.delay || 0), G = p.grow || 3, Hd = p.hold ?? G, g = clamp(t / G, 0, 1), tl = p.keep ? 0 : clamp((t - Hd) / Math.max(1, p.life - (p.delay || 0) - Hd), 0, 1);
    const X0 = lerp(p.x1, p.x2, tl), Y0 = lerp(p.y1, p.y2, tl), X1 = lerp(p.x1, p.x2, g), Y1 = lerp(p.y1, p.y2, g); if (Math.abs(X1 - X0) + Math.abs(Y1 - Y0) < 1) return;
    if (p.blink && a < 0.3 && p.t % 2) return; if (p.thin) PXF.line(x, X0, Y0, X1, Y1, p.c[0], p.s || 1); else PXF.line3(x, X0, Y0, X1, Y1, p.c, p.s || 2); },
  // a pixel crescent (centre, radius, from a0 to a1; fl flattens it): thick in the middle, pointed ends
  p13arc(x, p, a) { if (p.t < (p.delay || 0)) return; const t = p.t - (p.delay || 0), G = p.grow || 4, g = clamp(t / G, 0, 1), tl = clamp((t - G - (p.hold || 0)) / Math.max(1, p.life - (p.delay || 0) - G - (p.hold || 0)), 0, 1), A0 = lerp(p.a0, p.a1, tl * 0.92), A1 = lerp(p.a0, p.a1, g);
    if (Math.abs(A1 - A0) < 0.03) return; const n = Math.max(6, Math.ceil(Math.abs(A1 - A0) * p.r * (p.fl && p.fl < 1 ? 0.8 : 1))), fl = p.fl || 1, Wd = p.w || 4, P = [];
    for (let i = 0; i <= n; i++) { const u = i / n, an = A0 + (A1 - A0) * u, w = Math.max(1, Math.round(Wd * Math.sin(Math.PI * (0.08 + u * 0.84)) * (1 - tl * 0.5))); P.push([p.x + Math.cos(an) * p.r, p.y + Math.sin(an) * p.r * fl, w]); }
    for (const [X, Y, w] of P) PXF.sq(x, X, Y, w + 2, p.c[2] || OL13); for (const [X, Y, w] of P) PXF.sq(x, X, Y, w, p.c[0]); for (const [X, Y, w] of P) if (w >= 3) PXF.sq(x, X, Y, 1, p.c[1]); },
  // a pixel ring that grows (ease-out), thins and blinks out
  p13ring(x, p, a) { if (p.t < (p.delay || 0)) return; const t = p.t - (p.delay || 0), L = p.life - (p.delay || 0), e = 1 - Math.pow(1 - clamp(t / L, 0, 1), 2), r = lerp(p.r0, p.r1, e), s = a > 0.5 ? (p.s || 2) : Math.max(1, (p.s || 2) - 1);
    if (a < 0.25 && p.t % 2) return; if (p.c[2] !== null) PXF.ring(x, p.x, p.y, r, p.c[2] || OL13, s + 2, p.fl || 1); PXF.ring(x, p.x, p.y, r, a > 0.45 ? p.c[0] : (p.c[3] || p.c[0]), s, p.fl || 1); },
  // an 8-ray hit burst (rays on the 8 pixel directions: always crisp); the middle hollows out
  p13burst(x, p, a) { if (p.t < (p.delay || 0)) return; const t = p.t - (p.delay || 0), L = p.life - (p.delay || 0), R = p.r || 12, R1 = R * (0.45 + 0.55 * clamp(t / 3, 0, 1)), R0 = R * 0.85 * clamp((t - 1) / Math.max(1, L - 1), 0, 1), s = p.s || 2;
    if (t < 3) { PXF.disc(x, p.x, p.y, Math.max(2, R * 0.3) + 1, p.c[2] || OL13); PXF.disc(x, p.x, p.y, Math.max(2, R * 0.3), t < 2 ? '#ffffff' : p.c[0]); }
    const D = p.n === 'x' ? [[1, 1], [-1, 1], [-1, -1], [1, -1]] : (p.n || 8) === 4 ? [[1, 0], [0, 1], [-1, 0], [0, -1]] : [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    for (const pass of [0, 1, 2]) D.forEach(([dx, dy], i) => { const k = (dx && dy ? 0.72 : 1) * (p.n === 8 && i % 2 ? 0.8 : 1), x0 = p.x + dx * R0 * k, y0 = p.y + dy * R0 * k, x1 = p.x + dx * R1 * k, y1 = p.y + dy * R1 * k; if (Math.abs(x1 - x0) + Math.abs(y1 - y0) < 1) return;
      if (pass === 0) PXF.line(x, x0, y0, x1, y1, p.c[2] || OL13, s + 2); else if (pass === 1) PXF.line(x, x0, y0, x1, y1, p.c[0], s); else if (s >= 2) PXF.line(x, x0, y0, x1, y1, p.c[1], 1); }); },
  // a square bit that flies (vx, vy, g) and steps through colours
  p13px(x, p, a) { if (p.t < (p.delay || 0)) return; const C = p.cols || [p.c], i = Math.min(C.length - 1, Math.floor((1 - a) * C.length)); if (p.blink && a < 0.25 && p.t % 2) return; if (p.o) PXF.sq(x, p.x, p.y, (p.s || 2) + 2, p.o); PXF.sq(x, p.x, p.y, p.s || 2, C[i]); },
  // a pixel ball [outline, edge, mid, core] with a stepped trail
  p13orb(x, p, a) { if (p.t < (p.delay || 0)) return; const Hs = p.hist || (p.hist = []); Hs.push([p.x, p.y]); if (Hs.length > (p.trail || 6)) Hs.shift(); const C = p.c;
    Hs.forEach(([q, w], i) => { if (i === Hs.length - 1) return; const k = (i + 1) / Hs.length, r = Math.max(1, Math.round(p.r * k * 0.75)); PXF.disc(x, q, w, r, i % 2 ? C[1] : C[2]); });
    const r = p.r + (p.pulse && p.t % 4 < 2 ? 1 : 0); PXF.disc(x, p.x, p.y, r + 1, C[0]); PXF.disc(x, p.x, p.y, r, C[1]); PXF.disc(x, p.x, p.y, Math.max(1, r - 1.5), C[2]); PXF.disc(x, p.x - Math.round(r * 0.3), p.y - Math.round(r * 0.3), Math.max(1, Math.round(r * 0.4)), C[3]); },
  // a jagged bolt along points; flickers
  p13bolt(x, p, a) { if (p.t < (p.delay || 0)) return; if (p.t > 4 && p.t % 3 === 1) return; const n = Math.max(2, Math.ceil(p.pts.length * clamp((p.t - (p.delay || 0) + 1) / (p.grow || 2), 0, 1))); PXF.path3(x, p.pts.slice(0, n), p.c, p.s || 2); },
  // any polygon(s) in local coordinates, rotated (rasterised every frame: crisp at any angle)
  p13poly(x, p, a) { if (p.t < (p.delay || 0)) return; if (p.blink !== 0 && a < 0.28 && p.t % 2) return; const r = (p.rot || 0) + (p.vr || 0) * p.t, sc = p.sc || 1, cs = Math.cos(r), sn = Math.sin(r);
    for (const s of p.shapes) { const P = s.pts.map(([u, v]) => [p.x + (u * cs - v * sn) * sc, p.y + (u * sn + v * cs) * sc]); if (s.o === null) PXF.poly(x, P, s.c); else PXF.polyO(x, P, s.c, s.o || OL13); } },
  // a thrust of light (no weapon drawn): a tapered spike whose point runs from (x1,y1) to (x2,y2) in `grow` frames, holds, then the tail follows it in
  p13thr(x, p, a) { if (p.t < (p.delay || 0)) return; const t = p.t - (p.delay || 0), G = p.grow || 2, Hd = p.hold ?? 3, L = p.life - (p.delay || 0), g = clamp(t / G, 0, 1), tl = clamp((t - G - Hd) / Math.max(1, L - G - Hd), 0, 1);
    const dx = p.x2 - p.x1, dy = p.y2 - p.y1, D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D, nx = -uy, ny = ux, tip = { x: p.x1 + dx * g, y: p.y1 + dy * g }, tail = { x: p.x1 + dx * Math.max(tl, p.cut || 0), y: p.y1 + dy * Math.max(tl, p.cut || 0) }, len = Math.hypot(tip.x - tail.x, tip.y - tail.y);
    if (len < 2 || (p.blink !== 0 && a < 0.25 && p.t % 2)) return; const w = (p.w || 4) * (1 - tl * 0.6) / 2, m = { x: tip.x - ux * Math.min(len * 0.3, (p.w || 4) * 2.2), y: tip.y - uy * Math.min(len * 0.3, (p.w || 4) * 2.2) };
    PXF.polyO(x, [[tip.x + ux, tip.y + uy], [m.x + nx * w, m.y + ny * w], [tail.x + nx * 0.6, tail.y + ny * 0.6], [tail.x - nx * 0.6, tail.y - ny * 0.6], [m.x - nx * w, m.y - ny * w]], p.c[0], p.c[2] || OL13);
    if (w >= 1.2) PXF.line(x, lerp(tail.x, tip.x, 0.25), lerp(tail.y, tip.y, 0.25), tip.x - ux, tip.y - uy, p.c[1], 1); },
  // a wave front (a crescent facing ang, radius r around its centre): thick in the middle; the centre and r can be moved by upd
  p13wave(x, p, a) { if (p.t < (p.delay || 0) || (a < 0.25 && p.t % 2)) return; const sp = p.span || 1.8, n = Math.max(8, Math.round(sp * p.r * 1.2)), P = [], fl = p.fl || 1;
    for (let i = 0; i <= n; i++) { const u = i / n, an = p.ang - sp / 2 + sp * u, w = Math.max(1, Math.round(p.w * Math.sin(Math.PI * (0.08 + u * 0.84)))); P.push([p.x + Math.cos(an) * p.r, p.y + Math.sin(an) * p.r * fl, w]); }
    for (const [X, Y, w] of P) PXF.sq(x, X, Y, w + 2, p.c[2] || OL13); for (const [X, Y, w] of P) PXF.sq(x, X, Y, w, p.c[0]); for (const [X, Y, w] of P) if (w >= 3) PXF.sq(x, X, Y, 1, p.c[1]); },
  // a wavy vine from A to B (grows), leaves along it
  p13vine(x, p, a) { const g = clamp(p.t / (p.grow || 6), 0, 1), N = 16, P = [], dx = p.x2 - p.x1, dy = p.y2 - p.y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (let i = 0; i <= N * g; i++) { const u = i / N, w = Math.sin(u * Math.PI * (p.waves || 2.5) + p.t * 0.25) * (p.amp || 6) * Math.sin(Math.PI * u); P.push([p.x1 + dx * u + nx * w, p.y1 + dy * u + ny * w]); }
    if (P.length < 2) return; if (p.blink && a < 0.28 && p.t % 2) return; PXF.path3(x, P, p.c, p.s || 2); P.forEach((q, i) => { if (i % 4 === 2) PXF.spr(x, PXI.leaf, q[0] + (i % 8 === 2 ? 4 : -4), q[1] - 3, 2); }); },
  // a ground crack: jagged pixel line that runs out, glowing inside
  p13crack(x, p, a) { if (p.t < (p.delay || 0)) return; const n = Math.max(2, Math.ceil(p.pts.length * clamp((p.t - (p.delay || 0) + 1) / (p.grow || 6), 0, 1))), P = p.pts.slice(0, n);
    const s = p.s || 1; for (let i = 1; i < P.length; i++) PXF.line(x, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], p.o || '#1a0c00', s + 2); const glow = a > 0.35 || p.t % 2 ? p.c : (p.c2 || p.c); for (let i = 1; i < P.length; i++) PXF.line(x, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], glow, s); },
  // a dark pixel ellipse on the ground (a shadow)
  p13shadow(x, p, a) { const g = clamp(p.t / (p.grow || 6), 0, 1), rx = lerp(p.r0 || 4, p.rx, g), ry = rx * (p.fl || 0.3); if (a < 0.25 && p.t % 2) return; PXF.ell(x, p.x, p.y, rx + 1, ry + 1, p.o || '#0a0418'); PXF.ell(x, p.x, p.y, rx, ry, p.c || '#2a1844'); },
  // a column of light made of pixel rows (a pillar)
  p13col(x, p, a) { if (p.t < (p.delay || 0)) return; const t = p.t - (p.delay || 0), g = clamp(t / (p.grow || 4), 0, 1), h = Math.round(p.h * g), w = Math.max(1, Math.round(p.w * (a > 0.5 ? 1 : a * 2))); if (a < 0.25 && p.t % 2) return;
    x.fillStyle = p.c[2] || OL13; x.fillRect(Math.round(p.x - w / 2) - 1, Math.round(p.y - h), w + 2, h); x.fillStyle = p.c[0]; x.fillRect(Math.round(p.x - w / 2), Math.round(p.y - h), w, h); if (w >= 3) { x.fillStyle = p.c[1]; x.fillRect(Math.round(p.x - w / 6), Math.round(p.y - h), Math.max(1, Math.round(w / 3)), h); } },
});
// ---------- helpers (b = the battle scene; every position is rounded when drawn) ----------
const PX13 = {
  hero(b) { return b.center(b.H); },
  hand(b) { const H = b.center(b.H); return { x: H.x + 9, y: H.y - 12 }; }, // the weapon hand (the hero is seen from behind, weapon on the right)
  tip(b) { const H = b.center(b.H); return { x: H.x + 16, y: H.y - 30 }; }, // the staff's tip
  foes(b, t) { return K13.views(b, t).filter(v => v && !v.gone).map(v => ({ v, P: b.center(v) })); },
  dir(A, B) { const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1; return { ux: dx / L, uy: dy / L, nx: -dy / L, ny: dx / L, L, ang: Math.atan2(dy, dx) }; },
  line(b, A, B, col, s = 2, life = 10, o = {}) { return b.spawn(Object.assign({ k: 'p13line', x1: A.x, y1: A.y, x2: B.x, y2: B.y, c: col, s, life }, o)); },
  arc(b, P, r, a0, a1, col, w = 4, life = 12, o = {}) { return b.spawn(Object.assign({ k: 'p13arc', x: P.x, y: P.y, r, a0, a1, c: col, w, life }, o)); },
  ring(b, P, r0, r1, col, s = 2, life = 12, o = {}) { return b.spawn(Object.assign({ k: 'p13ring', x: P.x, y: P.y, r0, r1, c: col, s, life }, o)); },
  burst(b, P, r, col, life = 10, o = {}) { return b.spawn(Object.assign({ k: 'p13burst', x: P.x, y: P.y, r, c: col, life }, o)); },
  spr(b, img, P, o = {}) { return b.spawn(Object.assign({ k: 'p13spr', img, x: P.x, y: P.y, life: 20 }, o)); },
  bits(b, P, n, cols, spd = 2, g = 0.15, life = 18, o = {}) { for (let i = 0; i < n; i++) { const an = o.ang != null ? o.ang + rnd(-10, 10) / 10 * (o.spread || 0.6) : Math.random() * Math.PI * 2, v = spd * (0.5 + Math.random() * 0.7);
      b.spawn({ k: 'p13px', x: P.x + rnd(-2, 2), y: P.y + rnd(-2, 2), vx: Math.cos(an) * v, vy: Math.sin(an) * v - (o.up || 0), g, s: o.s || (i % 3 ? 2 : 3), cols, o: o.o, life: life + rnd(-3, 3), blink: 1 }); } },
  // a hit: white flash square, 8-ray burst, a pixel ring, flying bits
  // (no ring on top of the rays: a ring with rays inside reads as a wheel)
  hit(b, P, col, big = 0) { PX13.burst(b, P, big ? 18 : 12, col, big ? 12 : 9, { s: big ? 3 : 2 }); PX13.bits(b, P, big ? 10 : 6, [col[1], col[0], col[0]], big ? 2.6 : 2, 0.12, 14, { s: 3 }); b.shake = Math.max(b.shake || 0, big ? 8 : 3); },
  // a jagged path from A to B (lightning, cracks)
  zig(A, B, n = 7, amp = 6) { const P = [[A.x, A.y]], d = PX13.dir(A, B); for (let i = 1; i < n; i++) { const u = i / n, w = (Math.random() * 2 - 1) * amp; P.push([A.x + (B.x - A.x) * u + d.nx * w, A.y + (B.y - A.y) * u + d.ny * w]); } P.push([B.x, B.y]); return P; },
  // a thrust of light from A into B (o.over: how far past B the point goes)
  thr(b, A, B, col, w = 4, life = 12, o = {}) { const d = PX13.dir(A, B), over = o.over ?? 3; return b.spawn(Object.assign({ k: 'p13thr', x1: A.x, y1: A.y, x2: B.x + d.ux * over, y2: B.y + d.uy * over, c: col, w, life }, o)); },
  // a stab mark into P coming from `from` (default: the weapon hand): a short light spike, len px long
  stab(b, P, col, o = {}) { const A = o.from || PX13.hand(b), d = PX13.dir(A, P), L = o.len || 26; return PX13.thr(b, { x: P.x - d.ux * L, y: P.y - d.uy * L }, P, col, o.w || 3, o.life || 11, o); },
  // speed lines along a direction around a point
  speed(b, A, B, col, n = 6, life = 8) { const d = PX13.dir(A, B); for (let i = 0; i < n; i++) { const off = (i - (n - 1) / 2) * 5 + rnd(-1, 1), s0 = rnd(0, 20), len = rnd(14, 26), P0 = { x: A.x + d.nx * off + d.ux * s0, y: A.y + d.ny * off + d.uy * s0 };
      b.spawn({ k: 'p13line', x1: P0.x, y1: P0.y, x2: P0.x + d.ux * len, y2: P0.y + d.uy * len, c: [i % 2 ? col[0] : col[1]], thin: 1, s: 1, grow: 2, life: life + rnd(-2, 2), delay: rnd(0, 3) }); } },
};
