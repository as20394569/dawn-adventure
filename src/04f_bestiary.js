/* ===================== BESTIARY v16: families (no monster elements), monster-only skills, new monsters, rares, catacomb ===================== */
// Monsters no longer have an element. Elements live on skills (player & monster) and on special weapons.
// Weakness / resistance / status immunity come from the monster's FAMILY (種族). Add a row to extend.
const FAMILIES = {
  beast: { n: '獸族', c: '#c88a4a', weak: ['火'], resist: [], immune: [] },
  insect: { n: '蟲族', c: '#9ab83a', weak: ['火'], resist: ['草'], immune: [] },
  plant: { n: '植物', c: '#4caf50', weak: ['火'], resist: ['水'], immune: [] },
  bird: { n: '飛禽', c: '#6aa8e8', weak: ['雷'], resist: ['草'], immune: [] },
  ooze: { n: '軟泥', c: '#4a9ad8', weak: ['雷'], resist: ['水'], immune: [] },
  aquatic: { n: '水棲', c: '#3a8aa0', weak: ['雷', '草'], resist: ['火', '水'], immune: [] },
  construct: { n: '構造體', c: '#9a8e7a', weak: ['水', '草'], resist: ['雷'], immune: ['psn'] },
  human: { n: '人類', c: '#c8a878', weak: [], resist: [], immune: [] },
  undead: { n: '不死', c: '#9a88c8', weak: ['火'], resist: ['水'], immune: ['psn', 'slp'] },
  spirit: { n: '精靈', c: '#f08a3a', weak: ['水'], resist: ['火'], immune: ['brn'] },
};
const FAM_WEAK = 1.5, FAM_RESIST = 0.6, FOE_POWER = 1.15;
const famOf = b => FAMILIES[b.fam] || null;
function famMult(el, b) { const f = famOf(b); if (!f || !el || el === '一般') return 1; return f.weak.includes(el) ? FAM_WEAK : f.resist.includes(el) ? FAM_RESIST : 1; }
function famBadge(x, fam, X, Y, w = 34) { const f = FAMILIES[fam]; if (!f) return X; x.fillStyle = shade(f.c, -0.45); x.fillRect(X, Y, w, 12); x.fillStyle = f.c; x.fillRect(X, Y, 2, 12); Font.drawC(x, f.n, X + w / 2 + 1, Y - 2, '#ffffff', null, 10); return X + w; }
function famLine(fam) { const f = FAMILIES[fam]; if (!f) return ''; return (f.weak.length ? '弱：' + f.weak.join('') : '弱：—') + '　' + (f.resist.length ? '抗：' + f.resist.join('') : ''); }

