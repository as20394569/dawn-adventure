/* ===================== v12.33 像素特效重做（玩家 2026-10-06：「短刀的攻擊技能都不行」「長槍完全不行」、透勁・裂地神掌第二次還是不行、法杖改元素、單手盾新樹） =====================
   問題是「不像那種武器」「形狀粗糙，跟像素畫風不搭」→ 全部用 10zzz_v12_v7 的像素工具重畫（每一格對齊像素，不用平滑的向量線）：
   · 短刀（v12.34 玩家：「短刀全部重製 以快速斬擊為主」，改名＋改特效）：不畫刀，每招都是快速的月牙刀光；毒・麻痺用刀光顏色和一點點小圖案。
   · 長槍（v12.33b 玩家：「長槍希望不要有實體」）：不畫槍，突刺是一道又長又尖的光；穿甲＝光從背後透出去、噴出護甲碎片。
   · 拳套（v12.34 改名改特效）：震山擊（原透勁）＝整個人肩撞上去、震波從背後穿出去；沖天拳（原裂地神掌）＝上勾拳把對手打上半空、金光往上衝。
   · 法杖：每招有固定元素——火球・冰錐・落雷・炎浪・藤鞭・雷暴，元素屏障・元素增幅用四色元素寶石。
   · 單手盾：像素盾牌撞過去、立在面前、格擋反擊的金光。
   每招的註解寫它照技能文字畫了什麼。 */
const OSH13 = '#120c22';
// ---------- 短刀 ----------
// v12.33b（玩家：「短刀盡量斬跟刺為主」，刀身不畫、其他圖案留一點點）：每一招都是刀光（月牙）和刺痕（一道尖的光），異常只用刀光的顏色和一點點小圖案
const BLADE13 = PXC.blade, SHADE13 = ['#a070e0', '#efe0ff', '#12061e'];
const spark13 = (b, P, col, r = 8) => { PX13.burst(b, P, r, col, 9, { n: 'x' }); };
const drip13 = (b, P, n = 3, w = 12) => { for (let i = 0; i < n; i++) b.spawn({ k: 'p13px', x: P.x + rnd(-w, w), y: P.y + rnd(-4, 4), vx: 0, vy: 0.3, g: 0.12, s: 2, cols: ['#b8ff80', '#5ad048', '#2a8a2a'], o: '#0a2a0a', life: 18 + rnd(0, 6), delay: rnd(0, 4) }); };
const bubbles13 = (b, P, n = 2) => { for (let i = 0; i < n; i++) PX13.spr(b, PXI.bubble, { x: P.x + rnd(-12, 12), y: P.y + rnd(-6, 6) }, { vy: -0.45, life: 20 + rnd(0, 6), delay: i * 3 }); };
const zaps13 = (b, P, n = 2, sc = 1) => { for (let i = 0; i < n; i++) PX13.spr(b, PXI.zap, { x: P.x + rnd(-14, 14), y: P.y + rnd(-12, 8) }, { sc, life: 16, delay: i * 2 }); };
const tgt13 = (b, t) => K13.views(b, t)[0] || b.tgtV;
const b13dot = (b, P, c) => b.spawn({ k: 'p13px', x: P.x, y: P.y, s: 2, cols: ['#ffffff', c], o: OSH13, life: 16 });
// the hero vanishes (a puff of shadow) and comes back after `n` frames
const vanish13 = (b, n = 24) => { const v = b.H, H = PX13.hero(b); PX13.bits(b, H, 12, ['#3a1a4a', '#6a3a8a', '#1a0a24'], 1.4, -0.03, 16, { s: 3 }); if (!v || !v.off) return; const y0 = v.off.y; v.off.y = 400; b.spawn({ k: 'p13nil', life: n + 1, upd: q => { if (q.t >= n) v.off.y = y0; } }); };
// a slash: a crescent of light (no blade) around C from a0 to a1, a glint where it ends
const cSlash13 = (b, C, r, a0, a1, col, o = {}) => { const fl = o.fl || 1, F = o.frames || 3; PX13.arc(b, C, r, a0, a1, col, o.w || 5, o.life || 14, { grow: F, fl, delay: o.delay || 0 });
  PX13.spr(b, PXI.glintS, { x: C.x + Math.cos(a1) * r, y: C.y + Math.sin(a1) * r * fl }, { life: 8, delay: (o.delay || 0) + F }); };
// a diagonal cut across the body through P (side 1: upper left → lower right, −1: mirrored)
const xSlash13 = (b, P, side, col, o = {}) => { const r = o.r || 22, C = { x: P.x - side * r * 0.64, y: P.y + r * 0.55 }; return cSlash13(b, C, r, side > 0 ? -1.75 : -Math.PI + 1.75, side > 0 ? 0.17 : -Math.PI - 0.17, col, o); };
// a slash through P along direction ang (a shallow crescent whose middle is P)
const aSlash13 = (b, P, ang, col, o = {}) => { const r = o.r || 26, nx = -Math.sin(ang), ny = Math.cos(ang), C = { x: P.x - nx * r, y: P.y - ny * r }, th = Math.atan2(ny, nx), sp = o.span || 1.5; return cSlash13(b, C, r, th - sp / 2, th + sp / 2, col, o); };
// v12.34（玩家：「短刀全部重製 以快速斬擊為主」，改名＋改特效，數字不變）：每一招都是又快又短的月牙刀光（2 格就劃完），用顏色・刀數・位置分出每一招
// a quick slash through P along direction ang
const qSlash13 = (b, P, ang, col, o = {}) => aSlash13(b, P, ang, col, Object.assign({ r: 26, span: 1.5, w: 6, frames: 2, life: 12 }, o));
const wisps13 = (b, P, col, n = 3) => { for (let i = 0; i < n; i++) { const y = P.y - 10 + i * 9 + rnd(-2, 2), x0 = P.x - 22 + rnd(-4, 4); PX13.line(b, { x: x0, y }, { x: x0 + 14 + rnd(0, 8), y: y - 3 }, [col[1]], 1, 9, { thin: 1, grow: 2, delay: i }); } };
// 毒風斬：兩段快斬，每段 30% 中毒 → 綠色的風刃一刀斜劈、一刀反手，刀光旁帶著風痕，甩出兩三滴毒液
redo13('t_dgVenom', 't11_dgVenom', { col: PXC.venom,
  *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('slash'); xSlash13(this, T, 1, S.col, { r: 28, w: 6, frames: 2, life: 13 }); wisps13(this, T, S.col); yield* wait(2); drip13(this, T, 2); spark13(this, T, S.col); yield* wait(9); },
  *h(S, U, T) { Sound.sfx('slash'); xSlash13(this, T, -1, S.col, { r: 28, w: 6, frames: 2, life: 13 }); wisps13(this, T, S.col); yield* wait(2); drip13(this, T, 2); bubbles13(this, T, 1); spark13(this, T, S.col, 10); yield* wait(11); } });
// 迅風斬：搶先的一記快斬，自己速度 +1 → 殘影和速度線衝過去，一道又寬又平的白色快斬橫過對手；斬完腳邊捲起一圈風、兩個往上的小箭頭（速度提升）
redo13('t_dgQuick', 't11_dgQuick', { col: BLADE13,
  *f(S, U, T, u) { Sound.sfx('wind'); for (let i = 1; i <= 3; i++) K13.ghost(this, 0, i * 5, '#bfe8ff', 6 + i * 2, 0.45 - i * 0.1); PX13.speed(this, U, T, PXC.wind, 6, 8);
    yield* this.lunge(u, 26, 2); Sound.sfx('slash'); qSlash13(this, T, 0.1, S.col, { r: 52, span: 1.55, w: 7, life: 14 }); yield* wait(2); spark13(this, T, S.col, 10); yield* wait(8);
    const H = PX13.hero(this); Sound.sfx('statUp'); PX13.arc(this, { x: H.x, y: H.y + 14 }, 18, Math.PI * 0.2, Math.PI * 2.1, PXC.wind, 2, 16, { fl: 0.35, grow: 10 }); for (const dx of [-16, 16]) PX13.spr(this, PXI.upCh('#4ee0a0'), { x: H.x + dx, y: H.y + 6 }, { vy: -0.6, life: 18 }); yield* wait(12); } });
// 殘影步：2 回合迴避 +30%，下一次攻擊威力 +30% → 主角左右閃出兩道殘影、腳下一圈風，最後手上一閃（下一擊會更重）
redo13('t_dgShade', 't11_dgShade', { col: PXC.wind,
  *f(S) { const H = PX13.hero(this); Sound.sfx('wind'); for (const [dx, l] of [[-14, 14], [14, 14], [-26, 18], [26, 18]]) K13.ghost(this, dx, 0, '#9ae8ff', l, 0.45); PX13.arc(this, { x: H.x, y: H.y + 14 }, 22, Math.PI * 0.1, Math.PI * 2.2, S.col, 2, 18, { fl: 0.35, grow: 10 });
    for (const s of [-1, 1]) PX13.line(this, { x: H.x + s * 10, y: H.y - 6 }, { x: H.x + s * 30, y: H.y - 6 }, [S.col[1]], 1, 10, { thin: 1, grow: 3 }); yield* wait(12); Sound.sfx('tick'); PX13.spr(this, PXI.glint, PX13.hand(this), { life: 14 }); yield* wait(12); } });
