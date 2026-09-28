// which skill descriptions overflow the 技能 detail window / 狀態→技能一覽 detail
module.exports = async g => g.log(await g.ev(() => {
  const ids = new Set(); for (const k in SKILL_TREES) for (const n of SKILL_TREES[k]) ids.add(Array.isArray(n) ? n[0] : n.id); for (const k in CLASS_FREE) for (const id of CLASS_FREE[k]) ids.add(id);
  for (const k in CLASSES) for (const n of skillTreeOf(k)) ids.add(n.id);
  const res = { tree2: [], tree3: [], fit7: [], long: [] }; let max = 0;
  const fits = (t, z, room) => Font.wrap(t, 152, z).length * (z + 2) <= room;
  for (const id of ids) { const d = (MOVES[id] || {}).d || ''; max = Math.max(max, d.length);
    if (Font.wrap(d, 152, 10).length > 2) res.tree2.push(id + '(' + d.length + ')');
    if (!fits(d, 7, 28)) res.fit7.push(id + ':' + d); }
  return 'skills ' + ids.size + ' maxLen ' + max + '\ncut now (>2 lines@10): ' + res.tree2.length + ' ' + res.tree2.slice(0, 40).join(' ') + '\nno fit even @7 in 28px: ' + res.fit7.length + '\n' + res.fit7.slice(0, 10).join('\n');
}));
