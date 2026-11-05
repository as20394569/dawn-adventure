/* ===================== v12.155 戰鬥：主角出手才登場（試做） =====================
   玩家 2026-11-05：「想要在有限的畫面中改出有魄力的戰鬥」。斜角對峙試過：「不好 畫面太擠太難看」→ 照 Claude 的提案「平常留白，出手時放大」：
   · 平常：主角不站在場上（只有下方狀態卡），魔物站在畫面中間、放大（一隻 1.5 倍、兩隻 1.3、三隻 1.15，頭目・菁英再大）。
   · 主角出手：紙娃娃（放大 2 倍）從左下衝進來 → 鏡頭推近魔物 → 打中時停頓・震動・魔物被打退・大數字 → 主角退場、鏡頭拉回。
   · 大招（MP 18 以上的攻擊技能）：斜切的特寫條（主角大圖＋招式名）停一下再放特效。
   · 魔物出手：鏡頭推近牠（以畫面下緣為準，下方的數字不會跑掉）；打在你身上時畫面往下震、閃紅，數字跳在狀態卡上。
   · 出場：魔物從遠處跳進來落地揚塵；頭目・菁英先是黑影再亮出全身，名字大字打出來。
   · 場景鋪滿：地平線以下拉近到畫面最下面，下方的框半透明。
   ST26.on = false 就完全回到原本的畫面。 */
const ST26 = { on: true, heroCX: 46, heroS: 2,
  slots: { 1: [[88, 146]], 2: [[54, 148], [124, 140]], 3: [[30, 150], [88, 136], [146, 150]] },
  scale: { 1: 1.5, 2: 1.3, 3: 1.15 },
  rest: { x: 88, y: 200 }, // 主角不在場上時，「主角的位置」＝狀態卡（魔物的攻擊往這裡打、數字在這裡跳）
  camHero: 1.2, camFoe: 1.14, cutMP: 18 };
function st26() { return ST26.on && Game.scene instanceof Battle; }
const ease26 = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
function up26(im, s, holder, key) { if (!im || !(s > 1) || !holder) return im;
  const ds = im.ds || 1, K = Math.max(1, Math.min(4, SCALE | 0)), w = Math.ceil(im.width * ds * s * K), h = Math.ceil(im.height * ds * s * K);
  let c = holder[key]; if (!c || c.width !== w || c.height !== h) c = holder[key] = mkCanvas(w, h);
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.imageSmoothingEnabled = !im.px && !HD_PIXEL; x.drawImage(im, 0, 0, w, h);
  c.ds = 1 / K; c.px = im.px; if (im.bb) { const b = im.bb; c.bb = { ...b, cx: b.cx * s, top: b.top * s, bot: b.bot * s, w: b.w * s, h: b.h * s }; if (b.vw) c.bb.vw = b.vw * s; } return c; }

