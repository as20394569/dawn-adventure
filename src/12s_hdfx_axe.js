/* ===================== v12.102 斧的新特效（高解析光效） =====================
   玩家 2026-10-10：「其他的武器也能同步一起重製 除了新特效外 角色的佔位 音效 表現方式都要做出每種武器的特色」
   → 配色選「每種一個主色」：斧＝熔岩赤橙；佔位：大步跳上去、落地震一下（12y_hdfx_stance.js）。
   斧的表現：又厚又重的弧（AX21.cleave：頭粗、熱度高、尾巴拖著暗紅的餘熱，不是劍那種細長的刀光）、
   砍下去一定有停格和震動、地面裂開發出熔岩的光、碎石往上噴、火星（有重力，會掉下來）。不冒煙（之前黑煙被說像黑球）。
   聲音：揮動「呼——」又低又重、打中「轟咔」（02_audio.js 的 axSwing、axHit…）。蓄力的招（崩城擊、天崩地裂）蓄力那一回合把斧頭舉高、熔岩的光往斧頭聚。
   先只在特效測試版（AX21.live）；玩家看過說好才放進正式版。 */
const AX21 = { live: typeof fxtest13 === 'function' && fxtest13() };
HD15.P.lava = { core: '#fff2c8', mid: '#ff7a1e', glow: '#ff3a08', edge: '#4a1002', keep: 1 };
HD15.P.shield = { core: '#ffffff', mid: '#bfe4ff', glow: '#5aa8ff', edge: '#1a3a6a', keep: 1 };
AX21.P = () => HD15.P.lava;
AX21.ROCK = ['#c8b090', '#8a7058', '#3e3024'];
AX21.on = () => AX21.live && DG17.kind() === '斧';
AX21.hand = b => DS16.hands(b).R;
AX21.foot = (b, v, T) => v && v.foot ? v.foot : T.y + 24;
// 重斧的一劈（v12.103 玩家：「斧的特效不錯 可是角度不對 我們是面向怪物」——鏡頭在主角背後、面向怪物，
//   往下劈的弧在畫面上是「由上往下砸」的一道（弧所在的面朝著鏡頭的深度方向，看起來幾乎是直的、只往上微微鼓），不是側面看的月牙）：
//   d＝劈的方向：v 從正上方砸下、dl 從右上往左下、dr 從左上往右下、ul／ur 由下往上撩、h 橫掃；斧頭先慢後快、頭最粗最亮，尾巴拖著暗紅的餘熱，火星順著劈的方向噴
AX21.PATH = { v: [[3, -66], [0, 16], 5], dl: [[42, -54], [-30, 20], 9], dr: [[-42, -54], [30, 20], -9], ul: [[30, 22], [-42, -50], -9], ur: [[-30, 22], [42, -50], 9], h: [[-62, -4], [62, 6], -7] };
AX21.cleave = (b, T, d, o = {}) => { const [A0, B0, bulge] = AX21.PATH[d] || AX21.PATH.v, sc = (o.r || 46) / 46, P = o.pal || AX21.P(), th = (o.th || 14) * 1.15, dur = o.dur || 22, dl = o.delay || 0, sw = o.sw || 6, N = 30;
  const A = { x: T.x + A0[0] * sc, y: T.y + A0[1] * sc }, B = { x: T.x + B0[0] * sc, y: T.y + B0[1] * sc }, dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, bg = bulge * sc;
  const C = u => [A.x + dx * u + nx * bg * Math.sin(Math.PI * u), A.y + dy * u + ny * bg * Math.sin(Math.PI * u)], an = Math.atan2(dy, dx);
  return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur,
    upd: p => { const t = p.t - dl; if (t < 1 || t > sw + 1) return; const [hx, hy] = C(Math.pow(HD15.cl(t / sw), 1.5)); HD15.sparks(b, { x: hx, y: hy }, 3, P, { ang: an, spread: 1.1, spd: 2.8, life: 18, g: 0.14 }); },
    draw: (x, p, k, t) => { const hd = Math.pow(HD15.cl(t / sw), 1.5), er = HD15.ei(HD15.cl((t - sw - 2) / (dur - sw - 2))) * hd, f = 1 - HD15.ei(HD15.cl((t - sw) / (dur - sw))); if (hd - er < 0.01) return;
      const U = i => er + (hd - er) * i / N, W = (u, w) => { const v = (u - er) / Math.max(1e-4, hd - er); return w * (0.16 + 0.84 * Math.pow(v, 0.7)) * (v > 0.93 ? (1 - v) / 0.07 * 0.55 + 0.45 : 1); };
      const band = w => { x.beginPath(); for (let i = 0; i <= N; i++) { const u = U(i), [px, py] = C(u), h = W(u, w) / 2; i ? x.lineTo(px + nx * h, py + ny * h) : x.moveTo(px + nx * h, py + ny * h); } for (let i = N; i >= 0; i--) { const u = U(i), [px, py] = C(u), h = W(u, w) / 2; x.lineTo(px - nx * h, py - ny * h); } x.closePath(); };
      const [tx, ty] = C(er), [hx, hy] = C(hd), grad = (c, a, a0 = 0.15) => { const G = x.createLinearGradient(tx, ty, hx, hy); G.addColorStop(0, HD15.rgba(c, a * a0)); G.addColorStop(0.6, HD15.rgba(c, a * 0.8)); G.addColorStop(1, HD15.rgba(c, a)); return G; };
      x.lineJoin = 'round'; x.globalAlpha = f;
      x.globalCompositeOperation = 'lighter'; band(th * 2.2); x.fillStyle = grad(P.glow, 0.55); x.fill();
      x.globalCompositeOperation = 'source-over'; band(th * 1.08); x.fillStyle = grad(P.edge, 0.8, 0.4); x.fill(); band(th * 0.86); x.fillStyle = grad(P.mid, 0.95); x.fill(); band(th * 0.32); x.fillStyle = grad(P.core, 1, 0.05); x.fill();
      if (t <= sw + 2) { HD15.put(x, HD15.tex('glow', P.mid), hx, hy, th * 4, th * 4, 0, 0.8 * f); HD15.put(x, HD15.tex('core', P.mid), hx, hy, th * 1.4, th * 1.4, 0, f); } } }); };
