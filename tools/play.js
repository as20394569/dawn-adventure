// Scripted playtest: node play.js <scenario.js>
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const scen = require(path.resolve(process.argv[2]));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 760, height: 560 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + '\n' + e.stack)); p.on('console', m => { if (m.type() === 'error' && !m.text().includes('ERR_TUNNEL')) errs.push(m.text()); });
  await p.goto('file://' + path.resolve('dist/test.html')); await p.waitForTimeout(300);
  await p.evaluate(() => { __game.Game.paused = true; __game.setScale(2); });
  const api = {
    ev: (fn, arg) => p.evaluate(fn, arg),
    step: n => p.evaluate(n => __game.step(n), n),
    press: (k, after = 6) => p.evaluate(([k, a]) => __game.press(k, 2, a), [k, after]),
    hold: (k, n) => p.evaluate(([k, n]) => { __game.Input.set(k, true); __game.step(n); __game.Input.set(k, false); __game.step(1); }, [k, n]),
    mash: async (k, times, gap = 8) => { for (let i = 0; i < times; i++) await p.evaluate(([k, g]) => __game.press(k, 2, g), [k, gap]); },
    shot: async name => { const d = await p.evaluate(() => { __game.step(0); return document.getElementById('screen').toDataURL(); }); require('fs').writeFileSync('build/' + name + '.png', Buffer.from(d.split(',')[1], 'base64')); },
    state: () => p.evaluate(() => { const g = __game.Game; return { scene: g.scene && g.scene.constructor.name, st: g.st && { map: g.st.map, x: g.st.x, y: g.st.y, lv: g.st.lv, hp: g.st.hp, exp: g.st.exp, money: g.st.money, flags: g.st.flags, moves: g.st.moves.map(m => m.id + ':' + m.pp), status: g.st.status }, ui: g.ui.stack ? g.ui.stack.length : __game.UI.stack.length, script: !!(g.scene && g.scene.script) }; }),
    log: (...a) => console.log(...a),
    // BFS walk on current map (no warps); returns true if reached
    walkTo: async (tx, ty, run = true) => {
      for (let guard = 0; guard < 400; guard++) {
        const r = await p.evaluate(([tx, ty]) => {
          const ow = __game.Game.scene; if (!ow.p || ow.script) return { busy: !!ow.script };
          const P = ow.p; if (P.x === tx && P.y === ty) return { done: true };
          const key = (x, y) => x + ',' + y; const prev = {}; const q = [[P.x, P.y]]; prev[key(P.x, P.y)] = null;
          const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
          while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break; for (const d in D) { const nx = x + D[d][0], ny = y + D[d][1]; if (prev[key(nx, ny)] !== undefined) continue; if (nx < 0 || ny < 0 || nx >= ow.map.w || ny >= ow.map.h) continue; const c = ow.tileAt(nx, ny); if (c === 'L' || ow.solidAt(nx, ny) || (ow.entityAt(nx, ny, P) && !(nx === tx && ny === ty)) || ow.map.doors[key(nx, ny)]) continue; prev[key(nx, ny)] = [x, y, d]; q.push([nx, ny]); } }
          if (prev[key(tx, ty)] === undefined) return { fail: true };
          let cur = [tx, ty], first = null; while (prev[key(cur[0], cur[1])]) { const [px, py, d] = prev[key(cur[0], cur[1])]; first = d; cur = [px, py]; }
          return { dir: first };
        }, [tx, ty]);
        if (r.done) return true; if (r.fail) { console.log('walkTo fail', tx, ty); return false; }
        if (r.busy) { await p.evaluate(() => __game.press('a', 2, 10)); continue; }
        await p.evaluate(([d, run]) => { const G = __game; const ow = G.Game.scene; const x0 = ow.p.x, y0 = ow.p.y; G.Input.set(d, true); if (run) G.Input.set('b', true); for (let i = 0; i < 40; i++) { if (ow.p.moving && ow.p.prog + ow.p.speed >= (ow.p.jump ? 32 : 16)) { G.Input.set(d, false); G.Input.set('b', false); } G.step(1); if ((ow.p.x !== x0 || ow.p.y !== y0) && !ow.p.moving) break; if (G.Game.scene !== ow || ow.script) break; } G.Input.set(d, false); G.Input.set('b', false); G.step(1); }, [r.dir, run]);
      }
      return false;
    },
    ui: () => p.evaluate(() => __game.UI.stack.map(w => w.constructor.name + (w.items ? '[' + w.items.map(i => i.t).join('/') + ']' : '') + (w.lines ? '"' + w.lines.join('|') + '"' + w.state : '')).join(' ; ')),
    // drive a battle: moveIdx picks move slot; hooks(uiString) may return 'handled'
    autoBattle: async (moveIdx = 0, hook) => {
      await p.evaluate(mi => { const G = __game; G.Game.autoPlay = b => { const st = G.Game.st, H = b.H, F = b.F, L = learnedSkills(st);
        if (mi === 'smart') { if (F.charging) return { type: 'defend' }; const heal = L.find(id => MOVES[id].heal && skillMP(id) <= st.mp); if (st.hp < H.maxhp * 0.45 && heal) return { type: 'move', id: heal }; const bag = st.bag || {}; if (st.hp < H.maxhp * 0.4) { const it = ['superPotion', 'potion'].find(k => bag[k] > 0); if (it) return { type: 'item', id: it }; } if (st.mp < 6 && bag.ether > 0) return { type: 'item', id: 'ether' };
          let best = 'attack', bd = b.calcDamage(H, F, MOVES.attack).dmg; for (const id of L) { const m = skillMove(id); if (!m.pow || skillMP(id) > st.mp) continue; let mm = m; if (st.equip && H.stats.welem && m.t === '一般') mm = { ...m, t: H.stats.welem }; const d = b.calcDamage(H, F, mm).dmg; if (d > bd * 1.15) { bd = d; best = id; } } return { type: 'move', id: best }; }
        const id = L[mi]; return { type: 'move', id: id && skillMP(id) <= st.mp ? id : 'attack' }; }; }, moveIdx);
      for (let w = 0; w < 80; w++) { if (await p.evaluate(() => __game.Game.scene.constructor.name) === 'Battle') break; await p.evaluate(() => { if (__game.UI.stack.some(x => x.lines)) __game.press('a', 2, 4); else __game.step(5); }); }
      for (let i = 0; i < 600; i++) {
        const sc = await p.evaluate(() => __game.Game.scene.constructor.name); if (sc !== 'Battle') return i;
        const u = await p.evaluate(() => __game.UI.stack.map(w => w.constructor.name + (w.items ? '[' + w.items.map(i => i.t).join('/') + ']' : '') + (w.lines ? '"' + w.lines.join('|') + '"' + w.state : '')).join(' ; '));
        if (hook && (await hook(u)) === 'handled') continue;
        if (u.includes('[技能/道具/防禦/逃跑]')) { if (moveIdx === 'smart' && await p.evaluate(() => { const G = __game, b = G.Game.scene; if (!b.F || !b.F.charging) return false; const m = G.UI.stack.find(w => w.items && w.items.some(i => i.t === '防禦')); if (!m) return false; m.i = m.items.findIndex(i => i.t === '防禦'); G.press('a', 2, 4); return true; })) continue; await p.evaluate(() => { const G = __game, m = G.UI.stack.find(w => w.items && w.items.some(i => i.t === '技能')); if (m) m.i = 0; G.press('a', 2, 4); }); await p.evaluate(mi => { const G = __game; const m = G.UI.stack.find(w => w.items && w.items.length <= 4 && !w.items.some(i => i.t === '技能')); if (m) { if (mi === 'smart') { const st = G.Game.st, hs = G.heroStats(); const ms = st.moves; let pickI = -1; const hi = ms.findIndex(q => (q.id === 'heal' || q.id === 'holyLight' || q.id === 'sanctuary') && q.pp > 0); if (st.hp < hs.hp * 0.45 && hi >= 0) pickI = hi; else { let best = -1; ms.forEach((q, i) => { const mv = MOVES[q.id]; if (q.pp > 0 && mv.pow && mv.pow > best) { best = mv.pow; pickI = i; } }); } m.i = Math.max(0, pickI); } else m.i = Math.min(mi, m.items.length - 1); } G.press('a', 2, 4); }, moveIdx); continue; }
        if (u.includes('[是/否]')) { await p.evaluate(() => __game.press('a', 2, 6)); continue; }
        if (u.includes('Menu')) { await p.evaluate(() => __game.press('a', 2, 6)); continue; }
        if (u.includes('TextBox')) { await p.evaluate(() => __game.press('a', 2, 4)); continue; }
        if (u === '' ) { await p.evaluate(() => __game.step(6)); continue; }
        await p.evaluate(() => __game.press('a', 2, 6));
      }
      return -1;
    },
    settle: async (max = 80) => { for (let i = 0; i < max; i++) { const busy = await p.evaluate(() => { const sc = __game.Game.scene; return !!(sc.script) || __game.UI.stack.length > 0 || __game.Game.sys.length > 0 || sc.constructor.name !== 'Overworld'; }); if (!busy) return true; const u = await p.evaluate(() => __game.UI.stack.map(w => w.constructor.name).join()); if (u.includes('TextBox') || u.includes('Menu')) await p.evaluate(() => __game.press('a', 2, 6)); else await p.evaluate(() => __game.step(6)); } return false; },
    face: (d) => p.evaluate(d => { const G = __game; G.Input.set(d, true); G.step(1); G.Input.set(d, false); G.step(3); }, d),
  };
  try { await scen(api); } catch (e) { console.log('SCENARIO ERROR', e.message); }
  if (errs.length) console.log('ERRORS:\n' + errs.slice(0, 8).join('\n'));
  await b.close();
})();
