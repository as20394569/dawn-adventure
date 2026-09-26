module.exports = async (g) => {
  await g.press('a', 30); await g.press('a', 60); await g.mash('a', 30, 24); await g.step(60);
  await g.ev(() => { const ow = __game.Game.scene; ow.load('home', 5, 7, 'down'); });
  const log = await g.ev(() => { const G = __game; const ow = G.Game.scene; const out = []; G.Input.set('left', true); for (let i = 0; i < 30; i++) { G.step(1); out.push([ow.p.x, ow.p.y, ow.p.dir, ow.p.moving, ow.p.px, !!ow.script, ow.p.turnT].join(',')); } G.Input.set('left', false); return out.join(' | '); });
  g.log(log);
};
