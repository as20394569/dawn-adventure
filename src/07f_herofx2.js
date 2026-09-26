/* ===================== FX pack 4: per-skill presentation for HERO skills =====================
   Every hero skill gets its own cast (wind-up) + impact (finisher) on top of its base FX, with its own palette and sound.
   Hero-only materials: light lines, rune circles, rays, halos, hexes, motes, slits — never used by monsters. Scales with skill level. */
const HERO_PK = {
  rune(x, p, a) { const r = p.r * Math.min(1, p.t / 6), rot = p.t * 0.08 * (p.dir || 1), sq = p.sq || 0.38; x.globalAlpha = Math.min(1, a * 1.6); x.strokeStyle = p.c; x.lineWidth = 1.5;
    x.beginPath(); x.ellipse(p.x, p.y, r, r * sq, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(p.x, p.y, r * 0.72, r * sq * 0.72, 0, 0, 7); x.stroke();
    x.fillStyle = p.c2; const n = p.n || 8; for (let i = 0; i < n; i++) { const an = rot + i * Math.PI * 2 / n; x.fillRect(Math.round(p.x + Math.cos(an) * r * 0.86) - 1, Math.round(p.y + Math.sin(an) * r * sq * 0.86) - 1, 2, 2); }
    const v = p.poly || 3; x.strokeStyle = p.c2; x.beginPath(); for (let i = 0; i <= v; i++) { const an = -rot + i * Math.PI * 2 / v; const px = p.x + Math.cos(an) * r * 0.7, py = p.y + Math.sin(an) * r * sq * 0.7; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); },
  rays(x, p, a) { x.globalAlpha = a; x.strokeStyle = p.c; x.lineCap = 'round'; for (let i = 0; i < p.n; i++) { const an = p.a0 + i * Math.PI * 2 / p.n, r0 = 6 + p.t * 1.5, r1 = r0 + p.len * a; x.lineWidth = i % 2 ? 1 : 2; x.beginPath(); x.moveTo(p.x + Math.cos(an) * r0, p.y + Math.sin(an) * r0); x.lineTo(p.x + Math.cos(an) * r1, p.y + Math.sin(an) * r1); x.stroke(); } },
  shock(x, p, a) { const r = lerp(p.r0, p.r1, p.t / p.life); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2 + a * 2; x.beginPath(); x.ellipse(p.x, p.y, r, r * 0.3, 0, 0, 7); x.stroke(); },
  mote(x, p, a) { if (p.to) { p.x += (p.to.x - p.x) * 0.12; p.y += (p.to.y - p.y) * 0.12; } x.globalAlpha = a; x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.s || 2, p.s || 2); if ((p.s || 2) > 1 && p.t % 6 < 3) { x.fillStyle = '#ffffff'; x.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); } },
  pillar(x, p, a) { const w = p.w * (0.4 + 0.6 * a); const g = x.createLinearGradient(p.x - w, 0, p.x + w, 0); const [r, gg, b] = hex2rgb(p.c); g.addColorStop(0, `rgba(${r},${gg},${b},0)`); g.addColorStop(0.5, `rgba(${r},${gg},${b},${0.75 * a})`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); x.fillStyle = g; x.fillRect(p.x - w, p.y - p.h, w * 2, p.h); },
  dark(x, p, a) { x.globalAlpha = (p.a || 0.5) * Math.min(1, (p.life - p.t) / 6, p.t / 4); x.fillStyle = p.c || '#05030c'; x.fillRect(0, 0, W, BH); },
  slit(x, p, a) { const h = p.h * Math.min(1, p.t / 4), w = p.w * a; x.save(); x.translate(p.x, p.y); x.rotate(p.ang || 0); x.globalAlpha = 1; x.fillStyle = p.c; x.beginPath(); x.ellipse(0, 0, w + 2, h + 2, 0, 0, 7); x.fill(); x.fillStyle = '#05030c'; x.beginPath(); x.ellipse(0, 0, w, h, 0, 0, 7); x.fill(); x.restore(); },
  shard(x, p, a) { x.save(); x.translate(p.x, p.y); x.rotate(p.t * (p.spin || 0.3)); x.globalAlpha = a; x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); x.fillStyle = '#ffffff'; x.fillRect(-p.s / 2, -p.s / 2, p.s / 2, 1); x.restore(); },
  streak(x, p, a) { x.globalAlpha = a; x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.len, 1); },
  halo(x, p, a) { const r = p.r * (0.8 + 0.2 * Math.sin(p.t / 3)); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); x.ellipse(p.x, p.y, r, r * 0.3, 0, 0, 7); x.stroke(); x.strokeStyle = '#ffffff'; x.lineWidth = 1; x.beginPath(); x.ellipse(p.x, p.y, r - 2, (r - 2) * 0.3, 0, Math.PI, 7); x.stroke(); },
  xcut(x, p, a) { const g = Math.min(1, p.t / 4), L = p.r * g; x.globalAlpha = Math.min(1, a * 1.5); x.lineCap = 'round'; for (const [c, w] of [[p.c, 6], ['#ffffff', 2]]) { x.strokeStyle = c; x.lineWidth = w * (0.5 + a / 2); x.beginPath(); x.moveTo(p.x - L, p.y - L); x.lineTo(p.x + L, p.y + L); x.moveTo(p.x + L, p.y - L); x.lineTo(p.x - L, p.y + L); x.stroke(); } },
  sigil(x, p, a) { const r = p.r * Math.min(1, p.t / 8); x.globalAlpha = Math.min(1, a * 1.4); x.strokeStyle = p.c; x.lineWidth = 1.5; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.stroke(); x.beginPath(); for (let i = 0; i <= 5; i++) { const an = -Math.PI / 2 + i * Math.PI * 4 / 5 + p.t * 0.03; const px = p.x + Math.cos(an) * r * 0.9, py = p.y + Math.sin(an) * r * 0.9; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); },
};
{ const _dp = drawParticle; drawParticle = function (x, p) { const f = HERO_PK[p.k]; if (f && !p.hidden) { const a = 1 - p.t / p.life; x.save(); f(x, p, a); x.restore(); return; } _dp(x, p); }; }

