// v7.0 battle: basic attack MP, special counter, mastery, borrowed skill, blueprint drops
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 24; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman');
    const w = makeGear('ironSword', 2); st.equip.weapon = w.u; const s2 = makeGear('emberRod', 1); st.sub = { u: s2.u, i: 0 }; st.hp = heroStats().hp; st.mp = heroStats().mp;
    window.__log = []; const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { window.__log.push(t); return yield* _m.call(this, t, o); };
    let n = 0; const seq = () => { const L = wsList(st); return ['attack', L[0], 'attack', L[1], 'attack', L[2], 'attack', 'attack'][n++ % 8]; };
    G.Game.autoPlay = b => { if (n < 30) b.F.hp = b.F.maxhp; else b.F.hp = Math.min(b.F.hp, 5); st.hp = heroStats().hp; return { type: 'move', id: seq() }; }; Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'mossGiant', lv: 12, kind: 'elite', id: 'mossGiant' })); });
  for (let i = 0; i < 6000; i++) { const sc = await g.ev(() => __game.Game.scene.constructor.name); if (sc !== 'Battle' && i > 50) break; if (i === 400) await g.shot('v93_battle'); await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(3); }); }
  g.log(await g.ev(() => { const st = __game.Game.st; return window.__log.slice(-22).join('\n') + '\n-- skx ' + JSON.stringify(st.skx) + ' bp ' + JSON.stringify(st.bp) + ' bpT ' + JSON.stringify(st.bpT) + ' gear ' + st.gear.map(x => x.b).join(','); }));
};
