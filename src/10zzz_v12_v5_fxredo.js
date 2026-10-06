/* ===================== v12.32 重做的特效（玩家 2026-10-06 在「技能特效檢查表」勾了不行；短刀・長槍・透勁・裂地神掌・法杖在 v12.33 又改成 10zzz_v12_v8 的像素特效） =====================
   每招照技能文字：文字裡寫的每一個效果都要看得到（見各招的註解）。工具在 10zzz_v12_v4_fxkit.js。 */
const C13 = { // [main, highlight, outline]
  wind: ['#4ee0a0', '#f0fff8', '#0a3324'], gold: ['#ffcc33', '#fffbe0', '#3a2806'], red: ['#ff5034', '#fff0e0', '#3a0806'], star: ['#b07cff', '#fff0ff', '#1e0840'],
  blood: ['#e8263e', '#ffe0e4', '#2a0410'], shade: ['#8a5ad0', '#efe0ff', '#12061e'], moon: ['#f4e27a', '#ffffff', '#1c1a3a'], axe: ['#ff8a2a', '#fff0d0', '#3a1404'],
  brick: ['#c09060', '#f8e0c0', '#2e1a0a'], iron: ['#9aa8c0', '#ffffff', '#141a2a'], chi: ['#ffb020', '#fff6d0', '#3a2000'], crack: ['#ff4a2a', '#ffd0a0', '#2a0600'],
  mana: ['#6a8cff', '#eef2ff', '#0a1440'], arc: ['#c060ff', '#fbeaff', '#24063e'], ward: ['#7ad0ff', '#ffffff', '#082040'], storm: ['#a050ff', '#f0e0ff', '#18042a'],
  time: ['#40e0e0', '#f0ffff', '#06282e'], finale: ['#5aa0ff', '#ffffff', '#081a40'], max: ['#e040ff', '#ffe8ff', '#2a0636'], mp: ['#58a8ff', '#e0f0ff', '#081a3a'],
  fang: ['#ff3a6a', '#ffe4ec', '#30061a'], petal: ['#ff8ac8', '#fff0f8', '#3a0a26'], gale: ['#9ae8ff', '#ffffff', '#0a2a3a'], swal: ['#ffe066', '#ffffff', '#2a2006'],
  obs: ['#3a2a52', '#c890ff', '#06020c'], shield: ['#a8c0e0', '#ffffff', '#101a2c'], holy: ['#ffe070', '#ffffff', '#3a2a06'],
};
const EL13 = { 火: ['#ff5a20', '#ffe8a0', '#3a0a00'], 水: ['#3aa0ff', '#e0f4ff', '#061a40'], 雷: ['#ffe040', '#ffffff', '#3a3000'], 草: ['#4ad060', '#e8ffd0', '#06300a'] };
// shapes (local coordinates, pointing up)
const SH13 = {
  hex: (r, c) => [{ pts: [0, 1, 2, 3, 4, 5].map(i => [Math.cos(i * Math.PI / 3) * r, Math.sin(i * Math.PI / 3) * r]), c }],
  eye: (w, h) => { const top = [], bot = []; for (let i = 0; i <= 10; i++) { const x = -w + 2 * w * i / 10, y = h * (1 - Math.pow(x / w, 2)); top.push([x, -y]); bot.unshift([x, y]); }
    const iris = [], pup = []; for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; iris.push([Math.cos(an) * h * 0.78, Math.sin(an) * h * 0.78]); pup.push([Math.cos(an) * h * 0.32, Math.sin(an) * h * 0.32]); }
    return [{ pts: top.concat(bot), c: '#ffffff' }, { pts: iris, c: '#ffc030' }, { pts: pup, c: '#120c22' }]; },
  needle: c => [{ pts: [[0, -10], [2.2, 4], [0, 8], [-2.2, 4]], c }],
  axe: (c, h) => [{ pts: [[-2, -34], [2, -34], [2, 30], [-2, 30]], c: '#7a4a24' }, { pts: [[2, -30], [16, -36], [24, -22], [24, -6], [16, 6], [2, 0]], c }, { pts: [[18, -32], [24, -22], [24, -6], [19, 3], [21, -14]], c: h }],
  palm: c => [{ pts: [[-9, -3], [9, -3], [10, 10], [0, 15], [-10, 10]], c }, ...[-9, -4.5, 0, 4.5].map(x => ({ pts: [[x, -17 + Math.abs(x + 2) * 0.4], [x + 4, -17 + Math.abs(x + 2) * 0.4], [x + 4, -2], [x, -2]], c })), { pts: [[8, 2], [15, -6], [18, -3], [10, 8]], c }],
  spear: (c, h) => [{ pts: [[-1.6, -18], [1.6, -18], [1.6, 34], [-1.6, 34]], c: h }, { pts: [[0, -36], [6, -22], [2, -18], [0, -20], [-2, -18], [-6, -22]], c }],
  arrow: c => [{ pts: [[0, -12], [5, -3], [1.6, -4], [1.6, 9], [-1.6, 9], [-1.6, -4], [-5, -3]], c }],
  blade: (c, h) => [{ pts: [[-4, -44], [4, -44], [5, 22], [0, 34], [-5, 22]], c }, { pts: [[0, -44], [2, -44], [3, 22], [0, 30]], c: h }, { pts: [[-13, -48], [13, -48], [13, -43], [-13, -43]], c: '#1a0e2a' }, { pts: [[-2.5, -64], [2.5, -64], [2.5, -48], [-2.5, -48]], c: '#5a3a7a' }],
  shield: (c, h) => [{ pts: [[-12, -14], [12, -14], [14, -4], [0, 16], [-14, -4]], c }, { pts: [[-2, -10], [2, -10], [2, 8], [-2, 8]], c: h }, { pts: [[-8, -4], [8, -4], [8, 0], [-8, 0]], c: h }],
  petal: c => [{ pts: [[0, -8], [3.5, -1], [0, 7], [-3.5, -1]], c }],
  wall: (c, w, h) => [{ pts: [[-w, -h], [w, -h], [w, h], [-w, h]], c }],
};
const ang13 = (A, B) => Math.atan2(B.y - A.y, B.x - A.x);
const mainFoe13 = b => { const L = b.foes ? b.foes().filter(v => !v.gone && v.hp > 0) : []; return b.F && L.includes(b.F) ? b.F : L[0]; };

