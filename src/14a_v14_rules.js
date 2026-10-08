/* ===================== v14.0 卡組職業：戰鬥規則 =====================
   玩家：「不如整個重製，改成卡片配套職業系統，整個遊戲圍繞著卡組變化展開」→ 沒有等級、沒有裝備，強度全看卡組。
   · 主角：職業給 HP（劍士 80、盜賊 70、法師 65、狂戰士 85），每擊敗一個主線頭目 +5；能力值不再用
   · 卡的數字直接寫在卡上；魔物的 HP、傷害依地區換算（保留原本的相對強弱與頭目機制）
   · 主角永遠先出牌，按「結束」後魔物照頭上的意圖行動
   · 魔物對主角：照原本的公式算「打掉一個標準主角多少比例」，再換成卡牌的數字 */
const KD = { EN: 3, DRAW: 5, HAND: 10 };
KD.on = core => !!(core && core.data && core.data.v14);
KD.use = (cfg) => !Game.noV14 && !(cfg && cfg.noV14) && !(typeof window !== 'undefined' && window.CARD_DEMO);
// piecewise-linear tables [[lv, value], …] (straight line past the ends)
KD.tab = (T, lv) => { if (lv <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (lv <= T[i][0]) { const [a, va] = T[i - 1], [b, vb] = T[i]; return va + (vb - va) * (lv - a) / (b - a); }
  const [a, va] = T[T.length - 2], [b, vb] = T[T.length - 1]; return vb + (vb - va) * (lv - b) / (b - a); };
// what the RPG had: a typical wild monster's HP by level, a standard hero's HP / defences by level, how much of that HP one monster attack took
KD.HP_TYP = [[1, 17], [2, 19], [7, 31], [12, 59], [17, 92], [22, 139], [27, 189], [32, 219], [37, 259], [42, 357], [47, 478], [52, 570], [57, 600], [70, 720]];
KD.REF = { hp: [[1, 17], [10, 44], [20, 95], [30, 120], [50, 145], [70, 175]], def: [[1, 13], [10, 26], [20, 55], [30, 80], [50, 100], [70, 125]], spd: [[1, 8], [10, 15], [20, 37], [30, 48], [50, 52], [70, 65]] };
KD.FRAC = [[1, 0.14], [10, 0.165], [25, 0.17], [32, 0.26], [40, 0.27], [47, 0.2], [55, 0.22], [70, 0.22]];
// what the card game wants: a typical wild monster's HP and one attack's damage, by area level
KD.HP_TGT = [[1, 12], [10, 24], [20, 36], [30, 46], [40, 55], [50, 64], [60, 72], [70, 80]];
KD.DMG_TGT = [[1, 5], [10, 8], [20, 10], [30, 11], [40, 12], [50, 13], [60, 14], [70, 15]];
KD.hpK = lv => KD.tab(KD.HP_TGT, lv) / KD.tab(KD.HP_TYP, lv);
KD.dmgK = lv => KD.tab(KD.DMG_TGT, lv) / (KD.tab(KD.FRAC, lv) * KD.tab(KD.REF.hp, lv));
// the demo's statuses (格擋・力量・虛弱・易傷・流血) work in v14 battles too (13a's c15On checks core.data.v14)
if (DEF.statuses.vuln15) DEF.statuses.vuln15.metadata.n = '易傷';
if (typeof BUFF12 !== 'undefined' && BUFF12.vuln15) Object.assign(BUFF12.vuln15, { n: '易傷', tip: '受到傷害 +50%' });
/* ---------- statuses ---------- */
KD.st = (id, n, k, tip, o = {}) => { defPut('statuses', id, { tags: [o.deb ? 'debuff' : 'buff'], duration: 'battle', stack: 'add', max: 999, metadata: { n } }); if (typeof BUFF12 !== 'undefined') BUFF12[id] = { n, k, tip, stacks: o.nostk ? 0 : 1 }; };
KD.st('pois14', '毒', 'deb', '回合結束失去 HP，然後 −1', { deb: 1 });
KD.st('burn14', '燃燒', 'deb', '回合結束失去 HP（不會減少）', { deb: 1 });
KD.st('tstr14', '力量↑', 'atk', '這回合每段傷害增加');
KD.st('nxa14', '蓄勢', 'atk', '下一張攻擊牌傷害增加');
KD.st('chgM14', '隕石', 'atk', '下回合開始落下');
for (const [id, n, k, tip] of [['pwLurk14', '潛伏', 'atk', '每回合得到飛刀'], ['pwKnife14', '飛刀術', 'atk', '飛刀傷害增加'], ['pwEnv14', '淬毒之刃', 'deb', '攻擊時讓敵人中毒'], ['pwPhantom14', '幻影步', 'atk', '每回合第一張攻擊打兩次'],
  ['pwKindle14', '點燃', 'deb', '每回合開始讓全體燃燒'], ['pwStatic14', '靜電場', 'atk', '打技能牌時電擊敵人'], ['pwMax14', '魔導極限', 'atk', '每回合能量增加'], ['pwPhoenix14', '不死鳥', 'def', '倒下時復活一次'],
  ['pwBlood14', '狂戰之血', 'atk', '攻擊時回復 HP'], ['pwRage14', '狂暴', 'atk', '失去 HP 時力量增加'], ['pwAsura14', '阿修羅', 'atk', '怒氣 4 就狂化'], ['pwVictor14', '魔人契約', 'atk', '每回合失去 HP、能量 +1'],
  ['pwMoon14', '月王冠', 'atk', '每回合多抽牌'], ['pwOtto14', '機關砲台', 'atk', '回合結束射擊敵人'], ['pwRock14', '岩之心', 'def', '每回合得到格擋']]) KD.st(id, n, k, tip);
const stkK = (u, id) => (typeof stk15 === 'function' ? stk15(u, id) : 0);
/* ---------- the hero: HP from the class, no stats, acts first ---------- */
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg = {}) { if (!KD.use(cfg) || typeof KD.maxHp !== 'function') return _hs.call(this, st, cfg);
    const mh = KD.maxHp(st), CL = KD.clsOf(st), statuses = []; if (st.status && DEF.statuses[st.status]) statuses.push({ id: st.status, dur: st.status === 'slp' ? (st.sleepT ?? 2) : null });
    return { id: 'H', side: 'A', hero: true, name: st.name, lv: st.lv, kind: 'hero', attr: typeof heroAttr === 'function' ? heroAttr(st) : {},
      stats: { hp: mh, mp: 0, atk: 10, def: 10, spa: 10, spd: 10, spe: 9999, crit: 0, hit: 0, eva: 0, resist: {}, wkind: CL.wkind }, hp: clamp(st.hp ?? mh, 0, mh), mp: 0, passives: [], skills: ['k14_end'], statuses,
      data: { mechanics: [], attackSkill: CL.atkSkill || 'k14_end', attackName: '攻擊', attackFx: 'slash', slots: [], skillNames: {} } }; }; }
