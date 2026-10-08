/* ===================== v14.0 卡組職業：戰鬥畫面 =====================
   沿用原本的戰鬥畫面（魔物圖、特效、跳字、魔物頭上的意圖），下方換成手牌。
   · 每回合 3 能量、抽 5 張（手牌上限 10）；點一張卡看說明，再點一次出牌；打單體的卡再點要打的魔物
   · 出完牌按「結束」，魔物才行動；格擋到你下一回合開始時消失
   · 道具不花能量，每回合 1 次（v14.6）；可以逃跑（頭目戰不行） */
const BPK = Battle.prototype;
const stkH = (b, id) => stkK(b.core.byId.H, id);
{ const _main = BPK.main; BPK.main = function* () { if (KD.on(this.core) && !this.run15) this.initK(); return yield* _main.call(this); }; }
BPK.initK = function () { const st = Game.st, core = this.core, H = core.byId.H; this.k14 = true; core.data.cb14 = this; this.cls = KD.clsKey(st);
  this.pile = shuffle15(KD.deck(st).map(c => ({ ...c, src16: c })), () => core.rng.next()); /* src16: the deck's own card (熟練 counts on it, 14p) */ this.hand = []; this.disc = []; this.exh = [];
  Object.assign(this, { energy: 0, si: 0, nextDraw: 0, nextEn: 0, turnR: 0, sel: -1, tgtMode: 0, tapK: null, cardsN: 0, atkN: 0, sklN: 0, fillSi: 0, twice: 0, dupNext: 0, fb: 0, dealt: 0, turns: 0, masterN: 0 });
  const ids = new Set(['k14_end']); for (const id in KD.CARDS) ids.add('k14_' + id); H.skills = [...ids]; };
BPK.Hu = function () { return this.core.byId.H; };
// v14.7 (玩家：「戰鬥時怪物消失」): cards run inside the core before their events are played, so a full sync() here hid a monster the moment
// a card killed it — it vanished while the card was still flying, the hit landed on empty ground, then it popped back to fall over.
// Mid-action syncs now leave who is gone to the faint / flee animations (play() still does the full sync afterwards).
BPK.syncK = function () { const keep = []; for (const id in this.views) { const v = this.views[id]; keep.push([v, v.gone, v.alpha, v.plateA]); }
  this.sync(); for (const [v, g, a, pa] of keep) { v.gone = g; v.alpha = a; v.plateA = pa; } };
BPK.pipX16 = function () { const CL = KD.CLASSES[this.cls] || {}; return 41 + Math.ceil(Font.width(CL.n || '', 8)) + 4; }; // the class's pips, right after its name under the HP bar
BPK.addSi = function (n) { this.si = Math.min(3, this.si + n); this.siGain = (this.siGain || 0) + n; };
BPK.drawN = function (n) { for (let i = 0; i < n; i++) { if (this.hand.length >= KD.HAND) break; if (!this.pile.length) { if (!this.disc.length) break; this.pile = shuffle15(this.disc, () => this.core.rng.next()); this.disc = []; } this.hand.push(this.pile.pop()); } };
BPK.addHand = function (id, up) { if (this.hand.length < KD.HAND) this.hand.push({ id, up: up ? 1 : 0 }); else this.disc.push({ id, up: up ? 1 : 0 }); };
BPK.copyBest = function () { const L = this.hand.filter(c => KD.CARDS[c.id].rar !== 'T'); if (!L.length) return; const c = L.sort((a, b) => KD.cost(b) - KD.cost(a))[0]; this.addHand(c.id, c.up); };
BPK.gainMaxHp = function (n) { const st = Game.st, K = KD.state(st); K.hpPlus = (K.hpPlus || 0) + n; const H = this.Hu(); H.max.hp += n; H.res.hp += n; this.noteK('最大 HP +' + n + '！'); };
BPK.noteK = function (s) { this.note16 = { s: String(s), t: 0 }; };
/* ---------- the start of the hero's turn ---------- */
BPK.startTurnK = function () { const core = this.core, H = this.Hu(), notes = []; this.turns++;
  this.energy = KD.EN + this.nextEn + stkK(H, 'pwMax14'); this.nextEn = 0; Object.assign(this, { chainN: 0, cardsN: 0, atkN: 0, sklN: 0, tgtMode: 0, sel: -1, twice: 0, dupNext: 0, phantomUsed: 0, itemN: 0 });
  if (stkK(H, 'blk15')) H.statuses = H.statuses.filter(s => s.id !== 'blk15');
  const g = stkK(H, 'pwGuard15') + stkK(H, 'pwRock14'); if (g) KD.block(core, H, g);
  const k = stkK(H, 'pwKindle14'); if (k) for (const t of core.alive('B')) KD.add(core, H, t, 'burn14', k);
  const vic = stkK(H, 'pwVictor14'); if (vic) { kLose(this, core, vic); this.energy++; } /* v14.10: 失去 HP 也觸發狂暴；1 HP 時一樣給能量 */
  const A = KD.ailments(core, H); if (A.en) { this.energy = Math.max(0, this.energy - A.en); notes.push(...A.out); }
  this.silenced = core.hasStatus(H, 'silence14'); if (this.silenced) notes.push('被沉默了：不能用技能卡');
  this.drawN(KD.DRAW + this.nextDraw + stkK(H, 'pwMoon14')); this.nextDraw = 0;
  const lk = stkK(H, 'pwLurk14'); for (let i = 0; i < lk; i++) this.addHand('tk_shiv');
  if (notes.length) this.noteK(notes.join('　')); this.syncK(); };
