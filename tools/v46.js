// ch2 classes: every advanced class uses each of its tree skills in a real battle (foe forced to attack physically)
module.exports = async (g) => {
  const classes = ['bard', 'machinist', 'monk', 'dragoon'];
  for (const cls of classes) {
    await g.ev((cls) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      const base = CLASSES[cls].from || 'swordsman'; applyStartClass(base); for (const n of skillTreeOf(base)) st.skills[n.id] = 2; st.cls = cls; if (!CLASSES[cls].from) st.baseCls = base; for (const n of skillTreeOf(cls)) st.skills[n.id] = 1;
      st.hp = heroStats().hp; st.mp = heroStats().mp; G.UI.clear(); const ow = G.Game.scene; ow.script = null; window.__log = [];
      const tree = skillTreeOf(cls).map(n => n.id); let k = 0;
      G.Game.autoPlay = b => { const id = tree[k++ % tree.length]; st.mp = heroStats().mp; if (st.hp < heroStats().hp * 0.5) st.hp = heroStats().hp; return { type: 'move', id }; };
      Battle.prototype.foeChoose = function () { const phys = this.F.moves.map(m => m.id).find(id => MOVES[id].cat === '物' && MOVES[id].pow) || this.F.moves[0].id; return { type: 'move', id: phys }; };
      const _m = Battle.prototype.msg; if (!Battle.prototype.__logged) { Battle.prototype.__logged = 1; Battle.prototype.msg = function* (t, o) { window.__log.push(t); yield* _m.call(this, t, o); }; }
      ow.run(ow.battleScript({ sp: 'gatekeeper', lv: 26, kind: 'boss', id: 'gatekeeper' }));
    }, cls);
    let turns = 0;
    for (let i = 0; i < 900; i++) { const s = await g.ev(() => __game.Game.scene.constructor.name); if (s !== 'Battle' && i > 10) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); turns = i; if (await g.ev(() => __game.Game.scene.turn >= 12)) break; }
    const out = await g.ev((cls) => { const b = __game.Game.scene, st = __game.Game.st; return { cls, turn: b.turn, usable: usableSkills(st).join(','), inh: (st.inh || []).join(','), log: window.__log.filter(t => !/使用了|擊中要害|打中弱點|被抵抗/.test(t)).slice(0, 40).join(' | ') }; }, cls);
    g.log(JSON.stringify(out));
  }
};
