/* ===================== v12.155 戰鬥：GBA 寶可夢式構圖＋復古掌機風 UI（試做） =====================
   玩家 2026-11-05：「用 gba 寶可夢那樣的戰鬥構圖好了 圖畢竟都畫了」「3 隻不要擠在一起 菁英跟 boss 大小統一」
   「底下圓盤建議跟背景圖統一 所以背景圖有些要重畫 還有 ui 要重新設計」→ 選了：Claude 程式重畫背景、底座跟地面同材質、復古掌機風 UI、先做第一章。
   · 站位：魔物在右上（兩隻・三隻分開站，各自一個底座），主角背影在左下（1.25 倍）；所有魔物（含菁英・頭目）都用原圖大小，不再特別放大。
   · UI：魔物的血量框在左上（多隻時頂上一排），主角的在右下；奶油色底・深色粗框・深色字。下方的訊息框・指令・技能清單是深藍底＋淺色粗框，▶ 游標。
   · 演出（之前玩家選的）：出手時鏡頭推近、打中停頓・魔物被打退・大數字、大招特寫、魔物跳進來落地揚塵、頭目黑影亮相＋名字。
   GBA26.on = false 就回到原本的畫面。背景・底座的畫法在 15b_gba26_bg。 */
const GBA26 = { on: true, heroCX: 44, heroS: 1.25,
  // 魔物腳底（畫面拉長 ≥ 40 列時；沒拉長時整排往下移）
  slots: { 1: [[124, 70]], 2: [[92, 76], [146, 62]], 3: [[32, 84], [90, 64], [146, 84]] },
  cutMP: 18, camHero: 1.14, camFoe: 1.1,
  // 顏色
  cream: '#f8f2dc', creamD: '#e4dcc0', ink: '#283040', inkL: '#5a6478', frame: '#283040',
  navy: '#26365a', navyT: '#30446c', line: '#eae8dc', gold: '#ffd860' };
function gba26() { return GBA26.on && Game.scene instanceof Battle; }
const ease26 = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
function up26(im, s, holder, key) { if (!im || !(s > 1) || !holder) return im;
  const ds = im.ds || 1, K = Math.max(1, Math.min(4, SCALE | 0)), w = Math.ceil(im.width * ds * s * K), h = Math.ceil(im.height * ds * s * K);
  let c = holder[key]; if (!c || c.width !== w || c.height !== h) c = holder[key] = mkCanvas(w, h);
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.imageSmoothingEnabled = !im.px && !HD_PIXEL; x.drawImage(im, 0, 0, w, h);
  c.ds = 1 / K; c.px = im.px; if (im.bb) { const b = im.bb; c.bb = { ...b, cx: b.cx * s, top: b.top * s, bot: b.bot * s, w: b.w * s, h: b.h * s }; if (b.vw) c.bb.vw = b.vw * s; } return c; }
// 文字（奶油色框上用：深色、沒有陰影；cy 是中線，跟 KB12.tl 一樣）
const gt26 = (x, s, X, cy, col, z) => Font.draw(x, String(s), X, cy - 8, col, null, z);
const gtr26 = (x, s, X, cy, col, z) => Font.draw(x, String(s), X - Font.width(String(s), z), cy - 8, col, null, z);
const gtc26 = (x, s, X, cy, col, z) => Font.draw(x, String(s), X - Font.width(String(s), z) / 2, cy - 8, col, null, z);

/* ---------- 框：復古掌機風 ---------- */
function rr26(x, X, Y, w, h, r) { KB12.rr(x, X, Y, w, h, r); }
// 奶油色的血量框（外圈深色、內圈米色、右下一點陰影）
function creamBox26(x, X, Y, w, h, rim) { x.save();
  x.fillStyle = 'rgba(0,0,0,0.28)'; rr26(x, X + 1.5, Y + 1.5, w, h, 4); x.fill();
  x.fillStyle = rim || GBA26.frame; rr26(x, X, Y, w, h, 4); x.fill();
  x.fillStyle = GBA26.creamD; rr26(x, X + 1.5, Y + 1.5, w - 3, h - 3, 3); x.fill();
  x.fillStyle = GBA26.cream; rr26(x, X + 1.5, Y + 1.5, w - 3, h - 4.5, 3); x.fill(); x.restore(); }