// monsters: HP rescaled by their level (minions called in later too)
// a monster tougher than the area's usual one keeps that edge, but compressed (×5 HP → ×3.3) so elite / boss fights don't drag
KD.scale = (core, u) => { if (!u || u.side !== 'B' || (u.data && u.data.k14s)) return; u.data = u.data || {}; u.data.k14s = 1; const lv = u.lv || 1, ratio = u.max.hp / KD.tab(KD.HP_TYP, lv), r = u.res.hp / Math.max(1, u.max.hp);
  u.max.hp = Math.max(1, Math.round(KD.tab(KD.HP_TGT, lv) * (ratio > 1 ? Math.pow(ratio, 0.7) : ratio))); u.res.hp = Math.max(1, Math.round(u.max.hp * r)); };
{ const _b = BB.build; BB.build = function (cfg, st = Game.st) { const core = _b.call(this, cfg, st); if (KD.use(cfg)) { core.data.v14 = true; for (const u of core.side('B')) KD.scale(core, u); } return core; }; }
{ const _au = BattleCore.prototype.addUnit; BattleCore.prototype.addUnit = function (spec, ...a) { const r = _au.call(this, spec, ...a); if (KD.on(this)) for (const u of this.units) if (u.side === 'B') KD.scale(this, u); return r; }; }
// monster → hero: the RPG formula against a standard hero of the monster's level, then into card numbers
{ const _d = BR.damage; BR.damage = function (core, src, tgt, skill, o = {}) {
    if (!KD.on(core) || !tgt || !tgt.hero || !src || src.hero) return _d.call(this, core, src, tgt, skill, o);
    const lv = src.lv || 1, S = tgt.stats; tgt.stats = { ...S, def: KD.tab(KD.REF.def, lv), spd: KD.tab(KD.REF.spd, lv), hp: KD.tab(KD.REF.hp, lv) };
    let r; try { r = _d.call(this, core, src, tgt, skill, { ...o, preview: true, noCrit: true }); } finally { tgt.stats = S; } // v14.10: no 85〜100% roll and no crit — what the intent says is what lands
    const m = KD.dmgK(lv) * (stkK(src, 'weak15') ? 0.75 : 1) * (stkK(tgt, 'vuln15') ? 1.5 : 1); return { ...r, amount: Math.max(1, Math.round(r.amount * m)) }; }; }
