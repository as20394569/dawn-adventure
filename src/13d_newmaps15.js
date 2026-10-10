/* ===================== v12.108 四張新的探索地圖（沒地方放的 13 種魔物） =====================
   玩家 2026-10-10：「13 種沒地方放的怪物 可以做新地圖 然後根據等級差放置 可以增加玩家探索意願 然後可以有一些任務與探索獎勵」
   · 風鈴牧草地 Lv4〜6（風車丘陵東南的小路）：啾啾鳥・野狼・蒲絨精
   · 霧沼小徑 Lv8〜10（碧溪谷北邊的小路）：霧角蝸牛・紫斑蛙・毒刺蜻蜓
   · 風之高原 Lv23〜25（北方街道東邊的小路）：草原鷹・風精・焰狐
   · 餘燼古城 Lv35〜37（赤焰山道東邊的小路）：熔岩姆・爆炎精・魔像哨兵，晚上多一種夢魘
   每張都有：一個委託（地圖裡的人給）、寶箱、一個藏起來的「探索獎勵」飾品、三種異色魔物和異色飾品。四張都走過有成就。 */
const NEW_ROWS15 = {
  meadow15: ["TTTTTTTTTTTTTTTTTTTTTT", "T....###......###....T", "T...#####....#####...T", "T...#####.o..#####...T", "T....###......###....T", "T..........::........T", "TT...o.....::.....o..T", "T##........::......##T", "T###...TT..::..TT..##T", "T##....TT..::..TT...#T", "T..........::........T", "T....####..::..####..T", "T...######.::.######.T", "T....####..::..####..T", "T..........::........T", "TT.........::.......TT", "T....##....::...##...T", "T...####...::..####..T", "TTTTTTTTTTT::TTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTT"],
  marsh15: ["TTTTTTTTTTTTTTTTTTTTTT", "T..WW....###....WWW..T", "T..WW...#####...WWW..T", "T.......#####........T", "T..###...###....###..T", "T.#####.......######.T", "T..###..WWWW...####..T", "T.......WWWW.........T", "TT...:::::::::::::..TT", "T....:...WWW.....:...T", "T.##.:...WWW..##.:.#.T", "T####:........##.:###T", "T.##.:..###......:.#.T", "T....:.#####.....:...T", "TWW..:..###...WW.:...T", "TWW..:........WW.:...T", "T....::::::::::::::..T", "T..........::........T", "TTTTTTTTTTT::TTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTT"],
  highland15: ["TTTTTTTTTTTTTTTTTTTTTTTT", "T..o....####....o......T", "T......######.......o..T", "T.###...####....####...T", "T#####.........######..T", "T.###....::::.....##...T", "T........:..:..........T", "TT..o....:..:....o...TTT", "T...###..:..:..###.....T", "T..#####.:..:.#####....T", "T...###..:..:..###..o..T", "T........:..:..........T", "TTT......:..:.......###T", "T...####.:..:......####T", "T..######::::.......##.T", "T...####...:...........T", "T..........:....o......T", "TTTTTTTTTTT:TTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTT"],
  emberRuin15: ["TTTTTTTTTTTTTTTTTTTTTTTT", "TRRRRRRRR......RRRRRRRRT", "TR......R..##..R......RT", "TR.####.R.####.R.####.RT", "TR.####...####...####.RT", "TR......R..##..R......RT", "TRRRR.RRR......RRR.RRRRT", "T.....................#T", "T.###....RR..RR....###.T", "T#####...R....R...#####T", "T.###....RR..RR....###.T", "T......................T", "TRRR.RRRRR.::.RRRRR.RRRT", "T..........::..........T", "T..####....::....####..T", "T.######...::...######.T", "T..####....::....####..T", "T..........::..........T", "TTTTTTTTTTT::TTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTT"],
};
// [名字, 等級, 三種, 夜晚, 主題(theme, music, battleBg), 從哪張地圖進來 [map, x, y, 進來後站的位置 x, y], 新地圖裡回去的路牌 [x, y], 到達 [x, y]]
const NEW15 = {
  meadow15: ['風鈴牧草地', [4, 6], ['bird', 'meadowWolf', 'fluffSeed'], null, ['plains', 'plains', 'meadow'], ['windHills', 35, 34, 35, 35], [11, 18], [11, 17]],
  marsh15: ['霧沼小徑', [8, 10], ['mistSnail', 'frog', 'mireFly'], null, [undefined, 'lake', 'lake'], ['jadeCreek', 23, 8, 23, 9], [11, 18], [11, 17]],
  highland15: ['風之高原', [23, 25], ['plainsHawk', 'windSprite', 'fox'], null, ['autumn', 'route', 'meadow'], ['northRoad', 31, 25, 31, 26], [11, 17], [11, 16]],
  emberRuin15: ['餘燼古城', [35, 37], ['magmaSlime', 'blazeSpirit', 'sentinel'], 'nightmare', ['volcano', 'volcano', 'volcano'], ['emberPass', 31, 32, 31, 33], [11, 18], [11, 17]],
};
// the signpost on both ends of each path
const TRAIL15_IMG = pxArt14(16, 22, (put, rect) => { rect(7, 8, 8, 21, '#5a3a22'); rect(8, 8, 8, 21, '#7a5232'); rect(2, 4, 13, 9, '#3a2414'); rect(3, 5, 12, 8, '#b08050'); rect(3, 5, 12, 5, '#d0a070');
  rect(5, 6, 10, 7, '#3a2414'); put(11, 5, '#3a2414'); put(11, 8, '#3a2414'); put(12, 6, '#3a2414'); put(12, 7, '#3a2414'); rect(6, 20, 9, 21, '#2a1a10'); });
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'trail15') return propFrames(TRAIL15_IMG, 6); return _nf(look); }; }
// the hidden reward of each map (one accessory each)
const EXPLORE_ACC15 = {
  windChime15: ['風鈴耳飾', 1, { hp: 7, spe: 3, spa: 1 }, 'swift', '牧草地的風一吹就會響的小耳飾。戴上之後腳步也輕了起來。'],
  mistCharm15: ['霧沼護符', 2, { hp: 10, spd: 3, spa: 2 }, 'will', '沼澤小屋的老婆婆掛在門口的護符。霧再大也不會迷路。'],
  hawkFeather15: ['高原鷹羽', 4, { hp: 15, atk: 4, spe: 5 }, 'initiative', '高原上最高的那塊岩石上撿到的鷹羽，摸起來還有風的溫度。'],
  emberCrown15: ['餘燼王冠', 6, { hp: 26, atk: 6, spa: 6, def: 4 }, 'fervor', '餘燼古城最後一位城主的小王冠。上面的寶石裡，火還沒有熄。'],
};
for (const k in EXPLORE_ACC15) { const [n, t, st, tr, d] = EXPLORE_ACC15[k];
  GEAR[k] = { n, slot: 'acc', t, st, sp: {}, fx: [tr], trait: tr, kind: '飾品', d, look: (GEAR.qHeroCrest || {}).look };
  if (ACC_TRAIT[tr] && ACC_TRAIT[tr][2] && !ACC_TRAIT[tr][2].includes(n)) ACC_TRAIT[tr][2].push(n); if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); }
