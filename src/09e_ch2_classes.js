/* ===================== CHAPTER 2 — four new 上級職業 (tier 3, unlocked by trials, changed at the 王都冒險者公會) =====================
   吟遊詩人 bard      歌與增益：勇氣之歌・安眠曲・不協和音，增益越多「英雄終曲」越強（魔攻系）      試煉：找回失落的樂譜（地下水道）
   機工士 machinist   砲台與機關：設置砲台每回合自動射擊，全彈發射、超級大砲（物攻系）               試煉：發條×3＋黃銅齒輪×3（鐘錶師艾德）
   武僧 monk          氣：出拳累積「氣」（最多5），發勁・百裂拳・天崩拳消耗氣爆發（物攻系）          試煉：打倒雪原巨熊（雪峰寺）
   龍騎士 dragoon     跳躍：跳上天空躲開攻擊，下一回合落下重擊；龍槍對飛禽特效（物攻系）            試煉：取得龍之火種（赤焰山道） */
Object.assign(CLASSES, {
  bard: { n: '吟遊詩人', tier: 3, from: 'mage', st: { hp: 6, spa: 5, spd: 5, spe: 5, mp: 16 }, d: '用歌聲戰鬥的上級職業。勇氣之歌提升能力，增益越多，終曲越強。' },
  machinist: { n: '機工士', tier: 3, st: { hp: 8, atk: 5, def: 4, spe: 3, crit: 3 }, d: '操縱機關的上級職業。設置砲台後，砲台每回合會自動射擊。' },
  monk: { n: '武僧', tier: 3, st: { hp: 10, atk: 5, def: 3, spe: 5, crit: 3 }, d: '修練「氣」的上級職業。出拳累積氣，再用發勁、百裂拳一口氣爆發。' },
  dragoon: { n: '龍騎士', tier: 3, st: { hp: 10, atk: 6, def: 4, spe: 2, crit: 3 }, d: '與龍締結契約的上級職業。跳上天空躲開攻擊，下一回合從天而降。' },
});
Object.assign(CLASS_COL, { bard: '#ff8ad0', machinist: '#e0b050', monk: '#ff9a40', dragoon: '#ff5a4a' });
Object.assign(CLASS_STYLE, { bard: '歌聲增益', machinist: '砲台機關', monk: '集氣爆發', dragoon: '跳躍突擊' });
Object.assign(ATTR_TEMPLATE, { machinist: { str: 2, dex: 3, vit: 2, agi: 1, luk: 1 }, monk: { str: 3, agi: 3, vit: 2, dex: 1 }, dragoon: { str: 4, vit: 3, dex: 1, agi: 1 } });
for (const k of ['bard', 'machinist', 'monk', 'dragoon']) CLASSES[k].st.mp = CLASSES[k].st.mp || 12;

