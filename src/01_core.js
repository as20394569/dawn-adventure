'use strict';
/* ===================== CORE: constants, utils, font, input, coroutines ===================== */
const W = 240, H = 160, TS = 16;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const chance = p => Math.random() < p;
const pick = a => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return c; }
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function shade(hex, f) { const [r, g, b] = hex2rgb(hex); if (f < 0) return rgb2hex(r * (1 + f), g * (1 + f), b * (1 + f)); return rgb2hex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); }
function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
// seeded RNG (for deterministic art)
function srand(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

/* ---------------- Bitmap font (1-bit atlas) ---------------- */
const Font = (() => {
  const raw = atob(FONT_B64); const bin = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bin[i] = raw.charCodeAt(i);
  const n = bin[0] | bin[1] << 8 | bin[2] << 16 | bin[3] << 24;
  let p = 8; const cps = new Array(n); let prev = 0;
  for (let i = 0; i < n; i++) { let v = 0, s = 0, b; do { b = bin[p++]; v |= (b & 127) << s; s += 7; } while (b & 128); prev += v; cps[i] = prev; }
  const glyphs = new Map();
  for (let i = 0; i < n; i++) {
    const a = bin[p], b = bin[p + 1], w = bin[p + 2]; p += 3;
    const g = { adv: a >> 4, x0: a & 15, y0: b >> 4, h: b & 15, w, off: p };
    p += Math.ceil(w * g.h / 8); glyphs.set(cps[i], g);
  }
  function fallback(cp) {
    const c = mkCanvas(16, 16), x = c.getContext('2d'); const ch = String.fromCodePoint(cp);
    x.font = '12px sans-serif'; x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(ch, 0, 11);
    const d = x.getImageData(0, 0, 16, 16).data; let x0 = 16, y0 = 16, x1 = -1, y1 = -1;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) if (d[(yy * 16 + xx) * 4 + 3] > 110) { x0 = Math.min(x0, xx); y0 = Math.min(y0, yy); x1 = Math.max(x1, xx); y1 = Math.max(y1, yy); }
    const adv = clamp(Math.ceil(x.measureText(ch).width) + 1, 3, 13);
    if (x1 < 0) return { adv, x0: 0, y0: 0, w: 0, h: 0 };
    const w = x1 - x0 + 1, h = y1 - y0 + 1, bits = new Uint8Array(w * h);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) bits[yy * w + xx] = d[((yy + y0) * 16 + xx + x0) * 4 + 3] > 110 ? 1 : 0;
    return { adv, x0, y0, w, h, bits };
  }
  function glyph(cp) { let g = glyphs.get(cp); if (!g) { g = fallback(cp); glyphs.set(cp, g); } return g; }
  function on(g, i) { if (g.bits) return g.bits[i]; return (bin[g.off + (i >> 3)] >> (7 - (i & 7))) & 1; }
  const cache = new Map();
  function gcanvas(cp, col, sh) {
    const key = cp + '|' + col + '|' + (sh || ''); let c = cache.get(key); if (c) return c;
    const g = glyph(cp); c = mkCanvas(g.w + 1 || 1, g.h + 1 || 1);
    if (g.w && g.h) {
      const x = c.getContext('2d'); const id = x.createImageData(g.w + 1, g.h + 1); const A = hex2rgb(col), S = sh ? hex2rgb(sh) : null;
      const put = (xx, yy, C) => { const k = (yy * (g.w + 1) + xx) * 4; id.data[k] = C[0]; id.data[k + 1] = C[1]; id.data[k + 2] = C[2]; id.data[k + 3] = 255; };
      if (S) for (let yy = 0; yy < g.h; yy++) for (let xx = 0; xx < g.w; xx++) if (on(g, yy * g.w + xx)) { put(xx + 1, yy, S); put(xx, yy + 1, S); put(xx + 1, yy + 1, S); }
      for (let yy = 0; yy < g.h; yy++) for (let xx = 0; xx < g.w; xx++) if (on(g, yy * g.w + xx)) put(xx, yy, A);
      x.putImageData(id, 0, 0);
    }
    cache.set(key, c); return c;
  }
  function width(str) { let w = 0; for (const ch of String(str)) w += glyph(ch.codePointAt(0)).adv; return w; }
  function draw(ctx, str, x, y, col = '#404040', sh = '#d0d0c8') {
    let cx = Math.round(x); y = Math.round(y);
    for (const ch of String(str)) { const cp = ch.codePointAt(0), g = glyph(cp); if (g.w) ctx.drawImage(gcanvas(cp, col, sh), cx + g.x0, y + g.y0); cx += g.adv; }
    return cx;
  }
  function drawR(ctx, str, xr, y, col, sh) { return draw(ctx, str, xr - width(str), y, col, sh); }
  function drawC(ctx, str, xc, y, col, sh) { return draw(ctx, str, xc - Math.floor(width(str) / 2), y, col, sh); }
  // big text: render to temp then scale
  function drawBig(ctx, str, x, y, scale, col, outline, sh) {
    const w = width(str) + 3, c = mkCanvas(w, 16), cx = c.getContext('2d');
    draw(cx, str, 1, 1, col, null);
    const out = mkCanvas(w * scale + 4, 16 * scale + 4), o = out.getContext('2d');
    if (outline) {
      const oc = mkCanvas(w, 16), ox = oc.getContext('2d'); draw(ox, str, 1, 1, outline, null);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) o.drawImage(oc, 0, 0, w, 16, 2 + dx * 2, 2 + dy * 2, w * scale, 16 * scale);
      if (sh) { const sc = mkCanvas(w, 16), sx = sc.getContext('2d'); draw(sx, str, 1, 1, sh, null); o.drawImage(sc, 0, 0, w, 16, 2, 2 + scale * 2, w * scale, 16 * scale); o.drawImage(oc, 0, 0, w, 16, 2, 2 + scale * 2 + 2, w * scale, 16 * scale); }
    }
    o.drawImage(c, 0, 0, w, 16, 2, 2, w * scale, 16 * scale);
    ctx.drawImage(out, Math.round(x - 2), Math.round(y - 2));
    return out;
  }
  const NOSTART = '。，、！？」』）：；…～．,.!?)';
  function wrap(str, maxW) {
    const lines = [];
    for (const para of String(str).split('\n')) {
      let line = '', w = 0; const chars = [...para];
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i], cw = glyph(ch.codePointAt(0)).adv;
        if (w + cw > maxW && line && !NOSTART.includes(ch)) { lines.push(line); line = ''; w = 0; if (ch === ' ') continue; }
        line += ch; w += cw;
      }
      lines.push(line);
    }
    return lines;
  }
  return { width, draw, drawR, drawC, drawBig, wrap, glyph };
})();

