// v11 battle core tests (docs/battle_v2_design.md §H) — node tools/play.js tools/btest.js [--sims]
// Runs headless inside the built test page: data validation, skill unit tests, event-chain rules, loop limits,
// determinism, and (with --sims) build simulations written to docs/balance_report.md.
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const res = await g.ev(() => {
    const out = [], ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (!cond && info ? ' — ' + info : ''));
    const err0 = BV2.errors.length, v = bvValidate(); ok('資料驗證（id、引用、標籤、觸發、效果、循環）', v.length === 0, v.slice(0, 6).join(' | ')); ok('載入時沒有錯誤', err0 === 0, BV2.errors.slice(0, 4).join(' | '));
    const T = (id, d) => { defPut('skills', id, { name: id, desc: '', tags: ['skill', 'phys', 'el:一般', 'damage'], el: '一般', cat: '物', power: 60, acc: null, critX: 1, prio: 0, target: 'enemy', chain: false, effects: [{ type: 'damage' }], after: [], mods: [], costs: [], hits: null, charge: false, airborne: false, pierceDef: 0, noHitRoll: false, fx: 'hit', fallback: null, usage: null, ai: { pow: 60 }, metadata: {}, ...d }); return id; };
    const hero = (o = {}) => ({ id: 'H', side: 'A', hero: true, name: '勇者', lv: 20, kind: 'hero', stats: { hp: 300, mp: 40, atk: 60, def: 50, spa: 60, spd: 50, spe: 50, crit: 0, hit: 0, eva: 0, resist: {} }, hp: 300, mp: 40, passives: [], skills: ['attack'], sig: false, wsp: null, chi: false, comboMax: 0, statuses: [], data: { mechanics: [], attackSkill: 'attack', slots: [] }, ...o });
    const foe = (id, o = {}) => ({ id, side: 'B', name: id, lv: 20, kind: 'wild', sp: 'slime', fam: 'ooze', stats: { hp: 400, atk: 40, def: 50, spa: 40, spd: 50, spe: 30, crit: 0, hit: 0, eva: 0 }, passives: [], skills: [T('t_poke', { power: 10 })], statuses: [], data: { mechanics: [], profile: 'brute' }, ...o });
    const mk = (units, seed = 7) => new BattleCore({ seed, units, cfg: {} });
    const cnt = (c, type, f = () => true) => c.log.filter(e => e.type === type && !e.cancelled && f(e)).length;
    const act = (c, skill, targets) => { c.submit({ type: 'skill', skill, targets }); };
    // ---------- skills ----------
    { const c = mk([hero(), foe('B1', { stats: { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 } }), foe('B2')]); c.start(false); act(c, 'attack', ['B1']); if (!c.result) act(c, 'attack', ['B1']);
      ok('目標倒下後改打同陣營下一隻（TARGET_CHANGE）', cnt(c, EVT.TARGET_CHANGE) >= 1 && cnt(c, EVT.DAMAGE, e => e.tgts[0] === 'B2' && e.src === 'H') >= 1); }
    { T('t_cost', { costs: [{ res: 'mp', amount: 99 }], fallback: 'attack' }); const c = mk([hero({ skills: ['attack', 't_cost'] }), foe('B1')]); c.start(false); act(c, 't_cost', ['B1']);
      ok('成本不足 → SKILL_FAIL(cost) 並改用替代技能', cnt(c, EVT.SKILL_FAIL, e => e.payload.why === 'cost') === 1 && cnt(c, EVT.SKILL_USE, e => e.payload.skill === 'attack' && e.src === 'H') === 1);
      const c2 = mk([hero({ skills: ['attack', 't_cost'], mp: 40, stats: { ...hero().stats, mp: 120 } }), foe('B1')]); c2.byId.H.res.mp = 120; c2.start(false); act(c2, 't_cost', ['B1']);
      ok('成本足夠 → COST_PAY + 扣除資源', cnt(c2, EVT.COST_PAY) === 1 && c2.byId.H.res.mp === 21); }
    { T('t_miss', { acc: 1 }); const c = mk([hero({ skills: ['t_miss'], stats: { ...hero().stats, hit: -50 } }), foe('B1')]); c.start(false); for (let i = 0; i < 4 && !c.result; i++) act(c, 't_miss', ['B1']);
      ok('命中率極低 → MISS 事件、沒有傷害', cnt(c, EVT.MISS, e => e.src === 'H') >= 3 && cnt(c, EVT.DAMAGE, e => e.src === 'H') <= 1); }
    { const c = mk([hero({ stats: { ...hero().stats, crit: 100 } }), foe('B1')]); c.start(false); act(c, 'attack', ['B1']);
      ok('會心率100% → CRIT 事件，傷害標記會心', cnt(c, EVT.CRIT) >= 1 && c.log.some(e => e.type === EVT.DAMAGE && e.payload.crit)); }
    { T('t_psn', { power: 0, effects: [{ type: 'status', status: 'psn' }], tags: ['skill', 'support', 'el:毒', 'ailment'], cat: '變', noHitRoll: true });
      const fam = Object.keys(FAMILIES).find(k => FAMILIES[k].immune && FAMILIES[k].immune.includes('psn'));
      const c = mk([hero({ skills: ['t_psn'] }), foe('B1', { fam })]); c.start(false); act(c, 't_psn', ['B1']);
      const c2 = mk([hero({ skills: ['t_psn'] }), foe('B1', { fam: 'beast' })]); c2.start(false); act(c2, 't_psn', ['B1']);
      ok('狀態：免疫失敗 / 一般成功', (!fam || cnt(c, EVT.STATUS_FAIL, e => e.payload.why === 'immune') === 1) && c2.hasStatus(c2.byId.B1, 'psn'), 'fam ' + fam); }
    { T('t_aoe', { target: 'all_enemies', tags: ['skill', 'phys', 'el:一般', 'damage', 'aoe'] }); const one = mk([hero({ skills: ['t_aoe'] }), foe('B1')], 3), three = mk([hero({ skills: ['t_aoe'] }), foe('B1'), foe('B2'), foe('B3')], 3);
      one.start(false); act(one, 't_aoe', []); three.start(false); act(three, 't_aoe', []); const d1 = one.log.find(e => e.type === EVT.DAMAGE && e.src === 'H').payload.amount, d3 = three.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H');
      ok('全體技能：三個目標各受傷，單發約×0.75', d3.length === 3 && d3.every(e => e.payload.amount <= d1 * 0.85 && e.payload.amount >= d1 * 0.6), d1 + ' vs ' + d3.map(e => e.payload.amount).join(',')); }
    { T('t_multi', { hits: [3, 3], tags: ['skill', 'phys', 'el:一般', 'damage', 'multi_hit'] }); const c = mk([hero({ skills: ['t_multi'] }), foe('B1')]); c.start(false); act(c, 't_multi', ['B1']);
      ok('多段：3 段 HIT / DAMAGE', cnt(c, EVT.HIT, e => e.src === 'H') === 3 && cnt(c, EVT.DAMAGE, e => e.src === 'H') === 3);
      const c2 = mk([hero({ skills: ['t_multi'] }), foe('B1', { stats: { ...foe('x').stats, hp: 1 } }), foe('B2')]); c2.start(false); act(c2, 't_multi', ['B1']);
      ok('多段：目標中途倒下就停止', cnt(c2, EVT.DAMAGE, e => e.src === 'H' && e.tgts[0] === 'B1') === 1 && c2.byId.B1.down); }
    // ---------- event chain ----------
    { const c = mk([hero(), foe('B1'), foe('B2')], 11); c.start(true); const ids = new Set(c.log.map(e => e.id));
      ok('每個事件 id 唯一（沒有重複的 MAIN）', ids.size === c.log.length);
      const byId = Object.fromEntries(c.log.map(e => [e.id, e])); ok('parent 都存在，深度不小於 parent', c.log.every(e => !e.parent || (byId[e.parent] ? e.depth >= byId[e.parent].depth : true)));
      ok('戰鬥結束時佇列清空', !!c.result && c.queue.length === 0 && c.reactQ.length === 0); ok('沒有觸發安全上限', c.trace.length === 0, JSON.stringify(c.trace.slice(0, 1))); }
    { defPut('passives', 't_cancel', { make: () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', effects: [{ type: 'cancel', why: 'test' }] }] }), metadata: {}, tags: [] });
      const c = mk([hero(), foe('B1', { passives: [{ key: 't_cancel', v: 1 }] })]); c.start(false); act(c, 'attack', ['B1']);
      ok('PRE 取消：傷害事件被取消、HP 不變', c.byId.B1.res.hp === c.byId.B1.max.hp && c.log.some(e => e.type === EVT.DAMAGE && e.cancelled)); }
    { const L = []; defPut('passives', 't_ord', { make: v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', prio: v, effects: [{ type: 'message', text: 'p' + v, target: 'self' }] }] }), metadata: {}, tags: [] });
      const c = mk([hero({ passives: [{ key: 't_ord', v: 1 }, { key: 't_ord', v: 5 }, { key: 't_ord', v: 3 }] }), foe('B1')]); c.start(false); act(c, 'attack', ['B1']);
      const seq = c.log.filter(e => e.type === EVT.MESSAGE && /^p\d$/.test(e.payload.text || '')).map(e => e.payload.text).slice(0, 3).join(',');
      ok('觸發依 priority 高到低穩定排序', seq === 'p5,p3,p1', seq); }
    // ---------- loops stop at the safety limits ----------
    { defPut('passives', 't_loopA', { make: () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', effects: [{ type: 'damage', flat: 1, target: 'event_target' }] }] }), metadata: {}, tags: [] });
      const c = mk([hero({ passives: [{ key: 't_loopA', v: 1 }] }), foe('B1', { stats: { ...foe('x').stats, hp: 100000 } })]); c.start(false); act(c, 'attack', ['B1']);
      ok('A→A 連鎖在上限停下並留下事件鏈', c.trace.length > 0 && !!c.trace[0].chain, String(c.trace.length)); }
    { defPut('passives', 't_counterAll', { make: () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { ownerAlive: 1 }, effects: [{ type: 'counter', skill: 'counter_strike' }] }] }), metadata: {}, tags: [] });
      const c = mk([hero({ passives: [{ key: 't_counterAll', v: 1 }], stats: { ...hero().stats, hp: 100000 } }), foe('B1', { passives: [{ key: 't_counterAll', v: 1 }], stats: { ...foe('x').stats, hp: 100000 } })]); c.byId.H.res.hp = 100000; c.start(false); act(c, 'attack', ['B1']);
      ok('反擊觸發反擊：反應深度上限 ' + BV2.MAX_REACT, c.trace.some(t => /reaction depth/.test(t.what)) || cnt(c, EVT.REACTION) <= BV2.MAX_REACT * 4, 'reactions ' + cnt(c, EVT.REACTION)); }
    { defPut('passives', 't_resLoop', { make: () => ({ triggers: [{ on: EVT.RESOURCE_CHANGE, phase: 'POST', role: 'tgt', cond: {}, effects: [{ type: 'resource', res: 'mp', amount: 1, target: 'self' }] }] }), metadata: {}, tags: [] });
      const c = mk([hero({ passives: [{ key: 't_resLoop', v: 1 }], stats: { ...hero().stats, mp: 100000 } }), foe('B1')]); c.byId.H.res.mp = 0; c.start(false); c.changeRes(c.byId.H, 'mp', 1);
      ok('資源增加觸發資源增加：在上限停下', c.trace.length > 0, 'mp ' + c.byId.H.res.mp); }
    // ---------- determinism ----------
    { const run = seed => { const c = mk([hero({ skills: ['attack', 't_multi'] }), foe('B1'), foe('B2')], seed); c.start(true); return c.hash(); };
      const a = run(42), b = run(42), d = run(43); ok('同種子同輸入 → 事件雜湊相同', a === b, a + ' / ' + b); ok('不同種子 → 事件雜湊不同', a !== d); }
    // ---------- the real content: every hero class against a few real monsters, no errors ----------
    { const e0 = BV2.errors.length; let n = 0, bad = []; for (const cls of Object.keys(SIG)) { __game.newGameState('測'); const st = Game.st; applyStartClass(['mage', 'bard'].includes(cls) ? 'mage' : 'swordsman'); st.cls = cls; st.lv = 18; st.hp = heroStats().hp; st.mp = heroStats().mp;
        for (const k of ['galeCut', 'fireShot', 'chainLightning', 'mend']) Object.assign(BB.entry(st, k), { learned: true, x: 8 }); st.slots = ['o_galeCut', 'o_fireShot', 'o_chainLightning', 'o_mend'];
        for (const [sp, lv, kind, extra] of [['slime', 16, 'wild', [['mush', 16], ['wolf', 15]]], ['golem', 16, 'boss'], ['banditBoss', 16, 'boss'], ['crystalGolem', 18, 'boss']]) { try { st.hp = heroStats().hp; st.mp = heroStats().mp; st.status = null; const c = BB.build({ sp, lv, kind, extra, seed: 5 + n }, st); c.start(true); n++; if (!c.result || c.trace.length) bad.push(cls + '/' + sp + (c.trace.length ? ' trace' : ' no result')); } catch (e) { bad.push(cls + '/' + sp + ' ' + e.message); } } }
      ok('10 職業 × 真實魔物（多體、頭目腳本）跑完沒有錯誤', !bad.length && BV2.errors.length === e0, bad.slice(0, 4).join(' | ') + ' ' + BV2.errors.slice(e0, e0 + 3).join(' | ') + ' (' + n + ' battles)'); }
    for (const k of Object.keys(DEF.skills)) if (k.startsWith('t_')) delete DEF.skills[k]; for (const k of Object.keys(DEF.passives)) if (k.startsWith('t_')) delete DEF.passives[k];
    return out;
  });
  for (const l of res) g.log(l);
  g.log(res.filter(l => l.startsWith('FAIL')).length ? 'BTEST: FAIL' : 'BTEST: PASS (' + res.length + ' checks)');
  if (!process.argv.includes('--sims')) return;
  // ---------- build simulations → docs/balance_report.md ----------
  const sim = await g.ev(() => {
    const LOAD = { 物理: ['galeCut', 'steelCleaver', 'bladeRain', 'warCry'], 魔法: ['fireShot', 'chainLightning', 'flameVortex', 'manaWall'], 均衡: ['aquaEdge', 'mend', 'focusMind', 'starfall'] };
    const FOES = { 單體: [['wolf', 'wild']], 多體: [['slime', 'wild', [['mush'], ['bee']]]], 高防: [['pebble', 'wild']], 高速: [['bird', 'wild']], 頭目: [['golem', 'boss']] };
    const rows = [], use = {}, N = 6, LV = 20;
    for (const cls of Object.keys(SIG)) for (const ln in LOAD) { const agg = {}; for (const fk in FOES) { const a = agg[fk] = { win: 0, rounds: 0, dealt: 0, taken: 0, heal: 0, events: 0, n: 0 };
      for (let i = 0; i < N; i++) { __game.newGameState('測'); const st = Game.st; applyStartClass(['mage', 'bard'].includes(cls) ? 'mage' : 'swordsman'); st.cls = cls; st.lv = LV;
        for (const k of LOAD[ln]) Object.assign(BB.entry(st, k), { learned: true, x: 8 }); st.slots = LOAD[ln].map(k => 'o_' + k); st.hp = heroStats().hp; st.mp = heroStats().mp; st.status = null;
        const [sp, kind, ex] = FOES[fk][0], lv = kind === 'boss' ? LV - 6 : LV - 2, c = BB.build({ sp, lv, kind, extra: ex ? ex.map(([s]) => [s, lv]) : [], seed: 1000 + i * 7 + cls.length }, st); c.start(true);
        a.n++; if (c.result.outcome === 'win') a.win++; a.rounds += c.round; a.events += c.log.length;
        for (const e of c.log) { if (e.type === EVT.DAMAGE && !e.cancelled) { if (e.src === 'H' && e.tgts[0] !== 'H') a.dealt += e.payload.amount; if (e.tgts[0] === 'H') a.taken += e.payload.amount; } if (e.type === EVT.HEAL && e.tgts[0] === 'H') a.heal += e.payload.amount || 0;
          if (e.type === EVT.SKILL_USE && e.src === 'H') { const k = e.payload.skill; use[k] = (use[k] || 0) + 1; } } } }
      rows.push({ cls, ln, agg }); }
    return { rows, use, N, LV, FOES: Object.keys(FOES), skillNames: Object.fromEntries(Object.keys(DEF.skills).map(k => [k, DEF.skills[k].name])), cls: Object.fromEntries(Object.keys(SIG).map(k => [k, (CLASSES[k] || {}).n || k])) };
  });
  const L = ['# 《曙光冒險》v11 戰鬥平衡報告（自動產生）', '', '由 `node tools/play.js tools/btest.js --sims` 產生。英雄 Lv' + sim.LV + '、初始裝備、四個技能已學會；每組 ' + sim.N + ' 場，由自動策略（招式點滿就用招式、低血補血、多體時用範圍技）操作。', '依規格：不自動改數值，只列出數據與警告。', ''];
  L.push('## 勝率（%）與平均回合', '', '| 職業 | 技能組 | ' + sim.FOES.join(' | ') + ' |', '|---|---|' + sim.FOES.map(() => '---|').join(''));
  for (const r of sim.rows) L.push('| ' + sim.cls[r.cls] + ' | ' + r.ln + ' | ' + sim.FOES.map(f => { const a = r.agg[f]; return Math.round(a.win / a.n * 100) + '（' + (a.rounds / a.n).toFixed(1) + '）'; }).join(' | ') + ' |');
  L.push('', '## 每回合造成／承受傷害', '', '| 職業 | 技能組 | ' + sim.FOES.join(' | ') + ' |', '|---|---|' + sim.FOES.map(() => '---|').join(''));
  for (const r of sim.rows) L.push('| ' + sim.cls[r.cls] + ' | ' + r.ln + ' | ' + sim.FOES.map(f => { const a = r.agg[f], rd = Math.max(1, a.rounds); return Math.round(a.dealt / rd) + '／' + Math.round(a.taken / rd); }).join(' | ') + ' |');
  const tot = Object.values(sim.use).reduce((a, b) => a + b, 0), useL = Object.entries(sim.use).sort((a, b) => b[1] - a[1]);
  L.push('', '## 技能使用率', '', '| 技能 | 次數 | 比例 |', '|---|---|---|'); for (const [k, n] of useL.slice(0, 30)) L.push('| ' + (sim.skillNames[k] || k) + ' | ' + n + ' | ' + (n / tot * 100).toFixed(1) + '% |');
  // warnings: build concentration (one loadout far ahead for a class), abnormal damage (2× the median), unused skills
  const W = [], dpr = sim.rows.map(r => { let d = 0, n = 0; for (const f of sim.FOES) { d += r.agg[f].dealt; n += Math.max(1, r.agg[f].rounds); } return [r, d / n]; }), med = dpr.map(x => x[1]).sort((a, b) => a - b)[Math.floor(dpr.length / 2)];
  for (const [r, v] of dpr) if (v > med * 2) W.push('異常輸出：' + sim.cls[r.cls] + '／' + r.ln + ' 每回合 ' + Math.round(v) + '（中位數 ' + Math.round(med) + '）');
  for (const c of Object.keys(sim.cls)) { const R = sim.rows.filter(r => r.cls === c).map(r => [r.ln, sim.FOES.reduce((a, f) => a + r.agg[f].win / r.agg[f].n, 0) / sim.FOES.length]); R.sort((a, b) => b[1] - a[1]); if (R.length > 1 && R[0][1] - R[1][1] > 0.3) W.push('Build 集中：' + sim.cls[c] + ' 的「' + R[0][0] + '」勝率比其他組高 ' + Math.round((R[0][1] - R[1][1]) * 100) + ' 個百分點'); }
  for (const k of ['galeCut', 'steelCleaver', 'bladeRain', 'warCry', 'fireShot', 'chainLightning', 'flameVortex', 'manaWall', 'aquaEdge', 'mend', 'focusMind', 'starfall']) if (!sim.use['o_' + k]) W.push('使用率 0：' + (sim.skillNames['o_' + k] || k) + '（自動策略從未選用）');
  L.push('', '## 警告', '', ...(W.length ? W.map(w => '- ' + w) : ['- （沒有）']), '');
  fs.writeFileSync(path.resolve('docs/balance_report.md'), L.join('\n')); g.log('balance report: docs/balance_report.md (' + sim.rows.length + ' builds, ' + W.length + ' warnings)');
};
