/* ===================== v11 技能庫與技能槽：選單→技能 =====================
   Spec 10 / 11 (docs/battle_v2_design.md G3): the class skill has its own slot, up to 4 active skills are slotted here.
   Skills come from active orbs in the main weapon (and a unique weapon's own skill); using one 8 times in battle learns it
   for good, so it stays in the library after the orb is taken out. Evolutions are kept on the library entry; the orb items
   mirror it so the smith / bag pages show the same progress. */
BB.mirror = function (st, k) { const e = BB.lib(st)[k]; if (!e) return; for (const o of st.orbs || []) if (o.k === k) { o.x = e.x; o.e = e.e.slice(); } };
{ const _ap = BB.apply; BB.apply = function (core, st = Game.st) { const n = _ap.call(this, core, st); for (const k in BB.lib(st)) BB.mirror(st, k); return n; }; }
// any orb handed to the evolution prompt evolves its library entry
{ const _ef = orbEvolveFlow; orbEvolveFlow = function* (o) { const st = Game.st, e = o && ORB_A[o.k] ? BB.entry(st, o.k) : o; if (o && o.told) e.told = o.told; const r = yield* _ef(e); if (e && e.k) BB.mirror(st, e.k); return r; }; }
// the skill lists other pages show (status page, help): class skill + the slots
wsList = function (st = Game.st) { const s = typeof sigId === 'function' ? sigId(st) : null; return (s ? [s] : []).concat(BB.slots(st)); };
learnedSkills = usableSkills = summarySkills = function (st = Game.st) { return wsList(st); };

