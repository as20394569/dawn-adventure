/* ===================== v12.155 戰鬥：GBA 寶可夢式構圖＋復古掌機風 UI（試做） =====================
   玩家 2026-11-05：「用 gba 寶可夢那樣的戰鬥構圖好了 圖畢竟都畫了」「3 隻不要擠在一起 菁英跟 boss 大小統一」
   「底下圓盤建議跟背景圖統一 所以背景圖有些要重畫 還有 ui 要重新設計」→ 選了：Claude 程式重畫背景、底座跟地面同材質、復古掌機風 UI、先做第一章。
   · 站位：魔物在右上（兩隻・三隻分開站，各自一個底座），主角背影在左下（1.25 倍）；所有魔物（含菁英・頭目）都用原圖大小，不再特別放大。
   · 演出（之前玩家選的）：出手時鏡頭推近、打中停頓・魔物被打退・大數字、大招特寫、魔物跳進來落地揚塵、頭目黑影亮相＋名字。
   GBA26.on = false 就回到原本的畫面。背景・底座在 15b_gba26_bg，UI（科技風）在 15c_gba26_ui。 */
const GBA26 = { on: true, heroCX: 44, heroS: 1.25,
  // 魔物腳底（畫面拉長 ≥ 40 列時；沒拉長時整排往下移）
  slots: { 1: [[124, 70]], 2: [[92, 76], [146, 62]], 3: [[32, 84], [90, 64], [146, 84]] },
  cutMP: 18, camHero: 1.14, camFoe: 1.1,
};
function gba26() { return GBA26.on && Game.scene instanceof Battle; }
const ease26 = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
function up26(im, s, holder, key) { if (!im || !(s > 1) || !holder) return im;
  const ds = im.ds || 1, K = Math.max(1, Math.min(4, SCALE | 0)), w = Math.ceil(im.width * ds * s * K), h = Math.ceil(im.height * ds * s * K);
  let c = holder[key]; if (!c || c.width !== w || c.height !== h) c = holder[key] = mkCanvas(w, h);
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.imageSmoothingEnabled = !im.px && !HD_PIXEL; x.drawImage(im, 0, 0, w, h);
  c.ds = 1 / K; c.px = im.px; if (im.bb) { const b = im.bb; c.bb = { ...b, cx: b.cx * s, top: b.top * s, bot: b.bot * s, w: b.w * s, h: b.h * s }; if (b.vw) c.bb.vw = b.vw * s; } return c; }
/* ---------- 站位 ---------- */
{ const B = Battle.prototype;
  B.dropY26 = () => { const E = TALL_EXT || 0; return E >= 40 ? 0 : Math.round((40 - E) * 0.6); };
  const _ly = B.layout; B.layout = function (snap) { _ly.call(this, snap); if (!GBA26.on) return; this.heroX = GBA26.heroCX - 28 - HD_HERO_OX;
    const L = this.foes(), n = Math.min(3, L.length); if (!n) return; const P = GBA26.slots[n], dy = this.dropY26(), rank = v => v.boss ? 0 : v.elite ? 1 : v.minion ? 3 : 2;
    let order = L.slice().sort((a, b) => rank(b) - rank(a)); const big = L.find(v => v.boss) || L.find(v => v.elite);
    if (n === 3 && big) { order = order.filter(v => v !== big); order.splice(1, 0, big); } // 大隻站中間後面
    if (n === 2 && big) order = [order.find(v => v !== big), big];
    order.forEach((v, k) => { const p = P[k] || P[P.length - 1]; v.tx = p[0]; v.foot = p[1] + dy; v.foot0 = v.foot; if (snap) v.x = p[0]; }); };
  B.bigS22 = function (v, h0) { return GBA26.on ? 1 : 1; }; // 全部原圖大小
  const _c = B.center; B.center = function (b) { if (GBA26.on && b && b.hero && b.cx == null) return { x: this.heroX + HD_HERO_OX + 28, y: HERO_FOOT - Math.round(17 * GBA26.heroS) }; return _c.call(this, b); };
  // 畫面高度在戰鬥中改變（轉向）時重新排
  const _tf = B.tallFoes18; B.tallFoes18 = function () { if (!GBA26.on) return _tf && _tf.call(this); if (this.tallE26 === TALL_EXT) return; this.tallE26 = TALL_EXT; this.layout(false); }; }

