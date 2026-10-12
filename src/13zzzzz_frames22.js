/* ===================== v12.149 頭目・菁英出招時頭和身體斷開 =====================
   玩家 2026-10-12：「沼澤鱷在放招式時頭部跟身體會有斷裂感，檢查完後其他的也稍微檢查」
   查到（Codex 任務 AV 畫的豐富動作）：
   · 施法（蓄力）時是「施法 2 ↔ 施法 3」兩張一直交替（每 0.1 秒換一次）。很多隻這兩張的頭差 1〜2 格高、腳不動，
     看起來就是頭一直在身體上面跳、跟身體接不起來（沼澤鱷最明顯；47 隻裡 45 隻這兩張的頭頂或腳底高度差 1〜3 格）。
     → 跟 v12.127 修待機一樣：施法舉起來之後就停在「施法 2」那一張，不再兩張交替（兩張完全對齊的才照舊交替）。
       發光的感覺由蓄力本身的特效（光圈・光點）負責。
   · 受傷：有 8 隻（楓林鹿王・雪原巨熊・亡靈戰將・盜賊頭目「黑羽」・巨鉗蟹王・墮星騎士・蜥人隊長・月光精靈王）受傷的圖整隻畫小了一圈（面積只剩 7 成多），
     被打的瞬間整隻縮小再變回來，也很像身體斷掉。→ 這幾隻受傷改用待機那張（照舊往後退一下、閃白），之後請 Codex 重畫。
   檢查方法：每隻的每一張跟待機第 1 張比 —— 去掉飄在旁邊的小光點後，比頭頂・腳底的高度和面積。 */
const FRAMES22 = {};
function frameStat22(S, f) { const c = mkCanvas(S.w, S.h), x = c.getContext('2d'); x.drawImage(S.im, f * S.w, 0, S.w, S.h, 0, 0, S.w, S.h);
  const d = x.getImageData(0, 0, S.w, S.h).data; let top = -1, bot = -1, n = 0;
  for (let y = 0; y < S.h; y++) { let r = 0; for (let X = 0; X < S.w; X++) if (d[(y * S.w + X) * 4 + 3] > 0) r++; n += r; if (r >= 3) { if (top < 0) top = y; bot = y; } } return { top, bot, n }; }
function fixMeta22(S) { if (S.fix22 !== undefined) return S.fix22; const im = S.im; if (!im || !(im.width > 0) || im.complete === false) return null;
  let M = S.meta; try { const fr = S.meta.frames, F = { ...fr }; let ch = false;
    if (fr.cast && fr.cast.length >= 3) { const a = frameStat22(S, fr.cast[1]), b = frameStat22(S, fr.cast[2]); if (a.top !== b.top || a.bot !== b.bot) { F.cast = [fr.cast[0], fr.cast[1]]; ch = true; } }
    if (fr.hurt && fr.idle) { const i0 = frameStat22(S, fr.idle[0]); if (fr.hurt.some(h => frameStat22(S, h).n < 0.8 * i0.n)) { F.hurt = [fr.idle[0]]; ch = true; } }
    if (ch) { M = { ...S.meta, frames: F }; FRAMES22[S.sp || '?'] = { cast: F.cast !== fr.cast, hurt: F.hurt !== fr.hurt }; } } catch (e) { M = S.meta; }
  return (S.fix22 = M); }
{ const _pr = pxRender; pxRender = function (A, S, T, tint) { if (!(typeof RICH15 === 'function' && RICH15(S))) return _pr(A, S, T, tint); const M = fixMeta22(S); if (!M || M === S.meta) return _pr(A, S, T, tint);
    const m0 = S.meta; S.meta = M; try { return _pr(A, S, T, tint); } finally { S.meta = m0; } }; }
