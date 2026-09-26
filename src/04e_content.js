/* ===================== CONTENT PACK: class skills · combos · abandoned mine & bandits ===================== */
// ---- class skills (2nd skill per class, learned at class level lv2) ----
Object.assign(MOVES, {
  crossSlash: { n: '十字斬', t: '一般', cat: '物', pow: 80, acc: 95, pp: 10, crit: 1, d: '交叉兩道斬擊。容易擊中要害。' },
  chainBolt: { n: '連鎖雷', t: '雷', cat: '特', pow: 75, acc: 95, pp: 10, eff: { st: 'par', p: 20 }, d: '在對手身上來回跳躍的雷電。有時會讓對手麻痺。' },
  shieldBash: { n: '重盾衝撞', t: '一般', cat: '物', pow: 65, acc: 100, pp: 10, eff: { flinch: 1, p: 30 }, d: '用盾牌猛撞對手。有時會讓對手退縮。' },
  iaiSlash: { n: '居合一閃', t: '一般', cat: '物', pow: 90, acc: 100, pp: 5, prio: 1, crit: 1, d: '收刀、拔刀，一瞬之間。必定先出手，容易擊中要害。' },
  bloodRage: { n: '血怒', t: '一般', cat: '變', pp: 5, hpCost: 0.15, stat: { who: 'self', atk: 2, spe: 1 }, d: '燃燒自己的血。消耗15%HP，物攻大幅提升、速度提升。' },
  meteor: { n: '隕火', t: '火', cat: '特', pow: 120, acc: 85, pp: 5, eff: { st: 'brn', p: 20 }, d: '召喚燃燒的隕石砸向對手。有時會造成灼傷。' },
  skyJudge: { n: '天罰', t: '雷', cat: '特', pow: 110, acc: 90, pp: 5, eff: { st: 'par', p: 30 }, d: '從天而降的審判之雷。有時會讓對手麻痺。' },
  sanctuary: { n: '聖域', t: '一般', cat: '變', pp: 5, heal: 0.35, shield: 3, d: '展開神聖領域。恢復35%HP，並獲得3回合護盾。' },
  riftBlade: { n: '裂界斬', t: '一般', cat: '物', pow: 110, acc: 100, pp: 5, crit: 1, d: '連同空間一起斬開的一擊。' },
  axeSpin: { n: '旋風斧', t: '一般', cat: '物', pow: 120, acc: 100, pp: 5, charge: 1, chargeMsg: '高高舉起了戰斧，開始旋轉！', warn: '（下一擊非常危險……選擇「防禦」！）', d: '蓄力後揮出的旋轉巨斧。' },
});
const NEW_META = { crossSlash: ['slash', 'crossSlash'], chainBolt: ['bolt', 'chainBolt'], shieldBash: ['strike', 'shieldBash'], iaiSlash: ['slash', 'iai'], bloodRage: ['buff', 'bloodRage'], meteor: ['area', 'meteor'], skyJudge: ['area', 'skyJudge'], sanctuary: ['heal', 'sanctuary'], riftBlade: ['slash', 'riftBlade'], axeSpin: ['charge', 'axeSpin'] };
for (const k in NEW_META) { MOVES[k].cls = NEW_META[k][0]; MOVES[k].fx = NEW_META[k][1]; }
const CLASS_SKILL2 = { swordsman: ['crossSlash', 12], mage: ['chainBolt', 12], guardian: ['shieldBash', 12], swordmaster: ['iaiSlash', 18], berserker: ['bloodRage', 18], pyromancer: ['meteor', 18], stormcaller: ['skyJudge', 18], paladin: ['sanctuary', 18], otherworlder: ['riftBlade', 20] };
for (const k in CLASS_SKILL2) Object.assign(CLASSES[k], { move2: CLASS_SKILL2[k][0], lv2: CLASS_SKILL2[k][1] });

// ---- elemental combos (for the design doc & tips) ----
// 濕+雷=感電(×1.5+麻痺) · 纏+火=燎原(×1.5+灼傷) · 燒+水=蒸氣爆發(×1.3，解除灼傷)
const COMBOS = [['濕', '雷', '感電'], ['纏', '火', '燎原'], ['燒', '水', '蒸氣爆發']];
STATUS_INFO.tangle = ['纏', '#3f9a4a'];

// ---- new gear & special ----
SPECIALS.cleave = { n: '劈裂', d: '物理攻擊有30%機率讓對手物防下降1階。' };
Object.assign(GEAR, {
  minerHelm: { n: '礦工頭燈盔', slot: 'head', t: 2, st: { def: 3, spd: 2 }, sp: { hit: 5 }, d: '廢棄礦坑的礦工留下的頭盔。頭燈早就不亮了。' },
  banditHood: { n: '盜賊兜帽', slot: 'head', t: 3, st: { def: 3, spd: 3, spe: 2 }, sp: { eva: 5 }, fx: ['double'], d: '盜賊團幹部的兜帽。戴上後手腳特別靈活。' },
  grenAxe: { n: '鐵斧格倫的戰斧', slot: 'weapon', t: 3, st: { atk: 11 }, sp: { crit: 5 }, fx: ['cleave'], spr: 'ironSword', d: '盜賊頭目格倫的巨斧。據說原本是王都騎士團的制式戰斧。' },
});

