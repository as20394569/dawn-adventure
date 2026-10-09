/* ===================== v12.97 短刀・雙刀的新特效（高解析光效） =====================
   玩家：「接下來是刀跟雙刀的重製」→ 問了：顏色「刺客風的紫黑」、動作「照招式名稱」（名字是刺的刺、斬的斬，普攻保留刺）、
   中毒・麻痺的畫面「一起重做」。
   · 刀光是暗紫色，後面拖一道晚兩格的黑色殘影；雙刀的副手反過來（黑色刀光拖紫色殘影）。散掉時是紫色、黑色的光粒，打中時冒一小團黑煙。
   · 中毒是綠色（毒泡、毒液）、麻痺是黃色（鋸齒電光）、灼傷是橘色：異常狀態用自己的顏色。
   · v12.98：雙刀改成藍黑（主色深藍、副手黑），短刀照舊紫黑。
   · 跟劍、雙劍一樣只在特效測試版打開（選單的「新特效：開／關」），正式版還是舊特效，說好才換。 */
const DG17 = { mute: 0 };
DG17.KINDS = ['短刀', '雙刀'];
DG17.isK = k => DG17.KINDS.includes(k);
DG17.kind = () => typeof wKind12 === 'function' && Game.st ? wKind12(Game.st) : null;
// v12.98 雙刀改成藍黑（玩家：「雙刀特效改藍黑雙色」）：雙刀的招播放時 DG17.blue＝true，主色從紫換成深藍；短刀照舊紫黑
HD15.P.dblue = { core: '#eef6ff', mid: '#3a8cff', glow: '#1a3fd0', edge: '#06123a' };
DG17.blue = false;
DG17.P = () => [DG17.blue ? HD15.P.dblue : HD15.P.shade, HD15.P.black];
DG17.gc = () => DG17.blue ? ['#80b8ff', '#0a1830'] : ['#b080ff', '#2a1838'];   // 殘影（主角剪影）的亮色、暗色
DG17.force = on => { HD15.forceW = !!on; HD15.forceP = on ? DG17.P()[0] : null; };
DG17.foes = b => b.foes ? b.foes().filter(v => !v.gone && v.hp > 0) : [];
DG17.vAt = (b, T) => { let best = null, d0 = 1e9; for (const v of DG17.foes(b)) { const c = b.center(v), d = Math.hypot(c.x - T.x, c.y - T.y); if (d < d0) { d0 = d; best = v; } } return best; };
DG17.has = (b, T, id) => { const v = DG17.vAt(b, T); return !!(v && v.st && v.st[id]); };
DG17.tu = (b, t) => { const v = t && t.id ? t : b.tgtV; return v && b.core && b.core.byId[v.id]; };
DG17.later = (b, n, fn) => HD15.add(b, { x: 0, y: 0, life: n + 2, draw: () => {}, upd: p => { if (!p.fired && p.t >= n) { p.fired = 1; fn(); } } });
// 一刀：紫色刀光＋晚兩格的黑色殘影（k=1：黑色刀光＋紫色殘影，雙刀的副手）
DG17.cut = (b, T, d, o = {}) => { const [ang, dir] = DS16.D[d], [Pu, Bk] = DG17.P(), k = o.k || 0, tan = ang + dir * Math.PI / 2, base = Object.assign({ r: 36, th: 8, span: 1.5, dur: 16, sw: 0.25, spark: 1 }, o, { ang, dir });
  HD15.slash(b, T, Object.assign({}, base, { pal: k ? Bk : Pu }, k ? { spark: 0 } : {}));
  if (o.echo !== 0) HD15.slash(b, { x: T.x - Math.cos(tan) * 5 + 2, y: T.y - Math.sin(tan) * 5 + 3 }, Object.assign({}, base, { pal: k ? Pu : Bk, th: base.th * 0.6, r: base.r * 0.95, delay: (o.delay || 0) + 2, al: 0.5, spark: 0 })); };
// 刺：從對手前面 L 的地方往對手刺過去、再穿出去一點；後面跟一道黑色殘影（k=1 反過來）
DG17.stab = (b, T, o = {}) => { const [Pu, Bk] = DG17.P(), k = o.k || 0, H = b.center(b.H), an = o.ang ?? Math.atan2(T.y - H.y, T.x - H.x), ux = Math.cos(an), uy = Math.sin(an), nx = -uy, ny = ux, off = o.off || 0, L0 = o.L || 30,
    A = { x: T.x - ux * L0 + nx * off, y: T.y - uy * L0 + ny * off }, B = { x: T.x + nx * off * 0.3, y: T.y + ny * off * 0.3 };
  HD15.thrust(b, A, B, k ? Bk : Pu, { w: o.w || 5, ext: o.ext ?? 22, dur: o.dur || 14, delay: o.delay || 0 });
  if (o.echo !== 0) HD15.thrust(b, { x: A.x - ux * 4 + 2, y: A.y - uy * 4 + 2 }, { x: B.x - ux * 4 + 2, y: B.y - uy * 4 + 2 }, k ? Pu : Bk, { w: (o.w || 5) * 0.7, ext: (o.ext ?? 22) * 0.8, dur: o.dur || 14, delay: (o.delay || 0) + 2, al: 0.55 }); };
// 黑煙一小團（打中的地方冒出來）
DG17.dark = (b, T, n, dl = 0) => HD15.smoke(b, T, n, { col: DG17.blue ? '#0a1220' : '#1a1024', r: 14, spd: 0.9, sz: 7, life: 24, fl: 0.6, al: 0.75, up: 0.3, delay: dl });
// 打中的一下：紫色閃光、火花、光刺、一小團黑煙
DG17.pop = (b, T, s = 1, o = {}) => { const P = HD15.P.shade, dl = o.delay || 0; HD15.flash(b, T, P, 30 * s, { dur: 12, delay: dl }); HD15.sparks(b, T, Math.round(9 * s), P, { spd: 3 * s, life: 15, delay: dl });
  if (s >= 1) { HD15.ring(b, T, P, 3, 20 * s, { w: 1.6, dur: 12, delay: dl }); HD15.spikes(b, T, P, Math.round(6 * s), 16 * s, { rot: o.rot || 0, delay: dl }); } DG17.dark(b, T, Math.max(1, Math.round(3 * s)), dl); };
// X 斬痕往兩邊裂開：紫＋黑
DG17.xcut = (b, T, L, o = {}) => { const [Pu, Bk] = DG17.P(); HD15.cut(b, T, Math.PI / 4, L, Pu, Object.assign({ dur: 16, w: 5, gap: 4 }, o)); HD15.cut(b, T, Math.PI * 3 / 4, L, Bk, Object.assign({ dur: 16, w: 5, gap: 4 }, o)); };
// 毒霧（綠色、淡淡的、往上飄）
DG17.mist = (b, T, n = 5, dl = 0) => HD15.smoke(b, T, n, { col: '#5ab83a', r: 18, spd: 0.7, sz: 8, life: 30, fl: 0.6, al: 0.45, up: 0.2, delay: dl });
// 毒泡：綠色的泡泡往上飄、晃、最後破掉
DG17.bubbles = (b, C, n, o = {}) => { const P = HD15.P.venom; for (let i = 0; i < n; i++) { const dl = (o.delay || 0) + Math.floor(i * (o.span || 16) / n), r0 = 1.4 + Math.random() * 2, ph = Math.random() * 6;
  HD15.add(b, { x: C.x + (Math.random() - 0.5) * (o.w || 28), y: C.y + Math.random() * 14, vx: 0, vy: -(0.45 + Math.random() * 0.45), delay: dl, life: dl + 20 + Math.floor(Math.random() * 10), upd: HD15.mv,
    draw: (x, p, k, t) => { const pop = HD15.cl((k - 0.82) / 0.18), r = r0 * (0.6 + 0.4 * HD15.eo(HD15.cl(k * 4))), X = p.x + Math.sin(t * 0.4 + ph) * 0.6;
      if (pop <= 0) { HD15.put(x, HD15.tex('glow', P.glow), X, p.y, r * 4, r * 4, 0, 0.35); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 0.9; x.beginPath(); x.arc(X, p.y, r, 0, Math.PI * 2); x.fillStyle = HD15.rgba(P.mid, 0.4); x.fill(); x.lineWidth = 0.7; x.strokeStyle = P.mid; x.stroke();
        x.beginPath(); x.arc(X - r * 0.35, p.y - r * 0.35, r * 0.3, 0, Math.PI * 2); x.fillStyle = P.core; x.fill(); }
      else { x.globalCompositeOperation = 'lighter'; x.globalAlpha = 1 - pop; x.beginPath(); x.arc(X, p.y, r * (1 + pop * 1.6), 0, Math.PI * 2); x.lineWidth = 0.8; x.strokeStyle = P.mid; x.stroke(); } } }); } };
// 液滴（毒液）：往外噴、會掉下來
DG17.drops = (b, C, n, P, o = {}) => { for (let i = 0; i < n; i++) { const an = o.ang != null ? o.ang + (Math.random() - 0.5) * (o.spread ?? 1.6) : Math.random() * Math.PI * 2, v = (o.spd || 2) * (0.5 + Math.random() * 0.8), r = 1.2 + Math.random() * 1.2, dl = (o.delay || 0) + (i % 3);
  HD15.add(b, { x: C.x, y: C.y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 0.8, g: 0.16, drag: 0.97, delay: dl, life: dl + 22 + Math.floor(Math.random() * 8), upd: HD15.mv,
    draw: (x, p, k) => { const f = 1 - HD15.ei(HD15.cl((k - 0.6) / 0.4)), a = Math.atan2(p.vy, p.vx), sp = Math.hypot(p.vx, p.vy); x.globalCompositeOperation = 'source-over'; x.globalAlpha = f; x.save(); x.translate(p.x, p.y); x.rotate(a);
      x.beginPath(); x.ellipse(0, 0, r * (1 + sp * 0.35), r, 0, 0, Math.PI * 2); x.fillStyle = P.glow; x.fill(); x.beginPath(); x.ellipse(r * 0.3, -r * 0.3, r * 0.45, r * 0.3, 0, 0, Math.PI * 2); x.fillStyle = P.core; x.fill(); x.restore(); } }); } };
