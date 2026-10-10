/* ===================== v12.112 還沒換新特效的戰鬥畫面（特效測試版先開） =====================
   玩家 2026-10-11：「護盾的特效也沒更新 再檢查有沒有沒更新特效的一些戰鬥用資訊」。檢查後還是舊樣子的有：
   1. 護盾（魔法護盾・開場護盾・各種「得到 N 回合護盾」）：展開是舊的三圈淡藍圈＋盾牌圖示，擋傷害和消失時沒有畫面。
      → 腳下一圈波紋、光點往上升、身體外面張開兩層六角護壁；被打到時六角一閃、火花往外迸；消失時護壁碎成碎片落下。
   2. 回復（藥水・回復技・回復效果）：舊的是一堆「＋」字往上飄。→ 腳下一圈淡綠的光、光點往上升、身上一陣柔光。
   3. 魔物的「硬殼／魔障」架勢（v12.109 新加的）：只有一行字。→ 硬殼：身體一陣灰褐、岩片迸出、灰色裂環；魔障：紫色魔力罩住、符文繞一圈。
      架勢擋下傷害的那一下，標「硬殼／魔障」並閃一下，看得出是被擋掉了。（魔物的特效照魔物那一套：有黑邊、比較陰沉的樣子）
   4. 共通戰技兩招（晨曦之刃・雙相斬）還是舊特效 → 換成新的刀光。
   先只在特效測試版（BFX15.live）；玩家看過說好才放進正式版。特效測試版裡：道具欄有煙霧彈（逃跑的煙霧）、道具欄有藥水、開場有 2 回合護盾、第一隻樹樁會輪流張硬殼／魔障。 */
const BFX15 = { live: typeof fxtest13 === 'function' && fxtest13() };
HD15.P.ward = { core: '#ffffff', mid: '#d8f6ff', glow: '#48c8f0', edge: '#0c3a58', keep: 1 };
HD15.P.life = { core: '#ffffff', mid: '#c8ffd8', glow: '#3cd070', edge: '#0c4a24', keep: 1 };
BFX15.foot = (b, C) => { const v = b.views && Object.values(b.views).find(q => { const c = b.center(q); return Math.abs(c.x - C.x) < 4 && Math.abs(c.y - C.y) < 4; });
  return v && v.hero ? { x: C.x, y: HDW_FOOT() - 2 } : v && v.foot ? { x: C.x, y: v.foot - 2 } : { x: C.x, y: C.y + 22 }; };
// 1. 護盾
BFX15.barrier = function* (b, C) { const P = HD15.P.ward, G = BFX15.foot(b, C); Sound.sfx('shGuard');
  HD15.ring(b, G, P, 6, 40, { fl: 0.3, w: 1.8, dur: 22 }); HD15.motes(b, G, { x: C.x, y: C.y - 34 }, 8, P, { dur: 20 }); yield* wait(6);
  SP20.hex(b, C, 34, P, { hold: 22, fl: 1, fade: 1 }); SP20.hex(b, C, 26, HD15.P.white, { hold: 14, fl: 0.6, fade: 1, delay: 4 }); HD15.flash(b, C, P, 36, { dur: 14 }); yield* wait(22); };
BFX15.barrierHit = (b, C) => { const P = HD15.P.ward; SP20.hex(b, C, 32, P, { hold: 6, fl: 1, fade: 1 }); HD15.sparks(b, C, 8, P, { spd: 3, life: 14, g: 0.08 }); };
BFX15.barrierEnd = function* (b, C, broke) { const P = HD15.P.ward; if (broke) { Sound.sfx('shHitSuper'); HD15.stop(b, 4); HD15.flash(b, C, P, 40, { dur: 12 }); }
  SP20.hex(b, C, 32, P, { hold: broke ? 2 : 8, fl: broke ? 1 : 0.5, fade: 1 }); HD15.shards(b, C, broke ? 18 : 6, { spd: broke ? 3.6 : 1.6, sz: broke ? 3.4 : 2.4, up: broke ? 1.4 : 0.6, cols: [P.core, P.mid, P.glow] }); yield* wait(broke ? 14 : 10); };
