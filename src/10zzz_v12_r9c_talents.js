/* ===================== v12.0.9c 第九輪（三）：天賦上限 16、14 個核心天賦直接改變職業招式（〈第九輪提案〉第二步 F，玩家 2026-10-04「開始動工吧」） =====================
   - 上限 20 → 16（09m TP_CAP）：兩個流派點滿＋核心天賦剛好 16。舊存檔投入超過 16 點的職業，天賦免費退回一次。
   - 元素王・雷帝・城塞・復仇者・疾風獵手・鷹之印・全火力・機關城・堡壘・羅漢・龍王・光之勇者・越界者・魔導王：名字不變，效果改成直接改變職業招式。 */
const CORE9 = {}; // id → [desc, make]
const coreTalent9 = (id, desc, x) => { const T = DEF.talents[id]; if (!T) { bvErr('r9', 'talent ' + id + ' missing'); return; }
  T.desc = desc; T.rules = x.rules || null; T.make = () => ({ rules: x.rules || {}, mods: x.mods || [], triggers: x.trig || [], immune: [] }); CORE9[id] = 1; };
Object.assign(COND, { insightFull9: (c, v) => !!c.src && !!c.tgt && (BV12.insightOf(c.core, c.src, c.tgt) >= BV12.insightMax(c.core, c.src)) === !!v,
  castHit9: (c, v) => ((c.total || (c.ctx && c.ctx.total) || 0) > 0) === !!v });
Object.assign(BR.FORMULA, { halfSpent9: c => Math.floor((c.spent || 0) / 2), fortPow9: c => Math.max(1, ((c.owner || c.src).data.fort9 || 0)) });

/* ---------- 魔導士：元素王（全體、留 1 個咒印）・雷帝（每段雷、30% 麻痺、對麻痺 +30%） ---------- */
coreTalent9('mage.k0', '元素奔流打全體（每隻 ×0.75），施放後保留 1 個咒印', { rules: { elemKing2: 1 } });
coreTalent9('mage.k1', '元素奔流每段都是雷屬性，每段 30% 麻痺；對麻痺的魔物每段 +30%', { rules: { thunderEmp: 1 } });
EFFECT_TYPES.sigil_storm.exec = function (core, ef, ctx) { const u = ctx.owner, sk = ctx.skill, emp = core.rule(u, 'thunderEmp'), king = core.rule(u, 'elemKing2');
  const els0 = (core.act && core.act.sigilEls) || (ctx.cmd && ctx.cmd.sigilEls) || [], els = emp ? els0.map(() => '雷') : els0; if (king && els0.length && core.act) core.act._keepEl9 = els0[els0.length - 1];
  els.forEach((el, i) => { const all = king || (el === '雷' && core.rule(u, 'thunderAoe')), tg = all ? core.foesOf(u) : (ctx.targets || []).filter(t => core.isUp(t)).slice(0, 1);
    if (!tg.length && !all) { const f = core.foesOf(u)[0]; if (f) tg.push(f); }
    for (const t of tg) { if (!core.isUp(t) || !core.isUp(u)) continue; core.hit = ++core.hitSeq;
      if (!core.rng.chance(BR.hitChance(core, u, t, sk))) { core.emit(EVT.MISS, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: i } }); continue; }
      core.emit(EVT.HIT, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: i, hits: els.length, el } });
      const mulP = emp && core.hasStatus(t, 'par') ? 1.3 : 1;
      EFFECT_TYPES.damage.exec(core, { type: 'damage', power: ef.power || 50, el, cat: '特', mul: mulP }, { ...ctx, tgt: t, n: i, scale: tg.length > 1 ? BR.AOE_MUL : 1 }, [t]);
      if (emp && core.isUp(t) && core.rng.chance(Math.min(1, 0.3 * (1 + modSum9(u, 'stHit') / 100)))) core.applyStatus(u, t, 'par', { secondary: true }); } }); };
