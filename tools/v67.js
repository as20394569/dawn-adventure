// runtime: the non-formula gear specials trigger in a real battle (random forced low so every chance procs)
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp; st.mp = heroStats().mp;
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); window.__log = []; let n = 0;
    G.Game.autoPlay = b => { n++; return n % 3 === 0 ? { type: 'defend' } : { type: 'move', id: n % 3 === 1 ? 'attack' : 'powerSlash' }; };
    Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves.find(m => MOVES[m.id].pow && MOVES[m.id].cat === '物' && !MOVES[m.id].charge)?.id || this.F.moves[0].id }; };
    if (!Battle.prototype.__l3) { Battle.prototype.__l3 = 1; const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { window.__log.push(t); yield* _m.call(this, t, o); }; }
    ow.run(ow.battleScript({ sp: 'wolf', lv: 30, kind: 'wild' })); });
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  await g.ev(() => { const b = __game.Game.scene; b.H.stats.fx = { double: 1, thorns: 1, guardHeal: 1, regen: 1, endure: 1, first: 1, fervor: 1, stormMark: 1, cleave: 1, deathWard: 1, manaSiphon: 1, breaker: 1, mpGuard: 1, poisonEdge: 1, shadowStep: 1, freeCast: 1 }; b.H.stats.drain = 10; b.F.maxhp = b.F.hp = 99999; b.H.hp = Math.round(b.H.maxhp * 0.5); b.H.mp = 10; window.__R = Math.random; Math.random = () => 0.01; });
  for (let i = 0; i < 600; i++) { const s = await g.ev(() => __game.Game.scene.turn || 0); if (s >= 5) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(4); }); }
  await g.ev(() => { Math.random = window.__R; });
  const L = await g.ev(() => window.__log.join(' | ')); const want = { 劈裂: '劈裂', 狂熱: '狂熱', 吸魔: '吸魔', 麻痺: '麻痺', 中毒: '中毒', 守護之心: '守護之心', 靜心: '靜心', 荊棘: '荊棘', 吸血: '吸', 魔力循環: '魔力循環', 殘影: '殘影', 亡者守護: '亡者守護' };
  g.log(Object.entries(want).map(([k, w]) => k + (L.includes(w) ? ' OK' : ' --')).join('  '));
  g.log(L.slice(0, 1500));
};
