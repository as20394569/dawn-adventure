/* ===================== v14.0 卡組職業：戰鬥畫面 =====================
   沿用原本的戰鬥畫面（魔物圖、特效、跳字、魔物頭上的意圖），下方換成手牌。
   · 每回合 3 能量、抽 5 張（手牌上限 10）；點一張卡看說明，再點一次出牌；打單體的卡再點要打的魔物
   · 出完牌按「結束」，魔物才行動；格擋到你下一回合開始時消失
   · 道具不花能量，每回合 1 次（v14.6）；可以逃跑（頭目戰不行） */
const BPK = Battle.prototype;
const stkH = (b, id) => stkK(b.core.byId.H, id);
{ const _main = BPK.main; BPK.main = function* () { if (KD.on(this.core) && !this.run15) this.initK(); return yield* _main.call(this); }; }
BPK.initK = function () { const st = Game.st, core = this.core, H = core.byId.H; this.k14 = true; core.data.cb14 = this; this.cls = KD.clsKey(st);
  this.pile = shuffle15(KD.deck(st).map(c => ({ ...c })), () => core.rng.next()); this.hand = []; this.disc = []; this.exh = [];
  Object.assign(this, { energy: 0, si: 0, nextDraw: 0, nextEn: 0, turnR: 0, sel: -1, tgtMode: 0, tapK: null, cardsN: 0, atkN: 0, sklN: 0, fillSi: 0, twice: 0, dupNext: 0, fb: 0, dealt: 0, turns: 0, masterN: 0 });
  const ids = new Set(['k14_end']); for (const id in KD.CARDS) ids.add('k14_' + id); H.skills = [...ids]; };
BPK.Hu = function () { return this.core.byId.H; };
// v14.7 (玩家：「戰鬥時怪物消失」): cards run inside the core before their events are played, so a full sync() here hid a monster the moment
// a card killed it — it vanished while the card was still flying, the hit landed on empty ground, then it popped back to fall over.
// Mid-action syncs now leave who is gone to the faint / flee animations (play() still does the full sync afterwards).
BPK.syncK = function () { const keep = []; for (const id in this.views) { const v = this.views[id]; keep.push([v, v.gone, v.alpha, v.plateA]); }
  this.sync(); for (const [v, g, a, pa] of keep) { v.gone = g; v.alpha = a; v.plateA = pa; } };
