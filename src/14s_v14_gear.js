/* ===================== v14.16 RPG × 卡牌：「裝備就是牌組」（第一階段） =====================
   玩家：「接下來可以試著把 RPG 系統跟卡牌對戰結合，這樣紙娃娃也不用廢棄」「想要做出創新 好玩……走出自己的風格」
   選了：裝備就是牌組／職業卡和裝備卡兩種並存／HP 列旁放小頭像；企劃全部照推薦（〈曙光冒險-裝備牌組企劃〉）。
   · 身上的武器・頭・身體・腳會帶卡進牌組：武器 4 張（基本卡 3＋招牌卡 1）、身體 2 張、頭 1 張、腳 1 張，合計 8 張
   · 階級：T1〜3 普通；T4〜6 基本卡（防具是身體的卡）變「＋」、招牌卡換一張；T7〜8 全部「＋」、招牌卡再換一張
   · 法杖照名字有屬性（礦晶短杖＝雷…），基本卡「魔力彈」變成那個屬性
   · 裝備卡不能刪、不能單獨升級，換裝備就換卡；裝備卡是銀色的框（玩家選的）
   · 職業的起始牌組只留職業卡；舊存檔拿掉基本攻擊・防禦卡（升級過的每張退 50 G），補上起始裝備
   · 鐵匠「打造」：沿用 RPG 版的打造表（素材點數＋金幣），背包裡的素材自動換成點數；最高階級看去過最遠的地區
   · 寶箱・任務給的裝備照舊換成卡牌獎勵（獎勵的說明都寫「卡牌三選一」）；舊 RPG 存檔身上和背包裡能帶卡的武器・防具留著
   · 任何職業都能拿任何武器；元素反應是法師的能力（其他職業的火・水・雷卡照樣打弱點，但不留印記） */

/* ---------- 裝備 → 卡 ---------- */
KD.WPN16 = { 劍: { b: 'sw_strike', s: ['sw_break', 'sw_flow', 'sw_sky'] }, 短刀: { b: 'rg_stab', s: ['rg_backstab', 'rg_cross', 'rg_grave'] }, 斧: { b: 'bk_chop', s: ['bk_split', 'bk_crush', 'bk_castle'] },
  長槍: { b: 'nt_pierce', s: ['nt_dash', 'sw_gap', 'rg_twin'] }, 拳套: { b: 'bk_triple', s: ['bk_fbreak', 'bk_shell', 'bk_hundred'] }, 法杖: { b: 'mg_bolt', s: null }, 魔導書: { b: 'mg_arrows', s: ['mg_slow', 'mg_chainc', 'mg_four'] } };
KD.WKINDS16 = ['劍', '短刀', '斧', '長槍', '拳套', '法杖', '魔導書'];
KD.STAFF_EL16 = ['無', '雷', '火', '水', '無', '雷', '火', '水'];
KD.STAFF16 = { 火: ['mg_fire', 'mg_blaze', 'mg_inferno'], 水: ['mg_frost', 'mg_drain', 'mg_icewall'], 雷: ['mg_spark', 'mg_chain', 'mg_thunder'], 無: ['mg_bolt', 'mg_lance', 'mg_four'] };
KD.BOLT16 = { 無: 'mg_bolt', 火: 'mg_boltF', 水: 'mg_boltW', 雷: 'mg_boltT' };
KD.ARM16 = { 重甲: { head: 'sw_shield', body: 'sw_defend', feet: 'sw_hold' }, 輕裝: { head: 'rg_shade', body: 'rg_slip', feet: 'rg_smoke' }, 法衣: { head: 'mg_page', body: 'mg_shield', feet: 'mg_wall' } };
KD.SLOTS16 = [['weapon', '武器'], ['head', '頭'], ['body', '身體'], ['feet', '腳']];
// the staff's 魔力彈 in its element (same numbers; the picture is the 魔力彈's, the hit is that element's bolt)
for (const [el, k, fx] of [['火', 'F', 'fireBolt'], ['水', 'W', 'frostBloom'], ['雷', 'T', 'quickBolt']]) {
  KC('mg_bolt' + k, 'mg', '魔力彈', 'atk', 'B', 1, fx, 'enemy', { d: 6 }, { d: 9 }, v => '造成 ' + v.d + ' ' + el + '屬性傷害。', v => ['傷害 ' + v.d], (cb, core, tg, v) => kAtk(cb, core, tg, v.d), { el, hidden: 1 });
  KD.regCard('mg_bolt' + k); if (KD.ART && KD.ART.mg_bolt) KD.ART['mg_bolt' + k] = KD.ART.mg_bolt; }
