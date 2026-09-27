/* ===================== CHAPTER 2「曙光的王都」— data: monsters, monster skills, items, gear, NPC looks =====================
   Levels 22 → 40 (+ post-game 40–45). 12 new field / dungeon maps, 2 towns, 9 interiors (09b), story & quests (09c),
   battle FX / themes / music (09d), 4 new classes (09e), achievements (09f).
   Monster art: recolours of existing chibis until Codex task K (18 own sets) arrives — then the own set is used automatically. */

/* ---------- new family: 龍族 ---------- */
FAMILIES.dragon = { n: '龍族', weak: ['雷'], resist: ['火', '水'], immune: [], c: '#c85a3a', d: '古老的龍的後裔。鱗片擋得住火和水，但怕雷。' };

/* ---------- monster skills ---------- */
Object.assign(MOVES, {
  // 北方街道
  m_featherStorm: { n: '黑羽風暴', t: '飛', cat: '物', pow: 120, acc: 100, pp: 5, charge: 1, chargeMsg: '攤開了滿是飛刀的斗篷！', warn: '（無數把飛刀要一起射過來了……防禦！）', d: '蓄力後射出的黑色飛刀雨。' },
  // 王都地下水道
  m_plagueBite: { n: '瘟疫咬', t: '毒', cat: '物', pow: 55, acc: 95, pp: 20, eff: { st: 'psn', p: 30 }, d: '沾滿髒污的牙齒。有時會中毒。' },
  m_scurry: { n: '亂竄', t: '一般', cat: '變', pp: 15, stat: { who: 'self', spe: 2 }, d: '在水道裡四處亂竄。大幅提升速度。' },
  m_toxicSludge: { n: '毒泥浪', t: '毒', cat: '特', pow: 65, acc: 95, pp: 15, eff: { st: 'psn', p: 30 }, d: '捲起一波有毒的污泥。' },
  m_rustBite: { n: '鏽蝕咬', t: '一般', cat: '物', pow: 60, acc: 95, pp: 15, eff: { stat: { def: -1 }, p: 30 }, d: '讓鎧甲生鏽的咬擊。有時會降低物防。' },
  m_ratSwarm: { n: '鼠群', t: '一般', cat: '物', pow: 85, acc: 95, pp: 10, d: '一大群溝鼠一擁而上。' },
  m_crownBash: { n: '王冠頭槌', t: '一般', cat: '物', pow: 75, acc: 95, pp: 10, eff: { flinch: 1, p: 30 }, d: '用歪掉的鐵皮王冠撞過來。' },
  m_kingsFeast: { n: '鼠王的盛宴', t: '毒', cat: '物', pow: 140, acc: 100, pp: 5, charge: 1, drain: 0.3, chargeMsg: '張開了大嘴，口水滴個不停！', warn: '（牠要把你整個吃下去了……！）', d: '蓄力後的大口吞噬。' },
  // 金穗平原
  m_sickle: { n: '鏽鐮刀', t: '一般', cat: '物', pow: 65, acc: 95, pp: 15, crit: 1, d: '揮下生鏽的鐮刀。容易會心。' },
  m_crowCall: { n: '烏鴉召喚', t: '飛', cat: '特', pow: 55, acc: 95, pp: 15, eff: { stat: { spd: -1 }, p: 20 }, d: '叫來一群烏鴉啄人。' },
  m_strawGuard: { n: '稻草填充', t: '草', cat: '變', pp: 15, stat: { who: 'self', def: 1, spd: 1 }, d: '往身體裡塞進更多稻草。' },
  m_honeyTrap: { n: '蜜糖陷阱', t: '草', cat: '變', acc: 95, pp: 15, stat: { who: 'foe', spe: -2 }, d: '灑出黏答答的蜂蜜。大幅降低速度。' },
  m_tuskCharge: { n: '獠牙衝撞', t: '一般', cat: '物', pow: 70, acc: 95, pp: 15, eff: { flinch: 1, p: 20 }, d: '低頭用獠牙衝過來。' },
  m_windCutter: { n: '風之刃', t: '飛', cat: '特', pow: 70, acc: 95, pp: 15, crit: 1, d: '把風壓縮成刀刃射出。容易會心。' },
  m_boarRush: { n: '暴走衝鋒', t: '一般', cat: '物', pow: 135, acc: 100, pp: 5, charge: 1, chargeMsg: '用前腳猛刨地面，整片麥田都在震動！', warn: '（牠要全力衝過來了！）', d: '蓄力後的暴走衝鋒。' },
  m_scytheSweep: { n: '收割', t: '一般', cat: '物', pow: 90, acc: 95, pp: 10, d: '用巨大的鐮刀橫掃。' },
  m_seedBomb: { n: '種子炸彈', t: '草', cat: '特', pow: 70, acc: 95, pp: 15, d: '丟出會爆炸的種子。' },
  m_harvest: { n: '豐收之刻', t: '草', cat: '物', pow: 150, acc: 100, pp: 5, charge: 1, drain: 0.3, chargeMsg: '背上的風車開始瘋狂轉動！', warn: '（下一擊會把一切都收割掉……）', d: '蓄力後的大收割。' },
  // 曙光鐘塔
  m_windUp: { n: '上發條', t: '一般', cat: '變', pp: 15, stat: { who: 'self', atk: 2 }, d: '背上的鑰匙喀啦喀啦地轉。大幅提升物攻。' },
  m_gearShot: { n: '齒輪彈', t: '岩', cat: '物', pow: 60, acc: 95, pp: 20, d: '射出旋轉的齒輪。' },
  m_sparkGear: { n: '火花齒輪', t: '雷', cat: '特', pow: 65, acc: 95, pp: 15, eff: { st: 'par', p: 20 }, d: '高速旋轉，噴出電火花。' },
  m_overclock: { n: '超頻', t: '一般', cat: '變', pp: 15, stat: { who: 'self', spe: 2 }, d: '齒輪轉得更快了。大幅提升速度。' },
  m_bellToll: { n: '晚鐘', t: '一般', cat: '特', pow: 70, acc: 95, pp: 15, eff: { flinch: 1, p: 20 }, d: '震耳欲聾的鐘聲。' },
  m_chronoLance: { n: '時計長槍', t: '一般', cat: '物', pow: 140, acc: 100, pp: 5, charge: 1, chargeMsg: '把長槍對準了你，全身的發條都繃緊了！', warn: '（發條鬆開的瞬間……就是衝鋒的時候！）', d: '蓄力後的全力突刺。' },
  m_gearCrush: { n: '齒輪粉碎', t: '岩', cat: '物', pow: 100, acc: 95, pp: 10, d: '用巨大的齒輪手臂砸下。' },
  m_steamBurst: { n: '蒸汽爆發', t: '水', cat: '特', pow: 90, acc: 95, pp: 10, eff: { st: 'brn', p: 20 }, d: '從全身的管子噴出滾燙的蒸汽。' },
  m_timeWarp: { n: '時間扭曲', t: '一般', cat: '變', acc: 100, pp: 10, stat: { who: 'foe', spe: -2 }, d: '讓對手周圍的時間變慢。大幅降低速度。' },
  m_twelveStrike: { n: '十二點的審判', t: '岩', cat: '物', pow: 165, acc: 100, pp: 5, charge: 1, chargeMsg: '的胸口，時鐘指針一起指向了十二點……', warn: '（鐘聲響起的瞬間，會落下最重的一擊！）', d: '十二下鐘聲後的毀滅一擊。' },
  // 霜語雪原・冰晶洞窟
  m_frostFang: { n: '冰牙', t: '水', cat: '物', pow: 70, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 30 }, d: '結著冰的牙齒。有時會凍得動作變慢。' },
  m_iceShard: { n: '冰錐', t: '水', cat: '特', pow: 70, acc: 95, pp: 15, d: '射出尖銳的冰錐。' },
  m_blizzard: { n: '暴風雪', t: '水', cat: '特', pow: 110, acc: 100, pp: 5, charge: 1, chargeMsg: '讓四周的氣溫急速下降，雪開始狂舞！', warn: '（暴風雪就要來了……）', d: '蓄力後的暴風雪。' },
  m_iceFist: { n: '冰拳', t: '水', cat: '物', pow: 75, acc: 95, pp: 15, d: '結滿冰霜的拳頭。' },
  m_avalanche: { n: '雪崩', t: '岩', cat: '物', pow: 140, acc: 100, pp: 5, charge: 1, chargeMsg: '抱起了一大塊雪岩！', warn: '（雪崩要落下來了！）', d: '蓄力後推下的雪崩。' },
  m_bearHug: { n: '巨熊擁抱', t: '一般', cat: '物', pow: 145, acc: 100, pp: 5, charge: 1, chargeMsg: '站了起來，張開了雙臂！', warn: '（被抱住就完了……防禦！）', d: '蓄力後的致命擁抱。' },
  m_frozenGaze: { n: '冰凍凝視', t: '水', cat: '變', acc: 95, pp: 10, stat: { who: 'foe', spe: -1, atk: -1 }, d: '冰冷的眼神讓身體凍僵。降低速度和物攻。' },
  m_iceMirror: { n: '冰之鏡', t: '水', cat: '變', pp: 10, stat: { who: 'self', def: 1, spd: 2 }, d: '在身邊展開冰晶之鏡。提升物防，大幅提升魔防。' },
  m_absoluteZero: { n: '絕對零度', t: '水', cat: '特', pow: 130, acc: 100, pp: 5, charge: 1, chargeMsg: '舉起了權杖，連空氣都結凍了……', warn: '（一切都要被凍結了……這一擊非擋不可！）', d: '把一切凍結的究極冰魔法。' },
  m_frostCurse: { n: '寒冰詛咒', t: '水', cat: '特', pow: 80, acc: 95, pp: 10, eff: { stat: { atk: -1 }, p: 30 }, d: '把詛咒凍進骨頭裡。' },
  // 赤焰山道・熔岩坑道
  m_flameBreath: { n: '火焰吐息', t: '火', cat: '特', pow: 75, acc: 95, pp: 15, eff: { st: 'brn', p: 20 }, d: '吐出灼熱的火焰。有時會灼傷。' },
  m_infernoBreath: { n: '煉獄吐息', t: '火', cat: '特', pow: 150, acc: 100, pp: 5, charge: 1, eff: { st: 'brn', p: 50 }, chargeMsg: '深深吸了一口氣，喉嚨發出紅光！', warn: '（火焰要噴出來了……！）', d: '蓄力後噴出的煉獄之火。' },
  m_magmaFist: { n: '熔岩拳', t: '火', cat: '物', pow: 100, acc: 95, pp: 10, eff: { st: 'brn', p: 20 }, d: '滴著岩漿的巨拳。' },
  m_eruption: { n: '大噴發', t: '火', cat: '特', pow: 165, acc: 100, pp: 5, charge: 1, eff: { st: 'brn', p: 50 }, chargeMsg: '讓岩漿從腳下的裂縫湧了上來……', warn: '（火山要噴發了！）', d: '蓄力後引發的火山噴發。' },
  // 黯滅要塞
  m_shadowBolt: { n: '暗影彈', t: '一般', cat: '特', pow: 85, acc: 95, pp: 10, d: '射出凝聚了黑暗的魔彈。' },
  m_dreamEater: { n: '食夢', t: '一般', cat: '特', pow: 80, acc: 95, pp: 10, drain: 0.5, d: '吃掉對手的夢。吸取傷害一半的HP。' },
  m_demonClaw: { n: '魔爪', t: '一般', cat: '物', pow: 95, acc: 95, pp: 10, crit: 1, d: '帶著紫色魔力的利爪。容易會心。' },
  m_tyranny: { n: '暴君的宣告', t: '一般', cat: '特', pow: 115, acc: 100, pp: 5, charge: 1, chargeMsg: '高舉右手，黑色的魔法陣在頭上展開！', warn: '（「跪下吧……異界的小鬼！」）', d: '魔人化的宰相的大魔法。' },
  m_shadowSlash: { n: '影斬', t: '一般', cat: '物', pow: 100, acc: 95, pp: 10, d: '拖著黑影的大劍斬擊。' },
  m_eclipseBlade: { n: '蝕日之劍', t: '一般', cat: '物', pow: 165, acc: 100, pp: 5, charge: 1, chargeMsg: '把大劍舉向天空，太陽被黑暗吞沒了……', warn: '（整個世界都暗了下來……這一擊必須擋住！）', d: '影將莫爾德的奧義。' },
  // 星見神殿
  m_starfall: { n: '星落', t: '一般', cat: '特', pow: 85, acc: 95, pp: 10, d: '從天空召喚墜落的星星。' },
  m_holyRay: { n: '聖光束', t: '一般', cat: '特', pow: 95, acc: 95, pp: 10, d: '射出耀眼的光束。' },
  m_cometLance: { n: '彗星之槍', t: '一般', cat: '物', pow: 190, acc: 100, pp: 5, charge: 1, chargeMsg: '把光之長槍舉向夜空，一顆彗星墜了下來！', warn: '（彗星要落在你身上了！）', d: '把彗星化為長槍的一擊。' },
});
const CH2_MCLS = {
  m_featherStorm: 'charge', m_plagueBite: 'bite', m_scurry: 'buff', m_toxicSludge: 'area', m_rustBite: 'bite', m_ratSwarm: 'strike', m_crownBash: 'strike', m_kingsFeast: 'charge',
  m_sickle: 'slash', m_crowCall: 'area', m_strawGuard: 'buff', m_honeyTrap: 'debuff', m_tuskCharge: 'strike', m_windCutter: 'bolt', m_boarRush: 'charge', m_scytheSweep: 'slash', m_seedBomb: 'bolt', m_harvest: 'charge',
  m_windUp: 'buff', m_gearShot: 'proj', m_sparkGear: 'bolt', m_overclock: 'buff', m_bellToll: 'sound', m_chronoLance: 'charge', m_gearCrush: 'strike', m_steamBurst: 'area', m_timeWarp: 'debuff', m_twelveStrike: 'charge',
  m_frostFang: 'bite', m_iceShard: 'bolt', m_blizzard: 'charge', m_iceFist: 'strike', m_avalanche: 'charge', m_bearHug: 'charge', m_frozenGaze: 'debuff', m_iceMirror: 'guard', m_absoluteZero: 'charge', m_frostCurse: 'bolt',
  m_flameBreath: 'area', m_infernoBreath: 'charge', m_magmaFist: 'strike', m_eruption: 'charge',
  m_shadowBolt: 'bolt', m_dreamEater: 'drain', m_demonClaw: 'claw', m_tyranny: 'charge', m_shadowSlash: 'slash', m_eclipseBlade: 'charge',
  m_starfall: 'area', m_holyRay: 'bolt', m_cometLance: 'charge',
};
for (const k in CH2_MCLS) { const c = CH2_MCLS[k]; (MON_CLASS[c] || (MON_CLASS[c] = [])).push(k); Object.assign(MOVES[k], { cls: c, fx: k, foe: 1 }); }