BPK.whyK = function (c) { const C = KD.CARDS[c.id]; if (KD.cost(c) > this.energy) return '能量不夠'; if (this.silenced && C.type === 'skl') return '被沉默了，不能用技能卡'; return null; };
BPK.okK = function (c) { return !this.whyK(c); };
/* ---------- the hero's command: the hand of cards ---------- */
{ const _cmd = BPK.command; BPK.command = function* () { if (!this.k14) return yield* _cmd.call(this);
    const core = this.core, H = this.Hu();
    if (this.turnR !== core.round) { this.turnR = core.round; this.meteorDue = stkK(H, 'chgM14') > 0; this.startTurnK(); const f = Game.st && Game.st.flags; if (f && !f.tutK14 && !Game.autoPlay) { f.tutK14 = 1;
        yield* this.msg('（卡牌戰鬥：每回合 3 能量、抽 5 張。點一張卡看說明，再點一次出牌；出完牌按「結束」，魔物才照頭上的圖示行動。）', { wait: true }); } }
    if (this.meteorDue && stkK(H, 'chgM14')) { this.meteorDue = false; this.idle = false; /* v14.10: only at the start of the next turn (it used to fall the moment the card was played) */
      core.data.card14Now = { id: 'mg_meteorHit' }; core.data.skill14 = 'k14_mg_meteorHit'; return { type: 'skill', skill: 'k14_mg_meteorHit', targets: [] }; }
    if (Game.autoPlay) { for (let i = 0; i < 3; i++) yield; const a = Game.autoPlay(this); if (a && a.cmd) return a.cmd; const r = a && a.k ? a : this.autoK(a); if (r.cmd) return r.cmd; this.tapK = r; }
    while (true) {
      this.idle = true; const n = this.hand.length;
      if (!this.tapK) { yield; if (Input.pressed('left')) { if (this.tgtMode) this.cycK(-1); else this.sel = this.sel <= 0 ? n - 1 : this.sel - 1; Sound.sfx('cursor'); }
        if (Input.pressed('right')) { if (this.tgtMode) this.cycK(1); else this.sel = (this.sel + 1) % Math.max(1, n); Sound.sfx('cursor'); } }
      let act = this.tapK; this.tapK = null;
      if (!act) { if (Input.pressed('a')) act = this.tgtMode ? { k: 'tgt', id: this.tgtId } : this.sel >= 0 ? { k: 'card', i: this.sel } : null; else if (Input.pressed('b')) act = this.tgtMode || this.sel >= 0 ? { k: 'back' } : null; else if (Input.pressed('start')) act = { k: 'end' }; }
      if (!act) continue;
      if (act.k === 'back') { this.tgtMode = 0; this.sel = -1; continue; }
      if (act.k === 'pile') { this.idle = false; yield* this.pileView(act.w); continue; }
      if (act.k === 'end') { this.idle = false; this.discardAnim(); this.disc.push(...this.hand); this.hand = []; this.sel = -1; core.data.card14Now = null; return { type: 'skill', skill: 'k14_end', targets: [] }; }
      if (act.k === 'item') { if (this.itemN) { this.noteK('道具每回合只能用 1 次'); Sound.sfx('buzz'); continue; } this.idle = false; const it = yield* bagScreen('battle'); if (!it) continue; if (!DEF.items[it]) { this.noteK('現在不能使用這個道具'); continue; } this.itemN = 1; return { type: 'item', item: it }; }
      if (act.k === 'run') { if (this.anyBoss()) { this.noteK('不能從這場戰鬥中逃走！'); Sound.sfx('buzz'); continue; } this.idle = false; this.disc.push(...this.hand); this.hand = []; return { type: 'run' }; }
      if (act.k === 'card') { if (this.sel !== act.i) { this.sel = act.i; this.tgtMode = 0; Sound.sfx('cursor'); continue; }
        const c = this.hand[act.i]; if (!c) continue; const why = this.whyK(c); if (why) { this.noteK(why); Sound.sfx('buzz'); continue; }
        const C = KD.CARDS[c.id], foes = core.alive('B');
        if (C.tg === 'enemy' && foes.length > 1) { this.tgtMode = 1; this.tgtId = (this.focus && foes.some(f => f.id === this.focus.id)) ? this.focus.id : foes[0].id; continue; }
        return this.playK(act.i, C.tg === 'enemy' && foes[0] ? foes[0].id : null); }
      if (act.k === 'tgt' && this.tgtMode && this.sel >= 0) { this.tgtMode = 0; return this.playK(this.sel, act.id); }
    } }; }
BPK.cycK = function (d) { const L = this.core.alive('B'), i = L.findIndex(f => f.id === this.tgtId); this.tgtId = L[(i + d + L.length) % L.length].id; this.focus = this.views[this.tgtId]; };
BPK.playK = function (i, tgt) { const c = this.hand[i], C = KD.CARDS[c.id]; this.energy -= KD.cost(c); this.hand.splice(i, 1); this.sel = -1; this.idle = false;
  if (C.type !== 'pow') (C.exhaust && !(c.aw && KD.AW && KD.AW[c.id] && KD.AW[c.id].keep) ? this.exh : this.disc).push(c); /* 覺醒「不會消耗」 */ this.core.data.card14Now = c; this.core.data.skill14 = 'k14_' + c.id; Sound.sfx('select');
  return { type: 'skill', skill: 'k14_' + c.id, targets: tgt ? [tgt] : [] }; };
// tests / bots (Game.autoPlay returning {type:…}): items and running pass through; otherwise the best card it can pay for
BPK.autoK = function (a) { const core = this.core, H = this.Hu(), foes = core.alive('B'), hp = H.res.hp / H.max.hp;
  if (a && a.type === 'item' && (a.item || a.id) && !this.itemN) { this.itemN = 1; return { cmd: { type: 'item', item: a.item || a.id } }; }
  if (a && a.type === 'run' && !this.anyBoss()) { this.disc.push(...this.hand); this.hand = []; return { cmd: { type: 'run' } }; }
  const I = foes.map(f => typeof intentOf14 === 'function' ? intentOf14(core, f, core.plan && core.plan[f.id]) : null).filter(Boolean), hits = I.some(q => q.k === 'atk' || q.k === 'heavy'), heavy = I.some(q => q.k === 'heavy'), blk = stkK(H, 'blk15');
  let best = -1, bv = 0; this.hand.forEach((c, i) => { if (!this.okK(c)) return; const C = KD.CARDS[c.id], v = KD.val(c), cost = Math.max(0.5, KD.cost(c));
    let s = C.type === 'pow' ? (this.turns <= 2 ? 90 : 20) : C.type === 'atk' ? ((v.d || 4) * (C.tg === 'all' ? foes.length : 1) * 4 / cost) : (v.b ? (!hits ? 4 : blk > H.max.hp * 0.25 ? 6 : heavy ? 70 : hp < 0.7 ? 45 : 18) * v.b / 6 / cost : v.h ? (hp < 0.5 ? 60 : 2) : 30);
    if (s > bv) { bv = s; best = i; } });
  if (best < 0) return { k: 'end' }; const C = KD.CARDS[this.hand[best].id], t = foes.slice().sort((x, y) => x.res.hp - y.res.hp)[0];
  return { cmd: this.playK(best, C.tg === 'enemy' && t ? t.id : null) }; };
