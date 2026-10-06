/* ===================== v12.73 奧義：每棵開放中的技能樹多第五段（Lv55，要先把前一段任一招練到 5 級） =====================
   玩家 2026-10-07：「技能沒有新的嗎？」→ 等級上限開到 60，開放中的 10 棵樹（劍・短刀・斧・長槍・拳套・法杖・雙刀・雙劍・雙盾・單手盾）各一招奧義。
   特效照招式的動作畫（玩家：「名字有月不一定要有月亮，但招式的動作要符合特效」）：每招的註解寫它畫了什麼。 */
POS_LV11[5] = 55; // MP: 技能樹的 MP 在 s3_mp 載入時已經 ×2〜2.5，這裡直接寫最後的數字（絕技大約 20〜32）
const OG14 = {
  劍: ['5a', 'ogSword', '破曉千斬', 40, 0, 6, 34, 0, '五段快斬（各 40），再一記收尾斬（威力 130）；會心率 +30%。',
    { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }], effects: [{ type: 'damage' }].concat([1, 2, 3, 4].map(() => ({ type: 'damage', cond: { tgtAlive: 1 } })), [{ type: 'damage', power: 130, cond: { tgtAlive: 1 } }]) }],
  短刀: ['5a', 'ogDagger', '影葬連刃', 26, 4, 6, 30, 0, '搶先；4 段快斬（各 26）。對手有異常狀態時多 3 段，有能力下降時再多 3 段（最多 10 段）。',
    { prio: 1, hitsOf: (core, u, cmd) => { const t = core.byId[(cmd.tg || cmd.targets || [])[0]]; if (!t) return 4; const deb = t.statuses.some(s => DEF.statuses[s.id] && DEF.statuses[s.id].group === 'stage' && s.stacks < 0) || t.statuses.some(s => s.id === 'crack11'); return 4 + (core.majorOf(t) ? 3 : 0) + (deb ? 3 : 0); } }],
  斧: ['5a', 'ogAxe', '天崩地裂', 150, 0, 7, 38, 1, '蓄力 1 回合，把斧頭砸進地面打全體；對破防中的對手威力 ×1.5，30% 退縮。', { charge: 1, cls: 'strike', mods: [MUL11(1.5, { tgtStatus: 'broken' })], effects: DMG11(FL11(0.3)) }],
  長槍: ['5a', 'ogSpear', '貫日神槍', 130, 0, 6, 34, 1, '化成一道光貫穿全部魔物，無視 60% 物防。', { cls: 'pierce', pierceDef: 0.6 }],
  拳套: ['5a', 'ogFist', '百烈崩拳', 18, 10, 6, 32, 0, '十段連打（各 18），無視 30% 物防，每段 10% 退縮。', { cls: 'strike', pierceDef: 0.3, effects: DMG11(FL11(0.1)) }],
  法杖: ['5a', 'ogStaff', '元素終焉', 50, 0, 7, 40, 1, '火、水、雷、草四道魔法依序打全體（各 50）。', { cls: 'bolt', effects: ['火', '水', '雷', '草'].map(el => ({ type: 'damage', el, cond: { tgtAlive: 1 } })) }],
  雙刀: ['5a', 'ogDual', '幻影千迴', 30, 4, 6, 34, 1, '殘影在魔物之間穿梭，打全體 4 段（各 30），每段 15% 中毒。', { effects: DMG11(STA11('psn', 0.15)) }],
  雙劍: ['5a', 'ogTwin', '雙龍十字', 110, 2, 6, 34, 0, '兩道巨大的十字斬（各 110），會心率 +30%，對護盾傷害 ×2。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }] }],
  雙盾: ['5a', 'ogWall', '聖域壁壘', 0, 0, 7, 30, 0, '張開聖盾 3 回合（最大 HP 40%、吸收 75%）；這段時間被攻擊就反擊（威力 50）。',
    { effects: [{ type: 'ward12', target: 'self', pct: 0.4, abs: 0.75, turns: 3, why: 'holy' }, { type: 'status', target: 'self', status: 'ogCounter14', dur: 3 }] }],
  單手盾: ['5a', 'ogShield', '鐵壁衝陣', 80, 0, 6, 30, 1, '舉盾衝撞全部魔物（攻擊力加上物防的 70%），40% 退縮；這回合受到的傷害 −50%。',
    { cls: 'strike', mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'osBash13' } }], effects: DMG11(FL11(0.4)), after: [{ type: 'status', target: 'self', status: 'osHold13' }] }],
};
ST11('ogCounter14', '聖域反擊', { triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 50 }, why: 'og14' }] }] });
if (typeof BUFF12 !== 'undefined') BUFF12.ogCounter14 = { n: '聖域反擊', k: 'def', tip: '被攻擊就反擊' };
// build only the new rows (the older ones were already built and patched by later files)
for (const k in OG14) { const T = TREE11[k]; if (!T) { bvErr('og14', 'tree ' + k); continue; } const old = T.sk; T.sk = [OG14[k]]; try { sk11Build(k); } finally { T.sk = old.concat([OG14[k]]); } }
if (DEF.skills.t_ogTwin) DEF.skills.t_ogTwin.wardX = 2;
// 第五段要先把前一段（沒有第三段的樹：第二段）任一招練到 5 級
{ const _tn = treeNodes11; treeNodes11 = function (kind) { const L = _tn(kind), T = TREE11[kind]; if (T.common) return L;
    const tiers = [3, 2, 1].filter(n => (T.sk || []).some(s => s[0][0] === String(n))), pt = tiers[0];
    for (const N of L) if (N.t === 'sk' && N.pos && N.pos[0] === '5') { N.pre5 = T.sk.filter(s => s[0][0] === String(pt)).map(s => 't_' + s[1]); N.pre5t = pt; } return L; }; }
{ const _ns = nodeState11; nodeState11 = function (kind, N, st = Game.st) { const r = _ns(kind, N, st); if (!r.ok || !N.pre5) return r;
    if (!N.pre5.some(k => trLv11(k, st) >= 5)) return { ok: false, why: '要先把第' + '一二三'[N.pre5t - 1] + '段任一招練到 5 級' }; return r; }; }

