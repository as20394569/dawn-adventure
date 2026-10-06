/* ===================== v12 畫面：行動順序列、職業核心資源、冷卻、技能編排、天賦（3 流派×3 層＋核心天賦） =====================
   draft §11. The battle shows this round's turn order on the left (the one acting lights up), the class resource above the HP strip
   (where 招式點 was), cooldowns in the skill menu. 選單→技能編排 lists where each skill comes from; 選單→天賦 is the v12 tree. */
Object.assign(CANCEL_TXT, { airborne_item: '在空中，不能使用道具！' });
Object.assign(BV_TEXT, {
  endure: s => s + '咬緊牙關撐住了！',
  detonate: (s, t, p) => '獵印引爆！（' + p.n + '層）',
  turret_fire: s => s + '的砲台開火了！',
  insight: (s, t, p) => '看破了' + t + '的弱點！（' + p.n + '層）',
  auto_skill: (s, t, p) => s + '自動施放了' + ((DEF.skills[p.skill] || {}).name || '技能') + '！',
  afterimage: s => '殘影！' + s + '完全閃過了攻擊！',
  wait: () => '',
});
const RES12_NAME = r => r === 'mp' ? 'MP' : (DEF.resources[r] && DEF.resources[r].metadata && DEF.resources[r].metadata.name) || r;
/* ---------- costs, cooldowns and whether a skill can be used now ---------- */
BB.costLabel = function (st, id, core, u) {
  const D = DEF.skills[id]; if (!D) return ''; const P = [];
  for (const c of D.costs || []) { if (c.all) P.push(RES12_NAME(c.res) + (c.min ? '≥' + c.min : '')); else { const n = core && u ? core.costOf(u, D, c) : c.amount; P.push(RES12_NAME(c.res) + n); } }
  if (D.cooldown > 0 && !core) P.push('CD' + D.cooldown);
  return P.join(' ');
};
Battle.prototype.canUse = function (id) {
  const core = this.core, u = core.byId.H, D = DEF.skills[id]; if (!D) return { ok: false, why: '？' };
  const b = core.skillBlock(u, D, { meta: {} }); if (!b) return { ok: true };
  if (b === 'used') return { ok: false, why: '這場戰鬥已經用過了！', short: '已用過' };
  if (b === 'cooldown') return { ok: false, why: '冷卻中！（再過 ' + u.cd[id] + ' 次行動才能用）', short: '冷卻' + u.cd[id] };
  if (b.startsWith('cost:')) { const r = b.slice(5), c = D.costs.find(q => q.res === r), nm = RES12_NAME(r); return { ok: false, why: nm + '不夠！' + (c && c.all ? '（至少要 ' + core.costMin(u, D, c) + '）' : ''), short: nm + '不足', res: r }; }
  return { ok: false, why: '現在不能用！', short: '不可用' };
};
Battle.prototype.costText = function (id) { const core = this.core, u = core.byId.H; if (u.cd[id]) return '冷卻' + u.cd[id]; return BB.costLabel(Game.st, id, core, u); };
/* ---------- the class resource above the HP strip ---------- */
Battle.prototype.drawClassRes = function (x, gauge, gy) {
  const core = this.core, u = core.byId.H, Hv = this.H; if (!u) return; const C = DEF.classes[u.cls]; if (!C) return;
  const tgt = () => { const v = this.pickV || (u.data.lastTarget && this.views[u.data.lastTarget]); const t = v && core.byId[v.id]; return t && core.isUp(t) ? t : core.alive('B')[0]; };
  if (u.cls === 'ranger') { const t = tgt(), n = t ? BV12.markOf(core, u, t) : 0, N = BV12.markMax(core, u); gauge('獵印', n, N, gy, n >= N, n >= N); return; }
  if (u.cls === 'machinist') { const n = Math.max(0, Hv.st.turret || 0), N = BV12.turretMax(core, u); gauge('砲台', n, N, gy, n > 0, false); return; } // the played-back ammo (core is a step ahead)
  if (u.cls === 'otherworlder') { const t = tgt(), n = t ? BV12.insightOf(core, u, t) : 0, N = BV12.insightMax(core, u); gauge('看破', n, N, gy, n >= N, n >= N); return; }
  if (!C.res || !(C.res in Hv.max)) return; const n = Hv.res[C.res] || 0, N = Hv.max[C.res] || 0;
  if (u.cls === 'mage') { const L = u.data.sigils || [], lw = Math.ceil(Font.width('咒印', 7)) + 4, w = N * 7 + lw, X = W - w - 3, burst = core.hasStatus(u, 'elem_burst');
    x.fillStyle = 'rgba(10,10,22,0.72)'; x.fillRect(X - 2, gy - 1, w + 4, 10); Font.draw(x, burst ? '爆發' : '咒印', X, gy - 4, burst ? '#ffd860' : UIC.muted, UIC.textSh, 7);
    for (let i = 0; i < N; i++) { const gx = X + lw + i * 7; x.fillStyle = '#10121e'; x.fillRect(gx - 1, gy + 1, 6, 6); x.fillStyle = L[i] ? (TYPE_COL[L[i]] || '#8ad0ff') : '#3a3a4a'; x.fillRect(gx, gy + 2, 4, 4); } return; }
  gauge(RES12_NAME(C.res), n, N, gy, n >= N, n >= N && u.cls === 'monk');
};
/* ---------- this round's turn order (left edge) ---------- */
Battle.prototype.drawOrder = function (x) {
  const O = this.order12; if (!O || !O.ids.length || this.boxF < -20) return; const done = O.done || 0, ids = O.ids, Y0 = this.multi || this.foes().length > 1 ? 40 : 58;
  let y = Y0; const cur = ids.findIndex((id, i) => i >= done && this.views[id] && !this.views[id].gone);
  ids.forEach((id, i) => { const v = this.views[id]; if (!v || v.gone || y > 128) return; const past = i < done, on = i === cur, hero = v.hero, ch = (v.n || '?').slice(0, 1) + (/[A-G]$/.test(v.n || '') ? v.n.slice(-1) : '');
    x.globalAlpha = past ? 0.4 : 1; x.fillStyle = on ? '#ffd860' : hero ? '#3a6aa0' : '#7a2a34'; x.fillRect(2, y, 14, 12); x.fillStyle = '#0b0d18'; x.fillRect(3, y + 1, 12, 10);
    Font.drawC(x, ch, 9, midY(y, 12, ch.length > 1 ? 6 : 8), on ? '#ffe8b0' : hero ? '#bfe0ff' : '#ffc8c8', UIC.textSh, ch.length > 1 ? 6 : 8); x.globalAlpha = 1; y += 13; });
  if (cur >= 0) { const yy = Y0 + ids.slice(0, cur).filter(id => this.views[id] && !this.views[id].gone).length * 13; x.fillStyle = '#ffd860'; x.fillRect(17, yy + 4, 2, 4); }
};
{ const _bf = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _bf.call(this, x); this.drawOrder(x); }; }
Object.assign(Battle.prototype.handlers, {
  *TURN_ORDER(e, s, t, P) { this.order12 = { ids: P.order.slice(), done: 0 }; },
  *COOLDOWN() {}, *RESOURCE_OVERFLOW() {},
  *EXTRA_ACTION(e, s, t, P) { if (!s) return; const why = P.why || '', txt = why === 'frenzy' || why === 1 ? s.n + '的狂怒！再次行動！' : why === 'dash' ? '疾行！' + s.n + '立刻再行動一次！' : s.n + '再次行動！'; if (P.queued || why === 'frenzy' || why === 1 || why === 'dash') yield* this.msg(txt, { hold: 22 }); },
});
{ const H = Battle.prototype.handlers, _as = H.ACTION_START; H.ACTION_START = function* (e, s, t, P) { if (this.order12 && !P.reaction) this.order12.done++; yield* _as.call(this, e, s, t, P); };
  const _sf = H.SKILL_FAIL; H.SKILL_FAIL = function* (e, s, t, P) { if (!s) return;
    if (P.why === 'cost' && s.hero) { yield* this.msg(RES12_NAME(P.res || 'mp') + '不夠，' + s.n + '改用普通攻擊！', { hold: 26 }); return; }
    if (P.why === 'cooldown' && s.hero) { yield* this.msg('還在冷卻中，' + s.n + '改用普通攻擊！', { hold: 26 }); return; }
    if (P.why === 'requires' && s.hero) { yield* this.msg('條件不符，' + s.n + '改用普通攻擊！', { hold: 26 }); return; }
    yield* _sf.call(this, e, s, t, P); };
  const _re = H.REACTION; H.REACTION = function* (e, s, t, P) { if (s && P.why === 'phantom') { this.pendingReact = true; yield* this.msg('幻步！' + s.n + '閃過攻擊並反擊！', { hold: 22 }); return; } yield* _re.call(this, e, s, t, P); }; }
