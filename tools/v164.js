// v10.5 drops: first kill = random blue blueprint + blue ticket; orbs by chance; elite rematch EXP −70%
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 30; applyStartClass('swordsman');
    const w = makeGear('duskSword', 4); st.equip.weapon = w.u; st.hp = heroStats().hp; st.map = 'route'; st.x = 5; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    window.__log = []; const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { window.__log.push('exp ' + a + (this._eliteAgain ? ' (again)' : '')); yield* _ge.call(this, a); };
    const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { if (/設計圖|打造券|寶珠|素材/.test(t)) window.__log.push(t); yield* _m.call(this, t, o); }; });
  for (let i = 0; i < 2; i++) {
    await g.ev(() => { const ow = Game.scene; UI.clear(); ow.script = null; Game.st.hp = heroStats().hp; ow.run(ow.battleScript({ sp: 'wolf', lv: 9, kind: 'elite', id: 'wolfTest' })); }); await g.step(60);
    await g.autoBattle('smart'); await g.step(30);
  }
  g.log('log', await g.ev(() => window.__log.join(' | ') + ' || tickets ' + JSON.stringify(Game.st.bpN) + ' bp ' + Object.keys(Game.st.bp || {}).join(',') + ' kills ' + JSON.stringify(Game.st.kills)));
};
