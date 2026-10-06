/* ===================== v12.42 新手的前 30 分鐘（玩家 2026-10-06：「繼續改進此遊戲」） =====================
   自動試玩：一個從不打開「技能樹」的新手，在第一隻菁英「磨石魔像」前連輸 40 場（Lv4〜9 都一樣）；學了技能、魔像蓄力時防禦，Lv6 就 10 戰 10 勝。
   → 覺醒的儀式直接學會那把武器的第一招；技能點沒用完時，輸了會提醒、累積多了也會提醒一次。 */
// 1. the first skill of the chosen weapon's tree comes with the ceremony (free: the point is given back)
const firstSkill13 = kind => { const N = treeNodes11(kind).find(q => q.t === 'sk' && !q.pre && !q.flag); return N ? N : null; };
{ const _as = applyStartClass; applyStartClass = function (k) { _as(k); const st = Game.st, kind = mainKind11 ? mainKind11(st) : null, T = tr11(st); if (!kind || !TREE11[kind]) return;
    const N = firstSkill13(kind); if (!N || T.lv[N.key]) return; T.lv[N.key] = 1; st.trRef11 = (st.trRef11 || 0) + 1; BB.slots(st); st.first13 = N.key; }; }
{ const _say = say; say = function* (text, o) { const st = Game.st;
    if (typeof text === 'string' && st && st.first13 && /打開選單的「技能樹」用技能點學招式|每個職業都有自己的核心資源/.test(text) && DEF.skills[st.first13]) { const nm = DEF.skills[st.first13].name; st.first13 = null;
      text = (typeof ncTxt12 === 'function' ? ncTxt12(text) : text) + '\n（你已經學會了第一招「' + nm + '」。戰鬥中選「技能」就能用。）'; }
    return yield* _say(text, o); }; }
// 2. a lost fight with points left in the skill tree says so first (before the smithing hint)
const trHint13 = st => { const n = trLeft11(st), a = typeof attrAvail === 'function' ? attrAvail(st) : 0;
  if (n >= 2) return '（技能樹還有 ' + n + ' 點沒用！打開選單→「技能樹」學新的招式，打菁英和頭目會輕鬆很多。）';
  if (a >= 3) return '（還有 ' + a + ' 點屬性點沒分配。打開選單→「屬性」分配，或選「推薦配點」。）'; return null; };
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { const st = this.st, h = st && trHint13(st), arena = typeof ARENA_ON13 !== 'undefined' && ARENA_ON13; yield* _wo.apply(this, a); if (h && !arena) yield* say(h); }; }
// 3. once: after a won fight, with 4 or more points waiting
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { const r = yield* _bs.call(this, cfg, ...a), st = Game.st;
    if (r === 'win' && st && !st.flags.trTip13 && trLeft11(st) >= 4) { st.flags.trTip13 = 1; yield* say('（技能點累積了 ' + trLeft11(st) + ' 點！打開選單→「技能樹」，就能學新的招式或加強學過的招式。）'); }
    return r; }; }
