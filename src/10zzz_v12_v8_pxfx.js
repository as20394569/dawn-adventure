/* ===================== v12.33 像素特效重做（玩家 2026-10-06：「短刀的攻擊技能都不行」「長槍完全不行」、透勁・裂地神掌第二次還是不行、法杖改元素、單手盾新樹） =====================
   問題是「不像那種武器」「形狀粗糙，跟像素畫風不搭」→ 全部用 10zzz_v12_v7 的像素工具重畫（每一格對齊像素，不用平滑的向量線）：
   · 短刀：小而快——細的刀光、刺擊、刀尖的閃光；毒是滴下來的綠色顆粒和泡泡、麻痺是黃色電花。
   · 長槍：看得到整支槍（槍桿＋槍頭＋紅纓）往前刺出再收回；穿甲＝槍頭穿過護甲片、從背後透出去。
   · 拳套：像素拳頭；透勁＝拳頭打在護甲上，護甲沒碎、震波從背後穿出去；裂地神掌＝一掌拍進地面，裂縫一路爬到對手腳下、地面炸開噴出氣柱和石塊（不再畫天上掉下來的大手掌）。
   · 法杖：每招有固定元素——火球・冰錐・落雷・炎浪・藤鞭・雷暴，元素屏障・元素增幅用四色元素寶石。
   · 單手盾：像素盾牌撞過去、立在面前、盾反的閃光。
   每招的註解寫它照技能文字畫了什麼。 */
const OSH13 = '#120c22';
// ---------- 短刀 ----------
// 短刀的招都看得到那把短刀：刀身・護手・握把的像素短刀刺進去、或沿著月牙形的刀光劃過去
const BLADE_V13 = ['#7ad048', '#e0ffc0', '#0a2a0a'], BLADE_R13 = ['#e8e0f0', '#ffffff', '#2a0410'], BLADE_S13 = ['#b8a8d8', '#ffffff', '#12061e'];
const spark13 = (b, P, col, r = 8) => { PX13.burst(b, P, r, col, 9, { n: 4 }); PX13.spr(b, PXI.glintS, P, { life: 8 }); };
// venom drops falling, bubbles rising, yellow sparks
const drip13 = (b, P, n = 4, w = 16) => { for (let i = 0; i < n; i++) b.spawn({ k: 'p13px', x: P.x + rnd(-w, w), y: P.y + rnd(-4, 4), vx: 0, vy: 0.3, g: 0.12, s: 3, cols: ['#b8ff80', '#5ad048', '#2a8a2a'], o: '#0a2a0a', life: 22 + rnd(0, 6), delay: rnd(0, 4) }); };
const bubbles13 = (b, P, n = 3) => { for (let i = 0; i < n; i++) PX13.spr(b, PXI.bubble, { x: P.x + rnd(-14, 14), y: P.y + rnd(-6, 8) }, { sc: 2, vy: -0.45, life: 22 + rnd(0, 8), delay: i * 3 }); };
const zaps13 = (b, P, n = 3) => { for (let i = 0; i < n; i++) PX13.spr(b, PXI.zap, { x: P.x + rnd(-16, 16), y: P.y + rnd(-14, 10) }, { sc: 2, life: 18, delay: i * 2 }); };
const tgt13 = (b, t) => K13.views(b, t)[0] || b.tgtV;
const b13dot = (b, P, c) => b.spawn({ k: 'p13px', x: P.x, y: P.y, s: 2, cols: ['#ffffff', c], o: OSH13, life: 16 });
// the hero vanishes (a puff of shadow) and comes back after `n` frames
const vanish13 = (b, n = 24) => { const v = b.H, H = PX13.hero(b); PX13.bits(b, H, 14, ['#3a1a4a', '#6a3a8a', '#1a0a24'], 1.4, -0.03, 16, { s: 4 }); if (!v || !v.off) return; const y0 = v.off.y; v.off.y = 400; b.spawn({ k: 'p13nil', life: n + 1, upd: q => { if (q.t >= n) v.off.y = y0; } }); };
// a diagonal cut across the body: the crescent passes through P (side 1: from upper left to lower right, −1: mirrored)
const xSlash13 = (b, P, side, col, blade, o = {}) => { const r = o.r || 22, C = { x: P.x - side * r * 0.64, y: P.y + r * 0.55 }, a0 = side > 0 ? -1.75 : -Math.PI + 1.75, a1 = side > 0 ? 0.17 : -Math.PI - 0.17;
  return PX13.dSlash(b, C, r, a0, a1, col, Object.assign({ blade, w: 5 }, o)); };
// 淬刃：兩段斬，每段 30% 中毒 → 刀身沾著綠色毒液的短刀，左右各劃一道月牙刀光，每一刀都甩出毒滴；第二刀冒出毒泡
redo13('t_dgVenom', 't11_dgVenom', { col: PXC.venom,
  *f(S, U, T, u) { drip13(this, PX13.hand(this), 3, 3); Sound.sfx('poison'); yield* this.lunge(u, 16, 2); Sound.sfx('slash');
    xSlash13(this, T, 1, S.col, BLADE_V13); yield* wait(3); drip13(this, T, 6); spark13(this, T, S.col); yield* wait(10); },
  *h(S, U, T) { Sound.sfx('slash'); xSlash13(this, T, -1, S.col, BLADE_V13); yield* wait(3); drip13(this, T, 6); bubbles13(this, T, 3); spark13(this, T, S.col, 10); yield* wait(12); } });
// 迅刺：搶先突刺，自己速度 +1 → 殘影和速度線、短刀一記直刺（刀尖閃光）；刺完主角腳邊捲起一圈風（速度提升）
redo13('t_dgQuick', 't11_dgQuick', { col: PXC.blade,
  *f(S, U, T, u) { Sound.sfx('wind'); for (let i = 1; i <= 3; i++) K13.ghost(this, 0, i * 5, '#bfe8ff', 6 + i * 2, 0.45 - i * 0.1); PX13.speed(this, U, T, PXC.wind, 6, 8);
    yield* this.lunge(u, 26, 2); Sound.sfx('slash'); PX13.dStab(this, T, { len: 30, sc: 1.4, frames: 2, hold: 6 }); yield* wait(2); spark13(this, T, S.col, 10); PX13.spr(this, PXI.glint, { x: T.x + 2, y: T.y - 2 }, { life: 10 }); yield* wait(8);
    const H = PX13.hero(this); Sound.sfx('wind'); PX13.arc(this, { x: H.x, y: H.y + 14 }, 20, Math.PI * 0.2, Math.PI * 2.1, PXC.wind, 3, 18, { fl: 0.35, grow: 10 }); yield* wait(14); } });