// what a piece of gear brings: [{ id, up, n }]
KD.gearCardsOf16 = b => { const G = GEAR[b]; if (!G) return []; const t = clamp(G.t || 1, 1, 8), si = t <= 3 ? 0 : t <= 6 ? 1 : 2, upB = t >= 4 ? 1 : 0, upS = t >= 7 ? 1 : 0;
  if (G.slot === 'weapon') { const Wp = KD.WPN16[G.kind]; if (!Wp) return []; let b0 = Wp.b, s = Wp.s && Wp.s[si];
    if (G.kind === '法杖') { const el = KD.STAFF_EL16[t - 1]; b0 = KD.BOLT16[el]; s = KD.STAFF16[el][si]; }
    return b0 === s && upB === upS ? [{ id: b0, up: upB, n: 4 }] : [{ id: b0, up: upB, n: 3 }, { id: s, up: upS, n: 1 }]; }
  const A = KD.ARM16[G.arm9]; if (!A || !A[G.slot]) return []; return G.slot === 'body' ? [{ id: A.body, up: upB, n: 2 }] : [{ id: A[G.slot], up: upS, n: 1 }]; };
KD.gearOk16 = b => KD.gearCardsOf16(b).length > 0;
KD.atName16 = b => { const G = GEAR[b]; if (!G) return ''; if (G.slot !== 'weapon') return G.arm9 || ''; if (G.kind === '法杖') { const el = KD.STAFF_EL16[clamp(G.t || 1, 1, 8) - 1]; return el === '無' ? '魔法' : el; }
  if (G.kind === '魔導書') return '魔法'; return KD.atOf(KD.WPN16[G.kind].b) || ''; };
KD.g16 = (st = Game.st) => !Game.noV14 && !!(st && st.k14 && st.k14.g16);
KD.eqGear16 = (st, sl) => { const g = gearBy(st.equip && st.equip[sl], st); return g && GEAR[g.b] && KD.gearOk16(g.b) ? g : null; };
KD.gearCards16 = (st = Game.st) => { if (!KD.g16(st)) return []; const out = [];
  for (const [sl] of KD.SLOTS16) { const g = KD.eqGear16(st, sl); if (!g) continue; for (const q of KD.gearCardsOf16(g.b)) for (let i = 0; i < q.n; i++) out.push({ id: q.id, up: q.up, g16: sl }); }
  const S = st.k14.seen || (st.k14.seen = {}); for (const c of out) S[c.id] = 1; // the card dex counts what the gear brings
  return out; };
KD.fullDeck = (st = Game.st) => KD.gearCards16(st).concat(KD.deck(st));
KD.deckN = (st = Game.st) => KD.fullDeck(st).length;
KD.remNo = (st, D) => (KD.g16(st) ? D.length <= 1 : D.length <= 5);
KD.remMsg = st => (KD.g16(st) ? '職業卡至少要留 1 張。' : '牌組太少了，不能再刪。');

/* ---------- 職業：起始牌組只留職業卡，起始裝備 ---------- */
KD.START16 = { sw: [['sw_stance', 1], ['sw_breath', 1]], rg: [['rg_venom', 1], ['rg_prep', 1]], mg: [['mg_fire', 1], ['mg_frost', 1], ['mg_spark', 1]], bk: [['bk_roar', 1], ['bk_brace', 1]] };
KD.GEAR0_16 = { sw: ['劍', '重甲'], rg: ['短刀', '輕裝'], mg: ['法杖', '法衣'], bk: ['斧', '重甲'] };
for (const k in KD.START16) KD.CLASSES[k].start = KD.START16[k]; // the class deck starts with class cards only (攻擊・防禦 come with the gear)
KD.BASIC16 = new Set(['sw_strike', 'sw_defend', 'rg_stab', 'rg_defend', 'mg_bolt', 'mg_shield', 'bk_chop', 'bk_defend']);
// make a piece and keep it (k14c: the old sweep turned loose gear into card picks)
KD.mkGear16 = (b, q = 1) => { const hid = typeof HIDE_K13 !== 'undefined' ? HIDE_K13.indexOf('魔導書') : -1; if (hid >= 0) HIDE_K13.splice(hid, 1); // 魔導書 is back as a card weapon (its RPG look stays off)
  const G0 = typeof GEAR11_GLAM !== 'undefined' ? GEAR11_GLAM : null; let g;
  try { if (G0 != null) GEAR11_GLAM = false; g = makeGear(b, q); } finally { if (G0 != null) GEAR11_GLAM = G0; if (hid >= 0) HIDE_K13.splice(hid, 0, '魔導書'); }
  g.k14c = 1; return g; };
