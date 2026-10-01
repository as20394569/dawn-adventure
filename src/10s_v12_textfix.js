/* ===================== v12.0.1 框格文字置中 (player: 「檢查遊戲中框格中文字沒有置中的問題」) =====================
   The bitmap font draws a size-z line with its glyphs starting 2–5 px below the y it is given (measured: the visual middle of a CJK line
   is y + 7–8 for every size), so labels placed at a box's top sat 1–2 px low. midY gives the y that centres a size-z line in a box. */
function midY(Y, h, z = 12) { const C = { 6: 7.5, 7: 8, 8: 7.5, 9: 7, 10: 7.5, 11: 7, 12: 7.5, 13: 8 }; return Math.round(Y + (h - 1) / 2 - (C[z] ?? 7.5)); }
