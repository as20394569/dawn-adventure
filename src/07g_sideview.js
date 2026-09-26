/* ===================== SIDE-VIEW BATTLE: flat ground stage + hero drawn from the field sprite (facing left, weapon in hand) ===================== */
const GROUND_Y = { field: 70, forest: 72, ruins: 96 };
const GROUND_PAL = {
  field: { far: '#86c46e', near: '#4e8a44', strip: '#c8a870', strip2: '#b89860', tuft: '#a8dc88', dot: '#3e7a38' },
  forest: { far: '#4e7a44', near: '#2e4e2a', strip: '#6a5a3a', strip2: '#5a4c30', tuft: '#6a9a58', dot: '#24402a' },
  ruins: { far: '#524a60', near: '#322c3e', strip: '#5e566e', strip2: '#4a4458', tuft: '#6aa048', dot: '#26222e' },
};
{ const _bg = buildBattleBG; buildBattleBG = function (kind) {
  const c = _bg(kind), x = c.getContext('2d'), k = GROUND_PAL[kind] ? kind : 'field', P = GROUND_PAL[k], y0 = GROUND_Y[k], r = srand(7);
  // flat ground: light far away → darker in front (no vanishing road)
  const n = BH - y0; for (let y = y0; y < BH; y++) { const t = (y - y0) / n; const [a, b] = [hex2rgb(P.far), hex2rgb(P.near)]; x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; x.fillRect(0, y, W, 1); }
  // the stage both fighters stand on
  x.fillStyle = P.strip2; x.fillRect(0, FOE_FOOT - 10, W, 18); x.fillStyle = P.strip; x.fillRect(0, FOE_FOOT - 9, W, 15); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, FOE_FOOT - 9, W, 1); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, FOE_FOOT + 6, W, 2);
  for (let i = 0; i < 40; i++) { const px = Math.floor(r() * W), py = FOE_FOOT - 8 + Math.floor(r() * 13); x.fillStyle = r() < 0.5 ? P.strip2 : 'rgba(255,255,255,0.15)'; x.fillRect(px, py, 2, 1); }
  // texture above/below the stage
  for (let i = 0; i < 70; i++) { const py = y0 + 4 + Math.floor(r() * (FOE_FOOT - 16 - y0)), px = Math.floor(r() * W), s = 1 + Math.floor((py - y0) / 30); x.fillStyle = r() < 0.6 ? P.tuft : P.dot; x.fillRect(px, py, s + 1, 1); if (k !== 'ruins') x.fillRect(px + 1, py - 1, 1, 1); }
  for (let i = 0; i < 30; i++) { const py = FOE_FOOT + 10 + Math.floor(r() * (BH - FOE_FOOT - 12)), px = Math.floor(r() * W); x.fillStyle = r() < 0.5 ? P.tuft : P.dot; x.fillRect(px, py, 3, 1); if (k !== 'ruins') x.fillRect(px + 1, py - 1, 1, 1); }
  x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, y0, W, 2);
  return c;
}; }
// hero in battle = the field paper-doll sprite facing left (toward the foe), 3x, with the weapon held forward
const heroSideCache = {};
function heroSideImg(frame, L) {
  const key = frame + lookKey(L); if (heroSideCache[key]) return heroSideCache[key];
  const CW = 28, CH = 24, n = mkCanvas(CW, CH), x = n.getContext('2d'); const body = heroFramesLook({ ...L, weapon: null }).left[frame ? 1 : 0]; x.drawImage(body, 8, 1);
  const W0 = L.weapon; if (W0) {
    const P = WPN_PAL[W0[1]] || WPN_PAL.steel, pts = [], ln = (x0, y0, x1, y1, c) => { const m = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let t = 0; t <= m; t++) pts.push([Math.round(x0 + (x1 - x0) * t / m), Math.round(y0 + (y1 - y0) * t / m), c]); };
    const up = frame ? -2 : 0; // raised during attacks
    if (W0[0] === 'sword') { pts.push([13, 17, P.T], [12, 16, P.T], [11, 15, P.U], [12, 14, P.U], [10, 16, P.U]); ln(10, 14 + up, 3, 7 + up * 2, P.I); ln(11, 13 + up, 4, 6 + up * 2, P.i); pts.push([2, 6 + up * 2, P.I]); }
    if (W0[0] === 'dagger') { pts.push([13, 17, P.T], [12, 16, P.U], [11, 17, P.U]); ln(11, 15, 8, 12 + up, P.I); ln(12, 15, 9, 12 + up, P.i); }
    if (W0[0] === 'axe') { ln(14, 21, 9, 5 + up, P.T); for (const [a, b, c] of [[8, 3, 'i'], [7, 4, 'I'], [6, 4, 'I'], [7, 5, 'I'], [6, 5, 'I'], [5, 5, 'I'], [7, 6, 'I'], [6, 6, 'i'], [7, 7, 'i'], [10, 4, 'i'], [10, 5, 'i']]) pts.push([a, b + up, P[c]]); }
    if (W0[0] === 'staff') { ln(14, 22, 9, 4 + up, P.T); for (const [a, b] of [[8, 2], [9, 2], [8, 3], [9, 3], [7, 3], [10, 3], [8, 1]]) pts.push([a, b + up, P.V]); pts.push([8, 2 + up, '#ffffff']); }
    if (W0[0] === 'tome') { for (let yy = 10; yy <= 13; yy++) for (let xx = 3; xx <= 10; xx++) { const edge = yy === 13 || xx === 3 || xx === 10; pts.push([xx, yy + up, edge ? P.T : xx === 6 || xx === 7 ? P.U : P.V]); } pts.push([6, 7 + up, P.U], [4, 8 + up, '#ffffff'], [12, 16, P.T]); }
    const id = x.getImageData(0, 0, CW, CH), d = id.data, set = new Set(pts.map(([a, b]) => a + ',' + b));
    const put = (px, py, c) => { if (px < 0 || py < 0 || px >= CW || py >= CH) return; const [r, g, bb] = hex2rgb(c), k = (py * CW + px) * 4; d[k] = r; d[k + 1] = g; d[k + 2] = bb; d[k + 3] = 255; };
    for (const [px, py, c] of pts) put(px, py, c);
    for (const [px, py] of pts) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= CW || qy >= CH || set.has(qx + ',' + qy)) continue; if (d[(qy * CW + qx) * 4 + 3] === 0) put(qx, qy, '#2a2238'); }
    x.putImageData(id, 0, 0);
  }
  const big = mkCanvas(CW * 3, CH * 3), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(n, 0, 0, CW, CH, 0, 0, CW * 3, CH * 3);
  return heroSideCache[key] = big;
}
