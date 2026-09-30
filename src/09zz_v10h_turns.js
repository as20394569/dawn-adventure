/* ===================== v10.6.1 battle text: whose action it is (player: 「戰鬥回合中的文字顯示以及發生在雙方回合的事情務必不要混淆」) =====================
   - Every battle message is marked with the side it happens on: a coloured bar and tint on the message box, and the label
     「小晨的行動」 (blue) / 「〇〇的行動」 (red) / 「回合結束」 (grey) in its top-right corner when the first line leaves room.
     Reactions caused by an action (a monster getting angry when hit, thorns, counters) belong to that action.
   - Messages that had no subject now name who it is about (擊中要害, 回復, 吸取, 連擊, 荊棘, 追擊, 異常消除…).
   - A shield (護盾) put up after the other side already acted this turn no longer runs out at this turn's end before the
     other side could hit it: it lasts through the other side's next action. */
const PHASE_COL = { H: '#6ab8ff', F: '#ff7a8a', E: '#9aa0b8' };
function phaseLabel(b) { const p = b._phase; return p === 'H' ? Game.st.name + '的行動' : p === 'F' ? (b.F ? b.F.n : '對手') + '的行動' : p === 'E' ? '回合結束' : null; }
{ const _o = Battle.prototype.order; Battle.prototype.order = function (...a) {
    const L = _o.apply(this, a), self = this;
    return { [Symbol.iterator]: function* () { for (const e of L) { self._phase = e[0]; yield e; (self._acted || (self._acted = {}))[e[0]] = 1; } self._phase = null; } }; }; }
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    const prev = this._phase, side = u && u.hero ? 'H' : 'F', oppActed = !!(this._acted && this._acted[side === 'H' ? 'F' : 'H']); this._phase = side;
    // any shield (re)grant during this action counts, even when the value does not rise (e.g. 1 → max(1,1))
    let granted = 0; const d = u && Object.getOwnPropertyDescriptor(u, 'shield'), track = u && (!d || 'value' in d);
    if (track) { let v = u.shield || 0; Object.defineProperty(u, 'shield', { configurable: true, enumerable: true, get() { return v; }, set(n) { if (n > 0) granted = 1; v = n; } }); }
    try { return yield* _um.call(this, u, t, id); }
    finally {
      if (track) { const v = u.shield; Object.defineProperty(u, 'shield', { value: v, writable: true, configurable: true, enumerable: true }); }
      if (u && granted && oppActed && u.shield > 0) u._shieldHold = 1; (this._acted || (this._acted = {}))[side] = 1; this._phase = prev; } }; }
{ const _et = Battle.prototype.endTurn; Battle.prototype.endTurn = function* () {
    const prev = this._phase; this._phase = 'E'; for (const b of [this.H, this.F]) if (b && b._shieldHold && b.shield > 0) b.shield++;
    try { return yield* _et.call(this); } finally { for (const b of [this.H, this.F]) if (b) b._shieldHold = 0; this._acted = {}; this._phase = prev; } }; }
// every battle text box (msg() and the boxes some moves open directly) takes the phase that was active when it first showed
{ const _d = TextBox.prototype.draw; TextBox.prototype.draw = function (x) {
    _d.call(this, x); if (this.style !== 'battle') return; const b = Game.scene;
    if (this._ph === undefined) this._ph = (b instanceof Battle && b._phase) || null, this._lab = this._ph && phaseLabel(b);
    const col = PHASE_COL[this._ph], lab = this._lab; if (!col) return; const [r, g, bl] = hex2rgb(col);
    x.fillStyle = `rgba(${r},${g},${bl},0.10)`; x.fillRect(this.x + 3, this.y + 3, this.w - 6, this.h - 6); x.fillStyle = col; x.fillRect(this.x + 3, this.y + 3, 2, this.h - 6);
    const lw = Font.width(lab, 7), first = this.lines && this.lines[0] ? Font.width(this.lines[0], this.fs) : 0; if (this.pad + first + lw + 10 < this.w) Font.drawR(x, lab, this.x + this.w - 6, this.y + 2, col, UIC.textSh, 7); }; }
