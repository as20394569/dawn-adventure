/* ===================== v12.109 讓魔防「有感」：物防・魔防拉開＋菁英・頭目的防禦架勢 =====================
   玩家 2026-10-10：「魔法傷害那個問題有什麼好方法嗎?」→ 選了 1＋2：
   1. 魔物的物防・魔防拉開：硬殼・鎧甲類（構造體、蟲、軟泥、甲殼、骷髏和騎士…）物防高魔防低；靈體・法師類反過來。
      兩邊的乘積不變（總耐打度差不多），只是偏向一邊：Lv30 以上差到約 1.5 倍，Lv30 以下約 1.22 倍（v12.122 起 Lv1 就拉開，因為第一段就有魔法招了；之前是 Lv12 以下不動）。
      本來就偏得更多的不動。遭遇卡・圖鑑的「魔防較低／物防較低」照這個顯示。
   2. Lv15 以上的菁英・頭目會換架勢（v12.122 起，之前是 Lv30）：第 3 回合起每 4 回合，對牠「最怕的那一種」張開 2 次行動的防禦（受到的傷害 −40%），
      鎧甲類張「魔障」（魔法 −40%）、靈體類張「硬殼」（物理 −40%）、不偏的輪流。張開時有提示，頭上也有圖示，逼玩家換招。 */

// 1. 物防・魔防拉開
function lean15(sp) { const S = SPECIES[sp], P = MON_PANEL[sp]; if (!S || !P) return 0; const n = S.n || '', f = S.fam;
  if (f === 'spirit' || /魂|靈|鬼|怨|幽|巫|魔女|法師/.test(n)) return -1;
  if (['construct', 'insect', 'ooze'].includes(f) || /甲|殼|鎧|騎士|兵|岩|石|鐵|龜|蟹|貝|骷髏|骸骨|魔像|哨兵/.test(n)) return 1;
  if (P.spa > P.atk * 1.15) return -1;
  return 0; }
const SPLIT15 = 1.22; // √(物防/魔防)：1.22² ≈ 1.49
for (const sp in MON_PANEL) { const P = MON_PANEL[sp], L = lean15(sp); if (!L || !P.def || !P.spd || SPECIES[sp] && SPECIES[sp].iro15) continue;
  const lv = P.lv || 1, k = lv < 30 ? 0.5 : 1; // v12.122 第一段就有魔法招了 → Lv1 起就拉開
  const want = Math.pow(SPLIT15, 2 * k), cur = L > 0 ? P.def / P.spd : P.spd / P.def; if (cur >= want) continue;
  const m = Math.sqrt(P.def * P.spd), r = Math.sqrt(want); if (L > 0) { P.def = Math.round(m * r); P.spd = Math.max(1, Math.round(m / r)); } else { P.spd = Math.round(m * r); P.def = Math.max(1, Math.round(m / r)); } }

// 2. 架勢
ST11('pguard15', '硬殼', { mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { cat: '物', hasPower: 1 } }] });
ST11('mguard15', '魔障', { mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { cat: '特', hasPower: 1 } }] });
Object.assign(BUFF12, { pguard15: { n: '硬殼', k: 'def', tip: '受到的物理傷害 −40%（改用魔法招）' }, mguard15: { n: '魔障', k: 'def', tip: '受到的魔法傷害 −40%（改用物理招）' } });
COND.stanceDue15 = (c, v) => { const r = c.core.round; if (r < 3 || (r - 3) % 4) return false; const i = (r - 3) / 4; return v === 'a1' ? i % 2 === 0 : v === 'a2' ? i % 2 === 1 : true; };
const STANCE_TXT15 = { pguard15: '（身體變得像岩石一樣硬——物理傷害 −40%，換魔法招打吧！）', mguard15: '（四周張開了魔力的屏障——魔法傷害 −40%，換物理招打吧！）' };
const stanceTr15 = (st, when) => ({ on: EVT.ROUND_START, phase: 'POST', cond: { ownerAlive: 1, stanceDue15: when }, effects: [{ type: 'status', target: 'self', status: st, dur: 2 }, { type: 'message', target: 'self', text: STANCE_TXT15[st] }] });
defPut('mechanics', 'stanceP15', { make: () => ({ triggers: [stanceTr15('pguard15', 'all')] }) });
defPut('mechanics', 'stanceM15', { make: () => ({ triggers: [stanceTr15('mguard15', 'all')] }) });
defPut('mechanics', 'stanceA15', { make: () => ({ triggers: [stanceTr15('pguard15', 'a1'), stanceTr15('mguard15', 'a2')] }) });
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o);
    if (!s || (kind !== 'elite' && kind !== 'boss') || (lv || 0) < 15) return s; // v12.122 Lv30 → Lv15 起 const r = s.stats.def / Math.max(1, s.stats.spd);
    (s.data.mechanics || (s.data.mechanics = [])).push(r >= 1.15 ? 'stanceM15' : r <= 0.87 ? 'stanceP15' : 'stanceA15'); return s; }; }
