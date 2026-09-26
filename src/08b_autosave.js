/* ===================== AUTOSAVE: on map change, after battles, every 100 steps, and when the page is hidden/closed ===================== */
Game.settings.autosave = true; // default (loadSettings() at boot keeps the player's choice)
Game.autoDirty = false; Game.autoSaveT = 0;
const AUTO_STEPS = 100;
function canAutoSave() {
  const ow = Game.scene, st = Game.st;
  return !!(Game.settings.autosave && st && st.flags && st.flags.license && st.cls && ow instanceof Overworld && Game.ow === ow && !ow.script && !UI.stack.length && !Game.sys.length && !Game.fade);
}
function autoSave(show = true) { if (!canAutoSave()) return false; const ok = saveGame(); if (ok) { Game.autoDirty = false; Game.st.lastAutoSteps = Game.st.steps || 0; if (show) Game.autoSaveT = 80; } return ok; }
{ const _load = Overworld.prototype.load; Overworld.prototype.load = function (...a) { const r = _load.apply(this, a); Game.autoDirty = true; return r; }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () {
  _up.call(this); const st = Game.st;
  if (st && (st.steps || 0) - (st.lastAutoSteps || 0) >= AUTO_STEPS) Game.autoDirty = true;
  if (Game.autoDirty && this.t % 10 === 0) autoSave();
}; }
// leaving the page: save the last safe state (not in the middle of a battle or event)
const pageLeaveSave = () => { if (canAutoSave()) saveGame(); };
window.addEventListener('pagehide', pageLeaveSave);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pageLeaveSave(); });
// small indicator in the corner
{ const _dt = drawToast; drawToast = function (x) { _dt(x); if (Game.autoSaveT > 0 && UI.stack.length) Game.autoSaveT = 0; if (Game.autoSaveT > 0) { Game.autoSaveT--; const a = Math.min(1, Game.autoSaveT / 20); x.globalAlpha = a; drawWin(x, W - 66, 4, 62, 16, 'menu'); x.fillStyle = UIC.accent; x.fillRect(W - 60, 9, 5, 6); x.fillStyle = '#0e1120'; x.fillRect(W - 59, 10, 3, 2); Font.draw(x, '自動存檔', W - 52, 5, UIC.text, UIC.textSh, 10); x.globalAlpha = 1; } }; }
