// v10 phase 4: weather on the field, in battle, weather monster, shrine
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; st.exp = expForLevel(20); st.map = 'lake'; st.x = 27; st.y = 12; st.steps = 10; st.wx = { lake: { k: 'storm', until: 999 } }; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); attrAuto(st); });
  await g.step(60); await g.shot('wx_field'); await g.step(120); await g.shot('wx_field2');
  g.log('wx', await g.ev(() => wxNow()), '| species', await g.ev(() => Object.values(WX_MON).map(v => v[0] + ':' + (SPECIES[v[0]] ? SPECIES[v[0]].learn.length : 'x') + (typeof chibiBase === 'function' && chibiBase(v[0]) ? '/chibi' : '')).join(' ')));
  await g.ev(() => { const ow = Game.scene; ow.script = null; UI.clear(); ow.run(ow.battleScript({ sp: 'fox', lv: 20, kind: 'wild' })); });
  for (let i = 0; i < 30; i++) { await g.step(10); if (await g.ev(() => Game.scene instanceof Battle && Game.scene.F)) break; }
  await g.step(80); await g.shot('wx_battle'); g.log('battle', await g.ev(() => Game.scene.cfg.wx + ' ' + Game.scene.F.n), await g.ui());
  await g.autoBattle('smart');
  // shrine in storm
  await g.ev(() => { const st = Game.st; st.hp = heroStats().hp; const E = EXT_AREA.lake; st.x = E.shrine[0]; st.y = E.shrine[1] + 1; startOverworld(); Game.fade = 0; const ow = Game.scene; const n = ow.npcs.find(q => q.id === 'wshrine_lake'); ow.run(talkAs(n, wshrineEvent(ow, n))); });
  await g.step(30); await g.shot('wx_shrine'); g.log('shrine ui', await g.ui());
};
