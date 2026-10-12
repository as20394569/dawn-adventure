/* ===================== v12.154 魔物名牌固定排在畫面上方一排 =====================
   玩家 2026-10-12：「怪物放招式時怪物名牌會被擋住，戰鬥畫面的 UI 可能要調整」
   查到：① 特效播放時名牌淡到 25%（v12.128 名牌還在腳下時為了不擋特效才這樣做，搬到頭上後反而像被蓋住）；
        ② 三隻時名牌・行動預告照各自頭頂的高低排，高低不齊、互相蓋到；③ 頭目放大後頭上放不下。
   玩家選了「名牌固定在上方一排」：
   · 畫面拉長時（手機直拿・電腦，上方至少多 40 列），所有魔物的名牌排在最上面那排（回合・順序）的下面，同一個高度，
     左右對齊各自的魔物、不重疊；出招時不再變淡（名牌本來就畫在特效上面）。
   · 頭上只留「行動預告」和跳出的小牌子：預告在頭頂上方（頭太高就貼著名牌那排下面）；
     小牌子從預告上面往上疊，空間不夠兩個時改排在魔物旁邊（空間大的那一邊），由上往下。
   · 「破防！」「升級！」那條橫帶移到最上面那排（回合・順序）和名牌那排中間的空隙，不蓋名牌和小牌子。
   · 頭目・菁英放大倍數以「名牌那排下面還放得下預告」為準（大多數 2 倍）。
   · 畫面沒拉長（橫拿手機）照舊：名牌在腳下。長按名牌看狀態也跟著搬上去。 */
function plateRow25() { return (TALL_EXT || 0) >= 40 && Game.scene instanceof Battle; }
const rowTop25 = () => 30 - (TALL_EXT || 0);
Battle.prototype.rowBot25 = function () { let h = 29; for (const v of this.foes()) if (!v.gone && v.u && v.u.boss && v.broken) h = 42; return rowTop25() + h; };
Battle.prototype.lay22 = function (v) { if (!v || v.hero || v.foot == null || !((TALL_EXT || 0) >= 40)) return null;
  const top = rowTop25(), bot = this.rowBot25(), head = Math.round(v.foot - (v.bbh || 40)), intentY = Math.max(bot + 2, head - 17);
  return { plateY: top, intentY, wordsBot: intentY - 2, row: true, lim: bot + 2, head }; };
Battle.prototype.bigS22 = function (v, h0) { if (!v || v.hero || !(v.boss || v.elite) || !(h0 > 0)) return 1;
  const E = TALL_EXT || 0, minTop = E >= 40 ? rowTop25() + 29 + 19 : 15 - E + 13 + 6; return clamp(Math.floor((v.foot - minTop) / h0 * 4) / 4, 1, 2); };
// 跳出的小牌子：預告上面放得下就往上疊，不然排在魔物旁邊
{ const _wd = KB12.words; KB12.words = function (x, v, L) { if (!v || v.hero || v.foot == null) return _wd.call(this, x, v, L); const LY = this.lay22(v); if (!LY || !LY.row) return _wd.call(this, x, v, L);
    const live = L.filter(p => p.t < KB12.life(p)), max = (v.bbh || 48) < 56 ? 2 : 3; let show = live.slice(-max); if (!show.length) return null;
    const h = 13, gap = 2, fit = Math.floor((LY.wordsBot - LY.lim) / (h + gap)), cx0 = v.x + (v.off ? v.off.x : 0);
    const draw = (p, cx, top) => { const s = String(p.s), w = Math.ceil(Font.width(s, KB12.M)) + 12, col = p.c || KB12.txt, a = KB12.fadeA(p, KB12.life(p)), rise = Math.min(4, p.t * 0.6), X = clamp(cx, w / 2 + 2, W - w / 2 - 2), Y = top + (4 - rise);
      x.save(); x.globalAlpha = a; KB12.panel(x, Math.round(X - w / 2), Math.round(Y), w, h, { r: 6.5, rim: col, lw: p.big ? 1 : 0.6, top: 'rgba(30,26,44,0.92)', bot: 'rgba(12,10,20,0.95)' }); KB12.tc(x, s, X, Y + h / 2, col, KB12.M); x.restore(); };
    if (fit >= Math.min(2, show.length)) { show = show.slice(-fit); let y = LY.wordsBot; for (let i = show.length - 1; i >= 0; i--) { draw(show[i], cx0, y - h - 4); y -= h + gap; } return null; }
    const bb = v.img && v.img.bb, half = Math.min(60, bb ? (bb.vw ? bb.vw / 2 : bb.w * 0.4) : 20), right = W - (cx0 + half) >= cx0 - half; let y = Math.max(LY.lim, LY.head);
    for (let i = show.length - 1; i >= 0; i--) { const w = Math.ceil(Font.width(String(show[i].s), KB12.M)) + 12; draw(show[i], right ? cx0 + half + 2 + w / 2 : cx0 - half - 2 - w / 2, y - 4); y += h + gap; }
    return null; }; }
// 「破防！」橫帶：名牌那排的下面
{ const _rb = KB12.ribbon; KB12.ribbon = function (x, p) { if (!plateRow25()) return _rb(x, p); const E = TALL_EXT || 0, cy = 21 - E, inner = E > 24 ? 1 - E : 0; // 回合那一排和名牌那排中間的空隙
    x.save(); x.translate(0, cy - 27 - inner); try { return _rb(x, p); } finally { x.restore(); } }; }
