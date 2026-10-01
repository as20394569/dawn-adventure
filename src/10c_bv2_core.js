/* ===================== v11 戰鬥核心 v2 — 執行層：BattleCore（狀態機、ActionCommand、事件／觸發／效果） =====================
   Synchronous and headless: run() advances until a player unit needs a command (core.need) or the battle ends (core.result).
   Everything that happens is an event in core.log (in MAIN order); the view plays the log back. */
const BS = { INIT: 'INIT', BATTLE_START: 'BATTLE_START', ROUND_START: 'ROUND_START', WAITING_ACTION: 'WAITING_ACTION', TURN_ORDER: 'TURN_ORDER',
  ACTION_PREPARE: 'ACTION_PREPARE', ACTION_EXECUTION: 'ACTION_EXECUTION', REACTION_RESOLUTION: 'REACTION_RESOLUTION', ACTION_END: 'ACTION_END',
  ROUND_END: 'ROUND_END', VICTORY_CHECK: 'VICTORY_CHECK', BATTLE_END: 'BATTLE_END' };
const BS_NEXT = {
  INIT: ['BATTLE_START'], BATTLE_START: ['ROUND_START', 'VICTORY_CHECK'], ROUND_START: ['WAITING_ACTION', 'VICTORY_CHECK'], WAITING_ACTION: ['TURN_ORDER'],
  TURN_ORDER: ['ACTION_PREPARE', 'ROUND_END'], ACTION_PREPARE: ['ACTION_EXECUTION', 'ACTION_END'], ACTION_EXECUTION: ['ACTION_END'],
  ACTION_END: ['REACTION_RESOLUTION', 'ACTION_PREPARE', 'ROUND_END', 'VICTORY_CHECK'], REACTION_RESOLUTION: ['ACTION_PREPARE'],
  ROUND_END: ['VICTORY_CHECK'], VICTORY_CHECK: ['BATTLE_END', 'ROUND_START', 'ACTION_PREPARE', 'ROUND_END', 'REACTION_RESOLUTION'], BATTLE_END: [],
};

