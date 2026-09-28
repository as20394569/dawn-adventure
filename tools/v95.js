// v7.0 balance probe: turns to win vs typical foes with a class + level-appropriate crafted weapon
module.exports = async (g) => {
  const rows = [];
  for (let rep = 0; rep < 4; rep++) for (const [cls, lv, wpn, sp, flv, kind] of [['swordsman', 6, 'ironSword', 'wolf', 6, 'wild'], ['mage', 6, 'apprenticeStaff', 'wolf', 6, 'wild'], ['ranger', 12, 'stingerDagger', 'croc', 12, 'wild'], ['guardian', 12, 'hatchet', 'mossGiant', 12, 'elite'], ['swordsman', 20, 'moonBlade', 'lizard', 20, 'wild'], ['mage', 20, 'lakeStaff', 'lizard', 20, 'wild'], ['dragoon', 30, 'azureSpear', 'yeti', 26, 'wild'], ['monk', 30, 'tigerClaw', 'yeti', 26, 'wild']]) {
    await g.ev(([cls, lv, wpn, sp, flv, kind]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = lv; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass(['swordsman', 'mage', 'guardian', 'ranger'].includes(cls) ? cls : 'swordsman'); st.cls = cls;
      attrAuto && attrAuto(st); if (typeof CT !== 'undefined') { st.flags.deep = lv >= 14 ? 1 : 0; for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1; } const w = makeGear(wpn, 2); st.equip.weapon = w.u; st.hp = heroStats().hp; st.mp = heroStats().mp; window.__turns = 0; window.__sp = SPECIES[sp] ? sp : 'wolf';
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: window.__sp, lv: flv, kind })); }, [cls, lv, wpn, sp, flv, kind]);
    const hp0 = await g.ev(() => __game.Game.st.hp); const n = await g.autoBattle('smart');
    rows.push(await g.ev(([c, l, w, n, hp0]) => { const st = __game.Game.st; return [c + ' Lv' + l + ' ' + w, Math.round(st.hp / hp0 * 100)]; }, [cls, lv, wpn, n, hp0]));
  }
  const A = {}; for (const [k, v] of rows) (A[k] = A[k] || []).push(v); g.log(Object.entries(A).map(([k, L]) => k + ': win ' + L.filter(v => v > 0).length + '/' + L.length + ' hp% ' + L.join(',')).join('\n'));
};
