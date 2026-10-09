/* ===================== v12.93 試作：像素小圖＋程式組合的技能特效（玩家選了做法 ③「3試試」，先做劍的 8 招給玩家比較，2026-10-09） =====================
   做法：先畫一組共用的像素小圖——刀光（月牙）、衝擊星、光環、突刺光、碎片、閃光、準星、火舌、煙塵——每種幾格動畫，
   全部直接在像素格上一格一格算出來（外框、暗、主色、亮、白五階，淡出用格狀抖色，不用半透明），角度和大小在畫的時候就定好，所以不會有旋轉造成的糊邊。
   每一招再用程式把這些小圖組合起來（位置、時間、顏色），照技能說明演出。
   PX14.use(true/false) 可以切換新舊（特效測試版的選單有開關）；正式版要等玩家看過說好才打開。 */
const PX14 = { on: false, C: new Map(), old: {}, ids: [] };
PX14.key = (...a) => a.map(v => typeof v === 'number' ? Math.round(v * 100) / 100 : String(v)).join('|');
PX14.memo = (k, mk) => { let c = PX14.C.get(k); if (!c) { c = mk(); PX14.C.set(k, c); } return c; };
PX14.B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
PX14.dith = (x, y) => PX14.B4[((y & 3) << 2) | (x & 3)] / 16;
PX14.hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
PX14.mix = (a, b, t) => { const A = PX14.hex(a), B = PX14.hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
// [main, light, outline] → five steps
PX14.pal = col => ({ k: col[2] || '#120c22', d: PX14.mix(col[0], col[2] || '#120c22', 0.45), m: col[0], l: col[1], w: '#ffffff' });
// rasterise: fn(x, y, ix, iy) → colour or null (x, y from the canvas centre; ix, iy the pixel); then a 1-pixel outline
PX14.ras = (w, h, fn, ol) => { const c = mkCanvas(w, h), g = c.getContext('2d'), D = g.createImageData(w, h), A = new Array(w * h).fill(null);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) A[y * w + x] = fn(x - w / 2 + 0.5, y - h / 2 + 0.5, x, y);
  const put = (i, col) => { const [r, gg, b] = PX14.hex(col); D.data[i * 4] = r; D.data[i * 4 + 1] = gg; D.data[i * 4 + 2] = b; D.data[i * 4 + 3] = 255; };
  for (let i = 0; i < w * h; i++) if (A[i]) put(i, A[i]);
  if (ol) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (A[i]) continue; if ((x > 0 && A[i - 1]) || (x < w - 1 && A[i + 1]) || (y > 0 && A[i - w]) || (y < h - 1 && A[i + w])) put(i, ol); }
  g.putImageData(D, 0, 0); return c; };

/* ---------- 小圖 ---------- */
// 刀光：月牙。r 半徑、th 中間的厚度、ang 鼓出去的方向、span 看得到的角度；from..to 是揮到哪裡（0〜1）、fade 抖色淡出、fl 壓扁（地面上的橫掃）、dir 揮的方向
PX14.slash = (r, th, ang, span, from, to, fade, P, fl = 1, dir = 1) => PX14.memo(PX14.key('sl', r, th, ang, span, from, to, fade, P.m, P.k, fl, dir), () => {
  const S = Math.ceil(r * 2 + 6), H2 = Math.ceil(r * 2 * fl + 6), ux = Math.cos(ang), uy = Math.sin(ang);
  return PX14.ras(S, H2, (x, y, ix, iy) => { const yy = y / fl, d = Math.hypot(x, yy); if (d > r) return null; const id = Math.hypot(x + ux * th, yy + uy * th); if (id <= r) return null;
      let a = Math.atan2(yy, x) - ang; a = Math.atan2(Math.sin(a), Math.cos(a)); let q = (a + span / 2) / span; if (dir < 0) q = 1 - q; if (q < from || q > to) return null;
      if (fade > 0 && PX14.dith(ix, iy) < fade) return null;
      const e = r - d, lead = (to - q) * span * r; // the leading end is the brightest
      if (e < 1.1) return lead < 6 || fade === 0 ? P.w : P.l; if (e < 2.4) return P.l; return id - r < 1.6 ? P.d : P.m; }, P.k); });
