/* ===================== v12.0.9i 任務詳情：需要的素材分開列（玩家 2026-10-04「任務說明的需要素材分開」） =====================
   以前「【目標與取得地點】」把要交的素材和要打倒的魔物、要去的地方混在一起。
   現在分成兩段：【需要素材】（名稱　持有／需要，下一行是哪裡拿得到）和【目標】（打倒的魔物、出沒地點）。 */
questDetail = function (q, st = Game.st) {
  const L = [], add = (t, c = UIC.text, s = 10, ind = 0) => { for (const l of Font.wrap(t, 150 - ind, s)) L.push([l, c, s, ind]); }, gap = () => L.push(['', UIC.text, 6, 0]);
  add(q.t, q.done ? UIC.muted : UIC.text, 10);
  const cid = q.n.startsWith('委託：') ? Object.keys(COMMISSIONS).find(k => '委託：' + COMMISSIONS[k].n === q.n) : null, c = cid && COMMISSIONS[cid];
  const items = [], goals = [];
  if (c) for (const t of comTargets(c, st)) (/^打倒/.test(t.label) ? goals : items).push(t);
  else { // story quests: item and monster names mentioned in the text
    for (const k in ITEMS) { const it = ITEMS[k]; if (!it.n || it.n.length < 2 || !q.t.includes(it.n)) continue; const w = itemSources(k); if (w.length || it.mat) items.push({ label: it.n, have: st.bag[k] || 0, where: w, k }); }
    for (const s in SPECIES) { const n = SPECIES[s].n; if (!n || n.length < 2 || !q.t.includes(n) || items.concat(goals).some(t => t.label.includes(n))) continue; const m = spawnMaps(s); if (m.length) goals.push({ label: n, where: m.map(x => x + '出沒') }); } }
  const row = t => { add('・' + t.label + (t.need ? '　' + t.have + '／' + t.need : t.have !== undefined ? '　持有 ' + t.have : ''), t.need && t.have >= t.need ? UIC.good : '#c8f0ff', 10, 2); add(t.where && t.where.length ? t.where.join('、') : '（沒有固定的取得地點，留意劇情或事件）', UIC.muted, 9, 12); };
  if (!q.done && items.length) { gap(); L.push(['【需要素材】', UIC.accent, 10, 0]); items.forEach(row); }
  if (!q.done && goals.length) { gap(); L.push(['【目標】', UIC.accent, 10, 0]); goals.forEach(row); }
  if (c) { gap(); add('委託人：' + c.from + (typeof NPC_WHERE !== 'undefined' && typeof COM_GIVER !== 'undefined' && NPC_WHERE[COM_GIVER[cid]] ? '（' + NPC_WHERE[COM_GIVER[cid]] + '）' : ''), UIC.muted, 9); }
  if (q.rw) { gap(); add('報酬：' + q.rw, UIC.warm, 10); }
  return L;
};
