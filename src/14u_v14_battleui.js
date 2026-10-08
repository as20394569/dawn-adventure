/* ===================== v14.24 戰鬥畫面重新設計（照設計稿〈曙光冒險 戰鬥畫面重新設計〉，玩家：「可以」） =====================
   玩家：「重新設計整個戰鬥畫面ui 包刮文字 還有遊戲中出現的浮動文字 版面都重新設計」
   · 名牌：從畫面最上面搬到每隻魔物腳下（名字・破防值／HP 條＋數字／弱點・狀態），同一排對齊
   · 上方：左上一個「第 N 回合」小框；選到卡的說明和戰鬥訊息都在畫面上方（14c）
   · 浮動文字：打魔物＝特大白字（弱點金・會心橘・破防紅牌子）；主角受傷＝大字紅、從 HP 條往上；
     狀態・格擋擋下＝跟腳下狀態同一種小牌子；破防・影縛・元素反應＝橫過戰場的一條帶子（一次一條）
   字只用 小 5・中 7・大 10・特大 14；框都是 KD.pan */
KD.UI24 = 1;
// the old plates at the top: not in a card battle
{ const B = Battle.prototype, _ps = B.drawPlateSmall, _pb = B.drawPlateBig;
  B.drawPlateSmall = function (x, v, a, i, n) { if (this.k14) return; return _ps.call(this, x, v, a, i, n); };
  B.drawPlateBig = function (x, F, a0) { if (this.k14) return; return _pb.call(this, x, F, a0); }; }

/* ---------- 魔物腳下的名牌 ---------- */
KD.foePlate24 = function (x) { const all = this.foes(), F = all.filter(v => !v.gone && v.alpha > 0.3); if (!F.length) return; const Q = KD.UI, LB = KD.BL(), n = all.length, sw = Math.floor((W - 4) / Math.max(1, n)), core = this.core;
  const top0 = Math.max(...F.map(v => Math.round(v.foot) + 3)), bw = Math.min(60, sw - 3), S = F.slice().sort((a, b) => a.x - b.x), PX = new Map(); let r = 1;
  for (const v of S) { const X = Math.max(r + 1, Math.round(v.x + v.off.x - bw / 2)); PX.set(v, X); r = X + bw; } // under each monster, in the order they stand, never overlapping
  let over = r - (W - 2); if (over > 0) for (let k = S.length - 1; k >= 0 && over > 0; k--) { const v = S[k], X = PX.get(v), nx = Math.max(k ? PX.get(S[k - 1]) + bw + 1 : 2, X - over); PX.set(v, nx); if (k < S.length - 1) PX.set(S[k + 1], Math.min(PX.get(S[k + 1]), nx + bw + 1)); over = PX.get(S[S.length - 1]) + bw - (W - 2); }
  for (const v of F) { const u = core.byId[v.id], X = PX.get(v);
    const wk = (u && u.data && u.data.wk16) || [], chips = KD.chips16(v.st || {}, false), cw = chips.map(([s]) => Math.ceil(Font.width(s, Q.S)) + 4), row3 = bw - 6 - wk.length * 9, fit = cw.reduce((a, w) => a + w + 1, 0) <= row3;
    const extra = !chips.length || fit ? 0 : 8, bh = 28 + extra, Y = Math.min(top0, LB.hudY - 3 - bh), rim = this.pickV === v ? '#ffd860' : v.boss ? '#ff6b7a' : v.elite ? '#ffc46b' : v.rare ? '#ffd84a' : null;
    x.globalAlpha = Math.min(1, v.alpha); KD.pan(x, X, Y, bw, bh, rim);
    // row 1: the name (and 頭目・菁英・稀有), the shield on the right
    const brk = v.max && v.max.brk ? (v.broken > 0 ? '破' : String(v.res.brk || 0)) : null, bkw = brk ? 8 + Math.ceil(Font.width(brk, Q.S)) + 1 : 0, tag = v.rare ? '稀有' : v.boss ? '頭目' : v.elite ? '菁英' : '', tw = tag ? Math.ceil(Font.width(tag, Q.S)) + 3 : 0;
    const nx = Font.w('700', () => fontFit(x, v.n, X + 3, Y + 6.5 - 8, bw - 7 - bkw - tw, Q.txt, '#000', Q.M)); if (tag) Font.w('700', () => Font.draw(x, tag, nx + 2, Y + 6.5 - 7.4, rim || Q.mut, '#000', Q.S));
    if (brk) KD.brkMini(x, X + bw - 3 - bkw + 1, Y + 3, v.res.brk || 0, v.broken > 0);
    // row 2: the HP bar with its numbers
    const r = clamp(v.hp / Math.max(1, v.maxhp), 0, 1), hx = X + 3, hw = bw - 6; x.fillStyle = '#3a1418'; x.fillRect(hx, Y + 11, hw, 6); x.fillStyle = r > 0.5 ? '#d8443a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(hx, Y + 11, Math.round(hw * r), 6);
    if (v.st && v.st.ward > 0) { x.fillStyle = '#7ec8ff'; x.fillRect(hx, Y + 10, Math.round(hw * clamp(v.st.ward / (v.st.wardMax || 1), 0, 1)), 1); }
    Font.w('700', () => KD.tc(x, Math.max(0, Math.ceil(v.hp)) + '/' + v.maxhp, hx + hw / 2, Y + 14, '#fff4f4', '#000', Q.S, hw - 2));
    // row 3: the weaknesses on the left, the statuses on the right (a second row when they don't fit)
    if (wk.length) KD.wkRow(x, { sp: v.sp, data: u && u.data }, X + 3, Y + 19, 7);
    let cx = X + bw - 3, cy = fit ? Y + 19 : Y + 27; if (!fit) cx = X + 3 + cw.reduce((a, w) => a + w + 1, -1);
    for (let k = chips.length - 1; k >= 0; k--) { const [s, c, bg] = chips[k], w = cw[k]; cx -= w; x.fillStyle = bg; x.fillRect(cx, cy, w, 7); Font.w('700', () => KD.tc(x, s, cx + w / 2, cy + 3.5, c, null, Q.S)); cx -= 1; }
    x.globalAlpha = 1; } };