/* ---------------- 劍 ---------------- */
// 疾風二連：兩段快斬，自己速度 +1 → 殘影衝過去、兩道交叉的風刃、最後風捲著主角（加速）
redo13('t_sdTwin', 't11_sdTwin', { col: C13.wind,
  *f(S, U, T, u) { const c = S.col; Sound.sfx('wind'); for (let i = 0; i < 3; i++) K13.ghost(this, -6 - i * 7, 4, '#6af0b8', 9 + i * 3, 0.5 - i * 0.12); K13.streaks(this, U.y - 34, U.y + 16, -1, c, 10, 12);
    yield* this.lunge(u, 24, 2); Sound.sfx('slash'); K13.cut(this, T, -0.8, 70, c, 10, 14, { bend: 7 }); K13.spike(this, T, 18, c, 6, 10); this.shake = Math.max(this.shake, 3); yield* wait(6); },
  *h(S, U, T) { const c = S.col; Sound.sfx('slash'); K13.cut(this, T, 0.8, 70, c, 10, 14, { bend: -7 }); K13.hit(this, T, c, 0); yield* wait(5);
    Sound.sfx('wind'); const H = this.center(this.H); K13.arc(this, { x: H.x, y: H.y + 8 }, 28, Math.PI * 0.8, Math.PI * 2.8, c, 6, 20, { fl: 0.38, grow: 9 }); K13.ghost(this, -12, 0, '#6af0b8', 16, 0.45); K13.ghost(this, 12, 0, '#6af0b8', 16, 0.45); yield* wait(12); } });
// 心眼：下一次攻擊必定會心、這回合迴避 +30% → 頭上睜開一隻眼、視線鎖定對手（準星）、主角分成左右殘影（迴避）
redo13('t_sdEye', 't11_sdEye', { col: C13.gold,
  *f(S, U) { const c = S.col, H = this.center(this.H), E = { x: H.x, y: H.y - 50 }; K13.dark(this, 0.45, 48); Sound.sfx('tick');
    const eye = K13.poly(this, E, SH13.eye(16, 8), { life: 40, sy: 0.05 }); eye.upd = q => { q.sy = Math.min(1, q.t / 6); }; K13.ring(this, E, 6, 30, c, 2, 14); yield* wait(10);
    const F = mainFoe13(this), P = F ? this.center(F) : { x: E.x, y: E.y - 50 }; Sound.sfx('crit'); K13.beam(this, E, P, c, 2, 20, 6); K13.mark(this, P, c, { life: 34, r0: 36, r1: 12 }); yield* wait(12);
    Sound.sfx('wind'); for (const dx of [-16, 16]) { K13.ghost(this, dx, 0, '#a0e8ff', 18, 0.55); K13.ghost(this, dx * 1.6, 0, '#a0e8ff', 14, 0.3); } yield* wait(14); } });
