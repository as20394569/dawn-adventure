/* ===================== v14.16 劍士・盜賊・狂戰士的專屬玩法 =====================
   玩家：「之前只完成法師的風格 其他職業也要有專屬風格」→ 選了（全部推薦）：
   · 劍士「看破」換掉劍意：魔物的攻擊被格擋完全擋下 → 看破 +1（最多 3）。下一張攻擊卡用掉全部：每層 +4 傷害（每隻魔物算一次）、破防值 −1（14c・14n）
     架勢・調息・心眼・燕返・納刀・破曉千斬的「劍意」改成「看破」；看破的那一擊算會心（熔岩甲打得裂）
   · 盜賊「暗影」，連擊保留：攻擊每一下讓那隻魔物疊 1 層「影」（頭上顯示）；疊到 5 層 →「影縛」：
     牠這回合不能行動、破防值 −2，影清空（頭目只扣破防值）。同一隻魔物一回合最多影縛一次（多的影留著，最多 5）
   · 狂戰士「怒氣」換掉血怒：被魔物打掉 HP、或自己的卡扣血，怒氣 +1（最多 5）。
     滿 5 的下一回合開始「狂化」：這回合能量 +1、攻擊卡傷害 ×1.5，怒氣歸零。阿修羅：怒氣 4 就狂化 */
KD.KP_DMG = 4; KD.KZ_MUL = 1.5; KD.SH_MAX = 5; KD.RAGE_MAX = 5; KD.KP_ANY = 0; KD.SH_CHIP = 2;
KD.SH_BOSS = 0; // 頭目被影縛只扣破防值（玩家選的：虛弱 2・易傷 2 讓頭目戰太簡單，模擬剩 HP 80%→66%）
KD.rageNeed = cb => (stkK(cb.Hu(), 'pwAsuraA16') ? 3 : stkK(cb.Hu(), 'pwAsura14') ? 4 : KD.RAGE_MAX);
KD.rageAdd16 = (cb, n) => { if (cb.cls !== 'bk') return; cb.rage16 = Math.min(KD.RAGE_MAX, (cb.rage16 || 0) + n); };

/* ---------- 看破・怒氣：看主角挨的每一下 ---------- */
{ const _dd = BattleCore.prototype.dealDamage; BattleCore.prototype.dealDamage = function (src, tgt, amount, info = {}) {
    const cb = KD.on(this) && this.data.cb14; if (!cb || !tgt || !tgt.hero) return _dd.apply(this, arguments);
    const foeHit = info.kind === 'hit' && src && !src.hero, a = Math.max(0, Math.floor(amount)), full = foeHit && a > 0 && (KD.KP_ANY ? stkK(tgt, 'blk15') > 0 : stkK(tgt, 'blk15') >= a), hp0 = tgt.res.hp;
    const r = _dd.apply(this, arguments);
    if (full && cb.cls === 'sw' && (cb.si || 0) < 3) { cb.si = Math.min(3, (cb.si || 0) + 1 + (stkK(tgt, 'pwCtrA16') && stkK(tgt, 'pwCtr15') ? 1 : 0)); cb.kpFx16 = { t: 0 }; Sound.sfx('select'); }
    const lost = hp0 - tgt.res.hp, self = (info.tags || []).includes('self');
    if (cb.cls === 'bk' && lost > 0 && (foeHit || self) && (cb.rage16 || 0) < KD.RAGE_MAX) { cb.rage16 = (cb.rage16 || 0) + 1; if (cb.rage16 >= KD.rageNeed(cb)) cb.noteK('怒氣滿了！下回合狂化'); }
    if (lost > 0 && self && stkK(tgt, 'pwRageA16')) KD.block(this, tgt, 2 * stkK(tgt, 'pwRageA16')); // 狂暴★
    return r; }; }
{ const _st = BPK.startTurnK; BPK.startTurnK = function () { const r = _st.apply(this, arguments); this.kz16 = 0; this.core.data.kz16 = 0; if (this.kpNext16) { this.si = Math.min(3, (this.si || 0) + this.kpNext16); this.kpNext16 = 0; } // 堅守★
    if (this.cls === 'bk' && (this.rage16 || 0) >= KD.rageNeed(this)) { this.rage16 = 0; this.kz16 = 1; this.core.data.kz16 = 1; this.energy++; this.kzFx16 = { t: 0 }; this.noteK('狂化！能量 +1、攻擊 ×1.5'); Sound.sfx('roar'); }
    return r; }; }
{ const _en = BPK.endTurnK; BPK.endTurnK = function () { const r = _en.apply(this, arguments); this.kz16 = 0; this.core.data.kz16 = 0; return r; }; }

