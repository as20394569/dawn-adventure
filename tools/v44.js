module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, ch2: 3 }); st.lv = 44; st.map = 'capSewer'; st.x = 10; st.y = 4; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    applyStartClass('swordsman'); st.cls = 'swordmaster'; for (const n of skillTreeOf('swordmaster')) st.skills[n.id] = 3;
    for (const [s, k] of [['weapon', 'moldBlade'], ['head', 'duskHelm'], ['body', 'duskPlate'], ['feet', 'voidBoots'], ['acc1', 'lavaHeart'], ['acc2', 'voidRing']]) { const gg = makeGear(k, 3); st.equip[s] = gg.u; }
    st.attr = null; attrAuto(st); st.hp = heroStats().hp; st.mp = heroStats().mp; window.__log = [];
    const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { window.__log.push(t); yield* _m.call(this, t, o); };
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(G.Events.ratBoss(ow)); });
  for (let i = 0; i < 60; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle')) break; await g.press('a', 8); }
  g.log('foe', await g.ev(() => { const b = __game.Game.scene; return b.F ? JSON.stringify([b.F.n, b.F.lv, b.F.hp, b.F.stats]) : 'no battle'; }));
  const r = await g.autoBattle('smart'); g.log('autoBattle', r);
  g.log(await g.ev(() => window.__log.slice(0, 50).join(' | ')));
};