// 砍中：停格、熔岩閃光、白熱光芒、火星（會掉下來）、一圈衝擊波；s 越大越重
AX21.impact = (b, T, s = 1, o = {}) => { const P = AX21.P(), dl = o.delay || 0; HD15.flash(b, T, P, 40 * s, { dur: 14, delay: dl }); HD15.flare(b, T, HD15.P.white, 50 * s, { rot: o.rot ?? Math.PI / 4, dur: 14, x8: s >= 1.2 ? 1 : 0, delay: dl });
  HD15.sparks(b, T, Math.round(14 * s), P, { spd: 3.6 * Math.min(1.6, s), life: 22, g: 0.14, delay: dl }); HD15.ring(b, T, P, 4, 30 * s, { w: 2.6, dur: 16, delay: dl }); if (s >= 1) HD15.spikes(b, T, P, Math.round(8 * s), 22 * s, { delay: dl }); };
// 地面：熔岩光的裂痕、一圈壓扁的衝擊波、碎石往上噴
AX21.ground = (b, G, s = 1, o = {}) => { const P = AX21.P(), dl = o.delay || 0; HD15.cracks(b, G, Math.round(6 * s), P, { len: 30 * s, fl: 0.3, dur: 46, delay: dl }); HD15.ring(b, G, P, 6, 40 * s, { fl: 0.3, w: 2.4, dur: 18, delay: dl });
  HD15.shards(b, { x: G.x, y: G.y - 2 }, Math.round(7 * s), { up: 2.4 * Math.min(1.5, s), spd: 2.6, sz: 2.8, cols: AX21.ROCK, delay: dl }); };