/* ---------- monsters ----------
   [key, name, family, home level, role, moves, material, placeholder look [base, hue, sat, light], dex, extra] */
const CH2_ROLE = { phys: [1, 1.1, 1, 0.65, 0.9, 0.95], tank: [1.15, 1, 1.25, 0.7, 1, 0.6], mage: [0.82, 0.55, 0.9, 1.35, 1.2, 1.2], fast: [0.85, 1, 0.8, 0.8, 0.85, 1.45], bal: [1, 1, 1, 1, 1, 1] };
const CH2_MON = [
  // 北方街道 Lv22–24
  ['greyWolf', '灰鬃狼', 'beast', 23, 'fast', ['m_bite', 'm_howl', 'm_rend', 'm_pounce'], 'wolfPelt', ['wolf', 0, 0.25, 1.15], '成群在北方街道遊蕩的灰狼。會把落單的旅人團團圍住。'],
  ['roadBandit', '街道盜賊', 'human', 23, 'phys', ['m_knife', 'm_dirtyKick', 'm_throwDagger', 'm_taunt'], 'banditCloth', ['bandit', 200, 0.7, 0.95], '「黑羽」盜賊團的手下。專門搶劫往王都的商隊。'],
  ['hornBeetle', '巨角甲蟲', 'insect', 23, 'tank', ['m_hornCharge', 'm_carapace', 'm_voltHorn', 'm_boulder'], 'beetleHorn', ['thunderBeetle', -50, 0.8, 0.85], '頭上的角比身體還大的甲蟲。撞一下就能翻倒馬車。'],
  ['plainsHawk', '草原鷹', 'bird', 24, 'fast', ['m_talonDive', 'm_galeWing', 'm_peck', 'm_dive'], 'feather', ['bird', 25, 0.7, 0.85], '在北方草原上空盤旋的大鷹。視力好到看得見地上的一枚銅幣。', { trait: 'swift' }],
  ['blackFeather', '盜賊頭目「黑羽」', 'human', 25, 'phys', ['m_gutSlash', 'm_warCry', 'm_throwDagger', 'm_featherStorm'], null, ['banditBoss', 220, 0.5, 0.7], '北方街道的盜賊團長。黑羽毛斗篷底下藏著幾十把飛刀。', { elite: 1, drop: 'blackCloak' }],
  // 王都地下水道 Lv24–26
  ['sewerRat', '溝鼠', 'beast', 24, 'fast', ['m_plagueBite', 'm_scurry', 'm_bite', 'm_rend'], 'ratTail', ['fox', 0, 0.2, 0.7], '住在王都地下水道的大老鼠。聽說有一隻特別大的「王」。'],
  ['sludge', '汙泥姆', 'ooze', 25, 'tank', ['m_goo', 'm_acidSpit', 'm_toxicSludge', 'm_engulf'], 'gel', ['slime', 60, 0.5, 0.55], '吸收了王都髒水的泥怪。臭得讓人睜不開眼。'],
  ['rustSpider', '鐵鏽蛛', 'insect', 25, 'phys', ['m_rustBite', 'm_web', 'm_silkShot', 'm_venomFang'], 'rustScrap', ['caveSpider', 20, 0.9, 0.9], '身上長滿鐵鏽的蜘蛛。會把鎧甲咬到生鏽。'],
  ['sewerCroc', '水道鱷', 'aquatic', 26, 'tank', ['m_jaw', 'm_tailSlam', 'm_scaleGuard', 'm_mudShot'], 'crocHide', ['croc', -25, 0.6, 0.7], '小時候被丟進水道的鱷魚，長大後成了水道的霸主之一。'],
  ['ratKing', '溝鼠王', 'beast', 27, 'phys', ['m_crownBash', 'm_ratSwarm', 'm_plagueBite', 'm_kingsFeast'], null, ['croc', 90, 0.3, 0.6], '戴著鐵皮王冠的巨鼠。偷走了王都的「時之齒輪」，當成自己的王座裝飾。', { boss: 1, drop: 'ratCrown' }],
  // 金穗平原 Lv24–26
  ['scarecrow', '稻草人', 'plant', 25, 'bal', ['m_sickle', 'm_crowCall', 'm_strawGuard', 'm_hex'], 'wheat', ['mush', 40, 0.6, 1.0], '被黑暗魔力附身的稻草人。晚上會自己走進麥田。'],
  ['fieldBee', '麥田蜂', 'insect', 24, 'fast', ['m_sting', 'm_buzzShock', 'm_honeyTrap', 'm_swarm'], 'honey', ['bee', 15, 1.1, 1.05], '在金色麥田裡採蜜的大黃蜂。蜜很甜，針很痛。', { trait: 'swift' }],
  ['wildBoar', '暴走野豬', 'beast', 25, 'phys', ['m_tuskCharge', 'm_warCry', 'm_quake', 'm_rend'], 'boarTusk', ['wolf', 20, 0.6, 0.65], '被魔力刺激得失控的野豬。一衝起來就停不下來。'],
  ['windSprite', '風精', 'spirit', 26, 'mage', ['m_windCutter', 'm_whirlwind', 'm_flicker', 'm_galeWing'], 'windStone', ['dustDevil', 100, 0.8, 1.1], '推動平原風車的小精靈。最近脾氣變得很暴躁。'],
  ['boarKing', '暴走野豬王', 'beast', 27, 'phys', ['m_tuskCharge', 'm_warCry', 'm_quake', 'm_boarRush'], null, ['wildBoar', -15, 0.9, 0.75], '金穗平原的野豬之王。背上插著好幾把獵人的斷箭。', { elite: 1, drop: 'boarHelm' }],
  ['harvestGolem', '收穫魔像', 'construct', 28, 'tank', ['m_scytheSweep', 'm_seedBomb', 'm_harden', 'm_harvest'], null, ['golem', 30, 0.8, 1.15], '風車小屋裡守護「時之齒輪」的魔像。用麥稈和木頭做成，背上裝著風車。', { boss: 1, drop: 'harvestScythe' }],
  // 曙光鐘塔 Lv27–30
  ['clockSoldier', '發條兵', 'construct', 28, 'phys', ['m_spearThrust', 'm_windUp', 'm_gearShot', 'm_spearRush'], 'spring', ['riftKnight', 40, 0.9, 1.25], '古代鐘錶師做的發條士兵。背上的鑰匙還在轉。'],
  ['gearSprite', '齒輪精', 'construct', 28, 'mage', ['m_sparkGear', 'm_overclock', 'm_runeBeam', 'm_gearShot'], 'brassGear', ['ghostLamp', 25, 0.9, 1.1], '鐘塔的齒輪有了意識，變成了會飛的小精靈。', { trait: 'swift' }],
  ['towerBat', '鐘樓蝠', 'bird', 29, 'fast', ['m_sonic', 'm_screech', 'm_bellToll', 'm_dive'], 'batWing', ['mineBat', 30, 0.8, 1.05], '住在鐘塔頂上的蝙蝠。鐘聲讓牠們變得很兇。'],
  ['hollowArmor', '空洞鎧甲', 'construct', 29, 'tank', ['m_darkSlash', 'm_spearRush', 'm_stoneWall', 'm_boneShield'], 'rustScrap', ['boneKnight', 200, 0.4, 1.25], '裡面空無一物的鎧甲。被鐘塔的魔力驅動著。'],
  ['clockKnight', '發條騎士', 'construct', 30, 'phys', ['m_spearRush', 'm_windUp', 'm_gearShot', 'm_chronoLance'], null, ['clockSoldier', 0, 0.7, 0.78], '守護鐘塔中層的發條騎士長。長槍上刻著初代勇者的名字。', { elite: 1, drop: 'chronoLance' }],
  ['clockColossus', '時計巨像', 'construct', 31, 'tank', ['m_gearCrush', 'm_steamBurst', 'm_timeWarp', 'm_twelveStrike'], null, ['golem', 40, 0.9, 1.3], '曙光鐘塔的守護者。胸口的大時鐘五百年來一直在走。', { boss: 1, drop: 'colossusCore' }],
  // 霜語雪原 Lv29–31
  ['snowWolf', '雪狼', 'beast', 29, 'fast', ['m_bite', 'm_frostFang', 'm_howl', 'm_rend'], 'snowPelt', ['wolf', 180, 0.3, 1.35], '在雪原上奔跑的白狼。雪地裡幾乎看不見牠們。'],
  ['frostSprite', '霜精', 'spirit', 30, 'mage', ['m_chillMist', 'm_iceShard', 'm_flicker', 'm_blizzard'], 'iceCrystal', ['emberSpirit', 180, 0.9, 1.2], '雪花聚集成的小精靈。碰到的東西都會結霜。'],
  ['yeti', '雪人', 'beast', 30, 'tank', ['m_iceFist', 'm_quake', 'm_warCry', 'm_avalanche'], 'snowPelt', ['frog', 190, 0.2, 1.45], '雪原深處的毛茸茸巨人。平常很溫和，被吵醒就會發狂。'],
  ['iceOwl', '冰晶鴞', 'bird', 30, 'mage', ['m_featherGust', 'm_iceShard', 'm_lullaby', 'm_dive'], 'feather', ['duskMoth', 170, 0.6, 1.3], '羽毛像冰晶一樣透明的貓頭鷹。叫聲會讓人想睡。'],
  ['snowBear', '雪原巨熊', 'beast', 32, 'tank', ['m_iceFist', 'm_rend', 'm_warCry', 'm_bearHug'], null, ['rockRhino', 190, 0.3, 1.45], '雪原的王者。毛皮硬得像鎧甲。', { elite: 1, drop: 'bearMantle' }],
  // 冰晶洞窟 Lv31–33
  ['iceBat', '冰晶蝠', 'bird', 31, 'fast', ['m_sonic', 'm_iceShard', 'm_dive', 'm_screech'], 'iceCrystal', ['crystalBat', 20, 1, 1.1], '冰晶洞窟的蝙蝠。翅膀上結著一層薄冰。'],
  ['frostSlime', '冰凍姆', 'ooze', 31, 'tank', ['m_bounce', 'm_iceShard', 'm_goo', 'm_engulf'], 'gel', ['slime', 170, 0.7, 1.3], '凍得硬梆梆的泡泡姆。敲起來叮叮響。'],
  ['iceGolem', '冰晶石怪', 'construct', 32, 'tank', ['m_iceFist', 'm_stoneWall', 'm_prismRay', 'm_crystalShard'], 'iceCrystal', ['pebble', 180, 0.8, 1.45], '冰晶聚成的石怪。身體裡封著古代的魔物。'],
  ['frostWraith', '霜之魂', 'undead', 32, 'mage', ['m_soulSip', 'm_chillMist', 'm_wail', 'm_darkPulse'], 'ectoplasm', ['wraith', 170, 0.8, 1.2], '凍死在洞窟裡的旅人的靈魂。一直在找回家的路。'],
  ['frostLich', '冰霜巫妖', 'undead', 33, 'mage', ['m_frostCurse', 'm_iceShard', 'm_hex', 'm_blizzard'], null, ['bogWitch', 170, 0.6, 1.25], '侍奉霜之女王的巫妖。守著洞窟的冰之祭壇。', { elite: 1, drop: 'lichTome' }],
  ['frostQueen', '霜之女王', 'spirit', 34, 'mage', ['m_iceShard', 'm_frozenGaze', 'm_iceMirror', 'm_absoluteZero'], null, ['moonSprite', 30, 0.9, 1.3], '冰晶洞窟深處的女王。被宰相的黑暗魔力控制，把北境的路都凍住了。', { boss: 1, drop: 'frostTiara' }],
  // 赤焰山道 Lv32–34
  ['fireSalamander', '火蜥蜴', 'spirit', 32, 'phys', ['m_flameBreath', 'm_blazeTail', 'm_scaleGuard', 'm_flare'], 'salamanderScale', ['lizardman', -110, 1, 1.05], '在岩漿邊生活的蜥蜴人。尾巴上的火永遠不會熄。'],
  ['magmaSlime', '熔岩姆', 'ooze', 33, 'tank', ['m_bounce', 'm_flare', 'm_emberSpit', 'm_engulf'], 'magmaStone', ['slime', -150, 1, 1.05], '吞了岩漿的泡泡姆。碰一下就會燙傷。'],
  ['volcanoHawk', '火山鷹', 'bird', 33, 'fast', ['m_talonDive', 'm_heatHaze', 'm_flameBreath', 'm_dive'], 'feather', ['harpy', -15, 1.1, 0.85], '在火山口上空盤旋的鷹妖。羽毛尖端燒得通紅。', { trait: 'swift' }],
  ['lavaCrab', '岩漿蟹', 'aquatic', 34, 'tank', ['m_pinch', 'm_crabHammer', 'm_scaleGuard', 'm_flare'], 'magmaStone', ['reedCrab', -50, 1, 0.85], '殼是黑曜石做的大蟹。泡在岩漿裡也不怕。'],
  ['youngDragon', '火龍幼體', 'dragon', 35, 'bal', ['m_flameBreath', 'm_wyrmBite', 'm_heatHaze', 'm_infernoBreath'], null, ['silverWyrm', -160, 1, 0.9], '在赤焰山道築巢的年輕火龍。還小，但已經能噴出煉獄之火。', { elite: 1, drop: 'dragonMail' }],
  // 熔岩坑道 Lv34–36
  ['magmaGolem', '熔岩石怪', 'construct', 34, 'tank', ['m_magmaFist', 'm_harden', 'm_rockfall', 'm_flare'], 'magmaStone', ['pebble', -150, 1, 0.9], '熔岩冷卻成的石怪。裂縫裡還流著岩漿。'],
  ['flameSkeleton', '焰骨兵', 'undead', 35, 'phys', ['m_boneClub', 'm_ghostFire', 'm_rattle', 'm_boneThrow'], 'boneShard', ['skeleton', -160, 1, 1.0], '在坑道裡被燒死的礦工……不，是更古老的戰士。'],
  ['hellHound', '地獄犬', 'spirit', 35, 'fast', ['m_boneRush', 'm_flameBreath', 'm_howl', 'm_bite'], 'salamanderScale', ['boneHound', -150, 1, 0.85], '全身冒著火的獵犬。叫聲像是燒紅的鐵。'],
  ['blazeSpirit', '爆炎精', 'spirit', 36, 'mage', ['m_flare', 'm_heatHaze', 'm_emberSpit', 'm_eruption'], 'magmaStone', ['emberSpirit', -5, 1.2, 1.15], '岩漿裡誕生的火之精靈。脾氣一上來就會爆炸。'],
  ['lavaGiant', '熔岩巨人', 'construct', 37, 'tank', ['m_magmaFist', 'm_quake', 'm_heatHaze', 'm_eruption'], null, ['mossGiant', -120, 0.9, 0.55], '熔岩坑道最深處的巨人。宰相用黑暗魔力把牠喚醒，封住了通往要塞的路。', { boss: 1, drop: 'lavaHeart' }],
  // 黯滅要塞 Lv36–38
  ['duskKnight', '黯滅騎士', 'undead', 36, 'phys', ['m_darkSlash', 'm_spearRush', 'm_boneShield', 'm_deathCry'], 'shadowCloth', ['riftKnight', 250, 0.7, 0.6], '影將麾下的騎士。鎧甲裡只剩下黑色的霧。'],
  ['shadowMage', '暗影法師', 'human', 37, 'mage', ['m_shadowBolt', 'm_curseMark', 'm_hex', 'm_darkPulse'], 'shadowCloth', ['rogueBlade', 250, 0.5, 0.55], '宰相收下的黑暗法師。袍子底下什麼都看不見，只有兩隻發光的眼睛。'],
  ['sentinel', '魔像哨兵', 'construct', 37, 'tank', ['m_runeBeam', 'm_stoneWall', 'm_prismRay', 'm_voidBeam'], 'voidShard', ['golem', 260, 0.6, 0.55], '要塞的守衛魔像。眼睛會追著入侵者轉。'],
  ['voidHound', '虛空獵犬', 'spirit', 37, 'fast', ['m_boneRush', 'm_voidGaze', 'm_bite', 'm_darkPulse'], 'voidShard', ['boneHound', 260, 0.7, 0.55], '從虛空裡爬出來的獵犬。影子比身體還大。'],
  ['nightmare', '夢魘', 'spirit', 38, 'mage', ['m_lullaby', 'm_dreamEater', 'm_hex', 'm_soulSip'], 'shadowCloth', ['wraith', 280, 0.8, 0.6], '吃人美夢的魔物。先讓你睡著，再把夢吃掉。'],
  ['duskCaptain', '黯滅騎士長', 'undead', 38, 'phys', ['m_darkSlash', 'm_spearRush', 'm_deathCry', 'm_riftCharge'], null, ['riftKnight', 270, 0.9, 0.45], '黯滅騎士的隊長。曾經是王國的騎士團長。', { elite: 1, drop: 'duskBlade' }],
  ['victorDemon', '魔人維克托', 'human', 38, 'mage', ['m_shadowBolt', 'm_curseMark', 'm_demonClaw', 'm_tyranny'], null, ['rogueBlade', -30, 0.6, 0.6], '把靈魂賣給影將的宰相。為了「永遠不會老去的身體」背叛了王國。', { boss: 1, drop: 'victorRing' }],
  ['shadowGeneral', '影將莫爾德', 'human', 40, 'bal', ['m_shadowSlash', 'm_dominate', 'm_darkPulse', 'm_eclipseBlade'], null, ['gatekeeper', 250, 0.7, 0.5], '黯滅之王札爾格斯的四將之一。五百年前被初代勇者封印在北境的要塞裡。', { boss: 1, drop: 'moldBlade' }],
  // 星見神殿 Lv40–43（第二章之後）
  ['starSpirit', '星靈', 'spirit', 40, 'mage', ['m_moonBeam', 'm_starfall', 'm_flicker', 'm_moonDust'], 'starDust', ['moonSprite', 40, 1, 1.3], '星光凝成的小精靈。會在神殿裡唱歌。'],
  ['angelStatue', '天使石像', 'construct', 41, 'tank', ['m_holyRay', 'm_stoneWall', 'm_prismRay', 'm_crystalShard'], 'starDust', ['riftKnight', 30, 0.5, 1.55], '守護神殿的天使石像。翅膀是用星星的碎片刻的。'],
  ['cometBird', '彗星鳥', 'bird', 41, 'fast', ['m_dive', 'm_starfall', 'm_featherGust', 'm_talonDive'], 'feather', ['bird', 200, 0.9, 1.25], '拖著光尾飛行的鳥。據說看見牠的人會有好運。', { trait: 'swift' }],
  ['abyssEye', '深淵之眼', 'spirit', 42, 'mage', ['m_voidBeam', 'm_voidGaze', 'm_darkPulse', 'm_hex'], 'voidShard', ['voidEye', 90, 1, 0.9], '從星空的裂縫窺視這個世界的眼睛。'],
  ['starGuardian', '星之守護者', 'construct', 45, 'bal', ['m_holyRay', 'm_starfall', 'm_dominate', 'm_cometLance'], null, ['gatekeeper', 30, 0.7, 1.4], '星見神殿的守護者。只有打贏牠的人，才能看見初代勇者留下的星圖。', { boss: 1, drop: 'starLance' }],
  // 稀有
  ['platinumSlime', '白金泡泡姆', 'ooze', 26, 'fast', ['m_bounce', 'm_goo'], null, ['slime', 180, 0.15, 1.45], '【稀有】全身閃著白金光澤的泡泡姆。一不注意就會逃走。', { rare: 1 }],
];
function ch2Panel(lv, role, kind) {
  const f = (lv + 10) / 30, R = CH2_ROLE[role], T = [60, 29, 27, 26, 27, 23], P = { lv };
  const K = kind === 'boss' ? [4.6, 1.3, 1.25, 1.3, 1.25, 1] : kind === 'elite' ? [1.35, 1.15, 1.05, 1.15, 1.05, 1.05] : [1, 1, 1, 1, 1, 1];
  ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].forEach((k, i) => P[k] = Math.round(T[i] * f * R[i] * K[i]));
  if (kind === 'boss') { P.crit = 8; P.hit = 5; } if (role === 'fast') P.eva = 6; return P;
}
for (const [k, n, fam, lv, role, moves, mat, look, dex, ex = {}] of CH2_MON) {
  const kind = ex.boss ? 'boss' : ex.elite ? 'elite' : 'wild', R = CH2_ROLE[role];
  SPECIES[k] = { n, fam, base: R.map(v => Math.round(v * 80)), exp: Math.round((5 * lv + 28) * (kind === 'boss' ? 4 : kind === 'elite' ? 2.3 : 1)), gold: kind === 'wild' ? Math.round(lv * 1.4) : 0,
    learn: moves.map((m, i) => [kind === 'wild' && i === 3 ? lv - 1 : 1, m]), dex, ...ex };
  if (mat) SPECIES[k].mat = mat;
  if (ex.rare) { Object.assign(SPECIES[k], { exp: 260, gold: 300, base: [40, 20, 90, 20, 90, 90] }); MON_PANEL[k] = { lv, hp: 26, atk: 9, def: 30, spa: 9, spd: 30, spe: 44, eva: 12 }; }
  else MON_PANEL[k] = ch2Panel(lv, role, kind);
  const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF_PENDING[k] = b; HD_RIG_OF[k] = b;
  const base = ART[b] ? b : PLACEHOLDER[b] && PLACEHOLDER[b][0]; if (ART[base]) ART[k] = artRecolor(ART[base], dh, ks, kl);
}
// hand-tuned boss / elite details
/* boss HP tuned by the ch2 probe (tools/v45.js): best-skill hits ~13 at the first boss rising to ~22 at the last, ~26 for the optional star guardian */
MON_PANEL.victorDemon.spa = Math.round(MON_PANEL.victorDemon.spa * 0.88); MON_PANEL.frostLich.spa = Math.round(MON_PANEL.frostLich.spa * 0.85); MON_PANEL.frostQueen.spa = Math.round(MON_PANEL.frostQueen.spa * 0.88);
for (const [k, m] of [['ratKing', 0.93], ['harvestGolem', 0.75], ['clockColossus', 0.72], ['lavaGiant', 0.56], ['shadowGeneral', 1.0], ['starGuardian', 1.0]]) MON_PANEL[k].hp = Math.round(MON_PANEL[k].hp * m);
SPECIES.platinumSlime.learn = [[1, 'm_bounce'], [1, 'm_goo']];

