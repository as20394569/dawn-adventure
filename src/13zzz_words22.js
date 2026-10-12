/* ===================== v12.147 魔物身上跳出的小牌子移到頭上 =====================
   玩家 2026-10-12：「戰鬥時如果有破防、中毒這些跳出的小窗，希望可以在怪物頭上，不要擋到技能特效」
   原本：魔物的狀態小牌子（中毒！・破防・弱點・MISS・能力升降…）從名牌上方往上疊，正好蓋在魔物的身體上，打中的特效都被擋住。
   現在：從魔物頭頂（行動預告那個小框的上面）往上疊，身體留給特效和傷害數字。上面空間不夠時（畫面沒拉長、魔物站在後排）
   整排往下挪到剛好放得下（最多蓋到頭頂一點點）。主角的小牌子照舊（在狀態卡上面）。
   畫面拉長時，「破防！」「升級！」那一條橫帶也往上移到天空那一段，不壓在後排魔物的頭上。
   玩家接著說「也可以把魔物狀態上移，但要注意其他跳出的通知」：
   畫面拉長（上面有天空那一段）時，魔物的名牌（名字・HP・狀態）也搬到頭上。由下往上：頭 →（選目標的箭頭）→ 名牌（頭目破防時的部位條也在名牌下面）
   → 行動預告 → 跳出的小牌子，各自不重疊；傷害數字照舊在身體中間，「破防！」橫帶在最上面的天空。頭上空間不夠的魔物（太高大、或畫面沒拉長）名牌留在腳下。 */
// 頭上的排法：名牌搬上去的話，名牌・行動預告・小牌子的位置（不搬就是 null）
Battle.prototype.lay22 = function (v) { const E = TALL_EXT || 0; if (!v || v.hero || v.foot == null || E < 40) return null;
  const head = Math.round(v.foot - (v.bbh || 40)), ph = 29 + (v.u && v.u.boss && v.broken ? 13 : 0), plateY = head - 11 - ph, intentY = plateY - 15, minTop = 15 - E + 13;
  if (intentY - 2 - 2 * 15 < minTop) return null; // 至少要放得下兩個小牌子
  return { plateY, intentY, wordsBot: intentY - 2 }; };
{ const _pl = KB12.plates; KB12.plates = function (x, a0) { const saved = []; for (const v of this.foes()) { const L = this.lay22(v); if (L) { saved.push([v, v.foot]); v.foot = L.plateY - 3; } }
    try { return _pl.call(this, x, a0); } finally { for (const [v, f] of saved) v.foot = f; } };
  const _in = KB12.intents; KB12.intents = function (x) { const saved = []; for (const v of this.foes()) { const L = this.lay22(v); if (L) { saved.push([v, v.foot]); v.foot = L.intentY + (v.bbh || 40) + 17; } }
    try { return _in.call(this, x); } finally { for (const [v, f] of saved) v.foot = f; } }; }
{ const _wd = KB12.words; KB12.words = function (x, v, L) { if (!v || v.hero || v.foot == null) return _wd.call(this, x, v, L);
    const live = L.filter(p => p.t < KB12.life(p)), max = (v.bbh || 48) < 56 ? 2 : 3, show = live.slice(-max); if (!show.length) return null;
    const h = 13, gap = 2, colH = show.length * (h + gap), minTop = 15 - (TALL_EXT || 0) + 13; // 最上面一排（回合・順序）底下
    const LY = this.lay22(v); let bot = LY ? LY.wordsBot : Math.round(v.foot - (v.bbh || 40) - 17 - gap); if (bot - colH < minTop) bot = minTop + colH; // 行動預告小框的上面；放不下就整排往下挪
    const cx0 = v.x + (v.off ? v.off.x : 0); let y = bot;
    for (let i = show.length - 1; i >= 0; i--) { const p = show[i], s = String(p.s), w = Math.ceil(Font.width(s, KB12.M)) + 12, cx = clamp(cx0, w / 2 + 3, W - w / 2 - 3), col = p.c || KB12.txt, a = KB12.fadeA(p, KB12.life(p)), rise = Math.min(4, p.t * 0.6);
      x.save(); x.globalAlpha = a; KB12.panel(x, Math.round(cx - w / 2), Math.round(y - h - (4 - rise)), w, h, { r: 6.5, rim: col, lw: p.big ? 1 : 0.6, top: 'rgba(30,26,44,0.92)', bot: 'rgba(12,10,20,0.95)' }); KB12.tc(x, s, cx, y - h / 2 - (4 - rise), col, KB12.M); x.restore(); y -= h + gap; }
    return null; }; } // （傳回 null：傷害數字不用再讓位給這排小牌子，照樣在身體中間）
{ const _rb = KB12.ribbon; KB12.ribbon = function (x, p) { const E = TALL_EXT || 0; if (!(E > 24)) return _rb(x, p); x.save(); x.translate(0, 28 - E - 27); try { return _rb(x, p); } finally { x.restore(); } }; }
