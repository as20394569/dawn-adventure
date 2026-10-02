/* ===================== v12 戰鬥核心 — 執行層：BattleCore（規格 v1.1：狀態機、行動順序、冷卻、事件／觸發／效果） =====================
   Synchronous and headless. v12.0.1: every round starts with everyone choosing (TURN_ORDER: the monsters' AI, then the hero —
   core.need), then the order is built from the choices (防禦・道具・逃跑 first, 搶先 skills next) and speed, and the actions run
   in that order (WAITING_ACTION). run() advances until the hero must choose (core.need) or the battle ends (core.result).
   (Before: a unit chose when its turn came and 搶先 moved it to the front of the NEXT round, so after the order changed a monster
   could act twice between two of the hero's commands — 玩家：「好像有時候怪物會多打一次」.)
   Everything that happens is an event in core.log (in MAIN order); the view plays the log back. */
const BS = { INIT: 'INITIALIZING', BATTLE_START: 'BATTLE_START', ROUND_START: 'ROUND_START', TURN_ORDER: 'TURN_ORDER', WAITING_ACTION: 'WAITING_ACTION',
  ACTION_PREPARE: 'ACTION_PREPARE', ACTION_EXECUTION: 'ACTION_EXECUTION', EVENT_RESOLUTION: 'EVENT_RESOLUTION', REACTION_RESOLUTION: 'REACTION_RESOLUTION',
  ACTION_END: 'ACTION_END', ROUND_END: 'ROUND_END', VICTORY_CHECK: 'VICTORY_CHECK', BATTLE_END: 'BATTLE_END' };
const BS_NEXT = {
  INITIALIZING: ['BATTLE_START'], BATTLE_START: ['ROUND_START', 'VICTORY_CHECK'], ROUND_START: ['TURN_ORDER', 'VICTORY_CHECK'],
  TURN_ORDER: ['WAITING_ACTION', 'ROUND_END'], WAITING_ACTION: ['ACTION_PREPARE', 'ROUND_END'], ACTION_PREPARE: ['ACTION_EXECUTION', 'ACTION_END'],
  ACTION_EXECUTION: ['EVENT_RESOLUTION'], EVENT_RESOLUTION: ['ACTION_END', 'REACTION_RESOLUTION'], REACTION_RESOLUTION: ['ACTION_PREPARE'],
  ACTION_END: ['REACTION_RESOLUTION', 'WAITING_ACTION', 'ROUND_END', 'VICTORY_CHECK'], ROUND_END: ['VICTORY_CHECK'],
  VICTORY_CHECK: ['BATTLE_END', 'ROUND_START', 'WAITING_ACTION', 'ROUND_END', 'REACTION_RESOLUTION'], BATTLE_END: [],
};
// status timing points (spec v1.1 §2.4): when a duration counts down / when a status is cleared
const BV_TICKS = ['round_start', 'owner_action_start', 'owner_action_end', 'round_end'];
// alternative cost payers (talents: 血劍 pays missing 劍意 with HP, 風舞 pays with 連段…): name → (core, u, sk, c, need) → paid or null
const BV_ALT_COST = {};

