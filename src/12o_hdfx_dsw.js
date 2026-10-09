/* ===================== v12.95 雙劍的新特效（高解析光效） =====================
   玩家：「接下來調整雙劍技能」→ 問了：調整的是「特效換成高解析光效」，顏色「全白，跟劍一樣」。
   v12.96 玩家：「雙劍的斬擊痕跡為一黑一白 痕跡弧度不要太彎曲」「雙龍十字像魔法 表現手法不太像劍」「黑曜終劍移除 替補新招」（→ 劍舞亂刃）
   · 兩把劍＝一白一黑：主手的刀光是白色、副手是黑色（黑色身體、淡淡的亮邊，散掉時是黑色光粒）；刀光多半一對一對，交成 X。
   · 刀光比劍的更平直（半徑 ×2.2、弧長 ÷2.2，長度一樣，只是弧度小很多）。
   · 雙龍十字拿掉光龍、光環，改成劍的動作：閃身穿過對手、斬痕慢一拍才浮出來（「十」），回身再斬一次（「×」）。
   跟劍一樣只在特效測試版打開（選單的「劍系新特效：開／關」），正式版還是舊特效，說好才換。
   強化自己的招保留顏色（架劍的閃光是冷的銀藍、雙劍舞陣的花瓣是粉紅）。 */
const DS16 = { mute: 0 };
DS16.on = () => typeof dualMode11 === 'function' && !!Game.st && dualMode11(Game.st) === '雙劍';
DS16.foes = b => b.foes ? b.foes().filter(v => !v.gone && v.hp > 0) : [];
DS16.hands = b => { const Hc = b.center(b.H), R = typeof PX13 !== 'undefined' && PX13.hand ? PX13.hand(b) : { x: Hc.x + 10, y: Hc.y - 10 }; return { Hc, R, L: { x: 2 * Hc.x - R.x, y: R.y } }; };
DS16.later = (b, n, fn) => HD15.add(b, { x: 0, y: 0, life: n + 2, draw: () => {}, upd: p => { if (!p.fired && p.t >= n) { p.fired = 1; fn(); } } });
DS16.BW = () => [HD15.P.white, HD15.P.black];   // 0 主手（白）、1 副手（黑）
// 刀光的方向（月牙一律往上鼓）：dr 左上→右下、dl 右上→左下、ur 左下→右上、ul 右下→左上、h 左→右、v 上→下
DS16.D = { dr: [-0.67, 1], dl: [-2.41, -1], ur: [-2.41, 1], ul: [-0.67, -1], h: [-Math.PI / 2, 1], v: [0, 1] };
// 雙劍的一道刀光：k=0 白（主手）、k=1 黑（副手）；比劍的平直（半徑 ×2.2、弧長 ÷2.2）
DS16.cut = (b, T, d, o = {}) => { const [ang, dir] = DS16.D[d], k = o.k || 0, r = (o.r || 48) * 2.2, span = (o.span || 1.5) / 2.2;
  return HD15.slash(b, T, Object.assign({ th: 10, dur: 18, sw: 0.25, spark: 1 }, o, { pal: DS16.BW()[k], r, span, ang, dir }, k ? { spark: 0 } : {})); };
// 打中的一下：閃光、一圈衝擊、火花、光刺（白）
DS16.pop = (b, T, s = 1, o = {}) => { const P = HD15.P.white, dl = o.delay || 0; HD15.flash(b, T, P, 34 * s, { dur: 12, delay: dl }); HD15.ring(b, T, P, 3, 22 * s, { w: 1.8, dur: 13, delay: dl });
  HD15.sparks(b, T, Math.round(10 * s), P, { spd: 3.2 * s, life: 16, delay: dl }); if (s >= 1) HD15.spikes(b, T, P, Math.round(7 * s), 18 * s, { rot: o.rot || 0, delay: dl }); };
// 主手（白）・副手（黑）交叉的一對刀光（X）
DS16.pair = (b, T, o = {}) => { const g = o.gap ?? 3, dx = o.dx ?? 3, base = Object.assign({ r: 50, th: 10, dur: 18 }, o.cut || {});
  DS16.cut(b, { x: T.x - dx, y: T.y }, 'dr', Object.assign({}, base, { delay: o.delay || 0 })); DS16.cut(b, { x: T.x + dx, y: T.y }, 'dl', Object.assign({}, base, { k: 1, delay: (o.delay || 0) + g })); };