// 蝕毒連斬：四段快斬；對中毒的對手每段 ×1.4 → 四道短的快斬左右交錯劃在不同位置；對手中毒時刀光變綠、每一斬濺出綠色碎點，身上冒一兩個毒泡
const rot13 = (b, T, i, ps) => { const off = [[-8, -6], [8, -2], [-4, 6], [4, 0]][i % 4], P = { x: T.x + off[0], y: T.y + off[1] }; Sound.sfx('slash'); qSlash13(b, P, [0.5, 2.6, -0.4, 2.2][i % 4], ps ? PXC.venom : BLADE13, { r: 20, w: 5, life: 11 });
  spark13(b, P, ps ? PXC.venom : BLADE13, ps ? 10 : 7); if (ps) { PX13.bits(b, P, 4, ['#b8ff80', '#5ad048', '#2a8a2a'], 1.8, 0.1, 12, { s: 2 }); Sound.sfx('poison'); } };
redo13('t_dgRot', 't11_dgRot', { col: PXC.venom,
  *f(S, U, T, u, t) { const v = tgt13(this, t), ps = !!(v && v.st && v.st.psn); if (ps) { bubbles13(this, T, 2); K13.tint(v, '#40c040', 0.35, 34); } yield* this.lunge(u, 22, 2); rot13(this, T, 0, ps); yield* wait(4); },
  *h(S, U, T, u, i) { const v = this.tgtV, ps = !!(v && v.st && v.st.psn); rot13(this, T, i, ps); if (i === 3) { yield* wait(2); PX13.hit(this, T, ps ? PXC.venom : BLADE13, 0); } yield* wait(i === 3 ? 12 : 4); } });
// 斷命斬：對 HP 一半以下 ×1.5，容易會心 → 主角化成影子消失、在對手面前現身，一道又大又粗的紅色刀光斬過要害；對手 HP 一半以下時畫面暗下、反手再補一刀成交叉、頭上一個小骷髏
redo13('t_dgReap', 't11_dgReap', { col: PXC.blood,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), low = K13.low(v, 0.5), H = PX13.hero(this);
    Sound.sfx('wind'); vanish13(this, 28); if (low) K13.dark(this, 0.45, 42, '#1a0006'); yield* wait(6); K13.ghost(this, T.x - H.x, T.y - H.y + 30, '#401020', 16, 0.6); yield* wait(3);
    Sound.sfx('crit'); xSlash13(this, T, 1, c, { r: 34, w: 8, frames: 2, life: 16 }); yield* wait(2); PX13.burst(this, T, low ? 18 : 13, c, 13, { s: 3 }); PX13.bits(this, T, 8, ['#ff6070', '#e8263e', '#7a0a1a'], 2.4, 0.14, 16, { s: 2 }); this.shake = Math.max(this.shake, low ? 8 : 5);
    if (low) { yield* wait(3); Sound.sfx('crit'); xSlash13(this, T, -1, c, { r: 34, w: 8, frames: 2, life: 16 }); PX13.spr(this, PXI.skull, { x: T.x, y: T.y - 34 }, { vy: -0.2, life: 30 }); K13.flash(this, '#ff1030', 0.3, 6); }
    yield* wait(14); } });
// 雷痺斬：搶先的帶電快斬，60% 麻痺 → 一閃衝過去，一道黃色的快斬，刀光上爆出幾個小電花
redo13('t_dgNeedle', 't11_dgNeedle', { col: PXC.volt,
  *f(S, U, T, u) { PX13.speed(this, U, T, PXC.volt, 4, 7); yield* this.lunge(u, 22, 2); Sound.sfx('slash'); xSlash13(this, T, -1, S.col, { r: 26, w: 6, frames: 2, life: 13 }); yield* wait(2);
    Sound.sfx('buzz'); for (const [dx, dy] of [[-12, -10], [0, 0], [12, 10]]) PX13.spr(this, PXI.zap, { x: T.x + dx, y: T.y + dy }, { life: 14 }); spark13(this, T, S.col, 10); yield* wait(14); } });
// 千刃亂舞：五段亂斬，最後引爆對手身上的中毒・麻痺・灼傷 → 五道快斬從五個角度連劃；最後一刀時，對手身上的每一種異常各炸開一團那個顏色的光
const BLOOM13 = ['#e8a0f0', '#ffffff', '#2a0626'], BLOOMST13 = { psn: PXC.venom, par: PXC.volt, brn: PXC.fire };
const petal13 = (b, T, i, c) => { Sound.sfx('slash'); qSlash13(b, T, i * Math.PI / 5 + 0.3, c, { r: 30, span: 1.5, life: 16 }); };
redo13('t_dgBloom', 't11_dgBloom', { col: BLOOM13,
  *f(S, U, T, u) { yield* this.lunge(u, 22, 2); petal13(this, T, 0, S.col); yield* wait(3); },
  *h(S, U, T, u, i) { petal13(this, T, i, S.col); if (i < 4) { yield* wait(3); return; }
    yield* wait(5); const v = this.tgtV, L = Object.keys(BLOOMST13).filter(k => v && v.st && v.st[k]);
    if (!L.length) { PX13.hit(this, T, S.col, 0); yield* wait(10); return; }
    for (const k of L) { const c = BLOOMST13[k]; Sound.sfx(k === 'par' ? 'buzz' : k === 'brn' ? 'fire' : 'poison'); PX13.burst(this, T, 20, c, 14, { s: 3 }); PX13.bits(this, T, 8, [c[1], c[0], c[0]], 2.4, 0.08, 14, { s: 2 }); this.shake = Math.max(this.shake, 6); yield* wait(9); }
    yield* wait(6); } });
// 縛影斬：搶先斬向對手的影子，讓牠這回合不能行動 → 對手腳下的影子擴開，一道紫色的快斬貼著地面橫劃過影子，影子上留下兩個縫線般的叉，對手變暗、不能動
redo13('t_dgStitch', 't11_dgStitch', { col: SHADE13,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), foot = v && v.foot ? v.foot : T.y + 24; Sound.sfx('wind');
    this.spawn({ k: 'p13shadow', x: T.x, y: foot - 1, r0: 8, rx: 30, fl: 0.28, grow: 8, c: '#2a1844', o: '#0a0418', life: 44 }); yield* this.lunge(u, 18, 2);
    Sound.sfx('slash'); cSlash13(this, { x: T.x, y: foot - 8 }, 34, Math.PI * 0.95, Math.PI * 0.05, c, { fl: 0.32, w: 6, frames: 3, life: 18 }); yield* wait(4); Sound.sfx('statDown');
    for (let i = 0; i < 2; i++) { const x0 = T.x - 8 + i * 16; PX13.line(this, { x: x0 - 3, y: foot - 3 }, { x: x0 + 3, y: foot + 2 }, ['#d0b0ff'], 1, 30, { thin: 1, grow: 2, keep: 1 }); PX13.line(this, { x: x0 + 3, y: foot - 3 }, { x: x0 - 3, y: foot + 2 }, ['#d0b0ff'], 1, 30, { thin: 1, grow: 2, keep: 1, delay: 2 }); }
    K13.tint(v, '#2a1844', 0.6, 36); yield* wait(20); } });
// 月影雙斬：2 段快斬；對 HP 一半以下的對手每段必定會心 → 夜色暗下、角落一彎小新月，兩道月牙色的刀光一左一右斬過身體；HP 一半以下時每一段都閃出金色的會心星光
const fang13px = (b, T, side, low) => { Sound.sfx('slash'); xSlash13(b, T, side, PXC.moon, { r: 28, w: 7, frames: 2, life: 16 });
  if (low) { Sound.sfx('crit'); PX13.spr(b, PXI.glint, { x: T.x - side * 6, y: T.y - 8 }, { sc: 2, life: 14, delay: 2 }); PX13.burst(b, T, 16, PXC.gold, 12, { s: 3, delay: 2 }); } else PX13.burst(b, T, 10, PXC.moon, 10, { delay: 2 }); b.shake = Math.max(b.shake, low ? 6 : 3); };
redo13('t_zjMoonFang', 't11_zjMoonFang', { col: PXC.moon,
  *f(S, U, T, u, t) { const v = tgt13(this, t), low = K13.low(v, 0.5); K13.dark(this, 0.5, 44, '#04061a'); Sound.sfx('charge'); PX13.spr(this, PXI.moon, { x: T.x + 30, y: T.y - 38 }, { life: 44 }); yield* wait(7);
    yield* this.lunge(u, 22, 2); fang13px(this, T, 1, low); yield* wait(8); },
  *h(S, U, T) { fang13px(this, T, -1, K13.low(this.tgtV, 0.5)); yield* wait(14); } });
