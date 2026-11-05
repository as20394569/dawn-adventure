/* ===================== v12.155 戰鬥：斜角對峙（試做） =====================
   玩家 2026-11-05：「正式版戰鬥表示方式與圖形改動，想要在有限的畫面中改出有魄力的戰鬥，因此需要改變角度與佔位」
   → 選了：斜角對峙（主角斜背面在左下、魔物在右上，沿對角線排開，雙方放大）、出招時鏡頭推近跟拍、場景佔滿全畫面、
     另外加打擊感・大招特寫・出場演出・傷害數字。
   這一層先做站位：
   · 地面：地平線以下拉近 1.25 倍並往右上斜（消失點移到魔物那邊），一路鋪到畫面最下面；下方的狀態卡和指令列變半透明浮在場景上。
   · 主角：左下、放大 2 倍（斜背面的紙娃娃請 Codex 重畫之前，先用現在的背影）。
   · 魔物：右上；一隻 2 倍、兩隻 1.75 倍、三隻 1.5 倍，頭目・菁英再大一點（頭頂要留給下一步圖示）。
   · 鏡頭：cam26 = { z, x, y }，場景（背景・角色・特效）以 (x, y) 為中心放大 z 倍；名牌・狀態卡・按鈕不跟著動。 */
const DIAG26 = { on: true, heroCX: 44, heroS: 2, groundK: 1.25, shear: -0.2, vpX: 22,
  // 魔物的位置（腳底）：照隻數
  slots: { 1: [[122, 104]], 2: [[92, 118], [138, 98]], 3: [[60, 122], [102, 108], [142, 94]] },
  scale: { 1: 2, 2: 1.6, 3: 1.4 } };
function diag26() { return DIAG26.on && Game.scene instanceof Battle; }
// 放大一張角色圖（腳底和中心跟著放大；像素圖不糊）
function up26(im, s, holder, key) { if (!im || !(s > 1) || !holder) return im;
  const ds = im.ds || 1, K = Math.max(1, Math.min(4, SCALE | 0)), w = Math.ceil(im.width * ds * s * K), h = Math.ceil(im.height * ds * s * K);
  let c = holder[key]; if (!c || c.width !== w || c.height !== h) c = holder[key] = mkCanvas(w, h);
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.imageSmoothingEnabled = !im.px && !HD_PIXEL; x.drawImage(im, 0, 0, w, h);
  c.ds = 1 / K; c.px = im.px; if (im.bb) { const b = im.bb; c.bb = { ...b, cx: b.cx * s, top: b.top * s, bot: b.bot * s, w: b.w * s, h: b.h * s }; if (b.vw) c.bb.vw = b.vw * s; } return c; }

