module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.v8new = 1; Object.assign(st.flags, { license: 1, woke: 1, hillsQ: 1 }); st.lv = 6; st.map = 'windHills'; st.x = 0; st.y = 26; st.dir = 'right'; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); });
  await g.step(30); g.log(await g.ev(() => { const ow = __game.Game.scene; return ow.map.id + ' ' + ow.p.x + ',' + ow.p.y + ' script ' + !!ow.script + ' trig ' + JSON.stringify(ow.map.d.triggers.slice(0, 2)); }));
  await g.walkTo(2, 26); g.log(await g.ev(() => { const ow = __game.Game.scene, f = __game.Game.st.flags; return ow.p.x + ',' + ow.p.y + ' script ' + !!ow.script + ' noraMet ' + f.noraMet + ' ui ' + __game.UI.stack.map(w => w.constructor.name).join(','); }));
};