/* ---------- running a card (the core calls this through the card's skill) ---------- */
EFFECT_TYPES.card14 = { exec(core, ef, ctx) { const cb = core.data.cb14, c = core.data.card14Now; if (!cb || !c || !KD.CARDS[c.id]) return; cb.runCard(c, ctx); } };
EFFECT_TYPES.card14end = { exec(core) { const cb = core.data.cb14; if (cb) cb.endTurnK(); } };
BPK.runCard = function (c, ctx) { const core = this.core, C = KD.CARDS[c.id], v = KD.val(c), H = this.Hu();
  let tg = (ctx.targets || []).filter(t => t && t.side === 'B' && core.isUp(t)); if (C.tg === 'enemy' && !tg.length) { const f = core.alive('B'); if (f.length) tg = [f[0]]; } if (C.tg === 'all') tg = core.alive('B'); if (C.tg === 'self' || C.tg === 'rand') tg = [];
  let times = 1; if (C.type === 'atk' && c.id !== 'mg_meteorHit') { if (this.twice) { times = 2; this.twice = 0; } if (stkK(H, 'pwPhantom14') && (this.phantomUsed || 0) < (stkK(H, 'pwPhantomA16') ? 2 : 1)) { times++; this.phantomUsed = (this.phantomUsed || 0) + 1; } }
  if (this.dupNext && C.type !== 'pow' && c.id !== 'lg_crystal') { times++; this.dupNext = 0; }
  /* v14.17: 劍士「看破」(each layer +4 on the next attack card, once per target; 破防值 −1 per layer, 14n) replaces 劍意 ×2; 狂戰士「血怒」 is gone (「怒氣」, 14t) */
  const kp = this.cls === 'sw' && C.type === 'atk' ? (this.si || 0) : 0;
  this.fb = 0; if (C.type === 'atk') { if (kp) this.fb += KD.KP_DMG * kp; const nx = stkK(H, 'nxa14'); if (nx) { this.fb += nx; core.removeStatus(H, 'nxa14', 'used'); } }
  core.data.kp16 = kp; this.dealt = 0; this.siGain = 0; this.fbDone = new Set();
  for (let k = 0; k < times; k++) { if (!core.isUp(H) || !core.alive('B').length) break; C.run(this, core, tg, v); if (C.tg === 'all') tg = core.alive('B'); }
  core.data.kp16 = 0; this.fb = 0; this.fbDone = null;
  if (C.type === 'atk') { this.atkN++; if (kp) this.si = Math.min(3, this.siGain); /* the 看破 is spent (a card that gives 看破 itself keeps that) */ if (this.fillSi) { this.si = 3; this.fillSi = 0; }
    const m = stkK(H, 'pwMaster15'); if (m) this.masterN = (this.masterN || 0) + 1; if (m && this.masterN % (stkK(H, 'pwMasterA16') ? 2 : 3) === 0) { /* counts attacks since the power was played, across turns */ this.drawN(m); this.energy += m; this.noteK('劍聖之心：抽 ' + m + '、能量 +' + m); }
    const bl = stkK(H, 'pwBlood14'); if (bl && this.dealt > 0) KD.heal(core, H, Math.max(1, Math.round(this.dealt * bl / 100))); }
  if (C.type === 'skl') { this.sklN++; const s = stkK(H, 'pwStatic14'); if (s) { const t = kRand(core); if (t) KD.hit(core, H, t, s, { el: '雷', cat: '特' }); } }
  if (C.rar !== 'T') this.cardsN++;
  if (this.cls === 'rg' && !C.hidden) { this.chainN = (this.chainN || 0) + 1; if (this.chainN % 3 === 0) { this.addHand('tk_shiv'); this.noteK('連擊：得到 1 張飛刀'); } } /* 盜賊「連擊」(2026-10-08)：飛刀也算一張 */
  this.syncK(); };
BPK.endTurnK = function () { const core = this.core, H = this.Hu(); if (stkK(H, 'tstr14')) core.removeStatus(H, 'tstr14', 'expire');
  const o = stkK(H, 'pwOtto14'); if (o) { const t = kRand(core); if (t) { core.data.skill14 = 'k14_lg_otto'; KD.hit(core, H, t, o); } } };
// 不死鳥: the first blow that would knock the hero out leaves 1 HP, then back to half
{ const _dd = BattleCore.prototype.dealDamage; BattleCore.prototype.dealDamage = function (src, tgt, amount, info = {}) {
    if (KD.on(this) && tgt && tgt.hero && stkK(tgt, 'pwPhoenix14') && this.isUp(tgt)) { const eff = amount - (info.kind === 'hit' ? stkK(tgt, 'blk15') : 0);
      if (eff >= tgt.res.hp) { const r = _dd.call(this, src, tgt, Math.max(0, amount - (eff - (tgt.res.hp - 1))), info); this.removeStatus(tgt, 'pwPhoenix14', 'used'); this.heal(tgt, tgt, Math.max(1, Math.floor(tgt.max.hp / 2) - tgt.res.hp), {}); const cb = this.data.cb14; if (cb) cb.noteK('不死鳥：復活了！'); return r; } }
    return _dd.call(this, src, tgt, amount, info); }; }
/* ---------- messages: the 「X使用了Y」 box would stop every card — a short line instead; tips in （） stay ---------- */
{ const _an = BPK.announce; BPK.announce = function* (text) { if (!this.k14) return yield* _an.call(this, text); };
  const _ms = BPK.msg; BPK.msg = function* (text, o = {}) { if (!this.k14 || /^（/.test(String(text)) || o.wait || o.keep14) return yield* _ms.call(this, text, o); this.noteK(text); yield* wait(Math.min(12, o.hold || 12)); }; }
{ const HD = BPK.handlers, _ex = HD.EXTRA_ACTION; HD.EXTRA_ACTION = function* (e, s, t, P) { if (P && P.why === 'card14') return; if (_ex) yield* _ex.call(this, e, s, t, P); }; }
/* ---------- drawing ---------- */
const HK = H_BASE;
// v14.12 battle layout: the hand, the bar above it and the card text hang from the bottom of the screen (taller on a tall phone)
KD.BL = () => { const E = bxE(), ch = E >= 60 ? 68 : E >= 24 ? 60 : 52, /* v14.15: bigger hand (was 64 / 58) */ cw = E >= 24 ? 35 : 33, handY = H - ch - 3, hudY = handY - 27;
  return { E, cw, ch, handY, hudY, noteY: hudY - 19, tgtY: hudY - 34, detB: hudY - 3, tall: E >= 40 }; };
