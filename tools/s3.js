module.exports = async (g) => {
  await g.press('a', 30); await g.press('a', 60); await g.mash('a', 30, 24); await g.step(60);
  await g.walkTo(6, 5); await g.face('up'); await g.press('a', 10); await g.shot('s3_mom'); await g.mash('a', 6, 30);
  await g.walkTo(4, 7); await g.hold('down', 70); await g.step(30); await g.shot('s3_town');
  g.log(JSON.stringify(await g.state()));
  // try leaving without license
  await g.walkTo(10, 2); await g.hold('up', 30); await g.step(60); await g.shot('s3_block'); await g.mash('a', 6, 30); await g.step(40);
  g.log(JSON.stringify(await g.state()));
  // elder house door (15,6): stand at (15,7) and go up
  await g.walkTo(15, 7); await g.hold('up', 60); await g.step(40); await g.shot('s3_elderhouse');
  await g.walkTo(4, 4); await g.face('up'); await g.press('a', 10); await g.mash('a', 40, 26); await g.step(30);
  g.log(JSON.stringify(await g.state()));
  await g.walkTo(4, 7); await g.hold('down', 70); await g.step(30);
  // go to route
  await g.walkTo(10, 0); await g.hold('up', 20); await g.step(10); await g.shot('s3_edge');
  await g.hold('up', 60); await g.step(80); await g.shot('s3_route');
  g.log(JSON.stringify(await g.state()));
};
