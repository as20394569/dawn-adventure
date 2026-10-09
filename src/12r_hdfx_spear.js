/* ===================== v12.101 長槍的新特效（高解析光效） =====================
   玩家 2026-10-10：「下一樣長槍重製」→ 問了兩件事：顏色選「蒼藍＋白」（槍光蒼藍、最亮的芯是白色）；
   蒼龍躍・流星龍墜・貫日神槍名字裡有龍、日 →「不畫龍，用槍和光表現」（不畫龍的形狀，免得又像魔法）。
   長槍的招以「刺」為主：槍光從主角手上一路刺到對手身上（槍長，所以刺得遠），打中時順著槍的方向噴火花；
   「穿、貫」的招，光會從對手背後透出去。跳躍的招主角真的跳出畫面、從天上刺下來。
   照招式名稱做：穿甲刺（護甲碎片）、疾突（疾風、腳下的風往內收＝被拖慢）、掃槍（貼地橫掃全體）、三段突（上中下）、
   破陣槍（對手身前的六角光陣被刺碎）、迴槍架勢（槍在身前轉成輪子）、千重突（數不清的槍尖）、螺旋貫（螺旋光纏著槍身鑽進去）、
   蒼龍躍、流星龍墜、貫日神槍、三個特技、普攻、迴槍架勢的架開和反擊。新特效開著時才有；先只在特效測試版（SP20.live），玩家看過說好才放進正式版。 */
const SP20 = {};
HD15.P.lance = { core: '#ffffff', mid: '#9ad4ff', glow: '#2f86ff', edge: '#0c2f78', keep: 1 };
SP20.P = () => HD15.P.lance;
SP20.DIRT = ['#d8c8a8', '#a08868', '#5a4a38'];
SP20.hand = b => DS16.hands(b).R;
SP20.dir = (A, T) => { const an = Math.atan2(T.y - A.y, T.x - A.x); return { an, ux: Math.cos(an), uy: Math.sin(an) }; };
// 還沒給玩家看過，先只在特效測試版開（玩家說好才放進正式版：把 live 改成 true）
SP20.live = typeof fxtest13 === 'function' && fxtest13();
SP20.on = () => SP20.live && DG17.kind() === '長槍';
// 一槍：從主角手上（或 o.from）往對手刺出一道長長的槍光——蒼藍的外光、白色的芯，旁邊幾道疾風線
SP20.lance = (b, T, o = {}) => { const A = o.from || SP20.hand(b), P = o.pal || SP20.P(), w = o.w || 7, dl = o.delay || 0, ext = o.ext ?? 30, dur = o.dur || 18;
  HD15.thrust(b, A, T, P, { w, ext, dur, delay: dl, al: o.al }); HD15.thrust(b, A, T, HD15.P.white, { w: w * 0.36, ext: ext * 0.9, dur: Math.max(8, dur - 2), delay: dl + 1, al: o.al });
  if (o.wind !== 0) HD15.windLines(b, A, T, P, o.wind || 3, { spread: w * 2, len: 40, spd: 12, delay: dl }); return SP20.dir(A, T); };
// 打中：閃光、順著槍的方向噴出去的火花、一圈順著槍身壓扁的衝擊環、白色光刺
SP20.hit = (b, T, d, s = 1, o = {}) => { const P = SP20.P(), dl = o.delay || 0; HD15.flash(b, T, P, 34 * s, { dur: 12, delay: dl }); HD15.sparks(b, T, Math.round(10 * s), P, { ang: d.an, spread: 0.6, spd: 4.4 * Math.min(s, 1.5), life: 16, g: 0.04, delay: dl });
  HD15.ring(b, T, P, 3, 22 * s, { w: 2, dur: 14, fl: 0.45, rot: d.an + Math.PI / 2, delay: dl }); if (s >= 1) HD15.spikes(b, T, HD15.P.white, Math.round(6 * s), 18 * s, { rot: d.an, delay: dl }); };
// 貫穿：槍光從對手背後透出去，前面亮一道光芒
SP20.through = (b, T, d, L = 40, o = {}) => { const P = SP20.P(), dl = o.delay || 0, E = { x: T.x + d.ux * L, y: T.y + d.uy * L }; HD15.thrust(b, T, E, P, { w: o.w || 5, ext: 10, dur: 16, delay: dl });
  HD15.flare(b, E, P, o.fl || 40, { rot: d.an, dur: 14, delay: dl + 2 }); HD15.sparks(b, E, 8, P, { ang: d.an, spread: 0.4, spd: 5, life: 14, delay: dl + 2 }); return E; };
