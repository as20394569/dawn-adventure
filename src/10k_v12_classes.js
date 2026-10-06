/* ===================== v12 戰鬥底層 — 職業（核心資源・規則・職業招式・被動・限制）、武器種類規則、專屬武器、盾、飾品特性 =====================
   docs/battle_v3_draft.md §3, §7 and docs/battle_v3_content.md §2–4. Every number here is the approved draft's (spec v1.1 §18).
   Everything is data on top of the core: resources, statuses, mechanics (trigger sets), skills, passive keys. */
/* ---------- conditions the class rules use ---------- */
Object.assign(COND, {
  ruleOn: (c, v) => !!c.owner && !!c.core.rule(c.owner, v),
  ruleOff: (c, v) => !c.owner || !c.core.rule(c.owner, v),
  spentAtLeast: (c, v) => (c.spent || 0) >= v,
  spentBelow: (c, v) => (c.spent || 0) < v,
  actFlag: (c, v) => !!(c.core.act && c.core.act[v]),
  actNoFlag: (c, v) => !(c.core.act && c.core.act[v]),
  ownerResFull: (c, v) => !!c.owner && (c.owner.max[v] || 0) > 0 && (c.owner.res[v] || 0) >= c.owner.max[v],
  ownerResBelow: (c, v) => !!c.owner && (c.owner.res[v[0]] || 0) < v[1],
  notHitThisRound: (c, v) => !!c.owner && (c.owner.data.hitRound !== c.core.round) === !!v,
  wentFirst: (c, v) => !!c.owner && c.core.wentFirst(c.owner) === !!v,
  tgtNotActed: (c, v) => !!c.tgt && !c.core.roundActs.includes(c.tgt.id) === !!v,
  tgtSlower: (c, v) => !!c.tgt && !!c.src && (BR.speed(c.core, c.tgt) < BR.speed(c.core, c.src)) === !!v,
  newTarget: (c, v) => !!c.owner && (!!c.owner.data.prevTarget && c.owner.data.lastTarget !== c.owner.data.prevTarget) === !!v,
  evAir: (c, v) => !!c.ev && !!c.ev.payload.air === !!v,
  burstOld: (c, v) => { const s = c.owner && c.core.statusOf(c.owner, 'elem_burst'); return !!s && (!c.core.act || s.atAct < c.core.act.action_id) === !!v; },
  elemSkill: (c, v) => !!c.skill && !c.skill.tags.includes('basic') && !c.skill.tags.includes('sig') && !c.skill.tags.includes('weapon_special') && (BR.elementOf(c.core, c.owner, c.skill) !== '一般') === !!v,
  chiReady: (c, v) => !!c.owner && ((c.owner.max.chi || 0) > 0 && (c.owner.res.chi || 0) >= c.owner.max.chi) === !!v,
  insightFull: (c, v) => !!c.owner && !!c.tgt && (BV12.insightOf(c.core, c.owner, c.tgt) >= BV12.insightMax(c.core, c.owner)) === !!v,
  insightFullAct: (c, v) => { const a = c.core.act, t = a && a.tg && c.core.byId[a.tg[0]]; return !!c.owner && !!t && (BV12.insightOf(c.core, c.owner, t) >= BV12.insightMax(c.core, c.owner)) === !!v; },
  tgtMarked: (c, v) => !!c.tgt && c.core.hasStatus(c.tgt, 'hunt_mark') === !!v,
  statusGroup: (c, v) => !!c.ev && !!DEF.statuses[c.ev.payload.status] && DEF.statuses[c.ev.payload.status].group === v,
  statusOk: (c, v) => !!c.ev && !c.ev.payload.failed === !!v,
  stageUp: (c, v) => !!c.ev && ((c.ev.payload.stacks || 0) > 0) === !!v,
  skillNot: (c, v) => !c.skill || c.skill.id !== v,
  evSkill: (c, v) => !!c.ev && c.ev.payload.skill === v,
  firstOfRound: (c, v) => !!c.owner && (c.core.roundActs[0] === c.owner.id && c.core.roundActs.filter(x => x === c.owner.id).length === 1) === !!v,
  ownerHasShield: (c, v) => !!c.owner && !!c.owner.data.shield === !!v,
  ownerAir: (c, v) => !!c.owner && c.core.hasStatus(c.owner, 'airborne') === !!v,
  srcIsOwner: (c, v) => (!!c.ev && !!c.owner && c.ev.src === c.owner.id) === !!v,
  evGainPos: (c, v) => !!c.ev && ((c.ev.payload.change || 0) > 0) === !!v,
  evWhy: (c, v) => !!c.ev && c.ev.payload.why === v,
  evNotWhy: (c, v) => !!c.ev && c.ev.payload.why !== v,
  tgtWet: (c, v) => !!c.tgt && ['wet', 'tangle', 'brn'].some(s => c.core.hasStatus(c.tgt, s)) === !!v,
  foeEl: (c, v) => !!c.ev && !!c.owner && c.ev.payload.el === c.owner.data.welem && !!c.owner.data.welem === !!v,
});
/* ---------- helpers shared by the class rules ---------- */
const BV12 = {
  insightKey: (core, u, t) => core.rule(u, 'insightAll') ? '*' : (t && t.fam) || '?',
  insightOf: (core, u, t) => ((u.data.insight || {})[BV12.insightKey(core, u, t)] || 0),
  insightMax: (core, u) => 3 + (core.rule(u, 'insightMax') || 0),
  markOf: (core, u, t) => { const s = t && core.statusOf(t, 'hunt_mark'); return s && s.src === u.id ? s.stacks : 0; },
  markMax: (core, u) => 3 + (core.rule(u, 'markMax') || 0),
  turretMax: (core, u) => 3 + (core.rule(u, 'turretMax') || 0),
};
/* ---------- formulas (data names them, the rule computes them) ---------- */
Object.assign(BR.FORMULA, {
  iai: c => 60 + 20 * (c.spent || 0),
  iaiCrit: c => 10 * (c.spent || 0),
  guardStrike: c => 50 + 15 * (c.spent || 0) + (c.core.rule(c.src, 'judge') ? Math.min(60, Math.floor((c.src.data.taken || 0) * 0.1)) : 0),
  guardAtk: c => (c.src.stats.atk + c.src.stats.def / 2) / Math.max(1, c.src.stats.atk),
  shieldDur: c => (c.spent || 0) >= 4 ? 2 : 1,
  sancHeal: c => 0.08 * (c.spent || 0),
  fangPow: c => c.core.rule(c.src || c.owner, 'sniper') ? 90 : 35,
  fangMarks: c => c.core.rule(c.owner || c.src, 'sniper') ? 2 : 1,
  songHeal: c => 0.06 * (c.spent || 0) * (c.core.rule(c.owner || c.src, 'hymn') ? 2 : 1),
  songDur: c => 3 + (c.core.rule(c.owner || c.src, 'songDur') || 0),
  cannon: c => 90 + (c.core.rule(c.src, 'heavyGun') ? 20 * ((c.core.statusOf(c.src, 'turret') || {}).stacks || 0) : 0) + 0,
  dragonLand: c => { const u = c.src, m = c.ctx && c.ctx.cmd || {}; let p = 185; if (c.core.rule(u, 'dragonGod') && m.dragonFull) p *= 1.5; if (c.core.rule(u, 'burnBody')) p *= 1 + 0.4 * (1 - u.res.hp / u.max.hp); return p; },
  dawnDrain: c => c.core.rule(c.owner || c.src, 'heroSoul') && (c.owner || c.src).res.hp < (c.owner || c.src).max.hp * 0.3 ? 0.5 : 0.2,
  mbRelease: c => (c.ctx && c.ctx.n) ? 40 : 95,
  runeMul: c => 1 + (c.core.rule(c.src, 'runeKing') ? 0.12 : 0.2) * (c.src.res.rune || 0),
  insightMul: c => 1 + BV12.insightOf(c.core, c.src, c.tgt) * (0.08 + (c.core.rule(c.src, 'giantSlayer') && (c.tgt.boss || c.tgt.elite) ? 0.12 : 0)),
  huntMul: c => 1 + BV12.markOf(c.core, c.src, c.tgt) * (0.06 + (c.core.rule(c.src, 'bigHunt') && (c.tgt.boss || c.tgt.elite) ? 0.10 : 0)),
  burstMul: c => c.core.rule(c.src, 'elemKing') ? 1.3 : c.core.rule(c.src, 'burstUp') ? 1.8 : 1.5,
  detonate: c => (40 + (c.core.rule(c.owner || c.src, 'cutThroat') ? 20 : 0)) * (c.marks || 0),
  fortress: c => 20 * ((c.owner || c.src).res.stance || 0),
  avengerMul: c => (c.owner || c.src).res.stance >= 5 && c.core.rule(c.owner || c.src, 'avenger') ? 1.4 : 1,
  lowHpMul: (c, v) => 1 + v * Math.max(0, 1 - c.src.res.hp / c.src.max.hp),
});
/* ---------- the effect types the class rules add ---------- */
Object.assign(EFFECT_TYPES, {
  // a capped gain: at most `cap` of this resource per action (劍意 +2, 氣 +2…); negative n loses it
  gain: { check: ef => ef.res ? null : 'gain needs res', exec(core, ef, ctx, tg) { for (const t of tg) { if (!core.isUp(t) || !(ef.res in t.res)) continue; let n = BR.val(ef.n ?? 1, { core, owner: ctx.owner, src: ctx.owner, tgt: t, spent: ctx.spent, ctx });
    if (ef.cap && core.act && n > 0) { const g = core.act._gain || (core.act._gain = {}), k = t.id + ':' + ef.res; n = Math.min(n, ef.cap - (g[k] || 0)); if (n <= 0) continue; g[k] = (g[k] || 0) + n; }
    if (n) core.changeRes(t, ef.res, n, { src: ctx.owner, why: ef.why || 'gain' }); } } },
  act_flag: { exec(core, ef) { if (core.act) core.act[ef.key] = ef.value ?? 1; } },
  // 魔導士: remember the element of an elemental skill (different elements, max 3; 雙咒 allows each twice)
  sigil_add: { exec(core, ef, ctx) { const u = ctx.owner, sk = ctx.skill || (ctx.trigEv && DEF.skills[ctx.trigEv.payload.skill]); if (!sk || !('sigil' in u.res)) return; if (core.act && core.act._burstUsed) return;
    const el = BR.elementOf(core, u, sk); if (el === '一般') return; const L = u.data.sigils || (u.data.sigils = []), dup = core.rule(u, 'sigilDup') ? 2 : 1;
    if (L.filter(x => x === el).length >= dup || L.length >= u.max.sigil) return; L.push(el); core.changeRes(u, 'sigil', 1, { why: 'sigil:' + el });
    const need = core.rule(u, 'elemKing') ? 2 : 3; if (new Set(L).size >= need && !core.hasStatus(u, 'elem_burst')) core.applyStatus(u, u, 'elem_burst', {}); } },
  sigil_take: { exec(core, ef, ctx) { const u = ctx.owner; if (core.act) core.act.sigilEls = (u.data.sigils || []).slice(); u.data.sigils = []; } },
  burst_used: { exec(core, ef, ctx) { const u = ctx.owner; if (core.act) core.act._burstUsed = 1; core.removeStatus(u, 'elem_burst', 'used'); u.data.sigils = []; if (u.res.sigil) core.changeRes(u, 'sigil', -u.res.sigil, { why: 'burst' }); } },
  // 元素奔流: one magic hit per remembered element (power 50); 落雷 makes the thunder hit hit everyone
  sigil_storm: { exec(core, ef, ctx) { const u = ctx.owner, sk = ctx.skill, els = (core.act && core.act.sigilEls) || (ctx.cmd && ctx.cmd.sigilEls) || [];
    els.forEach((el, i) => { const all = el === '雷' && core.rule(u, 'thunderAoe'), tg = all ? core.foesOf(u) : (ctx.targets || []).filter(t => core.isUp(t)).slice(0, 1);
      if (!tg.length && !all) { const f = core.foesOf(u)[0]; if (f) tg.push(f); }
      for (const t of tg) { if (!core.isUp(t) || !core.isUp(u)) continue; core.hit = ++core.hitSeq;
        if (!core.rng.chance(BR.hitChance(core, u, t, sk))) { core.emit(EVT.MISS, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: i } }); continue; }
        core.emit(EVT.HIT, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: i, hits: els.length, el } });
        EFFECT_TYPES.damage.exec(core, { type: 'damage', power: ef.power || 50, el, cat: '特' }, { ...ctx, tgt: t, n: i, scale: tg.length > 1 ? BR.AOE_MUL : 1 }, [t]); } }); } },
  // 遊俠: 影牙連射 on a target that already had full marks → spend them all, +40 power each (割喉 +20)
  hunt_detonate: { exec(core, ef, ctx) { const u = ctx.owner, cmd = ctx.cmd || {}, t = (ctx.targets || [])[0]; if (!t || !core.isUp(t) || (cmd.markWas || 0) < BV12.markMax(core, u)) return;
    const n = BV12.markOf(core, u, t); if (!n) return; core.removeStatus(t, 'hunt_mark', 'detonate', u); core.emit(EVT.MESSAGE, { src: u, tgts: [t], payload: { key: 'detonate', n } });
    const p = BR.FORMULA.detonate({ core, owner: u, marks: n }); EFFECT_TYPES.damage.exec(core, { type: 'damage', power: p, kind: 'detonate' }, { ...ctx, tgt: t, n: 9 }, [t]);
    if (core.rule(u, 'shadowReset')) core.cutCooldown(u, 'sig_ranger', 99, 'shadowReset'); } },
  // 機工士: the turret fires at round end (power 40); 集火 aims at your last target (+20%), 連射 fires twice, 機關城 fires the weapon special
  turret_fire: { exec(core, ef, ctx) { const u = ctx.owner; const shots = core.rule(u, 'twinShot') ? 2 : 1;
    for (let i = 0; i < shots; i++) { const s = core.statusOf(u, 'turret'); if (!s || !core.isUp(u)) return; const foes = core.foesOf(u); if (!foes.length) return;
      const focus = core.rule(u, 'focusFire'), last = core.byId[u.data.lastTarget], t = focus && last && core.isUp(last) ? last : foes[0];
      core.applyStatus(u, u, 'turret', { delta: -1, quiet: 1 }); core.emit(EVT.MESSAGE, { src: u, tgts: [t], payload: { key: 'turret_fire', left: Math.max(0, s.stacks) } });
      if (core.rule(u, 'gearCity') && u.data.wspSkill && DEF.skills[u.data.wspSkill]) { const sk = DEF.skills[u.data.wspSkill]; core.doSkill(u, sk, sk.target === 'self' ? [u] : [t], { meta: { release: 1, follow: 1 } }); continue; }
      const mul = (focus ? 1.2 : 1) * (core.rule(u, 'bastion') && core.hasStatus(u, 'guard') ? 1.5 : 1);
      const e = EFFECT_TYPES.damage.exec(core, { type: 'damage', power: 40, mul, kind: 'turret', tags: ['turret'] }, { ...ctx, skill: DEF.skills.turret_shot, tgt: t, n: 0, scale: 1 }, [t]); } } },
  turret_set: { exec(core, ef, ctx) { const u = ctx.owner; core.applyStatus(u, u, 'turret', { delta: BV12.turretMax(core, u) }); } },
  // 樂器: the shortest of your own stat boosts lasts one more action
  buff_extend: { exec(core, ef, ctx) { const u = ctx.owner, L = u.statuses.filter(s => DEF.statuses[s.id].group === 'stage' && s.stacks > 0 && s.dur != null).sort((a, b) => a.dur - b.dur); if (L[0]) L[0].dur += ef.n || 1; } },
  // 異界勇者: 看破 per monster family (光之勇者: shared)
  insight_add: { exec(core, ef, ctx) { const u = ctx.owner, t = (ctx.trigEv && core.byId[ctx.trigEv.tgts[0]]) || ctx.tgt; if (!t) return; const I = u.data.insight || (u.data.insight = {}), k = BV12.insightKey(core, u, t), max = BV12.insightMax(core, u);
    const was = I[k] || 0; if (was >= max) return; I[k] = Math.min(max, was + (ef.n || 1)); core.emit(EVT.MESSAGE, { src: u, tgts: [t], payload: { key: 'insight', n: I[k] } }); if ('insight' in u.res) core.changeRes(u, 'insight', I[k] - u.res.insight, { why: 'insight', force: 1 }); } },
  // cast a skill outside the action order (舞王, 周天): pays `payRes` first, the cast is a follow-up
  auto_skill: { exec(core, ef, ctx) { const u = ctx.owner, sk = DEF.skills[ef.skill]; if (!sk || !core.isUp(u)) return; let spent = 0;
    if (ef.payRes) { spent = ef.pay != null ? Math.min(ef.pay, u.res[ef.payRes] || 0) : (u.res[ef.payRes] || 0); if (spent && !core.rule(u, ef.keepRule || '-')) core.changeRes(u, ef.payRes, -spent, { why: 'auto' }); }
    const foe = core.byId[u.data.lastTarget] && core.isUp(core.byId[u.data.lastTarget]) ? core.byId[u.data.lastTarget] : core.foesOf(u)[0]; if (sk.target !== 'self' && !foe) return;
    core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: 'auto_skill', skill: sk.id } });
    core.doSkill(u, sk, sk.target === 'self' ? [u] : sk.target === 'all_enemies' ? core.foesOf(u) : [foe], { meta: { follow: 1, release: 1 }, spent }); } },
  // 吟遊詩人: a different kind of action than the last one +1 拍, the same twice −1 (即興: no loss)
  beat_step: { exec(core, ef, ctx) { const u = ctx.owner; if (!('beat' in u.res)) return; const a = u.data.lastAct, p = u.data.prevAct;
    if (!p || a !== p) core.changeRes(u, 'beat', 1, { why: 'beat' }); else if (!core.rule(u, 'improv')) core.changeRes(u, 'beat', -1, { why: 'repeat' }); } },
  // 龍騎士: jump again right away (連躍, 不滅)
  rejump: { exec(core, ef, ctx) { const u = ctx.owner; if (!core.isUp(u) || core.hasStatus(u, 'charging')) return; const t = core.foesOf(u)[0]; if (!t) return;
    core.emit(EVT.CHARGE, { src: u, tgts: [t], payload: { skill: 'sig_dragoon', why: ef.why || 'rejump' }, tags: ['charge'] }, () => { core.applyStatus(u, u, 'charging', { data: { skill: 'sig_dragoon', targets: [t.id] } }); core.applyStatus(u, u, 'airborne', {}); }); } },
});
// heal / status / stage effects accept formulas for their numbers
{ const H = EFFECT_TYPES.heal.exec; EFFECT_TYPES.heal.exec = function (core, ef, ctx, tg) { if (ef.pct && typeof ef.pct === 'object') ef = { ...ef, pct: BR.val(ef.pct, { core, owner: ctx.owner, src: ctx.owner, spent: ctx.spent, ctx }) }; if (ef.ofCast && typeof ef.ofCast === 'object') ef = { ...ef, ofCast: BR.val(ef.ofCast, { core, owner: ctx.owner, src: ctx.owner, spent: ctx.spent, ctx }) }; return H.call(this, core, ef, ctx, tg); }; }
{ const S = EFFECT_TYPES.status.exec; EFFECT_TYPES.status.exec = function (core, ef, ctx, tg) { const c = { core, owner: ctx.owner, src: ctx.owner, spent: ctx.spent, ctx }; if ((ef.dur && typeof ef.dur === 'object') || (ef.delta && typeof ef.delta === 'object')) ef = { ...ef, dur: BR.val(ef.dur, c), delta: BR.val(ef.delta, c) }; return S.call(this, core, ef, ctx, tg); }; }
{ const S = EFFECT_TYPES.stage.exec; EFFECT_TYPES.stage.exec = function (core, ef, ctx, tg) { if (ef.dur && typeof ef.dur === 'object') ef = { ...ef, dur: BR.val(ef.dur, { core, owner: ctx.owner, src: ctx.owner, spent: ctx.spent, ctx }) }; return S.call(this, core, ef, ctx, tg); }; }
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { if (ef.elWeapon) ef = { ...ef, el: (ctx.owner && ctx.owner.data.welem) || '一般' }; return D.call(this, core, ef, ctx, tg); }; }

