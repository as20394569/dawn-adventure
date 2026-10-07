// page-side playtest bot: follows the tracked quest's guidance (questGuide), fights with a simple AI, answers dialogue with A
module.exports = () => {
  if (window.BOT) return;
  const G = __game, Gm = G.Game;
  const B = window.BOT = { log: [], dlg: [], frames: 0, battles: 0, deaths: 0, lastQ: '', sameQ: 0, menuSame: 0, lastMenu: '', grind: 0, fail: {}, note: '' };
  const lg = s => { const st = Gm.st; B.log.push('[' + Math.round(B.frames / 60) + 's Lv' + (st && st.lv) + ' ' + (st && st.map) + '] ' + s); };
  B.lg = lg;
  const step = n => { for (let i = 0; i < n; i++) { G.step(1); B.frames++; } };
  const press = (k, hold = 1, after = 2) => { G.Input.set(k, true); step(hold); G.Input.set(k, false); step(after); };
  B.press = press; B.step = step;
  // dialogue log
  { const _ds = dlgSetup; dlgSetup = function (t, o) { const r = _ds(t, o); const st = Gm.st; B.dlg.push((r.spk && r.spk.name ? r.spk.name + '：' : '') + String(t).replace(/\n/g, ' ')); return r; }; }
  // battle messages too (the level-up text and other battle lines never went through dlgSetup)
  { const _bm = Battle.prototype.msg; Battle.prototype.msg = function* (t, ...a) { if (typeof t === 'string') B.dlg.push('［戰鬥］' + t.replace(/\n/g, ' ')); return yield* _bm.call(this, t, ...a); }; }
  // battle AI
  Gm.autoPlay = b => { const core = b.core, H = core.byId.H, foes = core.alive('B'), st = Gm.st;
    if (foes.some(f => core.hasStatus(f, 'charging'))) return { type: 'defend' };
    if (window.BOT_INT && typeof intentOf14 === 'function' && core.plan) { let tot = 0; for (const f of foes) { const I = intentOf14(core, f, core.plan[f.id]); if (I && (I.k === 'heavy' || I.k === 'atk' || I.k === 'steal')) tot += parseInt(I.t.replace(/[^0-9]/g, '')) || 0; } if (tot >= H.max.hp * 0.3 && tot < H.res.hp * 1.5) return { type: 'defend' }; }
    if (H.res.hp < H.max.hp * (window.BOT.healAt || 0.35)) { for (const k of ['megaPotion', 'superPotion', 'potion']) if (st.bag[k] > 0 && ((ITEMS[k] || {}).v || 999) >= H.max.hp * 0.2) return { type: 'item', item: k }; }
    let best = H.data.attackSkill, bv = -1; const f0 = foes[0];
    for (const id of H.skills.concat([H.data.attackSkill])) { const D = DEF.skills[id]; if (!D || !D.power || core.onCooldown(H, id) || !b.canUse(id).ok) continue; if (D.requires && !condOk(D.requires, { core, owner: H, src: H, skill: D })) continue;
      let v = 0; try { v = b.estimate(id, f0.id) * (D.target === 'all_enemies' ? foes.length : 1); } catch (e) { v = D.power; } if (v > bv) { bv = v; best = id; } }
    if (window.BOT_INT && foes.length > 1) { const ok = foes.filter(f => !['dive14', 'fly14', 'cguard14'].some(k => core.hasStatus(f, k))), L = (ok.length ? ok : foes).slice().sort((a, b) => a.res.hp - b.res.hp); return { type: 'skill', skill: best, targets: [L[0].id] }; }
    return { type: 'skill', skill: best }; };
  // map helpers
  const key = (x, y) => x + ',' + y;
  function bfs(ow, tx, ty, adj) { const P = ow.p, prev = {}, q = [[P.x, P.y]]; prev[key(P.x, P.y)] = null; const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const goal = (x, y) => adj ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : (x === tx && y === ty);
    if (goal(P.x, P.y)) return { here: true };
    while (q.length) { const [x, y] = q.shift(); for (const d in D) { const nx = x + D[d][0], ny = y + D[d][1], k = key(nx, ny); if (prev[k] !== undefined || nx < 0 || ny < 0 || nx >= ow.map.w || ny >= ow.map.h) continue;
        const c = ow.tileAt(nx, ny), isGoal = (goal(nx, ny) && !(adj && ow.solidAt(nx, ny))) || (!adj && nx === tx && ny === ty);
        if (c === 'L' && d !== 'down') continue; if (!isGoal && (ow.solidAt(nx, ny) || (ow.entityAt(nx, ny, P) && !(B.fightRoam && (ow.elites || []).some(e => e.roam && e.x === nx && e.y === ny))) || (ow.map.doors && ow.map.doors[k]))) continue; if (isGoal && !adj && ow.solidAt(nx, ny) && !(ow.map.doors && ow.map.doors[k])) continue;
        prev[k] = [x, y, d]; if (isGoal && goal(nx, ny)) { let cur = [nx, ny], first = null; while (prev[key(cur[0], cur[1])]) { const [px, py, dd] = prev[key(cur[0], cur[1])]; first = dd; cur = [px, py]; } return { dir: first, at: [nx, ny] }; } q.push([nx, ny]); } }
    return null; }
  function stepDir(ow, d) { const x0 = ow.p.x, y0 = ow.p.y; G.Input.set(d, true); G.Input.set('b', true); for (let i = 0; i < 40; i++) { if (ow.p.moving && ow.p.prog + ow.p.speed >= (ow.p.jump ? 32 : 16)) { G.Input.set(d, false); G.Input.set('b', false); } step(1); if ((ow.p.x !== x0 || ow.p.y !== y0) && !ow.p.moving) break; if (Gm.scene !== ow || ow.script) break; } G.Input.set(d, false); G.Input.set('b', false); step(1); return ow.p.x !== x0 || ow.p.y !== y0; }
  B.stepDir = stepDir;
  function face(ow, x, y) { const dx = x - ow.p.x, dy = y - ow.p.y; const d = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; G.Input.set(d, true); step(1); G.Input.set(d, false); step(3); return d; }
  // edge exit toward dir
  function edgeTarget(ow, dir) { const W = ow.map.w, H = ow.map.h, P = ow.p; let best = null, bd = 1e9;
    for (let i = 0; i < (dir === 'up' || dir === 'down' ? W : H); i++) { const x = dir === 'left' ? 0 : dir === 'right' ? W - 1 : i, y = dir === 'up' ? 0 : dir === 'down' ? H - 1 : i; if (ow.solidAt(x, y)) continue; const d = Math.abs(x - P.x) + Math.abs(y - P.y); if (d < bd) { bd = d; best = [x, y]; } } return best; }
  // one decision on the overworld; returns a short status
  B.navTo = (ow, tx, ty, adj) => { const r = bfs(ow, tx, ty, adj); if (!r) return 'nopath'; if (r.here) return 'here'; stepDir(ow, r.dir); return 'moving'; };
  B.goal = null;
  B.tick = () => {
    const ow = Gm.ow, sc = Gm.scene, st = Gm.st; const top = G.UI.stack[G.UI.stack.length - 1];
    if (sc && sc.constructor && sc.constructor.name === 'Battle') { if (!B.inBattle) { B.inBattle = 1; B.battles++; } if (top) press('a', 1, 4); else step(4); return 'battle'; }
    if (B.inBattle) { B.inBattle = 0; if (st.hp <= 0) B.deaths++; }
    if (top) { const sig = top.constructor.name + (top.items ? top.items.map(i => i.t).join('/') : '') + (top.lines ? top.lines.join('') : ''); if (sig === B.lastMenu) B.menuSame++; else { B.menuSame = 0; B.lastMenu = sig; }
      if (top.items && top.items[0] && top.items[0].t === '再挑戰' && !top.done) { B.retryN = (B.retryN || 0) + 1; if (B.retryN <= 2) { lg('再挑戰'); press('a', 1, 4); } else { B.retryN = 0; lg('回去準備'); press('down', 1, 4); press('a', 1, 4); } return 'retry'; }
      if (top.items && B.menuSame > 6) { press('b', 1, 4); return 'menu-b'; } press('a', 1, 4); return 'ui'; }
    if (sc !== ow || !ow || ow.script || !ow.p) { step(4); press('a', 1, 2); return 'script'; }
    if (typeof trLeft11 === 'function' && trLeft11(st) > 0 && !B.noLearn && TREE11[mainKind11(st)]) { const kind = mainKind11(st), T = tr11(st); for (const N of treeNodes11(kind).filter(N => N.lv <= st.lv && (N.t === 'sk' || N.t === 'mast'))) { if (trLeft11(st) <= 0) break; const cur = T.lv[N.key] || 0; if (cur >= N.max || (N.pre && !T.lv[N.pre])) continue; if (N.t === 'sk' && cur >= 2 && treeNodes11(kind).some(q => q.t === 'sk' && q.lv <= st.lv && !T.lv[q.key] && (!q.pre || T.lv[q.pre]))) continue; T.lv[N.key] = cur + 1; if (!cur) { BB.slots(st); B.lg('學會 ' + (DEF.skills[N.key] ? DEF.skills[N.key].name : N.key)); } } }
    if (typeof attrAvail === 'function' && attrAvail(st) > 0) attrAuto(st);
    // a player who follows the smithing hint: in town after a defeat, craft the best affordable tier for each slot
    if (!B.noSmith && typeof craftHint13 === 'function' && B.deaths !== B.smithAt && ['home', 'town', 'capital', 'inn', 'frostVillage', 'harbor13'].includes(st.map)) { B.smithAt = B.deaths;
      if (craftHint13(st)) { bagToPts11(st); for (const sl of ['weapon', 'body', 'head', 'feet', 'shield']) { const g = gearBy(st.equip[sl], st), grp = groupOf13(g), t0 = tierOf13(g); if (!grp || !t0 || !CRAFTCAT11[grp]) continue;
          for (let t = craftTop11(st); t > t0; t--) { const c = craftCost11(grp, t); if (!ptsHave11(c.pts) || st.money < c.gold) continue; const k = sl === 'weapon' ? BASE11.weapon[grp][t - 1] : sl === 'shield' ? BASE11.shield[t - 1] : BASE11.armor[grp][sl][t - 1]; if (!k) continue;
            ptsPay11(c.pts); st.money -= c.gold; GEAR11_GLAM = false; const ng = makeGear(k, rollQ11(smith11(st).lv)); GEAR11_GLAM = true; st.equip[sl] = ng.u; lg('打造 ' + GEAR[k].n + ' T' + t); break; } }
        BB.slots(st); clampHP(); } }
    return 'free';
  };
};
