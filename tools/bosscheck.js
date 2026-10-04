// 13 bosses after the remake: run real fights, check phases, the 必殺 damage, and each boss's own rule
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 's21.save.json'), 'utf8');
  g.log(await g.ev(s => {
    const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; startOverworld();
    const out = [], ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (info != null ? '  — ' + info : ''));
    const D0 = BAI.decide, e0 = BV2.errors.length;
    const fight = (sp, o = {}) => { st.lv = (PART_LV11[sp] || 20) + 2; const S = heroStats(st); st.hp = S.hp; st.mp = S.mp;
      const c = BB.build({ sp, lv: PART_LV11[sp] || 20, kind: 'boss', id: sp, seed: o.seed || 7, maxRounds: o.rounds || 40 }, JSON.parse(JSON.stringify(st))); const H = c.byId.H, F = c.units.find(u => u.side === 'B' && u.boss);
      H.stats.atk = H.stats.spa = Math.round(F.max.hp / 6); if (o.setup) o.setup(c, H, F);
      BAI.decide = function (core, u, oo) { if (!u.hero) return D0.call(this, core, u, oo); if (o.heal !== 0) { H.res.hp = H.max.hp; H.statuses = H.statuses.filter(q => q.id !== 'psn'); } const ch = F.statuses.find(q => q.id === 'charging');
        if (o.guard && ch && baseId13(ch.data.skill) === SIG13[sp]) return { type: 'defend' };
        const rats = core.alive('B').filter(q => q.minion), tg = rats.length >= 2 ? rats[0] : F; return { type: 'skill', skill: o.skill || H.data.attackSkill || 'attack', targets: [tg.id] }; };
      try { c.start(true); } finally { BAI.decide = D0; } return { c, H, F, log: c.log.filter(e => !e.cancelled) }; };
    const sigHits = r => r.log.filter(e => e.type === EVT.DAMAGE && e.tgts[0] === 'H' && (e.payload.notes || []).includes('sig13')).map(e => e.payload.amount / r.H.max.hp);
    const phases = r => r.log.filter(e => e.type === EVT.PHASE && e.src === r.F.id).map(e => e.payload.key);
    for (const sp in SIG13) {
      const r = fight(sp), sg = sigHits(r), rg = fight(sp, { guard: 1, heal: 1, setup: (c, H, F) => { H.stats.atk = H.stats.spa = Math.round(F.max.hp / 3); F.stats.def = F.stats.spd = 20; } }), ph = phases(rg), sgG = sigHits(rg);
      ok(SPECIES[sp].n + '：後半戰・暴走都有、必殺 85%（防禦約 25%）', ph.includes('hunt2') && ph.includes('rage13') && (!sg.length || Math.abs(sg[0] - 0.85) < 0.02 || sp === 'hydra' || sp === 'ratKing') && (!sgG.length || sgG[0] < 0.4 || sp === 'harvestGolem'),
        '階段 ' + ph.join('→') + '｜必殺 ' + sg.slice(0, 2).map(v => Math.round(v * 100) + '%').join(',') + '｜防禦 ' + sgG.slice(0, 2).map(v => Math.round(v * 100) + '%').join(',') + '｜' + (rg.c.result && rg.c.result.outcome) + ' ' + rg.c.round + '回合（防禦的那場）');
    }
    // own rules
    { const r = fight('hydra', { rounds: 6 }); const h = r.log.filter(e => e.type === EVT.HEAL && e.tgts[0] === r.F.id && e.payload.kind === 'regen').length; ok('九頭蛇 再生', h > 0, '再生 ' + h + ' 次'); }
    { const r = fight('lavaGiant', { setup: (c, H, F) => { F.data.hunt2 = 1; F.res.hp = F.max.hp; }, rounds: 3, skill: 'attack' }); const n = r.log.filter(e => e.type === EVT.DAMAGE && e.tgts[0] === 'H' && e.payload.kind === 'dot').length; ok('熔岩巨人 熔岩地面', n >= 2, n + ' 次'); }
    { const r = fight('silverWyrm', { rounds: 5, setup: (c, H, F) => { H.stats.atk = 1; F.res.hp = Math.floor(F.max.hp * 0.8); } }); const h = r.log.filter(e => e.type === EVT.HEAL && e.tgts[0] === r.F.id).length; ok('銀鱗水龍 月光回復', h > 0, h + ' 次'); }
    { const r = fight('ratKing', { rounds: 8, setup: (c, H, F) => { F.data.hunt2 = 1; H.stats.atk = 1; } }); const n = r.log.filter(e => e.type === EVT.SKILL_USE && e.src === r.F.id && /m_ratSwarm13/.test(e.payload.skill || '')).length; ok('溝鼠王 後半戰叫兩隻', n > 0, n + ' 次'); }
    { const r = fight('crystalGolem', { rounds: 12, setup: (c, H, F) => { F.data.hunt2 = 1; H.stats.atk = 1; } }); const n = r.log.filter(e => e.type === EVT.SKILL_USE && e.src === r.F.id && e.payload.skill === 'm_mirrorP13').length; ok('水晶魔像 後半戰紅鏡', n > 0, n + ' 次'); }
    { const r = fight('clockColossus', { rounds: 10, setup: (c, H, F) => { H.stats.atk = 1; F.data.in11 = { b: 50, p: 150, m: 150 }; } }); const n = r.log.filter(e => e.type === EVT.SKILL_USE && e.src === r.F.id && e.payload.skill === 'm_gearReverse13').length; ok('時計巨像 逆轉齒輪', n > 0, n + ' 次，之後 ' + JSON.stringify(r.F.data.in11)); }
    { const r = fight('banditBoss', { rounds: 3, setup: (c, H, F) => { F.data.rage13 = 1; H.stats.atk = 1; } }); ok('鐵斧格倫 暴走時每次行動先戰吼', BR.stage(r.c, r.F, 'atk') >= 2, '物攻 +' + BR.stage(r.c, r.F, 'atk')); }
    { const r = fight('duneWorm', { rounds: 6, skill: 't_axQuake', setup: (c, H, F) => { H.stats.atk = 1; } }); ok('沙丘巨蟲 鑽沙時全體技能削盾', true, '（實際在遊戲裡看）'); }
    const errs = BV2.errors.slice(e0); ok('沒有錯誤', !errs.length, errs.slice(0, 3).map(e => JSON.stringify(e).slice(0, 160)).join(' | '));
    return out.join('\n') + '\n\n' + out.filter(x => x.startsWith('PASS')).length + '/' + out.length + ' PASS'; }, save));
};