// 螺旋：兩條光沿著槍身繞（螺旋貫），一邊轉一邊往前長
SP20.helix = (b, A, B, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 22, dx = B.x - A.x, dy = B.y - A.y, D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D, nx = -uy, ny = ux, R = o.r || 8, turns = o.turns || 3, spin = o.spin || 0.5;
  return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(k / 0.3)), f = 1 - HD15.ei(HD15.cl((k - 0.5) / 0.5)); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
    for (const ph of [0, Math.PI]) { x.beginPath(); const N = 48; for (let i = 0; i <= N; i++) { const q = i / N * g, d = q * D, a = q * turns * Math.PI * 2 - t * spin + ph, r = R * (1 - 0.55 * q) * Math.sin(a), X = A.x + ux * d + nx * r, Y = A.y + uy * d + ny * r; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }
      x.globalAlpha = 0.45 * f; x.strokeStyle = pal.glow; x.lineWidth = 3.4; x.stroke(); x.globalAlpha = f; x.strokeStyle = pal.mid; x.lineWidth = 1.2; x.stroke(); } } }); };
// 六角光陣（破陣槍）：對手身前張開一面六角形的光陣，被刺中時六條邊往外碎開
SP20.hex = (b, C, R, pal, o = {}) => { const dl = o.delay || 0, hold = o.hold || 12, fl = o.fl || 0.75; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + hold + 20, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(t / 6)), br = HD15.cl((t - hold) / 20), f = 1 - HD15.ei(br);
    x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const a1 = i * Math.PI / 3 + Math.PI / 6, a2 = a1 + Math.PI / 3, am = (a1 + a2) / 2, off = HD15.eo(br) * 26, ox = Math.cos(am) * off, oy = Math.sin(am) * off * fl, sp = br * (i % 2 ? 0.5 : -0.5);
      const X1 = p.x + Math.cos(a1 + sp) * R * g + ox, Y1 = p.y + Math.sin(a1 + sp) * R * g * fl + oy, X2 = p.x + Math.cos(a2 + sp) * R * g + ox, Y2 = p.y + Math.sin(a2 + sp) * R * g * fl + oy;
      x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.globalAlpha = 0.5 * f; x.strokeStyle = pal.glow; x.lineWidth = 4.5; x.stroke(); x.globalAlpha = f; x.strokeStyle = pal.mid; x.lineWidth = 1.6; x.stroke(); x.strokeStyle = pal.core; x.lineWidth = 0.6; x.stroke(); }
    if (br === 0) HD15.put(x, HD15.tex('glow', pal.glow), p.x, p.y, R * 2.4, R * 2.4 * fl, 0, 0.25 * g); } }); };
// 主角化成光消失（貫日神槍）；整招結束才出現
SP20.hide = b => { const v = b.H; if (!v || !v.off || b.sp20hid) return; b.sp20hid = 1; b.sp20t = b.t; v.off.y = 400; };
SP20.show = b => { if (!b.sp20hid) return; b.sp20hid = 0; const v = b.H; if (v && v.off) v.off.y = 0; const H = DS16.hands(b); HD15.flash(b, H.Hc, HD15.P.white, 40, { dur: 12 }); HD15.ring(b, { x: H.Hc.x, y: HERO_FOOT - 2 }, SP20.P(), 6, 34, { fl: 0.3, w: 1.6, dur: 16 }); };
{ const H = Battle.prototype.handlers, _ae = H.ACTION_END; H.ACTION_END = function* (e, s, t, P) { if (this.sp20hid) { SP20.show(this); yield* wait(8); } return yield* _ae.call(this, e, s, t, P); };
  const _u = Battle.prototype.update; Battle.prototype.update = function (...a) { if (this.sp20hid && this.t - (this.sp20t || 0) > 900) SP20.show(this); return _u.apply(this, a); }; }
// 三段突、千重突的每一下
SP20.tri = function* (b, T, i) { const C = { x: T.x + [2, -2, 0][i % 3], y: T.y + [-14, 0, 12][Math.min(i, 2)] }; Sound.sfx('blade'); const d = SP20.lance(b, C, { w: 6 + i, ext: 26, dur: 14, wind: 2 }); yield* wait(3); Sound.sfx('bladeHit');
  if (i < 2) { SP20.hit(b, C, d, 0.8); yield* wait(4); return; } HD15.stop(b, 4); SP20.hit(b, C, d, 1.2); SP20.through(b, C, d, 36); b.shake = Math.max(b.shake || 0, 5); yield* wait(10); };
SP20.flurry = function* (b, T, i, n) { const A = SP20.hand(b), rn = s => (Math.random() - 0.5) * s;
  if (i < n - 1) { Sound.sfx('bladeQ'); const C = { x: T.x + rn(18), y: T.y + rn(20) }, d = SP20.lance(b, C, { from: { x: A.x + rn(18), y: A.y }, w: 5, ext: 22, dur: 12, wind: 0 });
    for (let q = 0; q < 2; q++) SP20.lance(b, { x: C.x + rn(26), y: C.y + rn(22) }, { from: { x: A.x + rn(30), y: A.y + 6 }, w: 3, ext: 16, dur: 10, al: 0.45, delay: q + 1, wind: 0 });
    yield* wait(2); SP20.hit(b, C, d, 0.6); yield* wait(i < 3 ? 2 : 1); return; }
  Sound.sfx('blade'); for (let q = 0; q < 9; q++) SP20.lance(b, { x: T.x + (q - 4) * 7, y: T.y + rn(16) }, { from: { x: A.x + (q - 4) * 4, y: A.y }, w: 3, ext: 26, dur: 12, al: 0.6, delay: q % 3, wind: 0 }); yield* wait(4);
  const d = SP20.lance(b, T, { w: 11, ext: 40, dur: 20, wind: 5 }); yield* wait(3); Sound.sfx('crit'); HD15.stop(b, 6); b.spawn({ k: 'flash', c: '#e6f4ff', a: 0.3, life: 8 }); SP20.hit(b, T, d, 1.5); SP20.through(b, T, d, 52, { w: 7, fl: 64 });
  b.shake = Math.max(b.shake || 0, 8); yield* wait(12); };
