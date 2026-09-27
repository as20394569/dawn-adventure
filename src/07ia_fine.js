/* ===================== FINE RENDERER for battle sprites (used by 07i_hdart.js) =====================
   Renders an ART-style vector definition at high resolution (2 sprite pixels per screen pixel) with richer shading:
   6-tone ramps with ordered dithering between tones, surface grain, rim light on the shadow side, contact shadows,
   thin internal lines and a selective outline (lighter on the lit side). Work is limited to each part's bounding box. */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const FINE_RAMP = {};
function ramp6(base) {
  if (FINE_RAMP[base]) return FINE_RAMP[base];
  const r = ramp(base), [h, s, l] = rgb2hsl(...hex2rgb(base));
  const spec = hsl2hex(hueToward(h, 55, 14), s * 0.6, l + (1 - l) * 0.82);
  const deep = hsl2hex(hueToward(h, 250, 26), Math.min(1, s * 0.85 + 0.12), l * 0.26);
  return FINE_RAMP[base] = [deep, r[4], r[3], r[2], r[1], r[0], spec].map(hex2rgb); // index 0 darkest … 6 specular
}
const fineHash = (x, y) => { let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
function fineBBox(p, k, S) {
  let x0, y0, x1, y1;
  if (p.u) { const b = p.u.map(q => fineBBox(q, k, S)); x0 = Math.min(...b.map(q => q[0])); y0 = Math.min(...b.map(q => q[1])); x1 = Math.max(...b.map(q => q[2])); y1 = Math.max(...b.map(q => q[3])); return [x0, y0, x1, y1]; }
  if (p.s === 'e') { const r = Math.max(p.rx, p.ry || p.rx); x0 = (p.x - r) * k; x1 = (p.x + r) * k; y0 = (p.y - r) * k; y1 = (p.y + r) * k; }
  else if (p.pts) { const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]); x0 = Math.min(...xs) * k; x1 = Math.max(...xs) * k; y0 = Math.min(...ys) * k; y1 = Math.max(...ys) * k; }
  else return [0, 0, 0, 0];
  return [Math.max(0, Math.floor(x0) - 1), Math.max(0, Math.floor(y0) - 1), Math.min(S, Math.ceil(x1) + 1), Math.min(S, Math.ceil(y1) + 1)];
}
function fineInShape(p, X, Y) {
  if (p.u) { for (const q of p.u) if (fineInShape(q, X, Y)) return true; return false; }
  if (p.s === 'e') { let dx = X - p.x, dy = Y - p.y; if (p.rot) { const c = Math.cos(-p.rot), s = Math.sin(-p.rot); const nx = dx * c - dy * s; dy = dx * s + dy * c; dx = nx; } const ry = p.ry || p.rx; return dx * dx / (p.rx * p.rx) + dy * dy / (ry * ry) <= 1; }
  if (!p.pts) return false; let ins = false; const P = p.pts;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1]; if (((yi > Y) !== (yj > Y)) && (X < (xj - xi) * (Y - yi) / (yj - yi) + xi)) ins = !ins; }
  return ins;
}
// def: { parts, details, grain? }  S: canvas size (square)  k: pixels per design unit
function renderFine(def, S, k, opt = {}) {
  const N = S * S, owner = new Int16Array(N).fill(-1), val = new Float32Array(N), edge = new Uint8Array(N);
  const Lx = -0.55, Ly = -0.75, Lz = 0.9, Ll = Math.hypot(Lx, Ly, Lz), lx = Lx / Ll, ly = Ly / Ll, lz = Lz / Ll;
  const ids = {}; def.parts.forEach((p, i) => { if (p.id) ids[p.id] = i; });
  const parts = def.parts.map(p => ({ ...p, clip: p.clip === undefined ? undefined : (typeof p.clip === 'string' ? ids[p.clip] : p.clip) }));
  const boxes = [], masks = [], grain = opt.grain ?? def.grain ?? 0.05;
  parts.forEach((p, pi) => {
    let [bx0, by0, bx1, by1] = fineBBox(p, k, S);
    if (p.clip !== undefined && boxes[p.clip]) { const c = boxes[p.clip]; bx0 = Math.max(bx0, c[0]); by0 = Math.max(by0, c[1]); bx1 = Math.min(bx1, c[2]); by1 = Math.min(by1, c[3]); }
    boxes.push([bx0, by0, bx1, by1]); const bw = Math.max(0, bx1 - bx0), bh = Math.max(0, by1 - by0), m = new Uint8Array(bw * bh); masks.push(m);
    if (!bw || !bh) return;
    const cm = p.clip !== undefined ? masks[p.clip] : null, cb = p.clip !== undefined ? boxes[p.clip] : null, cw = cb ? cb[2] - cb[0] : 0;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const gx = bx0 + x, gy = by0 + y; if (!fineInShape(p, (gx + 0.5) / k, (gy + 0.5) / k)) continue;
      if (cm && !cm[(gy - cb[1]) * cw + (gx - cb[0])]) continue; m[y * bw + x] = 1;
    }
    // chamfer distance inside the box
    const d = new Float32Array(bw * bh); for (let i = 0; i < d.length; i++) d[i] = m[i] ? 1e6 : 0;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const i = y * bw + x; if (!m[i]) continue; d[i] = Math.min(d[i], (x > 0 ? d[i - 1] : 0) + 1, (y > 0 ? d[i - bw] : 0) + 1, (x > 0 && y > 0 ? d[i - bw - 1] : 0) + 1.414, (x < bw - 1 && y > 0 ? d[i - bw + 1] : 0) + 1.414); }
    for (let y = bh - 1; y >= 0; y--) for (let x = bw - 1; x >= 0; x--) { const i = y * bw + x; if (!m[i]) continue; d[i] = Math.min(d[i], (x < bw - 1 ? d[i + 1] : 0) + 1, (y < bh - 1 ? d[i + bw] : 0) + 1, (x < bw - 1 && y < bh - 1 ? d[i + bw + 1] : 0) + 1.414, (x > 0 && y < bh - 1 ? d[i + bw - 1] : 0) + 1.414); }
    let dmax = 1; for (let i = 0; i < d.length; i++) if (d[i] > dmax) dmax = d[i];
    const R = dmax * (p.flat ? 3 : 1.05), hgt = new Float32Array(bw * bh);
    for (let i = 0; i < d.length; i++) if (m[i]) { const dd = Math.min(d[i], R); hgt[i] = Math.sqrt(Math.max(0, R * R - (R - dd) * (R - dd))); }
    const gr = p.grain ?? grain, bright = p.bright || 0;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const i = y * bw + x; if (!m[i]) continue;
      const hx0 = x > 0 ? hgt[i - 1] : 0, hx1 = x < bw - 1 ? hgt[i + 1] : 0, hy0 = y > 0 ? hgt[i - bw] : 0, hy1 = y < bh - 1 ? hgt[i + bw] : 0;
      let nx = -(hx1 - hx0) / 2, ny = -(hy1 - hy0) / 2, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      let I = nx * lx + ny * ly + nz * lz + bright;
      if (d[i] <= 2.2 && nx > 0.25 && ny > 0.1) I += 0.16 * Math.min(1, nx + ny); // rim light on the shadow side
      const gx = bx0 + x, gy = by0 + y, g = gy * S + gx;
      I += (fineHash(gx, gy) - 0.5) * gr;
      owner[g] = pi; val[g] = I; edge[g] = d[i] <= 1.01 ? 1 : 0;
    }
  });
  // contact shadows from parts in front (light from the upper left)
  const sh = Math.max(1, Math.round(k * 0.9));
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, o = owner[i]; if (o < 0 || parts[o].glow || parts[o].noShade) continue;
    for (const [dx, dy] of [[-sh, -sh * 1.5], [-sh * 0.5, -sh * 2], [0, -sh * 2]]) { const xx = Math.round(x + dx), yy = Math.round(y + dy); if (xx < 0 || yy < 0) continue; const o2 = owner[yy * S + xx]; if (o2 > o && !parts[o2].noCast && parts[o2].clip !== o) { val[i] -= 0.28; break; } }
  }
  // tones: continuous light → 6 ramp steps, ordered dither near each step boundary
  const TH = [0.12, 0.3, 0.52, 0.74, 0.9, 0.975]; // → 0 deep … 6 spec
  const img = new Uint8ClampedArray(N * 4), rps = parts.map(p => p.ramp ? [shade(p.ramp[4], -0.3), p.ramp[4], p.ramp[3], p.ramp[2], p.ramp[1], p.ramp[0], p.ramp[0]].map(hex2rgb) : ramp6(p.c));
  const put = (i, c, a = 255) => { img[i * 4] = c[0]; img[i * 4 + 1] = c[1]; img[i * 4 + 2] = c[2]; img[i * 4 + 3] = a; };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, o = owner[i]; if (o < 0) continue; const p = parts[o], rp = rps[o];
    if (p.glow) { put(i, rp[val[i] > 0.75 ? 6 : 5]); continue; }
    const v = val[i] + (BAYER4[(y & 3) * 4 + (x & 3)] - 0.5) * 0.09;
    let t = 0; while (t < TH.length && v > TH[t]) t++;
    if (t === 6 && p.shine === false) t = 5; if (t === 0 && p.flat) t = 1;
    put(i, rp[Math.min(t, rp.length - 1)]);
  }
  // thin internal lines: where a part sits over another part, its border pixel gets a dark line
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, q = owner[i]; if (q < 0) continue; let front = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue; const pp = owner[yy * S + xx]; if (pp > q && parts[pp].line !== false && parts[pp].clip !== q) front = Math.max(front, pp); }
    if (front >= 0) put(i, parts[front].lineCol ? hex2rgb(parts[front].lineCol) : rps[front][1]);
  }
  // selective outline: dark all round, softened on the lit (upper-left) side
  const out = new Uint8ClampedArray(img);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x; if (owner[i] >= 0) continue; let nb = -1, lit = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue; const pp = owner[yy * S + xx]; if (pp >= 0 && !parts[pp].noOutline) { if (pp > nb) nb = pp; if (dx > 0 || dy > 0) lit++; } }
    if (nb < 0) continue; const rp = rps[nb], c = parts[nb].lineCol ? hex2rgb(parts[nb].lineCol) : lit >= 2 ? rp[1] : rp[0];
    const dk = lit >= 2 ? 1 : 0.72; out[i * 4] = c[0] * dk; out[i * 4 + 1] = c[1] * dk; out[i * 4 + 2] = c[2] * dk; out[i * 4 + 3] = 255;
  }
  const cv = mkCanvas(S, S), x = cv.getContext('2d'); x.putImageData(new ImageData(out, S, S), 0, 0);
  drawDetails(x, def.details, k);
  return cv;
}
