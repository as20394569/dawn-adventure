/* ===================== ART: sprites, tiles, procedural monsters ===================== */
function spriteFrom(rows, pal, flip = false) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const c = mkCanvas(w, h), x = c.getContext('2d'); const id = x.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let i = 0; i < rows[y].length; i++) {
    const ch = rows[y][i]; if (ch === '.' || ch === ' ') continue; const col = pal[ch]; if (!col) continue;
    const [r, g, b] = hex2rgb(col); const xx = flip ? w - 1 - i : i; const k = (y * w + xx) * 4;
    id.data[k] = r; id.data[k + 1] = g; id.data[k + 2] = b; id.data[k + 3] = 255;
  }
  x.putImageData(id, 0, 0); return c;
}
function flipCanvas(c) { const o = mkCanvas(c.width, c.height), x = o.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); return o; }

/* ---------------- Hero overworld sprite (16x22) ---------------- */
const VILLAGER_PAL = { k: '#2a2238', H: '#34407a', h: '#4d62b0', j: '#86a0e8', S: '#f8d0a8', s: '#e0a07c', w: '#ffffff', Y: '#f8c838', y: '#d08818', R: '#d04848', r: '#982838', B: '#7a4828', b: '#4e2c1c', P: '#3c3a58', p: '#2a2840', G: '#d8dce8', g: '#8088a0' };
const VILLAGER_ROWS = {
  down: [
    '................',
    '......kkkk......',
    '....kkHHjHkk....',
    '...kHHHhjjHHk...',
    '..kHHHHHhhHHHk..',
    '..kHHHHHHHHHHk..',
    '.kHHHHHHHHHHHHk.',
    '.kHHkHHHHHHkHHk.',
    '.kHkSSHkkHSSkHk.',
    '.kHSSSSSSSSSSHk.',
    '.kkSSkSSSSkSSkk.',
    '..kSSkSSSSkSSk..',
    '...ksSSSSSSsk...',
    '..kkYYYYYYYYkk..',
    '.kSkRyYYYYyRkSk.',
    '.kSkRRRyyRRRkSk.',
    '.kskrRRRRRRrksk.',
    '..kkBBBGGBBBkk..',
  ],
  up: [
    '................',
    '......kkkk......',
    '....kkHHHHkk....',
    '...kHHHhhHHHk...',
    '..kHHHhjjhHHHk..',
    '..kHHHHhhHHHHk..',
    '.kHHHHHHHHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kHHhHHHHHHhHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kkHHHHHHHHHHkk.',
    '..kkHkHHHHkHkk..',
    '...kskkkkkksk...',
    '..kkYYYYYYYYkk..',
    '.kSkRRyYYyRRkSk.',
    '.kSkRRRYyRgGkSk.',
    '.kskrRRyRgGRksk.',
    '..kkBBBBGgBBkk..',
  ],
  left: [
    '................',
    '.....kkkkk......',
    '...kkHHHHHkk....',
    '..kHHHHhhjHHk...',
    '.kHHHHHHhhHHHk..',
    '.kHHHHHHHHHHHHk.',
    'kHHkHHHHHHHHHHHk',
    '.kHSkHHHHHHHHHk.',
    '.kSSSSHHHHHHHHk.',
    '.kSSSSSHHHHHHk..',
    '.kSkSSSSHHHHHk..',
    '.kSkSSSSsHHHk...',
    '..kSSSSskHkk....',
    '...kkYYYYyk.....',
    '...kSRRYYyykk...',
    '...kSRRRRyYyk...',
    '...ksrRRRRk.k...',
    '....kBBBGBk.....',
  ],
};
const LEGS = {
  stand: ['...kPPPPPPPPk...', '...kPPPkkPPPk...', '...kbBBkkBBbk...', '...kkkk..kkkk...'],
  stepL: ['...kPPPPPPPPk...', '...kPPPkkPPPk...', '...kbBBkkPPPk...', '...kkkk.kBBbk...', '.........kkkk...'],
  stepR: ['...kPPPPPPPPk...', '...kPPPkkPPPk...', '...kPPPkkBBbk...', '...kbBBk.kkkk...', '...kkkk.........'],
  sideStand: ['....kPPPPPk.....', '....kPPkPPk.....', '....kBBkBBk.....', '....kkkkkkk.....'],
  sideStepA: ['....kPPPPPk.....', '...kPPPkPPPk....', '...kbBkkkPPk....', '...kkk..kBBbk...', '........kkkk....'],
  sideStepB: ['....kPPPPPk.....', '....kPPPPk......', '....kPPPkk......', '....kBBBbk......', '....kkkkkk......'],
};

const HERO_PAL = { k: '#2a2238', H: '#3a2a2c', h: '#5a4040', j: '#7e5e56', S: '#f8d0a8', s: '#e0a07c', W: '#f6f6f2', w: '#c8ccd8', R: '#d83a3a', N: '#2e3c70', n: '#1e2850', m: '#46589a', G: '#e8c048', P: '#5a6070', p: '#40444f', B: '#30303a', b: '#1c1c24', O: '#d8683a', o: '#a4482a', q: '#6a3a26' };
const HERO_ROWS = {
  down: [
    '................',
    '.....kkkkkk.....',
    '...kkHHHHHHkk...',
    '..kHHhhHHHHHHk..',
    '..kHhjjhHHHHHk..',
    '.kHHHHHHHHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kHHkHHHHkHHHHk.',
    '.kHkSSkHHkSSSHk.',
    '.kHSSSSSSSSSSHk.',
    '.kkSSkSSSSkSSkk.',
    '..kSSkSSSSkSSk..',
    '...ksSSSSSSsk...',
    '..kkNWWRRWWNkk..',
    '.kNkmNWRRWNNkNk.',
    '.kNkmNNRRNNNkNk.',
    '.kSknNNNNNNnkSk.',
    '..kknNGNNGNnkk..',
  ],
  up: [
    '................',
    '.....kkkkkk.....',
    '...kkHHHHHHkk...',
    '..kHHHhhHHHHHk..',
    '..kHHhjjhHHHHk..',
    '.kHHHHhhHHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kkHHHHHHHHHHkk.',
    '..kkHHHHHHHHkk..',
    '...ksHHHHHHsk...',
    '..kkNqkkkkqNkk..',
    '.kNkqOOOOOOqkNk.',
    '.kNkqOooooOqkNk.',
    '.kSkqOOOOOOqkSk.',
    '..kkNkOOOOkNkk..',
  ],
  left: [
    '................',
    '.....kkkkk......',
    '...kkHHHHHkk....',
    '..kHHHHhhjHHk...',
    '.kHHHHHHhhHHHk..',
    '.kHHHHHHHHHHHk..',
    '.kHHHHHHHHHHHHk.',
    '.kHSkHHHHHHHHHk.',
    '.kSSSSHHHHHHHk..',
    '.kSSSSSHHHHHHk..',
    '.kSkSSSSHHHHHk..',
    '.kSkSSSSsHHHk...',
    '..kSSSSskHkk....',
    '...kkWRNNkkkk...',
    '...kRNNmNkOOk...',
    '...kSNNmNkOok...',
    '...ksNNNnkOOk...',
    '....kNNGNkkkk...',
  ],
};
const Hero = (() => {
  const frames = {};
  function build(dir, legs, bob) {
    const body = HERO_ROWS[dir]; const rows = [];
    const L = LEGS[legs];
    const top = bob ? body.slice(0) : body;
    const out = new Array(22).fill('................');
    const off = bob ? -1 : 0;
    for (let i = 0; i < top.length; i++) if (i + off >= 0) out[i + off] = top[i];
    const ls = 18 + off;
    for (let i = 0; i < L.length; i++) if (ls + i < 22) out[ls + i] = L[i];
    return spriteFrom(out.slice(0, 22), HERO_PAL);
  }
  for (const d of ['down', 'up']) frames[d] = [build(d, 'stand', 0), build(d, 'stepL', 1), build(d, 'stand', 0), build(d, 'stepR', 1)];
  frames.left = [build('left', 'sideStand', 0), build('left', 'sideStepA', 1), build('left', 'sideStand', 0), build('left', 'sideStepB', 1)];
  frames.right = frames.left.map(flipCanvas);
  return { frames };
})();

/* ---------------- Procedural shaded sprites (monsters, hero back) ---------------- */
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2hex(h, s, l) { h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1); const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r, g, b; [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return rgb2hex((r + m) * 255, (g + m) * 255, (b + m) * 255); }
function hueToward(h, target, amt) { let d = ((target - h + 540) % 360) - 180; return h + clamp(d, -amt, amt); }
const RAMP_CACHE = {};
function ramp(base) {
  if (RAMP_CACHE[base]) return RAMP_CACHE[base];
  const [h, s, l] = rgb2hsl(...hex2rgb(base));
  const r = [
    hsl2hex(hueToward(h, 55, 10), s * 0.9, l + (1 - l) * 0.55),
    hsl2hex(hueToward(h, 55, 5), s, l + (1 - l) * 0.25),
    base,
    hsl2hex(hueToward(h, 250, 12), Math.min(1, s * 1.05 + 0.05), l * 0.7),
    hsl2hex(hueToward(h, 250, 22), Math.min(1, s * 0.9 + 0.1), l * 0.38),
  ];
  RAMP_CACHE[base] = r; return r;
}
function renderShaded(def, S, k) {
  // def.parts: {s:'e'|'p', ...geometry in 64-space, c: base color, line, clip, glow, flat, shine}
  const N = S * S; const owner = new Int16Array(N).fill(-1); const tone = new Int8Array(N); const col = new Array(N);
  const masks = []; const L = [-0.55, -0.75, 0.9]; const ll = Math.hypot(...L); L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const ids = {}; def.parts.forEach((p, i) => { if (p.id) ids[p.id] = i; });
  const parts = def.parts.map(p => ({ ...p, clip: p.clip === undefined ? undefined : (typeof p.clip === 'string' ? ids[p.clip] : p.clip) }));
  const inShape = (p, X, Y) => {
    if (p.u) { for (const q of p.u) if (inShape(q, X, Y)) return true; return false; }
    if (p.s === 'e') { let dx = X - p.x, dy = Y - p.y; if (p.rot) { const c = Math.cos(-p.rot), s = Math.sin(-p.rot); const nx = dx * c - dy * s, ny = dx * s + dy * c; dx = nx; dy = ny; } return (dx * dx) / (p.rx * p.rx) + (dy * dy) / ((p.ry || p.rx) * (p.ry || p.rx)) <= 1; }
    let inside = false; const pts = p.pts; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]; if (((yi > Y) !== (yj > Y)) && (X < (xj - xi) * (Y - yi) / (yj - yi) + xi)) inside = !inside; } return inside;
  };
  parts.forEach((p, pi) => {
    const m = new Uint8Array(N);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const X = (x + 0.5) / k, Y = (y + 0.5) / k; let inside = inShape(p, X, Y);
      if (inside && p.clip !== undefined) inside = !!masks[p.clip][y * S + x];
      if (inside) m[y * S + x] = 1;
    }
    masks.push(m);
    // chamfer distance
    const d = new Float32Array(N); const INF = 1e6;
    for (let i = 0; i < N; i++) d[i] = m[i] ? INF : 0;
    const D1 = 1, D2 = 1.414;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = y * S + x; if (!m[i]) continue; let v = d[i]; v = Math.min(v, (x > 0 ? d[i - 1] : 0) + D1, (y > 0 ? d[i - S] : 0) + D1, (x > 0 && y > 0 ? d[i - S - 1] : 0) + D2, (x < S - 1 && y > 0 ? d[i - S + 1] : 0) + D2); d[i] = v; }
    for (let y = S - 1; y >= 0; y--) for (let x = S - 1; x >= 0; x--) { const i = y * S + x; if (!m[i]) continue; let v = d[i]; v = Math.min(v, (x < S - 1 ? d[i + 1] : 0) + D1, (y < S - 1 ? d[i + S] : 0) + D1, (x < S - 1 && y < S - 1 ? d[i + S + 1] : 0) + D2, (x > 0 && y < S - 1 ? d[i + S - 1] : 0) + D2); d[i] = v; }
    let dmax = 0; for (let i = 0; i < N; i++) if (d[i] > dmax) dmax = d[i];
    const R = Math.max(1, dmax) * (p.flat ? 3 : 1);
    const h = new Float32Array(N); for (let i = 0; i < N; i++) if (m[i]) { const dd = Math.min(d[i], R); h[i] = Math.sqrt(Math.max(0, R * R - (R - dd) * (R - dd))); }
    const rp = p.ramp || ramp(p.c);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x; if (!m[i]) continue;
      const hx0 = x > 0 ? h[i - 1] : 0, hx1 = x < S - 1 ? h[i + 1] : 0, hy0 = y > 0 ? h[i - S] : 0, hy1 = y < S - 1 ? h[i + S] : 0;
      let nx = -(hx1 - hx0) / 2, ny = -(hy1 - hy0) / 2, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      let I = nx * L[0] + ny * L[1] + nz * L[2];
      I += (p.bright || 0);
      let t;
      if (p.glow) t = I > 0.8 ? 0 : 1;
      else t = I > 0.97 && p.shine !== false ? 0 : I > 0.80 ? 1 : I > 0.45 ? 2 : 3;
      owner[i] = pi; tone[i] = t; col[i] = rp;
    }
  });
  const rps = parts.map(p => p.ramp || ramp(p.c));
  // cast shadows from front parts (light from top-left)
  const t2 = tone.slice();
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, o = owner[i]; if (o < 0 || parts[o].glow || parts[o].noShade) continue;
    for (const [dx, dy] of [[-1, -1], [-1, -2], [0, -2]]) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0) continue; const o2 = owner[yy * S + xx];
      if (o2 > o && !parts[o2].noCast && parts[o2].clip !== o) { t2[i] = 3; break; }
    }
  }
  const out = new Array(N).fill(null);
  for (let i = 0; i < N; i++) if (owner[i] >= 0) out[i] = rps[owner[i]][t2[i]];
  // internal lines: outline front parts where they overlap parts behind
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, q = owner[i]; if (q < 0) continue;
    let front = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue; const p = owner[yy * S + xx]; if (p > q && parts[p].line !== false && parts[p].clip !== q) front = Math.max(front, p); }
    if (front >= 0) out[i] = parts[front].lineCol || rps[front][4];
  }
  // exterior outline
  const out2 = out.slice();
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x; if (owner[i] >= 0) continue; let nb = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue; const p = owner[yy * S + xx]; if (p >= 0 && !parts[p].noOutline) nb = Math.max(nb, p); }
    if (nb >= 0) out2[i] = parts[nb].lineCol || shade(rps[nb][4], -0.3);
  }
  return { out: out2, owner, S };
}