/* ---------- Monster-only skills (never learnable by the hero; own names, own VFX in MFX) ---------- */
const MON_MOVES = {
  m_capBonk: { n: '蕈傘頭槌', t: '一般', cat: '物', pow: 35, acc: 95, pp: 30, d: '用硬硬的蕈傘撞過來。' },
  m_poisonSpore: { n: '毒孢子', t: '毒', cat: '變', acc: 75, pp: 20, st: 'psn', d: '噴出一團毒孢子。' },
  m_rootLeech: { n: '吸根', t: '草', cat: '特', pow: 30, acc: 100, pp: 20, drain: 0.5, d: '從地底伸出細根吸取養分。' },
  m_sleepPollen: { n: '睡眠花粉', t: '草', cat: '變', acc: 70, pp: 15, st: 'slp', d: '撒下讓人昏昏欲睡的花粉。' },
  m_toxicCloud: { n: '毒霧', t: '毒', cat: '特', pow: 50, acc: 95, pp: 15, eff: { st: 'psn', p: 20 }, d: '吐出紫色的毒霧。' },
  m_thornVine: { n: '棘藤', t: '草', cat: '物', pow: 45, acc: 100, pp: 25, d: '長滿尖刺的藤蔓抽打過來。' },
  m_thornRain: { n: '荊棘雨', t: '草', cat: '物', pow: 75, acc: 90, pp: 10, d: '從天上灑下無數荊棘。' },
  m_mossArmor: { n: '苔甲', t: '草', cat: '變', pp: 10, stat: { who: 'self', def: 2 }, d: '讓青苔長成厚厚的護甲。' },
  m_rootCrush: { n: '樹根粉碎', t: '草', cat: '物', pow: 70, acc: 95, pp: 10, eff: { flinch: 1, p: 20 }, d: '巨大的樹根從地底竄出。' },
  m_peck: { n: '啄擊', t: '飛', cat: '物', pow: 35, acc: 100, pp: 35, d: '用尖嘴連續啄擊。' },
  m_featherGust: { n: '羽風', t: '飛', cat: '特', pow: 40, acc: 100, pp: 30, d: '拍翅捲起夾著羽毛的風。' },
  m_chirp: { n: '吵鬧啼叫', t: '一般', cat: '變', acc: 100, pp: 30, stat: { who: 'foe', atk: -1 }, d: '尖銳的叫聲讓人心煩意亂。' },
  m_dive: { n: '俯衝', t: '飛', cat: '物', pow: 60, acc: 95, pp: 15, d: '從高空急速俯衝。' },
  m_lullaby: { n: '夜曲', t: '一般', cat: '變', acc: 55, pp: 15, st: 'slp', d: '低沉的夜之歌，讓人睡著。' },
  m_screech: { n: '尖嘯', t: '一般', cat: '變', acc: 100, pp: 20, stat: { who: 'foe', def: -1 }, d: '刺耳的尖嘯讓防禦鬆懈。' },
  m_sonic: { n: '超音波', t: '一般', cat: '特', pow: 50, acc: 95, pp: 15, d: '人耳聽不見的音波衝擊。' },
  m_roll: { n: '滾撞', t: '一般', cat: '物', pow: 35, acc: 95, pp: 30, d: '把身體縮成一團滾過來。' },
  m_harden: { n: '硬化', t: '一般', cat: '變', pp: 30, stat: { who: 'self', def: 1 }, d: '讓身體變得像石頭一樣硬。' },
  m_pebbleToss: { n: '投石', t: '岩', cat: '物', pow: 45, acc: 90, pp: 20, d: '丟出一塊碎石。' },
  m_quake: { n: '震地', t: '岩', cat: '物', pow: 60, acc: 100, pp: 15, eff: { flinch: 1, p: 30 }, d: '重重踏地，讓地面震動。' },
  m_boulder: { n: '巨岩投擲', t: '岩', cat: '物', pow: 60, acc: 90, pp: 15, d: '舉起巨岩丟過來。' },
  m_stoneWall: { n: '石壁', t: '岩', cat: '變', pp: 10, stat: { who: 'self', def: 2 }, d: '在身前築起石壁。' },
  m_rumble: { n: '遠古轟鳴', t: '岩', cat: '變', acc: 100, pp: 10, stat: { who: 'foe', atk: -1, spa: -1 }, d: '來自遠古的轟鳴，讓人喪失鬥志。' },
  m_rockfall: { n: '落岩崩', t: '岩', cat: '物', pow: 75, acc: 90, pp: 10, eff: { flinch: 1, p: 30 }, d: '讓頭頂的岩石崩落。' },
  m_golemFist: { n: '岩石粉碎拳', t: '岩', cat: '物', pow: 100, acc: 100, pp: 5, charge: 1, d: '凝聚大地之力，下一回合全力揮拳。' },
  m_crystalShard: { n: '晶片', t: '岩', cat: '物', pow: 60, acc: 95, pp: 15, d: '射出鋒利的水晶碎片。' },
  m_crystalSpark: { n: '晶雷', t: '雷', cat: '特', pow: 70, acc: 95, pp: 10, eff: { st: 'par', p: 20 }, d: '水晶放出的電流。' },
  m_prismRay: { n: '稜光射線', t: '岩', cat: '特', pow: 80, acc: 90, pp: 10, d: '把光折射成七彩射線。' },
  m_bounce: { n: '彈跳', t: '一般', cat: '物', pow: 35, acc: 95, pp: 30, d: '彈起來壓到對手身上。' },
  m_bubbleSpit: { n: '泡泡吐息', t: '水', cat: '特', pow: 30, acc: 100, pp: 30, eff: { stat: { spe: -1 }, p: 40 }, d: '吐出黏黏的泡泡。有時會降低速度。' },
  m_goo: { n: '黏液', t: '一般', cat: '變', acc: 95, pp: 20, stat: { who: 'foe', spe: -1 }, d: '噴出黏液，讓對手動作變慢。' },
  m_waterBomb: { n: '水彈', t: '水', cat: '特', pow: 50, acc: 95, pp: 15, d: '把身體的水凝成水彈射出。' },
  m_engulf: { n: '吞噬', t: '一般', cat: '物', pow: 50, acc: 90, pp: 15, drain: 0.5, d: '把對手包進身體裡吸收。' },
  m_oreShell: { n: '礦殼', t: '岩', cat: '變', pp: 15, stat: { who: 'self', def: 1, spd: 1 }, d: '讓吞下的礦石浮到表面。' },
  m_acidSpit: { n: '酸液', t: '毒', cat: '特', pow: 40, acc: 100, pp: 25, eff: { stat: { spd: -1 }, p: 40 }, d: '吐出會溶解東西的酸液。' },
  m_claw: { n: '利爪', t: '一般', cat: '物', pow: 40, acc: 100, pp: 35, d: '用利爪抓傷對手。' },
  m_foxfire: { n: '狐火', t: '火', cat: '特', pow: 45, acc: 100, pp: 25, eff: { st: 'brn', p: 10 }, d: '放出搖曳的狐火。' },
  m_pounce: { n: '飛撲', t: '一般', cat: '物', pow: 40, acc: 100, pp: 25, prio: 1, d: '搶先撲向對手。必定先出手。' },
  m_blazeTail: { n: '焰尾', t: '火', cat: '物', pow: 65, acc: 95, pp: 15, eff: { st: 'brn', p: 10 }, d: '用燃燒的尾巴甩打。' },
  m_leafDart: { n: '葉鏢', t: '草', cat: '特', pow: 50, acc: 100, pp: 20, d: '甩出尾巴上鋒利的葉片。' },
  m_bite: { n: '撕咬', t: '一般', cat: '物', pow: 60, acc: 100, pp: 20, eff: { flinch: 1, p: 30 }, d: '用利牙狠狠咬住。' },
  m_howl: { n: '狼嚎', t: '一般', cat: '變', pp: 20, stat: { who: 'self', atk: 1 }, d: '仰天長嚎，提升物攻。' },
  m_rend: { n: '撕裂', t: '一般', cat: '物', pow: 75, acc: 95, pp: 10, d: '用爪牙把對手撕開。' },
  m_sting: { n: '毒刺', t: '毒', cat: '物', pow: 20, acc: 100, pp: 35, eff: { st: 'psn', p: 30 }, d: '用尾針刺擊。有時會讓對手中毒。' },
  m_buzzShock: { n: '振翅電流', t: '雷', cat: '特', pow: 40, acc: 100, pp: 30, eff: { st: 'par', p: 10 }, d: '高速振翅產生電流。' },
  m_static: { n: '靜電', t: '雷', cat: '變', acc: 90, pp: 20, st: 'par', d: '放出靜電讓對手麻痺。' },
  m_swarm: { n: '高速振翅', t: '一般', cat: '變', pp: 20, stat: { who: 'self', spe: 2 }, d: '翅膀振得看不見，速度大幅提升。' },
  m_hornCharge: { n: '甲角衝撞', t: '一般', cat: '物', pow: 55, acc: 95, pp: 20, d: '低下頭用角衝撞。' },
  m_carapace: { n: '甲殼', t: '一般', cat: '變', pp: 20, stat: { who: 'self', def: 1 }, d: '縮進堅硬的甲殼裡。' },
  m_voltHorn: { n: '雷角', t: '雷', cat: '物', pow: 65, acc: 90, pp: 10, eff: { st: 'par', p: 20 }, d: '讓角帶電後刺擊。' },
  m_venomFang: { n: '毒牙', t: '毒', cat: '物', pow: 50, acc: 100, pp: 20, eff: { st: 'psn', p: 30 }, d: '帶毒的獠牙。' },
  m_web: { n: '蛛網', t: '一般', cat: '變', acc: 95, pp: 20, stat: { who: 'foe', spe: -2 }, d: '噴出黏黏的蛛網。' },
  m_silkShot: { n: '吐絲', t: '一般', cat: '特', pow: 40, acc: 100, pp: 25, eff: { stat: { spe: -1 }, p: 50 }, d: '射出堅韌的蛛絲。' },
  m_tongue: { n: '長舌', t: '一般', cat: '物', pow: 30, acc: 100, pp: 30, eff: { st: 'par', p: 30 }, d: '伸出黏黏的長舌頭。' },
  m_mudShot: { n: '泥漿彈', t: '水', cat: '特', pow: 45, acc: 95, pp: 20, eff: { stat: { spe: -1 }, p: 50 }, d: '吐出濕黏的泥漿。' },
  m_jaw: { n: '巨顎', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, eff: { flinch: 1, p: 30 }, d: '張開巨顎咬下。' },
  m_tailSlam: { n: '甩尾', t: '水', cat: '物', pow: 65, acc: 95, pp: 15, d: '甩動濕淋淋的粗尾巴。' },
  m_scaleGuard: { n: '鱗甲', t: '一般', cat: '變', pp: 15, stat: { who: 'self', def: 1 }, d: '豎起全身的鱗片。' },
  m_knife: { n: '匪刃', t: '一般', cat: '物', pow: 45, acc: 100, pp: 30, d: '揮舞生鏽的短刀。' },
  m_dirtyKick: { n: '陰險踢', t: '一般', cat: '物', pow: 40, acc: 100, pp: 20, prio: 1, d: '趁人不備踢過來。必定先出手。' },
  m_taunt: { n: '挑釁', t: '一般', cat: '變', acc: 100, pp: 20, stat: { who: 'foe', def: -1 }, d: '惡毒的嘲笑讓人失去冷靜。' },
  m_throwDagger: { n: '飛刀', t: '一般', cat: '物', pow: 50, acc: 95, pp: 15, d: '甩出藏在袖子裡的飛刀。' },
  m_gutSlash: { n: '斷骨砍', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, eff: { stat: { def: -1 }, p: 100 }, d: '連骨頭一起砍斷的一斧。必定降低物防。' },
  m_warCry: { n: '戰吼', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 1 }, d: '野蠻的吼聲，提升物攻。' },
  m_axeSpin: { n: '旋風斧', t: '一般', cat: '物', pow: 120, acc: 100, pp: 5, charge: 1, chargeMsg: '高高舉起了戰斧，開始旋轉！', warn: '（下一擊非常危險……選擇「防禦」！）', d: '蓄力後揮出的旋轉巨斧。' },
  m_emberSpit: { n: '火唾', t: '火', cat: '特', pow: 40, acc: 100, pp: 25, eff: { st: 'brn', p: 10 }, d: '吐出一團火星。' },
  m_flare: { n: '爆燃', t: '火', cat: '特', pow: 60, acc: 95, pp: 15, eff: { st: 'brn', p: 10 }, d: '全身猛烈燃燒爆開。' },
  m_heatHaze: { n: '熱浪', t: '火', cat: '變', acc: 100, pp: 15, stat: { who: 'foe', spa: -1, spd: -1 }, d: '扭曲空氣的熱浪讓人頭暈。' },
  m_flicker: { n: '閃爍', t: '一般', cat: '變', pp: 20, stat: { who: 'self', spe: 1, spa: 1 }, d: '火光忽明忽暗，越燒越旺。' },
  m_boneClub: { n: '骨棒', t: '一般', cat: '物', pow: 55, acc: 95, pp: 20, d: '揮舞粗大的骨頭。' },
  m_rattle: { n: '骨鳴', t: '一般', cat: '變', acc: 100, pp: 20, stat: { who: 'foe', def: -1 }, d: '全身骨頭喀啦作響，讓人發毛。' },
  m_boneThrow: { n: '投骨', t: '一般', cat: '物', pow: 45, acc: 95, pp: 20, d: '把骨頭像迴力鏢一樣丟出。' },
  m_ghostFire: { n: '鬼火', t: '火', cat: '特', pow: 50, acc: 95, pp: 15, eff: { st: 'brn', p: 20 }, d: '青白色的鬼火纏上身來。' },
  m_soulSip: { n: '吸魂', t: '一般', cat: '特', pow: 40, acc: 100, pp: 15, drain: 0.5, d: '吸走對手的一部分靈魂。' },
  m_wail: { n: '哀嚎', t: '一般', cat: '變', acc: 100, pp: 15, stat: { who: 'foe', spe: -2 }, d: '悲慘的哀嚎讓人雙腿發軟。' },
  m_hex: { n: '咒縛', t: '一般', cat: '變', acc: 95, pp: 15, stat: { who: 'foe', atk: -1, spd: -1 }, d: '以詛咒纏住對手。' },
  m_drownHand: { n: '溺水之手', t: '水', cat: '特', pow: 60, acc: 95, pp: 15, d: '從水中伸出無數隻手。' },
  m_chillMist: { n: '寒霧', t: '水', cat: '特', pow: 45, acc: 100, pp: 20, eff: { stat: { spe: -1 }, p: 40 }, d: '冰冷刺骨的水霧。' },
  m_darkPulse: { n: '冥波', t: '一般', cat: '特', pow: 70, acc: 95, pp: 10, eff: { flinch: 1, p: 20 }, d: '從冥界湧出的黑色波動。' },
  m_boneRush: { n: '骨牙連擊', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, d: '用骨頭獠牙連續咬擊。' },
  m_runeBeam: { n: '符文光', t: '雷', cat: '特', pow: 70, acc: 95, pp: 10, eff: { st: 'par', p: 10 }, d: '身上的符文放出雷光。' },
  m_darkSlash: { n: '冥刃', t: '一般', cat: '物', pow: 85, acc: 95, pp: 10, d: '纏著黑霧的斬擊。' },
  m_boneShield: { n: '骸骨盾擊', t: '一般', cat: '物', pow: 60, acc: 100, pp: 15, eff: { flinch: 1, p: 30 }, d: '用骨盾狠狠撞過來。' },
  m_deathCry: { n: '亡者戰吼', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 1, def: 1 }, d: '亡者的戰吼，提升物攻和物防。' },
};
// internal class for every monster skill (for VFX/management); fx id = move id → MFX[id]
const MON_CLASS = {
  claw: ['m_claw', 'm_rend'], bite: ['m_bite', 'm_venomFang', 'm_jaw', 'm_boneRush'], strike: ['m_capBonk', 'm_roll', 'm_bounce', 'm_hornCharge', 'm_tongue', 'm_boneClub', 'm_boneShield', 'm_tailSlam', 'm_dirtyKick', 'm_pounce'],
  slash: ['m_knife', 'm_gutSlash', 'm_darkSlash', 'm_axeSpin'], pierce: ['m_peck', 'm_dive', 'm_sting', 'm_voltHorn'], proj: ['m_pebbleToss', 'm_boulder', 'm_crystalShard', 'm_throwDagger', 'm_boneThrow', 'm_leafDart', 'm_silkShot', 'm_mudShot', 'm_acidSpit', 'm_emberSpit'],
  bolt: ['m_waterBomb', 'm_bubbleSpit', 'm_foxfire', 'm_ghostFire', 'm_buzzShock', 'm_crystalSpark', 'm_runeBeam', 'm_sonic'], area: ['m_quake', 'm_rockfall', 'm_thornRain', 'm_toxicCloud', 'm_featherGust', 'm_flare', 'm_prismRay', 'm_drownHand', 'm_chillMist', 'm_darkPulse', 'm_rootCrush', 'm_thornVine', 'm_blazeTail'],
  drain: ['m_rootLeech', 'm_engulf', 'm_soulSip'], powder: ['m_poisonSpore', 'm_sleepPollen'], sound: ['m_chirp', 'm_lullaby', 'm_screech', 'm_rattle', 'm_wail'],
  buff: ['m_mossArmor', 'm_harden', 'm_stoneWall', 'm_oreShell', 'm_howl', 'm_swarm', 'm_carapace', 'm_scaleGuard', 'm_warCry', 'm_flicker', 'm_deathCry'], debuff: ['m_rumble', 'm_goo', 'm_static', 'm_web', 'm_taunt', 'm_heatHaze', 'm_hex'], charge: ['m_golemFist'],
};
// retire the old shared monster moves; the hero never had them
for (const k of ['tackle', 'growl', 'tailWhip', 'scratch', 'peck', 'gust', 'absorb', 'megaDrain', 'poisonPowder', 'sleepPowder', 'vineWhip', 'bubble', 'waterGun', 'ember', 'shock', 'thunderWave', 'poisonSting', 'acid', 'harden', 'ironWall', 'rockThrow', 'rockSlide', 'bite', 'howl', 'quickAttack', 'sing', 'lick', 'agility', 'stomp', 'ancientRoar', 'golemFist', 'crystalSpark', 'prismRay', 'axeSpin']) delete MOVES[k];
Object.assign(MOVES, MON_MOVES);
for (const c in MON_CLASS) for (const k of MON_CLASS[c]) { MOVES[k].cls = c; MOVES[k].fx = k; MOVES[k].foe = 1; }

