() => { const enc = {}; for (const id in MAPS) for (const e of (MAPS[id].encounters || [])) for (const r of e.table) if (!enc[r[0]] || enc[r[0]].lv > r[1]) enc[r[0]] = { map: id, lv: r[1] };
  const rows = []; const st = __game.Game.st;
  for (const sp in enc) { let core; try { core = BB.build({ sp, lv: enc[sp].lv, kind: 'wild', extra: 0 }, st); } catch (e) { rows.push(sp + ' ERR ' + e.message); continue; }
    const u = core.side('B')[0], H = core.byId.H; if (!u) continue; const tgt = KD.tab(KD.DMG_TGT, u.lv);
    const L = u.skills.map(id => DEF.skills[id]).filter(D => D && D.power).map(D => { let n = 0; try { n = BR.damage(core, u, H, D, { preview: true, noCrit: true }).amount * KD.hitsN(D); } catch (e) {} return [D.id, D.cat, n]; });
    const mx = L.reduce((a, b) => b[2] > a[2] ? b : a, ['', '', 0]); rows.push([sp, enc[sp].map, 'Lv' + u.lv, 'hp ' + u.max.hp, 'tgt ' + tgt.toFixed(1), 'max ' + mx[2] + ' ' + mx[0] + '(' + mx[1] + ')', 'ratio ' + (mx[2] / tgt).toFixed(2), L.map(q => q[2] + q[1]).join('/')].join(' ')); }
  return rows.join('\n'); }