// palettes: [main, light]
const PAL = { steel: ['#9ab8e8', '#ffffff'], gold: ['#ffc040', '#fff4c0'], fire: ['#ff6a2a', '#ffd070'], ember: ['#ff3a2a', '#ffb060'], water: ['#3aa8f0', '#c8f0ff'], leaf: ['#5cd060', '#d8ffb0'], volt: ['#f8d030', '#fffbd0'], wind: ['#9ae8c0', '#f0fff8'],
  arcane: ['#a070ff', '#e8d8ff'], holy: ['#ffe070', '#fffbe8'], life: ['#72e39a', '#e8fff0'], guard: ['#86b4ff', '#e8f4ff'], blood: ['#e02a3a', '#ff9aa0'], void: ['#8a3aff', '#d8b0ff'], dawn: ['#ffb040', '#fff0c0'], rock: ['#c8a060', '#fff0c0'], shadow: ['#ff4a5a', '#ffd0d0'] };
// skill → [cast, impact, palette, sound on impact]
const SKILL_STYLE = {
  powerSlash: ['draw', 'cut', 'gold', 'hitSuper'], flameSlash: ['aura', 'burn', 'fire', 'fire'], voltSlash: ['draw', 'spark', 'volt', 'thunder'], gale: ['dash', 'gust', 'wind', 'wind'],
  armorBreak: ['draw', 'shatter', 'steel', 'rock'], leafBlade: ['draw', 'leaves', 'leaf', 'leaf'], crossSlash: ['draw', 'xcut', 'steel', 'crit'], tideSlash: ['draw', 'splash', 'water', 'water'],
  blaze: ['aura', 'firestorm', 'fire', 'fire'], bladeStorm: ['dash', 'multicut', 'wind', 'slash'], iaiSlash: ['still', 'iai', 'steel', 'crit'], recklessSlash: ['aura', 'crimson', 'blood', 'hitSuper'],
  riftBlade: ['void', 'rift', 'void', 'quake'], dawnBreak: ['halo', 'sunrise', 'dawn', 'hitSuper'],
  magicBolt: ['rune', 'pop', 'arcane', 'hit'], fireBolt: ['rune', 'explode', 'fire', 'fire'], manaBurst: ['focus', 'nova', 'arcane', 'charge'], aquaBlade: ['rune', 'splash', 'water', 'water'],
  thunder: ['sky', 'strike', 'volt', 'thunder'], leafStorm: ['rune', 'swirl', 'leaf', 'leaf'], chainBolt: ['rune', 'chain', 'volt', 'thunder'], flameWave: ['aura', 'wave', 'fire', 'fire'],
  aquaBurst: ['rune', 'geyser', 'water', 'water'], inferno: ['aura', 'firepillar', 'ember', 'fire'], meteor: ['sky', 'impact', 'ember', 'quake'], thunderstorm: ['sky', 'storm', 'volt', 'thunder'], skyJudge: ['sky', 'judge', 'holy', 'thunder'],
  guardStrike: ['hex', 'hexburst', 'guard', 'hit'], shieldBash: ['hex', 'bash', 'guard', 'rock'], glare: ['still', 'glare', 'shadow', 'statDown'],
  heal: ['halo', null, 'life'], holyLight: ['halo', null, 'holy'], sanctuary: ['halo', null, 'holy'], barrier: ['hex', null, 'guard'], ironWill: ['hex', null, 'steel'], focus: ['focus', null, 'gold'], bloodRage: ['aura', null, 'blood'],
};
const ELEM_PAL = { 火: 'fire', 水: 'water', 草: 'leaf', 雷: 'volt', 岩: 'rock' };
const styleOf = (id, mv) => SKILL_STYLE[id] || [mv.cat === '物' ? 'draw' : 'rune', mv.pow ? (mv.cat === '物' ? 'cut' : 'pop') : null, ELEM_PAL[mv.t] || 'steel', 'hit'];

