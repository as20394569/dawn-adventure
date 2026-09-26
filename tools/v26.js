// realistic boss checks: hero at the simulated arrival level with the matching kit, smart move choice (heal under 45%)
module.exports = async (g) => {
  const cases0 = [['mossGiant', 'elite', 14, 14, 2, 'swordsman', ['powerSlash', 'crossSlash', 'flameSlash', 'leafBlade']], ['banditBoss', 'boss', 16, 16, 2, 'swordmaster', ['powerSlash', 'crossSlash', 'flameSlash', 'heal']], ['boneKnight', 'elite', 23, 23, 4, 'swordmaster', ['powerSlash', 'crossSlash', 'flameSlash', 'heal']]]; const cases = [['wolf', 'elite', 9, 9, 1, 'swordsman', ['slash', 'powerSlash', 'flameSlash', 'focus']], ['croc', 'elite', 13, 13, 1, 'swordsman', ['slash', 'powerSlash', 'thunder', 'aquaBlade']], ['mossGiant', 'elite', 14, 14, 2, 'swordsman', ['powerSlash', 'crossSlash', 'flameSlash', 'leafBlade']],
    ['banditBoss', 'boss', 16, 16, 2, 'swordmaster', ['powerSlash', 'crossSlash', 'flameSlash', 'heal']], ['golem', 'boss', 15, 15, 2, 'swordmaster', ['powerSlash', 'crossSlash', 'aquaBlade', 'heal']], ['golem', 'boss', 15, 13, 2, 'swordsman', ['powerSlash', 'crossSlash', 'aquaBlade', 'leafBlade']],
    ['crystalGolem', 'boss', 19, 20, 3, 'swordmaster', ['powerSlash', 'crossSlash', 'aquaBlade', 'heal']], ['boneKnight', 'elite', 23, 23, 4, 'swordmaster', ['powerSlash', 'crossSlash', 'flameSlash', 'heal']]];
  const KITS = [['woodSword', 'uniform', 'schoolShoes'], ['ironSword', 'clothCap', 'leather', 'travelBoots'], ['knightSword', 'guardHelm', 'chainMail', 'mistBoots'], ['crystalBlade', 'knightHelm', 'chainMail', 'knightGreaves'], ['crystalBlade', 'knightHelm', 'ruinMail', 'knightGreaves']];
  for (const [sp, kind, lv, hlv, kit, cls, moves] of cases) {
    let wins = 0, hpLeft = [], turns = [];
    for (let t = 0; t < 8; t++) {
      await g.ev(([sp, kind, lv, hlv, kit, cls, moves, KITS]) => { const G = __game; G.newGameState('測'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = hlv; st.cls = cls; st.tal = { blade: 3, vital: Math.min(3, hlv - 8) }; st.map = 'route'; st.x = 10; st.y = 20; for (const k in st.equip) st.equip[k] = null; st.gear = []; KITS[kit].forEach((b, i) => { st.gear.push({ u: i + 1, b, q: 2, r: 0.88, e: kit >= 2 ? 2 : 0, a: [] }); st.equip[GEAR[b].slot] = i + 1; }); st.moves = moves.map(id => ({ id, pp: MOVES[id].pp })); G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; st.hp = G.heroStats().hp; const ow = G.Game.scene; ow.run(ow.battleScript({ sp, lv, kind })); }, [sp, kind, lv, hlv, kit, cls, moves, KITS]);
      let turn = 0; for (let k = 0; k < 3; k++) { await g.autoBattle('smart', async u => { if (u.includes('要讓') ) turn++; }); if (await g.ev(() => __game.Game.scene.constructor.name) !== 'Battle') break; }
      const r = await g.ev(() => { const st = __game.Game.st; return [st.map, st.hp, __game.heroStats().hp]; });
      if (r[0] === 'route' && r[1] > 0) { wins++; hpLeft.push(Math.round(r[1] / r[2] * 100) + '%'); } turns.push(turn);
    }
    g.log(sp + ' Lv' + lv + ' vs hero Lv' + hlv + ' (' + cls + ')', 'wins ' + wins + '/8', 'HP left ' + hpLeft.join(','), 'turns ' + turns.join(','));
  }
};