/* ---------- 特效 ---------- */
const OGC14 = { dawn: ['#ffd860', '#fffbe0', '#3a2806'], shade: ['#9a6ae0', '#f4e8ff', '#12061e'], earth: ['#d08a3a', '#fff0c0', '#2a1406'], sun: ['#ffe890', '#ffffff', '#3a2a00'],
  chi: PXC.chi, dragon: ['#80d8ff', '#ffffff', '#06203a'], holy: ['#ffe070', '#ffffff', '#4a3200'], wall: PXC.blue };
const ogFoes14 = (b, t) => { const L = PX13.foes(b, t); if (L.length) return L; const v = b.tgtV; return v ? [{ v, P: b.center(v) }] : []; };
const ogFoot14 = (v, P) => (v && v.foot) || P.y + 24;
// 破曉千斬：五段快斬，再一記收尾斬 → 金色的月牙刀光一刀接一刀、角度一直換（越來越快）；最後畫面一亮，一道又大又粗的金色弧光從右上斬到左下
redo13('t_ogSword', 't11_ogSword', { col: OGC14.dawn,
  *f(S, U, T, u) { Sound.sfx('charge'); PX13.spr(this, PXI.glint, PX13.hand(this), { life: 10, sc: 2 }); yield* wait(4); yield* this.lunge(u, 18, 2);
    for (let i = 0; i < 5; i++) { Sound.sfx('slash'); qSlash13(this, T, [-0.6, 0.7, -1.2, 1.4, -0.2][i], i % 2 ? PXC.blade : S.col, { r: 22 + i * 2 }); PX13.burst(this, T, 8, S.col, 7, { n: 'x' }); this.shake = Math.max(this.shake, 2); yield* wait(i < 2 ? 4 : 3); }
    yield* wait(3); K13.flash(this, '#fff6c0', 0.45, 6); Sound.sfx('crit'); cSlash13(this, { x: T.x + 30, y: T.y - 30 }, 52, Math.PI * 0.62, Math.PI * 1.02, S.col, { w: 9, frames: 3, life: 18 });
    yield* wait(3); PX13.hit(this, T, S.col, 1); PX13.ring(this, T, 6, 40, S.col, 2, 16); this.shake = Math.max(this.shake, 10); yield* wait(10); } });
