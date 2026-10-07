() => { window.__walk = (tx, ty, run = true, door = true) => { const G = __game, out = [];
  for (let guard = 0; guard < 300; guard++) { const ow = G.Game.scene; if (!ow || !ow.p) return 'no-ow'; if (ow.script || G.UI.stack.length) return 'busy@' + ow.p.x + ',' + ow.p.y;
    const P = ow.p; if (P.x === tx && P.y === ty) return 'done';
    const key = (x, y) => x + ',' + y, prev = {}, q = [[P.x, P.y]]; prev[key(P.x, P.y)] = null; const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break; for (const d in D) { const nx = x + D[d][0], ny = y + D[d][1]; if (prev[key(nx, ny)] !== undefined) continue; if (nx < 0 || ny < 0 || nx >= ow.map.w || ny >= ow.map.h) continue; const isT = nx === tx && ny === ty; const c = ow.tileAt(nx, ny); const ent = ow.entityAt(nx, ny, P), isRoam = ent && ow.roam12 && (ow.roam12.list || []).includes(ent); if (!isT && (c === 'L' || ow.solidAt(nx, ny) || (ent && !isRoam) || ow.map.doors[key(nx, ny)])) continue; if (isT && (ow.solidAt(nx, ny) && !ow.map.doors[key(nx, ny)])) continue; prev[key(nx, ny)] = [x, y, d]; q.push([nx, ny]); } }
    if (prev[key(tx, ty)] === undefined) return 'nopath@' + P.x + ',' + P.y;
    let cur = [tx, ty], first = null; while (prev[key(cur[0], cur[1])]) { const [px, py, d] = prev[key(cur[0], cur[1])]; first = d; cur = [px, py]; }
    const x0 = P.x, y0 = P.y, m0 = ow.map.id; G.Input.set(first, true); if (run) G.Input.set('b', true);
    for (let i = 0; i < 40; i++) { if (P.moving && P.prog + P.speed >= (P.jump ? 32 : 16)) { G.Input.set(first, false); G.Input.set('b', false); } G.step(1); if ((P.x !== x0 || P.y !== y0) && !P.moving) break; if (G.Game.scene !== ow || ow.script || G.UI.stack.length) break; }
    G.Input.set(first, false); G.Input.set('b', false); G.step(1); if (G.Game.scene !== ow || ow.map.id !== m0) { G.step(30); return 'mapchange'; } }
  return 'guard'; }; return 'ok'; }
