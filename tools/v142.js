// class balance probe v2: every class × its 3 weapon kinds (best forgeable weapon at tier, 紫+2) × 6 fights.
// prints turns-to-kill / hits-to-die per class (best weapon and mean over the 3 kinds). Measurement only.
module.exports = async (g) => {
  const res = await g.ev(() => {
    const pick = (pred, t, score) => { let best = null, bs = -1; for (const k in GEAR) { const G = GEAR[k]; if (!pred(G, k) || BP_RARE.has(k) || G.t > t) continue; const v = G.t * 1000 + score(gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st); if (v > bs) { bs = v; best = k; } } return best; };
    const armorFor = (slot, t) => pick((G, k) => G.slot === slot && GEAR_RECIPE[k], t, s => (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 2);
    const weapFor = (kind, t) => pick(G => G.slot === 'weapon' && G.kind === kind, t, s => Math.max(s.atk || 0, s.spa || 0));
    const FIGHTS = [['blackCatfish', 11, 'elite'], ['wraithGeneral', 23, 'elite'], ['ratKing', 27, 'boss'], ['clockColossus', 31, 'boss'], ['frostQueen', 34, 'boss'], ['shadowGeneral', 40, 'boss']];
    const G = __game, out = [], tot = {};
    for (const cls of V7_CLASSES) {
      const rows = [];
      for (const kind of CLASS_V7[cls].w) {
        const cells = [];
        for (const [sp, blv, kd] of FIGHTS) {
          if (blv < 20 && !CLASS_FREE[cls]) { cells.push(null); continue; }
          const lv = blv - 1; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: lv >= 14 ? 1 : 0 }); st.lv = lv;
          if (CLASS_FREE[cls]) applyStartClass(cls); else { applyStartClass('swordsman'); st.cls = cls; }
          st.flags.deep = lv >= 14 ? 1 : 0; attrAuto(st);
          for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
          const t = clamp(smithRank({ lv }), 1, 7), wk = weapFor(kind, t); if (!wk) { cells.push(null); continue; }
          const wg = makeGear(wk, 2); wg.e = 2; st.equip.weapon = wg.u;
          for (const [slot, sl] of [['head', 'head'], ['body', 'body'], ['feet', 'feet'], ['acc', 'acc1']]) { const k = armorFor(slot, t); if (k) { const g2 = makeGear(k, 2); g2.e = 2; st.equip[sl] = g2.u; } }
          const s = heroStats(); st.hp = s.hp; st.mp = s.mp; const b = new Battle({ sp, lv: blv, kind: kd, id: sp }); const H = b.H, F = b.F;
          const avg = (u, t2, mv) => { let x = 0; for (let i = 0; i < 16; i++) x += b.calcDamage(u, t2, mv).dmg; return x / 16; };
          let best = avg(H, F, MOVES.attack), bid = 'attack'; for (const id of usableSkills(st)) { const m = skillMove(id); if (!m.pow) continue; const v = avg(H, F, m) * (m.hits || 1) * (skillMP(id) > 0 ? 0.92 : 1) / (m.charge ? 2 : 1); if (v > best) { best = v; bid = id + ':' + m.pow + (m.charge ? 'c' : '') + (m.hits ? 'x' + m.hits : ''); } }
          const fm = (F.moves || []).map(q => q.id || q).filter(id => MOVES[id] && MOVES[id].pow && !MOVES[id].charge); const fd = fm.map(id => avg(F, H, MOVES[id])); const fa = fd.length ? fd.reduce((x, y) => x + y, 0) / fd.length : 1;
          cells.push([F.maxhp / Math.max(1, best), H.maxhp / Math.max(1, fa), wk]);
        }
        rows.push([kind, cells]);
      }
      // per fight: best kind (lowest t) and mean
      const line = [cls.padEnd(12)];
      FIGHTS.forEach(([sp], i) => { const c = rows.map(r => r[1][i]).filter(Boolean); if (!c.length) { line.push(sp.slice(0, 8).padEnd(8) + '    -    '); return; }
        const bt = c.reduce((a, b) => a[0] < b[0] ? a : b), mt = c.reduce((a, b) => a + b[0], 0) / c.length; line.push(sp.slice(0, 8).padEnd(8) + ' ' + bt[0].toFixed(1) + '/' + mt.toFixed(1) + 't ' + bt[1].toFixed(1) + 'h'); });
      out.push(line.join(' | '));
      out.push('   ' + rows.map(r => r[0] + ':' + r[1].map(c => c ? c[0].toFixed(1) : '-').join(',')).join('  '));
    }
    return out.join('\n');
  });
  g.log(res);
};
