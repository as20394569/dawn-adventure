/* ===================== v12.2 第三階段：慣性・破防時打部位（企劃〈第三階段清單〉，玩家 2026-10-04 三題都照建議、名字照清單） =====================
   1. 慣性（只對菁英・頭目）：攻擊分普攻・物理技能・魔法技能三類。主角每次行動打到牠：用的那一類 −10%、另外兩類各 +10%（50%〜200%，這場戰鬥內有效）。
      頭目名牌左邊顯示「普・物・魔」現在的百分比。魔導書的特性：用的那一類只 −5%。
   2. 破防時打部位（13 隻主線頭目，每隻 2 個部位）：頭目破防中，選目標時多出牠的兩個部位。部位耐久＝最大 HP 的 10%；
      打部位的傷害同時算進本體 HP，但不吃破防的 +50%。打壞：對應的那一招威力 −50%、立刻得到 1 個牠的稀有部位、這場經驗 +20%。
   3. 換回原本的效果：長槍的特性「打部位的傷害 +30%」、魔導書的特性「慣性的變化減半」、楓林鹿王晶石「打部位的傷害 +20%」。 */

/* ---------- 1. 慣性 ---------- */
const IN11 = { step: 10, lo: 50, hi: 200 };
const inCat11 = sk => !sk ? null : (sk.tags || []).includes('basic') ? 'b' : sk.cat === '物' ? 'p' : 'm';
const inOf11 = u => u && !u.hero && (u.elite || u.boss) ? (u.data.in11 || (u.data.in11 = { b: 100, p: 100, m: 100 })) : null;
BR.FORMULA.inert11 = c => { const t = c.tgt; if (!c.src || !c.src.hero || !t || t.hero || !(t.elite || t.boss) || !t.data.in11) return 1; const k = inCat11(c.skill); return k ? t.data.in11[k] / 100 : 1; };
PV('ss11', () => ({ mods: [{ stage: 'status', who: 'attacker', mul: { f: 'inert11' }, cond: { hasPower: 1 } }] }), { n: '慣性' });
const inShift11 = (u, t, sk) => { const I = inOf11(t), k = inCat11(sk); if (!I || !k) return; const half = u.mods.some(m => m.inertHalf11);
  for (const q of ['b', 'p', 'm']) I[q] = clamp(I[q] + (q === k ? -IN11.step * (half ? 0.5 : 1) : IN11.step), IN11.lo, IN11.hi); };

/* ---------- 破防的時間：跳過牠一次行動，而且主角一定有一次行動打得到 ----------
   原本破防在牠「被跳過的那次行動」結束就解除：主角比較快時，破防的那一回合牠馬上被跳過，主角下一次行動時已經解除，
   +50% 和打部位都碰不到。改成：牠被跳過一次「而且」主角在破防之後又行動過一次，兩個都做到才解除。
   牠在主角行動之前又輪到一次（狂怒的兩次行動），第二次照常行動。 */
{ const B = DEF.statuses.broken, _bl = B.blockAction; B.clearAt = null; B.blockAction = (core, u, s, cmd) => s.skip11 ? null : _bl(core, u, s, cmd);
  const P = BattleCore.prototype, _ea = P.endAction; P.endAction = function (cmd, executed) { const u = this.byId[cmd.actor], H = this.byId.H, r = _ea.call(this, cmd, executed);
    if (u && !cmd.reaction && H) for (const f of this.units) { if (f.side === H.side || !this.isUp(f)) continue; const s = this.statusOf(f, 'broken'); if (!s) continue;
      if (s.heroAt11 == null) s.heroAt11 = H.actedTotal; if (u === f && !executed) s.skip11 = 1;
      if (s.skip11 && H.actedTotal > s.heroAt11) this.removeStatus(f, 'broken', 'expire'); }
    return r; }; }