// 深藍的訊息・選單框（外圈深色、淺色粗邊、深藍底）
function navyBox26(x, X, Y, w, h, o = {}) { x.save();
  x.fillStyle = '#0c1020'; rr26(x, X, Y, w, h, 4); x.fill();
  x.fillStyle = o.rim && o.rim !== 'rgba(255,255,255,0.14)' && o.rim !== 'rgba(255,255,255,0.16)' ? o.rim : GBA26.line; rr26(x, X + 1, Y + 1, w - 2, h - 2, 3.5); x.fill();
  const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, o.top || GBA26.navyT); g.addColorStop(1, o.bot || GBA26.navy); x.fillStyle = g; rr26(x, X + 2.5, Y + 2.5, w - 5, h - 5, 2.5); x.fill(); x.restore(); }
// 血條：深色框、灰色底、綠／黃／紅
function hpBar26(x, X, Y, w, r, cols) { x.save(); x.fillStyle = GBA26.frame; rr26(x, X, Y, w, 5, 2.5); x.fill(); x.fillStyle = '#6a7080'; rr26(x, X + 1, Y + 1, w - 2, 3, 1.5); x.fill();
  const c = cols || (r > 0.5 ? ['#40c858', '#88f098'] : r > 0.2 ? ['#e8b020', '#ffe070'] : ['#e04838', '#ff9a88']); if (r > 0) { const fw = Math.max(2, (w - 2) * r); x.fillStyle = c[0]; rr26(x, X + 1, Y + 1, fw, 3, 1.5); x.fill(); x.fillStyle = c[1]; x.fillRect(X + 2, Y + 1, Math.max(0, fw - 2), 1); } x.restore(); }

if (typeof KB12 !== 'undefined') {
  // 大的框（訊息・選單・按鈕）換成深藍粗邊；小牌子（狀態・預告・跳字）照舊
  const _pn = KB12.panel; KB12.panel = function (x, X, Y, w, h, o = {}) { if (!gba26() || h < 15) return _pn(x, X, Y, w, h, o); return navyBox26(x, X, Y, w, h, o); };
  // 選到的那一行：▶ 游標
  if (typeof selBar !== 'undefined') { const _sb = selBar; selBar = function (x, X, Y, w, h = 15) { if (!gba26()) return _sb(x, X, Y, w, h); x.save(); x.fillStyle = 'rgba(255,255,255,0.10)'; rr26(x, X, Y, w, h, 2); x.fill();
      const cy = Y + h / 2, b = Math.floor(Game.t / 20) % 2 ? 0.5 : 0; x.fillStyle = GBA26.gold; x.beginPath(); x.moveTo(X + 1 + b, cy - 3.5); x.lineTo(X + 5 + b, cy); x.lineTo(X + 1 + b, cy + 3.5); x.closePath(); x.fill(); x.restore(); }; } }

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

