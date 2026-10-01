/* ===================== BATTLE ===================== */
let HERO_POWER = 1.45, BOSS_HP = 2.1, ELITE_HP = 1.1;
const STATUS_NAME = { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' }; // names of the major ailments (menus, item texts)
const BB_Y = 218, BB_H = H - 218, BH = BB_Y, FOE_X = 56, HERO_X = 0, HERO_Y = 136, HBAR_Y = 205, HERO_FOOT = 200; // compact battle HUD: bigger stage, 2-line messages // facing the foe: foe far (upper right), hero's back near (lower left); panels on the opposite corners
 const battleImgCache = {};
// battle sprites: rendered at a low native size, then scaled 3x (same chunky pixel look as the hero)
const FOE_NATIVE = { golem: 28, mossGiant: 28, crystalGolem: 28, banditBoss: 28, boneKnight: 28, runeGolem: 28 }, FOE_SCALE = 3, FOE_FOOT = 134;
function battleSprite(key) {
  if (battleImgCache[key]) return battleImgCache[key];
  const n = FOE_NATIVE[key] || 24, S = FOE_SCALE, sm = buildShaded(ART[key], n, n / 64);
  const c = mkCanvas(n * S, n * S); c.getContext('2d').drawImage(sm, 0, 0, n * S, n * S);
  const d = sm.getContext('2d').getImageData(0, 0, n, n).data; let x0 = n, x1 = -1, y0 = n, y1 = -1;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  c.bb = { cx: Math.round((x0 + x1 + 1) * S / 2), top: y0 * S, bot: (y1 + 1) * S, w: (x1 - x0 + 1) * S, h: (y1 - y0 + 1) * S };
  return battleImgCache[key] = c;
}
function badgeRow(x, list, X, Y) { for (const b of list) if (b) { statusBadge(x, b, X, Y); X += 18; } }
function makeFoe(sp, lv, kind) {
  const d = SPECIES[sp], P = MON_PANEL[sp], f = (lv + 10) / (P.lv + 10);
  const s = {}; for (const k of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) s[k] = Math.max(1, Math.round(P[k] * f * (kind === 'wild' ? 0.92 + Math.random() * 0.16 : 1)));
  { const rk = d.rare ? 'rare' : kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : 'wild'; const cv = rk === 'rare' ? 0 : 1; s.hp = Math.round(s.hp * BALANCE.hp[rk] * (cv ? lvCurve(lv, 'curveHP') : 1)); for (const k of ['atk', 'spa']) s[k] = Math.round(s[k] * BALANCE.pow[rk] * (cv ? lvCurve(lv, 'curvePow') : 1)); for (const k of ['def', 'spd']) s[k] = Math.round(s[k] * BALANCE.def[rk] * (cv ? lvCurve(lv, 'curveDef') : 1)); }
  s.crit = P.crit ?? 6; s.hit = P.hit || 0; s.eva = P.eva || 0;
  const known = d.learn.filter(([l]) => l <= lv).map(([, m]) => m); const moves = [...new Set(known)].slice(-4).map(id => ({ id }));
  return { sp, n: d.n, fam: d.fam, rare: d.rare, lv, stats: s, hp: s.hp, maxhp: s.hp, status: null, moves, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, wet: 0, trait: d.trait, kind, boss: kind === 'boss', elite: kind === 'elite', sleepT: 0 };
}
function buildBattleBG(kind) {
  const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(kind === 'ruins' ? 9 : 5);
  const poly = (col, pts) => pxPoly(x, pts, col);
  if (kind === 'forest') { // deep misty forest
    ['#27402f', '#2d4a35', '#34553b', '#3c6042', '#456b49', '#4e7650'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 12, W, 12); });
    for (let i = -6; i < W; i += 11) { const w = 5 + Math.floor(r() * 5); x.fillStyle = r() < 0.5 ? '#2a1f18' : '#33261c'; x.fillRect(i, 0, w, 76); x.fillStyle = '#45352a'; x.fillRect(i, 0, 1, 76); }
    for (let i = -8; i < W; i += 9) pxEllipse(x, i + 4, 6 + Math.floor(r() * 10), 9, 7, r() < 0.5 ? '#1f3a26' : '#244430');
    x.fillStyle = 'rgba(210,235,220,0.18)'; x.fillRect(0, 50, W, 26);
    ['#5c8a4c', '#578548', '#528044', '#4d7a40', '#48743c', '#436e38', '#3f6834', '#3b6230', '#375c2e', '#34572c', '#31522a', '#2e4e28'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 72 + i * 11, W, 11); });
    x.fillStyle = '#6a9a58'; for (let y = 76; y < BH; y += 6) for (let i = (y * 13) % 29; i < W; i += 29) x.fillRect(i, y, 5, 1);
    x.fillStyle = '#c8b060'; for (let k = 0; k < 14; k++) x.fillRect(Math.floor(r() * W), 20 + Math.floor(r() * 50), 1, 1);
  } else if (kind === 'ruins') { // torch-lit stone hall
    x.fillStyle = '#2a2434'; x.fillRect(0, 0, W, BH);
    for (let y = 0, row = 0; y < 96; y += 8, row++) for (let i = (row % 2) * 8 - 8; i < W; i += 16) { x.fillStyle = r() < 0.5 ? '#3a3246' : '#40384c'; x.fillRect(i + 1, y + 1, 14, 6); x.fillStyle = '#4a4258'; x.fillRect(i + 1, y + 1, 14, 1); }
    x.fillStyle = '#120e18'; x.fillRect(64, 36, 48, 60); pxEllipse(x, 88, 38, 24, 16, '#120e18'); // archway
    x.fillStyle = '#5a5068'; for (let a = 0; a < Math.PI; a += 0.12) x.fillRect(Math.round(88 + Math.cos(Math.PI + a) * 26), Math.round(38 - Math.sin(a) * 18), 3, 3);
    for (const X of [10, 142]) { x.fillStyle = '#4c4458'; x.fillRect(X, 6, 24, 92); x.fillStyle = '#5e5670'; x.fillRect(X + 2, 6, 5, 92); x.fillStyle = '#3a3246'; x.fillRect(X + 19, 6, 5, 92); x.fillStyle = '#6a6280'; x.fillRect(X - 2, 4, 28, 5); x.fillRect(X - 2, 94, 28, 5);
      x.fillStyle = '#7a2a30'; x.fillRect(X + 6, 16, 12, 30); x.fillStyle = '#9a3a40'; x.fillRect(X + 6, 16, 12, 2); poly('#7a2a30', [[X + 6, 46], [X + 12, 52], [X + 18, 46]]); x.fillStyle = '#d8b050'; x.fillRect(X + 10, 24, 4, 8); x.fillRect(X + 8, 26, 8, 2); }
    for (const X of [44, 132]) { x.fillStyle = '#2e2e36'; x.fillRect(X - 1, 50, 3, 8); x.fillRect(X - 3, 48, 7, 2); const g = x.createRadialGradient(X, 42, 0, X, 42, 20); g.addColorStop(0, 'rgba(255,170,70,0.55)'); g.addColorStop(1, 'rgba(255,170,70,0)'); x.fillStyle = g; x.fillRect(X - 20, 22, 40, 40); x.fillStyle = '#ff9030'; x.fillRect(X - 2, 42, 5, 6); x.fillStyle = '#ffe070'; x.fillRect(X - 1, 43, 3, 4); x.fillStyle = '#fff4c0'; x.fillRect(X, 44, 1, 2); }
    x.fillStyle = '#4a4254'; x.fillRect(0, 96, W, BH - 96); // flagstone floor in perspective
    for (let k = 0, y = 96; y < BH; k++, y += 6 + k * 2) { x.fillStyle = '#3a3444'; x.fillRect(0, y, W, 1); x.fillStyle = '#5a5266'; x.fillRect(0, y + 1, W, 1); }
    x.fillStyle = '#3a3444'; for (let i = -6; i <= 6; i++) pxLine(x, 88 + i * 10, 96, 88 + i * 34, BH, '#3a3444');
    x.fillStyle = '#6aa048'; for (const [a1, b1] of [[18, 150], [150, 128], [70, 184]]) { x.fillRect(a1, b1, 6, 2); x.fillRect(a1 + 2, b1 - 1, 2, 1); }
  } else { // meadow with a distant castle
    ['#86bde8', '#94c6ec', '#a3cfef', '#b3d8f1', '#c3e0f3', '#d3e8f5'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 11, W, 11); });
    x.fillStyle = '#f2f8fc'; for (const [a1, b1, w] of [[10, 12, 30], [98, 22, 40], [150, 8, 22]]) { x.fillRect(a1, b1, w, 4); x.fillRect(a1 + 4, b1 - 2, w - 8, 2); }
    poly('#a9bdd2', [[0, 64], [0, 44], [22, 36], [40, 46], [62, 32], [84, 48], [110, 40], [130, 50], [176, 38], [176, 64]]);
    poly('#8fa9a8', [[104, 66], [118, 56], [148, 52], [176, 56], [176, 66]]);
    // castle on the hill
    const CC = '#6f7f9a', CD = '#5a6884', CR = '#4a5270';
    x.fillStyle = CC; x.fillRect(128, 44, 30, 18); x.fillRect(122, 36, 8, 26); x.fillRect(156, 38, 8, 24); x.fillRect(138, 30, 10, 16);
    for (let i = 128; i < 158; i += 4) x.fillRect(i, 42, 2, 2);
    poly(CR, [[121, 36], [126, 27], [131, 36]]); poly(CR, [[155, 38], [160, 29], [165, 38]]); poly(CR, [[137, 30], [143, 19], [149, 30]]);
    x.fillStyle = '#c84a40'; x.fillRect(143, 15, 1, 5); x.fillRect(144, 15, 4, 2);
    x.fillStyle = CD; x.fillRect(128, 54, 30, 8); x.fillStyle = '#343c56'; x.fillRect(140, 52, 6, 10); x.fillRect(125, 42, 2, 3); x.fillRect(159, 44, 2, 3); x.fillRect(142, 35, 2, 3);
    // forest line
    for (let i = -4; i < W; i += 7) { const h = 8 + Math.floor(r() * 7); pxEllipse(x, i + 4, 66 - h / 2, 5, h / 2 + 2, r() < 0.5 ? '#3f7d4d' : '#467f52'); }
    x.fillStyle = '#3a7448'; x.fillRect(0, 64, W, 6);
    ['#8ccc74', '#86c66e', '#80c06a', '#7aba66', '#74b462', '#6eae5e', '#68a85a', '#62a256', '#5e9c52', '#5a9850', '#56944e', '#52904c'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 70 + i * 11, W, 11); });
    // dirt road narrowing to the horizon
    for (let y = 70; y < BH; y++) { const t = (y - 70) / (BH - 70), hw = 3 + t * 30, cx = 88 + Math.sin(t * 3) * 8 * (1 - t); x.fillStyle = y % 3 ? '#c8a870' : '#bf9e66'; x.fillRect(Math.round(cx - hw), y, Math.round(hw * 2), 1); x.fillStyle = '#a88a58'; x.fillRect(Math.round(cx - hw), y, 1, 1); x.fillRect(Math.round(cx + hw), y, 1, 1); }
    x.fillStyle = '#a8e090'; for (let y = 74; y < BH; y += 6) for (let i = (y * 13) % 29; i < W; i += 29) if (Math.abs(i - 88) > 12 + (y - 70) * 0.3) x.fillRect(i, y, 5, 1);
    // tumbled stone wall on the left
    for (const [X, Y, w] of [[4, 88, 30], [10, 84, 18]]) { x.fillStyle = '#6c665b'; x.fillRect(X, Y, w, 6); for (let i = X; i < X + w; i += 5) { x.fillStyle = '#9a9384'; x.fillRect(i, Y, 4, 2); x.fillStyle = '#b4ad9c'; x.fillRect(i, Y, 4, 1); } }
  }
  const g = x.createLinearGradient(0, 120, 0, BH); g.addColorStop(0, 'rgba(8,10,20,0)'); g.addColorStop(1, 'rgba(8,10,20,0.55)'); x.fillStyle = g; x.fillRect(0, 120, W, BH - 120);
  const g2 = x.createLinearGradient(0, 0, 0, 34); g2.addColorStop(0, 'rgba(8,10,20,0.35)'); g2.addColorStop(1, 'rgba(8,10,20,0)'); x.fillStyle = g2; x.fillRect(0, 0, W, 34);
  return c;
}
function buildShadow(rx, ry) { const c = mkCanvas(rx * 2 + 2, ry * 2 + 2), x = c.getContext('2d'); pxEllipse(x, rx + 1, ry + 1, rx, ry, '#000000'); return c; }