// 電：身上一道道鋸齒狀的黃色電光，閃個不停
DG17.zap = (b, C, n, o = {}) => { const P = HD15.P.volt, dl = o.delay || 0, dur = o.dur || 16, R = o.r || 22;
  return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { if (t % 2 && k > 0.2) return; const f = 1 - HD15.ei(HD15.cl((k - 0.4) / 0.6)); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
    for (let j = 0; j < n; j++) { const a0 = Math.random() * Math.PI * 2, a1 = a0 + Math.PI * (0.5 + Math.random() * 0.8), r0 = R * (0.3 + Math.random() * 0.7), r1 = R * (0.3 + Math.random() * 0.7), A = [p.x + Math.cos(a0) * r0, p.y + Math.sin(a0) * r0 * 0.9], B = [p.x + Math.cos(a1) * r1, p.y + Math.sin(a1) * r1 * 0.9], pts = [A];
      for (let q = 1; q < 5; q++) pts.push([A[0] + (B[0] - A[0]) * q / 5 + (Math.random() - 0.5) * 7, A[1] + (B[1] - A[1]) * q / 5 + (Math.random() - 0.5) * 7]); pts.push(B);
      for (const [col, lw, al] of [[P.glow, 3.2, 0.45], [P.mid, 1.3, 0.95], [P.core, 0.5, 1]]) { x.beginPath(); pts.forEach(([u, v], q) => q ? x.lineTo(u, v) : x.moveTo(u, v)); x.globalAlpha = al * f; x.strokeStyle = col; x.lineWidth = lw; x.stroke(); } }
    HD15.put(x, HD15.tex('glow', P.glow), p.x, p.y, R * 2.4, R * 2.4, 0, 0.35 * f); } }); };
// 花瓣（旋花飛刃）：淡紫、粉紅的小橢圓，邊轉邊飄
DG17.petal = (b, x0, y0, vx, vy) => { const c = DG17.blue ? (Math.random() < 0.5 ? '#bfe0ff' : '#ffffff') : (Math.random() < 0.5 ? '#d9b8ff' : '#ff9ad8'), s = 1.6 + Math.random() * 1.4; HD15.add(b, { x: x0, y: y0, vx, vy, drag: 0.95, g: 0.01, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3, life: 26 + Math.floor(Math.random() * 10), upd: HD15.mv,
  draw: (x, p, k) => { const f = 1 - HD15.ei(HD15.cl((k - 0.5) / 0.5)); x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.rot * 2))); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 0.9 * f; x.beginPath(); x.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2); x.fillStyle = c; x.fill(); x.restore(); } }); };
// 飛刃：旋轉的四刃小刀沿著弧線飛過去，後面拖著花瓣；到了呼叫 onHit
DG17.fly = (b, A, B, k, dur, o = {}) => { const P = DG17.P()[k ? 1 : 0], dl = o.delay || 0, bend = o.bend ?? 30; let hit = false;
  return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur + 2, rot: 0,
    upd: p => { const t = p.t - dl; if (t < 0) return; const e = HD15.cl(t / dur), mx = (A.x + B.x) / 2 + (o.side || 1) * bend, my = (A.y + B.y) / 2 - bend * 0.4;
      p.x = (1 - e) * (1 - e) * A.x + 2 * (1 - e) * e * mx + e * e * B.x; p.y = (1 - e) * (1 - e) * A.y + 2 * (1 - e) * e * my + e * e * B.y; p.rot += 0.55;
      if (t % 2 === 0 && e < 1) DG17.petal(b, p.x, p.y, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6 - 0.2); if (e >= 1 && !hit) { hit = true; if (o.onHit) o.onHit(); } },
    draw: (x, p, k, t) => { if (t > dur) return; const s = o.s || 6; HD15.put(x, HD15.tex('glow', P.glow), p.x, p.y, s * 3.4, s * 3.4, 0, 0.55); x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      for (let j = 0; j < 4; j++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(0, 0); x.lineTo(s * 0.35, -s * 0.25); x.lineTo(s, 0); x.lineTo(s * 0.35, s * 0.25); x.closePath(); x.fillStyle = P.mid; x.fill(); x.lineWidth = 0.5; x.strokeStyle = P.edge; x.stroke(); }
      x.beginPath(); x.arc(0, 0, s * 0.18, 0, Math.PI * 2); x.fillStyle = P.core; x.fill(); x.restore(); } }); };
// 殘影穿梭：一道細長的殘影從 A 衝到 B（紫色是光、黑色是影子）
DG17.dash = (b, A, B, k, o = {}) => { const P = DG17.P()[k ? 1 : 0], dl = o.delay || 0, dur = o.dur || 8, an = Math.atan2(B.y - A.y, B.x - A.x), L = Math.hypot(B.x - A.x, B.y - A.y);
  return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur + 8, draw: (x, p, k2, t) => { const head = HD15.eo(HD15.cl(t / dur)), tail = HD15.ei(HD15.cl((t - 3) / (dur + 2))), f = 1 - HD15.cl((t - dur) / 8); if (head - tail < 0.01) return;
    const hx = A.x + (B.x - A.x) * head, hy = A.y + (B.y - A.y) * head, tx = A.x + (B.x - A.x) * tail, ty = A.y + (B.y - A.y) * tail, cx = (hx + tx) / 2, cy = (hy + ty) / 2, len = L * (head - tail);
    if (P.dark) { x.save(); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 0.8 * f; x.translate(cx, cy); x.rotate(an); x.beginPath(); x.ellipse(0, 0, Math.max(1, len / 2), 2.4, 0, 0, Math.PI * 2); x.fillStyle = '#0a0612'; x.fill(); x.lineWidth = 0.5; x.strokeStyle = P.edge; x.stroke(); x.restore(); }
    else { HD15.put(x, HD15.tex('streak', P.glow), cx, cy, len * 1.1, 10, an, 0.6 * f); HD15.put(x, HD15.tex('streak', P.mid), cx, cy, len, 4, an, f); } } }); };
// 獠牙：一根彎彎的大牙（上顎朝下、下顎朝上），從外面一口咬合到 C；紫色的牙尖最亮，黑色的牙有一圈淡淡的亮邊
DG17.fang = (b, C, up, k, o = {}) => { const P = DG17.P()[k ? 1 : 0], L = o.L || 30, Wb = o.w || 12, R = o.R || 40, dur = o.dur || 26, ci = o.close || 6, dl = o.delay || 0, rot0 = (up ? Math.PI : 0) + (o.tilt || 0) * (up ? -1 : 1);
  return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + dur, draw: (x, p, k2, t) => { const c = HD15.ei(HD15.cl(t / ci)), off = R * (1 - c) - 3, f = t < ci + 8 ? 1 : 1 - HD15.cl((t - ci - 8) / Math.max(1, dur - ci - 8));
    x.save(); x.translate(p.x, p.y); x.rotate(rot0); x.translate(0, -off);
    const sh = () => { x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-Wb * 0.7, -L * 0.45, -Wb / 2, -L); x.lineTo(Wb / 2, -L); x.quadraticCurveTo(Wb * 0.25, -L * 0.5, 0, 0); x.closePath(); };
    x.globalAlpha = f; x.globalCompositeOperation = 'lighter'; sh(); x.lineJoin = 'round'; x.lineWidth = 5; x.strokeStyle = HD15.rgba(P.glow, 0.5); x.stroke();
    x.globalCompositeOperation = 'source-over'; const G = x.createLinearGradient(0, -L, 0, 0);
    if (k) { G.addColorStop(0, '#2a2238'); G.addColorStop(0.6, '#0e0c16'); G.addColorStop(1, '#000000'); } else { G.addColorStop(0, HD15.rgba(P.edge, 0.95)); G.addColorStop(0.55, HD15.rgba(P.mid, 1)); G.addColorStop(1, HD15.rgba(P.core, 1)); }
    sh(); x.fillStyle = G; x.fill(); x.lineWidth = 0.9; x.strokeStyle = k ? 'rgba(201,204,216,0.9)' : HD15.rgba(P.core, 0.7); x.stroke(); x.restore();
    if (t <= ci + 1) HD15.put(x, HD15.tex('glow', P.glow), p.x, p.y + (up ? off : -off), 14, 14, 0, 0.6 * f); } }); };