/* ---------- items & materials ---------- */
Object.assign(ITEMS, {
  wolfPelt: { n: '灰狼皮', mat: 1, price: 0, sell: 90, cat: '魔物素材', d: '灰鬃狼的毛皮。又厚又暖。' },
  banditCloth: { n: '黑羽布', mat: 1, price: 0, sell: 80, cat: '魔物素材', d: '盜賊團斗篷上的黑布。縫著一根黑羽毛。' },
  beetleHorn: { n: '巨甲蟲角', mat: 1, price: 0, sell: 95, cat: '魔物素材', d: '巨角甲蟲的角。比鐵還硬。' },
  ratTail: { n: '鼠尾', mat: 1, price: 0, sell: 70, cat: '魔物素材', d: '溝鼠的尾巴。……拿著有點噁心。' },
  crocHide: { n: '水道鱷皮', mat: 1, price: 0, sell: 100, cat: '魔物素材', d: '水道鱷的皮。防水又耐磨。' },
  rustScrap: { n: '鏽鐵片', mat: 1, price: 0, sell: 85, cat: '魔物素材', d: '生鏽的鐵片。熔掉重打還能用。' },
  wheat: { n: '金麥穗', mat: 1, price: 0, sell: 80, cat: '採集素材', d: '金穗平原的麥穗。王都的麵包都是用它做的。' },
  honey: { n: '野蜂蜜', mat: 1, price: 0, sell: 110, cat: '魔物素材', d: '麥田蜂的蜂蜜。又香又甜。' },
  boarTusk: { n: '野豬獠牙', mat: 1, price: 0, sell: 100, cat: '魔物素材', d: '暴走野豬的獠牙。' },
  windStone: { n: '風之石', mat: 1, price: 0, sell: 120, cat: '魔物素材', d: '風精留下的石頭。拿在手上會感覺到微風。' },
  spring: { n: '發條', mat: 1, price: 0, sell: 120, cat: '魔物素材', d: '發條兵身上的發條。還有彈性。' },
  brassGear: { n: '黃銅齒輪', mat: 1, price: 0, sell: 130, cat: '魔物素材', d: '鐘塔的黃銅齒輪。鐘錶師很想要。' },
  snowPelt: { n: '雪狼毛', mat: 1, price: 0, sell: 130, cat: '魔物素材', d: '雪白的毛皮。穿上就不怕冷。' },
  iceCrystal: { n: '冰晶', mat: 1, price: 0, sell: 140, cat: '採集素材', d: '不會融化的冰晶。裡面封著寒氣。' },
  salamanderScale: { n: '火蜥鱗', mat: 1, price: 0, sell: 150, cat: '魔物素材', d: '火蜥蜴的鱗片。摸起來溫溫的。' },
  magmaStone: { n: '熔岩石', mat: 1, price: 0, sell: 150, cat: '採集素材', d: '冷卻的熔岩。敲開後裡面還是紅的。' },
  dragonScale: { n: '龍鱗', mat: 1, price: 0, sell: 600, cat: '魔物素材', d: '火龍幼體掉下的鱗片。傳說中的鍛造材料。' },
  shadowCloth: { n: '暗影布', mat: 1, price: 0, sell: 170, cat: '魔物素材', d: '黑暗魔力織成的布。看久了會頭暈。' },
  voidShard: { n: '虛空碎片', mat: 1, price: 0, sell: 180, cat: '魔物素材', d: '從虛空裡剝落的碎片。冰冷又沒有重量。' },
  starDust: { n: '星塵', mat: 1, price: 0, sell: 250, cat: '採集素材', d: '星見神殿地上的閃亮粉末。' },
  // key items
  royalSummons: { n: '王都的召集令', key: 1, price: 0, sell: 0, cat: '重要物品', d: '蓋著王國紋章的信。召集「異界之人」前往王都。' },
  timeGear: { n: '時之齒輪', key: 1, price: 0, sell: 0, cat: '重要物品', d: '驅動曙光鐘塔的古代齒輪。上面刻著初代勇者的紋章。' },
  northPass: { n: '北境通行證', key: 1, price: 0, sell: 0, cat: '重要物品', d: '國王親筆簽名的通行證。拿著它就能通過北境的關卡。' },
  frostKey: { n: '寒冰之鑰', key: 1, price: 0, sell: 0, cat: '重要物品', d: '霜之女王留下的鑰匙。能打開被冰封的北方之路。' },
  fireSeal: { n: '火之印', key: 1, price: 0, sell: 0, cat: '重要物品', d: '熔岩巨人守護的火之印。要塞的大門靠它才打得開。' },
  dawnHeart: { n: '曙光之心', key: 1, price: 0, sell: 0, cat: '重要物品', d: '曙光鐘的核心。五百年前初代勇者用它封印了影將。' },
  guildCard: { n: '公會會員證', key: 1, price: 0, sell: 0, cat: '重要物品', d: '王都冒險者公會的會員證。可以接公會的委託。' },
  lostScore: { n: '失落的樂譜', key: 1, price: 0, sell: 0, cat: '重要物品', d: '吟遊詩人公會遺失的古老樂譜。' },
  dragonFlame: { n: '龍之火種', key: 1, price: 0, sell: 0, cat: '重要物品', d: '龍騎士的試煉：從火龍幼體那裡取得的火種。' },
  // consumables (sold in 王都 / 霜語村)
  megaPotion: { n: '特級傷藥', price: 900, d: '恢復200點HP。', use: 'heal', v: 200 },
  megaEther: { n: '特級魔力藥水', price: 1500, d: '恢復100點MP。', use: 'mp', v: 100 },
});
GATHER_KINDS.wheat = ['金麥', 'wheat', [1, 2], [['honey', 0.12]]]; GATHER_IMG.wheat = GATHER_IMG.herb;
GATHER_KINDS.ice = ['冰晶簇', 'iceCrystal', [1, 2], [['crystal', 0.2]]]; GATHER_IMG.ice = GATHER_IMG.crystal;
GATHER_KINDS.magma = ['熔岩脈', 'magmaStone', [1, 2], [['stone', 0.3]]]; GATHER_IMG.magma = GATHER_IMG.ore;
GATHER_KINDS.star = ['星塵', 'starDust', [1, 1], [['starShard', 0.1]]]; GATHER_IMG.star = GATHER_IMG.crystal;

