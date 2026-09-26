module.exports = async (g) => {
  await g.press('a', 30); await g.press('a', 60);
  await g.mash('a', 30, 24);
  await g.step(60); await g.shot('s2_home');
  g.log(JSON.stringify(await g.state()));
  // walk to mom: mom at (6,4). player (1,4) facing up. go right 4 -> (5,4) facing right
  await g.hold('right', 16*4+4); await g.press('a', 10); await g.shot('s2_mom');
  await g.mash('a', 8, 30); await g.step(30);
  // exit: go to mat (4,7): from (5,4): down 3 -> (5,7), left 1 -> (4,7), down
  await g.hold('down', 16*3+4); await g.hold('left', 18); await g.hold('down', 60); await g.step(40);
  await g.shot('s2_town'); g.log(JSON.stringify(await g.state()));
};