// 護盾被削掉：藍白色的碎片＋一圈裂開的六角
AX21.chip = (b, T, n = 1, o = {}) => { const dl = o.delay || 0; for (let i = 0; i < n; i++) { const d2 = dl + i * 6; HD15.shards(b, T, 7, { spd: 3.4, up: 0.8, sz: 3, cols: ['#ffffff', '#9ad0ff', '#2a5a9a'], delay: d2 }); if (typeof SP20 !== 'undefined') SP20.hex(b, { x: T.x, y: T.y + 2 }, 22 + i * 6, HD15.P.shield, { hold: 2 + i, delay: d2 }); } };
// 舉斧：斧頭上熔岩的光聚起來
AX21.raise = (b, n = 10) => { const P = AX21.P(), A = AX21.hand(b), C = { x: A.x + 2, y: A.y - 14 }; HD15.gather(b, C, n, P, 30, { span: 10 }); HD15.flash(b, C, P, 22, { dur: 16, delay: 6 }); return C; };
// 舉高再劈下：主角往上一提、再重重往下（在站的位置上）
AX21.heave = function* (b, up = 10, fr = 7) { const v = b.H, o = v && v.off; if (!o) return; const y0 = o.y; this.anim && this.anim(v, 'attack', fr + 12); yield* tween(fr, q => { o.y = y0 - up * Math.sin(q * Math.PI / 2); }); yield* tween(3, q => { o.y = y0 - up * (1 - q) + 3 * q; }); yield* tween(3, q => { o.y = y0 + 3 * (1 - q); }); };

