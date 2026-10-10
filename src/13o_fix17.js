/* ===================== v12.120 玩家 2026-10-11 的四點 =====================
   1.「冰和寒氣這兩個相關招式特效不好」→ 霜嶺心法五招重做：真正的六角雪花（有分枝）、從地面刺出來的冰柱、寒霧、把對手封進冰晶裡再碎掉。
   2.「有時主角身體旁邊出現綠色的線條」→ 原因：回復的光、能力提升（速度是綠色）會噴出「拖尾的火花」，看起來像線；迴避提升有綠色的風線；
      荊棘反傷是一條從主角拉到魔物的綠線。→ 都改成不拖尾的光點／在魔物身上冒出荊棘，不再有線。
   3.「杖的技能改成紫色」→ 法杖的魔力色（arcane）從藍紫改成紫色。
   4.「ex 技能特效太簡單了 增加一點辨識度」→ 每招 EX 先來一段「EX 發動」：畫面變暗、橫跨畫面的色帶滑進來、
      寫出「EX」和招式名稱、那棵樹的紋章（晨星的星芒・緋月的新月・天籟的音符・蒸汽的齒輪・霜嶺的雪花・龍脈的龍鱗）在主角身後亮起，再接原本的特效。 */
const HD17 = {};
// 2. 綠色的線
HD15.statFx = function* (U, dir, pal) { const up = dir > 0, P = pal || (up ? HD15.P.blaze : HD15.P.down), y0 = U.y + (up ? 4 : -30);
  HD15.ring(this, { x: U.x, y: U.y + 16 }, P, 4, 28, { fl: 0.3, w: 2.2, dur: 22 });
  for (let i = 0; i < 3; i++) HD15.chev(this, { x: U.x + (i - 1) * 17, y: y0 + Math.abs(i - 1) * 6 * (up ? 1 : -1) }, P, { delay: i === 1 ? 0 : 4, life: 40, s: i === 1 ? 9 : 7, rise: up ? 1.5 : -1.1, down: !up });
  for (let i = 0; i < 8; i++) HD15.mote(this, U.x + (Math.random() - 0.5) * 34, U.y + (up ? 14 : -10), (Math.random() - 0.5) * 0.4, up ? -0.6 - Math.random() * 0.8 : 0.5 + Math.random() * 0.5, P, { life: 26 });
  yield* wait(28); };
if (typeof BFX15 !== 'undefined') {
  BFX15.heal = function* (b, C) { const P = HD15.P.life, G = BFX15.foot(b, C); HD15.ring(b, G, P, 4, 32, { fl: 0.3, w: 1.6, dur: 20 }); HD15.motes(b, G, { x: C.x, y: C.y - 36 }, 10, P, { dur: 20 }); HD15.flash(b, C, P, 30, { dur: 16, delay: 4 }); yield* wait(22); };
  BFX15.smokeOn = function* (b, t, smk) { const C = b.center(t), G = BFX15.foot(b, C); Sound.sfx('wind');
    if (smk) { HD15.smoke(b, G, 14, { col: '#c8c8d0', r: 30, sz: 16, spd: 1, up: 0.35, life: 36 }); HD15.smoke(b, C, 8, { col: '#e4e4ea', r: 20, sz: 12, spd: 0.8, life: 30, delay: 4 }); yield* wait(18); return; }
    if (t.hero && typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(b, (i % 2 ? -1 : 1) * i * 6, 0, '#9ad0ff', 8 + i * 3, 0.4); yield* wait(16); };
}
{ const _sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { if (this.noLine17 && p && p.k === 'line') return p; return _sp.call(this, p); };
  const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) { if (!(P && (P.kind === 'thorns' || P.kind === 'reflect') && t && HD15.on)) return yield* _dm.call(this, e, s, t, P);
    const C = this.center(t); if (P.kind === 'thorns') HD15.spikes(this, C, HD15.P.venom || HD15.P.wind, 7, 18, { rot: 0.3 }); else HD15.flash(this, C, HD15.P.silver, 26, { dur: 10 });
    this.noLine17 = 1; try { return yield* _dm.call(this, e, s, t, P); } finally { this.noLine17 = 0; } }; }