// X 斬痕往兩邊裂開：一白一黑
DS16.xcut = (b, T, L, o = {}) => { const [Wt, Bk] = DS16.BW(); HD15.cut(b, T, Math.PI / 4, L, Wt, Object.assign({ dur: 18, w: 6, gap: 5 }, o)); HD15.cut(b, T, Math.PI * 3 / 4, L, Bk, Object.assign({ dur: 18, w: 6, gap: 5 }, o)); };
// 幻影連斬的前五刀：每刀一個方向、白黑輪流，後面跟兩道殘影（晚一點、偏一點、越來越淡）
DS16.PH = [['dr', -4, 0], ['dl', 4, 0], ['h', 0, -6], ['ur', -3, 4], ['ul', 3, 4]];
DS16.phantom = (b, T, i) => { const [d, dx, dy] = DS16.PH[i % 5], C = { x: T.x + dx, y: T.y + dy }, s = i % 2 ? -1 : 1, k = i % 2; DS16.cut(b, C, d, { k, r: 46, th: 9, dur: 16 });
  DS16.cut(b, { x: C.x + s * 7, y: C.y - 4 }, d, { k, r: 50, th: 6, dur: 18, delay: 2, al: 0.38, spark: 0 }); DS16.cut(b, { x: C.x - s * 7, y: C.y + 4 }, d, { k, r: 42, th: 4, dur: 16, delay: 4, al: 0.22, spark: 0 }); };
// 劍舞亂刃的每一刀：方向照表、位置在對手身上亂跳，白黑輪流
DS16.RAN = ['dr', 'ul', 'h', 'dl', 'ur', 'v', 'dr', 'dl'];
DS16.ran = (b, T, i) => DS16.cut(b, { x: T.x + (Math.random() - 0.5) * 18, y: T.y + (Math.random() - 0.5) * 14 }, DS16.RAN[i % 8], { k: i % 2, r: 42 + Math.random() * 10, th: 9, dur: 14 });
// 一道很長、幾乎是直的刀光（雙龍十字的大十字用）
DS16.long = (b, T, ang, dir, k, o = {}) => HD15.slash(b, T, Object.assign({ pal: DS16.BW()[k], r: 520, th: 9, ang, dir, span: 0.24, dur: 32, sw: 0.12, spark: k ? 0 : 1 }, o));

