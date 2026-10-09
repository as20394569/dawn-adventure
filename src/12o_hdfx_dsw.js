/* ===================== v12.95 雙劍的新特效（高解析光效） =====================
   玩家：「接下來調整雙劍技能」→ 問了：調整的是「特效換成高解析光效」，顏色「全白，跟劍一樣」。
   跟劍一樣只在特效測試版打開（選單的「劍系新特效：開／關」），正式版還是舊特效，說好才換。
   雙劍的樣子：兩把劍 → 刀光多半是一對一對的（主手先、副手接著），左右對稱、交叉成 X；攻擊一律白色＋白色光粒；
   強化自己的招保留顏色（架劍是冷的銀藍、雙劍舞陣是粉紅）。
   包含：6 招、絕技迴燕雙斷・黑曜終劍、奧義雙龍十字、特技交叉斬・劍風、普攻（左右各一刀）、
   副手追加的一斬（會心時／雙劍舞陣）、架劍架開攻擊的那一下和反擊。 */
const DS16 = { mute: 0 };
DS16.on = () => typeof dualMode11 === 'function' && !!Game.st && dualMode11(Game.st) === '雙劍';
DS16.foes = b => b.foes ? b.foes().filter(v => !v.gone && v.hp > 0) : [];
DS16.hands = b => { const Hc = b.center(b.H), R = typeof PX13 !== 'undefined' && PX13.hand ? PX13.hand(b) : { x: Hc.x + 10, y: Hc.y - 10 }; return { Hc, R, L: { x: 2 * Hc.x - R.x, y: R.y } }; };
DS16.later = (b, n, fn) => HD15.add(b, { x: 0, y: 0, life: n + 2, draw: () => {}, upd: p => { if (!p.fired && p.t >= n) { p.fired = 1; fn(); } } });
// 刀光的方向（月牙一律往上鼓）：dr 左上→右下、dl 右上→左下、ur 左下→右上、ul 右下→左上、h 左→右、v 上→下
DS16.D = { dr: [-0.67, 1], dl: [-2.41, -1], ur: [-2.41, 1], ul: [-0.67, -1], h: [-Math.PI / 2, 1], v: [0, 1] };
DS16.cut = (b, T, d, o = {}) => { const [ang, dir] = DS16.D[d]; return HD15.slash(b, T, Object.assign({ pal: HD15.P.white, r: 48, th: 10, span: 1.5, dur: 18, sw: 0.25, spark: 1 }, o, { ang, dir })); };
// 打中的一下：閃光、一圈衝擊、火花、光刺
DS16.pop = (b, T, s = 1, o = {}) => { const P = HD15.P.white, dl = o.delay || 0; HD15.flash(b, T, P, 34 * s, { dur: 12, delay: dl }); HD15.ring(b, T, P, 3, 22 * s, { w: 1.8, dur: 13, delay: dl });
  HD15.sparks(b, T, Math.round(10 * s), P, { spd: 3.2 * s, life: 16, delay: dl }); if (s >= 1) HD15.spikes(b, T, P, Math.round(7 * s), 18 * s, { rot: o.rot || 0, delay: dl }); };
// 主手・副手交叉的一對刀光（X）
DS16.pair = (b, T, o = {}) => { const g = o.gap ?? 3, dx = o.dx ?? 3, base = Object.assign({ r: 50, th: 10, dur: 18 }, o.cut || {});
  DS16.cut(b, { x: T.x - dx, y: T.y }, 'dr', Object.assign({}, base, { delay: o.delay || 0 })); DS16.cut(b, { x: T.x + dx, y: T.y }, 'dl', Object.assign({}, base, { delay: (o.delay || 0) + g })); };
// 幻影連斬的前五刀：每刀一個方向，後面跟兩道殘影（晚一點、偏一點、越來越淡）
DS16.PH = [['dr', -4, 0], ['dl', 4, 0], ['h', 0, -6], ['ur', -3, 4], ['ul', 3, 4]];
DS16.phantom = (b, T, i) => { const [d, dx, dy] = DS16.PH[i % 5], C = { x: T.x + dx, y: T.y + dy }, s = i % 2 ? -1 : 1; DS16.cut(b, C, d, { r: 46, th: 9, dur: 16 });
  DS16.cut(b, { x: C.x + s * 7, y: C.y - 4 }, d, { r: 50, th: 6, dur: 18, delay: 2, al: 0.38, spark: 0 }); DS16.cut(b, { x: C.x - s * 7, y: C.y + 4 }, d, { r: 42, th: 4, dur: 16, delay: 4, al: 0.22, spark: 0 }); };
