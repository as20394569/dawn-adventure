/* ===================== v8.0 chapter 1: a story line that walks with the player's growth =====================
   Playtest: "the story doesn't help growth — players rush the bosses". Chapter 1 now leads the hero through areas whose
   monsters match the level, with a region boss at the end of each step:
     覺醒 (Lv1–3) → 【新】風車丘陵的異變 (Lv4–8, 磨石魔像) → 【新】碧溪谷的黑水 (Lv8–11, 瘴氣大鯰)
     → 北方的橋（沼澤鱷 Lv13）→ 三枚古印 (Lv13–16) → 古岩魔像 (Lv17)
   Two new maps (風車丘陵 east of 萌芽鎮, 碧溪谷 west of 晨霧道路), eight new monsters (Codex task P chibis; the
   placeholder recolours remain for the 寫實 look), a recurring pair of characters (the miller 漢斯 and his daughter 諾拉), full story events with
   choices. New games are held at the ledge on 晨霧道路 until the hills are done; older saves get the new areas as extra
   content without being blocked. */

/* ---------- monsters ---------- */
Object.assign(MOVES, {
  m_millGrind: { n: '碾石', t: '一般', cat: '物', pow: 55, acc: 95, pp: 10, d: '用巨大的磨石輾過來。' },
  m_blackGust: { n: '黑風', t: '飛', cat: '特', pow: 45, acc: 95, pp: 10, d: '夾著瘴氣的黑色旋風。' },
  m_millStorm: { n: '逆轉大風車', t: '飛', cat: '特', pow: 85, acc: 100, pp: 5, charge: 1, chargeMsg: '身上的磨石越轉越快，黑色的旋風把整座山丘捲了起來！', warn: '（這一擊很重！先防禦！）', d: '把整座丘陵的風逆轉過來的大技。' },
  m_whiskerLash: { n: '鬚鞭', t: '水', cat: '物', pow: 55, acc: 95, pp: 10, d: '用粗大的鬍鬚抽打。' },
  m_blackTide: { n: '黑色濁流', t: '水', cat: '特', pow: 80, acc: 100, pp: 5, charge: 1, chargeMsg: '潭水變成黑色的漩渦，整條溪倒捲了起來！', warn: '（濁流要衝過來了！先防禦！）', d: '把整座水潭化成濁流的大技。' },
});
for (const [k, fx, c] of [['m_millGrind', 'm_gearCrush', 'strike'], ['m_blackGust', 'm_windCutter', 'bolt'], ['m_millStorm', 'm_featherStorm', 'charge'], ['m_whiskerLash', 'm_tailSlam', 'strike'], ['m_blackTide', 'm_waterBomb', 'charge']]) {
  Object.assign(MOVES[k], { cls: c, fx, foe: 1 }); (MON_CLASS[c] || (MON_CLASS[c] = [])).push(k);
}
ITEMS.hareFur = { n: '角兔毛', mat: 1, price: 0, sell: 40, cat: '魔物素材', d: '角兔柔軟的毛。可以縫進帽子和靴子裡。' };
for (const k of ['hunterCap', 'featherBoots', 'travelBoots', 'clothCap']) if (GEAR_RECIPE[k]) GEAR_RECIPE[k].mats = { ...GEAR_RECIPE[k].mats, hareFur: 2 };
// [key, name, family, level, role, moves, material, placeholder look [base, hue, sat, light], dex, extra]
const CH1_MON = [
  ['hornHare', '角兔', 'beast', 5, 'fast', ['m_tuskCharge', 'm_bite', 'm_pounce', 'm_scurry'], 'hareFur', ['fox', 40, 0.35, 1.2], '額頭長著一根角的野兔。吸了瘴氣之後變得很兇，會用角撞人。'],
  ['strawCrow', '稻草鴉', 'bird', 5, 'phys', ['m_peck', 'm_crowCall', 'm_featherGust', 'm_dive'], 'feather', ['nightBird', 30, 0.5, 0.8], '住在稻草人身上的烏鴉。專偷麥田裡的麥子。'],
  ['gustSprite', '旋風精', 'spirit', 6, 'mage', ['m_blackGust', 'm_featherGust', 'm_static', 'm_lullaby'], 'leaf', ['moonSprite', 80, 0.7, 1.1], '風車丘陵的風聚成的小精靈。本來很溫和，現在卻帶著黑色的風。'],
  ['millGolem', '磨石魔像', 'construct', 8, 'tank', ['m_millGrind', 'm_blackGust', 'm_millStorm', 'm_scaleGuard'], 'stone', ['golem', 30, 0.4, 1.05], '漢斯家大風車的磨石。卡進了一塊黑色結晶後，自己站了起來。', { elite: 1, drop: 'featherBoots' }],
  ['mossTurtle', '苔甲龜', 'aquatic', 9, 'tank', ['m_tailSlam', 'm_scaleGuard', 'm_waterBomb', 'm_bite'], 'beetleShell', ['frog', 90, 0.45, 0.85], '背上長滿青苔的大烏龜。慢吞吞的，殼卻硬得像石頭。'],
  ['streamSnake', '溪蛇', 'aquatic', 10, 'fast', ['m_bite', 'm_acidSpit', 'm_rend', 'm_mudShot'], 'frogSkin', ['lizardman', 150, 0.6, 0.9], '在溪石間滑來滑去的青蛇。黑水讓牠的毒變強了。'],
  ['mireFly', '毒刺蜻蜓', 'insect', 10, 'fast', ['m_sting', 'm_buzzShock', 'm_swarm', 'm_static'], 'stinger', ['bee', 170, 0.8, 0.9], '尾巴上長著毒針的大蜻蜓。在水面上飛得比箭還快。'],
  ['blackCatfish', '瘴氣大鯰', 'aquatic', 11, 'tank', ['m_whiskerLash', 'm_waterBomb', 'm_blackTide', 'm_mudShot'], 'frogSkin', ['croc', 200, 0.35, 0.6], '碧溪谷源頭的大鯰魚。吞下黑色結晶後變成了兩層樓高的怪物。', { elite: 1, drop: 'tideStaff' }],
];
function ch1Panel(lv, role, kind) {
  const R = CH2_ROLE[role], B = [2.8 * lv + 5, 1.6 * lv + 2, 1.45 * lv + 1.5, 1.6 * lv + 2, 1.45 * lv + 1.5, 1.8 * lv + 2], K = kind === 'elite' ? [1.35, 1.1, 1.1, 1.1, 1.1, 1] : [1, 1, 1, 1, 1, 1];
  const [hp, atk, def, spa, spd, spe] = B.map((v, i) => Math.round(v * R[i] * K[i])); return { lv, hp, atk, def, spa, spd, spe, crit: kind === 'elite' ? 8 : 5 };
}
for (const [k, n, fam, lv, role, moves, mat, look, dex, ex = {}] of CH1_MON) {
  const kind = ex.elite ? 'elite' : 'wild', R = CH2_ROLE[role];
  SPECIES[k] = { n, fam, base: R.map(v => Math.round(v * 60)), exp: kind === 'elite' ? 90 + 5 * lv : 45 + 3 * lv, gold: kind === 'wild' ? Math.round(lv * 1.6) : 0, learn: moves.map((m, i) => [kind === 'wild' && i === 3 ? lv + 1 : 1, m]), dex, mat, ...ex };
  MON_PANEL[k] = ch1Panel(lv, role, kind);
  const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF_PENDING[k] = b; HD_RIG_OF[k] = b;
  if (ART[b]) ART[k] = artRecolor(ART[b], dh, ks, kl);
  CH2_KEYS.add(k);
}
LOOT.millGolem = ['featherBoots', 'hunterCap', 'swiftFeather', 'wolfNecklace'];
LOOT.blackCatfish = ['tideStaff', 'frogCloak', 'mistBoots', 'voltSword'];
LOOT.creekBandit = ['banditKnife', 'banditHood', 'mistDagger'];
Object.assign(ELITE_TEXT, {
  millGolem: ['（巨大的磨石嘎啦嘎啦地轉了起來，裂縫裡透出黑色的光……）', '磨石魔像站起來了！'],
  creekBandit: ['「老大說這種黑石頭能賣大錢……」', '「喂！被看到了！先把這傢伙解決掉！」'],
  blackCatfish: ['（黑色的潭水咕嘟咕嘟地冒著泡……）', '瘴氣大鯰從潭底浮上來了！'],
});

