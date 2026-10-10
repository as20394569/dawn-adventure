/* ===================== v12.102 法杖的新特效（高解析光效） =====================
   配色：魔力紫藍（HD15.P.arcane）；佔位：站在原地（後排）施法，不往前衝（12y_hdfx_stance.js）。
   法杖的表現：施法時腳下（或杖尖前面）展開一個會轉的魔法陣（ST23.circle：兩圈環、轉動的符文刻度、六芒星），杖尖亮起；
   魔力從杖尖飛出去（光彈、光束、魔力槍），打中是「嗡——啵」的魔力爆開（環、光芒、魔力光粒），不是刀光也不是火花。
   聲音：施法的一串晶瑩音、光彈的「咻嗚」、魔力爆開（stCast、stBolt、stHit…）。
   先只在特效測試版（ST23.live）；玩家看過說好才放進正式版。 */
const ST23 = { live: true };   // v12.104 正式版也開
HD15.P.arcane = { core: '#ffffff', mid: '#a88cff', glow: '#5a4cff', edge: '#1a0e5a', keep: 1 };
ST23.P = () => HD15.P.arcane;
ST23.on = () => ST23.live && DG17.kind() === '法杖';
ST23.tip = b => { const R = DS16.hands(b).R; return { x: R.x + 1, y: R.y - 16 }; };
// 魔法陣：兩圈環＋轉動的刻度＋六芒星；fl＝壓扁（貼地 0.32、立起來 1）；長出來、轉、hold 以後淡掉（burst 時往外擴散）
ST23.circle = (b, C, R, pal, o = {}) => { const dl = o.delay || 0, hold = o.hold || 30, fl = o.fl ?? 0.32, sp = o.spin ?? 0.03, out = o.out || 12;
  return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + hold + out, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(t / 10)), e = HD15.cl((t - hold) / out), f = 1 - HD15.ei(e), r = R * g * (1 + 0.25 * HD15.eo(e)), rot = t * sp + (o.rot || 0);
    x.save(); x.translate(p.x, p.y); x.scale(1, fl); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    HD15.put(x, HD15.tex('glow', pal.glow), 0, 0, r * 2.6, r * 2.6, 0, 0.3 * f);
    const st = (c, w, a) => { x.strokeStyle = c; x.lineWidth = w / Math.max(0.5, Math.sqrt(fl)); x.globalAlpha = a * f; x.stroke(); };
    for (const [rr, w] of [[r, 1.6], [r * 0.8, 1]]) { x.beginPath(); x.arc(0, 0, rr, 0, Math.PI * 2); st(pal.glow, w * 3, 0.45); st(pal.mid, w, 1); }
    x.beginPath(); for (let i = 0; i < 24; i++) { const a = rot + i * Math.PI / 12, r0 = r * 0.82, r1 = r * (i % 3 ? 0.9 : 0.97); x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); } st(pal.mid, 1, 0.9);
    for (const s0 of [0, Math.PI / 3]) { x.beginPath(); for (let i = 0; i <= 3; i++) { const a = -rot * 1.4 + s0 + i * Math.PI * 2 / 3 - Math.PI / 2, X = Math.cos(a) * r * 0.78, Y = Math.sin(a) * r * 0.78; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } st(pal.glow, 2.6, 0.35); st(pal.core, 0.8, 0.9); }
    x.beginPath(); x.arc(0, 0, r * 0.3, 0, Math.PI * 2); st(pal.mid, 0.9, 0.8); x.restore(); } }); };
// 魔力爆開：環、光芒、魔力光粒往外散（沒有刀光、火花）
ST23.pop = (b, T, s = 1, o = {}) => { const P = o.pal || ST23.P(), dl = o.delay || 0; HD15.flash(b, T, P, 36 * s, { dur: 14, delay: dl }); HD15.ring(b, T, P, 4, 30 * s, { w: 2.4, dur: 16, delay: dl }); HD15.ring(b, T, HD15.P.white, 3, 18 * s, { w: 1.4, dur: 12, delay: dl + 2 });
  HD15.flare(b, T, HD15.P.white, 46 * s, { rot: o.rot ?? 0, dur: 14, x8: s >= 1.2 ? 1 : 0, delay: dl }); for (let i = 0; i < Math.round(8 * s); i++) { const a = Math.random() * Math.PI * 2, v = 0.8 + Math.random() * 1.6 * s; DG17.later(b, dl + 1, () => HD15.mote(b, T.x, T.y, Math.cos(a) * v, Math.sin(a) * v, P, { life: 22 })); } };
