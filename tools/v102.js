// v7.1 checks: hero stats vs level (attr 1/lv), talent points, fruit prices, rest cost, star-up / refine stones, commission rewards, migration
module.exports = async (g) => g.log(await g.ev(() => {
  const G = __game, out = [];
  for (const lv of [10, 20, 30]) { G.newGameState('x'); const st = G.Game.st; st.lv = lv; applyStartClass('swordsman'); st.attr = {}; attrAuto(st); const s = heroStats(st); out.push('Lv' + lv + ' atk ' + s.atk + ' def ' + s.def + ' hp ' + s.hp + ' attrPts ' + attrPointsFor(lv) + ' tp ' + tpTotal(st)); }
  const st = G.Game.st; st.fruitBought = 2; out.push('fruit price now ' + priceOf('vitFruit') + ' ×3 ' + priceFor('dexFruit', 3) + ' potion ' + priceOf('potion'));
  out.push('rest Lv30 home ' + restCost(st, 8) + ' inn ' + st.lv * 15);
  const w = makeGear('ironSword', 2); const a0 = gearStats(w).st.atk; w.s = 3; w.e = 8; out.push('ironSword atk base ' + a0 + ' → ★3 +8 ' + gearStats(w).st.atk + ' name ' + gearName(w) + ' enh9 ' + JSON.stringify(enhanceCost(w)));
  out.push('c7 reward: ' + rewardText(COMMISSIONS.c7.reward) + ' | c1: ' + rewardText(COMMISSIONS.c1.reward));
  const old = { ...st, balV: 0, attr: { str: 20, vit: 10, agi: 8 }, lv: 30, ct: { 'swordsman.0.0': 3, 'swordsman.0.1': 3, 'swordsman.0.2': 3, 'swordsman.0.3': 3, 'swordsman.0.4': 1, 'swordsman.0.5': 3, 'swordsman.1.0': 3, 'swordsman.1.1': 3 }, flags: { deep: 1 } };
  v71Migrate(old); out.push('migrated attr ' + JSON.stringify(old.attr) + ' avail ' + attrAvail(old) + ' ct ' + JSON.stringify(old.ct) + ' note ' + old.v71note);
  out.push('quest gear known lv50? ' + (() => { st.lv = 50; return bpKnown('qHeroCrest', st); })());
  return out.join('\n');
}));
