module.exports = async (g) => {
  await g.press('a', 30); await g.press('a', 60); await g.mash('a', 30, 24); await g.step(60);
  g.log('start', JSON.stringify((await g.state()).st));
  const ok = await g.walkTo(4, 7); g.log('walk ok', ok, JSON.stringify((await g.state()).st));
  const info = await g.ev(() => { const ow = __game.Game.scene; return { exit: ow.map.d.exit, p: [ow.p.x, ow.p.y, ow.p.dir], script: !!ow.script }; }); g.log(JSON.stringify(info));
  await g.hold('down', 70); await g.step(30);
  g.log('after exit', JSON.stringify((await g.state()).st));
};