// 杖尖亮起＋腳下的魔法陣（施法的起手）
ST23.cast = function* (b, o = {}) { const P = o.pal || ST23.P(), H = DS16.hands(b), A = ST23.tip(b), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('stCast');
  ST23.circle(b, G, o.R || 30, P, { hold: o.hold || 24, spin: 0.05 }); HD15.gather(b, A, o.n || 10, P, 26, { span: 8 }); HD15.flash(b, A, P, 22, { dur: (o.w || 12) + 6, delay: 4 }); yield* wait(o.w || 12); return A; };
// 光彈（拖著尾巴）從 A 飛到 T
ST23.bolt = (b, A, T, o = {}) => HD15.comet(b, A, T, o.pal || ST23.P(), o.dur || 10, { w: o.w || 9, delay: o.delay || 0 });
// 光束：從 A 一直打到 T 的粗光（兩層＋白芯），持續一下
ST23.beam = (b, A, T, o = {}) => { const P = o.pal || ST23.P(), dl = o.delay || 0, w = o.w || 10, dur = o.dur || 22; return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(t / 3)), f = 1 - HD15.ei(HD15.cl((k - 0.5) / 0.5)), ww = w * (0.6 + 0.4 * Math.sin(Math.min(1, t / 3) * Math.PI / 2)) * (1 - 0.5 * HD15.cl((k - 0.5) / 0.5)) * (1 + 0.08 * Math.sin(t * 1.3));
    const E = { x: A.x + (T.x - A.x) * g, y: A.y + (T.y - A.y) * g }; x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    for (const [c, wm, a] of [[P.glow, 2.2, 0.45], [P.mid, 1, 0.9], [P.core, 0.36, 1]]) { x.globalAlpha = a * f; x.strokeStyle = c; x.lineWidth = ww * wm; x.beginPath(); x.moveTo(A.x, A.y); x.lineTo(E.x, E.y); x.stroke(); }
    HD15.put(x, HD15.tex('glow', P.mid), E.x, E.y, ww * 4, ww * 4, 0, 0.8 * f); HD15.put(x, HD15.tex('glow', P.mid), A.x, A.y, ww * 3, ww * 3, 0, 0.7 * f); } }); };