// v14.1 card pictures: 16 pixel icons in the game's own style (13×13, drawn 1× in the hand, 2× on big cards)
const KD_PAL = {"w": "#f4f4fa", "s": "#b0b8d0", "g": "#7c84a0", "y": "#ffe070", "Y": "#d09a28", "n": "#b07040", "N": "#6a3c20", "o": "#ffb050", "O": "#e0602a", "r": "#ff5a48", "R": "#a82828", "G": "#7ae868", "E": "#2e9a40", "L": "#d0ffc0", "b": "#7ab8ff", "B": "#3a68d0", "c": "#d0f4ff", "p": "#c890ff", "P": "#7040b8", "q": "#e8d0ff", "d": "#c8cce0", "D": "#8a90a8", "m": "#f4ecd8", "M": "#c0ae88", "T": "#9ad048", "U": "#5a8a28", "h": "#ff8aa8", "H": "#d0405a", "f": "#fff0a0", "e": "#ffd0b0", "a": "#e0a070"};
KD.ICON = {
  sword: PXS(["..........kk.", ".........kwwk", "........kwwsk", ".......kwwsk.", "......kwwsk..", "..k..kwwsk...", ".kYkkwwsk....", "..kYYwsk.....", "...kYYk......", "..knYkYk.....", ".knnk.k......", "knnk.........", ".kk.........."], KD_PAL),
  dagger: PXS(["......k......", ".....kwk.....", "....kwwsk....", "....kwwsk....", "....kwwsk....", "....kwwsk....", "...kkwwskk...", "..kYYYYYYYk..", "...kknnNkk...", "....knnNk....", "....kYYYk....", ".....kkk.....", "............."], KD_PAL),
  axe: PXS(["........k....", ".....kkknk...", "....ksssnNk..", "...kswwwnNk..", "..kswwwwnNk..", "..kswwwwnNk..", "...kswwwnNk..", "....ksssnNk..", ".....kkknNk..", ".......knNk..", ".......knNk..", ".......kNNk..", "........kk..."], KD_PAL),
  fist: PXS([".............", "...k.k.k.k...", "..kmkmkmkmk..", ".kmmmmmmmmmk.", ".kmMmMmMmMmk.", ".kmmmmmmmmmk.", "kmmmmmmmmmmk.", "kmmMMmmmmmMk.", ".kmmmmmmmmMk.", "..kmmmmmmMk..", "..kssssssgk..", "..kssssssgk..", "...kkkkkkk..."], KD_PAL),
  orb: PXS([".............", ".....kkk.....", "...kkpppkk...", "..kppqqppPk..", "..kpqwqpppPk.", ".kppqqpppPPk.", ".kpppppppPPk.", ".kppppppPPPk.", "..kpppPPPPk..", "..kPPPPPPPk..", "...kkPPPkk...", ".....kkk.....", "............."], KD_PAL),
  fire: PXS(["......k......", ".....kyk.....", "....kyok..k..", "....kyookkyk.", "...kyooOkyok.", "..kyoofoOyoOk", "..kooffooooOk", ".kyoofffooOk.", ".koofffffoOk.", ".koOffffoOOk.", "..kOOooOOOk..", "...kOOOOOk...", "....kkkkk...."], KD_PAL),
  ice: PXS(["......k......", "...k.kck.k...", "..kckkckkck..", "...kckckck...", "..k.kbcbk.k..", ".kckkbwbkkck.", "kcccbwwwbccck", ".kckkbwbkkck.", "..k.kbcbk.k..", "...kckckck...", "..kckkckkck..", "...k.kck.k...", "......k......"], KD_PAL),
  bolt: PXS([".......kk....", "......kyyk...", ".....kyyYk...", "....kyyYk....", "...kyyYkkk...", "..kyyyyyyYk..", "...kkkyyYk...", "....kyyYk....", "...kyyYk.....", "..kyyYk......", "..kyYk.......", "..kYk........", "...k........."], KD_PAL),
  shield: PXS(["..kkkkkkkkk..", ".kYYYYYYYYYk.", ".kYbbbcbbBYk.", ".kYbbbcbbBYk.", ".kYbbbcbbBYk.", ".kYccccccBYk.", ".kYbbbcbbBYk.", "..kYbbcbBYk..", "..kYbbcbBYk..", "...kYbcBYk...", "....kYBYk....", ".....kYk.....", "......k......"], KD_PAL),
  heart: PXS([".............", "..kkk...kkk..", ".khhhk.khhhk.", "khwhhhkhhhhHk", "khwhhhhhhhhHk", "khhhhhhhhhhHk", ".khhhhhhhhHk.", "..khhhhhhHk..", "...khhhhHk...", "....khhHk....", ".....kHk.....", "......k......", "............."], KD_PAL),
  poison: PXS(["......k......", ".....kTk.....", ".....kTk.....", "....kTTTk....", "...kTTTTTk...", "..kTTTTTTUk..", ".kTwTTTTTTUk.", ".kTwTTTTTTUk.", ".kTTTTTTTTUk.", "..kTTTTTTUk..", "...kUUUUUk...", "....kkkkk....", "............."], KD_PAL),
  skull: PXS(["....kkkkk....", "...kmmmmmk...", "..kmmmmmmmk..", ".kmmmmmmmmMk.", ".kmkkmmkkmMk.", ".kmkkmmkkmMk.", ".kmmmmkmmmMk.", "..kmmmmmmMk..", "..kmkmkmkMk..", "...kMMMMMk...", "....kkkkk....", ".............", "............."], KD_PAL),
  star: PXS(["......k......", ".....kyk.....", ".....kyk.....", ".kkkkyyykkkk.", "kyyyyyfyyyyYk", ".kyyyfffyyYk.", "..kyyyfyyYk..", "..kyyyyyyYk..", ".kyyyYkyyyYk.", ".kyyYk.kyyYk.", ".kyYk...kyYk.", "..kk.....kk..", "............."], KD_PAL),
  cards: PXS([".............", ".....kkkkkk..", "....kddddddk.", "..kkkdDDDDdk.", ".kwwwwwwDDdk.", ".kwbbbbwDDdk.", ".kwbccbwDDdk.", ".kwbccbwDDdk.", ".kwbbbbwdddk.", ".kwbbbbwkkk..", ".kwwwwwwk....", "..kkkkkk.....", "............."], KD_PAL),
  energy: PXS(["....kkkkk....", "...koooook...", "..koyyyyyok..", ".koyyyOyyyok.", ".koyyOOyyyok.", ".koyOOOOOyok.", ".koyyyOOyyok.", ".koyyyOyyyok.", "..koyyyyyok..", "...koooook...", "....kkkkk....", ".............", "............."], KD_PAL),
  crown: PXS([".............", "..k...k...k..", ".kyk.kyk.kyk.", ".kyykkykkyyk.", ".kyyyyyyyyyk.", ".kyryybyygyk.", ".kyyyyyyyyyk.", ".kYYYYYYYYYk.", "..kkkkkkkkk..", ".............", ".............", ".............", "............."], KD_PAL),
};
KD.ICON_OF = { sw_eye: 'sword', sw_sheathe: 'sword', sw_breath: 'cards', sw_mujin: 'sword', sw_stance: 'shield', rg_fan: 'dagger', rg_lurk: 'dagger', rg_knives: 'dagger', rg_envenom: 'poison', rg_phantom: 'star', mg_meteor: 'fire', mg_kindle: 'fire', mg_static: 'bolt', mg_phoenix: 'heart', mg_haste: 'energy',
  lg_rock: 'crown', lg_victor: 'crown', lg_moon: 'crown', lg_otto: 'crown', lg_crystal: 'star', lg_mirror: 'cards', nt_rally: 'star', bk_limit: 'star', bk_roar: 'star', bk_reckless: 'energy' };
const KD_FIST = new Set(['bk_triple', 'bk_kick', 'bk_storm', 'bk_hundred', 'bk_upper', 'bk_shell', 'bk_fbreak']);
KD.iconOf = id => { if (KD.ICON_OF[id]) return KD.ICON_OF[id]; const C = KD.CARDS[id]; if (!C) return 'star'; const d = C.desc(C.b);
  if (C.type === 'atk') { if (C.el === '火') return 'fire'; if (C.el === '水') return 'ice'; if (C.el === '雷') return 'bolt'; if (KD_FIST.has(id)) return 'fist'; return { sw: 'sword', rg: 'dagger', bk: 'axe', mg: 'orb' }[C.cls] || 'sword'; }
  if (C.type === 'pow') return 'star'; if (/格擋/.test(d)) return 'shield'; if (/回復/.test(d)) return 'heart'; if (/毒/.test(d)) return 'poison'; if (/燃燒/.test(d)) return 'fire';
  if (/虛弱|易傷|不能行動/.test(d)) return 'skull'; if (/能量 \+/.test(d)) return 'energy'; if (/抽/.test(d)) return 'cards'; return 'star'; };
// the words a card uses, explained (shown above the card's text when it is picked)
KD.KEYS = [[/格擋/, '格擋：擋下傷害，到你下一回合開始時消失。'], [/易傷/, '易傷：受到的傷害 +50%，每回合 −1。'], [/虛弱/, '虛弱：造成的傷害 −25%，每回合 −1。'], [/毒/, '毒：回合結束失去等同層數的 HP，然後 −1。'],
  [/燃燒/, '燃燒：回合結束失去等同層數的 HP，不會減少。'], [/力量/, '力量：每段傷害 +1（每層）。'], [/消耗/, '消耗：打出後這場戰鬥不會再抽到。'], [/看破/, '看破：格擋完全擋下攻擊時 +1（最多 3）；下一張攻擊卡每層傷害 +4、破防值 −1。'],
  [/飛刀/, '飛刀：0 費、4 傷害、消耗的小刀卡。'], [/蓄力/, '蓄力：下回合開始才發動。'], [/不能行動|定身/, '不能行動：這回合魔物什麼都不做。'], [/護盾/, '護盾：魔物身上的盾，會先擋下傷害。'], [/隨機/, '隨機：每一下各自挑一隻魔物打。'], [/^能力：/, '能力卡：打出後一直生效到戰鬥結束。']];
