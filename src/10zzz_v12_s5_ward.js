/* ===================== v12.5 護盾重製（玩家 2026-10-05：參考 Orna 的護盾；四題都選建議＋裝備四種都要＋頭目三種時機） =====================
   主角的護盾：照最大 HP 的比例張開（預設 20%），打過來的傷害有一部分（預設 50%）先打在護盾上，護盾打完才全部扣血；
     預設 1 回合（到自己下一次行動，而且對手至少行動過一次）。技能可以加回合數、加吸收比例；再張一次時取比較大的那邊。
   魔物的護盾（取代破防格）：菁英・頭目「蓄力時」「HP 掉到門檻時」「固定每 4 回合」張開護盾，打在護盾上的傷害不扣血。
     在護盾消失前把它打破 → 破防（跳過下一次行動、受到的傷害 +50%、打斷蓄力、可以打部位）；沒打破就白打了。
     對護盾的倍率：弱點 ×2、會心 ×2、破盾招 ×2〜×3、劍・斧的特性、裝備的「破盾」（最多 ×5，裝備另外加成）。
   裝備：盾牌開場自帶護盾；賦予「護盾量」「破盾」；效果詞綴「盾衛」「堅盾」「破盾」「盾反」；晶石「水晶魔像」「楓林鹿王」加上護盾效果。 */
const WARD12 = {
  hero: { pct: 0.20, abs: 0.5, turns: 1 },
  node: 0.15,                                   // 先盾（護身樹）：開場護盾 +15%
  shieldT: t => 0.06 + 0.02 * clamp(t || 1, 1, 8), // 盾牌的開場護盾：T1 8% … T7 20%
  sp: { pct: 0.25, abs: 0.75 },                 // 特技 鋼壁・鐵骨
  holy: { pct: 0.30, abs: 0.75 },               // 聖壁衝鋒
  mwall: { pct: 0.25, abs: { 特: 1, 物: 0.5 }, turns: 2, lv: 0.03 }, // 法力屏障（每級 +3%）
  death: { pct: 0.30, abs: 1, turns: 2 },       // 亡者守護（每場 1 次，HP 低於 30%）
  foe: { charge: { boss: 0.10, elite: 0.12 }, hpTh: { boss: [0.7, 0.4], elite: [0.5] }, hpPct: 0.12, every: 4, everyPct: 0.08 },
  mul: { weak: 2, crit: 2, cap: 5, sword: 1.5, axe: 1.5 },
};
const wardSum12 = (u, k) => { let v = 0; for (const m of (u && u.mods) || []) if (m[k]) v += m[k]; return v; };

