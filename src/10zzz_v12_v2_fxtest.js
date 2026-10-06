/* ===================== v12.31 特效測試版（玩家 2026-10-06：「給我一個測試版本 我要看目前全部的技能特效」） =====================
   只有測試版的頁面（先設 window.FXTEST）才有作用，正式版完全不變。
   標題畫面 →「特效測試」→ 選一棵技能樹（9 種武器＋雙刀・雙劍・雙盾＋共通）→ 跟三個打不倒、也不會動的樹樁怪打：
   · 主角 Lv50，那棵樹全部學滿、裝 T5 的那種武器（雙持就兩把，雙盾兩面盾）。
   · 「技能」列出這棵樹全部的招，最後幾個是特技（選了之後用一次普攻，特技就會發動）。
   · 每次輪到主角，HP・MP 補滿、冷卻清掉。「逃跑」一定成功，回到選技能樹。 */
const FXT13 = { on: false, kind: null, sp: {} };
const fxtest13 = () => typeof window !== 'undefined' && !!window.FXTEST;
const fxtBase13 = k => k === '雙刀' ? '短刀' : k === '雙劍' ? '劍' : null;
function fxtSetup13(kind) { const st = Game.st, T = tr11(st), base = fxtBase13(kind), common = !!TREE11[kind].common;
  for (const f in UNLOCK11) st.flags[f] = 1; st.lv = 50; T.lv = {}; T.eq = {};
  for (const k of [kind].concat(base ? [base] : [])) for (const N of treeNodes11(k)) T.lv[N.key] = N.max;
  if (!common && (TREE11[kind].sp || []).length) T.eq[kind] = 0;
  const mk = b => { GEAR11_GLAM = false; try { return makeGear(b, 3).u; } finally { GEAR11_GLAM = true; } };
  st.gear = []; st.equip = { ...(st.equip || {}), weapon: null, shield: null };
  if (kind === '雙盾') { st.equip.weapon = mk(BASE11.shield[4]); st.equip.shield = mk(BASE11.shield[4]); }
  else if (kind === '單手盾') { st.equip.weapon = mk(BASE11.weapon['劍'][4]); st.equip.shield = mk(BASE11.shield[4]); }
  else if (base) { st.equip.weapon = mk(BASE11.weapon[base][4]); st.equip.shield = mk(BASE11.weapon[base][4]); }
  else st.equip.weapon = mk(BASE11.weapon[common ? '劍' : kind][4]);
  st.hp = heroStats(st).hp; st.mp = heroStats(st).mp; }
// the hero's skill list = the whole tree (+ its specials)
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!FXT13.on || !st) return s; const k = FXT13.kind, T = TREE11[k];
    const w = gearBy(st.equip.weapon, st), tier = clamp((w && GEAR[w.b].t) || 1, 1, 7), mag = s.data.wcat === '特';
    const sk = (T.sk || []).map(q => 't_' + q[1]).filter(id => DEF.skills[id]), sp = T.common ? [] : (T.sp || []).map((q, j) => spId11(k, j, tier, mag)).filter(id => DEF.skills[id]);
    FXT13.sp = {}; sp.forEach((id, j) => { FXT13.sp[id] = j; const D = DEF.skills[id], [n, ty] = T.sp[j]; if (D && !/^特技/.test(D.desc || '')) D.desc = '特技「' + n + '」：' + (SP_TXT11[ty] || '') + '。平常是普通攻擊累積層數後自動發動；這裡選了以後，下一次普攻就發動。'; });
    s.skills = [s.data.attackSkill].concat(sk, sp).filter((v, i, a) => v && a.indexOf(v) === i); return s; }; }
