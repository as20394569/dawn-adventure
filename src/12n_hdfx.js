/* ===================== v12.93 試作：高解析光效（劍先做 3 招給玩家看，2026-10-09） =====================
   玩家看了像素小圖版：「不好 太粗糙」→ 問哪裡粗糙：像素格太大、不夠華麗沒魄力、格數太少動作生硬、圖太簡單沒細節 → 選「高解析光效」。
   做法：不畫在像素格上。畫布本來就是 SCALE 倍（手機約 4〜6 倍），這裡直接用平滑的路徑、漸層、加法混色（越疊越亮）來畫：
     刀光＝有粗細變化、頭亮尾淡的月牙，外圈柔光、裡面一條白熱的刀鋒；打中＝白熱閃光、十字光芒、放射光刺、衝擊波、會拖尾的火花；
     再加上碎片（有重力、會翻面反光）、煙塵、地裂、光柱、火焰、往上的箭頭。每一格都重新算位置和亮度（60 格／秒），不是幾張圖輪流。
   先做 斷甲斬（一般斬擊）、狂刃（自身強化）、崩星劍（大招）三招。HD15.use(true/false) 切換新舊；
   正式版預設關，特效測試版（window.FXTEST）預設開，選技能樹的清單最後一行「劍的新特效：開／關」。 */
const HD15 = { on: false, ids: [], old: {}, T: new Map() };
HD15.q = () => (typeof HD_QUALITY !== 'undefined' && HD_QUALITY.low) ? 0.5 : 1;
HD15.cl = t => t < 0 ? 0 : t > 1 ? 1 : t;
HD15.eo = t => 1 - Math.pow(1 - t, 3);
HD15.ei = t => t * t;
HD15.rgb = c => { const n = parseInt(c.slice(1), 16); return (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255); };
HD15.rgba = (c, a) => 'rgba(' + HD15.rgb(c) + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
// 一組顏色：core 最亮的中心、mid 主色、glow 外圈柔光、edge 暗邊（讓亮的地方在明亮的背景上也看得出顏色）
HD15.P = {
  steel: { core: '#ffffff', mid: '#62c4ff', glow: '#2a63ff', edge: '#0e2a7a' },
  blaze: { core: '#ffe27a', mid: '#ff6a1a', glow: '#ff2a0a', edge: '#7a0a00' },
  star: { core: '#fffbe8', mid: '#ffc63a', glow: '#ff7a10', edge: '#8a3a00' },
};

/* ---------- 柔光貼圖（第一次用時畫好，之後重複用） ---------- */
HD15.cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
HD15.tex = (k, col = '#ffffff') => { const key = k + col; let c = HD15.T.get(key); if (c) return c; const R = HD15.rgb(col);
  if (k === 'glow') c = HD15.cv(128, 128, g => { const G = g.createRadialGradient(64, 64, 0, 64, 64, 64); G.addColorStop(0, `rgba(${R},1)`); G.addColorStop(0.2, `rgba(${R},0.72)`); G.addColorStop(0.5, `rgba(${R},0.2)`); G.addColorStop(1, `rgba(${R},0)`); g.fillStyle = G; g.fillRect(0, 0, 128, 128); });
  else if (k === 'core') c = HD15.cv(64, 64, g => { const G = g.createRadialGradient(32, 32, 0, 32, 32, 32); G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(0.3, `rgba(${R},0.9)`); G.addColorStop(1, `rgba(${R},0)`); g.fillStyle = G; g.fillRect(0, 0, 64, 64); });
  else if (k === 'streak') c = HD15.cv(256, 32, g => { g.translate(128, 16); g.scale(1, 1 / 8); const G = g.createRadialGradient(0, 0, 0, 0, 0, 128); G.addColorStop(0, 'rgba(255,255,255,1)'); G.addColorStop(0.1, `rgba(${R},0.9)`); G.addColorStop(0.42, `rgba(${R},0.28)`); G.addColorStop(1, `rgba(${R},0)`); g.fillStyle = G; g.fillRect(-128, -128, 256, 256); });
  else if (k === 'smoke') c = HD15.cv(96, 96, g => { for (let i = 0; i < 8; i++) { const x = 48 + (Math.random() - 0.5) * 30, y = 48 + (Math.random() - 0.5) * 22, r = 16 + Math.random() * 16, G = g.createRadialGradient(x, y, 0, x, y, r); G.addColorStop(0, `rgba(${R},0.45)`); G.addColorStop(1, `rgba(${R},0)`); g.fillStyle = G; g.fillRect(0, 0, 96, 96); } });
  HD15.T.set(key, c); return c; };
// 貼一張柔光貼圖（預設加法混色）
HD15.put = (x, img, cx, cy, w, h, rot, al, add = 1) => { if (!(al > 0.003) || !(w > 0) || !(h > 0)) return; x.globalCompositeOperation = add ? 'lighter' : 'source-over'; x.globalAlpha = Math.min(1, al); x.imageSmoothingEnabled = true;
  if (rot) { x.save(); x.translate(cx, cy); x.rotate(rot); x.drawImage(img, -w / 2, -h / 2, w, h); x.restore(); } else x.drawImage(img, cx - w / 2, cy - h / 2, w, h); };

