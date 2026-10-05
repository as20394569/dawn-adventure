/* ===================== v12.0.9t 第十輪企劃・第一階段：怪物與掉落（〈曙光冒險 第十輪企劃：裝備取得與怪物難度重製〉，玩家 2026-10-04 決定） =====================
   問題：菁英打起來跟小怪一樣快（約 4 回合），回報卻好幾倍，再戰還會一直掉設計圖、打造券、精煉石、修練之書 → 玩家只刷菁英・頭目。
   這一階段：
   · 菁英一場 6〜8 回合、頭目 10〜14 回合（血量調高，菁英攻擊力略降，重點是要應對）。
   · 首次打倒：固定給牠自己的招牌設計圖（不再隨機、不給打造券）；經驗約等於 5 場（頭目 10 場）小怪。
   · 再戰：只給經驗（30%）、金錢、頭目素材；菁英一天（1200 步）重生一次。（回憶石碑一天一次 → 第十一輪改回隨時）
   · 原本只能從再戰拿到的設計圖（67 件）改成一般設計圖，鐵匠階級到了就能打。
   · 招牌裝備不超過當時鐵匠能打的階級（超出的降一階、數值照比例調低，保留專屬效果）。
   · 小怪素材 50% → 60%；修練之書再戰不掉，委託多給 10 本。 */

/* ---------- who gives which signature piece ---------- */
const SIG10 = {}, SIGSET10 = new Set(), REST10 = new Set();
{ const sw = k => [k, typeof MAGE_SWAP !== 'undefined' && MAGE_SWAP[k]].filter(x => x && GEAR[x]);
  for (const m in MAPS) { const M = MAPS[m]; for (const e of (M.elites || []).concat(M.boss ? [{ ...M.boss, id: M.boss.flag || M.boss.sp }] : [])) {
      const L = LOOT[e.id] || [], lord = /_lord$/.test(e.id || '') && typeof LORD_GEAR12 !== 'undefined' && LORD_GEAR12[e.sp] ? LORD_GEAR12[e.sp][0] : null;
      const s = lord || e.drop || (SPECIES[e.sp] || {}).drop || L[0]; if (!s || !GEAR[s]) continue;
      if (!SIG10[e.id]) SIG10[e.id] = { k: s, lv: e.lv }; else SIG10[e.id].lv = Math.min(SIG10[e.id].lv, e.lv);
      sw(s).forEach(k => SIGSET10.add(k)); for (const k of L) if (k !== s) sw(k).forEach(x => REST10.add(x)); } }
  for (const k of SIGSET10) REST10.delete(k); }
const sigOf10 = (key, sp) => (SIG10[key] && SIG10[key].k) || (SPECIES[sp] || {}).drop || (LOOT[key] || [])[0] || null;

/* ---------- 招牌裝備不超過當時鐵匠的階級 ---------- */
const GEARBAL10 = (() => { const rank = lv => Math.min(7, 2 + Math.floor(Math.max(0, lv - 4) / 6)), lvOf = {}, out = [];
  for (const id in SIG10) { const { k, lv } = SIG10[id]; for (const kk of [k, typeof MAGE_SWAP !== 'undefined' && MAGE_SWAP[k]].filter(x => x && GEAR[x])) lvOf[kk] = Math.min(lvOf[kk] ?? 99, lv); }
  const score = G => { const s = G.st || {}; return G.slot === 'weapon' ? Math.max(s.atk || 0, s.spa || 0) : Object.entries(s).reduce((a, [k, v]) => a + (k === 'hp' ? v / 4 : v), 0); };
  const med = {}; for (const k in GEAR) { const G = GEAR[k]; if (SIGSET10.has(k) || REST10.has(k) || !G.slot || !G.t || !G.st) continue; (med[G.slot + G.t] || (med[G.slot + G.t] = [])).push(score(G)); }
  const medOf = K => { const a = (med[K] || []).slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
  for (const k in lvOf) { const G = GEAR[k], r = rank(lvOf[k]); if (!G.t || G.t <= r) continue;
    const a = medOf(G.slot + G.t), b = medOf(G.slot + r), f = a && b ? Math.min(1, b / a) : 0.8;
    out.push([k, G.t, r, Math.round(f * 100)]); for (const s in G.st || {}) G.st[s] = Math.max(1, Math.round(G.st[s] * f)); G.t = r; }
  return out; })();
// the rematch-only designs become ordinary recipes (the smith knows them once his rank reaches their tier)
for (const k of REST10) BP_RARE.delete(k);

/* ---------- 難度：菁英・頭目 ---------- */
const TUNE10 = { elite: { hp: 1.8, pow: 0.9 }, boss: { hp: 1, pow: 1 } }; // bosses already last 7–10 rounds in the sims; they are re-tuned per area in stage 2 (after the gear numbers shrink)
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o), T = s && TUNE10[kind]; if (!T) return s;
    s.stats.hp = Math.max(1, Math.round(s.stats.hp * T.hp)); s.hp = s.stats.hp;
    if (T.pow !== 1) for (const k of ['atk', 'spa']) s.stats[k] = Math.max(1, Math.round(s.stats[k] * T.pow));
    return s; }; }

