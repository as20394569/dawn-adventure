module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); G.Game.st.flags.license = 1; G.Game.st.map = 'route'; G.Game.st.x = 5; G.Game.st.y = 37; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'mush', lv: 4, kind: 'wild' })); });
  await g.step(140); await g.press('a', 30);
  const dbg = () => g.ev(() => { const U = __game.UI.stack; const b = __game.Game.scene; return (b.fx ? 'fx' + b.fx.length + ' ' : '') + U.map(w => w.constructor.name + (w.items ? '[' + w.items.map(i => i.t).join('/') + ']i' + w.i : '') + (w.lines ? '"' + w.lines.join('|') + '"' + w.state : '')).join(' ; '); });
  g.log('cmd', await dbg());
  await g.press('a', 10); g.log('fight', await dbg()); await g.shot('c_fight');
  await g.press('a', 2); g.log('sel', await dbg());
  for (let i = 0; i < 10; i++) { await g.step(6); g.log('t' + i, await dbg()); if (i === 2) await g.shot('c_a1'); if (i === 5) await g.shot('c_a2'); if (i === 8) await g.shot('c_a3'); }
};