// 衝擊星：n 道光芒（長短交錯），中心一個亮點
PX14.burst = (L, n, rot, wid, fade, P) => PX14.memo(PX14.key('bu', L, n, rot, wid, fade, P.m, P.k), () => { const S = Math.ceil(L * 2 + 6);
  return PX14.ras(S, S, (x, y, ix, iy) => { if (fade > 0 && PX14.dith(ix, iy) < fade) return null; const d = Math.hypot(x, y); if (d < wid * 0.95) return d < wid * 0.55 ? P.w : P.l;
      for (let i = 0; i < n; i++) { const an = rot + i * Math.PI * 2 / n, len = i % 2 ? L * 0.55 : L, ax = Math.cos(an), ay = Math.sin(an), t = x * ax + y * ay, s = Math.abs(-x * ay + y * ax); if (t < 0 || t > len) continue;
        const w = wid * (1 - t / len); if (s <= w) return s < w * 0.45 ? (t < len * 0.55 ? P.w : P.l) : P.m; }
      return null; }, P.k); });
// 光環（fl 壓扁＝地上的一圈）
PX14.ring = (r, th, fade, P, fl = 1) => PX14.memo(PX14.key('rg', r, th, fade, P.m, P.k, fl), () => { const S = Math.ceil(r * 2 + 6), H2 = Math.ceil(r * 2 * fl + 6);
  return PX14.ras(S, H2, (x, y, ix, iy) => { const d = Math.hypot(x, y / fl), e = d - r; if (Math.abs(e) > th / 2) return null; if (fade > 0 && PX14.dith(ix, iy) < fade) return null; return e > th / 2 - 1.1 ? P.l : P.m; }, P.k); });
// 突刺光：又長又尖，頭尖、尾巴拖長
PX14.spear = (len, wid, ang, fade, P) => PX14.memo(PX14.key('sp', len, wid, ang, fade, P.m, P.k), () => { const S = Math.ceil(len + 8), ux = Math.cos(ang), uy = Math.sin(ang);
  return PX14.ras(S, S, (x, y, ix, iy) => { const t = x * ux + y * uy, s = Math.abs(-x * uy + y * ux), h = len / 2; if (t < -h || t > h) return null;
      const w = t > h - len * 0.18 ? wid * (h - t) / (len * 0.18) : wid * Math.pow((t + h) / (len * 0.82), 0.7); if (s > w) return null; if (fade > 0 && PX14.dith(ix, iy) < fade) return null;
      return s < w * 0.35 ? P.w : s < w * 0.7 ? P.l : P.m; }, P.k); });
// 碎片：一小塊斜的板子（上半亮）
PX14.shard = (sz, rot, P) => PX14.memo(PX14.key('sh', sz, rot, P.m, P.k), () => { const S = Math.ceil(sz * 2 + 4), ux = Math.cos(rot), uy = Math.sin(rot);
  return PX14.ras(S, S, (x, y) => { const a = x * ux + y * uy, b = -x * uy + y * ux; if (Math.abs(a) > sz / 2 || Math.abs(b) > sz * 0.32) return null; return b < -sz * 0.08 ? P.l : P.m; }, P.k); });
// 閃光：小十字星（4 格）
PX14.TW = [['.....', '.....', '..w..', '.....', '.....'], ['.....', '..l..', '.lwl.', '..l..', '.....'], ['..l..', '..w..', 'lwwwl', '..w..', '..l..'], ['.....', '..l..', '.lwl.', '..l..', '.....']];
PX14.twinkle = P => PX14.memo(PX14.key('tw', P.l), () => PX14.TW.map(R => PXS(R, { w: '#ffffff', l: P.l })));
// 準星：四個角往中間收
PX14.reticle = (r, P) => PX14.memo(PX14.key('rt', r, P.m), () => { const S = r * 2 + 7;
  return PX14.ras(S, S, (x, y) => { const ax = Math.abs(x), ay = Math.abs(y), L = Math.max(3, r * 0.45);
      if ((Math.abs(ax - r) < 1 && ay > r - L && ay <= r) || (Math.abs(ay - r) < 1 && ax > r - L && ax <= r)) return P.l; if (ax + ay < 2.2) return ax + ay < 1 ? P.w : P.l; return null; }, P.k); });
// 火舌（往上竄，3 格）
PX14.FL = [['..r..', '.ror.', '.ryr.', 'royor', 'ryyyr', '.ryr.'], ['.r...', '.or..', '.ror.', 'royr.', 'ryyor', '.ryr.'], ['...r.', '..ro.', '.ror.', '.ryor', 'royyr', '.ryr.']];
PX14.flame = P => PX14.memo(PX14.key('fl', P.m), () => PX14.FL.map(R => PXS(R, { r: P.d, o: P.m, y: P.l })));
// 煙塵：抖色的圓
PX14.puff = (r, fade) => PX14.memo(PX14.key('pf', r, fade), () => { const S = Math.ceil(r * 2 + 4);
  return PX14.ras(S, S, (x, y, ix, iy) => { const d = Math.hypot(x, y * 1.2); if (d > r) return null; if (PX14.dith(ix, iy) < fade + (d / r) * 0.35) return null; return d < r * 0.5 ? '#d8cfc0' : '#a89a88'; }, null); });

