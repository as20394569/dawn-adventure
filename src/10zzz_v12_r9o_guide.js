/* ===================== v12.0.9o 任務指引：到了地圖之後繼續指路（試玩：「遊戲流程有點雜亂」） =====================
   以前任務寫「到 A 地圖做 B」時，指引只指到 A 地圖；一進到 A 就只剩「（就在這裡）」，沒有箭頭。
   現在進到那張地圖後，會接著找任務說明裡提到、而且在這張地圖上的人、魔物（菁英・頭目）或地標，箭頭指過去。
   說明寫「到 A 西側的 B」而人已經在 A 時，改指向 B。 */
{ const _qd = questDest; questDest = function (q, st = Game.st) {
    let D = _qd(q, st); if (!D || !q || q.done || !st || questCom(q)) return D;
    if (D.map !== st.map && !D.spot) { const here = (MAPS[st.map] || {}).name, a = (q.t || '').indexOf((MAPS[D.map] || {}).name), b = here && here.length >= 2 ? (q.t || '').replace(/（[^）]*）/g, m => '\u3000'.repeat(m.length)).indexOf(here) : -1; if (a >= 0 && b > a) D = { map: st.map, what: '前往' + here }; // (v12.60: a hint in brackets — （萌芽鎮的馬車也能…） — is not where to go)
      else if (a >= 0 && (() => { for (const id in MAPS) { const nm = MAPS[id].name; if (!nm || nm.length < 2 || id === D.map) continue; const i = (q.t || '').indexOf(nm), m = mapIdByName(nm) || id, R = i > a && mapRoute(st.map, m); if (R && R.includes(D.map)) { D = { map: m, what: '前往' + nm }; return true; } } return false; })()) { } // 「到A西側的B」from elsewhere: head for B (the route passes A)
      else if (a >= 0) for (const n of MAPS[st.map].npcs || []) { if (!n.name || n.name.length < 2 || (n.show && !n.show(st))) continue; const i = (q.t || '').indexOf(n.name); if (i > a) return { map: st.map, spot: { x: n.x, y: n.y, name: n.name }, what: '找' + n.name }; } } // the person is right here, inside the house the text names (漢斯家) // already at the later map (到晨霧道路西側的碧溪谷, standing in 碧溪谷)
    if (D.map !== st.map && !mapRoute(st.map, D.map)) { // can't get there yet (往北方街道的關道被封鎖了。穿過楓紅關道…): the first named place we can reach
      let alt = null; for (const id in MAPS) { const nm = MAPS[id].name; if (!nm || nm.length < 2) continue; const i = (q.t || '').indexOf(nm), m = mapIdByName(nm) || id; if (i >= 0 && m !== D.map && (!alt || i < alt.i) && mapRoute(st.map, m)) alt = { i, map: m, nm }; }
      if (alt) D = alt.map === st.map ? { map: st.map, what: '前往' + alt.nm } : { map: alt.map, what: '前往' + alt.nm }; }
    if (D.map !== st.map) return D;
    const d = MAPS[D.map] || {}, t = (q.t || '').split(d.name || '\u0000').join('\u3000'.repeat((d.name || '').length)), ow = Game.ow, C = []; // the map's own name is not a target (風車 in 風車丘陵)
    for (const n of (ow && ow.map && ow.map.id === D.map && ow.npcs) || d.npcs || []) if (n.name && n.name.length >= 2 && (!n.show || n.show(st))) { C.push({ name: n.name, x: n.x, y: n.y }); if (n.name.length > 3) C.push({ name: n.name.slice(-2), x: n.x, y: n.y, full: n.name }); }
    for (const e of (ow && ow.map && ow.map.id === D.map && ow.elites) || d.elites || []) { const nm = e.name || (SPECIES[e.sp] || {}).n; if (nm) C.push({ name: nm, x: e.x, y: e.y }); }
    if (d.boss && SPECIES[d.boss.sp] && !(st.flags || {})[d.boss.flag || 'golem']) { const bn = SPECIES[d.boss.sp].n; C.push({ name: bn, x: d.boss.x, y: d.boss.y }); if (bn.length > 3) C.push({ name: bn.slice(-2), x: d.boss.x, y: d.boss.y, full: bn }); } // 「暴走的魔像」 = 古岩魔像
    for (const L of (typeof LANDMARK12 !== 'undefined' && LANDMARK12[D.map]) || []) if (L.n) C.push({ name: L.n, x: L.x, y: L.y });
    const sn = D.spot && D.spot.name; let best = null, bi = 1e9; if (sn) { let i = t.indexOf(sn); if (i < 0 && sn.length > 3) i = t.indexOf(sn.slice(-2)); bi = i >= 0 ? i : -1; } // the original already found the person (王都的騎士雷恩 by 雷恩): only something named earlier beats it
    for (const c of C) { const i = t.indexOf(c.name); if (i >= 0 && i < bi) { bi = i; best = c; } } // a boss named before the person wins (打倒磨石魔像，救出漢斯)
    // another map named in the text before anything on this map (到晨霧道路西側的碧溪谷 while standing on 晨霧道路) → that map is the real destination
    let far = null; for (const id in MAPS) { const nm = MAPS[id].name; if (!nm || nm.length < 2 || nm === d.name) continue; const i = t.indexOf(nm); if (i >= 0 && i > (q.t || '').indexOf(d.name) && i < bi && (!far || i < far.i)) far = { i, map: mapIdByName(nm) || id, nm }; }
    let alt = far && far.map !== st.map && mapRoute(st.map, far.map) ? { i: far.i, r: { map: far.map, what: '前往' + far.nm } } : null;
    // a person named after this map who lives inside one of its houses (把清泉草帶回風車丘陵的漢斯家)
    for (const e of spkIndex()) { if (e.map === st.map || (e.show && !e.show(st))) continue; const i = t.indexOf(e.name); if (i >= 0 && i > (q.t || '').indexOf(d.name) && i < bi && (!alt || i < alt.i) && mapRoute(st.map, e.map)) alt = { i, r: { map: e.map, spot: e, what: '找' + e.name } }; }
    if (alt) return alt.r;
    if (best) return { ...D, spot: best, what: (/^前往/.test(D.what) || D.spot ? '找' : D.what) + (best.full || best.name) };
    for (const g of GOAL9) if (g.map === D.map && g.when(st.flags || {})) return { ...D, spot: { x: g.x, y: g.y, name: g.name }, what: '前往' + g.name };
    return D; }; }
