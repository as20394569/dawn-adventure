/* ===================== v12.148 頭目・菁英放大，特效也跟著放大 =====================
   玩家 2026-10-12：「為了展現 boss 與菁英的壓迫感，他們戰鬥時要放大 2 倍，特效也是」
   · 頭目和菁英（含懸賞・洞窟之主・在地圖上走的菁英）在戰鬥裡畫成最多 2 倍大：腳站在原本的位置，往上長。
     手機直拿、畫面拉長時大多是 2 倍；頭頂要留給「下一步要做什麼」的小框，所以特別高大的頭目（古岩魔像這種）會是 1.75〜1.9 倍；
     畫面沒拉長（橫拿・電腦）上面沒空間，就照原本大小。放大是用高解析度重畫，像素不會糊。
   · 特效：頭目・菁英出手的那一下，噴出來的特效（斬擊・光環・火花・光球…）每一顆都放大到同樣倍數（位置不變，以自己為中心放大），
     打在主角身上的也是，所以挨頭目一下特別重。v12.151：主角（和夥伴）打牠的特效不放大，照原本大小。全畫面的閃光・變暗、文字、閃電和光束不放大（放大會跑出畫面或錯位）。
   · 傷害數字・名牌・狀態小牌子跟著新的身體大小排（數字在身體中間，小牌子在頭頂）；長按看狀態也是。
   · 跟其他魔物一起出現時，大隻的站後面（三隻時站中間），其他的往兩邊、往前靠一點，少擋一點。 */
Battle.prototype.bigS22 = function (v, h0) { if (!v || v.hero || !(v.boss || v.elite) || !(h0 > 0)) return 1;
  const E = TALL_EXT || 0, minTop = 15 - E + 13 + 6; return clamp(Math.floor((v.foot - minTop) / h0 * 4) / 4, 1, 2); };
{ const _rf = Battle.prototype.renderFoe; Battle.prototype.renderFoe = function (v, tint) { const im = _rf.call(this, v, tint); if (!im || !im.bb) return im;
    const s = this.bigS22(v, im.bb.h); if (!tint) v.s22 = s; if (s <= 1) return im;
    const ds = im.ds || 1, K = Math.max(1, Math.min(4, SCALE | 0)), w = Math.ceil(im.width * ds * s * K), h = Math.ceil(im.height * ds * s * K), key = tint ? 'big22T' : 'big22';
    let c = v[key]; if (!c || c.width !== w || c.height !== h) c = v[key] = mkCanvas(w, h);
    const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.imageSmoothingEnabled = !im.px && !HD_PIXEL; x.drawImage(im, 0, 0, w, h);
    const b = im.bb; c.ds = 1 / K; c.px = im.px; c.bb = { ...b, cx: b.cx * s, top: b.top * s, bot: b.bot * s, w: b.w * s, h: b.h * s }; if (b.vw) c.bb.vw = b.vw * s; return c; }; }
// 特效：大隻自己出手時，噴出來的特效每一顆放大（v12.151 玩家：主角的攻擊特效不要放大）
{ const B = Battle.prototype, _oe = B.onEvent; B.onEvent = function* (e) { const prev = this.fxS22 || 1; let s = 1;
    if (e && e.src) { const v = this.views && this.views[e.src]; if (v && !v.hero && v.s22 > s) s = v.s22; } // v12.151 只有大隻自己出手才放大（主角打牠的特效照原本大小）
    this.fxS22 = Math.max(prev, s); try { return yield* _oe.call(this, e); } finally { this.fxS22 = prev; } };
  const _sp = B.spawn; B.spawn = function (p) { const r = _sp.call(this, p); if (p && (this.fxS22 || 1) > 1 && p.sc22 == null) p.sc22 = this.fxS22; return r; }; }
const NOSC22 = new Set(['flash', 'dark', 'txt', 'bolt', 'beam', 'uifx']);
{ const _dp = drawParticle; drawParticle = function (x, p) { const s = p && p.sc22; if (!(s > 1) || NOSC22.has(p.k)) return _dp(x, p);
    const ax = p.k === 'line' ? (p.x1 + p.x2) / 2 : p.x, ay = p.k === 'line' ? (p.y1 + p.y2) / 2 : p.y; if (!isFinite(ax) || !isFinite(ay)) return _dp(x, p);
    x.save(); x.translate(ax, ay); x.scale(s, s); x.translate(-ax, -ay); try { return _dp(x, p); } finally { x.restore(); } }; }
// 跟其他魔物一起：大隻的站中間後面，其他的往兩邊靠
{ const _ly = Battle.prototype.layout; Battle.prototype.layout = function (snap) { _ly.call(this, snap); const L = this.foes(), n = Math.min(3, L.length); if (n < 2) return;
    const big = L.find(v => v.boss) || L.find(v => v.elite); if (!big) return; const others = L.filter(v => v !== big).sort((a, b) => a.tx - b.tx);
    if (n === 2) { const o = others[0], fb = Math.min(big.foot, o.foot), fo = Math.max(big.foot, o.foot); big.foot = fb; o.foot = fo; if (big.foot0 != null) { big.foot0 = fb; o.foot0 = fo; } big.tx = 70; o.tx = 146; } // 大隻的站後面
    else { others[0].tx = 26; if (others[1]) others[1].tx = 150; big.tx = 88; }
    if (snap) for (const v of L) v.x = v.tx; }; }
