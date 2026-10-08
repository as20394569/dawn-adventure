/* ===================== v12.0.2 戰鬥速度 ×2（玩家：先做方案 1 不碰數值的部分；自動戰鬥不要） =====================
   開關在戰鬥畫面右上角的「×2」，設定裡也有「戰鬥速度」（普通／×2），切換後一直維持。鍵盤：Select。
   開場和每一回合的動畫跑兩倍速；選指令、選技能、道具等需要玩家操作的畫面維持原速，多跑的那一格不會吃到按鍵。 */
const bFast12 = () => Game.settings.bspd === 2;
function bSpdToggle12() { Game.settings.bspd = bFast12() ? 1 : 2; Sound.sfx('cursor'); if (typeof saveSettings === 'function') saveSettings(); }
{ const _p = Battle.prototype.play, _i = Battle.prototype.intro;
  Battle.prototype.play = function* (...a) { this.fast12 = true; try { return yield* _p.apply(this, a); } finally { this.fast12 = false; } };
  Battle.prototype.intro = function* (...a) { this.fast12 = true; try { return yield* _i.apply(this, a); } finally { this.fast12 = false; } }; }
// the button only works where the battle itself is on top (not under the bag or another full screen)
const bTopOK12 = () => { const t = UI.stack[UI.stack.length - 1]; return !t || t instanceof TextBox || (t instanceof Menu && t.cols === 5 && !!t.buttons); };
{ const _t = tick; tick = function () { _t(); const S = Game.scene; if (!(S instanceof Battle)) return;
    if (Input.pressed('select') && bTopOK12()) { Input.consume('select'); bSpdToggle12(); }
    if (bFast12() && S.fast12 && S.script && !UI.stack.some(w => w instanceof Menu)) { for (const k of Input.keys) Input.p[k] = false; S.update(); } }; }
Battle.prototype.drawSpd12 = function (x) {
  if (this.boxF < -20 || !bTopOK12()) return; const on = bFast12(), X = W - 17, Y = this.k14 ? 2 : 22, w = 14, h = 9; /* v14.21: 14×9, 6 size */ // under the name plates (three plates fill the top row); v12.0.9h: smaller (player: 「戰鬥速度x2 按鈕縮小」)
  if (KD.pan) KD.pan(x, X, Y, w, h, on ? '#f0a030' : null); else { x.fillStyle = '#14121c'; x.fillRect(X, Y, w, h); } // v14.24: the battle screen's panel
  KD.tc(x, '×2', X + w / 2, Y + h / 2, on ? '#ffe8b0' : UIC.muted, UIC.textSh, 5);
  touchRegion(X - 5, Y - 4, w + 8, h + 8, bSpdToggle12); // the tap area stays a little bigger than the button
};
{ const _bf = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _bf.call(this, x); this.drawSpd12(x); }; }
if (typeof BATTLE_HELP !== 'undefined') { const i = BATTLE_HELP.findIndex(q => q[0] === '技能與冷卻');
  BATTLE_HELP.splice(i < 0 ? BATTLE_HELP.length : i + 1, 0, ['戰鬥速度', ['點戰鬥畫面右上角的「×2」，戰鬥動畫會加快一倍；再點一次恢復普通。', '選指令、選技能時不受影響。設定裡的「戰鬥速度」也可以切換，鍵盤是 Select 鍵。']]); }
