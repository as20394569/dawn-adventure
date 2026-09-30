// v10 phase 2: orbs, signature skill, evolution, enchant, elite moves, 威壓
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; st.exp = expForLevel(20); st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    applyStartClass('swordsman'); attrAuto(st); tcAuto(st, 0);
    const w = makeGear('ironSword' in GEAR ? 'ironSword' : Object.keys(GEAR).find(k => GEAR[k].slot === 'weapon' && GEAR[k].kind === '劍'), 5); st.equip.weapon = w.u;
    const a1 = newOrb('bloodMoon'), a2 = newOrb('bolt'), p1 = newOrb('vigor'); w.o = [a1.u, a2.u]; const body = gearBy(st.equip.body); body.o = [p1.u]; w.en = { t: '火', lv: 2 };
    st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag = { megaPotion: 3, hiEther: 2 }; });
  g.log('list', await g.ev(() => wsList().map(id => skillMove(id).n + '/MP' + skillMP(id)).join(', ')), '| hp', await g.ev(() => heroStats().hp), '| welem', await g.ev(() => heroStats().welem));
  // battle vs an elite: count its moves, use skills
  await g.ev(() => { const ow = Game.scene; ow.script = null; UI.clear(); ow.run(ow.battleScript({ sp: 'lizardChief', lv: 20, kind: 'elite', id: 'lizardChief' })); });
  for (let i = 0; i < 40; i++) { await g.step(10); if (await g.ev(() => Game.scene instanceof Battle && !!Game.scene.F)) break; }
  g.log('elite moves', await g.ev(() => Game.scene.F.moves.map(m => MOVES[m.id].n).join('/')));
  // force-use skills via autoplay: alternate sig and orb
  await g.ev(() => { let n = 0; Game.autoPlay = b => { n++; const L = wsList(); const id = L[n % L.length]; return skillMP(id) <= Game.st.mp ? { type: 'move', id } : { type: 'move', id: 'attack' }; }; });
  for (let i = 0; i < 1500; i++) { const sc = await g.ev(() => Game.scene.constructor.name); if (sc !== 'Battle') break; const u = await g.ui(); if (i === 60) await g.shot('v151_battle'); if (u.includes('TextBox') || u.includes('Menu')) await g.press('a', 4); else await g.step(6); }
  g.log('after battle: orbs', await g.ev(() => Game.st.orbs.map(o => orbDef(o).n + ' x' + o.x + ' e' + o.e.join('')).join(', ')), '| bag', await g.ev(() => JSON.stringify(Game.st.bag)), '| hp', await g.ev(() => Game.st.hp));
  // evolution: push bloodMoon to 12 uses and let the overworld prompt appear
  await g.ev(() => { const o = Game.st.orbs.find(o => o.k === 'bloodMoon'); o.x = 12; o.told = 1; }); await g.step(30); await g.shot('v151_evo'); g.log('ui', await g.ui());
  await g.press('a'); await g.step(20); await g.press('a'); await g.step(30); await g.mash('a', 4);
  g.log('evolved', await g.ev(() => { const o = Game.st.orbs.find(o => o.k === 'bloodMoon'); return orbName(o) + ' ' + o.e.join('') + ' pow ' + skillMove('o_bloodMoon').pow + ' evo ' + JSON.stringify(skillMove('o_bloodMoon').evo); }));
  await g.ev(() => { Game.scene.run(skillTreeScreen()); }); await g.step(10); await g.shot('v151_skills');
};
