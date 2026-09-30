// v10.5 shields: slot, stats, block, one-hand rule, guardian bonus, looks, sources
module.exports = async (g) => {
  g.log('setup', await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; applyStartClass('guardian');
    const w = makeGear('knightSword', 2); st.equip.weapon = w.u; const s0 = heroStats(); const sh = makeGear('knightShield', 2); st.equip.shield = sh.u; const s1 = heroStats();
    st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    return 'slots ' + Object.keys(EQUIP_SLOTS).join(',') + ' | def ' + s0.def + '→' + s1.def + ' spd ' + s0.spd + '→' + s1.spd + ' block ' + s1.block + ' | sig pow ' + skillMove(sigId(st)).pow + ' | orbSlots ' + orbSlots(sh) + ' | shop ' + shopList().filter(k => GEAR[k]).join(',') + ' | craft ' + bpList(1).filter(e => e.k && GEAR[e.k].slot === 'shield').map(e => e.k).join(',') + ' | loot ' + ['golem', 'silverWyrm', 'lavaGiant', 'shadowGeneral'].map(b => LOOT[b].slice(-1)).join(','); }));
  await g.step(10);
  await g.ev(() => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run(equipScreen()); }); await g.step(15); await g.shot('v162_equip');
  await g.ev(() => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run(ow.battleScript({ sp: 'slime', lv: 20 })); }); await g.step(100); await g.shot('v162_battle');
  g.log('block', await g.ev(() => { const b = Game.scene; let n = 0, tot = 0; for (let i = 0; i < 400; i++) { const r = b.calcDamage(b.F, b.H, MOVES.tackle || MOVES.slash); if (r.blocked) n++; tot++; } b.fx.length = 0; return n + '/' + tot + ' blocked (stat ' + b.H.stats.block + ')'; }));
  g.log('two-hand', await g.ev(() => { const st = Game.st; const staff = makeGear('apprenticeStaff', 1); st.equip.weapon = staff.u; const fixed = shieldFix(st); return 'fixed ' + fixed + ' shield ' + st.equip.shield + ' ok ' + shieldOk(st); }));
};
