/* ===================== DESIGN TABLES: monster panels, affixes, special effects, skill classes ===================== */
// Monster stat panels at reference level `lv` (same stats as the hero panel). Actual stats scale by (lv+10)/(ref+10).
// hp already includes elite/boss toughness; bosses may have many times the hero's HP.
const MON_PANEL = {
  mush: { lv: 4, hp: 17, atk: 9, def: 9, spa: 8, spd: 9, spe: 7 },
  bird: { lv: 4, hp: 17, atk: 9, def: 8, spa: 8, spd: 8, spe: 10, eva: 3 },
  pebble: { lv: 5, hp: 19, atk: 10, def: 11, spa: 8, spd: 9, spe: 7 },
  slime: { lv: 5, hp: 21, atk: 9, def: 9, spa: 10, spd: 10, spe: 8 },
  fox: { lv: 8, hp: 26, atk: 14, def: 12, spa: 14, spd: 13, spe: 16, crit: 8 },
  bee: { lv: 8, hp: 25, atk: 13, def: 12, spa: 14, spd: 12, spe: 17, eva: 5 },
  frog: { lv: 8, hp: 28, atk: 13, def: 13, spa: 13, spd: 13, spe: 12 },
  wolf: { lv: 8, hp: 31, atk: 15, def: 14, spa: 12, spd: 13, spe: 16, crit: 10 },
  flower: { lv: 11, hp: 40, atk: 19, def: 20, spa: 22, spd: 21, spe: 16 },
  croc: { lv: 12, hp: 45, atk: 25, def: 23, spa: 19, spd: 20, spe: 19 },
  thornMush: { lv: 10, hp: 31, atk: 15, def: 16, spa: 16, spd: 16, spe: 12 },
  nightBird: { lv: 10, hp: 31, atk: 17, def: 15, spa: 16, spd: 15, spe: 19, eva: 6 },
  leafFox: { lv: 11, hp: 33, atk: 19, def: 16, spa: 18, spd: 17, spe: 21, crit: 8 },
  mossGiant: { lv: 13, hp: 50, atk: 25, def: 27, spa: 21, spd: 22, spe: 15 },
  caveBat: { lv: 15, hp: 43, atk: 25, def: 20, spa: 21, spd: 20, spe: 30, eva: 8 },
  mudSlime: { lv: 15, hp: 47, atk: 21, def: 23, spa: 23, spd: 23, spe: 15 },
  crystalPebble: { lv: 16, hp: 45, atk: 25, def: 32, spa: 21, spd: 24, spe: 16 },
  golem: { lv: 14, hp: 105, atk: 21, def: 30, spa: 20, spd: 23, spe: 17, crit: 8 },
  crystalGolem: { lv: 18, hp: 250, atk: 30, def: 40, spa: 29, spd: 34, spe: 24, crit: 10, hit: 5 },
};

// Random affix table. slots: which gear slots may roll it. min/max are for tier 1; higher tiers scale +35% per tier.
const AFFIX_TABLE = {
  atk: { n: '物攻', key: 'atk', min: 1, max: 3, slots: ['weapon', 'acc'], w: 10 },
  spa: { n: '魔攻', key: 'spa', min: 1, max: 3, slots: ['weapon', 'acc'], w: 10 },
  def: { n: '物防', key: 'def', min: 1, max: 3, slots: ['head', 'body', 'feet', 'acc'], w: 10 },
  spd: { n: '魔防', key: 'spd', min: 1, max: 3, slots: ['head', 'body', 'feet', 'acc'], w: 10 },
  spe: { n: '速度', key: 'spe', min: 1, max: 3, slots: ['feet', 'head', 'acc'], w: 8 },
  hp: { n: 'HP', key: 'hp', min: 3, max: 8, slots: ['head', 'body', 'feet', 'acc'], w: 10 },
  crit: { n: '會心', key: 'crit', pct: 1, min: 2, max: 5, slots: ['weapon', 'head', 'acc'], w: 8 },
  hit: { n: '命中', key: 'hit', pct: 1, min: 3, max: 7, slots: ['weapon', 'head', 'acc'], w: 6 },
  eva: { n: '迴避', key: 'eva', pct: 1, min: 2, max: 4, slots: ['feet', 'body', 'acc'], w: 6 },
  drain: { n: '吸血', key: 'drain', pct: 1, min: 2, max: 5, slots: ['weapon', 'acc'], w: 4 },
  elem: { n: '屬性傷害', key: 'elem', pct: 1, min: 3, max: 8, slots: ['weapon', 'acc'], w: 5 },
  vs: { n: '對{t}系傷害', key: 'vs', pct: 1, min: 8, max: 14, typed: 1, slots: ['weapon', 'acc'], w: 6 },
  resist: { n: '{t}系抗性', key: 'resist', pct: 1, min: 8, max: 14, typed: 1, slots: ['head', 'body', 'feet', 'acc'], w: 6 },
};

