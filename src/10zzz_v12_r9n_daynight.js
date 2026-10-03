/* ===================== v12.0.9n 一天的步數變短（玩家 2026-10-04「晝夜變化改成走路計算」→ 選「一天的步數變短」） =====================
   一天 2400 步 → 1200 步（早晨 150、白天 500、黃昏 150、夜晚 400），早中晚變化快一倍。畫面的顏色變化也跟著縮短。
   舊存檔的時間換算成一半（同一個時段）。 */
Object.assign(DN12, { LEN: 1200, day: 150, dusk: 650, night: 800 });
for (const k of DN_KEYS12) k[0] = k[0] / 2;
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.clock = 30; st.dnHalf9 = 1; } return st; }; }
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; if (st && !st.dnHalf9) { if (st.clock != null) st.clock = Math.floor(st.clock / 2); st.dnHalf9 = 1; } return _so.apply(this, a); }; }