KD.startGear16 = (cls, sl) => { const [wk, ser] = KD.GEAR0_16[cls] || KD.GEAR0_16.sw; return sl === 'weapon' ? BASE11.weapon[wk][0] : BASE11.armor[ser][sl][0]; };
// fill the empty (or card-less) slots with the class's T1 pieces; returns the names given
KD.fillGear16 = (st, cls) => { const got = []; st.equip = st.equip || {};
  for (const [sl] of KD.SLOTS16) { if (KD.eqGear16(st, sl)) { gearBy(st.equip[sl], st).k14c = 1; continue; } const g = KD.mkGear16(KD.startGear16(cls, sl), 1); st.equip[sl] = g.u; got.push(GEAR[g.b].n); }
  return got; };
// the look no longer follows the bosses: the hero wears what was picked
{ const _d = KD.dress; KD.dress = (st = Game.st) => { if (KD.g16(st) || (st && st.k14 && st.k14.old)) return; return _d(st); }; } // an old RPG save keeps the weapon it had

/* ---------- 新遊戲 ---------- */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st && st.k14) st.k14.g16 = 1; return st; }; }
// the class's own set goes on (the school uniform and shoes stay in the bag: 輕裝 T1, wearable any time)
{ const _as = applyStartClass; applyStartClass = function (k) { _as(k); const st = Game.st; if (!KD.g16(st)) return; const cls = KD.clsKey(st);
    for (const [sl] of KD.SLOTS16) { const b = KD.startGear16(cls, sl), cur = gearBy(st.equip[sl], st); if (cur && cur.b === b) continue; st.equip[sl] = KD.mkGear16(b, 1).u; }
    for (const g of st.gear || []) g.k14c = 1; }; }

/* ---------- 舊存檔：基本攻擊・防禦卡 → 起始裝備 ---------- */
KD.mig16 = st => { const K = KD.state(st); if (K.g16) return null; K.g16 = 1; let n = 0, up = 0;
  for (const k in K.decks) { const D = K.decks[k]; if (!Array.isArray(D)) continue; K.decks[k] = D.filter(c => { if (!KD.BASIC16.has(c.id)) return true; n++; if (c.up) up++; return false; });
    if (!K.decks[k].length) for (const [id, m] of KD.START16[k] || []) for (let i = 0; i < m; i++) K.decks[k].push({ id, up: 0 }); } // a deck of only basics: the class cards (an empty deck would count as 「還沒用過」)
  const gold = up * 50; st.money = (st.money || 0) + gold; const got = KD.fillGear16(st, KD.clsKey(st)); KD.deck(st); return (K.g16msg = { n, up, gold, got }); };
{ const _so = startOverworld; startOverworld = function (...a) { const r = _so.apply(this, a); const st = Game.st; if (!Game.noV14 && st && st.k14 && !st.k14.g16) KD.mig16(st); return r; }; }
KD.mig16Script = function* (m) { yield* say('（改版：身上的裝備會變成戰鬥用的卡！\n武器 4 張、身體 2 張、頭和腳各 1 張。）');
  yield* say('（牌組裡的基本攻擊・防禦卡改由裝備提供' + (m.gold ? '，升級過的 ' + m.up + ' 張退了 ' + m.gold + ' G' : '') + '。\n選單「裝備」可以換裝、看帶的卡；鐵匠可以打造。）'); };
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const r = _u.apply(this, a), st = Game.st;
    if (!Game.noV14 && Game.scene === this && !this.script && !UI.stack.length && st && st.k14 && st.k14.g16msg) { const m = st.k14.g16msg; delete st.k14.g16msg; this.run(KD.mig16Script(m)); }
    return r; }; }
