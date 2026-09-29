/* ===================== v25 疾風刺 redone (playtest: "the effect is unclear" — one thin green line, invisible on grass) =====================
   Wind gathers round the hero, a spear-point of wind (dark rim so it reads on grass and snow) shoots at the foe trailing two
   twisting wind ribbons, then pierces: a shock ring, lines bursting out the far side, flat wind shards and a light flash.
   The spear's normal attack (突刺) keeps its short thrust, now with a dark under-stroke so it stays visible. */
Object.assign(HERO_PK, {
  galeTip(x, p, a) { const A = Math.min(1, a * 2); x.translate(p.x, p.y); x.rotate(p.ang); const L = p.len, w = p.w;
    const g = x.createLinearGradient(-L * 1.6, 0, 0, 0); g.addColorStop(0, 'rgba(110,240,208,0)'); g.addColorStop(1, 'rgba(110,240,208,0.75)'); x.globalAlpha = A; x.fillStyle = g; lozenge(x, -L * 1.7, 0, 0, 0, w * 0.9);
    x.fillStyle = 'rgba(8,30,34,0.8)'; lozenge(x, -L / 2 - 3, 0, L / 2 + 4, 0, w + 4);
    x.fillStyle = '#3ad8b8'; lozenge(x, -L / 2, 0, L / 2, 0, w);
    x.fillStyle = '#ffffff'; lozenge(x, -L / 6, 0, L / 2 - 1, 0, w * 0.42); },
  galeRibbon(x, p, a) { const tp = p.tip, ex = tp ? tp.x : p.x1, ey = tp ? tp.y : p.y1, dx = ex - p.x0, dy = ey - p.y0, L = Math.hypot(dx, dy); if (L < 4) return;
    const nx = -dy / L, ny = dx / L, n = Math.max(6, Math.floor(L / 5)); x.globalAlpha = Math.min(1, a * 1.6); x.lineCap = 'round';
    for (const [c, lw] of [['rgba(8,30,34,0.55)', 4], [p.c, 2]]) { x.strokeStyle = c; x.lineWidth = lw; x.beginPath();
      for (let i = 0; i <= n; i++) { const t = i / n, amp = 7 * Math.sin(t * Math.PI) * (0.4 + 0.6 * t), o = Math.sin(t * 9 + p.ph + p.t * 0.5) * amp; const X = p.x0 + dx * t + nx * o, Y = p.y0 + dy * t + ny * o; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); } x.stroke(); } },
});
FX.galeThrust = function* (U, T, u, t) {
  Sound.sfx('wind'); const Y0 = U.y - 6, dx = T.x - U.x, dy = T.y - Y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  // 1) wind gathers
  for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2, r = 28; this.spawn({ k: 'line', x1: U.x + Math.cos(an) * r, y1: Y0 + Math.sin(an) * r * 0.6, x2: U.x + Math.cos(an) * 5, y2: Y0 + Math.sin(an) * 3, c: i % 2 ? '#ffffff' : '#6ef0d0', w: 2, grow: 5, life: 9 }); }
  this.spawn({ k: 'glow', x: U.x, y: Y0, r: 20, c: '#6ef0d0', life: 14 }); yield* wait(7);
  // 2) the thrust
  yield* this.lunge(u, 16, 2); Sound.sfx('slash');
  const F = 6, tip = this.spawn({ k: 'galeTip', x: U.x, y: Y0, ang: Math.atan2(dy, dx), len: 30, w: 9, life: F + 4, upd: p => { if (p.t <= F) { p.x = U.x + dx * p.t / F; p.y = Y0 + dy * p.t / F; } } });
  for (const [c, ph] of [['#ffffff', 0], ['#6ef0d0', Math.PI]]) this.spawn({ k: 'galeRibbon', x0: U.x, y0: Y0, tip, c, ph, life: F + 10, upd: () => {} });
  yield* wait(F);
  // 3) pierce
  Sound.sfx('hitSuper'); this.shake = Math.max(this.shake || 0, 6);
  this.spawn({ k: 'flash', c: '#e8fff8', a: 0.28, life: 6 });
  this.spawn({ k: 'shock', x: T.x, y: T.y, r0: 4, r1: 30, c: '#e8fff8', life: 14 }); this.spawn({ k: 'shock', x: T.x, y: T.y, r0: 2, r1: 18, c: '#6ef0d0', life: 10 });
  for (let i = -2; i <= 2; i++) { const an = Math.atan2(uy, ux) + i * 0.22, len = 34 + (2 - Math.abs(i)) * 10, x2 = T.x + Math.cos(an) * len, y2 = T.y + Math.sin(an) * len;
    this.spawn({ k: 'line', x1: T.x, y1: T.y, x2, y2, c: 'rgba(8,30,34,0.6)', w: 4, grow: 3, life: 11 }); this.spawn({ k: 'line', x1: T.x, y1: T.y, x2, y2, c: i ? '#bff8ea' : '#ffffff', w: 2, grow: 3, life: 11 }); }
  for (let i = 0; i < 14; i++) { const an = Math.atan2(uy, ux) + rnd(-60, 60) / 100, v = rnd(15, 35) / 10; this.spawn({ k: 'dot', sl: 1, x: T.x, y: T.y, vx: Math.cos(an) * v, vy: Math.sin(an) * v, c: i % 3 ? '#6ef0d0' : '#ffffff', s: 2, life: 16 + rnd(0, 6) }); }
  yield* this.shakeB(t, 8, 3);
};
MOVES.gale.fx = 'galeThrust'; for (const id in WMOVE) if (MOVES[id].tpl === 'gale') MOVES[id].fx = 'galeThrust';
// the spear's plain thrust: same shape as before, drawn over a dark under-stroke
{ const _wt = FX.windThrust; FX.windThrust = function* (U, T, u, t) {
    const n0 = this.fx.length; const g = _wt.call(this, U, T, u, t); let r = g.next(), added = false;
    while (!r.done) { if (!added && this.fx.length > n0) { added = true; for (const p of this.fx.slice(n0)) if (p.k === 'line' && p.w >= 4) { const q = this.spawn({ ...p, c: 'rgba(8,30,34,0.6)', w: p.w + 3 }); this.fx.splice(this.fx.indexOf(q), 1); this.fx.splice(this.fx.indexOf(p), 0, q); } } yield r.value; r = g.next(); }
  };
}
