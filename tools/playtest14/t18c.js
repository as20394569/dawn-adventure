// intents of a boss over several rounds (hero just ends the turn): what it hits for
const fs = require('fs');
module.exports = async (g) => { const save = fs.readFileSync(process.env.SAVE, 'utf8'), SP = process.env.SP, LV = +process.env.LV, R = +(process.env.R || 6);
  await g.ev(([s, SP, LV]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; KD.migrate(st); st.k14.catchup = 0; st.k14.qv = 2; st.k14.hpPlus = 400; st.hp = 999; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: SP, lv: LV, kind: 'boss', id: SP })); }, [save, SP, LV]);
  const out = []; let last = -1;
  for (let i = 0; i < 3000 && out.length < R; i++) { const r = await g.ev((last) => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle') { if (G.UI.stack.some(x => x.lines || x.items)) G.press('a', 2, 4); else G.step(4); return null; }
      if (G.UI.stack.some(x => x.lines)) { G.press('a', 2, 2); return null; } const c = b.core; if (!(b.idle && b.k14 && c.need)) { G.step(4); return null; }
      if (c.round === last) { b.tapK = { k: 'end' }; G.step(3); return null; }
      const H = c.byId.H, I = c.alive('B').map(f => { const it = intentOf14(c, f, c.plan && c.plan[f.id]); let ch = ''; const S = (f.statuses || []).find(s => s.id === 'charging'), D = S && S.data && DEF.skills[S.data.skill]; if (D && D.power) { try { ch = ' [release ' + S.data.skill + ' ' + BR.damage(c, f, H, D, { preview: true, noCrit: true }).amount * (D.hits ? Math.round((D.hits[0] + D.hits[1]) / 2) : 1) + ']'; } catch (e) { ch = ' [err]'; } } return f.name + ':' + (c.plan && c.plan[f.id] ? c.plan[f.id].skill : '-') + '=' + (it ? it.k + ' ' + it.t : '?') + ch; });
      b.tapK = { k: 'end' }; G.step(3); return { round: c.round, hp: H.res.hp, I: I.join(' | ') }; }, last);
    if (r) { last = r.round; out.push('R' + r.round + ' ' + r.I); } }
  g.log(out.join('\n')); };
