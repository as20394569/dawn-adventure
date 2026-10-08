/* ===================== v14.13 弱點破防（全部魔物） =====================
   玩家：「我們要打造出自己的玩法與特色」→ 選了三個方向：① 每個職業一種專屬資源、② 弱點破防、③ 卡牌熟練・覺醒（企劃：專案文件「曙光冒險-自己的玩法企劃」）。
   10/07 拿掉 RPG 版元素系統的原因（沒得選、反應感覺不到）跟玩家確認過，這次照新設計加回來。
   · 攻擊屬性 6 種：斬・突・打（物理）、火・水・雷（魔法）。每張攻擊卡一種（卡面右上角）
   · 魔物弱點：一般 2 個（物理 1＋魔法 1，依種族；三分之一的魔物物理弱點跟種族不同），菁英・頭目 3 個；沒打中過是「？」，打中才亮，記進圖鑑
   · 破防值：一般 3、菁英 5、頭目 8；打中弱點每一下 −1
   · 破防：這回合不能行動（蓄力也中斷），到你下回合結束前受到的傷害 ×1.5；之後回滿，菁英每次 +1、頭目每次 +2
   · 職業破防方式（不管弱點）：劍士 劍意 ×2 那一擊 −2；狂戰士 劈山 −2、碎盾擊 −3；法師 元素反應 −1（14o）；盜賊靠多段攻擊
   用的是 RPG 版留下來的破防值（brk）、「破防」狀態、BREAK 動畫和名牌上的盾牌。 */

/* ---------- 攻擊屬性 ---------- */
KD.PHYS = ['斬', '突', '打']; KD.ELEM = ['火', '水', '雷'];
KD.ATC = { 斬: ['#e8eaf4', '#3c3e58'], 突: ['#b8f4a8', '#1c3c24'], 打: ['#ffc888', '#4c2c12'], 火: ['#ffb878', '#5c1c10'], 水: ['#98d4ff', '#123462'], 雷: ['#fff070', '#4c3c06'] };
const AT16 = { sw_gap: '突', sw_bash: '打', sw_wall: '打', rg_venom: '斬', rg_quick: '斬', rg_rot: '斬', rg_reap: '斬', rg_dance: '斬', rg_bloom: '斬', rg_stitch: '斬', rg_needle: '雷',
  nt_dash: '突', nt_pierce: '突', nt_rapid: '突', nt_sweep: '斬', nt_dawn: '斬', nt_twin: '斬', nt_aim: '突', nt_shbash: '打', nt_echo: '打', nt_roar: '打',
  lg_gren: '打', lg_dune: '突', lg_hydra: '突', lg_harvest: '斬', lg_mold: '斬', lg_rift: '斬', lg_otto: '突', q_sand: '斬', q_master: '斬', q_mimic: '突', q_bell: '打', q_bond: '斬', q_fang: '突', q_star: '突', tk_shiv: '突' };
// a card's attack type (attacks), or its element (skills that leave a mark); null = 無
KD.atOf = id => { const C = KD.CARDS[id]; if (!C) return null; if (AT16[id] !== undefined) return AT16[id]; if (C.el && KD.ELEM.includes(C.el)) return C.el; if (C.type !== 'atk') return null; return { sw: '斬', rg: '突', bk: '打' }[C.cls] || null; };

/* ---------- 魔物的弱點 ---------- */
const WK_FAM16 = { beast: ['斬', '火'], insect: ['打', '火'], plant: ['斬', '火'], bird: ['突', '雷'], ooze: ['打', '雷'], aquatic: ['突', '雷'], construct: ['打', '水'], undead: ['打', '火'], spirit: ['突', '水'], dragon: ['突', '水'], human: [null, '雷'] };
const h16 = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
KD.weakOf = (sp, big) => { const S = SPECIES[sp] || {}, F = WK_FAM16[S.fam] || [null, null], h = h16(sp);
  let p = F[0] || KD.PHYS[h % 3]; const e = F[1] || KD.ELEM[(h >>> 3) % 3];
  if (F[0] && h % 4 === 0) p = KD.PHYS[(KD.PHYS.indexOf(p) + 1 + ((h >>> 5) % 2)) % 3]; // a quarter of the species are not like their family
  const L = [p, e]; if (big) { const rest = KD.PHYS.concat(KD.ELEM).filter(x => !L.includes(x)); L.push(rest[(h >>> 7) % rest.length]); }
  return L.sort((a, b) => '斬突打火水雷'.indexOf(a) - '斬突打火水雷'.indexOf(b)); };
