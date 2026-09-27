// chapter 2 main path, end to end (strong hero): every story event and boss runs without errors
module.exports = async (g) => {
  const setup = await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, wolf: 1 }); st.lv = 44; st.map = 'town'; st.x = 12; st.y = 6; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    applyStartClass('swordsman'); st.cls = 'swordmaster'; for (const n of skillTreeOf('swordmaster')) st.skills[n.id] = 3;
    for (const [s, k] of [['weapon', 'moldBlade'], ['head', 'duskHelm'], ['body', 'duskPlate'], ['feet', 'voidBoots'], ['acc1', 'lavaHeart'], ['acc2', 'voidRing']]) { const gg = makeGear(k, 3); st.equip[s] = gg.u; }
    st.attr = null; attrAuto(st); st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag.elixir = 20; st.bag.superPotion = 99; st.bag.ether = 99; st.bag.megaPotion = 30; st.money = 99999; window.__log = []; const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { window.__log.push(t); if (window.__log.length > 60) window.__log.shift(); yield* _m.call(this, t, o); }; return JSON.stringify(heroStats()); });
  g.log('hero', setup);
  const pump = async (label, max = 3000) => {
    for (let i = 0; i < max; i++) {
      const s = await g.ev(() => { const G = __game, sc = G.Game.scene; return { n: sc.constructor.name, busy: !!(sc.script) || G.UI.stack.length > 0 || G.Game.sys.length > 0 }; });
      if (s.n === 'Battle') { await g.ev(() => { const b = __game.Game.scene; if (b.F && !b.__trim) { b.__trim = 1; b.F.hp = Math.ceil(b.F.maxhp * 0.15); } }); await g.autoBattle('smart'); continue; }
      if (s.n !== 'Overworld' && s.n !== 'Battle') { await g.press('a', 6); continue; }
      if (!s.busy) return true;
      const u = await g.ui(); if (u.includes('是/否')) await g.press('a', 6); else await g.press('a', 6);
    }
    g.log('STUCK', label, await g.ui()); return false;
  };
  const ev = async (map, x, y, name) => { await g.ev(([map, x, y, name]) => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); const st = G.Game.st; st.hp = heroStats().hp; st.mp = heroStats().mp; st.status = null; if (map) ow.load(map, x, y, 'up', true); const e = G.Events[name]; const r = e(ow); if (r) ow.run(r); }, [map, x, y, name]); await pump(name);
    return g.ev(() => { const st = __game.Game.st; return 'ch2=' + st.flags.ch2 + ' map=' + st.map + ' lv=' + st.lv + ' hp=' + st.hp; }); };
  g.log('royalKnight', await ev('town', 12, 6, 'royalKnight'));
  g.log('ambush', await ev('northRoad', 10, 27, 'roadAmbush'));
  g.log('arrive', await g.ev(() => { const ow = __game.Game.scene; ow.load('capital', 13, 27, 'up'); return 'ch2=' + __game.Game.st.flags.ch2; }));
  g.log('liaCap', await ev(null, 0, 0, 'liaCap'));
  g.log('king', await ev('castle', 6, 4, 'king'));
  g.log('liaQuest', await ev('capital', 15, 8, 'liaCap'));
  g.log('ratBoss', await ev('capSewer', 10, 3, 'ratBoss')); g.log(await g.ev(() => window.__log.slice(-25).join(' | ')));
  g.log('harvest', await ev('goldPlains', 12, 4, 'harvestBoss'));
  g.log('clockmaker', await ev('clockShop', 1, 4, 'clockmaker'));
  g.log('colossus', await ev('clockTower2', 7, 7, 'colossusBoss'));
  g.log('king2', await ev('castle', 6, 4, 'king'));
  g.log('frostElder', await ev('frostHouse', 5, 4, 'frostElder'));
  g.log('queen', await ev('iceCave', 9, 3, 'queenBoss'));
  g.log('giant', await ev('lavaTunnel', 10, 3, 'giantBoss')); g.log(await g.ev(() => window.__log.slice(-40).join(' | ')));
  g.log('victor', await ev('duskFort1', 10, 4, 'victorBoss'));
  g.log('mold', await ev('duskFort2', 8, 7, 'moldBoss'));
  g.log('finale', await ev(null, 0, 0, 'dawnBell'));
  for (let i = 0; i < 200; i++) { const n = await g.ev(() => __game.Game.scene.constructor.name); if (n === 'Overworld') break; await g.hold('a', 30); await g.press('a', 10); }
  g.log('after ending', await g.ev(() => { const st = __game.Game.st; return __game.Game.scene.constructor.name + ' ch2=' + st.flags.ch2 + ' map=' + st.map; }));
  g.log('star', await ev('starShrine', 9, 3, 'starBoss')); g.log(await g.ev(() => window.__log.slice(-40).join(' | ')));
  g.log('quests', await g.ev(() => questList(__game.Game.st).slice(0, 6).map(q => q.n + ':' + q.t.slice(0, 30)).join(' | ')));
  g.log('ach', await g.ev(() => ACHIEVEMENTS.filter(a => a.ok(__game.Game.st)).map(a => a.id).join(',')));
};
