/* ===================== v12.0.9q 試玩後的三個選擇（玩家 2026-10-04 回答） =====================
   1. 「任務說明加練等建議」：等級比任務的推薦等級低時，任務詳情寫出現在去得到、魔物等級剛好的練等地點。
   2. 「打輸頭目時提示去打造」：打輸菁英魔物或頭目醒來後，手上有打造券（或素材夠打造）就提醒去鐵匠那裡。
   3. 「主線進行中不自動換」：接下委託時，主線還沒完成就不把追蹤換成委託，只提示可以在任務選單切換。 */

// ---------- 1. 練等建議 ----------
function wildLevel9(id) { let lo = 99, hi = 0; for (const e of (MAPS[id] || {}).encounters || []) for (const r of e.table || []) if (typeof r[1] === 'number') { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2] || r[1]); } return hi ? [lo, hi] : null; }
const LOCK9 = { canyon: st => !!st.flags.croc, ruins: st => !!st.flags.golem || (typeof sealCount === 'function' && sealCount(st) >= 3) }; // behind the 沼澤鱷 bridge / the sealed door
function openMap9(id, st) { if (LOCK9[id] && !LOCK9[id](st)) return false; const W = []; for (const a in MAPS) for (const w of MAPS[a].edgeWarps || []) if (w.to && w.to[0] === id && a !== id) W.push(w);
  return !W.length || W.some(w => !w.need || st.flags[w.need]); }
function grindSpot9(st = Game.st) { // the nearest place whose wild monsters are about the hero's level (much weaker ones keep away and give little EXP)
  let best = null; for (const id in MAPS) { if (id === 'rift' || /^cave6_/.test(id)) continue; const L = wildLevel9(id); if (!L || L[0] > st.lv + 2 || L[0] < st.lv - 3 || L[1] < st.lv || !openMap9(id, st)) continue;
    const R = mapRoute(st.map, id); if (!R) continue; const d = R.length; if (!best || d < best.d || (d === best.d && L[1] > best.L[1])) best = { id, d, L }; }
  return best; }
{ const _qt = questTips; questTips = function (q, st = Game.st) { const T = _qt(q, st), m = /推薦Lv(\d+)/.exec((q && q.t) || ''); if (!m) return T;
    const rec = +m[1], i = T.findIndex(t => /^建議等級/.test(t)), line = '建議等級：Lv' + rec;
    if (st.lv + 1 >= rec) { if (i >= 0) T[i] = line + (st.lv >= rec + 6 ? '（對你來說很輕鬆）' : ''); else T.unshift(line); return T; }
    const g = grindSpot9(st), tip = line + '（你現在Lv' + st.lv + '。' + (g ? (g.id === st.map ? '這裡' : (MAPS[g.id].name || '附近')) + '的魔物 Lv' + g.L[0] + '〜' + g.L[1] + '，適合先練等' : '先在附近練等') + '，也記得準備傷藥）';
    if (i >= 0) T[i] = tip; else T.unshift(tip); return T; }; }

// ---------- 2. 打輸頭目後提醒打造 ----------
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function (cfg, ...a) { Game.lastFight9 = cfg && cfg.kind; return _bs.call(this, cfg, ...a); }; }
function craftHint9(st = Game.st) {
  const tk = Object.keys(st.bpT || {}).filter(k => GEAR[k]).reduce((n, k) => n + (typeof tkCount === 'function' ? tkCount(k, st) : 1), 0);
  if (tk) return '（打不贏的時候，可以把打造券拿去鐵匠那裡，免費打造新裝備。你現在有 ' + tk + ' 張打造券。）';
  const can = Object.keys(st.bp || {}).filter(k => GEAR[k] && GEAR_RECIPE[k] && typeof bpCan === 'function' && bpCan(k, 0, st)).length;
  if (can) return '（打不贏的時候，可以去鐵匠那裡用素材打造新裝備。現在的素材可以打造 ' + can + ' 種。）';
  return null; }
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { const k = Game.lastFight9; Game.lastFight9 = null; yield* _wo.apply(this, a);
    if (k === 'elite' || k === 'boss') { const h = craftHint9(this.st); if (h) yield* say(h); } }; }

// ---------- 3. 接委託不換掉主線的追蹤 ----------
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st; if (st && st.com) { const seen = st.comSeen || (st.comSeen = {}), M = questList(st).find(q => q.main && !q.done);
      if (M) for (const k in st.com) if (!seen[k] && st.com[k].s === 'on' && COMMISSIONS[k]) { seen[k] = 1; (Game.comMsg9 || (Game.comMsg9 = [])).push(COMMISSIONS[k].n); } }
    if (Game.comMsg9 && Game.comMsg9.length && !this.script && Game.scene === this && !UI.stack.length) { const n = Game.comMsg9.shift(); this.run(say('（接下了委託「' + n + '」。畫面右上角還是顯示主線；想追蹤委託的話，到任務選單切換。）')); }
    return _u.apply(this, a); }; }
