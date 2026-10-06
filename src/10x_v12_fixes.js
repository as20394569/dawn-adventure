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

/* ---------- 回合開始先選指令（玩家：「好像有時候怪物會多打一次」→ 選了「回合開始先選指令」；規則在 10c 戰鬥核心） ----------
   While the hero is choosing, the order bar on the left shows who will act first this round (speed, 搶先 statuses, the monsters'
   chosen 搶先 skills); once the command is in, the real order replaces it (choosing 防禦・道具・逃跑 or a 搶先 skill puts the hero first). */
{ const _do = Battle.prototype.drawOrder; Battle.prototype.drawOrder = function (x) {
    const c = this.core; if (!(c && c.need && c.need.plan && typeof c.previewOrder === 'function') || this.cur < c.log.length) return _do.call(this, x); // v12.68: the next round's preview only once this round has finished playing
    const keep = this.order12; this.order12 = { ids: c.previewOrder(), done: 0 }; try { _do.call(this, x); } finally { this.order12 = keep; } }; }
if (typeof BATTLE_HELP !== 'undefined') for (const P of BATTLE_HELP) {
  if (P[0] === '行動順序') P[1] = ['每回合一開始先選好指令，再依速度輪流行動（左邊的小方塊是這回合的順序）。', '防禦、道具、逃跑一定最先執行；「搶先」技能在這一回合先出手，比對手慢也一樣。', '每回合每隻魔物只行動一次（頭目的「狂怒」例外）。', '防禦會一直減傷到自己下一次行動開始。', '護盾、潮濕、能力變化等效果是以「自己的行動次數」計算。'];
  if (P[0] === '技能與冷卻') P[1] = P[1].map(t => /搶先/.test(t) ? '「搶先」技能在這一回合先出手（比對手慢也一樣）。' : t);
}
