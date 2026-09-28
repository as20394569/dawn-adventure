// dragoon jump: frames of take-off, airborne, landing
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.cls = 'dragoon'; for (const n of skillTreeOf('dragoon')) st.skills[n.id] = 1; st.hp = heroStats().hp; st.mp = heroStats().mp;
    G.Game.autoPlay = b => { b.F.hp = b.F.maxhp; return { type: 'move', id: 'jump' }; }; Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'wolf', lv: 20, kind: 'wild' })); });
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  const ys = []; let shots = 0, last = null;
  for (let i = 0; i < 900 && shots < 10; i++) {
    const y = await g.ev(() => __game.Game.scene.offH.y); if (y !== last && (y === -320 || y === 0 || (i % 4 === 0))) { if (y !== 0 || last !== 0) { await g.shot('jp_' + shots); ys.push(y); shots++; } } last = y;
    await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(2); });
  }
  g.log('offH.y at shots', ys.join(','));
};
