/* ===================== v12.0.9a 第九輪（一）：裝備（玩家 2026-10-04 在〈第九輪提案〉第二步說「開始動工吧」＝B～E 照這樣做） =====================
   B 防具分三系（每件各自算）：重甲 受到的會心傷害 −12%、速度 −3%；輕裝 迴避 +2%、第一回合速度 +10%；法衣 回合結束回 1% MP、受到的魔法傷害 −4%。
   C 詞綴：數值 15 種（多會心傷害・異常命中・異常抗性・回復量）；紅以上多 1 條效果詞綴（16 種）。舊裝備不動，重鑄才照新規則。
   D 特效名字和數字統一（武器被動改名、魔力循環＝省力 15%、獵殺本能＝獵殺、吸血加在一起上限 20%），冒險手冊多「效果一覽」。
   E 鐵匠「轉移強化」：等級 −1 −（新階級−舊階級），費用 100×新階級×等級。 */

/* ---------- B. armour systems ---------- */
const ARM9 = { 法衣: ['旅人布帽', '螢菇帽', '荊棘花冠', '稜鏡之冠', '魔女帽', '霜之后冠', '星之冠', '蛛絲法袍', '符文披風', '裂界法衣', '宮廷長袍', '暗影長袍', '星空之衣', '羽翼之靴', '湖畔長靴', '裂界靴', '雪地長靴', '虛空長靴'],
  輕裝: ['獵人羽帽', '盜賊兜帽', '沙漠頭巾', '蘆葦斗笠', '灰狼兜帽', '黑羽頭巾', '裂界盔', '雪原兜帽', '學生制服', '旅人皮甲', '獵人皮甲', '蛙皮斗篷', '晨霧斗篷', '狼王披風', '根網斗篷', '夜翼斗篷', '流浪者斗篷', '黑羽斗篷', '巨熊斗篷', '雪人毛皮甲'],
  重甲: ['騎士團護脛', '鐵趾工靴', '鱷皮長靴', '古代戰靴', '熔岩靴'] };
const ARM9_RULE = { 重甲: '受到的會心傷害 −12%；速度 −3%', 輕裝: '迴避 +2%；第一回合速度 +10%', 法衣: '回合結束回復 1% MP；受到的魔法傷害 −4%' };
{ const byN = {}; for (const k in GEAR) if (['head', 'body', 'feet'].includes(GEAR[k].slot)) byN[GEAR[k].n] = k;
  for (const t in ARM9) for (const n of ARM9[t]) { if (byN[n]) GEAR[byN[n]].arm9 = t; else bvErr('r9', 'armour ' + n + ' missing'); }
  for (const k in GEAR) { const G = GEAR[k]; if (!['head', 'body', 'feet'].includes(G.slot)) continue; if (!G.arm9) G.arm9 = G.slot === 'feet' ? '輕裝' : '重甲'; G.kind = G.arm9; } }
const arm9Count = (st = Game.st) => { const o = { 重甲: 0, 輕裝: 0, 法衣: 0 }; for (const s of ['head', 'body', 'feet']) { const g = gearBy(st.equip && st.equip[s], st); if (g && GEAR[g.b].arm9) o[GEAR[g.b].arm9]++; } return o; };
PV('arm9H', v => ({ mods: [{ stage: 'defender', who: 'defender', critTaken: Math.max(0, 1 - 0.12 * v) }] }), { n: '重甲' });
PV('arm9L', v => ({ mods: [{ stage: 'attacker', who: 'attacker', speMul: 1 + 0.1 * v, cond: { round: 1 } }] }), { n: '輕裝' });
PV('arm9R', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 1 - 0.04 * v, cond: { cat: '特', hasPower: 1 } }] }), { n: '法衣' });

