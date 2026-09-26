module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'mine'; st.x = 8; st.y = 3; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    st.moves = [{ id: 'leafBlade', pp: 20 }, { id: 'flameSlash', pp: 20 }, { id: 'aquaBlade', pp: 20 }, { id: 'sanctuary', pp: 10 }]; st.hp = G.heroStats().hp; });
  const seen = new Set();
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'crystalGolem', lv: 40, kind: 'elite' })); });
  await g.step(200);
  await g.ev(() => { const b = __game.Game.scene; const o = b.foeChoose.bind(b); let n = 0; b.foeChoose = () => (n++ === 0 ? { type: 'move', id: 'harden' } : { type: 'move', id: 'howl' }); });
  let turn = 0;
  await g.autoBattle(0, async u => { for (const m of ['纏住', '燎原', '蒸氣', '搶走', '奪回', '神聖', '灼傷']) if (u.includes(m)) seen.add(m);
    if (u.includes('纏住')) await g.ev(() => { const s = __game.Game.st; s.moves = [{ id: 'flameSlash', pp: 20 }, { id: 'leafBlade', pp: 20 }, { id: 'aquaBlade', pp: 20 }, { id: 'sanctuary', pp: 9 }]; });
    if (u.includes('燎原') && !turn++) await g.shot('c_ignite');
    if (u.includes('灼傷了')) await g.ev(() => { const s = __game.Game.st; s.moves = [{ id: 'aquaBlade', pp: 20 }, { id: 'leafBlade', pp: 20 }, { id: 'flameSlash', pp: 20 }, { id: 'sanctuary', pp: 9 }]; });
  });
  g.log('seen', [...seen].join(','), await g.ev(() => __game.Game.scene.constructor.name + ' ' + __game.Game.st.money));
};
