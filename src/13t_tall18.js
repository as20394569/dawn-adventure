/* ===================== v12.128 戰鬥畫面拉長 =====================
   玩家 2026-10-11：「現在戰鬥畫面可以拉長了」→ 選了「請把戰鬥畫面變長」：戰鬥時畫面往下延伸到原本手把的位置，寬度不變、只變長（直拿手機時）。
   做法：畫面多出 TALL_EXT 列；整個戰鬥照原本的位置往下移，多出來的列在最上面。
   背景整張配合拉長後的高度畫（v12.130）；
   左上的回合數・行動順序、右上的 ×2 和天氣圖示畫到真正的最上面（按的位置跟著移）。 */
const TALL18 = { hud: [] };
{ const B = Battle.prototype;
  // 最上面那一排：拉長時先記下來，整格畫完、補好上面那段之後再畫
  const later = f => function (x, ...a) { if (!(TALL_EXT > 0) || TALL18.now) return f.call(this, x, ...a); const self = this; TALL18.hud.push(() => f.call(self, x, ...a)); };
  if (typeof KB12 !== 'undefined' && KB12.topRow) KB12.topRow = later(KB12.topRow);
  if (B.drawSpd12) B.drawSpd12 = later(B.drawSpd12);
  if (typeof wxIcon === 'function') { const _wi = wxIcon; wxIcon = function (x, k, X, Y) { if (TALL_EXT > 0 && !TALL18.now && Game.scene instanceof Battle && Y <= 4) { TALL18.hud.push(() => _wi(x, k, X, Y)); return; } return _wi(x, k, X, Y); }; }
  const _r = render; render = function () { TALL18.hud = []; _r(); const E = TALL_EXT; if (!(E > 0) || !(Game.scene instanceof Battle) || Game.fade > 0.5 || !TALL18.hud.length) return;
    ctx.save(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.imageSmoothingEnabled = false; const _tr = touchRegion; touchRegion = (X, Y, w, h, fn) => _tr(X, Y - E, w, h, fn); TALL18.now = 1;
    try { for (const f of TALL18.hud) f(); } finally { TALL18.now = 0; touchRegion = _tr; ctx.restore(); } }; }
/* v12.130 玩家「戰鬥畫面拉長後上方變得很奇怪」「背景圖片可以根據拉長後的戰鬥畫面調整」：
   不再把最上緣兩列往上拉（會變成一條條直線），改成背景整張配合拉長後的高度畫（見 07a_bscene 的舞台）；
   戰鬥裡蓋滿整個畫面的東西（壓暗・閃光・夜晚・色調）和天氣的範圍也跟著往上延伸。 */
{ const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) { const E = TALL_EXT; if (!(E > 0)) return _dr.call(this, x);
    const fr = x.fillRect, rc = x.rect; x.fillRect = function (a, b, c, d) { return a === 0 && b === 0 && c === W && (d === BH || d === H) ? fr.call(this, 0, -E, W, d + E) : fr.call(this, a, b, c, d); };
    x.rect = function (a, b, c, d) { return a === 0 && b === 0 && c === W && d === BH ? rc.call(this, 0, -E, W, BH + E) : rc.call(this, a, b, c, d); };
    try { return _dr.call(this, x); } finally { delete x.fillRect; delete x.rect; } };
  if (typeof wxOverlay === 'function') { const _wo = wxOverlay; wxOverlay = function (x, k, t, w, h) { if (TALL_EXT > 0 && Game.scene instanceof Battle && h === BH) { x.save(); x.translate(0, -TALL_EXT); try { return _wo(x, k, t, w, h + TALL_EXT); } finally { x.restore(); } } return _wo(x, k, t, w, h); }; } }

/* ---------- v12.128 魔物名牌在出招時變淡（玩家：「魔物框位置會導致特效看不清楚」） ----------
   名牌（名字・HP・弱點）畫在魔物腳下、特效的上面，擋住打在魔物身上和往主角飛的光效。
   特效播放的時候（再多留一下）名牌淡到 25%，播完慢慢回來；HP 條扣血時已經回到看得清楚。 */
{ const B = Battle.prototype, _pf = B.playFx; B.playFx = function* (...a) { this.fx18 = (this.fx18 || 0) + 1; try { return yield* _pf.apply(this, a); } finally { this.fx18--; this.fxHold18 = 12; } };
  if (typeof KB12 !== 'undefined' && KB12.plates) { const _pl = KB12.plates; KB12.plates = function (x, a0) {
      if (this.fxHold18 > 0 && !(this.fx18 > 0)) this.fxHold18--; const want = this.fx18 > 0 || this.fxHold18 > 0 ? 0.25 : 1, cur = this.pl18 ?? 1;
      this.pl18 = cur + (want - cur) * (want < cur ? 0.35 : 0.18); return _pl.call(this, x, a0 * this.pl18); }; } }
