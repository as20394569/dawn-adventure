/* ===================== v20 NEW REGIONS: 落日峽谷 (Lv11–15) · 幽光沼澤 (Lv18–22) + event monster 寶箱怪 =====================
   落日峽谷: east branch of 晨霧道路. 砂鉗蠍・峽谷鷹妖・仙人掌怪・塵旋精, elite 岩角犀, hidden boss 沙丘巨蟲 (ring the ancient bell).
   幽光沼澤: south of 銀月湖畔. 沼澤水蛭・腐沼蟾・沼地鬼火・枯木樹妖, elite 沼澤魔女, boss 腐沼九頭蛇 (behind the miasma — light 3 lamps).
   Battle art: recoloured placeholders until the Codex chibi sets (task F) arrive. */
Object.assign(MOVES, {
  // canyon
  m_pincerSnap: { n: '砂鉗夾', t: '一般', cat: '物', pow: 50, acc: 95, pp: 25, d: '用粗大的鉗子夾住。' },
  m_venomTail: { n: '毒尾刺', t: '毒', cat: '物', pow: 55, acc: 95, pp: 15, eff: { st: 'psn', p: 30 }, d: '甩出尾巴上的毒針。有時會中毒。' },
  m_deathStinger: { n: '致命毒針', t: '毒', cat: '物', pow: 115, acc: 100, pp: 5, charge: 1, eff: { st: 'psn', p: 60 }, chargeMsg: '把毒尾高高翹起，毒針滴著紫色的毒液！', warn: '（下一擊是劇毒的一刺……防禦，或趁現在破防！）', d: '蓄力後刺出的致命毒針。' },
  m_talonDive: { n: '利爪俯衝', t: '飛', cat: '物', pow: 65, acc: 95, pp: 15, crit: 1, d: '從高空伸出利爪俯衝。容易會心。' },
  m_galeWing: { n: '狂風羽翼', t: '飛', cat: '特', pow: 55, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 20 }, d: '拍出一陣夾著沙的狂風。' },
  m_harpyCry: { n: '鷹妖厲鳴', t: '一般', cat: '變', acc: 100, pp: 15, stat: { who: 'foe', atk: -1, spa: -1 }, d: '刺耳的厲鳴讓人渾身無力。降低物攻和魔攻。' },
  m_needleSpray: { n: '飛針', t: '草', cat: '物', pow: 55, acc: 95, pp: 20, crit: 1, d: '把全身的刺一口氣射出。容易會心。' },
  m_cactusGuard: { n: '刺甲', t: '草', cat: '變', pp: 15, stat: { who: 'self', def: 2 }, d: '把刺豎起來保護自己。' },
  m_sandBlast: { n: '沙塵彈', t: '岩', cat: '特', pow: 50, acc: 95, pp: 20, eff: { stat: { spe: -1 }, p: 30 }, d: '把沙捲成彈丸射出。' },
  m_whirlwind: { n: '旋風', t: '飛', cat: '特', pow: 65, acc: 95, pp: 15, d: '整個身體化成旋風撞過來。' },
  m_sandstorm: { n: '大沙暴', t: '岩', cat: '特', pow: 110, acc: 100, pp: 5, charge: 1, chargeMsg: '四周的沙開始瘋狂旋轉！', warn: '（沙暴越來越大……）', d: '蓄力後掀起的大沙暴。' },
  m_hornBash: { n: '岩角衝撞', t: '岩', cat: '物', pow: 70, acc: 95, pp: 15, eff: { flinch: 1, p: 20 }, d: '用石頭般的角衝撞。' },
  m_rhinoRush: { n: '犀角突進', t: '岩', cat: '物', pow: 130, acc: 100, pp: 5, charge: 1, chargeMsg: '用前腳刨著地面，鼻子噴出熱氣！', warn: '（岩角犀要全力衝過來了！）', d: '蓄力後的全力衝鋒。' },
  m_sandTomb: { n: '流沙陷阱', t: '岩', cat: '特', pow: 60, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 50 }, d: '讓腳下的沙變成流沙。' },
  m_wormBite: { n: '巨口吞噬', t: '一般', cat: '物', pow: 80, acc: 95, pp: 10, drain: 0.3, d: '張開滿是牙齒的大口咬下。' },
  m_devour: { n: '沙海吞天', t: '岩', cat: '物', pow: 150, acc: 100, pp: 5, charge: 1, chargeMsg: '沙丘巨蟲鑽進了沙裡……地面開始隆起！', warn: '（腳下的沙在震動……牠要從下面吞過來了！）', d: '從沙底一口吞下的大招。' },
  // swamp
  m_leechBite: { n: '吸血', t: '一般', cat: '物', pow: 50, acc: 100, pp: 20, drain: 0.5, d: '緊緊吸住，吸走血液。' },
  m_slimeCoat: { n: '黏液護身', t: '一般', cat: '變', pp: 15, stat: { who: 'self', def: 1, spd: 1 }, d: '全身包上一層滑溜的黏液。' },
  m_toxicTongue: { n: '毒舌', t: '毒', cat: '物', pow: 55, acc: 95, pp: 20, eff: { st: 'psn', p: 30 }, d: '伸出沾滿毒液的長舌。' },
  m_mudBomb: { n: '泥沼彈', t: '水', cat: '特', pow: 60, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 30 }, d: '吐出一大團泥巴。' },
  m_croak: { n: '低沉蟾鳴', t: '一般', cat: '變', acc: 60, pp: 15, st: 'slp', d: '像催眠曲一樣的低沉叫聲。' },
  m_wispFlame: { n: '幽火', t: '火', cat: '特', pow: 60, acc: 95, pp: 15, eff: { st: 'brn', p: 20 }, d: '發出青白色的冷火。' },
  m_wispDance: { n: '鬼火之舞', t: '一般', cat: '變', pp: 15, stat: { who: 'self', spa: 1, spe: 1 }, d: '在空中搖曳起舞。' },
  m_rootBind: { n: '纏根', t: '草', cat: '物', pow: 55, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 50 }, d: '從泥裡伸出的樹根纏住雙腳。' },
  m_branchSlam: { n: '枯枝重擊', t: '草', cat: '物', pow: 75, acc: 95, pp: 10, eff: { flinch: 1, p: 20 }, d: '揮下又粗又硬的枯枝。' },
  m_witherBreath: { n: '枯萎之息', t: '草', cat: '特', pow: 65, acc: 95, pp: 15, eff: { stat: { atk: -1 }, p: 30 }, d: '吐出讓草木枯萎的氣息。' },
  m_curseMark: { n: '魔女詛咒', t: '一般', cat: '變', acc: 95, pp: 15, stat: { who: 'foe', atk: -1, def: -1 }, d: '在身上刻下詛咒的記號。降低物攻和物防。' },
  m_toxicBrew: { n: '毒藥瓶', t: '毒', cat: '特', pow: 65, acc: 95, pp: 15, eff: { st: 'psn', p: 40 }, d: '丟出冒著泡的毒藥瓶。' },
  m_witchBolt: { n: '沼澤魔彈', t: '一般', cat: '特', pow: 75, acc: 95, pp: 10, d: '從杖頭射出綠色的魔彈。' },
  m_cauldron: { n: '魔女的大鍋', t: '毒', cat: '特', pow: 135, acc: 100, pp: 5, charge: 1, eff: { st: 'psn', p: 60 }, chargeMsg: '開始攪拌冒著綠煙的大鍋！', warn: '（鍋裡的東西快要煮好了……！）', d: '魔女的秘藥大爆發。' },
  m_tripleBite: { n: '三首連咬', t: '一般', cat: '物', pow: 90, acc: 95, pp: 10, eff: { flinch: 1, p: 20 }, d: '三顆頭輪流咬過來。' },
  m_venomSpray: { n: '毒霧吐息', t: '毒', cat: '特', pow: 80, acc: 95, pp: 10, eff: { st: 'psn', p: 30 }, d: '三顆頭一起噴出紫色的毒霧。' },
  m_hydraFlood: { n: '腐沼洪流', t: '水', cat: '特', pow: 150, acc: 100, pp: 5, charge: 1, chargeMsg: '把整片沼澤的水吸進了肚子裡！', warn: '（沼澤的水位在下降……下一擊會非常可怕！）', d: '把整片沼澤的腐水一口氣噴出。' },
  // event monster
  m_chestChomp: { n: '寶箱咬', t: '一般', cat: '物', pow: 70, acc: 95, pp: 15, eff: { flinch: 1, p: 30 }, d: '用箱蓋狠狠咬下。' },
  m_coinToss: { n: '金幣砸', t: '一般', cat: '物', pow: 50, acc: 100, pp: 20, d: '從肚子裡吐出一大把金幣砸過來。' },
  m_greed: { n: '貪婪', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 2 }, d: '眼睛閃著貪婪的光。大幅提升物攻。' },
});
{ const CLS = { m_pincerSnap: 'strike', m_venomTail: 'pierce', m_deathStinger: 'charge', m_talonDive: 'slash', m_galeWing: 'area', m_harpyCry: 'debuff', m_needleSpray: 'pierce', m_cactusGuard: 'buff', m_sandBlast: 'bolt', m_whirlwind: 'area',
    m_sandstorm: 'charge', m_hornBash: 'strike', m_rhinoRush: 'charge', m_sandTomb: 'area', m_wormBite: 'bite', m_devour: 'charge', m_leechBite: 'bite', m_slimeCoat: 'buff', m_toxicTongue: 'strike', m_mudBomb: 'bolt', m_croak: 'debuff',
    m_wispFlame: 'bolt', m_wispDance: 'buff', m_rootBind: 'strike', m_branchSlam: 'strike', m_witherBreath: 'area', m_curseMark: 'debuff', m_toxicBrew: 'bolt', m_witchBolt: 'bolt', m_cauldron: 'charge',
    m_tripleBite: 'bite', m_venomSpray: 'area', m_hydraFlood: 'charge', m_chestChomp: 'bite', m_coinToss: 'strike', m_greed: 'buff' };
  for (const k in CLS) { const c = CLS[k]; (MON_CLASS[c] || (MON_CLASS[c] = [])).push(k); MOVES[k].cls = c; MOVES[k].fx = k; MOVES[k].foe = 1; }
}
Object.assign(SPECIES, {
  sandScorpion: { n: '砂鉗蠍', fam: 'insect', base: [62, 76, 76, 36, 52, 56], exp: 96, gold: 20, mat: 'scorpTail', learn: [[1, 'm_pincerSnap'], [1, 'm_venomTail'], [1, 'm_carapace'], [14, 'm_deathStinger']], dex: '躲在峽谷沙地裡的大蠍子。翹起尾巴的時候千萬別靠近。' },
  harpy: { n: '峽谷鷹妖', fam: 'bird', base: [56, 72, 50, 56, 50, 82], exp: 94, gold: 20, mat: 'harpyFeather', trait: 'swift', learn: [[1, 'm_talonDive'], [1, 'm_galeWing'], [1, 'm_harpyCry'], [14, 'm_dive']], dex: '在峽谷岩壁上築巢的鷹妖。喜歡搶旅人的亮晶晶東西。' },
  cactling: { n: '仙人掌怪', fam: 'plant', base: [70, 62, 70, 62, 70, 36], exp: 92, gold: 18, mat: 'cactusFruit', learn: [[1, 'm_needleSpray'], [1, 'm_cactusGuard'], [1, 'm_rootLeech'], [14, 'm_thornRain']], dex: '會走路的仙人掌。頭上的花開得越大，脾氣就越差。' },
  dustDevil: { n: '塵旋精', fam: 'spirit', base: [52, 44, 50, 80, 62, 74], exp: 98, gold: 22, mat: 'sandCrystal', learn: [[1, 'm_sandBlast'], [1, 'm_whirlwind'], [1, 'm_flicker'], [14, 'm_sandstorm']], dex: '峽谷的風捲起沙子，就成了這種小精靈。怕水。' },
  rockRhino: { n: '岩角犀', fam: 'beast', elite: 1, drop: 'rhinoHelm', base: [86, 96, 98, 36, 60, 56], exp: 230, gold: 55, learn: [[1, 'm_hornBash'], [1, 'm_quake'], [1, 'm_warCry'], [1, 'm_rhinoRush']], dex: '皮膚像岩石一樣硬的犀牛。守著峽谷的隘口，誰也不讓過。' },
  duneWorm: { n: '沙丘巨蟲', fam: 'beast', boss: 1, drop: 'wormCharm', base: [100, 96, 82, 70, 76, 50], exp: 380, gold: 0, learn: [[1, 'm_sandTomb'], [1, 'm_wormBite'], [1, 'm_quake'], [1, 'm_devour']], dex: '沉睡在峽谷沙海底下的巨蟲。古鐘的聲音會把牠吵醒。' },
  bogLeech: { n: '沼澤水蛭', fam: 'ooze', base: [80, 78, 70, 44, 64, 50], exp: 126, gold: 28, mat: 'bogMoss', learn: [[1, 'm_leechBite'], [1, 'm_slimeCoat'], [1, 'm_mudShot'], [21, 'm_engulf']], dex: '在沼澤淺灘等著獵物的大水蛭。被吸住就很難甩掉。' },
  bogToad: { n: '腐沼蟾', fam: 'aquatic', base: [82, 72, 72, 66, 66, 56], exp: 128, gold: 28, mat: 'bogMoss', learn: [[1, 'm_toxicTongue'], [1, 'm_mudBomb'], [1, 'm_croak'], [21, 'm_tongue']], dex: '全身長滿疣的大蟾蜍。叫聲會讓人想睡。' },
  marshWisp: { n: '沼地鬼火', fam: 'spirit', base: [60, 40, 62, 96, 84, 82], exp: 130, gold: 30, mat: 'wispFlame', trait: 'swift', learn: [[1, 'm_wispFlame'], [1, 'm_wispDance'], [1, 'm_hex'], [21, 'm_soulSip']], dex: '在沼澤上空飄盪的青白色火焰。據說是迷路旅人的魂魄。' },
  rotTreant: { n: '枯木樹妖', fam: 'plant', base: [90, 84, 88, 56, 66, 34], exp: 132, gold: 30, mat: 'rotWood', learn: [[1, 'm_rootBind'], [1, 'm_branchSlam'], [1, 'm_witherBreath'], [1, 'm_mossArmor']], dex: '被瘴氣侵蝕的老樹。空洞的眼睛裡閃著黃光。' },
  bogWitch: { n: '沼澤魔女', fam: 'human', elite: 1, drop: 'witchHat', base: [84, 56, 72, 104, 92, 80], exp: 300, gold: 0, learn: [[1, 'm_curseMark'], [1, 'm_toxicBrew'], [1, 'm_witchBolt'], [1, 'm_cauldron']], dex: '住在沼澤深處的魔女。據說以前是萌芽鎮的藥師。' },
  hydra: { n: '腐沼九頭蛇', fam: 'aquatic', boss: 1, drop: 'hydraScale', base: [110, 98, 90, 96, 90, 60], exp: 520, gold: 0, learn: [[1, 'm_tripleBite'], [1, 'm_venomSpray'], [1, 'm_mudBomb'], [1, 'm_hydraFlood']], dex: '沼澤瘴氣的源頭。原本只有一顆頭，吸了瘴氣之後長出了三顆。' },
  mimic: { n: '寶箱怪', fam: 'construct', base: [80, 90, 90, 50, 70, 60], exp: 160, gold: 180, learn: [[1, 'm_chestChomp'], [1, 'm_coinToss'], [1, 'm_greed'], [1, 'm_bite']], dex: '假裝成寶箱的魔物。打倒牠，肚子裡的寶物就是你的了。' },
});
Object.assign(MON_PANEL, {
  sandScorpion: { lv: 13, hp: 40, atk: 24, def: 24, spa: 12, spd: 17, spe: 18, crit: 8 },
  harpy: { lv: 13, hp: 36, atk: 23, def: 16, spa: 18, spd: 16, spe: 26, crit: 8 },
  cactling: { lv: 13, hp: 44, atk: 21, def: 22, spa: 20, spd: 22, spe: 12 },
  dustDevil: { lv: 13, hp: 34, atk: 14, def: 16, spa: 26, spd: 20, spe: 24, eva: 8 },
  rockRhino: { lv: 14, hp: 64, atk: 30, def: 32, spa: 12, spd: 20, spe: 18, crit: 8 },
  duneWorm: { lv: 16, hp: 175, atk: 31, def: 27, spa: 23, spd: 25, spe: 16, crit: 8, hit: 5 },
  bogLeech: { lv: 20, hp: 60, atk: 30, def: 27, spa: 18, spd: 26, spe: 20 },
  bogToad: { lv: 20, hp: 62, atk: 28, def: 28, spa: 26, spd: 26, spe: 22 },
  marshWisp: { lv: 20, hp: 48, atk: 16, def: 24, spa: 36, spd: 32, spe: 32, eva: 8 },
  rotTreant: { lv: 20, hp: 68, atk: 32, def: 34, spa: 22, spd: 26, spe: 14 },
  bogWitch: { lv: 21, hp: 82, atk: 22, def: 28, spa: 42, spd: 36, spe: 32, eva: 6, hit: 5 },
  hydra: { lv: 23, hp: 290, atk: 40, def: 36, spa: 39, spd: 35, spe: 24, crit: 8, hit: 5 },
  mimic: { lv: 15, hp: 56, atk: 30, def: 30, spa: 18, spd: 25, spe: 20, crit: 10 },
});
// placeholder looks (recolours) until the Codex chibi sets exist
{ const P = { sandScorpion: ['caveSpider', 35, 1, 1.25], harpy: ['bird', 25, 0.6, 0.9], cactling: ['flower', 110, 0.9, 0.95], dustDevil: ['emberSpirit', 20, 0.45, 1.1], rockRhino: ['golem', 25, 0.5, 1.05], duneWorm: ['silverWyrm', 30, 0.6, 0.9],
    bogLeech: ['slime', 120, 0.6, 0.55], bogToad: ['frog', 60, 0.8, 0.8], marshWisp: ['emberSpirit', 150, 0.8, 1.05], rotTreant: ['mossGiant', 25, 0.45, 0.7], bogWitch: ['rogueBlade', 100, 1, 1.1], hydra: ['silverWyrm', 130, 0.9, 0.55], mimic: ['pebble', 30, 1.1, 1.05] };
  for (const k in P) { const [b, dh, ks, kl] = P[k]; PLACEHOLDER[k] = P[k]; HD_RIG_OF_PENDING[k] = b; const base = ART[b] ? b : PLACEHOLDER[b] && PLACEHOLDER[b][0]; if (ART[base]) ART[k] = artRecolor(ART[base], dh, ks, kl); }
}

