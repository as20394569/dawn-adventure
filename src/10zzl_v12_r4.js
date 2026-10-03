/* ===================== v12.0.4 第四輪：探索與獎勵（玩家在〈第四輪提案〉勾選，2026-10-03） =====================
   1. 稀有魔物：沒有的 9 張地圖補上，第二章 3 張改成不同種類（霜語雪原留白金泡泡姆）。都用現有的 7 種，等級跟地圖，出現率照舊 3%。
   2. 第四、五幕 7 張地圖：離入口最遠的一個藥水寶箱換成果實／修練之書／天賦之書（已經打開過的照舊）。
   3. 地圖畫面（冒險手冊→紀錄→地圖）多兩行收集進度：寶箱、記載之石、天氣祠、祕境、稀有魔物（04d 的 recordScreen 呼叫 mapProgress12）。
   4. Lv17 以後的地圖，寶箱裡的好傷藥換成特級傷藥（數量不變）。
   5. 果實的說明改成「六種一起算」（10zzi 的 GROW12）。金幣照舊。 */

/* ---------- 1. 稀有魔物 ---------- */
const RARE12 = { windHills: 'goldSlime', jadeCreek: 'moonFox', maplePass: 'moonFox', oldField: 'goldSkeleton', capSewer: 'gemSlime', lavaTunnel: 'gemSlime',
  clockTower1: 'crystalBat', iceCave: 'crystalBat', duskFort1: 'paleWraith', northRoad: 'moonFox', goldPlains: 'goldSlime', emberPass: 'gemSlime' };
const encRange12 = m => { let lo = 99, hi = 0; for (const e of MAPS[m].encounters || []) for (const r of e.table || []) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2] ?? r[1]); } return hi ? [lo, hi] : null; };
for (const m in RARE12) { const d = MAPS[m], sp = RARE12[m]; if (!d || !SPECIES[sp] || !MON_PANEL[sp]) continue; const L = encRange12(m); if (!L) continue; d.rare = [sp, L[0], L[1]]; }

/* ---------- 2・4. 寶箱 ---------- */
const PERM12 = { northRoad: 'agiFruit', capSewer: 'trainBook', clockTower1: 'dexFruit', frostField: 'vitFruit', iceCave: 'trainBook', lavaTunnel: 'powerFruit', duskFort1: 'tpBook' };
const chestCons12 = it => !it.gold && !it.q && !it.show && ITEMS[it.item] && /傷藥|魔力|萬靈藥|活力茶/.test(ITEMS[it.item].n);
function mapEntries12(d) { const E = [], h = d.rows.length, w = d.rows[0].length;
  if (d.exit && typeof d.exit.x === 'number') E.push([d.exit.x, d.exit.y]);
  for (const e of d.edgeWarps || []) { const [a, b] = e.at || [0, 0]; for (let k = a; k <= b; k++) E.push(e.dir === 'up' ? [k, 0] : e.dir === 'down' ? [k, h - 1] : e.dir === 'left' ? [0, k] : [w - 1, k]); }
  if (!E.length) E.push([Math.floor(w / 2), h - 1]); return E; }
for (const m in PERM12) { const d = MAPS[m]; if (!d || !d.items || !ITEMS[PERM12[m]]) continue; const E = mapEntries12(d);
  const far = d.items.filter(chestCons12).map(it => [it, Math.min(...E.map(([x, y]) => Math.abs(x - it.x) + Math.abs(y - it.y)))]).sort((a, b) => b[1] - a[1])[0];
  if (far) { far[0].item = PERM12[m]; delete far[0].n; far[0].perm12 = 1; } }
for (const m in MAPS) { const d = MAPS[m], L = d.items && mapLevel(m); if (!L || L[0] < 17) continue; for (const it of d.items) if (it.item === 'superPotion' && ITEMS.megaPotion) it.item = 'megaPotion'; }

/* ---------- 3. 地圖的收集進度（兩行） ---------- */
function mapProgress12(id, st = Game.st) { const d = MAPS[id] || {}, f = st.flags || {}, mark = ok => ok ? '✓' : '—';
  const items = (d.items || []).filter(it => f[it.id] || !it.show || it.show(st)), got = items.filter(it => f[it.id]).length;
  const L = LORE.map((l, i) => [l, i]).filter(([l]) => l[0] === id), read = L.filter(([, i]) => (st.lore || {})[i]).length;
  const a = ['寶箱 ' + got + '／' + items.length].concat(L.length ? ['記載之石 ' + read + '／' + L.length] : []);
  const ws = (d.npcs || []).some(n => n.id === 'wshrine_' + id), ext = typeof EXT_OPEN !== 'undefined' && EXT_OPEN[id], rr = d.rare;
  const b = [ws ? '天氣祠 ' + mark((st.wsh || {})[id] !== undefined) : '', ext ? '祕境 ' + mark(extSeen(id, st)) : '', rr ? '稀有魔物 ' + mark(((st.dex || {})[rr[0]] || {}).won > 0) : ''].filter(Boolean);
  return [a.join('　'), b.join('　')]; }