// 跳起來（蒼龍躍・流星龍墜蓄力的那一回合）：蹲一下 → 腳下炸開一圈風、碎石 → 主角真的跳出畫面上方，留下往上的槍光殘痕
SP20.leap = function* (b) { const v = b.H; if (!v || !v.off) return; const H = DS16.hands(b), G = { x: H.Hc.x, y: HERO_FOOT - 2 }, P = SP20.P(); Sound.sfx('charge');
  HD15.gather(b, H.R, 10, P, 30, { span: 8 }); yield* tween(8, q => { v.off.y = 5 * Math.sin(q * Math.PI / 2); });
  Sound.sfx('jump'); HD15.ring(b, G, P, 6, 50, { fl: 0.3, w: 2.6, dur: 18 }); HD15.ring(b, G, HD15.P.white, 4, 30, { fl: 0.3, w: 1.4, dur: 14, delay: 2 }); HD15.shards(b, G, 7, { up: 2.4, spd: 2, sz: 2.4, cols: SP20.DIRT });
  HD15.windLines(b, { x: G.x, y: G.y - 10 }, { x: G.x, y: G.y - 140 }, P, 8, { spread: 34, len: 50, spd: 14 });
  v.air13 = 1; v.airT13 = 0; v.drop13 = 1; yield* tween(8, q => { v.off.y = 5 - 175 * q * q; }); v.drop13 = 0;
  for (let i = 0; i < 3; i++) HD15.thrust(b, { x: G.x + (i - 1) * 7, y: G.y - 24 }, { x: G.x + (i - 1) * 4, y: -30 }, P, { w: 5 - i, ext: 10, dur: 14, delay: i });
  yield* wait(10); };
// 落下（蒼龍躍、流星龍墜）：天上一點寒光 → 一道粗大的槍光從天上斜斜刺下來，主角跟著落下
SP20.fall = function* (b, T, o = {}) { const P = SP20.P(), A = o.from || { x: T.x + 34, y: -50 }; Sound.sfx('wind'); HD15.flare(b, { x: A.x - 6, y: 8 }, HD15.P.white, 54, { rot: Math.atan2(T.y - A.y, T.x - A.x), dur: 10 }); HD15.flash(b, { x: A.x - 6, y: 8 }, P, 24, { dur: 10 }); yield* wait(6);
  const dr = typeof dropAnim13 === 'function' ? dropAnim13(b, o.drop || 8) : null; HD15.thrust(b, A, T, P, { w: o.w || 14, ext: 20, dur: 26 }); HD15.thrust(b, A, T, HD15.P.white, { w: (o.w || 14) * 0.36, ext: 18, dur: 22, delay: 1 });
  HD15.windLines(b, A, T, P, 8, { spread: 30, len: 60, spd: 16 }); yield* wait(6); return { dr, d: SP20.dir(A, T) }; };
// 迴槍架勢架開攻擊的那一下：槍在身前轉一圈擋住（白的、蒼藍的輪子），火花往外迸
SP20.parry = (b, C) => { const P = SP20.P(); HD15.whirl(b, C, P, { r: 22, th: 6, fl: 0.95, turns: 1.4, trail: 4, dur: 16 }); HD15.flash(b, C, P, 30, { dur: 10 }); HD15.flare(b, C, HD15.P.white, 42, { rot: 0, dur: 12, x8: 1 }); HD15.sparks(b, C, 14, HD15.P.gold, { spd: 3.2, life: 16, g: 0.1 }); };

