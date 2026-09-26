/* ===================== FX pack 4: flourish layer for HERO skills (cast circle → skill FX → impact burst) =====================
   Hero-only materials (clean light: rune circles, light rays, ground shockwaves, rising motes). Scales with skill level. */
const ELEM_FX = { 火: ['#ff6a2a', '#ffd070'], 水: ['#3aa8f0', '#c8f0ff'], 草: ['#5cd060', '#d8ffb0'], 雷: ['#f8d030', '#fffbd0'], 岩: ['#c8a060', '#fff0c0'], 一般: ['#86b4ff', '#ffffff'] };
const elemFx = t => ELEM_FX[t] || ELEM_FX.一般;
const HERO_PK = {
  rune(x, p, a) { // rotating magic circle drawn flat on the ground
    const r = p.r * Math.min(1, p.t / 6), rot = p.t * 0.08; x.globalAlpha = Math.min(1, a * 1.6); x.strokeStyle = p.c; x.lineWidth = 1.5;
    x.beginPath(); x.ellipse(p.x, p.y, r, r * 0.38, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(p.x, p.y, r * 0.72, r * 0.27, 0, 0, 7); x.stroke();
    x.fillStyle = p.c2; for (let i = 0; i < 8; i++) { const an = rot + i * Math.PI / 4; x.fillRect(Math.round(p.x + Math.cos(an) * r * 0.86) - 1, Math.round(p.y + Math.sin(an) * r * 0.33) - 1, 2, 2); }
    x.strokeStyle = p.c2; x.beginPath(); for (let i = 0; i <= 3; i++) { const an = -rot + i * Math.PI * 2 / 3; const px = p.x + Math.cos(an) * r * 0.7, py = p.y + Math.sin(an) * r * 0.26; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke();
  },
  rays(x, p, a) { // radial light rays
    x.globalAlpha = a; x.strokeStyle = p.c; x.lineCap = 'round';
    for (let i = 0; i < p.n; i++) { const an = p.a0 + i * Math.PI * 2 / p.n, r0 = 6 + p.t * 1.5, r1 = r0 + p.len * a; x.lineWidth = i % 2 ? 1 : 2; x.beginPath(); x.moveTo(p.x + Math.cos(an) * r0, p.y + Math.sin(an) * r0); x.lineTo(p.x + Math.cos(an) * r1, p.y + Math.sin(an) * r1); x.stroke(); }
  },
  shock(x, p, a) { const r = lerp(p.r0, p.r1, p.t / p.life); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2 + a * 2; x.beginPath(); x.ellipse(p.x, p.y, r, r * 0.3, 0, 0, 7); x.stroke(); },
  mote(x, p, a) { p.x += p.vx || 0; p.y += p.vy || -0.6; x.globalAlpha = a; x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.s || 2, p.s || 2); if ((p.s || 2) > 1 && p.t % 6 < 3) { x.fillStyle = '#ffffff'; x.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); } },
  pillar(x, p, a) { const w = p.w * (0.4 + 0.6 * a); const g = x.createLinearGradient(p.x - w, 0, p.x + w, 0); const [r, gg, b] = hex2rgb(p.c); g.addColorStop(0, `rgba(${r},${gg},${b},0)`); g.addColorStop(0.5, `rgba(${r},${gg},${b},${0.7 * a})`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); x.fillStyle = g; x.fillRect(p.x - w, p.y - p.h, w * 2, p.h); },
};
{ const _dp = drawParticle; drawParticle = function (x, p) { const f = HERO_PK[p.k]; if (f && !p.hidden) { const a = 1 - p.t / p.life; x.save(); f(x, p, a); x.restore(); return; } _dp(x, p); }; }

// 1) cast: circle under the hero, rising motes, a pillar of light (bigger with skill level)
function* heroCast(u, mv) {
  const U = this.center(u), [c, c2] = elemFx(mv.t), lv = mv.lv || 1, foot = U.y + 10;
  Sound.sfx('charge');
  this.spawn({ k: 'rune', x: U.x, y: foot, r: 22 + lv * 4, c, c2, life: 30 + lv * 4 });
  this.spawn({ k: 'glow', x: U.x, y: U.y, r: 20 + lv * 4, c, life: 18 });
  if (lv >= 2) this.spawn({ k: 'pillar', x: U.x, y: foot, w: 10 + lv * 3, h: 60, c: c2, life: 20 });
  for (let i = 0; i < 6 + lv * 4; i++) this.spawn({ k: 'mote', x: U.x + rnd(-18, 18), y: foot - rnd(0, 8), vx: 0, vy: -(0.6 + Math.random() * 1.2), s: rnd(1, 2), c: i % 3 ? c : c2, life: rnd(18, 30) });
  if (lv >= 3) this.spawn({ k: 'flash', c: c2, a: 0.25, life: 8 });
  yield* wait(12 + lv * 2);
}
// 2) impact: shockwave, rays, bursts; stronger on weakness/crit and at higher skill level
function heroImpact(T, mv, r) {
  const [c, c2] = elemFx(mv.t), lv = mv.lv || 1, big = (r && (r.mult > 1 || r.crit)) ? 1 : 0, pw = lv + big;
  this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 26 + pw * 8, c: c2, w: 3, life: 14 });
  this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 6, r1: 36 + pw * 8, c, life: 18 });
  this.spawn({ k: 'rays', x: T.x, y: T.y, n: 8 + pw * 2, a0: Math.random(), len: 14 + pw * 5, c: c2, life: 14 });
  this.spawn({ k: 'glow', x: T.x, y: T.y, r: 24 + pw * 6, c, life: 14 });
  this.sparks(T.x, T.y, 10 + pw * 5, [c, c2, '#ffffff'], 2.4 + pw * 0.4, 22, 0.08);
  this.spawn({ k: 'flash', c: big ? '#ffffff' : c2, a: big ? 0.45 : 0.22, life: 8 });
  this.shake = Math.max(this.shake, 6 + pw * 4);
}
// 3) support skills (heal / shield / self buff): rising light around the hero
function heroBless(u, mv) {
  const U = this.center(u), [c, c2] = mv.heal ? ['#72e39a', '#e8fff0'] : mv.shield ? ['#86b4ff', '#e8f4ff'] : elemFx(mv.t), lv = mv.lv || 1;
  this.spawn({ k: 'pillar', x: U.x, y: U.y + 20, w: 14 + lv * 3, h: 70, c: c2, life: 24 });
  this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 6, r1: 30 + lv * 4, c, life: 18 });
  for (let i = 0; i < 10 + lv * 4; i++) this.spawn({ k: 'mote', x: U.x + rnd(-16, 16), y: U.y + rnd(0, 18), vy: -(0.8 + Math.random()), s: rnd(1, 2), c: i % 2 ? c : c2, life: rnd(20, 34) });
}