/* ---------- Existing species → family + monster-only learnsets ---------- */
const FAM_SET = {
  mush: ['plant', [[1, 'm_capBonk'], [1, 'm_poisonSpore'], [6, 'm_rootLeech'], [10, 'm_sleepPollen']]],
  bird: ['bird', [[1, 'm_peck'], [1, 'm_chirp'], [5, 'm_featherGust'], [9, 'm_dive']]],
  pebble: ['construct', [[1, 'm_roll'], [1, 'm_harden'], [4, 'm_pebbleToss'], [9, 'm_quake']]],
  slime: ['ooze', [[1, 'm_bounce'], [1, 'm_goo'], [4, 'm_bubbleSpit'], [9, 'm_waterBomb']]],
  fox: ['beast', [[1, 'm_claw'], [1, 'm_foxfire'], [6, 'm_pounce'], [10, 'm_blazeTail']]],
  bee: ['insect', [[1, 'm_sting'], [1, 'm_buzzShock'], [7, 'm_static'], [10, 'm_swarm']]],
  frog: ['aquatic', [[1, 'm_tongue'], [1, 'm_acidSpit'], [6, 'm_mudShot'], [10, 'm_scaleGuard']]],
  wolf: ['beast', [[1, 'm_bite'], [1, 'm_howl'], [1, 'm_pounce'], [1, 'm_rend']]],
  flower: ['plant', [[1, 'm_thornVine'], [1, 'm_rootLeech'], [1, 'm_sleepPollen'], [1, 'm_thornRain']]],
  croc: ['aquatic', [[1, 'm_jaw'], [1, 'm_tailSlam'], [1, 'm_mudShot'], [1, 'm_scaleGuard']]],
  thornMush: ['plant', [[1, 'm_capBonk'], [1, 'm_poisonSpore'], [1, 'm_rootLeech'], [10, 'm_toxicCloud']]],
  nightBird: ['bird', [[1, 'm_peck'], [1, 'm_featherGust'], [1, 'm_lullaby'], [11, 'm_dive']]],
  leafFox: ['beast', [[1, 'm_claw'], [1, 'm_leafDart'], [1, 'm_pounce'], [12, 'm_rend']]],
  mossGiant: ['plant', [[1, 'm_rootCrush'], [1, 'm_quake'], [1, 'm_mossArmor'], [1, 'm_rootLeech']]],
  caveBat: ['bird', [[1, 'm_dive'], [1, 'm_screech'], [1, 'm_sonic'], [10, 'm_lullaby']]],
  mudSlime: ['ooze', [[1, 'm_bounce'], [1, 'm_waterBomb'], [1, 'm_engulf'], [1, 'm_goo']]],
  crystalPebble: ['construct', [[1, 'm_crystalShard'], [1, 'm_harden'], [1, 'm_quake'], [1, 'm_crystalSpark']]],
  crystalGolem: ['construct', [[1, 'm_crystalShard'], [1, 'm_quake'], [1, 'm_prismRay'], [1, 'm_rumble']]],
  golem: ['construct', [[1, 'm_boulder'], [1, 'm_quake'], [1, 'm_stoneWall'], [1, 'm_rumble']]],
  mineBat: ['bird', [[1, 'm_peck'], [1, 'm_screech'], [1, 'm_sonic'], [1, 'm_featherGust']]],
  oreSlime: ['ooze', [[1, 'm_bounce'], [1, 'm_oreShell'], [1, 'm_pebbleToss'], [1, 'm_acidSpit']]],
  bandit: ['human', [[1, 'm_knife'], [1, 'm_dirtyKick'], [1, 'm_taunt'], [12, 'm_throwDagger']]],
  banditBoss: ['human', [[1, 'm_gutSlash'], [1, 'm_warCry'], [1, 'm_dirtyKick'], [1, 'm_knife']]],
};
for (const k in FAM_SET) { const s = SPECIES[k]; s.fam = FAM_SET[k][0]; s.learn = FAM_SET[k][1]; delete s.t; }