/* ---------- 狀態：barrier＝護盾（資料在 data 裡，時間自己算） ---------- */
defPut('statuses', 'barrier', { tags: ['buff', 'guard'], duration: 'battle', durDefault: null, stack: 'refresh', metadata: { n: '護盾' }, override: 1 });
const wardFoe12 = u => !!u && !u.hero && !!(u.elite || u.boss) && u.sp !== 'millGolem'; // 磨石魔像（第一隻菁英，大風車教學）不張盾
const wardOf12 = (core, u) => { const w = u && core.statusOf(u, 'barrier'); return w && w.data && w.data.ward12 ? w.data : null; };
const oppActs12 = (core, u) => { const S = core.data.side12 || {}; let n = 0; for (const k in S) if (k !== u.side) n += S[k]; return n; };
function wardOpen12(core, src, t, W, o = {}) {
  if (!t || !core.isUp(t)) return null;
  const up = t.hero ? 1 + wardSum12(t, 'wardUp12') / 100 : (t.data.wardMul12 || 1), lv = W.lvAdd || 0;
  const amt = Math.max(1, Math.round(t.max.hp * (W.pct + lv) * up)), turns = Math.max(1, Math.round(W.turns || 1) + (t.hero ? wardSum12(t, 'wardLong12') : 0));
  const c = wardOf12(core, t), absMax = (a, b) => { if (a == null) return b; if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    const A = typeof a === 'object' ? a : { 物: a, 特: a }, B = typeof b === 'object' ? b : { 物: b, 特: b }; return { 物: Math.max(A.物 ?? 0.5, B.物 ?? 0.5), 特: Math.max(A.特 ?? 0.5, B.特 ?? 0.5) }; };
  const left = c ? Math.max(0, c.turns - ((t.data.starts12 || 0) - c.s0)) : 0;
  const d = { ward12: 1, foe: !t.hero, amt: c ? Math.max(c.amt, amt) : amt, abs: c ? absMax(c.abs, W.abs ?? 1) : (W.abs ?? 1), turns: Math.max(turns, left),
    s0: t.data.starts12 || 0, o0: oppActs12(core, t), r0: core.round, why: W.why || (c && c.why) || null };
  d.max = c ? Math.max(c.max || 0, d.amt) : d.amt;
  if (!t.hero) t.data.wardR12 = core.round;
  const r = core.applyStatus(src || t, t, 'barrier', { ...o, dur: null, data: d }), w = core.statusOf(t, 'barrier'); if (w && w.data === d) w.data = { ...d }; // the event keeps the opening numbers
  return r;
}
// lifetime: counts each side's action starts; the shield goes when its owner has started `turns` actions since and the other side acted at least once
{ const P = BattleCore.prototype, _tk = P.tick; P.tick = function (u, at) {
    if (at === 'owner_action_start' && u) { const S = this.data.side12 || (this.data.side12 = {}); S[u.side] = (S[u.side] || 0) + 1; u.data.starts12 = (u.data.starts12 || 0) + 1; u.data.lastActR12 = this.round;
      // a monster's shield: the hero must have had a command chosen after it went up (an action in a later round)
      const d = wardOf12(this, u), seen = d && (d.foe ? this.units.some(x => x.side !== u.side && (x.data.lastActR12 || 0) > d.r0) : oppActs12(this, u) - d.o0 >= 1);
      if (d && u.data.starts12 - d.s0 >= d.turns && seen) this.removeStatus(u, 'barrier', 'expire'); }
    return _tk.call(this, u, at); }; }
// a charging monster lets fly at the end of the next round, so the hero always gets one action that knows about the charge (break the shield or defend)
{ const P = BattleCore.prototype, _pp = P.planPrio; P.planPrio = function (u) { const p = _pp.call(this, u); return u && !u.hero && this.hasStatus(u, 'charging') ? Math.min(p, -15) : p; }; }
// …and never in the same round it started charging (bosses with two actions used to charge and let fly at once)
{ const P = BattleCore.prototype, _fc = P.forcedCommand; P.forcedCommand = function (u) { const ch = u && !u.hero && this.statusOf(u, 'charging');
    if (ch && ch.at === this.round) return { action_id: 0, actor: u.id, type: 'wait', skill: null, item: null, targets: [], meta: { hold12: 1 } };
    return _fc.call(this, u); }; }
// every old way of putting up a shield goes through here: 「N 回合」(old) → N−1 回合（至少 1）、20% HP、吸收 50%
{ const P = BattleCore.prototype, _as = P.applyStatus; P.applyStatus = function (src, t, id, o = {}) {
    if (id === 'barrier' && t && !(o.data && o.data.ward12)) { if (o.delta != null && o.delta < 0) return null;
      const dur = typeof o.dur === 'object' && o.dur ? BR.val(o.dur, { core: this, owner: t, src: t }) : o.dur;
      return wardOpen12(this, src, t, { ...WARD12.hero, turns: Math.max(1, (typeof dur === 'number' ? dur : 2) - 1) }, { quiet: o.quiet }); }
    const r = _as.call(this, src, t, id, o);
    // 菁英・頭目開始蓄力時張開護盾
    if (id === 'charging' && wardFoe12(t) && this.hasStatus(t, 'charging'))
      wardOpen12(this, t, t, { pct: WARD12.foe.charge[t.boss ? 'boss' : 'elite'], abs: 1, turns: 1, why: 'charge' });
    return r; }; }
EFFECT_TYPES.ward12 = { exec(core, ef, ctx, tg) { const T = tg && tg.length ? tg : [ctx.owner];
  const lv = ef.lv && ctx.skill && ctx.owner && ctx.owner.data.tlv12 ? ((ctx.owner.data.tlv12[ctx.skill.id] || 1) - 1) * ef.lv : 0;
  for (const t of T) wardOpen12(core, ctx.owner, t, { pct: BR.val(ef.pct, ctx), abs: ef.abs ?? WARD12.hero.abs, turns: BR.val(ef.turns, ctx) ?? 1, lvAdd: lv, why: ef.why || null }); } };

