/* ===================== v12.61 小修 =====================
   1. 換了別種武器、技能欄的招式全部用不了的時候，戰鬥中的「技能」不再只說「還沒有技能！」：
      說出是哪一種武器的招式（「劍的招式要拿劍才能用」）。（換武器的畫面本身在 r9x 的 equipPick11 裡提示） */
{ const _cm = Battle.prototype.chooseMove; Battle.prototype.chooseMove = function* (...a) {
    const hu = this.core.byId.H, list = hu.skills.filter(id => DEF.skills[id] && id !== hu.data.attackSkill), st = Game.st;
    if (list.length || !st || typeof treeOf11 !== 'function') return yield* _cm.apply(this, a);
    const ks = [...new Set((st.slots || []).map(id => (treeOf11(id) || [])[0]).filter(k => k && TREE11[k] && !TREE11[k].common))];
    if (!ks.length) return yield* _cm.apply(this, a);
    const k = ks[0], m = mainKind11(st); yield* this.msg((m ? '「' + m + '」還沒有學會任何招式。' : '現在沒有可以用的招式。') + '\n（' + k + '的招式要拿' + k + '才能用）'); return null; }; }
