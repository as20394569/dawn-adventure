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
// 4. the old "go craft" hint read the v7 blueprints (always empty in v12): now it looks at what the smith can make with the points and the bag
const ptsPot13 = st => { const f = { ...st, bag: { ...st.bag }, pt11: { ...pts11(st) } }; try { bagToPts11(f); } catch (e) { } return f.pt11; };
const tierOf13 = g => { if (!g) return 0; for (const k in BASE11.weapon) { const i = BASE11.weapon[k].indexOf(g.b); if (i >= 0) return i + 1; }
  for (const s in BASE11.armor) for (const sl in BASE11.armor[s]) { const i = BASE11.armor[s][sl].indexOf(g.b); if (i >= 0) return i + 1; } const i = BASE11.shield.indexOf(g.b); return i >= 0 ? i + 1 : 0; };
const groupOf13 = g => { if (!g) return null; for (const k in BASE11.weapon) if (BASE11.weapon[k].includes(g.b)) return k; for (const s in BASE11.armor) for (const sl in BASE11.armor[s]) if (BASE11.armor[s][sl].includes(g.b)) return s; return BASE11.shield.includes(g.b) ? '盾' : null; };
function craftHint13(st = Game.st) { const P = ptsPot13(st), top = craftTop11(st), can = (grp, t) => { const c = craftCost11(grp, t), p = c.pts; return st.money >= c.gold && PTS11.every(x => (P[x] || 0) >= (p[x] || 0)); };
  const SLOT = [['weapon', '武器'], ['body', '身體防具'], ['head', '頭部防具'], ['feet', '腳部防具'], ['shield', '盾']];
  for (const [sl, nm] of SLOT) { const g = gearBy(st.equip[sl], st), grp = groupOf13(g), t0 = tierOf13(g); if (!grp || !t0 || !CRAFTCAT11[grp]) continue;
    for (let t = top; t > t0; t--) if (can(grp, t)) return { t, text: '（打不贏的時候，可以去鐵匠把素材換成點數，打造 T' + t + ' 的' + (sl === 'weapon' ? grp : nm) + '。現在的是 T' + t0 + '。）' }; }
  return null; }
{ const _ch = craftHint9; craftHint9 = function (st = Game.st) { if (trHint13(st)) return null; const h = craftHint13(st); return h ? h.text : _ch(st); }; }
// a lost wild fight: the same smithing hint, once for each tier
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { const st = this.st, k = Game.lastFight9, arena = typeof ARENA_ON13 !== 'undefined' && ARENA_ON13;
    const ok = st && !arena && k !== 'elite' && k !== 'boss' && !trHint13(st); yield* _wo.apply(this, a); const h = ok ? craftHint13(st) : null;
    if (h && (st.flags.crHint13 || 0) < h.t) { st.flags.crHint13 = h.t; yield* say(h.text); } }; }
