/* ===================== v20.6 重擊 explained (player question: how do monsters land heavy hits, and how do I avoid them?) =====================
   A hit on the hero for ≥25% max HP pops as 「重擊」 (07j). The pop now names the cause, the first heavy hit (and the first of each
   cause) explains it in the message box, and 設定 → 戰鬥說明 lists every cause and counter. Causes, in priority order:
   charged attack released · element combo on the hero (感電 / 引燃 / 蒸氣) · monster critical · boss frenzy · plain strength. */
const HEAVY_TAG = { charge: '蓄力重擊', shock: '感電重擊', ignite: '引燃重擊', steam: '蒸氣重擊', crit: '會心重擊', frenzy: '狂怒重擊', plain: '重擊' };
const HEAVY_TIP = {
  charge: '（這次是蓄力大招。看到「蓄力中」就按「防禦」讓傷害減半，或用弱點、會心打破護盾來打斷蓄力。）',
  shock: '（這次是感電：全身濕透時被雷擊，傷害×1.5。）',
  ignite: '（這次是引燃：被藤蔓纏住時被火燒，傷害×1.5。）',
  steam: '（這次是蒸氣：灼傷時被水擊中，傷害×1.3。）',
  crit: '（這次是魔物的會心一擊：傷害×1.5，還會無視你提升的防禦。）',
  frenzy: '（狂怒的頭目每兩回合行動兩次。趁牠破防時一口氣打倒牠吧。）',
  plain: '（魔物的強力招式、等級差距或被降低的防禦都可能造成重擊。看到大招預告就先防禦。）',
};
function heavyCause(b) {
  const h = b._hitH || {}, m = b._foeMv || {};
  return m.charged ? 'charge' : h.shock ? 'shock' : h.ignite ? 'ignite' : h.steam ? 'steam' : h.crit ? 'crit' : b.F && b.F.frenzy ? 'frenzy' : 'plain';
}
function* heavyTip(b, c) {
  const f = Game.st.flags, L = [], first = !f.tutHeavy;
  if (first) { f.tutHeavy = 1; L.push('（重擊：一次受到超過最大HP四分之一的傷害。傷害數字旁會標出原因。）'); }
  if (!f['tutHv_' + c]) { f['tutHv_' + c] = 1; L.push(HEAVY_TIP[c]); }
  if (first) L.push('（所有原因和對策可以在「設定 → 戰鬥說明」查看。）');
  for (const s of L) yield* b.msg(s, { wait: true });
}

/* ---------- 設定 → 戰鬥說明 ---------- */
const BATTLE_HELP = [
  ['重擊是什麼', ['一次受到超過最大HP四分之一的傷害就是「重擊」，傷害數字旁會標出原因。',
    '會心：魔物有6～12%的機率打出會心（部分招式機率加倍）。傷害×1.5，而且無視你提升的防禦。',
    '蓄力大招：魔物「蓄力中」時，你腳下會出現紅色警示圈，下一回合一定會發動。']],
  ['魔物變強的時候', ['菁英和頭目的HP低於60%會變強，還會使出新招式。',
    '頭目的HP低於30%會陷入狂怒，每兩回合行動兩次。',
    '你的HP低於35%時，魔物常會改用最強的招式。',
    '等級差距、難度、魔物提升攻擊或降低你的防禦，都會讓傷害變高。']],
  ['如何避免', ['防禦：傷害減半，效果持續到自己下一次行動（守護者的「守護之盾」再減30%）。看到蓄力預告就防禦。',
    '破防：用會心削光護盾，可以打斷蓄力，魔物還會停止行動一回合。',
    '魔法護盾：受到的傷害減少40%。盾牌有機率格擋，傷害減少40%。讓魔物灼傷，牠的物理攻擊會減半。',
    'HP掉到三分之一前先回復。穿上物防、魔防高的裝備。']],
];
function* battleHelpScreen() {
  let pg = 0; const N = BATTLE_HELP.length;
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '戰鬥說明'); Font.drawR(x, (pg + 1) + '/' + N, W - 6, 2, UIC.muted, UIC.textSh);
    const [title, items] = BATTLE_HELP[pg]; drawWin(x, 4, 26, 168, 226, 'menu');
    Font.draw(x, title, 12, 29, UIC.accent, UIC.textSh, 12); x.fillStyle = UIC.accent; x.globalAlpha = 0.4; x.fillRect(12, 45, 152, 1); x.globalAlpha = 1; Font.drawR(x, '◀▶ 換頁　B 返回', 164, 32, UIC.muted, UIC.textSh, 8);
    let y = 49; for (const it of items) { Font.wrap(it, 144, 10).forEach((l, n) => { if (!n) { x.fillStyle = UIC.warm; x.fillRect(12, y + 7, 3, 3); } Font.draw(x, l, 20, y, UIC.text, UIC.textSh, 10); y += 12; }); y += 5; }
    if (typeof touchRegion === 'function') { touchRegion(0, 26, W / 2, 212, () => tapKey('left')); touchRegion(W / 2, 26, W / 2, 212, () => tapKey('right')); }
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left') && pg > 0) { pg--; Sound.sfx('cursor'); } if (Input.repeat('right') && pg < N - 1) { pg++; Sound.sfx('cursor'); }
    if (Input.pressed('b') || (Input.pressed('a') && pg === N - 1)) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) { Input.consume('a'); pg++; Sound.sfx('cursor'); }
    yield;
  }
  UI.remove(scr);
}

/* ---------- v20.6 level up: an SFX-bus fanfare (always audible with 音效 on) + a LEVEL UP! pop over the hero ---------- */
