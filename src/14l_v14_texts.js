/* ===================== v14.11 全系統檢查・第二輪（文字・畫面） =====================
   還在講等級、MP、裝備、晶石、天賦、打造、經驗值的地方：
   · 背包沒有「裝備」分頁；素材・部位的說明改寫卡牌工坊；魔物圖鑑的「能力」「掉落」改寫卡牌戰鬥的資訊
   · 遭遇卡不寫等級、晶石；稱號沒有戰鬥效果；寶箱撿到裝備不說「放進裝備欄」
   · 告示牌的「（魔物Lv4〜8）」「建議Lv15以上」、天候・彩虹・極光・魔物群的「經驗值+N%」→ 改成掉卡
   · 「體力和魔力」「HP・MP」→ 只說 HP；NPC 說打造、天賦、遺忘之書的句子改寫
   · 輸了以後提示「去鐵匠打造 T3 的短刀」「技能樹還有 N 點」→ 改成卡牌的提示
   · 流浪魔劍士打贏後不再問「要繼承魔劍士嗎」（卡牌版的職業只有四個，牠給一張卡）
   · 魔物招式說明「降低對手的物防」→「讓對手易傷」（v14.10 起就是易傷・虛弱） */

/* ---------- say：規則把整句拿掉時，不要出現空白的對話框 ---------- */
{ const nc = t => (typeof ncTxt12 === 'function' ? ncTxt12(t) : t); const _say = say; say = function* (text, ...a) { if (!Game.noV14 && typeof text === 'string' && text && !KD.fixTxt(nc(KD.fixTxt(text))).trim()) return null; return yield* _say.call(this, text, ...a); }; }

/* ---------- 文字規則 ---------- */
KD.TXT.push(
  // 等級
  [/（魔物Lv\d+\s*[〜~～-]\s*\d+）/g, ''], [/（魔物很強，建議Lv\d+以上）/g, '（魔物很強）'], [/[，。]?建議Lv\d+以上。/g, '。'], [/（對手 ?Lv ?\d+）/g, ''],
  // 經驗值 → 掉卡
  [/（Lv\+2），但經驗值\+40%/g, '，但掉卡的機率提高'], [/戰鬥經驗值\s*\+\s*20%/g, '掉卡的機率提高'], [/（連續(\d+)場戰鬥，經驗值\+25%）/g, '（連續$1場戰鬥，掉卡的機率提高）'],
  // MP
  [/體力和魔力/g, '體力'], [/HP・MP/g, 'HP'], [/HP ?和 ?MP/g, 'HP'], [/心裡平靜了下來。MP 全部回復了。/g, '心裡平靜了下來。'],
  // 稱號・職業
  [/（可以在「稱號」裡裝備）/g, '（可以在「稱號」裡戴上）'], [/（找村長轉職）/g, ''], [/解鎖了上級職業「([^」]+)」！/g, '完成了「$1」的試煉！'], [/到王都的冒險者公會轉職吧。/g, ''],
  // 裝備的品質標記（【紫】【金】…）
  [/【(藍|紫|紅|金|虹|白|綠|灰)】/g, ''],
  // 輸了以後的舊提示（技能樹・屬性點・打造）
  [/（技能樹還有 ?\d+ ?點沒用！[^）]*）/g, ''], [/（還有 ?\d+ ?點屬性點沒分配。[^）]*）/g, ''], [/（技能點累積了 ?\d+ ?點！[^）]*）/g, ''],
  [/（打不贏的時候，可以把打造券拿去鐵匠那裡[^）]*）/g, ''], [/（打不贏的時候，可以去鐵匠[^）]*打造[^）]*）/g, ''],
  // 重擊
  [/重擊就防禦/g, '重擊就先疊格擋'], [/最好防禦/g, '最好先疊格擋'], [/看到重擊就防禦/g, '看到重擊就先疊格擋'],
  // NPC
  [/武器和防具大多要找鐵匠打造。打倒魔物拿到的素材，先別急著賣掉！/g, '打倒魔物拿到的素材先別急著賣掉，鐵匠的卡牌工坊升級卡要用！'],
  [/新武器拿到手要多用用看。/g, '新拿到的卡要多用用看喔。'], [/武器帶著的技能，用熟了就算換了武器也不會忘喔。/g, '牌組別塞太多張，好卡才常常抽得到。'],
  [/聽說鐵匠用硬石和水晶碎片就能打一把。/g, '可惜那是騎士團才有的東西。'], [/對了，(天賦選錯|技能樹點錯)的話，這裡有賣遺忘之書喔。/g, '對了，牌組裡不想要的卡，這家店可以花錢刪掉喔。'],
  [/是打造沙漠裝備的最好材料。/g, '是升級卡牌的好素材。'], [/我就能打造一整套峽谷的裝備！/g, '我就能幫你把卡磨得更利！'],
  [/王國的裝備現在都交給鐵匠打造了。\n鐵匠用素材點數打底裝，再把能力賦予上去——去找他吧。/g, '王國騎士團的裝備已經不外賣了。\n想變強的話，去鐵匠那裡把卡升級吧。'],
  [/北方的素材，我都打得出來。/g, '北方的素材，我都能拿來打磨卡牌。'],
  // 料理（卡牌版沒有素材點數）
  [/拿魚和素材點數（木料・藥材・魔素）去做菜/g, '拿魚和素材（木料・藥材・魔素類）去做菜'], [/（傷害、經驗值、會心、速度、回復……）/g, '（傷害、受傷減少、抽牌、能量、回復……）']);