/* ---------- 吸收：在扣血的那一刻 ---------- */
function wardMul12(core, s, t, P) {
  let m = 1; const D = P.skill && DEF.skills[P.skill];
  if (P.mult > 1) m *= WARD12.mul.weak;
  if (P.crit) m *= WARD12.mul.crit * (wardSum12(s, 'wSword12') ? WARD12.mul.sword : 1) * (D && D.wardCritX ? D.wardCritX : 1);
  if (D && D.wardX) m *= D.wardX;
  if (D && wardSum12(s, 'wAxe12') && (D.tags || []).includes('basic')) m *= WARD12.mul.axe;
  return Math.min(WARD12.mul.cap, m) * (1 + wardSum12(s, 'wbrk12') / 100); }
function wardAbsorb12(core, ev) {
  const P = ev.payload, t = core.byId[ev.tgts[0]], s = ev.src ? core.byId[ev.src] : null;
  if (!t || !s || s.side === t.side || P.kind === 'dot' || !(P.amount > 0)) return null;
  const d = wardOf12(core, t); if (!d || !(d.amt > 0)) return null; let broke = false;
  if (d.foe) { const m = wardMul12(core, s, t, P), need = d.amt / m;
    if (P.amount < need) { P.ward = Math.round(P.amount * m); d.amt -= P.amount * m; P.amount = 0; }
    else { P.ward = Math.round(d.amt); P.amount = Math.floor(P.amount - need); d.amt = 0; broke = true; }
    P.wardMul = Math.round(m * 10) / 10; }
  else { const ab = typeof d.abs === 'object' ? (d.abs[P.cat] ?? 0.5) : d.abs, take = Math.min(d.amt, Math.floor(P.amount * ab));
    d.amt -= take; P.amount -= take; P.ward = take; if (d.amt <= 0) broke = true; }
  P.wardLeft = Math.max(0, Math.round(d.amt)); return { t, s, broke };
}
function wardBroke12(core, r) { const { t, s } = r; if (!core.statusOf(t, 'barrier')) return;
  core.removeStatus(t, 'barrier', 'broken', s);
  if (t.hero) { const v = wardSum12(t, 'wardBack12'); if (v && s && core.isUp(s) && core.isUp(t)) core.react(t, { skill: 'counter_strike', targets: [s.id], why: 'wardBack', meta: { powMul: v / 40 } }); return; }
  if (!core.isUp(t) || core.hasStatus(t, 'broken')) return;
  core.emit(EVT.BREAK, { src: s, tgts: [t], tags: ['break'] }, () => {
    t.data.brkN11 = (t.data.brkN11 || 0) + 1; if (t.data.hunt2) t.data.brkP2_11 = 1;
    core.applyStatus(s, t, 'broken', {}); core.removeStatus(t, 'charging', 'break'); core.removeStatus(t, 'airborne', 'break'); }); }
// 菁英・頭目：HP 門檻（頭目 70%・40%、菁英 50%）
function wardHp12(core, t, hp0) { if (!wardFoe12(t) || !core.isUp(t) || core.hasStatus(t, 'broken')) return;
  const L = WARD12.foe.hpTh[t.boss ? 'boss' : 'elite'], a = hp0 / t.max.hp, b = t.res.hp / t.max.hp, done = t.data.wth12 || (t.data.wth12 = []);
  for (const th of L) if (a > th && b <= th && !done.includes(th)) { done.push(th); wardOpen12(core, t, t, { pct: WARD12.foe.hpPct, abs: 1, turns: 1, why: 'hp' }); break; } }
{ const P = BattleCore.prototype, _em = P.emit; P.emit = function (type, o = {}, main = null) {
    if (type === EVT.DAMAGE && typeof main === 'function') { let r = null, hp0 = 0, tu = null; const core = this;
      const e = _em.call(this, type, o, ev => { tu = core.byId[ev.tgts[0]]; hp0 = tu ? tu.res.hp : 0; r = wardAbsorb12(core, ev); main(ev); });
      if (r && r.broke) wardBroke12(this, r);
      if (tu && !e.cancelled && e.src && this.byId[e.src] && this.byId[e.src].side !== tu.side) wardHp12(this, tu, hp0);
      return e; }
    const e = _em.call(this, type, o, main);
    // 固定每 4 回合（自己行動完）
    if (type === EVT.ACTION_END && wardFoe12(o.src) && o.payload && o.payload.executed && !o.payload.reaction) { const u = o.src;
      if (this.isUp(u) && !this.hasStatus(u, 'broken') && !this.hasStatus(u, 'charging') && !wardOf12(this, u) && this.round - (u.data.wardR12 || 0) >= WARD12.foe.every)
        wardOpen12(this, u, u, { pct: WARD12.foe.everyPct, abs: 1, turns: 1, why: 'every' }); }
    return e; }; }