/* ---------- 影：盜賊的每一下 ---------- */
{ const _h = KD.hit; KD.hit = function (core, a, t, base, o = {}) { const up = !!(t && core.isUp(t)), got = _h.apply(this, arguments), cb = core.data.cb14;
    if (cb && cb.cls === 'rg' && up && a && a.hero && t && !t.hero && core.isUp(t)) KD.shadow16(core, cb, a, t, 1 + (core.data.shX16 || 0) + (core.data.skill14 === 'k14_tk_shiv' && stkK(a, 'pwKnifeA16') ? 1 : 0)); return got; }; }
// n layers of 影 (覺醒 cards add more); 5 →「影縛」, once per monster per turn (the rest waits, at most 5)
KD.shadow16 = (core, cb, a, t, n = 1) => { const d = t.data; for (let i = 0; i < n; i++) { d.sh16 = Math.min(KD.SH_MAX, (d.sh16 || 0) + 1); if (d.sh16 >= KD.SH_MAX && d.shT16 !== cb.turns) KD.bind16(core, cb, a, t); } };
KD.bind16 = (core, cb, a, t) => { const d = t.data; d.sh16 = 0; d.shT16 = cb.turns; core.emit(EVT.MESSAGE, { src: a, tgts: [t], payload: { key: 'sh16', text: '' } }); if (KD.SH_BOSS || !t.boss) kStop(cb, core, t, KD.SH_BOSS); if (core.isUp(t) && KD.SH_CHIP) KD.chip(core, a, t, KD.SH_CHIP); core.data.shN16 = (core.data.shN16 || 0) + 1; };
{ const H = Battle.prototype.handlers, _m = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { if (!P || P.key !== 'sh16') return yield* _m.call(this, e, s, t, P); if (!t) return;
    const C = this.center(t); this.pops.push({ x: C.x, y: C.y - 46, s: '影縛！', c: '#c8a0ff', t: 0, big: 1 }); this.shake = Math.max(this.shake || 0, 6); Sound.sfx('curse');
    for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: C.x, y: C.y + 4, r0: 30 - i * 6, r1: 6, c: i % 2 ? '#3a1858' : '#8a50d0', w: 2, life: 14 + i * 4 }); // the shadows close in
    for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2; this.spawn({ k: 'circ', x: C.x + Math.cos(an) * 26, y: C.y + 6 + Math.sin(an) * 12, vx: -Math.cos(an) * 1.2, vy: -Math.sin(an) * 0.6, r: rnd(2, 4), c: pick(['#1a0c2a', '#3a1858', '#6a38a0']), life: 20 }); }
    yield* wait(8); }; }
// the count over each monster's head (where a mage's mark goes)
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); const core = this.core; if (!this.k14 || this.cls !== 'rg' || !core || this.boxF < -20) return;
    for (const v of this.foes()) { const u = core.byId[v.id], n = u && u.data && u.data.sh16; if (!n || v.gone || v.alpha < 0.5) continue;
      let w = 13; try { const I = intentOf14(core, u, core.plan && core.plan[v.id]); if (I && I.t) w = 13 + Math.ceil(Font.width(I.t, 8)) + 3; } catch (e) { }
      const X = Math.max(8, Math.round(clamp(v.x + v.off.x - w / 2, 17, W - w - 2)) - 9), Y = Math.round(v.foot - v.bbh - 17 + v.sink * (v.sink < 0 ? 1 : 0)) + 6, full = n >= KD.SH_MAX - 1;
      x.fillStyle = '#000'; x.beginPath(); x.moveTo(X, Y - 8); x.lineTo(X + 8, Y); x.lineTo(X, Y + 8); x.lineTo(X - 8, Y); x.fill();
      x.fillStyle = full && Math.sin(this.t / 4) > 0 ? '#8a50d0' : '#4a2470'; x.beginPath(); x.moveTo(X, Y - 7); x.lineTo(X + 7, Y); x.lineTo(X, Y + 7); x.lineTo(X - 7, Y); x.fill();
      Font.drawC(x, String(n), X, midY(Y - 7, 15, 8), '#f0e0ff', null, 8); } }; }

