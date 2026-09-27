/* ===================== v23 advanced classes get their own full skill tree =====================
   Playtest: 「職業要有自己的完整技能樹與玩法，而不是前面的技能都能用，但可以選擇部分技能來用」.
   Until v22 an advanced class = the base tree + 2–4 class nodes, so every earlier skill stayed usable and the classes played
   alike. Now every advanced / hidden class has its own 10-node tree (Lv14 → Lv24): a few core skills it keeps from the base
   class + new ones built around one play style. Skills from earlier classes that are not in the current tree become
   「繼承技能」: learned, but only 2 of them (3 for hidden classes) can be set to be used in battle (08p). Unneeded ones can be
   forgotten for their skill points.
     劍聖   會心・先制      明鏡止水（會心率↑）→ 瞬閃（先制2連）→ 無想劍（必定會心）
     狂戰士 以血換力        戰吼 · 血刃（吸血）· 背水斬（HP越低越痛）· 狂亂連斬 · 修羅斬（付HP的一擊）
     火焰術士 灼燒→引爆      點燃（必定灼傷）→ 爆燃（引爆灼傷）· 炎之壁（碰到會燒傷）· 鳳凰之焰（吸血火）
     雷霆術士 濕透・麻痺      疾雷（先制）· 靜電場（碰到會麻痺）· 過載（對麻痺）· 雷神之怒（3段雷）
     聖騎士 防禦就是攻擊     聖光劍・聖十字審判（物防加進物攻）· 神盾（完全擋下一回合）
     刺客   毒・印記・處決    背刺（對印記必定會心）· 死亡宣告（對中毒×1.5）· 暗殺（殘血×2.2）
     影舞者 迴避・反擊       影分身（替身擋攻擊＋反擊）· 月影舞（迴避中變5連）· 朧月（打完隱身）
     異界勇者 全能          勇者之誓（四項能力全提升）+ 物理／魔法／回復兼備
     魔劍士 魔劍合一         吸魔斬（打回MP）· 元素附魔（技能變成對手弱點屬性）· 魔劍・星蝕（魔攻加進物攻） */