KD.keyLines = c => { const d = KD.desc(c), out = []; for (const [re, t] of KD.KEYS) if (re.test(d)) out.push(t); return out.slice(0, 2); };
{ const _dbh = BPK.drawBoxH; BPK.drawBoxH = function (x) { if (!this.k14) return _dbh.call(this, x); const Hv = this.H, U = this.Hu(); if (!Hv || !U) return; const LB = KD.BL(), Y = LB.hudY, fK = this.fK || 0;
    x.fillStyle = 'rgba(10,8,20,0.62)'; x.fillRect(0, Y - 2, W, 27); x.fillStyle = 'rgba(10,8,20,0.92)'; x.fillRect(0, LB.handY - 3, W, H - LB.handY + 3);
    { const CL0 = KD.CLASSES[this.cls] || {}, st = Game.st; x.fillStyle = '#0c0814'; x.fillRect(0, Y - 1, 27, 25); x.fillStyle = '#262038'; x.fillRect(1, Y, 25, 23); x.fillStyle = CL0.c || '#8a93b3'; x.fillRect(0, Y - 1, 27, 1); // v14.16: the hero's face (the paper doll: what is worn is what is in the deck)
      if (st) { try { x.drawImage(heroFramesFor(st).down[0], 3, 2, 12, 11, 2, Y + 1, 24, 22); } catch (e) { /* no doll yet */ } } }
    const en = this.energy, ex = 29, ey = Y + 16; x.fillStyle = '#2a1c08'; x.beginPath(); x.arc(ex, ey, 10, 0, 7); x.fill(); x.fillStyle = en ? '#ffb030' : '#6a5030'; x.beginPath(); x.arc(ex, ey, 8.5, 0, 7); x.fill(); x.fillStyle = en ? 'rgba(255,240,180,0.55)' : 'rgba(0,0,0,0)'; x.fillRect(ex - 5, ey - 6, 4, 2); Font.drawC(x, String(en), ex, midY(ey - 10, 21, 12), '#1a0c00', null, 12); /* v14.16: the energy sits on the face's corner */
    const bx = 41, bw = 72, hp = Math.max(0, Math.round(Hv.hp)), mh = U.max.hp; /* v14.15: longer HP bar (was 23 / 70) */ x.fillStyle = '#301018'; x.fillRect(bx, Y + 1, bw, 11); x.fillStyle = hp <= mh / 2 ? '#e05030' : '#c83838'; x.fillRect(bx, Y + 1, Math.round(bw * Math.min(1, hp / Math.max(1, mh))), 11);
    // v14.17: 格擋 sits on the right end of the HP bar (under the bar the class name, its pips and 看破 / 狂化 need the room; it used to run into 「道具」)
    const b = (Hv.st && Hv.st.blk15) || 0; if (b) { const t = String(b), tw = Math.ceil(Font.width(t, 8)), bw2 = tw + 12, X2 = bx + bw - bw2; x.strokeStyle = '#7ec8ff'; x.lineWidth = 1; x.strokeRect(bx - 0.5, Y + 0.5, bw + 1, 12);
      x.fillStyle = '#0c1830'; x.fillRect(X2 - 1, Y, bw2 + 1, 13); x.fillStyle = '#2a5aa8'; x.fillRect(X2, Y + 1, bw2, 11); x.fillStyle = '#dff0ff'; x.fillRect(X2 + 2, Y + 3, 5, 4); x.fillRect(X2 + 3, Y + 7, 3, 2); x.fillRect(X2 + 4, Y + 9, 1, 1); // a little shield
      Font.draw(x, t, X2 + 9, midY(Y + 1, 11, 8), '#ffffff', '#000', 8); }
    { const r = b ? bx + bw - Math.ceil(Font.width(String(b), 8)) - 12 : bx + bw; fontFit(x, hp + '/' + mh, (bx + r) / 2, Y - 2, r - bx - 2, '#fff4f4', '#000', 9, 'c'); } // the HP numbers stay clear of the 格擋 badge
    const CL = KD.CLASSES[this.cls] || {}; Font.draw(x, CL.n || '', bx, Y + 14, CL.c || '#ccc', '#000', 8); const px = this.pipX16();
    if (this.cls === 'sw') { for (let i = 0; i < 3; i++) { x.fillStyle = i < this.si ? '#8ad0ff' : '#3a3048'; x.fillRect(px + i * 6, Y + 16, 4, 5); } if (this.si > 0) Font.draw(x, '+' + KD.KP_DMG * this.si, px + 19, Y + 14, '#bfe6ff', '#000', 8); } /* 看破 */
    if (this.cls === 'rg') { const q = (this.chainN || 0) % 3; for (let i = 0; i < 3; i++) { x.fillStyle = i < q ? '#70d070' : '#3a3048'; x.fillRect(px + i * 6, Y + 16, 4, 5); } } /* 連擊 */
    const my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle, stuck = my && this.hand.every(c => !this.okK(c));
    const btn = (X, w, s, col, fn) => { x.fillStyle = my ? col : '#3a3040'; x.fillRect(X, Y + 1, w, 15); Font.drawC(x, s, X + w / 2, Y + 2, '#fff4e0', '#000', 9); if (my) touchRegion(X, Y + 1, w, 15, fn); };
    btn(116, 22, '道具', this.itemN ? '#3a4a44' : '#3a6a50', () => { this.tapK = { k: 'item' }; }); btn(140, 12, '逃', '#5a4a60', () => { this.tapK = { k: 'run' }; });
    btn(154, 21, '結束', stuck ? (Math.sin(fK / 5) > 0 ? '#ff9a40' : '#c86030') : '#c86030', () => { this.tapK = { k: 'end' }; }); if (stuck) { x.strokeStyle = 'rgba(255,224,112,' + (0.5 + 0.5 * Math.sin(fK / 5)).toFixed(2) + ')'; x.strokeRect(153.5, Y + 0.5, 22, 16); }
    fontFit(x, '牌庫 ' + this.pile.length, 116, Y + 15, 29, '#a8a0c0', '#000', 8); fontFit(x, '棄牌 ' + this.disc.length, W - 2, Y + 15, 29, '#a8a0c0', '#000', 8, 'r');
    if (my) { touchRegion(114, Y + 16, 30, 9, () => { this.tapK = { k: 'pile', w: 'pile' }; }); touchRegion(146, Y + 16, 30, 9, () => { this.tapK = { k: 'pile', w: 'disc' }; }); } }; }