/* ---------- 2. 部位 ---------- */
const PART_BODY11 = {
  banditBoss: [['巨斧', 'm_gutSlash'], ['飛刀袋', 'm_knife']], duneWorm: [['巨牙', 'm_wormBite'], ['背殼', 'm_devour']], golem: [['右臂', 'm_boulder'], ['紅核', 'm_rumble']],
  crystalGolem: [['晶刺', 'm_crystalShard'], ['稜鏡', 'm_prismRay']], silverWyrm: [['龍顎', 'm_wyrmBite'], ['逆鱗', 'm_moonTide']], hydra: [['中央蛇首', 'm_tripleBite'], ['毒腺', 'm_hydraFlood']],
  ratKing: [['王冠', 'm_crownBash'], ['肚囊', 'm_kingsFeast']], harvestGolem: [['鐮刀臂', 'm_scytheSweep'], ['麥穗冠', 'm_harvest']], clockColossus: [['齒輪臂', 'm_gearCrush'], ['鐘面', 'm_twelveStrike']],
  frostQueen: [['冰杖', 'm_iceShard'], ['冰冠', 'm_absoluteZero']], lavaGiant: [['右拳', 'm_magmaFist'], ['熔核', 'm_eruption']], victorDemon: [['利爪', 'm_demonClaw'], ['魔角', 'm_tyranny']],
  shadowGeneral: [['護臂', 'm_shadowSlash'], ['影刃', 'm_eclipseBlade']],
};
const PART_HP11 = 0.1, PART_WEAK11 = 0.5, PART_EXP11 = 0.2;
for (const sp in PART_BODY11) for (const [n, mv] of PART_BODY11[sp]) if (!DEF.skills[mv] || !SPECIES[sp]) bvErr('s2', 'part ' + sp + ' ' + n + ' → ' + mv);
const mvName11 = id => (DEF.skills[id] && DEF.skills[id].name) || (MOVES[id] && MOVES[id].n) || id;
const partsOf11 = u => { if (!u || !u.boss || !PART_BODY11[u.sp]) return null;
  return u.data.parts11 || (u.data.parts11 = PART_BODY11[u.sp].map(([n, mv]) => { const m = Math.max(1, Math.round(u.max.hp * PART_HP11)); return { n, mv, max: m, hp: m, gone: 0 }; })); };
// can the hero aim at a part right now?
const partOpen11 = (core, u) => !!(u && u.boss && core.isUp(u) && core.hasStatus(u, 'broken') && partsOf11(u));
COND.part11 = (c, v) => !!(c.core && c.core.part11 && c.tgt && c.core.part11.t === c.tgt.id) === !!v;
COND.partWeak11 = (c, v) => { const W = c.src && c.src.data && c.src.data.partWeak11, id = c.ev && c.ev.payload && c.ev.payload.skill; return !!(W && id && W[String(id).replace(/^hc_/, '')]) === !!v; };
// a hit on a part does not get the +50% of 破防 (that is the price of aiming at it)
for (const m of DEF.statuses.broken.mods || []) m.cond = { ...(m.cond || {}), part11: 0 };
EFFECT_TYPES.part_weak = { exec(core, ef, ctx) { const e = ctx.pre; if (!e) return; e.payload.amount = Math.max(1, Math.floor(e.payload.amount * PART_WEAK11)); (e.payload.notes || (e.payload.notes = [])).push('part11'); } };
defPut('mechanics', 'part11', { triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'src', cond: { partWeak11: 1 }, prio: 20, effects: [{ type: 'part_weak' }] }] });
BV_TEXT.part11 = (s, t, P) => s + '的「' + P.pn + '」被打壞了！' + P.mn + '的威力減半了！';
function partHit11(core, src, t, k, a) { const P = partsOf11(t), p = P && P[k]; if (!p || p.gone || !(a > 0)) return;
  p.hp = Math.max(0, p.hp - a); if (p.hp > 0) return;
  p.gone = 1; (t.data.partWeak11 || (t.data.partWeak11 = {}))[p.mv] = 1; core.data.partsBroken11 = (core.data.partsBroken11 || 0) + 1;
  core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { key: 'part11', pn: p.n, mn: mvName11(p.mv), part11: t.sp } }); }
{ const P = BattleCore.prototype;
  const _ds = P.doSkill; P.doSkill = function (u, sk, tg, cmd) {
    const k = cmd && cmd.meta && cmd.meta.part11, prev = this.part11; let set = false;
    if (u && u.hero && k != null && tg && tg[0] && partOpen11(this, tg[0])) { const p = partsOf11(tg[0])[k]; if (p && !p.gone) { this.part11 = { t: tg[0].id, k }; set = true; } }
    let r; try { r = _ds.call(this, u, sk, tg, cmd); } finally { if (set) this.part11 = prev; }
    if (u && u.hero && sk && sk.power && !(cmd && cmd.reaction)) for (const t of tg || []) if (t && t.side !== u.side) inShift11(u, t, sk);
    return r; };
  const _dd = P.dealDamage; P.dealDamage = function (src, tgt, amount, info = {}) { const e = _dd.call(this, src, tgt, amount, info), Q = this.part11;
    if (e && !e.cancelled && Q && tgt && tgt.id === Q.t && src && src.hero) partHit11(this, src, tgt, Q.k, e.payload.amount || 0); return e; }; }
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, ...a) { const s = _ue.call(this, core, sp, lv, kind, ...a);
    if (s && kind === 'boss' && PART_BODY11[sp]) { const M = s.data.mechanics || (s.data.mechanics = []); if (!M.includes('part11')) M.push('part11'); } return s; }; }