const NEW_ITEMS15 = {
  meadow15: [['superPotion', 2], ['ether', 2], [null, 800], ['luckClover', 1], ['windChime15', 3]],
  marsh15: [['superPotion', 3], ['hiEther', 1], [null, 1500], ['agiFruit', 1], ['mistCharm15', 3]],
  highland15: [['megaPotion', 2], ['megaEther', 1], [null, 6000], ['dexFruit', 1], ['hawkFeather15', 4]],
  emberRuin15: [['megaPotion', 3], ['elixir', 1], [null, 12000], ['powerFruit', 1], ['emberCrown15', 4]],
};
const NEW_ITEMXY15 = { meadow15: [[2, 1], [19, 1], [1, 10], [20, 14], [20, 9]], marsh15: [[1, 3], [20, 3], [1, 13], [20, 15], [10, 1]],
  highland15: [[1, 1], [22, 2], [22, 14], [1, 16], [22, 11]], emberRuin15: [[2, 2], [21, 2], [11, 9], [1, 17], [22, 7]] };
// the person on each map (gives the map's request)
const NEW_NPC15 = { meadow15: ['shepherd15', 5, 5, 'kid', '牧羊少年', 'c51'], marsh15: ['herbGran15', 12, 7, 'old', '採藥的婆婆', 'c52'], highland15: ['painter15', 13, 6, 'traveler', '旅行畫家', 'c53'], emberRuin15: ['scholar15', 10, 13, 'man', '考古學者', 'c54'] };
Object.assign(COMMISSIONS, {
  c51: { n: '牧草地的野狼', from: '牧羊少年', d: '野狼一直來偷羊。接下委託後，擊敗野狼×5。', kill: ['meadowWolf', 5], reward: { gold: 800, items: { agiFruit: 1 } }, open: st => st.vis && st.vis.meadow15 },
  c52: { n: '沼澤的毒蛙', from: '採藥的婆婆', d: '紫斑蛙把藥草都弄髒了。接下委託後，擊敗紫斑蛙×5。', kill: ['frog', 5], reward: { gold: 1500, items: { wisdomFruit: 1 } }, open: st => st.vis && st.vis.marsh15 },
  c53: { n: '高原的老鷹', from: '旅行畫家', d: '草原鷹老是來搶畫具。接下委託後，擊敗草原鷹×5。', kill: ['plainsHawk', 5], reward: { gold: 5000, items: { tpBook: 1 } }, open: st => st.vis && st.vis.highland15 },
  c54: { n: '古城的哨兵', from: '考古學者', d: '魔像哨兵擋在遺跡的入口。接下委託後，擊敗魔像哨兵×4。', kill: ['sentinel', 4], reward: { gold: 10000, items: { powerFruit: 1, tpBook: 1 } }, open: st => st.vis && st.vis.emberRuin15 },
});
Object.assign(COM_GIVER, { c51: 'shepherd15', c52: 'herbGran15', c53: 'painter15', c54: 'scholar15' });
Object.assign(COM_TALK, {
  c51: ['牧羊少年：「最近野狼一直跑來，羊都不敢出來吃草了……」', '「你看起來很厲害！可以幫我趕走牠們嗎？」'],
  c52: ['採藥的婆婆：「霧沼的藥草，是碧溪谷的人治病要用的。」', '「可是紫斑蛙在上面爬來爬去，藥草都沾上毒了。」'],
  c53: ['旅行畫家：「這片高原的風景，我畫了三年還畫不完。」', '「可是草原鷹老是來叼我的畫筆……幫幫我吧。」'],
  c54: ['考古學者：「這座城叫做餘燼古城。五百年前，火山爆發的那一夜就被燒成這樣了。」', '「城裡面還有東西在動……是當年的魔像哨兵。不打倒牠們，我沒辦法調查。」'],
});
Object.assign(COM_THANKS, { c51: '羊都敢出來吃草了！謝謝你！', c52: '這下藥草能採了。碧溪谷的人會很高興的。', c53: '這下終於能專心畫畫了。畫好了送你一張！', c54: '太好了！……這座城的城主，聽說戴著一頂火紅的小王冠。' });
for (const id in NEW15) { const [name, [lo, hi], L, night, [theme, music, bg], [pm, px, py, ax, ay], [tx, ty], [rx, ry]] = NEW15[id];
  const table = L.map((sp, i) => [sp, lo, hi, [40, 35, 25][i]]); if (night) { const r = [night, lo, hi, 0]; r.night12 = 1; table.push(r); }
  const [nid, nx, ny, nlook, nname] = NEW_NPC15[id];
  MAPS[id] = { name, music, outdoor: 1, border: 'T', battleBg: bg, popup: 1, ...(theme ? { theme } : {}), rows: NEW_ROWS15[id], type: '野外',
    signs: {}, npcs: [{ id: 'trailBack_' + id, x: tx, y: ty, dir: 'up', look: 'trail15', name: '往' + MAPS[pm].name + '的小路' }, { id: nid, x: nx, y: ny, dir: 'down', look: nlook, name: nname }],
    items: NEW_ITEMS15[id].map(([k, n], i) => { const [x, y] = NEW_ITEMXY15[id][i], o = { id: id + '_i' + i, x, y }; if (!k) o.gold = n; else if (GEAR[k]) { o.item = k; o.q = n; } else { o.item = k; o.n = n; } return o; }),
    gathers: [], encounters: [{ y0: 0, y1: 999, rate: 0.08, table }] };
  MAPS[id].gearPool = (MAPS[pm].gearPool || []).slice();
  MAPS[pm].npcs.push({ id: 'trail_' + id, x: px, y: py, dir: 'down', look: 'trail15', name: '往' + name + '的小路' }); if (typeof mapCache !== 'undefined') delete mapCache[pm];
  Events['trail_' + id] = function* (ow) { if (yield* yesNo('往「' + name + '」的小路。（魔物 Lv' + lo + '〜' + hi + '）\n要過去嗎？')) yield* ow.warp(id, rx, ry, 'up'); };
  Events['trailBack_' + id] = function* (ow) { if (yield* yesNo('往' + MAPS[pm].name + '的小路。要回去嗎？')) yield* ow.warp(pm, ax, ay, 'down'); };
  if (typeof MAP_TYPES !== 'undefined') MAP_TYPES[id] = '野外'; EXPLORE[id] = name;
  if (typeof NPC_WHERE !== 'undefined') { NPC_WHERE[nid] = name; NPC_WHERE['trail_' + id] = MAPS[pm].name; }
  (NPC_ROLES.任務 || []).push(nid); (NPC_ROLES.事件 || NPC_ROLES.情報 || []).push('trail_' + id, 'trailBack_' + id);
  MAP3_15[id] = [lo, hi, L.slice()]; }
{ const _mg = mapGraph; let done = null; mapGraph = function () { const G = _mg(); if (G === done) return G; done = G;
    for (const id in NEW15) { const [, , , , , [pm, px, py, ax, ay], [tx, ty]] = NEW15[id];
      (G[pm] = G[pm] || {})[id] = { x: px, y: py, npc: 'trail_' + id }; (G[id] = G[id] || {})[pm] = { x: tx, y: ty, npc: 'trailBack_' + id }; } return G; }; }
