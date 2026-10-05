/* ===================== v12.17 素材：拿到先放背包、到鐵匠才換點數（玩家 2026-10-05：「材料取得與轉化 還有對話中出現的撿到材料 玩家反應有點複雜」） =====================
   原本兩套並存：打怪・採集拿到的素材當場變成六類「素材點數」（訊息只寫點數），寶箱・NPC 給的卻留在背包當道具，任務要的又另外留著，
   拿到時的訊息有「素材點數：獸材 +2」「得到了素材「狼皮」！（任務要用，先留著）」「（→ 藥材 +1 點）」「又撿到了素材」「（幸運）多撿到了」好幾種。
   問了之後選：
   · 「保留素材，到鐵匠才換點數」：打怪、採集、寶箱、NPC 給的素材一律放進背包；鐵匠選單多一個「素材換點數」（任務要的自動留著）；
     打造・賦予點數不夠時，直接問要不要把背包的素材換掉。
   · 訊息統一「素材名＋點數」：「得到了素材：狼皮×2（獸材 +4）、硬石（金屬 +1）！」——括號是到鐵匠換得到的點數；戰鬥、採集、寶箱、對話都一樣。
   · 部位素材「維持，只把說明寫清楚」：背包裡分成自己一類「部位素材」，說明寫是哪顆晶石、升幾星要幾個。 */
function matPreview12(st = Game.st) { const R = reserved11(st), got = {}, kept = [];
  for (const k in st.bag) { if (!MATCAT11[k] || !(st.bag[k] > 0)) continue; const keep = Math.min(st.bag[k], R[k] || 0), n = st.bag[k] - keep; if (keep) kept.push(ITEMS[k].n);
    if (n > 0) { const c = MATCAT11[k]; got[c] = (got[c] || 0) + n * matVal12(k); } }
  return { got, kept }; }
function* matConvert12(ask0) { const st = Game.st, P = matPreview12(st);
  if (!Object.keys(P.got).length) { yield* say('背包裡沒有可以換的素材。' + (P.kept.length ? '\n（' + P.kept.join('、') + '是任務要用的，先留著。）' : '\n打倒魔物、採集、開寶箱都會拿到素材。')); return false; }
  if (!(yield* yesNo((ask0 ? ask0 + '\n' : '') + '把背包裡的素材換成點數嗎？\n→ ' + ptsText11(P.got) + (P.kept.length ? '\n（任務要的' + P.kept.slice(0, 3).join('、') + (P.kept.length > 3 ? '…' : '') + '會留著）' : '')))) return false;
  const got = bagToPts11(st); Sound.jingle('item'); yield* say('換好了！' + ptsText11(got).replace(/ (\d+)/g, ' +$1') + '\n現在的點數：' + ptsText11(pts11())); return true; }
function* matShort12(msg) { const P = matPreview12();
  if (Object.keys(P.got).length) { yield* matConvert12(msg + '\n背包裡還有素材。'); return; }
  yield* say(msg + '\n點數：' + (ptsText11(pts11()) || '0') + '\n打倒魔物、採集、開寶箱拿到素材，再到這裡換成點數。'); }
// the smith: 素材換點數
smithMenu = function* (f) { const st = Game.st;
  if (!st.flags.tutSmith11) { st.flags.tutSmith11 = 1; yield* say('（鐵匠改版了！）\n打造：用素材點數打底裝，品質決定基本數值、潛力和晶石孔。\n賦予：用潛力和點數把能力加上去。\n素材換點數：把背包裡的素材換成點數。'); }
  yield* ptsBar11((function* () {
    while (true) { const S = smith11(st), P = matPreview12(st), n = Object.values(P.got).reduce((a, b) => a + b, 0);
      const r = yield* ask('要做什麼？（鍛冶熟練 Lv' + S.lv + '）', ['素材換點數' + (n ? '（+' + n + '）' : ''), '打造', '賦予', '晶石', '幻化', '分解', '離開']);
      if (r === 0) yield* matConvert12(); else if (r === 1) yield* craft11(); else if (r === 2) yield* enchantMenu11(); else if (r === 3) yield* cryMenu11(); else if (r === 4) yield* glamour11(); else if (r === 5) yield* salvage11(); else break; } })()); };
// chests on the map: the same message as battles
{ const _pi = Overworld.prototype.pickItem; Overworld.prototype.pickItem = function* (it) {
    if (!it || it.gold || !it.item || GEAR[it.item] || !MATCAT11[it.item]) { const r = yield* _pi.call(this, it); if (it && it.gather) yield* matTut12(say); return r; }
    const st = this.st, n = it.n || 1; this.items = this.items.filter(i => i !== it); st.flags[it.id] = 1; st.bag[it.item] = (st.bag[it.item] || 0) + n;
    yield* itemGet(st.name + '撿到了素材：' + matLine12({ [it.item]: n }) + '！'); yield* matTut12(say); }; }