/* ---------- 粒子：每一格呼叫 p.draw(x, p, 進度 0〜1, 經過格數) ---------- */
HERO_PK.hd15 = (x, p) => { const t = p.t - (p.delay || 0); if (t < 0) return; p.draw(x, p, HD15.cl(t / Math.max(1, p.life - (p.delay || 0))), t); };
HD15.add = (b, o) => { const u = o.upd; o.upd = p => { if (b.hs15 > 0 && !p.free) { p.t--; return; } if (u) u(p); else if (p.vx || p.vy || p.g) HD15.mv(p); }; return b.spawn(Object.assign({ k: 'hd15', delay: 0 }, o)); };
HD15.mv = p => { if (p.t <= (p.delay || 0)) return; p.x += p.vx || 0; p.y += p.vy || 0; const d = p.drag ?? 1; p.vx = (p.vx || 0) * d; p.vy = (p.vy || 0) * d + (p.g || 0); if (p.spin) p.rot = (p.rot || 0) + p.spin; };
// 打中的瞬間停格 n 格（只停新特效的粒子；震動照常）
HD15.stop = (b, n) => { b.hs15 = Math.max(b.hs15 || 0, n); b.spawn({ k: 'hd15', free: 1, life: n + 1, draw: () => {}, upd: () => { if (b.hs15 > 0) b.hs15--; } }); };
// 大招時把舞台壓暗，光效才跳得出來
HD15.dim = (b, a, dur, o = {}) => HD15.add(b, { x: 0, y: 0, free: 1, delay: o.delay || 0, life: (o.delay || 0) + dur, draw: (x, p, k) => { const f = k < 0.15 ? k / 0.15 : k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1; x.globalCompositeOperation = 'source-over'; x.globalAlpha = a * f; x.fillStyle = o.col || '#05030c'; x.fillRect(0, 0, W, BH); } });

/* ---------- 零件 ---------- */
// 刀光：圓弧上掃過去的月牙。T＝刀光正中間經過的點；ang＝月牙鼓出去的方向；span 弧長；dir 揮的方向；fl 壓扁
HD15.slash = (b, T, o) => { const r = o.r || 34, th = o.th || 9, span = o.span || 2.2, ang = o.ang ?? -0.6, dir = o.dir || 1, fl = o.fl || 1, P = o.pal, dur = o.dur || 20, al = o.al ?? 1, dl = o.delay || 0, N = 36, sw = o.sw || 0.3;
  const k0 = o.center ? 0 : r - th * 0.45, O = { x: T.x - Math.cos(ang) * k0, y: T.y - Math.sin(ang) * k0 * fl }, a0 = ang - span / 2 * dir;
  const pt = (a, rr) => [O.x + Math.cos(a) * rr, O.y + Math.sin(a) * rr * fl], HD = k => HD15.eo(HD15.cl(k / sw)), TL = k => HD15.ei(HD15.cl((k - sw) / (1 - sw)));
  const band = (x, A, rOut, rIn) => { x.beginPath(); for (let i = 0; i <= N; i++) { const [px, py] = pt(A(i / N), rOut(i / N)); i ? x.lineTo(px, py) : x.moveTo(px, py); } for (let i = N; i >= 0; i--) { const [px, py] = pt(A(i / N), rIn(i / N)); x.lineTo(px, py); } x.closePath(); };
  return HD15.add(b, { x: O.x, y: O.y, delay: dl, life: dl + dur,
    upd: p => { const t = p.t - dl; if (t < 0 || !o.spark || t % 2) return; const h = HD(t / dur); if (h >= 1) return; const a = a0 + span * dir * h, [hx, hy] = pt(a, r - th * 0.3);
      HD15.sparks(b, { x: hx, y: hy }, 2, P, { ang: a + dir * Math.PI / 2, spread: 1, spd: 2.4, life: 14, g: 0.05 }); },
    draw: (x, p, k) => { const hd = HD(k), tl = TL(k); if (hd - tl < 0.004) return; const f = (1 - HD15.ei(HD15.cl((k - 0.5) / 0.5))) * al;
      const A = s => a0 + span * dir * (tl + (hd - tl) * s), Wd = s => th * (s < 0.8 ? Math.pow(s / 0.8, 0.75) : (1 - s) / 0.2) * (0.6 + 0.4 * f);
      const [tx, ty] = pt(A(0), r), [hx, hy] = pt(A(1), r), grad = (c, a, mid = 0.5) => { const G = x.createLinearGradient(tx, ty, hx, hy); G.addColorStop(0, HD15.rgba(c, 0)); G.addColorStop(mid, HD15.rgba(c, a * 0.55)); G.addColorStop(0.92, HD15.rgba(c, a)); G.addColorStop(1, HD15.rgba(c, a * 0.85)); return G; };
      x.lineJoin = 'round'; x.globalAlpha = f;
      x.globalCompositeOperation = 'lighter'; band(x, A, () => r + 3, s => r - Wd(s) - 4); x.fillStyle = grad(P.glow, 0.5, 0.35); x.fill();          // 外圈柔光
      x.globalCompositeOperation = 'source-over'; band(x, A, s => r - Wd(s) * 0.55, s => r - Wd(s) - 0.6); x.fillStyle = grad(P.edge, 0.75); x.fill(); // 內側的暗邊
      band(x, A, () => r, s => r - Wd(s)); x.fillStyle = grad(P.mid, 0.95); x.fill();                                                           // 刀光本體（主色）
      band(x, A, () => r - 0.15, s => r - Wd(s) * 0.38); x.fillStyle = grad(P.core, 1, 0.6); x.fill();                                          // 最亮的刀鋒
      if (k < sw * 1.4) { const [px, py] = pt(A(0.94), r - th * 0.3), z = th * (1.2 - k); HD15.put(x, HD15.tex('glow', P.mid), px, py, z * 4, z * 4, 0, 0.7 * f); HD15.put(x, HD15.tex('core', P.mid), px, py, z * 1.5, z * 1.5, 0, f); } } }); };