/* ---------- 破防格退場（魔物的護盾取代它） ---------- */
BRK11.elite = 0; BRK11.boss = 0;
EFFECT_TYPES.hunt_chip = { exec() {} }; // 「削 N 格」→ 招式本身的破盾倍率（wardX）
// charged hits (60〜80% HP) no longer get the old 護盾 −40%; the shield absorbs instead
EFFECT_TYPES.hunt_hp = { exec(core, ef, ctx) { const e = ctx.pre, R = core.rel11; if (!e || !R) return; const t = ctx.tgt || core.byId[e.tgts[0]]; if (!t) return;
  const hits = R.sk.hits ? (R.sk.hits[0] + R.sk.hits[1]) / 2 : 1; let v = t.max.hp * (HUNT11.hpLo + (HUNT11.hpHi - HUNT11.hpLo) * core.rng.next()) / hits;
  if (!R.noGuard && core.hasStatus(t, 'guard')) v *= HUNT11.guard;
  e.payload.amount = Math.max(1, Math.floor(v)); (e.payload.notes || (e.payload.notes = [])).push('hunt11'); } };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s) return s;
    s.data.wardMul12 = [1, 1, 1.25, 1.5][s.data.diff11 || 0] || 1; return s; }; }

/* ---------- 技能：破盾倍率、護盾招 ---------- */
const WARDX12 = { t_axSplit: 2, t_axCrush: 3, t_sdGap: 2, t_spBreak: 2, t_fsStorm: 2, t_gnAp: 2, t_shRam: 2 };
for (const id in WARDX12) if (DEF.skills[id]) DEF.skills[id].wardX = WARDX12[id];
for (const id of ['t_sdFlow', 't_dsStar']) if (DEF.skills[id]) DEF.skills[id].wardCritX = 1.5;
const wEff12 = (id, ef) => effRegister('skill:' + id + '#w12', ef);
for (const id in DEF.skills) { const D = DEF.skills[id], w = D.metadata && D.metadata.wsp; if (!w) continue;
  if (w === 'chip') D.wardX = 2;
  if (w === 'guard') D.effects = [wEff12(id, { type: 'ward12', target: 'self', pct: WARD12.sp.pct, abs: WARD12.sp.abs, turns: 1, why: 'sp' })]; }
if (DEF.skills.t_zjHolyWall) DEF.skills.t_zjHolyWall.after = [wEff12('t_zjHolyWall', { type: 'ward12', target: 'self', pct: WARD12.holy.pct, abs: WARD12.holy.abs, turns: { f: 'shieldDur' }, why: 'holy' })];
if (DEF.skills.t_stWall) DEF.skills.t_stWall.effects = [wEff12('t_stWall', { type: 'ward12', target: 'self', pct: WARD12.mwall.pct, abs: WARD12.mwall.abs, turns: WARD12.mwall.turns, lv: WARD12.mwall.lv, why: 'mwall' })];
DEF.passives['fx.deathWard'].make = (v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerHpBelow: 0.3, ownerAlive: 1 }, limit: { perBattle: 1 }, prio: 8,
  effects: [{ type: 'ward12', target: 'self', pct: WARD12.death.pct, abs: WARD12.death.abs, turns: WARD12.death.turns, why: 'death' }, { type: 'message', key: 'death_ward', target: 'self' }] }] }));