// 蝕毒連刺：四段刺擊；對中毒的對手每段 ×1.4 → 短刀四下快刺打在不同位置；對手中毒時刀身染綠、每一刺都噴出綠色毒花和毒泡
const rot13 = (b, T, i, ps) => { const off = [[-8, -6], [8, -2], [-4, 6], [4, 0]][i % 4], P = { x: T.x + off[0], y: T.y + off[1] }; Sound.sfx('slash'); PX13.dStab(b, P, { len: 22, sc: 1.4, frames: 2, hold: 4, c: ps ? BLADE_V13 : PXC.steel });
  spark13(b, P, ps ? PXC.venom : PXC.blade, ps ? 11 : 7); if (ps) { PX13.bits(b, P, 6, ['#b8ff80', '#5ad048', '#2a8a2a'], 2, 0.1, 14, { s: 3 }); Sound.sfx('poison'); } };
redo13('t_dgRot', 't11_dgRot', { col: PXC.venom,
  *f(S, U, T, u, t) { const v = tgt13(this, t), ps = !!(v && v.st && v.st.psn); if (ps) { bubbles13(this, T, 4); K13.tint(v, '#40c040', 0.35, 34); } yield* this.lunge(u, 22, 2); rot13(this, T, 0, ps); yield* wait(5); },
  *h(S, U, T, u, i) { const v = this.tgtV, ps = !!(v && v.st && v.st.psn); rot13(this, T, i, ps); if (i === 3) { yield* wait(2); PX13.hit(this, T, ps ? PXC.venom : PXC.blade, 0); } yield* wait(i === 3 ? 12 : 5); } });
// 索命刺：對 HP 一半以下 ×1.5，容易會心 → 主角化成一團影子消失、出現在對手面前，一把大短刀斜斜刺進要害（紅光）；對手 HP 一半以下時畫面暗下、頭上冒骷髏、再補一刀成交叉
redo13('t_dgReap', 't11_dgReap', { col: PXC.blood,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), low = K13.low(v, 0.5), H = PX13.hero(this);
    Sound.sfx('wind'); vanish13(this, 30); if (low) K13.dark(this, 0.45, 44, '#1a0006'); yield* wait(6); K13.ghost(this, T.x - H.x, T.y - H.y + 30, '#401020', 18, 0.6); yield* wait(4);
    Sound.sfx('crit'); PX13.dStab(this, T, { from: { x: T.x - 30, y: T.y - 30 }, len: 26, sc: 2, frames: 3, hold: 10, c: BLADE_R13, gc: '#c02030' }); yield* wait(3);
    PX13.burst(this, T, low ? 18 : 13, c, 13, { s: 3 }); PX13.bits(this, T, 10, ['#ff6070', '#e8263e', '#7a0a1a'], 2.4, 0.14, 18, { s: 3 }); this.shake = Math.max(this.shake, low ? 8 : 5);
    if (low) { yield* wait(4); Sound.sfx('crit'); PX13.dStab(this, T, { from: { x: T.x + 30, y: T.y - 30 }, len: 26, sc: 2, frames: 3, hold: 8, c: BLADE_R13, gc: '#c02030' }); PX13.spr(this, PXI.skull, { x: T.x, y: T.y - 36 }, { sc: 2, vy: -0.2, life: 34 }); K13.flash(this, '#ff1030', 0.3, 6); }
    yield* wait(16); } });
// 麻痺針：搶先，60% 麻痺 → 手腕一甩，三根發亮的細針射進對手，扎中的地方冒出黃色電花
redo13('t_dgNeedle', 't11_dgNeedle', { col: PXC.volt,
  *f(S, U, T) { const A = PX13.hand(this); Sound.sfx('tick'); PX13.spr(this, PXI.glintS, A, { life: 6 }); yield* wait(3);
    for (const [dx, dy] of [[-8, -4], [7, -7], [0, 5]]) { const P = { x: T.x + dx, y: T.y + dy }; PX13.line(this, A, P, ['#ffe040', '#ffffff', '#3a2a00'], 1, 9, { grow: 3, hold: 3 }); b13dot(this, P, '#ffe040'); yield* wait(2); }
    yield* wait(2); Sound.sfx('buzz'); zaps13(this, T, 4); PX13.burst(this, T, 10, S.col, 10, { n: 4 }); yield* wait(14); } });
// 千刃毒華：五段亂斬，最後引爆對手身上的中毒・麻痺・灼傷 → 短刀繞著對手連劃五道月牙，排成一朵五瓣的刀花；最後一刀時，對手身上的每一種異常各炸開一朵那個顏色的花
const BLOOM13 = ['#d060d8', '#ffe0fa', '#2a0626'], BLOOMST13 = { psn: PXC.venom, par: PXC.volt, brn: PXC.fire };
// a slash through P along direction ang: a shallow crescent (radius r) whose middle is P
const aSlash13 = (b, P, ang, col, blade, o = {}) => { const r = o.r || 26, nx = -Math.sin(ang), ny = Math.cos(ang), C = { x: P.x - nx * r, y: P.y - ny * r }, th = Math.atan2(ny, nx), sp = o.span || 1.5;
  return PX13.dSlash(b, C, r, th - sp / 2, th + sp / 2, col, Object.assign({ blade, w: 5 }, o)); };
const petal13 = (b, T, i, c) => { Sound.sfx('slash'); aSlash13(b, T, i * Math.PI / 5 + 0.3, c, PXC.steel, { r: 30, frames: 3, life: 24 }); };
redo13('t_dgBloom', 't11_dgBloom', { col: BLOOM13,
  *f(S, U, T, u) { yield* this.lunge(u, 22, 2); petal13(this, T, 0, S.col); yield* wait(4); },
  *h(S, U, T, u, i) { petal13(this, T, i, S.col); if (i < 4) { yield* wait(4); return; }
    yield* wait(5); const v = this.tgtV, L = Object.keys(BLOOMST13).filter(k => v && v.st && v.st[k]);
    if (!L.length) { PX13.hit(this, T, S.col, 0); yield* wait(10); return; }
    for (const k of L) { const c = BLOOMST13[k]; Sound.sfx(k === 'par' ? 'buzz' : k === 'brn' ? 'fire' : 'poison'); PX13.burst(this, T, 20, c, 14, { s: 3 }); PX13.bits(this, T, 10, [c[1], c[0], c[0]], 2.6, 0.08, 16, { s: 3 }); this.shake = Math.max(this.shake, 6); yield* wait(9); }
    yield* wait(6); } });