// 影葬連刃：搶先、段數會變多 → 主角化成影子消失（紫黑色的煙），對手四周一刀刀紫色月牙從不同方向劃過，最後一記交叉刀痕、影子炸開
redo13('t_ogDagger', 't11_ogDagger', { col: OGC14.shade,
  *f(S, U, T, u, t) { const v = K13.views(this, t)[0] || this.tgtV, tu = v && this.core.byId[v.id], hu = this.core.byId.H; try { this.og14n = tu && hu ? OG14.短刀[9].hitsOf(this.core, hu, { tg: [tu.id] }) : 4; } catch (e) { this.og14n = 4; }
    K13.dark(this, 0.35, 50, '#0a0418'); vanish13(this, 18); Sound.sfx('wind'); yield* wait(4); Sound.sfx('slash'); qSlash13(this, T, 0.9, S.col); PX13.burst(this, T, 8, S.col, 7, { n: 'x' }); yield* wait(3); },
  *h(S, U, T, u, i) { const last = i >= (this.og14n || 4) - 1; Sound.sfx('slash');
    if (!last) { const an = i * 2.4; qSlash13(this, { x: T.x + Math.cos(an) * 6, y: T.y + Math.sin(an) * 4 }, an, i % 2 ? S.col : PXC.blade, { r: 20 }); PX13.bits(this, T, 2, ['#3a1a4a', '#6a3a8a'], 1.2, -0.02, 10, { s: 2 }); yield* wait(2); return; }
    xSlash13(this, T, 1, S.col, { r: 26 }); xSlash13(this, T, -1, S.col, { r: 26, delay: 2 }); yield* wait(4); Sound.sfx('crit'); PX13.hit(this, T, S.col, 1); PX13.bits(this, T, 10, ['#3a1a4a', '#6a3a8a', '#1a0a24'], 2, -0.03, 16, { s: 3 }); yield* wait(10); } });
// 天崩地裂：蓄力後把斧頭砸進地面打全體 → 一道巨大的斧刃弧光從頭頂往下劈到地上，畫面大震；地面裂出發光的裂痕，一路裂到每一隻魔物腳下，魔物腳邊碎石噴起
redo13('t_ogAxe', 't11_ogAxe', { col: OGC14.earth,
  *f(S, U, T, u, t) { const L = ogFoes14(this, t), G = { x: T.x, y: Math.max(...L.map(q => ogFoot14(q.v, q.P))) + 6 }; yield* this.lunge(u, 24, 3); Sound.sfx('wind');
    cSlash13(this, { x: G.x - 30, y: G.y - 40 }, 50, -Math.PI * 0.45, Math.PI * 0.1, S.col, { w: 10, frames: 3, life: 16 }); yield* wait(4);
    Sound.sfx('quake'); this.shake = Math.max(this.shake, 18); K13.flash(this, '#fff0c0', 0.4, 6); PX13.burst(this, G, 22, S.col, 14, { s: 3 }); PX13.ring(this, G, 6, 90, S.col, 2, 22, { fl: 0.28 });
    for (const { v, P } of L) { const F = { x: P.x, y: ogFoot14(v, P) }; this.spawn({ k: 'p13crack', pts: PX13.zig(G, F, 8, 4), c: '#ffd070', c2: '#a05a10', s: 2, grow: 6, life: 28 }); }
    yield* wait(6); for (const { v, P } of L) { const F = { x: P.x, y: ogFoot14(v, P) }; Sound.sfx('rock'); PX13.hit(this, P, S.col, 1); for (let i = 0; i < 3; i++) PX13.spr(this, PXI.rock, { x: F.x + rnd(-10, 10), y: F.y - 2 }, { vx: rnd(-14, 14) / 10, vy: -rnd(14, 26) / 10, g: 0.16, life: 22 }); yield* wait(2); }
    yield* wait(10); } });