BPK.addSi = function (n) { this.si = Math.min(3, this.si + n); this.siGain = (this.siGain || 0) + n; };
BPK.drawN = function (n) { for (let i = 0; i < n; i++) { if (this.hand.length >= KD.HAND) break; if (!this.pile.length) { if (!this.disc.length) break; this.pile = shuffle15(this.disc, () => this.core.rng.next()); this.disc = []; } this.hand.push(this.pile.pop()); } };
BPK.addHand = function (id, up) { if (this.hand.length < KD.HAND) this.hand.push({ id, up: up ? 1 : 0 }); else this.disc.push({ id, up: up ? 1 : 0 }); };
BPK.copyBest = function () { const L = this.hand.filter(c => KD.CARDS[c.id].rar !== 'T'); if (!L.length) return; const c = L.sort((a, b) => KD.cost(b) - KD.cost(a))[0]; this.addHand(c.id, c.up); };
BPK.gainMaxHp = function (n) { const st = Game.st, K = KD.state(st); K.hpPlus = (K.hpPlus || 0) + n; const H = this.Hu(); H.max.hp += n; H.res.hp += n; this.noteK('最大 HP +' + n + '！'); };
BPK.noteK = function (s) { this.note16 = { s: String(s), t: 0 }; };
/* ---------- the start of the hero's turn ---------- */
BPK.startTurnK = function () { const core = this.core, H = this.Hu(), notes = []; this.turns++;
  this.energy = KD.EN + this.nextEn + stkK(H, 'pwMax14'); this.nextEn = 0; Object.assign(this, { cardsN: 0, atkN: 0, sklN: 0, tgtMode: 0, sel: -1, twice: 0, dupNext: 0, phantomUsed: 0, itemN: 0 });
  if (stkK(H, 'blk15')) H.statuses = H.statuses.filter(s => s.id !== 'blk15');
  const g = stkK(H, 'pwGuard15') + stkK(H, 'pwRock14'); if (g) KD.block(core, H, g);
  const k = stkK(H, 'pwKindle14'); if (k) for (const t of core.alive('B')) KD.add(core, H, t, 'burn14', k);
  const vic = stkK(H, 'pwVictor14'); if (vic) { kLose(this, core, vic); this.energy++; } /* v14.10: 失去 HP 也觸發狂暴；1 HP 時一樣給能量 */
  const A = KD.ailments(core, H); if (A.en) { this.energy = Math.max(0, this.energy - A.en); notes.push(...A.out); }
  this.silenced = core.hasStatus(H, 'silence14'); if (this.silenced) notes.push('被沉默了：不能用技能卡');
  this.drawN(KD.DRAW + this.nextDraw + stkK(H, 'pwMoon14') + (this.turns === 1 && this.cls === 'rg' ? 2 : 0)); this.nextDraw = 0;
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
  if (C.type !== 'pow') (C.exhaust ? this.exh : this.disc).push(c); this.core.data.card14Now = c; this.core.data.skill14 = 'k14_' + c.id; Sound.sfx('select');
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
  let times = 1; if (C.type === 'atk' && c.id !== 'mg_meteorHit') { if (this.twice) { times = 2; this.twice = 0; } if (stkK(H, 'pwPhantom14') && !this.phantomUsed) { times++; this.phantomUsed = 1; } }
  if (this.dupNext && C.type !== 'pow' && c.id !== 'lg_crystal') { times++; this.dupNext = 0; }
  this.fb = 0; if (C.type === 'atk') { if (this.cls === 'bk' && (H.res.hp <= H.max.hp / 2 || stkK(H, 'pwAsura14'))) this.fb += 3; const nx = stkK(H, 'nxa14'); if (nx) { this.fb += nx; core.removeStatus(H, 'nxa14', 'used'); } }
  const si2 = this.cls === 'sw' && C.type === 'atk' && this.si >= 3; core.data.si2 = si2; this.dealt = 0; this.siGain = 0; this.fbDone = new Set();
  for (let k = 0; k < times; k++) { if (!core.isUp(H) || !core.alive('B').length) break; C.run(this, core, tg, v); if (C.tg === 'all') tg = core.alive('B'); }
  core.data.si2 = false; this.fb = 0; this.fbDone = null;
  if (C.type === 'atk') { this.atkN++; if (this.cls === 'sw') { if (si2) this.si = Math.min(3, this.siGain); else this.addSi(1); } /* 燕返 used as the ×2 card keeps its own 劍意 +1 */ if (this.fillSi) { this.si = 3; this.fillSi = 0; }
    const m = stkK(H, 'pwMaster15'); if (m) this.masterN = (this.masterN || 0) + 1; if (m && this.masterN % 3 === 0) { /* counts attacks since the power was played, across turns */ this.drawN(m); this.energy += m; this.noteK('劍聖之心：抽 ' + m + '、能量 +' + m); }
    const bl = stkK(H, 'pwBlood14'); if (bl && this.dealt > 0) KD.heal(core, H, Math.max(1, Math.round(this.dealt * bl / 100))); }
  if (C.type === 'skl') { this.sklN++; if (this.cls === 'mg' && this.sklN === 1) this.drawN(1); const s = stkK(H, 'pwStatic14'); if (s) { const t = kRand(core); if (t) KD.hit(core, H, t, s, { el: '雷', cat: '特' }); } }
  if (C.rar !== 'T') this.cardsN++; this.syncK(); };
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
const HK = H;
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
  [/燃燒/, '燃燒：回合結束失去等同層數的 HP，不會減少。'], [/力量/, '力量：每段傷害 +1（每層）。'], [/消耗/, '消耗：打出後這場戰鬥不會再抽到。'], [/劍意/, '劍意：打出 3 張攻擊卡後，下一張攻擊 ×2。'],
  [/飛刀/, '飛刀：0 費、4 傷害、消耗的小刀卡。'], [/蓄力/, '蓄力：下回合開始才發動。'], [/不能行動|定身/, '不能行動：這回合魔物什麼都不做。'], [/護盾/, '護盾：魔物身上的盾，會先擋下傷害。'], [/隨機/, '隨機：每一下各自挑一隻魔物打。'], [/^能力：/, '能力卡：打出後一直生效到戰鬥結束。']];
