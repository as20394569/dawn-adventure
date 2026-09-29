module.exports = async (g) => {
  const r = await g.ev(() => { const W = { guardian: 'titanAxe', swordsman: 'duskSword', ranger: 'shadowDagger' };
    const armorFor = (slot, t) => { let best = null, bs = -1; for (const k in GEAR) { const G = GEAR[k]; if (G.slot !== slot || !GEAR_RECIPE[k] || BP_RARE.has(k) || G.t > t) continue; const s = gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st; const v = G.t * 100 + (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 2; if (v > bs) { bs = v; best = k; } } return best; };
    const out = []; for (const cls of ['guardian', 'swordsman', 'ranger']) { const G = __game; G.newGameState('小晨'); const st = G.Game.st, lv = 36; Object.assign(st.flags, { license: 1, woke: 1, deep: 1 }); st.lv = lv; applyStartClass(cls); st.flags.deep = 1; attrAuto(st); for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
      const wg = makeGear(W[cls], 2); wg.e = 2; st.equip.weapon = wg.u; for (const [slot, sl] of [['head', 'head'], ['body', 'body'], ['feet', 'feet'], ['acc', 'acc1']]) { const k = armorFor(slot, 7); if (k) { const g2 = makeGear(k, 2); g2.e = 2; st.equip[sl] = g2.u; } }
      const s = heroStats(); st.hp = s.hp; st.mp = s.mp; const b = new Battle({ sp: 'lavaGiant', lv: 37, kind: 'boss', id: 'lavaGiant' }); const H = b.H, F = b.F; const av = (u, t, m) => { let x = 0; for (let i = 0; i < 30; i++) x += b.calcDamage(u, t, m).dmg; return Math.round(x / 30); };
      out.push(cls + ' HP ' + H.maxhp + ' def ' + H.stats.def + ' spd ' + H.stats.spd + ' | skills ' + usableSkills(st).map(id => MOVES[id].n + ':' + (MOVES[id].pow ? av(H, F, skillMove(id)) : '-')).join(' ') + ' atk:' + av(H, F, MOVES.attack) + ' | learned ' + learnedSkills(st).length + ' | boss HP ' + F.maxhp + ' fist ' + av(F, H, MOVES.m_magmaFist) + ' quake ' + av(F, H, MOVES.m_quake) + ' erupt ' + av(F, H, MOVES.m_eruption)); }
    return out.join('\n'); });
  g.log(r);
};
