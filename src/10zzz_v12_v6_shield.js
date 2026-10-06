/* ===================== v12.33 法杖改成元素招・單手盾的小技能樹（玩家 2026-10-06：「法杖技能重製要偏元素方向」「單手盾新增小技能樹」） =====================
   法杖（招式在 r9x 的表裡，key 不變、舊存檔的等級照留）：火球・冰錐・元素屏障・落雷・炎浪・藤鞭・雷暴・元素增幅；特技「元素迸發」帶武器的屬性（沒屬性時是火）。
   單手盾：劍・斧・短刀＋盾的時候多一棵「單手盾」樹，跟主武器的樹一起用（像雙持）：
   · 特性「盾衛」：格擋時受到的傷害 −55%（原本 −40%）。精通「護盾精通」：格擋率 +2%／級。
   · 盾撞・堅守・格擋反擊（格擋成功時反擊；原本叫「盾反」，跟賦予同名，玩家選改成這個）。 */
// which tree: 劍・斧・短刀 in the main hand + a shield in the off hand (not 雙盾: that is two shields)
function shieldMode13(st = Game.st) { if (!st || !st.equip) return null; const w = gearBy(st.equip.weapon, st), o = gearBy(st.equip.shield, st); if (!w || !o) return null;
  const W = GEAR[w.b], O = GEAR[o.b]; return W && O && W.slot === 'weapon' && ['劍', '斧', '短刀'].includes(W.kind) && O.slot === 'shield' ? '單手盾' : null; }
// 元素迸發: the weapon's element, or fire
{ const _eo = BR.elementOf; BR.elementOf = function (core, u, sk) { const el = _eo(core, u, sk); return sk && sk.metadata && sk.metadata.wsp === 'burstEl' && (!el || el === '一般') ? '火' : el; }; }
// 格擋: the chance can grow (堅守: +30% the round after), 盾衛 takes 55% off instead of 40%
const blockPV13 = mul => v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1 },
  chance: ctx => Math.min(45, v) / 100 + (ctx.owner && ctx.core.hasStatus(ctx.owner, 'osBlock13') && !ctx.core.hasStatus(ctx.owner, 'osHold13') ? 0.3 : 0),
  effects: [{ type: 'modify', mul, note: 'block' }, { type: 'message', key: 'block', target: 'self' }] }] });
defPut('passives', 'block', { make: blockPV13(0.6), metadata: { n: '格擋' }, tags: [], override: 1 });
PV('blockS13', blockPV13(0.45), { n: '格擋（盾衛）' });
// 護盾精通: +2% block per level
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (st && shieldMode13(st)) { const n = trLv11('單手盾:mast', st); if (n && s.block) s.block += 2 * n; } return s; }; }
// 盾衛
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (st && shieldMode13(st) && trLv11('單手盾:trait', st)) for (const p of s.passives) if (p.key === 'block') p.key = 'blockS13'; return s; }; }
// labels
if (typeof CTR12 !== 'undefined') CTR12.why.osCtr13 = ['格擋反擊', 'block'];
if (typeof BUFF12 !== 'undefined') Object.assign(BUFF12, { elemUp13: { n: '元素增幅', k: 'atk', tip: '魔攻↑↑・弱點 +20%' }, osHold13: { n: '堅守', k: 'def', tip: '這回合受傷 −50%' },
  osBlock13: { n: '格擋↑', k: 'def', tip: '下一回合格擋率 +30%' }, osCtr13: { n: '格擋反擊', k: 'ctr', tip: '格擋成功就反擊' } });
if (typeof BATTLE_HELP !== 'undefined') { const b = BATTLE_HELP.find(q => q[0] === '武器技能'); if (b && Array.isArray(b[1]) && !b[1].some(t => /單手盾/.test(t))) b[1].push('劍・斧・短刀配盾的時候，多一棵「單手盾」技能樹（盾撞・堅守・格擋反擊），跟主武器的樹一起用。'); }