/* ---------- items ---------- */
Object.assign(ITEMS, {
  darkShard: { n: '黑色結晶', key: 1, price: 0, sell: 0, cat: '重要物品', d: '從磨石魔像身上掉下來的黑色結晶。摸起來冰冷，好像在呼吸。' },
  clearHerb: { n: '清泉草', key: 1, price: 0, sell: 0, cat: '重要物品', d: '只長在碧溪谷源頭的藥草。能驅散身體裡的瘴氣。' },
});
GEAR.qNoraRibbon = { n: '諾拉的緞帶', slot: 'acc', t: 2, st: { hp: 8, spd: 3 }, sp: {}, fx: ['mpGuard'], kind: '飾品', d: '諾拉親手繡的緞帶。上面繡著小小的風車。（劇情的獨家報酬）' };
BP_RARE.add('qNoraRibbon'); GEAR_RECIPE.qNoraRibbon = { mats: { hareFur: 2, leaf: 2 }, gold: 300 };

/* ---------- maps ---------- */
MAPS.windHills = {
  name: '風車丘陵', music: 'route', outdoor: 1, border: 'T', battleBg: 'meadow', theme: 'plains', popup: 1, type: '野外',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT', 'TTTTTTTT........TTTTTTTT', 'TTTTTT....,..,....TTTTTT', 'TTTTT..............TTTTT', 'TTTT..y...::...f....TTTT', 'TTTT......::........TTTT',
    'TTTTLLLLL.::.LLLLLLLTTTT', 'TT..###...::...###...TTT', 'TT.####...::..####...TTT', 'TT.####...::..####.o.TTT', 'TT..##....::...##....TTT', 'TT........::::::::...TTT',
    'TT..f.....::.....#...TTT', 'TTFFFF....::....###..TTT', 'TT........::...####..TTT', 'TT........::....##...TTT', 'TT........::........yTTT', 'TT........::.........TTT',
    'TT...:::::::...###...TTT', 'TT.,......::..#####..TTT', 'TT###.....::..#####..TTT', 'TT####....::...###...TTT', 'TT####....::.......f.TTT', 'TT.##.....::....FFFF.TTT',
    'TT........::.........TTT', 'TTS..y....::..###....TTT', '..........::..####...TTT', '...:::::::::..###....TTT', 'TT...f............y..TTT', 'TTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  edgeWarps: [{ dir: 'left', at: [26, 27], to: ['town', 21, 10, 'left'] }],
  buildings: [{ kind: 'house', x: 3, y: 14, w: 5, h: 4, door: 2, to: ['millHouse', 4, 6] }],
  signs: { '2,25': '「風車丘陵」\n萌芽鎮東邊的麥田和風車。\n（魔物Lv4〜8）' },
  npcs: [
    { id: 'nora', x: 5, y: 27, dir: 'left', look: 'girl', name: '諾拉', show: st => !st.flags.noraMet },
    { id: 'noraHill', x: 13, y: 7, dir: 'down', look: 'girl', name: '諾拉', show: st => st.flags.noraMet && st.flags.noraWith === 1 && (st.flags.hillsQ || 0) < 2 },
    { id: 'hansDown', x: 14, y: 2, dir: 'down', look: 'man', name: '漢斯', show: st => (st.flags.hillsQ || 0) < 2 },
    { id: 'hillMill1', x: 11, y: 1, dir: 'down', look: 'windmill', name: '大風車' },
    { id: 'hillMill2', x: 5, y: 3, dir: 'down', look: 'windmill', name: '風車' },
    { id: 'hillMill3', x: 19, y: 16, dir: 'down', look: 'windmill', name: '風車' },
    { id: 'hillRift', x: 18, y: 11, dir: 'down', look: 'miasma', name: '裂縫', show: st => !st.flags.millGolem },
  ],
  triggers: [{ x: 1, y: 26, id: 'hillsEnter' }, { x: 1, y: 27, id: 'hillsEnter' }, { x: 17, y: 11, id: 'hillsRift' },
    ...[9, 10, 11, 12].map(x => ({ x, y: 6, id: 'hillsTop' }))],
  elites: [{ id: 'millGolem', sp: 'millGolem', lv: 8, x: 11, y: 3, dir: 'down', sight: 1 }],
  items: [{ id: 'wh1', x: 4, y: 5, item: 'potion', n: 3 }, { id: 'wh2', x: 20, y: 9, gold: 300 }, { id: 'wh3', x: 2, y: 12, item: 'ether' }, { id: 'wh4', x: 18, y: 22, item: 'hunterCap', q: 2 }, { id: 'wh5', x: 20, y: 4, item: 'vitFruit' }],
  gathers: [{ id: 'gwh1', x: 3, y: 28, mat: 'herb' }, { id: 'gwh2', x: 13, y: 16, mat: 'herb' }],
  gearPool: ['clothCap', 'leather', 'travelBoots', 'swiftFeather', 'hunterCap', 'mistBoots', 'wolfNecklace'],
  encounters: [
    { y0: 0, y1: 13, rate: 0.1, table: [['hornHare', 6, 7, 35], ['strawCrow', 6, 7, 35], ['gustSprite', 6, 7, 30]] },
    { y0: 14, y1: 99, rate: 0.1, table: [['hornHare', 4, 5, 45], ['strawCrow', 4, 5, 40], ['gustSprite', 5, 5, 15]] },
  ],
};
MAPS.windHills.items[4].x = 19;
MAPS.millHouse = { name: '漢斯的家', music: 'town', wallPal: '', type: '室內',
  rows: ['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnKp', 'BnnnnnnnKn', 'nnnQQnnnnn', 'nnnQQnnnnn', 'nnnnnnnnnn', 'nnnnDnnnnn'],
  exit: { x: 4, y: 7, to: ['windHills', 5, 18] },
  npcs: [
    { id: 'hans', x: 6, y: 4, dir: 'left', look: 'man', name: '漢斯', show: st => (st.flags.hillsQ || 0) >= 2 },
    { id: 'noraHome', x: 2, y: 5, dir: 'right', look: 'girl', name: '諾拉', show: st => st.flags.noraMet && (st.flags.noraWith === 0 || (st.flags.hillsQ || 0) >= 2) && !(st.flags.creekQ === 1 && st.flags.noraCreek === 1) },
  ] };
