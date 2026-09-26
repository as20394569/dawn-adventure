module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.lv = 13; st.exp = Math.floor(0.8 * 13 ** 3); st.equip.weapon = 'ironSword'; st.bag.ironSword = 1; st.moves = [{ id: 'leafBlade', pp: 20 }, { id: 'aquaBlade', pp: 25 }, { id: 'thunder', pp: 20 }, { id: 'focus', pp: 20 }]; st.hp = G.heroStats().hp; st.bag.potion = 5; st.bag.superPotion = 2; st.map = 'ruins'; st.x = 7; st.y = 10; st.dir = 'up'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(30); await g.shot('r_ruins');
  await g.hold('up', 17 * 3); await g.step(10);
  await g.step(60); await g.shot('r_cut1');
  let shots = {};
  await g.autoBattle(1, async u => {
    const sc = async (k) => { if (!shots[k]) { shots[k] = 1; await g.shot(k); } };
    if (u.includes('擋住了去路')) await sc('r_intro');
    if (u.includes('狂暴')) await sc('r_phase2');
    if (u.includes('凝聚大地')) { await sc('r_charge'); }
    if (u.includes('[戰鬥/背包/防禦/逃跑]')) {
      const charging = await g.ev(() => !!__game.Game.scene.F.charging);
      const low = await g.ev(() => __game.Game.st.hp < __game.heroStats().hp * 0.4);
      if (charging) { await g.ev(() => { const m = __game.UI.stack.find(w => w.items); m.i = 2; __game.press('a', 2, 6); }); return 'handled'; }
      if (low) { await g.ev(() => { const m = __game.UI.stack.find(w => w.items); m.i = 1; __game.press('a', 2, 6); }); await g.press('a', 6); await g.press('a', 10); await g.press('a', 10); return 'handled'; }
    }
    if (u.includes('岩石粉碎拳！') && !shots.r_fist) { await g.step(14); await sc('r_fist'); }
  });
  await g.step(20); g.log(JSON.stringify((await g.state()).st));
  for (let i = 0; i < 30; i++) { const sc = await g.ev(() => __game.Game.scene.constructor.name); if (sc === 'EndingScene') break; await g.press('a', 20); }
  await g.step(200); await g.shot('r_end1'); await g.hold('a', 900); await g.shot('r_end2');
  await g.press('a', 80); await g.step(60); await g.shot('r_after');
  g.log(JSON.stringify((await g.state()).st));
};