const HDFX23 = {
  // 魔力箭（3 段，回 2 MP）：杖尖亮起 → 三支魔力箭從杖尖弧線飛出去（左、右、正中），一支一支打中、魔力爆開；最後藍色的光點飛回主角身上
  stArrows: { *f(U, T, u) { const A = yield* ST23.cast(this, { w: 10 }); yield* ST23.arrow(this, A, T, 0); }, *h(U, T, u, i) { yield* ST23.arrow(this, ST23.tip(this), T, i); } },
  // 魔力槍（50% 魔防 −1）：杖尖前面一面立起來的魔法陣，魔力在陣中心凝成一根長槍 → 射出去扎進對手，停格，槍身碎成光粒
  stLance: { *f(U, T, u) { const P = ST23.P(), A = ST23.tip(this), d = SP20.dir(A, T), F = { x: A.x + d.ux * 14, y: A.y + d.uy * 14 }; Sound.sfx('stCast'); ST23.circle(this, F, 16, P, { fl: 1, hold: 22, spin: 0.08 }); HD15.gather(this, F, 12, P, 30, { span: 10 }); yield* wait(14);
      Sound.sfx('stBolt'); HD15.thrust(this, F, T, P, { w: 12, ext: 30, dur: 22 }); HD15.thrust(this, F, T, HD15.P.white, { w: 4, ext: 26, dur: 20, delay: 1 }); yield* wait(4);
      Sound.sfx('stHitSuper'); HD15.stop(this, 4); ST23.pop(this, T, 1.2, { rot: d.an }); SP20.through(this, T, d, 30, { w: 5, fl: 40 }); yield* wait(14); } },
  // 法力屏障（自己）：主角身前立起一面六角形的魔力護盾（紫藍、一格一格亮起來），停住、一圈光
  stWall: { *f(U, T, u) { const P = ST23.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 12 }; yield* ST23.cast(this, { w: 8 }); Sound.sfx('shGuard');
      for (let i = 0; i < 3; i++) SP20.hex(this, C, 24 + i * 10, P, { hold: 30 - i * 4, delay: i * 3, fl: 1 }); HD15.flash(this, C, P, 50, { dur: 18, delay: 6 }); HD15.ring(this, C, HD15.P.white, 10, 50, { w: 1.6, dur: 18, delay: 8 }); yield* wait(30); } },
  // 魔力衝擊（30% 退縮；對蓄力中的對手 ×1.5）：杖往前一指，一顆魔力球射出去 → 在對手身上一口氣炸開：三圈衝擊波、光芒；對手蓄力中時多一道白十字
  stImpact: { *f(U, T, u) { const P = ST23.P(), v = DG17.vAt(this, T), cu = v && this.core && this.core.byId[v.id], chg = !!(cu && this.core.statusOf && this.core.statusOf(cu, 'charging')); const A = yield* ST23.cast(this, { w: 10 });
      Sound.sfx('stBolt'); ST23.bolt(this, A, T, { w: 14, dur: 10 }); yield* wait(10); Sound.sfx('stHitSuper'); HD15.stop(this, 5); ST23.pop(this, T, 1.4); for (let i = 0; i < 3; i++) HD15.ring(this, T, P, 6, 40 + i * 14, { w: 2.6 - i * 0.6, dur: 16, delay: i * 3 });
      if (chg) { this.spawn({ k: 'flash', c: '#ffffff', a: 0.3, life: 8 }); HD15.flare(this, T, HD15.P.white, 140, { rot: 0, dur: 18, x8: 1 }); } this.shake = Math.max(this.shake || 0, chg ? 9 : 6); yield* wait(14); } },
  // 魔力風暴（全體；30% 魔防 −1）：天上展開一個大魔法陣 → 魔力光彈從陣裡一顆顆往下砸到每一隻身上，最後一圈旋風把全部捲一圈
  stStorm: { *f(U, T, u) { const P = ST23.P(), L = DG17.foes(this), Cs = L.map(v => this.center(v)), X = Cs.length ? Cs.reduce((a, c) => a + c.x, 0) / Cs.length : T.x, Sky = { x: X, y: 16 }; yield* ST23.cast(this, { w: 6 });
      Sound.sfx('stCast'); ST23.circle(this, Sky, 70, P, { fl: 0.3, hold: 50, spin: 0.06 }); yield* wait(10);
      for (let q = 0; q < 2; q++) Cs.forEach((C, j) => { const A = { x: Sky.x + (C.x - Sky.x) * 0.4 + (Math.random() - 0.5) * 30, y: Sky.y + 6 }, dl = q * 10 + j * 3; ST23.bolt(this, A, C, { w: 8, dur: 8, delay: dl }); DG17.later(this, dl + 8, () => { Sound.sfx('stHit'); ST23.pop(this, C, 0.8); }); });
      yield* wait(24 + Cs.length * 3); Sound.sfx('wind'); HD15.whirl(this, { x: T.x, y: T.y + 4 }, P, { r: 90, th: 16, fl: 0.3, turns: 1.2, trail: 3, dur: 26, spark: 1 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(20); } },
  // 時之加速（速度 +2、冷卻 −1）：主角身邊一個立起來的時鐘陣（刻度飛快轉、指針轉一圈），綠色的風往上捲
  stHaste: { *f(U, T, u) { const H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 6 }, Wd = HD15.P.wind; Sound.sfx('stCast'); ST23.circle(this, C, 30, ST23.P(), { fl: 1, hold: 34, spin: 0.3 });
      HD15.add(this, { x: C.x, y: C.y, life: 40, draw: (x, p, k, t) => { const f = 1 - HD15.cl((k - 0.8) / 0.2), a = -Math.PI / 2 + t * 0.35; x.globalCompositeOperation = 'lighter'; x.globalAlpha = f; x.strokeStyle = '#ffffff'; x.lineWidth = 1.6; x.lineCap = 'round';
        x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20); x.stroke(); x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(a / 6) * 13, p.y + Math.sin(a / 6) * 13); x.stroke(); } });
      Sound.sfx('tick'); for (let i = 0; i < 4; i++) DG17.later(this, 6 + i * 6, () => Sound.sfx('tick')); HD15.windLines(this, { x: C.x, y: HDW_FOOT() }, { x: C.x, y: C.y - 60 }, Wd, 8, { spread: 40, len: 30, spd: 6, delay: 10 }); yield* wait(40); } },
  // 魔力終曲（用掉全部 MP）：主角身上的魔力（藍色光點）全部往杖尖收，杖尖的光球越長越大（MP 越多越大）→ 一道最粗的光束射出去，停格、畫面一白，大爆開
  stFinale: { *f(U, T, u) { const P = ST23.P(), H = DS16.hands(this), A = ST23.tip(this), sp = Math.min(1, (this.st23spent || 20) / 50), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; HD15.dim(this, 0.55, 110, { col: '#06041a', inn: 0.1, out: 0.25 }); Sound.sfx('charge');
      ST23.circle(this, G, 36, P, { hold: 60, spin: 0.08 }); for (let i = 0; i < 16 + sp * 20; i++) DG17.later(this, i, () => { const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 30; HD15.motes(this, { x: H.Hc.x + Math.cos(a) * r, y: H.Hc.y + Math.sin(a) * r }, A, 1, HD15.P.mp, { dur: 14 }); });
      HD15.add(this, { x: A.x, y: A.y, life: 44, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(t / 36)), s = (8 + 18 * sp) * g; HD15.put(x, HD15.tex('glow', P.glow), p.x, p.y, s * 4, s * 4, 0, 0.8); HD15.put(x, HD15.tex('glow', P.mid), p.x, p.y, s * 2, s * 2, 0, 0.9); HD15.put(x, HD15.tex('core', P.mid), p.x, p.y, s, s, 0, 1); } });
      yield* wait(38); Sound.sfx('stBolt'); Sound.sfx('bladeBig'); ST23.beam(this, A, T, { w: 12 + 10 * sp, dur: 30 }); yield* wait(5);
      Sound.sfx('stHitSuper'); Sound.sfx('quake'); HD15.stop(this, 10); this.spawn({ k: 'flash', c: '#ffffff', a: 0.4 + 0.2 * sp, life: 10 }); ST23.pop(this, T, 1.6 + sp); HD15.ring(this, T, P, 8, 70 + 40 * sp, { w: 3.2, dur: 24 }); this.shake = Math.max(this.shake || 0, 10 + 6 * sp); yield* wait(22); } },
  // 魔導極限（魔攻 +2、技能 MP +50%）：主角身邊三個魔法陣一層層疊起來（腳下、身邊、頭上），一起轉、一起亮，身上一陣紫光
  stMax: { *f(U, T, u) { const P = ST23.P(), H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('stCast'); HD15.dim(this, 0.3, 60, { col: '#06041a', inn: 0.15, out: 0.3 });
      ST23.circle(this, G, 34, P, { hold: 40, spin: 0.06 }); ST23.circle(this, { x: G.x, y: H.Hc.y }, 26, P, { hold: 36, spin: -0.08, delay: 6 }); ST23.circle(this, { x: G.x, y: H.Hc.y - 30 }, 18, P, { hold: 32, spin: 0.1, delay: 12 });
      yield* wait(20); Sound.sfx('charge'); HD15.flash(this, H.Hc, P, 60, { dur: 18 }); HD15.ring(this, H.Hc, P, 10, 56, { w: 2.4, dur: 18 }); HD15.flare(this, H.Hc, HD15.P.white, 60, { rot: 0, dur: 16, x8: 1 }); yield* wait(26); } },
  // 魔力奔流（4 道光束）：杖前立起魔法陣 → 四道光束一道接一道打出去（每道角度略不同），每道打中都爆一下，第四道最粗
  zjFourFold: { *f(U, T, u) { const P = ST23.P(), A = ST23.tip(this), d = SP20.dir(A, T), F = { x: A.x + d.ux * 12, y: A.y + d.uy * 12 }; Sound.sfx('stCast'); ST23.circle(this, F, 18, P, { fl: 1, hold: 70, spin: 0.1 }); HD15.gather(this, F, 12, P, 30, { span: 10 }); yield* wait(14);
      for (let i = 0; i < 4; i++) { const E = { x: T.x + [-8, 8, -4, 0][i], y: T.y + [-6, 4, 8, 0][i] }; Sound.sfx('stBolt'); ST23.beam(this, F, E, { w: i < 3 ? 7 : 13, dur: 16 }); yield* wait(3); Sound.sfx(i < 3 ? 'stHit' : 'stHitSuper'); ST23.pop(this, E, i < 3 ? 0.9 : 1.5); if (i === 3) { HD15.stop(this, 6); this.shake = Math.max(this.shake || 0, 8); } yield* wait(i < 3 ? 6 : 16); } } },
  // 天穹魔陣（奧義，全體 4 連爆）：舞台暗下來，天上一個巨大的魔法陣、每一隻腳下各一個魔法陣 → 光從天上的陣往下灌，腳下的陣連爆四次（一次比一次大），最後一次光柱沖天
  ogStaff: { *f(U, T, u) { const P = ST23.P(), L = DG17.foes(this), Cs = L.map(v => this.center(v)), Fs = L.map((v, j) => ({ x: Cs[j].x, y: v.foot || Cs[j].y + 24 })), X = Cs.length ? Cs.reduce((a, c) => a + c.x, 0) / Cs.length : T.x;
      HD15.dim(this, 0.7, 170, { col: '#06041a', inn: 0.06, out: 0.2 }); yield* ST23.cast(this, { w: 14, R: 36, hold: 40 }); Sound.sfx('stCast'); ST23.circle(this, { x: X, y: 18 }, 90, P, { fl: 0.3, hold: 110, spin: 0.04 });
      Fs.forEach((F, j) => ST23.circle(this, F, 30, P, { hold: 96, spin: 0.08, delay: j * 3 })); yield* wait(18);
      for (let r = 0; r < 4; r++) { Sound.sfx(r < 3 ? 'stHit' : 'stHitSuper'); Fs.forEach((F, j) => { const C = Cs[j], s = 0.8 + r * 0.3; HD15.thrust(this, { x: C.x, y: 24 }, C, P, { w: 6 + r * 2, ext: 10, dur: 14 }); ST23.pop(this, C, s); HD15.ring(this, F, P, 6, 30 + r * 10, { fl: 0.3, w: 2.2, dur: 16 });
          if (r === 3) { HD15.pillar(this, F, P, 140, { w: 26, dur: 30 }); HD15.pillar(this, F, HD15.P.white, 120, { w: 10, dur: 26 }); } });
        if (r === 3) { HD15.stop(this, 10); this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 12 }); Sound.sfx('quake'); } this.shake = Math.max(this.shake || 0, 4 + r * 3); yield* wait(r < 3 ? 12 : 28); } } },
};
ST23.arrow = function* (b, A, T, i) { const P = ST23.P(), off = [-1, 1, 0][i % 3], M = { x: (A.x + T.x) / 2 + off * 40, y: (A.y + T.y) / 2 - 10 }, E = { x: T.x + off * 6, y: T.y };
  Sound.sfx('stBolt'); ST23.bolt(b, A, M, { w: 7, dur: 5 }); ST23.bolt(b, M, E, { w: 7, dur: 5, delay: 5 }); yield* wait(10); Sound.sfx(i < 2 ? 'stHit' : 'stHitSuper'); ST23.pop(b, E, i < 2 ? 0.8 : 1.1);
  if (i >= 2) { HD15.motes(b, T, DS16.hands(b).Hc, 6, HD15.P.mp, { dur: 18 }); yield* wait(14); } else yield* wait(3); };
