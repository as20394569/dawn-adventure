// ch2 balance probe: typical hero at a given level vs ch1/ch2 bosses and wilds
module.exports = async (g) => {
  const out = await g.ev(() => {
    const G = __game, RND = Math.random, rows = [];
    const bySlot = (t, slot, pref) => { const ks = Object.keys(GEAR).filter(k => GEAR[k].t === t && GEAR[k].slot === slot && !GEAR[k].sig && (slot !== 'weapon' || !pref || (GEAR[k].kind || '').includes(pref))); return ks[0]; };
    const sum = k => Object.values(GEAR[k].st || {}).reduce((a, c) => a + c, 0);
    const kit = (t) => ['weapon', 'head', 'body', 'feet', 'acc', 'acc'].map((s, i) => { const ks = Object.keys(GEAR).filter(k => GEAR[k].t === t && GEAR[k].slot === s && GEAR[k].st && !('mp' in GEAR[k].st) && !(GEAR[k].st.spa > (GEAR[k].st.atk || 0)) && (s !== 'weapon' || WEAPON_KINDS.劍.includes(k))).sort((a, b) => sum(b) - sum(a)); return ks[i === 5 ? 1 : 0] || ks[0]; });
    const setup = (lv, t, enh) => { G.newGameState('測'); const st = G.Game.st; st.lv = lv; applyStartClass('swordsman'); st.cls = 'swordmaster'; for (const n of skillTreeOf('swordmaster')) st.skills[n.id] = 2; for (const k in st.equip) st.equip[k] = null; let acc = 0; const K = kit(t); K.forEach((b, j) => { if (!b) return; const gg = makeGear(b, 2); gg.e = enh; const sl = GEAR[b].slot === 'acc' ? (acc++ ? 'acc2' : 'acc1') : GEAR[b].slot; st.equip[sl] = gg.u; }); st.attr = null; attrAuto(st); st.hp = heroStats().hp; st.mp = heroStats().mp; return { st, K }; };
    const measure = (sp, lv, kind, heroLv, t, enh) => {
      const { st, K } = setup(heroLv, t, enh); Math.random = () => 0.5; const b = new Battle({ sp, lv, kind, bg: 'field' });
      const dmgOf = id => { const m = id === 'attack' ? { ...MOVES.attack } : skillMove(id, st); return b.calcDamage(b.H, b.F, m).dmg; };
      const atkD = dmgOf('attack'); let best = atkD; for (const id of usableSkills(st)) { if (!MOVES[id] || !MOVES[id].pow) continue; try { best = Math.max(best, dmgOf(id)); } catch (e) {} }
      const dm = b.F.moves.map(m => MOVES[m.id]).filter(m => m && m.pow && !m.charge).map(m => b.calcDamage(b.F, b.H, m).dmg); Math.random = RND;
      const cm = b.F.moves.map(m => MOVES[m.id]).filter(m => m && m.pow && m.charge).map(m => b.calcDamage(b.F, b.H, m).dmg); const avg = dm.length ? dm.reduce((a, c) => a + c, 0) / dm.length : 0, mx = dm.length ? Math.max(...dm) : 0;
      return [sp, lv, kind, 'H' + heroLv + 't' + t, 'hp' + b.H.maxhp + '/' + b.F.maxhp, 'hitsAtk' + Math.ceil(b.F.maxhp / atkD), 'hitsBest' + Math.ceil(b.F.maxhp / best), 'avg%' + Math.round(avg / b.H.maxhp * 100), 'max%' + Math.round(mx / b.H.maxhp * 100), 'charge%' + cm.map(d => Math.round(d / b.H.maxhp * 100)).join('/')].join(' ');
    };
    const T = [['hydra', 23, 'boss', 23, 4], ['silverWyrm', 20, 'boss', 21, 4], ['boneKnight', 23, 'elite', 23, 4]];
    const C2 = [['ratKing', 27, 'boss', 26, 5], ['harvestGolem', 28, 'boss', 28, 5], ['clockColossus', 31, 'boss', 31, 5], ['frostQueen', 34, 'boss', 34, 6], ['lavaGiant', 37, 'boss', 37, 6], ['victorDemon', 38, 'boss', 38, 6], ['shadowGeneral', 40, 'boss', 40, 7], ['starGuardian', 45, 'boss', 45, 7]];
    for (const [k, l] of [['blackFeather', 25], ['boarKing', 27], ['clockKnight', 30], ['snowBear', 32], ['frostLich', 33], ['youngDragon', 35], ['duskCaptain', 38]]) C2.push([k, l, 'elite', l, l < 30 ? 5 : l < 38 ? 6 : 7]);
    for (const r of T.concat(C2)) rows.push(measure(r[0], r[1], r[2], r[3], r[4], 2));
    // wilds: first table rows of each ch2 map
    for (const m of ['northRoad', 'capSewer', 'goldPlains', 'clockTower1', 'frostField', 'iceCave', 'emberPass', 'lavaTunnel', 'duskFort1', 'starShrine']) { const e = (MAPS[m].encounters || [])[0]; if (!e) continue; const r = e.table[0]; const ml = Math.round((r[1] + r[2]) / 2); rows.push(m + ': ' + measure(r[0], ml, 'wild', ml, ml < 30 ? 5 : ml < 38 ? 6 : 7, 1)); }
    // ch1 wild reference
    for (const m of ['catacomb']) { const e = MAPS[m].encounters[0]; const r = e.table[0]; const ml = Math.round((r[1] + r[2]) / 2); rows.push(m + ': ' + measure(r[0], ml, 'wild', ml, 4, 1)); }
    rows.push('kit5 ' + kit(5).join(',') + ' kit6 ' + kit(6).join(',') + ' kit7 ' + kit(7).join(','));
    return rows.join('\n');
  });
  g.log(out);
};
