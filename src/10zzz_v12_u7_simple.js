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

/* ---------- v12.28 雙持怎麼讓玩家知道（玩家：「雙持 如果玩家不知道呢？」） ----------
   雙持的三棵樹藏起來之後，玩家可能根本不知道有雙持。補兩個入口：
   1. 技能樹分頁最後多一個灰色的「雙持」頁（還沒開任何雙持樹的時候）：寫怎麼開啟三種雙持、各自的特色，以及你現在有沒有成對的武器。
   2. 第一次身上有「兩把短刀」「兩把劍」或「兩面盾」時，跳一次提示，告訴你到「裝備」把第二把放進副手。 */
const DUAL_TAB12 = '雙持';
const dualPairs12 = (st = Game.st) => { const n = { 短刀: 0, 劍: 0, 盾: 0 }; for (const g of st.gear || []) { const B = GEAR[g.b]; if (!B) continue; if (B.slot === 'shield') n.盾++; else if (B.slot === 'weapon' && n[B.kind] != null) n[B.kind]++; } return n; };
const DUAL_INFO12 = [['雙刀', '短刀', '兩把短刀', '出手快，多段攻擊更痛'], ['雙劍', '劍', '兩把劍', '會心時副手追加一斬'], ['雙盾', '盾', '主手副手都拿盾', '用物防攻擊，很耐打']];
function drawDualTip12(x, LY, h, Y0) { const n = dualPairs12(); let y = LY + 6;
  Font.draw(x, '兩手拿同種的武器（或兩面盾），', 10, y, UIC.text, UIC.textSh, 10); y += 13; Font.draw(x, '就會開啟對應的雙持技能樹：', 10, y, UIC.text, UIC.textSh, 10); y += 18;
  for (const [t, k, how, d] of DUAL_INFO12) { const have = n[k] >= 2; Font.draw(x, '◇ ' + t, 12, y, have ? UIC.warm : '#c8f0ff', UIC.textSh, 10); Font.drawR(x, have ? '已經有兩' + (k === '盾' ? '面' : '把') + '！' : '手上 ' + n[k] + (k === '盾' ? ' 面' : ' 把'), 166, y + 1, have ? UIC.warm : UIC.muted, UIC.textSh, 8); y += 13;
    for (const l of Font.wrap(how + '・' + d, 146, 9)) { Font.draw(x, l, 20, y, '#aab8d0', UIC.textSh, 9); y += 11; } y += 4; }
  drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); drawFitText(x, '到選單「裝備」，把第二把放進副手欄就開始雙持。\n←→ 換樹　B 離開', 10, Y0 + 4, 152, 252 - Y0 - 8, 10, UIC.text); }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const r = _up.apply(this, a), st = this.st || Game.st;
    if (st && !st.flags.dualHint12 && (Game.frame || 0) % 30 === 7 && !this.script && !UI.stack.length && !Game.trans && Game.scene === this && st.flags.license && !dualMode11(st)) {
      const n = dualPairs12(st), k = n.短刀 >= 2 ? '短刀' : n.劍 >= 2 ? '劍' : n.盾 >= 2 ? '盾' : null;
      if (k) { st.flags.dualHint12 = 1; const I = DUAL_INFO12.find(q => q[1] === k);
        this.run(say('（你有兩' + (k === '盾' ? '面盾' : '把' + k) + '了！到選單「裝備」' + (k === '盾' ? '把主手和副手都換成盾' : '把第二把放進副手欄') + '，就能雙持「' + I[0] + '」：' + I[3] + '，還會開啟' + I[0] + '的技能樹。）')); } }
    return r; }; }