// 特技・蛇牙斬：追擊，60% 中毒 → 上下兩道綠色的快斬像蛇的上下顎一樣合起來，滴下兩三滴毒液
redoSp13('短刀', 0, { col: PXC.venom,
  *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('slash');
    cSlash13(this, { x: T.x, y: T.y - 16 }, 18, Math.PI * 0.1, Math.PI * 0.9, S.col, { w: 5, frames: 2, life: 12 }); cSlash13(this, { x: T.x, y: T.y + 16 }, 18, -Math.PI * 0.9, -Math.PI * 0.1, S.col, { w: 5, frames: 2, life: 12 });
    yield* wait(3); Sound.sfx('poison'); drip13(this, T, 3, 5); spark13(this, T, S.col, 10); yield* wait(12); } });
// 特技・瞬影斬：追擊，必定會心 → 主角化成影子消失、在對手面前現身，一道紫色快斬；金色的會心星光
redoSp13('短刀', 1, { col: SHADE13,
  *f(S, U, T, u) { const H = PX13.hero(this); Sound.sfx('wind'); vanish13(this, 22); yield* wait(4); K13.ghost(this, T.x - H.x, T.y - H.y + 30, '#2a1844', 14, 0.6); yield* wait(3); Sound.sfx('crit');
    xSlash13(this, T, -1, S.col, { r: 30, w: 7, frames: 2, life: 15 }); yield* wait(2); PX13.spr(this, PXI.glint, T, { sc: 2, life: 14 }); PX13.burst(this, T, 16, PXC.gold, 12, { s: 3 }); this.shake = Math.max(this.shake, 6); yield* wait(14); } });
// 特技・疾風步：速度 +1 階，回 10% MP → 主角身邊捲起兩道風、殘影往後拉，兩個往上的綠色小箭頭（速度提升），藍色光點流回主角（回 MP）
redoSp13('短刀', 2, { col: PXC.wind,
  *f(S) { const H = PX13.hero(this), C = { x: H.x, y: H.y - 6 }; Sound.sfx('wind'); for (const s of [0, Math.PI]) PX13.arc(this, C, 22, s, s + Math.PI * 1.2, S.col, 3, 16, { fl: 0.55, grow: 8 });
    K13.ghost(this, 0, 10, '#9ae8ff', 12, 0.45); K13.ghost(this, 0, 20, '#9ae8ff', 14, 0.3); yield* wait(8); Sound.sfx('statUp'); for (const dx of [-16, 16]) PX13.spr(this, PXI.upCh('#4ee0a0'), { x: H.x + dx, y: H.y + 6 }, { vy: -0.6, life: 18 });
    for (let i = 0; i < 8; i++) { const P0 = { x: H.x + rnd(-26, 26), y: H.y - 30 + rnd(-10, 10) }, p = this.spawn({ k: 'p13px', x: P0.x, y: P0.y, s: 2, cols: ['#e0f0ff', '#58a8ff'], o: OSH13, life: 14, delay: i }); p.upd = q => { const k = clamp((q.t - i) / 10, 0, 1); q.x = lerp(P0.x, H.x, k); q.y = lerp(P0.y, H.y, k); }; }
    yield* wait(18); } });

// ---------- 長槍 ----------
// v12.33b（玩家：「長槍希望不要有實體」）：不畫槍，全部是突刺的光——一道又長又尖的光刺出去、速度線、刺穿時光從背後透出
const SPEAR13 = ['#d8ecff', '#ffffff', '#0a1a3a'];
// a spear thrust of light from the hero's hand into P (over: how far past P), speed lines along it
const thrust13 = (b, P, o = {}) => { const A = o.from || PX13.hand(b), d = PX13.dir(A, P); PX13.thr(b, A, P, o.c || SPEAR13, o.w || 6, o.life || 13, { grow: o.grow || 3, hold: o.hold ?? 4, over: o.over ?? 4, cut: o.cut ?? 0.3, delay: o.delay || 0 });
  if (o.lines !== 0) PX13.speed(b, A, P, o.lines || PXC.wind, o.n || 4, 8); Sound.sfx(o.snd || 'slash'); return d; };
const shards13 = (b, P, d, n = 6) => PX13.bits(b, P, n, ['#ffffff', '#b0bccc', '#7a8498'], 2, 0.14, 14, { s: 2, ang: d.ang, spread: 0.8 });
// 普通攻擊：長槍一刺（一道突刺的光）、短刀兩下快斬（月牙刀光）；顏色照武器屬性
{ const _wa = FX.wAtk; FX.wAtk = function* (U, T, u) { const k = this._thKind || '', c = WTH12[this._thT] || WTH12.steel, col = [c[0], c[1], OSH13];
    if (k === '長槍') { yield* this.lunge(u, 10, 2); thrust13(this, T, { c: col }); yield* wait(4); PX13.burst(this, T, 9, col, 9); yield* wait(6); return; }
    if (k === '短刀') { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); xSlash13(this, T, 1, col, { r: 22, w: 5, frames: 2, life: 11 }); yield* wait(2); spark13(this, T, col, 8); yield* wait(6); return; }
    return yield* _wa.call(this, U, T, u); }; }
{ const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (kind !== '短刀') return yield* _sg(b, s, C, i, kind); const c = WTH12[b._thT] || WTH12.steel, col = [c[0], c[1], OSH13]; yield* b.lunge(s, 6, 2); Sound.sfx('slash');
    const P = { x: C.x + [6, -6, 0][i % 3], y: C.y + [-4, 4, 0][i % 3] }; xSlash13(b, P, i % 2 ? 1 : -1, col, { r: 22, w: 5, frames: 2, life: 11 }); yield* wait(2); spark13(b, P, col, 7); yield* wait(4); }; }
// 穿甲刺：無視 30% 物防 → 一道長長的突刺光刺穿對手、從背後透出去，刺中的地方噴出灰色的護甲碎片
redo13('t_spPierce', 't11_spPierce', { col: SPEAR13,
  *f(S, U, T, u) { yield* this.lunge(u, 14, 2); const d = thrust13(this, T, { over: 26, hold: 6, life: 16 }); yield* wait(3);
    Sound.sfx('hitSuper'); shards13(this, T, d, 8); PX13.hit(this, T, S.col, 0); PX13.burst(this, { x: T.x + d.ux * 24, y: T.y + d.uy * 24 }, 9, S.col, 10, { delay: 2, n: 4 }); yield* wait(12); } });
// 疾突：搶先突刺，對手速度 −1 → 殘影和速度線、一道極快的突刺光；對手頭上兩個往下的小藍箭頭（速度下降）
redo13('t_spDash', 't11_spDash', { col: SPEAR13,
  *f(S, U, T, u) { Sound.sfx('wind'); for (let i = 1; i <= 3; i++) K13.ghost(this, 0, i * 6, '#9ae8ff', 6 + i * 2, 0.45 - i * 0.1); yield* this.lunge(u, 26, 2); thrust13(this, T, { grow: 1, n: 8 }); yield* wait(3);
    PX13.hit(this, T, S.col, 0); Sound.sfx('statDown'); for (const dx of [-14, 14]) PX13.spr(this, PXI.dnCh('#3a8aff'), { x: T.x + dx, y: T.y - 30 }, { vy: 0.5, life: 22 }); yield* wait(14); } });
// 掃槍：橫掃全體，30% 退縮 → 一道又寬又扁的弧光從左到右掃過整排魔物，經過的每一隻都揚起塵土
redo13('t_spSweep', 't11_spSweep', { col: SPEAR13,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t).sort((a, q) => a.P.x - q.P.x), C = { x: T.x, y: T.y + 14 }, R = Math.max(70, (L.length ? Math.max(...L.map(q => Math.abs(q.P.x - T.x))) : 0) + 22);
    yield* this.lunge(u, 12, 2); Sound.sfx('wind'); PX13.arc(this, C, R, Math.PI * 1.02, Math.PI * 1.98, S.col, 6, 16, { fl: 0.32, grow: 8 }); PX13.arc(this, { x: C.x, y: C.y + 4 }, R - 6, Math.PI * 1.06, Math.PI * 1.94, PXC.wind, 2, 14, { fl: 0.32, grow: 8, delay: 2 });
    let k = 0; for (let f = 0; f < 9; f++) { const X = C.x + Math.cos(Math.PI * (1.02 + 0.96 * f / 8)) * R; while (k < L.length && L[k].P.x <= X + 4) { const P = L[k].P; Sound.sfx('hit'); PX13.hit(this, P, S.col, 0); PX13.bits(this, { x: P.x, y: P.y + 20 }, 6, ['#d0b080', '#a08050', '#6a5030'], 1.6, 0.16, 16, { up: 1 }); k++; } yield; }
    yield* wait(10); } });
