/* ===================== v12.126 菁英・頭目的招式特效：照招式名稱重做（特效測試版） =====================
   玩家 2026-10-11：「菁英和BOSS的攻擊特效也一併更新 盡可能符合招式名稱」
   80 隻菁英・頭目共 216 招。以前用的是魔物那一套舊動畫（很多招共用同一個：荊鞭＝樹根粉碎、怒潮壓＝甩尾……）。
   現在每一招照名字挑「動作」＋「顏色」，用跟主角技能同一套 HD 光效畫：
   咬＝上下兩排牙咬合、爪＝三道爪痕、斬＝刀光、刺＝一道貫穿、重擊＝砸地裂開、衝撞＝衝過來、甩尾＝低低橫掃、鞭＝一條彎曲的鞭子甩過來、
   鉗＝左右夾、毒針、熊抱、吞噬＝巨口、旋風、十二連擊、蟲群；彈・投擲（岩石・種子・毒瓶・南瓜・齒輪）、射線、吐息、從天而降（荊棘・星・岩・冰・羽毛）、
   震地・樹根竄出、浪、漩渦、爆炸・新星、詛咒、吸取、花粉・霧、歌・音波、凝視、咆哮、護甲（鱗・石・鏡・紗・渦流・珍珠・霧）、再生、召喚、
   審判光柱、月蝕、時計、絕對零度、魔女的大鍋……
   只有菁英・頭目用的時候換新的；一般魔物照舊。特效測試版先開（EBX18.live）。 */
