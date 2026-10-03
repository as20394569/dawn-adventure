/* ===================== v10 階段四：畫面放大 =====================
   Plan item 3 (畫面放大): the field is drawn 1.5× around the hero (設定→畫面 標準／放大, default 放大).
   Only the world layer is zoomed — the map-name popup, the area-event panel, the weather, the quest HUD and every
   window stay at normal size. The backing canvas scale is kept even so 1.5× still lands on whole pixels. */
const ZOOM_F = 1.5;
const zoomOn = () => Game.settings.zoom !== false;
{ const _ss = setScale; setScale = function (S) { if (zoomOn() && !Game.fixedScale) S = Math.min(6, Math.ceil((S | 0) / 2) * 2); return _ss(S); }; }
function owZoomAt(ow) { // the hero's spot on the unzoomed screen (same camera as Overworld.draw)
  const p = ow.p, m = ow.map; let camX = Math.round(p.px) - CAM_X, camY = Math.round(p.py) - CAM_Y + Math.round(ow.camDY || 0);
  if (!m.d.outdoor && m.w * 16 <= W) camX = Math.round((m.w * 16 - W) / 2); if (!m.d.outdoor && m.h * 16 <= H - TB_H) camY = Math.round((m.h * 16 - (H - TB_H)) / 2) - 8;
  return [Math.round(p.px - camX + 8), Math.round(p.py - camY + 8)];
}
function applyZoom(x, ow) { const [cx, cy] = ow._zc; x.translate(cx, cy); x.scale(ZOOM_F, ZOOM_F); x.translate(-cx, -cy); }
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    if (!this.p || !this.map) { this._zc = null; return _dr.call(this, x); }
    const z = zoomOn(); this._zc = z ? owZoomAt(this) : null; const pop = this.popup; this.popup = null;
    x.save(); if (z) applyZoom(x, this); try { _dr.call(this, x); } finally { x.restore(); this.popup = pop; }
    if (typeof owWorldPost === 'function') owWorldPost(this, x); // v12.0.7: the day / night layer, over the world and under every HUD
    if (pop) { const t = pop.t; const px = t < 12 ? -90 + t * 7.8 : t > 150 ? 4 - (t - 150) * 3 : 4; const w = Font.width(pop.name) + 22; const X = Math.round(px); drawPanel(x, X, 4, w, 20, null); x.fillStyle = UIC.accent; x.fillRect(X + 5, 9, 2, 10); Font.draw(x, pop.name, X + 11, 5, UIC.text, UIC.textSh); }
  }; }
