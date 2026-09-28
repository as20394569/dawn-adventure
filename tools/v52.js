// capture frames while a monster is hit (debug for sprites bleeding at the left edge)
module.exports = async (g) => {
  const sp = process.env.SP || 'slime';
  await g.ev((sp) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear();
    G.Game.autoPlay = b => ({ type: 'move', id: 'slash' }); Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
    ow.run(ow.battleScript({ sp, lv: 5, kind: 'wild' })); }, sp);
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  await g.ev(() => { const b = __game.Game.scene; b.F.maxhp = b.F.hp = 9999; });
  let n = 0, hp0 = 9999, hit = -1;
  for (let i = 0; i < 600 && n < 21; i++) {
    const hp = await g.ev(() => { const b = __game.Game.scene; return b.F ? b.F.hp : -1; });
    if (hit < 0 && hp !== hp0) hit = i;
    if (hit >= 0 && (i - hit) % 2 === 0) { await g.shot('hit_' + sp + '_' + String(n).padStart(2, '0')); n++; }
    await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(1); });
  }
};
