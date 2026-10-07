const fs = require('fs'), path = require('path'), DIR = path.dirname(__filename);
const bot = require('./bot.js');
module.exports = async (g) => {
  const SAVE = process.env.SAVE ? path.join(DIR, process.env.SAVE) : null, OUT = path.join(DIR, process.env.OUT || 'seg');
  const MAXT = +(process.env.TICKS || 3000), STOPQ = +(process.env.STOPQ || 99);
  if (SAVE && fs.existsSync(SAVE)) {
    await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); G.startOverworld(); }, fs.readFileSync(SAVE, 'utf8'));
  } else {
    // new game from the title
    await g.step(10); await g.press('a', 30); await g.press('a', 40);
    for (let i = 0; i < 200; i++) { const st = await g.state(); if (st.scene === 'Overworld' && st.st && st.st.flags && st.st.flags.woke && !st.script) break; await g.press('a', 12); }
  }
  await g.ev(bot);
  await g.ev(fs.readFileSync(path.join(DIR, 'brain.js'), 'utf8')); await g.ev(fs.readFileSync(path.join(DIR, 'bot14.js'), 'utf8'));
  if (process.env.FASTLV) await g.ev(() => { window.BOT.fastLv = true; });
  let qchanges = 0, last = '', liveN = 0;
  for (let t = 0; t < MAXT; t++) {
    const r = await g.ev(() => { const B = window.BOT; for (let i = 0; i < 20; i++) { const s = B.tick(); if (s === 'free') { const b = B.brain(); if (b && b.stop) return b; } } return { q: B.lastQ, f: B.frames }; });
    if (t % 50 === 0) { const sd = await g.ev(() => { const G = __game, sc = G.Game.scene, top = G.UI.stack[G.UI.stack.length - 1]; return { f: window.BOT.frames, sc: sc && sc.constructor.name, round: sc && sc.core ? sc.core.round : null, hand: sc && sc.hand ? sc.hand.length : null, en: sc ? sc.energy : null, idle: sc ? sc.idle : null, need: !!(sc && sc.core && sc.core.need), top: top ? (top.constructor.name + (top.lines ? ':' + top.lines.join('').slice(0, 40) : '') + (top.items ? ':items' + top.items.length : '')) : null, script: !!(sc && sc.script), foes: sc && sc.core ? sc.core.alive('B').map(f => f.sp + ' ' + f.res.hp + '/' + f.max.hp).join(',') : null }; }); fs.appendFileSync(OUT + '.state.txt', t + ' ' + JSON.stringify(sd) + '\n'); }
    if (t % 25 === 0) { const nl = await g.ev(n => { const L = window.BOT.log; return L.slice(n); }, liveN); if (nl.length) { liveN += nl.length; fs.appendFileSync(OUT + '.live.txt', nl.join('\n') + '\n'); } }
    if (r && r.stop) { g.log('STOP: ' + r.stop); break; }
    if (r.q !== last) { qchanges++; last = r.q; if (qchanges > STOPQ) break; }
  }
  const res = await g.ev(() => { const B = window.BOT, st = __game.Game.st; return { log: B.log, dlg: B.dlg, st: JSON.stringify(st), info: 'k14=' + JSON.stringify({ picks: B.k14.picks, skips: B.k14.skips, bought: B.k14.bought, removed: B.k14.removed, upgraded: B.k14.upgraded, deck: KD.deck(st).length, cls: st.k14.cls, boss: KD.bossN(st), qc: Object.keys(st.k14.qc || {}).length }) + ' frames=' + B.frames + ' battles=' + B.battles + ' deaths=' + B.deaths + ' lv=' + st.lv + ' gold=' + st.money + ' map=' + st.map + ' xy=' + st.x + ',' + st.y }; });
  fs.writeFileSync(OUT + '.save.json', res.st); fs.writeFileSync(OUT + '.snap.json', JSON.stringify(await g.ev(() => window.BOT.k14.snap || []))); fs.writeFileSync(OUT + '.hp.txt', (await g.ev(() => window.BOT.k14.hpLog.join('\n')))); fs.writeFileSync(OUT + '.log.txt', res.log.join('\n') + '\n\n--- dialogue ---\n' + res.dlg.join('\n'));
  g.log(res.info); g.log(res.log.slice(-25).join('\n'));
  await g.shot('pt_' + (process.env.OUT || 'seg'));
};