/* ---------- 掉落：首殺固定招牌設計圖，再戰不掉裝備 ---------- */
{ const _ld = lootDrops; lootDrops = function (b) { const F = b.F || {}; if (!(F.elite || F.boss)) return _ld(b);
    const st = Game.st, key = b.cfg.id || F.sp, kills = st.kills || (st.kills = {}), first = !kills[key] && !b.cfg.rematch; kills[key] = (kills[key] || 0) + 1;
    if (!first) return [];
    const sig = (/_lord$/.test(key) && SIG10[key] && SIG10[key].k) || b.cfg.drop || sigOf10(key, F.sp); if (!sig) return [];
    const k = SIGSET10.has(sig) && /^lg/.test(sig) ? sig : classGear(sig); return GEAR[k] ? [makeGear(k, 1)] : []; }; } // quality 1: the blueprint only, no ticket

/* ---------- 經驗：首殺約 5 場（頭目 10 場）小怪，頭目再戰也只有 30% ---------- */
const medExp10 = maps => { const L = []; for (const m of maps) for (const e of (MAPS[m] || {}).encounters || []) for (const r of e.table || []) { const s = SPECIES[r[0]]; if (s && s.exp && !s.rare) L.push(s.exp); } L.sort((a, b) => a - b); return L.length ? L[Math.floor(L.length / 2)] : 0; };
const WILD_EXP10 = medExp10(Object.keys(MAPS)) || 20; // a typical wild monster's base EXP (median; the map the fight is on is used when it has encounters)
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const F = this.F, st = Game.st, cfg = this.cfg || {};
    if (F && (F.elite || F.boss) && st) {
      if (cfg.rematch) { if (F.boss) a = Math.max(1, Math.floor(a * 0.3)); }
    } // v12.19（玩家 2026-10-05：「boss與菁英取消第一次討伐獎勵」）：第一次打倒的大量經驗（約 5 場／頭目 10 場小怪）拿掉，照一般算
    return yield* _ge.call(this, a); }; }

/* ---------- 回憶石碑：第十一輪改成隨時可以再戰（見 r9u） ---------- */

/* ---------- 修練之書：委託多給 10 本（再戰不掉的部分在 10o） ---------- */
for (const k of ['c16', 'c18', 'c20', 'c22', 'c25', 'c26', 'c27', 'c28', 'c30', 'c33']) { const R = COMMISSIONS[k] && COMMISSIONS[k].reward; if (R) (R.items || (R.items = {})).trainBook = (R.items.trainBook || 0) + 1; }

/* ---------- 顯示：遭遇卡、圖鑑 ---------- */
lootHint = function (key, sp) { const first = !((Game.st.kills || {})[key]), sig = sigOf10(key, sp), mat = (SPECIES[sp] || {}).mat, g = sig && GEAR[/^lg/.test(sig) ? sig : classGear(sig)];
  if (first && g) return '首次擊敗：「' + g.n + '」的設計圖';
  return '再戰：經驗、金錢' + (mat && ITEMS[mat] ? '、' + ITEMS[mat].n : ''); };