// 分段刺入：刀光從 A 往 B 刺進去，一頓一頓分三段推進（每段刀尖閃一下、迸出火花），插著停一下，再整根往刀尖收掉
DG17.plunge = (b, A, B, k, o = {}) => { const P = DG17.P()[k ? 1 : 0], dl = o.delay || 0, steps = o.steps || [0.45, 0.75, 1.06], gap = o.gap || 6, hold = o.hold || 10, W0 = (o.w || 6) * 0.6, n = steps.length, dur = n * gap + hold + 10,
    dx = B.x - A.x, dy = B.y - A.y, D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D, nx = -uy, ny = ux;
  const ext = t => { let L = 0; for (let i = 0; i < n; i++) { const t0 = i * gap; if (t < t0) break; const prev = i ? steps[i - 1] : 0; L = prev + (steps[i] - prev) * HD15.eo(HD15.cl((t - t0) / 2)); } return L * D; };
  return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur,
    upd: p => { const t = p.t - dl; if (t >= 0 && t % gap === 2 && t / gap < n) { const L = ext(t), C = { x: A.x + ux * L, y: A.y + uy * L }; HD15.flash(b, C, P, 18, { dur: 7 }); HD15.sparks(b, C, 3, DG17.P()[0], { ang: Math.atan2(uy, ux), spread: 1.4, spd: 2.4, life: 10 }); if (o.onStep) o.onStep(Math.floor(t / gap)); } },
    draw: (x, p, k2, t) => { const tip = ext(t), out = HD15.cl((t - n * gap - hold) / 10), tail = tip * 0.92 * HD15.ei(out), f = 1 - 0.6 * out; if (tip - tail < 1) return;
      const Pt = (d, sd) => [A.x + ux * d + nx * sd, A.y + uy * d + ny * sd], shape = (w, tl) => { const t1 = Math.max(tail, tip - tl); x.beginPath(); let q = Pt(tail, 0); x.moveTo(q[0], q[1]); q = Pt(t1, w); x.lineTo(q[0], q[1]); q = Pt(tip, 0); x.lineTo(q[0], q[1]); q = Pt(t1, -w); x.lineTo(q[0], q[1]); x.closePath(); };
      const grad = (c, a) => { const [ax, ay] = Pt(tail, 0), [bx, by] = Pt(tip, 0), G = x.createLinearGradient(ax, ay, bx, by); G.addColorStop(0, HD15.rgba(c, 0)); G.addColorStop(0.6, HD15.rgba(c, a * 0.6)); G.addColorStop(1, HD15.rgba(c, a)); return G; };
      x.globalAlpha = f; x.globalCompositeOperation = 'lighter'; shape(W0 * 2, 16); x.fillStyle = grad(P.glow, 0.5); x.fill();
      x.globalCompositeOperation = 'source-over'; shape(W0, 13); x.fillStyle = grad(P.edge, 0.8); x.fill(); shape(W0 * 0.78, 12); x.fillStyle = grad(P.mid, 0.95); x.fill(); shape(W0 * 0.3, 10); x.fillStyle = grad(P.core, 1); x.fill(); } }); };
// 月影雙斬用：月光色（淡紫白）；滿月（背景的一輪月亮，邊緣柔光）；半圈的月牙刀光（左半圈或右半圈，中間最粗、上下尖，從一頭畫到另一頭；burst 後往外散開）
HD15.P.lunar = { core: '#ffffff', mid: '#e6dcff', glow: '#8a6cff', edge: '#2a1a5a', keep: 1 };
DG17.fullMoon = (b, C, R, dur) => HD15.add(b, { x: C.x, y: C.y, life: dur, draw: (x, p, k) => { const f = (k < 0.12 ? k / 0.12 : 1 - HD15.ei(HD15.cl((k - 0.75) / 0.25)));
  HD15.put(x, HD15.tex('glow', '#8a6cff'), p.x, p.y, R * 5, R * 5, 0, 0.4 * f); x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.55 * f; const G = x.createRadialGradient(p.x - R * 0.3, p.y - R * 0.3, R * 0.1, p.x, p.y, R);
  G.addColorStop(0, '#fbf8ff'); G.addColorStop(0.7, '#d8ccff'); G.addColorStop(1, '#9a86e8'); x.fillStyle = G; x.beginPath(); x.arc(p.x, p.y, R, 0, Math.PI * 2); x.fill();
  x.globalAlpha = 0.18 * f; x.fillStyle = '#6a5aa8'; for (const [cx, cy, r] of [[-0.3, 0.1, 0.22], [0.25, -0.25, 0.14], [0.2, 0.35, 0.12]]) { x.beginPath(); x.arc(p.x + cx * R, p.y + cy * R, r * R, 0, Math.PI * 2); x.fill(); } x.restore(); } });
DG17.crescent = (b, C, R, side, pal, o = {}) => { const wd = R * (o.wd || 0.42), rv = o.rv || 6, hold = o.hold || 150, N = 28;
  return HD15.add(b, { x: C.x, y: C.y, life: hold + 20, burst: 0,
    upd: p => { if (!p.burst && p.t >= hold) p.burst = 1; if (p.burst && p.bt == null) { p.bt = p.t; for (let i = 0; i < 14; i++) { const u = Math.random(), a = -Math.PI / 2 + side * Math.PI * u, r = R - wd * Math.sin(Math.PI * u) * 0.5; HD15.mote(b, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, Math.cos(a) * 1.2, Math.sin(a) * 1.2 - 0.2, pal, { life: 24 }); } } },
    draw: (x, p, k, t) => { const rev = HD15.eo(HD15.cl(t / rv)), bt = p.bt != null ? HD15.cl((t - p.bt) / 16) : 0, f = 1 - bt, sp = bt * 9; if (f <= 0 || rev <= 0.01) return;
      const u0 = o.rev ? 1 - rev : 0, u1 = o.rev ? 1 : rev, cx = p.x + side * sp, cy = p.y, W = u => wd * Math.sin(Math.PI * u) * (1 - 0.5 * bt);
      const band = (ro, ri) => { x.beginPath(); for (let i = 0; i <= N; i++) { const u = u0 + (u1 - u0) * i / N, a = -Math.PI / 2 + side * Math.PI * u; x.lineTo(cx + Math.cos(a) * ro(u), cy + Math.sin(a) * ro(u)); }
        for (let i = N; i >= 0; i--) { const u = u0 + (u1 - u0) * i / N, a = -Math.PI / 2 + side * Math.PI * u; x.lineTo(cx + Math.cos(a) * ri(u), cy + Math.sin(a) * ri(u)); } x.closePath(); };
      x.globalAlpha = f; x.lineJoin = 'round'; x.globalCompositeOperation = 'lighter'; band(() => R + 2.5, u => R - W(u) - 2.5); x.fillStyle = HD15.rgba(pal.glow, 0.45); x.fill();
      x.globalCompositeOperation = 'source-over'; band(() => R + 0.7, u => R - W(u) - 0.7); x.fillStyle = HD15.rgba(pal.edge, 0.65); x.fill(); band(() => R, u => R - W(u)); x.fillStyle = pal.mid; x.fill();
      band(u => R - W(u) * 0.12, u => R - W(u) * 0.5); x.fillStyle = pal.core; x.fill();
      if (rev < 1) { const u = o.rev ? u0 : u1, a = -Math.PI / 2 + side * Math.PI * u; HD15.put(x, HD15.tex('glow', pal.glow), cx + Math.cos(a) * R, cy + Math.sin(a) * R, 18, 18, 0, 0.7); } } }); };
// 影子：對手腳下湧上來一團黑影把牠吞掉（影葬）
DG17.gloom = (b, C, Hh, dur) => HD15.add(b, { x: C.x, y: C.y, life: dur, draw: (x, p, k) => { const e = HD15.eo(HD15.cl(k * 3)), f = 1 - HD15.ei(HD15.cl((k - 0.5) / 0.5)); x.save(); x.globalCompositeOperation = 'source-over';
  const G = x.createLinearGradient(0, p.y + 22, 0, p.y + 22 - Hh * e); const cm = DG17.blue ? '8,20,46' : '34,12,58'; G.addColorStop(0, 'rgba(10,4,18,' + (0.85 * f).toFixed(3) + ')'); G.addColorStop(0.6, 'rgba(' + cm + ',' + (0.6 * f).toFixed(3) + ')'); G.addColorStop(1, 'rgba(' + cm + ',0)');
  x.fillStyle = G; x.beginPath(); x.ellipse(p.x, p.y + 22 - Hh * e / 2, 24 * (0.6 + 0.4 * e), Math.max(1, Hh * e / 2), 0, 0, Math.PI * 2); x.fill(); x.restore(); } });

/* ---------- 中毒・麻痺（用自己的顏色，新特效開著時一律用這一套） ---------- */
// 中毒（被下毒的那一下／每回合扣血）：綠光一閃，身上冒出毒泡往上飄、破掉，幾滴毒液往下滴；被下毒時多一圈綠色的波紋和毒霧
DG17.psnFx = function* (C, apply) { const P = HD15.P.venom; if (apply) Sound.sfx('poison'); HD15.flash(this, C, P, apply ? 40 : 30, { dur: 14 }); DG17.bubbles(this, C, apply ? 14 : 10, { span: 16 });
  DG17.drops(this, { x: C.x, y: C.y + 6 }, apply ? 8 : 4, P, { ang: Math.PI / 2, spread: 1.2, spd: 1.2 }); if (apply) { HD15.ring(this, C, P, 4, 26, { w: 1.6, dur: 16 }); DG17.mist(this, C, 5); } yield* wait(apply ? 20 : 18); };
