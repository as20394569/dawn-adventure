/* ===================== v14.13 法師「元素反應」 =====================
   ① 每個職業一種專屬資源：法師先做（玩家選「先做一個職業試玩」）。
   · 火・水・雷的卡在魔物身上留下印記（一隻一個，畫在頭上的圖示左邊）；技能卡只在沒有印記的魔物身上留
   · 換另一種元素的攻擊打中有印記的魔物 → 反應，兩個元素都用掉（這一下不再留印記）：
     蒸發（火＋水）這一擊 ×2；爆炸（火＋雷）其他魔物也受到這一擊的傷害；感電（水＋雷）牠這回合不能行動（頭目：虛弱 2、易傷 2）
   · 每次反應破防值 −1（不管弱點）
   · 多段攻擊：第一下反應，之後每一下再留印記 */
KD.RX = { 水火: '蒸發', 火雷: '爆炸', 水雷: '感電' };
KD.rxOf = (a, b) => KD.RX[[a, b].sort((p, q) => '水火雷'.indexOf(p) - '水火雷'.indexOf(q)).join('')] || null;
KD.RXC = { 蒸發: '#e8f4ff', 爆炸: '#ff9a40', 感電: '#fff070' };
KD.onRx = []; // (core, cb, t, rx, got) — the awakened cards hook in here (14p)
KD.noRx16 = core => { const cb = (core && core.data && core.data.cb14) || Game.scene; return !!(cb && cb.k14 && cb.cls && cb.cls !== 'mg'); }; // v14.16: other classes can carry 火・水・雷 cards (a staff): only the mage leaves marks
KD.mark = (t, el, skill) => { if (!t || !t.data || !KD.ELEM.includes(el) || KD.noRx16()) return; if (skill && t.data.mk16) return; t.data.mk16 = el; };
// the first mark a mage leaves: one line of help (after the card, at the start of the next command)
{ const _cm = BPK.command; BPK.command = function* () { const f = Game.st && Game.st.flags, core = this.core; if (this.k14 && f && !f.tutMk16 && this.cls === 'mg' && core && core.alive('B').some(u => u.data && u.data.mk16) && !Game.autoPlay) { f.tutMk16 = 1; yield* this.msg('（魔物頭上出現了元素印記！換另一種元素的攻擊打中，就會引發反應：火＋水＝蒸發、火＋雷＝爆炸、水＋雷＝感電。）', { hold: 120 }); } return yield* _cm.apply(this, arguments); }; }
{ const _h = KD.hit; KD.hit = function (core, a, t, base, o = {}) {
    if (!KD.on(core) || !a || !a.hero || !t || t.hero || !core.isUp(t)) return _h.call(this, core, a, t, base, o);
    const id = String(core.data.skill14 || '').replace(/^k14_/, ''), at = o.at || core.data.at16 || (o.el && KD.ELEM.includes(o.el) ? o.el : null) || KD.atOf(id);
    if (!KD.ELEM.includes(at) || KD.noRx16(core)) return _h.call(this, core, a, t, base, o);
    const mk = t.data.mk16, rx = mk && mk !== at ? KD.rxOf(mk, at) : null;
    if (!rx) { t.data.mk16 = at; return _h.call(this, core, a, t, base, { ...o, at }); }
    t.data.mk16 = null; core.data.rxN16 = (core.data.rxN16 || 0) + 1;
    const others = rx === '爆炸' ? core.alive('B').filter(u => u !== t) : [];
    core.emit(EVT.MESSAGE, { src: a, tgts: [t], payload: { key: 'rx16', rx, others: others.map(u => u.id), text: '' } });
    const got = _h.call(this, core, a, t, base, { ...o, at, mul: (o.mul || 1) * (rx === '蒸發' ? 2 : 1), brk16: (o.brk16 || 0) + 1, flat: (o.flat || 0) + (KD.rxFlat ? KD.rxFlat(core) : 0) });
    if (rx === '爆炸' && got > 0) for (const u of others) if (core.isUp(u)) core.dealDamage(a, u, got, { kind: 'hit', skill: core.data.skill14, el: '火', cat: '特', n: 0, tags: ['card14', 'rx16'], min: 0 });
    if (rx === '感電' && core.isUp(t)) { if (t.boss) { KD.add(core, a, t, 'weak15', 2); KD.add(core, a, t, 'vuln15', 2); } else { core.removeStatus(t, 'charging', 'break'); core.applyStatus(a, t, 'flinch', {}); } }
    const cb = core.data.cb14; for (const f of KD.onRx) { try { f(core, cb, t, rx, got); } catch (e) { /* a bonus never stops the card */ } }
    return got; }; }