EFFECT_TYPES.sigil_keep9 = { exec(core, ef, ctx) { const u = ctx.owner, el = core.act && core.act._keepEl9; if (!el || !('sigil' in u.res)) return; u.data.sigils = [el]; core.changeRes(u, 'sigil', 1 - (u.res.sigil || 0), { why: 'sigil:' + el }); } };
const effId9 = (sk, i, ef) => effRegister('skill:' + sk + '#r9' + i, ef);
DEF.skills.sig_mage.after = [...(DEF.skills.sig_mage.after || []), effId9('sig_mage', 'a0', { type: 'sigil_keep9', cond: { ruleOn: 'elemKing2' } })];

/* ---------- 守護者：城塞（架盾反擊）・復仇者（只耗一半守勢，之後 2 回合被打就反擊） ---------- */
coreTalent9('guardian.k1', '聖盾衝擊改成架盾：不馬上攻擊，到下次行動前第一次被攻擊時反擊（威力＝守勢×25），並展開護盾', { rules: { fortress9: 1 } });
coreTalent9('guardian.k2', '聖盾衝擊只消耗一半守勢；之後 2 回合每次被攻擊都反擊（威力 70%）', { rules: { avenger9: 1 } });
defPut('skills', 'fortress_strike9', { ...skillFromMove('fortress_strike9', { ...MOVES.slash, n: '城塞反擊', pow: 25, acc: null }, { kind: 'attack', extraTags: ['reaction', 'counter'] }) });
Object.assign(DEF.skills.fortress_strike9, { mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'guardAtk' } }], cooldown: 0 });
{ const D = DEF.skills.fortress_strike9; D.effects = (D.effects || []).map((ef, i) => effRegister('skill:fortress_strike9#e' + i, ef)); D.after = (D.after || []).map((ef, i) => effRegister('skill:fortress_strike9#a' + i, ef)); }
defPut('statuses', 'fortress9', { tags: ['buff', 'guard'], duration: 'until_own_action', clearAt: 'owner_action_start', stack: 'refresh', metadata: { n: '架盾' },
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 },
    effects: [{ type: 'counter', skill: 'fortress_strike9', mul: { f: 'fortPow9' }, why: 'fortress' }, { type: 'remove_status', target: 'self', status: 'fortress9' }] }] });
