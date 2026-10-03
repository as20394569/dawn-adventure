/* ===================== v8.1 chapter 2 「北境之路」: story and growth walk together from Lv17 to Lv23 =====================
   Player request (v8 follow-up): chapter 2 should also lead the hero through areas whose monsters match the level,
   with a region boss at the end of each step, instead of jumping from the 古岩魔像 (Lv17) straight to the Lv22–25
   北方街道. The royal summons now sends the hero through two new maps first:
     【新】楓紅關道 (Lv17–20, region boss 楓林鹿王 Lv20) → 【新】古戰場 (Lv20–23, region boss 亡靈戰將 Lv23) → 北方街道
   A recurring character, 鐵斧格倫 (the chapter-1 mine boss), now guards the pass; the black crystals from chapter 1 lead
   to a "black-robed buyer from the capital" (a first hint of 宰相維克托). Older saves that already took the summons keep
   the old coach route; the new maps are extra content for them (the coach and the south end of 北方街道 lead there).
   Every chapter-2 step in the quest log now shows a recommended level. */

/* ---------- monsters ---------- */
Object.assign(MOVES, {
  m_mapleStorm: { n: '紅葉風暴', t: '飛', cat: '特', pow: 85, acc: 100, pp: 5, charge: 1, chargeMsg: '仰天長嘯，整片楓林的紅葉都捲了起來！', warn: '（紅葉風暴要來了！先防禦！）', d: '捲起整片楓林的大技。' },
  m_crystalHorn: { n: '晶角突刺', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, d: '用嵌著黑色結晶的鹿角刺過來。' },
  m_legionCharge: { n: '亡軍突擊', t: '一般', cat: '物', pow: 90, acc: 100, pp: 5, charge: 1, chargeMsg: '舉起斷掉的軍旗……四周的亡靈士兵一起吶喊了起來！', warn: '（亡軍要衝過來了！先防禦！）', d: '率領亡靈大軍的衝鋒。' },
});
for (const [k, fx, c] of [['m_mapleStorm', 'm_featherStorm', 'charge'], ['m_crystalHorn', 'm_hornCharge', 'strike'], ['m_legionCharge', 'm_spearRush', 'charge']]) {
  Object.assign(MOVES[k], { cls: c, fx, foe: 1 }); (MON_CLASS[c] || (MON_CLASS[c] = [])).push(k);
}
ITEMS.stagHorn = { n: '赤鹿角', mat: 1, price: 0, sell: 120, cat: '魔物素材', d: '楓紅關道的赤角鹿換下來的角。又輕又硬，適合做長槍和護具。' };
for (const k of ['azureSpear', 'scaleSpear', 'rockAxe', 'wolfHood', 'crescentAxe']) if (GEAR_RECIPE[k]) GEAR_RECIPE[k].mats = { ...GEAR_RECIPE[k].mats, stagHorn: 2 };
// [key, name, family, level, role, moves, material, placeholder look [base, hue, sat, light], dex, extra]
const CH2P_MON = [
  ['mapleSprite', '楓葉精', 'spirit', 18, 'mage', ['m_leafDart', 'm_whirlwind', 'm_sleepPollen', 'm_flicker'], 'leaf', ['moonSprite', 170, 1.1, 1.0], '秋天的楓葉聚成的小精靈。被黑色結晶的氣息吵醒，脾氣變得很壞。'],
  ['crimsonStag', '赤角鹿', 'beast', 18, 'fast', ['m_hornCharge', 'm_rend', 'm_pounce', 'm_howl'], 'stagHorn', ['fox', -10, 0.8, 0.85], '在關道的楓林裡成群奔跑的紅鹿。受到驚嚇就會低頭衝過來。'],
  ['barkBeetle', '樹皮甲蟲', 'insect', 19, 'tank', ['m_hornCharge', 'm_carapace', 'm_rootCrush', 'm_needleSpray'], 'beetleShell', ['thunderBeetle', -60, 0.6, 0.8], '背殼長得像樹皮的大甲蟲。停在樹幹上就完全看不出來。'],
  ['stagLord', '楓林鹿王', 'beast', 20, 'bal', ['m_hornBash', 'm_mapleStorm', 'm_crystalHorn', 'm_howl'], 'stagHorn', ['rockRhino', -20, 0.9, 0.95], '守護楓紅關道的老鹿王。盜賊把一塊黑色結晶打進了牠的角裡。', { elite: 1, drop: 'azureSpear' }],
  ['fallenSoldier', '亡國兵', 'undead', 21, 'phys', ['m_spearThrust', 'm_boneShield', 'm_deathCry', 'm_boneClub'], 'boneShard', ['skeleton', 200, 0.5, 0.8], '五百年前曙光軍的士兵。被埋進土裡的黑色結晶叫醒，又拿起了生鏽的長槍。'],
  ['battleWisp', '戰場鬼火', 'spirit', 21, 'mage', ['m_wispFlame', 'm_ghostFire', 'm_hex', 'm_soulSip'], 'wispFlame', ['marshWisp', -40, 1.1, 1.0], '在古戰場上飄來飄去的藍色鬼火。據說是戰死者沒說完的話。'],
  ['carrionVulture', '腐鴉禿鷹', 'bird', 22, 'fast', ['m_talonDive', 'm_galeWing', 'm_screech', 'm_plagueBite'], 'feather', ['harpy', 180, 0.4, 0.7], '在古戰場上空盤旋的禿鷹。專挑受傷的旅人下手。'],
  ['wraithGeneral', '亡靈戰將', 'undead', 23, 'bal', ['m_darkSlash', 'm_deathCry', 'm_boneShield', 'm_legionCharge'], 'boneShard', ['boneKnight', 240, 0.6, 0.85], '曙光軍的將軍。五百年來一直守著北方的關口，卻被黑色結晶染黑了靈魂。', { elite: 1, drop: 'graveBlade' }],
];
for (const [k, n, fam, lv, role, moves, mat, look, dex, ex = {}] of CH2P_MON) {
  const kind = ex.elite ? 'elite' : 'wild', R = CH2_ROLE[role];
  SPECIES[k] = { n, fam, base: R.map(v => Math.round(v * 60)), exp: kind === 'elite' ? 90 + 5 * lv : 45 + 3 * lv, gold: kind === 'wild' ? Math.round(lv * 1.6) : 0, learn: moves.map((m, i) => [kind === 'wild' && i === 3 ? lv + 1 : 1, m]), dex, mat, ...ex };
  MON_PANEL[k] = ch1Panel(lv, role, kind);
  const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF_PENDING[k] = b; HD_RIG_OF[k] = b;
  if (ART[b]) ART[k] = artRecolor(ART[b], dh, ks, kl);
  CH2_KEYS.add(k);
}
// tuned with tools/v131.js to the v8.1 targets (wild ≈ 2.5 turns / 8 hits, region boss ≈ 6 turns / 5.5 hits)
for (const [k, h, a] of [['mapleSprite', 1, 0.55], ['crimsonStag', 1, 0.8], ['barkBeetle', 0.62, 0.8], ['stagLord', 0.9, 0.82], ['fallenSoldier', 0.31, 0.81], ['battleWisp', 0.45, 0.65], ['carrionVulture', 0.5, 0.85], ['wraithGeneral', 0.36, 1]]) {
  const P = MON_PANEL[k]; P.hp = Math.max(1, Math.round(P.hp * h)); if (a !== 1) { P.atk = Math.max(1, Math.round(P.atk * a)); P.spa = Math.max(1, Math.round(P.spa * a)); } }