// 2. 回復
BFX15.heal = function* (b, C) { const P = HD15.P.life, G = BFX15.foot(b, C);
  HD15.ring(b, G, P, 4, 32, { fl: 0.3, w: 1.6, dur: 20 }); HD15.motes(b, G, { x: C.x, y: C.y - 36 }, 10, P, { dur: 20 }); HD15.flash(b, C, P, 30, { dur: 16, delay: 4 });
  HD15.sparks(b, { x: C.x, y: C.y + 6 }, 6, P, { ang: -Math.PI / 2, spread: 0.8, spd: 1.4, life: 20 }); yield* wait(22); };
// 3. 魔物的架勢（魔物那一套材質）
BFX15.STANCE = { pguard15: { n: '硬殼', c: '#c8b8a0', tint: '#a89a88', ring: '#8a8272' }, mguard15: { n: '魔障', c: '#c8a0ff', tint: '#9a70e0', ring: '#7a40c0' } };
BFX15.stance = function* (b, v, id) { const S = BFX15.STANCE[id], C = b.center(v);
  v.tint = { c: S.tint, a: 0.55 };
  if (id === 'pguard15') { Sound.sfx('rock'); mSpawn(b, 'mjag', { x: C.x, y: C.y, r0: 6, r1: 34, c: S.ring, life: 16 }); mSpawn(b, 'mjag', { x: C.x, y: C.y, r0: 4, r1: 24, c: '#c8c0b0', life: 14, rot: 0.4 }); mDebris(b, C.x, C.y, 8, MC.rock, 'mrock', 2.4, 3); }
  else { Sound.sfx('charge'); mSpawn(b, 'maura', { x: C.x, y: C.y, r0: 12, r1: 40, c: S.ring, life: 26 }); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; mSpawn(b, 'mrune', { x: C.x + Math.cos(a) * 24, y: C.y + Math.sin(a) * 18, c: '#c8a0ff', s: 4, rot: a, life: 26 }); }
    mSpawn(b, 'mjag', { x: C.x, y: C.y, r0: 6, r1: 32, c: S.ring, life: 16 }); }
  yield* wait(16); v.tint = null; yield* wait(4); };