// ---- bandits & mine monsters ----
function banditDef(o) {
  return { parts: sym([
    { s: 'e', x: 25, y: 57, rx: 5, ry: 6, c: o.boot, m: 1 },
    { s: 'p', pts: [[15, 60], [19, 32], [45, 32], [49, 60]], c: o.cloak, id: 'body' },
    { s: 'e', x: 32, y: 47, rx: 16, ry: 2.2, c: '#3a2614', clip: 'body', line: false },
    { s: 'e', x: 32, y: 47, rx: 2.5, ry: 2.2, c: '#d8b040', clip: 'body', line: false },
    { s: 'e', x: 14, y: 42, rx: 5, ry: 9, c: o.sleeve, m: 1 },
    { s: 'e', x: 13, y: 51, rx: 3.5, ry: 3, c: o.skin, m: 1 },
    ...(o.horns ? [{ s: 'p', pts: [[21, 18], [9, 4], [17, 20]], c: '#e8dcc0', m: 1 }] : []),
    { u: [{ s: 'e', x: 32, y: 25, rx: 13, ry: 13 }, { s: 'p', pts: [[25, 14], [32, 3], [39, 14]] }], c: o.hood, id: 'hood' },
    { s: 'e', x: 32, y: 29, rx: 8.5, ry: 7.5, c: o.skin, clip: 'hood', line: false },
    { s: 'e', x: 32, y: 35, rx: 9, ry: 3.2, c: o.mask, clip: 'hood', line: false },
    ...(o.beard ? [{ s: 'p', pts: [[24, 32], [40, 32], [37, 44], [32, 47], [27, 44]], c: o.beard }] : []),
    { s: 'p', pts: [[50, 58], [52, 58], [54, 18], [51, 18]], c: '#6a4424' },
    { s: 'p', pts: o.big ? [[44, 12], [60, 6], [63, 24], [58, 30], [50, 26]] : [[47, 14], [58, 10], [61, 22], [52, 26]], c: '#b8c0cc' },
  ]), details: symD([
    { s: 'eye', x: 28.5, y: 28, w: 1.4, h: 1.8, c: o.eye || '#202028', m: 1 },
    { s: 'line', pts: [[25, 24.5], [30, 26.5]], c: '#2a1a14', m: 1 },
    { s: 'line', pts: [[52, 14], [59, 12]], c: '#ffffff' },
  ]) };
}
ART.bandit = banditDef({ boot: '#3a2a1c', cloak: '#5a4a36', sleeve: '#6a5840', skin: '#e2b48c', hood: '#4a5a36', mask: '#8a2a2a' });
ART.banditBoss = banditDef({ boot: '#2a1a14', cloak: '#6a2a24', sleeve: '#7a3a2a', skin: '#d8a07a', hood: '#3a3440', mask: '#2a2a30', beard: '#8a4a22', horns: 1, big: 1, eye: '#e04030' });
ART.mineBat = recolorDef(ART.bird, hueShift(20, 0.5, 0.5));
ART.oreSlime = recolorDef(ART.slime, hueShift(-150, 0.35, 0.75));
Object.assign(SPECIES, {
  mineBat: { n: '坑道蝠', t: '飛', base: [50, 56, 44, 44, 44, 76], exp: 70, gold: 14, mat: 'feather', trait: 'swift', learn: [[1, 'peck'], [1, 'gust'], [1, 'quickAttack'], [12, 'sing']], dex: '倒掛在廢棄礦坑深處的蝙蝠。聽到腳步聲就會成群飛出。' },
  oreSlime: { n: '礦泥怪', t: '岩', base: [66, 48, 70, 50, 55, 30], exp: 76, gold: 16, mat: 'stone', trait: 'healer', learn: [[1, 'tackle'], [1, 'harden'], [1, 'rockThrow'], [1, 'acid']], dex: '吞下礦石的史萊姆。身體硬得像石頭，會吸收礦脈的養分回復。' },
  bandit: { n: '盜賊', t: '一般', base: [58, 62, 46, 36, 42, 64], exp: 90, gold: 30, trait: 'swift', learn: [[1, 'quickAttack'], [1, 'glare'], [1, 'scratch'], [12, 'armorBreak']], dex: '盤據在廢棄礦坑的盜賊。專挑落單的旅人和商隊下手。' },
  banditBoss: { n: '鐵斧格倫', t: '一般', base: [88, 80, 64, 40, 55, 58], exp: 260, gold: 0, boss: 1, drop: 'grenAxe', learn: [[1, 'powerSlash'], [1, 'armorBreak'], [1, 'howl'], [1, 'quickAttack']], dex: '盜賊團的頭目。揮舞巨大的戰斧，據說曾是王都的騎士。' },
});
Object.assign(MON_PANEL, {
  mineBat: { lv: 12, hp: 32, atk: 18, def: 15, spa: 15, spd: 15, spe: 24, eva: 6 },
  oreSlime: { lv: 12, hp: 38, atk: 16, def: 22, spa: 18, spd: 18, spe: 10 },
  bandit: { lv: 12, hp: 36, atk: 20, def: 16, spa: 12, spd: 15, spe: 20, crit: 10 },
  banditBoss: { lv: 15, hp: 150, atk: 26, def: 22, spa: 15, spd: 20, spe: 22, crit: 12, hit: 5 },
});
Object.assign(ELITE_TEXT, { thug1: ['喂！站住！', '看門的盜賊拔出了短刀！'], thug2: ['這條路不准過！', '盜賊擋住了去路！'] });