// 破綻突：突刺；對手物防下降時威力 ×1.5；對護盾傷害 ×2 → 準星標出破綻、一道貫穿的突刺、破綻裂開；有護盾時護盾碎成六角片；物防被降時多一圈紅色裂痕
redo13('t_sdGap', 't11_sdGap', { col: C13.red,
  *f(S, U, T, u, t) { const c = S.col, v = K13.views(this, t)[0], weak = K13.defDown(v), warded = K13.ward(v); Sound.sfx('tick'); K13.mark(this, T, c, { r0: 34, r1: 10, grow: 7, life: 22 }); yield* wait(9);
    yield* this.lunge(u, 28, 2); Sound.sfx('crit'); const a = ang13(U, T); K13.cut(this, { x: T.x - Math.cos(a) * 8, y: T.y - Math.sin(a) * 8 }, a, 96, c, 8, 12, { grow: 2 }); K13.spike(this, T, 24, c, 4, 12, { rot: a, inner: 0.22 });
    for (let i = 0; i < (weak ? 8 : 5); i++) { const an = a + Math.PI + rnd(-14, 14) / 10; K13.cut(this, { x: T.x + Math.cos(an) * 12, y: T.y + Math.sin(an) * 12 }, an, 16 + rnd(0, 12), c, 3, 16); }
    if (warded) { Sound.sfx('rock'); K13.ring(this, T, 10, 44, C13.ward, 4, 14); for (let i = 0; i < 12; i++) { const an = Math.random() * 6.3, sp = rnd(15, 35) / 10; this.spawn({ k: 'k13poly', x: T.x + Math.cos(an) * 14, y: T.y + Math.sin(an) * 14, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 0.6, g: 0.1, vr: 0.2, shapes: SH13.hex(4, C13.ward[0]), life: 22, fade: 1 }); } }
    if (weak) { K13.flash(this, '#ff4020', 0.25, 6); K13.spike(this, T, 36, c, 10, 14); }
    K13.hit(this, T, c, weak || warded ? 1 : 0); yield* wait(10); } });
// 星紋魔劍：物攻・魔攻較高的計算；再 2 段武器屬性的魔法；回 MP → 劍上聚星、斬擊、對手上方的星紋、2 顆屬性色的魔彈落下、藍光流回主角
redo13('t_zjRune', 't11_zjRune', { col: C13.star,
  *f(S, U, T, u) { const c = S.col, el = EL13[((gearBy(Game.st.equip.weapon) || {}).el) || ''] || C13.arc, H = this.center(this.H), tip = { x: H.x + 18, y: H.y - 20 };
    Sound.sfx('charge'); for (let i = 0; i < 6; i++) K13.spike(this, { x: tip.x + rnd(-12, 12), y: tip.y + rnd(-18, 8) }, 7, c, 4, 16, { inner: 0.3 }); K13.ring(this, tip, 26, 4, c, 2, 12); yield* wait(10);
    yield* this.lunge(u, 18, 3); Sound.sfx('slash'); K13.cut(this, T, -0.9, 74, c, 10, 16, { bend: 8 }); K13.hit(this, T, c, 0); yield* wait(4);
    const Sg = { x: T.x, y: T.y - 34 }; this.spawn({ k: 'glow', x: Sg.x, y: Sg.y, r: 26, c: c[2], life: 36 }); this.spawn({ k: 'rune', x: Sg.x, y: Sg.y, r: 18, c: c[0], c2: c[1], n: 10, poly: 5, sq: 1, life: 36 }); K13.ring(this, Sg, 4, 22, c, 3, 12); yield* wait(6);
    for (let k = 0; k < 2; k++) { const P = { x: T.x + (k ? 9 : -9), y: T.y + 2 }; Sound.sfx('charge'); yield* K13.orb(this, Sg, P, el, 6, 5, 0, { trail: 6 }); Sound.sfx('hitSuper'); K13.hit(this, P, el, 0); yield* wait(5); }
    Sound.sfx('heal'); K13.motes(this, T, H, C13.mp, 14, 18); yield* wait(14); } });

/* ---------------- 短刀 ---------------- */

/* ---------------- 斧 ---------------- */
// 迴旋斧：迴旋一圈攻擊全體 → 主角轉一圈（殘影）、一道大圓弧掃過整排魔物、經過哪隻就砍到哪隻
redo13('t_axSpin', 't11_axSpin', { col: C13.axe,
  *f(S, U, T, u, t) { const c = S.col, L = K13.views(this, t).map(v => this.center(v)).sort((a, b) => a.x - b.x), G = T; Sound.sfx('wind');
    for (let i = 0; i < 4; i++) K13.ghost(this, Math.cos(i * 1.57) * 10, Math.sin(i * 1.57) * 4, '#ffb060', 8 + i * 3, 0.4); yield* this.lunge(u, 16, 3);
    Sound.sfx('heavy'); K13.arc(this, { x: G.x, y: G.y + 6 }, 74, Math.PI * 0.95, Math.PI * 2.95, c, 12, 22, { fl: 0.36, grow: 12 });
    for (const P of L) { yield* wait(3); Sound.sfx('slash'); K13.cut(this, P, -0.2 + rnd(-3, 3) / 10, 40, c, 8, 12); K13.hit(this, P, c, 0); K13.debris(this, { x: P.x, y: P.y + 20 }, 4, ['#a07040', '#e0c090'], 1.6); }
    yield* wait(10); } });
