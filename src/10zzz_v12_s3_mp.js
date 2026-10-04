/* ===================== v12.3 普攻＝MP 引擎（玩家 2026-10-04：「直接開技能打死怪物比較快，普通攻擊幾乎無用」→ 選「MP 引擎（托蘭式）」、戰鬥之間 MP 照舊） =====================
   實測（Lv22、劍、一般魔物）：技能約普攻 2 倍傷害卻只要 3〜6 MP、很多招冷卻 0；36 MP 撐 6 場，每場只普攻 1〜2 次。
   ・技能樹的 MP 費用 ×2.5（絕技・晨曦之刃・雙相斬 ×2），招式回的 MP ×2（三連拳這類「回 MP」的招不會變成白用）。
   ・傷害技能的冷卻至少 1（同一招不能連發）。
   ・普攻命中回最大 MP 的 15%（原本 12%）：兩次普攻大約換一招技能，打法變成「普攻→普攻→技能」。 */
const MP13 = { cost: 2.5, top: 2, ret: 2, atk: 0.15, minCd: 1 }; // ret: what a skill gives back (×2, so 三連拳 still costs a little)
{ const big = r => r[0][0] === '4' || /^cm(Dawn|Twin)$/.test(r[1]);
  const scaleEff = (x, k) => { const E = typeof x === 'string' ? DEF.effects[x] : x; if (E && E.type === 'resource' && E.res === 'mp' && E.target === 'self' && E.amount > 0 && !E.mp13) { E.amount = Math.round(E.amount * k); E.mp13 = 1; } };
  for (const kind of Object.keys(TREE11)) for (const r of TREE11[kind].sk || []) { const D = DEF.skills['t_' + r[1]]; if (!D) continue; const k = big(r) ? MP13.top : MP13.cost;
    for (const c of D.costs || []) if (c.res === 'mp' && c.amount) c.amount = Math.round(c.amount * k);
    if (typeof r[6] === 'number') r[6] = Math.round(r[6] * k);
    if (D.power && !(D.cooldown > 0)) { D.cooldown = MP13.minCd; r[5] = MP13.minCd; }
    for (const x of (D.effects || []).concat(D.after || [])) scaleEff(x, MP13.ret);
    if (typeof r[8] === 'string') r[8] = r[8].replace(/回 (\d+) MP/g, (m, n) => '回 ' + Math.round(n * MP13.ret) + ' MP'); } }
// the description shown in battle / the tree is MOVES[id].d; SKILL_MP is what the cost labels read
for (const id in DEF.skills) { if (!id.startsWith('t_') || !MOVES[id]) continue; const M = MOVES[id], rp = t => t.replace(/回 (\d+) MP/g, (m, n) => '回 ' + Math.round(n * MP13.ret) + ' MP'); if (typeof M.d === 'string') M.d = rp(M.d); if (typeof DEF.skills[id].desc === 'string') DEF.skills[id].desc = rp(DEF.skills[id].desc);
  const c = (DEF.skills[id].costs || []).find(q => q.res === 'mp'); if (typeof SKILL_MP !== 'undefined' && c) SKILL_MP[id] = c.amount; }
{ const M = DEF.mechanics.heroCore, _mk = M.make; M.make = function (u, ...a) { const r = _mk.call(this, u, ...a);
    for (const t of r.triggers || []) for (const e of t.effects || []) if (e.type === 'resource' && e.res === 'mp' && e.why === 'basic' && typeof e.amount === 'number') e.amount += Math.max(0, Math.round((u.max.mp || 0) * MP13.atk) - Math.max(3, Math.round((u.max.mp || 0) * 0.12)));
    return r; }; }
// help texts
{ const fx = t => typeof t === 'string' ? t.replace(/回復最大MP的12%/g, '回復最大MP的15%').replace(/回最大 MP 的 12%/g, '回最大 MP 的 15%') : t;
  if (typeof BATTLE_HELP !== 'undefined') for (const b of BATTLE_HELP) if (Array.isArray(b[1])) b[1] = b[1].map(fx);
  for (const b of GROW12) b[1] = fx(b[1]); }
GROW12.push(['普攻與 MP', '普攻不花 MP，打中回最大 MP 的 15%；技能的 MP 比較貴，傷害技能不能連續用同一招。大約「普攻→普攻→技能」一輪。戰鬥之間 MP 不會自己回，省著用。']);
