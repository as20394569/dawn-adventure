module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.bag.potion = 5; st.bag.license = 1; st.bag.superPotion = 1; st.bag.ironSword = 1; st.bag.woodSword = 1; st.equip.weapon = 'woodSword'; st.moves.push({ id: 'focus', pp: 20 }); st.map = 'town'; st.x = 10; st.y = 9; st.dir = 'down'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10); await g.press('start', 10); await g.shot('m_start');
  await g.press('a', 10); await g.shot('m_status'); await g.press('right', 6); await g.shot('m_moves'); await g.press('b', 10);
  await g.press('down', 4); await g.press('a', 10); await g.shot('m_bag'); await g.press('right', 4); await g.press('right', 4); await g.shot('m_bag3'); await g.press('a', 10); await g.press('a', 30); await g.shot('m_phone'); await g.press('a', 10); await g.press('b', 10);
  await g.press('down', 4); await g.press('a', 10); await g.shot('m_equip'); await g.press('a', 10); await g.shot('m_equip2'); await g.press('b', 10); await g.press('b', 10);
  await g.press('down', 4); await g.press('down', 4); await g.press('a', 10); await g.shot('m_opts'); await g.press('b', 10); await g.press('b', 10);
  await g.settle();
  await g.ev(() => { const ow = __game.Game.scene; ow.load('shop', 1, 4, 'up'); });
  await g.step(10); await g.shot('m_shopin'); await g.press('a', 40); await g.shot('m_shop1'); await g.press('a', 10); await g.shot('m_buy'); await g.press('a', 10); await g.shot('m_qty');
  await g.press('b', 6); await g.press('b', 6); await g.settle();
  await g.ev(() => { const ow = __game.Game.scene; ow.load('elder', 4, 7, 'up'); }); await g.step(10); await g.shot('m_elder');
};
