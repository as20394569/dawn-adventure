/* ===================== v14.15 戰鬥畫面：主角不上場、怪物往下、名牌縮小 =====================
   玩家：「因為沒有紙娃娃了 感覺主角也不用在畫面了 然後我想把調整戰鬥畫面怪物的位置 然後怪物血量面板可以縮小一點」
   選了：怪物往下移到畫面中間（主角的空位讓給怪物）、名牌縮成兩行。
   · 主角不畫了：挨打的數字、狀態跳在 HP 列上（主角的位置＝HP 列）；卡的特效從畫面下方出發
   · 怪物：往下移到原本位置和 HP 列上方的中間
   · 名牌兩行：第一行名字＋盾牌（破防值），第二行細血條＋弱點方塊（約一半高）
   · 狀態（格擋・毒・燃燒・易傷・虛弱・力量）：每隻怪物腳下一排小字（以前三隻怪物時名牌下沒有顯示）；主角的在 HP 列上方 */
KD.stRow16 = 1;
const kOn16 = b => !!(b && (b.k14 || (b.core && KD.on(b.core))) && !Game.noV14);

/* ---------- 主角：不畫，位置＝HP 列 ---------- */
{ const _r = render; render = function () { const b = Game.scene; if (b instanceof Battle && kOn16(b) && b.core && KD.on(b.core)) { const f = KD.BL().hudY + 27; if (f !== HERO_FOOT) { HERO_FOOT = f; HERO_Y = f - 64; HBAR_Y = f + 5; } }
    else { const f = 200 + bxE(); if (f !== HERO_FOOT) { HERO_FOOT = f; HERO_Y = 136 + bxE(); HBAR_Y = 205 + bxE(); } }
    return _r.apply(this, arguments); }; }
{ const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) { const Hv = this.H; if (!kOn16(this) || !Hv) return _dr.call(this, x); const b0 = Hv.blink; Hv.blink = 3; // the draw skips a blinking hero
    try { return _dr.call(this, x); } finally { Hv.blink = b0; } }; }
// the old pills beside the hero / the old ailment and ward tags: the status row above the HP bar instead
{ const _db = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) { if (!kOn16(this)) return _db.call(this, x); const Hv = this.H, sv = Hv && Hv.st; if (Hv && sv) Hv.st = { blk15: sv.blk15 }; try { _db.call(this, x); } finally { if (Hv) Hv.st = sv; }
    if (!Hv || !sv || this.boxF < -20) return; const L = KD.chips16(sv, true); if (!L.length) return; const LB = KD.BL(); KD.chipRow16(x, L, 2, LB.hudY - 12, W - 4, 'l'); }; }

/* ---------- 狀態的小字 ---------- */
KD.CHIP16 = [['blk15', '盾', '#bfe0ff', '#14284a'], ['str15', '力', '#ffb0a0', '#4a1810'], ['tstr14', '力', '#ffb0a0', '#4a1810'], ['pois14', '毒', '#a8f088', '#16361a'], ['burn14', '燒', '#ffc078', '#4a2008'],
  ['bleed15', '血', '#ff9090', '#401010'], ['vuln15', '易', '#e0b8ff', '#2e1848'], ['weak15', '弱', '#c0cce0', '#222a3a'], ['nxa14', '勢', '#ffe080', '#3a3008']];
KD.chips16 = (st, hero) => { const L = []; for (const [k, n, c, bg] of KD.CHIP16) { if (hero && k === 'blk15') continue; const v = st[k]; if (v > 0) L.push([n + v, c, bg]); } return L; };
KD.chipW16 = s => Math.ceil(Font.width(s, 8)) + 4;
KD.chipRow16 = (x, L, X, Y, maxW, align) => { const ws = L.map(([s]) => KD.chipW16(s)); const rows = [[]]; let w = 0;
  L.forEach((q, i) => { if (w + ws[i] > maxW && rows[rows.length - 1].length) { rows.push([]); w = 0; } rows[rows.length - 1].push(i); w += ws[i] + 1; });
  rows.forEach((R, r) => { const tw = R.reduce((a, i) => a + ws[i] + 1, -1); let z = align === 'c' ? Math.round(X - tw / 2) : X; for (const i of R) { const [s, c, bg] = L[i];
      x.fillStyle = 'rgba(0,0,0,0.85)'; x.fillRect(z - 1, Y + r * 11 - 1, ws[i] + 2, 12); x.fillStyle = bg; x.fillRect(z, Y + r * 11, ws[i], 10); Font.draw(x, s, z + 2, Y + r * 11 - 3, c, null, 8); z += ws[i] + 1; } }); };
// under each monster's feet (the block used to sit there alone)
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); if (!kOn16(this) || this.boxF < -20) return; const n = this.foes().length, sw = Math.floor((W - 4) / Math.max(1, n));
    for (const v of this.foes()) { if (v.gone || v.alpha < 0.5 || !v.st) continue; const L = KD.chips16(v.st, false); if (!L.length) continue; KD.chipRow16(x, L, clamp(Math.round(v.x + v.off.x), 20, W - 20), Math.round(v.foot + 3), sw - 2, 'c'); } }; }

/* ---------- 怪物的位置：玩家看了截圖後選「回到原本的高度」（往下移的版本沒上線） ---------- */

