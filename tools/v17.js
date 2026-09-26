module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'route'; st.x = 5; st.y = 20; st.money = 99999; Object.assign(st.bag, { stone: 20, gel: 10, crystal: 10 }); G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    for (const [b, sl] of [['dawnSword', 'weapon'], ['knightHelm', 'head'], ['chainMail', 'body']]) { st.gid++; st.gear.push({ u: st.gid, b, q: 3, r: 1, a: [] }); st.equip[sl] = st.gid; }
    st.hp = G.heroStats().hp; st.moves = [{ id: 'slash', pp: 35 }, { id: 'thunder', pp: 20 }, { id: 'aquaBlade', pp: 20 }, { id: 'heal', pp: 10 }]; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.enhanceFlow()); }); await g.step(10); await g.shot('e_enh'); for (let i = 0; i < 12; i++) await g.press('a', 30);
  g.log('enh', JSON.stringify(await g.ev(() => __game.Game.st.gear.map(x => [x.b, x.e || 0]))));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(ow.battleScript({ sp: 'crystalGolem', lv: 16, kind: 'boss' })); });
  let shot = 0;
  const seen = new Set(); await g.autoBattle(0, async u => { for (const m of ['碎片', '鏡子', '大水', '濕透', '反射']) if (u.includes(m)) seen.add(m); if (!shot && u.includes('碎片浮')) { shot = 1; await g.step(30); await g.shot('e_shards'); } if (shot === 1 && u.includes('鏡子')) { shot = 2; await g.shot('e_mirror'); } });
  for (let k = 0; k < 4 && await g.ev(() => __game.Game.scene.constructor.name) === 'Battle'; k++) await g.autoBattle(0, async u => { for (const m of ['碎片', '鏡子', '大水', '濕透', '反射', '感電']) if (u.includes(m)) seen.add(m); });
  g.log('scene', await g.ev(() => __game.Game.scene.constructor.name + ' ' + __game.Game.st.hp + ' ' + !!__game.Game.st.flags.crystalBoss));
  g.log('seen', [...seen].join(','));
  g.log('end', JSON.stringify((await g.state()).st.map));
};
