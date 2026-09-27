/* ===================== v23 繼承技能: only the current class's tree + a few chosen skills from earlier classes =====================
   After a class change the skills learned as the earlier class stay learned, but only the ones in the new class's own tree
   (04u) are usable in battle, plus 2 「繼承技能」 slots (3 for the hidden classes). The slots are set on the skill screen
   (技能 → 繼承); a skill that isn't needed any more can be forgotten there for its skill points. */
function inhSlots(st = Game.st) { const C = CLASSES[st.cls]; return !C ? 0 : C.tier >= 3 ? 3 : C.tier === 2 ? 2 : 0; }
const treeIdSet = (st = Game.st) => new Set(skillTreeOf(st.cls).map(n => n.id));
function inheritables(st = Game.st) { const T = treeIdSet(st); return learnedSkills(st).filter(id => id !== 'attack' && !T.has(id)); }
function autoInherit(st, pool, n) {
  const score = id => { const m = MOVES[id]; return (m.pow ? m.pow * (m.hits || 1) : 45) * skillPow(skillLv(id, st)); };
  const out = [], hasHeal = skillTreeOf(st.cls).some(nd => MOVES[nd.id].heal), heal = pool.filter(id => MOVES[id].heal).sort((a, b) => score(b) - score(a))[0];
  if (n && heal && !hasHeal) out.push(heal);
  for (const id of pool.filter(k => MOVES[k].pow).sort((a, b) => score(b) - score(a))) if (out.length < n && !out.includes(id)) out.push(id);
  for (const id of pool) if (out.length < n && !out.includes(id)) out.push(id);
  return out;
}
function fixInherit(st = Game.st) {
  const n = inhSlots(st), pool = inheritables(st);
  if (st.inhCls !== st.cls || !Array.isArray(st.inh)) { st.inhCls = st.cls; st.inh = autoInherit(st, pool, n); }
  st.inh = st.inh.filter((k, i) => pool.includes(k) && st.inh.indexOf(k) === i).slice(0, n); return st.inh;
}
function usableSkills(st = Game.st) { const L = learnedSkills(st), T = skillTreeOf(st.cls).map(n => n.id).filter(id => L.includes(id)); return T.concat(fixInherit(st).filter(id => !T.includes(id))); }
function summarySkills(st = Game.st) { const U = usableSkills(st); return U.concat(learnedSkills(st).filter(id => !U.includes(id))); }
const isInherited = (id, st = Game.st) => !treeIdSet(st).has(id);
const hpCostBlocked = (id, st = Game.st) => { const m = MOVES[id]; return !!(m && m.hpCost && m.pow && st.hp <= Math.floor(heroStats(st).hp * m.hpCost)); };

