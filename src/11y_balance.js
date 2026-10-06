/* ===================== v12.69 幾隻「對短刀打不動」的野生魔物稍微調低（玩家 2026-10-07「其他照你的建議」） =====================
   量測（主角＝地圖最高等級、同階 q3 裝備、推薦配點、特級傷藥 5 瓶、自動戰鬥 AI、短刀樹）：空洞鎧甲 0/3、黑曜龜 4/8、火山鷹 1/3、哨兵・虛空獵犬各 2 敗；
   同樣條件拿劍打空洞鎧甲 8/8。保留「這幾隻最難打」的個性，只把最尖的那一項削掉一點。
   調整後（血量 55% 以下就喝藥的 AI，每隻 8 場）：空洞鎧甲 8/8（4 瓶）、黑曜龜 8/8、火山鷹 6/8、哨兵 8/8、虛空獵犬 8/8；同地圖的發條兵・亡國騎士也是 8/8（2 瓶）。 */
{ const T = { hollowArmor: { def: 38, atk: 33 }, obsidianTurtle: { def: 42, hp: 92, atk: 44 }, volcanoHawk: { atk: 38 }, sentinel: { def: 46, spa: 22 }, voidHound: { spe: 46, atk: 28 } };
  for (const k in T) { const P = MON_PANEL[k]; if (!P) { if (typeof bvErr === 'function') bvErr('tune13', k); continue; } Object.assign(P, T[k]); } }