/* ---------- New monster art (front-facing, 64×64 design space) ---------- */
ART.thunderBeetle = { parts: sym([
  { s: 'e', x: 13, y: 52, rx: 7, ry: 2.2, rot: 0.5, c: '#23233a', m: 1 },
  { s: 'e', x: 12, y: 40, rx: 7, ry: 2.2, rot: -0.35, c: '#23233a', m: 1 },
  { s: 'e', x: 32, y: 45, rx: 19, ry: 15, c: '#3a4aa8', id: 'shell' },
  { s: 'e', x: 24, y: 42, rx: 4, ry: 9, c: '#7a90f0', line: false, clip: 'shell', m: 1 },
  { s: 'e', x: 32, y: 29, rx: 11, ry: 7.5, c: '#262e6a' },
  { s: 'p', pts: [[27, 30], [21, 36], [25, 36]], c: '#e8e0c8', m: 1 },
  { s: 'p', pts: [[29, 26], [35, 26], [37, 12], [33, 2], [31, 10], [28, 14]], c: '#f4d23a' },
]), details: symD([
  { s: 'eye', x: 26.5, y: 28, w: 1.6, h: 2, c: '#fff4a0', m: 1 },
  { s: 'line', pts: [[32, 32], [32, 59]], c: '#18183a' },
  { s: 'line', pts: [[23, 46], [27, 42], [25, 50], [29, 47]], c: '#fff080', m: 1 },
]) };
ART.emberSpirit = { parts: sym([
  { s: 'e', x: 12, y: 14, rx: 2.5, ry: 3, c: '#ffb040', m: 1 },
  { s: 'p', pts: [[32, 3], [40, 16], [50, 22], [49, 42], [41, 56], [23, 56], [15, 42], [14, 22], [24, 16]], c: '#e0461a', id: 'f' },
  { s: 'p', pts: [[32, 14], [38, 24], [43, 34], [40, 50], [24, 50], [21, 34], [26, 24]], c: '#ff9a2a', line: false, clip: 'f' },
  { s: 'e', x: 32, y: 41, rx: 10, ry: 10, c: '#fff0a0', line: false, clip: 'f', glow: 1 },
]), details: symD([
  { s: 'eye', x: 28, y: 39, w: 1.8, h: 3, c: '#6a1400', m: 1 },
  { s: 'line', pts: [[29, 46], [32, 48], [35, 46]], c: '#6a1400' },
]) };
function skeletonDef(o) {
  const bone = o.bone || '#e8e0c8', dark = o.dark || '#2e2820';
  return { parts: sym([
    { s: 'e', x: 26, y: 56, rx: 3, ry: 7, c: bone, m: 1 },
    { s: 'e', x: 32, y: 47, rx: 8, ry: 3, c: shade(bone, -0.08) },
    { s: 'e', x: 18, y: 39, rx: 2.8, ry: 9, rot: 0.3, c: bone, m: 1 },
    { s: 'e', x: 32, y: 37, rx: 10, ry: 8.5, c: bone, id: 'rib' },
    { s: 'e', x: 32, y: 38, rx: 7, ry: 5.5, c: dark, line: false, clip: 'rib' },
    ...(o.armor ? [{ s: 'e', x: 32, y: 38, rx: 12, ry: 10, c: o.armor, id: 'plate' }, { s: 'e', x: 32, y: 35, rx: 5, ry: 4, c: shade(o.armor, 0.3), line: false, clip: 'plate' }] : []),
    { s: 'e', x: 32, y: 20, rx: 10, ry: 10, c: shade(bone, 0.06), id: 'sk' },
    { s: 'e', x: 32, y: 29, rx: 6, ry: 3, c: bone },
    ...(o.helm ? [{ s: 'p', pts: [[21, 18], [22, 9], [32, 5], [42, 9], [43, 18], [39, 14], [25, 14]], c: o.helm }, { s: 'p', pts: [[30, 6], [34, 6], [36, -2], [30, 0]], c: o.plume || '#a02030' }] : []),
    ...(o.shield ? [{ s: 'p', pts: [[4, 32], [18, 30], [18, 50], [11, 58], [4, 50]], c: o.shield }] : []),
    { s: 'p', pts: o.sword ? [[49, 52], [52, 52], [55, 18], [53, 14], [51, 18]] : [[48, 50], [51, 50], [56, 28], [53, 26]], c: o.sword || bone },
    ...(o.sword ? [{ s: 'p', pts: [[45, 50], [56, 50], [56, 53], [45, 53]], c: '#4a3a30' }] : [{ s: 'e', x: 55, y: 25, rx: 4, ry: 4, c: bone }]),
  ]), details: symD([
    { s: 'ell', x: 28, y: 20, rx: 2.8, ry: 3.2, c: '#140e0a', m: 1 },
    { s: 'dot', x: 28, y: 20, c: o.eye || '#60f0ff', m: 1 },
    { s: 'poly', pts: [[31, 24], [33, 24], [32, 26]], c: '#140e0a' },
    { s: 'line', pts: [[28, 29], [36, 29]], c: '#5a5040' },
    ...(o.armor ? [] : [{ s: 'line', pts: [[25, 34], [39, 34]], c: '#8a806a' }, { s: 'line', pts: [[25, 38], [39, 38]], c: '#8a806a' }, { s: 'line', pts: [[26, 42], [38, 42]], c: '#8a806a' }]),
  ]) };
}
ART.skeleton = skeletonDef({});
ART.boneKnight = skeletonDef({ bone: '#d8d0bc', armor: '#4a5068', helm: '#3a4058', shield: '#5a4a6a', sword: '#b8c4d8', eye: '#ff4060', plume: '#8a2030' });
ART.goldSkeleton = skeletonDef({ bone: '#f4cc48', dark: '#5a3a08', eye: '#ffffff' });
ART.ghostLamp = { parts: sym([
  { s: 'e', x: 32, y: 7, rx: 5, ry: 4, c: '#5a4a3a' },
  { s: 'p', pts: [[20, 17], [44, 17], [40, 10], [24, 10]], c: '#4a3a30' },
  { s: 'e', x: 32, y: 33, rx: 13, ry: 16, c: '#34525e', id: 'glass' },
  { s: 'p', pts: [[32, 19], [39, 31], [37, 44], [27, 44], [25, 31]], c: '#7af0cc', line: false, clip: 'glass', glow: 1 },
  { s: 'p', pts: [[21, 48], [43, 48], [39, 54], [25, 54]], c: '#4a3a30' },
  { s: 'p', pts: [[26, 54], [38, 54], [37, 61], [33, 57], [30, 63], [27, 58]], c: '#9ae8d8', noShade: 1 },
]), details: symD([
  { s: 'line', pts: [[26, 20], [24, 46]], c: '#2a2018', m: 1 },
  { s: 'ell', x: 29, y: 34, rx: 1.6, ry: 2.4, c: '#0a3a30', m: 1 },
  { s: 'line', pts: [[30, 39], [32, 40], [34, 39]], c: '#0a3a30' },
]) };
ART.caveSpider = { parts: sym([
  { s: 'p', pts: [[24, 36], [12, 18], [15, 16], [27, 33]], c: '#2e1e30', m: 1 },
  { s: 'p', pts: [[22, 40], [5, 30], [3, 34], [20, 44]], c: '#2e1e30', m: 1 },
  { s: 'p', pts: [[22, 46], [4, 48], [4, 52], [22, 50]], c: '#2e1e30', m: 1 },
  { s: 'p', pts: [[24, 50], [10, 62], [14, 62], [26, 53]], c: '#2e1e30', m: 1 },
  { s: 'e', x: 32, y: 45, rx: 16, ry: 13, c: '#4a2a4c', id: 'ab' },
  { s: 'e', x: 32, y: 47, rx: 5, ry: 6.5, c: '#d03040', line: false, clip: 'ab' },
  { s: 'e', x: 32, y: 31, rx: 10, ry: 8, c: '#3a2038' },
  { s: 'p', pts: [[28, 36], [30, 36], [29, 43]], c: '#ece4d4', m: 1 },
]), details: symD([
  { s: 'ell', x: 28.5, y: 29, rx: 1.6, ry: 1.6, c: '#ff3040', m: 1 },
  { s: 'dot', x: 30.5, y: 26, c: '#ff6070', m: 1 },
  { s: 'dot', x: 26, y: 26.5, c: '#ff6070', m: 1 },
]) };
ART.wraith = { parts: sym([
  { s: 'p', pts: [[12, 32], [2, 44], [8, 47], [17, 40]], c: '#4a3e66', m: 1 },
  { s: 'e', x: 5, y: 46, rx: 3, ry: 2.5, c: '#c8c0e0', m: 1 },
  { s: 'p', pts: [[32, 5], [46, 13], [52, 32], [54, 50], [48, 58], [43, 51], [38, 60], [32, 52], [26, 60], [21, 51], [16, 58], [10, 50], [12, 32], [18, 13]], c: '#5e4e84', id: 'g' },
  { s: 'e', x: 32, y: 24, rx: 11, ry: 12, c: '#150f22', line: false, clip: 'g' },
]), details: symD([
  { s: 'ell', x: 28, y: 24, rx: 2.2, ry: 1.5, c: '#ff4060', m: 1 },
  { s: 'dot', x: 28, y: 24, c: '#ffd0d8', m: 1 },
]) };
ART.drownedSoul = recolorDef(ART.wraith, hueShift(-80, 0.9, 1.1));
ART.paleWraith = recolorDef(ART.wraith, hueShift(0, 0.15, 1.7));
ART.boneHound = { parts: sym([
  { s: 'e', x: 22, y: 56, rx: 3, ry: 7, c: '#d8d0b8', m: 1 },
  { s: 'e', x: 32, y: 45, rx: 16, ry: 10, c: '#e0d8c0', id: 'b' },
  { s: 'e', x: 32, y: 46, rx: 12, ry: 7, c: '#221c1a', line: false, clip: 'b' },
  { s: 'p', pts: [[15, 32], [19, 14], [25, 21], [32, 9], [39, 21], [45, 14], [49, 32]], c: '#8a3ac8', glow: 1 },
  { s: 'p', pts: [[21, 22], [15, 5], [27, 16]], c: '#d8d0b8', m: 1 },
  { u: [{ s: 'e', x: 32, y: 26, rx: 12, ry: 9 }, { s: 'e', x: 32, y: 35, rx: 7, ry: 6 }], c: '#ece4d0', id: 'h' },
]), details: symD([
  { s: 'ell', x: 27, y: 26, rx: 2.6, ry: 2.2, c: '#140e0a', m: 1 },
  { s: 'dot', x: 27, y: 26, c: '#d070ff', m: 1 },
  { s: 'line', pts: [[27, 37], [37, 37]], c: '#5a5040' },
  { s: 'line', pts: [[24, 44], [40, 44]], c: '#9a907a' }, { s: 'line', pts: [[25, 48], [39, 48]], c: '#9a907a' },
]) };
ART.runeGolem = recolorDef(ART.golem, hueShift(170, 0.35, 0.72));
ART.runeGolem.details = (ART.runeGolem.details || []).concat([{ s: 'line', pts: [[26, 34], [30, 30], [34, 34], [38, 30]], c: '#60e8ff' }, { s: 'line', pts: [[28, 42], [36, 42]], c: '#60e8ff' }, { s: 'line', pts: [[32, 38], [32, 46]], c: '#60e8ff' }]);
ART.goldSlime = recolorDef(ART.slime, hueShift(-165, 1.3, 1.1));
ART.gemSlime = recolorDef(ART.oreSlime || ART.slime, hueShift(95, 2.2, 1.1));
ART.moonFox = recolorDef(ART.fox, hueShift(185, 0.35, 1.2));
ART.crystalBat = recolorDef(ART.bird, hueShift(-28, 1.4, 1.3));