// 斬痕：一道直的白光劃過，接著往兩邊裂開、淡掉
HD15.cut = (b, T, rot, L, pal, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: T.x, y: T.y, delay: dl, life: dl + (o.dur || 18), draw: (x, p, k) => { const g = HD15.eo(HD15.cl(k * 5)), sp = HD15.eo(HD15.cl((k - 0.25) / 0.75)) * (o.gap || 4), f = 1 - HD15.ei(HD15.cl((k - 0.2) / 0.8)), nx = -Math.sin(rot), ny = Math.cos(rot), T2 = HD15.tex('streak', pal.mid);
  for (const sg of sp > 0.2 ? [-1, 1] : [0]) HD15.put(x, T2, p.x + nx * sp * sg, p.y + ny * sp * sg, L * g, (o.w || 7) * (1 - 0.5 * k), rot, f); } }); };

// 火花：會拖尾、會減速
HD15.sparks = (b, P0, n, pal, o = {}) => { n = Math.max(1, Math.round(n * HD15.q())); for (let i = 0; i < n; i++) { const an = o.ang != null ? o.ang + (Math.random() - 0.5) * (o.spread ?? 1) : Math.random() * Math.PI * 2, v = (o.spd || 3) * (0.45 + Math.random() * 0.8), dl = o.delay || 0;
  HD15.add(b, { x: P0.x + (o.r ? (Math.random() - 0.5) * o.r : 0), y: P0.y + (o.r ? (Math.random() - 0.5) * o.r * 0.4 : 0), vx: Math.cos(an) * v, vy: Math.sin(an) * v - (o.up || 0), g: o.g ?? 0.06, drag: o.drag ?? 0.9, delay: dl, life: dl + Math.round((o.life || 18) * (0.8 + Math.random() * 0.45)), upd: HD15.mv, w: (o.w || 1) * (0.7 + Math.random() * 0.6), col: Math.random() < 0.4 ? pal.core : pal.mid,
    draw: (x, p, k) => { const L = o.len || 2.2, f = 1 - HD15.ei(k); HD15.put(x, HD15.tex('glow', pal.glow), p.x, p.y, 7, 7, 0, 0.5 * f); x.globalCompositeOperation = 'source-over'; x.globalAlpha = f; x.strokeStyle = p.col; x.lineCap = 'round'; x.lineWidth = p.w * (1 - k * 0.5);
      x.beginPath(); x.moveTo(p.x - p.vx * L, p.y - p.vy * L); x.lineTo(p.x, p.y); x.stroke(); } }); } };
// 白熱閃光
HD15.flash = (b, P0, pal, S, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: P0.x, y: P0.y, delay: dl, life: dl + (o.dur || 14), draw: (x, p, k) => { const g = HD15.eo(HD15.cl(k * 4)), f = 1 - HD15.eo(HD15.cl((k - 0.06) / 0.94)), s = 0.45 + 0.75 * g, fl = o.fl || 1;
  HD15.put(x, HD15.tex('glow', pal.glow), p.x, p.y, S * s, S * s * fl, 0, 0.6 * f); HD15.put(x, HD15.tex('glow', pal.mid), p.x, p.y, S * s * 0.55, S * s * 0.55 * fl, 0, 0.6 * f); HD15.put(x, HD15.tex('core', pal.mid), p.x, p.y, S * 0.3 * s, S * 0.3 * s * fl, 0, f); } }); };

