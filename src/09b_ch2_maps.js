/* ===================== CHAPTER 2 — maps: 北方街道・王都・地下水道・金穗平原・曙光鐘塔・霜語雪原・霜語村・冰晶洞窟・赤焰山道・熔岩坑道・黯滅要塞・星見神殿 =====================
   Rows are painted by a small script (kept one per line below); objects are listed per map. */
const CH2_ROWS = {"northRoad": ["TTTTTTTTTT::TTTTTTTTTT","TTTT#.....::......TTTT","T#####....::....#####T","T#####.o..::..o.#####T","T#####....::.....####T","T.###.TT..::..TT.###.T","T..y..TT..::..TT..f..T","T.........::.........T","T.###.....::....###..T","T#####.o..::..o#####.T","T.###.....::....###..T","T.........::.........T","T...::::::::::::::...T","T.#.:.....::.....:.#.T","T###:....TTTT....:###T","T###:....TTTT....:###T","T###:.....::.....:###T","T.#.::::::::::::::.#.T","T.........::.........T","T..f.WWWW.::..o......T","T.#..WWWW.::....f###.T","T###.WWW..::....#####T","T###......::.....###.T","T###..TT..::..TT.....T","T.#...TT..::..TT...y.T","T.........::.........T","TTT..###..::..###..TTT","T...#####.::.#####...T","T....###..::..###....T","T.o.......::.......o.T","T.....TT..::..TT.....T","T.#...TT..::..TT...#.T","T###......::......###T","T##...y...::...y..##.T","TT........::........TT","T....S....::.........T","T.........::.........T","T.........::.........T","T.........::.........T","TTTTTTTTTTTTTTTTTTTTTT"],"capital": ["TTTTTTTTTTTTTTTTTTTTTTTTT::T","TTT......................::T","T........................::T","T........................::T","T........................::T","T........................::T","T........................::T","T........................::T","T::::::::::::::::::::::::::T","T...........S::.N..........T","T.......f....WW....f.......T","T........y...WW...y........T","T.......f..........f.......T","T............::............T","T::::::::::::::::::::::::::T","T............::............T","T............::............T","T............::............T","T............::............T","T::::::::::::::::::::::::::T","T............::............T","Tb......f....::..f........bT","Tb...........::.y.........bT","T.........y..::............T","T............::............T",":::::::::::::::::::::::::::T","T............::S...........T","T.......f....::....f.......T","TT...........::...........TT","TTTTTTTTTTTTT::TTTTTTTTTTTTT"],"capSewer": ["RRRRRRRRRRRRRRRRRRRRRR","RRRRRRssssssssssRRRRRR","RRRRRRsPssssssPsRRRRRR","RRRRRRssssssssssRRRRRR","RRRRRRssssssssssRRRRRR","RRRRRRRRRRssRRRRRRRRRR","RRssssssssssssssssssRR","RRssssssssssssssssssRR","RRsssssWWW==WWWsssssRR","RRssmssWWW==WWWssmssRR","RRsssssRRRssRRRsssssRR","RRssssssssssssssssssRR","RRssssssssssssssssssRR","RRRRRRWWWRssRWWWRRRRRR","RRRRRRWWWRssRWWWRRRRRR","RRRRRRRRRRssRRRRRRRRRR","RRssssssssssssssssssRR","RRssssssssssssssssssRR","RRssssRRRRssRRRRssssRR","RRsWWsRRRRssRRRRsWWsRR","RRsWWsRRRssssRRRsWWsRR","RRssssRRRssssRRRssssRR","RRRRRRRRRssssRRRRRRRRR","RRRRRRRRRRsRRRRRRRRRRR"],"goldPlains": ["TTTTTTTTTTTTTTTTTTTTTTTT","TTTT..................TT","TTTT.f................TT","TTTT......y.:..........T","T...........:..........T","T...:.###...:..#####...T","T.o.:#####..:.#######..T","T...:#####..:.#######..T","T...:######.:.######...T","T...:######.:..#####.#.T","Ty..:#####..:...###.###T","T...:..##...:..o....###T","T...:....o..:.....f.###T","T...:.......:........#.T","T...:::::::::::::::::..T","TWW.........:.......:..T","TWWW........:.......:..T","TWW....###..:...#...:o.T","T....#######:.#####.:..T","T..#.#######:.#####.:..T","T.###.######:.#####.:.yT","T.###..###..:...##..:..T","T.###.......:.......:..T","T..#..FFFFF.:.FFFFF....T","T...........:..........T","T:::::::::::::::::::::::","T....###........###...ST","T...#####......#####...T","T....###..y.....###....T","TTTTTTTTTTTTTTTTTTTTTTTT"],"clockTower1": ["RRRRRRRRRRRRRRRRRR","RRRRRRRRssRRRRRRRR","RRRRRRRRssRRRRRRRR","RRRssssssssssssRRR","RRRsssPssssPsssRRR","RRRssssssssssssRRR","RRRsRRmmmmmmRRsRRR","RRRsRRmmmmmmRRsRRR","RRRsRRRRRRRRRRsRRR","RRssssssssssssssRR","RRssssssssssssssRR","RRsRRRRRssRRRRRsRR","RRsRRssssssssRRsRR","RRsRRssPssPssRRsRR","RRsRRssssssssRRsRR","RRsRRRRRssRRRRRsRR","RRssssssssssssssRR","RRssssssssssssssRR","RRRRRRRssssRRRRRRR","RRRRRRRssssRRRRRRR","RRRRRRRssssRRRRRRR","RRRRRRRRsRRRRRRRRR"],"clockTower2": ["RRRRRRRRRRRRRRRR","RRRRRRRRRRRRRRRR","RRssssssssssssRR","RRsPssssssssPsRR","RRssssssssssssRR","RRssssmmmmssssRR","RRssssmmmmssssRR","RRssssmmmmssssRR","RRssssmmmmssssRR","RRssssssssssssRR","RRssssssssssssRR","RRssssssssssssRR","RRsPssssssssPsRR","RRssssssssssssRR","RRRRRRRsRRRRRRRR","RRRRRRRRRRRRRRRR"],"frostField": ["TTTTTTTTTTT::TTTTTTTTTTT","T..........::..........T","T..........::..........T","T..:.......::..........T","T..:...#...::...###....T","T..:..####.::..#####...T","TTT:.#####.::.#######..T","T..:..####.::..######..T","T..:..###..::..####....T","T..:.......::.WWWW..o..T","T..:.......::.WWWW.....T","T..:.......::..WW......T","T..::::::::::....###...T","T..........::...#####..T","T....o.....::..#######.T","T.....###..::...######.T","T.....####.::....###...T","T....#####.::..o.......T","T.TT.#####.::..........T","T.....##...::..........T","T........o.:::::::::::::","T..........::..........T","T...#####..::..........T","T...#####..::....###.TTT","T..#######.::...######.T","T..######..::..#######.T","T....###...::..#######.T","T..........::...####...T","T....o.....::..........T","T..........::S.....o...T","T..........::..........T","TTTTTTTTTTT::TTTTTTTTTTT"],"frostVillage": ["TTTTTTTTTTTTTTTTTTTT","T..................T","T........:......f..T","T........:U........T","T........:.........T","T........:.........T","T.::::::::::::::::.T","T........:.........T","T........:.........T","T........:.........T","T........:.........T",":::::::::::::::::::T","T.......S:..WWW....T","T..f.....:..WWW..f.T","T........:.........T","TTTTTTTTTTTTTTTTTTTT"],"iceCave": ["RRRRRRRRRRRRRRRRRRRR","RRRRRRRRssssRRRRRRRR","RRRRssssssssssssRRRR","RRRRssPssssssPssRRRR","RRRRssssssssssssRRRR","RRRRsRRRRRRRRRRsRRRR","RRRRsRRRRRRRRRRsRRRR","RRRRsRRRRRRRRRRsRRRR","RRssssssssssssssssRR","RRssssssssssssssssRR","RRsRRRWWWssRRRRRRsRR","RRsRRRWWWssWWWRRRsRR","RRsRRRWWWssWWWRRRsRR","RRsRRRRRRssWWWRRRsRR","RRsRRRRRRssRRRRRRsRR","RRssssssssssssssssRR","RRssssssssssssssssRR","RRssssRRRssRRRsmssRR","RRsWWsRRRssRRRssssRR","RRsWWsRRssssRRssPsRR","RRsmssRRssssRRssssRR","RRssssRRssssRRssssRR","RRRRRRRRssssRRRRRRRR","RRRRRRRRRsRRRRRRRRRR"],"emberPass": ["TTTTTTTTTTTTTTTTTTTTTT","T........T::T........T","T.o.......::.......o.T","T...###...::.........T","T..#####..::......:..T","T...###...::.o....:..T","T.......o.::......:..T","T.........::......:..T","T.........::......:..T","T....###..:::::::::..T","T...#####.::.........T","T...#####.::.........T","T...#####.::..###....T","T....###..::.#####...T","T.o.......::..###....T","T.........::.......o.T","T..:::::::::.........T","T..:......::...###...T","T..:......::..#####..T","T..:WWW...::.#######.T","T..:WWW...::..######.T","T..:....o.::.WWWWW...T","T..:......::.WWWWW...T","T..:......::.........T","T..:::::::::.........T","T.........::..###....T","T....###..::######...T","T...#####.::#######..T","T...#####.::.#####...T","T...#####.::S.o##....T","T....###..::.........T","TTTTTTTTTT::TTTTTTTTTT"],"lavaTunnel": ["RRRRRRRRRRRRRRRRRRRRRR","RRRRRRRRRssssRRRRRRRRR","RRRRRssssssssssssRRRRR","RRRRRssPssssssPssRRRRR","RRRRRssssssssssssRRRRR","RRRRRssssssssssssRRRRR","RRRRRsRRRRRRRRRRsRRRRR","RRRRRsRRRRRRRRRRsRRRRR","RRRRRsRRRRRRRRRRsRRRRR","RRssssssssssssssssssRR","RRssssssss==ssssssssRR","RRsRRRWWWW==WWWWRRRsRR","RRsRRRWWWW==WWWWRRRsRR","RRsRRRWWWW==WWWWRRRsRR","RRsRRRRRRR==RRRRRRRsRR","RRssssssss==ssssssssRR","RRssssssssssssssssssRR","RRssssRRRRssRRRRssssRR","RRsWWsRRRRssRRRRsWWsRR","RRsWWsRRRRssRRRRsWWsRR","RRsWWsRRRssssRRRssssRR","RRssssRRRssssRRRssssRR","RRRRRRRRRssssRRRRRRRRR","RRRRRRRRRRsRRRRRRRRRRR"],"duskFort1": ["RRRRRRRRRRRRRRRRRRRRRR","RRRRRRRRRRssRRRRRRRRRR","RRRRRRssssssssssRRRRRR","RRRRRRssPssssPssRRRRRR","RRRRRRssssssssssRRRRRR","RRRRRRssssssssssRRRRRR","RRRRRRsRRRRRRRRsRRRRRR","RRRRRRsRRRRRRRRsRRRRRR","RRRRRRsRRRRRRRRsRRRRRR","RRRRRRsRRRRRRRRsRRRRRR","RRssssssssssssssssssRR","RRssssssssssssssssssRR","RRsRRRPssssssssPRRRsRR","RRsRRRsssmmmmsssRRRsRR","RRsRRRsssmmmmsssRRRsRR","RRsRRRPssssssssPRRRsRR","RRsRRRRRRRRRRRRRRRRsRR","RRssssssssssssssssssRR","RRssssssssssssssssssRR","RRsssssRRRssRRRsssssRR","RRssPssRRRssRRRssPssRR","RRsssssRRRssRRRsssssRR","RRsssssRRssssRRsssssRR","RRsssssRRssssRRsssssRR","RRRRRRRRRssssRRRRRRRRR","RRRRRRRRRRsRRRRRRRRRRR"],"duskFort2": ["RRRRRRRRRRRRRRRRRR","RRRRRRRRRRRRRRRRRR","RRssssssssssssssRR","RRsPsssmmmmsssPsRR","RRsssssmmmmsssssRR","RRsssssmmmmsssssRR","RRsssssmmmmsssssRR","RRssssssssssssssRR","RRsPssssssssssPsRR","RRssssssssssssssRR","RRssssssssssssssRR","RRssssssssssssssRR","RRssssssssssssssRR","RRssssssssssssssRR","RRsPssssssssssPsRR","RRssssssssssssssRR","RRRRRRRRssRRRRRRRR","RRRRRRRRRRRRRRRRRR"],"starShrine": ["TTTTTTTTTTTTTTTTTTTT","TTTT...ssssss...TTTT","TTTT...PssssP...TTTT","T......ssssss......T","T........::........T","T..::::::::::::::..T","T..:.##..::.###.:..T","T..:#####::#####:..T","T..:#####::#####:..T","T..:#####::#####:..T","T..:..##.::.##..:..T","T:.::::::::::::::.:T","T..:.....::.....:..T","T..:.###.::.###.:..T","T..:#####::#####:..T","T..:.###.::.###.:..T","T..:.....::.....:..T","T..::::::::::::::..T","T...###..::..###...T","T..#####.::.#####..T","T...###..::..###...T","TTTTTTTTT::TTTTTTTTT"]};
const ch2Map = (id, o) => { MAPS[id] = Object.assign({ rows: CH2_ROWS[id] }, o); };
/* ---------- 北方街道 (Lv22–24): the coach stops at the south end, the capital gate is at the north end ---------- */
ch2Map('northRoad', {
  name: '北方街道', music: 'route', outdoor: 1, border: 'T', battleBg: 'meadow', popup: 1, theme: 'autumn',
  edgeWarps: [{ dir: 'up', at: [10, 11], to: ['capital', 13, 28, 'up'] }],
  signs: { '5,35': '「北方街道」\n通往王都艾爾德蘭的大道。\n（魔物很強，建議Lv20以上）' },
  npcs: [
    { id: 'coachN', x: 12, y: 37, dir: 'left', look: 'coachman', name: '馬車夫' },
    { id: 'roadMerchant', x: 16, y: 11, dir: 'down', look: 'merchant', name: '旅行商人' },
    { id: 'liaRoad', x: 12, y: 25, dir: 'left', look: 'knightLia', name: '見習騎士莉婭', show: st => st.flags.liaMet && !st.flags.liaCap },
  ],
  triggers: [{ x: 10, y: 26, id: 'roadAmbush' }, { x: 11, y: 26, id: 'roadAmbush' }],
  elites: [{ id: 'blackFeather', sp: 'blackFeather', lv: 25, x: 6, y: 16, dir: 'right', sight: 3 }],
  items: [{ id: 'nr1', x: 1, y: 7, item: 'superPotion', n: 2 }, { id: 'nr2', x: 20, y: 11, gold: 1500 }, { id: 'nr3', x: 2, y: 25, item: 'royalGreaves', q: 2 }, { id: 'nr4', x: 20, y: 36, item: 'megaPotion' }, { id: 'nr5', x: 17, y: 29, item: 'wolfHood', q: 2 }, { id: 'nr6', x: 4, y: 21, item: 'hiEther', n: 2 }],
  gathers: [{ id: 'gnr1', x: 3, y: 36, kind: 'herb', mat: 'herb' }, { id: 'gnr2', x: 18, y: 18, kind: 'ore', mat: 'stone' }, { id: 'gnr3', x: 8, y: 11, kind: 'mana', mat: 'manaHerb' }],
  gearPool: ['wolfFang2', 'hornSpear', 'wolfHood', 'rustMail', 'wheatBoots', 'honeyCharm', 'windStaff'],
  rare: ['platinumSlime', 24, 26],
  encounters: [
    { y0: 0, y1: 19, rate: 0.1, table: [['greyWolf', 23, 25, 30], ['roadBandit', 23, 25, 25], ['hornBeetle', 23, 25, 20], ['plainsHawk', 24, 25, 25]] },
    { y0: 20, y1: 99, rate: 0.1, table: [['greyWolf', 22, 23, 35], ['roadBandit', 22, 23, 30], ['hornBeetle', 22, 23, 20], ['plainsHawk', 22, 23, 15]] },
  ],
});
/* ---------- 王都艾爾德蘭 ---------- */
ch2Map('capital', {
  name: '王都艾爾德蘭', music: 'capital', outdoor: 1, border: 'T', road: 'cobble', popup: 1,
  buildings: [
    { kind: 'castle', x: 9, y: 1, w: 10, h: 6, door: 4, to: ['castle', 6, 8] },
    { kind: 'church', x: 2, y: 4, w: 6, h: 4, door: 2, to: ['church', 4, 6], sign: 1 },
    { kind: 'clockShop', x: 19, y: 4, w: 5, h: 4, door: 2, to: ['clockShop', 4, 6], sign: 1 },
    { kind: 'guild', x: 2, y: 10, w: 6, h: 4, door: 2, to: ['guild', 4, 6], sign: 1 },
    { kind: 'hall', x: 20, y: 10, w: 6, h: 4, door: 2, to: ['bardHall', 4, 6], sign: 1 },
    { kind: 'inn', x: 2, y: 15, w: 5, h: 4, door: 2, to: ['capInn', 4, 6], sign: 1 },
    { kind: 'shop', x: 7, y: 15, w: 5, h: 4, door: 2, to: ['capShop', 4, 6], sign: 1 },
    { kind: 'armory', x: 16, y: 15, w: 5, h: 4, door: 2, to: ['armory', 4, 6], sign: 1 },
    { kind: 'house', x: 22, y: 15, w: 5, h: 4, door: 2, to: ['capHouse', 4, 6] },
    { kind: 'house', x: 2, y: 20, w: 5, h: 4, door: 2, to: ['capHouse2', 4, 6] },
    { kind: 'tower', x: 19, y: 20, w: 7, h: 5, door: 3, to: ['clockTower1', 8, 20], need: 'towerOpen', msg: '鐘塔的大門緊緊關著。門上有兩個齒輪形狀的凹槽……\n（需要兩個「時之齒輪」）' },
  ],
  signs: { '12,9': '「王都艾爾德蘭」\n曙光王國的首都。北邊是王城。', '15,26': '「→ 曙光鐘塔」「← 金穗平原」\n「↓ 北方街道」「↗ 霜語雪原（需要通行證）」' },
  edgeWarps: [
    { dir: 'left', at: [25], to: ['goldPlains', 22, 25, 'left'] },
    { dir: 'down', at: [13, 14], to: ['northRoad', 10, 1, 'down'] },
    { dir: 'up', at: [25, 26], to: ['frostField', 11, 30, 'up'], need: 'northPass', msg: '守衛：「北門外就是霜語雪原。沒有國王的通行證，誰都不能出去。」' },
  ],
  npcs: [
    { id: 'gateGuardS', x: 12, y: 28, dir: 'up', look: 'soldier', name: '城門守衛' },
    { id: 'gateGuardN', x: 24, y: 2, dir: 'right', look: 'soldier', name: '北門守衛' },
    { id: 'liaCap', x: 15, y: 7, dir: 'down', look: 'knightLia', name: '見習騎士莉婭', show: st => st.flags.liaCap && (st.flags.ch2 || 0) < 9 },
    { id: 'capKid', x: 6, y: 9, dir: 'down', look: 'kid', walk: 2 },
    { id: 'capWoman', x: 11, y: 21, dir: 'down', look: 'woman2', walk: 1 },
    { id: 'capOld', x: 17, y: 26, dir: 'left', look: 'old' },
    { id: 'capMerchant', x: 9, y: 13, dir: 'down', look: 'merchant', name: '王都的商人' },
    { id: 'manhole', x: 9, y: 24, dir: 'down', look: 'manhole', name: '水道的入口' },
    { id: 'coachC', x: 5, y: 26, dir: 'down', look: 'coachman', name: '馬車夫' },
    { id: 'capBard', x: 19, y: 13, dir: 'down', look: 'bardGirl', name: '街頭詩人' },
  ],
});
/* ---------- capital interiors ---------- */
ch2Map('castle', {
  name: '王城・謁見之間', music: 'capital', wallPal: 'g', rows: [
    'xxxxxxxxxxxxxx',
    'xhhxwwxxwwxhhx',
    'pnnnnnrrnnnnnp',
    'nnnnnnrrnnnnnn',
    'KnnnnnrrnnnnnK',
    'nnnnnnrrnnnnnn',
    'pnnnnnrrnnnnnp',
    'nnnnnnrrnnnnnn',
    'nnnnnnrrnnnnnn',
    'nnnnnnDnnnnnnn',
  ], exit: { x: 6, y: 9, to: ['capital', 13, 7] },
  npcs: [
    { id: 'king', x: 6, y: 2, dir: 'down', look: 'king', name: '國王阿爾德里克' },
    { id: 'princess', x: 8, y: 2, dir: 'down', look: 'princess', name: '公主艾莉西亞' },
    { id: 'chancellor', x: 4, y: 3, dir: 'right', look: 'chancellor', name: '宰相維克托', show: st => (st.flags.ch2 || 0) < 5 },
    { id: 'castleGuard1', x: 2, y: 7, dir: 'right', look: 'soldier', name: '近衛兵' },
    { id: 'castleGuard2', x: 11, y: 7, dir: 'left', look: 'soldier', name: '近衛兵' },
    { id: 'liaCastle', x: 9, y: 5, dir: 'left', look: 'knightLia', name: '見習騎士莉婭', show: st => (st.flags.ch2 || 0) >= 9 },
  ],
});
const CH2_ROOM = (top, npcs, o = {}) => Object.assign({ music: 'capital', wallPal: 'g', rows: top, exit: { x: 4, y: 7, to: o.back }, npcs }, o);
ch2Map('church', CH2_ROOM(['xxxxxxxxxx', 'xwxxccxxwx', 'pnnnrrnnnp', 'nnnnrrnnnn', 'QQnnrrnnQQ', 'nnnnrrnnnn', 'nnnnrrnnnn', 'nnnnDnnnnn'],
  [{ id: 'priest', x: 4, y: 2, dir: 'down', look: 'priest', name: '大主教' }, { id: 'nun', x: 8, y: 5, dir: 'left', look: 'mom', name: '修女' }], { name: '曙光教會', back: ['capital', 4, 8] }));
