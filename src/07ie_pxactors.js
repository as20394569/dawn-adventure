/* ===================== PIXEL-ART ACTORS (sprites drawn with Codex, see art/battle) =====================
   A species / the hero with an entry in BATTLE_PX_SRC is drawn from its pixel sprite at 1 sprite pixel = 1 screen pixel.
   Motion stays on the pixel grid (whole-pixel offsets only), so the art never smears:
   - idle: the upper body settles 1px (breathing)          - attack: wind back, then the lunge carries it forward
   - cast: the upper body rises 1px                        - hurt: knocked back 2px
   Everything else (lighting wash, flashes, blinking, sinking on defeat) comes from the HD-2D draw code. */
const BATTLE_PX = {};
for (const k in (typeof BATTLE_PX_SRC !== 'undefined' ? BATTLE_PX_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = BATTLE_PX_SRC[k]; BATTLE_PX[k] = im; }
// animated strips (art/battle/pxanim): frames side by side, BATTLE_PXA_META[k] = { w, h, frames: { idle: [..], attack: [..], hurt: [..], ... } }
const BATTLE_PXA = {};
for (const k in (typeof BATTLE_PXA_SRC !== 'undefined' ? BATTLE_PXA_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = BATTLE_PXA_SRC[k]; BATTLE_PXA[k] = im; }
const pxAnimOwn = k => BATTLE_PXA[k] && BATTLE_PXA[k].ok;
const pxOwn = k => pxAnimOwn(k) || (BATTLE_PX[k] && BATTLE_PX[k].ok);
// colour variants (e.g. 毒孢菇 = recoloured 嘟嘟菇): reuse the base sprite with the same hue / saturation / lightness shift
const pxBaseOf = k => (typeof HD_RIG_OF !== 'undefined' && HD_RIG_OF[k] && pxOwn(HD_RIG_OF[k]) && ART[k] && ART[HD_RIG_OF[k]]) ? HD_RIG_OF[k] : null;
const pxReady = k => pxOwn(k) || !!pxBaseOf(k);
const PX_VARIANT = {};
function pxVariant(k) {
  if (PX_VARIANT[k]) return PX_VARIANT[k];
  const b = pxBaseOf(k), src = pxAnimOwn(b) ? BATTLE_PXA[b] : BATTLE_PX[b], A = ART[b].parts, V = ART[k].parts, dh = [], rs = [], rl = [];
  const walk = (pa, pv) => { if (!pa || !pv) return; if (pa.c && pv.c && pa.c[0] === '#' && pv.c[0] === '#') { const [h1, s1, l1] = rgb2hsl(...hex2rgb(pa.c)), [h2, s2, l2] = rgb2hsl(...hex2rgb(pv.c)); dh.push(((h2 - h1 + 540) % 360) - 180); rs.push(s1 > 0.05 ? s2 / s1 : 1); rl.push(l1 > 0.05 ? l2 / l1 : 1); } if (pa.u && pv.u) pa.u.forEach((q, i) => walk(q, pv.u[i])); };
  A.forEach((q, i) => walk(q, V[i]));
  const med = a => { const t = a.slice().sort((x, y) => x - y); return t.length ? t[t.length >> 1] : 0; };
  const DH = med(dh), KS = med(rs) || 1, KL = med(rl) || 1;
  const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s2, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]); const [r, g, bb] = hex2rgb(hsl2hex(h + DH, s2 * KS, l * KL)); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
  x.putImageData(id, 0, 0); c.ok = true; return PX_VARIANT[k] = c;
}
const pxImage = k => pxAnimOwn(k) ? BATTLE_PXA[k] : pxOwn(k) ? BATTLE_PX[k] : pxVariant(k);
const pxMeta = k => { const b = pxOwn(k) ? k : pxBaseOf(k); return b && pxAnimOwn(b) ? BATTLE_PXA_META[b] : null; };
const PX_PAD = 6;
function pxSpec(key) {
  const im = pxImage(key), meta = pxMeta(key), w = meta ? meta.w : im.width, h = meta ? meta.h : im.height, cw = w + PX_PAD * 2, ch = h + PX_PAD + 1;
  if (meta) return { im, meta, w, h, cw, ch, bb: { cx: PX_PAD + Math.floor(w / 2), top: PX_PAD, bot: PX_PAD + h, w, h } };
  return { im, w, h, cw, ch, split: Math.round(h * 0.42), bb: { cx: PX_PAD + Math.floor(w / 2), top: PX_PAD, bot: PX_PAD + h, w, h } };
}
function pxOffsets(A, T) {
  const [st, p] = hdPhase(A, T); let dx = 0, dy = 0, top = 0;
  if (st === 'idle') top = Math.sin(TAU * p) > 0.2 ? 1 : 0;
  else if (st === 'attack') { const w = p < 0.3 ? 1 : 0, k = p >= 0.3 && p < 0.65 ? 1 : 0; dx = 2 * w - 2 * k; dy = -1 * w + 1 * k; top = w ? -1 : k ? 1 : 0; }
  else if (st === 'cast') top = -1;
  else if (st === 'hurt') { const h = p < 0.7 ? 1 : 0; dx = 2 * h; top = h ? -1 : 0; }
  else if (st === 'defend') { top = 1; }
  return { dx, dy, top };
}
// renders the sprite into the actor's own 1x canvas; `flip` mirrors (the hero sprite faces up-right already)
function pxRender(A, S, T, tint) {
  if (!A.pcv || A.pcv.width !== S.cw) { A.pcv = mkCanvas(S.cw, S.ch); A.pcvT = mkCanvas(S.cw, S.ch); }
  const cv = tint ? A.pcvT : A.pcv, x = cv.getContext('2d'), o = pxOffsets(A, T), X = PX_PAD + o.dx, Y = PX_PAD + o.dy;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = false;
  if (S.meta) { // hand-drawn frames: pick the frame for the current state, keep only a small knock-back offset
    const fr = S.meta.frames, [st, p] = hdPhase(A, T); let f = fr.idle[0], ox = 0, oy = 0;
    if (st === 'idle') f = fr.idle[Math.floor((T + A.phase) / 11) % fr.idle.length];
    else if (st === 'attack' && fr.attack) f = fr.attack[Math.min(fr.attack.length - 1, p < 0.3 ? 0 : p < 0.65 ? 1 : 2)];
    else if (st === 'hurt' && fr.hurt) { f = fr.hurt[0]; ox = p < 0.7 ? 2 : 0; }
    else if (st === 'cast') { if (fr.cast) f = fr.cast[0]; else oy = -1; }
    else if (st === 'defend' && fr.defend) f = fr.defend[0];
    else if (A.state === 'faint' && fr.hurt) f = fr.hurt[0];
    x.drawImage(S.im, f * S.w, 0, S.w, S.h, PX_PAD + ox, PX_PAD + oy, S.w, S.h);
    if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
    cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
  }
  // lower body fixed on the ground, upper body moves by whole pixels
  x.drawImage(S.im, 0, S.split, S.w, S.h - S.split, X, Y + S.split, S.w, S.h - S.split);
  x.drawImage(S.im, 0, 0, S.w, S.split + 1, X, Y + o.top, S.w, S.split + 1);
  if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
  cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
}