// 影縫：搶先，讓對手這回合不能行動 → 三把影刃飛出去插在對手的影子上，影子擴開，影線把牠縫在地上（對手變暗、不能動）
redo13('t_dgStitch', 't11_dgStitch', { col: PXC.shade,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), foot = v && v.foot ? v.foot : T.y + 24, A = PX13.hand(this); Sound.sfx('wind');
    this.spawn({ k: 'p13shadow', x: T.x, y: foot - 1, r0: 8, rx: 30, fl: 0.28, grow: 10, c: '#2a1844', o: '#0a0418', life: 48 });
    for (const dx of [-17, 0, 17]) { const P = { x: T.x + dx, y: foot - 10 }, p = this.spawn({ k: 'p13dagger', x: A.x, y: A.y, ang: Math.PI / 2, sc: 1.4, c: BLADE_S13, gc: '#8a5ad0', grip: '#3a2050', life: 48 }); p.upd = q => { const k = clamp(q.t / 5, 0, 1); q.x = lerp(A.x, P.x, k); q.y = lerp(A.y, P.y, k) - Math.sin(Math.PI * k) * 14; q.ang = k < 1 ? Math.atan2(P.y - A.y + 30 * (k - 0.5), P.x - A.x) : Math.PI / 2; }; Sound.sfx('tick'); yield* wait(2); }
    yield* wait(5); Sound.sfx('statDown');
    for (let i = 0; i < 2; i++) { const x0 = T.x - 8 + i * 16; PX13.line(this, { x: x0 - 4, y: foot - 4 }, { x: x0 + 4, y: foot + 2 }, ['#d0b0ff'], 1, 34, { thin: 1, grow: 2, keep: 1 }); PX13.line(this, { x: x0 + 4, y: foot - 4 }, { x: x0 - 4, y: foot + 2 }, ['#d0b0ff'], 1, 34, { thin: 1, grow: 2, keep: 1, delay: 2 }); }
    for (const dx of [-10, 0, 10]) this.spawn({ k: 'p13crack', pts: PX13.zig({ x: T.x + dx, y: foot - 2 }, { x: T.x + dx * 0.4, y: T.y - 6 }, 5, 3), c: '#a070e0', c2: '#3a2050', o: '#0a0418', grow: 6, life: 26, delay: 4 });
    K13.tint(v, '#2a1844', 0.6, 36); yield* wait(20); } });
// 月影雙牙：2 段；對 HP 一半以下的對手每段必定會心 → 夜色暗下、新月升起，短刀左右各劃一道月牙形的刀光（雙牙）；HP 一半以下時每一段都閃出金色的會心星光
const fang13px = (b, T, side, low) => { Sound.sfx('slash'); xSlash13(b, T, side, PXC.moon, ['#fff6c8', '#ffffff', '#1c1a3a'], { r: 28, w: 7, frames: 4, life: 18 });
  if (low) { Sound.sfx('crit'); PX13.spr(b, PXI.glint, { x: T.x - side * 6, y: T.y - 8 }, { sc: 2, life: 14, delay: 3 }); PX13.burst(b, T, 16, PXC.gold, 12, { s: 3, delay: 3 }); } else PX13.burst(b, T, 10, PXC.moon, 10, { delay: 3 }); b.shake = Math.max(b.shake, low ? 6 : 3); };
redo13('t_zjMoonFang', 't11_zjMoonFang', { col: PXC.moon,
  *f(S, U, T, u, t) { const v = tgt13(this, t), low = K13.low(v, 0.5); K13.dark(this, 0.5, 46, '#04061a'); Sound.sfx('charge'); PX13.spr(this, PXI.moon, { x: T.x + 30, y: T.y - 38 }, { sc: 2, life: 46 }); yield* wait(7);
    yield* this.lunge(u, 22, 2); fang13px(this, T, 1, low); yield* wait(9); },
  *h(S, U, T) { fang13px(this, T, -1, K13.low(this.tgtV, 0.5)); yield* wait(14); } });
// 特技・蛇吻：追擊，60% 中毒 → 上下兩把短刀像毒牙一樣咬合，牙洞噴出毒液和毒泡
redoSp13('短刀', 0, { col: PXC.venom,
  *f(S, U, T, u) { yield* this.lunge(u, 16, 2); Sound.sfx('slash');
    for (const s of [-1, 1]) { const A = { x: T.x + s * 3, y: T.y + s * 22 }, B = { x: T.x + s * 3, y: T.y + s * 2 }, p = this.spawn({ k: 'p13dagger', x: A.x, y: A.y, ang: s < 0 ? Math.PI / 2 : -Math.PI / 2, c: BLADE_V13, life: 14 }); p.upd = q => { const k = clamp(q.t / 3, 0, 1); q.x = lerp(A.x, B.x, k); q.y = lerp(A.y, B.y, k); }; }
    yield* wait(3); Sound.sfx('poison'); drip13(this, T, 7, 6); bubbles13(this, T, 2); spark13(this, T, S.col, 10); yield* wait(12); } });
// 特技・影襲：追擊，必定會心 → 主角化成影子消失、影子在對手面前現身一刺；金色的會心星光
redoSp13('短刀', 1, { col: PXC.shade,
  *f(S, U, T, u) { const H = PX13.hero(this); Sound.sfx('wind'); vanish13(this, 24); yield* wait(4); K13.ghost(this, T.x - H.x, T.y - H.y + 30, '#2a1844', 16, 0.6); yield* wait(4); Sound.sfx('crit');
    PX13.dStab(this, T, { from: { x: T.x + 26, y: T.y - 26 }, sc: 2, frames: 3, hold: 8, c: BLADE_S13, gc: '#8a5ad0' }); yield* wait(3); PX13.spr(this, PXI.glint, T, { sc: 2, life: 14 }); PX13.burst(this, T, 16, PXC.gold, 12, { s: 3 }); this.shake = Math.max(this.shake, 6); yield* wait(14); } });

// ---------- 長槍 ----------
// a thrust (the whole spear: shaft, head, red tassel) from the hero's hand into P; speed lines; a burst where it lands
const thrust13 = (b, P, o = {}) => { const A = o.from || PX13.hand(b); PX13.spear(b, A, P, o); PX13.speed(b, A, P, o.lines || PXC.wind, o.n || 4, 8); Sound.sfx(o.snd || 'slash'); };
// an armour plate (pixel sprite) in front of P, and the plate breaking in two
const plate13 = (b, P, d, life = 16) => PX13.spr(b, PXI.plate, { x: P.x - d.ux * 6, y: P.y - d.uy * 6 }, { life, blink: 0 });
const platePop13 = (b, P, d, pl) => { if (pl) pl.life = pl.t + 1; const C = { x: P.x - d.ux * 6, y: P.y - d.uy * 6 }; for (const s of [-1, 1]) PX13.spr(b, s < 0 ? PXI.plateL : PXI.plateR, { x: C.x + s * 4, y: C.y }, { vx: s * 1.3, vy: -1.2, g: 0.16, life: 20 });
  PX13.bits(b, C, 6, ['#ffffff', '#b0bccc', '#7a8498'], 2, 0.14, 14, { s: 3 }); };