/* ---------- 畫面：怒氣的格子、看破・狂化的光 ---------- */
{ const _db = BPK.drawBoxH; BPK.drawBoxH = function (x) { _db.call(this, x); if (!this.k14 || this.boxF < -20) return; const LB = KD.BL(), Y = LB.hudY, bx = 41;
    if (this.cls === 'bk') { const n = this.rage16 || 0, need = KD.rageNeed(this); for (let i = 0; i < need; i++) { x.fillStyle = i < n ? (n >= need ? '#ff5030' : '#e08a40') : '#3a3048'; x.fillRect(bx + 28 + i * 5, Y + 16, 3, 5); }
      if (this.kz16) { const p = 0.5 + 0.5 * Math.sin((this.fK || 0) / 4); Font.draw(x, '狂化', bx + 28 + need * 5 + 2, Y + 14, p > 0.5 ? '#ff7050' : '#ffb090', '#000', 8); } }
    const K = this.kpFx16; if (K && K.t++ < 16) { x.globalAlpha = 1 - K.t / 16; x.fillStyle = '#bfe6ff'; x.fillRect(bx - 2, Y, 74, 1); x.fillRect(bx - 2, Y + 12, 74, 1); Font.draw(x, '看破', bx + 22, Y - 14 - K.t * 0.4, '#bfe6ff', '#000', 8); x.globalAlpha = 1; }
    const Z = this.kzFx16; if (Z && Z.t++ < 30) { x.globalAlpha = 0.35 * (1 - Z.t / 30); x.fillStyle = '#ff3a20'; x.fillRect(0, Y - 2, W, 27); x.globalAlpha = 1; } }; }

/* ---------- 說明 ---------- */
KD.KEYS.push([/影縛|疊.*影/, '影：盜賊的攻擊每一下疊 1 層，5 層「影縛」：牠這回合不能行動、破防值 −2（頭目只扣破防值）。'], [/怒氣|狂化/, '怒氣：受到傷害或自己扣血 +1，滿了下一回合狂化：能量 +1、攻擊傷害 ×1.5。']);
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.unshift(
  ['看破（劍士）', ['魔物的攻擊被格擋完全擋下，看破 +1（最多 3）。', '下一張攻擊卡用掉全部看破：每層傷害 +4（每隻魔物算一次）、破防值 −1。架勢・調息・心眼也能加看破。']],
  ['暗影（盜賊）', ['攻擊每一下讓那隻魔物疊 1 層影（頭上的紫色數字），飛刀也算。', '疊到 5 層「影縛」：牠這回合不能行動、破防值 −2（頭目只扣破防值）。同一隻一回合最多一次。', '連擊照舊：每回合每打出 3 張卡得到 1 張飛刀。']],
  ['怒氣（狂戰士）', ['被魔物打掉 HP、或自己的卡扣血，怒氣 +1（最多 5）。', '滿了的下一回合「狂化」：能量 +1、攻擊卡傷害 ×1.5，怒氣歸零。']]);
if (typeof BATTLE_HELP !== 'undefined') for (const p of BATTLE_HELP) p[1] = p[1].map(l => l.replace(/劍意/g, '看破'));
KD.TXT.push([/水屬性的攻擊或劍意加倍的一擊，能讓熔岩甲裂開！/g, '水屬性的攻擊或劍士看破的一擊，能讓熔岩甲裂開！']);