{ const B = Battle.prototype;
  /* ---------- 站位 ---------- */
  const _ly = B.layout; B.layout = function (snap) { _ly.call(this, snap); if (!DIAG26.on) return;
    this.heroX = DIAG26.heroCX - 28 - HD_HERO_OX;
    const L = this.foes(), n = Math.min(3, L.length); if (!n) return; const P = DIAG26.slots[n];
    // 大隻（頭目・菁英）站中間後面；其他照原本的順序從前面（左下）排到後面（右上）
    const rank = v => v.boss ? 0 : v.elite ? 1 : v.minion ? 3 : 2, big = n === 3 ? L.find(v => v.boss || v.elite) : null;
    let order = L.slice().sort((a, b) => rank(b) - rank(a)); if (big) { order = order.filter(v => v !== big); order.splice(1, 0, big); }
    if (n === 2 && (L[0].boss || L[0].elite || L[1].boss || L[1].elite)) order = L.slice().sort((a, b) => rank(b) - rank(a)); // 大隻的站後面
    order.forEach((v, k) => { const p = P[k] || P[P.length - 1]; v.tx = p[0]; v.foot = p[1]; v.foot0 = p[1]; if (snap) v.x = p[0]; }); };
  // 魔物放大（取代頭目・菁英的 2 倍；頭頂留給下一步圖示，太高的頭目會小一點）
  B.bigS22 = function (v, h0) { if (!v || v.hero || !(h0 > 0)) return 1; if (!DIAG26.on) return 1;
    const n = Math.min(3, this.foes().length) || 1, want = (DIAG26.scale[n] || 1.5) * (v.boss ? 1.3 : v.elite ? 1.15 : 1);
    const E = TALL_EXT || 0, minTop = (plateRow25() ? 6 : 15) - E + 13 + 6; return clamp(Math.floor(Math.min(want, (v.foot - minTop) / h0) * 4) / 4, 1, 3); };
  // 主角的中心（特效、跳字都以這裡為準）
  const _c = B.center; B.center = function (b) { if (DIAG26.on && b && b.hero && b.cx == null) return { x: this.heroX + HD_HERO_OX + 28, y: HERO_FOOT - Math.round(15 * DIAG26.heroS) }; return _c.call(this, b); };

  /* ---------- 地面拉近、往右上斜，鋪滿整個畫面 ---------- */
  const _ds = B.drawStage; B.drawStage = function (x) { if (!DIAG26.on) return _ds.call(this, x);
    this.cam26on = 0; const cam = this.cam26; if (cam && cam.z > 1.001) { x.save(); x.translate(cam.x, cam.y); x.scale(cam.z, cam.z); x.translate(-cam.x, -cam.y); this.cam26on = 1; }
    const stage = hd2dStageFor(this), hor = (typeof SKY21_HOR !== 'undefined' && SKY21_HOR[this.cfgBg]) || 64, K = DIAG26.groundK, k = DIAG26.shear, vp = DIAG26.vpX;
    // 地平線以上照原本畫（天空・遠山）
    x.save(); x.beginPath(); x.rect(-40, -(TALL_EXT || 0) - 40, W + 80, hor + (TALL_EXT || 0) + 40); x.clip(); _ds.call(this, x); x.restore();
    // 地平線以下：以 (W/2, 地平線) 為中心放大 K 倍，往右上斜（越下面越往左）、消失點往右移 vp
    x.save(); x.beginPath(); x.rect(-40, hor, W + 80, H - hor + 40); x.clip();
    x.translate(W / 2 + vp, hor); x.transform(1, 0, k, 1, 0, 0); x.scale(K, K); x.translate(-W / 2, -hor);
    const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = true; x.drawImage(stage, 0, 0, W, BH);
    // 舞台圖只畫到 BH：再往下用最下面一列延伸
    const sy = stage.height * (BH - 2) / BH; x.drawImage(stage, 0, sy, stage.width, stage.height - sy, 0, BH - 2, W, (H - BH) / K + 60);
    x.imageSmoothingEnabled = sm; x.restore(); };
  // 鏡頭：在名牌・狀態卡之前收回來
  const _ov = B.drawOverlay; B.drawOverlay = function (x) { if (this.cam26on) { this.cam26on = 0; x.restore(); } return _ov.call(this, x); };
  // 下方原本的深色底不要畫（場景鋪到最下面）
  const _dr = B.draw; B.draw = function (x) { if (!DIAG26.on) return _dr.call(this, x);
    this.heroX = DIAG26.heroCX - 28 - HD_HERO_OX;
    const fr = x.fillRect; x.fillRect = function (a, b, c, d) { if (a === 0 && b === BH && c === W && (d === H - BH || d === 1)) return; return fr.call(this, a, b, c, d); };
    try { return _dr.call(this, x); } finally { delete x.fillRect; } }; }

/* ---------- 主角放大 ---------- */
{ const _dr = dollRender; dollRender = function (b, A, S, T, tint) { const im = _dr(b, A, S, T, tint); if (!DIAG26.on || !(b instanceof Battle) || !b.H) return im; return up26(im, DIAG26.heroS, b.H, tint ? 'up26T' : 'up26'); }; }

/* ---------- 下方的框變半透明（看得到後面的場景） ---------- */
if (typeof KB12 !== 'undefined') { const _pn = KB12.panel; KB12.panel = function (x, X, Y, w, h, o = {}) { if (!diag26() || Y < 180) return _pn(x, X, Y, w, h, o);
    x.save(); x.globalAlpha *= 0.8; try { return _pn(x, X, Y, w, h, o); } finally { x.restore(); } }; }
