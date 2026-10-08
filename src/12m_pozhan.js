/* ===================== v12.89 破綻與追擊（第一階段）（玩家：「目前戰鬥系統有什麼欠缺吸引玩家的要素嗎」→ 企劃〈曙光冒險 戰鬥企劃：破綻與追擊〉→「照推薦開始做」，2026-10-09） =====================
   · 每種魔物有一個「破綻」＝牠怕的攻擊方式：連擊（一招 2 段以上）・重擊（單體、威力 80 以上或蓄力）・群攻（打全體）・擾亂（讓對手中異常、退縮或能力下降）。先照種族，個別魔物可以另外指定（PZ12.sp）。
   · 主角用對的方式打中一般魔物（牠沒被打倒）：那一下之後魔物破防（沿用菁英・頭目的「破防」：跳過下一次行動、受到的傷害 +50%），主角馬上再動一次（追擊）。
     一次行動打破好幾隻也只給一次追擊；追擊時打破另一隻就再一次。每隻一場只會被破綻打破一次（試算時發現同一招可以讓魔物一直起不來）。追擊不算回合：狀態、冷卻不會因為追擊多跑一次；追擊時不能逃跑。
   · 菁英・頭目照舊用護盾破防，不給追擊（牠們還在場上時，打破小兵也不給追擊——頭目戰保持難）；打中破綻對護盾 ×2（原本「弱點 ×2」的倍率，v12.76 拿掉屬性後就沒在用）。
   · 拳套的普攻打兩下＝連擊、斧的普攻＝重擊。
   · 畫面：名牌上「破綻 連擊」小牌子（沒打中過是「破綻 ？」，打中一次就記進圖鑑）；技能選單每招標方式，對得上場上已知破綻的招發金框；選目標時對得上的魔物的破綻牌子發光；
     破防的魔物頭上變星星「破防」；追擊時上方橫帶「追擊！再動一次」、五個按鈕金框、逃跑變暗。 */
const PZ12 = {
  M: { 連擊: ['#8ee6ff', 'rgba(12,44,60,0.94)'], 重擊: ['#ff9a7a', 'rgba(64,22,14,0.94)'], 群攻: ['#ffd27a', 'rgba(64,44,10,0.94)'], 擾亂: ['#d6a8ff', 'rgba(42,22,64,0.94)'], '？': ['#a0a6ba', 'rgba(30,30,44,0.94)'] },
  fam: { beast: '群攻', insect: '群攻', plant: '連擊', bird: '連擊', ooze: '擾亂', aquatic: '擾亂', construct: '重擊', human: '擾亂', undead: '重擊', spirit: '連擊' },
  brk: 1.25, // 一般魔物破防時受到的傷害
  sp: {}, // 個別魔物：sp → ['重擊']（第三階段再微調）
  skc: {},
};
// a monster's 破綻 (list), or null for none
function pzFoe12(u) { if (!u || u.hero || u.side === 'A') return null; const o = PZ12.sp[u.sp]; if (o) return o; const f = PZ12.fam[u.fam || (typeof SPECIES !== 'undefined' && SPECIES[u.sp] || {}).fam]; return f ? [f] : null; }
// the ways a skill attacks (normal attack: by weapon trait)
function pzSkill12(u, id) { const D = DEF.skills[id]; if (!D) return []; const tags = D.tags || [];
  if (tags.includes('basic')) { const R = []; if (u && wardSum12(u, 'pzFist12')) R.push('連擊'); if (u && wardSum12(u, 'wAxe12')) R.push('重擊'); return R; }
  if (PZ12.skc[id]) return PZ12.skc[id];
  const R = [], efs = (D.effects || []).concat(D.after || []).map(effGet).filter(Boolean), aoe = D.target === 'all_enemies' || tags.includes('aoe'), foe = aoe || D.target === 'enemy';
  if (foe && ((D.hits && D.hits[1] >= 2) || tags.includes('multi_hit') || D.hitsOf || efs.filter(e => e.type === 'damage').length >= 2)) R.push('連擊');
  if (!aoe && D.target === 'enemy' && D.power > 0 && (D.power >= 80 || D.charge)) R.push('重擊');
  if (aoe && D.power > 0) R.push('群攻');
  if (foe && efs.some(e => e.target_rule === 'target' && ((e.type === 'status' && e.status !== 'barrier') || (e.type === 'stage' && Object.values(e.stats || {}).some(n => n < 0))))) R.push('擾亂');
  return (PZ12.skc[id] = R); }
