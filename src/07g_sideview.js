/* ===================== BATTLE STAGE: flat ground + two platforms (foe far/upper-right, hero near/lower-left) ===================== */
const GROUND_Y = { field: 70, forest: 72, ruins: 96 };
const GROUND_PAL = {
  field: { far: '#86c46e', near: '#4e8a44', pad: '#b8d890', pad2: '#8ab86a', tuft: '#a8dc88', dot: '#3e7a38' },
  forest: { far: '#4e7a44', near: '#2e4e2a', pad: '#7a9a5a', pad2: '#5a7a44', tuft: '#6a9a58', dot: '#24402a' },
  ruins: { far: '#524a60', near: '#322c3e', pad: '#6a627a', pad2: '#4e465e', tuft: '#6aa048', dot: '#26222e' },
};
{ const _bg = buildBattleBG; buildBattleBG = function (kind) {
  const c = _bg(kind), x = c.getContext('2d'), k = GROUND_PAL[kind] ? kind : 'field', P = GROUND_PAL[k], y0 = GROUND_Y[k], r = srand(7);
  const n = BH - y0; for (let y = y0; y < BH; y++) { const t = (y - y0) / n; const [a, b] = [hex2rgb(P.far), hex2rgb(P.near)]; x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; x.fillRect(0, y, W, 1); }
  for (let i = 0; i < 80; i++) { const py = y0 + 4 + Math.floor(r() * (BH - y0 - 6)), px = Math.floor(r() * W), s = 1 + Math.floor((py - y0) / 40); x.fillStyle = r() < 0.6 ? P.tuft : P.dot; x.fillRect(px, py, s + 1, 1); if (k !== 'ruins') x.fillRect(px + 1, py - 1, 1, 1); }
  x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, y0, W, 2);
  // soft vignette instead of battle platforms
  const g = x.createRadialGradient(W / 2, 110, 40, W / 2, 110, 150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,4,14,0.55)'); x.fillStyle = g; x.fillRect(0, 0, W, BH);
  return c;
}; }