LOOT.stagLord = ['azureSpear', 'scaleSpear', 'rockAxe', 'wolfHood'];
LOOT.wraithGeneral = ['graveBlade', 'boneSaber', 'rustMail', 'crescentAxe'];
Object.assign(ELITE_TEXT, {
  stagLord: ['（巨大的鹿王低下頭，角上的黑色結晶發出不祥的光……）', '楓林鹿王擋住了關道！'],
  wraithGeneral: ['「……曙光軍……在此……」', '「此關……不許……任何人……通過……！」'],
});

/* ---------- items ---------- */
Object.assign(ITEMS, {
  blackOrder: { n: '黑袍人的收購單', key: 1, price: 0, sell: 0, cat: '重要物品', d: '盜賊身上找到的紙。「瘴氣結晶，一塊一百金幣。埋進北方古戰場者，另有重賞。」蓋著一個看不清的封蠟。' },
  heroBanner: { n: '曙光軍的戰旗', key: 1, price: 0, sell: 0, cat: '重要物品', d: '亡靈戰將守了五百年的戰旗碎片。上面繡著和你手上一樣的紋章。' },
});
GEAR.qGrenBand = { n: '格倫的護腕', slot: 'acc', t: 4, st: { atk: 6, def: 5, hp: 10 }, sp: {}, fx: [], kind: '飾品', d: '鐵斧格倫年輕時戴的皮護腕。「……別弄丟了，小鬼。」（劇情的獨家報酬）' };
BP_RARE.add('qGrenBand'); GEAR_RECIPE.qGrenBand = { mats: { stagHorn: 2, boneShard: 2 }, gold: 1200 };

