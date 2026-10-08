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
BPK.pipX16 = function () { const CL = KD.CLASSES[this.cls] || {}; return 30 + Math.ceil(Font.width(CL.n || '', 6)) + 3; }; // the class's pips, right after its name under the HP bar
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
KD.BL = () => { const E = bxE(), ch = E >= 60 ? 68 : E >= 24 ? 60 : 52, /* v14.15: bigger hand (was 64 / 58) */ cw = E >= 24 ? 35 : 33, handY = H - ch - 3, hudY = handY - 22; /* v14.21: the bar 27 → 22 high */
  return { E, cw, ch, handY, hudY, noteY: hudY - 15, tgtY: hudY - 30, detB: hudY - 3, tall: E >= 40 }; };
// v14.21 text centred in a box: the middle of the line sits exactly on cy (玩家：「字一定要置中」)
KD.tc = (x, s, cx, cy, col, sh, z, maxW = 999) => fontFit(x, String(s), cx, cy - 8, maxW, col, sh, z, 'c');
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
    // v14.21（玩家：「字體先縮小 然後整體ui格縮小…字一定要置中」）：22 高（原本 27），字 6〜7、每個框裡置中；頭像 20、能量球半徑 8、HP 條 9 高、按鈕 10 高
    x.fillStyle = 'rgba(10,8,20,0.7)'; x.fillRect(0, Y - 1, W, 22); x.fillStyle = '#0a0814'; x.fillRect(0, LB.handY - 3, W, H - LB.handY + 3); // the hand's backing is solid (the old panel's top edge showed through as a line)
    { const CL0 = KD.CLASSES[this.cls] || {}, st = Game.st; x.fillStyle = '#0c0814'; x.fillRect(0, Y - 1, 21, 21); x.fillStyle = '#262038'; x.fillRect(1, Y, 19, 19); x.fillStyle = CL0.c || '#8a93b3'; x.fillRect(0, Y - 1, 21, 1); // the hero's face
      if (st) { try { x.drawImage(heroFramesFor(st).down[0], 3, 2, 12, 11, 1.5, Y + 1, 18, 16.5); } catch (e) { /* no doll yet */ } } }
    { const en = this.energy, ex = 21, ey = Y + 13, mx = KD.EN + stkK(U, 'pwMax14'); /* 方案 3's orb — gold, a white ring, 「3/3」; at 0 the numbers turn light (they were dark on dark) */
      if (en) { x.fillStyle = 'rgba(240,160,48,0.4)'; x.beginPath(); x.arc(ex, ey, 9, 0, 7); x.fill(); } x.fillStyle = en ? '#ffffff' : '#8a8898'; x.beginPath(); x.arc(ex, ey, 7.6, 0, 7); x.fill();
      const g = x.createRadialGradient(ex - 2, ey - 2, 1, ex, ey, 6.5); g.addColorStop(0, en ? '#ffd27a' : '#6a6070'); g.addColorStop(0.55, en ? '#f0a030' : '#4a4252'); g.addColorStop(1, en ? '#b0600c' : '#2a2430'); x.fillStyle = g; x.beginPath(); x.arc(ex, ey, 6.5, 0, 7); x.fill();
      Font.w('700', () => { const a = String(en), b = '/' + mx, wa = Font.width(a, 8), wb = Font.width(b, 6), k = Math.min(1, 12 / (wa + wb)), x0 = ex - (wa + wb) * k / 2, tc = en ? '#2a1404' : '#f0e6d8'; x.save(); x.translate(x0, 0); x.scale(k, 1); Font.draw(x, a, 0, ey - 8, tc, null, 8); Font.draw(x, b, wa, ey - 7, tc, null, 6); x.restore(); }); }
    const bx = 30, bw = 90, hp = Math.max(0, Math.round(Hv.hp)), mh = U.max.hp; x.fillStyle = '#301018'; x.fillRect(bx, Y + 1, bw, 9); x.fillStyle = hp <= mh / 2 ? '#e05030' : '#c83838'; x.fillRect(bx, Y + 1, Math.round(bw * Math.min(1, hp / Math.max(1, mh))), 9);
    // 格擋 on the HP bar's right end
    const b = (Hv.st && Hv.st.blk15) || 0, bw2 = b ? Math.ceil(Font.width(String(b), 6)) + 10 : 0; if (b) { const X2 = bx + bw - bw2; x.strokeStyle = '#7ec8ff'; x.lineWidth = 1; x.strokeRect(bx - 0.5, Y + 0.5, bw + 1, 10);
      x.fillStyle = '#2a5aa8'; x.fillRect(X2, Y + 1, bw2, 9); x.fillStyle = '#dff0ff'; x.fillRect(X2 + 2, Y + 3, 4, 3); x.fillRect(X2 + 3, Y + 6, 2, 2); // a little shield
      KD.tc(x, b, X2 + 7 + (bw2 - 8) / 2, Y + 5.5, '#ffffff', '#000', 6); }
    Font.w('700', () => KD.tc(x, hp + '/' + mh, bx + (bw - bw2) / 2, Y + 5.5, '#fff4f4', '#000', 7, bw - bw2 - 4));
    const CL = KD.CLASSES[this.cls] || {}; Font.draw(x, CL.n || '', bx, Y + 15.5 - 8, CL.c || '#ccc', '#000', 6); const px = this.pipX16();
    if (this.cls === 'sw') { for (let i = 0; i < 3; i++) { x.fillStyle = i < this.si ? '#8ad0ff' : '#3a3048'; x.fillRect(px + i * 5, Y + 14, 3, 4); } if (this.si > 0) Font.draw(x, '+' + KD.KP_DMG * this.si, px + 16, Y + 15.5 - 8, '#bfe6ff', '#000', 6); } /* 看破 */
    if (this.cls === 'rg') { const q = (this.chainN || 0) % 3; for (let i = 0; i < 3; i++) { x.fillStyle = i < q ? '#70d070' : '#3a3048'; x.fillRect(px + i * 5, Y + 14, 3, 4); } } /* 連擊 */
    const my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle, stuck = my && this.hand.every(c => !this.okK(c));
    const btn = (X, w, s, col, fn) => { x.fillStyle = my ? col : '#3a3040'; x.fillRect(X, Y + 1, w, 10); KD.tc(x, s, X + w / 2, Y + 6, '#fff4e0', '#000', 7); if (my) touchRegion(X, Y - 1, w, 13, fn); };
    btn(123, 18, '道具', this.itemN ? '#3a4a44' : '#3a6a50', () => { this.tapK = { k: 'item' }; }); btn(143, 11, '逃', '#5a4a60', () => { this.tapK = { k: 'run' }; });
    btn(156, 19, '結束', stuck ? (Math.sin(fK / 5) > 0 ? '#ff9a40' : '#c86030') : '#c86030', () => { this.tapK = { k: 'end' }; }); if (stuck) { x.strokeStyle = 'rgba(255,224,112,' + (0.5 + 0.5 * Math.sin(fK / 5)).toFixed(2) + ')'; x.strokeRect(155.5, Y + 0.5, 20, 11); }
    KD.tc(x, '牌庫 ' + this.pile.length, 137, Y + 15.5, '#a8a0c0', '#000', 6, 28); KD.tc(x, '棄牌 ' + this.disc.length, 164, Y + 15.5, '#a8a0c0', '#000', 6, 24);
    if (my) { touchRegion(123, Y + 12, 28, 9, () => { this.tapK = { k: 'pile', w: 'pile' }; }); touchRegion(152, Y + 12, 24, 9, () => { this.tapK = { k: 'pile', w: 'disc' }; }); } }; }
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
    const N = this.note16; if (N && N.t++ < 70) { const s = N.s.length > 26 ? N.s.slice(0, 26) + '…' : N.s, w = Math.min(W - 8, Font.width(s, 7) + 10); x.globalAlpha = Math.min(1, (70 - N.t) / 12); x.fillStyle = 'rgba(10,8,20,0.85)'; const ny = Math.min(KD.BL().noteY, (this.detTop16 ?? 999) - 13); /* v14.21: above the picked card's text, not on it */ x.fillRect((W - w) / 2, ny, w, 11); KD.tc(x, s, W / 2, ny + 5.5, '#fff4d8', '#000', 7, W - 12); /* v14.9: was y 40, on top of the boss plate and the monsters' intents */ x.globalAlpha = 1; } }; }