// 普通攻擊：長槍一刺（整支槍）、短刀一刺（像素短刀，第二段也是）；顏色照武器屬性
{ const _wa = FX.wAtk; FX.wAtk = function* (U, T, u) { const k = this._thKind || '', c = WTH12[this._thT] || WTH12.steel, col = [c[0], c[1], OSH13];
    if (k === '長槍') { yield* this.lunge(u, 10, 2); thrust13(this, T, { over: 4, c: col }); yield* wait(5); PX13.burst(this, T, 9, col, 9); yield* wait(6); return; }
    if (k === '短刀') { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); PX13.dStab(this, T, { len: 22, sc: 1.4, frames: 2, hold: 5 }); yield* wait(2); spark13(this, T, col, 8); yield* wait(6); return; }
    return yield* _wa.call(this, U, T, u); }; }
{ const _sg = segSwing; segSwing = function* (b, s, C, i, kind) { if (kind !== '短刀') return yield* _sg(b, s, C, i, kind); const c = WTH12[b._thT] || WTH12.steel; yield* b.lunge(s, 6, 2); Sound.sfx('slash');
    const P = { x: C.x + [6, -6, 0][i % 3], y: C.y + [-4, 4, 0][i % 3] }; PX13.dStab(b, P, { len: 20, sc: 1.4, frames: 2, hold: 4 }); yield* wait(2); spark13(b, P, [c[0], c[1], OSH13], 7); yield* wait(4); }; }
// 穿甲刺：無視 30% 物防 → 對手面前一片護甲，槍頭刺穿護甲（護甲裂成兩半飛開），槍頭從對手背後透出來
redo13('t_spPierce', 't11_spPierce', { col: PXC.steel,
  *f(S, U, T, u) { const d = PX13.dir(PX13.hand(this), T), pl = plate13(this, T, d, 60); yield* this.lunge(u, 14, 2); thrust13(this, T, { over: 18, frames: 4, hold: 6 }); yield* wait(3);
    Sound.sfx('hitSuper'); platePop13(this, T, d, pl); PX13.burst(this, { x: T.x + d.ux * 16, y: T.y + d.uy * 16 }, 10, PXC.steel, 10, { delay: 2 }); PX13.hit(this, T, PXC.steel, 0); yield* wait(12); } });
// 疾突：搶先突刺，對手速度 −1 → 殘影和速度線、一記快刺；對手頭上兩個往下的藍色箭頭（速度下降）
redo13('t_spDash', 't11_spDash', { col: PXC.wind,
  *f(S, U, T, u, t) { Sound.sfx('wind'); for (let i = 1; i <= 3; i++) K13.ghost(this, 0, i * 6, '#9ae8ff', 6 + i * 2, 0.45 - i * 0.1); yield* this.lunge(u, 26, 2); thrust13(this, T, { frames: 3, hold: 3, n: 7 }); yield* wait(4);
    PX13.hit(this, T, PXC.steel, 0); Sound.sfx('statDown'); for (const dx of [-14, 14]) PX13.spr(this, PXI.dnCh('#3a8aff'), { x: T.x + dx, y: T.y - 30 }, { vy: 0.5, life: 22 }); yield* wait(14); } });
// 掃槍：橫掃全體，30% 退縮 → 槍尖帶著一道又寬又扁的弧，從左到右掃過整排魔物的腳下，經過的每一隻都揚起塵土
redo13('t_spSweep', 't11_spSweep', { col: PXC.steel,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t).sort((a, q) => a.P.x - q.P.x), C = { x: T.x, y: T.y + 14 }, R = Math.max(70, (L.length ? Math.max(...L.map(q => Math.abs(q.P.x - T.x))) : 0) + 22);
    yield* this.lunge(u, 12, 2); Sound.sfx('wind'); PX13.arc(this, C, R, Math.PI * 1.02, Math.PI * 1.98, PXC.wind, 5, 16, { fl: 0.32, grow: 8 });
    const sp = this.spawn({ k: 'p13spear', x: C.x - R, y: C.y, ang: -Math.PI / 2, len: 40, hl: 11, hw: 4, c: PXC.steel, shaft: PXC.wood, tuft: '#d02a2a', life: 10 }); sp.upd = q => { const an = Math.PI * (1.02 + 0.96 * clamp(q.t / 8, 0, 1)); q.x = C.x + Math.cos(an) * R; q.y = C.y + Math.sin(an) * R * 0.32; q.ang = an + Math.PI / 2; };
    let k = 0; for (let f = 0; f < 9; f++) { const an = Math.PI * (1.02 + 0.96 * f / 8), X = C.x + Math.cos(an) * R; while (k < L.length && L[k].P.x <= X + 4) { const P = L[k].P; Sound.sfx('hit'); PX13.hit(this, P, PXC.steel, 0); PX13.bits(this, { x: P.x, y: P.y + 20 }, 6, ['#d0b080', '#a08050', '#6a5030'], 1.6, 0.16, 16, { up: 1 }); k++; } yield; }
    yield* wait(10); } });
// 三段突：三段突刺，每段無視 30% 物防 → 上・中・下三下突刺，每一下都刺穿護甲片（碎屑噴出）
const tri13 = function* (b, T, i) { const off = [[-6, -10], [6, -1], [0, 8]][i % 3], P = { x: T.x + off[0], y: T.y + off[1] }, d = PX13.dir(PX13.hand(b), P); thrust13(b, P, { frames: 3, hold: 3, back: 3, over: 10 }); yield* wait(3);
  PX13.bits(b, P, 6, ['#ffffff', '#b0bccc', '#7a8498'], 2, 0.14, 14, { s: 3, ang: d.ang, spread: 0.7 }); PX13.burst(b, P, i === 2 ? 14 : 10, PXC.steel, 10, { s: i === 2 ? 3 : 2 }); };
redo13('t_spTriple', 't11_spTriple', { col: PXC.steel,
  *f(S, U, T, u) { yield* this.lunge(u, 16, 2); yield* tri13(this, T, 0); yield* wait(4); },
  *h(S, U, T, u, i) { yield* tri13(this, T, i); yield* wait(i === 2 ? 12 : 5); } });