const pzMatch12 = (u, id, t) => { const F = pzFoe12(t); if (!F) return null; const S = pzSkill12(u, id); return F.find(m => S.includes(m)) || null; };
// 拳套 trait mark (斧 already has wAxe12)
{ const D = DEF.passives.tr11, _mk = D.make; D.make = function (v, u) { const r = _mk.call(this, v, u), T = new Set((v && v.traits) || []); if (T.has('拳套')) r.mods.push({ pzFist12: 1 }); return r; }; }

/* ---------- core: record the hero's hits that land on a 破綻; at the end of that action, break the ones still standing and give one 追擊 ---------- */
{ const P = BattleCore.prototype, _em = P.emit, _ea = P.endAction, _pr = P.prepare, _tk = P.tick, _tc = P.tickCooldowns;
  P.emit = function (type, o = {}, main = null) {
    if (type === EVT.HIT && !PZ12.off && o.src && o.src.hero && this.act && !this.act.reaction && o.tgts && o.tgts[0] && o.payload) { const t = o.tgts[0], m = pzMatch12(o.src, o.payload.skill, t); if (m) (this.pz12 || (this.pz12 = [])).push({ aid: this.act.action_id, t: t.id, m }); }
    return _em.call(this, type, o, main); };
  P.endAction = function (cmd, executed) {
    const all = this.pz12 || [], L = cmd ? all.filter(r => r.aid === cmd.action_id) : []; if (L.length) this.pz12 = all.filter(r => r.aid !== cmd.action_id);
    const u = cmd && this.byId[cmd.actor];
    if (L.length && u && u.hero && !cmd.reaction && executed && !this.ended()) { let any = false; const seen = new Set();
      for (const r of L) { if (seen.has(r.t)) continue; seen.add(r.t); const t = this.byId[r.t]; if (!t || !this.isUp(t) || this.hasStatus(t, 'broken') || wardFoe12(t) || t.data.pzDone12) continue;
        this.emit(EVT.BREAK, { src: u, tgts: [t], tags: ['break', 'pz12'], payload: { pz: r.m } }, () => { t.data.pzDone12 = 1; t.data.brkN11 = (t.data.brkN11 || 0) + 1; this.applyStatus(u, t, 'broken', {}); this.removeStatus(t, 'charging', 'break'); this.removeStatus(t, 'airborne', 'break'); });
        any = true; }
      if (any && this.isUp(u) && !this.ended() && !this.alive('B').some(f => wardFoe12(f))) this.extraTurn(u, 'chase12'); } // 頭目・菁英還在場上：小兵照樣破防，但不給追擊
    this._pzChase = !!(cmd && cmd.meta && cmd.meta.extra === 'chase12' && u && u.hero);
    try { return _ea.call(this, cmd, executed); } finally { this._pzChase = false; } };
  // 追擊 doesn't count as a turn: no status ticks, no cooldown ticks for it
  P.prepare = function (cmd) { const u = cmd && this.byId[cmd.actor]; this._pzChase = !!(cmd && cmd.meta && cmd.meta.extra === 'chase12' && u && u.hero); try { return _pr.call(this, cmd); } finally { this._pzChase = false; } };
  P.tick = function (u, when) { if (this._pzChase && u && u.hero && (when === 'owner_action_start' || when === 'owner_action_end')) return; return _tk.call(this, u, when); };
  P.tickCooldowns = function (u, ...a) { if (this._pzChase && u && u.hero) return; return _tc.call(this, u, ...a); }; }
// 一般魔物被破綻打到破防：受到的傷害 +25%（菁英・頭目照舊 +50%）——跳過行動加上追擊已經很多了
{ const _bm = BR.FORMULA.brokenMul; BR.FORMULA.brokenMul = c => c && c.tgt && !c.tgt.hero && !wardFoe12(c.tgt) && !PZ12.off ? PZ12.brk : _bm(c); }
// the test bot (PZ12.bot): aims for a 破綻 when one of its skills fits
{ const _h = BAI.hero; BAI.hero = function (core, u, policy) { const d = _h.call(this, core, u, policy); if (!PZ12.bot || PZ12.off || policy === 'attack') return d;
    const can = id => { const k = DEF.skills[id]; return k && !core.onCooldown(u, id) && (k.costs || []).every(c => (u.res[c.res] || 0) >= core.costOf(u, k, c)); };
    const ids = [u.data.attackSkill || 'attack'].concat(u.data.slots || []).filter(can);
    for (const f of core.foesOf(u)) { if (!core.isUp(f) || core.hasStatus(f, 'broken') || wardFoe12(f) || f.data.pzDone12) continue; const id = ids.find(q => pzMatch12(u, q, f)); if (id) return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'enemy' ? [f.id] : [] }; }
    return d; }; }