/* ---------- alternative payers for an all-of-resource cost ---------- */
// 血劍: each missing 劍意 costs 8% max HP
BV_ALT_COST.bloodBlade = (core, u, sk, c, min, check) => { if (!core.rule(u, 'bloodBlade')) return null; const have = u.res[c.res] || 0, hp = Math.ceil(u.max.hp * 0.08 * (min - have)); if (u.res.hp <= hp) return null; if (check) return min;
  if (have) core.changeRes(u, c.res, -have, { why: 'cost' }); core.dealDamage(null, u, hp, { kind: 'cost', cat: 'fixed', tags: ['fixed'] }); return min; };
// 風舞: at 5 連段 the 武者一閃 is paid with 連段 instead
BV_ALT_COST.windDance = (core, u, sk, c, min, check) => { if (!core.rule(u, 'windDance') || (u.res.combo || 0) < 5) return null; if (check) return min; const n = u.res.combo; core.changeRes(u, 'combo', -n, { why: 'cost' }); return n; };
// 賢者: no 咒印 → 15 MP, two hits of the weapon's element
BV_ALT_COST.sage = (core, u, sk, c, min, check) => { if (!core.rule(u, 'sage') || (u.res.mp || 0) < 15 + core.costOf(u, sk, { res: 'mp', amount: 4 })) return null; if (check) return min;
  core.changeRes(u, 'mp', -15, { why: 'cost' }); const el = u.data.welem || '一般'; if (core.act) core.act.sigilEls = [el, el]; return 2; };