// 麻痺（被麻痺的那一下／發作不能動）：身上劈啪的黃色電光、火花；發作時多一圈電光，身體泛黃一下
DG17.parFx = function* (C, proc, v) { const P = HD15.P.volt; Sound.sfx('buzz'); HD15.flash(this, C, P, 36, { dur: 12 }); DG17.zap(this, C, proc ? 4 : 3, { r: 24, dur: proc ? 22 : 18 }); HD15.sparks(this, C, 10, P, { spd: 2.6, life: 14 });
  if (proc) { HD15.ring(this, C, P, 6, 30, { w: 1.6, dur: 14 }); if (v) { v.tint = { c: '#ffe14a', a: 0.55 }; DG17.later(this, 12, () => { if (v.tint && v.tint.c === '#ffe14a') v.tint = null; }); } this.shake = Math.max(this.shake || 0, 2); }
  yield* wait(proc ? 22 : 18); };
{ const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY, _ac = H.ACTION_CANCEL, _dm = H.DAMAGE, _et = H.EFFECT_TRIGGER;
  const run = function* (b, tag, v, g) { b.hd16st = tag; b.hd16v = v; try { return yield* g; } finally { b.hd16st = null; b.hd16v = null; } };
  H.STATUS_APPLY = function* (e, s, t, P) { const id = P && P.status; if (HD15.on && t && P && !P.failed && !P.cleared && (id === 'psn' || id === 'par')) return yield* run(this, id, t, _ap.call(this, e, s, t, P)); return yield* _ap.call(this, e, s, t, P); };
  H.ACTION_CANCEL = function* (e, s, t, P) { if (HD15.on && s && P && P.why === 'par') return yield* run(this, 'parProc', s, _ac.call(this, e, s, t, P)); return yield* _ac.call(this, e, s, t, P); };
  H.EFFECT_TRIGGER = function* (e, s, t, P) { this.hd16dot = P && P.status; return yield* _et.call(this, e, s, t, P); };
  H.DAMAGE = function* (e, s, t, P) { if (HD15.on && t && P && P.kind === 'dot' && this.hd16dot === 'psn') { this.hd16dot = null; return yield* run(this, 'psnTick', t, _dm.call(this, e, s, t, P)); } return yield* _dm.call(this, e, s, t, P); };
  const _pf = FX.psnFx; FX.psnFx = function* (U, T) { const st = this.hd16st; if (HD15.on && (st === 'psn' || st === 'psnTick') && !this.hd15bleed) return yield* DG17.psnFx.call(this, T || U, st === 'psn'); return yield* _pf.call(this, U, T); };
  const _sk = FX.spark; FX.spark = function* (U, T) { const st = this.hd16st; if (HD15.on && (st === 'par' || st === 'parProc')) return yield* DG17.parFx.call(this, T || U, st === 'parProc', this.hd16v); return yield* _sk.call(this, U, T); };
  const _sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { if (DG17.mute || (this.hd16st === 'par' && p && p.k === 'uifx')) return p; return _sp.call(this, p); }; }

