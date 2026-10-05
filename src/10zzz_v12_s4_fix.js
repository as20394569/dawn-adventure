/* ===================== v12.4 巡檢清單修正（玩家 2026-10-05：「都照你建議的修正」） =====================
   A1 防禦說明拿掉「守護者的守護之盾」；A4 魔法武器（魔導書・法杖・樂器）拿獎勵時給魔法版；A5/A6 任務獎勵文字；
   C1 風車丘陵・碧溪谷・楓紅關道・古戰場・初代勇者之墓算進探索度；B1 蓄力時不會被睡著擋掉防禦。
   （A2 狀態頁、A3 技能編排、A7 成就、A8 蕾菈、A9 換行、D1 天氣提示、D2 快轉提示 直接改在原檔。） */

// A1
if (typeof BATTLE_HELP !== 'undefined') for (const b of BATTLE_HELP) if (Array.isArray(b[1])) b[1] = b[1].map(t => typeof t === 'string' ? t.replace(/（守護者的「守護之盾」再減\d+%）/g, '') : t);

// A4 主手拿魔法武器時，獎勵換成魔法版（原本看魔導士職業）
const MAGIC_KINDS12 = ['魔導書', '法杖', '樂器'];
function magicHand12(st = Game.st) { const w = st && typeof gearBy === 'function' && gearBy(st.equip && st.equip.weapon, st); return !!(w && GEAR[w.b] && MAGIC_KINDS12.includes(GEAR[w.b].kind)); }

// A5/A6 任務獎勵的舊說法
{ const fx = t => typeof t !== 'string' ? t : t.replace(/（設計圖＋打造券）/g, '').replace(/的設計圖(?=[、，或）]|$)/g, '').replace(/（魔導士：/g, '（用魔法武器的話：');
  const _ql = questList; questList = function (st = Game.st) { const L = _ql(st); for (const q of L) { if (q.rw) q.rw = fx(q.rw); if (q.t) q.t = fx(q.t); } return L; }; }

// C1 探索度
Object.assign(EXPLORE, { windHills: '風車丘陵', jadeCreek: '碧溪谷', maplePass: '楓紅關道', oldField: '古戰場', heroTomb: '初代勇者之墓' });

// B1 菁英・頭目開始蓄力時，睡著的主角會驚醒；蓄力中主角也不會被催眠（不然看懂了也沒辦法防禦）
{ const P = BattleCore.prototype, _as = P.applyStatus; P.applyStatus = function (src, t, id, o = {}) {
    if (id === 'slp' && t && t.hero && this.units.some(f => f.side !== t.side && !f.down && (f.elite || f.boss) && this.hasStatus(f, 'charging')))
      return this.emit(EVT.STATUS_FAIL, { src, tgts: [t], payload: { status: id, why: 'charge12' } });
    const r = _as.call(this, src, t, id, o);
    if (id === 'charging' && t && !t.hero && (t.elite || t.boss)) for (const h of this.units) if (h.hero && !h.down && this.hasStatus(h, 'slp')) { h.data.woke12 = 1; this.removeStatus(h, 'slp', 'charge12'); }
    return r; }; }
{ const H = Battle.prototype.handlers, _sg = H.statusGone, _sf = H.STATUS_FAIL;
  H.statusGone = function* (e, s, t, P, expire) { if (t && P.status === 'slp' && P.why === 'charge12') { delete t.st.slp; yield* this.msg('危險的氣息讓' + t.n + '驚醒了！', { hold: 20 }); return; } return yield* _sg.call(this, e, s, t, P, expire); };
  H.STATUS_FAIL = function* (e, s, t, P) { if (t && P.why === 'charge12') { yield* this.msg(t.n + '緊盯著蓄力中的對手，沒有睡著！', { hold: 20 }); return; } return yield* _sf.call(this, e, s, t, P); }; }

// 系統配合檢查：金裝特效「共鳴」看的是職業的資源，職業拿掉後沒有效果 → 改成武器樹的資源（氣・守勢・砲台）上限 +1、特技需要的層數 −1
DEF.passives['fx.resonance'].make = () => ({ rules: { max_chi: 1, max_stance: 1, turretMax: 1 } });
if (typeof SPECIALS !== 'undefined' && SPECIALS.resonance) SPECIALS.resonance.d = '氣・守勢・砲台的上限 +1，特技需要的層數 −1。';
if (typeof ACC_TRAIT !== 'undefined' && ACC_TRAIT.resonance) ACC_TRAIT.resonance[1] = '氣・守勢・砲台的上限 +1，特技需要的層數 −1';
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (st && s.wsp && (heroStats(st).fx || {}).resonance) s.wsp = { ...s.wsp, N: Math.max(2, s.wsp.N - 1) }; return s; }; }

/* ---------- 異常狀態 3 回合自動消除（玩家 2026-10-05：「異常狀態設定3回合自動消除」） ----------
   中毒・灼傷・麻痺：原本要治好才會消失 → 3 回合（每回合結束算一次；中毒、灼傷剛好扣 3 次）。睡眠本來就是 1〜3 回合，照舊。
   戰鬥結束時身上的異常也一起消除（不再帶到地圖上走路扣血、也不會帶進下一場）。對魔物也一樣。 */
const AIL_TURNS12 = 3;
for (const id of ['psn', 'brn', 'par']) Object.assign(DEF.statuses[id], { duration: 'rounds', durDefault: AIL_TURNS12, tick: 'round_end' });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); for (const x of s.statuses || []) if (['psn', 'brn', 'par'].includes(x.id) && x.dur == null) x.dur = AIL_TURNS12; return s; }; }
{ const _ap = BB.apply; BB.apply = function (core, st = Game.st) { const r = _ap.call(this, core, st); if (st) { st.status = null; delete st.sleepT; } return r; }; }
{ const H = Battle.prototype.handlers, _sg = H.statusGone; H.statusGone = function* (e, s, t, P, expire) {
    if (t && expire && ['psn', 'brn', 'par'].includes(P.status)) { delete t.st[P.status]; yield* this.msg(t.n + '的' + DEF.statuses[P.status].metadata.n + '消退了。', { hold: 20 }); return; }
    return yield* _sg.call(this, e, s, t, P, expire); }; }
if (typeof BATTLE_HELP !== 'undefined') {
  BATTLE_HELP.push(['異常狀態', ['中毒・灼傷：每回合結束扣血。麻痺：有時候不能行動。睡眠：1〜3 回合不能行動。', '中毒・灼傷・麻痺 3 回合後自動消除；戰鬥結束時身上的異常也會消除。', '解毒藥這類道具可以馬上治好；體力越高越不容易中異常。']]); }