KD.keyLines = c => { const d = KD.desc(c), out = []; for (const [re, t] of KD.KEYS) if (re.test(d)) out.push(t); return out.slice(0, 2); };
{ const _dbh = BPK.drawBoxH; BPK.drawBoxH = function (x) { if (!this.k14) return _dbh.call(this, x); const Hv = this.H, U = this.Hu(); if (!Hv || !U) return; const Y = 176, fK = this.fK || 0;
    x.fillStyle = 'rgba(10,8,20,0.62)'; x.fillRect(0, Y - 2, W, 27); x.fillStyle = 'rgba(10,8,20,0.92)'; x.fillRect(0, 201, W, HK - 201);
    const en = this.energy; x.fillStyle = '#2a1c08'; x.beginPath(); x.arc(11, Y + 9, 9, 0, 7); x.fill(); x.fillStyle = en ? '#ffb030' : '#6a5030'; x.beginPath(); x.arc(11, Y + 9, 7.5, 0, 7); x.fill(); Font.drawC(x, String(en), 11, Y, '#1a0c00', null, 11);
    const bx = 23, bw = 70, hp = Math.max(0, Math.round(Hv.hp)), mh = U.max.hp; x.fillStyle = '#301018'; x.fillRect(bx, Y + 1, bw, 11); x.fillStyle = hp <= mh / 2 ? '#e05030' : '#c83838'; x.fillRect(bx, Y + 1, Math.round(bw * Math.min(1, hp / Math.max(1, mh))), 11);
    Font.drawC(x, hp + '/' + mh, bx + bw / 2, Y - 2, '#fff4f4', '#000', 9);
    const b = (Hv.st && Hv.st.blk15) || 0; if (b) { x.drawImage(KD.ICON.shield, bx + bw + 1, Y); Font.drawC(x, String(b), bx + bw + 21, Y - 2, '#bfe0ff', '#000', 9); }
    const CL = KD.CLASSES[this.cls] || {}; Font.draw(x, CL.n || '', bx, Y + 14, CL.c || '#ccc', '#000', 7);
    if (this.cls === 'sw') { for (let i = 0; i < 3; i++) { x.fillStyle = i < this.si ? (this.si >= 3 ? '#ffe070' : '#ff9a40') : '#3a3048'; x.fillRect(bx + 26 + i * 6, Y + 16, 4, 5); } if (this.si >= 3) Font.draw(x, '×2', bx + 46, Y + 14, '#ffe070', '#000', 7); }
    const my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle, stuck = my && this.hand.every(c => !this.okK(c));
    const btn = (X, w, s, col, fn) => { x.fillStyle = my ? col : '#3a3040'; x.fillRect(X, Y + 1, w, 15); Font.drawC(x, s, X + w / 2, Y + 2, '#fff4e0', '#000', 9); if (my) touchRegion(X, Y + 1, w, 15, fn); };
    btn(116, 22, '道具', this.itemN ? '#3a4a44' : '#3a6a50', () => { this.tapK = { k: 'item' }; }); btn(140, 12, '逃', '#5a4a60', () => { this.tapK = { k: 'run' }; });
    btn(154, 21, '結束', stuck ? (Math.sin(fK / 5) > 0 ? '#ff9a40' : '#c86030') : '#c86030', () => { this.tapK = { k: 'end' }; }); if (stuck) { x.strokeStyle = 'rgba(255,224,112,' + (0.5 + 0.5 * Math.sin(fK / 5)).toFixed(2) + ')'; x.strokeRect(153.5, Y + 0.5, 22, 16); }
    Font.draw(x, '牌庫 ' + this.pile.length, 116, Y + 15, '#a8a0c0', '#000', 7); Font.drawR(x, '棄牌 ' + this.disc.length, W - 2, Y + 15, '#a8a0c0', '#000', 7);
    if (my) { touchRegion(114, Y + 16, 30, 9, () => { this.tapK = { k: 'pile', w: 'pile' }; }); touchRegion(146, Y + 16, 30, 9, () => { this.tapK = { k: 'pile', w: 'disc' }; }); } }; }