defPut('statuses', 'avenge9', { tags: ['buff'], duration: 'owner_actions', durDefault: 2, tick: 'owner_action_start', stack: 'refresh', metadata: { n: '復仇' },
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', skill: 'counter_strike', why: 'avenge' }] }] });
EFFECT_TYPES.fort_set9 = { exec(core, ef, ctx) { const u = ctx.owner; u.data.fort9 = Math.max(1, ctx.spent || 0); core.applyStatus(u, u, 'fortress9', {}); } };
Object.assign(COND, { noRule9: (c, v) => !c.owner || !v.some(r => c.core.rule(c.owner, r)) });
{ const G = DEF.skills.sig_guardian; for (const id of G.effects) { const E = typeof id === 'string' ? DEF.effects[id] : id; if (E && E.type === 'damage') E.cond = { noRule9: ['sanctuary', 'fortress9'] }; }
  G.effects = [...G.effects, effId9('sig_guardian', 'e0', { type: 'fort_set9', cond: { ruleOn: 'fortress9' } })];
  G.after = [...G.after, effId9('sig_guardian', 'a0', { type: 'gain', target: 'self', res: 'stance', n: { f: 'halfSpent9' }, why: 'avenger', cond: { ruleOn: 'avenger9' } }), effId9('sig_guardian', 'a1', { type: 'status', target: 'self', status: 'avenge9', dur: 2, cond: { ruleOn: 'avenger9' } })]; }

/* ---------- 遊俠：疾風獵手（搶先、冷卻 1）・鷹之印（上限 5、引爆打全體） ---------- */
coreTalent9('ranger.k1', '影牙連射變成搶先，冷卻 2 → 1', { mods: [{ prioSkill: 'sig_ranger' }, { cdAdd: -1, cond: { skillIs: 'sig_ranger' } }] });
coreTalent9('ranger.k2', '獵印上限 3 → 5 層；引爆的追加一擊改成打全體', { rules: { markMax: 2, hawkAll9: 1 } });
{ const HD = EFFECT_TYPES.hunt_detonate.exec; EFFECT_TYPES.hunt_detonate.exec = function (core, ef, ctx) { const u = ctx.owner; if (!core.rule(u, 'hawkAll9')) return HD.call(this, core, ef, ctx);
    const cmd = ctx.cmd || {}, t = (ctx.targets || [])[0]; if (!t || !core.isUp(t) || (cmd.markWas || 0) < BV12.markMax(core, u)) return;
    const n = BV12.markOf(core, u, t); if (!n) return; core.removeStatus(t, 'hunt_mark', 'detonate', u); core.emit(EVT.MESSAGE, { src: u, tgts: [t], payload: { key: 'detonate', n } });
    const p = BR.FORMULA.detonate({ core, owner: u, marks: n }), all = core.foesOf(u).filter(f => core.isUp(f));
    for (const f of all) EFFECT_TYPES.damage.exec(core, { type: 'damage', power: p, kind: 'detonate' }, { ...ctx, tgt: f, n: 9, scale: all.length > 1 ? BR.AOE_MUL : 1 }, [f]);
    if (core.rule(u, 'shadowReset')) core.cutCooldown(u, 'sig_ranger', 99, 'shadowReset'); }; }

/* ---------- 機工士：全火力（3 段×40、彈藥 6）・機關城（改放武器特技 ×1.5）・堡壘（護盾 3 回合、彈藥 5） ---------- */
coreTalent9('machinist.k0', '機關砲擊改成 3 段（每段 40），砲台彈藥上限 6', { rules: { turretMax: 3, fullFire9: 1 } });
coreTalent9('machinist.k1', '機關砲擊改成發動武器特技（威力 ×1.5），之後照樣設置砲台', { rules: { gearCity9: 1 } });
coreTalent9('machinist.k2', '機關砲擊不造成傷害，改成展開 3 回合護盾，砲台彈藥 5 發', { rules: { bastion9: 1, turretMax: 2 } });
{ const _c = BR.FORMULA.cannon; BR.FORMULA.cannon = c => c.core.rule(c.src, 'fullFire9') ? 40 + (c.core.rule(c.src, 'heavyGun') ? Math.round(20 * ((c.core.statusOf(c.src, 'turret') || {}).stacks || 0) / 3) : 0) : _c(c);
  const M = DEF.skills.sig_machinist; M.hitsOf = (core, u) => core.rule(u, 'fullFire9') ? 3 : 1;
  M.effects = [effId9('sig_machinist', 'e0', { type: 'damage', cond: { noRule9: ['gearCity9', 'bastion9'] } }), effId9('sig_machinist', 'e1', { type: 'sig_special9', cond: { ruleOn: 'gearCity9' } }), effId9('sig_machinist', 'e2', { type: 'status', target: 'self', status: 'barrier', dur: 3, cond: { ruleOn: 'bastion9' } })]; }
EFFECT_TYPES.sig_special9 = { exec(core, ef, ctx) { const u = ctx.owner, id = u.data.wspSkill, sk = id && DEF.skills[id]; if (!sk || !core.isUp(u) || (ctx.n || 0) > 0) return;
  const t = (ctx.targets || []).find(x => core.isUp(x)) || core.foesOf(u)[0]; if (!t && sk.target !== 'self') return;
  core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: 'special', name: u.data.wspName } }); core.doSkill(u, sk, sk.target === 'self' ? [u] : [t], { meta: { release: 1, follow: 1, powMul: 1.5 } }); } };

/* ---------- 武僧：羅漢（基本段數 +2、每段都算普攻） ---------- */
coreTalent9('monk.k0', '連環寸勁基本段數 +2，每段都算普攻（吃普攻的加成、累積特技）', { rules: { arhat9: 1 },
  trig: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { skillIs: 'sig_monk', hpLost: 1 }, effects: [{ type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'arhat' }] }] });
{ const M = DEF.skills.sig_monk, _h = M.hitsOf; M.hitsOf = (core, u, cmd) => _h(core, u, cmd) + (core.rule(u, 'arhat9') ? 2 : 0); }
{ const _cp = BattleCore.prototype.compile; BattleCore.prototype.compile = function (u) { const r = _cp.call(this, u);
    if (u.data && u.data.rules && u.data.rules.arhat9) { const add = []; for (const m of u.mods) if (m.cond && m.cond.tag === 'basic') { const c = { ...m.cond }; delete c.tag; add.push({ ...m, cond: { ...c, skillIs: 'sig_monk' } }); } u.mods.push(...add); }
    return r; }; }

