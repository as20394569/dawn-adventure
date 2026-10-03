// Round-2 balance check (v12.0.2): heroes with the gear a prepared player has at that point.
// node tools/play.js tools/r2sim.js  → docs/r2_balance.md
// Hero: level as given, talents auto (甲), the class's last 4 class skills, gear = the boss area's best tier (purple, +3) —
// weapon by atk (physical classes) or spa (mage, bard), the best head / body / feet and two accessories of that tier.
// AI: the test AI plus what a player does — 防禦 when a monster is charging (⚠). No items.
module.exports = async (g) => {
  const PROFILE = process.env.PROFILE || 'good', PATCH = process.env.PATCH || '', ONLY = process.env.ONLY || '';
  const res = await g.ev(([PROFILE, PATCH, ONLY]) => { if (PATCH) eval(PATCH);
    const N = 6, MAGIC = ['mage', 'bard'], out = { boss: [], wild: [] };
    const tierOf = L => L < 8 ? 1 : L < 13 ? 2 : L < 17 ? 3 : L < 21 ? 4 : L < 28 ? 5 : L < 36 ? 6 : 7;
    const score = (k, cls, slot) => { const s = GEAR[k].st || {}; if (slot === 'weapon') return MAGIC.includes(cls) ? (s.spa || 0) * 2 + (s.atk || 0) : cls === 'spellblade' ? (s.atk || 0) + (s.spa || 0) : (s.atk || 0) * 2 + (s.spa || 0);
      return Object.values(s).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0); };
    const best = (cls, slot, t, n = 1) => Object.keys(GEAR).filter(k => GEAR[k].slot === slot && GEAR[k].t === t && !/^q[A-Z]/.test(k)).sort((a, b) => score(b, cls, slot) - score(a, cls, slot)).slice(0, n);
    const hero = (cls, lv, t0) => { const t = PROFILE === 'low' ? Math.max(1, t0 - 1) : t0; __game.newGameState('測'); const st = Game.st; applyStartClass(MAGIC.includes(cls) ? 'mage' : 'swordsman'); st.cls = cls; st.lv = lv; st.flags.deep = lv >= 14 ? 1 : 0; st.tal12 = {}; TAL12.auto(st, 0);
      const low = PROFILE === 'low', put = (sl, k) => { if (!k) return; const gr = makeGear(k, low ? 1 : 2); gr.e = low ? 0 : 3; st.equip[sl] = gr.u; };
      put('weapon', best(cls, 'weapon', t)[0]); for (const sl of ['head', 'body', 'feet']) put(sl, best(cls, sl, t)[0]); const A = best(cls, 'acc', t, 2); put('acc1', A[0]); put('acc2', A[1]);
      st.slots = (CLASS_SKILLS12[cls] || []).filter((k, j) => CLASS_SKILL_LV[j] <= lv).slice(-4).map(k => 'o_' + k); st.hp = heroStats().hp; st.mp = heroStats().mp; st.status = null; return st; };
    const _h0 = BAI.hero; // a mage player builds three different sigils before 元素奔流 (the plain test AI bursts at one)
    { const _h2 = _h0; BAI.hero = function (core, u, p) { if (!u.hero || clsV7(u.cls || Game.st.cls) !== 'mage' || core.foesOf(u).some(f => core.hasStatus(f, 'charging'))) return _h2.call(this, core, u, p);
    const foes = core.foesOf(u); if (!foes.length) return _h2.call(this, core, u, p); const t = foes.slice().sort((a, b) => a.res.hp - b.res.hp)[0], L = u.data.sigils || [], sig = u.data.sigSkill;
    const can = id => !!DEF.skills[id] && !core.skillBlock(u, DEF.skills[id], { meta: {} }), el = id => BR.elementOf(core, u, DEF.skills[id]);
    if (L.length >= 3 && sig && can(sig)) return { type: 'skill', skill: sig, targets: [t.id] };
    const E = (u.data.slots || []).filter(id => can(id) && DEF.skills[id].power && el(id) !== '一般' && !L.includes(el(id)));
    if (E.length) { const id = foes.length > 1 ? (E.find(i => DEF.skills[i].target === 'all_enemies') || E[0]) : E[0]; return { type: 'skill', skill: id, targets: [t.id] }; }
    if (L.length >= 1 && sig && can(sig)) return { type: 'skill', skill: sig, targets: [t.id] };
    return _h2.call(this, core, u, p); }; }
    const _h = BAI.hero; BAI.hero = function (core, u, p) { if (core.foesOf(u).some(f => core.hasStatus(f, 'charging')) && !core.hasStatus(u, 'guard') && core.rng.chance(0.9)) return { type: 'defend' }; return _h.call(this, core, u, p); };
    const fight = (cfg, st, seed) => { const c = BB.build({ ...cfg, seed }, st); c.cfg.maxRounds = 40; c.start(true); return { win: c.result && c.result.outcome === 'win', r: c.round, hp: c.byId.H.res.hp / c.byId.H.max.hp }; };
    const CLS = Object.keys(DEF.classes);
    try {
      for (const e of FOE_SPOTS) { if (e.kind !== 'boss' || e.sp === 'starGuardian' || (ONLY && !ONLY.split(',').includes(e.sp))) continue; const t = tierOf(e.lv); const row = { sp: e.sp, n: SPECIES[e.sp].n, lv: e.lv, t, by: {} };
        for (const dl of [0, 3]) for (const cls of CLS) { let w = 0, r = 0; for (let i = 0; i < N; i++) { const st = hero(cls, e.lv + dl, t); const f = fight({ sp: e.sp, lv: e.lv, kind: 'boss', id: e.sp }, st, 900 + i * 31 + cls.length * 7 + dl); if (f.win) w++; r += f.r; } row.by[cls + '+' + dl] = [w, N, r / N]; }
        out.boss.push(row); }
      const WILD = ONLY ? [] : [['jadeCreek', 10], ['sewer', 18], ['northRoad', 24], ['iceCave', 33]];
      for (const [m, lv] of WILD) { const d = MAPS[m], tab = (d.encounters || [])[0] && d.encounters[0].table || []; const sps = tab.map(r => r[0]).filter(s => SPECIES[s]).slice(0, 4); const t = tierOf(lv); const row = { m, lv, sps, by: {} };
        for (const cls of CLS) { let w = 0, r = 0, hp = 0, n = 0; for (const sp of sps) for (let i = 0; i < 3; i++) { const st = hero(cls, lv, t); const multi = i === 2; const f = fight({ sp, lv: lv - 1, kind: 'wild', extra: multi ? [[sp, lv - 1], [sp, lv - 1]] : [] }, st, 300 + i * 17 + cls.length); n++; if (f.win) w++; r += f.r; hp += f.win ? f.hp : 0; } row.by[cls] = [w, n, r / n, hp / Math.max(1, w)]; }
        out.wild.push(row); }
    } finally { BAI.hero = _h0; }
    out.cls = Object.fromEntries(CLS.map(k => [k, (CLASSES[k] || {}).n || k])); return out; }, [PROFILE, PATCH, ONLY]);
  const C = Object.keys(res.cls), L = ['# 第二輪數值檢查（自動產生，tools/r2sim.js，裝備：' + (PROFILE === 'low' ? '低' : '好') + '）', '', '主角：天賦自動（甲）、職業技能最後 4 招、裝備＝' + (PROFILE === 'low' ? '前一個地區最高階的藍色 +0' : '該地區最高階的紫色 +3') + '（武器依職業挑物攻或魔攻）。AI：測試用 AI，魔物蓄力（⚠）時 90% 會防禦，魔導士會先湊三種咒印再放元素奔流，不用道具。每格 6 場。', '',
    '## 頭目勝率（主角等級＝頭目等級／＋3）', '', '| 頭目 | Lv | ' + C.map(k => res.cls[k]).join(' | ') + ' | 平均 |', '|---|---|' + C.map(() => '---|').join('') + '---|'];
  for (const r of res.boss) for (const dl of [0, 3]) { const v = C.map(k => r.by[k + '+' + dl]); const avg = Math.round(v.reduce((a, x) => a + x[0] / x[1], 0) / v.length * 100);
    L.push('| ' + (dl ? '　（+3）' : r.n) + ' | ' + (r.lv + dl) + ' | ' + v.map(x => Math.round(x[0] / x[1] * 100)).join(' | ') + ' | ' + avg + ' |'); }
  L.push('', '## 一般魔物（單隻 ×2、三隻 ×1，各 4 種）：勝率%／平均回合／贏時剩下的 HP%', '', '| 地區 | Lv | ' + C.map(k => res.cls[k]).join(' | ') + ' |', '|---|---|' + C.map(() => '---|').join(''));
  for (const r of res.wild) L.push('| ' + r.m + ' | ' + r.lv + ' | ' + C.map(k => { const x = r.by[k]; return Math.round(x[0] / x[1] * 100) + '／' + x[2].toFixed(1) + '／' + Math.round(x[3] * 100); }).join(' | ') + ' |');
  const cl = C.map(k => { let w = 0, n = 0; for (const r of res.boss) { const x = r.by[k + '+0']; w += x[0]; n += x[1]; } return [res.cls[k], Math.round(w / n * 100)]; }).sort((a, b) => b[1] - a[1]);
  L.push('', '## 各職業對頭目（同等級）的平均勝率', '', cl.map(([n, v]) => n + ' ' + v + '%').join('、'), '');
  if (!PATCH && !ONLY) require('fs').writeFileSync('docs/r2_balance' + (PROFILE === 'low' ? '_low' : '') + '.md', L.join('\n')); g.log(L.join('\n'));
};
