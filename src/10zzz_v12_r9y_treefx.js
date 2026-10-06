/* ===================== v12.0.9y 超級重製第二階段（三）：武器技能樹 90 招的動作和特效 =====================
   每招自己的顏色、起手、動作和收尾，照招式描述做（用現有的斬擊線、環、光、碎片、符文、星）。多段攻擊每一段各有一個動作（h）。 */
const sl11 = (b, T, a, len, S, w = 5, life = 12) => { const dx = Math.cos(a) * len, dy = Math.sin(a) * len; ln9(b, T.x - dx, T.y - dy, T.x + dx, T.y + dy, S.col[0], S.col[1], w, life); };
const th11 = (b, U, T, S, w = 4, over = 14) => { const a = Math.atan2(T.y - U.y, T.x - U.x); ln9(b, T.x - Math.cos(a) * 34, T.y - Math.sin(a) * 34, T.x + Math.cos(a) * over, T.y + Math.sin(a) * over, S.col[0], S.col[1], w); };
const bolt11 = function* (b, U, T, S, n = 8, w = 3, trail = 'glow') { const x0 = U.x + 10, y0 = U.y - 10; for (let i = 1; i <= n; i++) { const x = lerp(x0, T.x, i / n), y = lerp(y0, T.y, i / n); b.spawn({ k: 'glow', x, y, r: 5 + w, c: S.col[0], life: 6 }); b.spawn({ k: 'line', x1: lerp(x0, T.x, (i - 1) / n), y1: lerp(y0, T.y, (i - 1) / n), x2: x, y2: y, c: S.col[1], w, grow: 1, life: 5 }); yield; } };
const note11 = (b, x, y, S, n = 4) => { for (let i = 0; i < n; i++) b.spawn({ k: 'txt', s: i % 2 ? '♪' : '♫', x: x + rnd(-18, 18), y: y + rnd(-4, 16), vy: -0.8, c: i % 2 ? S.col[0] : S.col[1], life: 26, fade: 1 }); };
const aura11 = (b, U, S, n = 8) => { for (let i = 0; i < n; i++) b.spawn({ k: 'flame', x: U.x + rnd(-16, 16), y: U.y + rnd(4, 22), vy: -rnd(8, 14) / 10, s: 3, c: i % 2 ? S.col[0] : S.col[2], life: 18 }); b.spawn({ k: 'glow', x: U.x, y: U.y, r: 26, c: S.col[0], life: 20 }); };
const ringIn11 = (b, P, S, r0 = 30, r1 = 6, life = 14) => b.spawn({ k: 'ring', x: P.x, y: P.y, r0, r1, c: S.col[0], w: 2, life });
const FX11 = {
  /* ----- 劍 ----- */
  sdBreak: { col: ['#9ab0d0', '#ffffff', '#405070'], pt: 'shard', cast: 'draw', fin: 'cut', snd: 'slash', // a slash that knocks armour plates off
    *f(S, U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('slash'); sl11(this, T, -0.9, 26, S, 6); yield* wait(2); for (let i = 0; i < 6; i++) this.spawn({ k: 'shard', g: 0.15, x: T.x, y: T.y, vx: rnd(-20, 20) / 10, vy: -rnd(10, 25) / 10, s: rnd(3, 5), c: i % 2 ? S.col[0] : S.col[2], life: 22 }); imp9(this, T, S); yield* wait(8); } },
  sdTwin: { col: ['#7ae8b0', '#f0fff8', '#2a7a50'], pt: 'wind', cast: 'dash', fin: 'none', snd: 'wind', // two quick cuts, wind trailing behind
    *f(S, U, T, u) { for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x - 10, y1: U.y - 6 + i * 6, x2: U.x - 34, y2: U.y - 6 + i * 6, c: S.col[0], w: 1, grow: 2, life: 12 }); yield* this.lunge(u, 14, 2); Sound.sfx('slash'); sl11(this, T, -0.6, 22, S, 4); yield* wait(4); imp9(this, T, S); yield* wait(3); },
    *h(S, U, T) { Sound.sfx('slash'); sl11(this, T, 0.6, 22, S, 4); w12Particle(this, T.x, T.y, S, 4, 10); yield* wait(5); } },
  sdEye: { col: ['#ffe8a0', '#ffffff', '#a08030'], pt: 'spark2', cast: 'still', snd: 'tick', // an eye of light opens over the hero
    *f(S, U) { Sound.sfx('tick'); const X = U.x, Y = U.y - 30; this.spawn({ k: 'cres', x: X, y: Y + 4, r: 14, ang: -1.57, c: S.col[0], c2: S.col[1], w: 2, life: 22 }); this.spawn({ k: 'cres', x: X, y: Y - 4, r: 14, ang: 1.57, c: S.col[0], c2: S.col[1], w: 2, life: 22 }); yield* wait(6);
      this.spawn({ k: 'glow', x: X, y: Y, r: 6, c: S.col[1], life: 16 }); this.star(X, Y, S.col[1], 14); for (let i = 0; i < 3; i++) this.spawn({ k: 'glow', x: U.x - 8 - i * 10, y: U.y, r: 10, c: S.col[2], life: 10 + i * 3 }); yield* wait(12); } },
  sdGap: { col: ['#ff8a50', '#fff0d8', '#a03a10'], pt: 'spark', cast: 'dash', fin: 'pop', snd: 'crit', // the opening is marked, the thrust goes in, the shield cracks
    *f(S, U, T, u) { Sound.sfx('tick'); this.spawn({ k: 'line', x1: T.x - 6, y1: T.y - 6, x2: T.x + 6, y2: T.y + 6, c: S.col[1], w: 2, grow: 2, life: 12 }); this.spawn({ k: 'line', x1: T.x + 6, y1: T.y - 6, x2: T.x - 6, y2: T.y + 6, c: S.col[1], w: 2, grow: 2, life: 12 }); ringIn11(this, T, S, 24, 4, 12); yield* wait(6);
      yield* this.lunge(u, 18, 2); Sound.sfx('crit'); th11(this, U, T, S, 5); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 6, r1: 22, c: S.col[0], life: 12 }); yield* wait(3); imp9(this, T, S, 1); yield* wait(8); } },
  sdWhirl: { col: ['#7ad8ff', '#ffffff', '#2a6a90'], pt: 'wind', cast: 'dash', fin: 'gust', snd: 'wind', // a spinning cut that sweeps the whole group
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 3); Sound.sfx('wind'); for (let k = 0; k < 2; k++) { this.spawn({ k: 'ring', x: T.x, y: T.y + 6, r0: 46 - k * 12, r1: 18, c: k ? S.col[1] : S.col[0], w: 3, life: 14, fl: 0.4 }); yield* wait(2); }
      Sound.sfx('slash'); for (const C of grp9(this, T, t)) { this.spawn({ k: 'cres', x: C.x, y: C.y, r: 18, ang: Math.random() * 6, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); imp9(this, C, S); } yield* wait(10); } },
  sdFrenzy: { col: ['#ff4a4a', '#ffd0c0', '#701010'], pt: 'ember', cast: 'aura', snd: 'charge', // a red blade-aura flares up
    *f(S, U) { Sound.sfx('charge'); aura11(this, U, S, 10); for (let i = 0; i < 4; i++) { const a = -2.4 + i * 0.5; this.spawn({ k: 'line', x1: U.x, y1: U.y - 4, x2: U.x + Math.cos(a) * 34, y2: U.y + Math.sin(a) * 34, c: S.col[0], w: 3, grow: 4, life: 16 }); } yield* wait(10); this.spawn({ k: 'flash', c: S.col[0], a: 0.2, life: 5 }); yield* wait(8); } },
  sdMeteor: { col: ['#ffd060', '#ffffff', '#7a4a10'], pt: 'star', cast: 'sky', fin: 'impact', snd: 'quake', // the blade comes down like a falling star
    *f(S, U, T, u) { this.spawn({ k: 'dark', a: 0.45, c: '#100820', life: 30 }); yield* wait(6); yield* this.lunge(u, 16, 3); Sound.sfx('slash'); ln9(this, T.x + 34, T.y - 80, T.x - 4, T.y + 10, S.col[0], S.col[1], 9, 14);
      for (let i = 0; i < 8; i++) this.star(T.x + 34 - i * 5, T.y - 80 + i * 11, S.col[1], 12); yield* wait(4); Sound.sfx('quake'); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 6, r1: 56, c: S.col[0], life: 16 }); this.shake = Math.max(this.shake, 12); imp9(this, T, S, 1); yield* wait(10); } },
  sdFlow: { col: ['#c8b0ff', '#ffffff', '#5a3a9a'], pt: 'ray', cast: 'draw', fin: 'none', snd: 'slash', // five cuts of flowing light
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); sl11(this, T, -0.8, 24, S, 4, 16); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 14, c: S.col[0], life: 10 }); yield* wait(4); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); const a = [0.8, -0.2, 0.3, -1.2][i % 4]; sl11(this, T, a, 24, S, 3, 16); this.spawn({ k: 'line', x1: T.x - 30, y1: T.y + rnd(-14, 14), x2: T.x + 30, y2: T.y + rnd(-14, 14), c: S.col[1], w: 1, grow: 2, life: 10 }); yield* wait(4); } },
  /* ----- 短刀 ----- */
  dgVenom: { col: ['#7ad040', '#f0ffc0', '#3a5a20'], pt: 'bubble', cast: 'draw', fin: 'none', snd: 'poison', // two cuts dripping green
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); sl11(this, T, -0.7, 18, S, 3); for (let i = 0; i < 4; i++) this.spawn({ k: 'circ', x: T.x + rnd(-6, 6), y: T.y + 4, vx: rnd(-8, 8) / 10, vy: rnd(5, 12) / 10, g: 0.1, r: 2, c: S.col[0], life: 16 }); yield* wait(5); },
    *h(S, U, T) { Sound.sfx('slash'); sl11(this, T, 0.7, 18, S, 3); for (let i = 0; i < 4; i++) this.spawn({ k: 'circ', x: T.x + rnd(-6, 6), y: T.y + 4, vx: rnd(-8, 8) / 10, vy: rnd(5, 12) / 10, g: 0.1, r: 2, c: S.col[2], life: 16 }); Sound.sfx('poison'); yield* wait(5); } },
  dgQuick: { col: ['#d8e0f0', '#ffffff', '#607080'], pt: 'spark2', cast: 'dash', fin: 'none', snd: 'slash', // a blur of afterimages, then the point
    *f(S, U, T, u) { for (let i = 0; i < 4; i++) this.spawn({ k: 'glow', x: lerp(U.x, T.x, i / 5), y: lerp(U.y, T.y, i / 5), r: 8, c: S.col[2], life: 6 + i * 2 }); yield* this.lunge(u, 22, 2); Sound.sfx('slash'); th11(this, U, T, S, 3); this.star(T.x, T.y, S.col[1], 8); imp9(this, T, S); yield* wait(8); } },
  dgShade: { col: ['#6a6a8a', '#d0d0f0', '#1a1a2a'], pt: 'shadow', cast: 'still', snd: 'wind', // the hero slips sideways, leaving shadows
    *f(S, U) { Sound.sfx('wind'); for (let i = 0; i < 5; i++) { this.spawn({ k: 'glow', x: U.x - i * 8, y: U.y + rnd(-4, 4), r: 14 - i, c: i % 2 ? S.col[0] : S.col[2], life: 14 + i * 3 }); yield* wait(2); } this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 8, r1: 26, c: S.col[1], w: 1, life: 12 }); yield* wait(10); } },
  dgRot: { col: ['#a060d0', '#e0ffd0', '#3a1a50'], pt: 'bubble', cast: 'dash', fin: 'none', snd: 'poison', // four stabs that eat into the poison
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); th11(this, { x: T.x - 30, y: T.y - 10 }, T, S, 3, 8); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 12, c: S.col[0], life: 10 }); yield* wait(3); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); const o = (i % 2 ? 10 : -10); th11(this, { x: T.x - 30, y: T.y + o }, { x: T.x, y: T.y + o / 2 }, S, 3, 8); this.spawn({ k: 'circ', x: T.x, y: T.y + 6, vx: rnd(-8, 8) / 10, vy: 0.8, g: 0.1, r: 2, c: S.col[1], life: 14 }); yield* wait(4); } },
  dgReap: { col: ['#c02040', '#ffd0d8', '#300810'], pt: 'claw2', cast: 'still', fin: 'crimson', snd: 'crit', // a red mark on the throat, then one thrust
    *f(S, U, T, u) { this.spawn({ k: 'ring', x: T.x, y: T.y - 8, r0: 16, r1: 3, c: S.col[0], w: 2, life: 14 }); yield* wait(8); yield* this.lunge(u, 18, 2); Sound.sfx('crit'); th11(this, U, { x: T.x, y: T.y - 8 }, S, 4); this.spawn({ k: 'flash', c: S.col[0], a: 0.25, life: 5 }); imp9(this, T, S, 1); yield* wait(8); } },
  dgNeedle: { col: ['#ffe040', '#ffffe0', '#806010'], pt: 'spark', cast: 'dash', fin: 'none', snd: 'thunder', // a thrown needle that crackles on the hit
    *f(S, U, T) { Sound.sfx('slash'); yield* bolt11(this, U, T, S, 6, 1); Sound.sfx('thunder'); for (let i = 0; i < 3; i++) zig9(this, T.x, T.y, T.x + rnd(-20, 20), T.y + rnd(-20, 20), S.col[0], 2, 4, 10); imp9(this, T, S); yield* wait(8); } },
  dgBloom: { col: ['#e060c0', '#ffe0f8', '#2a6a2a'], pt: 'leaf', cast: 'dash', fin: 'nova', snd: 'slash', // a whirl of blades, then a poison flower opens
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); sl11(this, T, 0.4, 22, S, 3); yield* wait(3); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); sl11(this, T, i * 1.3, 22, S, 3); if (i === 3) { yield* wait(3); Sound.sfx('hitSuper'); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; this.spawn({ k: 'cres', x: T.x + Math.cos(a) * 10, y: T.y + Math.sin(a) * 10, r: 9, ang: a, c: S.col[0], c2: S.col[1], w: 3, life: 18 }); } this.spawn({ k: 'glow', x: T.x, y: T.y, r: 26, c: S.col[2], life: 16 }); } yield* wait(4); } },
  dgStitch: { col: ['#5a3a8a', '#c8b0ff', '#100818'], pt: 'eclipse', cast: 'void', fin: 'none', snd: 'crit', // the blade pins the foe's shadow to the ground
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('crit'); th11(this, U, T, S, 4); yield* wait(3); this.spawn({ k: 'line', x1: T.x - 22, y1: T.y + 24, x2: T.x + 22, y2: T.y + 24, c: S.col[2], w: 6, grow: 2, life: 26 }); this.spawn({ k: 'line', x1: T.x + 4, y1: T.y + 8, x2: T.x - 2, y2: T.y + 26, c: S.col[1], w: 2, grow: 2, life: 26 });
      for (let i = 0; i < 4; i++) this.spawn({ k: 'line', x1: T.x, y1: T.y + 24, x2: T.x + rnd(-16, 16), y2: T.y + 24 - rnd(4, 14), c: S.col[0], w: 1, grow: 2, life: 22 }); imp9(this, T, S); yield* wait(10); } },
  /* ----- 斧 ----- */
  axSplit: { col: ['#d09050', '#fff0d0', '#6a3a10'], pt: 'rock', cast: 'draw', fin: 'bash', snd: 'heavy', // straight down; the ground splits under it
    *f(S, U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('heavy'); ln9(this, T.x, T.y - 34, T.x, T.y + 22, S.col[0], S.col[1], 8); yield* wait(2); this.spawn({ k: 'line', x1: T.x, y1: T.y + 24, x2: T.x - 18, y2: T.y + 30, c: S.col[2], w: 2, grow: 2, life: 18 }); this.spawn({ k: 'line', x1: T.x, y1: T.y + 24, x2: T.x + 20, y2: T.y + 28, c: S.col[2], w: 2, grow: 2, life: 18 });
      this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 8, r1: 20, c: S.col[1], life: 10 }); this.shake = Math.max(this.shake, 5); imp9(this, T, S); yield* wait(8); } },
  axRoar: { col: ['#ff8040', '#ffe0a0', '#802010'], pt: 'ember', cast: 'aura', snd: 'heavy', // a war-cry: rings of force burst from the hero
    *f(S, U) { Sound.sfx('heavy'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 8, r1: 40 + i * 8, c: i % 2 ? S.col[1] : S.col[0], w: 3 - i, life: 14 }); this.shake = Math.max(this.shake, 3); yield* wait(4); } aura11(this, U, S, 6); yield* wait(10); } },
  axSpin: { col: ['#b0b8c8', '#ffffff', '#505868'], pt: 'shard', cast: 'dash', fin: 'gust', snd: 'wind', // the axe swung round in a full circle
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 3); Sound.sfx('wind'); this.spawn({ k: 'cres', x: T.x, y: T.y + 6, r: 44, ang: 0, c: S.col[1], c2: S.col[0], w: 7, life: 14 }); yield* wait(3); this.spawn({ k: 'cres', x: T.x, y: T.y + 6, r: 44, ang: 3.14, c: S.col[1], c2: S.col[0], w: 7, life: 14 }); yield* wait(3);
      for (const C of grp9(this, T, t)) imp9(this, C, S); yield* wait(8); } },
  axCrush: { col: ['#80a0d0', '#ffffff', '#2a3a60'], pt: 'shard', cast: 'draw', fin: 'shatter', snd: 'heavy', // the blow breaks the guard in two
    *f(S, U, T, u) { this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 22, r1: 22, c: S.col[0], life: 10 }); yield* this.lunge(u, 14, 3); Sound.sfx('heavy'); ln9(this, T.x - 24, T.y - 26, T.x + 10, T.y + 14, S.col[0], S.col[1], 8); yield* wait(2);
      Sound.sfx('crit'); for (let i = 0; i < 10; i++) { const a = i * 0.63; this.spawn({ k: 'shard', g: 0.12, x: T.x, y: T.y, vx: Math.cos(a) * 2.4, vy: Math.sin(a) * 2.4 - 1, s: rnd(3, 6), c: i % 2 ? S.col[0] : S.col[1], life: 22 }); } this.shake = Math.max(this.shake, 7); imp9(this, T, S, 1); yield* wait(8); } },
  axFury: { col: ['#ff3030', '#ffc0a0', '#600808'], pt: 'ember', cast: 'aura', fin: 'crimson', snd: 'heavy', // a red wave of rage behind the chop
    *f(S, U, T, u) { aura11(this, U, S, 5); yield* wait(4); yield* this.lunge(u, 14, 3); Sound.sfx('heavy'); ln9(this, T.x + 26, T.y - 30, T.x - 12, T.y + 16, S.col[0], S.col[1], 9); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 30, ang: 2.4, c: S.col[0], c2: S.col[2], w: 6, life: 14 }); this.shake = Math.max(this.shake, 6); imp9(this, T, S, 1); yield* wait(10); } },
  axQuake: { col: ['#b08a50', '#f0e0c0', '#4a3018'], pt: 'rock', cast: 'draw', fin: 'impact', snd: 'quake', // the ground is struck; rocks spring up under every foe
    *f(S, U, T, u, t) { yield* this.lunge(u, 8, 3); Sound.sfx('quake'); this.spawn({ k: 'shock', x: U.x + 20, y: U.y + 22, r0: 4, r1: 70, c: S.col[0], life: 18 }); this.shake = Math.max(this.shake, 8); yield* wait(4);
      for (const C of grp9(this, T, t)) { for (let i = 0; i < 5; i++) this.spawn({ k: 'shard', g: 0.25, x: C.x + rnd(-14, 14), y: C.y + 22, vx: rnd(-6, 6) / 10, vy: -rnd(20, 34) / 10, s: rnd(3, 6), c: i % 2 ? S.col[0] : S.col[2], life: 22 }); imp9(this, C, S); } yield* wait(10); } },
  axCastle: { col: ['#e0b060', '#ffffff', '#5a3a10'], pt: 'rock', cast: 'sky', fin: 'impact', snd: 'quake', // a castle-breaking blow from high above
    *f(S, U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('heavy'); for (let i = 1; i <= 5; i++) { this.spawn({ k: 'line', x1: T.x - 10, y1: T.y - 90 + i * 16, x2: T.x - 10, y2: T.y - 74 + i * 16, c: S.col[0], w: 10 - i, grow: 2, life: 8 }); yield; }
      Sound.sfx('quake'); this.spawn({ k: 'flash', c: S.col[1], a: 0.4, life: 6 }); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 8, r1: 80, c: S.col[0], life: 20 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'shard', g: 0.2, x: T.x, y: T.y + 10, vx: rnd(-30, 30) / 10, vy: -rnd(10, 35) / 10, s: rnd(3, 7), c: i % 2 ? S.col[0] : S.col[2], life: 26 });
      this.shake = Math.max(this.shake, 14); imp9(this, T, S, 1); yield* wait(12); } },
  axBlood: { col: ['#d01020', '#ff9090', '#400000'], pt: 'ember', cast: 'aura', snd: 'charge', // blood boils into a red aura
    *f(S, U) { Sound.sfx('charge'); this.spawn({ k: 'dark', a: 0.3, c: '#300000', life: 20 }); aura11(this, U, S, 12); for (let i = 0; i < 8; i++) this.spawn({ k: 'circ', x: U.x + rnd(-14, 14), y: U.y - 20, vx: rnd(-6, 6) / 10, vy: -0.4, g: 0.12, r: 2, c: S.col[0], life: 22 }); yield* wait(16); } },
  /* ----- 長槍 ----- */
  spPierce: { col: ['#a8c8f0', '#ffffff', '#3a5a8a'], pt: 'spark2', cast: 'dash', fin: 'pop', snd: 'slash', // a thrust that comes out the other side
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('slash'); th11(this, U, T, S, 4, 34); for (let i = 0; i < 5; i++) this.spawn({ k: 'line', x1: T.x + 20, y1: T.y, x2: T.x + 30 + rnd(0, 14), y2: T.y + rnd(-10, 10), c: S.col[1], w: 1, grow: 2, life: 12 }); imp9(this, T, S); yield* wait(8); } },
  spDash: { col: ['#60e0d0', '#e0fffa', '#1a6a60'], pt: 'wind', cast: 'dash', fin: 'none', snd: 'wind', // a running charge; the foe is slowed by the wind
    *f(S, U, T, u) { for (let i = 0; i < 4; i++) this.spawn({ k: 'line', x1: lerp(U.x, T.x, i / 5) - 10, y1: U.y + rnd(-8, 8), x2: lerp(U.x, T.x, i / 5) + 10, y2: U.y + rnd(-8, 8), c: S.col[0], w: 1, grow: 3, life: 10 }); yield* this.lunge(u, 24, 2); Sound.sfx('slash'); th11(this, U, T, S, 3);
      for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y + 18, r0: 18 - i * 4, r1: 6, c: S.col[2], w: 1, life: 14 }); imp9(this, T, S); yield* wait(8); } },
  spSweep: { col: ['#d0a060', '#fff0d0', '#6a4a20'], pt: 'dust', cast: 'draw', fin: 'gust', snd: 'wind', // the shaft swept low across the line
    *f(S, U, T, u, t) { yield* this.lunge(u, 8, 2); Sound.sfx('wind'); this.spawn({ k: 'line', x1: T.x - 60, y1: T.y + 14, x2: T.x + 60, y2: T.y + 8, c: S.col[0], w: 6, grow: 8, life: 14 }); this.spawn({ k: 'line', x1: T.x - 60, y1: T.y + 14, x2: T.x + 60, y2: T.y + 8, c: S.col[1], w: 2, grow: 8, life: 12 }); yield* wait(4);
      for (const C of grp9(this, T, t)) { w12Particle(this, C.x, C.y + 16, S, 5, 14); imp9(this, C, S); } yield* wait(8); } },
  spTriple: { col: ['#c0d8ff', '#ffffff', '#4060a0'], pt: 'ray', cast: 'dash', fin: 'none', snd: 'slash', // high, middle, low
    *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('slash'); th11(this, U, { x: T.x, y: T.y - 12 }, S, 3); imp9(this, { x: T.x, y: T.y - 12 }, S); yield* wait(4); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); const y = T.y + (i === 1 ? 0 : 12); th11(this, U, { x: T.x, y }, S, 3); this.star(T.x, y, S.col[1], 8); yield* wait(4); } },
  spBreak: { col: ['#ff7040', '#ffe0c0', '#802a10'], pt: 'spark', cast: 'dash', fin: 'pop', snd: 'crit', // the spear breaks the formation: a hex shatters
    *f(S, U, T, u) { this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 22, r1: 24, c: S.col[0], life: 10 }); yield* this.lunge(u, 20, 2); Sound.sfx('crit'); th11(this, U, T, S, 5, 20);
      for (let i = 0; i < 6; i++) { const a = i * 1.05; this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(a) * 26, y2: T.y + Math.sin(a) * 26, c: S.col[1], w: 2, grow: 3, life: 12 }); } imp9(this, T, S, 1); yield* wait(8); } },
  spGuard: { col: ['#9aa8c0', '#ffffff', '#40485a'], pt: 'spark2', cast: 'hex', snd: 'shield', // the spear twirled into a wheel in front of the hero
    *f(S, U) { Sound.sfx('wind'); const X = U.x + 18; for (let k = 0; k < 6; k++) { const a = k * 1.05; ln9(this, X - Math.cos(a) * 18, U.y - Math.sin(a) * 18, X + Math.cos(a) * 18, U.y + Math.sin(a) * 18, S.col[0], S.col[1], 3, 8); yield* wait(2); }
      Sound.sfx('shield'); this.spawn({ k: 'ring', x: X, y: U.y, r0: 20, r1: 22, c: S.col[1], w: 2, life: 22 }); yield* wait(12); } },
  spThousand: { col: ['#ffe8a0', '#ffffff', '#806020'], pt: 'ray', cast: 'dash', fin: 'none', snd: 'slash', // so many thrusts the spear looks like a fan of light
    *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('slash'); for (let i = 0; i < 3; i++) th11(this, U, { x: T.x + rnd(-6, 6), y: T.y + rnd(-14, 14) }, S, 2); yield* wait(3); },
    *h(S, U, T) { Sound.sfx('slash'); for (let i = 0; i < 2; i++) th11(this, U, { x: T.x + rnd(-6, 6), y: T.y + rnd(-16, 16) }, S, 2); this.star(T.x, T.y + rnd(-10, 10), S.col[1], 6); yield* wait(3); } },
  spSpiral: { col: ['#60d8ff', '#ffffff', '#1a5a8a'], pt: 'wind', cast: 'dash', fin: 'pop', snd: 'crit', // a drilling thrust wrapped in spiralling wind
    *f(S, U, T, u) { yield* this.lunge(u, 20, 3); Sound.sfx('crit'); th11(this, U, T, S, 5, 26); const a = Math.atan2(T.y - U.y, T.x - U.x);
      for (let i = 0; i < 6; i++) { const d = 30 - i * 6, x = T.x - Math.cos(a) * d, y = T.y - Math.sin(a) * d; this.spawn({ k: 'ring', x, y, r0: 4, r1: 10 + i, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 10 + i }); } imp9(this, T, S, 1); yield* wait(10); } },
  /* ----- 拳套 ----- */
  fsTriple: { col: ['#ffb060', '#fff0d0', '#8a4a10'], pt: 'spark', cast: 'dash', fin: 'none', snd: 'heavy', // three punches; blue sparks of mana come back
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('heavy'); this.spawn({ k: 'glow', x: T.x - 4, y: T.y - 6, r: 12, c: S.col[0], life: 8 }); this.star(T.x - 4, T.y - 6, S.col[1], 8); yield* wait(3); },
    *h(S, U, T, u, i) { Sound.sfx('heavy'); const P = { x: T.x + (i % 2 ? 6 : -2), y: T.y + (i % 2 ? 4 : -2) }; this.spawn({ k: 'glow', x: P.x, y: P.y, r: 12, c: S.col[0], life: 8 }); this.star(P.x, P.y, S.col[1], 8); this.spawn({ k: 'circ', x: P.x, y: P.y, vx: -1.5, vy: -0.4, g: 0, r: 2, c: '#8ad0ff', life: 16 }); yield* wait(4); } },
  fsBreak: { col: ['#e06a40', '#ffe0d0', '#6a2a10'], pt: 'shard', cast: 'dash', fin: 'bash', snd: 'heavy', // a straight punch that dents the armour
    *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('heavy'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 22, c: S.col[0], w: 4, life: 10 }); for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(a) * 18, y2: T.y + Math.sin(a) * 18, c: S.col[2], w: 2, grow: 2, life: 16 }); }
      this.shake = Math.max(this.shake, 4); imp9(this, T, S); yield* wait(8); } },
  fsBreath: { col: ['#80c8ff', '#e8f8ff', '#2a5a8a'], pt: 'spark2', cast: 'still', snd: 'heal', // breathe in, breathe out: rings and motes of mana
    *f(S, U) { Sound.sfx('heal'); for (let i = 0; i < 3; i++) { ringIn11(this, U, S, 30, 6, 14); yield* wait(4); } for (let i = 0; i < 8; i++) this.spawn({ k: 'circ', x: U.x + rnd(-24, 24), y: U.y + rnd(-10, 22), vx: 0, vy: -0.6, g: 0, r: 2, c: i % 2 ? S.col[0] : S.col[1], life: 22 }); this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 30, c: S.col[1], w: 1, life: 14 }); yield* wait(10); } },
  fsKick: { col: ['#90e070', '#f0ffe0', '#3a6a20'], pt: 'wind', cast: 'dash', fin: 'gust', snd: 'wind', // spinning kicks sweep through them all
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 2); Sound.sfx('wind'); for (const C of grp9(this, T, t)) this.spawn({ k: 'cres', x: C.x, y: C.y + 8, r: 18, ang: 0.3, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); yield* wait(4); },
    *h(S, U, T, u, i) { Sound.sfx('wind'); this.spawn({ k: 'cres', x: T.x, y: T.y + 8 - i * 6, r: 20, ang: 0.3 + i * 2, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); w12Particle(this, T.x, T.y, S, 3, 10); yield* wait(4); } },
  fsShell: { col: ['#c080ff', '#f4e0ff', '#4a2070'], pt: 'shard', cast: 'still', fin: 'shatter', snd: 'crit', // an open palm; cracks run over the shell
    *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('crit'); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 18, c: S.col[1], life: 12 }); yield* wait(3);
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.2; zig9(this, T.x, T.y, T.x + Math.cos(a) * 26, T.y + Math.sin(a) * 26, S.col[0], 2, 3, 22); } imp9(this, T, S); yield* wait(10); } },
  fsQi: { col: ['#60b0ff', '#e0f4ff', '#1a4a8a'], pt: 'spark2', cast: 'focus', fin: 'none', snd: 'charge', // a ball of qi pushed out of both palms
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x + 12, y: U.y - 6, r: 12, c: S.col[0], life: 10 }); yield* wait(5); yield* bolt11(this, U, T, S, 8, 4); Sound.sfx('hitSuper'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 28, c: S.col[1], w: 3, life: 12 }); imp9(this, T, S, 1); yield* wait(8); } },
  fsStorm: { col: ['#fff080', '#ffffff', '#a08020'], pt: 'star', cast: 'dash', fin: 'impact', snd: 'heavy', // a storm of fists, the last one breaks through
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('heavy'); for (let i = 0; i < 2; i++) this.star(T.x + rnd(-14, 14), T.y + rnd(-14, 14), S.col[1], 6); yield* wait(2); },
    *h(S, U, T, u, i) { Sound.sfx(i % 2 ? 'heavy' : 'slash'); for (let k = 0; k < 2; k++) { const x = T.x + rnd(-16, 16), y = T.y + rnd(-16, 16); this.spawn({ k: 'glow', x, y, r: 8, c: S.col[0], life: 6 }); this.star(x, y, S.col[1], 6); }
      if (i === 6) { yield* wait(2); Sound.sfx('hitSuper'); this.spawn({ k: 'shock', x: T.x, y: T.y, r0: 4, r1: 40, c: S.col[0], life: 14 }); this.shake = Math.max(this.shake, 6); } yield* wait(2); } },
  fsThrough: { col: ['#d0c0ff', '#ffffff', '#504080'], pt: 'ray', cast: 'still', fin: 'pop', snd: 'crit', // the palm only touches; the force comes out of the back
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); this.spawn({ k: 'glow', x: T.x - 6, y: T.y, r: 6, c: S.col[1], life: 10 }); yield* wait(4); Sound.sfx('crit');
      for (let i = 0; i < 4; i++) this.spawn({ k: 'ring', x: T.x + 10 + i * 8, y: T.y, r0: 4 + i * 3, r1: 14 + i * 4, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 12 }); this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + 50, y2: T.y, c: S.col[1], w: 3, grow: 6, life: 12 }); imp9(this, T, S, 1); yield* wait(10); } },
  /* ----- 法杖（顏色是純魔力；屬性看武器） ----- */
  stArrows: { col: ['#8ab0ff', '#ffffff', '#3a4ab0'], pt: 'spark2', cast: 'rune', fin: 'none', snd: 'charge', // three arrows of mana, one after another
    *f(S, U, T) { Sound.sfx('charge'); yield* bolt11(this, { x: U.x, y: U.y - 8 }, T, S, 6, 2); imp9(this, T, S); },
    *h(S, U, T, u, i) { Sound.sfx('charge'); yield* bolt11(this, { x: U.x, y: U.y + (i % 2 ? 6 : -14) }, T, S, 5, 2); imp9(this, T, S); } },
  stLance: { col: ['#b080ff', '#ffffff', '#4a2a9a'], pt: 'ray', cast: 'rune', fin: 'pop', snd: 'thunder', // a long lance of mana thrown straight through
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'rune', x: U.x + 8, y: U.y - 6, r: 12, c: S.col[0], c2: S.col[1], n: 6, poly: 4, life: 14 }); yield* wait(6); Sound.sfx('thunder');
      ln9(this, U.x + 10, U.y - 8, T.x + 30, T.y + 2, S.col[0], S.col[1], 6, 12); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 18, c: S.col[1], life: 12 }); imp9(this, T, S); yield* wait(8); } },
  stWall: { col: ['#a0d8ff', '#ffffff', '#3a70b0'], pt: 'hex', cast: 'rune', snd: 'shield', // a wall of hexagons rises in front
    *f(S, U) { Sound.sfx('shield'); const X = U.x + 22; for (let r = 0; r < 3; r++) { for (let c = 0; c < 2; c++) this.spawn({ k: 'hex', x: X + c * 6, y: U.y - 16 + r * 14, r0: 2, r1: 8, c: (r + c) % 2 ? S.col[1] : S.col[0], life: 26 }); yield* wait(3); } this.spawn({ k: 'glow', x: X, y: U.y, r: 24, c: S.col[0], life: 20 }); yield* wait(12); } },
  stImpact: { col: ['#70a0ff', '#ffffff', '#2a3a90'], pt: 'spark', cast: 'rune', fin: 'nova', snd: 'hitSuper', // a ball of mana that bursts and knocks the foe back
    *f(S, U, T) { Sound.sfx('charge'); yield* bolt11(this, U, T, S, 7, 5); Sound.sfx('hitSuper'); this.spawn({ k: 'shock', x: T.x, y: T.y, r0: 4, r1: 44, c: S.col[0], life: 14 }); this.spawn({ k: 'flash', c: S.col[1], a: 0.2, life: 4 }); imp9(this, T, S, 1); yield* wait(10); } },
  stStorm: { col: ['#a070ff', '#f0e0ff', '#3a1a7a'], pt: 'rune', cast: 'sky', fin: 'none', snd: 'wind', // a storm of mana spins over all of them
    *f(S, U, T, u, t) { Sound.sfx('wind'); const G = grp9(this, T, t); for (let k = 0; k < 3; k++) { for (const C of G) this.spawn({ k: 'ring', x: C.x, y: C.y - 6, r0: 30 - k * 6, r1: 10, c: k % 2 ? S.col[1] : S.col[0], w: 2, life: 12, fl: 0.4 }); yield* wait(3); }
      Sound.sfx('thunder'); for (const C of G) { zig9(this, C.x + rnd(-8, 8), C.y - 40, C.x, C.y, S.col[1], 2); imp9(this, C, S); } yield* wait(10); } },
  stHaste: { col: ['#ffd870', '#ffffff', '#7a5a10'], pt: 'rune', cast: 'rune', snd: 'tick', // a clock face whose hands race round
    *f(S, U) { Sound.sfx('tick'); const X = U.x, Y = U.y - 6; this.spawn({ k: 'ring', x: X, y: Y, r0: 22, r1: 22, c: S.col[0], w: 2, life: 30 }); for (let i = 0; i < 12; i++) { const a = i * 0.9; this.spawn({ k: 'line', x1: X, y1: Y, x2: X + Math.cos(a) * 18, y2: Y + Math.sin(a) * 18, c: i % 2 ? S.col[1] : S.col[0], w: 2, grow: 1, life: 4 }); if (i % 3 === 0) Sound.sfx('tick'); yield; }
      for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: X - 8, y1: Y + 14 + i * 4, x2: X - 30, y2: Y + 14 + i * 4, c: S.col[1], w: 1, grow: 2, life: 12 }); yield* wait(10); } },
  stFinale: { col: ['#ff80ff', '#ffffff', '#5a2a9a'], pt: 'star', cast: 'sky', fin: 'impact', snd: 'quake', // every drop of mana gathers, then one great beam
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'dark', a: 0.5, c: '#140428', life: 34 }); for (let i = 0; i < 10; i++) { const a = i * 0.63; this.spawn({ k: 'line', x1: U.x + Math.cos(a) * 40, y1: U.y + Math.sin(a) * 40, x2: U.x + 8, y2: U.y - 6, c: i % 2 ? S.col[0] : S.col[1], w: 1, grow: 4, life: 14 }); } yield* wait(12);
      Sound.sfx('quake'); ln9(this, U.x + 10, U.y - 6, T.x + 20, T.y, S.col[0], S.col[1], 12, 16); this.spawn({ k: 'shock', x: T.x, y: T.y, r0: 6, r1: 60, c: S.col[0], life: 18 }); this.shake = Math.max(this.shake, 12); imp9(this, T, S, 1); yield* wait(12); } },
  stMax: { col: ['#c060ff', '#ffe0ff', '#4a1080'], pt: 'rune', cast: 'aura', snd: 'charge', // magic circles stack up around the hero
    *f(S, U) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'rune', x: U.x, y: U.y + 18 - i * 16, r: 26 - i * 4, c: S.col[0], c2: S.col[1], n: 8, poly: 6 - i, life: 26 }); yield* wait(4); } aura11(this, U, S, 6); yield* wait(10); } },
  /* ----- 魔導書 ----- */
  tmCurse: { col: ['#9a4ac0', '#f0d0ff', '#2a0a40'], pt: 'crest', cast: 'rune', fin: 'none', snd: 'poison', // dark words fly off the page and wrap the foe
    *f(S, U, T) { Sound.sfx('poison'); for (let i = 0; i < 5; i++) { this.spawn({ k: 'txt', s: '咒', x: lerp(U.x, T.x, i / 5), y: lerp(U.y - 8, T.y, i / 5) + rnd(-6, 6), vy: 0, c: i % 2 ? S.col[0] : S.col[1], life: 10, fade: 1 }); yield* wait(2); }
      this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 24, r1: 8, c: S.col[0], w: 3, life: 14 }); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 18, c: S.col[2], life: 14 }); imp9(this, T, S); yield* wait(8); } },
  tmSlow: { col: ['#d0b080', '#fff0d0', '#5a4020'], pt: 'rune', cast: 'rune', snd: 'tick', // a slow clock closes round the foe's feet
    *f(S, U, T) { Sound.sfx('tick'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y + 20, r0: 30 - i * 6, r1: 18 - i * 4, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 26, fl: 0.4 }); yield* wait(6); Sound.sfx('tick'); }
      for (let i = 0; i < 4; i++) this.spawn({ k: 'line', x1: T.x - 14 + i * 9, y1: T.y + 6, x2: T.x - 14 + i * 9, y2: T.y + 22, c: S.col[2], w: 2, grow: 2, life: 22 }); yield* wait(8); } },
  tmPage: { col: ['#f0e0b0', '#ffffff', '#8a7040'], pt: 'feather', cast: 'still', snd: 'shield', // pages of the book circle the hero like a shield
    *f(S, U) { Sound.sfx('shield'); for (let k = 0; k < 8; k++) { const a = k * 0.785; this.spawn({ k: 'line', x1: U.x + Math.cos(a) * 24, y1: U.y + Math.sin(a) * 20 - 4, x2: U.x + Math.cos(a) * 24 + 5, y2: U.y + Math.sin(a) * 20 + 2, c: k % 2 ? S.col[0] : S.col[1], w: 5, grow: 1, life: 24 }); yield; }
      this.spawn({ k: 'ring', x: U.x, y: U.y - 2, r0: 24, r1: 26, c: S.col[1], w: 1, life: 20 }); for (let i = 0; i < 4; i++) this.spawn({ k: 'circ', x: U.x + rnd(-14, 14), y: U.y - 20, vx: 0, vy: -0.5, g: 0, r: 2, c: '#8ad0ff', life: 18 }); yield* wait(12); } },
  tmChain: { col: ['#a02040', '#ffc0d0', '#200008'], pt: 'crest', cast: 'rune', fin: 'none', snd: 'poison', // links of a dark chain lash the foe
    *f(S, U, T) { Sound.sfx('poison'); zig9(this, U.x + 8, U.y - 6, T.x, T.y, S.col[0], 3, 6, 12); for (let i = 1; i < 6; i++) this.spawn({ k: 'ring', x: lerp(U.x, T.x, i / 6), y: lerp(U.y - 6, T.y, i / 6), r0: 3, r1: 4, c: S.col[1], w: 2, life: 12 }); imp9(this, T, S); yield* wait(5); },
    *h(S, U, T, u, i) { Sound.sfx('poison'); zig9(this, U.x + 8, U.y - 6 + i * 6, T.x, T.y + (i % 2 ? 8 : -8), S.col[0], 3, 6, 12); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 12, c: S.col[2], life: 10 }); yield* wait(5); } },
  tmPages: { col: ['#ffffff', '#fff8e0', '#a09060'], pt: 'feather', cast: 'rune', fin: 'none', snd: 'wind', // the pages tear out and fly at every foe
    *f(S, U, T, u, t) { Sound.sfx('wind'); const G = grp9(this, T, t), x0 = U.x + 8, y0 = U.y - 10, F = 8, P = []; for (const C of G) for (let k = 0; k < 3; k++) P.push([C, this.spawn({ k: 'line', x1: x0, y1: y0, x2: x0 + 6, y2: y0 + 4, c: S.col[k % 2 ? 2 : 0], w: 5, grow: 1, life: F + 3 }), rnd(-10, 10)]);
      for (let i = 1; i <= F; i++) { for (const [C, p, o] of P) { const x = lerp(x0, C.x, i / F), y = lerp(y0, C.y + o, i / F) - Math.sin(i / F * 3) * 10; p.x1 = x; p.y1 = y; p.x2 = x + 6; p.y2 = y + 4; } yield; } for (const C of G) imp9(this, C, S); yield* wait(8); } },
  tmDrain: { col: ['#60e0ff', '#e0fcff', '#1a5a7a'], pt: 'spark2', cast: 'rune', fin: 'none', snd: 'charge', // a spell hits, blue motes of mana flow back
    *f(S, U, T) { Sound.sfx('charge'); yield* bolt11(this, U, T, S, 7, 3); imp9(this, T, S); yield* wait(3); for (let i = 0; i < 8; i++) this.spawn({ k: 'circ', x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 10), vx: (U.x - T.x) / 22, vy: (U.y - T.y) / 22, g: 0, r: 2, c: i % 2 ? S.col[0] : S.col[1], life: 22 }); yield* wait(14); } },
  tmStop: { col: ['#d0d8ff', '#ffffff', '#40486a'], pt: 'rune', cast: 'void', snd: 'tick', // time stops: the foe is caught in still clock rings
    *f(S, U, T) { Sound.sfx('tick'); this.spawn({ k: 'flash', c: '#c8d0ff', a: 0.3, life: 6 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 34, r1: 20 - i * 4, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 30 }); yield* wait(8);
      for (let i = 0; i < 4; i++) { const a = i * 1.57; this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(a) * 22, y2: T.y + Math.sin(a) * 22, c: S.col[1], w: 1, grow: 1, life: 24 }); } this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 24, r1: 26, c: S.col[0], life: 24 }); yield* wait(14); } },
  tmForbid: { col: ['#ffcc40', '#ffffff', '#200a20'], pt: 'eclipse', cast: 'void', fin: 'rift', snd: 'quake', // the forbidden book opens; golden script burns over them all
    *f(S, U, T, u, t) { this.spawn({ k: 'dark', a: 0.6, c: '#100010', life: 36 }); Sound.sfx('charge'); this.spawn({ k: 'rune', x: U.x + 8, y: U.y - 10, r: 18, c: S.col[0], c2: S.col[1], n: 10, poly: 5, life: 30 }); yield* wait(10);
      Sound.sfx('quake'); for (const C of grp9(this, T, t)) { this.spawn({ k: 'rays', x: C.x, y: C.y, n: 10, a0: 0, len: 30, c: S.col[0], life: 18 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'txt', s: '禁', x: C.x + rnd(-14, 14), y: C.y + rnd(-14, 10), vy: -0.5, c: S.col[0], life: 20, fade: 1 }); imp9(this, C, S, 1); } this.shake = Math.max(this.shake, 8); yield* wait(12); } },
  /* ----- 樂器 ----- */
  inShock: { col: ['#60e0c0', '#e0fff8', '#1a6a5a'], pt: 'spark2', cast: 'focus', fin: 'none', snd: 'charge', // rings of sound roll into the foe
    *f(S, U, T) { Sound.sfx('charge'); for (let i = 0; i < 4; i++) { const x = lerp(U.x + 10, T.x, (i + 1) / 4), y = lerp(U.y - 6, T.y, (i + 1) / 4); this.spawn({ k: 'ring', x, y, r0: 4, r1: 10 + i * 3, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 10 }); yield* wait(2); } imp9(this, T, S); yield* wait(8); } },
  inRally: { col: ['#ffc860', '#fff8d0', '#8a5a10'], pt: 'star', cast: 'halo', snd: 'heal', // a rousing tune: golden notes rise around the hero
    *f(S, U) { Sound.sfx('heal'); note11(this, U.x, U.y, S, 8); this.spawn({ k: 'rays', x: U.x, y: U.y - 8, n: 8, a0: 0, len: 24, c: S.col[0], life: 18 }); yield* wait(16); } },
  inHeal: { col: ['#90f0a0', '#ffffff', '#2a8a40'], pt: 'spark', cast: 'halo', snd: 'heal', // a soft melody; notes and light mend the wounds
    *f(S, U) { Sound.sfx('heal'); note11(this, U.x, U.y, S, 6); for (let i = 0; i < 6; i++) this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-18, 18), y: U.y + rnd(0, 20), vy: -0.6, c: S.col[1], life: 22, fade: 1 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 24, c: S.col[0], life: 18 }); yield* wait(16); } },
  inEcho: { col: ['#80b0ff', '#e8f0ff', '#2a4a8a'], pt: 'spark2', cast: 'focus', fin: 'none', snd: 'charge', // one blast, and its echo comes back louder
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 24, c: S.col[0], w: 3, life: 10 }); imp9(this, T, S); yield* wait(6); Sound.sfx('charge'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 32 - i * 8, r1: 4, c: S.col[1], w: 2, life: 10 }); yield* wait(2); } imp9(this, T, S, 1); yield* wait(6); } },
  inWind: { col: ['#a0f0c0', '#ffffff', '#3a8a5a'], pt: 'wind', cast: 'halo', snd: 'wind', // a quick song; wind spirals up around the hero
    *f(S, U) { Sound.sfx('wind'); note11(this, U.x, U.y, S, 5); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y + 18 - i * 14, r0: 24, r1: 10, c: S.col[0], w: 2, life: 14, fl: 0.4 }); yield* wait(3); } yield* wait(10); } },
  inHarmony: { col: ['#c0b0ff', '#ffffff', '#5a4a9a'], pt: 'hex', cast: 'halo', snd: 'shield', // the notes come together into a shield of harmony
    *f(S, U) { Sound.sfx('heal'); note11(this, U.x, U.y, S, 6); yield* wait(6); Sound.sfx('shield'); for (let i = 0; i < 2; i++) this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 8, r1: 26 + i * 4, c: i ? S.col[1] : S.col[0], life: 20 }); yield* wait(12); } },
  inRoar: { col: ['#ff9a40', '#fff0d0', '#8a3a10'], pt: 'spark', cast: 'focus', fin: 'impact', snd: 'quake', // a roar of sound that shakes the whole field
    *f(S, U, T, u, t) { Sound.sfx('quake'); for (let i = 0; i < 4; i++) { this.spawn({ k: 'ring', x: U.x + 10, y: U.y, r0: 10 + i * 20, r1: 40 + i * 30, c: i % 2 ? S.col[1] : S.col[0], w: 3, life: 14 }); this.shake = Math.max(this.shake, 6); yield* wait(3); }
      for (const C of grp9(this, T, t)) imp9(this, C, S); yield* wait(10); } },
  inHero: { col: ['#ffe060', '#ffffff', '#a06010'], pt: 'star', cast: 'halo', snd: 'heal', // the hymn of heroes: a column of gold light and notes
    *f(S, U) { Sound.sfx('charge'); this.spawn({ k: 'pillar', x: U.x, y: U.y + 22, w: 26, h: 140, c: S.col[0], life: 24 }); yield* wait(6); Sound.sfx('heal'); note11(this, U.x, U.y, S, 8); this.spawn({ k: 'rays', x: U.x, y: U.y - 6, n: 12, a0: 0, len: 34, c: S.col[1], life: 20 }); yield* wait(16); } },
  /* ----- 火槍 ----- */
  gnRapid: { col: ['#ffe080', '#ffffff', '#806020'], pt: 'spark', cast: 'dash', fin: 'none', snd: 'crit', // bang, bang
    *f(S, U, T) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 14, y: U.y - 6, r: 8, c: S.col[0], life: 5 }); ln9(this, U.x + 14, U.y - 6, T.x, T.y, S.col[0], S.col[1], 2, 6); imp9(this, T, S); yield* wait(4); },
    *h(S, U, T) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 14, y: U.y - 4, r: 8, c: S.col[0], life: 5 }); ln9(this, U.x + 14, U.y - 4, T.x, T.y + 6, S.col[0], S.col[1], 2, 6); imp9(this, { x: T.x, y: T.y + 6 }, S); yield* wait(4); } },
  gnAim: { col: ['#ff5050', '#ffe0e0', '#801010'], pt: 'spark2', cast: 'focus', fin: 'pop', snd: 'crit', // the crosshair settles, then one clean shot
    *f(S, U, T) { Sound.sfx('tick'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 26, r1: 10, c: S.col[0], w: 1, life: 16 }); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) this.spawn({ k: 'line', x1: T.x + dx * 24, y1: T.y + dy * 24, x2: T.x + dx * 8, y2: T.y + dy * 8, c: S.col[1], w: 1, grow: 3, life: 16 }); yield* wait(10);
      Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 14, y: U.y - 6, r: 10, c: S.col[1], life: 6 }); ln9(this, U.x + 14, U.y - 6, T.x, T.y, S.col[0], S.col[1], 3, 8); this.star(T.x, T.y, S.col[1], 10); imp9(this, T, S, 1); yield* wait(8); } },
  gnPara: { col: ['#fff040', '#ffffff', '#6060ff'], pt: 'spark', cast: 'dash', fin: 'none', snd: 'thunder', // a bullet that crackles with lightning
    *f(S, U, T) { Sound.sfx('crit'); ln9(this, U.x + 14, U.y - 6, T.x, T.y, S.col[0], S.col[1], 2, 6); yield* wait(2); Sound.sfx('thunder'); for (let i = 0; i < 4; i++) zig9(this, T.x, T.y, T.x + rnd(-22, 22), T.y + rnd(-22, 22), i % 2 ? S.col[0] : S.col[2], 2, 4, 12); imp9(this, T, S); yield* wait(8); } },
  gnSpray: { col: ['#e0c060', '#fff8d0', '#6a5020'], pt: 'spark', cast: 'dash', fin: 'none', snd: 'crit', // the barrel swings across the line, spraying shots
    *f(S, U, T, u, t) { for (const C of grp9(this, T, t)) { Sound.sfx('crit'); ln9(this, U.x + 14, U.y - 6, C.x, C.y + rnd(-6, 6), S.col[0], S.col[1], 2, 6); imp9(this, C, S); yield* wait(2); } },
    *h(S, U, T, u, i, t) { for (const C of grp9(this, T, t)) { Sound.sfx('crit'); ln9(this, U.x + 14, U.y - 4, C.x, C.y + rnd(-10, 10), S.col[0], S.col[1], 2, 6); w12Particle(this, C.x, C.y, S, 3, 8); yield* wait(2); } } },
  gnAp: { col: ['#80e0ff', '#ffffff', '#2a5a7a'], pt: 'shard', cast: 'focus', fin: 'pop', snd: 'crit', // a tracer that punches straight through
    *f(S, U, T) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 14, y: U.y - 6, r: 10, c: S.col[1], life: 6 }); ln9(this, U.x + 14, U.y - 6, T.x + 40, T.y + 2, S.col[0], S.col[1], 3, 8);
      this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 18, c: S.col[1], life: 10 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'shard', g: 0.1, x: T.x + 12, y: T.y, vx: rnd(10, 25) / 10, vy: rnd(-12, 12) / 10, s: 3, c: S.col[0], life: 16 }); imp9(this, T, S); yield* wait(8); } },
  gnSmoke: { col: ['#909090', '#e0e0e0', '#404040'], pt: 'smoke', cast: 'still', snd: 'wind', // a canister pops and smoke rolls over the field
    *f(S, U, T) { Sound.sfx('tick'); const x0 = U.x + 10, y0 = U.y - 10; for (let i = 1; i <= 8; i++) { this.spawn({ k: 'circ', x: lerp(x0, T.x - 20, i / 8), y: lerp(y0, T.y + 16, i / 8) - Math.sin(i / 8 * 3.14) * 24, vx: 0, vy: 0, g: 0, r: 3, c: S.col[2], life: 3 }); yield; }
      Sound.sfx('wind'); for (let i = 0; i < 14; i++) this.spawn({ k: 'glow', x: lerp(U.x, T.x, Math.random()) + rnd(-10, 10), y: (U.y + T.y) / 2 + rnd(-14, 24), r: rnd(10, 18), c: i % 2 ? S.col[0] : S.col[2], life: 26 });
      for (let k = 0; k < 3; k++) { for (let i = 0; i < 8; i++) this.spawn({ k: 'glow', x: T.x + rnd(-46, 46), y: T.y + rnd(-10, 26), vx: rnd(-4, 4) / 10, vy: -rnd(1, 4) / 10, r: rnd(14, 22), c: ['#f4f4f4', '#d0d0d0'][i % 2], life: 30 }); yield* wait(3); } yield* wait(14); } },
  gnBarrage: { col: ['#ffa040', '#fff0c0', '#803010'], pt: 'ember', cast: 'dash', fin: 'none', snd: 'crit', // a curtain of shots and bursts over them all
    *f(S, U, T, u, t) { for (const C of grp9(this, T, t)) { Sound.sfx('crit'); ln9(this, U.x + 14, U.y - 6, C.x + rnd(-8, 8), C.y + rnd(-8, 8), S.col[0], S.col[1], 2, 5); } yield* wait(3); },
    *h(S, U, T, u, i, t) { for (const C of grp9(this, T, t)) { const x = C.x + rnd(-12, 12), y = C.y + rnd(-12, 12); ln9(this, U.x + 14, U.y - 6 + rnd(-4, 4), x, y, S.col[0], S.col[1], 2, 5); this.spawn({ k: 'glow', x, y, r: 10, c: S.col[0], life: 8 }); for (let k = 0; k < 2; k++) this.spawn({ k: 'flame', x, y, vy: -1, s: 3, life: 10 }); } Sound.sfx(i % 2 ? 'crit' : 'fire'); yield* wait(3); } },
  gnSnipe: { col: ['#ffd060', '#ffffff', '#5a3a10'], pt: 'ray', cast: 'focus', fin: 'pop', snd: 'crit', // the hawk's eye: the scope narrows, one shot across the field
    *f(S, U, T) { this.spawn({ k: 'dark', a: 0.35, c: '#100800', life: 24 }); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 34 - i * 8, r1: 6, c: i % 2 ? S.col[1] : S.col[0], w: 1, life: 14 }); Sound.sfx('tick'); yield* wait(4); }
      Sound.sfx('crit'); this.spawn({ k: 'flash', c: S.col[1], a: 0.35, life: 5 }); ln9(this, U.x + 14, U.y - 6, T.x + 60, T.y + 4, S.col[0], S.col[1], 4, 12); this.star(T.x, T.y, S.col[1], 14); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 6); yield* wait(10); } },
  /* ----- 雙刀 ----- */
  ddSpin: { col: ['#d0d8e8', '#ffffff', '#506078'], pt: 'spark2', cast: 'dash', fin: 'none', snd: 'slash', // left hand, right hand, left, right
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); sl11(this, T, -0.9, 18, S, 3); yield* wait(3); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); sl11(this, T, i % 2 ? -0.9 : 0.9, 18, S, 3); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 12, ang: i * 1.6, c: S.col[1], c2: S.col[0], w: 2, life: 8 }); yield* wait(3); } },
  ddCross: { col: ['#ff8080', '#ffffff', '#702020'], pt: 'spark', cast: 'dash', fin: 'xcut', snd: 'slash', // both blades in at once: an X through the guard
    *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('slash'); th11(this, { x: T.x - 30, y: T.y - 20 }, T, S, 3, 14); yield* wait(2); },
    *h(S, U, T) { Sound.sfx('crit'); th11(this, { x: T.x - 30, y: T.y + 20 }, T, S, 3, 14); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 14, c: S.col[1], life: 10 }); imp9(this, T, S); yield* wait(5); } },
  ddDance: { col: ['#6aa0ff', '#e8f4ff', '#1a3a80'], pt: 'feather', cast: 'dash', fin: 'none', snd: 'slash', // seven cuts like swallows darting
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); sl11(this, T, Math.random() * 3, 18, S, 2); yield* wait(2); },
    *h(S, U, T) { Sound.sfx('slash'); sl11(this, { x: T.x + rnd(-6, 6), y: T.y + rnd(-6, 6) }, Math.random() * 3, 18, S, 2); w12Particle(this, T.x, T.y, S, 2, 10); yield* wait(2); } },
  ddAfter: { col: ['#8a6ab0', '#e8d8ff', '#2a1a40'], pt: 'shadow', cast: 'still', snd: 'wind', // afterimages crowd around the hero, blades out
    *f(S, U) { Sound.sfx('wind'); for (let i = 0; i < 4; i++) { const dx = [-18, 18, -10, 12][i]; this.spawn({ k: 'glow', x: U.x + dx, y: U.y + (i % 2 ? 4 : -4), r: 14, c: i % 2 ? S.col[0] : S.col[2], life: 24 }); this.spawn({ k: 'line', x1: U.x + dx - 6, y1: U.y - 6, x2: U.x + dx + 6, y2: U.y + 6, c: S.col[1], w: 1, grow: 2, life: 20 }); yield* wait(3); } yield* wait(10); } },
  ddGale: { col: ['#70f0a0', '#ffffff', '#1a7a40'], pt: 'wind', cast: 'dash', fin: 'none', snd: 'wind', // too fast to see: thin lines of wind all over the foe
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('wind'); for (let i = 0; i < 3; i++) sl11(this, { x: T.x + rnd(-8, 8), y: T.y + rnd(-8, 8) }, Math.random() * 3.14, 20, S, 1, 8); yield* wait(2); },
    *h(S, U, T, u, i) { if (i % 2) Sound.sfx('slash'); sl11(this, { x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 10) }, Math.random() * 3.14, 20, S, 1, 8); yield* wait(1); } },
  ddFang: { col: ['#e02040', '#ffd0d8', '#400010'], pt: 'claw2', cast: 'still', fin: 'crimson', snd: 'crit', // two fangs close on the prey
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('crit'); th11(this, { x: T.x - 30, y: T.y - 16 }, T, S, 4, 10); yield* wait(2); },
    *h(S, U, T) { Sound.sfx('crit'); th11(this, { x: T.x - 30, y: T.y + 16 }, T, S, 4, 10); this.spawn({ k: 'flash', c: S.col[0], a: 0.25, life: 5 }); imp9(this, T, S, 1); yield* wait(6); } },
  /* ----- 雙劍 ----- */
  dsMoon: { col: ['#d0e0ff', '#ffffff', '#4a5a90'], pt: 'star', cast: 'draw', fin: 'xcut', snd: 'slash', // two moons cut across each other
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x - 6, y: T.y, r: 20, ang: -0.6, c: S.col[1], c2: S.col[0], w: 4, life: 14 }); yield* wait(3); },
    *h(S, U, T) { Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x + 6, y: T.y, r: 20, ang: 2.5, c: S.col[1], c2: S.col[0], w: 4, life: 14 }); this.star(T.x, T.y, S.col[1], 10); imp9(this, T, S); yield* wait(5); } },
  dsParry: { col: ['#ffd890', '#ffffff', '#806030'], pt: 'spark', cast: 'hex', snd: 'shield', // the two swords crossed in front, waiting
    *f(S, U) { Sound.sfx('shield'); const X = U.x + 22, Y = U.y - 4; ln9(this, X - 14, Y - 16, X + 14, Y + 16, S.col[0], S.col[1], 4, 24); ln9(this, X + 14, Y - 16, X - 14, Y + 16, S.col[0], S.col[1], 4, 24); this.star(X, Y, S.col[1], 16); yield* wait(14); } },
  dsWhirl: { col: ['#80f0ff', '#ffffff', '#2a7a90'], pt: 'wind', cast: 'dash', fin: 'gust', snd: 'wind', // two blades spun round, two rings over them all
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 3); Sound.sfx('wind'); for (const C of grp9(this, T, t)) this.spawn({ k: 'cres', x: C.x, y: C.y, r: 18, ang: 0.4, c: S.col[1], c2: S.col[0], w: 4, life: 12 }); yield* wait(3); },
    *h(S, U, T, u, i, t) { Sound.sfx('wind'); for (const C of grp9(this, T, t)) { this.spawn({ k: 'cres', x: C.x, y: C.y, r: 18, ang: 3.5, c: S.col[1], c2: S.col[0], w: 4, life: 12 }); imp9(this, C, S); } yield* wait(5); } },
  dsPhantom: { col: ['#b090ff', '#ffffff', '#40308a'], pt: 'shadow', cast: 'dash', fin: 'none', snd: 'slash', // phantom copies join in, one more each time
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); sl11(this, T, -0.7, 20, S, 3); yield* wait(2); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); const g = this.spawn({ k: 'glow', x: T.x + (i % 2 ? 24 : -24), y: T.y + rnd(-8, 8), r: 10, c: S.col[2], life: 12 }); sl11(this, T, i % 2 ? 0.7 : -0.7, 20, S, 3); w12Particle(this, T.x, T.y, S, 2, 8); yield* wait(3); } },
  dsStar: { col: ['#ffe070', '#ffffff', '#806010'], pt: 'star', cast: 'draw', fin: 'xcut', snd: 'crit', // two crosses of starlight
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); sl11(this, T, 0.78, 24, S, 5); sl11(this, T, -0.78, 24, S, 5); this.star(T.x, T.y, S.col[1], 12); yield* wait(4); },
    *h(S, U, T) { Sound.sfx('crit'); sl11(this, T, 0, 26, S, 5); sl11(this, T, 1.57, 26, S, 5); for (let i = 0; i < 4; i++) this.star(T.x + rnd(-18, 18), T.y + rnd(-18, 18), S.col[1], 10); imp9(this, T, S, 1); yield* wait(6); } },
  dsDance: { col: ['#ff90c0', '#fff0f8', '#802050'], pt: 'feather', cast: 'aura', snd: 'wind', // the swords dance round the hero
    *f(S, U) { Sound.sfx('wind'); for (let k = 0; k < 8; k++) { const a = k * 0.785; this.spawn({ k: 'cres', x: U.x + Math.cos(a) * 20, y: U.y + Math.sin(a) * 16, r: 8, ang: a, c: S.col[1], c2: S.col[0], w: 3, life: 14 }); yield; } this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 28, c: S.col[0], w: 2, life: 14 }); yield* wait(10); } },
  /* ----- 雙盾 ----- */
  shBash: { col: ['#c0a070', '#fff0d0', '#6a5030'], pt: 'crest', cast: 'hex', fin: 'bash', snd: 'heavy', // both shields slammed in
    *f(S, U, T, u) { yield* this.lunge(u, 14, 3); Sound.sfx('shield'); this.spawn({ k: 'hex', x: T.x - 8, y: T.y, r0: 18, r1: 8, c: S.col[1], life: 12 }); this.spawn({ k: 'hex', x: T.x + 8, y: T.y, r0: 18, r1: 8, c: S.col[0], life: 12 }); this.shake = Math.max(this.shake, 5); yield* wait(4); imp9(this, T, S); yield* wait(8); } },
  shStance: { col: ['#a0b0c8', '#ffffff', '#40506a'], pt: 'hex', cast: 'hex', snd: 'shield', // two shields locked into a wall
    *f(S, U) { Sound.sfx('shield'); const X = U.x + 20; this.spawn({ k: 'hex', x: X, y: U.y - 8, r0: 6, r1: 14, c: S.col[0], life: 24 }); yield* wait(3); this.spawn({ k: 'hex', x: X, y: U.y + 10, r0: 6, r1: 14, c: S.col[1], life: 24 }); yield* wait(3);
      this.spawn({ k: 'line', x1: X + 14, y1: U.y - 24, x2: X + 14, y2: U.y + 24, c: S.col[1], w: 2, grow: 4, life: 20 }); this.shake = Math.max(this.shake, 2); yield* wait(12); } },
  shRam: { col: ['#ff9a50', '#fff0d0', '#8a4a20'], pt: 'rock', cast: 'dash', fin: 'bash', snd: 'heavy', // a charge behind the shields; the more held back, the harder
    *f(S, U, T, u) { for (let i = 0; i < 4; i++) this.spawn({ k: 'line', x1: lerp(U.x, T.x, i / 5), y1: U.y + rnd(-8, 8), x2: lerp(U.x, T.x, i / 5) - 14, y2: U.y + rnd(-8, 8), c: S.col[0], w: 2, grow: 3, life: 10 }); yield* this.lunge(u, 26, 3); Sound.sfx('heavy');
      this.spawn({ k: 'hex', x: T.x - 6, y: T.y, r0: 20, r1: 6, c: S.col[1], life: 12 }); this.spawn({ k: 'shock', x: T.x, y: T.y, r0: 4, r1: 40, c: S.col[0], life: 14 }); this.shake = Math.max(this.shake, 8); imp9(this, T, S, 1); yield* wait(8); } },
  shReflect: { col: ['#c0f0ff', '#ffffff', '#4080a0'], pt: 'shard', cast: 'hex', snd: 'shield', // a mirror-bright face on the shields
    *f(S, U) { Sound.sfx('shield'); const X = U.x + 20; for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: X, y: U.y, r0: 22 - i * 6, r1: 22 - i * 6, c: i % 2 ? S.col[1] : S.col[0], life: 22 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'line', x1: X - 10, y1: U.y - 16 + i * 8, x2: X + 10, y2: U.y - 20 + i * 8, c: S.col[1], w: 1, grow: 2, life: 18 }); yield* wait(14); } },
  shCrash: { col: ['#e0c060', '#ffffff', '#5a4010'], pt: 'rock', cast: 'sky', fin: 'impact', snd: 'quake', // up high, then both shields come down together
    *f(S, U, T, u) { yield* this.lunge(u, 14, 3); Sound.sfx('heavy'); for (let i = 1; i <= 4; i++) { this.spawn({ k: 'hex', x: T.x - 8, y: T.y - 70 + i * 16, r0: 10, r1: 12, c: S.col[0], life: 6 }); this.spawn({ k: 'hex', x: T.x + 8, y: T.y - 70 + i * 16, r0: 10, r1: 12, c: S.col[1], life: 6 }); yield; }
      Sound.sfx('quake'); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 8, r1: 70, c: S.col[0], life: 18 }); this.shake = Math.max(this.shake, 13); imp9(this, T, S, 1); yield* wait(12); } },
  shFort: { col: ['#d0c090', '#ffffff', '#5a5030'], pt: 'rock', cast: 'hex', snd: 'quake', // a fortress rises round the hero, row by row
    *f(S, U) { Sound.sfx('quake'); for (const sx of [-1, 1]) this.spawn({ k: 'line', x1: U.x + sx * 38, y1: U.y + 12, x2: U.x + sx * 38, y2: U.y - 34, c: S.col[2], w: 7, grow: 6, life: 34 });
      for (let r = 0; r < 3; r++) { const y = U.y + 2 - r * 10; for (let b = -3; b <= 2; b++) { const x = U.x + b * 12 + (r % 2 ? 6 : 0); this.spawn({ k: 'line', x1: x, y1: y, x2: x + 10, y2: y, c: (b + r) % 2 ? S.col[0] : S.col[2], w: 6, grow: 2, life: 28 }); } this.shake = Math.max(this.shake, 3); yield* wait(3); }
      this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c: S.col[1], life: 20 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-18, 18), y: U.y + rnd(-4, 16), vy: -0.6, c: '#a0ffb0', life: 20, fade: 1 }); yield* wait(12); } },
};
/* ----- 絕技（職業退場：原本各職業的代表招）和戰技樹的兩招 ----- */
Object.assign(FX11, {
  zjSky: { col: ['#e8f0ff', '#ffffff', '#3050a0'], pt: 'spark2', cast: 'still', fin: 'flash', snd: 'crit', // 一刀天斷: the blade is drawn and the world goes still for one cut
    *f(S, U, T, u) { this.spawn({ k: 'dark', a: 0.5, c: '#080818', life: 26 }); Sound.sfx('tick'); this.spawn({ k: 'line', x1: U.x + 6, y1: U.y - 4, x2: U.x + 20, y2: U.y - 4, c: S.col[1], w: 2, grow: 3, life: 10 }); yield* wait(8);
      yield* this.lunge(u, 26, 2); Sound.sfx('crit'); ln9(this, T.x - 50, T.y + 6, T.x + 50, T.y - 6, S.col[0], S.col[1], 4, 16); this.spawn({ k: 'flash', c: '#ffffff', a: 0.45, life: 5 }); yield* wait(4);
      for (let i = 0; i < 5; i++) this.spawn({ k: 'line', x1: T.x - 40 + i * 20, y1: T.y - 20, x2: T.x - 34 + i * 20, y2: T.y + 20, c: S.col[0], w: 1, grow: 2, life: 10 }); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 8); yield* wait(10); } },
  zjRune: { col: ['#b080ff', '#f8f0ff', '#402080'], pt: 'rune', cast: 'rune', fin: 'burst', snd: 'slash', // 星紋魔劍: a cut, then two rune bolts
    *f(S, U, T, u) { yield* this.lunge(u, 14, 3); Sound.sfx('slash'); sl11(this, T, -0.7, 26, S, 6); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 6, r1: 22, c: S.col[0], life: 14 }); yield* wait(5);
      for (let k = 0; k < 2; k++) { Sound.sfx('charge'); yield* bolt11(this, U, { x: T.x + (k ? 8 : -8), y: T.y }, S, 6, 3); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 20, c: S.col[1], w: 2, life: 10 }); this.star(T.x, T.y, S.col[0], 10); yield* wait(3); }
      this.spawn({ k: 'glow', x: U.x, y: U.y, r: 16, c: '#80b0ff', life: 12 }); yield* wait(8); } },
  zjSwallow: { col: ['#a0e0ff', '#ffffff', '#20608a'], pt: 'wind', cast: 'dash', fin: 'cut', snd: 'slash', // 迴燕雙斷: a swallow-turn — one sweep out, one back
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 24, ang: 0.4, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); yield* wait(4);
      Sound.sfx('crit'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 24, ang: 3.5, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); for (let i = 0; i < 4; i++) this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(i * 1.6) * 30, y2: T.y + Math.sin(i * 1.6) * 20, c: S.col[1], w: 1, grow: 2, life: 10 }); imp9(this, T, S, 1); yield* wait(10); } },
  zjObsidian: { col: ['#6a4a8a', '#e0d0ff', '#100818'], pt: 'shadow', cast: 'void', fin: 'impact', snd: 'heavy', // 黑曜終劍: a black blade falls from the dark
    *f(S, U, T, u) { this.spawn({ k: 'dark', a: 0.55, c: '#0a0410', life: 30 }); Sound.sfx('charge'); for (let i = 0; i < 6; i++) this.spawn({ k: 'glow', x: T.x + rnd(-30, 30), y: T.y - 40 + rnd(-10, 10), r: 10, c: S.col[0], life: 16 }); yield* wait(8);
      yield* this.lunge(u, 16, 3); Sound.sfx('heavy'); ln9(this, T.x, T.y - 70, T.x, T.y + 16, S.col[0], S.col[1], 9, 16); this.spawn({ k: 'shock', x: T.x, y: T.y + 18, r0: 4, r1: 44, c: S.col[1], life: 14 }); this.shake = Math.max(this.shake, 10); imp9(this, T, S, 1); yield* wait(10); } },
  zjMoonFang: { col: ['#e0e8ff', '#ffffff', '#405080'], pt: 'crescent', cast: 'dash', fin: 'none', snd: 'slash', // 月影雙牙: two fangs of moonlight
    *f(S, U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('slash'); this.spawn({ k: 'arc', x: T.x - 6, y: T.y, r: 16, a0: -0.6, c: S.col[0], life: 12 }); sl11(this, T, -1.1, 18, S, 3); yield* wait(5); },
    *h(S, U, T) { Sound.sfx('crit'); this.spawn({ k: 'arc', x: T.x + 6, y: T.y, r: 16, a0: 2.4, c: S.col[1], life: 12 }); sl11(this, T, 1.1, 18, S, 3); this.star(T.x, T.y, S.col[1], 10); yield* wait(6); } },
  zjBloom: { col: ['#ff9ac8', '#fff0f8', '#802050'], pt: 'leaf', cast: 'dash', fin: 'none', snd: 'wind', // 旋花飛刃: blades spin like petals over them all
    *f(S, U, T, u, t) { Sound.sfx('wind'); for (let w = 0; w < 3; w++) { for (const C of grp9(this, T, t)) { for (let i = 0; i < 6; i++) { const a = i * 1.05 + w * 0.5; this.spawn({ k: 'line', x1: C.x + Math.cos(a) * 26, y1: C.y + Math.sin(a) * 16, x2: C.x + Math.cos(a + 0.7) * 26, y2: C.y + Math.sin(a + 0.7) * 16, c: i % 2 ? S.col[0] : S.col[1], w: 3, grow: 2, life: 12 }); }
        this.spawn({ k: 'dot', x: C.x + rnd(-20, 20), y: C.y + rnd(-14, 14), vx: rnd(-10, 10) / 10, vy: rnd(-10, 4) / 10, s: 3, c: S.col[0], life: 20 }); } yield* wait(4); } yield* wait(4); },
    *h(S, U, T, u, i, t) { Sound.sfx('slash'); for (const C of grp9(this, T, t)) { this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 20, r1: 6, c: S.col[0], w: 2, life: 10 }); w12Particle(this, C.x, C.y, S, 5, 14); } yield* wait(5); } },
  zjIronLaw: { col: ['#b0b8c8', '#ffffff', '#3a4050'], pt: 'shard', cast: 'aura', fin: 'impact', snd: 'heavy', // 鐵律重斧: an iron-grey weight comes down like a verdict
    *f(S, U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 8, r1: 24, c: S.col[0], life: 14 }); yield* wait(6); yield* this.lunge(u, 16, 3); Sound.sfx('heavy');
      this.spawn({ k: 'line', x1: T.x - 22, y1: T.y - 40, x2: T.x + 22, y2: T.y - 40, c: S.col[0], w: 6, grow: 2, life: 14 }); ln9(this, T.x, T.y - 40, T.x, T.y + 12, S.col[0], S.col[1], 8, 14); yield* wait(3);
      this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 4, r1: 46, c: S.col[0], life: 14 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'shard', g: 0.2, x: T.x, y: T.y, vx: rnd(-20, 20) / 10, vy: -rnd(10, 25) / 10, s: 4, c: S.col[0], life: 22 }); this.shake = Math.max(this.shake, 9); yield* wait(10); } },
  zjHolyWall: { col: ['#ffe8a0', '#ffffff', '#a07a20'], pt: 'hex', cast: 'hex', fin: 'impact', snd: 'shield', // 聖壁衝鋒: a wall of light charges in, then shields the hero
    *f(S, U, T, u) { Sound.sfx('shield'); for (let i = -2; i <= 2; i++) this.spawn({ k: 'hex', x: U.x + i * 10, y: U.y - 20, r0: 4, r1: 9, c: S.col[0], life: 16 }); yield* wait(5); yield* this.lunge(u, 22, 3);
      Sound.sfx('heavy'); for (let i = -2; i <= 2; i++) this.spawn({ k: 'hex', x: T.x + i * 10, y: T.y, r0: 12, r1: 4, c: S.col[1], life: 12 }); this.spawn({ k: 'flash', c: S.col[0], a: 0.3, life: 6 }); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 7); yield* wait(10); } },
  zjFourFold: { col: ['#ff8040', '#40a0ff', '#f0d040'], pt: 'star', cast: 'rune', fin: 'burst', snd: 'charge', // 四象奔流: fire, water, thunder, leaf — four streams in turn
    *f(S, U, T) { const E = [['#ff7030', 'fire'], ['#40a0ff', 'water'], ['#f8d040', 'thunder'], ['#60d060', 'leaf']]; Sound.sfx('charge'); this.spawn({ k: 'hex', x: U.x, y: U.y + 16, r0: 30, r1: 10, c: '#ffffff', life: 16 }); yield* wait(5);
      for (const [c, snd] of E) { const s2 = { col: [c, '#ffffff', c] }; Sound.sfx(snd); yield* bolt11(this, U, T, s2, 5, 3); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 20, c, life: 10 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 22, c, w: 2, life: 10 }); yield* wait(2); }
      this.spawn({ k: 'flash', c: '#ffffff', a: 0.25, life: 5 }); yield* wait(8); } },
  zjStarPage: { col: ['#d0d8ff', '#ffffff', '#3040a0'], pt: 'star', cast: 'sky', fin: 'none', snd: 'charge', // 星辰墜頁: pages of starlight fall on them all
    *f(S, U, T, u, t) { this.spawn({ k: 'dark', a: 0.4, c: '#080a20', life: 30 }); Sound.sfx('charge'); yield* wait(6);
      for (let k = 0; k < 3; k++) { for (const C of grp9(this, T, t)) { const x = C.x + rnd(-14, 14); ln9(this, x + 20, C.y - 70, x, C.y, S.col[0], S.col[1], 3, 12); this.spawn({ k: 'line', x1: x - 4, y1: C.y - 2, x2: x + 4, y2: C.y + 2, c: S.col[1], w: 5, grow: 1, life: 10 }); this.star(x, C.y, S.col[1], 10); } Sound.sfx('hit'); yield* wait(4); }
      yield* wait(8); } },
  zjOverture: { col: ['#ffd8a0', '#fff8e8', '#a06030'], pt: 'note', cast: 'aura', snd: 'statUp', // 迴響序曲: an overture — notes rise, light rings out
    *f(S, U) { Sound.sfx('statUp'); note11(this, U.x, U.y - 10, S, 8); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6 + i * 6, r1: 30 + i * 10, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 16 + i * 3 }); yield* wait(10);
      this.spawn({ k: 'glow', x: U.x, y: U.y, r: 26, c: '#a0ffb0', life: 16 }); Sound.sfx('heal'); yield* wait(10); } },
  zjFinale: { col: ['#ff80c0', '#ffe0f0', '#701040'], pt: 'note', cast: 'aura', fin: 'burst', snd: 'buzz', // 終章頌歌: the closing hymn crashes over them all
    *f(S, U, T, u, t) { Sound.sfx('buzz'); note11(this, U.x, U.y - 12, S, 6); for (let k = 0; k < 4; k++) { this.spawn({ k: 'ring', x: lerp(U.x, T.x, k / 4), y: lerp(U.y, T.y, k / 4), r0: 6, r1: 24, c: k % 2 ? S.col[1] : S.col[0], w: 3, life: 10 }); yield* wait(2); }
      for (const C of grp9(this, T, t)) { note11(this, C.x, C.y - 10, S, 3); this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4, r1: 34, c: S.col[0], w: 3, life: 14 }); imp9(this, C, S); } this.spawn({ k: 'flash', c: S.col[0], a: 0.2, life: 6 }); yield* wait(10); } },
  zjGearGun: { col: ['#d0a050', '#fff0c0', '#604020'], pt: 'gear', cast: 'hex', fin: 'impact', snd: 'heavy', // 齒輪砲台: the cannon fires and a little turret clicks into place
    *f(S, U, T, u) { Sound.sfx('heavy'); this.spawn({ k: 'glow', x: U.x + 16, y: U.y - 10, r: 14, c: '#fff0a0', life: 6 }); ln9(this, U.x + 16, U.y - 10, T.x, T.y, S.col[0], S.col[1], 5, 8); yield* wait(3); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 6); yield* wait(6);
      const X = U.x - 26, Y = U.y + 10; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; this.spawn({ k: 'circ', x: X + Math.cos(a) * 7, y: Y + Math.sin(a) * 7, vx: 0, vy: 0, g: 0, r: 2, c: S.col[0], life: 22 }); } this.spawn({ k: 'ring', x: X, y: Y, r0: 2, r1: 12, c: S.col[1], w: 2, life: 14 }); Sound.sfx('tick'); yield* wait(10); } },
  zjRedShell: { col: ['#ff5020', '#ffd0a0', '#701808'], pt: 'flame', cast: 'still', fin: 'burst', snd: 'fire', // 赤焰彈: a red shell bursts into flame
    *f(S, U, T) { Sound.sfx('crit'); ln9(this, U.x + 16, U.y - 10, T.x, T.y, S.col[0], S.col[1], 3, 8); yield* wait(3); Sound.sfx('fire'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 28, c: S.col[0], life: 14 });
      for (let i = 0; i < 10; i++) this.spawn({ k: 'flame', x: T.x + rnd(-14, 14), y: T.y + rnd(-6, 12), vy: -1.4, s: 4, life: 18 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30, c: S.col[1], w: 3, life: 12 }); yield* wait(10); } },
  zjThousand: { col: ['#ffc060', '#fff8e0', '#a05010'], pt: 'chi', cast: 'aura', fin: 'none', snd: 'heavy', // 千手寸勁: palm after palm, the chi spent with each
    *f(S, U, T, u) { Sound.sfx('charge'); aura11(this, U, S, 8); yield* wait(5); yield* this.lunge(u, 18, 2); Sound.sfx('heavy');
      for (let i = 0; i < 6; i++) { const ox = [-8, 10, -14, 6, 14, -4][i], oy = [0, -10, 8, 10, -4, -14][i]; this.spawn({ k: 'ring', x: T.x + ox, y: T.y + oy, r0: 2, r1: 16, c: S.col[i % 2], w: 3, life: 9 }); this.star(T.x + ox, T.y + oy, S.col[1], 9); this.shake = Math.max(this.shake, 2); yield* wait(2); } yield* wait(2); },
    *h(S, U, T, u, i) { Sound.sfx('heavy'); const ox = [8, -6, 4, -10, 10][i % 5], oy = [-6, 6, -10, 2, 8][i % 5]; this.spawn({ k: 'ring', x: T.x + ox, y: T.y + oy, r0: 2, r1: 14, c: S.col[0], w: 3, life: 8 }); this.star(T.x + ox, T.y + oy, S.col[1], 8); this.shake = Math.max(this.shake, 2); yield* wait(3); } },
  zjQuake: { col: ['#ffb040', '#ffffff', '#804010'], pt: 'chi', cast: 'aura', fin: 'impact', snd: 'quake', // 裂地神掌: one palm that cracks the ground open
    *f(S, U, T, u) { Sound.sfx('charge'); aura11(this, U, S, 12); this.spawn({ k: 'glow', x: U.x + 12, y: U.y - 8, r: 18, c: S.col[0], life: 16 }); yield* wait(8); yield* this.lunge(u, 22, 3);
      Sound.sfx('quake'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 34, c: S.col[0], life: 12 }); for (let i = 0; i < 4; i++) zig9(this, T.x, T.y + 10, T.x + (i - 1.5) * 26, T.y + 30, S.col[2], 3, 4, 16); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 6, r1: 56, c: S.col[0], life: 16 });
      this.shake = Math.max(this.shake, 12); imp9(this, T, S, 1); yield* wait(10); } },
  zjAzure: { col: ['#60c0ff', '#f0faff', '#103a70'], pt: 'wind', cast: 'sky', fin: 'impact', snd: 'wind', // 蒼龍躍: the hero comes down like a blue dragon
    *f(S, U, T, u) { Sound.sfx('wind'); ln9(this, T.x + 30, T.y - 90, T.x, T.y + 6, S.col[0], S.col[1], 7, 14); for (let i = 0; i < 6; i++) this.spawn({ k: 'line', x1: T.x + 30 - i * 5 + rnd(-8, 8), y1: T.y - 90 + i * 15, x2: T.x + 36 - i * 5, y2: T.y - 96 + i * 15, c: S.col[1], w: 1, grow: 2, life: 12 }); yield* wait(4);
      Sound.sfx('heavy'); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 4, r1: 50, c: S.col[0], life: 14 }); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 10); yield* wait(10); } },
  zjMeteor: { col: ['#ff9050', '#fff0d0', '#702010'], pt: 'ember', cast: 'sky', fin: 'burst', snd: 'quake', // 流星龍墜: a dragon-meteor lands on them all
    *f(S, U, T, u, t) { this.spawn({ k: 'dark', a: 0.35, c: '#200808', life: 24 }); Sound.sfx('wind'); ln9(this, T.x + 50, T.y - 100, T.x, T.y, S.col[0], S.col[1], 10, 14); for (let i = 0; i < 8; i++) this.spawn({ k: 'flame', x: T.x + 50 - i * 6, y: T.y - 100 + i * 12, vy: -0.6, s: 4, life: 14 }); yield* wait(4);
      Sound.sfx('quake'); for (const C of grp9(this, T, t)) { this.spawn({ k: 'shock', x: C.x, y: C.y + 18, r0: 4, r1: 40, c: S.col[0], life: 14 }); imp9(this, C, S, 1); } this.shake = Math.max(this.shake, 12); yield* wait(10); } },
  cmDawn: { col: ['#ffe0a0', '#fffff0', '#c08030'], pt: 'ray', cast: 'draw', fin: 'flash', snd: 'crit', // 晨曦之刃: a dawn-coloured cut that pulls light back to the hero
    *f(S, U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('crit'); sl11(this, T, -0.5, 30, S, 7, 14); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 24, c: S.col[0], life: 12 }); yield* wait(4);
      for (let i = 0; i < 5; i++) this.spawn({ k: 'glow', x: lerp(T.x, U.x, i / 5), y: lerp(T.y, U.y, i / 5), r: 6, c: S.col[1], life: 8 + i * 3 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 18, c: '#a0ffb0', life: 14 }); yield* wait(8); } },
  cmTwin: { col: ['#ffffff', '#80c0ff', '#ff8080'], pt: 'spark', cast: 'draw', fin: 'cut', snd: 'slash', // 雙相斬: a steel cut, then a mirrored cut of magic
    *f(S, U, T, u) { yield* this.lunge(u, 14, 3); Sound.sfx('slash'); ln9(this, T.x - 24, T.y - 18, T.x + 20, T.y + 16, '#e0e8f0', '#ffffff', 5, 12); yield* wait(5);
      Sound.sfx('charge'); ln9(this, T.x + 24, T.y - 18, T.x - 20, T.y + 16, S.col[1], '#ffffff', 5, 12); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 6, r1: 20, c: S.col[1], life: 12 }); imp9(this, T, S); yield* wait(10); } },
});
function fx11Make(k) { const F = FX11[k], id = 't_' + k, D = DEF.skills[id]; if (!F || !D) { bvErr('r9y', 'fx ' + k); return; } const S = { col: F.col, pt: F.pt, seed: hashK(k) };
  // v12.31（特效測試版跑出來的）：輔助招（目標是自己）播特效時沒有 T，用到 T 的特效（障目彈…）會讓戰鬥當掉 → 沒有就用魔物那一邊的中心
  FX['t11_' + k] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 60 }; } yield* F.f.call(this, S, U, T, u, t); };
  if (F.h) { FX['t11h_' + k] = function* (U, T, u, i, t) { yield* F.h.call(this, S, U, T, u, i, t); }; D.hitFx = 't11h_' + k; }
  PAL['t11_' + k] = [F.col[0], F.col[1]]; SKILL_STYLE[id] = [F.cast || 'draw', D.power ? (F.fin || 'none') : null, 't11_' + k, F.snd || null]; if (MOVES[id]) MOVES[id].fx = 't11_' + k; }