/* ---------- 短刀的 8 招＋絕技＋奧義 ---------- */
const HDFX17 = {
  // 毒風斬（2 段，每段 30% 中毒）：紫色的風往對手掃過去 → 兩刀快斬（左上→右下、右上→左下），刀光後面拖著淡淡的綠色毒霧
  dgVenom: { *f(U, T, u) { Sound.sfx('wind'); HD15.windLines(this, U, T, HD15.P.shade, 6, { spread: 30, len: 40, spd: 10 }); yield* this.lunge(u, 16, 2); Sound.sfx('bladeQ');
      DG17.cut(this, T, 'dr', { r: 40, th: 9 }); DG17.mist(this, T, 4, 2); yield* wait(3); HD15.flash(this, T, HD15.P.shade, 22, { dur: 9 }); yield* wait(4); },
    *h(U, T) { Sound.sfx('bladeQ'); DG17.cut(this, T, 'dl', { r: 40, th: 9 }); DG17.mist(this, T, 4, 2); yield* wait(3); DG17.pop(this, T, 0.9); yield* wait(8); } },
  // 迅風斬（搶先、自己速度 +1）：殘影一閃，主角一下子就到對手面前 → 一道很快的橫斬，疾風線跟著穿過去（速度提升的箭頭在下一步）
  dgQuick: { *f(U, T, u) { Sound.sfx('wind'); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 2; i++) K13.ghost(this, 0, -i * 12, '#b080ff', 6 + i * 3, 0.45);
      yield* this.lunge(u, 22, 1); Sound.sfx('blade'); DG17.cut(this, T, 'h', { r: 62, span: 1.2, th: 8, dur: 14 }); HD15.windLines(this, { x: T.x - 50, y: T.y }, { x: T.x + 60, y: T.y }, HD15.P.shade, 7, { spread: 18, len: 46, spd: 14, life: 10 });
      yield* wait(3); HD15.stop(this, 2); DG17.pop(this, T, 1, { rot: 0 }); HD15.sparks(this, T, 8, HD15.P.shade, { ang: 0, spread: 0.6, spd: 4, life: 14 }); yield* wait(8); } },
  // 殘影步（2 回合迴避 +30%、下一擊威力 +30%）：舞台稍暗，主角左右留下紫黑的殘影、腳下冒出黑煙，紫色光粒往上飄；最後刀身一亮（下一擊）
  dgShade: { keep: 1, *f(U, T, u) { const P = HD15.P.shade, H = DS16.hands(this), G = { x: H.Hc.x, y: HERO_FOOT - 2 }; Sound.sfx('wind'); HD15.dim(this, 0.3, 56);
      if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 4; i++) K13.ghost(this, (i % 2 ? -1 : 1) * (6 + i * 4), 0, i % 2 ? '#b080ff' : '#2a1838', 14 + i * 4, 0.5);
      HD15.smoke(this, G, 8, { col: '#1a1024', r: 40, spd: 1, sz: 10, life: 40, fl: 0.3, al: 0.8, up: 0.3 }); HD15.ring(this, G, P, 6, 34, { fl: 0.3, w: 1.4, dur: 24 });
      for (let i = 0; i < 12; i++) DG17.later(this, i * 2, () => HD15.mote(this, G.x + (Math.random() - 0.5) * 40, G.y - Math.random() * 20, (Math.random() - 0.5) * 0.4, -0.5 - Math.random() * 0.5, P, { life: 30 }));
      yield* wait(20); Sound.sfx('tick'); HD15.cut(this, { x: H.R.x + 4, y: H.R.y - 8 }, -1.05, 20, P, { dur: 14, w: 4, gap: 0.01 }); HD15.flare(this, { x: H.R.x + 8, y: H.R.y - 16 }, P, 36, { rot: 0, dur: 16, x8: 1 }); yield* wait(18); } },
  // 蝕毒連斬（4 段；對中毒的對手每段威力 ×1.4）：四刀快斬、每刀換方向；對手中毒時每一刀都冒出綠色的毒泡、毒液（毒被刀口「蝕」開），最後一刀毒一起爆開
  dgRot: { *f(U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('bladeQ'); DG17.cut(this, T, 'dr', { r: 38 }); yield* wait(2); if (DG17.has(this, T, 'psn')) { DG17.bubbles(this, T, 4); DG17.drops(this, T, 3, HD15.P.venom); } HD15.flash(this, T, HD15.P.shade, 20, { dur: 8 }); yield* wait(2); },
    *h(U, T, u, i) { const ps = DG17.has(this, T, 'psn'); Sound.sfx('bladeQ'); DG17.cut(this, T, ['dr', 'dl', 'h', 'ur'][i % 4], { r: 38 }); yield* wait(2);
      if (ps) { DG17.bubbles(this, T, 4); DG17.drops(this, T, 3, HD15.P.venom); }
      if (i < 3) { HD15.flash(this, T, HD15.P.shade, 20 + i * 3, { dur: 8 }); yield* wait(2); return; }
      HD15.stop(this, 3); DG17.pop(this, T, 1.1); if (ps) { HD15.flash(this, T, HD15.P.venom, 44, { dur: 14 }); DG17.bubbles(this, T, 10); DG17.mist(this, T, 6); } this.shake = Math.max(this.shake || 0, 5); yield* wait(10); } },
  // 斷命斬（HP 一半以下威力 ×1.5、容易會心）：舞台一暗，一道又大又彎的紫色刀光像死神的鐮刀一樣從右上掃到左下（黑色殘影跟著）→ 停格，一道黑線把對手斬斷、往兩邊裂開，黑煙噴出
  dgReap: { *f(U, T, u) { const [Pu, Bk] = DG17.P(); Sound.sfx('charge'); HD15.dim(this, 0.45, 50); yield* wait(8); yield* this.lunge(u, 20, 2); Sound.sfx('blade');
      DG17.cut(this, { x: T.x + 4, y: T.y - 2 }, 'dl', { r: 62, th: 12, span: 2.2, dur: 24, sw: 0.2 }); yield* wait(5);
      Sound.sfx('crit'); HD15.stop(this, 6); HD15.cut(this, T, 2.3, 84, Bk, { dur: 24, w: 7, gap: 6 }); HD15.flash(this, T, Pu, 50, { dur: 16 }); HD15.spikes(this, T, Pu, 10, 28, { rot: 2.3 });
      DG17.dark(this, T, 8); HD15.sparks(this, T, 12, Pu, { spd: 4, life: 18 }); this.shake = Math.max(this.shake || 0, 8); yield* wait(16); } },
  // 雷痺斬（搶先、60% 麻痺）：殘影一閃，一刀紫色快斬，刀上纏著黃色的電光，打中時電光在對手身上劈啪作響
  dgNeedle: { *f(U, T, u) { const V = HD15.P.volt; Sound.sfx('charge'); const H = DS16.hands(this); DG17.zap(this, { x: H.R.x + 4, y: H.R.y - 8 }, 2, { r: 10, dur: 10 }); yield* wait(6);
      yield* this.lunge(u, 22, 1); Sound.sfx('bladeQ'); DG17.cut(this, T, 'dr', { r: 42, th: 9, dur: 14 }); yield* wait(2); Sound.sfx('buzz');
      DG17.zap(this, T, 3, { r: 22, dur: 14 }); HD15.flash(this, T, V, 30, { dur: 10 }); HD15.sparks(this, T, 10, V, { spd: 3.4, life: 14 }); DG17.dark(this, T, 2); yield* wait(10); } },
  // 千刃亂舞（5 段；最後引爆對手身上的中毒・麻痺・灼傷）：五刀亂斬、方向位置都不一樣 → 最後一刀 X，停格；對手身上有的異常狀態一種一種爆開（綠色毒泡、黃色電光、橘色火光）
  dgBloom: { *f(U, T, u) { Sound.sfx('wind'); yield* this.lunge(u, 18, 2); Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x - 4, y: T.y + 2 }, 'dr', { r: 38 }); yield* wait(3); },
    *h(U, T, u, i) { if (i < 4) { Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x + (Math.random() - 0.5) * 16, y: T.y + (Math.random() - 0.5) * 12 }, ['ul', 'h', 'dl', 'v'][i % 4], { r: 38 }); yield* wait(2); HD15.flash(this, T, HD15.P.shade, 20, { dur: 8 }); yield* wait(1); return; }
      Sound.sfx('blade'); DG17.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 46, th: 10 }); DG17.cut(this, { x: T.x + 3, y: T.y }, 'dl', { r: 46, th: 10, delay: 2 }); yield* wait(5);
      Sound.sfx('crit'); HD15.stop(this, 5); DG17.xcut(this, T, 60); DG17.pop(this, T, 1.2, { rot: Math.PI / 4 }); let n = 0;
      if (DG17.has(this, T, 'psn')) { DG17.later(this, 6 + n * 6, () => { Sound.sfx('poison'); HD15.flash(this, T, HD15.P.venom, 50, { dur: 14 }); DG17.bubbles(this, T, 12); DG17.drops(this, T, 6, HD15.P.venom, { spd: 2.6 }); }); n++; }
      if (DG17.has(this, T, 'par')) { DG17.later(this, 6 + n * 6, () => { Sound.sfx('buzz'); HD15.flash(this, T, HD15.P.volt, 50, { dur: 14 }); DG17.zap(this, T, 4, { r: 30, dur: 16 }); }); n++; }
      if (DG17.has(this, T, 'brn')) { DG17.later(this, 6 + n * 6, () => { Sound.sfx('fire'); HD15.flash(this, T, HD15.P.ember, 50, { dur: 14 }); HD15.flames(this, { x: T.x, y: T.y + 16 }, 10, HD15.P.ember, { w: 30, h: 18, span: 8, life: 18 }); }); n++; }
      this.shake = Math.max(this.shake || 0, 7); yield* wait(12 + n * 6); } },
  // 縛影斬（搶先；這回合不能行動，頭目延到最後）：斬向對手的影子 → 腳下的影子被一刀橫斬，一把黑色的刀從上面刺進影子把它釘住，影子裡長出紫色的裂紋、對手身上泛暗紫
  dgStitch: { *f(U, T, u, t) { const [Pu, Bk] = DG17.P(), G = { x: T.x, y: t && t.foot ? t.foot : T.y + 24 }, v = DG17.vAt(this, T); Sound.sfx('charge'); HD15.dim(this, 0.4, 56); yield* wait(6);
      yield* this.lunge(u, 22, 1); Sound.sfx('blade'); HD15.slash(this, G, { pal: Pu, r: 70, th: 8, ang: -Math.PI / 2, dir: 1, span: 1.1, fl: 0.35, dur: 16, sw: 0.2, spark: 1 }); yield* wait(4);
      Sound.sfx('heavy'); HD15.thrust(this, { x: G.x, y: G.y - 46 }, { x: G.x, y: G.y - 2 }, Bk, { w: 6, ext: 2, dur: 30 }); HD15.stop(this, 4);
      HD15.ring(this, G, Pu, 4, 34, { fl: 0.3, w: 2, dur: 22 }); HD15.cracks(this, G, 6, Pu, { len: 30, fl: 0.25, dur: 50 }); HD15.smoke(this, G, 6, { col: '#1a1024', r: 30, spd: 0.6, sz: 9, life: 36, fl: 0.25, al: 0.8, up: 0.15 });
      if (v) { v.tint = { c: '#3a1060', a: 0.5 }; DG17.later(this, 34, () => { if (v.tint && v.tint.c === '#3a1060') v.tint = null; }); } this.shake = Math.max(this.shake || 0, 5); yield* wait(22); } },
  // 月影雙斬（絕技，2 段；HP 一半以下每段必定會心）——v12.98 重做（玩家：「月影雙斬沒有特色」）：
  //   夜色降下，對手上方升起一輪滿月；主角消失，主角的黑色剪影從滿月前面一躍而過（月影）→ 從月亮撲下來，一道亮白的月牙斬出左半圈
  //   → 第二段：一道黑色的月牙從下面斬出右半圈，一亮一暗合成一輪滿月 → 停格，整輪月亮碎成光粒和黑色光粒，八方月光；HP 一半以下（必定會心）時再多一圈月光衝擊波
  zjMoonFang: { *f(U, T, u) { const L = HD15.P.lunar, Hc = this.center(this.H), M = { x: T.x + 4, y: T.y - 46 }; Sound.sfx('charge');
      HD15.dim(this, 0.68, 130, { col: '#04030c', inn: 0.12, out: 0.25 }); DG17.fullMoon(this, M, 22, 130); if (typeof HD18 !== 'undefined') HD18.vanish(this); yield* wait(14);
      Sound.sfx('wind'); if (typeof HD18 !== 'undefined') for (let i = 0; i < 12; i++) { const q = i / 11, ox = -46 + 92 * q, oy = 6 - Math.sin(Math.PI * q) * 14; DG17.later(this, i * 2, () => HD18.shadow(this, M.x + ox - Hc.x, M.y + oy - Hc.y - 18, 7, 0.9)); }
      yield* wait(26); Sound.sfx('blade'); HD15.windLines(this, M, T, L, 5, { spread: 16, len: 40, spd: 12, life: 10 }); this.dg17moon = [DG17.crescent(this, T, 26, -1, L, { rv: 6 })];
      yield* wait(5); HD15.flash(this, T, L, 34, { dur: 12 }); HD15.sparks(this, T, 10, L, { spd: 3.2, life: 16 }); yield* wait(8); },
    *h(U, T) { const L = HD15.P.lunar, Bk = HD15.P.black, v = DG17.vAt(this, T), low = !!(v && v.max && v.max.hp && v.hp / v.max.hp <= 0.5);
      Sound.sfx('blade'); const c2 = DG17.crescent(this, T, 26, 1, Bk, { rv: 6, rev: 1 }); yield* wait(7);
      Sound.sfx('crit'); HD15.stop(this, 7); for (const c of (this.dg17moon || []).concat([c2])) if (c) c.burst = 1; this.dg17moon = null;
      HD15.flash(this, T, L, low ? 90 : 64, { dur: 18 }); HD15.flare(this, T, L, low ? 170 : 120, { rot: 0, dur: 22, x8: 1 }); HD15.ring(this, T, L, 26, 60, { w: 2.4, dur: 18 }); HD15.spikes(this, T, L, 12, 34);
      if (low) { HD15.ring(this, T, L, 10, 92, { w: 3, dur: 24, delay: 3 }); this.spawn({ k: 'flash', c: '#e6dcff', a: 0.35, life: 10 }); }
      this.shake = Math.max(this.shake || 0, low ? 12 : 8); yield* wait(low ? 22 : 16); } },
  // 影葬連刃（奧義，搶先；4 段起，對手有異常、能力下降時更多段）：舞台暗下來，主角沉進影子裡消失 → 影子從四面八方一刀一刀砍過去（紫的、黑的交錯，越來越快）
  //   → 最後一刀：對手腳下湧上一團黑影把牠吞掉，紫色的 X 斬痕從黑影裡裂開，停格，黑煙往上散
  ogDagger: { *f(U, T, u, t) { const H = DS16.hands(this), tu = DG17.tu(this, t), hu = this.core.byId.H; try { this.dg17n = tu && hu ? OG14.短刀[9].hitsOf(this.core, hu, { tg: [tu.id] }) : 4; } catch (e) { this.dg17n = 4; }
      Sound.sfx('charge'); HD15.dim(this, 0.7, 70 + this.dg17n * 10, { col: '#04020a', inn: 0.08, out: 0.2 }); HD15.smoke(this, { x: H.Hc.x, y: HERO_FOOT - 4 }, 10, { col: '#1a1024', r: 30, spd: 1.2, sz: 12, life: 40, fl: 0.4, al: 0.9, up: 0.5 });
      if (typeof K13 !== 'undefined' && K13.ghost) K13.ghost(this, 0, 0, '#2a1838', 18, 0.6); yield* wait(16); Sound.sfx('wind');
      DG17.dash(this, { x: T.x - 70, y: T.y + 30 }, { x: T.x + 70, y: T.y - 30 }, 1, { dur: 8 }); yield* this.lunge(u, 18, 2); Sound.sfx('bladeQ'); DG17.cut(this, T, 'ur', { r: 42, th: 9 }); yield* wait(3); },
    *h(U, T, u, i) { const n = this.dg17n || 4, last = i >= n - 1, an = i * 2.4 + 0.5;
      if (!last) { Sound.sfx('bladeQ'); DG17.dash(this, { x: T.x - Math.cos(an) * 70, y: T.y - Math.sin(an) * 40 }, { x: T.x + Math.cos(an) * 70, y: T.y + Math.sin(an) * 40 }, i % 2, { dur: 7 });
        DG17.cut(this, { x: T.x + (Math.random() - 0.5) * 12, y: T.y + (Math.random() - 0.5) * 10 }, ['dr', 'dl', 'h', 'ul', 'ur', 'v'][i % 6], { k: i % 2, r: 40, th: 9, dur: 14 }); DG17.dark(this, T, 1); yield* wait(i < 4 ? 3 : 2); return; }
      Sound.sfx('heavy'); DG17.gloom(this, T, 70, 44); HD15.smoke(this, { x: T.x, y: T.y + 20 }, 10, { col: '#140a1e', r: 30, spd: 1.2, sz: 12, life: 44, fl: 0.4, al: 0.85, up: 0.6 }); yield* wait(8);
      Sound.sfx('crit'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#c8a0ff', a: 0.3, life: 8 }); DG17.xcut(this, T, 80, { dur: 24, gap: 6 }); HD15.flash(this, T, HD15.P.shade, 70, { dur: 18 });
      HD15.flare(this, T, HD15.P.shade, 140, { rot: 0, dur: 22, x8: 1 }); HD15.spikes(this, T, HD15.P.shade, 12, 34); HD15.sparks(this, T, 22, HD15.P.shade, { spd: 4.6, life: 22, g: 0.04 }); this.shake = Math.max(this.shake || 0, 10); yield* wait(22); } },

  /* ---------- 雙刀：主手紫、副手黑 ---------- */
  // 雙刃旋（4 段，主手・副手輪流）：雙手交錯一刀接一刀，每刀轉 90 度、繞著對手轉一圈（紫、黑、紫、黑）→ 最後一刀身上轉出一個小小的紫黑圈
  ddSpin: { *f(U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x - 5, y: T.y - 3 }, 'dr', { r: 36 }); yield* wait(2); HD15.flash(this, T, HD15.P.shade, 20, { dur: 8 }); yield* wait(2); },
    *h(U, T, u, i) { const O = [[-5, -3], [5, -3], [5, 4], [-5, 4]][i % 4]; Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x + O[0], y: T.y + O[1] }, ['dr', 'dl', 'ul', 'ur'][i % 4], { k: i % 2, r: 36 }); yield* wait(2);
      if (i < 3) { HD15.flash(this, T, HD15.P.shade, 20, { dur: 8 }); yield* wait(2); return; }
      const [Pu, Bk] = DG17.P(), C = { x: T.x, y: T.y + 4 }; HD15.whirl(this, C, Pu, { r: 30, th: 6, fl: 0.45, turns: 1, trail: 3, dur: 18, spark: 1 }); HD15.whirl(this, C, Bk, { r: 30, th: 6, fl: 0.45, turns: 1, trail: 3, dur: 18, a0: Math.PI * 1.75 });
      yield* wait(4); HD15.stop(this, 3); DG17.pop(this, T, 1.1); this.shake = Math.max(this.shake || 0, 5); yield* wait(10); } },
  // 交叉刺（2 段；兩段都中時物防 −1）：兩把刀同時從左下、右下刺進去，在對手身上交叉 → 第二段停格，護甲碎片噴出（物防下降的箭頭在下一步）
  ddCross: { *f(U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('bladeQ'); DG17.stab(this, T, { ang: -1.05, L: 34, w: 6 }); DG17.stab(this, T, { k: 1, ang: -2.09, L: 34, w: 6, delay: 2 }); yield* wait(4); HD15.flash(this, T, HD15.P.shade, 26, { dur: 10 }); yield* wait(4); },
    *h(U, T) { Sound.sfx('heavy'); HD15.stop(this, 4); DG17.pop(this, T, 1.1, { rot: Math.PI / 2 }); HD15.shards(this, T, 8, { ang: -Math.PI / 2, spread: 2, spd: 3.4, sz: 3, up: 1.4 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(12); } },
  // 燕舞亂刃（7 段，每段 10% 中毒）：主角像燕子一樣左右翻飛（殘影），雙手輪流從各個方向亂斬，紫、黑交錯 → 第七刀交成 X，停格
  ddDance: { *f(U, T, u) { Sound.sfx('wind'); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(this, (i % 2 ? -1 : 1) * (8 + i * 4), -i * 3, DG17.gc()[i % 2 ? 0 : 1], 10 + i * 3, 0.45);
      yield* this.lunge(u, 18, 2); Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x - 6, y: T.y }, 'ur', { r: 36 }); yield* wait(3); },
    *h(U, T, u, i) { if (i < 6) { const s = i % 2 ? 1 : -1; Sound.sfx('bladeQ'); HD15.windLines(this, { x: T.x - s * 50, y: T.y + 20 }, { x: T.x + s * 50, y: T.y - 24 }, HD15.P.shade, 2, { spread: 10, len: 30, spd: 12, life: 8 });
        DG17.cut(this, { x: T.x + s * 5, y: T.y + (Math.random() - 0.5) * 10 }, ['dl', 'ur', 'h', 'ul', 'dr', 'v'][i % 6], { k: i % 2, r: 36, dur: 14 }); yield* wait(2); HD15.flash(this, T, HD15.P.shade, 18, { dur: 7 }); yield* wait(1); return; }
      Sound.sfx('blade'); DG17.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 46, th: 10 }); DG17.cut(this, { x: T.x + 3, y: T.y }, 'dl', { k: 1, r: 46, th: 10, delay: 2 }); yield* wait(5);
      Sound.sfx('crit'); HD15.stop(this, 4); DG17.xcut(this, T, 60); DG17.pop(this, T, 1.2, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(10); } },
  // 殘影反擊（2 回合迴避 +40%、閃過就反擊）：舞台稍暗，主角四周留下一圈紫黑的殘影、腳下黑煙，兩把刀一亮（紫、黑）
  ddAfter: { keep: 1, *f(U, T, u) { const [Pu, Bk] = DG17.P(), H = DS16.hands(this), G = { x: H.Hc.x, y: HERO_FOOT - 2 }; Sound.sfx('wind'); HD15.dim(this, 0.3, 56);
      if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 0; i < 5; i++) K13.ghost(this, Math.cos(i * 1.26) * 14, Math.sin(i * 1.26) * 5, DG17.gc()[i % 2 ? 1 : 0], 14 + i * 3, 0.5);
      HD15.smoke(this, G, 8, { col: '#1a1024', r: 40, spd: 1, sz: 10, life: 40, fl: 0.3, al: 0.8, up: 0.3 }); HD15.ring(this, G, Pu, 6, 36, { fl: 0.3, w: 1.4, dur: 24 });
      yield* wait(18); Sound.sfx('tick'); HD15.flare(this, H.R, Pu, 32, { rot: -0.8, dur: 14 }); HD15.cut(this, H.L, 0.8, 16, Bk, { dur: 14, w: 4, gap: 0.01 }); yield* wait(18); } },
  // 疾風百刃（10 段，比對手快時 12 段）：疾風線一波波掃過，雙手輪流一刀接一刀（越來越快），每三刀風再掃一次 → 最後一刀交成 X，停格
  ddGale: { *f(U, T, u, t) { const tu = DG17.tu(this, t), hu = this.core.byId.H, D = DEF.skills.t_ddGale; try { this.dg17n = tu && hu && D.hitsOf ? D.hitsOf(this.core, hu, { tg: [tu.id] }) : 10; } catch (e) { this.dg17n = 10; }
      Sound.sfx('wind'); HD15.windLines(this, U, T, HD15.P.shade, 8, { spread: 40, len: 44, spd: 12 }); yield* this.lunge(u, 18, 2); Sound.sfx('bladeQ'); DG17.cut(this, T, 'dr', { r: 34, th: 7, dur: 12 }); yield* wait(2); },
    *h(U, T, u, i) { const n = this.dg17n || 10, last = i >= n - 1;
      if (!last) { Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x + (Math.random() - 0.5) * 16, y: T.y + (Math.random() - 0.5) * 12 }, ['dl', 'h', 'ur', 'ul', 'dr', 'v'][i % 6], { k: i % 2, r: 34, th: 7, dur: 12 });
        if (i % 3 === 0) HD15.windLines(this, { x: T.x - 60, y: T.y + 10 }, { x: T.x + 60, y: T.y - 10 }, HD15.P.shade, 3, { spread: 20, len: 40, spd: 14, life: 8 }); yield* wait(i < 5 ? 2 : 1); return; }
      Sound.sfx('blade'); DG17.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 46, th: 10 }); DG17.cut(this, { x: T.x + 3, y: T.y }, 'dl', { k: 1, r: 46, th: 10, delay: 2 }); yield* wait(5);
      Sound.sfx('crit'); HD15.stop(this, 5); DG17.xcut(this, T, 66); DG17.pop(this, T, 1.3, { rot: Math.PI / 4 }); HD15.flare(this, T, HD15.P.shade, 90, { rot: 0, dur: 18, x8: 1 }); this.shake = Math.max(this.shake || 0, 7); yield* wait(12); } },
  // 雙牙絕命（2 段；HP 30% 以下威力 ×2）——v12.98 重做（玩家：「雙牙絕命魄力不夠 特效太簡單」）：
  //   舞台幾乎全黑，對手身上浮出一圈往內收的黑影、兩把刀一亮 → 主角化成黑影撲上去（原地留下黑色剪影）→ 上顎（紫）、下顎（黑）兩根巨大的獠牙一口咬合，
  //   兩把刀同時刺進去 → 停格、畫面大震，紫光和黑煙從牙縫炸開、碎片噴出 → 第二段：獠牙往上下撕開，兩道撕裂的斬痕大大裂開，黑影柱沖起、八方光芒；
  //   對手 HP 30% 以下時（威力 ×2）多一圈紫色衝擊波、畫面閃紫、黑煙更大
  ddFang: { *f(U, T, u) { const [Pu, Bk] = DG17.P(), H = DS16.hands(this); Sound.sfx('charge'); HD15.dim(this, 0.7, 90, { col: '#05020a', inn: 0.1, out: 0.25 });
      HD15.gather(this, T, 20, Pu, 46, { span: 12, life: 14 }); HD15.ring(this, T, Pu, 40, 8, { w: 1.4, dur: 18 }); HD15.flare(this, H.R, Pu, 34, { rot: -0.8, dur: 14, delay: 6 }); HD15.cut(this, H.L, 0.8, 18, Bk, { dur: 14, w: 5, gap: 0.01, delay: 6 }); yield* wait(16);
      if (typeof HD18 !== 'undefined') { HD18.shadow(this, 0, 0, 26, 0.85); for (let i = 1; i <= 3; i++) HD18.shadow(this, 0, -i * 16, 12 - i * 2, 0.6 - i * 0.12); }
      Sound.sfx('wind'); yield* this.lunge(u, 30, 1);
      DG17.fang(this, T, 0, 0, { L: 34, w: 14, R: 34, close: 5, dur: 34, tilt: -0.12 }); DG17.fang(this, T, 1, 1, { L: 34, w: 14, R: 34, close: 5, dur: 34, tilt: -0.12 });
      DG17.stab(this, T, { ang: -1.25, L: 40, w: 7, ext: 10, delay: 3 }); DG17.stab(this, T, { k: 1, ang: -1.89, L: 40, w: 7, ext: 10, delay: 3 }); yield* wait(5);
      Sound.sfx('crit'); Sound.sfx('heavy'); HD15.stop(this, 7); this.spawn({ k: 'flash', c: Pu.mid, a: 0.3, life: 8 }); HD15.flash(this, T, Pu, 64, { dur: 16 }); HD15.ring(this, T, Pu, 4, 44, { w: 2.6, dur: 18 });
      HD15.spikes(this, T, Pu, 12, 30, { rot: Math.PI / 2 }); HD15.sparks(this, T, 22, Pu, { spd: 4.4, life: 20, g: 0.06 }); DG17.dark(this, T, 8); HD15.shards(this, T, 8, { cols: ['#3a3050', '#14101e', '#000000'], spd: 3.4, sz: 3, up: 1.2 });
      this.shake = Math.max(this.shake || 0, 12); yield* wait(12); },
    *h(U, T) { const [Pu, Bk] = DG17.P(), v = DG17.vAt(this, T), low = !!(v && v.max && v.max.hp && v.hp / v.max.hp <= 0.3); Sound.sfx('bladeBig');
      HD15.cut(this, { x: T.x - 4, y: T.y }, Math.PI / 2 - 0.25, 86, Pu, { dur: 28, w: 8, gap: 12 }); HD15.cut(this, { x: T.x + 4, y: T.y }, Math.PI / 2 + 0.25, 86, Bk, { dur: 28, w: 8, gap: 12, delay: 2 }); yield* wait(4);
      Sound.sfx('crit'); HD15.stop(this, 8); DG17.gloom(this, T, 80, 40); HD15.flash(this, T, Pu, 90, { dur: 20 }); HD15.flare(this, T, Pu, 170, { rot: 0, dur: 24, x8: 1 }); HD15.spikes(this, T, Pu, 16, 44);
      HD15.ring(this, T, Pu, 6, 60, { w: 2.6, dur: 20 }); HD15.sparks(this, T, 30, Pu, { spd: 5.2, life: 24, g: 0.05 }); DG17.dark(this, T, 10);
      if (low) { Sound.sfx('quake'); this.spawn({ k: 'flash', c: Pu.mid, a: 0.4, life: 10 }); HD15.ring(this, T, Pu, 10, 96, { w: 3.4, dur: 26, delay: 3 }); HD15.ring(this, T, Bk, 8, 70, { w: 2.4, dur: 24, delay: 6 }); HD15.smoke(this, T, 12, { col: '#140a1e', r: 40, spd: 2, sz: 14, life: 50, fl: 0.6, al: 0.85, up: 0.6 }); }
      this.shake = Math.max(this.shake || 0, low ? 18 : 12); yield* wait(low ? 26 : 20); } },
  // 旋花飛刃（絕技，全體 2 段）：兩手各甩出旋轉的四刃飛刀（紫、黑），沿著弧線飛向每一隻，後面拖著淡紫、粉紅的花瓣 → 第二段飛刀從另一邊繞回來，花瓣在每隻身上散開
  zjBloom: { *f(U, T, u) { const H = DS16.hands(this), L = DG17.foes(this); Sound.sfx('wind'); yield* this.lunge(u, 10, 2);
      L.forEach((v, j) => { const C = this.center(v); Sound.sfx('bladeQ'); DG17.fly(this, j % 2 ? H.L : H.R, C, j % 2, 14, { s: 8, side: j % 2 ? -1 : 1, bend: 34, delay: j * 3, onHit: () => DG17.pop(this, C, 0.8) }); });
      yield* wait(18 + L.length * 3); },
    *h(U, T) { const L = DG17.foes(this); Sound.sfx('wind');
      L.forEach((v, j) => { const C = this.center(v), A = { x: C.x + (j % 2 ? 60 : -60), y: C.y - 50 }; DG17.fly(this, A, C, (j + 1) % 2, 12, { s: 8, side: j % 2 ? 1 : -1, bend: 20, delay: j * 3, onHit: () => { DG17.pop(this, C, 1); for (let q = 0; q < 8; q++) DG17.petal(this, C.x, C.y, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3 - 0.6); } }); });
      yield* wait(14 + L.length * 3); Sound.sfx('heavy'); HD15.stop(this, 3); this.shake = Math.max(this.shake || 0, 5); yield* wait(10); } },
  // 幻影千迴（奧義，全體 4 段，每段 15% 中毒）：舞台暗下來，主角化成殘影在魔物之間來回穿梭（紫的、黑的殘影線把每一隻連起來）→ 每一段每隻身上各一刀（紫黑輪流）
  //   → 最後一段：殘影線把全部連成一圈，每隻身上 X 斬痕一起裂開，停格，綠色毒霧散開
  ogDual: { *f(U, T, u) { const H = DS16.hands(this), L = DG17.foes(this); Sound.sfx('charge'); HD15.dim(this, 0.65, 150, { col: '#04020a', inn: 0.06, out: 0.15 });
      if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(this, 0, -i * 14, DG17.gc()[i % 2 ? 0 : 1], 8 + i * 3, 0.5); yield* wait(12);
      yield* DG17.weave(this, H.Hc, L, 0); },
    *h(U, T, u, i) { const L = DG17.foes(this); if (i < 3) { yield* DG17.weave(this, null, L, i); return; }
      const P = L.map(v => this.center(v)); Sound.sfx('wind'); P.forEach((C, j) => DG17.dash(this, C, P[(j + 1) % P.length] || C, j % 2, { dur: 8, delay: j * 2 })); yield* wait(8);
      Sound.sfx('crit'); HD15.stop(this, 7); this.spawn({ k: 'flash', c: '#a0c8ff', a: 0.3, life: 8 }); P.forEach((C, j) => { DG17.xcut(this, C, 54, { dur: 22, gap: 5, delay: j * 2 }); DG17.pop(this, C, 1.1, { rot: Math.PI / 4, delay: j * 2 }); DG17.mist(this, C, 5, 4 + j * 2); });
      this.shake = Math.max(this.shake || 0, 10); yield* wait(22); } },
};
// 幻影千迴的一段：殘影線從上一個位置衝到每一隻身上（紫黑輪流），每隻身上一刀
DG17.weave = function* (b, A0, L, i) { let A = A0 || b.dg17last || { x: 88, y: 120 }; Sound.sfx('wind');
  for (let j = 0; j < L.length; j++) { const v = L[(j + i) % L.length], C = b.center(v), k = (i + j) % 2; DG17.dash(b, A, C, k, { dur: 6 }); yield* wait(3); Sound.sfx('bladeQ'); DG17.cut(b, C, ['dr', 'dl', 'h', 'ur'][(i + j) % 4], { k, r: 38, th: 9, dur: 14 }); DG17.pop(b, C, 0.7); A = C; yield* wait(2); }
  b.dg17last = A; yield* wait(4); };