// 三次貝茲曲線＋左右擺動（光龍飛的路）
DS16.bz = (A, B, C, D, k) => { const m = 1 - k; return { x: m * m * m * A.x + 3 * m * m * k * B.x + 3 * m * k * k * C.x + k * k * k * D.x, y: m * m * m * A.y + 3 * m * m * k * B.y + 3 * m * k * k * C.y + k * k * k * D.y }; };
DS16.path = (A, B, C, D, amp, waves) => k => { const p = DS16.bz(A, B, C, D, k), q = DS16.bz(A, B, C, D, Math.min(1, k + 0.01)), r = DS16.bz(A, B, C, D, Math.max(0, k - 0.01)), dx = q.x - r.x, dy = q.y - r.y, d = Math.hypot(dx, dy) || 1, s = amp * Math.sin(k * Math.PI * waves) * (1 - k * 0.85); return { x: p.x - dy / d * s, y: p.y + dx / d * s }; };
// 光龍：沿著 path(k) 飛的一條白光；頭大（兩根往後的角）、身體往尾巴越來越細、身上一直掉光粒；飛到終點後尾巴收進頭裡
HD15.dragon = (b, path, pal, dur, o = {}) => { pal = HD15.W(pal); const hist = [], dl = o.delay || 0, w0 = o.w || 11, N = o.len || 22;
  return HD15.add(b, { x: 0, y: 0, delay: dl, life: dl + dur + N,
    upd: p => { const t = p.t - dl; if (t < 0) return; if (t <= dur) { const q = path(HD15.cl(t / dur)); p.x = q.x; p.y = q.y; hist.push([p.x, p.y]); if (hist.length > N) hist.shift();
        if (t % 2 === 0 && hist.length > 4) { const [sx, sy] = hist[Math.floor(Math.random() * (hist.length - 2))]; HD15.mote(b, sx, sy, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7 - 0.2, pal); } }
      else if (hist.length > 1) hist.shift(); },
    draw: (x, p, k, t) => { const n = hist.length; if (n < 3) return; const f = t > dur ? HD15.cl(n / N) : 1; x.globalCompositeOperation = 'lighter'; x.lineJoin = 'round';
      for (const [wd, col, al] of [[w0 * 1.7, pal.glow, 0.35], [w0 * 0.7, pal.mid, 0.9], [w0 * 0.26, pal.core, 1]]) { const Lp = [], Rp = [];
        for (let i = 0; i < n; i++) { const [px, py] = hist[i], [qx, qy] = hist[Math.min(n - 1, i + 1)], [sx, sy] = hist[Math.max(0, i - 1)], dx = qx - sx, dy = qy - sy, d = Math.hypot(dx, dy) || 1, w = wd * Math.pow(i / (n - 1), 0.6) * (0.85 + 0.15 * Math.sin(i * 1.3 + t * 0.4)) / 2;
          Lp.push([px - dy / d * w, py + dx / d * w]); Rp.push([px + dy / d * w, py - dx / d * w]); }
        x.beginPath(); Lp.forEach(([a, c], i) => i ? x.lineTo(a, c) : x.moveTo(a, c)); for (let i = n - 1; i >= 0; i--) x.lineTo(Rp[i][0], Rp[i][1]); x.closePath(); x.globalAlpha = al * f; x.fillStyle = col; x.fill(); }
      if (t <= dur) { const [hx, hy] = hist[n - 1], [ax, ay] = hist[n - 3], an = Math.atan2(hy - ay, hx - ax);
        HD15.put(x, HD15.tex('glow', pal.glow), hx, hy, w0 * 4.2, w0 * 4.2, 0, 0.85); HD15.put(x, HD15.tex('core', pal.mid), hx, hy, w0 * 1.6, w0 * 1.6, 0, 1);
        for (const s of [-1, 1]) HD15.put(x, HD15.tex('streak', pal.mid), hx - Math.cos(an + s * 0.5) * w0 * 1.1, hy - Math.sin(an + s * 0.5) * w0 * 1.1, w0 * 2.6, 3, an + s * 0.5, 0.8); } } }); };