/* ---------- 放小圖的方法 ---------- */
PX14.play = (b, frames, P, o = {}) => b.spawn(Object.assign({ k: 'p13spr', frames, fps: o.fps || 2, once: 1, x: P.x, y: P.y, life: (o.delay || 0) + frames.length * (o.fps || 2) + (o.hold || 0), blink: 0 }, o));
// 一刀：揮出去 → 最亮 → 抖色散掉
PX14.cut = (b, T, ang, dir, col, o = {}) => { const P = PX14.pal(col), r = o.r || 30, th = o.th || 8, sp = o.span || 2.4, fl = o.fl || 1;
  const F = [[0, 0.4, 0], [0, 0.75, 0], [0, 1, 0], [0.08, 1, 0], [0.2, 1, 0.3], [0.4, 1, 0.55], [0.65, 1, 0.8]].map(([a, z, f]) => PX14.slash(r, th, ang, sp, a, z, f, P, fl, dir));
  const ux0 = Math.cos(ang), uy0 = Math.sin(ang), k0 = o.center ? 0 : (r - th * 0.6); // the cut runs through the target (its thick middle on it)
  const at = { x: T.x + (o.dx || 0) - ux0 * k0, y: T.y + (o.dy || 0) - uy0 * k0 * fl };
  if (o.smear !== false) { const Q = { k: P.k, d: P.k, m: P.d, l: P.m, w: P.l }, ux = Math.cos(ang), uy = Math.sin(ang); // a darker after-image a little behind the cut
    PX14.play(b, [[0, 0.75, 0.45], [0, 1, 0.5], [0.15, 1, 0.65], [0.35, 1, 0.82]].map(([a, z, f]) => PX14.slash(r - 1, th, ang, sp, a, z, f, Q, fl, dir)), { x: at.x - ux * 3, y: at.y - uy * 3 * fl }, { fps: o.fps || 2, delay: (o.delay || 0) + 3 }); }
  return PX14.play(b, F, at, { fps: o.fps || 2, delay: o.delay || 0 }); };
// 打中：衝擊星（變大 → 變細 → 散成一圈點）
PX14.boom = (b, T, col, L = 14, o = {}) => { const P = PX14.pal(col), rot = o.rot ?? 0.39;
  const F = [PX14.burst(L * 0.45, 8, rot, 2.6, 0, P), PX14.burst(L, 8, rot, 3.4, 0, P), PX14.burst(L * 1.1, 8, rot, 2.4, 0.25, P), PX14.ring(L * 0.9, 2, 0.35, P), PX14.ring(L * 1.15, 2, 0.65, P)];
  return PX14.play(b, F, T, { fps: 2, delay: o.delay || 0 }); };
PX14.shock = (b, T, col, r = 16, o = {}) => { const P = PX14.pal(col), fl = o.fl || 1; return PX14.play(b, [0.45, 0.7, 0.9, 1.05, 1.2].map((k, i) => PX14.ring(r * k, i < 2 ? 3 : 2, i * 0.18, P, fl)), T, { fps: 2, delay: o.delay || 0 }); };
// 碎片往外飛（有重力）
PX14.shards = (b, T, n, col, o = {}) => { const P = PX14.pal(col); for (let i = 0; i < n; i++) { const an = (o.ang != null ? o.ang + (Math.random() - 0.5) * (o.spread || 1.4) : Math.random() * Math.PI * 2), v = (o.spd || 2.2) * (0.6 + Math.random() * 0.7);
    b.spawn({ k: 'p13spr', img: PX14.shard(o.sz || 4, Math.round(Math.random() * 8) / 8 * Math.PI, P), x: T.x, y: T.y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - (o.up ?? 1.2), g: o.g ?? 0.16, life: o.life || 22, delay: o.delay || 0 }); } };