KD.BRK = { wild: [3, 0], elite: [5, 1], boss: [8, 2] }; KD.BRK_MUL = { wild: 1.5, elite: 1.5, boss: 1.5 };
KD.brkKind = u => (u.boss ? 'boss' : u.elite || (u.data && u.data.elite) ? 'elite' : 'wild');
// every monster in a card battle has a break gauge and its weaknesses (the RPG gave one only to elites / bosses)
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s || !KD.use()) return s;
    const k = kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : 'wild'; s.brkMax = KD.BRK[k][0]; const mech = s.data.mechanics || (s.data.mechanics = []); if (!mech.includes('breakGauge')) mech.push('breakGauge');
    s.data.wk16 = KD.weakOf(sp, k !== 'wild'); return s; }; }
// what the player has found: K.wk16[sp] = ['斬', …]
KD.wkSeen = sp => { const K = Game.st && KD.state(Game.st); return (K && K.wk16 && K.wk16[sp]) || []; };
KD.wkFind = (u, at) => { if (!Game.st || !u || !u.sp) return; const K = KD.state(Game.st), L = (K.wk16 = K.wk16 || {})[u.sp] = K.wk16[u.sp] || []; if (!L.includes(at)) { L.push(at); return true; } };

/* ---------- 打中弱點・職業的破防方式 ---------- */
// the RPG's chip effect (hunt_chip) was turned off by the ward shields (s5); card battles take the gauge down here
KD.chip = (core, a, t, n) => { if (!t || !core.isUp(t) || !t.max || !t.max.brk || !(t.res.brk > 0) || n <= 0 || core.hasStatus(t, 'broken') || core.hasStatus(t, 'brkx16')) return;
  core.changeRes(t, 'brk', -n, { src: a, why: 'k16' });
  if (t.res.brk <= 0 && core.isUp(t)) core.emit(EVT.BREAK, { src: a, tgts: [t], tags: ['break'] }, () => { core.applyStatus(a, t, 'broken', {}); core.removeStatus(t, 'charging', 'break'); core.removeStatus(t, 'airborne', 'break'); }); };
KD.isBroken = (core, t) => !!(t && (core.hasStatus(t, 'broken') || core.hasStatus(t, 'brkx16')));
KD.BRK_CARD = { bk_split: 2, bk_crush: 3 };
{ const _h = KD.hit; KD.hit = function (core, a, t, base, o = {}) {
    if (!KD.on(core) || !a || !a.hero || !t || t.hero) return _h.call(this, core, a, t, base, o);
    if (KD.isBroken(core, t)) o = { ...o, mul: (o.mul || 1) * KD.BRK_MUL[KD.brkKind(t)] };
    const id = String(core.data.skill14 || '').replace(/^k14_/, ''), at = o.at || (o.el && KD.ELEM.includes(o.el) ? o.el : null) || KD.atOf(id);
    const up = core.isUp(t), got = _h.call(this, core, a, t, base, o); if (!up || !core.isUp(t)) return got;
    let n = 0; const W = (t.data && t.data.wk16) || [];
    if (at && W.includes(at)) { n++; if (KD.wkFind(t, at)) core.emit(EVT.MESSAGE, { src: a, tgts: [t], payload: { key: 'wk16', text: '', at } }); }
    const once = core.data.brkOnce16 || (core.data.brkOnce16 = new Set()), key = id + '@' + t.id;
    if (core.data.si2 && !once.has('si' + key)) { once.add('si' + key); n += 2; }
    if (KD.BRK_CARD[id] && !once.has('bk' + key)) { once.add('bk' + key); n += KD.BRK_CARD[id]; }
    if (o.brk16) n += o.brk16;
    if (n) KD.chip(core, a, t, n);
    return got; }; }
// each card starts its own 「once」 set (劍意 ×2 and 劈山 count once per target per card)
{ const _rc = BPK.runCard; BPK.runCard = function (c, ctx) { if (this.core) this.core.data.brkOnce16 = new Set(); return _rc.call(this, c, ctx); }; }