/* ---------- 雙劍的 6 招＋絕技 2＋奧義 ---------- */
const HDFX16 = {
  // 雙月斬（2 段）：主手一道白色月牙從左上斬到右下 → 第二段副手一道黑色從右上斬到左下，交成 X，停格，X 斬痕（一白一黑）往兩邊裂開
  dsMoon: { *f(U, T, u) { const P = HD15.P.white; yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      DS16.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 52, th: 11, span: 1.7, dur: 20 }); DS16.cut(this, { x: T.x - 6, y: T.y + 3 }, 'dr', { r: 46, th: 5, span: 1.5, dur: 16, delay: 2, al: 0.45, spark: 0 });
      yield* wait(3); HD15.flash(this, T, P, 26, { dur: 10 }); HD15.sparks(this, T, 7, P, { spd: 3, life: 14 }); yield* wait(5); },
    *h(U, T) { Sound.sfx('blade');
      DS16.cut(this, { x: T.x + 3, y: T.y }, 'dl', { k: 1, r: 52, th: 11, span: 1.7, dur: 20 }); DS16.cut(this, { x: T.x + 6, y: T.y + 3 }, 'dl', { k: 1, r: 46, th: 5, span: 1.5, dur: 16, delay: 2, al: 0.45 });
      yield* wait(3); HD15.stop(this, 3); DS16.xcut(this, T, 64, { dur: 16, gap: 4 }); DS16.pop(this, T, 1.1, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(10); } },
  // 架劍（這回合物理傷害 −60%、被打就反擊）：兩把劍先各亮一下，在身前交成 X 停著（一白一黑），刀刃相碰迸出火花，身前一道銀藍的弧光往外推
  dsParry: { keep: 1, *f(U, T, u) { const P = HD15.P.steel, [Wt, Bk] = DS16.BW(), H = DS16.hands(this), X = { x: H.Hc.x, y: H.Hc.y - 30 }; Sound.sfx('shield');
      HD15.flare(this, H.R, Wt, 26, { rot: -0.8, dur: 10 }); HD15.cut(this, H.L, 0.8, 14, Bk, { dur: 10, w: 4, gap: 0.01 }); yield* wait(4); Sound.sfx('tick');
      HD15.mark(this, X, Math.PI / 4, 56, Wt, { hold: 26, w: 2 }); HD15.mark(this, X, -Math.PI / 4, 56, Bk, { hold: 26, w: 2 });
      HD15.flash(this, X, P, 30, { dur: 14 }); HD15.flare(this, X, P, 44, { rot: 0, dur: 16, x8: 1 }); HD15.sparks(this, X, 10, HD15.P.gold, { spd: 2.6, life: 14, g: 0.08 });
      HD15.ring(this, X, P, 8, 34, { fl: 0.4, w: 2, dur: 20, delay: 2 }); HD15.ring(this, { x: H.Hc.x, y: HERO_FOOT - 2 }, P, 6, 30, { fl: 0.3, w: 1.2, dur: 22 }); yield* wait(26); } },
  // 迴旋雙刃（全體 2 段）：第一段主手的白色刀光繞著全體轉一圈（順時針），第二段副手的黑色刀光反方向再轉一圈；每隻身上各閃一下
  dsWhirl: { *f(U, T, u) { const P = HD15.P.white, C = { x: T.x, y: T.y + 6 }; Sound.sfx('wind'); yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      HD15.whirl(this, C, P, { r: 78, th: 11, fl: 0.34, turns: 1.2, trail: 3.6, dur: 28, spark: 1 }); HD15.whirl(this, C, P, { r: 66, th: 4, fl: 0.34, turns: 1.1, trail: 2.6, dur: 26, delay: 3, al: 0.45 });
      yield* wait(9); DS16.foes(this).forEach((v, i) => DS16.pop(this, this.center(v), 0.8, { delay: i * 2 })); yield* wait(10); },
    *h(U, T) { const Bk = HD15.P.black, C = { x: T.x, y: T.y + 2 }; Sound.sfx('blade');
      HD15.whirl(this, C, Bk, { r: 74, th: 11, fl: 0.4, turns: 1.2, trail: 3.6, dur: 28, rev: 1, a0: Math.PI * 0.25 }); HD15.whirl(this, C, Bk, { r: 62, th: 4, fl: 0.4, turns: 1.1, trail: 2.6, dur: 26, delay: 3, al: 0.45, rev: 1, a0: Math.PI * 0.25 });
      yield* wait(9); Sound.sfx('heavy'); HD15.stop(this, 3); DS16.foes(this).forEach((v, i) => DS16.pop(this, this.center(v), 1, { delay: i * 2 })); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 幻影連斬（6 段）：主角左右留下殘影 → 每一刀換一個方向、白黑輪流，後面跟著兩道越來越淡的殘影刀光 → 第六刀白、黑交成 X，停格，八道光芒
  dsPhantom: { *f(U, T, u) { const P = HD15.P.white; Sound.sfx('wind'); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(this, (i % 2 ? -1 : 1) * (6 + i * 5), -i * 2, '#e8eeff', 12 + i * 4, 0.4);
      yield* this.lunge(u, 20, 2); Sound.sfx('blade'); DS16.phantom(this, T, 0); yield* wait(3); HD15.flash(this, T, P, 22, { dur: 9 }); yield* wait(2); },
    *h(U, T, u, i) { const P = HD15.P.white;
      if (i < 5) { Sound.sfx('bladeQ'); DS16.phantom(this, T, i); yield* wait(3); HD15.flash(this, T, P, 20 + i * 3, { dur: 9 }); HD15.sparks(this, T, 4 + i, P, { spd: 2.8, life: 14 }); yield* wait(2); return; }
      Sound.sfx('blade'); DS16.pair(this, T, { cut: { r: 56, th: 11, dur: 20 } });
      for (const s of [-1, 1]) DS16.cut(this, { x: T.x + s * 9, y: T.y - 3 }, s < 0 ? 'dr' : 'dl', { k: s < 0 ? 0 : 1, r: 60, th: 5, dur: 20, delay: 5, al: 0.35, spark: 0 });
      yield* wait(6); Sound.sfx('crit'); HD15.stop(this, 5); DS16.xcut(this, T, 70, { gap: 4 }); DS16.pop(this, T, 1.3, { rot: Math.PI / 4 }); HD15.flare(this, T, P, 90, { rot: 0, dur: 18, x8: 1 }); this.shake = Math.max(this.shake || 0, 7); yield* wait(12); } },
  // 雙星十字（2 段）：第一段「十」（白的一刀直、黑的一刀橫）留在對手身上 → 第二段「×」（白、黑斜的兩刀），停格，四道斬痕一起裂開，八個方向迸出光
  dsStar: { *f(U, T, u) { const [Wt, Bk] = DS16.BW(); yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      DS16.cut(this, T, 'v', { r: 60, th: 10, span: 1.4, dur: 20 }); yield* wait(3); Sound.sfx('bladeQ'); DS16.cut(this, T, 'h', { k: 1, r: 60, th: 10, span: 1.4, dur: 20 }); yield* wait(3);
      HD15.stop(this, 3); HD15.mark(this, T, Math.PI / 2, 64, Wt, { hold: 30, w: 1.5 }); HD15.mark(this, T, 0, 64, Bk, { hold: 30, w: 1.5 });
      HD15.flash(this, T, Wt, 40, { dur: 14 }); HD15.flare(this, T, Wt, 80, { rot: 0, dur: 18 }); HD15.sparks(this, T, 10, Wt, { spd: 3.4, life: 16 }); yield* wait(8); },
    *h(U, T) { const [Wt, Bk] = DS16.BW(); Sound.sfx('blade'); DS16.pair(this, T, { dx: 0, cut: { r: 60, th: 10, dur: 20 } }); yield* wait(6);
      Sound.sfx('crit'); HD15.stop(this, 6); DS16.xcut(this, T, 76, { dur: 22 }); HD15.cut(this, T, Math.PI / 2, 60, Wt, { dur: 20, w: 4, gap: 4 }); HD15.cut(this, T, 0, 60, Bk, { dur: 20, w: 4, gap: 4 });
      HD15.flash(this, T, Wt, 70, { dur: 18 }); HD15.flare(this, T, Wt, 130, { rot: 0, dur: 22, x8: 1 }); HD15.spikes(this, T, Wt, 16, 34); HD15.ring(this, T, Wt, 4, 38, { w: 2.2, dur: 18 });
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; HD15.sparks(this, { x: T.x + Math.cos(a) * 20, y: T.y + Math.sin(a) * 20 }, 2, Wt, { ang: a, spread: 0.4, spd: 3.6, life: 18 }); }
      this.shake = Math.max(this.shake || 0, 8); yield* wait(16); } },
  // 雙劍舞陣（3 回合每次攻擊後副手追加一斬、速度 +1）：舞台稍暗，兩把劍（一白一黑）的刀光繞著主角轉兩圈（差半圈），粉紅花瓣一樣的光粒往上飄，最後兩把劍一起亮（速度提升的箭頭在下一步）
  dsDance: { keep: 1, *f(U, T, u) { const P = HD15.P.pink, [Wt, Bk] = DS16.BW(), H = DS16.hands(this), C = { x: H.Hc.x, y: H.Hc.y + 4 }, G = { x: H.Hc.x, y: HERO_FOOT - 2 }; Sound.sfx('wind');
      HD15.dim(this, 0.25, 62); HD15.ring(this, G, P, 6, 38, { fl: 0.3, w: 1.4, dur: 26 });
      HD15.whirl(this, C, Wt, { r: 36, th: 9, fl: 0.42, turns: 2, trail: 2.2, dur: 40, spark: 1 }); HD15.whirl(this, C, Bk, { r: 36, th: 9, fl: 0.42, turns: 2, trail: 2.2, dur: 40, a0: Math.PI * 1.75 });
      for (let i = 0; i < 18; i++) DS16.later(this, i * 2, () => HD15.mote(this, G.x + (Math.random() - 0.5) * 50, G.y - Math.random() * 10, (Math.random() - 0.5) * 0.6, -0.5 - Math.random() * 0.6, P, { life: 34, s: 1.3 }));
      yield* wait(24); Sound.sfx('blade'); HD15.flare(this, H.R, Wt, 34, { rot: -0.8, dur: 14 }); HD15.cut(this, H.L, 0.8, 16, Bk, { dur: 14, w: 4, gap: 0.01 }); HD15.flash(this, C, P, 40, { dur: 16 }); yield* wait(18); } },

  // 迴燕雙斷（必定會心）：舞台變暗、兩把劍一亮 → 白的一刀往下斬、刀一轉，黑的一刀馬上往上回斬，兩道刀光像燕子的尾巴（V）→ 停格，V 斬痕裂開，光像燕子一樣往右上飛走
  zjSwallow: { *f(U, T, u) { const [Wt, Bk] = DS16.BW(), H = DS16.hands(this), V = { x: T.x, y: T.y + 16 }; Sound.sfx('charge');
      HD15.dim(this, 0.45, 62); HD15.flare(this, H.R, Wt, 36, { rot: -0.7, dur: 12, delay: 2 }); HD15.cut(this, H.L, 0.7, 16, Bk, { dur: 12, w: 4, gap: 0.01, delay: 2 }); yield* wait(12);
      yield* this.lunge(u, 24, 2); Sound.sfx('blade'); HD15.slash(this, { x: T.x - 11, y: T.y - 5 }, { pal: Wt, r: 104, th: 10, ang: 2.66, dir: -1, span: 0.4, dur: 20, sw: 0.18, spark: 1 }); yield* wait(3);
      Sound.sfx('blade'); HD15.slash(this, { x: T.x + 11, y: T.y - 5 }, { pal: Bk, r: 104, th: 10, ang: 0.48, dir: -1, span: 0.4, dur: 20, sw: 0.18 }); yield* wait(4);
      Sound.sfx('crit'); HD15.stop(this, 6); HD15.cut(this, { x: T.x - 11, y: T.y - 5 }, 1.09, 50, Wt, { dur: 22, w: 6, gap: 4 }); HD15.cut(this, { x: T.x + 11, y: T.y - 5 }, -1.09, 50, Bk, { dur: 22, w: 6, gap: 4 });
      HD15.flash(this, V, Wt, 50, { dur: 16 }); HD15.flash(this, T, Wt, 40, { dur: 14 }); HD15.flare(this, V, Wt, 110, { rot: 0, dur: 20, x8: 1 }); HD15.spikes(this, V, Wt, 10, 28);
      HD15.windLines(this, V, { x: T.x + 70, y: T.y - 70 }, Wt, 7, { spread: 18, len: 44, spd: 9, life: 16, delay: 3 }); HD15.sparks(this, V, 16, Wt, { ang: -0.8, spread: 1.2, spd: 4.2, life: 20, g: 0.02 });
      this.shake = Math.max(this.shake || 0, 10); yield* wait(18); } },
  // 劍舞亂刃（v12.96 取代黑曜終劍；8 段，每段會心率 +10%）：兩把劍輪流（白、黑、白、黑……）從各個方向亂斬，每刀的位置和角度都不一樣，越斬越快；
  //   中間在對手身上轉一圈（白、黑兩道刀光一順一逆繞過去）→ 最後一刀白、黑交成 X，停格，斬痕一起裂開
  zjSwordDance: { *f(U, T, u) { Sound.sfx('wind'); yield* this.lunge(u, 18, 2); Sound.sfx('bladeQ'); DS16.ran(this, T, 0); yield* wait(3); },
    *h(U, T, u, i) { const [Wt, Bk] = DS16.BW();
      if (i < 7) { Sound.sfx('bladeQ'); DS16.ran(this, T, i);
        if (i === 4) { const C = { x: T.x, y: T.y + 4 }; HD15.whirl(this, C, Wt, { r: 40, th: 7, fl: 0.4, turns: 1, trail: 3, dur: 18, spark: 1 }); HD15.whirl(this, C, Bk, { r: 40, th: 7, fl: 0.4, turns: 1, trail: 3, dur: 18, rev: 1, a0: Math.PI * 0.25 }); }
        yield* wait(2); HD15.flash(this, T, Wt, 18 + i * 2, { dur: 8 }); HD15.sparks(this, T, 3 + i, Wt, { spd: 2.8, life: 12 }); yield* wait(i < 4 ? 2 : 1); return; }
      Sound.sfx('blade'); DS16.pair(this, T, { cut: { r: 56, th: 11, dur: 20 } }); yield* wait(6);
      Sound.sfx('crit'); HD15.stop(this, 6); DS16.xcut(this, T, 72, { dur: 20 }); DS16.pop(this, T, 1.3, { rot: Math.PI / 4 }); HD15.flare(this, T, Wt, 100, { rot: 0, dur: 18, x8: 1 }); this.shake = Math.max(this.shake || 0, 8); yield* wait(14); } },
  // 雙龍十字（奧義，2 段各 110）——劍的動作，不用光龍（玩家：「雙龍十字像魔法 表現手法不太像劍」）：
  //   舞台變暗，主手的劍一亮、副手的黑劍一閃 → 主角一閃身穿過對手（殘影、疾風線），刀光慢一拍才浮出來：白的一刀直、黑的一刀橫，巨大的「十」→ 停格、裂開
  //   → 第二段：回身從另一邊再穿過去，白、黑兩道斜的長刀光，巨大的「×」→ 停格，大閃光、光芒、火花
  ogTwin: { *f(U, T, u) { const [Wt, Bk] = DS16.BW(), H = DS16.hands(this); Sound.sfx('charge');
      HD15.dim(this, 0.6, 96, { col: '#03050d', inn: 0.12, out: 0.3 }); HD15.gather(this, H.R, 14, Wt, 34, { span: 10, life: 14 });
      HD15.flare(this, H.R, Wt, 44, { rot: -0.8, dur: 16, delay: 6 }); HD15.cut(this, H.L, 0.8, 20, Bk, { dur: 16, w: 5, gap: 0.01, delay: 6 }); yield* wait(16);
      // 一閃身：從主角往對手、再穿到對手背後的疾風線＋殘影
      Sound.sfx('wind'); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 4; i++) K13.ghost(this, 0, -i * 14, '#e8eeff', 6 + i * 3, 0.45);
      HD15.windLines(this, H.Hc, { x: T.x, y: T.y - 80 }, Wt, 14, { spread: 26, len: 70, spd: 16, life: 12 }); yield* this.lunge(u, 30, 2); yield* wait(4);
      Sound.sfx('tick'); yield* wait(6);
      Sound.sfx('bladeBig'); DS16.long(this, T, 0, 1, 0); yield* wait(3);
      Sound.sfx('bladeBig'); DS16.long(this, T, -Math.PI / 2, 1, 1); yield* wait(6);
      Sound.sfx('crit'); HD15.stop(this, 6); this.spawn({ k: 'flash', c: '#ffffff', a: 0.3, life: 8 }); HD15.cut(this, T, Math.PI / 2, 110, Wt, { dur: 26, w: 6, gap: 5 }); HD15.cut(this, T, 0, 110, Bk, { dur: 26, w: 6, gap: 5 });
      HD15.flash(this, T, Wt, 70, { dur: 18 }); HD15.flare(this, T, Wt, 150, { rot: 0, dur: 22 }); HD15.spikes(this, T, Wt, 12, 34); HD15.sparks(this, T, 22, Wt, { spd: 4.6, life: 22, g: 0.06 }); this.shake = Math.max(this.shake || 0, 10); yield* wait(14); },
    *h(U, T, u) { const [Wt, Bk] = DS16.BW(); HD15.dim(this, 0.5, 70, { col: '#03050d', inn: 0.1, out: 0.3 });
      // 回身：從右上往左下再穿過去
      Sound.sfx('wind'); HD15.windLines(this, { x: T.x + 70, y: T.y - 60 }, { x: T.x - 70, y: T.y + 60 }, Wt, 14, { spread: 26, len: 70, spd: 16, life: 12 }); yield* wait(6);
      Sound.sfx('bladeBig'); DS16.long(this, T, -Math.PI / 4, 1, 0); yield* wait(3);
      Sound.sfx('bladeBig'); DS16.long(this, T, -Math.PI * 3 / 4, -1, 1); yield* wait(7);
      Sound.sfx('crit'); HD15.stop(this, 8); this.spawn({ k: 'flash', c: '#ffffff', a: 0.4, life: 10 }); DS16.xcut(this, T, 120, { dur: 28, gap: 6 });
      HD15.flash(this, T, Wt, 100, { dur: 22 }); HD15.flare(this, T, Wt, 210, { rot: 0, dur: 26, x8: 1 }); HD15.spikes(this, T, Wt, 16, 44); HD15.sparks(this, T, 34, Wt, { spd: 5.4, life: 26, g: 0.06 });
      this.shake = Math.max(this.shake || 0, 14); yield* wait(22); } },
};
// 雙劍的兩個特技：交叉斬（兩段、容易會心）、劍風（打全體）
const HDSP16 = [
  // 交叉斬：主手（白）、副手（黑）連兩刀交成 X → 第二段停格，X 斬痕往兩邊裂開
  { *f(U, T, u) { const P = HD15.P.white; yield* this.lunge(u, 16, 2); Sound.sfx('blade'); DS16.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 54, th: 11, dur: 18 }); yield* wait(2);
      Sound.sfx('bladeQ'); DS16.cut(this, { x: T.x + 3, y: T.y }, 'dl', { k: 1, r: 54, th: 11, dur: 18 }); yield* wait(4); HD15.flash(this, T, P, 30, { dur: 10 }); yield* wait(3); },
    *h(U, T) { Sound.sfx('crit'); HD15.stop(this, 4); DS16.xcut(this, T, 70); DS16.pop(this, T, 1.2, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(12); } },
  // 劍風：雙劍一揮，上面一道白、下面一道黑，兩道橫的風刃從左掃到右、穿過全體，每隻身上各閃一下
  { *f(U, T, u) { const P = HD15.P.white, L = DS16.foes(this), xs = L.map(v => this.center(v).x).concat([T.x]), x0 = Math.min(...xs) - 50, x1 = Math.max(...xs) + 50; Sound.sfx('wind'); yield* this.lunge(u, 12, 2); Sound.sfx('blade');
      for (const [dy, dl, k] of [[-8, 0, 0], [8, 3, 1]]) { const y = T.y + dy; HD15.windLines(this, { x: x0, y }, { x: x1, y }, P, 6, { spread: 10, len: 60, spd: 14, life: 12, delay: dl }); DS16.cut(this, { x: T.x, y }, 'h', { k, r: 92, th: 9, span: 1.2, dur: 20, delay: dl }); }
      yield* wait(6); HD15.stop(this, 3); L.forEach((v, i) => DS16.pop(this, this.center(v), 0.9, { delay: i * 2 })); this.shake = Math.max(this.shake || 0, 4); yield* wait(14); } },
];
for (const k in HDFX16) { const id = 't_' + k, D = DEF.skills[id], F = HDFX16[k]; if (!D) { bvErr('v12.95', 'no skill ' + id); continue; } const key = 'hd15_' + k, Wt = !F.keep;
  if (F.h) FX[key + 'h'] = function* (U, T, u, i, t) { if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = Wt; try { yield* F.h.call(this, U, T, u, i, t); } finally { HD15.forceW = false; } };
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; } if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = Wt; try { yield* F.f.call(this, U, T, u, t); } finally { HD15.forceW = false; } };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: typeof REDO13 !== 'undefined' && REDO13.has(id) }; HD15.ids.push(id); }
{ const kd = TREE_KINDS11.indexOf('雙劍'), wrap = F => function* (U, T, u, t) { if (!T) T = { x: U.x, y: U.y - 80 }; if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = true; try { yield* F.call(this, U, T, u, t); } finally { HD15.forceW = false; } };
  HDSP16.forEach((F, j) => { const key = 'sp11_' + kd + '_' + j; if (!FX[key]) { bvErr('v12.95', 'no special fx ' + key); return; } HD15.old[key] = FX[key]; HD15.spKeys.push([key, wrap(F.f)]);
    if (F.h && FX[key + 'h']) { HD15.old[key + 'h'] = FX[key + 'h']; HD15.spKeys.push([key + 'h', wrap(F.h)]); } }); }
