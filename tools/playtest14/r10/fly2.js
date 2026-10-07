const fs = require('fs');
module.exports = async (g) => { const s = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
    window.__L = []; let n = 0; window.__on = 0;
    G.Game.autoPlay = b => { window.__on = 1; const core = b.core; if (!core.__hk) { core.__hk = 1; const _e = core.emit.bind(core); core.emit = function (ev, o, ...a) { const r = _e(ev, o, ...a); try { if (o && o.src && !o.src.hero && (ev === EVT.HIT || ev === EVT.MISS || ev === EVT.DAMAGE)) window.__L.push(ev + ' ' + (o.payload && (o.payload.amount ?? o.payload.hitIndex)) + ' ' + JSON.stringify(o.payload || {}).slice(0, 120)); } catch (e) {} return r; };
        for (const u of core.side('B')) { u.data.k14plan = 1; } }
      const f = core.alive('B')[0]; if (core.plan) for (const id in core.plan) core.plan[id] = { type: 'skill', skill: 'm_swarm', actor: id, targets: ['H'] };
      const I = intentOf14(core, f, core.plan && core.plan[f.id]); window.__L.push('--- turn ' + b.turns + ' intent ' + JSON.stringify(I) + ' hp ' + core.byId.H.res.hp);
      core.byId.H.res.hp = core.byId.H.max.hp; if (++n > 4) { for (const u of core.side('B')) u.res.hp = 1; } return { k: 'end' }; };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'mireFly', lv: 20, kind: 'wild' })); }, s);
  for (let i = 0; i < 4000; i++) { const r = await g.ev(() => { const b = __game.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; __game.step(1); return 'in'; }); if (r === 'out') break; }
  g.log((await g.ev(() => window.__L)).join('\n')); };
