// v8.1 chapter-2 prologue walk-through: knight → coach → 楓紅關道 (格倫, camp, top, 鹿王) → 古戰場 (camp, ambush, top, 戰將) → coach to 北方街道
module.exports = async (g) => {
  const log = []; const picks = [];
  const drive = async (max = 400) => { for (let i = 0; i < max; i++) {
      const s = await g.ev(() => { const G = __game, ow = G.Game.scene, U = G.UI.stack; const m = U.find(w => w.items && w.items.length && !w.lines); const t = U.find(w => w.lines); return { busy: !!(ow.script) || U.length > 0 || ow.constructor.name !== 'Overworld', battle: ow.constructor.name === 'Battle', menu: m ? m.items.map(q => q.t).join('/') : null, text: t ? t.lines.join('') : null }; });
      if (!s.busy) return; if (s.text && !log.includes(s.text)) log.push(s.text.slice(0, 80));
      if (s.menu && !s.battle) { const k = picks.length ? picks.shift() : 0; log.push('  [choose ' + k + ' of ' + s.menu + ']'); await g.ev(k => { const m = __game.UI.stack.find(w => w.items && w.items.length && !w.lines); m.i = k; }, k); }
      await g.ev(() => __game.press('a', 2, 6)); } };
  const q = async () => g.ev(() => questList(__game.Game.st).filter(q => q.cat === '主線' || q.n.startsWith('第二章') || q.n === '北境之路').map(q => q.n + ':' + q.t.slice(0, 40)).join(' | '));
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, hillsQ: 3, creekQ: 3, croc: 1 }); st.lv = 17; st.money = 5000; st.map = 'town'; st.x = 12; st.y = 6; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp;
    G.Game.autoPlay = b => { b.F.hp = 1; return { type: 'move', id: 'attack' }; }; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(Events.royalKnight(ow)); });
  await drive(); log.push('== after knight ' + await g.ev(() => JSON.stringify([__game.Game.st.flags.ch2, __game.Game.st.flags.v81, __game.Game.st.flags.passQ]))); log.push('Q ' + await q());
  picks.push(0); await g.ev(() => { const ow = __game.Game.scene; ow.run(Events.coachT(ow)); }); await drive(); await g.step(30);
  log.push('== at ' + await g.ev(() => __game.Game.st.map + ' ' + __game.Game.scene.p.x + ',' + __game.Game.scene.p.y)); await g.shot('v129_pass_in');
  // 格倫
  await g.walkTo(11, 24); await drive(); await g.face('up'); picks.push(0); await g.press('a', 10); await drive(); log.push('== grenTrust ' + await g.ev(() => __game.Game.st.flags.grenTrust));
  // camp (ledge gap) and top
  await g.ev(() => { const ow = __game.Game.scene; ow.load('maplePass', 11, 8, 'up'); }); await g.step(30); await g.walkTo(11, 6); await drive(1500); log.push('== camp ' + await g.ev(() => JSON.stringify([__game.Game.st.flags.passCamp, !!__game.Game.st.bag.blackOrder])));
  await g.walkTo(11, 4); await drive(); await g.shot('v129_pass_top'); await g.walkTo(11, 3); await drive(1500); log.push('== stagLord ' + await g.ev(() => JSON.stringify([__game.Game.st.flags.stagLord, __game.Game.st.flags.passQ])));
  // 古戰場
  await g.walkTo(11, 0); await g.hold('up', 12); await drive(); await g.step(40); log.push('== at ' + await g.ev(() => __game.Game.st.map + ' ' + __game.Game.scene.p.x + ',' + __game.Game.scene.p.y));
  await g.walkTo(11, 30); await drive(); await g.shot('v129_field_in'); log.push('== fieldIn ' + await g.ev(() => __game.Game.st.flags.fieldIn));
  await g.walkTo(4, 22); await drive(); await g.face('left'); await g.press('a', 10); await drive(); log.push('Q ' + await q());
  await g.walkTo(11, 18); await g.walkTo(11, 17); await drive(1500); log.push('== ambush ' + await g.ev(() => __game.Game.st.flags.fieldAmbush));
  await g.walkTo(11, 6); await g.walkTo(11, 5); await drive(); await g.shot('v129_field_top'); picks.push(0); await g.ev(() => { const ow = __game.Game.scene; __game.Game.st.flags.wraithGeneral = 1; ow.run(Events.eliteWin_wraithGeneral(ow)); }); await drive(); await g.ev(() => { const ow = __game.Game.scene; ow.elites = (ow.elites || []).filter(e => e.id !== 'wraithGeneral'); ow.load('oldField', 11, 2, 'up'); }); await g.step(20);
  log.push('== end ' + await g.ev(() => { const st = __game.Game.st; return JSON.stringify({ wg: st.flags.wraithGeneral, done: st.flags.passDone, str: (st.boost || {}).str, bp: st.bp && st.bp.qGrenBand, t: st.bpT && st.bpT.qGrenBand }); }));
  log.push('Q ' + await q());
  await g.walkTo(11, 0); await g.hold('up', 12); await drive(); await g.step(40); log.push('== at ' + await g.ev(() => __game.Game.st.map + ' ' + __game.Game.scene.p.x + ',' + __game.Game.scene.p.y)); await g.shot('v129_northroad');
  picks.push(0); await g.ev(() => { const ow = __game.Game.scene; ow.load('town', 19, 6, 'down'); }); await g.step(20); await g.ev(() => { const ow = __game.Game.scene; ow.run(Events.coachT(ow)); }); await drive(); log.push('coach menu logged above');
  g.log(log.join('\n'));
};
