/* ===================== v12.102 拳套的新特效（高解析光效） =====================
   配色：金色氣勁（HD15.P.ki）；佔位：衝到最貼身（12y_hdfx_stance.js；氣勁彈是遠距的，站在原地發）。
   拳套的表現：拳頭打中是「一個點」——很短很寬的一拳（AF22.fist），打中的地方兩圈順著拳的方向壓扁的衝擊環、氣從對手背後透出去（AF22.wave）；
   踢是又快又短的金色弧（借斧的 AX21.cleave，揮得更快、更細）；連打一拳接一拳越來越快，最後一拳最重。
   沖天拳把對手整個打上半空、再掉下來（對手的位置真的往上移）。聲音：短的「咻」＋紮實的「啪碰」（fsSwing、fsHit…）。
   先只在特效測試版（AF22.live）；玩家看過說好才放進正式版。 */
const AF22 = { live: typeof fxtest13 === 'function' && fxtest13() };
HD15.P.ki = { core: '#fffbe8', mid: '#ffd040', glow: '#ff9a10', edge: '#5a3000', keep: 1 };
AF22.P = () => HD15.P.ki;
AF22.on = () => AF22.live && DG17.kind() === '拳套';
AF22.dir = (b, T) => { const H = DS16.hands(b).Hc, an = Math.atan2(T.y - H.y, T.x - H.x); return { an, ux: Math.cos(an), uy: Math.sin(an) }; };
// 一拳：很短很寬的金色拳光打進去，打中的地方兩圈壓扁的衝擊環（順著拳的方向）、白熱閃光、火花往前噴；s＝重量
AF22.fist = (b, T, s = 1, o = {}) => { const P = AF22.P(), d = o.d || AF22.dir(b, T), off = o.off || 0, dl = o.delay || 0, nx = -d.uy, ny = d.ux, C = { x: T.x + nx * off, y: T.y + ny * off }, A = { x: C.x - d.ux * 24 * s, y: C.y - d.uy * 24 * s };
  HD15.thrust(b, A, C, P, { w: 12 * Math.min(1.5, s), ext: 4, dur: 10, delay: dl }); HD15.thrust(b, A, C, HD15.P.white, { w: 4.5 * Math.min(1.5, s), ext: 3, dur: 9, delay: dl + 1 });
  HD15.flash(b, C, P, 30 * s, { dur: 10, delay: dl + 1 }); for (let i = 0; i < 2; i++) HD15.ring(b, { x: C.x + d.ux * i * 6, y: C.y + d.uy * i * 6 }, P, 3, (14 + i * 6) * s, { w: 2 - i * 0.6, fl: 0.45, rot: d.an + Math.PI / 2, dur: 12, delay: dl + 1 + i * 2 });
  HD15.sparks(b, C, Math.round(6 * s), P, { ang: d.an, spread: 0.9, spd: 3 * s, life: 14, g: 0.05, delay: dl + 1 }); return d; };
// 氣從對手背後透出去：一道往前擴的金色錐光＋出口一圈環
AF22.wave = (b, T, d, s = 1, o = {}) => { const P = AF22.P(), dl = o.delay || 0, E = { x: T.x + d.ux * 40 * s, y: T.y + d.uy * 40 * s }; HD15.thrust(b, T, E, P, { w: 16 * s, ext: 6, dur: 16, delay: dl, al: 0.55 });
  HD15.ring(b, E, P, 4, 26 * s, { w: 2.2, fl: 0.45, rot: d.an + Math.PI / 2, dur: 16, delay: dl + 3 }); HD15.windLines(b, T, E, P, 4, { spread: 16 * s, len: 30, spd: 9, delay: dl }); };
