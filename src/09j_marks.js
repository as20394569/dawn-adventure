/* ===================== v24.11 head markers for story / side-quest NPCs =====================
   Playtest: "some NPCs have a quest but no symbol over their head". Markers (! new · ? ready to report) only covered commission givers;
   the story and side-quest NPCs of both chapters now report their state too. */
const STORY_MARKS = {
  // chapter 1
  lostBoy: st => !st.flags.q1res ? '!' : null,
  tim: st => { const f = st.flags; return !f.q2res ? '!' : f.q2res === 'stay' && f.mossGiant && !f.q2done ? '?' : null; },
  caravan: st => !st.flags.caravan ? '!' : null,
  hermit: st => !st.flags.q5 ? '!' : null,
  mira: st => (st.flags.qMira || 0) < 2 ? '!' : null,
  // chapter 2 — main story
  royalKnight: st => !st.flags.ch2 ? '!' : null,
  king: st => { const n = ch2(st); return n <= 2 ? '!' : n === 5 && !st.flags.northPass ? '!' : null; },
  clockmaker: st => { const f = st.flags, n = ch2(st), c4 = (typeof comState === 'function' && comState('c4', st)) || {};
    if (f.watchQ === 1 || (!f.watchQ && c4.res === 'returned')) return '?';
    if (n === 3 && gearCount(st) >= 2) return '?';
    if (f.colossus && !f.clsMachinist) return !f.machQ ? '!' : (st.bag.spring || 0) >= 3 && (st.bag.brassGear || 0) >= 3 ? '?' : null;
    return null; },
  // chapter 2 — side quests
  liaCap: st => { const f = st.flags; if (f.captainQ === 1 || (f.blackFeather && f.liaQuest === 1)) return '?'; return ch2(st) >= 3 && !f.liaQuest ? '!' : null; },
  plainsGirl: st => { const f = st.flags; return !f.sheepQ ? '!' : f.sheepQ === 1 && f.boarKing ? '?' : null; },
  princess: st => { const f = st.flags; return !f.princessQ && ch2(st) >= 5 ? '!' : f.princessQ === 1 && (st.bag.iceCrystal || 0) >= 2 ? '?' : null; },
  frostElder: st => { const f = st.flags; if (f.lichQ === 1 && f.frostLich) return '?'; return (ch2(st) >= 5 && !f.frostMet) || (f.frostMet && !f.lichQ) ? '!' : null; },
  // chapter 2 — class trials
  bardMaster: st => { const f = st.flags; if (f.clsBard) return null; return st.bag.lostScore ? '?' : !f.bardQ && ch2(st) >= 3 ? '!' : null; },
  monkMaster: st => { const f = st.flags; if (f.clsMonk) return null; return !f.monkQ ? '!' : f.snowBear ? '?' : null; },
  dragonElder: st => { const f = st.flags; if (f.clsDragoon) return null; return !f.dragoonQ ? '!' : st.bag.dragonFlame ? '?' : null; },
};
{ const _nq = npcQuestState; npcQuestState = function (id, st = Game.st) {
    const m = _nq(id, st); if (m === '?' || !STORY_MARKS[id] || !st || !st.flags) return m;
    let s = null; try { s = STORY_MARKS[id](st); } catch (e) { s = null; }
    return s === '?' ? '?' : (m || s);
  };
}
