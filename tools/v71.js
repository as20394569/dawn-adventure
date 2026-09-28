// poison audit: which classes / setups poison monsters, and how often (40 plain attacks each)
module.exports = async (g) => {
  const out = await g.ev(() => {
    const G = __game, rows = [];
    for (const cls of Object.keys(CLASSES)) {
      G.newGameState('x'); const st = G.Game.st; st.lv = 30; const base = CLASSES[cls].from || (CLASSES[cls].tier === 1 ? cls : 'swordsman'); applyStartClass(base); st.cls = cls; st.hp = heroStats().hp;
      const S = heroStats(); const b = new Battle({ sp: 'wolf', lv: 20, kind: 'wild', bg: 'field' });
      rows.push(cls + ' venomEdge=' + (S.venomEdge || 0) + ' poisonEdge=' + ((S.fx || {}).poisonEdge || 0) + ' gear=' + Object.values(st.equip).filter(Boolean).map(u => (st.gear.find(g2 => g2.u === u) || {}).b).join('/'));
    }
    return rows.join('\n');
  });
  g.log(out);
};
