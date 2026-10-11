/* ===================== v12.134 武器外觀更新（Codex AT）沒套用到的地方 =====================
   玩家 2026-10-11：「武器外觀更新有套用了嗎」→ 檢查：劍・短刀・槍・杖・盾都已經是新圖（v12.125），但有三個地方還是舊的：
   1. 第三章的新武器（蒼潮之劍・浪刃短刀・王國騎士槍・海神三叉戟・珊瑚拳套・深海法杖・怒濤巨斧）原本沒圖、借別把武器的圖，
      Codex 畫好它們自己的圖之後，還是被借來的圖蓋掉，再被染成海水色 → 有自己的圖就用自己的、不再染色
      （改在 10zzz_v12_r9w_smith2 和 12a_ch3sys）。
   2. 拳套：選單・掉落展示一直顯示戴在手上的小手套（舊圖），Codex 新畫的拳套圖沒出現 → 選單・掉落改用新圖。
      戰鬥中主角背對鏡頭、拳套戴在兩隻手上，維持小手套。
   3. 珊瑚拳套沒有手套 → 戰鬥中被當成拿在手上的武器、畫成兩坨藍色的東西 → 補一副紅珊瑚色的手套（岩拳套的形狀）。 */
{ const SRC = typeof WEAPON_PX_SRC !== 'undefined' ? WEAPON_PX_SRC : {};
  if (typeof GLOVE_PX !== 'undefined' && !GLOVE_PX.coralFist13) {
    const rows = ['..aaa..', '..abca.', '.aacca.', '.adada.', '.aededa', '.aeeeea', '..aceea', '...aca.', '....a..'], pal = { a: '#2a2238', b: '#e76c63', c: '#78303e', d: '#ffab86', e: '#b5454e' };
    const R = spriteFrom(rows, pal), Lf = flipCanvas(R), pair = mkCanvas(R.width * 2 + 2, R.height), x = pair.getContext('2d');
    x.drawImage(Lf, 0, 0); x.drawImage(R, R.width + 2, 0); pair.ok = true; pair.glove = { R, L: Lf }; GLOVE_PX.coralFist13 = pair; }
  if (typeof GLOVE_PX !== 'undefined') for (const k in GLOVE_PX) {
    if (SRC[k]) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = SRC[k]; WEAPON_PX[k] = im; }
    else if (typeof WEAPON_PX_ROWS !== 'undefined' && WEAPON_PX_ROWS[k]) { const [cols, rows] = WEAPON_PX_ROWS[k], pal = {}; // 頭目掉落的雷鳴拳套：它自己的圖（Codex T）
      cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h); const c = spriteFrom(rows, pal); c.ok = true; WEAPON_PX[k] = c; } } }