// people handing over materials: 「得到了藥草×3！」→「得到了藥草×3（藥材 +3）！」
{ const NM = Object.keys(MATCAT11).filter(k => ITEMS[k]).sort((a, b) => ITEMS[b].n.length - ITEMS[a].n.length), BY = {}; for (const k of NM) BY[ITEMS[k].n] = k;
  const RX = new RegExp('((?:撿到|得到|拿到|收到|採到)了?(?:素材)?[：]?)(「)?(' + NM.map(k => ITEMS[k].n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(」)?(?:×(\\d+))?(?!（)', 'g');
  const deco = s => typeof s !== 'string' || /（(金屬|布料|獸材|木料|藥材|魔素) \+/.test(s) ? s : s.replace(RX, (m, a, o, n, cl, c) => { const k = BY[n], q = +(c || 1); return a + (o || '') + n + (cl || '') + (c ? '×' + c : '') + '（' + MATCAT11[k] + ' +' + q * matVal12(k) + '）'; });
  const _ig = itemGet; itemGet = function* (text, ...a) { yield* _ig(deco(text), ...a); }; }
// the bag: parts get their own page, and say which crystal they are for
ITEM_CATS.splice(ITEM_CATS.indexOf('採集素材') + 1, 0, '部位素材'); ITEM_CAT_COL['部位素材'] = '#e8a0c8';
for (const sp in PARTS11) { const n = cryName11(sp);
  if (ITEMS['pt_' + sp]) Object.assign(ITEMS['pt_' + sp], { cat: '部位素材', d: SPECIES[sp].n + '的部位。用來升級「' + n + '」：★2 要 3 個，★3 要 5 個＋稀有部位 1 個（鐵匠→晶石）。' });
  if (ITEMS['pr_' + sp]) Object.assign(ITEMS['pr_' + sp], { cat: '部位素材', d: SPECIES[sp].n + '的稀有部位。把「' + n + '」升到 ★3 要 1 個（鐵匠→晶石）。打牠時多破防比較容易拿到。' }); }
// material text: where it comes from and what it is worth at the smith (the old「用途：N 件裝備」was from before points — gear no longer takes materials)
for (const k in MATCAT11) { const I = ITEMS[k]; if (!I) continue; let base0 = String(I.d || '').split('\n來源：')[0];
  Object.defineProperty(I, 'd', { configurable: true, enumerable: true, get() { const U = typeof MAT_USE12 !== 'undefined' ? MAT_USE12[k] : null, use = U ? U.items.slice(0, 2).join('、') : '';
    return base0 + '\n來源：' + (typeof matSource === 'function' ? matSource(k) : '') + '\n鐵匠「素材換點數」：' + MATCAT11[k] + ' ' + matVal12(k) + ' 點' + (use ? '\n也能做：' + use : ''); }, set(v) { base0 = String(v).split('\n來源：')[0]; } }); }
{ const i = GROW12.findIndex(q => q[0] === '素材點數與鐵匠'); const t = '打倒魔物、採集、開寶箱會拿到素材（放在背包）。到鐵匠選「素材換點數」，換成金屬・布料・獸材・木料・藥材・魔素六類點數（任務要的會自動留著），再用點數打造底裝、賦予能力。菁英・頭目的「部位素材」是升級晶石用的，不會換成點數。';
  if (i >= 0) GROW12[i][1] = t; else GROW12.push(['素材點數與鐵匠', t]); }

/* ===================== v12.18 雙刀・雙劍收回大半補償（玩家：「拿雙刀與雙劍 有什麼平衡調整嗎」→ 照建議調） =====================
   模擬（跟上進度）：雙刀・雙劍打頭目 10.1 回合、菁英 6.4〜6.6 回合，其他武器 15〜19・8.5〜11 → 收回 v12.8 加的補償：
   雙刀：受到的傷害 −25% → −20%、技能樹威力 ×1.25 拿掉（裝備沒跟上時 −10% 太脆，勝率掉到 31%）；
   雙劍：受到的傷害 −15% 拿掉，還是 10 回合打完頭目（主要是普攻兩下＋副手的一半數值）→ 副手威力 60% → 45%、雙劍的普攻 ×0.8、雙劍樹技能威力 ×0.8。 */
WBAL12.taken['雙刀'] = 0.8; delete WBAL12.taken['雙劍'];
for (const r of TREE11['雙刀'].sk) { const id = 't_' + r[1], D = DEF.skills[id]; if (!D || !D.power || D.powerOf) continue; D.power = Math.round(D.power / 1.25); r[3] = D.power; if (MOVES[id]) MOVES[id].pow = D.power; }
TREE11['雙刀'].trait = '多段攻擊每段威力 +10%，速度 +3，受到的傷害 −20%';
// 雙劍 was still far ahead (10 rounds a boss): its off hand starts at 45% (雙刀 60%) and its tree skills hit ×0.8
const DUALSW12 = { off: 0.15, pow: 0.8, basic: 0.8 };
PV('dualSw12', v => ({ mods: [{ stage: 'final', who: 'attacker', mul: v, cond: { tag: 'dual11' } }] }));
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (st && dualMode11(st) === '雙劍') { if (s.data.offMul11) s.data.offMul11 = Math.max(0.3, s.data.offMul11 - DUALSW12.off); s.passives.push({ key: 'dualSw12', v: DUALSW12.basic, src: 'tree' }); } return s; }; }
for (const r of TREE11['雙劍'].sk) { const id = 't_' + r[1], D = DEF.skills[id]; if (!D || !D.power || D.powerOf) continue; D.power = Math.round(D.power * DUALSW12.pow); r[3] = D.power; if (MOVES[id]) MOVES[id].pow = D.power; }
TREE11['雙劍'].mastD = '副手的威力 45%，每級 +6%';
TREE11['雙劍'].trait = '會心時副手追加一斬（威力 30）；雙劍的普攻（兩下）威力 ×0.8';