// dummies: can't fall, don't act, don't hurt
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!FXT13.on || !s) return s;
    s.stats.hp = 999999; s.hp = s.stats.hp; s.stats.atk = 1; s.stats.spa = 1; return s; }; }
{ const _d = BAI.decide; BAI.decide = function (core, u, o) { if (FXT13.on && !u.hero) return { type: 'wait' }; return _d.call(this, core, u, o); }; }
{ const H = Battle.prototype.handlers, _m = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { if (FXT13.on && P && P.key === 'wait') return; return yield* _m.call(this, e, s, t, P); }; }
{ const _e = BR.escape; BR.escape = function (core, u, n) { return FXT13.on ? true : _e.call(this, core, u, n); }; }
// every turn: HP・MP full, no cooldowns; a special is shown by the next normal attack
{ const _c = Battle.prototype.command; Battle.prototype.command = function* () { if (!FXT13.on) return yield* _c.call(this);
    const c = this.core, hu = c.byId.H; for (const r in hu.max || {}) if (r !== 'wc' && hu.max[r] > 0) hu.res[r] = hu.max[r]; // HP・MP・氣・守勢 全滿 hu.cd = {}; for (const k in c.data) if (/^skill\|H\|/.test(k)) c.data[k] = 0; if (this.sync) this.sync();
    const cmd = yield* _c.call(this);
    if (cmd && cmd.type === 'skill' && FXT13.sp[cmd.skill] != null) { const j = FXT13.sp[cmd.skill], k = FXT13.kind, foe = c.alive('B')[0];
      hu.data.wspSkill = cmd.skill; hu.data.wspName = TREE11[k].sp[j][0]; hu.data.wspFx = 'sp11_' + TREE_KINDS11.indexOf(k) + '_' + j; hu.res.wc = Math.max(0, ((hu.max && hu.max.wc) || 3) - 1);
      return { type: 'skill', skill: hu.data.attackSkill, targets: cmd.targets && cmd.targets.length ? cmd.targets : [foe.id] }; }
    return cmd; }; }
// the skill pop-up shows 5 at a time: pick a group first (招式 1〜5・6〜10・特技)
{ const _cm = Battle.prototype.chooseMove; Battle.prototype.chooseMove = function* () { if (!FXT13.on) return yield* _cm.call(this);
    const hu = this.core.byId.H, all = hu.skills.slice(), atk = hu.data.attackSkill, L = all.filter(id => id !== atk && DEF.skills[id]), sp = L.filter(id => FXT13.sp[id] != null), sk = L.filter(id => FXT13.sp[id] == null), P = [];
    for (let i = 0; i < sk.length; i += 5) P.push(['招式 ' + (i + 1) + '〜' + Math.min(sk.length, i + 5), sk.slice(i, i + 5)]); if (sp.length) P.push(['特技（選了以後普攻一次就發動）', sp]);
    const idx = this.fxtIdx || (this.fxtIdx = {});
    while (true) { const r = P.length > 1 ? yield* choose(P.map(q => q[0]), { title: '哪一組？', index: this.fxtPage || 0, cancel: true }) : 0; if (r < 0) return null; this.fxtPage = r;
      hu.skills = [atk].concat(P[r][1]); this.moveIdx = idx[r] || 0; let out; try { out = yield* _cm.call(this); } finally { hu.skills = all; } if (out) { idx[r] = this.moveIdx; return out; } if (P.length <= 1) return null; } }; }
// no saving in the test page
if (fxtest13()) { if (typeof saveGame === 'function') saveGame = function () {}; }
function* fxtMenu13() { const K = TREE_KINDS11.filter(k => !TREE11[k].common && (typeof kindOn13 !== 'function' || kindOn13(k))).concat(COMMON11.filter(k => (TREE11[k].sk || []).length).slice(0, 1)); let i = 0;
  while (true) {
    const lab = k => (TREE11[k].common ? '共通' : k) + '（' + (TREE11[k].sk || []).length + (TREE11[k].common ? '' : '＋' + (TREE11[k].sp || []).length) + '）';
    const r = yield* choose(K.map(k => ({ t: lab(k) })), { x: 8, y: 30, w: W - 16, cols: 2, colW: (W - 24) / 2, cancel: true, index: i, title: '特效測試：選技能樹' });
    if (r < 0) continue; i = r; const kind = K[r];
    fxtSetup13(kind); FXT13.on = true; FXT13.kind = kind;
    try { yield* Game.scene.battleScript({ sp: 'stumpling', lv: 30, kind: 'wild', extra: [['stumpling', 30], ['stumpling', 30]], fxtest: 1 }); }
    finally { FXT13.on = false; }
  } }
if (fxtest13()) { const _tm = TitleScene.prototype.menu; TitleScene.prototype.menu = function* () {
    const r = yield* choose(['特效測試', '一般遊戲'], { x: 38, y: 168, w: 100, cancel: true }); if (r < 0) { this.stage = 'press'; return; }
    if (r === 1) return yield* _tm.call(this);
    Game.st = newGameState('測試'); const st = Game.st; st.map = 'route'; st.x = 10; st.y = 20; st.status = null; st.flags.tutInert11 = 1; st.flags.tutPart11 = 1; st.flags.tutWard12 = 1;
    yield* fadeOut(20); startOverworld(); Game.noEnc = 1; const ow = Game.scene; UI.clear(); ow.script = null; ow.run(fxtMenu13()); Game.sys.push(fadeIn(20)); }; }
