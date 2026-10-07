// v14.10 battle items / food / earplug / old poison
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
    st.bag.potion = 5; st.bag.antidote = 3; st.bag.earplug13 = 1;
    const T = window.__T = []; let i = 0, pend = null; window.__on = 0; const foe = b => b.core.alive('B')[0], H = b => b.core.byId.H;
    const prep = b => { for (const u of b.core.side('B')) { u.statuses = u.statuses.filter(q => q.id !== 'blk15'); u.max.hp = Math.max(u.max.hp, 99999); u.res.hp = Math.max(u.res.hp, 50000); } b.energy = 9; b.itemN = 0; };
    const play = (b, id, up = 0) => { b.hand.unshift({ id, up }); const C = KD.CARDS[id], f = b.core.alive('B'); return { cmd: b.playK(0, C.tg === 'enemy' && f[0] ? f[0].id : null) }; };
    const S = [
      { f: b => { prep(b); T.push('earplug passive: ' + H(b).passives.map(p => p.key).join(',')); H(b).res.hp = 10; window.__hp = 10; b.itemN = 1; return { cmd: { type: 'item', item: 'potion' } }; }, c: b => { const h = H(b).res.hp - window.__hp, w = Math.round(H(b).max.hp * 0.25); return (h === w ? 'PASS' : 'FAIL') + ' battle 傷藥 heals ' + h + ' (want ' + w + ' of ' + H(b).max.hp + ')'; } },
      { f: b => { prep(b); KD.add(b.core, H(b), H(b), 'pois14', 5); KD.add(b.core, H(b), H(b), 'burn14', 3); b.itemN = 1; return { cmd: { type: 'item', item: 'antidote' } }; }, c: b => (!stkK(H(b), 'pois14') ? 'PASS' : 'FAIL') + ' 解毒藥 clears card poison (burn left ' + stkK(H(b), 'burn14') + ')' },
      { f: b => { prep(b); H(b).res.hp = H(b).max.hp; window.__h0 = foe(b).res.hp; return play(b, 'lg_rift'); }, c: b => { window.__ctl = window.__h0 - foe(b).res.hp; Game.st.food13 = { k: 'dish13_lord', n: 5 }; return 'control 裂界之刃 ' + window.__ctl; } },
      { f: b => { prep(b); window.__h0 = foe(b).res.hp; return play(b, 'lg_rift'); }, c: b => { const d = window.__h0 - foe(b).res.hp, r = d / window.__ctl; delete Game.st.food13; return (Math.abs(r - 1.12) < 0.04 ? 'PASS' : 'FAIL') + ' 水域之主的全餐 card damage ×' + r.toFixed(3); } },
      { f: b => { prep(b); b.core.applyStatus(foe(b), H(b), 'psn', {}); window.__hp = H(b).res.hp = H(b).max.hp; KD.block(b.core, H(b), 999); window.__st = H(b).statuses.map(q => q.id + ':' + (q.stacks || '') + '/' + (q.dur ?? '')).join(' '); return { k: 'end' }; },
        c: b => 'old 毒 on the hero: ' + window.__st + ' → hp lost over a round ' + (window.__hp - H(b).res.hp) + ' (max ' + H(b).max.hp + '), now ' + H(b).statuses.map(q => q.id + ':' + (q.stacks || '') + '/' + (q.dur ?? '')).join(' ') },
    ];
    G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message); } pend = null; }
      const st = S[i++]; if (!st) { for (const u of b.core.side('B')) u.res.hp = 1; return { k: 'end' }; } pend = st.c; return st.f(b); };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 30, kind: 'wild' })); }, save);
  for (let i = 0; i < 4000; i++) { const s = await g.ev(() => { const b = __game.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; __game.step(1); return 'in'; }); if (s === 'out') break; }
  g.log((await g.ev(() => window.__T)).join('\n'));
};
