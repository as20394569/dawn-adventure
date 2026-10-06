// 宣傳影片 第 1 步：錄下每一段的原始畫面（176×256，每 2 個遊戲影格存 1 張 = 30fps）。用法：node tools/trailer_cap.js <資料夾>（要先 build + mktest）
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright'); const path = require('path'); const fs = require('fs'); const OUT = process.argv[2]; const ONLY = process.argv[3];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 430, height: 932 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.resolve('dist/test.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } });
  const want = n => !ONLY || ONLY.split(',').includes(n);
  // record n frames; before each frame `tick(i)` may press keys (runs in the page)
  const rec = async (name, n, tick = 'null') => { const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < n; i += 10) { const urls = await p.evaluate(([i0, n, tick]) => { const f = eval('(' + tick + ')'), out = [];
        for (let i = i0; i < Math.min(n, i0 + 10); i++) { Game.wxBanner = null; if (f) f(i); __game.step(2); out.push(document.getElementById('screen').toDataURL()); } return out; }, [i, n, tick]);
      urls.forEach((u, k) => fs.writeFileSync(path.join(dir, String(i + k).padStart(4, '0') + '.png'), Buffer.from(u.split(',')[1], 'base64'))); }
    console.log('rec', name, n); };
  const base = (o) => p.evaluate(o => { UI.clear(); newGameState('小晨'); const st = Game.st; NC_PICK12 = o.kind || '劍'; CLASS_START[NC12].gear = [BASE11.weapon[NC_PICK12][0], 'guardBadge']; applyStartClass(NC12);
    st.lv = o.lv || 1; Object.assign(st.flags, { license: 1, orbStart: 1, woke: 1, h12tal: 1, h12bp2: 1, h12deep: 1, h12weak2: 1, r3new: 0, deep: 1, tutInert11: 1, tutPart11: 1, tutWard12: 1 }, o.flags || {});
    Game.settings.ffHint12 = 1; st.map = o.map; st.x = o.x; st.y = o.y; st.dir = o.dir || 'down'; st.money = 980; st.clock = 700;
    const kind = NC_PICK12, T = BASE11.weapon[kind]; GEAR11_GLAM = false; const g = makeGear(T[Math.min(T.length - 1, Math.floor((o.lv || 1) / 8))], 3, 0.95); GEAR11_GLAM = true; st.equip.weapon = g.u; st.gear = st.gear.filter(x => GEAR[x.b].slot !== 'weapon' || x.u === g.u);
    for (const sl of ['head', 'body', 'feet']) { const A = BASE11.armor['重甲'][sl], k = A[Math.min(A.length - 1, Math.floor((o.lv || 1) / 8))]; GEAR11_GLAM = false; const a = makeGear(k, 3, 0.95); GEAR11_GLAM = true; st.equip[sl] = a.u; } st.bag.megaPotion = 5; st.bag.superPotion = 5;
    const TR = tr11(st); TR.lv = { [kind + ':trait']: 1 }; let pts = trTotal11(st); for (const N of treeNodes11(kind).filter(N => N.lv <= st.lv)) { if (pts <= 0) break; if (N.pre && !TR.lv[N.pre]) continue; const v = Math.min(N.max, N.t === 'sk' ? 3 : 1); TR.lv[N.key] = v; pts -= v; }
    BB.slots(st); attrAuto(st); const S = heroStats(); st.hp = S.hp; st.mp = S.mp; st.ach = {}; for (const A of ACHIEVEMENTS) st.ach[A.id] = 1; st.flags.todo12 = 1; Game.retry13 = null; Game.fade = 0; startOverworld(); __game.step(30); UI.clear(); Game.scene.script = null; Game.wxBanner = null; Game.toastQ = []; Game.fade = 0; }, o);
  // the battle AI of the playtest bot: guard against a charge, otherwise the strongest skill
  await p.evaluate(() => { Game.autoPlay = b => { const core = b.core, H = core.byId.H, foes = core.alive('B');
      if (foes.some(f => core.hasStatus(f, 'charging'))) return { type: 'defend' }; const st = Game.st; if (H.res.hp < H.max.hp * 0.35) { for (const k of ['megaPotion', 'superPotion']) if (st.bag[k] > 0) return { type: 'item', item: k }; }
      let best = H.data.attackSkill, bv = -1; const f0 = foes[0];
      for (const id of H.skills.concat([H.data.attackSkill])) { const D = DEF.skills[id]; if (!D || !D.power || core.onCooldown(H, id) || !b.canUse(id).ok) continue; let v = 0; try { v = b.estimate(id, f0.id) * (D.target === 'all_enemies' ? foes.length : 1); } catch (e) { v = D.power; } v *= 0.8 + Math.random() * 0.4; if (v > bv) { bv = v; best = id; } }
      return { type: 'skill', skill: best }; }; });
  const pressText = "i => { if (i % 6 === 0 && UI.stack.some(w => w.lines)) __game.press('a', 2, 0); }";

  if (want('title')) { await p.evaluate(() => { UI.clear(); Game.setScene(new TitleScene()); }); await rec('title', 90); }
  if (want('intro')) { await p.evaluate(() => { UI.clear(); Game.st = null; Game.pendingNew = { diff: 2, carry: null }; Game.setScene(new IntroScene()); }); await rec('intro', 420, "i => { if (i % 40 === 39 && UI.stack.some(w => w.lines)) __game.press('a', 2, 0); }"); }
  if (want('walk')) { await base({ map: 'town', x: 3, y: 14, dir: 'right', lv: 6 }); await p.evaluate(() => { Game.noEnc = 1; __game.Input.set('right', true); }); await rec('walk', 110); await p.evaluate(() => { __game.Input.set('right', false); Game.noEnc = 0; }); }
  if (want('battle')) { await base({ map: 'maplePass', x: 20, y: 20, lv: 38, kind: '劍' });
    await p.evaluate(() => { const ow = Game.scene; ow.run(ow.battleScript({ sp: 'bty13_ape', lv: 24, kind: 'elite', solo: 1, noCard: 1, noMats: 1 })); });
    await rec('battle', 600, pressText); }
  if (want('boss')) { await base({ map: 'route', x: 10, y: 30, lv: 21, flags: { golem: 0 } });
    await p.evaluate(() => { const ow = Game.scene; ow.run(ow.battleScript({ sp: 'golem', lv: 17, kind: 'boss', noCard: 1, noMats: 1 })); });
    await rec('boss', 600, pressText); }
  if (want('lord')) { await base({ map: 'ruins', x: 7, y: 5, lv: 50, kind: '劍', flags: { ch2: 10, gateOpen: 1, golem: 1 } });
    await p.evaluate(() => { const st = Game.st; abySt(st).run = 1; abyApply(30, 1); Game.scene.load('abyss13', 7, 5, 'up'); __game.step(20); const ow = Game.scene; ow.script = null; UI.clear();
      ow.run(ow.battleScript({ sp: ABY_LORD13, lv: 50, kind: 'boss', id: ABY_LORD13, rematch: 1, noCard: 1, noMats: 1 })); });
    await rec('lord', 600, pressText); }
  if (want('fish')) { await base({ map: 'harbor13', x: 10, y: 12, dir: 'left', lv: 42, flags: { ch2: 10, ch3: 6, siren13: 1 } });
    await p.evaluate(() => { const st = Game.st; st.bag.rod13 = 1; st.bag.rod13b = 1; const ow = Game.scene; ow.p.dir = 'left'; Game.noEnc = 1; });
    await rec('fish', 300, "i => { const ow = Game.scene; if ((i === 6 || i === 16) && !ow.bob13 && !UI.stack.length) { ow.p.dir = 'left'; __game.press('a', 2, 0); } if (ow.bob13 && ow.bob13.bite && !ow.fishPressed) { ow.fishPressed = 1; __game.press('a', 2, 0); } const P = UI.stack.find(w => w.s && w.s.zw); if (P && i % 3 === 0) { const s = P.s; if (s.pos >= s.zx && s.pos <= s.zx + s.zw) __game.press('a', 2, 0); } if (UI.stack.some(w => w.lines) && i % 8 === 0) __game.press('a', 2, 0); }"); }
  if (want('tmap')) { await base({ map: 'town', x: 8, y: 25, dir: 'down', lv: 12 });
    await p.evaluate(() => { const st = Game.st; st.flags.tm13 = 1; tmGive13('t1'); Game.noEnc = 1; const ow = Game.scene; ow.run(tmapView13(0)); });
    await rec('tmap', 230, "i => { if (i === 70) __game.press('b', 2, 0); if (i === 80) { __game.Input.set('down', true); } if (i === 86) __game.Input.set('down', false); if (i === 100) __game.press('a', 2, 0); if (i > 110 && UI.stack.some(w => w.lines) && i % 30 === 0) __game.press('a', 2, 0); }"); }
  await b.close(); })();