// 聚光：原本是一根根往中心收的短線（在草地上看起來像綠色的線），改成往中心收的光點
HD15.gather = (b, C, n, pal, R, o = {}) => { pal = HD15.W(pal); n = Math.max(2, Math.round(n * HD15.q())); for (let i = 0; i < n; i++) { const an = Math.random() * Math.PI * 2, r = R * (0.7 + Math.random() * 0.5), dl = (o.delay || 0) + Math.floor(Math.random() * (o.span || 10));
  HD15.add(b, { x: C.x + Math.cos(an) * r, y: C.y + Math.sin(an) * r * (o.fl || 0.8), delay: dl, life: dl + (o.life || 14), col: Math.random() < 0.4 ? pal.core : pal.mid,
    upd: p => { if (p.t <= p.delay) return; p.x += (C.x - p.x) * 0.2; p.y += (C.y - p.y) * 0.2; },
    draw: (x, p, k) => { const f = k < 0.2 ? k / 0.2 : 1 - HD15.ei((k - 0.2) / 0.8); HD15.put(x, HD15.tex('glow', pal.glow), p.x, p.y, 7, 7, 0, 0.6 * f); HD15.put(x, HD15.tex('core', p.col), p.x, p.y, 3, 3, 0, f); } }); } };
// 3. 法杖：紫色
Object.assign(HD15.P.arcane, { core: '#fff4ff', mid: '#d48cff', glow: '#a03cff', edge: '#2e0a5a' });
// 1. 冰：雪花・冰柱・冰晶
HD15.P.frost16 && Object.assign(HD15.P.frost16, { mid: '#c8eeff', glow: '#3aa6ff' });
HD17.flake = (b, C, pal, R, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + (o.dur || 30),
  draw: (x, p, k) => { const g = life16(k, o.grow || 0.25, o.fade || 0.7), rot = (o.rot || 0) + k * (o.spin ?? 0.6), r = R * (0.3 + 0.7 * g); if (g <= 0) return;
    HD16.line(x, () => { x.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux; x.moveTo(p.x, p.y); x.lineTo(p.x + ux * r, p.y + uy * r);
        for (const [f, l] of [[0.45, 0.28], [0.72, 0.2]]) { const X = p.x + ux * r * f, Y = p.y + uy * r * f; x.moveTo(X + nx * r * l + ux * r * l * 0.6, Y + ny * r * l + uy * r * l * 0.6); x.lineTo(X, Y); x.lineTo(X - nx * r * l + ux * r * l * 0.6, Y - ny * r * l + uy * r * l * 0.6); } } }, pal, g, Math.max(1, R / 14));
    HD16.fill(x, s => { x.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3 + Math.PI / 6; x.lineTo(p.x + Math.cos(a) * r * 0.16 * s, p.y + Math.sin(a) * r * 0.16 * s); } x.closePath(); }, pal, g); } }); };