/* ---------- New species ---------- */
Object.assign(SPECIES, {
  thunderBeetle: { n: '雷角甲蟲', fam: 'insect', base: [55, 58, 62, 45, 45, 40], exp: 66, gold: 12, mat: 'beetleShell', learn: [[1, 'm_hornCharge'], [1, 'm_buzzShock'], [8, 'm_carapace'], [10, 'm_voltHorn']], dex: '角會累積雷電的甲蟲。雷雨過後特別多。' },
  emberSpirit: { n: '火燼精', fam: 'spirit', base: [45, 35, 40, 68, 55, 64], exp: 64, gold: 12, mat: 'emberCore', trait: 'swift', learn: [[1, 'm_emberSpit'], [1, 'm_flicker'], [8, 'm_heatHaze'], [10, 'm_flare']], dex: '營火的餘燼化成的小精靈。碰到水就會發出嘶嘶聲。' },
  skeleton: { n: '骷髏兵', fam: 'undead', base: [60, 72, 58, 35, 50, 52], exp: 88, gold: 20, mat: 'boneShard', learn: [[1, 'm_boneClub'], [1, 'm_rattle'], [1, 'm_boneThrow'], [16, 'm_darkSlash']], dex: '遺跡守衛的遺骨。千年後仍在巡邏。' },
  ghostLamp: { n: '幽靈燈', fam: 'undead', base: [52, 38, 50, 72, 68, 58], exp: 86, gold: 18, mat: 'ectoplasm', trait: 'healer', learn: [[1, 'm_ghostFire'], [1, 'm_soulSip'], [1, 'm_wail'], [1, 'm_hex']], dex: '被亡魂附身的油燈。在遺跡的黑暗中飄來飄去。' },
  caveSpider: { n: '礦坑毒蛛', fam: 'insect', base: [52, 62, 48, 44, 48, 70], exp: 80, gold: 16, mat: 'silk', trait: 'swift', learn: [[1, 'm_venomFang'], [1, 'm_web'], [1, 'm_silkShot'], [13, 'm_claw']], dex: '在廢棄坑道結網的大蜘蛛。蛛絲可以織成布料。' },
  drownedSoul: { n: '溺魂', fam: 'undead', base: [66, 45, 60, 78, 74, 58], exp: 95, gold: 20, mat: 'ectoplasm', learn: [[1, 'm_drownHand'], [1, 'm_chillMist'], [1, 'm_soulSip'], [1, 'm_wail']], dex: '沉在水道深處的亡魂。會把人拖進水裡。' },
  wraith: { n: '怨靈', fam: 'undead', base: [70, 55, 66, 92, 84, 80], exp: 120, gold: 26, mat: 'ectoplasm', trait: 'swift', learn: [[1, 'm_ghostFire'], [1, 'm_hex'], [1, 'm_soulSip'], [1, 'm_darkPulse']], dex: '墓穴深處徘徊的怨念。眼中燃著紅光。' },
  boneHound: { n: '骨犬', fam: 'undead', base: [72, 92, 64, 40, 58, 88], exp: 120, gold: 26, mat: 'boneShard', trait: 'berserk', learn: [[1, 'm_bite'], [1, 'm_boneRush'], [1, 'm_howl'], [1, 'm_rattle']], dex: '守墓人養的獵犬，死後依然守著墓穴。' },
  runeGolem: { n: '符文石像', fam: 'construct', base: [85, 80, 100, 80, 80, 45], exp: 130, gold: 30, mat: 'stone', learn: [[1, 'm_runeBeam'], [1, 'm_quake'], [1, 'm_stoneWall'], [1, 'm_boulder']], dex: '刻滿古代符文的石像。和古岩魔像是同一個時代的造物。' },
  boneKnight: { n: '骸骨騎士', fam: 'undead', base: [100, 105, 98, 55, 80, 70], exp: 200, gold: 60, elite: 1, drop: 'boneKnightMail', learn: [[1, 'm_darkSlash'], [1, 'm_boneShield'], [1, 'm_deathCry'], [1, 'm_rattle']], dex: '守護古王墓室的騎士。盔甲上刻著王都騎士團的紋章。' },
  goldSlime: { n: '金泡泡姆', fam: 'ooze', rare: 1, base: [40, 20, 90, 20, 90, 90], exp: 150, gold: 150, learn: [[1, 'm_bounce'], [1, 'm_goo']], dex: '【稀有】吞了金幣的泡泡姆。一不注意就會逃走。' },
  moonFox: { n: '月光狐', fam: 'beast', rare: 1, base: [55, 50, 70, 60, 70, 95], exp: 200, gold: 80, learn: [[1, 'm_claw'], [1, 'm_foxfire'], [1, 'm_pounce']], dex: '【稀有】只在滿月的森林現身的銀狐。' },
  gemSlime: { n: '寶石礦泥怪', fam: 'ooze', rare: 1, base: [50, 35, 110, 35, 110, 80], exp: 220, gold: 120, learn: [[1, 'm_bounce'], [1, 'm_oreShell']], dex: '【稀有】吞下寶石的礦泥怪。身體閃閃發光。' },
  crystalBat: { n: '水晶蝠', fam: 'bird', rare: 1, base: [55, 60, 80, 60, 80, 120], exp: 260, gold: 100, learn: [[1, 'm_dive'], [1, 'm_sonic']], dex: '【稀有】翅膀長著水晶的蝙蝠。飛得極快。' },
  goldSkeleton: { n: '黃金骷髏', fam: 'undead', rare: 1, base: [55, 55, 100, 30, 100, 80], exp: 240, gold: 150, learn: [[1, 'm_boneClub'], [1, 'm_rattle']], dex: '【稀有】戴滿陪葬金飾的骷髏。' },
  paleWraith: { n: '幽光怨靈', fam: 'undead', rare: 1, base: [60, 50, 110, 80, 110, 110], exp: 320, gold: 120, learn: [[1, 'm_soulSip'], [1, 'm_wail'], [1, 'm_hex']], dex: '【稀有】散發蒼白光芒的怨靈。據說看見它會帶來好運。' },
});
Object.assign(MON_PANEL, {
  thunderBeetle: { lv: 9, hp: 30, atk: 16, def: 17, spa: 13, spd: 13, spe: 12 },
  emberSpirit: { lv: 9, hp: 25, atk: 10, def: 11, spa: 18, spd: 15, spe: 17, eva: 5 },
  skeleton: { lv: 13, hp: 40, atk: 23, def: 18, spa: 12, spd: 16, spe: 17 },
  ghostLamp: { lv: 13, hp: 34, atk: 12, def: 16, spa: 23, spd: 22, spe: 19, eva: 6 },
  caveSpider: { lv: 12, hp: 33, atk: 19, def: 15, spa: 14, spd: 15, spe: 22 },
  drownedSoul: { lv: 15, hp: 44, atk: 16, def: 20, spa: 26, spd: 25, spe: 20 },
  wraith: { lv: 19, hp: 55, atk: 20, def: 24, spa: 33, spd: 30, spe: 28, eva: 6 },
  boneHound: { lv: 19, hp: 58, atk: 33, def: 24, spa: 16, spd: 22, spe: 32, crit: 10 },
  runeGolem: { lv: 20, hp: 68, atk: 30, def: 38, spa: 32, spd: 30, spe: 18 },
  boneKnight: { lv: 21, hp: 110, atk: 38, def: 36, spa: 20, spd: 30, spe: 26, crit: 10 },
  goldSlime: { lv: 4, hp: 20, atk: 6, def: 25, spa: 6, spd: 25, spe: 30, eva: 10 },
  moonFox: { lv: 11, hp: 30, atk: 16, def: 20, spa: 20, spd: 20, spe: 30, eva: 10 },
  gemSlime: { lv: 12, hp: 30, atk: 12, def: 40, spa: 12, spd: 40, spe: 26, eva: 8 },
  crystalBat: { lv: 15, hp: 36, atk: 20, def: 28, spa: 20, spd: 28, spe: 40, eva: 12 },
  goldSkeleton: { lv: 13, hp: 36, atk: 18, def: 35, spa: 10, spd: 35, spe: 26, eva: 8 },
  paleWraith: { lv: 19, hp: 44, atk: 18, def: 40, spa: 30, spd: 40, spe: 36, eva: 12 },
});
Object.assign(ELITE_TEXT, { boneKnight: ['……喀啦……喀啦……', '「……擅闖王墓者……斬……」', '骸骨騎士舉起了劍！'] });

