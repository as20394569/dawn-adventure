module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 16; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.bpT = { dawnSword: 4 }; st.bp = { dawnSword: 1 }; st.money = 9999; for (const k in ITEMS) if (ITEMS[k].mat) st.bag[k] = 20;
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(forgeFlow('dawnSword')); });
  await g.step(40); await g.shot('v98_forge'); await g.press('down', 6); await g.press('a', 10); for (let i = 0; i < 12; i++) await g.press('a', 10); 
  g.log(await g.ev(() => __game.Game.st.gear.map(x => x.b + ':q' + x.q).join(' ')));
};