/* ---------- the inheritance screen ---------- */
function* inheritScreen() {
  const st = Game.st; let idx = 0, top = 0; const VIS = 6, RH = 19, Y0 = 36;
  const list = () => inheritables(st), N = () => inhSlots(st);
  const scr = { draw(x) {
    const L = list(), inh = fixInherit(st); screenBG(x); headerBar(x, '繼承技能'); Font.drawR(x, '使用中 ' + inh.length + '/' + N(), W - 6, 2, inh.length ? UIC.warm : UIC.muted, UIC.textSh);
    Font.draw(x, '舊職業的技能，最多選' + N() + '招帶進戰鬥。', 8, 20, UIC.muted, UIC.textSh, 9);
    if (!L.length) { Font.draw(x, '沒有可以繼承的技能。', 12, Y0 + 4, UIC.muted, UIC.textSh, 11); return; }
    drawWin(x, 4, Y0 - 2, 168, VIS * RH + 6, 'menu');
    L.slice(top, top + VIS).forEach((id, k) => { const i = top + k, mv = MOVES[id], Y = Y0 + 1 + k * RH, on = inh.includes(id); if (i === idx) selBar(x, 6, Y, 164, 17);
      x.fillStyle = '#10121e'; x.fillRect(11, Y + 4, 9, 9); x.fillStyle = on ? UIC.warm : '#30375a'; x.fillRect(12, Y + 5, 7, 7); if (on) { x.fillStyle = '#ffffff'; x.fillRect(14, Y + 7, 3, 3); }
      typeBadge(x, mv.t, 24, Y + 2, 26); Font.draw(x, mv.n + ' Lv' + skillLv(id), 54, Y, on ? UIC.text : '#c9cfe4', UIC.textSh, 11); Font.drawR(x, on ? '使用中' : 'MP' + skillMP(id), 166, Y + 1, on ? UIC.warm : UIC.muted, UIC.textSh, 9);
      if (typeof touchRegion === 'function') touchRegion(6, Y, 164, 17, () => { if (idx === i) tapKey('a'); else idx = i; }); });
    if (top > 0) x.drawImage(UPARROW, 86, Y0 - 4); if (top + VIS < L.length) x.drawImage(DOWNARROW, 86, Y0 + VIS * RH + 1);
    const id = L[Math.min(idx, L.length - 1)], mv = skillMove(id), DY = Y0 + VIS * RH + 8; drawWin(x, 4, DY, 168, H - DY - 4, 'menu');
    const t1 = (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + (mv.pow ? '　' + powTxt(mv) : '') + '　MP' + skillMP(id); let z = 10; while (z > 7 && Font.width(t1, z) > 156) z--; Font.draw(x, t1, 10, DY + 3, UIC.accent, UIC.textSh, z);
    Font.wrap(mv.d || '', 154, 9).slice(0, 3).forEach((l, i) => Font.draw(x, l, 10, DY + 17 + i * 11, UIC.text, UIC.textSh, 9));
    Font.draw(x, 'A：放入／取下', 10, H - 20, UIC.muted, UIC.textSh, 9);
    drawBtn(x, 120, H - 22, 48, 16, false); Font.drawC(x, '↩遺忘', 144, H - 22, UIC.warm, UIC.textSh, 9); if (typeof touchRegion === 'function') touchRegion(120, H - 22, 48, 16, () => tapKey('select'));
  } };
  UI.push(scr);
  while (true) {
    const L = list(), n = L.length; if (idx >= n) idx = Math.max(0, n - 1);
    if (n && Input.repeat('up') && idx > 0) { idx--; Sound.sfx('cursor'); } if (n && Input.repeat('down') && idx < n - 1) { idx++; Sound.sfx('cursor'); }
    if (idx < top) top = idx; if (idx >= top + VIS) top = idx - VIS + 1;
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (n && Input.pressed('a')) { Input.consume('a'); const id = L[idx], inh = fixInherit(st);
      if (inh.includes(id)) { st.inh = inh.filter(k => k !== id); Sound.sfx('cancel'); }
      else if (inh.length >= inhSlots(st)) { Sound.sfx('bump'); UI.remove(scr); yield* say('繼承欄已經滿了（' + inhSlots(st) + '格）。先取下一招吧。'); UI.push(scr); }
      else { st.inh = inh.concat(id); Sound.sfx('select'); } }
    if (n && Input.pressed('select')) { Input.consume('select'); const id = L[idx], lv = skillLv(id), free = skFreeOf(st)[id] ? 1 : 0, back = lv - free; UI.remove(scr);
      if (back <= 0) { Sound.sfx('bump'); yield* say('「' + MOVES[id].n + '」是起始技能，遺忘也不會退回技能點。'); }
      else if (yield* yesNo('要遺忘「' + MOVES[id].n + '」嗎？退回' + back + '點技能點。' + (free ? '\n（起始技能會保留Lv1）' : '\n（之後只有技能樹裡有這招的職業才能再學）'))) {
        if (free) st.skills[id] = 1; else { delete st.skills[id]; if (st.skFree) delete st.skFree[id]; st.inh = (st.inh || []).filter(k => k !== id); }
        st.skp = (st.skp || 0) + back; Sound.sfx('statUp'); yield* say('遺忘了「' + MOVES[id].n + '」，退回' + back + '點技能點。（目前' + st.skp + '點）'); }
      UI.push(scr); }
    yield;
  }
  UI.remove(scr);
}

/* ---------- skill tree screen: + the 繼承 button in the header (advanced / hidden classes) ---------- */
{ const _sts = skillTreeScreen; skillTreeScreen = function* () {
    const st = Game.st; if (!inhSlots(st)) return yield* _sts();
    const btn = { draw(x) { const inh = fixInherit(st), n = inheritables(st).length; drawBtn(x, 36, 2, 70, 16, false); Font.drawC(x, '繼承 ' + inh.length + '/' + inhSlots(st) + (n ? '' : '　—') + '　▶', 71, 2, n ? UIC.warm : UIC.dis, UIC.textSh, 9);
      if (typeof touchRegion === 'function') touchRegion(36, 2, 70, 16, () => tapKey('start')); } };
    const inner = _sts(); UI.push(btn); let r; try {
      while (true) { if (Input.pressed('start')) { Input.consume('start'); Sound.sfx('select'); UI.remove(btn); const lay = UI.stack.slice(); for (const l of lay) UI.remove(l); yield* inheritScreen(); for (const l of lay) UI.push(l); UI.push(btn); }
        UI.remove(btn); UI.push(btn); r = inner.next(); if (r.done) break; yield r.value; }
    } finally { UI.remove(btn); } return r && r.value;
  };
}

/* ---------- battle: the skill pop-up lists usable skills (tree + inherited) ---------- */
{ const _cm = Battle.prototype.chooseMove; Battle.prototype.chooseMove = function* () {
    const r = yield* _cm.call(this);
    if (r && hpCostBlocked(r)) { yield* this.msg('HP不夠，無法使用' + MOVES[r].n + '！'); return yield* this.chooseMove(); }
    return r;
  };
}
// the damage preview knows about 元素附魔 and 月影舞's extra hits
{ const _ed = Battle.prototype.estimateDamage; Battle.prototype.estimateDamage = function (id) {
    const H = this.H, base = MOVES[id]; if (!base) return _ed.call(this, id); const swap = H.enchT > 0 && H.enchEl && base.pow && base.t === '一般', up = base.hitsUp && (H.smokeT > 0 || H.clones > 0);
    if (swap) base.t = H.enchEl; if (up) base.hits += base.hitsUp; try { return _ed.call(this, id); } finally { if (swap) base.t = '一般'; if (up) base.hits -= base.hitsUp; }
  };
}

/* ---------- class change: tell the player about the new tree + the 繼承 slots ---------- */
{ const _ct = classTalk; classTalk = function* () {
    const st = Game.st, c0 = st.cls, r = yield* _ct();
    if (st.cls !== c0 && inhSlots(st)) { fixInherit(st); const inh = st.inh.map(id => MOVES[id].n).join('、');
      yield* say('「技能」選單換成了' + CLASSES[st.cls].n + '的專屬技能樹。舊職業的技能裡，技能樹沒有的最多可以繼承' + inhSlots(st) + '招帶進戰鬥。');
      yield* say((inh ? '先幫你帶上了「' + inh + '」。' : '') + '在「技能」畫面按上方的「繼承」就能更換；用不到的舊技能也可以遺忘，退回技能點。'); }
    return r;
  };
}

/* ---------- saves: removed skills (v21) are the ones no tree has; advanced classes get the v23 note once ---------- */
rework3Migrate = (function (_rm) { return function (st) {
  if (!st || (st.skV || 1) >= 3) return _rm(st);
  const all = new Set(Object.values(SKILL_TREES).flat().map(n => n[0])), _sto = skillTreeOf; skillTreeOf = () => [...all].map(id => ({ id, clv: 1 }));
  try { return _rm(st); } finally { skillTreeOf = _sto; }
}; })(rework3Migrate);
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.skV = 4; return st; }; }
{ const _so = startOverworld; startOverworld = function (...a) {
    const ow = _so.apply(this, a), st = Game.st; if (!st || (st.skV || 1) >= 4) return ow; st.skV = 4;
    if (inhSlots(st)) { fixInherit(st); const inh = st.inh.map(id => MOVES[id].n).join('、');
      if (ow && ow.run) ow.run((function* () { yield* wait(30);
        yield* say('【系統更新】進階職業有了自己的完整技能樹！' + CLASSES[st.cls].n + '的「技能」畫面現在只有專屬的10招。');
        yield* say('原本學會的舊技能都還在，但戰鬥中只能帶' + inhSlots(st) + '招（繼承技能）。' + (inh ? '先幫你帶上了「' + inh + '」。' : ''));
        yield* say('在「技能」畫面按上方的「繼承」可以更換；不需要的舊技能可以遺忘，退回技能點拿去學新技能。'); })()); }
    return ow;
  };
}