const HDFX20 = {
  // 穿甲刺（無視 30% 物防）：一槍扎進去，護甲碎片順著槍往後噴，槍光從背後透出去
  spPierce: { *f(U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('blade'); const d = SP20.lance(this, T, { w: 8, ext: 34 }); yield* wait(4);
      Sound.sfx('bladeHitSuper'); HD15.stop(this, 4); SP20.hit(this, T, d, 1.1); HD15.shards(this, T, 9, { ang: d.an, spread: 0.9, spd: 3.6, up: 0.6, sz: 3 }); SP20.through(this, T, d, 46); this.shake = Math.max(this.shake || 0, 5); yield* wait(14); } },
  // 疾突（搶先；速度 −1）：疾風線往對手掃過去，主角一個衝刺，一道又長又快的突刺；對手腳下一圈圈往內收的風（被拖慢）
  spDash: { *f(U, T, u) { const P = SP20.P(), v = DG17.vAt(this, T), foot = v && v.foot ? v.foot : T.y + 24; Sound.sfx('wind'); HD15.windLines(this, SP20.hand(this), T, P, 8, { spread: 40, len: 50, spd: 14 }); yield* this.lunge(u, 26, 1);
      Sound.sfx('blade'); const d = SP20.lance(this, T, { w: 7, ext: 44, dur: 16, wind: 6 }); yield* wait(3); Sound.sfx('bladeHit'); HD15.stop(this, 3); SP20.hit(this, T, d, 1);
      for (let i = 0; i < 3; i++) HD15.ring(this, { x: T.x, y: foot }, P, 32 - i * 6, 6, { fl: 0.3, w: 1.6, dur: 14, delay: 2 + i * 4 }); yield* wait(16); } },
  // 掃槍（全體；30% 退縮）：槍壓低，一道又長又平的蒼藍弧光從左掃到右、貼著地掃過每一隻；每隻身上一下閃光、碎石往上彈
  spSweep: { *f(U, T, u) { const P = SP20.P(), L = DG17.foes(this).sort((a, c) => this.center(a).x - this.center(c).x), C = { x: T.x, y: T.y + 16 }; yield* this.lunge(u, 10, 2); Sound.sfx('wind');
      HD15.whirl(this, C, P, { r: 104, th: 12, fl: 0.2, turns: 0.5, trail: 2.6, dur: 22, a0: 0, rev: 1, spark: 1 }); HD15.whirl(this, C, HD15.P.white, { r: 100, th: 4, fl: 0.2, turns: 0.5, trail: 2, dur: 20, a0: 0, rev: 1, delay: 1 });
      L.forEach((v, j) => { const P0 = this.center(v), ft = v.foot || P0.y + 24; DG17.later(this, 4 + j * 3, () => { Sound.sfx('bladeHit'); SP20.hit(this, { x: P0.x, y: P0.y + 10 }, { an: 0, ux: 1, uy: 0 }, 0.8); HD15.shards(this, { x: P0.x, y: ft - 2 }, 5, { up: 1.8, spd: 2.4, sz: 2.6, cols: SP20.DIRT }); }); });
      yield* wait(12 + L.length * 3); this.shake = Math.max(this.shake || 0, 4); yield* wait(8); } },
  // 三段突：上、中、下各一刺，最後一刺停格、透出去
  spTriple: { *f(U, T, u) { yield* this.lunge(u, 16, 2); yield* SP20.tri(this, T, 0); }, *h(U, T, u, i) { yield* SP20.tri(this, T, i); } },
  // 破陣槍（削護盾；對蓄力中的對手 ×1.5）：槍尖聚光，對手身前張開一面六角光陣 → 一記重刺把光陣刺碎（六條邊往外碎開），碎片、地裂；
  //   對手正在蓄力時多一道白色的十字閃光（蓄力被打斷的感覺）
  spBreak: { *f(U, T, u) { const P = SP20.P(), A = SP20.hand(this), v = DG17.vAt(this, T), cu = v && this.core && this.core.byId[v.id], chg = !!(cu && this.core.statusOf && this.core.statusOf(cu, 'charging')), foot = v && v.foot ? v.foot : T.y + 24;
      Sound.sfx('charge'); HD15.gather(this, A, 12, P, 34, { span: 10 }); SP20.hex(this, { x: T.x, y: T.y + 4 }, 30, P, { hold: 22 }); yield* wait(12);
      yield* this.lunge(u, 22, 2); Sound.sfx('blade'); const d = SP20.lance(this, T, { w: 11, ext: 32, dur: 22, wind: 4 }); yield* wait(4);
      Sound.sfx('bladeHitSuper'); Sound.sfx('heavy'); HD15.stop(this, 7); SP20.hit(this, T, d, 1.5); HD15.shards(this, T, 12, { spd: 4, up: 1, sz: 3.2, cols: ['#ffffff', '#9ad4ff', '#2f6ab8'] });
      HD15.cracks(this, { x: T.x, y: foot }, 6, P, { len: 34, fl: 0.3, dur: 44 }); HD15.ring(this, T, P, 6, 56, { w: 2.6, dur: 20 });
      if (chg) { this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 8 }); HD15.flare(this, T, HD15.P.white, 150, { rot: 0, dur: 18, x8: 1 }); HD15.ring(this, T, HD15.P.white, 8, 76, { w: 3, dur: 22, delay: 2 }); }
      this.shake = Math.max(this.shake || 0, chg ? 12 : 8); yield* wait(16); } },
  // 迴槍架勢（物防 +2、被打就反擊）：槍在身前轉成一個輪子（蒼藍外圈、白芯）→ 停住，一圈光、腳下一圈波紋
  spGuard: { *f(U, T, u) { const P = SP20.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 16 }; Sound.sfx('wind');
      HD15.whirl(this, C, P, { r: 34, th: 8, fl: 0.92, turns: 2.2, trail: 4.4, dur: 34, spark: 1 }); HD15.whirl(this, C, HD15.P.white, { r: 30, th: 3, fl: 0.92, turns: 2.2, trail: 3.6, dur: 32, delay: 1 }); yield* wait(16);
      Sound.sfx('shield'); HD15.ring(this, C, P, 10, 48, { w: 2.4, dur: 18 }); HD15.ring(this, { x: H.Hc.x, y: HERO_FOOT - 2 }, P, 6, 40, { fl: 0.3, w: 1.6, dur: 20 }); HD15.flare(this, C, HD15.P.white, 60, { rot: 0, dur: 16, x8: 1 }); yield* wait(18); } },
  // 千重突（6 段）：一下接一下，每一下旁邊都有兩三道淡淡的槍尖殘影（數不清的槍尖）→ 最後一排槍尖一起刺出、一記最粗的刺穿過去
  spThousand: { *f(U, T, u) { HD15.dim(this, 0.3, 80, { col: '#020818', inn: 0.1, out: 0.3 }); yield* this.lunge(u, 16, 2); yield* SP20.flurry(this, T, 0, this.sp20n || 6); },
    *h(U, T, u, i) { yield* SP20.flurry(this, T, i, 6); } },
  // 螺旋貫（無視 50% 物防；對破防中的對手 +30%）：槍上纏起螺旋的光 → 刺出去，兩條螺旋光繞著槍身一路轉進對手 → 停格，一圈圈往內收的光（鑽進去）、火花打轉
  //   → 從背後鑽出去，背後也捲起一道螺旋；對手破防中時再多一圈白光、長光芒
  spSpiral: { *f(U, T, u) { const P = SP20.P(), A = SP20.hand(this), v = DG17.vAt(this, T), cu = v && this.core && this.core.byId[v.id], brk = !!(cu && this.core.statusOf && this.core.statusOf(cu, 'broken'));
      Sound.sfx('charge'); SP20.helix(this, { x: A.x, y: A.y + 12 }, { x: A.x + (T.x - A.x) * 0.25, y: A.y + (T.y - A.y) * 0.25 }, P, { r: 9, turns: 2, dur: 20, spin: 0.6 }); HD15.gather(this, A, 10, P, 30, { span: 10 }); yield* wait(14);
      yield* this.lunge(u, 22, 2); Sound.sfx('blade'); const B = SP20.hand(this), d = SP20.lance(this, T, { w: 10, ext: 36, dur: 24, wind: 4 }); SP20.helix(this, B, T, P, { r: 12, turns: 4, dur: 26, spin: 0.8 }); SP20.helix(this, B, T, HD15.P.white, { r: 7, turns: 4, dur: 24, spin: 0.8, delay: 1 }); yield* wait(4);
      Sound.sfx('bladeHitSuper'); HD15.stop(this, 6); for (let q = 0; q < 4; q++) HD15.ring(this, T, P, 28 - q * 3, 4, { w: 2, fl: 0.5, rot: d.an + Math.PI / 2, dur: 10, delay: q * 3 }); HD15.sparks(this, T, 18, P, { spd: 4.4, life: 18, g: 0.03 }); SP20.hit(this, T, d, 1.3); yield* wait(10);
      Sound.sfx('crit'); const E = SP20.through(this, T, d, 60, { w: 8, fl: 70 }); SP20.helix(this, T, E, P, { r: 14, turns: 3, dur: 22, spin: 1 }); HD15.ring(this, E, P, 4, 30, { w: 2, fl: 0.5, rot: d.an + Math.PI / 2, dur: 16 });
      if (brk) { this.spawn({ k: 'flash', c: '#e6f4ff', a: 0.35, life: 8 }); HD15.ring(this, T, HD15.P.white, 8, 70, { w: 3, dur: 20 }); HD15.flare(this, T, P, 140, { rot: d.an, dur: 18 }); }
      this.shake = Math.max(this.shake || 0, brk ? 10 : 7); yield* wait(16); } },
  // 蒼龍躍（落下）：天上一點寒光 → 一道粗大的蒼藍槍光從天上斜斜刺下來扎進對手，主角跟著落下 → 停格、畫面一白，
  //   落點的地面炸開兩圈衝擊波、地裂、碎石往上噴，槍光往上一道長光芒
  zjAzure: { *f(U, T, u) { const P = SP20.P(), v = DG17.vAt(this, T), foot = v && v.foot ? v.foot : T.y + 24; HD15.dim(this, 0.45, 70, { col: '#020818', inn: 0.1, out: 0.4 });
      const { dr, d } = yield* SP20.fall(this, T, { w: 15 }); Sound.sfx('bladeHitSuper'); Sound.sfx('quake'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#e6f4ff', a: 0.5, life: 10 });
      SP20.hit(this, T, d, 1.6); HD15.ring(this, { x: T.x, y: foot }, P, 8, 72, { fl: 0.3, w: 3, dur: 22 }); HD15.ring(this, { x: T.x, y: foot }, HD15.P.white, 4, 46, { fl: 0.3, w: 1.6, dur: 16, delay: 3 });
      HD15.cracks(this, { x: T.x, y: foot }, 8, P, { len: 42, fl: 0.3, dur: 50 }); HD15.shards(this, { x: T.x, y: foot - 2 }, 12, { up: 2.6, spd: 3, sz: 3, cols: SP20.DIRT }); HD15.flare(this, T, P, 160, { rot: d.an, dur: 20 }); HD15.spikes(this, T, P, 14, 44);
      this.shake = Math.max(this.shake || 0, 14); yield* wait(16); if (dr) dr(); yield* wait(4); } },
  // 流星龍墜（落下，打全體）：天上落下好幾道蒼藍的流星槍光，一隻一隻砸下去 → 主角化成最粗的一道槍光砸在正中間，
  //   停格、畫面一白，一大圈衝擊波掃過全部、地面大片裂開、碎石，每一隻身上一起炸開
  zjMeteor: { *f(U, T, u) { const P = SP20.P(), L = DG17.foes(this); Sound.sfx('charge'); HD15.dim(this, 0.6, 120, { col: '#020818', inn: 0.08, out: 0.3 });
      L.forEach((v, j) => { const C = this.center(v), ft = v.foot || C.y + 24, A = { x: C.x - 46 + (Math.random() - 0.5) * 10, y: -30 }; HD15.comet(this, A, C, P, 9, { w: 10, delay: j * 6, ease: 'in' });
        DG17.later(this, j * 6 + 9, () => { Sound.sfx('rock'); SP20.hit(this, C, SP20.dir(A, C), 1); HD15.ring(this, { x: C.x, y: ft }, P, 4, 34, { fl: 0.3, w: 2, dur: 16 }); HD15.shards(this, { x: C.x, y: ft - 2 }, 5, { up: 2, spd: 2.4, sz: 2.6, cols: SP20.DIRT }); this.shake = Math.max(this.shake || 0, 5); }); });
      yield* wait(L.length * 6 + 14); const { dr } = yield* SP20.fall(this, T, { from: { x: T.x - 34, y: -50 }, w: 18, drop: 9 });
      Sound.sfx('bladeHitSuper'); Sound.sfx('quake'); HD15.stop(this, 10); this.spawn({ k: 'flash', c: '#e6f4ff', a: 0.55, life: 12 }); const G = { x: T.x, y: T.y + 26 };
      HD15.flash(this, T, P, 120, { dur: 22 }); HD15.ring(this, G, P, 10, 124, { fl: 0.3, w: 3.4, dur: 26 }); HD15.ring(this, G, HD15.P.white, 6, 82, { fl: 0.3, w: 1.8, dur: 20, delay: 4 }); HD15.cracks(this, G, 12, P, { len: 72, fl: 0.3, dur: 60 });
      HD15.flare(this, T, P, 240, { rot: 0, dur: 24, x8: 1 }); HD15.shards(this, G, 16, { up: 3, spd: 3.6, sz: 3.2, cols: SP20.DIRT }); for (const v of L) SP20.hit(this, this.center(v), { an: -Math.PI / 2, ux: 0, uy: -1 }, 1.1, { delay: 2 });
      this.shake = Math.max(this.shake || 0, 18); yield* wait(20); if (dr) dr(); yield* wait(4); } },
  // 貫日神槍（奧義，全體，無視 60% 物防）：舞台暗下來，光往槍尖聚、越聚越亮 → 主角化成一道光消失 → 光斜斜衝到最左邊，
  //   橫著一口氣穿過每一隻（穿過的那一下一隻一隻閃）→ 一根光做成的長槍把全部串在一起，停格、畫面一白 →
  //   光往天上衝、在天頂炸成一輪白光（貫日）→ 光從天頂一道道刺下來，每一隻一起炸開；主角最後在原地出現
  ogSpear: { *f(U, T, u) { const P = SP20.P(), Wh = HD15.P.white, A = SP20.hand(this), L = DG17.foes(this).sort((a, c) => this.center(a).x - this.center(c).x), Cs = L.map(v => this.center(v));
      const Y = Cs.length ? Cs.reduce((s, c) => s + c.y, 0) / Cs.length : T.y, x0 = Cs.length ? Math.min(...Cs.map(c => c.x)) - 52 : T.x - 70, x1 = Cs.length ? Math.max(...Cs.map(c => c.x)) + 52 : T.x + 70, S = { x: x0, y: Y + 10 }, E = { x: x1, y: Y - 6 }, Sun = { x: (x0 + x1) / 2, y: 10 };
      Sound.sfx('charge'); HD15.dim(this, 0.76, 190, { col: '#020818', inn: 0.06, out: 0.2 }); HD15.gather(this, A, 22, P, 54, { span: 18, life: 20 }); HD15.flash(this, A, Wh, 36, { dur: 30 }); HD15.flare(this, A, P, 70, { rot: 0, spin: 1.2, dur: 30, x8: 1 }); yield* wait(24);
      Sound.sfx('wind'); HD15.flash(this, DS16.hands(this).Hc, Wh, 60, { dur: 12 }); SP20.hide(this); HD15.comet(this, A, S, P, 8, { w: 16 }); yield* wait(8);
      Sound.sfx('blade'); HD15.comet(this, S, E, P, 12, { w: 18, ease: 'in' }); Cs.forEach((C, j) => { const q = (C.x - x0) / Math.max(1, x1 - x0); DG17.later(this, Math.round(q * 12), () => { Sound.sfx('bladeHit'); HD15.flash(this, C, Wh, 40, { dur: 10 }); SP20.through(this, C, { an: 0, ux: 1, uy: 0 }, 30, { w: 4, fl: 36 }); }); }); yield* wait(12);
      HD15.thrust(this, S, E, P, { w: 12, ext: 12, dur: 46 }); HD15.thrust(this, S, E, Wh, { w: 4, ext: 10, dur: 42, delay: 1 });
      Sound.sfx('bladeHitSuper'); Sound.sfx('heavy'); HD15.stop(this, 10); this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 10 }); for (const C of Cs) SP20.hit(this, C, { an: 0, ux: 1, uy: 0 }, 1.4); this.shake = Math.max(this.shake || 0, 12); yield* wait(12);
      Sound.sfx('wind'); HD15.comet(this, E, Sun, P, 10, { w: 14 }); yield* wait(10);
      Sound.sfx('crit'); Sound.sfx('quake'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#ffffff', a: 0.6, life: 12 }); HD15.flash(this, Sun, Wh, 150, { dur: 26 }); HD15.flash(this, Sun, P, 110, { dur: 30 }); HD15.flare(this, Sun, Wh, 280, { rot: 0, dur: 28, x8: 1 });
      HD15.ring(this, Sun, P, 10, 120, { w: 3.4, dur: 26 }); HD15.ring(this, Sun, Wh, 6, 80, { w: 2, dur: 22, delay: 4 }); yield* wait(6);
      Cs.forEach((C, j) => { HD15.thrust(this, { x: Sun.x + (C.x - Sun.x) * 0.15, y: Sun.y + 10 }, C, P, { w: 10, ext: 16, dur: 22, delay: j * 2 }); HD15.thrust(this, { x: Sun.x + (C.x - Sun.x) * 0.15, y: Sun.y + 10 }, C, Wh, { w: 3.6, ext: 14, dur: 20, delay: j * 2 + 1 });
        DG17.later(this, j * 2 + 5, () => { HD15.flash(this, C, P, 80, { dur: 20 }); HD15.ring(this, C, P, 6, 52, { w: 2.8, dur: 20 }); HD15.flare(this, C, Wh, 120, { rot: Math.PI / 2, dur: 20 }); HD15.sparks(this, C, 20, P, { spd: 5, life: 22, g: 0.05 }); HD15.spikes(this, C, Wh, 12, 40); }); });
      yield* wait(6 + Cs.length * 2); Sound.sfx('bladeHitSuper'); this.spawn({ k: 'flash', c: '#e6f4ff', a: 0.4, life: 10 }); this.shake = Math.max(this.shake || 0, 16); yield* wait(22); SP20.show(this); yield* wait(8); } },
};
// 長槍的三個特技：貫心（追擊，無視物防）、旋槍（追擊全體）、凝息（下一擊必定會心）
const HDSP20 = [
  // 貫心：一槍直直穿過心口，停格，光從背後透出去、背後一道長光芒
  { *f(U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('blade'); const d = SP20.lance(this, T, { w: 8, ext: 30, dur: 16 }); yield* wait(3); Sound.sfx('crit'); HD15.stop(this, 5);
      SP20.hit(this, T, d, 1.2); SP20.through(this, T, d, 58, { w: 7, fl: 72 }); HD15.ring(this, T, HD15.P.white, 4, 26, { w: 2, fl: 0.45, rot: d.an + Math.PI / 2, dur: 14 }); yield* wait(12); } },
  // 旋槍：槍在頭上轉成一個大風車，平平地捲過全體，經過每一隻都閃一下
  { *f(U, T, u) { const P = SP20.P(), L = DG17.foes(this), C = { x: T.x, y: T.y + 6 }; Sound.sfx('wind'); yield* this.lunge(u, 12, 2); Sound.sfx('blade');
      HD15.whirl(this, C, P, { r: 82, th: 10, fl: 0.32, turns: 1.3, trail: 3.6, dur: 28, spark: 1 }); HD15.whirl(this, C, HD15.P.white, { r: 78, th: 3.5, fl: 0.32, turns: 1.3, trail: 3, dur: 26, delay: 1 }); yield* wait(6);
      L.forEach((v, j) => { const P0 = this.center(v); DG17.later(this, j * 3, () => { Sound.sfx('bladeHit'); SP20.hit(this, P0, { an: j % 2 ? Math.PI : 0, ux: j % 2 ? -1 : 1, uy: 0 }, 0.8); }); });
      yield* wait(14 + L.length * 3); this.shake = Math.max(this.shake || 0, 4); yield* wait(6); } },
  // 凝息：屏住呼吸——舞台稍暗，蒼藍的光點慢慢往槍尖收，槍尖一點寒光（十字光芒）一閃，腳下一圈靜靜的波紋
  { *f(U, T, u) { const P = SP20.P(), H = DS16.hands(this), G = { x: H.Hc.x, y: HERO_FOOT - 2 }; HD15.dim(this, 0.3, 50, { col: '#020818', inn: 0.2, out: 0.3 }); Sound.sfx('charge');
      HD15.gather(this, H.R, 14, P, 40, { span: 16, life: 20 }); HD15.ring(this, G, P, 30, 8, { fl: 0.3, w: 1.4, dur: 24 }); yield* wait(22);
      Sound.sfx('tick'); HD15.flash(this, H.R, HD15.P.white, 26, { dur: 14 }); HD15.flare(this, H.R, HD15.P.white, 56, { rot: Math.PI / 4, dur: 18, x8: 1 }); HD15.ring(this, G, P, 6, 36, { fl: 0.3, w: 1.4, dur: 18 }); yield* wait(20); } },
];
if (SP20.live) for (const k in HDFX20) { const id = 't_' + k, D = DEF.skills[id], F = HDFX20[k]; if (!D) { bvErr('v12.101', 'no skill ' + id); continue; } const key = 'hd15_' + k;
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.h.call(this, U, T, u, i, t); };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
if (SP20.live) { const kd = TREE_KINDS11.indexOf('長槍'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.call(this, U, T, u, t); };
  HDSP20.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.101', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]); }); }
// 跳起來的那一回合（蒼龍躍・流星龍墜蓄力）
{ const _fc = FX.charge; FX.charge = function* (U, ...a) { if (this.leap13 && HD15.on && SP20.on()) { this.leap13 = false; this.hd15cast = 1; yield* SP20.leap(this); return; } yield* _fc.call(this, U, ...a); }; }
// 普通攻擊：一刺；分段的第二、三下換個角度再刺
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && SP20.live && this._thKind === '長槍')) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0;
    yield* this.lunge(u, 10, 2); Sound.sfx('blade'); const d = SP20.lance(this, T, { w: 6, ext: 26, dur: 14, wind: 2 }); yield* wait(3); SP20.hit(this, T, d, 0.8); yield* wait(7); };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && SP20.live && kind === '長槍')) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; yield* b.lunge(s, 6, 2); Sound.sfx('blade');
    const A = SP20.hand(b), F = { x: A.x + [-10, 10, 0][i % 3], y: A.y }, d = SP20.lance(b, C, { from: F, w: 5, ext: 22, dur: 12, wind: 0 }); yield* wait(3); SP20.hit(b, C, d, 0.7); yield* wait(4); }; }