/* ---------- class resources (each fight starts at 0; 共鳴 raises the cap by 1) ---------- */
const CLS_RES = { swordsman: ['ki', '劍意', 5], mage: ['sigil', '咒印', 3], guardian: ['stance', '守勢', 5], bard: ['beat', '樂章', 3], monk: ['chi', '氣', 5], dragoon: ['dragon', '龍血', 3], otherworlder: ['insight', '看破', 3], spellblade: ['rune', '魔紋', 3] };
for (const c in CLS_RES) { const [id, n, max] = CLS_RES[c]; defPut('resources', id, { scope: 'battle', min: 0, max, appliesTo: (u, s) => u.hero && s.cls === c, initOf: () => 0, display: 'pips', metadata: { name: n, cls: c } }); }

/* ---------- class statuses ---------- */
defPut('statuses', 'elem_burst', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '元素爆發' },
  mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'burstMul' }, cond: { cat: '特', hasPower: 1, burstOld: 1 } }] });
defPut('statuses', 'hunt_mark', { tags: ['debuff', 'mark'], duration: 'battle', stack: 'add', keepOnDown: true, maxOf: (core, t, src) => src ? BV12.markMax(core, src) : 3, metadata: { n: '獵印' },
  onApply: (core, t, inst, src) => { if (!src) return; for (const f of core.units) if (f !== t && f.side === t.side && BV12.markOf(core, src, f)) core.removeStatus(f, 'hunt_mark', 'moved', src); } });
defPut('statuses', 'turret', { tags: ['buff', 'summon'], duration: 'until_empty', stack: 'signed', min: 0, maxOf: (core, u) => BV12.turretMax(core, u), max: 6, metadata: { n: '砲台' } });
defPut('statuses', 'overdrive', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '超載' } });
defPut('statuses', 'sure_crit', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '必定會心' },
  mods: [{ stage: 'attacker', who: 'attacker', crit: true, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { hasPower: 1 }, system: 1, effects: [{ type: 'remove_status', target: 'self', status: 'sure_crit', why: 'used' }] }] });
