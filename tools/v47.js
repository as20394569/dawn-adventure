// ch2 class change at the guild: unlock flags -> class card -> skill tree swap; then shot of the card
module.exports = async (g) => {
  for (const [cls, fl, from] of [['bard', 'clsBard', 'stormcaller'], ['monk', 'clsMonk', 'bard'], ['dragoon', 'clsDragoon', 'paladin'], ['machinist', 'clsMachinist', 'assassin']]) {
    await g.ev(([cls, fl, from]) => { const G = __game; if (from !== 'bard') { G.newGameState('小晨'); } const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, ch2: 3, clsBard: 1, clsMonk: 1, clsDragoon: 1, clsMachinist: 1 }); st.lv = 30; st.map = 'capital'; st.x = 12; st.y = 10; if (from !== 'bard') { const base = CLASSES[from].from || 'swordsman'; applyStartClass(base); st.cls = from; for (const n of skillTreeOf(from)) st.skills[n.id] = 1; } startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.script = null; G.UI.clear(); window.__want = cls; ow.run(ch2ClassTalk()); }, [cls, fl, from]);
    let shot = false;
    for (let i = 0; i < 200; i++) {
      const s = await g.ev(() => { const G = __game, sc = G.Game.scene; const top = G.UI.stack[G.UI.stack.length - 1]; return { busy: !!sc.script || G.UI.stack.length > 0, card: !!top && !top.items && !top.lines }; });
      if (!s.busy) break;
      if (s.card && !shot) { const n = await g.ev(() => { const st = __game.Game.st; const opts = CH2_CLS.filter(([k, fl]) => st.flags[fl] && st.cls !== k).map(([k]) => k); return opts.indexOf(window.__want); }); await g.shot('ch2_card_' + cls); shot = true; for (let r = 0; r < n; r++) await g.press('right', 6); if (n > 0) await g.shot('ch2_card_' + cls + 'b'); }
      await g.press('a', 6);
    }
    g.log(await g.ev(() => { const st = __game.Game.st; return st.cls + ' base=' + st.baseCls + ' usable=' + usableSkills(st).join(',') + ' inh=' + (st.inh || []).join(','); }));
  }
};