// the class skill's power text: the v12 description (its power depends on the class resource)
{ const _sm = skillMove; skillMove = function (id, st = Game.st) { const m = _sm(id, st), D = DEF.skills[id]; if (MOVES[id] && MOVES[id].sig && D) return { ...m, n: D.name, pow: D.power, d: D.desc, hits: null }; return m; }; }
{ const _pf = powFormula; powFormula = function (id, st = Game.st) { const D = DEF.skills[id]; if (D && D.tags.includes('sig')) return D.desc + '\n傷害≈威力×你的' + (D.cat === '特' ? '魔攻' : '物攻') + '÷對手' + (D.cat === '特' ? '魔防' : '物防') + '（再依等級放大）'; return _pf(id, st); }; }

/* ---------- skill text (menus): kind・element・power・cost・cooldown, then where it comes from and the learning ---------- */
BB.skillInfo = function (st, id) {
  const D = DEF.skills[id]; if (!D) return ''; const e = BB.skillObj(st, id), mv = MOVES[id] ? skillMove(id, st) : null, sig = D.tags.includes('sig');
  const kind = D.cat === '變' ? '輔助' : D.cat === '物' ? '物理' : '魔法', tgt = D.target === 'all_enemies' ? (D.chain ? '・連鎖' : '・全體') : '', cost = BB.costLabel(st, id);
  let t = (sig ? '職業招式・' : '') + kind + (D.el !== '一般' ? '・' + D.el : '') + (D.power && !sig ? '・威力' + ((mv && mv.pow) || D.power) : '') + (cost ? '・' + cost : '') + (D.prio ? '・搶先' : '') + tgt + '　' + ((sig ? D.desc : (mv && mv.d) || D.desc) || '');
  if (e && e.e && e.e.length) t += '　進化：' + e.e.map((b, s) => (b === 'A' ? '強攻' : '附加') + evoOptText(e, s, b)).join('、');
  if (!sig && e) { const src = BB.sourceOf(st, id); t += e.learned ? '　【已學會' + (src && src !== '已學會' ? '・' + src : '') + '】' : '　【' + (src || '武器') + '・再用' + Math.max(0, BB.learnN(id) - (e.x || 0)) + '次永久學會】'; }
  return t;
};
/* ---------- 選單→技能編排 ---------- */
skillTreeScreen = function* () {
  const st = Game.st; let sel = 0, showF = false;
  const rows = () => { const R = [], C = DEF.classes[clsV7(st.cls)], slots = BB.slots(st), av = BB.available(st);
    if (C && st.cls && C.sig) R.push({ sig: C.sig }); // v268: 沒職業招式時不留空白列
    for (let i = 0; i < BB.SLOTS; i++) R.push({ slot: i, id: slots[i] || null });
    for (const id of av) if (!slots.includes(id)) R.push({ spare: id });
    const next = classSkills12(st, true).find(([id, lv]) => (st.lv || 1) < lv); if (next) R.push({ next });
    return R; };
  const pend = id => { const e = BB.skillObj(st, id); return !!(e && id.startsWith('o_') && orbPending(e)); };
  const right = id => { const cd = DEF.skills[id].cooldown; return cd ? 'CD' + cd : ''; }; // v12.0.2: progress is the 練度 bar beside it
  const tree13 = id => typeof treeOf11 === 'function' && !!treeOf11(id); // v12.66: tree skills have no 練度 bar → the MP and CD go there
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '技能編排'); { const n = (st.slots || []).filter(Boolean).length; Font.drawR(x, '裝備中 ' + n + '／' + BB.SLOTS + '　＋＝還沒放', W - 6, 4, UIC.muted, UIC.textSh, 8); }
    const L = rows(), VIS = 9, i = Math.min(sel, Math.max(0, L.length - 1)), top = clamp(i - 4, 0, Math.max(0, L.length - VIS));
    drawWin(x, 4, 22, 168, VIS * 16 + 8, 'menu'); if (!L.length) Font.draw(x, '還沒有技能。', 12, 28, UIC.muted, UIC.textSh, 10);
    L.slice(top, top + VIS).forEach((R, k) => { const Y = 26 + k * 16; if (top + k === i) selBar(x, 6, Y - 1, 164, 15);
      if (R.sig) { Font.draw(x, '★' + DEF.skills[R.sig].name, 12, Y - 1, '#ffd860', UIC.textSh, 10); Font.drawR(x, BB.costLabel(st, R.sig), 166, Y, UIC.muted, UIC.textSh, 8); }
      else if (R.slot !== undefined) { Font.draw(x, String(R.slot + 1), 12, Y - 1, UIC.muted, UIC.textSh, 9);
        if (R.id) { const e = BB.skillObj(st, R.id); Font.draw(x, BB.nameOf(st, R.id) + (pend(R.id) ? ' ！' : ''), 22, Y - 1, '#c8f0ff', UIC.textSh, 10); if (tree13(R.id)) Font.drawR(x, BB.costLabel(st, R.id), 166, Y, UIC.muted, UIC.textSh, 8); else Font.drawR(x, right(R.id), 132, Y, UIC.muted, UIC.textSh, 8); if (typeof drawMastery12 === 'function') drawMastery12(x, 136, Y + 5, 30, masteryOf12(st, R.id)); }
        else Font.draw(x, '（空的技能槽）', 22, Y - 1, UIC.dis, UIC.textSh, 10); }
      else if (R.spare) { Font.draw(x, '＋' + BB.nameOf(st, R.spare) + (pend(R.spare) ? ' ！' : ''), 12, Y - 1, UIC.text, UIC.textSh, 10); if (tree13(R.spare)) Font.drawR(x, BB.costLabel(st, R.spare), 166, Y, UIC.muted, UIC.textSh, 8); else Font.drawR(x, right(R.spare), 132, Y, UIC.muted, UIC.textSh, 8); if (typeof drawMastery12 === 'function') drawMastery12(x, 136, Y + 5, 30, masteryOf12(st, R.spare)); }
      else if (R.next) { Font.draw(x, '？' + (DEF.skills[R.next[0]] || {}).name, 12, Y - 1, UIC.dis, UIC.textSh, 10); Font.drawR(x, 'Lv' + R.next[1] + '學會', 166, Y, UIC.dis, UIC.textSh, 8); } });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < L.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 16 + 3);
    const Y0 = 22 + VIS * 16 + 12, R = L[i]; if (scr.asking13) return; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); let txt = '', fid = null; // v12.66: no description under the 更換／取下 question
    if (R && R.sig) { fid = R.sig; txt = BB.skillInfo(st, R.sig) + '\n（職業招式固定在第一格）'; }
    else if (R && R.slot !== undefined) { fid = R.id; txt = R.id ? BB.skillInfo(st, R.id) + (pend(R.id) ? '　按A可以進化！' : '') + '\nA：更換／取下' : '把技能放進這一格，戰鬥中就能使用（最多' + BB.SLOTS + '個）。技能來自武器和共通的技能樹，用技能點學。'; }
    else if (R && R.spare) { fid = R.spare; txt = BB.skillInfo(st, R.spare) + '\nA：放進技能槽'; }
    else if (R && R.next) txt = '職業技能：Lv' + R.next[1] + ' 學會「' + DEF.skills[R.next[0]].name + '」。';
    const fm = fid && MOVES[fid] && skillMove(fid, st).pow; if (showF && fm && typeof powFormula === 'function') txt = powFormula(fid, st);
    drawFitText(x, txt, 10, Y0 + 4, 152, 252 - Y0 - 20, 10, showF && fm ? '#ffe8b0' : UIC.text);
    Font.draw(x, fm ? (showF ? 'SELECT／點這裡：回到說明' : 'SELECT／點這裡：看威力公式') : '', 10, 238, UIC.muted, UIC.textSh, 8);
    if (fm && typeof touchRegion === 'function') touchRegion(4, Y0, 168, 252 - Y0, () => { showF = !showF; Sound.sfx('cursor'); });
    if (typeof touchRegion === 'function') L.slice(top, top + VIS).forEach((q, k) => touchRegion(6, 25 + k * 16, 164, 15, () => { if (sel === top + k) tapKey('a'); else { sel = top + k; Sound.sfx('cursor'); } }));
  } };
  const pickSkill = function* (title, list) { if (!list.length) { yield* say('沒有可以放進去的技能。'); return null; } const r = yield* choose(list.map(id => ({ t: BB.nameOf(st, id) })).concat({ t: '返回' }), { title }); return r >= 0 && r < list.length ? list[r] : null; };
  UI.push(scr);
  while (true) { const L = rows();
    if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < L.length - 1) { sel++; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); const R = L[sel], full = function* (f) { UI.remove(scr); yield* f; UI.push(scr); };
      if (R && R.slot !== undefined) {
        const spare = BB.available(st).filter(id => !BB.slots(st).includes(id)), opts = [];
        if (R.id && pend(R.id)) opts.push('進化'); opts.push('更換'); if (R.id) opts.push('取下');
        scr.asking13 = true; let r; try { r = yield* ask(R.id ? '「' + BB.nameOf(st, R.id) + '」要怎麼做？' : '技能槽' + (R.slot + 1), opts.concat('返回')); } finally { scr.asking13 = false; } const op = opts[r];
        if (op === '進化') yield* full(orbEvolveFlow(BB.skillObj(st, R.id)));
        else if (op === '更換') { const id = yield* pickSkill('放進技能槽' + (R.slot + 1), spare); if (id) { if (R.id) BB.unslot(st, R.id); BB.setSlot(st, R.slot, id); Sound.sfx('select'); } }
        else if (op === '取下') { BB.unslot(st, R.id); Sound.sfx('cancel'); } }
      else if (R && R.spare) { const s = BB.slots(st);
        if (pend(R.spare) && (yield* ask('「' + BB.nameOf(st, R.spare) + '」', ['進化', '放進技能槽', '返回'])) === 0) yield* full(orbEvolveFlow(BB.skillObj(st, R.spare)));
        else if (s.length < BB.SLOTS) { BB.setSlot(st, s.length, R.spare); Sound.sfx('select'); }
        else { const r = yield* ask('要換掉哪一個？', s.map(id => BB.nameOf(st, id)).concat('返回')); if (r >= 0 && r < s.length) { const old = s[r]; BB.unslot(st, old); BB.setSlot(st, r, R.spare); Sound.sfx('select'); } } }
      else Sound.sfx('bump'); }
    if (Input.pressed('select')) { Input.consume('select'); showF = !showF; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
};