// the parts' rare drop the moment it breaks; 經驗 +20% for each broken part
{ const H = Battle.prototype.handlers, _m = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { yield* _m.call(this, e, s, t, P);
    if (P && P.part11) { const it = 'pr_' + P.part11, st = Game.st; if (ITEMS[it] && st) { st.bag[it] = (st.bag[it] || 0) + 1; Sound.sfx('item'); yield* this.msg('得到了「' + ITEMS[it].n + '」！', { hold: 20 }); } } }; }
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const n = (this.core && this.core.data.partsBroken11) || 0; if (n) a = Math.max(1, Math.round(a * (1 + PART_EXP11 * n))); return yield* _ge.call(this, a); }; }

/* ---------- 選目標：破防中的頭目多出兩個部位 ---------- */
let PART_PICK11 = null;
{ const _pt = Battle.prototype.pickTarget; Battle.prototype.pickTarget = function* (skill) { PART_PICK11 = null;
    const core = this.core, D = DEF.skills[skill], L = this.foes().filter(v => core.isUp(v.u)), E = [];
    for (const v of L) { E.push({ v }); if (D && D.power && D.target === 'enemy' && partOpen11(core, v.u)) partsOf11(v.u).forEach((p, k) => { if (!p.gone) E.push({ v, k, p }); }); }
    if (E.length === L.length) return yield* _pt.call(this, skill);
    const f = Game.st.flags; if (!f.tutPart11) { f.tutPart11 = 1; yield* this.msg('（頭目破防中可以打牠的部位！部位打壞了，對應的招式威力減半，還會掉稀有部位。打部位不吃破防的 +50%。）', { hold: 40 }); }
    let i = 0; const self = this; this.idle = true;
    const est = q => { const prev = core.part11; core.part11 = q.p ? { t: q.v.id, k: q.k } : null; try { return self.estimate(skill, q.v.id); } finally { core.part11 = prev; } };
    const pick = { draw(x) { const q = E[i]; drawWin(x, 4, BB_Y + 1, W - 8, BB_H - 2, 'menu'); Font.draw(x, '選擇目標　' + (i + 1) + '/' + E.length, 10, BB_Y + 1, UIC.accent, UIC.textSh, 8);
        Font.drawR(x, Game.touchUI ? '◀ ▶ 切換・點魔物決定' : '←→ 選擇　A 決定', W - 10, BB_Y + 1, UIC.muted, UIC.textSh, 8);
        const t = q.p ? '◆' + q.p.n + '　耐久 ' + Math.ceil(q.p.hp) + '/' + q.p.max : q.v.n + '　HP ' + Math.ceil(q.v.hp) + '/' + q.v.maxhp; Font.draw(x, t, 10, BB_Y + 11, q.p ? '#ffd070' : UIC.text, UIC.textSh, 9);
        const n = est(q); if (n) Font.drawR(x, '預估≈' + n, W - 10, BB_Y + 11, UIC.warm, UIC.textSh, 9);
        if (q.p) Font.draw(x, '打壞：「' + mvName11(q.p.mv) + '」威力減半＋稀有部位', 10, BB_Y + 22, UIC.muted, UIC.textSh, 7);
        if (typeof touchRegion === 'function') { touchRegion(0, 0, W, BH, () => {}); for (const v of L) touchRegion(v.x - 28, v.foot - v.bbh - 30, 56, v.bbh + 34, () => { if (E[i].v === v) tapKey('a'); else { i = E.findIndex(q => q.v === v); Sound.sfx('cursor'); } });
          touchRegion(0, BB_Y, W / 2, BB_H, () => tapKey('left')); touchRegion(W / 2, BB_Y, W / 2, BB_H, () => tapKey('right')); } } };
    UI.push(pick); let out = null;
    while (true) { this.pickV = E[i].v; yield;
      if (Input.pressed('left') || Input.pressed('up')) { Input.consume('left', 'up'); i = (i + E.length - 1) % E.length; Sound.sfx('cursor'); }
      else if (Input.pressed('right') || Input.pressed('down')) { Input.consume('right', 'down'); i = (i + 1) % E.length; Sound.sfx('cursor'); }
      else if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); out = E[i].v.id; PART_PICK11 = E[i].p ? E[i].k : null; break; }
      else if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } }
    UI.remove(pick); this.pickV = null; this.idle = false; return out; }; }
{ const _c = Battle.prototype.command; Battle.prototype.command = function* () { PART_PICK11 = null;
    const f = Game.st && Game.st.flags; if (f && !f.tutInert11 && !Game.autoPlay && this.core.alive('B').some(u => u.elite || u.boss)) { f.tutInert11 = 1;
      yield* this.msg('（菁英・頭目會「慣性」：同一類攻擊一直用，那一類就變弱、另外兩類變強。普攻・物理技能・魔法技能輪流用最痛。名牌左邊的「普・物・魔」是現在的百分比。）', { hold: 40 }); }
    const r = yield* _c.call(this); if (r && r.type === 'skill' && PART_PICK11 != null) r.meta = { ...(r.meta || {}), part11: PART_PICK11 }; PART_PICK11 = null; return r; }; }