// 崩城擊：蓄力 1 回合；對破防中的對手威力 ×1.5 → 主角躍起、一把巨斧從天而降劈下、城牆磚塊炸飛、地面裂開；對手破防中時再加一圈金色衝擊
redo13('t_axCastle', 't11_axCastle', { col: C13.axe,
  *f(S, U, T, u, t) { const c = S.col, v = K13.views(this, t)[0], brk = K13.broken(v); K13.dark(this, 0.35, 40, '#140600'); Sound.sfx('charge');
    const ax = K13.poly(this, { x: T.x + 10, y: -40 }, SH13.axe(c[0], c[1]), { life: 30, sc: 1.4, rot: -0.5 }); ax.upd = q => { const k = clamp((q.t - 6) / 6, 0, 1); q.y = lerp(-40, T.y - 6, k * k); q.rot = lerp(-0.5, 0.25, k); };
    yield* this.lunge(u, 14, 3); yield* wait(6); Sound.sfx('quake'); this.shake = Math.max(this.shake, 14); K13.flash(this, '#ffd0a0', 0.35, 6);
    this.spawn({ k: 'shock', x: T.x, y: T.y + 26, r0: 8, r1: 80, c: c[0], life: 18 }); for (let i = 0; i < 4; i++) zig9(this, T.x, T.y + 24, T.x + (i - 1.5) * 34, T.y + 40, c[2], 3, 4, 20);
    for (let i = 0; i < 10; i++) this.spawn({ k: 'k13poly', x: T.x + rnd(-14, 14), y: T.y + rnd(0, 14), vx: rnd(-28, 28) / 10, vy: -rnd(18, 34) / 10, g: 0.18, vr: rnd(-3, 3) / 10, shapes: SH13.wall(i % 2 ? C13.brick[0] : '#8a6040', 4, 2.5), life: 26 });
    K13.hit(this, T, c, 1); if (brk) { yield* wait(3); Sound.sfx('hitSuper'); K13.ring(this, T, 6, 52, C13.gold, 5, 16); K13.spike(this, T, 40, C13.gold, 12, 16); K13.flash(this, '#ffe070', 0.35, 8); }
    yield* wait(12); } });
// 鐵律重斧：攻擊力用「物攻＋物防」計算，50% 讓對手物防 −1 → 主角身上的鐵甲片浮起來、匯到斧頭上（防禦化成力量）、一記直劈、對手身上的護甲片碎落
redo13('t_zjIronLaw', 't11_zjIronLaw', { col: C13.iron,
  *f(S, U, T, u) { const c = S.col, H = this.center(this.H), tip = { x: H.x + 16, y: H.y - 26 }; Sound.sfx('shield');
    for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 + (i - 2.5) * 0.55, P0 = { x: H.x + Math.cos(an) * 24, y: H.y + 8 + Math.sin(an) * 14 }, p = K13.poly(this, P0, SH13.hex(7, c[0]), { life: 20 }); p.upd = q => { const k = clamp((q.t - 6) / 8, 0, 1); q.x = lerp(P0.x, tip.x, k * k); q.y = lerp(P0.y, tip.y, k * k); }; }
    yield* wait(14); K13.spike(this, tip, 16, c, 6, 10); Sound.sfx('charge'); yield* this.lunge(u, 18, 3);
    Sound.sfx('heavy'); K13.cut(this, { x: T.x, y: T.y - 4 }, Math.PI / 2, 84, c, 12, 14, { grow: 2 }); this.shake = Math.max(this.shake, 10);
    for (let i = 0; i < 9; i++) this.spawn({ k: 'k13poly', x: T.x + rnd(-12, 12), y: T.y + rnd(-10, 10), vx: rnd(-24, 24) / 10, vy: -rnd(10, 26) / 10, g: 0.16, vr: rnd(-3, 3) / 10, shapes: SH13.wall(i % 2 ? '#c8d0e0' : '#6a7488', 4, 3), life: 26 });
    K13.hit(this, T, c, 1); yield* wait(12); } });

/* ---------------- 拳套 ---------------- */
// 旋踢：三段迴旋踢，攻擊全體 → 三道橫掃整排魔物的腳風（左→右、右→左、往上撩），每一段打到每一隻
const kick13 = function* (b, T, t, c, i) { const L = K13.views(b, t).map(v => b.center(v)).sort((a, q) => a.x - q.x), dir = i % 2 ? -1 : 1;
  Sound.sfx('heavy'); const y = T.y + [10, 0, -6][i % 3]; K13.arc(b, { x: T.x, y }, 70, dir > 0 ? Math.PI * 1.02 : -0.02 * Math.PI, dir > 0 ? Math.PI * 1.98 : -0.98 * Math.PI, c, 10, 14, { fl: 0.3, grow: 7 });
  for (const P of dir > 0 ? L : L.slice().reverse()) { yield* wait(2); K13.hit(b, P, c, i === 2 ? 1 : 0); } yield* wait(4); };
redo13('t_fsKick', 't11_fsKick', { col: C13.chi,
  *f(S, U, T, u, t) { yield* this.lunge(u, 16, 2); yield* kick13(this, T, t, S.col, 0); },
  *h(S, U, T, u, i) { const v = this.tgtV, t = { group: this.foes().filter(q => !q.gone && q.hp > 0) }; yield* kick13(this, this.center(this.groupOf(t.group.map(q => q.id)) || v), t, S.col, i); } });