// 破陣槍：削 1 格護盾；對蓄力中的對手威力 ×1.5 → 對手前面立著一排盾牆（陣），一記重刺把盾牆整個刺碎；對手正在蓄力時，牠身上聚的光被一起刺散（橘色的爆光）
redo13('t_spBreak', 't11_spBreak', { col: PXC.steel,
  *f(S, U, T, u, t) { const v = tgt13(this, t), chg = !!(v && v.st && v.st.charging), d = PX13.dir(PX13.hand(this), T);
    const pls = [-1, 0, 1].map(s => plate13(this, { x: T.x + d.nx * s * 15, y: T.y + d.ny * s * 15 }, d, 60));
    if (chg) for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; PX13.spr(this, PXI.glintS, { x: T.x + Math.cos(an) * 20, y: T.y + Math.sin(an) * 16 }, { life: 12 }); }
    yield* this.lunge(u, 18, 3); thrust13(this, T, { over: 10, frames: 4, hold: 6, hl: 14, hw: 5, len: 50 }); yield* wait(3); Sound.sfx('hitSuper');
    [-1, 0, 1].forEach((s, i) => platePop13(this, { x: T.x + d.nx * s * 15, y: T.y + d.ny * s * 15 }, d, pls[i])); PX13.hit(this, T, PXC.steel, 1);
    if (chg) { yield* wait(2); Sound.sfx('crit'); PX13.burst(this, T, 22, PXC.fire2, 14, { s: 3 }); K13.flash(this, '#ffb060', 0.3, 6); }
    yield* wait(12); } });
// 迴槍架勢：2 回合物防 +2，被攻擊時反擊（威力 50）→ 長槍在主角身前轉兩圈（槍的圓弧），然後斜架在身前；藍色的盾光和往上的箭頭（物防提升），槍尖亮起準備反擊
redo13('t_spGuard', 't11_spGuard', { col: PXC.steel,
  *f(S, U) { const H = PX13.hero(this), C = { x: H.x, y: H.y - 10 }; Sound.sfx('wind');
    const sp = this.spawn({ k: 'p13spear', x: C.x, y: C.y - 24, ang: -Math.PI / 2, len: 48, hl: 11, hw: 4, c: PXC.steel, shaft: PXC.wood, tuft: '#d02a2a', life: 34 });
    sp.upd = q => { const k = clamp(q.t / 16, 0, 1), an = -Math.PI / 2 + k * Math.PI * 4 + (k >= 1 ? 0.6 : 0); q.ang = an; q.x = C.x + Math.cos(an) * 24; q.y = C.y + Math.sin(an) * 24 * 0.6; };
    PX13.arc(this, C, 26, -Math.PI / 2, Math.PI * 1.5, PXC.wind, 3, 16, { fl: 0.6, grow: 8 }); yield* wait(8); PX13.arc(this, C, 26, -Math.PI / 2, Math.PI * 1.5, PXC.wind, 3, 14, { fl: 0.6, grow: 7 }); yield* wait(9);
    Sound.sfx('shield'); PX13.spr(this, PXI.shield, { x: H.x, y: H.y - 18 }, { sc: 2, life: 18 }); PX13.ring(this, { x: H.x, y: H.y + 16 }, 6, 30, PXC.blue, 2, 16, { fl: 0.35 });
    for (const dx of [-18, 18]) PX13.spr(this, PXI.upCh('#7ab8ff'), { x: H.x + dx, y: H.y }, { vy: -0.6, life: 20 }); yield* wait(4);
    PX13.spr(this, PXI.glint, { x: C.x + Math.cos(-Math.PI / 2 + 0.6) * 24 + 8, y: C.y + Math.sin(-Math.PI / 2 + 0.6) * 14 - 4 }, { life: 14 }); yield* wait(10); } });
// 千重突：六段突刺 → 好幾支槍的殘影同時刺出、速度線密密麻麻，每一段都刺在不同位置
const many13 = function* (b, T, i, n = 2) { for (let k = 0; k < n; k++) { const P = { x: T.x + rnd(-10, 10), y: T.y + rnd(-10, 8) }, A = PX13.hand(b); PX13.spear(b, { x: A.x + rnd(-8, 8), y: A.y + rnd(-2, 4) }, P, { frames: 3, hold: 2, back: 3, over: 6, tuft: k ? null : '#d02a2a' }); }
  Sound.sfx('slash'); yield* wait(3); PX13.burst(b, T, i === 5 ? 16 : 9, PXC.steel, 10, { s: i === 5 ? 3 : 2 }); if (i === 5) PX13.hit(b, T, PXC.steel, 1); };
redo13('t_spThousand', 't11_spThousand', { col: PXC.steel,
  *f(S, U, T, u) { PX13.speed(this, U, T, PXC.wind, 10, 14); yield* this.lunge(u, 18, 2); yield* many13(this, T, 0, 3); yield* wait(2); },
  *h(S, U, T, u, i) { PX13.speed(this, PX13.hero(this), T, PXC.wind, 3, 6); yield* many13(this, T, i, 2); yield* wait(i === 5 ? 12 : 2); } });
// 螺旋貫：無視 50% 物防；對破防中的對手再 +30% → 槍身捲著兩股螺旋氣流鑽過去，從對手背後貫穿出去（螺旋碎屑甩出）；對手破防中時再一圈金色爆光
Object.assign(HERO_PK, { p13helix(x, p, a) { const d = p.d, Hd = { x: p.hx(), y: p.hy() }, L = Math.hypot(Hd.x - p.x1, Hd.y - p.y1); if (L < 4) return; if (a < 0.25 && p.t % 2) return; const n = Math.max(6, Math.round(L / 2));
    for (const pass of [0, 1]) for (const ph of [0, Math.PI]) { let q0 = null; for (let i = 0; i <= n; i++) { const u = i / n, th = u * L / 7 - p.t * 0.8 + ph, w = Math.sin(th) * 7 * Math.min(1, u * 3), X = p.x1 + (Hd.x - p.x1) * u + d.nx * w, Y = p.y1 + (Hd.y - p.y1) * u + d.ny * w, front = Math.cos(th) > 0;
      if (q0) { if (pass === 0) PXF.line(x, q0[0], q0[1], X, Y, OSH13, 4); else PXF.line(x, q0[0], q0[1], X, Y, front ? p.c[1] : p.c[0], 2); } q0 = [X, Y]; } } } });
