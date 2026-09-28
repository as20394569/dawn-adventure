// v7.0 logic: weapon skills, talents, recipes, blueprints, migration
module.exports = async (g) => {
  g.log(await g.ev(() => {
    const G = __game, out = [];
    G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1 }); st.lv = 10; applyStartClass('swordsman');
    out.push('start ws: ' + wsList(st).map(id => MOVES[id].n + '/MP' + skillMP(id)).join(' ') + ' atk=' + skillMove('attack').n + ' tp=' + tpAvail(st));
    const g2 = makeGear('huntKnife', 2); st.sub = { u: g2.u, i: 1 }; out.push('with sub: ' + wsList(st).map(id => MOVES[id].n + (isBorrowed(id) ? '(副)' : '')).join(' '));
    const s0 = heroStats(); st.ct['swordsman.0.1'] = 3; st.ct['swordsman.0.0'] = 3; const s1 = heroStats(); out.push('crit ' + s0.crit.toFixed(1) + '→' + s1.crit.toFixed(1) + ' kindUp ' + JSON.stringify(s1.kindUp) + ' spent ' + tpSpent(st) + ' avail ' + tpAvail(st));
    out.push('block row1: ' + nodeBlock(CT.swordsman[0][2]) + ' | row3: ' + nodeBlock(CT.swordsman[0][5]));
    // every weapon has skills, recipes use real materials
    const W = Object.keys(GEAR).filter(k => GEAR[k].slot === 'weapon'); out.push('weapons ' + W.length + ' without skills: ' + W.filter(k => !WSK[k]).join(','));
    const badM = Object.entries(GEAR_RECIPE).filter(([k, R]) => Object.keys(R.mats).some(m => !ITEMS[m])); out.push('recipes ' + Object.keys(GEAR_RECIPE).length + ' bad mats: ' + badM.map(x => x[0]).join(','));
    const names = {}; for (const k in WSK) for (const n of [...WSK[k].a.map(id => MOVES[id].n), WSK[k].p.n, WSK[k].s.n]) (names[n] = names[n] || []).push(k); out.push('dup names: ' + Object.entries(names).filter(([n, L]) => L.length > 1).map(([n, L]) => n + ':' + L.join('/')).join(' '));
    const fxMiss = new Set(); for (const k of Object.keys(KIND_ATK)) if (!FX[KIND_ATK[k][1]]) fxMiss.add(KIND_ATK[k][1]); for (const k in KIND_SPFX) if (!FX[KIND_SPFX[k]]) fxMiss.add(KIND_SPFX[k]); out.push('fx missing: ' + [...fxMiss].join(','));
    const known = t => Object.keys(GEAR).filter(k => bpKnown(k)).length; st.lv = 1; const a = known(); st.lv = 30; const b = known(); st.lv = 10; out.push('known bp lv1 ' + a + ' lv30 ' + b + ' rare ' + BP_RARE.size);
    const hist = [0, 0, 0, 0, 0, 0]; for (let i = 0; i < 2000; i++) hist[bpRoll(1)]++; out.push('odds lv1 ' + hist.slice(1).join('/'));
    // talent trees: 10 classes × 3 × 7
    out.push('trees ' + Object.keys(CT).map(c => c + ':' + CT[c].map(B => B.length).join('')).join(' '));
    const keys = new Set(); for (const c in CT) for (const B of CT[c]) for (const n of B) keys.add(n.key); out.push('talent keys ' + [...keys].filter(k => tDesc(k, 1).includes('+1') && !TK_TXT[k] && !k.includes(':')).join(','));
    // migration of an old save
    const old = { ...st, cls: 'swordmaster', skV: 4, lv: 20, skills: { powerSlash: 3 }, skp: 5, tp: 3, tal: { blade: 2 }, flags: { license: 1 }, gear: st.gear.slice(), ct: undefined, bp: undefined };
    v7Migrate(old); out.push('migrated cls ' + old.cls + ' deep ' + old.flags.deep + ' skV ' + old.skV + ' bp ' + Object.keys(old.bp).join(','));
    return out.join('\n');
  }));
};