// 三段突：三段突刺，每段無視 30% 物防 → 上・中・下三道突刺光，每一道都穿過去、噴出護甲碎片
const tri13 = function* (b, T, i) { const off = [[-6, -10], [6, -1], [0, 8]][i % 3], P = { x: T.x + off[0], y: T.y + off[1] }; const d = thrust13(b, P, { grow: 2, hold: 3, over: 14, life: 11, w: 5 }); yield* wait(3);
  shards13(b, P, d, 5); PX13.burst(b, P, i === 2 ? 14 : 10, SPEAR13, 10, { s: i === 2 ? 3 : 2 }); };
redo13('t_spTriple', 't11_spTriple', { col: SPEAR13,
  *f(S, U, T, u) { yield* this.lunge(u, 16, 2); yield* tri13(this, T, 0); yield* wait(4); },
  *h(S, U, T, u, i) { yield* tri13(this, T, i); yield* wait(i === 2 ? 12 : 5); } });
// 破陣槍：削 1 格護盾；對蓄力中的對手威力 ×1.5 → 對手前面浮著一道藍色的光牆（陣），一道粗的突刺光把光牆刺碎；對手正在蓄力時，牠身上聚的光被一起刺散（橘色的爆光）
redo13('t_spBreak', 't11_spBreak', { col: SPEAR13,
  *f(S, U, T, u, t) { const v = tgt13(this, t), chg = !!(v && v.st && v.st.charging), A = PX13.hand(this), d = PX13.dir(A, T), W0 = { x: T.x - d.ux * 8, y: T.y - d.uy * 8 };
    const wall = [-1, 0, 1].map(s => PX13.line(this, { x: W0.x + d.nx * (s * 15 - 6), y: W0.y + d.ny * (s * 15 - 6) }, { x: W0.x + d.nx * (s * 15 + 6), y: W0.y + d.ny * (s * 15 + 6) }, PXC.blue, 3, 60, { grow: 3, keep: 1 }));
    if (chg) for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; PX13.spr(this, PXI.glintS, { x: T.x + Math.cos(an) * 20, y: T.y + Math.sin(an) * 16 }, { life: 12 }); }
    yield* this.lunge(u, 18, 3); thrust13(this, T, { over: 10, hold: 6, w: 8, life: 15 }); yield* wait(3); Sound.sfx('hitSuper'); for (const p of wall) p.life = p.t + 1;
    for (const s of [-1, 0, 1]) PX13.bits(this, { x: W0.x + d.nx * s * 15, y: W0.y + d.ny * s * 15 }, 5, ['#ffffff', '#c8e0ff', '#3a6ad0'], 2, 0.12, 14, { s: 2 }); PX13.hit(this, T, S.col, 1);
    if (chg) { yield* wait(2); Sound.sfx('crit'); PX13.burst(this, T, 22, PXC.fire2, 14, { s: 3 }); K13.flash(this, '#ffb060', 0.3, 6); }
    yield* wait(12); } });
// 迴槍架勢：2 回合物防 +2，被攻擊時反擊（威力 50）→ 主角身邊捲起兩圈旋轉的弧光（迴槍），腳下一圈藍光（物防提升），最後手上一閃（準備反擊）
redo13('t_spGuard', 't11_spGuard', { col: SPEAR13,
  *f(S, U) { const H = PX13.hero(this), C = { x: H.x, y: H.y - 10 }; Sound.sfx('wind');
    for (let k = 0; k < 2; k++) for (const s of [0, Math.PI]) PX13.arc(this, C, 24, s - Math.PI / 2, s + Math.PI * 0.6, S.col, 4, 14, { fl: 0.6, grow: 6, delay: k * 8 }); yield* wait(16);
    Sound.sfx('shield'); PX13.ring(this, { x: H.x, y: HERO_FOOT - 3 }, 6, 30, PXC.blue, 2, 16, { fl: 0.32 }); yield* wait(4); PX13.spr(this, PXI.glint, PX13.hand(this), { life: 14 }); yield* wait(10); } });
// 千重突：六段突刺 → 每一段都是好幾道突刺光一起刺出，速度線密密麻麻
const many13 = function* (b, T, i, n = 2) { for (let k = 0; k < n; k++) { const P = { x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 8) }, A = PX13.hand(b); thrust13(b, P, { from: { x: A.x + rnd(-8, 8), y: A.y + rnd(-2, 4) }, grow: 2, hold: 2, life: 9, w: 4, lines: k ? 0 : PXC.wind, n: 2 }); }
  yield* wait(3); PX13.burst(b, T, i === 5 ? 16 : 9, SPEAR13, 10, { s: i === 5 ? 3 : 2 }); if (i === 5) PX13.hit(b, T, SPEAR13, 1); };
redo13('t_spThousand', 't11_spThousand', { col: SPEAR13,
  *f(S, U, T, u) { PX13.speed(this, U, T, PXC.wind, 10, 14); yield* this.lunge(u, 18, 2); yield* many13(this, T, 0, 3); yield* wait(2); },
  *h(S, U, T, u, i) { yield* many13(this, T, i, 2); yield* wait(i === 5 ? 12 : 2); } });
// 螺旋貫：無視 50% 物防；對破防中的對手再 +30% → 一道粗的突刺光捲著兩股螺旋氣流鑽過去、從對手背後貫穿出去（螺旋碎屑甩出）；對手破防中時再一團金色爆光
Object.assign(HERO_PK, { p13helix(x, p, a) { const d = p.d, Hd = { x: p.hx(), y: p.hy() }, L = Math.hypot(Hd.x - p.x1, Hd.y - p.y1); if (L < 4) return; if (a < 0.25 && p.t % 2) return; const n = Math.max(6, Math.round(L / 2));
    for (const pass of [0, 1]) for (const ph of [0, Math.PI]) { let q0 = null; for (let i = 0; i <= n; i++) { const u = i / n, th = u * L / 7 - p.t * 0.8 + ph, w = Math.sin(th) * 7 * Math.min(1, u * 3), X = p.x1 + (Hd.x - p.x1) * u + d.nx * w, Y = p.y1 + (Hd.y - p.y1) * u + d.ny * w, front = Math.cos(th) > 0;
      if (q0) { if (pass === 0) PXF.line(x, q0[0], q0[1], X, Y, OSH13, 4); else PXF.line(x, q0[0], q0[1], X, Y, front ? p.c[1] : p.c[0], 2); } q0 = [X, Y]; } } } });
redo13('t_spSpiral', 't11_spSpiral', { col: PXC.azure,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), brk = K13.broken(v), A = PX13.hand(this), d = PX13.dir(A, T), E = { x: T.x + d.ux * 30, y: T.y + d.uy * 30 }; yield* this.lunge(u, 18, 3); Sound.sfx('wind');
    const th = PX13.thr(this, A, E, SPEAR13, 7, 20, { grow: 7, hold: 8, over: 0 }); this.spawn({ k: 'p13helix', x1: A.x, y1: A.y, d, c, hx: () => lerp(A.x, E.x, clamp(th.t / 7, 0, 1)), hy: () => lerp(A.y, E.y, clamp(th.t / 7, 0, 1)), life: 18 }); PX13.speed(this, A, T, PXC.wind, 6, 10);
    yield* wait(5); Sound.sfx('hitSuper'); PX13.hit(this, T, c, 1); for (let i = 0; i < 10; i++) { const an = d.ang + Math.PI / 2 * (i % 2 ? 1 : -1) + rnd(-4, 4) / 10, vv = 1.6 + Math.random(); this.spawn({ k: 'p13px', x: T.x, y: T.y, vx: Math.cos(an) * vv + d.ux * 1.2, vy: Math.sin(an) * vv + d.uy * 1.2, g: 0.08, s: 2, cols: [c[1], c[0], '#7a88a8'], o: OSH13, life: 16 }); }
    PX13.burst(this, { x: T.x + d.ux * 22, y: T.y + d.uy * 22 }, 10, c, 10); if (brk) { yield* wait(3); Sound.sfx('crit'); PX13.burst(this, T, 22, PXC.gold, 14, { s: 3 }); }
    yield* wait(12); } });
// 蒼龍躍・流星龍墜：跳到空中（大部分攻擊打不到），下一次行動落下 → 蓄力那一回合，主角真的跳出畫面上方、一直待在空中；落下時從天而降
const JUMP13 = new Set(['t_zjAzure', 't_zjMeteor']);
function* leap13(b) { const v = b.H; if (!v || !v.off) return; Sound.sfx('jump'); PX13.ring(b, { x: PX13.hero(b).x, y: HERO_FOOT - 2 }, 4, 26, PXC.wind, 2, 14, { fl: 0.3 }); PX13.bits(b, { x: PX13.hero(b).x, y: HERO_FOOT - 2 }, 8, ['#d0b080', '#a08050'], 1.6, 0.14, 14, { up: 1 });
  for (let i = 1; i <= 3; i++) K13.ghost(b, 0, -i * 16, '#9ae8ff', 6 + i * 3, 0.4); v.air13 = 1; v.airT13 = 0; v.drop13 = 1; yield* tween(8, q => { v.off.y = -170 * q * q; }); v.drop13 = 0;
  for (let i = 0; i < 5; i++) PX13.line(b, { x: PX13.hero(b).x - 8 + i * 4, y: 40 + i * 8 }, { x: PX13.hero(b).x - 8 + i * 4, y: 10 + i * 8 }, ['#bfe8ff'], 1, 8, { thin: 1, grow: 2, delay: i }); yield* wait(6); }
