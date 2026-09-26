module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.bag.potion = 5; st.bag.license = 1; st.bag.superPotion = 1; st.bag.ironSword = 1; st.moves.push({ id: 'focus', pp: 20 }); st.map = 'town'; st.x = 10; st.y = 9; st.dir = 'down'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10); await g.press('start', 10); await g.shot('m_start');
  await g.press('a', 10); await g.shot('m_status'); await g.press('right', 6); await g.shot('m_moves'); await g.press('b', 10);
  await g.press('down', 4); await g.press('a', 10); await g.shot('m_bag'); await g.press('right', 4); await g.shot('m_bag2'); await g.press('b', 10);
  await g.press('down', 4); await g.press('a', 10); await g.shot('m_equip'); await g.press('a', 10); await g.shot('m_equip2'); await g.press('a', 10); await g.shot('m_equip3'); await g.press('b', 10);
  await g.press('down', 4); await g.press('down', 4); await g.press('a', 10); await g.shot('m_opts'); await g.press('b', 10);
  await g.press('up', 4); await g.press('a', 40); await g.shot('m_save'); await g.press('a', 60); await g.shot('m_save2'); await g.mash('a', 3, 30);
  g.log(JSON.stringify((await g.state()).st));
  g.log(await g.ev(() => { try { return localStorage.getItem('dawnlight_save_v1') ? 'saved' : 'none'; } catch (e) { return 'err ' + e.message; } }));
};
