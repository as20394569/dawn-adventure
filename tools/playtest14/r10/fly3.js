const fs = require('fs');
module.exports = async (g) => { const s = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
    window.__L = []; let n = 0; window.__on = 0; const seq = ['none', 'none', 'fly14', 'fly14', 'fly14', 'fly14', 'dive14', 'dive14', 'spirit'];
    G.Game.autoPlay = b => { window.__on = 1; const core = b.core, f = core.alive('B')[0]; if (window.__prev) { window.__L.push(window.__prev + ' dealt ' + (window.__h0 - f.res.hp)); }
      const k = seq[n++]; if (!k) { for (const u of core.side('B')) u.res.hp = 1; return { k: 'end' }; }
      f.max.hp = 99999; f.res.hp = 50000; f.statuses = f.statuses.filter(q => !['blk15', 'fly14', 'dive14'].includes(q.id)); f.data.fam14 = k === 'spirit' ? 'spirit' : f.data.fam14;
      if (k === 'fly14' || k === 'dive14') f.statuses.push({ id: k, stacks: 1, dur: 2, src: null, at: 0, data: {} }); b.energy = 9; window.__h0 = f.res.hp; window.__prev = k;
      b.hand.unshift({ id: 'sw_strike', up: 0 }); return { cmd: b.playK(0, f.id) }; };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 20, kind: 'wild' })); }, s);
  for (let i = 0; i < 4000; i++) { const r = await g.ev(() => { const b = __game.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; __game.step(1); return 'in'; }); if (r === 'out') break; }
  g.log((await g.ev(() => window.__L)).join('\n')); };