/* ---------- items & materials ---------- */
Object.assign(ITEMS, {
  scorpTail: { n: '蠍尾針', mat: 1, price: 0, sell: 45, cat: '魔物素材', d: '砂鉗蠍的毒針。拔掉毒以後可以做成武器。' },
  harpyFeather: { n: '鷹妖羽', mat: 1, price: 0, sell: 45, cat: '魔物素材', d: '峽谷鷹妖的硬羽毛。' },
  cactusFruit: { n: '仙人掌果', mat: 1, price: 0, sell: 40, cat: '採集素材', d: '水分很多的紅色果實。峽谷裡的解渴聖品。' },
  sandCrystal: { n: '砂晶', mat: 1, price: 0, sell: 55, cat: '魔物素材', d: '被風吹得晶亮的沙粒結晶。' },
  bogMoss: { n: '沼苔', mat: 1, price: 0, sell: 60, cat: '採集素材', d: '沼澤裡的藥用苔蘚。藥草師很想要。' },
  wispFlame: { n: '幽火之芯', mat: 1, price: 0, sell: 70, cat: '魔物素材', d: '沼地鬼火留下的火種。不會燙，也不會熄滅。' },
  rotWood: { n: '腐木', mat: 1, price: 0, sell: 60, cat: '魔物素材', d: '被瘴氣侵蝕的木頭。意外地堅固。' },
  starShard: { n: '星之碎片', mat: 1, price: 0, sell: 400, cat: '採集素材', d: '流星掉下來的碎片。閃著不可思議的光。' },
  bellShard: { n: '古鐘碎片', key: 1, price: 0, sell: 0, cat: '重要物品', d: '落日峽谷古鐘的碎片。上面刻著古老的紋路。' },
  rhinoHorn: { n: '岩角', key: 1, price: 0, sell: 0, cat: '重要物品', d: '岩角犀的角。鐵匠一直想要這種材料。' },
});
GATHER_KINDS.cactus = ['仙人掌', 'cactusFruit', [1, 2], [['sandCrystal', 0.2]]]; GATHER_IMG.cactus = GATHER_IMG.herb;
GATHER_KINDS.moss = ['沼苔', 'bogMoss', [1, 2], [['manaHerb', 0.25]]]; GATHER_IMG.moss = GATHER_IMG.mana;