// 十字光芒（x8 再加斜的兩道）
HD15.flare = (b, P0, pal, L, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: P0.x, y: P0.y, delay: dl, life: dl + (o.dur || 16), draw: (x, p, k) => { const g = HD15.eo(HD15.cl(k * 3)), f = 1 - HD15.ei(HD15.cl((k - 0.12) / 0.88)), rot = (o.rot || 0) + (o.spin || 0) * k, T = HD15.tex('streak', pal.mid);
  HD15.put(x, T, p.x, p.y, L * g, L * 0.1 * (1.6 - k), rot, f); HD15.put(x, T, p.x, p.y, L * 0.6 * g, L * 0.08 * (1.6 - k), rot + Math.PI / 2, f * 0.9);
  if (o.x8) { HD15.put(x, T, p.x, p.y, L * 0.42 * g, L * 0.05, rot + Math.PI / 4, f * 0.6); HD15.put(x, T, p.x, p.y, L * 0.42 * g, L * 0.05, rot - Math.PI / 4, f * 0.6); } } }); };
// 衝擊波（fl 壓扁＝地上的一圈）
HD15.ring = (b, P0, pal, r0, r1, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: P0.x, y: P0.y, delay: dl, life: dl + (o.dur || 16), draw: (x, p, k) => { const r = r0 + (r1 - r0) * HD15.eo(k), f = 1 - HD15.ei(k), fl = o.fl || 1, w = (o.w || 3) * (1 - k * 0.75);
  x.globalCompositeOperation = 'lighter'; x.beginPath(); x.ellipse(p.x, p.y, r, r * fl, 0, 0, Math.PI * 2);
  x.strokeStyle = pal.glow; x.globalAlpha = 0.35 * f; x.lineWidth = w * 3; x.stroke(); x.strokeStyle = pal.mid; x.globalAlpha = 0.85 * f; x.lineWidth = w; x.stroke(); x.strokeStyle = pal.core; x.globalAlpha = 0.75 * f; x.lineWidth = w * 0.35; x.stroke(); } }); };
// 放射狀的光刺：先往外長，再整根往外散掉
HD15.spikes = (b, P0, pal, n, L, o = {}) => { const S = [], dl = o.delay || 0; for (let i = 0; i < n; i++) S.push([(o.rot || 0) + i * Math.PI * 2 / n + (Math.random() - 0.5) * 0.35, L * (0.5 + Math.random() * 0.65), 1 + Math.random() * 1.3]);
  return HD15.add(b, { x: P0.x, y: P0.y, delay: dl, life: dl + (o.dur || 12), draw: (x, p, k) => { const e = HD15.eo(HD15.cl(k * 2.2)), s = HD15.ei(HD15.cl((k - 0.25) / 0.75)), f = 1 - s, fl = o.fl || 1; x.globalCompositeOperation = 'lighter';
    for (const [an, len, w] of S) { const ux = Math.cos(an), uy = Math.sin(an) * fl, r0 = 3 + len * s, r1 = 3 + len * e; if (r1 - r0 < 0.5) continue; const nx = -uy, ny = ux;
      x.beginPath(); x.moveTo(p.x + ux * r0 + nx * w, p.y + uy * r0 + ny * w); x.lineTo(p.x + ux * r1, p.y + uy * r1); x.lineTo(p.x + ux * r0 - nx * w, p.y + uy * r0 - ny * w); x.closePath(); x.globalAlpha = 0.9 * f; x.fillStyle = pal.mid; x.fill();
      const rm = r0 + (r1 - r0) * 0.75; x.beginPath(); x.moveTo(p.x + ux * r0 + nx * w * 0.35, p.y + uy * r0 + ny * w * 0.35); x.lineTo(p.x + ux * rm, p.y + uy * rm); x.lineTo(p.x + ux * r0 - nx * w * 0.35, p.y + uy * r0 - ny * w * 0.35); x.closePath(); x.globalAlpha = f; x.fillStyle = pal.core; x.fill(); } } }); };
// 碎片：會翻面（翻到正面時閃一下）、有重力
HD15.shards = (b, P0, n, o = {}) => { n = Math.max(1, Math.round(n * HD15.q())); const C = o.cols || ['#dfe8f6', '#8a98b2', '#3c4660']; for (let i = 0; i < n; i++) {
  const an = o.ang != null ? o.ang + (Math.random() - 0.5) * (o.spread ?? 1.4) : Math.random() * Math.PI * 2, v = (o.spd || 3) * (0.5 + Math.random() * 0.7), sz = (o.sz || 3) * (0.6 + Math.random() * 0.8), dl = o.delay || 0;
  const sh = [[-1, -0.6], [0.9, -0.9], [1.1, 0.5], [-0.4, 0.9]].map(([a, c]) => [a * sz * (0.7 + Math.random() * 0.6), c * sz * 0.6 * (0.7 + Math.random() * 0.6)]);
  HD15.add(b, { x: P0.x, y: P0.y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - (o.up ?? 1.5), g: o.g ?? 0.2, drag: 0.97, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.5, delay: dl, life: dl + (o.life || 30) + Math.floor(Math.random() * 8), upd: HD15.mv,
    draw: (x, p, k) => { const f = 1 - HD15.ei(HD15.cl((k - 0.55) / 0.45)), fy = Math.cos(p.rot * 1.7); x.globalCompositeOperation = 'source-over'; x.globalAlpha = f; x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.scale(1, 0.3 + 0.7 * Math.abs(fy));
      x.beginPath(); sh.forEach(([a, c], j) => j ? x.lineTo(a, c) : x.moveTo(a, c)); x.closePath(); x.fillStyle = fy > 0 ? C[0] : C[1]; x.fill(); x.lineWidth = 0.45; x.strokeStyle = C[2]; x.stroke(); x.restore();
      if (!o.dull && fy > 0.9) HD15.put(x, HD15.tex('core', '#ffffff'), p.x, p.y, 7, 7, 0, f); } }); } };
