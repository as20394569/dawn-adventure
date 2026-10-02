/* ===================== v12.0.1 每個武器技能都有自己的特效 =====================
   Player: 「武器技能特效不能有重複的 還有盡量符合招式名稱」. Each weapon skill (W12, 10t) gets its own picture FX['w12_<weapon>'],
   composed from three parts read off the skill: the MOVE (from its archetype and the verb in its name: 斬・劈 cut, 突・刺・貫 thrust,
   十字 cross, 彈・射・砲 shot, 嵐・潮・濤 wave, 拳・掌 punches, 歌・曲・笛 notes …), the COLOURS and the PARTICLES (from the words in
   its name: 狐火 orange flames, 水晶 cyan shards, 骸骨 bone chips, 月 silver crescents, 星 stars, 蠍・毒 green bubbles, 黯滅 violet
   smoke …). No two weapon skills share the same combination (checked below); multi-hit skills play a small beat per extra hit. */
const W12FX_PAL = [ // [words in the name, colours [main, light, dark], particle]
  [['霜火'], ['#80c8ff', '#ffe0c0', '#d04020'], 'ice'],   [['古王'], ['#ff7040', '#ffe0a0', '#a03018'], 'crest'], [['晨霧'], ['#d8e4f0', '#ffffff', '#7a8aa0'], 'mist'], [['獵刀', '獵'], ['#a0b070', '#f0f8d0', '#506030'], 'dust'],
  [['灰狼'], ['#9098a8', '#f0f4ff', '#40485a'], 'claw'], [['影將'], ['#a04060', '#ffd0e0', '#301020'], 'shadow'], [['見習'], ['#d8c8a0', '#ffffff', '#8a7a60'], 'spark'],
  [['鐵槍'], ['#a0a8b8', '#ffffff', '#505868'], 'spark'], [['蒼龍'], ['#40c0ff', '#e8fbff', '#1060a0'], 'wave'], [['天龍'], ['#ffe080', '#ffffff', '#5080ff'], 'star'],
  [['龍鱗'], ['#60b080', '#e0fff0', '#205040'], 'shard'], [['練習'], ['#f0d090', '#fff8e0', '#9a7a40'], 'chip'], [['入門'], ['#a0c0ff', '#ffffff', '#4060a0'], 'spark'],
  [['森林'], ['#40a050', '#d8ffd0', '#205028'], 'leaf'], [['冰河'], ['#6aa8ff', '#e8f4ff', '#2a5aa8'], 'ice'], [['隕星'], ['#ff9040', '#fff0c0', '#a04010'], 'ember'],
  [['狐火'], ['#ff8a2a', '#ffe0a0', '#c84818'], 'flame'], [['晨曦', '曙'], ['#ffb070', '#fff4d0', '#e06a50'], 'ray'], [['水晶'], ['#7fe6ff', '#f0ffff', '#3aa0d0'], 'shard'],
  [['雷'], ['#ffe040', '#fffbe0', '#c09010'], 'bolt'], [['骸骨', '骨'], ['#e8e0c8', '#ffffff', '#9a8f78'], 'bone'], [['冥', '亡者'], ['#9a6ad8', '#e8d8ff', '#4a2a78'], 'wisp'],
  [['月蝕'], ['#c070ff', '#ffe0ff', '#40204a'], 'eclipse'], [['月'], ['#c8d8ff', '#ffffff', '#6a7ab8'], 'crescent'], [['星', '彗星', '流星'], ['#ffe68a', '#ffffff', '#c8a040'], 'star'],
  [['砂', '沙'], ['#e0c080', '#fff0c8', '#a07840'], 'sand'], [['蠍', '毒', '蛇', '多頭'], ['#7ad050', '#e8ffc0', '#5a2a78'], 'bubble'], [['蟾'], ['#90b040', '#f0ffb0', '#506020'], 'bubble2'],
  [['翠', '森', '荊棘', '橡'], ['#58d060', '#e8ffd0', '#2c9038'], 'leaf'], [['木', '伐木'], ['#c08a50', '#f0d8a8', '#7a5030'], 'chip'],
  [['王國', '王立', '古王', '宮廷', '騎士'], ['#ffd860', '#fff8e0', '#3a5aa8'], 'crest'], [['甲蟲'], ['#d8a040', '#fff0b0', '#7a5020'], 'horn'],
  [['發條', '齒輪', '黃銅', '時計'], ['#e0b664', '#fff0ae', '#8a6030'], 'gear'], [['霜', '冰'], ['#a8e8ff', '#ffffff', '#4a8ac8'], 'ice'],
  [['炎', '熔岩', '火山', '燼', '霜火'], ['#ff5a30', '#fff0a0', '#a02010'], 'ember'], [['黯滅', '黑騎士', '暗影', '影將'], ['#7a5aa8', '#d8c8ff', '#201830'], 'shadow'],
  [['虛空', '裂界'], ['#d060ff', '#ffe0ff', '#3a1060'], 'rift'], [['收穫'], ['#f0d060', '#fff8c0', '#a08020'], 'wheat'], [['龍'], ['#58a8ff', '#e0f4ff', '#2050a0'], 'dragon'],
  [['狼'], ['#b0a090', '#f0e8e0', '#5a4a40'], 'claw'], [['盜賊'], ['#8a8a9a', '#e0e0ea', '#30303a'], 'smoke'], [['野豬'], ['#a07050', '#f0d0b0', '#5a3a28'], 'dust'],
  [['岩'], ['#b09070', '#f0e0c8', '#6a5038'], 'rock'], [['新月'], ['#e0e8ff', '#ffffff', '#8090c0'], 'crescent2'], [['泰坦'], ['#a0a8b0', '#f0f4f8', '#505860'], 'quake'],
  [['氣功'], ['#70f0d0', '#e8fff8', '#20a080'], 'chi'], [['虎'], ['#ffa030', '#fff0c0', '#302018'], 'claw2'], [['笛', '琴', '歌', '曲', '詠', '號'], ['#f0a0e0', '#fff0ff', '#a050a0'], 'note'],
  [['軟木塞'], ['#d8b080', '#fff0d0', '#8a6040'], 'cork'], [['蒸汽'], ['#e8f0f8', '#ffffff', '#90a0b0'], 'steam'], [['潮', '湖'], ['#4aa0f0', '#e0f4ff', '#1a5aa8'], 'wave'],
  [['風', '鷹', '疾風'], ['#b8f0c8', '#ffffff', '#58a070'], 'wind'], [['沼'], ['#7a9a60', '#d8e8c0', '#3a4a28'], 'mist'], [['賢者', '靈光', '名匠'], ['#fff0a0', '#ffffff', '#c0a040'], 'spark'],
  [['魔女'], ['#a060c0', '#f0d0ff', '#407030'], 'hex'], [['巫妖'], ['#a8c8ff', '#f0f0ff', '#5a3a90'], 'ice2'], [['符文', '古岩'], ['#c0a070', '#f8e8c0', '#6a5a40'], 'rune'],
  [['鐵', '練習', '見習', '入門'], ['#c8d0dc', '#ffffff', '#6a7080'], 'spark2'], [['礦晶'], ['#b0e0f0', '#ffffff', '#5a8090'], 'shard2'], [['旅人'], ['#e0c890', '#fff8e0', '#8a7040'], 'note2'],
  [['布纏'], ['#e8dcc8', '#ffffff', '#9a8c78'], 'cloth'], [['三連', '射'], ['#ffd080', '#fffbe0', '#a07030'], 'muzzle'],
];
// the move: archetype first, then a verb in the name can sharpen it
const W12FX_MOVE = { swallowFlight: 'slash2', galeCut: 'thrust', thornBind: 'slash', cloudPierce: 'thrust', crossJudge: 'cross', steelCleaver: 'heavy', bloodMoon: 'crescentCut',
  allOut: 'slam', dawnFlash: 'iai', bladeRain: 'multi', steamCannon: 'wave', shadowRush: 'dash', twinFang: 'slash2', assassinMark: 'stab', lastWall: 'slam', rockBreak: 'slam',
  shieldRam: 'dashSlam', drakeFang: 'thrust2', chainPalm: 'punch', arcaneShot: 'proj', sonicBoom: 'rings', verdantWind: 'storm', songOfValor: 'selfNotes', tidalRage: 'wave',
  holyWard: 'selfShield', thorHammer: 'rain', starfall: 'rain', manaWall: 'selfShield', aquaEdge: 'bladeProj', chainLightning: 'chain', fireShot: 'proj', bolt: 'rain', mend: 'selfHeal',
  flameVortex: 'vortex', focusMind: 'selfFocus', smokeVeil: 'selfSmoke', ironWall: 'selfWall', combustion: 'bursts', chronoLock: 'clock' };
