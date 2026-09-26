module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, gateOpen: 1 }); st.lv = 22; st.map = 'ruins'; st.x = 13; st.y = 9; st.dir = 'down'; st.gear.push({ u: 99, b: 'mistDagger', q: 2, r: 1, a: [['vs', '火', 12]] }); G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; st.hp = G.heroStats().hp;
    st.moves = [{ id: 'slash', pp: 35 }, { id: 'flameSlash', pp: 25 }, { id: 'aquaBlade', pp: 20 }, { id: 'heal', pp: 10 }]; });
  g.log('migr', JSON.stringify(await g.ev(() => __game.Game.st.gear.find(x => x.u === 99).a)));
  await g.step(4); await g.shot('e_stairs');
  await g.press('a', 20); await g.press('a', 30); await g.step(40);
  g.log('map', (await g.state()).st.map);
  await g.shot('e_catacomb');
  // equip fire weapon kingsBlade and fight boneKnight (weak to fire)
  await g.ev(() => { const G = __game, st = G.Game.st; st.gid++; st.gear.push({ u: st.gid, b: 'kingsBlade', q: 3, r: 1, a: [] }); st.equip.weapon = st.gid; st.hp = G.heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); const e = ow.elites.find(x => x.id === 'boneKnight'); ow.run(ow.eliteTalk(e)); });
  let eff = 0; await g.autoBattle(0, async u => { if (u.includes('效果絕佳')) eff++; });
  const log=[]; for (let k = 0; k < 4 && await g.ev(() => __game.Game.scene.constructor.name) === 'Battle'; k++) await g.autoBattle(0, async u => { if (u.includes('效果絕佳')) eff++; if (/傷害|使用了|倒下/.test(u) && log[log.length-1]!==u) log.push(u); });
  g.log(log.slice(-25).join(' | '));
  await g.mash('a', 8, 30);
  g.log('knight', eff, JSON.stringify(await g.ev(() => [__game.Game.scene.constructor.name, __game.Game.st.flags.boneKnight, __game.Game.st.gear.map(x => x.b + x.q).slice(-2)])));
  // rare flee
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.st.hp = G.heroStats().hp; G.Game.st.equip.weapon = null; G.Game.st.moves = [{ id: 'glare', pp: 30 }]; ow.run(ow.battleScript({ sp: 'goldSlime', lv: 5, kind: 'wild' })); });
  await g.step(200); await g.shot('e_rare');
  let fled = 0; await g.autoBattle(0, async u => { if (u.includes('逃走了')) fled = 1; });
  g.log('rare', fled, await g.ev(() => __game.Game.scene.constructor.name));
  // dex
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(G.dexScreen()); }); await g.step(4); await g.shot('e_dex');
  await g.press('b', 6);
  // bag gear detail with element
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(G.equipScreen()); }); await g.step(4); await g.press('a', 10); await g.shot('e_equip');
};