// 煙塵（一般混色，不發光）
HD15.smoke = (b, P0, n, o = {}) => { n = Math.max(1, Math.round(n * HD15.q())); const col = o.col || '#b8aa98'; for (let i = 0; i < n; i++) {
  const an = o.ang != null ? o.ang + (Math.random() - 0.5) * (o.spread ?? 1) : Math.random() * Math.PI * 2, v = (o.spd || 1.2) * (0.4 + Math.random() * 0.8), S = (o.sz || 14) * (0.7 + Math.random() * 0.6), dl = (o.delay || 0) + (i % 3);
  HD15.add(b, { x: P0.x + (Math.random() - 0.5) * (o.r || 0), y: P0.y, vx: Math.cos(an) * v, vy: Math.sin(an) * v * (o.fl ?? 0.4) - (o.up ?? 0.25), drag: 0.95, g: -0.004, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.03, delay: dl, life: dl + (o.life || 40) + Math.floor(Math.random() * 12), upd: HD15.mv,
    draw: (x, p, k) => { const g = 0.5 + 0.8 * HD15.eo(k), f = (k < 0.12 ? k / 0.12 : 1 - HD15.ei((k - 0.12) / 0.88)) * (o.al ?? 0.75); HD15.put(x, HD15.tex('smoke', col), p.x, p.y, S * g * 2, S * g * 1.5, p.rot, f, 0); } }); } };
// 地裂：先發光，再變成暗色的裂痕慢慢淡掉
HD15.cracks = (b, G, n, pal, o = {}) => { const L = [], dl = o.delay || 0; for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, an = (side > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.8, len = (o.len || 34) * (0.55 + Math.random() * 0.6), pts = [[side * 7, 0]], m = 5;
    for (let j = 1; j <= m; j++) pts.push([side * 7 + Math.cos(an) * len * j / m + (Math.random() - 0.5) * 4, Math.sin(an) * len * j / m * (o.fl || 0.3) + (Math.random() - 0.5) * 2]); L.push(pts); }
  return HD15.add(b, { x: G.x, y: G.y, delay: dl, life: dl + (o.dur || 46), draw: (x, p, k) => { const grow = HD15.eo(HD15.cl(k * 5)), hot = 1 - HD15.cl(k / 0.4), f = 1 - HD15.ei(HD15.cl((k - 0.5) / 0.5));
    for (const pts of L) { const m = Math.max(1, Math.round((pts.length - 1) * grow)); x.beginPath(); for (let j = 0; j <= m; j++) { const [a, c] = pts[j]; j ? x.lineTo(p.x + a, p.y + c) : x.moveTo(p.x + a, p.y + c); }
      x.lineCap = 'round'; x.lineJoin = 'round'; x.globalCompositeOperation = 'source-over'; x.globalAlpha = 0.8 * f; x.strokeStyle = '#1a0f08'; x.lineWidth = 1.5; x.stroke();
      if (hot > 0) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = hot; x.strokeStyle = pal.glow; x.lineWidth = 2.6; x.stroke(); x.strokeStyle = pal.mid; x.lineWidth = 0.9; x.stroke(); } } } }); };
// 光柱（從地面往上）
HD15.pillar = (b, G, pal, Hh, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: G.x, y: G.y, delay: dl, life: dl + (o.dur || 24), draw: (x, p, k) => { const e = HD15.eo(HD15.cl(k * 3)), f = 1 - HD15.ei(HD15.cl((k - 0.3) / 0.7)), w = (o.w || 22) * (1 - 0.6 * k), hh = Hh * e;
  HD15.put(x, HD15.tex('streak', pal.glow), p.x, p.y - hh / 2, hh * 1.1, w, Math.PI / 2, 0.75 * f); HD15.put(x, HD15.tex('streak', pal.mid), p.x, p.y - hh / 2, hh, w * 0.32, Math.PI / 2, f); } }); };
