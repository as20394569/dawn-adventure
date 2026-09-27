module.exports = async (g) => {
  const r = await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.lv = 10; st.flags.license = 1; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); applyStartClass('swordsman');
    st.bag.powerFruit = 5; st.bag.tpBook = 3; const out = [], tp0 = st.tp || 0;
    for (let i = 0; i < 4; i++) out.push('F' + i + ':' + (useItem('powerFruit') || itemBlockMsg('powerFruit')));
    for (let i = 0; i < 3; i++) out.push('B' + i + ':' + (useItem('tpBook') || itemBlockMsg('tpBook')));
    out.push(JSON.stringify({ boost: st.boost, tp: (st.tp || 0) - tp0, read: st.tpRead, bag: [st.bag.powerFruit, st.bag.tpBook] })); return out.join('\n'); });
  g.log(r);
};