/* ---------- C. affixes: 15 numeric, 16 effect ---------- */
Object.assign(AFFIX_TABLE, {
  critDmg: { n: '會心傷害', key: 'critDmg', pct: 1, min: 4, max: 10, slots: ['weapon', 'acc'], w: 6 },
  stHit: { n: '異常命中', key: 'stHit', pct: 1, min: 4, max: 10, slots: ['weapon', 'acc'], w: 5 },
  stRes: { n: '異常抗性', key: 'stRes', pct: 1, min: 3, max: 8, slots: ['head', 'body', 'feet', 'shield', 'acc'], w: 5 },
  healUp9: { n: '回復量', key: 'healUp', pct: 1, min: 4, max: 10, slots: ['body', 'shield', 'acc'], w: 5 },
});
AFFIX_TABLE.vs.w = 0; AFFIX_TABLE.resist.w = 0; // already turned into 會心 / HP; no longer rolled
Object.assign(AFFIX_CAP, { critDmg: 25, stHit: 25, stRes: 20, healUp: 25 });
Object.assign(SP_NAMES, { critDmg: '會心傷害', stHit: '異常命中', stRes: '異常抗性', healUp: '回復量' });
Object.assign(AFFIX_HELP, { crit: '會心率：打出會心一擊的機率', critDmg: '會心傷害：會心一擊的倍率（基礎 150%）提高', stHit: '異常命中：讓魔物陷入異常狀態的機率提高', stRes: '異常抗性：被施加異常狀態時擋下的機率', healUp: '回復量：回復技能、再生、藥水的回復量提高' });
const FA_OFF = ['weapon', 'acc'], FA_DEF = ['head', 'body', 'feet', 'shield', 'acc'], FA_ANY = ['weapon', 'head', 'body', 'feet', 'shield', 'acc'];
const FA9 = { // effect affixes: name, battle key, 紅／金／虹 values, slots, text
  f_bigUp: ['屠巨', 'bigUp', [8, 10, 12], FA_OFF, v => '對菁英、頭目傷害 +' + v + '%'],
  f_weakUp: ['弱點特攻', 'weakUp', [10, 13, 16], FA_OFF, v => '打中弱點的傷害 +' + v + '%'],
  f_ail: ['趁勢', 'faAil', [8, 10, 12], FA_OFF, v => '對有異常狀態的魔物傷害 +' + v + '%'],
  f_first: ['先攻', 'faFirst', [15, 20, 25], FA_OFF, v => '第一回合造成的傷害 +' + v + '%'],
  f_atk: ['普攻精通', 'atkUp', [12, 16, 20], FA_OFF, v => '普攻傷害 +' + v + '%'],
  f_spc: ['特技精通', 'spcUp', [12, 16, 20], FA_OFF, v => '特技傷害 +' + v + '%'],
  f_rage: ['怒火', 'faRage', [10, 13, 16], FA_OFF, v => 'HP 50% 以下時傷害 +' + v + '%'],
  f_mpBack: ['魔力回流', 'faMpBack', [2, 3, 4], FA_OFF, v => '技能進入冷卻時回復 ' + v + ' MP'],
  f_guard: ['堅守', 'faGuard', [8, 10, 12], FA_DEF, v => '防禦時受到的傷害再 −' + v + '%'],
  f_full: ['全盛', 'faFull', [10, 13, 16], FA_DEF, v => 'HP 全滿時受到的傷害 −' + v + '%'],
  f_win: ['凱旋', 'faWin', [4, 6, 8], FA_DEF, v => '戰鬥勝利後回復 ' + v + '% HP'],
  f_revenge: ['逆襲', 'faRevenge', [20, 25, 30], FA_DEF, v => '被會心打中後，下一次攻擊傷害 +' + v + '%'],
  f_dot: ['耐毒', 'faDot', [25, 35, 45], FA_DEF, v => '受到的中毒、灼傷傷害 −' + v + '%'],
  f_open: ['開場護身', 'faOpen', [15, 20, 25], FA_DEF, v => '第一回合受到的傷害 −' + v + '%'],
  f_spirit: ['鬥志', 'faSpirit', [1, 1, 1], FA_ANY, () => '開場職業資源 +1', 4],
  f_long: ['延長', 'faLong', [1, 1, 1], FA_ANY, () => '施加給魔物的異常、能力下降多 1 回合', 4],
};
for (const id in FA9) { const [n, key, , slots] = FA9[id]; AFFIX_TABLE[id] = { n, key, eff: 1, slots, w: 0, min: 1, max: 1, cat: '效果' }; }
for (const k of ['critDmg', 'stHit', 'stRes', 'healUp9']) AFFIX_TABLE[k].cat = '戰鬥';
const isFA9 = id => !!FA9[id];
const faText9 = (id, v) => FA9[id][0] + '：' + FA9[id][4](v);
// rolling: the old counts stay (紫1 紅2 金2 虹3); from 紅 up one of them is an effect affix
let rollSlot9 = 'acc';
rollAffixes = function (n, slot = 'acc', tier = 1) {
  rollSlot9 = slot; const eff = n >= 2 ? 1 : 0, pool = Object.keys(AFFIX_TABLE).filter(k => !AFFIX_TABLE[k].eff && AFFIX_TABLE[k].w > 0 && AFFIX_TABLE[k].slots.includes(slot)), out = [], used = new Set(), sc = 1 + (tier - 1) * 0.35;
  for (let guard = 0; out.length < n - eff && guard < 50; guard++) {
    const tot = pool.reduce((a, k) => a + (used.has(k) ? 0 : AFFIX_TABLE[k].w), 0); if (tot <= 0) break; let r = Math.random() * tot, id = null;
    for (const k of pool) { if (used.has(k)) continue; r -= AFFIX_TABLE[k].w; if (r <= 0) { id = k; break; } }
    if (!id || used.has(id)) continue; used.add(id); const A = AFFIX_TABLE[id]; out.push([id, Math.max(1, Math.round(rnd(A.min, A.max) * sc))]); }
  if (eff) out.push([pick(Object.keys(FA9).filter(k => FA9[k][3].includes(slot))), 0]);
  return out; };
{ const _sa = scaleAffixes; scaleAffixes = function (list, q) {
    const base = _sa(list.filter(a => !isFA9(a[0])), q), fx = list.filter(a => isFA9(a[0])).map(([id]) => {
      if ((FA9[id][5] || 0) > q) id = pick(Object.keys(FA9).filter(k => !FA9[k][5] && FA9[k][3].includes(rollSlot9)));
      return [id, FA9[id][2][clamp(q - 3, 0, 2)]]; });
    return base.concat(fx); }; }
