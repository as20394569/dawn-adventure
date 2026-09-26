module.exports = async (g) => {
  const res = await g.ev(() => {
    const G = __game; const B = G.Battle.prototype; const out = [];
    const heroAt = (lv, eq) => { G.newGameState('x'); const st = G.Game.st; st.lv = lv; Object.assign(st.equip, eq || {}); const s = G.heroStats(st); return { hero: 1, n: 'H', lv, t: null, stats: s, maxhp: s.hp, hp: s.hp, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, status: null }; };
    const mk = (sp, lv, kind) => { const f = makeFoe(sp, lv, kind); return f; };
    function avgDmg(u, t, id, n = 400) { let s = 0; for (let i = 0; i < n; i++) s += B.calcDamage.call({}, u, t, MOVES[id]).dmg; return +(s / n).toFixed(1); }
    const cases = [
      [5, {}, 'mush', 4, 'wild', ['slash', 'flameSlash'], ['tackle', 'absorb']],
      [5, {}, 'pebble', 5, 'wild', ['slash', 'flameSlash'], ['tackle']],
      [7, {}, 'fox', 7, 'wild', ['slash', 'flameSlash', 'aquaBlade'], ['scratch', 'ember']],
      [8, {}, 'wolf', 9, 'elite', ['slash', 'flameSlash', 'aquaBlade'], ['bite', 'quickAttack', 'tackle']],
      [10, {}, 'flower', 11, 'elite', ['flameSlash', 'aquaBlade', 'thunder'], ['vineWhip', 'megaDrain']],
      [11, {}, 'croc', 12, 'elite', ['flameSlash', 'thunder', 'gale'], ['waterGun', 'bite']],
      [12, { weapon: 'ironSword', armor: 'leather' }, 'golem', 14, 'boss', ['aquaBlade', 'leafBlade', 'thunder'], ['rockThrow', 'stomp', 'rockSlide', 'golemFist']],
      [13, { weapon: 'ironSword', armor: 'leather', acc: 'charm' }, 'golem', 14, 'boss', ['aquaBlade', 'leafBlade'], ['rockThrow', 'rockSlide', 'golemFist']],
    ];
    for (const [hl, eq, sp, fl, kind, hm, fm] of cases) {
      const H = heroAt(hl, eq), F = mk(sp, fl, kind);
      const hd = hm.map(m => m + ':' + avgDmg(H, F, m)); const fd = fm.map(m => m + ':' + avgDmg(F, H, m));
      out.push(`H${hl} hp${H.maxhp} spe${H.stats.spe} vs ${sp}${fl} hp${F.maxhp} spe${F.stats.spe} | hero→ ${hd.join(' ')} | foe→ ${fd.join(' ')}`);
    }
    return out.join('\n');
  });
  g.log(res);
};