/* ---------- New materials, gear (regional, no set bonuses), special ---------- */
Object.assign(ITEMS, {
  beetleShell: { n: '甲殼片', mat: 1, price: 0, sell: 30, d: '雷角甲蟲的甲殼。還帶著一點靜電。' },
  emberCore: { n: '燼核', mat: 1, price: 0, sell: 35, d: '火燼精留下的小火核。摸起來暖暖的。' },
  boneShard: { n: '骨片', mat: 1, price: 0, sell: 40, d: '古老的骨頭碎片。' },
  ectoplasm: { n: '靈質', mat: 1, price: 0, sell: 50, d: '亡魂殘留的半透明物質。' },
  silk: { n: '蛛絲', mat: 1, price: 0, sell: 40, d: '礦坑毒蛛的蛛絲。又細又韌。' },
});
SPECIALS.deathWard = { n: '亡者守護', d: '每場戰鬥一次：回合結束時HP低於30%，獲得3回合護盾。' };
Object.assign(GEAR, {
  // weapons (elemental weapons turn the hero's 一般 physical skills into their element)
  emberKnife: { n: '燼火短刀', slot: 'weapon', t: 2, st: { atk: 6 }, elem: '火', d: '把燼核熔進刀身的短刀。刀刃一直是溫熱的。' },
  voltSword: { n: '雷角劍', slot: 'weapon', t: 2, st: { atk: 6 }, sp: { hit: 5 }, elem: '雷', d: '用雷角甲蟲的甲殼打造的劍。揮動時會劈啪作響。' },
  thornStaff: { n: '荊棘法杖', slot: 'weapon', t: 2, st: { spa: 7 }, sp: { elem: 4 }, elem: '草', spr: 'woodSword', d: '森林獵人用荊棘枝做的法杖。' },
  tideStaff: { n: '潮汐法杖', slot: 'weapon', t: 3, st: { spa: 10 }, sp: { elem: 6 }, elem: '水', spr: 'woodSword', d: '王都水道工程師的法杖。杖頭的寶珠會自己滲水。' },
  boneSaber: { n: '骸骨軍刀', slot: 'weapon', t: 3, st: { atk: 9 }, sp: { crit: 4, vs: ['undead', 20] }, d: '古代守衛的軍刀。對亡者特別有效。' },
  stormStaff: { n: '雷鳴權杖', slot: 'weapon', t: 4, st: { spa: 13 }, sp: { elem: 8 }, elem: '雷', spr: 'woodSword', d: '古王的權杖。符文裡封著雷光。' },
  kingsBlade: { n: '古王之劍', slot: 'weapon', t: 4, st: { atk: 12 }, sp: { crit: 4 }, elem: '火', d: '古王墓室中的陪葬劍。劍身燃著不滅的火。' },
  // head
  hunterCap: { n: '獵人羽帽', slot: 'head', t: 2, st: { def: 2, spd: 2, spe: 1 }, sp: { eva: 3 }, d: '插著夜梟羽毛的獵人帽。' },
  boneHelm: { n: '骸骨頭盔', slot: 'head', t: 3, st: { def: 5, spd: 4 }, sp: { resist: ['一般', 8] }, d: '用古代守衛的骨片加固的頭盔。' },
  // body
  mistCloak: { n: '晨霧斗篷', slot: 'body', t: 2, st: { def: 3, spd: 4 }, sp: { eva: 3 }, d: '晨霧道路的旅人愛穿的輕薄斗篷。' },
  silkRobe: { n: '蛛絲法袍', slot: 'body', t: 3, st: { def: 5, spd: 8 }, sp: { resist: ['毒', 15] }, d: '用礦坑毒蛛的絲織成的法袍。' },
  runeMantle: { n: '符文披風', slot: 'body', t: 4, st: { def: 8, spd: 11 }, sp: { elem: 6 }, d: '繡著古代符文的披風。魔力在布料裡流動。' },
  boneKnightMail: { n: '骸骨騎士鎧', slot: 'body', t: 4, st: { def: 11, spd: 6, hp: 6 }, fx: ['deathWard'], d: '骸骨騎士的鎧甲。刻著王都騎士團的紋章。' },
  // feet
  hunterBoots: { n: '獵人軟靴', slot: 'feet', t: 2, st: { spe: 4, def: 2 }, sp: { eva: 3 }, d: '走在落葉上也不會發出聲音的軟靴。' },
  minerBoots: { n: '鐵趾工靴', slot: 'feet', t: 3, st: { spe: 3, def: 5 }, d: '礦工的鐵頭工作靴。又重又耐踢。' },
  shadowBoots: { n: '影行靴', slot: 'feet', t: 3, st: { spe: 6, def: 2 }, sp: { eva: 5 }, d: '王都密探穿過的靴子。在水道裡被找到。' },
  ancientGreaves: { n: '古代戰靴', slot: 'feet', t: 4, st: { spe: 6, def: 6 }, sp: { resist: ['岩', 12] }, d: '古王近衛的戰靴。' },
  // accessories
  beetleCharm: { n: '甲殼護符', slot: 'acc', t: 2, st: { def: 1, hp: 3 }, sp: { resist: ['雷', 15] }, d: '用甲殼片做的護符。能擋住靜電。' },
  ectoLantern: { n: '靈光提燈', slot: 'acc', t: 3, st: { spa: 3 }, sp: { drain: 6 }, d: '裝著馴服過的幽靈火的小提燈。' },
});
// retarget the old "vs element" bonuses to families
GEAR.fangDagger.sp.vs = ['beast', 15]; GEAR.foxBlade.sp.vs = ['plant', 20]; GEAR.crystalBlade.sp.vs = ['aquatic', 20]; GEAR.dawnSword.sp.vs = ['construct', 20];
GEAR.foxBlade.elem = '火'; GEAR.crystalBlade.elem = '水'; GEAR.oakStaff.elem = '草'; GEAR.dawnSword.elem = '火';
AFFIX_TABLE.vs.n = '對{t}傷害'; AFFIX_TABLE.vs.fam = 1;
const OLD_VS = { 一般: 'human', 火: 'plant', 水: 'aquatic', 草: 'plant', 雷: 'bird', 岩: 'construct', 毒: 'insect', 飛: 'bird' };
function migrateVs(st) { for (const g of st.gear || []) for (const a of g.a || []) if (a[0] === 'vs' && !FAMILIES[a[1]]) a[1] = OLD_VS[a[1]] || 'beast'; }
RECIPES.push(
  { out: 'emberKnife', mats: { emberCore: 3, stone: 2 }, gold: 500 }, { out: 'voltSword', mats: { beetleShell: 4, stone: 2 }, gold: 600 },
  { out: 'beetleCharm', mats: { beetleShell: 3 }, gold: 400 }, { out: 'silkRobe', mats: { silk: 4, gel: 2 }, gold: 900 },
  { out: 'boneHelm', mats: { boneShard: 5 }, gold: 1000 }, { out: 'ectoLantern', mats: { ectoplasm: 4, boneShard: 2 }, gold: 1200 },
);
SALVAGE.acc.push('silk'); SALVAGE.weapon.push('boneShard');