// 法杖的三個特技：魔力迸發（強力追擊）、魔力湧泉（回 MP）、星輝（下一擊必定會心）
const HDSP23 = [
  // 魔力迸發：杖尖一點光，對手身上突然冒出一個小魔法陣、整個迸開
  { *f(U, T, u) { const P = ST23.P(); Sound.sfx('stCast'); HD15.flash(this, ST23.tip(this), P, 24, { dur: 12 }); ST23.circle(this, T, 22, P, { fl: 1, hold: 10, spin: 0.2 }); yield* wait(10);
      Sound.sfx('stHitSuper'); HD15.stop(this, 4); ST23.pop(this, T, 1.4); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 魔力湧泉：腳下的魔法陣湧出藍色的光，光點像泉水一樣往上冒、落回身上
  { *f(U, T, u) { const H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }, M = HD15.P.mp; Sound.sfx('stCast'); ST23.circle(this, G, 30, M, { hold: 30, spin: 0.06 });
      for (let i = 0; i < 16; i++) DG17.later(this, i * 2, () => HD15.mote(this, G.x + (Math.random() - 0.5) * 30, G.y - 2, (Math.random() - 0.5) * 0.6, -1.4 - Math.random(), M, { life: 26 })); HD15.motes(this, { x: G.x, y: G.y - 70 }, H.Hc, 8, M, { dur: 18, delay: 12 }); yield* wait(34); } },
  // 星輝：杖尖亮起一顆四芒星，閃兩下
  { *f(U, T, u) { const A = ST23.tip(this); Sound.sfx('tick'); HD15.flare(this, A, HD15.P.white, 50, { rot: Math.PI / 4, dur: 18, x8: 1 }); HD15.flash(this, A, ST23.P(), 28, { dur: 16 }); DG17.later(this, 12, () => { Sound.sfx('tick'); HD15.flare(this, A, HD15.P.gold, 40, { rot: 0, dur: 16, x8: 1 }); }); yield* wait(30); } },
];
if (ST23.live) for (const k in HDFX23) { const id = 't_' + k, D = DEF.skills[id], F = HDFX23[k]; if (!D) { bvErr('v12.102', 'no skill ' + id); continue; } const key = 'hd15_' + k;
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.h.call(this, U, T, u, i, t); };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
if (ST23.live) { const kd = TREE_KINDS11.indexOf('法杖'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.call(this, U, T, u, t); };
  HDSP23.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.102', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]); }); }
// 魔力終曲用掉多少 MP（出招時記下來）
{ const H = Battle.prototype.handlers, _su = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { this.st23spent = P && P.spent || 0; return yield* _su.call(this, e, s, t, P); }; }
// 普通攻擊（魔彈）：杖尖一亮，一顆魔力光彈飛出去、魔力爆開；分段的第二、三下也是光彈
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && ST23.live && this._thKind === '法杖')) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0; const A = ST23.tip(this);
    Sound.sfx('stCast'); HD15.flash(this, A, ST23.P(), 20, { dur: 10 }); yield* wait(6); Sound.sfx('stBolt'); ST23.bolt(this, A, T, { w: 8, dur: 9 }); yield* wait(9); ST23.pop(this, T, 0.8); yield* wait(8); };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && ST23.live && kind === '法杖')) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; const A = ST23.tip(b);
    Sound.sfx('stBolt'); ST23.bolt(b, { x: A.x + [-6, 6, 0][i % 3], y: A.y }, C, { w: 7, dur: 8 }); yield* wait(8); ST23.pop(b, C, 0.7); yield* wait(5); }; }
HD15.use(HD15.on);
