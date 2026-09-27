module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'route'; st.x = 10; st.y = 20; applyStartClass('swordsman');
    for (const n of skillTreeOf('swordsman')) st.skills[n.id] = 3; st.cls = 'berserker'; st.skills.recklessSlash = 2; st.skills.bloodRage = 1; st.skV = 3; delete st.inh; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  const msgs = []; for (let i = 0; i < 12; i++) { const u = await g.ui(); if (u) msgs.push(u.slice(0, 90)); await g.press('a', 12); }
  g.log(msgs.join('\n')); g.log(JSON.stringify(await g.ev(() => { const st = __game.Game.st; return { skV: st.skV, inh: st.inh, usable: usableSkills(st) }; })));
};