// 菁英・頭目：打中破綻對護盾 ×2
{ const _wm = wardMul12; wardMul12 = function (core, s, t, P) { const m = _wm(core, s, t, P); if (PZ12.off || PZ12.noWard || !(s && s.hero && P && P.skill && pzMatch12(s, P.skill, t))) return m; return Math.min(m * 2, WARD12.mul.cap * (1 + wardSum12(s, 'wbrk12') / 100)); }; }

/* ---------- scene ---------- */
const pzKnown12 = sp => !!(Game.st && Game.st.dex && Game.st.dex[sp] && Game.st.dex[sp].pz12);
// the scene's view of a status (the core runs a step ahead of what's on screen)
const pzBrokenV12 = (core, u) => { const B = Game.scene, v = B && B.core === core && B.views && B.views[u.id]; return v && v.st ? 'broken' in v.st : core.hasStatus(u, 'broken'); };
const pzChase12 = B => !!(B && B.core && B.core.need && B.core.need.extra === 'chase12');
KB12.RIB['追擊！'] = '追擊！再動一次';
// reveal: a hero hit that lands on a monster's 破綻
{ const _oe = Battle.prototype.onEvent; Battle.prototype.onEvent = function* (e) {
    if (e && e.type === EVT.HIT && e.src && e.tgts && e.tgts[0] && e.payload && Game.st) { const s = this.core.byId[e.src], t = this.core.byId[e.tgts[0]];
      if (s && s.hero && t && t.sp && pzMatch12(s, e.payload.skill, t)) { const D = Game.st.dex || (Game.st.dex = {}), d = D[t.sp] || (D[t.sp] = {}); if (!d.pz12) d.pz12 = 1; } }
    return yield* _oe.call(this, e); }; }
// the break by a 破綻: smaller than the shield break, a word over the monster, one line
{ const H = Battle.prototype.handlers, _br = H.BREAK; H.BREAK = function* (e, s, t, P) {
    if (!(e && e.tags && e.tags.includes('pz12'))) return yield* _br.call(this, e, s, t, P);
    if (!t) return; const C = this.center(t); t.flash = 24; Sound.sfx('crit'); this.shake = Math.max(this.shake || 0, 14);
    this.sparks(C.x, C.y, 18, ['#ffe070', '#ffffff', '#ffd27a'], 3, 22, 0.12); this.popNum(t, '破防！', '#ffd040', null, { big: 1 }); this.anim(t, 'hurt', 24, true);
    yield* wait(12); if (t.A) t.A.hold = false; yield* this.msg('打中破綻！' + t.n + '破防了！', { hold: 22 });
    const f = (Game.st || {}).flags || {}; if (!f.tutPz12b) { f.tutPz12b = 1; yield* this.msg('（打中破綻的魔物會破防：下一次不能行動、受到的傷害也提高。你還能馬上再動一次——追擊！）', { hold: 90 }); } };
  const _ex = H.EXTRA_ACTION; H.EXTRA_ACTION = function* (e, s, t, P) { if (P && P.why === 'chase12') { if (P.queued && s) { Sound.sfx('select'); this.popNum(s, '追擊！', '#ffd860', null, { big: 1 }); } return; } if (_ex) return yield* _ex.call(this, e, s, t, P); };
  // the first battle with 破綻 on the plates: one line
  const _rs = H.ROUND_START; H.ROUND_START = function* (e, ...a) { yield* _rs.call(this, e, ...a); const f = (Game.st || {}).flags || {};
    if (!f.tutPz12 && f.tutIntent14 && e.payload.round === 1 && this.core.alive('B').some(u => pzFoe12(u)) && !(typeof FXT13 !== 'undefined' && FXT13.on)) { f.tutPz12 = 1; yield* this.msg('（名牌上的「破綻」是魔物怕的攻擊方式：連擊・重擊・群攻・擾亂。技能選單會標出每一招是哪一種。）', { hold: 90 }); } }; }
// the plate chip
{ const _sg = KB12.signs; KB12.signs = function (v, short) { const L = _sg.call(this, v, short); if (!v || v.hero || !short) return L; const u = (this.core && this.core.byId[v.id]) || v.u || v, F = pzFoe12(u);
    if (!F || v.broken || (v.st && 'broken' in v.st)) return L; const k = pzKnown12(u.sp) ? F[0] : '？', c = PZ12.M[k] || PZ12.M['？'];
    const hot = this._pzSk && k !== '？' && pzSkill12(this.core.byId.H, this._pzSk).includes(k); L.unshift(['破綻 ' + k, hot ? '#ffffff' : c[0], hot ? 'rgba(150,108,20,0.96)' : c[1]]); return L; }; }