BFX15.stanceHit = (b, t, id) => { const S = BFX15.STANCE[id], C = b.center(t); mSpawn(b, 'mjag', { x: C.x, y: C.y, r0: 4, r1: 20, c: S.ring, life: 10 }); b.sparks(C.x, C.y, 6, [S.c, '#ffffff'], 2.2, 14); b.popNum(t, S.n + ' −40%', S.c, null, { small: 1, dy: -26 }); };
if (BFX15.live) {
  { const _b = FX.barrier; FX.barrier = function* (U, ...a) { if (!HD15.on) return yield* _b.call(this, U, ...a); yield* BFX15.barrier(this, U); }; }
  { const _h = FX.heal; FX.heal = function* (U, ...a) { if (!HD15.on) return yield* _h.call(this, U, ...a); yield* BFX15.heal(this, U); }; }
  const H = Battle.prototype.handlers, _dm = H.DAMAGE, _ex = H.STATUS_EXPIRE, _rm = H.STATUS_REMOVE, _ap = H.STATUS_APPLY;
  H.DAMAGE = function* (e, s, t, P) { if (!(HD15.on && t && t.st && P && P.kind !== 'dot')) return yield* _dm.call(this, e, s, t, P); const C = this.center(t);
    if (!t.hero && s && s.hero && (P.amount || 0) > 0) { if (t.st.pguard15 && P.cat === '物') BFX15.stanceHit(this, t, 'pguard15'); else if (t.st.mguard15 && P.cat === '特') BFX15.stanceHit(this, t, 'mguard15'); }
    if (!(P.ward > 0)) return yield* _dm.call(this, e, s, t, P);
    BFX15.barrierHit(this, C); this.noHex15 = 1; try { return yield* _dm.call(this, e, s, t, P); } finally { this.noHex15 = 0; } };   // 打在護盾上：新的六角一閃（舊的淡藍六角不畫）
  { const _sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { if (this.noHex15 && p && p.k === 'hex') return p; return _sp.call(this, p); }; }
  // 護盾消失：自然消失＝護壁淡掉、幾片碎片；被打破＝整個碎開（舊的只有幾顆火花）
  const end = function* (t, P) { if (!(HD15.on && t && P && P.status === 'barrier' && t.st && t.st.barrier) || P.why === 'down') return; yield* BFX15.barrierEnd(this, this.center(t), P.why === 'broken'); };
  H.STATUS_EXPIRE = function* (e, s, t, P) { yield* end.call(this, t, P); return yield* _ex.call(this, e, s, t, P); };
  H.STATUS_REMOVE = function* (e, s, t, P) { yield* end.call(this, t, P); return yield* _rm.call(this, e, s, t, P); };
  H.STATUS_APPLY = function* (e, s, t, P) { if (HD15.on && t && !t.hero && P && !P.failed && !P.cleared && BFX15.STANCE[P.status]) yield* BFX15.stance(this, t, P.status); return yield* _ap.call(this, e, s, t, P); };
}
// 4. 共通戰技
const CMFX15 = {
  // 晨曦之刃：武器一亮 → 衝上去一道大大的晨曦色斜斬 → 停格、十字光 → 光點流回主角身上（吸血）
  cmDawn: { *f(U, T, u) { const P = HD15.P.dawn; glint15(this, P); Sound.sfx('blade'); yield* this.lunge(u, 20, 3);
      HD15.slash(this, T, { pal: P, r: 68, th: 14, ang: -0.67, span: 1.6, dur: 24, spark: 1 }); HD15.slash(this, { x: T.x - 4, y: T.y + 4 }, { pal: HD15.P.sunrise, r: 60, th: 6, ang: -0.67, span: 1.4, dur: 20, delay: 2, al: 0.6 });
      yield* wait(4); Sound.sfx('crit'); HD15.stop(this, 6); HD15.flare(this, T, P, 54, { rot: Math.PI / 4, dur: 16 }); HD15.sparks(this, T, 12, P, { spd: 3.4, life: 18 });
      yield* wait(8); HD15.motes(this, T, this.center(this.H), 8, P, { dur: 18 }); yield* wait(14); } },
  // 雙相斬：鋼色的一刀（物理）→ 反方向一道紫色的刀光（魔法）
  cmTwin: { *f(U, T, u) { yield* this.lunge(u, 18, 2); Sound.sfx('blade'); HD15.slash(this, T, { pal: HD15.P.steel, r: 56, th: 11, ang: -0.67, span: 1.5, dur: 20 }); yield* wait(4);
      HD15.stop(this, 3); HD15.sparks(this, T, 8, HD15.P.steel, { spd: 3, life: 14 }); yield* wait(6);
      Sound.sfx('stHit'); HD15.slash(this, T, { pal: HD15.P.arcane, r: 56, th: 11, ang: -2.41, dir: -1, span: 1.5, dur: 20 }); yield* wait(4); HD15.stop(this, 3); HD15.flash(this, T, HD15.P.arcane, 28, { dur: 12 }); yield* wait(12); } },
};
if (BFX15.live) for (const k in CMFX15) { const id = 't_' + k, D = DEF.skills[id], F = CMFX15[k]; if (!D) continue; const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; }
    if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: false }; HD15.ids.push(id);
  if (HD15.on) { D.fx = key; D.hitFx = null; if (MOVES[id]) MOVES[id].fx = key; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (typeof REDO13 !== 'undefined') REDO13.add(id); } }
// 特效測試版：看得到上面這些
if (BFX15.live) {
  { const _s = fxtSetup13; fxtSetup13 = function (kind) { _s(kind); const st = Game.st; st.bag = { ...(st.bag || {}), potion: 99, superPotion: 99, ether: 99 }; }; }
  { const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o);
      if (FXT13.on && s) (s.data.mechanics || (s.data.mechanics = [])).push('stanceA15'); return s; }; }
  { const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (FXT13.on && s) (s.data.mechanics || (s.data.mechanics = [])).push('openShield15'); return s; }; }
  { const _c = Battle.prototype.command; Battle.prototype.command = function* () { const cmd = yield* _c.call(this);   // 用藥水時先扣到一半，才看得到回復
      if (FXT13.on && cmd && cmd.type === 'item') { const hu = this.core.byId.H; hu.res.hp = Math.max(1, Math.floor(hu.max.hp * 0.5)); if (hu.max.mp) hu.res.mp = Math.floor(hu.max.mp * 0.5); if (this.sync) this.sync(); } return cmd; }; }
  defPut('mechanics', 'openShield15', { make: () => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'status', target: 'self', status: 'barrier', dur: 2 }] }] }) });
}
/* ---------- v12.113 剩下的舊畫面（玩家「可以」）：煙幕／殘影、集中、時間凍結、鏡面、逃跑的煙霧、魔物和道具・天賦帶來的能力升降 ----------
   主角自己用新特效的招時（招的特效已經畫了）不再疊；其他來源（道具、天賦、晶石、魔物）才放這些。 */
