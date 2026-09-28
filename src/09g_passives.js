/* ===================== v24.2 class passives shown in the menus =====================
   Playtest: "the class passives can't be seen in the skill menu, so players can't tell whether they have one".
   The first tile of the skill tree (選單→技能) and the first row of 狀態→技能 are now 「職業被動」: the passives the current class
   gives (read from CLASSES[cls].st, the same keys the battle code uses), the class stat bonus, and the gear specials in effect.
   A class without passives says so, so "none" is also an answer. */
const CLASS_PASSIVE_INFO = {
  venomEdge: ['毒刃', (v, S) => '物理攻擊' + (S && S.fx && S.fx.poisonEdge ? 35 : 20) + '%機率讓對手中毒'],
  assassin: ['暗殺', () => '第1回合的攻擊必定會心'],
  venomous: ['追擊毒傷', v => '對中毒的對手傷害+' + v + '%'],
  shadowStep: ['殘影', () => '閃過攻擊後立刻反擊（70%傷害）'],
  rage: ['狂怒', () => 'HP低於一半時傷害+30%'],
  spellblade: ['魔劍共鳴', () => '物攻與魔攻互相加成45%'],
  elem: ['元素親和', v => '屬性技能傷害+' + v + '%'],
  fireUp: ['火焰專精', v => '火系技能傷害+' + v + '%'],
  boltUp: ['雷霆專精', v => '雷系技能傷害+' + v + '%'],
};
const CLASS_BONUS_TXT = { hp: ['HP', ''], mp: ['MP', ''], atk: ['物攻', ''], def: ['物防', ''], spa: ['魔攻', ''], spd: ['魔防', ''], spe: ['速度', ''], crit: ['會心', '%'], eva: ['迴避', '%'] };
function classPassives(cls, S) {
  const C = CLASSES[cls]; if (!C) return [];
  return Object.keys(C.st).filter(k => CLASS_PASSIVE_INFO[k] && C.st[k]).map(k => ({ k, n: CLASS_PASSIVE_INFO[k][0], d: CLASS_PASSIVE_INFO[k][1](C.st[k], S) }));
}
function classBonusText(cls) {
  const C = CLASSES[cls]; if (!C) return '';
  return Object.keys(CLASS_BONUS_TXT).filter(k => C.st[k]).map(k => CLASS_BONUS_TXT[k][0] + '+' + C.st[k] + CLASS_BONUS_TXT[k][1]).join(' ');
}
function gearSpecialNames() { let S; try { S = heroStats(); } catch (e) { return []; } const fx = (S && S.fx) || {}; return Object.keys(fx).filter(k => fx[k] && SPECIALS[k]).map(k => SPECIALS[k].n); }
const classPassiveNode = () => ({ id: '_passive', passive: 1 });
// the detail block: title, one line per passive (shrunk to fit), class bonus, gear specials
function drawPassiveInfo(x, st, X, Y, w, big) {
  const C = CLASSES[st.cls]; let S = null; try { S = heroStats(); } catch (e) { }
  const P = classPassives(st.cls, S), L = [];
  if (!P.length) L.push(['這個職業沒有被動效果。', UIC.muted]);
  for (const p of P) L.push(['「' + p.n + '」' + p.d, UIC.text]);
  const bt = classBonusText(st.cls); if (bt) { const t = '加成：' + bt + (C && C.tier === 1 && st.lv < 10 ? '（Lv10前逐步提升）' : '');
    if (Font.width(t, 8) <= w) L.push([t, UIC.accent]); else { const parts = t.split(' '), half = Math.ceil(parts.length / 2); L.push([parts.slice(0, half).join(' '), UIC.accent], ['　　　' + parts.slice(half).join(' '), UIC.accent]); } }
  const G = gearSpecialNames(); L.push(['裝備特效：' + (G.length ? G.join('、') : '沒有'), G.length ? '#c9cfe4' : UIC.muted]);
  const base = big && L.length <= 4 ? 11 : 10, fit = (t, y, col, z0 = base) => { let z = z0; while (z > 7 && Font.width(t, z) > w) z--; Font.draw(x, t, X, y + (z0 - z) / 2, col, UIC.textSh, z); };
  fit('職業被動　' + (C ? C.n : '—'), Y, UIC.warm, 11);
  const avail = (big ? 78 : 84) - 16, lh = Math.min(big ? 15 : 13, Math.floor(avail / L.length));
  L.forEach(([t, col], i) => fit(t, Y + 16 + i * lh, col));
}
// the tile at the front of the skill tree grid
function drawPassiveTile(x, st, X, Y, on) {
  const n = classPassives(st.cls).length; drawBtn(x, X, Y, 54, 31, on, UIC.warm);
  Font.drawC(x, '職業被動', X + 28, Y + 1, UIC.warm, UIC.textSh, 11); Font.drawC(x, n ? n + '項' : '無', X + 28, Y + 16, n ? UIC.text : UIC.muted, UIC.textSh, 9);
}