/* ---------- 覺醒：劍士・盜賊・狂戰士（玩家：「要，跟法師一樣」；清單見〈曙光冒險-職業專屬玩法企劃〉） ---------- */
const R016 = {}; for (const id in KD.CARDS) R016[id] = KD.CARDS[id].run; // each card's own effect (14p swaps run while an awakened card plays)
const kp16 = core => core.data.kp16 || 0, sh16 = t => (t && t.data && t.data.sh16) || 0;
const shAdd16 = (cb, core, L, n) => { for (const t of L) if (t && core.isUp(t)) KD.shadow16(core, cb, cb.Hu(), t, n); };
const tgOf16 = (core, ctx) => (ctx && ctx.targets || []).filter(t => t && t.side === 'B' && core.isUp(t));
const shX16 = id => (cb, core, tg, v) => { core.data.shX16 = 1; try { R016[id](cb, core, tg, v); } finally { core.data.shX16 = 0; } };
for (const [id, n, k, tip] of [['pwCtrA16', '格擋反擊★', 'ctr', '反擊時看破 +1'], ['pwMasterA16', '劍聖之心★', 'atk', '每 2 張攻擊卡觸發'], ['pwKnifeA16', '飛刀術★', 'atk', '飛刀多疊 1 層影'],
  ['pwPhantomA16', '幻影步★', 'atk', '前 2 張攻擊卡打兩次'], ['pwRageA16', '狂暴★', 'def', '自己扣血時得到格擋'], ['pwAsuraA16', '阿修羅★', 'atk', '怒氣 3 就狂化']]) KD.st(id, n, k, tip);
