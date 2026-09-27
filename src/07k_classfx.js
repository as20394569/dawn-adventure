/* ===================== v19 class skills: effects for 遊俠 / 刺客 / 影舞者 / 魔劍士 + multi-hit skills =====================
   Hero materials only (never shared with monster skills). Multi-hit: every extra hit rolls its own damage, can crit and
   chips break shields on its own — the ranger line is the "shield breaker". */
PAL.venom = ['#a050e0', '#f0c8ff']; PAL.moon = ['#9ab0ff', '#f0f4ff'];
Object.assign(SKILL_STYLE, {
  twinStrike: ['dash', 'xcut', 'steel', 'slash'], venomFang: ['draw', 'cut', 'venom', 'poison'], quickDraw: ['dash', 'pop', 'steel', 'hit'], smokeBomb: ['focus', null, 'wind'],
  lacerate: ['draw', 'shatter', 'blood', 'slash'], hunterMark: ['still', 'glare', 'venom', 'statDown'], flurry: ['dash', 'multicut', 'steel', 'slash'], toxicBlade: ['aura', 'cut', 'venom', 'poison'],
  shadowStab: ['still', 'iai', 'shadow', 'crit'], deathMark: ['void', 'rift', 'venom', 'crit'], bladeDance: ['dash', 'multicut', 'wind', 'slash'], mirage: ['focus', null, 'moon'],
  eclipseSlash: ['void', 'xcut', 'moon', 'hitSuper'], arcaneEdge: ['rune', 'nova', 'arcane', 'charge'],
});
Object.assign(FX, {
  *twinStrike(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash');
    for (const [a, b] of [[-1, 1], [1, 1]]) { this.spawn({ k: 'line', x1: T.x - 22 * a, y1: T.y - 20, x2: T.x + 18 * a, y2: T.y + 18, c: '#c8e0ff', w: 4, grow: 2, life: 10 }); this.spawn({ k: 'line', x1: T.x - 22 * a, y1: T.y - 20, x2: T.x + 18 * a, y2: T.y + 18, c: '#ffffff', w: 1, grow: 2, life: 12 }); yield* wait(5); }
    this.star(T.x, T.y); yield* wait(6); },
  *venomFang(U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x - 24, y1: T.y + 2, x2: T.x + 20, y2: T.y - 4, c: '#c070ff', w: 4, grow: 2, life: 12 });
    for (let i = 0; i < 8; i++) this.spawn({ k: 'circ', x: T.x + rnd(-10, 10), y: T.y + rnd(-6, 6), vy: -0.6, r: rnd(1, 3), c: '#a050e0', hl: '#f0c8ff', life: 18 }); yield* wait(12); },
  *quickDraw(U, T) { Sound.sfx('wind'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'line', x1: U.x + 10, y1: U.y - 6 + i * 4, x2: T.x - 4, y2: T.y - 4 + i * 5, c: '#e8f0ff', w: 1, grow: 3, life: 8 }); yield* wait(2); } this.sparks(T.x, T.y, 8, ['#ffffff', '#c8d8f0']); this.star(T.x, T.y); yield* wait(8); },
  *smokeBomb(U) { Sound.sfx('wind'); for (let i = 0; i < 18; i++) this.spawn({ k: 'glow', x: U.x + rnd(-24, 24), y: U.y + rnd(-10, 16), r: rnd(8, 16), c: '#b8c0c8', life: rnd(16, 28) }); yield* wait(16); yield* FX.statUpFx.call(this, U); },
  *lacerate(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash'); for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: T.x - 16 + i * 8, y1: T.y - 20, x2: T.x - 10 + i * 8, y2: T.y + 20, c: '#ff7080', w: 3, grow: 2, life: 12 }); this.sparks(T.x, T.y, 10, ['#ff5060', '#ffd0d0'], 2.5); yield* wait(12); },
  *hunterMark(U, T) { Sound.sfx('tick'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 30, r1: 8, c: '#c070ff', w: 2, life: 16 }); this.spawn({ k: 'line', x1: T.x - 12, y1: T.y, x2: T.x + 12, y2: T.y, c: '#f0c8ff', w: 1, grow: 4, life: 18 }); this.spawn({ k: 'line', x1: T.x, y1: T.y - 12, x2: T.x, y2: T.y + 12, c: '#f0c8ff', w: 1, grow: 4, life: 18 }); yield* wait(18); },
  *flurry(U, T, u) { yield* this.lunge(u, 8, 2); Sound.sfx('slash'); for (let i = 0; i < 4; i++) { const a = rnd(0, 628) / 100, r = 20; this.spawn({ k: 'line', x1: T.x + Math.cos(a) * r, y1: T.y + Math.sin(a) * r, x2: T.x - Math.cos(a) * r, y2: T.y - Math.sin(a) * r, c: '#ffffff', w: 2, grow: 2, life: 8 }); yield* wait(3); } this.star(T.x, T.y); yield* wait(6); },
  *toxicBlade(U, T, u) { this.spawn({ k: 'glow', x: U.x, y: U.y, r: 22, c: '#a050e0', life: 14 }); yield* wait(6); yield* this.lunge(u, 12, 3); Sound.sfx('poison'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 22, ang: -0.6, c: '#f0c8ff', c2: '#8030c0', w: 5, life: 14 }); for (let i = 0; i < 14; i++) this.spawn({ k: 'bub', x: T.x + rnd(-16, 16), y: T.y + rnd(-8, 12), vy: -0.7, r: rnd(1, 3), c: '#c070ff', life: 22 }); yield* wait(14); },
  *shadowStab(U, T, u) { this.spawn({ k: 'flash', c: '#100818', a: 0.5, life: 12 }); yield* wait(6); yield* this.lunge(u, 18, 2); Sound.sfx('crit'); this.spawn({ k: 'line', x1: T.x + 26, y1: T.y + 20, x2: T.x - 20, y2: T.y - 22, c: '#ff4a5a', w: 5, grow: 1, life: 12 }); this.spawn({ k: 'line', x1: T.x + 26, y1: T.y + 20, x2: T.x - 20, y2: T.y - 22, c: '#ffffff', w: 1, grow: 1, life: 14 }); this.star(T.x, T.y, '#ffd0d0'); yield* wait(12); },
  *deathMark(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 40, r1: 4, c: '#8030c0', w: 3, life: 20 }); for (let i = 0; i < 3; i++) { this.spawn({ k: 'txt', s: '†', x: T.x - 12 + i * 10, y: T.y - 30, c: '#f0c8ff', sh: '#301040', vy: 0.6, life: 20, fade: 1 }); } yield* wait(16); yield* this.lunge(u, 16, 2); Sound.sfx('crit'); this.spawn({ k: 'flash', c: '#8030c0', a: 0.35, life: 8 }); this.sparks(T.x, T.y, 18, ['#c070ff', '#ffffff', '#301040'], 3.2); yield* wait(12); },
  *bladeDance(U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 5; i++) { const a = i * 1.25; this.spawn({ k: 'cres', x: T.x + Math.cos(a) * 6, y: T.y + Math.sin(a) * 4, r: 20, ang: a, c: '#e8fff8', c2: '#9ae8c0', w: 3, life: 10 }); Sound.sfx('slash'); yield* wait(4); } this.sparks(T.x, T.y, 12, ['#9ae8c0', '#ffffff'], 2.6); yield* wait(8); },
  *mirage(U) { Sound.sfx('heal'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x + (i - 1) * 14, y: U.y, r0: 6, r1: 22, c: '#9ab0ff', w: 2, life: 18 }); yield* wait(4); } this.tintH = { c: '#c8d8ff', a: 0.5 }; yield* wait(14); this.tintH = null; },
  *eclipseSlash(U, T, u) { this.spawn({ k: 'glow', x: U.x, y: U.y, r: 28, c: '#8a70ff', life: 18 }); Sound.sfx('charge'); yield* wait(10); yield* this.lunge(u, 14, 3); Sound.sfx('slash');
    this.spawn({ k: 'cres', x: T.x, y: T.y, r: 28, ang: -0.4, c: '#ffffff', c2: '#6a50e0', w: 7, life: 16 }); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 34, c: '#1a1030', life: 14 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 40, c: '#c8b8ff', w: 2, life: 16 }); yield* wait(16); },
  *arcaneEdge(U, T) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) { const sx = T.x + (i - 1) * 22; this.spawn({ k: 'line', x1: sx, y1: T.y - 60, x2: sx + 4, y2: T.y + 6, c: '#c8a8ff', w: 3, grow: 5, life: 12 }); this.spawn({ k: 'line', x1: sx, y1: T.y - 60, x2: sx + 4, y2: T.y + 6, c: '#ffffff', w: 1, grow: 5, life: 14 }); yield* wait(5); } this.sparks(T.x, T.y, 14, ['#a070ff', '#ffffff'], 2.8); yield* wait(10); },
});

