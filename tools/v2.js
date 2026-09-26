module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 8; st.exp = Math.floor(0.8 * 512); st.equip.weapon = 'woodSword'; st.bag.woodSword = 1; st.moves = [{ id: 'slash', pp: 35 }, { id: 'aquaBlade', pp: 25 }, { id: 'flameSlash', pp: 25 }, { id: 'focus', pp: 20 }]; st.hp = G.heroStats().hp; st.bag.potion = 3; st.map = 'route'; st.x = 5; st.y = 20; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10); await g.shot('b0_route');
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'fox', lv: 7, kind: 'wild' })); });
  await g.step(25); await g.shot('b1_trans');
  const until = async (pred, maxF = 800) => { for (let i = 0; i < maxF / 4; i++) { if (await g.ev(pred)) return true; const u = await g.ui(); if (u.includes('TextBox') && !u.includes('Menu')) await g.press('a', 2); else await g.step(4); } return false; };
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  await g.step(60); await g.shot('b2_intro');
  await until(() => __game.UI.stack.some(w => w.items && w.items.some(i => i.t === '戰鬥')));
  await g.shot('b3_cmd'); await g.press('a', 6); await g.press('right', 4); await g.shot('b4_moves');
  await g.press('a', 2); for (let i = 0; i < 5; i++) await g.step(5); await g.shot('b5_anim');
  await g.step(20); await g.shot('b6_hit');
  await g.autoBattle(1, async u => { if (u.includes('經驗值')) { await g.step(20); await g.shot('b7_exp'); } });
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'golem', lv: 14, kind: 'boss', bg: 'ruins' })); ow.map.d.battleBg = 'ruins'; });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  await g.step(120); await g.shot('b8_boss');
};
