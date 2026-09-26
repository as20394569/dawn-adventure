/* ===================== TOUCH: tap menus / text directly on the screen; the controller is hidden during battles ===================== */
let TouchR = []; // hit regions registered while drawing (later = on top)
const tapKey = k => { Input.set(k, true); Input.set(k, false); };
function touchRegion(x, y, w, h, fn) { TouchR.push({ x, y, w, h, fn }); }
// menus: every visible item is tappable (tap = select + confirm); arrows scroll
{ const _md = Menu.prototype.draw; Menu.prototype.draw = function (x) {
  _md.call(this, x); const n = this.items.length, m = this;
  for (let k = 0; k < n; k++) { const r = Math.floor(k / this.cols) - this.scrollTop, c = k % this.cols; if (r < 0 || r >= this.scrollMax) continue;
    const X = this.buttons ? this.x + this.ox + c * this.colW : (this.cols === 1 ? this.x + 2 : this.x + this.ox + c * this.colW - 7), Y = this.y + this.oy + r * this.rowH - (this.buttons ? 0 : Math.max(0, Math.floor((this.rowH - 16) / 2)));
    const Wd = this.buttons ? this.colW - 3 : (this.cols === 1 ? this.w - 4 : this.colW - 4);
    touchRegion(X, Y, Wd, this.rowH, () => { if (m.i !== k) { m.i = k; if (m.onMove) m.onMove(k); } tapKey('a'); }); }
  const rows = Math.ceil(n / this.cols);
  if (this.scrollTop > 0) touchRegion(this.x, this.y - 4, this.w, 12, () => { m.i = Math.max(0, m.i - this.cols * this.scrollMax); m.scrollTop = Math.max(0, m.scrollTop - m.scrollMax); if (m.onMove) m.onMove(m.i); });
  if (this.scrollTop + this.scrollMax < rows) touchRegion(this.x, this.y + this.h - 8, this.w, 12, () => { m.i = Math.min(n - 1, m.i + this.cols * this.scrollMax); if (m.onMove) m.onMove(m.i); });
}; }
function touchTap(gx, gy) {
  for (let i = TouchR.length - 1; i >= 0; i--) { const r = TouchR[i]; if (gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h) { r.fn(); return; } }
  const top = UI.stack[UI.stack.length - 1];
  if (top instanceof Menu) { if (top.cancel) tapKey('b'); return; }       // tapping outside a menu = back
  if (top && top.touchBack) { tapKey('b'); return; }                       // custom screens that opt in
  if (top instanceof TextBox || Game.scene instanceof Battle || (Game.scene && Game.scene.constructor && Game.scene.constructor.name !== 'Overworld')) tapKey('a'); // advance text / title / cutscenes
  else if (top) tapKey('a');
}
{ const cvs = document.getElementById('screen');
  cvs.addEventListener('pointerdown', e => { const r = cvs.getBoundingClientRect(); if (!r.width) return; e.preventDefault(); Sound.init && Sound.init(); touchTap((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H); }); }
// regions are rebuilt every frame
{ const _r = render; render = function () { TouchR = []; _r(); syncPadVisibility(); }; }
// hide the controller while fighting (the screen grows into the freed space)
function syncPadVisibility() {
  const inB = Game.scene instanceof Battle, on = document.body.classList.contains('battle');
  if (inB !== on) { document.body.classList.toggle('battle', inB); requestAnimationFrame(() => { fitScreen(); setTimeout(fitScreen, 60); }); }
}
