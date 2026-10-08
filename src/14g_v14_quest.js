/* ===================== v14.2 任務卡 =====================
   玩家選的卡組變化有一項是「頭目／任務專屬卡」：頭目有傳說卡，任務原本只給三選一。
   · 每個有名字的任務報酬（劇情、支線、隱藏地點、告示板的獨家報酬）都變成一張同名的「任務卡」，每張只有一張
   · 完成任務時（看旗標，不看拿到的裝備）送卡；同名的舊裝備直接收走，不再換成三選一
   · 舊存檔：已經完成的任務，進地圖時一次補發
   · 任務卡和傳說卡屬於主角：轉職到別的職業，那副牌組也會有（刪掉的不會再出現） */
/* ---------- new statuses ---------- */
KD.st('nxb14', '下回合格擋', 'def', '下回合開始時獲得格擋');
KD.st('safe14', '平安', 'def', '到你的下回合開始前不會受到傷害', { nostk: 1 });
for (const [id, n, k, tip] of [['pwRegen14', '月光護符', 'def', '每回合開始回復 HP'], ['pwRoyal14', '王國徽章', 'atk', '每回合開始力量增加'], ['pwScale14', '湖神鱗片', 'def', '格擋不會消失'],
  ['pwThorn14', '沙漠玫瑰', 'atk', '被攻擊時反擊'], ['pwSea14', '海神的鱗片', 'atk', '每回合能量 +1、多抽 1 張']]) KD.st(id, n, k, tip);
/* ---------- the cards ---------- */
KD.qGold = (st = Game.st) => Math.max(20, Math.round(KD.gW((st && st.lv) || 1) * 0.4 / 5) * 5);
const kUndead = t => typeof famOf === 'function' && (famOf(t) || {}).n === '不死';
const KQ = (id, ...a) => { KC(id, 'nt', ...a); KD.CARDS[id].quest = 1; };
KQ('q_helm', '衛兵頭盔', 'skl', 'Q', 1, 'guard', 'self', { b: 6, x: 4 }, { b: 9, x: 6 }, v => '獲得 ' + v.b + ' 格擋；下回合開始時再獲得 ' + v.x + ' 格擋。', v => ['格擋 ' + v.b, '下回合 +' + v.x], (cb, core, tg, v) => { kBlk(cb, core, v.b); KD.add(core, cb.Hu(), cb.Hu(), 'nxb14', v.x); });
KQ('q_travel', '旅人護符', 'skl', 'Q', 0, 'focus', 'self', { c: 2 }, { c: 3 }, v => '抽 ' + v.c + ' 張。消耗。', v => ['抽 ' + v.c, '消耗'], (cb, core, tg, v) => cb.drawN(v.c), { exhaust: 1 });
KQ('q_herb', '藥師香囊', 'skl', 'Q', 0, 'heal', 'self', { h: 5 }, { h: 8 }, v => '回復 ' + v.h + ' HP。消耗。', v => ['回復 ' + v.h, '消耗'], (cb, core, tg, v) => KD.heal(core, cb.Hu(), v.h), { exhaust: 1 });
KQ('q_nora', '諾拉的緞帶', 'skl', 'Q', 1, 'holyLight', 'self', { b: 6 }, { b: 9 }, v => '獲得 ' + v.b + ' 格擋，解除自己身上的負面狀態。', v => ['格擋 ' + v.b, '解除狀態'], (cb, core, tg, v) => { const H = cb.Hu(); kBlk(cb, core, v.b);
  const m = core.majorOf(H); if (m) core.removeStatus(H, m, 'cure'); for (const k of ['weak15', 'vuln15', 'pois14', 'burn14', 'bleed15']) if (stkK(H, k)) setStk15(core, H, k, 0); });
