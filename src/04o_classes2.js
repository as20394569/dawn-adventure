/* ===================== v19 CLASSES: 遊俠 (4th base class) → 刺客 / 影舞者, hidden 魔劍士 =====================
   遊俠: speed / crit / evasion, multi-hit skills (every hit can chip a break shield) and poison.
   刺客: the first turn's attack is always a critical hit; +30% damage to poisoned foes.
   影舞者: big evasion, counter-attacks after dodging (殘影).
   魔劍士 (hidden, 「流浪的魔劍士」 quest at 銀月湖畔): physical and magic attack feed each other (魔劍共鳴 ×1.5). */
Object.assign(CLASSES, {
  ranger: { n: '遊俠', tier: 1, st: { atk: 2, spe: 3, crit: 4, eva: 3 }, move: 'twinStrike', d: '身手敏捷的獵人。速度、會心、迴避提升。' },
  assassin: { n: '刺客', tier: 2, from: 'ranger', st: { atk: 6, spe: 4, crit: 8, eva: 3, assassin: 1, venomous: 30 }, move: 'shadowStab', move2: 'deathMark', lv2: 18, d: '暗殺的專家。第一回合的攻擊必定會心，對中毒的對手傷害+30%。' },
  shadowdancer: { n: '影舞者', tier: 2, from: 'ranger', st: { atk: 4, spe: 6, crit: 4, eva: 10, shadowStep: 1 }, move: 'bladeDance', move2: 'mirage', lv2: 18, d: '如影般起舞的劍士。迴避大幅提升，閃過攻擊後會立刻反擊。' },
  spellblade: { n: '魔劍士', tier: 3, st: { hp: 8, atk: 5, spa: 5, spd: 3, spe: 3, crit: 4 }, move: 'eclipseSlash', move2: 'arcaneEdge', lv2: 20, d: '隱藏職業。技能會帶有武器的屬性；「魔劍」天賦的魔劍共鳴能讓物攻與魔攻互相加成。' },
});
Object.assign(MOVES, {
  twinStrike: { n: '雙刃連擊', t: '一般', cat: '物', pow: 30, acc: 100, pp: 25, hits: 2, d: '左右手交錯的兩連擊。每一下都能削減護盾。' },
  venomFang: { n: '毒牙刺', t: '毒', cat: '物', pow: 40, acc: 100, pp: 25, eff: { st: 'psn', p: 40 }, d: '用淬毒的刀刺擊。容易讓對手中毒。' },
  quickDraw: { n: '疾射飛刀', t: '一般', cat: '物', pow: 45, acc: 100, pp: 25, prio: 1, d: '比對手更快擲出飛刀。必定先出手。' },
  smokeBomb: { n: '煙幕彈', t: '一般', cat: '變', pp: 15, stat: { who: 'self', spe: 2 }, d: '在煙幕中移動，速度大幅提升。' },
  lacerate: { n: '撕裂', t: '一般', cat: '物', pow: 50, acc: 95, pp: 20, eff: { stat: { def: -1 }, p: 50 }, d: '撕開護甲的一刀。有時會降低對手的物防。' },
  hunterMark: { n: '獵人印記', t: '一般', cat: '變', acc: 100, pp: 15, stat: { who: 'foe', def: -1, spd: -1 }, d: '在對手身上刻下印記，降低物防和魔防。' },
  flurry: { n: '亂舞', t: '一般', cat: '物', pow: 20, acc: 90, pp: 10, hits: 4, d: '瘋狂的四連擊。' },
  toxicBlade: { n: '劇毒刃', t: '毒', cat: '物', pow: 70, acc: 95, pp: 10, eff: { st: 'psn', p: 50 }, d: '塗滿劇毒的刀刃。' },
  shadowStab: { n: '暗影突刺', t: '一般', cat: '物', pow: 100, acc: 95, pp: 5, crit: 1, d: '從影子裡刺出的一擊。容易會心。' },
  deathMark: { n: '死亡宣告', t: '毒', cat: '物', pow: 120, acc: 90, pp: 5, crit: 1, d: '刺客的奧義。對中毒的對手特別致命。' },
  bladeDance: { n: '劍舞', t: '一般', cat: '物', pow: 24, acc: 95, pp: 5, hits: 5, d: '如舞蹈般的五連擊。' },
  mirage: { n: '幻影步', t: '一般', cat: '變', pp: 5, shield: 3, d: '留下幻影護身，3回合內受到的傷害減少。' },
  eclipseSlash: { n: '月蝕斬', t: '一般', cat: '物', pow: 95, acc: 100, pp: 5, d: '劍氣與魔力同時斬出。會帶有武器的屬性。' },
  arcaneEdge: { n: '魔刃千華', t: '一般', cat: '特', pow: 50, acc: 95, pp: 5, hits: 3, d: '無數魔力之刃的三連擊。' },
});
const CLASS2_META = { twinStrike: 'slash', venomFang: 'pierce', quickDraw: 'proj', smokeBomb: 'buff', lacerate: 'slash', hunterMark: 'debuff', flurry: 'slash', toxicBlade: 'slash', shadowStab: 'pierce', deathMark: 'pierce', bladeDance: 'slash', mirage: 'guard', eclipseSlash: 'slash', arcaneEdge: 'bolt' };
for (const k in CLASS2_META) { MOVES[k].cls = CLASS2_META[k]; MOVES[k].fx = k; }
Object.assign(SKILL_MP, { twinStrike: 3, venomFang: 3, quickDraw: 3, smokeBomb: 4, lacerate: 5, hunterMark: 5, flurry: 8, toxicBlade: 9, shadowStab: 12, deathMark: 16, bladeDance: 13, mirage: 14, eclipseSlash: 14, arcaneEdge: 16 });
Object.assign(SKILL_TREES, {
  ranger: [['twinStrike', 1], ['venomFang', 1], ['quickDraw', 3], ['smokeBomb', 8], ['lacerate', 8, 'twinStrike', 1], ['hunterMark', 8, 'venomFang', 1], ['flurry', 11, 'twinStrike', 2], ['leafBlade', 11, 'lacerate', 1], ['voltSlash', 11, 'quickDraw', 1], ['toxicBlade', 16, 'venomFang', 2]],
  assassin: [['shadowStab', 14], ['deathMark', 18, 'shadowStab', 1]], shadowdancer: [['bladeDance', 14], ['mirage', 18, 'bladeDance', 1]],
  spellblade: [['eclipseSlash', 18], ['arcaneEdge', 20, 'eclipseSlash', 1]],
});
CLASS_FREE.ranger = ['twinStrike', 'venomFang'];
CLASS_START.ranger = { moves: ['slash', 'twinStrike', 'venomFang'], gear: ['huntKnife', 'guardBadge'], tag: '迅捷連擊', bars: { 物攻: 3, 魔攻: 1, 防禦: 2, HP: 3 }, pitch: '敏捷的獵人，連擊能快速削減魔物的護盾。' };
CLASS_LINE.ranger = [[7, 'quickDraw'], [9, 'lacerate'], [11, 'flurry'], [13, 'hunterMark'], [15, 'smokeBomb'], [17, 'toxicBlade']];
const CLASS_COL = { swordsman: '#ff9a50', mage: '#b080ff', guardian: '#6ec8ff', ranger: '#7ae070' };
