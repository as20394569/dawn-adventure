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
    '.........kk.....',
    '.....kkkkHk.....',
    '...kkHHHHHHkkk..',
    '..kHHHhhjHHHHHk.',
    '.kHHHHHHhHHHHHk.',
    '.kHHHHHHHHHHHHk.',
    '.kHHHHHHHHHHkHk.',
    '.kHHHHHHHHkSSHk.',
    '.kHHHHkkSSSSSHk.',
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
    '.....kk.........',
    '.....kHkkkk.....',
    '..kkkHHHHHHkk...',
    '.kHHHHHhhHHHHk..',
    '.kHHHHhjjhHHHHk.',
    '.kHHHHHhhHHHHHk.',
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
    '.......kk.......',
    '....kkkHkkk.....',
    '..kkHHHHhjHkk...',
    '.kHHHHHHhhHHHk..',
    '.kHHHHHHHHHHHk..',
    '.kHHHHHHHHHHHHk.',
    '.kHHHkHHHHHHHHk.',
    '.kHHSSHHHHHHHk..',
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
/* Battle view of the hero: the same overworld pixel sprite (back view), scaled 3x, holding the equipped sword */
const SWORD_PAL = { woodSword: ['#d8a868', '#a8743c', '#6a4424'], ironSword: ['#ffffff', '#b8c0d0', '#6a7488'] };
const heroBattleCache = {};
function heroBattleImg(frame = 0, weapon = null) {
  const key = frame + '|' + weapon; if (heroBattleCache[key]) return heroBattleCache[key];
  const n = mkCanvas(24, 23), x = n.getContext('2d'); x.drawImage(Hero.frames.up[frame], 0, 1);
  const pal = SWORD_PAL[weapon];
  if (pal) {
    const pts = []; // walk up-right from the right hand (13,17)
    pts.push([14, 16, '#6a3a26']);                                            // grip
    pts.push([15, 15, '#e8c048'], [14, 14, '#e8c048'], [16, 16, '#e8c048']);  // guard
    for (let t = 0; t < 6; t++) { pts.push([16 + t, 13 - t, pal[0]]); pts.push([16 + t, 14 - t, pal[1]]); }
    pts.push([22, 7, pal[0]]);
    const id = x.getImageData(0, 0, 24, 23), d = id.data; const set = new Set(pts.map(([a, b]) => a + ',' + b));
    const put = (px, py, c) => { const [r, g, bb] = hex2rgb(c), k = (py * 24 + px) * 4; d[k] = r; d[k + 1] = g; d[k + 2] = bb; d[k + 3] = 255; };
    for (const [px, py, c] of pts) put(px, py, c);
    const outline = [];
    for (const [px, py] of pts) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= 24 || qy >= 23 || set.has(qx + ',' + qy)) continue; if (d[(qy * 24 + qx) * 4 + 3] === 0) outline.push([qx, qy]); }
    for (const [qx, qy] of outline) put(qx, qy, '#2a2238');
    x.putImageData(id, 0, 0);
  }
  const big = mkCanvas(72, 69), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(n, 0, 0, 24, 23, 0, 0, 72, 69);
  heroBattleCache[key] = big; return big;
}
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
  fox: { parts: sym([
    { s: 'p', pts: [[42, 50], [50, 38], [52, 24], [56, 12], [60, 22], [63, 14], [63, 32], [58, 46], [48, 54]], c: '#f8b830', glow: 1, noCast: 1 },
    { s: 'p', pts: [[50, 44], [54, 30], [57, 22], [60, 30], [59, 40], [52, 48]], c: '#fff0a0', glow: 1, line: false, noCast: 1 },
    { s: 'e', x: 32, y: 47, rx: 12, ry: 11, c: '#f08838', id: 'body' },
    { s: 'e', x: 32, y: 47, rx: 7, ry: 8, c: '#fff0d8', line: false, clip: 'body' },
    { s: 'e', x: 27, y: 57, rx: 3.5, ry: 5, c: '#e07830', m: 1 },
    { s: 'e', x: 27, y: 60, rx: 3.2, ry: 2, c: '#fff0d8', line: false, m: 1 },
    { s: 'p', pts: [[19, 22], [15, 3], [28, 16]], c: '#f08838', m: 1 },
    { u: [{ s: 'e', x: 32, y: 27, rx: 13, ry: 11 }, { s: 'e', x: 21, y: 32, rx: 6, ry: 4 }, { s: 'e', x: 43, y: 32, rx: 6, ry: 4 }], c: '#f08838', id: 'head' },
    { s: 'e', x: 32, y: 34, rx: 7, ry: 4.5, c: '#fff0d8', line: false, clip: 'head' },
  ]), details: symD([
    { s: 'poly', pts: [[19, 18], [17, 7], [24, 15]], c: '#8a3818', m: 1 },
    { s: 'eye', x: 26, y: 27, w: 1.8, h: 2.9, m: 1 },
    { s: 'dot', x: 32, y: 32, r: 1.6, c: '#302020' },
    { s: 'line', pts: [[29, 35], [32, 36], [35, 35]], c: '#8a3818' },
    { s: 'poly', pts: [[30, 19], [32, 14], [34, 19], [32, 21]], c: '#f8e040' },
  ]) },
  bee: { parts: sym([
    { s: 'e', x: 17, y: 20, rx: 8, ry: 13, rot: -0.55, c: '#dceeff', shine: false, m: 1 },
    { s: 'p', pts: [[29, 56], [32, 63], [35, 56]], c: '#3a3040' },
    { s: 'e', x: 32, y: 47, rx: 11, ry: 11, c: '#f8d030', id: 'abd' },
    { s: 'e', x: 32, y: 45, rx: 13, ry: 2.3, c: '#3a3040', clip: 'abd', line: false },
    { s: 'e', x: 32, y: 52, rx: 13, ry: 2.3, c: '#3a3040', clip: 'abd', line: false },
    { s: 'e', x: 32, y: 37, rx: 9, ry: 5.5, c: '#6a5238' },
    { s: 'e', x: 32, y: 25, rx: 12, ry: 10, c: '#f8d030', id: 'head' },
  ]), details: symD([
    { s: 'line', pts: [[27, 16], [24, 9], [27, 6], [23, 1]], c: '#3a3040', m: 1 },
    { s: 'dot', x: 23, y: 2, r: 2, c: '#f8e040', m: 1 },
    { s: 'eyeW', x: 27, y: 25, w: 3.2, h: 3.8, px: 0.5, py: 0.5, m: 1 },
    { s: 'line', pts: [[30, 31], [32, 32], [34, 31]], c: '#6a4020' },
    { s: 'dot', x: 22, y: 30, r: 1.5, c: '#f8a878', m: 1 },
    { s: 'line', pts: [[14, 10], [11, 16], [16, 17], [12, 24]], c: '#58a8f8', m: 1 },
    { s: 'line', pts: [[25, 40], [22, 45]], c: '#3a3040', m: 1 },
  ]) },
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
  wolf: { parts: sym([
    { s: 'p', pts: [[44, 44], [58, 30], [57, 38], [62, 38], [55, 48]], c: '#56566c' },
    { s: 'e', x: 17, y: 55, rx: 4, ry: 6, c: '#4a4a60', m: 1 },
    { s: 'e', x: 32, y: 46, rx: 17, ry: 11, c: '#626278', id: 'body' },
    { s: 'e', x: 32, y: 50, rx: 8, ry: 6, c: '#a8a8bc', clip: 'body', line: false },
    { s: 'e', x: 25, y: 57, rx: 4, ry: 6.5, c: '#6c6c84', m: 1 },
    { s: 'p', pts: [[15, 38], [17, 29], [22, 33], [23, 24], [28, 30], [32, 25], [36, 30], [41, 24], [42, 33], [47, 29], [49, 38], [40, 46], [24, 46]], c: '#48485e' },
    { s: 'p', pts: [[19, 24], [16, 4], [28, 16]], c: '#6c6c84', m: 1 },
    { u: [{ s: 'e', x: 32, y: 26, rx: 13, ry: 10 }, { s: 'e', x: 32, y: 35, rx: 7.5, ry: 6.5 }], c: '#7a7a94', id: 'head' },
    { s: 'e', x: 32, y: 37, rx: 6.5, ry: 4.5, c: '#c4c4d4', clip: 'head', line: false },
  ]), details: symD([
    { s: 'poly', pts: [[19, 19], [18, 9], [24, 16]], c: '#3a3048', m: 1 },
    { s: 'poly', pts: [[22, 24], [29, 27], [28, 30], [23, 28]], c: '#ffd040', m: 1 },
    { s: 'poly', pts: [[25, 26], [27, 27], [26.5, 29.5], [25, 28.5]], c: '#c02020', m: 1 },
    { s: 'line', pts: [[21, 22], [29, 25.5]], c: '#2a2438', m: 1 },
    { s: 'ell', x: 32, y: 33, rx: 2.4, ry: 1.7, c: '#202028' },
    { s: 'poly', pts: [[27, 38], [37, 38], [35, 42.5], [29, 42.5]], c: '#5a1a28' },
    { s: 'poly', pts: [[27.5, 38], [29.8, 38], [28.6, 41.8]], c: '#ffffff', m: 1 },
  ]) },
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
  croc: { parts: sym([
    { s: 'p', pts: [[44, 48], [60, 42], [64, 48], [58, 54], [46, 54]], c: '#347e84' },
    { s: 'p', pts: [[16, 36], [19, 26], [23, 35]], c: '#2a6a70', m: 1 },
    { s: 'p', pts: [[25, 32], [29, 22], [33, 31]], c: '#2a6a70' },
    { s: 'p', pts: [[31, 31], [35, 21], [39, 32]], c: '#2a6a70' },
    { s: 'e', x: 32, y: 44, rx: 22, ry: 11, c: '#3a8a90', id: 'body' },
    { s: 'e', x: 32, y: 50, rx: 16, ry: 5, c: '#e8e0b8', clip: 'body', line: false },
    { s: 'e', x: 11, y: 52, rx: 7, ry: 4.5, rot: 0.35, c: '#2e747a', m: 1 },
    { u: [{ s: 'e', x: 32, y: 36, rx: 13, ry: 7 }, { s: 'e', x: 32, y: 48, rx: 8, ry: 12 }], c: '#44969c', id: 'head' },
    { s: 'e', x: 23, y: 32, rx: 5, ry: 4.5, c: '#44969c', m: 1 },
  ]), details: symD([
    { s: 'ell', x: 23, y: 32, rx: 2.8, ry: 2.6, c: '#f8e040', m: 1 },
    { s: 'line', pts: [[23, 30], [23, 34]], c: '#202020', m: 1 },
    { s: 'line', pts: [[25, 40], [25.5, 50], [28, 57], [32, 59]], c: '#1a3a40', m: 1 },
    { s: 'poly', pts: [[25, 42], [27, 43], [25.2, 45]], c: '#ffffff', m: 1 },
    { s: 'poly', pts: [[25.3, 47], [27.3, 48], [25.6, 50]], c: '#ffffff', m: 1 },
    { s: 'poly', pts: [[26.5, 52], [28.5, 53.5], [26.8, 55]], c: '#ffffff', m: 1 },
    { s: 'dot', x: 30, y: 55, r: 1.1, c: '#1a3a40', m: 1 },
  ]) },
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
};