/* ---------- 左上：第幾回合 ---------- */
KD.round24 = function (x) { const s = '第 ' + (this.turns || 1) + ' 回合', w = Math.ceil(Font.width(s, KD.UI.S)) + 8; KD.pan(x, 3, 2, w, 9); Font.w('700', () => KD.tc(x, s, 3 + w / 2, 6.5, KD.UI.mut, null, KD.UI.S)); };
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); if (!this.k14 || this.boxF < -20) return; KD.foePlate24.call(this, x); KD.round24.call(this, x); }; }

/* ---------- 浮動文字 ---------- */
// numbers on the hero: above the HP bar (not where the old hero sprite stood)
{ const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o = {}) { const n0 = this.pops.length; _pn.call(this, v, s, c, tag, o); if (!this.k14) return;
    for (let i = n0; i < this.pops.length; i++) { const p = this.pops[i]; p.h24 = !!(v && v.hero); p.u24 = v; if (p.w14) continue;
      if (p.h24) { p.x = 81 + rnd(-8, 8); p.y = KD.BL().hudY + 3; } /* on the HP bar, rising a little */ else if (v && !v.hero) { const C = this.center(v); p.y = C.y - 2 + (o.dy || 0) * 0.3; } /* the middle of the monster (it used to be up on the intent sign) */ } }; }
KD.TAG24 = { 弱點: ['#ffd27a', '#2a1404'], 會心: ['#ff9a50', '#2a1404'], 破防: ['#d8443a', '#ffffff'], 重擊: ['#d8443a', '#ffffff'] };
const num24 = s => /^[+\-−]?\d/.test(String(s));
// a word: a small sign in its own colour on a dark ground (the same as the statuses under the feet)
KD.sign24 = (x, s, cx, cy, col, big) => { const Q = KD.UI, z = big ? Q.M : Q.S, h = big ? 11 : 8, w = Math.ceil(Font.w('700', () => Font.width(s, z))) + 6, X = Math.round(cx - w / 2), Y = Math.round(cy - h / 2);
  x.fillStyle = '#1a0a10'; x.fillRect(X - 1, Y - 1, w + 2, h + 2); x.fillStyle = '#14101c'; x.fillRect(X, Y, w, h); x.globalAlpha *= 0.28; x.fillStyle = col; x.fillRect(X, Y, w, h); x.globalAlpha /= 0.28;
  Font.w('700', () => KD.tc(x, s, cx, Y + h / 2, col, null, z)); };
// a number with a dark rim; its tag sits above it as a sign
KD.num24 = (x, s, cx, cy, col, z) => Font.w('700', () => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) KD.tc(x, s, cx + dx * 0.9, cy + dy * 0.9, '#1a0a10', null, z); KD.tc(x, s, cx, cy, col, null, z); });
KD.ribbon24 = function (x, p) { const life = 60, t = p.t, a = t < 6 ? t / 6 : t > life - 12 ? Math.max(0, (life - t) / 12) : 1, cy = 45, s = p.s === 'BREAK!' ? '破防！' : p.s, col = p.s === 'BREAK!' ? '#ffcf6a' : p.c || '#ffcf6a';
  x.globalAlpha = a; const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(20,12,4,0)'); g.addColorStop(0.2, 'rgba(20,12,4,0.88)'); g.addColorStop(0.8, 'rgba(20,12,4,0.88)'); g.addColorStop(1, 'rgba(20,12,4,0)'); x.fillStyle = g; x.fillRect(0, cy - 9, W, 18);
  const gl = x.createLinearGradient(0, 0, W, 0); gl.addColorStop(0, 'rgba(255,207,106,0)'); gl.addColorStop(0.2, 'rgba(255,207,106,0.7)'); gl.addColorStop(0.8, 'rgba(255,207,106,0.7)'); gl.addColorStop(1, 'rgba(255,207,106,0)'); x.fillStyle = gl; x.fillRect(0, cy - 10, W, 1); x.fillRect(0, cy + 9, W, 1);
  const z = KD.UI.L, sc = t < 5 ? 0.85 + t * 0.03 : 1, chars = [...s], gap = 3, tw = chars.reduce((q, ch) => q + Font.w('700', () => Font.width(ch, z)) + gap, -gap); x.save(); x.translate(W / 2, cy); x.scale(sc, sc);
  let X = -tw / 2; for (const ch of chars) { const cw = Font.w('700', () => Font.width(ch, z)); KD.num24(x, ch, X + cw / 2, 0, col, z); X += cw + gap; } x.restore(); x.globalAlpha = 1; };
