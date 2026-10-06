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
    if (st.slots.some(id => tk(id) === k1) && st.slots.join() !== s0.join()) yield* say('技能欄換成了「' + k1 + '」的招式。'); }; }