/* ---------- 名牌下面一排：行動順序（左）、天氣・×2（右） ---------- */
{ const _do = Battle.prototype.drawOrder; Battle.prototype.drawOrder = function (x) { if (!kOn16(this)) return _do.call(this, x);
    const O = this.order12; if (!O || !O.ids.length || this.boxF < -20) return; const done = O.done || 0, ids = O.ids, Y = 29; let X = 2; const cur = ids.findIndex((id, i) => i >= done && this.views[id] && !this.views[id].gone);
    ids.forEach((id, i) => { const v = this.views[id]; if (!v || v.gone || X > W - 52) return; const past = i < done, on = i === cur, hero = v.hero, ch = this.ordLabel13 ? this.ordLabel13(v) : (v.n || '?').slice(0, 1);
      x.globalAlpha = past ? 0.4 : 1; x.fillStyle = on ? '#ffd860' : hero ? '#3a6aa0' : '#7a2a34'; x.fillRect(X, Y, 14, 12); x.fillStyle = '#0b0d18'; x.fillRect(X + 1, Y + 1, 12, 10);
      fontFit(x, ch, X + 7, midY(Y, 12, 8), 12, on ? '#ffe8b0' : hero ? '#bfe0ff' : '#ffc8c8', UIC.textSh, 8, 'c'); x.globalAlpha = 1; if (on) { x.fillStyle = '#ffd860'; x.fillRect(X + 5, Y + 13, 4, 2); } X += 15; }); }; }
{ const _wi = wxIcon; wxIcon = function (x, k, X, Y) { const b = Game.scene; if (b instanceof Battle && kOn16(b) && X === W - 13 && Y === 46) { X = W - 31; Y = 30; } return _wi(x, k, X, Y); }; }

/* ---------- 名牌：兩行 ---------- */
KD.plate16 = function (x, v, X, Y, w, on, a) { if (a <= 0) return; const u = this.core.byId[v.id], rim = on ? '#ffd860' : v.boss ? '#ff6b7a' : v.elite ? '#ffc46b' : v.rare ? '#ffd84a' : v.minion ? '#b08a6a' : '#8a93b3', h = 23;
  x.globalAlpha = a; x.fillStyle = 'rgba(10,8,20,0.8)'; x.fillRect(X, Y, w, h); x.fillStyle = rim; x.fillRect(X + 1, Y, w - 2, 1); x.fillRect(X + 1, Y + h - 1, w - 2, 1); x.fillRect(X, Y + 1, 1, h - 2); x.fillRect(X + w - 1, Y + 1, 1, h - 2);
  // row 1: the name (and 頭目 / 菁英 on a single plate) · the shield
  const brk = v.max && v.max.brk ? (v.broken > 0 ? '破' : String(v.res.brk || 0)) : null, bw = brk ? 10 + Math.ceil(Font.width(brk, 8)) + 2 : 0, tag = w >= 90 ? (v.rare ? '稀有' : v.boss ? '頭目' : v.elite ? '菁英' : '') : '', tw = tag ? Math.ceil(Font.width(tag, 8)) + 4 : 0;
  fontFit(x, v.n, X + 3, Y - 2, w - 6 - bw - tw, on ? '#ffe8b0' : UIC.text, UIC.textSh, 8); if (tag) Font.drawR(x, tag, X + w - 3 - bw, Y - 2, rim, UIC.textSh, 8);
  if (brk) KD.brkMini(x, X + w - bw, Y + 2, v.res.brk || 0, v.broken > 0);
  // row 2: a thin HP bar · the weaknesses
  const W16 = (u && u.data && u.data.wk16) || [], ww = W16.length * 11, r = clamp(v.hp / v.maxhp, 0, 1), bx = X + 3, bwid = Math.max(8, w - 6 - ww - (ww ? 2 : 0));
  x.fillStyle = '#1a1024'; x.fillRect(bx, Y + 15, bwid, 3); x.fillStyle = r > 0.5 ? '#e0504a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(bx, Y + 15, Math.round(bwid * r), 3);
  if (v.st && v.st.ward > 0) { x.fillStyle = '#7ec8ff'; x.fillRect(bx, Y + 13, Math.round(bwid * clamp(v.st.ward / (v.st.wardMax || 1), 0, 1)), 1); }
  if (ww) KD.wkRow(x, { sp: v.sp, data: u && u.data }, X + w - 2 - ww + 1, Y + 12);
  x.globalAlpha = 1; };
{ const B = Battle.prototype, _ps = B.drawPlateSmall, _pb = B.drawPlateBig;
  B.drawPlateSmall = function (x, v, a, i, n) { if (!kOn16(this)) return _ps.call(this, x, v, a, i, n); const sw = Math.floor((W - 4) / Math.max(1, n)), w = Math.min(n >= 3 ? 56 : 80, sw - 2), X = Math.round(clamp(v.x - w / 2, 2 + i * sw, 2 + i * sw + sw - 2 - w));
    KD.plate16.call(this, x, v, X, 3, w, this.pickV === v, a); };
  B.drawPlateBig = function (x, F, a0) { if (!kOn16(this)) return _pb.call(this, x, F, a0); const w = 112; KD.plate16.call(this, x, F, Math.round((W - w) / 2), 3, w, false, a0 * (F.plateA != null ? F.plateA : 1)); }; }
