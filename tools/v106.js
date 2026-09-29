// v8 chapter 1 story walk-through: elder intro → hills (Nora, rift, top, boss win) → report → creek → catfish → cure; route gate
module.exports = async (g) => {
  const log = []; const picks = [];
  const drive = async (max = 400) => { for (let i = 0; i < max; i++) {
      const s = await g.ev(() => { const G = __game, ow = G.Game.scene, U = G.UI.stack; const m = U.find(w => w.items && w.items.length && !w.lines); const t = U.find(w => w.lines); return { busy: !!(ow.script) || U.length > 0 || ow.constructor.name !== 'Overworld', menu: m ? m.items.map(q => q.t).join('/') : '', text: t ? t.lines.join('') : '', battle: ow.constructor.name === 'Battle' }; });
      if (!s.busy) return; if (s.text && !log.includes(s.text)) log.push(s.text.slice(0, 70));
      if (s.menu && !s.battle) { const k = picks.length ? picks.shift() : 0; log.push('  [choose ' + k + ' of ' + s.menu + ']'); await g.ev(k => { const m = __game.UI.stack.find(w => w.items && w.items.length && !w.lines); m.i = k; }, k); }
      await g.ev(() => __game.press('a', 2, 6)); } };
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.v8new = 1; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 6; st.map = 'elder'; st.x = 4; st.y = 5; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp;
    G.Game.autoPlay = b => { b.F.hp = 1; return { type: 'move', id: 'attack' }; }; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(Events.elder(ow)); });
  await drive(); log.push('== hillsQ ' + await g.ev(() => __game.Game.st.flags.hillsQ));
  // route gate
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.load('route', 10, 26, 'up'); }); await g.step(10); await g.hold('up', 20); await drive(); log.push('== after gate y ' + await g.ev(() => __game.Game.scene.p.y));
  // hills
  await g.ev(() => { const ow = __game.Game.scene; ow.load('windHills', 0, 26, 'right'); }); await g.step(40); await drive(); await g.shot('v106_hills_in'); await g.walkTo(2, 26); await drive();
  log.push('== noraMet ' + await g.ev(() => JSON.stringify([__game.Game.st.flags.noraMet, __game.Game.st.flags.noraWith])));
  await g.ev(() => { const ow = __game.Game.scene; ow.load('windHills', 16, 11, 'right'); }); await g.step(40); await drive(); await g.walkTo(17, 11); await drive(1200); log.push('== rift ' + await g.ev(() => __game.Game.st.flags.hillsRift));
  await g.ev(() => { const ow = __game.Game.scene; ow.load('windHills', 11, 8, 'up'); }); await g.step(40); await drive(); await g.walkTo(11, 6); await drive(); await g.shot('v106_top'); log.push('== top ' + await g.ev(() => __game.Game.st.flags.hillsTop));
  await g.ev(() => { const ow = __game.Game.scene; __game.Game.st.flags.millGolem = 1; ow.run(Events.eliteWin_millGolem(ow)); }); await drive();
  await g.ev(() => { const ow = __game.Game.scene; ow.load('elder', 4, 5, 'up'); }); await g.step(40); await drive(); picks.push(0); await g.ev(() => { const ow = __game.Game.scene; ow.run(Events.elder(ow)); }); await drive();
  log.push('== creekQ ' + await g.ev(() => JSON.stringify([__game.Game.st.flags.hillsQ, __game.Game.st.flags.creekQ, __game.Game.st.flags.noraCreek])));
  await g.ev(() => { const ow = __game.Game.scene; ow.load('jadeCreek', 23, 29, 'left'); }); await g.step(40); await drive(); await g.walkTo(21, 29); await drive(); await g.shot('v106_creek'); log.push('== creekIn ' + await g.ev(() => __game.Game.st.flags.creekIn));
  await drive(); picks.push(0); await g.ev(() => { const ow = __game.Game.scene; __game.Game.st.flags.blackCatfish = 1; ow.run(Events.eliteWin_blackCatfish(ow)); }); await drive();
  await g.ev(() => { const ow = __game.Game.scene; ow.load('millHouse', 4, 6, 'up'); }); await g.step(40); await drive(); await g.ev(() => { const ow = __game.Game.scene; ow.run(Events.hans(ow)); }); await drive();
  log.push('== end ' + await g.ev(() => { const st = __game.Game.st; return JSON.stringify({ c: st.flags.creekQ, vit: (st.boost || {}).vit, bp: st.bp && st.bp.qNoraRibbon, t: st.bpT && st.bpT.qNoraRibbon, q: questList(st).filter(q => q.main || q.cat === '主線').map(q => q.n + ':' + q.t.slice(0, 20)) }); }));
  g.log(log.join('\n'));
};
