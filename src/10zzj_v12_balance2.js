/* ===================== v12.0.2 第二輪數值平衡（玩家在〈第二輪數值平衡提案〉全部勾選，2026-10-03） =====================
   tools/r2sim.js（低／好兩種裝備）：熔岩巨人 5%、大魔導士對頭目 6%／44%、武僧 6%／65%、聖騎士 87%／95%。
     熔岩巨人   熔岩甲 40%→15%（10zzg）、大噴發 165→140、HP −25%
     魔導士     魔法傷害 +30%；魔力之泉 回合結束回復 MP 3%→8%
     武僧       連環寸勁每段威力 30→35
     守護者     守護之盾「防禦時再減傷」30%→20%
     古岩魔像・腐沼九頭蛇・收穫魔像・時計巨像（頭目）HP +10% */
const BOSS_HP12 = { lavaGiant: 0.75, golem: 1.1, hydra: 1.1, harvestGolem: 1.1, clockColossus: 1.1 };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o);
    if (s && kind === 'boss' && BOSS_HP12[sp]) { s.stats.hp = Math.max(1, Math.round(s.stats.hp * BOSS_HP12[sp])); s.hp = s.stats.hp; } return s; }; }
MOVES.m_eruption.pow = 140; DEF.skills.m_eruption.power = 140; if (DEF.skills.m_eruption.ai) DEF.skills.m_eruption.ai.pow = 140;
// 魔導士: magic damage +30%, 魔力之泉 8%
defPut('mechanics', 'mage_power12', { layer: 'class', mods: [{ stage: 'attacker', who: 'attacker', mul: 1.3, cond: { cat: '特', hasPower: 1 } }] });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (clsV7(st.cls) === 'mage') s.data.mechanics.push('mage_power12'); return s; }; }
{ const _m = BR.FORMULA.mpSpring; BR.FORMULA.mpSpring = (c, v) => _m(c, v) + 0.05; }
CLS12.mage.passive[1] = '魔法傷害 +30%，回合結束回復 8% MP'; DEF.classes.mage.passive.d = CLS12.mage.passive[1];
// 武僧: 連環寸勁 30 → 35 per hit
SIG12.monk.power = 35; SIG12.monk.d = SIG12.monk.d.replace('各 30', '各 35'); DEF.skills.sig_monk.power = 35; DEF.skills.sig_monk.desc = (DEF.skills.sig_monk.desc || '').replace('各 30', '各 35');
// 守護者: 守護之盾 30% → 20%
{ const M = DEF.mechanics.cls_guardian, mk = M.make; M.make = u => { const r = mk(u); for (const m of r.mods || []) if (m.mul === 0.7 && m.cond && m.cond.guarding) m.mul = 0.8; return r; }; }
CLS12.guardian.passive[1] = CLS12.guardian.passive[1].replace('再減傷 30%', '再減傷 20%'); DEF.classes.guardian.passive.d = CLS12.guardian.passive[1];
if (typeof BATTLE_HELP !== 'undefined') for (const P of BATTLE_HELP) P[1] = P[1].map(t => t.replace('「守護之盾」再減30%', '「守護之盾」再減20%'));

/* ---------- 第二輪（續）（玩家：「那就調整數值」，2026-10-03） ----------
   tools/r2sim.js now plays the mage the way a player does (three sigils, then 元素奔流); with that the mage is mid-pack
   (71%／44%), so the mage keeps +30%. Still behind with weak gear: 劍聖 18%、武僧 8%、魔劍士 13% → damage +20%／+30%／+30%
   (simulated 83%／32%, 81%／31%, 79%／31%). 腐沼九頭蛇 was still easy (83%): HP +10% → +30% and 毒霧吐息 poisons 30% → 60%
   (its 腐沼洪流 doubles on a poisoned target), simulated 95%／48%. */
const PW12 = { swordsman: 1.2, monk: 1.3, spellblade: 1.3 };
for (const c in PW12) { defPut('mechanics', 'pw12_' + c, { layer: 'class', mods: [{ stage: 'attacker', who: 'attacker', mul: PW12[c], cond: { hasPower: 1, tgtSide: 'enemy' } }] });
  CLS12[c].passive[1] += '；造成的傷害 +' + Math.round((PW12[c] - 1) * 100) + '%'; DEF.classes[c].passive.d = CLS12[c].passive[1]; }
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg), c = clsV7(st.cls); if (PW12[c]) s.data.mechanics.push('pw12_' + c); return s; }; }
BOSS_HP12.hydra = 1.3;
{ const E = DEF.skills.m_venomSpray.effects.map(x => DEF.effects[x]).find(x => x && x.type === 'status' && x.status === 'psn'); if (E) E.chance = 0.6; MOVES.m_venomSpray.eff = { ...MOVES.m_venomSpray.eff, p: 60 };
  if (MOVES.m_venomSpray.d && !/中毒/.test(MOVES.m_venomSpray.d)) MOVES.m_venomSpray.d += '常常讓對手中毒。'; } // only the hydra uses it