defPut('statuses', 'first_strike', { tags: ['buff'], duration: 'round', clearAt: 'round_end', stack: 'refresh', metadata: { n: '先機' },
  mods: [{ stage: 'equipment', who: 'attacker', mul: 1.2, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, system: 1, effects: [{ type: 'remove_status', target: 'self', status: 'first_strike', why: 'used' }] }] });
// the turret's shot is a skill too (tags, element, category)
defPut('skills', 'turret_shot', { ...skillFromMove('turret_shot', { n: '砲台射擊', t: '一般', cat: '物', pow: 40, acc: null, fx: 'gunShot' }, { kind: 'skill', extraTags: ['summon'] }) });

/* ---------- trigger builders ---------- */
const TRG = (on, role, cond, effects, x = {}) => ({ on, phase: 'POST', role, cond, effects, ...x });
const TPRE = (on, role, cond, effects, x = {}) => ({ on, phase: 'PRE', role, cond, effects, ...x });
const GAIN = (res, n = 1, cap = 0, x = {}) => ({ type: 'gain', target: 'self', res, n, cap, ...x });

/* ---------- the 10 classes (draft §3) ---------- */
const CLS12 = {
  swordsman: { res: 'ki', sig: 'sig_swordsman', aff: ['劍', '短刀', '斧'], passive: ['武者之魂', '劍意 3 以上時普攻會心率 +10%'], rule: '物理攻擊命中 +1 劍意，會心命中再 +1（每次行動最多 +2）', limit: '防禦或使用道具會失去 1 劍意',
    make: u => ({ mods: [{ stage: 'talent', who: 'attacker', critAdd: 10, cond: { tag: 'basic', ownerResAtLeast: ['ki', 3] } }], triggers: [
      TRG(EVT.DAMAGE, 'src', { cat: '物', evHit: 1, srcSide: 'self', tgtSide: 'enemy' }, [GAIN('ki', 1, 2)], { notTags: ['sig'] }),
      TRG(EVT.DAMAGE, 'src', { cat: '物', evHit: 1, crit: 1, tgtSide: 'enemy' }, [GAIN('ki', 1, 2)], { notTags: ['sig'] }),
      TRG(EVT.DEFEND, 'src', { ruleOff: 'kiGuard' }, [GAIN('ki', -1)]), TRG(EVT.DEFEND, 'src', { ruleOn: 'kiGuard' }, [GAIN('ki', 1)]),
      TRG(EVT.ITEM_USE, 'src', {}, [GAIN('ki', -1)])] }) },
  mage: { res: 'sigil', sig: 'sig_mage', aff: ['法杖', '魔導書'], passive: ['魔力之泉', '回合結束回復 3% MP'], rule: '使用屬性技能時記下該屬性（不同屬性最多 3 個）；集滿 3 種時，下一個魔法技能「元素爆發」威力 ×1.5，然後清空', limit: '連續用同一屬性，咒印不會增加',
    make: u => ({ triggers: [
      TRG(EVT.SKILL_SUCCESS, 'src', { burstOld: 1, cat: '特', hasPower: 1 }, [{ type: 'burst_used' }], { prio: 10 }),
      TRG(EVT.SKILL_SUCCESS, 'src', { elemSkill: 1 }, [{ type: 'sigil_add' }], { prio: 5 }),
      TRG(EVT.COST_PAY, 'src', { evRes: 'sigil' }, [{ type: 'sigil_take' }]),
      TRG(EVT.ROUND_END, null, { ownerAlive: 1 }, [{ type: 'resource', target: 'self', res: 'mp', pct: { f: 'mpSpring' }, min: 1, why: 'spring' }])] }) },
  guardian: { res: 'stance', sig: 'sig_guardian', aff: ['劍', '斧'], passive: ['守護之盾', '防禦時再減傷 30%；持盾時受到的會心傷害 −50%'], rule: '受到攻擊 +1 守勢、防禦中受到攻擊 +2、格擋成功 +1', limit: '一整回合沒被攻擊，守勢 −1',
    make: u => ({ mods: [{ stage: 'defender', who: 'defender', mul: 0.7, cond: { guarding: 1, hasPower: 1 } }, { stage: 'defender', who: 'defender', critTaken: 0.5, cond: { ownerHasShield: 1 } }], triggers: [
      TRG(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', hasPower: 1, guarding: 0 }, [GAIN('stance', 1)], { limit: { perAction: 1 } }),
      TRG(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', hasPower: 1, guarding: 1 }, [GAIN('stance', 2)], { limit: { perAction: 1 } }),
      TRG(EVT.ROUND_END, null, { ownerAlive: 1, notHitThisRound: 1, ruleOff: 'immovable' }, [GAIN('stance', -1, 0, { why: 'idle' })])] }) },
  ranger: { res: null, mark: 1, sig: 'sig_ranger', aff: ['短刀', '長槍', '火槍'], passive: ['獵人直覺', '改打另一隻魔物的那一擊必中、會心率 +15%'], rule: '獵印（在魔物身上，最多 3 層）：比對手先行動時命中、或會心命中 +1 層；每層讓遊俠對牠的傷害 +6%', limit: '獵印只對單一目標累積',
    make: u => ({ mods: [{ stage: 'talent', who: 'attacker', mul: { f: 'huntMul' }, cond: { hasPower: 1, tgtMarked: 1 } }, { stage: 'attacker', who: 'attacker', accAdd: 100, critAdd: 15, cond: { newTarget: 1, hasPower: 1 } }], triggers: [
      TRG(EVT.DAMAGE, 'src', { evHit: 1, hasPower: 1, tgtNotActed: 1, tgtAlive: 1, tgtSide: 'enemy' }, [{ type: 'status', target: 'event_target', status: 'hunt_mark' }], { limit: { perAction: 1 } }),
      TRG(EVT.DAMAGE, 'src', { evHit: 1, crit: 1, tgtAlive: 1, tgtSide: 'enemy' }, [{ type: 'status', target: 'event_target', status: 'hunt_mark' }], { limit: { perAction: 1 } })] }) },
  bard: { res: 'beat', sig: 'sig_bard', aff: ['樂器', '短刀'], passive: ['旋律', '特技所需層數 −1'], rule: '這次行動種類（攻擊／技能／防禦／道具）和上次不同 +1 拍；自己的能力提升持續時間 +1', limit: '同一種行動連續兩次會失去 1 拍',
    make: u => ({ mods: [{ selfBuffDur: 1 }], rules: { chargeCut: 1 }, triggers: [TRG(EVT.ACTION_END, 'src', { ownerAlive: 1, actExecuted: 1 }, [{ type: 'beat_step' }])] }) },
  machinist: { res: null, turret: 1, sig: 'sig_machinist', aff: ['火槍', '斧'], passive: ['精密機關', '砲台射擊命中時特技 +1'], rule: '砲台：同時最多 1 座，有 3 發彈藥，每回合結束自動射擊一隻魔物（威力 40），彈藥用完消失', limit: '機工士防禦時，砲台那回合不射擊',
    make: u => ({ triggers: [
      TRG(EVT.ROUND_END, null, { ownerAlive: 1, ownerHasStatus: 'turret', guarding: 0 }, [{ type: 'turret_fire' }], { prio: 3 }),
      TRG(EVT.ROUND_END, null, { ownerAlive: 1, ownerHasStatus: 'turret', guarding: 1, ruleOn: 'bastion' }, [{ type: 'turret_fire' }], { prio: 3 }),
      TRG(EVT.DAMAGE, 'src', { evKind: 'turret', hpLost: 1 }, [{ type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'turret' }])] }) },
  monk: { res: 'chi', sig: 'sig_monk', aff: ['拳套'], passive: ['氣', '普攻多回復 2 MP'], rule: '每一段命中 +1 氣（每次行動最多 +2）；氣滿時，下一個傷害技能必定會心，然後清空', limit: '防禦時氣 −2',
    make: u => ({ mods: [{ stage: 'base', atkMp: 2 }, { stage: 'attacker', who: 'attacker', crit: true, cond: { actFlag: 'chiCrit', hasPower: 1 } }], triggers: [
      TRG(EVT.DAMAGE, 'src', { evHit: 1, hasPower: 1, cat: '物', tgtSide: 'enemy', ...(u.data.rules.arhat ? { isBasic: 0 } : {}) }, [GAIN('chi', 1, 2)], { notTags: ['sig'] }),
      ...(u.data.rules.arhat ? [TRG(EVT.DAMAGE, 'src', { evHit: 1, tag: 'basic', tgtSide: 'enemy' }, [GAIN('chi', 1)])] : []),
      TRG(EVT.DAMAGE, 'src', { evHit: 1, hasPower: 1, cat: '特', tgtSide: 'enemy', ruleOn: 'chiMagic' }, [GAIN('chi', 1, 2)], { notTags: ['sig'] }),
      TPRE(EVT.COST_PAY, 'src', { evRes: 'chi', chiReady: 1 }, [{ type: 'act_flag', key: 'chiCrit' }]),
      TPRE(EVT.SKILL_USE, 'src', { chiReady: 1, hasPower: 1, isBasic: 0 }, [{ type: 'act_flag', key: 'chiCrit' }]),
      TPRE(EVT.SKILL_USE, 'src', { chiReady: 1, hasPower: 1, isBasic: 1, ruleOn: 'hakkei' }, [{ type: 'act_flag', key: 'chiCrit' }]),
      TRG(EVT.SKILL_SUCCESS, 'src', { actFlag: 'chiCrit', hasPower: 1, chiReady: 1 }, [{ type: 'resource', target: 'self', res: 'chi', set: 0, why: 'release' }], { prio: 8 }),
      TRG(EVT.DEFEND, 'src', { ruleOff: 'flowBody' }, [GAIN('chi', -2)])] }) },
  dragoon: { res: 'dragon', sig: 'sig_dragoon', aff: ['長槍', '斧'], passive: ['龍之血脈', '落地攻擊無視 30% 物防'], rule: '在空中閃過攻擊 +1 龍血、落地命中 +1', limit: '在空中不能使用道具',
    make: u => ({ mods: [{ stage: 'attacker', who: 'attacker', defMul: 0.7, cond: { skillIs: 'sig_dragoon' } }], triggers: [
      TRG(EVT.MISS, 'tgt', { evAir: 1, srcSide: 'enemy' }, [GAIN('dragon', 1)]),
      TRG(EVT.DAMAGE, 'src', { skillIs: 'sig_dragoon', evHit: 1 }, [GAIN('dragon', 1)], { limit: { perAction: 1 } })] }) },
  otherworlder: { res: 'insight', sig: 'sig_otherworlder', aff: ['*'], passive: ['異界之力', '物理和魔法技能都會帶武器屬性'], rule: '看破（每個種族最多 3 層，本場有效）：打中弱點 +1 層；每層對該種族傷害 +8%', limit: '不能裝備盾',
    make: u => ({ mods: [{ weaponElemAll: 1 }, { stage: 'talent', who: 'attacker', mul: { f: 'insightMul' }, cond: { hasPower: 1 } }], triggers: [
      TRG(EVT.DAMAGE, 'src', { weakHit: 1, evHit: 1, tgtSide: 'enemy' }, [{ type: 'insight_add' }], { limit: { perAction: 1 } })] }) },
  spellblade: { res: 'rune', sig: 'sig_spellblade', aff: ['劍'], passive: ['魔劍', '無屬性技能全部帶武器屬性'], rule: '物理攻擊命中 +1 魔紋；魔法技能消耗全部魔紋，每層威力 +20%', limit: '魔紋到 3 之後，物理攻擊不再累積',
    make: u => ({ mods: [{ weaponElemAll: 1 }, { stage: 'skill', who: 'attacker', powMul: { f: 'runeMul' }, cond: { cat: '特', isBasic: 0, hasPower: 1 } }], triggers: [
      TRG(EVT.DAMAGE, 'src', { cat: '物', evHit: 1, hasPower: 1, tgtSide: 'enemy' }, [GAIN('rune', 1, 1)], { notTags: ['sig'] }),
      TRG(EVT.SKILL_SUCCESS, 'src', { cat: '特', isBasic: 0, hasPower: 1, ownerResAtLeast: ['rune', 1], ruleOff: 'runeKing' }, [{ type: 'resource', target: 'self', res: 'rune', set: 0, why: 'spend' }], { prio: 6 })] }) },
};
BR.FORMULA.mpSpring = c => c.core.rule(c.owner || c.src, 'springUp') ? 0.06 : 0.03;
Object.assign(COND, { actExecuted: (c, v) => !!c.ev && !!c.ev.payload.executed === !!v && !c.ev.payload.reaction });
for (const c in CLS12) { const C = CLS12[c]; defPut('mechanics', 'cls_' + c, { make: C.make, layer: 'class', metadata: { cls: c } }); }

/* ---------- class signature skills (draft §3) ---------- */
const SIG12 = {
  swordsman: { n: '武者一閃', d: '消耗全部劍意（至少 2）。威力 60＋20×劍意，每點劍意會心率 +10%，搶先。', tpl: 'iaiSlash', cat: '物', power: 60, powerOf: 'iai', prio: 1, cd: 0,
    costs: [{ res: 'ki', all: 1, min: 2, alt: ['bloodBlade', 'windDance'] }], mods: [{ stage: 'skill', who: 'attacker', critAdd: { f: 'iaiCrit' } }] },
  mage: { n: '元素奔流', d: '消耗全部咒印（至少 1），每個咒印打一段該屬性魔法（威力 50／段）。', tpl: 'manaBurst', cat: '特', power: 50, cd: 1, noHitRoll: true,
    costs: [{ res: 'sigil', all: 1, min: 1, alt: 'sage' }, { res: 'mp', amount: 4 }], effects: [{ type: 'sigil_storm', power: 50 }] },
  guardian: { n: '聖盾衝擊', d: '消耗全部守勢（至少 2）。威力 50＋15×守勢，再加上物防的一半；之後展開護盾（守勢 4 以上時 2 回合）。', tpl: 'guardStrike', cat: '物', power: 50, powerOf: 'guardStrike', cd: 0,
    costs: [{ res: 'stance', all: 1, min: 2 }], mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'guardAtk' } }],
    effects: [{ type: 'damage', cond: { ruleOff: 'sanctuary' } }],
    after: [{ type: 'status', status: 'barrier', target: 'self', dur: { f: 'shieldDur' }, cond: { ruleOff: 'sanctuary' } }, { type: 'heal', target: 'self', pct: { f: 'sancHeal' }, cond: { ruleOn: 'sanctuary' } }, { type: 'status', status: 'barrier', target: 'self', dur: 3, cond: { ruleOn: 'sanctuary' } }] },
  ranger: { n: '影牙連射', d: '2 段（各 35），每段 +1 獵印；目標已有 3 層時引爆，消耗全部獵印追加 40×層數。', tpl: 'twinStrike', cat: '物', power: 35, hits: [2, 2], cd: 2,
    costs: [{ res: 'mp', amount: 4 }], hitsOf: (core, u) => core.rule(u, 'sniper') ? 1 : 2, onPrepare: (core, u, cmd) => { cmd.markWas = BV12.markOf(core, u, core.byId[(cmd.tg || [])[0]]); },
    mods: [{ stage: 'skill', who: 'attacker', critAdd: 30, cond: { ruleOn: 'sniper' } }],
    effects: [{ type: 'damage', power: { f: 'fangPow' } }, { type: 'status', status: 'hunt_mark', delta: { f: 'fangMarks' }, cond: { tgtAlive: 1 } }], after: [{ type: 'hunt_detonate' }] },
  bard: { n: '共鳴旋律', d: '消耗全部拍（至少 1）。物攻、魔攻 +1（3 拍時 +2），回復最大 HP 6%×拍數，特技 +1。', tpl: 'battleSong', cat: '變', power: 0, cd: 0, target: 'self',
    costs: [{ res: 'beat', all: 1, min: 1 }, { res: 'mp', amount: 5 }],
    effects: [{ type: 'stage', target: 'self', stats: { atk: 1, spa: 1 }, dur: { f: 'songDur' }, cond: { spentBelow: 3, ruleOff: 'hymn' } }, { type: 'stage', target: 'self', stats: { atk: 2, spa: 2 }, dur: { f: 'songDur' }, cond: { spentAtLeast: 3, ruleOff: 'hymn' } },
      { type: 'stage', target: 'self', stats: { spa: 1 }, dur: { f: 'songDur' }, cond: { spentBelow: 3, ruleOn: 'hymn' } }, { type: 'stage', target: 'self', stats: { spa: 2 }, dur: { f: 'songDur' }, cond: { spentAtLeast: 3, ruleOn: 'hymn' } },
      { type: 'heal', target: 'self', pct: { f: 'songHeal' } }, { type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'sig' }] },
  machinist: { n: '機關砲擊', d: '砲擊（威力 90）並設置／補滿砲台。', tpl: 'clockBomb', cat: '物', power: 90, powerOf: 'cannon', cd: 2, costs: [{ res: 'mp', amount: 5 }],
    mods: [{ stage: 'skill', who: 'attacker', mul: 1.4, cond: { ownerHasStatus: 'overdrive' } }], after: [{ type: 'remove_status', target: 'self', status: 'overdrive', why: 'used' }, { type: 'turret_set' }] },
  monk: { n: '連環寸勁', d: '3 段（各 30），每 1 點氣多 1 段，消耗全部氣。', tpl: 'comboPunch', cat: '物', power: 30, hits: [3, 3], cd: 0, costs: [{ res: 'chi', all: 1, min: 0 }, { res: 'mp', amount: 4 }],
    hitsOf: (core, u, cmd) => (core.rule(u, 'hundredFists') ? 5 : 3) + (cmd.spent || 0) },
  dragoon: { n: '龍騰擊', d: '跳上空中（大部分攻擊打不到），下一次行動落下，威力 185。龍血 3 時落地改成全體攻擊並清空龍血。', tpl: 'jump', cat: '物', power: 185, powerOf: 'dragonLand', cd: 2, charge: 1, airborne: 1,
    costs: [{ res: 'mp', amount: 6 }], chargeSkip: (core, u) => !!core.rule(u, 'skyfall'), onPrepare: (core, u, cmd) => { if (core.rule(u, 'skyfall')) cmd.meta.powMul = 0.7; },
    targetOf: (core, u, cmd) => { const landing = (cmd.meta && cmd.meta.release) || core.rule(u, 'skyfall'); if (!landing) return null; cmd.dragonFull = (u.res.dragon || 0) >= (u.max.dragon || 3); if (cmd.dragonFull || core.rule(u, 'dragonGod')) { cmd.aoeLand = 1; return 'all_enemies'; } return null; },
    after: [{ type: 'resource', target: 'self', res: 'dragon', set: 0, why: 'land', cond: { actFlag: 'dragonFull' } }] },
  otherworlder: { n: '曙光之刃', d: '威力 120，吸取傷害的 20% HP，會心率加倍；有 3 層看破時改成全體攻擊，而且不花 MP。', tpl: 'dawnBreak', cat: '物', power: 120, critX: 2, cd: 1,
    costs: [{ res: 'mp', amount: 6 }], targetOf: (core, u, cmd) => { const t = core.byId[(cmd.targets || [])[0]] || core.foesOf(u)[0]; return t && BV12.insightOf(core, u, t) >= BV12.insightMax(core, u) ? 'all_enemies' : null; },
    after: [{ type: 'heal', target: 'self', ofCast: { f: 'dawnDrain' }, kind: 'drain', quiet: 1 }] },
  spellblade: { n: '魔劍解放', d: '以物攻、魔攻中較高者計算，威力 95，回復造成傷害 10% 的 MP；消耗魔紋，每層多 1 段（40）。', tpl: 'manaSlash', cat: '物', power: 95, powerOf: 'mbRelease', cd: 1,
    costs: [{ res: 'rune', all: 1, min: 0 }, { res: 'mp', amount: 3 }], catOf: (core, u) => u.stats.spa > u.stats.atk ? '特' : '物', hitsOf: (core, u, cmd) => 1 + (cmd.spent || 0),
    effects: [{ type: 'damage', cond: { firstHit: 1 } }, { type: 'damage', power: 40, cond: { firstHit: 0, ruleOff: 'dualPole' } }, { type: 'damage', power: 40, cat: '特', elWeapon: 1, cond: { firstHit: 0, ruleOn: 'dualPole' } }],
    after: [{ type: 'resource', target: 'self', res: 'mp', ofCast: 0.1, why: 'release' }] },
};
// the otherworlder's cost: free at full 看破 on the chosen target
CLS12.otherworlder.make = (mk => u => { const m = mk(u); m.mods.push({ stage: 'skill', costMul: 0, res: 'mp', cond: { skillIs: 'sig_otherworlder', insightFullAct: 1 } }); return m; })(CLS12.otherworlder.make);
for (const c in SIG12) { const S = SIG12[c], id = 'sig_' + c, T = MOVES[id] || MOVES[S.tpl] || {};
  const d = skillFromMove(id, { ...T, n: S.n, d: S.d, t: '一般', cat: S.cat, pow: S.power, prio: S.prio || 0, acc: S.cat === '變' ? null : 100, hits: S.hits || null, charge: S.charge || 0, jump: S.airborne || 0, eff: null, drain: 0, recoil: 0, heal: 0, shield: 0, stat: null, st: null, crit: S.critX === 2 },
    { kind: 'skill', tpl: S.tpl, extraTags: ['sig'], costs: S.costs, fallback: 'attack' });
  Object.assign(d, { cooldown: S.cd, target: S.target || 'enemy', effects: S.effects || (S.power ? [{ type: 'damage' }] : []), after: S.after || [], mods: S.mods || [], critX: S.critX || 1, prio: S.prio || 0,
    powerOf: S.powerOf || null, hitsOf: S.hitsOf || null, targetOf: S.targetOf || null, onPrepare: S.onPrepare || null, chargeSkip: S.chargeSkip || null, catOf: S.catOf || null, noHitRoll: !!S.noHitRoll || S.cat === '變', airborne: !!S.airborne, charge: !!S.charge });
  if (S.cat === '變') d.tags = d.tags.filter(t => t !== 'damage');
  d.metadata = { ...d.metadata, cls: c, learn: 0 }; defPut('skills', id, { ...d, override: 1 });
  if (MOVES[id]) Object.assign(MOVES[id], { n: S.n, d: S.d, pow: S.power, mp: (S.costs.find(x => x.res === 'mp') || {}).amount || 0 }); }