// cards on the move: a played card flies up and fades; the hand discards into the pile at the end of the turn
BPK.ghostK = function (c, x0, y0, x1, y1, s1, T, fade = true) { (this.ghosts = this.ghosts || []).push({ c, x0, y0, x1, y1, s1, T, t: 0, fade }); };
BPK.handPos = function (i, n) { const cw = 32, span = W - 8 - cw, step = n > 1 ? Math.min(cw + 2, span / (n - 1)) : 0, X0 = Math.round((W - (step * (n - 1) + cw)) / 2); return { x: Math.round(X0 + i * step), step }; };
{ const _pk = BPK.playK; BPK.playK = function (i, tgt) { const c = this.hand[i]; if (c) this.ghostK(c, c.ax ?? this.handPos(i, this.hand.length).x, (c.ay ?? 204) - 10, W / 2 - 21, 92, 1.3, 14); return _pk.call(this, i, tgt); }; }
{ const _dn = BPK.drawN; BPK.drawN = function (n) { const h0 = this.hand.length; _dn.call(this, n); const f = this.fK || 0; for (let i = h0, k = 0; i < this.hand.length; i++, k++) { const c = this.hand[i]; c.ax = 4; c.ay = 236; c.at = f + k * 3; } }; }
BPK.discardAnim = function () { this.hand.forEach((c, i) => this.ghostK(c, c.ax ?? this.handPos(i, this.hand.length).x, c.ay ?? 204, W - 18, 186, 0.4, 10)); };
{ const _dr = BPK.draw; BPK.draw = function (x) { _dr.call(this, x); if (!this.k14) return; this.fK = (this.fK || 0) + 1; this.handK(x);
    for (const g of this.ghosts || []) { const k = Math.min(1, ++g.t / g.T), e = 1 - Math.pow(1 - k, 3), s = 1 + (g.s1 - 1) * e, X = lerp(g.x0, g.x1, e), Y = lerp(g.y0, g.y1, e);
      x.globalAlpha = g.fade ? Math.max(0, Math.min(1, (1 - k) * 2.2)) : 1; KD.drawCard(x, g.c, Math.round(X), Math.round(Y), Math.round(32 * s), Math.round(50 * s), {}); x.globalAlpha = 1; }
    this.ghosts = (this.ghosts || []).filter(g => g.t < g.T);
    const N = this.note16; if (N && N.t++ < 70) { const s = N.s.length > 22 ? N.s.slice(0, 22) + '…' : N.s, w = Math.min(W - 8, Font.width(s, 9) + 12); x.globalAlpha = Math.min(1, (70 - N.t) / 12); x.fillStyle = 'rgba(10,8,20,0.85)'; x.fillRect((W - w) / 2, 157, w, 14); Font.drawC(x, s, W / 2, 158, '#fff4d8', '#000', 9); /* v14.9: was y 40, on top of the boss plate and the monsters' intents */ x.globalAlpha = 1; } }; }