DEF.passives['cr.deathWard'].make = DEF.passives['fx.deathWard'].make;
DEF.passives.openShield.make = v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'ward12', target: 'self', pct: WARD12.hero.pct, abs: WARD12.hero.abs, turns: v }] }] });
// 開場護盾：盾牌＋先盾（加在一起）
PV('wardOpen12', v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'ward12', target: 'self', pct: v / 100, abs: WARD12.hero.abs, turns: 1, why: 'open' }] }] }), { n: '開場護盾' });
PV('wardUp12', v => ({ mods: [{ wardUp12: v }] }), { n: '護盾量' });
PV('wbrk12', v => ({ mods: [{ wbrk12: v }] }), { n: '破盾' });
PV('faWardGuard', v => ({ triggers: [{ on: EVT.DEFEND, phase: 'POST', role: 'src', effects: [{ type: 'ward12', target: 'self', pct: v / 100, abs: WARD12.hero.abs, turns: 1, why: 'guard' }] }] }), { n: '盾衛' });
PV('faWardLong', v => ({ mods: [{ wardLong12: v }] }), { n: '堅盾' });
PV('faWardBrk', v => ({ mods: [{ wbrk12: v }] }), { n: '破盾' });
PV('faWardBack', v => ({ mods: [{ wardBack12: v }] }), { n: '盾反' });
// the tree's 先盾 node and the old talent it borrowed
{ const N = TREE11['護身'].nodes.find(n => n[0] === 'cmOpen'); if (N) { N[4] = '開場張開護盾（最大 HP 15%，有盾牌時加在一起）'; N[5] = { ward: 1 }; } }
// 劍・斧的特性、流光連斬・雙星十字：拿掉舊的「削格」，改成破盾倍率
{ const D = DEF.passives.tr11, _mk = D.make; D.make = function (v, u) { const r = _mk.call(this, v, u), T = new Set((v && v.traits) || []);
    r.triggers = (r.triggers || []).filter(tr => !(tr.effects || []).some(ef => (typeof ef === 'string' ? (DEF.effects[ef] || {}).type : ef.type) === 'hunt_chip'));
    if (T.has('劍')) r.mods.push({ wSword12: 1 }); if (T.has('斧')) r.mods.push({ wAxe12: 1 }); return r; }; }

/* ---------- 主角的數字：盾牌、賦予、詞綴、晶石、先盾、技能等級 ---------- */
Object.assign(EN11, { ward: ['護盾量', 3, '%', 2, '金屬', 2, 10, 'ra'], wbrk: ['破盾', 5, '%', 2, '魔素', 2, 10, 'wa'] });
Object.assign(FA9, {
  f_wardGuard: ['盾衛', 'faWardGuard', [12, 15, 18], FA_DEF, v => '防禦時張開護盾（最大 HP ' + v + '%）'],
  f_wardLong: ['堅盾', 'faWardLong', [1, 1, 1], FA_DEF, () => '自己張開的護盾多 1 回合', 4],
  f_wardBrk: ['破盾', 'faWardBrk', [25, 35, 45], FA_OFF, v => '對魔物護盾的傷害 +' + v + '%'],
  f_wardBack: ['盾反', 'faWardBack', [40, 50, 60], FA_DEF, v => '護盾被打破時反擊（威力 ' + v + '）'] });