/* ---------- DEF.classes (spec §2: class = rules) ---------- */
for (const c in CLS12) { const C = CLS12[c]; defPut('classes', c, { sig: C.sig, resources: C.res ? [C.res] : [], res: C.res, affinity: C.aff, passive: { n: C.passive[0], d: C.passive[1] }, rule: C.rule, limit: C.limit, mechanic: 'cls_' + c, tags: [], metadata: { n: (CLASSES[c] || {}).n || c } }); }

// v12.0.1 (player: 「普通攻擊幾乎用不到」→ 選了「普攻回 MP」): a basic hit restores 12% of max MP (at least 3), so attack → skill becomes the rhythm
const ATK_MP12 = mp => Math.max(3, Math.round((mp || 0) * 0.12));
/* ---------- the hero's core loop (v12): basic hits feed MP and 特技; 連段 only with a talent that grants it ---------- */
defPut('mechanics', 'heroCore', { override: 1, layer: 'system', make: (u) => ({ mods: u.data.rules && u.data.rules.combo ? [{ stage: 'talent', who: 'attacker', mul: { f: 'comboStep', v: 6 }, cond: { hasPower: 1 } }] : [],
  triggers: [
    TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1 }, [{ type: 'resource', target: 'self', res: 'mp', amount: ATK_MP12(u.max.mp) + u.mods.reduce((a, m) => a + (m.atkMp || 0), 0) + ((u.data.rules && u.data.rules.atkMp) || 0), why: 'basic' }], { limit: { perAction: 1 }, system: 1, prio: 9 }),
    TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1 }, [{ type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'hit' }], { limit: u.data.wcPerHit ? {} : { perAction: 1 }, system: 1, prio: 9 }),
    TRG(EVT.RESOURCE_FULL, 'tgt', { evRes: 'wc' }, [{ type: 'fire_special' }], { prio: 6 }),
    TRG(EVT.DEFEND, 'src', {}, [{ type: 'resource', target: 'self', res: 'mp', pct: { f: 'breath' }, min: 1, why: 'breath' }], { system: 1 }),
    TRG(EVT.SKILL_USE, 'src', { isBasic: 0 }, [{ type: 'rotate_res', res: 'combo' }], { system: 1, tags: ['skill'], notTags: ['weapon_special'] }),
    TRG(EVT.DEFEND, 'src', {}, [{ type: 'resource', target: 'self', res: 'combo', set: 0 }], { system: 1 }),
  ] }) });