// places named in a quest that are not a person or a landmark (碧溪谷的源頭)
const GOAL9 = [{ map: 'jadeCreek', when: f => f.creekQ === 1 && !f.creekTop, x: 18, y: 6, name: '源頭' }];
// 地圖邊緣同一側有兩個出口時（晨霧道路左邊：上面往碧溪谷、下面往迷霧森林），箭頭指向正確的那一個，而不是只寫「←」
{ const _mg = mapGraph; let done9 = null; mapGraph = function () { const G = _mg(); if (G === done9) return G; done9 = G;
    for (const id in MAPS) { const d = MAPS[id], h = (d.rows || []).length, w = h ? d.rows[0].length : 0; if (!w) continue;
      for (const e of d.edgeWarps || []) { if (!e.to || !e.at || !e.at.length || !G[id] || !G[id][e.to[0]]) continue; const a = e.at[Math.floor((e.at.length - 1) / 2)];
        G[id][e.to[0]] = e.dir === 'left' ? { dir: 'left', x: 0, y: a } : e.dir === 'right' ? { dir: 'right', x: w - 1, y: a } : e.dir === 'up' ? { dir: 'up', x: a, y: 0 } : e.dir === 'down' ? { dir: 'down', x: a, y: h - 1 } : G[id][e.to[0]]; } }
    return G; }; }
// 馬車：萌芽鎮・楓紅關道・北方街道・王都・霜語村之間可以搭車。以前指引不知道馬車，第三幕以後從萌芽鎮出發就只剩「前往○○」沒有箭頭。
// 現在路線會算進「現在搭得到的」馬車，箭頭指向馬車夫，說明加上（搭馬車）。
const COACH9 = { town: 'coachT', maplePass: 'coachM', northRoad: 'coachN', capital: 'coachC', frostVillage: 'coachF' };
function coachOk9(from, to, st = Game.st) { const f = (st && st.flags) || {}, gate = typeof v81Gate === 'function' && v81Gate(st);
  if (from === to || !COACH9[from] || !COACH9[to] || (f.ch2 || 0) < 1) return false;
  return to === 'town' || to === 'maplePass' || (to === 'northRoad' ? !gate : !!((st.vis || {})[to])); }
{ const _mg = mapGraph; let done9 = null; mapGraph = function () { const G = _mg(); if (G === done9) return G; done9 = G;
    for (const a in COACH9) { const n = ((MAPS[a] || {}).npcs || []).find(q => q.id === COACH9[a]); if (!n) continue; G[a] = G[a] || {};
      for (const b in COACH9) if (a !== b && !G[a][b]) G[a][b] = { x: n.x, y: n.y, coach: b, npc: n.id }; }
    return G; }; }
mapRoute = function (from, to) { if (from === to) return [from]; const G = mapGraph(), prev = { [from]: null }, q = [from];
  while (q.length) { const a = q.shift(); for (const b in G[a] || {}) { if (b in prev) continue; const v = G[a][b]; if (v && v.coach && !coachOk9(a, b)) continue; prev[b] = a; if (b === to) { const P = [to]; let c = a; while (c) { P.unshift(c); c = prev[c]; } return P; } q.push(b); } }
  return null; };
{ const _qg = questGuide; questGuide = function (q, st = Game.st, ow = Game.ow) { const G = _qg(q, st, ow); if (!G || !G.route || G.route.length < 2) return G;
    const v = (mapGraph()[st.map] || {})[G.route[1]]; if (v && v.coach) { G.text = G.D.what + '（搭馬車）'; if (G.route[1] === G.D.map) G.next = null; if (ow && ow.p) G.arrow = dirArrow(v.x - ow.p.x, v.y - ow.p.y); } return G; }; }
// 用人物或機關進出的地方（王都的水道入口、勇者之墓的石門、鐘塔的樓梯…）：以前地圖連線不知道入口在哪，指引沒有箭頭
{ const _mg = mapGraph; let done9 = null; mapGraph = function () { const G = _mg(); if (G === done9) return G; done9 = G;
    for (const a in G) for (const b in G[a]) { if (G[a][b] || !MAPS[a]) continue; const has = id => Events[id] && String(Events[id]).includes("'" + b + "'");
      const n = (MAPS[a].npcs || []).find(q => has(q.id)); if (n) { G[a][b] = { x: n.x, y: n.y, npc: n.id }; continue; }
      const t = (MAPS[a].triggers || []).find(q => has(q.id)); if (t) G[a][b] = { x: t.x, y: t.y }; }
    return G; }; }