// fixed monster damage (rocks, thorns…) the same way
{ const D = EFFECT_TYPES.damage, _x = D.exec; D.exec = function (core, ef, ctx, tg) { const a = ctx && ctx.owner;
    if (KD.on(core) && a && !a.hero && ef.flat != null && (tg || []).some(t => t && t.hero)) ef = { ...ef, flat: Math.max(1, Math.round(ef.flat * KD.dmgK(a.lv || 1))) }; return _x.call(this, core, ef, ctx, tg); }; }
// the hero always plays first
{ const _pp = BattleCore.prototype.planPrio; BattleCore.prototype.planPrio = function (u) { if (KD.on(this) && u && u.hero) return 999; return _pp.call(this, u); }; }
// sleep / freeze / stun don't cancel each card: the battle screen turns them into lost energy at the start of the turn (KD.ailments)
for (const id in DEF.statuses) { const S = DEF.statuses[id]; if (typeof S.blockAction !== 'function' || S.k14b) continue; const f = S.blockAction; S.k14b = f;
  S.blockAction = function (core, u, s, cmd) { if (KD.on(core) && u && u.hero) return null; return f.call(this, core, u, s, cmd); }; }
KD.AIL = { slp: ['睡著了', 2], frozen: ['被凍住了', 2], ice12: ['結冰了', 2], stun14: ['暈眩了', 2], flinch: ['退縮了', 1], ambush12: ['沒反應過來', 1], par: ['麻痺了', 1] };
KD.ailments = (core, H) => { let en = 0; const out = [];
  for (const s of H.statuses.slice()) { const S = DEF.statuses[s.id], A = KD.AIL[s.id]; if (!S || !S.k14b || !A) continue; const why = S.k14b(core, H, s, {}); if (why) { en += A[1]; out.push(A[0] + '：能量 −' + A[1]); } }
  return { en, out }; };