BR.FORMULA.breath = c => c.core.rule(c.owner || c.src, 'meditate') ? 0.25 : 0.12;
{ const R = EFFECT_TYPES.resource.exec; EFFECT_TYPES.resource.exec = function (core, ef, ctx, tg) { if (ef.pct && typeof ef.pct === 'object') ef = { ...ef, pct: BR.val(ef.pct, { core, owner: ctx.owner, src: ctx.owner, ctx }) }; if (ef.amount && typeof ef.amount === 'object') ef = { ...ef, amount: BR.val(ef.amount, { core, owner: ctx.owner, src: ctx.owner, ctx }) }; return R.call(this, core, ef, ctx, tg); }; }
BR.FORMULA.comboStep = (c, v) => 1 + v * (c.src.res.combo || 0) / 100;
// 擅長武器: basic attack and 特技 +10% (異界勇者: every weapon +5%)
defPut('passives', 'affinity', { make: v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1 + v / 100, cond: { tag: 'basic', hasPower: 1 } }, { stage: 'equipment', who: 'attacker', mul: 1 + v / 100, cond: { tag: 'weapon_special', hasPower: 1 } }] }), metadata: { n: '擅長武器' } });

/* ---------- weapon kinds (draft §7.2) ---------- */
const WKIND12 = {
  劍: { d: '普攻會心率 +5%', make: () => ({ mods: [{ stage: 'equipment', who: 'attacker', critAdd: 5, cond: { tag: 'basic' } }] }) },
  短刀: { d: '普攻 2 段（各 55%），每段都累積特技', attack: 2 },
  斧: { d: '普攻命中時，對有護盾的魔物多削 1 格破防盾', make: () => ({ triggers: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1, tgtSide: 'enemy' }, [{ type: 'break_chip', target: 'event_target', n: 1, why: 'axe' }], { limit: { perAction: 1 } })] }) },
  長槍: { d: '普攻無視 15% 物防', make: () => ({ mods: [{ stage: 'attacker', who: 'attacker', defMul: 0.85, cond: { tag: 'basic' } }] }) },
  拳套: { d: '普攻 2 段（各 55%）', attack: 2 },
  法杖: { d: '普攻多回復 2 MP', make: () => ({ mods: [{ stage: 'base', atkMp: 2 }] }) },
  魔導書: { d: '普攻命中時，冷卻最久的技能 −1', make: () => ({ triggers: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1 }, [{ type: 'cooldown', target: 'self', how: 'longest', n: 1, why: 'tome' }], { limit: { perAction: 1 } })] }) },
  樂器: { d: '普攻命中時，自己剩下最短的能力提升 +1 回合', make: () => ({ triggers: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1 }, [{ type: 'buff_extend', n: 1 }], { limit: { perAction: 1 } })] }) },
  火槍: { d: '普攻必定命中', make: () => ({ mods: [{ stage: 'attacker', who: 'attacker', accAdd: 100, cond: { tag: 'basic' } }] }) },
};
for (const k in WKIND12) defPut('mechanics', 'wk_' + k, { layer: 'equip', make: WKIND12[k].make || (() => ({})), metadata: { kind: k, d: WKIND12[k].d } });
// basic attacks with 2 / 3 segments (短刀・拳套 55%, 狼王雙刃・羅漢 40%)
for (const [id, hits, mul] of [['attack_2', 2, 0.55], ['attack_3', 3, 0.4]]) defPut('skills', id, { ...skillFromMove(id, { ...MOVES.attack, pow: Math.round(40 * mul), acc: 100, hits }, { kind: 'attack', extraTags: ['basic'] }), metadata: { from: 'attack', segMul: mul } });