/* ---------- maps ---------- */
MAPS.maplePass = {
  name: '楓紅關道', music: 'route', outdoor: 1, border: 'T', battleBg: 'forest', theme: 'autumn', popup: 1, type: '野外',
  rows: [
    "TTTTTTTTTTT:TTTTTTTTTTTT", "TTTTTTTTTTT:TTTTTTTTTTTT", "TTTTTTTT...::...TTTTTTTT", "TTTTTT..o..::..y..TTTTTT", "TTTTT......::.......TTTT", "TTTT##.....::.....##TTTT",
    "TTTLLLLLL..::..LLLLLLTTT", "TT..###....::.......##TT", "TT.#####...::.....####TT", "TT.#####..T::T....####TT", "TT..###...T::T.....##.TT", "TT........f::..........T",
    "TT.,,......::::::::....T", "TT.,,..###.......::..#.T", "TTo...#####......::.###T", "TT....#####..o...::.###T", "TT.....###.......::....T", "TT::::::::::::::::::...T",
    "TT:.......TT.........#.T", "TT:.###...TT..###...###T", "TT:#####......#####.##.T", "TT:.###...y....###.....T", "TT:.......FFFF.........T", "TT:..o....F..F....###..T",
    "TT:::::::::..:::::####.T", "TT..###.....::...:##...T", "TT.#####....::...:....fT", "TT.#####..TT::...:.o...T", "TT..###...TT::.S.:.....T", "TT..........::::::...TTT",
    "TTTT........::......TTTT", "TTTTTT......::.....TTTTT", "TTTTTTTT....::....TTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTT",
  ],
  edgeWarps: [{ dir: 'up', at: [11], to: ['oldField', 11, 32, 'up'] }],
  signs: { '15,28': '「楓紅關道」\n通往北方街道的山路。驛站就在前面。\n（魔物Lv17〜20）' },
  npcs: [
    { id: 'coachM', x: 14, y: 32, dir: 'left', look: 'coachman', name: '馬車夫' },
    { id: 'grenPass', x: 11, y: 23, dir: 'down', look: 'guard', name: '鐵斧格倫', show: st => !(st.flags.grenTrust && (st.flags.passQ || 0) >= 2) },
  ],
  triggers: [...[9, 10, 11, 12, 13, 14].map(x => ({ x, y: 6, id: 'passCamp' })), ...[9, 10, 11, 12, 13, 14].map(x => ({ x, y: 4, id: 'passTop' }))],
  elites: [{ id: 'stagLord', sp: 'stagLord', lv: 20, x: 11, y: 1, dir: 'down', sight: 2 }],
  items: [{ id: 'mp1', x: 6, y: 3, item: 'superPotion', n: 2 }, { id: 'mp2', x: 22, y: 11, gold: 2000 }, { id: 'mp3', x: 2, y: 13, item: 'scaleSpear', q: 2 }, { id: 'mp4', x: 22, y: 16, item: 'dexFruit' }, { id: 'mp5', x: 3, y: 29, item: 'hiEther', n: 2 }],
  gathers: [{ id: 'gmp1', x: 3, y: 26, mat: 'leaf' }, { id: 'gmp2', x: 20, y: 21, mat: 'herb' }, { id: 'gmp3', x: 9, y: 3, mat: 'manaHerb' }],
  gearPool: ['scaleSpear', 'rockAxe', 'wolfHood', 'chiFist', 'moonLyre', 'gearRepeater', 'lakeStaff'],
  encounters: [
    { y0: 0, y1: 16, rate: 0.1, table: [['mapleSprite', 19, 20, 30], ['crimsonStag', 19, 20, 35], ['barkBeetle', 19, 20, 35]] },
    { y0: 17, y1: 99, rate: 0.1, table: [['mapleSprite', 17, 18, 35], ['crimsonStag', 17, 18, 40], ['barkBeetle', 17, 18, 25]] },
  ],
};
MAPS.oldField = {
  name: '古戰場', music: 'ruins', outdoor: 1, border: 'T', battleBg: 'ruins', theme: 'canyon', popup: 1, type: '野外',
  rows: [
    "TTTTTTTTTTT:TTTTTTTTTTTT", "TTTTTTTTTTT:TTTTTTTTTTTT", "TTTTTTTTb..::..bTTTTTTTT", "TTTTTT.....::.....TTTTTT", "TTTTT..o...::...o..TTTTT", "TTTT...###.::.###...TTTT",
    "TTTT..#####::#####..TTTT", "TTT....###.::.###....TTT", "TTT.b......::......b.TTT", "TT...TTT...::...TTT...TT", "TT..TTTTT..::..TTTTT..TT", "TT..TTTTT..::..TTTTT..TT",
    "TT...TTT...::...TTT...TT", "TT.###.....::.....###.TT", "TT#####..::::::..#####TT", "TT.###...:.b..:...###.TT", "TT.......:....:.......TT", "TT..o....::::::....o..TT",
    "TT...###...::...###...TT", "TT..#####..::..#####..TT", "TT..#####..::..#####..TT", "TT...###...::...###...TT", "TT.........::.........TT", "TTb..TT....::....TT..bTT",
    "TT...TT.S..::....TT...TT", "TT.###.....::.....###.TT", "TT#####....::....#####TT", "TT.###.....::.....###.TT", "TT.........::.........TT", "TTTT.......::.......TTTT",
    "TTTTTT.....::.....TTTTTT", "TTTTTTTT...::...TTTTTTTT", "TTTTTTTTTT.::.TTTTTTTTTT", "TTTTTTTTTTT::TTTTTTTTTTT",
  ],
  edgeWarps: [{ dir: 'up', at: [11], to: ['northRoad', 10, 38, 'up'] }, { dir: 'down', at: [11, 12], to: ['maplePass', 11, 2, 'down'] }],
  signs: { '8,24': '「古戰場」\n五百年前，曙光軍在這裡擋住了黯滅之王的大軍。\n（魔物Lv20〜23）' },
  npcs: [
    { id: 'grenCamp', x: 3, y: 22, dir: 'right', look: 'guard', name: '鐵斧格倫', show: st => st.flags.grenTrust && (st.flags.passQ || 0) === 2 },
    { id: 'fieldGrave1', x: 4, y: 15, dir: 'down', look: 'miasma', name: '被翻開的墳', show: st => !st.flags.wraithGeneral },
    { id: 'fieldGrave2', x: 19, y: 15, dir: 'down', look: 'miasma', name: '被翻開的墳', show: st => !st.flags.wraithGeneral },
    { id: 'fieldBanner', x: 11, y: 16, dir: 'down', look: 'altar', name: '斷掉的軍旗' },
  ],
  triggers: [...[8, 9, 10, 11, 12, 13, 14, 15].map(x => ({ x, y: 31, id: 'fieldEnter' })), ...[9, 10, 11, 12, 13, 14].map(x => ({ x, y: 17, id: 'fieldAmbush' })), ...[9, 10, 11, 12, 13, 14].map(x => ({ x, y: 5, id: 'fieldTop' }))],
  elites: [{ id: 'wraithGeneral', sp: 'wraithGeneral', lv: 23, x: 11, y: 1, dir: 'down', sight: 2 }],
  items: [{ id: 'of1', x: 7, y: 3, item: 'megaPotion' }, { id: 'of2', x: 20, y: 8, gold: 2500 }, { id: 'of3', x: 2, y: 28, item: 'hiEther', n: 2 }, { id: 'of4', x: 21, y: 16, item: 'wolfHood', q: 2 }, { id: 'of5', x: 3, y: 8, item: 'vitFruit' }],
  gathers: [{ id: 'gof1', x: 20, y: 22, mat: 'herb' }, { id: 'gof2', x: 5, y: 17, mat: 'stone' }],
  gearPool: ['boneSaber', 'rustMail', 'crescentAxe', 'wolfFang2', 'windStaff', 'tigerClaw', 'windHorn'],
  encounters: [
    { y0: 0, y1: 16, rate: 0.1, table: [['fallenSoldier', 22, 23, 35], ['battleWisp', 22, 23, 30], ['carrionVulture', 22, 23, 35]] },
    { y0: 17, y1: 99, rate: 0.1, table: [['fallenSoldier', 20, 21, 40], ['battleWisp', 20, 21, 30], ['carrionVulture', 20, 21, 30]] },
  ],
};
Object.assign(MAP_TYPES, { maplePass: '野外', oldField: '野外' });
// 北方街道's south end now continues to 古戰場
{ const R = MAPS.northRoad, y = R.rows.length - 1; R.rows[y] = R.rows[y].slice(0, 10) + '::' + R.rows[y].slice(12);
  R.edgeWarps.push({ dir: 'down', at: [10, 11], to: ['oldField', 11, 1, 'down'] }); delete mapCache.northRoad; }
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { grenPass: '楓紅關道', grenCamp: '古戰場' });
(NPC_ROLES.任務 || (NPC_ROLES.任務 = [])).push('grenPass', 'grenCamp');
NPC_ROLES.情報.push('coachM');
(NPC_ROLES.情報 || (NPC_ROLES.情報 = [])).push('fieldGrave1', 'fieldGrave2', 'fieldBanner');

