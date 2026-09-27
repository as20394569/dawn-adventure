/* ===================== v21 skill / talent rework 3 (playtest feedback) =====================
   1. 「劍士打屬性攻擊很奇怪」: the sword classes lose the elemental sword skills (火焰斬・雷光斬・流水斬・翠葉斬・烈焰斬).
      Sword skills are now plain techniques (一般); an elemental weapon turns them into its element, so weakness hunting
      comes from the weapon you carry. New: 燕返 (2 hits) · 迴旋斬 (3 hits) · 斬鐵 (×1.5 vs a broken foe) · 見切 (parry + counter).
      The guardian and the ranger lose their elemental slashes too (見切・燕返・十字斬・集氣 instead). Magic keeps its elements.
   2. 「天賦點太容易拿、天賦樹太少」: talent points come every 2 levels from Lv6 (was every level); each line grows to 6
      talents (18 in all, 37 ranks) so a build has to choose.
   3. 「裝備的對某族增傷、屬性減傷沒什麼用」: removed from gear. Existing / new rolls convert: 對X族+v% → 會心+v/5%,
      X系傷害-v% → HP+v/4. The ideas live on as talents: 弱點獵手 (weakness hits) and 元素護體 (all elemental damage).
   4. 「異界勇者技能打起來差不多」: four distinct skills — 破曉斬 (heals), 裂界斬 (shield breaker), 時空凍結 (skip the foe's
      next action, once per battle), 勇者之魂 (burns all MP, stronger the more MP is left). */

// ---------- 1. sword techniques ----------
Object.assign(MOVES, {
  doubleSlash: { n: '燕返', t: '一般', cat: '物', pow: 32, acc: 100, pp: 25, hits: 2, d: '一去一回的兩次斬擊。每一下都能削減護盾。' },
  whirlSlash: { n: '迴旋斬', t: '一般', cat: '物', pow: 22, acc: 95, pp: 15, hits: 3, d: '旋身連斬三下。每一下都能削減護盾。' },
  zantetsu: { n: '斬鐵', t: '一般', cat: '物', pow: 95, acc: 90, pp: 10, vsBroken: 1.5, d: '連鋼鐵都能斬斷的一刀。對破防中的魔物傷害×1.5。' },
  parry: { n: '見切', t: '一般', cat: '變', pp: 15, prio: 1, parry: 1, d: '看穿對手的動作。這回合受到的傷害減半，被攻擊時立刻反擊。必定先出手。' },
});
const REWORK3_META = { doubleSlash: ['slash', 'twinStrike'], whirlSlash: ['slash', 'bladeDance'], zantetsu: ['slash', 'iai'], parry: ['guard', 'ironWall'] };
for (const k in REWORK3_META) { MOVES[k].cls = REWORK3_META[k][0]; MOVES[k].fx = REWORK3_META[k][1]; }
Object.assign(SKILL_MP, { doubleSlash: 3, whirlSlash: 7, zantetsu: 9, parry: 4 });
SKILL_TREES.swordsman = [['powerSlash', 1], ['doubleSlash', 1], ['focus', 3], ['gale', 8], ['armorBreak', 8, 'powerSlash', 1], ['parry', 8, 'focus', 1], ['crossSlash', 11, 'powerSlash', 2], ['whirlSlash', 11, 'doubleSlash', 2], ['zantetsu', 16, 'crossSlash', 1]];
SKILL_TREES.guardian = [['guardStrike', 1], ['ironWill', 1], ['doubleSlash', 3], ['heal', 8], ['parry', 8, 'guardStrike', 1], ['barrier', 8, 'ironWill', 1], ['armorBreak', 8, 'guardStrike', 1], ['shieldBash', 11, 'guardStrike', 2], ['crossSlash', 11, 'doubleSlash', 2]];
SKILL_TREES.ranger = SKILL_TREES.ranger.map(n => n[0] === 'leafBlade' ? ['parry', 11, 'lacerate', 1] : n[0] === 'voltSlash' ? ['focus', 11, 'quickDraw', 1] : n);
CLASS_FREE.swordsman = ['powerSlash', 'doubleSlash'];
Object.assign(CLASS_START.swordsman, { moves: ['slash', 'doubleSlash', 'powerSlash'], tag: '純粹劍術', pitch: '純粹的劍術。連斬能削減護盾，集氣後的一擊必定會心；裝上屬性武器，劍技也會帶上屬性。' });
CLASS_LINE.swordsman = [[7, 'focus'], [9, 'gale'], [11, 'armorBreak'], [13, 'crossSlash'], [15, 'whirlSlash'], [17, 'zantetsu'], [20, 'parry']];
CLASS_LINE.guardian = [[7, 'doubleSlash'], [9, 'parry'], [11, 'heal'], [13, 'armorBreak'], [15, 'shieldBash'], [17, 'barrier'], [20, 'crossSlash']];
CLASSES.swordsman.d = '擅長近身劍術。物攻、物防、會心提升。劍技的屬性由武器決定。';