// palette-swapped variants for the forest
function recolorDef(def, f) { const cp = JSON.parse(JSON.stringify(def)); const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const k in o) { if ((k === 'c' || k === 'w2') && typeof o[k] === 'string' && o[k][0] === '#') o[k] = f(o[k]); else walk(o[k]); } }; walk(cp); return cp; }
const hueShift = (dh, ks = 1, kl = 1) => c => { const [h, s, l] = rgb2hsl(...hex2rgb(c)); return hsl2hex(h + dh, s * ks, l * kl); };
ART.thornMush = recolorDef(ART.mush, hueShift(160, 1, 0.95));
ART.nightBird = recolorDef(ART.bird, hueShift(45, 0.7, 0.72));
ART.leafFox = recolorDef(ART.fox, hueShift(85, 0.9, 0.95));
ART.mossGiant = recolorDef(ART.golem, hueShift(75, 1.6, 0.95));
ART.caveBat = recolorDef(ART.bird, hueShift(90, 0.6, 0.55));
ART.mudSlime = recolorDef(ART.slime, hueShift(170, 0.45, 0.8));
ART.crystalPebble = recolorDef(ART.pebble, hueShift(180, 3, 1.1));
ART.crystalGolem = recolorDef(ART.golem, hueShift(190, 3.2, 1.05));
const HERB_IMG = spriteFrom(['................', '................', '................', '.......w........', '......kLk.......', '...k.kLlLk.k....', '..kLkkLlLkkLk...', '..kLlkLlLklLk...', '...kLlklklLk..w.', '....kLlklLk.....', '.....kLLLk......', '......kkk.......', '................', '................', '................', '................'], { k: '#1e4a2a', L: '#9ade7a', l: '#5cb850', w: '#ffffff' });

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
Tiles.cobble = (mask, v = 0) => tileCanvas('cob' + mask + '_' + v, x => {
  x.fillStyle = '#7e7666'; x.fillRect(0, 0, 16, 16);
  const r = srand(71 + v * 13), cols = ['#b3aa96', '#a79e8a', '#bdb5a1', '#9d9481', '#aea590'];
  for (let Y = 0, row = 0; Y < 16; Y += 4, row++) for (let X = (row % 2) * 2 - 2; X < 16; X += 4) {
    const c = cols[Math.floor(r() * cols.length)], x0 = Math.max(0, X), x1 = Math.min(16, X + 3); if (x1 <= x0) continue;
    x.fillStyle = c; x.fillRect(x0, Y, x1 - x0, 3); x.fillStyle = shade(c, 0.14); x.fillRect(x0, Y, x1 - x0, 1); x.fillStyle = shade(c, -0.12); x.fillRect(x0, Y + 2, x1 - x0, 1);
  }
  const E = '#655d50';
  if (mask & 1) { x.fillStyle = TP.g2; x.fillRect(0, 0, 16, 1); x.fillStyle = E; x.fillRect(0, 1, 16, 1); }
  if (mask & 4) { x.fillStyle = E; x.fillRect(0, 14, 16, 1); x.fillStyle = TP.g3; x.fillRect(0, 15, 16, 1); }
  if (mask & 8) { x.fillStyle = TP.g2; x.fillRect(0, 0, 1, 16); x.fillStyle = E; x.fillRect(1, 0, 1, 16); }
  if (mask & 2) { x.fillStyle = E; x.fillRect(14, 0, 1, 16); x.fillStyle = TP.g2; x.fillRect(15, 0, 1, 16); }
});
Tiles.well = spriteFrom([
  '.....kkkkkk.....', '...kkRRRRRRkk...', '..kRRrRRrRRrRk..', '.kRRRRRRRRRRRRk.', 'kkkkkkkkkkkkkkkk',
  '..kPk..k...kPk..', '..kPk..k...kPk..', '..kPk.kBBk.kPk..', '..kPk.kbBk.kPk..', '..kPk.kkkk.kPk..',
  '.kkPkkkkkkkkPkk.', 'kSSSSSSSSSSSSSSk', 'kSsDDDDDDDDDDsSk', 'kSsDDdDDDDdDDsSk', 'kSSSSSSSSSSSSSSk',
  'ksSSsSSSsSSSsSsk', 'kSSsSSSsSSSsSSSk', 'kSsSSsSSSsSSsSsk', '.kkkkkkkkkkkkkk.'],
  { k: '#2a2220', R: '#8a5a34', r: '#a8744a', P: '#6a4428', B: '#a8743c', b: '#7a4e2a', S: '#aaa292', s: '#857d70', D: '#1c2838', d: '#3a5068' });
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
  const pal = { k: '#3a2414', W: '#a8703c', w: '#7a4e2a', s: TP.g3 };
  rows(x, ['................', '................', '.....kkkkk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kWWwk......', '.....kkkkk......', '.....sssss......', '................', '................'], pal, 1, 0);
  const rail = (a, b) => { x.fillStyle = '#3a2414'; x.fillRect(a, 4, b - a, 1); x.fillRect(a, 7, b - a, 1); x.fillRect(a, 8, b - a, 1); x.fillRect(a, 11, b - a, 1); x.fillStyle = '#a8703c'; x.fillRect(a, 5, b - a, 2); x.fillRect(a, 9, b - a, 2); x.fillStyle = '#c08a50'; x.fillRect(a, 5, b - a, 1); x.fillRect(a, 9, b - a, 1); };
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
Tiles.floor = tileCanvas('floor', x => { x.fillStyle = '#a8784a'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#86583a'; x.fillRect(0, 3, 16, 1); x.fillRect(0, 7, 16, 1); x.fillRect(0, 11, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(5, 0, 1, 3); x.fillRect(12, 4, 1, 3); x.fillRect(3, 8, 1, 3); x.fillRect(10, 12, 1, 3); x.fillStyle = '#bc8a58'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 4, 16, 1); x.fillRect(0, 8, 16, 1); x.fillRect(0, 12, 16, 1); });
Tiles.wall = (low, deco, pal) => tileCanvas('wall' + low + deco + (pal || ''), x => {
  const P = pal === 'g' ? ['#b3a994', '#8f8573', '#3e3024'] : pal === 'b' ? ['#8a5e3a', '#6a4428', '#3e2a1e'] : ['#dccdae', '#cbbb9a', '#4a3226'];
  x.fillStyle = P[0]; x.fillRect(0, 0, 16, 16);
  if (pal === 'g') { x.fillStyle = P[1]; for (let y = 3; y < 16; y += 4) x.fillRect(0, y, 16, 1); for (let y = 0, r = 0; y < 16; y += 4, r++) for (let i = (r % 2) * 4; i < 16; i += 8) x.fillRect(i, y, 1, 3); x.fillStyle = shade(P[0], 0.12); for (let y = 0; y < 16; y += 4) x.fillRect(0, y, 16, 1); }
  else if (pal === 'b') { x.fillStyle = P[1]; for (let i = 3; i < 16; i += 4) x.fillRect(i, 0, 1, 16); x.fillStyle = shade(P[0], 0.15); for (let i = 0; i < 16; i += 4) x.fillRect(i, 0, 1, 16); }
  else { x.fillStyle = P[1]; for (let i = 0; i < 6; i++) x.fillRect((i * 7) % 15, (i * 5) % 14, 1, 1); x.fillStyle = P[2]; x.fillRect(0, 0, 2, 16); x.fillStyle = shade(P[2], 0.25); x.fillRect(0, 0, 1, 16); }
  if (!low) { x.fillStyle = P[2]; x.fillRect(0, 0, 16, 3); x.fillStyle = shade(P[2], -0.3); x.fillRect(0, 3, 16, 1); }
  if (low) { x.fillStyle = '#6a4428'; x.fillRect(0, 11, 16, 4); x.fillStyle = '#8a5e3a'; x.fillRect(0, 11, 16, 1); x.fillStyle = '#3e2a1e'; x.fillRect(0, 15, 16, 1); }
  if (deco === 'w') { rows(x, ['..kkkkkkkkkkkk..', '..kWWWWkWWWWWk..', '..kWSSWkWSSWWk..', '..kWSWWkWSWWWk..', '..kkkkkkkkkkkk..', '..kWWWWkWWWWWk..', '..kWWWWkWWWWWk..', '..kkkkkkkkkkkk..', '.kkkkkkkkkkkkkk.'], { k: '#3e2a1e', W: '#7e9cb4', S: '#c8dcea' }, 0, 1); }
  if (deco === 'c') { x.fillStyle = 'rgba(255,200,90,0.25)'; x.fillRect(4, 0, 8, 9); x.fillStyle = 'rgba(255,200,90,0.18)'; x.fillRect(3, 1, 10, 7); rows(x, ['.......y........', '......yOy.......', '......yOy.......', '.......y........', '......WWW.......', '......WWW.......', '......WWW.......', '....kkkkkkk.....', '.....k...k......', '......kkk.......', '.......k........'], { y: '#ffd24a', O: '#fff4c0', W: '#efe6d2', k: '#2e2e36' }, 0, 1); }
  if (deco === 'k') { rows(x, ['kkkkkkkkkkkkkkkk', 'kRRBBGGkRRYBBkkk', 'kRRBBGGkRRYBBGGk', 'kRRBBGGkRRYBBGGk', 'kkkkkkkkkkkkkkkk', 'kBBGRRYYkBGGRRkk', 'kBBGRRYYkBGGRRYk', 'kBBGRRYYkBGGRRYk', 'kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk'], { k: '#3e2a1e', R: '#8a3a34', B: '#3a4a78', G: '#4a6a3a', Y: '#a8843a', W: '#7a5030' }, 0, 2); }
  if (deco === 'h') { rows(x, ['kkkkkkkkkkkkkkkk', 'k.RR..YY..GG..Pk', 'k.RR..YY..GG..Pk', 'kkkkkkkkkkkkkkkk', 'k.BB..WW..PP.RRk', 'k.BB..WW..PP.RRk', 'kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk'], { k: '#3e2a1e', R: '#b04a3a', B: '#4a6a9a', G: '#5a8a4a', Y: '#c8a040', W: '#7a5030', P: '#7a4a8a' }, 0, 3); }
  if (deco === 'm') { rows(x, ['..kkkkkkkkkkk...', '..kSSSSGGSSSk...', '..kSGGGGSSSSk...', '..kSSGSSSBBSk...', '..kSSSSSSBBSk...', '..kkkkkkkkkkk...'], { k: '#6a4424', S: '#f0e0b0', G: '#78b060', B: '#68a8e0' }, 0, 2); }
});
Tiles.voidT = tileCanvas('void', x => { x.fillStyle = '#101018'; x.fillRect(0, 0, 16, 16); });
Tiles.mat = tileCanvas('mat', x => { x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#8a6630'; x.fillRect(2, 5, 12, 9); x.fillStyle = '#c8a060'; x.fillRect(3, 6, 10, 7); x.fillStyle = '#9a7438'; x.fillRect(4, 8, 8, 1); x.fillRect(4, 10, 8, 1); });
Tiles.rug = mask => tileCanvas('rug' + mask, x => {
  x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#7a2a30'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#9a4048';
  for (let i = 0; i < 16; i += 4) for (let j = 0; j < 16; j += 4) if ((i + j) % 8 === 0) x.fillRect(i + 1, j + 1, 2, 2);
  x.fillStyle = '#d8b050'; if (mask & 1) x.fillRect(0, 1, 16, 1); if (mask & 4) x.fillRect(0, 14, 16, 1); if (mask & 8) x.fillRect(1, 0, 1, 16); if (mask & 2) x.fillRect(14, 0, 1, 16);
  x.fillStyle = '#a8784a'; if (mask & 1) x.fillRect(0, 0, 16, 1); if (mask & 4) x.fillRect(0, 15, 16, 1); if (mask & 8) x.fillRect(0, 0, 1, 16); if (mask & 2) x.fillRect(15, 0, 1, 16);
});
Tiles.furn = {};
Tiles.furn.bedTop = tileCanvas('bedT', x => { x.drawImage(Tiles.floor, 0, 0); rows(x, ['.kkkkkkkkkkkkkk.', 'kWWWWWWWWWWWWWWk', 'kWwwwwwwwwwwwwWk', 'kWwPPPPPPPPPPwWk', 'kWwPpppppppppwWk', 'kWwPpppppppppwWk', 'kWwwwwwwwwwwwwWk', 'kWBBBBBBBBBBBBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk'], { k: '#3e2a1e', W: '#7a4e2e', w: '#e6dcc6', P: '#f2ead8', p: '#d8cdb4', B: '#7a3430', b: '#a04a40' }); });
Tiles.furn.bedBot = tileCanvas('bedB', x => { x.drawImage(Tiles.floor, 0, 0); rows(x, ['kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBbbbbbbbbbbBWk', 'kWBBBBBBBBBBBBWk', 'kWWWWWWWWWWWWWWk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk', 'kk............kk', 'kk............kk'], { k: '#3e2a1e', W: '#7a4e2e', B: '#7a3430', b: '#a04a40' }); });
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
Tiles.furn.shelf = top => tileCanvas('shelf' + top, x => { x.drawImage(Tiles.floor, 0, 0); if (top) rows(x, ['kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kRRBkGGYkBBRRGGk', 'kRRBkGGYkBBRRGGk', 'kRRBkGGYkBBRRGGk', 'kkkkkkkkkkkkkkkk', 'kBGGRkYYBBkRGGBk', 'kBGGRkYYBBkRGGBk', 'kBGGRkYYBBkRGGBk', 'kkkkkkkkkkkkkkkk', 'kGGYYBkRRGkBBYYk', 'kGGYYBkRRGkBBYYk', 'kGGYYBkRRGkBBYYk', 'kkkkkkkkkkkkkkkk', 'kWWWWWWWWWWWWWWk', 'kWWWWWWWWWWWWWWk'], { k: '#3e2a1e', W: '#7a4e2e', R: '#8a3a34', B: '#3a4a78', G: '#4a6a3a', Y: '#a8843a' }); else rows(x, ['kWWWWWWWWWWWWWWk', 'kWWWWWWWWWWWWWWk', 'kkkkkkkkkkkkkkkk', '.kk..........kk.', '.kk..........kk.'], { k: '#5a3a24', W: '#a0683c' }); });
Tiles.furn.counter = mask => tileCanvas('counter' + mask, x => { x.drawImage(Tiles.floor, 0, 0); x.fillStyle = '#6a4424'; x.fillRect(0, 1, 16, 14); x.fillStyle = '#b8864e'; x.fillRect(0, 2, 16, 5); x.fillStyle = '#d09a60'; x.fillRect(0, 2, 16, 1); x.fillStyle = '#b07840'; x.fillRect(0, 8, 16, 6); x.fillStyle = '#d09858'; for (let i = 2; i < 16; i += 5) x.fillRect(i, 9, 3, 4); if (mask & 8) { x.fillStyle = '#6a4424'; x.fillRect(0, 1, 1, 14); } if (mask & 2) { x.fillStyle = '#6a4424'; x.fillRect(15, 1, 1, 14); } });
Tiles.furn.plant = tileCanvas('plant', x => { x.drawImage(Tiles.floor, 0, 0); rows(x, ['.....kk.kk......', '...kkLlklLkk....', '..kLllklllmmk...', '.kLlLllklmmmmk..', '.klllmklllmmdk..', '..kmmmmkmmddk...', '...kkkkkkkkk....', '....kRRRRRk.....', '....krRRRrk.....', '....krRRRrk.....', '.....krrrk......', '.....kkkkk......'], { k: '#2a3a24', L: '#9ade7a', l: '#5cb850', m: '#3e9844', d: '#2c7436', R: '#d07848', r: '#a05030' }, 0, 2); });
Tiles.furn.display = top => tileCanvas('disp' + top, x => { x.drawImage(Tiles.floor, 0, 0); const Y0 = top ? 3 : 0, h = top ? 13 : 12; x.fillStyle = '#3e2a1e'; x.fillRect(1, Y0, 14, h); x.fillStyle = '#a8743c'; x.fillRect(2, Y0 + 1, 12, h - 2); x.fillStyle = '#7a4e2a'; x.fillRect(2, Y0 + 4, 12, 1); x.fillRect(2, Y0 + 8, 12, 1); x.fillRect(7, Y0 + 1, 1, h - 2); if (top) { const it = [['#c8403a', 3, 1], ['#c8403a', 5, 2], ['#d8b040', 9, 1], ['#5a8a4a', 11, 2], ['#c8403a', 4, 0]]; for (const [c, X, Y] of it) { x.fillStyle = c; x.fillRect(X, Y, 2, 2); } } });
Tiles.gate = open => { const c = mkCanvas(32, 32), x = c.getContext('2d'); rows(x, [
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'kLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLk', 'kLllllllllllllllllllllllllllllmk', 'kLllkkkkkkkkkkkkkkkkkkkkkkkllmmk', 'kLlkDDDDDDDDDDDDDDDDDDDDDDDkkmmk', 'kLlkDddddddddddddddddddddddDkmmk'].concat(Array(24).fill('kLlkDdddddddddddddddddddddddDkmmk'.slice(0, 32))).concat(['kLlkDDDDDDDDDDDDDDDDDDDDDDDDkmmk', 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']), open ? { k: '#3a342c', L: '#ece4d0', l: '#c8bca4', m: '#a89c84', D: '#18141c', d: '#0c0a10' } : { k: '#3a342c', L: '#ece4d0', l: '#c8bca4', m: '#a89c84', D: '#6a5e50', d: '#847868' }); if (!open) { x.fillStyle = '#58d8c8'; for (const [a, b] of [[15, 8], [16, 8], [12, 12], [19, 12], [15, 16], [16, 16], [11, 20], [20, 20], [15, 24], [16, 24], [14, 12], [17, 12]]) x.fillRect(a, b, 1, 2); x.fillStyle = '#4a4034'; x.fillRect(15, 6, 2, 24); } return c; };

/* ---------------- Buildings (medieval half-timbered) ---------------- */
const BUILD_STYLE = {
  house: { roof: '#c9a05a', roofT: 'thatch', wall: '#eadfc4', beam: '#4a3226', shut: '#5b7a4a' },
  elder: { roof: '#5d6882', roofT: 'slate', wall: '#e6dcc4', beam: '#3e2a22', shut: '#7a3a34', banner: '#8a2e34' },
  inn: { roof: '#b0603e', roofT: 'tile', wall: '#ecdfc2', beam: '#4a3226', shut: '#4a6a8a' },
  shop: { roof: '#86653f', roofT: 'shingle', wall: '#e8dcc0', beam: '#4a3226', shut: '#8a5a2e', awning: ['#b84a3e', '#efe2c4'] },
};
const B_OUT = '#241c22';
function archDoorShape(x, X, Y, col) { x.fillStyle = col; x.fillRect(X, Y + 3, 12, 17); x.fillRect(X + 1, Y + 1, 10, 2); x.fillRect(X + 3, Y, 6, 1); }
function drawRoof(x, st, Wd, roofH, seed) {
  const R = ramp(st.roof), r = srand(seed);
  x.fillStyle = B_OUT; x.fillRect(0, 2, Wd, roofH - 1);
  x.fillStyle = R[2]; x.fillRect(1, 3, Wd - 2, roofH - 4);
  const T = st.roofT;
  if (T === 'thatch') {
    for (let X = 1; X < Wd - 1; X++) for (let Y = 4; Y < roofH - 5; Y += 1) { const v = r(); if (v < 0.22) px(x, X, Y, R[1]); else if (v < 0.4) px(x, X, Y, R[3]); }
    for (let Y = 9; Y < roofH - 6; Y += 7) { x.fillStyle = R[3]; x.fillRect(1, Y, Wd - 2, 1); x.fillStyle = R[1]; x.fillRect(1, Y - 1, Wd - 2, 1); }
    x.fillStyle = R[1]; x.fillRect(1, 3, Wd - 2, 2); x.fillStyle = R[0]; x.fillRect(1, 3, Wd - 2, 1);
    // thick rounded eave
    x.fillStyle = R[1]; x.fillRect(0, roofH - 6, Wd, 2); x.fillStyle = R[2]; x.fillRect(0, roofH - 4, Wd, 2); x.fillStyle = R[3]; x.fillRect(0, roofH - 2, Wd, 2);
    for (let X = 1; X < Wd - 1; X += 3) px(x, X, roofH, R[4]);
    x.fillStyle = B_OUT; x.fillRect(0, roofH - 6, 1, 7); x.fillRect(Wd - 1, roofH - 6, 1, 7);
  } else if (T === 'slate' || T === 'shingle') {
    const tw = T === 'slate' ? 6 : 5, th = T === 'slate' ? 4 : 5;
    for (let Y = 5, row = 0; Y < roofH - 4; Y += th, row++) {
      for (let X = 1 - (row % 2) * Math.floor(tw / 2); X < Wd - 1; X += tw) {
        const v = r(), c = v < 0.3 ? R[1] : v < 0.8 ? R[2] : shade(R[2], -0.08);
        const x0 = Math.max(1, X), x1 = Math.min(Wd - 1, X + tw - 1); if (x1 <= x0) continue;
        x.fillStyle = c; x.fillRect(x0, Y, x1 - x0, th - 1); x.fillStyle = R[3]; x.fillRect(x0, Y + th - 1, x1 - x0, 1);
        x.fillStyle = shade(R[3], -0.1); if (X + tw - 1 < Wd - 1) x.fillRect(X + tw - 1, Y, 1, th - 1);
        if (T === 'shingle' && v > 0.7) px(x, x0 + 1, Y + 1, R[3]);
      }
    }
    x.fillStyle = R[3]; x.fillRect(1, 3, Wd - 2, 2); x.fillStyle = R[1]; x.fillRect(1, 3, Wd - 2, 1);
    x.fillStyle = R[4]; x.fillRect(0, roofH - 3, Wd, 3); x.fillStyle = R[3]; x.fillRect(0, roofH - 4, Wd, 1);
  } else { // barrel tiles
    for (let X = 1; X < Wd - 1; X++) { const m = (X - 1) % 4; x.fillStyle = m === 0 ? R[1] : m === 3 ? R[3] : R[2]; x.fillRect(X, 5, 1, roofH - 9); }
    for (let Y = 9; Y < roofH - 4; Y += 5) { for (let X = 1; X < Wd - 1; X++) { const m = (X - 1) % 4; px(x, X, Y, m === 0 || m === 3 ? R[4] : R[3]); if (m === 1 || m === 2) px(x, X, Y - 1, R[3]); } }
    x.fillStyle = R[3]; x.fillRect(1, 3, Wd - 2, 2); x.fillStyle = R[1]; x.fillRect(1, 3, Wd - 2, 1);
    x.fillStyle = R[4]; x.fillRect(0, roofH - 3, Wd, 3); for (let X = 1; X < Wd - 1; X += 4) { px(x, X + 1, roofH - 3, R[2]); px(x, X + 2, roofH - 3, R[2]); }
  }
  // verges
  x.fillStyle = R[3]; x.fillRect(1, 3, 1, roofH - 6); x.fillRect(Wd - 2, 3, 1, roofH - 6);
}
function stoneBlocks(x, X0, Y0, w, h, seed, pal = ['#8e877a', '#6c665b', '#aaa393']) {
  const r = srand(seed); x.fillStyle = pal[1]; x.fillRect(X0, Y0, w, h);
  for (let Y = Y0, row = 0; Y < Y0 + h; Y += 3, row++) for (let X = X0 - (row % 2) * 2; X < X0 + w; X += 4 + Math.floor(r() * 2)) {
    const x0 = Math.max(X0, X), x1 = Math.min(X0 + w, X + 4); if (x1 - x0 < 1) continue;
    x.fillStyle = r() < 0.3 ? shade(pal[0], -0.06) : pal[0]; x.fillRect(x0, Y, x1 - x0 - 1, Math.min(2, Y0 + h - Y)); x.fillStyle = pal[2]; x.fillRect(x0, Y, x1 - x0 - 1, 1);
  }
}
function buildBuilding(b) {
  const st = BUILD_STYLE[b.kind]; const Wd = b.w * 16, Hd = b.h * 16; const c = mkCanvas(Wd, Hd), x = c.getContext('2d');
  const roofH = Hd - 30, wy = roofH - 4, fy = Hd - 7, seed = b.x * 31 + b.y * 17 + b.w;
  const BM = st.beam, BH = shade(BM, 0.22);
  // plaster
  x.fillStyle = B_OUT; x.fillRect(1, wy, Wd - 2, Hd - wy);
  x.fillStyle = st.wall; x.fillRect(2, wy, Wd - 4, Hd - wy - 1);
  const r = srand(seed); for (let i = 0; i < Wd * 2; i++) px(x, 2 + Math.floor(r() * (Wd - 4)), wy + Math.floor(r() * (fy - wy)), shade(st.wall, -0.05));
  // stone foundation
  stoneBlocks(x, 2, fy, Wd - 4, 6, seed); x.fillStyle = B_OUT; x.fillRect(1, Hd - 1, Wd - 2, 1);
  // windows / door columns
  const winCols = []; for (let i = 0; i < b.w; i++) if (i !== b.door && (b.w <= 4 ? i === (b.door === 0 ? b.w - 1 : 0) || i === b.w - 1 && b.door !== b.w - 1 : (i === 1 || i === b.w - 2))) winCols.push(i);
  // timber frame: sill, mid and top beams, posts on tile boundaries, braces in empty panels
  const mid = wy + 15;
  const beamH = (Y) => { x.fillStyle = BM; x.fillRect(2, Y, Wd - 4, 2); x.fillStyle = BH; x.fillRect(2, Y, Wd - 4, 1); };
  for (let i = 0; i < b.w; i++) {
    if (winCols.includes(i) || i === b.door) continue;
    const X0 = i * 16 + (i === 0 ? 4 : 1), X1 = i * 16 + (i === b.w - 1 ? 11 : 14);
    x.fillStyle = BM; for (let t = 0; t <= 1; t++) { pxLine(x, X0, fy - 2 - t, X1, mid + 2 - t, BM); }
    pxLine(x, X0, mid - 1, X1, wy + 3, BM); pxLine(x, X1, mid - 1, X0, wy + 3, BM);
  }
  beamH(wy + 1); beamH(mid); beamH(fy - 2);
  for (let i = 1; i < b.w; i++) { x.fillStyle = BM; x.fillRect(i * 16 - 1, wy + 1, 2, fy - wy - 1); x.fillStyle = BH; x.fillRect(i * 16 - 1, wy + 1, 1, fy - wy - 1); }
  x.fillStyle = BM; x.fillRect(2, wy, 3, fy - wy); x.fillRect(Wd - 5, wy, 3, fy - wy); x.fillStyle = BH; x.fillRect(2, wy, 1, fy - wy);
  // windows: lattice glass with shutters
  for (const i of winCols) {
    const X = i * 16 + 1, Y = wy + 5, gx = X + 3;
    x.fillStyle = B_OUT; x.fillRect(gx - 1, Y - 1, 10, 12);
    x.fillStyle = '#5f7890'; x.fillRect(gx, Y, 8, 10);
    for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < 8; xx++) { if ((xx + yy) % 4 === 0 || (xx - yy + 16) % 4 === 0) px(x, gx + xx, Y + yy, '#3e3a3c'); else if (xx + yy < 5) px(x, gx + xx, Y + yy, '#9ab8cc'); }
    x.fillStyle = st.shut; x.fillRect(X, Y - 1, 3, 12); x.fillRect(X + 11, Y - 1, 3, 12);
    x.fillStyle = shade(st.shut, -0.35); x.fillRect(X + 1, Y - 1, 1, 12); x.fillRect(X + 12, Y - 1, 1, 12); x.fillRect(X, Y + 5, 3, 1); x.fillRect(X + 11, Y + 5, 3, 1);
    x.fillStyle = BM; x.fillRect(X, Y + 11, 14, 2); x.fillStyle = BH; x.fillRect(X, Y + 11, 14, 1);
    if (b.kind === 'house' || b.kind === 'inn') { x.fillStyle = '#6a4424'; x.fillRect(X + 2, Y + 13, 10, 2); for (let k = 0; k < 4; k++) { px(x, X + 3 + k * 2, Y + 12, k % 2 ? '#e8d860' : '#e86868'); px(x, X + 4 + k * 2, Y + 12, '#5a9a48'); } }
  }
  // shop awning over the first window
  if (st.awning && winCols.length) {
    const X = winCols[0] * 16, Y = wy + 2; for (let k = 0; k < 16; k++) { x.fillStyle = st.awning[Math.floor(k / 3) % 2]; x.fillRect(X + k, Y, 1, 5); }
    x.fillStyle = shade(st.awning[0], -0.35); x.fillRect(X, Y + 5, 16, 1); for (let k = 0; k < 16; k += 3) px(x, X + k + 1, Y + 6, shade(st.awning[0], -0.2));
  }
  // arched plank door in a stone surround
  const dX = b.door * 16 + 2, dY = Hd - 22;
  x.fillStyle = '#8e877a'; x.fillRect(dX - 2, dY - 1, 16, 21); x.fillRect(dX, dY - 2, 12, 1); x.fillStyle = '#aaa393'; x.fillRect(dX - 2, dY, 1, 19); x.fillRect(dX + 1, dY - 2, 10, 1);
  archDoorShape(x, dX - 1, dY - 1, B_OUT); archDoorShape(x, dX, dY, '#7a4a2a');
  x.fillStyle = '#5e3820'; for (const k of [3, 6, 9]) x.fillRect(dX + k, dY + 1, 1, 19); x.fillStyle = '#9a643a'; x.fillRect(dX + 1, dY + 3, 1, 17);
  x.fillStyle = '#2e2e36'; x.fillRect(dX, dY + 5, 8, 1); x.fillRect(dX, dY + 14, 8, 1); x.fillStyle = '#c8a040'; x.fillRect(dX + 9, dY + 10, 2, 2);
  // roof + chimney
  drawRoof(x, st, Wd, roofH, seed);
  if (b.kind !== 'shop') { const cx = Wd - 20; x.fillStyle = B_OUT; x.fillRect(cx - 1, -0, 10, 10); stoneBlocks(x, cx, 1, 8, 8, seed + 3); x.fillStyle = '#4a4540'; x.fillRect(cx, 1, 8, 1); }
  if (st.banner) { const bx = 5; x.fillStyle = '#2e2e36'; x.fillRect(bx, wy + 2, 1, 16); x.fillStyle = st.banner; x.fillRect(bx + 1, wy + 3, 6, 11); px(x, bx + 1, wy + 14, st.banner); px(x, bx + 6, wy + 14, st.banner); px(x, bx + 2, wy + 14, st.banner); px(x, bx + 5, wy + 14, st.banner); x.fillStyle = '#e8c048'; x.fillRect(bx + 3, wy + 6, 2, 4); x.fillRect(bx + 2, wy + 7, 4, 1); }
  // hanging iron-bracket sign
  if (b.sign) {
    const cands = [...Array(b.w).keys()].filter(i => i !== b.door && !winCols.includes(i)).sort((p, q) => Math.abs(p - b.door) - Math.abs(q - b.door) || q - p);
    const col = cands[0], ax = col * 16 + (col === 0 ? 4 : 1), ay = wy + 4, right = true;
    x.fillStyle = '#2e2e36'; x.fillRect(ax, ay, 12, 1); x.fillRect(ax, ay - 1, 1, 3); px(x, ax + 11, ay + 1, '#2e2e36');
    const sx = ax + 1, sy = ay + 3; x.fillStyle = '#2e2e36'; x.fillRect(sx + 1, ay + 1, 1, 2); x.fillRect(sx + 8, ay + 1, 1, 2);
    x.fillStyle = B_OUT; x.fillRect(sx - 1, sy - 1, 12, 11); x.fillStyle = '#9a6a3c'; x.fillRect(sx, sy, 10, 9); x.fillStyle = '#b8844e'; x.fillRect(sx, sy, 10, 1); x.fillStyle = '#7a5030'; x.fillRect(sx, sy + 4, 10, 1);
    const P = (pts, col) => { for (const [a, bb] of pts) px(x, sx + a, sy + bb, col); };
    if (b.kind === 'shop') { P([[4, 1], [5, 1], [4, 2], [5, 2], [3, 3], [6, 3], [2, 4], [7, 4], [2, 5], [7, 5], [2, 6], [7, 6], [3, 7], [4, 7], [5, 7], [6, 7]], '#f0e8d0'); P([[3, 4], [4, 4], [5, 4], [6, 4], [3, 5], [4, 5], [5, 5], [6, 5], [3, 6], [4, 6], [5, 6], [6, 6]], '#e05050'); P([[4, 4]], '#ffb0a0'); }
    if (b.kind === 'inn') { P([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2]], '#ffffff'); P([[2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [3, 7], [4, 7], [5, 7]], '#e8b040'); P([[7, 3], [8, 3], [8, 4], [8, 5], [7, 6]], '#e8b040'); P([[3, 3], [3, 4], [3, 5]], '#f8d880'); }
    if (b.kind === 'elder') { P([[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [2, 2], [7, 2], [2, 3], [7, 3], [2, 4], [7, 4], [3, 5], [6, 5], [3, 6], [6, 6], [4, 7], [5, 7]], '#e8c048'); P([[3, 2], [4, 2], [5, 2], [6, 2], [3, 3], [4, 3], [5, 3], [6, 3], [3, 4], [4, 4], [5, 4], [6, 4], [4, 5], [5, 5], [4, 6], [5, 6]], '#3a58a0'); P([[4, 3], [5, 3], [4, 4], [5, 4]], '#e8c048'); }
  }
  return c;
}

/* ---------------- UI pieces (dark modern pixel style) ---------------- */
const UIC = { text: '#eef1f8', textSh: '#0a0c16', muted: '#8a93b3', accent: '#6ee7d2', warm: '#ffc46b', blue: '#86b4ff', good: '#72e39a', bad: '#ff6b7a', dis: '#5a6180', white: '#eef1f8', whiteSh: '#0a0c16', red: '#ff6b7a' };
const PANEL = { bg: 'rgba(11,13,24,0.88)', solid: '#0e1120', edge: '#3a4262', hi: 'rgba(255,255,255,0.06)', sel: 'rgba(110,231,210,0.15)', btn: 'rgba(28,32,52,0.9)', btnEdge: '#30375a' };
function roundRect(x, X, Y, w, h, col) { x.fillStyle = col; x.fillRect(X + 1, Y, w - 2, h); x.fillRect(X, Y + 1, w, h - 2); }
// thin-line panel with chamfered corners and a short accent tick
function drawPanel(x, X, Y, w, h, acc = UIC.accent, fill = PANEL.bg, edge = PANEL.edge) {
  x.fillStyle = fill; x.fillRect(X + 1, Y + 1, w - 2, h - 2);
  x.fillStyle = edge; x.fillRect(X + 2, Y, w - 4, 1); x.fillRect(X + 2, Y + h - 1, w - 4, 1); x.fillRect(X, Y + 2, 1, h - 4); x.fillRect(X + w - 1, Y + 2, 1, h - 4);
  x.fillRect(X + 1, Y + 1, 1, 1); x.fillRect(X + w - 2, Y + 1, 1, 1); x.fillRect(X + 1, Y + h - 2, 1, 1); x.fillRect(X + w - 2, Y + h - 2, 1, 1);
  x.fillStyle = PANEL.hi; x.fillRect(X + 2, Y + 1, w - 4, 1);
  if (acc) { x.fillStyle = acc; x.fillRect(X + 4, Y, Math.min(14, w - 8), 1); x.fillRect(X + w - 3 - Math.min(6, w - 8), Y + h - 1, Math.min(6, w - 8), 1); }
}
function drawWin(x, X, Y, w, h, style = 'ow') {
  if (style === 'sign') drawPanel(x, X, Y, w, h, UIC.warm);
  else if (style === 'dark') drawPanel(x, X, Y, w, h, UIC.blue);
  else if (style === 'plain') drawPanel(x, X, Y, w, h, null);
  else drawPanel(x, X, Y, w, h, UIC.accent);
}
// selection highlight for list rows
function selBar(x, X, Y, w, h = 15) { x.fillStyle = PANEL.sel; x.fillRect(X, Y, w, h); x.fillStyle = UIC.accent; x.fillRect(X, Y, 2, h); }
// button cell (grid menus)
function drawBtn(x, X, Y, w, h, on, strip) {
  x.fillStyle = on ? 'rgba(110,231,210,0.2)' : PANEL.btn; x.fillRect(X + 1, Y + 1, w - 2, h - 2);
  x.fillStyle = on ? UIC.accent : PANEL.btnEdge; x.fillRect(X + 1, Y, w - 2, 1); x.fillRect(X + 1, Y + h - 1, w - 2, 1); x.fillRect(X, Y + 1, 1, h - 2); x.fillRect(X + w - 1, Y + 1, 1, h - 2);
  if (strip) { x.fillStyle = strip; x.fillRect(X + 2, Y + 3, 2, h - 6); }
}
const CURSOR = spriteFrom(['k...', 'kk..', 'kkk.', 'kk..', 'k...'], { k: '#6ee7d2' });
const CURSOR_W = CURSOR;
const DOWNARROW = spriteFrom(['kkkkk', '.kkk.', '..k..'], { k: '#6ee7d2' });
const UPARROW = spriteFrom(['..k..', '.kkk.', 'kkkkk'], { k: '#6ee7d2' });
const TYPE_COL = { '一般': '#9a9aa8', '火': '#f0783a', '水': '#4f8ff0', '草': '#5cbf55', '雷': '#e6bb2a', '岩': '#b0925a', '毒': '#a55ad0', '飛': '#8c8cf0' };
function typeBadge(x, t, X, Y, w = 30) { const c = TYPE_COL[t]; x.fillStyle = shade(c, -0.25); x.fillRect(X + 1, Y, w - 2, 12); x.fillRect(X, Y + 1, w, 10); x.fillStyle = c; x.fillRect(X + 1, Y + 1, w - 2, 10); Font.drawC(x, t, X + w / 2, Y - 1, '#ffffff', shade(c, -0.5)); }
const STATUS_INFO = { shield: ['盾', '#b8902e'], wet: ['濕', '#3f86d8'], psn: ['毒', '#a55ad0'], par: ['麻', '#d6a91e'], slp: ['眠', '#7f86a8'], brn: ['燒', '#f0603a'] };
function statusBadge(x, s, X, Y) { const [n, c] = STATUS_INFO[s]; x.fillStyle = c; x.fillRect(X + 1, Y, 14, 11); x.fillRect(X, Y + 1, 16, 9); Font.draw(x, n, X + 2, Y - 2, '#ffffff', shade(c, -0.5)); }
function hpColor(r) { return r > 0.5 ? ['#62e08c', '#a8f5c4'] : r > 0.2 ? ['#ffcf5a', '#ffe7a8'] : ['#ff5d6c', '#ffb0b8']; }
// slim bar: dark track, colored fill with a light top line
function drawHPBar(x, X, Y, w, ratio, h = 4) {
  x.fillStyle = '#05060c'; x.fillRect(X - 1, Y - 1, w + 2, h + 2); x.fillStyle = '#262b42'; x.fillRect(X, Y, w, h);
  const fw = Math.max(0, Math.round(w * clamp(ratio, 0, 1))); if (fw > 0) { const [c, l] = hpColor(ratio); x.fillStyle = c; x.fillRect(X, Y, fw, h); x.fillStyle = l; x.fillRect(X, Y, fw, 1); }
}
function drawExpBar(x, X, Y, w, ratio, h = 2) {
  x.fillStyle = '#262b42'; x.fillRect(X, Y, w, h);
  const fw = Math.round(w * clamp(ratio, 0, 1)); x.fillStyle = UIC.blue; x.fillRect(X, Y, fw, h);
}
const EXCLAIM = spriteFrom(['.kkkkk.', 'kWWWWWk', 'kWWRWWk', 'kWWRWWk', 'kWWRWWk', 'kWWWWWk', 'kWWRWWk', 'kWWWWWk', '.kkkkk.', '...k...'], { k: '#1a1206', W: '#ffc46b', R: '#1a1206' });
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
  girl: { style: 'long', skirt: 1, H: '#c86a3a', h: '#e08a58', j: '#f0b890', Y: '#f2ead8', y: '#d0c4aa', R: '#a84a4a', r: '#7a3434', P: '#a84a4a' },
  woman: { style: 'long', skirt: 1, H: '#3a8a78', h: '#58a898', j: '#88d0c0', Y: '#f8f0d0', y: '#d8c8a0', R: '#f0c040', r: '#c09020', P: '#e0a030' },
  woman2: { style: 'long', skirt: 1, H: '#6a4898', h: '#8a68b8', j: '#b098d8', Y: '#f8f8f8', y: '#d8d8d8', R: '#48a0a8', r: '#307880', P: '#48a0a8' },
  healer: { style: 'long', skirt: 1, H: '#8a4a2a', h: '#a8643c', j: '#c88a5a', Y: '#f2ead8', y: '#cfc3aa', R: '#7a3430', r: '#5a2420', P: '#6a5040' },
  kid: { H: '#7a4828', h: '#9a6840', j: '#c09060', Y: '#f8c838', y: '#d08818', R: '#5888d8', r: '#3860a8', P: '#384870' },
  kid2: { H: '#2a2a38', h: '#484858', j: '#686878', Y: '#f8f8f8', y: '#d0d0d0', R: '#68b058', r: '#488a3a', P: '#6a5a40' },
  man: { H: '#5a3a28', h: '#7a5238', j: '#9a7050', Y: '#e05848', y: '#b03830', R: '#8a9a50', r: '#6a7838', P: '#5a5040' },
  clerk: { H: '#5a3a24', h: '#7a5234', j: '#9a7050', Y: '#e8dcc0', y: '#c4b494', R: '#4f6a3a', r: '#3a5028', P: '#5a4a38' },
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