KD.pops24 = function (x) { const L = this.pops, Q = KD.UI, LB = KD.BL();
  // the big events: one band at a time (the newest)
  const R = L.filter(p => p.big && !p.w14 && !p.tag && !num24(p.s)); if (R.length) KD.ribbon24.call(this, x, R[R.length - 1]);
  // words: a column per unit, newest at the bottom, at most 3
  const G = new Map(); for (const p of L) { if (num24(p.s) || (p.big && !p.w14 && !p.tag)) continue; const k = p.u14 || p.u24 || ('x' + Math.round(p.x / 24)); (G.get(k) || G.set(k, []).get(k)).push(p); }
  for (const [k, A] of G) { const v = typeof k === 'object' ? k : null, hero = v && v.hero, live = A.filter(p => p.t < (p.big ? 60 : 44)).slice(v && !hero && (v.bbh || 48) < 56 ? -2 : -3);
    // a monster's words: up from its feet (the number is in its middle); the hero's: on the right half of the HP bar
    const cx = hero ? 104 : v ? v.x + (v.off ? v.off.x : 0) : live.length ? live[0].x : W / 2, base = hero ? LB.hudY + 12 : v ? Math.round(v.foot) - 2 : live.length ? live[0].y : 100;
    let y = base; for (let i = live.length - 1; i >= 0; i--) { const p = live[i], life = p.big ? 60 : 44, a = p.t > life - 12 ? (life - p.t) / 12 : Math.min(1, 0.4 + p.t * 0.2), h = p.big ? 11 : 8;
      x.globalAlpha = clamp(a, 0, 1); KD.sign24(x, p.s, clamp(cx, 20, W - 20), y - Math.min(4, p.t * 0.3) - h / 2, p.c || Q.txt, p.big); y -= h + 3; } x.globalAlpha = 1; }
  // numbers: on a monster 特大 14 (white; gold on a weakness, orange on a critical hit), on the hero 大 10 red above the HP bar; heals green
  for (const p of L) { if (!num24(p.s) || p.w14) continue; const life = p.big ? 60 : 44, t = p.t, a = t > life - 12 ? (life - t) / 12 : 1, rise = Math.min(p.h24 ? 6 : 8, t * 0.9), sc = t < 3 ? 0.7 + t * 0.12 : t < 7 ? 1.06 - (t - 3) * 0.015 : 1;
    const heal = /^\+/.test(String(p.s)), z = p.h24 ? Q.L : p.small ? Q.L : 14, col = p.h24 ? (heal ? '#7ae29a' : '#ff6a5a') : heal ? '#7ae29a' : p.tag === '弱點' ? '#ffd27a' : p.tag === '會心' ? '#ff9a50' : p.c === '#ffd040' ? '#ffd27a' : p.c || '#ffffff';
    const s = String(p.s).replace(/^-/, '−'), cy = p.y - rise; x.globalAlpha = clamp(a, 0, 1); x.save(); x.translate(p.x, cy); x.scale(sc, sc); KD.num24(x, s, 0, 0, col, z); x.restore();
    const T = p.tag && KD.TAG24[p.tag]; if (T) { const w = Math.ceil(Font.w('700', () => Font.width(p.tag, Q.S))) + 6, ty = Math.round(cy - z / 2 - 7); x.fillStyle = '#1a0a10'; x.fillRect(Math.round(p.x - w / 2) - 1, ty - 1, w + 2, 9); x.fillStyle = T[0]; x.fillRect(Math.round(p.x - w / 2), ty, w, 7); Font.w('700', () => KD.tc(x, p.tag, p.x, ty + 3.5, T[1], null, Q.S)); }
    x.globalAlpha = 1; } };
{ const _dp = Battle.prototype.drawPops; Battle.prototype.drawPops = function (x) { if (!this.k14) return _dp.call(this, x); KD.pops24.call(this, x); }; }

/* ---------- v14.25 魔物往上（玩家：「合理運用空間」）：名牌剛好停在下方欄上面，上方的空白讓給手牌 ---------- */
KD.lift24 = b => { const F = b.foes(); if (!F.length) return; const dy = KD.BL().hudY - 35 - Math.max(...F.map(v => v.foot)); if (dy) for (const v of F) v.foot += dy; };
{ const _ly = Battle.prototype.layout; Battle.prototype.layout = function (snap) { _ly.call(this, snap); if (this.k14) KD.lift24(this); }; }
{ const _ik = Battle.prototype.initK; Battle.prototype.initK = function () { const r = _ik.call(this); KD.lift24(this); return r; }; } // the first layout runs before the card battle starts
