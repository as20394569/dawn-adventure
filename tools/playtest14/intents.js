// intents on screen: at the start of each hero turn log what each monster shows (and its block / strength), screenshot the first rounds
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8'), FIGHTS = JSON.parse(process.env.FIGHTS), RMAX = +(process.env.RMAX || 4), SH = process.env.SH || 'it';
  let fi = 0;
  for (const cfg of FIGHTS) { fi++;
    await g.ev(([s, cfg]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; G.Game.noV14 = false; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'sw';
      st.hp = KD.maxHp(st); st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; if (cfg.map) st.map = cfg.map; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.autoPlay = () => null; window.__seen = {}; window.__log = [];
      const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [save, cfg]);
    for (let i = 0; i < 8000; i++) { const r = await g.ev(([RMAX]) => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle') { if (window.__b) return 'end'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(4); return null; } window.__b = b; const c = b.core;
        if (c.byId.H && !b.__tank) { b.__tank = 1; c.byId.H.max.hp = 900; c.byId.H.res.hp = 900; }
        if (c.result) { if (G.UI.stack.length) G.press(G.UI.stack.some(x => x.lines) ? 'a' : 'b', 2, 2); else G.step(4); return null; }
        // the moment the hero's turn starts (plan made, hand drawn): record once per round
        if (c.plan && b.hand && b.hand.length && b.turnR === c.round && !window.__seen[c.round] && b.t > 60) { window.__seen[c.round] = 1; G.step(30);
          window.__log.push('R' + c.round + ' ' + c.alive('B').map(u => u.name + '[' + (stkK(u, 'blk15') ? '盾' + stkK(u, 'blk15') : '') + (stkK(u, 'str15') ? '力' + stkK(u, 'str15') : '') + ']：' + (function () { const I = intentOf14(c, u, c.plan[u.id]); return I ? I.k + ' ' + I.t : '-'; })()).join('　'));
          if (c.round <= RMAX) return 'shot' + c.round; }
        if (c.round > RMAX + 6) { for (const u of c.alive('B')) u.res.hp = 1; }
        if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(3); return null; }, [RMAX]);
      if (process.env.DBG && i % 200 === 0) g.log(i, r, await g.ev(() => { const b = __game.Game.scene; return b.constructor.name + ' ' + (b.core ? 'R' + b.core.round + ' plan ' + !!b.core.plan + ' hand ' + (b.hand && b.hand.length) + ' turnR ' + b.turnR + ' t' + b.t + ' seen ' + JSON.stringify(window.__seen) : ''); }));
      if (r === 'end') break; if (r && r.startsWith('shot')) await g.shot(SH + fi + '_' + r.slice(4)); }
    const mh = await g.ev(() => { const c = window.__b && window.__b.core; if (!c) return ''; const out = {}; let cur = null, n = 0; for (const e of c.log) { if (e.type === 'SKILL_USE') { cur = e.payload && e.payload.skill; n = 0; } if (e.type === 'HIT' && cur && e.payload && e.payload.skill === cur) n++; if (e.type === 'ACTION_END' && cur) { const D = DEF.skills[cur]; if (D && D.hits && D.hits[1] > 1 && !/^k14_/.test(cur)) (out[cur] = out[cur] || []).push(n); cur = null; } } return JSON.stringify(out); });
    g.log(JSON.stringify(cfg) + '\n  ' + (await g.ev(() => window.__log)).join('\n  ') + '\n  hits per use: ' + mh); await g.ev(() => { window.__b = null; });
  }
};
