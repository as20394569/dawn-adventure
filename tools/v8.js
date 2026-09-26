// UI tour
module.exports = async (g) => {
  await g.step(60); await g.press('a', 30); await g.shot('u_titlemenu');
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 8; st.exp = 405; st.equip.weapon = 'woodSword'; st.bag.woodSword = 1; st.bag.potion = 3; st.bag.antidote = 1; st.status = 'psn'; st.moves = [{ id: 'slash', pp: 35 }, { id: 'aquaBlade', pp: 3 }, { id: 'flameSlash', pp: 25 }, { id: 'focus', pp: 0 }]; st.hp = 20; st.map = 'town'; st.x = 8; st.y = 9; G.UI.clear(); G.startOverworld(); G.Game.fade = 0; });
  await g.step(200);
  const open = async (name, code, steps = 30, after) => {
    await g.ev(code); await g.step(steps); if (after) await after(); await g.shot(name);
    await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); });
    await g.step(4);
  };
  await open('u_say', () => { const ow = __game.Game.scene; ow.run(__game.say('這是一段測試用的對話，文字會一個字一個字地出現在畫面下方的對話框裡。')); }, 120);
  await open('u_sign', () => { const ow = __game.Game.scene; ow.run(__game.say('萌芽鎮　新芽萌發的寧靜小鎮', { style: 'sign' })); }, 80);
  await open('u_ask', () => { const ow = __game.Game.scene; ow.run(__game.yesNo('要記錄目前的冒險進度嗎？')); }, 80);
  await open('u_start', () => { const ow = __game.Game.scene; ow.run(__game.startMenu()); }, 20);
  await open('u_status', () => { const ow = __game.Game.scene; ow.run(__game.summaryScreen()); }, 20);
  await open('u_status2', () => { const ow = __game.Game.scene; ow.run(__game.summaryScreen()); }, 10, async () => { await g.press('right', 10); await g.press('down', 10); });
  await open('u_bag', () => { const ow = __game.Game.scene; ow.run(__game.bagScreen('field')); }, 20, async () => { await g.press('down', 10); });
  await open('u_equip', () => { const ow = __game.Game.scene; ow.run(__game.equipScreen()); }, 20);
  await open('u_opts', () => { const ow = __game.Game.scene; ow.run(__game.optionsScreen()); }, 20);
  await open('u_shop', () => { const ow = __game.Game.scene; ow.run(__game.shopFlow()); }, 80);
  await open('u_shopbuy', () => { const ow = __game.Game.scene; ow.run(__game.shopFlow()); }, 80, async () => { await g.press('a', 20); await g.press('down', 8); });
  await open('u_forget', () => { const ow = __game.Game.scene; ow.run(__game.pickMoveToForget('thunder')); }, 20);
  await open('u_dark', () => { const ow = __game.Game.scene; ow.run(__game.blackText(['……眼前一片漆黑。'])); }, 60);
  // battle: level up window
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'mush', lv: 3, kind: 'wild' })); });
  await g.autoBattle(0, async u => { if (u.includes('Lv.9') || u.includes('升到了')) { await g.press('a', 20); await g.shot('u_lvup'); await g.press('a', 10); await g.shot('u_lvup2'); return 'handled'; } });
};
