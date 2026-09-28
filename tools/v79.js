// story / side-quest NPC markers at a few points of the game + a field screenshot
module.exports = async (g) => {
  const cases = [['early ch1', { license: 1, woke: 1 }, {}], ['ch2 start', { license: 1, woke: 1, golem: 1 }, {}], ['ch2=3', { license: 1, woke: 1, golem: 1, ch2: 3 }, {}],
    ['ch2=3 gears+bear', { license: 1, woke: 1, golem: 1, ch2: 3, gearSewer: 1, gearPlains: 1, monkQ: 1, snowBear: 1, sheepQ: 1, boarKing: 1 }, { dragonFlame: 1 }]];
  for (const [label, flags, bag] of cases) g.log(label, await g.ev(([flags, bag]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, flags); Object.assign(st.bag, bag);
    return Object.keys(STORY_MARKS).map(id => { const m = npcQuestState(id, st); return m ? id + m : ''; }).filter(Boolean).join(' '); }, [flags, bag]));
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, ch2: 3, liaCap: 1 }); st.map = 'capital'; st.x = 15; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.UI.clear(); G.Game.sys.length = 0; });
  await g.ev(() => __game.step(30)); await g.shot('marks_capital');
};