// 黑曜巨劍：劍尖朝下的大劍。身體是黑曜石（黑、帶一點紫的玻璃光澤），邊緣一圈白光；先在上方慢慢浮現、劍身走過一道反光，
//   然後直直落下插進去，停一下，碎成黑色碎片和白色光粒（p.y＝劍尖）
DS16.bigSword = (b, X, y0, y1, o = {}) => { const L = o.L || 96, Wd = o.w || 18, form = o.form || 20, fall = o.fall || 7, stay = o.stay || 20, P = HD15.P.white; let fired = 0;
  return HD15.add(b, { x: X, y: y0, life: form + fall + stay + 2,
    upd: p => { const t = p.t; if (t < form) p.y = y0 - (1 - t / form) * 6 + Math.sin(t * 0.25) * 1.2; else if (t < form + fall) p.y = y0 + (y1 - y0) * HD15.ei((t - form) / fall); else { p.y = y1; if (!fired) { fired = 1; if (o.onHit) o.onHit(); } }
      if (t === form + fall + stay) for (let i = 0; i < 16; i++) { const d = Math.random() * L; HD15.shards(b, { x: X + (Math.random() - 0.5) * Wd * 0.8, y: y1 - d }, 1, { cols: ['#4a3e66', '#120e1c', '#000000'], spd: 2.4, sz: 3.2, up: 0.6, g: 0.14 }); HD15.mote(b, X + (Math.random() - 0.5) * Wd, y1 - d, (Math.random() - 0.5), -0.3 - Math.random() * 0.5, P); } },
    draw: (x, p, k, t) => { const a = t < form ? HD15.eo(t / form) : t >= form + fall + stay ? 0 : 1; if (a <= 0.01) return; const X0 = p.x, Y = p.y, gy = Y - L; x.save();
      const blade = () => { x.beginPath(); x.moveTo(X0, Y); x.lineTo(X0 + Wd / 2, Y - L * 0.16); x.lineTo(X0 + Wd * 0.42, gy); x.lineTo(X0 - Wd * 0.42, gy); x.lineTo(X0 - Wd / 2, Y - L * 0.16); x.closePath(); };
      const G = x.createLinearGradient(X0 - Wd / 2, 0, X0 + Wd / 2, 0); G.addColorStop(0, '#221a38'); G.addColorStop(0.42, '#07050e'); G.addColorStop(0.55, '#3c3060'); G.addColorStop(0.62, '#0d0a18'); G.addColorStop(1, '#05040a');
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = a; blade(); x.fillStyle = G; x.fill();
      x.strokeStyle = 'rgba(150,130,210,0.55)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(X0 + 1, Y - L * 0.95); x.lineTo(X0 + 1, Y - L * 0.06); x.stroke();   // 稜線
      x.fillStyle = '#0a0812'; x.beginPath(); x.moveTo(X0 - Wd * 1.4, gy - 2); x.lineTo(X0 - Wd * 1.1, gy - 5); x.lineTo(X0 + Wd * 1.1, gy - 5); x.lineTo(X0 + Wd * 1.4, gy - 2); x.lineTo(X0 + Wd * 1.1, gy + 1); x.lineTo(X0 - Wd * 1.1, gy + 1); x.closePath(); x.fill();   // 劍格
      const hy = gy - 5 - L * 0.24; x.fillRect(X0 - Wd * 0.17, hy, Wd * 0.34, L * 0.24); x.beginPath(); x.moveTo(X0, hy - 9); x.lineTo(X0 + 4, hy - 4); x.lineTo(X0, hy + 1); x.lineTo(X0 - 4, hy - 4); x.closePath(); x.fill();   // 劍柄、柄頭
      x.globalCompositeOperation = 'lighter'; blade(); x.strokeStyle = HD15.rgba(P.glow, 0.45 * a); x.lineWidth = 3; x.stroke(); x.strokeStyle = HD15.rgba(P.core, 0.9 * a); x.lineWidth = 0.8; x.stroke();   // 邊緣的白光
      if (t < form + 2) { const sy = Y - L * HD15.cl(t / form); x.save(); blade(); x.clip(); HD15.put(x, HD15.tex('streak', P.mid), X0, sy, Wd * 3, 7, -0.5, 0.8 * a); x.restore(); }   // 浮現時一道反光從劍尖掃到劍格
      if (t >= form && t < form + fall + 3) HD15.put(x, HD15.tex('streak', P.mid), X0, gy - 30, 90, Wd * 0.9, Math.PI / 2, 0.6 * (1 - HD15.cl((t - form - fall) / 3)));   // 落下時上面拖一道光
      x.restore(); } }); };