ch2Map('clockShop', CH2_ROOM(['xxxxxxxxxx', 'xhhxwwxhhx', 'nnnnnnnnVV', 'CCCnnnnnnn', 'KnnnnQQnnn', 'KnnnnQQnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'clockmaker', x: 1, y: 2, dir: 'down', look: 'clockmaker', name: '鐘錶師艾德' }, { id: 'clockApprentice', x: 7, y: 5, dir: 'left', look: 'kid2', name: '學徒' }], { name: '艾德的鐘錶店', back: ['capital', 21, 8] }));
ch2Map('guild', CH2_ROOM(['xxxxxxxxxx', 'xkkxwwxkkx', 'nnnnnnnnKK', 'CCCCCnnnnn', 'nnnnnnnQQn', 'QQnnnnnQQn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'guildMaster', x: 1, y: 2, dir: 'down', look: 'guildMaster', name: '公會長葛倫德' }, { id: 'guildClerk', x: 3, y: 2, dir: 'down', look: 'woman', name: '公會櫃檯' },
    { id: 'guildAdv1', x: 8, y: 3, dir: 'left', look: 'man', name: '冒險者' }, { id: 'guildAdv2', x: 3, y: 5, dir: 'right', look: 'traveler', name: '冒險者' }], { name: '冒險者公會', back: ['capital', 4, 14] }));
ch2Map('bardHall', CH2_ROOM(['xxxxxxxxxx', 'xwxxccxxwx', 'nnnrrrrnnn', 'nnnrrrrnnn', 'pnnnnnnnnp', 'QQnnnnnnQQ', 'nnnnnnnnnn', 'nnnnDnnnnn'],
  [{ id: 'bardMaster', x: 4, y: 2, dir: 'down', look: 'bardGirl', name: '詩人公會長蕾菈' }, { id: 'hallGuest', x: 8, y: 4, dir: 'left', look: 'woman2' }], { name: '吟遊詩人公會', back: ['capital', 22, 14] }));
ch2Map('capInn', CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnnB', 'BnCCCCCCnB', 'nnnnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'capInnkeeper', x: 4, y: 2, dir: 'down', look: 'healer', name: '旅店老闆' }, { id: 'capInnGuest', x: 7, y: 5, dir: 'left', look: 'man' }], { name: '金雀旅店', back: ['capital', 4, 19] }));
ch2Map('capShop', CH2_ROOM(['xxxxxxxxxx', 'xhhxwwxhhx', 'nnnnnnnnnn', 'CCCnnnnVVn', 'nnnnnnnVVn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'capClerk', x: 1, y: 2, dir: 'down', look: 'clerk', name: '道具店' }], { name: '王都道具店', back: ['capital', 9, 19] }));
ch2Map('armory', CH2_ROOM(['xxxxxxxxxx', 'xkkxwwxkkx', 'nnnnnnnnnn', 'CCCnnnnnnn', 'nnnnnnnVVn', 'nnnnnQQVVn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'armorer', x: 1, y: 2, dir: 'down', look: 'man', name: '武具店老闆' }, { id: 'capSmith', x: 8, y: 2, dir: 'down', look: 'old', name: '王都的鐵匠' }], { name: '王都武具店', back: ['capital', 18, 19] }));
ch2Map('capHouse', CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnKp', 'BnnnnnnnKn', 'nnnQQnnnnn', 'nnnQQnnnnn', 'nnnnnnnnnn', 'nnnnDnnnnn'],
  [{ id: 'capResident', x: 6, y: 4, dir: 'left', look: 'mom', name: '老婦人' }], { name: '民宅', back: ['capital', 24, 19] }));
ch2Map('capHouse2', CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'KpnnnnnnnB', 'KnnnnnnnnB', 'nnnnnQQnnn', 'nnnnnQQnnn', 'nnnnnnnnnn', 'nnnnDnnnnn'],
  [{ id: 'capScholar', x: 3, y: 4, dir: 'right', look: 'clerk', name: '歷史學者' }], { name: '學者的家', back: ['capital', 4, 24] }));
/* ---------- 王都地下水道 (Lv24–26) ---------- */
ch2Map('capSewer', {
  name: '王都地下水道', music: 'ruins', border: 'R', battleBg: 'sewer', encAll: 1, popup: 1, theme: 'sewer2',
  exit: { x: 10, y: 23, to: ['capital', 9, 25] },
  boss: { sp: 'ratKing', lv: 27, x: 10, y: 2, flag: 'ratKing', ev: 'ratBoss' },
  items: [{ id: 'cs1', x: 2, y: 21, item: 'megaPotion' }, { id: 'cs2', x: 19, y: 21, gold: 2000 }, { id: 'cs3', x: 2, y: 6, item: 'lostScore' }, { id: 'cs4', x: 19, y: 6, item: 'rustMail', q: 2 }, { id: 'cs5', x: 7, y: 1, item: 'hiEther', n: 2 }, { id: 'cs6', x: 14, y: 4, item: 'royalDagger', q: 2 }],
  gathers: [{ id: 'gcs1', x: 18, y: 9, kind: 'gel', mat: 'gel' }, { id: 'gcs2', x: 3, y: 12, kind: 'ore', mat: 'stone' }],
  gearPool: ['royalDagger', 'rustMail', 'wolfHood', 'wheatBoots', 'honeyCharm', 'windStaff'],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['sewerRat', 24, 26, 30], ['sludge', 24, 26, 25], ['rustSpider', 24, 26, 25], ['sewerCroc', 25, 26, 20]] }],
});
/* ---------- 金穗平原 (Lv24–26) ---------- */
ch2Map('goldPlains', {
  name: '金穗平原', music: 'route', outdoor: 1, border: 'T', battleBg: 'meadow', popup: 1, theme: 'plains',
  edgeWarps: [{ dir: 'right', at: [25], to: ['capital', 1, 25, 'right'] }],
  signs: { '22,26': '「金穗平原」\n王都的麥田。風車小屋在北邊。\n（建議Lv24以上）' },
  npcs: [
    { id: 'windmill', x: 16, y: 2, dir: 'down', look: 'windmill', name: '風車小屋' },
    { id: 'plainsFarmer', x: 20, y: 24, dir: 'down', look: 'man', name: '麥田的農夫' },
    { id: 'plainsGirl', x: 3, y: 24, dir: 'right', look: 'girl', name: '牧羊女' },
  ],
  boss: { sp: 'harvestGolem', lv: 28, x: 12, y: 3, flag: 'harvestGolem', ev: 'harvestBoss' },
  elites: [{ id: 'boarKing', sp: 'boarKing', lv: 27, x: 16, y: 17, dir: 'left', sight: 3 }],
  items: [{ id: 'gp1', x: 1, y: 4, item: 'megaPotion' }, { id: 'gp2', x: 22, y: 4, gold: 1800 }, { id: 'gp3', x: 22, y: 13, item: 'windStaff', q: 2 }, { id: 'gp4', x: 1, y: 26, item: 'hiEther', n: 2 }, { id: 'gp5', x: 8, y: 1, item: 'honeyCharm', q: 2 }, { id: 'gp6', x: 21, y: 28, item: 'elixir' }],
  gathers: [{ id: 'ggp1', x: 9, y: 24, kind: 'wheat', mat: 'wheat' }, { id: 'ggp2', x: 15, y: 24, kind: 'wheat', mat: 'wheat' }, { id: 'ggp3', x: 6, y: 11, kind: 'wheat', mat: 'wheat' }, { id: 'ggp4', x: 20, y: 3, kind: 'herb', mat: 'herb' }],
  gearPool: ['hornSpear', 'windStaff', 'wheatBoots', 'honeyCharm', 'wolfHood', 'royalBadge'],
  rare: ['platinumSlime', 25, 27],
  encounters: [
    { y0: 0, y1: 13, rate: 0.1, table: [['scarecrow', 25, 27, 30], ['fieldBee', 25, 26, 20], ['wildBoar', 25, 27, 25], ['windSprite', 25, 27, 25]] },
    { y0: 14, y1: 99, rate: 0.1, table: [['scarecrow', 24, 26, 30], ['fieldBee', 24, 25, 25], ['wildBoar', 24, 26, 25], ['windSprite', 25, 26, 20]] },
  ],
});
/* ---------- 曙光鐘塔 (Lv27–30) ---------- */
ch2Map('clockTower1', {
  name: '曙光鐘塔', music: 'ruins', border: 'R', battleBg: 'tower', encAll: 1, popup: 1, theme: 'tower',
  exit: { x: 8, y: 21, to: ['capital', 22, 25] },
  triggers: [{ x: 8, y: 1, id: 'towerUp' }, { x: 9, y: 1, id: 'towerUp' }],
  elites: [{ id: 'clockKnight', sp: 'clockKnight', lv: 30, x: 8, y: 4, dir: 'down', sight: 2 }],
  items: [{ id: 'ct1', x: 3, y: 9, item: 'megaPotion' }, { id: 'ct2', x: 14, y: 16, gold: 2500 }, { id: 'ct3', x: 6, y: 13, item: 'springBoots', q: 2 }, { id: 'ct4', x: 3, y: 3, item: 'megaEther' }, { id: 'ct5', x: 11, y: 7, item: 'clockHelm', q: 2 }],
  gathers: [{ id: 'gct1', x: 15, y: 12, kind: 'ore', mat: 'stone' }],
  gearPool: ['brassSword', 'gearStaff', 'clockHelm', 'clockMail', 'springBoots', 'ancientWatch'],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['clockSoldier', 27, 29, 30], ['gearSprite', 27, 29, 25], ['towerBat', 28, 29, 25], ['hollowArmor', 28, 30, 20]] }],
});
ch2Map('clockTower2', {
  name: '曙光鐘塔・鐘樓', music: 'ruins', border: 'R', battleBg: 'tower', popup: 1, theme: 'tower',
  exit: { x: 7, y: 14, to: ['clockTower1', 8, 2] },
  boss: { sp: 'clockColossus', lv: 31, x: 7, y: 5, flag: 'colossus', ev: 'colossusBoss' },
  npcs: [
    { id: 'dawnBell', x: 7, y: 2, dir: 'down', look: 'bell', name: '曙光鐘' },
    { id: 'starGate', x: 12, y: 2, dir: 'down', look: 'starGate', name: '星之門', show: st => (st.flags.ch2 || 0) >= 10 },
  ],
});
/* ---------- 霜語雪原 (Lv29–31) ---------- */
ch2Map('frostField', {
  name: '霜語雪原', music: 'snow', outdoor: 1, border: 'T', battleBg: 'snow', popup: 1, theme: 'snow',
  edgeWarps: [
    { dir: 'down', at: [11, 12], to: ['capital', 25, 1, 'down'] },
    { dir: 'right', at: [20], to: ['frostVillage', 1, 11, 'right'] },
    { dir: 'up', at: [11, 12], to: ['emberPass', 10, 30, 'up'], need: 'frostPath', msg: '通往北方山道的路被厚厚的冰牆封住了……\n（冰晶洞窟深處好像有什麼東西在控制這些冰）' },
  ],
  signs: { '13,29': '「霜語雪原」\n→ 霜語村　↑ 北方山道\n（建議Lv29以上）' },
  npcs: [{ id: 'iceCaveDoor', x: 3, y: 2, dir: 'down', look: 'caveDoor', name: '冰晶洞窟' }, { id: 'iceWall', x: 11, y: 1, dir: 'down', look: 'iceWall', name: '冰牆', show: st => !st.flags.frostPath }, { id: 'iceWall2', x: 12, y: 1, dir: 'down', look: 'iceWall', name: '冰牆', show: st => !st.flags.frostPath }],
  elites: [{ id: 'snowBear', sp: 'snowBear', lv: 32, x: 18, y: 15, dir: 'left', sight: 3 }],
  items: [{ id: 'ff1', x: 1, y: 1, item: 'megaPotion', n: 2 }, { id: 'ff2', x: 22, y: 2, gold: 3000 }, { id: 'ff3', x: 1, y: 20, item: 'frostHood', q: 2 }, { id: 'ff4', x: 22, y: 28, item: 'megaEther' }, { id: 'ff5', x: 6, y: 11, item: 'snowBoots', q: 2 }, { id: 'ff6', x: 18, y: 22, item: 'elixir' }],
  gathers: [{ id: 'gff1', x: 21, y: 4, kind: 'ice', mat: 'iceCrystal' }, { id: 'gff2', x: 5, y: 30, kind: 'ice', mat: 'iceCrystal' }, { id: 'gff3', x: 20, y: 12, kind: 'mana', mat: 'manaHerb' }],
  gearPool: ['frostBrand', 'iceDagger', 'glacierStaff', 'frostHood', 'yetiFur', 'snowBoots', 'iceCharm'],
  rare: ['platinumSlime', 30, 32],
  encounters: [
    { y0: 0, y1: 15, rate: 0.1, table: [['snowWolf', 30, 31, 30], ['frostSprite', 30, 31, 25], ['yeti', 30, 31, 20], ['iceOwl', 30, 31, 25]] },
    { y0: 16, y1: 99, rate: 0.1, table: [['snowWolf', 29, 30, 35], ['frostSprite', 29, 30, 25], ['yeti', 29, 30, 20], ['iceOwl', 29, 30, 20]] },
  ],
});
/* ---------- 霜語村 ---------- */
ch2Map('frostVillage', {
  name: '霜語村', music: 'snow', outdoor: 1, border: 'T', popup: 1, theme: 'snow',
  buildings: [
    { kind: 'snowHouse', x: 2, y: 7, w: 5, h: 4, door: 2, to: ['frostInn', 4, 6], sign: 1 },
    { kind: 'snowHouse', x: 11, y: 7, w: 5, h: 4, door: 2, to: ['frostShop', 4, 6], sign: 1 },
    { kind: 'church', x: 11, y: 1, w: 6, h: 5, door: 2, to: ['temple', 4, 6] },
    { kind: 'snowHouse', x: 2, y: 2, w: 5, h: 4, door: 2, to: ['frostHouse', 4, 6] },
  ],
  signs: { '8,12': '「霜語村」\n風會在雪原上說悄悄話的村子。' },
  edgeWarps: [{ dir: 'left', at: [11], to: ['frostField', 22, 20, 'left'] }],
  npcs: [
    { id: 'frostKid', x: 15, y: 13, dir: 'down', look: 'kid2', walk: 1 },
    { id: 'frostHunter', x: 6, y: 13, dir: 'right', look: 'frostVillager', name: '雪原獵人' },
    { id: 'coachF', x: 2, y: 12, dir: 'down', look: 'coachman', name: '雪橇車夫' },
  ],
});
ch2Map('frostInn', CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnnB', 'BnCCCCCCnB', 'nnnnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'frostInnkeeper', x: 4, y: 2, dir: 'down', look: 'healer', name: '暖爐旅店' }], { name: '暖爐旅店', music: 'snow', back: ['frostVillage', 4, 11] }));
ch2Map('frostShop', CH2_ROOM(['xxxxxxxxxx', 'xhhxwwxhhx', 'nnnnnnnnnn', 'CCCnnnnVVn', 'nnnnnnnVVn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'frostClerk', x: 1, y: 2, dir: 'down', look: 'frostVillager', name: '雜貨店' }], { name: '霜語村雜貨店', music: 'snow', back: ['frostVillage', 13, 11] }));
ch2Map('temple', CH2_ROOM(['xxxxxxxxxx', 'xkkxccxkkx', 'pnnnrrnnnp', 'nnnnrrnnnn', 'nnnnrrnnnn', 'pnnnrrnnnp', 'nnnnrrnnnn', 'nnnnDnnnnn'],
  [{ id: 'monkMaster', x: 4, y: 2, dir: 'down', look: 'monk', name: '武僧長老' }, { id: 'monkPupil', x: 7, y: 4, dir: 'left', look: 'monk', name: '修行僧' }], { name: '雪峰寺', music: 'snow', back: ['frostVillage', 13, 6] }));
ch2Map('frostHouse', CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnKp', 'BnnnnnnnKn', 'nnnQQnnnnn', 'nnnQQnnnnn', 'nnnnnnnnnn', 'nnnnDnnnnn'],
  [{ id: 'frostElder', x: 6, y: 4, dir: 'left', look: 'elder', name: '村長婆婆' }], { name: '村長的家', music: 'snow', back: ['frostVillage', 4, 6] }));
/* ---------- 冰晶洞窟 (Lv31–33) ---------- */
ch2Map('iceCave', {
  name: '冰晶洞窟', music: 'ruins', border: 'R', battleBg: 'iceCave', encAll: 1, popup: 1, theme: 'ice',
  exit: { x: 9, y: 23, to: ['frostField', 3, 3] },
  boss: { sp: 'frostQueen', lv: 34, x: 9, y: 2, flag: 'frostQueen', ev: 'queenBoss' },
  elites: [{ id: 'frostLich', sp: 'frostLich', lv: 33, x: 9, y: 9, dir: 'down', sight: 2 }],
  items: [{ id: 'ic1', x: 3, y: 21, item: 'megaPotion', n: 2 }, { id: 'ic2', x: 16, y: 21, gold: 3500 }, { id: 'ic3', x: 2, y: 9, item: 'iceDagger', q: 2 }, { id: 'ic4', x: 17, y: 9, item: 'megaEther' }, { id: 'ic5', x: 5, y: 2, item: 'iceCharm', q: 2 }, { id: 'ic6', x: 15, y: 4, item: 'elixir' }],
  gathers: [{ id: 'gic1', x: 3, y: 15, kind: 'ice', mat: 'iceCrystal' }, { id: 'gic2', x: 16, y: 16, kind: 'crystal', mat: 'crystal' }],
  gearPool: ['frostBrand', 'iceDagger', 'glacierStaff', 'frostHood', 'yetiFur', 'snowBoots', 'iceCharm'],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['iceBat', 31, 33, 30], ['frostSlime', 31, 32, 25], ['iceGolem', 31, 33, 25], ['frostWraith', 32, 33, 20]] }],
});
/* ---------- 赤焰山道 (Lv32–34) ---------- */
ch2Map('emberPass', {
  name: '赤焰山道', music: 'volcano', outdoor: 1, border: 'T', battleBg: 'volcano', popup: 1, theme: 'volcano',
  edgeWarps: [{ dir: 'down', at: [10, 11], to: ['frostField', 11, 1, 'down'] }],
  signs: { '12,29': '「赤焰山道」\n越過山頂，就是熔岩坑道。\n（建議Lv32以上）' },
  npcs: [{ id: 'lavaDoor', x: 10, y: 1, dir: 'down', look: 'caveDoor', name: '熔岩坑道' }, { id: 'dragonElder', x: 18, y: 3, dir: 'down', look: 'dragonElder', name: '龍騎士老人' }],
  elites: [{ id: 'youngDragon', sp: 'youngDragon', lv: 35, x: 15, y: 19, dir: 'left', sight: 3 }],
  items: [{ id: 'ep1', x: 1, y: 1, item: 'megaPotion', n: 2 }, { id: 'ep2', x: 20, y: 1, gold: 4000 }, { id: 'ep3', x: 1, y: 15, item: 'salamanderHelm', q: 2 }, { id: 'ep4', x: 20, y: 23, item: 'megaEther' }, { id: 'ep5', x: 4, y: 30, item: 'lavaBoots', q: 2 }, { id: 'ep6', x: 19, y: 12, item: 'elixir' }],
  gathers: [{ id: 'gep1', x: 7, y: 22, kind: 'magma', mat: 'magmaStone' }, { id: 'gep2', x: 19, y: 26, kind: 'magma', mat: 'magmaStone' }],
  gearPool: ['flameBrand', 'magmaDagger', 'volcanoStaff', 'salamanderHelm', 'magmaPlate', 'lavaBoots', 'emberCharm'],
  rare: ['platinumSlime', 33, 35],
  encounters: [
    { y0: 0, y1: 15, rate: 0.1, table: [['fireSalamander', 33, 34, 30], ['magmaSlime', 33, 34, 20], ['volcanoHawk', 33, 34, 30], ['lavaCrab', 33, 34, 20]] },
    { y0: 16, y1: 99, rate: 0.1, table: [['fireSalamander', 32, 33, 35], ['magmaSlime', 32, 33, 25], ['volcanoHawk', 32, 33, 25], ['lavaCrab', 32, 33, 15]] },
  ],
});
/* ---------- 熔岩坑道 (Lv34–36) ---------- */
ch2Map('lavaTunnel', {
  name: '熔岩坑道', music: 'ruins', border: 'R', battleBg: 'lava', encAll: 1, popup: 1, theme: 'lava',
  exit: { x: 10, y: 23, to: ['emberPass', 10, 2] },
  triggers: [{ x: 10, y: 1, id: 'toFort' }, { x: 11, y: 1, id: 'toFort' }],
  boss: { sp: 'lavaGiant', lv: 37, x: 10, y: 2, flag: 'lavaGiant', ev: 'giantBoss' },
  items: [{ id: 'lt1', x: 2, y: 21, item: 'megaPotion', n: 2 }, { id: 'lt2', x: 19, y: 21, gold: 4500 }, { id: 'lt3', x: 2, y: 9, item: 'magmaDagger', q: 2 }, { id: 'lt4', x: 19, y: 9, item: 'megaEther' }, { id: 'lt5', x: 5, y: 2, item: 'emberCharm', q: 2 }, { id: 'lt6', x: 16, y: 5, item: 'elixir' }],
  gathers: [{ id: 'glt1', x: 3, y: 16, kind: 'magma', mat: 'magmaStone' }, { id: 'glt2', x: 18, y: 16, kind: 'ore', mat: 'stone' }],
  gearPool: ['flameBrand', 'magmaDagger', 'volcanoStaff', 'salamanderHelm', 'magmaPlate', 'lavaBoots', 'emberCharm'],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['magmaGolem', 34, 36, 25], ['flameSkeleton', 34, 36, 25], ['hellHound', 34, 36, 25], ['blazeSpirit', 35, 36, 25]] }],
});
/* ---------- 黯滅要塞 (Lv36–38) ---------- */
ch2Map('duskFort1', {
  name: '黯滅要塞', music: 'ruins', border: 'R', battleBg: 'fortress', encAll: 1, popup: 1, theme: 'fort',
  exit: { x: 10, y: 25, to: ['lavaTunnel', 11, 2] },
  triggers: [{ x: 10, y: 1, id: 'fortUp' }, { x: 11, y: 1, id: 'fortUp' }],
  boss: { sp: 'victorDemon', lv: 38, x: 10, y: 3, flag: 'victor', ev: 'victorBoss' },
  elites: [{ id: 'duskCaptain', sp: 'duskCaptain', lv: 38, x: 10, y: 13, dir: 'down', sight: 2 }],
  items: [{ id: 'df1', x: 2, y: 23, item: 'megaPotion', n: 2 }, { id: 'df2', x: 19, y: 23, gold: 5000 }, { id: 'df3', x: 2, y: 10, item: 'duskHelm', q: 2 }, { id: 'df4', x: 19, y: 10, item: 'megaEther', n: 2 }, { id: 'df5', x: 7, y: 2, item: 'voidBoots', q: 2 }, { id: 'df6', x: 14, y: 5, item: 'elixir', n: 2 }],
  gearPool: ['duskSword', 'shadowDagger', 'voidStaff', 'voidTome', 'duskHelm', 'duskPlate', 'shadowRobe', 'voidBoots', 'voidRing'],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['duskKnight', 36, 38, 25], ['shadowMage', 36, 38, 20], ['sentinel', 37, 38, 20], ['voidHound', 36, 38, 20], ['nightmare', 37, 38, 15]] }],
});
ch2Map('duskFort2', {
  name: '黯滅要塞・王座', music: 'ruins', border: 'R', battleBg: 'fortress', popup: 1, theme: 'fort',
  exit: { x: 8, y: 16, to: ['duskFort1', 10, 2] },
  boss: { sp: 'shadowGeneral', lv: 40, x: 8, y: 5, flag: 'mold', ev: 'moldBoss' },
});
/* ---------- 星見神殿 (post-game, Lv40–43) ---------- */
ch2Map('starShrine', {
  name: '星見神殿', music: 'lake', outdoor: 1, border: 'T', battleBg: 'star', popup: 1, theme: 'star',
  edgeWarps: [{ dir: 'down', at: [9, 10], to: ['clockTower2', 11, 3, 'down'] }],
  boss: { sp: 'starGuardian', lv: 45, x: 9, y: 2, flag: 'starGuardian', ev: 'starBoss' },
  items: [{ id: 'ss1', x: 1, y: 3, item: 'elixir', n: 2 }, { id: 'ss2', x: 18, y: 3, gold: 8000 }, { id: 'ss3', x: 1, y: 20, item: 'starBoots', q: 3 }, { id: 'ss4', x: 18, y: 20, item: 'tpBook' }, { id: 'ss5', x: 6, y: 12, item: 'starCrown', q: 3 }, { id: 'ss6', x: 13, y: 16, item: 'megaEther', n: 3 }],
  gathers: [{ id: 'gss1', x: 17, y: 12, kind: 'star', mat: 'starDust' }, { id: 'gss2', x: 2, y: 16, kind: 'star', mat: 'starDust' }],
  gearPool: ['starSword', 'cometDagger', 'starStaff', 'starCrown', 'starRobe', 'starBoots'],
  encounters: [{ y0: 0, y1: 99, rate: 0.1, table: [['starSpirit', 40, 42, 30], ['angelStatue', 41, 43, 20], ['cometBird', 40, 42, 30], ['abyssEye', 41, 43, 20]] }],
});
MAPS.town.npcs.push(
  { id: 'royalKnight', x: 12, y: 4, dir: 'down', look: 'soldier', name: '王都的騎士', show: st => st.flags.golem && !st.flags.ch2 },
  { id: 'coachT', x: 19, y: 5, dir: 'down', look: 'coachman', name: '馬車夫', show: st => (st.flags.ch2 || 0) >= 1 },
);