KQ('q_sand', '砂漠彎刀', 'atk', 'Q', 1, 'w12_sandSaber', 'enemy', { d: 4, x: 1 }, { d: 5, x: 2 }, v => '造成 ' + v.d + ' 傷害 2 次，虛弱 ' + v.x + '。', v => [v.d + ' ×2', '虛弱 ' + v.x], (cb, core, tg, v) => { kAtk(cb, core, tg, v.d, 2); for (const t of tg) KD.add(core, cb.Hu(), t, 'weak15', v.x); });
KQ('q_oath', '獵人的誓約', 'skl', 'Q', 1, 'ironWall', 'self', { b: 8 }, { b: 11 }, v => '獲得 ' + v.b + ' 格擋；HP 一半以下時變成 2 倍。', v => ['格擋 ' + v.b, '半血 ×2'], (cb, core, tg, v) => kBlk(cb, core, v.b * (kHalf(cb) ? 2 : 1)));
KQ('q_eye', '獵人之眼', 'skl', 'Q', 0, 'hunterMark', 'enemy', { x: 2 }, { x: 3 }, v => '讓敵人易傷 ' + v.x + '。', v => ['易傷 ' + v.x], (cb, core, tg, v) => { for (const t of tg) KD.add(core, cb.Hu(), t, 'vuln15', v.x); });
KQ('q_lamp', '礦工的提燈', 'skl', 'Q', 1, 'meditate', 'self', { c: 2, x: 4 }, { c: 3, x: 5 }, v => '抽 ' + v.c + ' 張；下一張攻擊卡傷害 +' + v.x + '。', v => ['抽 ' + v.c, '下一擊 +' + v.x], (cb, core, tg, v) => { cb.drawN(v.c); KD.add(core, cb.Hu(), cb.Hu(), 'nxa14', v.x); });
KQ('q_master', '名匠遺作', 'atk', 'Q', 2, 'powerSlash', 'enemy', { d: 14 }, { d: 18 }, v => '造成 ' + v.d + ' 傷害；牌組裡每有 1 張升級過的卡，再 +1。', v => ['傷害 ' + v.d, '升級卡 +1'], (cb, core, tg, v) => kAtk(cb, core, tg, v.d + KD.fullDeck(Game.st).filter(c => c.up).length) /* v14.16: 裝備卡也算 */);
KQ('q_moon', '月光護符', 'pow', 'Q', 1, 'heal', 'self', { x: 2 }, { x: 3 }, v => '能力：每回合開始回復 ' + v.x + ' HP。', v => ['每回合', '回復 ' + v.x], (cb, core, tg, v) => KD.add(core, cb.Hu(), cb.Hu(), 'pwRegen14', v.x));
KQ('q_merchant', '行商人徽章', 'skl', 'Q', 0, 'focus', 'self', { c: 1 }, { c: 2 }, v => '抽 ' + v.c + ' 張，得到 ' + KD.qGold() + ' G。消耗。', v => ['抽 ' + v.c, '+' + KD.qGold() + ' G'], (cb, core, tg, v) => { cb.drawN(v.c); const g = KD.qGold(); if (Game.st) Game.st.money += g; cb.noteK('得到了 ' + g + ' G'); }, { exhaust: 1 });
KQ('q_mimic', '寶箱怪之牙', 'atk', 'Q', 1, 't11_ddFang', 'enemy', { lo: 3, hi: 21 }, { lo: 6, hi: 24 }, v => '造成 ' + v.lo + '〜' + v.hi + ' 傷害（隨機）。', v => ['傷害', v.lo + '〜' + v.hi], (cb, core, tg, v) => kAtk(cb, core, tg, v.lo + Math.floor(core.rng.next() * (v.hi - v.lo + 1))));
KQ('q_lens', '學者的鏡片', 'skl', 'Q', 1, 't11_tmSlow', 'enemy', { x: 2 }, { x: 2 }, v => '打斷敵人的蓄力，讓牠易傷 ' + v.x + '，抽 1 張。', v => ['打斷蓄力', '易傷 ' + v.x], (cb, core, tg, v) => { for (const t of tg) { if (core.hasStatus(t, 'charging')) core.removeStatus(t, 'charging', 'break'); KD.add(core, cb.Hu(), t, 'vuln15', v.x); } cb.drawN(1); }, { upCost: 0 });
KQ('q_bell', '鎮魂鈴', 'atk', 'Q', 1, 'sing', 'all', { d: 6, x: 1 }, { d: 8, x: 1 }, v => '對全體造成 ' + v.d + ' 傷害，虛弱 ' + v.x + '；對不死系 ×2。', v => ['全體 ' + v.d, '不死系 ×2'], (cb, core, tg, v) => { kAll(cb, core, v.d, 1, { mulF: t => kUndead(t) ? 2 : 1 }); for (const t of kFoes(core)) KD.add(core, cb.Hu(), t, 'weak15', v.x); });
KQ('q_gren', '格倫的護腕', 'skl', 'Q', 1, 'statUpFx', 'self', { b: 6, s: 1 }, { b: 9, s: 2 }, v => '獲得 ' + v.b + ' 格擋，力量 +' + v.s + '。', v => ['格擋 ' + v.b, '力量 +' + v.s], (cb, core, tg, v) => { kBlk(cb, core, v.b); KD.add(core, cb.Hu(), cb.Hu(), 'str15', v.s); });
KQ('q_witch', '魔女的咒書', 'skl', 'Q', 1, 'deathMark', 'enemy', { p: 4, f: 2, x: 1 }, { p: 6, f: 3, x: 2 }, v => '讓敵人中毒 ' + v.p + '、燃燒 ' + v.f + '、虛弱 ' + v.x + '。', v => ['毒 ' + v.p, '燃燒 ' + v.f], (cb, core, tg, v) => { const H = cb.Hu(); for (const t of tg) { KD.add(core, H, t, 'pois14', v.p); KD.add(core, H, t, 'burn14', v.f); KD.add(core, H, t, 'weak15', v.x); } });
KQ('q_royal', '王國徽章', 'pow', 'Q', 2, 'overdrive', 'self', {}, {}, v => '能力：每回合開始，力量 +1。', v => ['每回合', '力量 +1'], (cb, core, tg, v) => KD.add(core, cb.Hu(), cb.Hu(), 'pwRoyal14', 1), { upCost: 1 });
KQ('q_scale', '湖神鱗片', 'pow', 'Q', 2, 'sanctuary', 'self', { b: 6 }, { b: 10 }, v => '能力：格擋不會在回合開始時消失。獲得 ' + v.b + ' 格擋。', v => ['格擋不消失', '格擋 ' + v.b], (cb, core, tg, v) => { KD.add(core, cb.Hu(), cb.Hu(), 'pwScale14', 1); kBlk(cb, core, v.b); });
KQ('q_rose', '沙漠玫瑰', 'pow', 'Q', 1, 'mikiri', 'self', { x: 3 }, { x: 5 }, v => '能力：受到攻擊時，對攻擊的魔物造成 ' + v.x + ' 傷害。', v => ['被打時', '反擊 ' + v.x], (cb, core, tg, v) => KD.add(core, cb.Hu(), cb.Hu(), 'pwThorn14', v.x));
KQ('q_first', '勇者的護符', 'skl', 'Q', 2, 'holyLight', 'self', {}, {}, v => '到你的下回合開始前，不會受到傷害。消耗。', v => ['不會受傷', '消耗'], (cb, core, tg, v) => KD.add(core, cb.Hu(), cb.Hu(), 'safe14', 1), { exhaust: 1, upCost: 1 });
KQ('q_bond', '羈絆之證', 'atk', 'Q', 2, 't11_cmDawn', 'enemy', { d: 5, b: 5, h: 5 }, { d: 7, b: 7, h: 7 }, v => '造成 ' + v.d + ' 傷害 3 次，獲得 ' + v.b + ' 格擋，回復 ' + v.h + ' HP。', v => [v.d + ' ×3', '擋' + v.b + ' 回復' + v.h], (cb, core, tg, v) => { kAtk(cb, core, tg, v.d, 3); kBlk(cb, core, v.b); KD.heal(core, cb.Hu(), v.h); });
KQ('q_watch', '古代懷錶', 'skl', 'Q', 1, 'meditate', 'self', { e: 2, c: 2 }, { e: 2, c: 2 }, v => '下回合能量 +' + v.e + '、多抽 ' + v.c + ' 張。', v => ['下回合', '能量+' + v.e + ' 抽' + v.c], (cb, core, tg, v) => { cb.nextEn += v.e; cb.nextDraw += v.c; }, { upCost: 0 });
KQ('q_guild', '公會的印信', 'skl', 'Q', 1, 'buff', 'self', {}, {}, v => '把 1 張隨機的史詩卡（你的職業）加到手牌。消耗。', v => ['史詩卡', '加到手牌'], (cb, core, tg, v) => { const L = Object.keys(KD.CARDS).filter(id => KD.CARDS[id].cls === cb.cls && KD.CARDS[id].rar === 'R' && !KD.CARDS[id].hidden); if (L.length) cb.addHand(L[Math.floor(core.rng.next() * L.length)]); }, { exhaust: 1, upCost: 0 });
KQ('q_fang', '雪狼之牙', 'atk', 'Q', 1, 'w12_wolfFang2', 'enemy', { d: 8, x: 3 }, { d: 10, x: 4 }, v => '這回合力量 +' + v.x + '，然後造成 ' + v.d + ' 傷害。', v => ['力量 +' + v.x, '傷害 ' + v.d], (cb, core, tg, v) => { KD.add(core, cb.Hu(), cb.Hu(), 'tstr14', v.x); kAtk(cb, core, tg, v.d); });
KQ('q_compass', '黃金羅盤', 'skl', 'Q', 1, 'focus', 'self', { c: 2 }, { c: 2 }, v => '從牌庫抽出費用最高的 ' + v.c + ' 張卡。', v => ['抽出最貴的', String(v.c) + ' 張'], (cb, core, tg, v) => { for (let i = 0; i < v.c; i++) { if (!cb.pile.length && cb.disc.length) { cb.pile = shuffle15(cb.disc, () => core.rng.next()); cb.disc = []; } if (!cb.pile.length || cb.hand.length >= KD.HAND) break; /* v14.10: reshuffle first, then still take the most expensive */ let b = 0; cb.pile.forEach((c, j) => { if (KD.cost(c) > KD.cost(cb.pile[b])) b = j; }); cb.hand.push(cb.pile.splice(b, 1)[0]); } }, { upCost: 0 });
KQ('q_tide', '潮鳴貝殼', 'atk', 'Q', 2, 'o12_tidalRage', 'all', { d: 8 }, { d: 10 }, v => '對全體造成 ' + v.d + ' 水屬性傷害 2 次，抽 1 張。', v => ['全體 ' + v.d + ' ×2', '抽 1'], (cb, core, tg, v) => { kAll(cb, core, v.d, 2); cb.drawN(1); }, { el: '水' });
KQ('q_sea', '海神的鱗片', 'pow', 'Q', 3, 'resonanceSong', 'self', {}, {}, v => '能力：每回合開始能量 +1、多抽 1 張。', v => ['每回合', '能量+1 抽1'], (cb, core, tg, v) => KD.add(core, cb.Hu(), cb.Hu(), 'pwSea14', 1), { upCost: 2 });
KQ('q_star', '星之羅盤', 'atk', 'Q', 3, 'o12_fallenStar', 'rand', { d: 6 }, { d: 8 }, v => '星星落下：對隨機敵人造成 ' + v.d + ' 傷害 6 次。', v => ['隨機 ' + v.d + ' ×6'], (cb, core, tg, v) => kRandHits(cb, core, v.d, 6));
KQ('q_crest', '冒險王之證', 'pow', 'Q', 2, 'statUpFx', 'self', { s: 2, b: 4 }, { s: 3, b: 5 }, v => '能力：力量 +' + v.s + '，每回合開始獲得 ' + v.b + ' 格擋。', v => ['力量 +' + v.s, '每回合擋 ' + v.b], (cb, core, tg, v) => { const H = cb.Hu(); KD.add(core, H, H, 'str15', v.s); KD.add(core, H, H, 'pwGuard15', v.b); });
for (const id in KD.CARDS) if (KD.CARDS[id].quest) KD.regCard(id);
/* ---------- the powers at work ---------- */
{ const _st = BPK.startTurnK; BPK.startTurnK = function () { const core = this.core, H = this.Hu(), keep = stkK(H, 'pwScale14') ? stkK(H, 'blk15') : 0;
    if (stkK(H, 'safe14')) core.removeStatus(H, 'safe14', 'expire');
    const sea = stkK(H, 'pwSea14'); if (sea) { this.nextEn += sea; this.nextDraw += sea; }
    _st.call(this);
    if (keep) KD.block(core, H, keep);
    const nb = stkK(H, 'nxb14'); if (nb) { core.removeStatus(H, 'nxb14', 'used'); KD.block(core, H, nb); }
    const rg = stkK(H, 'pwRegen14'); if (rg) KD.heal(core, H, rg);
    const ry = stkK(H, 'pwRoyal14'); if (ry) KD.add(core, H, H, 'str15', ry);
    this.syncK(); }; }
