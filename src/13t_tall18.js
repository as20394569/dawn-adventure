/* ===================== v12.128 戰鬥畫面拉長 =====================
   玩家 2026-10-11：「現在戰鬥畫面可以拉長了」→ 選了「請把戰鬥畫面變長」：戰鬥時畫面往下延伸到原本手把的位置，寬度不變、只變長（直拿手機時）。
   做法：畫面多出 TALL_EXT 列；整個戰鬥照原本的位置往下移，多出來的列在最上面。
   上面那一段在每一格畫完之後，用戰鬥畫面最上緣的顏色往上延伸（天空・樹冠接得起來，壓暗・閃光・淡出也一起跟著），越上面越暗；
   左上的回合數・行動順序、右上的 ×2 和天氣圖示畫到真正的最上面（按的位置跟著移）。 */
const TALL18 = { hud: [] };
{ const B = Battle.prototype;
  // 最上面那一排：拉長時先記下來，整格畫完、補好上面那段之後再畫
  const later = f => function (x, ...a) { if (!(TALL_EXT > 0) || TALL18.now) return f.call(this, x, ...a); const self = this; TALL18.hud.push(() => f.call(self, x, ...a)); };
  if (typeof KB12 !== 'undefined' && KB12.topRow) KB12.topRow = later(KB12.topRow);
  if (B.drawSpd12) B.drawSpd12 = later(B.drawSpd12);
  if (typeof wxIcon === 'function') { const _wi = wxIcon; wxIcon = function (x, k, X, Y) { if (TALL_EXT > 0 && !TALL18.now && Game.scene instanceof Battle && Y <= 4) { TALL18.hud.push(() => _wi(x, k, X, Y)); return; } return _wi(x, k, X, Y); }; }
  const _r = render; render = function () { TALL18.hud = []; _r(); const E = TALL_EXT; if (!(E > 0) || !(Game.scene instanceof Battle)) return; const S = SCALE;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(cv, 0, E * S, cv.width, 2 * S, 0, 0, cv.width, E * S); // 最上緣兩列往上拉
    ctx.setTransform(S, 0, 0, S, 0, 0); const g = ctx.createLinearGradient(0, 0, 0, E); g.addColorStop(0, 'rgba(5,6,14,0.55)'); g.addColorStop(0.75, 'rgba(5,6,14,0.12)'); g.addColorStop(1, 'rgba(5,6,14,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, E);
    if (!(Game.fade > 0.5) && TALL18.hud.length) { const _tr = touchRegion; touchRegion = (X, Y, w, h, fn) => _tr(X, Y - E, w, h, fn); TALL18.now = 1; ctx.imageSmoothingEnabled = false;
      try { for (const f of TALL18.hud) f(); } finally { TALL18.now = 0; touchRegion = _tr; } }
    ctx.restore(); }; }

/* ---------- v12.128 魔物名牌在出招時變淡（玩家：「魔物框位置會導致特效看不清楚」） ----------
   名牌（名字・HP・弱點）畫在魔物腳下、特效的上面，擋住打在魔物身上和往主角飛的光效。
   特效播放的時候（再多留一下）名牌淡到 25%，播完慢慢回來；HP 條扣血時已經回到看得清楚。 */
{ const B = Battle.prototype, _pf = B.playFx; B.playFx = function* (...a) { this.fx18 = (this.fx18 || 0) + 1; try { return yield* _pf.apply(this, a); } finally { this.fx18--; this.fxHold18 = 12; } };
  if (typeof KB12 !== 'undefined' && KB12.plates) { const _pl = KB12.plates; KB12.plates = function (x, a0) {
      if (this.fxHold18 > 0 && !(this.fx18 > 0)) this.fxHold18--; const want = this.fx18 > 0 || this.fxHold18 > 0 ? 0.25 : 1, cur = this.pl18 ?? 1;
      this.pl18 = cur + (want - cur) * (want < cur ? 0.35 : 0.18); return _pl.call(this, x, a0 * this.pl18); }; } }
