/* ===================== v12.0.9e 第九輪（五）：職業技能改版後，跟著要改的地方（玩家 2026-10-04「還有相關改動沒改的嗎」） =====================
   - 戰鬥說明：職業核心資源、技能與冷卻（職業技能只在那個職業能用）、多隻魔物（範圍技能換成現在的名字）。
   - 冒險手冊「變強的方法」：職業（8 招職業技能）、天賦（上限 16 點、核心天賦改變職業招式）。
   - 升級：到了學會職業技能的等級，會跳出「學會了職業技能」。
   - 轉職：說明職業技能換成新職業的，換回來會恢復。
   - 魔人維克托：模仿的招式條件不夠（例如極意・無塵要劍意滿）時不模仿，不再白白浪費一回合。 */

/* ---------- 戰鬥說明 ---------- */
if (typeof BATTLE_HELP !== 'undefined') for (const P of BATTLE_HELP) P[1] = P[1].map(t => t
  .replace('職業招式會消耗它，消耗越多越強。', '職業招式會消耗它，消耗越多越強；8 招職業技能也會累積、消耗或看它的多少。')
  .replace('技能來自職業（等級到了學會）和武器（裝備就能用）。', '技能來自職業（等級到了學會，只在那個職業能用）和武器（裝備就能用）。')
  .replace('範圍技能（落雷、炎浪、隕星…）', '範圍技能（旋風斬、紫電、隕星…）'));

/* ---------- 冒險手冊・變強的方法 ---------- */
for (const q of GROW12) {
  if (q[0] === '職業' && !/職業技能/.test(q[1])) q[1] += '\n每個職業有自己的 8 招職業技能（Lv1～32 學會），只有在那個職業能用；換回來就能再用。';
  if (q[0] === '天賦與職業招式' && !/16/.test(q[1])) q[1] += '天賦點最多 16 點，剛好點滿兩個流派＋核心天賦。核心天賦會直接改變職業招式。';
}

/* ---------- 升級：學會職業技能 ---------- */
{ const _lu = Battle.prototype.levelUp; Battle.prototype.levelUp = function* () {
    yield* _lu.call(this); const st = Game.st;
    for (const [id, lv] of classSkills12(st, true)) { if (lv !== st.lv || !DEF.skills[id]) continue;
      BB.classGrant(st); const inSlot = BB.slots(st).includes(id); Sound.sfx('item');
      yield* this.msg('學會了職業技能「' + DEF.skills[id].name + '」！' + (inSlot ? '（已放進技能槽）' : '（選單→技能編排 放進技能槽）'), { hold: 40 }); } }; }

/* ---------- 轉職：職業技能跟著換 ---------- */
{ const _cc = changeClass; changeClass = function* (k, quiet) {
    const st = Game.st, was = st.cls ? clsV7(st.cls) : null;
    yield* _cc(k, quiet);
    if (quiet || !was || was === clsV7(k) || !CLASS_SKILLS12[clsV7(k)]) return;
    const n = classSkills12(st).length; BB.slots(st);
    yield* say('職業技能換成了' + CLASSES[k].n + '的招式（學會 ' + n + ' 招，空的技能槽會自動放進去）。\n換回原本的職業，原本的職業技能就會回來。'); }; }

/* ---------- 魔人維克托：條件不夠的招式不模仿 ---------- */
{ const _v = B12_SCRIPT.victorDemon; B12_SCRIPT.victorDemon = function (core, u) {
    const id = core.data.lastHeroAct, D = id && DEF.skills[id];
    if (D && D.requires && !condOk(D.requires, { core, owner: u, src: u, skill: D })) return null;
    return _v(core, u); }; }
