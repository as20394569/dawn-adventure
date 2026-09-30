/* ===================== v9.0 (cont.) 夥伴援護 — 格倫 and 莉婭 step into elite / boss fights =====================
   Once per elite or boss battle each:
     格倫 — when the foe drops to 60% HP or less, he cuts in with his axe (power by weapon tier) and cracks its armour (物防−1).
     莉婭 — when your HP falls under 40%, she runs in and heals 35% of your max HP (and clears a status).
   格倫 joins after 古戰場 if you trusted him at 楓紅關道 (or later, when he turns up after 黑羽); 莉婭 after her 黑羽 request
   (or when you meet her at the fortress). */
const ALLY_STATS = { gren: 0, lia: 0 }; // for the tests
const ALLIES = [
  { k: 'gren', flag: 'allyGren', n: '格倫', ok: f => f.allyGren || (f.passDone && f.grenTrust) || f.grenNorth, when: b => b.F.hp > 0 && b.F.hp <= b.F.maxhp * ((b._ally && b._ally.gren) ? 0.3 : 0.6) },
  { k: 'lia', flag: 'allyLia', n: '莉婭', ok: f => f.allyLia || (f.liaQuest || 0) >= 2 || f.liaFort1, when: b => b.H.hp > 0 && b.H.hp < b.H.maxhp * 0.4 },
];
Battle.prototype.allyTurn = function* () {
  if (this.kind !== 'boss' && this.kind !== 'elite') return; const f = Game.st.flags, H = this.H, F = this.F; if (!H || !F || H.hp <= 0 || F.hp <= 0) return;
  this._ally = this._ally || {};
  for (const A of ALLIES) {
    const lim = 1 + (talentSum('allyMore') || 0), up = 1 + (talentSum('allyUp') || 0) / 100; // v9.2 talents: more / stronger assists
    if ((this._ally[A.k] || 0) >= lim || !A.ok(f) || !A.when(this) || H.hp <= 0 || F.hp <= 0) continue; this._ally[A.k] = (this._ally[A.k] || 0) + 1; ALLY_STATS[A.k]++;
    Sound.sfx('exclaim'); this.spawn({ k: 'flash', c: A.k === 'gren' ? '#ffb070' : '#a0e0ff', a: 0.3, life: 8 });
    if (A.k === 'gren') {
      yield* this.msg(['格倫從旁殺了出來！「……讓開，小鬼！」', '格倫：「看好了——這才叫劈！」', '格倫：「哼，還站得起來？那就再來一斧！」'][rnd(0, 2)], { hold: 22 });
      const B = GEAR[mainWKey()], pow = 90 + 15 * ((B && B.t) || 3);
      const d = B ? yield* this.wHit(H, F, { n: '格倫的戰斧' }, Math.round(pow * up), 'groundBash') : 0;
      yield* this.msg('格倫的援護造成了' + d + '點傷害！', { hold: 18 });
      if (F.hp > 0) yield* this.statChange(F, { def: -1 });
    } else {
      yield* this.msg(['莉婭趕到了！「撐住——騎士團的急救術！」', '莉婭：「我來掩護你！先把傷口包好！」', '莉婭：「勇者可不能在這裡倒下！」'][rnd(0, 2)], { hold: 22 });
      const h = Math.min(H.maxhp - H.hp, Math.ceil(H.maxhp * 0.35 * up)); if (h > 0) { H.hp += h; Game.st.hp = H.hp; Sound.sfx('heal'); yield* this.animHP(H); }
      let cured = false; if (H.status) { H.status = null; cured = true; }
      yield* this.msg(Game.st.name + '回復了' + h + '點HP！' + (cured ? '異常狀態也消除了。' : ''), { hold: 18 });
    }
  }
};
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    const r = yield* _um.call(this, u, t, id); if (u && u === this.H) yield* this.allyTurn(); return r; }; }
// the foe's turn can drop you under 40% too — 莉婭 checks after it as well
{ const _um2 = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    const r = yield* _um2.call(this, u, t, id); if (u && u === this.F && this.H && this.H.hp > 0 && this.F.hp > 0) { const L = ALLIES[1]; if ((!(this._ally && this._ally.lia) || this._ally.lia < 1 + (talentSum('allyMore') || 0)) && L.ok(Game.st.flags) && L.when(this) && (this.kind === 'boss' || this.kind === 'elite')) yield* this.allyTurn(); } return r; }; }
BATTLE_HELP.push(['夥伴援護', ['在菁英・頭目戰中，夥伴會在關鍵時刻各出手一次。', '格倫：對手HP剩60%以下時，用戰斧援護攻擊，並降低對手物防。', '莉婭：你的HP低於40%時，回復35%最大HP，並消除異常狀態。']]);

/* ---------- joining messages ---------- */
function* allyJoin(k) {
  const f = Game.st.flags, A = ALLIES.find(a => a.k === k); if (f[A.flag]) return; f[A.flag] = 1; Sound.jingle('item');
  yield* itemGet(A.n + '成為了夥伴！');
  yield* say(k === 'gren' ? '（菁英・頭目戰中，對手HP剩60%以下時，格倫會出手援護一次。）' : '（菁英・頭目戰中，你的HP低於40%時，莉婭會趕來治療一次。）');
}
{ const _w = Events.eliteWin_wraithGeneral; Events.eliteWin_wraithGeneral = function* (...a) { yield* _w.apply(this, a); if (Game.st.flags.grenTrust) yield* allyJoin('gren'); }; }
{ const _b = Events.eliteWin_blackFeather; Events.eliteWin_blackFeather = function* (...a) { yield* _b.apply(this, a); if (Game.st.flags.grenNorth) yield* allyJoin('gren'); }; }
{ const _l = Events.liaCap; Events.liaCap = function* (...a) { yield* _l.apply(this, a); if ((Game.st.flags.liaQuest || 0) >= 2) yield* allyJoin('lia'); }; }
{ const _f = Events.liaFort; Events.liaFort = function* (...a) { yield* _f.apply(this, a); yield* allyJoin('lia'); }; }