/* ---------- 主角放大 ---------- */
{ const _dr = dollRender; dollRender = function (b, A, S, T, tint) { const im = _dr(b, A, S, T, tint); if (!GBA26.on || !(b instanceof Battle) || !b.H) return im; return up26(im, GBA26.heroS, b.H, tint ? 'up26T' : 'up26'); }; }

/* ---------- 底座（跟背景同材質；畫法在 15b） ---------- */
{ const B = Battle.prototype, _ds = B.drawStage; B.drawStage = function (x) { if (!GBA26.on) return _ds.call(this, x);
    this.camOn26 = 0; const cam = this.cam26, z = cam ? cam.zz || cam.z : 1; if (z > 1.002) { x.save(); x.translate(cam.x, cam.y); x.scale(z, z); x.translate(-cam.x, -cam.y); this.camOn26 = 1; }
    _ds.call(this, x);
    if (typeof drawPlat26 === 'function') { const mat = platMat26(this.cfgBg);
      for (const v of this.foes(true)) if (!v.gone || v.alpha > 0) { const bw = v.img && v.img.bb ? (v.img.bb.vw || v.img.bb.w * 0.7) : 40; drawPlat26(x, mat, v.tx ?? v.x, v.foot, Math.max(40, Math.min(110, bw * 1.25)), this); }
      drawPlat26(x, mat, this.heroX + HD_HERO_OX + 28, HERO_FOOT + 1, 74, this); } }; }