/* ---------- Regional loot pools (each region has its own look; no overlap) ---------- */
Object.assign(MAPS.route, { gearPool: ['ironSword', 'apprenticeStaff', 'mistDagger', 'clothCap', 'leather', 'mistCloak', 'travelBoots', 'mistBoots', 'swiftFeather', 'wolfNecklace'] });
Object.assign(MAPS.forest, { gearPool: ['oakStaff', 'thornStaff', 'hunterCap', 'hunterLeather', 'hunterBoots', 'featherBoots', 'herbPouch'] });
Object.assign(MAPS.mine, { gearPool: ['minerHelm', 'guardHelm', 'stoneMail', 'frogCloak', 'minerBoots', 'charm'] });
Object.assign(MAPS.sewer, { gearPool: ['knightSword', 'tideStaff', 'knightHelm', 'chainMail', 'knightGreaves', 'shadowBoots', 'thornRing'] });

/* ---------- Encounter tables & rare monsters (3%, may flee) ---------- */
MAPS.route.encounters = [
  { y0: 34, y1: 99, rate: 0.11, table: [['mush', 0, 2, 30], ['bird', 0, 2, 30], ['pebble', 1, 2, 15], ['slime', 1, 3, 25]] }, // starter meadow next to town (Lv1-4 after the area shift)
  { y0: 26, y1: 33, rate: 0.11, table: [['mush', 3, 5, 30], ['bird', 3, 5, 30], ['pebble', 3, 5, 15], ['slime', 4, 5, 25]] },
  { y0: 11, y1: 25, rate: 0.11, table: [['fox', 6, 8, 22], ['bee', 6, 8, 22], ['frog', 6, 8, 22], ['mush', 6, 8, 8], ['bird', 6, 8, 8], ['pebble', 6, 8, 8], ['slime', 7, 8, 10]] },
  { y0: 0, y1: 10, rate: 0.12, table: [['thunderBeetle', 8, 10, 24], ['emberSpirit', 8, 10, 22], ['fox', 8, 10, 16], ['bee', 8, 10, 14], ['frog', 8, 10, 14], ['pebble', 8, 10, 10]] },
];
MAPS.route.rare = ['goldSlime', 4, 8];
MAPS.forest.encounters[0].table = [['thornMush', 9, 11, 22], ['nightBird', 9, 11, 22], ['leafFox', 10, 12, 22], ['thunderBeetle', 9, 11, 14], ['frog', 9, 11, 10], ['bee', 9, 11, 10]];
MAPS.forest.rare = ['moonFox', 10, 12];
MAPS.mine.encounters[0].table = [['mineBat', 11, 13, 26], ['oreSlime', 11, 13, 26], ['bandit', 11, 13, 24], ['caveSpider', 11, 13, 24]];
MAPS.mine.rare = ['gemSlime', 11, 13];
MAPS.sewer.encounters[0].table = [['caveBat', 14, 16, 26], ['mudSlime', 14, 16, 24], ['crystalPebble', 15, 17, 22], ['drownedSoul', 14, 16, 28]];
MAPS.sewer.rare = ['crystalBat', 15, 17];
Object.assign(MAPS.ruins, { encAll: 1, rare: ['goldSkeleton', 12, 14], gearPool: ['boneSaber', 'ruinStaff', 'boneHelm', 'stoneMail', 'ectoLantern'], encounters: [{ y0: 0, y1: 99, rate: 0.07, table: [['skeleton', 12, 14, 52], ['ghostLamp', 12, 14, 48]] }] });
{ const R = MAPS.ruins.rows; R[10] = 'RRmssssssssssZRR'; }