/* ---------------- particles & move effects ---------------- */
const tintCache = new Map();
function tinted(img, col) { const k = col; let m = tintCache.get(img); if (!m) { m = {}; tintCache.set(img, m); } if (m[k]) return m[k]; const c = mkCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); m[k] = c; return c; }
const ROCK_IMG = (() => { const c = buildShaded({ parts: [{ s: 'p', pts: [[4, 20], [14, 6], [34, 4], [58, 16], [60, 44], [44, 60], [16, 58], [2, 40]], c: '#9a8e7a' }] }, 12, 12 / 64); return c; })();
const BIG_ROCK = buildShaded({ parts: [{ s: 'p', pts: [[4, 20], [14, 6], [34, 4], [58, 16], [60, 44], [44, 60], [16, 58], [2, 40]], c: '#8a7e6a' }], details: [{ s: 'line', pts: [[20, 20], [30, 34], [26, 46]], c: '#5a5044' }] }, 40, 40 / 64);
const LEAF_IMG = spriteFrom(['..kk', '.kLk', 'kLlk', 'klk.', 'kk..'], { k: '#1e5a28', L: '#9ae070', l: '#50b048' });
function drawParticle(x, p) {
  if (p.hidden) return; const a = 1 - p.t / p.life;
  switch (p.k) {
    case 'dot': x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); break;
    case 'star': { const r = 3 + p.t * 1.2; x.fillStyle = p.c; x.globalAlpha = a; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; x.fillRect(Math.round(p.x + Math.cos(an) * r), Math.round(p.y + Math.sin(an) * r), 2, 2); } x.fillRect(p.x - 2, p.y - 2, 4, 4); x.globalAlpha = 1; break; }
    case 'line': { const g = clamp(p.t / (p.grow || 1), 0, 1); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = p.w || 2; x.beginPath(); x.moveTo(p.x1, p.y1); x.lineTo(lerp(p.x1, p.x2, g), lerp(p.y1, p.y2, g)); x.stroke(); x.globalAlpha = 1; break; }
    case 'bolt': { x.strokeStyle = p.t % 4 < 2 ? '#fff8a0' : '#f8d030'; x.lineWidth = p.w || 3; x.beginPath(); p.pts.forEach(([a1, b1], i) => i ? x.lineTo(a1, b1) : x.moveTo(a1, b1)); x.stroke(); x.strokeStyle = '#ffffff'; x.lineWidth = 1; x.stroke(); break; }
    case 'ring': { const r = lerp(p.r0, p.r1, p.t / p.life); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = p.w || 2; x.beginPath(); x.ellipse(p.x, p.y, r, r * (p.fl || 1), 0, 0, Math.PI * 2); x.stroke(); x.globalAlpha = 1; break; }
    case 'circ': x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); if (p.hl) { x.fillStyle = p.hl; x.fillRect(Math.round(p.x - p.r / 2), Math.round(p.y - p.r / 2), 1, 1); } break;
    case 'bub': x.strokeStyle = p.c; x.lineWidth = 1; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.stroke(); x.fillStyle = '#ffffff'; x.fillRect(Math.round(p.x - p.r / 2), Math.round(p.y - p.r / 2), 1, 1); break;
    case 'img': x.globalAlpha = p.fade ? a : 1; x.drawImage(p.img, Math.round(p.x - p.img.width / 2), Math.round(p.y - p.img.height / 2)); x.globalAlpha = 1; break;
    case 'txt': x.globalAlpha = p.fade ? a : 1; Font.draw(x, p.s, p.x, p.y, p.c, p.sh || null); x.globalAlpha = 1; break;
    case 'flame': { const s = p.s * a + 1; x.fillStyle = a > 0.6 ? '#fff0a0' : a > 0.3 ? '#f8a030' : '#e05020'; x.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s), Math.ceil(s), Math.ceil(s * 1.5)); break; }
    case 'arc': { x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, p.a0 + p.t * 0.25, p.a0 + p.t * 0.25 + 2.2); x.stroke(); x.globalAlpha = 1; break; }
    case 'cres': { x.save(); x.translate(p.x, p.y); x.rotate(p.ang || 0); x.globalAlpha = Math.min(1, a * 2); x.lineCap = 'round'; x.strokeStyle = p.c2; x.lineWidth = p.w || 6; x.beginPath(); x.arc(0, 0, p.r, -1.15, 1.15); x.stroke(); x.strokeStyle = p.c; x.lineWidth = Math.max(1, (p.w || 6) / 3); x.beginPath(); x.arc(0, 0, p.r - 1, -1.0, 1.0); x.stroke(); x.restore(); x.globalAlpha = 1; break; }
    case 'glow': { const r = p.r * (0.6 + 0.4 * a); const gr = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); const [cr, cg, cb] = hex2rgb(p.c); gr.addColorStop(0, `rgba(${cr},${cg},${cb},0.85)`); gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`); x.globalAlpha = a; x.fillStyle = gr; x.fillRect(p.x - r, p.y - r, r * 2, r * 2); x.globalAlpha = 1; break; }
    case 'beam': { x.globalAlpha = a * 0.85; const g = x.createLinearGradient(p.x - p.w, 0, p.x + p.w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, p.c); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(p.x - p.w, p.y1 - p.h, p.w * 2, p.h); x.globalAlpha = 1; break; }
    case 'hex': { const r = lerp(p.r0, p.r1, p.t / p.life); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); for (let i = 0; i <= 6; i++) { const an = i * Math.PI / 3 + Math.PI / 6, px = p.x + Math.cos(an) * r, py = p.y + Math.sin(an) * r * 0.9; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); x.globalAlpha = 1; break; }
    default: { const f = MON_PK[p.k]; if (f) { x.save(); f(x, p, a); x.restore(); } break; }
    case 'flash': x.globalAlpha = a * (p.a || 0.6); x.fillStyle = p.c; x.fillRect(0, 0, W, BH); x.globalAlpha = 1; break;
  }
}
const FX = {
  *hit(U, T, u) { yield* this.lunge(u); this.star(T.x, T.y, '#ffffff'); this.sparks(T.x, T.y, 6, ['#ffffff', '#f8e070']); yield* wait(10); },
  *slash(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); for (let i = 0; i < 2; i++) { const o = i * 10 - 5; this.spawn({ k: 'line', x1: T.x - 20 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#a8d8ff', w: 5, grow: 3, life: 12 }); this.spawn({ k: 'line', x1: T.x - 20 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#ffffff', w: 2, grow: 3, life: 14 }); yield* wait(4); } this.star(T.x, T.y); yield* wait(6); },
  *fireSlash(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); for (let i = 0; i < 2; i++) { const o = i * 10 - 5; this.spawn({ k: 'line', x1: T.x - 18 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#f86020', w: 6, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x - 18 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#fff0a0', w: 2, grow: 3, life: 16 }); yield* wait(4); } Sound.sfx('fire'); this.spawn({ k: 'glow', x: T.x, y: T.y + 4, r: 34, c: '#f86020', life: 22 }); for (let i = 0; i < 26; i++) this.spawn({ k: 'flame', x: T.x + rnd(-20, 20), y: T.y + rnd(-6, 22), vy: -0.6 - Math.random() * 1.2, s: rnd(3, 7), life: 24 + rnd(0, 12) }); yield* wait(20); },
  *scratch(U, T, u) { yield* this.lunge(u, 6, 3); Sound.sfx('slash'); for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: T.x + 10 - i * 7, y1: T.y - 14, x2: T.x - 4 - i * 7, y2: T.y + 12, c: '#ffffff', w: 1, grow: 5, life: 14 }); yield* wait(14); },
  *bite(U, T) { const top = this.spawn({ k: 'txt', s: '▼▼▼', x: T.x - 18, y: T.y - 30, c: '#ffffff', sh: '#404040', life: 20 }); const bot = this.spawn({ k: 'txt', s: '▲▲▲', x: T.x - 18, y: T.y + 14, c: '#ffffff', sh: '#404040', life: 20 }); top.upd = p => { p.y = T.y - 30 + Math.min(p.t, 8) * 2; }; bot.upd = p => { p.y = T.y + 14 - Math.min(p.t, 8) * 2; }; yield* wait(9); Sound.sfx('hit'); this.star(T.x, T.y); yield* wait(10); },
  *quick(U, T, u) { const o = u.hero ? this.offH : this.offF; const dx = (T.x - U.x) * 0.6, dy = (T.y - U.y) * 0.6; for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x - 10, y1: U.y + i * 8 - 8, x2: U.x + 20, y2: U.y + i * 8 - 8, c: '#ffffff', w: 1, grow: 2, life: 8 }); yield* tween(5, t => { o.x = dx * t; o.y = dy * t; }); this.star(T.x, T.y); this.sparks(T.x, T.y, 6, ['#ffffff']); yield* tween(8, t => { o.x = dx * (1 - t); o.y = dy * (1 - t); }); o.x = o.y = 0; yield* wait(6); },
  *glare(U, T, u, t) { for (let i = 0; i < 2; i++) { this.spawn({ k: 'line', x1: U.x, y1: U.y - 10, x2: T.x, y2: T.y, c: '#f05050', w: 1, grow: 6, life: 14 }); yield* wait(4); } yield* this.shakeB(t, 14, 3); },
  *sound(U, T, u, t) { Sound.sfx('buzz'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: lerp(U.x, T.x, 0.3 + i * 0.25), y: lerp(U.y, T.y, 0.3 + i * 0.25), r0: 3, r1: 14, c: '#f8f8ff', life: 16 }); yield* wait(5); } yield* this.shakeB(t, 10, 2); },
  *buff(U) { Sound.sfx('statUp'); yield* FX.statUpFx.call(this, U); },
  *statUpFx(U) { for (let i = 0; i < 14; i++) this.spawn({ k: 'txt', s: '↑', x: U.x + rnd(-24, 20), y: U.y + rnd(0, 26), vy: -1.2, c: '#f86060', sh: '#ffffff', life: 24 + rnd(0, 8), fade: 1 }); yield* wait(26); },
  *statDownFx(U) { for (let i = 0; i < 14; i++) this.spawn({ k: 'txt', s: '↓', x: U.x + rnd(-24, 20), y: U.y + rnd(-26, 0), vy: 1.2, c: '#5878f0', sh: '#ffffff', life: 24 + rnd(0, 8), fade: 1 }); yield* wait(26); },
  *water(U, T) { yield* FX.crescent.call(this, U, T, '#e8f8ff', '#3c90f0', ['#88c8ff', '#ffffff', '#58a8f8'], 'water'); this.spawn({ k: 'ring', x: T.x, y: T.y + 6, r0: 6, r1: 34, c: '#a8e0ff', w: 3, life: 16, fl: 0.5 }); this.sparks(T.x, T.y, 20, ['#88c8ff', '#ffffff', '#58a8f8'], 3, 24, 0.18); yield* wait(10); },
  *crescent(U, T, c, c2, trail, sfx) {
    Sound.sfx(sfx); const ang = Math.atan2(T.y - U.y, T.x - U.x); const fr = 14;
    const p = this.spawn({ k: 'cres', x: U.x, y: U.y, r: 12, ang, c, c2, w: 7, life: fr + 2 });
    for (let i = 0; i <= fr; i++) { const t = i / fr; p.x = lerp(U.x, T.x, t); p.y = lerp(U.y, T.y, t) - Math.sin(t * Math.PI) * 10; p.r = 10 + t * 8; if (i % 2 === 0) this.spawn({ k: 'dot', x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), vx: -Math.cos(ang) * 0.5, vy: 0.4, c: pick(trail), s: 2, life: 14 }); yield; }
    this.spawn({ k: 'glow', x: T.x, y: T.y, r: 30, c: c2, life: 12 });
  },
  *bubble(U, T) { Sound.sfx('water'); this.projectile(U, T, 7, () => ({ k: 'bub', r: rnd(2, 4), c: '#a8e0ff', wob: 4 }), 4, 26); yield* wait(46); this.sparks(T.x, T.y, 8, ['#a8e0ff', '#ffffff'], 1.6); yield* wait(8); },
  *thunder(U, T) { Sound.sfx('thunder'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 40, c: '#fff8a0', life: 24 }); for (let k = 0; k < 3; k++) { const pts = []; let px0 = T.x + rnd(-6, 6); for (let y = -4; y < T.y; y += 8) { pts.push([px0, y]); px0 += rnd(-7, 7); } pts.push([T.x, T.y]); this.spawn({ k: 'bolt', pts, life: 16 }); this.spawn({ k: 'flash', c: '#fff8a0', a: 0.5, life: 8 }); this.shake = 10; yield* wait(8); } this.sparks(T.x, T.y, 12, ['#fff8a0', '#f8d030'], 2.5); yield* wait(12); },
  *spark(U, T) { Sound.sfx('buzz'); for (let i = 0; i < 6; i++) { const x0 = T.x + rnd(-20, 20), y0 = T.y + rnd(-20, 16); this.spawn({ k: 'bolt', pts: [[x0, y0], [x0 + rnd(-5, 5), y0 + 4], [x0 + rnd(-5, 5), y0 + 8], [x0 + rnd(-4, 4), y0 + 12]], life: 10 }); yield* wait(3); } yield* wait(8); },
  *ember(U, T) { Sound.sfx('fire'); this.projectile(U, T, 4, () => ({ k: 'flame', s: 6, arc: 8 }), 4, 16); yield* wait(28); for (let i = 0; i < 12; i++) this.spawn({ k: 'flame', x: T.x + rnd(-14, 14), y: T.y + rnd(-4, 16), vy: -0.8, s: rnd(3, 6), life: 22 }); yield* wait(18); },
  *leaf(U, T) { this.projectile(U, T, 8, () => ({ k: 'img', img: LEAF_IMG, wob: 8, arc: 14 }), 2, 16); yield* FX.crescent.call(this, U, T, '#f0ffd8', '#48b040', ['#9ae070', '#50b048'], 'leaf'); yield* wait(6); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x - 16, y1: T.y - 14, x2: T.x + 16, y2: T.y + 14, c: '#c8f8a0', w: 3, grow: 3, life: 12 }); this.sparks(T.x, T.y, 8, ['#9ae070', '#50b048'], 2); yield* wait(12); },
  *drain(U, T) { Sound.sfx('leaf'); this.sparks(T.x, T.y, 10, ['#9ae070', '#d8f8a0'], 1.5, 16); yield* wait(14); },
  *drainBack(T, U) { this.projectile(T, U, 8, () => ({ k: 'circ', r: 2, c: '#a8f080', hl: '#ffffff', wob: 5 }), 3, 20); Sound.sfx('heal'); yield* wait(40); },
  *powder(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 26; i++) this.spawn({ k: 'dot', x: T.x + rnd(-22, 22), y: T.y - 34 + rnd(-10, 6), vx: Math.random() * 0.4 - 0.2, vy: 0.9 + Math.random() * 0.5, c: pick(['#c060d0', '#e090f0', '#9030a0']), s: 2, life: 40 }); yield* wait(40); },
  *powderS(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 26; i++) this.spawn({ k: 'dot', x: T.x + rnd(-22, 22), y: T.y - 34 + rnd(-10, 6), vx: Math.random() * 0.4 - 0.2, vy: 0.9 + Math.random() * 0.5, c: pick(['#a0d0ff', '#e0f0ff', '#70a0f0']), s: 2, life: 40 }); yield* wait(40); },
  *vine(U, T) { Sound.sfx('slash'); for (let i = 0; i < 2; i++) { this.spawn({ k: 'line', x1: U.x, y1: U.y, x2: T.x + (i ? 10 : -10), y2: T.y + (i ? -8 : 8), c: '#48a040', w: 3, grow: 5, life: 16 }); yield* wait(5); } this.star(T.x, T.y); Sound.sfx('hit'); yield* wait(10); },
  *wind(U, T) { Sound.sfx('wind'); for (let i = 0; i < 6; i++) { this.spawn({ k: 'arc', x: T.x + rnd(-10, 10), y: T.y + rnd(-14, 14), r: rnd(10, 18), a0: Math.random() * 6, c: '#ffffff', life: 20 }); yield* wait(3); } yield* wait(14); },
  *sting(U, T) { Sound.sfx('slash'); this.projectile(U, T, 2, () => ({ k: 'circ', r: 1.5, c: '#c060d0', hl: '#ffffff' }), 5, 12); yield* wait(20); this.star(T.x, T.y, '#e0a0f0'); yield* wait(8); },
  *acid(U, T) { Sound.sfx('poison'); this.projectile(U, T, 5, () => ({ k: 'circ', r: 3, c: '#a048a8', hl: '#e090f0', arc: 20 }), 4, 18); yield* wait(36); this.sparks(T.x, T.y, 10, ['#a048a8', '#e090f0'], 1.8, 20, 0.1); yield* wait(10); },
  *sing(U, T) { Sound.sfx('heal'); this.projectile(U, T, 5, () => ({ k: 'txt', s: '♪', c: '#f080b0', sh: '#ffffff', wob: 6, arc: 10 }), 6, 30); yield* wait(56); },
  *rock(U, T) { for (let i = 0; i < 3; i++) { const x0 = T.x + rnd(-16, 16); const p = this.spawn({ k: 'img', img: ROCK_IMG, x: x0, y: -10, vy: 5, life: 14 }); p.upd = q => { q.y = Math.min(T.y + rnd(-4, 8), q.y + 5); }; yield* wait(8); Sound.sfx('rock'); this.shake = 6; this.sparks(x0, T.y + 6, 5, ['#9a8e7a', '#c8bca4'], 1.8, 14, 0.15); } yield* wait(12); },
  *stomp(U, T, u, t) { yield* this.lunge(u, 14, 5); if (!t.hero) { yield* tween(4, q => this.squishF = q * 6); yield* tween(6, q => this.squishF = 6 * (1 - q)); } this.shake = 14; this.star(T.x, T.y + 10); yield* wait(10); },
  *roar(U, T, u, t) { Sound.sfx('quake'); for (let i = 0; i < 4; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 70, c: '#e0c080', w: 2, life: 24, fl: 0.6 }); this.shake = 8; yield* wait(6); } yield* this.shakeB(t, 12, 3); },
  *bigRock(U, T, u) { yield* this.lunge(u, 18, 8); const p = this.spawn({ k: 'img', img: BIG_ROCK, x: T.x, y: -30, life: 18 }); p.upd = q => { q.y = Math.min(T.y, -30 + q.t * 9); }; yield* wait(10); Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ffffff', a: 0.9, life: 10 }); this.shake = 28; this.sparks(T.x, T.y, 20, ['#9a8e7a', '#c8bca4', '#ff8040'], 3, 24, 0.15); yield* wait(14); },
  *heal(U) { Sound.sfx('heal'); for (let i = 0; i < 18; i++) this.spawn({ k: 'txt', s: pick(['+', '·']), x: U.x + rnd(-24, 20), y: U.y + rnd(-4, 26), vy: -0.8, c: '#70e070', sh: '#ffffff', life: 30, fade: 1 }); yield* wait(28); },
  *guard(U) { Sound.sfx('statUp'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 8, r1: 30, c: '#a0d0ff', w: 2, life: 16 }); yield* wait(5); } yield* wait(8); },
  *charge(U) { Sound.sfx('charge'); for (let i = 0; i < 30; i++) { const a = Math.random() * 7, r = 36; const p = this.spawn({ k: 'dot', x: U.x + Math.cos(a) * r, y: U.y + Math.sin(a) * r, c: pick(['#ffd040', '#ff8040', '#fff0a0']), s: 2, life: 18 }); p.upd = q => { q.x = lerp(q.x, U.x, 0.12); q.y = lerp(q.y, U.y, 0.12); }; if (i % 2) yield; } this.tintF = { c: '#ffb040', a: 0.5 }; yield* wait(10); this.tintF = null; },
  *zzz(U, T) { const P = T || U; for (let i = 0; i < 3; i++) { this.spawn({ k: 'txt', s: 'Z', x: P.x + 8 + i * 5, y: P.y - 10 - i * 6, vy: -0.4, c: '#a0c0ff', sh: '#304060', life: 30, fade: 1 }); yield* wait(8); } yield* wait(14); },
  *psnFx(U, T) { const P = T || U; Sound.sfx('poison'); for (let i = 0; i < 10; i++) this.spawn({ k: 'bub', x: P.x + rnd(-18, 18), y: P.y + rnd(0, 20), vy: -0.8, r: rnd(2, 3), c: '#c060d0', life: 26 }); if (this.tintF !== undefined) { } yield* wait(24); },
  *burnFx(U, T) { const P = T || U; Sound.sfx('fire'); for (let i = 0; i < 12; i++) this.spawn({ k: 'flame', x: P.x + rnd(-16, 16), y: P.y + rnd(0, 20), vy: -0.7, s: rnd(3, 5), life: 22 }); yield* wait(22); },
  *armorBreak(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x, y1: T.y - 28, x2: T.x, y2: T.y + 22, c: '#c8d0e0', w: 7, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x, y1: T.y - 28, x2: T.x, y2: T.y + 22, c: '#ffffff', w: 2, grow: 3, life: 16 }); yield* wait(5); Sound.sfx('rock'); for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: T.x + rnd(-12, 12), y: T.y + rnd(-10, 6), vx: rnd(-20, 20) / 10, vy: -1.5 - Math.random(), g: 0.25, c: pick(['#9aa4b8', '#6a7488', '#d8dce8']), s: rnd(2, 3), life: 26 }); yield* wait(14); },
  *powerSlash(U, T, u) { this.spawn({ k: 'glow', x: U.x, y: U.y, r: 26, c: '#ffb040', life: 16 }); Sound.sfx('charge'); yield* wait(10); yield* this.lunge(u, 12, 3); Sound.sfx('slash'); for (const d of [1, -1]) { this.spawn({ k: 'line', x1: T.x - 20 * d, y1: T.y - 20, x2: T.x + 20 * d, y2: T.y + 20, c: '#ff9a30', w: 6, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x - 20 * d, y1: T.y - 20, x2: T.x + 20 * d, y2: T.y + 20, c: '#fff4c0', w: 2, grow: 3, life: 16 }); yield* wait(4); } this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30, c: '#ffc060', w: 2, life: 12 }); yield* wait(8); },
  *bladeStorm(U, T) { Sound.sfx('wind'); for (let i = 0; i < 8; i++) { const an = Math.random() * Math.PI, r = 24; this.spawn({ k: 'line', x1: T.x - Math.cos(an) * r, y1: T.y - Math.sin(an) * r, x2: T.x + Math.cos(an) * r, y2: T.y + Math.sin(an) * r, c: i % 2 ? '#ffffff' : '#a8e0ff', w: 2, grow: 2, life: 10 }); if (i % 2 === 0) Sound.sfx('slash'); yield* wait(3); } for (let i = 0; i < 4; i++) this.spawn({ k: 'arc', x: T.x, y: T.y, r: 18 + i * 4, a0: i * 1.5, c: '#e0f4ff', life: 16 }); yield* wait(12); },
  *reckless(U, T, u) { this.tintH = { c: '#ff3020', a: 0.5 }; yield* wait(8); this.tintH = null; yield* this.lunge(u, 16, 3); Sound.sfx('slash'); this.spawn({ k: 'flash', c: '#c01010', a: 0.35, life: 8 }); this.spawn({ k: 'line', x1: T.x - 26, y1: T.y + 20, x2: T.x + 26, y2: T.y - 22, c: '#e02020', w: 8, grow: 2, life: 16 }); this.spawn({ k: 'line', x1: T.x - 26, y1: T.y + 20, x2: T.x + 26, y2: T.y - 22, c: '#ffd0d0', w: 2, grow: 2, life: 18 }); this.shake = 12; yield* wait(14); },
  *inferno(U, T) { Sound.sfx('fire'); this.spawn({ k: 'flash', c: '#ff6010', a: 0.3, life: 10 }); for (let k = 0; k < 4; k++) { const x0 = T.x + (k - 1.5) * 14; this.spawn({ k: 'beam', x: x0, w: 6, y1: T.y + 26, h: 60, c: '#ff7a20', life: 22 }); for (let i = 0; i < 8; i++) this.spawn({ k: 'flame', x: x0 + rnd(-4, 4), y: T.y + 24 - rnd(0, 30), vy: -1.2 - Math.random(), s: rnd(3, 7), life: 20 + rnd(0, 10) }); yield* wait(5); } yield* wait(16); },
  *dawnBreak(U, T, u) { this.spawn({ k: 'beam', x: U.x, w: 10, y1: U.y + 20, h: 200, c: '#ffe070', life: 20 }); Sound.sfx('charge'); yield* wait(14); yield* this.lunge(u, 14, 3); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 22, ang: -0.6, c: '#fffbe0', c2: '#ffc030', w: 9, life: 16 }); this.spawn({ k: 'flash', c: '#fff4c0', a: 0.8, life: 10 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 44, c: '#ffe070', w: 3, life: 16 }); this.sparks(T.x, T.y, 18, ['#fff4c0', '#ffd040'], 3, 22); yield* wait(16); },
  *thunderstorm(U, T) { Sound.sfx('thunder'); this.spawn({ k: 'flash', c: '#101830', a: 0.5, life: 40 }); for (let i = 0; i < 30; i++) this.spawn({ k: 'dot', x: rnd(0, W), y: rnd(-20, 60), vx: -0.6, vy: 5, c: '#8ab0ff', s: 1, life: 30 }); for (let k = 0; k < 5; k++) { const pts = []; let px0 = T.x + rnd(-40, 40); for (let y = -4; y < T.y; y += 8) { pts.push([px0, y]); px0 += rnd(-7, 7); } pts.push([T.x + rnd(-8, 8), T.y]); this.spawn({ k: 'bolt', pts, life: 12 }); this.shake = 8; yield* wait(6); } this.sparks(T.x, T.y, 14, ['#fff8a0', '#a0c0ff'], 3); yield* wait(12); },
  *manaBurst(U, T) { Sound.sfx('charge'); this.projectile(U, T, 1, () => ({ k: 'circ', r: 4, c: '#a070ff', hl: '#ffffff' }), 0, 14); yield* wait(15); Sound.sfx('hitSuper'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 26 + i * 8, c: ['#e0c8ff', '#a070ff', '#6a40d0'][i], w: 2, life: 16 }); yield* wait(3); } this.sparks(T.x, T.y, 10, ['#c0a0ff', '#ffffff'], 2.5); yield* wait(10); },
  *guardStrike(U, T, u) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 12, r1: 18, c: '#80b8ff', life: 10 }); yield* wait(6); yield* this.lunge(u, 16, 4); Sound.sfx('hit'); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 26, c: '#a8d0ff', life: 12 }); this.star(T.x, T.y, '#c8e0ff'); yield* wait(10); },
  *holyLight(U) { Sound.sfx('heal'); this.spawn({ k: 'beam', x: U.x, w: 14, y1: U.y + 26, h: 200, c: '#fff0a0', life: 30 }); for (let i = 0; i < 16; i++) this.spawn({ k: 'dot', x: U.x + rnd(-14, 14), y: U.y + rnd(-20, 20), vy: -0.6, c: pick(['#fff4c0', '#ffffff', '#ffe070']), s: 2, life: 26 }); yield* wait(30); },
  *blaze(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash'); for (let i = 0; i < 3; i++) { const o = (i - 1) * 9; this.spawn({ k: 'line', x1: T.x - 20 + o, y1: T.y - 18, x2: T.x + 16 + o, y2: T.y + 18, c: '#ff4010', w: 5, grow: 2, life: 12 }); yield* wait(3); } Sound.sfx('fire'); this.spawn({ k: 'ring', x: T.x, y: T.y + 10, r0: 6, r1: 34, c: '#ff8030', w: 3, life: 18, fl: 0.45 }); for (let i = 0; i < 30; i++) { const an = i / 30 * Math.PI * 2; this.spawn({ k: 'flame', x: T.x + Math.cos(an) * 24, y: T.y + 10 + Math.sin(an) * 10, vy: -0.8, s: rnd(3, 6), life: 22 }); } yield* wait(20); },
  *barrier(U) { Sound.sfx('statUp'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 34 - i * 4, r1: 30 - i * 4, c: ['#a0d0ff', '#80b0ff', '#c8e8ff'][i], life: 28 - i * 4 }); yield* wait(4); } yield* wait(14); },
  *gale(U, T, u) { for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x, y1: U.y - 6 + i * 6, x2: T.x, y2: T.y - 6 + i * 6, c: '#e8f4ff', w: 1, grow: 3, life: 8 }); yield* this.lunge(u, 20, 3); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x - 18, y1: T.y + 10, x2: T.x + 18, y2: T.y - 10, c: '#ffffff', w: 3, grow: 1, life: 8 }); this.spawn({ k: 'arc', x: T.x, y: T.y, r: 16, a0: 0, c: '#c8e8ff', life: 12 }); yield* wait(10); },
  *peck(U, T, u) { yield* this.lunge(u, 6, 2); for (let i = 0; i < 3; i++) { Sound.sfx('hit'); this.spawn({ k: 'line', x1: T.x + rnd(-8, 8), y1: T.y - 14, x2: T.x + rnd(-4, 4), y2: T.y + 2, c: '#f8e070', w: 2, grow: 2, life: 8 }); this.star(T.x + rnd(-6, 6), T.y + rnd(-6, 6), '#ffffff', 8); yield* wait(4); } yield* wait(6); },
  *lick(U, T) { Sound.sfx('water'); for (let i = 0; i < 3; i++) this.spawn({ k: 'arc', x: T.x, y: T.y, r: 10 + i * 5, a0: 2 + i, c: '#f090c0', life: 16 }); yield* wait(16); },
  *tailWhip(U, T, u, t) { for (let i = 0; i < 3; i++) { this.spawn({ k: 'arc', x: U.x, y: U.y, r: 14, a0: i * 2, c: '#ffe0a0', life: 12 }); yield* wait(4); } yield* this.shakeB(t, 10, 2); },
  *waterGun(U, T) { Sound.sfx('water'); this.projectile(U, T, 10, () => ({ k: 'circ', r: 2, c: '#58a8f8', hl: '#ffffff' }), 1, 12); yield* wait(24); this.sparks(T.x, T.y, 10, ['#88c8ff', '#ffffff'], 2, 16, 0.15); yield* wait(8); },
  *rockSlide(U, T) { for (let i = 0; i < 6; i++) { const x0 = T.x + rnd(-28, 28); const p = this.spawn({ k: 'img', img: ROCK_IMG, x: x0, y: -10, life: 16 }); p.upd = q => { q.y = Math.min(T.y + 10, q.y + 7); }; yield* wait(4); Sound.sfx('rock'); this.shake = 6; for (let k = 0; k < 3; k++) this.spawn({ k: 'circ', x: x0 + rnd(-6, 6), y: T.y + 14, r: rnd(3, 6), c: '#b8ac98', vy: -0.3, life: 20 }); } yield* wait(14); },
  *megaDrain(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2; const p = this.spawn({ k: 'dot', x: T.x + Math.cos(an) * 30, y: T.y + Math.sin(an) * 30, c: pick(['#9ae070', '#d8f8a0']), s: 2, life: 22 }); p.upd = q => { q.x = lerp(q.x, T.x, 0.12); q.y = lerp(q.y, T.y, 0.12); }; } this.spawn({ k: 'glow', x: T.x, y: T.y, r: 26, c: '#60c040', life: 20 }); yield* wait(22); },
  *thunderWave(U, T) { Sound.sfx('buzz'); for (let i = 0; i < 4; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30, c: '#f8e060', w: 1, life: 14 }); yield* wait(4); } yield* wait(8); },
  *focus(U) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c: '#ffd060', life: 24 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: U.x + rnd(-16, 16), y: U.y + 20, vy: -1.2, c: '#ffe080', s: 2, life: 22 }); yield* wait(20); },
  *harden(U) { Sound.sfx('statUp'); for (let i = 0; i < 8; i++) this.spawn({ k: 'dot', x: U.x + rnd(-18, 18), y: U.y + rnd(-18, 18), c: '#c8c8d8', s: 3, life: 18 }); this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 22, r1: 22, c: '#b0b0c8', life: 16 }); yield* wait(18); },
  *ironWall(U) { Sound.sfx('quake'); this.shake = 8; for (let i = 0; i < 3; i++) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 40, r1: 30 - i * 3, c: ['#a08868', '#c8b090', '#806a50'][i], life: 22 }); yield* wait(5); } yield* wait(12); },
  *howl(U) { Sound.sfx('buzz'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y - 10, r0: 4, r1: 28, c: '#ff8060', w: 2, life: 14 }); yield* wait(5); } yield* wait(8); },
  *agility(U) { Sound.sfx('wind'); for (let i = 0; i < 10; i++) { const yy = U.y + rnd(-20, 20); this.spawn({ k: 'line', x1: U.x - 30, y1: yy, x2: U.x + 30, y2: yy, c: '#e8f0ff', w: 1, grow: 3, life: 10 }); } yield* wait(12); },
  *prismRay(U, T) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 22, c: '#c8f4ff', life: 14 }); yield* wait(10); Sound.sfx('thunder'); const cols = ['#ff7070', '#ffd060', '#80f080', '#70c0ff', '#c080ff']; cols.forEach((c, i) => this.spawn({ k: 'line', x1: U.x, y1: U.y, x2: T.x + (i - 2) * 4, y2: T.y, c, w: 2, grow: 3, life: 16 })); this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 8 }); yield* wait(6); this.sparks(T.x, T.y, 14, cols, 2.5); yield* wait(12); },
  *smoke() { Sound.sfx('wind'); for (let i = 0; i < 30; i++) this.spawn({ k: 'circ', x: rnd(10, W - 10), y: rnd(20, BH - 20), r: rnd(6, 14), c: pick(['#d8d8d8', '#b8b8c0', '#f0f0f0']), life: 30 + rnd(0, 20), vy: -0.3 }); yield* wait(40); },
};