// 勇者的護符: no damage until the hero's next turn (losing HP to your own cards still happens) · 沙漠玫瑰: a monster's attack is answered
{ const _dd = BattleCore.prototype.dealDamage; BattleCore.prototype.dealDamage = function (src, tgt, amount, info = {}) {
    if (!KD.on(this) || !tgt || !tgt.hero) return _dd.call(this, src, tgt, amount, info);
    if (stkK(tgt, 'safe14') && amount > 0 && !(info.tags || []).includes('self')) { const cb = this.data.cb14; if (cb) cb.noteK('平安：沒有受傷'); return null; }
    const th = info.kind === 'hit' && src && src.side === 'B' ? stkK(tgt, 'pwThorn14') : 0, e = _dd.call(this, src, tgt, amount, info);
    if (th && this.isUp(src) && this.isUp(tgt)) { this.emit(EVT.CARD15, { src: tgt, tgts: [src], payload: { k: 'counter' } }); _dd.call(this, tgt, src, th, { kind: 'counter', min: 1, tags: ['card14'] }); }
    return e; }; }
/* ---------- which quest gives which card ---------- */
const qDone = (k, st) => { const s = typeof comState === 'function' ? comState(k, st) : null; return !!(s && s.s === 'done'); };
KD.QUEST = [
  ['q_helm', ['guardHelm'], st => st.flags.q2done && st.flags.q2res === 'home'],
  ['q_oath', ['hunterOath'], st => st.flags.q2done && st.flags.q2res !== 'home'],
  ['q_master', ['masterBlade', 'masterStaff'], st => st.flags.q3res === 'take'],
  ['q_moon', ['moonCharm'], st => !!st.flags.wellCharm],
  ['q_witch', ['witchTome'], st => st.flags.witchFate === 'spare'],
  ['q_sand', ['sandSaber', 'harpyStaff'], st => (st.flags.qHorn || 0) >= 2],
  ['q_merchant', ['merchantBadge'], st => st.flags.qMerchant === 2],
  ['q_mimic', ['mimicTooth'], st => !!st.flags.mimicHunter],
  ['q_royal', ['royalBadge'], st => st.flags.princessQ === 2],
  ['q_watch', ['ancientWatch'], st => st.flags.watchQ === 2],
  ['q_nora', ['qNoraRibbon'], st => (st.flags.creekQ || 0) >= 3],
  ['q_gren', ['qGrenBand'], st => !!(st.flags.passDone && st.flags.grenTrust)],
  ['q_first', ['firstHeroCharm'], st => !!st.flags.tombCharm],
  ['q_bond', ['bondCharm'], st => !!st.flags.bondParty],
  ['q_tide', ['tideShell13'], st => (st.flags.ch3 || 0) >= 6],
  ['q_sea', ['seaGodScale13'], st => !!(st.fish13r && st.fish13r[24])],
  ['q_compass', ['goldCompass13'], st => !!(st.tm13r && st.tm13r[16])],
  ['q_travel', ['qTravelCharm'], st => qDone('c13', st)], ['q_herb', ['qHerbPouch'], st => qDone('c14', st)], ['q_eye', ['qHunterEye'], st => qDone('c7', st)],
  ['q_lamp', ['qMinerLamp'], st => qDone('c10', st)], ['q_lens', ['qScholarLens'], st => qDone('c11', st)], ['q_bell', ['qGraveBell'], st => qDone('c12', st)],
  ['q_scale', ['qLakeScale'], st => qDone('c17', st)], ['q_rose', ['qDesertRose'], st => qDone('c19', st)], ['q_guild', ['qGuildSeal'], st => qDone('c23', st)],
  ['q_fang', ['qSnowFang'], st => qDone('c29', st)], ['q_star', ['qStarCompass'], st => qDone('c34', st)], ['q_crest', ['qHeroCrest'], st => qDone('c35', st)]];