/* ---------- 破防的長度：到你下回合結束 ---------- */
KD.st('brkx16', '破防', 'deb', '受到的傷害 ×1.5', { deb: 1 });
{ const S = DEF.statuses.broken, _or = S.onRemove; S.onRemove = function (core, u, inst, why) {
    if (!KD.on(core)) return _or && _or.call(this, core, u, inst, why);
    if (why === 'expire' && core.isUp(u)) { core.applyStatus(u, u, 'brkx16', { delta: 1 }); return; } // its turn is gone: still 破防 through your next turn
    if (core.isUp(u) && !core.hasStatus(u, 'brkx16')) KD.refill(core, u); }; }
KD.refill = (core, u) => { if (!u || !u.max || !u.max.brk) return; const inc = KD.BRK[KD.brkKind(u)][1]; u.data.brkN16 = (u.data.brkN16 || 0) + 1; u.max.brk += inc; core.changeRes(u, 'brk', u.max.brk, { why: 'recover' }); };
{ const _et = BPK.endTurnK; BPK.endTurnK = function () { const r = _et.apply(this, arguments); const core = this.core;
    for (const u of core.alive('B')) if (core.hasStatus(u, 'brkx16')) { core.removeStatus(u, 'brkx16', 'expire'); KD.refill(core, u); }
    return r; }; }
// a monster that is 破防 this round shows it instead of its plan
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { if (KD.on(core) && u && core.hasStatus(u, 'broken')) return { k: 'down', t: '破防' }; if (KD.on(core) && u && !u.hero && core.hasStatus(u, 'flinch')) return { k: 'down', t: '不能動' }; return _io(core, u, cmd); }; } // 感電・定身 too
// the view: 破防 through your next turn looks like 破防 (red gauge, 「破防」, the flashing)
{ const _sy = Battle.prototype.sync; Battle.prototype.sync = function () { _sy.call(this); if (!this.k14) return; for (const v of Object.values(this.views)) if (v && v.st && v.st.brkx16) v.st.broken = 1; }; }

/* ---------- 畫面：弱點的小方塊、破防值 ---------- */
KD.atBox = (x, X, Y, at, dim) => { const C = at ? KD.ATC[at] : ['#9a98b0', '#24222e']; x.fillStyle = '#000'; x.fillRect(X - 1, Y - 1, 11, 11); x.fillStyle = C[1]; x.fillRect(X, Y, 9, 9);
  x.fillStyle = C[0]; x.globalAlpha *= 0.5; x.fillRect(X, Y + 8, 9, 1); x.globalAlpha *= 2; Font.drawC(x, at || '？', X + 4.5, Y - 4, at ? C[0] : '#b8b6c8', null, 8); };
KD.wkRow = (x, v, X, Y) => { const u = v.u16 || v; const W = (u.data && u.data.wk16) || v.wk16 || []; const seen = KD.wkSeen(v.sp); let z = X;
  for (const at of W) { KD.atBox(x, z, Y, seen.includes(at) ? at : null); z += 11; } return z; };
// the small shield: the gauge left (or ×)
KD.brkMini = (x, X, Y, n, broken) => { x.fillStyle = '#000'; x.fillRect(X - 1, Y - 1, 10, 11); x.fillStyle = broken ? '#ff5a5a' : '#9ab8e8'; x.fillRect(X, Y, 8, 7); x.fillRect(X + 1, Y + 7, 6, 1); x.fillRect(X + 2, Y + 8, 4, 1);
  x.fillStyle = broken ? '#5a1018' : '#2a3a5a'; x.fillRect(X + 1, Y + 1, 6, 5); Font.draw(x, broken ? '破' : String(n), X + 10, Y - 4, broken ? '#ffb0a0' : '#d8ecff', '#000', 8); };
{ const B = Battle.prototype, _ps = B.drawPlateSmall; B.drawPlateSmall = function (x, v, a, i, n) { if (!this.k14) return _ps.call(this, x, v, a, i, n);
    const mx = v.max.brk, _bR = badgeRow, _dS = drawStageIcons; v.max.brk = 0; badgeRow = (x, L, X, Y, ...r) => _bR(x, L, X, Y + 12, ...r); drawStageIcons = (x, v, X, Y, ...r) => _dS(x, v, X, Y + 12, ...r);
    try { _ps.call(this, x, v, a, i, n); } finally { v.max.brk = mx; badgeRow = _bR; drawStageIcons = _dS; } if (a <= 0) return; // the old pips go: the shield and the weaknesses sit in a row under the plate
    const sw = Math.floor((W - 4) / Math.max(1, n)), w = Math.min(n >= 3 ? 56 : 80, sw - 2), X = Math.round(clamp(v.x - w / 2, 2 + i * sw, 2 + i * sw + sw - 2 - w)), py = 4, u = this.core.byId[v.id];
    x.globalAlpha = a; x.fillStyle = 'rgba(10,8,20,0.78)'; x.fillRect(X, py + 22, w, 12);
    let z = X + 2; if (mx) { KD.brkMini(x, z + 1, py + 24, v.res.brk || 0, v.broken > 0); z += 10 + Math.ceil(Font.width(v.broken > 0 ? '破' : String(v.res.brk || 0), 8)) + 3; }
    KD.wkRow(x, { sp: v.sp, data: u && u.data }, z, py + 24); x.globalAlpha = 1; };
  const _pb = B.drawPlateBig; B.drawPlateBig = function (x, F, a0) { _pb.call(this, x, F, a0); if (!this.k14) return; const a = a0 * F.plateA; if (a <= 0) return; const u = this.core.byId[F.id], w = 120, X = (W - w) / 2, py = 6, pe = plateExtra();
    x.globalAlpha = a; const L = (u && u.data && u.data.wk16) || []; x.fillStyle = 'rgba(10,8,20,0.7)'; x.fillRect(X + 4, py + 33 + pe, 16 + L.length * 11, 12); Font.draw(x, '弱', X + 6, py + 31 + pe, '#ffd070', UIC.textSh, 8);
    KD.wkRow(x, { sp: F.sp, data: u && u.data }, X + 16, py + 35 + pe); x.globalAlpha = 1; };
}