/* ---------- gear: tier 5–7 ---------- */
Object.assign(GEAR, {
  // 王都的武具店 (t5)
  royalSword: { n: '王國騎士劍', slot: 'weapon', t: 5, st: { atk: 15 }, sp: { crit: 3 }, d: '王國騎士團的制式長劍。' },
  royalDagger: { n: '宮廷短劍', slot: 'weapon', t: 5, st: { atk: 13, spe: 3 }, sp: { crit: 4 }, d: '宮廷護衛愛用的短劍。' },
  courtStaff: { n: '宮廷魔杖', slot: 'weapon', t: 5, st: { spa: 15 }, sp: { elem: 4 }, d: '王立魔導院的魔杖。' },
  royalTome: { n: '王立魔導書', slot: 'weapon', t: 5, st: { spa: 14, mp: 20 }, d: '王立圖書館的魔導書。' },
  royalHelm: { n: '騎士團頭盔', slot: 'head', t: 5, st: { def: 7, spd: 3 }, d: '王國騎士團的頭盔。' },
  royalMail: { n: '騎士團鎧甲', slot: 'body', t: 5, st: { def: 15, spd: 6, hp: 4 }, d: '王國騎士團的鎧甲。' },
  courtRobe: { n: '宮廷長袍', slot: 'body', t: 5, st: { def: 8, spd: 13, spa: 3 }, d: '宮廷魔導師的長袍。' },
  royalGreaves: { n: '騎士團長靴', slot: 'feet', t: 5, st: { spe: 6, def: 4 }, d: '王國騎士團的長靴。' },
  royalBadge: { n: '王國徽章', slot: 'acc', t: 5, st: { hp: 6, def: 3, spd: 3 }, d: '王國的徽章。' },
  // 街道・水道・平原 (t5)
  wolfFang2: { n: '灰狼牙刃', slot: 'weapon', t: 5, st: { atk: 14, spe: 2 }, sp: { crit: 4 }, d: '用灰鬃狼的牙磨成的短刀。' },
  hornSpear: { n: '甲蟲角劍', slot: 'weapon', t: 5, st: { atk: 16 }, d: '把巨甲蟲角裝上劍柄的重劍。' },
  windStaff: { n: '風鳴法杖', slot: 'weapon', t: 5, st: { spa: 15, spe: 3 }, d: '杖頭嵌著風之石的法杖。' },
  wolfHood: { n: '灰狼兜帽', slot: 'head', t: 5, st: { def: 5, spd: 4, spe: 2 }, d: '灰狼皮做的兜帽。' },
  rustMail: { n: '重鑄鎖甲', slot: 'body', t: 5, st: { def: 14, spd: 5 }, d: '用鏽鐵片重新鍛造的鎖甲。' },
  wheatBoots: { n: '麥田靴', slot: 'feet', t: 5, st: { spe: 6, def: 3, hp: 3 }, d: '走在麥田裡也不會滑倒的靴子。' },
  honeyCharm: { n: '蜂蜜護符', slot: 'acc', t: 5, st: { hp: 8, spd: 3 }, d: '散發著甜味的護符。' },
  // 鐘塔 (t5–6)
  brassSword: { n: '黃銅發條劍', slot: 'weapon', t: 6, st: { atk: 17 }, sp: { crit: 3 }, d: '劍柄裡裝著發條的劍。揮起來會喀啦作響。' },
  gearStaff: { n: '齒輪魔杖', slot: 'weapon', t: 6, st: { spa: 17 }, sp: { elem: 4 }, d: '杖頭是一顆轉個不停的齒輪。' },
  clockHelm: { n: '鐘塔護盔', slot: 'head', t: 6, st: { def: 8, spd: 4 }, d: '鐘塔守衛的頭盔。' },
  clockMail: { n: '發條鎧甲', slot: 'body', t: 6, st: { def: 17, spd: 7 }, d: '關節裝著發條的鎧甲。' },
  springBoots: { n: '彈簧靴', slot: 'feet', t: 6, st: { spe: 8, def: 3 }, d: '鞋底裝著彈簧的靴子。跳得很高。' },
  ancientWatch: { n: '古代懷錶', slot: 'acc', t: 6, st: { spe: 4, spa: 3, atk: 3 }, d: '鐘塔找到的懷錶。指針走得比別的錶快一點。' },
  // 雪原・冰晶洞窟 (t6)
  frostBrand: { n: '霜之劍', slot: 'weapon', t: 6, st: { atk: 17 }, sp: { crit: 3 }, elem: '水', d: '劍身結著不會融化的霜。' },
  iceDagger: { n: '冰晶短刀', slot: 'weapon', t: 6, st: { atk: 15, spe: 3 }, sp: { crit: 5 }, d: '用冰晶削成的短刀。' },
  glacierStaff: { n: '冰河法杖', slot: 'weapon', t: 6, st: { spa: 18 }, sp: { elem: 5 }, elem: '水', d: '封著冰河寒氣的法杖。' },
  frostHood: { n: '雪原兜帽', slot: 'head', t: 6, st: { def: 6, spd: 6 }, d: '雪狼毛做的兜帽。' },
  yetiFur: { n: '雪人毛皮甲', slot: 'body', t: 6, st: { def: 16, spd: 8, hp: 5 }, d: '雪人的毛皮做的鎧甲。又暖又硬。' },
  snowBoots: { n: '雪地長靴', slot: 'feet', t: 6, st: { spe: 7, def: 5 }, d: '在雪地上也走得很快的靴子。' },
  iceCharm: { n: '冰晶護符', slot: 'acc', t: 6, st: { spd: 5, hp: 6 }, d: '冰晶做的護符。' },
  // 火山・熔岩坑道 (t6)
  flameBrand: { n: '炎之劍', slot: 'weapon', t: 6, st: { atk: 18 }, sp: { crit: 3 }, elem: '火', d: '劍身流著岩漿的劍。' },
  magmaDagger: { n: '熔岩短刀', slot: 'weapon', t: 6, st: { atk: 16, spe: 3 }, sp: { crit: 5 }, elem: '火', d: '熔岩石磨成的短刀。' },
  volcanoStaff: { n: '火山法杖', slot: 'weapon', t: 6, st: { spa: 19 }, sp: { elem: 5 }, elem: '火', d: '杖頭是一塊還在發光的熔岩石。' },
  salamanderHelm: { n: '火蜥盔', slot: 'head', t: 6, st: { def: 9, spd: 4 }, d: '火蜥蜴鱗片做的頭盔。' },
  magmaPlate: { n: '熔岩重鎧', slot: 'body', t: 6, st: { def: 19, spd: 6, hp: 4 }, d: '黑曜石和熔岩石打成的重鎧。' },
  lavaBoots: { n: '熔岩靴', slot: 'feet', t: 6, st: { spe: 7, def: 6 }, d: '踩在熔岩上也不會燒起來的靴子。' },
  emberCharm: { n: '火種護符', slot: 'acc', t: 6, st: { atk: 4, spa: 4 }, d: '裝著永不熄滅的火種的護符。' },
  // 黯滅要塞 (t7)
  duskSword: { n: '黯滅長劍', slot: 'weapon', t: 7, st: { atk: 20 }, sp: { crit: 4 }, d: '黯滅騎士的長劍。' },
  shadowDagger: { n: '暗影短刀', slot: 'weapon', t: 7, st: { atk: 18, spe: 4 }, sp: { crit: 6 }, d: '刀身是黑霧凝成的短刀。' },
  voidStaff: { n: '虛空法杖', slot: 'weapon', t: 7, st: { spa: 21 }, sp: { elem: 5 }, d: '杖頭嵌著虛空碎片。' },
  voidTome: { n: '虛空之書', slot: 'weapon', t: 7, st: { spa: 20, mp: 24 }, d: '暗影法師的魔導書。' },
  duskHelm: { n: '黯滅頭盔', slot: 'head', t: 7, st: { def: 10, spd: 5 }, d: '黯滅騎士的頭盔。' },
  duskPlate: { n: '黯滅重鎧', slot: 'body', t: 7, st: { def: 21, spd: 8, hp: 5 }, d: '黯滅騎士的鎧甲。' },
  shadowRobe: { n: '暗影長袍', slot: 'body', t: 7, st: { def: 11, spd: 18, spa: 4 }, d: '暗影法師的長袍。' },
  voidBoots: { n: '虛空長靴', slot: 'feet', t: 7, st: { spe: 9, def: 6 }, d: '走路沒有聲音的長靴。' },
  voidRing: { n: '虛空之戒', slot: 'acc', t: 7, st: { atk: 5, spa: 5, hp: 4 }, d: '戒台上浮著一小塊虛空碎片。' },
  // 星見神殿 (t7, post-game)
  starSword: { n: '星辰之劍', slot: 'weapon', t: 7, st: { atk: 22 }, sp: { crit: 5 }, d: '劍身裡流著星光。' },
  cometDagger: { n: '彗星短刀', slot: 'weapon', t: 7, st: { atk: 19, spe: 5 }, sp: { crit: 7 }, d: '拖著光尾的短刀。' },
  starStaff: { n: '星見法杖', slot: 'weapon', t: 7, st: { spa: 23 }, sp: { elem: 6 }, d: '神殿祭司的法杖。' },
  starCrown: { n: '星之冠', slot: 'head', t: 7, st: { def: 8, spd: 9, spa: 3 }, d: '鑲著星塵的頭冠。' },
  starRobe: { n: '星空之衣', slot: 'body', t: 7, st: { def: 17, spd: 17, hp: 6 }, d: '像夜空一樣閃閃發光的衣服。' },
  starBoots: { n: '流星靴', slot: 'feet', t: 7, st: { spe: 11, def: 5 }, d: '穿上以後腳步像流星一樣快。' },
  // boss / elite signature gear (gold, with a special effect)
  blackCloak: { n: '黑羽斗篷', slot: 'body', t: 5, st: { def: 11, spd: 7, spe: 4 }, fx: ['shadowStep'], d: '盜賊頭目的斗篷。閃過攻擊時會順勢反擊。' },
  ratCrown: { n: '溝鼠王冠', slot: 'head', t: 5, st: { def: 6, spd: 4, hp: 4 }, fx: ['fortune'], d: '溝鼠王的鐵皮王冠。……戴起來有點臭，但會帶來財運。' },
  boarHelm: { n: '野豬王盔', slot: 'head', t: 5, st: { def: 7, atk: 3 }, fx: ['fervor'], d: '用野豬王的頭骨做的頭盔。戴上就會熱血沸騰。' },
  harvestScythe: { n: '收穫之鐮', slot: 'weapon', t: 6, st: { atk: 17 }, sp: { crit: 4 }, fx: ['cleave'], d: '收穫魔像的鐮刀改成的劍。' },
  chronoLance: { n: '時計長槍劍', slot: 'weapon', t: 6, st: { atk: 18, spe: 3 }, fx: ['first'], d: '發條騎士的長槍改成的劍。總是比對手快一步。' },
  colossusCore: { n: '時計之心', slot: 'acc', t: 6, st: { hp: 10, def: 4 }, fx: ['guardHeal'], d: '時計巨像胸口的大時鐘。滴答聲讓人安心。' },
  bearMantle: { n: '巨熊斗篷', slot: 'body', t: 6, st: { def: 17, spd: 8, hp: 6 }, fx: ['regen'], d: '雪原巨熊的毛皮。穿上以後傷口會慢慢癒合。' },
  lichTome: { n: '巫妖的冰書', slot: 'weapon', t: 6, st: { spa: 18, mp: 22 }, fx: ['manaSiphon'], elem: '水', d: '冰霜巫妖的魔導書。' },
  frostTiara: { n: '霜之后冠', slot: 'head', t: 6, st: { spa: 5, spd: 7 }, fx: ['mpGuard'], d: '霜之女王的冠冕。清醒後的女王親手交給了你。' },
  dragonMail: { n: '火龍鱗鎧', slot: 'body', t: 6, st: { def: 19, spd: 9, hp: 5 }, fx: ['thorns'], d: '火龍幼體的鱗片做成的鎧甲。' },
  lavaHeart: { n: '熔岩之心', slot: 'acc', t: 6, st: { hp: 10, atk: 4 }, fx: ['endure'], d: '熔岩巨人的心臟。還在跳動。' },
  duskBlade: { n: '騎士長的黑劍', slot: 'weapon', t: 7, st: { atk: 21 }, sp: { crit: 4 }, fx: ['pierce'], d: '黯滅騎士長的劍。曾經是王國騎士團長的佩劍。' },
  victorRing: { n: '宰相的魔戒', slot: 'acc', t: 7, st: { spa: 6, spd: 4 }, fx: ['arcaneSurge'], d: '維克托的魔戒。黑暗已經散去，只剩下純粹的魔力。' },
  moldBlade: { n: '影將大劍', slot: 'weapon', t: 7, st: { atk: 24 }, sp: { crit: 5 }, fx: ['lastStand'], d: '影將莫爾德的大劍。越是危急越是鋒利。' },
  starLance: { n: '星之守護', slot: 'acc', t: 7, st: { atk: 6, spa: 6, hp: 8 }, fx: ['double'], d: '星之守護者的光之槍化成的護符。' },
});
Object.assign(HEAD_PAL, { royal: { A: '#c8d0e0', a: '#7a88a8', C: '#e8c048' }, wolfG: { A: '#8a8a94', a: '#5a5a64', C: '#b8b8c4' }, clock: { A: '#c8a050', a: '#8a6a2a', C: '#f0d890' }, frostH: { A: '#e8f0ff', a: '#98b0d8', C: '#80d0ff' },
  salam: { A: '#d0502a', a: '#8a2a18', C: '#ffb040' }, dusk: { A: '#3a2e48', a: '#1e1628', C: '#a040d0' }, star: { A: '#2a3060', a: '#181c40', C: '#ffe890' }, rat: { A: '#a8a8a0', a: '#6a6a60', C: '#e8c048' },
  boar: { A: '#8a6a4a', a: '#5a4430', C: '#f0e8d8' }, tiara: { A: '#d8f0ff', a: '#88b8e8', C: '#ffffff' } });