Object.assign(MOVES, {
  // 吟遊詩人
  soundBlast: { n: '音波衝擊', t: '一般', cat: '特', pow: 70, acc: 100, pp: 20, eff: { flinch: 1, p: 20 }, d: '把歌聲化成衝擊波。有時會讓對手退縮。' },
  battleSong: { n: '勇氣之歌', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 1, spa: 1 }, d: '振奮人心的歌。物攻和魔攻提升一級。' },
  lullabyH: { n: '安眠曲', t: '一般', cat: '變', acc: 75, pp: 10, st: 'slp', d: '溫柔的搖籃曲。讓對手睡著。（頭目也有效，但機率較低）' },
  discord: { n: '不協和音', t: '一般', cat: '變', acc: 95, pp: 10, stat: { who: 'foe', atk: -1, spa: -1 }, d: '刺耳的不協和音。降低對手的物攻和魔攻。' },
  healSong: { n: '治癒之歌', t: '一般', cat: '變', pp: 10, heal: 0.35, cure: 1, d: '療癒的旋律。恢復35%HP，並治好異常狀態。' },
  echoBlast: { n: '回音', t: '一般', cat: '特', pow: 42, acc: 100, pp: 15, hits: 2, d: '在空氣中迴盪的兩段音波。' },
  heroicFinale: { n: '英雄終曲', t: '一般', cat: '特', pow: 80, acc: 100, pp: 5, buffScale: 1, d: '獻給英雄的終曲。自己每有一級能力提升，威力就提高25%（最高2.5倍）。' },
  // 機工士
  turret: { n: '設置砲台', t: '一般', cat: '變', pp: 10, stat: null, turret: 3, d: '在身邊設置自動砲台。3回合內，每回合結束時砲台會自動射擊。（Lv越高越久、越痛）' },
  taser: { n: '電擊槍', t: '雷', cat: '物', pow: 60, acc: 100, pp: 15, eff: { st: 'par', p: 30 }, d: '射出電擊的機關槍。30%讓對手麻痺。' },
  clockBomb: { n: '發條炸彈', t: '一般', cat: '物', pow: 80, acc: 95, pp: 10, shieldHit: 2, d: '丟出會爆炸的發條炸彈。【破盾】額外削減2點護盾。' },
  steamJet: { n: '蒸汽噴射', t: '水', cat: '物', pow: 70, acc: 100, pp: 15, d: '從機關噴出高壓蒸汽。會讓對手全身濕透。' },
  overdrive: { n: '超頻運轉', t: '一般', cat: '變', pp: 10, stat: { who: 'self', spe: 2, atk: 1 }, d: '讓全身的機關全速運轉。大幅提升速度，提升物攻。' },
  repair: { n: '緊急修理', t: '一般', cat: '變', pp: 10, heal: 0.3, shield: 2, d: '用工具修補傷口和裝備。恢復30%HP，並獲得2回合護盾。' },
  fullBurst: { n: '全彈發射', t: '一般', cat: '物', pow: 26, acc: 90, pp: 10, hits: 5, d: '把所有彈藥一口氣射出的五連擊。砲台在場時每一下都會跟著射擊（威力+30%）。' },
  megaCannon: { n: '超級大砲', t: '一般', cat: '物', pow: 150, acc: 100, pp: 5, turretBoost: 1.3, d: '組裝成巨大的砲管，射出毀滅的一擊。砲台在場時威力×1.3。' },
  // 武僧
  comboPunch: { n: '連環拳', t: '一般', cat: '物', pow: 22, acc: 100, pp: 20, hits: 3, chiGain: 1, d: '快速的三連拳。累積1點氣。' },
  chiBlast: { n: '氣功波', t: '一般', cat: '特', pow: 60, acc: 100, pp: 15, chiGain: 1, d: '把氣凝聚成光彈射出。累積1點氣。' },
  ironBody: { n: '金剛身', t: '一般', cat: '變', pp: 10, stat: { who: 'self', def: 2, spd: 1 }, d: '讓身體硬如金剛。大幅提升物防，提升魔防。' },
  meditate: { n: '冥想', t: '一般', cat: '變', pp: 10, heal: 0.25, chiGain: 2, d: '調整呼吸。恢復25%HP，累積2點氣。' },
  whirlKick: { n: '旋風腿', t: '一般', cat: '物', pow: 36, acc: 100, pp: 15, hits: 2, chiGain: 1, d: '旋轉身體的兩段踢。累積1點氣。' },
  hakkei: { n: '發勁', t: '一般', cat: '物', pow: 60, acc: 100, pp: 10, chiUse: 1, d: '把氣從掌心打進對手體內。消耗全部的氣，每1點氣威力+40%。' },
  hundredFists: { n: '百裂拳', t: '一般', cat: '物', pow: 20, acc: 100, pp: 10, hits: 2, chiHits: 1, d: '看不見的拳雨。消耗全部的氣，每1點氣多打一下（最多7連擊）。' },
  heavenFist: { n: '天崩拳', t: '一般', cat: '物', pow: 110, acc: 100, pp: 5, chiUse: 0.25, chiCrit: 5, d: '武僧的奧義。消耗全部的氣，每1點氣威力+25%；氣滿5點時必定會心。' },
  // 龍騎士
  jump: { n: '跳躍', t: '一般', cat: '物', pow: 130, acc: 100, pp: 10, charge: 1, jump: 1, chargeMsg: '高高地跳上了天空！', warn: '（在空中時不會被攻擊。下一回合會從天而降！）', d: '跳上天空（這回合不會被攻擊），下一回合落下重擊。' },
  dragonLance: { n: '龍槍', t: '一般', cat: '物', pow: 75, acc: 100, pp: 15, vsFam: ['bird', 1.5], d: '刻著龍紋的槍擊。對飛禽傷害×1.5。' },
  dragonBreath: { n: '龍之吐息', t: '火', cat: '特', pow: 75, acc: 100, pp: 15, eff: { st: 'brn', p: 20 }, d: '借用契約之龍的火焰。有時會灼傷。' },
  dragonBlood: { n: '龍血覺醒', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 1, def: 1 }, regenT: 3, d: '讓龍的血在體內甦醒。提升物攻和物防，3回合內每回合恢復5%HP。' },
  pierceLance: { n: '貫穿', t: '一般', cat: '物', pow: 70, acc: 100, pp: 15, pierceDef: 0.4, d: '連鎧甲一起刺穿。無視對手40%的物防。' },
  twinDragon: { n: '雙龍突', t: '一般', cat: '物', pow: 48, acc: 100, pp: 10, hits: 2, pierceDef: 0.2, d: '兩條龍一般的連續突刺。無視對手20%的物防。' },
  dragonDive: { n: '龍神降臨', t: '一般', cat: '物', pow: 210, acc: 100, pp: 5, charge: 1, jump: 1, chargeMsg: '乘著龍的翅膀飛上了雲端！', warn: '（在空中時不會被攻擊。）', d: '龍騎士的奧義。飛上雲端（這回合不會被攻擊），下一回合化為流星落下。' },
});
const CT3_META = {
  soundBlast: ['sound', 'soundBlast', 6, ['int', 1]], battleSong: ['buff', 'battleSong', 8], lullabyH: ['debuff', 'lullabyH', 8], discord: ['debuff', 'discord', 7], healSong: ['heal', 'healSong', 12], echoBlast: ['sound', 'echoBlast', 9, ['int', 1]], heroicFinale: ['sound', 'heroicFinale', 20, ['int', 1.5]],
  turret: ['buff', 'turret', 12], taser: ['bolt', 'taser', 6, ['dex', 1]], clockBomb: ['proj', 'clockBomb', 9, ['dex', 1]], steamJet: ['area', 'steamJet', 8, ['dex', 1]], overdrive: ['buff', 'overdrive', 8], repair: ['heal', 'repair', 12], fullBurst: ['proj', 'fullBurst', 14, ['dex', 1]], megaCannon: ['proj', 'megaCannon', 24, ['dex', 1.5]],
  comboPunch: ['strike', 'comboPunch', 5, ['agi', 1]], chiBlast: ['bolt', 'chiBlast', 5, ['int', 1]], ironBody: ['guard', 'ironBody', 7], meditate: ['heal', 'meditate', 8], whirlKick: ['strike', 'whirlKick', 7, ['agi', 1]], hakkei: ['strike', 'hakkei', 10, ['str', 1]], hundredFists: ['strike', 'hundredFists', 14, ['agi', 1]], heavenFist: ['strike', 'heavenFist', 20, ['str', 1.5]],
  jump: ['pierce', 'jumpFx', 10, ['str', 1]], dragonLance: ['pierce', 'dragonLance', 7, ['str', 1]], dragonBreath: ['area', 'dragonBreath', 9, ['int', 1]], dragonBlood: ['buff', 'dragonBlood', 9], pierceLance: ['pierce', 'pierceLance', 8, ['str', 1]], twinDragon: ['pierce', 'twinDragon', 11, ['str', 1]], dragonDive: ['pierce', 'dragonDiveFx', 22, ['str', 1.5]],
};
for (const k in CT3_META) { const [c, f, mp, sc] = CT3_META[k]; Object.assign(MOVES[k], { cls: c, fx: f }); SKILL_MP[k] = mp; if (sc) MOVES[k].scale = sc; }
Object.assign(SKILL_TREES, {
  bard: [['soundBlast', 24], ['battleSong', 24], ['lullabyH', 24], ['manaBurst', 24], ['heal', 24], ['discord', 26, 'lullabyH', 1], ['barrier', 26], ['healSong', 28, 'battleSong', 1], ['echoBlast', 30, 'soundBlast', 2], ['heroicFinale', 34, 'healSong', 1]],
  machinist: [['turret', 24], ['taser', 24], ['clockBomb', 24], ['powerSlash', 24], ['focus', 24], ['steamJet', 26, 'taser', 1], ['overdrive', 26], ['repair', 28], ['fullBurst', 30, 'turret', 2], ['megaCannon', 34, 'fullBurst', 1]],
  monk: [['comboPunch', 24], ['chiBlast', 24], ['ironBody', 24], ['focus', 24], ['parry', 24], ['meditate', 26, 'ironBody', 1], ['hakkei', 26, 'comboPunch', 1], ['whirlKick', 28], ['hundredFists', 30, 'hakkei', 1], ['heavenFist', 34, 'hakkei', 2]],
  dragoon: [['jump', 24], ['dragonLance', 24], ['powerSlash', 24], ['armorBreak', 24], ['dragonBreath', 24], ['dragonBlood', 26], ['pierceLance', 26, 'dragonLance', 1], ['twinDragon', 28, 'dragonLance', 2], ['crossSlash', 28], ['dragonDive', 34, 'jump', 2]],
});
for (const k of ['bard', 'machinist', 'monk', 'dragoon']) { const T = SKILL_TREES[k]; Object.assign(CLASSES[k], { move: T[0][0], move2: T[T.length - 1][0], lv2: T[T.length - 1][1] }); }
// bard is listed under 魔導士 (so magic gear drops and the int template apply) but is never offered at the Lv14 advancement
{ const _ct = classTalk; classTalk = function* () { const f0 = CLASSES.bard.from; CLASSES.bard.from = null; try { return yield* _ct(); } finally { CLASSES.bard.from = f0; } }; }