// 迴槍架勢架開攻擊的那一下（舊的線條和星星不畫）
{ const H = Battle.prototype.handlers, _re = H.REACTION; H.REACTION = function* (e, s, t, P) {
    if (!(HD15.on && s && s.hero && SP20.on() && typeof ctrInfo12 === 'function' && ctrInfo12(s, P && P.why).kind === 'parry')) return yield* _re.call(this, e, s, t, P);
    const g = _re.call(this, e, s, t, P); let r; DS16.mute = 1; try { r = g.next(); } finally { DS16.mute = 0; }
    const C = this.center(s), A = this.center(t || this.F), d = ctrDir12(C, A); SP20.parry(this, { x: C.x + d.x * 16, y: C.y + d.y * 16 });
    while (!r.done) { const v = yield r.value; r = g.next(v); } return r.value; }; }
// 反擊：往後一收、踏上去 → 一記突刺，停格；然後站一下、走回來（跟舊的同一套動作）
{ const _c = FX.ctr12; FX.ctr12 = function* (U, T, u) { const K = this.ctrNow12 || {}, v = u && u.id ? this.views[u.id] || u : u, o = v && v.off;
    if (!(HD15.on && u && u.hero && SP20.on() && K.kind !== 'block' && o)) return yield* _c.call(this, U, T, u);
    this.slashOn = 0; this.hd15cast = 1; const d0 = ctrDir12(U, T), x0 = o.x, y0 = o.y, H = DS16.hands(this);
    this.anim(v, 'cast', CTR12.BACK + 2, true); Sound.sfx('charge'); yield* tween(CTR12.BACK, q => { const e = Math.sin(q * Math.PI / 2); o.x = x0 - d0.x * 8 * e; o.y = y0 - d0.y * 8 * e; });
    HD15.flare(this, H.R, SP20.P(), 28, { rot: -0.8, dur: 10 }); this.anim(v, 'attack', CTR12.STEP + 26); const far = 22;
    for (let i = 1; i <= CTR12.STEP; i++) { const q = i / CTR12.STEP, e = q * q * (3 - 2 * q); o.x = x0 + d0.x * (-8 + (far + 8) * e); o.y = y0 + d0.y * (-8 + (far + 8) * e); yield; }
    Sound.sfx('blade'); const d = SP20.lance(this, T, { w: 8, ext: 32, dur: 16, wind: 3 }); yield* wait(3); HD15.stop(this, 3); SP20.hit(this, T, d, 1.1); SP20.through(this, T, d, 36); this.shake = Math.max(this.shake || 0, 5);
    yield* wait(6); this.ctrRet12 = { v, x: o.x, y: o.y, x0: 0, y0: 0, at: this.t + CTR12.HOLD, dur: CTR12.RET }; }; }
HD15.use(HD15.on);