// help pages drawn straight from the data: run them through the rules once
if (typeof GROW12 !== 'undefined') for (const q of GROW12) { q[1] = KD.fixTxt(q[1]); }
if (typeof BATTLE_HELP !== 'undefined') for (const p of BATTLE_HELP) p[1] = p[1].map(l => KD.fixTxt(l));

/* ---------- 素材・部位的說明 ---------- */
if (typeof MATCAT11 !== 'undefined') for (const k in MATCAT11) { const I = ITEMS[k], D = I && Object.getOwnPropertyDescriptor(I, 'd'); if (!D || !D.get) continue;
  Object.defineProperty(I, 'd', { configurable: true, enumerable: true, get() { const t = D.get.call(this); return KD.v14on() ? t.replace(/\n鐵匠「素材換點數」：(\S+) (\d+) 點/, '\n鐵匠：打造算「$1」$2 點；升級卡要 2 個').replace(/\n鐵匠「素材換點數」：[^\n]*/, '\n卡牌工坊：升級一張卡要 2 個') : t; }, set(v) { if (D.set) D.set.call(this, v); } }); }
for (const k in ITEMS) { if (!/^(pt_|pr_)/.test(k)) continue; const I = ITEMS[k], d0 = I.d;
  Object.defineProperty(I, 'd', { configurable: true, enumerable: true, get: () => (!KD.v14on() ? d0 : String(d0).replace(/用來升級「[^」]*」[^。]*。|把牠的晶石[^。]*。|把「[^」]*」升到[^。]*。/g, '卡牌工坊升級卡可以用（2 個）。')), set: () => {} }); }

/* ---------- 遭遇卡：不寫等級；掉落不寫晶石・經驗・書・MP 藥 ---------- */
for (const f of ['draw', 'drawC', 'drawR']) { const _f = Font[f]; Font[f] = function (x, s, ...a) { if (typeof s === 'string' && s.indexOf('Lv') >= 0 && KD.v14on()) s = s.replace(/^Lv\d+・/, '').replace(/　Lv\d+(?:[〜~]\d+)?　/g, '　'); return _f.call(this, x, s, ...a); }; }
if (typeof foeDropLines === 'function') { const _f = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _f(sp, key, kind); if (!KD.v14on()) return L;
    return L.filter(t => !/晶石|修練之書|秘傳之書|天賦之書|設計圖|打造券|裝備/.test(t)).map(t => t.replace(/經驗（頭目 ?30%）、|經驗、/g, '').replace(/或(特級|高級)?魔力藥水/g, '')); }; }

