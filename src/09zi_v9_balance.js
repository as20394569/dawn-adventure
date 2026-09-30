/* ===================== v9.0 (cont.) balance after the class traits / resonance / sets / combo / allies =====================
   Real-battle probe (tools/v143, all 10 classes, first weapon kind, 普通+0 and 優良+2 gear, talents spent, smart AI):
   chapter-2 bosses fell in 2–9 hero turns and the hero ended at 50–100% HP; a few weapon actives were 1.5–1.7× the
   tier's power line (岩角/野豬戰斧「捨身斬」, 連發齒輪槍「全彈發射」, 火槍「超級大砲」), 龍騎士 / 機工士 killed bosses in 1–2 turns,
   while 遊俠 / 吟遊詩人 / 武僧 were the ones that still lost. */

/* ---------- 1) weapon actives: cap the effective power at 1.45× the tier line (tomes excluded: they trade 魔攻 for it) ---------- */
{ const CAP = 1.45;
  for (const k in WSK) { const G = GEAR[k]; if (!G || !G.t || G.kind === '魔導書') continue; const lim = WPOW_FLOOR(G.t) * CAP;
    for (const id of WSK[k].a) { const m = MOVES[id]; if (!m || !m.pow) continue; const eff = m.pow * (m.hits || 1) / (m.charge ? 1.6 : 1);
      if (eff > lim) m.pow = Math.floor(m.pow * lim / eff); } } }

/* ---------- 2) class traits: help the classes that lost, trim the two that deleted bosses ---------- */
Object.assign(CLASS_SIG, {
  ranger: ['獵人直覺', [['speP', 8], ['eva', 4], ['hpP', 6], ['critDmg', 10]]],
  bard: ['旋律', [['chargeCut', 1], ['healUp', 10], ['spaP', 6], ['hpP', 5]]],
  monk: ['氣', [['atkUp', 20], ['atkMp', 2], ['hpP', 10], ['defP', 6]]], // v10: monks fell behind once skills moved to orbs
  dragoon: ['龍之血脈', [['bigUp', 4], ['hpP', 5]]],
  machinist: ['精密機關', [['spcUp', 12], ['atkMp', 1]]],
});

/* ---------- 3) chapter-2 bosses and elites last a little longer (normal; 困難・異界 multiply on top) ---------- */
const V9_TOUGH = { boss: 1.2, elite: 1.1 };
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) {
    const f = _mf(sp, lv, kind), m = lv >= 17 ? V9_TOUGH[kind] : 0; if (!m || !f || !f.stats) return f;
    f.stats.hp = Math.round(f.stats.hp * m); f.hp = f.maxhp = f.stats.hp; return f;
  }; }

/* ---------- 4) the new forgeable tomes also drop where their tier's staves drop ---------- */
for (const m in MAPS) { const P = MAPS[m].gearPool; if (!P) continue; for (const [stf, tome] of [['windStaff', 'sageTome'], ['gearStaff', 'sageTome'], ['glacierStaff', 'frostTome'], ['starStaff', 'starTome']]) if (P.includes(stf) && !P.includes(tome)) P.push(tome); }