function pxEllipse(x, cx, cy, rx, ry, color) { // pixel-center test, coordinates in pixels
  x.fillStyle = color;
  for (let yy = Math.floor(cy - ry); yy <= Math.ceil(cy + ry); yy++) for (let xx = Math.floor(cx - rx); xx <= Math.ceil(cx + rx); xx++) {
    const dx = (xx + 0.5 - cx) / rx, dy = (yy + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) x.fillRect(xx, yy, 1, 1);
  }
}
function pxLine(x, x0, y0, x1, y1, color, w = 1) {
  x.fillStyle = color; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (; ;) { x.fillRect(x0 - (w > 1 ? 1 : 0), y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function pxPoly(x, pts, color) {
  x.fillStyle = color; const ys = pts.map(p => p[1]); const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  const xs = pts.map(p => p[0]); const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
  for (let Y = y0; Y <= y1; Y++) for (let X = x0; X <= x1; X++) { const px = X + 0.5, py = Y + 0.5; let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) ins = !ins; } if (ins) x.fillRect(X, Y, 1, 1); }
}
function drawDetails(x, details, k) {
  for (const d of details || []) {
    const S = v => v * k;
    if (d.s === 'eye') { // simple dark eye with glint
      const rx = Math.max(0.6, S(d.w || 2)), ry = Math.max(0.8, S(d.h || 3));
      pxEllipse(x, S(d.x), S(d.y), rx, ry, d.c || '#202028');
      if (k >= 0.6) { x.fillStyle = d.hl || '#ffffff'; x.fillRect(Math.round(S(d.x) - rx * 0.4), Math.round(S(d.y) - ry * 0.55), Math.max(1, Math.round(rx * 0.55)), Math.max(1, Math.round(ry * 0.4))); }
    } else if (d.s === 'eyeW') { // white sclera + pupil
      const rx = Math.max(1, S(d.w)), ry = Math.max(1, S(d.h));
      pxEllipse(x, S(d.x), S(d.y), rx + (k >= 0.6 ? 1 : 0), ry + (k >= 0.6 ? 1 : 0), d.o || '#202028');
      pxEllipse(x, S(d.x), S(d.y), rx, ry, d.w2 || '#ffffff');
      pxEllipse(x, S(d.x + (d.px || 0)), S(d.y + (d.py || 0)), Math.max(0.6, rx * (d.pr || 0.55)), Math.max(0.8, ry * (d.pr2 || 0.7)), d.c || '#202028');
      if (k >= 0.6) { x.fillStyle = '#ffffff'; x.fillRect(Math.round(S(d.x + (d.px || 0)) - 1), Math.round(S(d.y + (d.py || 0)) - ry * 0.4), 1, 1); }
    } else if (d.s === 'line') { for (let i = 0; i + 1 < d.pts.length; i++) pxLine(x, S(d.pts[i][0]), S(d.pts[i][1]), S(d.pts[i + 1][0]), S(d.pts[i + 1][1]), d.c, d.w && k >= 0.6 ? d.w : 1); }
    else if (d.s === 'dot') { if (d.r && k * d.r >= 0.8) pxEllipse(x, S(d.x), S(d.y), S(d.r), S(d.r), d.c); else { x.fillStyle = d.c; x.fillRect(Math.floor(S(d.x)), Math.floor(S(d.y)), 1, 1); } }
    else if (d.s === 'poly') { if (k >= (d.min || 0)) pxPoly(x, d.pts.map(p => [S(p[0]), S(p[1])]), d.c); }
    else if (d.s === 'ell') { pxEllipse(x, S(d.x), S(d.y), Math.max(0.6, S(d.rx)), Math.max(0.6, S(d.ry || d.rx)), d.c); }
  }
}
function buildShaded(def, size, k) {
  const r = renderShaded(def, size, k); const c = mkCanvas(size, size), x = c.getContext('2d'); const id = x.createImageData(size, size);
  for (let i = 0; i < r.out.length; i++) { const v = r.out[i]; if (!v) continue; const [R, G, B] = hex2rgb(v); id.data[i * 4] = R; id.data[i * 4 + 1] = G; id.data[i * 4 + 2] = B; id.data[i * 4 + 3] = 255; }
  x.putImageData(id, 0, 0); drawDetails(x, def.details, k);
  return c;
}
// mirror helper for symmetric designs (about x=32)
function mirrorShape(q) { q = { ...q }; delete q.m; if (q.u) q.u = q.u.map(mirrorShape); else if (q.s === 'e') { q.x = 64 - q.x; if (q.rot) q.rot = -q.rot; } else if (q.s === 'p') q.pts = q.pts.map(([a, b]) => [64 - a, b]); if (q.id) q.id += 'M'; if (typeof q.clip === 'string' && q.mclip) q.clip += 'M'; return q; }
function sym(parts) { const out = []; for (const p of parts) { out.push(p); if (p.m) out.push(mirrorShape(p)); } return out; }
function symD(ds) { const out = []; for (const d of ds) { out.push(d); if (d.m) { const q = { ...d }; delete q.m; if (q.x !== undefined) q.x = 64 - q.x; if (q.px) q.px = -q.px; if (q.pts) q.pts = q.pts.map(([a, b]) => [64 - a, b]); out.push(q); } } return out; }

/* ---------------- Monster & hero-back designs (64x64 space) ---------------- */
const petals = (cx, cy, n, R, rx, ry, c, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i * Math.PI * 2 / n; return { s: 'e', x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R * 0.85, rx, ry, rot: a + Math.PI / 2, c }; });
const ART = {
  mush: { parts: sym([
    { s: 'e', x: 24, y: 57, rx: 6, ry: 3.5, c: '#b08a5c', m: 1 },
    { s: 'e', x: 32, y: 47, rx: 13, ry: 11, c: '#f4e2bc' },
    { s: 'e', x: 32, y: 37, rx: 19, ry: 5, c: '#d2bc8e' },
    { s: 'e', x: 32, y: 28, rx: 25, ry: 14, c: '#58b848', id: 'cap' },
    { s: 'e', x: 20, y: 22, rx: 4.5, ry: 3.5, c: '#d8f8a0', line: false, clip: 'cap' },
    { s: 'e', x: 37, y: 18, rx: 5, ry: 3.5, c: '#d8f8a0', line: false, clip: 'cap' },
    { s: 'e', x: 48, y: 28, rx: 3.5, ry: 3, c: '#d8f8a0', line: false, clip: 'cap' },
    { s: 'e', x: 12, y: 31, rx: 3, ry: 2.5, c: '#d8f8a0', line: false, clip: 'cap' },
    { s: 'e', x: 30, y: 33, rx: 3, ry: 2.2, c: '#d8f8a0', line: false, clip: 'cap' },
    { s: 'p', pts: [[31, 15], [24, 6], [30, 8]], c: '#3a9a3a' },
    { s: 'p', pts: [[32, 15], [40, 5], [35, 10]], c: '#3a9a3a' },
  ]), details: symD([
    { s: 'eye', x: 27, y: 46, w: 1.6, h: 2.6, m: 1 },
    { s: 'line', pts: [[30, 51], [32, 52], [34, 51]], c: '#6a4030' },
    { s: 'dot', x: 22, y: 49, r: 1.8, c: '#f4a8a0', m: 1 },
  ]) },
  bird: { parts: sym([
    { s: 'p', pts: [[42, 48], [58, 56], [52, 46]], c: '#3c78c8' },
    { s: 'e', x: 27, y: 58, rx: 3.5, ry: 2, c: '#f09030', m: 1 },
    { s: 'e', x: 13, y: 40, rx: 6, ry: 11, rot: 0.5, c: '#3c78c8', m: 1 },
    { s: 'e', x: 32, y: 40, rx: 17, ry: 16, c: '#78b8f0', id: 'body' },
    { s: 'e', x: 32, y: 47, rx: 11, ry: 9, c: '#f8f4e8', line: false, clip: 'body' },
    { s: 'p', pts: [[29, 26], [23, 12], [33, 23]], c: '#3c78c8' },
    { s: 'p', pts: [[31, 25], [34, 8], [36, 24]], c: '#e85050' },
    { s: 'p', pts: [[34, 26], [43, 14], [38, 25]], c: '#3c78c8' },
    { s: 'p', pts: [[28, 38], [36, 38], [32, 44]], c: '#f8a030' },
  ]), details: symD([{ s: 'eye', x: 25.5, y: 34, w: 2, h: 3, m: 1 }, { s: 'dot', x: 21, y: 40, r: 1.6, c: '#f8a8a8', m: 1 }]) },
  pebble: { parts: sym([
    { s: 'e', x: 24, y: 58, rx: 5, ry: 3, c: '#7a7468', m: 1 },
    { s: 'e', x: 9, y: 46, rx: 6, ry: 5, c: '#9a948a', m: 1 },
    { s: 'e', x: 32, y: 42, rx: 21, ry: 17, c: '#a8a294', id: 'b' },
    { s: 'e', x: 22, y: 28, rx: 10, ry: 5, c: '#78b050', clip: 'b', line: false },
    { s: 'e', x: 40, y: 26, rx: 5, ry: 3, c: '#78b050', clip: 'b', line: false },
  ]), details: [
    { s: 'line', pts: [[21, 37], [28, 39]], c: '#3a342e', w: 2 }, { s: 'line', pts: [[43, 37], [36, 39]], c: '#3a342e', w: 2 },
    { s: 'eye', x: 26, y: 42, w: 2, h: 2.6 }, { s: 'eye', x: 38, y: 42, w: 2, h: 2.6 },
    { s: 'line', pts: [[29, 50], [35, 50]], c: '#3a342e' },
    { s: 'line', pts: [[46, 44], [49, 49], [47, 53]], c: '#6a645a' }, { s: 'line', pts: [[16, 48], [19, 52]], c: '#6a645a' },
  ] },
  slime: { parts: [
    { u: [{ s: 'e', x: 32, y: 47, rx: 22, ry: 13 }, { s: 'e', x: 32, y: 37, rx: 15, ry: 13 }, { s: 'p', pts: [[32, 14], [23, 31], [41, 31]] }], c: '#4c9ef0' },
    { s: 'e', x: 9, y: 22, rx: 3, ry: 3, c: '#b8e8ff' }, { s: 'e', x: 55, y: 30, rx: 4, ry: 4, c: '#b8e8ff' }, { s: 'e', x: 50, y: 13, rx: 2.2, c: '#b8e8ff' },
  ], details: [
    { s: 'ell', x: 24, y: 32, rx: 2.5, ry: 4, c: '#e8f8ff' }, { s: 'ell', x: 22, y: 39, rx: 1, ry: 1.5, c: '#e8f8ff' },
    { s: 'eyeW', x: 26, y: 44, w: 3, h: 3.8, px: 0.6, py: 0.6 }, { s: 'eyeW', x: 38, y: 44, w: 3, h: 3.8, px: -0.6, py: 0.6 },
    { s: 'line', pts: [[30, 51], [32, 53], [34, 51]], c: '#1a3a6a' },
  ] },
  fox: { parts: [
    { s: 'e', x: 47, y: 38, rx: 7, ry: 16, rot: 0.55, c: '#f08838' },
    { s: 'p', pts: [[47, 28], [49, 15], [52, 20], [55, 6], [58, 17], [62, 11], [62, 24], [56, 31]], c: '#f8b830', glow: 1, noCast: 1 },
    { s: 'p', pts: [[51, 26], [53, 18], [55, 21], [57, 13], [59, 24], [56, 28]], c: '#fff0a0', glow: 1, line: false, noCast: 1 },
    { s: 'e', x: 45, y: 55, rx: 3.5, ry: 5.5, c: '#c86020' }, { s: 'e', x: 40, y: 56, rx: 3.5, ry: 5.5, c: '#d06828' },
    { s: 'e', x: 36, y: 45, rx: 14, ry: 10, c: '#f08838', id: 'body' },
    { s: 'e', x: 27, y: 56, rx: 3.5, ry: 5.5, c: '#e07830' }, { s: 'e', x: 32, y: 57, rx: 3.5, ry: 5, c: '#f08838' },
    { s: 'e', x: 25, y: 45, rx: 7, ry: 8, c: '#fff0d8', line: false },
    { s: 'p', pts: [[14, 25], [12, 9], [23, 21]], c: '#f08838' }, { s: 'p', pts: [[24, 21], [31, 8], [33, 25]], c: '#e07830' },
    { u: [{ s: 'e', x: 22, y: 31, rx: 12, ry: 10 }, { s: 'e', x: 12, y: 35, rx: 7, ry: 4.5 }], c: '#f08838', id: 'head' },
    { s: 'e', x: 12, y: 37, rx: 6, ry: 3, c: '#fff0d8', line: false, clip: 'head' },
    { s: 'p', pts: [[24, 35], [34, 33], [33, 40], [26, 39]], c: '#fff0d8', line: false, clip: 'head' },
  ], details: [
    { s: 'poly', pts: [[15, 21], [14, 13], [19, 19]], c: '#8a3818' }, { s: 'poly', pts: [[26, 20], [30, 12], [31, 21]], c: '#8a3818' },
    { s: 'eye', x: 16.5, y: 29, w: 1.6, h: 2.8 }, { s: 'eye', x: 25, y: 29, w: 1.8, h: 2.8 },
    { s: 'dot', x: 5, y: 34, r: 1.3, c: '#302020' }, { s: 'line', pts: [[7, 38], [12, 39]], c: '#8a3818' },
    { s: 'poly', pts: [[19, 22], [21, 19], [23, 23]], c: '#f8e040' },
  ] },
  bee: { parts: [
    { s: 'e', x: 40, y: 17, rx: 7, ry: 13, rot: 0.3, c: '#dceeff', shine: false },
    { s: 'e', x: 51, y: 24, rx: 7, ry: 12, rot: 0.9, c: '#cfe6ff', shine: false },
    { s: 'e', x: 40, y: 45, rx: 11, ry: 13, rot: -0.4, c: '#f8d030', id: 'abd' },
    { s: 'e', x: 41, y: 43, rx: 13, ry: 2.4, rot: -0.4, c: '#3a3040', clip: 'abd', line: false },
    { s: 'e', x: 45, y: 51, rx: 13, ry: 2.4, rot: -0.4, c: '#3a3040', clip: 'abd', line: false },
    { s: 'p', pts: [[46, 55], [53, 63], [51, 54]], c: '#3a3040' },
    { s: 'e', x: 30, y: 37, rx: 9, ry: 8, c: '#6a5238' },
    { s: 'e', x: 24, y: 25, rx: 11, ry: 10, c: '#f8d030', id: 'head' },
  ], details: [
    { s: 'line', pts: [[20, 16], [16, 10], [19, 8], [14, 3]], c: '#3a3040' }, { s: 'line', pts: [[28, 16], [30, 10], [27, 8], [31, 2]], c: '#3a3040' },
    { s: 'dot', x: 14, y: 3, r: 2, c: '#f8e040' }, { s: 'dot', x: 31, y: 2, r: 2, c: '#f8e040' },
    { s: 'eyeW', x: 20, y: 25, w: 3, h: 3.6, px: -0.8, py: 0.3 }, { s: 'eyeW', x: 29, y: 25, w: 3, h: 3.6, px: -0.8, py: 0.3 },
    { s: 'line', pts: [[23, 31], [25, 32], [27, 31]], c: '#6a4020' },
    { s: 'line', pts: [[42, 7], [39, 12], [43, 13], [40, 19]], c: '#58a8f8' }, { s: 'line', pts: [[58, 19], [53, 21], [56, 24], [51, 27]], c: '#58a8f8' },
    { s: 'line', pts: [[26, 44], [24, 49]], c: '#3a3040' }, { s: 'line', pts: [[31, 45], [30, 50]], c: '#3a3040' },
  ] },
  frog: { parts: sym([
    { s: 'e', x: 13, y: 53, rx: 9, ry: 5, rot: -0.35, c: '#7a48a8', m: 1 },
    { u: [{ s: 'e', x: 32, y: 45, rx: 20, ry: 13 }, { s: 'e', x: 32, y: 34, rx: 18, ry: 11 }, { s: 'e', x: 21, y: 24, rx: 7, ry: 7 }, { s: 'e', x: 43, y: 24, rx: 7, ry: 7 }], c: '#9860c8', id: 'b' },
    { s: 'e', x: 32, y: 50, rx: 12, ry: 7, c: '#dcc8f4', line: false, clip: 'b' },
    { s: 'e', x: 16, y: 41, rx: 3, ry: 2.6, c: '#c8f050', line: false, clip: 'b' },
    { s: 'e', x: 48, y: 43, rx: 3.5, ry: 3, c: '#c8f050', line: false, clip: 'b' },
    { s: 'e', x: 26, y: 31, rx: 2.2, ry: 2, c: '#c8f050', line: false, clip: 'b' },
    { s: 'e', x: 40, y: 32, rx: 2.6, ry: 2.2, c: '#c8f050', line: false, clip: 'b' },
    { s: 'e', x: 22, y: 58, rx: 5, ry: 3, c: '#8a50b8', m: 1 },
  ]), details: [
    { s: 'eyeW', x: 21, y: 23, w: 3.8, h: 3.8, px: 0.5, py: 0.4, w2: '#f8f070' }, { s: 'eyeW', x: 43, y: 23, w: 3.8, h: 3.8, px: -0.5, py: 0.4, w2: '#f8f070' },
    { s: 'line', pts: [[21, 37], [27, 40], [32, 40], [37, 40], [43, 37]], c: '#4a2060' },
    { s: 'dot', x: 29, y: 32, c: '#4a2060' }, { s: 'dot', x: 35, y: 32, c: '#4a2060' },
  ] },
  wolf: { parts: [
    { s: 'p', pts: [[48, 40], [61, 25], [60, 33], [64, 34], [59, 42], [62, 46], [52, 49]], c: '#56566c' },
    { s: 'e', x: 47, y: 55, rx: 3.5, ry: 6, c: '#4a4a60' }, { s: 'e', x: 52, y: 55, rx: 3.5, ry: 6, c: '#44445a' },
    { s: 'e', x: 41, y: 43, rx: 16, ry: 11, c: '#6c6c84', id: 'body' },
    { s: 'e', x: 41, y: 51, rx: 11, ry: 4, c: '#b0b0c0', clip: 'body', line: false },
    { s: 'e', x: 27, y: 55, rx: 3.5, ry: 6, c: '#6c6c84' }, { s: 'e', x: 33, y: 56, rx: 3.5, ry: 6, c: '#626278' },
    { s: 'p', pts: [[17, 42], [21, 25], [26, 30], [30, 21], [33, 29], [40, 25], [37, 35], [43, 39], [33, 48], [22, 49]], c: '#4a4a62' },
    { s: 'p', pts: [[13, 25], [13, 9], [21, 21]], c: '#5a5a72' }, { s: 'p', pts: [[21, 22], [26, 8], [28, 24]], c: '#6c6c84' },
    { u: [{ s: 'e', x: 20, y: 31, rx: 10, ry: 9 }, { s: 'p', pts: [[3, 33], [13, 27], [18, 40], [5, 39]] }], c: '#6c6c84', id: 'head' },
    { s: 'p', pts: [[4, 37], [16, 36], [17, 41], [6, 42]], c: '#b0b0c0', clip: 'head', line: false },
  ], details: [
    { s: 'poly', pts: [[4, 37], [15, 36], [12, 41], [5, 40]], c: '#5a1a28' },
    { s: 'poly', pts: [[6, 36], [8, 36], [7, 39]], c: '#ffffff' }, { s: 'poly', pts: [[11, 36], [13, 36], [12, 39.5]], c: '#ffffff' },
    { s: 'poly', pts: [[7, 42], [9, 42], [8, 39]], c: '#ffffff' },
    { s: 'poly', pts: [[14, 13], [15, 21], [19, 21]], c: '#3a3048' },
    { s: 'ell', x: 17, y: 29, rx: 2.2, ry: 1.5, c: '#ff4848' }, { s: 'dot', x: 16, y: 28, c: '#ffe0a0' },
    { s: 'line', pts: [[13, 25], [21, 33]], c: '#e8d0d0' },
    { s: 'dot', x: 3, y: 33, r: 1.4, c: '#202028' },
  ] },
  flower: { parts: [
    { s: 'p', pts: [[9, 60], [3, 44], [7, 30], [13, 27], [11, 36], [9, 46], [15, 60]], c: '#3a8a3a' },
    { s: 'p', pts: [[55, 60], [61, 44], [57, 30], [51, 27], [53, 36], [55, 46], [49, 60]], c: '#3a8a3a' },
    { s: 'e', x: 19, y: 56, rx: 11, ry: 4, rot: 0.25, c: '#4aa048' }, { s: 'e', x: 45, y: 56, rx: 11, ry: 4, rot: -0.25, c: '#4aa048' },
    { s: 'e', x: 32, y: 47, rx: 5, ry: 13, c: '#3a8a3a' },
    ...petals(32, 25, 7, 14, 8, 6.5, '#e0487a', -Math.PI / 2),
    { s: 'e', x: 32, y: 25, rx: 13, ry: 11, c: '#f8d060', id: 'disk' },
  ], details: [
    { s: 'poly', pts: [[4, 40], [1, 38], [5, 37]], c: '#f0e8b0' }, { s: 'poly', pts: [[8, 50], [5, 50], [8, 47]], c: '#f0e8b0' }, { s: 'poly', pts: [[10, 32], [9, 29], [12, 31]], c: '#f0e8b0' },
    { s: 'poly', pts: [[60, 40], [63, 38], [59, 37]], c: '#f0e8b0' }, { s: 'poly', pts: [[56, 50], [59, 50], [56, 47]], c: '#f0e8b0' }, { s: 'poly', pts: [[54, 32], [55, 29], [52, 31]], c: '#f0e8b0' },
    { s: 'ell', x: 32, y: 29, rx: 7.5, ry: 4.5, c: '#401828' },
    { s: 'poly', pts: [[26, 26], [28, 26], [27, 29]], c: '#fff' }, { s: 'poly', pts: [[30, 25], [32, 25], [31, 28]], c: '#fff' }, { s: 'poly', pts: [[34, 25], [36, 25], [35, 28]], c: '#fff' }, { s: 'poly', pts: [[37, 26], [39, 27], [37.5, 29]], c: '#fff' },
    { s: 'poly', pts: [[28, 33], [30, 33], [29, 30.5]], c: '#fff' }, { s: 'poly', pts: [[33, 33], [35, 33], [34, 30.5]], c: '#fff' },
    { s: 'eye', x: 27, y: 20, w: 1.6, h: 2 }, { s: 'eye', x: 37, y: 20, w: 1.6, h: 2 },
    { s: 'line', pts: [[24, 17], [29, 19]], c: '#6a3010' }, { s: 'line', pts: [[40, 17], [35, 19]], c: '#6a3010' },
  ] },
  croc: { parts: [
    { s: 'p', pts: [[48, 42], [64, 49], [63, 54], [47, 54]], c: '#3a8a90' },
    { s: 'e', x: 49, y: 56, rx: 4, ry: 4.5, c: '#2e747a' }, { s: 'e', x: 54, y: 56, rx: 4, ry: 4.5, c: '#2a6a70' },
    { s: 'p', pts: [[28, 38], [32, 30], [35, 38]], c: '#2a6a70' }, { s: 'p', pts: [[36, 37], [40, 29], [43, 37]], c: '#2a6a70' }, { s: 'p', pts: [[44, 38], [48, 31], [51, 39]], c: '#2a6a70' },
    { s: 'e', x: 40, y: 46, rx: 16, ry: 10, c: '#3a8a90', id: 'body' },
    { s: 'e', x: 38, y: 53, rx: 12, ry: 4, c: '#e8e0b8', clip: 'body', line: false },
    { s: 'e', x: 27, y: 56, rx: 4, ry: 4.5, c: '#3a8a90' }, { s: 'e', x: 33, y: 57, rx: 4, ry: 4.5, c: '#347e84' },
    { u: [{ s: 'e', x: 22, y: 38, rx: 10, ry: 8 }, { s: 'p', pts: [[1, 38], [16, 32], [18, 45], [3, 44]] }], c: '#3a8a90', id: 'head' },
    { s: 'p', pts: [[3, 42], [18, 41], [18, 46], [4, 45]], c: '#e8e0b8', clip: 'head', line: false },
    { s: 'e', x: 21, y: 30, rx: 5, ry: 4, c: '#3a8a90' },
  ], details: [
    { s: 'line', pts: [[2, 41], [8, 41.5], [19, 42]], c: '#1a3a40' },
    { s: 'poly', pts: [[5, 41], [7, 41], [6, 43.5]], c: '#fff' }, { s: 'poly', pts: [[10, 41], [12, 41], [11, 43.5]], c: '#fff' }, { s: 'poly', pts: [[14, 41.5], [16, 41.5], [15, 44]], c: '#fff' },
    { s: 'poly', pts: [[8, 42], [10, 42], [9, 39.5]], c: '#fff' }, { s: 'poly', pts: [[12, 42], [14, 42], [13, 39.5]], c: '#fff' },
    { s: 'ell', x: 20, y: 30, rx: 2.4, ry: 2.4, c: '#f8e040' }, { s: 'line', pts: [[20, 28], [20, 31]], c: '#202020' },
    { s: 'dot', x: 3, y: 37, c: '#1a3a40' },
  ] },
  golem: { parts: [
    { s: 'e', x: 22, y: 56, rx: 8, ry: 7, c: '#6e6658' }, { s: 'e', x: 42, y: 56, rx: 8, ry: 7, c: '#665e50' },
    { s: 'e', x: 9, y: 44, rx: 7, ry: 11, c: '#8a8272' }, { s: 'e', x: 55, y: 44, rx: 7, ry: 11, c: '#827a6a' },
    { u: [{ s: 'e', x: 32, y: 40, rx: 19, ry: 15 }, { s: 'p', pts: [[14, 30], [50, 30], [46, 50], [18, 50]] }], c: '#948c7c', id: 'torso' },
    { s: 'e', x: 32, y: 50, rx: 14, ry: 5, c: '#7e7666', clip: 'torso', line: false },
    { s: 'e', x: 13, y: 29, rx: 10, ry: 8, c: '#a09884', id: 'shL' }, { s: 'e', x: 51, y: 29, rx: 10, ry: 8, c: '#a09884', id: 'shR' },
    { s: 'e', x: 10, y: 24, rx: 7, ry: 4, c: '#6aa048', clip: 'shL', line: false }, { s: 'e', x: 55, y: 25, rx: 6, ry: 3.5, c: '#6aa048', clip: 'shR', line: false },
    { s: 'e', x: 9, y: 57, rx: 8, ry: 6.5, c: '#7a7262' }, { s: 'e', x: 55, y: 57, rx: 8, ry: 6.5, c: '#766e5e' },
    { s: 'e', x: 32, y: 20, rx: 10, ry: 8, c: '#a09884', id: 'head' },
    { s: 'e', x: 30, y: 14, rx: 6, ry: 2.5, c: '#6aa048', clip: 'head', line: false },
    { s: 'e', x: 32, y: 40, rx: 5, ry: 6, c: '#ff6a38', glow: 1 },
  ], details: [
    { s: 'poly', pts: [[25, 19], [30, 20], [30, 22], [25, 21]], c: '#ffe040' }, { s: 'poly', pts: [[39, 19], [34, 20], [34, 22], [39, 21]], c: '#ffe040' },
    { s: 'line', pts: [[20, 34], [24, 38], [22, 44]], c: '#ffa040' }, { s: 'line', pts: [[44, 34], [40, 38], [42, 44]], c: '#ffa040' },
    { s: 'line', pts: [[28, 47], [32, 49], [36, 47]], c: '#ffa040' },
    { s: 'ell', x: 31, y: 38, rx: 1.5, ry: 2, c: '#fff4c0' },
    { s: 'line', pts: [[15, 36], [17, 41]], c: '#5a5244' }, { s: 'line', pts: [[47, 44], [45, 48], [47, 50]], c: '#5a5244' }, { s: 'line', pts: [[6, 40], [8, 45]], c: '#5a5244' },
  ] },
  heroBack: { parts: [
    { s: 'e', x: 25, y: 63, rx: 7, ry: 6, c: '#5a6070' }, { s: 'e', x: 39, y: 63, rx: 7, ry: 6, c: '#4e5462' },
    { s: 'e', x: 32, y: 53, rx: 15, ry: 12, c: '#2e3c70', id: 'torso' },
    { s: 'e', x: 15, y: 52, rx: 5, ry: 10, rot: -0.25, c: '#2a386a' },
    { s: 'e', x: 13, y: 61, rx: 3, ry: 3, c: '#f8d0a8' },
    { s: 'e', x: 46, y: 45, rx: 5, ry: 9, rot: 0.75, c: '#34447a' },
    { s: 'p', pts: [[52, 35], [60, 3], [63, 5], [56, 37]], c: '#dfe4f0' },
    { s: 'p', pts: [[47, 37], [58, 31], [60, 34], [49, 40]], c: '#b88840' },
    { s: 'e', x: 53, y: 37, rx: 3.5, ry: 3.5, c: '#f8d0a8' },
    { s: 'e', x: 32, y: 39, rx: 7, ry: 3, c: '#e0a07c' },
    { s: 'e', x: 32, y: 41, rx: 9, ry: 3, c: '#f6f6f2' },
    { u: [{ s: 'p', pts: [[20, 44], [44, 44], [45, 62], [19, 62]] }, { s: 'e', x: 32, y: 45, rx: 12, ry: 5 }], c: '#d8683a', id: 'pack' },
    { s: 'p', pts: [[20, 44], [44, 44], [43, 52], [21, 52]], c: '#b8542e', clip: 'pack' },
    { s: 'e', x: 32, y: 57, rx: 7, ry: 3.5, c: '#f0a060', clip: 'pack', line: false },
    { s: 'e', x: 17.5, y: 27, rx: 2.2, ry: 3.2, c: '#f0c098' }, { s: 'e', x: 46.5, y: 27, rx: 2.2, ry: 3.2, c: '#f0c098' },
    { u: [{ s: 'e', x: 32, y: 23, rx: 15, ry: 14 }, { s: 'e', x: 32, y: 31, rx: 13, ry: 7 }, { s: 'p', pts: [[31, 11], [35, 2], [38, 5], [36, 11]] }], c: '#3a2a2c', id: 'hair' },
  ], details: [
    { s: 'line', pts: [[25, 14], [27, 21]], c: '#6e524c' }, { s: 'line', pts: [[38, 14], [37, 21]], c: '#6e524c' }, { s: 'line', pts: [[31, 17], [31, 25]], c: '#5a4040' },
    { s: 'line', pts: [[56, 30], [61, 8]], c: '#ffffff' },
    { s: 'line', pts: [[22, 49], [42, 49]], c: '#7a3018' },
    { s: 'dot', x: 38, y: 54, r: 1.5, c: '#58d8c8' },
  ] },
};

