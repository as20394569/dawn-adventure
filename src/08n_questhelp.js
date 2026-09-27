/* ===================== v20.7 quest targets explained (playtest: "NPC 沒交代清楚要找的東西") =====================
   Where every item / monster can be found is derived from the game data (monster materials + the maps they live on,
   gathering spots, the town shop), so the hints stay right when content changes.
   - Accepting a request (from the NPC or reading the notice board) now lists each target: have / need + where to get it.
   - 狀態 → 任務: A opens a detail page with the full text, per-item progress, sources, the monsters named in the quest and
     where they live, the reward and whom to report to. Works for story quests too (item / monster names in the text). */
const mapNm = id => (MAPS[id] && MAPS[id].name) || id;
function spawnMaps(sp) {
  const out = []; for (const id in MAPS) { const d = MAPS[id]; if (id === 'rift') continue;
    if ((d.encounters || []).some(e => (e.table || []).some(r => r[0] === sp)) || (d.elites || []).some(e => e.sp === sp) || (d.boss && d.boss.sp === sp)) out.push(mapNm(id)); }
  return out;
}
function itemSources(k) {
  const L = [];
  for (const s of Object.keys(SPECIES).filter(s => SPECIES[s].mat === k)) { const m = spawnMaps(s); if (m.length) L.push('打倒' + SPECIES[s].n + '（' + m.slice(0, 2).join('、') + '）'); }
  const kinds = Object.keys(GATHER_KINDS).filter(g => GATHER_KINDS[g][1] === k).concat(Object.keys(GATHER_KINDS).filter(g => GATHER_KINDS[g][1] !== k && GATHER_KINDS[g][3].some(([m]) => m === k)));
  for (const g of kinds) { const maps = Object.keys(MAPS).filter(id => (MAPS[id].gathers || []).some(q => q.kind === g)).map(mapNm); if (maps.length) L.push('採集' + GATHER_KINDS[g][0] + (GATHER_KINDS[g][1] === k ? '' : '（偶爾）') + '（' + maps.slice(0, 3).join('、') + '）'); }
  if (typeof SHOP_LIST !== 'undefined' && SHOP_LIST.includes(k)) L.push('萌芽鎮的商店');
  return L.slice(0, 3);
}
function comTargets(c, st = Game.st) { // [{ label, have, need, where }]
  const T = [];
  if (c.need) for (const k in c.need) T.push({ label: ITEMS[k].n, have: Math.min(c.need[k], st.bag[k] || 0), need: c.need[k], where: itemSources(k) });
  if (c.kill) { const id = Object.keys(COMMISSIONS).find(q => COMMISSIONS[q] === c), p = id ? comProgress(id, st) : { cur: 0 }; T.push({ label: '打倒' + SPECIES[c.kill[0]].n, have: comState(id, st) ? p.cur : 0, need: c.kill[1], where: spawnMaps(c.kill[0]).map(m => m + '出沒') }); }
  if (c.key && ITEMS[c.key]) T.push({ label: ITEMS[c.key].n, have: st.bag[c.key] ? 1 : 0, need: 1, where: itemSources(c.key) });
  return T;
}
function* comHintSay(c) {
  const T = comTargets(c); if (!T.length) return;
  yield* say('要準備的：\n' + T.map(t => '・' + t.label + '×' + t.need + (t.where.length ? '：' + t.where.join('／') : '')).join('\n'));
}
// quest detail page
function questDetail(q, st = Game.st) {
  const L = [], add = (t, c = UIC.text, s = 10, ind = 0) => { for (const l of Font.wrap(t, 150 - ind, s)) L.push([l, c, s, ind]); };
  add(q.t, q.done ? UIC.muted : UIC.text, 10);
  const cid = q.n.startsWith('委託：') ? Object.keys(COMMISSIONS).find(k => '委託：' + COMMISSIONS[k].n === q.n) : null, c = cid && COMMISSIONS[cid];
  const T = c ? comTargets(c, st) : [];
  // story quests: item and monster names mentioned in the text
  if (!c) {
    for (const k in ITEMS) { const it = ITEMS[k]; if (!it.n || it.n.length < 2 || !q.t.includes(it.n)) continue; const w = itemSources(k); if (w.length || it.mat) T.push({ label: it.n, have: st.bag[k] || 0, where: w }); }
    for (const s in SPECIES) { const n = SPECIES[s].n; if (!n || n.length < 2 || !q.t.includes(n) || T.some(t => t.label.includes(n))) continue; const m = spawnMaps(s); if (m.length) T.push({ label: n, where: m.map(x => x + '出沒') }); }
  }
  if (T.length && !q.done) { L.push(['', UIC.text, 6, 0]); L.push(['【目標與取得地點】', UIC.accent, 10, 0]);
    for (const t of T) { add('・' + t.label + (t.need ? '　' + t.have + '／' + t.need : t.have !== undefined ? '　持有' + t.have : ''), t.need && t.have >= t.need ? UIC.good : '#c8f0ff', 10, 2); add(t.where.length ? t.where.join('、') : '（沒有固定的取得地點，留意劇情或事件）', UIC.muted, 9, 12); } }
  if (c) { L.push(['', UIC.text, 6, 0]); add('委託人：' + c.from + (typeof NPC_WHERE !== 'undefined' && COM_GIVER && NPC_WHERE[COM_GIVER[cid]] ? '（' + NPC_WHERE[COM_GIVER[cid]] + '）' : ''), UIC.muted, 9); }
  if (q.rw) { L.push(['', UIC.text, 6, 0]); add('報酬：' + q.rw, UIC.warm, 10); }
  return L;
}
function* questDetailScreen(q) {
  let top = 0; const L = questDetail(q);
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '任務詳情'); drawWin(x, 4, 22, 168, 230, 'menu');
    Font.draw(x, q.n, 10, 25, QUEST_CAT_COL[q.cat] || UIC.warm, UIC.textSh); Font.drawR(x, q.cat, 166, 27, UIC.muted, UIC.textSh, 9); x.fillStyle = UIC.accent; x.globalAlpha = 0.4; x.fillRect(10, 41, 156, 1); x.globalAlpha = 1;
    const end = drawInfoLines(x, L, 10, 45, 236, top); scr.more = end < L.length;
    if (top > 0) x.drawImage(UPARROW, 86, 42); if (scr.more) x.drawImage(DOWNARROW, 86, 237);
    Font.drawR(x, (scr.more || top > 0 ? '↑↓捲動　' : '') + 'B返回', 166, 240, UIC.muted, UIC.textSh, 9);
  } };
  UI.push(scr);
  while (true) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); } if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
}
