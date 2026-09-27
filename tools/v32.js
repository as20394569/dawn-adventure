// every hero FX and monster MFX once, with rendering: no page errors, no particle errors
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); });
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'gatekeeper', lv: 20, kind: 'boss', id: 'gatekeeper' })); });
  for (let i = 0; i < 60; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  await g.step(30); g.log('scene', await g.ev(() => __game.Game.scene.constructor.name));
  const keys = await g.ev(() => [Object.keys(FX), Object.keys(MFX)]);
  g.log('FX', keys[0].length, 'MFX', keys[1].length);
  await g.ev(() => { const b = __game.Game.scene; __game.UI.clear(); window.__fxErr = [];
    b.script = (function* () { for (const [tab, name] of [[FX, 'FX'], [MFX, 'MFX']]) for (const k of Object.keys(tab)) { if (typeof tab[k] !== 'function') continue; try { const g = tab[k].call(b, b.center(b.H), b.center(b.F), b.H, 1, 3); if (g && g.next) yield* g; } catch (e) { window.__fxErr.push(name + '.' + k + ': ' + e.message); } b.fx.length = 0; b.shake = 0; b.tintF = b.tintH = null; } window.__fxDone = 1; })(); });
  for (let i = 0; i < 400; i++) { if (await g.ev(() => window.__fxDone)) break; await g.step(30); }
  g.log('done', await g.ev(() => window.__fxDone), JSON.stringify(await g.ev(() => window.__fxErr)));
};
