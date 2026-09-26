module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.bag.potion = 5; st.bag.license = 1; st.bag.superPotion = 1; st.map = 'shop'; st.x = 1; st.y = 4; st.dir = 'up'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10); await g.shot('m_shopin');
  await g.press('a', 40); await g.shot('m_shop1');
  await g.press('a', 10); await g.shot('m_buy');
  for (let i = 0; i < 8; i++) await g.press('down', 4);
  await g.shot('m_buy2'); await g.press('a', 20); await g.shot('m_buy3'); await g.press('a', 20); await g.shot('m_buy4');
  await g.mash('a', 3, 20); await g.press('b', 10); await g.press('b', 10); await g.step(10); await g.mash('a', 4, 20);
  g.log(JSON.stringify((await g.state()).st));
  await g.step(30); await g.press('start', 10); await g.shot('m_start');
  await g.press('a', 10); await g.shot('m_status'); await g.press('right', 6); await g.shot('m_moves'); await g.press('b', 10);
  await g.press('down', 4); await g.press('a', 10); await g.shot('m_bag'); await g.press('right', 4); await g.shot('m_bag2'); await g.press('b', 10);
  await g.press('down', 4); await g.press('a', 10); await g.shot('m_equip'); await g.press('a', 10); await g.shot('m_equip2'); await g.press('a', 10); await g.shot('m_equip3'); await g.press('b', 10);
  await g.press('down', 4); await g.press('down', 4); await g.press('a', 10); await g.shot('m_opts'); await g.press('b', 10);
  await g.press('up', 4); await g.press('a', 40); await g.shot('m_save'); await g.mash('a', 3, 30);
};
