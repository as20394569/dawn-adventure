/* ===================== v12.0.9k 小修正（2026-10-04） =====================
   - 吟遊詩人「狂想」（自己每得到一次能力提升，特技 +1）：特技本身給的能力提升也算進去，特技 → 提升 → 特技…一直連鎖到安全上限才停。
     現在特技給的能力提升不算。 */
COND.notInSpecial9 = (c, v) => !(c.core.evStack || []).some(e => e.type === EVT.SKILL_USE && DEF.skills[e.payload.skill] && DEF.skills[e.payload.skill].tags.includes('weapon_special')) === !!v;
{ const T = DEF.talents['bard.0.1.1']; if (T) { const m = T.make; T.make = (...a) => { const r = m(...a); return { ...r, triggers: (r.triggers || []).map(t => ({ ...t, cond: { ...(t.cond || {}), notInSpecial9: 1 } })) }; }; } }
/* - 風車丘陵的祕境「風之丘頂」：修練之書（b6w1）和中間那座風車放在同一格（39,4），被風車擋住拿不到（玩家 03:46「風車丘陵的秘境地圖物件擋住」）。
     地圖資料裡道具和物件在同一格時，道具移到最近的空格（現在只有這一個）。 */
for (const id in MAPS) { const d = MAPS[id], R = d.rows; if (!R || !d.items || !d.npcs) continue; const H = R.length, Wd = R[0].length;
  const busy = new Set([...d.npcs, ...d.items, ...(d.gathers || [])].map(e => e.x + ',' + e.y)); for (const k in d.signs || {}) busy.add(k);
  for (const it of d.items) { if (!d.npcs.some(n => n.x === it.x && n.y === it.y)) continue; let best = null;
    for (let r = 1; r < 6 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++) { const x = it.x + dx, y = it.y + dy; if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (x < 1 || y < 1 || x >= Wd - 1 || y >= H - 1 || SOLID.has(R[y][x]) || busy.has(x + ',' + y)) continue; best = [x, y]; }
    if (best) { busy.add(best[0] + ',' + best[1]); it.x = best[0]; it.y = best[1]; } } }
/* - 和 NPC 對話中開始的戰鬥（例如商人巴托的商隊戰）：戰鬥裡跳出的對話框（喝藥水的「要使用傷藥嗎？」等）會帶著那個 NPC 的頭像和名字
     （玩家 03:52「商人巴託的劇情戰鬥中 喝藥水會觸發巴託對話框」）→ 戰鬥畫面裡不套用正在對話的 NPC。 */
{ const _ds = dlgSetup; dlgSetup = function (t, o) { if (Game.talker && Game.scene && Game.scene.constructor === Battle) { const T = Game.talker; Game.talker = null; try { return _ds(t, o); } finally { Game.talker = T; } } return _ds(t, o); }; }