BPK.handK = function (x) { const n = this.hand.length, cw = 32, ch = 50, Y = 204, my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle, f = this.fK || 0;
  const order = [...Array(n).keys()].filter(i => i !== this.sel).concat(this.sel >= 0 && this.sel < n ? [this.sel] : []);
  for (const i of order) { const c = this.hand[i], P = this.handPos(i, n), up = i === this.sel ? 10 : 0; if (c.at != null && f < c.at) continue;
    c.ax = c.ax == null ? P.x : c.ax + (P.x - c.ax) * 0.35; c.ay = c.ay == null ? Y - up : c.ay + (Y - up - c.ay) * 0.35; if (Math.abs(c.ax - P.x) < 0.5) c.ax = P.x; if (Math.abs(c.ay - (Y - up)) < 0.5) c.ay = Y - up;
    KD.drawCard(x, c, Math.round(c.ax), Math.round(c.ay), cw, ch, { dim: !this.okK(c), on: i === this.sel });
    if (my) touchRegion(P.x, Y - up, i === n - 1 || i === this.sel ? cw : Math.ceil(P.step), ch, () => { this.tapK = { k: 'card', i }; }); }
  if (this.tgtMode && my) { const s = '點要打的那一隻魔物', w = Font.width(s, 8) + 10; x.fillStyle = 'rgba(30,24,44,0.92)'; x.fillRect((W - w) / 2, 142, w, 12); Font.drawC(x, s, W / 2, 142, '#ffe8a0', '#000', 8); }
  else if (this.sel >= 0 && this.hand[this.sel]) { const c = this.hand[this.sel], C = KD.CARDS[c.id], T = KD.TYPE[C.type], K = KD.keyLines(c);
    if (K.length) { const kh = K.length * 10 + 4; x.fillStyle = 'rgba(30,24,44,0.94)'; x.fillRect(8, 122 - kh, W - 16, kh); K.forEach((t, k) => Font.draw(x, t, 12, 122 - kh + 1 + k * 10, '#c8c0e0', '#000', 7)); }
    x.fillStyle = 'rgba(12,8,24,0.94)'; x.fillRect(8, 124, W - 16, 48); x.fillStyle = KD.RAR[C.rar].c; x.fillRect(8, 124, W - 16, 1);
    Font.draw(x, KD.name(c) + '　' + KD.typeN(c) + '・' + KD.cost(c) + ' 能量', 12, 125, c.up ? '#a8ffa0' : '#fff0d0', '#000', 9);
    wrap15(KD.desc(c), W - 26, 8).slice(0, 3).forEach((L, k) => Font.draw(x, L, 12, 137 + k * 10, '#e8e4f4', '#000', 8));
    Font.drawR(x, this.tgtMode ? '點魔物出牌' : '再點一次出牌', W - 12, 163, '#a8e0ff', '#000', 7); }
  if (this.tgtMode && my) for (const f2 of this.foes()) { const C = this.center(f2); if (f2.id === this.tgtId) { x.strokeStyle = '#ffe070'; x.lineWidth = 1; x.strokeRect(C.x - 20, C.y - 22, 40, 44); } touchRegion(C.x - 24, C.y - 30, 48, 60, () => { this.tapK = { k: 'tgt', id: f2.id }; }); } };
// a look at the draw pile (shuffled order hidden: sorted) or the discard pile
BPK.pileView = function* (w) { const L = (w === 'disc' ? this.disc : this.pile).slice().sort((a, b) => KD.cost(a) - KD.cost(b) || (a.id < b.id ? -1 : 1)); let done = false, scroll = 0;
  const ui = { draw: x => { x.fillStyle = 'rgba(8,6,16,0.94)'; x.fillRect(0, 0, W, HK); Font.drawC(x, (w === 'disc' ? '棄牌' : '牌庫') + '（' + L.length + ' 張）' + (this.exh.length ? '　消耗 ' + this.exh.length : ''), W / 2, 4, '#ffe0a0', '#000', 10);
      const per = 4, cw = 38, ch = 54; for (let i = 0; i < L.length; i++) { const r = Math.floor(i / per) - scroll; if (r < 0 || r > 3) continue; KD.drawCard(x, L[i], 6 + (i % per) * (cw + 4), 20 + r * (ch + 4), cw, ch, {}); }
      if (scroll > 0) Font.drawC(x, '▲', W / 2, 14, '#c8a050', null, 8); if ((scroll + 4) * per < L.length) { Font.drawC(x, '▼', W / 2, 240, '#c8a050', null, 8); touchRegion(0, 236, W / 2, 20, () => { scroll++; }); }
      if (scroll > 0) touchRegion(0, 0, W, 16, () => { scroll--; }); Font.drawC(x, '關閉', W * 0.75, 244, '#e8e4f4', '#000', 9); touchRegion(W / 2, 236, W / 2, 20, () => { done = true; }); } };
  UI.push(ui); while (!done) { yield; if (Input.pressed('b') || Input.pressed('a')) done = true; if (Input.pressed('down') && (scroll + 4) * 4 < L.length) scroll++; if (Input.pressed('up') && scroll > 0) scroll--; } UI.remove(ui); Input.consume('a', 'b'); };