// 貫日神槍：化成一道光貫穿全部魔物，無視 60% 物防 → 槍尖聚起一團白金色的光，射出一道又長又粗的光之突刺，從左到右一隻接一隻穿過去；每一隻背後噴出護甲碎片
redo13('t_ogSpear', 't11_ogSpear', { col: OGC14.sun,
  *f(S, U, T, u, t) { const L = ogFoes14(this, t).sort((a, q) => a.P.x - q.P.x), A = PX13.hand(this); Sound.sfx('charge'); PX13.ring(this, A, 18, 3, S.col, 2, 12); PX13.spr(this, PXI.glint, A, { sc: 2, life: 14 }); yield* wait(10);
    K13.flash(this, '#fffbe0', 0.35, 5); for (const { P } of L) { const d = thrust13(this, P, { c: S.col, w: 9, over: 40, grow: 2, hold: 5, life: 16 }); yield* wait(3); Sound.sfx('hitSuper'); shards13(this, P, d, 8); PX13.hit(this, P, S.col, 1); PX13.burst(this, { x: P.x + d.ux * 26, y: P.y + d.uy * 26 }, 9, S.col, 10, { n: 4 }); yield* wait(2); }
    yield* wait(10); } });
// 百烈崩拳：十段連打，無視 30% 物防 → 金色的拳頭圖案一拳一拳打在對手身上（左、右、上、下輪流），每拳一個小爆點；最後一拳變大，護甲裂成兩半飛出去
redo13('t_ogFist', 't11_ogFist', { col: OGC14.chi,
  *f(S, U, T, u) { Sound.sfx('charge'); PX13.ring(this, PX13.hero(this), 26, 4, S.col, 2, 10); yield* wait(5); yield* this.lunge(u, 16, 2); Sound.sfx('hit'); PX13.spr(this, PXI.fist, { x: T.x - 8, y: T.y }, { sc: 2, life: 8 }); PX13.burst(this, T, 8, S.col, 7); yield* wait(3); },
  *h(S, U, T, u, i) { const last = i >= 9, o = [[8, -6], [-8, 4], [4, 8], [-6, -8], [10, 2]][i % 5];
    if (!last) { Sound.sfx('hit'); PX13.spr(this, PXI.fist, { x: T.x + o[0], y: T.y + o[1] }, { sc: 2, life: 7 }); PX13.burst(this, { x: T.x + o[0], y: T.y + o[1] }, 7, S.col, 6, { n: 4 }); this.shake = Math.max(this.shake, 2); yield* wait(2); return; }
    yield* wait(2); Sound.sfx('hitSuper'); PX13.spr(this, PXI.fist, T, { sc: 3, life: 12 }); PX13.hit(this, T, S.col, 1);
    for (const [img, dx] of [[PXI.plateL, -1], [PXI.plateR, 1]]) PX13.spr(this, img, { x: T.x + dx * 4, y: T.y + 6 }, { sc: 2, vx: dx * 1.6, vy: -1.2, g: 0.14, life: 20 }); yield* wait(12); } });