BB.setSlot = function (st, i, id) { const s = BB.slots(st).slice(), j = s.indexOf(id); if (j >= 0) s.splice(j, 1); if (i >= s.length) s.push(id); else s.splice(i, 0, id); st.slots = s.slice(0, BB.SLOTS); return st.slots; };
BB.unslot = function (st, id) { st.slots = BB.slots(st).filter(x => x !== id); return st.slots; };
BB.skillInfo = function (st, id) {
  const D = DEF.skills[id]; if (!D) return ''; const e = BB.skillObj(st, id), mv = MOVES[id] ? skillMove(id, st) : null;
  const cost = (D.costs || [])[0], kind = D.cat === '變' ? '輔助' : D.cat === '物' ? '物理' : '魔法', tgt = D.target === 'all_enemies' ? (D.chain ? '・連鎖（其他目標50%）' : '・全體（多個目標時×75%）') : '';
  let t = kind + (D.el !== '一般' ? '・' + D.el : '') + (D.power ? '・威力' + ((mv && mv.pow) || D.power) : '') + (cost ? '・' + (cost.res === 'sgp' ? '招式點' : 'MP') + cost.amount : '') + tgt + '　' + ((mv && mv.d) || D.desc || '');
  if (e && e.e && e.e.length) t += '　進化：' + e.e.map((b, s) => (b === 'A' ? '強攻' : '附加') + evoOptText(e, s, b)).join('、');
  if (e) t += e.learned ? '　【已學會】' : '　【再用' + Math.max(0, BB.LEARN_USES - (e.x || 0)) + '次永久學會】';
  return t;
};
skillTreeScreen = function* () {
  const st = Game.st; let tab = 0, sel = 0, showF = false;
  const rows = () => { const R = [], s = sigId(st), slots = BB.slots(st), av = BB.available(st);
    if (s) R.push({ sig: s });
    for (let i = 0; i < BB.SLOTS; i++) R.push({ slot: i, id: slots[i] || null });
    for (const id of av) if (!slots.includes(id)) R.push({ spare: id });
    for (const [sl, u] of Object.entries(st.equip || {})) { if (sl === 'weapon') continue; const g = gearBy(u, st); if (!g || !orbSlots(g)) continue; for (const o of gearOrbs(g).filter(o => !isActiveOrb(o))) R.push({ orb: o, g }); }
    return R; };
  const bag = () => orbList(st).slice().sort((a, b) => (isActiveOrb(b) - isActiveOrb(a)) || orbDef(a).n.localeCompare(orbDef(b).n));
  const pend = id => { const e = BB.skillObj(st, id); return !!(e && orbPending(e)); };
  const scr = { draw(x) {
    screenBG(x); headerBar(x, tab ? '寶珠背包' : '技能編排'); Font.drawR(x, (tab ? '2' : '1') + '/2 ← →', W - 6, 3, UIC.muted, UIC.textSh, 10);
    const L = tab ? bag() : rows(), VIS = 9, i = Math.min(sel, Math.max(0, L.length - 1)), top = clamp(i - 4, 0, Math.max(0, L.length - VIS));
    drawWin(x, 4, 22, 168, VIS * 16 + 8, 'menu'); if (!L.length) Font.draw(x, tab ? '還沒有寶珠。打倒精英和頭目吧！' : '還沒有技能。', 12, 28, UIC.muted, UIC.textSh, 10);
    L.slice(top, top + VIS).forEach((R, k) => { const Y = 26 + k * 16; if (top + k === i) selBar(x, 6, Y - 1, 164, 15);
      if (tab) { drawOrbLine(x, R, 12, Y - 1, isActiveOrb(R) ? '#c8f0ff' : UIC.warm); if (orbHost(R)) Font.drawR(x, 'E', 166, Y - 1, UIC.accent, UIC.textSh, 10); return; }
      if (R.sig) { Font.draw(x, '★' + skillMove(R.sig).n, 12, Y - 1, '#ffd860', UIC.textSh, 10); Font.drawR(x, '招式點' + SIG_COST + (tpAvail(st) > 0 ? '　A強化' : ''), 166, Y, tpAvail(st) > 0 ? UIC.warm : UIC.muted, UIC.textSh, 8); }
      else if (R.slot !== undefined) { Font.draw(x, String(R.slot + 1), 12, Y - 1, UIC.muted, UIC.textSh, 9);
        if (R.id) { const e = BB.skillObj(st, R.id); Font.draw(x, BB.nameOf(st, R.id) + (pend(R.id) ? ' ！' : ''), 22, Y - 1, '#c8f0ff', UIC.textSh, 10); Font.drawR(x, e ? (e.learned ? '已學會' : '學會' + Math.min(e.x || 0, BB.LEARN_USES) + '/' + BB.LEARN_USES) : '武器技', 166, Y, e && e.learned ? UIC.accent : UIC.muted, UIC.textSh, 8); }
        else Font.draw(x, '（空的技能槽）', 22, Y - 1, UIC.dis, UIC.textSh, 10); }
      else if (R.spare) { Font.draw(x, '＋' + BB.nameOf(st, R.spare) + (pend(R.spare) ? ' ！' : ''), 12, Y - 1, UIC.text, UIC.textSh, 10); Font.drawR(x, '未放入', 166, Y, UIC.muted, UIC.textSh, 8); }
      else if (R.orb) { drawOrbLine(x, R.orb, 12, Y - 1, UIC.warm); Font.drawR(x, GEAR[R.g.b].n.slice(0, 4), 166, Y, UIC.muted, UIC.textSh, 8); } });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < L.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 16 + 3);
    const Y0 = 22 + VIS * 16 + 12, R = L[i]; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu');
    let txt = '', fid = null;
    if (tab && R) txt = orbInfo(isActiveOrb(R) ? BB.entry(st, R.k) : R) + (orbHost(R) ? '（鑲在' + GEAR[orbHost(R).b].n + '）' : '');
    else if (R && R.sig) { const m = skillMove(R.sig); fid = R.sig; txt = '職業招式（固定）　' + (m.pow ? '威力' + m.pow + '　' : '') + m.d + sigTalentText(st) + '\nA：用天賦點強化'; }
    else if (R && R.slot !== undefined) { fid = R.id; txt = R.id ? BB.skillInfo(st, R.id) + (pend(R.id) ? '　按A可以進化！' : '') + '\nA：更換／取下' : '把技能放進這一格，戰鬥中就能使用（最多' + BB.SLOTS + '個）。技能來自武器上的寶珠，用滿' + BB.LEARN_USES + '次就永久學會。'; }
    else if (R && R.spare) { fid = R.spare; txt = BB.skillInfo(st, R.spare) + '\nA：放進技能槽'; }
    else if (R && R.orb) txt = orbInfo(R.orb);
    const fm = fid && MOVES[fid] && skillMove(fid, st).pow; if (showF && fm && typeof powFormula === 'function') txt = powFormula(fid, st);
    drawFitText(x, txt, 10, Y0 + 4, 152, 252 - Y0 - 20, 10, showF && fm ? '#ffe8b0' : UIC.text);
    Font.draw(x, fm ? (showF ? 'SELECT／點這裡：回到說明' : 'SELECT／點這裡：看威力公式') : '鑲嵌・拆卸・融合：鐵匠舖', 10, 238, UIC.muted, UIC.textSh, 8);
    if (fm && typeof touchRegion === 'function') touchRegion(4, Y0, 168, 252 - Y0, () => { showF = !showF; Sound.sfx('cursor'); });
    if (typeof touchRegion === 'function') L.slice(top, top + VIS).forEach((q, k) => touchRegion(6, 25 + k * 16, 164, 15, () => { if (sel === top + k) tapKey('a'); else { sel = top + k; Sound.sfx('cursor'); } }));
  } };
  const pickSkill = function* (title, list) { if (!list.length) { yield* say('沒有可以放進去的技能。（到鐵匠舖把技能寶珠鑲進武器）'); return null; } const r = yield* choose(list.map(id => ({ t: BB.nameOf(st, id) })).concat({ t: '返回' }), { title }); return r >= 0 && r < list.length ? list[r] : null; };
  UI.push(scr);
  while (true) { const L = tab ? bag() : rows();
    if (Input.pressed('left') || Input.pressed('right')) { Input.consume('left', 'right'); tab = 1 - tab; sel = 0; Sound.sfx('cursor'); }
    if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < L.length - 1) { sel++; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); const R = L[sel], full = function* (f) { UI.remove(scr); yield* f; UI.push(scr); };
      if (tab) { if (R && isActiveOrb(R) && orbPending(BB.entry(st, R.k))) yield* full(orbEvolveFlow(R)); else Sound.sfx('bump'); }
      else if (R && R.sig) yield* full(sigScreen());
      else if (R && R.slot !== undefined) {
        const spare = BB.available(st).filter(id => !BB.slots(st).includes(id)), opts = [];
        if (R.id && pend(R.id)) opts.push('進化'); opts.push('更換'); if (R.id) opts.push('取下');
        const r = yield* ask(R.id ? '「' + BB.nameOf(st, R.id) + '」' : '技能槽' + (R.slot + 1), opts.concat('返回')), op = opts[r];
        if (op === '進化') yield* full(orbEvolveFlow(BB.skillObj(st, R.id)));
        else if (op === '更換') { const id = yield* pickSkill('放進技能槽' + (R.slot + 1), spare); if (id) { if (R.id) BB.unslot(st, R.id); BB.setSlot(st, R.slot, id); Sound.sfx('select'); } }
        else if (op === '取下') { BB.unslot(st, R.id); Sound.sfx('cancel'); } }
      else if (R && R.spare) { const s = BB.slots(st);
        if (s.length < BB.SLOTS) { BB.setSlot(st, s.length, R.spare); Sound.sfx('select'); }
        else { const r = yield* ask('要換掉哪一個？', s.map(id => BB.nameOf(st, id)).concat('返回')); if (r >= 0 && r < s.length) { const old = s[r]; BB.unslot(st, old); BB.setSlot(st, r, R.spare); Sound.sfx('select'); } } }
      else Sound.sfx('bump'); }
    if (Input.pressed('select')) { Input.consume('select'); showF = !showF; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
};
// battle help pages for the v11 systems (選單→戰鬥說明)
if (typeof BATTLE_HELP !== 'undefined') {
  BATTLE_HELP.unshift(['多隻魔物', ['野外有時會一次出現2～3隻魔物，數量越多，每隻的HP和攻擊越低。', '攻擊和單體技能出手前用左右（或點魔物）選擇目標；目標先倒下時會自動改打下一隻。', '範圍技能（落雷、炎浪、隕星…）一次打中全部，多個目標時每隻×75%；連鎖閃電主目標100%、其他50%。', '每隻魔物的經驗值和金錢都會算進去。']]);
  BATTLE_HELP.unshift(['技能槽', ['戰鬥中能用：職業招式＋最多4個技能槽。', '鑲在武器上的寶珠會提供技能；同一招用滿8次就「永久學會」，卸下寶珠也能繼續放在技能槽。', '選單→技能 可以更換、取下技能，也能讓技能進化（進化記在技能上，不在寶珠上）。']]);
}
