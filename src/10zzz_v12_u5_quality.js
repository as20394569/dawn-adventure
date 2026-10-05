/* ===================== v12.25 品質看得出差別（玩家 2026-10-05：「前期裝備顏色的差距不大甚至一模一樣」） =====================
   原本品質（藍・紫・紅・金・虹）只決定潛力和晶石孔，基本數值完全一樣——還沒到鐵匠賦予之前，藍色和金色的頭盔一模一樣。
   問了之後選「基本數值跟著顏色變」：藍 ×1.0、紫 ×1.1、紅 ×1.2、金 ×1.3、虹 ×1.45（潛力・晶石孔照舊）。
   前期數字小（物防 +1、+2），乘了四捨五入還是一樣 → 每高一級品質，每項基本數值至少多 1（速度除外，只照倍率）。
   頭目・菁英：以「紫色裝備」為準重新模擬（大多數玩家身上是藍・紫混一些紅），回合數維持原本的目標；紅色以上打得比較快，算是好裝備的回報。 */
const QMUL12 = [1, 1, 1.1, 1.2, 1.3, 1.45];
// (速度 has no +1 floor: a speed point decides who moves first, so it only follows the ×)
const qStat12 = (v, q, k) => { if (!v || q <= 1 || v < 0) return v; const r = Math.round(v * QMUL12[q]); return k === 'spe' ? r : Math.max(r, v + (q - 1)); };
{ const _gs = gearStats; gearStats = function (g) { const o = _gs(g), q = clamp((g && g.q) || 1, 1, 5); if (q > 1) for (const k in o.st) o.st[k] = qStat12(o.st[k], q, k); return o; }; }
// the texts that said quality only meant potential and crystal holes
{ const fixT = s => typeof s === 'string' ? s.replace(/品質決定潛力和晶石孔/g, '品質決定基本數值、潛力和晶石孔') : s;
  if (typeof GROW12 !== 'undefined') for (const q of GROW12) q[1] = fixT(q[1]);
  if (typeof BATTLE_HELP !== 'undefined') for (const q of BATTLE_HELP) if (Array.isArray(q[1])) q[1] = q[1].map(fixT); else q[1] = fixT(q[1]);
  if (typeof GROW12 !== 'undefined' && !GROW12.some(q => q[0] === '裝備的品質')) GROW12.push(['裝備的品質', '裝備有藍・紫・紅・金・虹五種品質。品質越好，基本數值越高（藍 ×1.0、紫 ×1.1、紅 ×1.2、金 ×1.3、虹 ×1.45，每高一級每項至少 +1，速度只照倍率），潛力越多、晶石孔越多。']); }
