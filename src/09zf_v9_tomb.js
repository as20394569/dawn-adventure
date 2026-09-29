/* ===================== v9.0 new area: 初代勇者之墓 (optional, Lv23–25) =====================
   Behind a sealed stone door on the west side of 古戰場. It opens once the 亡靈戰將 is freed. Inside: undead, a rune
   guardian (菁英 Lv25) and the first hero's three notes — he was a student from another world too, and the door home
   needs "the hearts of the four generals". Reward: 初代勇者的護符 (unique accessory) and a 天賦之書. */
MAPS.heroTomb = {
  name: '初代勇者之墓', music: 'ruins', border: 'R', battleBg: 'ruins', encAll: 1, popup: 1, type: '迷宮',
  rows: [
    'RRRRRRRRRRRRRRRR', 'RRRRRRssssRRRRRR', 'RRRRRssssssRRRRR', 'RRRRRsPssPsRRRRR', 'RRRRRRRsRRRRRRRR', 'RRsssssssssssRRR',
    'RRsPsssssssPsRRR', 'RRsssmsssssssRRR', 'RRRRRRssssRRRRRR', 'RRsssssssssssRRR', 'RRsPsssssssPsRRR', 'RRsssssssmsssRRR',
    'RRRRRRssssRRRRRR', 'RRRRRRssssRRRRRR', 'XXXXXXssssXXXXXX',
  ],
  southWarp: { to: ['oldField', 3, 12, 'down'] },
  npcs: [
    { id: 'tombAltar', x: 7, y: 1, dir: 'down', look: 'altar', name: '勇者的石棺' },
  ],
  elites: [{ id: 'tombGuard', sp: 'runeGolem', lv: 25, x: 7, y: 4, dir: 'down', sight: 2 }],
  items: [{ id: 'ht1', x: 3, y: 5, item: 'megaPotion', n: 2 }, { id: 'ht2', x: 12, y: 11, item: 'elixir' }],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['fallenSoldier', 23, 24, 50], ['battleWisp', 23, 24, 50]] }],
};
MAP_TYPES.heroTomb = '迷宮';
ELITE_TEXT.tombGuard = ['（石像的眼睛亮起了藍色的光……）', '「……守護……勇者之眠……」'];
// the door on 古戰場's west side
MAPS.oldField.npcs.push({ id: 'tombDoor', x: 2, y: 12, dir: 'right', look: 'caveDoor', name: '古老的石門' }); delete mapCache.oldField;
NPC_ROLES.情報.push('tombDoor', 'tombAltar');
Events.tombDoor = function* (ow) {
  const st = Game.st, f = st.flags;
  if (!f.wraithGeneral) { yield* say('古老的石門。門上刻著和曙光之印一樣的紋章……\n（門被黑色的霧封住了。北邊的戰將，說不定知道什麼。）'); return; }
  if (!f.tombOpen) { f.tombOpen = 1; Sound.sfx('door'); yield* sayAll(['手背上的曙光之印，發出了淡淡的光。', '石門上的紋章跟著亮了起來——門，慢慢地打開了。', '（……戰將說過，初代勇者就是從這裡北上的。）']); }
  if (yield* yesNo('要進入「初代勇者之墓」嗎？（魔物Lv23〜25）')) { Sound.sfx('door'); yield* ow.warp('heroTomb', 7, 13, 'up'); }
};
// the first hero's notes (they join 世界的記載)
const TOMB_NOTES = [
  [11, 7, '勇者的手記（一）', ['「我叫——」（名字被刮掉了。）', '「我是從『那邊』來的。穿著制服，口袋裡只有一支沒電的手機。」', '「這裡的人叫我『異界之人』。每天晚上，我都在找回家的路。」']],
  [4, 10, '勇者的手記（二）', ['「門只會開一次。要再打開它，需要四將的『心』。」', '「……但那樣，就得真的打倒它們，而不只是封印。」', '「我選擇了封印。因為那時候，我已經有了想保護的人。」']],
  [12, 5, '勇者的手記（三）', ['「給下一個從門裡來的人——」', '「曙光之印會選擇你。如果你想回家，就去找四將的心。」', '「如果你想留下……也沒關係。那是你的選擇。」']],
];
for (const [x, y, t, lines] of TOMB_NOTES) { const i = LORE.length; LORE.push(['heroTomb', t, lines]); MAPS.heroTomb.npcs.push({ id: 'lore' + i, x, y, dir: 'down', look: 'loreStone', name: '記載之石' }); Events['lore' + i] = function* () { yield* readLore(i); }; NPC_ROLES.情報.push('lore' + i); }
GEAR.firstHeroCharm = { n: '初代勇者的護符', slot: 'acc', t: 5, st: { hp: 20, atk: 6, spa: 6, spd: 4 }, sp: {}, fx: [], kind: '飾品', d: '初代勇者的石棺裡找到的護符。背面刻著看不懂的文字——不，是你故鄉的文字：「平安」。' };
BP_RARE.add('firstHeroCharm');
Events.eliteWin_tombGuard = function* () { const st = Game.st; yield* say('石像碎了。石棺上的封印，跟著消失了。'); };
Events.tombAltar = function* () {
  const st = Game.st, f = st.flags;
  if (!f.tombGuard) { yield* say('刻著曙光紋章的石棺。前面的石像擋住了去路……'); return; }
  if (f.tombCharm) { yield* say('初代勇者的石棺。……好好休息吧。'); return; }
  f.tombCharm = 1; yield* sayAll(['石棺裡沒有遺骨。', '只有一個小小的護符，和一張寫著奇怪文字的紙條。', '……不，那是你故鄉的文字。上面寫著：「平安」。']);
  const g = makeGear('firstHeroCharm', 4); st.bag.tpBook = (st.bag.tpBook || 0) + 1; Sound.jingle('levelup');
  yield* itemGet('得到了' + gearName(g) + '和天賦之書！');
  yield* say('（初代勇者……最後，他回家了嗎？）');
};
STORY_MARKS.tombDoor = st => st.flags.wraithGeneral && !st.flags.tombOpen ? '!' : null;
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { tombDoor: '古戰場', tombAltar: '初代勇者之墓' });
// 北境之路 quest mentions the tomb after the general
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const f = st.flags; if (f.wraithGeneral) L.push({ n: '初代勇者之墓', t: f.tombCharm ? '完成：在石棺裡找到了初代勇者的護符。' : '古戰場西邊的石門打開了。進去看看吧。（推薦Lv23〜25）', done: !!f.tombCharm, rw: '初代勇者的護符、天賦之書、勇者的手記' }); }; }
if (typeof QUEST_CATS !== 'undefined') QUEST_CATS['初代勇者之墓'] = '支線';
// v9 tuning after the class traits / resonance / sets (probe: 霜之女王 and 時計巨像 left 85–100% HP)
for (const [k, h, a] of [['frostQueen', 1.17, 1.12], ['clockColossus', 1.15, 1.1]]) { const P = MON_PANEL[k]; P.hp = Math.round(P.hp * h); P.atk = Math.round(P.atk * a); P.spa = Math.round(P.spa * a); }
