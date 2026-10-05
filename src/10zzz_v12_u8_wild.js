/* ===================== v12.29 野外再難一點（玩家 2026-10-06：「勝率拔高那不就等於打小怪也很輕鬆」→「可以試試」） =====================
   模擬（紫裝、跟上進度）：野外平均 2.5 回合、扣 10% HP，在目標「2〜3 回合、扣 10〜20%」的下緣；
   短刀・樂器・雙盾只扣 4〜5%（短刀出手快先打完、樂器有回復和減傷的歌、雙盾減傷層層疊）。
   → 野外魔物的攻擊（Lv4 起慢慢加，Lv9 起全加）×1.3；拿短刀・樂器・雙盾時，在野外受到的傷害再 ×1.5〜1.8（頭目・菁英戰不變）。
   模擬結果：12 種武器打野外都扣 10〜19%（原本 4〜16%），平均 14%（原本 10%），回合數不變、勝率 100%。 */
const WILD13 = { pow: 1.3, taken: { 短刀: 1.5, 樂器: 1.5, 雙盾: 1.8, 魔導書: 0.9 } }; // 魔導書本來就扣最多（16% → 加了之後 21%），稍微收回
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s || kind !== 'wild') return s;
    const f = clamp((lv - 4) / 5, 0, 1), m = 1 + (WILD13.pow - 1) * f; if (m !== 1) for (const k of ['atk', 'spa']) s.stats[k] = Math.max(1, Math.round(s.stats[k] * m)); return s; }; }
PV('wildTaken13', v => ({ mods: [{ stage: 'final', who: 'defender', mul: v, cond: { hasPower: 1 } }] }));
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st || !cfg || (cfg.kind && cfg.kind !== 'wild')) return s;
    const k = dualMode11(st) || mainKind11(st), v = WILD13.taken[k]; if (v) s.passives.push({ key: 'wildTaken13', v, src: 'tree' }); return s; }; }
