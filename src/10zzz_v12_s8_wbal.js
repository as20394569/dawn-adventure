/* ===================== v12.8 武器平衡（玩家 2026-10-05：「雙盾的普攻…可以 平衡一下 其他武器也稍微評估一下」） =====================
   模擬：12 種武器（含雙持）× 17 隻菁英・頭目 × 6 場，建議等級、同區紫裝，劍・斧・短刀配盾。
   調整前勝率：雙盾 100%（輸出最高、受傷最低）、魔導書 96、短刀・斧 93、拳套 89、劍・長槍 88、法杖 86、雙劍 79、火槍 72、樂器 69、雙刀 60。
   · 雙盾：攻擊力＝物防 ×（100%→60%，＋精通每級 3%）；副手那一下 60%→40%。（普攻 L25：44 → 27）
   · 雙刀：特性加「受到的傷害 −25%」、技能樹威力 ×1.25。　· 雙劍：特性加「受到的傷害 −15%」。
   · 火槍：特性加「受到的傷害 −10%」、技能樹威力 ×1.4。　· 樂器：技能樹威力 ×1.4（打得太慢）。　· 魔導書：技能樹威力 ×0.95。
   調整後：魔導書 96、短刀・斧・雙盾 93、拳套・樂器 89、劍・長槍 88、法杖・雙刀・雙劍 86、火槍 82。 */
const WBAL12 = { shieldDef: 0.6, shieldOff: 0.4, taken: { 雙刀: 0.75, 雙劍: 0.85, 火槍: 0.9 }, pow: { 火槍: 1.4, 樂器: 1.4, 雙刀: 1.25, 魔導書: 0.95 } };
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st) return s;
    if (s.data.shield11) s.data.shield11 = WBAL12.shieldDef + 0.03 * trLv11('雙盾:mast', st);
    if (dualMode11(st) === '雙盾') s.data.offMul11 = WBAL12.shieldOff; return s; }; }
{ const D = DEF.passives.tr11, _mk = D.make; D.make = function (v, u) { const r = _mk.call(this, v, u), T = new Set((v && v.traits) || []);
    for (const k in WBAL12.taken) if (T.has(k)) r.mods.push({ stage: 'final', who: 'defender', mul: WBAL12.taken[k], cond: { hasPower: 1 } }); return r; }; }
for (const kind in WBAL12.pow) for (const r of TREE11[kind].sk) { const id = 't_' + r[1], D = DEF.skills[id]; if (!D || !D.power || D.powerOf) continue;
  D.power = Math.round(D.power * WBAL12.pow[kind]); r[3] = D.power; if (MOVES[id]) MOVES[id].pow = D.power; }
TREE11['雙刀'].trait = '多段攻擊每段威力 +10%，速度 +3，受到的傷害 −25%';
TREE11['雙劍'].trait = '會心時副手追加一斬（威力 30），受到的傷害 −15%';
TREE11['火槍'].trait = '第一回合必定先手，受到的傷害 −10%';
TREE11['雙盾'].mastD = '用盾攻擊時，攻擊力＝物防的 60%，每級 +3%';
if (typeof GROW12 !== 'undefined') GROW12.push(['雙盾的攻擊', '雙手都拿盾時，普攻「盾擊」打兩下（副手那下 40%），所有攻擊的攻擊力改用物防的 60% 計算（雙盾精通每級 +3%）。物防越高打越痛，但比拿武器慢一點。']);
