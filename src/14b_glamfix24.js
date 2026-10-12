/* ===================== v12.151 自動套上的外觀全部拿掉 =====================
   玩家 2026-10-12：「部分裝備戰鬥時外觀不一樣 是不是幻化系統在搞鬼」→ 是。
   原因：舊存檔轉換（v12.0.9w）和 v12.124 以前拿到的退場裝備，系統會自動把外觀幻化成那件舊裝備。
   戰鬥・野外照「外觀」畫，可是裝備選單的名字是原本那件、圖示也有好幾處用原本那件 → 看起來像換了一件裝備。
   玩家選了「全部恢復原樣」：讀檔時一次把所有裝備的幻化拿掉（分不出哪些是自己換的，所以一起拿掉）；
   那些外觀照樣留在鐵匠「幻化」的清單裡，想要再自己換。
   另外選單的圖示（裝備選單・狀態畫面・戰利品展示・戰鬥的盾牌圖示）改成一律畫「看起來的那件」（gLook），
   以後自己幻化的裝備，選單和戰鬥也會是同一個樣子。 */
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; let n = 0;
    if (st && !st.gl24v) { st.gl24v = 1; for (const g of st.gear || []) if (g && g.gl) { delete g.gl; n++; } if (n && typeof dollLast !== 'undefined') dollLast.k = null; }
    const ow = _so.apply(this, a);
    if (n && ow && ow.run) ow.run((function* () { yield* wait(30); yield* say('（裝備的外觀恢復了）\n以前系統自動幫裝備套上的舊外觀（' + n + ' 件）都拿掉了，現在每件都是它原本的樣子。\n那些外觀還在鐵匠「幻化」的清單裡，想換再自己去換。'); })());
    return ow; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.gl24v = 1; return st; }; }