/* ---------- multi-hit: extra hits after the first one landed ---------- */
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    const hp0 = t.hp; yield* _um.call(this, u, t, id);
    if (!u.hero || !MOVES[id] || !MOVES[id].hits || t.hp <= 0 || u.hp <= 0 || t.hp >= hp0) return;
    let mv = skillMove(id); if (u.stats.welem && mv.t === '一般' && mv.cat === (isMagicKind(u.stats.wkind) ? '特' : '物')) mv = { ...mv, t: u.stats.welem };
    let n = 1, total = hp0 - t.hp;
    for (let i = 1; i < mv.hits && t.hp > 0; i++) {
      if (!chance(Math.min(1, hitChance(u, t, mv)))) continue;
      const T0 = this.center(t), r = this.calcDamage(u, t, mv); let d = r.dmg; if (t.shield > 0) d = Math.max(1, Math.floor(d * 0.6)); d = Math.min(d, t.hp);
      this.spawn({ k: 'line', x1: T0.x - 18 + i * 5, y1: T0.y - 16, x2: T0.x + 14 - i * 3, y2: T0.y + 16, c: '#ffffff', w: 2, grow: 2, life: 8 }); Sound.sfx(r.crit ? 'crit' : 'hit');
      t.hp -= d; total += d; n++; yield* this.impact(t, r.mult > 1 || r.crit ? 2 : 1); yield* this.animHP(t); yield* wait(3);
    }
    if (n > 1) yield* this.msg(n + '連擊！合計' + total + '點傷害！', { hold: 22 });
    if (this._brkPending && this.F.hp > 0) { this._brkPending = false; yield* this.doBreak(); }
  };
}
