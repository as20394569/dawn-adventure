/* ===================== v26c 招式對齊名稱 (playtest: "skill names / effects / text don't match; normal attacks should look like the weapon") =====================
   1) every weapon gets a look from its element, then its name (火・冰・水・雷・葉・毒・月・星・虛・聖・血・機械・風・沙・龍・岩・氣・音・魔);
      its normal attack is drawn per weapon kind in those colours, and every hit it lands (normal, skill, 特技) ends in that look's burst
   2) pictures that didn't match the name: 見切 (was a hex shield), 水流刃 (bubbles), 疾射飛刀 (a ring; on guns it is now 「快速射擊」),
      龍槍・貫穿・雙龍突・跳躍・龍神降臨 (small hits), 時空凍結 (faint)
   3) the text tells the whole truth: element side effects and the elemental-weapon conversion are written into each skill */
let wThemeBurst = null, wThemeTH = {}; // exported to the battle scene (07b): the per-weapon colour theme and its finishing burst
{
  const WTHEME = {
    steel: ['#a8d8ff', '#ffffff', 'rgba(10,20,40,0.6)'], fire: ['#ff7a30', '#fff0a0', 'rgba(70,14,0,0.6)'], water: ['#3c9cf0', '#e8f8ff', 'rgba(0,20,60,0.6)'],
    ice: ['#8ad8ff', '#ffffff', 'rgba(0,30,60,0.6)'], volt: ['#f8d030', '#fffbe0', 'rgba(50,40,0,0.6)'], leaf: ['#58d060', '#e8ffd0', 'rgba(0,40,10,0.6)'],
    venom: ['#b060e0', '#f0d8ff', 'rgba(30,0,40,0.6)'], moon: ['#b8c8ff', '#ffffff', 'rgba(10,10,50,0.6)'], star: ['#ffd860', '#ffffff', 'rgba(30,20,60,0.6)'],
    void: ['#9a5ae0', '#f0e0ff', 'rgba(20,0,40,0.7)'], holy: ['#ffc850', '#fffbe8', 'rgba(60,40,0,0.5)'], blood: ['#e03848', '#ffd0d0', 'rgba(50,0,0,0.6)'],
    brass: ['#e0a840', '#fff0c0', 'rgba(40,25,0,0.6)'], wind: ['#6ef0d0', '#ffffff', 'rgba(8,30,34,0.6)'], sand: ['#e0c080', '#fff4d8', 'rgba(50,35,10,0.6)'],
    dragon: ['#ff5a4a', '#ffe0c0', 'rgba(60,0,0,0.6)'], rock: ['#c09060', '#f8e8d0', 'rgba(40,25,10,0.6)'], chi: ['#ffc040', '#ffffff', 'rgba(50,30,0,0.5)'],
    sound: ['#c8b0ff', '#ffffff', 'rgba(20,10,40,0.5)'], arcane: ['#c890ff', '#f8f0ff', 'rgba(25,0,45,0.6)'],
  };
  const KW = [['ice', '冰霜雪'], ['fire', '炎火燼熔'], ['volt', '雷電'], ['leaf', '翠森荊橡葉'], ['venom', '毒蠍蛇蟾沼'], ['water', '水潮湖汐'], ['moon', '月'], ['star', '星彗'], ['dragon', '龍'],
    ['void', '虛界影暗黯冥亡黑'], ['holy', '曙晨聖王宮'], ['blood', '血修骸收'], ['brass', '銅發條齒輪蒸汽時計'], ['wind', '風鷹疾'], ['sand', '沙砂漠'], ['rock', '岩泰坦甲'], ['chi', '氣']];
  const FIX = { mistDagger: 'wind', fangWand: 'arcane', quartzWand: 'arcane', ruinStaff: 'arcane', ancientTome: 'arcane', hydraStaff: 'fire', witchTome: 'fire', wolfFang2: 'steel', fangDagger: 'blood', tigerClaw: 'blood', crystalBlade: 'ice' };
  const BYKIND = { 拳套: 'chi', 法杖: 'arcane', 魔導書: 'arcane', 樂器: 'sound', 火槍: 'brass' }, BYELEM = { 火: 'fire', 雷: 'volt', 草: 'leaf', 毒: 'venom' };
  const themeOf = k => { const B = GEAR[k]; if (!B) return 'steel'; if (FIX[k]) return FIX[k];
    if (B.elem === '水') return /[冰霜雪晶]/.test(B.n) ? 'ice' : 'water'; if (BYELEM[B.elem]) return BYELEM[B.elem];
    for (const [t, s] of KW) if ([...s].some(ch => B.n.includes(ch))) return t; return BYKIND[B.kind] || 'steel'; };
  const TH = {}; for (const k in WSK) TH[k] = themeOf(k);
  const R = (a, b) => a + Math.random() * (b - a);

  Object.assign(HERO_PK, {
    wLeaf(x, p, a) { x.globalAlpha = Math.min(1, a * 1.5); x.translate(p.x, p.y); x.rotate(p.ang + p.t * p.spin); x.fillStyle = 'rgba(0,40,10,0.6)'; lozenge(x, -p.s / 2 - 1, 0, p.s / 2 + 1, 0, p.s * 0.6 + 2); x.fillStyle = p.c; lozenge(x, -p.s / 2, 0, p.s / 2, 0, p.s * 0.6); },
    wOrb(x, p, a) { x.globalAlpha = Math.min(1, a * 1.4); x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.8)'; x.fillRect(Math.round(p.x - p.r / 2), Math.round(p.y - p.r / 2), 1, 1); },
    wMoon(x, p, a) { x.globalAlpha = Math.min(1, a * 1.5); x.translate(p.x, p.y); x.rotate(p.ang); x.fillStyle = p.c; x.beginPath(); x.arc(0, 0, p.r, -1.3, 1.3); x.arc(-p.r * 0.5, 0, p.r * 0.9, 1.2, -1.2, true); x.closePath(); x.fill(); },
    wCog(x, p, a) { x.globalAlpha = Math.min(1, a * 1.5); x.translate(p.x, p.y); x.rotate(p.t * 0.3); x.fillStyle = p.c; for (let i = 0; i < 6; i++) { x.rotate(Math.PI / 3); x.fillRect(-1, -p.r - 1.5, 2, 2); } x.beginPath(); x.arc(0, 0, p.r, 0, 7); x.fill(); x.fillStyle = 'rgba(40,25,0,0.8)'; x.fillRect(-1, -1, 2, 2); },
    wSwirl(x, p, a) { x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.arc(p.x, p.y, p.r * (0.5 + 0.5 * p.t / p.life), p.ph + p.t * 0.35, p.ph + p.t * 0.35 + 2.2); x.stroke(); },
    wNote(x, p, a) { x.globalAlpha = Math.min(1, a * 1.5); x.fillStyle = 'rgba(20,10,40,0.6)'; x.beginPath(); x.ellipse(p.x, p.y, 3.2, 2.6, -0.4, 0, 7); x.fill(); x.fillRect(Math.round(p.x), Math.round(p.y - 8), 3, 9); x.fillStyle = p.c; x.beginPath(); x.ellipse(p.x, p.y, 2.2, 1.6, -0.4, 0, 7); x.fill(); x.fillRect(Math.round(p.x + 1), Math.round(p.y - 7), 1, 7); x.fillRect(Math.round(p.x + 1), Math.round(p.y - 7), 3, 1); },
    thrTip(x, p, a) { const A = Math.min(1, a * 2), L = p.len, w = p.w; x.translate(p.x, p.y); x.rotate(p.ang);
      x.globalAlpha = A * 0.55; x.fillStyle = p.c; lozenge(x, -L * 1.6, 0, 0, 0, w * 0.8);
      x.globalAlpha = A; x.fillStyle = p.d; lozenge(x, -L / 2 - 3, 0, L / 2 + 4, 0, w + 4); x.fillStyle = p.c; lozenge(x, -L / 2, 0, L / 2, 0, w); x.fillStyle = p.h; lozenge(x, -L / 6, 0, L / 2 - 1, 0, w * 0.42); },
    flyBlade(x, p, a) { x.globalAlpha = Math.min(1, a * 2); x.translate(p.x, p.y); x.rotate(p.ang); const r = p.r, W = p.w;
      const C = (rr, w, col) => { x.fillStyle = col; x.beginPath(); x.arc(0, 0, rr, -1.15, 1.15); x.arc(-w, 0, rr * 1.04, 1.12, -1.12, true); x.closePath(); x.fill(); };
      C(r + 2, W + 3, p.d); C(r, W, p.c); C(r - 1, W * 0.35, p.h); },
    wGlint(x, p, a) { const g = Math.sin(Math.min(1, p.t / p.life) * Math.PI), L = p.r * g; x.globalAlpha = 1; x.fillStyle = p.c; lozenge(x, p.x - L, p.y, p.x + L, p.y, 3 * g + 1); lozenge(x, p.x, p.y - L * 0.5, p.x, p.y + L * 0.5, 2 * g + 1); x.fillStyle = '#ffffff'; lozenge(x, p.x - L * 0.6, p.y, p.x + L * 0.6, p.y, 1.4); },
  });

  // the look's burst on the foe
  function burst(T, tk, big) { const [c, h, d] = WTHEME[tk] || WTHEME.steel, n = big ? 14 : 9, S = this;
    const ring = (r1, col, w = 2, life = 12) => S.spawn({ k: 'ring', x: T.x, y: T.y, r0: 3, r1, c: col, w, life });
    const out = (k, o) => { for (let i = 0; i < n; i++) { const an = Math.random() * 6.283, v = R(1, 2.6) * (o.sp || 1); S.spawn({ k, x: T.x + Math.cos(an) * 4, y: T.y + Math.sin(an) * 4, vx: Math.cos(an) * v, vy: Math.sin(an) * v + (o.vy || 0), g: o.g || 0, c: i % 3 ? c : h, s: o.s || 2, r: o.r, ang: an, spin: R(-0.4, 0.4), life: (o.life || 16) + rnd(-3, 3) }); } };
    switch (tk) {
      case 'fire': case 'dragon': for (let i = 0; i < n; i++) S.spawn({ k: 'flame', x: T.x + rnd(-12, 12), y: T.y + rnd(-8, 10), vy: -R(0.6, 1.4), s: rnd(3, 5), life: 14 + rnd(0, 6) }); S.spawn({ k: 'glow', x: T.x, y: T.y, r: 18, c, life: 12 }); break;
      case 'water': out('dot', { g: 0.18, vy: -1.2 }); ring(26, h); break;
      case 'ice': out('shard', { s: 4, sp: 0.8 }); ring(22, h); break;
      case 'volt': for (let j = 0; j < 3; j++) { const an = Math.random() * 6.283, pts = [[T.x, T.y]]; let px = T.x, py = T.y; for (let q = 0; q < 4; q++) { px += Math.cos(an) * 7 + rnd(-4, 4); py += Math.sin(an) * 7 + rnd(-4, 4); pts.push([px, py]); } S.spawn({ k: 'bolt', pts, w: 2, life: 8 }); } out('dot', { s: 1, sp: 1.4, life: 10 }); break;
      case 'leaf': out('wLeaf', { s: 5, sp: 0.9, vy: -0.4, g: 0.04, life: 20 }); break;
      case 'venom': for (let i = 0; i < n; i++) S.spawn({ k: 'wOrb', x: T.x + rnd(-12, 12), y: T.y + rnd(-6, 10), vx: R(-0.3, 0.3), vy: -R(0.5, 1.2), r: R(1.5, 3.5), c: i % 3 ? c : h, life: 18 + rnd(0, 6) }); break;
      case 'moon': out('wMoon', { r: 5, sp: 0.8, life: 18 }); ring(24, c); break;
      case 'star': for (let i = 0; i < 5 + (big ? 3 : 0); i++) S.spawn({ k: 'star', x: T.x + rnd(-16, 16), y: T.y + rnd(-14, 14), c: i % 2 ? c : h, life: 8 + rnd(0, 8) }); out('dot', { s: 1, life: 14 }); break;
      case 'void': for (let i = 0; i < n; i++) { const an = Math.random() * 6.283, r = R(14, 24); S.spawn({ k: 'wOrb', x: T.x + Math.cos(an) * r, y: T.y + Math.sin(an) * r, vx: -Math.cos(an) * r / 14, vy: -Math.sin(an) * r / 14, r: R(1.5, 3), c: i % 3 ? c : '#3a1060', life: 14 }); } ring(20, c, 3); break;
      case 'holy': for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283; S.spawn({ k: 'line', x1: T.x + Math.cos(an) * 6, y1: T.y + Math.sin(an) * 6, x2: T.x + Math.cos(an) * 26, y2: T.y + Math.sin(an) * 26, c: i % 2 ? c : h, w: 2, grow: 3, life: 10 }); } S.spawn({ k: 'glow', x: T.x, y: T.y, r: 16, c: h, life: 10 }); break;
      case 'blood': out('dot', { g: 0.2, vy: -1 }); S.spawn({ k: 'line', sl: 1, x1: T.x - 14, y1: T.y + 8, x2: T.x + 14, y2: T.y - 8, c, w: 3, grow: 2, life: 10 }); break;
      case 'brass': out('wCog', { r: 3, sp: 0.9, g: 0.08, life: 18 }); break;
      case 'wind': for (let i = 0; i < 4; i++) S.spawn({ k: 'wSwirl', x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 10), r: R(8, 14), c: i % 2 ? c : h, ph: Math.random() * 6, life: 14 }); break;
      case 'sand': out('dot', { g: 0.12, sp: 1.3 }); break;
      case 'rock': out('shard', { g: 0.15, s: 4, vy: -1.5 }); break;
      case 'chi': ring(22, c, 3); ring(14, h, 2, 9); out('dot', { life: 12 }); break;
      case 'sound': for (let i = 0; i < 4; i++) S.spawn({ k: 'wNote', x: T.x + rnd(-14, 14), y: T.y + rnd(-6, 8), vx: R(-0.4, 0.4), vy: -R(0.6, 1.1), c: i % 2 ? c : h, life: 20 }); ring(20, c); break;
      case 'arcane': ring(20, c); for (let i = 0; i < 6; i++) S.spawn({ k: 'star', x: T.x + rnd(-14, 14), y: T.y + rnd(-12, 12), c: i % 2 ? c : h, life: 6 + rnd(0, 8) }); break;
      default: out('dot', { sp: 1.3, life: 12 }); S.star(T.x, T.y, h);
    }
  }

  // a travelling tip (spear point, knife, bullet)
  const tipTo = (S, x0, y0, x1, y1, F, len, w, col, life) => S.spawn({ k: 'thrTip', x: x0, y: y0, ang: Math.atan2(y1 - y0, x1 - x0), len, w, c: col[0], h: col[1], d: col[2], life: life || F + 3, upd: p => { const k = Math.min(1, p.t / F); p.x = x0 + (x1 - x0) * k; p.y = y0 + (y1 - y0) * k; } });
  function* thrust(S, U, T, o) {
    const x0 = U.x + (o.ox || 0), y0 = U.y - 6 + (o.oy || 0), tx = T.x + (o.tox || 0), ty = T.y + (o.toy || 0), dx = tx - x0, dy = ty - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, F = o.F || 5;
    const ex = o.through ? tx + ux * 70 : tx, ey = o.through ? ty + uy * 70 : ty, tip = tipTo(S, x0, y0, ex, ey, F, o.len || 28, o.w || 9, o.col, F + 4);
    if (o.rib) for (const [c, ph] of o.rib) S.spawn({ k: 'galeRibbon', x0, y0, tip, c, ph, life: F + 10, upd: () => {} });
    yield* wait(o.through ? Math.max(2, Math.round(F * L / (L + 70))) : F);
    S.shake = Math.max(S.shake || 0, o.shake || 6); S.spawn({ k: 'shock', x: tx, y: ty, r0: 4, r1: o.ring || 28, c: o.col[1], life: 13 }); S.spawn({ k: 'shock', x: tx, y: ty, r0: 2, r1: (o.ring || 28) * 0.6, c: o.col[0], life: 10 });
    for (let i = -2; i <= 2; i++) { const an = Math.atan2(uy, ux) + i * 0.24, len = 30 + (2 - Math.abs(i)) * 9; S.spawn({ k: 'line', x1: tx, y1: ty, x2: tx + Math.cos(an) * len, y2: ty + Math.sin(an) * len, c: i ? o.col[0] : o.col[1], w: 2, grow: 3, life: 10 }); }
    return { ux, uy };
  }
  const RED = ['#ff5a4a', '#ffe0c0', 'rgba(60,0,0,0.7)'], GOLD = ['#ffb040', '#fff0c0', 'rgba(60,30,0,0.7)'], STEEL = ['#c8d8f0', '#ffffff', 'rgba(10,20,40,0.75)'], SHOT = ['#ffd040', '#ffffff', 'rgba(60,40,0,0.7)'];

  // ---------- normal attacks, one per weapon kind, in the weapon's colours ----------
  FX.wAtk = function* (U, T, u) {
    const col = WTHEME[this._thT] || WTHEME.steel, [c, h, d] = col, kind = this._thKind || '劍', dx = T.x - U.x, dy = T.y - U.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
    const blade = (x1, y1, x2, y2, w, life = 12) => { this.spawn({ k: 'line', sl: 1, x1, y1, x2, y2, c: d, w: w + 2, grow: 3, life }); this.spawn({ k: 'line', sl: 1, x1, y1, x2, y2, c, w, grow: 3, life }); };
    switch (kind) {
      case '短刀': yield* this.lunge(u, 12, 2); for (let i = 0; i < 2; i++) { Sound.sfx('slash'); const o = i ? 7 : -7; tipTo(this, T.x - ux * 26 + px * o, T.y - uy * 26 + py * o, T.x + ux * 4 + px * o * 0.3, T.y + uy * 4 + py * o * 0.3, 3, 12, 4, col, 7); yield* wait(4); } this.star(T.x, T.y, h); yield* wait(4); break;
      case '斧': yield* this.lunge(u, 10, 4); Sound.sfx('slash'); blade(T.x + 10, T.y - 30, T.x - 6, T.y + 24, 9, 14); yield* wait(4); Sound.sfx('rock'); this.shake = Math.max(this.shake || 0, 6);
        this.spawn({ k: 'shock', x: T.x, y: T.y + 18, r0: 4, r1: 30, c: h, life: 12 }); for (let i = 0; i < 8; i++) this.spawn({ k: 'dot', x: T.x + rnd(-14, 14), y: T.y + 18, vx: R(-1.2, 1.2), vy: -R(1, 2.4), g: 0.2, c: i % 2 ? '#a89070' : c, s: 2, life: 16 }); yield* wait(6); break;
      case '長槍': Sound.sfx('wind'); yield* this.lunge(u, 20, 2); Sound.sfx('slash'); this.spawn({ k: 'line', x1: U.x, y1: U.y - 6, x2: T.x, y2: T.y, c, w: 2, grow: 5, life: 9 }); yield* thrust(this, U, T, { col, F: 5, len: 24, w: 7, ring: 20, shake: 3 }); yield* wait(5); break;
      case '拳套': yield* this.lunge(u, 14, 2); Sound.sfx('hit'); this.shake = Math.max(this.shake || 0, 4); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 18, c: d, w: 5, life: 9 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 16, c, w: 3, life: 9 });
        for (let i = 0; i < 6; i++) { const an = i / 6 * 6.283 + 0.3; this.spawn({ k: 'line', x1: T.x + Math.cos(an) * 8, y1: T.y + Math.sin(an) * 8, x2: T.x + Math.cos(an) * 20, y2: T.y + Math.sin(an) * 20, c: i % 2 ? c : h, w: 2, grow: 2, life: 8 }); } this.star(T.x, T.y, h); yield* wait(8); break;
      case '法杖': case '魔導書': { Sound.sfx('charge'); const n = kind === '魔導書' ? 3 : 1, S0 = { x: U.x, y: U.y - 6 }; this.spawn({ k: 'glow', x: S0.x, y: S0.y, r: 14, c, life: 12 }); if (n > 1) this.spawn({ k: 'ring', x: U.x, y: U.y + 4, r0: 6, r1: 16, c, w: 1, life: 14 });
        yield* wait(6); for (let j = 0; j < n; j++) { const oy = (j - (n - 1) / 2) * 7, t0 = j * 3, F = 10; for (const [rr, cc] of [[7, d], [5, c], [2.2, h]]) this.spawn({ k: 'wOrb', x: S0.x, y: S0.y, r: n > 1 ? rr * 0.8 : rr, c: cc, life: t0 + F + 1, upd: p => { const k = clamp((p.t - t0) / F, 0, 1); p.hidden = p.t < t0; p.x = lerp(S0.x, T.x, k) + Math.sin(k * Math.PI) * oy; p.y = lerp(S0.y, T.y, k); if (cc === c && p.t % 2 === 0 && k > 0 && k < 1) this.spawn({ k: 'dot', x: p.x + rnd(-2, 2), y: p.y + rnd(-2, 2), c: h, s: 1, life: 8 }); } }); }
        yield* wait(11 + (n - 1) * 3); Sound.sfx('hit'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 3, r1: 18, c: h, w: 2, life: 10 }); this.star(T.x, T.y, h, 10); yield* wait(8); break; }
      case '樂器': Sound.sfx('charge'); for (let i = 0; i < 3; i++) { const o = (i - 1) * 8, x0 = U.x + o, y0 = U.y - 8; this.spawn({ k: 'wNote', x: x0, y: y0, c: i % 2 ? h : c, life: 14, upd: p => { const k = Math.min(1, p.t / 10); p.x = x0 + (T.x - x0) * k; p.y = y0 + (T.y - y0) * k - Math.sin(k * Math.PI) * 10; } }); yield* wait(2); }
        yield* wait(9); Sound.sfx('hit'); for (let i = 0; i < 2; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4 + i * 4, r1: 22 + i * 8, c: i ? c : h, w: 2, life: 12 }); yield* wait(8); break;
      case '火槍': { const mx = U.x + ux * 12, my = U.y - 6 + uy * 12; Sound.sfx('crit'); this.spawn({ k: 'glow', x: mx, y: my, r: 10, c: '#fff0a0', life: 6 }); this.star(mx, my, '#fff8d0', 6); tipTo(this, mx, my, T.x, T.y, 3, 14, 3, SHOT, 5); yield* wait(3);
        Sound.sfx('hit'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 14, c: h, w: 2, life: 8 }); this.sparks(T.x, T.y, 8, [c, h, '#fff0a0'], 2.4, 12); yield* wait(8); break; }
      default: yield* this.lunge(u, 8, 3); for (let i = 0; i < 2; i++) { Sound.sfx('slash'); const o = i * 12 - 6; if (i) blade(T.x + 18 + o, T.y - 20, T.x - 16 + o, T.y + 18, 5); else blade(T.x - 20 + o, T.y - 20, T.x + 14 + o, T.y + 18, 5); yield* wait(4); } this.star(T.x, T.y, h); yield* wait(6);
    }
  };

  // ---------- skills whose picture didn't match the name ----------
  FX.mikiri = function* (U) { // 見切: the eyes flash and the blade is drawn, ready to cut back
    Sound.sfx('tick'); this.spawn({ k: 'dark', a: 0.35, life: 24 }); yield* wait(5); Sound.sfx('crit');
    this.spawn({ k: 'glow', x: U.x + 3, y: U.y - 12, r: 16, c: '#a8d8ff', life: 12 }); this.spawn({ k: 'wGlint', x: U.x + 3, y: U.y - 12, r: 28, c: '#a8d8ff', life: 16 });
    for (let i = 0; i < 3; i++) this.spawn({ k: 'line', sl: 1, x1: U.x - 28, y1: U.y - 2 + i * 6, x2: U.x + 28, y2: U.y - 6 + i * 6, c: i === 1 ? '#ffffff' : '#a8d8ff', w: i === 1 ? 4 : 3, grow: 3, life: 12 });
    this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 28, r1: 12, c: '#a8d8ff', w: 1, life: 14 }); yield* wait(14); };
  FX.aquaBlade = function* (U, T) { // 水流刃: a crescent of water flies and cuts
    Sound.sfx('water'); const x0 = U.x, y0 = U.y - 6, F = 8, col = WTHEME.water; this.spawn({ k: 'ring', x: x0, y: y0, r0: 18, r1: 6, c: '#88c8ff', w: 2, life: 8 }); yield* wait(5);
    this.spawn({ k: 'flyBlade', x: x0, y: y0, ang: Math.atan2(T.y - y0, T.x - x0), r: 14, w: 5, c: col[0], h: col[1], d: col[2], life: F + 2, upd: p => { const k = Math.min(1, p.t / F); p.x = x0 + (T.x - x0) * k; p.y = y0 + (T.y - y0) * k; if (p.t % 2 === 0) this.spawn({ k: 'dot', x: p.x + rnd(-4, 4), y: p.y + rnd(-4, 4), vy: 0.4, g: 0.1, c: '#88c8ff', s: 2, life: 10 }); } });
    yield* wait(F); Sound.sfx('slash');
    this.spawn({ k: 'line', sl: 1, x1: T.x - 18, y1: T.y - 16, x2: T.x + 16, y2: T.y + 16, c: '#3c9cf0', w: 5, grow: 3, life: 12 }); this.spawn({ k: 'line', sl: 1, x1: T.x + 18, y1: T.y - 16, x2: T.x - 16, y2: T.y + 16, c: '#58a8f8', w: 4, grow: 3, life: 12 });
    this.spawn({ k: 'ring', x: T.x, y: T.y + 6, r0: 6, r1: 32, c: '#a8e0ff', w: 3, life: 14 }); this.sparks(T.x, T.y, 16, ['#88c8ff', '#ffffff', '#58a8f8'], 3, 22, 0.18); yield* wait(10); };
  FX.throwKnives = function* (U, T) { // 疾射飛刀: three knives thrown in a fan
    Sound.sfx('wind'); const x0 = U.x + 6, y0 = U.y - 8;
    for (let i = 0; i < 3; i++) { const tx = T.x + (i - 1) * 6, ty = T.y + (i - 1) * 3; tipTo(this, x0, y0, tx, ty, 5, 11, 4, STEEL, 12); this.spawn({ k: 'line', x1: x0, y1: y0, x2: tx, y2: ty, c: 'rgba(232,240,255,0.7)', w: 1, grow: 5, life: 8 }); Sound.sfx('slash'); yield* wait(2); }
    yield* wait(4); Sound.sfx('hit'); this.sparks(T.x, T.y, 10, ['#ffffff', '#c8d8f0'], 2.2); this.star(T.x, T.y); yield* wait(8); };
  FX.gunDraw = function* (U, T) { // 快速射擊 (guns): draw and fire twice
    const x0 = U.x + 8, y0 = U.y - 8;
    for (let i = 0; i < 2; i++) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: x0, y: y0, r: 11, c: '#fff0a0', life: 6 }); this.star(x0, y0, '#fff8d0', 6); const tx = T.x + (i ? 5 : -5), ty = T.y + (i ? 3 : -3);
      tipTo(this, x0, y0, tx, ty, 3, 16, 3, SHOT, 5); yield* wait(3); Sound.sfx('hit'); this.spawn({ k: 'ring', x: tx, y: ty, r0: 2, r1: 14, c: '#fff0a0', w: 2, life: 8 }); this.sparks(tx, ty, 7, ['#fff0a0', '#ffffff', '#e0a840'], 2.4, 12); yield* wait(4); }
    yield* wait(6); };
  FX.dragonLance = function* (U, T, u) { // 龍槍: dragon fire gathers, a red spear point with twin dragon ribbons
    Sound.sfx('fire'); for (let i = 0; i < 8; i++) this.spawn({ k: 'flame', x: U.x + rnd(-14, 14), y: U.y + rnd(-6, 10), vy: -1.2, s: rnd(2, 4), life: 12 }); yield* wait(5);
    yield* this.lunge(u, 22, 2); Sound.sfx('slash'); yield* thrust(this, U, T, { col: RED, rib: [['#ff5a4a', 0], ['#ffb040', Math.PI]], len: 30, w: 10 });
    Sound.sfx('hitSuper'); this.spawn({ k: 'flash', c: '#ffb080', a: 0.25, life: 6 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'flame', x: T.x + rnd(-10, 10), y: T.y + rnd(-8, 8), vy: -R(0.8, 1.6), s: rnd(3, 5), life: 14 + rnd(0, 6) }); yield* wait(10); };
  FX.pierceLance = function* (U, T, u) { // 貫穿: the point goes straight through and out the other side
    yield* this.lunge(u, 26, 1); Sound.sfx('crit'); const r = yield* thrust(this, U, T, { col: STEEL, through: 1, F: 7, len: 32, w: 8, ring: 22 });
    Sound.sfx('hitSuper'); for (let i = 0; i < 10; i++) this.spawn({ k: 'shard', x: T.x + r.ux * 8, y: T.y + r.uy * 8, vx: r.ux * R(1.5, 3) + R(-0.8, 0.8), vy: r.uy * R(1.5, 3) + R(-0.8, 0.8), s: 4, c: i % 2 ? '#a8b0c0' : '#e8e8ff', life: 16 });
    this.spawn({ k: 'line', x1: T.x - r.ux * 30, y1: T.y - r.uy * 30, x2: T.x + r.ux * 60, y2: T.y + r.uy * 60, c: '#ffffff', w: 2, grow: 2, life: 10 }); yield* wait(10); };
  FX.twinDragonHit = function* (U, T, u, i) { // 雙龍突: a red dragon, then a gold one
    Sound.sfx('slash'); const s = i % 2 ? 1 : -1, col = i % 2 ? GOLD : RED;
    yield* thrust(this, U, T, { col, ox: s * 10, tox: s * 6, toy: s * 4, F: 4, len: 24, w: 8, ring: 20, shake: 4, rib: [[col[0], i ? Math.PI : 0]] }); this.spawn({ k: 'star', x: T.x + s * 6, y: T.y + s * 4, c: '#ffffff', life: 10 }); yield* wait(4); };
  FX.jumpFx = function* (U, T) { // 跳躍: the spear falls from the sky
    Sound.sfx('wind'); const x0 = T.x + 6, y0 = -30, F = 5; tipTo(this, x0, y0, T.x, T.y, F, 34, 10, STEEL, F + 6); this.spawn({ k: 'line', x1: x0, y1: y0, x2: T.x, y2: T.y, c: '#ffffff', w: 3, grow: F, life: F + 6 }); yield* wait(F);
    Sound.sfx('quake'); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 4, r1: 54, c: '#e0e8ff', life: 16 }); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 2, r1: 34, c: '#a8b8d8', life: 12 }); this.spawn({ k: 'flash', c: '#ffffff', a: 0.4, life: 6 });
    for (let i = 0; i < 12; i++) this.spawn({ k: 'shard', x: T.x + rnd(-10, 10), y: T.y + 20, vx: R(-2.2, 2.2), vy: -R(1.5, 3.2), g: 0.2, s: 4, c: i % 2 ? '#a89070' : '#d8d0c0', life: 18 }); this.shake = 16; yield* wait(12); };
  { const _dd = FX.dragonDiveFx; FX.dragonDiveFx = function* (U, T, u, t) { // 龍神降臨: a burning spear point with dragon ribbons, then the meteor
      Sound.sfx('wind'); const x0 = T.x + 30, y0 = -40, F = 6, tip = tipTo(this, x0, y0, T.x, T.y, F, 44, 14, RED, F + 6);
      for (const [c, ph] of [['#ff5a4a', 0], ['#ffe070', Math.PI]]) this.spawn({ k: 'galeRibbon', x0, y0, tip, c, ph, life: F + 10, upd: () => {} });
      yield* wait(F); yield* _dd.call(this, U, T, u, t); }; }
  { const _tf = FX.timeFreeze; FX.timeFreeze = function* (U, T, u, t) { // 時空凍結: a flash, time rings close in and frozen shards hang in the air
      Sound.sfx('charge'); this.spawn({ k: 'flash', c: '#c8ecff', a: 0.35, life: 10 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 50, r1: 10, c: '#c8ecff', w: 2, life: 16 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 40, c: '#8ad8ff', w: 3, life: 20 });
      for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283; this.spawn({ k: 'shard', x: T.x + Math.cos(an) * 22, y: T.y + Math.sin(an) * 18, s: 4, c: i % 2 ? '#c8ecff' : '#ffffff', spin: 0.05, life: 34 }); }
      yield* _tf.call(this, U, T, u, t); }; }

  const REDIR = { parry: 'mikiri', aquaBlade: 'aquaBlade', quickDraw: 'throwKnives' };
  for (const k in REDIR) if (MOVES[k]) MOVES[k].fx = REDIR[k];
  if (typeof SKILL_STYLE !== 'undefined' && SKILL_STYLE.parry) { SKILL_STYLE.parry = ['still', null, 'steel']; for (const id in WMOVE) if (MOVES[id].tpl === 'parry') SKILL_STYLE[id] = SKILL_STYLE.parry; } // 見切 was cast with a hex shield

  // ---------- truthful text ----------
  const ELEM_NOTE = { 水: [['濕', '會讓對手全身濕透。'], ['蒸氣', '對灼傷的對手會蒸氣爆發（傷害×1.3）。']], 雷: [['感電', '對濕透的對手會感電（傷害×1.5並麻痺）。']], 火: [['燎原', '對被藤蔓纏住的對手會燎原（傷害×1.5並灼傷）。']], 草: [['藤蔓', '會讓對手被藤蔓纏住（怕火）。']] };
  const elemText = (t, d = '') => (ELEM_NOTE[t] || []).filter(([kw]) => !d.includes(kw)).map(p => p[1]).join('');
  for (const id in WMOVE) { const m = MOVES[id], B = GEAR[WMOVE[id]]; if (!m || !B) continue;
    if (REDIR[m.tpl]) m.fx = REDIR[m.tpl];
    if (m.tpl === 'quickDraw' && B.kind === '火槍') { m.n = '快速射擊'; m.fx = 'gunDraw'; m.d = '比對手更快拔槍射擊。必定先出手。'; }
    let d = m.d || ''; if (m.pow) d += elemText(m.t, d);
    if (B.elem && m.t === '一般' && m.pow && m.cat === (isMagicW(B.kind) ? '特' : '物')) d += '（' + B.elem + '屬性武器：這招以' + B.elem + '屬性計算傷害）';
    m.d = d;
  }
  { const _wa = wsAttackMove; wsAttackMove = function (st = Game.st) { const m = _wa(st); m.fx = 'wAtk'; if (m.t && m.t !== '一般') m.d = MOVES.attack.d + m.t + '屬性：' + (elemText(m.t) || '可以打弱點。'); return m; }; }

  // the scene (07b) sets _thT / _thKind / _thPow for each hero action and calls this after the move's own picture
  wThemeBurst = burst; wThemeTH = TH;
}