Object.assign(BODY_LOOKS, {
  royal: ['plate', { X: '#b8c0d0', x: '#7a84a0', Y: '#e8ecf4', y: '#a8b0c4', Z: '#2a4a9a' }],
  courtRobe: ['robe', { X: '#3a4a8a', x: '#26305e', Z: '#e8c048', W: '#f0f0ff' }],
  rust: ['mail', { X: '#9a6a4a', x: '#6a442a', Y: '#c09070', y: '#8a6048', Z: '#4a3424', z: '#c0a060' }],
  clock: ['plate', { X: '#c8a050', x: '#8a6a2a', Y: '#f0d890', y: '#b89048', Z: '#4ac0c0' }],
  yeti: ['cloak', { X: '#e8eef8', x: '#b0bcd0', Y: '#ffffff', Z: '#6a88b8', z: '#80d0ff', W: '#f8f8ff', D: '#c8d4e8', d: '#98a8c8' }],
  magma: ['plate', { X: '#3a2a2a', x: '#1e1414', Y: '#6a4a44', y: '#4a3030', Z: '#ff6020' }],
  duskP: ['plate', { X: '#3a2e48', x: '#1e1628', Y: '#5a4a6a', y: '#3a2e48', Z: '#a040d0' }],
  shadowR: ['robe', { X: '#2a2034', x: '#140e1e', Z: '#8a40c0', W: '#c8a0ff' }],
  starR: ['robe', { X: '#2a3060', x: '#181c40', Z: '#ffe890', W: '#c8d8ff' }],
  blackCloak: ['cloak', { X: '#2a2a34', x: '#16161e', Y: '#44444e', Z: '#1e1418', z: '#c8c8d8', W: '#8a8a98', D: '#3a3a44', d: '#22222a' }],
  bear: ['cloak', { X: '#e0e4ec', x: '#a8b0c0', Y: '#ffffff', Z: '#5a4a3a', z: '#80c0e8', W: '#f0f0f8', D: '#c8ccd8', d: '#9098a8' }],
  dragonM: ['mail', { X: '#c8402a', x: '#8a2418', Y: '#f07a40', y: '#c04a2a', Z: '#3a1e14', z: '#ffc040' }],
});
Object.assign(FEET_PAL, { royal: { B: '#b8c0d0', b: '#7a84a0', P: '#2a4a9a', p: '#1a2e6a' }, wheat: { B: '#c8a050', b: '#8a6a2a' }, spring: { B: '#c8a050', b: '#8a6a2a', P: '#4ac0c0', p: '#2a8a8a' },
  snow: { B: '#e8eef8', b: '#98a8c8' }, lava: { B: '#3a2a2a', b: '#1e1414', P: '#ff6020', p: '#a03010' }, voidF: { B: '#2a2034', b: '#140e1e', P: '#8a40c0', p: '#5a2080' }, starF: { B: '#2a3060', b: '#181c40', P: '#ffe890', p: '#c8a040' } });