BFX15.smokeOn = function* (b, t, smk) { const C = b.center(t), G = BFX15.foot(b, C); Sound.sfx('wind');
  if (smk) { HD15.smoke(b, G, 14, { col: '#c8c8d0', r: 30, sz: 16, spd: 1, up: 0.35, life: 36 }); HD15.smoke(b, C, 8, { col: '#e4e4ea', r: 20, sz: 12, spd: 0.8, life: 30, delay: 4 }); yield* wait(18); return; }
  if (t.hero && typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(b, (i % 2 ? -1 : 1) * i * 6, 0, '#9ad0ff', 8 + i * 3, 0.4);
  HD15.windLines(b, { x: C.x - 40, y: C.y }, { x: C.x + 40, y: C.y }, HD15.P.wind, 6, { spread: 30, len: 30, spd: 8, life: 12 }); yield* wait(16); };
BFX15.focus = function* (b, t) { const C = b.center(t), A = { x: C.x, y: C.y - 14 }, P = HD15.P.gold; Sound.sfx('charge'); HD15.gather(b, A, 10, P, 28, { span: 8 }); yield* wait(10);
  HD15.flash(b, A, P, 26, { dur: 12 }); HD15.lockon(b, A, P, { dur: 24, r0: 22, r1: 8 }); yield* wait(14); };
BFX15.frozen = function* (b, t) { const C = b.center(t), P = HD15.P.moon; HD15.ring(b, C, P, 40, 8, { w: 2, dur: 18 }); SP20.hex(b, C, 28, P, { hold: 16, fl: 0.8, fade: 1, delay: 6 }); HD15.sparks(b, C, 8, P, { spd: 1.2, life: 24, delay: 6 });
  t.tint = { c: '#c8e0ff', a: 0.5 }; yield* wait(18); t.tint = null; };
BFX15.mirror = (b, t) => { const C = b.center(t), P = HD15.P.silver; HD15.flash(b, C, P, 34, { dur: 14 }); SP20.hex(b, C, 30, P, { hold: 14, fl: 1, fade: 1 }); HD15.sparks(b, C, 8, HD15.P.white, { spd: 2, life: 18 }); };
if (BFX15.live) {
  const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY;
  H.STATUS_APPLY = function* (e, s, t, P) { if (HD15.on && t && P && !P.failed && !P.cleared && !P.quiet && !HD15.mine(this)) { const id = P.status;
      if (id === 'smoke') { const sk = this.cast && this.cast.D; yield* BFX15.smokeOn(this, t, this.itemCtx || !sk || /煙|霧/.test((sk.name || '') + (sk.desc || ''))); }
      else if (id === 'critNext') yield* BFX15.focus(this, t);
      else if (id === 'frozen') yield* BFX15.frozen(this, t);
      else if (id === 'mirror') BFX15.mirror(this, t); }
    return yield* _ap.call(this, e, s, t, P); };
  { const _su = FX.statUpFx, _sd = FX.statDownFx;   // 能力升降（魔物、道具、天賦）：跟主角新招一樣的光柱，舊的金色箭頭不用了
    FX.statUpFx = function* (U) { if (!HD15.on || HD15.mine(this)) return yield* _su.call(this, U); return yield* HD15.statFx.call(this, U, 1, HD15.P[HD15.STATPAL[this.hd15stat] || 'blaze']); };
    FX.statDownFx = function* (U) { if (!HD15.on || HD15.mine(this)) return yield* _sd.call(this, U); return yield* HD15.statFx.call(this, U, -1); }; }
  { const _sm = FX.smoke; FX.smoke = function* (...a) { if (!HD15.on) return yield* _sm.apply(this, a); Sound.sfx('wind'); const C = this.center(this.H);
      HD15.smoke(this, { x: C.x, y: C.y + 10 }, 22, { col: '#d0d0d8', r: 60, sz: 22, spd: 1.6, up: 0.4, life: 44 }); HD15.smoke(this, { x: W / 2, y: BH * 0.45 }, 16, { col: '#e8e8ee', r: 90, sz: 20, spd: 1.2, life: 44, delay: 6 }); yield* wait(40); }; }
  { const _s = fxtSetup13; fxtSetup13 = function (kind) { _s(kind); Game.st.bag.smoke = 99; }; }
}