/* ---------- 魔物的血量框 ---------- */
KB12.plates = function (x, a0) { if (!GBA26.on) return; const all = this.foes(), F = all.filter(v => !v.gone && v.alpha > 0.3); if (!F.length) return; const n = all.length, M = KB12.M, S = KB12.S, E = TALL_EXT || 0;
  const one = n === 1, G = 3, bw = one ? 104 : Math.floor((W - 8 - G * (n - 1)) / n), top = E >= 40 ? 19 - E : 18, srt = all.slice().sort((a, b) => (a.tx ?? a.x) - (b.tx ?? b.x));
  for (const v of F) { const k = srt.indexOf(v), X = one ? 4 : 4 + k * (bw + G), a = a0 * (v.plateA ?? 1); if (a <= 0) continue; const on = this.pickV === v, u = v.u;
    const L = KB12.signs.call(this, v, true);
    if (u && (u.elite || u.boss)) { const I = (u.data && u.data.in11) || {}; for (const [nm, kk] of [['普', 'b'], ['物', 'p'], ['魔', 'm']]) { const q = Math.round(I[kk] ?? 100); if (q !== 100) L.push([nm + ' ' + q + '%', q > 100 ? '#8af08a' : '#ff8a7a', 'rgba(24,28,44,0.92)']); } }
    if (one) { const wk = typeof weakOf11 === 'function' && v.sp ? weakOf11(v.sp, u && u.data && u.data.hunt2) : null; if (wk && wk.length) { const rev = this.revealed(v); L.push(['弱 ' + (rev ? wk.join('・') : '？'), rev ? '#ffd070' : KB12.mut, 'rgba(40,32,14,0.9)']); } }
    const h = L.length || v.brkMax ? 34 : 24, Y = top;
    x.save(); x.globalAlpha = a; creamBox26(x, X, Y, bw, h, on ? '#c89010' : null);
    // 第 1 行：名字（頭目・菁英・稀有）、Lv
    const tag = v.rare ? '稀有' : v.boss ? '頭目' : v.elite ? '菁英' : '', tcol = v.boss ? '#d03838' : v.elite ? '#c87018' : '#b08810', lv = 'Lv' + v.lv, lw = Math.ceil(Font.width(lv, S)), tw = tag && bw >= 70 ? Math.ceil(Font.width(tag, S)) + 3 : 0;
    const room = bw - 10 - lw - 3 - tw; let z = M; while (z > 7 && Font.width(v.n, z) > room) z -= 0.5;
    gt26(x, v.n, X + 5, Y + 8, GBA26.ink, z); if (tw) gt26(x, tag, X + 5 + Math.min(room, Font.width(v.n, z)) + 3, Y + 8.5, tcol, S); gtr26(x, lv, X + bw - 5, Y + 8.5, GBA26.inkL, S);
    // 第 2 行：HP
    const hr = clamp(v.hp / Math.max(1, v.maxhp), 0, 1); gt26(x, 'HP', X + 5, Y + 17, '#d07818', S); hpBar26(x, X + 17, Y + 14.5, bw - 22, hr);
    if (v.st && v.st.ward > 0) { x.fillStyle = '#3a9ae8'; x.fillRect(X + 18, Y + 13, Math.round((bw - 24) * clamp(v.st.ward / (v.st.wardMax || 1), 0, 1)), 1); }
    // 第 3 行：破防格・狀態・弱點
    let sx = X + 5; if (v.brkMax) { for (let q = 0; q < v.brkMax; q++) { x.fillStyle = v.broken ? '#e04838' : q < v.brk ? '#3a9ae8' : '#c8c0a8'; rr26(x, sx + q * 4, Y + 25, 3, 3, 1); x.fill(); } sx += v.brkMax * 4 + 2; }
    if (L.length) KB12.chipRow(x, L, sx, Y + 22, X + bw - 4 - sx);
    // 破防中的頭目：部位耐久
    const P = u && u.boss && v.broken && typeof partsOf11 === 'function' && partsOf11(u); if (P && P.length) { const pw = Math.floor((bw - 2 * (P.length - 1)) / P.length); P.forEach((q, k2) => { const px = X + k2 * (pw + 2), py = Y + h + 2, r2 = clamp(q.hp / q.max, 0, 1);
      creamBox26(x, px, py, pw, 12); gt26(x, q.n, px + 3, py + 6, q.gone ? GBA26.inkL : '#a05010', S); if (q.gone) gtr26(x, '打壞', px + pw - 3, py + 6, '#d03838', S); else hpBar26(x, px + pw - 24, py + 3.5, 21, r2, ['#d88a20', '#ffd060']); }); }
    x.restore();
    // 選目標時：魔物頭上一個 ▼
    if (on) { const C = this.center(v), ty = Math.round(v.foot - (v.bbh || 40) - 6 + Math.sin(Game.t / 6) * 1.5); x.fillStyle = GBA26.gold; x.strokeStyle = '#3a2808'; x.lineWidth = 1; x.beginPath(); x.moveTo(C.x - 5, ty - 5); x.lineTo(C.x + 5, ty - 5); x.lineTo(C.x, ty + 1); x.closePath(); x.fill(); x.stroke(); } } };

