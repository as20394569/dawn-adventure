// v14.10 card fixes: play exact sequences in a real battle and compare numbers
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
    const T = window.__T = []; let i = 0, pend = null; const foe = b => b.core.alive('B')[0], H = b => b.core.byId.H;
    const prep = b => { const core = b.core; for (const u of core.side('B')) { u.statuses = u.statuses.filter(q => q.id !== 'blk15'); } b.energy = 9; };
    const play = (b, id, up = 0) => { b.hand.unshift({ id, up }); const C = KD.CARDS[id], f = b.core.alive('B'); return { cmd: b.playK(0, C.tg === 'enemy' && f[0] ? f[0].id : null) }; };
    const S = [
      // 1-2: 血怒 on a random-hit card adds +3 once (control at full HP, then at 40% HP)
      { f: b => { b.cls = 'bk'; prep(b); H(b).res.hp = H(b).max.hp; foe(b).max.hp = foe(b).res.hp = 99999; window.__h0 = foe(b).res.hp; return play(b, 'lg_hydra'); }, c: b => { window.__ctl = window.__h0 - foe(b).res.hp; return 'control hydra dealt ' + window.__ctl; } },
      { f: b => { prep(b); H(b).res.hp = Math.floor(H(b).max.hp * 0.4); window.__h0 = foe(b).res.hp; return play(b, 'lg_hydra'); }, c: b => { const d = window.__h0 - foe(b).res.hp; return (d - window.__ctl === 3 ? 'PASS' : 'FAIL') + ' 血怒+九頭毒牙: extra ' + (d - window.__ctl) + ' (want 3)'; } },
      // 3: 殘影步 then 疾風二連 (2 hits): +x once
      { f: b => { prep(b); H(b).res.hp = H(b).max.hp; window.__h0 = foe(b).res.hp; return play(b, 'sw_twin'); }, c: b => { window.__ctl = window.__h0 - foe(b).res.hp; return 'control twin ' + window.__ctl; } },
      { f: b => { prep(b); return play(b, 'rg_shade'); }, c: () => 'shade' },
      { f: b => { prep(b); window.__h0 = foe(b).res.hp; return play(b, 'sw_twin'); }, c: b => { const d = window.__h0 - foe(b).res.hp; return (d - window.__ctl === 3 ? 'PASS' : 'FAIL') + ' 殘影步+疾風二連: extra ' + (d - window.__ctl) + ' (want 3)'; } },
      // 6: 狂戰之血 heals at least 1 on a small hit
      { f: b => { prep(b); KD.add(b.core, H(b), H(b), 'pwBlood14', 15); H(b).res.hp = H(b).max.hp - 20; window.__hp0 = H(b).res.hp; return play(b, 'sw_strike'); }, c: b => { const d = H(b).res.hp - window.__hp0; b.core.removeStatus(H(b), 'pwBlood14', 'x'); return (d >= 1 ? 'PASS' : 'FAIL') + ' 狂戰之血 heal ' + d; } },
      // 7: 燕返 as the ×2 card keeps its own 劍意 +1
      { f: b => { prep(b); b.cls = 'sw'; b.si = 3; return play(b, 'sw_tsubame'); }, c: b => (b.si === 1 ? 'PASS' : 'FAIL') + ' 燕返 at 劍意3 → 劍意 ' + b.si + ' (want 1)' },
      // 8: 豐收之鐮 kill → max HP +3 once
      { f: b => { prep(b); window.__mh = KD.state(Game.st).hpPlus || 0; foe(b).res.hp = 3; return play(b, 'lg_harvest'); }, c: b => { const d = (KD.state(Game.st).hpPlus || 0) - window.__mh; return (d === 3 ? 'PASS' : 'FAIL') + ' 豐收之鐮 max HP +' + d + ' (want 3)'; } },
    ];
    G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message); } pend = null; }
      const st = S[i++]; if (!st) { for (const u of b.core.side('B')) u.res.hp = 1; return { k: 'end' }; } pend = st.c; return st.f(b); };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 30, kind: 'wild' })); }, save);
  for (let i = 0; i < 4000; i++) { const s = await g.ev(() => { const b = __game.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; __game.step(1); return 'in'; }); if (s === 'out') break; }
  g.log((await g.ev(() => window.__T)).join('\n'));
  for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  g.log(await g.ev(() => { const d = (KD.state(__game.Game.st).hpPlus || 0) - window.__mh; return (d === 3 ? 'PASS' : 'FAIL') + ' 豐收之鐮 kill → max HP +' + d + ' (want 3)'; }));
  // second battle: meteor timing, 劍聖之心 across turns, 魔人契約 at 1 HP
  await g.ev(() => { const G = __game; window.__on = 0; const T = window.__T = []; let i = 0, pend = null; const foe = b => b.core.alive('B')[0], H = b => b.core.byId.H;
    const prep = b => { for (const u of b.core.side('B')) { u.statuses = u.statuses.filter(q => q.id !== 'blk15'); u.max.hp = Math.max(u.max.hp, 99999); } b.energy = 9; H(b).res.hp = Math.max(H(b).res.hp, 2); };
    const play = (b, id, up = 0) => { b.hand.unshift({ id, up }); const C = KD.CARDS[id], f = b.core.alive('B'); return { cmd: b.playK(0, C.tg === 'enemy' && f[0] ? f[0].id : null) }; };
    const S = [
      { f: b => { prep(b); for (const u of b.core.side('B')) u.res.hp = 99999; return play(b, 'mg_meteor'); }, c: b => 'meteor cast' },
      { f: b => { prep(b); window.__hs = b.core.alive('B').map(u => u.res.hp); return play(b, 'sw_defend'); }, c: b => { const same = b.core.alive('B').every((u, k) => u.res.hp === window.__hs[k]); return (same && stkK(H(b), 'chgM14') ? 'PASS' : 'FAIL') + ' 隕石 not falling on the same turn (pending ' + stkK(H(b), 'chgM14') + ')'; } },
      { f: b => { KD.block(b.core, H(b), 9999); window.__hs = b.core.alive('B').map(u => u.res.hp); window.__turn = b.turns; return { k: 'end' }; }, c: b => { const lost = b.core.alive('B').map((u, k) => window.__hs[k] - u.res.hp); return (!stkK(H(b), 'chgM14') && b.turns === window.__turn + 1 && lost.every(x => x > 0) ? 'PASS' : 'FAIL') + ' 隕石 fell at the next turn start: ' + lost.join(',') + ' turn ' + b.turns; } },
      { f: b => { prep(b); return play(b, 'sw_master'); }, c: () => 'master' },
      { f: b => { prep(b); return play(b, 'sw_strike'); }, c: () => 'a1' },
      { f: b => { prep(b); return play(b, 'sw_strike'); }, c: () => 'a2' },
      { f: b => { KD.block(b.core, H(b), 9999); return { k: 'end' }; }, c: b => 'end' },
      { f: b => { prep(b); window.__e = b.energy; return play(b, 'sw_strike'); }, c: b => { const ok = b.energy === 9 - 1 + 1; return (ok ? 'PASS' : 'FAIL') + ' 劍聖之心 3rd attack across turns → energy ' + b.energy + ' (want 9), masterN ' + b.masterN; } },
      { f: b => { prep(b); KD.add(b.core, H(b), H(b), 'pwVictor14', 2); KD.add(b.core, H(b), H(b), 'pwRage14', 1); H(b).res.hp = 1; KD.block(b.core, H(b), 9999); window.__noheal = 1; window.__str = stkK(H(b), 'str15'); return { k: 'end' }; },
        c: b => { return 'victor@1HP: energy ' + b.energy + ' (want ' + (3 + 1) + ' if no other bonus) hp ' + H(b).res.hp; } },
      { f: b => { window.__noheal = 0; H(b).res.hp = 30; KD.block(b.core, H(b), 9999); window.__str = stkK(H(b), 'str15'); return { k: 'end' }; }, c: b => { const ds = stkK(H(b), 'str15') - window.__str; return (ds === 1 ? 'PASS' : 'FAIL') + ' 魔人契約 triggers 狂暴: str +' + ds + ', energy ' + b.energy; } },
    ];
    G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message); } pend = null; }
      const st = S[i++]; if (!st) { for (const u of b.core.side('B')) u.res.hp = 1; return { k: 'end' }; } pend = st.c; return st.f(b); };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 30, kind: 'wild' })); });
  for (let i = 0; i < 6000; i++) { const s = await g.ev(() => { const b = __game.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; const H = b.core && b.core.byId.H; if (H && H.res.hp < 20 && !window.__noheal) H.res.hp = 40; __game.step(1); return 'in'; }); if (s === 'out') break; }
  g.log((await g.ev(() => window.__T)).join('\n'));
};