redo13('t_spSpiral', 't11_spSpiral', { col: PXC.azure,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), brk = K13.broken(v), A = PX13.hand(this), d = PX13.dir(A, T); yield* this.lunge(u, 18, 3); Sound.sfx('wind');
    const sp = PX13.spear(this, A, T, { over: 26, frames: 7, hold: 8, back: 4, hl: 13, hw: 5, len: 50, c: PXC.steel }); this.spawn({ k: 'p13helix', x1: A.x, y1: A.y, d, c, hx: () => sp.x, hy: () => sp.y, life: 18 });
    yield* wait(5); Sound.sfx('hitSuper'); PX13.hit(this, T, c, 1); for (let i = 0; i < 10; i++) { const an = d.ang + Math.PI / 2 * (i % 2 ? 1 : -1) + rnd(-4, 4) / 10, vv = 1.6 + Math.random(); this.spawn({ k: 'p13px', x: T.x, y: T.y, vx: Math.cos(an) * vv + d.ux * 1.2, vy: Math.sin(an) * vv + d.uy * 1.2, g: 0.08, s: 2, cols: [c[1], c[0], '#7a88a8'], o: OSH13, life: 16 }); }
    PX13.burst(this, { x: T.x + d.ux * 22, y: T.y + d.uy * 22 }, 10, c, 10); if (brk) { yield* wait(3); Sound.sfx('crit'); PX13.burst(this, T, 22, PXC.gold, 14, { s: 3 }); }
    yield* wait(12); } });
// 蒼龍躍・流星龍墜：跳到空中（大部分攻擊打不到），下一次行動落下 → 蓄力那一回合，主角真的跳出畫面上方、一直待在空中；落下時從天而降
const JUMP13 = new Set(['t_zjAzure', 't_zjMeteor']);
function* leap13(b) { const v = b.H; if (!v || !v.off) return; Sound.sfx('jump'); PX13.ring(b, { x: PX13.hero(b).x, y: HERO_FOOT - 2 }, 4, 26, PXC.wind, 2, 14, { fl: 0.3 }); PX13.bits(b, { x: PX13.hero(b).x, y: HERO_FOOT - 2 }, 8, ['#d0b080', '#a08050'], 1.6, 0.14, 14, { up: 1 });
  for (let i = 1; i <= 3; i++) K13.ghost(b, 0, -i * 16, '#9ae8ff', 6 + i * 3, 0.4); v.air13 = 1; v.airT13 = 0; v.drop13 = 1; yield* tween(8, q => { v.off.y = -170 * q * q; }); v.drop13 = 0;
  for (let i = 0; i < 5; i++) PX13.line(b, { x: PX13.hero(b).x - 8 + i * 4, y: 40 + i * 8 }, { x: PX13.hero(b).x - 8 + i * 4, y: 10 + i * 8 }, ['#bfe8ff'], 1, 8, { thin: 1, grow: 2, delay: i }); yield* wait(6); }
// the drop: the hero comes back down (from the top) while the spear dives — runs by itself (a particle drives it)
HERO_PK.p13nil = () => {};
function dropAnim13(b, frames = 6) { const v = b.H; if (!v || !v.off) return; v.drop13 = 1; v.off.y = -170; const end = () => { v.off.y = 0; v.air13 = 0; v.drop13 = 0; };
  b.spawn({ k: 'p13nil', life: frames + 3, upd: q => { const k = clamp(q.t / frames, 0, 1); if (v.drop13) v.off.y = -170 * (1 - k * k); if (k >= 1 && v.drop13) end(); } }); return end; }
{ const H = Battle.prototype.handlers, _ch = H.CHARGE; H.CHARGE = function* (e, s, t, P) { this.leap13 = !!(s && s.hero && JUMP13.has(P.skill)); try { yield* _ch.call(this, e, s, t, P); } finally { this.leap13 = false; } };
  const _fc = FX.charge; FX.charge = function* (U, ...a) { if (this.leap13) { this.leap13 = false; yield* leap13(this); return; } yield* _fc.call(this, U, ...a); };
  const _sg = H.statusGone; H.statusGone = function* (e, s, t, P, ex) { if (t && t.hero && P.status === 'airborne' && t.air13) { if (P.why === 'release') { t.air13 = 3; t.airT13 = 0; } else { t.air13 = 0; t.off.y = 0; } } yield* _sg.call(this, e, s, t, P, ex); };
  const _up = Battle.prototype.update; Battle.prototype.update = function () { _up.call(this); const v = this.H; if (!v || !v.air13 || !v.off || v.drop13) return; v.airT13 = (v.airT13 || 0) + 1; if (v.air13 === 1 && v.st && v.st.airborne) v.air13 = 2;
    v.off.y = -170; if ((v.air13 === 1 && v.airT13 > 300) || (v.air13 === 3 && v.airT13 > 120)) { v.air13 = 0; v.off.y = 0; } }; }
// 蒼龍躍（落下）：一道蒼藍的流光帶著長槍從天而降刺進對手，落點的地面炸開一圈衝擊波和碎石，兩道龍爪般的藍色弧光
redo13('t_zjAzure', 't11_zjAzure', { col: PXC.azure,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), foot = v && v.foot ? v.foot : T.y + 24, A = { x: T.x + 6, y: -30 }; Sound.sfx('wind');
    for (let i = 0; i < 3; i++) PX13.line(this, { x: T.x + 6 + (i - 1) * 5, y: -20 }, { x: T.x + (i - 1) * 3, y: T.y - 10 }, c, i === 1 ? 3 : 1, 14, { grow: 5, hold: 6, delay: i }); const sp = PX13.spear(this, A, { x: T.x, y: T.y }, { frames: 6, hold: 10, back: 1, over: 4, hl: 15, hw: 5, len: 54, c: PXC.steel });
    const dr = dropAnim13(this, 8); yield* wait(6); Sound.sfx('quake'); this.shake = Math.max(this.shake, 12); K13.flash(this, '#d8ecff', 0.35, 6); PX13.hit(this, T, c, 1);
    PX13.ring(this, { x: T.x, y: foot }, 6, 46, c, 2, 18, { fl: 0.3 }); PX13.ring(this, { x: T.x, y: foot }, 4, 30, PXC.wind, 1, 14, { fl: 0.3, delay: 3 });
    for (const s of [-1, 1]) PX13.arc(this, { x: T.x + s * 6, y: T.y - 4 }, 24, s > 0 ? -Math.PI * 0.75 : -Math.PI * 0.25, s > 0 ? Math.PI * 0.1 : Math.PI * 0.9, c, 4, 16, { grow: 4 });
    for (let i = 0; i < 6; i++) PX13.spr(this, PXI.rock, { x: T.x + rnd(-14, 14), y: foot - 2 }, { vx: rnd(-16, 16) / 10, vy: -rnd(16, 30) / 10, g: 0.16, life: 24 });
    yield* wait(12); if (dr) dr(); } });