// 一腳：又快又短的金色弧
AF22.kick = (b, T, dd, o = {}) => AX21.cleave(b, T, dd, Object.assign({ pal: AF22.P(), r: 36, th: 9, span: 2, dur: 14, sw: 3 }, o));
// 對手被打上半空再掉下來
AF22.launch = function* (b, v, up = 38) { const o = v && v.off; if (!o) return; const y0 = o.y; yield* tween(10, q => { o.y = y0 - up * HD15.eo(q); }); yield* wait(10); yield* tween(8, q => { o.y = y0 - up * (1 - q * q); }); o.y = y0;
  const C = b.center(v); Sound.sfx('land'); HD15.ring(b, { x: C.x, y: (v.foot || C.y + 24) }, HD15.P.white, 4, 30, { fl: 0.3, w: 1.6, dur: 14 }); b.shake = Math.max(b.shake || 0, 5); };

const HDFX22 = {
  // 三連拳（每段回 1 MP）：左、右、正中一拳，越打越重；每一拳藍色的魔力光點飛回主角身上
  fsTriple: { *f(U, T, u) { yield* this.lunge(u, 8, 2); yield* AF22.tri(this, T, 0); }, *h(U, T, u, i) { yield* AF22.tri(this, T, i); } },
  // 破體拳（50% 物防 −1）：拉弓一樣收拳、氣聚在拳頭 → 一記直拳，停格，氣穿過身體從背後透出去，身上白色的裂紋一閃
  fsBreak: { *f(U, T, u) { const P = AF22.P(), H = DS16.hands(this); Sound.sfx('fsQi'); HD15.gather(this, H.R, 10, P, 26, { span: 8 }); yield* wait(10); Sound.sfx('fsSwing'); yield* this.lunge(u, 12, 2);
      const d = AF22.fist(this, T, 1.4); yield* wait(2); Sound.sfx('fsHitSuper'); HD15.stop(this, 6); AF22.wave(this, T, d, 1.2); HD15.cracks(this, T, 6, HD15.P.white, { len: 14, fl: 1, dur: 26 }); HD15.spikes(this, T, P, 8, 26);
      this.shake = Math.max(this.shake || 0, 7); yield* wait(14); } },
  // 吐納（自己）：吸氣——金色的氣從四周往身上收；吐氣——一圈金光往外擴，藍色的光點回到身上（回 MP），拳頭一亮（下一擊）
  fsBreath: { *f(U, T, u) { const P = AF22.P(), H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('charge'); HD15.dim(this, 0.25, 60, { col: '#140c00', inn: 0.15, out: 0.3 });
      HD15.gather(this, H.Hc, 20, P, 56, { span: 18, life: 18 }); HD15.ring(this, G, P, 40, 8, { fl: 0.3, w: 1.6, dur: 24 }); yield* wait(22);
      Sound.sfx('fsQi'); HD15.ring(this, H.Hc, P, 8, 50, { w: 2.4, dur: 18 }); HD15.ring(this, G, P, 6, 44, { fl: 0.3, w: 1.8, dur: 18 }); HD15.motes(this, { x: G.x, y: G.y - 70 }, H.Hc, 8, HD15.P.mp, { dur: 18 });
      HD15.flash(this, H.R, HD15.P.white, 22, { dur: 14, delay: 10 }); HD15.flare(this, H.R, P, 40, { rot: Math.PI / 4, dur: 16, x8: 1, delay: 10 }); yield* wait(28); } },
  // 旋踢（全體，3 段）：主角原地迴旋，金色的踢弧一圈圈掃過全部（每一段方向不同）
  fsKick: { *f(U, T, u) { yield* AF22.spin(this, T, 0); }, *h(U, T, u, i) { yield* AF22.spin(this, T, i); } },
  // 碎殼掌：掌心推出去——一個金色的掌印（五道放射的光）印在對手身上，停格，白色的裂紋從掌印往外爬滿全身，碎殼往外剝落
  fsShell: { *f(U, T, u) { const P = AF22.P(); Sound.sfx('fsSwing'); yield* this.lunge(u, 12, 2); const d = AF22.fist(this, T, 1.1); yield* wait(2);
      Sound.sfx('fsHitSuper'); HD15.stop(this, 6); for (let i = 0; i < 5; i++) HD15.thrust(this, T, { x: T.x + Math.cos(-Math.PI / 2 + (i - 2) * 0.38) * 22, y: T.y + Math.sin(-Math.PI / 2 + (i - 2) * 0.38) * 22 }, P, { w: 4, ext: 2, dur: 30, al: 0.9 });
      HD15.flash(this, T, P, 44, { dur: 16 }); HD15.cracks(this, T, 10, HD15.P.white, { len: 22, fl: 1, dur: 50, delay: 3 }); HD15.shards(this, T, 10, { spd: 2.8, up: 1, sz: 3, cols: ['#f0e8d0', '#b8a680', '#5a4a30'], delay: 6 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(18); } },
  // 氣勁彈（遠距）：雙掌往前一推，一顆金色的氣彈飛出去（拖著尾巴），打中炸開一圈氣
  fsQi: { *f(U, T, u) { const P = AF22.P(), H = DS16.hands(this), A = { x: H.Hc.x, y: H.Hc.y - 14 }; Sound.sfx('fsQi'); HD15.gather(this, A, 14, P, 30, { span: 10 }); HD15.flash(this, A, P, 30, { dur: 16, delay: 6 }); yield* wait(14);
      Sound.sfx('stBolt'); HD15.comet(this, A, T, P, 12, { w: 12 }); yield* wait(12); Sound.sfx('fsHitSuper'); HD15.stop(this, 4); HD15.flash(this, T, P, 60, { dur: 16 }); HD15.ring(this, T, P, 6, 44, { w: 2.6, dur: 18 }); HD15.ring(this, T, HD15.P.white, 4, 28, { w: 1.6, dur: 14, delay: 3 });
      HD15.sparks(this, T, 18, P, { spd: 4, life: 18, g: 0.04 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 狂嵐拳（8 段，最後一段削護盾）：拳頭一拳接一拳越打越快（每一拳位置都不一樣，拳的殘影疊在一起）→ 最後一拳最重，停格、護盾碎片噴出
  fsStorm: { *f(U, T, u) { HD15.dim(this, 0.25, 70, { col: '#140c00', inn: 0.1, out: 0.3 }); yield* this.lunge(u, 8, 2); yield* AF22.barrage(this, T, 0, 8); }, *h(U, T, u, i) { yield* AF22.barrage(this, T, i, 8); } },
  // 震山擊（無視 40% 物防，50% 退縮）：整個人用肩膀撞上去（衝得更遠、拖著金色的風）→ 停格、畫面一白、大震，氣從背後轟出去，地面裂開
  fsThrough: { *f(U, T, u) { const P = AF22.P(), v = DG17.vAt(this, T), ft = v && v.foot ? v.foot : T.y + 24, H = DS16.hands(this); Sound.sfx('fsQi'); HD15.gather(this, H.Hc, 12, P, 34, { span: 8 }); yield* wait(8);
      Sound.sfx('dashStep'); HD15.windLines(this, H.Hc, T, P, 8, { spread: 30, len: 50, spd: 14 }); yield* this.lunge(u, 22, 3); const d = AF22.fist(this, { x: T.x, y: T.y + 6 }, 1.8); yield* wait(2);
      Sound.sfx('fsHitSuper'); Sound.sfx('quake'); HD15.stop(this, 9); this.spawn({ k: 'flash', c: '#fff6d8', a: 0.4, life: 8 }); AF22.wave(this, T, d, 1.8); HD15.ring(this, T, P, 8, 60, { w: 3, dur: 20 });
      HD15.cracks(this, { x: T.x, y: ft }, 8, P, { len: 36, fl: 0.3, dur: 46 }); HD15.shards(this, { x: T.x, y: ft - 2 }, 8, { up: 2.4, spd: 2.6, sz: 2.8, cols: AX21.ROCK }); this.shake = Math.max(this.shake || 0, 13); yield* wait(18); } },
  // 氣爆掌（v12.103 取代千手寸勁；用掉全部的氣，下一回合開始時體內的氣爆開）：氣往掌心聚（氣越多聚得越久、光越大）→ 一掌拍進去，停格，
  //   金色的氣從四周一口氣灌進對手體內（光往內收），對手胸口留下一顆一閃一閃的金色氣核（到爆開前一直在）
  zjQiBurst: { *f(U, T, u, t) { const P = AF22.P(), n = this.af22spent || 0, H = DS16.hands(this); Sound.sfx('charge'); HD15.gather(this, H.R, 10 + n * 3, P, 30 + n * 4, { span: 10 + n * 2 }); HD15.flash(this, H.R, P, 24 + n * 4, { dur: 16 + n * 2, delay: 6 });
      for (let i = 0; i < n; i++) DG17.later(this, i * 3, () => HD15.ring(this, H.R, P, 24, 4, { w: 1.6, dur: 10 })); yield* wait(12 + n * 2);
      Sound.sfx('fsSwing'); yield* this.lunge(u, 12, 2); AF22.palm(this, T, -Math.PI / 2, { hold: 10 }); const d = AF22.fist(this, T, 1.3); yield* wait(2);
      Sound.sfx('fsHitSuper'); HD15.stop(this, 6); HD15.flash(this, T, P, 50, { dur: 14 }); for (let i = 0; i < 3; i++) HD15.ring(this, T, P, 40 - i * 8, 4, { w: 2.2, dur: 12, delay: i * 3 });
      HD15.gather(this, T, 14 + n * 3, P, 44, { span: 12 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(18); } },
  // 沖天拳（必定會心；氣滿時 +50%）：主角蹲低、氣往拳頭聚 → 一記上勾拳，一道金色的光柱從對手腳下往天上沖，對手整個被打上半空，停格 → 掉下來
  zjQuake: { *f(U, T, u, t) { const P = AF22.P(), v = DG17.vAt(this, T), ft = v && v.foot ? v.foot : T.y + 24, H = DS16.hands(this); Sound.sfx('charge'); HD15.gather(this, H.R, 14, P, 34, { span: 10 }); HD15.flash(this, H.R, P, 30, { dur: 16, delay: 8 }); yield* wait(14);
      Sound.sfx('fsSwing'); yield* this.lunge(u, 14, 2); AF22.fist(this, { x: T.x, y: T.y + 14 }, 1.6, { d: { an: -Math.PI / 2, ux: 0, uy: -1 } }); yield* wait(2);
      Sound.sfx('fsHitSuper'); Sound.sfx('crit'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#fff6d8', a: 0.45, life: 8 }); HD15.pillar(this, { x: T.x, y: ft }, P, 160, { w: 26, dur: 30 }); HD15.flare(this, T, HD15.P.white, 160, { rot: Math.PI / 2, dur: 22 });
      HD15.sparks(this, T, 24, P, { ang: -Math.PI / 2, spread: 0.7, spd: 6, life: 24, g: 0.06 }); HD15.ring(this, { x: T.x, y: ft }, P, 8, 50, { fl: 0.3, w: 2.4, dur: 18 }); this.shake = Math.max(this.shake || 0, 10);
      if (v) yield* AF22.launch(this, v, 40); else yield* wait(26); yield* wait(6); } },
  // 百烈崩拳（奧義，10 段，無視 30% 物防）：舞台暗下來，主角貼上去 → 拳頭的殘影一拳接一拳越來越密（每一拳都有兩三個淡淡的拳影跟著）→
  //   最後一拳：停格、畫面一白，金色的氣從對手全身炸開、往後轟出一道大衝擊波，身上裂紋爬滿、崩開
  ogFist: { *f(U, T, u) { HD15.dim(this, 0.6, 140, { col: '#140c00', inn: 0.06, out: 0.25 }); Sound.sfx('charge'); const P = AF22.P(); HD15.gather(this, DS16.hands(this).R, 16, P, 40, { span: 12 }); yield* wait(12); yield* this.lunge(u, 10, 2); yield* AF22.hundred(this, T, 0, 10); },
    *h(U, T, u, i) { yield* AF22.hundred(this, T, i, 10); } },
};
// 一個掌影：金色的掌（中間一團、前面五道短指光），浮著不動，hold 以後淡掉
AF22.palm = (b, C, rot, o = {}) => { const P = AF22.P(), dl = o.delay || 0, hold = o.hold || 30; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + hold + 10, draw: (x, p, k, t) => { const g = HD15.eo(HD15.cl(t / 6)), f = 1 - HD15.cl((t - hold) / 10);
    x.save(); x.translate(p.x, p.y); x.rotate(rot); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.75 * f * g; HD15.put(x, HD15.tex('glow', P.glow), 0, 0, 16, 16, 0, 0.8);
    x.fillStyle = P.mid; x.beginPath(); x.ellipse(0, 0, 4.2, 5, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = P.core; x.lineWidth = 1.4; x.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const yy = -3 + i * 2; x.beginPath(); x.moveTo(3.5, yy); x.lineTo(8 + (i === 1 || i === 2 ? 1.4 : 0), yy); x.stroke(); } x.beginPath(); x.moveTo(0, 4); x.lineTo(3, 7); x.stroke(); x.restore(); } }); };
AF22.tri = function* (b, T, i) { const P = AF22.P(), off = [-8, 8, 0][i % 3]; Sound.sfx('fsSwing'); const d = AF22.fist(b, T, 0.8 + i * 0.25, { off }); yield* wait(2); Sound.sfx(i < 2 ? 'fsHit' : 'fsHitSuper');
  HD15.motes(b, T, DS16.hands(b).Hc, 2, HD15.P.mp, { dur: 16 }); if (i >= 2) { HD15.stop(b, 4); AF22.wave(b, T, d, 1); b.shake = Math.max(b.shake || 0, 5); yield* wait(10); } else yield* wait(4); };
AF22.spin = function* (b, T, i) { const P = AF22.P(), C = { x: T.x, y: T.y + 10 }; Sound.sfx('fsSwing'); HD15.whirl(b, C, P, { r: 84 - i * 6, th: 22, fl: 0.34, turns: 0.8, trail: 2.6, dur: 18, a0: Math.PI * (0.75 + i * 0.5), rev: i % 2, spark: 1 });
  HD15.whirl(b, C, HD15.P.white, { r: 80 - i * 6, th: 7, fl: 0.34, turns: 0.8, trail: 2, dur: 16, a0: Math.PI * (0.75 + i * 0.5), rev: i % 2, delay: 1 });
  DG17.foes(b).forEach((v, j) => { const P0 = b.center(v); DG17.later(b, 3 + j * 2, () => { Sound.sfx('fsHit'); HD15.flash(b, P0, P, 30, { dur: 10 }); HD15.ring(b, P0, P, 3, 20, { w: 1.8, fl: 0.45, dur: 12 }); HD15.sparks(b, P0, 6, P, { spd: 3, life: 14 }); }); });
  yield* wait(i >= 2 ? 16 : 8); if (i >= 2) b.shake = Math.max(b.shake || 0, 6); };
AF22.barrage = function* (b, T, i, n) { const rn = s => (Math.random() - 0.5) * s, last = i >= n - 1;
  if (!last) { Sound.sfx('fsSwing'); const C = { x: T.x + rn(20), y: T.y + rn(18) }; AF22.fist(b, C, 0.7 + i * 0.03); AF22.fist(b, { x: C.x + rn(14), y: C.y + rn(12) }, 0.5, { delay: 1 }); yield* wait(2); Sound.sfx('fsHit'); yield* wait(i < 4 ? 2 : 1); return; }
  Sound.sfx('fsSwing'); const d = AF22.fist(b, T, 1.7); yield* wait(2); Sound.sfx('fsHitSuper'); HD15.stop(b, 7); b.spawn({ k: 'flash', c: '#fff6d8', a: 0.35, life: 8 }); AF22.wave(b, T, d, 1.4); AX21.chip(b, T, 1); b.shake = Math.max(b.shake || 0, 9); yield* wait(14); };
AF22.hundred = function* (b, T, i, n) { const rn = s => (Math.random() - 0.5) * s, last = i >= n - 1, P = AF22.P();
  if (!last) { Sound.sfx('fsSwing'); const C = { x: T.x + rn(24), y: T.y + rn(22) }; AF22.fist(b, C, 0.8); for (let q = 0; q < 2; q++) AF22.fist(b, { x: C.x + rn(26), y: C.y + rn(24) }, 0.5, { delay: q + 1 }); yield* wait(2); Sound.sfx('fsHit'); yield* wait(i < 5 ? 2 : 1); return; }
  Sound.sfx('fsSwing'); const d = AF22.fist(b, T, 2); yield* wait(3); Sound.sfx('fsHitSuper'); Sound.sfx('quake'); HD15.stop(b, 12); b.spawn({ k: 'flash', c: '#ffffff', a: 0.55, life: 12 });
  HD15.flash(b, T, P, 120, { dur: 22 }); HD15.flare(b, T, HD15.P.white, 220, { rot: 0, dur: 24, x8: 1 }); AF22.wave(b, T, d, 2.4); HD15.ring(b, T, P, 8, 100, { w: 3.4, dur: 24 }); HD15.ring(b, T, HD15.P.white, 6, 64, { w: 2, dur: 20, delay: 4 });
  HD15.cracks(b, T, 12, HD15.P.white, { len: 26, fl: 1, dur: 50, delay: 2 }); HD15.sparks(b, T, 40, P, { spd: 6, life: 26, g: 0.05 }); b.shake = Math.max(b.shake || 0, 18); yield* wait(24); };
// 拳套的三個特技：連環腳（兩段追擊）、氣旋（回 MP）、鐵骨（防禦）
const HDSP22 = [
  // 連環腳：一腳往上踢、一腳往下踢，兩道金色的踢弧交成 X
  { *f(U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('fsSwing'); AF22.kick(this, T, 'ur'); yield* wait(4); Sound.sfx('fsHit'); HD15.flash(this, T, AF22.P(), 26, { dur: 10 }); yield* wait(3); },
    *h(U, T) { Sound.sfx('fsSwing'); AF22.kick(this, T, 'dl', { th: 11 }); yield* wait(4); Sound.sfx('fsHitSuper'); HD15.stop(this, 4); AF22.fist(this, T, 1.1); this.shake = Math.max(this.shake || 0, 5); yield* wait(12); } },
  // 氣旋：主角身邊捲起一圈金色的氣旋，藍色的光點捲進身上（回 MP）
  { *f(U, T, u) { const P = AF22.P(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y + 4 }; Sound.sfx('wind'); HD15.whirl(this, C, P, { r: 30, th: 10, fl: 0.4, turns: 1.6, trail: 3.6, dur: 30, spark: 1 });
      HD15.motes(this, { x: C.x, y: C.y - 60 }, C, 8, HD15.P.mp, { dur: 18 }); yield* wait(14); Sound.sfx('fsQi'); HD15.ring(this, C, P, 6, 36, { w: 2, dur: 16 }); yield* wait(16); } },
  // 鐵骨：全身繃緊，一層金色的光從頭到腳掃過去、身上一亮（像金屬），腳下一圈
  { *f(U, T, u) { const P = AF22.P(), H = DS16.hands(this), G = { x: H.Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('shGuard'); HD15.thrust(this, { x: H.Hc.x, y: H.Hc.y - 36 }, { x: H.Hc.x, y: G.y }, P, { w: 26, ext: 2, dur: 18, al: 0.6 });
      HD15.flash(this, H.Hc, HD15.P.white, 40, { dur: 14, delay: 6 }); HD15.ring(this, G, P, 6, 36, { fl: 0.3, w: 1.8, dur: 18, delay: 6 }); HD15.flare(this, H.Hc, P, 50, { rot: Math.PI / 4, dur: 16, x8: 1, delay: 8 }); yield* wait(26); } },
];
if (AF22.live) for (const k in HDFX22) { const id = 't_' + k, D = DEF.skills[id], F = HDFX22[k]; if (!D) { bvErr('v12.102', 'no skill ' + id); continue; } const key = 'hd15_' + k;
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.h.call(this, U, T, u, i, t); };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
if (AF22.live) { const kd = TREE_KINDS11.indexOf('拳套'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.call(this, U, T, u, t); };
  HDSP22.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.102', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]); if (F.h && FX[key + 'h']) { HD15.old[key + 'h'] = FX[key + 'h']; HD15.spKeys.push([key + 'h', wrap(F.h)]); } }); }
// 氣爆掌用掉幾點氣（出招時記下來）
// 體內的氣核：氣爆掌打中後，對手身上一顆金色的氣核一閃一閃（到爆開前一直在）；下一回合開始爆開：裂紋從裡面透出金光 → 一口氣炸開（氣越多越大）
AF22.qiN = {};
{ const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY, _dm = H.DAMAGE;
  H.STATUS_APPLY = function* (e, s, t, P) { if (t && P && P.status === 'qiBomb12' && !P.failed) { AF22.qiN[t.id] = (P.data && P.data.n) || 0; t.qi22 = 1; } return yield* _ap.call(this, e, s, t, P); };
  H.DAMAGE = function* (e, s, t, P) { if (t && P && P.kind === 'qi12') { const C = this.center(t), n = AF22.qiN[t.id] || 0, k = 1 + n * 0.15; t.qi22 = 0; yield* this.msg(t.n + '體內的氣爆開了！', { hold: 14 });
      if (HD15.on && AF22.live) { const Pk = AF22.P(); Sound.sfx('charge'); HD15.cracks(this, C, 8 + n, Pk, { len: 18 * k, fl: 1, dur: 40 }); HD15.flash(this, C, Pk, 30, { dur: 16 }); yield* wait(12);
        Sound.sfx('fsHitSuper'); Sound.sfx('quake'); HD15.stop(this, 6); this.spawn({ k: 'flash', c: '#fff6d8', a: 0.3 + n * 0.04, life: 10 }); HD15.flash(this, C, Pk, 70 * k, { dur: 20 }); HD15.ring(this, C, Pk, 6, 56 * k, { w: 3, dur: 20 });
        HD15.ring(this, C, HD15.P.white, 4, 34 * k, { w: 1.8, dur: 16, delay: 3 }); HD15.flare(this, C, HD15.P.white, 120 * k, { rot: 0, dur: 20, x8: 1 }); HD15.spikes(this, C, Pk, 12 + n, 36 * k); HD15.sparks(this, C, 20 + n * 4, Pk, { spd: 4.6, life: 22, g: 0.05 });
        this.shake = Math.max(this.shake || 0, 8 + n); yield* wait(6); }
      else { Sound.sfx('heavy'); this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4, r1: 30, c: '#ffc060', w: 3, life: 12 }); this.star(C.x, C.y, '#fff8e0', 16); this.shake = Math.max(this.shake, 6); yield* wait(8); } }
    return yield* _dm.call(this, e, s, t, P); };
  const _u = Battle.prototype.update; Battle.prototype.update = function (...a) { const r = _u.apply(this, a); if (HD15.on && AF22.live && this.t % 18 === 0 && this.foes) for (const v of this.foes()) if (v.qi22 && !v.gone && v.hp > 0) { const C = this.center(v); HD15.flash(this, C, AF22.P(), 16, { dur: 14 }); HD15.ring(this, C, AF22.P(), 14, 3, { w: 1.2, dur: 12 }); } return r; }; }
{ const H = Battle.prototype.handlers, _su = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { this.af22spent = P && P.spent || 0; return yield* _su.call(this, e, s, t, P); }; }
// 普通攻擊（拳套打兩下）：左一拳、右一拳；分段的第二、三下也是拳
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && AF22.live && this._thKind === '拳套')) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0; const n = this.af22atk = ((this.af22atk || 0) + 1) % 2;
    yield* this.lunge(u, 10, 2); Sound.sfx('fsSwing'); AF22.fist(this, T, 0.9, { off: n ? 6 : -6 }); yield* wait(3); Sound.sfx('fsHit'); yield* wait(6); };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && AF22.live && kind === '拳套')) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; yield* b.lunge(s, 6, 2); Sound.sfx('fsSwing');
    AF22.fist(b, C, 0.8, { off: [-6, 6, 0][i % 3] }); yield* wait(3); yield* wait(4); }; }
HD15.use(HD15.on);