// ---------- 4. 異界勇者 ----------
Object.assign(MOVES.dawnBreak, { pow: 90, crit: 0, drain: 0.35, d: '劃破黑暗的曙光一擊。造成傷害的35%會回復自己的HP。' });
Object.assign(MOVES.riftBlade, { pow: 85, crit: 0, shieldHit: 2, d: '連同空間一起斬開。【破盾】額外削減2點護盾。' });
Object.assign(MOVES, {
  timeStop: { n: '時空凍結', t: '一般', cat: '變', pp: 5, prio: 1, timeStop: 1, d: '把魔物凍結在時空的縫隙裡，牠的下一次行動會被跳過（也會打斷蓄力）。每場戰鬥只能用一次。' },
  heroSoul: { n: '勇者之魂', t: '一般', cat: '物', pow: 60, acc: 100, pp: 5, heroSoul: 1, d: '燃燒全部MP的一擊。剩下的MP越多威力越高（最高200），用完MP歸零。' },
});
Object.assign(MOVES.timeStop, { cls: 'debuff', fx: 'mirage' }); Object.assign(MOVES.heroSoul, { cls: 'slash', fx: 'dawnBreak' });
Object.assign(SKILL_MP, { dawnBreak: 14, riftBlade: 12, timeStop: 18, heroSoul: 10 });
SKILL_TREES.otherworlder = [['dawnBreak', 14], ['riftBlade', 16, 'dawnBreak', 1], ['timeStop', 20, 'dawnBreak', 1], ['heroSoul', 24, 'riftBlade', 1]];

// ---------- 2. talents v3 ----------
const TALENT_V3 = 3;
TALENTS.push(
  { id: 'hunter', n: '弱點獵手', line: 0, max: 3, d: '打中魔物的弱點時，傷害再提高8%。', st: { weakUp: 8 }, req: 'blade', lbl: ['弱點傷害', '%'] },
  { id: 'slayer', n: '巨獸殺手', line: 0, max: 2, d: '對菁英和頭目造成的傷害提高8%。', st: { bigUp: 8 }, req: 'vital', lbl: ['對菁英頭目', '%'] },
  { id: 'thrift', n: '魔力循環', line: 1, max: 2, d: '使用技能時有12%的機率不消耗MP。', st: { mpSave: 12 }, req: 'mana', lbl: ['不耗MP', '%'] },
  { id: 'arcCrit', n: '奧術洞察', line: 1, max: 2, d: '魔法攻擊的會心率提高5%。', st: { magCrit: 5 }, req: 'elem', lbl: ['魔法會心', '%'] },
  { id: 'ward', n: '元素護體', line: 2, max: 3, d: '受到火、水、草、雷屬性的傷害降低6%。', st: { elemRes: 6 }, req: 'body', lbl: ['屬性減傷', '%'] },
  { id: 'tenacity', n: '背水一戰', line: 2, max: 1, d: '每場戰鬥第一次受到致命傷害時，保留1點HP。', st: { endureT: 1 }, req: 'agile', on: '啟用' },
);
TALENTS.sort((a, b) => a.line - b.line);
const tpForLevel = lv => lv >= 6 ? Math.floor((lv - 6) / 2) + 1 : 0; // Lv6, 8, 10 … (+1 each)

// ---------- 3. gear: 對X族增傷 / X系減傷 are gone ----------
{ const _gs = gearStats; gearStats = function (g) {
    const o = _gs(g), vs = o.sp.vs || [], rs = o.sp.resist || {};
    for (const [, v] of vs) o.sp.crit = (o.sp.crit || 0) + Math.max(1, Math.round(v / 5));
    let hp = 0; for (const t in rs) hp += Math.max(1, Math.round(rs[t] / 4)); if (hp) o.st.hp = (o.st.hp || 0) + hp;
    o.sp.vs = []; o.sp.resist = {}; return o;
  };
}
GEAR.boneSaber.d = '古代守衛的軍刀。刀鋒很利，容易砍中要害。'; GEAR.foxfireStaff.d = '狐火在水晶球裡搖曳。'; GEAR.frogCloak.d = '防水的蛙皮斗篷，穿起來很輕。'; GEAR.beetleCharm.d = '用甲殼片做的護符，堅固耐用。';
// every element now has a sword (the element of a sword technique comes from the weapon): add the missing 草 one
Object.assign(GEAR, { verdantBlade: { n: '翠葉劍', slot: 'weapon', t: 3, st: { atk: 9 }, sp: { crit: 3 }, elem: '草', kind: '劍', look: ['sword', 'verdant'], d: '用魔力草汁浸過的長劍。劍身泛著葉脈般的綠光。' } });
WPN_PAL.verdant = { I: '#c8f0a0', i: '#4a9a3a', T: '#3a5a2a', U: '#e8c048' };
RECIPES.push({ out: 'verdantBlade', mats: { manaHerb: 4, stone: 3 }, gold: 800 });
