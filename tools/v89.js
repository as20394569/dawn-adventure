// class change paths: tree / usable / inherited / summary lists after each change
module.exports = async (g) => g.log(await g.ev(() => {
  const G = __game, out = []; const nm = ids => ids.map(id => (MOVES[id] || {}).n + '(' + (MOVES[id] || {}).cat + ')').join(' ');
  for (const path of [['mage', 'stormcaller', 'bard'], ['swordsman', 'swordmaster', 'monk'], ['ranger', 'assassin', 'dragoon'], ['guardian', 'paladin', 'machinist'], ['mage', 'pyromancer', 'spellblade', 'monk']]) {
    G.newGameState('x'); const st = G.Game.st; st.lv = 30; applyStartClass(path[0]); st.cls = path[0];
    for (const n of skillTreeOf(path[0])) st.skills[n.id] = 1;
    for (let i = 1; i < path.length; i++) { const k = path[i]; if (CLASSES[st.cls] && CLASSES[st.cls].tier < 3 && CLASSES[k].tier >= 3) st.baseCls = baseClassOf(st.cls); st.cls = k; for (const n of skillTreeOf(k).slice(0, 5)) st.skills[n.id] = Math.max(1, st.skills[n.id] || 0); fixInherit(st);
      out.push(path.slice(0, i + 1).join('→') + '\n  tree: ' + nm(skillTreeOf(k).map(n => n.id)) + '\n  usable: ' + nm(usableSkills(st)) + '\n  inherit: ' + nm(st.inh) + '\n  summary extra: ' + nm(summarySkills(st).filter(id => !usableSkills(st).includes(id)))); }
  }
  return out.join('\n');
}));
