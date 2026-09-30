/* ===================== v9.3 升級成長改成配點 =====================
   Playtest: "玩家成長改由自由配點，稍微限制強度，重置需要花錢買道具，每等級多少你抓一下" / "我指的是升級的成長也改成配點".
   - Levelling no longer raises 物攻・物防・魔攻・魔防・速度 by itself (was +0.6 each per level); HP / MP still grow a little
     (HP +1.8 as before, MP +1.0 instead of +1.3). Instead every level gives 3 屬性點 (was 1).
   - A little limit: an attribute can't go above 10 + level, and past 40 each point costs 4 (20 → 2, 30 → 3 as before).
     With the 推薦配點 the main stat of each class ends up where it was; HP and the off-stats come out a bit lower.
   - 重置 needs an item bought with gold: 重生之水 (屬性) and 遺忘之書 (天賦, current class). Talents picked in the same
     visit to the talent screen can still be changed freely; once you leave, they're fixed.
   - New games start with 1 重生之水; 天賦覺醒 gives 1 遺忘之書; older saves get one of each with a notice. */
LV_GROW.hp = 1.8; LV_GROW.st = 0; LV_GROW.mp = 1.0; ATTR_GROW.perLv = 3;
// defences used to come half from the level: 體力 and 敏捷 give more 物防, 體力・智力 more 魔防
DEF_PER.vit = 1.5; DEF_PER.agi = 0.5; DEF_PER.spd = 0.8;
Object.assign(ATTR_HELP, { agi: '速度+1.5、迴避+0.4%、物防+0.5　（連擊技能加成）', vit: '最大HP+1.6、物防+1.5、魔防+0.8', int: '魔攻+1.2、最大MP+1.5、魔防+0.8　（魔法加成）' });
Object.assign(ITEMS, {
  attrReset: { n: '重生之水', price: 3000, cat: '永久強化', use: 'reset', d: '喝下後，可以把所有屬性點收回來重新分配。（在選單→屬性使用）' },
  talentReset: { n: '遺忘之書', price: 4000, cat: '永久強化', use: 'reset', d: '讀完後，可以把目前職業的天賦全部收回來重新選。（在選單→天賦使用）' },
});
SHOP_LIST.push('attrReset', 'talentReset'); if (typeof CAP_SHOP !== 'undefined') CAP_SHOP.push('attrReset', 'talentReset');
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.growV93 = 1; st.bag.attrReset = 1; } return st; }; }
// 天賦覺醒 hands over a 遺忘之書
{ const _ct = classTalk; classTalk = function* (...a) {
    const st = Game.st, had = !!(st.flags && st.flags.deep); const r = yield* _ct.apply(this, a);
    if (!had && st.flags && st.flags.deep && !st.flags.gotForget) { st.flags.gotForget = 1; st.bag.talentReset = (st.bag.talentReset || 0) + 1; yield* itemGet('村長給了你一本遺忘之書。（想重新選天賦的時候使用）'); }
    return r; }; }
// older saves: the growth changed under them — one of each item and a notice
{ const _so = startOverworld; startOverworld = function (...a) {
    const st = Game.st; let note = false;
    if (st && !st.growV93) { st.growV93 = 1; if (st.cls && st.lv > 1) { note = true; st.bag.attrReset = (st.bag.attrReset || 0) + 1; st.bag.talentReset = (st.bag.talentReset || 0) + 1; } }
    const ow = _so.apply(this, a);
    if (note && ow && ow.run) { const prev = ow.script; ow.run((function* () { if (prev) yield* prev; yield* wait(50);
      yield* say('【v9.3 成長改版】升級時，物攻・物防・魔攻・魔防・速度不會再自己成長，改成每級給3點屬性點。\n（你現在有' + attrAvail(st) + '點可以分配：選單→屬性，也可以按「推薦配點」）');
      yield* say('重置屬性要用「重生之水」，重置天賦要用「遺忘之書」（道具店有賣）。\n這次改版送你各1個。'); })()); }
    return ow; }; }
