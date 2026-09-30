/* ===================== v10.4 new skill effects (plan item 16 「新特效」) =====================
   Nine skills still borrowed an orb skill's effect, so two different skills looked identical. Each now has its own:
   unique-weapon skills 裂地斬 / 潮鳴突 / 熔核爆 / 霜華詠唱, signature moves 武者一閃 / 元素奔流 / 影牙連射 / 共鳴旋律 / 連環寸勁.
   Evolved orb skills also show their evolution: 強攻 (A) = an orange impact burst, 附加 (B) = cyan runes; the final stage is bigger. */
const FX_EL_COL = { 火: ['#ff7a30', '#fff0a0', '#e04818'], 水: ['#3c9cf0', '#e8f8ff', '#1c5cc0'], 雷: ['#f8d030', '#fffbe0', '#c09010'], 草: ['#58d060', '#e8ffd0', '#2c9038'], 毒: ['#b060e0', '#f0d8ff', '#7030a0'], 岩: ['#c09060', '#f8e8d0', '#806040'] };
function heroElemNow() { const st = Game.st, g = st && st.equip && gearBy(st.equip.weapon, st); if (!g) return null; return (g.en && g.en.t) || (GEAR[g.b] && GEAR[g.b].elem) || null; }
const fxBurst = (b, X, Y, n, cols, spd = 2.4, life = 18, g = 0.12) => b.sparks(X, Y, n, cols, spd, life, g);

