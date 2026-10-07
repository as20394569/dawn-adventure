/* ===================== v14.9 用玩家的角度試玩後的修正 =====================
   玩家：「用玩家的角度試玩並修正問題」→ 從新遊戲一路點畫面玩到第一章的菁英，記下看不懂、不合理、壞掉的地方。 */

/* ---------- 一般魔物一下的傷害差太多 ----------
   原本照 RPG 的公式換算：同一個地區，一下從標準的 0.5 倍到 5 倍（霜精的暴風雪 Lv29 一下 57、礦泥怪 31），魔法攻擊平均又比物理高 40%（換算用的魔防偏低）。
   卡牌戰鬥的 HP 小，一下 5 倍＝半條命。一般魔物（不含菁英・頭目，牠們各自調過）：先把魔法拉回物理的水準，再把「比標準高多少」壓扁（0.6 次方），最多 2 倍。 */
KD.WILD_POW = 0.6; KD.WILD_MAX = 2; KD.WILD_MIN = 0.4; KD.WILD_MAGIC = 1.3;
KD.isWild = u => !!u && !u.hero && !u.boss && !u.elite && !(u.data && u.data.elite);
{ const _d = BR.damage; BR.damage = function (core, src, tgt, skill, o = {}) {
    if (!KD.on(core) || !tgt || !tgt.hero || !KD.isWild(src)) return _d.call(this, core, src, tgt, skill, o);
    const H = tgt, wk = stkK(src, 'weak15') ? 0.75 : 1, vu = stkK(H, 'vuln15') ? 1.5 : 1, r = _d.call(this, core, src, tgt, skill, o); if (!r || !(r.amount > 0)) return r;
    const D = skill && (skill.power != null ? skill : DEF.skills[skill.id || skill]) || {}, per = KD.tab(KD.DMG_TGT, src.lv || 1) / KD.hitsN(D);
    const raw = r.amount / (wk * vu), k = (raw / per) / (D.cat === '特' ? KD.WILD_MAGIC : 1), k2 = Math.max(KD.WILD_MIN, Math.min(KD.WILD_MAX, Math.pow(Math.max(0.01, k), KD.WILD_POW)));
    return { ...r, amount: Math.max(1, Math.round(per * k2 * wk * vu)) }; }; }

/* ---------- 魔物降主角的速度・命中・迴避：卡牌戰鬥裡沒有作用（主角永遠先出牌）→ 改成虛弱 1 ---------- */
KD.DEAD_STAT = ['spe', 'acc', 'eva'];
{ const S = EFFECT_TYPES.stage, _x = S.exec; S.exec = function (core, ef, ctx, tg) {
    if (!KD.on(core) || !ef || !ef.stats || !(tg || []).some(t => t && t.hero)) return _x.call(this, core, ef, ctx, tg);
    const dead = Object.keys(ef.stats).filter(k => KD.DEAD_STAT.includes(k)); if (!dead.length) return _x.call(this, core, ef, ctx, tg);
    const rest = {}; for (const k in ef.stats) if (!KD.DEAD_STAT.includes(k)) rest[k] = ef.stats[k];
    const H = tg.filter(t => t && t.hero), O = tg.filter(t => t && !t.hero);
    if (Object.keys(rest).length) _x.call(this, core, { ...ef, stats: rest }, ctx, H); if (O.length) _x.call(this, core, ef, ctx, O);
    if (dead.some(k => ef.stats[k] < 0)) for (const h of H) KD.add(core, ctx.owner, h, 'weak15', 1); }; }

/* ---------- 慣性（RPG 的機制）：卡牌戰鬥裡不影響傷害，名牌左邊卻一直顯示「物 50%」→ 卡牌戰鬥不畫（數字照算也沒關係，傷害不看它） ---------- */
{ const _pb = Battle.prototype.drawPlateBig; Battle.prototype.drawPlateBig = function (x, F, a0) { const u = F && F.u, keep = u && u.data && u.data.in11; if (this.k14 && keep) delete u.data.in11; try { _pb.call(this, x, F, a0); } finally { if (keep) u.data.in11 = keep; } }; }

