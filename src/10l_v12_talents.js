/* ===================== v12 天賦：3 流派 × 3 層（1／2／3 點）二選一 ＋ 核心天賦三選一（4 點，需該流派 6 點，只能 1 個） =====================
   docs/battle_v3_draft.md §4 (劍士) and docs/battle_v3_content.md §1 (other classes). Each option is a DEF.talents entry:
   `stat` = numbers applied to the hero's stats (〔數值〕), `rules` = switches the class rules read, `mods` / `trig` = battle behaviour.
   Points: Lv2 on, one every 2 levels, cap 20 (all of one class needs 22). Tier 3 and the keystones need 天賦覺醒. */
const TAL12_TREE = {}; // cls → { br: [[name, desc] ×3], keys: [[name, desc] ×3] }
const TAL12_KIND = { R: '規則', I: '互動', C: '轉換', N: '數值' };
function TL(cls, b, t, o, n, kind, d, x = {}) {
  const id = cls + '.' + (t < 0 ? 'k' + b : b + '.' + t + '.' + o);
  defPut('talents', id, { cls, branch: b, tier: t, opt: o, name: n, kind: TAL12_KIND[kind] || kind, desc: d, stat: x.stat || null, sum: x.sum || null, rules: x.rules || null,
    make: () => ({ rules: x.rules || {}, mods: x.mods || [], triggers: x.trig || [], immune: x.imm || [] }), tags: [], metadata: { n } });
}
const TK = (cls, b, n, d, x) => TL(cls, b, -1, 0, n, x.kind || 'R', d, x);
/* ---------- effect shorthands ---------- */
const E12 = {
  heal: (pct, x = {}) => ({ type: 'heal', target: 'self', pct, kind: 'regen', quiet: 1, ...x }),
  res: (res, amount, x = {}) => ({ type: 'resource', target: 'self', res, amount, ...x }),
  set: (res, set, x = {}) => ({ type: 'resource', target: 'self', res, set, ...x }),
  st: (status, target = 'self', x = {}) => ({ type: 'status', target, status, ...x }),
  stage: (stats, target = 'self', x = {}) => ({ type: 'stage', target, stats, ...x }),
  dmg: (power, target = 'event_target', x = {}) => ({ type: 'damage', target, power, ...x }),
  cd: (how, n = 1, x = {}) => ({ type: 'cooldown', target: 'self', how, n, ...x }),
  mark: (target = 'event_target', delta = 1) => ({ type: 'status', target, status: 'hunt_mark', delta, cond: { tgtAlive: 1 } }),
};
const MUL = (v, cond, who = 'attacker', stage = 'talent') => ({ stage, who, mul: v, cond });
const ROUND_HEAL = pct => TRG(EVT.ROUND_END, null, { ownerAlive: 1 }, [E12.heal(pct)]);
const ROUND_MP = pct => TRG(EVT.ROUND_END, null, { ownerAlive: 1 }, [{ type: 'resource', target: 'self', res: 'mp', pct, min: 1, why: 'regen' }]);
const OPEN_SHIELD = n => TRG(EVT.BATTLE_START, null, {}, [E12.st('barrier', 'self', { dur: n })]);
const COUNTER_ON_GUARD = (skill = 'counter_strike') => TRG(EVT.DAMAGE, 'tgt', { guarding: 1, srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, [{ type: 'counter', skill, why: 'counter', mul: { f: 'avengerMul' } }], { reaction: 1, limit: { perAction: 1 } });
const BASIC_EXTRA = (chance, power) => TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.dmg(power, 'event_target', { kind: 'extra', tags: ['multi_hit'] })], { chance, limit: { perAction: 1 } });
const ONCE_LOW = (pct, effects) => TRG(EVT.DAMAGE, 'tgt', { ownerHpBelow: pct, ownerAlive: 1 }, effects, { limit: { perBattle: 1 } });
const SIGD = (cls, effects, cond = {}) => TRG(EVT.SKILL_SUCCESS, 'src', { skillIs: 'sig_' + cls, ...cond }, effects);
/* ---------- extra conditions, formulas and effects the talents use ---------- */
Object.assign(COND, {
  tgtAnyOf: (c, v) => !!c.tgt && v.some(s => c.core.hasStatus(c.tgt, s)),
  ownerMpBelow: (c, v) => !!c.owner && (c.owner.max.mp || 0) > 0 && c.owner.res.mp < c.owner.max.mp * v,
  overheal: (c, v) => !!c.ev && ((c.ev.payload.over || 0) > 0) === !!v,
  evDeltaPos: (c, v) => !!c.ev && ((c.ev.payload.delta || 0) > 0) === !!v,
  fasterBy: (c, v) => !!c.src && !!c.tgt && BR.speed(c.core, c.src) >= v * BR.speed(c.core, c.tgt),
  ownerWkind: (c, v) => !!c.owner && c.owner.data.wkind === v,
  actSkill: (c, v) => !!c.core.act && c.core.act.skill === v,
  evWhyIn: (c, v) => !!c.ev && v.includes(c.ev.payload.why),
  noAttackRound: (c, v) => !!c.owner && (c.owner.data.atkRound !== c.core.round) === !!v,
  ownerBuffs: (c, v) => !!c.owner && c.owner.statuses.filter(s => DEF.statuses[s.id].group === 'stage' && s.stacks > 0).length >= v,
  elementWeapon: (c, v) => !!c.skill && !!c.owner && !!c.owner.data.welem && (c.skill.el === c.owner.data.welem) === !!v,
  dataAtLeast: (c, v) => !!c.owner && (c.owner.data[v[0]] || 0) >= v[1],
});
Object.assign(BR.FORMULA, {
  overMp: (c, v) => v * ((c.ctx && c.ctx.trigEv && c.ctx.trigEv.payload.over) || 0),
  cdRefund: c => { const ev = c.ctx && c.ctx.trigEv, sk = ev && DEF.skills[ev.payload.skill], m = sk && (sk.costs || []).find(x => x.res === 'mp'); return m ? Math.floor(c.core.costOf(c.owner, sk, m) * 0.3) : 0; },
  chiHeal: c => 0.02 * Math.abs((c.ctx && c.ctx.trigEv && c.ctx.trigEv.payload.change) || 0),
  chiGuard: c => 1 - 0.04 * ((c.tgt && c.tgt.res.chi) || 0),
  bossHeal: (c, v) => c.core.foesOf(c.owner || c.src).some(f => f.boss) ? v[1] : v[0],
  saintHits: c => Math.min(2, (c.src || c.owner).data.saint || 0),
});
Object.assign(EFFECT_TYPES, {
  data_add: { exec(core, ef, ctx) { const u = ctx.owner; u.data[ef.key] = Math.min(ef.max ?? 99, (u.data[ef.key] || 0) + (ef.n ?? 1)); } },
  data_set: { exec(core, ef, ctx) { const u = ctx.owner; u.data[ef.key] = ef.round ? core.round : ef.value; } },
  // 獵殺: the marks of a fallen monster move to another one
  mark_move: { exec(core, ef, ctx) { const u = ctx.owner, ev = ctx.trigEv, dead = ev && core.byId[ev.tgts[0]]; const n = BV12.markOf(core, u, dead); if (!n) return; core.removeStatus(dead, 'hunt_mark', 'moved', u);
    const t = core.foesOf(u)[0]; if (t) core.applyStatus(u, t, 'hunt_mark', { delta: n }); } },
  // 預讀: one 看破 for every family on the field
  insight_seed: { exec(core, ef, ctx) { const u = ctx.owner, I = u.data.insight || (u.data.insight = {}); for (const f of core.foesOf(u)) { const k = BV12.insightKey(core, u, f); I[k] = Math.max(I[k] || 0, 1); } } },
});
{ const A = EFFECT_TYPES.sigil_add.exec; EFFECT_TYPES.sigil_add.exec = function (core, ef, ctx, tg) { if (!ef.el) return A.call(this, core, ef, ctx, tg); const u = ctx.owner; if (!('sigil' in u.res)) return; const L = u.data.sigils || (u.data.sigils = []); if (L.includes(ef.el)) return; L.push(ef.el); core.changeRes(u, 'sigil', 1, { why: 'sigil:' + ef.el }); }; }
// 終曲: the basic attack turns into magic (the damage effect reads basicMagic modifiers)
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { const a = ctx.owner, sk = ctx.skill;
    if (a && sk && sk.tags.includes('basic') && !ef.cat && a.mods.some(m => m.basicMagic && condOk(m.cond, { core, owner: a, src: a, skill: sk }))) ef = { ...ef, cat: '特', mul: (ef.mul || 1) * 1.5, kind: ef.kind || 'finale' };
    return D.call(this, core, ef, ctx, tg); }; }