PX14.tw = (b, T, col, o = {}) => PX14.play(b, PX14.twinkle(PX14.pal(col)), T, { fps: o.fps || 2, delay: o.delay || 0, hold: 0 });
PX14.sparks = (b, T, n, col, R = 14, o = {}) => { for (let i = 0; i < n; i++) { const an = Math.random() * Math.PI * 2, r = R * (0.4 + Math.random() * 0.6); PX14.tw(b, { x: T.x + Math.cos(an) * r, y: T.y + Math.sin(an) * r }, col, { delay: (o.delay || 0) + i * 2 }); } };
PX14.dust = (b, P, n = 3, o = {}) => { for (let i = 0; i < n; i++) { const dx = (i - (n - 1) / 2) * (o.gap || 12), r = o.r || 6; b.spawn({ k: 'p13spr', frames: [PX14.puff(r * 0.7, 0), PX14.puff(r, 0.15), PX14.puff(r * 1.2, 0.35), PX14.puff(r * 1.3, 0.6)], fps: 4, once: 1, x: P.x + dx, y: P.y, vx: Math.sign(dx) * 0.5, vy: -0.3, life: 16, blink: 0, delay: o.delay || 0 }); } };
// a straight streak of light from A to B (the old pixel line, used for trails and speed lines)
PX14.trail = (b, A, B, col, o = {}) => PX13.line(b, A, B, col, o.s || 2, o.life || 8, Object.assign({ grow: 2, hold: 2 }, o));
PX14.foot = (b, v) => { const C = b.center(v); return { x: C.x, y: Math.round((v && v.foot) || C.y + 16) }; };

/* ---------- 劍的 8 招 ---------- */
const PXW14 = { steel: ['#c8d4e8', '#ffffff', '#1a1430'], wind: ['#6ee0a8', '#eafff4', '#0a3324'], gold: ['#ffcc33', '#fffbe0', '#3a2806'], azure: ['#5ab8ff', '#e8f8ff', '#061a40'],
  cyan: ['#78d8ff', '#ffffff', '#0a2a3a'], red: ['#ff4a2a', '#ffe0c0', '#2a0600'], star: ['#ffd84a', '#fffbe0', '#3a2806'], flow: ['#a8e4ff', '#ffffff', '#12204a'], plate: ['#8a96aa', '#d8e0ee', '#1a1430'] };