Object.assign(MOVES, {
  // 劍聖
  meikyo: { n: '明鏡止水', t: '一般', cat: '變', pp: 10, stat: null, critBuff: 3, d: '心如止水，看清每一道破綻。3回合內會心率+25%。（不會被魔物的威壓消除）' },
  flashStep: { n: '瞬閃', t: '一般', cat: '物', pow: 40, acc: 100, pp: 15, hits: 2, prio: 1, crit: 1, d: '一瞬間踏進對手懷裡連斬兩刀。必定先出手，容易會心。' },
  mushin: { n: '無想劍', t: '一般', cat: '物', pow: 135, acc: 100, pp: 5, sureCrit: 1, d: '無念無想的奧義一刀。必定會心。' },
  // 狂戰士
  warCry: { n: '戰吼', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 2, def: -1 }, d: '震天的怒吼。物攻大幅提升，但物防下降。' },
  bloodBlade: { n: '血刃', t: '一般', cat: '物', pow: 75, acc: 100, pp: 15, drain: 0.3, d: '飲血的刀刃。造成傷害的30%會回復自己的HP。' },
  lastStand: { n: '背水斬', t: '一般', cat: '物', pow: 60, acc: 100, pp: 10, lowHp: 1.5, d: '越是瀕死越是兇猛。自己損失的HP越多威力越高（最高約2.5倍）。' },
  frenzy: { n: '狂亂連斬', t: '一般', cat: '物', pow: 30, acc: 95, pp: 10, hits: 4, recoil: 0.1, d: '失去理智的四連斬。每一下都能削減護盾，自己會受到少量反作用力傷害。' },
  asura: { n: '修羅斬', t: '一般', cat: '物', pow: 160, acc: 100, pp: 5, hpCost: 0.2, d: '以血為代價的修羅一擊。出手後消耗20%最大HP；HP不夠時無法使用。' },
  // 火焰術士
  kindle: { n: '點燃', t: '火', cat: '特', pow: 35, acc: 100, pp: 20, eff: { st: 'brn', p: 100 }, d: '在對手身上點起火苗。必定讓對手灼傷。' },
  flameWall: { n: '炎之壁', t: '火', cat: '變', pp: 10, shield: 3, aura: { st: 'brn', p: 50, n: '炎之壁' }, d: '築起火焰之牆。3回合內受到的傷害減少40%，用物理攻擊碰到你的魔物有50%機率灼傷。' },
  combust: { n: '爆燃', t: '火', cat: '特', pow: 70, acc: 100, pp: 10, vsSt: { st: 'brn', m: 1.8, eat: 1 }, d: '引爆對手身上的火焰。對灼傷中的對手傷害×1.8，灼傷會被引爆而消失。' },
  phoenix: { n: '鳳凰之焰', t: '火', cat: '特', pow: 115, acc: 100, pp: 5, drain: 0.3, d: '化身不死鳥的烈焰。造成傷害的30%會回復自己的HP。' },
  // 雷霆術士
  quickBolt: { n: '疾雷', t: '雷', cat: '特', pow: 45, acc: 100, pp: 20, prio: 1, eff: { st: 'par', p: 10 }, d: '比聲音更快的一道雷。必定先出手，有時會讓對手麻痺。' },
  staticField: { n: '靜電場', t: '雷', cat: '變', pp: 10, stat: null, aura: { st: 'par', p: 50, n: '靜電場', spe: 1 }, d: '全身纏繞靜電。速度提升；3回合內用物理攻擊碰到你的魔物有50%機率麻痺。' },
  overload: { n: '過載', t: '雷', cat: '特', pow: 70, acc: 100, pp: 10, vsSt: { st: 'par', m: 1.7 }, d: '讓雷電在對手體內失控。對麻痺中的對手傷害×1.7。' },
  raijin: { n: '雷神之怒', t: '雷', cat: '特', pow: 44, acc: 100, pp: 5, hits: 3, eff: { st: 'par', p: 20 }, d: '召喚雷神連降三道神雷。有時會讓對手麻痺。對潮濕的對手會感電。' },
  // 聖騎士
  holyBlade: { n: '聖光劍', t: '一般', cat: '物', pow: 60, acc: 100, pp: 15, addStat: ['def', 0.5], d: '以信念為刃的聖劍。物防的50%會加進物攻，越堅固越強。' },
  aegis: { n: '神盾', t: '一般', cat: '變', pp: 10, prio: 1, stat: null, aegis: 1, d: '舉起神聖的大盾，完全擋下這回合魔物的攻擊（連蓄力的一擊也能擋）。連續使用會失敗。' },
  judgment: { n: '聖十字審判', t: '一般', cat: '物', pow: 95, acc: 100, pp: 5, addStat: ['def', 0.7], shieldHit: 2, d: '從天而降的光之十字。物防的70%會加進物攻，【破盾】額外削減2點護盾。' },
  // 刺客
  backstab: { n: '背刺', t: '一般', cat: '物', pow: 65, acc: 100, pp: 15, critVsMark: 1, d: '繞到背後的一刀。對刻有獵人印記的對手必定會心。' },
  assassinate: { n: '暗殺', t: '一般', cat: '物', pow: 70, acc: 100, pp: 5, execute: { hp: 0.3, m: 2.2 }, d: '一擊必殺的暗殺術。對手HP低於30%時傷害×2.2。' },
  // 影舞者
  afterimage: { n: '影分身', t: '一般', cat: '變', pp: 10, stat: null, clones: 1, d: '分出影子替身（Lv2起2個）。接下來魔物的攻擊會打中分身（完全無效），分身被打散時本體會趁機反擊。持續3回合。' },
  moonDance: { n: '月影舞', t: '一般', cat: '物', pow: 28, acc: 100, pp: 10, hits: 3, hitsUp: 2, d: '月光下的連斬。3連擊；迴避提升中（煙幕彈・幻影步）或有影分身時變成5連擊。' },
  oboro: { n: '朧月', t: '一般', cat: '物', pow: 120, acc: 100, pp: 5, smokeAfter: 2, d: '朧月下的一閃。命中後身影隱入月色，2回合內迴避+30%。' },
  // 異界勇者
  braveOath: { n: '勇者之誓', t: '一般', cat: '變', pp: 5, stat: null, brave: 1, d: '立下勇者的誓言。物攻、物防、魔攻、魔防全部提升一級（3回合）。' },
  // 魔劍士
  manaSlash: { n: '吸魔斬', t: '一般', cat: '物', pow: 60, acc: 100, pp: 20, mpDrain: 0.15, d: '吸取魔力的斬擊。回復造成傷害15%的MP（至少3點）。' },
  enchant: { n: '元素附魔', t: '一般', cat: '變', pp: 10, stat: null, enchant: 3, d: '看穿魔物的弱點，讓劍帶上剋制牠的屬性。3回合內，無屬性的攻擊（含普通攻擊）變成對手弱點的屬性。' },
  starEclipse: { n: '魔劍・星蝕', t: '一般', cat: '物', pow: 130, acc: 100, pp: 5, addStat: ['spa', 0.5], d: '劍氣與魔力完全融合的奧義。魔攻的50%會加進物攻。' },
});
Object.assign(MOVES.deathMark, { vsSt: { st: 'psn', m: 1.5 }, d: '刺客的奧義。對中毒的對手傷害×1.5，容易會心。' });
MOVES.timeStop.fx = 'timeFreeze';
// category (skill dex) / own animation (07w) / MP / attribute scaling
const CT_META = {
  meikyo: ['buff', 'meikyo', 6], flashStep: ['slash', 'flashStep', 8, ['agi', 1]], mushin: ['slash', 'mushin', 20, ['dex', 1.5]],
  warCry: ['buff', 'warCry', 5], bloodBlade: ['slash', 'bloodBlade', 8, ['str', 1]], lastStand: ['slash', 'lastStand', 8, ['str', 1]], frenzy: ['slash', 'frenzy', 10, ['str', 1]], asura: ['slash', 'asura', 14, ['str', 1.5]],
  kindle: ['bolt', 'kindle', 4, ['int', 1]], flameWall: ['guard', 'flameWall', 10], combust: ['area', 'combust', 10, ['int', 1]], phoenix: ['area', 'phoenix', 20, ['int', 1]],
  quickBolt: ['bolt', 'quickBolt', 4, ['int', 1]], staticField: ['buff', 'staticField', 8], overload: ['bolt', 'overload', 10, ['int', 1]], raijin: ['area', 'raijin', 20, ['int', 1]],
  holyBlade: ['slash', 'holyBlade', 8, ['vit', 1]], aegis: ['guard', 'aegis', 8], judgment: ['strike', 'judgment', 18, ['vit', 1.5]],
  backstab: ['pierce', 'backstab', 6, ['dex', 1]], assassinate: ['pierce', 'assassinate', 14, ['luk', 1.5]],
  afterimage: ['buff', 'afterimage', 10], moonDance: ['slash', 'moonDance', 12, ['agi', 1]], oboro: ['slash', 'oboro', 18, ['agi', 1.5]],
  braveOath: ['buff', 'braveOath', 12],
  manaSlash: ['slash', 'manaSlash', 2, ['int', 1]], enchant: ['buff', 'enchant', 10], starEclipse: ['slash', 'starEclipse', 22, ['int', 1]],
};
for (const k in CT_META) { const [c, f, mp, sc] = CT_META[k]; Object.assign(MOVES[k], { cls: c, fx: f }); SKILL_MP[k] = mp; if (sc) MOVES[k].scale = sc; }