MAPS.jadeCreek = {
  name: '碧溪谷', music: 'lake', outdoor: 1, border: 'T', battleBg: 'lake', popup: 1, type: '野外',
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTT', 'TTTTTWWWWWWWTTTTTTTTTTTT', 'TTTTWWWWWWWWW...TTTTTTTT', 'TTTTWWWWWWWWW....TTTTTTT', 'TTTT.WWWWWWW......TTTTTT', 'TTTT...WWW.......y..TTTT',
    'TTTTLLLWWWLLLLLLL...TTTT', 'TTT....WWW..#####....TTT', 'TTT.##.WWW..######...TTT', 'TTT.##.WWW...####....TTT', 'TTT....WWW..........TTTT', 'TTTo...===.........o.TTT',
    'TTT....WWW..........TTTT', 'TT.,...WWW...###....TTTT', 'TT.....WWW..#####...TTTT', 'TT.##..WWW..#####.o.TTTT', 'TT###..WWW...###....TTTT', 'TT.....WWW..........TTTT',
    'TTTLLL.WWW.LLLLLL...TTTT', 'TT.....WWW..........TTTT', 'TT..f..WWW...##.....TTTT', 'TT.###.WWW..####....TTTT', 'TT.###.===..####.b..TTTT', 'TT.##..WWW...##.....TTTT',
    'TT.....WWW..........TTTT', 'TTo....WWW....###...TTTT', 'TT..y..WWW...####...TTTT', 'TT.....WWW...####.....TT', 'TT.S...WWW............TT', 'TT.....WWW....::::::::::',
    'TT.....WWW..............', 'TT..f..WWW..........y.TT', 'TTTTTTTWWWTTTTTTTTTTTTTT', 'TTTTTTTWWWTTTTTTTTTTTTTT',
  ],
  edgeWarps: [{ dir: 'right', at: [29, 30], to: ['route', 0, 14, 'right'] }],
  signs: { '3,28': '「碧溪谷」\n從山上流下來的清澈溪水……\n（魔物Lv8〜12）' },
  npcs: [
    { id: 'noraCreek', x: 20, y: 30, dir: 'left', look: 'girl', name: '諾拉', show: st => st.flags.creekQ === 1 && st.flags.noraCreek === 1 && !st.flags.creekIn },
    { id: 'noraCamp', x: 4, y: 24, dir: 'right', look: 'girl', name: '諾拉', show: st => st.flags.creekQ === 1 && st.flags.noraCreek === 1 && st.flags.creekIn },
    { id: 'creekShrine', x: 15, y: 2, dir: 'down', look: 'altar', name: '水神祠' },
  ],
  triggers: [{ x: 22, y: 29, id: 'creekEnter' }, { x: 22, y: 30, id: 'creekEnter' }, ...[17, 18, 19].map(x => ({ x, y: 6, id: 'creekTop' }))],
  elites: [{ id: 'creekBandit', sp: 'bandit', lv: 10, x: 12, y: 12, dir: 'down', sight: 2 }, { id: 'blackCatfish', sp: 'blackCatfish', lv: 11, x: 12, y: 4, dir: 'right', sight: 1 }],
  items: [{ id: 'jc1', x: 3, y: 8, item: 'superPotion', n: 2 }, { id: 'jc2', x: 19, y: 5, gold: 600 }, { id: 'jc3', x: 2, y: 31, item: 'agiFruit' }, { id: 'jc4', x: 19, y: 15, item: 'tideStaff', q: 2 }, { id: 'jc5', x: 4, y: 11, item: 'antidote', n: 2 }],
  gathers: [{ id: 'gjc1', x: 3, y: 13, mat: 'herb' }, { id: 'gjc2', x: 19, y: 24, mat: 'manaHerb' }, { id: 'gjc3', x: 4, y: 17, mat: 'stone' }],
  gearPool: ['mistDagger', 'oakStaff', 'hunterLeather', 'frogCloak', 'featherBoots', 'voltSword', 'thornStaff'],
  encounters: [
    { y0: 0, y1: 17, rate: 0.1, table: [['mossTurtle', 10, 11, 30], ['streamSnake', 10, 11, 35], ['mireFly', 10, 11, 35]] },
    { y0: 18, y1: 99, rate: 0.1, table: [['mossTurtle', 8, 9, 35], ['streamSnake', 8, 9, 30], ['mireFly', 9, 9, 35]] },
  ],
};
Object.assign(MAP_TYPES, { windHills: '野外', millHouse: '室內', jadeCreek: '野外' });
// 萌芽鎮 east exit → 風車丘陵, 晨霧道路 west side → 碧溪谷
{ const T = MAPS.town; for (const y of [10, 11]) T.rows[y] = T.rows[y].slice(0, 20) + '..';
  (T.edgeWarps || (T.edgeWarps = [])).push({ dir: 'right', at: [10, 11], to: ['windHills', 0, 26, 'right'] });
  const R = MAPS.route; R.rows[14] = '..' + R.rows[14].slice(2); R.edgeWarps.push({ dir: 'left', at: [14], to: ['jadeCreek', 23, 29, 'left'] });
  R.triggers = (R.triggers || []).concat([8, 9, 10, 11, 12, 13].map(x => ({ x, y: 25, id: 'hillsGate' })));
  for (const k of ['town', 'route']) delete mapCache[k]; }
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { hans: '風車丘陵・漢斯的家', noraHome: '風車丘陵・漢斯的家', nora: '風車丘陵' });
(NPC_ROLES.任務 || (NPC_ROLES.任務 = [])).push('nora', 'noraHill', 'hans', 'noraHome', 'noraCreek', 'noraCamp');
(NPC_ROLES.情報 || (NPC_ROLES.情報 = [])).push('hansDown', 'hillMill1', 'hillMill2', 'hillMill3', 'hillRift', 'creekShrine');