// a class picked for the first time brings its own T1 gear (in the bag; asked before wearing)
{ const _cs = KD.classScreen; KD.classScreen = function* () { const st = Game.st, K = KD.state(st), had = new Set(Object.keys(K.decks)); yield* _cs.call(this); const k = KD.clsKey(st); if (!KD.g16(st) || had.has(k) || !K.decks[k]) return;
    const own = b => (st.gear || []).some(g => g.b === b), L = KD.SLOTS16.map(([sl]) => [sl, KD.startGear16(k, sl)]).filter(([, b]) => !own(b)); if (!L.length) return;
    const G = L.map(([sl, b]) => [sl, KD.mkGear16(b, 1)]); Sound.jingle('item'); yield* say('得到了' + KD.CLASSES[k].n + '的起始裝備：' + G.map(([, g]) => GEAR[g.b].n).join('、') + '！');
    if (yield* yesNo('現在就換上嗎？')) { for (const [sl, g] of G) st.equip[sl] = g.u; Sound.sfx('item'); } }; }

/* ---------- 戰鬥：裝備卡加進牌堆 ---------- */
{ const _ik = BPK.initK; BPK.initK = function () { _ik.call(this); const st = Game.st; if (!KD.g16(st)) return; const G = KD.gearCards16(st).map(c => ({ ...c })); if (!G.length) return;
    this.pile = shuffle15(this.pile.concat(G), () => this.core.rng.next()); }; }
// the face: a silver frame (drawn by KD.drawCard, 14c)
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.push(['裝備卡', ['身上的裝備會帶卡：武器 4 張、身體 2 張、頭和腳各 1 張（銀色框的卡）。', '換裝備就換卡（選單「裝備」）；鐵匠可以打造新的裝備。', '元素反應是法師的能力；其他職業的火・水・雷卡照樣打弱點。']]);

/* ---------- 一排裝備＋選到的那件帶的卡（換裝和打造都用） ---------- */
KD.gearCardsRow16 = (x, list, X0, Y, sel, onTap, cw = 38, ch = 54) => { const n = list.length, X = Math.round(X0 - (n * (cw + 4) - 4) / 2);
  list.forEach((q, i) => { const cx = X + i * (cw + 4), c = { id: q.id, up: q.up, g16: 1 }; KD.drawCard(x, c, cx, Y, cw, ch, { on: sel === i });
    if (q.n > 1) { const t = '×' + q.n, bw = Math.ceil(Font.width(t, 8)) + 4; x.fillStyle = 'rgba(10,8,20,0.9)'; x.fillRect(cx + cw - bw - 1, Y + ch - 12, bw, 10); Font.drawR(x, t, cx + cw - 3, Y + ch - 14, '#ffe8a0', '#000', 8); }
    if (onTap) touchRegion(cx, Y, cw, ch, () => onTap(i)); }); return ch; };
KD.cardInfo16 = (x, q, Y) => { if (!q) return; const c = { id: q.id, up: q.up }, C = KD.CARDS[q.id]; fontFit(x, KD.name(c) + '　' + KD.typeN(c) + '・' + KD.cost(c) + ' 能量', 6, Y, W - 12, KD.RAR[C.rar].c, '#000', 9);
  wrap15(KD.desc(c), W - 12, 8).slice(0, 3).forEach((L, k) => Font.draw(x, L, 6, Y + 12 + k * 10, '#e8e4f4', '#000', 8)); };