/* ---------- 選單→天賦 (v12) ---------- */
talentScreen = function* () {
  const st = Game.st; if (!st.cls || !TAL12_TREE[clsV7(st.cls)]) { yield* say('先在萌芽鎮的村長那裡完成覺醒的儀式吧。'); return; }
  const c = clsV7(st.cls), TR = TAL12_TREE[c]; let b = 0, r = 0, msg = '', msgT = 0;
  const at = (b, r) => r < 6 ? DEF.talents[c + '.' + b + '.' + Math.floor(r / 2) + '.' + (r % 2)] : DEF.talents[c + '.k' + b];
  const tierOf = r => r < 6 ? Math.floor(r / 2) : -1, optOf = r => r < 6 ? r % 2 : 0;
  const picked = (b, r) => r < 6 ? TAL12.of(st)[b + '.' + tierOf(r)] === optOf(r) : TAL12.key(st) === b;
  const CX = k => 12 + k * 55, CW = 52, tierY = t => 46 + t * 31 + (t >= 2 ? 4 : 0); // a gutter on the left for the tier numbers
  const tile = (b, r) => r < 6 ? { X: CX(b), Y: tierY(Math.floor(r / 2)) + (r % 2) * 14, w: CW, h: 13 } : { X: CX(b), Y: 156, w: CW, h: 15 };
  const scr = { draw(x) {
    const ttl = '天賦・' + ((CLASSES[st.cls] || CLASSES[c] || {}).n || ''); screenBG(x); headerBar(x, ttl); const av = tpAvail(st), tpS = '天賦點 ' + av + '／' + tpTotal(st); let tz = 12; while (tz > 9 && 12 + Font.width(ttl, 12) + 4 > W - 6 - Font.width(tpS, tz)) tz--; /* v12.0.9f: 四個字的職業名（大魔導士…）會和點數疊在一起 */ Font.drawR(x, tpS, W - 6, 2 + (12 - tz) / 2, av ? UIC.warm : UIC.muted, UIC.textSh, tz);
    for (let k = 0; k < 3; k++) { const X = CX(k); Font.drawC(x, TR.br[k][0], X + CW / 2, 21, UIC.warm, UIC.textSh, 10); Font.drawR(x, TAL12.brPts(k, st) + '點', X + CW, 24, TAL12.brPts(k, st) ? '#ffd860' : UIC.muted, UIC.textSh, 7);
      const d = TR.br[k][1]; let z = 7; while (z > 6 && Font.width(d, z) > CW) z--; Font.drawC(x, d, X + CW / 2, 33, UIC.muted, UIC.textSh, z); }
    for (let t = 0; t < 3; t++) Font.drawC(x, String(t + 1), 6, tierY(t) + 8, UIC.dis, UIC.textSh, 8);
    Font.drawC(x, '核心天賦（三選一・4 點）', W / 2 + 4, 143, '#ffd860', UIC.textSh, 8);
    for (let k = 0; k < 3; k++) for (let q = 0; q < 7; q++) { const T = at(k, q); if (!T) continue; const P = tile(k, q), on = k === b && q === r, pk = picked(k, q), t = tierOf(q), blk = pk ? null : TAL12.block(k, t, st), other = q < 6 && TAL12.has(k, t, st) && !pk;
      x.fillStyle = pk ? 'rgba(200,160,80,0.55)' : other ? 'rgba(34,36,50,0.85)' : blk ? 'rgba(24,26,40,0.9)' : 'rgba(40,60,90,0.75)'; x.fillRect(P.X, P.Y, P.w, P.h);
      const edge = on ? '#ffd860' : pk ? '#c8a050' : blk || other ? '#2e3348' : '#4a6a98'; x.fillStyle = edge; x.fillRect(P.X, P.Y, P.w, 1); x.fillRect(P.X, P.Y + P.h - 1, P.w, 1); x.fillRect(P.X, P.Y, 1, P.h); x.fillRect(P.X + P.w - 1, P.Y, 1, P.h);
      let z = 9; while (z > 7 && Font.width(T.name, z) > P.w - 6) z--; Font.drawC(x, T.name, P.X + P.w / 2, midY(P.Y, P.h, z), pk ? '#fff4d0' : other || blk ? UIC.dis : UIC.text, UIC.textSh, z);
      if (typeof touchRegion === 'function') touchRegion(P.X, P.Y, P.w, P.h, () => { if (b === k && r === q) tapKey('a'); else { b = k; r = q; Sound.sfx('cursor'); } }); }
    if (!deepOk(st)) { x.fillStyle = 'rgba(10,12,22,0.8)'; x.fillRect(8, tierY(2) + 6, 164, 16); Font.drawC(x, '第 3 層與核心天賦：天賦覺醒後開放', W / 2 + 4, tierY(2) + 6, UIC.warm, UIC.textSh, 9); } // v12.0.5: a banner over the locked tier (it used to sit on top of the tiles)
    const T = at(b, r), t = tierOf(r), pk = picked(b, r), blk = pk ? null : TAL12.block(b, t, st); drawWin(x, 4, 176, 168, 76, 'menu');
    if (T) { Font.draw(x, T.name, 10, 178, '#ffd860', UIC.textSh, 10); Font.drawR(x, '〔' + T.kind + '〕' + (t < 0 ? '4 點' : (t + 1) + ' 點'), 166, 179, UIC.muted, UIC.textSh, 8);
      drawFitText(x, T.desc, 10, 192, 152, 36, 10); const fr = fresh.has(t < 0 ? 'k' : b + '.' + t), other = t >= 0 && TAL12.has(b, t, st);
      const line = msgT > 0 ? msg : pk ? (fr ? 'A：退回（離開前可改）' : '已確定・改要用遺忘之書') : other ? (fr ? 'A：改選這個' : '已選另一個・要用遺忘之書') : blk ? blk : 'A：選擇';
      let z = 8; while (z > 7 && Font.width(line, z) > 112) z--; Font.draw(x, line, 10, 237 + (8 - z), msgT > 0 ? UIC.warm : pk ? (fr ? UIC.accent : UIC.good) : other && !fr ? UIC.dis : blk ? UIC.bad : UIC.text, UIC.textSh, z); }
    const have = (st.bag && st.bag.talentReset) || 0; drawBtn(x, 124, 236, 44, 13, false); Font.drawC(x, '重置' + (have ? '×' + have : ''), 146, midY(236, 13, 8), TAL12.spent(st) && have ? UIC.warm : UIC.dis, UIC.textSh, 8);
    if (typeof touchRegion === 'function') touchRegion(124, 236, 44, 13, () => tapKey('start'));
    if (msgT > 0) msgT--;
  } };
  const fresh = new Set(); // picks made during this visit can be undone or switched freely; after leaving, only 遺忘之書 resets them
  const say2 = s => { msg = s; msgT = 90; };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left')) { b = (b + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('right')) { b = (b + 1) % 3; Sound.sfx('cursor'); }
    if (Input.repeat('up') && r > 0) { r--; Sound.sfx('cursor'); } if (Input.repeat('down') && r < 6) { r++; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); const t = tierOf(r), o = optOf(r), T = at(b, r), fk = t < 0 ? 'k' : b + '.' + t;
      if (picked(b, r) || (t >= 0 && TAL12.has(b, t, st))) { const why = !fresh.has(fk) ? '已確定・用遺忘之書重置' : TAL12.refundBlock(b, t, st);
        if (why) { Sound.sfx('bump'); say2(why); }
        else if (picked(b, r)) { TAL12.refund(b, t, st); fresh.delete(fk); Sound.sfx('cancel'); clampHP(); say2('退回了「' + T.name + '」。'); }
        else { TAL12.refund(b, t, st); TAL12.pick(b, t, o, st); Sound.sfx('select'); clampHP(); say2('改選了「' + T.name + '」。'); } }
      else { const why = TAL12.block(b, t, st); if (why) { Sound.sfx('bump'); say2(why); } else { TAL12.pick(b, t, o, st); fresh.add(fk); Sound.sfx('statUp'); clampHP(); say2('學會了「' + T.name + '」！'); } } }
    if (Input.pressed('start')) { Input.consume('start'); if (!TAL12.spent(st)) { Sound.sfx('bump'); say2('還沒有選任何天賦'); } else { UI.remove(scr); const have = (st.bag && st.bag.talentReset) || 0;
        if (!have) yield* say('重置天賦需要「遺忘之書」。\n（道具店有賣）');
        else if (yield* yesNo('要讀遺忘之書，把' + ((CLASSES[st.cls] || {}).n || '') + '的天賦全部重置嗎？\n（點數全部退回；持有' + have + '本，會用掉1本）')) { st.bag.talentReset--; st.tal12[c] = {}; fresh.clear(); clampHP(); Sound.sfx('heal'); }
        UI.push(scr); } }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
};