if (typeof MAP_G !== 'undefined') MAP_G = null;
if (typeof SPK_INDEX !== 'undefined') SPK_INDEX = null;
// 異色 rares and the 異色 accessory of each new map
Object.assign(IRO_LOOK15, { bird: ['金', 274], meadowWolf: ['蒼', 33], fluffSeed: ['紫', 36], mistSnail: ['翠', 311], frog: ['金', 310], mireFly: ['緋', 189],
  plainsHawk: ['蒼', 15], windSprite: ['櫻', 130], fox: ['紫', 23], magmaSlime: ['蒼', 68], blazeSpirit: ['翠', 1], sentinel: ['金', 315] });
const NEW_IROACC15 = { meadow15: ['牧草虹鈴', ['spe', 'spa'], 'meditate'], marsh15: ['霧沼虹珠', ['spa', 'spd'], 'manaSiphon'], highland15: ['高原虹羽', ['atk', 'spe'], 'hunter'], emberRuin15: ['古城虹焰', ['atk', 'spa'], 'lastStand'] };
for (const m in NEW15) { const [lo, hi, L] = MAP3_15[m], keys = [];
  for (const b of L) { const k = 'iro_' + b; if (IRO15[k] || iroMake15(k, b, m, lo)) keys.push(k); } IRO_OF_MAP15[m] = keys; MAPS[m].rares15 = keys.map(k => [k, lo, hi]); MAPS[m].rare = MAPS[m].rares15[0] || null;
  const [n, [a, b], tr] = NEW_IROACC15[m], t = iroAccT15(lo), B = IRO_ACCB15[t], k = 'iroAcc_' + m;
  GEAR[k] = { n, slot: 'acc', t, st: { hp: Math.round(B * 0.8), [a]: Math.round(B * 0.3), [b]: Math.round(B * 0.22) }, sp: {}, fx: [tr], trait: tr, kind: '飾品', d: MAPS[m].name + '的異色魔物身上的虹色小東西。（' + MAPS[m].name + '的異色魔物掉落）', look: (GEAR.qHeroCrest || {}).look, iro15: m };
  if (ACC_TRAIT[tr] && ACC_TRAIT[tr][2] && !ACC_TRAIT[tr][2].includes(n)) ACC_TRAIT[tr][2].push(n); if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); }
ACHIEVEMENTS.push({ id: 'trail15', n: '小路的盡頭', d: '走過風鈴牧草地、霧沼小徑、風之高原、餘燼古城四張地圖。', cat: '探索', ok: st => !!(st.vis && ['meadow15', 'marsh15', 'highland15', 'emberRuin15'].every(m => st.vis[m])) },
  { id: 'trail15b', n: '藏起來的寶物', d: '找到四張小路地圖裡藏起來的飾品。', cat: '探索', ok: st => ['meadow15_i4', 'marsh15_i4', 'highland15_i4', 'emberRuin15_i4'].every(k => (st.flags || {})[k]) });