/* ---------- 演出：鏡頭・打退・大數字・大招特寫・出場 ---------- */
{ const B = Battle.prototype;
  const _u = B.update; B.update = function (...a) { if (!GBA26.on || this.hitstop > 0) return _u.apply(this, a);
    const s = this.act26, cam = this.cam26 || (this.cam26 = { z: 1, x: 88, y: 110 }); let T = { z: 1, x: cam.x, y: cam.y };
    if (s && s.hero) { const F = this.tgtV || this.focus || this.F, A = _c26(this, this.H), C = F && !F.hero ? _c26(this, F) : { x: 120, y: 40 }; T = { z: GBA26.camHero, x: lerp(A.x, C.x, 0.62), y: lerp(A.y, C.y, 0.62) }; }
    else if (s && !s.hero && !s.gone) { const C = _c26(this, s); T = { z: GBA26.camFoe, x: C.x, y: C.y }; }
    const pz = this.punch26 || 0; this.punch26 = pz * 0.82;
    cam.z += (T.z - cam.z) * 0.16; cam.x += (T.x - cam.x) * 0.16; cam.y += (T.y - cam.y) * 0.16; cam.zz = cam.z + pz;
    for (const v of this.foes(true)) { if (v.kb26) v.kb26 *= 0.84; if (Math.abs(v.kb26 || 0) < 0.3) v.kb26 = 0;
      if (this.intro26 && v.alpha >= 1 && !v.land26) { v.land26 = this.t; this.sparks(v.x, v.foot - 2, v.boss || v.elite ? 16 : 8, ['#c8b090', '#a08868', '#e8dcc0'], 1.6, 16, 0.08); this.shake = Math.max(this.shake, v.boss ? 10 : 4); Sound.sfx('land'); }
      if (v.sil26 != null) { const k = clamp((this.t - (v.land26 || this.t + 99)) / 26, 0, 1); v.tint = k >= 1 ? null : { c: '#07040c', a: 1 - k }; if (k >= 1) v.sil26 = null; } }
    if (this.cut26 && ++this.cut26.t >= this.cut26.life) this.cut26 = null;
    if (this.name26 && ++this.name26.t >= this.name26.life) this.name26 = null;
    return _u.apply(this, a); };
  const _c = B.center; window._c26 = (b, v) => _c.call(b, v);
  const _ov = B.drawOverlay; B.drawOverlay = function (x) { if (this.camOn26) { this.camOn26 = 0; x.restore(); }
    const r = _ov.call(this, x); if (GBA26.on) { drawCut26(this, x); drawName26(this, x); } return r; };
  if (KB12.intents) { const _it = KB12.intents; KB12.intents = function (x) { const z = this.cam26 ? this.cam26.z : 1; if (!GBA26.on || z < 1.02) return _it.call(this, x);
      const a = clamp(1 - (z - 1.02) / 0.05, 0, 1); if (a <= 0) return; x.save(); x.globalAlpha *= a; try { return _it.call(this, x); } finally { x.restore(); } }; }
  const _dp = B.drawPops; B.drawPops = function (x) { if (!GBA26.on) return _dp.call(this, x); const cam = this.cam26, z = cam ? cam.zz || cam.z : 1, L0 = KB12.L; KB12.L = 20;
    x.save(); if (z > 1.002) { x.translate(cam.x, cam.y); x.scale(z, z); x.translate(-cam.x, -cam.y); } try { return _dp.call(this, x); } finally { x.restore(); KB12.L = L0; } };
  const _dr = B.draw; B.draw = function (x) { if (!GBA26.on) return _dr.call(this, x); this.heroX = GBA26.heroCX - 28 - HD_HERO_OX;
    const kb = []; for (const v of this.foes(true)) { if (v.kb26) { kb.push([v, v.off.x, v.off.y]); v.off.x += v.kb26; v.off.y -= v.kb26 * 0.5; }
      if (this.intro26 && v.alpha < 1) { kb.push([v, v.off.x, v.off.y]); const k = 1 - v.alpha; v.off.y -= Math.round(70 * k * k); v.off.x += Math.round(14 * k); } }
    try { return _dr.call(this, x); } finally { for (const [v, a, b] of kb) { v.off.x = a; v.off.y = b; } } };
  const HD = B.handlers;
  const _as = HD.ACTION_START; HD.ACTION_START = function* (e, s, t, P) { if (GBA26.on && s) this.act26 = s; return yield* _as.call(this, e, s, t, P); };
  const _ae = HD.ACTION_END; HD.ACTION_END = function* (...a) { const r = yield* _ae.apply(this, a); if (GBA26.on) this.act26 = null; return r; };
  const _dm = HD.DAMAGE; HD.DAMAGE = function* (e, s, t, P) { if (GBA26.on && t && P && P.amount > 0 && P.kind !== 'dot') {
      if (!t.hero) { t.kb26 = (t.kb26 || 0) + (P.mult > 1 || P.crit ? 8 : 5); this.punch26 = Math.max(this.punch26 || 0, P.mult > 1 || P.crit ? 0.08 : 0.045); }
      else { this.punch26 = Math.max(this.punch26 || 0, 0.045); } }
    return yield* _dm.call(this, e, s, t, P); };
  const _su = HD.SKILL_USE; HD.SKILL_USE = function* (e, s, t, P) { if (GBA26.on && s && s.hero && P && P.skill) { const D = DEF.skills[P.skill];
      const mp = typeof skillMP === 'function' ? skillMP(P.skill) || 0 : 0, dmg = D && ((D.tags || []).includes('damage') || D.target === 'enemy');
      if (D && dmg && !(D.tags || []).includes('basic') && (mp >= GBA26.cutMP || GBA26.cutAll)) { this.cut26 = { t: 0, life: 40, s: this.skillName(P.skill, s.id) }; Sound.sfx('charge'); for (let i = 0; i < 30; i++) yield; } }
    return yield* _su.call(this, e, s, t, P); };
  const _in = B.intro; B.intro = function* (...a) { if (!GBA26.on) return yield* _in.apply(this, a); this.intro26 = 1;
    const L = this.foes(), big = L.find(v => v.boss) || L.find(v => v.elite); for (const v of L) { v.land26 = 0; if (v === big) v.sil26 = 1; }
    try { const r = _in.apply(this, a); let n = r.next(); while (!n.done) { if (big && big.land26 && !this.named26) { this.named26 = 1; this.name26 = { t: 0, life: 90, s: big.n, boss: !!big.boss }; } yield n.value; n = r.next(); } return n.value; }
    finally { this.intro26 = 0; for (const v of L) if (v.sil26 != null) { v.sil26 = null; v.tint = null; } } }; }