/* ---------- battle help (選單→戰鬥說明) ---------- */
if (typeof BATTLE_HELP !== 'undefined') {
  for (let i = BATTLE_HELP.length - 1; i >= 0; i--) if (/招式點|技能槽|連段|寶珠/.test(BATTLE_HELP[i][0])) BATTLE_HELP.splice(i, 1);
  BATTLE_HELP.unshift(['技能與冷卻', ['技能來自職業（等級到了學會）和武器（裝備就能用，用滿 6／10／14 次永久學會）。', '技能有冷卻：用完要等自己行動幾次才能再用（技能選單會顯示「冷卻N」）。', '「搶先」技能用過後，下一回合排第一個行動。', '選單→技能編排：職業招式固定一格，再放 4 個技能。']]);
  BATTLE_HELP.unshift(['職業核心資源', ['每個職業有自己的核心資源（劍意、咒印、守勢、獵印、樂章、砲台、氣、龍血、看破、魔紋），每場從 0 開始，顯示在 HP 列上方。', '職業招式會消耗它，消耗越多越強。', '選單→天賦：3 個流派 × 3 層，再加 1 個核心天賦，大多是改變規則的天賦。']]);
  BATTLE_HELP.unshift(['行動順序', ['每回合開始依速度排好順序（左邊的小方塊），輪到誰誰才行動。', '防禦會一直減傷到自己下一次行動開始。', '護盾、潮濕、能力變化等效果是以「自己的行動次數」計算。']]);
}
