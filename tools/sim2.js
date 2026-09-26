module.exports = async (g) => {
  const cfg = JSON.parse(process.env.SIMCFG || '{}');
  const res = await g.ev((cfg) => {
    const G = __game; const B = G.Battle.prototype; const out = [];
    if (cfg.patch) eval(cfg.patch);
    const heroAt = (lv, eq, moves) => { G.newGameState('x'); const st = G.Game.st; st.lv = lv; Object.assign(st.equip, eq || {}); const s = G.heroStats(st); return { hero: 1, n: 'H', lv, t: null, stats: s, maxhp: s.hp, hp: s.hp, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, status: null, moves }; };
    function fight(hl, eq, hm, sp, fl, kind, pots, supers) {
      const H = heroAt(hl, eq, hm), F = makeFoe(sp, fl, kind); const ctx = { F, H, phase2: false, fistCD: 2 };
      let p = pots, s = supers, turns = 0, used = 0;
      const dmgOf = (u, t, id) => { const mv = MOVES[id]; if (!mv.pow) return 0; let tot = 0; for (let i = 0; i < 6; i++) tot += B.calcDamage.call(ctx, u, t, mv).dmg; return tot / 6 * (mv.acc || 100) / 100; };
      const spe = b => b.stats.spe * stageMul(b.stages.spe) * (b.status === 'par' ? 0.25 : 1);
      const act = (u, t, id) => {
        const mv = MOVES[id];
        if (u.status === 'slp') { if (u.sleepT <= 0) u.status = null; else { u.sleepT--; return; } }
        if (u.flinched) return; if (u.status === 'par' && Math.random() < 0.25) return;
        if (mv.charge && u.charging !== id) { u.charging = id; return; } if (u.charging === id) u.charging = null;
        const self = !mv.pow && mv.stat && mv.stat.who === 'self' || mv.heal; if (!self && mv.acc && Math.random() * 100 >= mv.acc) return;
        if (mv.pow) { let d = B.calcDamage.call(ctx, u, t, mv).dmg; if (t.defending) d = Math.max(1, Math.floor(d / 2)); d = Math.min(d, t.hp); t.hp -= d; if (mv.drain) u.hp = Math.min(u.maxhp, u.hp + Math.floor(d * mv.drain)); if (t.hp > 0 && mv.eff && Math.random() * 100 < mv.eff.p) { if (mv.eff.st && !t.status && !(t.t && IMMUNE[mv.eff.st] === t.t)) { t.status = mv.eff.st; if (t.status === 'slp') t.sleepT = 1 + Math.floor(Math.random() * 3); } if (mv.eff.flinch) t.flinched = true; if (mv.eff.stat) for (const k in mv.eff.stat) t.stages[k] = Math.max(-6, t.stages[k] + mv.eff.stat[k]); } if (t.boss && !ctx.phase2 && t.hp > 0 && t.hp < t.maxhp * 0.5) { ctx.phase2 = true; ctx.fistCD = 1; t.stages.atk += 1; } return; }
        if (mv.heal) { u.hp = Math.min(u.maxhp, u.hp + Math.floor(u.maxhp * mv.heal)); return; }
        if (mv.stat) { const who = mv.stat.who === 'self' ? u : t; for (const k in mv.stat) if (k !== 'who') who.stages[k] = Math.max(-6, Math.min(6, who.stages[k] + mv.stat[k])); return; }
        if (mv.st && !t.status && !(t.t && IMMUNE[mv.st] === t.t)) { t.status = mv.st; if (mv.st === 'slp') t.sleepT = 1 + Math.floor(Math.random() * 3); }
      };
      while (turns < 60) {
        turns++; H.flinched = F.flinched = false;
        // hero policy
        let ha;
        if (F.charging) ha = { type: 'defend' };
        else if (H.hp < H.maxhp * 0.38 && (s > 0 || p > 0)) ha = { type: 'item' };
        else { let best = hm[0], bv = -1; for (const m of hm) { const v = dmgOf(H, F, m); if (v > bv) { bv = v; best = m; } } if (hm.includes('focus') && H.stages.spa < 1 && turns <= 2 && F.boss) best = 'focus'; ha = { type: 'move', id: best }; }
        const fa = B.foeChoose.call(ctx);
        H.defending = ha.type === 'defend';
        const hp = ha.type === 'item' ? 6 : ha.type === 'defend' ? 5 : (MOVES[ha.id].prio || 0), fp = MOVES[fa.id].prio || 0;
        const heroFirst = hp !== fp ? hp > fp : spe(H) !== spe(F) ? spe(H) > spe(F) : Math.random() < 0.5;
        const seq = heroFirst ? ['H', 'F'] : ['F', 'H'];
        for (const w of seq) {
          if (H.hp <= 0 || F.hp <= 0) break;
          if (w === 'H') { if (ha.type === 'item') { if (s > 0 && H.maxhp - H.hp > 25) { s--; H.hp = Math.min(H.maxhp, H.hp + 60); } else if (p > 0) { p--; H.hp = Math.min(H.maxhp, H.hp + 20); } else if (s > 0) { s--; H.hp = Math.min(H.maxhp, H.hp + 60); } used++; } else if (ha.type === 'move') act(H, F, ha.id); }
          else act(F, H, fa.id);
        }
        for (const b of [H, F]) if (b.hp > 0 && (b.status === 'psn' || b.status === 'brn')) b.hp = Math.max(0, b.hp - Math.max(1, Math.floor(b.maxhp / (b.boss ? 16 : 8))));
        if (F.hp <= 0) return { win: 1, turns, used, hpLeft: H.hp / H.maxhp };
        if (H.hp <= 0) return { win: 0, turns, used, hpLeft: 0 };
      }
      return { win: 0, turns, used, hpLeft: 0 };
    }
    const cases = cfg.cases || [
      ['wild low', 5, {}, ['slash', 'glare', 'flameSlash'], 'mush', 4, 'wild', 0, 0],
      ['wild pebble', 5, {}, ['slash', 'glare', 'flameSlash'], 'pebble', 5, 'wild', 0, 0],
      ['wild bird', 6, {}, ['slash', 'glare', 'flameSlash', 'focus'], 'bird', 5, 'wild', 0, 0],
      ['wild fox', 7, {}, ['slash', 'aquaBlade', 'flameSlash', 'focus'], 'fox', 7, 'wild', 0, 0],
      ['wild frog8', 9, {}, ['slash', 'aquaBlade', 'flameSlash', 'focus'], 'frog', 8, 'wild', 0, 0],
      ['wolf L8', 8, {}, ['slash', 'aquaBlade', 'flameSlash', 'focus'], 'wolf', 8, 'elite', 3, 0],
      ['wolf L8 nopot', 8, {}, ['slash', 'aquaBlade', 'flameSlash', 'focus'], 'wolf', 8, 'elite', 0, 0],
      ['flower L10', 10, {}, ['thunder', 'aquaBlade', 'flameSlash', 'focus'], 'flower', 11, 'elite', 3, 0],
      ['croc L11', 11, {}, ['thunder', 'aquaBlade', 'flameSlash', 'gale'], 'croc', 12, 'elite', 3, 0],
      ['croc L11 sword', 11, { weapon: 'ironSword' }, ['thunder', 'aquaBlade', 'flameSlash', 'gale'], 'croc', 12, 'elite', 3, 0],
      ['boss L12 basic', 12, {}, ['thunder', 'aquaBlade', 'flameSlash', 'gale'], 'golem', 14, 'boss', 4, 1],
      ['boss L12 gear', 12, { weapon: 'ironSword', armor: 'leather' }, ['thunder', 'aquaBlade', 'flameSlash', 'focus'], 'golem', 14, 'boss', 4, 1],
      ['boss L13 gear', 13, { weapon: 'ironSword', armor: 'leather', acc: 'charm' }, ['leafBlade', 'aquaBlade', 'thunder', 'focus'], 'golem', 14, 'boss', 5, 2],
      ['wolf L7', 7, {}, ['slash', 'glare', 'flameSlash', 'focus'], 'wolf', 8, 'elite', 3, 0],
      ['boss L12 gear2', 12, { weapon: 'ironSword', armor: 'leather', acc: 'charm' }, ['thunder', 'aquaBlade', 'gale', 'focus'], 'golem', 14, 'boss', 5, 2],
      ['boss L13 nopot', 13, { weapon: 'ironSword', armor: 'leather' }, ['leafBlade', 'aquaBlade', 'thunder', 'focus'], 'golem', 14, 'boss', 0, 0],
    ];
    for (const c of cases) {
      const [name, hl, eq, hm, sp, fl, kind, pots, sup] = c; let w = 0, t = 0, u = 0, hpl = 0; const N = 400;
      for (let i = 0; i < N; i++) { const r = fight(hl, eq, hm, sp, fl, kind, pots, sup); w += r.win; t += r.turns; u += r.used; hpl += r.hpLeft; }
      out.push(`${name.padEnd(16)} win ${(w / N * 100).toFixed(0).padStart(3)}%  turns ${(t / N).toFixed(1).padStart(4)}  items ${(u / N).toFixed(1)}  hpLeft ${(hpl / Math.max(1, w) * 100).toFixed(0)}%`);
    }
    return out.join('\n');
  }, cfg);
  g.log(res);
};
