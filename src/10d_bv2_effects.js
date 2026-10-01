/* ===================== v11 戰鬥核心 v2 — 通用效果語言（技能、被動、狀態、敵人機制都只用這些） =====================
   exec(core, ef, ctx, targets): ctx.owner is who causes the effect (the actor of a skill, or the holder of a passive / status).
   Every effect goes through the core primitives, so every change is a formal event. */
const EFFECT_TYPES = {
  damage: { check: ef => (ef.power == null && ef.pctMax == null && ef.ofEvent == null && ef.ofCast == null && !ef.useSkill) ? null : null,
    exec(core, ef, ctx, tg) {
      const a = ctx.owner, sk = ctx.skill || DEF.skills.attack;
      for (const t of tg) { if (!core.isUp(t)) continue;
        if (ef.pctMax != null || ef.ofEvent != null || ef.ofCast != null || ef.flat != null) { // fixed damage (rocks, knives, thorns…)
          let v = ef.flat != null ? ef.flat : ef.pctMax != null ? t.max.hp * ef.pctMax * (t.boss && ef.bossMul ? ef.bossMul : 1) : ef.ofEvent != null ? (ctx.snap ? ctx.snap[ef.field || 'amount'] || 0 : 0) * ef.ofEvent * (t.boss && ef.bossMul ? ef.bossMul : 1) : (ctx.total || 0) * ef.ofCast;
          v = Math.max(1, Math.floor(v)); if (ef.nonLethal) { v = Math.min(v, t.res.hp - 1); if (v < 1) continue; } core.dealDamage(a, t, v, { el: ef.el || '一般', cat: ef.cat || 'fixed', kind: ef.kind || 'fixed', tags: (ef.tags || []).concat(['fixed']), min: 1 }); continue; }
        const el0 = ef.el || BR.elementOf(core, a, sk), cat0 = ef.cat || (sk.catOf ? sk.catOf(core, a) : sk.cat), cats = sk.catOf && core.rule(a, 'dualCat') ? ['物', '特'] : null;
        const s2 = el0 !== sk.el || cat0 !== sk.cat || ef.critX || cats ? { ...sk, el: el0, cat: cat0, critX: ef.critX || sk.critX, ...(cats ? { cats } : {}) } : sk;
        const pc = { core, owner: a, src: a, tgt: t, skill: sk, spent: ctx.spent || 0, ctx }, pw = BR.val(ef.power ?? (sk.powerOf ? { f: sk.powerOf } : sk.power), pc);
        const r = BR.damage(core, a, t, s2, { power: pw * (ctx.scale || 1) * (ef.mul || 1) * (ctx.powMul || 1), spent: ctx.spent || 0, n: ctx.n || 0, cat: cat0 });
        if (r.crit) core.emit(EVT.CRIT, { src: a, tgts: [t], payload: { skill: sk.id } });
        core.dealDamage(a, t, r.amount, { ...r, el: s2.el, cat: s2.cat, skill: sk.id, n: ctx.n, tags: sk.tags.concat(ef.tags || []), kind: ef.kind || 'hit' });
      } } },
  heal: { exec(core, ef, ctx, tg) { for (const t of tg) { if (!core.isUp(t)) continue; const v = ef.ofCast != null ? (ctx.total || 0) * ef.ofCast : ef.ofEvent != null ? (ctx.snap ? ctx.snap[ef.field || 'amount'] || 0 : 0) * ef.ofEvent : ef.amount != null ? ef.amount : BR.heal(core, ctx.owner, t, ef.pct || 0, { skill: ctx.skill });
    if (v <= 0 || t.res.hp >= t.max.hp) { if (ef.say !== false && t.res.hp >= t.max.hp && !ef.quiet) core.emit(EVT.MESSAGE, { src: ctx.owner, tgts: [t], payload: { key: 'hp_full' } }); continue; } core.heal(ctx.owner, t, v, { kind: ef.kind || 'heal', tags: ef.tags }); } } },
  recoil: { exec(core, ef, ctx) { const a = ctx.owner; if (!core.isUp(a)) return; const v = Math.max(1, Math.floor((ctx.total || 0) * ef.pct)); if (ctx.total > 0) core.dealDamage(a, a, v, { kind: 'recoil', cat: 'fixed', tags: ['recoil', 'fixed'] }); } },
  resource: { check: ef => ef.res ? null : 'resource effect needs res',
    exec(core, ef, ctx, tg) { for (const t of tg) { if (!core.isUp(t) || !(ef.res in t.res)) continue; let v = ef.amount != null ? ef.amount : ef.pct != null ? Math.ceil(t.max[ef.res] * ef.pct) : ef.ofCast != null ? Math.floor((ctx.total || 0) * ef.ofCast) : 0;
      if (ef.min != null) v = Math.sign(v || 1) * Math.max(Math.abs(v), ef.min); if (ef.set != null) v = ef.set - t.res[ef.res]; core.changeRes(t, ef.res, v, { src: ctx.owner, why: ef.why || null, tags: ef.tags }); } } },
  status: { check: ef => ef.status ? null : 'status effect needs status',
    exec(core, ef, ctx, tg) { let dur = ef.dur; if (dur != null && ctx.owner && ctx.skill) for (const m of ctx.owner.mods) if (m.durAdd && condOk(m.cond, { core, owner: ctx.owner, src: ctx.owner, skill: ctx.skill })) dur += m.durAdd;
      for (const t of tg) core.applyStatus(ctx.owner, t, ef.status, { dur, delta: ef.delta, data: ef.data ? { ...ef.data } : {}, secondary: !!ef.secondary }); } },
  remove_status: { exec(core, ef, ctx, tg) { for (const t of tg) for (const s of t.statuses.slice()) { const D = DEF.statuses[s.id];
    if ((ef.status && s.id === ef.status) || (ef.group && D.group === ef.group) || (ef.tag && (D.tags || []).includes(ef.tag))) core.removeStatus(t, s.id, ef.why || 'remove', ctx.owner); } } },
  stage: { check: ef => ef.stats ? null : 'stage effect needs stats',
    exec(core, ef, ctx, tg) { for (const t of tg) for (const k in ef.stats) core.applyStatus(ctx.owner, t, 'stage_' + k, { delta: ef.stats[k], dur: ef.dur ?? 3, secondary: !!ef.secondary }); } },
  dispel: { exec(core, ef, ctx, tg) { for (const t of tg) { let n = 0; for (const s of t.statuses.slice()) { const D = DEF.statuses[s.id]; if ((D.group === 'stage' && s.stacks > 0) || (ef.buffs && (D.tags || []).includes('buff'))) { core.removeStatus(t, s.id, 'dispel', ctx.owner); n++; } }
    core.emit(EVT.MESSAGE, { src: ctx.owner, tgts: [t], payload: { key: n ? 'dispelled' : 'dispel_none' } }); } } },
  cleanse: { exec(core, ef, ctx, tg) { for (const t of tg) { const m = core.majorOf(t); if (m) core.removeStatus(t, m, 'cleanse', ctx.owner); } } },
  // PRE-only effects: they change the event being decided
  cancel: { exec(core, ef, ctx) { if (ctx.pre) { ctx.pre.cancelled = true; ctx.pre.payload.cancelBy = ef.why || ctx.owner && ctx.owner.id; } } },
  modify: { exec(core, ef, ctx) { const e = ctx.pre; if (!e) return; const P = e.payload;
    if (ef.mul != null) P.amount = Math.max(ef.min ?? 1, Math.floor(P.amount * ef.mul)); if (ef.leaveOne && ctx.tgt && P.amount >= ctx.tgt.res.hp && ctx.tgt.res.hp > 1) P.amount = ctx.tgt.res.hp - 1;
    if (ef.set) Object.assign(P, ef.set); (P.notes || (P.notes = [])).push(ef.note || ef.why || 'mod'); } },
  message: { exec(core, ef, ctx, tg) { core.emit(EVT.MESSAGE, { src: ctx.owner, tgts: tg, payload: { key: ef.key || null, text: ef.text || null, vars: ef.vars || null, hold: ef.hold || null } }); } },
  counter: { exec(core, ef, ctx) { const src = ctx.trigEv && ctx.trigEv.src ? core.byId[ctx.trigEv.src] : ctx.pre && ctx.pre.src ? core.byId[ctx.pre.src] : null; if (!src || !core.isUp(src) || !core.isUp(ctx.owner)) return;
    core.react(ctx.owner, { skill: ef.skill || 'counter_strike', targets: [src.id], why: ef.why || 'counter', meta: { powMul: BR.val(ef.mul, { core, owner: ctx.owner, src: ctx.owner }) || 1 } }); } },
  extra_action: { exec(core, ef, ctx) { core.extraTurn(ctx.owner, ef.why || 'extra'); } },
  cancel_action: { exec(core, ef, ctx, tg) { for (const t of tg) { const i = core.order.findIndex(c => c.id === t.id); if (i >= 0) core.emit(EVT.ACTION_CANCEL, { src: ctx.owner, tgts: [t], payload: { why: ef.why || 'cancelled', pending: 1 } }, () => { core.order.splice(i, 1); }); } } },
  // DOWN PRE: keep the unit standing with `hp` HP (不屈・涅槃…); the core re-checks and cancels the DOWN
  prevent_down: { exec(core, ef, ctx) { const e = ctx.pre, u = e && core.byId[e.tgts[0]]; if (!u || e.type !== EVT.DOWN) return; u.res.hp = Math.max(1, ef.pct ? Math.floor(u.max.hp * ef.pct) : ef.hp || 1); e.payload.prevented = ef.why || 'endure';
    core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: ef.key || 'endure' } }); } },
  // cooldowns: how = 'longest' | 'all' | a skill id; n actions (or reset: 1 → to 0)
  cooldown: { exec(core, ef, ctx, tg) { for (const t of tg) core.cutCooldown(t, ef.how || 'longest', ef.reset ? 99 : ef.n || 1, ef.why || null); } },
  summon: { check: ef => ef.sp ? null : 'summon needs sp',
    exec(core, ef, ctx) { const n = ef.count || 1; for (let i = 0; i < n; i++) { if (core.alive(ctx.owner.side).length >= (ef.maxSide || 3)) break; const spec = BD.unitForEnemy(core, ef.sp, ef.lv || ctx.owner.lv, ef.kind || 'minion', ctx.owner.side, core.units.length); if (spec) core.addUnit(spec, false); } if (typeof BB !== 'undefined' && BB.nameFoes) BB.nameFoes(core); } },
  steal_gold: { exec(core, ef, ctx, tg) { const have = core.data.gold ? core.data.gold() : 0; if (have <= 0) return; const g = Math.min(have, Math.max(ef.min || 50, Math.floor(have * (ef.pct || 0.1))));
    core.emit(EVT.RESOURCE_CHANGE, { src: ctx.owner, tgts: tg, payload: { res: 'gold', old: have, change: -g, new: have - g, why: 'steal' }, tags: ['steal'] }, () => { core.data.stolen = (core.data.stolen || 0) + g; if (core.data.takeGold) core.data.takeGold(g); }); } },
  phase: { exec(core, ef, ctx) { const u = ctx.owner; core.emit(EVT.PHASE, { src: u, tgts: [u], payload: { phase: ef.phase, key: ef.key || null } }, () => { u.data.phase = ef.phase; if (ef.addSkills) for (const s of ef.addSkills) if (!u.skills.includes(s) && DEF.skills[s]) u.skills.push(s); if (ef.setSkills) u.skills = ef.setSkills.filter(s => DEF.skills[s]); }); } },
  break_chip: { exec(core, ef, ctx, tg) { for (const t of tg) { if (!('brk' in t.res) || !t.max.brk || core.hasStatus(t, 'broken') || t.res.brk <= 0) continue; core.changeRes(t, 'brk', -(ef.n || 1), { src: ctx.owner, why: ef.why || 'chip' });
    if (t.res.brk <= 0 && core.isUp(t)) core.emit(EVT.BREAK, { src: ctx.owner, tgts: [t], tags: ['break'] }, () => { core.applyStatus(ctx.owner, t, 'broken', {}); core.removeStatus(t, 'charging', 'break'); }); } } },
  skill: { check: ef => ef.skill ? null : 'skill effect needs skill',
    exec(core, ef, ctx, tg) { const sk = DEF.skills[ef.skill]; if (!sk || !core.isUp(ctx.owner)) return; const t = tg.filter(x => core.isUp(x)); if (!t.length && sk.target !== 'self') return; core.doSkill(ctx.owner, sk, sk.target === 'self' ? [ctx.owner] : sk.target === 'all_enemies' ? core.foesOf(ctx.owner) : t, { meta: { release: 1, follow: 1 } }); } },
  set_data: { exec(core, ef, ctx) { const u = ef.onUnit ? ctx.owner : null; (u ? u.data : core.data)[ef.key] = ef.value; } },
  revive: { exec(core, ef, ctx, tg) { for (const t of tg) if (t.down) core.emit(EVT.REVIVE, { src: ctx.owner, tgts: [t] }, () => { t.down = false; t.res.hp = Math.max(1, Math.floor(t.max.hp * (ef.pct || 0.3))); }); } },
};
