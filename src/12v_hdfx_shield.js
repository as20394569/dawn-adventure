/* ===================== v12.102 雙盾・單手盾的新特效（高解析光效） =====================
   配色：雙盾＝聖光金白（HD15.P.holy）、單手盾＝鋼銀（HD15.P.silver，帶一點金）；佔位：舉盾穩穩往前推進（12y_hdfx_stance.js）。
   盾的表現：出招時身前浮出光做成的盾面（SH24.plate：上平下尖的騎士盾、外圈發光、中間十字紋），撞上去是「一整面」壓上去——
   壓扁的衝擊環、金屬火花（金色、有重力）、盾面一亮；守的招是盾面、六角護壁一層層張開。不是刀光。
   聲音：揮盾「呼」、撞到金屬的「鏘咚」、舉盾一聲短短的金屬響（shSwing、shHit、shGuard…）。
   先只在特效測試版（SH24.live）；玩家看過說好才放進正式版。 */
const SH24 = { live: typeof fxtest13 === 'function' && fxtest13() };
HD15.P.holy = { core: '#ffffff', mid: '#fff0b0', glow: '#ffc240', edge: '#6a4a10', keep: 1 };
HD15.P.silver = { core: '#ffffff', mid: '#dbe6f4', glow: '#7f9cc8', edge: '#26324a', keep: 1 };
SH24.K = () => DG17.kind();
SH24.isK = k => k === '雙盾' || k === '單手盾';
// 單手盾＝主手武器＋副手一面盾（不是雙持模式，DG17.kind() 會是主手武器的種類）
SH24.hasShield = () => { const st = typeof Game !== 'undefined' && Game.st, o = st && st.equip && st.equip.shield && gearBy(st.equip.shield, st); return !!(o && GEAR[o.b] && GEAR[o.b].slot === 'shield'); };
SH24.on = () => SH24.live && (SH24.K() === '雙盾' || SH24.hasShield());
SH24.P = () => SH24.K() === '雙盾' ? HD15.P.holy : HD15.P.silver;
SH24.SPARK = HD15.P.gold;
SH24.dir = (b, T) => { const H = DS16.hands(b).Hc, an = Math.atan2(T.y - H.y, T.x - H.x); return { an, ux: Math.cos(an), uy: Math.sin(an) }; };
// 光做成的盾面：上平下尖的騎士盾；from＝從哪裡移過來（相對 C）、mv＝移動的格數；s＝大小；shine＝一道亮光斜斜掃過盾面
SH24.plate = (b, C, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 22, sz = o.s || 1, fr = o.from || { x: 0, y: 0 }, mv = o.mv || 0, hold = o.hold ?? 0.6;
  return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + dur, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(t / 4)), m = mv ? HD15.eo(HD15.cl(t / mv)) : 1, f = 1 - HD15.ei(HD15.cl((k - hold) / (1 - hold))), X = p.x + fr.x * (1 - m), Y = p.y + fr.y * (1 - m), w = 13 * sz * (0.7 + 0.3 * g), h = 17 * sz * (0.7 + 0.3 * g);
    x.save(); x.translate(X, Y); x.rotate(o.rot || 0); if (o.fl) x.scale(1, o.fl);
    const path = () => { x.beginPath(); x.moveTo(-w, -h * 0.72); x.quadraticCurveTo(0, -h * 0.98, w, -h * 0.72); x.lineTo(w, 0); x.quadraticCurveTo(w * 0.85, h * 0.62, 0, h); x.quadraticCurveTo(-w * 0.85, h * 0.62, -w, 0); x.closePath(); };
    x.globalCompositeOperation = 'lighter'; HD15.put(x, HD15.tex('glow', pal.glow), 0, 0, w * 4, h * 3.4, 0, 0.35 * f); x.globalAlpha = 0.32 * f; path(); x.fillStyle = pal.glow; x.fill();
    x.lineJoin = 'round'; x.globalAlpha = 0.9 * f; x.lineWidth = 3.4; x.strokeStyle = pal.glow; x.stroke(); x.lineWidth = 1.5; x.strokeStyle = pal.mid; x.stroke(); x.lineWidth = 0.6; x.strokeStyle = pal.core; x.stroke();
    x.beginPath(); x.moveTo(0, -h * 0.58); x.lineTo(0, h * 0.66); x.moveTo(-w * 0.62, -h * 0.22); x.lineTo(w * 0.62, -h * 0.22); x.globalAlpha = 0.75 * f; x.lineWidth = 1.3; x.strokeStyle = pal.mid; x.stroke();
    if (o.shine) { const s = HD15.cl(t / Math.max(1, dur * 0.6)); x.save(); path(); x.clip(); x.globalAlpha = 0.7 * f; x.fillStyle = '#ffffff'; x.beginPath(); const sx = -w * 1.6 + s * w * 3.2; x.moveTo(sx, -h); x.lineTo(sx + 5, -h); x.lineTo(sx - 9, h); x.lineTo(sx - 14, h); x.closePath(); x.fill(); x.restore(); }
    x.restore(); } }); };