/* ---------- battle mechanics ---------- */
MOVES.fullBurst.hitsUpTurret = 1;
// the jump: the next command is the landing
// end of turn: the turret fires, 龍血 regenerates
// the turret and the chi orbs are drawn beside the hero

/* ---------- animations ---------- */
const note = (b, X, Y, c, vy = -0.8) => b.spawn({ k: 'txt', s: '♪', x: X, y: Y, c, sh: '#101020', vy, vx: rnd(-6, 6) / 10, fade: 1, life: 26 });
Object.assign(FX, {
  *soundBlast(U, T, u) { Sound.sfx('charge'); for (let i = 0; i < 4; i++) note(this, U.x + rnd(-12, 12), U.y - 20, i % 2 ? '#ff8ad0' : '#ffe0f0'); yield* wait(8);
    for (let i = 0; i < 4; i++) { this.spawn({ k: 'arc', x: lerp(U.x, T.x, 0.3 + i * 0.2), y: lerp(U.y, T.y, 0.3 + i * 0.2), r: 10 + i * 4, a0: -1, a1: 1, sq: 1, w: 3, c: '#ff8ad0', c2: '#ffffff', grow: 3, life: 10 }); yield* wait(3); } Sound.sfx('hit'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 34, c: '#ffc0e8', w: 2, life: 12 }); yield* wait(8); },
  *battleSong(U) { for (let i = 0; i < 8; i++) { note(this, U.x + rnd(-24, 24), U.y + rnd(-10, 10), ['#ffe070', '#ff8ad0', '#8ad0ff'][i % 3], -1.2); yield* wait(2); } Sound.sfx('statUp'); yield* wait(10); },
  *lullabyH(U, T) { for (let i = 0; i < 6; i++) { note(this, lerp(U.x, T.x, i / 6), lerp(U.y, T.y, i / 6) - 10, '#c8b8ff', -0.3); yield* wait(3); } this.spawn({ k: 'txt', s: 'Zz', x: T.x + 8, y: T.y - 30, c: '#e0d8ff', sh: '#201840', vy: -0.4, fade: 1, life: 30 }); yield* wait(12); },
  *discord(U, T) { Sound.sfx('statDown'); for (let i = 0; i < 6; i++) { this.spawn({ k: 'txt', s: i % 2 ? '♯' : '♭', x: T.x + rnd(-20, 20), y: T.y + rnd(-26, 6), c: '#a060d0', sh: '#1a0a24', vy: 0.3, fade: 1, life: 24 }); } this.shake = 6; yield* wait(14); },
  *healSong(U) { Sound.sfx('heal'); for (let i = 0; i < 8; i++) note(this, U.x + rnd(-20, 20), U.y + 10, i % 2 ? '#a0ffc8' : '#ffffff', -1); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c: '#a0ffc8', life: 20 }); yield* wait(14); },
  *echoBlast(U, T, u) { yield* FX.echoHit.call(this, U, T, u, 0); },
  *echoHit(U, T) { Sound.sfx('hit'); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4 + i * 6, r1: 26 + i * 8, c: i % 2 ? '#ffffff' : '#ff8ad0', w: 2, life: 10 + i * 2 }); note(this, T.x, T.y - 20, '#ff8ad0'); yield* wait(6); },
  *heroicFinale(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'dark', a: 0.4, c: '#200818', life: 36 }); for (let i = 0; i < 12; i++) { note(this, U.x + rnd(-30, 30), U.y + rnd(-20, 20), ['#ffe070', '#ff8ad0', '#8ad0ff', '#ffffff'][i % 4], -1.4); } yield* wait(16);
    this.spawn({ k: 'rays', x: T.x, y: T.y, n: 16, a0: 0, len: 44, c: '#ffe070', life: 20 }); this.spawn({ k: 'flash', c: '#ffe8f4', a: 0.45, life: 8 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 50 + i * 14, c: i % 2 ? '#ff8ad0' : '#ffe070', w: 3, life: 16 + i * 3 }); this.shake = 14; Sound.sfx('hitSuper'); yield* wait(14); },
  *turretSet(U) { Sound.sfx('rock'); this.spawn({ k: 'hex', x: U.x + 34, y: U.y + 14, r0: 4, r1: 16, c: '#c8a050', life: 14 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'dot', x: U.x + 34, y: U.y + 16, vx: rnd(-14, 14) / 10, vy: -rnd(4, 14) / 10, g: 0.08, c: '#e0c080', s: 2, life: 14 }); yield* wait(10); },
  *turretShot(U, T) { Sound.sfx('hit'); const X = U.x + 44, Y = U.y + 10; this.spawn({ k: 'line', x1: X, y1: Y, x2: T.x, y2: T.y, c: '#ffe070', w: 2, grow: 2, life: 8 }); this.spawn({ k: 'star', x: T.x, y: T.y, c: '#ffffff', life: 8 }); yield* wait(8); },
  *taser(U, T, u) { yield* this.lunge(u, 6, 2); Sound.sfx('thunder'); this.spawn({ k: 'bolt', pts: [[U.x + 10, U.y - 8], [lerp(U.x, T.x, 0.5), lerp(U.y, T.y, 0.5) + rnd(-6, 6)], [T.x, T.y]], w: 2, life: 10 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'dot', x: T.x, y: T.y, vx: rnd(-20, 20) / 10, vy: rnd(-20, 20) / 10, c: '#fff080', s: 2, life: 10 }); yield* wait(10); },
  *clockBomb(U, T, u) { Sound.sfx('tick'); const b = this.spawn({ k: 'circ', x: U.x + 8, y: U.y - 10, vx: (T.x - U.x) / 16, vy: -3, g: 0.38, r: 4, c: '#3a3a44', hl: '#c8a050', life: 16 }); yield* wait(16); Sound.sfx('quake');
    this.spawn({ k: 'glow', x: T.x, y: T.y, r: 36, c: '#ffb040', life: 14 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30 + i * 10, c: i % 2 ? '#ffe070' : '#ff6020', w: 3, life: 12 + i * 2 }); for (let i = 0; i < 8; i++) this.spawn({ k: 'shard', x: T.x, y: T.y, vx: rnd(-26, 26) / 10, vy: -rnd(10, 30) / 10, g: 0.15, s: 4, c: '#c8a050', life: 20 }); this.shake = 12; yield* wait(12); },
  *steamJet(U, T, u) { Sound.sfx('water'); for (let i = 0; i < 20; i++) this.spawn({ k: 'circ', x: U.x + 12, y: U.y - 6, vx: (T.x - U.x) / 14 + rnd(-6, 6) / 10, vy: (T.y - U.y) / 14 + rnd(-6, 6) / 10, r: rnd(2, 4), c: i % 2 ? '#e8f0f8' : '#b8c8d8', life: 18 }); yield* wait(16); },
  *overdrive(U) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 30, r1: 8 + i * 6, c: i % 2 ? '#4ac0c0' : '#c8a050', life: 14 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'streak', x: U.x - 20 + rnd(0, 40), y: U.y + rnd(-20, 20), vx: -3, len: 8, c: '#ffe070', life: 10 }); yield* wait(12); },
  *repair(U) { Sound.sfx('heal'); for (let i = 0; i < 4; i++) { this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-16, 16), y: U.y + rnd(-10, 14), c: '#a0ffc8', sh: '#103020', vy: -0.8, fade: 1, life: 20 }); } this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 8, r1: 30, c: '#c8a050', life: 18 }); yield* wait(14); },
  *fullBurst(U, T, u) { yield* FX.burstHit.call(this, U, T, u, 0); },
  *burstHit(U, T, u, i) { Sound.sfx('hit'); const X = U.x + 12, Y = U.y - 8 + (i % 3) * 4; this.spawn({ k: 'line', x1: X, y1: Y, x2: T.x + rnd(-8, 8), y2: T.y + rnd(-8, 8), c: i % 2 ? '#ffe070' : '#ffffff', w: 2, grow: 2, life: 6 }); this.spawn({ k: 'star', x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 10), c: '#ffe070', life: 8 }); yield* wait(4); },
  *megaCannon(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x + 16, y: U.y - 6, r: 20, c: '#4ac0c0', life: 24 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'mote', x: U.x + rnd(-30, 50), y: U.y + rnd(-30, 20), to: { x: U.x + 16, y: U.y - 6 }, s: 2, c: '#4ac0c0', life: 18 }); yield* wait(18);
    Sound.sfx('quake'); this.spawn({ k: 'line', x1: U.x + 16, y1: U.y - 6, x2: T.x + 20, y2: T.y, c: '#a0ffff', w: 10, grow: 2, life: 14 }); this.spawn({ k: 'line', x1: U.x + 16, y1: U.y - 6, x2: T.x + 20, y2: T.y, c: '#ffffff', w: 4, grow: 2, life: 14 }); yield* wait(6);
    this.spawn({ k: 'flash', c: '#e0ffff', a: 0.6, life: 10 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 50 + i * 16, c: i % 2 ? '#ffffff' : '#4ac0c0', w: 3, life: 16 + i * 4 }); this.shake = 22; yield* wait(16); },
  *comboPunch(U, T, u) { yield* this.lunge(u, 14, 2); yield* FX.punchHit.call(this, U, T, u, 0); },
  *punchHit(U, T, u, i) { Sound.sfx('hit'); const ox = [-10, 10, 0, -6, 8, -2, 4][i % 7], oy = [-6, 2, -10, 6, -4, 8, 0][i % 7]; this.spawn({ k: 'ring', x: T.x + ox, y: T.y + oy, r0: 2, r1: 12, c: '#ffc040', w: 2, life: 8 }); this.spawn({ k: 'star', x: T.x + ox, y: T.y + oy, c: '#ffffff', life: 8 }); this.shake = Math.max(this.shake, 4); yield* wait(4); },
  *chiBlast(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x + 10, y: U.y - 4, r: 14, c: '#ffc040', life: 12 }); yield* wait(8); const b = this.spawn({ k: 'mote', x: U.x + 10, y: U.y - 4, to: T, s: 5, c: '#ffe070', life: 14 }); yield* wait(12); Sound.sfx('hitSuper'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 26, c: '#ffc040', life: 12 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 28, c: '#ffe070', w: 3, life: 12 }); yield* wait(8); },
  *ironBody(U) { Sound.sfx('statUp'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c: '#e0b050', life: 20 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 34 - i * 6, r1: 14, c: '#e0b050', life: 16 + i * 3 }); yield* wait(14); },
  *meditate(U) { Sound.sfx('heal'); this.spawn({ k: 'dark', a: 0.3, c: '#1a1008', life: 24 }); for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8; this.spawn({ k: 'mote', x: U.x + Math.cos(an) * 36, y: U.y + Math.sin(an) * 24, to: U, s: 2, c: '#ffc040', life: 20 }); } yield* wait(18); },
  *whirlKick(U, T, u) { yield* this.lunge(u, 14, 2); yield* FX.kickHit.call(this, U, T, u, 0); },
  *kickHit(U, T, u, i) { Sound.sfx('wind'); arcCut(this, T, { r: 22, a0: i ? 3.4 : 0.2, a1: i ? 0.2 : 3.4, sq: 0.5, w: 4, c: '#ffa040', c2: '#fff0c0', grow: 4, life: 10 }); this.spawn({ k: 'star', x: T.x + (i ? -14 : 14), y: T.y, c: '#ffffff', life: 8 }); yield* wait(5); },
  *hakkei(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 26, c: '#ffc040', life: 14 }); yield* wait(10); yield* this.lunge(u, 20, 2); Sound.sfx('hitSuper');
    this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 36, c: '#ffe070', w: 4, life: 14 }); this.spawn({ k: 'shock', x: T.x, y: T.y + 10, r0: 4, r1: 44, c: '#ffc040', life: 14 }); this.spawn({ k: 'flash', c: '#fff0c0', a: 0.35, life: 6 }); this.shake = 12; yield* wait(12); },
  *hundredFists(U, T, u) { yield* this.lunge(u, 14, 2); yield* FX.punchHit.call(this, U, T, u, 0); },
  *heavenFist(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'pillar', x: U.x, y: U.y + 20, w: 14, h: 90, c: '#ffc040', life: 26 }); for (let i = 0; i < 14; i++) this.spawn({ k: 'mote', x: U.x + rnd(-14, 14), y: U.y + rnd(-4, 20), vy: -1.6, s: 2, c: '#ffe070', life: 20 }); yield* wait(18);
    yield* this.lunge(u, 26, 2); Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ffffff', a: 0.6, life: 8 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'shock', x: T.x, y: T.y + 16, r0: 6 + i * 6, r1: 56 + i * 16, c: i % 2 ? '#ffffff' : '#ffa040', life: 16 + i * 4 }); this.sparks(T.x, T.y, 26, ['#ffe070', '#ffffff', '#ff8040'], 3.6, 22, 0.08); this.shake = 22; yield* wait(16); },
  *jumpFx(U, T, u) { Sound.sfx('wind'); this.spawn({ k: 'line', x1: T.x, y1: -20, x2: T.x, y2: T.y, c: '#ffffff', w: 3, grow: 3, life: 10 }); yield* wait(4); Sound.sfx('quake'); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 4, r1: 50, c: '#e0e8ff', life: 16 }); this.spawn({ k: 'flash', c: '#ffffff', a: 0.4, life: 6 }); this.sparks(T.x, T.y, 16, ['#ffffff', '#c8d8ff'], 3, 18, 0.1); this.shake = 16; yield* wait(10); },
  *dragonLance(U, T, u) { yield* this.lunge(u, 22, 2); Sound.sfx('slash'); this.spawn({ k: 'line', x1: U.x, y1: U.y - 6, x2: T.x + 26, y2: T.y, c: '#ff5a4a', w: 5, grow: 2, life: 12 }); this.spawn({ k: 'line', x1: U.x, y1: U.y - 6, x2: T.x + 26, y2: T.y, c: '#ffe0c0', w: 2, grow: 2, life: 12 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'flame', x: T.x + rnd(-6, 6), y: T.y + rnd(-6, 6), vy: -1, s: 3, life: 12 }); yield* wait(10); },
  *dragonBreath(U, T) { Sound.sfx('fire'); for (let i = 0; i < 26; i++) this.spawn({ k: 'flame', x: U.x + 10, y: U.y - 8, vx: (T.x - U.x) / 14 + rnd(-8, 8) / 10, vy: (T.y - U.y) / 14 + rnd(-8, 8) / 10, s: rnd(3, 5), life: rnd(14, 20) }); yield* wait(16); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 30, c: '#ff6020', life: 12 }); yield* wait(6); },
  *dragonBlood(U) { Sound.sfx('fire'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 34, c: '#ff3020', life: 22 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'flame', x: U.x + rnd(-16, 16), y: U.y + 18, vy: -1.6, s: 3, life: rnd(14, 22) }); this.spawn({ k: 'txt', s: '龍', x: U.x - 5, y: U.y - 44, c: '#ffb0a0', sh: '#400808', vy: -0.4, fade: 1, life: 26 }); yield* wait(16); },
  *pierceLance(U, T, u) { yield* this.lunge(u, 26, 1); Sound.sfx('crit'); this.spawn({ k: 'line', x1: T.x - 30, y1: T.y - 2, x2: T.x + 40, y2: T.y + 2, c: '#e8e8ff', w: 4, grow: 2, life: 12 }); for (let i = 0; i < 8; i++) this.spawn({ k: 'shard', x: T.x + 10, y: T.y, vx: 1 + Math.random() * 2, vy: rnd(-10, 10) / 10, s: 4, c: '#a8b0c0', life: 16 }); yield* wait(10); },
  *twinDragon(U, T, u) { yield* this.lunge(u, 20, 2); yield* FX.twinDragonHit.call(this, U, T, u, 0); },
  *twinDragonHit(U, T, u, i) { Sound.sfx('slash'); const dy = i ? 8 : -8; this.spawn({ k: 'line', x1: T.x - 30, y1: T.y + dy, x2: T.x + 30, y2: T.y + dy - 4, c: i ? '#ffb040' : '#ff5a4a', w: 4, grow: 2, life: 10 }); this.spawn({ k: 'star', x: T.x + 28, y: T.y + dy - 4, c: '#ffffff', life: 10 }); yield* wait(6); },
  *dragonDiveFx(U, T, u) { Sound.sfx('fire'); this.spawn({ k: 'flash', c: '#ff8040', a: 0.4, life: 10 }); for (let i = 0; i < 20; i++) this.spawn({ k: 'flame', x: T.x + rnd(-10, 10), y: rnd(-20, T.y), vy: 3, s: rnd(3, 6), life: 16 }); this.spawn({ k: 'line', x1: T.x + 30, y1: -30, x2: T.x, y2: T.y, c: '#ffe070', w: 8, grow: 3, life: 14 }); yield* wait(8);
    Sound.sfx('quake'); this.spawn({ k: 'pillar', x: T.x, y: T.y + 26, w: 26, h: 130, c: '#ff6020', life: 22 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 6 + i * 8, r1: 60 + i * 16, c: i % 2 ? '#ffe070' : '#ff5a4a', life: 16 + i * 4 }); this.shake = 26; yield* wait(18); },
});
FX.turret = FX.turretSet;
Object.assign(MOVES.echoBlast, { hitFx: 'echoHit' }); Object.assign(MOVES.fullBurst, { hitFx: 'burstHit' }); Object.assign(MOVES.comboPunch, { hitFx: 'punchHit' }); Object.assign(MOVES.hundredFists, { hitFx: 'punchHit' }); Object.assign(MOVES.whirlKick, { hitFx: 'kickHit' }); Object.assign(MOVES.twinDragon, { hitFx: 'twinDragonHit' });
Object.assign(SKILL_STYLE, {
  soundBlast: ['rune', 'none', 'moon', 'hit'], battleSong: ['halo', null, 'gold'], lullabyH: ['still', null, 'moon'], discord: ['still', null, 'shadow'], healSong: ['halo', null, 'life'], echoBlast: ['rune', 'none', 'moon', 'hit'], heroicFinale: ['halo', 'none', 'gold', 'hitSuper'],
  turret: ['hex', null, 'gold'], taser: ['draw', 'none', 'volt', 'thunder'], clockBomb: ['draw', 'none', 'ember', 'rock'], steamJet: ['draw', 'none', 'water', 'water'], overdrive: ['focus', null, 'gold'], repair: ['hex', null, 'life'], fullBurst: ['dash', 'none', 'gold', 'hit'], megaCannon: ['focus', 'none', 'water', 'hitSuper'],
  comboPunch: ['dash', 'none', 'gold', 'hit'], chiBlast: ['focus', 'none', 'gold', 'hit'], ironBody: ['hex', null, 'gold'], meditate: ['focus', null, 'gold'], whirlKick: ['dash', 'none', 'ember', 'wind'], hakkei: ['focus', 'none', 'gold', 'hitSuper'], hundredFists: ['dash', 'none', 'gold', 'hit'], heavenFist: ['aura', 'none', 'ember', 'crit'],
  jump: ['dash', 'none', 'steel', 'quake'], dragonLance: ['draw', 'none', 'blood', 'slash'], dragonBreath: ['aura', 'none', 'fire', 'fire'], dragonBlood: ['aura', null, 'blood'], pierceLance: ['still', 'none', 'steel', 'crit'], twinDragon: ['dash', 'none', 'blood', 'slash'], dragonDive: ['sky', 'none', 'fire', 'quake'],
});

