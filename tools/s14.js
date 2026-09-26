module.exports = async (g) => {
  await g.press('a', 30); await g.press('a', 60);
  for (let i = 0; i < 40; i++) { const u = await g.ui(); if (u.includes('小晨/阿勇/凱/光/自己輸入')) break; await g.press('a', 24); }
  await g.ev(() => { const m = __game.UI.stack.find(w => w.items); m.i = 4; }); await g.press('a', 10);
  const vis = await g.ev(() => !document.getElementById('nameBox').hidden);
  await g.ev(() => { document.getElementById('nameField').value = '莉亞Lia'; document.getElementById('nameForm').requestSubmit(); });
  await g.step(20); await g.shot('n_confirm');
  await g.press('a', 20); for (let i = 0; i < 10; i++) await g.press('a', 24); await g.step(120); await g.shot('n_home');
  g.log('box shown:', vis, 'name:', await g.ev(() => __game.Game.st && __game.Game.st.name));
};