/* ---------------- Input ---------------- */
const Input = {
  keys: ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'],
  raw: {}, tap: {}, p: {}, t: {}, dirStack: [], anyTap: false,
  set(k, v) {
    if (v && !this.raw[k]) { this.tap[k] = true; this.anyTap = true; if (['up', 'down', 'left', 'right'].includes(k)) { this.dirStack = this.dirStack.filter(d => d !== k); this.dirStack.push(k); } }
    if (!v && ['up', 'down', 'left', 'right'].includes(k)) this.dirStack = this.dirStack.filter(d => d !== k);
    this.raw[k] = v;
  },
  frame() { for (const k of this.keys) { this.p[k] = !!this.tap[k]; this.tap[k] = false; this.t[k] = this.raw[k] ? (this.t[k] || 0) + 1 : 0; } this.anyTapFrame = this.anyTap; this.anyTap = false; },
  pressed(k) { return !!this.p[k]; },
  held(k) { return !!this.raw[k]; },
  repeat(k) { const t = this.t[k] || 0; return this.p[k] || (t > 16 && (t - 16) % 5 === 0); },
  consume(...ks) { for (const k of ks) this.p[k] = false; },
  dir() { for (let i = this.dirStack.length - 1; i >= 0; i--) if (this.raw[this.dirStack[i]]) return this.dirStack[i]; return null; },
  clearAll() { for (const k of this.keys) { this.raw[k] = false; this.tap[k] = false; this.p[k] = false; } this.dirStack = []; }
};

/* ---------------- Coroutines ---------------- */
function* wait(n) { for (let i = 0; i < n; i++) yield; }
function* waitUntil(fn) { while (!fn()) yield; }
function* parallel(...gens) { let list = gens.filter(Boolean); while (list.length) { list = list.filter(g => !g.next().done); if (list.length) yield; } }
function* waitA() { while (!(Input.pressed('a') || Input.pressed('b'))) yield; Input.consume('a', 'b'); }
function* tween(frames, fn) { for (let i = 1; i <= frames; i++) { fn(i / frames); if (i < frames) yield; } }

/* ---------------- Game state shell ---------------- */
const Game = {
  scene: null, sys: [], ui: [], fade: 0, fadeColor: '#000', flash: 0, flashColor: '#fff', frame: 0, shake: 0,
  settings: { text: 1, music: true, sfx: true },
  st: null, // player/save state
  setScene(s) { this.scene = s; if (s.enter) s.enter(); },
};
function* fadeOut(n = 16, color = '#000') { Game.fadeColor = color; yield* tween(n, t => Game.fade = t); Game.fade = 1; }
function* fadeIn(n = 16) { yield* tween(n, t => Game.fade = 1 - t); Game.fade = 0; }
function* flashScreen(n = 8, color = '#fff') { Game.flashColor = color; yield* tween(n, t => Game.flash = 1 - t); Game.flash = 0; }