// cards on the move: a played card flies up and fades; the hand discards into the pile at the end of the turn
BPK.ghostK = function (c, x0, y0, x1, y1, s1, T, fade = true) { (this.ghosts = this.ghosts || []).push({ c, x0, y0, x1, y1, s1, T, t: 0, fade }); };
BPK.handPos = function (i, n) { const cw = KD.BL().cw, span = W - 8 - cw, step = n > 1 ? Math.min(cw + 2, span / (n - 1)) : 0, X0 = Math.round((W - (step * (n - 1) + cw)) / 2); return { x: Math.round(X0 + i * step), step }; };
{ const _pk = BPK.playK; BPK.playK = function (i, tgt) { const c = this.hand[i]; if (c) { const LB = KD.BL(); this.ghostK(c, c.ax ?? this.handPos(i, this.hand.length).x, (c.ay ?? LB.handY) - 10, W / 2 - 21, 92 + Math.round(LB.E * 0.5), 1.3, 14); } return _pk.call(this, i, tgt); }; }
{ const _dn = BPK.drawN; BPK.drawN = function (n) { const h0 = this.hand.length; _dn.call(this, n); const f = this.fK || 0; for (let i = h0, k = 0; i < this.hand.length; i++, k++) { const c = this.hand[i]; c.ax = 4; c.ay = H - 20; c.at = f + k * 3; } }; }
BPK.discardAnim = function () { const LB = KD.BL(); this.hand.forEach((c, i) => this.ghostK(c, c.ax ?? this.handPos(i, this.hand.length).x, c.ay ?? LB.handY, W - 18, LB.hudY + 10, 0.4, 10)); };
{ const _dr = BPK.draw; BPK.draw = function (x) { _dr.call(this, x); if (!this.k14) return; this.fK = (this.fK || 0) + 1; this.handK(x);
    for (const g of this.ghosts || []) { const k = Math.min(1, ++g.t / g.T), e = 1 - Math.pow(1 - k, 3), s = 1 + (g.s1 - 1) * e, X = lerp(g.x0, g.x1, e), Y = lerp(g.y0, g.y1, e);
      x.globalAlpha = g.fade ? Math.max(0, Math.min(1, (1 - k) * 2.2)) : 1; const LB = KD.BL(); KD.drawCard(x, g.c, Math.round(X), Math.round(Y), Math.round(LB.cw * s), Math.round(LB.ch * s), {}); x.globalAlpha = 1; }
    this.ghosts = (this.ghosts || []).filter(g => g.t < g.T);
    const N = this.note16; if (N && N.t++ < 70) { const s = N.s.length > 22 ? N.s.slice(0, 22) + '…' : N.s, w = Math.min(W - 8, Font.width(s, 9) + 12); x.globalAlpha = Math.min(1, (70 - N.t) / 12); x.fillStyle = 'rgba(10,8,20,0.85)'; const ny = KD.BL().noteY; x.fillRect((W - w) / 2, ny, w, 14); Font.drawC(x, s, W / 2, ny + 1, '#fff4d8', '#000', 9); /* v14.9: was y 40, on top of the boss plate and the monsters' intents */ x.globalAlpha = 1; } }; }
BPK.handK = function (x) { const LB = KD.BL(), n = this.hand.length, cw = LB.cw, ch = LB.ch, Y = LB.handY, my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle, f = this.fK || 0;
  const order = [...Array(n).keys()].filter(i => i !== this.sel).concat(this.sel >= 0 && this.sel < n ? [this.sel] : []);
  for (const i of order) { const c = this.hand[i], P = this.handPos(i, n), up = i === this.sel ? 10 : 0; if (c.at != null && f < c.at) continue;
    c.ax = c.ax == null ? P.x : c.ax + (P.x - c.ax) * 0.35; c.ay = c.ay == null ? Y - up : c.ay + (Y - up - c.ay) * 0.35; if (Math.abs(c.ax - P.x) < 0.5) c.ax = P.x; if (Math.abs(c.ay - (Y - up)) < 0.5) c.ay = Y - up;
    const st = P.step, l0 = i === this.sel + 1 && this.sel >= 0 ? cw - st : 0, r0 = i === n - 1 || i === this.sel ? cw : st; // the strip of this card that isn't under its neighbours
    KD.drawCard(x, c, Math.round(c.ax), Math.round(c.ay), cw, ch, { dim: !this.okK(c), on: i === this.sel, visX0: i === this.sel ? 0 : Math.max(0, Math.min(l0, cw - 14)), vis: i === this.sel ? cw : Math.max(14, r0 - l0) });
    if (my) touchRegion(P.x, Y - up, i === n - 1 || i === this.sel ? cw : Math.ceil(P.step), ch, () => { this.tapK = { k: 'card', i }; }); }
  if (this.tgtMode && my) { const s = '點要打的那一隻魔物', fs = LB.tall ? 9 : 8, w = Font.width(s, fs) + 10; x.fillStyle = 'rgba(30,24,44,0.92)'; x.fillRect((W - w) / 2, LB.tgtY, w, fs + 4); Font.drawC(x, s, W / 2, LB.tgtY + (fs - 8) / 2, '#ffe8a0', '#000', fs); }
  else if (this.sel >= 0 && this.hand[this.sel]) { const c = this.hand[this.sel], C = KD.CARDS[c.id], T = KD.TYPE[C.type], K = KD.keyLines(c);
    // v14.12: the card's text sits just above the bar (on a tall screen, under the monsters instead of over them), 8〜9 size
    // v14.15: in the gap under the monsters (their feet and status row), the hint on the title line; as many lines as fit (2〜4)
    const top = Math.max(0, ...this.foes().filter(v => !v.gone).map(v => Math.round(v.foot) + (v.st && KD.chips16 && KD.chips16(v.st, false).length ? 14 : 3))) + 2;
    let fs = LB.tall ? 9 : 8, lh = fs + 2, n = Math.max(2, Math.min(4, Math.floor((LB.detB - top - 16) / lh))), D = wrap15(KD.desc(c), W - 22, fs);
    if (D.length > n && fs > 8) { fs = 8; lh = 10; n = Math.max(2, Math.min(4, Math.floor((LB.detB - top - 16) / lh))); D = wrap15(KD.desc(c), W - 22, fs); }
    D = D.slice(0, n); const ph = 15 + D.length * lh + 2, pY = LB.detB - ph;
    if (K.length && pY - 2 - (K.length * 10 + 4) >= top) { const kh = K.length * 10 + 4; x.fillStyle = 'rgba(30,24,44,0.94)'; x.fillRect(6, pY - 2 - kh, W - 12, kh); K.forEach((t, k) => fontFit(x, t, 10, pY - 2 - kh + 1 + k * 10, W - 20, '#c8c0e0', '#000', 8)); }
    x.fillStyle = 'rgba(12,8,24,0.94)'; x.fillRect(6, pY, W - 12, ph); x.fillStyle = KD.RAR[C.rar].c; x.fillRect(6, pY, W - 12, 1);
    const hint = this.tgtMode ? '點魔物出牌' : '再點一次出牌', hw = Math.ceil(Font.width(hint, 8)) + 4; Font.drawR(x, hint, W - 9, pY + 2, '#a8e0ff', '#000', 8);
    fontFit(x, KD.name(c) + '　' + KD.typeN(c) + '・' + KD.cost(c) + ' 能量', 10, pY + 1, W - 20 - hw, c.up ? '#a8ffa0' : '#fff0d0', '#000', 9);
    D.forEach((L, k) => Font.draw(x, L, 10, pY + 14 + k * lh, '#e8e4f4', '#000', fs)); }
  if (this.tgtMode && my) for (const f2 of this.foes()) { const C = this.center(f2); if (f2.id === this.tgtId) { x.strokeStyle = '#ffe070'; x.lineWidth = 1; x.strokeRect(C.x - 20, C.y - 22, 40, 44); } touchRegion(C.x - 24, C.y - 30, 48, 60, () => { this.tapK = { k: 'tgt', id: f2.id }; }); } };
