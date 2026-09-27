module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 18; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    applyStartClass('swordsman'); for (const n of skillTreeOf('swordsman')) st.skills[n.id] = 2; st.skp = 5; });
  // class change through the real classTalk (Lv14 → 劍聖)
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(classTalk()); });
  for (let i = 0; i < 12; i++) await g.press('a', 10); await g.shot('ct_card');
  for (let i = 0; i < 30; i++) { const u = await g.ui(); if (!u) break; if (u.includes('是/否')) await g.press('a', 8); else await g.press('a', 10); }
  g.log(JSON.stringify(await g.ev(() => { const st = __game.Game.st; return { cls: st.cls, inh: st.inh, usable: usableSkills(st), inheritables: inheritables(st) }; })));
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(skillTreeScreen()); }); await g.step(6); await g.shot('ct_tree');
  await g.press('start', 8); await g.step(4); await g.shot('ct_inh');
  await g.press('down', 4); await g.press('a', 6); await g.shot('ct_inh2'); // full → message
  for (let i = 0; i < 3; i++) await g.press('a', 8);
  await g.press('up', 4); await g.press('a', 6); await g.press('down', 4); await g.press('a', 6); await g.shot('ct_inh3');
  await g.press('select', 8); await g.shot('ct_forget'); await g.press('a', 8); await g.press('a', 8); await g.press('a', 8);
  g.log(JSON.stringify(await g.ev(() => { const st = __game.Game.st; return { inh: st.inh, skp: st.skp, skills: st.skills }; })));
  await g.press('b', 8); await g.step(4); await g.shot('ct_tree2'); await g.press('b', 8);
  // battle chooser
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'wolf', lv: 16, kind: 'wild' })); });
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle' && __game.Game.scene.idle !== undefined && __game.UI.stack.some(w => w.items && w.items.some(i => i.t === '技能')))) break; await g.press('a', 10); }
  await g.ev(() => { const m = __game.UI.stack.find(w => w.items && w.items.some(i => i.t === '技能')); if (m) m.i = m.items.findIndex(i => i.t === '技能'); }); await g.press('a', 8); await g.step(4); await g.shot('ct_choose');
  for (let i = 0; i < 9; i++) await g.press('down', 3); await g.step(2); await g.shot('ct_choose2');
  // summary skills page
  await g.ev(() => { const G = __game, ow = G.Game.scene; G.UI.clear(); }); 
};