// ---------- casts (at the hero) ----------
const CASTS = {
  draw(U, T, c, c2, lv) { Sound.sfx('slash'); this.spawn({ k: 'line', x1: U.x + 14, y1: U.y + 8, x2: U.x + 26, y2: U.y - 16, c: c2, w: 3, grow: 4, life: 14 }); this.spawn({ k: 'star', x: U.x + 26, y: U.y - 16, c: c2, life: 12 }); for (let i = 0; i < 3 + lv; i++) this.spawn({ k: 'mote', x: U.x + rnd(-10, 22), y: U.y + rnd(-8, 14), vy: -0.4, s: 1, c, life: 16 }); return 10; },
  dash(U, T, c, c2, lv) { Sound.sfx('wind'); for (let i = 0; i < 8 + lv * 3; i++) this.spawn({ k: 'streak', x: rnd(0, W), y: rnd(20, BH - 10), vx: -7 - Math.random() * 4, len: rnd(8, 20), c: i % 2 ? c : c2, life: 12 }); return 10; },
  still(U, T, c, c2, lv) { this.spawn({ k: 'dark', a: 0.55, life: 22 }); this.spawn({ k: 'line', x1: U.x - 30, y1: U.y - 2, x2: U.x + 30, y2: U.y - 2, c: c2, w: 1, grow: 10, life: 20 }); Sound.sfx('tick'); return 20; },
  aura(U, T, c, c2, lv) { Sound.sfx('fire'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 24 + lv * 4, c, life: 22 }); for (let i = 0; i < 10 + lv * 5; i++) this.spawn({ k: 'mote', x: U.x + rnd(-16, 16), y: U.y + rnd(0, 16), vy: -(1 + Math.random() * 1.4), vx: rnd(-3, 3) / 10, s: rnd(1, 3), c: i % 3 ? c : c2, life: rnd(14, 26) }); return 14; },
  rune(U, T, c, c2, lv) { Sound.sfx('charge'); this.spawn({ k: 'rune', x: U.x, y: U.y + 10, r: 20 + lv * 4, c, c2, n: 6 + lv * 2, poly: 3 + lv, life: 30 }); this.spawn({ k: 'glow', x: U.x, y: U.y - 6, r: 14 + lv * 3, c, life: 16 }); if (lv >= 2) this.spawn({ k: 'pillar', x: U.x, y: U.y + 10, w: 8 + lv * 3, h: 56, c: c2, life: 18 }); return 12 + lv * 2; },
  focus(U, T, c, c2, lv) { Sound.sfx('charge'); for (let i = 0; i < 14 + lv * 4; i++) { const an = Math.random() * 7, R = 40 + Math.random() * 20; this.spawn({ k: 'mote', x: U.x + Math.cos(an) * R, y: U.y + Math.sin(an) * R * 0.7, vy: 0, to: { x: U.x, y: U.y }, s: 2, c: i % 2 ? c : c2, life: 18 }); } this.spawn({ k: 'glow', x: U.x, y: U.y, r: 22 + lv * 4, c, life: 20 }); return 16; },
  sky(U, T, c, c2, lv) { Sound.sfx('charge'); this.spawn({ k: 'dark', a: 0.45, c: '#0a0c24', life: 34 }); this.spawn({ k: 'sigil', x: T.x, y: T.y - 44, r: 14 + lv * 3, c, life: 32 }); for (let i = 0; i < 6 + lv * 2; i++) this.spawn({ k: 'mote', x: T.x + rnd(-30, 30), y: T.y - 60 + rnd(-6, 6), vy: 0.3, s: 2, c: c2, life: 26 }); return 16; },
  hex(U, T, c, c2, lv) { Sound.sfx('charge'); for (let i = 0; i < 2 + lv; i++) this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 8 + i * 8, r1: 16 + i * 8, c: i % 2 ? c2 : c, life: 16 + i * 3 }); return 12; },
  halo(U, T, c, c2, lv) { Sound.sfx('heal'); this.spawn({ k: 'halo', x: U.x, y: U.y - 26, r: 10 + lv * 2, c, life: 28 }); for (let i = 0; i < 6 + lv * 3; i++) this.spawn({ k: 'mote', x: U.x + rnd(-20, 20), y: U.y - 40 - rnd(0, 20), vy: 0.7, s: 2, c: i % 2 ? c : c2, life: 24 }); return 14; },
  void(U, T, c, c2, lv) { Sound.sfx('quake'); this.spawn({ k: 'dark', a: 0.7, c: '#0a0418', life: 30 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'line', x1: U.x + rnd(-40, 40), y1: U.y - rnd(20, 60), x2: U.x + rnd(-40, 40), y2: U.y - rnd(20, 60), c, w: 1, grow: 6, life: 20 }); return 16; },
};
// ---------- impacts (at the target) ----------
function* heroImpactStyle(kind, T, U, c, c2, pw) {
  const S = this, sp = (n, s = 2.4, cols = [c, c2, '#ffffff']) => S.sparks(T.x, T.y, n, cols, s + pw * 0.3, 22, 0.08);
  switch (kind) {
    case 'cut': this.spawn({ k: 'line', x1: T.x - 30, y1: T.y + 16, x2: T.x + 30, y2: T.y - 16, c: c2, w: 4, grow: 2, life: 12 }); sp(8 + pw * 4); break;
    case 'xcut': this.spawn({ k: 'xcut', x: T.x, y: T.y, r: 22 + pw * 4, c, life: 18 }); sp(10 + pw * 4); break;
    case 'burn': for (let i = 0; i < 12 + pw * 4; i++) this.spawn({ k: 'flame', x: T.x + rnd(-14, 14), y: T.y + rnd(-6, 14), vy: -1.4, s: rnd(2, 4), life: rnd(12, 22) }); break;
    case 'spark': for (let i = 0; i < 2 + pw; i++) { const p2 = []; let x0 = T.x + rnd(-18, 18); for (let y = T.y - 22; y < T.y + 20; y += 6) { p2.push([x0, y]); x0 += rnd(-6, 6); } this.spawn({ k: 'bolt', pts: p2, w: 2, life: 10 }); } sp(8, 3, [c2, '#ffffff']); break;
    case 'gust': for (let i = 0; i < 3; i++) this.spawn({ k: 'arc', x: T.x, y: T.y + i * 6 - 6, r: 14 + i * 6, a0: i, c: i % 2 ? c : c2, life: 16 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'streak', x: T.x - 30, y: T.y + rnd(-18, 18), vx: 5, len: rnd(6, 14), c: c2, life: 12 }); break;
    case 'shatter': for (let i = 0; i < 10 + pw * 3; i++) this.spawn({ k: 'shard', g: 0.15, x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 6), vx: rnd(-20, 20) / 10, vy: -rnd(10, 30) / 10, s: rnd(3, 6), c: i % 2 ? '#a8b0c0' : '#6a7488', life: 26 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 24, c: c2, w: 2, life: 10 }); break;
    case 'leaves': for (let i = 0; i < 12 + pw * 3; i++) { const an = Math.random() * 7; this.spawn({ k: 'img', img: LEAF_IMG, x: T.x, y: T.y, vx: Math.cos(an) * 2, vy: Math.sin(an) * 2, fade: 1, life: 20 }); } break;
    case 'splash': for (let i = 0; i < 14 + pw * 4; i++) this.spawn({ k: 'circ', x: T.x + rnd(-6, 6), y: T.y, vx: rnd(-25, 25) / 10, vy: -rnd(10, 35) / 10, g: 0.18, r: rnd(1, 3), c: i % 3 ? c : c2, life: 24 }); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 4, r1: 30, c: c2, life: 14 }); break;
    case 'firestorm': for (let k = 0; k < 3; k++) { for (let i = 0; i < 8; i++) this.spawn({ k: 'flame', x: T.x + rnd(-20, 20), y: T.y + 16, vy: -2 - Math.random() * 2, s: rnd(3, 5), life: rnd(14, 24) }); yield* wait(4); } this.spawn({ k: 'pillar', x: T.x, y: T.y + 24, w: 18, h: 70, c, life: 18 }); break;
    case 'multicut': for (let i = 0; i < 4 + pw; i++) { const an = Math.random() * Math.PI; this.spawn({ k: 'line', x1: T.x - Math.cos(an) * 24, y1: T.y - Math.sin(an) * 20, x2: T.x + Math.cos(an) * 24, y2: T.y + Math.sin(an) * 20, c: i % 2 ? c2 : c, w: 2, grow: 2, life: 10 }); Sound.sfx('slash'); yield* wait(3); } break;
    case 'iai': this.spawn({ k: 'flash', c: '#ffffff', a: 0.8, life: 6 }); this.spawn({ k: 'line', x1: 0, y1: T.y, x2: W, y2: T.y - 6, c: '#ffffff', w: 2, grow: 1, life: 16 }); yield* wait(10); sp(16 + pw * 4, 3.5, ['#ffffff', c2]); break;
    case 'crimson': this.spawn({ k: 'flash', c: '#ff2030', a: 0.35, life: 10 }); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 24, ang: 0.6, c: '#ffd0d0', c2: c, w: 8, life: 14 }); sp(14 + pw * 4, 3, [c, c2]); break;
    case 'rift': this.spawn({ k: 'slit', x: T.x, y: T.y, w: 34, h: 6, ang: -0.5, c, life: 26 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'mote', x: T.x + rnd(-30, 30), y: T.y + rnd(-12, 12), vy: 0, to: { x: T.x, y: T.y }, s: 2, c: c2, life: 20 }); yield* wait(10); break;
    case 'sunrise': this.spawn({ k: 'rays', x: T.x, y: T.y, n: 16, a0: 0, len: 40 + pw * 6, c: c2, life: 22 }); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 46, c, life: 22 }); this.spawn({ k: 'flash', c: c2, a: 0.5, life: 10 }); break;
    case 'pop': this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 3, r1: 16 + pw * 4, c: c2, w: 2, life: 10 }); sp(6 + pw * 2, 2); break;
    case 'explode': this.spawn({ k: 'glow', x: T.x, y: T.y, r: 30 + pw * 6, c, life: 16 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30 + pw * 6, c: c2, w: 3, life: 12 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'flame', x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 10), vx: rnd(-20, 20) / 10, vy: -rnd(5, 20) / 10, s: rnd(2, 4), life: 18 }); break;
    case 'nova': for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 26 + i * 10 + pw * 4, c: i % 2 ? c2 : c, w: 3 - i, life: 14 + i * 3 }); yield* wait(3); } this.spawn({ k: 'rune', x: T.x, y: T.y, r: 26, sq: 1, c, c2, n: 10, poly: 5, dir: -1, life: 16 }); break;
    case 'strike': this.spawn({ k: 'beam', x: T.x, y1: T.y + 20, w: 10 + pw * 2, h: 140, c: c2, life: 12 }); { const p2 = []; let x0 = T.x; for (let y = 0; y < T.y + 16; y += 8) { p2.push([x0, y]); x0 += rnd(-6, 6); } this.spawn({ k: 'bolt', pts: p2, w: 4, life: 12 }); } this.spawn({ k: 'flash', c: '#fffbe0', a: 0.55, life: 8 }); break;
    case 'storm': for (let k = 0; k < 3 + pw; k++) { const x0 = T.x + rnd(-30, 30), p2 = []; let xx = x0; for (let y = 0; y < T.y + 16; y += 8) { p2.push([xx, y]); xx += rnd(-6, 6); } this.spawn({ k: 'bolt', pts: p2, w: 3, life: 8 }); this.spawn({ k: 'flash', c: '#fffbe0', a: 0.3, life: 5 }); Sound.sfx('thunder'); yield* wait(5); } break;
    case 'judge': this.spawn({ k: 'pillar', x: T.x, y: T.y + 24, w: 26, h: 200, c: c2, life: 24 }); this.spawn({ k: 'rays', x: T.x, y: T.y, n: 12, a0: 0.2, len: 34, c, life: 20 }); this.spawn({ k: 'flash', c: '#ffffff', a: 0.6, life: 12 }); break;
    case 'chain': { let px = T.x - 40, py = T.y - 30; for (let i = 0; i < 4; i++) { const nx = T.x + rnd(-24, 24), ny = T.y + rnd(-20, 20); this.spawn({ k: 'bolt', pts: [[px, py], [(px + nx) / 2 + rnd(-6, 6), (py + ny) / 2 + rnd(-6, 6)], [nx, ny]], w: 2, life: 10 }); this.spawn({ k: 'star', x: nx, y: ny, c: c2, life: 10 }); px = nx; py = ny; yield* wait(3); } } break;
    case 'swirl': for (let i = 0; i < 16 + pw * 3; i++) { const an = i * 0.8; this.spawn({ k: 'img', img: LEAF_IMG, x: T.x + Math.cos(an) * 26, y: T.y + Math.sin(an) * 14, vx: -Math.sin(an) * 2.2, vy: Math.cos(an) * 1.2 - 0.4, fade: 1, life: 22 }); } this.spawn({ k: 'arc', x: T.x, y: T.y, r: 26, a0: 0, c, life: 18 }); break;
    case 'wave': for (let i = 0; i < 20; i++) this.spawn({ k: 'flame', x: 10 + i * 8, y: T.y + 10 + Math.sin(i) * 4, vy: -1.6, s: rnd(3, 5), life: rnd(14, 22) }); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 10, r1: 70, c, life: 18 }); break;
    case 'geyser': this.spawn({ k: 'pillar', x: T.x, y: T.y + 26, w: 16, h: 90, c, life: 20 }); for (let i = 0; i < 18; i++) this.spawn({ k: 'circ', x: T.x + rnd(-8, 8), y: T.y + 20, vx: rnd(-15, 15) / 10, vy: -rnd(25, 50) / 10, g: 0.2, r: rnd(1, 3), c: i % 2 ? c : c2, life: 26 }); break;
    case 'firepillar': this.spawn({ k: 'pillar', x: T.x, y: T.y + 26, w: 22, h: 110, c, life: 24 }); for (let k = 0; k < 3; k++) { for (let i = 0; i < 10; i++) this.spawn({ k: 'flame', x: T.x + rnd(-14, 14), y: T.y + 20, vy: -2.5 - Math.random() * 2, s: rnd(3, 6), life: rnd(16, 26) }); yield* wait(4); } break;
    case 'impact': this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 6, r1: 80, c, life: 22 }); for (let i = 0; i < 16; i++) this.spawn({ k: 'shard', g: 0.15, x: T.x + rnd(-10, 10), y: T.y + 10, vx: rnd(-30, 30) / 10, vy: -rnd(15, 40) / 10, s: rnd(3, 6), c: i % 2 ? '#8a7e6a' : c, life: 30 }); this.spawn({ k: 'flash', c: c2, a: 0.5, life: 10 }); break;
    case 'hexburst': this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 30 + pw * 4, c: c2, life: 14 }); sp(8 + pw * 3, 2.5); break;
    case 'bash': this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 4, r1: 44, c, life: 16 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'star', x: T.x + rnd(-14, 14), y: T.y - 20 + rnd(-4, 4), c: c2, life: 18 }); break;
    case 'glare': this.spawn({ k: 'glow', x: T.x, y: T.y - 8, r: 20, c, life: 16 }); break;
  }
  if (!['glare'].includes(kind)) this.spawn({ k: 'glow', x: T.x, y: T.y, r: 18 + pw * 5, c, life: 12 });
}
// 1) cast
function* heroCast(u, mv, id, t) {
  const [cast, , pal] = styleOf(id, mv), [c, c2] = PAL[pal], lv = mv.lv || 1, f = CASTS[cast] || CASTS.draw;
  const w = f.call(this, this.center(u), this.center(t || this.F), c, c2, lv); yield* wait(w + lv * 2);
}
// 2) impact (after the skill's own FX): each skill has its own finisher; weakness / crit / skill level make it bigger
function* heroImpact(T, mv, r, id, u) {
  const [, imp, pal, snd] = styleOf(id, mv), [c, c2] = PAL[pal], lv = mv.lv || 1, big = (r && (r.mult > 1 || r.crit)) ? 1 : 0, pw = lv + big;
  if (snd) Sound.sfx(snd);
  yield* heroImpactStyle.call(this, imp || 'cut', T, this.center(u || this.H), c, c2, pw);
  if (big) this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 6 });
  this.shake = Math.max(this.shake, 4 + pw * 3);
}
// 3) support skills: palette & shape follow the skill (halo for heals, hexes for guards, aura pulse for buffs)
function heroBless(u, mv, id) {
  const [cast, , pal] = styleOf(id, mv), [c, c2] = PAL[pal], U = this.center(u), lv = mv.lv || 1;
  if (cast === 'halo') { this.spawn({ k: 'pillar', x: U.x, y: U.y + 20, w: 14 + lv * 3, h: 80, c: c2, life: 26 }); for (let i = 0; i < 10 + lv * 4; i++) this.spawn({ k: 'mote', x: U.x + rnd(-16, 16), y: U.y + rnd(0, 18), vy: -(0.8 + Math.random()), s: 2, c: i % 2 ? c : c2, life: rnd(20, 34) }); }
  else if (cast === 'hex') { for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 30 + i * 4, r1: 12 + i * 6, c: i % 2 ? c2 : c, life: 18 + i * 4 }); }
  else { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 34, r1: 6, c, w: 2, life: 16 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c, life: 18 }); }
}