class BattleCore {
  constructor(o) {
    this.seed = o.seed >>> 0; this.rng = makeRng(this.seed); this.env = o.env || {}; this.cfg = o.cfg || {}; this.flags = o.flags || {};
    this.units = []; this.byId = {}; this.state = BS.INIT; this.round = 0; this.seq = 0; this.log = []; this.evStack = [];
    this.actSeq = 0; this.castSeq = 0; this.hitSeq = 0; this.queue = []; this.reactQ = []; this.cmds = {}; this.need = null; this.result = null;
    this.act = null; this.cast = null; this.hit = null; this.evAction = 0; this.trigAction = 0; this.trigRound = 0; this.usage = {}; this.stopped = null;
    this.envMods = (o.envMods || []).slice(); this.envTrigs = (o.envTrigs || []).slice(); this.escTries = 0; this.castTotal = {}; this.data = {}; this.orderIdx = {};
    this.trace = []; // safety stops (spec 66/78): the full chain is kept here
    for (const s of o.units) this.addUnit(s, true);
  }
  /* ---------- units ---------- */
  addUnit(s, initial) {
    const u = { id: s.id, side: s.side, name: s.name, hero: !!s.hero, kind: s.kind || (s.hero ? 'hero' : 'wild'), sp: s.sp || null, fam: s.fam || null, lv: s.lv || 1,
      rare: !!s.rare, boss: s.kind === 'boss', elite: s.kind === 'elite', minion: s.kind === 'minion', stats: { ...s.stats }, attr: s.attr || null,
      res: {}, max: {}, statuses: [], passives: s.passives || [], skills: s.skills || [], ai: s.ai || null, tags: s.tags || [], mods: [], trigs: [],
      acted: 0, actedTotal: 0, down: false, fled: false, slot: s.slot ?? 0, data: s.data || {}, ref: s.ref || null };
    for (const r in DEF.resources) { const R = DEF.resources[r]; if (R.appliesTo && !R.appliesTo(u, s)) continue; u.max[r] = R.maxOf ? R.maxOf(u, s) : R.max ?? 0; u.res[r] = R.initOf ? R.initOf(u, s) : (R.init ?? 0); }
    if (s.res) Object.assign(u.res, s.res); if (s.max) Object.assign(u.max, s.max);
    this.units.push(u); this.byId[u.id] = u; this.compile(u);
    for (const st of s.statuses || []) u.statuses.push({ id: st.id, stacks: st.stacks || 1, dur: st.dur ?? null, src: null, at: 0, data: st.data || {} });
    if (!initial) this.emit(EVT.SUMMON, { src: u, tgts: [u], payload: { sp: u.sp } });
    return u;
  }
  compile(u) { // passives (data) → modifiers + triggers on the unit
    u.mods = []; u.trigs = [];
    for (const p of u.passives) { const D = DEF.passives[p.key]; if (!D || !D.enabled) continue; const made = D.make ? D.make(p.v, u) : D;
      for (const m of made.mods || []) u.mods.push({ ...m, key: p.key }); for (const t of made.triggers || []) u.trigs.push({ ...t, key: p.key, uid: p.key + '#' + u.trigs.length }); }
    for (const mid of (u.data.mechanics || [])) { const M = DEF.mechanics[mid]; if (!M) { bvErr('core', 'mechanic ' + mid + ' missing'); continue; } const made = M.make ? M.make(u, this) : M;
      for (const m of made.mods || []) u.mods.push({ ...m, key: mid }); for (const t of made.triggers || []) u.trigs.push({ ...t, key: mid, uid: mid + '#' + u.trigs.length }); }
  }
  side(s) { return this.units.filter(u => u.side === s); }
  alive(s) { return this.units.filter(u => u.side === s && !u.down && !u.fled); }
  foesOf(u) { return this.alive(u.side === 'A' ? 'B' : 'A'); }
  alliesOf(u) { return this.alive(u.side); }
  isUp(u) { return !!u && !u.down && !u.fled; }
  statusOf(u, id) { return u.statuses.find(s => s.id === id) || null; }
  hasStatus(u, id) { return !!this.statusOf(u, id); }
  majorOf(u) { const s = u.statuses.find(x => DEF.statuses[x.id].group === 'major'); return s ? s.id : null; }
  /* ---------- state machine ---------- */
  go(next) {
    if (!BS_NEXT[this.state].includes(next)) { const m = bvErr('state', 'illegal transition ' + this.state + ' → ' + next); if (BV2.DEV) throw new Error(m); }
    this.state = next;
  }
  run() {
    let guard = 0;
    while (!this.result && guard++ < 5000) {
      switch (this.state) {
        case BS.INIT: this.go(BS.BATTLE_START); break;
        case BS.BATTLE_START: this.emit(EVT.BATTLE_START, { payload: { units: this.units.map(u => u.id) } }); this.go(this.ended() ? BS.VICTORY_CHECK : BS.ROUND_START); break;
        case BS.ROUND_START: {
          this.round++; this.trigRound = 0; for (const k in this.usage) if (this.usage[k].round !== this.round) this.usage[k].r = 0;
          for (const u of this.units) u.acted = 0; this.cmds = {};
          this.emit(EVT.ROUND_START, { payload: { round: this.round } });
          this.go(this.ended() ? BS.VICTORY_CHECK : BS.WAITING_ACTION); break; }
        case BS.WAITING_ACTION: {
          for (const u of this.units) { if (!this.isUp(u) || this.cmds[u.id]) continue;
            const forced = this.forcedCommand(u); if (forced) { this.cmds[u.id] = forced; continue; }
            if (u.hero && !this.auto) { this.need = { unit: u, round: this.round }; return this.need; }
            this.cmds[u.id] = this.validCmd(u, BAI.decide(this, u)); if (u.hero) this.data.lastHeroAct = this.cmds[u.id].type === 'skill' ? this.cmds[u.id].skill : this.cmds[u.id].type; }
          this.need = null; this.go(BS.TURN_ORDER); break; }
        case BS.TURN_ORDER: this.buildQueue(); this.go(this.queue.length ? BS.ACTION_PREPARE : BS.ROUND_END); break;
        case BS.ACTION_PREPARE: {
          const cmd = this.queue.shift(); this.act = cmd; this.evAction = 0; this.trigAction = 0;
          const ok = this.prepare(cmd); if (ok) this.go(BS.ACTION_EXECUTION); else { this.go(BS.ACTION_END); this.endAction(cmd, false); } break; }
        case BS.ACTION_EXECUTION: this.execute(this.act); this.go(BS.ACTION_END); this.endAction(this.act, true); break;
        case BS.REACTION_RESOLUTION: { const r = this.reactQ.shift(); this.queue.unshift(r); this.go(BS.ACTION_PREPARE); break; }
        case BS.ACTION_END: break; // handled in endAction
        case BS.ROUND_END: this.roundEnd(); this.go(BS.VICTORY_CHECK); break;
        case BS.VICTORY_CHECK: {
          const end = this.ended(); if (end) { this.go(BS.BATTLE_END); this.finish(end); break; }
          if (this.reactQ.length) { this.go(BS.REACTION_RESOLUTION); break; }
          if (this.queue.length) { this.go(BS.ACTION_PREPARE); break; }
          if (this.roundDone) { this.roundDone = false; this.go(BS.ROUND_START); } else this.go(BS.ROUND_END); break; }
        case BS.BATTLE_END: return this.result;
      }
    }
    if (!this.result && guard >= 5000) { bvErr('run', 'state machine guard hit'); this.finish('draw'); }
    return this.result;
  }
  start(auto) { this.auto = !!auto; return this.run(); }
  submit(cmd) { if (!this.need) return bvErr('submit', 'no input pending'); const u = this.need.unit; this.cmds[u.id] = this.validCmd(u, { ...cmd, actor: u.id }); this.data.lastHeroAct = cmd.type === 'skill' ? cmd.skill : cmd.type; this.need = null; return this.run(); }
  endAction(cmd, executed) {
    const u = this.byId[cmd.actor]; if (u && executed && !cmd.reaction) { u.acted++; u.actedTotal++; this.orderIdx[u.id] = this.actSeq; }
    this.emit(EVT.ACTION_END, { src: u, payload: { type: cmd.type, skill: cmd.skill, executed } });
    if (this.ended()) { this.go(BS.VICTORY_CHECK); return; }
    if (this.reactQ.length) { this.go(BS.REACTION_RESOLUTION); return; }
    if (this.queue.length) { this.go(BS.ACTION_PREPARE); return; }
    this.go(BS.ROUND_END);
  }
  ended() {
    if (this.escaped) return 'run'; const A = this.alive('A'), B = this.alive('B');
    if (!A.length) return 'lose'; if (!B.length) return this.units.some(u => u.side === 'B' && u.down) ? 'win' : 'foe_fled';
    return null;
  }
  /* ---------- commands ---------- */
  forcedCommand(u) {
    const ch = this.statusOf(u, 'charging'); if (ch) return { action_id: 0, actor: u.id, type: 'skill', skill: ch.data.skill, targets: ch.data.targets || [], meta: { release: 1 } };
    return null;
  }
  validCmd(u, c) {
    const cmd = { action_id: 0, actor: u.id, type: c.type || 'skill', skill: c.skill || null, item: c.item || null, targets: c.targets || [], meta: c.meta || {} };
    if (cmd.type === 'skill' && (!cmd.skill || !DEF.skills[cmd.skill])) { bvErr('cmd', 'unknown skill ' + cmd.skill); cmd.skill = u.hero ? 'attack' : (u.skills[0] || 'm_tackle'); }
    return cmd;
  }
  buildQueue() {
    const list = []; for (const u of this.units) { const c = this.cmds[u.id]; if (c && this.isUp(u)) list.push(c); }
    // frenzy etc.: extra actions this round (data: status.extraEvery)
    for (const u of this.alive('A').concat(this.alive('B'))) for (const s of u.statuses) { const D = DEF.statuses[s.id]; if (D.extraEvery && this.round % D.extraEvery === 0) list.push({ actor: u.id, type: 'ai_extra', targets: [], meta: { extra: s.id } }); }
    const roll = {}; for (const u of this.units) roll[u.id] = this.rng.next();
    const fr = u => this.round === 1 && u.mods.some(m => m.firstRoundPrio) ? 0.6 : 0, sw = u => u.data.swift ? 0.5 : 0;
    const ps = (u, id) => u.mods.some(m => m.prioSkill === id) ? 1 : 0;
    const pr = c => c.type === 'skill' ? (DEF.skills[c.skill].prio || 0) + fr(this.byId[c.actor]) + sw(this.byId[c.actor]) + ps(this.byId[c.actor], c.skill) + (c.meta.prioAdd || 0) : c.type === 'ai_extra' ? -9 : (BR.ORDER_PRIO[c.type] ?? 0);
    list.sort((a, b) => pr(b) - pr(a) || BR.speed(this, this.byId[b.actor]) - BR.speed(this, this.byId[a.actor]) || roll[a.actor] - roll[b.actor] || (a.actor < b.actor ? -1 : 1));
    this.queue = list; this.roundDone = false;
  }
  /* ---------- one action ---------- */
  prepare(cmd) {
    const u = this.byId[cmd.actor]; cmd.action_id = ++this.actSeq; this.cast = null; this.hit = null;
    if (!this.isUp(u)) return false;
    if (cmd.type === 'ai_extra') { const c2 = this.validCmd(u, BAI.decide(this, u, { extra: 1 })); Object.assign(cmd, c2, { action_id: cmd.action_id, meta: { ...c2.meta, extra: 1 } });
      this.emit(EVT.EXTRA_ACTION, { src: u, tgts: [u], payload: { why: cmd.meta.extra || 'frenzy' } }); }
    const e = this.emit(EVT.ACTION_START, { src: u, payload: { type: cmd.type, skill: cmd.skill, item: cmd.item, reaction: !!cmd.reaction } });
    if (e.cancelled || !this.isUp(u)) { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why: e.payload.why || 'cancel' } }); return false; }
    // can the unit act? (data: statuses with blockAction)
    if (!cmd.reaction) for (const s of u.statuses.slice()) { const D = DEF.statuses[s.id]; if (!D.blockAction) continue;
      const why = D.blockAction(this, u, s, cmd); if (why) { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why, status: s.id } }); return false; } }
    if (cmd.type === 'skill') {
      const sk = DEF.skills[cmd.skill]; this.emit(EVT.SKILL_SELECT, { src: u, payload: { skill: sk.id } });
      if (sk.usage && sk.usage.perBattle) { const k = 'skill|' + u.id + '|' + sk.id, n = this.data[k] || 0; if (n >= sk.usage.perBattle) { this.emit(EVT.SKILL_FAIL, { src: u, payload: { skill: sk.id, why: 'used' } }); return false; } this.data[k] = n + 1; }
      // retarget: the chosen foe fell → the next living one of the same side
      if (!this.target(u, sk, cmd)) return false;
      // costs (paid before the skill; a fallback skill when they can't be paid)
      const lack = (sk.costs || []).find(c => (u.res[c.res] || 0) < this.costOf(u, sk, c));
      if (lack) { this.emit(EVT.SKILL_FAIL, { src: u, payload: { skill: sk.id, why: 'cost', res: lack.res } });
        if (sk.fallback && sk.fallback !== sk.id) { cmd.skill = sk.fallback; return this.prepare2(u, cmd); } return false; }
      for (const c of sk.costs || []) { const amt = this.costOf(u, sk, c); const pe = this.emit(EVT.COST_PAY, { src: u, tgts: [u], payload: { skill: sk.id, res: c.res, amount: amt } }, e2 => { if (e2.payload.amount > 0) this.changeRes(u, c.res, -e2.payload.amount, { why: 'cost' }); }); }
    }
    return true;
  }
  prepare2(u, cmd) { return this.target(u, DEF.skills[cmd.skill], cmd); }
  target(u, sk, cmd) {
    const tg = this.resolveTargets(u, sk, cmd.targets); if (!tg.length && sk.target !== 'none') { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why: 'no_target' } }); return false; }
    if (cmd.targets.length && tg[0] && cmd.targets[0] !== tg[0].id && ['enemy', 'ally'].includes(sk.target)) this.emit(EVT.TARGET_CHANGE, { src: u, tgts: tg, payload: { from: cmd.targets[0] } });
    cmd.tg = tg.map(t => t.id); return true;
  }
  costOf(u, sk, c) { let a = c.amount; for (const m of u.mods) if (m.costMul && condOk(m.cond, { core: this, owner: u, src: u, skill: sk }) && (!m.res || m.res === c.res)) a = Math.round(a * m.costMul); return Math.max(0, a); }
  execute(cmd) {
    const u = this.byId[cmd.actor];
    if (cmd.type === 'skill') return this.doSkill(u, DEF.skills[cmd.skill], cmd.tg.map(id => this.byId[id]), cmd);
    if (cmd.type === 'defend') return this.emit(EVT.DEFEND, { src: u, tgts: [u], tags: ['defend', 'guard'] }, () => { this.applyStatus(u, u, 'guard', {}); });
    if (cmd.type === 'item') return this.doItem(u, cmd);
    if (cmd.type === 'run') return this.doRun(u);
    if (cmd.type === 'flee') return this.emit(EVT.ESCAPE, { src: u, tgts: [u], payload: { who: 'foe' } }, () => { u.fled = true; });
    if (cmd.type === 'wait') return this.emit(EVT.MESSAGE, { src: u, payload: { key: 'wait' } });
  }
  doRun(u) {
    this.escTries++; const boss = this.foesOf(u).some(f => f.boss || f.data.noEscape);
    const ok = !boss && BR.escape(this, u, this.escTries);
    this.emit(EVT.ESCAPE, { src: u, tgts: [u], payload: { who: 'hero', ok, boss } }, e => { if (e.payload.ok) this.escaped = true; });
  }
  doItem(u, cmd) {
    const it = DEF.items[cmd.item]; if (!it) return bvErr('item', 'unknown item ' + cmd.item);
    this.emit(EVT.ITEM_USE, { src: u, tgts: [u], payload: { item: it.id }, tags: ['item'] }, () => {
      if (this.data.useItem) this.data.useItem(cmd.item); // the bag lives outside the battle (bridge)
      if (it.escape) { const boss = this.foesOf(u).some(f => f.boss || f.data.noEscape); this.emit(EVT.ESCAPE, { src: u, tgts: [u], payload: { who: 'hero', ok: !boss, item: it.id, boss } }, e => { if (e.payload.ok) this.escaped = true; }); return; }
      this.exec(it.effects, { owner: u, src: u, tgt: u, skill: null });
    });
  }
  resolveTargets(u, sk, ids) {
    const foes = this.foesOf(u), allies = this.alliesOf(u), pickAlive = (pool) => { const want = ids && ids[0] && this.byId[ids[0]]; if (want && pool.includes(want)) return [want]; return pool.length ? [pool[0]] : []; };
    switch (sk.target) {
      case 'enemy': { const pool = foes.filter(f => sk.hitsAirborne || !this.hasStatus(f, 'airborne')); return pickAlive(pool.length ? pool : foes); }
      case 'all_enemies': return foes;
      case 'random_enemy': return foes.length ? [this.rng.pick(foes)] : [];
      case 'self': return [u];
      case 'ally': return pickAlive(allies);
      case 'all_allies': return allies;
      default: return [];
    }
  }
  /* the skill: cast → per target, per hit: hit roll → effects → triggers → down check (spec 19) */
  doSkill(u, sk, tg, cmd) {
    // two-turn skills: the first use only starts charging (data: sk.charge)
    if (sk.charge && !(cmd.meta && cmd.meta.release)) {
      return this.emit(EVT.CHARGE, { src: u, tgts: tg, payload: { skill: sk.id }, tags: ['charge'] }, () => {
        this.applyStatus(u, u, 'charging', { data: { skill: sk.id, targets: tg.map(t => t.id) } }); if (sk.airborne) this.applyStatus(u, u, 'airborne', {}); });
    }
    if (cmd.meta && cmd.meta.release) { this.removeStatus(u, 'charging', 'release'); this.removeStatus(u, 'airborne', 'release'); }
    const cast = ++this.castSeq; this.cast = cast; this.castTotal[cast] = 0;
    const use = this.emit(EVT.SKILL_USE, { src: u, tgts: tg, payload: { skill: sk.id, cast }, tags: sk.tags, skill: sk.id }, () => {
      if (sk.target === 'self' || sk.target === 'none' || sk.noHitRoll) { this.exec(sk.effects, { owner: u, src: u, tgt: tg[0] || u, skill: sk, cast, n: 0, targets: tg }); return; }
      const multi = tg.length > 1; let hits = sk.hits ? this.rng.int(sk.hits[0], sk.hits[1]) : 1; if (sk.hits) for (const m of u.mods) if (m.hitsAdd && condOk(m.cond, { core: this, owner: u, src: u, skill: sk })) hits += m.hitsAdd;
      tg.forEach((t, ti) => {
        let landed = 0; const scale = multi ? (sk.chain ? (ti === 0 ? 1 : BR.CHAIN_MUL) : BR.AOE_MUL) : 1;
        for (let h = 0; h < hits; h++) {
          if (!this.isUp(t) || !this.isUp(u)) break;
          this.hit = ++this.hitSeq;
          const air = this.hasStatus(t, 'airborne') && t.side !== u.side && !sk.hitsAirborne;
          const hc = air ? 0 : BR.hitChance(this, u, t, sk);
          if (!this.rng.chance(hc)) { this.emit(EVT.MISS, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: h, air } }); continue; }
          this.emit(EVT.HIT, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: h, hits } });
          this.exec(sk.effects, { owner: u, src: u, tgt: t, skill: sk, cast, n: h, scale, targets: tg }); landed++;
        }
        if (!landed && !sk.power) this.emit(EVT.SKILL_FAIL, { src: u, tgts: [t], payload: { skill: sk.id, why: 'miss' } });
      });
      if (sk.after && this.isUp(u)) this.exec(sk.after, { owner: u, src: u, tgt: tg[0] || u, skill: sk, cast, targets: tg, total: this.castTotal[cast] });
    });
    this.emit(EVT.SKILL_SUCCESS, { src: u, tgts: tg, payload: { skill: sk.id, cast, total: this.castTotal[cast] }, tags: sk.tags, skill: sk.id });
    this.hit = null; return use;
  }
  /* ---------- events ---------- */
  emit(type, o = {}, main = null) {
    if (++this.evAction > BV2.MAX_EVENTS_ACTION) { this.safety('events per action', type); return { type, cancelled: true, payload: o.payload || {} }; }
    const parent = o.parentEvt || this.evStack[this.evStack.length - 1] || null, depth = (parent ? parent.depth : 0) + (o.trig ? 1 : 0);
    const e = { id: ++this.seq, type, phase: 'PRE', src: o.src ? o.src.id : null, tgts: (o.tgts || []).filter(Boolean).map(t => t.id), direct: o.direct || (o.skill ? 'skill:' + o.skill : null),
      root: o.root || (parent ? parent.root : null) || o.direct || (o.skill ? 'skill:' + o.skill : null), parent: parent ? parent.id : null, rootEvt: parent ? parent.rootEvt : null,
      action: this.act ? this.act.action_id : null, cast: this.cast, hit: this.hit, depth, round: this.round, prio: o.prio || 0, tags: o.tags || [], payload: o.payload || {},
      snap: o.snap || null, resolved: false, cancelled: false };
    if (!e.rootEvt) e.rootEvt = e.id;
    if (depth > BV2.MAX_DEPTH) { this.safety('chain depth', type, e); e.cancelled = true; return e; }
    this.evStack.push(e);
    try {
      this.listen(e, 'PRE');
      if (!e.cancelled) { e.phase = 'MAIN'; this.log.push(e); if (main) main(e); e.resolved = true; e.phase = 'POST'; const te = this.listen(e, 'POST'); this.evStack.pop(); this.resolveTriggered(te, e); return e; }
      this.log.push(e);
    } finally { if (this.evStack[this.evStack.length - 1] === e) this.evStack.pop(); }
    return e;
  }
  safety(what, type, e) { const chain = this.evStack.map(x => x.type + '#' + x.id + '(' + x.depth + ')').join(' > '); this.trace.push({ what, type, chain, round: this.round }); bvErr('safety', what + ' limit at ' + type + ' :: ' + chain); }
  // find triggers that react to this event: units (passives, statuses, mechanics) then the environment
  listen(e, phase) {
    const out = [], src = e.src ? this.byId[e.src] : null, tgt = e.tgts.length ? this.byId[e.tgts[0]] : null, sk = e.payload.skill ? DEF.skills[e.payload.skill] : null;
    const consider = (owner, tr, statusInst) => {
      if (tr.on !== e.type || (tr.phase || 'POST') !== phase) return;
      if (owner && !tr.whenDown && (owner.down || owner.fled) && !(tr.role === 'tgt' && e.type === EVT.DOWN)) return;
      if (tr.role === 'src' && (!owner || e.src !== owner.id)) return;
      if (tr.role === 'tgt' && (!owner || !e.tgts.includes(owner.id))) return;
      if (tr.role === 'ally_src' && (!owner || !src || src.side !== owner.side)) return;
      if (tr.role === 'enemy_src' && (!owner || !src || src.side === owner.side)) return;
      if (tr.role === 'enemy_tgt' && (!owner || !tgt || tgt.side === owner.side)) return;
      if (tr.tags && !tr.tags.every(t => e.tags.includes(t) || (sk && sk.tags.includes(t)))) return;
      if (tr.notTags && tr.notTags.some(t => e.tags.includes(t) || (sk && sk.tags.includes(t)))) return;
      const ctx = { core: this, owner, src, tgt, skill: sk, ev: e, status: statusInst };
      if (!condOk(tr.cond, ctx)) return;
      const key = (owner ? owner.id : 'env') + '|' + (tr.uid || tr.key || tr.on), U = this.usage[key] || (this.usage[key] = { a: 0, r: 0, b: 0, act: -1, round: -1 });
      if (U.act !== (this.act && this.act.action_id)) { U.act = this.act && this.act.action_id; U.a = 0; } if (U.round !== this.round) { U.round = this.round; U.r = 0; }
      const L = tr.limit || {}; if ((L.perAction && U.a >= L.perAction) || (L.perRound && U.r >= L.perRound) || (L.perBattle && U.b >= L.perBattle)) return;
      if (tr.chance != null && !this.rng.chance(typeof tr.chance === 'function' ? tr.chance(ctx) : tr.chance)) return;
      U.a++; U.r++; U.b++;
      out.push({ owner, tr, ctx, status: statusInst, seq: out.length, prio: tr.prio || 0, sys: tr.system ? 0 : 1, react: tr.reaction ? 0 : 1, ord: owner ? (this.orderIdx[owner.id] ?? 0) : -1 });
    };
    for (const u of this.units) { for (const tr of u.trigs) consider(u, tr, null); for (const s of u.statuses) for (const tr of DEF.statuses[s.id].triggers || []) consider(u, { ...tr, uid: 'st:' + s.id + ':' + tr.on + (tr.uid || '') }, s); }
    for (const tr of this.envTrigs) consider(null, tr, null);
    out.sort((a, b) => a.sys - b.sys || a.react - b.react || b.prio - a.prio || a.ord - b.ord || a.seq - b.seq);
    if (phase === 'PRE') { for (const t of out) this.runTrigger(t, e, true); return null; }
    return out;
  }
  runTrigger(t, e, pre) {
    if (!pre) { if (++this.trigAction > BV2.MAX_TRIG_ACTION || ++this.trigRound > BV2.MAX_TRIG_ROUND) { this.safety('triggers per action/round', e.type); return; } }
    const ctx = { ...t.ctx, snap: { ...e.payload }, trigEv: e };
    if (pre) { this.exec(t.tr.effects, { ...ctx, pre: e }); return; }
    // re-check the owner right before it fires (spec 31): a fallen owner does not act unless the data says so
    if (t.owner && (t.owner.down || t.owner.fled) && !t.tr.whenDown) return;
    this.emit(EVT.EFFECT_TRIGGER, { src: t.owner, tgts: e.tgts.map(id => this.byId[id]), trig: 1, parentEvt: e, direct: (t.status ? 'status:' + t.status.id : 'passive:') + (t.tr.key || ''), prio: t.prio, payload: { key: t.tr.key || null, status: t.status ? t.status.id : null, on: e.type, msg: t.tr.msg || null }, tags: t.tr.tags2 || [] },
      () => this.exec(t.tr.effects, ctx));
  }
  resolveTriggered(list, e) { if (!list) return; for (const t of list) this.runTrigger(t, e, false); }
  /* ---------- effects ---------- */
  exec(effects, ctx) {
    for (const ef of effects || []) {
      if (ef.cond && !condOk(ef.cond, { core: this, owner: ctx.owner, src: ctx.src, tgt: ctx.tgt, skill: ctx.skill, ev: ctx.trigEv || ctx.pre, n: ctx.n })) continue;
      if (ef.chance != null && !this.rng.chance(typeof ef.chance === 'function' ? ef.chance(ctx) : ef.chance)) continue;
      const T = EFFECT_TYPES[ef.type]; if (!T) { bvErr('exec', 'effect type ' + ef.type + ' missing'); continue; }
      const tg = this.effTargets(ef, ctx);
      T.exec(this, ef, ctx, tg);
    }
  }
  effTargets(ef, ctx) {
    const pick = w => { switch (w) {
      case 'self': return [ctx.owner || ctx.src]; case 'source': return ctx.trigEv && ctx.trigEv.src ? [this.byId[ctx.trigEv.src]] : ctx.pre && ctx.pre.src ? [this.byId[ctx.pre.src]] : [ctx.src];
      case 'event_target': { const ev = ctx.trigEv || ctx.pre; return ev ? ev.tgts.map(id => this.byId[id]) : [ctx.tgt]; }
      case 'all_enemies': return this.foesOf(ctx.owner || ctx.src); case 'all_allies': return this.alliesOf(ctx.owner || ctx.src);
      case 'random_enemy': { const f = this.foesOf(ctx.owner || ctx.src); return f.length ? [this.rng.pick(f)] : []; }
      case 'cast_targets': return (ctx.targets || [ctx.tgt]).filter(Boolean);
      default: return [ctx.tgt]; } };
    return pick(ef.target || 'target').filter(Boolean);
  }
  /* ---------- primitives every effect uses (each one produces formal events) ---------- */
  changeRes(u, res, delta, info = {}) {
    if (!(res in u.res) || !delta) return null; const old = u.res[res], max = u.max[res] ?? Infinity, min = DEF.resources[res] ? DEF.resources[res].min : 0;
    const nv = clamp(old + delta, min, max); if (nv === old && !info.force) return null;
    const e = this.emit(EVT.RESOURCE_CHANGE, { src: info.src || u, tgts: [u], payload: { res, old, change: nv - old, new: nv, why: info.why || null }, tags: info.tags || [] }, ev => { u.res[res] = ev.payload.new; });
    if (!e.cancelled) { if (u.res[res] === min && old !== min && res !== 'hp') this.emit(EVT.RESOURCE_EMPTY, { tgts: [u], payload: { res } }); if (u.res[res] === max && old !== max) this.emit(EVT.RESOURCE_FULL, { tgts: [u], payload: { res } }); }
    return e;
  }
  dealDamage(src, tgt, amount, info = {}) {
    if (!this.isUp(tgt)) return null; const hp0 = tgt.res.hp;
    const e = this.emit(EVT.DAMAGE, { src, tgts: [tgt], payload: { amount: Math.max(info.min ?? 1, Math.floor(amount)), base: amount, mult: info.mult ?? 1, crit: !!info.crit, el: info.el || '一般', cat: info.cat || '物', skill: info.skill || null, hitIndex: info.n ?? 0, parts: info.parts || [], kind: info.kind || 'hit' }, tags: (info.tags || []).concat(['damage']), skill: info.skill },
      ev => { const a = Math.max(0, Math.min(tgt.res.hp, Math.floor(ev.payload.amount))); ev.payload.amount = a; tgt.res.hp -= a; ev.payload.hpAfter = tgt.res.hp; ev.payload.hpBefore = hp0;
        if (src && info.skill && this.cast && src.id === (this.act && this.act.actor)) this.castTotal[this.cast] = (this.castTotal[this.cast] || 0) + a; });
    if (!e.cancelled && tgt.res.hp <= 0 && !tgt.down) this.knockDown(tgt, src, e);
    return e;
  }
  knockDown(u, src, cause) {
    const e = this.emit(EVT.DOWN, { src, tgts: [u], payload: { cause: cause ? cause.id : null } }, () => { u.down = true; u.statuses = u.statuses.filter(s => DEF.statuses[s.id].keepOnDown); });
    if (e.cancelled && u.res.hp <= 0) u.res.hp = 1; return e;
  }
  heal(src, tgt, amount, info = {}) {
    if (!this.isUp(tgt)) return null;
    return this.emit(EVT.HEAL, { src, tgts: [tgt], payload: { amount: Math.max(1, Math.floor(amount)), kind: info.kind || 'heal' }, tags: ['heal'].concat(info.tags || []) },
      ev => { const a = Math.min(tgt.max.hp - tgt.res.hp, ev.payload.amount); ev.payload.amount = a; tgt.res.hp += a; });
  }
  applyStatus(src, tgt, id, o = {}) {
    const D = DEF.statuses[id]; if (!D) return bvErr('status', id + ' missing'); if (!this.isUp(tgt) && !D.keepOnDown) return null;
    const e = this.emit(EVT.STATUS_APPLY, { src, tgts: [tgt], payload: { status: id, dur: o.dur ?? D.durDefault ?? null, delta: o.delta ?? 1, data: o.data || {}, secondary: !!o.secondary }, tags: (D.tags || []).concat(['status']) }, ev => {
      const P = ev.payload, cur = this.statusOf(tgt, id);
      if (D.group === 'major') { const m = this.majorOf(tgt); if (m && m !== id) { ev.payload.failed = 'other_major'; return; } if (m === id) { ev.payload.failed = 'already'; return; } }
      if (D.immune && D.immune(this, tgt)) { ev.payload.failed = 'immune'; return; }
      const dur = typeof P.dur === 'function' ? P.dur(this) : P.dur;
      if (!cur) { const inst = { id, stacks: D.stack === 'signed' ? clamp(P.delta, D.min ?? -9, D.max ?? 9) : Math.max(1, Math.min(D.max ?? 99, P.delta)), dur, src: src ? src.id : null, at: this.round, atAct: this.actSeq, data: P.data };
        if (D.stack === 'signed' && !inst.stacks) { ev.payload.failed = 'zero'; return; } tgt.statuses.push(inst); ev.payload.stacks = inst.stacks; ev.payload.new = true; if (D.onApply) D.onApply(this, tgt, inst); return; }
      const before = cur.stacks;
      if (D.stack === 'signed') { const nv = clamp(cur.stacks + P.delta, D.min ?? -9, D.max ?? 9); if (nv === cur.stacks) { ev.payload.capped = true; cur.dur = Math.max(cur.dur || 0, dur || 0); } else { cur.stacks = nv; cur.dur = dur; } if (!cur.stacks) { this.dropStatus(tgt, cur); ev.payload.cleared = true; } }
      else if (D.stack === 'add') { cur.stacks = Math.min(D.max ?? 99, cur.stacks + P.delta); if (D.refresh !== false) cur.dur = Math.max(cur.dur || 0, dur || 0); }
      else if (D.stack === 'max') { cur.stacks = Math.max(cur.stacks, P.delta); cur.dur = Math.max(cur.dur || 0, dur || 0); }
      else if (D.stack === 'refresh') { cur.dur = Math.max(cur.dur || 0, dur || 0); Object.assign(cur.data, P.data); }
      else { ev.payload.failed = 'already'; return; }
      cur.at = this.round; cur.atAct = this.actSeq; ev.payload.stacks = cur.stacks; ev.payload.before = before; ev.payload.refreshed = true;
    });
    if (e.payload.failed && !e.cancelled) this.emit(EVT.STATUS_FAIL, { src, tgts: [tgt], payload: { status: id, why: e.payload.failed, secondary: !!o.secondary } });
    else if (!e.cancelled && e.payload.before != null && e.payload.before !== e.payload.stacks) this.emit(EVT.STATUS_STACK, { src, tgts: [tgt], payload: { status: id, old: e.payload.before, new: e.payload.stacks } });
    return e;
  }
  dropStatus(u, inst) { const i = u.statuses.indexOf(inst); if (i >= 0) u.statuses.splice(i, 1); }
  removeStatus(u, id, why = 'remove', src = null) {
    const inst = this.statusOf(u, id); if (!inst) return null; if (u.hero && DEF.statuses[id].group === 'major' && why !== 'expire') this.data.cured = true;
    return this.emit(why === 'expire' ? EVT.STATUS_EXPIRE : EVT.STATUS_REMOVE, { src, tgts: [u], payload: { status: id, why, stacks: inst.stacks }, tags: DEF.statuses[id].tags || [] }, () => { this.dropStatus(u, inst); if (DEF.statuses[id].onRemove) DEF.statuses[id].onRemove(this, u, inst, why); });
  }
  /* ---------- end of the round: ROUND_END triggers (damage over time, regeneration, mechanics), then durations tick ---------- */
  roundEnd() {
    this.emit(EVT.ROUND_END, { payload: { round: this.round } });
    for (const u of this.units) { if (u.down || u.fled) continue;
      for (const s of u.statuses.slice()) { const D = DEF.statuses[s.id]; if (s.dur == null || D.tick !== 'round_end') continue;
        if (D.holdIfUnused && s.at === this.round && !this.opposingActedSince(u, s.atAct)) continue;
        if (D.skipApplyRound && s.at === this.round) continue;
        s.dur--; if (s.dur <= 0) this.removeStatus(u, s.id, 'expire'); }
      for (const s of u.statuses.slice()) if (DEF.statuses[s.id].clearAtRoundEnd) this.removeStatus(u, s.id, 'expire'); }
    this.roundDone = true;
  }
  opposingActedSince(u, actSeq) { return this.log.some(e => e.type === EVT.ACTION_START && e.action > actSeq && e.src && this.byId[e.src].side !== u.side); }
  finish(outcome) {
    if (this.result) return this.result;
    this.queue = []; this.reactQ = []; this.need = null; // actions that never got their turn are dropped with the battle
    this.emit(EVT.BATTLE_END, { payload: { outcome, round: this.round } });
    this.result = { outcome, rounds: this.round, units: this.units.map(u => ({ id: u.id, sp: u.sp, side: u.side, down: u.down, fled: u.fled, hp: u.res.hp, mp: u.res.mp, kind: u.kind, lv: u.lv, status: this.majorOf(u), sleepLeft: (this.statusOf(u, 'slp') || {}).dur })), trace: this.trace };
    return this.result;
  }
  // a reaction (counter, …) is a formal action resolved right after the current one (spec 54)
  react(u, cmd) { const depth = (this.act && this.act.reaction ? this.act.depth || 1 : 0) + 1; if (depth > BV2.MAX_REACT) { this.safety('reaction depth', 'REACTION'); return; }
    this.emit(EVT.REACTION, { src: u, tgts: (cmd.targets || []).map(id => this.byId[id]), payload: { skill: cmd.skill, why: cmd.why || null } });
    this.reactQ.push({ ...cmd, actor: u.id, type: 'skill', reaction: true, depth, meta: { ...(cmd.meta || {}), reaction: 1 } }); }
  // a deterministic fingerprint of the event sequence (spec 67 / 77)
  hash() { let h = 2166136261; for (const e of this.log) { const s = e.type + '|' + e.src + '|' + e.tgts.join(',') + '|' + JSON.stringify(e.payload.amount ?? e.payload.status ?? e.payload.skill ?? ''); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } } return h >>> 0; }
}
