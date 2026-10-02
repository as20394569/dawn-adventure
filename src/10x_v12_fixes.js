/* ===================== v12.0.1 小修正 =====================
   ---------- 戰鬥中使用道具（玩家：「戰鬥中不能補血」） ----------
   In a battle the hero's HP / MP / status live in the battle core (core.byId.H); Game.st only gets them back when the battle ends
   (BB.apply). canUseItem still read Game.st, so after taking damage the hero still looked full there: every potion answered
   「現在使用也沒有效果。」 and nothing could be healed. Now, while a battle is running, the check reads the battle's numbers. */
const battleHero12 = () => { const b = Game.scene, c = b && b.core; return c && c.byId && c.byId.H && !c.over ? { b, c, H: c.byId.H } : null; };
{ const _cu = canUseItem; canUseItem = function (k) {
    const B = battleHero12(); if (!B) return _cu(k);
    const st = Game.st, keep = [st.hp, st.mp, st.status];
    st.hp = B.H.res.hp; st.mp = B.H.res.mp ?? st.mp; st.status = B.c.majorOf(B.H) || null;
    try { return _cu(k); } finally { st.hp = keep[0]; st.mp = keep[1]; st.status = keep[2]; }
  }; }