const W12FX_VERB = [[['纏'], 'bind'], [['拳'], 'punch'], [['弦'], 'rings'], [['十字'], 'cross'], [['迴斬', '收穫'], 'sweep'], [['連打', '連拳', '連發', '連射', '三連'], 'volley'], [['砲擊', '彈'], 'proj'], [['咬', '撕'], 'bite'], [['居合', '一閃', '劍閃'], 'iai']];
function w12Spec(k) {
  const [n, arch] = W12[k], len = P => Math.max(0, ...P[0].filter(w => n.includes(w)).map(w => w.length)); let P = null;
  for (const Q of W12FX_PAL) if (len(Q) > (P ? len(P) : 0)) P = Q; P = P || [[], ['#c8d0dc', '#ffffff', '#6a7080'], 'spark2'];
  let mv = W12FX_MOVE[arch] || 'slash'; const v = W12FX_VERB.find(([ws]) => ws.some(w => n.includes(w))); if (v && !/^self/.test(mv)) mv = v[1];
  return { mv, col: P[1], pt: P[2], seed: hashK(k) };
}
// particles: one signature shape per word group
function w12Particle(b, X, Y, S, n = 8, spread = 16) { const [c, h, d] = S.col, r = q => (((S.seed >>> (q % 24)) & 15) / 15 - 0.5);
  for (let i = 0; i < n; i++) { const x = X + rnd(-spread, spread), y = Y + rnd(-spread, spread), a = Math.random() * Math.PI * 2;
    switch (S.pt) {
      case 'flame': case 'ember': b.spawn({ k: 'flame', x, y, vy: -1 - Math.random(), s: rnd(2, 5), life: 14 + rnd(0, 6) }); break;
      case 'bolt': b.spawn({ k: 'bolt', pts: [[x, y - 6], [x + rnd(-3, 3), y], [x + rnd(-3, 3), y + 6]], w: 2, life: 8 }); break;
      case 'star': case 'spark': case 'spark2': b.star(x, y, i % 2 ? c : h, 8); break;
      case 'bubble': case 'bubble2': b.spawn({ k: 'bub', x, y, r: rnd(2, 4), c: i % 2 ? c : d, vy: -0.6, life: 16 }); break;
      case 'leaf': case 'wind': case 'feather': b.spawn({ k: 'line', x1: x, y1: y, x2: x + Math.cos(a) * 5, y2: y + Math.sin(a) * 5, c: i % 2 ? c : h, w: 2, grow: 2, life: 12 }); break;
      case 'shard': case 'shard2': case 'ice': case 'ice2': b.spawn({ k: 'line', x1: x, y1: y, x2: x + Math.cos(a) * 7, y2: y + Math.sin(a) * 7, c: i % 2 ? h : c, w: 2, grow: 1, life: 12 }); break;
      case 'crescent': case 'crescent2': case 'eclipse': b.spawn({ k: 'arc', x, y, r: rnd(4, 8), a0: a, c: i % 2 ? c : h, life: 12 }); break;
      case 'gear': case 'chi': case 'note': case 'note2': case 'cork': b.spawn({ k: 'ring', x, y, r0: 1, r1: rnd(4, 7), c: i % 2 ? c : h, w: 2, life: 12 }); break;
      case 'rift': case 'hex': case 'rune': case 'crest': b.spawn({ k: 'hex', x, y, r0: 2, r1: rnd(5, 9), c: i % 2 ? c : h, life: 12 }); break;
      case 'shadow': case 'smoke': case 'mist': case 'steam': case 'wisp': b.spawn({ k: 'glow', x, y, r: rnd(5, 9), c: i % 2 ? c : d, life: 14 }); break;
      default: b.spawn({ k: 'dot', x, y, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4, c: i % 3 ? c : h, s: 2, life: 14 }); } } }