// a look at the draw pile (shuffled order hidden: sorted) or the discard pile
BPK.pileView = function* (w) { const L = (w === 'disc' ? this.disc : this.pile).slice().sort((a, b) => KD.cost(a) - KD.cost(b) || (a.id < b.id ? -1 : 1)); let done = false, scroll = 0;
  const ui = { draw: x => { x.fillStyle = 'rgba(8,6,16,0.94)'; x.fillRect(0, 0, W, H); Font.drawC(x, (w === 'disc' ? '棄牌' : '牌庫') + '（' + L.length + ' 張）' + (this.exh.length ? '　消耗 ' + this.exh.length : ''), W / 2, 4, '#ffe0a0', '#000', 10);
      const per = 4, cw = 38, ch = 54, rows = Math.max(4, Math.floor((H - 40) / (ch + 4))); for (let i = 0; i < L.length; i++) { const r = Math.floor(i / per) - scroll; if (r < 0 || r > rows - 1) continue; KD.drawCard(x, L[i], 6 + (i % per) * (cw + 4), 20 + r * (ch + 4), cw, ch, {}); }
      if (scroll > 0) Font.drawC(x, '▲', W / 2, 14, '#c8a050', null, 8); if ((scroll + rows) * per < L.length) { Font.drawC(x, '▼', W / 2, H - 16, '#c8a050', null, 8); touchRegion(0, H - 20, W / 2, 20, () => { scroll++; }); }
      if (scroll > 0) touchRegion(0, 0, W, 16, () => { scroll--; }); Font.drawC(x, '關閉', W * 0.75, H - 12, '#e8e4f4', '#000', 9); touchRegion(W / 2, H - 20, W / 2, 20, () => { done = true; }); } };
  UI.push(ui); while (!done) { yield; if (Input.pressed('b') || Input.pressed('a')) done = true; if (Input.pressed('down') && (scroll + Math.max(4, Math.floor((H - 40) / 58))) * 4 < L.length) scroll++; if (Input.pressed('up') && scroll > 0) scroll--; } UI.remove(ui); Input.consume('a', 'b'); };
/* ---------- a card picture: cost, name, icon, the key numbers; the class colour along the bottom ---------- */
KD.shortL = (C, v) => { const L = C.short(v).slice(); if (C.exhaust && !L.includes('消耗') && L.length < 3) L.push('消耗'); return L; }; // v14.10: every 消耗 card says so on its face
/* v14.18 卡面＝方案 3「滿版插畫」（玩家選的：曙光冒險-卡面改版提案-方案3；換掉 v14.16 的「名字在最上面」）
   v14.19 修正（提案文件最上面的「修正」一節）：插圖一律 1 倍——大卡整張不裁（左右空的地方填卡種暗色）、小卡高 18〜20 置中裁；
   圖上只留左上角的費用圈：斬突打／火水雷方塊回到數字左邊（v14.16 的位置），卡名移到圖下面自己一行，大卡的卡種膠囊在卡名那行右邊；漸暗只剩圖的最下面 5px
   · 由上到下：卡種色帶 → 插圖 → 卡名 → 大數字（傷害金色・格擋藍色）＋「傷害／格擋」→「・易傷 2」小字 → 大卡：職業（左）・稀有度星星（右）
   · 傳說卡金框＋光、裝備卡銀框（2 px）、選到的卡黃框＋光 */
KD.C3 = { body: '#1b1e28', line: '#3a3f52', dmg: '#ffd27a', blk: '#8ec8ff', lab: '#8a90a4', sub: '#a8aec0', txt: '#c4c9d6', top: '#e8ecf4', foot: '#7a8094', off: '#3a3e4c',
  pill: { atk: '#f4907a', skl: '#9cc0f6', pow: '#f6d878' }, stars: { B: 1, T: 1, C: 1, U: 2, Q: 2, R: 3, L: 3 } };