KD.qPending = (st = Game.st) => { const K = KD.state(st), Q = K.qc || {}; return KD.QUEST.filter(([id, , ok]) => { if (Q[id]) return false; try { return !!ok(st); } catch (e) { return false; } }); };
// the quest's piece of gear (if it was handed out) goes away: the card replaces it
KD.qTake = (st, bases) => { const keep = new Set(Object.values(st.equip || {})); for (const b of bases) { const i = (st.gear || []).findIndex(g => g.b === b && !keep.has(g.u)); if (i >= 0) { st.gear.splice(i, 1); return true; } } return false; };
KD.qScript = function* (L) { const st = Game.st, K = KD.state(st), old = !K.qv && L.length > 1; K.qv = 2;
  if (old) yield* say('（改版：完成過的任務都有一張「任務卡」。一次補給你 ' + L.length + ' 張。）');
  for (const [id] of L) { (K.qc = K.qc || {})[id] = 1; KD.addCard(st, { id }); yield* KD.showCard(id, old ? '任務卡' : '完成任務，得到了任務卡！'); }
  yield* say('（任務卡每張只有一張，轉職後的牌組也會有。）'); };
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st;
    if (!Game.noV14 && st && st.k14 && st.flags && !this.script && !UI.stack.length && !Game.trans) { const L = KD.qPending(st);
      if (L.length) { for (const q of L) KD.qTake(st, q[1]); this.run(KD.qScript(L)); return; } st.k14.qv = 2; }
    return _u.apply(this, a); }; }
