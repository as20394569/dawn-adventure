/* ===================== v12.27 系統精簡：用得到才出現（玩家 2026-10-06：「聽你的 你來試試前兩項」——差距第 1 項「系統太多、太分散」） =====================
   不刪掉任何機制，只讓玩家「碰到了才看到」，並拿掉重複的入口：
   1. 選單「技能」直接進技能編排（技能樹本來就有自己的格子，不用再選一次）。
   2. 技能樹分頁：雙刀・雙劍・雙盾三棵樹，等你真的雙持（或已經點過那棵樹）才出現 → 一開始 12 頁，不是 15 頁。
   3. 鐵匠：「晶石」等你有晶石、「幻化」等你解鎖外觀才出現 → 一開始 5 個選項，不是 7 個。
   4. 冒險手冊「變強的方法」：只列出已經碰到的主題（慣性、部位、護盾、晶石、雙盾、絕技…碰到之後才加進來）。
   5. 戰鬥：魔物名牌左邊的慣性（普／物／魔）只顯示不是 100 的那幾類。
   6. 修：「部位素材」的說明和「打部位」的教學共用同一個旗標，先跳的那個會讓另一個永遠不出現。 */
skillTreeScreen = function* () { if (SKILL_ARR11) yield* SKILL_ARR11(); };
const dualTab12 = (k, st = Game.st) => dualMode11(st) === k || treeNodes11(k).some(N => trLv11(N.key, st) > 0);
const GROW_WHEN12 = { 果實: st => (st.lv || 1) >= 8, 屬性門檻: st => (st.lv || 1) >= 10, 晶石: st => Object.keys(cryOwn11(st) || {}).length > 0 || !!st.flags.tutCry11,
  回憶石碑: st => (st.lv || 1) >= 16, 素材點數與鐵匠: st => !!(st.flags.tutMat12 || st.flags.tutSmith11), 絕技: st => (st.lv || 1) >= 28, 慣性: st => !!st.flags.tutInert11,
  打部位: st => !!st.flags.tutPart11, 護盾: st => !!st.flags.tutWard12, 雙盾的攻擊: st => dualTab12('雙盾', st) };
function growList12(st = Game.st) { return GROW12.filter(q => !GROW_WHEN12[q[0]] || GROW_WHEN12[q[0]](st)); }
for (const b of GROW12) if (b[0] === '武器技能樹' && !/雙持的樹/.test(b[1])) b[1] += '（雙持的樹：兩手拿同種短刀・劍或兩面盾之後才會出現在分頁）';
