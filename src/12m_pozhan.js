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

/* ===================== v12.90 破綻與追擊（第二階段）：連殺（玩家：「第二階段開始」，2026-10-09） =====================
   · 溢出：單發的招（一般攻擊也算）把魔物打倒時，多出來的傷害打到旁邊那隻（一招只轉一次）。連擊的招本來就會把後面幾段打到別隻。
   · 總攻擊：場上 2 隻以上、全部同時破防時，「攻擊」變成金色的「總攻擊」：不花 MP，對全體各打一般攻擊的 2.5 倍（再加破防的傷害）。
   · 連殺：同一次出手（含追擊）打倒 2 隻以上，上方橫帶「連殺×2」；一口氣清光是「全滅！」。第 2 隻起每多打倒一隻回 5% MP。
   · 頭目・菁英在場上時沒有追擊、也沒有總攻擊（頭目戰保持難）。 */
Object.assign(PZ12, { allMul: 2.5, chainMp: 0.05 });
defPut('skills', 'pz_allout', { ...DEF.skills.attack, id: 'pz_allout', name: '總攻擊', desc: '全部的魔物都破防時才能用：對全體各打一般攻擊的 2.5 倍。', target: 'all_enemies', power: Math.round(DEF.skills.attack.power * PZ12.allMul / BR.AOE_MUL),
  tags: DEF.skills.attack.tags.filter(t => t !== 'basic').concat(['aoe', 'pz12']), costs: [], cooldown: 0 });
const pzAllOutCore12 = core => { const F = core.alive('B'); return !PZ12.off && F.length >= 2 && F.every(f => core.hasStatus(f, 'broken')) && !F.some(f => wardFoe12(f)); };
const pzAllOut12 = B => !!(B && B.core && B.core.need && B.core.need.unit && B.core.need.unit.hero && pzAllOutCore12(B.core));
{ const P = BattleCore.prototype, _sub = P.submit, _dd = P.dealDamage, _em2 = P.emit, _pr2 = P.prepare;
  // 攻擊 while everything is broken → 總攻擊
  P.submit = function (cmd) { const u = this.need && this.need.unit; if (u && u.hero && cmd && cmd.type === 'skill' && cmd.skill === (u.data.attackSkill || 'attack') && pzAllOutCore12(this)) cmd = { ...cmd, skill: 'pz_allout', targets: [] }; return _sub.call(this, cmd); };
  // overflow: a single-shot hit that knocks a monster down passes the rest to the one beside it
  P.dealDamage = function (src, tgt, amount, info = {}) { const hp0 = tgt && tgt.res ? tgt.res.hp : 0, e = _dd.call(this, src, tgt, amount, info);
    if (!PZ12.off && e && src && src.hero && tgt && tgt.side === 'B' && tgt.down && this.act && !this.act.reaction && this.act.actor === src.id && !this.act.ofl12 && (info.kind || 'hit') === 'hit' && info.skill) {
      const D = DEF.skills[info.skill], one = D && D.target === 'enemy' && !(D.hits && D.hits[1] >= 2) && !D.hitsOf && !(D.tags || []).includes('multi_hit'), over = Math.floor(amount) - hp0;
      if (one && over > 0) { const L = this.alive('B'); if (L.length) { const nb = L.slice().sort((a, b) => Math.abs((a.slot || 0) - (tgt.slot || 0)) - Math.abs((b.slot || 0) - (tgt.slot || 0)))[0]; this.act.ofl12 = 1;
        _dd.call(this, src, nb, over, { skill: info.skill, cat: info.cat || D.cat, kind: 'overflow', tags: ['overflow12'], min: 1 }); } } }
    return e; };
  // 連殺: count the hero's knock-downs in one go (its action and the 追擊 after it)
  P.prepare = function (cmd) { const u = cmd && this.byId[cmd.actor]; if (u && u.hero && !cmd.reaction && !(cmd.meta && cmd.meta.extra === 'chase12')) this.kc12 = 0; return _pr2.call(this, cmd); };
  P.emit = function (type, o = {}, main = null) { const e = _em2.call(this, type, o, main);
    if (type === EVT.DOWN && !PZ12.off && o.src && o.src.hero && o.tgts && o.tgts[0] && o.tgts[0].side === 'B' && o.tgts[0].down && this.act && this.act.actor === o.src.id) {
      this.kc12 = (this.kc12 || 0) + 1; if (this.kc12 >= 2 && this.isUp(o.src)) { const all = !this.alive('B').length;
        if (o.src.res.mp < o.src.max.mp) this.changeRes(o.src, 'mp', Math.max(1, Math.ceil(o.src.max.mp * PZ12.chainMp)), { why: 'chain12:' + this.kc12 + (all ? ':all' : ''), force: 1 });
        else this.emit(EVT.RESOURCE_CHANGE, { src: o.src, tgts: [o.src], payload: { res: 'mp', old: o.src.res.mp, change: 0, new: o.src.res.mp, why: 'chain12:' + this.kc12 + (all ? ':all' : '') } }, () => {}); } }
    return e; }; }