/* ---------- 主角的血量框（右下） ---------- */
{ const B = Battle.prototype, _db = B.drawBoxH; B.drawBoxH = function (x) { if (!GBA26.on) return _db.call(this, x);
    // 原本的狀態卡不畫（後面疊上去的護盾・異常・增益小牌子照畫）
    const bh = this.boxH; this.boxH = BH + 60; try { _db.call(this, x); } finally { this.boxH = bh; }
    const st = Game.st, Hv = this.H; if (!Hv) return; const Y = Math.round(this.boxH) - 9; if (Y >= BH) return;
    const S = KB12.S, M = KB12.M, w = 92, X = W - w - 3, h = 46;
    creamBox26(x, X, Y, w, h);
    gt26(x, st.name, X + 6, Y + 8, GBA26.ink, M); gtr26(x, 'Lv' + st.lv, X + w - 6, Y + 8.5, GBA26.inkL, S);
    const r = clamp(Hv.hp / Math.max(1, Hv.maxhp), 0, 1), mr = clamp(Hv.mp / (Hv.maxmp || 1), 0, 1);
    gt26(x, 'HP', X + 6, Y + 18, '#d07818', S); hpBar26(x, X + 19, Y + 15.5, w - 25, r); gtr26(x, Math.ceil(Hv.hp) + '/' + Hv.maxhp, X + w - 6, Y + 26, GBA26.ink, S);
    gt26(x, 'MP', X + 6, Y + 34, '#2a68c8', S); hpBar26(x, X + 19, Y + 31.5, w - 25, mr, ['#3a78e0', '#88b8ff']); gtr26(x, Math.round(Hv.mp) + '/' + (Hv.maxmp || 0), X + w - 6, Y + 41.5, GBA26.ink, S);
    // 職業的格子（特技・怒氣…）：框的左下
    let gx = X + 6; const gauge = (label, n, N, yy, ok, blink) => { const lw = Math.ceil(Font.width(label, S)); gt26(x, label, gx, Y + 41.5, ok ? '#b07810' : GBA26.inkL, S); gx += lw + 2;
      for (let i = 0; i < N; i++) { x.fillStyle = i < n ? (blink && Math.floor(this.t / 8) % 2 ? '#ffffff' : ok ? '#e0a020' : '#3a9ae8') : '#c8c0a8'; x.beginPath(); x.arc(gx + 2, Y + 41.5, 2, 0, 7); x.fill(); gx += 5; } gx += 4; };
    if ('wc' in Hv.max && Hv.max.wc) { const n = Math.min(Hv.max.wc, Hv.res.wc || 0); gauge('特技', n, Hv.max.wc, 0, n >= Hv.max.wc, n >= Hv.max.wc); }
    try { this.drawClassRes(x, gauge, 0); } catch (e) { }
    if ((Hv.res.combo || 0) > 0) { const step = (this.core.byId.H.data.comboStep || 6), s = '連段×' + Hv.res.combo + ' +' + step * Hv.res.combo + '%'; KB12.chip(x, s, X, Y - 11, KB12.gold, 'rgba(70,52,10,0.92)'); }
    const L = KB12.signs.call(this, Hv, false); if (L.length) KB12.chipRow(x, L, X, Y - 11 - ((Hv.res.combo || 0) > 0 ? 11 : 0), w); }; }

/* ---------- 指令：左邊「要做什麼？」，右邊 3×2 ---------- */
{ const _ch = choose; choose = function* (items, o = {}) {
    if (!gba26() || !o.buttons || o.cols !== 5 || items.length !== 5 || !o.drawExtra) return yield* _ch(items, o);
    const names = ['攻擊', '技能', '道具', '防禦', '逃跑'], X0 = 62, cw = 37, rh = 17, Y0 = BB_Y + 2;
    const o2 = { ...o, x: X0, y: Y0, w: W - X0 - 4, h: rh * 2, cols: 3, colW: cw, rowH: rh, ox: 0, oy: 0,
      drawExtra: (x, m) => { navyBox26(x, 3, BB_Y + 1, X0 - 5, BB_H - 3); const nm = Game.st.name; KB12.tc(x, nm, 3 + (X0 - 5) / 2, BB_Y + 12, GBA26.gold, KB12.M, X0 - 12); KB12.tc(x, '要做什麼？', 3 + (X0 - 5) / 2, BB_Y + 25, KB12.txt, KB12.M, X0 - 12);
        names.forEach((n, k) => { const X = m.x + (k % 3) * cw, Y = m.y + Math.floor(k / 3) * rh, on = k === m.i;
          navyBox26(x, X, Y, cw - 2, rh - 1, on ? { rim: GBA26.gold, top: '#5a4a20', bot: '#3a3014' } : {}); KB12.tc(x, n, X + (cw - 2) / 2 + (on ? 2 : 0), Y + (rh - 1) / 2, on ? '#fff2c8' : KB12.txt, KB12.M);
          if (on) { const cy = Y + (rh - 1) / 2; x.fillStyle = GBA26.gold; x.beginPath(); x.moveTo(X + 4, cy - 3); x.lineTo(X + 7.5, cy); x.lineTo(X + 4, cy + 3); x.closePath(); x.fill(); } }); } };
    return yield* _ch(items, o2); }; }

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

