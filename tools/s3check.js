// stage 3 mechanics: 慣性 and 破防時打部位 (preview damage + real battle runs)
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 's21.save.json'), 'utf8');
  g.log(await g.ev(s => {
    const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; startOverworld(); st.lv = 40;
    const out = [], ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (info != null ? '  — ' + info : ''));
    const T = tr11(st); T.lv = {}; for (const kind of TREE_KINDS11) for (const r of TREE11[kind].sk) T.lv['t_' + r[1]] = 1;
    const mk = (b, q = 3) => { GEAR11_GLAM = false; const x = makeGear(b, q); GEAR11_GLAM = true; return x; };
    const equip = kind => { st.equip.weapon = mk(BASE11.weapon[kind][4]).u; st.equip.shield = null; };
    const build = (kind, sp = 'duneWorm', foeKind = 'boss', rounds = 1, seed = 5) => { equip(kind); const S = heroStats(st); st.hp = S.hp; st.mp = S.mp;
      const c = BB.build({ sp, lv: 20, kind: foeKind, id: sp, seed, maxRounds: rounds }, JSON.parse(JSON.stringify(st))); return { c, H: c.byId.H, F: c.units.find(u => u.side === 'B') }; };
    const withTrait = (kind, f) => { T.lv[kind + ':trait'] = 1; try { return f(); } finally { delete T.lv[kind + ':trait']; } };
    const V0 = BR.VARIANCE; BR.VARIANCE = [100, 100];
    const pv = (c, H, F, id) => BR.damage(c, H, F, DEF.skills[id], { preview: true }).amount;
    /* ===== 慣性 ===== */
    { const { c, H, F } = build('劍', 'rockRhino', 'elite'); H.lv = 500; H.stats.atk = H.stats.spa = 3000; F.stats.def = F.stats.spd = 600; const atk = H.data.attackSkill || 'attack';
      const b0 = pv(c, H, F, atk), p0 = pv(c, H, F, 't_sdBreak');
      for (let i = 0; i < 3; i++) inShift11(H, F, DEF.skills[atk]);
      const b1 = pv(c, H, F, atk), p1 = pv(c, H, F, 't_sdBreak');
      ok('慣性：普攻 3 次 → 普攻 ×0.7、物理技能 ×1.3', Math.abs(b1 / b0 - 0.7) < 0.02 && Math.abs(p1 / p0 - 1.3) < 0.02, JSON.stringify(F.data.in11) + ' 普攻 ×' + (b1 / b0).toFixed(3) + ' 物理 ×' + (p1 / p0).toFixed(3));
      for (let i = 0; i < 20; i++) inShift11(H, F, DEF.skills[atk]); ok('慣性：範圍 50%〜200%', F.data.in11.b === 50 && F.data.in11.p === 200, JSON.stringify(F.data.in11)); }
    if (typeof kindOn13 !== 'function' || kindOn13('魔導書')) { const half = withTrait('魔導書', () => { const { c, H, F } = build('魔導書', 'rockRhino', 'elite'); inShift11(H, F, DEF.skills['t_tmCurse']); return F.data.in11; });
      ok('魔導書的特性：用的那一類只 −5%', half.m === 95 && half.b === 110, JSON.stringify(half)); }
    { const { c, H, F } = build('劍', 'wolf', 'wild'); inShift11(H, F, DEF.skills[H.data.attackSkill || 'attack']); ok('一般魔物沒有慣性', !F.data.in11, JSON.stringify(F.data.in11 || null)); }
    /* real battle: 3 attacks on an elite */
    const D0 = BAI.decide;
    const fight = (kind, o = {}) => { const { c, H, F } = build(kind, o.sp || 'duneWorm', o.foeKind || 'boss', o.rounds || 1, o.seed || 5); H.stats.spe = 999; H.stats.crit = 0; H.res.mp = H.max.mp = 999; if (o.setup) o.setup(c, H, F);
      let n = 0; BAI.decide = function (core, u, oo) { if (u.hero) { const sid = (o.seq ? o.seq[n] : null) || H.data.attackSkill || 'attack', meta = o.part != null ? { part11: o.part } : {}; n++; return { type: 'skill', skill: sid, targets: [F.id], meta }; } return o.foeAct ? D0.call(this, core, u, oo) : { type: 'wait' }; };
      try { c.start(true); } finally { BAI.decide = D0; } return { c, H, F, log: c.log.filter(e => !e.cancelled) }; };
    { const r = fight('劍', { sp: 'rockRhino', foeKind: 'elite', rounds: 3 }); ok('慣性（實戰）：普攻 3 回合後普攻 70%', r.F.data.in11 && r.F.data.in11.b === 70, JSON.stringify(r.F.data.in11)); }
    /* ===== 部位 ===== */
    { const { c, H, F } = build('劍'); const P = partsOf11(F); ok('沙丘巨蟲有 2 個部位，耐久＝最大 HP 的 10%', P && P.length === 2 && P[0].max === Math.round(F.max.hp * 0.1), P && P.map(p => p.n + ' ' + p.hp + '/' + p.max).join('、') + '（HP ' + F.max.hp + '）'); }
    { const { c, H, F } = build('劍'); H.lv = 500; c.applyStatus(H, F, 'broken', {}); const atk = H.data.attackSkill || 'attack', a = pv(c, H, F, atk); c.part11 = { t: F.id, k: 0 }; const b = pv(c, H, F, atk); c.part11 = null;
      ok('打部位不吃破防的 +50%', Math.abs(a / b - 1.5) < 0.02, '本體 ' + a + '、部位 ' + b); }
    { const sp = tr => { const f = () => { const { c, H, F } = build('長槍'); H.lv = 500; c.applyStatus(H, F, 'broken', {}); c.part11 = { t: F.id, k: 0 }; const v = pv(c, H, F, 't_spPierce'); c.part11 = null; return v; }; return tr ? withTrait('長槍', f) : f(); };
      ok('長槍的特性：打部位 +30%', Math.abs(sp(1) / sp(0) - 1.3) < 0.02, sp(0) + ' → ' + sp(1)); }
    { const r = fight('劍', { part: 0, rounds: 1, setup: (c, H, F) => { c.applyStatus(H, F, 'broken', {}); H.stats.atk = 99999; } }); const p = r.F.data.parts11 && r.F.data.parts11[0], msg = r.log.filter(e => e.type === EVT.MESSAGE && e.payload.key === 'part11');
      ok('破防中打部位：打壞、招式變弱、訊息', p && p.gone && r.F.data.partWeak11 && r.F.data.partWeak11.m_wormBite && msg.length === 1 && r.c.data.partsBroken11 === 1, JSON.stringify(p) + ' 訊息 ' + msg.length); }
    { const r = fight('劍', { part: 0, rounds: 1, setup: (c, H, F) => { H.stats.atk = 99999; } }); const p = r.F.data.parts11 && r.F.data.parts11[0];
      ok('沒破防時選部位無效（打本體）', !p || (!p.gone && p.hp === p.max), JSON.stringify(p || null)); }
    { const dmg = weak => { const r = fight('劍', { foeAct: 1, rounds: 3, seed: 3, setup: (c, H, F) => { H.stats.atk = 1; H.max.hp = H.res.hp = 99999; if (weak) F.data.partWeak11 = { m_wormBite: 1 }; F.skills = ['m_wormBite']; } });
        const L = r.log.filter(e => e.type === EVT.DAMAGE && e.src === r.F.id && e.payload.skill === 'm_wormBite').map(e => e.payload.amount); return L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; };
      const a = dmg(0), b = dmg(1); ok('打壞後那招威力減半', b > 0 && Math.abs(b / a - 0.5) < 0.06, a.toFixed(1) + ' → ' + b.toFixed(1)); }
    BR.VARIANCE = V0;
    return out.join('\n') + '\n\n' + out.filter(x => x.startsWith('PASS')).length + '/' + out.length + ' PASS';
  }, save));
};