/* ---------- 魔物招式說明：降攻防＝虛弱・易傷 ---------- */
KD.moveTxt = d => String(d).replace(/降低對手的物攻和物防|降低物攻和物防/g, '讓對手虛弱、易傷').replace(/降低對手的物防和魔防|降低物防和魔防|降低對手的物防|降低對手的魔防/g, '讓對手易傷').replace(/降低對手的物攻和魔攻|降低物攻和魔攻|降低對手的物攻|降低對手的魔攻/g, '讓對手虛弱').replace(/必定降低物防/g, '一定讓對手易傷');
for (const id in MOVES) { const M = MOVES[id]; if (!M || !M.foe || typeof M.d !== 'string') continue; const d0 = M.d, d1 = KD.moveTxt(d0); if (d1 === d0) continue;
  Object.defineProperty(M, 'd', { configurable: true, enumerable: true, get: () => (KD.v14on() ? d1 : d0), set: () => {} }); const S = DEF.skills[id]; if (S && S.desc === d0) Object.defineProperty(S, 'desc', { configurable: true, enumerable: true, get: () => (KD.v14on() ? d1 : d0), set: () => {} }); }

/* ---------- 輸了以後的提示 ---------- */
{ const _c13 = craftHint13; craftHint13 = function (st = Game.st) { if (KD.v14on(st)) return null; return _c13.apply(this, arguments); }; }
{ const _c9 = craftHint9; craftHint9 = function (st = Game.st) { if (!KD.v14on(st)) return _c9.apply(this, arguments); const f = st.flags; f.k14LoseTip = (f.k14LoseTip || 0) + 1; if (f.k14LoseTip > 3) return null;
    return '（打不贏的時候：看魔物的弱點換武器、到鐵匠打造裝備或升級卡、到商店刪掉弱的卡。）'; }; }

/* ---------- 流浪魔劍士：卡牌版的職業只有四個 → 打贏後不問要不要轉職（試煉的卡由「流浪魔劍士」的試煉給） ---------- */
if (Events.eliteWin_rogueBlade) { const _rb = Events.eliteWin_rogueBlade; Events.eliteWin_rogueBlade = function* (ow) { if (!KD.v14on()) return yield* _rb.call(this, ow); const st = Game.st; st.flags.rogueMet = 1;
    yield* sayAll(['……好劍。', '你的劍裡，有魔力的流動。和我年輕的時候一樣。', '魔劍之道，就是讓劍與魔法合而為一。這三頁劍譜，就是它的全部。', '我已經老了。這條路，就交給你吧。']); st.flags.spellbladeOk = 1; }; }

/* ---------- 魔物群：連戰的每一場掉卡機率提高（原本是經驗值 +25%） ---------- */
{ const _wr = KD.wildRate; KD.wildRate = (cfg = {}, st = Game.st) => Math.min(0.8, _wr(cfg, st) + (cfg.pack ? 0.1 : 0)); }

/* ---------- 稱號「虹色傳說」：卡牌版拿不到虹色裝備 → 牌組裡升級過的卡 20 張 ---------- */
if (typeof TITLES !== 'undefined') { const T = TITLES.find(t => t.id === 'rainbow'); if (T) { const d0 = T.d, ok0 = T.ok;
    Object.defineProperty(T, 'd', { configurable: true, enumerable: true, get: () => (KD.v14on() ? '升級過的職業卡達到 20 張。' : d0), set: () => {} });
    T.ok = st => (st && st.k14 && !Game.noV14 ? KD.deck(st).filter(c => c.up).length >= 20 : ok0(st)); } }
