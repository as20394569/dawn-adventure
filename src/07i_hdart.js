/* ===================== HD BATTLE ART: 2x-resolution sprites + vector part animation (battle only) =====================
   Monsters are re-rendered from their own vector designs (ART) at twice the resolution. Every animation frame is made
   by transforming the design's parts (head, wings, arms, tail…) BEFORE rasterising, so each frame is clean pixel art,
   the facing never changes and the foot anchor stays put. The field (overworld) sprites are untouched.
   Setting: Game.settings.hdArt (default on) — off = the original battle sprites, exactly as before. */
if (Game.settings.hdArt === undefined) Game.settings.hdArt = true;
const hdOn = () => Game.settings.hdArt !== false;
/* ---------- 2D affine helpers (64-space) ---------- */
const M_ID = [1, 0, 0, 1, 0, 0]; // x' = a x + c y + e, y' = b x + d y + f
const mMul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
const mPt = (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
// transform about a pivot: translate(p + d) · rotate(r) · scale(sx, sy) · translate(-p)
function mAbout(px, py, o) {
  if (!o) return M_ID; const r = o.rot || 0, sx = o.sx ?? 1, sy = o.sy ?? 1, c = Math.cos(r), s = Math.sin(r);
  const A = [c * sx, s * sx, -s * sy, c * sy, 0, 0]; const [tx, ty] = mPt(A, -px, -py);
  return [A[0], A[1], A[2], A[3], tx + px + (o.dx || 0), ty + py + (o.dy || 0)];
}
function xfShape(p, M, warp) {
  const q = { ...p };
  if (p.u) { q.u = p.u.map(s => xfShape(s, M, warp)); return q; }
  if (p.s === 'e') {
    const [cx, cy] = mPt(M, p.x, p.y), th = p.rot || 0, ry = p.ry || p.rx;
    const ux = Math.cos(th) * p.rx, uy = Math.sin(th) * p.rx, vx = -Math.sin(th) * ry, vy = Math.cos(th) * ry;
    const Ux = M[0] * ux + M[2] * uy, Uy = M[1] * ux + M[3] * uy, Vx = M[0] * vx + M[2] * vy, Vy = M[1] * vx + M[3] * vy;
    q.x = cx; q.y = cy; q.rx = Math.hypot(Ux, Uy); q.ry = Math.hypot(Vx, Vy); q.rot = Math.atan2(Uy, Ux);
    if (warp) { const [wx, wy] = warp(q.x, q.y); q.x = wx; q.y = wy; }
    return q;
  }
  if (p.pts) { q.pts = p.pts.map(([x, y]) => { let v = mPt(M, x, y); if (warp) v = warp(v[0], v[1]); return v; }); }
  return q;
}
function xfDetail(d, M) {
  const q = { ...d };
  if (d.x !== undefined) { const [x, y] = mPt(M, d.x, d.y); q.x = x; q.y = y; }
  if (d.pts) q.pts = d.pts.map(([x, y]) => mPt(M, x, y));
  return q;
}
/* ---------- rigs: which parts move together (indices into ART[key].parts), pivots in 64-space ---------- */
// kind picks the motion style; layers: name → [part indices, pivot x, pivot y, parent layer?]
const HD_RIG = {
  mush: { kind: 'hop', layers: { cap: [[3, 4, 5, 6, 7, 8, 9, 10, 11], 32, 42] } },
  bird: { kind: 'fly', layers: { wingL: [[3], 18, 34], wingR: [[4], 46, 34], tail: [[0], 44, 50], crest: [[7, 8, 9], 32, 26] } },
  pebble: { kind: 'brute', layers: { armL: [[2], 14, 45], armR: [[3], 50, 45] } },
  slime: { kind: 'slime', layers: { drops: [[1, 2, 3], 32, 20] } },
  fox: { kind: 'beast', damp: { tail: 0.5 }, layers: { tail: [[0, 1], 44, 50], head: [[8, 9, 10, 11], 32, 38], earL: [[8], 22, 20, 'head'], earR: [[9], 42, 20, 'head'] } },
  bee: { kind: 'buzz', layers: { wingL: [[0], 24, 30], wingR: [[1], 40, 30], head: [[7], 32, 34], sting: [[2], 32, 56] } },
  frog: { kind: 'hop', layers: { legs: [[0, 1], 32, 56] } },
  wolf: { kind: 'beast', layers: { tail: [[0], 46, 46], head: [[7, 8, 9, 10, 11], 32, 44], earL: [[8], 22, 22, 'head'], earR: [[9], 42, 22, 'head'] } },
  flower: { kind: 'plant', layers: { bloom: [[5, 6, 7, 8, 9, 10, 11, 12], 32, 36], leafL: [[0], 14, 56], leafR: [[1], 50, 56] } },
  croc: { kind: 'beast', layers: { tail: [[0], 46, 48], head: [[9, 10, 11], 32, 42] } },
  golem: { kind: 'golem', layers: { armL: [[2, 6, 8, 10], 13, 28], armR: [[3, 7, 9, 11], 51, 28], head: [[12, 13], 32, 27], core: [[14], 32, 40] } },
  bandit: { kind: 'human', layers: { armL: [[5, 7], 14, 36], armR: [[6, 8, 12, 13], 50, 36], head: [[9, 10, 11], 32, 36] } },
  banditBoss: { kind: 'human', layers: { armL: [[5, 7], 14, 36], armR: [[6, 8, 15, 16], 50, 36], head: [[9, 10, 11, 12, 13], 32, 36] } },
  thunderBeetle: { kind: 'bug', layers: { head: [[7, 8, 9, 10], 32, 36], mandL: [[8], 26, 31, 'head'], mandR: [[9], 38, 31, 'head'] } },
  emberSpirit: { kind: 'flame', layers: { embers: [[0, 1], 32, 14], flame: [[2, 3, 4], 32, 56] } },
  skeleton: { kind: 'human', layers: { armL: [[3], 18, 31], armR: [[4, 9, 10], 46, 31], head: [[7, 8], 32, 29], jaw: [[8], 32, 27, 'head'] } },
  ghostLamp: { kind: 'lamp', damp: { lamp: 0.3, wisp: 0.6 }, layers: { lamp: [[0, 1, 2, 3, 4], 32, 54], flame: [[3], 32, 32, 'lamp'], wisp: [[5], 32, 54] } },
  caveSpider: { kind: 'spider', layers: { legsL: [[0, 2, 4, 6], 29, 38], legsR: [[1, 3, 5, 7], 35, 38], head: [[10, 11, 12], 32, 38], fangL: [[11], 29, 37, 'head'], fangR: [[12], 35, 37, 'head'] } },
  wraith: { kind: 'ghost', layers: { armL: [[0, 2], 16, 36], armR: [[1, 3], 48, 36], body: [[4, 5], 32, 40] } },
  boneHound: { kind: 'beast', layers: { head: [[5, 6, 7], 32, 40], mane: [[4], 32, 30] } },
  boneKnight: { kind: 'human', layers: { armL: [[3, 13], 18, 31], armR: [[4, 14, 15], 46, 31], head: [[9, 10, 11, 12], 32, 29], jaw: [[10], 32, 27, 'head'] } },
};
const HD_RIG_OF = { thornMush: 'mush', nightBird: 'bird', leafFox: 'fox', mossGiant: 'golem', caveBat: 'bird', mudSlime: 'slime', crystalPebble: 'pebble', crystalGolem: 'golem', mineBat: 'bird', oreSlime: 'slime', drownedSoul: 'wraith', paleWraith: 'wraith', runeGolem: 'golem', goldSlime: 'slime', gemSlime: 'slime', moonFox: 'fox', crystalBat: 'bird', goldSkeleton: 'skeleton' };
const hdRig = sp => HD_RIG[HD_RIG_OF[sp] || sp] || { kind: 'blob', layers: {} };
/* ---------- motion: pose(kind, state, phase) → { G: global transform about the foot, L: per-layer transforms, wave } ---------- */
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const TAU = Math.PI * 2;
const BREATH = { slime: 0.07, hop: 0.045, beast: 0.03, human: 0.025, brute: 0.025, golem: 0.018, ghost: 0.02, flame: 0.035, plant: 0.025, fly: 0.03, buzz: 0.025, bug: 0.02, spider: 0.02, lamp: 0.015, blob: 0.03 };
function monPose(kind, state, p) {
  const G = { rot: 0, sx: 1, sy: 1, dx: 0, dy: 0 }, L = {}; let wave = 0;
  const set = (n, o) => { L[n] = Object.assign(L[n] || {}, o); };
  if (state === 'idle') {
    const s = Math.sin(TAU * p), s2 = Math.sin(TAU * p * 2), B = BREATH[kind] || 0.03;
    G.sy = 1 + B * s; G.sx = 1 - B * 0.6 * s;
    set('head', { dy: 0.9 * Math.sin(TAU * p - 0.7), rot: 0.03 * Math.sin(TAU * p + 1) });
    set('jaw', { rot: 0.1 * Math.max(0, Math.sin(TAU * p * 2)) });
    const flap = kind === 'buzz' ? 0.32 * Math.sin(TAU * p * 4) : 0.18 + 0.3 * s2;
    set('wingL', { rot: flap }); set('wingR', { rot: -flap });
    set('tail', { rot: 0.22 * s }); set('earL', { rot: 0.08 * Math.max(0, Math.sin(TAU * p * 2 + 2)) }); set('earR', { rot: -0.08 * Math.max(0, Math.sin(TAU * p * 2 + 2.6)) });
    set('armL', { rot: 0.06 * s }); set('armR', { rot: -0.06 * s });
    set('cap', { rot: 0.05 * Math.sin(TAU * p + 0.6), dy: 0.6 * s }); set('bloom', { rot: 0.07 * Math.sin(TAU * p) }); set('leafL', { rot: -0.1 * s }); set('leafR', { rot: 0.1 * s });
    set('core', { sx: 1 + 0.12 * s, sy: 1 + 0.12 * s }); set('crest', { rot: 0.08 * s2 });
    set('drops', { dy: 1.5 * Math.sin(TAU * p + 1) }); set('embers', { dy: 2 * Math.sin(TAU * p * 2), rot: 0.1 * s });
    set('legsL', { rot: 0.025 * s2 }); set('legsR', { rot: -0.025 * s2 }); set('fangL', { rot: 0.12 * Math.max(0, s2) }); set('fangR', { rot: -0.12 * Math.max(0, s2) });
    set('mandL', { rot: 0.12 * Math.max(0, s2) }); set('mandR', { rot: -0.12 * Math.max(0, s2) });
    set('lamp', { rot: 0.05 * s }); set('flame', { sx: 1 + 0.04 * s2, sy: 1 + 0.07 * s2 }); set('wisp', { rot: -0.12 * s });
    set('mane', { sy: 1 + 0.08 * s2 }); set('sting', { rot: 0.1 * s }); set('legs', { sx: 1 - 0.04 * s });
    wave = p;
  } else if (state === 'attack') { // wind-up (lean back) → strike (lunge toward the hero, lower-left) → recover
    const w = sstep(0, 0.28, p) * (1 - sstep(0.28, 0.42, p)), k = sstep(0.28, 0.42, p) * (1 - sstep(0.62, 1, p));
    G.rot = 0.07 * w - 0.11 * k; G.sy = 1 - 0.05 * w + 0.05 * k; G.sx = 1 + 0.03 * w - 0.02 * k; G.dx = -2 * k;
    set('head', { rot: -0.08 * k + 0.05 * w, dy: 1.5 * k }); set('jaw', { rot: 0.22 * k });
    set('wingL', { rot: 0.7 * w - 0.2 * k }); set('wingR', { rot: -0.7 * w + 0.2 * k });
    set('armR', { rot: -0.9 * w + 0.55 * k }); set('armL', { rot: 0.5 * w - 0.25 * k });
    set('tail', { rot: 0.45 * w - 0.2 * k }); set('cap', { rot: -0.1 * w + 0.12 * k }); set('bloom', { rot: 0.12 * w - 0.15 * k });
    set('fangL', { rot: 0.3 * w }); set('fangR', { rot: -0.3 * w }); set('mandL', { rot: 0.35 * w }); set('mandR', { rot: -0.35 * w });
    set('core', { sx: 1 + 0.3 * k, sy: 1 + 0.3 * k }); set('legsL', { rot: 0.06 * w }); set('legsR', { rot: -0.06 * w });
    set('lamp', { rot: 0.1 * w - 0.14 * k }); set('earL', { rot: -0.15 * k }); set('earR', { rot: 0.15 * k }); set('drops', { dy: -3 * k });
    wave = p * 2;
  } else if (state === 'cast') { // rise and open up
    const c = sstep(0, 1, p);
    G.sy = 1 + 0.05 * c; G.sx = 1 - 0.02 * c;
    set('armR', { rot: -0.7 * c }); set('armL', { rot: 0.7 * c }); set('wingL', { rot: 0.55 * c }); set('wingR', { rot: -0.55 * c });
    set('head', { rot: -0.04 * c, dy: -1 * c }); set('core', { sx: 1 + 0.35 * c, sy: 1 + 0.35 * c }); set('bloom', { sx: 1 + 0.08 * c, sy: 1 + 0.08 * c });
    set('cap', { dy: -1.5 * c }); set('embers', { dy: -3 * c }); set('flame', { sy: 1 + 0.2 * c }); set('jaw', { rot: 0.15 * c }); set('tail', { rot: 0.3 * c });
    wave = p;
  } else if (state === 'hurt') { // knocked back (top moves away from the hero), then settle
    const h = Math.sin(Math.PI * clamp(p / 0.7, 0, 1));
    G.rot = 0.13 * h; G.sy = 1 - 0.06 * h; G.sx = 1 + 0.03 * h; G.dx = 2 * h;
    set('head', { rot: 0.12 * h, dy: -1 * h }); set('armL', { rot: -0.35 * h }); set('armR', { rot: 0.35 * h }); set('wingL', { rot: -0.3 * h }); set('wingR', { rot: 0.3 * h });
    set('tail', { rot: -0.3 * h }); set('jaw', { rot: 0.2 * h }); set('cap', { rot: 0.1 * h }); set('earL', { rot: 0.2 * h }); set('earR', { rot: -0.2 * h });
    wave = p;
  }
  return { G, L, wave };
}
/* ---------- build one posed definition ---------- */
function hdPoseDef(def, rig, pose, off) {
  const parts = def.parts, layerOf = new Array(parts.length).fill(null), ids = {};
  parts.forEach((p, i) => { if (p.id) ids[p.id] = i; });
  for (const n in rig.layers) for (const i of rig.layers[n][0]) layerOf[i] = n; // later layers (children) win
  parts.forEach((p, i) => { if (!layerOf[i] && typeof p.clip === 'string' && ids[p.clip] !== undefined) layerOf[i] = layerOf[ids[p.clip]]; });
  const gM = mMul(off, mAbout(32, 63, pose.G)), cache = {};
  const layerM = n => { if (!n) return gM; if (cache[n]) return cache[n]; const [, px, py, par] = rig.layers[n]; const M = mMul(par ? layerM(par) : gM, mAbout(px, py, pose.L[n])); return cache[n] = M; };
  const waveOf = n => { if (!(rig.kind === 'ghost' && n === 'body') && !(rig.kind === 'flame' && n === 'flame') && !(n === 'mane') && !(rig.kind === 'lamp' && n === 'wisp')) return null;
    const ph = pose.wave * TAU, amp = rig.kind === 'flame' || n === 'mane' ? 0.9 : 1.2;
    return (x, y) => { const Y0 = mPt(off, 0, 0)[1], rel = (y - Y0) / (64 * off[3]); const wgt = rig.kind === 'flame' || n === 'mane' ? clamp(1 - rel * 1.2, 0, 1) : clamp((rel - 0.45) * 2, 0, 1); return [x + amp * off[0] * wgt * Math.sin(ph + y * 0.18 / off[3]), y]; }; };
  const outParts = parts.map((p, i) => xfShape(p, layerM(layerOf[i]), waveOf(layerOf[i])));
  // details follow whichever part they sit on (topmost part containing the anchor point)
  const inside = (p, X, Y) => { if (p.u) return p.u.some(q => inside(q, X, Y)); if (p.s === 'e') { let dx = X - p.x, dy = Y - p.y; if (p.rot) { const c = Math.cos(-p.rot), s = Math.sin(-p.rot); [dx, dy] = [dx * c - dy * s, dx * s + dy * c]; } const ry = p.ry || p.rx; return dx * dx / (p.rx * p.rx) + dy * dy / (ry * ry) <= 1; } if (!p.pts) return false; let ins = false; for (let a = 0, b = p.pts.length - 1; a < p.pts.length; b = a++) { const [xi, yi] = p.pts[a], [xj, yj] = p.pts[b]; if (((yi > Y) !== (yj > Y)) && (X < (xj - xi) * (Y - yi) / (yj - yi) + xi)) ins = !ins; } return ins; };
  const details = (def.details || []).map(d => { const ax = d.x !== undefined ? d.x : d.pts ? d.pts.reduce((s, q) => s + q[0], 0) / d.pts.length : 32, ay = d.y !== undefined ? d.y : d.pts ? d.pts.reduce((s, q) => s + q[1], 0) / d.pts.length : 32;
    let li = -1; for (let i = parts.length - 1; i >= 0; i--) if (inside(parts[i], ax, ay)) { li = i; break; }
    return xfDetail(d, layerM(li >= 0 ? layerOf[li] : null)); });
  return { ...def, parts: outParts, details };
}
/* ---------- live vector actors (drawn every frame at the screen's real resolution) ---------- */
const HD_KL = 80 / 64, HD_KL_BIG = 92 / 64; // screen pixels per design unit (monster box ≈ 80 / 92 px)
const HD_GLOSS = { slime: 0.55, ghost: 0.15, golem: 0.08, brute: 0.12, flame: 0.2, lamp: 0.45, beast: 0.18, human: 0.2 };
const HD_IDLE_PERIOD = 72;
// adaptive quality: if drawing the battle is slow on this device, drop bloom/shafts/near motes and render at 2x
const HD_QUALITY = { ema: 0, n: 0, low: false };
function hdQualityTick(ms) { const Q = HD_QUALITY; Q.n++; Q.ema = Q.n < 5 ? ms : Q.ema * 0.95 + ms * 0.05; if (!Q.low && Q.n > 40 && Q.ema > 11) Q.low = true; }
const HD_PIXEL = true; // battle actors on the game's pixel grid (players asked for a more pixelated look)
const hdD = () => HD_PIXEL ? 1 : Math.min(SCALE, HD_QUALITY.low ? 2 : 3); // render density cap (smoothly upscaled beyond that)
function hdCanvas(A, wL, hL) { const D = hdD(); if (!A.cv || A.cvD !== D) { A.cv = mkCanvas(Math.ceil(wL * D), Math.ceil(hL * D)); A.cvT = mkCanvas(A.cv.width, A.cv.height); A.cvD = D; } A.cv.ds = A.cvT.ds = 1 / D; return A.cv; }
function hdFoeSpec(sp) {
  const def = ART[sp], rig = hdRig(sp), kL = FOE_NATIVE[sp] ? HD_KL_BIG : HD_KL, pad = 16, SL = Math.round(64 * kL + pad * 2);
  const off = [1, 0, 0, 1, pad / kL, (SL - 64 * kL - 1) / kL];
  const spec = { def, rig, kL, SL, off, line: 1.15 / kL, gloss: HD_GLOSS[rig.kind] ?? 0.25 };
  // anchor box from the base pose (measured once on a 2x canvas)
  const c = mkCanvas(SL * 2, SL * 2), x = c.getContext('2d'); x.setTransform(2 * kL, 0, 0, 2 * kL, 0, 0); vecDraw(x, hdPoseDef(def, rig, monPose(rig.kind, 'idle', 0), off), spec);
  const d = x.getImageData(0, 0, c.width, c.height).data, S = c.width; let x0 = S, x1 = -1, y0 = S, y1 = -1;
  for (let y = 0; y < S; y++) for (let X = 0; X < S; X++) if (d[(y * S + X) * 4 + 3] > 100) { if (X < x0) x0 = X; if (X > x1) x1 = X; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  spec.bb = { cx: Math.round((x0 + x1 + 1) / 4), top: y0 / 2, bot: Math.round((y1 + 1) / 2), w: (x1 - x0 + 1) / 2, h: (y1 - y0 + 1) / 2 };
  return spec;
}
function hdPhase(A, T) { if (A.state === 'idle') return ['idle', ((T + A.phase) % HD_IDLE_PERIOD) / HD_IDLE_PERIOD]; if (A.state === 'faint') return ['hurt', 0.4]; return [A.state, clamp(A.t / Math.max(1, A.dur), 0, 1)]; }
function hdRenderFoe(A, spec, T, tint) {
  const cv = hdCanvas(A, spec.SL, spec.SL), tgt = tint ? A.cvT : cv, x = tgt.getContext('2d'), [st, p] = hdPhase(A, T), pose = monPose(spec.rig.kind, st, p);
  if (spec.rig.damp && st === 'idle') for (const q in spec.rig.damp) { const o = pose.L[q]; if (o) for (const f of ['rot', 'dx', 'dy']) if (o[f]) o[f] *= spec.rig.damp[q]; }
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, tgt.width, tgt.height); const k = spec.kL * A.cvD; x.setTransform(k, 0, 0, k, 0, 0);
  vecDraw(x, hdPoseDef(spec.def, spec.rig, pose, spec.off), { line: spec.line, gloss: spec.gloss, tint });
  tgt.bb = spec.bb; return tgt;
}
/* ---------- hero (back view, full body) built from the equipped look ---------- */
const HERO_HD = { N: 76, W: 92 }; // 92 × 76 screen pixels (design space 72 × 64)
const SKIN = { ramp: ['#fff4e8', '#fbe0c4', '#f4cca8', '#e0a880', '#8a5a48'], line: false, flat: 1 };
function heroHDDef(L) {
  const P = HERO_PAL, BL = BODY_LOOKS[L.body], shape = BL ? BL[0] : 'uniform', bp = BL ? BL[1] : {}, fp = { ...P, ...(FEET_PAL[L.feet] || {}) };
  const parts = [], ids = {}, add = (layer, q) => { q.layer = layer; parts.push(q); if (q.id) ids[q.id] = parts.length - 1; return q; };
  const E = (layer, x, y, rx, ry, c, o = {}) => add(layer, { s: 'e', x, y, rx, ry, c, ...o }), Pg = (layer, pts, c, o = {}) => add(layer, { s: 'p', pts, c, ...o });
  const cloth = shape === 'uniform' ? '#2e3c70' : bp.X, clothD = shape === 'uniform' ? '#1e2850' : (bp.x || bp.X), trim = bp.Z || '#4a3424', light = bp.Y || bp.X;
  // legs & boots
  const pants = shape === 'robe' ? bp.X : shape === 'uniform' ? '#1e2850' : '#3a3444';
  E('legs', 18, 50, 4.2, 7, pants); E('legs', 30, 50, 4.2, 7, pants);
  E('legs', 18, 58.5, 4.8, 4.5, fp.B || '#30303a'); E('legs', 30, 58.5, 4.8, 4.5, fp.B || '#30303a');
  // torso by armour shape
  if (shape === 'robe') Pg('body', [[12, 30], [36, 30], [42, 60], [6, 60]], cloth, { id: 'torso' });
  else E('body', 24, 38, 13, 12, cloth, { id: 'torso' });
  if (shape === 'robe') { E('body', 24, 58, 17, 3, trim, { clip: 'torso', line: false }); E('body', 24, 31, 8, 3, bp.W || '#ffffff'); }
  else if (shape === 'uniform') { E('body', 24, 45, 12, 2.6, '#1e2850', { clip: 'torso', line: false }); E('body', 24, 27.5, 7, 3, '#f6f6f2'); }
  else { E('body', 24, 45.5, 12.5, 2.4, trim, { clip: 'torso', line: false }); if (bp.z) E('body', 24, 45.5, 2, 2, bp.z, { line: false }); }
  if (shape === 'mail' || shape === 'plate') { const r = shape === 'plate' ? 6.5 : 5.2; E('body', 11, 30, r, r * 0.8, light, { id: 'pl' }); E('body', 37, 30, r, r * 0.8, light, { id: 'pr' }); }
  if (shape === 'mail') for (let y = 34; y <= 42; y += 4) E('body', 24, y, 10, 0.9, clothD, { clip: 'torso', line: false, noCast: 1 });
  if (shape === 'plate') E('body', 24, 36, 3, 8, light, { clip: 'torso', line: false });
  // arms (left = screen-left, right holds the weapon)
  const sleeve = shape === 'uniform' ? '#2e3c70' : shape === 'plate' || shape === 'mail' ? light : cloth;
  E('armL', 9, 38, 4.2, 8.5, sleeve, { rot: 0.25 }); E('armL', 7.5, 46, 3.2, 3.2, P.S, SKIN);
  E('armR', 39, 38, 4.2, 8.5, sleeve, { rot: -0.25 });
  // cape (cloak) hangs over the back — in front of the torso in a back view
  if (shape === 'cloak') { Pg('cape', [[13, 27], [35, 27], [40, 55], [24, 58], [8, 55]], bp.D || cloth, { id: 'cape' }); Pg('cape', [[13, 27], [35, 27], [33, 31], [15, 31]], bp.d || clothD, { line: false }); }
  // head: back of the head is hair
  E('head', 12.5, 18, 2.4, 3.2, P.S, SKIN); E('head', 35.5, 18, 2.4, 3.2, P.S, SKIN); E('head', 24, 25, 5.5, 3, P.S, SKIN);
  E('head', 24, 15, 12, 11.5, P.H, { id: 'hair' }); Pg('head', [[15, 8], [19, 3], [22, 7]], P.H); Pg('head', [[25, 6], [30, 2], [31, 8]], P.H);
  E('head', 19, 10, 4, 3, P.h, { clip: 'hair', line: false, noCast: 1 });
  if (L.head) { const [ht, pk, deco] = L.head, hp = HEAD_PAL[pk] || HEAD_PAL.cloth;
    if (ht === 'cap') { E('head', 24, 11, 12.6, 8, hp.A, { id: 'hat' }); E('head', 24, 17.5, 13, 2.2, hp.a); }
    else if (ht === 'helm') { E('head', 24, 13.5, 13.2, 12, hp.A, { id: 'hat' }); E('head', 24, 13, 1.6, 11, hp.C, { clip: 'hat', line: false }); E('head', 24, 24, 11, 3, hp.a); }
    else if (ht === 'hood') { E('head', 24, 15, 13.5, 13, hp.A, { id: 'hat' }); Pg('head', [[12, 20], [36, 20], [38, 30], [10, 30]], hp.a); }
    if (deco === 'feather') Pg('head', [[10, 12], [3, 0], [6, 1], [13, 10]], hp.E || '#f0e8d8');
    if (deco === 'horns') { Pg('head', [[12, 9], [4, 2], [5, 7], [11, 13]], hp.C); Pg('head', [[36, 9], [44, 2], [43, 7], [37, 13]], hp.C); }
    if (deco === 'lamp') E('head', 24, 16, 13.4, 1.4, '#3a2a1e', { line: false });
  }
  // weapon in the right hand (grip at 41,46), pointing up-right toward the foe
  const wt = L.weapon && L.weapon[0], wp = (L.weapon && WPN_PAL[L.weapon[1]]) || WPN_PAL.steel;
  if (wt === 'sword') { Pg('wpn', [[41, 43], [44, 44], [66, 10], [64, 8]], wp.i || '#b8c0d0', { id: 'blade' }); Pg('wpn', [[42, 43], [44, 43.5], [64.5, 9.5], [64, 8]], wp.I || '#ffffff', { line: false }); Pg('wpn', [[37, 42], [40, 39], [48, 47], [45, 50]], wp.U || '#e8c048'); Pg('wpn', [[38, 50], [41, 47], [43, 49], [40, 52]], wp.T || '#6a3a26'); }
  else if (wt === 'dagger') { Pg('wpn', [[41, 43], [44, 44], [54, 30], [52, 28]], wp.i || '#b8c0d0'); Pg('wpn', [[39, 43], [41, 41], [46, 46], [44, 48]], wp.U || '#8a6a4a'); }
  else if (wt === 'axe') { Pg('wpn', [[38, 56], [41, 57], [59, 12], [56, 11]], wp.T || '#4a3a30'); Pg('wpn', [[54, 12], [66, 6], [69, 18], [60, 22], [55, 18]], wp.i || '#98a0b0', { id: 'axe' }); Pg('wpn', [[62, 8], [66, 6], [69, 18], [66, 17]], wp.I || '#e8ecf0', { clip: 'axe', line: false }); }
  else if (wt === 'staff') { Pg('wpn', [[37, 60], [40, 61], [57, 9], [54, 8]], wp.T || '#8a5a30'); E('wpn', 56.5, 6, 4.2, 4.2, wp.V || '#f0f4ff', { glow: 1 }); }
  else if (wt === 'tome') { Pg('wpn', [[42, 30], [52, 26], [62, 30], [52, 34]], wp.T || '#5a3a70'); Pg('wpn', [[43, 29], [52, 25], [52, 32], [44, 32]], wp.V || '#f0e8d0', { line: false }); Pg('wpn', [[52, 25], [61, 29], [60, 32], [52, 32]], wp.V || '#f0e8d0', { line: false }); E('wpn', 52, 20, 2.2, 2.2, wp.U || '#c0a0ff', { glow: 1 }); }
  E('armR', 41, 46.5, 3.2, 3.2, P.S, SKIN); // right hand on top of the grip
  return { parts, ids };
}
// hero layers: pivots in 72×64 design space
const HERO_LAYERS = { legs: [24, 60], body: [24, 60], armL: [11, 31], armR: [37, 31], cape: [24, 28], head: [24, 26], wpn: [37, 31] };
function heroPose(kind, state, p) {
  const G = { rot: 0, sx: 1, sy: 1, dx: 0, dy: 0 }, L = {}; let wave = 0;
  const set = (n, o) => { L[n] = Object.assign(L[n] || {}, o); };
  if (state === 'idle') { const s = Math.sin(TAU * p); G.sy = 1 + 0.02 * s; set('head', { dy: 0.6 * Math.sin(TAU * p - 0.8) }); set('armR', { rot: -0.04 * s }); set('wpn', { rot: -0.04 * s }); set('armL', { rot: 0.04 * s }); wave = p; }
  else if (state === 'attack') {
    const w = sstep(0, 0.28, p) * (1 - sstep(0.28, 0.42, p)), k = sstep(0.28, 0.42, p) * (1 - sstep(0.62, 1, p));
    G.rot = 0.07 * k - 0.04 * w; G.dx = 2 * k; G.dy = -1.5 * k; set('head', { rot: 0.06 * k });
    if (kind === 'dagger') { const o = { rot: 0.25 * k - 0.2 * w, dx: 6 * k - 2 * w, dy: -6 * k + 2 * w }; set('armR', o); set('wpn', o); }
    else if (kind === 'staff' || kind === 'tome') { const o = { rot: -0.35 * w + 0.35 * k, dy: -4 * w - 2 * k, dx: 3 * k }; set('armR', o); set('wpn', { ...o, sx: 1 + 0.1 * k, sy: 1 + 0.1 * k }); }
    else { const o = { rot: -0.75 * w + 1.0 * k, dy: -2 * w }; set('armR', o); set('wpn', o); }
    set('armL', { rot: 0.3 * w - 0.2 * k }); wave = p * 2;
  } else if (state === 'cast') { const c = sstep(0, 1, p); G.sy = 1 + 0.03 * c; set('armR', { rot: -0.35 * c, dy: -3 * c }); set('wpn', { rot: -0.35 * c, dy: -3 * c }); set('armL', { rot: 0.5 * c, dy: -2 * c }); set('head', { rot: 0.03 * c }); wave = p; }
  else if (state === 'hurt') { const h = Math.sin(Math.PI * clamp(p / 0.7, 0, 1)); G.rot = -0.1 * h; G.dx = -2 * h; G.dy = 1 * h; set('head', { rot: -0.12 * h }); set('armR', { rot: 0.3 * h }); set('wpn', { rot: 0.3 * h }); set('armL', { rot: -0.3 * h }); wave = p; }
  else if (state === 'defend') { const d = sstep(0, 1, p); const o = { rot: -0.95 * d, dx: -9 * d, dy: 2 * d }; set('armR', o); set('wpn', o); set('armL', { rot: -0.4 * d, dx: 4 * d }); G.sy = 1 - 0.03 * d; }
  return { G, L, wave };
}
function heroHDPosed(L, state, p) {
  const { parts } = heroHDDef(L), kind = L.weapon ? L.weapon[0] : 'none', pose = heroPose(kind, state, p), k = HERO_HD.N / 64;
  const gM = mAbout(24, 62, pose.G), cache = {};
  const layerM = n => cache[n] || (cache[n] = mMul(gM, mAbout(HERO_LAYERS[n][0], HERO_LAYERS[n][1], pose.L[n])));
  const warp = (x, y) => [x + 0.8 * clamp((y - 36) / 20, 0, 1) * Math.sin(pose.wave * TAU + y * 0.25), y];
  const out = parts.map(q => { const r = xfShape(q, layerM(q.layer), q.layer === 'cape' ? warp : null); delete r.layer; return r; });
  return { def: { parts: out, details: [] }, k };
}
const HERO_KL = 76 / 64, HERO_BOX = [92, 80], HD_HERO_OX = 60; // hero drawn centred at the bottom of the stage
function hdRenderHero(A, L, T, tint) {
  const cv = hdCanvas(A, HERO_BOX[0], HERO_BOX[1]), tgt = tint ? A.cvT : cv, x = tgt.getContext('2d'), [st, p] = hdPhase(A, T), { def } = heroHDPosed(L, st, p);
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, tgt.width, tgt.height); const k = HERO_KL * A.cvD; x.setTransform(k, 0, 0, k, 0, 0);
  vecDraw(x, def, { line: 1.1 / HERO_KL, gloss: 0.2, tint }); return tgt;
}
/* ---------- battle integration (animation state machine; the old draw code is reused unchanged) ---------- */
function hdAnim(b, who, state, dur, hold) { const A = b.hd && b.hd[who]; if (!A) return; if (A.state === 'faint') return; A.state = state; A.t = 0; A.dur = dur; A.hold = !!hold; }