// the drop: the hero comes back down (from the top) while the strike dives — runs by itself (a particle drives it)
HERO_PK.p13nil = () => {};
function dropAnim13(b, frames = 6) { const v = b.H; if (!v || !v.off) return; v.drop13 = 1; v.off.y = -170; const end = () => { v.off.y = 0; v.air13 = 0; v.drop13 = 0; };
  b.spawn({ k: 'p13nil', life: frames + 3, upd: q => { const k = clamp(q.t / frames, 0, 1); if (v.drop13) v.off.y = -170 * (1 - k * k); if (k >= 1 && v.drop13) end(); } }); return end; }
{ const H = Battle.prototype.handlers, _ch = H.CHARGE; H.CHARGE = function* (e, s, t, P) { this.leap13 = !!(s && s.hero && JUMP13.has(P.skill)); try { yield* _ch.call(this, e, s, t, P); } finally { this.leap13 = false; } };
  const _fc = FX.charge; FX.charge = function* (U, ...a) { if (this.leap13) { this.leap13 = false; yield* leap13(this); return; } yield* _fc.call(this, U, ...a); };
  const _sg = H.statusGone; H.statusGone = function* (e, s, t, P, ex) { if (t && t.hero && P.status === 'airborne' && t.air13) { if (P.why === 'release') { t.air13 = 3; t.airT13 = 0; } else { t.air13 = 0; t.off.y = 0; } } yield* _sg.call(this, e, s, t, P, ex); };
  const _up = Battle.prototype.update; Battle.prototype.update = function () { _up.call(this); const v = this.H; if (!v || !v.air13 || !v.off || v.drop13) return; v.airT13 = (v.airT13 || 0) + 1; if (v.air13 === 1 && v.st && v.st.airborne) v.air13 = 2;
    v.off.y = -170; if ((v.air13 === 1 && v.airT13 > 300) || (v.air13 === 3 && v.airT13 > 120)) { v.air13 = 0; v.off.y = 0; } }; }
// 蒼龍躍（落下）：一道蒼藍的突刺光從天而降扎進對手，落點的地面炸開一圈衝擊波和碎石，兩道龍爪般的藍色弧光
redo13('t_zjAzure', 't11_zjAzure', { col: PXC.azure,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), foot = v && v.foot ? v.foot : T.y + 24; Sound.sfx('wind');
    for (let i = 0; i < 2; i++) PX13.line(this, { x: T.x + 6 + (i ? 6 : -6), y: -20 }, { x: T.x + (i ? 3 : -3), y: T.y - 10 }, c, 1, 14, { grow: 5, hold: 6, delay: i }); PX13.thr(this, { x: T.x + 8, y: -40 }, T, c, 9, 20, { grow: 6, hold: 8, over: 4 });
    const dr = dropAnim13(this, 8); yield* wait(6); Sound.sfx('quake'); this.shake = Math.max(this.shake, 12); K13.flash(this, '#d8ecff', 0.35, 6); PX13.hit(this, T, c, 1);
    PX13.ring(this, { x: T.x, y: foot }, 6, 46, c, 2, 18, { fl: 0.3 }); PX13.ring(this, { x: T.x, y: foot }, 4, 30, PXC.wind, 1, 14, { fl: 0.3, delay: 3 });
    for (const s of [-1, 1]) PX13.arc(this, { x: T.x + s * 6, y: T.y - 4 }, 24, s > 0 ? -Math.PI * 0.75 : -Math.PI * 0.25, s > 0 ? Math.PI * 0.1 : Math.PI * 0.9, c, 4, 16, { grow: 4 });
    for (let i = 0; i < 6; i++) PX13.spr(this, PXI.rock, { x: T.x + rnd(-14, 14), y: foot - 2 }, { vx: rnd(-16, 16) / 10, vy: -rnd(16, 30) / 10, g: 0.16, life: 24 });
    yield* wait(12); if (dr) dr(); } });
// 流星龍墜（落下）：打全體——天上落下好幾顆蒼藍的流星（每一隻都被砸到），最後主角化成一道最粗的蒼藍突刺光砸在正中間
redo13('t_zjMeteor', 't11_zjMeteor', { col: PXC.azure,
  *f(S, U, T, u, t) { const c = S.col, L = PX13.foes(this, t); K13.dark(this, 0.35, 60, '#040a1a'); Sound.sfx('charge');
    for (const { v, P } of L) { const A = { x: P.x - 40 + rnd(-6, 6), y: -20 }; const p = this.spawn({ k: 'p13orb', x: A.x, y: A.y, r: 6, c: [OSH13, c[0], c[1], '#ffffff'], trail: 12, life: 10 }); p.upd = q => { const k = clamp(q.t / 8, 0, 1); q.x = lerp(A.x, P.x, k); q.y = lerp(A.y, P.y, k); };
      yield* wait(8); Sound.sfx('rock'); PX13.hit(this, P, c, 0); PX13.ring(this, { x: P.x, y: (v.foot || P.y + 24) }, 4, 26, c, 2, 14, { fl: 0.3 }); for (let i = 0; i < 3; i++) PX13.spr(this, PXI.rock, { x: P.x + rnd(-10, 10), y: (v.foot || P.y + 24) - 2 }, { vx: rnd(-14, 14) / 10, vy: -rnd(12, 24) / 10, g: 0.16, life: 20 }); yield* wait(2); }
    Sound.sfx('wind'); PX13.thr(this, { x: T.x - 30, y: -40 }, T, c, 11, 22, { grow: 7, hold: 9, over: 2 }); const dr = dropAnim13(this, 9); yield* wait(7);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 14); K13.flash(this, '#d8ecff', 0.4, 8); PX13.burst(this, T, 26, c, 16, { s: 3 }); PX13.ring(this, { x: T.x, y: T.y + 24 }, 8, 80, c, 2, 20, { fl: 0.3 }); for (const { P } of L) PX13.hit(this, P, c, 1);
    yield* wait(14); if (dr) dr(); } });
// 特技・貫心：追擊，無視物防 → 一道突刺光直直穿過對手、從背後透出一道紅光
redoSp13('長槍', 0, { col: PXC.red,
  *f(S, U, T, u) { yield* this.lunge(u, 14, 2); const d = thrust13(this, T, { over: 30, hold: 6, life: 16 }); yield* wait(3); Sound.sfx('crit');
    PX13.thr(this, T, { x: T.x + d.ux * 36, y: T.y + d.uy * 36 }, S.col, 4, 12, { grow: 3, hold: 4, over: 0 }); PX13.burst(this, T, 14, S.col, 12, { s: 3 }); PX13.bits(this, { x: T.x + d.ux * 14, y: T.y + d.uy * 14 }, 8, ['#ffe0c0', '#ff3a2a', '#7a0a0a'], 2, 0.1, 14, { ang: d.ang, spread: 0.5 }); yield* wait(12); } });
// 特技・旋槍：追擊全體 → 一團旋轉的弧光（像風車）從左捲到右，經過每一隻都打一下
redoSp13('長槍', 1, { col: SPEAR13,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t).sort((a, q) => a.P.x - q.P.x), y0 = T.y; Sound.sfx('wind'); let k = 0;
    for (let f = 0; f < 21; f++) { const X = lerp(-20, W + 30, f / 20); if (f % 2 === 0) for (const s of [0, Math.PI]) PX13.arc(this, { x: X, y: y0 }, 20, f * 0.9 + s - 1.4, f * 0.9 + s, S.col, 4, 6, { grow: 1 });
      while (k < L.length && L[k].P.x <= X) { Sound.sfx('slash'); PX13.hit(this, L[k].P, S.col, 0); k++; } yield; }
    yield* wait(8); } });
// 特技・凝息：下一次攻擊必定會心 → 主角吐出幾口白氣，金色的光點聚到槍尖、閃兩下
redoSp13('長槍', 2, { col: PXC.gold,
  *f(S) { const H = PX13.hero(this), A = { x: H.x + 12, y: H.y - 30 }; Sound.sfx('wind'); for (let i = 0; i < 3; i++) PX13.bits(this, { x: H.x - 2, y: H.y - 22 }, 3, ['#ffffff', '#d8ecff', '#a8c0e0'], 0.6, -0.02, 18, { s: 3, ang: -Math.PI / 2, spread: 0.7 });
    yield* wait(8); Sound.sfx('tick'); for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5, P0 = { x: A.x + Math.cos(an) * 24, y: A.y + Math.sin(an) * 20 }, p = this.spawn({ k: 'p13px', x: P0.x, y: P0.y, s: 2, cols: [S.col[1], S.col[0]], o: OSH13, life: 12 }); p.upd = q => { const k = clamp(q.t / 10, 0, 1); q.x = lerp(P0.x, A.x, k); q.y = lerp(P0.y, A.y, k); }; }
    yield* wait(10); Sound.sfx('crit'); PX13.spr(this, PXI.glint, A, { sc: 2, life: 10 }); yield* wait(8); PX13.spr(this, PXI.glint, A, { sc: 3, life: 12 }); yield* wait(12); } });