Object.assign(WPN_PAL, { royal: { I: '#ffffff', i: '#c0c8d8', T: '#2a2a4a', U: '#e8c048' }, wolfG: { I: '#f8f8f8', i: '#a8a8b0', T: '#4a3a30', U: '#8a8a94' }, horn: { I: '#e8d8b0', i: '#8a6a3a', T: '#3a2a1a', U: '#6a4a2a' },
  brass: { I: '#fff0c0', i: '#c8a050', T: '#4a3a24', U: '#4ac0c0' }, frost: { I: '#ffffff', i: '#80d0ff', T: '#2a3a5a', U: '#d8f0ff' }, flame: { I: '#fff0a0', i: '#ff6020', T: '#3a1e14', U: '#ffc040' },
  dusk: { I: '#d8b0ff', i: '#5a3a7a', T: '#1e1628', U: '#a040d0' }, star: { I: '#ffffff', i: '#a0b8ff', T: '#2a3060', U: '#ffe890' }, harvest: { I: '#f0e8d0', i: '#a09070', T: '#6a4a2a', U: '#d8b040' },
  chrono: { I: '#fff8e0', i: '#d8b060', T: '#3a2a1a', U: '#4ac0c0' }, mold: { I: '#c8a0ff', i: '#3a2448', T: '#140e1e', U: '#ff3040' },
  wandCt: { T: '#2a3a7a', V: '#e8c048' }, wandWd: { T: '#4a7a6a', V: '#c0fff0' }, wandGr: { T: '#8a6a2a', V: '#4ac0c0' }, wandGl: { T: '#4a6a9a', V: '#e0f8ff' }, wandVo: { T: '#3a2a1a', V: '#ff6020' },
  wandVd: { T: '#1e1628', V: '#a040d0' }, wandSt: { T: '#2a3060', V: '#ffe890' }, tomeRy: { T: '#2a3a7a', U: '#e8c048', V: '#f0f0ff' }, tomeLi: { T: '#4a6a9a', U: '#e0f8ff', V: '#c8e8ff' }, tomeVd: { T: '#1e1628', U: '#a040d0', V: '#d8c8f0' } });
