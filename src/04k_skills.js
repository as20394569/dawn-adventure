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
  swordsman: [['powerSlash', 5], ['flameSlash', 5], ['focus', 5], ['voltSlash', 8, 'flameSlash', 1], ['gale', 8], ['armorBreak', 8, 'powerSlash', 1], ['leafBlade', 11, 'voltSlash', 1], ['crossSlash', 11, 'powerSlash', 2], ['tideSlash', 11, 'voltSlash', 1], ['blaze', 16, 'flameSlash', 2]],
  mage: [['fireBolt', 5], ['manaBurst', 5], ['aquaBlade', 5], ['thunder', 8, 'aquaBlade', 1], ['heal', 8], ['barrier', 8, 'manaBurst', 1], ['leafStorm', 11, 'aquaBlade', 1], ['chainBolt', 11, 'thunder', 1], ['flameWave', 11, 'fireBolt', 2], ['aquaBurst', 16, 'aquaBlade', 2]],
  guardian: [['guardStrike', 5], ['ironWill', 5], ['flameSlash', 5], ['heal', 8], ['voltSlash', 8, 'flameSlash', 1], ['barrier', 8, 'ironWill', 1], ['shieldBash', 11, 'guardStrike', 2], ['tideSlash', 11, 'voltSlash', 1], ['leafBlade', 11, 'voltSlash', 1], ['armorBreak', 16, 'guardStrike', 1]],
  swordmaster: [['bladeStorm', 14, 'crossSlash', 1], ['iaiSlash', 18, 'bladeStorm', 1]], berserker: [['recklessSlash', 14], ['bloodRage', 18, 'recklessSlash', 1]],
  pyromancer: [['inferno', 14, 'flameWave', 1], ['meteor', 18, 'inferno', 1]], stormcaller: [['thunderstorm', 14, 'chainBolt', 1], ['skyJudge', 18, 'thunderstorm', 1]],
  paladin: [['holyLight', 14], ['sanctuary', 18, 'holyLight', 1]], otherworlder: [['dawnBreak', 14], ['riftBlade', 20, 'dawnBreak', 1]],
};
const CLASS_FREE = { swordsman: ['powerSlash', 'flameSlash'], mage: ['fireBolt', 'manaBurst'], guardian: ['guardStrike', 'ironWill'] };
function skillTreeOf(cls) { const base = baseClassOf(cls); const L = (SKILL_TREES[base] || []).map(n => ({ id: n[0], clv: n[1], req: n[2], rl: n[3] || 1 })); if (cls && cls !== base && SKILL_TREES[cls]) L.push(...SKILL_TREES[cls].map(n => ({ id: n[0], clv: n[1], req: n[2], rl: n[3] || 1, adv: 1 }))); return L; }
const skillLv = (id, st = Game.st) => (st.skills || {})[id] || 0;
const skillMP = (id, st = Game.st) => { const b = SKILL_MP[id]; if (b === undefined) return 0; return Math.round(b * (1 + 0.15 * (Math.max(1, skillLv(id, st)) - 1))); };
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
function grantSkill(id, st = Game.st) { st.skills = st.skills || {}; if (!st.skills[id]) st.skills[id] = 1; }
function migrateSkills(st) {
  if (st.skills) return; st.skills = {}; for (const m of st.moves || []) if (MOVES[m.id] && SKILL_MP[m.id] !== undefined) st.skills[m.id] = 1;
  if (st.cls) for (const id of CLASS_FREE[baseClassOf(st.cls)] || []) grantSkill(id, st);
  st.mp = heroStats(st).mp;
}