/* ---------- 雙劍的 6 招＋絕技 2＋奧義 ---------- */
const HDFX16 = {
  // 雙月斬（2 段）：主手一道大月牙從左上斬到右下 → 副手一道從右上斬到左下，兩道月牙交成 X，停格、X 斬痕往兩邊裂開
  dsMoon: { *f(U, T, u) { const P = HD15.P.white; yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      DS16.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 52, th: 11, span: 1.7, dur: 20 }); DS16.cut(this, { x: T.x - 6, y: T.y + 3 }, 'dr', { r: 46, th: 5, span: 1.5, dur: 16, delay: 2, al: 0.45, spark: 0 });
      yield* wait(3); HD15.flash(this, T, P, 26, { dur: 10 }); HD15.sparks(this, T, 7, P, { spd: 3, life: 14 }); yield* wait(5); },
    *h(U, T) { const P = HD15.P.white; Sound.sfx('blade');
      DS16.cut(this, { x: T.x + 3, y: T.y }, 'dl', { r: 52, th: 11, span: 1.7, dur: 20 }); DS16.cut(this, { x: T.x + 6, y: T.y + 3 }, 'dl', { r: 46, th: 5, span: 1.5, dur: 16, delay: 2, al: 0.45, spark: 0 });
      yield* wait(3); HD15.stop(this, 3); HD15.cut(this, T, 0.84, 64, P, { dur: 16, w: 6 }); HD15.cut(this, T, 2.3, 64, P, { dur: 16, w: 6 }); DS16.pop(this, T, 1.1, { rot: Math.PI / 4 });
      this.shake = Math.max(this.shake || 0, 5); yield* wait(10); } },
  // 架劍（這回合物理傷害 −60%、被打就反擊）：兩把劍先各亮一下，在身前交成 X 停著（冷的銀藍），刀刃相碰迸出火花，身前一道壓扁的弧光往外推
  dsParry: { keep: 1, *f(U, T, u) { const P = HD15.P.steel, H = DS16.hands(this), X = { x: H.Hc.x, y: H.Hc.y - 30 }; Sound.sfx('shield');
      HD15.flare(this, H.R, P, 26, { rot: -0.8, dur: 10 }); HD15.flare(this, H.L, P, 26, { rot: 0.8, dur: 10 }); yield* wait(4); Sound.sfx('tick');
      HD15.mark(this, X, Math.PI / 4, 56, P, { hold: 26, w: 2 }); HD15.mark(this, X, -Math.PI / 4, 56, P, { hold: 26, w: 2 });
      HD15.flash(this, X, P, 30, { dur: 14 }); HD15.flare(this, X, P, 44, { rot: 0, dur: 16, x8: 1 }); HD15.sparks(this, X, 10, HD15.P.gold, { spd: 2.6, life: 14, g: 0.08 });
      HD15.ring(this, X, P, 8, 34, { fl: 0.4, w: 2, dur: 20, delay: 2 }); HD15.ring(this, { x: H.Hc.x, y: HERO_FOOT - 2 }, P, 6, 30, { fl: 0.3, w: 1.2, dur: 22 }); yield* wait(26); } },
  // 迴旋雙刃（全體 2 段）：第一段主手的刀光繞著全體轉一圈（順時針），第二段副手反方向再轉一圈；每隻身上各閃一下
  dsWhirl: { *f(U, T, u) { const P = HD15.P.white, C = { x: T.x, y: T.y + 6 }; Sound.sfx('wind'); yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      HD15.whirl(this, C, P, { r: 78, th: 11, fl: 0.34, turns: 1.2, trail: 3.6, dur: 28, spark: 1 }); HD15.whirl(this, C, P, { r: 66, th: 4, fl: 0.34, turns: 1.1, trail: 2.6, dur: 26, delay: 3, al: 0.45 });
      yield* wait(9); DS16.foes(this).forEach((v, i) => DS16.pop(this, this.center(v), 0.8, { delay: i * 2 })); yield* wait(10); },
    *h(U, T) { const P = HD15.P.white, C = { x: T.x, y: T.y + 2 }; Sound.sfx('blade');
      HD15.whirl(this, C, P, { r: 74, th: 11, fl: 0.4, turns: 1.2, trail: 3.6, dur: 28, spark: 1, rev: 1, a0: Math.PI * 0.25 }); HD15.whirl(this, C, P, { r: 62, th: 4, fl: 0.4, turns: 1.1, trail: 2.6, dur: 26, delay: 3, al: 0.45, rev: 1, a0: Math.PI * 0.25 });
      HD15.ring(this, C, P, 20, 92, { fl: 0.36, w: 2, dur: 22, delay: 4 }); yield* wait(9); Sound.sfx('heavy'); HD15.stop(this, 3);
      DS16.foes(this).forEach((v, i) => DS16.pop(this, this.center(v), 1, { delay: i * 2 })); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 幻影連斬（6 段）：主角左右留下殘影 → 每一刀換一個方向，後面跟著兩道越來越淡的殘影刀光 → 第六刀主手、副手交成 X，殘影一起收進來，停格
  dsPhantom: { *f(U, T, u) { const P = HD15.P.white; Sound.sfx('wind'); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(this, (i % 2 ? -1 : 1) * (6 + i * 5), -i * 2, '#e8eeff', 12 + i * 4, 0.4);
      yield* this.lunge(u, 20, 2); Sound.sfx('blade'); DS16.phantom(this, T, 0); yield* wait(3); HD15.flash(this, T, P, 22, { dur: 9 }); yield* wait(2); },
    *h(U, T, u, i) { const P = HD15.P.white;
      if (i < 5) { Sound.sfx('bladeQ'); DS16.phantom(this, T, i); yield* wait(3); HD15.flash(this, T, P, 20 + i * 3, { dur: 9 }); HD15.sparks(this, T, 4 + i, P, { spd: 2.8, life: 14 }); yield* wait(2); return; }
      Sound.sfx('blade'); DS16.pair(this, T, { cut: { r: 56, th: 11, dur: 20 } });
      for (const s of [-1, 1]) DS16.cut(this, { x: T.x + s * 9, y: T.y - 3 }, s < 0 ? 'dr' : 'dl', { r: 60, th: 5, dur: 20, delay: 5, al: 0.35, spark: 0 });
      yield* wait(6); Sound.sfx('crit'); HD15.stop(this, 5); HD15.cut(this, T, 0.84, 70, P, { dur: 18, w: 6 }); HD15.cut(this, T, 2.3, 70, P, { dur: 18, w: 6 });
      DS16.pop(this, T, 1.3, { rot: Math.PI / 4 }); HD15.flare(this, T, P, 90, { rot: 0, dur: 18, x8: 1 }); this.shake = Math.max(this.shake || 0, 7); yield* wait(12); } },
  // 雙星十字（2 段）：第一段「十」（直的一刀、橫的一刀）留在對手身上 → 第二段「×」（斜的兩刀），兩道十字合起來是一顆八芒星，停格、八個方向迸出光
  dsStar: { *f(U, T, u) { const P = HD15.P.white; yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      DS16.cut(this, T, 'v', { r: 60, th: 10, span: 1.4, dur: 20 }); yield* wait(3); Sound.sfx('bladeQ'); DS16.cut(this, T, 'h', { r: 60, th: 10, span: 1.4, dur: 20 }); yield* wait(3);
      HD15.stop(this, 3); HD15.mark(this, T, Math.PI / 2, 64, P, { hold: 30, w: 1.5 }); HD15.mark(this, T, 0, 64, P, { hold: 30, w: 1.5 });
      HD15.flash(this, T, P, 40, { dur: 14 }); HD15.flare(this, T, P, 80, { rot: 0, dur: 18 }); HD15.sparks(this, T, 10, P, { spd: 3.4, life: 16 }); yield* wait(8); },
    *h(U, T) { const P = HD15.P.white; Sound.sfx('blade'); DS16.pair(this, T, { dx: 0, cut: { r: 60, th: 10, dur: 20 } }); yield* wait(6);
      Sound.sfx('crit'); HD15.stop(this, 6); HD15.cut(this, T, Math.PI / 4, 76, P, { dur: 22, w: 6, gap: 5 }); HD15.cut(this, T, Math.PI * 3 / 4, 76, P, { dur: 22, w: 6, gap: 5 }); HD15.cut(this, T, 0, 60, P, { dur: 20, w: 4, gap: 4 }); HD15.cut(this, T, Math.PI / 2, 60, P, { dur: 20, w: 4, gap: 4 });
      HD15.flash(this, T, P, 70, { dur: 18 }); HD15.flare(this, T, P, 130, { rot: 0, dur: 22, x8: 1 }); HD15.spikes(this, T, P, 16, 34); HD15.ring(this, T, P, 4, 38, { w: 2.2, dur: 18 });
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; HD15.sparks(this, { x: T.x + Math.cos(a) * 20, y: T.y + Math.sin(a) * 20 }, 2, P, { ang: a, spread: 0.4, spd: 3.6, life: 18 }); }
      this.shake = Math.max(this.shake || 0, 8); yield* wait(16); } },
  // 雙劍舞陣（3 回合每次攻擊後副手追加一斬、速度 +1）：舞台稍暗，兩把劍的粉紅刀光繞著主角轉兩圈（差半圈），花瓣一樣的光粒往上飄，最後兩把劍一起亮（速度提升的箭頭在下一步）
  dsDance: { keep: 1, *f(U, T, u) { const P = HD15.P.pink, H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y + 4 }, G = { x: H.Hc.x, y: HERO_FOOT - 2 }; Sound.sfx('wind');
      HD15.dim(this, 0.25, 62); HD15.ring(this, G, P, 6, 38, { fl: 0.3, w: 1.4, dur: 26 });
      HD15.whirl(this, C, P, { r: 36, th: 9, fl: 0.42, turns: 2, trail: 2.2, dur: 40, spark: 1 }); HD15.whirl(this, C, P, { r: 36, th: 9, fl: 0.42, turns: 2, trail: 2.2, dur: 40, a0: Math.PI * 1.75, spark: 1 });
      for (let i = 0; i < 18; i++) DS16.later(this, i * 2, () => HD15.mote(this, G.x + (Math.random() - 0.5) * 50, G.y - Math.random() * 10, (Math.random() - 0.5) * 0.6, -0.5 - Math.random() * 0.6, P, { life: 34, s: 1.3 }));
      yield* wait(24); Sound.sfx('blade'); HD15.flare(this, H.R, P, 34, { rot: -0.8, dur: 14 }); HD15.flare(this, H.L, P, 34, { rot: 0.8, dur: 14 }); HD15.flash(this, C, P, 40, { dur: 16 }); yield* wait(18); } },

  // 迴燕雙斷（必定會心）：舞台變暗、兩把劍一亮 → 一刀往下斬、刀一轉馬上往上回斬，兩道刀光像燕子的尾巴（V）→ 停格，V 斬痕裂開，光像燕子一樣往右上飛走
  zjSwallow: { *f(U, T, u) { const P = HD15.P.white, H = DS16.hands(this), V = { x: T.x, y: T.y + 16 }; Sound.sfx('charge');
      HD15.dim(this, 0.45, 62); HD15.flare(this, H.R, P, 36, { rot: -0.7, dur: 12, delay: 2 }); HD15.flare(this, H.L, P, 36, { rot: 0.7, dur: 12, delay: 2 }); yield* wait(12);
      yield* this.lunge(u, 24, 2); Sound.sfx('blade'); HD15.slash(this, { x: T.x - 11, y: T.y - 5 }, { pal: P, r: 104, th: 10, ang: 2.66, dir: -1, span: 0.4, dur: 20, sw: 0.18, spark: 1 }); yield* wait(3);
      Sound.sfx('blade'); HD15.slash(this, { x: T.x + 11, y: T.y - 5 }, { pal: P, r: 104, th: 10, ang: 0.48, dir: -1, span: 0.4, dur: 20, sw: 0.18, spark: 1 }); yield* wait(4);
      Sound.sfx('crit'); HD15.stop(this, 6); HD15.cut(this, { x: T.x - 11, y: T.y - 5 }, 1.09, 50, P, { dur: 22, w: 6, gap: 4 }); HD15.cut(this, { x: T.x + 11, y: T.y - 5 }, -1.09, 50, P, { dur: 22, w: 6, gap: 4 });
      HD15.flash(this, V, P, 50, { dur: 16 }); HD15.flash(this, T, P, 40, { dur: 14 }); HD15.flare(this, V, P, 110, { rot: 0, dur: 20, x8: 1 }); HD15.spikes(this, V, P, 10, 28);
      HD15.windLines(this, V, { x: T.x + 70, y: T.y - 70 }, P, 7, { spread: 18, len: 44, spd: 9, life: 16, delay: 3 }); HD15.sparks(this, V, 16, P, { ang: -0.8, spread: 1.2, spd: 4.2, life: 20, g: 0.02 });
      this.shake = Math.max(this.shake || 0, 10); yield* wait(18); } },
  // 黑曜終劍（物攻・魔攻較高的一邊算）：畫面幾乎全黑，兩把劍的劍尖各射一道細光往上 → 對手上方的黑暗裡浮現一把黑曜石巨劍（黑色玻璃、邊緣一圈白光），
  //   反光從劍尖掃到劍格 → 直直落下插進對手，停格，大閃光、地上的衝擊波、裂痕、黑色碎片噴起 → 巨劍碎成黑色碎片和白色光粒
  zjObsidian: { *f(U, T, u, t) { const P = HD15.P.white, H = DS16.hands(this), G = { x: T.x, y: t && t.foot ? t.foot : T.y + 24 }, y1 = T.y + 18, y0 = T.y - 20; Sound.sfx('charge');
      HD15.dim(this, 0.8, 100, { col: '#020108', inn: 0.12, out: 0.2 }); HD15.flare(this, H.R, P, 30, { rot: -1.2, dur: 14 }); HD15.flare(this, H.L, P, 30, { rot: 1.2, dur: 14 });
      for (const A of [H.R, H.L]) HD15.add(this, { x: A.x, y: A.y, life: 16, draw: (x, p, k) => { const L = 200 * HD15.eo(HD15.cl(k * 2)); HD15.put(x, HD15.tex('streak', P.mid), p.x, p.y - L / 2, L, 3, Math.PI / 2, 0.8 * Math.sin(Math.PI * k)); } });
      yield* wait(10); Sound.sfx('arcane'); DS16.bigSword(this, T.x, y0, y1, { L: 66, w: 24, form: 22, fall: 7, stay: 20 }); HD15.gather(this, { x: T.x, y: y0 - 30 }, 18, P, 50, { span: 14, life: 14 });
      yield* wait(22); Sound.sfx('wind'); yield* wait(7);
      Sound.sfx('quake'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#ffffff', a: 0.45, life: 10 });
      HD15.flash(this, T, P, 90, { dur: 20 }); HD15.ring(this, G, P, 8, 80, { fl: 0.3, w: 3, dur: 24 }); HD15.ring(this, T, P, 6, 46, { w: 2.2, dur: 18 }); HD15.spikes(this, T, P, 14, 40);
      HD15.cracks(this, G, 6, P, { len: 44, fl: 0.25, dur: 60 }); HD15.shards(this, G, 12, { cols: ['#3a3050', '#14101e', '#000000'], ang: -Math.PI / 2, spread: 2.2, spd: 4, sz: 3.4, up: 1.4, g: 0.2 });
      HD15.smoke(this, G, 10, { col: '#2a2438', r: 30, spd: 1.6, sz: 14, life: 46, fl: 0.25, al: 0.7 }); this.shake = Math.max(this.shake || 0, 14); yield* wait(20);
      Sound.sfx('shield'); yield* wait(16); } },
  // 雙龍十字（奧義，2 段各 110）：天色一下子暗成深夜，光點往兩把劍上收 → 兩條白光龍從左右兩把劍竄出去，往外繞一大圈，從對手左上、右上同時撲下來
  //   （兩條龍在半空中交叉而過，各自從另一邊撲下來，不會圍成愛心的形狀）
//   → 第一道巨大十字「十」（直、橫兩道長刀光），停格、裂開 → 第二段：兩條龍繞著對手一順一逆盤一圈，第二道巨大十字「×」，停格、大爆發
  ogTwin: { *f(U, T, u) { const P = HD15.P.white, H = DS16.hands(this), t0 = this.t, dur = 34; Sound.sfx('charge');
      HD15.dim(this, 0.72, 100, { col: '#03050d', inn: 0.1, out: 0.25 }); HD15.gather(this, H.R, 14, P, 34, { span: 12, life: 14 }); HD15.gather(this, H.L, 14, P, 34, { span: 12, life: 14 });
      HD15.ring(this, { x: H.Hc.x, y: HERO_FOOT - 2 }, P, 6, 44, { fl: 0.3, w: 1.2, dur: 24 }); HD15.flare(this, H.R, P, 40, { rot: -0.8, spin: 0.5, dur: 18, delay: 8 }); HD15.flare(this, H.L, P, 40, { rot: 0.8, spin: -0.5, dur: 18, delay: 8 }); yield* wait(16);
      Sound.sfx('wind'); for (const s of [-1, 1]) { const A = s < 0 ? H.L : H.R; HD15.dragon(this, DS16.path(A, { x: A.x + s * 56, y: A.y - 70 }, { x: T.x - s * 74, y: T.y - 104 }, T, 7, 3), P, dur, { w: 11, len: 24 }); }
      yield* wait(dur - 10); yield* this.lunge(u, 22, 2); yield* wait(Math.max(0, 16 + dur - (this.t - t0)));
      Sound.sfx('quake'); HD15.stop(this, 5); this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 8 }); HD15.flash(this, T, P, 80, { dur: 18 }); HD15.ring(this, T, P, 6, 60, { w: 2.4, dur: 20 }); yield* wait(4);
      Sound.sfx('bladeBig'); HD15.slash(this, T, { pal: P, r: 500, th: 9, ang: 0, dir: 1, span: 0.24, dur: 32, sw: 0.12, spark: 1 }); yield* wait(5);
      Sound.sfx('bladeBig'); HD15.slash(this, T, { pal: P, r: 500, th: 9, ang: -Math.PI / 2, dir: 1, span: 0.24, dur: 30, sw: 0.12, spark: 1 }); yield* wait(6);
      Sound.sfx('crit'); HD15.stop(this, 6); HD15.cut(this, T, Math.PI / 2, 110, P, { dur: 26, w: 6, gap: 5 }); HD15.cut(this, T, 0, 110, P, { dur: 26, w: 6, gap: 5 });
      HD15.flare(this, T, P, 170, { rot: 0, dur: 22 }); HD15.spikes(this, T, P, 12, 34); HD15.sparks(this, T, 22, P, { spd: 4.6, life: 22, g: 0.06 }); this.shake = Math.max(this.shake || 0, 10); yield* wait(14); },
    *h(U, T) { const P = HD15.P.white, C = { x: T.x, y: T.y + 4 }; Sound.sfx('wind'); HD15.dim(this, 0.6, 70, { col: '#03050d', inn: 0.1, out: 0.3 });
      HD15.whirl(this, C, P, { r: 52, th: 9, fl: 0.5, turns: 1.1, trail: 3.2, dur: 24, spark: 1 }); HD15.whirl(this, C, P, { r: 52, th: 9, fl: 0.5, turns: 1.1, trail: 3.2, dur: 24, spark: 1, rev: 1, a0: Math.PI * 0.25 }); yield* wait(10);
      Sound.sfx('bladeBig'); HD15.slash(this, T, { pal: P, r: 500, th: 9, ang: -Math.PI / 4, dir: 1, span: 0.24, dur: 32, sw: 0.12, spark: 1 }); yield* wait(5);
      Sound.sfx('bladeBig'); HD15.slash(this, T, { pal: P, r: 500, th: 9, ang: -Math.PI * 3 / 4, dir: -1, span: 0.24, dur: 30, sw: 0.12, spark: 1 }); yield* wait(7);
      Sound.sfx('crit'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#ffffff', a: 0.45, life: 10 }); HD15.cut(this, T, Math.PI / 4, 120, P, { dur: 28, w: 6, gap: 6 }); HD15.cut(this, T, Math.PI * 3 / 4, 120, P, { dur: 28, w: 6, gap: 6 });
      HD15.flash(this, T, P, 110, { dur: 22 }); HD15.flare(this, T, P, 220, { rot: 0, dur: 26, x8: 1 }); HD15.ring(this, T, P, 6, 70, { w: 2.6, dur: 22 }); HD15.spikes(this, T, P, 16, 44); HD15.sparks(this, T, 36, P, { spd: 5.4, life: 26, g: 0.06 });
      this.shake = Math.max(this.shake || 0, 14); yield* wait(22); } },
};
// 雙劍的兩個特技：交叉斬（兩段、容易會心）、劍風（打全體）
const HDSP16 = [
  // 交叉斬：主手、副手連兩刀交成 X → 第二段停格，X 斬痕往兩邊裂開
  { *f(U, T, u) { const P = HD15.P.white; yield* this.lunge(u, 16, 2); Sound.sfx('blade'); DS16.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 54, th: 11, dur: 18 }); yield* wait(2);
      Sound.sfx('bladeQ'); DS16.cut(this, { x: T.x + 3, y: T.y }, 'dl', { r: 54, th: 11, dur: 18 }); yield* wait(4); HD15.flash(this, T, P, 30, { dur: 10 }); yield* wait(3); },
    *h(U, T) { const P = HD15.P.white; Sound.sfx('crit'); HD15.stop(this, 4); HD15.cut(this, T, Math.PI / 4, 70, P, { dur: 18, w: 6, gap: 5 }); HD15.cut(this, T, Math.PI * 3 / 4, 70, P, { dur: 18, w: 6, gap: 5 });
      DS16.pop(this, T, 1.2, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(12); } },
  // 劍風：雙劍一揮，上下兩道橫的風刃從左掃到右、穿過全體，每隻身上各閃一下
  { *f(U, T, u) { const P = HD15.P.white, L = DS16.foes(this), xs = L.map(v => this.center(v).x).concat([T.x]), x0 = Math.min(...xs) - 50, x1 = Math.max(...xs) + 50; Sound.sfx('wind'); yield* this.lunge(u, 12, 2); Sound.sfx('blade');
      for (const [dy, dl] of [[-8, 0], [8, 3]]) { const y = T.y + dy; HD15.windLines(this, { x: x0, y }, { x: x1, y }, P, 6, { spread: 10, len: 60, spd: 14, life: 12, delay: dl }); DS16.cut(this, { x: T.x, y }, 'h', { r: 200, th: 9, span: 0.55, dur: 20, delay: dl }); }
      yield* wait(6); HD15.stop(this, 3); L.forEach((v, i) => DS16.pop(this, this.center(v), 0.9, { delay: i * 2 })); this.shake = Math.max(this.shake || 0, 4); yield* wait(14); } },
];
for (const k in HDFX16) { const id = 't_' + k, D = DEF.skills[id], F = HDFX16[k]; if (!D) { bvErr('v12.95', 'no skill ' + id); continue; } const key = 'hd15_' + k, Wt = !F.keep;
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = Wt; try { yield* F.h.call(this, U, T, u, i, t); } finally { HD15.forceW = false; } };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = Wt; try { yield* F.f.call(this, U, T, u, t); } finally { HD15.forceW = false; } };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
{ const kd = TREE_KINDS11.indexOf('雙劍'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = true; try { yield* F.call(this, U, T, u, t); } finally { HD15.forceW = false; } };
  HDSP16.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.95', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]);
    if (F.h && FX[key + 'h']) { HD15.old[key + 'h'] = FX[key + 'h']; HD15.spKeys.push([key + 'h', wrap(F.h)]); } }); }
