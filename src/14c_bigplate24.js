/* ===================== v12.153 頭目・菁英放大後，名牌照樣搬到頭上 =====================
   玩家 2026-10-12：「12.148 的其他介面更新突然消失了」
   原因：v12.147 把魔物的名牌・行動預告・跳出的小牌子都排到頭上（頭→名牌→預告→小牌子），
   可是 v12.148 頭目・菁英放大 2 倍後頭頂幾乎碰到最上面那一排，頭上放不下整疊 → 這幾隻的名牌又掉回腳下、壓在身體上。
   玩家選了「維持 2 倍，名牌搬頭上」：
   · 大隻的頭上只排「名牌＋行動預告」（名牌貼著頭頂，選目標的箭頭可以蓋到頭一點點）；
   · 跳出的小牌子（破防・中毒…）頭上放不下時，改在名牌旁邊（空間比較多的那一邊）由下往上疊；
   · 放大倍數改成「頭上放得下名牌＋預告」為準：大多數還是 2 倍，特別高的頭目縮一點（最小 1 倍）。
   · 頭目破防時名牌下面多一排部位條，放不下就整疊頂到最上面、名牌稍微蓋到頭頂。 */
const BIG24 = { gap: 4 };
// 放大倍數：頭上要留「名牌 29 ＋ 預告 15 ＋ 間隔」
Battle.prototype.bigS22 = function (v, h0) { if (!v || v.hero || !(v.boss || v.elite) || !(h0 > 0)) return 1;
  const E = TALL_EXT || 0, minTop = E >= 40 ? 15 - E + 13 + BIG24.gap + 29 + 16 : 15 - E + 13 + 6; return clamp(Math.floor((v.foot - minTop) / h0 * 4) / 4, 1, 2); };
// 頭上的排法：大隻的放不下整疊時，只排名牌＋預告，小牌子放旁邊（side）
{ const _lay = Battle.prototype.lay22; Battle.prototype.lay22 = function (v) { const L = _lay.call(this, v); if (L || !v || v.hero || !(v.s22 > 1) || v.foot == null) return L;
    const E = TALL_EXT || 0; if (E < 40) return null;
    const head = Math.round(v.foot - (v.bbh || 40)), minTop = 15 - E + 13, ph = 29 + (v.u && v.u.boss && v.broken ? 13 : 0);
    let plateY = head - BIG24.gap - ph, intentY = plateY - 15; if (intentY < minTop) { const d = minTop - intentY; plateY += d; intentY += d; }
    if (plateY + 29 > head + 16) return null; // 真的太高大：照舊在腳下
    return { plateY, intentY, wordsBot: intentY - 2, side: true }; }; }
// 小牌子：頭上放不下兩個的話，排在名牌旁邊
{ const _wd = KB12.words; KB12.words = function (x, v, L) { if (!v || v.hero || v.foot == null) return _wd.call(this, x, v, L);
    const LY = this.lay22(v); if (!LY || !LY.side) return _wd.call(this, x, v, L);
    const live = L.filter(p => p.t < KB12.life(p)), show = live.slice(-3); if (!show.length) return null;
    const h = 13, gap = 2, minTop = 15 - (TALL_EXT || 0) + 13; if (LY.wordsBot - show.length * (h + gap) >= minTop) return _wd.call(this, x, v, L);
    const n = this.foes().length, bw = n === 1 ? 100 : n === 2 ? 72 : 54, cx0 = v.x + (v.off ? v.off.x : 0), pl = cx0 - bw / 2, pr = cx0 + bw / 2, right = W - pr >= pl;
    let y = LY.plateY + 29; // 跟名牌底對齊，往上疊
    for (let i = show.length - 1; i >= 0; i--) { const p = show[i], s = String(p.s), w = Math.ceil(Font.width(s, KB12.M)) + 12, col = p.c || KB12.txt, a = KB12.fadeA(p, KB12.life(p)), rise = Math.min(4, p.t * 0.6);
      const cx = clamp(right ? pr + 3 + w / 2 : pl - 3 - w / 2, w / 2 + 2, W - w / 2 - 2), top = Math.max(minTop, y - h - (4 - rise));
      x.save(); x.globalAlpha = a; KB12.panel(x, Math.round(cx - w / 2), Math.round(top), w, h, { r: 6.5, rim: col, lw: p.big ? 1 : 0.6, top: 'rgba(30,26,44,0.92)', bot: 'rgba(12,10,20,0.95)' }); KB12.tc(x, s, cx, top + h / 2, col, KB12.M); x.restore(); y -= h + gap; }
    return null; }; }
