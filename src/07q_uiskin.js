/* ===================== v20 battle UI skin (Codex task G: art/ui/battle) =====================
   9-slice windows / nameplates / HUD / buttons, 3-slice gauges and command icons. Only used in battle, only when the images
   are loaded; otherwise every helper returns false and the original flat UI is drawn. */
const UISKIN = {};
for (const k in (typeof UI_SKIN_SRC !== 'undefined' ? UI_SKIN_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = UI_SKIN_SRC[k]; UISKIN[k] = im; }
const skinOk = k => !!(UISKIN[k] && UISKIN[k].ok);
const inBattle = () => !!(Game.scene && Game.scene.constructor === Battle);
const uiSkinOn = () => inBattle() && skinOk('win');
function plateExtra() { return uiSkinOn() && skinOk('plate') ? 5 : 0; }
function skin9(x, k, X, Y, w, h, c) {
  const im = UISKIN[k], iw = im.width, ih = im.height; X = Math.round(X); Y = Math.round(Y); w = Math.round(w); h = Math.round(h);
  const cx = Math.min(c, Math.floor(w / 2)), cy = Math.min(c, Math.floor(h / 2)), mw = w - cx * 2, mh = h - cy * 2, sw = iw - c * 2, sh = ih - c * 2;
  const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = false;
  x.drawImage(im, 0, 0, cx, cy, X, Y, cx, cy); x.drawImage(im, iw - cx, 0, cx, cy, X + w - cx, Y, cx, cy);
  x.drawImage(im, 0, ih - cy, cx, cy, X, Y + h - cy, cx, cy); x.drawImage(im, iw - cx, ih - cy, cx, cy, X + w - cx, Y + h - cy, cx, cy);
  if (mw > 0) { x.drawImage(im, c, 0, sw, cy, X + cx, Y, mw, cy); x.drawImage(im, c, ih - cy, sw, cy, X + cx, Y + h - cy, mw, cy); }
  if (mh > 0) { x.drawImage(im, 0, c, cx, sh, X, Y + cy, cx, mh); x.drawImage(im, iw - cx, c, cx, sh, X + w - cx, Y + cy, cx, mh); }
  if (mw > 0 && mh > 0) x.drawImage(im, c, c, sw, sh, X + cx, Y + cy, mw, mh);
  x.imageSmoothingEnabled = sm;
}
// fill rect of the old flat gauge = (X, Y, w, 3); the skinned gauge frames it (3px caps, 7px tall) and tiles the fill
function uiBar(x, X, Y, w, r, kind) {
  if (!uiSkinOn() || !skinOk('bar_frame') || !skinOk('bar_' + kind)) return false;
  const F = UISKIN.bar_frame, T = UISKIN['bar_' + kind], sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = false; X = Math.round(X); Y = Math.round(Y);
  x.drawImage(F, 0, 0, 3, 7, X - 3, Y - 2, 3, 7); x.drawImage(F, 3, 0, 6, 7, X, Y - 2, w, 7); x.drawImage(F, 9, 0, 3, 7, X + w, Y - 2, 3, 7);
  const fw = Math.round(w * clamp(r, 0, 1)); for (let i = 0; i < fw; i += 4) x.drawImage(T, 0, 0, Math.min(4, fw - i), 5, X + i, Y - 1, Math.min(4, fw - i), 5);
  x.imageSmoothingEnabled = sm; return true;
}
function uiPlate(x, X, Y, w, h, F) { const k = F.boss ? 'plate_boss' : F.elite || F.rare ? 'plate_elite' : 'plate'; if (!uiSkinOn() || !skinOk(k)) return false; skin9(x, k, X, Y, w, h, 6); return true; }
function uiHud(x, X, Y, w, h) { if (!uiSkinOn() || !skinOk('hud')) return false; skin9(x, 'hud', X, Y, w, h, 6); return true; }
function uiCmdIcon(x, i, X, Y) { if (!uiSkinOn() || !skinOk('icon_cmd')) return false; const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = false; x.drawImage(UISKIN.icon_cmd, i * 16, 0, 16, 16, Math.round(X), Math.round(Y), 16, 16); x.imageSmoothingEnabled = sm; return true; }
{ const _dw = drawWin; drawWin = function (x, X, Y, w, h, style) { if (inBattle() && style !== 'sign' && skinOk('win')) { skin9(x, 'win', X, Y, w, h, 8); return; } return _dw(x, X, Y, w, h, style); }; }
{ const _db = drawBtn; drawBtn = function (x, X, Y, w, h, on, strip) { if (!uiSkinOn() || !skinOk('btn')) return _db(x, X, Y, w, h, on, strip); skin9(x, on ? 'btn_on' : 'btn', X, Y, w, h, 5); if (strip) { x.fillStyle = strip; x.fillRect(X + 3, Y + 4, 2, h - 8); } }; }
{ const _sb = drawShieldBadge; drawShieldBadge = function (x, X, Y, n, broken, flash) {
    if (!uiSkinOn() || !skinOk('badge_shield')) return _sb(x, X, Y, n, broken, flash);
    const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = false; x.drawImage(UISKIN.badge_shield, Math.round(X), Math.round(Y)); x.imageSmoothingEnabled = sm;
    if (flash) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(X + 2, Y + 2, 8, 9); }
    Font.drawC(x, broken ? '×' : String(n), X + 6, Y - 1, broken ? '#ffd0d0' : '#ffffff', '#000000', 9);
  };
}
