// v9 real-battle class probe: all 10 classes (first weapon kind, best forgeable weapon at tier 紫+2, talents spent,
// 3 megaPotion + 2 hiEther) vs 1 elite + 4 bosses with the smart AI. Prints win / hp% left / hero turns.
module.exports = async (g) => {
  const FIGHTS = [['wraithGeneral', 23, 'elite'], ['ratKing', 27, 'boss'], ['clockColossus', 31, 'boss'], ['frostQueen', 34, 'boss'], ['shadowGeneral', 40, 'boss']];
  const only = process.env.CLS ? process.env.CLS.split(',') : null;
  const rows = [];
  const classes = await g.ev(() => V7_CLASSES);
  for (const cls of classes) { if (only && !only.includes(cls)) continue; for (const [sp, blv, kd] of FIGHTS) {
    await g.ev(([cls, sp, blv, kd, Q, E]) => {
      const pick = (pred, t, score) => { let best = null, bs = -1; for (const k in GEAR) { const G = GEAR[k]; if (!pred(G, k) || BP_RARE.has(k) || G.t > t) continue; const v = G.t * 1000 + score(gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st); if (v > bs) { bs = v; best = k; } } return best; };
      const G = __game, lv = blv - 1; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1, golem: 1, ch2: 5 }); st.lv = lv; st.exp = expForLevel(lv); st.map = 'capital'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      if (CLASS_FREE[cls]) applyStartClass(cls); else { applyStartClass('swordsman'); st.cls = cls; } st.flags.deep = 1;
      attrAuto(st); for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
      const t = clamp(smithRank({ lv }), 1, 7), kind = CLASS_V7[cls].w[0];
      const wk = pick(G2 => G2.slot === 'weapon' && G2.kind === kind, t, s => Math.max(s.atk || 0, s.spa || 0)); const wg = makeGear(wk, Q); wg.e = E; st.equip.weapon = wg.u;
      for (const [slot, sl] of [['head', 'head'], ['body', 'body'], ['feet', 'feet'], ['acc', 'acc1']]) { const k = pick((G2, k2) => G2.slot === slot && GEAR_RECIPE[k2], t, s => (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 2); if (k) { const g2 = makeGear(k, Q); g2.e = E; st.equip[sl] = g2.u; } }
      st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag = { megaPotion: 3, hiEther: 2 };
      window.__turns = 0; if (!Battle.prototype.__cnt) { const _u = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t2, id) { if (u === this.H) window.__turns++; return yield* _u.call(this, u, t2, id); }; Battle.prototype.__cnt = 1; }
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: blv, kind: kd, id: sp }));
    }, [cls, sp, blv, kd, +(process.env.Q || 2), +(process.env.E || 2)]);
    const hp0 = await g.ev(() => __game.Game.st.hp); await g.autoBattle('smart');
    rows.push(await g.ev(([c, sp, hp0]) => [c, sp, Math.round(__game.Game.st.hp / hp0 * 100), window.__turns], [cls, sp, hp0]));
  } }
  const R = {}; for (const [c, sp, hp, tn] of rows) (R[c] = R[c] || []).push(sp.slice(0, 6) + (hp > 0 ? ' ' + hp + '%' : ' LOSE') + '/' + tn + 't');
  g.log(Object.entries(R).map(([k, L]) => k.padEnd(12) + ' win ' + L.filter(v => !v.includes('LOSE')).length + '/' + L.length + ' | ' + L.join(' | ')).join('\n'));
};