// ---------- 拳套 ----------
const PALM13 = PXS(['..k.k.k.k..', '.kykykykyk.', '.kykykykyk.', '.kykykykyk.', 'kkyyyyyyyk.', 'kyyyyyyyyk.', '.kkyyyyyyk.', '..kyyyyyyk.', '..kyyyyyk..', '...kkkkk...'], { y: '#ffcc33' });
// 震山擊（原本的透勁，v12.34 玩家：「透勁不好做就重製」→ 改名改特效，數字不變）：用肩膀整個人撞上去，無視 40% 物防，50% 退縮
//   → 主角壓低身子、腳下揚塵，帶著一串殘影整個人撞上去；撞上的瞬間大爆光，三道弧形的震波穿過對手、從牠背後推出去（無視物防），對手被撞得往後滑再站回來
redo13('t_fsThrough', 't11_fsThrough', { col: PXC.chi,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), H = PX13.hero(this), d = PX13.dir(H, T), F0 = { x: H.x, y: HERO_FOOT - 3 };
    Sound.sfx('heavy'); PX13.bits(this, F0, 8, ['#d0b080', '#a08050', '#6a5030'], 1.4, 0.14, 14, { up: 1 }); yield* wait(4);
    Sound.sfx('wind'); for (let i = 1; i <= 4; i++) K13.ghost(this, d.ux * i * 12, d.uy * i * 12, '#ffd080', 6 + i * 2, 0.5 - i * 0.08); PX13.speed(this, H, T, c, 8, 10);
    yield* this.lunge(u, 46, 3); Sound.sfx('hitSuper'); this.shake = Math.max(this.shake, 10); K13.flash(this, '#fff0c0', 0.3, 5); PX13.burst(this, T, 20, c, 13, { s: 3 });
    for (let k = 0; k < 3; k++) { const w = this.spawn({ k: 'p13wave', x: T.x, y: T.y, ang: d.ang, r: 8, span: 1.7, w: 5 - k, c, life: 14, delay: 2 + k * 2 });
      w.upd = q => { const kk = clamp((q.t - 2 - k * 2) / 8, 0, 1), r = lerp(8, 20 + k * 5, kk), D = lerp(0, 16 + k * 12, kk); q.r = r; q.x = T.x + d.ux * D - d.ux * r * 0.6; q.y = T.y + d.uy * D - d.uy * r * 0.6; }; }
    PX13.bits(this, { x: T.x + d.ux * 18, y: T.y + d.uy * 18 }, 8, [c[1], c[0], '#c07010'], 2.2, 0.06, 14, { s: 2, ang: d.ang, spread: 0.6 });
    if (v && v.off) { const o = v.off; yield* tween(3, q => { o.x = d.ux * 10 * q; o.y = d.uy * 10 * q; }); yield* wait(3); yield* tween(7, q => { o.x = d.ux * 10 * (1 - q); o.y = d.uy * 10 * (1 - q); }); o.x = 0; o.y = 0; }
    PX13.bits(this, { x: T.x, y: (v && v.foot) || T.y + 24 }, 6, ['#d0b080', '#a08050', '#6a5030'], 1.4, 0.14, 14, { up: 1 }); yield* wait(10); } });
// 沖天拳（原本的裂地神掌，v12.34 改名改特效，數字不變）：一記上勾拳把對手打上半空，必定會心；氣滿時威力再 +50%
//   → 金色的氣聚到拳上，主角衝到對手面前一記上勾拳（像素拳頭往上打）：一道金光從對手腳下往上衝、對手被打飛到半空再摔下來，打中的那一下是會心的金色大星；
//   氣滿時往上衝的是一根又粗又高的金色氣柱、畫面一閃
redo13('t_zjQuake', 't11_zjQuake', { col: PXC.chi,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), hu = this.core.byId.H, full = !!(hu && hu.max && hu.max.chi && (hu.res.chi || 0) >= hu.max.chi), foot = v && v.foot ? v.foot : T.y + 24, A = PX13.hand(this);
    K13.dark(this, 0.45, 60, '#140a00'); Sound.sfx('charge'); for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6, P0 = { x: A.x + Math.cos(an) * 24, y: A.y + Math.sin(an) * 18 }, p = this.spawn({ k: 'p13px', x: P0.x, y: P0.y, s: 2, cols: [c[1], c[0]], o: OSH13, life: 12 }); p.upd = q => { const k = clamp(q.t / 10, 0, 1); q.x = lerp(P0.x, A.x, k); q.y = lerp(P0.y, A.y, k); }; }
    yield* wait(10); PX13.spr(this, PXI.glint, A, { sc: 2, life: 8 }); yield* this.lunge(u, 30, 2);
    Sound.sfx('crit'); this.shake = Math.max(this.shake, 12); K13.flash(this, '#fff0c0', 0.35, 5);
    PX13.thr(this, { x: T.x, y: foot + 4 }, { x: T.x, y: T.y - 64 }, full ? ['#fff6c0', '#ffffff', '#3a2800'] : c, full ? 12 : 8, 16, { grow: 4, hold: 6, over: 0 });
    this.spawn({ k: 'p13col', x: T.x, y: foot, w: full ? 18 : 9, h: full ? 220 : 110, c: full ? ['#fff6c0', '#ffffff', '#3a2800'] : c, grow: 3, life: full ? 20 : 14 });
    const fs = PX13.spr(this, PXI.fist, { x: T.x, y: T.y + 14 }, { sc: 2, life: 12 }); fs.upd = q => { const k = clamp(q.t / 5, 0, 1); q.y = lerp(T.y + 14, T.y - 34, 1 - (1 - k) * (1 - k)); };
    PX13.burst(this, { x: T.x, y: T.y - 8 }, 24, PXC.gold, 16, { s: 3 }); PX13.spr(this, PXI.glint, { x: T.x + 12, y: T.y - 22 }, { sc: 3, life: 18 }); if (full) { K13.flash(this, '#ffffff', 0.5, 8); PX13.burst(this, { x: T.x, y: T.y - 30 }, 28, PXC.gold, 14, { s: 3, delay: 3 }); }
    PX13.bits(this, { x: T.x, y: T.y - 10 }, 10, [c[1], c[0], '#c07010'], 2.2, 0.1, 16, { s: 2, ang: -Math.PI / 2, spread: 0.8 });
    if (v && v.off) { const o = v.off; yield* tween(5, q => { o.y = -40 * (1 - (1 - q) * (1 - q)); }); yield* wait(5); yield* tween(6, q => { o.y = -40 * (1 - q * q); }); o.y = 0;
      Sound.sfx('quake'); this.shake = Math.max(this.shake, 8); PX13.ring(this, { x: T.x, y: foot }, 6, 34, PXC.rock, 2, 14, { fl: 0.3 }); PX13.bits(this, { x: T.x, y: foot }, 8, ['#d0b080', '#a08050', '#6a5030'], 1.6, 0.14, 16, { up: 1 });
      yield* tween(3, q => { o.y = -6 * Math.sin(Math.PI * q); }); o.y = 0; } else yield* wait(16);
    yield* wait(12); } });

// ---------- 法杖（元素）----------
const fireBall13 = function* (b, A, P, r = 4, n = 9) { const c = [OSH13, '#d8361a', '#ff8a1e', '#ffe08a'], p = b.spawn({ k: 'p13orb', x: A.x, y: A.y, r, c, trail: 7, pulse: 1, life: n + 1 });
  p.upd = q => { const k = clamp(q.t / n, 0, 1); q.x = lerp(A.x, P.x, k); q.y = lerp(A.y, P.y, k); if (q.t % 2 === 0) b.spawn({ k: 'p13px', x: q.x + rnd(-2, 2), y: q.y + rnd(-2, 2), vx: rnd(-3, 3) / 10, vy: -0.3, s: 2, cols: ['#ffe08a', '#ff8a1e', '#d8361a', '#5a1800'], life: 12 }); }; yield* wait(n); };
const flames13 = (b, P, n = 3, w = 14) => { for (let i = 0; i < n; i++) PX13.spr(b, i % 2 ? PXI.flameB : PXI.flameA, { x: P.x + rnd(-w, w), y: P.y + rnd(-6, 8) }, { frames: [PXI.flameA, PXI.flameB], fps: 3, vy: -0.25, life: 20 + rnd(0, 6), delay: i * 2 }); };
// 火球：火屬性，20% 灼傷 → 杖尖冒火，一顆像素火球拖著火星飛過去，炸開成火焰（對手身上燒起幾團小火）
redo13('t_stArrows', 't11_stArrows', { col: PXC.fire,
  *f(S, U, T) { const A = PX13.tip(this); Sound.sfx('fire'); flames13(this, A, 2, 3); yield* wait(5); yield* fireBall13(this, A, T, 6, 10);
    Sound.sfx('fire'); PX13.burst(this, T, 14, PXC.fire, 12, { s: 3 }); flames13(this, T, 3); PX13.bits(this, T, 8, ['#ffe08a', '#ff8a1e', '#d8361a'], 1.6, -0.04, 18); this.shake = Math.max(this.shake, 4); yield* wait(12); } });
