(() => { const B = window.BOT, G = __game, Gm = G.Game;
  B.travel = (ow, st, R) => { const G = __game, Gm = G.Game;

      const next = R[1], via = (mapGraph()[st.map] || {})[next];
      if (!via) return { stop: 'no via ' + st.map + '→' + next };
      if (via.coach) { const r = B.navTo(ow, via.x, via.y, true); if (r === 'nopath') return { stop: 'cannot reach coach ' + via.npc }; if (r === 'here') { const P = { town: [19, 6], maplePass: [12, 32], northRoad: [10, 37], capital: [5, 27], frostVillage: [2, 13], harbor13: [3, 7] }[via.coach]; if (st.money < 200) return { stop: 'no money for coach' }; st.money -= 200; B.lg('搭馬車：' + MAPS[st.map].name + ' → ' + MAPS[via.coach].name); ow.load(via.coach, P[0], P[1], 'down'); B.step(10); } return; }
      if (via.npc) { const r = B.navTo(ow, via.x, via.y, true); if (r === 'nopath') return { stop: 'cannot reach entrance ' + via.npc }; if (r === 'here') { const dx = via.x - ow.p.x, dy = via.y - ow.p.y, dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; G.Input.set(dir, true); B.step(1); G.Input.set(dir, false); B.step(3); B.press('a', 1, 6); if (B.etKey !== st.map + via.npc) { B.etKey = st.map + via.npc; B.etalk = 0; } B.etalk = (B.etalk || 0) + 1; if (B.etalk > 30) return { stop: 'entrance ' + via.npc + ' does not open' }; } return; }
      if (via.x != null && via.y != null) { const r = B.navTo(ow, via.x, via.y, false); if (r === 'nopath') { const r2 = B.navTo(ow, via.x, via.y + 1, false); if (r2 === 'here') { B.stepDir(ow, 'up'); return; } if (r2 === 'nopath') return { stop: 'cannot reach exit to ' + next + ' at ' + via.x + ',' + via.y }; } if (r === 'here') { const W = ow.map.w, H = ow.map.h, x = ow.p.x, y = ow.p.y; const ds = y >= H - 1 ? ['down'] : y <= 0 ? ['up'] : x <= 0 ? ['left'] : x >= W - 1 ? ['right'] : ['down', 'up', 'left', 'right']; const m0 = st.map; for (const d of ds) { B.stepDir(ow, d); B.step(20); if (Gm.st.map !== m0 || Gm.scene !== ow) break; } } return; }
      if (via.dir) { const W = ow.map.w, H = ow.map.h; let best = null, bd = 1e9; for (let i = 0; i < (via.dir === 'up' || via.dir === 'down' ? W : H); i++) { const x = via.dir === 'left' ? 0 : via.dir === 'right' ? W - 1 : (via.x != null ? via.x : i), y = via.dir === 'up' ? 0 : via.dir === 'down' ? H - 1 : i; if (ow.solidAt(x, y)) continue; const d = Math.abs(x - ow.p.x) + Math.abs(y - ow.p.y); if (d < bd) { bd = d; best = [x, y]; } }
        if (!best) return { stop: 'no edge ' + via.dir }; const r = B.navTo(ow, best[0], best[1], false); if (r === 'nopath') { B.fail[best] = (B.fail[best] || 0) + 1; return { stop: 'cannot reach edge ' + via.dir + ' ' + best + ' toward ' + next }; } if (r === 'here') B.stepDir(ow, via.dir); return; }
      return { stop: 'via without position ' + JSON.stringify(via) };
    
  };
  B.brain = () => {
    const ow = Gm.ow, st = Gm.st; { const M = questList(st).find(x => x.main && !x.done); if (M && st.track !== M.n) { if (st.track && !B.trackLog) { B.trackLog = 1; B.lg('（追蹤被換成「' + st.track + '」→ 換回主線）'); } st.track = M.n; } } const q = questTracked(st);
    if (!q) return { stop: 'no quest' };
    if (q.t !== B.lastQ) { B.lg('【' + q.n + '】' + q.t); B.lastQ = q.t; B.sameQ = 0; B.goal = null; }
    B.sameQ++; if (B.sameQ > 5000) return { stop: 'stuck on quest: ' + q.t };
    // grind like a careful player: below the quest's recommended level, go fight the nearest roaming monster
    const mm = /推薦Lv(\d+)/.exec(q.t || ''), rec = mm ? +mm[1] : 0; B.fightRoam = true;
    if (rec && st.lv < rec && B.fastLv) { const need = expForLevel(rec) - st.exp; B.lg('需要練等：Lv' + st.lv + ' → ' + rec + '（還差 ' + need + ' EXP）→ 這次直接跳過'); B.skipped = (B.skipped || 0) + need; st.lv = rec; st.exp = expForLevel(rec); try { const h = heroStats(); st.hp = h.hp; st.mp = h.mp; } catch (e) {} B.mKey = null; return; }
    if (rec && st.lv < rec) { const lvh = mapLevel(st.map); if (!lvh || lvh[1] < rec - 2) { let gm = null, gd = 1e9; for (const id in MAPS) { if (id === 'rift' || !MAPS[id].outdoor) continue; const L = mapLevel(id); if (!L || L[1] < rec - 2 || L[0] > st.lv + 1) continue; const R = mapRoute(st.map, id); if (R && R.length < gd) { gd = R.length; gm = R; } } if (gm && gm.length > 1) { if (B.gmLog !== gm[gm.length - 1]) { B.gmLog = gm[gm.length - 1]; B.lg('去練等地點：' + MAPS[B.gmLog].name); } return B.travel(ow, st, gm); } } }
    if (rec && st.lv < rec && (ow.elites || []).some(e => e.roam)) { const R = (ow.elites || []).filter(e => e.roam && !e.sleep12).sort((a, b) => (Math.abs(a.x - ow.p.x) + Math.abs(a.y - ow.p.y)) - (Math.abs(b.x - ow.p.x) + Math.abs(b.y - ow.p.y)));
      for (const e0 of R) { const r = B.navTo(ow, e0.x, e0.y, true); if (r === 'nopath') continue; if (!B.grinding) { B.grinding = 1; B.lg('練等：Lv' + st.lv + ' → 推薦Lv' + rec); } if (r === 'here') { const dx = e0.x - ow.p.x, dy = e0.y - ow.p.y; B.stepDir(ow, dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'); } return; } B.step(30); return; }
    if (B.grinding && (!rec || st.lv >= rec)) { B.grinding = 0; B.lg('練等結束 Lv' + st.lv + '（戰鬥 ' + B.battles + ' 場）'); }
    const Gd = questGuide(q, st, ow);
    if (!Gd) return { stop: 'no guidance for: ' + q.t };
    const D = Gd.D;
    if (D.map !== st.map) { const R = Gd.route; if (!R) return { stop: 'no route ' + st.map + '→' + D.map }; return B.travel(ow, st, R); }
    if (D.spot && ow.boss && ow.boss.x === D.spot.x && ow.boss.y === D.spot.y && Math.abs(D.spot.x - ow.p.x) + Math.abs(D.spot.y - ow.p.y) <= 2 && (D.spot.x === ow.p.x || D.spot.y === ow.p.y)) { const dx = D.spot.x - ow.p.x, dy = D.spot.y - ow.p.y; B.stepDir(ow, dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'); B.press('a', 1, 6); return; }
    if (D.spot) { const r = B.navTo(ow, D.spot.x, D.spot.y, true); if (r === 'nopath') return { stop: 'cannot reach ' + D.what + ' at ' + D.spot.x + ',' + D.spot.y }; if (r === 'here') { const n0 = B.dlg.length; const d = { up: 0 }; const dx = D.spot.x - ow.p.x, dy = D.spot.y - ow.p.y; const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up'; G.Input.set(dir, true); B.step(1); G.Input.set(dir, false); B.step(3); B.press('a', 1, 6); B.talks = (B.talks || 0) + 1; if (B.talks > 40) return { stop: 'talked too often to ' + D.what }; } return; }
    return { stop: 'here but no spot: ' + D.what + ' / ' + q.t };
  };
})();
(() => { const B = window.BOT, Gm = __game.Game;
  B.manage = () => { const st = Gm.st; if (!st || !st.cls) return; const lvKey = st.lv + ':' + st.map + ':' + st.money;
    if (B.mKey === lvKey) return; B.mKey = lvKey;
    try { attrAuto(st); } catch (e) {} try { TAL12.auto(st, 0); } catch (e) {}
    const cls = clsV7(st.cls), mag = ['mage', 'bard'].includes(cls), aff = (DEF.classes[cls] || {}).aff || [];
    const score = g => { if (!g) return -1; const s = gearStats(g).st; return (mag ? (s.spa || 0) * 2 : (s.atk || 0) * 2) + (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 3 + (s.spe || 0) * 0.5 + (s.mp || 0) / 4; };
    const mk = typeof kindPts13 === 'function' ? (TREE_KINDS11.filter(k => !TREE11[k].common && !TREE11[k].dual).sort((a, b) => kindPts13(b, st) - kindPts13(a, st))[0] || null) : null, wOK = k => mk ? GEAR[k].kind === mk : (!aff.length || aff.includes(GEAR[k].kind) || aff.includes('*'));
    // buy upgrades in town shops
    if (/town|capital|village|Village/.test(st.map) && typeof shopList === 'function') { let L = []; try { L = shopList(); } catch (e) {}
      for (const k of L) { const Gk = GEAR[k]; if (!Gk) continue; const sl = Gk.slot; if (sl === 'weapon' && !wOK(k)) continue; if (sl === 'shield') continue; const price = priceOf(k); if (price > st.money * 0.7) continue;
        const slotKey = sl === 'acc' ? 'acc1' : sl, cur = gearBy(st.equip[slotKey]); const fake = { b: k, q: 1, r: 0.9, a: [] }; if (score(fake) > score(cur) * 1.15 + 1) { st.money -= price; makeGear(k, 1); B.lg('買了 ' + Gk.n + '（' + price + ' G）'); } }
      for (const k of ['potion', 'superPotion']) { const want = k === 'potion' ? 6 : 3; while ((st.bag[k] || 0) < want && ITEMS[k] && L.includes(k) && priceOf(k) <= st.money * 0.3) { st.money -= priceOf(k); st.bag[k] = (st.bag[k] || 0) + 1; } } }
    if (/town|home|capital|village|Village|harbor/.test(st.map)) { const k = st.lv >= 25 ? 'megaPotion' : 'superPotion', pr = ITEMS[k].price, need = 10 - (st.bag[k] || 0), n = Math.max(0, Math.min(need, Math.floor((st.money * 0.5) / pr))); if (n > 0) { st.bag[k] = (st.bag[k] || 0) + n; st.money -= n * pr; B.lg('買了 ' + ITEMS[k].n + '×' + n); } }
    // forge at the smith like a player who read the hint: every ticket, plus recipes we can pay for that beat what we wear
    if (/town|home|capital|village|Village/.test(st.map) && typeof tkUse === 'function') {
      for (const k of Object.keys(st.bpT || {})) { const Gk = GEAR[k]; if (!Gk || (Gk.slot === 'weapon' && !wOK(k)) || Gk.slot === 'shield') continue; while (tkCount(k, st) > 0) { const q = Math.max(tkUse(k, st), 2); makeGear(k, q); B.lg('打造（打造券）' + Gk.n); } }
      for (const k of Object.keys(st.bp || {})) { const Gk = GEAR[k]; if (!Gk || !GEAR_RECIPE[k] || (Gk.slot === 'weapon' && !wOK(k)) || Gk.slot === 'shield' || !bpCan(k, 0, st)) continue; const sl = Gk.slot, cur = gearBy(st.equip[sl === 'acc' ? 'acc1' : sl]); if (score({ b: k, q: 2, r: 0.9, a: [] }) <= score(cur) * 1.1 + 1) continue; const c = bpCost(k, 0); st.money -= c.gold; for (const i in c.mats) st.bag[i] -= c.mats[i]; makeGear(k, bpRoll(0)); B.lg('打造（素材）' + Gk.n); } }
    // equip the best of each slot
    for (const sk of ['weapon', 'head', 'body', 'feet', 'acc1', 'acc2']) { const sl = SLOT_OF(sk); const cand = (st.gear || []).filter(g => GEAR[g.b] && GEAR[g.b].slot === sl && (sl !== 'weapon' || wOK(g.b)) && !Object.entries(st.equip).some(([k2, u]) => k2 !== sk && u === g.u));
      const best = cand.sort((a, b) => score(b) - score(a))[0], cur = gearBy(st.equip[sk]); if (best && (score(best) > score(cur) || (sk === 'weapon' && cur && !wOK(cur.b)))) { st.equip[sk] = best.u; B.lg('裝上 ' + GEAR[best.b].n); } }
    if (mk && typeof learnedTree11 === 'function') { const L = learnedTree11(st).filter(id => { const T = treeOf11(id); return T && (T[0] === mk || TREE11[T[0]].common); }).sort((a, b) => (tr11(st).lv[b] || 0) - (tr11(st).lv[a] || 0)); const nx = L.slice(0, BB.SLOTS); if (nx.join() !== (st.slots || []).join()) { st.slots = nx; B.lg('技能欄：' + nx.map(id => DEF.skills[id].name).join('、')); } }
    try { clampHP(); } catch (e) {} };
  const _b = B.brain; B.brain = () => { B.manage(); return _b(); };
})();

(() => { const B = window.BOT, Gm = __game.Game;
  // a careful player turns down a much stronger elite that is not what the quest asks for
  const _af = askFight; askFight = function* (sp, lv, key, kind, extra) { const st = Gm.st, q = questTracked(st), nm = (SPECIES[sp] || {}).n || '';
    const target = q && (q.t || '').includes(nm);
    if (lv > st.lv + 2 && !target) { B.lg('撤退：' + nm + ' Lv' + lv + '（不是任務目標）'); return false; }
    return yield* _af.call(this, sp, lv, key, kind, extra); };
  const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { const st = Gm.st, lv0 = st.lv; const r = yield* _bs.call(this, cfg, ...a);
    if (cfg && cfg.kind && cfg.kind !== 'wild') B.lg((cfg.kind === 'boss' ? '頭目' : '菁英') + '戰 ' + ((SPECIES[cfg.sp] || {}).n || cfg.sp) + ' Lv' + cfg.lv + ' → ' + r + '（我方Lv' + lv0 + '）');
    else if (r !== 'win') B.lg('野戰 ' + ((SPECIES[cfg && cfg.sp] || {}).n || '') + ' → ' + r);
    return r; };
})();