/* ---------- story ---------- */
const v81Gate = st => !!(st.flags.v81 && !st.flags.passDone);
Events.royalKnight = function* (ow) {
  const st = Game.st, f = st.flags;
  yield* sayAll(['你就是打倒古岩魔像的「異界之人」嗎？', '我是王國騎士團的傳令兵。國王陛下有令——', '「北方的封印正在減弱，影子在北境的要塞裡蠢動。」', '「召集曙光之印的持有者，前往王都艾爾德蘭。」',
    '……你手上的紋章，就是曙光之印吧？和古書上畫的一模一樣。']);
  st.bag.royalSummons = 1; f.ch2 = 1; f.v81 = 1; f.passQ = 1; yield* itemGet(st.name + '收下了「王都的召集令」！');
  yield* sayAll(['……不過，有件麻煩事。', '往北方街道的路上有一段「楓紅關道」。上個禮拜，關道的驛站被一群盜賊燒了，馬車過不去。', '聽說他們在收集一種黑色的石頭……馬車只能先送你到關道口。',
    '關道和再過去的古戰場，魔物都比這一帶強。準備好再出發吧。（建議Lv17以上）']);
  yield* say('馬車夫在村長家旁邊等你。我先回王都覆命了！'); ow.load('town', ow.p.x, ow.p.y, ow.p.dir, true); saveGame();
};
ch2Coach = function* (ow, here) {
  const st = Game.st, f = st.flags, opt = [], gate = v81Gate(st);
  if (here !== 'town') opt.push(['萌芽鎮', 'town', 19, 6]);
  if (here !== 'maplePass' && (f.ch2 || 0) >= 1) opt.push(['楓紅關道' + (gate ? '（關道口）' : ''), 'maplePass', 12, 32]);
  if (here !== 'northRoad' && !gate) opt.push(['北方街道', 'northRoad', 10, 37]);
  if (here !== 'capital' && (st.vis || {}).capital) opt.push(['王都艾爾德蘭', 'capital', 5, 27]);
  if (here !== 'frostVillage' && (st.vis || {}).frostVillage) opt.push(['霜語村', 'frostVillage', 2, 13]);
  const r = yield* ask('要去哪裡呢？（車資 200 G）', opt.map(o => o[0]).concat(['不用了']));
  if (r < 0 || r >= opt.length) return; if (st.money < 200) { yield* say('哎呀，車資不夠呢。'); return; }
  st.money -= 200; const [, m, x, y] = opt[r]; Sound.sfx('run'); yield* fadeOut(20); ow.load(m, x, y, m === 'maplePass' ? 'up' : 'down'); yield* wait(10); yield* fadeIn(20);
  if (m === 'maplePass' && !f.passIn) yield* passIntro(ow);
};
{ const _ct = Events.coachT; Events.coachT = function* (ow) { if (!v81Gate(Game.st)) return yield* _ct.call(this, ow); yield* say('往北方街道的關道被封住了……只能先送你到楓紅關道口。'); yield* ch2Coach(ow, 'town'); }; }
Events.coachM = function* (ow) { yield* say(v81Gate(Game.st) ? '我在這裡等你。關道通了的話，就能直接送你去北方街道了。' : '要去哪裡呢？'); yield* ch2Coach(ow, 'maplePass'); };
function* passIntro(ow) {
  const st = Game.st, f = st.flags; f.passIn = 1; if (!f.passQ) f.passQ = 1; yield* wait(10);
  yield* sayAll(['楓紅關道。滿山的楓葉紅得像火一樣。', '……不，前面真的有煙。是驛站的方向。']);
  yield* say('（目標：到驛站看看發生了什麼事。）');
}
Object.assign(Events, {
  *grenPass(ow) {
    const st = Game.st, f = st.flags;
    if (!f.grenMet) {
      f.grenMet = 1; if (!f.passQ) f.passQ = 1; const n = npcOf(ow, 'grenPass'); if (n) { Sound.sfx('exclaim'); n.excl = 30; } yield* wait(20);
      yield* sayAll(['？？？：「……喂，站住。」', '格倫：「……又是你啊。在礦坑把我打趴的那個小鬼。」', '格倫：「別緊張。我已經洗手不幹了。現在在驛站幫忙守關道——至少到上禮拜為止是這樣。」',
        '格倫：「我以前的手下，有一半跟了一個穿黑袍的傢伙。那傢伙出大錢收購黑色結晶，碧溪谷那邊挖石頭的，也是他們。」', '格倫：「他們把驛站燒了，在上面的斷崖紮營，把關道封了起來。」',
        '格倫：「更糟的是，山頂的老鹿王也被那種石頭弄瘋了，誰靠近就撞誰。」', '格倫：「……我一個人對付不了。你要上去的話，我可以幫你。」']);
      const r = yield* ask('要怎麼做？', ['相信你，一起行動', '我自己去就好']);
      f.grenTrust = r === 0 ? 1 : 0;
      if (r === 0) yield* sayAll(['格倫：「哼，你這小鬼倒是爽快。」', '格倫：「我先抄小路去古戰場那邊探路，在那裡紮營等你。受傷了就來找我。」', '格倫：「斷崖上的營地和山頂的鹿王——就交給你了。」']);
      else yield* sayAll(['格倫：「……也是。換作是我，也不會相信一個盜賊。」', '格倫：「我就在驛站這裡。累了就回來喝口水吧。」']);
      yield* say('（目標：趕走斷崖上的盜賊，通過楓紅關道。推薦Lv17〜20）'); return;
    }
    yield* say(f.grenNorth ? '格倫：「驛站重新蓋起來了。累了就來喝碗熱湯吧，勇者。」' : (f.passQ || 0) >= 2 ? '格倫：「鹿王安靜下來了……謝啦，小鬼。」' : '格倫：「驛站燒掉了，不過井水還能喝。休息一下吧。」');
    yield* healRitual('喝了口井水，在驛站的屋簷下休息了一下，體力完全恢復了！');
  },
  passCamp(ow) {
    const st = Game.st, f = st.flags; if (f.passCamp) return null;
    return (function* () {
      f.passCamp = 1; Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(20);
      yield* sayAll(['斷崖上搭著幾頂帳篷，營火旁堆滿了黑色的石塊。', '盜賊：「喂！誰讓你上來的！」', '盜賊：「看到了就別想走——把他解決掉！」']);
      for (let i = 0; i < 2; i++) { const res = yield* ow.battleScript({ sp: 'bandit', lv: 19 + i, kind: 'wild', pack: [i + 1, 2] }); if (res !== 'win') { f.passCamp = 0; return; } }
      yield* sayAll(['盜賊：「可、可惡……！黑袍大人不會放過你的……！」', '盜賊們丟下營地逃走了。帳篷裡留著一張紙……']);
      st.bag.blackOrder = 1; yield* itemGet('得到了「黑袍人的收購單」！');
      yield* sayAll(['「瘴氣結晶，一塊一百金幣。埋進北方古戰場者，另有重賞。」', '……紙的最下面蓋著一個封蠟。圖案被刮掉了，只看得出是一頂王冠的形狀。']);
      yield* say('（把結晶埋進古戰場……？先解決山頂的鹿王，再去古戰場看看吧。）');
    })();
  },
  passTop(ow) {
    const st = Game.st, f = st.flags; if (f.passTop || f.stagLord) return null;
    return (function* () {
      f.passTop = 1; yield* wait(10); ow.shake = 12; Sound.sfx('quake'); yield* wait(16);
      yield* sayAll(['關道的最高處，一頭巨大的鹿擋在路中間。', '牠的角上嵌著一塊黑色結晶，每呼吸一次，紅葉就在牠身邊捲起一陣旋風……']);
    })();
  },
  *eliteWin_stagLord(ow) {
    const st = Game.st, f = st.flags; if ((f.passQ || 0) >= 2) return;
    Sound.sfx('rock'); yield* sayAll(['鹿王跪了下來。角上的黑色結晶裂成了碎片。', '牠的眼睛慢慢恢復了清澈……看了你一眼，轉身走進了楓林深處。']);
    f.passQ = 2; st.money += 1500; st.bag.superPotion = (st.bag.superPotion || 0) + 2; yield* itemGet('得到了1500 G和好傷藥×2！');
    yield* say(f.grenTrust ? '（格倫說他在前面的古戰場紮營。往北走吧。）' : '（關道通了。再往北就是古戰場。）');
    yield* say('（目標：穿過古戰場，前往北方街道。推薦Lv20〜23）');
  },
  fieldEnter(ow) {
    const st = Game.st, f = st.flags; if (f.fieldIn) return null;
    return (function* () {
      f.fieldIn = 1; if ((f.passQ || 0) < 2) f.passQ = 2; yield* wait(10);
      yield* sayAll(['古戰場。一望無際的荒地上，插滿了生鏽的長槍和斷掉的旗子。', '……到處都是被翻開的墳。黑色的霧從土裡一陣一陣地冒出來。']);
      if (f.grenTrust) yield* say('（西邊有營火的光。是格倫嗎？）');
      yield* say('（目標：穿過古戰場，前往北方街道。）');
    })();
  },
  *grenCamp() {
    const st = Game.st, f = st.flags;
    if (!f.grenCamp1) { f.grenCamp1 = 1; yield* sayAll(['格倫：「來了啊。……你看到那些墳了吧。」', '格倫：「那群蠢蛋真的把結晶埋進來了。五百年前的死人，全都爬起來了。」', '格倫：「北邊關口那裡有個特別大的傢伙……穿著將軍的鎧甲。不打倒它，誰都過不去。」']); }
    else yield* say('格倫：「坐下來烤烤火吧。這地方冷得要命。」');
    yield* healRitual('在營火旁休息了一下，體力完全恢復了！');
  },
  fieldAmbush(ow) {
    const st = Game.st, f = st.flags; if (f.fieldAmbush || f.wraithGeneral) return null;
    return (function* () {
      f.fieldAmbush = 1; ow.shake = 10; Sound.sfx('quake'); yield* wait(16);
      yield* say('斷掉的軍旗旁邊，地面突然隆起——兩個拿著長槍的骷髏爬了出來！');
      for (let i = 0; i < 2; i++) { const res = yield* ow.battleScript({ sp: 'fallenSoldier', lv: 21 + i, kind: 'wild', pack: [i + 1, 2] }); if (res !== 'win') { f.fieldAmbush = 0; return; } }
      yield* sayAll(['骷髏倒下之後，土裡露出了一塊黑色結晶。', '（……就是這個讓死者醒過來的。源頭應該在北邊的關口。）']);
    })();
  },
  fieldTop(ow) {
    const st = Game.st, f = st.flags; if (f.fieldTop || f.wraithGeneral) return null;
    return (function* () {
      f.fieldTop = 1; yield* wait(10);
      yield* sayAll(['北邊的關口前，站著一個穿著破舊鎧甲的巨大身影。', '它的胸口插著一塊黑色結晶，手上握著一面斷掉的軍旗。']);
      ow.shake = 14; Sound.sfx('quake'); yield* wait(20); yield* say('「……曙光軍……在此……！」');
    })();
  },
  *eliteWin_wraithGeneral(ow) {
    const st = Game.st, f = st.flags; if (f.passDone) return;
    Sound.sfx('rock'); yield* sayAll(['戰將胸口的黑色結晶碎了。', '黑霧散去……留下的，是一個半透明的老將軍。']);
    yield* sayAll(['戰將：「……異界的勇者啊。五百年了……終於，又看到那個紋章了。」', '戰將：「初代的勇者，就是從這裡北上，帶著『曙光之心』去封印黯滅之王的。」',
      '戰將：「……穿黑袍的人來過這裡。他說，只要結晶夠多，就能讓封印……自己打開。」', '戰將：「小心王都裡的人……曙光之心……不能交給……」']);
    yield* say('老將軍的身影，化成了光點消失了。地上只留下一面破舊的戰旗。');
    st.bag.heroBanner = 1; yield* itemGet('得到了「曙光軍的戰旗」！');
    const r = yield* ask('要怎麼處理這面戰旗？', ['插回戰友的墓前', '帶去王都交給國王']);
    if (r === 0) { delete st.bag.heroBanner; st.boost = st.boost || {}; st.boost.str = (st.boost.str || 0) + 1; Sound.jingle('item'); yield* sayAll(['把戰旗插回了墳前。', '一陣風吹過古戰場，彷彿有很多人在說「謝謝」……']); yield* itemGet('得到了曙光軍的祝福！力量永久+1。'); }
    else { st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* sayAll(['把戰旗小心地收了起來。', '（在旗桿裡發現了一本古老的手冊……是初代勇者的戰術筆記。）']); yield* itemGet('得到了天賦之書！'); }
    if (f.grenTrust) {
      yield* sayAll(['格倫：「……結束了啊。」', '格倫：「那群蠢蛋，說是要去北邊的街道投靠一個叫『黑羽』的盜賊頭子。……我得把那群笨蛋拉回來。有需要就喊我，我會趕過去。」', '格倫：「這個給你。以前的東西，現在用不著了。」']);
      gainBP('qGrenBand', 3); Sound.jingle('item'); yield* itemGet('得到了「格倫的護腕」的設計圖和打造券！');
    } else { st.money += 2000; yield* sayAll(['回到關道的時候，格倫託馬車夫帶了一個袋子給你。', '「……謝啦，小鬼。」']); yield* itemGet('得到了格倫的謝禮2000 G！'); }
    f.passQ = 3; f.passDone = 1;
    yield* say('（北方街道就在關口的另一邊。馬車現在也能直接到北方街道了。目標：前往王都艾爾德蘭。推薦Lv22〜25）');
  },
  *fieldGrave1() { yield* say('被翻開的墳。土裡還殘留著黑色的霧……'); },
  *fieldGrave2() { yield* say('被翻開的墳。墓碑上刻著「曙光軍第三隊」。'); },
  *fieldBanner() { yield* say(Game.st.flags.wraithGeneral ? '斷掉的軍旗。風吹過來，旗子輕輕地晃了一下。' : '斷掉的軍旗。旗子上的紋章……和手上的曙光之印一模一樣。'); },
});