const GEAR_LOOK_CH2 = {
  royalSword: ['sword', 'royal'], royalDagger: ['dagger', 'royal'], courtStaff: ['staff', 'wandCt'], royalTome: ['tome', 'tomeRy'], royalHelm: ['helm', 'royal'], royalMail: 'royal', courtRobe: 'courtRobe', royalGreaves: 'royal',
  wolfFang2: ['dagger', 'wolfG'], hornSpear: ['sword', 'horn'], windStaff: ['staff', 'wandWd'], wolfHood: ['hood', 'wolfG'], rustMail: 'rust', wheatBoots: 'wheat',
  brassSword: ['sword', 'brass'], gearStaff: ['staff', 'wandGr'], clockHelm: ['helm', 'clock'], clockMail: 'clock', springBoots: 'spring',
  frostBrand: ['sword', 'frost'], iceDagger: ['dagger', 'frost'], glacierStaff: ['staff', 'wandGl'], frostHood: ['hood', 'frostH'], yetiFur: 'yeti', snowBoots: 'snow',
  flameBrand: ['sword', 'flame'], magmaDagger: ['dagger', 'flame'], volcanoStaff: ['staff', 'wandVo'], salamanderHelm: ['helm', 'salam', 'horns'], magmaPlate: 'magma', lavaBoots: 'lava',
  duskSword: ['sword', 'dusk'], shadowDagger: ['dagger', 'dusk'], voidStaff: ['staff', 'wandVd'], voidTome: ['tome', 'tomeVd'], duskHelm: ['helm', 'dusk', 'horns'], duskPlate: 'duskP', shadowRobe: 'shadowR', voidBoots: 'voidF',
  starSword: ['sword', 'star'], cometDagger: ['dagger', 'star'], starStaff: ['staff', 'wandSt'], starCrown: ['cap', 'star'], starRobe: 'starR', starBoots: 'starF',
  blackCloak: 'blackCloak', ratCrown: ['cap', 'rat'], boarHelm: ['helm', 'boar', 'horns'], harvestScythe: ['sword', 'harvest'], chronoLance: ['sword', 'chrono'], bearMantle: 'bear', lichTome: ['tome', 'tomeLi'],
  frostTiara: ['cap', 'tiara'], dragonMail: 'dragonM', duskBlade: ['sword', 'dusk'], moldBlade: ['sword', 'mold'],
};
Object.assign(GEAR_LOOK, GEAR_LOOK_CH2); for (const k in GEAR_LOOK_CH2) GEAR[k].look = GEAR_LOOK_CH2[k];
WEAPON_KINDS.劍.push('royalSword', 'hornSpear', 'brassSword', 'frostBrand', 'flameBrand', 'duskSword', 'starSword', 'harvestScythe', 'chronoLance', 'duskBlade', 'moldBlade');
WEAPON_KINDS.短刀.push('royalDagger', 'wolfFang2', 'iceDagger', 'magmaDagger', 'shadowDagger', 'cometDagger');
WEAPON_KINDS.法杖.push('courtStaff', 'windStaff', 'gearStaff', 'glacierStaff', 'volcanoStaff', 'voidStaff', 'starStaff');
WEAPON_KINDS.魔導書.push('royalTome', 'voidTome', 'lichTome');
for (const kind in WEAPON_KINDS) for (const k of WEAPON_KINDS[kind]) if (GEAR[k]) GEAR[k].kind = kind;
for (const k in GEAR_LOOK_CH2) { const g = GEAR[k]; if (g.slot !== 'weapon' && g.slot !== 'acc') g.kind = (g.st.def || 0) >= (g.st.spd || 0) + (g.st.spe || 0) ? '重裝' : '輕裝'; }
for (const k of ['royalBadge', 'honeyCharm', 'ancientWatch', 'iceCharm', 'emberCharm', 'voidRing', 'colossusCore', 'lavaHeart', 'victorRing', 'starLance']) GEAR[k].kind = '飾品';
Object.assign(MAGE_SWAP, { royalSword: 'courtStaff', hornSpear: 'windStaff', wolfFang2: 'royalTome', brassSword: 'gearStaff', frostBrand: 'glacierStaff', iceDagger: 'lichTome', flameBrand: 'volcanoStaff', magmaDagger: 'volcanoStaff', duskSword: 'voidStaff', shadowDagger: 'voidTome', starSword: 'starStaff', cometDagger: 'starStaff', harvestScythe: 'gearStaff', chronoLance: 'gearStaff', duskBlade: 'voidTome', moldBlade: 'voidStaff' });
Object.assign(LOOT, {
  blackFeather: ['blackCloak', 'wolfFang2', 'wolfHood', 'honeyCharm'], ratKing: ['ratCrown', 'rustMail', 'royalDagger', 'wheatBoots'], boarKing: ['boarHelm', 'hornSpear', 'wheatBoots', 'honeyCharm'],
  harvestGolem: ['harvestScythe', 'windStaff', 'rustMail', 'royalBadge'], clockKnight: ['chronoLance', 'clockHelm', 'springBoots', 'ancientWatch'], clockColossus: ['colossusCore', 'brassSword', 'gearStaff', 'clockMail'],
  snowBear: ['bearMantle', 'frostHood', 'snowBoots', 'iceCharm'], frostLich: ['lichTome', 'glacierStaff', 'frostHood', 'iceCharm'], frostQueen: ['frostTiara', 'frostBrand', 'glacierStaff', 'yetiFur'],
  youngDragon: ['dragonMail', 'flameBrand', 'salamanderHelm', 'emberCharm'], lavaGiant: ['lavaHeart', 'magmaPlate', 'volcanoStaff', 'lavaBoots'],
  duskCaptain: ['duskBlade', 'duskHelm', 'duskPlate', 'voidBoots'], victorDemon: ['victorRing', 'voidTome', 'shadowRobe', 'voidRing'], shadowGeneral: ['moldBlade', 'duskPlate', 'voidStaff', 'voidRing'],
  starGuardian: ['starLance', 'starSword', 'starStaff', 'starRobe'],
});
const RECIPES_CH2 = [
  { out: 'wolfFang2', mats: { wolfPelt: 3, beetleHorn: 1 }, gold: 3600 }, { out: 'hornSpear', mats: { beetleHorn: 3, rustScrap: 2 }, gold: 3800 }, { out: 'wolfHood', mats: { wolfPelt: 3, banditCloth: 2 }, gold: 3200 },
  { out: 'rustMail', mats: { rustScrap: 4, ratTail: 2 }, gold: 3800 }, { out: 'windStaff', mats: { windStone: 3, wheat: 2 }, gold: 3800 }, { out: 'honeyCharm', mats: { honey: 3, wheat: 3 }, gold: 3400 },
  { out: 'brassSword', mats: { brassGear: 3, spring: 2 }, gold: 5200 }, { out: 'gearStaff', mats: { brassGear: 3, windStone: 1 }, gold: 5200 }, { out: 'springBoots', mats: { spring: 3, batWing: 2 }, gold: 4600 },
  { out: 'yetiFur', mats: { snowPelt: 4, iceCrystal: 2 }, gold: 6000 }, { out: 'iceDagger', mats: { iceCrystal: 4, snowPelt: 1 }, gold: 5800 }, { out: 'iceCharm', mats: { iceCrystal: 3, crystal: 2 }, gold: 5600 },
  { out: 'magmaDagger', mats: { magmaStone: 3, salamanderScale: 2 }, gold: 6400 }, { out: 'lavaBoots', mats: { magmaStone: 3, salamanderScale: 1 }, gold: 6000 }, { out: 'emberCharm', mats: { salamanderScale: 3, magmaStone: 2 }, gold: 6200 },
  { out: 'dragonMail', mats: { dragonScale: 3, magmaStone: 3 }, gold: 12000 }, { out: 'voidRing', mats: { voidShard: 3, shadowCloth: 2 }, gold: 9000 }, { out: 'shadowRobe', mats: { shadowCloth: 4, voidShard: 1 }, gold: 9000 },
  { out: 'starBoots', mats: { starDust: 4, starShard: 1 }, gold: 12000 }, { out: 'starCrown', mats: { starDust: 4, crystal: 3 }, gold: 12000 },
];