for (const id of ['f_wardGuard', 'f_wardLong', 'f_wardBrk', 'f_wardBack']) { const [n, key, , slots] = FA9[id]; AFFIX_TABLE[id] = { n, key, eff: 1, slots, w: 0, min: 1, max: 1, cat: '效果' }; }
Object.assign(CRY11.crystalGolem, { 2: CRY11.crystalGolem[2].concat([['wardUp', 15]]) });
Object.assign(CRY11.stagLord, { 2: CRY11.stagLord[2].concat([['wardBrk', 20]]) });
PV('cr.wardUp', v => ({ mods: [{ wardUp12: v }] })); PV('cr.wardBrk', v => ({ mods: [{ wbrk12: v }] })); CRY_PAS11.add('wardUp'); CRY_PAS11.add('wardBrk');
{ const _t = cryEffText11; cryEffText11 = function (e, v) { return e[0] === 'wardUp' ? '張開的護盾量 +' + v + '%' : e[0] === 'wardBrk' ? '對魔物護盾的傷害 +' + v + '%' : e[0] === 'deathWard' ? '每場 1 次：HP 低於 30% 時張開護盾（最大 HP 30%、全部吸收、2 回合）' : _t(e, v); }; }
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st || !st.equip) return s;
    let up = 0, brk = 0; for (const g of equippedGear(st)) { const E = g.en11 || {}; if (E.ward) up += EN11.ward[1] * E.ward; if (E.wbrk) brk += EN11.wbrk[1] * E.wbrk; }
    if (up) s.wardUp12 = (s.wardUp12 || 0) + up; if (brk) s.wbrk12 = (s.wbrk12 || 0) + brk;
    const sh = gearBy(st.equip.shield, st), op = (sh && GEAR[sh.b].slot === 'shield' ? Math.round(WARD12.shieldT(GEAR[sh.b].t) * 100) : 0) + (trLv11('cm:cmOpen', st) ? Math.round(WARD12.node * 100) : 0);
    if (op) s.wardOpen12 = op; return s; }; }
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st) return s; s.data.tlv12 = { ...(tr11(st).lv || {}) };
    s.passives = s.passives.filter(p => !(p.key === 'openShield')); return s; }; }
// 金裝特效「碎盾」（甲殼護符・獵人之眼）：原本削破防格 → 對魔物護盾的傷害 +35%
DEF.passives['fx.breaker'].make = () => ({ mods: [{ wbrk12: 35 }] });
if (ACC_TRAIT.breaker) ACC_TRAIT.breaker[1] = '對魔物護盾的傷害 +35%'; if (SPECIALS.breaker) SPECIALS.breaker.d = '對魔物護盾的傷害 +35%。';
// 先盾 used to borrow the old talent 屏障 (開場 2 回合): the tree list of borrowed talents leaves it out now
{ const _ids = TAL12.ids; TAL12.ids = function (st = Game.st) { return _ids.call(this, st).filter(id => id !== 'guardian.0.1.1'); }; }
// the gear card shows the shield's opening shield
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const L = _gi(g, wrapW), B = g && GEAR[g.b];
    if (B && B.slot === 'shield') L.splice(Math.min(L.length, 2), 0, ['開場護盾：最大 HP ' + Math.round(WARD12.shieldT(B.t) * 100) + '%（吸收 50%，1 回合）', '#a8e0ff', 10, 0]);
    return L; }; }

/* ---------- 文字 ---------- */
{ const T = (id, d) => { const D = DEF.skills[id]; if (D) D.desc = d; if (MOVES[id]) MOVES[id].d = d; for (const k of TREE_KINDS11) for (const r of TREE11[k].sk || []) if ('t_' + r[1] === id) r[8] = d; };
  T('t_sdGap', '突刺；對手物防下降時威力 ×1.5；對護盾傷害 ×2。'); T('t_sdFlow', '五段連斬；會心的那段對護盾傷害再 ×1.5。');
  T('t_axSplit', '重劈，對護盾傷害 ×2。'); T('t_axCrush', '對護盾傷害 ×3。'); T('t_spBreak', '對護盾傷害 ×2；對蓄力中的對手威力 ×1.5。');
  T('t_fsStorm', '八段連打，對護盾傷害 ×2。'); T('t_gnAp', '無視 40% 物防，對護盾傷害 ×2。'); T('t_dsStar', '兩道十字斬，會心時對護盾傷害再 ×1.5；對破防中的對手威力 ×1.3。');
  T('t_shRam', '衝撞，對護盾傷害 ×2；每層盾勢威力 +25%，用掉盾勢。');
  T('t_zjHolyWall', '消耗全部守勢（至少 2），每點威力 +15；之後張開護盾（最大 HP 30%、吸收 75%；守勢 4 以上 2 回合）。');
  T('t_stWall', '張開護盾：最大 HP 25%（每級 +3%），魔法傷害全部吸收、物理吸收一半，2 回合。');
  TREE11['劍'].trait = '會心時對護盾的傷害再 ×1.5'; TREE11['斧'].trait = '普通攻擊對護盾的傷害 ×1.5';
  SP_TXT11.chip = '追擊，對護盾傷害 ×2'; SP_TXT11.guard = '張開護盾（最大 HP 25%、吸收 75%）';
  START_TXT12.劍 = '均衡的近身武器，會心打護盾特別痛。'; START_TXT12.斧 = '一擊很重，普攻打護盾更痛。';
  if (SPECIALS.deathWard) SPECIALS.deathWard.d = '每場戰鬥一次：HP 低於 30% 時張開護盾（最大 HP 30%、全部吸收、2 回合）。'; }