// 碎殼掌：裂甲 3 回合（物防 −1、每回合受傷）→ 金色掌印打上去、紅色裂痕在對手身上爬開、甲殼碎片剝落，裂痕留著發紅光
redo13('t_fsShell', 't11_fsShell', { col: C13.chi,
  *f(S, U, T, u) { const c = S.col; yield* this.lunge(u, 22, 3); Sound.sfx('heavy'); const p = K13.poly(this, T, SH13.palm(c[0]), { life: 16, s0: 0.4, s1: 1.5, grow: 4 }); K13.ring(this, T, 6, 36, c, 4, 12); this.shake = Math.max(this.shake, 7); yield* wait(5);
    Sound.sfx('rock'); for (let i = 0; i < 7; i++) { const an = i * 0.9 + rnd(-2, 2) / 10; K13.cut(this, { x: T.x + Math.cos(an) * 12, y: T.y + Math.sin(an) * 12 }, an, 22 + rnd(0, 10), C13.crack, 4, 34); }
    for (let i = 0; i < 8; i++) this.spawn({ k: 'k13poly', x: T.x + rnd(-14, 14), y: T.y + rnd(-14, 10), vx: rnd(-16, 16) / 10, vy: -rnd(4, 16) / 10, g: 0.18, vr: rnd(-3, 3) / 10, shapes: [{ pts: [[-4, -3], [4, -2], [2, 4], [-3, 3]], c: i % 2 ? '#d8a070' : '#a07048' }], life: 28 });
    K13.hit(this, T, C13.crack, 0); yield* wait(14); } });
// 氣勁彈：遠距的氣功彈 → 雙手聚氣成球（越聚越大）、帶著螺旋軌跡飛過去、炸開成氣的波紋
redo13('t_fsQi', 't11_fsQi', { col: C13.chi,
  *f(S, U, T) { const c = S.col, H = this.center(this.H), A = { x: H.x + 4, y: H.y - 26 }; Sound.sfx('charge');
    const ball = this.spawn({ k: 'k13orb', x: A.x, y: A.y, r: 2, c: c[0], h: c[1], o: c[2], trail: 1, pulse: 1, life: 14 }); ball.upd = q => { q.r = 2 + q.t * 0.5; }; K13.motes(this, { x: A.x, y: A.y + 10 }, A, c, 12, 12); yield* wait(13);
    Sound.sfx('wind'); const p = this.spawn({ k: 'k13orb', x: A.x, y: A.y, r: 8, c: c[0], h: c[1], o: c[2], trail: 8, pulse: 1, life: 12 }); p.upd = q => { const k = clamp(q.t / 10, 0, 1); q.x = lerp(A.x, T.x, k) + Math.sin(q.t * 1.2) * 5; q.y = lerp(A.y, T.y, k); };
    for (let i = 0; i < 5; i++) { yield* wait(2); this.spawn({ k: 'k13ring', x: p.x, y: p.y, r0: 3, r1: 10, w: 2, c: c[0], h: c[1], o: c[2], life: 8 }); }
    Sound.sfx('hitSuper'); for (let k = 0; k < 3; k++) K13.ring(this, T, 4 + k * 4, 30 + k * 12, c, 4 - k, 12 + k * 3); K13.hit(this, T, c, 1); yield* wait(12); } });

/* ---------------- 法杖 ---------------- */
const tip13 = b => { const H = b.center(b.H); return { x: H.x + 18, y: H.y - 28 }; };
// 魔力奔流（原本的四象奔流）：v12.76 改成魔力光束，特效在 v8 的法杖段
// 特技・星輝：下一次攻擊必定會心 → 星光從四周聚進杖尖、閃出一顆大四芒星，再化成準星飄到對手身上
redoSp13('法杖', 2, { col: C13.gold,
  *f(S) { const c = S.col, A = tip13(this); Sound.sfx('tick'); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, P0 = { x: A.x + Math.cos(an) * 34, y: A.y + Math.sin(an) * 26 }, p = this.spawn({ k: 'k13spike', x: P0.x, y: P0.y, r0: 3, r1: 6, n: 4, c: c[0], h: c[1], o: c[2], rot: 0.78, inner: 0.3, life: 12 }); p.upd = q => { const k = clamp(q.t / 10, 0, 1); q.x = lerp(P0.x, A.x, k); q.y = lerp(P0.y, A.y, k); }; }
    yield* wait(11); Sound.sfx('crit'); K13.spike(this, A, 26, c, 4, 20, { rot: 0, inner: 0.16 }); K13.ring(this, A, 4, 26, c, 3, 12); yield* wait(6);
    const F = mainFoe13(this); if (F) K13.mark(this, this.center(F), c, { life: 26 }); yield* wait(14); } });