// 雙劍的普通攻擊：主手一刀白的左上→右下，副手接著一刀黑的右上→左下
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (U, T, u) { if (!(HD15.on && this._thKind === '雙劍')) return yield* _wa.call(this, U, T, u); this.hd15cast = 1; this.slashOn = 0; const P = HD15.P.white; HD15.forceW = true;
    try { yield* this.lunge(u, 8, 3); Sound.sfx('blade'); DS16.cut(this, { x: T.x - 3, y: T.y }, 'dr', { r: 44, th: 9, span: 1.4, dur: 16 }); yield* wait(4);
      Sound.sfx('bladeQ'); DS16.cut(this, { x: T.x + 3, y: T.y }, 'dl', { k: 1, r: 44, th: 9, span: 1.4, dur: 16 }); yield* wait(3); HD15.flash(this, T, P, 28, { dur: 10 }); HD15.sparks(this, T, 8, P, { spd: 3, life: 14 }); yield* wait(5); } finally { HD15.forceW = false; } };
  const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (!(HD15.on && kind === '雙劍')) return yield* _sg(b, s, C, i, kind); b.hd15cast = 1; yield* b.lunge(s, 6, 2); Sound.sfx('bladeQ'); const P = HD15.P.white; HD15.forceW = true;
    try { DS16.cut(b, C, ['dr', 'dl', 'h'][i % 3], { k: i % 2, r: 40, th: 8, span: 1.4, dur: 14 }); yield* wait(3); HD15.flash(b, C, P, 22, { dur: 9 }); HD15.sparks(b, C, 5, P, { spd: 2.6, life: 12 }); } finally { HD15.forceW = false; } yield* wait(4); }; }
