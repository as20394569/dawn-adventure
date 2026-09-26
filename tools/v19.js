module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, wolf: 1, croc: 1, caravan: 'saved', mineOpen: 1 }); st.lv = 16; st.cls = 'mage'; st.map = 'route'; st.x = 19; st.y = 29; st.dir = 'right'; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    st.moves = [{ id: 'leafBlade', pp: 20 }, { id: 'flameSlash', pp: 20 }, { id: 'aquaBlade', pp: 20 }, { id: 'chainBolt', pp: 10 }]; st.hp = G.heroStats().hp; });
  await g.hold('right', 60); await g.step(40); g.log('map', JSON.stringify((await g.state()).st));
  await g.shot('c_mine');
  // combo test vs wild bandit: leaf then fire
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'oreSlime', lv: 12, kind: 'wild' })); });
  const seen = new Set(); let sh = 0;
  const hook = async u => { for (const m of ['纏住', '燎原', '蒸氣', '劈裂']) if (u.includes(m)) { seen.add(m); if (!sh && m === '燎原') { sh = 1; await g.shot('c_ignite'); } } };
  await g.autoBattle(0, hook);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'bandit', lv: 12, kind: 'wild' })); });
  await g.autoBattle(1, hook);
  g.log('combo', [...seen].join(','));
  // bandit boss
  await g.ev(() => { const G = __game, ow = G.Game.scene, st = G.Game.st; ow.script = null; G.UI.clear(); st.money = 5000; st.lv = 20; st.hp = G.heroStats().hp; ow.load('mine', 8, 3, 'up'); ow.run(G.Events.banditBoss(ow)); });
  const bs = new Set(); let s2 = 0;
  const bh = async u => { for (const m of ['搶走', '舉起了戰斧', '口哨', '飛刀', '奪回']) if (u.includes(m)) { bs.add(m); if (m === '口哨' && !s2) { s2 = 1; await g.shot('c_boss'); } } };
  for (let k = 0; k < 6 && await g.ev(() => __game.Game.scene.constructor.name) === 'Battle' || k === 0; k++) await g.autoBattle(3, bh);
  await g.mash('a', 14, 30);
  g.log('boss', [...bs].join(','), JSON.stringify(await g.ev(() => [__game.Game.scene.constructor.name, __game.Game.st.flags.bandit, __game.Game.st.money, __game.Game.st.gear.map(x => x.b).join(',')])));
  // pack
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.st.hp = G.heroStats().hp; ow.run(ow.packScript(G.MAPS.mine.encounters[0])); });
  for (let k = 0; k < 4; k++) { await g.mash('a', 3, 30); if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') await g.autoBattle(2, async () => {}); }
  await g.mash('a', 6, 30);
  g.log('pack', JSON.stringify(await g.ev(() => [__game.Game.st.packs, __game.Game.scene.constructor.name])));
  // class skill FX shot
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.st.moves[0] = { id: 'meteor', pp: 5 }; ow.run(ow.battleScript({ sp: 'mineBat', lv: 12, kind: 'wild' })); });
  await g.autoBattle(0, async u => { if (u.includes('隕火') && !s2++) {} });
};