Object.assign(KD.AW, {
  // 劍士
  sw_break: { t: '用掉看破時，易傷再 +2', run: (cb, core, tg, v) => { const k = kp16(core); R016.sw_break(cb, core, tg, v); if (k) for (const t of tg) if (core.isUp(t)) KD.add(core, cb.Hu(), t, 'vuln15', 2); } },
  sw_twin: { t: '看破的加成兩下都算', run: (cb, core, tg, v) => { const k = kp16(core); kAtk(cb, core, tg, v.d, 1); kAtk(cb, core, tg, v.d + KD.KP_DMG * k, 1, { i: 1 }); } },
  sw_gap: { t: '對易傷的魔物，打完看破 +1', after: (cb, core, ctx) => { if (tgOf16(core, ctx).some(t => stkK(t, 'vuln15'))) cb.addSi(1); } },
  sw_whirl: { t: '每打中 1 隻，獲得 2 格擋', run: (cb, core, tg, v) => { const n = kFoes(core).length; R016.sw_whirl(cb, core, tg, v); kBlk(cb, core, 2 * n); } },
  sw_bash: { t: '傷害再加上你目前格擋的一半', run: (cb, core, tg, v) => { kAtk(cb, core, tg, v.d + Math.floor(stkK(cb.Hu(), 'blk15') / 2)); kBlk(cb, core, v.b); } },
  sw_hold: { t: '下回合開始，看破 +1', after: cb => { cb.kpNext16 = (cb.kpNext16 || 0) + 1; } },
  sw_stance: { t: '看破再 +1', after: cb => cb.addSi(1) },
  sw_qi: { t: '抽 1 張', after: cb => cb.drawN(1) },
  sw_breath: { t: '看破再 +1', after: cb => cb.addSi(1) },
  sw_eye: { t: '不會消耗', keep: 1 },
  sw_cleave: { t: '用掉看破時，每層再 +3', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d + 3 * kp16(core)) },
  sw_shield: { t: '費用 1', cost: 1 },
  sw_tread: { t: '抽 2 張', after: cb => cb.drawN(1) },
  sw_flow: { t: '打完看破 +1', after: cb => cb.addSi(1) },
  sw_frenzy: { t: '力量再 +1', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'str15', 1) },
  sw_counter: { t: '反擊時，看破 +1', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwCtrA16', 1) },
  sw_wind: { t: '打完看破 +1', after: cb => cb.addSi(1) },
  sw_wall: { t: '格擋再 +6', after: (cb, core) => kBlk(cb, core, 6) },
  sw_guard: { t: '每回合的格擋再 +3', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwGuard15', 3) },
  sw_star: { t: '敵人易傷時多打 2 次', run: (cb, core, tg, v) => { const t = tg[0], vu = !!(t && stkK(t, 'vuln15')); kAtk(cb, core, tg, v.d, vu ? 4 : 2); } },
  sw_tsubame: { t: '看破再 +1（共 +2）', after: cb => cb.addSi(1) },
  sw_riposte: { t: '你有格擋時，打完看破 +1', after: cb => { if (stkK(cb.Hu(), 'blk15')) cb.addSi(1); } },
  sw_sheathe: { t: '抽 1 張', after: cb => cb.drawN(1) },
  sw_sky: { t: '用掉看破時，每層再 +8', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d + 8 * kp16(core)) },
  sw_meteor: { t: '不會消耗', keep: 1 },
  sw_thousand: { t: '費用 2', cost: 2 },
  sw_master: { t: '每打出 2 張攻擊卡就觸發（原本 3 張）', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwMasterA16', 1) },
  sw_mujin: { t: '看破 +1', after: cb => cb.addSi(1) },
  sw_tenpu: { t: '打 3 次', run: (cb, core, tg, v) => kAll(cb, core, v.d, 3) },
  // 盜賊
  rg_venom: { t: '每一下多疊 1 層影', run: shX16('rg_venom') },
  rg_quick: { t: '抽 2 張', after: cb => cb.drawN(1) },
  rg_fan: { t: '飛刀多 1 張', after: cb => cb.addHand('tk_shiv') },
  rg_shade: { t: '每有 1 隻魔物身上有影，再 +2 格擋', after: (cb, core) => kBlk(cb, core, 2 * kFoes(core).filter(u => sh16(u) > 0).length) },
  rg_toxic: { t: '對有影的魔物，毒 ×2', run: (cb, core, tg, v) => { for (const t of tg) KD.add(core, cb.Hu(), t, 'pois14', v.x * (sh16(t) > 0 ? 2 : 1)); } },
  rg_smoke: { t: '全體疊 2 層影', after: (cb, core) => shAdd16(cb, core, kFoes(core), 2) },
  rg_slip: { t: '抽 2 張', after: cb => cb.drawN(1) },
  rg_backstab: { t: '對有 3 層以上影的魔物 ×2', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 1, { mulF: t => (sh16(t) >= 3 ? 2 : 1) }) },
  rg_needle: { t: '多疊 2 層影', after: (cb, core, ctx) => shAdd16(cb, core, tgOf16(core, ctx), 2) },
  rg_prep: { t: '再得到 1 張飛刀', after: cb => cb.addHand('tk_shiv') },
  rg_mark: { t: '疊 3 層影', after: (cb, core, ctx) => shAdd16(cb, core, tgOf16(core, ctx), 3) },
  rg_rot: { t: '打 5 次', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 5, { flatF: t => (stkK(t, 'pois14') ? v.x : 0) }) },
  rg_reap: { t: '魔物每有 1 層影，再 +3', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 1, { mulF: t => (t.res.hp <= t.max.hp / 2 ? 1.5 : 1), flatF: t => 3 * sh16(t) }) },
  rg_twin: { t: '打 3 次', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 3) },
  rg_lurk: { t: '每回合開始飛刀 2 張', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwLurk14', 1) },
  rg_knives: { t: '飛刀打中時多疊 1 層影', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwKnifeA16', 1) },
  rg_dance: { t: '毒再 +3', after: (cb, core, ctx) => { for (const t of tgOf16(core, ctx)) KD.add(core, cb.Hu(), t, 'pois14', 3); } },
  rg_cross: { t: '多疊 2 層影', after: (cb, core, ctx) => shAdd16(cb, core, tgOf16(core, ctx), 2) },
  rg_catalyst: { t: '不會消耗', keep: 1 },
  rg_adren: { t: '抽 3 張', after: cb => cb.drawN(1) },
  rg_envenom: { t: '攻擊時毒 +2（原本 +1）', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwEnv14', 1) },
  rg_bloom: { t: '魔物每有 1 層影，再 +2', run: (cb, core, tg, v) => { const t = tg[0], s = sh16(t); R016.rg_bloom(cb, core, tg, v); if (s && t && core.isUp(t)) kAtk(cb, core, [t], 2 * s, 1, { i: 9 }); } },
  rg_stitch: { t: '直接影縛（不用 5 層）', after: (cb, core, ctx) => { for (const t of tgOf16(core, ctx)) if (t.data.shT16 !== cb.turns) KD.bind16(core, cb, cb.Hu(), t); } },
  rg_fatal: { t: '魔物每有 1 層影，再 +3', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 1, { flatF: t => stkK(t, 'pois14') * v.x + 3 * sh16(t) }) },
  rg_grave: { t: '每一下多疊 1 層影', run: shX16('rg_grave') },
  rg_phantom: { t: '每回合前 2 張攻擊卡打兩次（原本 1 張）', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwPhantomA16', 1) },
  // 狂戰士
  bk_split: { t: '狂化中，破防值再 −2', after: (cb, core, ctx) => { if (core.data.kz16) for (const t of tgOf16(core, ctx)) KD.chip(core, cb.Hu(), t, 2); } },
  bk_spin: { t: '狂化中打 2 次', run: (cb, core, tg, v) => kAll(cb, core, v.d, core.data.kz16 ? 2 : 1) },
  bk_roar: { t: '怒氣再 +1', after: cb => KD.rageAdd16(cb, 1) },
  bk_triple: { t: '打 4 次', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 4) },
  bk_fury: { t: '狂化中也算「半血 ×2」', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 1, { mul: kHalf(cb) || core.data.kz16 ? 2 : 1 }) },
  bk_blood: { t: '怒氣再 +1', after: cb => KD.rageAdd16(cb, 1) },
  bk_brace: { t: '怒氣 +1', after: cb => KD.rageAdd16(cb, 1) },
  bk_quake: { t: '虛弱再 +1', after: (cb, core) => { for (const t of kFoes(core)) KD.add(core, cb.Hu(), t, 'weak15', 1); } },
  bk_fbreak: { t: '易傷再 +1', after: (cb, core, ctx) => { for (const t of tgOf16(core, ctx)) KD.add(core, cb.Hu(), t, 'vuln15', 1); } },
  bk_kick: { t: '打 3 次', run: (cb, core, tg, v) => kAll(cb, core, v.d, 3) },
  bk_breath: { t: '不會消耗', keep: 1 },
  bk_crush: { t: '怒氣 +1', after: cb => KD.rageAdd16(cb, 1) },
  bk_bloodp: { t: '吸血再 +10%', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwBlood14', 10) },
  bk_rage: { t: '失去 HP 時，也獲得 2 格擋', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwRageA16', 1) },
  bk_shell: { t: '怒氣 +1', after: cb => KD.rageAdd16(cb, 1) },
  bk_storm: { t: '打 10 次', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 10) },
  bk_iron: { t: '格擋算 1.5 倍', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d + Math.floor(stkK(cb.Hu(), 'blk15') * 1.5)) },
  bk_warcry: { t: '怒氣 +2', after: cb => KD.rageAdd16(cb, 2) },
  bk_reckless: { t: '怒氣再 +1', after: cb => KD.rageAdd16(cb, 1) },
  bk_through: { t: '也讓牠易傷 2', after: (cb, core, ctx) => { for (const t of tgOf16(core, ctx)) KD.add(core, cb.Hu(), t, 'vuln15', 2); } },
  bk_last: { t: '怒氣 +2', after: cb => KD.rageAdd16(cb, 2) },
  bk_castle: { t: '費用 2', cost: 2 },
  bk_ogaxe: { t: '怒氣 +2', after: cb => KD.rageAdd16(cb, 2) },
  bk_upper: { t: '力量的加成算 4 次', run: (cb, core, tg, v) => { const H = cb.Hu(); kAtk(cb, core, tg, v.d + 3 * (stkK(H, 'str15') + stkK(H, 'tstr14'))); } },
  bk_hundred: { t: '打 12 次', run: (cb, core, tg, v) => kAtk(cb, core, tg, v.d, 12) },
  bk_asura: { t: '怒氣 3 就狂化', after: cb => KD.add(cb.core, cb.Hu(), cb.Hu(), 'pwAsuraA16', 1) },
  bk_limit: { t: '不會消耗', keep: 1 },
});
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(p => p[0] === '熟練・覺醒'); if (P) P[1] = P[1].map(l => l.replace('（目前法師的卡有覺醒）', '（四個職業的卡都有覺醒）')); }