// 短刀的三個特技：蛇牙斬（追擊，60% 中毒）、瞬影斬（追擊，必定會心）、疾風步（速度 +1、回 10% MP）
const HDSP17a = [
  // 蛇牙斬——v12.98 重做（玩家：「蛇牙斬也沒有明顯的特色 交叉太普通 可以改成左右兩邊分段插進去的感覺」）：
  //   左邊一根紫色的毒牙、右邊一根黑色的毒牙，輪流一頓一頓地往對手身上插進去（左、右、左、右、左、右，每一下刀尖閃一下）→ 兩根都插到底，停格，
  //   綠色的毒從傷口炸開：毒泡、毒液往下滴、淡淡的毒霧
  { *f(U, T, u) { yield* this.lunge(u, 16, 2); const Lp = { x: T.x - 48, y: T.y - 18 }, Rp = { x: T.x + 48, y: T.y - 18 }, Lt = { x: T.x + 3, y: T.y + 3 }, Rt = { x: T.x - 3, y: T.y + 3 };
      DG17.plunge(this, Lp, Lt, 0, { w: 6, gap: 6, onStep: () => Sound.sfx('bladeQ') }); DG17.plunge(this, Rp, Rt, 1, { w: 6, gap: 6, delay: 3, onStep: () => Sound.sfx('bladeQ') });
      yield* wait(22); Sound.sfx('poison'); HD15.stop(this, 4); HD15.flash(this, T, HD15.P.venom, 44, { dur: 14 }); DG17.bubbles(this, T, 12); DG17.drops(this, { x: T.x, y: T.y + 4 }, 8, HD15.P.venom, { ang: Math.PI / 2, spread: 1.2, spd: 1.4 });
      DG17.mist(this, T, 5); DG17.pop(this, T, 1, { rot: Math.PI / 2 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(14); } },
  // 瞬影斬：主角化成殘影消失，一瞬間一道又長又快的紫色斬擊從右上劈到左下，停格、會心
  { *f(U, T, u) { if (typeof K13 !== 'undefined' && K13.ghost) K13.ghost(this, 0, 0, '#2a1838', 14, 0.6); Sound.sfx('wind'); yield* this.lunge(u, 24, 1); Sound.sfx('blade');
      DG17.cut(this, T, 'dl', { r: 70, th: 10, span: 1.3, dur: 18, sw: 0.18 }); yield* wait(4); Sound.sfx('crit'); HD15.stop(this, 5); HD15.cut(this, T, 2.3, 70, HD15.P.shade, { dur: 18, w: 6, gap: 5 }); DG17.pop(this, T, 1.2, { rot: 2.3 }); yield* wait(12); } },
  // 疾風步（強化自己）：腳下捲起紫色的風、主角留下兩道殘影，藍色的魔力光點飛回身上（回 MP）；速度提升的箭頭在下一步
  { *f(U, T, u) { const P = HD15.P.shade, H = DS16.hands(this), G = { x: H.Hc.x, y: HERO_FOOT - 2 }; Sound.sfx('wind'); HD15.ring(this, G, P, 6, 36, { fl: 0.3, w: 1.6, dur: 22 });
      HD15.windLines(this, { x: G.x - 40, y: G.y - 10 }, { x: G.x + 40, y: G.y - 30 }, P, 8, { spread: 24, len: 34, spd: 6, life: 16 }); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 2; i++) K13.ghost(this, (i % 2 ? -1 : 1) * 10, 0, '#b080ff', 14, 0.45);
      HD15.motes(this, { x: G.x, y: G.y - 70 }, { x: H.Hc.x, y: H.Hc.y }, 8, HD15.P.mp, { dur: 18 }); yield* wait(28); } },
];
// 雙刀的兩個特技：雙影襲（兩段追擊）、刃嵐（追擊全體）
const HDSP17b = [
  // 雙影襲：兩道影子從左右兩邊同時撲上來，紫的一刀、黑的一刀交成 X → 第二段停格、裂開
  { *f(U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('wind'); DG17.dash(this, { x: T.x - 60, y: T.y + 20 }, T, 0, { dur: 6 }); DG17.dash(this, { x: T.x + 60, y: T.y + 20 }, T, 1, { dur: 6 }); yield* wait(5);
      Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 40, th: 9 }); DG17.cut(this, { x: T.x + 3, y: T.y }, 'dl', { k: 1, r: 40, th: 9, delay: 2 }); yield* wait(5); },
    *h(U, T) { Sound.sfx('crit'); HD15.stop(this, 4); DG17.xcut(this, T, 60); DG17.pop(this, T, 1.1, { rot: Math.PI / 4 }); yield* wait(12); } },
  // 刃嵐：紫、黑兩道刀光像旋風一樣捲過全體（一順一逆），每隻身上一陣細碎的小刀光
  { *f(U, T, u) { const [Pu, Bk] = DG17.P(), L = DG17.foes(this), C = { x: T.x, y: T.y + 4 }; Sound.sfx('wind'); yield* this.lunge(u, 12, 2); Sound.sfx('blade');
      HD15.whirl(this, C, Pu, { r: 74, th: 9, fl: 0.36, turns: 1.3, trail: 3.4, dur: 28, spark: 1 }); HD15.whirl(this, C, Bk, { r: 64, th: 8, fl: 0.36, turns: 1.2, trail: 3, dur: 28, rev: 1, a0: Math.PI * 0.25 }); yield* wait(8);
      L.forEach((v, j) => { const P0 = this.center(v); for (let q = 0; q < 3; q++) DG17.later(this, j * 2 + q * 3, () => DG17.cut(this, { x: P0.x + (Math.random() - 0.5) * 14, y: P0.y + (Math.random() - 0.5) * 10 }, ['dr', 'dl', 'h'][q], { k: q % 2, r: 26, th: 6, dur: 12, echo: 0 })); DG17.pop(this, P0, 0.9, { delay: j * 2 + 6 }); });
      yield* wait(18); Sound.sfx('heavy'); this.shake = Math.max(this.shake || 0, 5); yield* wait(8); } },
];
for (const k in HDFX17) { const id = 't_' + k, D = DEF.skills[id], F = HDFX17[k]; if (!D) { bvErr('v12.97', 'no skill ' + id); continue; } const key = 'hd15_' + k, Wt = !F.keep, blue = /^dd/.test(k) || k === 'zjBloom' || k === 'ogDual';
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; DG17.blue = blue; DG17.force(Wt); try { yield* F.h.call(this, U, T, u, i, t); } finally { DG17.force(false); DG17.blue = false; } };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; DG17.blue = blue; DG17.force(Wt); try { yield* F.f.call(this, U, T, u, t); } finally { DG17.force(false); DG17.blue = false; } };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
for (const [kind, SP, selfJ] of [['短刀', HDSP17a, 2], ['雙刀', HDSP17b, -1]]) { const kd = TREE_KINDS11.indexOf(kind);
  const blue = kind === '雙刀', wrap = (F, w) => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; DG17.blue = blue; DG17.force(w); try { yield* F.call(this, U, T, u, t); } finally { DG17.force(false); DG17.blue = false; } };
  SP.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.97', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f, j !== selfJ)]);
    if (F.h && FX[key + 'h']) { HD15.old[key + 'h'] = FX[key + 'h']; HD15.spKeys.push([key + 'h', wrap(F.h, true)]); } }); }