// 雙劍的普通攻擊：主手一刀左上→右下，副手接著一刀右上→左下（白色）
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && this._thKind === '雙劍')) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0; const P = HD15.P.white; HD15.forceW = true;
    try { yield* this.lunge(u, 8, 3); Sound.sfx('blade'); DS16.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 44, th: 9, span: 1.4, dur: 16 }); yield* wait(4);
      Sound.sfx('bladeQ'); DS16.cut(this, { x: T.x + 3, y: T.y }, 'dl', { r: 44, th: 9, span: 1.4, dur: 16 }); yield* wait(3); HD15.flash(this, T, P, 28, { dur: 10 }); HD15.sparks(this, T, 8, P, { spd: 3, life: 14 }); yield* wait(5); } finally { HD15.forceW = false; } }; }
// 副手追加的一斬（雙劍的特性：會心時／雙劍舞陣：每次攻擊後）：傷害跳出來之前，副手補一道小刀光
{ const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (HD15.on && s && s.hero && t && P && P.kind === 'follow' && DS16.on()) { const C = this.center(t), Pl = HD15.P.white; this.hd15cast = 1; this.slashOn = 0; HD15.forceW = true;
      try { Sound.sfx('bladeQ'); DS16.cut(this, { x: C.x + 4, y: C.y + 2 }, 'dl', { r: 46, th: 9, span: 1.4, dur: 16 }); yield* wait(3); HD15.flash(this, C, Pl, 24, { dur: 9 }); HD15.sparks(this, C, 6, Pl, { spd: 2.8, life: 12 }); } finally { HD15.forceW = false; } }
    return yield* _dm.call(this, e, s, t, P); }; }