/* ---------- 名牌：慣性（左邊三格）・部位耐久（破防中） ---------- */
{ const _pb = Battle.prototype.drawPlateBig; Battle.prototype.drawPlateBig = function (x, F, a0) { _pb.call(this, x, F, a0); const u = F && F.u; if (!u || !(u.elite || u.boss)) return;
    const a = a0 * (F.plateA ?? 1); if (a <= 0) return; x.globalAlpha = a; const py = 6, pe = plateExtra(), I = u.data.in11 || { b: 100, p: 100, m: 100 };
    [['普', 'b'], ['物', 'p'], ['魔', 'm']].forEach(([n, k], j) => { const v = Math.round(I[k]), Y = py + 25 + j * 9; x.fillStyle = 'rgba(10,8,20,0.78)'; x.fillRect(2, Y, 25, 8);
      Font.draw(x, n, 3, Y - 2, UIC.muted, UIC.textSh, 7); Font.drawR(x, String(v), 26, Y - 2, v > 100 ? '#8af08a' : v < 100 ? '#ff7a6a' : UIC.text, UIC.textSh, 7); });
    const P = u.boss && F.broken && partsOf11(u); if (P) { const w = 120, X = (W - w) / 2, Y = py + 57 + pe;
      P.forEach((p, k) => { const cx = X + k * 62, r = clamp(p.hp / p.max, 0, 1); x.fillStyle = 'rgba(10,8,20,0.8)'; x.fillRect(cx, Y, 58, 11);
        Font.draw(x, p.n, cx + 2, Y - 1, p.gone ? UIC.dis : '#ffd070', UIC.textSh, 8); if (p.gone) Font.drawR(x, '打壞', cx + 56, Y - 1, '#ff7a6a', UIC.textSh, 7);
        else { x.fillStyle = '#2a2030'; x.fillRect(cx + 30, Y + 4, 26, 3); x.fillStyle = '#ffb040'; x.fillRect(cx + 30, Y + 4, Math.round(26 * r), 3); } }); }
    x.globalAlpha = 1; }; }