KD.kindTxt16 = b => { const G = GEAR[b]; return G.slot === 'weapon' ? G.kind + '・' + KD.atName16(b) : G.arm9; };
KD.gearSub16 = b => 'T' + (GEAR[b].t || 1) + '・' + KD.kindTxt16(b);
// rows: [{ name, sub, dim, b }] → the tapped row (tap twice / the button), -1 = back
KD.gearList16 = function* (title, rows, o = {}) { const S = { sel: rows.length ? clamp(o.sel || 0, 0, rows.length - 1) : -1, scroll: 0, card: 0, done: false, res: -1 }, rh = 15, top = o.info ? 33 : 22, vis = Math.min(rows.length, o.info ? 5 : 6);
  const fix = () => { if (S.sel < S.scroll) S.scroll = S.sel; if (S.sel >= S.scroll + vis) S.scroll = S.sel - vis + 1; }; fix();
  const ui = { draw: x => { screenBG(x); headerBar(x, title); if (o.right) Font.drawR(x, o.right(), W - 6, 4, UIC.muted, UIC.textSh, 9); if (o.info) fontFit(x, o.info(), 6, 19, W - 12, '#c8c0e0', '#000', 8);
      for (let r = 0; r < vis; r++) { const i = r + S.scroll, R = rows[i]; if (!R) break; const Y = top + r * rh, on = S.sel === i;
        x.fillStyle = on ? 'rgba(255,224,112,0.16)' : r % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.15)'; x.fillRect(4, Y, W - 8, rh - 1); if (on) { x.fillStyle = '#ffe070'; x.fillRect(4, Y, 2, rh - 1); }
        fontFit(x, R.name, 9, Y + 1, 98, R.dim ? '#7a7690' : on ? '#fff4d0' : UIC.text, UIC.textSh, 9); if (R.sub) fontFit(x, R.sub, W - 8, Y + 2, 62, R.dim ? '#7a7690' : R.subC || UIC.muted, UIC.textSh, 8, 'r');
        touchRegion(4, Y, W - 8, rh - 1, () => { if (S.sel === i && o.act) { S.res = i; S.done = true; } else { S.sel = i; S.card = 0; } }); }
      if (S.scroll > 0) { Font.drawC(x, '▲', W / 2, top - 9, '#c8a050', null, 8); touchRegion(40, top - 10, W - 80, 9, () => { S.scroll--; }); }
      const by = top + vis * rh; if (S.scroll + vis < rows.length) { Font.drawC(x, '▼', W / 2, by - 3, '#c8a050', null, 8); touchRegion(40, by - 3, W - 80, 9, () => { S.scroll++; }); }
      const R = rows[S.sel]; if (R) { const L = KD.gearCardsOf16(R.b), cy = by + 6; KD.gearCardsRow16(x, L, W / 2, cy, S.card, i => { S.card = i; }, 46, 66); KD.cardInfo16(x, L[S.card] || L[0], cy + 70);
        if (o.act && !(R.dim && o.dimNoAct)) { const t = o.act(R), bw = Math.min(110, Math.ceil(Font.width(t, 9)) + 12); x.fillStyle = R.dim ? '#4a4050' : '#c86030'; x.fillRect(W - 4 - bw, H - 16, bw, 14); Font.drawC(x, t, W - 4 - bw / 2, H - 15, '#fff4e0', '#000', 9); touchRegion(W - 4 - bw, H - 16, bw, 14, () => { S.res = S.sel; S.done = true; }); } }
      else Font.draw(x, o.empty || '沒有東西。', 8, top + 4, UIC.muted, UIC.textSh, 9);
      x.fillStyle = '#4a3a50'; x.fillRect(4, H - 16, 36, 14); Font.drawC(x, '返回', 22, H - 15, '#e8e4f4', '#000', 9); touchRegion(4, H - 16, 36, 14, () => { S.res = -1; S.done = true; }); } };
  UI.push(ui); Input.consume('a', 'b');
  while (!S.done) { yield; if (Input.pressed('b')) { S.res = -1; break; } const n = rows.length; if (!n) continue;
    if (Input.pressed('down')) { S.sel = Math.min(n - 1, S.sel + 1); S.card = 0; fix(); Sound.sfx('cursor'); } if (Input.pressed('up')) { S.sel = Math.max(0, S.sel - 1); S.card = 0; fix(); Sound.sfx('cursor'); }
    if (Input.pressed('right') || Input.pressed('left')) { const L = KD.gearCardsOf16(rows[S.sel].b); if (L.length > 1) S.card = (S.card + 1) % L.length; }
    if (Input.pressed('a') && o.act) { S.res = S.sel; S.done = true; } }
  UI.remove(ui); Input.consume('a', 'b'); return S.res; };

/* ---------- 選單「裝備」 ---------- */
KD.ownGear16 = (st, sl) => (st.gear || []).filter(g => GEAR[g.b] && GEAR[g.b].slot === sl && KD.gearOk16(g.b) && (sl !== 'weapon' || st.equip.shield !== g.u))
  .sort((a, b) => (sl === 'weapon' ? KD.WKINDS16.indexOf(GEAR[a.b].kind) - KD.WKINDS16.indexOf(GEAR[b.b].kind) : ['重甲', '輕裝', '法衣'].indexOf(GEAR[a.b].arm9) - ['重甲', '輕裝', '法衣'].indexOf(GEAR[b.b].arm9)) || (GEAR[a.b].t || 0) - (GEAR[b.b].t || 0) || a.u - b.u);