/* ---------- unique weapons (content §2) ---------- */
const UNIQ12 = {
  quakeAxe: { d: '特技發動時，所有魔物物防 −1', make: () => ({ triggers: [TRG(EVT.SKILL_SUCCESS, 'src', {}, [{ type: 'stage', target: 'all_enemies', stats: { def: -1 } }], { tags: ['weapon_special'] })] }) },
  tideRapier: { d: '對潮濕的魔物普攻傷害 +20%', make: () => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.2, cond: { tag: 'basic', tgtStatus: 'wet' } }] }) },
  wolfTwin: { d: '普攻 3 段（各 40%）', attack: 3 },
  coreStaff: { d: '用魔法打中灼傷的魔物時，灼傷傷害立刻再發作一次', make: () => ({ triggers: [TRG(EVT.DAMAGE, 'src', { cat: '特', evHit: 1, tgtStatus: 'brn', tgtAlive: 1 }, [{ type: 'damage', target: 'event_target', dot: 1 }], { limit: { perAction: 1 } })] }) },
  fallenLance: { d: '會心命中時無視全部物防', make: () => ({ mods: [{ stage: 'attacker', who: 'attacker', critPierce: 1 }] }) },
  thunderFist: { d: '普攻打中麻痺的魔物時追加一段雷擊（威力 30）', make: () => ({ triggers: [TRG(EVT.DAMAGE, 'src', { tag: 'basic', evHit: 1, tgtStatus: 'par', tgtAlive: 1 }, [{ type: 'damage', target: 'event_target', power: 30, el: '雷', kind: 'thunder' }], { limit: { perAction: 1 } })] }) },
  frostTome: { d: '對速度比你慢的魔物傷害 +15%', make: () => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.15, cond: { tgtSlower: 1, hasPower: 1 } }] }) },
  gearRifle: { d: '特技所需層數 −1；特技發動後下一次普攻必定會心', rules: { chargeCut: 1 }, make: () => ({ triggers: [TRG(EVT.SKILL_SUCCESS, 'src', {}, [{ type: 'status', target: 'self', status: 'critNext' }], { tags: ['weapon_special'] })] }) },
  boneGreatsword: { d: '打倒魔物時回復 15% HP', make: () => ({ triggers: [TRG(EVT.DOWN, null, { srcIsOwner: 1 }, [{ type: 'heal', target: 'self', pct: 0.15, kind: 'regen' }])] }) },
  moonHarp: { d: '自己的能力提升到期時回復 5% HP', make: () => ({ triggers: [TRG(EVT.STATUS_EXPIRE, 'tgt', { statusGroup: 'stage' }, [{ type: 'heal', target: 'self', pct: 0.05, kind: 'regen', quiet: 1 }])] }) },
};
for (const k in UNIQ12) defPut('mechanics', 'uw_' + k, { layer: 'equip', make: UNIQ12[k].make || (() => ({})), metadata: { uniq: k, d: UNIQ12[k].d } });