// element skills (火花・遲滯咒…) leave their mark on monsters that have none; 點燃 marks everyone at the start of the turn
{ const _rc = BPK.runCard; BPK.runCard = function (c, ctx) { const r = _rc.call(this, c, ctx), C = KD.CARDS[c.id], core = this.core, el = C && KD.atOf(c.id);
    if (C && C.type !== 'atk' && KD.ELEM.includes(el) && C.tg !== 'self') { const L = C.tg === 'all' ? core.alive('B') : (ctx.targets || []).filter(t => t && t.side === 'B' && core.isUp(t)); for (const t of L) KD.mark(t, el, true); }
    return r; }; }
{ const _st = BPK.startTurnK; BPK.startTurnK = function () { const r = _st.apply(this, arguments); const core = this.core; if (stkK(this.Hu(), 'pwKindle14')) for (const t of core.alive('B')) KD.mark(t, '火', true); return r; }; }
// the 「last element」 a card can borrow (awakened 魔力彈 etc., 14p)
{ const _rc = BPK.runCard; BPK.runCard = function (c, ctx) { const el = KD.atOf(c.id); const r = _rc.call(this, c, ctx); if (KD.ELEM.includes(el)) this.lastEl16 = el; return r; }; }

/* ---------- 畫面：印記、反應 ---------- */
KD.markIcon = (x, X, Y, el, t) => { const C = KD.ATC[el], p = 0.5 + 0.5 * Math.sin((t || 0) / 6); x.fillStyle = 'rgba(0,0,0,0.85)'; x.beginPath(); x.arc(X, Y, 7, 0, 7); x.fill();
  x.globalAlpha = 0.35 + 0.35 * p; x.fillStyle = C[0]; x.beginPath(); x.arc(X, Y, 7, 0, 7); x.fill(); x.globalAlpha = 1; x.fillStyle = C[1]; x.beginPath(); x.arc(X, Y, 5.5, 0, 7); x.fill();
  Font.drawC(x, el, X, Y - 8, C[0], null, 8); };
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); const core = this.core; if (!this.k14 || !core || this.boxF < -20) return;
    for (const v of this.foes()) { const u = core.byId[v.id]; if (!u || !u.data || !u.data.mk16 || v.gone || v.alpha < 0.5) continue;
      let w = 13; try { const I = intentOf14(core, u, core.plan && core.plan[v.id]); if (I && I.t) w = 13 + Math.ceil(Font.width(I.t, 8)) + 3; } catch (e) { }
      const X = Math.round(clamp(v.x + v.off.x - w / 2, 17, W - w - 2)) - 9, Y = Math.round(v.foot - v.bbh - 17 + v.sink * (v.sink < 0 ? 1 : 0)) + 6;
      KD.markIcon(x, Math.max(8, X), Y, u.data.mk16, this.t); } }; }
{ const H = Battle.prototype.handlers, _m = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { if (!P || P.key !== 'rx16') return yield* _m.call(this, e, s, t, P); if (!t) return;
    const C = this.center(t), rx = P.rx; this.pops.push({ x: C.x, y: C.y - 46, s: rx + '！', c: KD.RXC[rx], t: 0, big: 1 }); this.shake = Math.max(this.shake || 0, rx === '爆炸' ? 16 : 8);
    if (rx === '蒸發') { Sound.sfx('water'); for (let i = 0; i < 14; i++) this.spawn({ k: 'circ', x: C.x + rnd(-14, 14), y: C.y + rnd(-6, 10), vx: rnd(-6, 6) / 10, vy: -rnd(6, 16) / 10, r: rnd(2, 4), c: pick(['#ffffff', '#e0ecf4', '#c4d8e8']), life: 28 }); this.sparks(C.x, C.y, 10, ['#ffffff', '#a8d8ff'], 1.6, 18); }
    if (rx === '爆炸') { Sound.sfx('fire'); Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ff8030', a: 0.35, life: 8 }); for (const id of [t.id].concat(P.others || [])) { const v = this.views[id]; if (!v) continue; const D = this.center(v);
        this.spawn({ k: 'ring', x: D.x, y: D.y, r0: 4, r1: 26, c: '#ffb050', w: 3, life: 14 }); this.sparks(D.x, D.y, 18, ['#ff5020', '#ff9a30', '#ffe070'], 3, 20, 0.08); for (let i = 0; i < 6; i++) this.spawn({ k: 'flame', x: D.x + rnd(-10, 10), y: D.y + rnd(-4, 12), vy: -0.6, s: pick([3, 4, 5]), life: 18 }); } }
    if (rx === '感電') { Sound.sfx('thunder'); for (let k = 0; k < 3; k++) { const pts = []; let x0 = C.x + rnd(-12, 12), y0 = C.y - 26; for (let i = 0; i < 5; i++) { pts.push([x0, y0]); x0 += rnd(-7, 7); y0 += rnd(7, 11); } this.spawn({ k: 'bolt', pts, w: 2, life: 10 + k * 3 }); }
      this.sparks(C.x, C.y, 14, ['#fff070', '#ffffff', '#c8b0ff'], 2.4, 16); }
    yield* wait(8); }; }

/* ---------- 說明 ---------- */
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.unshift(['元素反應（法師）', ['火・水・雷的卡會在魔物頭上留下印記。換另一種元素的攻擊打中，就會引發反應，兩個元素都會用掉：',
  '蒸發（火＋水）：這一擊傷害 ×2。爆炸（火＋雷）：其他魔物也受到這一擊的傷害。感電（水＋雷）：牠這回合不能行動（頭目改成虛弱 2、易傷 2）。', '每次反應，魔物的破防值 −1。技能卡只會在還沒有印記的魔物身上留下印記。']]);
