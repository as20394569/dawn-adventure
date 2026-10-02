/* ===================== v12.0.2 素材來源提示重新整理 =====================
   MAT_SRC (09u) was counted before later files added monsters, so 角兔毛（角兔）, 赤鹿角（赤角鹿・楓林鹿王）and 木材（樹樁怪）had no
   source and the smith's 「還缺：…」 said nothing about where to find them. Counted again here, after every map is in; closed places
   (異界迴廊・星見神殿) are left out so the hint never points at a door that doesn't open. */
{ const CLOSED = ['rift', 'starShrine'], mapN = m => (MAPS[m] && MAPS[m].name || m).replace(/ \d+F$/, '');
  for (const k in MAT_SRC) delete MAT_SRC[k];
  const add = (k, t) => { (MAT_SRC[k] = MAT_SRC[k] || []).includes(t) || MAT_SRC[k].push(t); }, spOf = s => SPECIES[s] && SPECIES[s].mat ? SPECIES[s] : null;
  for (const m in MAPS) { if (CLOSED.includes(m)) continue; const d = MAPS[m];
    for (const e of d.encounters || []) for (const r of e.table || []) { const sp = spOf(r[0]); if (sp) add(sp.mat, sp.n + '・' + mapN(m)); }
    for (const e of d.elites || []) { const sp = spOf(e.sp); if (sp) add(sp.mat, sp.n + '・' + mapN(m)); }
    if (d.boss) { const sp = spOf(d.boss.sp); if (sp) add(sp.mat, sp.n + '・' + mapN(m)); }
    for (const g of d.gathers || []) if (g.mat) add(g.mat, '採集・' + mapN(m)); } }