// 裂地斬 (quakeAxe): a heavy overhead chop, the ground cracks open and rocks fly
FX.quakeCleave = function* (U, T, u, t) {
  yield* this.lunge(u, 10, 4); Sound.sfx('heavy');
  this.spawn({ k: 'line', x1: T.x + 6, y1: T.y - 34, x2: T.x - 2, y2: T.y + 14, c: '#f4e4c8', w: 5, grow: 3, life: 10 });
  yield* wait(3); Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ffb060', a: 0.25, life: 6 });
  this.spawn({ k: 'mcrack', x: T.x, y: T.y + 16, n: 6, c: '#ff9a40', life: 28 });
  for (let i = 0; i < 7; i++) this.spawn({ k: 'mrock', x: T.x + rnd(-14, 14), y: T.y + 12, vx: rnd(-20, 20) / 10, vy: -rnd(20, 40) / 10, g: 0.25, r: rnd(2, 4), c: '#9a8a78', vr: 0.2, life: 24 });
  fxBurst(this, T.x, T.y + 12, 10, ['#ff9a40', '#ffd080', '#c09060'], 2.5, 18, 0.15);
  if (t) yield* this.shakeB(t, 10, 3); else yield* wait(10);
};
// 潮鳴突 (tideRapier): a needle-thin thrust, then the tide roars around the target
FX.tideThrust = function* (U, T, u) {
  yield* this.lunge(u, 12, 3); Sound.sfx('slash');
  this.spawn({ k: 'line', x1: U.x + 6, y1: U.y - 8, x2: T.x + 4, y2: T.y - 2, c: '#e8f8ff', w: 2, grow: 3, life: 8 });
  this.spawn({ k: 'line', x1: U.x + 6, y1: U.y - 6, x2: T.x + 4, y2: T.y, c: '#3c9cf0', w: 4, grow: 3, life: 10 }); yield* wait(3);
  Sound.sfx('water'); this.star(T.x, T.y, '#e8f8ff', 8);
  for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y + 4, r0: 4 + i * 4, r1: 24 + i * 8, fl: 0.45, c: i ? '#88c8ff' : '#e8f8ff', w: 2, life: 14 + i * 3 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; this.spawn({ k: 'dot', x: T.x + Math.cos(a) * 6, y: T.y + Math.sin(a) * 4, vx: Math.cos(a) * 1.8, vy: Math.sin(a) * 1.2 - 1.4, g: 0.14, s: 2, c: i % 2 ? '#58a8f8' : '#e8f8ff', life: 20 }); }
  for (let i = 0; i < 5; i++) this.spawn({ k: 'bub', x: T.x + rnd(-12, 12), y: T.y + rnd(0, 10), vy: -0.6, r: rnd(2, 3), c: '#c8ecff', life: 22 });
  yield* wait(12);
};
// 熔核爆 (coreStaff): a molten core flies over and bursts three times
FX.coreBurst = function* (U, T) {
  Sound.sfx('charge'); const x0 = U.x + 4, y0 = U.y - 14, F = 12;
  this.spawn({ k: 'glow', x: x0, y: y0, r: 12, c: '#ff8a30', life: 8 }); yield* wait(4);
  this.spawn({ k: 'circ', x: x0, y: y0, r: 4, c: '#ffb040', hl: '#ffffff', life: F + 1, upd: p => { const k = Math.min(1, p.t / F); p.x = lerp(x0, T.x, k); p.y = lerp(y0, T.y, k) - Math.sin(k * Math.PI) * 18; if (p.t % 2 === 0) this.spawn({ k: 'mflame', x: p.x + rnd(-2, 2), y: p.y + rnd(-2, 2), s: 3, c: '#ff7a30', life: 10 }); } });
  yield* wait(F); Sound.sfx('fire');
  for (let i = 0; i < 3; i++) { const X = T.x + [0, -10, 10][i], Y = T.y + [0, 6, -6][i];
    this.spawn({ k: 'glow', x: X, y: Y, r: 16 - i * 3, c: i ? '#ff7a30' : '#ffd060', life: 10 }); this.spawn({ k: 'ring', x: X, y: Y, r0: 3, r1: 20 - i * 3, c: '#ffb040', w: 2, life: 10 });
    fxBurst(this, X, Y, 8, ['#fff0a0', '#ff9a40', '#e04818'], 2.6, 16, 0.1); Sound.sfx('hit'); yield* wait(4); }
  this.spawn({ k: 'flash', c: '#ff9040', a: 0.22, life: 6 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'mpuff', x: T.x + rnd(-12, 12), y: T.y + rnd(-6, 6), vy: -0.4, r: 4, c: '#5a4a48', op: 0.6, life: 20 }); yield* wait(8);
};
// 霜華詠唱 (frostTome): an ice flower opens around the target and shatters into snow
FX.frostBloom = function* (U, T) {
  Sound.sfx('charge'); this.spawn({ k: 'mrune', x: U.x + 6, y: U.y - 16, s: 5, c: '#a8e8ff', life: 14 }); yield* wait(6);
  const petals = []; for (let i = 0; i < 6; i++) { const a0 = i / 6 * Math.PI * 2; petals.push(this.spawn({ k: 'mshard', x: T.x, y: T.y, r: 5, rot: a0, vr: 0.05, c: i % 2 ? '#c8f0ff' : '#8ad8ff', life: 22, upd: p => { const k = Math.min(1, p.t / 10), a = a0 + p.t * 0.06; p.x = T.x + Math.cos(a) * 16 * k; p.y = T.y + Math.sin(a) * 12 * k; } })); }
  Sound.sfx('water'); yield* wait(12); Sound.sfx('crit');
  this.spawn({ k: 'glow', x: T.x, y: T.y, r: 18, c: '#c8f0ff', life: 10 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 30, c: '#e8f8ff', w: 2, life: 12 });
  fxBurst(this, T.x, T.y, 16, ['#ffffff', '#c8f0ff', '#8ad8ff'], 3, 20, 0.05);
  for (let i = 0; i < 10; i++) this.spawn({ k: 'dot', x: T.x + rnd(-26, 26), y: T.y - rnd(16, 34), vy: 0.5 + Math.random() * 0.4, vx: Math.random() * 0.4 - 0.2, c: '#ffffff', s: 2, life: 34 });
  yield* wait(12);
};
// 武者一閃 (swordsman): a flash of steel — the hero is already past, then the cut appears
FX.iaiFlash = function* (U, T, u) {
  Sound.sfx('wind'); this.spawn({ k: 'line', x1: U.x - 6, y1: U.y - 4, x2: T.x + 20, y2: T.y - 4, c: 'rgba(232,240,255,0.8)', w: 1, grow: 2, life: 8 }); yield* this.lunge(u, 16, 2);
  this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 4 }); yield* wait(6); Sound.sfx('slash');
  this.spawn({ k: 'line', x1: T.x - 26, y1: T.y + 2, x2: T.x + 26, y2: T.y - 4, c: '#ffffff', w: 3, grow: 2, life: 14 });
  this.spawn({ k: 'line', x1: T.x - 26, y1: T.y + 4, x2: T.x + 26, y2: T.y - 2, c: '#a8d8ff', w: 1, grow: 2, life: 16 });
  this.star(T.x + 20, T.y - 3, '#ffffff', 10); fxBurst(this, T.x, T.y, 8, ['#ffffff', '#c8e0ff'], 2, 14, 0); yield* wait(10);
};
// 元素奔流 (mage): a torrent in the colour of the weapon's element / enchant
FX.elemTorrent = function* (U, T) {
  const [c, h, d] = FX_EL_COL[heroElemNow()] || ['#c890ff', '#f8f0ff', '#7040c0']; Sound.sfx('charge');
  this.spawn({ k: 'maura', x: U.x, y: U.y - 6, r0: 22, r1: 6, c, life: 12 }); yield* wait(8); Sound.sfx('buzz');
  this.spawn({ k: 'mbeam', x1: U.x + 4, y1: U.y - 12, x2: T.x, y2: T.y, w: 5, pulse: 1, c, life: 18, grow: 6 });
  for (let i = 0; i < 14; i++) { const k0 = i / 14; this.spawn({ k: 'dot', x: lerp(U.x, T.x, k0) + rnd(-5, 5), y: lerp(U.y - 12, T.y, k0) + rnd(-5, 5), vx: rnd(-6, 6) / 10, vy: rnd(-6, 6) / 10, c: i % 3 ? c : h, s: 2, life: 16 + rnd(0, 6) }); }
  yield* wait(8); Sound.sfx('hitSuper'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 20, c, life: 12 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 28, c: h, w: 2, life: 12 });
  fxBurst(this, T.x, T.y, 14, [c, h, d], 2.8, 18, 0.05); yield* wait(10);
};
// 影牙連射 (ranger, one fang per hit): a shadow fang streaks in and bites
FX.shadowFang = function* (U, T) {
  Sound.sfx('wind'); const x0 = U.x + 6, y0 = U.y - 8, tx = T.x + rnd(-5, 5), ty = T.y + rnd(-4, 4), F = 6;
  this.spawn({ k: 'mshard', x: x0, y: y0, r: 5, c: '#6a4a9a', vr: 0, rot: Math.atan2(ty - y0, tx - x0), life: F + 1, upd: p => { const k = Math.min(1, p.t / F); p.x = lerp(x0, tx, k); p.y = lerp(y0, ty, k); this.spawn({ k: 'dot', x: p.x, y: p.y, c: '#3a2458', s: 2, life: 8 }); } });
  yield* wait(F); Sound.sfx('slash'); this.spawn({ k: 'mfang', x: tx, y: ty, w: 22, c: '#d8c8ff', life: 12 }); fxBurst(this, tx, ty, 6, ['#b890ff', '#ffffff', '#3a2458'], 2, 12, 0); yield* wait(6);
};
// 共鳴旋律 (bard, on the hero): notes circle the hero inside expanding resonance rings
FX.resonanceSong = function* (U) {
  Sound.sfx('statUp'); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 30, fl: 0.6, c: ['#ffd860', '#ed9dcc', '#c8b0ff'][i], w: 2, life: 16, delay: 0 });
  for (let i = 0; i < 6; i++) { const a0 = i / 6 * Math.PI * 2; this.spawn({ k: 'mnote', x: U.x, y: U.y, c: i % 2 ? '#ffd860' : '#ed9dcc', life: 30, upd: p => { const a = a0 + p.t * 0.12, r = 10 + p.t * 0.6; p.x = U.x + Math.cos(a) * r; p.y = U.y - 6 + Math.sin(a) * r * 0.55 - p.t * 0.3; } }); }
  yield* wait(10); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 18, c: '#ffe8a0', life: 12 }); yield* wait(12);
};
// 連環寸勁 (monk, one blow per hit): a short punch, and the inner force ripples out of the target
FX.innerForce = function* (U, T, u) {
  yield* this.lunge(u, 8, 2); Sound.sfx('hit'); const X = T.x + rnd(-6, 6), Y = T.y + rnd(-6, 6);
  this.star(X, Y, '#ffffff', 6); this.spawn({ k: 'glow', x: X, y: Y, r: 10, c: '#ffc040', life: 6 });
  for (let i = 0; i < 2; i++) this.spawn({ k: 'ring', x: X, y: Y, r0: 2 + i * 3, r1: 14 + i * 6, c: i ? '#ffc040' : '#ffffff', w: 2, life: 8 + i * 3 });
  this.spawn({ k: 'line', x1: X - 3, y1: Y - 3, x2: X + 16, y2: Y + 10, c: 'rgba(255,224,160,0.8)', w: 2, grow: 2, life: 8 }); yield* wait(5);
};
// who gets which effect (only the move data changes; damage and mechanics stay the same)
{ const NEW_FX = { u_quakeAxe: 'quakeCleave', u_tideRapier: 'tideThrust', u_coreStaff: 'coreBurst', u_frostTome: 'frostBloom', sig_swordsman: 'iaiFlash', sig_mage: 'elemTorrent', sig_ranger: 'shadowFang', sig_bard: 'resonanceSong', sig_monk: 'innerForce' };
  for (const k in NEW_FX) if (MOVES[k]) MOVES[k].fx = NEW_FX[k]; }