/* ---------------- Tiles ---------------- */
const TP = { // shared tile palette
  g1: '#8cd878', g2: '#70c060', g3: '#58a850', g4: '#3e8a44', gk: '#2c6a38',
  d1: '#f0dca8', d2: '#e0c488', d3: '#c8a468', d4: '#a88450',
  w1: '#a8e0ff', w2: '#68b8f8', w3: '#4898e8', w4: '#3070c8',
};
const tileCache = {};
function tileCanvas(key, fn) { if (tileCache[key]) return tileCache[key]; const c = mkCanvas(16, 16); fn(c.getContext('2d')); tileCache[key] = c; return c; }
function px(x, X, Y, col) { x.fillStyle = col; x.fillRect(X, Y, 1, 1); }
function rows(x, R, pal, ox = 0, oy = 0) { for (let y = 0; y < R.length; y++) for (let i = 0; i < R[y].length; i++) { const c = pal[R[y][i]]; if (c) { x.fillStyle = c; x.fillRect(ox + i, oy + y, 1, 1); } } }
const Tiles = {};
Tiles.grass = v => tileCanvas('grass' + v, x => {
  x.fillStyle = TP.g2; x.fillRect(0, 0, 16, 16);
  const r = srand(v * 97 + 5);
  for (let i = 0; i < 3; i++) { const X = 1 + Math.floor(r() * 12), Y = 2 + Math.floor(r() * 12); px(x, X, Y, TP.g3); px(x, X + 2, Y, TP.g3); px(x, X + 1, Y + 1, TP.g3); px(x, X, Y - 1, TP.g1); px(x, X + 2, Y - 1, TP.g1); }
  if (v % 3 === 0) { px(x, 11, 12, TP.g1); px(x, 4, 5, TP.g1); }
});
Tiles.flower = (f, color) => tileCanvas('flower' + f + color, x => {
  x.drawImage(Tiles.grass(1), 0, 0);
  const pal = { o: color === 'y' ? '#f8e050' : '#f86868', i: color === 'y' ? '#f8a030' : '#f8e880', l: '#ffffff', s: color === 'y' ? '#c89020' : '#c03848', g: TP.g4 };
  const A = f ? ['.l.', 'lil', '.l.'] : ['.o.', 'oio', '.s.'];
  const B = f ? ['.o.', 'oio', '.s.'] : ['.l.', 'lil', '.l.'];
  const draw = (R, X, Y) => { rows(x, R.map(r => r.replace(/l/g, 'o')), pal, X, Y); px(x, X + 1, Y + 3, TP.g4); };
  draw(f ? ['.o.', 'oio', '.s.'] : ['...', '.o.', 'oio'], 2, 2); draw(f ? ['...', '.o.', 'oio'] : ['.o.', 'oio', '.s.'], 10, 9);
  draw(['.o.', 'oio', '.s.'], 9, 1); draw(['.o.', 'oio', '.s.'], 3, 10);
});
Tiles.tall = f => tileCanvas('tall' + f, x => {
  x.fillStyle = TP.g2; x.fillRect(0, 0, 16, 16);
  const R = f === 0 ? [
    '..k....k....k...',
    '.klk..klk..klk..',
    '.klmk.klmk.klmk.',
    'klmmkklmmkklmmk.',
    'kmmmdkmmmdkmmmdk',
    'kmddkkmddkkmddk.',
    '.kkk..kkk..kkk..',
    'k....k....k....k',
    'lk..klk..klk..kl',
    'mk.klmk.klmk.klm',
    'mdkklmdkklmdkklm',
    'ddkmmmdkmmmdkmmd',
    'dkkmddkkmddkkmdd',
    'k..kkk..kkk..kkk',
    '................',
    '................'] : [
    '...k....k....k..',
    '..klk..klk..klk.',
    '.klmk.klmk.klmk.',
    'klmmkklmmkklmmk.',
    'kmmmdkmmmdkmmmdk',
    'kmddkkmddkkmddk.',
    '.kkk..kkk..kkk..',
    'k....k....k....k',
    'lk..klk..klk..kl',
    'mk.klmk.klmk.klm',
    'mdkklmdkklmdkklm',
    'ddkmmmdkmmmdkmmd',
    'dkkmddkkmddkkmdd',
    'k..kkk..kkk..kkk',
    '................',
    '................'];
  rows(x, R, { k: '#2a6634', l: '#a8e888', m: '#5cb050', d: '#3c8a40' });
});
Tiles.tallTop = tileCanvas('tallTop', x => { x.drawImage(Tiles.tall(0), 0, 7, 16, 9, 0, 7, 16, 9); });
Tiles.path = (mask) => tileCanvas('path' + mask, x => {
  x.fillStyle = TP.d2; x.fillRect(0, 0, 16, 16);
  const r = srand(31); for (let i = 0; i < 7; i++) { px(x, Math.floor(r() * 16), Math.floor(r() * 16), TP.d3); px(x, Math.floor(r() * 16), Math.floor(r() * 16), TP.d1); }
  // edges: mask bits 1=N,2=E,4=S,8=W (neighbor is not path)
  const edge = (pts) => { for (const [X, Y, c] of pts) px(x, X, Y, c); };
  for (let i = 0; i < 16; i++) {
    const j = (i * 7) % 3;
    if (mask & 1) { for (let k = 0; k <= (j === 0 ? 1 : 0); k++) px(x, i, k, TP.g2); px(x, i, j === 0 ? 2 : 1, TP.d3); }
    if (mask & 4) { for (let k = 0; k <= (j === 1 ? 1 : 0); k++) px(x, i, 15 - k, TP.g2); px(x, i, j === 1 ? 13 : 14, TP.d1); }
    if (mask & 8) { for (let k = 0; k <= (j === 2 ? 1 : 0); k++) px(x, k, i, TP.g2); px(x, j === 2 ? 2 : 1, i, TP.d3); }
    if (mask & 2) { for (let k = 0; k <= (j === 0 ? 1 : 0); k++) px(x, 15 - k, i, TP.g2); px(x, j === 0 ? 13 : 14, i, TP.d1); }
  }
});
Tiles.water = (f, mask) => tileCanvas('water' + f + '_' + mask, x => {
  x.fillStyle = TP.w3; x.fillRect(0, 0, 16, 16);
  const off = f * 3;
  for (const [X, Y] of [[2, 3], [9, 6], [4, 11], [12, 13]]) { const xx = (X + off) % 16; for (let i = 0; i < 4; i++) px(x, (xx + i) % 16, Y, i === 0 || i === 3 ? TP.w2 : TP.w1); }
  for (const [X, Y] of [[13, 2], [7, 9], [1, 14]]) { const xx = (X + 16 - off) % 16; px(x, xx, Y, TP.w2); px(x, (xx + 1) % 16, Y, TP.w2); }
  // shore: mask bits for land neighbors N E S W
  if (mask & 1) { x.fillStyle = TP.d1; x.fillRect(0, 0, 16, 2); x.fillStyle = TP.w1; x.fillRect(0, 2, 16, 1); x.fillStyle = TP.d3; x.fillRect(0, 0, 16, 1); }
  if (mask & 4) { x.fillStyle = TP.w4; x.fillRect(0, 14, 16, 2); x.fillStyle = TP.w2; x.fillRect(0, 13, 16, 1); }
  if (mask & 8) { x.fillStyle = TP.d1; x.fillRect(0, 0, 2, 16); x.fillStyle = TP.w1; x.fillRect(2, 0, 1, 16); x.fillStyle = TP.d3; x.fillRect(0, 0, 1, 16); }
  if (mask & 2) { x.fillStyle = TP.d1; x.fillRect(14, 0, 2, 16); x.fillStyle = TP.w1; x.fillRect(13, 0, 1, 16); x.fillStyle = TP.d3; x.fillRect(15, 0, 1, 16); }
});
Tiles.spring = f => tileCanvas('spring' + f, x => {
  x.fillStyle = '#60c8f0'; x.fillRect(0, 0, 16, 16);
  const sp = [[3, 4], [11, 3], [6, 11], [13, 12], [8, 7]];
  sp.forEach(([X, Y], i) => { if ((i + f) % 3 === 0) { px(x, X, Y, '#fff'); px(x, X - 1, Y, '#c8f4ff'); px(x, X + 1, Y, '#c8f4ff'); px(x, X, Y - 1, '#c8f4ff'); px(x, X, Y + 1, '#c8f4ff'); } else px(x, X, Y, '#a8e8ff'); });
});
Tiles.bridge = tileCanvas('bridge', x => {
  x.fillStyle = TP.w3; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#b07840'; x.fillRect(1, 0, 14, 16);
  for (let y = 0; y < 16; y += 4) { x.fillStyle = '#d09858'; x.fillRect(2, y, 12, 3); x.fillStyle = '#7a4c24'; x.fillRect(1, y + 3, 14, 1); }
  x.fillStyle = '#6a4020'; x.fillRect(0, 0, 2, 16); x.fillRect(14, 0, 2, 16); x.fillStyle = '#a07040'; x.fillRect(1, 0, 1, 16); x.fillRect(14, 0, 1, 16);
});
Tiles.ledge = tileCanvas('ledge', x => {
  x.drawImage(Tiles.grass(2), 0, 0);
  x.fillStyle = '#3e8a44'; x.fillRect(0, 9, 16, 2);
  x.fillStyle = '#9a7a48'; x.fillRect(0, 11, 16, 3); x.fillStyle = '#7a5a34'; x.fillRect(0, 14, 16, 1);
  x.fillStyle = '#c8a468'; for (let i = 0; i < 16; i += 4) x.fillRect(i + 1, 11, 2, 1);
  x.fillStyle = TP.g1; x.fillRect(0, 8, 16, 1);
});
const TREE_ROWS = [
  '......kkkk......',
  '....kkLLllkk....',
  '...kLLllllllk...',
  '..kLlllLllllmk..',
  '.kLllllllllllmk.',
  '.kllLlllllllmmk.',
  'kLlllllllLllmmmk',
  'klllllllllllmmmk',
  'kllllLllllmmmmdk',
  'kmllllllmmmmmmdk',
  'kmmmlllmmmmmdddk',
  'kmmmmmmmmmmddddk',
  '.kmmmmmmmdddddk.',
  '.kdmmmmdddddddk.',
  '..kkddddddddkk..',
  '....kkkkkkkk....',
  '......kTTk......',
  '.....kTTttk.....',
  '.....kTTtdk.....',
  '....kTTttddk....',
  '....kkkkkkkk....',
];
Tiles.tree = spriteFrom(TREE_ROWS, { k: '#1e4a2a', L: '#9ade7a', l: '#5cb850', m: '#3e9844', d: '#2c7436', T: '#9a6838', t: '#7a4c28' });
Tiles.rock = tileCanvas('rock', x => { x.drawImage(Tiles.grass(0), 0, 0); rows(x, ['................', '................', '.....kkkkk......', '...kkLllllkk....', '..kLlllllmmmk...', '..kllllllmmmmk..', '.kLlllllmmmmmk..', '.klllllmmmmmdk..', '.kmlllmmmmmddk..', '.kmmmmmmmmdddk..', '..kmmmmmddddk...', '...kkddddddk....', '....skkkkkks....', '......ssss......', '................', '................'], { k: '#3a3a44', L: '#e0e0e8', l: '#b8b8c4', m: '#9090a0', d: '#6a6a7c', s: TP.g3 }); });
Tiles.bush = tileCanvas('bush', x => { x.drawImage(Tiles.grass(0), 0, 0); rows(x, ['................', '................', '.....kkkkkk.....', '...kkLlllmmkk...', '..kLllLllmmmdk..', '.kLlllllllmmmdk.', '.kllLllllmmmddk.', '.klllllmmmmmddk.', '.kmllmmmmmmdddk.', '.kmmmmmmmmddddk.', '..kmmmmmddddkk..', '...kkkkkkkkk....', '....ssssssss....', '................', '................', '................'], { k: '#1e4a2a', L: '#9ade7a', l: '#5cb850', m: '#3e9844', d: '#2c7436', s: TP.g3 }); });
Tiles.sign = tileCanvas('sign', x => { x.drawImage(Tiles.grass(0), 0, 0); rows(x, ['................', '..kkkkkkkkkkkk..', '.kWWWWWWWWWWWWk.', '.kWwwwwwwwwwwBk.', '.kWwbbbwbbbwwBk.', '.kWwwwwwwwwwwBk.', '.kWwbbwbbbbwwBk.', '.kWBBBBBBBBBBBk.', '..kkkkkkkkkkkk..', '......kPPk......', '......kPpk......', '......kPpk......', '.....skPpks.....', '......kkkk......', '................', '................'], { k: '#4a2c18', W: '#f0d8a0', w: '#e0c080', b: '#a07848', B: '#b08850', P: '#9a6838', p: '#7a4c28', s: TP.g3 }); });
Tiles.fence = mask => tileCanvas('fence' + mask, x => {
  x.drawImage(Tiles.grass(3), 0, 0);
  const pal = { k: '#5a4a48', W: '#ffffff', w: '#d8d0d0', s: TP.g3 };
  rows(x, ['................', '................', '.....kkkkk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kkkkk......', '.....sssss......', '................', '................'], pal, 1, 0);
  const rail = (a, b) => { x.fillStyle = '#5a4a48'; x.fillRect(a, 4, b - a, 1); x.fillRect(a, 7, b - a, 1); x.fillRect(a, 8, b - a, 1); x.fillRect(a, 11, b - a, 1); x.fillStyle = '#fff'; x.fillRect(a, 5, b - a, 2); x.fillRect(a, 9, b - a, 2); };
  if (mask & 8) rail(0, 6); if (mask & 2) rail(11, 16);
});
Tiles.stone = v => tileCanvas('stone' + v, x => {
  x.fillStyle = '#c8bca4'; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#a89c84'; x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(v % 2 ? 4 : 10, 0, 1, 7); x.fillRect(v % 2 ? 12 : 3, 8, 1, 7);
  x.fillStyle = '#dcd2bc'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 8, 16, 1);
  if (v === 2) { x.fillStyle = '#7aa850'; x.fillRect(2, 3, 4, 2); x.fillRect(3, 2, 2, 1); x.fillRect(9, 11, 5, 2); x.fillStyle = '#5a8a40'; x.fillRect(3, 4, 2, 1); x.fillRect(10, 12, 3, 1); }
});
Tiles.ruinWall = v => tileCanvas('rwall' + v, x => {
  x.fillStyle = '#7c7060'; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#5a5044'; x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(v % 2 ? 5 : 11, 0, 1, 7); x.fillRect(v % 2 ? 13 : 2, 8, 1, 7);
  x.fillStyle = '#948878'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 8, 16, 1);
  if (v === 3) { x.fillStyle = '#6aa048'; x.fillRect(0, 0, 6, 2); x.fillRect(1, 2, 2, 2); }
});
const PILLAR_ROWS = ['..kkkkkkkkkkkk..', '.kLLllllllllmmk.', '.kllllllllllmmk.', '..kkkkkkkkkkkk..', '...kLlllllmmk...', '...kLlllllmmk...', '...kllllllmmk...', '...kllllllmdk...', '...kLlllllmdk...', '...kllllllmdk...', '...kllllllmdk...', '...kgglllmmdk...', '...kgggllmmdk...', '...kllllllmdk...', '...kllllllmdk...', '...kllllllmdk...', '...kLlllllmdk...', '...kllllllmdk...', '...kllllllmdk...', '..kkkkkkkkkkkk..', '.kLlllllllllmdk.', '.kmmmmmmmmmmddk.', '..kkkkkkkkkkkk..'];
Tiles.pillar = spriteFrom(PILLAR_ROWS, { k: '#3a342c', L: '#ece4d0', l: '#c8bca4', m: '#a89c84', d: '#847860', g: '#7aa850' });
// interior
Tiles.floor = tileCanvas('floor', x => { x.fillStyle = '#e0b878'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#c89858'; x.fillRect(0, 3, 16, 1); x.fillRect(0, 7, 16, 1); x.fillRect(0, 11, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(5, 0, 1, 3); x.fillRect(12, 4, 1, 3); x.fillRect(3, 8, 1, 3); x.fillRect(10, 12, 1, 3); x.fillStyle = '#f0cc90'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 4, 16, 1); x.fillRect(0, 8, 16, 1); x.fillRect(0, 12, 16, 1); });
Tiles.wall = (low, deco, pal) => tileCanvas('wall' + low + deco + (pal || ''), x => {
  const P = pal === 'g' ? ['#dce8c8', '#c4d4ac', '#7a9a60'] : pal === 'b' ? ['#d8e4f0', '#c0d0e0', '#6a84a8'] : ['#f4e4c8', '#e4d0ac', '#a88860'];
  x.fillStyle = P[0]; x.fillRect(0, 0, 16, 16);
  for (let i = 1; i < 16; i += 4) { x.fillStyle = P[1]; x.fillRect(i, 0, 2, 16); }
  if (!low) { x.fillStyle = P[2]; x.fillRect(0, 0, 16, 3); x.fillStyle = shade(P[2], -0.3); x.fillRect(0, 3, 16, 1); }
  if (low) { x.fillStyle = '#a07040'; x.fillRect(0, 11, 16, 4); x.fillStyle = '#c89058'; x.fillRect(0, 11, 16, 1); x.fillStyle = '#6a4424'; x.fillRect(0, 15, 16, 1); }
  if (deco === 'w') { rows(x, ['..kkkkkkkkkkkk..', '..kWWWWkWWWWWk..', '..kWSSWkWSSWWk..', '..kWSWWkWSWWWk..', '..kkkkkkkkkkkk..', '..kWWWWkWWWWWk..', '..kWWWWkWWWWWk..', '..kkkkkkkkkkkk..', '.kkkkkkkkkkkkkk.'], { k: '#8a6a48', W: '#a8d8f8', S: '#ffffff' }, 0, 1); }
  if (deco === 'c') { rows(x, ['.....kkkkk......', '....kWWWWWk.....', '...kWWWkWWWk....', '...kWWWkWWWk....', '...kWWWkkWWk....', '...kWWWWWWWk....', '....kWWWWWk.....', '.....kkkkk......'], { k: '#6a4424', W: '#fff8e0' }, 1, 1); }
  if (deco === 'k') { rows(x, ['kkkkkkkkkkkkkkkk', 'kRRBBGGkRRYBBkkk', 'kRRBBGGkRRYBBGGk', 'kRRBBGGkRRYBBGGk', 'kkkkkkkkkkkkkkkk', 'kBBGRRYYkBGGRRkk', 'kBBGRRYYkBGGRRYk', 'kBBGRRYYkBGGRRYk', 'kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk'], { k: '#6a4424', R: '#d05050', B: '#5070c8', G: '#50a060', Y: '#e8c040', W: '#a07040' }, 0, 2); }
  if (deco === 'h') { rows(x, ['kkkkkkkkkkkkkkkk', 'k.RR..YY..GG..Pk', 'k.RR..YY..GG..Pk', 'kkkkkkkkkkkkkkkk', 'k.BB..WW..PP.RRk', 'k.BB..WW..PP.RRk', 'kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk'], { k: '#6a4424', R: '#e05858', B: '#5878d0', G: '#58b068', Y: '#f0c840', W: '#b88050', P: '#c070c8' }, 0, 3); }
  if (deco === 'm') { rows(x, ['..kkkkkkkkkkk...', '..kSSSSGGSSSk...', '..kSGGGGSSSSk...', '..kSSGSSSBBSk...', '..kSSSSSSBBSk...', '..kkkkkkkkkkk...'], { k: '#6a4424', S: '#f0e0b0', G: '#78b060', B: '#68a8e0' }, 0, 2); }
});
Tiles.voidT = tileCanvas('void', x => { x.fillStyle = '#101018'; x.fillRect(0, 0, 16, 16); });
Tiles.mat = tileCanvas('mat', x => { x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#b04848'; x.fillRect(2, 5, 12, 9); x.fillStyle = '#d86868'; x.fillRect(3, 6, 10, 7); x.fillStyle = '#f0c080'; x.fillRect(4, 8, 8, 1); x.fillRect(4, 10, 8, 1); });
Tiles.rug = mask => tileCanvas('rug' + mask, x => {
  x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#5a78c0'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#7898d8';
  for (let i = 0; i < 16; i += 4) for (let j = 0; j < 16; j += 4) if ((i + j) % 8 === 0) x.fillRect(i + 1, j + 1, 2, 2);
  x.fillStyle = '#f0d070'; if (mask & 1) x.fillRect(0, 1, 16, 1); if (mask & 4) x.fillRect(0, 14, 16, 1); if (mask & 8) x.fillRect(1, 0, 1, 16); if (mask & 2) x.fillRect(14, 0, 1, 16);
  x.fillStyle = '#e0b878'; if (mask & 1) x.fillRect(0, 0, 16, 1); if (mask & 4) x.fillRect(0, 15, 16, 1); if (mask & 8) x.fillRect(0, 0, 1, 16); if (mask & 2) x.fillRect(15, 0, 1, 16);
});
Tiles.furn = {};
Tiles.furn.bedTop = tileCanvas('bedT', x => { x.drawImage(Tiles.floor, 0, 0); rows(x, ['.kkkkkkkkkkkkkk.', 'kWWWWWWWWWWWWWWk', 'kWwwwwwwwwwwwwWk', 'kWwPPPPPPPPPPwWk', 'kWwPpppppppppwWk', 'kWwPpppppppppwWk', 'kWwwwwwwwwwwwwWk', 'kWBBBBBBBBBBBBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk'], { k: '#5a3a24', W: '#a0683c', w: '#f0f0f0', P: '#ffffff', p: '#e0e8f0', B: '#4870c0', b: '#6890e0' }); });
Tiles.furn.bedBot = tileCanvas('bedB', x => { x.drawImage(Tiles.floor, 0, 0); rows(x, ['kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBBBBBBBBBBBBWk', 'kWWWWWWWWWWWWWWk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk', 'kk............kk', 'kk............kk'], { k: '#5a3a24', W: '#a0683c', B: '#4870c0', b: '#6890e0' }); });
Tiles.furn.table = mask => tileCanvas('table' + mask, x => {
  x.drawImage(Tiles.floor, 0, 0);
  const top = !(mask & 1), bot = !(mask & 4), L = !!(mask & 8), R = !!(mask & 2);
  const y0 = top ? 2 : 0, y1 = bot ? 12 : 16;
  x.fillStyle = '#7a4c24'; x.fillRect(0, y0, 16, y1 - y0 + (bot ? 1 : 0));
  x.fillStyle = '#d09858'; x.fillRect(L ? 1 : 0, y0 + (top ? 1 : 0), 16 - (L ? 1 : 0) - (R ? 1 : 0), y1 - y0 - (top ? 1 : 0) - (bot ? 2 : 0));
  x.fillStyle = '#e8b878'; if (top) x.fillRect(L ? 1 : 0, y0 + 1, 16 - (L ? 1 : 0) - (R ? 1 : 0), 1);
  x.fillStyle = '#c08848'; for (let yy = y0 + 4; yy < y1 - 2; yy += 4) x.fillRect(L ? 1 : 0, yy, 16 - (L ? 1 : 0) - (R ? 1 : 0), 1);
  if (bot) { x.fillStyle = '#b07840'; x.fillRect(0, y1 - 2, 16, 2); x.fillStyle = '#7a4c24'; if (L) x.fillRect(1, y1, 2, 3); if (R) x.fillRect(13, y1, 2, 3); }
});
Tiles.furn.shelf = top => tileCanvas('shelf' + top, x => { x.drawImage(Tiles.floor, 0, 0); if (top) rows(x, ['kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kRRBkGGYkBBRRGGk', 'kRRBkGGYkBBRRGGk', 'kRRBkGGYkBBRRGGk', 'kkkkkkkkkkkkkkkk', 'kBGGRkYYBBkRGGBk', 'kBGGRkYYBBkRGGBk', 'kBGGRkYYBBkRGGBk', 'kkkkkkkkkkkkkkkk', 'kGGYYBkRRGkBBYYk', 'kGGYYBkRRGkBBYYk', 'kGGYYBkRRGkBBYYk', 'kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kWWWWWWWWWWWWWWk'], { k: '#5a3a24', W: '#a0683c', R: '#d05050', B: '#5070c8', G: '#50a060', Y: '#e8c040' }); else rows(x, ['kWWWWWWWWWWWWWWk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk', '.kk..........kk.', '.kk..........kk.'], { k: '#5a3a24', W: '#a0683c' }); });
Tiles.furn.counter = mask => tileCanvas('counter' + mask, x => { x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#6a4424'; x.fillRect(0, 1, 16, 14); x.fillStyle = '#f0e8d8'; x.fillRect(0, 2, 16, 5); x.fillStyle = '#ffffff'; x.fillRect(0, 2, 16, 1); x.fillStyle = '#b07840'; x.fillRect(0, 8, 16, 6); x.fillStyle = '#d09858'; for (let i = 2; i < 16; i += 5) x.fillRect(i, 9, 3, 4); if (mask & 8) { x.fillStyle = '#6a4424'; x.fillRect(0, 1, 1, 14); } if (mask & 2) { x.fillStyle = '#6a4424'; x.fillRect(15, 1, 1, 14); } });
Tiles.furn.plant = tileCanvas('plant', x => { x.drawImage(Tiles.floor, 0, 0); rows(x, ['.....kk.kk......', '...kkLlklLkk....', '..kLllklllmmk...', '.kLlLllklmmmmk..', '.klllmklllmmdk..', '..kmmmmkmmddk...', '...kkkkkkkkk....', '....kRRRRRk.....', '....krRRRrk.....', '....krRRRrk.....', '.....krrrk......', '.....kkkkk......'], { k: '#2a3a24', L: '#9ade7a', l: '#5cb850', m: '#3e9844', d: '#2c7436', R: '#d07848', r: '#a05030' }, 0, 2); });
Tiles.furn.display = top => tileCanvas('disp' + top, x => { x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#5a3a24'; x.fillRect(0, top ? 2 : 0, 16, top ? 14 : 12); x.fillStyle = '#a8d8f0'; x.fillRect(1, top ? 3 : 0, 14, top ? 12 : 10); x.fillStyle = '#e0f4ff'; if (top) x.fillRect(2, 4, 3, 1); const it = [['#e05858', 3, 6], ['#58a0e0', 8, 6], ['#f0c040', 11, 10], ['#70c070', 4, 11]]; if (top) for (const [c, X, Y] of it) { x.fillStyle = c; x.fillRect(X, Y, 3, 3); } });
Tiles.gate = open => { const c = mkCanvas(32, 32), x = c.getContext('2d'); rows(x, [
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'kLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLk', 'kLllllllllllllllllllllllllllllmk', 'kLllkkkkkkkkkkkkkkkkkkkkkkkllmmk', 'kLlkDDDDDDDDDDDDDDDDDDDDDDDkkmmk', 'kLlkDddddddddddddddddddddddDkmmk'].concat(Array(24).fill('kLlkDdddddddddddddddddddddddDkmmk'.slice(0, 32))).concat(['kLlkDDDDDDDDDDDDDDDDDDDDDDDDkmmk', 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']), open ? { k: '#3a342c', L: '#ece4d0', l: '#c8bca4', m: '#a89c84', D: '#18141c', d: '#0c0a10' } : { k: '#3a342c', L: '#ece4d0', l: '#c8bca4', m: '#a89c84', D: '#6a5e50', d: '#847868' }); if (!open) { x.fillStyle = '#58d8c8'; for (const [a, b] of [[15, 8], [16, 8], [12, 12], [19, 12], [15, 16], [16, 16], [11, 20], [20, 20], [15, 24], [16, 24], [14, 12], [17, 12]]) x.fillRect(a, b, 1, 2); x.fillStyle = '#4a4034'; x.fillRect(15, 6, 2, 24); } return c; };

/* ---------------- Buildings ---------------- */
const BUILD_STYLE = {
  house: { roof: '#d85850', wall: '#f4ecd8', trim: '#a06040' },
  elder: { roof: '#b87840', wall: '#f0e4cc', trim: '#7a4c28' },
  inn: { roof: '#58a868', wall: '#f4ecd8', trim: '#4a7a50' },
  shop: { roof: '#4f7fd0', wall: '#eef0f4', trim: '#3a5a90' },
};
function buildBuilding(b) {
  const st = BUILD_STYLE[b.kind]; const Wd = b.w * 16, Hd = b.h * 16; const c = mkCanvas(Wd, Hd), x = c.getContext('2d');
  const R = ramp(st.roof); const roofH = Hd - 30;
  // walls
  const wy = roofH - 4;
  x.fillStyle = '#2e2630'; x.fillRect(1, wy, Wd - 2, Hd - wy);
  x.fillStyle = st.wall; x.fillRect(2, wy, Wd - 4, Hd - wy - 1);
  x.fillStyle = shade(st.wall, -0.08); for (let i = 4; i < Wd - 4; i += 6) x.fillRect(i, wy + 4, 1, Hd - wy - 8);
  x.fillStyle = st.trim; x.fillRect(2, Hd - 4, Wd - 4, 3); x.fillStyle = shade(st.trim, -0.3); x.fillRect(2, Hd - 2, Wd - 4, 1);
  x.fillStyle = st.trim; x.fillRect(2, wy, 3, Hd - wy - 1); x.fillRect(Wd - 5, wy, 3, Hd - wy - 1);
  // windows
  const winCols = []; for (let i = 0; i < b.w; i++) if (i !== b.door && (b.w <= 4 ? i === (b.door === 0 ? b.w - 1 : 0) || i === b.w - 1 && b.door !== b.w - 1 : (i === 1 || i === b.w - 2))) winCols.push(i);
  for (const i of winCols) { const X = i * 16 + 2, Y = wy + 8; x.fillStyle = '#4a3a30'; x.fillRect(X, Y, 12, 11); x.fillStyle = '#9ad0f0'; x.fillRect(X + 1, Y + 1, 10, 9); x.fillStyle = '#d8f0ff'; x.fillRect(X + 2, Y + 2, 3, 2); x.fillRect(X + 2, Y + 4, 1, 2); x.fillStyle = '#4a3a30'; x.fillRect(X + 6, Y + 1, 1, 9); x.fillRect(X + 1, Y + 5, 10, 1); x.fillStyle = st.trim; x.fillRect(X - 1, Y + 11, 14, 2); }
  // door
  const dX = b.door * 16 + 2, dY = Hd - 22;
  x.fillStyle = '#2e2630'; x.fillRect(dX - 1, dY - 1, 14, 22);
  x.fillStyle = '#9a6030'; x.fillRect(dX, dY, 12, 20); x.fillStyle = '#b87840'; x.fillRect(dX + 1, dY + 1, 4, 18); x.fillRect(dX + 7, dY + 1, 4, 18);
  x.fillStyle = '#f0c848'; x.fillRect(dX + 9, dY + 10, 2, 2);
  if (b.kind === 'shop' || b.kind === 'inn') { x.fillStyle = '#b8e0f8'; x.fillRect(dX + 1, dY + 2, 4, 6); x.fillRect(dX + 7, dY + 2, 4, 6); x.fillStyle = '#e8f8ff'; x.fillRect(dX + 2, dY + 3, 1, 2); x.fillRect(dX + 8, dY + 3, 1, 2); }
  // roof
  x.fillStyle = '#2e2630'; x.fillRect(0, 2, Wd, roofH - 1);
  x.fillStyle = R[2]; x.fillRect(1, 3, Wd - 2, roofH - 4);
  for (let y = 6; y < roofH - 4; y += 4) { x.fillStyle = R[3]; x.fillRect(1, y, Wd - 2, 1); x.fillStyle = R[1]; x.fillRect(1, y + 1, Wd - 2, 1); }
  x.fillStyle = R[0]; x.fillRect(1, 3, Wd - 2, 2); x.fillStyle = R[1]; x.fillRect(1, 5, Wd - 2, 1);
  x.fillStyle = R[3]; x.fillRect(1, 3, 2, roofH - 4); x.fillRect(Wd - 3, 3, 2, roofH - 4);
  x.fillStyle = R[4]; x.fillRect(0, roofH - 3, Wd, 3); x.fillStyle = shade(R[4], -0.3); x.fillRect(2, roofH, Wd - 4, 1);
  if (b.kind === 'house' || b.kind === 'elder') { const cx = Wd - 22; x.fillStyle = '#2e2630'; x.fillRect(cx - 1, 0, 10, 10); x.fillStyle = '#b8a898'; x.fillRect(cx, 1, 8, 8); x.fillStyle = '#8a7a6a'; x.fillRect(cx, 6, 8, 3); x.fillStyle = '#d8ccc0'; x.fillRect(cx, 1, 8, 1); }
  // sign
  if (b.sign) {
    const sx = b.door * 16 + (b.door < b.w / 2 ? 18 : -14), sy = wy + 2; const col = { shop: '#3a68c0', inn: '#3a9a58', elder: '#a06030' }[b.kind];
    x.fillStyle = '#2e2630'; x.fillRect(sx - 1, sy - 1, 14, 12); x.fillStyle = col; x.fillRect(sx, sy, 12, 10); x.fillStyle = shade(col, 0.3); x.fillRect(sx, sy, 12, 1);
    x.fillStyle = '#ffffff';
    if (b.kind === 'shop') { x.fillRect(sx + 3, sy + 4, 6, 5); x.fillRect(sx + 4, sy + 2, 1, 2); x.fillRect(sx + 7, sy + 2, 1, 2); x.fillRect(sx + 5, sy + 2, 2, 1); x.fillStyle = col; x.fillRect(sx + 5, sy + 6, 2, 1); }
    if (b.kind === 'inn') { x.fillRect(sx + 2, sy + 5, 8, 2); x.fillRect(sx + 2, sy + 3, 1, 5); x.fillRect(sx + 9, sy + 5, 1, 3); x.fillRect(sx + 3, sy + 4, 2, 1); x.fillStyle = '#f06868'; x.fillRect(sx + 7, sy + 2, 1, 1); x.fillRect(sx + 9, sy + 2, 1, 1); x.fillRect(sx + 7, sy + 3, 3, 1); x.fillRect(sx + 8, sy + 4, 1, 1); }
    if (b.kind === 'elder') { x.fillStyle = '#f8e070'; for (const [a, bb] of [[5, 2], [6, 2], [4, 4], [5, 4], [6, 4], [7, 4], [3, 5], [8, 5], [5, 6], [6, 6], [4, 7], [7, 7]]) x.fillRect(sx + a, sy + bb, 1, 1); x.fillRect(sx + 5, sy + 3, 2, 3); }
  }
  return c;
}

/* ---------------- UI pieces ---------------- */
const UIC = { text: '#404048', textSh: '#d4d4cc', white: '#f8f8f8', whiteSh: '#686878', red: '#e04848' };
function roundRect(x, X, Y, w, h, col) { x.fillStyle = col; x.fillRect(X + 1, Y, w - 2, h); x.fillRect(X, Y + 1, w, h - 2); }
function drawWin(x, X, Y, w, h, style = 'ow') {
  if (style === 'ow') { // white box with double blue frame
    roundRect(x, X, Y, w, h, '#384868'); roundRect(x, X + 1, Y + 1, w - 2, h - 2, '#88b8e8'); roundRect(x, X + 2, Y + 2, w - 4, h - 4, '#5888c8'); roundRect(x, X + 3, Y + 3, w - 6, h - 6, '#fcfcf8');
  } else if (style === 'menu') {
    roundRect(x, X, Y, w, h, '#484858'); roundRect(x, X + 1, Y + 1, w - 2, h - 2, '#a8a8b8'); roundRect(x, X + 2, Y + 2, w - 4, h - 4, '#fcfcf8');
  } else if (style === 'battle') {
    x.fillStyle = '#18242c'; x.fillRect(X, Y, w, h); x.fillStyle = '#c8b870'; x.fillRect(X + 1, Y + 1, w - 2, h - 2); x.fillStyle = '#e8d890'; x.fillRect(X + 1, Y + 1, w - 2, 1); x.fillStyle = '#2a4858'; x.fillRect(X + 3, Y + 3, w - 6, h - 6); x.fillStyle = '#34586a'; x.fillRect(X + 3, Y + 3, w - 6, 1);
  } else if (style === 'cmd') {
    roundRect(x, X, Y, w, h, '#484858'); roundRect(x, X + 1, Y + 1, w - 2, h - 2, '#b0a060'); roundRect(x, X + 3, Y + 3, w - 6, h - 6, '#fcfcf8');
  } else if (style === 'sign') {
    roundRect(x, X, Y, w, h, '#4a2c18'); roundRect(x, X + 1, Y + 1, w - 2, h - 2, '#c89858'); roundRect(x, X + 3, Y + 3, w - 6, h - 6, '#f8ecd0');
  } else if (style === 'dark') {
    roundRect(x, X, Y, w, h, '#101820'); roundRect(x, X + 1, Y + 1, w - 2, h - 2, '#5a7088'); roundRect(x, X + 2, Y + 2, w - 4, h - 4, '#223040');
  }
}
const CURSOR = spriteFrom(['k....', 'kk...', 'kRk..', 'kRRk.', 'kRk..', 'kk...', 'k....'], { k: '#383840', R: '#e05050' });
const CURSOR_W = spriteFrom(['k....', 'kk...', 'kWk..', 'kWWk.', 'kWk..', 'kk...', 'k....'], { k: '#101418', W: '#f8f8f8' });
const DOWNARROW = spriteFrom(['kkkkkkk', 'kRRRRRk', '.kRRRk.', '..kRk..', '...k...'], { k: '#704040', R: '#f06060' });
const UPARROW = spriteFrom(['...k...', '..kRk..', '.kRRRk.', 'kRRRRRk', 'kkkkkkk'], { k: '#704040', R: '#f06060' });
const TYPE_COL = { '一般': '#a8a47a', '火': '#f08030', '水': '#5888e8', '草': '#6cc048', '雷': '#e8c020', '岩': '#b09838', '毒': '#a048a8', '飛': '#9888e8' };
function typeBadge(x, t, X, Y, w = 30) { roundRect(x, X, Y, w, 12, shade(TYPE_COL[t], -0.45)); roundRect(x, X + 1, Y + 1, w - 2, 10, TYPE_COL[t]); x.fillStyle = shade(TYPE_COL[t], 0.3); x.fillRect(X + 2, Y + 1, w - 4, 1); Font.drawC(x, t, X + w / 2, Y - 1, '#ffffff', shade(TYPE_COL[t], -0.4)); }
const STATUS_INFO = { psn: ['毒', '#a048a8'], par: ['麻', '#d0a818'], slp: ['眠', '#8888a0'], brn: ['燒', '#e05838'] };
function statusBadge(x, s, X, Y) { const [n, c] = STATUS_INFO[s]; roundRect(x, X, Y, 16, 11, shade(c, -0.45)); roundRect(x, X + 1, Y + 1, 14, 9, c); Font.draw(x, n, X + 2, Y - 2, '#ffffff', shade(c, -0.45)); }
function hpColor(r) { return r > 0.5 ? ['#58d880', '#98f8b0', '#30a060'] : r > 0.2 ? ['#f0c828', '#f8e878', '#b08810'] : ['#f05050', '#f8a0a0', '#b02828']; }
function drawHPBar(x, X, Y, w, ratio) {
  roundRect(x, X, Y, w + 18, 7, '#383840');
  x.fillStyle = '#f8b028'; x.fillRect(X + 1, Y + 1, 15, 5); x.fillStyle = '#383840';
  // "HP" tiny letters
  const HP = ['k.k.kk.', 'k.k.k.k', 'kkk.kk.', 'k.k.k..', 'k.k.k..'];
  for (let r = 0; r < 5; r++) for (let i = 0; i < 7; i++) if (HP[r][i] === 'k') x.fillRect(X + 4 + i, Y + 1 + r, 1, 1);
  x.fillStyle = '#505060'; x.fillRect(X + 16, Y + 1, w + 1, 5); x.fillStyle = '#ffffff'; x.fillRect(X + 17, Y + 2, w - 1, 3);
  const fw = Math.max(0, Math.round((w - 1) * clamp(ratio, 0, 1))); if (fw > 0) { const [c, l, d] = hpColor(ratio); x.fillStyle = c; x.fillRect(X + 17, Y + 2, fw, 3); x.fillStyle = l; x.fillRect(X + 17, Y + 2, fw, 1); x.fillStyle = d; x.fillRect(X + 17, Y + 4, fw, 1); }
}
function drawExpBar(x, X, Y, w, ratio) {
  x.fillStyle = '#383840'; x.fillRect(X, Y, w + 2, 4); x.fillStyle = '#d0d0c0'; x.fillRect(X + 1, Y + 1, w, 2);
  const fw = Math.round(w * clamp(ratio, 0, 1)); x.fillStyle = '#48a8f8'; x.fillRect(X + 1, Y + 1, fw, 2); x.fillStyle = '#98d8ff'; x.fillRect(X + 1, Y + 1, fw, 1);
}
const EXCLAIM = spriteFrom(['.kkkkk.', 'kWWWWWk', 'kWWRWWk', 'kWWRWWk', 'kWWRWWk', 'kWWWWWk', 'kWWRWWk', 'kWWWWWk', '.kkkkk.', '...k...'], { k: '#383840', W: '#ffffff', R: '#e04040' });
const ITEM_BALL = spriteFrom(['................', '................', '................', '......kkk.......', '.....kYYYk......', '....kkkkkkk.....', '...kBBbBBBBk....', '..kBbbbBBBBBk...', '..kBbbbBBBBBk...', '..kBBBBBBBBdk...', '..kBBBBBBBddk...', '...kBBBBBddk....', '....kkkkkkk.....', '....ssssssss....', '................', '................'], { k: '#3a2418', Y: '#f8d048', B: '#c88848', b: '#e8b070', d: '#9a6030', s: 'rgba(0,0,0,0)' });
const MINI_ICONS = {
  potion: spriteFrom(['...kk...', '..kWWk..', '...kk...', '..kRRk..', '.kRrRRk.', '.kRRRRk.', '.kRRRRk.', '..kkkk..'], { k: '#383840', W: '#e0e0e8', R: '#f06868', r: '#ffffff' }),
  bag: spriteFrom(['..kkkk..', '.k....k.', 'kkkkkkkk', 'kYYYYYYk', 'kYyyyyYk', 'kYYYYYYk', 'kYYYYYYk', 'kkkkkkkk'], { k: '#4a2c18', Y: '#e0a050', y: '#f8c878' }),
};

/* ---------------- NPC looks (palette + hair variants of the hero template) ---------------- */
function variantRows(style) {
  const R = { down: VILLAGER_ROWS.down.slice(), up: VILLAGER_ROWS.up.slice(), left: VILLAGER_ROWS.left.slice() };
  const set = (d, i, s) => { R[d][i] = s; };
  // remove sword on back for NPCs
  R.up = R.up.map(r => r.replace(/G/g, 'R').replace(/g/g, 'r')); R.down = R.down.map(r => r.replace(/G/g, 'B'));
  R.left = R.left.map(r => r.replace(/G/g, 'B'));
  if (style === 'long') {
    set('down', 10, '.kHSSkSSSSkSSHk.'); set('down', 11, '.kHSSkSSSSkSSHk.'); set('down', 12, '.kHksSSSSSSskHk.'); set('down', 13, '.kHkYYYYYYYYkHk.'); set('down', 14, '.kHkRyYYYYyRkHk.'); set('down', 15, '..kkRRRyyRRRkk..');
    set('up', 11, '.kHHHHHHHHHHHHk.'); set('up', 12, '.kHHHhHHHHhHHHk.'); set('up', 13, '.kHHHHHHHHHHHHk.'); set('up', 14, '.kSkHHHHHHHHkSk.'); set('up', 15, '.kSkRkHHHHkRkSk.');
    set('left', 11, '.kSkSSSSsHHHHk..'); set('left', 12, '..kSSSSskHHHHk..'); set('left', 13, '...kkYYYYHHHk...'); set('left', 14, '...kSRRYYHHk....');
  }
  if (style === 'beard') {
    set('down', 12, '...kWWWWWWWWk...'); set('down', 13, '..kkWWWWWWWWkk..'); set('down', 14, '.kSkRWWWWWWRkSk.'); set('down', 15, '.kSkRRWWWWRRkSk.');
    set('left', 12, '..kWWWWskHkk....'); set('left', 13, '...kWWWWyk......'); set('left', 14, '...kSWWYYyykk...');
  }
  if (style === 'bald') {
    for (const d of ['down', 'up', 'left']) for (let i = 1; i <= 5; i++) R[d][i] = R[d][i].replace(/[Hhj]/g, (m, o) => (o > 4 && o < 11 && i < 5) ? 'S' : m);
    set('down', 12, '...kWWWWWWWWk...'); set('down', 13, '..kkWWWWWWWWkk..'); set('down', 14, '.kSkRWWWWWWRkSk.');
    set('left', 12, '..kWWWWskHkk....'); set('left', 13, '...kWWWWyk......');
  }
  if (style === 'helmet') {
    set('down', 7, '.kHHHHHHHHHHHHk.'); set('down', 8, '.kkkSSSSSSSSkkk.');
    set('left', 7, '.kHHHHHHHHHHHHk.'); set('left', 8, '.kSSSkHHHHHHHk..');
  }
  return R;
}
function buildCharFrames(RW, pal, skirt) {
  const legs = skirt ? {
    stand: ['...kPPPPPPPPk...', '...kPPPPPPPPk...', '....kSkkkkSk....', '....kBk..kBk....'],
    stepL: ['...kPPPPPPPPk...', '...kPPPPPPPPk...', '....kSkkkkSk....', '....kBk..kBk....', '.........kk.....'],
    stepR: ['...kPPPPPPPPk...', '...kPPPPPPPPk...', '....kSkkkkSk....', '....kBk..kBk....', '....kk..........'],
    sideStand: ['...kPPPPPPk.....', '...kPPPPPPk.....', '....kSkSk.......', '....kBkBk.......'],
    sideStepA: ['...kPPPPPPk.....', '...kPPPPPPk.....', '...kSk.kSk......', '...kBk..kBk.....', '.........kk.....'],
    sideStepB: ['...kPPPPPPk.....', '...kPPPPPPk.....', '.....kSSk.......', '.....kBBk.......', '.....kkkk.......'],
  } : LEGS;
  const build = (dir, lg, bob) => { const body = RW[dir]; const L = legs[lg]; const out = new Array(22).fill('................'); const off = bob ? -1 : 0; for (let i = 0; i < body.length; i++) if (i + off >= 0) out[i + off] = body[i]; const ls = 18 + off; for (let i = 0; i < L.length; i++) if (ls + i < 22) out[ls + i] = L[i]; return spriteFrom(out, pal); };
  const f = {};
  for (const d of ['down', 'up']) f[d] = [build(d, 'stand', 0), build(d, 'stepL', 1), build(d, 'stand', 0), build(d, 'stepR', 1)];
  f.left = [build('left', 'sideStand', 0), build('left', 'sideStepA', 1), build('left', 'sideStand', 0), build('left', 'sideStepB', 1)];
  f.right = f.left.map(flipCanvas); return f;
}
const LOOKS = {
  mom: { style: 'long', skirt: 1, H: '#8a5030', h: '#b07048', j: '#d09870', Y: '#f8f8f0', y: '#d8d8d0', R: '#58a868', r: '#3a7848', P: '#58a868' },
  girl: { style: 'long', skirt: 1, H: '#e07848', h: '#f09868', j: '#f8c8a0', Y: '#ffffff', y: '#d8d8e0', R: '#f07898', r: '#c04870', P: '#f07898' },
  woman: { style: 'long', skirt: 1, H: '#3a8a78', h: '#58a898', j: '#88d0c0', Y: '#f8f0d0', y: '#d8c8a0', R: '#f0c040', r: '#c09020', P: '#e0a030' },
  woman2: { style: 'long', skirt: 1, H: '#6a4898', h: '#8a68b8', j: '#b098d8', Y: '#f8f8f8', y: '#d8d8d8', R: '#48a0a8', r: '#307880', P: '#48a0a8' },
  healer: { style: 'long', skirt: 1, H: '#e878a0', h: '#f898b8', j: '#ffc8d8', Y: '#f07898', y: '#c05070', R: '#f8f4f4', r: '#d0c8d0', P: '#f8f4f4' },
  kid: { H: '#7a4828', h: '#9a6840', j: '#c09060', Y: '#f8c838', y: '#d08818', R: '#5888d8', r: '#3860a8', P: '#384870' },
  kid2: { H: '#2a2a38', h: '#484858', j: '#686878', Y: '#f8f8f8', y: '#d0d0d0', R: '#68b058', r: '#488a3a', P: '#6a5a40' },
  man: { H: '#5a3a28', h: '#7a5238', j: '#9a7050', Y: '#e05848', y: '#b03830', R: '#8a9a50', r: '#6a7838', P: '#5a5040' },
  clerk: { H: '#2a3a68', h: '#3a5088', j: '#5870a8', Y: '#ffffff', y: '#d8d8e0', R: '#4870c8', r: '#3050a0', P: '#2a2a40' },
  guard: { style: 'helmet', H: '#8890a0', h: '#b8c0d0', j: '#eef2f8', Y: '#c8ccd8', y: '#9098a8', R: '#a83838', r: '#782828', P: '#3a3848' },
  old: { style: 'bald', H: '#c8c8c8', h: '#e0e0e0', j: '#f8f8f8', W: '#f4f4f4', Y: '#e8d8b0', y: '#c8b890', R: '#9a7050', r: '#7a5438', P: '#6a5040' },
  elder: { style: 'beard', skirt: 1, H: '#d0d0d8', h: '#e8e8f0', j: '#ffffff', W: '#f8f8f8', Y: '#e8c040', y: '#c09020', R: '#7858a8', r: '#583888', P: '#7858a8' },
};
const NPCSprites = {};
function npcFrames(look) {
  if (NPCSprites[look]) return NPCSprites[look]; const L = LOOKS[look];
  const pal = { ...VILLAGER_PAL, ...L }; delete pal.style; delete pal.skirt; if (!pal.W) pal.W = '#f8f8f8';
  NPCSprites[look] = buildCharFrames(variantRows(L.style), pal, L.skirt); return NPCSprites[look];
}