/* ---------- shields: 格擋 −40%, 守護者 +1 守勢 (draft §7.3) ---------- */
defPut('passives', 'block', { override: 1, layer: 'equip', make: v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', layer: 'reaction', cond: { srcSide: 'enemy', hasPower: 1 }, chance: Math.min(45, v) / 100,
  effects: [{ type: 'modify', mul: 0.6, note: 'block' }, { type: 'message', key: 'block', target: 'self' }, { type: 'resource', target: 'self', res: 'stance', amount: 1, why: 'block' }] }] }), metadata: { n: '格擋' } });
/* ---------- 撐住 (不屈・涅槃・安息…): DOWN PRE prevention, once per battle however many the unit has (content §0) ---------- */
const ENDURE12 = (then = []) => ({ triggers: [{ on: EVT.DOWN, phase: 'PRE', role: 'tgt', layer: 'prevent', whenDown: 1, onceGroup: 'endure', cond: {}, effects: [{ type: 'prevent_down', hp: 1, key: 'endure' }, ...then] }] });
for (const k of ['fx.endure', 'endureT']) defPut('passives', k, { override: 1, make: () => ENDURE12(), metadata: { n: '不屈' } });

/* ---------- accessory traits (Build type, content §4): every accessory keeps its numbers and gets one trait ---------- */
const ACC_TRAIT = {
  thorns: ['荊棘', '受到攻擊時反彈 20% 傷害', ['荊棘指環', '仙人掌護符']],
  endure: ['不屈', '每場 1 次撐住（以 1 HP 留下）', ['苔石之核', '湖神鱗片', '初代勇者的護符']],
  leech: ['吸血', '傷害的 5% 回復 HP', ['寶箱怪之牙']],
  double: ['連擊', '物理攻擊 20% 追加一擊（50%）', ['格倫的戰帶', '雪狼之牙']],
  pierce: ['破甲', '物理攻擊無視 30% 物防', ['古岩拳套', '星之守護']],
  lastStand: ['背水', 'HP 越低傷害越高（最多 +35%）', ['沙蟲之心', '熔岩之心']],
  hunter: ['獵殺', '對 HP 低於 50% 的魔物傷害 +15%', ['狼牙頸鍊', '虛空之戒']],
  breaker: ['碎盾', '攻擊命中 35% 多削 1 格破防盾', ['甲殼護符', '獵人之眼']],
  poisonEdge: ['毒刃', '物理攻擊 20% 讓目標中毒', ['孢子護符']],
  shadowStep: ['影步', '閃過攻擊時反擊', ['沙漠玫瑰']],
  regen: ['再生', '回合結束回復 4.5% HP（頭目戰 3%）', ['苔石護腕', '蜂蜜護符', '藥師香囊']],
  first: ['先制', '第一回合一定先行動', ['疾風羽飾', '星之羅盤']],
  guardHeal: ['堅守回復', '防禦時回復 10% HP', ['萌芽鎮護身符', '王國徽章', '諾拉的緞帶', '羈絆之證']],
  meditate: ['冥想', '回合結束回復 2% MP', ['魔法護符', '月露墜飾']],
  thrift: ['省力', '技能 12% 機率不花 MP', ['公會的印信']],
  fervor: ['奮戰', '攻擊後物攻或魔攻 +1（每場最多 2 次）', ['古王印戒', '火種護符', '格倫的護腕']],
  will: ['異常抗性', '異常狀態成功率 −20%', ['藥草香囊', '鎮魂鈴']],
  elemGuard: ['魔法抗性', '受到的魔法傷害 −12%', ['水晶之心', '蜥鱗護符', '冰晶護符']],
  wisdom: ['智慧', '戰鬥經驗值 +50%', ['旅人護符', '學者的單片眼鏡']],
  fortune: ['幸運', '戰鬥金錢 +50%、掉落率提升', ['行商人徽章', '礦工的提燈']],
  manaSiphon: ['魔力汲取', '普攻命中回復 4 MP', ['靈光提燈', '宰相的魔戒']],
  arcaneSurge: ['奧術湧動', 'MP 一半以上時魔法傷害 +15%', ['月光護符', '鬼火提燈']],
  resonance: ['共鳴', '職業核心資源上限 +1', ['異界之鑰', '星辰護符', '冒險王之證']],
  timeSand: ['時之砂', '技能進入冷卻時 20% 機率冷卻 −1', ['裂界指環', '古代懷錶']],
  initiative: ['先機', '使用搶先技能後，下回合第一次攻擊傷害 +20%', ['獵人的誓約', '時計之心']],
};
// the new trait keys (the others already exist as fx.* passive keys)
PV('fx.leech', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, effects: [{ type: 'heal', target: 'self', ofEvent: 0.05, field: 'total', kind: 'drain', quiet: 1 }] }] }));
PV('fx.hunter', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.15, cond: { tgtHpBelow: 0.5, hasPower: 1 } }] }));
PV('fx.meditate', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: 0.02, min: 1, why: 'meditate' }] }] }));
PV('fx.thrift', () => FREECAST(0.12));
PV('fx.will', v => ({ mods: [{ statusRes: 20 }] }));
PV('fx.elemGuard', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 0.88, cond: { cat: '特', hasPower: 1 } }] })); // v12.76: 元素抗性 → 魔法抗性
PV('fx.resonance', (v, u) => ({ rules: u.cls === 'otherworlder' ? { max_insight: 1, insightMax: 1 } : u.cls === 'ranger' ? { markMax: 1 } : u.cls === 'machinist' ? { turretMax: 1 } : DEF.classes[u.cls] && DEF.classes[u.cls].res ? { ['max_' + DEF.classes[u.cls].res]: 1 } : {} }));
PV('fx.timeSand', v => ({ triggers: [{ on: EVT.COOLDOWN, phase: 'POST', role: 'src', cond: { evSetCd: 1 }, chance: 0.2, effects: [{ type: 'cooldown', target: 'self', how: 'longest', n: 1, why: 'timeSand' }] }] }));
PV('fx.initiative', v => ({ triggers: [{ on: EVT.ROUND_START, phase: 'POST', cond: { ownerHasStatus: 'prio_used' }, effects: [{ type: 'status', target: 'self', status: 'first_strike', quiet: 1 }] }] }));
Object.assign(COND, { evSetCd: (c, v) => !!c.ev && !!c.ev.payload.set === !!v });
// the trait list on the accessories (each accessory exactly one), and the texts the menus show
{ const byName = {}; for (const k in GEAR) if (GEAR[k].slot === 'acc') byName[GEAR[k].n] = k;
  const TRAIT_CAT = { thorns: '防禦', endure: '防禦', leech: '回復', double: '攻擊', pierce: '攻擊', lastStand: '攻擊', hunter: '攻擊', breaker: '攻擊', poisonEdge: '攻擊', shadowStep: '防禦', regen: '回復', first: '攻擊', guardHeal: '回復', meditate: '資源',
    thrift: '資源', fervor: '攻擊', will: '防禦', elemGuard: '防禦', wisdom: '資源', fortune: '資源', manaSiphon: '資源', arcaneSurge: '攻擊', resonance: '資源', timeSand: '資源', initiative: '攻擊' };
  for (const t in ACC_TRAIT) { const [n, d, L] = ACC_TRAIT[t]; SPECIALS[t] = { ...(SPECIALS[t] || {}), n, d, cat: TRAIT_CAT[t] || (SPECIALS[t] && SPECIALS[t].cat) || '攻擊' }; for (const nm of L) { const k = byName[nm]; if (!k) { bvErr('acc', 'accessory ' + nm + ' missing'); continue; } GEAR[k].fx = [t]; GEAR[k].trait = t; } }
  for (const k in GEAR) if (GEAR[k].slot === 'acc' && !GEAR[k].trait) bvErr('acc', 'accessory ' + GEAR[k].n + ' has no trait'); }
