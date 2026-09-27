/* ===================== PIXEL-ART ACTORS (sprites drawn with Codex, see art/battle) =====================
   A species / the hero with an entry in BATTLE_PX_SRC is drawn from its pixel sprite at 1 sprite pixel = 1 screen pixel.
   Motion stays on the pixel grid (whole-pixel offsets only), so the art never smears:
   - idle: the upper body settles 1px (breathing)          - attack: wind back, then the lunge carries it forward
   - cast: the upper body rises 1px                        - hurt: knocked back 2px
   Everything else (lighting wash, flashes, blinking, sinking on defeat) comes from the HD-2D draw code. */
const BATTLE_PX = {};
for (const k in (typeof BATTLE_PX_SRC !== 'undefined' ? BATTLE_PX_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = BATTLE_PX_SRC[k]; BATTLE_PX[k] = im; }
const pxReady = k => BATTLE_PX[k] && BATTLE_PX[k].ok;
const PX_PAD = 6;
function pxSpec(key) {
  const im = BATTLE_PX[key], w = im.width, h = im.height, cw = w + PX_PAD * 2, ch = h + PX_PAD + 1;
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
  // lower body fixed on the ground, upper body moves by whole pixels
  x.drawImage(S.im, 0, S.split, S.w, S.h - S.split, X, Y + S.split, S.w, S.h - S.split);
  x.drawImage(S.im, 0, 0, S.w, S.split + 1, X, Y + o.top, S.w, S.split + 1);
  if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
  cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
}