function w12Line(b, x1, y1, x2, y2, S, w = 5) { const [c, h] = S.col; b.spawn({ k: 'line', x1, y1, x2, y2, c, w, grow: 3, life: 12 }); b.spawn({ k: 'line', x1, y1, x2, y2, c: h, w: Math.max(1, w - 3), grow: 3, life: 10 }); }
function* w12Proj(b, U, T, S, F = 9) { const [c, h] = S.col, x0 = U.x + 6, y0 = U.y - 10, p = b.spawn({ k: 'glow', x: x0, y: y0, r: 9, c, life: F + 2 });
  for (let i = 1; i <= F; i++) { p.x = lerp(x0, T.x, i / F); p.y = lerp(y0, T.y, i / F) - Math.sin(i / F * Math.PI) * 10; if (i % 2) w12Particle(b, p.x, p.y, S, 1, 3); yield; } }
function w12Make(k, S) {
  const [c, h, d] = S.col, flip = S.seed & 1 ? 1 : -1;
  const impact = (b, T, big) => { b.spawn({ k: 'glow', x: T.x, y: T.y, r: big ? 26 : 16, c, life: 12 }); b.spawn({ k: 'ring', x: T.x, y: T.y, r0: 3, r1: big ? 28 : 18, c: h, w: 2, life: 10 }); w12Particle(b, T.x, T.y, S, big ? 12 : 8, big ? 22 : 14); };
  const M = {
    *slash(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); w12Line(this, T.x - 20 * flip, T.y - 20, T.x + 16 * flip, T.y + 16, S); yield* wait(4); impact(this, T); yield* wait(8); },
    *slash2(U, T, u) { yield* this.lunge(u, 8, 3); for (let i = 0; i < 2; i++) { Sound.sfx('slash'); const f = i ? -flip : flip; w12Line(this, T.x - 18 * f, T.y - 18 + i * 6, T.x + 16 * f, T.y + 14 + i * 6, S, 4); yield* wait(4); } impact(this, T); yield* wait(8); },
    *cross(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); w12Line(this, T.x - 20, T.y - 20, T.x + 20, T.y + 20, S, 5); w12Line(this, T.x + 20, T.y - 20, T.x - 20, T.y + 20, S, 5); yield* wait(5); this.spawn({ k: 'flash', c: h, a: 0.25, life: 6 }); impact(this, T, 1); yield* wait(8); },
    *heavy(U, T, u) { yield* this.lunge(u, 12, 4); Sound.sfx('slash'); w12Line(this, T.x - 26 * flip, T.y - 26, T.x + 22 * flip, T.y + 22, S, 9); this.shake = Math.max(this.shake, 8); yield* wait(5); impact(this, T, 1); yield* wait(8); },
    *crescentCut(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 18, ang: flip > 0 ? 0.6 : 2.5, c: h, c2: c, w: 7, life: 14 }); yield* wait(5); impact(this, T); yield* wait(8); },
    *slam(U, T, u) { yield* this.lunge(u, 14, 4); Sound.sfx('quake'); this.shake = Math.max(this.shake, 12); this.spawn({ k: 'ring', x: T.x, y: T.y + 14, r0: 4, r1: 40, c, w: 3, life: 14, fl: 0.4 }); impact(this, T, 1); yield* wait(12); },
    *iai(U, T, u) { this.spawn({ k: 'flash', c: h, a: 0.3, life: 5 }); Sound.sfx('slash'); w12Line(this, T.x - 40, T.y + 2, T.x + 40, T.y - 2, S, 3); yield* wait(6); impact(this, T); yield* wait(8); },
    *multi(U, T, u) { yield* this.lunge(u, 6, 2); for (let i = 0; i < 5; i++) { Sound.sfx('slash'); const a = (S.seed % 7 + i * 1.3) % Math.PI; w12Line(this, T.x - Math.cos(a) * 18, T.y - Math.sin(a) * 18, T.x + Math.cos(a) * 18, T.y + Math.sin(a) * 18, S, 3); yield* wait(2); } impact(this, T); yield* wait(8); },
    *thrust(U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('slash'); w12Line(this, U.x + 8, U.y - 8, T.x, T.y, S, 4); this.star(T.x, T.y, h, 10); yield* wait(4); impact(this, T); yield* wait(8); },
    *thrust2(U, T, u) { yield* this.lunge(u, 16, 3); for (let i = 0; i < 2; i++) { Sound.sfx('slash'); w12Line(this, U.x + 8, U.y - 8 + i * 6, T.x + (i ? 4 : -4), T.y + (i ? 4 : -4), S, 4); yield* wait(4); } impact(this, T); yield* wait(8); },
    *dash(U, T, u) { for (let i = 0; i < 4; i++) this.spawn({ k: 'glow', x: lerp(U.x, T.x, i / 4), y: lerp(U.y, T.y, i / 4), r: 8, c: d, life: 10 + i * 2 }); yield* this.lunge(u, 22, 3); Sound.sfx('slash'); w12Line(this, T.x - 22, T.y + 6, T.x + 22, T.y - 6, S, 4); yield* wait(4); impact(this, T); yield* wait(8); },
    *dashSlam(U, T, u) { yield* this.lunge(u, 22, 4); Sound.sfx('quake'); this.shake = Math.max(this.shake, 10); impact(this, T, 1); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 34, c: d, w: 3, life: 12 }); yield* wait(10); },
    *stab(U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('crit'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 22, r1: 2, c: h, w: 2, life: 10 }); yield* wait(4); w12Line(this, T.x + 10, T.y - 10, T.x - 4, T.y + 4, S, 3); impact(this, T); yield* wait(8); },
    *bite(U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('slash'); for (const s of [-1, 1]) w12Line(this, T.x - 14, T.y + s * 8, T.x + 14, T.y + s * 10, S, 3); yield* wait(4); impact(this, T); yield* wait(8); },
    *sweep(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y + 6, r: 34, ang: 1.57, c: h, c2: c, w: 6, life: 16 }); yield* wait(6); impact(this, T, 1); yield* wait(8); },
    *volley(U, T, u) { for (let i = 0; i < 3; i++) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 8, y: U.y - 10, r: 8, c: h, life: 5 }); yield* w12Proj(this, U, { x: T.x + rnd(-6, 6), y: T.y + rnd(-6, 6) }, S, 5); impact(this, T); } yield* wait(8); },
    *bind(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y + 4 - i * 8, r0: 26, r1: 8, c: i % 2 ? h : c, w: 3, life: 14, fl: 0.4 }); yield* wait(3); } w12Line(this, T.x - 18, T.y + 14, T.x + 18, T.y - 14, S, 3); impact(this, T); yield* wait(8); },
    *bladeProj(U, T) { Sound.sfx('slash'); const F = 8, x0 = U.x + 6, y0 = U.y - 10, ang = Math.atan2(T.y - y0, T.x - x0), p = this.spawn({ k: 'cres', x: x0, y: y0, r: 10, ang, c: h, c2: c, w: 6, life: F + 2 });
      for (let i = 1; i <= F; i++) { p.x = lerp(x0, T.x, i / F); p.y = lerp(y0, T.y, i / F); if (i % 2) w12Particle(this, p.x, p.y, S, 1, 3); yield; } impact(this, T); yield* wait(8); },
    *proj(U, T) { Sound.sfx('charge'); yield* w12Proj(this, U, T, S); Sound.sfx('hitSuper'); impact(this, T, 1); yield* wait(8); },
    *rings(U, T) { Sound.sfx('buzz'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: lerp(U.x, T.x, 0.3 + i * 0.25), y: lerp(U.y, T.y, 0.3 + i * 0.25), r0: 3, r1: 14, c: i % 2 ? h : c, w: 2, life: 14 }); w12Particle(this, lerp(U.x, T.x, 0.3 + i * 0.25), lerp(U.y, T.y, 0.3 + i * 0.25), S, 2, 6); yield* wait(4); } impact(this, T); yield* wait(8); },
    *storm(U, T) { Sound.sfx('wind'); for (let i = 0; i < 4; i++) { w12Particle(this, T.x + rnd(-40, 40), T.y + rnd(-20, 20), S, 6, 10); this.spawn({ k: 'arc', x: T.x, y: T.y, r: 20 + i * 8, a0: i, c, life: 14 }); yield* wait(4); } impact(this, T, 1); yield* wait(8); },
    *wave(U, T) { Sound.sfx('water'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y + 10, r0: 6 + i * 6, r1: 50 + i * 8, c: i % 2 ? h : c, w: 3, life: 16, fl: 0.45 }); w12Particle(this, T.x, T.y, S, 6, 40); yield* wait(5); } impact(this, T, 1); yield* wait(8); },
    *rain(U, T) { for (let i = 0; i < 6; i++) { const x = T.x + rnd(-44, 44), y = T.y + rnd(-10, 14); Sound.sfx(S.pt === 'bolt' ? 'thunder' : 'fire'); w12Line(this, x + 14, y - 60, x, y, S, 4); yield* wait(3); impact(this, { x, y }); } this.shake = Math.max(this.shake, 8); yield* wait(10); },
    *chain(U, T, u, t) { Sound.sfx('thunder'); const G = (T.group || [t]).filter(Boolean).map(v => this.center(v)); let A = { x: U.x + 6, y: U.y - 10 }; for (const B of G.length ? G : [T]) { this.spawn({ k: 'bolt', pts: [[A.x, A.y], [lerp(A.x, B.x, 0.5) + rnd(-8, 8), lerp(A.y, B.y, 0.5)], [B.x, B.y]], w: 3, life: 10 }); impact(this, B); A = B; yield* wait(4); } yield* wait(8); },
    *vortex(U, T) { Sound.sfx('fire'); for (let i = 0; i < 16; i++) { const a = i * 0.8, r = 36 - i * 2; w12Particle(this, T.x + Math.cos(a) * r, T.y + Math.sin(a) * r * 0.5, S, 1, 2); if (i % 4 === 0) yield* wait(2); } impact(this, T, 1); yield* wait(10); },
    *bursts(U, T) { for (let i = 0; i < 4; i++) { const x = T.x + rnd(-36, 36), y = T.y + rnd(-12, 12); Sound.sfx('hitSuper'); impact(this, { x, y }, i === 3); yield* wait(4); } yield* wait(8); },
    *punch(U, T, u) { yield* this.lunge(u, 10, 2); for (let i = 0; i < 3; i++) { Sound.sfx('hit'); const x = T.x + [-8, 8, 0][i], y = T.y + [-4, 4, -8][i]; this.spawn({ k: 'ring', x, y, r0: 2, r1: 12, c: i % 2 ? h : c, w: 2, life: 8 }); w12Particle(this, x, y, S, 3, 4); yield* wait(3); } yield* wait(6); },
    *clock(U, T) { Sound.sfx('charge'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 30, r1: 26, c, w: 3, life: 24 }); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; w12Line(this, T.x, T.y, T.x + Math.cos(a) * 22, T.y + Math.sin(a) * 22, S, 2); yield* wait(2); } this.spawn({ k: 'flash', c: h, a: 0.3, life: 8 }); w12Particle(this, T.x, T.y, S, 10, 24); yield* wait(10); },
    *selfShield(U) { Sound.sfx('charge'); this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 6, r1: 30, c, life: 16 }); this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 4, r1: 22, c: h, life: 14 }); w12Particle(this, U.x, U.y, S, 8, 20); yield* wait(14); },
    *selfHeal(U) { Sound.sfx('heal'); for (let i = 0; i < 10; i++) this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-22, 18), y: U.y + rnd(0, 24), vy: -0.8, c: i % 2 ? c : h, life: 24, fade: 1 }); w12Particle(this, U.x, U.y, S, 6, 18); yield* wait(18); },
    *selfNotes(U) { Sound.sfx('statUp'); for (let i = 0; i < 8; i++) this.spawn({ k: 'bub', x: U.x + rnd(-24, 20), y: U.y + rnd(0, 20), r: rnd(2, 4), c: i % 2 ? c : h, vy: -1, life: 22 }); this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 4, r1: 30, c, w: 2, life: 14 }); yield* wait(16); },
    *selfFocus(U) { Sound.sfx('charge'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; this.spawn({ k: 'line', x1: U.x + Math.cos(a) * 34, y1: U.y + Math.sin(a) * 34, x2: U.x + Math.cos(a) * 10, y2: U.y + Math.sin(a) * 10, c: i % 2 ? c : h, w: 2, grow: 6, life: 14 }); } w12Particle(this, U.x, U.y, S, 4, 10); yield* wait(14); },
    *selfSmoke(U) { Sound.sfx('wind'); for (let i = 0; i < 8; i++) this.spawn({ k: 'glow', x: U.x + rnd(-26, 22), y: U.y + rnd(-10, 22), r: rnd(8, 14), c: i % 2 ? c : d, life: 20 }); w12Particle(this, U.x, U.y, S, 6, 20); yield* wait(14); },
    *selfWall(U) { Sound.sfx('statUp'); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: U.x, y: U.y + 4, r0: 30 - i * 6, r1: 18 - i * 4, c: i % 2 ? h : c, w: 3, life: 14 }); w12Particle(this, U.x, U.y, S, 6, 18); yield* wait(14); },
  };
  const f = M[S.mv] || M.slash; FX['w12_' + k] = function* (U, T, u, t) { yield* f.call(this, U, T, u, t); };
  // the 2nd, 3rd … hit of a multi-hit skill: a blow that fits the move (player: 鐵拳 drew a white slash line on every punch)
  const hm = /拳/.test(W12[k][0]) || S.mv === 'punch' ? 'fist' : S.mv === 'volley' ? 'shot' : S.mv === 'bite' ? 'jaw' : /^thrust/.test(S.mv) ? 'stab' : 'line';
  FX['w12h_' + k] = {
    *fist(U, T, u, i) { Sound.sfx('hit'); const x = T.x + [-8, 8, 0, 6][i % 4], y = T.y + [-4, 4, -8, 2][i % 4]; this.spawn({ k: 'glow', x, y, r: 10, c, life: 8 }); this.spawn({ k: 'ring', x, y, r0: 2, r1: 14, c: i % 2 ? h : c, w: 2, life: 8 }); w12Particle(this, x, y, S, 3, 5); this.shake = Math.max(this.shake, 3); yield* wait(4); },
    *shot(U, T, u, i) { Sound.sfx('crit'); const P = { x: T.x + rnd(-6, 6), y: T.y + rnd(-6, 6) }; yield* w12Proj(this, U, P, S, 5); this.spawn({ k: 'ring', x: P.x, y: P.y, r0: 2, r1: 12, c: h, w: 2, life: 8 }); w12Particle(this, P.x, P.y, S, 3, 6); },
    *jaw(U, T, u, i) { Sound.sfx('slash'); for (const s of [-1, 1]) w12Line(this, T.x - 10, T.y + s * 7, T.x + 10, T.y + s * 9, S, 3); w12Particle(this, T.x, T.y, S, 3, 6); yield* wait(4); },
    *stab(U, T, u, i) { Sound.sfx('slash'); const a = Math.atan2(T.y - U.y, T.x - U.x) + (i % 2 ? 0.15 : -0.15); w12Line(this, T.x - Math.cos(a) * 22, T.y - Math.sin(a) * 22, T.x + Math.cos(a) * 6, T.y + Math.sin(a) * 6, S, 3); w12Particle(this, T.x, T.y, S, 3, 6); yield* wait(4); },
    *line(U, T, u, i) { Sound.sfx('slash'); const a = (S.seed % 5) * 0.6 + i * 1.1; w12Line(this, T.x - Math.cos(a) * 16, T.y - Math.sin(a) * 16, T.x + Math.cos(a) * 16, T.y + Math.sin(a) * 16, S, 3); w12Particle(this, T.x, T.y, S, 4, 8); yield* wait(4); },
  }[hm];
}
{ const sig = new Map();
  for (const k in W12) { const D = DEF.skills['u_' + k]; if (!D) continue; const S = w12Spec(k), key = S.mv + '|' + S.pt + '|' + S.col.join(',');
    if (sig.has(key)) bvErr('v12', 'w12fx same picture ' + k + ' / ' + sig.get(key)); sig.set(key, k);
    w12Make(k, S); D.fx = 'w12_' + k; MOVES['u_' + k].fx = D.fx; if (D.hits) D.hitFx = 'w12h_' + k; }
}