// 冰錐：水屬性，10% 凍結 → 杖尖凝出一根冰錐（越長越大），射過去碎成冰晶，對手身邊亮起雪花
const ICICLE13 = [{ pts: [[0, -12], [3, -2], [2, 9], [0, 11], [-2, 9], [-3, -2]], c: '#9ad8ff', o: '#061a40' }, { pts: [[0, -10], [1, -2], [0, 8], [-1, -2]], c: '#ffffff', o: null }];
redo13('t_stLance', 't11_stLance', { col: PXC.ice,
  *f(S, U, T) { const A = PX13.tip(this), d = PX13.dir(A, T); Sound.sfx('water'); const ic = this.spawn({ k: 'p13poly', x: A.x, y: A.y, rot: d.ang + Math.PI / 2, sc: 0.3, shapes: ICICLE13, life: 18 });
    ic.upd = q => { if (q.t < 8) q.sc = 0.5 + 1.1 * q.t / 8; else { const k = clamp((q.t - 8) / 5, 0, 1); q.sc = 1.6; q.x = lerp(A.x, T.x, k); q.y = lerp(A.y, T.y, k); } };
    for (let i = 0; i < 6; i++) { const P0 = { x: A.x + rnd(-14, 14), y: A.y + rnd(-12, 12) }, q0 = this.spawn({ k: 'p13px', x: P0.x, y: P0.y, s: 2, cols: ['#ffffff', '#9ad8ff'], o: OSH13, life: 8 }); q0.upd = q => { const k = clamp(q.t / 7, 0, 1); q.x = lerp(P0.x, A.x, k); q.y = lerp(P0.y, A.y, k); }; } yield* wait(13); ic.life = ic.t + 1;
    Sound.sfx('hit'); PX13.burst(this, T, 12, PXC.ice, 11); PX13.bits(this, T, 10, ['#ffffff', '#9ad8ff', '#3aa0ff'], 2.2, 0.12, 16, { s: 2 }); for (let i = 0; i < 4; i++) PX13.spr(this, PXI.ice, { x: T.x + rnd(-16, 16), y: T.y + rnd(-14, 12) }, { life: 18, delay: i * 2 });
    yield* wait(12); } });
// 元素屏障：張開護盾（最大 HP 25%，魔法全吸收、物理吸收一半），2 回合 → 火・水・雷・草四顆元素寶石繞著主角轉一圈，拉出一道四色的光環，光環上閃著亮點
const GEMS13 = () => [PXI.gem(PXC.fire), PXI.gem(PXC.ice), PXI.gem(PXC.volt), PXI.gem(PXC.leaf)];
const gemSc13 = 2;
redo13('t_stWall', 't11_stWall', { col: PXC.ice,
  *f(S) { const H = PX13.hero(this), C = { x: H.x, y: H.y - 4 }, G = GEMS13(), col = [PXC.fire, PXC.ice, PXC.volt, PXC.leaf]; Sound.sfx('charge');
    G.forEach((g, i) => { const p = PX13.spr(this, g, C, { sc: gemSc13, life: 30 }); p.upd = q => { const an = i * Math.PI / 2 + q.t * 0.21, R = Math.min(26, q.t * 3); q.x = C.x + Math.cos(an) * R; q.y = C.y + Math.sin(an) * R * 0.75; }; });
    yield* wait(12); Sound.sfx('shield'); col.forEach((c, i) => PX13.arc(this, C, 26, i * Math.PI / 2, (i + 1) * Math.PI / 2 + 0.05, c, 3, 26, { fl: 0.75, grow: 5, hold: 12 }));
    for (let i = 0; i < 6; i++) PX13.spr(this, PXI.glintS, { x: C.x + Math.cos(i * 1.05) * 26, y: C.y + Math.sin(i * 1.05) * 19 }, { life: 10, delay: 6 + i * 2 }); yield* wait(22); } });
// 落雷：雷屬性，20% 麻痺；對蓄力中的對手威力 ×1.5 → 杖尖冒電花，天上劈下一道鋸齒狀的閃電，打中的地方炸出電花；對手正在蓄力時落下兩道、再大一圈
const bolt13 = (b, P, s = 2, life = 12) => b.spawn({ k: 'p13bolt', pts: PX13.zig({ x: P.x + rnd(-10, 10), y: -6 }, P, 8, 7), c: PXC.volt, s, grow: 2, life });
redo13('t_stImpact', 't11_stImpact', { col: PXC.volt,
  *f(S, U, T, u, t) { const v = tgt13(this, t), chg = !!(v && v.st && v.st.charging), A = PX13.tip(this); Sound.sfx('buzz'); zaps13(this, A, 2); yield* wait(6);
    K13.dark(this, 0.3, 12, '#0a0a20'); Sound.sfx('thunder'); bolt13(this, T, chg ? 3 : 2, 12); K13.flash(this, '#fff6a0', 0.35, 4); PX13.burst(this, T, chg ? 20 : 13, PXC.volt, 12, { s: 3 }); zaps13(this, T, 3); this.shake = Math.max(this.shake, chg ? 10 : 6);
    if (chg) { yield* wait(4); bolt13(this, { x: T.x + 6, y: T.y }, 3, 12); K13.flash(this, '#ffffff', 0.35, 4); } yield* wait(12); } });
// 炎浪：火屬性打全體，10% 灼傷 → 一排火焰像浪一樣從左邊捲到右邊，經過的每一隻都被火吞掉、冒出火星
redo13('t_stStorm', 't11_stStorm', { col: PXC.fire,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t).sort((a, q) => a.P.x - q.P.x), y0 = T.y + 18; Sound.sfx('fire'); flames13(this, PX13.tip(this), 2, 3); yield* wait(4); let k = 0;
    for (let f = 0; f < 22; f++) { const X = lerp(-14, W + 14, f / 21); if (f % 2 === 0) for (let j = 0; j < 3; j++) PX13.spr(this, PXI.flameA, { x: X + rnd(-6, 6), y: y0 - j * 9 + rnd(-2, 2) }, { frames: [PXI.flameA, PXI.flameB], fps: 2, sc: j === 0 ? 2 : 1, vy: -0.3, life: 14 });
      while (k < L.length && L[k].P.x <= X) { Sound.sfx('fire'); const P = L[k].P; PX13.burst(this, P, 12, PXC.fire, 10); flames13(this, P, 3, 12); k++; } yield; }
    yield* wait(10); } });
// 藤鞭：草屬性，回復傷害 25% 的 HP → 杖尖長出一條帶葉子的藤蔓抽過去、葉片飛散；綠色的光點從對手身上流回主角，主角身邊冒出「＋」（回復）
const PLUS13 = PXS(['.kkk.', 'kkgkk', 'kgggk', 'kkgkk', '.kkk.'], { g: '#7af060' });
redo13('t_stHaste', 't11_stHaste', { col: PXC.leaf,
  *f(S, U, T) { const A = PX13.tip(this), H = PX13.hero(this); Sound.sfx('leaf'); this.spawn({ k: 'p13vine', x1: A.x, y1: A.y, x2: T.x, y2: T.y, c: PXC.leaf, s: 3, amp: 8, waves: 2.5, grow: 7, life: 24 }); yield* wait(7);
    Sound.sfx('slash'); PX13.burst(this, T, 12, PXC.leaf, 11); for (let i = 0; i < 6; i++) PX13.spr(this, PXI.leaf, T, { sc: 2, vx: rnd(-20, 20) / 10, vy: -rnd(6, 20) / 10, g: 0.08, life: 20 }); yield* wait(6);
    Sound.sfx('heal'); for (let i = 0; i < 10; i++) { const P0 = { x: T.x + rnd(-10, 10), y: T.y + rnd(-8, 8) }, p = this.spawn({ k: 'p13px', x: P0.x, y: P0.y, s: 2, cols: ['#c8f8a0', '#7af060'], o: '#06300a', life: 16, delay: i }); p.upd = q => { const k = clamp((q.t - i) / 12, 0, 1); q.x = lerp(P0.x, H.x, k * k); q.y = lerp(P0.y, H.y - 6, k * k); }; }
    yield* wait(12); for (const [dx, dy] of [[-12, -10], [12, -16], [0, -24]]) PX13.spr(this, PLUS13, { x: H.x + dx, y: H.y + dy }, { sc: 2, vy: -0.4, life: 20 }); yield* wait(12); } });
