/* ===================== v12.61 小修 =====================
   1. 換了別種武器、技能欄的招式全部用不了的時候，戰鬥中的「技能」不再只說「還沒有技能！」：
      說出是哪一種武器的招式（「劍的招式要拿劍才能用」）。（換武器的畫面本身在 r9x 的 equipPick11 裡提示） */
{ const _cm = Battle.prototype.chooseMove; Battle.prototype.chooseMove = function* (...a) {
    const hu = this.core.byId.H, list = hu.skills.filter(id => DEF.skills[id] && id !== hu.data.attackSkill), st = Game.st;
    if (list.length || !st || typeof treeOf11 !== 'function') return yield* _cm.apply(this, a);
    const ks = [...new Set((st.slots || []).map(id => (treeOf11(id) || [])[0]).filter(k => k && TREE11[k] && !TREE11[k].common))];
    if (!ks.length) return yield* _cm.apply(this, a);
    const k = ks[0], m = mainKind11(st); yield* this.msg((m ? '「' + m + '」還沒有學會任何招式。' : '現在沒有可以用的招式。') + '\n（' + k + '的招式要拿' + k + '才能用）'); return null; }; }

/* 2. 技能欄跟著武器換（v12.62）：換成別種武器時，記住舊武器的技能欄，換上新武器那一套。
      第一次換到某種武器：保留共通樹（戰技・護身・輔佐）的招，空格放那棵樹學會的招。換回來就是原本的配置。 */
{ const _ep = equipPick; equipPick = function* (sl) { const st = Game.st, k0 = sl === 'weapon' && typeof mainKind11 === 'function' ? mainKind11(st) : null, s0 = (st.slots || []).slice();
    yield* _ep.call(this, sl);
    const k1 = sl === 'weapon' && k0 ? mainKind11(st) : null; if (!k1 || k1 === k0) return;
    const by = st.slotsBy13 || (st.slotsBy13 = {}), tk = id => (treeOf11(id) || [])[0], common = id => { const k = tk(id); return !k || !!(TREE11[k] || {}).common; };
    by[k0] = s0; const fits = id => common(id) || tk(id) === k1 || tk(id) === PAIR11[k1]; // another weapon's moves can't be used anyway
    const next = (by[k1] || s0).filter(fits); for (const id of learnedTree11(st)) if (tk(id) === k1 && !next.includes(id) && next.length < BB.SLOTS) next.push(id);
    st.slots = next; BB.slots(st);
    if (st.slots.some(id => tk(id) === k1) && st.slots.join() !== s0.join()) yield* eqSay13('技能欄換成了「' + k1 + '」的招式。'); }; }

/* 3. 第四幕以後主線的指引（v12.63）：說明寫的是「鐘樓」「王城」「王座之間」，不是地圖的全名，指引找不到或指回一樓。
      這幾步直接指定目的地：鐘塔開門後 → 鐘樓的時計巨像／曙光鐘；回王城報告 → 國王；要塞 → 王座的影將莫爾德；敲響曙光鐘 → 鐘樓的曙光鐘。 */
const GUIDE13 = [
  { step: 4, map: 'clockTower2', name: '鐘樓', boss: 1, spot: '曙光鐘' },
  { step: 5, when: f => !f.northPass, map: 'castle', name: '王城', spot: '國王阿爾德里克' },
  { step: 8, map: 'duskFort2', name: '王座之間', boss: 1 },
  { step: 9, map: 'clockTower2', name: '鐘樓', spot: '曙光鐘' },
];
{ const _qd = questDest; questDest = function (q, st = Game.st) {
    const f = st && st.flags, n = f && (f.ch2 || 0), R = q && q.main && !q.done && GUIDE13.find(g => g.step === n && (!g.when || g.when(f)));
    if (!R || !MAPS[R.map]) return _qd(q, st);
    if (st.map !== R.map) return { map: R.map, what: '前往' + R.name };
    const d = MAPS[R.map], ow = Game.ow;
    if (R.boss && d.boss && !f[d.boss.flag || 'golem'] && SPECIES[d.boss.sp]) return { map: R.map, spot: { x: d.boss.x, y: d.boss.y, name: SPECIES[d.boss.sp].n }, what: '找' + SPECIES[d.boss.sp].n };
    const N = R.spot && ((ow && ow.map && ow.map.id === R.map && ow.npcs) || d.npcs || []).find(e => e.name === R.spot && (!e.show || e.show(st)));
    return N ? { map: R.map, spot: { x: N.x, y: N.y, name: N.name }, what: '找' + N.name } : _qd(q, st); }; }

/* 4. 第三幕以後在遠方倒下、被送回萌芽鎮時，提示一次：在旅館或營地休息過，就會在那裡醒來（v12.63）。
      自動試玩：在金穗平原打頭目，每次「回去準備」都回到萌芽鎮、再付 200 G 搭馬車，錢很快就花光。 */
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { const st = this.st, m0 = st.map; const r = yield* _wo.apply(this, a);
    const f = st.flags || {}; if (!f.innTip13 && (f.ch2 || 0) >= 1 && st.map !== m0 && ['home', 'inn'].includes(st.map) && typeof mapDist === 'function' && mapDist(m0, 'town') >= 2) {
      f.innTip13 = 1; yield* say('（在各地的旅館或營地休息過，倒下時就會在那裡醒來，不用從萌芽鎮走回去。）'); }
    return r; }; }

/* 5. 破關後、第三章序章還沒開始時，任務清單多一條「到王城謁見國王」（v12.64）。
      以前破關後主線顯示「完成」，片尾又寫「第三章 製作中」，不知道序章已經可以玩（要先去見國王）。 */
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const f = st.flags || {};
    if ((f.ch2 || 0) >= 10 && !(typeof ch3 === 'function' ? ch3(st) : f.ch3)) L.push({ n: '第三章 序章「東方的海」', t: '【推薦Lv44〜】國王阿爾德里克有事找你。到王城謁見國王吧。（莉婭從東方回來了）', done: false, rw: '潮鳴貝殼・20000 G', cat: '主線' }); }; }
QUEST_CATS['第三章 序章「東方的海」'] = '主線'; // the list used to file it under 支線 (05_ui sets q.cat from QUEST_CATS)

/* 6. 第三章：還沒去過潮鳴港時，指引算不出「搭馬車去潮鳴港」的路（馬車只認去過的地方），「前往潮鳴港」沒有箭頭（v12.64）。
      序章開始後（ch3 ≥ 1）任何一站的馬車都能去潮鳴港（跟 11e 的馬車選單一樣）。 */
{ const _ok = coachOk9; coachOk9 = function (from, to, st = Game.st) { if (to === 'harbor13' && from !== to && COACH9[from] && typeof ch3 === 'function' && ch3(st) >= 1) return true; return _ok(from, to, st); }; }