// 詞綴重鑄 T5+ used 裂界碎片 (kept for chapter 3): now 水晶碎片×2 ＋ the recipe's first material ×1
// (T5+ 詞綴重鑄的素材改在 04n reforgeCost：水晶碎片×2＋配方第 1 種素材×1)

/* ---------- heroStats: armour systems, the new numeric affixes, effect affixes, merged effects ---------- */
const NEW_SP9 = ['critDmg', 'stHit', 'stRes', 'healUp'];
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st) return s;
    const A = arm9Count(st); s.arm9 = A;
    if (A.重甲) { s.arm9H = A.重甲; s.spe = Math.floor(s.spe * (1 - 0.03 * A.重甲)); }
    if (A.輕裝) { s.arm9L = A.輕裝; s.eva = (s.eva || 0) + 2 * A.輕裝; }
    if (A.法衣) { s.arm9R = A.法衣; s.mpRegen = (s.mpRegen || 0) + A.法衣; }
    let wills = 0;
    for (const g of equippedGear(st)) { const p = gearStats(g).sp; for (const k of NEW_SP9) if (p[k]) s[k] = (s[k] || 0) + p[k];
      for (const a of g.a || []) if (isFA9(a[0])) { const key = FA9[a[0]][1]; s[key] = (s[key] || 0) + a[1]; }
      if ((GEAR[g.b].fx || []).includes('will')) wills++; }
    // D: one name, one number
    if (s.fx) { if (s.fx.predator) { delete s.fx.predator; s.fx.hunter = 1; } if (s.fx.freeCast) { delete s.fx.freeCast; s.fx.thrift = 1; }
      if (s.fx.leech) { delete s.fx.leech; s.drain = (s.drain || 0) + 5; } if (s.fx.will) { delete s.fx.will; s.stRes = (s.stRes || 0) + 20 * Math.max(1, wills); } }
    return s; }; }