// 架劍架開攻擊的那一下：兩把劍在身前交成 X 擋住（銀藍），刀刃相碰迸出火花（舊的線條和星星不畫）
{ const _sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { if (DS16.mute) return p; return _sp.call(this, p); };
  const _sf = Sound.sfx; Sound.sfx = function (n, ...a) { if (DS16.mute && n === 'slash') n = 'blade'; return _sf.call(this, n, ...a); };
  const H = Battle.prototype.handlers, _re = H.REACTION; H.REACTION = function* (e, s, t, P) {
    if (!(HD15.on && s && s.hero && DS16.on() && typeof ctrInfo12 === 'function' && ctrInfo12(s, P && P.why).kind === 'parry')) return yield* _re.call(this, e, s, t, P);
    const g = _re.call(this, e, s, t, P); let r; DS16.mute = 1; try { r = g.next(); } finally { DS16.mute = 0; }
    const C = this.center(s), A = this.center(t || this.F), d = ctrDir12(C, A), X = { x: C.x + d.x * 16, y: C.y + d.y * 16 }, Pl = HD15.P.steel;
    HD15.cut(this, X, Math.PI / 4, 34, Pl, { dur: 16, w: 6, gap: 3 }); HD15.cut(this, X, -Math.PI / 4, 34, Pl, { dur: 16, w: 6, gap: 3 }); HD15.flash(this, X, Pl, 34, { dur: 12 }); HD15.flare(this, X, Pl, 46, { rot: 0, dur: 14, x8: 1 });
    HD15.ring(this, X, Pl, 4, 26, { w: 1.8, dur: 12 }); HD15.sparks(this, X, 14, HD15.P.gold, { spd: 3.2, life: 16, g: 0.1 });
    while (!r.done) { const v = yield r.value; r = g.next(v); } return r.value; }; }