// 流星龍墜（落下）：打全體——天上落下好幾顆蒼藍的流星（每一隻魔物都被砸到），最後主角帶著長槍化成最大的一顆砸在正中間
redo13('t_zjMeteor', 't11_zjMeteor', { col: PXC.azure,
  *f(S, U, T, u, t) { const c = S.col, L = PX13.foes(this, t); K13.dark(this, 0.35, 60, '#040a1a'); Sound.sfx('charge');
    for (const { v, P } of L) { const A = { x: P.x - 40 + rnd(-6, 6), y: -20 }; const p = this.spawn({ k: 'p13orb', x: A.x, y: A.y, r: 6, c: [OSH13, c[0], c[1], '#ffffff'], trail: 12, life: 10 }); p.upd = q => { const k = clamp(q.t / 8, 0, 1); q.x = lerp(A.x, P.x, k); q.y = lerp(A.y, P.y, k); };
      yield* wait(8); Sound.sfx('rock'); PX13.hit(this, P, c, 0); PX13.ring(this, { x: P.x, y: (v.foot || P.y + 24) }, 4, 26, c, 2, 14, { fl: 0.3 }); for (let i = 0; i < 3; i++) PX13.spr(this, PXI.rock, { x: P.x + rnd(-10, 10), y: (v.foot || P.y + 24) - 2 }, { vx: rnd(-14, 14) / 10, vy: -rnd(12, 24) / 10, g: 0.16, life: 20 }); yield* wait(2); }
    const A = { x: T.x - 30, y: -30 }; Sound.sfx('wind'); PX13.spear(this, A, T, { frames: 7, hold: 10, back: 1, over: 2, hl: 15, hw: 5, len: 54 }); const p = this.spawn({ k: 'p13orb', x: A.x, y: A.y, r: 7, c: [OSH13, c[0], c[1], '#ffffff'], trail: 10, pulse: 1, life: 10 });
    p.upd = q => { const k = clamp(q.t / 7, 0, 1); q.x = lerp(A.x, T.x, k); q.y = lerp(A.y, T.y, k); }; const dr = dropAnim13(this, 9); yield* wait(7);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 14); K13.flash(this, '#d8ecff', 0.4, 8); PX13.burst(this, T, 26, c, 16, { s: 3 }); PX13.ring(this, { x: T.x, y: T.y + 24 }, 8, 80, c, 2, 20, { fl: 0.3 }); for (const { P } of L) PX13.hit(this, P, c, 1);
    yield* wait(14); if (dr) dr(); } });
// 特技・貫心：追擊，無視物防 → 一槍直直穿過對手，槍頭從背後透出、帶出一道紅光
redoSp13('長槍', 0, { col: PXC.red,
  *f(S, U, T, u) { const A = PX13.hand(this), d = PX13.dir(A, T); yield* this.lunge(u, 14, 2); thrust13(this, T, { over: 26, frames: 4, hold: 6 }); yield* wait(3); Sound.sfx('crit');
    PX13.line(this, T, { x: T.x + d.ux * 34, y: T.y + d.uy * 34 }, S.col, 2, 12, { grow: 3, hold: 4 }); PX13.burst(this, T, 14, S.col, 12, { s: 3 }); PX13.bits(this, { x: T.x + d.ux * 14, y: T.y + d.uy * 14 }, 8, ['#ffe0c0', '#ff3a2a', '#7a0a0a'], 2, 0.1, 14, { ang: d.ang, spread: 0.5 }); yield* wait(12); } });
// 特技・旋槍：追擊全體 → 長槍像風車一樣轉著從左飛到右，經過每一隻都打一下
redoSp13('長槍', 1, { col: PXC.steel,
  *f(S, U, T, u, t) { const L = PX13.foes(this, t).sort((a, q) => a.P.x - q.P.x), y0 = T.y; Sound.sfx('wind');
    const sp = this.spawn({ k: 'p13spear', x: -20, y: y0, ang: 0, len: 44, hl: 11, hw: 4, c: PXC.steel, shaft: PXC.wood, tuft: '#d02a2a', life: 22 }); let k = 0;
    sp.upd = q => { const X = lerp(-20, W + 30, q.t / 20), an = q.t * 0.9; q.ang = an; q.x = X + Math.cos(an) * 22; q.y = y0 + Math.sin(an) * 22; q.cx = X; };
    for (let f = 0; f < 21; f++) { const X = lerp(-20, W + 30, f / 20); if (f % 2) PX13.arc(this, { x: X, y: y0 }, 22, f * 0.9 - 1.2, f * 0.9, PXC.wind, 2, 6, { grow: 1 }); while (k < L.length && L[k].P.x <= X) { Sound.sfx('slash'); PX13.hit(this, L[k].P, PXC.steel, 0); k++; } yield; }
    yield* wait(8); } });
// 特技・凝息：下一次攻擊必定會心 → 主角吐出幾口白氣，槍尖亮起兩下金色的閃光，一圈金光往槍尖收攏
redoSp13('長槍', 2, { col: PXC.gold,
  *f(S) { const H = PX13.hero(this), A = { x: H.x + 12, y: H.y - 40 }; Sound.sfx('wind'); for (let i = 0; i < 3; i++) PX13.bits(this, { x: H.x - 2, y: H.y - 22 }, 3, ['#ffffff', '#d8ecff', '#a8c0e0'], 0.6, -0.02, 18, { s: 3, ang: -Math.PI / 2, spread: 0.7 });
    yield* wait(8); this.spawn({ k: 'p13spear', x: A.x, y: A.y, ang: -Math.PI / 2 + 0.3, len: 44, hl: 11, hw: 4, c: PXC.steel, shaft: PXC.wood, tuft: '#d02a2a', life: 30 });
    Sound.sfx('tick'); PX13.ring(this, A, 26, 2, S.col, 2, 14); yield* wait(8); Sound.sfx('crit'); PX13.spr(this, PXI.glint, A, { sc: 2, life: 10 }); yield* wait(8); PX13.spr(this, PXI.glint, A, { sc: 3, life: 12 }); yield* wait(12); } });