HD17.spikes = (b, G, pal, o = {}) => { const n = o.n || 5, out = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (o.ring ? (i / n) * Math.PI * 2 : (i - (n - 1) / 2) * (o.spread || 0.32)) + (Math.random() - 0.5) * 0.15, L = (o.h || 26) * (0.65 + Math.random() * 0.5) * (o.ring ? 0.7 : 1 - Math.abs(i - (n - 1) / 2) / n), w = (o.w || 5) * (0.8 + Math.random() * 0.4), dl = (o.delay || 0) + (o.stagger ? i * o.stagger : 0);
  const bx = G.x + (o.ring ? Math.cos(a) * (o.r || 18) : (i - (n - 1) / 2) * (o.gap || 5)), by = G.y + (o.ring ? Math.sin(a) * (o.r || 18) * 0.35 : 0), dirA = o.ring ? -Math.PI / 2 + Math.cos(a) * 0.5 : a, ux = Math.cos(dirA), uy = Math.sin(dirA), nx = -uy, ny = ux;
  out.push(HD15.add(b, { x: bx, y: by, delay: dl, life: dl + (o.dur || 30), draw: (x, p, k) => { const gr = HD15.eo(HD15.cl(k / 0.15)), f = 1 - HD15.ei(HD15.cl((k - 0.7) / 0.3)); if (f <= 0) return; const l = L * gr;
    HD16.fill(x, s => { x.beginPath(); x.moveTo(p.x + nx * w / 2 * s, p.y + ny * w / 2 * s); x.lineTo(p.x + ux * l * (0.6 + 0.4 * s), p.y + uy * l * (0.6 + 0.4 * s)); x.lineTo(p.x - nx * w / 2 * s, p.y - ny * w / 2 * s); x.closePath(); }, pal, f);
    x.globalAlpha = f * 0.9; x.strokeStyle = '#ffffff'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(p.x + nx * w * 0.15, p.y + ny * w * 0.15); x.lineTo(p.x + ux * l * 0.85, p.y + uy * l * 0.85); x.stroke(); x.globalAlpha = 1; } })); } return out; };
HD17.prism = (b, C, pal, R, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + (o.dur || 34),
  draw: (x, p, k) => { const g = HD15.eo(HD15.cl(k / 0.2)), f = 1 - HD15.ei(HD15.cl((k - 0.85) / 0.15)); if (f <= 0) return; const h = R * 1.25 * g, w = R * 0.9;
    const pts = [[p.x - w, p.y + R * 0.55], [p.x - w, p.y + R * 0.55 - h], [p.x - w * 0.35, p.y + R * 0.55 - h - R * 0.3], [p.x + w * 0.35, p.y + R * 0.55 - h - R * 0.3], [p.x + w, p.y + R * 0.55 - h], [p.x + w, p.y + R * 0.55]];
    x.globalAlpha = 0.32 * f; x.fillStyle = pal.mid; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u, v) : x.moveTo(u, v)); x.closePath(); x.fill();
    HD16.line(x, () => { x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u, v) : x.moveTo(u, v)); x.closePath(); x.moveTo(p.x - w * 0.35, pts[2][1]); x.lineTo(p.x - w * 0.35, p.y + R * 0.55); x.moveTo(p.x + w * 0.35, pts[3][1]); x.lineTo(p.x + w * 0.35, p.y + R * 0.55); }, pal, f, 1.2);
    x.globalAlpha = 0.8 * f; x.strokeStyle = '#ffffff'; x.lineWidth = 1; x.beginPath(); x.moveTo(p.x - w * 0.7, pts[1][1] + 4); x.lineTo(p.x - w * 0.5, p.y); x.stroke(); x.globalAlpha = 1; } }); };