KD.swap16 = function* (sl) { const st = Game.st, L = KD.ownGear16(st, sl), cur = st.equip[sl], N = KD.SLOTS16.find(q => q[0] === sl)[1];
  const rows = L.map(g => ({ name: (g.u === cur ? 'E ' : '') + GEAR[g.b].n, sub: KD.gearSub16(g.b), b: g.b, g }));
  const r = yield* KD.gearList16('換' + N, rows, { sel: Math.max(0, L.findIndex(g => g.u === cur)), act: R => (R.g.u === cur ? '穿著' : '再點一次：換上'), empty: '沒有其他的' + N + '。鐵匠可以打造。' });
  if (r < 0 || !rows[r] || rows[r].g.u === cur) return false; st.equip[sl] = rows[r].g.u; Sound.sfx('item'); return true; };
KD.equipScreen = function* () { const st = Game.st; let S = { sl: 0, card: 0, done: false, go: -1 };
  const ui = { draw: x => { screenBG(x); headerBar(x, '裝備'); Font.drawR(x, '牌組 ' + KD.deckN(st) + ' 張', W - 6, 4, UIC.muted, UIC.textSh, 9);
      drawWin(x, 4, 21, 40, 54, 'ow'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 8, 26, 32, 44);
      KD.SLOTS16.forEach(([sl, N], i) => { const g = KD.eqGear16(st, sl), Y = 21 + i * 19, on = S.sl === i; x.fillStyle = on ? 'rgba(255,224,112,0.16)' : 'rgba(0,0,0,0.25)'; x.fillRect(47, Y, W - 51, 18); if (on) { x.fillStyle = '#ffe070'; x.fillRect(47, Y, 2, 18); }
        Font.draw(x, N, 52, Y + 2, '#ffd090', UIC.textSh, 8); fontFit(x, g ? GEAR[g.b].n : '（沒有）', 76, Y + 1, 60, g ? (on ? '#fff4d0' : UIC.text) : UIC.dis, UIC.textSh, 9);
        if (g) fontFit(x, KD.kindTxt16(g.b), W - 6, Y + 2, 34, '#a8b0d0', UIC.textSh, 8, 'r');
        touchRegion(47, Y, W - 51, 18, () => { if (S.sl === i) S.go = i; else { S.sl = i; S.card = 0; } }); });
      const g = KD.eqGear16(st, KD.SLOTS16[S.sl][0]), L = g ? KD.gearCardsOf16(g.b) : [], cy = 110;
      Font.draw(x, KD.SLOTS16[S.sl][1] + '帶的卡' + (L.length ? '（' + L.reduce((a, q) => a + q.n, 0) + ' 張）' : ''), 6, 98, '#c8c0e0', UIC.textSh, 8);
      if (L.length) { KD.gearCardsRow16(x, L, W / 2, cy, S.card, i => { S.card = i; }, 50, 74); KD.cardInfo16(x, L[S.card] || L[0], cy + 79); }
      x.fillStyle = '#c86030'; x.fillRect(W - 60, H - 16, 56, 14); Font.drawC(x, '換' + KD.SLOTS16[S.sl][1], W - 32, H - 15, '#fff4e0', '#000', 9); touchRegion(W - 60, H - 16, 56, 14, () => { S.go = S.sl; });
      x.fillStyle = '#4a3a50'; x.fillRect(4, H - 16, 36, 14); Font.drawC(x, '返回', 22, H - 15, '#e8e4f4', '#000', 9); touchRegion(4, H - 16, 36, 14, () => { S.done = true; }); } };
  UI.push(ui); Input.consume('a', 'b');
  while (!S.done) { yield; if (Input.pressed('b')) break; if (Input.pressed('down')) { S.sl = (S.sl + 1) % 4; S.card = 0; Sound.sfx('cursor'); } if (Input.pressed('up')) { S.sl = (S.sl + 3) % 4; S.card = 0; Sound.sfx('cursor'); }
    if (Input.pressed('right') || Input.pressed('left')) { const g = KD.eqGear16(st, KD.SLOTS16[S.sl][0]), n = g ? KD.gearCardsOf16(g.b).length : 0; if (n > 1) S.card = (S.card + 1) % n; }
    if (Input.pressed('a')) S.go = S.sl;
    if (S.go >= 0) { const i = S.go; S.go = -1; UI.remove(ui); yield* KD.swap16(KD.SLOTS16[i][0]); S.card = 0; UI.push(ui); Input.consume('a', 'b'); } }
  UI.remove(ui); Input.consume('a', 'b'); };