const EBX18 = { live: typeof fxtest13 === 'function' && fxtest13() };
const EBX = { P: {}, S: {}, T: {} };
{ const P0 = HD15.P, K = o => Object.assign({ keep: 1 }, o);
  Object.assign(EBX.P, {
    feral: K({ core: '#ffffff', mid: '#ffd8a8', glow: '#ff7a2a', edge: '#4a1a04' }), fang: K({ core: '#ffffff', mid: '#fff0e8', glow: '#ff7a6a', edge: '#4a0a0a' }),
    blood: K({ core: '#fff0f0', mid: '#ff4a5a', glow: '#c0102a', edge: '#3a0008' }), bone: K({ core: '#ffffff', mid: '#f0ead8', glow: '#a89a7a', edge: '#2a2418' }),
    leaf: K({ core: '#f4ffe0', mid: '#8ee04a', glow: '#2f8a1a', edge: '#0e2a06' }), thorn: K({ core: '#f0ffd8', mid: '#a8d84a', glow: '#4a7a12', edge: '#1a2a04' }),
    root: K({ core: '#fff0d8', mid: '#c09a5a', glow: '#6a4a1a', edge: '#1e1206' }), wither: K({ core: '#f8f0e0', mid: '#b09a6a', glow: '#6a4a6a', edge: '#1a0e14' }),
    water: K({ core: '#ffffff', mid: '#7ad8ff', glow: '#1a78e0', edge: '#062a5a' }), abyss: K({ core: '#e0f4ff', mid: '#3a9ad8', glow: '#0a3a8a', edge: '#020a24' }),
    ice: K({ core: '#ffffff', mid: '#c8f4ff', glow: '#5ac0f0', edge: '#0a3a5a' }), fire: P0.ember, lava: K(P0.lava || P0.ember),
    rock: K({ core: '#fff4e0', mid: '#d8b07a', glow: '#8a5a2a', edge: '#2a1806' }), sand: K({ core: '#fffbe8', mid: '#f0d080', glow: '#b08a30', edge: '#3a2a08' }),
    mud: K({ core: '#f0e0c0', mid: '#9a7a4a', glow: '#5a3a14', edge: '#1a0e04' }), poison: P0.venom, toxic: K({ core: '#f8e8ff', mid: '#b86ae0', glow: '#5a8a1a', edge: '#1a0a24' }),
    dark: K({ core: '#f0e0ff', mid: '#9a4ae0', glow: '#4a0a8a', edge: '#0a0014' }), black: P0.black, ghost: K({ core: '#f0fff8', mid: '#7affd0', glow: '#1aa08a', edge: '#04302a' }),
    holy: K(P0.holy), star: K(P0.star16 || P0.star), moon: K(P0.moon16 || P0.cyan), volt: P0.volt, wind: K(P0.wind), crystal: K({ core: '#ffffff', mid: '#b8f0ff', glow: '#4ab0e0', edge: '#0a3a5a' }),
    brass: K(P0.brass16 || P0.gold), steam: K(P0.steam16 || P0.white), arcane: K(P0.arcane || P0.violet), pink: K(P0.pink), gold: K(P0.gold), maple: K({ core: '#fff0d8', mid: '#ff8a3a', glow: '#d0301a', edge: '#4a0a04' }),
    life: K(P0.life || P0.wind), gate: K({ core: '#ffffff', mid: '#ffe0a0', glow: '#b060ff', edge: '#2a0a4a' }), pearl: K({ core: '#ffffff', mid: '#fff4fa', glow: '#e0b0d0', edge: '#4a3a4a' }),
    feather: K({ core: '#e8e8f0', mid: '#5a5a6a', glow: '#2a2a3a', edge: '#08080e' }), silk: K({ core: '#ffffff', mid: '#f4f4f8', glow: '#b8b8c8', edge: '#3a3a4a' }),
  }); }
{ const E = EBX, cl = HD15.cl, eo = HD15.eo, ei = HD15.ei, R = (a, b) => a + Math.random() * (b - a);
  E.pal = k => (k && typeof k === 'object') ? k : E.P[k] || HD15.P[k] || E.P.feral;
  E.gl = (x, X, Y, r, col, al) => HD15.put(x, HD15.tex('glow', col), X, Y, r * 2, r * 2, 0, al);
  E.stroke = (x, pts, pal, w, al) => { if (pts.length < 2 || !(al > 0.01)) return; const path = () => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); };
    x.lineCap = 'round'; x.lineJoin = 'round'; x.globalCompositeOperation = 'source-over'; x.globalAlpha = al * 0.85; x.strokeStyle = pal.edge; x.lineWidth = w + 2; path(); x.stroke();
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = al * 0.45; x.strokeStyle = pal.glow; x.lineWidth = w + 4; path(); x.stroke();
    x.globalAlpha = al; x.strokeStyle = pal.mid; x.lineWidth = w; path(); x.stroke(); x.strokeStyle = pal.core; x.lineWidth = Math.max(1, w * 0.4); path(); x.stroke(); };
  E.poly = (x, pts, pal, al, glow) => { if (!(al > 0.01)) return; x.globalCompositeOperation = 'source-over'; x.globalAlpha = al; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) x.lineTo(p[0], p[1]); x.closePath();
    x.fillStyle = pal.mid; x.fill(); x.strokeStyle = pal.edge; x.lineWidth = 1.2; x.stroke(); if (glow) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = al * 0.5; x.fillStyle = pal.core; x.fill(); } };
  // 彎曲的線（鞭子・藤・舌頭・絲・鎖鏈）：從 A 長到 B
  E.curve = (b, A, B, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 12, hold = o.hold ?? 8, bend = o.bend ?? 30, w = o.w || 3, d = Math.hypot(B.x - A.x, B.y - A.y) || 1, nx = -(B.y - A.y) / d, ny = (B.x - A.x) / d, C = { x: (A.x + B.x) / 2 + nx * bend, y: (A.y + B.y) / 2 + ny * bend };
    return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur + hold, draw: (x, p, k, t) => { const g = eo(cl(t / dur)), f = 1 - cl((t - dur) / Math.max(1, hold)), pts = [], N = 16;
      for (let i = 0; i <= N * g; i++) { const s = i / N, wig = o.wig ? Math.sin(s * 9 + t * 0.6) * o.wig * s : 0; pts.push([(1 - s) * (1 - s) * A.x + 2 * (1 - s) * s * C.x + s * s * B.x + nx * wig, (1 - s) * (1 - s) * A.y + 2 * (1 - s) * s * C.y + s * s * B.y + ny * wig]); }
      E.stroke(x, pts, pal, w * (o.taper ? 1 - 0.5 * k : 1), f); if (o.thorns && pts.length > 3) for (let i = 2; i < pts.length; i += 3) { const [px, py] = pts[i]; E.poly(x, [[px - 2, py], [px + nx * 5, py + ny * 5], [px + 2, py]], pal, f); } } }); };
  // 光束
  E.beam = (b, A, B, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 22, w = o.w || 10, an = Math.atan2(B.y - A.y, B.x - A.x), L = Math.hypot(B.x - A.x, B.y - A.y) + (o.ext || 20);
    return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { const g = eo(cl(k / 0.2)), f = 1 - ei(cl((k - 0.6) / 0.4)), ww = w * (0.4 + 0.6 * g) * f * (1 + 0.12 * Math.sin(t * 1.3)), l = L * g;
      x.save(); x.translate(A.x, A.y); x.rotate(an); x.globalCompositeOperation = 'lighter';
      x.globalAlpha = 0.45 * f; x.fillStyle = pal.glow; x.fillRect(0, -ww * 1.2, l, ww * 2.4); x.globalAlpha = 0.85 * f; x.fillStyle = pal.mid; x.fillRect(0, -ww / 2, l, ww); x.globalAlpha = f; x.fillStyle = pal.core; x.fillRect(0, -ww / 5, l, ww / 2.5); x.restore();
      E.gl(x, A.x, A.y, w * 1.6, pal.glow, 0.7 * f); E.gl(x, A.x + Math.cos(an) * l, A.y + Math.sin(an) * l, w * 2.2, pal.mid, 0.6 * f); } }); };
  // 拋過去的東西（岩石・種子・瓶子・南瓜・齒輪・碎片・冰錐・羽毛・刀）
  E.obj = (x, kind, X, Y, r, rot, pal, al) => { x.save(); x.translate(X, Y); x.rotate(rot); const P = pal;
    if (kind === 'rock') E.poly(x, [[-r, -r * 0.3], [-r * 0.4, -r], [r * 0.6, -r * 0.8], [r, 0], [r * 0.4, r * 0.9], [-r * 0.7, r * 0.7]], P, al);
    else if (kind === 'seed') { E.poly(x, [[0, -r], [r * 0.7, 0], [0, r * 1.1], [-r * 0.7, 0]], P, al, 1); }
    else if (kind === 'bottle') { E.poly(x, [[-r * 0.25, -r * 1.2], [r * 0.25, -r * 1.2], [r * 0.3, -r * 0.4], [r * 0.8, r * 0.2], [r * 0.6, r], [-r * 0.6, r], [-r * 0.8, r * 0.2], [-r * 0.3, -r * 0.4]], P, al, 1); }
    else if (kind === 'pumpkin') { x.globalCompositeOperation = 'source-over'; x.globalAlpha = al; x.fillStyle = '#e86a10'; x.strokeStyle = '#3a1404'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, 0, r * 1.1, r * 0.9, 0, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#3a8a1a'; x.fillRect(-1, -r - 3, 2, 4); x.globalCompositeOperation = 'lighter'; x.fillStyle = '#ffe060'; x.fillRect(-r * 0.5, -r * 0.2, r * 0.3, r * 0.3); x.fillRect(r * 0.2, -r * 0.2, r * 0.3, r * 0.3); x.fillRect(-r * 0.4, r * 0.3, r * 0.8, r * 0.2); }
    else if (kind === 'gear') { x.globalCompositeOperation = 'source-over'; x.globalAlpha = al; x.fillStyle = P.mid; x.strokeStyle = P.edge; x.lineWidth = 1; x.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r : r * 1.3; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.stroke(); x.fillStyle = P.edge; x.beginPath(); x.arc(0, 0, r * 0.35, 0, 7); x.fill(); }
    else if (kind === 'feather') E.poly(x, [[-r * 1.4, 0], [0, -r * 0.45], [r * 1.4, 0], [0, r * 0.45]], P, al);
    else if (kind === 'spike' || kind === 'shard' || kind === 'knife') { HD15.dia(x, 0, 0, r * (kind === 'spike' ? 3.2 : 2.4), r * (kind === 'knife' ? 0.7 : 1.1), 0, P, al); }
    else if (kind === 'star') { x.globalCompositeOperation = 'lighter'; x.globalAlpha = al; x.fillStyle = P.mid; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r * 1.3; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.fillStyle = P.core; x.beginPath(); x.arc(0, 0, r * 0.4, 0, 7); x.fill(); }
    else { x.restore(); E.gl(x, X, Y, r * 2.2, pal.glow, al * 0.8); HD15.put(x, HD15.tex('core', pal.mid), X, Y, r * 2, r * 2, 0, al); return; }
    x.restore(); E.gl(x, X, Y, r * 1.8, pal.glow, al * 0.35); };
  E.lob = (b, A, B, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 16, h = o.h ?? 30, r = o.r || 5, kind = o.kind || 'orb', spin = o.spin ?? 0.4, an = Math.atan2(B.y - A.y, B.x - A.x);
    return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { const s = cl(t / dur), X = A.x + (B.x - A.x) * s, Y = A.y + (B.y - A.y) * s - Math.sin(s * Math.PI) * h;
      for (let j = 1; j <= 3; j++) { const s2 = Math.max(0, s - j * 0.06); E.gl(x, A.x + (B.x - A.x) * s2, A.y + (B.y - A.y) * s2 - Math.sin(s2 * Math.PI) * h, r * (1.6 - j * 0.3), pal.glow, 0.25); }
      E.obj(x, kind, X, Y, r, kind === 'spike' || kind === 'knife' ? an : t * spin, pal, 1); } }); };
  // 從畫面上方落下來
  E.fall = (b, T, pal, n, o = {}) => { const sp = o.spread ?? 34, gap = o.gap ?? 2, r = o.r || 4, kind = o.kind || 'spike', dur = o.dur || 12;
    for (let i = 0; i < n; i++) { const dl = (o.delay || 0) + i * gap, X = T.x + R(-sp, sp), Y = T.y + R(-10, 16), A = { x: X + (o.slant ?? -14), y: -14 };
      E.lob(b, A, { x: X, y: Y }, pal, { delay: dl, dur, h: 0, r: r * R(0.8, 1.25), kind, spin: kind === 'spike' ? 0 : 0.3 });
      HD15.flash(b, { x: X, y: Y }, pal, 16 + r * 2, { dur: 8, delay: dl + dur - 1 }); if (i % 2 === 0) HD15.sparks(b, { x: X, y: Y }, 3, pal, { spd: 2, life: 10, g: 0.1, delay: dl + dur }); } };
  // 地上的扁圓環
  E.gring = (b, G, pal, r0, r1, o = {}) => { const dl = o.delay || 0, dur = o.dur || 18; return HD15.add(b, { x: G.x, y: G.y, delay: dl, life: dl + dur, draw: (x, p, k) => { const r = r0 + (r1 - r0) * eo(k), f = 1 - ei(k);
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = f; x.strokeStyle = pal.mid; x.lineWidth = (o.w || 2.5) * (1 - 0.5 * k); x.beginPath(); x.ellipse(G.x, G.y, r, r * 0.32, 0, 0, 7); x.stroke(); x.globalAlpha = 0.4 * f; x.strokeStyle = pal.glow; x.lineWidth = 6; x.stroke(); } }); };
  // 上下兩排牙咬合
  E.jaws = (b, C, pal, Rr, o = {}) => { const dl = o.delay || 0, close = o.close || 6, n = o.n || 4; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + close + 10, draw: (x, p, k, t) => { const c = eo(cl(t / close)), gap = Rr * (1 - c) + 2, f = 1 - cl((t - close - 2) / 8), w = Rr * 1.5;
      if (f <= 0) return; for (const s of [-1, 1]) { const y0 = C.y + s * gap; E.gl(x, C.x, y0 + s * Rr * 0.3, Rr * 0.9, pal.glow, 0.25 * f);
        for (let i = 0; i < n; i++) { const tx = C.x - w / 2 + (i + 0.5) * w / n, tw = w / n * 0.42, tl = Rr * (i === 0 || i === n - 1 ? 0.75 : 1); E.poly(x, [[tx - tw, y0 + s * Rr * 0.25], [tx + tw, y0 + s * Rr * 0.25], [tx, y0 - s * tl * 0.6]], pal, f, 1); }
        E.stroke(x, [[C.x - w / 2, y0 + s * Rr * 0.3], [C.x + w / 2, y0 + s * Rr * 0.3]], pal, 2.5, f * 0.8); }
      if (t === close) { HD15.flash(b, C, pal, Rr * 2.4, { dur: 10 }); HD15.sparks(b, C, 8, pal, { spd: 3, life: 14, g: 0.12 }); } } }); };
  // 吐息：一股往前噴的粒子
  E.cone = (b, A, B, pal, n, o = {}) => { const an = Math.atan2(B.y - A.y, B.x - A.x), L = Math.hypot(B.x - A.x, B.y - A.y), sp = o.spread ?? 0.35, kind = o.kind || 'flame', span = o.span || 18;
    for (let i = 0; i < n; i++) { const dl = (o.delay || 0) + Math.floor(i * span / n), a = an + R(-sp, sp), v = L / R(12, 16), sz = (o.sz || 9) * R(0.7, 1.3);
      HD15.add(b, { x: A.x, y: A.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 0.985, delay: dl, life: dl + 18, upd: HD15.mv, draw: (x, p, k) => { const g = 0.5 + k * 1.3, f = 1 - ei(cl((k - 0.5) / 0.5));
        if (kind === 'cloud') HD15.put(x, HD15.tex('smoke', pal.mid), p.x, p.y, sz * 3 * g, sz * 3 * g, 0, 0.8 * f, 0);
        else if (kind === 'bubble') { x.globalCompositeOperation = 'lighter'; x.globalAlpha = f; x.strokeStyle = pal.core; x.lineWidth = 1; x.beginPath(); x.arc(p.x, p.y, sz * 0.4 * g, 0, 7); x.stroke(); E.gl(x, p.x, p.y, sz * 0.5 * g, pal.glow, 0.4 * f); }
        else { E.gl(x, p.x, p.y, sz * g, pal.glow, 0.55 * f); HD15.put(x, HD15.tex('core', pal.mid), p.x, p.y, sz * g, sz * g, 0, f); } } }); } };
  // 一整片浪從上面壓下來
  E.tide = (b, T, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 26, hh = o.h || 46; return HD15.add(b, { x: T.x, y: T.y, free: 0, delay: dl, life: dl + dur + 10, draw: (x, p, k, t) => { const s = cl(t / dur), top = -hh + (T.y + 40 + hh) * eo(s), f = 1 - cl((t - dur) / 10);
      x.globalCompositeOperation = 'lighter'; const edge = X => top + hh + Math.sin(X / 14 + t * 0.4) * 5; x.beginPath(); x.moveTo(0, top); for (let X = 0; X <= W; X += 8) x.lineTo(X, edge(X)); x.lineTo(W, top); x.closePath();
      x.globalAlpha = 0.45 * f; x.fillStyle = pal.glow; x.fill(); x.globalAlpha = 0.6 * f; x.strokeStyle = pal.mid; x.lineWidth = 6; x.beginPath(); for (let X = 0; X <= W; X += 8) x.lineTo(X, edge(X)); x.stroke();
      x.globalAlpha = f; x.strokeStyle = pal.core; x.lineWidth = 2; x.stroke(); if (t % 3 === 0 && f > 0.5) HD15.sparks(b, { x: R(0, W), y: edge(R(0, W)) }, 2, pal, { spd: 1.6, life: 12, g: 0.12 }); } }); };
  // 環繞（漩渦裡的東西）
  E.orbit = (b, C, pal, n, o = {}) => { const r0 = o.r || 40, dur = o.dur || 30, kind = o.kind || 'orb'; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, dl = (o.delay || 0) + (i % 4), sz = (o.sz || 3) * R(0.8, 1.3);
    HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { const rr = r0 * (1 - 0.7 * k), a = a0 + t * (o.spd || 0.22), X = C.x + Math.cos(a) * rr, Y = C.y + Math.sin(a) * rr * (o.fl || 0.55), f = Math.min(1, k * 5) * (1 - ei(cl((k - 0.7) / 0.3)));
      E.obj(x, kind, X, Y, sz, a * 2, pal, f); } }); } };
  // 鋸齒閃電
  E.zap = (b, A, B, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 8; return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur, draw: (x, p, k) => { const f = 1 - k, pts = [[A.x, A.y]], n = 7;
    for (let i = 1; i < n; i++) pts.push([A.x + (B.x - A.x) * i / n + R(-6, 6), A.y + (B.y - A.y) * i / n + R(-6, 6)]); pts.push([B.x, B.y]); E.stroke(x, pts, pal, o.w || 2, f); } }); };
  // 熱浪・霧：一條條橫的光帶往上飄
  E.haze = (b, T, pal, o = {}) => { for (let i = 0; i < (o.n || 6); i++) { const dl = (o.delay || 0) + i * 3, y0 = T.y + 30 - i * 9; HD15.add(b, { x: T.x, y: y0, delay: dl, life: dl + 28, draw: (x, p, k, t) => { const f = Math.sin(k * Math.PI), w = 60 + i * 4;
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.5 * f; x.strokeStyle = pal.mid; x.lineWidth = 2; x.beginPath(); for (let X = -w; X <= w; X += 4) x.lineTo(T.x + X, y0 - k * 14 + Math.sin(X / 7 + t * 0.5) * 2.5); x.stroke(); } }); } };
  E.eyes = (b, U, pal, o = {}) => { for (const d of [-7, 7]) { HD15.flare(b, { x: U.x + d, y: U.y - (o.dy ?? 10) }, pal, 18, { rot: 0, dur: 14, delay: o.delay || 0 }); } };

  /* ---------- 共用的出手・命中 ---------- */
  E.tell = function* (b, U, pal, n = 8) { HD15.gather(b, U, 10, pal, 32, { span: 6 }); HD15.flash(b, U, pal, 24, { dur: 10 }); yield* wait(n); };
  E.hit = (b, T, pal, s = 1) => { HD15.flash(b, T, pal, 34 * s, { dur: 12 }); HD15.ring(b, T, pal, 4, 26 * s, { w: 2 * s, dur: 14 }); HD15.sparks(b, T, Math.round(8 * s), pal, { spd: 3 * s, life: 16, g: 0.1 }); HD15.stop(b, s > 1.2 ? 6 : 3); b.shake = Math.max(b.shake || 0, Math.round(4 * s)); };
  E.ground = T => ({ x: T.x, y: Math.max(T.y + 24, HERO_FOOT - 4) });
  E.sfx = n => { if (n) Sound.sfx(n); };
}