/* ---------- story ---------- */
const npcOf = (ow, id) => ow && ow.npcs.find(n => n.id === id);
const v8Gate = st => !!st.v8new && st.flags.license && (st.flags.hillsQ || 0) < 2;
function* hillsIntro() {
  const st = Game.st, f = st.flags; f.hillsQ = 1;
  yield* sayAll(['……對了。', '東邊風車丘陵的磨坊主人漢斯，已經三天沒來送麵粉了。', '丘陵上的風車，從前天起就一動也不動……聽說夜裡還冒出了黑色的霧。',
    st.lv >= 10 ? '以你現在的本事應該不成問題。去看看吧，從鎮上的東邊出去就是了。' : '山腳的魔物不算強，正好讓你練練手。不過山頂那邊不太對勁……等你熟練一點再上去。從鎮上的東邊出去就是了。']);
  if (st.v8new && st.lv < 8) yield* say('（晨霧道路北邊的魔物還太強。先去風車丘陵吧。）');
}
function* hillsReport() {
  const st = Game.st, f = st.flags;
  yield* sayAll(['……這塊黑色的石頭，是從磨石裡掉出來的？', '（村長把結晶舉到光底下，臉色一下子沉了下來。）', '……瘴氣結晶。五百年前，黯滅之王的軍隊就是帶著這種東西，讓野獸變成魔物的。', '魔王的封印果然在減弱了……']);
  if ((f.creekQ || 0) >= 3) { f.hillsQ = 3; yield* sayAll(['……漢斯身上也沾過這種瘴氣吧。', '還好你已經用清泉草治好了他。……真是幫了大忙。']); return; } // v12.0.1: the creek was already done (order of play)
  Sound.sfx('exclaim'); yield* wait(20); yield* blackText(['「村長爺爺！」', '門被用力推開，諾拉氣喘吁吁地衝了進來。']);
  yield* sayAll(['諾拉：「爸爸他……爸爸的手臂上長出了黑色的斑點，一直在發燒……！」', '……是瘴氣病。被瘴氣纏得太久了。', '要治好它，需要碧溪谷源頭的「清泉草」。碧溪谷就在晨霧道路的西邊。',
    '……聽說最近那條溪的水也變黑了。北邊橋頭那隻沼澤鱷，說不定就是從那裡被趕下來的。']);
  if ((f.creekQ || 0) >= 2) { f.hillsQ = 3; yield* say('……咦？你身上這股清香——這不就是清泉草嗎！'); yield* say('諾拉：「真的嗎！？那、那快點拿給爸爸！」'); yield* say('（目標：把清泉草帶回風車丘陵的漢斯家。）'); return; } // v12.0.1: the catfish fell before this report (creekQ stays 2, no softlock)
  yield* say('諾拉：「我也要去！我認得清泉草長什麼樣子……拜託你！」');
  const r = yield* ask('要帶諾拉一起去嗎？', ['一起去吧', '妳留下來照顧爸爸']);
  f.noraCreek = r === 0 ? 1 : 0; f.hillsQ = 3; f.creekQ = Math.max(f.creekQ || 0, 1);
  yield* say(r === 0 ? '諾拉：「嗯！我先去溪谷的入口等你！」' : '諾拉：「……嗯。爸爸就交給我。你一定要平安回來喔。」');
  yield* say('（新的目標：到晨霧道路西側的碧溪谷，找到源頭的清泉草。推薦Lv8〜11）');
}
{ const _el = Events.elder; Events.elder = function* (ow) {
    const st = Game.st, f = st.flags, had = !!f.license;
    if (f.license && !f.hillsQ) { yield* hillsIntro(); return; }
    if (f.hillsQ === 2 && st.bag.darkShard) { yield* hillsReport(); return; }
    yield* _el(ow);
    if (!had && f.license && !f.hillsQ) { yield* wait(10); yield* hillsIntro(); }
  };
}
Object.assign(Events, {
  hillsGate(ow) {
    const st = Game.st; if (!v8Gate(st)) return null;
    return (function* () { Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(20);
      yield* sayAll(['（北邊的草叢傳來低沉的嚎叫聲……）', '（現在的自己還太弱了。先照村長說的，去東邊的風車丘陵看看吧。）']);
      yield* ow.walkEntity(ow.p, 'down', 1); ow.p.dir = 'down'; })();
  },
  hillsEnter(ow) {
    const st = Game.st, f = st.flags; if (f.noraMet) return null;
    return (function* () {
      const n = npcOf(ow, 'nora'); Sound.sfx('exclaim'); if (n) n.excl = 30; yield* wait(20);
      if (n) { yield* ow.walkEntity(n, 'left', 2); n.dir = 'left'; }
      yield* sayAll(['？？？：「你……你是鎮上來的冒險者嗎！？」', '諾拉：「我叫諾拉，是磨坊的漢斯的女兒。」', '諾拉：「前天晚上，山頂的大風車突然發出黑色的光……爸爸說要去看看，就一個人跑上去了。」',
        '諾拉：「然後……就再也沒有回來。」', '諾拉：「山上的兔子和烏鴉全都變得好兇，我一個人根本上不去……拜託你，救救我爸爸！」']);
      if (!f.hillsQ) f.hillsQ = 1;
      const r = yield* ask('要怎麼做？', ['我去找他，妳在家等', '一起去，妳幫我帶路']);
      f.noraMet = 1; f.noraWith = r === 1 ? 1 : 0;
      if (r === 1) { yield* sayAll(['諾拉：「嗯！山頂的路我最熟了。」', '諾拉：「沿著小路往北走，上了斷崖就是大風車。我先去斷崖下面等你！」']); if (n) yield* ow.walkEntity(n, 'right', 3); }
      else { yield* sayAll(['諾拉：「……好。我會在家裡準備好傷藥等你。」', '諾拉：「我家就在小路旁邊，有什麼事就進來找我。」']); if (n) yield* ow.walkEntity(n, 'right', 2); }
      if (n) n.hidden = true; ow.npcs = ow.npcs.filter(q => q !== n);
      yield* say('（目標：登上山頂的大風車，找到漢斯。）');
    })();
  },
  hillsRift(ow) {
    const st = Game.st, f = st.flags; if (f.hillsRift) return null;
    return (function* () {
      f.hillsRift = 1; ow.shake = 12; Sound.sfx('quake'); yield* wait(20);
      yield* sayAll(['地面裂開了一道縫，黑色的霧從裂縫裡一陣一陣地冒出來……', '……好像在呼吸一樣。']);
      if (f.noraWith === 1) yield* say('（遠處傳來諾拉的聲音：「小心！那個黑霧會讓動物發狂！」）');
      Sound.sfx('exclaim'); ow.p.excl = 30; yield* say('草叢裡衝出了兩隻發狂的角兔！');
      for (let i = 0; i < 2; i++) { const res = yield* ow.battleScript({ sp: 'hornHare', lv: 6, kind: 'wild', pack: [i + 1, 2] }); if (res !== 'win') return; }
      yield* say('（黑霧還在從裂縫裡冒出來。源頭應該在山頂……）');
    })();
  },
  hillsTop(ow) {
    const st = Game.st, f = st.flags; if (f.hillsTop || f.millGolem) return null;
    return (function* () {
      f.hillsTop = 1; yield* wait(10);
      yield* sayAll(['山頂的大風車前，一個男人倒在地上。', '（……是漢斯！還有呼吸。）', '大風車的扇葉慢慢地倒轉著。旁邊那顆巨大的磨石上，嵌著一塊發出黑光的結晶……']);
      ow.shake = 16; Sound.sfx('quake'); yield* wait(24);
      yield* say('磨石發出嘎啦嘎啦的聲音，自己動了起來！');
      if (f.noraWith === 1) yield* say('（斷崖下傳來諾拉的聲音：「爸爸！！……拜託你，把爸爸救回來！」）');
    })();
  },
  *eliteWin_millGolem(ow) {
    const st = Game.st, f = st.flags; if ((f.hillsQ || 0) >= 2) return;
    Sound.sfx('rock'); yield* sayAll(['磨石碎成兩半，一塊黑色的結晶滾到了腳邊。', '大風車的扇葉慢慢停了下來……然後，開始往正確的方向轉動。']);
    st.bag.darkShard = 1; yield* itemGet('得到了「黑色結晶」！');
    yield* blackText(['「……唔……」', '漢斯醒過來了。']);
    yield* sayAll(['漢斯：「……你是？是你……救了我？」', '漢斯：「那天晚上，我看到磨石上有一道黑光……一碰到它，就什麼都不記得了。」']);
    yield* say('諾拉：「爸爸——！」');
    yield* sayAll(['諾拉緊緊抱住了漢斯。', '漢斯：「讓妳擔心了……謝謝你，異界來的冒險者。」', '漢斯：「我們家就在山下。以後累了就來休息，床隨時借你。」', '漢斯：「……對了。那顆磨石發光的時候，就是要使出大招了。看到發光，就先擋住。」']);
    f.hillsQ = 2; st.money += 500; st.bag.potion = (st.bag.potion || 0) + 3; if (f.noraWith === 1) st.bag.superPotion = (st.bag.superPotion || 0) + 2;
    yield* itemGet('得到了500 G和傷藥×3' + (f.noraWith === 1 ? '，諾拉也送了好傷藥×2' : '') + '！');
    yield* say('（目標：把黑色結晶拿給村長看。晨霧道路北邊也可以去了。）');
  },
  *nora() { yield* say('諾拉：「爸爸在山頂……拜託你了！」'); },
  *noraHill() {
    const st = Game.st, f = st.flags;
    if (!f.noraTea1) { f.noraTea1 = 1; yield* sayAll(['諾拉：「上面就是大風車了。」', '諾拉：「喝一口這個再上去吧。是我自己調的藥草茶。」']); yield* healRitual('全身暖了起來，體力完全恢復了！'); return; }
    yield* say('諾拉：「爸爸就在上面……拜託你了。」');
  },
  *hansDown() { yield* say('漢斯倒在地上，一動也不動……（先對付那顆磨石！）'); },
  *hillMill1() { yield* say(Game.st.flags.millGolem ? '大風車又開始轉了。咕嚕咕嚕的聲音聽起來很舒服。' : '大風車的扇葉慢慢地倒轉著……'); },
  *hillMill2() { yield* say('小風車。風一吹就轉得呼呼作響。'); }, *hillMill3() { yield* say('小風車。旁邊的麥田長得很好。'); },
  *hillRift() { yield* say('黑色的霧從裂縫裡冒出來……（打倒山頂的元兇，霧應該就會散了。）'); },
  *hans() {
    const st = Game.st, f = st.flags;
    if (f.creekQ === 2 && st.bag.clearHerb) { yield* creekCure(); return; }
    if (f.creekQ === 1) { yield* say('（漢斯躺在床上，手臂上的黑斑越來越大……）'); return; }
    const c = Math.max(10, st.lv * 4); yield* say(f.creekQ === 3 ? '漢斯：「身體好多了！磨坊也重新開工了。」' : '漢斯：「救命恩人！累了就在這裡休息吧。」');
    if (yield* yesNo('要在漢斯家休息嗎？（' + c + ' G，比旅店便宜）')) { st.money -= Math.min(c, st.money); yield* healRitual('在磨坊的床上睡了一覺，體力完全恢復了！'); }
  },
  *noraHome() {
    const f = Game.st.flags;
    yield* say(f.creekQ === 3 ? '諾拉：「爸爸好起來了！……那個，緞帶你有戴著嗎？」' : f.creekQ === 1 ? '諾拉：「清泉草長在碧溪谷的最上游……拜託你了。」' : (f.hillsQ || 0) >= 2 ? '諾拉：「真的很謝謝你！……爸爸說，要把最好的麵粉留給你。」' : '諾拉：「爸爸在山頂……拜託你了！」');
  },
  creekEnter(ow) {
    const st = Game.st, f = st.flags; if (f.creekIn || !f.creekQ) return null;
    return (function* () {
      f.creekIn = 1; yield* wait(10);
      yield* sayAll(['溪水是黑色的。水面上漂著一層油亮的光，好幾條魚翻著白肚浮在岸邊……']);
      const n = npcOf(ow, 'noraCreek');
      if (n) { Sound.sfx('exclaim'); n.excl = 20; yield* ow.walkEntity(n, 'right', 1);
        yield* sayAll(['諾拉：「你來了！……你看，連溪水都變成這樣了。」', '諾拉：「清泉草長在最上游的水神祠旁邊。我在左岸的營火那裡等你，受傷了就回來找我！」']);
        n.hidden = true; ow.npcs = ow.npcs.filter(q => q !== n); }
      yield* say('（目標：沿著溪往上游走，到源頭的水神祠。）');
    })();
  },
  *noraCamp() {
    const st = Game.st; yield* say('諾拉：「來，烤一下火，喝杯藥草茶吧。」');
    yield* healRitual('在營火旁休息了一下，體力完全恢復了！'); yield* say(st.flags.creekBandit ? '諾拉：「盜賊？……他們也在找那種黑色的石頭嗎？」' : '諾拉：「上游好像有人在挖東西……小心一點。」');
  },
  *eliteWin_creekBandit() {
    yield* sayAll(['盜賊：「可、可惡……！」', '盜賊：「你給我記住！鐵斧格倫老大不會放過你的！」', '盜賊丟下挖到一半的黑色石塊，逃走了。', '（鐵斧格倫……是東邊廢棄礦坑的盜賊頭目嗎？他們為什麼要收集瘴氣結晶……）']);
  },
  creekTop(ow) {
    const st = Game.st, f = st.flags; if (f.creekTop || f.blackCatfish) return null;
    return (function* () {
      f.creekTop = 1; yield* wait(10);
      yield* sayAll(['源頭的水潭黑得像墨汁一樣。水神祠的石燈籠全都熄了。', '潭水中央，一個巨大的影子慢慢繞著圈子……']);
      ow.shake = 14; Sound.sfx('water'); yield* wait(20); yield* say('一條大得嚇人的鯰魚從潭底探出了頭！牠的鬍鬚上纏著一塊黑色的結晶……');
    })();
  },
  *eliteWin_blackCatfish(ow) {
    const st = Game.st, f = st.flags; if ((f.creekQ || 0) >= 2) return;
    Sound.sfx('water'); yield* sayAll(['瘴氣大鯰翻了個身，沉回了潭底。', '鬍鬚上的黑色結晶裂開了。潭水從中央開始，一點一點變回清澈的顏色……']);
    yield* say('水神祠的石燈籠，一盞一盞地亮了起來。');
    st.bag.clearHerb = 1; yield* itemGet('在水神祠旁邊找到了「清泉草」！');
    yield* say('潭邊還留著那塊裂開的黑色結晶。');
    const r = yield* ask('要怎麼處理這塊結晶？', ['獻給水神祠淨化', '帶回去給村長研究']);
    if (r === 0) { st.boost = st.boost || {}; st.boost.vit = (st.boost.vit || 0) + 1; Sound.jingle('item'); yield* sayAll(['把結晶放上祭壇，它化成了一縷白煙消失了。', '一陣涼爽的風從潭面吹過……']); yield* itemGet('得到了水神的祝福！體力永久+1。'); }
    else { st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* sayAll(['把結晶小心地包起來，帶了回去。', '村長研究完之後，送了你一本古老的書作為謝禮。']); yield* itemGet('得到了天賦之書！'); }
    f.creekQ = 2; yield* say('（目標：把清泉草帶回風車丘陵的漢斯家。）');
  },
  *creekShrine() { yield* say(Game.st.flags.blackCatfish ? '水神祠。石燈籠靜靜地亮著。' : '水神祠。石燈籠全都熄了……'); },
});
function* creekCure() {
  const st = Game.st, f = st.flags; delete st.bag.clearHerb;
  yield* sayAll(['諾拉：「清泉草！……你真的找到了！」', '諾拉把清泉草搗碎，熬成了一碗碧綠色的藥。']);
  yield* fadeOut(16); Sound.jingle('heal'); yield* wait(50); yield* fadeIn(16);
  yield* sayAll(['漢斯手臂上的黑斑，慢慢地淡了下去。', '漢斯：「……身體好輕。這陣子像被什麼東西壓著一樣。」', '漢斯：「你救了我兩次了。我們一家欠你一輩子。」',
    '諾拉：「這個……給你。是我繡的緞帶，會保佑你平安。」']);
  gainBP('qNoraRibbon', 3); Sound.jingle('item'); yield* itemGet('得到了「諾拉的緞帶」的設計圖和打造券！');
  yield* sayAll(['漢斯：「對了，北邊橋頭的沼澤鱷……牠原本就住在碧溪谷的上游。」', '漢斯：「被黑水趕下山之後，牠就一直待在橋頭，誰靠近就咬誰。水變乾淨了，可是牠已經被瘴氣迷了心……」', '漢斯：「要過橋去北邊，恐怕只能打倒牠了。」']);
  f.creekQ = 3; st.money += 800; yield* itemGet('也得到了謝禮800 G！');
  yield* say('（目標：打倒北方橋頭的沼澤鱷。推薦Lv13）');
}