/* ---------- drawing: same layout as Battle.draw; actors are rendered live as smooth vectors ---------- */

/* ---------- hero: the paper-doll sprite (same look as on the field, reflects equipment), drawn on the pixel grid ---------- */
const HD_HERO_DOLL = true;
const DOLL_SCALE = 2; // field doll pixels shown at 2x (the old battle view used 3x)
const dollNative = {};
function dollImg(frame, L) { const key = frame + lookKey(L); if (dollNative[key]) return dollNative[key]; const big = heroBattleImgLook(frame, L), w = big.width / 3, h = big.height / 3, c = mkCanvas(w * DOLL_SCALE, h * DOLL_SCALE), x = c.getContext('2d'), n = mkCanvas(w, h); n.getContext('2d').drawImage(big, 0, 0, w, h); x.imageSmoothingEnabled = false; x.drawImage(n, 0, 0, w * DOLL_SCALE, h * DOLL_SCALE); return dollNative[key] = c; }
function dollSpec() { const im = dollImg(0, heroLookOf(Game.st)); return { doll: true, w: im.width, h: im.height, cw: im.width, ch: im.height + 2, bb: { cx: Math.round(im.width * 0.29), top: 0, bot: im.height - 2, w: im.width, h: im.height } }; } // cx = the body's middle (the weapon sticks out to the right), bot = the foot row
function dollRender(b, A, S, T, tint) {
  if (!A.pcv || A.pcv.width !== S.cw) { A.pcv = mkCanvas(S.cw, S.ch); A.pcvT = mkCanvas(S.cw, S.ch); }
  const cv = tint ? A.pcvT : A.pcv, x = cv.getContext('2d'), [st] = hdPhase(A, T), L = b.hd.look;
  const moving = st === 'attack' || b.offH.x || b.offH.y, img = dollImg(moving ? 1 : 0, L);
  const bob = st === 'idle' && Math.floor((T + A.phase) / 18) % 2 ? 1 : 0, back = st === 'hurt' ? 2 : 0;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = false;
  x.drawImage(img, 0, bob + back);
  if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
  cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
}
