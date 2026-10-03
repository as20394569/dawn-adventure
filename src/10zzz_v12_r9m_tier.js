/* ===================== v12.0.9m 裝備名稱後面顯示階級（玩家 2026-10-04「裝備顯示階級 全部選單 但不包含對話」） =====================
   所有選單（裝備、背包、鐵匠、商店、打造、狀態、詳情…）裡的裝備名稱後面加上階級，例如「雷鳴權杖 T5」（玩家 04:22「顯示T1~5這樣簡單就好」）。
   對話框不加：只有在畫選單的時候名稱才帶階級，對話的文字在畫之前就寫好了，所以不受影響。 */
let MENU_DRAW9 = 0;
{ const _d = UI.draw; UI.draw = function (c) { MENU_DRAW9++; try { return _d.call(this, c); } finally { MENU_DRAW9--; } }; }
for (const k in GEAR) { const G = GEAR[k]; if (!G || typeof G.n !== 'string' || !G.t) continue; let base = G.n; const t = G.t;
  Object.defineProperty(G, 'n', { configurable: true, enumerable: true, get() { return MENU_DRAW9 ? base + ' T' + t : base; }, set(v) { base = v; } }); }
