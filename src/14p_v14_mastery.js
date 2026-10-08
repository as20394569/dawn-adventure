/* ===================== v14.13 熟練・覺醒 =====================
   ③ 卡牌熟練・覺醒：每張卡每打出 1 次熟練 +1（牌組裡的那一張自己算），滿了在打贏的戰鬥結束時覺醒：卡名加「★」，效果多一行。
   · 需要次數：基本 20、普通 15、稀有 12、史詩 10（傳說・任務 10／12）；升級（+）和覺醒分開，可以都有
   · 這次先做法師 31 張卡的覺醒（玩家：「先做一個職業試玩」）；其他卡的熟練也會先記著，之後加覺醒時不用重來
   · 卡面：熟練條（下緣藍色細線，只在有覺醒的卡上）、覺醒後金色的角 */
KD.AW_NEED = { B: 20, C: 15, U: 12, R: 10, L: 10, Q: 12 };
KD.awNeed = id => { const C = KD.CARDS[id]; return (C && KD.AW_NEED[C.rar]) || 99; };
const kOnce = (core, k) => { const S = core.data.awOnce16 || (core.data.awOnce16 = new Set()); if (S.has(k)) return false; S.add(k); return true; };
const kZap = (cb, core, n) => { const t = kRand(core); if (t) KD.hit(core, cb.Hu(), t, n, { el: '雷', cat: '特', at: '雷' }); };
// t: the line on the card; run: replaces the card's effect; after: runs after it; rx: when this card sets off a reaction; cost: its cost; copyEl: takes the last element card's element
KD.AW = {
  mg_bolt: { t: '變成你上一張元素卡的屬性', copyEl: 1 },
  mg_shield: { t: '魔物身上每有 1 個印記，再 +2 格擋', after: (cb, core) => kBlk(cb, core, 2 * kFoes(core).filter(u => u.data && u.data.mk16).length) },
  mg_fire: { t: '引發反應時，再燃燒 3', rx: (core, cb, t) => KD.add(core, cb.Hu(), t, 'burn14', 3) },
  mg_frost: { t: '引發反應時，抽 1 張', rx: (core, cb) => { if (kOnce(core, 'frost')) cb.drawN(1); } },
  mg_spark: { t: '引發反應時，能量 +1', rx: (core, cb) => { if (kOnce(core, 'spark')) cb.energy++; } },
  mg_arrows: { t: '打 4 次', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 4) },
  mg_wall: { t: '抽 2 張', run: (cb, core, tg, v) => { kBlk(cb, core, v.b); cb.drawN(2); } },
  mg_ember: { t: '費用 0', cost: 0 },
  mg_chain: { t: '每引發 1 次反應，多打 1 次', run: (cb, core, tg, v) => { let n = 4; for (let i = 0; i < n && i < 12; i++) { const r0 = core.data.rxN16 || 0, t = kRand(core); if (!t) break; kAtk(cb, core, [t], v.d, 1, { i }); if ((core.data.rxN16 || 0) > r0) n++; } } },
  mg_lance: { t: '對破防中的魔物 ×2', run: (cb, core, tg, v) => { kAtk(cb, core, tg, v.d, 1, { mulF: t => KD.isBroken(core, t) ? 2 : 1 }); for (const t of tg) KD.add(core, cb.Hu(), t, 'vuln15', v.x); } },
  mg_icewall: { t: '全體魔物留下水印', after: (cb, core) => { for (const u of kFoes(core)) KD.mark(u, '水', true); } },
  mg_slow: { t: '費用 0', cost: 0 },
  mg_page: { t: '抽 1 張', after: cb => cb.drawN(1) },
  mg_storm: { t: '變成你上一張元素卡的屬性（全體都能反應）', copyEl: 1 },
  mg_blaze: { t: '引發反應的魔物再燃燒 3', rx: (core, cb, t) => KD.add(core, cb.Hu(), t, 'burn14', 3) },
  mg_thunder: { t: '引發反應時，傷害 +8', flatRx: 8 },
  mg_impact: { t: '打斷蓄力時，直接破防', run: (cb, core, tg, v) => { for (const t of tg) { const ch = core.hasStatus(t, 'charging'); kAtk(cb, core, [t], v.d, 1, { mul: ch ? 2 : 1 }); if (ch && core.isUp(t)) { core.removeStatus(t, 'charging', 'break'); KD.chip(core, cb.Hu(), t, t.res.brk || 0); } } } },
  mg_haste: { t: '能量 +3', run: (cb, core, tg, v) => { cb.energy += 3; cb.drawN(1); } },
  mg_combust: { t: '燃燒只減半，不會消失', run: (cb, core, tg, v) => { for (const t of tg) { const b = stkK(t, 'burn14'); if (b) { kAtk(cb, core, [t], b * v.x); if (core.isUp(t)) setStk15(core, t, 'burn14', Math.floor(b / 2)); } } } },
  mg_pages: { t: '抽 2 張', run: (cb, core, tg, v) => { kAll(cb, core, v.d); cb.drawN(2); } },
  mg_drain: { t: '引發反應時，這回合能量 +1', rx: (core, cb) => { if (kOnce(core, 'drain')) cb.energy++; } },
  mg_kindle: { t: '費用 0', cost: 0 },
  mg_static: { t: '元素卡也會觸發', after: (cb, core, ctx, v) => KD.add(core, cb.Hu(), cb.Hu(), 'pwStaticA16', v.x) },
  mg_chainc: { t: '變成你上一張元素卡的屬性', copyEl: 1 },
  mg_finale: { t: '這回合每引發過 1 次反應，再 +8', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d + cb.cardsN * v.x + (cb.rxTurn16 || 0) * 8) },
  mg_max: { t: '每回合第一次反應，抽 1 張', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwMaxA16', 1) },
  mg_four: { t: '變成你上一張元素卡的屬性', copyEl: 1 },
  mg_meteor: { t: '傷害 +10', run: (cb, core, tg, v) => KD.add(core, cb.Hu(), cb.Hu(), 'chgM14', v.d + 10) },
  mg_stop: { t: '也讓牠破防', run: (cb, core, tg, v) => { for (const t of tg) { kStop(cb, core, t); if (core.isUp(t)) KD.chip(core, cb.Hu(), t, t.res.brk || 0); } } },
  mg_inferno: { t: '費用 2', cost: 2 },
  mg_phoenix: { t: '復活時，對全體造成 20 火屬性傷害', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwPhoenixA16', 1) },
};
for (const [id, n, k, tip] of [['pwStaticA16', '靜電場★', 'atk', '元素卡也會電擊敵人'], ['pwMaxA16', '魔導極限★', 'atk', '每回合第一次反應抽 1 張'], ['pwPhoenixA16', '不死鳥★', 'atk', '復活時全體火傷']]) KD.st(id, n, k, tip);

/* ---------- 名字・說明・費用 ---------- */
{ const _n = KD.name; KD.name = c => _n(c) + (c && c.aw ? '★' : ''); }
{ const _d = KD.desc; KD.desc = c => { const A = c && c.aw && KD.AW[c.id]; return _d(c) + (A ? '★' + A.t + '。' : ''); }; }
{ const _c = KD.cost; KD.cost = c => { const n = _c(c), A = c && c.aw && KD.AW[c.id]; return A && A.cost != null ? Math.min(n, A.cost) : n; }; }

/* ---------- 戰鬥裡 ---------- */
{ const _rc = BPK.runCard; BPK.runCard = function (c, ctx) { const core = this.core, C = KD.CARDS[c.id];
    if (c.src16 && C && C.rar !== 'T') c.src16.xp = (c.src16.xp || 0) + 1;
    const A = c.aw && KD.AW[c.id]; let r;
    if (!A) r = _rc.call(this, c, ctx);
    else { const run0 = C.run; this.awNow16 = c; core.data.awOnce16 = new Set(); if (A.copyEl && this.lastEl16) core.data.at16 = this.lastEl16; if (A.run) C.run = A.run;
      try { r = _rc.call(this, c, ctx); } finally { C.run = run0; core.data.at16 = null; }
      if (A.after) A.after(this, core, ctx, KD.val(c), c); this.awNow16 = null; }
    const s = stkK(this.Hu(), 'pwStaticA16'); if (s && C && C.type !== 'skl' && KD.ELEM.includes(KD.atOf(c.id)) && core.alive('B').length) kZap(this, core, s); // 靜電場★: element cards zap too (skills already do)
    return r; }; }
KD.rxFlat = core => { const cb = core.data.cb14, c = cb && cb.awNow16, A = c && KD.AW[c.id]; return A && A.flatRx ? A.flatRx : 0; };
KD.onRx.push((core, cb, t, rx, got) => { if (!cb) return; cb.rxTurn16 = (cb.rxTurn16 || 0) + 1; const c = cb.awNow16, A = c && KD.AW[c.id]; if (A && A.rx) A.rx(core, cb, t, rx, got, c);
  if (stkK(cb.Hu(), 'pwMaxA16') && !cb.rxDraw16) { cb.rxDraw16 = 1; cb.drawN(1); } });
{ const _st = BPK.startTurnK; BPK.startTurnK = function () { this.rxTurn16 = 0; this.rxDraw16 = 0; return _st.apply(this, arguments); }; }
// 不死鳥★: the moment it brings you back, fire on every monster
{ const _rs = BattleCore.prototype.removeStatus; BattleCore.prototype.removeStatus = function (u, id, why) { const r = _rs.apply(this, arguments);
    if (KD.on(this) && u && u.hero && id === 'pwPhoenix14' && why === 'used' && stkK(u, 'pwPhoenixA16')) for (const t of this.alive('B')) KD.hit(this, u, t, 20, { el: '火', cat: '特', at: '火' });
    return r; }; }

/* ---------- 打贏後：覺醒 ---------- */
KD.awakenFlow = function* () { const st = Game.st; if (!st) return; const L = KD.deck(st).filter(c => KD.AW[c.id] && !c.aw && (c.xp || 0) >= KD.awNeed(c.id));
  for (const c of L) { c.aw = 1; yield* KD.showAw(c); } };
KD.showAw = function* (c) { let done = false, t = 0; const ui = { draw: x => { x.fillStyle = 'rgba(6,4,14,0.92)'; x.fillRect(0, 0, W, H); const dy = Math.round(bxE() / 2);
      Font.drawC(x, '「' + KD.CARDS[c.id].n + '」覺醒了！', W / 2, 16 + dy, '#ffd060', '#000', 11);
      const s = Math.min(1, t / 14), gl = 0.5 + 0.5 * Math.sin(t / 5); x.globalAlpha = 0.35 * gl; x.fillStyle = '#ffd060'; x.fillRect(W / 2 - 34, 40 + dy + (1 - s) * 20, 68, 94); x.globalAlpha = 1;
      KD.drawCard(x, c, W / 2 - 30, 44 + dy + (1 - s) * 20, 60, 86, {}); wrap15('★' + KD.AW[c.id].t + '。', W - 20, 9).slice(0, 3).forEach((L, k) => Font.drawC(x, L, W / 2, 138 + dy + k * 12, '#ffe8a0', '#000', 9));
      Font.drawC(x, '（點一下繼續）', W / 2, 214 + dy, '#8a93b3', '#000', 8); touchRegion(0, 0, W, H, () => { if (t > 20) done = true; }); } };
  UI.push(ui); Sound.jingle('levelup'); while (!done) { t++; yield; if (t > 20 && (Input.pressed('a') || Input.pressed('b'))) done = true; } UI.remove(ui); Input.consume('a', 'b'); };
{ const _v = BPK.victory; BPK.victory = function* () { const r = yield* _v.call(this); if (this.k14 && Game.st && Game.st.hp > 0) yield* KD.awakenFlow(); return r; }; }

/* ---------- 卡面：熟練條、覺醒的金角 ---------- */
{ const _dc = KD.drawCard; KD.drawCard = function (x, c, X, Y, w, h, o = {}) { _dc.call(this, x, c, X, Y, w, h, o); if (!c || !KD.AW[c.id]) return;
    if (c.aw) { x.fillStyle = '#ffd060'; for (const [a, b] of [[X + 1, Y + 1], [X + w - 4, Y + 1], [X + 1, Y + h - 4], [X + w - 4, Y + h - 4]]) { x.fillRect(a, b, 3, 1); x.fillRect(a + (a > X + 2 ? 2 : 0), b, 1, 3); } return; }
    const xp = c.xp || 0; if (!xp) return; const vw = Math.min(w, o.vis || w), bx = X + (o.visX0 || 0) + 3, bw = vw - 6; if (bw < 6) return;
    x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(bx, Y + h - 6, bw, 2); x.fillStyle = '#78e0ff'; x.fillRect(bx, Y + h - 6, Math.max(1, Math.round(bw * Math.min(1, xp / KD.awNeed(c.id)))), 2); }; }

/* ---------- 說明 ---------- */
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.push(['熟練・覺醒', ['每張卡打出一次熟練 +1（卡下緣的藍色細線）。熟練滿了，打贏那場戰鬥後「覺醒」：卡名加★，效果多一行。', '需要的次數：基本 20、普通 15、稀有 12、史詩 10。升級和覺醒可以都有。（目前法師的卡有覺醒）']]);
