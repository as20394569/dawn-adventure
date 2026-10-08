const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const run = async (cfg, steps, deck, cls = 'mg') => {
    await g.ev(([s, cfg, steps, deck, cls]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = cls; K.decks = {}; if (deck) K.decks[cls] = deck; K.g16 = 1; KD.deck(st); K.wk16 = {};
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutBreak = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__on = 0;
      const T = window.__T = []; let i = 0, pend = null; const F = b => b.core.alive('B'), foe = b => F(b)[0], H = b => b.core.byId.H;
      const play = (b, id, ti = 0, aw = 1, up = 0, keepE) => { if (!keepE) b.energy = 9; b.hand.unshift({ id, up, aw }); const C = KD.CARDS[id], f = F(b); return { cmd: b.playK(0, C.tg === 'enemy' && f[ti] ? f[ti].id : null) }; };
      const endT = b => { KD.block(b.core, H(b), 9999); H(b).res.hp = H(b).max.hp; return { k: 'end' }; };
      const big = b => { for (const u of b.core.side('B')) { u.max.hp = 99999; u.res.hp = 99999; u.data.wk16 = ['打']; } };
      const dmgTo = (b, m, id) => b.core.log.slice(m).filter(e => e.type === 'DAMAGE' && e.src === 'H' && (!id || e.tgts[0] === id)).map(e => e.payload.amount);
      const S = steps.map(x => eval('(' + x + ')'));
      G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } pend = null; }
        const q = S[i++]; if (!q) { for (const u of b.core.side('B')) u.res.hp = 1; b.energy = 9; b.hand.unshift({ id: 'mg_storm', up: 1 }); return { cmd: b.playK(0, null) }; } pend = q.c; return q.f(b); };
      const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [save, cfg, steps, deck, cls]);
    for (let i = 0; i < 8000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(1); return 'in'; }); if (s === 'out') break; }
    g.log((await g.ev(() => window.__T)).join('\n'));
    for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  };

  for (const cls of ['sw', 'rg', 'bk']) {
    const ids = await g.ev(c => Object.keys(KD.AW).filter(id => KD.CARDS[id] && KD.CARDS[id].cls === c), cls);
    const steps = ids.map(id => `{ f: b => { for (const u of b.core.side('B')) { u.max.hp = 99999; u.res.hp = 99999; } H(b).res.hp = H(b).max.hp; window.__m = b.core.log.length; return play(b, '${id}', 0); }, c: b => '${id}:' + (b.core.log.slice(window.__m).filter(e => e.type === 'DAMAGE' && e.src === 'H').length) }`);
    for (let k = 0; k < steps.length; k += 12) await run({ sp: 'curlySheep', lv: 20, kind: 'wild', extra: 1 }, steps.slice(k, k + 12), [{ id: ids[0] }], cls);
    g.log('AW ' + cls + ' ' + ids.length); }
};