const HDFX21 = {
  // 劈山（削 1 格護盾）：斧頭舉高、熔岩的光聚起來 → 一道又厚又重的弧從上往下劈 → 停格、大震，熔岩光的裂痕從腳下往兩邊裂開，護盾碎片噴出
  axSplit: { *f(U, T, u, t) { const v = DG17.vAt(this, T), ft = AX21.foot(this, v, T); AX21.raise(this, 8); Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 8, 6);
      AX21.cleave(this, T, 'v', { r: 50, th: 15, span: 1.8, dur: 24 }); yield* wait(5); Sound.sfx('axHitSuper'); HD15.stop(this, 6); AX21.impact(this, T, 1.2); AX21.ground(this, { x: T.x, y: ft }, 1); AX21.chip(this, T, 1, { delay: 2 });
      HD15.cut(this, { x: T.x, y: ft - 6 }, Math.PI / 2, 26, AX21.P(), { dur: 30, w: 5, gap: 4 }); this.shake = Math.max(this.shake || 0, 9); yield* wait(16); } },
  // 狂吼（自己）：主角往前一吼——腳下炸開三圈橘紅的衝擊波往外擴，畫面震、火星往上竄，身上一陣熱光
  axRoar: { *f(U, T, u) { const P = AX21.P(), H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('charge'); HD15.gather(this, H.Hc, 12, P, 40, { span: 10 }); yield* wait(12);
      Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ff8a3a', a: 0.22, life: 8 }); for (let i = 0; i < 3; i++) { HD15.ring(this, G, P, 8, 60 + i * 18, { fl: 0.32, w: 3 - i * 0.6, dur: 20, delay: i * 5 }); HD15.ring(this, H.Hc, P, 10, 50 + i * 14, { w: 2 - i * 0.4, dur: 18, delay: i * 5 }); }
      HD15.flash(this, H.Hc, P, 60, { dur: 18 }); HD15.flare(this, H.Hc, HD15.P.white, 70, { rot: 0, dur: 16, x8: 1 }); for (let i = 0; i < 14; i++) DG17.later(this, i * 2, () => HD15.mote(this, H.Hc.x + (Math.random() - 0.5) * 34, G.y - Math.random() * 10, (Math.random() - 0.5) * 0.4, -1 - Math.random(), P, { life: 26 }));
      this.shake = Math.max(this.shake || 0, 8); yield* wait(26); } },
  // 迴旋斧（全體）：斧頭甩開轉一大圈，一道又厚又平的熔岩弧掃過全部（經過哪隻那隻停一下、火星噴出）
  axSpin: { *f(U, T, u, t) { const P = AX21.P(), L = DG17.foes(this), C = { x: T.x, y: T.y + 8 }; Sound.sfx('axSwing'); yield* this.lunge(u, 8, 3);
      HD15.whirl(this, C, P, { r: 96, th: 34, fl: 0.34, turns: 1.15, trail: 3.4, dur: 30, spark: 1 }); HD15.whirl(this, C, HD15.P.white, { r: 90, th: 10, fl: 0.34, turns: 1.15, trail: 2.6, dur: 28, delay: 1 }); yield* wait(4);
      L.forEach((v, j) => { const P0 = this.center(v); DG17.later(this, 3 + j * 4, () => { Sound.sfx('axHit'); AX21.impact(this, P0, 0.9, { rot: 0 }); }); });
      yield* wait(14 + L.length * 4); this.shake = Math.max(this.shake || 0, 7); yield* wait(8); } },
  // 碎盾擊（削 2 格護盾）：斧背朝前重重砸兩下——第一下砸出一圈六角護盾的裂紋，第二下整面碎開，藍白碎片和火星一起噴
  axCrush: { *f(U, T, u) { const P = AX21.P(); AX21.raise(this, 8); Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 8, 6); AX21.cleave(this, T, 'dr', { r: 44, th: 14, dur: 20 }); yield* wait(5);
      Sound.sfx('axHit'); HD15.stop(this, 4); AX21.impact(this, T, 1); AX21.chip(this, T, 1); this.shake = Math.max(this.shake || 0, 6); yield* wait(8);
      Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 6, 4); AX21.cleave(this, T, 'v', { r: 50, th: 16, dur: 22 }); yield* wait(5);
      Sound.sfx('axHitSuper'); HD15.stop(this, 7); AX21.impact(this, T, 1.4); AX21.chip(this, T, 2, { delay: 1 }); HD15.ring(this, T, HD15.P.shield, 6, 56, { w: 2.6, dur: 20 }); this.shake = Math.max(this.shake || 0, 10); yield* wait(16); } },
  // 怒濤劈（HP 越低越強）：斜斜一劈，後面跟著一道更大、更淡的熔岩浪（怒濤）；HP 一半以下主角身上先冒紅光，浪更大，HP 剩 20% 再多一道
  axFury: { *f(U, T, u) { const P = AX21.P(), hu = this.core && this.core.byId.H, r = hu && hu.max && hu.max.hp ? hu.res.hp / hu.max.hp : 1, lv = r <= 0.2 ? 2 : r <= 0.5 ? 1 : 0, H = DS16.hands(this);
      if (lv) { Sound.sfx('charge'); HD15.flash(this, H.Hc, HD15.P.crimson, 50 + lv * 16, { dur: 20 }); for (let i = 0; i < 8 + lv * 6; i++) DG17.later(this, i, () => HD15.mote(this, H.Hc.x + (Math.random() - 0.5) * 30, H.Hc.y + 10 - Math.random() * 30, 0, -1.2, HD15.P.crimson, { life: 22 })); yield* wait(12); }
      Sound.sfx('axSwing'); yield* this.lunge(u, 14, 3); AX21.cleave(this, T, 'dl', { r: 48, th: 15, dur: 22 }); for (let i = 1; i <= 1 + lv; i++) AX21.cleave(this, { x: T.x + 4 * i, y: T.y + 2 * i }, 'dl', { r: 48 + i * 16, th: 14 + i * 3, dur: 26, delay: i * 3, pal: i === 2 ? HD15.P.crimson : P });
      yield* wait(5); Sound.sfx(lv ? 'axHitSuper' : 'axHit'); HD15.stop(this, 5 + lv * 2); AX21.impact(this, T, 1 + lv * 0.3); HD15.windLines(this, { x: T.x - 50, y: T.y - 30 }, { x: T.x + 40, y: T.y + 30 }, P, 5 + lv * 3, { spread: 30, len: 40, spd: 10 });
      this.shake = Math.max(this.shake || 0, 6 + lv * 3); yield* wait(16); } },
  // 震地擊（全體；30% 退縮）：主角把斧頭往地上一砸 → 地面炸開一大圈衝擊波，裂痕一路裂到每一隻腳下，每隻腳下碎石往上噴、震一下
  axQuake: { *f(U, T, u) { const P = AX21.P(), L = DG17.foes(this), H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 4 }; AX21.raise(this, 8); Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 10, 7);
      Sound.sfx('axHitSuper'); Sound.sfx('quake'); HD15.stop(this, 5); AX21.impact(this, { x: G.x + 8, y: G.y - 6 }, 1); HD15.ring(this, G, P, 10, 130, { fl: 0.3, w: 3.2, dur: 26 }); HD15.ring(this, G, HD15.P.white, 6, 90, { fl: 0.3, w: 1.6, dur: 20, delay: 3 });
      HD15.cracks(this, G, 8, P, { len: 60, fl: 0.3, dur: 50 }); this.shake = Math.max(this.shake || 0, 10);
      L.forEach((v, j) => { const C = this.center(v), ft = AX21.foot(this, v, C), dl = 5 + Math.round(Math.hypot(C.x - G.x, ft - G.y) / 12); HD15.thrust(this, G, { x: C.x, y: ft }, P, { w: 4, ext: 2, dur: 20, delay: dl - 4, al: 0.7 });
        DG17.later(this, dl, () => { Sound.sfx('rock'); AX21.ground(this, { x: C.x, y: ft }, 0.9); HD15.flash(this, { x: C.x, y: ft - 10 }, P, 34, { dur: 12 }); this.shake = Math.max(this.shake || 0, 5); }); });
      yield* wait(30); } },
  // 崩城擊（蓄力後放出；對破防中的對手 ×1.5）：（蓄力那一回合斧頭舉高、熔岩的光聚在斧頭上）→ 大步跳上去、舉到最高 → 一記最重的劈下：
  //   畫面一白、長停格、大震，一道巨大的熔岩弧，地面大片裂開、碎石大量往上噴，城牆崩塌一樣的大石塊往外飛；對手破防中時多一圈白光、更多碎石
  axCastle: { *f(U, T, u, t) { const P = AX21.P(), v = DG17.vAt(this, T), ft = AX21.foot(this, v, T), cu = v && this.core && this.core.byId[v.id], brk = !!(cu && this.core.statusOf && this.core.statusOf(cu, 'broken'));
      HD15.dim(this, 0.4, 70, { col: '#1a0602', inn: 0.1, out: 0.4 }); AX21.raise(this, 14); Sound.sfx('charge'); yield* AX21.heave.call(this, this, 16, 10); Sound.sfx('axSwing');
      AX21.cleave(this, T, 'v', { r: 60, th: 20, span: 2, dur: 28, sw: 5 }); AX21.cleave(this, { x: T.x + 6, y: T.y }, 'v', { r: 70, th: 14, span: 2, dur: 26, sw: 6, delay: 2, pal: HD15.P.blaze }); yield* wait(5);
      Sound.sfx('axHitSuper'); Sound.sfx('quake'); HD15.stop(this, 10); this.spawn({ k: 'flash', c: '#fff0d8', a: 0.5, life: 10 }); AX21.impact(this, T, 1.8); AX21.ground(this, { x: T.x, y: ft }, 1.8);
      HD15.shards(this, { x: T.x, y: T.y + 6 }, 10, { spd: 4.4, up: 2.4, sz: 5, cols: AX21.ROCK }); HD15.ring(this, { x: T.x, y: ft }, HD15.P.white, 8, 80, { fl: 0.3, w: 2, dur: 22, delay: 3 });
      if (brk) { this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 8 }); HD15.ring(this, T, HD15.P.white, 10, 90, { w: 3.4, dur: 22, delay: 4 }); HD15.shards(this, T, 10, { spd: 5, up: 3, sz: 4, cols: AX21.ROCK, delay: 4 }); }
      this.shake = Math.max(this.shake || 0, brk ? 18 : 15); yield* wait(22); } },
  // 狂戰之血（自己）：主角身上燒起暗紅的火，心跳一樣脈動兩下（紅色的光圈往外擴），血紅的光點往上竄
  axBlood: { *f(U, T, u) { const C = HD15.P.crimson, H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('charge'); HD15.dim(this, 0.3, 60, { col: '#1a0004', inn: 0.1, out: 0.3 });
      HD15.flames(this, { x: G.x, y: G.y - 2 }, 14, C, { w: 30, h: 34, span: 20, life: 26 });
      for (let i = 0; i < 2; i++) DG17.later(this, 8 + i * 12, () => { Sound.sfx('heavy'); HD15.ring(this, H.Hc, C, 8, 46, { w: 2.6, dur: 16 }); HD15.flash(this, H.Hc, C, 44, { dur: 12 }); this.shake = Math.max(this.shake || 0, 4); });
      for (let i = 0; i < 16; i++) DG17.later(this, i * 2, () => HD15.mote(this, H.Hc.x + (Math.random() - 0.5) * 30, G.y - Math.random() * 20, (Math.random() - 0.5) * 0.4, -1.2 - Math.random(), C, { life: 26 })); yield* wait(36); } },
  // 鐵律重斧（物攻＋物防；50% 物防 −1）：斧頭變成鋼鐵一樣沉（銀色的光聚起來、斧頭一亮）→ 慢慢舉高、一記沉重的劈下：銀色和熔岩兩層的弧，
  //   停格，一圈鋼鐵色的衝擊波、鐵片碎開，地面裂開
  zjIronLaw: { *f(U, T, u) { const P = AX21.P(), S = HD15.P.steel, v = DG17.vAt(this, T), ft = AX21.foot(this, v, T), C = AX21.raise(this, 0); Sound.sfx('charge'); HD15.gather(this, C, 14, S, 36, { span: 12 }); HD15.flare(this, C, HD15.P.white, 46, { rot: 0, dur: 18, x8: 1, delay: 10 }); yield* wait(14);
      Sound.sfx('shGuard'); yield* AX21.heave.call(this, this, 14, 10); Sound.sfx('axSwing'); AX21.cleave(this, T, 'v', { r: 56, th: 18, dur: 26, pal: S }); AX21.cleave(this, { x: T.x + 5, y: T.y }, 'v', { r: 62, th: 12, dur: 24, delay: 2 }); yield* wait(6);
      Sound.sfx('axHitSuper'); Sound.sfx('shHitSuper'); HD15.stop(this, 9); this.spawn({ k: 'flash', c: '#e8f0ff', a: 0.4, life: 8 }); AX21.impact(this, T, 1.5); HD15.ring(this, T, S, 6, 66, { w: 3, dur: 20 }); HD15.shards(this, T, 12, { spd: 4, up: 1.2, sz: 3.4, cols: ['#ffffff', '#9aa8bc', '#3a4458'] });
      AX21.ground(this, { x: T.x, y: ft }, 1.3); this.shake = Math.max(this.shake || 0, 13); yield* wait(18); } },
  // 天崩地裂（奧義；蓄力後放出，打全體）：（蓄力那一回合斧頭高舉、熔岩光柱沖天）→ 舞台暗下來，主角跳到全部魔物前面、舉到最高 →
  //   斧頭整個砸進地面：畫面一白、長停格、大震，地面一道道熔岩裂縫裂到每一隻腳下，每隻腳下熔岩噴出（火柱＋碎石），天上落下碎石；破防中的再炸一次
  ogAxe: { *f(U, T, u, t) { const P = AX21.P(), L = DG17.foes(this), H = DS16.hands(this); HD15.dim(this, 0.62, 140, { col: '#1a0602', inn: 0.08, out: 0.25 }); AX21.raise(this, 18); Sound.sfx('charge');
      yield* AX21.heave.call(this, this, 22, 12); const G = { x: DS16.hands(this).Hc.x, y: HDW_FOOT() - 4 }, I = { x: G.x + 8, y: G.y - 8 };
      Sound.sfx('axHitSuper'); Sound.sfx('quake'); HD15.stop(this, 12); this.spawn({ k: 'flash', c: '#fff0d8', a: 0.55, life: 12 }); AX21.impact(this, I, 1.6); HD15.ring(this, G, P, 12, 150, { fl: 0.3, w: 3.6, dur: 30 }); HD15.ring(this, G, HD15.P.white, 8, 100, { fl: 0.3, w: 2, dur: 24, delay: 4 });
      HD15.cracks(this, G, 12, P, { len: 80, fl: 0.3, dur: 70 }); this.shake = Math.max(this.shake || 0, 16);
      L.forEach((v, j) => { const C = this.center(v), ft = AX21.foot(this, v, C), cu = this.core && this.core.byId[v.id], brk = !!(cu && this.core.statusOf && this.core.statusOf(cu, 'broken')), dl = 6 + j * 4;
        HD15.thrust(this, G, { x: C.x, y: ft }, P, { w: 6, ext: 2, dur: 30, delay: dl - 5, al: 0.8 });
        DG17.later(this, dl, () => { Sound.sfx('fire'); HD15.flames(this, { x: C.x, y: ft }, 16, P, { w: 34, h: 54, span: 10, life: 26 }); HD15.pillar(this, { x: C.x, y: ft }, P, 70, { w: 20, dur: 26 }); AX21.ground(this, { x: C.x, y: ft }, 1.3); HD15.flash(this, C, P, 60, { dur: 16 }); this.shake = Math.max(this.shake || 0, 10);
          if (brk) DG17.later(this, 8, () => { Sound.sfx('axHitSuper'); AX21.impact(this, C, 1.4); }); }); });
      for (let i = 0; i < 10; i++) DG17.later(this, 10 + i * 3, () => HD15.shards(this, { x: 20 + Math.random() * (W - 40), y: -6 }, 1, { ang: Math.PI / 2, spread: 0.3, spd: 2.4, up: -1, sz: 3.4, g: 0.24, cols: AX21.ROCK, life: 40 }));
      yield* wait(40 + L.length * 4); } },
};
// 斧的三個特技：崩岩（追擊，削護盾）、蠻勇（自己物攻 +）、地鳴（追擊，退縮）
const HDSP21 = [
  // 崩岩：斧頭往下一砸，石頭碎開、護盾碎片噴出
  { *f(U, T, u) { const v = DG17.vAt(this, T), ft = AX21.foot(this, v, T); Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 8, 5); AX21.cleave(this, T, 'v', { r: 44, th: 14, dur: 20 }); yield* wait(5);
      Sound.sfx('axHitSuper'); HD15.stop(this, 5); AX21.impact(this, T, 1.1); AX21.ground(this, { x: T.x, y: ft }, 1); AX21.chip(this, T, 1); HD15.shards(this, T, 8, { spd: 3.6, up: 1.6, sz: 4, cols: AX21.ROCK }); this.shake = Math.max(this.shake || 0, 8); yield* wait(14); } },
  // 蠻勇：主角大吼一聲，身上一陣熱光往外炸開，火星往上竄
  { *f(U, T, u) { const P = AX21.P(), H = DS16.hands(this); Sound.sfx('heavy'); HD15.flash(this, H.Hc, P, 56, { dur: 16 }); HD15.flare(this, H.Hc, HD15.P.white, 60, { rot: 0, dur: 14, x8: 1 }); HD15.ring(this, H.Hc, P, 8, 50, { w: 2.4, dur: 16 });
      for (let i = 0; i < 12; i++) DG17.later(this, i * 2, () => HD15.mote(this, H.Hc.x + (Math.random() - 0.5) * 30, H.Hc.y + 16 - Math.random() * 16, (Math.random() - 0.5) * 0.4, -1.2 - Math.random(), P, { life: 24 })); this.shake = Math.max(this.shake || 0, 5); yield* wait(24); } },
  // 地鳴：斧頭往地上一敲，地面一圈震波傳到對手腳下，對手腳下震起碎石
  { *f(U, T, u) { const P = AX21.P(), v = DG17.vAt(this, T), ft = AX21.foot(this, v, T), G = { x: DS16.hands(this).Hc.x, y: HDW_FOOT() - 4 }; Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 8, 5);
      Sound.sfx('quake'); HD15.ring(this, G, P, 8, 60, { fl: 0.3, w: 2.6, dur: 18 }); HD15.thrust(this, G, { x: T.x, y: ft }, P, { w: 4, ext: 2, dur: 16, al: 0.7 }); yield* wait(6);
      Sound.sfx('axHit'); AX21.ground(this, { x: T.x, y: ft }, 1.1); HD15.flash(this, T, P, 40, { dur: 12 }); this.shake = Math.max(this.shake || 0, 7); yield* wait(14); } },
];
if (AX21.live) for (const k in HDFX21) { const id = 't_' + k, D = DEF.skills[id], F = HDFX21[k]; if (!D) { bvErr('v12.102', 'no skill ' + id); continue; } const key = 'hd15_' + k;
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.h.call(this, U, T, u, i, t); };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
if (AX21.live) { const kd = TREE_KINDS11.indexOf('斧'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.call(this, U, T, u, t); };
  HDSP21.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.102', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]); }); }
// 蓄力那一回合（崩城擊、天崩地裂）：斧頭舉高，熔岩的光往斧頭聚、越聚越亮；天崩地裂再加一道熔岩光柱沖天、地面發燙
{ const H = Battle.prototype.handlers, _ch = H.CHARGE; H.CHARGE = function* (e, s, t, P) { this.ax21chg = HD15.on && AX21.on() && s && s.hero && P && (P.skill === 't_axCastle' || P.skill === 't_ogAxe') ? P.skill : null; try { yield* _ch.call(this, e, s, t, P); } finally { this.ax21chg = null; } };
  const _fc = FX.charge; FX.charge = function* (U, ...a) { const k = this.ax21chg; if (!k) return yield* _fc.call(this, U, ...a); this.ax21chg = null; this.hd15cast = 1; const P = AX21.P(), Hd = DS16.hands(this), G = { x: Hd.Hc.x, y: HDW_FOOT() - 2 };
    Sound.sfx('charge'); const C = AX21.raise(this, 18); HD15.flash(this, C, P, 44, { dur: 30, delay: 10 }); HD15.flare(this, C, HD15.P.white, 60, { rot: 0, spin: 1, dur: 30, x8: 1, delay: 8 }); HD15.ring(this, G, P, 34, 8, { fl: 0.3, w: 2, dur: 24 }); HD15.flames(this, G, 10, P, { w: 34, h: 28, span: 24, life: 22 }); HD15.ring(this, Hd.Hc, P, 40, 10, { w: 2, dur: 22, delay: 6 });
    for (let i = 0; i < 14; i++) DG17.later(this, i * 2, () => HD15.mote(this, Hd.Hc.x + (Math.random() - 0.5) * 34, G.y - Math.random() * 10, (Math.random() - 0.5) * 0.4, -1 - Math.random(), P, { life: 26 }));
    if (k === 't_ogAxe') { HD15.pillar(this, { x: C.x, y: C.y + 4 }, P, 120, { w: 16, dur: 34, delay: 8 }); HD15.cracks(this, G, 6, P, { len: 26, fl: 0.3, dur: 40, delay: 10 }); this.shake = Math.max(this.shake || 0, 4); }
    yield* wait(34); }; }
// 普通攻擊：舉高、重重一劈（左上→右下、右上→左下輪流）；分段的第二、三下也是劈
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && AX21.live && this._thKind === '斧')) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0; const n = this.ax21atk = ((this.ax21atk || 0) + 1) % 2;
    yield* this.lunge(u, 12, 4); Sound.sfx('axSwing'); AX21.cleave(this, T, n ? 'dl' : 'dr', { r: 40, th: 12, dur: 18 }); yield* wait(4); AX21.impact(this, T, 0.8); this.shake = Math.max(this.shake || 0, 4); yield* wait(8); };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && AX21.live && kind === '斧')) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; yield* b.lunge(s, 8, 3); Sound.sfx('axSwing');
    AX21.cleave(b, C, ['v', 'dl', 'dr'][i % 3], { r: 38, th: 11, dur: 16 }); yield* wait(4); AX21.impact(b, C, 0.7); b.shake = Math.max(b.shake || 0, 3); yield* wait(5); }; }
HD15.use(HD15.on);