{ const B = Battle.prototype;
  /* ---------- 站位：魔物在中間；主角平常在畫面外 ---------- */
  B.heroBase26 = () => ST26.heroCX - 28 - HD_HERO_OX;
  B.heroIn26 = function () { return ease26(this.hin26 || 0); };
  const _ly = B.layout; B.layout = function (snap) { _ly.call(this, snap); if (!ST26.on) return;
    const L = this.foes(), n = Math.min(3, L.length); if (!n) return; const P = ST26.slots[n], rank = v => v.boss ? 0 : v.elite ? 1 : v.minion ? 3 : 2;
    let order = L.slice().sort((a, b) => rank(b) - rank(a)); const big = L.find(v => v.boss) || L.find(v => v.elite);
    if (n === 3 && big) { order = order.filter(v => v !== big); order.splice(1, 0, big); } // 大隻的站中間後面
    if (n === 2 && big) order = [order.find(v => v !== big), big];
    order.forEach((v, k) => { const p = P[k] || P[P.length - 1]; v.tx = p[0]; v.foot = p[1]; v.foot0 = p[1]; if (snap) v.x = p[0]; }); };
  B.bigS22 = function (v, h0) { if (!v || v.hero || !(h0 > 0)) return 1; if (!ST26.on) return 1;
    const n = Math.min(3, this.foes().length) || 1, want = (ST26.scale[n] || 1.15) * (v.boss ? 1.35 : v.elite ? 1.2 : 1), E = TALL_EXT || 0,
      minTop = (typeof plateRow25 === 'function' && plateRow25()) ? rowTop25() + 29 + 19 : 15 - E + 13 + 6;
    return clamp(Math.floor(Math.min(want, (v.foot - minTop) / h0) * 4) / 4, 1, 3); };
  // 主角的位置：在場上時是左下，不在時是狀態卡
  const _c = B.center; B.center = function (b) { if (ST26.on && b && b.hero && b.cx == null) { const e = this.heroIn26();
      if (e < 0.4) return { x: ST26.rest.x, y: ST26.rest.y };
      return { x: this.heroBase26() + HD_HERO_OX + 28 - 90 * (1 - e), y: HERO_FOOT - Math.round(15 * ST26.heroS) + 70 * (1 - e) }; }
    return _c.call(this, b); };

  /* ---------- 每格：主角進出、鏡頭、魔物被打退、出場 ---------- */
  const _u = B.update; B.update = function (...a) { if (!ST26.on || this.hitstop > 0) return _u.apply(this, a);
    const tgt = this.hinT26 || 0; this.hin26 = (this.hin26 || 0) + clamp(tgt - (this.hin26 || 0), -0.11, 0.11);
    // 鏡頭：主角出手推近目標、魔物出手推近牠（以下緣為準）、其他時候拉回
    const s = this.act26, cam = this.cam26 || (this.cam26 = { z: 1, x: 88, y: 110 }); let T = { z: 1, x: cam.x, y: cam.y };
    if (s && s.hero && this.heroIn26() > 0.5) { const F = this.tgtV || this.focus || this.F, C = F && !F.hero ? _c.call(this, F) : { x: 88, y: 110 }; T = { z: ST26.camHero, x: C.x, y: C.y }; }
    else if (s && !s.hero && !s.gone) { const C = _c.call(this, s); T = { z: ST26.camFoe, x: C.x, y: 214 }; }
    const pz = this.punch26 || 0; this.punch26 = pz * 0.82;
    cam.z += (T.z - cam.z) * 0.16; cam.x += (T.x - cam.x) * 0.16; cam.y += (T.y - cam.y) * 0.16; cam.zz = cam.z + pz;
    for (const v of this.foes(true)) { if (v.kb26) v.kb26 *= 0.84; if (Math.abs(v.kb26 || 0) < 0.3) v.kb26 = 0;
      if (this.intro26 && v.alpha >= 1 && !v.land26) { v.land26 = this.t; const C = _c.call(this, v); this.sparks(C.x, v.foot - 2, v.boss || v.elite ? 16 : 8, ['#c8b090', '#a08868', '#e8dcc0'], 1.6, 16, 0.08); this.shake = Math.max(this.shake, v.boss ? 10 : 4); Sound.sfx('land'); }
      if (v.sil26 != null) { const k = clamp((this.t - (v.land26 || this.t + 99)) / 26, 0, 1); v.tint = k >= 1 ? null : { c: '#07040c', a: 1 - k }; if (k >= 1) v.sil26 = null; } }
    if (this.cut26 && ++this.cut26.t >= this.cut26.life) this.cut26 = null;
    if (this.name26 && ++this.name26.t >= this.name26.life) this.name26 = null;
    return _u.apply(this, a); };

  /* ---------- 畫：地面鋪滿、鏡頭、主角滑進滑出 ---------- */
  const _ds = B.drawStage; B.drawStage = function (x) { if (!ST26.on) return _ds.call(this, x);
    this.camOn26 = 0; const cam = this.cam26, z = cam ? cam.zz || cam.z : 1; if (z > 1.002) { x.save(); x.translate(cam.x, cam.y); x.scale(z, z); x.translate(-cam.x, -cam.y); this.camOn26 = 1; }
    const hor = (typeof SKY21_HOR !== 'undefined' && SKY21_HOR[this.cfgBg]) || 64, K = Math.max(1, (H - hor) / (BH - hor)) * 1.02;
    x.save(); x.beginPath(); x.rect(-60, -(TALL_EXT || 0) - 60, W + 120, hor + (TALL_EXT || 0) + 60); x.clip(); _ds.call(this, x); x.restore();
    x.save(); x.beginPath(); x.rect(-60, hor, W + 120, H - hor + 60); x.clip(); x.translate(W / 2, hor); x.scale(K, K); x.translate(-W / 2, -hor);
    const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = true; x.drawImage(hd2dStageFor(this), 0, 0, W, BH); x.imageSmoothingEnabled = sm; x.restore(); };
  const _ov = B.drawOverlay; B.drawOverlay = function (x) { if (this.camOn26) { this.camOn26 = 0; x.restore(); }
    if (ST26.on) { const g = x.createLinearGradient(0, 178, 0, H); g.addColorStop(0, 'rgba(6,7,14,0)'); g.addColorStop(1, 'rgba(6,7,14,0.6)'); x.fillStyle = g; x.fillRect(0, 178, W, H - 178); }
    const r = _ov.call(this, x); if (ST26.on) { drawCut26(this, x); drawName26(this, x); } return r; };
  // 名牌・預告不跟著鏡頭：鏡頭推近時預告先淡掉（不然會對不到魔物）
  if (typeof KB12 !== 'undefined' && KB12.intents) { const _it = KB12.intents; KB12.intents = function (x) { const z = this.cam26 ? this.cam26.z : 1; if (!ST26.on || z < 1.02) return _it.call(this, x);
      const a = clamp(1 - (z - 1.02) / 0.06, 0, 1); if (a <= 0) return; x.save(); x.globalAlpha *= a; try { return _it.call(this, x); } finally { x.restore(); } }; }
  // 數字跟著鏡頭（在魔物身上）；放大
  const _dp = B.drawPops; B.drawPops = function (x) { if (!ST26.on) return _dp.call(this, x); const cam = this.cam26, z = cam ? cam.zz || cam.z : 1, L0 = KB12.L; KB12.L = 20;
    x.save(); if (z > 1.002) { x.translate(cam.x, cam.y); x.scale(z, z); x.translate(-cam.x, -cam.y); } try { return _dp.call(this, x); } finally { x.restore(); KB12.L = L0; } };
  const _dr = B.draw; B.draw = function (x) { if (!ST26.on) return _dr.call(this, x);
    const Hv = this.H, e = this.heroIn26(), ox = Hv && Hv.off ? Hv.off.y : 0; this.heroX = this.heroBase26() - 90 * (1 - e); if (Hv && Hv.off) Hv.off.y = ox + 70 * (1 - e);
    const kb = []; for (const v of this.foes(true)) { if (v.kb26) { kb.push([v, v.off.x, v.off.y]); v.off.x += v.kb26; v.off.y -= v.kb26 * 0.45; }
      if (this.intro26 && v.alpha < 1) { kb.push([v, v.off.x, v.off.y]); const k = 1 - v.alpha; v.off.y -= Math.round(80 * k * k); v.off.x += Math.round(16 * k); } }
    const fr = x.fillRect; x.fillRect = function (a, b, c, d) { if (a === 0 && b === BH && c === W && (d === H - BH || d === 1)) return; return fr.call(this, a, b, c, d); };
    try { return _dr.call(this, x); } finally { delete x.fillRect; if (Hv && Hv.off) Hv.off.y = ox; for (const [v, a, b] of kb) { v.off.x = a; v.off.y = b; } } };

  /* ---------- 事件：出手開始／結束、打中、大招、出場 ---------- */
  const HD = B.handlers;
  const _as = HD.ACTION_START; HD.ACTION_START = function* (e, s, t, P) { if (ST26.on && s) { this.act26 = s;
      if (s.hero) { this.hinT26 = 1; Sound.sfx('jump'); for (let i = 0; i < 14 && this.hin26 < 0.98; i++) yield; } }
    return yield* _as.call(this, e, s, t, P); };
  const _ae = HD.ACTION_END; HD.ACTION_END = function* (...a) { const r = yield* _ae.apply(this, a); if (!ST26.on) return r;
    if (this.hinT26) { this.hinT26 = 0; for (let i = 0; i < 6; i++) yield; } this.act26 = null; return r; };
  const _dm = HD.DAMAGE; HD.DAMAGE = function* (e, s, t, P) { if (ST26.on && t && P && P.amount > 0 && P.kind !== 'dot') {
      if (!t.hero) { const k = P.mult > 1 || P.crit ? 9 : 6; t.kb26 = (t.kb26 || 0) + k; this.punch26 = Math.max(this.punch26 || 0, P.mult > 1 || P.crit ? 0.09 : 0.05); }
      else { this.punch26 = Math.max(this.punch26 || 0, 0.05); this.red = Math.max(this.red || 0, 6); } }
    return yield* _dm.call(this, e, s, t, P); };
  const _su = HD.SKILL_USE; HD.SKILL_USE = function* (e, s, t, P) { if (ST26.on && s && s.hero && P && P.skill) { const D = DEF.skills[P.skill];
      const mp = typeof skillMP === 'function' ? skillMP(P.skill) || 0 : 0, dmg = D && ((D.tags || []).includes('damage') || D.target === 'enemy');
      if (D && dmg && !D.tags.includes('basic') && (mp >= ST26.cutMP || ST26.cutAll)) { this.cut26 = { t: 0, life: 40, s: this.skillName(P.skill, s.id) }; Sound.sfx('charge'); for (let i = 0; i < 30; i++) yield; } }
    return yield* _su.call(this, e, s, t, P); };
  const _in = B.intro; B.intro = function* (...a) { if (!ST26.on) return yield* _in.apply(this, a); this.intro26 = 1;
    const L = this.foes(), big = L.find(v => v.boss) || L.find(v => v.elite); for (const v of L) { v.land26 = 0; if (v === big) v.sil26 = 1; }
    try { const r = _in.apply(this, a); let n = r.next(); while (!n.done) { if (big && big.land26 && !this.name26 && !this.named26) { this.named26 = 1; this.name26 = { t: 0, life: 90, s: big.n, boss: !!big.boss }; } yield n.value; n = r.next(); } return n.value; }
    finally { this.intro26 = 0; for (const v of L) { if (v.sil26 != null) { v.sil26 = null; v.tint = null; } } } }; }