// 反擊：往後一收、踏上去 → 主手一刀左下→右上、副手一刀右下→左上（兩道往上回斬交成 X）→ 停格、X 斬痕裂開；然後站一下、走回來（跟舊的同一套動作）
{ const _c = FX.ctr12; FX.ctr12 = function* (U, T, u) { const K = this.ctrNow12 || {}, v = u && u.id ? this.views[u.id] || u : u, o = v && v.off;
    if (!(HD15.on && u && u.hero && DS16.on() && K.kind !== 'block' && o)) return yield* _c.call(this, U, T, u);
    this.slashOn = 0; this.hd15cast = 1; const d = ctrDir12(U, T), x0 = o.x, y0 = o.y, P = HD15.P.white, H = DS16.hands(this);
    this.anim(v, 'cast', CTR12.BACK + 2, true); Sound.sfx('charge');
    yield* tween(CTR12.BACK, q => { const e = Math.sin(q * Math.PI / 2); o.x = x0 - d.x * 8 * e; o.y = y0 - d.y * 8 * e; });
    HD15.flare(this, H.R, P, 28, { rot: -0.8, dur: 10 }); HD15.flare(this, H.L, P, 28, { rot: 0.8, dur: 10 });
    this.anim(v, 'attack', CTR12.STEP + 26); const far = 26;
    for (let i = 1; i <= CTR12.STEP; i++) { const q = i / CTR12.STEP, e = q * q * (3 - 2 * q); o.x = x0 + d.x * (-8 + (far + 8) * e); o.y = y0 + d.y * (-8 + (far + 8) * e); yield; }
    HD15.forceW = true;
    try { Sound.sfx('blade'); DS16.cut(this, { x: T.x - 3, y: T.y }, 'ur', { r: 50, th: 10, dur: 18 }); yield* wait(4);
      Sound.sfx('blade'); DS16.cut(this, { x: T.x + 3, y: T.y }, 'ul', { r: 50, th: 10, dur: 18 }); yield* wait(3);
      HD15.stop(this, 3); HD15.cut(this, T, -Math.PI / 4, 60, P, { dur: 16, w: 6 }); HD15.cut(this, T, -Math.PI * 3 / 4, 60, P, { dur: 16, w: 6 }); DS16.pop(this, T, 1.1, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 6); }
    finally { HD15.forceW = false; }
    yield* wait(6); this.ctrRet12 = { v, x: o.x, y: o.y, x0: 0, y0: 0, at: this.t + CTR12.HOLD, dur: CTR12.RET }; }; }
HD15.use(HD15.on);