/* ---------- battle keys ---------- */
const modSum9 = (u, k) => { let v = 0; for (const m of (u && u.mods) || []) if (m[k]) v += m[k]; return v; };
PV('stRes', v => ({ mods: [{ statusRes: v }] }), { n: '異常抗性' });
PV('stHit', v => ({ mods: [{ stHit: v }] }), { n: '異常命中' });
PV('faAil', v => ({ mods: [mul(v, { tgtAnyAilment: 1, hasPower: 1 }, 'equipment')] }), { n: '趁勢' });
PV('faFirst', v => ({ mods: [mul(v, { round: 1, hasPower: 1 }, 'equipment')] }), { n: '先攻' });
PV('faRage', v => ({ mods: [mul(v, { srcHpBelow: 0.5, hasPower: 1 }, 'equipment')] }), { n: '怒火' });
PV('faMpBack', v => ({ triggers: [{ on: EVT.COOLDOWN, phase: 'POST', role: 'src', cond: { evSetCd: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', amount: v, why: 'mpBack' }] }] }), { n: '魔力回流' });
PV('faGuard', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 1 - v / 100, cond: { guarding: 1, hasPower: 1 } }] }), { n: '堅守' });
PV('faFull', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 1 - v / 100, cond: { tgtHpFull: 1, hasPower: 1 } }] }), { n: '全盛' });
PV('faWin', () => ({}), { readBy: 'rules', n: '凱旋' });
PV('faRevenge', v => ({ mods: [{ faRevengeV: v }], triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { crit: 1, srcSide: 'enemy', ownerAlive: 1 }, effects: [{ type: 'status', target: 'self', status: 'fa_revenge9', quiet: 1 }] }] }), { n: '逆襲' });
BR.FORMULA.faRevenge = c => 1 + modSum9(c.src, 'faRevengeV') / 100;
defPut('statuses', 'fa_revenge9', { tags: ['buff'], duration: 'until_used', stack: 'none', metadata: { n: '逆襲' },
  mods: [{ stage: 'status', who: 'attacker', mul: { f: 'faRevenge' }, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, effects: [{ type: 'remove_status', target: 'self', status: 'fa_revenge9' }] }] });
PV('faDot', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { evKind: 'dot' }, effects: [{ type: 'modify', mul: 1 - Math.min(90, v) / 100, note: 'faDot' }] }] }), { n: '耐毒' });
PV('faOpen', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 1 - v / 100, cond: { round: 1, hasPower: 1 } }] }), { n: '開場護身' });
PV('faLong', () => ({ mods: [{ faLong: 1 }] }), { n: '延長' });
PV('faSpirit', (v, u) => { const c = u && u.cls, R = (res) => [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'resource', target: 'self', res, amount: 1, why: 'start' }] }];
  const T = { swordsman: R('ki'), guardian: R('stance'), bard: R('beat'), monk: R('chi'), dragoon: R('dragon'), spellblade: R('rune'),
    mage: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'sigil_add', el: (u && u.data && u.data.welem) || '火' }] }],
    otherworlder: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'insight_seed' }] }],
    machinist: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'status', target: 'self', status: 'turret', delta: 1 }] }],
    ranger: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { evHit: 1, hasPower: 1, tgtAlive: 1, tgtSide: 'enemy' }, limit: { perBattle: 1 }, effects: [{ type: 'status', target: 'event_target', status: 'hunt_mark' }] }] };
  return { triggers: T[c] || [] }; }, { n: '鬥志' });
// 延長: debuffs the hero puts on a foe last one round more
{ const ST = EFFECT_TYPES.status.exec, SG = EFFECT_TYPES.stage.exec, long = (ctx, t) => ctx.owner && ctx.owner.hero && t && t.side !== ctx.owner.side && (ctx.owner.mods || []).some(m => m.faLong);
  EFFECT_TYPES.status.exec = function (core, ef, ctx, tg) { const D = DEF.statuses[ef.status];
    if (ef.dur != null && D && (D.tags || []).includes('debuff') && tg.some(t => long(ctx, t))) { const a = tg.filter(t => long(ctx, t)), b = tg.filter(t => !long(ctx, t)); ST.call(this, core, { ...ef, dur: ef.dur + 1 }, ctx, a); if (b.length) ST.call(this, core, ef, ctx, b); return; }
    return ST.call(this, core, ef, ctx, tg); };
  EFFECT_TYPES.stage.exec = function (core, ef, ctx, tg) { const neg = Object.values(ef.stats || {}).some(v => v < 0);
    if (neg && tg.some(t => long(ctx, t))) { const a = tg.filter(t => long(ctx, t)), b = tg.filter(t => !long(ctx, t)); SG.call(this, core, { ...ef, dur: (ef.dur ?? 3) + 1 }, ctx, a); if (b.length) SG.call(this, core, ef, ctx, b); return; }
    return SG.call(this, core, ef, ctx, tg); }; }