for (const kind of TREE_KINDS11) if (kind !== '單手盾') for (const r of TREE11[kind].sk) fx11Make(r[1]); // 單手盾 (v12.33) gets its pictures in 10zzz_v12_v8
// the pictures must not repeat (cast, finish, colours)
{ const seen = new Map(); for (const k in FX11) { const F = FX11[k], key = (F.cast || '') + '|' + (F.fin || '') + '|' + F.col.join(','); if (seen.has(key)) bvErr('r9y', 'same picture ' + k + ' / ' + seen.get(key)); seen.set(key, k); } }

/* ===================== 特技：33 個特技各自的特效（照特技說明做；原本整種武器共用一個、自我強化的特技沒有畫面） ===================== */
const ray11 = (b, U, S, n = 6, len = 30) => { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.4; b.spawn({ k: 'line', x1: U.x, y1: U.y - 6, x2: U.x + Math.cos(a) * len, y2: U.y - 6 + Math.sin(a) * len, c: i % 2 ? S.col[0] : S.col[1], w: 2, grow: 4, life: 16 }); } };
const up11 = (b, U, S, n = 3) => { for (let i = 0; i < n; i++) { const x = U.x - 14 + i * 14; b.spawn({ k: 'line', x1: x, y1: U.y + 14, x2: x, y2: U.y - 14, c: S.col[0], w: 3, grow: 5, life: 18 }); b.spawn({ k: 'line', x1: x - 4, y1: U.y - 9, x2: x, y2: U.y - 14, c: S.col[1], w: 2, grow: 2, life: 18 }); b.spawn({ k: 'line', x1: x + 4, y1: U.y - 9, x2: x, y2: U.y - 14, c: S.col[1], w: 2, grow: 2, life: 18 }); } };
const SPFX11 = {
  /* 劍 */
  '劍:0': { col: ['#b8d8ff', '#ffffff', '#4060a0'], pt: 'spark', // 劍鳴：劍身震響，強力的一刀，音環從刀痕擴散
    *f(S, U, T, u) { Sound.sfx('tick'); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: U.x + 14, y: U.y - 10, r0: 2, r1: 10 + i * 6, c: S.col[0], w: 1, life: 10 + i * 3 }); yield* wait(4); yield* this.lunge(u, 16, 3); Sound.sfx('slash'); sl11(this, T, -0.85, 30, S, 7, 14);
      for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4 + i * 6, r1: 26 + i * 8, c: i ? S.col[0] : S.col[1], w: 2, life: 12 + i * 2 }); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 6); yield* wait(10); } },
  '劍:1': { col: ['#a0f0ff', '#ffffff', '#2a7a90'], pt: 'spark2', // 澄心：心靜下來，光從四周收進劍尖（下一次必定會心）
    *f(S, U) { Sound.sfx('charge'); ringIn11(this, U, S, 40, 4, 16); yield* wait(4); ringIn11(this, U, S, 28, 3, 14); this.spawn({ k: 'line', x1: U.x + 14, y1: U.y - 34, x2: U.x + 14, y2: U.y + 4, c: S.col[1], w: 1, grow: 6, life: 22 }); yield* wait(8); this.star(U.x + 14, U.y - 30, S.col[1], 14); Sound.sfx('tick'); yield* wait(10); } },
  '劍:2': { col: ['#c0c8d0', '#ffffff', '#c06020'], pt: 'shard', // 碎鋼：斬開護甲，鐵片四散（物防 −1）
    *f(S, U, T, u) { yield* this.lunge(u, 14, 3); Sound.sfx('slash'); sl11(this, T, 0.7, 26, S, 6); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 18, r1: 6, c: S.col[2], life: 14 }); yield* wait(3);
      for (let i = 0; i < 8; i++) this.spawn({ k: 'shard', g: 0.18, x: T.x + rnd(-8, 8), y: T.y, vx: rnd(-22, 22) / 10, vy: -rnd(8, 22) / 10, s: rnd(3, 5), c: i % 2 ? S.col[0] : S.col[2], life: 24 }); this.spawn({ k: 'line', x1: T.x + 22, y1: T.y - 20, x2: T.x + 22, y2: T.y + 4, c: '#ff8060', w: 3, grow: 4, life: 18 }); yield* wait(10); } },
  /* 短刀 */
  '短刀:0': { col: ['#80e060', '#f0ffd0', '#2a6020'], pt: 'bubble', // 蛇吻：兩道毒牙咬下，滴出毒液（60% 中毒）
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); ln9(this, T.x - 14, T.y - 16, T.x - 2, T.y + 8, S.col[0], S.col[1], 4, 12); ln9(this, T.x + 14, T.y - 16, T.x + 2, T.y + 8, S.col[0], S.col[1], 4, 12); yield* wait(3); Sound.sfx('poison');
      for (let i = 0; i < 6; i++) this.spawn({ k: 'circ', x: T.x + rnd(-6, 6), y: T.y + 8, vx: rnd(-6, 6) / 10, vy: rnd(4, 12) / 10, g: 0.12, r: 2, c: i % 2 ? S.col[0] : S.col[2], life: 18 }); imp9(this, T, S); yield* wait(10); } },
  '短刀:1': { col: ['#9a70d0', '#f0e0ff', '#200830'], pt: 'shadow', // 影襲：身影消失，從背後一刀（必定會心）
    *f(S, U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 4; i++) this.spawn({ k: 'glow', x: U.x + rnd(-8, 8), y: U.y + rnd(-6, 10), r: 14, c: S.col[2], life: 12 }); this.spawn({ k: 'dark', a: 0.3, c: '#100018', life: 22 }); yield* wait(6);
      for (let i = 0; i < 3; i++) this.spawn({ k: 'glow', x: T.x + 20 - i * 6, y: T.y - 10, r: 10, c: S.col[2], life: 10 }); Sound.sfx('crit'); ln9(this, T.x + 22, T.y - 22, T.x - 22, T.y + 20, S.col[0], S.col[1], 6, 14); yield* wait(2); ln9(this, T.x - 22, T.y - 22, T.x + 22, T.y + 20, S.col[0], S.col[1], 4, 12); this.star(T.x, T.y, S.col[1], 16); imp9(this, T, S, 1); yield* wait(10); } },
  '短刀:2': { col: ['#9af0a0', '#ffffff', '#2a8040'], pt: 'wind', // 疾步：腳下起風，殘影往後拉（速度 +1 階、回 MP）
    *f(S, U) { Sound.sfx('wind'); for (let k = 0; k < 3; k++) { this.spawn({ k: 'ring', x: U.x, y: U.y + 20, r0: 6, r1: 24 + k * 6, c: S.col[0], w: 2, life: 12, fl: 0.35 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x - 12 - i * 4, y1: U.y - 10 + i * 10, x2: U.x - 34 - i * 4, y2: U.y - 10 + i * 10, c: S.col[1], w: 1, grow: 2, life: 10 }); yield* wait(4); }
      this.spawn({ k: 'glow', x: U.x, y: U.y, r: 16, c: '#80c0ff', life: 12 }); yield* wait(8); } },
  /* 斧 */
  '斧:0': { col: ['#d0a060', '#fff0c0', '#604020'], pt: 'rock', // 崩岩：當頭劈下，岩片炸開（削 1 格護盾）
    *f(S, U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('slash'); ln9(this, T.x, T.y - 40, T.x, T.y + 14, S.col[0], S.col[1], 8, 12); yield* wait(2); Sound.sfx('rock'); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 4, r1: 40, c: S.col[0], life: 14 });
      for (let i = 0; i < 8; i++) this.spawn({ k: 'shard', g: 0.2, x: T.x, y: T.y + 10, vx: rnd(-25, 25) / 10, vy: -rnd(15, 30) / 10, s: rnd(3, 6), c: i % 2 ? S.col[0] : S.col[2], life: 24 }); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 8, r1: 24, c: '#ffe070', life: 12 }); this.shake = Math.max(this.shake, 8); yield* wait(10); } },
  '斧:1': { col: ['#ff7040', '#ffe0a0', '#802010'], pt: 'ember', // 蠻勇：火紅的鬥氣，力量往上衝（物攻 +1 階）
    *f(S, U) { Sound.sfx('charge'); aura11(this, U, S, 12); up11(this, U, S, 3); yield* wait(10); this.spawn({ k: 'flash', c: S.col[0], a: 0.18, life: 6 }); Sound.sfx('statUp'); yield* wait(8); } },
  '斧:2': { col: ['#c09050', '#f0e0b0', '#503010'], pt: 'rock', // 地鳴：斧頭砸地，一圈圈震波（50% 退縮）
    *f(S, U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('quake'); this.shake = Math.max(this.shake, 10); for (let k = 0; k < 3; k++) { this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 6, r1: 34 + k * 14, c: k % 2 ? S.col[1] : S.col[0], life: 14 }); yield* wait(3); }
      for (let i = 0; i < 10; i++) this.spawn({ k: 'glow', x: T.x + rnd(-40, 40), y: T.y + 14 + rnd(-6, 6), r: 12, c: i % 2 ? S.col[0] : S.col[2], life: 18 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'shard', g: 0.2, x: T.x + rnd(-30, 30), y: T.y + 22, vx: rnd(-10, 10) / 10, vy: -rnd(15, 28) / 10, s: rnd(3, 5), c: S.col[2], life: 20 }); yield* wait(8); } },
  /* 長槍 */
  '長槍:0': { col: ['#e0f0ff', '#ffffff', '#5070a0'], pt: 'ray', // 貫心：一槍穿透，光從背後透出去（無視物防）
    *f(S, U, T, u) { yield* this.lunge(u, 22, 2); Sound.sfx('crit'); const a = Math.atan2(T.y - U.y, T.x - U.x); ln9(this, T.x - Math.cos(a) * 40, T.y - Math.sin(a) * 40, T.x + Math.cos(a) * 46, T.y + Math.sin(a) * 46, S.col[0], S.col[1], 5, 14);
      this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 12, c: S.col[1], w: 3, life: 10 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(a + rnd(-4, 4) / 10) * 40, y2: T.y + Math.sin(a + rnd(-4, 4) / 10) * 40, c: S.col[0], w: 1, grow: 3, life: 10 }); yield* wait(10); } },
  '長槍:1': { col: ['#70c0ff', '#e0f4ff', '#204a80'], pt: 'wind', // 旋槍：槍身迴旋，掃過所有敵人
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 3); Sound.sfx('wind'); this.spawn({ k: 'ring', x: T.x, y: T.y + 8, r0: 56, r1: 20, c: S.col[0], w: 4, life: 14, fl: 0.35 }); yield* wait(3);
      for (const C of grp9(this, T, t)) { Sound.sfx('slash'); this.spawn({ k: 'cres', x: C.x, y: C.y, r: 20, ang: Math.random() * 6, c: S.col[1], c2: S.col[0], w: 4, life: 12 }); imp9(this, C, S); yield* wait(2); } yield* wait(8); } },
  '長槍:2': { col: ['#fff0b0', '#ffffff', '#a08030'], pt: 'spark', // 凝息：屏住呼吸，槍尖聚光（下一次必定會心）
    *f(S, U) { Sound.sfx('tick'); const X = U.x + 16, Y = U.y - 28; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; this.spawn({ k: 'glow', x: X + Math.cos(a) * 22, y: Y + Math.sin(a) * 22, vx: -Math.cos(a) * 1.6, vy: -Math.sin(a) * 1.6, r: 4, c: S.col[0], life: 14 }); } yield* wait(12); this.star(X, Y, S.col[1], 16); this.spawn({ k: 'ring', x: X, y: Y, r0: 2, r1: 14, c: S.col[1], w: 2, life: 10 }); yield* wait(10); } },
  /* 拳套 */
  '拳套:0': { col: ['#ffb060', '#fff0d0', '#a04010'], pt: 'spark', // 連環腳：左右兩記迴旋踢
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('heavy'); this.spawn({ k: 'cres', x: T.x - 6, y: T.y + 4, r: 20, ang: 0.6, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); this.star(T.x - 10, T.y + 6, S.col[1], 10); yield* wait(5); },
    *h(S, U, T) { Sound.sfx('heavy'); this.spawn({ k: 'cres', x: T.x + 6, y: T.y - 4, r: 20, ang: 3.7, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); imp9(this, T, S); yield* wait(6); } },
  '拳套:1': { col: ['#60b0ff', '#e0f0ff', '#204080'], pt: 'chi', // 氣旋：氣在身邊打轉，吸進身體（回 MP）
    *f(S, U) { Sound.sfx('charge'); for (let k = 0; k < 14; k++) { const a = k * 0.9, r = 34 - k * 2; this.spawn({ k: 'glow', x: U.x + Math.cos(a) * r, y: U.y + Math.sin(a) * r * 0.6, r: 5, c: k % 2 ? S.col[0] : S.col[1], life: 10 }); if (k % 3 === 0) yield; }
      this.spawn({ k: 'glow', x: U.x, y: U.y, r: 22, c: S.col[0], life: 14 }); Sound.sfx('heal'); yield* wait(10); } },
  '拳套:2': { col: ['#a0a8b8', '#ffffff', '#404858'], pt: 'hex', // 鐵骨：全身繃緊，鋼鐵的六角紋浮上來（受傷 −40%）
    *f(S, U) { Sound.sfx('shield'); for (let i = 0; i < 5; i++) { this.spawn({ k: 'hex', x: U.x + rnd(-14, 14), y: U.y + rnd(-14, 14), r0: 3, r1: 9, c: i % 2 ? S.col[0] : S.col[1], life: 18 }); yield* wait(2); } this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 10, r1: 28, c: S.col[0], life: 20 }); this.shake = Math.max(this.shake, 2); yield* wait(10); } },
  /* 法杖 */
  '法杖:0': { col: ['#c080ff', '#ffffff', '#5020a0'], pt: 'rune', // 魔力迸發：魔力球飛過去，炸成一大圈
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x + 12, y: U.y - 14, r: 12, c: S.col[0], life: 10 }); yield* wait(4); yield* bolt11(this, U, T, S, 7, 4); Sound.sfx('hitSuper'); this.spawn({ k: 'flash', c: S.col[0], a: 0.25, life: 6 });
      for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30 + i * 10, c: i % 2 ? S.col[1] : S.col[0], w: 3 - i, life: 14 + i * 2 }); imp9(this, T, S, 1); yield* wait(10); } },
  '法杖:1': { col: ['#60a0ff', '#d0f0ff', '#2040a0'], pt: 'bubble', // 魔力湧泉：腳下湧出藍色的泉水（回 MP）
    *f(S, U) { Sound.sfx('water'); this.spawn({ k: 'ring', x: U.x, y: U.y + 20, r0: 4, r1: 26, c: S.col[0], w: 2, life: 16, fl: 0.35 }); for (let k = 0; k < 4; k++) { for (let i = 0; i < 4; i++) this.spawn({ k: 'bub', x: U.x + rnd(-16, 16), y: U.y + 18, r: rnd(2, 4), c: i % 2 ? S.col[0] : S.col[1], vy: -rnd(8, 16) / 10, life: 20 }); yield* wait(3); }
      Sound.sfx('heal'); yield* wait(8); } },
  '法杖:2': { col: ['#ffe070', '#ffffff', '#806010'], pt: 'star', // 星輝：星星在身邊閃爍（下一次必定會心）
    *f(S, U) { Sound.sfx('tick'); for (let i = 0; i < 7; i++) { const a = i * 0.9, x = U.x + Math.cos(a) * 26, y = U.y - 14 + Math.sin(a) * 18; this.star(x, y, i % 2 ? S.col[0] : S.col[1], 16); this.spawn({ k: 'glow', x, y, r: 7, c: S.col[0], life: 16 }); this.spawn({ k: 'line', x1: x - 5, y1: y, x2: x + 5, y2: y, c: S.col[1], w: 1, grow: 1, life: 12 }); this.spawn({ k: 'line', x1: x, y1: y - 5, x2: x, y2: y + 5, c: S.col[1], w: 1, grow: 1, life: 12 }); yield* wait(2); } this.spawn({ k: 'glow', x: U.x, y: U.y - 8, r: 20, c: S.col[0], life: 14 }); yield* wait(10); } },
  /* 魔導書 */
  '魔導書:0': { col: ['#f0e8d0', '#ffffff', '#806a40'], pt: 'rune', // 飛頁：書頁一張張飛過去打中
    *f(S, U, T) { Sound.sfx('wind'); for (let i = 0; i < 5; i++) { const y0 = U.y - 10 + rnd(-8, 8); this.spawn({ k: 'line', x1: U.x + 10, y1: y0, x2: U.x + 16, y2: y0 - 3, c: S.col[0], w: 4, grow: 1, life: 6 }); yield* bolt11(this, { x: U.x + rnd(-6, 6), y: y0 + 10 }, { x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 10) }, S, 4, 2); }
      Sound.sfx('hit'); imp9(this, T, S); yield* wait(8); } },
  '魔導書:1': { col: ['#6080c0', '#d0e0ff', '#203060'], pt: 'rune', // 縛頁：書頁繞著對手轉，越收越緊（速度 −1 階）
    *f(S, U, T) { Sound.sfx('wind'); for (let k = 0; k < 10; k++) { const a = k * 0.7, r = 34 - k * 2; this.spawn({ k: 'line', x1: T.x + Math.cos(a) * r, y1: T.y + Math.sin(a) * r * 0.6, x2: T.x + Math.cos(a + 0.3) * r, y2: T.y + Math.sin(a + 0.3) * r * 0.6, c: S.col[1], w: 3, grow: 1, life: 10 }); if (k % 2) yield; }
      this.spawn({ k: 'ring', x: T.x, y: T.y + 6, r0: 30, r1: 10, c: S.col[0], w: 3, life: 14, fl: 0.4 }); Sound.sfx('statDown'); yield* wait(10); } },
  '魔導書:2': { col: ['#80e0e0', '#f0ffff', '#206060'], pt: 'rune', // 智慧之泉：書翻開，文字化成光流回來（回 MP）
    *f(S, U) { Sound.sfx('tick'); this.spawn({ k: 'hex', x: U.x, y: U.y - 26, r0: 4, r1: 14, c: S.col[0], life: 18 }); for (let i = 0; i < 8; i++) { this.spawn({ k: 'glow', x: U.x + rnd(-14, 14), y: U.y - 30, vy: 1.2, r: 4, c: i % 2 ? S.col[0] : S.col[1], life: 18 }); if (i % 2) yield; }
      this.spawn({ k: 'glow', x: U.x, y: U.y, r: 20, c: S.col[0], life: 14 }); Sound.sfx('heal'); yield* wait(10); } },
  /* 樂器 */
  '樂器:0': { col: ['#80d0ff', '#ffffff', '#3060a0'], pt: 'note', // 迴響：音波一圈圈打過去（20% 退縮）
    *f(S, U, T) { Sound.sfx('buzz'); for (let k = 0; k < 4; k++) { const x = lerp(U.x, T.x, k / 4), y = lerp(U.y, T.y, k / 4); this.spawn({ k: 'ring', x, y, r0: 4, r1: 16, c: k % 2 ? S.col[1] : S.col[0], w: 2, life: 10 }); yield* wait(2); }
      note11(this, T.x, T.y - 10, S, 3); for (let i = 0; i < 2; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 26 + i * 8, c: S.col[0], w: 2, life: 12 }); yield* wait(10); } },
  '樂器:1': { col: ['#ffd060', '#fff8e0', '#a06010'], pt: 'note', // 激勵：激昂的旋律，金光往上（物攻・魔攻各 +1 階）
    *f(S, U) { Sound.sfx('statUp'); note11(this, U.x, U.y - 8, S, 6); ray11(this, U, S, 5, 32); yield* wait(8); up11(this, U, S, 2); yield* wait(10); } },
  '樂器:2': { col: ['#a0f0b0', '#ffffff', '#408050'], pt: 'note', // 安撫：柔和的音符落在身上（回 15% HP）
    *f(S, U) { Sound.sfx('heal'); for (let i = 0; i < 6; i++) this.spawn({ k: 'txt', s: i % 2 ? '♪' : '♫', x: U.x + rnd(-18, 18), y: U.y - 30, vy: 0.6, c: i % 2 ? S.col[0] : S.col[1], life: 26, fade: 1 }); yield* wait(10); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 24, c: S.col[0], life: 18 }); this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 26, r1: 8, c: S.col[1], w: 2, life: 14 }); yield* wait(10); } },
  /* 火槍 */
  '火槍:0': { col: ['#ffd080', '#ffffff', '#a05010'], pt: 'spark', // 追射：補兩槍
    *f(S, U, T) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 16, y: U.y - 10, r: 8, c: S.col[1], life: 5 }); ln9(this, U.x + 16, U.y - 10, T.x - 4, T.y + 2, S.col[0], S.col[1], 2, 6); this.star(T.x - 4, T.y + 2, S.col[1], 8); yield* wait(4); },
    *h(S, U, T) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 16, y: U.y - 10, r: 8, c: S.col[1], life: 5 }); ln9(this, U.x + 16, U.y - 12, T.x + 6, T.y - 4, S.col[0], S.col[1], 2, 6); imp9(this, T, S); yield* wait(5); } },
  '火槍:1': { col: ['#ff8030', '#ffe0a0', '#601808'], pt: 'flame', // 炸裂彈：拋物線的榴彈，在敵群中炸開
    *f(S, U, T, u, t) { Sound.sfx('tick'); const x0 = U.x + 14, y0 = U.y - 12; for (let i = 1; i <= 8; i++) { this.spawn({ k: 'circ', x: lerp(x0, T.x, i / 8), y: lerp(y0, T.y, i / 8) - Math.sin(i / 8 * 3.14) * 30, vx: 0, vy: 0, g: 0, r: 3, c: '#303030', life: 3 }); yield; }
      Sound.sfx('fire'); this.spawn({ k: 'flash', c: S.col[0], a: 0.3, life: 6 }); this.shake = Math.max(this.shake, 8); for (const C of grp9(this, T, t)) { this.spawn({ k: 'glow', x: C.x, y: C.y, r: 26, c: S.col[0], life: 14 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'flame', x: C.x + rnd(-12, 12), y: C.y + rnd(-8, 10), vy: -1.2, s: 4, life: 16 }); imp9(this, C, S, 1); } yield* wait(10); } },
  '火槍:2': { col: ['#c0c8d8', '#ffffff', '#506080'], pt: 'gear', // 急速裝填：彈倉轉一圈，咔嚓上膛（回 MP）
    *f(S, U) { const X = U.x + 16, Y = U.y - 8; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; this.spawn({ k: 'circ', x: X + Math.cos(a) * 8, y: Y + Math.sin(a) * 8, vx: 0, vy: 0, g: 0, r: 2, c: S.col[0], life: 4 + i * 2 }); Sound.sfx('tick'); yield* wait(2); }
      this.spawn({ k: 'ring', x: X, y: Y, r0: 2, r1: 16, c: S.col[1], w: 2, life: 10 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 18, c: '#80c0ff', life: 12 }); Sound.sfx('heal'); yield* wait(8); } },
  /* 雙刀 */
  '雙刀:0': { col: ['#d060a0', '#ffe0f0', '#501030'], pt: 'shadow', // 雙影襲：兩道影子左右交錯
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); this.spawn({ k: 'glow', x: T.x - 20, y: T.y, r: 10, c: S.col[2], life: 10 }); ln9(this, T.x - 26, T.y - 14, T.x + 14, T.y + 12, S.col[0], S.col[1], 4, 12); yield* wait(5); },
    *h(S, U, T) { Sound.sfx('slash'); this.spawn({ k: 'glow', x: T.x + 20, y: T.y, r: 10, c: S.col[2], life: 10 }); ln9(this, T.x + 26, T.y - 14, T.x - 14, T.y + 12, S.col[0], S.col[1], 4, 12); imp9(this, T, S); yield* wait(6); } },
  '雙刀:1': { col: ['#b0f0d0', '#ffffff', '#307050'], pt: 'wind', // 刃嵐：刀光像暴風一樣捲過全體
    *f(S, U, T, u, t) { Sound.sfx('wind'); for (const C of grp9(this, T, t)) for (let i = 0; i < 5; i++) { const a = Math.random() * 6; sl11(this, C, a, 14 + rnd(0, 8), S, 2, 10); if (i % 2) yield; } this.spawn({ k: 'ring', x: T.x, y: T.y + 6, r0: 50, r1: 14, c: S.col[0], w: 2, life: 14, fl: 0.4 }); yield* wait(10); } },
  /* 雙劍 */
  '雙劍:0': { col: ['#ffe8a0', '#ffffff', '#a07020'], pt: 'spark2', // 交叉斬：兩把劍劃出 X 字（容易會心）
    *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('slash'); sl11(this, T, -0.8, 24, S, 5); sl11(this, T, 0.8, 24, S, 5); this.star(T.x, T.y, S.col[1], 12); yield* wait(5); },
    *h(S, U, T) { Sound.sfx('crit'); sl11(this, T, -0.2, 26, S, 4); sl11(this, T, 1.4, 26, S, 4); imp9(this, T, S); yield* wait(6); } },
  '雙劍:1': { col: ['#a0e8ff', '#ffffff', '#3070a0'], pt: 'wind', // 劍風：雙劍一揮，風刃掃過全體
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 2); Sound.sfx('wind'); const G = grp9(this, T, t); for (let k = 0; k < 2; k++) { ln9(this, T.x - 60, T.y + 10 - k * 14, T.x + 60, T.y - 10 - k * 14, S.col[0], S.col[1], 3, 12); yield* wait(2); }
      for (const C of G) { this.spawn({ k: 'cres', x: C.x, y: C.y, r: 16, ang: 2.4, c: S.col[1], c2: S.col[0], w: 3, life: 10 }); imp9(this, C, S); } yield* wait(10); } },
  /* 雙盾 */
  '雙盾:0': { col: ['#d0d8e8', '#ffffff', '#506078'], pt: 'hex', // 盾鳴：兩面盾互撞，聲波震出去（30% 退縮）
    *f(S, U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('shield'); this.spawn({ k: 'hex', x: T.x - 10, y: T.y, r0: 4, r1: 14, c: S.col[0], life: 12 }); this.spawn({ k: 'hex', x: T.x + 10, y: T.y, r0: 4, r1: 14, c: S.col[0], life: 12 }); yield* wait(3);
      Sound.sfx('heavy'); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6 + i * 4, r1: 26 + i * 10, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 12 + i * 2 }); this.shake = Math.max(this.shake, 4); yield* wait(10); } },
  '雙盾:1': { col: ['#90b0d0', '#ffffff', '#304860'], pt: 'hex', // 鋼壁：兩道鋼牆立在前面（受傷 −40%）
    *f(S, U) { Sound.sfx('shield'); for (const dx of [-14, 14]) { for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: U.x + dx, y: U.y - 22 + i * 12, r0: 3, r1: 7, c: i % 2 ? S.col[0] : S.col[1], life: 22 }); this.spawn({ k: 'line', x1: U.x + dx, y1: U.y - 30, x2: U.x + dx, y2: U.y + 10, c: S.col[0], w: 4, grow: 4, life: 22 }); yield* wait(4); }
      this.shake = Math.max(this.shake, 2); this.spawn({ k: 'glow', x: U.x, y: U.y - 8, r: 24, c: S.col[0], life: 14 }); yield* wait(10); } },
};
const spFxId11 = (kind, j) => 'sp11_' + TREE_KINDS11.indexOf(kind) + '_' + j;
for (const kind of TREE_KINDS11) TREE11[kind].sp.forEach((sp, j) => { const F = SPFX11[kind + ':' + j], fid = spFxId11(kind, j); if (!F) { bvErr('r9y', 'special fx ' + kind + j); return; }
  const S = { col: F.col, pt: F.pt, seed: hashK(fid) }; FX[fid] = function* (U, T, u, t) { yield* F.f.call(this, S, U, T, u, t); }; PAL[fid] = [F.col[0], F.col[1]];
  if (F.h) FX[fid + 'h'] = function* (U, T, u, i) { yield* F.h.call(this, S, U, T, u, i); };
  for (let tr = 1; tr <= 7; tr++) for (const mag of [0, 1]) { const D = DEF.skills[spId11(kind, j, tr, mag)]; if (!D) continue; D.fx = fid; if (F.h) D.hitFx = fid + 'h'; } });
