// monster skill effects: do the particles land on the hero? (every monster move with power, for a small and a big monster)
module.exports = async (g) => {
  const res = {};
  for (const sp of ['slime', 'lavaGiant']) {
    await g.ev((sp) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp;
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; }; G.Game.autoPlay = null;
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: 30, kind: SPECIES[sp].boss ? 'boss' : 'wild' })); }, sp);
    for (let i = 0; i < 80; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
    res[sp] = await g.ev(() => {
      const b = __game.Game.scene, H = b.H, F = b.F, T = b.center(H), U = b.center(F), box = { x0: T.x - 30, x1: T.x + 30, y0: T.y - 30, y1: T.y + 28 };
      const out = {}; const used = new Set(); for (const k in SPECIES) for (const [, m] of SPECIES[k].learn || []) used.add(m); const ids = [...used].filter(id => MOVES[id] && !MOVES[id].heal && !(MOVES[id].stat && MOVES[id].stat.who === 'self') && !(!MOVES[id].pow && !MOVES[id].st && !MOVES[id].stat));
      for (const id of ids) { const mv = MOVES[id], name = MFX[id] ? id : (mv.fx || id); b.fx = [];
        try { const gen = b.playFx(name, F, H); let k = 0; while (!gen.next().done && k++ < 3000) { b.offF.x = b.offF.y = 0; } } catch (e) { out[id] = 'ERR ' + e.message; continue; }
        const pts = []; for (const p of b.fx) { if (p.k === 'flash' || p.k === 'txt') continue; if (p.x2 !== undefined) pts.push([p.x2, p.y2]); else if (p.x !== undefined) pts.push([p.x, p.y]); else if (p.tx !== undefined) pts.push([p.tx, p.ty]); }
        b.fx = []; b.offF.x = b.offF.y = 0; b.shake = 0;
        const near = pts.filter(([x, y]) => y > U.y + 20), inside = near.filter(([x, y]) => x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1);
        const cx = near.length ? near.reduce((a, p) => a + p[0], 0) / near.length : 0, cy = near.length ? near.reduce((a, p) => a + p[1], 0) / near.length : 0;
        out[id] = { n: near.length, all: pts.length, in: near.length ? Math.round(inside.length / near.length * 100) : -1, cx: Math.round(cx), cy: Math.round(cy), fx: name, mfx: !!MFX[name] }; }
      return { box, T, U, out };
    });
  }
  const A = res.slime, B = res.lavaGiant; g.log('hero box', JSON.stringify(A.box), 'foe', JSON.stringify(A.U), JSON.stringify(B.U));
  const rows = Object.keys(A.out).filter(id => { const a = A.out[id], b = B.out[id]; return typeof a === 'string' || typeof b === 'string' || a.in < 40 || b.in < 40; });
  g.log('checked', Object.keys(A.out).length, 'flagged', rows.length);
  for (const id of rows) g.log(id.padEnd(16), 'small', JSON.stringify(A.out[id]), ' big', JSON.stringify(B.out[id]));
};