/* ---------- 戰鬥說明・提示 ---------- */
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.unshift(['弱點破防', ['每張攻擊卡有屬性（卡的右上角）：斬・突・打・火・水・雷。魔物名牌下面是牠的弱點，打中過才會亮出來（「？」＝還不知道）。',
  '打中弱點，名牌上的盾牌數字 −1；扣到 0 就「破防」：這回合不能行動，到你下回合結束前受到的傷害 ×1.5。破防後盾牌會回滿，菁英和頭目會越來越難破。',
  '劍士劍意 ×2 的一擊、狂戰士的劈山和碎盾擊、法師的元素反應，不用打弱點也能扣盾牌。']]);
{ const H = Battle.prototype.handlers, _m = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { if (P && P.key === 'wk16') { if (t) { const C = this.center(t); this.pops.push({ x: C.x, y: C.y - 52, s: '弱點：' + P.at, c: KD.ATC[P.at][0], t: 0 }); Sound.sfx('select'); }
      const f = Game.st && Game.st.flags; if (f && !f.tutWk16) { f.tutWk16 = 1; yield* this.msg('（打中弱點了！名牌上的盾牌數字 −1，扣到 0 魔物就會破防。）', { hold: 90 }); } return; } return yield* _m.call(this, e, s, t, P); }; }
// the card face: its attack type in the top-right corner (left of the rarity dot); on an overlapped hand card, at the right end of the strip that shows
{ const _dc = KD.drawCard; KD.drawCard = function (x, c, X, Y, w, h, o = {}) { _dc.call(this, x, c, X, Y, w, h, o); const at = c && KD.atOf(c.id); if (!at) return;
    const vw = Math.min(w, o.vis || w); if (vw < 26) return; const bx = X + (o.visX0 || 0) + vw - 14; KD.atBox(x, bx, Y + 2, at); if (o.dim) { x.fillStyle = 'rgba(0,0,0,0.38)'; x.fillRect(bx - 1, Y + 1, 11, 11); } }; }
// 頭目・菁英 stay as hard as before 破防 (玩家：頭目和菁英要維持難度): the class decks of the playtest bot, 15 fights × 4 classes —
// with 破防 bosses lost ~2.5 actions a fight (HP left 66〜72% → 70〜87%); HP ×1.15 (bosses) / ×1.1 (elites) brings it back (64〜71%)
KD.BRK_HP = { boss: 1.15, elite: 1.1 };
{ const _s = KD.scale; KD.scale = (core, u) => { const fresh = u && u.side === 'B' && !(u.data && u.data.k14s); _s(core, u); if (!fresh || !KD.on(core)) return; const m = KD.BRK_HP[KD.brkKind(u)];
    if (m) { const r = u.res.hp / Math.max(1, u.max.hp); u.max.hp = Math.round(u.max.hp * m); u.res.hp = Math.max(1, Math.round(u.max.hp * r)); } }; }