// 元素終焉：火、水、雷、草四道魔法依序打全體 → 主角腳下四顆元素寶石升起繞圈；一道火牆從左燒到右，接著冰晶砸在每一隻身上、落雷劈在每一隻身上、藤蔓從地面捲起每一隻
redo13('t_ogStaff', 't11_ogStaff', { col: PXC.fire,
  *f(S, U, T, u, t) { const H = PX13.hero(this), C = { x: H.x, y: H.y - 4 }, G = GEMS13(); Sound.sfx('charge'); K13.dark(this, 0.35, 120, '#0a0614');
    G.forEach((g, i) => { const p = PX13.spr(this, g, C, { sc: gemSc13, life: 26 }); p.upd = q => { const an = i * Math.PI / 2 + q.t * 0.25, R = Math.min(24, q.t * 3); q.x = C.x + Math.cos(an) * R; q.y = C.y - q.t * 0.6 + Math.sin(an) * R * 0.7; }; });
    yield* wait(14); const L = ogFoes14(this, t).sort((a, q) => a.P.x - q.P.x), y0 = T.y + 18; let k = 0; Sound.sfx('fire');
    for (let f = 0; f < 16; f++) { const X = lerp(-14, W + 14, f / 15); if (f % 2 === 0) for (let j = 0; j < 3; j++) PX13.spr(this, PXI.flameA, { x: X + rnd(-6, 6), y: y0 - j * 9 + rnd(-2, 2) }, { frames: [PXI.flameA, PXI.flameB], fps: 2, sc: j === 0 ? 2 : 1, vy: -0.3, life: 12 });
      while (k < L.length && L[k].P.x <= X) { PX13.burst(this, L[k].P, 12, PXC.fire, 10); k++; } yield; }
    yield* wait(3); Sound.sfx('water'); for (const { P } of L) { const p = PX13.spr(this, PXI.ice, { x: P.x, y: P.y - 50 }, { sc: 3, life: 10 }); p.upd = q => { q.y = Math.min(P.y, P.y - 50 + q.t * 9); }; }
    yield* wait(6); for (const { P } of L) { PX13.burst(this, P, 12, PXC.ice, 10); PX13.bits(this, P, 6, ['#ffffff', '#9ad8ff'], 2, 0.14, 12, { s: 2 }); } yield* wait(6);
    for (const { P } of L) { Sound.sfx('thunder'); this.spawn({ k: 'p13bolt', pts: PX13.zig({ x: P.x + rnd(-6, 6), y: 0 }, P, 6, 6), c: PXC.volt, s: 2, grow: 2, life: 12 }); PX13.burst(this, P, 12, PXC.volt, 11); yield* wait(2); }
    K13.flash(this, '#fff6a0', 0.25, 4); this.shake = Math.max(this.shake, 6); yield* wait(6);
    Sound.sfx('leaf'); for (const { v, P } of L) this.spawn({ k: 'p13vine', x1: P.x - 18, y1: ogFoot14(v, P), x2: P.x + 4, y2: P.y - 12, c: PXC.leaf, s: 2, grow: 6, amp: 6, life: 22 }); yield* wait(7); for (const { P } of L) PX13.hit(this, P, PXC.leaf, 1); yield* wait(8); } });
// 幻影千迴：殘影在魔物之間穿梭，打全體 4 段 → 主角留下好幾個殘影，一道道淡紫色的刀光在每一隻魔物之間來回劃過（每段換方向），中毒的綠色毒液濺出來
redo13('t_ogDual', 't11_ogDual', { col: OGC14.shade,
  *f(S, U, T, u, t) { for (const dx of [-14, 14, 0]) K13.ghost(this, dx, -4, '#c8a0ff', 12, 0.4); Sound.sfx('wind'); yield* this.lunge(u, 20, 2);
    const L = ogFoes14(this, t).sort((a, q) => a.P.x - q.P.x); for (let j = 0; j + 1 < L.length; j++) PX13.line(this, L[j].P, L[j + 1].P, S.col, 2, 10, { grow: 2 }); for (const { P } of L) { Sound.sfx('slash'); qSlash13(this, P, 0.8, S.col, { r: 20 }); } yield* wait(5); },
  *h(S, U, T, u, i) { Sound.sfx('slash'); const F = { x: T.x + (i % 2 ? 30 : -30), y: T.y - 10 }; PX13.line(this, F, T, PXC.blade, 1, 7, { grow: 2 });
    if (i < 3) { qSlash13(this, T, [-0.8, 1.6, -2.2][(i - 1) % 3], i % 2 ? PXC.blade : S.col, { r: 20 }); drip13(this, T, 1, 8); yield* wait(3); return; }
    xSlash13(this, T, 1, S.col, { r: 22 }); xSlash13(this, T, -1, S.col, { r: 22, delay: 2 }); yield* wait(3); PX13.hit(this, T, S.col, 0); drip13(this, T, 2, 10); yield* wait(5); } });
// 雙龍十字：兩道巨大的十字斬 → 左手劍一道從左上到右下、右手劍一道從右上到左下，兩道又寬又長的藍白色刀光交叉成十字，交叉點爆出光
redo13('t_ogTwin', 't11_ogTwin', { col: OGC14.dragon,
  *f(S, U, T, u) { for (const dx of [-10, 10]) K13.ghost(this, dx, 0, '#a0e0ff', 10, 0.4); yield* this.lunge(u, 22, 2); Sound.sfx('slash'); xSlash13(this, T, 1, S.col, { r: 40, w: 8 }); yield* wait(3); Sound.sfx('slash'); xSlash13(this, T, -1, S.col, { r: 40, w: 8 }); yield* wait(3); PX13.hit(this, T, S.col, 1); yield* wait(6); },
  *h(S, U, T) { Sound.sfx('crit'); K13.flash(this, '#e0f6ff', 0.35, 5); xSlash13(this, T, -1, PXC.blade, { r: 46, w: 9 }); xSlash13(this, T, 1, PXC.blade, { r: 46, w: 9, delay: 2 }); yield* wait(5); PX13.hit(this, T, S.col, 1); PX13.ring(this, T, 6, 36, S.col, 2, 14); yield* wait(10); } });
