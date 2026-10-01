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
// the foe's turn can drop you under 40% too — 莉婭 checks after it as well
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
