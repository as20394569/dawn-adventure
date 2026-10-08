/* ===================== v12.32 特效重做的工具（玩家 2026-10-06 勾了 34 招「不行」，另外樂器・魔導書・火槍整棵不行 → 先下架） =====================
   舊特效的問題（錄下來一格一格看）：線條細、淺色，在草地和天空上看不清楚；很多只在主角腳下或魔物身上閃一下，看不出技能文字寫的效果；
   每招前後還疊著共用的起手光和收尾白光，自己的樣子反而被蓋掉。
   重做的原則：
   1. 粗、帶深色外框：刀光・弧・環・光彈都有深色描邊，草地上也看得清楚。
   2. 技能文字寫的每一件事都畫出來（加速＝殘影和風、必定會心＝鎖定的準星、看破＝標記弱點、回 MP＝藍光流回主角…）；
      條件效果照當下的狀態加演出（對手 HP 一半以下、破防中、有護盾、物防降低時）。
   3. 重做的招不再疊共用的起手光・收尾光・武器光，整段由那一招自己演完。 */
const OL13 = '#120c22';
// ---------- particles ----------
const k13path = (x, pts) => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); };
Object.assign(HERO_PK, {
  // a blade cut: a tapered stroke that draws in, then its tail follows
  k13cut(x, p, a) { const g = clamp(p.t / (p.grow || 3), 0, 1), tail = clamp((p.t - (p.grow || 3)) / Math.max(1, p.life - (p.grow || 3)), 0, 1), L = p.len, dx = Math.cos(p.ang), dy = Math.sin(p.ang), nx = -dy, ny = dx;
    const u0 = tail * 0.9, u1 = g; if (u1 <= u0) return; const N = 10, top = [], bot = [], bend = p.bend || 0;
    for (let i = 0; i <= N; i++) { const u = u0 + (u1 - u0) * i / N, w = (p.w || 6) * Math.sin(Math.PI * u) * (1 - tail * 0.6) / 2 + 0.5, s = L * (u - 0.5), b = Math.sin(Math.PI * u) * bend, cx = p.x + dx * s + nx * b, cy = p.y + dy * s + ny * b; top.push([cx + nx * w, cy + ny * w]); bot.unshift([cx - nx * w, cy - ny * w]); }
    x.globalAlpha = Math.min(1, a * 2); x.lineJoin = 'round'; k13path(x, top.concat(bot)); x.strokeStyle = p.o || OL13; x.lineWidth = 2.5; x.stroke(); x.fillStyle = p.c; x.fill();
    x.strokeStyle = p.h || '#ffffff'; x.lineWidth = Math.max(1, (p.w || 6) / 4); x.beginPath(); top.forEach(([q, r], i) => { const [q2, r2] = bot[bot.length - 1 - i]; const mx = (q + q2) / 2, my = (r + r2) / 2; i ? x.lineTo(mx, my) : x.moveTo(mx, my); }); x.stroke(); },
  // a sweeping crescent (r, from a0 to a1, flattened by fl)
  k13arc(x, p, a) { const g = clamp(p.t / (p.grow || 5), 0, 1), tail = clamp((p.t - (p.grow || 5)) / Math.max(1, p.life - (p.grow || 5)), 0, 1), A0 = lerp(p.a0, p.a1, tail * 0.85), A1 = lerp(p.a0, p.a1, g); if (Math.abs(A1 - A0) < 0.02) return;
    const N = 18, out = [], inn = [], fl = p.fl || 1; for (let i = 0; i <= N; i++) { const an = A0 + (A1 - A0) * i / N, u = i / N, w = (p.w || 6) * (0.25 + 0.75 * u) * (1 - tail * 0.5); out.push([p.x + Math.cos(an) * (p.r + w / 2), p.y + Math.sin(an) * (p.r + w / 2) * fl]); inn.unshift([p.x + Math.cos(an) * (p.r - w / 2), p.y + Math.sin(an) * (p.r - w / 2) * fl]); }
    x.globalAlpha = Math.min(1, a * 2); x.lineJoin = 'round'; k13path(x, out.concat(inn)); x.strokeStyle = p.o || OL13; x.lineWidth = 2.5; x.stroke(); x.fillStyle = p.c; x.fill();
    x.strokeStyle = p.h || '#ffffff'; x.lineWidth = 1.2; x.beginPath(); for (let i = Math.floor(N * 0.4); i <= N; i++) { const an = A0 + (A1 - A0) * i / N; const X = p.x + Math.cos(an) * p.r, Y = p.y + Math.sin(an) * p.r * fl; i > Math.floor(N * 0.4) ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); },
  // an outlined ring that grows (ease-out) and thins
  k13ring(x, p, a) { const e = 1 - Math.pow(1 - p.t / p.life, 3), r = lerp(p.r0, p.r1, e), w = (p.w || 3) * (0.4 + 0.6 * a), fl = p.fl || 1; x.globalAlpha = Math.min(1, a * 1.6);
    x.strokeStyle = p.o || OL13; x.lineWidth = w + 2; x.beginPath(); x.ellipse(p.x, p.y, r, r * fl, 0, 0, 7); x.stroke(); x.strokeStyle = p.c; x.lineWidth = w; x.stroke(); if (p.h) { x.strokeStyle = p.h; x.lineWidth = 1; x.stroke(); } },
  // an impact star: n spikes shooting out
  k13spike(x, p, a) { const e = Math.min(1, p.t / 4), n = p.n || 8, R1 = lerp(p.r0 || 4, p.r1 || 24, e) * (0.7 + 0.3 * a); x.globalAlpha = Math.min(1, a * 1.8);
    const pts = []; for (let i = 0; i < n * 2; i++) { const an = (p.rot || 0) + i * Math.PI / n, r = i % 2 ? R1 * (p.inner || 0.32) : R1 * (i % 4 === 0 ? 1 : 0.72); pts.push([p.x + Math.cos(an) * r, p.y + Math.sin(an) * r]); }
    k13path(x, pts); x.strokeStyle = p.o || OL13; x.lineWidth = 2.5; x.stroke(); x.fillStyle = p.c; x.fill(); x.fillStyle = p.h || '#ffffff'; x.beginPath(); x.arc(p.x, p.y, R1 * 0.22, 0, 7); x.fill(); },
  // a glowing ball with a dark rim and a fading trail
  k13orb(x, p, a) { const H = p.hist || (p.hist = []); H.push([p.x, p.y]); if (H.length > (p.trail || 6)) H.shift(); const r = p.r * (p.pulse ? 1 + 0.12 * Math.sin(p.t * 1.3) : 1);
    x.globalAlpha = Math.min(1, a * 2); H.forEach(([q, w], i) => { const k = (i + 1) / H.length; x.fillStyle = p.c; x.globalAlpha = Math.min(1, a * 2) * k * 0.5; x.beginPath(); x.arc(q, w, r * k * 0.8, 0, 7); x.fill(); });
    x.globalAlpha = Math.min(1, a * 2); x.fillStyle = p.o || OL13; x.beginPath(); x.arc(p.x, p.y, r + 1.5, 0, 7); x.fill(); x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.fill();
    x.fillStyle = p.h || '#ffffff'; x.beginPath(); x.arc(p.x - r * 0.25, p.y - r * 0.25, r * 0.45, 0, 7); x.fill(); },
  // a lock-on reticle: four brackets close in and spin a little
  k13mark(x, p, a) { const e = 1 - Math.pow(1 - Math.min(1, p.t / (p.grow || 8)), 3), R = lerp(p.r0 || 30, p.r1 || 12, e), rot = (p.spin || 0.8) * (1 - e); x.globalAlpha = Math.min(1, a * 2); x.lineCap = 'square';
    for (const [c, w] of [[p.o || OL13, 4], [p.c, 2]]) { x.strokeStyle = c; x.lineWidth = w; for (let i = 0; i < 4; i++) { const an = rot + i * Math.PI / 2 + Math.PI / 4, cx = p.x + Math.cos(an) * R, cy = p.y + Math.sin(an) * R, ux = Math.cos(an + Math.PI * 0.75) * 6, uy = Math.sin(an + Math.PI * 0.75) * 6, vx = Math.cos(an - Math.PI * 0.75) * 6, vy = Math.sin(an - Math.PI * 0.75) * 6;
      x.beginPath(); x.moveTo(cx + ux, cy + uy); x.lineTo(cx, cy); x.lineTo(cx + vx, cy + vy); x.stroke(); } }
    if (p.dot && e > 0.9) { x.fillStyle = p.o || OL13; x.fillRect(p.x - 2, p.y - 2, 5, 5); x.fillStyle = p.c; x.fillRect(p.x - 1, p.y - 1, 3, 3); } },
  // a thick beam from (x1,y1) to (x2,y2): outline, body, white core; flickers
  k13beam(x, p, a) { const g = clamp(p.t / (p.grow || 3), 0, 1), X2 = lerp(p.x1, p.x2, g), Y2 = lerp(p.y1, p.y2, g), w = (p.w || 8) * (0.5 + 0.5 * a) * (p.t % 4 < 2 ? 1 : 0.85); x.globalAlpha = Math.min(1, a * 2); x.lineCap = 'round';
    for (const [c, ww] of [[p.o || OL13, w + 3], [p.c, w], [p.h || '#ffffff', Math.max(1, w * 0.35)]]) { x.strokeStyle = c; x.lineWidth = ww; x.beginPath(); x.moveTo(p.x1, p.y1); x.lineTo(X2, Y2); x.stroke(); } },
  // any outlined polygon (shields, palms, blades, plates) given in local coordinates; it can scale in, spin and move
  k13poly(x, p, a) { const sc = Math.max(0.02, (p.s0 != null ? lerp(p.s0, p.s1 ?? 1, clamp(p.t / (p.grow || 5), 0, 1)) : 1) * (p.sc || 1)); if (p.t < 0) return; x.globalAlpha = Math.min(1, a * (p.fade ? 1.5 : 4)) * (p.al ?? 1); x.translate(p.x, p.y); x.rotate((p.rot || 0) + (p.vr || 0) * p.t); x.scale(sc, sc * (p.sy || 1)); x.lineJoin = 'round';
    for (const s of p.shapes) { k13path(x, s.pts); x.strokeStyle = s.o || p.o || OL13; x.lineWidth = (s.ow || 2.5) / sc; x.stroke(); x.fillStyle = s.c; x.fill(); } },
  // a ghost of the hero (an afterimage)
  k13ghost(x, p, a) { if (!p.img) return; x.globalAlpha = a * (p.al || 0.6); x.imageSmoothingEnabled = false; x.drawImage(p.img, Math.round(p.x), Math.round(p.y), p.w, p.h); },
  // a clock face: ticks, a rim and two hands turning
  k13clock(x, p, a) { const r = p.r * Math.min(1, p.t / 5); x.globalAlpha = Math.min(1, a * 2); x.fillStyle = p.bg || 'rgba(10,30,50,0.55)'; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.fill();
    x.strokeStyle = OL13; x.lineWidth = 4; x.stroke(); x.strokeStyle = p.c; x.lineWidth = 2; x.stroke(); for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; x.fillStyle = i % 3 ? p.c : p.h || '#ffffff'; x.fillRect(Math.round(p.x + Math.cos(an) * r * 0.8) - 1, Math.round(p.y + Math.sin(an) * r * 0.8) - 1, i % 3 ? 2 : 3, i % 3 ? 2 : 3); }
    const h1 = (p.h0 || 0) + p.t * (p.sp || 0.5), h2 = (p.m0 || 0) + p.t * (p.sp || 0.5) * 12;
    for (const [an, L, w] of [[h1, 0.5, 3], [h2, 0.78, 2]]) { x.strokeStyle = OL13; x.lineWidth = w + 2; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(an - Math.PI / 2) * r * L, p.y + Math.sin(an - Math.PI / 2) * r * L); x.stroke(); x.strokeStyle = p.h || '#ffffff'; x.lineWidth = w; x.stroke(); } },
});
// ---------- helpers (b = the battle scene) ----------
const K13 = {
  cut(b, P, ang, len, col, w = 7, life = 14, o = {}) { return b.spawn({ k: 'k13cut', x: P.x, y: P.y, ang, len: len * 1.12, w: w * 1.15, c: col[0], h: col[1], o: col[2], grow: o.grow || 3, bend: o.bend || 0, life: Math.round(life * 1.45) }); }, // lingers: the battle plays at ×2
  arc(b, P, r, a0, a1, col, w = 7, life = 16, o = {}) { return b.spawn({ k: 'k13arc', x: P.x, y: P.y, r, a0, a1, w: w * 1.15, c: col[0], h: col[1], o: col[2], fl: o.fl || 1, grow: o.grow || 5, life: Math.round(life * 1.35) }); },
  ring(b, P, r0, r1, col, w = 3, life = 14, fl = 1) { return b.spawn({ k: 'k13ring', x: P.x, y: P.y, r0, r1, w, c: col[0], h: col[1], o: col[2], fl, life }); },
  spike(b, P, r1, col, n = 8, life = 12, o = {}) { return b.spawn({ k: 'k13spike', x: P.x, y: P.y, r0: o.r0 || 4, r1, n, c: col[0], h: col[1], o: col[2], rot: o.rot ?? Math.random(), inner: o.inner, life }); },
  mark(b, P, col, o = {}) { return b.spawn({ k: 'k13mark', x: P.x, y: P.y, r0: o.r0 || 32, r1: o.r1 || 13, c: col[0], o: col[2], grow: o.grow || 8, spin: o.spin ?? 0.8, dot: o.dot ?? 1, life: o.life || 24 }); },
  beam(b, A, B, col, w = 8, life = 12, grow = 3) { return b.spawn({ k: 'k13beam', x1: A.x, y1: A.y, x2: B.x, y2: B.y, w, c: col[0], h: col[1], o: col[2], grow, life }); },
  poly(b, P, shapes, o = {}) { return b.spawn(Object.assign({ k: 'k13poly', x: P.x, y: P.y, shapes, life: 20 }, o)); },
  // a ball that flies from A to B in n frames (arc: height of the curve); resolves when it lands
  *orb(b, A, B, col, r = 5, n = 10, arc = 0, o = {}) { const p = b.spawn({ k: 'k13orb', x: A.x, y: A.y, r, c: col[0], h: col[1], o: col[2], trail: o.trail || 7, pulse: o.pulse, life: n + 2 });
    p.upd = q => { const t = clamp(q.t / n, 0, 1), e = o.ease ? t * t : t; q.x = lerp(A.x, B.x, e); q.y = lerp(A.y, B.y, e) - Math.sin(Math.PI * t) * arc; }; yield* wait(n); },
  // afterimages of the hero (dx, dy: offset; col: tint)
  ghost(b, dx, dy, col, life = 14, al = 0.55) { const Hv = b.H, hi = Hv && Hv.img; if (!hi) return; const ds = hi.ds || 1, hx0 = b.heroX + HD_HERO_OX, hx = (hi.px ? hx0 + 28 - hi.bb.cx : hx0) + dx, hy = (hi.px ? HERO_FOOT - hi.bb.bot : HERO_Y) + dy;
    let im = hi; if (col) { try { const cv = document.createElement('canvas'); cv.width = hi.width; cv.height = hi.height; const g = cv.getContext('2d'); g.drawImage(hi, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.5; g.fillStyle = col; g.fillRect(0, 0, cv.width, cv.height); cv.px = hi.px; im = cv; } catch (e) { im = hi; } } return b.spawn({ k: 'k13ghost', img: im, x: hx, y: hy, w: hi.width * ds, h: hi.height * ds, al, life }); },
  streaks(b, y0, y1, dir, col, n = 10, life = 12) { for (let i = 0; i < n; i++) b.spawn({ k: 'streak', x: dir > 0 ? rnd(-20, W / 2) : rnd(W / 2, W + 20), y: rnd(y0, y1), vx: dir * (6 + Math.random() * 5), len: rnd(10, 24), c: i % 2 ? col[0] : col[1], life }); },
  motes(b, from, to, col, n = 10, life = 18) { for (let i = 0; i < n; i++) b.spawn({ k: 'mote', x: from.x + rnd(-14, 14), y: from.y + rnd(-14, 14), vy: 0, to: { x: to.x + rnd(-4, 4), y: to.y + rnd(-4, 4) }, s: 3, c: i % 2 ? col[0] : col[1], life: life + rnd(0, 6) }); },
  debris(b, P, n, cols, spd = 2.4, g = 0.16, life = 24, s = [3, 6]) { for (let i = 0; i < n; i++) b.spawn({ k: 'shard', g, x: P.x + rnd(-8, 8), y: P.y + rnd(-6, 6), vx: rnd(-10, 10) / 10 * spd, vy: -rnd(6, 16) / 10 * spd, s: rnd(s[0], s[1]), c: cols[i % cols.length], life }); },
  dark(b, a = 0.45, life = 26, c = '#0a0618') { b.spawn({ k: 'dark', a, c, life }); },
  flash(b, c = '#ffffff', a = 0.4, life = 6) { b.spawn({ k: 'flash', c, a, life }); },
  hit(b, P, col, big = 0) { K13.spike(b, P, big ? 30 : 20, col, big ? 10 : 8, big ? 14 : 11); K13.ring(b, P, 4, big ? 34 : 24, col, big ? 4 : 3, big ? 14 : 11); b.sparks(P.x, P.y, big ? 14 : 8, [col[0], col[1]], big ? 3 : 2.2, 16); b.shake = Math.max(b.shake, big ? 9 : 4); },
  // the target view(s) behind a centre; hp ratio; states
  views(b, t) { return t && t.group ? t.group.slice() : t ? [t] : (b.tgtV ? [b.tgtV] : []); },
  low(t, r = 0.5) { return !!(t && t.maxhp && t.hp / t.maxhp <= r); },
  ward(t) { return !!(t && t.st && t.st.barrier); },
  broken(t) { return !!(t && (t.broken || (t.st && t.st.broken))); },
  defDown(t) { return !!(t && t.st && t.st.stage_def < 0); },
  tint(v, c, a, n) { if (!v) return; v.tint = v._t13o = { c, a }; v._t13 = n; },
};
// tints set with K13.tint wear off by themselves
{ const _up = Battle.prototype.update; Battle.prototype.update = function () { _up.call(this); for (const v of Object.values(this.views || {})) if (v && v._t13 > 0 && --v._t13 === 0) { if (v.tint === v._t13o) v.tint = null; v._t13o = null; } }; } // 2026-10-08: only take off its own tint (a monster's red warning glow set meanwhile was wiped and the battle stopped)
// pixel icons
const ICON13 = {
  eye: spriteFrom(['...kkkkk...', '.kkwwwwwkk.', 'kwwwyyywwwk', 'kwwyykyywwk', 'kwwwyyywwwk', '.kkwwwwwkk.', '...kkkkk...'], { k: '#120c22', w: '#ffffff', y: '#ffc030' }),
  skull: spriteFrom(['.kkkkk.', 'kwwwwwk', 'kwkwkwk', 'kwwwwwk', '.kwkwk.', '.kkkkk.'], { k: '#120c22', w: '#ffe0e0' }),
};

/* ---------- the redone skills play alone: no shared cast glow, no shared finish, no weapon burst, no blade restyle ---------- */
const REDO13 = new Set();
{ const _hc = heroCast; heroCast = function* (u, mv, id, t) { if (REDO13.has(id)) return; yield* _hc.call(this, u, mv, id, t); };
  const _hi = heroImpact; heroImpact = function* (T, mv, r, id, u) { if (REDO13.has(id)) return; yield* _hi.call(this, T, mv, r, id, u); };
  const _hb = heroBless; heroBless = function (u, mv, id) { if (REDO13.has(id)) return; return _hb.call(this, u, mv, id); };
  const H = Battle.prototype.handlers, _su = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { const on = s && s.hero && REDO13.has(P.skill); this.redo13 = on;
    try { return yield* _su.call(this, e, s, t, P); } finally { this.redo13 = false; } };
  if (typeof wThemeBurst === 'function') { const _wb = wThemeBurst; wThemeBurst = function (...a) { if (this && this.redo13) return; return _wb.apply(this, a); }; }
  const _sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { const r = _sp.call(this, p); if (this.redo13) delete r.sl; return r; }; }
// install: FX key gets the new picture (f = main, h = later hits)
function redo13(id, fxKey, F) { const D = DEF.skills[id]; if (!D) { bvErr('v12.32', 'redo ' + id); return; } REDO13.add(id); const S = { col: F.col };
  FX[fxKey] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; yield* F.f.call(this, S, U, T, u, t); };
  if (F.h) { FX[fxKey + 'h13'] = function* (U, T, u, i, t) { this.slashOn = 0; yield* F.h.call(this, S, U, T, u, i, t); }; D.hitFx = fxKey + 'h13'; }
  if (F.alsoIds) for (const x of F.alsoIds) { REDO13.add(x); const D2 = DEF.skills[x]; if (D2) { D2.fx = fxKey; if (F.h) D2.hitFx = fxKey + 'h13'; } }
  D.fx = fxKey; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (MOVES[id]) MOVES[id].fx = fxKey; }
// a special: every tier (and the magic version) of it
function redoSp13(kind, j, F) { const ids = []; for (let t = 1; t <= 7; t++) for (const m of [0, 1]) { const id = spId11(kind, j, t, m); if (DEF.skills[id]) ids.push(id); } if (!ids.length) { bvErr('v12.32', 'sp ' + kind + j); return; }
  redo13(ids[0], spFxId11(kind, j), Object.assign({}, F, { alsoIds: ids.slice(1) })); }
