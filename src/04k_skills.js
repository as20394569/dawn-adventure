/* ===================== SKILL SYSTEM v2 (classic RPG): MP, skill points, skill trees, skill levels ===================== */
// No more 4-move limit / PP / forgetting. Skills are learned and levelled on a class skill tree with skill points,
// cost MP, and every learned skill is usable. Basic 「攻擊」 is free (magic with a staff, physical otherwise).
MOVES.attack = { n: '攻擊', t: '一般', cat: '物', pow: 45, acc: 100, cls: 'slash', fx: 'slash', d: '用武器攻擊。不消耗MP。裝備法杖時改用魔攻。' };
const SKILL_MP = {
  powerSlash: 4, flameSlash: 4, focus: 3, voltSlash: 5, gale: 3, armorBreak: 4, leafBlade: 6, crossSlash: 7, tideSlash: 6, blaze: 9, bladeStorm: 12, iaiSlash: 10, recklessSlash: 9, bloodRage: 6,
  fireBolt: 4, manaBurst: 5, aquaBlade: 4, thunder: 5, heal: 8, barrier: 7, leafStorm: 7, chainBolt: 8, flameWave: 10, aquaBurst: 12, inferno: 14, meteor: 18, thunderstorm: 14, skyJudge: 18,
  guardStrike: 3, ironWill: 4, shieldBash: 6, holyLight: 12, sanctuary: 16, dawnBreak: 16, riftBlade: 14, magicBolt: 2, glare: 2,
};
const SKILL_MAX = 3;
// Tree nodes: [skillId, character level needed, required node or null, required node level]
const SKILL_TREES = {
  swordsman: [['powerSlash', 1], ['flameSlash', 1], ['focus', 3], ['voltSlash', 8, 'flameSlash', 1], ['gale', 8], ['armorBreak', 8, 'powerSlash', 1], ['leafBlade', 11, 'voltSlash', 1], ['crossSlash', 11, 'powerSlash', 2], ['tideSlash', 11, 'voltSlash', 1], ['blaze', 16, 'flameSlash', 2]],
  mage: [['fireBolt', 1], ['manaBurst', 1], ['aquaBlade', 3], ['thunder', 8, 'aquaBlade', 1], ['heal', 8], ['barrier', 8, 'manaBurst', 1], ['leafStorm', 11, 'aquaBlade', 1], ['chainBolt', 11, 'thunder', 1], ['flameWave', 11, 'fireBolt', 2], ['aquaBurst', 16, 'aquaBlade', 2]],
  guardian: [['guardStrike', 1], ['ironWill', 1], ['flameSlash', 3], ['heal', 8], ['voltSlash', 8, 'flameSlash', 1], ['barrier', 8, 'ironWill', 1], ['shieldBash', 11, 'guardStrike', 2], ['tideSlash', 11, 'voltSlash', 1], ['leafBlade', 11, 'voltSlash', 1], ['armorBreak', 16, 'guardStrike', 1]],
  swordmaster: [['bladeStorm', 14, 'crossSlash', 1], ['iaiSlash', 18, 'bladeStorm', 1]], berserker: [['recklessSlash', 14], ['bloodRage', 18, 'recklessSlash', 1]],
  pyromancer: [['inferno', 14, 'flameWave', 1], ['meteor', 18, 'inferno', 1]], stormcaller: [['thunderstorm', 14, 'chainBolt', 1], ['skyJudge', 18, 'thunderstorm', 1]],
  paladin: [['holyLight', 14], ['sanctuary', 18, 'holyLight', 1]], otherworlder: [['dawnBreak', 14], ['riftBlade', 20, 'dawnBreak', 1]],
};
const CLASS_FREE = { swordsman: ['powerSlash', 'flameSlash'], mage: ['fireBolt', 'manaBurst'], guardian: ['guardStrike', 'ironWill'] };
function skillTreeOf(cls) { const base = baseClassOf(cls); const L = (SKILL_TREES[base] || []).map(n => ({ id: n[0], clv: n[1], req: n[2], rl: n[3] || 1 })); if (cls && cls !== base && SKILL_TREES[cls]) L.push(...SKILL_TREES[cls].map(n => ({ id: n[0], clv: n[1], req: n[2], rl: n[3] || 1, adv: 1 }))); return L; }
let skillLv = (id, st = Game.st) => (st.skills || {})[id] || 0;
let skillMP = (id, st = Game.st) => { const b = SKILL_MP[id]; if (b === undefined) return 0; return Math.round(b * (1 + 0.15 * (Math.max(1, skillLv(id, st)) - 1))); };
const skillPow = lv => 1 + 0.15 * (Math.max(1, lv) - 1);
function learnedSkills(st = Game.st) { return Object.keys(st.skills || {}).filter(k => st.skills[k] > 0 && MOVES[k]); }
// effective move with skill-level scaling (power, status chance, heal, shield/buff duration)
function skillMove(id, st = Game.st) {
  const mv = MOVES[id], lv = skillLv(id, st); if (!lv || id === 'attack') return mv;
  const m = { ...mv, lv }; if (m.pow) m.pow = Math.round(m.pow * skillPow(lv));
  if (m.eff && m.eff.p !== undefined && m.eff.p < 100) m.eff = { ...m.eff, p: Math.min(100, m.eff.p + 10 * (lv - 1)) };
  if (m.heal) m.heal = +(m.heal + 0.1 * (lv - 1)).toFixed(2); if (m.shield) m.shield += lv - 1; if (m.stat && m.stat.who === 'self') m.dur = 3 + (lv - 1);
  return m;
}
function nodeState(n, st = Game.st) { // 'max' | 'learn' | 'up' | 'locked:reason'
  const lv = skillLv(n.id, st); if (lv >= SKILL_MAX) return 'max';
  if (st.lv < n.clv) return 'locked:Lv' + n.clv + '可學'; if (n.req && skillLv(n.req, st) < n.rl) return 'locked:需要「' + MOVES[n.req].n + '」Lv' + n.rl;
  return lv ? 'up' : 'learn';
}
function grantSkill(id, st = Game.st) { st.skills = st.skills || {}; st.skFree = st.skFree || {}; if (!st.skills[id]) { st.skills[id] = 1; st.skFree[id] = 1; } }
// refunds: a level can be taken back (free) unless it's a free starting level or another learned skill needs it
function skFreeOf(st) { if (!st.skFree) { st.skFree = {}; const b = baseClassOf(st.cls); for (const id of CLASS_FREE[b] || []) st.skFree[id] = 1; if (st.cls && st.cls !== b && SKILL_TREES[st.cls]) st.skFree[SKILL_TREES[st.cls][0][0]] = 1; } return st.skFree; }
function refundBlock(id, st = Game.st) {
  const lv = skillLv(id, st); if (!lv) return '還沒有學會';
  if (lv <= 1 && skFreeOf(st)[id]) return '起始技能不能退回';
  const need = skillTreeOf(st.cls).find(m => m.req === id && skillLv(m.id, st) > 0 && lv - 1 < m.rl); if (need) return '「' + MOVES[need.id].n + '」需要它';
  return null;
}
function migrateSkills(st) {
  if (st.skills) return; st.skills = {}; for (const m of st.moves || []) if (MOVES[m.id] && SKILL_MP[m.id] !== undefined) st.skills[m.id] = 1;
  if (st.cls) for (const id of CLASS_FREE[baseClassOf(st.cls)] || []) grantSkill(id, st);
  // old saves earned 1 point/level (talents only); the new system gives 2/level + 2 at the start → make up the difference
  const comp = 2 + Math.max(0, st.lv - 5); st.skp = (st.skp || 0) + comp; st.skillNote = comp;
  st.mp = heroStats(st).mp;
}
function* skillUpdateNote(st) {
  const n = st.skillNote; delete st.skillNote; yield* wait(30);
  yield* say('【系統更新】技能系統改版了！\n不再有4招上限和PP，技能改用MP施放。');
  yield* say('原本學會的招式都保留成Lv1技能。\n另外補發了' + n + '點技能點作為補償。');
  yield* say('打開選單的「技能」就能學新技能或升級。\n技能點用來學技能，天賦點用來點被動加成。');
}

