/* ===================== v12.7 異常狀態看得出來（玩家 2026-10-05：「玩家說不夠明顯」→ 看不出中了異常；選「身上的特效和顏色」「大標籤＋剩幾回合」「發作時跳大字」） =====================
   1. 身上：中毒冒紫色泡泡、灼傷冒小火苗、麻痺閃黃色電光、睡眠飄 Z；身體帶一點那個顏色（麻痺一閃一閃）。
   2. 標籤：名牌下面和主角旁邊直接寫「中毒 3」（剩幾回合），取代原本的小圖示。
   3. 跳字：中了時頭上跳「中毒！」、每回合扣血時標「中毒」、麻痺・睡眠動不了時跳「麻痺！」「睡著了」。 */
const AIL12 = {
  psn: { n: '中毒', c: '#d890ff', bg: 'rgba(70,20,96,0.92)', tint: '#b040e0' },
  brn: { n: '灼傷', c: '#ffa060', bg: 'rgba(96,30,10,0.92)', tint: '#ff5020' },
  par: { n: '麻痺', c: '#ffe860', bg: 'rgba(80,66,10,0.92)', tint: '#ffe040' },
  slp: { n: '睡眠', c: '#b8d0ff', bg: 'rgba(24,40,84,0.92)', tint: '#5070c0' },
};
const ailOf12 = v => v && v.st ? Object.keys(AIL12).find(k => v.st[k]) || null : null;

/* ---------- 1. 身上的特效和顏色 ---------- */
{ const _up = Battle.prototype.update; Battle.prototype.update = function () { _up.call(this);
    for (const v of Object.values(this.views)) { const k = ailOf12(v); if (!k || v.gone || !(v.hp > 0)) continue;
      const C = this.center(v), w = v.hero ? 12 : 16, h = v.hero ? 18 : Math.max(24, (v.bbh || 48) * 0.45), t = this.t + (v.hero ? 0 : 7);
      if (k === 'psn' && t % 10 === 0) this.spawn({ k: 'bub', x: C.x + rnd(-w, w), y: C.y + rnd(-h * 0.2, h * 0.6), vx: rnd(-1, 1) * 0.15, vy: -0.5, r: pick([1.5, 2, 2.5]), c: '#d890ff', life: 32 });
      if (k === 'brn' && t % 5 === 0) this.spawn({ k: 'flame', x: C.x + rnd(-w, w), y: C.y + rnd(0, h * 0.8), vy: -0.7, s: pick([3, 4, 5]), life: 16 });
      if (k === 'par' && t % 22 === 0) { const pts = []; let x0 = C.x + rnd(-w, w), y0 = C.y - h * 0.6; for (let i = 0; i < 4; i++) { pts.push([x0, y0]); x0 += rnd(-6, 6); y0 += rnd(5, 9); } this.spawn({ k: 'bolt', pts, w: 2, life: 6 }); }
      if (k === 'slp' && t % 30 === 0) this.spawn({ k: 'txt', s: 'Z', x: C.x + 8 + rnd(-3, 3), y: C.y - h, vx: 0.2, vy: -0.4, c: '#c8dcff', sh: '#000000', fade: 1, life: 44 }); } }; }
{ const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) { const L = [];
    for (const v of Object.values(this.views)) { const k = ailOf12(v); if (!k || v.tint || v.gone || !(v.hp > 0)) continue;
      const a = k === 'par' ? (Math.floor(this.t / 4) % 4 === 0 ? 0.42 : 0.1) : 0.14 + 0.14 * (0.5 + 0.5 * Math.sin(this.t * 0.12)); v.tint = { c: AIL12[k].tint, a }; L.push(v); }
    try { return _dr.call(this, x); } finally { for (const v of L) v.tint = null; } }; }

/* ---------- 2. 標籤＋剩幾回合 ---------- */
{ const _b = Battle.prototype.badges; Battle.prototype.badges = function (v) { return _b.call(this, v).filter(k => !AIL12[k]); }; }
function ailTag12(x, X, Y, v, right) { const k = ailOf12(v); if (!k) return 0; const A = AIL12[k], d = v.ailDur12, s = A.n + (d > 0 ? ' ' + d : ''), w = Math.ceil(Font.width(s, 9)) + 10;
  if (right) X -= w; x.fillStyle = A.bg; x.fillRect(X, Y, w, 12); x.fillStyle = A.c; x.fillRect(X, Y, w, 1); x.fillRect(X, Y + 11, w, 1); x.fillRect(X, Y, 1, 12); x.fillRect(X + w - 1, Y, 1, 12);
  Font.draw(x, s, X + 5, Y - 2, A.c, '#000000', 9); return w; }
{ const _pb = Battle.prototype.drawPlateBig; Battle.prototype.drawPlateBig = function (x, F, a0) { _pb.call(this, x, F, a0); const a = a0 * (F && F.plateA != null ? F.plateA : 1); if (!F || a <= 0 || !ailOf12(F)) return;
    x.globalAlpha = a; const w = 120, X = (W - w) / 2, pe = plateExtra(); ailTag12(x, X + w - 4, 6 + 33 + pe, F, true); x.globalAlpha = 1; }; }
{ const _ps = Battle.prototype.drawPlateSmall; Battle.prototype.drawPlateSmall = function (x, v, a, i, n) { _ps.call(this, x, v, a, i, n); if (!v || a <= 0 || !ailOf12(v)) return;
    const sw = Math.floor((W - 4) / Math.max(1, n)), w = Math.min(n >= 3 ? 56 : 80, sw - 2), X = Math.round(clamp(v.x - w / 2, 2 + i * sw, 2 + i * sw + sw - 2 - w));
    x.globalAlpha = a; ailTag12(x, X, 4 + 36, v); x.globalAlpha = 1; }; }
{ const _db = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) { _db.call(this, x); const Hv = this.H; if (!Hv || !ailOf12(Hv) || Math.round(this.boxH) >= BH) return;
    const C = this.center(Hv); ailTag12(x, Math.max(2, Math.round(C.x - 66 + Hv.off.x)), Math.round(HERO_FOOT - 28 + Hv.off.y), Hv); }; }
// the turns left come from the battle's own status (refreshed after every played action)
{ const _sy = Battle.prototype.sync; Battle.prototype.sync = function () { _sy.call(this);
    for (const u of this.core.units) { const v = this.views[u.id]; if (!v) continue; const m = this.core.majorOf(u), s = m && this.core.statusOf(u, m); v.ailDur12 = s && s.dur != null ? s.dur : null; } }; }

/* ---------- 3. 跳字 ---------- */
{ const H = Battle.prototype.handlers;
  const _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) { if (t && !P.failed && !P.cleared && AIL12[P.status]) { const A = AIL12[P.status]; t.ailDur12 = P.dur != null ? P.dur : null; this.popNum(t, A.n + '！', A.c, null, { big: true, dy: -12 }); }
    return yield* _ap.call(this, e, s, t, P); };
  const _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) { if (t && P.kind === 'dot' && AIL12[P.el]) this.popNum(t, AIL12[P.el].n, AIL12[P.el].c, null, { small: true, dy: -14 });
    return yield* _dm.call(this, e, s, t, P); };
  const _ac = H.ACTION_CANCEL; H.ACTION_CANCEL = function* (e, s, t, P) { if (s && (P.why === 'par' || P.why === 'slp')) this.popNum(s, P.why === 'par' ? '麻痺！動不了' : '睡著了…', AIL12[P.why].c, null, { big: true, dy: -12 });
    return yield* _ac.call(this, e, s, t, P); }; }