/* ---------- 動作 ---------- */
{ const E = EBX, S = EBX.S, R = (a, b) => a + Math.random() * (b - a);
  const sz = o => o.big ? 1.45 : o.small ? 0.75 : 1;
  Object.assign(S, {
    *bite(U, T, u, P, o) { const n = o.n || 1, s = sz(o); yield* this.lunge(u, 18, 3); for (let i = 0; i < n; i++) { const C = n > 1 ? { x: T.x + (i - (n - 1) / 2) * 18, y: T.y + (i % 2 ? 6 : -6) } : T; Sound.sfx(o.big ? 'heavy' : 'hit'); E.jaws(this, C, P, 16 * s, { n: o.big ? 5 : 4 }); yield* wait(8); }
      if (o.p2) HD15.sparks(this, T, 10, E.pal(o.p2), { spd: 2.4, life: 18, g: 0.1 }); E.hit(this, T, P, s); yield* wait(10); },
    *claw(U, T, u, P, o) { const s = sz(o); yield* this.lunge(u, 20, 3); Sound.sfx('slash'); HD16.claw(this, T, P, { ang: -0.9, r: 30 * s, th: 6 }); if (o.x2) { yield* wait(5); Sound.sfx('slash'); HD16.claw(this, T, P, { ang: 0.9, dir: -1, r: 30 * s, th: 6 }); } yield* wait(6); E.hit(this, T, P, s); yield* wait(10); },
    *slash(U, T, u, P, o) { const s = sz(o); if (o.blink) { HD15.flash(this, U, P, 30, { dur: 8 }); HD15.windLines(this, U, T, P, 6, { spread: 24 }); } yield* this.lunge(u, o.blink ? 40 : 22, 3); Sound.sfx(o.big ? 'bladeBig' : 'blade');
      HD15.slash(this, T, { pal: P, r: 44 * s, th: 12 * s, ang: -0.6, span: 1.7, dur: 16 }); if (o.x2) { yield* wait(5); HD15.slash(this, T, { pal: o.p2 ? E.pal(o.p2) : P, r: 44 * s, th: 12 * s, ang: 0.6, dir: -1, span: 1.7, dur: 16 }); }
      if (o.moon) HD16.moon(this, { x: T.x, y: T.y - 6 }, P, 20 * s, { dur: 24 }); yield* wait(6); E.hit(this, T, P, s); yield* wait(10); },
    *thrust(U, T, u, P, o) { const n = o.n || 1, s = sz(o); yield* this.lunge(u, 26, 3); for (let i = 0; i < n; i++) { const C = { x: T.x + (n > 1 ? (i - (n - 1) / 2) * 10 : 0), y: T.y + (n > 1 ? R(-6, 6) : 0) }; Sound.sfx(o.big ? 'spThrustBig' : 'spThrust');
        HD15.thrust(this, U, C, P, { w: 7 * s, ext: 30, dur: 12 }); yield* wait(4); HD15.flash(this, C, P, 24 * s, { dur: 8 }); if (n > 1) yield* wait(3); } yield* wait(4); E.hit(this, T, P, s); yield* wait(10); },
    *smash(U, T, u, P, o) { const s = sz(o), G = E.ground(T); yield* this.lunge(u, 24, 4); Sound.sfx(o.big ? 'axHitSuper' : 'heavy'); HD15.flash(this, T, P, 44 * s, { dur: 14 });
      HD15.cracks(this, G, 6, P, { len: 34 * s }); E.gring(this, G, P, 6, 50 * s); HD15.shards(this, T, Math.round(8 * s), { cols: [P.core, P.mid, P.edge] }); HD15.smoke(this, G, 6, { col: o.dust || '#c8b8a0', r: 30 * s, sz: 12, spd: 1, up: 0.2, life: 26 });
      if (o.gear) HD16.gear(this, T, P, 16 * s, { dur: 22, spin: 4 }); E.hit(this, T, P, s * 1.15); yield* wait(14); },
    *charge(U, T, u, P, o) { const s = sz(o); Sound.sfx('dashStep'); HD15.windLines(this, U, T, P, 8, { spread: 34, len: 46 }); if (o.ghost) for (let i = 0; i < 3; i++) HD15.flash(this, { x: U.x + (i - 1) * 26, y: U.y + 10 }, P, 26, { dur: 14, delay: i * 2 });
      yield* this.lunge(u, 44, 4); Sound.sfx('heavy'); HD15.flare(this, T, P, 46 * s, { rot: 0.4, dur: 14 }); HD15.spikes(this, T, P, 8, 34 * s); HD15.smoke(this, E.ground(T), 5, { col: o.dust || '#d0c4b0', r: 26, sz: 10, spd: 1.2, up: 0.3, life: 24 }); E.hit(this, T, P, s * 1.1); yield* wait(12); },
    *sweep(U, T, u, P, o) { const s = sz(o); yield* this.lunge(u, 14, 3); Sound.sfx('axSwing'); HD15.slash(this, { x: T.x, y: T.y + 10 }, { pal: P, r: 62 * s, th: 14 * s, ang: Math.PI / 2, dir: -1, span: 1.5, dur: 16 });
      if (o.fire) HD15.flames(this, E.ground(T), 6, P, { w: 60, h: 20 }); if (o.splash) HD15.sparks(this, T, 12, P, { spd: 3, life: 18, g: 0.18 }); yield* wait(6); E.hit(this, T, P, s); yield* wait(10); },
    *whip(U, T, u, P, o) { const s = sz(o); Sound.sfx('wind'); const n = o.n || 1; for (let i = 0; i < n; i++) E.curve(this, { x: U.x + (i - (n - 1) / 2) * 14, y: U.y + 10 }, { x: T.x + (i - (n - 1) / 2) * 12, y: T.y }, P, { bend: (i % 2 ? -1 : 1) * 34, w: (o.w || 3) * s, dur: 10, hold: 8, thorns: o.thorns, wig: o.wig, delay: i * 3 });
      yield* wait(10 + n * 3); Sound.sfx('slash'); HD15.flare(this, T, P, 30 * s, { rot: 0.3, dur: 10 }); E.hit(this, T, P, s); yield* wait(10); },
    *pincer(U, T, u, P, o) { const s = sz(o), n = o.n || 1; yield* this.lunge(u, 20, 3); for (let i = 0; i < n; i++) { Sound.sfx('axHit'); HD15.slash(this, { x: T.x - 12 * s, y: T.y }, { pal: P, r: 30 * s, th: 10 * s, ang: Math.PI, dir: 1, span: 1.6, dur: 12 }); HD15.slash(this, { x: T.x + 12 * s, y: T.y }, { pal: P, r: 30 * s, th: 10 * s, ang: 0, dir: -1, span: 1.6, dur: 12 }); yield* wait(7); }
      E.hit(this, T, P, s); yield* wait(10); },
    *sting(U, T, u, P, o) { const s = sz(o), V = E.pal(o.p2 || 'poison'); yield* this.lunge(u, 24, 3); Sound.sfx('dgHit'); HD15.thrust(this, U, T, P, { w: 3 * s, ext: 16, dur: 10 }); yield* wait(5);
      HD15.flash(this, T, V, 30 * s, { dur: 12 }); for (let i = 0; i < 8; i++) HD15.mote(this, T.x + R(-10, 10), T.y + R(-6, 6), R(-0.6, 0.6), -R(0.6, 1.6), V, { life: 22 }); E.hit(this, T, V, s); yield* wait(12); },
    *hug(U, T, u, P, o) { yield* this.lunge(u, 34, 4); Sound.sfx('heavy'); for (const d of [-1, 1]) HD15.slash(this, { x: T.x + d * 16, y: T.y }, { pal: P, r: 44, th: 14, ang: d < 0 ? Math.PI : 0, dir: d < 0 ? 1 : -1, span: 1.8, dur: 16 });
      HD15.ring(this, T, P, 40, 6, { w: 3, dur: 16 }); yield* wait(10); HD15.stop(this, 8); this.shake = 10; E.hit(this, T, P, 1.4); yield* wait(14); },
    *devour(U, T, u, P, o) { const s = sz(o); HD15.dim(this, 0.4, 44); yield* this.lunge(u, 30, 4); Sound.sfx('heavy'); E.jaws(this, T, P, 30 * s, { n: 6, close: 9 }); HD15.whirl(this, T, P, { r: 44 * s, turns: 1.5, dur: 26 }); yield* wait(12); E.hit(this, T, P, s * 1.2); yield* wait(14); },
    *spin(U, T, u, P, o) { yield* this.lunge(u, 24, 3); Sound.sfx('axSwing'); HD15.whirl(this, T, P, { r: 46, turns: 2, dur: 24 }); for (let i = 0; i < 3; i++) { HD15.slash(this, T, { pal: P, r: 40, th: 10, ang: -0.6 + i * 2.1, span: 1.5, dur: 12, delay: i * 5 }); } yield* wait(16); E.hit(this, T, P, 1.2); yield* wait(10); },
    *twelve(U, T, u, P, o) { HD15.dim(this, 0.5, 70); HD16.gear(this, T, P, 26, { dur: 60, spin: -2 }); HD15.ring(this, T, P, 30, 34, { w: 2, dur: 60 }); yield* this.lunge(u, 26, 3);
      for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i * Math.PI / 6; HD15.cut(this, { x: T.x + Math.cos(a) * 10, y: T.y + Math.sin(a) * 10 }, a + Math.PI / 2, 46, P); if (i % 2) Sound.sfx('blade'); yield* wait(2); }
      yield* wait(4); Sound.sfx('axHitSuper'); HD15.flare(this, T, P, 70, { rot: 0, dur: 18 }); E.hit(this, T, P, 1.6); yield* wait(16); },
    *swarm(U, T, u, P, o) { Sound.sfx('buzz'); HD15.motes(this, U, T, o.n || 16, P, {}); yield* wait(14); for (let i = 0; i < 6; i++) { const C = { x: T.x + R(-14, 14), y: T.y + R(-12, 10) }; HD15.flash(this, C, P, 14, { dur: 6 }); HD15.sparks(this, C, 3, P, { spd: 1.6, life: 10 }); Sound.sfx('hit'); yield* wait(3); } E.hit(this, T, P, 0.9); yield* wait(8); },
    *bolt(U, T, u, P, o) { const s = sz(o), n = o.n || 1; yield* E.tell(this, U, P); for (let i = 0; i < n; i++) { Sound.sfx(o.snd || 'stBolt'); HD15.comet(this, { x: U.x + (n > 1 ? (i - (n - 1) / 2) * 14 : 0), y: U.y + 6 }, { x: T.x + (n > 1 ? (i - (n - 1) / 2) * 8 : 0), y: T.y }, P, 12, { w: 8 * s }); yield* wait(n > 1 ? 4 : 0); }
      yield* wait(12); HD15.flare(this, T, P, 40 * s, { rot: 0.3, dur: 14 }); E.hit(this, T, P, s); yield* wait(10); },
    *lob(U, T, u, P, o) { const s = sz(o), n = o.n || 1, V = o.p2 ? E.pal(o.p2) : P; if (!o.quick) yield* E.tell(this, U, P, 6); Sound.sfx('wind');
      for (let i = 0; i < n; i++) E.lob(this, { x: U.x, y: U.y + 4 }, { x: T.x + (n > 1 ? (i - (n - 1) / 2) * 12 : 0), y: T.y }, P, { dur: o.dur || 16, h: o.h ?? 34, r: (o.r || 5) * s, kind: o.kind || 'orb', delay: i * 4 });
      yield* wait((o.dur || 16) + (n - 1) * 4); Sound.sfx(o.snd || 'hitSuper'); HD15.flash(this, T, V, 40 * s, { dur: 12 }); HD15.sparks(this, T, 10, V, { spd: 2.6, life: 18, g: 0.16 });
      if (o.smoke) HD15.smoke(this, T, 6, { col: o.smoke, r: 24 * s, sz: 12, spd: 0.8, up: 0.3, life: 28 }); E.hit(this, T, V, s); yield* wait(10); },
    *beam(U, T, u, P, o) { const s = sz(o); HD15.dim(this, o.big ? 0.45 : 0.25, 44); yield* E.tell(this, U, P, 12); Sound.sfx(o.snd || 'mana');
      if (o.prism) { const C = [E.pal('crystal'), E.pal('pink'), E.pal('gold')]; C.forEach((c, i) => E.beam(this, { x: U.x + (i - 1) * 8, y: U.y }, { x: T.x + (i - 1) * 6, y: T.y }, c, { w: 6 * s, dur: 24, delay: i * 2 })); }
      else E.beam(this, U, T, P, { w: 10 * s, dur: 24 }); yield* wait(10); HD15.flare(this, T, P, 50 * s, { rot: 0, dur: 16 }); E.hit(this, T, P, s); yield* wait(14); },
    *breath(U, T, u, P, o) { const s = sz(o); if (o.big) HD15.dim(this, 0.4, 50); yield* E.tell(this, U, P, 8); Sound.sfx(o.snd || 'fire'); E.cone(this, { x: U.x, y: U.y + 8 }, T, P, Math.round(26 * s), { kind: o.kind || 'flame', span: 20, sz: 10 * s });
      yield* wait(18); if (o.kind !== 'bubble' && o.kind !== 'cloud') HD15.flames(this, E.ground(T), 7, P, { w: 60 * s, h: 22 * s }); E.hit(this, T, P, s); yield* wait(12); },
    *rain(U, T, u, P, o) { const s = sz(o), n = Math.round((o.n || 12) * s); if (o.big) HD15.dim(this, 0.4, 50); yield* E.tell(this, U, P, 6); Sound.sfx(o.snd || 'wind');
      E.fall(this, T, P, n, { kind: o.kind || 'spike', r: (o.r || 4) * s, spread: 34 * s, gap: 2 }); yield* wait(12 + n * 2); Sound.sfx(o.big ? 'quake' : 'hitSuper'); if (o.quake) { HD15.cracks(this, E.ground(T), 6, P, { len: 40 }); this.shake = 12; } E.hit(this, T, P, s * 1.1); yield* wait(12); },
    *quake(U, T, u, P, o) { const s = sz(o), G = E.ground(T); Sound.sfx('quake'); this.shake = Math.round(14 * s); HD15.cracks(this, G, 8, P, { len: 44 * s }); E.gring(this, G, P, 6, 70 * s, { dur: 22 }); E.gring(this, G, P, 6, 50 * s, { dur: 18, delay: 6 });
      if (o.spikes) HD17.spikes(this, G, P, { n: 5, spread: 0.4 }); if (o.roots) for (let i = 0; i < 4; i++) E.curve(this, { x: G.x + (i - 1.5) * 18, y: G.y + 6 }, { x: G.x + (i - 1.5) * 10, y: T.y - 24 }, P, { bend: (i % 2 ? 1 : -1) * 10, w: 4, dur: 8, hold: 12, thorns: 1, delay: 3 + i * 2 });
      if (o.ring) for (let i = 0; i < 3; i++) HD15.ring(this, U, P, 10, 90, { w: 2, dur: 18, delay: i * 5 }); HD15.smoke(this, G, 8, { col: o.dust || '#c8b8a0', r: 44 * s, sz: 12, spd: 1.2, up: 0.3, life: 28 }); yield* wait(14); E.hit(this, T, P, s); yield* wait(12); },
    *tide(U, T, u, P, o) { const s = sz(o); if (o.big) HD15.dim(this, 0.45, 56); yield* E.tell(this, U, P, 8); Sound.sfx('water'); if (o.notes) for (let i = 0; i < 5; i++) HD16.note(this, U, T, E.pal('song16'), { delay: i * 3 });
      if (o.moon) HD16.moon(this, { x: T.x, y: T.y - 70 }, E.pal('moon'), 22, { dur: 40 }); E.tide(this, T, P, { dur: o.big ? 30 : 24, h: 46 * s }); yield* wait(o.big ? 26 : 20); Sound.sfx('water'); HD15.sparks(this, T, 14, P, { spd: 3.2, life: 20, g: 0.18 }); E.hit(this, T, P, s); yield* wait(12); },
    *vortex(U, T, u, P, o) { const s = sz(o); if (o.big) HD15.dim(this, 0.45, 56); yield* E.tell(this, U, P, 6); Sound.sfx(o.snd || 'wind'); HD15.whirl(this, T, P, { r: 46 * s, turns: 2.4, dur: 32 }); HD15.whirl(this, T, P, { r: 30 * s, turns: 2, dur: 28, delay: 4, rev: 1 });
      E.orbit(this, T, o.p2 ? E.pal(o.p2) : P, Math.round(12 * s), { r: 48 * s, dur: 32, kind: o.kind || 'orb', sz: o.r || 3 }); if (o.fall) E.fall(this, T, P, 8, { kind: o.fall, r: 3, gap: 3 }); if (o.blades) for (let i = 0; i < 4; i++) HD15.slash(this, T, { pal: P, r: 36, th: 8, ang: i * Math.PI / 2, span: 1.4, dur: 12, delay: 6 + i * 4 });
      yield* wait(24); E.hit(this, T, P, s); yield* wait(12); },
    *burst(U, T, u, P, o) { const s = sz(o); if (o.big) HD15.dim(this, 0.4, 44); yield* E.tell(this, U, P, 8); Sound.sfx(o.snd || 'hitSuper'); HD15.flash(this, T, P, 56 * s, { dur: 16 }); HD15.ring(this, T, P, 6, 50 * s, { w: 3, dur: 16 }); HD15.ring(this, T, P, 4, 32 * s, { w: 2, dur: 12, delay: 4 });
      HD15.spikes(this, T, P, 10, 40 * s); if (o.shards) HD15.shards(this, T, 10, { cols: [P.core, P.mid, P.edge] }); if (o.smoke) HD15.smoke(this, T, 8, { col: o.smoke, r: 34 * s, sz: 14, spd: 1.2, up: 0.4, life: 30 }); yield* wait(8); E.hit(this, T, P, s * 1.1); yield* wait(12); },
    *nova(U, T, u, P, o) { yield* E.tell(this, U, P, 8); Sound.sfx(o.snd || 'mana'); for (let i = 0; i < 3; i++) HD15.ring(this, U, P, 8, 150, { w: 3 - i * 0.6, dur: 22, delay: i * 4 }); if (o.flakes) for (let i = 0; i < 6; i++) HD17.flake(this, { x: T.x + R(-30, 30), y: T.y + R(-20, 10) }, P, 8, { dur: 24, delay: 8 + i * 2 });
      yield* wait(14); E.hit(this, T, P, 1); yield* wait(10); },
    *curse(U, T, u, P, o) { yield* E.tell(this, U, P, 6); Sound.sfx('arcane'); HD15.sigil(this, T, P, 28, { dur: 40 }); for (const d of [-1, 1]) E.curve(this, { x: T.x + d * 70, y: T.y - 30 }, T, P, { bend: d * 16, w: 2, dur: 12, hold: 14, wig: 3 });
      if (o.grip) { yield* wait(8); HD16.claw(this, T, P, { ang: Math.PI / 2, r: 24, th: 5 }); } yield* wait(14); for (let i = 0; i < 3; i++) HD15.chev(this, { x: T.x + (i - 1) * 10, y: T.y - 16 }, P, { rise: -0.5, delay: i * 2 }); if (o.dmg) E.hit(this, T, P, 0.9); yield* wait(12); },
    *drain(U, T, u, P, o) { yield* E.tell(this, U, P, 4); Sound.sfx('mana'); if (o.roots) for (let i = 0; i < 3; i++) E.curve(this, { x: T.x + (i - 1) * 14, y: E.ground(T).y + 6 }, { x: T.x + (i - 1) * 6, y: T.y - 6 }, E.pal('root'), { bend: 8, w: 3, dur: 8, hold: 16, delay: i * 2 });
      HD15.flash(this, T, P, 30, { dur: 12 }); yield* wait(6); HD15.motes(this, T, U, 12, P, {}); yield* wait(16); HD15.flash(this, U, E.pal('life'), 30, { dur: 12 }); E.hit(this, T, P, 0.7); yield* wait(8); },
    *cloud(U, T, u, P, o) { yield* E.tell(this, U, P, 4); Sound.sfx(o.snd || 'wind'); HD15.smoke(this, T, 9, { col: P.mid, r: 30, sz: 14, spd: 0.5, up: 0.15, life: 44 }); for (let i = 0; i < 14; i++) HD15.mote(this, T.x + R(-34, 34), T.y - R(30, 60), R(-0.3, 0.3), R(0.6, 1.1), P, { life: 34 });
      if (o.flakes) for (let i = 0; i < 5; i++) HD17.flake(this, { x: T.x + R(-26, 26), y: T.y + R(-24, 8) }, P, 6, { dur: 22, delay: 6 + i * 3 }); yield* wait(30); if (o.dmg) E.hit(this, T, P, 0.8); yield* wait(6); },
    *song(U, T, u, P, o) { Sound.sfx(o.snd || 'mana'); for (let i = 0; i < 3; i++) HD15.ring(this, U, P, 8, 70, { w: 1.6, dur: 18, delay: i * 6 }); for (let i = 0; i < 6; i++) HD16.note(this, { x: U.x + R(-10, 10), y: U.y }, { x: T.x + R(-16, 16), y: T.y + R(-10, 6) }, P, { delay: i * 3 });
      yield* wait(22); if (o.mist) HD15.smoke(this, T, 6, { col: '#d8e8f0', r: 30, sz: 14, spd: 0.4, up: 0.1, life: 36 }); HD15.ring(this, T, P, 4, 30, { w: 2, dur: 14 }); if (o.dmg) E.hit(this, T, P, 0.9); yield* wait(10); },
    *screech(U, T, u, P, o) { Sound.sfx(o.snd || 'wind'); for (let i = 0; i < 4; i++) HD15.ring(this, U, P, 10, 120, { w: 3 - i * 0.5, dur: 20, delay: i * 4 }); this.shake = 6; yield* wait(16); HD15.flash(this, T, P, 30, { dur: 10 }); for (let i = 0; i < 3; i++) HD15.chev(this, { x: T.x + (i - 1) * 10, y: T.y - 16 }, P, { rise: -0.5, delay: i * 2 }); yield* wait(12); },
    *gaze(U, T, u, P, o) { E.eyes(this, U, P); Sound.sfx('mana'); yield* wait(8); HD15.lockon(this, T, P, { dur: 26 }); yield* wait(16); HD15.flash(this, T, P, 36, { dur: 12 }); if (o.flakes) for (let i = 0; i < 6; i++) HD17.flake(this, { x: T.x + R(-20, 20), y: T.y + R(-16, 10) }, P, 7, { dur: 22, delay: i * 2 }); yield* wait(14); },
    *roar(U, T, u, P, o) { Sound.sfx(o.snd || 'statUp'); for (let i = 0; i < 3; i++) HD15.ring(this, U, P, 12, 100, { w: 4 - i, dur: 20, delay: i * 5 }); this.shake = 6; if (o.gear) HD16.gear(this, U, E.pal('brass'), 16, { dur: 28, spin: 5 });
      if (o.foe && T) { yield* wait(12); E.eyes(this, U, P); HD15.flash(this, T, P, 30, { dur: 12 }); for (let i = 0; i < 3; i++) HD15.chev(this, { x: T.x + (i - 1) * 10, y: T.y - 16 }, P, { rise: -0.5, delay: i * 2 }); }
      else for (let i = 0; i < 4; i++) HD15.chev(this, { x: U.x + (i - 1.5) * 10, y: U.y + 10 }, P, { rise: 0.8, delay: 4 + i * 2 }); yield* wait(20); },
    *guard(U, T, u, P, o) { Sound.sfx('shGuard'); const k = o.kind; if (k === 'scale') HD16.scales(this, U, P, { n: 8, r: 26 }); else if (k === 'stone') { HD17.spikes(this, { x: U.x, y: U.y + 30 }, P, { n: 6, ring: 1 }); HD15.smoke(this, { x: U.x, y: U.y + 28 }, 5, { col: '#c8b8a0', r: 30, sz: 10, life: 24 }); }
      else if (k === 'mirror') HD17.prism(this, U, P, 30); else if (k === 'veil') { HD16.moon(this, { x: U.x, y: U.y - 24 }, P, 16, { dur: 30 }); HD15.ring(this, U, P, 40, 30, { w: 1.5, dur: 30 }); } else if (k === 'vortex') HD15.whirl(this, U, P, { r: 40, turns: 2, dur: 28 });
      else if (k === 'pearl') E.orbit(this, U, P, 6, { r: 34, dur: 30, kind: 'orb', sz: 4, spd: 0.15 }); else if (k === 'fog') HD15.smoke(this, U, 10, { col: '#d8e4ec', r: 40, sz: 16, spd: 0.4, up: 0.1, life: 40 }); else HD15.flash(this, U, P, 46, { dur: 14 });
      HD15.ring(this, U, P, 44, 30, { w: 2, dur: 20 }); for (let i = 0; i < 3; i++) HD15.chev(this, { x: U.x + (i - 1) * 12, y: U.y + 8 }, P, { rise: 0.7, delay: 6 + i * 2 }); yield* wait(24); },
    *heal(U, T, u, P, o) { Sound.sfx('heal'); HD15.flash(this, U, P, 50, { dur: 16 }); for (let i = 0; i < 12; i++) HD15.mote(this, U.x + R(-20, 20), U.y + R(0, 24), 0, -R(0.6, 1.4), P, { life: 28 }); HD15.ring(this, { x: U.x, y: U.y + 20 }, P, 30, 10, { w: 2, dur: 20 }); yield* wait(22); },
    *summon(U, T, u, P, o) { Sound.sfx('mana'); for (const d of [-1, 1]) { const C = { x: U.x + d * 44, y: U.y + 20 }; HD15.sigil(this, C, P, 18, { dur: 36 }); HD15.pillar(this, C, P, 60, { w: 16, dur: 26, delay: 10 }); HD15.gather(this, C, 8, P, 24, { span: 8, delay: 4 }); } if (o.water) E.tide(this, { x: U.x, y: U.y - 40 }, P, { dur: 20, h: 30 }); yield* wait(30); },
    *pillar(U, T, u, P, o) { HD15.dim(this, 0.55, 64); yield* E.tell(this, U, P, 10); if (o.gate) HD15.sigil(this, U, P, 34, { dur: 50 }); if (o.crown) HD16.star(this, { x: U.x, y: U.y - 34 }, E.pal('gold'), 14, { n: 5, dur: 40 }); HD15.lockon(this, T, P, { dur: 24 }); yield* wait(18);
      Sound.sfx('thunder'); HD15.pillar(this, E.ground(T), P, 220, { w: 44, dur: 30 }); HD15.rays(this, E.ground(T), P, 6, 70, { dur: 30 }); if (o.tide) E.tide(this, T, E.pal('abyss'), { dur: 20, h: 40 }); yield* wait(10); HD15.flash(this, T, P, 90, { dur: 18 }); E.hit(this, T, P, 1.7); yield* wait(18); },
    *eclipse(U, T, u, P, o) { HD15.dim(this, 0.65, 74, { col: '#020008' }); Sound.sfx('arcane'); const C = { x: T.x, y: T.y - 46 }; HD15.flash(this, C, E.pal('holy'), 60, { dur: 40 }); HD16.moon(this, C, E.pal('black'), 26, { dur: 46, delay: 6 });
      HD15.ring(this, C, P, 26, 30, { w: 2, dur: 46 }); yield* wait(26); if (o.blade) { yield* this.lunge(u, 30, 3); HD15.slash(this, T, { pal: P, r: 70, th: 18, ang: -0.6, span: 1.8, dur: 18 }); Sound.sfx('bladeBig'); } else { HD15.ring(this, T, P, 6, 70, { w: 4, dur: 18 }); Sound.sfx('hitSuper'); }
      yield* wait(8); E.hit(this, T, P, 1.6); yield* wait(16); },
    *clock(U, T, u, P, o) { Sound.sfx('tick'); HD16.gear(this, T, P, 22, { dur: 34, spin: -5 }); HD15.ring(this, T, P, 32, 26, { w: 2, dur: 34 }); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; HD15.flash(this, { x: T.x + Math.cos(a) * 30, y: T.y + Math.sin(a) * 30 }, P, 8, { dur: 10, delay: i * 2 }); }
      yield* wait(24); for (let i = 0; i < 3; i++) HD15.chev(this, { x: T.x + (i - 1) * 10, y: T.y - 16 }, P, { rise: -0.5, delay: i * 2 }); yield* wait(10); },
    *freeze(U, T, u, P, o) { HD15.dim(this, 0.55, 70, { col: '#02101e' }); yield* E.tell(this, U, P, 12); Sound.sfx('mana'); HD17.flake(this, T, P, 34, { dur: 44 }); HD17.spikes(this, E.ground(T), P, { n: 8, ring: 1 }); yield* wait(22);
      HD15.flash(this, T, E.pal('white'), 100, { dur: 16 }); HD15.shards(this, T, 16, { cols: [P.core, P.mid, P.glow] }); E.hit(this, T, P, 1.7); yield* wait(18); },
    *cauldron(U, T, u, P, o) { HD15.dim(this, 0.4, 60); E.lob(this, U, T, P, { dur: 18, h: 40, r: 6, kind: 'bottle' }); yield* wait(18); Sound.sfx('poison'); HD15.pillar(this, E.ground(T), P, 90, { w: 30, dur: 30 });
      for (let i = 0; i < 18; i++) HD15.mote(this, T.x + R(-24, 24), E.ground(T).y, R(-0.3, 0.3), -R(1, 2.2), i % 2 ? P : E.pal('toxic'), { life: 30 }); HD15.smoke(this, T, 8, { col: '#8ac05a', r: 34, sz: 14, spd: 0.8, up: 0.5, life: 34 }); yield* wait(14); E.hit(this, T, P, 1.5); yield* wait(14); },
    *haze(U, T, u, P, o) { Sound.sfx('fire'); E.haze(this, T, P, { n: 7 }); HD15.flash(this, T, P, 50, { dur: 30 }); yield* wait(26); for (let i = 0; i < 3; i++) HD15.chev(this, { x: T.x + (i - 1) * 10, y: T.y - 16 }, P, { rise: -0.5, delay: i * 2 }); yield* wait(10); },
    *zap(U, T, u, P, o) { Sound.sfx('thunder'); if (o.at) { for (let i = 0; i < 4; i++) E.zap(this, { x: T.x + R(-20, 20), y: T.y - 24 }, { x: T.x + R(-12, 12), y: T.y + R(-4, 12) }, P, { delay: i * 3 }); } else { for (let i = 0; i < 3; i++) E.zap(this, U, T, P, { delay: i * 3 }); } yield* wait(12); E.hit(this, T, P, o.at ? 0.6 : 0.9); yield* wait(8); },
  }); }