if (typeof FAM_TRAIT_D14 !== 'undefined' && FAM_TRAIT_D14.beast) { const b0 = FAM_TRAIT_D14.beast; Object.defineProperty(FAM_TRAIT_D14, 'beast', { configurable: true, enumerable: true, get: () => (KD.v14on() ? '同伴倒下時，牠的攻擊變強（一場最多 2 次）' : b0), set: () => {} }); }
{ const _f = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _f(sp, key, kind); return KD.v14on() ? L.filter(t => !/^部位（破防時打）/.test(t)) : L; }; } // 卡牌戰鬥選目標只能選魔物本體
if (typeof GROW12 !== 'undefined') { const G = (n, t) => { const i = GROW12.findIndex(q => q[0] === n); if (i >= 0) GROW12[i][1] = t; else GROW12.push([n, t]); };
  G('果實', '卡牌版用不到果實和秘傳之書：果實會換成一次卡牌三選一（菁英等級），秘傳之書・重生之水・遺忘之書會換成一次免費升級。');
  G('料理', '萌芽鎮、王都、潮鳴港的旅店有廚師。拿魚和素材（木料・藥材・魔素類）去做菜，在野外吃了以後，接下來幾場戰鬥有加成（傷害、受傷減少、抽牌、能量、回復）。同時只能有一道菜。');
  const i = GROW12.findIndex(q => q[0] === '藏寶圖'); if (i >= 0) GROW12[i][1] = GROW12[i][1].replace('能挖到金錢、果實和秘傳之書。', '能挖到金錢和寶物。'); }
// 夥伴：卡牌戰鬥是一個人打（格倫・莉婭不會在戰鬥中出手）→ 不再說「會出手援護／趕來治療」
KD.TXT.push([/（菁英・頭目戰中，對手HP剩60%以下時，格倫會出手援護一次。）/g, ''], [/（菁英・頭目戰中，你的HP低於40%時，莉婭會趕來治療一次。）/g, '']);

/* ---------- 任務清單：說明和報酬也照卡牌版的規則寫 ---------- */
KD.TXT.push([/（）/g, ''], [/、力量\+1或秘傳之書/g, '、最大 HP +3 或秘傳之書'], [/秘傳之書(?!（|換成)/g, '秘傳之書（免費升級）'], [/（用魔法武器的話：被搶走的魔導書）/g, ''], [/ → 裂界看守人的飾品/g, ' → 換史詩卡・升級'],
  [/（這次是蓄力大招。看到「蓄力中」就[^）]*）/g, '（這次是蓄力大招。看到「蓄力中」就先把格擋疊高，或把牠的護盾打破來打斷蓄力。）'],
  [/（魔物的強力招式、等級差距或被降低的防禦都可能造成重擊。看到大招預告就先防禦。）/g, '（魔物的強力招式，或你身上有「易傷」時，都可能造成重擊。看到大招預告就先疊格擋。）'],
  [/（天氣祠的祝福）物攻和魔攻提升了！/g, '（天氣祠的祝福）卡牌傷害提高了！'], [/用物理攻擊或防禦吧。/g, '用物理攻擊或先疊格擋吧。'], [/集中精神！下一擊必定會心！/g, '集中精神了！']);
{ const _ql = questList; questList = function (...a) { const L = _ql.apply(this, a); if (!KD.v14on()) return L; return L.map(q => ({ ...q, n: KD.fixTxt(q.n), t: KD.fixTxt(q.t), rw: q.rw && KD.fixTxt(q.rw) })); }; }
if (typeof HEAVY_TIP !== 'undefined') for (const k in HEAVY_TIP) { const t0 = HEAVY_TIP[k]; Object.defineProperty(HEAVY_TIP, k, { configurable: true, enumerable: true, get: () => (KD.v14on() ? KD.fixTxt(t0) : t0), set: () => {} }); }
KD.TXT.push([/，你的第一擊必定會心）/g, '）'], [/先打倒牠，或是防禦）/g, '先打倒牠，或是先疊格擋）']);
