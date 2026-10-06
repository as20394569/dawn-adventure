/* ===================== v12.73 特效檢查（玩家 2026-10-07：「名字有月不一定要有月亮，但招式的動作要符合特效」）：動作對不上的 5 招重畫 =====================
   開放中的 10 棵樹全部錄下來逐招看過，這 5 招的畫面跟說明的動作對不上或看不清楚。 */
// 迴燕雙斷（雙劍）：迴身的一斬，必定會心 → 主角身邊留下一圈轉身的殘影，一道又大又寬的金色弧光從左邊繞過來斬過對手，交會點閃出會心的光
redo13('t_zjSwallow', 't11_zjSwallow', { col: PXC.gold,
  *f(S, U, T, u) { for (const [dx, dy] of [[-12, 0], [0, -6], [12, 0]]) K13.ghost(this, dx, dy, '#ffe8a0', 10, 0.4); Sound.sfx('wind'); yield* wait(5); yield* this.lunge(u, 22, 2);
    Sound.sfx('slash'); cSlash13(this, { x: T.x, y: T.y + 6 }, 40, Math.PI * 0.95, Math.PI * 2.15, S.col, { w: 8, frames: 4, life: 18, fl: 0.55 }); yield* wait(4);
    Sound.sfx('crit'); K13.flash(this, '#fff6c0', 0.35, 5); PX13.spr(this, PXI.glint, T, { sc: 3, life: 12 }); PX13.hit(this, T, S.col, 1); yield* wait(12); } });
// 交叉刺（雙刀）：兩把同時刺 → 兩道尖的刺光從左下和右下同時刺進同一點（V 字），交會處爆一下；第二段落到別隻身上時，從右下補一道刺光
redo13('t_ddCross', 't11_ddCross', { col: PXC.blade,
  *f(S, U, T, u) { for (const dx of [-10, 10]) K13.ghost(this, dx, 0, '#d8e8ff', 8, 0.35); yield* this.lunge(u, 20, 2); Sound.sfx('slash');
    PX13.thr(this, { x: T.x - 44, y: T.y + 34 }, T, S.col, 5, 13, { grow: 2, hold: 4, over: 8 }); PX13.thr(this, { x: T.x + 44, y: T.y + 34 }, T, S.col, 5, 13, { grow: 2, hold: 4, over: 8 }); yield* wait(3);
    PX13.burst(this, T, 12, S.col, 10); PX13.bits(this, T, 6, ['#ffffff', '#c8d4e8'], 2, 0.12, 12, { s: 2 }); yield* wait(8); },
  *h(S, U, T) { Sound.sfx('slash'); PX13.thr(this, { x: T.x + 44, y: T.y + 34 }, T, S.col, 5, 12, { grow: 2, hold: 3, over: 8 }); yield* wait(3); PX13.burst(this, T, 10, S.col, 9); yield* wait(6); } });
// 盾突（雙盾）：衝撞 → 兩面盾牌並排舉在前面往前衝，後面拖著速度線，重重撞上對手：衝擊的爆點、碎片、畫面一震
redo13('t_shRam', 't11_shRam', { col: PXC.blue,
  *f(S, U, T, u) { const H = PX13.hero(this), A = { x: H.x, y: H.y - 12 }, P0 = { x: T.x, y: T.y + 4 };
    const shs = [-9, 9].map(dx => { const p = PX13.spr(this, PXI.shield, { x: A.x + dx, y: A.y }, { sc: 2, life: 22, blink: 0 }); p.upd = q => { const t = q.t - 4, k = t < 0 ? 0 : t < 5 ? (t / 5) * (t / 5) : 1 - clamp((t - 7) / 8, 0, 1) * 0.8; q.x = lerp(A.x + dx, P0.x + dx * 0.7, k); q.y = lerp(A.y, P0.y, k); }; return p; });
    Sound.sfx('wind'); yield* wait(4); PX13.speed(this, A, T, PXC.wind, 7, 9); yield* this.lunge(u, 26, 2); yield* wait(2);
    Sound.sfx('heavy'); this.shake = Math.max(this.shake, 9); PX13.hit(this, T, S.col, 1); PX13.ring(this, T, 6, 34, S.col, 2, 14); PX13.bits(this, T, 8, ['#ffffff', '#c8d4e8', '#7a88a8'], 2.4, 0.14, 14, { s: 3 }); yield* wait(14); } });
// 震地擊（斧）：敲擊地面攻擊全體 → 斧刃的弧光往下劈在主角前面的地上，地面一圈震波擴散，發光的裂痕一路裂到每一隻魔物腳下，魔物腳邊碎石彈起
redo13('t_axQuake', 't11_axQuake', { col: PXC.rock,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t), H = PX13.hero(this), G = { x: H.x + 10, y: HERO_FOOT - 30 }; yield* this.lunge(u, 10, 2); Sound.sfx('wind');
    cSlash13(this, { x: G.x - 20, y: G.y - 26 }, 30, -Math.PI * 0.4, Math.PI * 0.15, ['#e8d0a0', '#ffffff', '#2a1406'], { w: 7, frames: 3, life: 12 }); yield* wait(3);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 12); PX13.burst(this, G, 14, S.col, 12, { s: 3 }); PX13.ring(this, G, 4, 70, S.col, 2, 20, { fl: 0.3 });
    for (const { v, P } of L) this.spawn({ k: 'p13crack', pts: PX13.zig(G, { x: P.x, y: (v && v.foot) || P.y + 24 }, 8, 4), c: '#ffcf6a', c2: '#8a5a20', s: 1, grow: 6, life: 24 });
    yield* wait(6); for (const { v, P } of L) { const F = { x: P.x, y: (v && v.foot) || P.y + 24 }; Sound.sfx('rock'); PX13.hit(this, P, S.col, 0); for (let i = 0; i < 2; i++) PX13.spr(this, PXI.rock, { x: F.x + rnd(-8, 8), y: F.y - 2 }, { vx: rnd(-12, 12) / 10, vy: -rnd(12, 22) / 10, g: 0.16, life: 20 }); yield* wait(2); }
    yield* wait(8); } });
// 三連拳（拳套）：三連拳，每段回 MP → 起手就是第一拳：金色的拳頭打在對手左邊；第二、三拳打在右邊和正中間，每拳一個爆點
redo13('t_fsTriple', 't11_fsTriple', { col: PXC.chi,
  *f(S, U, T, u) { yield* this.lunge(u, 14, 2); Sound.sfx('hit'); PX13.spr(this, PXI.fist, { x: T.x - 8, y: T.y - 2 }, { sc: 3, life: 10 }); PX13.burst(this, { x: T.x - 8, y: T.y - 2 }, 9, S.col, 8, { n: 4 }); this.shake = Math.max(this.shake, 3); yield* wait(5); },
  *h(S, U, T, u, i) { const o = i === 1 ? [8, 2] : [0, -6]; Sound.sfx('hit'); PX13.spr(this, PXI.fist, { x: T.x + o[0], y: T.y + o[1] }, { sc: i === 2 ? 4 : 3, life: 10 }); PX13.burst(this, { x: T.x + o[0], y: T.y + o[1] }, i === 2 ? 12 : 9, S.col, 9, { n: i === 2 ? 8 : 4 }); this.shake = Math.max(this.shake, i === 2 ? 6 : 3); yield* wait(5); } });