/* ---------- gear ---------- */
Object.assign(GEAR, {
  sandSaber: { n: '砂漠彎刀', slot: 'weapon', t: 3, st: { atk: 9 }, sp: { crit: 3 }, d: '峽谷商隊愛用的彎刀。' },
  stingerDagger: { n: '蠍尾短刀', slot: 'weapon', t: 3, st: { atk: 8, spe: 2 }, sp: { crit: 3 }, d: '用砂鉗蠍的毒針磨成的短刀。' },
  harpyStaff: { n: '鷹羽法杖', slot: 'weapon', t: 3, st: { spa: 9, spe: 2 }, d: '綁著鷹妖羽毛的法杖。' },
  desertTurban: { n: '沙漠頭巾', slot: 'head', t: 3, st: { def: 3, spd: 3, spe: 2 }, d: '擋風沙的頭巾。' },
  scorpMail: { n: '蠍殼甲', slot: 'body', t: 3, st: { def: 9, spd: 3 }, d: '砂鉗蠍的殼做成的鎧甲。' },
  sandBoots: { n: '流沙靴', slot: 'feet', t: 3, st: { spe: 5, def: 2 }, d: '在沙地上也不會陷下去的靴子。' },
  rhinoHelm: { n: '岩角盔', slot: 'head', t: 4, st: { def: 6, spd: 2, hp: 4 }, fx: ['breaker'], d: '岩角犀的角做成的頭盔。撞什麼都不怕。' },
  cactusCharm: { n: '仙人掌護符', slot: 'acc', t: 3, st: { hp: 4, def: 3 }, d: '用仙人掌刺編成的護符。' },
  duneFang: { n: '沙海巨牙', slot: 'weapon', t: 5, st: { atk: 14 }, sp: { crit: 5 }, fx: ['predator'], d: '沙丘巨蟲的牙。一旦咬住就不會放開。' },
  wormCharm: { n: '沙蟲之心', slot: 'acc', t: 5, st: { hp: 8, atk: 3 }, fx: ['endure'], d: '沙丘巨蟲體內的結晶。帶著大地的韌性。' },
  sandTome: { n: '沙海之書', slot: 'weapon', t: 5, st: { spa: 12, mp: 16 }, d: '記載著古代峽谷文明的魔導書。' },
  bogStaff: { n: '沼澤魔杖', slot: 'weapon', t: 4, st: { spa: 12 }, sp: { elem: 5 }, d: '用沼澤的老樹枝做的魔杖。' },
  toadBlade: { n: '蟾毒劍', slot: 'weapon', t: 4, st: { atk: 12 }, sp: { crit: 3 }, d: '劍身浸過蟾毒的劍。' },
  witchHat: { n: '魔女帽', slot: 'head', t: 4, st: { spa: 5, spd: 5 }, fx: ['freeCast'], d: '沼澤魔女的尖帽子。戴上以後魔力好像會自己轉起來。' },
  treantMail: { n: '樹皮甲', slot: 'body', t: 4, st: { def: 12, hp: 4 }, d: '枯木樹妖的樹皮做的鎧甲。' },
  mireBoots: { n: '沼澤長靴', slot: 'feet', t: 4, st: { spe: 5, def: 4 }, d: '踩進泥巴裡也不會陷下去的長靴。' },
  wispLantern: { n: '鬼火提燈', slot: 'acc', t: 4, st: { spa: 4, hp: 3 }, d: '裝著幽火之芯的提燈。' },
  witchTome: { n: '魔女的咒書', slot: 'weapon', t: 5, st: { spa: 13, mp: 20 }, fx: ['arcaneSurge'], d: '沼澤魔女一輩子的研究。' },
  hydraScale: { n: '九頭蛇鱗鎧', slot: 'body', t: 5, st: { def: 14, spd: 10, hp: 6 }, fx: ['regen'], d: '腐沼九頭蛇的鱗片做成的鎧甲。' },
  hydraFang: { n: '九頭蛇牙', slot: 'weapon', t: 5, st: { atk: 13, spe: 3 }, fx: ['poisonEdge'], sp: { crit: 4 }, d: '九頭蛇的毒牙磨成的短刀。' },
  hydraStaff: { n: '三首蛇杖', slot: 'weapon', t: 5, st: { spa: 14 }, sp: { elem: 6 }, d: '杖頭纏著三條蛇的魔杖。' },
  merchantBadge: { n: '行商人徽章', slot: 'acc', t: 4, st: { spe: 3, hp: 4 }, fx: ['fortune'], d: '行商人公會的徽章。走到哪裡都能找到好東西。' },
  mimicTooth: { n: '寶箱怪之牙', slot: 'acc', t: 4, st: { atk: 4, spa: 2 }, fx: ['double'], d: '打倒五隻寶箱怪的證明。' },
});
Object.assign(HEAD_PAL, { sand: { A: '#e0c080', a: '#a88450', C: '#c84a3a' }, rhino: { A: '#a09888', a: '#6a6254', C: '#f0e8d8' }, witch: { A: '#4a3a6a', a: '#2a2044', C: '#8ad05a' } });
Object.assign(BODY_LOOKS, {
  scorp: ['plate', { X: '#c87a3a', x: '#8a4a20', Y: '#e8a860', y: '#b07038', Z: '#7a3a9a' }],
  treant: ['plate', { X: '#6a5038', x: '#44321f', Y: '#8a6a48', y: '#5a4430', Z: '#6a9a3a' }],
  hydra: ['plate', { X: '#3a6a4a', x: '#24442e', Y: '#5a9a6a', y: '#3a6a48', Z: '#9a5ac0' }],
});
Object.assign(FEET_PAL, { sand: { B: '#c8a060', b: '#8a6a38' }, mire: { B: '#4a5a3a', b: '#2e3a24' } });
Object.assign(WPN_PAL, { sand: { I: '#f4ecd8', i: '#c0a878', T: '#6a4a2a', U: '#d8b040' }, stinger: { I: '#f0d0f8', i: '#8a4aa0', T: '#6a3a1a', U: '#d87a3a' }, toad: { I: '#d8f0b8', i: '#6a9a3a', T: '#3a2a4a', U: '#9a5ac0' },
  hydra: { I: '#e0ffe8', i: '#4a9a6a', T: '#243a2e', U: '#9a5ac0' }, dune: { I: '#fff0d0', i: '#d8a860', T: '#5a3a1a', U: '#e87a3a' },
  wandH: { T: '#7a5a3a', V: '#f0d080' }, wandBg: { T: '#3a4a2a', V: '#8af060' }, wandHy: { T: '#243a2e', V: '#c890ff' }, tomeW: { T: '#3a2a4a', U: '#8ad05a', V: '#e8f0d8' }, tomeSd: { T: '#8a6a3a', U: '#f0d080', V: '#fff4e0' } });