const footT17 = (b, T, t) => ({ x: T.x, y: t && t.foot ? t.foot - 2 : T.y + 24 });
if (typeof EXFX16 !== 'undefined') {
  const P = () => HD15.P.frost16, mist = (b, C, n, o = {}) => HD15.smoke(b, C, n, { col: '#e2f4ff', r: o.r || 26, sz: o.sz || 14, spd: o.spd || 0.9, up: 0.2, life: o.life || 34, ang: o.ang, spread: o.spread, delay: o.delay || 0 });
  EXFX16.xFrostPalm.f = function* (U, T, u, t) { const Pl = P(), G = footT17(this, T, t); glint15(this, Pl); mist(this, this.center(this.H), 6, { r: 14 }); Sound.sfx('fsSwing'); yield* this.lunge(u, 12, 2);
    Sound.sfx('fsHitSuper'); HD15.stop(this, 5); HD17.flake(this, T, Pl, 24, { dur: 30, spin: 0.8 }); HD17.spikes(this, G, Pl, { n: 5, h: 24, delay: 2 }); HD15.ring(this, T, Pl, 4, 30, { w: 2, dur: 16 });
    mist(this, T, 10, { r: 30 }); HD15.shards(this, T, 10, { spd: 2.8, sz: 3, up: 1, cols: [Pl.core, Pl.mid, Pl.glow] }); this.shake = Math.max(this.shake || 0, 5); yield* wait(22); };
  EXFX16.xFrostHeart.f = function* () { const Pl = P(), C = this.center(this.H), G = heroG16(this); Sound.sfx('charge'); HD15.ring(this, G, Pl, 6, 36, { fl: 0.3, w: 1.6, dur: 30 }); mist(this, G, 8, { r: 30, sz: 10 });
    HD17.flake(this, { x: C.x, y: C.y - 6 }, Pl, 30, { dur: 44, spin: 0.3 }); for (let i = 0; i < 3; i++) { const a = i * 2.094; HD17.flake(this, { x: C.x + Math.cos(a) * 26, y: C.y + Math.sin(a) * 16 }, Pl, 7, { dur: 36, delay: 6 + i * 3, spin: 1.2 }); }
    HD15.gather(this, C, 12, HD15.P.mp, 34, { span: 14 }); yield* wait(26); HD15.flash(this, C, Pl, 30, { dur: 12 }); yield* wait(12); };
  EXFX16.xFrostSlide.f = function* (U, T, u) { const Pl = P(); Sound.sfx('fsSwing'); yield* this.lunge(u, 8, 2); Sound.sfx('quake'); this.shake = Math.max(this.shake || 0, 6);
    for (const [i, v] of foesV16(this).entries()) { const C = this.center(v), G = footOf16(this, v); for (let j = 0; j < 3; j++) mist(this, { x: C.x - 30 + j * 10, y: C.y - 70 + j * 6 }, 6, { ang: 1.15, spread: 0.3, spd: 3.2, sz: 18, life: 24, delay: i * 3 + j * 2 });
      for (let j = 0; j < 4; j++) HD17.flake(this, { x: C.x - 20 + j * 13, y: C.y - 30 + (j % 2) * 10 }, Pl, 6, { dur: 24, delay: 4 + i * 3 + j * 2, spin: 2 }); HD17.spikes(this, G, Pl, { n: 4, h: 18, delay: 10 + i * 3 }); }
    yield* wait(12); HD15.stop(this, 4); this.shake = Math.max(this.shake || 0, 10); for (const v of foesV16(this)) { mist(this, footOf16(this, v), 10, { r: 34, sz: 16 }); HD15.shards(this, this.center(v), 8, { spd: 2.6, sz: 3, up: 0.8, cols: [Pl.core, Pl.mid, Pl.glow] }); } yield* wait(18); };
  EXFX16.xFrostGuard.f = function* () { const Pl = P(), C = this.center(this.H), G = heroG16(this); Sound.sfx('shGuard'); HD17.spikes(this, G, Pl, { n: 8, ring: 1, r: 22, h: 30, stagger: 2, dur: 40 }); HD15.ring(this, G, Pl, 6, 36, { fl: 0.3, w: 1.8, dur: 24 });
    HD17.flake(this, { x: C.x, y: C.y - 4 }, Pl, 14, { dur: 38, delay: 8, spin: 0.8 }); mist(this, G, 6, { r: 26, sz: 10 }); yield* wait(24); HD15.flash(this, C, Pl, 28, { dur: 12 }); HD15.shards(this, C, 6, { spd: 1.6, sz: 2.4, up: 0.6, cols: [Pl.core, Pl.mid, Pl.glow] }); yield* wait(12); };
  EXFX16.xFrostSeal.f = function* (U, T, u, t) { const Pl = P(), G = footT17(this, T, t); HD15.dim(this, 0.42, 80); Sound.sfx('charge'); HD15.ring(this, G, Pl, 6, 70, { fl: 0.3, w: 2.4, dur: 30 }); mist(this, G, 12, { r: 50, sz: 16 });
    HD17.spikes(this, G, Pl, { n: 6, ring: 1, r: 30, h: 26, stagger: 2, delay: 6, dur: 50 }); yield* wait(14); Sound.sfx('crit'); HD17.prism(this, T, Pl, 26, { dur: 30 }); HD17.flake(this, { x: T.x, y: T.y - 34 }, Pl, 18, { dur: 30, spin: 0.4 }); yield* wait(24);
    HD15.stop(this, 6); this.spawn({ k: 'flash', c: '#e8f6ff', a: 0.35, life: 10 }); HD15.shards(this, T, 22, { spd: 4, sz: 3.6, up: 1.4, cols: [Pl.core, Pl.mid, Pl.glow] }); HD17.flake(this, T, Pl, 40, { dur: 26, spin: -0.3 }); mist(this, T, 12, { r: 40 }); this.shake = Math.max(this.shake || 0, 9); yield* wait(22); };
}
// 4. EX 發動：色帶＋「EX」＋招式名＋紋章
const EXCOL17 = { xDawn: 'star16', xMoon: 'moon16', xSong: 'song16', xGear: 'brass16', xFrost: 'frost16', xDrake: 'drake16' };
HD17.exIntro = function* (id) { const key = typeof EX16 !== 'undefined' && EX16.ids[id]; if (!key) return; const pal = HD15.P[EXCOL17[key]], D = DEF.skills[id], C = this.center(this.H), BY = 88, name = D.name;
  Sound.sfx('charge'); HD15.dim(this, 0.4, 30);
  HD15.add(this, { x: W / 2, y: BY, life: 30, free: 1, draw: (x, p, k) => { const sl = HD15.eo(HD15.cl(k / 0.22)), f = 1 - HD15.ei(HD15.cl((k - 0.78) / 0.22)), off = (1 - sl) * -W;
      const g = x.createLinearGradient(0, BY - 14, 0, BY + 14); g.addColorStop(0, HD15.rgba(pal.glow, 0)); g.addColorStop(0.5, HD15.rgba(pal.edge, 0.85)); g.addColorStop(0.3, HD15.rgba(pal.glow, 0.6)); g.addColorStop(0.7, HD15.rgba(pal.glow, 0.6)); g.addColorStop(1, HD15.rgba(pal.glow, 0));
      x.globalAlpha = f; x.fillStyle = g; x.fillRect(off, BY - 14, W, 28); x.fillStyle = HD15.rgba(pal.core, 0.9); x.fillRect(off, BY - 11, W, 1); x.fillRect(off, BY + 10, W, 1);
      Font.draw(x, 'EX', off + 38, BY - 9, pal.core, pal.edge, 9); Font.drawC(x, name, off + W / 2 + 12, BY - 9, '#ffffff', pal.edge, 13); x.globalAlpha = 1; } });
  const E = { x: 26, y: BY }, em = { xDawn: () => HD16.star(this, E, pal, 13, { n: 4, dur: 30, spin: 1 }), xMoon: () => HD16.moon(this, E, pal, 11, { dur: 30, rot: 0 }), xSong: () => HD16.note(this, E, E, pal, { dur: 24, wob: 0, s: 1.6 }),
    xGear: () => HD16.gear(this, E, pal, 11, { dur: 30, spin: 4 }), xFrost: () => HD17.flake(this, E, pal, 12, { dur: 30, spin: 1 }), xDrake: () => HD16.scales(this, { x: E.x, y: E.y + 14 }, pal, { n: 5, r: 12, dur: 30 }) }[key]; if (em) em();
  HD15.ring(this, heroG16(this), pal, 6, 40, { fl: 0.3, w: 2, dur: 22 }); HD15.gather(this, C, 10, pal, 30, { span: 10 }); yield* wait(22); };
if (typeof EXFX16 !== 'undefined' && typeof EX16 !== 'undefined' && EX16.live) for (const k in EXFX16) { const key = 'hd15_' + k, orig = FX[key]; if (!orig) continue;
  FX[key] = function* (U, T, u, t) { yield* HD17.exIntro.call(this, 't_' + k); yield* orig.call(this, U, T, u, t); }; }
