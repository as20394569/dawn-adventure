/* ===================== v12.0.2 技能練度合一（玩家在〈第一輪打磨提案〉勾選） =====================
   「學會次數」和「進化進度」本來就是同一個「用過幾次」（技能庫的 x），只是分開顯示，重的技能還會先「改」才「學會」。
   現在是一條練度，三個刻度：學會（武器技能 6／10／14 次；職業技能到等級就學會）→ 改（學會 +6）→ 極（學會 +30）。
   輕的技能跟以前一樣（6／12／36），重的技能變成 14／20／44。修練之書照舊 +12。已經改／極的不會退回。 */
const evoSkill12 = o => o && (DEF.skills['o_' + o.k] ? 'o_' + o.k : DEF.skills[o.k] ? o.k : null);
evoAt = (o, s = orbStage(o)) => { const id = evoSkill12(o); return id ? BB.learnN(id) + (s >= 1 ? 30 : 6) : ORB_EVO[s]; };
// lvl: 0 not learned · 1 learned · 2 改 · 3 極; M = the three marks
function masteryOf12(st, id) { const e = BB.skillObj(st, id); if (!e || !DEF.skills[id] || DEF.skills[id].tags.includes('sig')) return null; const N = BB.learnN(id), M = [N, N + 6, N + 30];
  const lvl = !e.learned ? 0 : 1 + Math.min(2, orbStage(e)); return { e, x: e.x || 0, M, lvl, next: lvl === 0 ? M[0] : lvl < 3 ? M[lvl] : null, pending: orbPending(e) }; }
function drawMastery12(x, X, Y, w, m) { if (!m) return; const max = m.M[2], f = Math.min(1, m.x / max);
  x.fillStyle = '#10121e'; x.fillRect(X, Y, w, 4); x.fillStyle = m.lvl >= 3 ? '#ffd860' : m.pending ? '#ffb070' : m.lvl >= 1 ? '#7ad0ff' : '#9aa0b8'; x.fillRect(X, Y, Math.max(1, Math.round(w * f)), 4);
  for (let k = 0; k < 3; k++) { const tx = Math.min(X + w - 2, X + Math.round(w * m.M[k] / max) - 1); x.fillStyle = m.lvl > k ? '#fff4c8' : '#5a5f78'; x.fillRect(tx, Y - 1, 2, 6); } }
const masteryText12 = (st, id) => { const m = masteryOf12(st, id); if (!m) return ''; const src = BB.sourceOf(st, id), s = src && src !== '已學會' ? '・' + src : '';
  if (m.lvl === 0) return '【練度 ' + m.x + '/' + m.next + '：再用 ' + Math.max(0, m.next - m.x) + ' 次永久學會' + s + '】';
  if (m.lvl >= 3) return '【練度已滿（極）' + s + '】';
  return '【已學會' + s + '・練度 ' + m.x + '/' + m.next + (m.pending ? '：可以進化「' + (m.lvl === 1 ? '改' : '極') + '」！' : '：滿了可以進化「' + (m.lvl === 1 ? '改' : '極') + '」') + '】'; };
{ const _si = BB.skillInfo; BB.skillInfo = function (st, id) { const t = _si.call(this, st, id), m = masteryOf12(st, id); if (!m) return t;
    return t.replace(/　【(?:已學會[^】]*|[^】]*再用\d+次永久學會)】/, '　' + masteryText12(st, id)); }; }
Object.assign(ITEMS.trainBook, { d: '選一個已學會的技能，練度 +12。' });
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(q => q[0] === '技能與冷卻');
  if (P) P[1] = P[1].map(t => /用滿 6／10／14 次永久學會/.test(t) ? '技能來自職業（等級到了學會）和武器（裝備就能用）。每用一次練度 +1：滿第一格學會，再用 6 次可以進化「改」，再用 24 次進化「極」。' : t); }