/* ---------- evolved orb skills: the evolution is visible on the hit ---------- */
evoFlash = function (b, t, br) {
  const C = b.center(t), A = br[br.length - 1] === 'A', fin = br.length >= 2;
  if (A) { b.spawn({ k: 'ring', x: C.x, y: C.y, r0: 6, r1: fin ? 42 : 32, c: '#ffb040', w: fin ? 3 : 2, life: 16 }); b.spawn({ k: 'flash', c: '#ffd080', a: fin ? 0.3 : 0.2, life: 8 });
    b.spawn({ k: 'glow', x: C.x, y: C.y, r: fin ? 24 : 16, c: '#ffb040', life: 10 }); b.sparks(C.x, C.y, fin ? 16 : 8, ['#ffd080', '#ff8030', '#ffffff'], 3, 18, 0.1);
    if (fin) for (let i = 0; i < 4; i++) b.spawn({ k: 'mshard', x: C.x, y: C.y, r: 4, vx: Math.cos(i * 1.57 + 0.78) * 2.2, vy: Math.sin(i * 1.57 + 0.78) * 2.2, c: '#ffe0a0', life: 14 }); }
  else { b.spawn({ k: 'ring', x: C.x, y: C.y, r0: 6, r1: fin ? 38 : 30, c: '#80e0ff', w: 2, life: 16 }); b.spawn({ k: 'flash', c: '#a0f0ff', a: 0.18, life: 8 });
    const n = fin ? 3 : 1; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2; b.spawn({ k: 'mrune', x: C.x, y: C.y, s: 4, c: '#80e0ff', life: 22, upd: p => { const a = a0 + p.t * 0.15, r = n > 1 ? 18 : 0; p.x = C.x + Math.cos(a) * r; p.y = C.y + Math.sin(a) * r * 0.6 - p.t * 0.3; } }); } }
};