const WARD_HELP12 = ['護盾：主角的護盾照最大 HP 的比例張開，打過來的傷害有一部分（通常一半）先打在護盾上；到自己下一次行動前有效（有的招會更久）。',
  '魔物的護盾：菁英・頭目蓄力時、HP 掉到一定程度時、每隔幾回合會張開護盾，打在上面的傷害不扣血。在牠下次行動前打破 → 破防！會心對護盾加倍，有的招式和裝備也特別會破盾。',
  '破防：跳過牠下一次行動、受到的傷害 +50%、打斷蓄力，頭目還能打部位。打不破的話，蓄力大招就選「防禦」。'];
if (typeof BATTLE_HELP !== 'undefined') { for (const b of BATTLE_HELP) if (Array.isArray(b[1])) b[1] = b[1].filter(t => typeof t !== 'string' || !/^破防：/.test(t)).map(t => typeof t === 'string' ? t.replace('魔法護盾：受到的傷害減少40%。', '護盾：張開時，打過來的傷害有一部分先打在護盾上。') : t);
  const P = BATTLE_HELP.find(q => q[0] === '如何避免'); if (P) P[1].splice(1, 0, '破防：在魔物的護盾消失前把它打破（詳見「護盾」那一頁）。'); BATTLE_HELP.push(['護盾', WARD_HELP12]); }
GROW12.push(['護盾', WARD_HELP12.join('')]);

/* ---------- 戰鬥畫面 ---------- */
delete BADGE_OF.barrier;
{ const H = Battle.prototype.handlers;
  const _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) {
    if (!t || P.failed || P.status !== 'barrier') return yield* _ap.call(this, e, s, t, P);
    const d = P.data || {}, C = this.center(t); t.st.barrier = 1; t.st.ward = Math.round(d.amt || 0); t.st.wardMax = Math.round(d.max || d.amt || 1); t.st.wardTurns = d.turns || 1;
    if (P.quiet) return; yield* FX.barrier.call(this, C);
    yield* this.msg(t.n + (P.refreshed ? '的護盾變強了！' : '張開了護盾！') + '（' + t.st.ward + '）', { hold: 22 });
    const f = Game.st.flags; if (!t.hero && !f.tutWard12) { f.tutWard12 = 1; yield* this.msg('（魔物張開了護盾！打在護盾上的傷害不扣血。在牠下次行動前打破它就會「破防」：會心對護盾加倍。）', { wait: true }); } };
  const _sg = H.statusGone; H.statusGone = function* (e, s, t, P, expire) { if (!t || P.status !== 'barrier') return yield* _sg.call(this, e, s, t, P, expire);
    delete t.st.barrier; delete t.st.ward; if (P.why === 'down') return; const C = this.center(t);
    if (P.why === 'broken') { Sound.sfx('rock'); if (this.sparks) this.sparks(C.x, C.y, 12, ['#c8e0ff', '#80a8e0'], 2.8); yield* this.msg(t.n + '的護盾被打破了！', { hold: 20 }); }
    else yield* this.msg(t.n + '的護盾消失了。' + (!t.hero && t.charging ? '（沒能打破，蓄力繼續）' : ''), { hold: 18 }); };
  const _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (t && P.ward > 0) { t.st.ward = P.wardLeft || 0; Sound.sfx('shield'); const C = this.center(t); this.spawn({ k: 'hex', x: C.x, y: C.y, r0: 22, r1: 10, c: '#a8d8ff', life: 10 });
      this.popNum(t, '盾 −' + P.ward, '#a8e0ff', P.wardMul > 1 ? '×' + P.wardMul : null, { small: true, dy: P.amount > 0 ? -14 : 0 }); }
    return yield* _dm.call(this, e, s, t, P); }; }