/* ---------- unlocking the classes (trials) and changing class at the guild ---------- */
const CH2_CLS = [['bard', 'clsBard'], ['machinist', 'clsMachinist'], ['monk', 'clsMonk'], ['dragoon', 'clsDragoon']];
function* ch2ClassTalk() {
  const st = Game.st, f = st.flags, opts = CH2_CLS.filter(([k, fl]) => f[fl] && st.cls !== k).map(([k]) => k);
  if (f.hiddenCls && st.cls !== 'otherworlder') opts.push('otherworlder'); if (f.spellbladeOk && st.cls !== 'spellblade') opts.push('spellblade');
  if (!opts.length) { yield* say('完成導師的試煉，就能在這裡轉職成「上級職業」。\n（吟遊詩人・機工士・武僧・龍騎士）'); return; }
  if (!(yield* yesNo('要轉職嗎？（可以轉成：' + opts.map(k => CLASSES[k].n).join('・') + '）'))) return;
  const k = yield* classCardScreen(opts, { title: '上級職業', cancel: true, look: heroLookOf(st), confirm: k => '確定要成為' + CLASSES[k].n + '嗎？\n（目前：' + (CLASSES[st.cls] || { n: '—' }).n + '）' });
  if (!k) return;
  if (CLASSES[st.cls] && CLASSES[st.cls].tier < 3) st.baseCls = baseClassOf(st.cls);
  st.cls = k; clampHP(); yield* itemGet(st.name + '成為了' + CLASSES[k].n + '！');
  const first = SKILL_TREES[k][0][0]; grantSkill(first, st); yield* say('學會了職業技能「' + MOVES[first].n + '」！');
  fixInherit(st); const inh = st.inh.map(id => MOVES[id].n).join('、');
  yield* say('「技能」選單換成了' + CLASSES[k].n + '的專屬技能樹。舊技能最多可以繼承' + inhSlots(st) + '招' + (inh ? '（先帶上了「' + inh + '」）' : '') + '。');
}
{ const _elder = Events.elder; Events.elder = function* (ow) { // 萌芽鎮的村長 can also change you into an unlocked 上級職業
    const f = Game.st.flags; if (CH2_CLS.some(([k, fl]) => f[fl] && Game.st.cls !== k)) { const r = yield* ask('要做什麼？', ['聊天', '上級職業']); if (r === 1) { yield* ch2ClassTalk(); return; } }
    yield* _elder(ow);
  };
}
Object.assign(QUEST_CATS, { '失落的樂譜': '職業', '機工士之道': '職業', '雪峰寺的試煉': '職業', '龍騎士的試煉': '職業' });
{ const _eq = extraQuests; extraQuests = function (st, L) {
    _eq(st, L); const f = st.flags;
    if (f.bardQ) L.push({ n: '失落的樂譜', t: f.clsBard ? '完成：成為吟遊詩人的資格。（到冒險者公會轉職）' : '詩人公會長蕾菈的古老樂譜掉在王都地下水道裡了。找回來交給她。', done: !!f.clsBard, rw: '上級職業「吟遊詩人」' });
    if (f.machQ) L.push({ n: '機工士之道', t: f.clsMachinist ? '完成：成為機工士的資格。（到冒險者公會轉職）' : '鐘錶師艾德要發條×3和黃銅齒輪×3。（' + (st.bag.spring || 0) + '/3・' + (st.bag.brassGear || 0) + '/3）', done: !!f.clsMachinist, rw: '上級職業「機工士」' });
    if (f.monkQ) L.push({ n: '雪峰寺的試煉', t: f.clsMonk ? '完成：成為武僧的資格。（到冒險者公會轉職）' : '武僧長老的試煉：打倒霜語雪原的雪原巨熊。', done: !!f.clsMonk, rw: '上級職業「武僧」' });
    if (f.dragoonQ) L.push({ n: '龍騎士的試煉', t: f.clsDragoon ? '完成：成為龍騎士的資格。（到冒險者公會轉職）' : '從赤焰山道的火龍幼體取得「龍之火種」，交給龍騎士老人。', done: !!f.clsDragoon, rw: '上級職業「龍騎士」' });
  };
}
Object.assign(Events, {
  *bardMaster() {
    const st = Game.st, f = st.flags;
    if (f.clsBard) { yield* say('歌聲是最溫柔的武器。去公會轉職吧，我的學生。'); return; }
    if (!f.bardQ) { if (ch2() < 3) { yield* say('歡迎來到吟遊詩人公會。……今天沒有演出喔。'); return; } f.bardQ = 1; yield* sayAll(['……你就是那位異界的勇者？', '我是詩人公會長蕾菈。我們公會代代相傳的「勇者之歌」的樂譜，前幾天被溝鼠叼進地下水道了……', '如果你找得到，我就把詩人的歌——「吟遊詩人」的道路傳授給你。']); return; }
    if (st.bag.lostScore) { delete st.bag.lostScore; f.clsBard = 1; Sound.jingle('item'); yield* sayAll(['這就是……勇者之歌的樂譜！', '（蕾菈輕輕地哼起了旋律。）', '……五百年前，初代勇者的同伴裡，也有一位吟遊詩人。', '你有資格走上這條路了。到冒險者公會找公會長轉職吧。']); yield* itemGet('解鎖了上級職業「吟遊詩人」！'); return; }
    yield* say('樂譜應該掉在地下水道的某個角落……拜託你了。');
  },
  *hallGuest() { yield* say('蕾菈大人的歌聲，連魔物聽了都會停下來呢。'); },
  *monkMaster() {
    const st = Game.st, f = st.flags;
    if (f.clsMonk) { yield* say('氣在你的拳頭裡流動。去吧。'); return; }
    if (!f.monkQ) { f.monkQ = 1; yield* sayAll(['……雪峰寺不收弱者。', '想學「氣」的武術，先證明你的力量。', '去雪原打倒那頭「雪原巨熊」。空手也好，用劍也好。']); return; }
    if (f.snowBear) { f.clsMonk = 1; Sound.jingle('item'); yield* sayAll(['……你打倒了雪原巨熊。', '很好。你的身體裡，已經有「氣」的種子了。', '到王都的冒險者公會轉職吧。武僧的道路，從今天開始。']); yield* itemGet('解鎖了上級職業「武僧」！'); return; }
    yield* say('雪原巨熊在雪原的東邊。');
  },
  *monkPupil() { yield* say('師父一拳就能打碎冰牆……我練了三年還不行。'); },
  *dragonElder() {
    const st = Game.st, f = st.flags;
    if (f.clsDragoon) { yield* say('龍會回應你的呼喚。去吧，龍騎士。'); return; }
    if (!f.dragoonQ) { f.dragoonQ = 1; yield* sayAll(['……年輕人，你的眼神很像當年的我。', '我是最後的龍騎士。和龍締結契約，就能借用龍的力量。', '去山道南邊的岩漿湖，打倒那隻火龍幼體，帶回牠的「龍之火種」。', '那是和龍締結契約的證明。']); if (!f.youngDragon) return; }
    /* v24.14 the flame only dropped if the trial was accepted BEFORE the first win (rematches never gave it) — a hero who already beat the whelp gets it here */
    if (f.youngDragon && !st.bag.dragonFlame) { yield* sayAll(['……等等。你身上有龍的氣息。', '你已經打倒過火龍幼體了？……牠的火種，一直跟著你呢。']); st.bag.dragonFlame = 1; yield* itemGet(st.name + '得到了「龍之火種」！'); }
    if (st.bag.dragonFlame) { delete st.bag.dragonFlame; f.clsDragoon = 1; Sound.jingle('item'); yield* sayAll(['龍之火種……火燒得很旺。', '牠承認你了。', '到王都的冒險者公會轉職吧。龍騎士的跳躍，會帶你飛到任何地方。']); yield* itemGet('解鎖了上級職業「龍騎士」！'); return; }
    yield* say('火龍幼體就在山道的岩漿湖邊。');
  },
});
// 機工士: the clockmaker's second request (after the colossus)
{ const _cm = Events.clockmaker; Events.clockmaker = function* (ow) {
    const st = Game.st, f = st.flags;
    if (f.colossus && !f.clsMachinist) {
      if (!f.machQ) { f.machQ = 1; yield* sayAll(['對了……你有興趣學「機工」嗎？', '初代勇者的同伴裡，有一位用機關戰鬥的鐘錶師。我是他的後代。', '帶發條×3和黃銅齒輪×3來，我就幫你做一套機工的工具。']); return; }
      if ((st.bag.spring || 0) >= 3 && (st.bag.brassGear || 0) >= 3 && (yield* yesNo('要把發條×3和黃銅齒輪×3交給艾德嗎？'))) { st.bag.spring -= 3; st.bag.brassGear -= 3; f.clsMachinist = 1; Sound.jingle('item'); yield* sayAll(['好！等我一下……', '（叮叮噹噹……）', '完成了！機工士的工具組！', '到冒險者公會轉職吧。砲台的用法……用了就懂了！']); yield* itemGet('解鎖了上級職業「機工士」！'); return; }
    }
    yield* _cm(ow);
  };
}

/* v24.16 龍騎士's jump: leap up out of the screen (the monster stands right above the hero, so hanging at -60 put the hero on its face),
   stay out of view while airborne (the shadow stays on the ground), then dive down onto the monster and land back in place */