/* ---------------- 雙刀 ---------------- */
// 雙牙絕命：兩把同時刺進；對 HP 30% 以下的對手威力 ×2 → 左右兩把刀同時刺進同一點（V 字）；對手 HP 30% 以下時畫面染紅、牙形的大刀痕、強烈閃光
const fang13 = function* (b, T, low, c, second) { Sound.sfx('slash'); const d = second ? 0.18 : 0; K13.cut(b, { x: T.x - 12, y: T.y - 8 }, Math.PI * (0.32 + d), 50, c, 8, 12, { grow: 2 }); K13.cut(b, { x: T.x + 12, y: T.y - 8 }, Math.PI * (0.68 - d), 50, c, 8, 12, { grow: 2 });
  yield* wait(2); K13.spike(b, { x: T.x, y: T.y + 8 }, low ? 32 : 20, c, low ? 10 : 6, 12); if (low) { Sound.sfx('crit'); K13.flash(b, '#ff1040', 0.35, 8); } K13.hit(b, T, c, low ? 1 : 0); };
redo13('t_ddFang', 't11_ddFang', { col: C13.fang,
  *f(S, U, T, u, t) { const v = K13.views(this, t)[0], low = K13.low(v, 0.3); if (low) K13.dark(this, 0.45, 40, '#280010'); for (const dx of [-10, 10]) K13.ghost(this, dx, 0, '#ff6090', 10, 0.4); yield* this.lunge(u, 26, 2); yield* fang13(this, T, low, S.col, 0); yield* wait(6); },
  *h(S, U, T) { yield* fang13(this, T, K13.low(this.tgtV, 0.3), S.col, 1); yield* wait(8); } });
// 旋花飛刃：飛刃像花瓣一樣旋轉，打全體 2 段 → 粉色的花瓣刃從主角身邊螺旋飛出、繞著整排魔物轉（第 1 段），再收攏到每一隻身上炸開成花瓣（第 2 段）
redo13('t_zjBloom', 't11_zjBloom', { col: C13.petal,
  *f(S, U, T, u, t) { const c = S.col, G = T, H = this.center(this.H); Sound.sfx('wind'); this.bloom13 = [];
    for (let i = 0; i < 14; i++) { const p = K13.poly(this, H, SH13.petal(i % 2 ? c[0] : '#ffc0e0'), { life: 60, vr: 0.4, sc: 1.3 }); const ph = i * Math.PI * 2 / 14; p.upd = q => { const k = clamp(q.t / 14, 0, 1), an = ph + q.t * 0.22, R = lerp(10, 74, k), cx = lerp(H.x, G.x, k), cy = lerp(H.y, G.y, k); if (!q.hold) { q.x = cx + Math.cos(an) * R; q.y = cy + Math.sin(an) * R * 0.38; } }; this.bloom13.push(p); }
    yield* wait(12); for (const P of K13.views(this, t).map(v => this.center(v))) { Sound.sfx('slash'); K13.hit(this, P, c, 0); yield* wait(2); } yield* wait(4); },
  *h(S, U, T) { const c = S.col, L = this.foes().filter(q => !q.gone && q.hp > 0).map(v => this.center(v)), ps = this.bloom13 || []; Sound.sfx('wind');
    ps.forEach((p, i) => { const P = L[i % Math.max(1, L.length)] || T, P0 = { x: p.x, y: p.y }, t0 = p.t; p.hold = 1; p.upd = q => { const k = clamp((q.t - t0) / 6, 0, 1); q.x = lerp(P0.x, P.x, k); q.y = lerp(P0.y, P.y, k); }; p.life = t0 + 8; });
    yield* wait(6); for (const P of L) { Sound.sfx('slash'); K13.hit(this, P, c, 1); for (let j = 0; j < 8; j++) this.spawn({ k: 'k13poly', x: P.x, y: P.y, vx: Math.cos(j * 0.8) * 2, vy: Math.sin(j * 0.8) * 2 - 0.5, g: 0.06, vr: 0.3, shapes: SH13.petal(j % 2 ? c[0] : '#ffc0e0'), life: 18, fade: 1 }); yield* wait(2); }
    this.bloom13 = null; yield* wait(8); } });
// 特技・刃嵐：追擊全體 → 一道刀刃組成的龍捲風從左掃到右，經過每一隻都捲進一陣刀光
redoSp13('雙刀', 1, { col: C13.gale,
  *f(S, U, T, u, t) { const c = S.col, L = K13.views(this, t).map(v => this.center(v)).sort((a, b) => a.x - b.x); Sound.sfx('wind');
    const tw = { x: -10 }; for (let k = 0; k < 6; k++) { const ring = this.spawn({ k: 'k13ring', x: -10, y: T.y + 22 - k * 12, r0: 10 + k * 3, r1: 12 + k * 3, w: 3, c: c[0], h: c[1], o: c[2], fl: 0.3, life: 30 }); ring.upd = q => { q.x = tw.x + Math.sin(q.t * 0.5 + k) * 3; }; }
    for (let f = 0; f < 26; f++) { tw.x = lerp(-10, W + 10, f / 25); for (const P of L) if (Math.abs(P.x - tw.x) < 7) { Sound.sfx('slash'); for (let j = 0; j < 3; j++) K13.cut(this, { x: P.x + rnd(-8, 8), y: P.y + rnd(-10, 10) }, Math.random() * 6.3, 30, c, 5, 10); K13.hit(this, P, c, 0); }
      if (f % 2) this.spawn({ k: 'k13cut', x: tw.x + rnd(-14, 14), y: T.y + rnd(-26, 20), ang: Math.random() * 6.3, len: 14, w: 3, c: c[1], h: '#ffffff', o: c[2], grow: 1, life: 6 }); yield; }
    yield* wait(8); } });