/* ---------- Skill tree screen ---------- */
function* skillTreeScreen() {
  const st = Game.st; st.skills = st.skills || {}; let idx = 0, top = 0; const COLS = 3, VIS = 4;
  const nodes = () => skillTreeOf(st.cls);
  const scr = { draw(x) {
    const N = nodes(); screenBG(x); headerBar(x, '技能'); Font.drawR(x, '技能點 ' + (st.tp || 0), W - 6, 2, st.tp ? UIC.warm : UIC.muted, UIC.textSh);
    if (!N.length) { Font.draw(x, '還沒有選擇職業。', 12, 30, UIC.muted, UIC.textSh); return; }
    const rows = Math.ceil(N.length / COLS);
    for (let k = 0; k < N.length; k++) {
      const r = Math.floor(k / COLS) - top, c = k % COLS; if (r < 0 || r >= VIS) continue; const n = N[k], mv = MOVES[n.id], lv = skillLv(n.id), s = nodeState(n), X = 4 + c * 57, Y = 24 + r * 34, on = k === idx;
      drawBtn(x, X, Y, 54, 31, on, TYPE_COL[mv.t]); if (n.adv) { x.fillStyle = UIC.warm; x.fillRect(X + 49, Y + 2, 3, 3); }
      Font.drawC(x, mv.n, X + 28, Y + 1, s.startsWith('locked') ? UIC.dis : lv ? UIC.text : '#c9cfe4', UIC.textSh, 11);
      for (let q = 0; q < SKILL_MAX; q++) { x.fillStyle = q < lv ? UIC.warm : '#30375a'; x.fillRect(X + 16 + q * 8, Y + 21, 6, 5); }
      if (s === 'learn' && st.tp) { x.fillStyle = UIC.accent; x.fillRect(X + 3, Y + 22, 3, 3); }
    }
    if (top > 0) x.drawImage(UPARROW, 86, 21); if (top + VIS < rows) x.drawImage(DOWNARROW, 86, 24 + VIS * 34 - 2);
    const n = N[idx], mv = MOVES[n.id], lv = skillLv(n.id), s = nodeState(n), cur = skillMove(n.id), nx = { ...Game.st, skills: { ...st.skills, [n.id]: Math.min(SKILL_MAX, lv + 1) } }, nxt = skillMove(n.id, nx);
    drawWin(x, 4, 162, 168, 90, 'menu');
    typeBadge(x, mv.t, 10, 166, 24); Font.draw(x, mv.n + '　Lv' + lv + '/' + SKILL_MAX, 38, 164, UIC.text, UIC.textSh);
    const stat = m => (m.pow ? '威力' + m.pow + ' ' : '') + (m.heal ? '回復' + Math.round(m.heal * 100) + '% ' : '') + (m.shield ? '護盾' + m.shield + '回合 ' : '') + (m.dur ? '持續' + m.dur + '回合 ' : '') + 'MP' + Math.round(SKILL_MP[n.id] * (1 + 0.15 * ((m.lv || 1) - 1)));
    Font.draw(x, (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + '　' + (lv ? stat(cur) : stat(nxt)), 10, 180, UIC.accent, UIC.textSh, 10);
    if (lv && lv < SKILL_MAX) Font.draw(x, '下一級：' + stat(nxt), 10, 193, UIC.warm, UIC.textSh, 10);
    Font.wrap(mv.d, 152, 10).slice(0, 2).forEach((l, i) => Font.draw(x, l, 10, (lv && lv < SKILL_MAX ? 206 : 196) + i * 12, UIC.text, UIC.textSh, 10));
    Font.draw(x, s === 'max' ? '已達最高等級' : s.startsWith('locked') ? s.slice(7) : st.tp ? 'A：' + (lv ? '升級' : '學習') + '（消耗1點）' : '升級時可以獲得技能點', 10, 236, s.startsWith('locked') ? UIC.bad : UIC.muted, UIC.textSh, 10);
  } };
  UI.push(scr);
  while (true) {
    const N = nodes(), n = N.length; if (!n) { if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); break; } yield; continue; }
    let ni = idx; if (Input.repeat('left') && idx % COLS > 0) ni--; if (Input.repeat('right') && idx % COLS < COLS - 1 && idx + 1 < n) ni++; if (Input.repeat('up') && idx >= COLS) ni -= COLS; if (Input.repeat('down') && idx + COLS < n) ni += COLS;
    if (ni !== idx) { idx = ni; Sound.sfx('cursor'); const r = Math.floor(idx / COLS); if (r < top) top = r; if (r >= top + VIS) top = r - VIS + 1; }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) { Input.consume('a'); const node = N[idx], s = nodeState(node); if (!st.tp || s === 'max' || s.startsWith('locked')) { Sound.sfx('bump'); } else { st.tp--; st.skills[node.id] = skillLv(node.id) + 1; Sound.sfx('statUp'); } }
    yield;
  }
  UI.remove(scr);
}

for (const [k, v] of Object.entries({ swordsman: 4, mage: 12, guardian: 4, swordmaster: 8, berserker: 4, pyromancer: 22, stormcaller: 22, paladin: 12, otherworlder: 14 })) if (CLASSES[k]) CLASSES[k].st.mp = v;
SPECIALS.freeCast.d = '使用技能時有30%機率不消耗MP。';
