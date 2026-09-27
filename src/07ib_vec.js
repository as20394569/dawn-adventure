/* ===================== VECTOR RENDERER for battle sprites (smooth, anti-aliased, drawn live every frame) =====================
   Draws an ART-style definition (design units) onto a canvas whose transform maps design units → device pixels.
   Shading: radial gradient per part (light from the upper left), dark outline drawn as a wide stroke under each fill
   (so overlaps give clean inner lines), soft gloss highlight, glowing parts, and vector eyes/details. */
function vecSub(x, p) {
  if (p.u) { for (const q of p.u) vecSub(x, q); return; }
  if (p.s === 'e') { const ry = p.ry || p.rx, r = p.rot || 0; x.moveTo(p.x + p.rx * Math.cos(r), p.y + p.rx * Math.sin(r)); x.ellipse(p.x, p.y, Math.max(0.01, p.rx), Math.max(0.01, ry), r, 0, Math.PI * 2); return; }
  if (p.pts && p.pts.length) { x.moveTo(p.pts[0][0], p.pts[0][1]); for (let i = 1; i < p.pts.length; i++) x.lineTo(p.pts[i][0], p.pts[i][1]); x.closePath(); }
}
function vecBox(p) {
  if (p.u) { const b = p.u.map(vecBox); return [Math.min(...b.map(q => q[0])), Math.min(...b.map(q => q[1])), Math.max(...b.map(q => q[2])), Math.max(...b.map(q => q[3]))]; }
  if (p.s === 'e') { const r = Math.max(p.rx, p.ry || p.rx); return [p.x - r, p.y - r, p.x + r, p.y + r]; }
  if (p.pts) { const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
  return [0, 0, 0, 0];
}
// opt: { line: outline width in design units, gloss: 0..1, tint: flat colour (for hit flashes) }
function vecDraw(x, def, opt = {}) {
  const parts = def.parts, ids = {}; parts.forEach((p, i) => { if (p.id) ids[p.id] = i; });
  const clipOf = p => p.clip === undefined ? -1 : typeof p.clip === 'string' ? (ids[p.clip] ?? -1) : p.clip;
  const LW = opt.line || 1.6, gloss = opt.gloss ?? 0.3, tint = opt.tint;
  x.lineJoin = 'round'; x.lineCap = 'round';
  parts.forEach((p, i) => {
    const rp = p.ramp || ramp(p.c), c = clipOf(p), b = vecBox(p), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, R = Math.max(0.5, Math.max(b[2] - b[0], b[3] - b[1]) / 2);
    x.save();
    if (c >= 0) { x.beginPath(); vecSub(x, parts[c]); x.clip(); }
    x.beginPath(); vecSub(x, p);
    if (c < 0 && p.line !== false && !p.noOutline) { x.lineWidth = LW * 2; x.strokeStyle = tint || p.lineCol || shade(rp[4], -0.35); x.stroke(); }
    if (tint) x.fillStyle = tint;
    else {
      const g = x.createRadialGradient(cx - 0.38 * R, cy - 0.45 * R, 0.04 * R, cx, cy, 1.15 * R);
      if (p.glow) { g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, rp[0]); g.addColorStop(1, rp[2]); }
      else if (p.flat) { g.addColorStop(0, rp[1]); g.addColorStop(0.7, rp[2]); g.addColorStop(1, rp[2]); }
      else { g.addColorStop(0, rp[0]); g.addColorStop(0.28, rp[1]); g.addColorStop(0.6, rp[2]); g.addColorStop(0.9, rp[3]); g.addColorStop(1, rp[3]); }
      x.fillStyle = g;
    }
    x.fill();
    // soft gloss on rounded parts
    if (!tint && gloss > 0 && !p.pts && !p.flat && !p.glow && p.shine !== false && R > 3.5) {
      x.globalAlpha = gloss * (p.gloss ?? 1); x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(cx - 0.38 * R, cy - 0.5 * R, 0.26 * R, 0.13 * R, -0.6, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    }
    x.restore();
  });
  if (tint) return;
  for (const d of def.details || []) vecDetail(x, d);
}
function vecDetail(x, d) {
  const E = (X, Y, rx, ry, c) => { x.fillStyle = c; x.beginPath(); x.ellipse(X, Y, Math.max(0.05, rx), Math.max(0.05, ry), 0, 0, Math.PI * 2); x.fill(); };
  if (d.s === 'eye') { const rx = d.w || 2, ry = d.h || 3; E(d.x, d.y, rx, ry, d.c || '#202028'); E(d.x - rx * 0.32, d.y - ry * 0.42, rx * 0.34, ry * 0.26, d.hl || '#ffffff'); }
  else if (d.s === 'eyeW') { const rx = d.w, ry = d.h; E(d.x, d.y, rx + 0.7, ry + 0.7, d.o || '#202028'); E(d.x, d.y, rx, ry, d.w2 || '#ffffff'); const px = d.x + (d.px || 0), py = d.y + (d.py || 0); E(px, py, rx * (d.pr || 0.55), ry * (d.pr2 || 0.7), d.c || '#202028'); E(px - rx * 0.18, py - ry * 0.3, rx * 0.2, ry * 0.16, '#ffffff'); }
  else if (d.s === 'line') { x.strokeStyle = d.c; x.lineWidth = (d.w || 1) * 0.75; x.beginPath(); d.pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.stroke(); }
  else if (d.s === 'dot') E(d.x, d.y, d.r || 0.6, d.r || 0.6, d.c);
  else if (d.s === 'poly') { x.fillStyle = d.c; x.beginPath(); d.pts.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.closePath(); x.fill(); }
  else if (d.s === 'ell') E(d.x, d.y, d.rx, d.ry || d.rx, d.c);
}