const GEAR_LOOK_V20 = {
  desertTurban: ['cap', 'sand'], rhinoHelm: ['helm', 'rhino', 'horns'], witchHat: ['hood', 'witch'],
  scorpMail: 'scorp', treantMail: 'treant', hydraScale: 'hydra', sandBoots: 'sand', mireBoots: 'mire',
  sandSaber: ['sword', 'sand'], stingerDagger: ['dagger', 'stinger'], toadBlade: ['sword', 'toad'], duneFang: ['dagger', 'dune'], hydraFang: ['dagger', 'hydra'],
  harpyStaff: ['staff', 'wandH'], bogStaff: ['staff', 'wandBg'], hydraStaff: ['staff', 'wandHy'], witchTome: ['tome', 'tomeW'], sandTome: ['tome', 'tomeSd'],
};
Object.assign(GEAR_LOOK, GEAR_LOOK_V20); for (const k in GEAR_LOOK_V20) GEAR[k].look = GEAR_LOOK_V20[k];
WEAPON_KINDS.劍.push('sandSaber', 'toadBlade'); WEAPON_KINDS.短刀.push('stingerDagger', 'duneFang', 'hydraFang'); WEAPON_KINDS.法杖.push('harpyStaff', 'bogStaff', 'hydraStaff'); WEAPON_KINDS.魔導書.push('witchTome', 'sandTome');
for (const kind in WEAPON_KINDS) for (const k of WEAPON_KINDS[kind]) if (GEAR[k]) GEAR[k].kind = kind;
for (const k of ['desertTurban', 'scorpMail', 'sandBoots', 'rhinoHelm', 'witchHat', 'treantMail', 'mireBoots', 'hydraScale']) { const s = GEAR[k].st; GEAR[k].kind = (s.def || 0) >= (s.spd || 0) + (s.spe || 0) ? '重裝' : '輕裝'; }
for (const k of ['cactusCharm', 'wormCharm', 'wispLantern', 'merchantBadge', 'mimicTooth']) GEAR[k].kind = '飾品';
Object.assign(MAGE_SWAP, { sandSaber: 'harpyStaff', toadBlade: 'bogStaff', duneFang: 'sandTome', hydraFang: 'hydraStaff' });
Object.assign(LOOT, {
  rockRhino: ['rhinoHelm', 'sandSaber', 'scorpMail', 'cactusCharm'], duneWorm: ['wormCharm', 'duneFang', 'sandTome', 'sandBoots'],
  bogWitch: ['witchHat', 'witchTome', 'wispLantern', 'mireBoots'], hydra: ['hydraScale', 'hydraFang', 'hydraStaff', 'treantMail'],
});
// canyon recipes unlock after the smith gets the 岩角 (08i: syncRecipes)
const RECIPES_V20 = [
  { out: 'stingerDagger', mats: { scorpTail: 3, stone: 2 }, gold: 1400 }, { out: 'harpyStaff', mats: { harpyFeather: 3, cactusFruit: 2 }, gold: 1400 },
  { out: 'scorpMail', mats: { scorpTail: 4, sandCrystal: 2 }, gold: 1600 }, { out: 'desertTurban', mats: { harpyFeather: 2, sandCrystal: 2 }, gold: 1300 },
  { out: 'cactusCharm', mats: { cactusFruit: 4, sandCrystal: 2 }, gold: 1500 }, { out: 'toadBlade', mats: { bogMoss: 3, rotWood: 2, stone: 2 }, gold: 2600 },
  { out: 'wispLantern', mats: { wispFlame: 4, rotWood: 2 }, gold: 2800 }, { out: 'starCharm', mats: { starShard: 3, crystal: 2 }, gold: 4000 },
];
GEAR.starCharm = { n: '星辰護符', slot: 'acc', t: 5, st: { spa: 4, atk: 4, hp: 6 }, kind: '飾品', d: '用星之碎片做成的護符。好像能聽見星星的聲音。' };