// 普通攻擊：短刀一刺；雙刀主手（紫）、副手（黑）各一刺，從左右兩邊交叉刺進去；分段的第二、三下也是刺
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { const kd = this._thKind; if (!(HD15.on && DG17.isK(kd))) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0; DG17.blue = kd === '雙刀'; DG17.force(true);
    try { yield* this.lunge(u, 12, 2); Sound.sfx('bladeQ'); DG17.stab(this, T, kd === '雙刀' ? { ang: -1.25 } : {}); yield* wait(3);
      if (kd === '雙刀') { Sound.sfx('bladeQ'); DG17.stab(this, T, { k: 1, ang: -1.89 }); yield* wait(3); }
      DG17.pop(this, T, 0.8); yield* wait(6); } finally { DG17.force(false); DG17.blue = false; } };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && DG17.isK(kind))) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; yield* b.lunge(s, 6, 2); Sound.sfx('bladeQ'); DG17.blue = kind === '雙刀'; DG17.force(true);
    try { DG17.stab(b, C, { k: kind === '雙刀' ? i % 2 : 0, ang: [-1.25, -1.89, -1.57][i % 3] }); yield* wait(3); DG17.pop(b, C, 0.7); } finally { DG17.force(false); DG17.blue = false; } yield* wait(4); }; }
