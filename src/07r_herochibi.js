/* ===================== v20 battle hero chibi with a layered paper doll (Codex task H: art/hero/px) =====================
   Layers are drawn in key colours; each equipped item's palette (HEAD_PAL / BODY_LOOKS / FEET_PAL / WPN_PAL) recolours them.
   Order: base → feet → body → head → deco → weapon. Poses: idle1/2 · attack1/2 · cast1 · hurt1 · guard1. Shown at 2x.
   Settings → 主角造型: Q版 / 原版 (the 16px field doll). Inactive until the layer images are embedded. */
const HERO_PX = {};
for (const k in (typeof HERO_PX_SRC !== 'undefined' ? HERO_PX_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = HERO_PX_SRC[k]; HERO_PX[k] = im; }
const heroChibiReady = () => Game.settings.chibiHero !== false && typeof HERO_PX_META !== 'undefined' && HERO_PX_META && HERO_PX.base && HERO_PX.base.ok;
const HERO_KEYS = {
  head: [['#ff0000', 'A'], ['#800000', 'a'], ['#ff8080', 'C']], deco: [['#ffff00', 'E'], ['#ff8080', 'C']],
  body: [['#00ff00', 'X'], ['#008000', 'x'], ['#80ff80', 'Y'], ['#40a040', 'y'], ['#ffff00', 'Z'], ['#808000', 'z'], ['#ffffff', 'W'], ['#00ffff', 'D'], ['#008080', 'd']],
  feet: [['#0000ff', 'B'], ['#000080', 'b']], weapon: [['#ff00ff', 'I'], ['#800080', 'i'], ['#ff8000', 'T'], ['#804000', 'U'], ['#00ffff', 'V']],
};
function heroPalFill(group, P) { // derive missing shades from the ones the palette has
  const p = { ...P }, sh = (c, a) => shade(c, a);
  if (group === 'head') { p.A = p.A || '#8a8a9a'; p.a = p.a || sh(p.A, -0.3); p.C = p.C || sh(p.A, 0.35); }
  if (group === 'deco') { p.E = p.E || p.C || '#f0d060'; p.C = p.C || '#f0f0f0'; }
  if (group === 'body') { p.X = p.X || HERO_PAL.N; p.x = p.x || sh(p.X, -0.25); p.Y = p.Y || sh(p.X, 0.2); p.y = p.y || sh(p.Y, -0.25); p.Z = p.Z || sh(p.X, -0.4); p.z = p.z || '#e8c048'; p.W = p.W || '#f0f0ec'; p.D = p.D || p.X; p.d = p.d || sh(p.D, -0.25); }
  if (group === 'feet') { p.B = p.B || HERO_PAL.B; p.b = p.b || sh(p.B, -0.3); }
  if (group === 'weapon') { p.I = p.I || '#e8eef8'; p.i = p.i || sh(p.I, -0.3); p.T = p.T || '#7a4c28'; p.U = p.U || sh(p.T, 0.2); p.V = p.V || '#a0e0ff'; }
  return p;
}
const HERO_LAYER_CACHE = {};
function heroLayer(name, group, P, pk) { // recoloured layer strip (cached per palette)
  const key = name + '|' + pk; if (HERO_LAYER_CACHE[key]) return HERO_LAYER_CACHE[key]; const src = HERO_PX[name]; if (!src || !src.ok) return null;
  const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); if (!P) return HERO_LAYER_CACHE[key] = c;
  const keys = HERO_KEYS[group].map(([h, l]) => [hex2rgb(h), l]), fill = heroPalFill(group, P), out = {}; for (const [, l] of keys) out[l] = hex2rgb(fill[l]);
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) { if (!a[i + 3]) continue; let best = null, bd = 3 * 48 * 48; for (const [k, l] of keys) { const e = (a[i] - k[0]) ** 2 + (a[i + 1] - k[1]) ** 2 + (a[i + 2] - k[2]) ** 2; if (e < bd) { bd = e; best = l; } } if (best) { const o = out[best]; a[i] = o[0]; a[i + 1] = o[1]; a[i + 2] = o[2]; } }
  x.putImageData(d, 0, 0); return HERO_LAYER_CACHE[key] = c;
}
const HERO_CHIBI_CACHE = {};
function heroChibiImg(pose, L) {
  const M = HERO_PX_META, key = pose + lookKey(L); if (HERO_CHIBI_CACHE[key]) return HERO_CHIBI_CACHE[key];
  const w = M.w, h = M.h, pi = Math.max(0, M.poses.indexOf(pose)), n = mkCanvas(w, h), x = n.getContext('2d');
  const put = (name, group, P, pk) => { const im = heroLayer(name, group, P, pk); if (im) x.drawImage(im, pi * w, 0, w, h, 0, 0, w, h); };
  put('base', 'base', null, '');
  if (HERO_PX.boots) put('boots', 'feet', FEET_PAL[L.feet] || {}, L.feet || '');
  const BL = BODY_LOOKS[L.body]; if (BL && HERO_PX[BL[0]]) put(BL[0], 'body', BL[1], L.body); else if (HERO_PX.tunic) put('tunic', 'body', {}, 'default');
  const Hd = L.head; if (Hd && HERO_PX[Hd[0]]) { put(Hd[0], 'head', HEAD_PAL[Hd[1]] || {}, Hd[1]); if (Hd[2] && HERO_PX[Hd[2]]) put(Hd[2], 'deco', HEAD_PAL[Hd[1]] || {}, Hd[1]); }
  const Wp = L.weapon; if (Wp && HERO_PX[Wp[0]]) put(Wp[0], 'weapon', WPN_PAL[Wp[1]] || {}, Wp[1]);
  const big = mkCanvas(w * 2, h * 2), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(n, 0, 0, w * 2, h * 2);
  return HERO_CHIBI_CACHE[key] = big;
}
{ const _ds = dollSpec; dollSpec = function () {
    if (!heroChibiReady()) return _ds(); const w = HERO_PX_META.w * 2, h = HERO_PX_META.h * 2;
    return { doll: true, chibi: true, w, h, cw: w, ch: h + 2, bb: { cx: Math.round(w * 0.5), top: 0, bot: h, w, h } };
  };
  const _dr = dollRender; dollRender = function (b, A, S, T, tint) {
    if (!S.chibi) return _dr(b, A, S, T, tint);
    if (!A.pcv || A.pcv.width !== S.cw) { A.pcv = mkCanvas(S.cw, S.ch); A.pcvT = mkCanvas(S.cw, S.ch); }
    const cv = tint ? A.pcvT : A.pcv, x = cv.getContext('2d'), [st, p] = hdPhase(A, T);
    const pose = st === 'attack' ? (p < 0.45 ? 'attack1' : 'attack2') : st === 'cast' ? 'cast1' : st === 'hurt' ? 'hurt1' : (st === 'defend' || (b.H && b.H.defending)) ? 'guard1' : (Math.floor((T + A.phase) / 18) % 2 ? 'idle2' : 'idle1');
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = false;
    x.drawImage(heroChibiImg(pose, b.hd.look || heroLookOf(Game.st)), 0, 0);
    if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
    cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
  };
}