// 火舌（往上竄、會搖）
HD15.flames = (b, G, n, pal, o = {}) => { n = Math.max(2, Math.round(n * HD15.q())); for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, dx = o.gapX ? side * (o.gapX + Math.random() * ((o.w || 40) / 2 - o.gapX)) : (Math.random() - 0.5) * (o.w || 40), h = (o.h || 22) * (0.55 + Math.random() * 0.75), wd = (o.fw || 4) * (0.7 + Math.random() * 0.6), ph = Math.random() * 6, dl = (o.delay || 0) + Math.floor(i * (o.span || 20) / n);
  HD15.add(b, { x: G.x + dx, y: G.y + (Math.random() - 0.5) * 3 - (o.lift || 0), vy: -(o.rise ?? 0.35), delay: dl, life: dl + (o.life || 22), upd: HD15.mv,
    draw: (x, p, k, t) => { const e = HD15.eo(HD15.cl(k * 3)), f = 1 - HD15.ei(HD15.cl((k - 0.35) / 0.65)), hh = h * e * (0.85 + 0.15 * Math.sin(t * 0.6 + ph)), ww = wd * (1 - 0.4 * k), sw = Math.sin(t * 0.35 + ph) * 2.4 * (0.3 + k);
      const shape = (s) => { x.beginPath(); x.moveTo(p.x - ww * s, p.y); x.quadraticCurveTo(p.x - ww * 0.9 * s, p.y - hh * 0.5, p.x + sw, p.y - hh * (0.6 + 0.4 * s)); x.quadraticCurveTo(p.x + ww * 0.9 * s, p.y - hh * 0.5, p.x + ww * s, p.y); x.quadraticCurveTo(p.x, p.y + ww * 0.6 * s, p.x - ww * s, p.y); };
      HD15.put(x, HD15.tex('glow', pal.glow), p.x, p.y - hh * 0.3, ww * 5, hh * 1.2, 0, 0.35 * f);
      const G2 = x.createLinearGradient(p.x, p.y, p.x, p.y - hh); G2.addColorStop(0, HD15.rgba(pal.mid, 0.95 * f)); G2.addColorStop(0.55, HD15.rgba(pal.glow, 0.75 * f)); G2.addColorStop(1, HD15.rgba(pal.edge, 0));
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = G2; shape(1); x.fill();
      const G3 = x.createLinearGradient(p.x, p.y, p.x, p.y - hh * 0.75); G3.addColorStop(0, HD15.rgba(pal.core, 0.95 * f)); G3.addColorStop(1, HD15.rgba(pal.mid, 0));
      x.globalCompositeOperation = 'lighter'; x.fillStyle = G3; shape(0.45); x.fill(); } }); } };

// 往上的雙箭頭（能力提升）
HD15.chev = (b, P0, pal, o = {}) => { const dl = o.delay || 0; return HD15.add(b, { x: P0.x, y: P0.y, vy: -(o.rise ?? 0.6), drag: 0.97, delay: dl, life: dl + (o.life || 28), upd: HD15.mv, draw: (x, p, k) => { const s = o.s || 5, f = k < 0.15 ? k / 0.15 : 1 - HD15.ei((k - 0.15) / 0.85); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
  for (let j = 0; j < 2; j++) { const yy = p.y + j * s * 0.8, a = f * (1 - j * 0.35); x.beginPath(); x.moveTo(p.x - s, yy + s * 0.55); x.lineTo(p.x, yy - s * 0.45); x.lineTo(p.x + s, yy + s * 0.55);
    x.globalAlpha = 0.45 * a; x.strokeStyle = pal.glow; x.lineWidth = 3.4; x.stroke(); x.globalAlpha = a; x.strokeStyle = pal.mid; x.lineWidth = 1.6; x.stroke(); x.strokeStyle = pal.core; x.lineWidth = 0.6; x.stroke(); } } }); };
// 流星：發光的頭＋越來越細的光尾
HD15.comet = (b, A, B, pal, dur, o = {}) => { const hist = [], dl = o.delay || 0, w0 = o.w || 9; return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur + 10,
  upd: p => { const t = p.t - dl; if (t < 0) return; const k = HD15.cl(t / dur), e = k * k * (0.35 + 0.65 * k); p.x = A.x + (B.x - A.x) * e; p.y = A.y + (B.y - A.y) * e; if (k < 1) { hist.push([p.x, p.y]); if (hist.length > 16) hist.shift(); if (t % 2 === 0) HD15.sparks(b, p, 2, pal, { ang: Math.atan2(A.y - B.y, A.x - B.x), spread: 0.9, spd: 1.5, life: 16, g: 0.03 }); } },
  draw: (x, p, k, t) => { const done = t >= dur, f = done ? 1 - HD15.cl((t - dur) / 10) : 1, n = hist.length;
    if (n > 2) { x.globalCompositeOperation = 'lighter'; x.lineJoin = 'round';
      for (const [wd, col, al] of [[w0, pal.glow, 0.4], [w0 * 0.5, pal.mid, 0.85], [w0 * 0.18, pal.core, 1]]) { const Lp = [], Rp = []; for (let i = 0; i < n; i++) { const [px, py] = hist[i], [qx, qy] = hist[Math.min(n - 1, i + 1)], [sx, sy] = hist[Math.max(0, i - 1)], dx = qx - sx, dy = qy - sy, d = Math.hypot(dx, dy) || 1, w = wd * i / (n - 1) / 2; Lp.push([px - dy / d * w, py + dx / d * w]); Rp.push([px + dy / d * w, py - dx / d * w]); }
        x.beginPath(); Lp.forEach(([a, c], i) => i ? x.lineTo(a, c) : x.moveTo(a, c)); for (let i = n - 1; i >= 0; i--) x.lineTo(Rp[i][0], Rp[i][1]); x.closePath(); x.globalAlpha = al * f; x.fillStyle = col; x.fill(); } }
    if (!done) { HD15.put(x, HD15.tex('glow', pal.glow), p.x, p.y, 40, 40, 0, 0.9); HD15.put(x, HD15.tex('core', pal.mid), p.x, p.y, 15, 15, 0, 1); HD15.put(x, HD15.tex('streak', pal.mid), p.x, p.y, 36, 4, t * 0.25, 0.85); HD15.put(x, HD15.tex('streak', pal.mid), p.x, p.y, 36, 4, t * 0.25 + Math.PI / 2, 0.85); } } }); };