// 異常命中: the hero's chance to put an ailment or debuff on a foe ×(1 + v%) — skill effects (exec) and passive triggers (compile)
{ const stHitOf = u => u && u.hero ? modSum9(u, 'stHit') : 0, isInflict = (core, ef) => ef && ef.type === 'status' && ef.target !== 'self' && DEF.statuses[ef.status] && (DEF.statuses[ef.status].tags || []).includes('debuff');
  BattleCore.prototype.exec = function (effects, ctx) {
    for (const x of effects || []) {
      const ef = this.eff(x); if (!ef) { bvErr('exec', 'effect ' + x + ' missing'); continue; }
      if (ef.cond && !condOk(ef.cond, { core: this, owner: ctx.owner, src: ctx.src, tgt: ctx.tgt, skill: ctx.skill, ev: ctx.trigEv || ctx.pre, n: ctx.n, spent: ctx.spent, status: ctx.status })) continue;
      if (ef.chance != null) { let p = typeof ef.chance === 'function' ? ef.chance(ctx) : ef.chance; const h = stHitOf(ctx.owner); if (h && isInflict(this, ef)) p = Math.min(1, p * (1 + h / 100)); if (!this.rng.chance(p)) continue; }
      const T = EFFECT_TYPES[ef.type]; if (!T) { bvErr('exec', 'effect type ' + ef.type + ' missing'); continue; }
      T.exec(this, ef, ctx, this.effTargets(ef, ctx));
      if (ef.then) this.exec(ef.then, ctx);
    } };
  const _cp = BattleCore.prototype.compile; BattleCore.prototype.compile = function (u) { const r = _cp.call(this, u); const h = stHitOf(u);
    if (h) for (const t of u.trigs || []) if (typeof t.chance === 'number' && (t.effects || []).some(e => isInflict(this, this.eff(e)))) t.chance = Math.min(1, t.chance * (1 + h / 100));
    return r; }; }
// 凱旋: HP after a won battle
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const st = Game.st, hs = heroStats(), p = hs.faWin || 0; if (p && st.hp > 0) { const h = Math.min(hs.hp - st.hp, Math.ceil(hs.hp * p / 100)); if (h > 0) { st.hp += h; yield* this.msg('（凱旋）回復了' + h + '點HP。', { hold: 14 }); } }
    return yield* _v.call(this); }; }

/* ---------- D. the merged effects ---------- */
{ const re = (k, make) => { if (DEF.passives[k]) DEF.passives[k].make = make; else PV(k, make); };
  re('drain', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, effects: [{ type: 'heal', target: 'self', ofEvent: Math.min(20, v) / 100, field: 'total', kind: 'drain', quiet: 1 }] }] }));
  re('fx.leech', () => ({})); re('fx.will', () => ({}));
  re('fx.predator', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.15, cond: { tgtHpBelow: 0.5, hasPower: 1 } }] }));
  re('fx.freeCast', () => FREECAST(0.15)); re('fx.thrift', () => FREECAST(0.15)); }
Object.assign(ACC_TRAIT.thrift, { 1: '技能 15% 機率不花 MP' }); Object.assign(ACC_TRAIT.leech, { 1: '吸血 +5%（和其他吸血加在一起，上限 20%）' });
Object.assign(ACC_TRAIT.will, { 1: '被施加異常狀態時 20% 擋下（兩件可以疊加）' }); Object.assign(ACC_TRAIT.breaker, { 1: '物理攻擊 35% 讓目標物防 −1' });
for (const t of ['thrift', 'leech', 'will', 'breaker']) SPECIALS[t].d = ACC_TRAIT[t][1];
Object.assign(SPECIALS.freeCast, { n: '省力', d: ACC_TRAIT.thrift[1] }); Object.assign(SPECIALS.predator, { n: '獵殺', d: ACC_TRAIT.hunter[1] });
if (typeof FX_TXT !== 'undefined') Object.assign(FX_TXT, { freeCast: ACC_TRAIT.thrift[1] });