/* ---------- quest log: chapter 2 steps with a recommended level, plus 「北境之路」 ---------- */
{ const _ql = questList; questList = function (st = Game.st) {
    const L = _ql(st), f = st.flags, n = f.ch2 || 0, M = L.find(q => q.n === '第二章：曙光的王都');
    if (M && !M.done) {
      const rec = n === 0 ? '17' : n === 1 ? (v81Gate(st) ? null : '22〜25') : n === 3 ? '24〜28' : n === 4 ? '28〜31' : n === 5 ? (f.northPass ? '30〜34' : null) : n === 6 ? '33〜37' : n === 7 ? '37〜38' : n === 8 ? '39〜40' : null;
      if (n === 1 && v81Gate(st)) M.t = '【推薦Lv17〜23】往北方街道的關道被封鎖了。穿過楓紅關道和古戰場，前往北方街道。';
      else if (rec) M.t = '【推薦Lv' + rec + '】' + M.t;
    }
    if (f.passQ) L.push({ n: '北境之路', cat: '主線', t: f.passDone ? '完成：打倒了亡靈戰將，打通了往北方街道的路。' : f.passQ >= 2 ? '【推薦Lv20〜23】穿過古戰場，打倒守在北邊關口的亡靈戰將。' : '【推薦Lv17〜20】趕走斷崖上的盜賊，通過楓紅關道。（格倫在驛站）', done: !!f.passDone, rw: '格倫的護腕（設計圖＋打造券）或2000 G、力量+1或天賦之書' });
    return L;
  };
}
if (typeof QUEST_CATS !== 'undefined') Object.assign(QUEST_CATS, { '北境之路': '主線' });
Object.assign(STORY_MARKS, { grenPass: st => st.flags.passIn && !st.flags.grenMet ? '!' : null, grenCamp: st => !st.flags.grenCamp1 ? '!' : null });
MAPS.northRoad.signs['5,35'] = '「北方街道」\n通往王都艾爾德蘭的大道。\n（魔物Lv22〜25）\n「↓ 古戰場・楓紅關道」';
