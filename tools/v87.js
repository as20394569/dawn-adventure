// frames of 劍舞 (bladeDance) on 狂牙狼 with the aim point marked
module.exports = async (g) => {
  const id = process.env.SK || 'bladeDance', sp = process.env.SP || 'wolf';
  await g.ev(([id, sp]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('ranger'); st.cls = 'shadowdancer'; for (const n of skillTreeOf('shadowdancer')) st.skills[n.id] = 2; st.hp = heroStats().hp; st.mp = heroStats().mp;
    window.__id = id; G.Game.autoPlay = b => { b.F.hp = b.F.maxhp; b.H.hp = b.H.maxhp; st.mp = b.H.mp = b.H.maxmp; return { type: 'move', id: window.__id }; }; Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: 3, kind: 'wild' })); }, [id, sp]);
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  g.log(await g.ev(() => { const b = __game.Game.scene; return 'center ' + JSON.stringify(b.center(b.F)) + ' bb ' + JSON.stringify(b.imgF.bb) + ' foeX ' + b.foeX; }));
  let shots = 0;
  for (let i = 0; i < 500 && shots < 8; i++) {
    const n = await g.ev(() => { const b = __game.Game.scene; return (b.fx || []).filter(p => p.k !== 'dot' && p.k !== 'mote').length; });
    if (n > 2 && (i % 3 === 0)) { await g.ev(() => { const b = __game.Game.scene, C = b.center(b.F); b.fx.push({ k: 'ring', x: C.x, y: C.y, r0: 2, r1: 3, c: '#ff00ff', w: 2, life: 2, t: 0 }); }); await g.shot('bd_' + shots); shots++; }
    await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(2); });
  }
};