// ---- the abandoned mine ----
MAPS.mine = {
  name: '廢棄礦坑', music: 'ruins', border: 'R', popup: 1, battleBg: 'ruins', encAll: 1,
  rows: [
    'RRRRRRRRRRRRRRRRRR',
    'RRRRRRRsssssRRRRRR',
    'RRRRRRsssssssRRRRR',
    'RRRRRRsssssssRRRRR',
    'RRRRRRRRssRRRRRRRR',
    'RsssRRRRssRRRRsssR',
    'RsssssssssssssssoR',
    'RssoRRRRssRRRRsssR',
    'RRsRRRRRssRRRRRsRR',
    'RsssssRsssssRssssR',
    'RsmmssRssossRssmsR',
    'RssssRRRssRRRssssR',
    'RRRsRRsssssssRRsRR',
    'RsssssssoRsssssssR',
    'RssRRRRRRRRRRRRssR',
    'RssssssssssssssssR',
    'RRRRRRRRssRRRRRRRR',
    'sssssssssssRRRRRRR',
    'RRRRRRRRRRRRRRRRRR',
  ],
  edgeWarps: [{ dir: 'left', at: [17], to: ['route', 21, 29, 'left'] }],
  boss: { sp: 'banditBoss', lv: 15, x: 8, y: 2, flag: 'bandit', ev: 'banditBoss' },
  elites: [{ id: 'thug1', sp: 'bandit', lv: 13, x: 9, y: 8, dir: 'down', sight: 4, drop: 'banditHood' }, { id: 'thug2', sp: 'bandit', lv: 12, x: 3, y: 12, dir: 'down', sight: 1 }],
  items: [{ id: 'm1', x: 1, y: 5, item: 'superPotion', n: 2 }, { id: 'm2', x: 16, y: 5, gold: 600 }, { id: 'm3', x: 1, y: 10, item: 'minerHelm', q: 2 }, { id: 'm4', x: 16, y: 10, item: 'elixir' }, { id: 'm5', x: 1, y: 13, item: 'ether', n: 2 }, { id: 'm6', x: 16, y: 15, item: 'powerFruit' }],
  gathers: [{ id: 'gm1', x: 5, y: 10, mat: 'stone' }, { id: 'gm2', x: 14, y: 13, mat: 'stone' }, { id: 'gm3', x: 11, y: 3, mat: 'gel' }],
  gearPool: ['knightSword', 'guardHelm', 'minerHelm', 'chainMail', 'stoneMail', 'featherBoots', 'wolfNecklace'],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['mineBat', 11, 13, 35], ['oreSlime', 11, 13, 35], ['bandit', 11, 13, 30]] }],
};
{ // route: open the east pocket toward the mine
  const R = MAPS.route.rows; R[28] = 'TT####....::...T...STT'; R[29] = 'TT####....::..........';
  MAPS.route.edgeWarps.push({ dir: 'right', at: [29], to: ['mine', 0, 17, 'right'], need: 'mineOpen', msg: '通往東邊的小路被倒下的木頭和木板封住了。' });
  MAPS.route.signs['19,28'] = '「→ 廢棄礦坑」\n礦脈枯竭後就沒人進去了。最近常有可疑人物出入。';
}
const MINE_EVENTS = {
  banditBoss(ow) {
    const st = Game.st; if (st.flags.bandit || !ow.boss) return null;
    return (function* () {
      yield* sayAll(['「哈！又來一個不怕死的。」', '「我是『鐵斧』格倫。商隊的貨？早就是我的了！」', '「想要的話——就用命來換吧！」']);
      const res = yield* ow.battleScript({ sp: 'banditBoss', lv: 15, kind: 'boss' });
      if (res !== 'win') return;
      st.flags.bandit = 1; ow.boss = null;
      yield* sayAll(['「……可惡……你這傢伙……到底是什麼人……」', '格倫丟下一張破舊的地圖，逃進了坑道深處。']);
      st.money += 1500; st.bag.superPotion = (st.bag.superPotion || 0) + 3; yield* itemGet('奪回了商隊的貨物！得到1500 G和好傷藥×3！');
      yield* sayAll(['地圖上畫著王都的城牆……還有一個奇怪的記號：', '「異界之門・第二把鑰匙」。', st.flags.caravan === 'lost' ? '（把貨物的消息帶回萌芽鎮，道具店就能恢復進貨了。）' : '（回萌芽鎮告訴行商吧。）']);
      saveGame();
    })();
  },
};