/* ---------- 落日峽谷 ---------- */
MAPS.canyon = {
  name: '落日峽谷', music: 'route', outdoor: 1, border: 'T', battleBg: 'canyon', popup: 1, theme: 'canyon',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTT',
    'T....TTTT....TTTT...yT',
    'T.o..TTT......TTT....T',
    'T....TT...,,,..TT.##.T',
    'TT..TTT..,,,,,..TT##.T',
    'T####....,,,,,.....#.T',
    'T####....,,,,,..o....T',
    'T.##..T...,,,..TTTT..T',
    'T.....TT......TT###..T',
    'TTTT..TTT..TTTTT###..T',
    'T##....TT..TT.....#..T',
    'T###..........o......T',
    'T###..TTT.WWW...TT...T',
    'T.....TT.WWWWW..TT...T',
    'T..o....WWWWWWW......T',
    'TT.......WWWWW...###.T',
    'TT..###...,,,....###.T',
    'TT..####.........###.T',
    'TTT.####...TT........T',
    'TTT......TTTT..TTTTTTT',
    'TT..:::::::::::::....T',
    'TT..:###.TTT..###:...T',
    'TT..:###.TTT.####:.o.T',
    'T...:....TTT.....:...T',
    '::::::...........:...T',
    'T.S...b....b.....b...T',
    'T....................T',
    'TTTTTTTTTTTTTTTTTTTTTT',
  ],
  edgeWarps: [{ dir: 'left', at: [24], to: ['route', 21, 4, 'left'] }],
  signs: { '2,25': '「落日峽谷」\n傍晚的時候整座峽谷會被染成紅色。\n（魔物很強，建議Lv11以上）' },
  npcs: [
    { id: 'courier', x: 5, y: 23, dir: 'down', look: 'courier', name: '信差露卡' },
    { id: 'canyonBell', x: 11, y: 2, dir: 'down', look: 'bell', name: '古代的鐘' },
  ],
  elites: [{ id: 'rockRhino', sp: 'rockRhino', lv: 14, x: 19, y: 11, dir: 'down', sight: 3 }],
  boss: { sp: 'duneWorm', lv: 16, x: 11, y: 4, flag: 'duneWorm', ev: 'wormBoss' },
  items: [
    { id: 'cy1', x: 1, y: 1, item: 'bellShard' }, { id: 'cy2', x: 19, y: 1, item: 'sandSaber', q: 2 }, { id: 'cy3', x: 1, y: 10, item: 'superPotion', n: 2 },
    { id: 'cy4', x: 20, y: 26, gold: 800 }, { id: 'cy5', x: 2, y: 14, item: 'desertTurban', q: 2 }, { id: 'cy6', x: 13, y: 25, item: 'hiEther' }, { id: 'cy7', x: 20, y: 17, item: 'scorpMail', q: 2 },
  ],
  gathers: [{ id: 'gcy1', x: 15, y: 6, kind: 'cactus', mat: 'cactusFruit' }, { id: 'gcy2', x: 8, y: 26, kind: 'cactus', mat: 'cactusFruit' }, { id: 'gcy3', x: 4, y: 23, mat: 'stone', kind: 'ore' }, { id: 'gcy4', x: 12, y: 16, kind: 'herb', mat: 'herb' }],
  gearPool: ['sandSaber', 'stingerDagger', 'harpyStaff', 'desertTurban', 'scorpMail', 'sandBoots', 'cactusCharm'],
  rare: ['goldSlime', 12, 14],
  encounters: [
    { y0: 19, y1: 99, rate: 0.11, table: [['sandScorpion', 11, 13, 30], ['cactling', 11, 13, 30], ['harpy', 11, 13, 25], ['dustDevil', 12, 13, 15]] },
    { y0: 0, y1: 18, rate: 0.12, table: [['sandScorpion', 13, 15, 25], ['cactling', 13, 15, 20], ['harpy', 13, 15, 30], ['dustDevil', 13, 15, 25]] },
  ],
};
/* ---------- 幽光沼澤 ---------- */
MAPS.swamp = {
  name: '幽光沼澤', music: 'ruins', outdoor: 1, border: 'T', battleBg: 'swamp', popup: 1, theme: 'swamp',
  rows: [
    'TTTTTTTTTTTTTTTT..TTTT',
    'T.....TTTT.....#..TTTT',
    'T.##..TTT..###.##....T',
    'T.###......####......T',
    'T.###..WW...##..TTT..T',
    'T.....WWWW.......TT..T',
    'TT..WWWWWWW..o.......T',
    'TT..WWWWWWWW....###..T',
    'T....WWWWW.....####..T',
    'T.##..........#####..T',
    'T.###..TTTT....###...T',
    'T.###..TTTT..........T',
    'T......TT....WWWW..TTT',
    'TTT.........WWWWWW...T',
    'T.....##....WWWWWW...T',
    'T....####....WWWW..#.T',
    'T....####..........##T',
    'TTTTT.##...TTTT.....#T',
    'TTTTTTTT...TTTT......T',
    'T.,,,,.T...TTTT..###.T',
    'T,,,,,,T..TTTT..####.T',
    'T,,,,,,....TTT..###..T',
    'T,,,,,,T..........#..T',
    'T.,,,,.T..TTT........T',
    'T......T..TTT..o.....T',
    'TTTTTTTTTTTTTTTTTTTTTT',
  ],
  edgeWarps: [{ dir: 'up', at: [16, 17], to: ['lake', 16, 25, 'up'] }],
  signs: {},
  npcs: [
    { id: 'lampKeeper', x: 19, y: 2, dir: 'down', look: 'keeper', name: '守燈人' },
    { id: 'swampLamp1', x: 1, y: 5, dir: 'down', look: 'lamp', name: '驅霧燈' },
    { id: 'swampLamp2', x: 20, y: 3, dir: 'down', look: 'lamp', name: '驅霧燈' },
    { id: 'swampLamp3', x: 20, y: 23, dir: 'down', look: 'lamp', name: '驅霧燈' },
    { id: 'miasma', x: 7, y: 21, dir: 'down', look: 'miasma', name: '瘴氣', show: st => !st.flags.fogClear },
    { id: 'mira', x: 17, y: 12, dir: 'left', look: 'apprentice', name: '學徒米拉', show: st => st.flags.qMira === 1 },
    { id: 'witchNpc', x: 3, y: 12, dir: 'down', look: 'witch', name: '魔女薇奧拉', show: st => st.flags.witchFate === 'spare' },
  ],
  elites: [{ id: 'bogWitch', sp: 'bogWitch', lv: 21, x: 2, y: 12, dir: 'right', sight: 3, show: st => !st.flags.witchFate }],
  boss: { sp: 'hydra', lv: 23, x: 3, y: 21, flag: 'hydra', ev: 'hydraBoss' },
  items: [
    { id: 'sw1', x: 1, y: 1, item: 'hiEther', n: 2 }, { id: 'sw2', x: 20, y: 7, item: 'treantMail', q: 2 }, { id: 'sw3', x: 8, y: 24, gold: 2000 },
    { id: 'sw4', x: 14, y: 6, item: 'elixir' }, { id: 'sw5', x: 1, y: 16, item: 'mireBoots', q: 2 }, { id: 'sw6', x: 20, y: 18, item: 'bogStaff', q: 2 }, { id: 'sw7', x: 1, y: 24, item: 'wisdomFruit', show: st => st.flags.fogClear },
  ],
  gathers: [{ id: 'gsw1', x: 9, y: 9, kind: 'moss', mat: 'bogMoss' }, { id: 'gsw2', x: 19, y: 14, kind: 'moss', mat: 'bogMoss' }, { id: 'gsw3', x: 9, y: 18, kind: 'mana', mat: 'manaHerb' }],
  gearPool: ['bogStaff', 'toadBlade', 'treantMail', 'mireBoots', 'wispLantern'],
  rare: ['goldSlime', 20, 22],
  encounters: [
    { y0: 0, y1: 11, rate: 0.12, table: [['bogLeech', 18, 20, 30], ['bogToad', 18, 20, 30], ['marshWisp', 18, 20, 25], ['rotTreant', 19, 20, 15]] },
    { y0: 12, y1: 99, rate: 0.12, table: [['bogLeech', 20, 22, 20], ['bogToad', 20, 22, 25], ['marshWisp', 20, 22, 25], ['rotTreant', 20, 22, 30]] },
  ],
};
for (const k of ['canyon', 'swamp']) { MAP_TYPES[k] = '野外'; MAPS[k].type = '野外'; }
Object.assign(EXPLORE, { canyon: '落日峽谷', swamp: '幽光沼澤' });
Object.assign(ELITE_TEXT, { rockRhino: ['（岩角犀用前腳刨著地面……）', '岩角犀低下頭，朝這邊衝了過來！'], bogWitch: ['「嘻嘻……又有迷路的小羊闖進來了。」', '「正好，我的大鍋還缺一味材料呢！」'] });
{ // 晨霧道路: open the east edge at the top of the road toward the canyon
  const R = MAPS.route.rows; R[4] = R[4].slice(0, 20) + '..'; R[3] = R[3].slice(0, 19) + 'S' + R[3].slice(20);
  MAPS.route.edgeWarps.push({ dir: 'right', at: [4], to: ['canyon', 0, 24, 'right'] });
  MAPS.route.signs['19,3'] = '「→ 落日峽谷」\n峽谷裡的魔物很強，建議Lv11以上。';
}
{ // 銀月湖畔: open the south edge toward the swamp
  const R = MAPS.lake.rows; R[25] = R[25].slice(0, 16) + '..' + R[25].slice(18); R[24] = R[24].slice(0, 15) + 'S' + R[24].slice(16);
  MAPS.lake.edgeWarps.push({ dir: 'down', at: [16, 17], to: ['swamp', 16, 0, 'down'] });
  MAPS.lake.signs['15,24'] = '「↓ 幽光沼澤」\n瘴氣很濃，魔物也很強。建議Lv18以上。';
}
Object.assign(COMMISSIONS, {
  c18: { n: '蠍尾針收集', from: '旅店老闆娘', d: '想用蠍尾針做解毒劑的研究。請帶來蠍尾針×4。（落日峽谷的砂鉗蠍）', need: { scorpTail: 4 }, reward: { gold: 1500, items: { antidote: 3, superPotion: 2 } }, open: st => st.vis && st.vis.canyon },
  c19: { n: '驅趕鷹妖', from: '信差露卡', d: '鷹妖一直搶信差的包裹。接下委託後，擊敗峽谷鷹妖×5。', kill: ['harpy', 5], reward: { gold: 1800, items: { superPotion: 3 } }, open: st => st.vis && st.vis.canyon },
  c20: { n: '沼苔採集', from: '藥草師', d: '沼苔可以做成很好的藥。請帶來沼苔×5。（幽光沼澤）', need: { bogMoss: 5 }, reward: { gold: 2400, items: { hiEther: 2 } }, open: st => st.vis && st.vis.swamp },
  c21: { n: '枯木樹妖討伐', from: '守燈人', d: '樹妖把通往燈塔的路都堵住了。接下委託後，擊敗枯木樹妖×4。', kill: ['rotTreant', 4], reward: { gold: 2800, items: { elixir: 1 } }, open: st => st.vis && st.vis.swamp },
});
Object.assign(LOOKS, {
  courier: { style: 'long', H: '#d86a3a', h: '#f08a58', j: '#f8b890', Y: '#3a6ab0', y: '#2a4a80', R: '#c8a060', r: '#8a6a38', P: '#5a4030' },
  keeper: { style: 'beard', H: '#9a9aa8', h: '#b8b8c4', j: '#d8d8e0', W: '#e8e8f0', Y: '#4a5a3a', y: '#2e3a24', R: '#6a5a40', r: '#4a3a28', P: '#3a3028' },
  apprentice: { style: 'long', skirt: 1, H: '#6a8a3a', h: '#8aaa58', j: '#b0d088', Y: '#f2ead8', y: '#d0c4aa', R: '#5a8a4a', r: '#3a6030', P: '#5a8a4a' },
  witch: { style: 'long', skirt: 1, H: '#4a3a6a', h: '#6a5a8a', j: '#9a8ab8', Y: '#3a4a2a', y: '#243018', R: '#6a3a8a', r: '#4a2466', P: '#4a2466' },
  merchant: { H: '#a0702a', h: '#c8903a', j: '#e8b860', Y: '#8a3a6a', y: '#6a2450', R: '#e0c070', r: '#b09040', P: '#5a4030' },
  traveler: { H: '#3a3a4a', h: '#5a5a6a', j: '#7a7a8a', Y: '#6a8aa8', y: '#4a6a88', R: '#8a6a4a', r: '#6a4a30', P: '#4a3a2a' },
});
Object.assign(QUEST_CATS, { '峽谷的信差': '支線', '古代鐘聲': '隱藏', '犀角工匠': '支線', '迷路的藥師學徒': '支線', '驅霧之燈': '支線', '魔女的去留': '支線', '行商人的收藏': '支線', '寶箱怪獵人': '隱藏', '區域事件': '事件' });