// Special effects: gameplay-changing, found on 金 gear from elites, bosses and hidden content.
const SPECIALS = {
  double: { n: '連擊', d: '物理攻擊有25%機率追加一次50%的攻擊。' },
  thorns: { n: '荊棘反傷', d: '受到攻擊時，把25%的傷害反彈給對手。' },
  guardHeal: { n: '守護之心', d: '選擇「防禦」時回復15%最大HP。' },
  regen: { n: '再生', d: '每回合結束時回復6%最大HP。' },
  endure: { n: '不屈', d: '每場戰鬥一次，受到致命傷害時以1HP撐住。' },
  first: { n: '先發制人', d: '每場戰鬥的第一回合必定先出手。' },
  pierce: { n: '破甲', d: '物理攻擊無視對手30%的物防。' },
  lastStand: { n: '背水', d: 'HP越低傷害越高，最多+50%。' },
  freeCast: { n: '魔力循環', d: '使用技能時有30%機率不消耗PP。' },
  fervor: { n: '狂熱', d: '每次攻擊後物攻提升1階，最多3次。' },
  wisdom: { n: '異界共鳴', d: '獲得的經驗值+50%。' },
  fortune: { n: '淘金', d: '獲得的金錢+50%，裝備掉落率加倍。' },
  stormMark: { n: '雷紋', d: '攻擊時有15%機率讓對手麻痺。' },
};
Object.assign(GEAR.fangDagger, { fx: ['double'] }); Object.assign(GEAR.thornRing, { fx: ['thorns'] }); Object.assign(GEAR.scaleArmor, { fx: ['guardHeal'] });
Object.assign(GEAR.mossBracer, { fx: ['regen'] }); Object.assign(GEAR.golemVisor, { fx: ['endure'] }); Object.assign(GEAR.dawnSword, { fx: ['first', 'pierce'] });
Object.assign(GEAR.crystalHeart, { fx: ['lastStand', 'freeCast'] }); Object.assign(GEAR.moonCharm, { fx: ['wisdom'] });

// Skill classes (internal) + a unique visual effect per skill.
const SKILL_CLASS = { slash: '斬擊', pierce: '突刺', strike: '打擊', claw: '爪擊', bite: '撕咬', proj: '投射', bolt: '魔法彈', area: '範圍魔法', drain: '吸取', powder: '粉末', sound: '聲波', buff: '強化', debuff: '弱化', heal: '治療', guard: '防護', charge: '蓄力' };
const MOVE_META = {
  slash: ['slash', 'slash'], powerSlash: ['slash', 'powerSlash'], bladeStorm: ['slash', 'bladeStorm'], recklessSlash: ['slash', 'reckless'], dawnBreak: ['slash', 'dawnBreak'], armorBreak: ['slash', 'armorBreak'],
  flameSlash: ['slash', 'fireSlash'], blaze: ['slash', 'blaze'], leafBlade: ['slash', 'leaf'], gale: ['pierce', 'gale'], peck: ['pierce', 'peck'], poisonSting: ['pierce', 'sting'],
  tackle: ['strike', 'hit'], struggle: ['strike', 'hit'], guardStrike: ['strike', 'guardStrike'], quickAttack: ['strike', 'quick'], vineWhip: ['strike', 'vine'], stomp: ['strike', 'stomp'], lick: ['strike', 'lick'],
  scratch: ['claw', 'scratch'], bite: ['bite', 'bite'],
  bubble: ['proj', 'bubble'], waterGun: ['proj', 'waterGun'], ember: ['proj', 'ember'], acid: ['proj', 'acid'], rockThrow: ['proj', 'rock'],
  aquaBlade: ['bolt', 'water'], manaBurst: ['bolt', 'manaBurst'], shock: ['bolt', 'spark'],
  thunder: ['area', 'thunder'], thunderstorm: ['area', 'thunderstorm'], inferno: ['area', 'inferno'], gust: ['area', 'wind'], rockSlide: ['area', 'rockSlide'],
  absorb: ['drain', 'drain'], megaDrain: ['drain', 'megaDrain'], poisonPowder: ['powder', 'powder'], sleepPowder: ['powder', 'powderS'],
  growl: ['sound', 'sound'], sing: ['sound', 'sing'], ancientRoar: ['sound', 'roar'],
  focus: ['buff', 'focus'], harden: ['buff', 'harden'], ironWall: ['buff', 'ironWall'], howl: ['buff', 'howl'], agility: ['buff', 'agility'],
  glare: ['debuff', 'glare'], tailWhip: ['debuff', 'tailWhip'], thunderWave: ['debuff', 'thunderWave'],
  crystalSpark: ['bolt', 'spark'], prismRay: ['area', 'prismRay'],
  heal: ['heal', 'heal'], holyLight: ['heal', 'holyLight'], barrier: ['guard', 'barrier'], golemFist: ['charge', 'bigRock'],
};
for (const k in MOVE_META) if (MOVES[k]) { MOVES[k].cls = MOVE_META[k][0]; MOVES[k].fx = MOVE_META[k][1]; }