const PXFX14 = {
  // 斷甲斬：一道大斜斬劃過對手，護甲的碎片噴出來（物防 −1）
  sdBreak: { *f(S, U, T, u) { yield* this.lunge(u, 18, 3); Sound.sfx('slash'); PX14.cut(this, T, -0.75, 1, PXW14.steel, { r: 30, th: 8 }); yield* wait(5);
      Sound.sfx('heavy'); PX14.boom(this, T, PXW14.steel, 13); PX14.shards(this, T, 7, PXW14.plate, { ang: -0.6, spread: 2.2, spd: 2.4, sz: 5 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(12); } },
  // 疾風二連：兩道交叉的快斬，後面拖著風；斬完腳邊捲起一圈風（速度 +1）
  sdTwin: { *f(S, U, T, u) { Sound.sfx('wind'); PX13.speed(this, U, T, PXC.wind, 5, 7); yield* this.lunge(u, 24, 2); Sound.sfx('slash'); PX14.cut(this, T, -0.55, 1, PXW14.wind, { r: 26, th: 6 }); PX14.sparks(this, T, 2, PXW14.wind, 16); yield* wait(9); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); PX14.cut(this, T, 0.55 + Math.PI, -1, PXW14.wind, { r: 26, th: 6 }); PX14.sparks(this, T, 2, PXW14.wind, 16); yield* wait(6);
      const F = PX14.foot(this, this.H); PX14.shock(this, F, PXW14.wind, 16, { fl: 0.35 }); PX14.play(this, [PXI.upCh('#6ee0a8')], { x: F.x - 10, y: F.y - 14 }, { vy: -0.7, life: 16, fps: 16 }); PX14.play(this, [PXI.upCh('#6ee0a8')], { x: F.x + 10, y: F.y - 10 }, { vy: -0.7, life: 16, fps: 16, delay: 3 }); yield* wait(8); } },
  // 心眼：準星從四角收到對手身上（下一擊必定會心），主角留下殘影（迴避提升）
  sdEye: { *f(S, U, T, u) { Sound.sfx('charge'); const H = this.center(this.H); PX14.tw(this, { x: H.x + 4, y: H.y - 28 }, PXW14.gold, { fps: 3 });
      for (let i = 1; i <= 2; i++) K13.ghost(this, i % 2 ? -7 : 7, 0, '#ffe8a0', 12 + i * 3, 0.4);
      PX14.play(this, [20, 15, 11, 8, 8, 8].map(r => PX14.reticle(r, PX14.pal(PXW14.gold))), T, { fps: 3 }); yield* wait(14); Sound.sfx('tick'); PX14.tw(this, T, PXW14.gold, { fps: 2 }); yield* wait(10); } },
  // 破綻突：從手上刺出一道又長又尖的光，穿過對手，背後噴出碎片（對護盾傷害 ×2）
  sdGap: { *f(S, U, T, u) { yield* this.lunge(u, 22, 2); Sound.sfx('slash'); const A = PX13.hand(this), d = PX13.dir(A, T), L = d.L + 12;
      [0.4, 0.7, 1, 1, 0.85].forEach((k, i) => { const len = Math.max(10, L * k), c = { x: A.x + d.ux * len / 2, y: A.y + d.uy * len / 2 }; PX14.play(this, [PX14.spear(len, 4.5, d.ang, i > 3 ? 0.5 : 0, PX14.pal(PXW14.azure))], c, { fps: 2, delay: i * 2 }); });
      yield* wait(5); Sound.sfx('crit'); PX14.boom(this, T, PXW14.azure, 12, { rot: d.ang }); PX14.shards(this, { x: T.x + d.ux * 6, y: T.y + d.uy * 6 }, 6, PXW14.plate, { ang: d.ang, spread: 0.9, spd: 2.8, up: 0.4 }); yield* wait(12); } },
  // 旋刃：一圈橫掃全體的迴旋斬，每隻身上都閃一下
  sdWhirl: { *f(S, U, T, u) { Sound.sfx('wind'); yield* this.lunge(u, 16, 2); Sound.sfx('slash'); const L = (this.foes ? this.foes() : []).filter(v => !v.gone);
      [0, 2.1, 4.2].forEach((a, i) => PX14.cut(this, T, a, 1, PXW14.cyan, { r: 44, th: 8, span: 2.3, fl: 0.45, delay: i * 3, dy: 6, center: true })); yield* wait(7);
      Sound.sfx('slash'); for (const v of L) { const C = this.center(v); PX14.boom(this, C, PXW14.cyan, 10); PX14.sparks(this, C, 2, PXW14.cyan, 12); } yield* wait(12); } },
  // 狂刃：腳下一圈紅光、火舌往上竄、刀身閃一下（物攻・會心提升）
  sdFrenzy: { *f(S, U, T, u) { Sound.sfx('charge'); const F = PX14.foot(this, this.H), P = PX14.pal(PXW14.red); PX14.shock(this, F, PXW14.red, 22, { fl: 0.35 });
      for (let i = 0; i < 7; i++) { const dx = (i - 3) * 6 + rnd(-1, 1); PX14.play(this, PX14.flame(P), { x: F.x + dx, y: F.y - 6 - Math.abs(dx) * 0.2 }, { fps: 3, delay: i * 2, vy: -0.9, hold: 6 }); }
      yield* wait(8); PX14.tw(this, PX13.hand(this), PXW14.red, { fps: 2 }); PX14.play(this, [PXI.upCh('#ff4a2a')], { x: F.x - 12, y: F.y - 24 }, { vy: -0.7, life: 16, fps: 16 }); PX14.play(this, [PXI.upCh('#ff4a2a')], { x: F.x + 12, y: F.y - 20 }, { vy: -0.7, life: 16, fps: 16, delay: 3 }); yield* wait(14); } },
  // 崩星劍：蓄力後，一顆星從天上落下，接著一刀從上往下劈開，地面裂開、煙塵往兩邊噴
  sdMeteor: { *f(S, U, T, u) { const P = PX14.pal(PXW14.star), A = { x: T.x + 34, y: -10 }, n = 9; Sound.sfx('charge');
      const st = this.spawn({ k: 'p13spr', img: PX14.burst(9, 4, 0, 3, 0, P), x: A.x, y: A.y, life: n + 1, blink: 0 }); st.upd = p => { const k = Math.min(1, p.t / n); p.x = A.x + (T.x - A.x) * k; p.y = A.y + (T.y - 18 - A.y) * k; };
      PX14.trail(this, A, { x: T.x, y: T.y - 18 }, PXW14.star, { s: 3, life: n + 4, grow: n, hold: n }); yield* wait(n);
      yield* this.lunge(u, 14, 2); Sound.sfx('heavy'); PX14.cut(this, T, 0.12, 1, PXW14.star, { r: 46, th: 11, span: 2.1 }); yield* wait(4);
      Sound.sfx('quake'); PX14.boom(this, T, PXW14.star, 22); const F = PX14.foot(this, this.focus || this.tgtV || null) || T; const G = { x: T.x, y: Math.max(T.y + 14, (F && F.y) || T.y + 18) };
      for (const a of [-0.25, 0.2, Math.PI + 0.25, Math.PI - 0.2]) PX13.line(this, G, { x: G.x + Math.cos(a) * 26, y: G.y + Math.sin(a) * 6 }, ['#2a1a0a'], 1, 22, { thin: 1, grow: 4, keep: 1 });
      PX14.dust(this, G, 4, { r: 6, gap: 13 }); this.shake = Math.max(this.shake || 0, 14); this.spawn({ k: 'flash', c: '#fff4c8', a: 0.4, life: 6 }); yield* wait(16); } },
  // 流光連斬：五道角度不同的光刃接連劃過，最後一刀最大
  sdFlow: { *f(S, U, T, u) { yield* this.lunge(u, 20, 2); Sound.sfx('slash'); PX14.cut(this, T, 0.7, 1, PXW14.flow, { r: 24, th: 5 }); PX14.sparks(this, T, 1, PXW14.flow, 14); yield* wait(5); },
    *h(S, U, T, u, i) { const A = [-0.7, 1.4, -1.5, 0.1], a = A[(i - 1) % 4], last = i >= 4; Sound.sfx('slash');
      PX14.cut(this, T, a + (i % 2 ? Math.PI : 0), i % 2 ? -1 : 1, PXW14.flow, { r: last ? 34 : 24, th: last ? 8 : 5 }); PX14.sparks(this, T, last ? 3 : 1, PXW14.flow, 16);
      if (last) { yield* wait(4); Sound.sfx('crit'); PX14.boom(this, T, PXW14.flow, 16); } yield* wait(last ? 12 : 5); } },
};
// register beside the old pictures; PX14.use() switches
for (const k in PXFX14) { const id = 't_' + k, D = DEF.skills[id], F = PXFX14[k]; if (!D) { bvErr('v12.93', 'no skill ' + id); continue; } const key = 'px14_' + k, S = { col: PXW14.steel };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; } if (!u) u = this.H; this.slashOn = 0; yield* F.f.call(this, S, U, T, u, t); };
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { this.slashOn = 0; yield* F.h.call(this, S, U, T, u, i, t); };
  PX14.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null }; PX14.ids.push(id); }