function drawWardTag12(x, X, Y, n, turns, hero) { const s = String(n), w = Math.max(24, Math.ceil(Font.width(s, 8)) + 13);
  x.fillStyle = 'rgba(8,16,30,0.85)'; x.fillRect(X, Y, w, 11); x.fillStyle = '#7ec8ff'; x.fillRect(X, Y, w, 1); x.fillRect(X, Y + 10, w, 1); x.fillRect(X, Y, 1, 11); x.fillRect(X + w - 1, Y, 1, 11);
  x.fillStyle = '#a8e0ff'; x.fillRect(X + 3, Y + 3, 5, 4); x.fillRect(X + 4, Y + 7, 3, 1); // shield glyph
  Font.drawR(x, s, X + w - 3, Y - 2, '#e8f6ff', '#000000', 8); return w; }
{ const _pb = Battle.prototype.drawPlateBig; Battle.prototype.drawPlateBig = function (x, F, a0) { const ch = F && F.charging, wd = F && F.st && F.st.ward > 0;
    const cs = F && F.st && F.st.charging; if (wd && ch) F.st.charging = 0; try { _pb.call(this, x, F, a0); } finally { if (wd && ch) F.st.charging = cs; }
    if (!wd) return; const a = a0 * (F.plateA ?? 1); if (a <= 0) return; x.globalAlpha = a; const py = 6, pe = plateExtra(), w = 120, X = (W - w) / 2;
    drawWardTag12(x, 2, py + 12, F.st.ward); const r = clamp(F.st.ward / (F.st.wardMax || 1), 0, 1); x.fillStyle = '#7ec8ff'; x.fillRect(X + 7, py + 28, Math.round((w - 14) * r), 1);
    if (!F.broken) { const lt = ch ? '蓄力中！這回合打破護盾就能打斷' : '護盾：牠下次行動前打破就破防', lw = Font.width(lt, 10) + 10; x.fillStyle = 'rgba(6,8,18,0.72)'; x.fillRect(Math.round(W / 2 - lw / 2), py + 46 + pe, Math.round(lw), 13); // v12.68: a dark strip so damage numbers don't garble it
      Font.drawC(x, lt, W / 2, py + 45 + pe, ch ? (Math.floor(this.t / 8) % 2 ? '#ff7a6a' : '#a8e0ff') : '#a8e0ff', '#000000', 10); }
    x.globalAlpha = 1; }; }
{ const _ps = Battle.prototype.drawPlateSmall; Battle.prototype.drawPlateSmall = function (x, v, a, i, n) { _ps.call(this, x, v, a, i, n); if (!(v && v.st && v.st.ward > 0) || a <= 0) return;
    const sw = Math.floor((W - 4) / Math.max(1, n)), w = Math.min(n >= 3 ? 56 : 80, sw - 2), X = Math.round(clamp(v.x - w / 2, 2 + i * sw, 2 + i * sw + sw - 2 - w));
    x.globalAlpha = a; x.fillStyle = '#7ec8ff'; x.fillRect(X + 3, 4 + 11, Math.round((w - 6) * clamp(v.st.ward / (v.st.wardMax || 1), 0, 1)), 2); x.globalAlpha = 1; }; }
{ const _db = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) { _db.call(this, x); const Hv = this.H; if (!Hv || !Hv.st || !(Hv.st.ward > 0) || Math.round(this.boxH) >= BH) return;
    const C = this.center(Hv); drawWardTag12(x, Math.max(2, Math.round(C.x - 50 + Hv.off.x)), Math.round(HERO_FOOT - 44 + Hv.off.y), Hv.st.ward); }; }
// after each played action the views are rebuilt from the statuses: keep the shield's numbers
{ const _sy = Battle.prototype.sync; Battle.prototype.sync = function () { _sy.call(this); for (const u of this.core.units) { const v = this.views[u.id], d = wardOf12(this.core, u); if (!v) continue;
    if (d && d.amt > 0) { v.st.ward = Math.round(d.amt); v.st.wardMax = Math.round(d.max || d.amt); } else delete v.st.ward; } }; }