// each card is its own action: the hero's per-action timers count once per turn (on 「結束」)
{ const _tk = BattleCore.prototype.tick; BattleCore.prototype.tick = function (u, when) {
    if (KD.on(this) && u && u.hero && /^owner_action/.test(when) && this.act && this.act.actor === u.id && this.act.skill !== 'k14_end') return; return _tk.call(this, u, when); }; }
{ const _ea = BattleCore.prototype.endAction; BattleCore.prototype.endAction = function (cmd, executed) {
    if (KD.on(this) && cmd && !cmd.reaction) { const u = this.byId[cmd.actor]; if (u && u.hero && this.isUp(u) && cmd.skill !== 'k14_end' && cmd.type !== 'run' && !this.ended() && !this.escaped) this.extraTurn(u, 'card14'); }
    return _ea.call(this, cmd, executed); }; }
/* ---------- card damage: base + 力量, 虛弱 ×0.75, 易傷 ×1.5, then the target's guard / defence stages / family weakness ---------- */
KD.hit = function (core, a, t, base, o = {}) {
  if (!t || !a || !core.isUp(t) || !core.isUp(a)) return 0;
  const sk = DEF.skills[core.data.skill14] || DEF.skills.attack, el = o.el || sk.el || '一般', cat = o.cat || sk.cat || '物';
  core.emit(EVT.HIT, { src: a, tgts: [t], payload: { skill: sk.id, hitIndex: o.i || 0, hits: o.n || 1 } });
  let d = base + (a.hero ? stkK(a, 'str15') + stkK(a, 'tstr14') : stkK(a, 'str15')) + (o.flat || 0);
  if (stkK(a, 'weak15')) d *= 0.75; if (stkK(t, 'vuln15')) d *= 1.5; d *= o.mul || 1;
  d *= BR.stageMul(BR.stage(core, a, cat === '特' ? 'spa' : 'atk')) / BR.stageMul(BR.stage(core, t, cat === '特' ? 'spd' : 'def'));
  const fam = BR.famMult(el, t); d *= fam;
  const c = { core, src: a, tgt: t, skill: sk, spent: 0, n: o.i || 0 };
  try { for (const m of BR.mods(core, a, t, sk, null, c)) { const v = BR.modVal(m, 'mul', c); if (v != null && v !== 1) d *= v; const dm = BR.modVal(m, 'defMul', c); if (dm) d /= dm; const w = fam > 1 ? BR.modVal(m, 'mulWeak', c) : null; if (w) d *= w; } } catch (e) { /* a modifier that needs the RPG formula's context: skip it */ }
  d = Math.max(0, Math.floor(d));
  const e = core.dealDamage(a, t, d, { kind: 'hit', skill: o.wardSkill || sk.id, el, cat, n: o.i || 0, mult: fam, crit: !!o.crit, tags: (sk.tags || []).concat(['card14']), min: 0 });
  return e && !e.cancelled ? e.payload.amount || 0 : 0; };
KD.block = (core, u, n) => { n = Math.floor(n); if (n > 0 && core.isUp(u)) core.applyStatus(u, u, 'blk15', { delta: n }); };
KD.add = (core, src, t, id, n) => { n = Math.floor(n); if (n > 0 && t && core.isUp(t)) core.applyStatus(src, t, id, { delta: n }); };
KD.heal = (core, u, n) => { n = Math.floor(n); if (n > 0 && core.isUp(u)) core.heal(u, u, n, {}); };
// the end of the round: 毒 then 燃燒 (the demo's wrapper already does 流血, 易傷 / 虛弱 −1)
{ const _re = BattleCore.prototype.roundEnd; BattleCore.prototype.roundEnd = function () {
    if (KD.on(this)) for (const u of this.units) { if (!this.isUp(u)) continue;
      const p = stkK(u, 'pois14'); if (p) { this.dealDamage(null, u, p, { kind: 'dot', cat: 'fixed', min: 1, tags: ['dot', 'card14'] }); if (this.isUp(u)) setStk15(this, u, 'pois14', p - 1); }
      const b = stkK(u, 'burn14'); if (b && this.isUp(u)) this.dealDamage(null, u, b, { kind: 'dot', cat: 'fixed', el: '火', min: 1, tags: ['dot', 'card14'] }); }
    return _re.call(this); }; }
