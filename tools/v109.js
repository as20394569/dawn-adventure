// v8.0 task O art: new chapter-1 chibis in battle + the two region bosses on their maps
module.exports = async (g) => {
  for (const [sp, lv, kind] of [['hornHare', 5, 'wild'], ['gustSprite', 6, 'wild'], ['millGolem', 8, 'elite'], ['blackCatfish', 11, 'elite'], ['mireFly', 10, 'wild']]) {
    await g.ev(([sp, lv, kind]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 12; st.map = 'route'; st.x = 10; st.y = 30; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman');
      st.hp = heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(ow.battleScript({ sp, lv, kind, id: sp })); }, [sp, lv, kind]);
    for (let i = 0; i < 600; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle' && __game.Game.scene.t > 150)) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(3); }); }
    await g.shot('v109_' + sp);
    g.log(sp, await g.ev(sp => { const s = pxSpec(sp); return [!!s.chibi, chibiBase(sp), chibiOwn(sp)]; }, sp));
  }
  for (const [map, x, y] of [['windHills', 11, 6], ['jadeCreek', 11, 7]]) {
    await g.ev(([map, x, y]) => { const G = __game; G.UI.clear(); G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, hillsQ: 1, creekQ: 1 }); st.lv = 12; st.map = map; st.x = x; st.y = y; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.scene.script = null; }, [map, x, y]);
    await g.step(40); await g.shot('v109_map_' + map);
  }
};