/* ---------- 劍：先做 3 招 ---------- */
const HDFX15 = {
  // 斷甲斬：一道大斜斬從左上劃到右下；打中時停格一下，斬痕往兩邊裂開，閃光、光刺、衝擊波，護甲碎片往刀揮的方向噴出去（物防 −1）
  sdBreak: { *f(U, T, u) { const P = HD15.P.steel; yield* this.lunge(u, 18, 3); Sound.sfx('slash');
      HD15.slash(this, T, { pal: P, r: 62, th: 13, ang: -0.67, span: 1.5, dur: 22, spark: 1 });
      HD15.slash(this, { x: T.x - 3, y: T.y + 3 }, { pal: P, r: 56, th: 6, ang: -0.67, span: 1.3, dur: 18, delay: 2, al: 0.5 });
      yield* wait(4); Sound.sfx('heavy'); HD15.stop(this, 5);
      HD15.cut(this, T, 0.9, 92, P, { dur: 20, w: 8 }); HD15.flash(this, T, P, 40); HD15.ring(this, T, P, 4, 28, { w: 2.2, dur: 16 });
      HD15.spikes(this, T, P, 9, 24, { rot: 0.3 }); HD15.sparks(this, T, 18, P, { spd: 4, life: 20, g: 0.08 });
      HD15.shards(this, T, 9, { ang: 0.6, spread: 1.8, spd: 3.6, sz: 3.4, up: 2 }); this.shake = Math.max(this.shake || 0, 7); yield* wait(20); } },
  // 狂刃：腳下兩圈紅光，火焰沿著身體兩側往上竄、紅色光柱，主角全身泛紅光，最後刀身一閃（物攻・會心提升）
  sdFrenzy: { *f(U, T, u) { const P = HD15.P.blaze, Hv = this.H, Hc = this.center(Hv), G = { x: Hc.x, y: HERO_FOOT - 2 }; Sound.sfx('charge');
      HD15.ring(this, G, P, 6, 38, { fl: 0.3, w: 2.6, dur: 24 }); HD15.ring(this, G, P, 4, 30, { fl: 0.3, w: 2, dur: 24, delay: 10 }); HD15.flash(this, G, P, 70, { fl: 0.35, dur: 30 });
      HD15.pillar(this, G, P, 110, { w: 46, dur: 34, delay: 2 });
      HD15.flames(this, G, 30, P, { w: 52, gapX: 9, h: 34, fw: 4, span: 30, life: 26, rise: 0.45 });
      HD15.flames(this, G, 8, P, { w: 26, h: 12, fw: 3, span: 24, life: 18, rise: 0.2 });
      HD15.sparks(this, { x: G.x, y: G.y - 6 }, 24, P, { ang: -Math.PI / 2, spread: 1.0, spd: 2.4, g: -0.02, drag: 0.97, life: 36, r: 46, len: 1.6 });
      HD15.add(this, { x: 0, y: 0, life: 44, draw: () => {}, upd: p => { Hv.tint = p.t < 42 ? { c: '#ff3a10', a: 0.22 + 0.16 * Math.sin(p.t * 0.45) } : null; } });
      yield* wait(18); Sound.sfx('slash'); const Hd = typeof PX13 !== 'undefined' && PX13.hand ? PX13.hand(this) : { x: Hc.x + 10, y: Hc.y - 10 };
      HD15.flare(this, Hd, P, 56, { rot: -0.6, spin: 0.9, dur: 20, x8: 1 }); HD15.flash(this, Hd, P, 30, { dur: 16 });
      yield* wait(26); Hv.tint = null; } },
  // 崩星劍：舞台變暗，一顆星拖著光尾從天上落下，接著一刀從上往下劈開，停格；大閃光、十字光芒、光柱、地上的衝擊波、地裂、土石噴起、煙塵往兩邊散
  sdMeteor: { *f(U, T, u, t) { const P = HD15.P.star, gy = t && t.foot ? t.foot : T.y + 24, G = { x: T.x, y: gy }, A = { x: T.x + 80, y: -30 }, B = { x: T.x, y: T.y - 10 }, n = 20; Sound.sfx('charge');
      HD15.dim(this, 0.42, 78); HD15.comet(this, A, B, P, n, { w: 13 }); yield* wait(n - 2);
      yield* this.lunge(u, 14, 2); Sound.sfx('heavy');
      HD15.slash(this, T, { pal: P, r: 66, th: 16, ang: 0.05, span: 1.55, dur: 26, spark: 1 });
      HD15.slash(this, { x: T.x + 3, y: T.y }, { pal: P, r: 60, th: 7, ang: 0.05, span: 1.35, dur: 22, delay: 2, al: 0.5 });
      yield* wait(6); Sound.sfx('quake'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#fff4c8', a: 0.45, life: 10 });
      HD15.cut(this, T, Math.PI / 2, 120, P, { dur: 26, w: 10, gap: 6 });
      HD15.flash(this, T, P, 96, { dur: 22 }); HD15.flare(this, T, P, 170, { rot: 0, dur: 24, x8: 1 }); HD15.spikes(this, T, P, 16, 46, { dur: 16 });
      HD15.ring(this, G, P, 10, 86, { fl: 0.3, w: 4, dur: 26 }); HD15.ring(this, T, P, 6, 50, { w: 2.5, dur: 18, delay: 2 }); HD15.pillar(this, G, P, 160, { w: 50, dur: 28 });
      HD15.sparks(this, T, 34, P, { spd: 5.5, life: 28, g: 0.12 }); HD15.cracks(this, G, 6, P, { len: 46, fl: 0.25, dur: 64 });
      HD15.shards(this, G, 14, { cols: ['#9a7650', '#644a32', '#2e2014'], ang: -Math.PI / 2, spread: 2.2, spd: 4.2, sz: 3.2, up: 1.5, g: 0.22, dull: 1 });
      HD15.smoke(this, G, 14, { r: 34, spd: 1.8, sz: 15, life: 54, fl: 0.25, al: 0.85 });
      this.shake = Math.max(this.shake || 0, 16); yield* wait(30); } },
};
// 跟舊特效放在一起；HD15.use() 切換
for (const k in HDFX15) { const id = 't_' + k, D = DEF.skills[id], F = HDFX15[k]; if (!D) { bvErr('v12.93', 'no skill ' + id); continue; } const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
HD15.use = on => { HD15.on = !!on; for (const id of HD15.ids) { const D = DEF.skills[id], O = HD15.old[id], key = 'hd15_' + id.slice(2);
    if (on) { D.fx = key; if (MOVES[id]) MOVES[id].fx = key; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (typeof REDO13 !== 'undefined') REDO13.add(id); }
    else { D.fx = O.fx; D.hitFx = O.hitFx; if (MOVES[id]) MOVES[id].fx = O.mv; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = O.style; if (typeof REDO13 !== 'undefined' && !O.redo) REDO13.delete(id); } } };
// 新特效自己畫打中的那一下：傷害時不再疊舊的白圈和方塊火花（閃白、震動、受擊動作照舊）
{ const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) { this.hd15hit = !!(HD15.on && s && s.hero && P && HD15.ids.includes(P.skill)); try { return yield* _dm.call(this, e, s, t, P); } finally { this.hd15hit = false; } };
  const _im = Battle.prototype.impact; Battle.prototype.impact = function* (b, power) { if (!this.hd15hit) return yield* _im.call(this, b, power);
    const v = b && b.id ? this.views[b.id] || b : b; if (!v) return; v.tint = { c: '#ffffff', a: 0.9 }; this.shake = Math.max(this.shake, [3, 6, 12][power] || 3); this.anim(v, 'hurt', 22); yield* wait(power > 1 ? 6 : 4); v.tint = null; v.blink = 24; }; }
HD15.use(typeof window !== 'undefined' && !!window.FXTEST); // 正式版還是舊的；特效測試版先用新的（選單可以切）
// 特效測試版：選技能樹的清單多一行「劍的新特效：開／關」
if (typeof fxtest13 === 'function' && fxtest13()) { fxtMenu13 = function* () { const K = TREE_KINDS11.filter(k => !TREE11[k].common && (typeof kindOn13 !== 'function' || kindOn13(k))).concat(COMMON11.filter(k => (TREE11[k].sk || []).length).slice(0, 1)); let i = 0;
  while (true) { const lab = k => (TREE11[k].common ? '共通' : k) + '（' + (TREE11[k].sk || []).length + (TREE11[k].common ? '' : '＋' + (TREE11[k].sp || []).length) + '）';
    const items = K.map(k => ({ t: lab(k) })).concat([{ t: '劍的新特效：' + (HD15.on ? '開' : '關') }]);
    const r = yield* choose(items, { x: 8, y: 30, w: W - 16, cols: 2, colW: (W - 24) / 2, cancel: true, index: i, title: '特效測試：選技能樹' });
    if (r < 0) continue; i = r; if (r === K.length) { HD15.use(!HD15.on); continue; } const kind = K[r];
    fxtSetup13(kind); FXT13.on = true; FXT13.kind = kind;
    try { yield* Game.scene.battleScript({ sp: 'stumpling', lv: 30, kind: 'wild', extra: [['stumpling', 30], ['stumpling', 30]], fxtest: 1 }); } finally { FXT13.on = false; } } }; }
