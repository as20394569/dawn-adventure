/* ===================== v20.6 class cards: the awakening ceremony and the Lv14 / hidden class change share one card screen =====================
   Playtest: the ceremony card still had the v18 layout (text ran past the window, the hint sat on the frame) and the class change
   was a plain text menu. Each card now shows: art + glyph, role tag, pitch, stat bars (base) or bonuses (advanced),
   the starting / class skills as type-coloured chips, and where the class leads (advanced classes at Lv14). */
const CLASS_BONUS_N = { hp: ['HP', ''], atk: ['物攻', ''], def: ['物防', ''], spa: ['魔攻', ''], spd: ['魔防', ''], spe: ['速度', ''], crit: ['會心', '%'], eva: ['迴避', '%'], elem: ['屬性傷害', '%'], fireUp: ['火系', '%'], boltUp: ['雷系', '%'], venomous: ['對中毒', '%'] };
const classColOf = k => CLASS_COL[k] || (CLASSES[k] && CLASSES[k].from && CLASS_COL[CLASSES[k].from]) || (k === 'otherworlder' ? '#ffd860' : k === 'spellblade' ? '#ff7ab4' : '#c0c8e0');
function classCard(k) {
  const C = CLASSES[k], S = CLASS_START[k], col = classColOf(k);
  if (S) return { k, n: C.n, tag: S.tag, col, text: S.pitch, bars: S.bars, glyph: k,
    chips: CLASS_FREE[k].map(id => ({ id })).concat(skillTreeOf(k).filter(n => !CLASS_FREE[k].includes(n.id) && n.clv <= 5).map(n => ({ id: n.id, lv: n.clv }))),
    next: Object.keys(CLASSES).filter(q => CLASSES[q].from === k).map(q => CLASSES[q].n) };
  const bonus = Object.entries(C.st).filter(([s]) => CLASS_BONUS_N[s]).map(([s, v]) => CLASS_BONUS_N[s][0] + '+' + v + CLASS_BONUS_N[s][1]).join('　');
  return { k, n: C.n, tag: C.tier >= 3 ? '隱藏職業' : '進階職業', col, text: C.d, bonus, glyph: C.from || (k === 'spellblade' ? 'spell' : 'star'),
    chips: skillTreeOf(k).filter(n => n.adv).map(n => ({ id: n.id })), treeN: skillTreeOf(k).length, inhN: C.tier >= 3 ? 3 : 2 }; /* v23: own tree → show its exclusive skills */
}
function classGlyph(x, g, ex, ey, col) {
  const path = (c, w) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath();
    if (g === 'swordsman') { x.moveTo(ex - 10, ey + 14); x.lineTo(ex + 10, ey - 14); x.moveTo(ex - 10, ey - 2); x.lineTo(ex + 2, ey + 8); }
    else if (g === 'mage') { x.moveTo(ex - 8, ey + 16); x.lineTo(ex + 4, ey - 6); x.moveTo(ex + 11, ey - 10); x.arc(ex + 6, ey - 10, 5, 0, 7); }
    else if (g === 'ranger') { x.moveTo(ex - 12, ey + 10); x.lineTo(ex + 2, ey - 12); x.moveTo(ex + 12, ey + 10); x.lineTo(ex - 2, ey - 12); x.moveTo(ex - 8, ey + 2); x.lineTo(ex - 3, ey + 6); x.moveTo(ex + 8, ey + 2); x.lineTo(ex + 3, ey + 6); }
    else if (g === 'guardian') { x.moveTo(ex - 11, ey - 12); x.lineTo(ex + 11, ey - 12); x.lineTo(ex + 11, ey + 2); x.lineTo(ex, ey + 14); x.lineTo(ex - 11, ey + 2); x.closePath(); }
    else if (g === 'spell') { x.moveTo(ex - 10, ey + 14); x.lineTo(ex + 8, ey - 12); x.moveTo(ex + 6, ey + 4); x.lineTo(ex + 14, ey + 4); x.moveTo(ex + 10, ey); x.lineTo(ex + 10, ey + 8); }
    else { for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5; x[i ? 'lineTo' : 'moveTo'](ex + Math.cos(a) * 13, ey + Math.sin(a) * 13); } x.closePath(); }
    x.stroke(); };
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; path('#10121e', 6); path(col, 3); path('#ffffff', 1); x.restore();
}
// one row of type-coloured skill chips inside maxW; later chips are dropped (with "…") rather than overflowing
function skillChips(x, chips, X, Y, maxW) {
  let cx = X; const end = X + maxW;
  for (let i = 0; i < chips.length; i++) {
    const c = chips[i], m = MOVES[c.id]; if (!m) continue; const tc = TYPE_COL[m.t] || '#9a9aa8', sub = c.lv ? 'Lv' + c.lv : '', w = Math.ceil(Font.width(m.n, 9) + (sub ? Font.width(sub, 7) + 3 : 0)) + 8;
    if (cx + w > end) { Font.draw(x, '…', cx, Y, UIC.muted, UIC.textSh, 9); break; }
    x.fillStyle = 'rgba(8,10,22,0.85)'; x.fillRect(cx, Y + 1, w, 13); x.fillStyle = c.lv ? shade(tc, -0.35) : tc; x.fillRect(cx, Y + 1, w, 1); x.fillRect(cx, Y + 13, w, 1); x.fillRect(cx, Y + 1, 1, 13); x.fillRect(cx + w - 1, Y + 1, 1, 13);
    const e = Font.draw(x, m.n, cx + 4, Y - 0.5, c.lv ? '#c9cfe4' : '#ffffff', UIC.textSh, 9); if (sub) Font.draw(x, sub, e + 3, Y + 0.5, UIC.muted, UIC.textSh, 7);
    cx += w + 3;
  }
}
function* classCardScreen(keys, o = {}) {
  let i = 0, t = 0; const cards = keys.map(classCard), look = o.look || null;
  const scr = { draw(x) {
    t++; const c = cards[i], col = c.col, [r, gg, b] = hex2rgb(col);
    x.fillStyle = '#0a0c18'; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W / 2, 70, 4, W / 2, 70, 70); g.addColorStop(0, `rgba(${r},${gg},${b},0.45)`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); x.fillStyle = g; x.fillRect(0, 0, W, 140);
    for (let n = 0; n < 10; n++) { const a = t / 40 + n * 0.63, R = 40 + Math.sin(t / 30 + n) * 6; x.fillStyle = n % 2 ? col : '#ffffff'; x.fillRect(Math.round(W / 2 + Math.cos(a) * R), Math.round(70 + Math.sin(a) * R * 0.5), 2, 2); }
    headerBar(x, o.title || '覺醒的儀式'); Font.drawR(x, (i + 1) + '/' + keys.length, W - 6, 2, UIC.muted, UIC.textSh);
    const S = CLASS_START[c.k], L = look || { head: c.k === 'guardian' ? GEAR.clothCap.look : null, body: 'uniform', feet: 'school', weapon: S ? GEAR[S.gear[0]].look : null };
    const bob = Math.round(Math.sin(t / 20) * 2), fr = heroFramesLook(L).down[0];
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(W / 2 - 14, 102, 18, 5, 0, 0, 7); x.fill(); x.drawImage(fr, 0, 0, 16, 22, W / 2 - 38, 34 + bob, 48, 66);
    classGlyph(x, c.glyph, W / 2 + 34, 66 - bob, col);
    if (keys.length > 1) { Font.drawC(x, '◀', 14, 60, i > 0 ? UIC.text : UIC.dis, UIC.textSh); Font.drawC(x, '▶', W - 14, 60, i < keys.length - 1 ? UIC.text : UIC.dis, UIC.textSh);
      if (typeof touchRegion === 'function') { touchRegion(0, 36, 30, 60, () => tapKey('left')); touchRegion(W - 30, 36, 30, 60, () => tapKey('right')); } }
    drawWin(x, 4, 108, 168, 146, 'menu');
    Font.draw(x, c.n, 12, 110, col, UIC.textSh, 13); Font.drawR(x, c.tag, 164, 113, UIC.muted, UIC.textSh, 9);
    x.fillStyle = `rgba(${r},${gg},${b},0.5)`; x.fillRect(12, 127, 152, 1);
    Font.wrap(c.text, 152, 10).slice(0, 3).forEach((l, n) => Font.draw(x, l, 12, 129 + n * 12, UIC.text, UIC.textSh, 10));
    let y = 167;
    if (c.bars) { Object.entries(c.bars).forEach(([nm, v], n) => { const X = 12 + (n % 2) * 78, Y = y + Math.floor(n / 2) * 11; Font.draw(x, nm, X, Y - 1, UIC.muted, UIC.textSh, 9); for (let q = 0; q < 5; q++) { x.fillStyle = q < v ? col : '#2a3050'; x.fillRect(X + 28 + q * 8, Y + 5, 6, 4); } }); y += 24; }
    else { Font.draw(x, '能力加成', 12, y - 1, UIC.accent, UIC.textSh, 9); Font.wrap(c.bonus, 152, 9).slice(0, 2).forEach((l, n) => Font.draw(x, l, 12, y + 10 + n * 11, UIC.text, UIC.textSh, 9)); y += 34; }
    Font.draw(x, c.bars ? '起始技能' : '專屬技能', 12, y - 1, UIC.accent, UIC.textSh, 9); if (c.bars) Font.drawR(x, '＋2點技能點自由分配', 164, y - 1, UIC.muted, UIC.textSh, 8); else if (c.treeN) Font.drawR(x, '技能樹' + c.treeN + '招・舊技能可繼承' + c.inhN + '招', 164, y - 1, UIC.muted, UIC.textSh, 8);
    skillChips(x, c.chips, 12, y + 13, 152);
    if (c.next && c.next.length) Font.draw(x, 'Lv14 進階：' + c.next.join('・'), 12, y + 30, shade(col, 0.25), UIC.textSh, 9);
    Font.drawR(x, (o.cancel ? 'B：返回　' : '') + 'A：選擇' + (keys.length > 1 ? '　◀▶：切換' : ''), 164, 238, UIC.muted, UIC.textSh, 8);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left') && i > 0) { i--; Sound.sfx('cursor'); } if (Input.repeat('right') && i < keys.length - 1) { i++; Sound.sfx('cursor'); }
    if (o.cancel && Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); UI.remove(scr); return null; }
    if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); const k = keys[i]; UI.remove(scr); if (yield* yesNo(o.confirm ? o.confirm(k) : '要走上「' + CLASSES[k].n + '」的道路嗎？')) return k; UI.push(scr); }
    yield;
  }
}
classSelectScreen = function* () { return yield* classCardScreen(['swordsman', 'mage', 'guardian', 'ranger'], { title: '覺醒的儀式', confirm: k => '要走上「' + CLASSES[k].n + '」的道路嗎？\n（之後在Lv14可以進階）' }); };
classTalk = function* () { // same rules as before (08_main), the text menu is replaced by the class cards
  const st = Game.st, C = CLASSES, cur = C[st.cls]; let opts = [];
  if (!st.cls) opts = ['swordsman', 'mage', 'guardian', 'ranger']; // saves from before the opening ceremony
  else if (cur && cur.tier === 1 && st.lv >= 14) opts = Object.keys(C).filter(k => C[k].from === st.cls);
  if (st.flags.hiddenCls && st.cls !== 'otherworlder') opts.push('otherworlder');
  if (st.flags.spellbladeOk && st.cls !== 'spellblade') opts.push('spellblade');
  if (!opts.length) return false;
  yield* say(!st.cls ? '你的力量開始覺醒了……要選擇一條道路嗎？' : '你已經走得很遠了。要踏上新的道路嗎？');
  const k = yield* classCardScreen(opts, { title: st.cls ? '轉職的儀式' : '覺醒的儀式', cancel: true, look: st.cls ? heroLookOf(st) : null, confirm: k => '確定要成為' + C[k].n + '嗎？' + (st.cls ? '\n（目前：' + C[st.cls].n + '）' : '') });
  if (!k) { yield* say('想好了再來找我吧。'); return true; }
  if (k === 'spellblade' || k === 'otherworlder') { if (st.cls && CLASSES[st.cls] && CLASSES[st.cls].tier < 3) st.baseCls = baseClassOf(st.cls); } st.cls = k; clampHP(); yield* itemGet(st.name + '成為了' + C[k].n + '！');
  if (!C[k].from && C[k].tier === 1) { st.skills = st.skills || {}; for (const id of CLASS_FREE[k]) grantSkill(id, st); } else { const first = (SKILL_TREES[k] || [])[0]; if (first) { grantSkill(first[0], st); yield* say('學會了職業技能「' + MOVES[first[0]].n + '」！更多' + C[k].n + '的技能可以在「技能」選單學習。'); } }
  return true;
};
