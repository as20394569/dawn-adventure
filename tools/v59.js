// multi-hit timing vs monster reactions: every hit's damage pops before break / phase / status messages
module.exports = async (g) => {
  for (const [cls, id] of [['assassin', 'flurry'], ['shadowdancer', 'bladeDance'], ['monk', 'hundredFists'], ['swordmaster', 'doubleSlash']]) {
    await g.ev(([cls, id]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      const base = CLASSES[cls].from || 'swordsman'; applyStartClass(base); st.cls = cls; for (const n of skillTreeOf(cls)) st.skills[n.id] = 2; st.skills[id] = 2; st.hp = heroStats().hp; st.mp = heroStats().mp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); window.__log = [];
      G.Game.autoPlay = b => { st.mp = heroStats().mp; if (b.H) b.H.chi = 4; return { type: 'move', id }; };
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
      if (!Battle.prototype.__l2) { Battle.prototype.__l2 = 1; const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { window.__log.push(t); yield* _m.call(this, t, o); }; const _p = Battle.prototype.popNum; Battle.prototype.popNum = function (b, n, c, tag) { window.__log.push('POP' + (b.hero ? 'H' : 'F') + n); return _p.call(this, b, n, c, tag); }; }
      ow.run(ow.battleScript({ sp: 'gatekeeper', lv: 24, kind: 'boss', id: 'gatekeeper' }));
    }, [cls, id]);
    for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
    await g.ev(() => { const F = __game.Game.scene.F; F.hp = Math.round(F.maxhp * 0.62); F.brk = 1; window.__log = []; });
    for (let i = 0; i < 400; i++) { const s = await g.ev(() => __game.Game.scene.turn || 0); if (s >= 2) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(4); }); }
    g.log(cls, id, await g.ev(() => window.__log.filter(t => !/使用了/.test(t)).slice(0, 14).join(' | ')));
  }
};
