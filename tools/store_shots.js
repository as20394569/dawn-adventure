// 商店截圖 第 1 步：拍 6 張遊戲畫面（只拍畫布，不含手把）。用法：在專案根目錄 node tools/store_shots.js <資料夾> [s1,s2,...]（要先 build + mktest）
// capture the six store screens (game canvas only, no gamepad) at high resolution
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright'); const path = require('path'); const OUT = process.argv[2]; const ONLY = process.argv[3];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.resolve('dist/test.html')); await p.waitForTimeout(500);
  const crop = async n => { await p.evaluate(() => { __game.step(1); fitScreen && fitScreen(); }); await p.waitForTimeout(150); const el = await p.$('#screen'); await el.screenshot({ path: OUT + '/' + n + '.png' }); console.log('shot', n); };
  const base = (o) => p.evaluate(o => { UI.clear(); newGameState('小晨'); const st = Game.st; if (o.cls) applyStartClass(o.cls);
    st.lv = o.lv || 1; Object.assign(st.flags, { license: o.cls ? 1 : 0, orbStart: 1, woke: 1, h12tal: 1, h12bp2: 1, h12deep: 1, h12weak2: 1, r3new: 0 }, o.flags || {});
    Game.settings.ffHint12 = 1; st.map = o.map; st.x = o.x; st.y = o.y; st.dir = o.dir || 'down'; st.money = o.money || 12840;
    if (o.cls) { attrAuto(st); const S = heroStats(); st.hp = S.hp; st.mp = S.mp; } startOverworld(); __game.step(30); }, o);
  const run = (expr, keys = [], steps = 40) => p.evaluate(([e, keys, steps]) => { const ow = Game.scene; ow.script = null; ow.run(eval('(' + e + ')')); __game.step(steps); for (const k of keys) __game.press(k, 2, 12); __game.step(10); }, [expr, keys, steps]);
  const want = n => !ONLY || ONLY.split(',').includes(n);

  // 1. home: Martha found you
  if (want('s1')) { await base({ map: 'home', x: 1, y: 3, dir: 'right' });
    await p.evaluate(() => { const ow = Game.scene, m = ow.npcs.find(n => n.id === 'mom'); if (m) { m.x = 2; m.y = 3; m.px = 32; m.py = 48; m.dir = 'left'; m.hx = 2; m.hy = 3; } ow.p.dir = 'right';
      UI.push(new TextBox('瑪莎：「你倒在村外的草原上，一動也不動，我就把你背回來了。」', { instant: 1 })); __game.step(20); });
    await crop('s1'); }

  // 2. the ancient golem winds up its big attack
  if (want('s2')) { await base({ map: 'route', x: 10, y: 30, cls: 'swordsman', lv: 18, flags: { golem: 0, deep: 1 } });
    await p.evaluate(() => { const ow = Game.scene; ow.run(ow.battleScript({ sp: 'golem', lv: 17, kind: 'boss' })); __game.step(30); __game.press('a', 2, 10); });
    for (let i = 0; i < 80; i++) { const ok = await p.evaluate(() => { __game.step(10); return Game.scene.constructor.name === 'Battle' && UI.stack.some(x => x.constructor.name === 'Menu'); }); if (ok) break; }
    await p.evaluate(() => { const B = Game.scene; for (const v of B.foes()) v.st.charging = 1; const H = B.H; if (H) { H.st.ki = 3; } __game.step(26); });
    await crop('s2'); }

  // 3. class card: ten classes
  if (want('s3')) { await base({ map: 'guild', x: 5, y: 6, cls: 'swordsman', lv: 25, flags: { deep: 1 } }).catch(e => console.log(e.message));
    await run("classCardScreen(['swordsman','mage','guardian','ranger','bard','machinist','monk','dragoon','otherworlder','spellblade'], { title: '轉職', cancel: true, look: heroLookOf(Game.st) })", ['right', 'right', 'right', 'right', 'right', 'right', 'right'], 60);
    await p.evaluate(() => __game.step(60)); await crop('s3'); }

  // 4. talents
  if (want('s4')) { await base({ map: 'route', x: 10, y: 30, cls: 'swordsman', lv: 30, flags: { deep: 1 } });
    await p.evaluate(() => { const st = Game.st; st.tp = 2; TAL12.pick(0, 0, 0); TAL12.pick(0, 1, 1); TAL12.pick(0, 2, 0); TAL12.pick(1, 0, 1); TAL12.pick(1, 1, 0); TAL12.pick(2, 0, 0); TAL12.pick(0, -1, 0); });
    await run('talentScreen()', ['down', 'down', 'down', 'down'], 40); await crop('s4'); }

  // 5. smith
  if (want('s5')) { await base({ map: 'town', x: 10, y: 10, cls: 'swordsman', lv: 26, flags: { deep: 1 } });
    await p.evaluate(() => { const st = Game.st; st.gear = []; st.equip = {}; const pickB = (slot, re) => Object.keys(GEAR).filter(k => GEAR[k].slot === slot && (GEAR[k].t || 0) <= 5 && !GEAR[k].trait && (!re || re.test(GEAR[k].n))).sort((a, b) => (GEAR[b].t || 0) - (GEAR[a].t || 0));
      console.log('slots', [...new Set(Object.values(GEAR).map(g => g.slot))].join(','));
      const W = pickB('weapon', /劍/)[0], A = pickB('body')[0] || pickB('armor')[0], H = pickB('head')[0];
      const g1 = makeGear(W, 3, 0.97); g1.e = 6; g1.s = 2; const g2 = A && makeGear(A, 2, 0.9); if (g2) g2.e = 4; const g3 = H && makeGear(H, 2, 0.88); if (g3) { g3.e = 3; g3.s = 1; }
      for (const k of [pickB('weapon', /刀/)[0], pickB('acc')[0], pickB('acc')[1], pickB('weapon', /斧/)[0]].filter(Boolean)) { const g = makeGear(k, 1 + (k.length % 3), 0.85); g.e = k.length % 5; } st.equip.weapon = g1.u; if (g2) st.equip[GEAR[A].slot] = g2.u; if (g3) st.equip.head = g3.u; st.refine = { [W]: 2 }; for (const k of Object.keys(ITEMS).filter(k => /石|礦/.test(ITEMS[k].n)).slice(0, 6)) st.bag[k] = 9; console.log('gear', W, A, H); });
    await run('smithUpgrade12()', [], 40); await crop('s5');
    await run('craftScreen()', [], 40); await crop('s5b'); }

  // 6. the map record
  if (want('s6')) { await base({ map: 'route', x: 10, y: 30, cls: 'swordsman', lv: 24, flags: { deep: 1 } });
    const pickM = await p.evaluate(() => { const st = Game.st, out = [];
      for (const id of Object.keys(EXPLORE)) { const d = MAPS[id]; if (!d || !d.rows) continue; const ws = (d.npcs || []).some(n => n.id === 'wshrine_' + id), ext = typeof EXT_OPEN !== 'undefined' && EXT_OPEN[id];
        if (ws && ext && d.rare) out.push(id); } return out; });
    console.log('maps with all three:', pickM.join(','));
    const sz = await p.evaluate(L => L.map(id => id + ':' + MAPS[id].rows[0].length + 'x' + MAPS[id].rows.length), pickM); console.log(sz.join(' ')); const M = process.env.MAP || 'lake';
    await p.evaluate(M => { const st = Game.st, d = MAPS[M], w = d.rows[0].length, h = d.rows.length; st.vis = st.vis || {};
      for (const id of Object.keys(EXPLORE).slice(0, 19)) if (MAPS[id] && MAPS[id].rows) { const a = MAPS[id].rows[0].length, b = MAPS[id].rows.length; st.vis[id] = '1'.repeat(a * b); }
      let s = ''; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) s += (x > w * 0.68 && y < h * 0.34) ? '0' : '1'; st.vis[M] = s; st.map = M;
      const items = (d.items || []); items.forEach((it, i) => { if (i % 4 !== 3) st.flags[it.id] = 1; });
      st.wsh = st.wsh || {}; st.wsh[M] = 0; st.extSeen = { [M]: 1 }; st.dex = st.dex || {}; if (d.rare) st.dex[d.rare[0]] = { seen: 1, won: 1 };
      const L = LORE.map((l, i) => [l, i]).filter(([l]) => l[0] === M); st.lore = st.lore || {}; L.forEach(([, i]) => st.lore[i] = 1); }, M);
    await run('recordScreen()', ['a', 'a'], 30); await crop('s6'); }
  await b.close(); })();