/* ---------- 大招特寫：斜切的一條，主角大圖＋招式名 ---------- */
function drawCut26(b, x) { const c = b.cut26; if (!c) return; const t = c.t, L = c.life, a = Math.min(ease26(t / 7), t > L - 8 ? (L - t) / 8 : 1);
  const cy = 96, hh = 54, slide = (1 - ease26(t / 8)) * -W;
  x.save(); x.globalAlpha = 0.5 * a; x.fillStyle = '#000'; x.fillRect(0, -(TALL_EXT || 0), W, BH + (TALL_EXT || 0)); x.restore();
  x.save(); x.translate(W / 2 + slide, cy); x.rotate(-0.16); x.globalAlpha = a;
  x.fillStyle = '#0c1020'; x.fillRect(-W, -hh / 2 - 2, W * 2, hh + 4); x.fillStyle = GBA26.line; x.fillRect(-W, -hh / 2, W * 2, hh); const g = x.createLinearGradient(-W, 0, W, 0); g.addColorStop(0, '#1c2848'); g.addColorStop(0.5, '#3a5088'); g.addColorStop(1, '#1c2848'); x.fillStyle = g; x.fillRect(-W, -hh / 2 + 2, W * 2, hh - 4);
  x.strokeStyle = 'rgba(220,235,255,0.3)'; x.lineWidth = 0.8; for (let i = 0; i < 9; i++) { const yy = -hh / 2 + 5 + i * 5.5, off = (t * 9 + i * 37) % 120; x.beginPath(); x.moveTo(-W + off * 3, yy); x.lineTo(-W + off * 3 + 40, yy); x.stroke(); }
  const Hv = b.H, im = Hv && Hv.img; if (im) { const ds = im.ds || 1, s = 1.1, w = im.width * ds * s, h = im.height * ds * s; x.save(); x.beginPath(); x.rect(-W, -hh / 2 + 2, W * 2, hh - 4); x.clip(); x.imageSmoothingEnabled = false; x.drawImage(im, -W / 2 + 2 - (t < 8 ? (8 - t) * 2 : 0), hh / 2 - h * 0.8, w, h); x.restore(); }
  x.restore();
  x.save(); x.globalAlpha = a; const sc = t < 6 ? 1.6 - t * 0.1 : 1; x.translate(W / 2 + 26, cy - 6); x.rotate(-0.16); x.scale(sc, sc); KB12.num(x, c.s, 0, 0, '#fff6d8', 18); x.restore(); }
/* ---------- 頭目・菁英登場：名字大字 ---------- */
function drawName26(b, x) { const c = b.name26; if (!c) return; const t = c.t, L = c.life, a = t < 6 ? t / 6 : t > L - 14 ? Math.max(0, (L - t) / 14) : 1, E = TALL_EXT || 0, cy = E >= 40 ? 70 - E : 60;
  x.save(); x.globalAlpha = a; x.fillStyle = '#0c1020'; x.fillRect(0, cy - 17, W, 34); x.fillStyle = GBA26.line; x.fillRect(0, cy - 15, W, 30); x.fillStyle = c.boss ? '#4a1820' : '#3a2c10'; x.fillRect(0, cy - 13, W, 26);
  KB12.tc(x, c.boss ? '頭目' : '菁英', W / 2, cy - 7, c.boss ? '#ff8a7a' : '#ffd27a', KB12.S);
  const sc = t < 8 ? 1.5 - t * 0.0625 : 1; x.translate(W / 2, cy + 6); x.scale(sc, sc); KB12.num(x, c.s, 0, 0, '#ffffff', 18); x.restore(); }