/* ---------- gear info: the armour rule and the effect affixes ---------- */
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const L = _gi(g, wrapW), B = g && GEAR[g.b]; if (!B) return L;
    const add = (at, t, c, s, ind) => { const out = Font.wrap(t, wrapW - ind, s).map(l => [l, c, s, ind]); L.splice(at, 0, ...out); return at + out.length; };
    let at = L.findIndex(l => l[0] === '【特殊效果】' || l[0] === '【屬性武器】'); if (at < 0) { at = L.findIndex((l, i) => i > 0 && l[2] === 6); if (at < 0) at = L.length; }
    const fa = (g.a || []).filter(a => isFA9(a[0]));
    if (fa.length) { L.splice(at, 0, ['【效果詞綴】', UIC.accent, 10, 0]); at++; for (const [id, v] of fa) at = add(at, '・' + faText9(id, v), '#ffd6a0', 11, 4); }
    if (g.x && SPECIALS[g.x] && !(B.fx || []).includes(g.x)) { L.splice(at, 0, ['【虹色特效】', UIC.accent, 10, 0]); at++; at = add(at, '★' + SPECIALS[g.x].n, UIC.warm, 11, 4); at = add(at, SPECIALS[g.x].d || '', UIC.text, 10, 12); }
    if (B.arm9) { L.splice(at, 0, ['【' + B.arm9 + '】', UIC.accent, 10, 0]); at++; at = add(at, '每件：' + ARM9_RULE[B.arm9], UIC.text, 10, 4); }
    return L; }; }

/* ---------- D. 冒險手冊「效果一覽」 ---------- */
function effectLines9() {
  const L = [], H = t => L.push([t, UIC.accent, 10, 0]), P = (t, c = UIC.text, ind = 6) => { for (const l of Font.wrap(t, 156 - ind, 10)) L.push([l, c, 10, ind]); };
  H('【防具三系】（每件各自算）'); for (const t in ARM9_RULE) P(t + '：' + ARM9_RULE[t]);
  H('【數值詞綴】'); P(Object.keys(AFFIX_TABLE).filter(k => !AFFIX_TABLE[k].eff && AFFIX_TABLE[k].w > 0).map(k => AFFIX_TABLE[k].n).join('、'));
  H('【效果詞綴】（紅／金／虹）'); for (const id in FA9) { const [n, , V, , f, mq] = FA9[id]; P(n + '：' + f('○').replace('○', mq ? '' : V.join('／')) + (mq ? '（金、虹才有）' : '')); }
  const used = new Set(); for (const k in GEAR) for (const f of GEAR[k].fx || []) used.add(f); for (const f of RAINBOW_FX) used.add(f); used.delete('will'); used.delete('leech'); used.delete('freeCast'); used.delete('predator');
  H('【裝備特效】'); for (const f of [...used].filter(f => SPECIALS[f]).sort((a, b) => SPECIALS[a].n.localeCompare(SPECIALS[b].n, 'zh-Hant'))) P(SPECIALS[f].n + '：' + (SPECIALS[f].d || '').replace(/。$/, ''));
  P('異常抗性：被施加異常狀態時 20% 擋下（兩件可以疊加）'); P('吸血：吸血 +5%（和其他吸血加在一起，上限 20%）');
  H('【武器被動】（數字依武器）'); for (const k in WPASS) P(WPASS[k][0] + '：' + WPASS[k][1]('○'));
  return L;
}
function* listScreen9(title, L) { const per = 16; let top = 0;
  const scr = { touchBack: true, draw(x) { screenBG(x); headerBar(x, title); drawWin(x, 4, 22, 168, 230, 'menu'); const end = drawInfoLines(x, L, 10, 28, 236, top); scr.more = end < L.length;
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (scr.more) x.drawImage(DOWNARROW, 86, 237); Font.drawR(x, '↑↓ 捲動　A／B 關閉', 166, 240, UIC.muted, UIC.textSh, 9); } };
  UI.push(scr); Input.clearAll();
  while (true) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); }
    if (Input.pressed('a') || Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); }
handbookScreen12 = function* () {
  while (true) { const late = (Game.st.flags.ch2 || 0) >= 10, opts = ['任務', '圖鑑', '紀錄', '變強的方法', '效果一覽'].concat(late ? ['還能做什麼'] : []).concat(['返回']);
    const r = yield* ask('冒險手冊', opts);
    if (r === 0) yield* questScreen(); else if (r === 1) yield* dexScreen(); else if (r === 2) yield* recordScreen();
    else if (r === 3) { while (true) { const k = yield* ask('變強的方法', GROW12.map(q => q[0]).concat('返回')); if (k < 0 || k >= GROW12.length) break; yield* say(GROW12[k][1]); } }
    else if (r === 4) yield* listScreen9('效果一覽', effectLines9());
    else if (r === 5 && late) yield* todoScreen12(false); else break; } };