// a modifier may give a formula for the extra hits (劍聖)
{ const proto = BattleCore.prototype, ds = proto.doSkill; proto.doSkill = function (u, sk, tg, cmd) { const dyn = u.mods.filter(m => m.hitsAdd && typeof m.hitsAdd === 'object'); if (!dyn.length) return ds.call(this, u, sk, tg, cmd);
    const saved = dyn.map(m => m.hitsAdd); dyn.forEach(m => { m.hitsAdd = condOk(m.cond, { core: this, owner: u, src: u, skill: sk }) ? BR.val(m.hitsAdd, { core: this, owner: u, src: u, skill: sk }) : 0; });
    try { return ds.call(this, u, sk, tg, cmd); } finally { dyn.forEach((m, i) => { m.hitsAdd = saved[i]; }); } }; }

/* ======================= 劍士（劍意）— 第 1 部 §4.2 ======================= */
{ const c = 'swordsman', S = 'sig_swordsman';
  TAL12_TREE[c] = { br: [['疾風', '會心與連段'], ['血戰', '以血換力'], ['對決', '先制與反擊']] };
  TL(c, 0, 0, 0, '凝神', 'N', '會心率 +5%', { stat: { crit: 5 } });
  TL(c, 0, 0, 1, '流水', 'R', '獲得「連段」：連續使用不同技能每次 +1 段，每段傷害 +6%（最多 3 段）；重複同一招或防禦就中斷', { rules: { combo: 1 } });
  TL(c, 0, 1, 0, '燕返', 'I', '會心命中後，這次行動追加一擊（普攻威力的 50%），每次行動 1 次', { trig: [TRG(EVT.DAMAGE, 'src', { crit: 1, evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.dmg(20, 'event_target', { kind: 'swallow' })], { limit: { perAction: 1 } })] });
  TL(c, 0, 1, 1, '劍氣', 'C', '劍意已滿時，再得到的劍意改成回復 MP（每點 3）', { trig: [TRG(EVT.RESOURCE_OVERFLOW, 'tgt', { evRes: 'ki' }, [E12.res('mp', { f: 'overMp', v: 3 }, { why: 'kiMp' })])] });
  TL(c, 0, 2, 0, '破綻', 'I', '對破防中的魔物會心率 +30%', { mods: [{ stage: 'talent', who: 'attacker', critAdd: 30, cond: { tgtBroken: 1 } }] });
  TL(c, 0, 2, 1, '風舞', 'R', '連段上限 +2；連段 5 段時，武者一閃可以用連段代替劍意', { rules: { comboMax: 2, windDance: 1 } });
  TL(c, 1, 0, 0, '蠻勁', 'N', '物攻 +6%', { stat: { atkP: 6 } });
  TL(c, 1, 0, 1, '飲血', 'I', '武者一閃回復造成傷害的 15% HP', { trig: [SIGD(c, [{ type: 'heal', target: 'self', ofEvent: 0.15, field: 'total', kind: 'drain', quiet: 1 }])] });
  TL(c, 1, 1, 0, '怒吼', 'R', 'HP 低於 50% 時，被攻擊也會得到劍意', { trig: [TRG(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', hasPower: 1, ownerHpBelow: 0.5, ownerAlive: 1 }, [E12.res('ki', 1)], { limit: { perAction: 1 } })] });
  TL(c, 1, 1, 1, '劈裂', 'I', '物理會心命中讓目標物防 −1', { trig: [TRG(EVT.DAMAGE, 'src', { cat: '物', crit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.stage({ def: -1 }, 'event_target', { secondary: 1 })], { limit: { perAction: 1 } })] });
  TL(c, 1, 2, 0, '死鬥', 'C', 'HP 越低傷害越高（最多 +35%）', { mods: [{ stage: 'talent', who: 'attacker', mul: { f: 'lastStand' }, cond: { hasPower: 1 } }] });
  TL(c, 1, 2, 1, '不倒', 'R', '每場 1 次，受到致命傷害時留下 1 HP，並得到 3 劍意', { trig: ENDURE12([E12.res('ki', 3)]).triggers });
  TL(c, 2, 0, 0, '踏步', 'N', '速度 +8%', { stat: { speP: 8 } });
  TL(c, 2, 0, 1, '搶攻', 'R', '每場第一回合一定第一個行動', { mods: [{ firstRoundPrio: 1 }] });
  TL(c, 2, 1, 0, '回身', 'I', '防禦中被攻擊時反擊（斬擊威力 70%）', { trig: [COUNTER_ON_GUARD()] });
  TL(c, 2, 1, 1, '架勢', 'C', '防禦不再失去劍意，改成 +1 劍意', { rules: { kiGuard: 1 } });
  TL(c, 2, 2, 0, '看穿', 'I', '打中弱點時劍意 +1', { trig: [TRG(EVT.DAMAGE, 'src', { weakHit: 1, evHit: 1 }, [E12.res('ki', 1)], { limit: { perAction: 1 } })] });
  TL(c, 2, 2, 1, '見切', 'R', '比魔物先行動的回合，受到的第一次傷害 −50%', { trig: [TPRE(EVT.DAMAGE, 'tgt', { wentFirst: 1, srcSide: 'enemy', hasPower: 1 }, [{ type: 'modify', mul: 0.5, note: 'mikiri' }], { limit: { perRound: 1 } })] });
  TK(c, 0, '無想', '武者一閃固定消耗 3 劍意，但威力和會心率都以 5 劍意計算', { mods: [{ costAllFix: { res: 'ki', pay: 3, as: 5 }, cond: { skillIs: S } }] });
  TK(c, 1, '血劍', '劍意不足時，每缺 1 點改成消耗 8% 最大 HP 來施放武者一閃', { kind: 'C', rules: { bloodBlade: 1 } });
  TK(c, 2, '劍聖', '每次反擊或打中弱點，下一次武者一閃多 1 段（最多 2 段，每段威力 50%）', { kind: 'I',
    mods: [{ stage: 'skill', hitsAdd: { f: 'saintHits' }, cond: { skillIs: S } }, { stage: 'skill', who: 'attacker', powMul: 0.5, cond: { skillIs: S, firstHit: 0 } }],
    trig: [TRG(EVT.SKILL_SUCCESS, 'src', {}, [{ type: 'data_add', key: 'saint', n: 1, max: 2 }], { tags: ['counter'] }), TRG(EVT.DAMAGE, 'src', { weakHit: 1, evHit: 1 }, [{ type: 'data_add', key: 'saint', n: 1, max: 2 }], { limit: { perAction: 1 }, notTags: ['sig'] }),
      SIGD(c, [{ type: 'data_set', key: 'saint', value: 0 }])] }); }

/* ======================= 魔導士（咒印） ======================= */
{ const c = 'mage', S = 'sig_mage';
  TAL12_TREE[c] = { br: [['咒爆', '爆發'], ['蒼雷', '速度與麻痺'], ['秘法', 'MP 與冷卻']] };
  TL(c, 0, 0, 0, '咒力', 'N', '魔攻 +6%', { stat: { spaP: 6 } });
  TL(c, 0, 0, 1, '餘燼', 'I', '元素爆發命中的目標 50% 灼傷', { trig: [TRG(EVT.DAMAGE, 'src', { burstOld: 1, cat: '特', evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.st('brn', 'event_target', { secondary: 1 })], { chance: 0.5 })] });
  TL(c, 0, 1, 0, '爆裂', 'R', '元素爆發倍率 ×1.5 → ×1.8', { rules: { burstUp: 1 } });
  TL(c, 0, 1, 1, '連咒', 'C', '元素爆發後，冷卻最久的技能 −1', { trig: [TRG(EVT.SKILL_SUCCESS, 'src', { burstOld: 1, cat: '特', hasPower: 1 }, [E12.cd('longest', 1, { why: 'chain' })], { prio: 11 })] });
  TL(c, 0, 2, 0, '劫火', 'I', '對灼傷中的魔物魔法會心率 +25%', { mods: [{ stage: 'talent', who: 'attacker', critAdd: 25, cond: { cat: '特', tgtStatus: 'brn' } }] });
  TL(c, 0, 2, 1, '雙咒', 'R', '同一屬性可以記兩個咒印', { rules: { sigilDup: 1 } });
  TL(c, 1, 0, 0, '疾電', 'N', '速度 +8%', { stat: { speP: 8 } });
  TL(c, 1, 0, 1, '雷痕', 'I', '雷屬性技能命中 15% 麻痺', { trig: [TRG(EVT.DAMAGE, 'src', { evEl: '雷', evHit: 1, tgtAlive: 1, isBasic: 0, tgtSide: 'enemy' }, [E12.st('par', 'event_target', { secondary: 1 })], { chance: 0.15 })] });
  TL(c, 1, 1, 0, '導電', 'I', '對麻痺或潮濕的魔物雷屬性傷害 +25%', { mods: [MUL(1.25, { element: '雷', tgtAnyOf: ['par', 'wet'] })] });
  TL(c, 1, 1, 1, '迅咒', 'R', '第一回合一定先行動，開場就有 1 個雷咒印', { mods: [{ firstRoundPrio: 1 }], trig: [TRG(EVT.BATTLE_START, null, {}, [{ type: 'sigil_add', el: '雷' }])] });
  TL(c, 1, 2, 0, '雷鳴', 'C', '打中麻痺的魔物回復 3 MP', { trig: [TRG(EVT.DAMAGE, 'src', { evHit: 1, tgtStatus: 'par', tgtSide: 'enemy' }, [E12.res('mp', 3, { why: 'thunder' })])] });
  TL(c, 1, 2, 1, '落雷', 'I', '元素奔流的雷屬性那一段變成全體', { rules: { thunderAoe: 1 } });
  TL(c, 2, 0, 0, '魔庫', 'N', '最大 MP +15%', { stat: { mpP: 15 } });
  TL(c, 2, 0, 1, '冥想', 'R', '防禦回復 MP 從 12% 提高到 25%', { rules: { meditate: 1 } });
  TL(c, 2, 1, 0, '節流', 'C', '技能進入冷卻時，退還該技能 30% 的 MP', { trig: [TRG(EVT.COOLDOWN, 'src', { evSetCd: 1 }, [E12.res('mp', { f: 'cdRefund' }, { why: 'refund' })])] });
  TL(c, 2, 1, 1, '循環', 'R', 'MP 全滿時技能 MP −30%', { mods: [{ stage: 'skill', costMul: 0.7, res: 'mp', cond: { ownerResFull: 'mp' } }] });
  TL(c, 2, 2, 0, '魔泉', 'R', '魔力之泉改成每回合 6%', { rules: { springUp: 1 } });
  TL(c, 2, 2, 1, '靜思', 'I', 'MP 低於 30% 時受到的魔法傷害 −30%', { mods: [MUL(0.7, { cat: '特', ownerMpBelow: 0.3 }, 'defender', 'defender')] });
  TK(c, 0, '元素王', '集滿 2 種不同屬性就觸發元素爆發，倍率 ×1.3', { rules: { elemKing: 1 } });
  TK(c, 1, '雷帝', '元素爆發時，另外對所有魔物各打一次雷擊（威力 60）', { kind: 'I', trig: [TRG(EVT.SKILL_SUCCESS, 'src', { burstOld: 1, cat: '特', hasPower: 1 }, [E12.dmg(60, 'all_enemies', { el: '雷', cat: '特', kind: 'thunderGod' })], { prio: 12 })] });
  TK(c, 2, '賢者', '沒有咒印也能用元素奔流：改成消耗 15 MP，打 2 段武器屬性魔法', { kind: 'C', rules: { sage: 1 } }); }

/* ======================= 守護者（守勢） ======================= */
{ const c = 'guardian', S = 'sig_guardian';
  TAL12_TREE[c] = { br: [['聖盾', '治癒與護盾'], ['磐石', '防禦'], ['報復', '反擊']] };
  TL(c, 0, 0, 0, '堅忍', 'N', '最大 HP +8%', { stat: { hpP: 8 } });
  TL(c, 0, 0, 1, '祈禱', 'I', '治療效果 +20%，治療時守勢 +1', { stat: { healUp: 20 }, trig: [TRG(EVT.HEAL, 'src', { evKind: 'heal' }, [E12.res('stance', 1)], { limit: { perAction: 1 } })] });
  TL(c, 0, 1, 0, '聖光', 'I', '防禦時回復 8% HP', { trig: [TRG(EVT.DEFEND, 'src', {}, [E12.heal(0.08, { kind: 'heal' })])] });
  TL(c, 0, 1, 1, '屏障', 'R', '開場展開 2 回合護盾', { trig: [OPEN_SHIELD(2)] });
  TL(c, 0, 2, 0, '不屈', 'R', '每場 1 次撐住，守勢變成 5', { trig: ENDURE12([E12.set('stance', 99)]).triggers });
  TL(c, 0, 2, 1, '復甦', 'R', '回合結束回復 4% HP（頭目戰 3%）', { trig: [ROUND_HEAL({ f: 'bossHeal', v: [0.04, 0.03] })] });
  TL(c, 1, 0, 0, '鐵甲', 'N', '物防 +8%', { stat: { defP: 8 } });
  TL(c, 1, 0, 1, '定樁', 'R', '防禦時再減傷 15%', { mods: [MUL(0.85, { guarding: 1, hasPower: 1 }, 'defender', 'defender')] });
  TL(c, 1, 1, 0, '荊甲', 'I', '受到物理攻擊反彈 20%', { trig: [TRG(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', cat: '物', hasPower: 1, hpLost: 1, srcAlive: 1 }, [{ type: 'damage', target: 'source', ofEvent: 0.2, kind: 'thorns', tags: ['reflect'] }], { prio: 4 })] });
  TL(c, 1, 1, 1, '厚實', 'C', '守勢滿時，再得到的守勢變成 1 回合護盾', { trig: [TRG(EVT.RESOURCE_OVERFLOW, 'tgt', { evRes: 'stance' }, [E12.st('barrier', 'self', { dur: 1 })])] });
  TL(c, 1, 2, 0, '不動', 'R', '守勢不會因為沒被攻擊而減少', { rules: { immovable: 1 } });
  TL(c, 1, 2, 1, '堅城', 'I', '有護盾時，受到的會心改成普通傷害', { mods: [{ stage: 'defender', who: 'defender', critTaken: 0, cond: { ownerHasStatus: 'barrier' } }] });
  TL(c, 2, 0, 0, '怒意', 'N', '物攻 +6%', { stat: { atkP: 6 } });
  TL(c, 2, 0, 1, '還擊', 'I', '防禦中被攻擊時反擊（斬擊 70%）', { trig: [COUNTER_ON_GUARD()] });
  TL(c, 2, 1, 0, '逆境', 'R', 'HP 低於 50% 時，聖盾衝擊只要 1 點守勢', { mods: [{ costMinSet: 1, res: 'stance', cond: { skillIs: S, ownerHpBelow: 0.5 } }] });
  TL(c, 2, 1, 1, '碎甲', 'I', '反擊命中讓目標物防 −1', { trig: [TRG(EVT.DAMAGE, 'src', { evHit: 1, tgtAlive: 1 }, [E12.stage({ def: -1 }, 'event_target', { secondary: 1 })], { tags: ['counter'], limit: { perAction: 1 } })] });
  TL(c, 2, 2, 0, '審判', 'C', '聖盾衝擊威力再加上本場受到傷害總和的 10%（最多 +60）', { rules: { judge: 1 } });
  TL(c, 2, 2, 1, '以牙', 'I', '被會心打中後，下一次攻擊必定會心', { trig: [TRG(EVT.DAMAGE, 'tgt', { crit: 1, srcSide: 'enemy', ownerAlive: 1 }, [E12.st('critNext')])] });
  TK(c, 0, '聖域', '聖盾衝擊不造成傷害，改成每點守勢回復 8% HP，並展開 3 回合護盾', { kind: 'C', rules: { sanctuary: 1 } });
  TK(c, 1, '城塞', '防禦的回合結束時，以「守勢×20」的威力攻擊目前的目標（不消耗守勢）', { trig: [TRG(EVT.ROUND_END, null, { guarding: 1, ownerAlive: 1, ownerResAtLeast: ['stance', 1] }, [E12.dmg({ f: 'fortress' }, 'last_target', { kind: 'fortress' })], { prio: 2 })] });
  TK(c, 2, '復仇者', '每次反擊後守勢 +1；守勢 5 時反擊威力變成 140%', { kind: 'I', rules: { avenger: 1 }, trig: [TRG(EVT.SKILL_SUCCESS, 'src', {}, [E12.res('stance', 1)], { tags: ['counter'] })] }); }

/* ======================= 遊俠（獵印） ======================= */
{ const c = 'ranger', S = 'sig_ranger';
  TAL12_TREE[c] = { br: [['影殺', '會心與毒'], ['風行', '迴避與速度'], ['鷹眼', '弱點與屠巨']] };
  TL(c, 0, 0, 0, '弱穴', 'N', '會心率 +6%', { stat: { crit: 6 } });
  TL(c, 0, 0, 1, '淬毒', 'I', '會心命中讓目標中毒（40%）', { trig: [TRG(EVT.DAMAGE, 'src', { crit: 1, evHit: 1, tgtAlive: 1, hpLost: 1, tgtSide: 'enemy' }, [E12.st('psn', 'event_target', { secondary: 1 })], { chance: 0.4, limit: { perAction: 1 } })] });
  TL(c, 0, 1, 0, '毒噬', 'I', '對中毒的魔物傷害 +20%', { mods: [MUL(1.2, { tgtStatus: 'psn', hasPower: 1 })] });
  TL(c, 0, 1, 1, '無聲', 'R', '第一回合的攻擊必定會心', { mods: [{ stage: 'talent', who: 'attacker', crit: true, cond: { round: 1, hasPower: 1 } }] });
  TL(c, 0, 2, 0, '割喉', 'C', '引爆獵印時每層再 +20 威力', { rules: { cutThroat: 1 } });
  TL(c, 0, 2, 1, '獵殺', 'I', '打倒魔物時，牠身上的獵印轉移到另一隻', { trig: [TRG(EVT.DOWN, 'enemy_tgt', { tgtMarked: 1 }, [{ type: 'mark_move' }])] });
  TL(c, 1, 0, 0, '疾足', 'N', '速度 +8%', { stat: { speP: 8 } });
  TL(c, 1, 0, 1, '輕身', 'R', '防禦時迴避 +20%（到下次行動）', { trig: [TRG(EVT.DEFEND, 'src', {}, [E12.st('evade_up', 'self', { delta: 4 })])] });
  TL(c, 1, 1, 0, '幻步', 'I', '閃過攻擊時反擊（威力 60）', { trig: [TRG(EVT.MISS, 'tgt', { srcSide: 'enemy', ownerAlive: 1 }, [{ type: 'counter', skill: 'counter_60', why: 'phantom' }], { reaction: 1, limit: { perAction: 1 } })] });
  TL(c, 1, 1, 1, '先手', 'R', '使用搶先技能後獵印 +1', { trig: [TRG(EVT.SKILL_SUCCESS, 'src', { hasPower: 1 }, [E12.mark('cast_targets')], { tags: ['priority'] })] });
  TL(c, 1, 2, 0, '追風', 'R', '速度比目標快 50% 以上時獵印多 +1', { trig: [TRG(EVT.DAMAGE, 'src', { evHit: 1, tgtAlive: 1, fasterBy: 1.5, tgtSide: 'enemy' }, [E12.mark()], { limit: { perAction: 1 } })] });
  TL(c, 1, 2, 1, '殘影', 'R', '每場 1 次完全閃避一次攻擊', { trig: [TPRE(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', hasPower: 1 }, [{ type: 'cancel', why: 'afterimage' }, { type: 'message', key: 'afterimage', target: 'self' }], { layer: 'prevent', limit: { perBattle: 1 } })] });
  TL(c, 2, 0, 0, '瞄準', 'N', '命中 +10%', { stat: { hit: 10 } });
  TL(c, 2, 0, 1, '標記', 'R', '普攻命中也會留下獵印（每次行動 1 層）', { trig: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.mark()], { limit: { perAction: 1 } })] });
  TL(c, 2, 1, 0, '看破', 'I', '打中弱點時獵印 +1', { trig: [TRG(EVT.DAMAGE, 'src', { weakHit: 1, evHit: 1, tgtAlive: 1 }, [E12.mark()], { limit: { perAction: 1 } })] });
  TL(c, 2, 1, 1, '貫甲', 'I', '對有獵印的魔物無視 15% 物防', { mods: [{ stage: 'attacker', who: 'attacker', defMul: 0.85, cond: { tgtMarked: 1 } }] });
  TL(c, 2, 2, 0, '巨獵', 'I', '對精英、頭目每層獵印 +10%', { rules: { bigHunt: 1 } });
  TL(c, 2, 2, 1, '狙擊', 'R', '影牙連射改成 1 發（威力 90，會心率 +30%），仍給 2 層獵印', { rules: { sniper: 1 } });
  TK(c, 0, '絕影', '引爆獵印後，影牙連射的冷卻歸零', { rules: { shadowReset: 1 } });
  TK(c, 1, '疾風獵手', '每回合比所有魔物先行動時，冷卻中的技能 −1', { kind: 'C', trig: [TRG(EVT.TURN_ORDER, null, { wentFirst: 1, ownerAlive: 1 }, [E12.cd('all', 1, { why: 'galeHunter' })])] });
  TK(c, 2, '鷹之印', '獵印上限 3 → 5 層', { rules: { markMax: 2 } }); }

/* ======================= 吟遊詩人（樂章） ======================= */
{ const c = 'bard', S = 'sig_bard';
  TAL12_TREE[c] = { br: [['凱歌', '增益與特技'], ['聖詠', '治癒'], ['舞步', '普攻與節奏']] };
  TL(c, 0, 0, 0, '高亢', 'N', '魔攻 +6%', { stat: { spaP: 6 } });
  TL(c, 0, 0, 1, '高揚', 'I', '共鳴旋律另外讓速度 +1', { trig: [SIGD(c, [E12.stage({ spe: 1 }, 'self', { dur: { f: 'songDur' } })])] });
  TL(c, 0, 1, 0, '英雄頌', 'R', '共鳴旋律的能力提升持續 +2 回合', { rules: { songDur: 2 } });
  TL(c, 0, 1, 1, '狂想', 'I', '自己每得到一次能力提升，特技 +1', { trig: [TRG(EVT.STATUS_APPLY, 'tgt', { statusGroup: 'stage', stageUp: 1, statusOk: 1 }, [E12.res('wc', 1, { why: 'rhapsody' })])] });
  TL(c, 0, 2, 0, '終曲', 'C', '有 3 種以上能力提升時，普攻變成魔法「終曲」（傷害 +50%）', { mods: [{ basicMagic: 1, cond: { ownerBuffs: 3 } }] });
  TL(c, 0, 2, 1, '合奏', 'I', '夥伴援護效果 +50%，多出手 1 次', { sum: { allyUp: 50, allyMore: 1 } });
  TL(c, 1, 0, 0, '慈歌', 'N', '治療效果 +15%', { stat: { healUp: 15 } });
  TL(c, 1, 0, 1, '清泉', 'R', '回合結束回復 3% MP', { trig: [ROUND_MP(0.03)] });
  TL(c, 1, 1, 0, '搖籃', 'R', '回合結束回復 3% HP', { trig: [ROUND_HEAL(0.03)] });
  TL(c, 1, 1, 1, '淨音', 'I', '共鳴旋律解除自己的異常狀態', { trig: [SIGD(c, [{ type: 'cleanse', target: 'self' }])] });
  TL(c, 1, 2, 0, '鎮魂', 'C', 'HP 全滿時，治療溢出的量變成 1 回合護盾', { trig: [TRG(EVT.HEAL, 'tgt', { overheal: 1 }, [E12.st('barrier', 'self', { dur: 1 })], { limit: { perAction: 1 } })] });
  TL(c, 1, 2, 1, '安息', 'R', '每場 1 次撐住並回復 25%', { trig: [{ on: EVT.DOWN, phase: 'PRE', role: 'tgt', layer: 'prevent', whenDown: 1, onceGroup: 'endure', cond: {}, effects: [{ type: 'prevent_down', pct: 0.25, key: 'endure' }] }] });
  TL(c, 2, 0, 0, '輕步', 'N', '迴避 +5%', { stat: { eva: 5 } });
  TL(c, 2, 0, 1, '踏歌', 'I', '普攻命中時拍 +1（每次行動 1 次）', { trig: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1 }, [E12.res('beat', 1)], { limit: { perAction: 1 } })] });
  TL(c, 2, 1, 0, '迴旋', 'I', '普攻 25% 追加一擊（50%）', { trig: [BASIC_EXTRA(0.25, 20)] });
  TL(c, 2, 1, 1, '回響', 'C', '普攻多回復 3 MP', { rules: { atkMp: 3 } });
  TL(c, 2, 2, 0, '即興', 'R', '同一種行動連續兩次也不會失去拍', { rules: { improv: 1 } });
  TL(c, 2, 2, 1, '謝幕', 'I', '拍滿 3 時普攻傷害 +40%', { mods: [MUL(1.4, { tag: 'basic', ownerResFull: 'beat' })] });
  TK(c, 0, '交響', '共鳴旋律不消耗拍（改成冷卻 2）', { mods: [{ costAllFree: 'beat', cond: { skillIs: S } }, { cdAdd: 2, cond: { skillIs: S } }] });
  TK(c, 1, '聖歌', '共鳴旋律回復量加倍，但不再提升物攻', { kind: 'C', rules: { hymn: 1 } });
  TK(c, 2, '舞王', '拍滿 3 時自動施放共鳴旋律（不佔行動，消耗 3 拍）', { trig: [TRG(EVT.RESOURCE_FULL, 'tgt', { evRes: 'beat' }, [{ type: 'auto_skill', skill: S, payRes: 'beat', pay: 3 }])] }); }

/* ======================= 機工士（砲台） ======================= */
{ const c = 'machinist', S = 'sig_machinist';
  TAL12_TREE[c] = { br: [['火力', '砲擊'], ['齒輪', '特技與 MP'], ['修械', '防禦與修復']] };
  TL(c, 0, 0, 0, '火藥', 'N', '物攻 +6%', { stat: { atkP: 6 } });
  TL(c, 0, 0, 1, '穿甲彈', 'I', '砲台射擊無視 20% 物防', { mods: [{ stage: 'attacker', who: 'attacker', defMul: 0.8, cond: { skillIs: 'turret_shot' } }] });
  TL(c, 0, 1, 0, '集火', 'I', '砲台優先打你剛剛攻擊的目標，傷害 +20%', { rules: { focusFire: 1 } });
  TL(c, 0, 1, 1, '爆裂彈', 'R', '砲台射擊 30% 灼傷', { trig: [TRG(EVT.DAMAGE, 'src', { skillIs: 'turret_shot', tgtAlive: 1, hpLost: 1 }, [E12.st('brn', 'event_target', { secondary: 1 })], { chance: 0.3 })] });
  TL(c, 0, 2, 0, '連射', 'R', '砲台每回合射擊 2 次（消耗 2 發）', { rules: { twinShot: 1 } });
  TL(c, 0, 2, 1, '重砲', 'C', '機關砲擊威力 + 剩餘彈藥×20，然後重新裝填', { rules: { heavyGun: 1 } });
  TL(c, 1, 0, 0, '發條', 'N', '特技傷害 +15%', { stat: { spcUp: 15 } });
  TL(c, 1, 0, 1, '預熱', 'R', '開場特技 +1', { trig: [TRG(EVT.BATTLE_START, null, {}, [E12.res('wc', 1, { why: 'start' })])] });
  TL(c, 1, 1, 0, '傳動', 'R', '特技所需層數 −1', { rules: { chargeCut: 1 } });
  TL(c, 1, 1, 1, '增壓', 'C', '特技發動時砲台補 1 發', { trig: [TRG(EVT.SKILL_SUCCESS, 'src', { ownerHasStatus: 'turret' }, [E12.st('turret', 'self', { delta: 1, quiet: 1 })], { tags: ['weapon_special'] })] });
  TL(c, 1, 2, 0, '永動', 'R', '普攻回復的 MP +3', { rules: { atkMp: 3 } });
  TL(c, 1, 2, 1, '超載', 'I', '特技發動後，下一次機關砲擊威力 +40%', { trig: [TRG(EVT.SKILL_SUCCESS, 'src', {}, [E12.st('overdrive')], { tags: ['weapon_special'] })] });
  TL(c, 2, 0, 0, '外殼', 'N', '最大 HP +8%', { stat: { hpP: 8 } });
  TL(c, 2, 0, 1, '保養', 'R', '設置砲台時回復 10% HP', { trig: [TRG(EVT.STATUS_APPLY, 'tgt', { statusIs: 'turret', statusOk: 1, evDeltaPos: 1 }, [E12.heal(0.1, { kind: 'heal' })], { limit: { perAction: 1 } })] });
  TL(c, 2, 1, 0, '反應甲', 'I', '被攻擊時 25% 由砲台擋下（傷害 −50%，消耗 1 發）', { trig: [TPRE(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', hasPower: 1, ownerHasStatus: 'turret' }, [{ type: 'modify', mul: 0.5, note: 'reactive' }, E12.st('turret', 'self', { delta: -1, quiet: 1 })], { chance: 0.25, layer: 'reaction' })] });
  TL(c, 2, 1, 1, '護盾機', 'R', '開場展開 2 回合護盾', { trig: [OPEN_SHIELD(2)] });
  TL(c, 2, 2, 0, '自修', 'R', '回合結束回復 4% HP', { trig: [ROUND_HEAL(0.04)] });
  TL(c, 2, 2, 1, '急救包', 'R', '每場 1 次：HP 低於 30% 時回復 30%', { trig: [ONCE_LOW(0.3, [E12.heal(0.3, { kind: 'heal', quiet: 0 })])] });
  TK(c, 0, '全火力', '砲台彈藥上限 3 → 6', { rules: { turretMax: 3 } });
  TK(c, 1, '機關城', '砲台射擊改成發動武器特技的效果（威力依武器）', { kind: 'C', rules: { gearCity: 1 } });
  TK(c, 2, '堡壘', '防禦時砲台照樣射擊，而且那回合砲台傷害 +50%', { rules: { bastion: 1 } }); }

/* ======================= 武僧（氣） ======================= */
{ const c = 'monk', S = 'sig_monk';
  TAL12_TREE[c] = { br: [['剛勁', '普攻與連擊'], ['內功', '氣與 MP'], ['坐忘', '迴避與耐久']] };
  TL(c, 0, 0, 0, '虎力', 'N', '物攻 +6%', { stat: { atkP: 6 } });
  TL(c, 0, 0, 1, '連環', 'I', '普攻 25% 追加一段（50%）', { trig: [BASIC_EXTRA(0.25, 20)] });
  TL(c, 0, 1, 0, '崩勁', 'I', '氣滿的會心攻擊無視 30% 物防', { mods: [{ stage: 'attacker', who: 'attacker', critPierce: 0.3, cond: { actFlag: 'chiCrit' } }] });
  TL(c, 0, 1, 1, '百裂', 'R', '連環寸勁基本段數 3 → 5', { rules: { hundredFists: 1 } });
  TL(c, 0, 2, 0, '發勁', 'C', '氣滿時普攻也必定會心並消耗氣', { rules: { hakkei: 1 } });
  TL(c, 0, 2, 1, '碎山', 'I', '氣滿的會心讓目標物防 −1、破防盾 −1', { trig: [TRG(EVT.DAMAGE, 'src', { actFlag: 'chiCrit', crit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.stage({ def: -1 }, 'event_target', { secondary: 1 }), { type: 'break_chip', target: 'event_target', n: 1, why: 'crush' }], { limit: { perAction: 1 } })] });
  TL(c, 1, 0, 0, '內勁', 'N', '魔攻 +6%', { stat: { spaP: 6 } });
  TL(c, 1, 0, 1, '運氣', 'R', '這回合沒有攻擊的話，回合結束時氣 +1', { trig: [TRG(EVT.DAMAGE, 'src', { hasPower: 1, tgtSide: 'enemy' }, [{ type: 'data_set', key: 'atkRound', round: 1 }]), TRG(EVT.ROUND_END, null, { ownerAlive: 1, noAttackRound: 1 }, [E12.res('chi', 1)])] });
  TL(c, 1, 1, 0, '聚氣', 'C', '氣滿時再得到的氣改成回復 MP（每點 4）', { trig: [TRG(EVT.RESOURCE_OVERFLOW, 'tgt', { evRes: 'chi' }, [E12.res('mp', { f: 'overMp', v: 4 }, { why: 'chiMp' })])] });
  TL(c, 1, 1, 1, '行氣', 'I', '消耗氣時每點回復 2% HP', { trig: [TRG(EVT.RESOURCE_CHANGE, 'tgt', { evRes: 'chi', evGainPos: 0, evWhyIn: ['cost', 'release', 'auto'] }, [E12.heal({ f: 'chiHeal' })])] });
  TL(c, 1, 2, 0, '化勁', 'R', '魔法技能也累積氣', { rules: { chiMagic: 1 } });
  TL(c, 1, 2, 1, '氣海', 'R', '氣上限 5 → 7（滿 7 才必定會心，傷害再 +20%）', { rules: { max_chi: 2 }, mods: [MUL(1.2, { actFlag: 'chiCrit', hasPower: 1 })] });
  TL(c, 2, 0, 0, '鋼骨', 'N', '最大 HP +8%', { stat: { hpP: 8 } });
  TL(c, 2, 0, 1, '游身', 'R', '防禦不再失去氣', { rules: { flowBody: 1 } });
  TL(c, 2, 1, 0, '空身', 'I', '閃過攻擊時氣 +1', { trig: [TRG(EVT.MISS, 'tgt', { srcSide: 'enemy' }, [E12.res('chi', 1)])] });
  TL(c, 2, 1, 1, '明心', 'I', '被施加異常狀態時氣 +2', { trig: [TRG(EVT.STATUS_APPLY, 'tgt', { statusMajor: 1, statusOk: 1 }, [E12.res('chi', 2)])] });
  TL(c, 2, 2, 0, '金剛', 'C', '氣 3 以上時受到的傷害 −15%', { mods: [MUL(0.85, { ownerResAtLeast: ['chi', 3], hasPower: 1 }, 'defender', 'defender')] });
  TL(c, 2, 2, 1, '涅槃', 'R', '每場 1 次撐住，氣變滿', { trig: ENDURE12([E12.set('chi', 99)]).triggers });
  TK(c, 0, '羅漢', '普攻變成 3 段（各 40%），每段都累積氣', { rules: { arhat: 1 } });
  TK(c, 1, '周天', '氣滿時自動施放連環寸勁（不佔行動、不花 MP）', { kind: 'C', trig: [TRG(EVT.RESOURCE_FULL, 'tgt', { evRes: 'chi' }, [{ type: 'act_flag', key: 'chiCrit' }, { type: 'auto_skill', skill: S, payRes: 'chi' }])] });
  TK(c, 2, '不壞', '每點氣讓受到的傷害 −4%，但連環寸勁不再消耗氣', { kind: 'I', mods: [{ stage: 'defender', who: 'defender', mul: { f: 'chiGuard' }, cond: { hasPower: 1 } }, { costAllFree: 'chi', cond: { skillIs: S } }] }); }

/* ======================= 龍騎士（龍血） ======================= */
{ const c = 'dragoon', S = 'sig_dragoon';
  TAL12_TREE[c] = { br: [['蒼龍', '穿透與屠巨'], ['龍裔', '耐久與吸血'], ['翔空', '速度與跳躍']] };
  TL(c, 0, 0, 0, '剛腕', 'N', '物攻 +6%', { stat: { atkP: 6 } });
  TL(c, 0, 0, 1, '貫穿', 'I', '長槍普攻再無視 15% 物防', { mods: [{ stage: 'attacker', who: 'attacker', defMul: 0.85, cond: { tag: 'basic', ownerWkind: '長槍' } }] });
  TL(c, 0, 1, 0, '斬龍', 'I', '對精英、頭目傷害 +12%', { mods: [MUL(1.12, { tgtBig: 1, hasPower: 1 })] });
  TL(c, 0, 1, 1, '逆鱗', 'R', '落地攻擊會心率 +30%', { mods: [{ stage: 'talent', who: 'attacker', critAdd: 30, cond: { skillIs: S } }] });
  TL(c, 0, 2, 0, '龍威', 'I', '落地命中讓目標物防 −1', { trig: [TRG(EVT.DAMAGE, 'src', { skillIs: S, evHit: 1, tgtAlive: 1 }, [E12.stage({ def: -1 }, 'event_target', { secondary: 1 })])] });
  TL(c, 0, 2, 1, '裂天', 'C', '落地打中弱點時龍血 +1', { trig: [TRG(EVT.DAMAGE, 'src', { skillIs: S, weakHit: 1, evHit: 1 }, [E12.res('dragon', 1)], { limit: { perAction: 1 } })] });
  TL(c, 1, 0, 0, '龍心', 'N', '最大 HP +8%', { stat: { hpP: 8 } });
  TL(c, 1, 0, 1, '渴血', 'I', '落地攻擊回復傷害的 15%', { trig: [SIGD(c, [{ type: 'heal', target: 'self', ofEvent: 0.15, field: 'total', kind: 'drain', quiet: 1 }])] });
  TL(c, 1, 1, 0, '鱗護', 'R', '在空中時受到的全體攻擊傷害 −50%', { mods: [MUL(0.5, { ownerAir: 1, tag: 'aoe' }, 'defender', 'defender')] });
  TL(c, 1, 1, 1, '龍脈', 'R', '回合結束回復 4% HP', { trig: [ROUND_HEAL(0.04)] });
  TL(c, 1, 2, 0, '不滅', 'R', '每場 1 次撐住，並立刻跳到空中', { trig: ENDURE12([{ type: 'rejump', why: 'undying' }]).triggers });
  TL(c, 1, 2, 1, '焚身', 'C', 'HP 越低落地威力越高（最多 +40%）', { rules: { burnBody: 1 } });
  TL(c, 2, 0, 0, '騰躍', 'N', '速度 +8%', { stat: { speP: 8 } });
  TL(c, 2, 0, 1, '凌空', 'R', '跳起的那一刻先用普攻打一下（50%）', { trig: [TRG(EVT.CHARGE, 'src', { evSkill: S }, [E12.dmg(20, 'event_target', { kind: 'leap' })])] });
  TL(c, 2, 1, 0, '俯衝', 'R', '龍騰擊冷卻 2 → 1', { mods: [{ cdAdd: -1, cond: { skillIs: S } }] });
  TL(c, 2, 1, 1, '連躍', 'I', '落地打倒魔物時立刻再跳起來', { trig: [TRG(EVT.DOWN, null, { srcIsOwner: 1, actSkill: S }, [{ type: 'rejump', why: 'chain' }])] });
  TL(c, 2, 2, 0, '星墜', 'C', '普攻命中龍血 +1', { trig: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1 }, [E12.res('dragon', 1)], { limit: { perAction: 1 } })] });
  TL(c, 2, 2, 1, '天梯', 'R', '跳起時獲得搶先（下回合第一個落下）', { trig: [TRG(EVT.CHARGE, 'src', { evSkill: S }, [E12.st('first_next', 'self', { quiet: 1 })])] });
  TK(c, 0, '龍神', '落地攻擊永遠是全體；龍血 3 時威力 +50%', { rules: { dragonGod: 1 } });
  TK(c, 1, '龍王', '在空中閃過攻擊時回復 8% HP，龍血 +2', { kind: 'C', trig: [TRG(EVT.MISS, 'tgt', { evAir: 1, srcSide: 'enemy' }, [E12.heal(0.08), E12.res('dragon', 1)])] });
  TK(c, 2, '天墜', '跳起和落下在同一次行動完成（威力 −30%）', { rules: { skyfall: 1 } }); }

/* ======================= 異界勇者（看破） ======================= */
{ const c = 'otherworlder', S = 'sig_otherworlder';
  TAL12_TREE[c] = { br: [['曙光', '全面'], ['越界', '弱點'], ['時律', '速度與先機']] };
  TL(c, 0, 0, 0, '奮起', 'N', '物攻、魔攻 +4%', { stat: { atkP: 4, spaP: 4 } });
  TL(c, 0, 0, 1, '求知', 'R', '戰鬥勝利經驗值 +15%', { sum: { expUp: 15 } });
  TL(c, 0, 1, 0, '羈絆', 'I', '夥伴援護效果 +50%', { sum: { allyUp: 50 } });
  TL(c, 0, 1, 1, '覺悟', 'R', '每場 1 次撐住', { trig: ENDURE12().triggers });
  TL(c, 0, 2, 0, '勇者魂', 'C', 'HP 低於 30% 時曙光之刃吸取量變成 50%', { rules: { heroSoul: 1 } });
  TL(c, 0, 2, 1, '光輝', 'I', '曙光之刃會心時看破 +1', { trig: [TRG(EVT.DAMAGE, 'src', { skillIs: S, crit: 1, evHit: 1 }, [{ type: 'insight_add' }], { limit: { perAction: 1 } })] });
  TL(c, 1, 0, 0, '洞察', 'N', '打弱點傷害 +12%', { stat: { weakUp: 12 } });
  TL(c, 1, 0, 1, '預讀', 'R', '開場對每種魔物都有 1 層看破', { trig: [TRG(EVT.BATTLE_START, null, {}, [{ type: 'insight_seed' }])] });
  TL(c, 1, 1, 0, '斬巨', 'I', '對精英、頭目每層看破 +12%', { rules: { giantSlayer: 1 } });
  TL(c, 1, 1, 1, '借勢', 'C', '看破滿 3 層時，打中弱點回復 5 MP', { trig: [TRG(EVT.DAMAGE, 'src', { weakHit: 1, evHit: 1, insightFull: 1 }, [E12.res('mp', 5, { why: 'insight' })])] });
  TL(c, 1, 2, 0, '萬能', 'R', '不是弱點的攻擊也有 30% 機率累積看破', { trig: [TRG(EVT.DAMAGE, 'src', { weakHit: 0, evHit: 1, hasPower: 1, tgtSide: 'enemy' }, [{ type: 'insight_add' }], { chance: 0.3, limit: { perAction: 1 } })] });
  TL(c, 1, 2, 1, '越界之眼', 'I', '看破 3 層的魔物受到的會心傷害 +30%', { mods: [{ stage: 'talent', who: 'attacker', critDmg: 30, cond: { insightFull: 1 } }] });
  TL(c, 2, 0, 0, '倍速', 'N', '速度 +8%', { stat: { speP: 8 } });
  TL(c, 2, 0, 1, '預判', 'R', '第一回合一定先行動', { mods: [{ firstRoundPrio: 1 }] });
  TL(c, 2, 1, 0, '殘像', 'I', '比魔物先行動的回合迴避 +15%', { mods: [{ stage: 'defender', who: 'defender', accAdd: -15, cond: { wentFirst: 1 } }] });
  TL(c, 2, 1, 1, '省時', 'R', '曙光之刃冷卻 1 → 0', { mods: [{ cdAdd: -1, cond: { skillIs: S } }] });
  TL(c, 2, 2, 0, '疾行', 'R', '每場 1 次：打倒魔物時立刻再行動一次', { trig: [TRG(EVT.DOWN, null, { srcIsOwner: 1 }, [{ type: 'extra_action', why: 'dash' }], { limit: { perBattle: 1 } })] });
  TL(c, 2, 2, 1, '逆轉', 'R', '每場 1 次：HP 低於 30% 時展開 2 回合護盾', { trig: [ONCE_LOW(0.3, [E12.st('barrier', 'self', { dur: 2 })])] });
  TK(c, 0, '光之勇者', '看破改成全種族共通', { kind: 'C', rules: { insightAll: 1 } });
  TK(c, 1, '越界者', '看破上限 3 → 5 層', { rules: { insightMax: 2, max_insight: 2 } });
  TK(c, 2, '時之旅人', '每回合第一個行動時，曙光之刃不花 MP', { mods: [{ stage: 'skill', costMul: 0, res: 'mp', cond: { skillIs: S, firstOfRound: 1 } }] }); }

/* ======================= 魔劍士（魔紋） ======================= */
{ const c = 'spellblade', S = 'sig_spellblade';
  TAL12_TREE[c] = { br: [['魔紋', '共鳴'], ['闇月', '會心與特技'], ['四象', '屬性']] };
  TL(c, 0, 0, 0, '剛柔', 'N', '物攻、魔攻 +4%', { stat: { atkP: 4, spaP: 4 } });
  TL(c, 0, 0, 1, '魔親', 'R', '魔紋上限 3 → 4', { rules: { max_rune: 1 } });
  TL(c, 0, 1, 0, '合一', 'I', '物攻和魔攻互相加成 30%', { mods: [{ stage: 'talent', who: 'attacker', mul: { f: 'spellblade', v: 0.3 }, cond: { hasPower: 1 } }] });
  TL(c, 0, 1, 1, '反刻', 'R', '魔法技能命中後魔紋 +1（先消耗再給）', { trig: [TRG(EVT.SKILL_SUCCESS, 'src', { cat: '特', isBasic: 0, hasPower: 1 }, [E12.res('rune', 1)], { prio: 5 })] });
  TL(c, 0, 2, 0, '魔晶', 'C', '魔紋滿時，物理攻擊改成回復 3 MP', { trig: [TRG(EVT.RESOURCE_OVERFLOW, 'tgt', { evRes: 'rune' }, [E12.res('mp', 3, { why: 'runeMp' })])] });
  TL(c, 0, 2, 1, '雙極', 'I', '魔劍解放的追加段改成魔法，屬性跟著武器', { rules: { dualPole: 1 } });
  TL(c, 1, 0, 0, '月眼', 'N', '會心率 +6%', { stat: { crit: 6 } });
  TL(c, 1, 0, 1, '月泉', 'R', '回合結束回復 3% MP', { trig: [ROUND_MP(0.03)] });
  TL(c, 1, 1, 0, '蝕刻', 'R', '特技所需層數 −1', { rules: { chargeCut: 1 } });
  TL(c, 1, 1, 1, '缺月', 'I', '對 HP 低於 50% 的魔物會心率 +20%', { mods: [{ stage: 'talent', who: 'attacker', critAdd: 20, cond: { tgtHpBelow: 0.5 } }] });
  TL(c, 1, 2, 0, '朔夜', 'I', '會心命中時魔紋 +1', { trig: [TRG(EVT.DAMAGE, 'src', { crit: 1, evHit: 1 }, [E12.res('rune', 1)], { limit: { perAction: 1 } })] });
  TL(c, 1, 2, 1, '新月', 'C', '特技發動時魔紋全滿', { trig: [TRG(EVT.SKILL_SUCCESS, 'src', {}, [E12.set('rune', 99)], { tags: ['weapon_special'] })] });
  TL(c, 2, 0, 0, '炎符', 'N', '屬性傷害 +8%', { stat: { elem: 8 } });
  TL(c, 2, 0, 1, '雷符', 'I', '雷屬性攻擊 15% 麻痺', { trig: [TRG(EVT.DAMAGE, 'src', { evEl: '雷', evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.st('par', 'event_target', { secondary: 1 })], { chance: 0.15, limit: { perAction: 1 } })] });
  TL(c, 2, 1, 0, '水符', 'I', '水屬性攻擊讓目標潮濕', { trig: [TRG(EVT.DAMAGE, 'src', { evEl: '水', evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.st('wet', 'event_target', { dur: 3 })], { limit: { perAction: 1 } })] });
  TL(c, 2, 1, 1, '草符', 'I', '草屬性攻擊讓目標纏繞', { trig: [TRG(EVT.DAMAGE, 'src', { evEl: '草', evHit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [E12.st('tangle', 'event_target', { dur: 3 })], { limit: { perAction: 1 } })] });
  TL(c, 2, 2, 0, '元素盾', 'R', '受到和武器同屬性的攻擊 −30%', { mods: [MUL(0.7, { elementWeapon: 1, hasPower: 1 }, 'defender', 'defender')] });
  TL(c, 2, 2, 1, '共振', 'I', '對潮濕、纏繞、灼傷的魔物魔劍解放 +30%', { mods: [MUL(1.3, { skillIs: S, tgtWet: 1 })] });
  TK(c, 0, '魔導王', '魔法技能不再消耗魔紋，每層加成改成 +12%', { rules: { runeKing: 1 } });
  TK(c, 1, '月蝕', '魔劍解放會心時，冷卻歸零', { kind: 'C', trig: [TRG(EVT.DAMAGE, 'src', { skillIs: S, crit: 1 }, [E12.cd(S, 99, { why: 'eclipse' })], { limit: { perAction: 1 } })] });
  TK(c, 2, '萬象歸一', '魔劍解放同時算物理和魔法，兩邊的加成都吃', { rules: { dualCat: 1 } }); }
// the reaction skill of 幻步 (power 60)
defPut('skills', 'counter_60', { ...skillFromMove('counter_60', { ...MOVES.slash, pow: 60, acc: null }, { kind: 'attack', extraTags: ['reaction', 'counter'] }), noHitRoll: false });

/* ---------- the talent state: st.tal12 = { cls: { 'b.t': option, k: branch } } (each class keeps its own) ---------- */
const TAL12 = {
  COST: [1, 2, 3], KEY_COST: 4, KEY_NEED: 6,
  of(st = Game.st) { const A = st.tal12 || (st.tal12 = {}); return A[clsV7(st.cls)] || (A[clsV7(st.cls)] = {}); },
  has: (b, t, st = Game.st) => TAL12.of(st)[b + '.' + t] !== undefined,
  brPts(b, st = Game.st) { let s = 0; for (let t = 0; t < 3; t++) if (TAL12.has(b, t, st)) s += TAL12.COST[t]; return s; },
  key: (st = Game.st) => TAL12.of(st).k ?? null,
  spent(st = Game.st) { if (!st || !st.cls) return 0; let s = 0; for (let b = 0; b < 3; b++) s += TAL12.brPts(b, st); if (TAL12.key(st) != null) s += TAL12.KEY_COST; return s; },
  ids(st = Game.st) { if (!st || !st.cls) return []; const c = clsV7(st.cls), P = TAL12.of(st), out = [];
    for (const k in P) { if (k === 'k') continue; const [b, t] = k.split('.').map(Number); const id = c + '.' + b + '.' + t + '.' + P[k]; if (DEF.talents[id]) out.push(id); }
    if (P.k != null && DEF.talents[c + '.k' + P.k]) out.push(c + '.k' + P.k); return out; },
  defs: (st = Game.st) => TAL12.ids(st).map(id => DEF.talents[id]),
  block(b, t, st = Game.st) { // why this tier can't be picked (null = ok); t = -1 → keystone of branch b
    if (t < 0) { if (TAL12.key(st) === b) return null; if (TAL12.key(st) != null) return '核心天賦只能有 1 個'; if (!deepOk(st)) return st.lv < 14 ? 'Lv14後找村長進行「天賦覺醒」' : '找萌芽鎮的村長進行「天賦覺醒」';
      if (TAL12.brPts(b, st) < TAL12.KEY_NEED) return '這個流派要先投入 ' + TAL12.KEY_NEED + ' 點'; if (tpAvail(st) < TAL12.KEY_COST) return '天賦點不足（需要 ' + TAL12.KEY_COST + ' 點）'; return null; }
    if (TAL12.has(b, t, st)) return null; if (t > 0 && !TAL12.has(b, t - 1, st)) return '要先選好第' + t + '層';
    if (t >= 2 && !deepOk(st)) return st.lv < 14 ? 'Lv14後找村長進行「天賦覺醒」' : '找萌芽鎮的村長進行「天賦覺醒」';
    if (tpAvail(st) < TAL12.COST[t]) return '天賦點不足（需要 ' + TAL12.COST[t] + ' 點）'; return null; },
  refundBlock(b, t, st = Game.st) { if (t < 0) return TAL12.key(st) === b ? null : '沒有選這個核心天賦';
    if (!TAL12.has(b, t, st)) return '這一層還沒有選'; if (t < 2 && TAL12.has(b, t + 1, st)) return '要先退回第' + (t + 2) + '層'; if (TAL12.key(st) === b) return '要先退回核心天賦'; return null; },
  pick(b, t, o, st = Game.st) { const P = TAL12.of(st); if (t < 0) P.k = b; else P[b + '.' + t] = o; },
  refund(b, t, st = Game.st) { const P = TAL12.of(st); if (t < 0) delete P.k; else delete P[b + '.' + t]; },
  // tests / auto: fill branch by branch with option `pick`, then a keystone
  auto(st = Game.st, pick = 0) { for (let b = 0; b < 3; b++) for (let t = 0; t < 3; t++) { if (TAL12.has(b, t, st)) continue; if (TAL12.block(b, t, st)) break; TAL12.pick(b, t, typeof pick === 'function' ? pick(b, t) : pick, st); }
    for (let b = 0; b < 3; b++) if (!TAL12.block(b, -1, st) && TAL12.key(st) == null) TAL12.pick(b, -1, 0, st); },
};
// the old talent API now reads the v12 talents (the v9.2 picks and the signature tree are gone)
tcPicked = function () { return []; };
tpSpent = function (st = Game.st) { return TAL12.spent(st); };
talentSum = function (key, st = Game.st) { if (!st || !st.cls) return 0; let v = 0;
  for (const T of TAL12.defs(st)) { if (T.sum && T.sum[key]) v += T.sum[key]; if (T.rules && typeof T.rules[key] === 'number') v += T.rules[key]; }
  const C = CLS12[clsV7(st.cls)]; if (key === 'chargeCut') { if (clsV7(st.cls) === 'bard') v += 1; const w = typeof mainWeapon === 'function' && mainWeapon(st); if (w && w.b === 'gearRifle') v += 1; }
  return v; };
applyTalents = function (s, st = Game.st) { if (!st || !st.cls) return s; const pct = {};
  for (const T of TAL12.defs(st)) for (const k in T.stat || {}) { const v = T.stat[k]; if (/^(hp|atk|def|spa|spd|spe|mp)P$/.test(k)) pct[k.slice(0, -1)] = (pct[k.slice(0, -1)] || 0) + v; else s[k] = (s[k] || 0) + v; }
  for (const k in pct) s[k] = Math.floor(s[k] * (1 + pct[k] / 100)); return s; };
resOn = function () { return []; };
// 分支共鳴 and the v9 class traits' numbers are replaced by the v12 class passives (the trait names stay for the menus)
for (const c in CLASS_SIG) { CLASS_SIG[c][1] = []; if (CLS12[c]) CLASS_SIG[c][0] = CLS12[c].passive[0]; }