// ---------- 拳套 ----------
const PALM13 = PXS(['..k.k.k.k..', '.kykykykyk.', '.kykykykyk.', '.kykykykyk.', 'kkyyyyyyyk.', 'kyyyyyyyyk.', '.kkyyyyyyk.', '..kyyyyyyk.', '..kyyyyyk..', '...kkkkk...'], { y: '#ffcc33' });
// 透勁：無視 40% 物防，50% 退縮 → 像素拳頭打在對手面前的護甲上：護甲沒碎，震波卻穿過去，從對手背後一圈一圈擴出去（拳頭的殘影也從背後透出），對手被震得往後一晃
redo13('t_fsThrough', 't11_fsThrough', { col: PXC.chi,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), A = PX13.hand(this), d = PX13.dir(A, T), P0 = { x: T.x - d.ux * 12, y: T.y - d.uy * 12 }; plate13(this, T, d, 40);
    yield* this.lunge(u, 24, 2); Sound.sfx('heavy'); const f = PX13.spr(this, PXI.fist, A, { sc: 2, life: 14 }); f.upd = q => { const k = clamp(q.t / 4, 0, 1); q.x = lerp(A.x, P0.x, k); q.y = lerp(A.y, P0.y, k); }; yield* wait(4);
    PX13.burst(this, P0, 10, c, 9, { n: 4 }); this.shake = Math.max(this.shake, 5); yield* wait(3); Sound.sfx('quake');
    for (let k = 0; k < 3; k++) { const P = { x: T.x + d.ux * (8 + k * 10), y: T.y + d.uy * (8 + k * 10) }; PX13.ring(this, P, 3 + k * 2, 12 + k * 6, c, 2, 12, { fl: 0.55, delay: k * 2 }); }
    const g = PX13.spr(this, PXI.fist, T, { sc: 2, al: 0.55, life: 12, delay: 2 }); g.upd = q => { const k = clamp((q.t - 2) / 8, 0, 1); q.x = T.x + d.ux * 30 * k; q.y = T.y + d.uy * 30 * k; };
    if (v && v.off) { const o = v.off; yield* tween(3, q => { o.x = d.ux * 5 * q; o.y = d.uy * 5 * q; }); yield* tween(6, q => { o.x = d.ux * 5 * (1 - q); o.y = d.uy * 5 * (1 - q); }); o.x = 0; o.y = 0; }
    PX13.bits(this, { x: T.x + d.ux * 20, y: T.y + d.uy * 20 }, 8, [c[1], c[0], '#c07010'], 2, 0.06, 14, { ang: d.ang, spread: 0.6 }); yield* wait(10); } });
// 裂地神掌：必定會心；氣滿時威力再 +50% → 畫面暗下、金色的氣聚到掌心，主角一掌拍進地面：一道發光的裂縫沿著地面爬到對手腳下，地面炸開——裂縫往四面散開、噴出金色氣柱和石塊、會心的金色大星；氣滿時正中間再衝起一道最粗的氣柱、畫面一閃
redo13('t_zjQuake', 't11_zjQuake', { col: PXC.chi,
  *f(S, U, T, u, t) { const c = S.col, v = tgt13(this, t), hu = this.core.byId.H, full = !!(hu && hu.max && hu.max.chi && (hu.res.chi || 0) >= hu.max.chi), H = PX13.hero(this), foot = v && v.foot ? v.foot : T.y + 24, A = PX13.hand(this);
    K13.dark(this, 0.5, 64, '#140a00'); Sound.sfx('charge'); for (let i = 0; i < 14; i++) { const an = i * Math.PI / 7, P0 = { x: A.x + Math.cos(an) * 26, y: A.y + Math.sin(an) * 20 }, p = this.spawn({ k: 'p13px', x: P0.x, y: P0.y, s: 2, cols: [c[1], c[0]], o: OSH13, life: 12 }); p.upd = q => { const k = clamp(q.t / 10, 0, 1); q.x = lerp(P0.x, A.x, k); q.y = lerp(P0.y, A.y, k); }; }
    yield* wait(10); PX13.spr(this, PXI.glint, A, { sc: 2, life: 10 }); yield* this.lunge(u, 10, 2); Sound.sfx('heavy');
    const G0 = { x: H.x + 4, y: HERO_FOOT - 18 }; PX13.burst(this, G0, 12, c, 10, { n: 4 }); PX13.ring(this, G0, 3, 20, c, 2, 12, { fl: 0.3 }); this.shake = Math.max(this.shake, 6);
    PX13.spr(this, PALM13, G0, { sc: 2, life: 40 }); this.spawn({ k: 'p13crack', pts: PX13.zig(G0, { x: T.x, y: foot }, 9, 4), c: '#ffcc33', c2: '#ff8a1e', s: 2, grow: 9, life: 50 }); Sound.sfx('rock'); yield* wait(9);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 16); K13.flash(this, '#fff0c0', 0.4, 8);
    for (let i = 0; i < 6; i++) { const an = Math.PI * (0.05 + i * 0.18) + (i % 2 ? 0 : Math.PI), R = 26 + rnd(0, 12); this.spawn({ k: 'p13crack', pts: PX13.zig({ x: T.x, y: foot }, { x: T.x + Math.cos(an) * R, y: foot + Math.sin(an) * R * 0.3 }, 4, 3), c: '#ffcc33', c2: '#ff8a1e', s: 2, grow: 4, life: 40 }); }
    for (const dx of [-16, 0, 16]) this.spawn({ k: 'p13col', x: T.x + dx, y: foot, w: dx ? 5 : 8, h: dx ? 60 : 90, c, grow: 4, life: 20, delay: dx ? 2 : 0 });
    for (let i = 0; i < 8; i++) PX13.spr(this, PXI.rock, { x: T.x + rnd(-18, 18), y: foot - 2 }, { vx: rnd(-20, 20) / 10, vy: -rnd(18, 36) / 10, g: 0.16, life: 28 });
    PX13.ring(this, { x: T.x, y: foot }, 8, 70, c, 2, 20, { fl: 0.3 }); Sound.sfx('crit'); PX13.burst(this, T, 24, PXC.gold, 16, { s: 3 }); PX13.spr(this, PXI.glint, { x: T.x + 12, y: T.y - 14 }, { sc: 3, life: 18 });
    if (full) { yield* wait(5); this.spawn({ k: 'p13col', x: T.x, y: foot, w: 18, h: 220, c: ['#fff6c0', '#ffffff', '#3a2800'], grow: 3, life: 22 }); K13.flash(this, '#ffffff', 0.5, 8); }
    yield* wait(16); } });

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
// 盾反：2 回合內，格擋成功時反擊（威力 60）→ 盾牌立在面前，兩道金色的弧光繞著盾牌轉一圈（擋下、轉回去），盾緣閃出金光
redo13('t_osCounter', 't11_osCounter', { col: PXC.gold,
  *f(S) { const H = PX13.hero(this), P = { x: H.x, y: H.y - 20 }; Sound.sfx('shield'); PX13.spr(this, PXI.shield, P, { sc: 2, life: 30, blink: 0 }); yield* wait(4);
    Sound.sfx('wind'); for (const s of [0, Math.PI]) PX13.arc(this, P, 22, s - Math.PI / 2, s + Math.PI * 0.9, PXC.gold, 3, 18, { fl: 0.85, grow: 8 }); yield* wait(10);
    Sound.sfx('crit'); for (const [dx, dy] of [[-12, -14], [12, -14], [0, 14]]) PX13.spr(this, PXI.glint, { x: P.x + dx, y: P.y + dy }, { life: 12 }); PX13.burst(this, P, 14, PXC.gold, 10, { n: 4 }); yield* wait(14); } });