/* ---------------- 雙劍 ---------------- */
// 迴燕雙斷：迴身的一斬，必定會心 → 主角迴身（殘影繞一圈）、兩道像燕子翅膀的弧刃合成一斬、會心的金色四芒星
redo13('t_zjSwallow', 't11_zjSwallow', { col: C13.swal,
  *f(S, U, T, u) { const c = S.col; Sound.sfx('wind'); for (let i = 0; i < 5; i++) K13.ghost(this, Math.cos(i * 1.26) * 12, Math.sin(i * 1.26) * 5, '#fff0a0', 6 + i * 3, 0.45); yield* wait(6); yield* this.lunge(u, 24, 2);
    Sound.sfx('slash'); K13.arc(this, { x: T.x - 18, y: T.y + 14 }, 36, Math.PI * 1.5, Math.PI * 2.0, c, 13, 16, { grow: 3 }); K13.arc(this, { x: T.x + 18, y: T.y + 14 }, 36, Math.PI * 1.5, Math.PI * 1.0, c, 13, 16, { grow: 3 }); yield* wait(3);
    Sound.sfx('crit'); K13.cut(this, T, 0, 70, c, 6, 12, { grow: 2 }); K13.spike(this, T, 34, c, 4, 16, { rot: 0.785, inner: 0.16 }); K13.hit(this, T, c, 1); yield* wait(12); } });
// 黑曜終劍：物攻・魔攻較高的一邊計算的終結一劍 → 畫面轉黑、對手上方凝出一把黑曜石巨劍（紫色刃光）、直直斬下、紫色裂痕和大閃光
redo13('t_zjObsidian', 't11_zjObsidian', { col: C13.obs,
  *f(S, U, T, u) { const c = S.col; K13.dark(this, 0.65, 56, '#05020a'); Sound.sfx('charge');
    const sw = K13.poly(this, { x: T.x, y: T.y - 60 }, SH13.blade(c[0], c[1]), { life: 40, s0: 0.2, s1: 1.1, grow: 10, o: '#c890ff' }); for (let i = 0; i < 10; i++) this.spawn({ k: 'mote', x: T.x + rnd(-40, 40), y: T.y - 60 + rnd(-30, 30), vy: 0, to: { x: T.x, y: T.y - 60 }, s: 2, c: c[1], life: 14 });
    yield* wait(14); Sound.sfx('slash'); sw.upd = q => { const k = clamp((q.t - 14) / 4, 0, 1); q.y = lerp(T.y - 60, T.y + 14, k * k); }; yield* this.lunge(u, 14, 2); yield* wait(2);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 14); K13.flash(this, '#d0a0ff', 0.5, 8); K13.cut(this, { x: T.x, y: T.y }, Math.PI / 2, 96, [c[1], '#ffffff', OL13], 6, 16, { grow: 2 });
    for (let i = 0; i < 6; i++) K13.cut(this, { x: T.x + Math.cos(i * 1.05) * 14, y: T.y + Math.sin(i * 1.05) * 14 }, i * 1.05, 22, [c[1], '#ffffff', OL13], 3, 18); K13.hit(this, T, [c[1], '#ffffff', OL13], 1); yield* wait(14); } });

/* ---------------- 雙盾 ---------------- */
// 雙盾崩擊：蓄力後兩面盾一起砸下；對破防中的對手威力 ×1.5 → 兩面大盾從左右飛到對手頭上、一起砸下、地面震波；對手破防中時再加一圈金色衝擊
redo13('t_shCrash', 't11_shCrash', { col: C13.shield,
  *f(S, U, T, u, t) { const c = S.col, v = K13.views(this, t)[0], brk = K13.broken(v); Sound.sfx('shield');
    const mk = (dx) => { const A = { x: U.x + dx * 0.4, y: U.y - 20 }, B = { x: T.x + dx, y: T.y - 42 }, p = K13.poly(this, A, SH13.shield(c[0], c[1]), { life: 30, sc: 1.4 }); p.upd = q => { const k1 = clamp(q.t / 8, 0, 1), k2 = clamp((q.t - 12) / 4, 0, 1); q.x = lerp(A.x, B.x, k1) - dx * 0.6 * k2; q.y = lerp(A.y, B.y, k1) + 40 * k2 * k2; q.rot = (dx > 0 ? 0.3 : -0.3) * (1 - k2); }; };
    mk(-18); mk(18); yield* wait(15); Sound.sfx('quake'); this.shake = Math.max(this.shake, 14); this.spawn({ k: 'shock', x: T.x, y: T.y + 26, r0: 8, r1: 76, c: c[0], life: 18 });
    K13.ring(this, T, 6, 40, c, 4, 14); K13.hit(this, T, c, 1); if (brk) { yield* wait(3); Sound.sfx('hitSuper'); K13.ring(this, T, 8, 54, C13.gold, 5, 16); K13.spike(this, T, 40, C13.gold, 12, 16); K13.flash(this, '#ffe070', 0.35, 8); }
    yield* wait(12); } });