/* ---------- 鐵匠：打造 ---------- */
// the farthest region reached decides the top tier (T8: 第三章)
KD.craftTop16 = (st = Game.st) => { const lv = Math.max(st.lv || 1, KD.topLv ? KD.topLv(st) : 1); return lv >= 52 ? 8 : Math.min(7, 2 + Math.floor(Math.max(0, lv - 4) / 6)); };
// points = the points kept + what the bag's materials are worth (quest materials stay)
KD.matsOf16 = (st, cat) => { const R = reserved11(st); return Object.keys(st.bag || {}).filter(k => MATCAT11[k] === cat && (st.bag[k] || 0) - (R[k] || 0) > 0).map(k => [k, st.bag[k] - (R[k] || 0), tierPts11(MATT11[k] || 1)]); };
KD.ptsHave16 = (st, cat) => (pts11(st)[cat] || 0) + KD.matsOf16(st, cat).reduce((a, [, n, v]) => a + n * v, 0);
KD.canPay16 = (st, c) => Object.entries(c.pts).every(([cat, n]) => KD.ptsHave16(st, cat) >= n) && st.money >= c.gold && itemsHave13(c.items);
KD.pay16 = (st, c) => { const P = pts11(st);
  for (const [cat, need] of Object.entries(c.pts)) { const L = KD.matsOf16(st, cat).sort((a, b) => b[2] - a[2]); // the most valuable first: the fewest materials go
    for (const [k, n, v] of L) { let m = n; while (m > 0 && (P[cat] || 0) < need) { m--; st.bag[k]--; P[cat] = (P[cat] || 0) + v; } if (!st.bag[k]) delete st.bag[k]; if ((P[cat] || 0) >= need) break; }
    P[cat] = Math.max(0, (P[cat] || 0) - need); }
  st.money -= c.gold; for (const [k, n] of Object.entries(c.items || {})) { st.bag[k] -= n; if (st.bag[k] <= 0) delete st.bag[k]; } };
KD.costTxt16 = c => Object.entries(c.pts).map(([a, n]) => a + n).join('・');
KD.craft16 = function* () { const st = Game.st, top = KD.craftTop16(st);
  while (true) { const r = yield* ask('要打什麼？（能打到 T' + top + '）', ['武器', '防具', '返回']); if (r < 0 || r === 2) return;
    let group, pick;
    if (r === 0) { const K = KD.WKINDS16, k = yield* ask('哪一種武器？', K.map(q => q + '（' + (q === '法杖' ? '看法杖' : KD.atName16(BASE11.weapon[q][0])) + '）').concat('返回')); if (k < 0 || k >= K.length) continue; group = K[k]; pick = t => BASE11.weapon[group][t - 1]; }
    else { const Sr = ['重甲', '輕裝', '法衣'], s = yield* ask('哪一系？\n重甲：格擋多　輕裝：抽卡・0 費\n法衣：便宜的格擋', Sr.concat('返回')); if (s < 0 || s >= 3) continue;
      const sl = yield* ask('哪個部位？', ['頭（1 張）', '身體（2 張）', '腳（1 張）', '返回']); if (sl < 0 || sl >= 3) continue; group = Sr[s]; const slot = ['head', 'body', 'feet'][sl]; pick = t => BASE11.armor[group][slot][t - 1]; }
    const cats = CRAFTCAT11[group], rows = [];
    for (let t = 1; t <= top; t++) { const b = pick(t); if (!b || !GEAR[b]) continue; const c = craftCost11(group, t); rows.push({ name: 'T' + t + ' ' + GEAR[b].n, sub: KD.costTxt16(c) + (Object.keys(c.items).length ? '＊' : ''), dim: !KD.canPay16(st, c), b, t, c }); }
    let sel = rows.length - 1;
    while (true) { const i = yield* KD.gearList16(group + '：打造', rows, { sel, info: () => '有：' + cats.map(a => a + ' ' + KD.ptsHave16(st, a)).join('・') + '　' + st.money + ' G（素材自動換成點數）', act: R => (R.dim ? '材料不夠' : '打造（' + R.c.gold + ' G）') });
      if (i < 0) break; sel = i; const R = rows[i], B = GEAR[R.b];
      if (R.dim) { Sound.sfx('buzz'); yield* say('還不夠：' + KD.costTxt16(R.c) + ' 點、' + R.c.gold + ' G' + (Object.keys(R.c.items).length ? '、' + itemsText13(R.c.items) : '') + '。\n（打倒魔物會掉素材；素材自動換成點數）'); continue; }
      if (!(yield* yesNo('打造「' + B.n + '」？\n需要：' + KD.costTxt16(R.c) + ' 點、' + R.c.gold + ' G' + (Object.keys(R.c.items).length ? '、' + itemsText13(R.c.items) : '')))) continue;
      KD.pay16(st, R.c); const g = KD.mkGear16(R.b, 1); for (const q of rows) q.dim = !KD.canPay16(st, q.c);
      Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle('item'); yield* say('打好了！「' + GEAR[g.b].n + '」');
      const sl = GEAR[g.b].slot; if (yield* yesNo('現在就換上嗎？')) { st.equip[sl] = g.u; Sound.sfx('item'); } } } };
{ const _sm = smithMenu; smithMenu = function* (...a) { const st = Game.st; if (!KD.g16(st)) return yield* _sm.apply(this, a);
    if (!st.flags.tutSmith16) { st.flags.tutSmith16 = 1; yield* say('這裡可以打造裝備，也可以升級卡。\n身上的裝備會變成戰鬥用的卡喔。'); }
    while (true) { const r = yield* ask('要做什麼？', ['打造裝備', '卡牌工坊（升級卡）', '離開']); if (r === 0) yield* KD.craft16(); else if (r === 1) yield* KD.workshop(); else return; } }; }
