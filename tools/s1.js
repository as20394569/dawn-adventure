module.exports = async (g) => {
  await g.press('a', 30); await g.shot('s1_menu');
  await g.press('a', 30); // new game
  await g.step(40); await g.shot('s1_intro0');
  await g.mash('a', 12, 30); await g.shot('s1_intro1');
  await g.mash('a', 10, 30); await g.shot('s1_name');
  g.log(JSON.stringify(await g.state()));
};
