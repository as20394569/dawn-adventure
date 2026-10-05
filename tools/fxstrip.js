// node strip.js  KINDS=0,1  ONLY=t_sdEye,sp5_0  TAG=before  → fxs/<TAG>/<skill>.png (frames during the hero's effect + a few after)
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const OUT = path.join(process.env.OUT || '/tmp/fxstrip', process.env.TAG || 'cur'); // frames of each hero skill's effect (and its later hits) fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 760, height: 560 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n')[1])); await p.addInitScript(() => { window.FXTEST = 1; });
  await p.goto('file:///home/claude/dawn/dist/test.html'); await p.waitForTimeout(300); await p.evaluate(() => { __game.Game.paused = true; __game.setScale(2); });
  const ev = (f, a) => p.evaluate(f, a), step = n => ev(n => __game.step(n), n), press = (k, a = 6) => ev(([k, a]) => __game.press(k, 2, a), [k, a]);
  const menuWith = re => ev(re => { const m = __game.UI.stack.find(w => w.items && (new RegExp(re)).test((w.title || '') + w.items.map(i => i.t).join('/'))); return m ? m.items.map(i => i.t) : null; }, re);
  const pick = (re, i) => ev(([re, i]) => { const m = __game.UI.stack.find(w => w.items && (new RegExp(re)).test((w.title || '') + w.items.map(i => i.t).join('/'))); m.i = i; __game.press('a', 2, 6); }, [re, i]);
  for (let i = 0; i < 60 && !(await menuWith('特效測試/一般遊戲')); i++) await press('a', 10); await pick('特效測試/一般遊戲', 0);
  let kinds = null; for (let i = 0; i < 200 && !kinds; i++) { kinds = await menuWith('^特效測試：'); if (!kinds) await step(4); }
  // instrument: is a hero effect playing?
  await ev(() => { const H = __game.Battle.prototype.handlers, _su = H.SKILL_USE; window.__fxD = 0; H.SKILL_USE = function* (e, s, t, P) { const h = s && s.hero; if (h) window.__fxD++; try { return yield* _su.call(this, e, s, t, P); } finally { if (h) window.__fxD--; } }; const _hh = H.HIT; H.HIT = function* (e, s, t, P) { const h = s && s.hero && P.hitIndex > 0; if (h) window.__fxD++; try { return yield* _hh.call(this, e, s, t, P); } finally { if (h) window.__fxD--; } }; });
  const KS = (process.env.KINDS || kinds.map((_, i) => i).join(',')).split(',').map(Number), ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const idsOf = ki => ev(ki => { const K = TREE_KINDS11.filter(k => !TREE11[k].common).concat(COMMON11.filter(k => (TREE11[k].sk || []).length).slice(0, 1)); return K[ki]; }, ki);
  const summary = [];
  for (const ki of KS) {
    for (let i = 0; i < 300 && !(await menuWith('^特效測試：')); i++) await step(4);
    // queue: attack first (row id atk<ki>), then the skills; specials are converted by the test mode
    await ev(() => { window.__q = null; window.__cur = null; __game.Game.autoPlay = bt => { const hu = bt.core.byId.H; if (!window.__q) { const L = hu.skills.filter(id => id !== hu.data.attackSkill); window.__q = [hu.data.attackSkill].concat(L); window.__all = window.__q.slice(); }
        const id = window.__q.shift(); window.__cur = id || null; return id ? { type: 'skill', skill: id } : { type: 'run' }; }; });
    await pick('^特效測試：', ki);
    const frames = {}; let tick = 0, lastCur = null, after = 0;
    for (let i = 0; i < 9000; i++) {
      const s = await ev(() => { const G = __game, tb = G.UI.stack.find(w => w.lines); return { cur: window.__cur, fx: window.__fxD > 0, tb: !!tb, menu: G.UI.stack.some(w => w.items && /^特效測試：/.test(w.title || '')), sc: G.Game.scene.constructor.name }; });
      if (s.menu && i > 30) break;
      if (s.tb && !s.fx && !(s.cur && after < 30 && (frames[s.cur] || { list: [] }).list.length)) { await press('a', 2); continue; }
      await step(1); tick++;
      const cur = s.cur; if (cur !== lastCur) { lastCur = cur; after = 0; }
      if (!cur || s.sc !== 'Battle') continue;
      const key = cur; const want = !ONLY || ONLY.some(o => key.startsWith(o) || o === key);
      if (!want) continue;
      const L = frames[key] || (frames[key] = { n: 0, list: [] });
      if (s.fx) { after = 0; if (tick % 3 === 0 && L.list.length < 32) L.list.push(await ev(() => document.getElementById('screen').toDataURL())); }
      else if (L.list.length && after < 30) { after++; if (after % 6 === 0) L.list.push(await ev(() => document.getElementById('screen').toDataURL())); }
    }
    const all = await ev(() => window.__all || []), names = await ev(ids => ids.map(id => Game.scene && Game.scene.skillName ? id : id), all);
    for (const id in frames) { const d = path.join(OUT, '_' + ki + '_' + id); fs.mkdirSync(d, { recursive: true }); frames[id].list.forEach((u, i) => fs.writeFileSync(path.join(d, String(i).padStart(2, '0') + '.png'), Buffer.from(u.split(',')[1], 'base64'))); summary.push(ki + '_' + id + ' ' + frames[id].list.length); }
  }
  await ev(() => { __game.Game.autoPlay = null; });
  console.log(summary.join('\n')); console.log('ERRORS', errs.length, errs.slice(0, 5).join('\n')); await b.close();
})();