/* ---------- 主角放大（只在戰鬥） ---------- */
{ const _dr = dollRender; dollRender = function (b, A, S, T, tint) { const im = _dr(b, A, S, T, tint); if (!ST26.on || !(b instanceof Battle) || !b.H) return im; return up26(im, ST26.heroS, b.H, tint ? 'up26T' : 'up26'); }; }

/* ---------- 下方的框半透明 ---------- */
if (typeof KB12 !== 'undefined') { const _pn = KB12.panel; KB12.panel = function (x, X, Y, w, h, o = {}) { if (!st26() || Y < 180) return _pn(x, X, Y, w, h, o);
    x.save(); x.globalAlpha *= 0.82; try { return _pn(x, X, Y, w, h, o); } finally { x.restore(); } }; }

/* ---------- 大招特寫：斜切的一條，主角大圖＋招式名 ---------- */
function drawCut26(b, x) { const c = b.cut26; if (!c) return; const t = c.t, L = c.life, inA = ease26(t / 7), outA = t > L - 8 ? (L - t) / 8 : 1, a = Math.min(inA, outA);
  const cy = 96, hh = 54, slide = (1 - ease26(t / 8)) * -W;
  x.save(); x.globalAlpha = 0.55 * a; x.fillStyle = '#000'; x.fillRect(0, -(TALL_EXT || 0), W, H + (TALL_EXT || 0)); x.restore();
  x.save(); x.translate(W / 2 + slide, cy); x.rotate(-0.16); x.globalAlpha = a;
  const g = x.createLinearGradient(-W, 0, W, 0); g.addColorStop(0, 'rgba(30,18,6,0.95)'); g.addColorStop(0.5, 'rgba(70,40,10,0.95)'); g.addColorStop(1, 'rgba(30,18,6,0.95)'); x.fillStyle = g; x.fillRect(-W, -hh / 2, W * 2, hh);
  x.fillStyle = '#ffd27a'; x.fillRect(-W, -hh / 2, W * 2, 1.2); x.fillRect(-W, hh / 2 - 1.2, W * 2, 1.2);
  // 速度線
  x.strokeStyle = 'rgba(255,230,170,0.35)'; x.lineWidth = 0.8; for (let i = 0; i < 9; i++) { const yy = -hh / 2 + 5 + i * 5.5, off = ((t * 9 + i * 37) % 120); x.beginPath(); x.moveTo(-W + off * 3, yy); x.lineTo(-W + off * 3 + 40, yy); x.stroke(); }
  // 主角（紙娃娃的攻擊姿勢，放大）
  const Hv = b.H, im = Hv && Hv.img; if (im) { const ds = im.ds || 1, s = 1.25, w = im.width * ds * s, h = im.height * ds * s; x.save(); x.beginPath(); x.rect(-W, -hh / 2, W * 2, hh); x.clip(); x.imageSmoothingEnabled = false; x.drawImage(im, -W / 2 + 4 - (t < 8 ? (8 - t) * 2 : 0), hh / 2 - h * 0.78, w, h); x.restore(); }
  x.restore();
  // 招式名
  x.save(); x.globalAlpha = a; const sc = t < 6 ? 1.6 - t * 0.1 : 1; x.translate(W / 2 + 26, cy - 6); x.rotate(-0.16); x.scale(sc, sc); KB12.num(x, c.s, 0, 0, '#fff2d0', 18); x.restore(); }