GROW12.push(['裝備的效果', '防具分重甲、輕裝、法衣，每件各有自己的規則。紅色以上的裝備有一條效果詞綴。全部的效果和數字，在冒險手冊的「效果一覽」。']);

/* ---------- E. 轉移強化 ---------- */
const xferTo9 = (from, to) => Math.max(0, (from.e || 0) - 1 - Math.max(0, GEAR[to.b].t - GEAR[from.b].t));
function* smithTransfer9(g) { const st = Game.st;
  if (!(g.e > 0)) { yield* say('這件沒有強化，沒有東西可以轉移喔。'); return; }
  const slot = GEAR[g.b].slot, to = yield* gearPicker('轉移到哪一件？', () => gearSort().filter(q => q !== g && GEAR[q.b].slot === slot), (x, q, Y) => { const n = xferTo9(g, q);
    Font.draw(x, '+' + g.e + ' → 這件 +' + n + (q.e ? '（現在 +' + q.e + '）' : ''), 12, Y, UIC.accent, UIC.textSh, 10); Font.draw(x, '費用 ' + 100 * GEAR[q.b].t * n + ' G　轉完原本那件變 +0', 12, Y + 13, UIC.text, UIC.textSh, 10); });
  if (!to) return; const n = xferTo9(g, to), c = 100 * GEAR[to.b].t * n;
  if (n <= 0) { yield* say('轉過去會變成 +0，不划算喔。'); return; }
  if ((to.e || 0) >= n) { yield* say('那件已經是 +' + to.e + ' 了，不用轉。'); return; }
  if (st.money < c) { yield* say('金錢不夠喔。（需要 ' + c + ' G）'); return; }
  if (!(yield* yesNo('把' + gearShort(g) + '的強化轉到' + gearShort(to) + '嗎？\n（變成 +' + n + '，' + c + ' G；原本那件變 +0）'))) return;
  st.money -= c; to.e = n; g.e = 0; clampHP(); Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle('item'); yield* say('轉移完成！' + gearName(to) + '！'); }
smithUpgrade12 = function* () { const st = Game.st, R = () => st.refine || {};
  while (true) {
    const fit = (x, t, Y, col) => { let z = 10; while (z > 8 && Font.width(t, z) > 152) z--; Font.draw(x, t, 12, Y + (10 - z) / 2, col, UIC.textSh, z); };
    const g = yield* gearPicker('強化', () => gearSort(), (x, g, Y) => { const c = enhanceCost(g), s = g.s || 0;
      fit(x, (g.e || 0) < 10 ? '強化 +' + (g.e || 0) + '→+' + ((g.e || 0) + 1) + '　' + c.gold + ' G・成功率' + Math.round(c.rate * 100) + '%' : '強化：已經 +10', Y, UIC.accent);
      fit(x, s < STAR_MAX ? '升星 ★' + s + '→★' + (s + 1) + '　精煉石 ' + (R()[g.b] || 0) + '/' + starStones(s) + '・' + starGold(g, s) + ' G' : '升星：已經 ★' + STAR_MAX, Y + 13, '#ffd860');
      fit(x, g.q >= 2 ? '重鑄：詞綴 ' + reforgeCost(g).gold + ' G／品質' : '重鑄：品質（藍色沒有詞綴）', Y + 26, '#c8b8ff'); });
    if (!g) return;
    while (true) { const c = enhanceCost(g), s = g.s || 0;
      const opts = ['強化 +' + (g.e || 0) + '→+' + ((g.e || 0) + 1) + '（' + c.gold + ' G）', '升星 ★' + s + '→★' + (s + 1) + '（精煉石 ' + (R()[g.b] || 0) + '/' + starStones(s) + '）', '重鑄（詞綴／品質）', '轉移強化' + (g.e ? '（+' + g.e + '）' : ''), '換一件'];
      const r = yield* ask(gearName(g), opts); if (r === 0) yield* smithEnhance12(g); else if (r === 1) yield* smithStar12(g); else if (r === 2) yield* smithOnGear12(g, reforgeFlow); else if (r === 3) yield* smithTransfer9(g); else break; } } };