KD.numOf = s => { const m = /^(傷害|格擋)?\s*(\d+)( ?×\d+)?$/.exec(s || ''); return m && (m[1] || m[3]) ? { lab: m[1] || '傷害', s: m[2] + (m[3] ? m[3].trim() : '') } : null; };
KD.rr3 = (x, X, Y, w, h, col) => { x.fillStyle = col; x.fillRect(X + 1, Y, w - 2, h); x.fillRect(X, Y + 1, w, h - 2); }; // a box with its corners clipped
KD.coin3 = (x, cx, cy, r, n, dim) => { x.fillStyle = '#07060c'; x.beginPath(); x.arc(cx, cy, r + 1, 0, 7); x.fill(); x.fillStyle = dim ? '#6a5a40' : '#f0a030'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  x.fillStyle = '#10121a'; x.beginPath(); x.arc(cx, cy, r - 1.5, 0, 7); x.fill(); const z = r >= 6 ? 9 : 8; Font.w('700', () => Font.drawC(x, String(n), cx, midY(Math.round(cy - 6), 13, z), dim ? '#a09880' : '#ffffff', null, z)); };
KD.star3 = (x, X, Y, col) => { x.fillStyle = col; x.fillRect(X + 2, Y, 1, 1); x.fillRect(X, Y + 1, 5, 1); x.fillRect(X + 1, Y + 2, 3, 1); x.fillRect(X + 1, Y + 3, 1, 1); x.fillRect(X + 3, Y + 3, 1, 1); x.fillRect(X, Y + 4, 1, 1); x.fillRect(X + 4, Y + 4, 1, 1); };
KD.drawCard = function (x, c, X, Y, w, h, o = {}) { const C = KD.CARDS[c.id]; if (!C) return; const T = KD.TYPE[C.type], P = KD.C3, v = KD.val(c), big = w >= 46, gold = C.rar === 'L', qst = C.rar === 'Q', gear = !!c.g16, CL = KD.CLASSES[C.cls];
  const vw = Math.min(w, o.vis || w), x0 = X + (o.visX0 || 0), xr = Math.min(X + w - 3, x0 + vw - 2), foot = big && h >= 74, edge = o.on ? '#ffe070' : gold ? '#ffcf6a' : qst ? '#5ce0b8' : gear ? '#dfe4f0' : P.line;
  // the frame: a glow for the picked card and the legends, rounded corners
  if (o.on || gold) KD.rr3(x, X - 2, Y - 2, w + 4, h + 4, o.on ? 'rgba(255,224,112,0.45)' : 'rgba(255,176,64,0.4)');
  KD.rr3(x, X - 1, Y - 1, w + 2, h + 2, o.on ? '#ffe070' : '#07060c'); KD.rr3(x, X, Y, w, h, edge); KD.rr3(x, X + 1, Y + 1, w - 2, h - 2, P.body);
  // ① the type strip on top; under it the picture at its own size (1×): whole on a big card (the sides filled with the type's dark colour), centred and cropped on a small one
  const L = KD.shortL(C, v), N = KD.numOf(L[0]), rest = N ? L.slice(1) : L, nz = big ? 13 : 10, nrow = big ? 15 : 11, sh = big ? 3 : 2, nh = big ? 12 : 10;
  const ax = X + 1, aw = w - 2, ay = Y + 1 + sh, ah = big ? 32 : h >= 58 ? 20 : 18, art = KD.ART && KD.ART[c.id] && KD.ART[c.id].ok ? KD.ART[c.id] : null;
  if (gold) { const s = x.createLinearGradient(ax, 0, ax + aw, 0); s.addColorStop(0, '#ffcf6a'); s.addColorStop(0.5, '#ff9a2a'); s.addColorStop(1, '#ffe08a'); x.fillStyle = s; } else x.fillStyle = T.c; x.fillRect(ax, Y + 1, aw, sh);
  x.fillStyle = T.bg; x.fillRect(ax, ay, aw, ah); x.save(); x.beginPath(); x.rect(ax, ay, aw, ah); x.clip(); x.imageSmoothingEnabled = false;
  if (art) { const sw = Math.min(48, aw), sh2 = Math.min(32, ah); x.drawImage(art, Math.round((48 - sw) / 2), Math.round((32 - sh2) / 2), sw, sh2, Math.round(ax + (aw - sw) / 2), ay, sw, sh2); }
  else { const ic = KD.ICON[KD.iconOf(c.id)], k = big ? 2 : 1; if (ic) x.drawImage(ic, Math.round(ax + aw / 2 - 6.5 * k), Math.round(ay + (ah - 13 * k) / 2), 13 * k, 13 * k); }
  { const g = x.createLinearGradient(0, ay + ah - 5, 0, ay + ah); g.addColorStop(0, 'rgba(27,30,40,0)'); g.addColorStop(1, 'rgba(27,30,40,0.85)'); x.fillStyle = g; x.fillRect(ax, ay + ah - 5, aw, 5); } // only the last 5 px fade
  if (gold) { const s = x.createLinearGradient(ax, ay, ax + aw, ay + ah); s.addColorStop(0.3, 'rgba(255,230,160,0)'); s.addColorStop(0.45, 'rgba(255,230,160,0.22)'); s.addColorStop(0.6, 'rgba(255,230,160,0)'); x.fillStyle = s; x.fillRect(ax, ay, aw, ah); }
  x.restore(); x.fillStyle = edge; x.fillRect(ax, Y + 1, 1, 1); x.fillRect(ax + aw - 1, Y + 1, 1, 1); // the frame's rounded corners, over the strip
  if (gear && !o.on) { x.fillStyle = '#8a94ae'; x.fillRect(X + 1, Y + 1, w - 2, 1); x.fillRect(X + 1, Y + h - 2, w - 2, 1); x.fillRect(X + 1, Y + 1, 1, h - 2); x.fillRect(X + w - 2, Y + 1, 1, h - 2); }
  // ② the cost: the only thing on the picture (its top-left corner)
  const r = big ? 6 : 5.5; KD.coin3(x, X + 2 + r, ay + 1 + r, r, KD.cost(c), o.dim);
  // ③ the name under the picture, a line of its own (from the left: in the hand the left part is what shows); a big card's type on that line's right
  const nm = KD.name(c), lx = Math.max(X + 3, x0 + 2), ny0 = ay + ah; let nr = xr;
  if (big) { const s = T.n, pw = Math.ceil(Font.width(s, 8)) + 4, px = X + w - 3 - pw; KD.rr3(x, px, ny0 + 1, pw, 11, 'rgba(12,14,20,0.78)'); Font.drawC(x, s, px + pw / 2, midY(ny0 + 1, 11, 8), gold ? P.dmg : P.pill[C.type], null, 8); nr = Math.min(nr, px - 3); }
  if (ny0 + nh <= Y + h) Font.w('700', () => { const z = big && Font.width(nm, 9) <= nr - lx + 1 ? 9 : 8; fontFit(x, nm, lx, midY(ny0 + (big ? 1 : 0), nh - (big ? 1 : 0), z), Math.max(6, nr - lx + 1), c.up ? '#a8ffa0' : '#ffffff', '#000', z); });
  // ④ 斬・突・打／火・水・雷 left of the number (v14.16's place), the number and what it is; the other effects small
  let ly = ny0 + nh; const lim = Y + h - (foot ? 13 : 1), at = KD.atOf(c.id), boxOn = at && vw >= 14;
  if (N && ly + nrow <= Y + h - 1) { if (boxOn) KD.atBox(x, lx, ly + Math.round((nrow - 9) / 2), at); const nx = boxOn ? lx + 11 : lx, room = xr - nx + 1, col = N.lab === '格擋' ? P.blk : P.dmg, ny = midY(ly, nrow, nz);
    const nw = Font.w('700', () => { const q = Font.width(N.s, nz); fontFit(x, N.s, nx, ny, room, col, '#000', nz); return Math.min(q, room); });
    if (nw + 2 + Font.width(N.lab, 8) <= room) Font.draw(x, N.lab, nx + nw + 2, ny + (big ? 2 : 1), P.lab, null, 8); ly += nrow; }
  rest.forEach((s, k) => { const first = !N && k === 0, box = first && boxOn, lh = box ? 11 : 9; if (ly + lh > lim) return; if (box) KD.atBox(x, lx, ly + 1, at);
    const tx = box ? lx + 11 : lx, room = xr - tx + 1, t = N && Font.width('・' + s, 8) <= room ? '・' + s : s; fontFit(x, t, tx, midY(ly, lh, 8), room, first ? P.top : N ? P.sub : P.txt, '#000', 8); ly += lh; });
  // ⑤ a big card's foot: the class on the left, the rarity in stars on the right
  if (foot) { const fy = Y + h - 12; x.fillStyle = '#2a2e3c'; x.fillRect(X + 3, fy, w - 6, 1);
    Font.draw(x, gear ? '裝備' : C.cls === 'nt' ? (qst ? '任務' : '通用') : CL ? CL.n : '', X + 3, midY(fy + 1, 10, 8), gear ? '#c8d0e0' : P.foot, null, 8);
    const n = P.stars[C.rar] || 1, rc = KD.RAR[C.rar].c; for (let i = 0; i < 3; i++) KD.star3(x, X + w - 3 - (3 - i) * 6 + 1, fy + 3, i < n ? rc : P.off); }
  if (o.dim) KD.rr3(x, X, Y, w, h, 'rgba(0,0,0,0.38)'); };
/* ---------- after a battle ---------- */
// no levels any more: experience still counts quietly (area events and some old checks read it)
BPK.gainExp = function* (amount) { const st = Game.st; if (!this.k14) return; st.exp = (st.exp || 0) + amount; while (st.lv < (typeof LV_MAX13 !== 'undefined' ? LV_MAX13 : 60) && st.exp >= expForLevel(st.lv + 1)) st.lv++; };
// gear doesn't exist any more: a dropped piece turns into gold
{ const _ls = BPK.lootShow; BPK.lootShow = function* (g, head) { if (!this.k14) return yield* _ls.call(this, g, head); const st = Game.st, G = KD.gearGold(g); st.gear = (st.gear || []).filter(q => q !== g && q.u !== g.u); st.money += G;
    Sound.sfx('item'); yield* this.msg(String(head || '').replace(/(稀有)?裝備/, G + ' G'), { hold: 18 }); }; }
{ const _v = BPK.victory; BPK.victory = function* () { const r = yield* _v.call(this); if (this.k14 && Game.st && Game.st.hp > 0) yield* KD.battleRewards(this); return r; }; }