// 副手追加的一斬（雙劍的特性：會心時／雙劍舞陣：每次攻擊後）：傷害跳出來之前，副手補一道黑色的小刀光
{ const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (HD15.on && s && s.hero && t && P && P.kind === 'follow' && DS16.on()) { const C = this.center(t), Pl = HD15.P.white; this.hd15cast = 1; this.slashOn = 0; HD15.forceW = true;
      try { Sound.sfx('bladeQ'); DS16.cut(this, { x: C.x + 4, y: C.y + 2 }, 'dl', { k: 1, r: 46, th: 9, span: 1.4, dur: 16 }); yield* wait(3); HD15.flash(this, C, Pl, 24, { dur: 9 }); HD15.sparks(this, C, 6, Pl, { spd: 2.8, life: 12 }); } finally { HD15.forceW = false; } }
    return yield* _dm.call(this, e, s, t, P); }; }
// 架劍架開攻擊的那一下：兩把劍（一白一黑）在身前交成 X 擋住，銀藍的閃光，刀刃相碰迸出火花（舊的線條和星星不畫）
{ const _sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { if (DS16.mute) return p; return _sp.call(this, p); };
  const _sf = Sound.sfx; Sound.sfx = function (n, ...a) { if (DS16.mute && n === 'slash') n = 'blade'; return _sf.call(this, n, ...a); };
  const H = Battle.prototype.handlers, _re = H.REACTION; H.REACTION = function* (e, s, t, P) {
    if (!(HD15.on && s && s.hero && DS16.on() && typeof ctrInfo12 === 'function' && ctrInfo12(s, P && P.why).kind === 'parry')) return yield* _re.call(this, e, s, t, P);
    const g = _re.call(this, e, s, t, P); let r; DS16.mute = 1; try { r = g.next(); } finally { DS16.mute = 0; }
    const C = this.center(s), A = this.center(t || this.F), d = ctrDir12(C, A), X = { x: C.x + d.x * 16, y: C.y + d.y * 16 }, Pl = HD15.P.steel, [Wt, Bk] = DS16.BW();
    HD15.cut(this, X, Math.PI / 4, 34, Wt, { dur: 16, w: 6, gap: 3 }); HD15.cut(this, X, -Math.PI / 4, 34, Bk, { dur: 16, w: 6, gap: 3 }); HD15.flash(this, X, Pl, 34, { dur: 12 }); HD15.flare(this, X, Pl, 46, { rot: 0, dur: 14, x8: 1 });
    HD15.ring(this, X, Pl, 4, 26, { w: 1.8, dur: 12 }); HD15.sparks(this, X, 14, HD15.P.gold, { spd: 3.2, life: 16, g: 0.1 });
    while (!r.done) { const v = yield r.value; r = g.next(v); } return r.value; }; }