/* ---------- quest log: the chapter 1 steps with a recommended level ---------- */
{ const _ql = questList; questList = function (st = Game.st) {
    const L = _ql(st), f = st.flags, M = L.find(q => q.main);
    if (M && f.license && !f.golem) {
      if (!f.hillsQ) M.t = '【推薦Lv1〜4】找村長談談接下來該做什麼。';
      else if (f.hillsQ < 2) M.t = '【推薦Lv4〜8】東邊的風車丘陵出事了。登上山頂的大風車，找到失蹤的漢斯。';
      else if (f.hillsQ === 2) M.t = '把黑色結晶拿給村長看。';
      else if (f.creekQ === 1) M.t = '【推薦Lv8〜11】到晨霧道路西側的碧溪谷，找到源頭的清泉草。';
      else if (f.creekQ === 2) M.t = '把清泉草帶回風車丘陵的漢斯家。';
      else if (!f.croc) M.t = '【推薦Lv13】打倒佔據晨霧道路北方橋頭的沼澤鱷，打通往北邊的路。';
      else if (!f.golem) M.t = '【推薦Lv13〜17】' + M.t;
    }
    if (f.hillsQ) L.push({ n: '風車丘陵的異變', cat: '主線', t: (f.hillsQ || 0) >= 3 ? '完成：打倒了磨石魔像，救出了漢斯。' : f.hillsQ === 2 ? '把黑色結晶拿給村長看。' : '登上風車丘陵山頂的大風車，找到失蹤的漢斯。', done: (f.hillsQ || 0) >= 3, rw: '500 G、傷藥、漢斯家可以便宜休息' });
    if (f.creekQ) L.push({ n: '碧溪谷的黑水', cat: '主線', t: f.creekQ === 3 ? '完成：用清泉草治好了漢斯。' : f.creekQ === 2 ? '把清泉草帶回風車丘陵的漢斯家。' : '沿著碧溪谷往上游走，找到源頭的清泉草。', done: f.creekQ === 3, rw: '諾拉的緞帶（設計圖＋打造券）、800 G、水神的祝福或天賦之書' });
    return L;
  };
}
if (typeof QUEST_CATS !== 'undefined') Object.assign(QUEST_CATS, { '風車丘陵的異變': '主線', '碧溪谷的黑水': '主線' });
{ const _se = STORY_MARKS.elder; STORY_MARKS.elder = st => { const f = st.flags; if (f.license && !f.hillsQ) return '!'; if (f.hillsQ === 2 && st.bag.darkShard) return '?'; return _se ? _se(st) : null; }; }
Object.assign(STORY_MARKS, { nora: st => !st.flags.noraMet ? '!' : null, hans: st => st.flags.creekQ === 2 && st.bag.clearHerb ? '?' : null, noraCamp: st => !st.flags.creekTop ? null : null });

/* ---------- new games are held at the 晨霧道路 ledge until the hills are done ---------- */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.v8new = 1; return st; }; }