/* ---------- a card picture: cost, name, icon, the key numbers; the class colour along the bottom ---------- */
KD.shortL = (C, v) => { const L = C.short(v).slice(); if (C.exhaust && !L.includes('消耗') && L.length < 3) L.push('消耗'); return L; }; // v14.10: every 消耗 card says so on its face
KD.drawCard = function (x, c, X, Y, w, h, o = {}) { const C = KD.CARDS[c.id]; if (!C) return; const T = KD.TYPE[C.type], v = KD.val(c), big = w >= 46, CL = KD.CLASSES[C.cls], gold = C.rar === 'L', qst = C.rar === 'Q', edge = gold ? '#ffb040' : qst ? '#5ce0b8' : null;
  x.fillStyle = '#0c0814'; x.fillRect(X - 1, Y - 1, w + 2, h + 2); x.fillStyle = T.bg; x.fillRect(X, Y, w, h);
  x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(X + 1, Y + 1, w - 2, Math.round(h * 0.4));
  x.fillStyle = o.on ? '#ffe070' : edge || T.c; x.fillRect(X, Y, w, 1); x.fillRect(X, Y + h - 1, w, 1); x.fillRect(X, Y, 1, h); x.fillRect(X + w - 1, Y, 1, h);
  x.fillStyle = edge || (CL ? CL.c : '#8a8a9a'); x.fillRect(X + 2, Y + h - 3, w - 4, 1);
  x.fillStyle = KD.RAR[C.rar].c; x.fillRect(X + w - 4, Y + 2, 2, 2);
  const art = KD.ART && KD.ART[c.id] && KD.ART[c.id].ok ? KD.ART[c.id] : null;
  if (art) { // v14.2 the card's picture along the top (the hand shows its middle 30×18; big cards the whole 48×32)
    const aw = Math.min(48, w - 2), ah = big ? 32 : w >= 36 ? 20 : 16, sm = !big && w < 36; x.drawImage(art, Math.round((48 - aw) / 2), Math.round((32 - ah) / 2), aw, ah, X + Math.round((w - aw) / 2), Y + 1, aw, ah);
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(X + 1, Y + ah + 1, w - 2, 1);
    const r = big ? 6 : 5; x.fillStyle = '#0c0814'; x.beginPath(); x.arc(X + r, Y + r, r, 0, 7); x.fill(); x.fillStyle = o.dim ? '#6a5a40' : '#ffb030'; x.beginPath(); x.arc(X + r, Y + r, r - 1, 0, 7); x.fill(); Font.drawC(x, String(KD.cost(c)), X + r, Y + r - 8, '#1a0c00', null, big ? 9 : 8);
    const nm = KD.name(c); let fz = big ? 9 : 8; while (fz > 6 && Font.width(nm, fz) > w - 3) fz--; const ny = Y + ah + 1; Font.drawC(x, nm, X + w / 2, ny, c.up ? '#a8ffa0' : '#fff4e0', '#000', fz);
    const ly = ny + (big ? 11 : 9), SL = KD.shortL(C, v), st3 = big ? 10 : sm ? 8 : 9, yMax = Y + h - (big && h >= 74 ? 8 : 3); SL.forEach((s, k) => { if (k >= 2 && ly + k * st3 + 12 > yMax) return; /* a 3rd line only where it fits (the big card) */ let q = big ? 8 : 7; while (q > 6 && Font.width(s, q) > w - 3) q--; Font.drawC(x, s, X + w / 2, ly + k * st3, '#e8e4f4', '#000', q); });
    if (big && h >= 74) Font.drawC(x, C.cls === 'nt' ? (gold ? '傳說' : qst ? '任務' : '共通') : CL ? CL.n : '', X + w / 2, Y + h - 12, edge || (CL ? CL.c : '#c8c8d8'), '#000', 7);
    if (o.dim) { x.fillStyle = 'rgba(0,0,0,0.38)'; x.fillRect(X, Y, w, h); } return; }
  const r = big ? 6 : 5; x.fillStyle = '#0c0814'; x.beginPath(); x.arc(X + r, Y + r, r, 0, 7); x.fill(); x.fillStyle = o.dim ? '#6a5a40' : '#ffb030'; x.beginPath(); x.arc(X + r, Y + r, r - 1, 0, 7); x.fill(); Font.drawC(x, String(KD.cost(c)), X + r, Y + r - 8, '#1a0c00', null, big ? 9 : 8);
  const nm = KD.name(c); let fz = big ? 9 : 8; while (fz > 6 && Font.width(nm, fz) > w - 4) fz--; const sm = !big && w < 36, ny = Y + (big ? 12 : sm ? 8 : 9); Font.drawC(x, nm, X + w / 2, ny, c.up ? '#a8ffa0' : '#fff4e0', '#000', fz);
  const z = big && h >= 74 ? 2 : 1, ic = KD.ICON[KD.iconOf(c.id)], iy = ny + (big ? 11 : sm ? 8 : 9); if (ic) x.drawImage(ic, Math.round(X + w / 2 - 6.5 * z), iy, 13 * z, 13 * z);
  const ly = iy + 13 * z + (big ? 1 : 0), SL = KD.shortL(C, v), st3 = big ? 10 : sm ? 8 : 9, yMax = Y + h - (big && h >= 74 ? 8 : 3); SL.forEach((s, k) => { if (k >= 2 && ly + k * st3 + 12 > yMax) return; /* a 3rd line only where it fits (the big card) */ let q = big ? 8 : 7; while (q > 6 && Font.width(s, q) > w - 3) q--; Font.drawC(x, s, X + w / 2, ly + k * st3, '#e8e4f4', '#000', q); });
  if (big && h >= 74) Font.drawC(x, C.cls === 'nt' ? (gold ? '傳說' : qst ? '任務' : '共通') : CL ? CL.n : '', X + w / 2, Y + h - 12, edge || (CL ? CL.c : '#c8c8d8'), '#000', 7);
  if (o.dim) { x.fillStyle = 'rgba(0,0,0,0.38)'; x.fillRect(X, Y, w, h); } };
/* ---------- after a battle ---------- */
// no levels any more: experience still counts quietly (area events and some old checks read it)
BPK.gainExp = function* (amount) { const st = Game.st; if (!this.k14) return; st.exp = (st.exp || 0) + amount; while (st.lv < (typeof LV_MAX13 !== 'undefined' ? LV_MAX13 : 60) && st.exp >= expForLevel(st.lv + 1)) st.lv++; };
// gear doesn't exist any more: a dropped piece turns into gold
{ const _ls = BPK.lootShow; BPK.lootShow = function* (g, head) { if (!this.k14) return yield* _ls.call(this, g, head); const st = Game.st, G = KD.gearGold(g); st.gear = (st.gear || []).filter(q => q !== g && q.u !== g.u); st.money += G;
    Sound.sfx('item'); yield* this.msg(String(head || '').replace(/(稀有)?裝備/, G + ' G'), { hold: 18 }); }; }
{ const _v = BPK.victory; BPK.victory = function* () { const r = yield* _v.call(this); if (this.k14 && Game.st && Game.st.hp > 0) yield* KD.battleRewards(this); return r; }; }