/* ---------- 216 招：動作＋顏色（照名字） ---------- */
EBX.T = { // id: '動作 顏色 選項…'（選項：big small n=3 x2 kind=rock p2=顏色 …）
  m_bite: 'bite fang', m_howl: 'roar feral snd=wind', m_pounce: 'claw feral', m_rend: 'claw blood x2', m_warRoar: 'roar blood snd=wind',
  m_thornVine: 'whip thorn n=2 thorns=1', m_rootLeech: 'drain leaf roots=1', m_sleepPollen: 'cloud pink', m_thornRain: 'rain thorn kind=spike n=14', m_vineLash: 'whip thorn thorns=1 w=4 big',
  m_jaw: 'bite fang big', m_tailSlam: 'sweep water splash=1', m_mudShot: 'lob mud kind=orb smoke=#8a6a3a', m_scaleGuard: 'guard water kind=scale', m_tidalCrush: 'tide water',
  m_rootCrush: 'quake root roots=1', m_quake: 'quake rock spikes=1', m_mossArmor: 'guard leaf kind=scale', m_crystalShard: 'lob crystal kind=shard n=3 h=0 quick=1', m_prismRay: 'beam crystal prism=1 big',
  m_rumble: 'quake rock ring=1 big', m_boulder: 'lob rock kind=rock r=10 h=40 smoke=#b8a080', m_stoneWall: 'guard rock kind=stone', m_gutSlash: 'slash blood', m_warCry: 'roar blood snd=wind',
  m_dirtyKick: 'smash feral small', m_knife: 'slash feral small', m_darkSlash: 'slash dark', m_boneShield: 'smash bone', m_deathCry: 'roar ghost snd=wind',
  m_rattle: 'screech bone', m_curseGrip: 'curse dark grip=1 dmg=1', m_spearRush: 'thrust feral n=3', m_spearThrust: 'thrust bone', m_tidalSpear: 'thrust water big',
  m_moonSlash: 'slash moon moon=1', m_arcaneBolt: 'bolt arcane', m_blinkStrike: 'slash dark blink=1', m_eclipse: 'eclipse dark', m_feint: 'slash dark x2 blink=1',
  m_tidalWave: 'tide water', m_wyrmBite: 'bite fang big p2=water', m_waterBomb: 'lob water kind=orb r=7', m_moonTide: 'tide moon moon=1 big', m_gateBeam: 'beam gate',
  m_gateCrush: 'smash gate big', m_gateJudgment: 'pillar gate gate=1', m_dominate: 'roar dark foe=1', m_hornBash: 'charge rock', m_rhinoRush: 'charge rock big',
  m_sandTomb: 'vortex sand kind=orb r=2', m_wormBite: 'devour sand', m_devour: 'devour sand big', m_curseMark: 'curse dark', m_toxicBrew: 'lob toxic kind=bottle p2=poison smoke=#8ac05a',
  m_witchBolt: 'bolt toxic', m_cauldron: 'cauldron poison', m_tripleBite: 'bite fang n=3', m_venomSpray: 'breath poison kind=cloud snd=poison', m_mudBomb: 'lob mud kind=orb r=8 smoke=#7a5a2a',
  m_hydraFlood: 'tide toxic big', m_throwDagger: 'lob silk kind=knife n=3 h=0 quick=1 dur=10', m_featherStorm: 'vortex feather kind=feather r=4 big blades=1', m_crownBash: 'smash gold', m_ratSwarm: 'summon mud',
  m_plagueBite: 'bite fang p2=poison', m_kingsFeast: 'devour poison big', m_tuskCharge: 'charge feral', m_boarRush: 'charge feral big', m_scytheSweep: 'sweep wither big',
  m_seedBomb: 'lob leaf kind=seed n=3 r=4', m_harden: 'guard rock', m_harvest: 'eclipse gold blade=1', m_windUp: 'roar brass gear=1 snd=tick', m_gearShot: 'lob brass kind=gear r=6 h=10',
  m_chronoLance: 'thrust brass big', m_sunder: 'smash feral', m_gearCrush: 'smash brass big gear=1', m_steamBurst: 'burst steam smoke=#f0f0f4', m_timeWarp: 'clock brass',
  m_twelveStrike: 'twelve brass', m_iceFist: 'smash ice dust=#e8f4ff', m_bearHug: 'hug feral', m_frostCurse: 'curse ice dmg=1', m_iceShard: 'lob ice kind=spike h=0 r=6 dur=12',
  m_hex: 'curse arcane', m_blizzard: 'vortex ice kind=orb r=2 fall=spike big snd=wind', m_frozenGaze: 'gaze ice flakes=1', m_iceMirror: 'guard ice kind=mirror', m_absoluteZero: 'freeze ice',
  m_flameBreath: 'breath fire', m_heatHaze: 'haze fire', m_infernoBreath: 'breath fire big', m_dragonRoar: 'roar fire foe=1 snd=wind', m_magmaFist: 'smash lava big dust=#5a3a2a',
  m_eruption: 'rain lava kind=rock r=6 big quake=1 snd=fire', m_riftCharge: 'charge dark big ghost=1', m_shadowBolt: 'bolt dark', m_demonClaw: 'claw dark big x2', m_tyranny: 'pillar dark crown=1',
  m_shadowSlash: 'slash black big', m_darkPulse: 'nova dark', m_eclipseBlade: 'eclipse black blade=1', m_holyRay: 'beam holy', m_starfall: 'rain star kind=star r=5',
  m_cometLance: 'pillar star', m_millGrind: 'smash rock', m_blackGust: 'vortex feather kind=feather r=3', m_millStorm: 'vortex wind blades=1 big', m_whiskerLash: 'whip water w=3 wig=3',
  m_blackTide: 'tide abyss', m_mapleStorm: 'vortex maple kind=feather r=4', m_crystalHorn: 'charge crystal', m_legionCharge: 'charge ghost ghost=1', m_crabHammer: 'smash water big',
  m_goo: 'lob mud kind=orb r=7 smoke=#6a8a5a', m_golemFist: 'smash rock big', m_axeSpin: 'spin feral', m_soulSip: 'drain ghost', m6_sporeMist: 'cloud leaf',
  m_tongue: 'whip pink w=5 small', m_croak: 'screech leaf snd=water', m6_scaleRoll: 'charge rock big', m_roll: 'charge rock small', m_claw: 'claw feral',
  m6_crystalClaw: 'pincer crystal n=2', m_bubbleSpit: 'breath water kind=bubble snd=water', m6_rootWeb: 'whip root n=3 thorns=1', m_silkShot: 'whip silk w=2', m6_sandStorm: 'vortex sand kind=orb r=2 big',
  m_rockfall: 'rain rock kind=rock r=6 quake=1 snd=quake', m_harpyCry: 'screech wind', m6_lunarTide: 'tide moon moon=1', m_moonBeam: 'beam moon', m_chillMist: 'cloud ice flakes=1 dmg=1',
  m6_mudCoil: 'vortex mud kind=orb r=3', m_whirlpool: 'vortex water kind=orb r=2', m6_cavein: 'rain rock kind=rock r=7 big quake=1 snd=quake', m_hornCharge: 'charge feral', m_carapace: 'guard rock kind=scale',
  m_swarm: 'swarm feral', m6_breach: 'smash gold big', m_wail: 'screech ghost', m6_berserk: 'roar blood snd=wind', m6_callSwarm: 'swarm mud n=24',
  m_acidSpit: 'lob poison kind=orb r=5 smoke=#9ac05a', m6_iceTusk: 'charge ice', m_frostFang: 'bite ice', m6_eruptSpray: 'breath lava', m_scorch: 'breath fire',
  m_sting: 'sting feral', m_buzzShock: 'zap volt', m_static: 'zap volt at=1', m_capBonk: 'smash feral small', m_poisonSpore: 'cloud poison snd=poison',
  m_toxicCloud: 'cloud poison dmg=1 snd=poison', m_ghostFire: 'bolt ghost n=3 snd=fire', m_rootBind: 'whip root n=2 thorns=1', m_branchSlam: 'smash root', m_witherBreath: 'breath wither kind=cloud',
  m_toxicSludge: 'tide toxic', m_engulf: 'devour mud small', m_blazeTail: 'sweep fire fire=1', m_flare: 'burst fire snd=fire', m_riftCall13: 'summon dark',
  m_pebbleToss: 'lob rock kind=rock r=5', m_taunt: 'roar feral foe=1 snd=wind', m13_apeQuake: 'rain rock kind=rock r=7 quake=1 snd=quake', m7_deathCharge: 'charge ghost big ghost=1', m13_hellLance: 'thrust dark big',
  m7_pumpkinFire: 'bolt fire snd=fire', m_emberSpit: 'bolt fire small snd=fire', m13_pumpkinBomb: 'lob fire kind=pumpkin r=7 smoke=#5a3a2a', m_pincerSnap: 'pincer sand', m_venomTail: 'sting feral',
  m_deathStinger: 'sting dark big', m13_doomSting: 'sting dark p2=toxic', m6_icePowder: 'cloud ice flakes=1 dmg=1', m_moonDust: 'cloud moon dmg=1', m13_moonPowder: 'cloud ice flakes=1 dmg=1',
  m_avalanche: 'rain ice kind=rock r=7 big quake=1 snd=quake', m13_bigAvalanche: 'rain ice kind=rock r=8 big n=18 quake=1 snd=quake', m6_shardBurst: 'lob rock kind=shard n=4 h=0 quick=1 dur=10', m_overheat: 'burst fire big snd=fire', m13_coreBurst: 'burst lava big shards=1 snd=fire',
  m_boneClub: 'smash bone', m13_warOrder: 'roar dark snd=wind', m_frostNova: 'nova ice flakes=1', m13_songWave: 'tide water notes=1', m13_mistSong: 'song moon mist=1',
  m13_drownCall: 'summon abyss water=1', m13_denseFog: 'guard ice kind=fog', m13_maelstrom: 'vortex abyss big kind=orb r=3', m13_moonRain: 'rain moon kind=orb r=3 n=16', m_lullaby: 'song moon',
  m13_moonVeil: 'guard moon kind=veil', m13_eclipse: 'eclipse moon', m13_shardBurst: 'burst ice shards=1', m13_mirrorWall: 'guard ice kind=mirror', m13_iceFall: 'rain ice kind=spike r=7 big n=14 quake=1',
  m14_kingClaw: 'pincer water big', m14_ghostLamp: 'beam ghost big snd=fire', m14_halberd: 'thrust water', m14_abyssWave: 'tide abyss', m14_vortexWall: 'guard water kind=vortex',
  m14_judgment: 'pillar abyss tide=1', m14_callTide: 'summon water water=1', m15_lanceCharge: 'charge water big', m15_blackTide: 'tide abyss big notes=1', m6_regen: 'heal life',
  m15_trident: 'thrust water n=3', m15_tidalWave: 'tide water big', m15_pearlShield: 'guard pearl kind=pearl', m15_maelstrom: 'vortex abyss big kind=orb r=4 blades=1', m15_callLancer: 'summon water',
  m15_wrath: 'roar water snd=wind',
};
{ const E = EBX, parse = s => { const [shape, pal, ...rest] = s.split(' '), o = { shape, pal }; for (const r of rest) { const [k, v] = r.split('='); o[k] = v == null ? 1 : isNaN(+v) ? v : +v; } return o; };
  E.isEB = s => !!(s && !s.hero && (s.elite || s.boss));
  E.play = function* (id, U, T, u, t) { const o = parse(EBX.T[id]), P = E.pal(o.pal), f = E.S[o.shape]; if (!f) return; const F0 = HD15.forceW; HD15.forceW = false;
    try { if (!T) T = { x: U.x, y: U.y + 70 }; yield* f.call(this, U, T, u, P, o); } finally { HD15.forceW = F0; } };
  E.ok = () => EBX18.live && typeof HD15 !== 'undefined' && HD15.on;
  for (const id0 in EBX.T) for (const id of [id0, 'hc_' + id0]) { const D = DEF.skills[id]; if (!D) { if (id === id0) bvErr('ebfx18', id); continue; } const old = D.fx, key = 'ebx_' + id0;
    if (old === key) continue; EBX.old = EBX.old || {}; EBX.old[id] = old;
    FX[key] = function* (U, T, u, t) { const s = u || (this.cast && this.cast.s), Dn = this.cast && this.cast.D, o = Dn ? EBX.old[Dn.id] : old;
      if (E.ok() && E.isEB(s)) return yield* E.play.call(this, id0, U, T, s, t);
      if (!T) { const f = FX[o] && !['hit', 'buff'].includes(o) ? FX[o] : (Dn && Dn.effects.some(f => f.type === 'heal') ? FX.heal : null); if (f) yield* f.call(this, U); return; }
      if (s && !s.hero && MFX[o]) { yield* MFX.tell.call(this, U, T, s); return yield* MFX[o].call(this, U, T, s, t); }
      return yield* (FX[o] || FX.hit).call(this, U, T, u, t); };
    if (EBX18.live) D.fx = key; } }