// 聖壁衝鋒：消耗全部守勢（每點威力 +15），之後張開護盾 → 守勢化成光球匯進一面光牆、主角推著光牆衝過去撞上、回來後金色護罩罩住主角
redo13('t_zjHolyWall', 't11_zjHolyWall', { col: C13.holy,
  *f(S, U, T, u) { const c = S.col, H = this.center(this.H), n = clamp(Math.round((this.H && this.H.res && this.H.res.stance) || (this.core.byId.H.res.stance0 || 3)), 2, 6), wallP = { x: H.x, y: H.y - 26 }; Sound.sfx('charge');
    for (let i = 0; i < n; i++) { const an = -Math.PI / 2 + (i - (n - 1) / 2) * 0.5, P0 = { x: H.x + Math.cos(an) * 26, y: H.y + Math.sin(an) * 18 }, p = this.spawn({ k: 'k13orb', x: P0.x, y: P0.y, r: 6, c: c[0], h: c[1], o: c[2], trail: 4, life: 16 + i * 2 }); p.upd = q => { const k = clamp((q.t - 4 - i * 2) / 6, 0, 1); q.x = lerp(P0.x, wallP.x, k); q.y = lerp(P0.y, wallP.y, k); }; Sound.sfx('tick'); yield* wait(2); }
    yield* wait(8); const wl = K13.poly(this, wallP, SH13.wall('rgba(255,224,112,0.88)', 28, 9).concat([{ pts: [[-2, -7], [2, -7], [2, 7], [-2, 7]], c: '#ffffff' }, { pts: [[-6, -2], [6, -2], [6, 2], [-6, 2]], c: '#ffffff' }]), { life: 26, s0: 0.3, s1: 1, grow: 5, o: c[2] }); yield* wait(5);
    Sound.sfx('wind'); wl.upd = q => { const k = clamp((q.t - 5) / 7, 0, 1); q.x = lerp(wallP.x, T.x, k); q.y = lerp(wallP.y, T.y + 12, k); }; K13.streaks(this, U.y - 60, U.y + 10, 1, c, 10, 10); yield* this.lunge(u, 30, 3);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 12); K13.flash(this, '#fff0b0', 0.4, 6); K13.hit(this, T, c, 1); K13.ring(this, T, 8, 20 + n * 8, c, 5, 16); yield* wait(10);
    Sound.sfx('shield'); for (let k = 0; k < 2; k++) K13.arc(this, { x: H.x, y: H.y + 16 }, 36 + k * 9, Math.PI, Math.PI * 2, k ? ['#fff4c0', '#ffffff', c[2]] : c, 7 - k * 2, 30, { grow: 8 }); this.spawn({ k: 'glow', x: H.x, y: H.y - 6, r: 40, c: c[0], life: 30 }); yield* wait(18); } });
// 特技・盾鳴：追擊，30% 退縮 → 兩面盾在主角身前互撞（火花）、粗粗的聲波一圈圈往前推到對手身上、對手頭上冒星（被震到）
redoSp13('雙盾', 0, { col: C13.shield,
  *f(S, U, T, u, t) { const c = S.col, H = this.center(this.H), P = { x: H.x + 4, y: H.y - 30 }; Sound.sfx('shield');
    for (const dx of [-1, 1]) { const p = K13.poly(this, { x: P.x + dx * 22, y: P.y }, SH13.shield(c[0], c[1]), { life: 16, sc: 1.1 }); p.upd = q => { const k = clamp(q.t / 5, 0, 1); q.x = P.x + dx * lerp(22, 6, k * k); }; }
    yield* wait(5); Sound.sfx('heavy'); K13.spike(this, P, 18, C13.gold, 8, 10); this.sparks(P.x, P.y, 12, ['#ffffff', '#ffe070'], 3, 14);
    const a = ang13(P, T); for (let k = 0; k < 4; k++) { const sw = this.spawn({ k: 'k13arc', x: P.x, y: P.y, r: 10, a0: a - 0.75, a1: a + 0.75, w: 8, c: '#ffe58a', h: '#ffffff', o: c[2], grow: 2, life: 16 }); sw.upd = q => { q.r = 10 + q.t * 5; }; Sound.sfx('buzz'); yield* wait(3); }
    yield* wait(4); for (let i = 0; i < 3; i++) this.star(T.x + rnd(-14, 14), T.y - 28 + rnd(-4, 4), '#fff0a0', 20); K13.hit(this, T, c, 0); yield* wait(10); } });