BPK.handK = function (x) { this.detTop16 = null; const LB = KD.BL(); x.fillStyle = '#0a0814'; x.fillRect(0, LB.handY - 1, W, H - LB.handY + 1); /* v14.21: the hand's backing, drawn last (the old panel's edge and the rain used to show through) */ const n = this.hand.length, cw = LB.cw, ch = LB.ch, Y = LB.handY, my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle, f = this.fK || 0;
  const order = [...Array(n).keys()].filter(i => i !== this.sel).concat(this.sel >= 0 && this.sel < n ? [this.sel] : []);
  for (const i of order) { const c = this.hand[i], P = this.handPos(i, n), up = i === this.sel ? 10 : 0; if (c.at != null && f < c.at) continue;
    c.ax = c.ax == null ? P.x : c.ax + (P.x - c.ax) * 0.35; c.ay = c.ay == null ? Y - up : c.ay + (Y - up - c.ay) * 0.35; if (Math.abs(c.ax - P.x) < 0.5) c.ax = P.x; if (Math.abs(c.ay - (Y - up)) < 0.5) c.ay = Y - up;
    const st = P.step, l0 = i === this.sel + 1 && this.sel >= 0 ? cw - st : 0, r0 = i === n - 1 || i === this.sel ? cw : st; // the strip of this card that isn't under its neighbours
    KD.drawCard(x, c, Math.round(c.ax), Math.round(c.ay), cw, ch, { dim: !this.okK(c), on: i === this.sel, visX0: i === this.sel ? 0 : Math.max(0, Math.min(l0, cw - 14)), vis: i === this.sel ? cw : Math.max(14, r0 - l0) });
    if (my) touchRegion(P.x, Y - up, i === n - 1 || i === this.sel ? cw : Math.ceil(P.step), ch, () => { this.tapK = { k: 'card', i }; }); }
  if (this.tgtMode && my) { const s = '點要打的那一隻魔物', w = Font.width(s, 7) + 10; x.fillStyle = 'rgba(30,24,44,0.92)'; x.fillRect((W - w) / 2, LB.tgtY, w, 11); KD.tc(x, s, W / 2, LB.tgtY + 5.5, '#ffe8a0', '#000', 7); this.detTop16 = LB.tgtY; }
  else if (this.sel >= 0 && this.hand[this.sel]) { const c = this.hand[this.sel], C = KD.CARDS[c.id], T = KD.TYPE[C.type], K = KD.keyLines(c);
    // v14.12: the card's text sits just above the bar (on a tall screen, under the monsters instead of over them), 8〜9 size
    // v14.15: in the gap under the monsters (their feet and status row), the hint on the title line; as many lines as fit (2〜4)
    const top = Math.max(0, ...this.foes().filter(v => !v.gone).map(v => Math.round(v.foot) + (v.st && KD.chips16 && KD.chips16(v.st, false).length ? 14 : 3))) + 2;
    // v14.21: 7 size (was 8〜9), the title line 11 high, each line 9
    const fs = 7, lh = 9, n = Math.max(2, Math.min(4, Math.floor((LB.detB - top - 14) / lh))), D = wrap15(KD.desc(c), W - 20, fs).slice(0, n), ph = 12 + D.length * lh + 2, pY = LB.detB - ph;
    let tY = pY; if (K.length && pY - 2 - (K.length * 8 + 3) >= top) { const kh = K.length * 8 + 3; tY = pY - 2 - kh; x.fillStyle = 'rgba(30,24,44,0.94)'; x.fillRect(6, tY, W - 12, kh); K.forEach((t, k) => fontFit(x, t, 10, tY + 1.5 + k * 8 + 4 - 8, W - 20, '#c8c0e0', '#000', 6)); }
    this.detTop16 = tY; x.fillStyle = 'rgba(12,8,24,0.94)'; x.fillRect(6, pY, W - 12, ph); x.fillStyle = KD.RAR[C.rar].c; x.fillRect(6, pY, W - 12, 1);
    const hint = this.tgtMode ? '點魔物出牌' : '再點一次出牌', hw = Math.ceil(Font.width(hint, 6)) + 4; Font.drawR(x, hint, W - 9, pY + 6.5 - 8, '#a8e0ff', '#000', 6);
    { const tx = KD.atTag(x, c, 10, pY + 6.5); fontFit(x, KD.name(c) + '　' + KD.typeN(c) + '・' + KD.cost(c) + ' 能量', tx, pY + 6.5 - 8, W - 10 - hw - tx, c.up ? '#a8ffa0' : '#fff0d0', '#000', 7); } // 斬突打／火水雷 here (not on the face)
    D.forEach((L, k) => Font.draw(x, L, 10, pY + 12 + k * lh + 4.5 - 8, '#e8e4f4', '#000', fs)); }
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
/* v14.20 卡面＝玩家給的方案 3 圖（玩家：「這才是我要的ui」；換掉 v14.18 的放大 2 倍和 v14.19 的「卡名在圖下面」）
   · 上半：插圖（大卡放大到高 36〜48、左右稍裁；小卡原尺寸置中裁），頂端一條卡種色；左上費用圈；卡名壓在圖的下緣（圖往下漸暗）；大卡右上卡種膠囊
   · 下半：大數字（傷害金・格擋藍）＋「傷害／格擋」；大卡寫整句效果（傷害・格擋數字上色、易傷・力量等橘色，放不下的最後一行「…」），小卡寫「・抽 1」短句
   · 大卡最下面：職業（左）・稀有度星星（右）；斬突打／火水雷不畫在卡面（玩家選的），寫在選到卡時的說明裡（KD.atTag）
   · 傳說卡金框＋光＋斜光、裝備卡銀框（2 px）、選到黃框＋光、不能出整張變暗
   v14.21（玩家看了手機截圖：「字體先縮小…卡片文字也縮小 最重要一點 字一定要置中」）：卡面的字全部置中、縮小一號（小卡 卡名 7・數字 9・小字 6；大卡 卡名 9・數字 13・句子 7）
   v14.22（玩家：「卡片字體也縮小」）：再小一號——小卡 卡名 6・數字 8・小字 5・費用 6；大卡 卡名 8・數字 11・句子 6・卡種 6・職業 6・費用 7 */
KD.C3 = { body: '#1b1e28', line: '#33374a', dmg: '#ffd27a', blk: '#8ec8ff', kw: '#ff9a6a', lab: '#8a90a4', sub: '#a8aec0', txt: '#c4c9d6', top: '#e8ecf4', foot: '#7a8094', off: '#3a3e4c',
  pill: { atk: '#f4907a', skl: '#9cc0f6', pow: '#f6d878' }, stars: { B: 1, T: 1, C: 1, U: 2, Q: 2, R: 3, L: 3 } };
KD.numOf = s => { const m = /^(傷害|格擋)?\s*(\d+)( ?×\d+)?$/.exec(s || ''); return m && (m[1] || m[3]) ? { lab: m[1] || '傷害', s: m[2] + (m[3] ? m[3].trim() : '') } : null; };
// a box with its corners clipped (k = 1 or 2 px), drawn in bands so a see-through colour isn't laid twice
KD.rr3 = (x, X, Y, w, h, col, k = 1) => { x.fillStyle = col; for (let i = 0; i < k; i++) { x.fillRect(X + k - i, Y + i, w - 2 * (k - i), 1); x.fillRect(X + k - i, Y + h - 1 - i, w - 2 * (k - i), 1); } x.fillRect(X, Y + k, w, h - 2 * k); };
KD.coin3 = (x, cx, cy, r, n, dim) => { x.fillStyle = dim ? '#6a5a40' : '#f0a030'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.fillStyle = 'rgba(12,14,20,0.9)'; x.beginPath(); x.arc(cx, cy, r - 1.25, 0, 7); x.fill();
  const z = r >= 5.5 ? 7 : 6; Font.w('700', () => KD.tc(x, n, cx, cy, dim ? '#a09880' : '#ffffff', null, z)); };
KD.star3 = (x, X, Y, col) => { x.fillStyle = col; x.fillRect(X + 2, Y, 1, 1); x.fillRect(X, Y + 1, 5, 1); x.fillRect(X + 1, Y + 2, 3, 1); x.fillRect(X + 1, Y + 3, 1, 1); x.fillRect(X + 3, Y + 3, 1, 1); x.fillRect(X, Y + 4, 1, 1); x.fillRect(X + 4, Y + 4, 1, 1); };
// the effect sentence with its numbers and key words in colour; up to n lines, the last one ends in 「…」 when there is more
KD.KW3 = /易傷|虛弱|中毒|毒|燃燒|力量|消耗|看破|飛刀|蓄力|不能行動|定身|護盾|影縛|暗影|怒氣|狂化|連擊/g;
KD.rich3 = (x, s, cx, Y, w, n, P, z = 7, lh = 9) => { const col = new Array(s.length).fill(null); let m; const re = /(\d+)(?=\s*(?:[火水雷]屬性)?(傷害|格擋))/g;
  while ((m = re.exec(s))) for (let i = m.index; i < m.index + m[1].length; i++) col[i] = m[2] === '格擋' ? P.blk : P.dmg;
  KD.KW3.lastIndex = 0; while ((m = KD.KW3.exec(s))) for (let i = m.index; i < m.index + m[0].length; i++) col[i] = col[i] || P.kw;
  const tk = s.match(/(?:易傷|虛弱|力量|燃燒|看破|毒) ?[+\-−]?\d+|\d+ ?(?:傷害|格擋)|[0-9A-Za-z.%×+\-−~～\/]+|傷害|格擋|易傷|虛弱|力量|燃燒|消耗|看破|能量|回合|魔物|全體|頭目|屬性|./gu) || [], L = []; let cur = ''; // words and numbers aren't split across lines
  for (const t of tk) { if (cur && (t === ' ' || /^[。，、！？）」』：；…]/.test(t))) { cur += t; continue; } if (cur && Font.width(cur + t, z) > w) { L.push(cur); cur = t; } else cur += t; } if (cur) L.push(cur);
  const k = Math.min(n, L.length); let off = 0;
  for (let j = 0; j < k; j++) { let t = L[j]; const base = off; off += t.length; if (j === k - 1 && L.length > k) t = t.slice(0, -1) + '…'; const runs = []; let i = 0;
    while (i < t.length) { const c0 = t[i] === '…' ? null : col[base + i]; let e = i + 1; while (e < t.length && (t[e] === '…' ? null : col[base + e]) === c0) e++; const run = t.slice(i, e); runs.push([run, c0, c0 ? Font.w('700', () => Font.width(run, z)) : Font.width(run, z)]); i = e; }
    let X = cx - runs.reduce((a, q) => a + q[2], 0) / 2; const y = Y + j * lh + lh / 2 - 8; // each line centred
    for (const [run, c0, rw] of runs) { if (c0) Font.w('700', () => Font.draw(x, run, X, y, c0, '#000', z)); else Font.draw(x, run, X, y, P.txt, '#000', z); X += rw; } }
  return k; };
// 斬・突・打／火・水・雷 in front of a card's name in the text under a picked card (it isn't on the face); cy = the line's middle
KD.atTag = (x, c, X, cy, s = 7) => { const at = c && KD.atOf(c.id); if (!at) return X; KD.atBox(x, X + 1, Math.round(cy - s / 2), at, false, s); return X + s + 4; };
KD.drawCard = function (x, c, X, Y, w, h, o = {}) { const C = KD.CARDS[c.id]; if (!C) return; const T = KD.TYPE[C.type], P = KD.C3, v = KD.val(c), big = w >= 46, gold = C.rar === 'L', qst = C.rar === 'Q', gear = !!c.g16, CL = KD.CLASSES[C.cls];
  const vw = Math.min(w, o.vis || w), x0 = X + (o.visX0 || 0), pad = big ? 4 : 2, lx = Math.max(X + pad, x0 + 2), xr = Math.min(X + w - pad - 1, x0 + vw - 2), cx = (lx + xr + 1) / 2, room = xr - lx + 1;
  const foot = big && h >= 74, kc = big ? 2 : 1, edge = o.on ? '#ffe070' : gold ? '#ffcf6a' : qst ? '#5ce0b8' : gear ? '#dfe4f0' : P.line;
  // the frame: a glow for the picked card and the legends, rounded corners
  if (o.on || gold) KD.rr3(x, X - 2, Y - 2, w + 4, h + 4, o.on ? 'rgba(255,224,112,0.45)' : 'rgba(255,176,64,0.4)', kc);
  KD.rr3(x, X - 1, Y - 1, w + 2, h + 2, o.on ? '#ffe070' : '#07060c', kc); KD.rr3(x, X, Y, w, h, edge, kc); KD.rr3(x, X + 1, Y + 1, w - 2, h - 2, P.body, kc);
  // ① the picture on the top half (a big card: grown to 36〜48 high, its sides trimmed a little; a small one: its own size, centred), fading into the card at its foot
  const ax = X + 1, ay = Y + 1, aw = w - 2, ah = big ? Math.min(48, Math.max(36, h - 60)) : Math.max(16, Math.min(32, h - 20)), sc = big ? ah / 32 : 1, art = KD.ART && KD.ART[c.id] && KD.ART[c.id].ok ? KD.ART[c.id] : null;
  x.fillStyle = T.bg; x.fillRect(ax, ay, aw, ah); x.save(); x.beginPath(); x.rect(ax, ay, aw, ah); x.clip(); x.imageSmoothingEnabled = false;
  if (art) x.drawImage(art, Math.round(ax + (aw - 48 * sc) / 2), Math.round(ay + (ah - 32 * sc) / 2), Math.round(48 * sc), Math.round(32 * sc));
  else { const ic = KD.ICON[KD.iconOf(c.id)], k = big ? 2 : 1; if (ic) x.drawImage(ic, Math.round(ax + aw / 2 - 6.5 * k), Math.round(ay + (ah - 13 * k) / 2 - 3), 13 * k, 13 * k); }
  const fh = Math.round(ah * 0.46), g = x.createLinearGradient(0, ay + ah - fh, 0, ay + ah); g.addColorStop(0, 'rgba(27,30,40,0)'); g.addColorStop(0.6, 'rgba(27,30,40,0.85)'); g.addColorStop(1, P.body); x.fillStyle = g; x.fillRect(ax, ay + ah - fh, aw, fh);
  if (gold) { const s = x.createLinearGradient(ax, ay, ax + aw, ay + ah); s.addColorStop(0.3, 'rgba(255,230,160,0)'); s.addColorStop(0.45, 'rgba(255,230,160,0.22)'); s.addColorStop(0.6, 'rgba(255,230,160,0)'); x.fillStyle = s; x.fillRect(ax, ay, aw, ah); }
  if (gold) { const s = x.createLinearGradient(ax, 0, ax + aw, 0); s.addColorStop(0, '#ffcf6a'); s.addColorStop(0.5, '#ff9a2a'); s.addColorStop(1, '#ffe08a'); x.fillStyle = s; } else x.fillStyle = T.c; x.fillRect(ax, ay, aw, 2); x.restore();
  x.fillStyle = edge; x.fillRect(ax, ay, kc, 1); x.fillRect(ax + aw - kc, ay, kc, 1); if (kc > 1) { x.fillRect(ax, ay + 1, 1, 1); x.fillRect(ax + aw - 1, ay + 1, 1, 1); } // the rounded corners, over the picture
  if (gear && !o.on) { x.fillStyle = '#8a94ae'; x.fillRect(X + 2, Y + 1, w - 4, 1); x.fillRect(X + 2, Y + h - 2, w - 4, 1); x.fillRect(X + 1, Y + 2, 1, h - 4); x.fillRect(X + w - 2, Y + 2, 1, h - 4); }
  // ② the cost on the top-left; a big card's type on the top-right
  const r = big ? 5.5 : 4; KD.coin3(x, X + (big ? 3 : 2) + r, Y + (big ? 4 : 3) + r, r, KD.cost(c), o.dim);
  if (big) { const s = T.n, pw = Math.ceil(Font.width(s, 6)) + 5, px = X + w - 3 - pw; KD.rr3(x, px, Y + 4, pw, 9, 'rgba(12,14,20,0.75)'); KD.tc(x, s, px + pw / 2, Y + 8.5, gold ? P.dmg : P.pill[C.type], null, 6); }
  // ③ the name, centred on the picture's lower edge (v14.21: everything on the face is centred — 玩家：「字一定要置中」; in the hand it centres in the part that shows)
  const nm = KD.name(c); Font.w('700', () => { const z = big ? (Font.width(nm, 8) <= room ? 8 : 7) : 6; KD.tc(x, nm, cx, ay + ah - (big ? 6 : 5), c.up ? '#a8ffa0' : '#ffffff', '#000', z, Math.max(6, room)); });
  // ④ the big number and what it is; under it the effect: the whole sentence on a big card, short 「・抽 1」 lines on a small one
  const L = KD.shortL(C, v), ni = big ? L.findIndex(s => KD.numOf(s)) : KD.numOf(L[0]) ? 0 : -1, N = ni >= 0 ? KD.numOf(L[ni]) : null, rest = L.filter((s, k) => k !== ni), nz = big ? 11 : 8, lz = big ? 6 : 5, nrow = big ? 14 : 9; /* v14.22: one size down again (玩家：「卡片字體也縮小」) */
  let ly = ay + ah + (big ? 1 : 0); const lim = Y + h - (foot ? 13 : 1);
  if (N && ly + nrow <= Y + h - 1) { const col = N.lab === '格擋' ? P.blk : P.dmg, cy = ly + nrow / 2, nw = Font.w('700', () => Font.width(N.s, nz)), lw = Font.width(N.lab, lz), both = nw + 2 + lw <= room, tw = both ? nw + 2 + lw : Math.min(nw, room), x1 = cx - tw / 2;
    Font.w('700', () => { fontFit(x, N.s, x1, cy - 8, room, col, '#000', nz); if (both) Font.draw(x, N.lab, x1 + nw + 2, cy - 8 + (nz - lz) * 0.32, P.lab, null, lz); }); ly += nrow; }
  if (big) { const n = Math.floor((lim - ly) / 8); if (n > 0) { x.save(); x.beginPath(); x.rect(X + 1, ly, w - 2, n * 8 + 2); x.clip(); KD.rich3(x, KD.desc(c), X + w / 2, ly, w - 2 * pad - 2, n, P, 6, 8); x.restore(); } }
  else rest.forEach((s, k) => { if (ly + 6 > lim) return; const first = !N && k === 0, t = N && Font.width('・' + s, 5) <= room ? '・' + s : s; Font.w('700', () => KD.tc(x, t, cx, ly + 3, first ? P.top : N ? P.sub : P.txt, '#000', 5, room)); ly += 6; });
  // ⑤ a big card's foot: the class on the left, the rarity in stars on the right
  if (foot) { const fy = Y + h - 11; x.fillStyle = '#262935'; x.fillRect(X + pad, fy, w - 2 * pad, 1);
    Font.w('700', () => Font.draw(x, gear ? '裝備' : C.cls === 'nt' ? (qst ? '任務' : '通用') : CL ? CL.n : '', X + pad, fy + 5 - 8, gear ? '#c8d0e0' : P.foot, null, 6));
    const n = P.stars[C.rar] || 1, rc = KD.RAR[C.rar].c; for (let i = 0; i < 3; i++) KD.star3(x, X + w - pad - (3 - i) * 6 + 1, fy + 3, i < n ? rc : P.off); }
  if (o.dim) KD.rr3(x, X, Y, w, h, 'rgba(0,0,0,0.38)', kc); };
/* ---------- after a battle ---------- */
// no levels any more: experience still counts quietly (area events and some old checks read it)
BPK.gainExp = function* (amount) { const st = Game.st; if (!this.k14) return; st.exp = (st.exp || 0) + amount; while (st.lv < (typeof LV_MAX13 !== 'undefined' ? LV_MAX13 : 60) && st.exp >= expForLevel(st.lv + 1)) st.lv++; };
// gear doesn't exist any more: a dropped piece turns into gold
{ const _ls = BPK.lootShow; BPK.lootShow = function* (g, head) { if (!this.k14) return yield* _ls.call(this, g, head); const st = Game.st, G = KD.gearGold(g); st.gear = (st.gear || []).filter(q => q !== g && q.u !== g.u); st.money += G;
    Sound.sfx('item'); yield* this.msg(String(head || '').replace(/(稀有)?裝備/, G + ' G'), { hold: 18 }); }; }
{ const _v = BPK.victory; BPK.victory = function* () { const r = yield* _v.call(this); if (this.k14 && Game.st && Game.st.hp > 0) yield* KD.battleRewards(this); return r; }; }