// 盾撞上去：一整面壓上去——壓扁的衝擊環（垂直於撞的方向）、盾面一亮、金屬火花（有重力）
SH24.slam = (b, T, s = 1, o = {}) => { const P = o.pal || SH24.P(), d = o.d || SH24.dir(b, T), dl = o.delay || 0; HD15.flash(b, T, P, 40 * s, { dur: 14, delay: dl });
  for (let i = 0; i < 2; i++) HD15.ring(b, { x: T.x + d.ux * i * 5, y: T.y + d.uy * i * 5 }, P, 4, (26 + i * 10) * s, { w: 2.6 - i * 0.8, fl: 0.4, rot: d.an + Math.PI / 2, dur: 16, delay: dl + i * 2 });
  HD15.sparks(b, T, Math.round(12 * s), SH24.SPARK, { ang: d.an, spread: 1.6, spd: 3.4 * Math.min(1.5, s), life: 20, g: 0.14, delay: dl }); HD15.flare(b, T, HD15.P.white, 44 * s, { rot: d.an + Math.PI / 2, dur: 14, delay: dl }); };
// 撞擊：盾面從主角前面往對手壓過去，撞上、停格、slam
SH24.bash = function* (b, T, s = 1, o = {}) { const P = o.pal || SH24.P(), d = SH24.dir(b, T), H = DS16.hands(b).Hc, F = { x: H.x + d.ux * 18 - T.x, y: H.y + d.uy * 18 - T.y }; Sound.sfx('shSwing');
  SH24.plate(b, { x: T.x - d.ux * 8 + (o.ox || 0), y: T.y - d.uy * 8 }, P, { s: 1.2 * s, from: F, mv: 6, dur: 22, shine: 1 }); yield* wait(6); Sound.sfx(s >= 1.3 ? 'shHitSuper' : 'shHit'); HD15.stop(b, Math.round(3 * s)); SH24.slam(b, T, s, { d }); b.shake = Math.max(b.shake || 0, Math.round(4 * s)); };
// 身前的護壁：盾面＋一層層六角
SH24.wall = (b, C, pal, n = 2, o = {}) => { SH24.plate(b, C, pal, { s: 1.5, dur: o.dur || 34, hold: 0.7, shine: 1 }); for (let i = 0; i < n; i++) SP20.hex(b, C, 24 + i * 10, pal, { hold: (o.dur || 34) - 10 - i * 4, delay: 2 + i * 3, fl: 1 }); };