/* ---------- 圖鑑收集獎勵：天賦之書・果實在卡牌版用不到（拿到就被換成金幣）→ 50%・75%・100% 改成卡牌三選一 ---------- */
KD.DEX_CARD = [0.5, 0.75, 1];
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* (...a) { const st = Game.st, todo = [];
    if (this.k14 && st && typeof dexPct === 'function') { st.dexRw = st.dexRw || {}; const p = dexPct(st); for (const t of KD.DEX_CARD) if (p >= t && !st.dexRw[t]) { st.dexRw[t] = 1; todo.push(t); } }
    yield* _v.apply(this, a);
    for (const t of todo) { Sound.jingle('item'); yield* this.msg('圖鑑收集率達到' + Math.round(t * 100) + '%！得到卡牌獎勵！', { wait: true });
      yield* KD.pickFlow(KD.offer(KD.clsKey(st), 'boss'), '圖鑑 ' + Math.round(t * 100) + '% 的獎勵：選一張', { sub: '加入「' + KD.clsOf(st).n + '」的牌組' }); } }; }

/* ---------- 劇情的「體力永久+1」「力量永久+1」：卡牌版沒有能力值 → 最大 HP +3 ---------- */
KD.BOOST_HP = 3;
{ const _m = KD.maxHp; KD.maxHp = (st = Game.st) => { const b = (st && st.boost) || {}; return _m(st) + KD.BOOST_HP * ((b.vit || 0) + (b.str || 0)); }; }
KD.TXT.push([/體力永久\+1/g, '最大 HP 永久 +3'], [/力量永久\+1/g, '最大 HP 永久 +3'], [/、護身符和冒險者證/g, '和冒險者證'],
  [/我是鎮上的鐵匠。現在改做卡牌工坊：帶金幣和素材來，我幫你把卡升級！/g, '我是鎮上的鐵匠，也幫冒險者打磨卡牌：帶金幣和素材來，我幫你把卡升級！']);
// the battle start of an elite: it hasn't attacked yet
KD.TXT.push([/菁英魔物(.+?)發動了攻擊！/g, '菁英魔物$1出現了！'], [/攻擊前可以用左右選擇目標，範圍技能會打中全部。/g, '打單體的卡，出牌時再點要打的那一隻；全體卡打中全部。']);

/* ---------- 用不到的道具（天賦之書・果實…）：說出是什麼，換算改成「地區金幣 2 倍」（原本照 RPG 售價，一顆果實 1500 G＝好幾張卡） ---------- */
KD.junkGold = (st, q) => Math.max(50, Math.round(KD.gW(st.lv || 1) * 2 / 5) * 5) * (st.bag[q] || 0);
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st;
    if (!Game.noV14 && st && st.k14 && st.bag && !this.script && !UI.stack.length && !Game.trans) { const bad = Object.keys(st.bag).filter(q => ITEMS[q] && ['mp', 'boost', 'tp', 'reset'].includes(ITEMS[q].use) && st.bag[q] > 0);
      if (bad.length) { let g = 0; const nm = bad.map(q => ITEMS[q].n + (st.bag[q] > 1 ? '×' + st.bag[q] : '')); for (const q of bad) { g += KD.junkGold(st, q); delete st.bag[q]; } st.money += g;
        this.run((function* () { yield* say('（' + nm.join('、') + '在卡牌版用不到，換成了 ' + g + ' G。）'); })()); return; } }
    return _u.apply(this, a); }; }

/* ---------- 任務送的裝備（諾拉的緞帶…）有自己的任務卡：不要先被換成一般的卡牌獎勵（原本兩個都拿，訊息還說「換成了卡牌獎勵」） ---------- */
{ const qb = st => new Set((typeof KD.qPending === 'function' ? KD.qPending(st) : []).flatMap(q => q[1] || [])), _s = KD.sweep; KD.sweep = (st = Game.st) => { if (!st || !st.gear) return []; const Q = qb(st), hold = st.gear.filter(g => Q.has(g.b)); st.gear = st.gear.filter(g => !Q.has(g.b)); const out = _s(st); st.gear.push(...hold); return out; }; }

/* ---------- 菁英・頭目的遭遇卡：「記得防禦」→ 疊格擋；掉落第一行寫卡牌獎勵 ---------- */
for (const f of ['draw', 'drawC', 'drawR']) { const _f = Font[f]; Font[f] = function (x, s, ...a) { if (typeof s === 'string' && !Game.noV14) { if (s.indexOf('記得防禦') >= 0) s = s.replace('記得防禦', '先疊格擋'); if (/MP \d+\/\d+/.test(s) && Game.st && Game.st.k14) s = s.replace(/[\s　]*MP \d+\/\d+/, ''); } return _f.call(this, x, s, ...a); }; }
if (typeof foeDropLines === 'function') { const _f = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _f(sp, key, kind); if (Game.noV14) return L; return [kind === 'boss' ? '卡牌：三選一＋第一次的傳說卡' : '卡牌：打倒必得三選一'].concat(L); }; }