// 聖域壁壘：張開聖盾 3 回合，被攻擊就反擊 → 兩面金色大盾從主角左右兩邊落下、立在面前，腳下亮起一圈金色的光環，盾面閃光
redo13('t_ogWall', 't11_ogWall', { col: OGC14.holy,
  *f(S) { const H = PX13.hero(this); Sound.sfx('charge'); PX13.ring(this, { x: H.x, y: HERO_FOOT - 3 }, 4, 34, S.col, 2, 20, { fl: 0.32 }); yield* wait(4);
    for (const dx of [-14, 14]) { const A = { x: H.x + dx, y: H.y - 60 }, B = { x: H.x + dx, y: H.y - 10 }, p = PX13.spr(this, PXI.shield, A, { sc: 2, life: 30, blink: 0 }); p.upd = q => { const k = clamp(q.t / 6, 0, 1); q.y = lerp(A.y, B.y, k * k); }; }
    yield* wait(7); Sound.sfx('shield'); this.shake = Math.max(this.shake, 4); for (const dx of [-14, 14]) PX13.burst(this, { x: H.x + dx, y: H.y }, 12, S.col, 10); PX13.ring(this, { x: H.x, y: HERO_FOOT - 3 }, 8, 40, S.col, 2, 18, { fl: 0.32 });
    for (let i = 0; i < 6; i++) PX13.spr(this, PXI.glintS, { x: H.x + rnd(-24, 24), y: H.y + rnd(-26, 6) }, { life: 10, delay: i * 2 }); yield* wait(16); } });
// 鐵壁衝陣：舉盾衝撞全部魔物 → 藍色的盾牌舉在面前往前衝，從左到右一隻一隻撞過去（速度線），撞到的魔物爆出衝擊；主角腳下最後立起一圈守護的光
redo13('t_ogShield', 't11_ogShield', { col: OGC14.wall,
  *f(S, U, T, u, t) { const L = ogFoes14(this, t).sort((a, q) => a.P.x - q.P.x), H = PX13.hero(this), A = { x: H.x - 8, y: H.y - 12 }; const sh = PX13.spr(this, PXI.shield, A, { sc: 2, life: 12 + L.length * 8, blink: 0 });
    Sound.sfx('wind'); yield* this.lunge(u, 22, 2); let from = A;
    for (const { P } of L) { const P0 = { x: P.x, y: P.y + 6 }, F0 = from; sh.t0 = sh.t; sh.upd = q => { const k = clamp((q.t - q.t0) / 5, 0, 1); q.x = lerp(F0.x, P0.x, k); q.y = lerp(F0.y, P0.y, k); }; PX13.speed(this, F0, P0, PXC.wind, 5, 8); yield* wait(5);
      Sound.sfx('heavy'); PX13.hit(this, P, S.col, 1); PX13.bits(this, P, 6, ['#ffffff', '#c8d4e8', '#7a88a8'], 2.2, 0.14, 14, { s: 3 }); from = P0; yield* wait(3); }
    sh.life = sh.t + 4; Sound.sfx('shield'); PX13.ring(this, { x: H.x, y: HERO_FOOT - 3 }, 6, 30, S.col, 2, 16, { fl: 0.32 }); yield* wait(10); } });
// the tree page and the skill list call the fifth row 奧義
if (typeof UNLOCK11 !== 'undefined') UNLOCK11.og14 = 'Lv55';
// 冒險手冊「變強的方法」：Lv50 以後出現
if (typeof GROW12 !== 'undefined') { GROW12.push(['奧義', '每棵技能樹的第五段（Lv55，要先把第三段任一招練到 5 級；單手盾是第二段）。每棵樹一招，威力最大、MP 也最多。']); if (typeof GROW_WHEN12 !== 'undefined') GROW_WHEN12.奧義 = st => (st.lv || 1) >= 50; }