const HDFX24 = {
  // 雙盾擊（30% 退縮）：兩面盾一左一右夾擊（金色的盾面從兩邊合起來撞上去），撞在一起時一圈光、火花往上下噴
  shBash: { *f(U, T, u) { const P = SH24.P(); Sound.sfx('shSwing'); yield* this.lunge(u, 8, 3); SH24.plate(this, { x: T.x - 10, y: T.y }, P, { s: 1.1, from: { x: -30, y: 6 }, mv: 6, dur: 20, rot: 0.25 }); SH24.plate(this, { x: T.x + 10, y: T.y }, P, { s: 1.1, from: { x: 30, y: 6 }, mv: 6, dur: 20, rot: -0.25 }); yield* wait(6);
      Sound.sfx('shHitSuper'); HD15.stop(this, 4); SH24.slam(this, T, 1.1, { d: { an: -Math.PI / 2, ux: 0, uy: -1 } }); HD15.sparks(this, T, 10, SH24.SPARK, { ang: Math.PI / 2, spread: 0.8, spd: 2.6, life: 18, g: 0.14 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 雙盾架勢（受傷 −50%，被打得盾勢）：兩面盾在身前交疊立起來，一圈六角護壁張開，腳下一圈金光
  shStance: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 14 }, G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('shGuard');
      SH24.plate(this, { x: C.x - 7, y: C.y }, P, { s: 1.3, dur: 36, hold: 0.7, rot: -0.12, from: { x: -14, y: 4 }, mv: 6 }); SH24.plate(this, { x: C.x + 7, y: C.y }, P, { s: 1.3, dur: 36, hold: 0.7, rot: 0.12, from: { x: 14, y: 4 }, mv: 6, shine: 1 });
      yield* wait(6); Sound.sfx('shGuard'); SP20.hex(this, C, 34, P, { hold: 24, fl: 1 }); HD15.ring(this, G, P, 6, 40, { fl: 0.3, w: 2, dur: 20 }); HD15.flash(this, C, P, 40, { dur: 14 }); yield* wait(26); } },
  // 盾突（削護盾；盾勢越多越強）：舉盾往前猛衝，盾面撞上去，停格，護盾碎片噴出；有盾勢時盾面更大、身上的金光（每層一圈）一起撞出去
  shRam: { *f(U, T, u) { const P = SH24.P(), hu = this.core && this.core.byId.H, st = hu && hu.statuses ? (hu.statuses.find(q => q.id === 'bulk11') || {}).stacks || 0 : 0, H = DS16.hands(this);
      for (let i = 0; i < st; i++) HD15.ring(this, H.Hc, P, 30 - i * 4, 8, { w: 1.6, dur: 12, delay: i * 4 }); if (st) yield* wait(6 + st * 4);
      Sound.sfx('dashStep'); HD15.windLines(this, H.Hc, T, P, 6, { spread: 24, len: 40, spd: 12 }); yield* this.lunge(u, 18, 3); yield* SH24.bash(this, T, 1.1 + st * 0.2); AX21.chip(this, T, 1); yield* wait(14); } },
  // 反射壁（這回合魔法傷害反彈 50%）：身前立起一面像鏡子一樣的盾面（亮光一直掃過去），邊緣一圈六角，光在鏡面上反射往外彈
  shReflect: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 18 }; Sound.sfx('shGuard'); SH24.plate(this, C, HD15.P.cyan, { s: 1.6, dur: 40, hold: 0.75, shine: 1 }); SP20.hex(this, C, 30, HD15.P.cyan, { hold: 28, fl: 1 });
      for (let i = 0; i < 4; i++) DG17.later(this, 8 + i * 4, () => { Sound.sfx('tick'); const a = -Math.PI / 2 + (i - 1.5) * 0.5; HD15.thrust(this, C, { x: C.x + Math.cos(a) * 40, y: C.y + Math.sin(a) * 40 }, HD15.P.cyan, { w: 3, ext: 6, dur: 12 }); }); yield* wait(36); } },
  // 雙盾崩擊（蓄力後放出；對破防中的對手 ×1.5）：（蓄力那一回合兩面盾高舉、金光往盾上聚）→ 往前推進、兩面盾一起從上面砸下來：
  //   停格、畫面一白、大震，金色的盾面壓進地面、地面裂開金光，火花大量往上噴；對手破防中時多一圈白光
  shCrash: { *f(U, T, u) { const P = SH24.P(), v = DG17.vAt(this, T), ft = v && v.foot ? v.foot : T.y + 24, cu = v && this.core && this.core.byId[v.id], brk = !!(cu && this.core.statusOf && this.core.statusOf(cu, 'broken'));
      HD15.dim(this, 0.4, 70, { col: '#140e02', inn: 0.1, out: 0.4 }); Sound.sfx('shSwing'); yield* AX21.heave.call(this, this, 12, 8);
      SH24.plate(this, { x: T.x - 9, y: T.y - 2 }, P, { s: 1.5, from: { x: -6, y: -50 }, mv: 6, dur: 26, rot: 0.1, shine: 1 }); SH24.plate(this, { x: T.x + 9, y: T.y - 2 }, P, { s: 1.5, from: { x: 6, y: -50 }, mv: 6, dur: 26, rot: -0.1 }); yield* wait(6);
      Sound.sfx('shHitSuper'); Sound.sfx('quake'); HD15.stop(this, 10); this.spawn({ k: 'flash', c: '#fff8e0', a: 0.5, life: 10 }); SH24.slam(this, T, 1.8, { d: { an: Math.PI / 2, ux: 0, uy: 1 } });
      HD15.cracks(this, { x: T.x, y: ft }, 8, P, { len: 44, fl: 0.3, dur: 50 }); HD15.ring(this, { x: T.x, y: ft }, P, 8, 70, { fl: 0.3, w: 3, dur: 22 }); HD15.sparks(this, T, 24, SH24.SPARK, { ang: -Math.PI / 2, spread: 1.6, spd: 5, life: 24, g: 0.16 });
      if (brk) { HD15.ring(this, T, HD15.P.white, 8, 84, { w: 3, dur: 22, delay: 3 }); HD15.flare(this, T, HD15.P.white, 160, { rot: 0, dur: 20, x8: 1, delay: 2 }); }
      this.shake = Math.max(this.shake || 0, brk ? 16 : 13); yield* wait(22); } },
  // 不落要塞（物防・魔防 +2、回血、反擊）：主角四周一面面金色的盾牆從地面升起圍成一圈（像城牆），頭上張開一層六角的光罩，腳下金色的陣
  shFort: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 10 }, G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('charge'); HD15.ring(this, G, P, 10, 50, { fl: 0.3, w: 2.4, dur: 40 });
      for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.14), X = G.x + Math.cos(Math.PI + a) * 40, Y = G.y + Math.sin(Math.PI + a) * 12; DG17.later(this, i * 3, () => { Sound.sfx('shGuard'); SH24.plate(this, { x: X, y: Y - 18 }, P, { s: 1, from: { x: 0, y: 20 }, mv: 8, dur: 44 - i * 3, hold: 0.75 }); HD15.pillar(this, { x: X, y: Y }, P, 40, { w: 12, dur: 20 }); }); }
      yield* wait(20); Sound.sfx('shHitSuper'); SP20.hex(this, C, 46, P, { hold: 22, fl: 0.8 }); HD15.flash(this, C, P, 60, { dur: 18 }); HD15.flare(this, C, HD15.P.white, 70, { rot: 0, dur: 16, x8: 1 }); yield* wait(28); } },
  // 聖壁衝鋒（用掉守勢）：身前升起一面金色的聖壁（守勢越多越大）→ 推著聖壁往前衝、整面撞上去，停格、畫面一白 → 退回來，身邊張開護盾（六角光罩）
  zjHolyWall: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 14 }, sp = Math.min(6, this.sh24spent || 2), s = 1 + sp * 0.12; Sound.sfx('charge');
      SH24.plate(this, C, P, { s: 1.6 * s, dur: 26, hold: 0.8, shine: 1, from: { x: 0, y: 24 }, mv: 10 }); HD15.pillar(this, { x: C.x, y: HDW_FOOT() }, P, 60, { w: 30 * s, dur: 24 }); yield* wait(16);
      Sound.sfx('dashStep'); HD15.windLines(this, C, T, P, 8, { spread: 30, len: 50, spd: 14 }); yield* this.lunge(u, 20, 3); yield* SH24.bash(this, T, 1.5 * s); this.spawn({ k: 'flash', c: '#fff8e0', a: 0.4, life: 8 }); HD15.ring(this, T, P, 8, 70 * s, { w: 3, dur: 22 }); yield* wait(16);
      const C2 = { x: DS16.hands(this).Hc.x, y: DS16.hands(this).Hc.y - 10 }; Sound.sfx('shGuard'); SP20.hex(this, C2, 34, P, { hold: 22, fl: 1 }); SP20.hex(this, C2, 44, P, { hold: 18, fl: 1, delay: 4 }); HD15.flash(this, C2, P, 46, { dur: 14 }); yield* wait(24); } },
  // 聖域壁壘（奧義；聖盾 3 回合＋反擊）：舞台暗下來，腳下展開一大圈金色的聖域，四面金色的盾從天上落下圍住主角，一個六角組成的光罩整個罩住、光柱從聖域往上沖
  ogWall: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 10 }, G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; HD15.dim(this, 0.6, 130, { col: '#140e02', inn: 0.08, out: 0.25 }); Sound.sfx('charge');
      if (typeof ST23 !== 'undefined') ST23.circle(this, G, 56, P, { hold: 90, spin: 0.03 }); HD15.ring(this, G, P, 10, 70, { fl: 0.3, w: 2.6, dur: 30 }); yield* wait(14);
      for (let i = 0; i < 4; i++) { const X = G.x + [-44, 44, -24, 24][i], Y = G.y + [-6, -6, 6, 6][i] - 22; DG17.later(this, i * 5, () => { Sound.sfx('shHit'); SH24.plate(this, { x: X, y: Y }, P, { s: 1.2, from: { x: 0, y: -120 }, mv: 6, dur: 70 - i * 5, hold: 0.8, shine: 1 }); DG17.later(this, 6, () => { HD15.ring(this, { x: X, y: Y + 22 }, P, 4, 24, { fl: 0.3, w: 1.8, dur: 14 }); HD15.sparks(this, { x: X, y: Y + 22 }, 6, SH24.SPARK, { ang: -Math.PI / 2, spread: 1.4, spd: 2.4, life: 16, g: 0.12 }); this.shake = Math.max(this.shake || 0, 4); }); }); }
      yield* wait(28); Sound.sfx('shHitSuper'); this.spawn({ k: 'flash', c: '#fff8e0', a: 0.45, life: 10 }); for (let i = 0; i < 3; i++) SP20.hex(this, C, 40 + i * 12, P, { hold: 40 - i * 6, delay: i * 4, fl: 1 });
      HD15.pillar(this, G, P, 150, { w: 70, dur: 34 }); HD15.pillar(this, G, HD15.P.white, 130, { w: 26, dur: 30 }); HD15.flare(this, C, HD15.P.white, 140, { rot: 0, dur: 24, x8: 1 }); yield* wait(40); } },
  // 盾撞（單手盾；攻擊力加物防的 70%，30% 退縮）：鋼銀的盾面往前一撞
  osBash: { *f(U, T, u) { yield* this.lunge(u, 14, 3); yield* SH24.bash(this, T, 1.2); yield* wait(14); } },
  // 堅守（搶先；這回合傷害 −50%、下回合格擋率 +30%）：盾舉到身前，腳下一踏（一圈波紋），盾面一亮、一圈六角
  osHold: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x + 4, y: H.Hc.y - 14 }, G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('shGuard'); SH24.plate(this, C, P, { s: 1.4, dur: 34, hold: 0.7, shine: 1, from: { x: 6, y: 10 }, mv: 5 });
      yield* wait(6); Sound.sfx('step'); HD15.ring(this, G, P, 6, 36, { fl: 0.3, w: 2, dur: 16 }); SP20.hex(this, C, 30, P, { hold: 18, fl: 1 }); HD15.flash(this, C, P, 36, { dur: 12 }); yield* wait(24); } },
  // 格擋反擊（2 回合，格擋時反擊）：盾舉起來，盾緣一道金光掃過、盾面上一個金色的十字閃兩下（準備反擊）
  osCounter: { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x + 4, y: H.Hc.y - 14 }; Sound.sfx('shGuard'); SH24.plate(this, C, P, { s: 1.4, dur: 36, hold: 0.7, shine: 1 });
      for (let i = 0; i < 2; i++) DG17.later(this, 10 + i * 10, () => { Sound.sfx('tick'); HD15.flare(this, C, HD15.P.gold, 46, { rot: 0, dur: 14, x8: 1 }); }); yield* wait(34); } },
  // 鐵壁衝陣（奧義，全體；40% 退縮，這回合傷害 −50%）：鋼銀的盾面越疊越多變成一整排盾牆 → 推著盾牆往前衝，整排撞過全部魔物（一隻一隻停一下、火花），最後畫面一白
  ogShield: { *f(U, T, u) { const P = SH24.P(), L = DG17.foes(this), Cs = L.map(v => this.center(v)), H = DS16.hands(this), Y = Cs.length ? Cs.reduce((a, c) => a + c.y, 0) / Cs.length : T.y, xs = Cs.map(c => c.x);
      HD15.dim(this, 0.55, 120, { col: '#04060c', inn: 0.08, out: 0.25 }); Sound.sfx('charge'); const n = 5; for (let i = 0; i < n; i++) DG17.later(this, i * 3, () => { Sound.sfx('shGuard'); SH24.plate(this, { x: H.Hc.x + (i - 2) * 18, y: H.Hc.y - 20 }, P, { s: 1.1, dur: 24, hold: 0.8 }); });
      yield* wait(20); Sound.sfx('dashStep'); const x0 = xs.length ? Math.min(...xs) - 20 : T.x - 60, x1 = xs.length ? Math.max(...xs) + 20 : T.x + 60;
      for (let i = 0; i < n; i++) { const X = x0 + (x1 - x0) * i / (n - 1); SH24.plate(this, { x: X, y: Y }, P, { s: 1.3, from: { x: H.Hc.x - X, y: H.Hc.y - 20 - Y }, mv: 8, dur: 30, hold: 0.7, shine: i === 2 }); }
      HD15.windLines(this, H.Hc, { x: (x0 + x1) / 2, y: Y }, P, 10, { spread: 60, len: 50, spd: 14 }); yield* this.lunge(u, 22, 3);
      Cs.forEach((C, j) => DG17.later(this, j * 3, () => { Sound.sfx('shHitSuper'); SH24.slam(this, C, 1.3); }));
      yield* wait(6 + Cs.length * 3); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#eef4ff', a: 0.45, life: 10 }); this.shake = Math.max(this.shake || 0, 14); yield* wait(22); } },
};
// 雙盾的兩個特技：盾鳴（追擊，30% 退縮）、鋼壁（防禦）
const HDSP24 = [
  // 盾鳴：盾撞上去，盾面發出一圈圈往外擴的聲波（金色的環）
  { *f(U, T, u) { const P = SH24.P(); yield* this.lunge(u, 10, 3); yield* SH24.bash(this, T, 1); for (let i = 0; i < 3; i++) HD15.ring(this, T, P, 10 + i * 6, 44 + i * 12, { w: 1.6, dur: 18, delay: 2 + i * 4 }); yield* wait(16); } },
  // 鋼壁：盾面在身前一亮，一層六角護壁張開
  { *f(U, T, u) { const P = SH24.P(), H = DS16.hands(this); Sound.sfx('shGuard'); SH24.wall(this, { x: H.Hc.x, y: H.Hc.y - 14 }, P, 2, { dur: 30 }); yield* wait(28); } },
];
if (SH24.live) for (const k in HDFX24) { const id = 't_' + k, D = DEF.skills[id], F = HDFX24[k]; if (!D) { bvErr('v12.102', 'no skill ' + id); continue; } const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
if (SH24.live) { const kd = TREE_KINDS11.indexOf('雙盾'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.call(this, U, T, u, t); };
  HDSP24.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.102', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]); }); }
// 聖壁衝鋒用掉的守勢（出招時記下來）
{ const H = Battle.prototype.handlers, _su = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { this.sh24spent = P && P.spent || 0; return yield* _su.call(this, e, s, t, P); }; }
// 蓄力那一回合（雙盾崩擊）：兩面盾高舉過頭，金光往盾上聚
{ const H = Battle.prototype.handlers, _ch = H.CHARGE; H.CHARGE = function* (e, s, t, P) { this.sh24chg = HD15.on && SH24.on() && s && s.hero && P && P.skill === 't_shCrash'; try { yield* _ch.call(this, e, s, t, P); } finally { this.sh24chg = false; } };
  const _fc = FX.charge; FX.charge = function* (U, ...a) { if (!this.sh24chg) return yield* _fc.call(this, U, ...a); this.sh24chg = false; this.hd15cast = 1; const P = SH24.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y - 40 };
    Sound.sfx('charge'); SH24.plate(this, { x: C.x - 9, y: C.y }, P, { s: 1.2, dur: 40, hold: 0.8, rot: 0.15, from: { x: -4, y: 30 }, mv: 8 }); SH24.plate(this, { x: C.x + 9, y: C.y }, P, { s: 1.2, dur: 40, hold: 0.8, rot: -0.15, from: { x: 4, y: 30 }, mv: 8, shine: 1 });
    HD15.gather(this, C, 16, P, 40, { span: 14 }); HD15.flash(this, C, P, 40, { dur: 24, delay: 10 }); yield* wait(36); }; }
// 擋下攻擊的那一下（雙盾・單手盾的格擋反擊、不落要塞、聖域）：盾面在身前一亮、一圈六角、金屬火花（舊的線條不畫）
{ const H = Battle.prototype.handlers, _re = H.REACTION; H.REACTION = function* (e, s, t, P) {
    if (!(HD15.on && s && s.hero && SH24.on() && typeof ctrInfo12 === 'function' && ctrInfo12(s, P && P.why).kind === 'block')) return yield* _re.call(this, e, s, t, P);
    const g = _re.call(this, e, s, t, P); let r; DS16.mute = 1; try { r = g.next(); } finally { DS16.mute = 0; }
    const C = this.center(s), A = this.center(t || this.F), d = ctrDir12(C, A), X = { x: C.x + d.x * 16, y: C.y + d.y * 16 }, Pl = SH24.P(); Sound.sfx('shHit');
    SH24.plate(this, X, Pl, { s: 1.3, dur: 22, hold: 0.6, shine: 1 }); SP20.hex(this, X, 26, Pl, { hold: 10, fl: 1 }); HD15.sparks(this, X, 12, SH24.SPARK, { spd: 3, life: 16, g: 0.12 });
    while (!r.done) { const v = yield r.value; r = g.next(v); } return r.value; }; }
// 反擊（盾）：往後一收、踏上去 → 盾面撞上去，停格；然後站一下、走回來
{ const _c = FX.ctr12; FX.ctr12 = function* (U, T, u) { const K = this.ctrNow12 || {}, v = u && u.id ? this.views[u.id] || u : u, o = v && v.off;
    if (!(HD15.on && u && u.hero && SH24.on() && o)) return yield* _c.call(this, U, T, u);
    this.slashOn = 0; this.hd15cast = 1; const d0 = ctrDir12(U, T), x0 = o.x, y0 = o.y; this.anim(v, 'cast', CTR12.BACK + 2, true); Sound.sfx('shGuard');
    yield* tween(CTR12.BACK, q => { const e = Math.sin(q * Math.PI / 2); o.x = x0 - d0.x * 6 * e; o.y = y0 - d0.y * 6 * e; }); this.anim(v, 'attack', CTR12.STEP + 26); const far = 24;
    for (let i = 1; i <= CTR12.STEP; i++) { const q = i / CTR12.STEP, e = q * q * (3 - 2 * q); o.x = x0 + d0.x * (-6 + (far + 6) * e); o.y = y0 + d0.y * (-6 + (far + 6) * e); yield; }
    yield* SH24.bash(this, T, 1.1); yield* wait(6); this.ctrRet12 = { v, x: o.x, y: o.y, x0: 0, y0: 0, at: this.t + CTR12.HOLD, dur: CTR12.RET }; }; }
// 普通攻擊：盾面撞一下；分段的第二、三下也是撞
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && SH24.live && SH24.isK(this._thKind || SH24.K()))) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0;
    yield* this.lunge(u, 10, 3); yield* SH24.bash(this, T, 0.9); yield* wait(8); };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && SH24.live && SH24.isK(kind))) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; yield* b.lunge(s, 6, 2); yield* SH24.bash(b, C, 0.8, { ox: [-6, 6, 0][i % 3] }); yield* wait(4); }; }
HD15.use(HD15.on);