if (typeof GROW12 !== 'undefined') GROW12.push(['裝備就是牌組', '身上的武器・頭・身體・腳會帶卡進牌組（武器 4 張、身體 2 張、頭和腳各 1 張）。武器決定攻擊屬性，打頭目前看弱點換裝備；鐵匠用素材和金幣打造新裝備。']);

/* ---------- 牌組畫面：職業卡／裝備卡兩頁 ---------- */
{ const _ds = KD.deckScreen; KD.deckScreen = function* () { const st = Game.st; if (!KD.g16(st)) return yield* _ds.call(this);
    const grp = L => { const G = []; for (const c of KD.sorted(L)) { const g = G[G.length - 1]; if (g && g.id === c.id && (g.up || 0) === (c.up || 0) && !!g.aw === !!c.aw) g.n++; else G.push({ id: c.id, up: c.up || 0, aw: c.aw, g16: c.g16, n: 1 }); } return G; };
    const A = grp(KD.deck(st)), B = grp(KD.gearCards16(st));
    yield* KD.grid('牌組・' + KD.clsOf(st).n, A, { tabs: [{ n: '職業卡 ' + KD.deck(st).length, cards: A }, { n: '裝備卡 ' + KD.gearCards16(st).length, cards: B }], rows: 3, badge: c => (c.n > 1 ? '×' + c.n : '') }); }; }
// the smith makes gear again
KD.TXT.push([/我是鎮上的鐵匠，也幫冒險者打磨卡牌：帶金幣和素材來，我幫你把卡升級！/g, '我是鎮上的鐵匠。把魔物身上的素材帶來，我幫你打造裝備，也能把卡升級！'],
  [/鐵匠那裡可以升級卡牌。/g, '鐵匠那裡可以打造裝備、升級卡牌。'], [/鐵匠的卡牌工坊升級卡要用！/g, '鐵匠打造裝備、升級卡都要用！'],
  // v14.0 turned these into card talk; with 打造 back they are true again
  [/鐵匠說，這是很珍貴的素材。/g, '鐵匠說，拿來打造武器最合適。'], [/不過你的卡，我照樣幫你升級。/g, '不過你的裝備，我照樣打得出來。'], [/以後帶素材來，我幫你把卡升級。/g, '以後帶素材來，我幫你打造裝備、升級卡。'],
  [/是升級卡牌的好素材。/g, '是打造沙漠裝備的好材料。'], [/想變強的話，去鐵匠那裡把卡升級吧。/g, '想變強的話，去鐵匠那裡打造裝備、把卡升級吧。']);