// 殘影閃過攻擊的那一下（殘影反擊）：原地留下紫、黑兩道殘影和一小團黑煙，紫色的風往旁邊掃（舊的白線不畫，往旁邊閃的動作照舊）
{ const H = Battle.prototype.handlers, _re = H.REACTION; H.REACTION = function* (e, s, t, P) {
    if (!(HD15.on && s && s.hero && DG17.isK(DG17.kind()) && typeof ctrInfo12 === 'function' && ctrInfo12(s, P && P.why).kind === 'dodge')) return yield* _re.call(this, e, s, t, P);
    const g = _re.call(this, e, s, t, P); let r; DG17.mute = 1; try { r = g.next(); } finally { DG17.mute = 0; }
    DG17.blue = DG17.kind() === '雙刀'; const C = this.center(s), Pu = DG17.P()[0], gc = DG17.gc(); if (typeof K13 !== 'undefined' && K13.ghost) { K13.ghost(this, 0, 0, gc[0], 18, 0.55); K13.ghost(this, -8, 0, gc[1], 14, 0.45); }
    HD15.windLines(this, { x: C.x - 24, y: C.y }, { x: C.x + 30, y: C.y }, Pu, 6, { spread: 30, len: 30, spd: 5, life: 12 }); DG17.dark(this, { x: C.x, y: C.y + 12 }, 4); DG17.blue = false;
    while (!r.done) { const v = yield r.value; r = g.next(v); } return r.value; }; }
// 反擊（短刀・雙刀）：往後一收、踏上去 → 一刀往上撩（紫），雙刀再補一刀（黑）交成 X → 停格；然後站一下、走回來（跟舊的同一套動作）
{ const _c = FX.ctr12; FX.ctr12 = function* (U, T, u) { const K = this.ctrNow12 || {}, v = u && u.id ? this.views[u.id] || u : u, o = v && v.off, kd = DG17.kind();
    if (!(HD15.on && u && u.hero && DG17.isK(kd) && K.kind !== 'block' && o)) return yield* _c.call(this, U, T, u);
    this.slashOn = 0; this.hd15cast = 1; const d = ctrDir12(U, T), x0 = o.x, y0 = o.y, H = DS16.hands(this); DG17.blue = kd === '雙刀';
    this.anim(v, 'cast', CTR12.BACK + 2, true); Sound.sfx('charge'); yield* tween(CTR12.BACK, q => { const e = Math.sin(q * Math.PI / 2); o.x = x0 - d.x * 8 * e; o.y = y0 - d.y * 8 * e; });
    HD15.flare(this, H.R, DG17.P()[0], 26, { rot: -0.8, dur: 10 }); this.anim(v, 'attack', CTR12.STEP + 26); const far = 26;
    for (let i = 1; i <= CTR12.STEP; i++) { const q = i / CTR12.STEP, e = q * q * (3 - 2 * q); o.x = x0 + d.x * (-8 + (far + 8) * e); o.y = y0 + d.y * (-8 + (far + 8) * e); yield; }
    DG17.force(true);
    try { Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x - 3, y: T.y }, 'ur', { r: 40, th: 9 }); yield* wait(4);
      if (kd === '雙刀') { Sound.sfx('bladeQ'); DG17.cut(this, { x: T.x + 3, y: T.y }, 'ul', { k: 1, r: 40, th: 9 }); yield* wait(3); }
      HD15.stop(this, 3); DG17.pop(this, T, 1.1, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 5); } finally { DG17.force(false); DG17.blue = false; }
    yield* wait(6); this.ctrRet12 = { v, x: o.x, y: o.y, x0: 0, y0: 0, at: this.t + CTR12.HOLD, dur: CTR12.RET }; }; }
HD15.use(HD15.on);