/* ---------- 3. 換回原本的效果 ---------- */
TREE11['長槍'].trait = '打部位的傷害 +30%'; TREE11['魔導書'].trait = '慣性的變化減半（用的那一類只 −5%）';
{ const D = DEF.passives.tr11, _mk = D.make; D.make = function (v, u) { const r = _mk.call(this, v, u), T = new Set((v && v.traits) || []);
    if (T.has('長槍')) { r.mods = r.mods.filter(m => !(m.mul === 1.2 && m.cond && m.cond.tgtStatus === 'broken')); r.mods.push({ stage: 'equipment', who: 'attacker', mul: 1.3, cond: { part11: 1, hasPower: 1 } }); }
    if (T.has('魔導書')) { r.mods = r.mods.filter(m => !(m.costMul === 0.8 && m.res === 'mp' && !m.cond)); r.mods.push({ inertHalf11: 1 }); }
    return r; }; }
CRY11.stagLord[2] = CRY11.stagLord[2].map(e => e[0] === 'brokenDmg' ? ['partDmg', e[1]] : e);
PV('cr.partDmg', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1 + v / 100, cond: { hasPower: 1, part11: 1 } }] }));
CRY_PAS11.add('partDmg');
{ const _t = cryEffText11; cryEffText11 = function (e, v) { return e[0] === 'partDmg' ? '打部位的傷害 +' + v + '%' : _t(e, v); }; }
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (st && !s.passives.some(p => p.key === 'ss11')) s.passives.push({ key: 'ss11', v: 1, src: 'base' }); return s; }; }

/* ---------- 說明・遭遇卡 ---------- */
{ const _fd = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _fd(sp, key, kind); if (PART_BODY11[sp]) L.push('部位（破防時打）：' + PART_BODY11[sp].map(([n]) => n).join('・')); return L; }; }
GROW12.push(['慣性', '菁英・頭目會「慣」：主角每次行動打到牠，用的那一類（普攻・物理技能・魔法技能）−10%，另外兩類各 +10%（50%〜200%）。輪流用最痛；戰鬥中名牌左邊有現在的百分比。魔導書的特性讓變化減半。'],
  ['打部位', '13 隻主線頭目各有 2 個部位。頭目破防中，選目標時可以選部位：傷害照算進 HP，但不吃破防的 +50%。部位打壞了，對應的招式威力減半，馬上掉 1 個稀有部位，這場經驗 +20%。長槍的特性和楓林鹿王晶石讓打部位更痛。']);
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.push(['慣性與部位', ['菁英・頭目會「慣性」：同一類攻擊（普攻／物理技能／魔法技能）一直用會變弱，另外兩類變強；名牌左邊「普・物・魔」是現在的百分比。', '頭目破防中可以打部位（選目標時多出來的◆）。打壞了那一招威力減半、掉稀有部位、經驗 +20%；打部位不吃破防的 +50%。']]);
