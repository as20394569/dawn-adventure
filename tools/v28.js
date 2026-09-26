module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.map = 'town'; st.x = 10; st.y = 8; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  const url = await g.ev(() => {
    const c = document.createElement('canvas'), SC = 3; const heads = [null, 'clothCap', 'hunterCap', 'guardHelm', 'knightHelm', 'golemVisor', 'boneHelm', 'minerHelm', 'banditHood'];
    const bodies = ['uniform', 'leather', 'hunterLeather', 'mistCloak', 'frogCloak', 'chainMail', 'scaleArmor', 'stoneMail', 'ruinMail', 'silkRobe', 'runeMantle', 'boneKnightMail'];
    const feets = ['schoolShoes', 'travelBoots', 'mistBoots', 'featherBoots', 'hunterBoots', 'knightGreaves', 'minerBoots', 'shadowBoots', 'ancientGreaves'];
    const wps = ['woodSword', 'knightSword', 'crystalBlade', 'kingsBlade', 'fangDagger', 'practiceWand', 'tideStaff', 'stormStaff', 'grenAxe'];
    c.width = 12 * 17 * SC * 2; c.height = 900; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#3a6a3a'; x.fillRect(0, 0, c.width, c.height);
    const base = { head: null, body: 'uniform', feet: 'school', weapon: null }; let Y = 4;
    const row = (items, mk, label) => { items.forEach((it, i) => { const L = mk(it); const f = heroFramesLook(L); ['down', 'left', 'up'].forEach((d, j) => x.drawImage(f[d][0], (i * 3 + j) * 17 * SC / 1.5, Y, 16 * SC / 1.5, 22 * SC / 1.5)); }); Y += 22 * SC / 1.5 + 6; };
    row(heads, h => ({ ...base, head: h ? GEAR[h].look : null }));
    row(bodies, b => ({ ...base, body: GEAR[b].look }));
    row(feets, b => ({ ...base, feet: GEAR[b].look }));
    row(wps, w => ({ ...base, weapon: GEAR[w].look }));
    row([['knightHelm', 'chainMail', 'knightGreaves', 'knightSword'], ['hunterCap', 'hunterLeather', 'hunterBoots', 'thornStaff'], ['boneHelm', 'boneKnightMail', 'ancientGreaves', 'kingsBlade'], ['banditHood', 'silkRobe', 'shadowBoots', 'emberKnife'], ['minerHelm', 'stoneMail', 'minerBoots', 'grenAxe']], s => ({ head: GEAR[s[0]].look, body: GEAR[s[1]].look, feet: GEAR[s[2]].look, weapon: GEAR[s[3]].look }));
    wps.forEach((w, i) => x.drawImage(heroBattleImgLook(0, { head: GEAR.knightHelm.look, body: 'chain', feet: 'knight', weapon: GEAR[w].look }), i * 76, Y)); Y += 72;
    return c.toDataURL();
  });
  require('fs').writeFileSync('build/i_doll.png', Buffer.from(url.split(',')[1], 'base64'));
  await g.ev(() => { const G = __game, st = G.Game.st; for (const [b, sl] of [['knightHelm', 'head'], ['chainMail', 'body'], ['knightGreaves', 'feet'], ['crystalBlade', 'weapon']]) { const gg = makeGear(b, 2); st.equip[sl] = gg.u; } makeGear('boneHelm', 1); const ow = G.Game.scene; ow.run(G.equipScreen()); });
  await g.step(4); await g.shot('i_equip'); await g.press('a', 10); await g.press('down', 6); await g.shot('i_equip_pick');
  await g.press('b', 8); await g.press('b', 8);
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); }); await g.step(4); await g.shot('i_field');
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'mush', lv: 4, kind: 'wild' })); }); await g.step(200); await g.shot('i_battle');
};
