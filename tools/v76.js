// where does each hero skill's effect land? particles spawned during playFx + heroImpact vs the foe's sprite box (big boss vs normal)
module.exports = async (g) => {
  const res = {};
  for (const sp of ['gatekeeper', 'wolf']) {
    await g.ev((sp) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp;
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; }; G.Game.autoPlay = null;
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: 30, kind: sp === 'gatekeeper' ? 'boss' : 'wild', id: sp })); }, sp);
    for (let i = 0; i < 80; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
    res[sp] = await g.ev(() => {
      const b = __game.Game.scene, H = b.H, F = b.F, T = b.center(F), im = b.imgF, hw = (im.bb.vw || im.bb.w) / 2 + 4, box = { x0: T.x - hw, x1: T.x + hw, y0: T.y - im.bb.h / 2 - 4, y1: T.y + im.bb.h / 2 + 4 };
      const ids = new Set(); for (const k in CLASSES) for (const n of skillTreeOf(k)) ids.add(n.id); for (const k in CLASS_FREE) for (const id of CLASS_FREE[k]) ids.add(id);
      const out = {}; const _sp = b.spawn;
      for (const id of ids) { const mv = MOVES[id]; if (!mv || !mv.pow) continue; const pts = []; b.fx = [];
        try { const m = skillMove(id); const gen = (function* () { yield* b.playFx(m.fx, H, F); yield* heroImpact.call(b, b.center(F), m, { mult: 1, crit: false }, id, H); if (m.hitFx && FX[m.hitFx]) for (let i = 1; i < (m.hits || 2); i++) yield* FX[m.hitFx].call(b, b.center(H), b.center(F), H, i, m.hits || 2); })(); let k = 0; while (!gen.next().done && k++ < 3000) { b.offH.x = 0; b.offH.y = 0; } } catch (e) { out[id] = 'ERR ' + e.message; continue; }
        for (const p of b.fx) { if (p.k === 'flash' || p.k === 'txt') continue; if (p.x2 !== undefined) pts.push([p.x2, p.y2]); else if (p.x !== undefined) pts.push([p.x, p.y]); else if (p.tx !== undefined) pts.push([p.tx, p.ty]); } b.fx = []; b.offH.x = b.offH.y = 0; b.shake = 0;
        const far = pts.filter(([x, y]) => y < 142), inside = far.filter(([x, y]) => x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1);
        const cy = far.length ? far.reduce((a, p) => a + p[1], 0) / far.length : 0, cx = far.length ? far.reduce((a, p) => a + p[0], 0) / far.length : 0;
        out[id] = { n: far.length, in: far.length ? Math.round(inside.length / far.length * 100) : -1, cx: Math.round(cx), cy: Math.round(cy) }; }
      return { box, T, out };
    });
  }
  const B = res.gatekeeper, S = res.wolf; g.log('boss box', JSON.stringify(B.box), 'wolf box', JSON.stringify(S.box));
  const rows = Object.keys(B.out).map(id => [id, B.out[id], S.out[id]]).filter(([, b, s2]) => typeof b === 'string' || b.in < 60 || (s2 && s2.in < 60)).sort((a, b2) => (a[1].in || 0) - (b2[1].in || 0));
  for (const [id, b, s] of rows) g.log(id.padEnd(14), 'boss', JSON.stringify(b), ' wolf', JSON.stringify(s));
};