// the 破防 star over a broken monster
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { if (u && core && core.isUp(u) && pzBrokenV12(core, u)) return { k: 'down', t: '破防' }; return _io(core, u, cmd); }; }
// 追擊: the buttons glow gold, 逃跑 is dim
{ const _cb = KB12.cmdBtn; KB12.cmdBtn = (x, k, n, X, m, on) => { const B = Game.scene; if (!pzChase12(B)) return _cb(x, k, n, X, m, on);
    const Y = m.y, w = 31, h = m.rowH, run = n === '逃跑';
    KB12.panel(x, X, Y, w, h, { r: 5, rim: run ? 'rgba(255,255,255,0.10)' : on ? '#ffd860' : 'rgba(255,216,96,0.55)', lw: on ? 1.2 : 0.8, glow: on && !run ? 'rgba(255,216,96,0.7)' : null, top: on && !run ? 'rgba(92,70,30,0.92)' : null, bot: on && !run ? 'rgba(40,28,10,0.95)' : null });
    KB12.icon(x, k, X + w / 2, Y + 11, run ? '#5a6070' : on ? '#ffe8b0' : '#d8d0b0'); KB12.tc(x, n, X + w / 2, Y + h - 8, run ? '#5a6070' : on ? '#fff2d8' : '#e0d8bc', KB12.M); }; }
{ const B = Battle.prototype, _ab = B.anyBoss, _ms = B.msg; B.anyBoss = function () { return _ab.call(this) || (this._pzCmd && pzChase12(this)); };
  B.msg = function (t, o) { if (t === '不能從這場戰鬥中逃走！' && this._pzCmd && pzChase12(this) && !_ab.call(this)) t = '追擊中不能逃跑！'; return _ms.call(this, t, o); };
  const _cmd = B.command; B.command = function* () { this._pzCmd = true; try { return yield* _cmd.call(this); } finally { this._pzCmd = false; } };
  // the skill menu: each skill's ways, and a gold frame on the ones that hit a 破綻 that's known on the field
  const _cm = B.chooseMove; B.chooseMove = function* () { const hu = this.core.byId.H; this._pzList = hu.skills.filter(id => DEF.skills[id] && id !== hu.data.attackSkill); try { return yield* _cm.call(this); } finally { this._pzList = null; } };
  const _pt = B.pickTarget; B.pickTarget = function* (sk) { this._pzSk = sk; try { return yield* _pt.call(this, sk); } finally { this._pzSk = null; } }; }
{ const _ch = choose; choose = function* (items, o = {}) { const B = Game.scene;
    if (o && o.title === '技能' && B && B._pzList && B._pzList.length === items.length && typeof o.drawExtra === 'function') { const L = B._pzList, de = o.drawExtra;
      o = { ...o, drawExtra: (x, m) => { de(x, m); if (m.formula) return; const hu = B.core.byId.H, foes = B.core.alive('B'), known = new Set();
        for (const f of foes) { const F = pzFoe12(f); if (F && pzKnown12(f.sp) && !B.core.hasStatus(f, 'broken')) F.forEach(k => known.add(k)); }
        for (let k = 0; k < L.length; k++) { const r = Math.floor(k / m.cols) - m.scrollTop; if (r < 0 || r >= m.scrollMax) continue;
          const X = m.x + m.ox, Y = m.y + m.oy + r * m.rowH, ks = pzSkill12(hu, L[k]); if (!ks.length) continue; const hot = ks.some(q => known.has(q));
          if (hot) { x.save(); KB12.rr(x, m.x + 3, Y + 7 - Math.floor((m.rowH - 1) / 2), m.w - 6, m.rowH - 1, 3); x.strokeStyle = 'rgba(255,216,96,0.8)'; x.lineWidth = 0.7; x.stroke(); x.restore(); }
          const it = items[k], R = m.x + m.w - 8 - (it.r ? Font.width(it.r, m.fs) + 4 : 0); let cx = X + Math.ceil(Font.width(it.t, m.fs)) + 4;
          for (const q of ks) { const cw = KB12.chipW(q); if (cx + cw > R) break; const c = PZ12.M[q], lit = known.has(q); KB12.chip(x, q, cx, Y + 3, lit ? c[0] : '#9aa0b4', lit ? c[1] : 'rgba(30,32,46,0.94)'); cx += cw + 2; } } } };
      return yield* _ch(items, o); }
    return yield* _ch(items, o); }; }
// 圖鑑：破綻
{ const _dw = dexWeak11; dexWeak11 = function (sp) { const t = _dw(sp), F = pzFoe12({ sp, fam: (SPECIES[sp] || {}).fam }); if (!F) return t; return '破綻 ' + (pzKnown12(sp) ? F.join('・') : '？') + (t && t !== '—' ? '　' + t : ''); }; }