/* ---------- NPC looks & buildings ---------- */
Object.assign(LOOKS, {
  king: { style: 'beard', skirt: 1, H: '#e8e8f0', h: '#ffffff', j: '#ffffff', W: '#f8f8f8', Y: '#c83a3a', y: '#8a2424', R: '#e8c048', r: '#b09020', P: '#c83a3a' },
  princess: { style: 'long', skirt: 1, H: '#f0d070', h: '#f8e8a0', j: '#fff4c8', Y: '#f8c8d8', y: '#d890a8', R: '#f8f8ff', r: '#d8d8e8', P: '#f8c8d8' },
  knightLia: { style: 'helmet', H: '#c8d0e0', h: '#e8ecf4', j: '#ffffff', Y: '#2a4a9a', y: '#1a2e6a', R: '#c8d0e0', r: '#8a94a8', P: '#2a4a9a' },
  chancellor: { style: 'bald', H: '#4a3a3a', h: '#6a5a5a', j: '#8a7a7a', W: '#e8e0d0', Y: '#6a1e2a', y: '#40121a', R: '#e8c048', r: '#b09020', P: '#2a1e24' },
  clockmaker: { style: 'beard', H: '#8a7a6a', h: '#a89888', j: '#c8b8a8', W: '#e8e0d8', Y: '#6a4a2a', y: '#4a321c', R: '#c8a050', r: '#8a6a2a', P: '#3a2a1e' },
  guildMaster: { H: '#3a2a1e', h: '#5a4230', j: '#7a5a40', Y: '#3a6a3a', y: '#244a24', R: '#c8a050', r: '#8a6a2a', P: '#3a2a1e' },
  bardGirl: { style: 'long', skirt: 1, H: '#3a8ad0', h: '#5aaaf0', j: '#8ac8ff', Y: '#e8f0d8', y: '#c0c8a8', R: '#d05a8a', r: '#a03a64', P: '#d05a8a' },
  monk: { style: 'bald', H: '#e0b890', h: '#f0c8a0', j: '#f8d8b8', W: '#f0e8e0', Y: '#e87a2a', y: '#b0501a', R: '#e87a2a', r: '#b0501a', P: '#6a3a1a' },
  dragonElder: { style: 'beard', H: '#c83a2a', h: '#e85a3a', j: '#ff8a5a', W: '#ffd0c0', Y: '#3a2a2a', y: '#1e1414', R: '#ff6020', r: '#a03010', P: '#3a2a2a' },
  priest: { style: 'long', H: '#e8e0d0', h: '#ffffff', j: '#ffffff', Y: '#f8f8ff', y: '#d8d8e8', R: '#e8c048', r: '#b09020', P: '#f8f8ff' },
  soldier: { style: 'helmet', H: '#8890a0', h: '#b8c0d0', j: '#eef2f8', Y: '#2a4a9a', y: '#1a2e6a', R: '#8890a0', r: '#5a6478', P: '#3a3848' },
  frostVillager: { H: '#6a4a2a', h: '#8a6a4a', j: '#b08a6a', Y: '#e8eef8', y: '#b0bcd0', R: '#5a7aa8', r: '#3a5a88', P: '#3a3848' },
  coachman: { H: '#5a3a24', h: '#7a5234', j: '#9a7050', Y: '#3a5a8a', y: '#2a4068', R: '#c8a060', r: '#8a6a38', P: '#3a3028' },
});
Object.assign(BUILD_STYLE, {
  castle: { roof: '#3a4a7a', roofT: 'slate', wall: '#d8d4cc', beam: '#5a5a6a', shut: '#2a4a9a', banner: '#2a4a9a' },
  guild: { roof: '#6a4a2a', roofT: 'shingle', wall: '#e8dcc0', beam: '#3a2a1e', shut: '#3a6a3a', awning: ['#3a6a3a', '#efe2c4'] },
  church: { roof: '#5a7ab0', roofT: 'slate', wall: '#f4f0e8', beam: '#8a8a9a', shut: '#e8c048', banner: '#f8f8ff' },
  clockShop: { roof: '#8a6a2a', roofT: 'tile', wall: '#ecdfc2', beam: '#4a3226', shut: '#4ac0c0', awning: ['#c8a050', '#efe2c4'] },
  armory: { roof: '#6a6a74', roofT: 'slate', wall: '#e0d8c8', beam: '#3a3a44', shut: '#a83a3a', awning: ['#6a6a74', '#efe2c4'] },
  snowHouse: { roof: '#f0f4fa', roofT: 'thatch', wall: '#d8c8a8', beam: '#4a3226', shut: '#3a5a8a' },
  hall: { roof: '#8a3a5a', roofT: 'tile', wall: '#f0e4d0', beam: '#4a2a34', shut: '#d05a8a', banner: '#d05a8a' },
});
Object.assign(EXPLORE, { northRoad: '北方街道', capital: '王都艾爾德蘭', capSewer: '王都地下水道', goldPlains: '金穗平原', clockTower1: '曙光鐘塔', clockTower2: '曙光鐘塔・上層', frostField: '霜語雪原', frostVillage: '霜語村', iceCave: '冰晶洞窟', emberPass: '赤焰山道', lavaTunnel: '熔岩坑道', duskFort1: '黯滅要塞', duskFort2: '黯滅要塞・深部', starShrine: '星見神殿' });