/* ---------- 飛禽「高飛」・水棲「潛水」：卡牌戰鬥裡牠們在你按「結束」後才起飛／潛水，效果在你的下一回合（原本寫「這回合」） ---------- */
if (MOVES.f14_fly) MOVES.f14_fly.d = '飛到高空：到牠下次行動前，物理攻擊容易落空；俯衝那一下 ×1.3。';
if (MOVES.f14_dive) MOVES.f14_dive.d = '潛進水裡：到牠下次行動前，單體攻擊只剩 40%；浮上來那一下 ×1.15。';
for (const id of ['f14_fly', 'f14_dive']) if (DEF.skills[id] && MOVES[id]) DEF.skills[id].desc = MOVES[id].d;
Object.assign(FAM_TRAIT_D14, { bird: '飛上天後到牠下次行動前，物理攻擊 40% 落空；俯衝那一下 ×1.3（頭上出現「高飛」時，這回合正好打牠）', aquatic: '潛水後到牠下次行動前，單體攻擊只剩 40%；浮上來那一下 ×1.15（頭上出現「潛水」時，這回合正好打牠）' });

/* ---------- 蓄力＋護盾：同一下連跳兩段幾乎一樣的教學 → 招式本身的提示已經講了「打破護盾」，就不再跳 ---------- */
{ const H = Battle.prototype.handlers, _c = H.CHARGE; H.CHARGE = function* (e, s, t, P) { const f = Game.st && Game.st.flags, w = P && DEF.skills[P.skill] && DEF.skills[P.skill].warn;
    if (this.k14 && f && !f.tutCharge11 && /護盾/.test(w || '')) f.tutCharge11 = 1; yield* _c.call(this, e, s, t, P); }; }

/* ---------- 卡面短字：「易傷 +2」看起來像給易傷 ---------- */
{ const fix = (id, f) => { const C = KD.CARDS[id]; if (C) { const _s = C.short; C.short = v => f(_s(v), v); } };
  fix('sw_flow', (L, v) => [L[0], '易傷時 +' + v.x]); fix('rg_rot', (L) => [L[0], String(L[1] || '').replace(/^中毒 ?\+/, '中毒時 +')]); }

/* ---------- 菁英的蓄力大招：頭上寫「蓄力 12」，實際打掉 60〜80% 最大 HP（磨石魔像 Lv8 一下 51） ----------
   RPG 時代的規則：菁英（和部分頭目招）的蓄力一擊按主角最大 HP 的比例算，選「防禦」只吃 30%。卡牌版沒有防禦指令，
   格擋又是在這條規則之前扣：格擋夠多就 0，少一點就 51，跟頭上的數字對不起來。
   卡牌戰鬥：照一般公式算（頭上的數字＝實際傷害，格擋照扣），菁英的蓄力 ×2、借來的最強招 ×2（約最大 HP 的 3 成，看得到、擋得掉）。 */
KD.CHG_ELITE = 2; KD.CHG_HUNT = 2;
{ const H = EFFECT_TYPES.hunt_hp; if (H) { const _x = H.exec; H.exec = function (core, ...a) { if (KD.on(core)) return; return _x.call(this, core, ...a); }; } }
{ const _d = BR.damage; BR.damage = function (core, src, tgt, skill, o = {}) { const r = _d.call(this, core, src, tgt, skill, o);
    if (!KD.on(core) || !r || !(r.amount > 0) || !tgt || !tgt.hero || !src || src.hero) return r; const D = skill && (skill.charge != null ? skill : DEF.skills[skill.id || skill]); if (!D || !D.charge) return r;
    const m = D.hunt11 ? KD.CHG_HUNT : (src.elite || (src.data && src.data.elite)) && !src.boss ? KD.CHG_ELITE : 1; return m !== 1 ? { ...r, amount: Math.max(1, Math.round(r.amount * m)) } : r; }; }

/* ---------- 遭遇卡的「危險度」：原本拿魔物等級比主角的隱藏等級（卡牌版看不到、也不代表強弱）→ 霜之女王只有兩顆星 ----------
   卡牌版：頭目五顆、菁英四顆，打倒過的少一顆（再戰牠的劇本都一樣，只是你知道打法了）。 */
{ const _ec = encounterCard; encounterCard = function (sp, lv, key, kind, extra) { if (Game.noV14) return _ec.apply(this, arguments);
    const st = Game.st, won = st && st.dex && st.dex[sp] && st.dex[sp].won > 0, n = (kind === 'boss' ? 5 : 4) - (won ? 1 : 0), _ds = dangerStars;
    dangerStars = () => n; try { return _ec.apply(this, arguments); } finally { dangerStars = _ds; } }; }