class BattleCore {
  constructor(o) {
    this.seed = o.seed >>> 0; this.rng = makeRng(this.seed); this.env = o.env || {}; this.cfg = o.cfg || {}; this.flags = o.flags || {};
    this.units = []; this.byId = {}; this.state = BS.INIT; this.round = 0; this.seq = 0; this.log = []; this.evStack = [];
    this.actSeq = 0; this.castSeq = 0; this.hitSeq = 0; this.order = []; this.orderPos = {}; this.roundActs = []; this.reactQ = []; this.need = null; this.pend = null; this.cur = null; this.result = null; this.plan = {}; this.planned = false;
    this.act = null; this.cast = null; this.hit = null; this.evAction = 0; this.trigAction = 0; this.trigRound = 0; this.trigBattle = 0; this.usage = {}; this.roundDone = false;
    this.envMods = (o.envMods || []).slice(); this.envTrigs = (o.envTrigs || []).slice(); this.escTries = 0; this.castTotal = {}; this.data = {}; this.effs = {}; this.stSeq = 0;
    this.trace = []; // safety stops (spec §8): the full chain is kept here
    for (const s of o.units) this.addUnit(s, true);
  }
  get queue() { return this.order; } // tools and old callers
  /* ---------- units ---------- */
  addUnit(s, initial) {
    const u = { id: s.id, side: s.side, name: s.name, hero: !!s.hero, kind: s.kind || (s.hero ? 'hero' : 'wild'), sp: s.sp || null, fam: s.fam || null, lv: s.lv || 1, cls: s.cls || null,
      rare: !!s.rare, boss: s.kind === 'boss', elite: s.kind === 'elite', minion: s.kind === 'minion', stats: { ...s.stats }, attr: s.attr || null, immune: (s.immune || []).slice(),
      res: {}, max: {}, statuses: [], passives: s.passives || [], skills: s.skills || [], ai: s.ai || null, tags: s.tags || [], mods: [], trigs: [], cd: {},
      acted: 0, actedTotal: 0, down: false, fled: false, slot: s.slot ?? 0, data: { ...(s.data || {}) }, ref: s.ref || null, idx: this.units.length };
    for (const r in DEF.resources) { const R = DEF.resources[r]; if (R.appliesTo && !R.appliesTo(u, s)) continue; u.max[r] = R.maxOf ? R.maxOf(u, s) : R.max ?? 0; u.res[r] = R.initOf ? R.initOf(u, s) : (R.init ?? 0); }
    if (s.res) Object.assign(u.res, s.res); if (s.max) Object.assign(u.max, s.max);
    this.units.push(u); this.byId[u.id] = u; this.compile(u);
    for (const r in u.max) if (u.data.rules && u.data.rules['max_' + r]) u.max[r] += u.data.rules['max_' + r]; // talents / traits that raise a resource cap (共鳴, 氣海…)
    for (const st of s.statuses || []) u.statuses.push({ id: st.id, stacks: st.stacks || 1, dur: st.dur ?? null, src: null, at: 0, atAct: 0, seq: ++this.stSeq, data: st.data || {} });
    if (!initial) this.emit(EVT.SUMMON, { src: u, tgts: [u], payload: { sp: u.sp } });
    return u;
  }
  // an effect inside a per-battle trigger gets an id too (unit + trigger + index); the effect itself is looked up through eff()
  effId(id, ef) { if (typeof ef === 'string') return ef; this.effs[id] = { ...ef, id }; return id; }
  eff(x) { return typeof x === 'string' ? (this.effs[x] || DEF.effects[x] || null) : x; }
  compile(u) { // passives, talents, mechanics (data) → modifiers + triggers + rules on the unit
    u.mods = []; u.trigs = []; const rules = u.data.rules = {};
    const add = (made, key, layer) => {
      if (!made) return;
      for (const m of made.mods || []) u.mods.push({ ...m, key });
      for (const t of made.triggers || []) { const uid = key + '#' + u.trigs.length;
        u.trigs.push({ ...t, key, uid, cseq: u.idx * 1000 + u.trigs.length, layer: t.layer || (t.system ? 'system' : t.reaction ? 'reaction' : layer), effects: (t.effects || []).map((ef, i) => this.effId(u.id + ':' + uid + 'e' + i, ef)) }); }
      for (const k in made.rules || {}) { const v = made.rules[k]; rules[k] = typeof v === 'number' && typeof rules[k] === 'number' ? rules[k] + v : v; }
      if (made.immune) u.immune.push(...made.immune);
    };
    for (const p of u.passives) { const D = DEF.passives[p.key]; if (!D || !D.enabled) continue; add(D.make ? D.make(p.v, u) : D, p.key, p.src || D.layer || (u.hero ? 'equip' : 'other')); }
    for (const id of u.data.talents || []) { const T = DEF.talents[id]; if (!T || !T.enabled) { bvErr('core', 'talent ' + id + ' missing'); continue; } add(T.make ? T.make(u) : T, 'talent:' + id, 'talent'); }
    for (const mid of (u.data.mechanics || [])) { const M = DEF.mechanics[mid]; if (!M) { bvErr('core', 'mechanic ' + mid + ' missing'); continue; } add(M.make ? M.make(u, this) : M, mid, M.layer || (u.hero ? 'class' : 'other')); }
  }
  rule(u, k) { return (u && u.data.rules && u.data.rules[k]) || 0; }
  side(s) { return this.units.filter(u => u.side === s); }
  alive(s) { return this.units.filter(u => u.side === s && !u.down && !u.fled); }
  foesOf(u) { return this.alive(u.side === 'A' ? 'B' : 'A'); }
  alliesOf(u) { return this.alive(u.side); }
  isUp(u) { return !!u && !u.down && !u.fled; }
  statusOf(u, id) { return u.statuses.find(s => s.id === id) || null; }
  hasStatus(u, id) { return !!this.statusOf(u, id); }
  majorOf(u) { const s = u.statuses.find(x => DEF.statuses[x.id].group === 'major'); return s ? s.id : null; }
  /* ---------- state machine (spec §9) ---------- */
  go(next) {
    if (!BS_NEXT[this.state].includes(next)) { const m = bvErr('state', 'illegal transition ' + this.state + ' → ' + next); if (BV2.DEV) throw new Error(m); }
    this.state = next;
  }
  run() {
    let guard = 0;
    while (!this.result && guard++ < 20000) {
      switch (this.state) {
        case BS.INIT: this.go(BS.BATTLE_START); break;
        case BS.BATTLE_START: this.emit(EVT.BATTLE_START, { payload: { units: this.units.map(u => u.id) } }); this.go(this.ended() ? BS.VICTORY_CHECK : BS.ROUND_START); break;
        case BS.ROUND_START: {
          this.round++; this.trigRound = 0; this.roundDone = false; this.roundActs = [];
          for (const u of this.units) { u.acted = 0; u.data.hurtThisRound = 0; }
          this.emit(EVT.ROUND_START, { payload: { round: this.round } });
          for (const u of this.units) if (this.isUp(u)) this.tick(u, 'round_start');
          this.go(this.ended() ? BS.VICTORY_CHECK : BS.TURN_ORDER); break; }
        case BS.TURN_ORDER: {
          if (!this.planned) { const need = this.planRound(); if (need) return need; }
          this.planned = false; this.buildOrder(); this.go(this.order.length ? BS.WAITING_ACTION : BS.ROUND_END); break; }
        case BS.WAITING_ACTION: {
          let ent = null; while (this.order.length) { const e = this.order.shift(); if (this.isUp(this.byId[e.id])) { ent = e; break; } }
          if (!ent) { this.go(BS.ROUND_END); break; }
          const u = this.byId[ent.id], forced = this.forcedCommand(u);
          if (forced) { this.cur = forced; this.go(BS.ACTION_PREPARE); break; }
          if (ent.extra && !u.hero) { this.cur = { actor: u.id, type: 'ai_extra', targets: [], meta: { extra: ent.extra } }; this.go(BS.ACTION_PREPARE); break; }
          const planned = !ent.extra && this.plan[u.id]; if (planned) delete this.plan[u.id];
          if (planned) { this.cur = this.validCmd(u, planned); if (u.hero) { this.go(BS.ACTION_PREPARE); break; } } // the hero's choice was recorded at submit
          else if (u.hero && !this.auto) { this.pend = ent; this.need = { unit: u, round: this.round, extra: ent.extra || null }; return this.need; } // an extra action (疾行) is chosen when it comes
          else this.cur = this.validCmd(u, BAI.decide(this, u));
          if (ent.extra) this.cur.meta.extra = ent.extra;
          if (u.hero) this.data.lastHeroAct = this.cur.type === 'skill' ? this.cur.skill : this.cur.type;
          this.go(BS.ACTION_PREPARE); break; }
        case BS.ACTION_PREPARE: {
          const cmd = this.cur; this.act = cmd; this.evAction = 0; this.trigAction = 0;
          if (this.prepare(cmd)) this.go(BS.ACTION_EXECUTION); else { this.go(BS.ACTION_END); this.endAction(cmd, false); } break; }
        case BS.ACTION_EXECUTION: this.execute(this.act); this.go(BS.EVENT_RESOLUTION); break;
        case BS.EVENT_RESOLUTION: this.go(BS.ACTION_END); this.endAction(this.act, true); break; // every event of the action resolved inside emit()
        case BS.REACTION_RESOLUTION: this.cur = this.reactQ.shift(); this.go(BS.ACTION_PREPARE); break;
        case BS.ACTION_END: break; // handled in endAction
        case BS.ROUND_END: this.roundEnd(); this.go(BS.VICTORY_CHECK); break;
        case BS.VICTORY_CHECK: {
          const end = this.ended(); if (end) { this.go(BS.BATTLE_END); this.finish(end); break; }
          if (this.reactQ.length) { this.go(BS.REACTION_RESOLUTION); break; }
          if (this.roundDone) { this.go(BS.ROUND_START); break; }
          this.go(this.order.length ? BS.WAITING_ACTION : BS.ROUND_END); break; }
        case BS.BATTLE_END: return this.result;
      }
    }
    if (!this.result && guard >= 20000) { bvErr('run', 'state machine guard hit'); this.finish('draw'); }
    return this.result;
  }
  start(auto) { this.auto = !!auto; return this.run(); }
  submit(cmd) {
    if (!this.need) return bvErr('submit', 'no input pending'); const u = this.need.unit;
    if (this.need.plan) { this.plan[u.id] = this.validCmd(u, { ...cmd, actor: u.id }); this.data.lastHeroAct = cmd.type === 'skill' ? cmd.skill : cmd.type; this.need = null; return this.run(); }
    this.cur = this.validCmd(u, { ...cmd, actor: u.id }); if (this.pend && this.pend.extra) this.cur.meta.extra = this.pend.extra;
    this.data.lastHeroAct = cmd.type === 'skill' ? cmd.skill : cmd.type; this.need = null; this.pend = null; this.go(BS.ACTION_PREPARE); return this.run();
  }
  endAction(cmd, executed) {
    const u = this.byId[cmd.actor], own = u && !cmd.reaction;
    if (u && own) { if (executed) { u.acted++; u.actedTotal++; } this.tickCooldowns(u, cmd.cdSet); if (executed) { u.data.prevAct = u.data.lastAct || null; u.data.lastAct = cmd.type === 'skill' ? (DEF.skills[cmd.skill] && DEF.skills[cmd.skill].tags.includes('basic') ? 'attack' : 'skill') : cmd.type; } }
    this.emit(EVT.ACTION_END, { src: u, payload: { type: cmd.type, skill: cmd.skill, executed, reaction: !!cmd.reaction } });
    if (u && own && this.isUp(u)) this.tick(u, 'owner_action_end');
    this.act = null;
    if (this.ended()) { this.go(BS.VICTORY_CHECK); return; }
    if (this.reactQ.length) { this.go(BS.REACTION_RESOLUTION); return; }
    this.go(this.order.some(e => this.isUp(this.byId[e.id])) ? BS.WAITING_ACTION : BS.ROUND_END);
  }
  ended() {
    if (this.escaped) return 'run'; const A = this.alive('A'), B = this.alive('B');
    if (!A.length) return 'lose'; if (!B.length) return this.units.some(u => u.side === 'B' && u.down) ? 'win' : 'foe_fled';
    if (this.cfg.maxRounds && this.round >= this.cfg.maxRounds && this.roundDone) return 'draw'; // tests: a battle that can't end
    return null;
  }
  /* ---------- v12.0.1: everyone chooses at the start of the round (monsters' AI first, then the hero via core.need) ---------- */
  planRound() {
    this.plan = {}; this.planned = true; let hero = null;
    for (const u of this.units) { if (!this.isUp(u) || this.forcedCommand(u)) continue; if (u.hero && !this.auto) { hero = u; continue; } this.plan[u.id] = this.validCmd(u, BAI.decide(this, u)); if (u.hero) this.data.lastHeroAct = this.plan[u.id].type === 'skill' ? this.plan[u.id].skill : this.plan[u.id].type; }
    if (hero) { this.need = { unit: hero, round: this.round, plan: 1 }; return this.need; }
    return null;
  }
  // how far a chosen command moves its unit forward: the hero's 防禦・道具・逃跑 always go first, then 搶先 skills
  planPrio(u) { const p = this.plan[u.id]; if (!p) return 0; if (u.hero && (p.type === 'defend' || p.type === 'item' || p.type === 'run')) return 20;
    const sk = p.type === 'skill' && DEF.skills[p.skill]; return sk && (sk.prio || u.mods.some(m => m.prioSkill === sk.id)) ? 10 : 0; }
  // the order this round would have from what is known now (the hero's command menu shows it; no random roll is used)
  previewOrder() { const ups = this.units.filter(u => this.isUp(u)), sp = {}; for (const u of ups) sp[u.id] = BR.speed(this, u);
    const front = u => this.planPrio(u) + (this.hasStatus(u, 'first_next') ? 10 : 0) + ((this.round || 1) === 1 && u.mods.some(m => m.firstRoundPrio) ? 5 : 0) - (this.hasStatus(u, 'delay') ? 10 : 0);
    return ups.sort((a, b) => front(b) - front(a) || sp[b.id] - sp[a.id] || (a.hero ? -1 : b.hero ? 1 : a.id < b.id ? -1 : 1)).map(u => u.id); }
  /* ---------- TURN_ORDER (spec §2.1): 防禦・道具・逃跑 → 搶先 (this round) → speed, a fixed roll per round, the stable id; 延後 last ---------- */
  buildOrder() {
    const roll = {}, ups = this.units.filter(u => this.isUp(u)); for (const u of ups) roll[u.id] = this.rng.next();
    const front = u => this.planPrio(u) + (this.hasStatus(u, 'first_next') ? 10 : 0) + (this.round === 1 && u.mods.some(m => m.firstRoundPrio) ? 5 : 0) - (this.hasStatus(u, 'delay') ? 10 : 0);
    const sp = {}; for (const u of ups) sp[u.id] = BR.speed(this, u);
    ups.sort((a, b) => front(b) - front(a) || sp[b.id] - sp[a.id] || roll[a.id] - roll[b.id] || (a.id < b.id ? -1 : 1));
    const order = ups.map(u => ({ id: u.id }));
    // 狂怒 etc.: one more action at the end of the order every N rounds (data: status.extraEvery)
    for (const u of ups) for (const s of u.statuses) { const D = DEF.statuses[s.id]; if (D.extraEvery && this.round % D.extraEvery === 0) order.push({ id: u.id, extra: s.id }); }
    this.order = order; this.orderPos = {}; order.forEach((e, i) => { if (this.orderPos[e.id] == null) this.orderPos[e.id] = i; });
    this.emit(EVT.TURN_ORDER, { payload: { round: this.round, order: order.map(e => e.id), extra: order.filter(e => e.extra).map(e => e.id) } });
    for (const u of ups) for (const k of ['first_next', 'delay', 'prio_used']) if (this.hasStatus(u, k)) this.removeStatus(u, k, 'used');
  }
  // the hero / a foe acts before every living foe / hero this round
  wentFirst(u) { const me = this.orderPos[u.id]; if (me == null) return false; return this.units.filter(x => x.side !== u.side && this.isUp(x)).every(x => (this.orderPos[x.id] ?? 99) > me); }
  /* ---------- commands ---------- */
  forcedCommand(u) {
    const ch = this.statusOf(u, 'charging'); if (ch) return { action_id: 0, actor: u.id, type: 'skill', skill: ch.data.skill, targets: ch.data.targets || [], meta: { release: 1 } };
    return null;
  }
  validCmd(u, c) {
    const cmd = { action_id: 0, actor: u.id, type: c.type || 'skill', skill: c.skill || null, item: c.item || null, targets: c.targets || [], meta: { ...(c.meta || {}) } };
    if (cmd.type === 'skill' && (!cmd.skill || !DEF.skills[cmd.skill])) { bvErr('cmd', 'unknown skill ' + cmd.skill); cmd.skill = u.hero ? (u.data.attackSkill || 'attack') : (u.skills[0] || 'm_tackle'); }
    return cmd;
  }
  /* ---------- cooldowns: counted in the owner's own actions, −1 at the end of each of them (the skill just used is skipped) ---------- */
  cooldownOf(u, sk) { if (sk.cooldown == null || sk.cooldown < 0) return 0; let n = sk.cooldown; for (const m of u.mods) if (m.cdAdd && condOk(m.cond, { core: this, owner: u, src: u, skill: sk })) n += m.cdAdd; return Math.max(0, n); }
  onCooldown(u, id) { return (u.cd[id] || 0) > 0; }
  tickCooldowns(u, skip) { for (const id in u.cd) { if (id === skip || !u.cd[id]) continue; u.cd[id]--; if (!u.cd[id]) { delete u.cd[id]; this.emit(EVT.COOLDOWN, { src: u, tgts: [u], payload: { skill: id, left: 0, why: 'tick' } }); } } }
  // how: a skill id | 'longest' | 'all' | 'random'; n = how many actions
  cutCooldown(u, how, n = 1, why = null) {
    const ids = Object.keys(u.cd).filter(k => u.cd[k] > 0); if (!ids.length) return null;
    const pick = how === 'all' ? ids : how === 'longest' ? [ids.sort((a, b) => u.cd[b] - u.cd[a] || (a < b ? -1 : 1))[0]] : how === 'random' ? [this.rng.pick(ids)] : ids.filter(k => k === how);
    let last = null; for (const id of pick) { const old = u.cd[id]; last = this.emit(EVT.COOLDOWN, { src: u, tgts: [u], payload: { skill: id, old, left: Math.max(0, old - n), why } }, e => { u.cd[id] = e.payload.left; if (!u.cd[id]) delete u.cd[id]; }); }
    return last;
  }
  /* ---------- one action (spec §7): start → pre triggers → legality → cost → cast → targets → hits → effects → triggers → down → end ---------- */
  prepare(cmd) {
    const u = this.byId[cmd.actor]; cmd.action_id = ++this.actSeq; this.cast = null; this.hit = null;
    if (!this.isUp(u)) return false;
    if (!cmd.reaction) { this.roundActs.push(u.id); this.tick(u, 'owner_action_start'); if (!this.isUp(u)) return false; }
    if (cmd.type === 'ai_extra') { const c2 = this.validCmd(u, BAI.decide(this, u, { extra: 1 })); Object.assign(cmd, c2, { action_id: cmd.action_id, meta: { ...c2.meta, extra: cmd.meta.extra || 1 } }); }
    if (cmd.meta.extra) this.emit(EVT.EXTRA_ACTION, { src: u, tgts: [u], payload: { why: cmd.meta.extra } });
    const e = this.emit(EVT.ACTION_START, { src: u, payload: { type: cmd.type, skill: cmd.skill, item: cmd.item, reaction: !!cmd.reaction } });
    if (e.cancelled || !this.isUp(u)) { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why: e.payload.why || 'cancel' } }); return false; }
    // can the unit act? (data: statuses with blockAction)
    if (!cmd.reaction) for (const s of u.statuses.slice()) { const D = DEF.statuses[s.id]; if (!D.blockAction) continue;
      const why = D.blockAction(this, u, s, cmd); if (why) { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why, status: s.id } }); return false; } }
    if (cmd.type === 'item' && this.hasStatus(u, 'airborne')) { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why: 'airborne_item' } }); return false; }
    if (cmd.type === 'skill') return this.prepareSkill(u, cmd);
    return true;
  }
  skillBlock(u, sk, cmd = {}) { // why the skill can't be used now (null = it can)
    const rel = cmd.meta && cmd.meta.release;
    if (sk.usage && sk.usage.perBattle && (this.data['skill|' + u.id + '|' + sk.id] || 0) >= sk.usage.perBattle) return 'used';
    if (!rel && this.onCooldown(u, sk.id)) return 'cooldown';
    if (!rel && sk.requires && !condOk(sk.requires, { core: this, owner: u, src: u, skill: sk })) return 'requires';
    if (!rel) for (const c of sk.costs || []) if (this.payable(u, sk, c) == null) return 'cost:' + c.res;
    return null;
  }
  // what one cost would take now: a number, or null when it can't be paid. `all` costs take the whole resource (at least c.min);
  // unit modifiers may fix the amount (costAllFix: 無想 pays 3, counts 5) or waive it (costAllFree: 交響, 不壞); c.alt names other payers.
  allFix(u, sk, c) { const ctx = { core: this, owner: u, src: u, skill: sk }; const m = u.mods.find(m => m.costAllFix && m.costAllFix.res === c.res && condOk(m.cond, ctx)); return m ? m.costAllFix : null; }
  allFree(u, sk, c) { const ctx = { core: this, owner: u, src: u, skill: sk }; return u.mods.some(m => m.costAllFree === c.res && condOk(m.cond, ctx)); }
  payable(u, sk, c) {
    if (c.all) { const have = u.res[c.res] || 0, fix = this.allFix(u, sk, c), min = fix ? fix.pay : this.costMin(u, sk, c);
      if (have >= min) return this.allFree(u, sk, c) ? 0 : fix ? fix.pay : have;
      for (const a of [].concat(c.alt || [])) { const A = BV_ALT_COST[a]; if (A && A(this, u, sk, c, min, true) != null) return min; } return null; }
    const a = this.costOf(u, sk, c); return (u.res[c.res] || 0) >= a ? a : null;
  }
  costMin(u, sk, c) { let m = c.min ?? 1; for (const md of u.mods) if (md.costMinSet != null && (!md.res || md.res === c.res) && condOk(md.cond, { core: this, owner: u, src: u, skill: sk })) m = Math.min(m, md.costMinSet); return m; }
  prepareSkill(u, cmd) {
    let sk = DEF.skills[cmd.skill]; const rel = cmd.meta && cmd.meta.release; this.emit(EVT.SKILL_SELECT, { src: u, payload: { skill: sk.id } });
    const why = this.skillBlock(u, sk, cmd);
    if (why) { this.emit(EVT.SKILL_FAIL, { src: u, payload: { skill: sk.id, why: why.split(':')[0], res: why.split(':')[1] || null } });
      const fb = sk.fallback && (u.hero ? u.data.attackSkill || sk.fallback : sk.fallback); if (!fb || fb === sk.id || !DEF.skills[fb]) return false; cmd.skill = fb; cmd.fell = sk.id; sk = DEF.skills[fb]; }
    if (sk.usage && sk.usage.perBattle && !rel) { const k = 'skill|' + u.id + '|' + sk.id; this.data[k] = (this.data[k] || 0) + 1; }
    if (!this.target(u, sk, cmd)) return false;
    if (sk.onPrepare) sk.onPrepare(this, u, cmd);
    if (!rel) {
      for (const c of sk.costs || []) {
        if (c.all) {
          const have = u.res[c.res] || 0, fix = this.allFix(u, sk, c), min = fix ? fix.pay : this.costMin(u, sk, c);
          if (have < min) { let got = null; for (const a of [].concat(c.alt || [])) { const A = BV_ALT_COST[a]; if (A) got = A(this, u, sk, c, min, false); if (got != null) { cmd.alt = a; break; } } cmd.spent = got || 0; cmd.spentRes = c.res; continue; }
          const pay = this.allFree(u, sk, c) ? 0 : fix ? fix.pay : have, spent = fix ? fix.as : have;
          const pe = pay > 0 ? this.emit(EVT.COST_PAY, { src: u, tgts: [u], payload: { skill: sk.id, res: c.res, amount: pay, all: 1 } }, e2 => { if (e2.payload.amount > 0) this.changeRes(u, c.res, -e2.payload.amount, { why: 'cost' }); }) : null;
          cmd.spent = pe && pe.cancelled ? 0 : spent; cmd.spentRes = c.res; continue;
        }
        const amt = this.payable(u, sk, c); if (amt == null) continue;
        this.emit(EVT.COST_PAY, { src: u, tgts: [u], payload: { skill: sk.id, res: c.res, amount: amt } }, e2 => { if (e2.payload.amount > 0) this.changeRes(u, c.res, -e2.payload.amount, { why: 'cost' }); });
      }
      const cd = this.cooldownOf(u, sk); if (cd > 0) { u.cd[sk.id] = cd; cmd.cdSet = sk.id; this.emit(EVT.COOLDOWN, { src: u, tgts: [u], payload: { skill: sk.id, left: cd, set: 1 } }); }
    }
    return true;
  }
  target(u, sk, cmd) {
    const tg = this.resolveTargets(u, sk, cmd.targets, cmd); if (!tg.length && sk.target !== 'none') { this.emit(EVT.ACTION_CANCEL, { src: u, payload: { why: 'no_target' } }); return false; }
    if (cmd.targets.length && tg[0] && cmd.targets[0] !== tg[0].id && ['enemy', 'ally'].includes(sk.target)) this.emit(EVT.TARGET_CHANGE, { src: u, tgts: tg, payload: { from: cmd.targets[0] } });
    cmd.tg = tg.map(t => t.id);
    if (tg[0] && tg[0].side !== u.side && sk.power) { u.data.prevTarget = u.data.lastTarget || null; u.data.lastTarget = tg[0].id; }
    return true;
  }
  costOf(u, sk, c) { if (c.all) { const p = this.payable(u, sk, c); const f = this.allFix(u, sk, c); return p == null ? (f ? f.pay : this.costMin(u, sk, c)) : p; }
    let a = c.amount; for (const m of u.mods) if (m.costMul != null && condOk(m.cond, { core: this, owner: u, src: u, skill: sk }) && (!m.res || m.res === c.res)) a = Math.round(a * m.costMul); return Math.max(0, a); }
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
  resolveTargets(u, sk, ids, cmd = {}) {
    const foes = this.foesOf(u), allies = this.alliesOf(u), pickAlive = (pool) => { const want = ids && ids[0] && this.byId[ids[0]]; if (want && pool.includes(want)) return [want]; return pool.length ? [pool[0]] : []; };
    const rule = sk.targetOf ? sk.targetOf(this, u, cmd) || sk.target : sk.target;
    switch (rule) {
      case 'enemy': { const pool = foes.filter(f => sk.hitsAirborne || !this.hasStatus(f, 'airborne')); return pickAlive(pool.length ? pool : foes); }
      case 'all_enemies': return foes;
      case 'random_enemy': return foes.length ? [this.rng.pick(foes)] : [];
      case 'self': return [u];
      case 'ally': return pickAlive(allies);
      case 'all_allies': return allies;
      default: return [];
    }
  }
  /* the skill: cast → per target, per hit: hit roll → effects → triggers → down check */
  doSkill(u, sk, tg, cmd) {
    const meta = cmd.meta || {};
    // two-step skills: the first use only starts charging / jumps (data: sk.charge)
    if (sk.charge && !meta.release && !(sk.chargeSkip && sk.chargeSkip(this, u))) {
      return this.emit(EVT.CHARGE, { src: u, tgts: tg, payload: { skill: sk.id }, tags: ['charge'] }, () => {
        this.applyStatus(u, u, 'charging', { data: { skill: sk.id, targets: tg.map(t => t.id) } }); if (sk.airborne) this.applyStatus(u, u, 'airborne', {}); });
    }
    if (meta.release) { this.removeStatus(u, 'charging', 'release'); this.removeStatus(u, 'airborne', 'release'); }
    const cast = ++this.castSeq; this.cast = cast; this.castTotal[cast] = 0;
    const base = { owner: u, src: u, skill: sk, cast, targets: tg, spent: cmd.spent || 0, cmd, release: !!meta.release, powMul: meta.powMul || 1 };
    const use = this.emit(EVT.SKILL_USE, { src: u, tgts: tg, payload: { skill: sk.id, cast, spent: cmd.spent || 0, follow: !!meta.follow, release: !!meta.release }, tags: sk.tags, skill: sk.id }, () => {
      if (sk.target === 'self' || sk.target === 'none' || sk.noHitRoll) { this.exec(sk.effects, { ...base, tgt: tg[0] || u, n: 0 }); return; }
      const multi = tg.length > 1; let hits = sk.hitsOf ? sk.hitsOf(this, u, cmd) : sk.hits ? this.rng.int(sk.hits[0], sk.hits[1]) : 1;
      for (const m of u.mods) if (m.hitsAdd && condOk(m.cond, { core: this, owner: u, src: u, skill: sk })) hits += m.hitsAdd;
      tg.forEach((t, ti) => {
        let landed = 0; const scale = multi ? (sk.chain ? (ti === 0 ? 1 : BR.CHAIN_MUL) : BR.AOE_MUL) : 1;
        for (let h = 0; h < hits; h++) {
          if (!this.isUp(t) || !this.isUp(u)) break;
          this.hit = ++this.hitSeq;
          const air = !multi && this.hasStatus(t, 'airborne') && t.side !== u.side && !sk.hitsAirborne; // in the air: single-target attacks miss
          const hc = air ? 0 : BR.hitChance(this, u, t, sk);
          if (!this.rng.chance(hc)) { this.emit(EVT.MISS, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: h, air } }); continue; }
          this.emit(EVT.HIT, { src: u, tgts: [t], payload: { skill: sk.id, hitIndex: h, hits } });
          this.exec(sk.effects, { ...base, tgt: t, n: h, scale, hits }); landed++;
        }
        if (!landed && !sk.power) this.emit(EVT.SKILL_FAIL, { src: u, tgts: [t], payload: { skill: sk.id, why: 'miss' } });
      });
      if (sk.after && this.isUp(u)) this.exec(sk.after, { ...base, tgt: tg[0] || u, total: this.castTotal[cast] });
    });
    this.emit(EVT.SKILL_SUCCESS, { src: u, tgts: tg, payload: { skill: sk.id, cast, total: this.castTotal[cast], spent: cmd.spent || 0, follow: !!meta.follow }, tags: sk.tags, skill: sk.id });
    if ((sk.prio || u.mods.some(m => m.prioSkill === sk.id)) && !meta.follow && this.isUp(u)) this.applyStatus(u, u, 'prio_used', { quiet: 1 }); // 搶先 already acted first this round; the mark is for 先機 (next round's first attack +20%)
    this.hit = null; return use;
  }
  /* ---------- events ---------- */
  emit(type, o = {}, main = null) {
    if (++this.evAction > BV2.MAX_EVENTS_ACTION) { this.safety('events per action', type); return { type, cancelled: true, payload: o.payload || {} }; }
    const parent = o.parentEvt || this.evStack[this.evStack.length - 1] || null, depth = (parent ? parent.depth : 0) + (o.trig ? 1 : 0);
    const e = { id: ++this.seq, type, phase: 'PRE', src: o.src ? o.src.id : null, tgts: (o.tgts || []).filter(Boolean).map(t => t.id), direct: o.direct || (o.skill ? 'skill:' + o.skill : null),
      root: o.root || (parent ? parent.root : null) || o.direct || (o.skill ? 'skill:' + o.skill : null), parent: parent ? parent.id : null, rootEvt: parent ? parent.rootEvt : null,
      action: this.act ? this.act.action_id : null, cast: this.cast, hit: this.hit, depth, round: this.round, prio: o.prio || 0, tags: o.tags || [], flags: o.flags || [], payload: o.payload || {},
      snap: o.snap || null, resolved: false, cancelled: false };
    if (!e.rootEvt) e.rootEvt = e.id;
    if (depth > BV2.MAX_DEPTH) { this.safety('chain depth', type, e); e.cancelled = true; return e; }
    this.evStack.push(e);
    try {
      this.listen(e, 'PRE');
      if (!e.cancelled && o.recheck && !o.recheck(e)) { e.cancelled = true; e.payload.why = e.payload.why || 'recheck'; }
      if (!e.cancelled) { e.phase = 'MAIN'; this.log.push(e); if (main) main(e); e.resolved = true; e.phase = 'POST'; const te = this.listen(e, 'POST'); this.evStack.pop(); this.resolveTriggered(te, e); return e; }
      this.log.push(e);
    } finally { if (this.evStack[this.evStack.length - 1] === e) this.evStack.pop(); }
    return e;
  }
  safety(what, type, e) { const chain = this.evStack.map(x => x.type + '#' + x.id + '(' + x.depth + ')').join(' > '); this.trace.push({ what, type, chain, round: this.round }); bvErr('safety', what + ' limit at ' + type + ' :: ' + chain); }
  // find triggers that react to this event: units (passives, talents, mechanics, statuses) then the environment.
  // order (spec §6): priority (high first) → source layer → the owner's place in this round's order → creation order → stable id
  listen(e, phase) {
    const out = [], src = e.src ? this.byId[e.src] : null, tgt = e.tgts.length ? this.byId[e.tgts[0]] : null, sk = e.payload.skill ? DEF.skills[e.payload.skill] : null;
    const consider = (owner, tr, statusInst, layer, cseq) => {
      if (tr.on !== e.type || (tr.phase || 'POST') !== phase) return;
      if (owner && !tr.whenDown && (owner.down || owner.fled) && !(tr.role === 'tgt' && e.type === EVT.DOWN)) return;
      if (tr.role === 'src' && (!owner || e.src !== owner.id)) return;
      if (tr.role === 'tgt' && (!owner || !e.tgts.includes(owner.id))) return;
      if (tr.role === 'ally_src' && (!owner || !src || src.side !== owner.side)) return;
      if (tr.role === 'enemy_src' && (!owner || !src || src.side === owner.side)) return;
      if (tr.role === 'enemy_tgt' && (!owner || !tgt || tgt.side === owner.side)) return;
      if (tr.tags && !tr.tags.every(t => e.tags.includes(t) || (sk && sk.tags.includes(t)))) return;
      if (tr.notTags && tr.notTags.some(t => e.tags.includes(t) || (sk && sk.tags.includes(t)))) return;
      const ctx = { core: this, owner, src, tgt, skill: sk, ev: e, status: statusInst, spent: e.payload.spent || 0 };
      if (!condOk(tr.cond, ctx)) return;
      const key = (owner ? owner.id : 'env') + '|' + (tr.onceGroup ? 'grp:' + tr.onceGroup : (tr.uid || tr.key || tr.on)), U = this.usage[key] || (this.usage[key] = { a: 0, r: 0, b: 0, act: -1, round: -1 });
      if (U.act !== (this.act && this.act.action_id)) { U.act = this.act && this.act.action_id; U.a = 0; } if (U.round !== this.round) { U.round = this.round; U.r = 0; }
      const L = tr.onceGroup ? { perBattle: 1 } : tr.limit || {}; if ((L.perAction && U.a >= L.perAction) || (L.perRound && U.r >= L.perRound) || (L.perBattle && U.b >= L.perBattle)) return;
      if (tr.chance != null && !this.rng.chance(typeof tr.chance === 'function' ? tr.chance(ctx) : tr.chance)) return;
      U.a++; U.r++; U.b++;
      const lay = typeof layer === 'number' ? layer : LAYER[layer] || LAYER.other;
      out.push({ owner, tr, ctx, status: statusInst, key, prio: tr.prio || 0, layer: lay, ord: owner ? (this.orderPos[owner.id] ?? 50) : 99, cseq, uid: key });
    };
    for (const u of this.units) {
      for (const tr of u.trigs) consider(u, tr, null, tr.layer, tr.cseq);
      for (const s of u.statuses) (DEF.statuses[s.id].triggers || []).forEach((tr, ti) => consider(u, { ...tr, uid: 'st:' + s.id + ':' + ti }, s, tr.layer || (tr.system ? 'system' : 'status'), 500000 + s.seq * 10 + ti));
    }
    this.envTrigs.forEach((tr, i) => consider(null, { ...tr, uid: tr.uid || 'env:' + i }, null, tr.layer || 'other', 900000 + i));
    out.sort((a, b) => b.prio - a.prio || a.layer - b.layer || a.ord - b.ord || a.cseq - b.cseq || (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0));
    if (phase === 'PRE') { for (const t of out) this.runTrigger(t, e, true); return null; }
    return out;
  }
  runTrigger(t, e, pre) {
    if (++this.trigBattle > BV2.MAX_TRIG_BATTLE) { if (this.trigBattle === BV2.MAX_TRIG_BATTLE + 1) this.safety('triggers per battle', e.type); return; }
    if (!pre) { if (++this.trigAction > BV2.MAX_TRIG_ACTION || ++this.trigRound > BV2.MAX_TRIG_ROUND) { this.safety('triggers per action/round', e.type); return; } }
    // the same source may re-enter one event chain at most MAX_REENTRY times (spec §8)
    const again = this.evStack.filter(x => x.type === EVT.EFFECT_TRIGGER && x.payload.tkey === t.key).length;
    if (again >= BV2.MAX_REENTRY) { this.safety('re-entry ' + t.key, e.type); return; }
    const ctx = { ...t.ctx, snap: { ...e.payload }, trigEv: e };
    if (pre) { this.exec(t.tr.effects, { ...ctx, pre: e }); return; }
    // re-check the owner right before it fires: a fallen owner does not act unless the data says so
    if (t.owner && (t.owner.down || t.owner.fled) && !t.tr.whenDown) return;
    this.emit(EVT.EFFECT_TRIGGER, { src: t.owner, tgts: e.tgts.map(id => this.byId[id]), trig: 1, parentEvt: e, direct: (t.status ? 'status:' + t.status.id : 'passive:') + (t.tr.key || ''), prio: t.prio,
      payload: { key: t.tr.key || null, tkey: t.key, layer: t.layer, status: t.status ? t.status.id : null, on: e.type, msg: t.tr.msg || null }, tags: t.tr.tags2 || [] },
      () => this.exec(t.tr.effects, ctx));
  }
  resolveTriggered(list, e) { if (!list) return; for (const t of list) this.runTrigger(t, e, false); }
  /* ---------- effects (registered by id in DEF.effects / this.effs) ---------- */
  exec(effects, ctx) {
    for (const x of effects || []) {
      const ef = this.eff(x); if (!ef) { bvErr('exec', 'effect ' + x + ' missing'); continue; }
      if (ef.cond && !condOk(ef.cond, { core: this, owner: ctx.owner, src: ctx.src, tgt: ctx.tgt, skill: ctx.skill, ev: ctx.trigEv || ctx.pre, n: ctx.n, spent: ctx.spent, status: ctx.status })) continue;
      if (ef.chance != null && !this.rng.chance(typeof ef.chance === 'function' ? ef.chance(ctx) : ef.chance)) continue;
      const T = EFFECT_TYPES[ef.type]; if (!T) { bvErr('exec', 'effect type ' + ef.type + ' missing'); continue; }
      T.exec(this, ef, ctx, this.effTargets(ef, ctx));
      if (ef.then) this.exec(ef.then, ctx);
    }
  }
  effTargets(ef, ctx) {
    const me = ctx.owner || ctx.src;
    const pick = w => { switch (w) {
      case 'self': return [me]; case 'source': return ctx.trigEv && ctx.trigEv.src ? [this.byId[ctx.trigEv.src]] : ctx.pre && ctx.pre.src ? [this.byId[ctx.pre.src]] : [ctx.src];
      case 'event_target': { const ev = ctx.trigEv || ctx.pre; return ev ? ev.tgts.map(id => this.byId[id]) : [ctx.tgt]; }
      case 'all_enemies': return this.foesOf(me); case 'all_allies': return this.alliesOf(me);
      case 'random_enemy': { const f = this.foesOf(me); return f.length ? [this.rng.pick(f)] : []; }
      case 'last_target': { const t = me && this.byId[me.data.lastTarget]; return t && this.isUp(t) ? [t] : this.foesOf(me).slice(0, 1); }
      case 'other_enemy': { const ev = ctx.trigEv || ctx.pre, not = ev ? ev.tgts : []; const f = this.foesOf(me).filter(x => !not.includes(x.id)); return f.length ? [f[0]] : []; }
      case 'cast_targets': return (ctx.targets || [ctx.tgt]).filter(Boolean);
      default: return [ctx.tgt]; } };
    return pick(ef.target || 'target').filter(Boolean);
  }
  /* ---------- primitives every effect uses (each one produces formal events) ---------- */
  changeRes(u, res, delta, info = {}) {
    if (!(res in u.res) || !delta) return null; const old = u.res[res], max = u.max[res] ?? Infinity, min = DEF.resources[res] ? DEF.resources[res].min : 0;
    const nv = clamp(old + delta, min, max);
    if (delta > 0 && old + delta > max && res !== 'hp') this.emit(EVT.RESOURCE_OVERFLOW, { src: info.src || u, tgts: [u], payload: { res, over: old + delta - max, why: info.why || null } });
    if (nv === old && !info.force) return null;
    const e = this.emit(EVT.RESOURCE_CHANGE, { src: info.src || u, tgts: [u], payload: { res, old, change: nv - old, new: nv, why: info.why || null }, tags: info.tags || [] }, ev => { u.res[res] = clamp(ev.payload.new, min, max); });
    if (!e.cancelled) { if (u.res[res] === min && old !== min && res !== 'hp') this.emit(EVT.RESOURCE_EMPTY, { tgts: [u], payload: { res } }); if (u.res[res] === max && old !== max) this.emit(EVT.RESOURCE_FULL, { tgts: [u], payload: { res } }); }
    return e;
  }
  dealDamage(src, tgt, amount, info = {}) {
    if (!this.isUp(tgt)) return null; const hp0 = tgt.res.hp;
    const e = this.emit(EVT.DAMAGE, { src, tgts: [tgt], payload: { amount: Math.max(info.min ?? 1, Math.floor(amount)), base: amount, mult: info.mult ?? 1, crit: !!info.crit, el: info.el || '一般', cat: info.cat || '物', skill: info.skill || null, hitIndex: info.n ?? 0, parts: info.parts || [], kind: info.kind || 'hit' }, tags: (info.tags || []).concat(['damage']), skill: info.skill },
      ev => { const a = Math.max(0, Math.min(tgt.res.hp, Math.floor(ev.payload.amount))); ev.payload.amount = a; tgt.res.hp -= a; ev.payload.hpAfter = tgt.res.hp; ev.payload.hpBefore = hp0;
        if (src && src.side !== tgt.side) { tgt.data.hitRound = this.round; tgt.data.taken = (tgt.data.taken || 0) + a; tgt.data.hurtThisRound = (tgt.data.hurtThisRound || 0) + 1; }
        if (src && info.skill && this.cast && src.id === (this.act && this.act.actor)) this.castTotal[this.cast] = (this.castTotal[this.cast] || 0) + a; });
    if (!e.cancelled && tgt.res.hp <= 0 && !tgt.down) this.knockDown(tgt, src, e);
    return e;
  }
  // DOWN (spec §6): the smallest effect is done → DOWN PRE (endure / revive: prevent or replace) → re-check → MAIN → cleanup → POST
  knockDown(u, src, cause) {
    const e = this.emit(EVT.DOWN, { src, tgts: [u], payload: { cause: cause ? cause.id : null }, recheck: () => u.res.hp <= 0 }, () => { u.down = true; u.statuses = u.statuses.filter(s => DEF.statuses[s.id].keepOnDown); u.cd = {}; });
    if (e.cancelled && u.res.hp <= 0) u.res.hp = 1; return e;
  }
  heal(src, tgt, amount, info = {}) {
    if (!this.isUp(tgt)) return null;
    return this.emit(EVT.HEAL, { src, tgts: [tgt], payload: { amount: Math.max(1, Math.floor(amount)), kind: info.kind || 'heal' }, tags: ['heal'].concat(info.tags || []) },
      ev => { const want = ev.payload.amount, a = Math.min(tgt.max.hp - tgt.res.hp, want); ev.payload.amount = a; ev.payload.over = Math.max(0, want - a); tgt.res.hp += a; });
  }
  // status apply (spec §2.4): legal target → absolute immunity → conditional immunity → resistance → existing → stacks → duration → write → event
  applyStatus(src, tgt, id, o = {}) {
    const D = DEF.statuses[id]; if (!D) return bvErr('status', id + ' missing'); if (!this.isUp(tgt) && !D.keepOnDown) return null;
    let dur0 = o.dur ?? (typeof D.durDefault === 'function' ? D.durDefault(this, tgt) : D.durDefault) ?? null;
    if (dur0 != null && src === tgt && D.group === 'stage' && (o.delta ?? 1) > 0) for (const m of tgt.mods) if (m.selfBuffDur) dur0 += m.selfBuffDur; // 吟遊詩人: own buffs last longer
    const e = this.emit(EVT.STATUS_APPLY, { src, tgts: [tgt], payload: { status: id, dur: dur0, delta: o.delta ?? 1, data: o.data || {}, secondary: !!o.secondary, quiet: !!o.quiet }, tags: (D.tags || []).concat(['status']) }, ev => {
      const P = ev.payload, cur = this.statusOf(tgt, id);
      if (tgt.immune.includes(id) || (D.group && tgt.immune.includes('group:' + D.group))) { P.failed = 'immune'; return; }
      if (D.immune && D.immune(this, tgt)) { P.failed = 'immune'; return; }
      if (src && src.side !== tgt.side && D.group === 'major' && !cur) { const r = BR.statusResist(this, src, tgt, D); if (r > 0 && this.rng.chance(r)) { P.failed = 'resist'; return; } }
      if (D.group === 'major') { const m = this.majorOf(tgt); if (m && m !== id) { P.failed = 'other_major'; return; } if (m === id) { P.failed = 'already'; return; } }
      const max = D.maxOf ? D.maxOf(this, tgt, src) : D.max, dur = P.dur;
      const stamp = inst => { inst.at = this.round; inst.atAct = this.actSeq; inst.byOwn = !!(this.act && this.act.actor === tgt.id); };
      if (!cur) { const inst = { id, stacks: D.stack === 'signed' ? clamp(P.delta, D.min ?? -9, max ?? 9) : Math.max(1, Math.min(max ?? 99, P.delta)), dur, src: src ? src.id : null, seq: ++this.stSeq, data: P.data };
        stamp(inst); if (D.stack === 'signed' && !inst.stacks) { P.failed = 'zero'; return; } tgt.statuses.push(inst); P.stacks = inst.stacks; P.new = true; if (D.onApply) D.onApply(this, tgt, inst, src); return; }
      const before = cur.stacks;
      if (D.stack === 'signed') { const nv = clamp(cur.stacks + P.delta, D.min ?? -9, max ?? 9); if (nv === cur.stacks) { P.capped = true; cur.dur = Math.max(cur.dur || 0, dur || 0); } else { cur.stacks = nv; cur.dur = dur; } if (!cur.stacks) { this.dropStatus(tgt, cur); P.cleared = true; } }
      else if (D.stack === 'add') { const nv = Math.min(max ?? 99, cur.stacks + P.delta); if (nv === cur.stacks) P.capped = true; cur.stacks = nv; if (D.refresh !== false && dur != null) cur.dur = Math.max(cur.dur || 0, dur); Object.assign(cur.data, P.data); }
      else if (D.stack === 'max') { cur.stacks = Math.max(cur.stacks, P.delta); cur.dur = Math.max(cur.dur || 0, dur || 0); }
      else if (D.stack === 'refresh') { if (dur != null) cur.dur = Math.max(cur.dur || 0, dur); Object.assign(cur.data, P.data); }
      else { P.failed = 'already'; return; }
      stamp(cur); P.stacks = cur.stacks; P.before = before; P.refreshed = true;
    });
    if (e.payload.failed && !e.cancelled) this.emit(EVT.STATUS_FAIL, { src, tgts: [tgt], payload: { status: id, why: e.payload.failed, secondary: !!o.secondary } });
    else if (!e.cancelled && e.payload.before != null && e.payload.before !== e.payload.stacks) this.emit(EVT.STATUS_STACK, { src, tgts: [tgt], payload: { status: id, old: e.payload.before, new: e.payload.stacks } });
    return e;
  }
  dropStatus(u, inst) { const i = u.statuses.indexOf(inst); if (i >= 0) u.statuses.splice(i, 1); }
  // status remove (spec §2.4): request → unremovable check → reason → event → removal
  removeStatus(u, id, why = 'remove', src = null) {
    const inst = this.statusOf(u, id); if (!inst) return null; const D = DEF.statuses[id];
    if (D.unremovable && !['expire', 'release', 'used', 'down'].includes(why)) { this.emit(EVT.STATUS_FAIL, { src, tgts: [u], payload: { status: id, why: 'unremovable' } }); return null; }
    if (u.hero && D.group === 'major' && why !== 'expire') this.data.cured = true;
    return this.emit(why === 'expire' ? EVT.STATUS_EXPIRE : EVT.STATUS_REMOVE, { src, tgts: [u], payload: { status: id, why, stacks: inst.stacks }, tags: D.tags || [] }, () => { this.dropStatus(u, inst); if (D.onRemove) D.onRemove(this, u, inst, why); });
  }
  // the timing points of statuses: `tick` counts the duration down, `clearAt` removes it. A status the owner put on itself during
  // this very action is not counted down at the end of that action (so a 3-action buff lasts 3 more own actions).
  tick(u, when) {
    for (const s of u.statuses.slice()) { if (!u.statuses.includes(s)) continue; const D = DEF.statuses[s.id];
      const fresh = when === 'owner_action_end' && s.byOwn && s.atAct === this.actSeq;
      if (D.clearAt === when && !fresh) { this.removeStatus(u, s.id, 'expire'); continue; }
      if (D.tick !== when || s.dur == null || fresh) continue;
      s.dur--; if (s.dur <= 0) this.removeStatus(u, s.id, 'expire'); }
  }
  /* ---------- end of the round: ROUND_END triggers (damage over time, regeneration, classes, talents, gear), then durations ---------- */
  roundEnd() {
    this.emit(EVT.ROUND_END, { payload: { round: this.round } });
    for (const u of this.units) if (this.isUp(u)) this.tick(u, 'round_end');
    this.order = []; this.roundDone = true;
  }
  finish(outcome) {
    if (this.result) return this.result;
    this.order = []; this.reactQ = []; this.need = null; this.pend = null; // actions that never got their turn are dropped with the battle
    this.emit(EVT.BATTLE_END, { payload: { outcome, round: this.round } });
    this.result = { outcome, rounds: this.round, units: this.units.map(u => ({ id: u.id, sp: u.sp, side: u.side, down: u.down, fled: u.fled, hp: u.res.hp, mp: u.res.mp, kind: u.kind, lv: u.lv, status: this.majorOf(u), sleepLeft: (this.statusOf(u, 'slp') || {}).dur })), trace: this.trace };
    return this.result;
  }
  // a reaction (counter, …) is a formal action resolved right after the current one
  react(u, cmd) { const depth = (this.act && this.act.reaction ? this.act.depth || 1 : 0) + 1; if (depth > BV2.MAX_REACT) { this.safety('reaction depth', 'REACTION'); return; }
    this.emit(EVT.REACTION, { src: u, tgts: (cmd.targets || []).map(id => this.byId[id]), payload: { skill: cmd.skill, why: cmd.why || null } });
    this.reactQ.push({ ...cmd, actor: u.id, type: 'skill', reaction: true, depth, meta: { ...(cmd.meta || {}), reaction: 1, power: cmd.power || null } }); }
  // one more action for u right after the current one (疾行, 舞王…)
  extraTurn(u, why) { if (!this.isUp(u)) return; this.emit(EVT.EXTRA_ACTION, { src: u, tgts: [u], payload: { why, queued: 1 } }, () => { this.order.unshift({ id: u.id, extra: why }); }); }
  // a deterministic fingerprint of the event sequence
  hash() { let h = 2166136261; for (const e of this.log) { const s = e.type + '|' + e.src + '|' + e.tgts.join(',') + '|' + JSON.stringify(e.payload.amount ?? e.payload.status ?? e.payload.skill ?? ''); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } } return h >>> 0; }
}