// 雷暴：雷屬性打全體 2 段（各 45），20% 麻痺 → 魔物頭上捲起一片雷雲，第一段每一隻都被劈一道；第二段再劈一次
redo13('t_stFinale', 't11_stFinale', { col: PXC.volt,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t); K13.dark(this, 0.4, 70, '#06061a'); Sound.sfx('wind'); const cl = PX13.spr(this, PXI.cloud, { x: T.x, y: 6 }, { sc: 3, life: 64 }); cl.upd = q => { q.y = Math.min(34, 6 + q.t * 3); };
    yield* wait(10); for (const { P } of L) { Sound.sfx('thunder'); this.spawn({ k: 'p13bolt', pts: PX13.zig({ x: P.x + rnd(-6, 6), y: 44 }, P, 6, 6), c: PXC.volt, s: 2, grow: 2, life: 12 }); PX13.burst(this, P, 12, PXC.volt, 11); zaps13(this, P, 2); yield* wait(3); }
    K13.flash(this, '#fff6a0', 0.3, 4); this.shake = Math.max(this.shake, 8); yield* wait(8); },
  *h(S, U, T) { Sound.sfx('thunder'); this.spawn({ k: 'p13bolt', pts: PX13.zig({ x: T.x + rnd(-6, 6), y: 44 }, T, 6, 6), c: PXC.volt, s: 3, grow: 2, life: 12 }); PX13.burst(this, T, 14, PXC.volt, 12, { s: 3 }); zaps13(this, T, 2); K13.flash(this, '#ffffff', 0.25, 3); this.shake = Math.max(this.shake, 6); yield* wait(8); } });
// 元素增幅：3 回合魔攻 +2、打中弱點的傷害 +20% → 主角腳下亮起像素魔法陣，四顆元素寶石從陣的四邊升起、匯進杖尖，杖尖閃白光；身邊冒出紫色的往上箭頭（魔攻提升）
redo13('t_stMax', 't11_stMax', { col: PXC.ice,
  *f(S) { const H = PX13.hero(this), F = { x: H.x, y: HERO_FOOT - 4 }, A = PX13.tip(this), G = GEMS13(); Sound.sfx('charge');
    PX13.ring(this, F, 30, 30, ['#c890ff', '#ffffff', OSH13], 1, 40, { fl: 0.32 }); PX13.ring(this, F, 20, 20, ['#c890ff', '#ffffff', OSH13], 1, 40, { fl: 0.32 }); yield* wait(6);
    G.forEach((g, i) => { const P0 = { x: F.x + Math.cos(i * Math.PI / 2) * 30, y: F.y + Math.sin(i * Math.PI / 2) * 10 }, p = PX13.spr(this, g, P0, { sc: gemSc13, life: 22 }); p.upd = q => { const k = clamp(q.t / 18, 0, 1); q.x = lerp(P0.x, A.x, k * k); q.y = lerp(P0.y, A.y, k) - Math.sin(Math.PI * k) * 10; }; });
    yield* wait(18); Sound.sfx('statUp'); PX13.spr(this, PXI.glint, A, { sc: 2, life: 12 }); [PXC.fire, PXC.ice, PXC.volt, PXC.leaf].forEach((c, i) => PX13.ring(this, A, 6, 22, c, 1, 10, { delay: 3 + i * 2 }));
    for (const dx of [-18, 18]) PX13.spr(this, PXI.upCh('#c890ff'), { x: H.x + dx, y: H.y }, { vy: -0.6, life: 20 }); yield* wait(16); } });
// 特技・元素迸發：強力追擊，帶武器的屬性（沒屬性時是火）→ 一顆那個屬性顏色的大元素球飛過去炸開（火是火焰、水是冰晶、雷是電花、草是葉子）
redoSp13('法杖', 0, { col: PXC.fire,
  *f(S, U, T) { const hu = this.core.byId.H, el = { 火: 1, 水: 1, 雷: 1, 草: 1 }[hu && hu.data.welem] ? hu.data.welem : '火', c = EL13PX[el], A = PX13.tip(this); Sound.sfx('charge');
    const p = this.spawn({ k: 'p13orb', x: A.x, y: A.y, r: 3, c: [OSH13, c[0], c[1], '#ffffff'], trail: 8, pulse: 1, life: 26 }); p.upd = q => { if (q.t < 10) q.r = 3 + q.t * 0.4; else { const k = clamp((q.t - 10) / 8, 0, 1); q.x = lerp(A.x, T.x, k); q.y = lerp(A.y, T.y, k); } }; yield* wait(18); p.life = p.t + 1;
    Sound.sfx(el === '火' ? 'fire' : el === '水' ? 'water' : el === '雷' ? 'thunder' : 'leaf'); PX13.burst(this, T, 22, c, 14, { s: 3 }); this.shake = Math.max(this.shake, 8);
    if (el === '火') flames13(this, T, 4, 16); else if (el === '水') for (let i = 0; i < 5; i++) PX13.spr(this, PXI.ice, { x: T.x + rnd(-18, 18), y: T.y + rnd(-14, 12) }, { life: 18, delay: i * 2 }); else if (el === '雷') zaps13(this, T, 5); else for (let i = 0; i < 7; i++) PX13.spr(this, PXI.leaf, T, { vx: rnd(-22, 22) / 10, vy: -rnd(6, 20) / 10, g: 0.08, life: 20 });
    yield* wait(14); } });

// ---------- 單手盾 ----------
// 盾撞：攻擊力加上物防的 70%，30% 退縮 → 主角舉盾（像素盾牌）整個撞上去，撞到的地方爆出藍白的衝擊和碎屑，盾牌彈回
redo13('t_osBash', 't11_osBash', { col: PXC.blue,
  *f(S, U, T, u) { const H = PX13.hero(this), A = { x: H.x - 8, y: H.y - 12 }, d = PX13.dir(A, T), P0 = { x: T.x - d.ux * 8, y: T.y - d.uy * 8 }; const sh = PX13.spr(this, PXI.shield, A, { sc: 2, life: 26, blink: 0 });
    sh.upd = q => { const t = q.t - 6, k = t < 0 ? 0 : t < 4 ? t / 4 : 1 - clamp((t - 7) / 8, 0, 1) * 0.8; q.x = lerp(A.x, P0.x, k); q.y = lerp(A.y, P0.y, k); }; Sound.sfx('wind');
    yield* wait(5); PX13.speed(this, A, T, PXC.wind, 5, 8); yield* this.lunge(u, 22, 2); Sound.sfx('heavy'); PX13.hit(this, T, PXC.blue, 1); PX13.bits(this, T, 6, ['#ffffff', '#c8d4e8', '#7a88a8'], 2.2, 0.14, 14, { s: 3 }); yield* wait(14); } });
// 堅守：搶先；這回合受到的傷害 −50%，下一回合格擋率 +30% → 左手的盾牌舉到面前、重重立住（腳下一圈震波、揚起塵土），盾面閃一下（格擋率提升由狀態標籤「格擋↑」顯示）
redo13('t_osHold', 't11_osHold', { col: PXC.blue,
  *f(S) { const H = PX13.hero(this), A = { x: H.x - 8, y: H.y - 10 }, P = { x: H.x, y: H.y - 24 }, sh = PX13.spr(this, PXI.shield, A, { sc: 2, life: 34, blink: 0 });
    sh.upd = q => { const k = clamp(q.t / 4, 0, 1); q.x = lerp(A.x, P.x, k); q.y = lerp(A.y, P.y - 6, k) + (q.t >= 4 ? Math.min(6, (q.t - 4) * 3) : 0); }; Sound.sfx('wind');
    yield* wait(6); Sound.sfx('shield'); this.shake = Math.max(this.shake, 4); const F = { x: H.x, y: HERO_FOOT - 3 }; PX13.ring(this, F, 4, 30, PXC.steel, 2, 14, { fl: 0.3 }); PX13.bits(this, F, 8, ['#d0b080', '#a08050', '#6a5030'], 1.6, 0.14, 16, { up: 1 });
    yield* wait(4); PX13.spr(this, PXI.glint, { x: P.x - 6, y: P.y - 8 }, { sc: 2, life: 12 }); yield* wait(18); } });
// 格擋反擊：2 回合內，格擋成功時反擊（威力 60）→ 盾牌立在面前，兩道金色的弧光繞著盾牌轉一圈（擋下、轉回去），盾緣閃出金光
redo13('t_osCounter', 't11_osCounter', { col: PXC.gold,
  *f(S) { const H = PX13.hero(this), P = { x: H.x, y: H.y - 20 }; Sound.sfx('shield'); PX13.spr(this, PXI.shield, P, { sc: 2, life: 30, blink: 0 }); yield* wait(4);
    Sound.sfx('wind'); for (const s of [0, Math.PI]) PX13.arc(this, P, 22, s - Math.PI / 2, s + Math.PI * 0.9, PXC.gold, 3, 18, { fl: 0.85, grow: 8 }); yield* wait(10);
    Sound.sfx('crit'); for (const [dx, dy] of [[-12, -14], [12, -14], [0, 14]]) PX13.spr(this, PXI.glint, { x: P.x + dx, y: P.y + dy }, { life: 12 }); PX13.burst(this, P, 14, PXC.gold, 10, { n: 4 }); yield* wait(14); } });