/* ---------- 頭目・菁英登場：名字大字 ---------- */
function drawName26(b, x) { const c = b.name26; if (!c) return; const t = c.t, L = c.life, a = t < 6 ? t / 6 : t > L - 14 ? Math.max(0, (L - t) / 14) : 1, cy = 34 - Math.min(TALL_EXT || 0, 40);
  x.save(); x.globalAlpha = a; const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(20,6,10,0)'); g.addColorStop(0.15, 'rgba(20,6,10,0.88)'); g.addColorStop(0.85, 'rgba(20,6,10,0.88)'); g.addColorStop(1, 'rgba(20,6,10,0)');
  x.fillStyle = g; x.fillRect(0, cy - 17, W, 34); x.fillStyle = c.boss ? '#ff6a5a' : '#ffd27a'; x.fillRect(0, cy - 17, W, 0.8); x.fillRect(0, cy + 16.2, W, 0.8);
  KB12.tc(x, c.boss ? '頭目' : '菁英', W / 2, cy - 9, c.boss ? '#ff8a7a' : '#ffd27a', KB12.S);
  const sc = t < 8 ? 1.5 - t * 0.0625 : 1; x.translate(W / 2, cy + 5); x.scale(sc, sc); KB12.num(x, c.s, 0, 0, '#ffffff', 20); x.restore(); }