// 反擊：往後一收、踏上去 → 主手白的一刀左下→右上、副手黑的一刀右下→左上（兩道往上回斬交成 X）→ 停格、X 斬痕裂開；然後站一下、走回來（跟舊的同一套動作）
{ const _c = FX.ctr12; FX.ctr12 = function* (U, T, u) { const K = this.ctrNow12 || {}, v = u && u.id ? this.views[u.id] || u : u, o = v && v.off;
    if (!(HD15.on && u && u.hero && DS16.on() && K.kind !== 'block' && o)) return yield* _c.call(this, U, T, u);
    this.slashOn = 0; this.hd15cast = 1; const d = ctrDir12(U, T), x0 = o.x, y0 = o.y, [Wt, Bk] = DS16.BW(), H = DS16.hands(this);
    this.anim(v, 'cast', CTR12.BACK + 2, true); Sound.sfx('charge');
    yield* tween(CTR12.BACK, q => { const e = Math.sin(q * Math.PI / 2); o.x = x0 - d.x * 8 * e; o.y = y0 - d.y * 8 * e; });
    HD15.flare(this, H.R, Wt, 28, { rot: -0.8, dur: 10 }); HD15.cut(this, H.L, 0.8, 14, Bk, { dur: 10, w: 4, gap: 0.01 });
    this.anim(v, 'attack', CTR12.STEP + 26); const far = 26;
    for (let i = 1; i <= CTR12.STEP; i++) { const q = i / CTR12.STEP, e = q * q * (3 - 2 * q); o.x = x0 + d.x * (-8 + (far + 8) * e); o.y = y0 + d.y * (-8 + (far + 8) * e); yield; }
    HD15.forceW = true;
    try { Sound.sfx('blade'); DS16.cut(this, { x: T.x - 3, y: T.y }, 'ur', { r: 50, th: 10, dur: 18 }); yield* wait(4);
      Sound.sfx('blade'); DS16.cut(this, { x: T.x + 3, y: T.y }, 'ul', { k: 1, r: 50, th: 10, dur: 18 }); yield* wait(3);
      HD15.stop(this, 3); HD15.cut(this, T, -Math.PI / 4, 60, Wt, { dur: 16, w: 6 }); HD15.cut(this, T, -Math.PI * 3 / 4, 60, Bk, { dur: 16, w: 6 }); DS16.pop(this, T, 1.1, { rot: Math.PI / 4 }); this.shake = Math.max(this.shake || 0, 6); }
    finally { HD15.forceW = false; }
    yield* wait(6); this.ctrRet12 = { v, x: o.x, y: o.y, x0: 0, y0: 0, at: this.t + CTR12.HOLD, dur: CTR12.RET }; }; }
HD15.use(HD15.on);