// the test bot uses 總攻擊 when it can
{ const _h2 = BAI.hero; BAI.hero = function (core, u, policy) { if (PZ12.bot && !PZ12.off && policy !== 'attack' && pzAllOutCore12(core)) return { type: 'skill', skill: 'pz_allout', targets: [] }; return _h2.call(this, core, u, policy); }; }
// scene
KB12.RIB['總攻擊！'] = '總攻擊！'; KB12.RIB['全滅！'] = '全滅！'; for (let n = 2; n <= 6; n++) KB12.RIB['連殺×' + n] = '連殺×' + n;
KB12.TAG['溢出'] = ['#8ee6ff', '#0c2c3c'];
{ const H = Battle.prototype.handlers, _su = H.SKILL_USE, _dm = H.DAMAGE, _rc = H.RESOURCE_CHANGE;
  H.SKILL_USE = function* (e, s, t, P) { if (P && P.skill === 'pz_allout' && s) { Sound.sfx('charge'); this.spawn({ k: 'flash', c: '#fff4c8', a: 0.6, life: 10 }); this.shake = Math.max(this.shake || 0, 18); this.popNum(s, '總攻擊！', '#ffd860', null, { big: 1 }); yield* wait(14); } return yield* _su.call(this, e, s, t, P); };
  H.DAMAGE = function* (e, s, t, P) { if (!(P && (P.kind === 'overflow' || (e && e.tags && e.tags.includes('overflow12'))))) return yield* _dm.call(this, e, s, t, P);
    if (t) { const C = this.center(t); Sound.sfx('slash'); this.sparks(C.x, C.y, 12, ['#8ee6ff', '#ffffff'], 2.6, 18, 0.1); } this._ofl12 = 1; try { yield* _dm.call(this, e, s, t, { ...P, kind: 'hit' }); } finally { this._ofl12 = 0; } };
  H.RESOURCE_CHANGE = function* (e, s, t, P) { const m = P && typeof P.why === 'string' && /^chain12:(\d+)(:all)?/.exec(P.why);
    if (m) { const n = +m[1], all = !!m[2], hv = t || s; Sound.sfx('crit'); if (hv) this.popNum(hv, all ? '全滅！' : '連殺×' + Math.min(6, n), '#ffd860', null, { big: 1 }); if (t) { t.res.mp = P.new; t.mp = P.new; if (P.change > 0) this.popNum(t, '+' + P.change + 'MP', '#8ab8ff', null, { small: 1, dy: 10 }); } yield* wait(10); return; }
    return yield* _rc.call(this, e, s, t, P); };
  const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o) { if (this._ofl12 && KB12.isNum(s) && !tag) tag = '溢出'; return _pn.call(this, v, s, c, tag, o); };
  // 總攻擊 skips choosing a target
  const _pt2 = Battle.prototype.pickTarget; Battle.prototype.pickTarget = function* (sk) { const hu = this.core.byId.H; if (sk === (hu.data.attackSkill || 'attack') && pzAllOut12(this)) { const F = this.core.alive('B'); return F[0] ? F[0].id : null; } return yield* _pt2.call(this, sk); }; }
// the 攻擊 button turns into 總攻擊
{ const _cb2 = KB12.cmdBtn; KB12.cmdBtn = (x, k, n, X, m, on) => { const B = Game.scene; if (n !== '攻擊' || !pzAllOut12(B)) return _cb2(x, k, n, X, m, on);
    const Y = m.y, w = 31, h = m.rowH, t = (B && B.t) || 0, pulse = 0.65 + 0.35 * Math.sin(t / 6);
    KB12.panel(x, X, Y, w, h, { r: 5, rim: '#ffd860', lw: on ? 1.4 : 1, glow: 'rgba(255,216,96,' + (on ? 0.95 : 0.55 * pulse).toFixed(2) + ')', top: 'rgba(120,88,20,0.95)', bot: 'rgba(60,40,6,0.97)' });
    KB12.icon(x, k, X + w / 2, Y + 11, '#fff2c0'); KB12.tc(x, '總攻擊', X + w / 2, Y + h - 8, '#fff6dc', KB12.M, w - 3); }; }