/* ---------- 龍騎士：龍王（落地吸血 30%、龍血 +2） ---------- */
coreTalent9('dragoon.k1', '龍騰擊落地時回復造成傷害的 30% HP，命中龍血 +2', { rules: { dragonKing9: 1 } });
EFFECT_TYPES.dragon_king9 = { exec(core, ef, ctx) { const u = ctx.owner, tot = ctx.total || 0; if (!tot || !core.isUp(u)) return;
  core.heal(u, u, Math.max(1, Math.floor(tot * 0.3)), { kind: 'drain' }); if ('dragon' in u.res) core.changeRes(u, 'dragon', 1, { why: 'dragonKing' }); } };
DEF.skills.sig_dragoon.after = [...(DEF.skills.sig_dragoon.after || []), effId9('sig_dragoon', 'a0', { type: 'dragon_king9', cond: { ruleOn: 'dragonKing9' } })];

/* ---------- 異界勇者：光之勇者（一定算打中弱點、吸取 35%）・越界者（上限 5、滿層 ×1.5） ---------- */
coreTalent9('otherworlder.k0', '曙光之刃一定算打中弱點（看破 +1），吸取 20% → 35%', { rules: { lightHero9: 1 } });
coreTalent9('otherworlder.k1', '看破上限 3 → 5 層；曙光之刃對看破滿層的種族威力 ×1.5', { rules: { insightMax: 2, max_insight: 2, beyond9: 1 } });
{ const _d = BR.FORMULA.dawnDrain; BR.FORMULA.dawnDrain = c => { const v = _d(c); return c.core.rule(c.owner || c.src, 'lightHero9') ? Math.max(v, 0.35) : v; }; }
EFFECT_TYPES.light_hero9 = { exec(core, ef, ctx) { const u = ctx.owner; for (const t of (ctx.targets || []).filter(x => core.isUp(x))) EFFECT_TYPES.insight_add.exec(core, { type: 'insight_add' }, { ...ctx, tgt: t, trigEv: null }); } };
{ const O = DEF.skills.sig_otherworlder; O.after = [...(O.after || []), effId9('sig_otherworlder', 'a0', { type: 'light_hero9', cond: { ruleOn: 'lightHero9' } })];
  O.mods = [...(O.mods || []), { stage: 'skill', who: 'attacker', mul: 1.5, cond: { ruleOn: 'beyond9', insightFull9: 1 } }]; }

/* ---------- 魔劍士：魔導王（不耗魔紋、每層 +12%、魔劍解放一律算魔法） ---------- */
coreTalent9('spellblade.k0', '魔劍解放和魔法技能都不消耗魔紋，每層 +12%；魔劍解放一律算魔法', { rules: { runeKing: 1 }, mods: [{ costAllFree: 'rune', cond: { skillIs: 'sig_spellblade' } }] });
{ const S = DEF.skills.sig_spellblade, _c = S.catOf; S.catOf = (core, u, cmd) => core.rule(u, 'runeKing') ? '特' : _c(core, u, cmd); }

/* ---------- 天賦上限 16：舊存檔投入超過 16 點的職業，免費退回一次 ---------- */
const talSpent9 = P => { let s = 0; for (const k in P || {}) { if (k === 'k') { s += TAL12.KEY_COST; continue; } const t = +k.split('.')[1]; s += TAL12.COST[t] || 0; } return s; };
{ const _so = startOverworld; startOverworld = function (...a) { const r = _so.apply(this, a); const st = Game.st;
    if (st && !st.v9tal && st.tal12) { st.v9tal = 1; const L = []; for (const c in st.tal12) if (talSpent9(st.tal12[c]) > TP_CAP) { st.tal12[c] = {}; L.push((CLASSES[c] || {}).n || c); }
      if (L.length && Game.ow) Game.ow.run((function* () { yield* say('【第九輪更新】天賦點上限從 20 點改成 ' + TP_CAP + ' 點。\n' + L.join('、') + '的天賦已經免費退回，請到選單「天賦」重新選。'); yield* say('另外 14 個核心天賦改成直接改變職業招式。說明在「天賦」畫面。'); })()); }
    return r; }; }
