module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.lv = 8; st.exp = Math.floor(0.8 * 512); st.moves = [{ id: 'slash', pp: 35 }, { id: 'aquaBlade', pp: 25 }, { id: 'flameSlash', pp: 25 }, { id: 'focus', pp: 20 }]; st.hp = G.heroStats().hp; st.map = 'route'; st.x = 5; st.y = 20; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'fox', lv: 7, kind: 'wild' })); });
  const until = async (pred, maxF = 600) => { for (let i = 0; i < maxF / 4; i++) { if (await g.ev(pred)) return true; const u = await g.ui(); if (u.includes('TextBox') && !u.includes('Menu')) await g.press('a', 2); else await g.step(4); } return false; };
  await until(() => __game.UI.stack.some(w => w.items && w.items.some(i => i.t === '技能')));
  await g.press('a', 4);
  await until(() => __game.UI.stack.some(w => w.items && w.items.some(i => i.t === '水流刃')));
  await g.ev(() => { const m = __game.UI.stack.find(w => w.items); m.i = 1; });
  await g.press('a', 2);
  for (let i = 0; i < 14; i++) { await g.step(4); await g.shot('h' + i); }
};