/* v24.9 draw a text block that always fits: the largest font 10→7 whose wrapped lines fit the room (… only as a last resort) */
function drawFitText(x, t, X, Y, w, room, zmax = 10, col = UIC.text) {
  let z = zmax, L = Font.wrap(t, w, z); while (z > 7 && L.length * (z + 2) > room) { z--; L = Font.wrap(t, w, z); }
  const n = Math.max(1, Math.floor(room / (z + 2))); if (L.length > n) { L = L.slice(0, n); L[n - 1] = L[n - 1].slice(0, -1) + '…'; }
  L.forEach((l, i) => Font.draw(x, l, X, Y + i * (z + 2), col, UIC.textSh, z));
}
/* ---------- Skill tree screen ---------- */
function* skillTreeScreen() {
  const st = Game.st; st.skills = st.skills || {}; let idx = 0, top = 0; const COLS = 3, VIS = 4;
  const nodes = () => { const T = skillTreeOf(st.cls); return T.length && typeof classPassiveNode === 'function' ? [classPassiveNode()].concat(T) : T; }; /* v24.2: tile 0 = 職業被動 */
  const scr = { draw(x) {
    const N = nodes(); screenBG(x); headerBar(x, '技能'); Font.drawR(x, '技能點 ' + (st.skp || 0), W - 6, 2, st.skp ? UIC.warm : UIC.muted, UIC.textSh);
    if (!N.length) { Font.draw(x, '還沒有選擇職業。', 12, 30, UIC.muted, UIC.textSh); return; }
    const rows = Math.ceil(N.length / COLS);
    for (let k = 0; k < N.length; k++) {
      const r = Math.floor(k / COLS) - top, c = k % COLS; if (r < 0 || r >= VIS) continue; if (N[k].passive) { drawPassiveTile(x, st, 4 + c * 57, 24 + r * 34, k === idx); continue; } const n = N[k], mv = MOVES[n.id], lv = skillLv(n.id), s = nodeState(n), X = 4 + c * 57, Y = 24 + r * 34, on = k === idx;
      drawBtn(x, X, Y, 54, 31, on, TYPE_COL[mv.t]); if (n.adv) { x.fillStyle = UIC.warm; x.fillRect(X + 49, Y + 2, 3, 3); }
      Font.drawC(x, mv.n, X + 28, Y + 1, s.startsWith('locked') ? UIC.dis : lv ? UIC.text : '#c9cfe4', UIC.textSh, 11);
      for (let q = 0; q < SKILL_MAX; q++) { x.fillStyle = q < lv ? UIC.warm : '#30375a'; x.fillRect(X + 16 + q * 8, Y + 21, 6, 5); }
      if (s === 'learn' && st.skp) { x.fillStyle = UIC.accent; x.fillRect(X + 3, Y + 22, 3, 3); }
    }
    if (top > 0) x.drawImage(UPARROW, 86, 21); if (top + VIS < rows) x.drawImage(DOWNARROW, 86, 24 + VIS * 34 - 2);
    if (N[idx].passive) { drawWin(x, 4, 162, 168, 90, 'menu'); drawPassiveInfo(x, st, 10, 165, 156); } else {
    const n = N[idx], mv = MOVES[n.id], lv = skillLv(n.id), s = nodeState(n), cur = skillMove(n.id), nx = { ...Game.st, skills: { ...st.skills, [n.id]: Math.min(SKILL_MAX, lv + 1) } }, nxt = skillMove(n.id, nx);
    drawWin(x, 4, 162, 168, 90, 'menu');
    typeBadge(x, mv.t, 10, 166, 24); Font.draw(x, mv.n + '　Lv' + lv + '/' + SKILL_MAX, 38, 164, UIC.text, UIC.textSh); if (mv.scale) Font.drawR(x, ATTR_NAMES[mv.scale[0]] + '加成', 166, 167, UIC.muted, UIC.textSh, 9);
    const fitL = (t, y, col) => { let z = 10; while (z > 7 && Font.width(t, z) > 156) z--; Font.draw(x, t, 10, y + (10 - z) / 2, col, UIC.textSh, z); };
    const stat = m => (m.pow ? (typeof powTxt === 'function' ? powTxt(m) : '威力' + m.pow) + ' ' : '') + (m.heal ? '回復' + Math.round(m.heal * 100) + '% ' : '') + (m.shield ? '護盾' + m.shield + '回合 ' : '') + (m.dur ? '持續' + m.dur + '回合 ' : '') + 'MP' + Math.round(SKILL_MP[n.id] * (1 + 0.15 * ((m.lv || 1) - 1)));
    fitL((mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + '　' + (lv ? stat(cur) : stat(nxt)), 180, UIC.accent);
    if (lv && lv < SKILL_MAX) fitL('下一級：' + stat(nxt), 193, UIC.warm);
    { const y0 = lv && lv < SKILL_MAX ? 206 : 196; drawFitText(x, mv.d || '', 10, y0, 152, 234 - y0, 10); } /* v24.9: the whole description, shrunk to fit (was cut after 2 lines) */
    Font.draw(x, s === 'max' ? '已達最高等級' : s.startsWith('locked') ? s.slice(7) : st.skp ? 'A：' + (lv ? '升級' : '學習') + '（消耗1點）' : '升級時可以獲得技能點', 10, 236, s.startsWith('locked') ? UIC.bad : UIC.muted, UIC.textSh, 10);
    if (lv) { const rb = refundBlock(n.id); drawBtn(x, 124, 232, 44, 16, false); Font.drawC(x, '↩退點', 146, 232, rb ? UIC.dis : UIC.warm, UIC.textSh, 9); if (typeof touchRegion === 'function') touchRegion(124, 232, 44, 16, () => tapKey('select')); }
    }
    if (typeof touchRegion === 'function') for (let k = 0; k < N.length; k++) { const r = Math.floor(k / COLS) - top, c = k % COLS; if (r < 0 || r >= VIS) continue; touchRegion(4 + c * 57, 24 + r * 34, 54, 31, () => { if (idx === k) tapKey('a'); else idx = k; }); }
  } };
  UI.push(scr);
  while (true) {
    const N = nodes(), n = N.length; if (!n) { if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); break; } yield; continue; }
    let ni = idx; if (Input.repeat('left') && idx % COLS > 0) ni--; if (Input.repeat('right') && idx % COLS < COLS - 1 && idx + 1 < n) ni++; if (Input.repeat('up') && idx >= COLS) ni -= COLS; if (Input.repeat('down') && idx + COLS < n) ni += COLS;
    if (ni !== idx) { idx = ni; Sound.sfx('cursor'); const r = Math.floor(idx / COLS); if (r < top) top = r; if (r >= top + VIS) top = r - VIS + 1; }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('select')) { Input.consume('select'); const node = N[idx], rb = node.passive ? '職業被動不是技能' : refundBlock(node.id); if (rb) { Sound.sfx('bump'); UI.remove(scr); yield* say('不能退回：' + rb + '。'); UI.push(scr); } else { st.skills[node.id]--; if (!st.skills[node.id]) delete st.skills[node.id]; st.skp = (st.skp || 0) + 1; Sound.sfx('cancel'); } }
    if (Input.pressed('a')) { Input.consume('a'); const node = N[idx], s = node.passive ? 'max' : nodeState(node); if (!st.skp || s === 'max' || s.startsWith('locked')) { Sound.sfx('bump'); } else { st.skp--; st.skills[node.id] = skillLv(node.id) + 1; Sound.sfx('statUp'); } }
    yield;
  }
  UI.remove(scr);
}

for (const [k, v] of Object.entries({ swordsman: 4, mage: 12, guardian: 4, swordmaster: 8, berserker: 4, pyromancer: 22, stormcaller: 22, paladin: 12, otherworlder: 14 })) if (CLASSES[k]) CLASSES[k].st.mp = v;
SPECIALS.freeCast.d = '使用技能時有30%機率不消耗MP。';
// v4.7: skill points (st.skp) and talent points (st.tp) are separate pools again
function splitPoints(st) {
  if (st.skp !== undefined) return;
  const spent = Object.values(st.tal || {}).reduce((a, b) => a + b, 0), entitled = Math.max(0, st.lv - 5) + (st.tpBought || 0);
  st.skp = st.tp || 0; st.tp = Math.max(0, entitled - spent);
  if (st.lv > 5 && st.cls && !st.skillNote) st.pointNote = 1;
}
function* pointUpdateNote(st) {
  delete st.pointNote; yield* wait(30);
  yield* say('【系統更新】技能點和天賦點分開了！\n每次升級：技能點+2、天賦點+1。');
  yield* say('原本剩下的點數都變成技能點，\n天賦點則依照等級重新補發。（目前' + (st.tp || 0) + '點）');
}