/* ---------- Catacomb under the ruins (Lv17–21, opens after the golem) ---------- */
MAPS.catacomb = {
  name: '遺跡地下墓穴', music: 'ruins', border: 'R', battleBg: 'ruins', encAll: 1, popup: 1,
  rows: [
    'RRRRRRRRRRRRRRRRRRRR',
    'RRRRRRRsssssRRRRRRRR',
    'RRRRRRsPsssPsRRRRRRR',
    'RRRRRRsssssssRRRRRRR',
    'RRRRRRRRRssRRRRRRRRR',
    'RsssssRRRssRRRsssssR',
    'RsPssssssssssssssPsR',
    'RssssRRRRssRRRRssssR',
    'RRsRRRRRRssRRRRRRsRR',
    'RsssssRsssssssRssssR',
    'RsmmssRssPsPssRssmsR',
    'RssssssssssssssssssR',
    'RRRsRRRRRssRRRRRRsRR',
    'RsssssRsssssssRssssR',
    'RssPssRssmmssRRsPssR',
    'RssssssssssssssssssR',
    'RRRRRRRRRssRRRRRRRRR',
    'RssssssssssssssssssR',
    'RsssRRRRRssRRRRRsssR',
    'RsssRRRRRssRRRRRsssR',
    'RRRRRRRRRssRRRRRRRRR',
    'RRRRRRRRRsRRRRRRRRRR',
  ],
  exit: { x: 9, y: 21, to: ['ruins', 13, 9] },
  elites: [{ id: 'boneKnight', sp: 'boneKnight', lv: 21, x: 9, y: 3, dir: 'down', sight: 2 }],
  items: [{ id: 'k1', x: 11, y: 1, item: 'elixir' }, { id: 'k2', x: 1, y: 5, item: 'superPotion', n: 3 }, { id: 'k3', x: 18, y: 9, gold: 1500 }, { id: 'k4', x: 1, y: 13, item: 'ether', n: 3 }, { id: 'k5', x: 18, y: 18, item: 'powerFruit' }, { id: 'k6', x: 1, y: 18, item: 'stormStaff', q: 2 }, { id: 'k7', x: 7, y: 1, item: 'kingsBlade', q: 3 }],
  gathers: [{ id: 'gk1', x: 17, y: 13, mat: 'boneShard' }, { id: 'gk2', x: 2, y: 10, mat: 'ectoplasm' }, { id: 'gk3', x: 16, y: 5, mat: 'crystal' }],
  gearPool: ['stormStaff', 'kingsBlade', 'runeMantle', 'ancientGreaves', 'boneHelm', 'boneSaber'],
  rare: ['paleWraith', 18, 20],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['wraith', 17, 20, 30], ['boneHound', 17, 20, 30], ['runeGolem', 18, 21, 22], ['skeleton', 18, 20, 18]] }],
};
EXPLORE.catacomb = '遺跡地下墓穴';
ACHIEVEMENTS.push(
  { id: 'knight', n: '冥府的騎士', d: '打倒墓穴深處的骸骨騎士。', ok: st => st.flags.boneKnight },
  { id: 'rare3', n: '稀有獵人', d: '打倒3種稀有魔物。', ok: st => Object.keys(SPECIES).filter(k => SPECIES[k].rare && st.dex && st.dex[k] && st.dex[k].won).length >= 3 },
);
