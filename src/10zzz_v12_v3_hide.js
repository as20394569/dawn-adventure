/* ===================== v12.32 樂器・魔導書・火槍 暫時拿掉（玩家 2026-10-06：「樂器 魔導書火槍 可以先暫時移除遊戲 目前沒有多少玩家玩」，這三種的特效「完全不行」） =====================
   資料都留著，要開回來只要把 HIDE_K13 清空。
   · 覺醒選武器、鐵匠打造、技能樹分頁、特效測試版：不再出現這三種。
   · 掉落：地圖的裝備池拿掉這三種（一般掉落・稀有掉落都從裝備池挑）；其他地方（寶箱・獎勵・劇情）給到的換成同階的替代武器。
   · 舊存檔：身上・背包裡的這三種換成同階、同品質的替代武器（魔導書・樂器 → 法杖、火槍 → 劍），賦予和晶石照留；
     這三棵樹的技能點全部退回；原本主武器是這三種的，替代武器的特性直接學好（跟覺醒時一樣）。 */
const HIDE_K13 = ['樂器', '魔導書', '火槍'], SWAP_K13 = { 樂器: '法杖', 魔導書: '法杖', 火槍: '劍' };
function kindOn13(k) { return !HIDE_K13.includes(k); }
const hidG13 = k => { const G = k && GEAR[k]; return !!(G && G.slot === 'weapon' && HIDE_K13.includes(G.kind)); };
const swapOf13 = k => { const G = GEAR[k], t = clamp((G && G.t) || 1, 1, 8); return BASE11.weapon[SWAP_K13[G.kind]][t - 1]; };
// the first weapon to pick
for (let i = START_KINDS12.length - 1; i >= 0; i--) if (!kindOn13(START_KINDS12[i])) START_KINDS12.splice(i, 1);
// drops come from the maps' gear pools
for (const id in MAPS) { const P = MAPS[id].gearPool; if (!P) continue; for (let i = P.length - 1; i >= 0; i--) { const k = P[i]; if (hidG13(k) || (GEAR[k] && hidG13(base11Of(k)))) P.splice(i, 1); } }
{ const _df = dropFits12; dropFits12 = function (k, sp) { if (hidG13(k) || (GEAR[k] && hidG13(base11Of(k)))) return false; return _df(k, sp); }; }
// anything else that hands one out gets the stand-in
{ const _mg = makeGear; makeGear = function (b, q, r) { const k = GEAR[b] ? base11Of(b) : b; if (hidG13(b) || hidG13(k)) { const G0 = GEAR11_GLAM; GEAR11_GLAM = false; try { return _mg.call(this, swapOf13(hidG13(k) ? k : b), q, r); } finally { GEAR11_GLAM = G0; } } return _mg.call(this, b, q, r); }; }
// old saves
function hideFix13(st) { if (!st || st.hide13v) return; st.hide13v = 1; const T = tr11(st), main = (() => { const w = gearBy(st.equip && st.equip.weapon, st); return w && GEAR[w.b] ? GEAR[w.b].kind : null; })();
  for (const g of st.gear || []) { if (!hidG13(g.b)) continue; g.b = swapOf13(g.b); if (g.gl && (hidG13(g.gl) || (GEAR[g.gl] && GEAR[g.gl].slot === 'weapon'))) delete g.gl; }
  let refund = 0; for (const kind of HIDE_K13) { if (!TREE11[kind]) continue; for (const N of treeNodes11(kind)) { if (T.lv[N.key]) { refund += T.lv[N.key]; delete T.lv[N.key]; } } delete T.eq[kind]; }
  const gone = id => { const tr = treeOf11(id); return tr && HIDE_K13.includes(tr[0]); }; if (st.slots) st.slots = st.slots.filter(id => !gone(id));
  if (main && HIDE_K13.includes(main)) { const nk = SWAP_K13[main]; if (!T.lv[nk + ':trait']) T.lv[nk + ':trait'] = 1; }
  if (refund) st.hide13msg = refund; }
{ const _so = startOverworld; startOverworld = function (...a) { try { hideFix13(Game.st); } catch (e) { bvErr('v12.32', 'hide ' + e.message); } return _so.apply(this, a); }; }
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a); const st = this.st || Game.st; if (st && st.hide13msg) { const n = st.hide13msg; delete st.hide13msg;
    const go = (function* () { yield* say('（樂器・魔導書・火槍暫時下架了：身上的這三種換成了同階、同品質的法杖或劍（賦予和晶石照留），這三棵技能樹用掉的 ' + n + ' 點技能點已經退回。）'); })();
    if (this.script) { const s0 = this.script; this.script = (function* () { yield* s0; yield* go; })(); } else this.run(go); } }; }
// help texts that talked about them
if (typeof GROW12 !== 'undefined') { const q = GROW12.find(x => x[0] === '慣性'); if (q) q[1] = q[1].replace('魔導書的特性讓變化減半。', ''); }
if (typeof BATTLE_HELP !== 'undefined') for (const q of BATTLE_HELP) if (Array.isArray(q[1])) q[1] = q[1].filter(t => !/^火槍學會特性後/.test(t));