// a new game: no 重生之水 (no attributes any more; it used to turn into 1500 G) and pocket money for a card or two, not for a set of gear
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st && st.k14) { st.k14.qv = 2; if (st.bag) delete st.bag.attrReset; st.money = 300; } return st; }; }
// texts: the old 「設計圖」 wording of the board's exclusive rewards
KD.TXT.push([/【獨家】([^、]+?)的設計圖/g, '【獨家】任務卡「$1」'], [/獨家報酬「([^」]+)」的設計圖！/g, '獨家報酬「$1」！']);
{ const _rt = rewardText; rewardText = function (r) { const t = _rt(r); return Game.noV14 ? t : KD.fixTxt(t); }; }
// achievement
ACHIEVEMENTS.push({ id: 'k14_q10', cat: '收集', n: '任務達人', d: '拿到 10 張任務卡。', ok: st => !!st.k14 && Object.keys(st.k14.qc || {}).length >= 10 });
// 「還能做什麼」: the card collection
{ const _tl = todoLines12; todoLines12 = function (st = Game.st) { const L = _tl(st); if (Game.noV14 || !st || !st.k14) return L; const P = t => L.push([t, UIC.text, 10, 6]);
    try { P('・任務卡：' + Object.keys(st.k14.qc || {}).length + '／' + KD.QUEST.length + ' 張'); P('・傳說卡：' + KD.bossN(st) + '／' + Object.keys(KD.BOSS_CARD).length + ' 張'); P('・卡牌圖鑑：' + Math.round(KD.dexPct(st) * 100) + '%'); } catch (e) { }
    return L; }; }