PX14.use = on => { PX14.on = !!on; for (const id of PX14.ids) { const D = DEF.skills[id], O = PX14.old[id], k = id.slice(2), F = PXFX14[k];
    if (on) { D.fx = 'px14_' + k; D.hitFx = F.h ? 'px14_' + k + 'h' : O.hitFx; if (MOVES[id]) MOVES[id].fx = D.fx; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; }
    else { D.fx = O.fx; D.hitFx = O.hitFx; if (MOVES[id]) MOVES[id].fx = O.mv; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = O.style; } } };
PX14.use(typeof window !== 'undefined' && !!window.FXTEST); // 正式版還是舊的；特效測試版先用新的（選單可以切）
// 特效測試版：選技能樹的清單多一行「劍的新特效：開／關」
if (typeof fxtest13 === 'function' && fxtest13()) { fxtMenu13 = function* () { const K = TREE_KINDS11.filter(k => !TREE11[k].common && (typeof kindOn13 !== 'function' || kindOn13(k))).concat(COMMON11.filter(k => (TREE11[k].sk || []).length).slice(0, 1)); let i = 0;
  while (true) { const lab = k => (TREE11[k].common ? '共通' : k) + '（' + (TREE11[k].sk || []).length + (TREE11[k].common ? '' : '＋' + (TREE11[k].sp || []).length) + '）';
    const items = K.map(k => ({ t: lab(k) })).concat([{ t: '劍的新特效：' + (PX14.on ? '開' : '關') }]);
    const r = yield* choose(items, { x: 8, y: 30, w: W - 16, cols: 2, colW: (W - 24) / 2, cancel: true, index: i, title: '特效測試：選技能樹' });
    if (r < 0) continue; i = r; if (r === K.length) { PX14.use(!PX14.on); continue; } const kind = K[r];
    fxtSetup13(kind); FXT13.on = true; FXT13.kind = kind;
    try { yield* Game.scene.battleScript({ sp: 'stumpling', lv: 30, kind: 'wild', extra: [['stumpling', 30], ['stumpling', 30]], fxtest: 1 }); } finally { FXT13.on = false; } } }; }