// the trees: [skill, class level, required skill, its level]. The first node is the class's signature skill (given on class change).
Object.assign(SKILL_TREES, {
  swordmaster: [['bladeStorm', 14], ['powerSlash', 14], ['doubleSlash', 14], ['focus', 14], ['crossSlash', 14, 'powerSlash', 1], ['meikyo', 16, 'focus', 1], ['iaiSlash', 16, 'bladeStorm', 1], ['flashStep', 18, 'doubleSlash', 2], ['zantetsu', 18, 'crossSlash', 1], ['mushin', 24, 'iaiSlash', 2]],
  berserker: [['recklessSlash', 14], ['powerSlash', 14], ['whirlSlash', 14], ['armorBreak', 14], ['warCry', 14], ['bloodRage', 16, 'recklessSlash', 1], ['bloodBlade', 16, 'powerSlash', 1], ['lastStand', 18, 'bloodRage', 1], ['frenzy', 20, 'whirlSlash', 2], ['asura', 24, 'lastStand', 1]],
  pyromancer: [['inferno', 14], ['fireBolt', 14], ['manaBurst', 14], ['kindle', 14], ['flameWave', 14, 'fireBolt', 1], ['barrier', 16], ['flameWall', 16, 'barrier', 1], ['combust', 18, 'kindle', 1], ['meteor', 20, 'inferno', 1], ['phoenix', 24, 'meteor', 1]],
  stormcaller: [['thunderstorm', 14], ['aquaBlade', 14], ['thunder', 14], ['manaBurst', 14], ['quickBolt', 14], ['chainBolt', 16, 'thunder', 1], ['staticField', 16, 'quickBolt', 1], ['overload', 18, 'chainBolt', 1], ['skyJudge', 20, 'thunderstorm', 1], ['raijin', 24, 'skyJudge', 1]],
  paladin: [['holyLight', 14], ['guardStrike', 14], ['ironWill', 14], ['parry', 14], ['shieldBash', 14, 'guardStrike', 1], ['holyBlade', 16, 'guardStrike', 1], ['barrier', 16], ['sanctuary', 18, 'holyLight', 1], ['aegis', 18, 'ironWill', 1], ['judgment', 24, 'holyBlade', 2]],
  assassin: [['shadowStab', 14], ['venomFang', 14], ['quickDraw', 14], ['hunterMark', 14], ['lacerate', 14], ['toxicBlade', 14, 'venomFang', 1], ['smokeBomb', 16], ['backstab', 16, 'hunterMark', 1], ['deathMark', 18, 'shadowStab', 1], ['assassinate', 22, 'backstab', 1]],
  shadowdancer: [['bladeDance', 14], ['twinStrike', 14], ['quickDraw', 14], ['smokeBomb', 14], ['parry', 14], ['flurry', 14, 'twinStrike', 1], ['afterimage', 16, 'smokeBomb', 1], ['mirage', 18, 'bladeDance', 1], ['moonDance', 20, 'flurry', 1], ['oboro', 24, 'mirage', 1]],
  otherworlder: [['dawnBreak', 14], ['powerSlash', 14], ['crossSlash', 14], ['manaBurst', 14], ['heal', 14], ['riftBlade', 16, 'dawnBreak', 1], ['braveOath', 16], ['barrier', 18], ['timeStop', 20, 'dawnBreak', 1], ['heroSoul', 24, 'riftBlade', 1]],
  spellblade: [['eclipseSlash', 14], ['powerSlash', 14], ['doubleSlash', 14], ['manaBurst', 14], ['barrier', 14], ['manaSlash', 16], ['crossSlash', 16, 'powerSlash', 1], ['arcaneEdge', 18, 'eclipseSlash', 1], ['enchant', 18, 'manaSlash', 1], ['starEclipse', 24, 'arcaneEdge', 1]],
});
// the tree screen shows the class's own tree only; nodes that aren't in the base class's tree get the class dot
skillTreeOf = function (cls) {
  const base = baseClassOf(cls), own = cls && SKILL_TREES[cls], bset = new Set((SKILL_TREES[base] || []).map(n => n[0]));
  if (!own || cls === base) return (SKILL_TREES[base] || []).map(n => ({ id: n[0], clv: n[1], req: n[2], rl: n[3] || 1 }));
  return own.map(n => ({ id: n[0], clv: n[1], req: n[2], rl: n[3] || 1, adv: bset.has(n[0]) ? 0 : 1 }));
};
// a class's 2nd signature (classes table / skill dex) now points at the tree's capstone
for (const k of ['swordmaster', 'berserker', 'pyromancer', 'stormcaller', 'paladin', 'assassin', 'shadowdancer', 'otherworlder', 'spellblade']) { const T = SKILL_TREES[k]; if (CLASSES[k]) Object.assign(CLASSES[k], { move: T[0][0], move2: T[T.length - 1][0], lv2: T[T.length - 1][1] }); }
Object.assign(CLASSES.swordmaster, { d: '會心與先制的劍術。明鏡止水之後，每一刀都可能是致命一擊。' });
Object.assign(CLASSES.berserker, { d: '以血換力。HP越少越兇猛，吸血和捨身的招式讓你在生死邊緣戰鬥。' });
Object.assign(CLASSES.pyromancer, { d: '先點燃、再引爆。灼傷是一切的開始，炎之壁讓近身的魔物也燒起來。' });
Object.assign(CLASSES.stormcaller, { d: '濕透就感電、麻痺就過載。疾雷先制，靜電場讓近身的魔物麻痺。' });
Object.assign(CLASSES.paladin, { d: '防禦就是攻擊。聖劍的威力來自物防，神盾能完全擋下一回合。' });
Object.assign(CLASSES.assassin, { d: '下毒、刻印、處決。背刺對印記必定會心，暗殺專收殘血。' });
Object.assign(CLASSES.shadowdancer, { d: '閃過就反擊。在煙幕和殘影中起舞，迴避越高連擊越多。' });
