// v12 balance simulations (spec v1.1 §13–17) — run with: node tools/play.js tools/btest.js --sims
// Every class × 3 talent builds × 5 monster groups, auto-played. Writes docs/balance_report.md (metrics + warnings) and
// docs/regression_report.md (diff against the last saved metrics, tools/bsims_last.json). Warnings are evidence only: nothing is changed.
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const sim = await g.ev(() => {
    const BUILDS = { 甲: s => TAL12.auto(s, 0), 乙: s => TAL12.auto(s, 1), 混合: s => TAL12.auto(s, (b, t) => (b + t) % 2) };
    const FOES = { 單體: ['wolf', 'wild'], 多體: ['slime', 'wild', [['mush'], ['bee']]], 高防: ['pebble', 'wild'], 高速: ['bird', 'wild'], 頭目: ['golem', 'boss'] };
    const N = 6, LV = 24, rows = [], use = {}, warn = [], traceK = {}, slotted = {};
    for (const cls of Object.keys(DEF.classes)) for (const bn in BUILDS) { const agg = {};
      for (const fk in FOES) { const a = agg[fk] = { n: 0, win: 0, rounds: 0, dealt: 0, taken: 0, heal: 0, maxRound: 0, down: 0, gain: 0, spend: 0, over: 0, ctrl: 0, foeTurns: 0, events: 0 };
        for (let i = 0; i < N; i++) { __game.newGameState('測'); const st = Game.st; applyStartClass(['mage', 'bard'].includes(cls) ? 'mage' : 'swordsman'); st.cls = cls; st.lv = LV; st.flags.deep = 1; st.tal12 = {}; BUILDS[bn](st);
          st.slots = (CLASS_SKILLS12[cls] || []).filter((k, j) => CLASS_SKILL_LV[j] <= LV).slice(-4).map(k => 'o_' + k); st.hp = heroStats().hp; st.mp = heroStats().mp; st.status = null; slotted[cls] = st.slots.concat(DEF.classes[cls].sig);
          const [sp, kind, ex] = FOES[fk], lv = kind === 'boss' ? LV - 6 : LV - 2, c = BB.build({ sp, lv, kind, extra: ex ? ex.map(([s]) => [s, lv]) : [], seed: 1000 + i * 7 + cls.length, maxRounds: 40 }, st); c.cfg.maxRounds = 40; c.start(true);
          const C = DEF.classes[cls], perRound = {}; a.n++; if (c.result.outcome === 'win') a.win++; a.rounds += c.round; a.events += c.log.length; if (c.byId.H.down) a.down++;
          for (const e of c.log) { if (e.cancelled) continue;
            if (e.type === EVT.DAMAGE) { if (e.src === 'H' && e.tgts[0] !== 'H') { a.dealt += e.payload.amount; perRound[e.round] = (perRound[e.round] || 0) + e.payload.amount; } if (e.tgts[0] === 'H') a.taken += e.payload.amount; if (!(e.payload.amount < 1e5)) warn.push('數值溢位：' + cls + ' 傷害 ' + e.payload.amount); }
            if (e.type === EVT.HEAL && e.tgts[0] === 'H') a.heal += e.payload.amount || 0;
            if (C.res && e.type === EVT.RESOURCE_CHANGE && e.tgts[0] === 'H' && e.payload.res === C.res) { if (e.payload.change > 0) a.gain += e.payload.change; else a.spend -= e.payload.change; }
            if (C.res && e.type === EVT.RESOURCE_OVERFLOW && e.tgts[0] === 'H' && e.payload.res === C.res) a.over += e.payload.over;
            if (e.type === EVT.ACTION_START && e.src && e.src !== 'H' && !e.payload.reaction) a.foeTurns++;
            if (e.type === EVT.ACTION_CANCEL && e.src && e.src !== 'H' && e.payload.status) a.ctrl++;
            if (e.type === EVT.SKILL_USE && e.src === 'H') { const k = e.payload.skill; use[k] = (use[k] || 0) + 1; } }
          a.maxRound = Math.max(a.maxRound, ...Object.values(perRound), 0);
          for (const t of c.trace) traceK[t.what.replace(/ .*/, '')] = (traceK[t.what.replace(/ .*/, '')] || 0) + 1;
          if (c.round >= 5 && !c.log.some(e => e.type === EVT.DAMAGE && e.tgts[0] === 'H' && e.payload.amount > 0)) warn.push('無敵？' + cls + '／' + bn + '／' + fk + ' 整場沒有受到傷害（' + c.round + ' 回合）');
          for (const f of c.side('B')) { const dr = (c.log.find(e => e.type === EVT.DOWN && !e.cancelled && e.tgts[0] === f.id) || { round: c.round }).round; if (dr >= 4 && !c.log.some(e => e.type === EVT.ACTION_END && e.src === f.id && e.payload.executed)) warn.push('永久控制？' + cls + '／' + bn + '／' + fk + ' ' + f.name + ' 活了 ' + dr + ' 回合卻一次都沒有行動'); } } }
      rows.push({ cls, bn, agg }); }
    const tables = slotted;
    return { rows, use, N, LV, FOES: Object.keys(FOES), BUILDS: Object.keys(BUILDS), warn: [...new Set(warn)].slice(0, 40), traceK, tables, skillNames: Object.fromEntries(Object.keys(DEF.skills).map(k => [k, DEF.skills[k].name])), cls: Object.fromEntries(Object.keys(DEF.classes).map(k => [k, (CLASSES[k] || {}).n || k])) };
  });
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0, f1 = x => x.toFixed(1), metric = {};
  const L = ['# 《曙光冒險》v12 戰鬥平衡報告（自動產生）', '', '`node tools/play.js tools/btest.js --sims`。英雄 Lv' + sim.LV + '、天賦點滿上限（三種配點：甲＝每層選 A、乙＝每層選 B、混合）、職業技能表最後 4 招；每組 ' + sim.N + ' 場，自動策略操作，最多 40 回合。', '只產生數據與警告，不修改任何資料（規格 §17）。', ''];
  L.push('## 勝率%（平均回合）', '', '| 職業 | 配點 | ' + sim.FOES.join(' | ') + ' |', '|---|---|' + sim.FOES.map(() => '---|').join(''));
  for (const r of sim.rows) { L.push('| ' + sim.cls[r.cls] + ' | ' + r.bn + ' | ' + sim.FOES.map(f => { const a = r.agg[f]; metric[r.cls + '/' + r.bn + '/' + f] = { win: pct(a.win, a.n), dpr: Math.round(a.dealt / Math.max(1, a.rounds)) }; return pct(a.win, a.n) + '（' + f1(a.rounds / a.n) + '）'; }).join(' | ') + ' |'); }
  L.push('', '## 每回合造成／承受傷害、最高單回合傷害、陣亡率', '', '| 職業 | 配點 | ' + sim.FOES.join(' | ') + ' |', '|---|---|' + sim.FOES.map(() => '---|').join(''));
  for (const r of sim.rows) L.push('| ' + sim.cls[r.cls] + ' | ' + r.bn + ' | ' + sim.FOES.map(f => { const a = r.agg[f], rd = Math.max(1, a.rounds); return Math.round(a.dealt / rd) + '／' + Math.round(a.taken / rd) + '・峰' + a.maxRound + '・亡' + pct(a.down, a.n) + '%'; }).join(' | ') + ' |');
  L.push('', '## 核心資源（產生／消耗／溢出，每場平均）與控制覆蓋率', '', '| 職業 | 配點 | 產生 | 消耗 | 溢出 | 控制覆蓋 |', '|---|---|---|---|---|---|');
  for (const r of sim.rows) { const s = k => sim.FOES.reduce((x, f) => x + r.agg[f][k], 0), n = sim.FOES.reduce((x, f) => x + r.agg[f].n, 0); const has = !['ranger', 'machinist'].includes(r.cls); L.push('| ' + sim.cls[r.cls] + ' | ' + r.bn + ' | ' + (has ? f1(s('gain') / n) + ' | ' + f1(s('spend') / n) + ' | ' + f1(s('over') / n) : '—（獵印／砲台是狀態） | — | —') + ' | ' + pct(s('ctrl'), s('foeTurns')) + '% |'); }
  const tot = Object.values(sim.use).reduce((a, b) => a + b, 0), useL = Object.entries(sim.use).sort((a, b) => b[1] - a[1]);
  L.push('', '## 技能使用率（前 30）', '', '| 技能 | 次數 | 比例 |', '|---|---|---|'); for (const [k, n] of useL.slice(0, 30)) L.push('| ' + (sim.skillNames[k] || k) + ' | ' + n + ' | ' + (n / tot * 100).toFixed(1) + '% |');
  // automatic warnings (§16)
  const W = sim.warn.slice(), dpr = sim.rows.map(r => { let d = 0, n = 0; for (const f of sim.FOES) { d += r.agg[f].dealt; n += Math.max(1, r.agg[f].rounds); } return [r, d / n]; }), med = dpr.map(x => x[1]).sort((a, b) => a - b)[Math.floor(dpr.length / 2)];
  for (const [r, v] of dpr) if (v > med * 2) W.push('異常輸出：' + sim.cls[r.cls] + '／' + r.bn + ' 每回合 ' + Math.round(v) + '（中位數 ' + Math.round(med) + '）');
  for (const c of Object.keys(sim.cls)) { const R = sim.rows.filter(r => r.cls === c); for (const a of R) for (const b of R) if (a !== b && sim.FOES.every(f => a.agg[f].win / a.agg[f].n >= b.agg[f].win / b.agg[f].n + 0.15)) W.push('Build 支配：' + sim.cls[c] + ' 的「' + a.bn + '」在每種魔物都比「' + b.bn + '」勝率高 15% 以上'); }
  for (const c in sim.tables) for (const id of sim.tables[c]) if (!sim.use[id]) W.push('使用率 0：' + sim.cls[c] + '「' + (sim.skillNames[id] || id) + '」（放在技能槽但自動策略從未使用）');
  for (const f of sim.FOES) { const wins = sim.rows.filter(r => r.agg[f].win > 0); if (!wins.length) W.push('敵人無解？「' + f + '」所有職業與配點都沒贏過'); else if (wins.length === 1) W.push('敵人唯一解？「' + f + '」只有 ' + sim.cls[wins[0].cls] + '／' + wins[0].bn + ' 贏過'); }
  for (const k in sim.traceK) W.push('安全上限觸發：' + k + ' ×' + sim.traceK[k] + '（可能是循環、無限追加／反擊／資源）');
  L.push('', '## 自動警告', '', ...(W.length ? W.map(w => '- ' + w) : ['- （沒有）']), '');
  fs.writeFileSync(path.resolve('docs/balance_report.md'), L.join('\n'));
  // regression report: compare with the last saved metrics
  const lastF = path.resolve('tools/bsims_last.json'), last = fs.existsSync(lastF) ? JSON.parse(fs.readFileSync(lastF, 'utf8')) : null, diffs = [];
  if (last) for (const k in metric) if (last.metric[k]) { const a = last.metric[k], b = metric[k]; if (Math.abs(a.win - b.win) >= 20 || Math.abs(a.dpr - b.dpr) > Math.max(5, a.dpr * 0.2)) diffs.push('| ' + k + ' | ' + a.win + '% → ' + b.win + '% | ' + a.dpr + ' → ' + b.dpr + ' |'); }
  const newW = last ? W.filter(w => !last.warn.includes(w)) : W, goneW = last ? last.warn.filter(w => !W.includes(w)) : [];
  const R = ['# 回歸報告（自動產生）', '', '- 版本：' + (g.version || 'v12'), '- 模擬：' + sim.rows.length + ' 組 × ' + sim.FOES.length + ' 種魔物 × ' + sim.N + ' 場', '- 基準：' + (last ? '上一次的 tools/bsims_last.json' : '（第一次執行，沒有基準）'), '',
    '## 指標差異（勝率差 ≥20% 或每回合傷害差 >20%）', '', ...(diffs.length ? ['| 組合 | 勝率 | 每回合傷害 |', '|---|---|---|', ...diffs] : ['（沒有）']), '',
    '## 新增的警告', '', ...(newW.length ? newW.map(w => '- ' + w) : ['- （沒有）']), '', '## 已解決的警告', '', ...(goneW.length ? goneW.map(w => '- ' + w) : ['- （沒有）']), '',
    '## 結論', '', diffs.length || newW.length ? '有變化，請對照平衡修改單（docs/balance_changeset.md）確認是否符合預期。' : '和基準一致。', ''];
  fs.writeFileSync(path.resolve('docs/regression_report.md'), R.join('\n'));
  fs.writeFileSync(lastF, JSON.stringify({ metric, warn: W }));
  g.log('balance report: docs/balance_report.md (' + sim.rows.length + ' builds, ' + W.length + ' warnings); regression report: docs/regression_report.md (' + diffs.length + ' diffs)');
};
