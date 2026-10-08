/* ===================== v14.6 自己玩一輪後的修正 =====================
   玩家：「完成後自己跑一次，把不合理的都修改掉」。自動試玩（新遊戲 → 第三章前）看到的問題：
   · 文字還在講 RPG：「防禦」指令、會心、經驗值、晶石鑲嵌、練等刷裝備、技能冷卻和 MP、頭目「比你高 N 級」
   · 霜之女王的冰霜只能靠「防禦」或會心清掉、熔岩巨人的熔岩甲只有會心能打裂：卡牌戰鬥沒有防禦指令，只有劍士的劍意算會心
   · 強化魔物的【堅硬】（物防・魔防）和【飛快】（速度）在卡牌戰鬥完全沒有作用 */
KD.TXT.push(
  // 「防禦」 is not a command any more: 格擋 does that job
  [/選擇「防禦」能擋下七成傷害/g, '先把格擋疊高'], [/選「防禦」可以擋下七成傷害/g, '先把格擋疊高'], [/（⚠ 下一回合選「防禦」，傷害會減少七成！/g, '（⚠ 下一回合是重擊，先把格擋疊高！'],
  [/選擇「防禦」/g, '先疊格擋'], [/選「防禦」/g, '先疊格擋'], [/按「防禦」最划算/g, '多出格擋卡最划算'], [/按「防禦」/g, '出格擋卡'], [/先防禦！/g, '先疊格擋！'], [/……防禦！/g, '……先疊格擋！'],
  [/記得防禦/g, '記得疊格擋'], [/再防禦/g, '再疊格擋'], [/下一回合防禦/g, '下一回合疊格擋'], [/防禦架勢抖落了身上的冰霜！/g, '格擋抖落了身上的冰霜！'],
  [/防禦或打出會心可以清掉。/g, '獲得格擋或用火屬性攻擊可以清掉。'], [/：會心對護盾加倍。/g, '。'], [/（弱點・會心對護盾加倍）/g, ''], [/（會心也能削減護盾）/g, ''],
  [/（豐收之刻會無視「防禦」！用煙霧彈或提高閃避的技能躲開。）/g, '（豐收之刻是很重的一擊！牠蓄力的時候，先把格擋疊高。）'],
  [/打出會心就能讓熔岩甲裂開！/g, '水屬性的攻擊或劍意加倍的一擊，能讓熔岩甲裂開！'],
  // experience, gems and gear
  [/再戰會掉牠的部位素材，還有經驗和金錢。/g, '再戰會掉牠的部位素材和金錢，還能再選一張卡。'], [/（連續(\d+)場戰鬥，經驗值\+25%）/g, '（連續$1場戰鬥）'],
  [/部位素材可以把這隻魔物的晶石升級。/g, '部位素材可以拿去鐵匠的卡牌工坊升級卡。'], [/（晶石可以在鐵匠那裡鑲進裝備[^）]*）/g, '（菁英和頭目的部位素材，很適合拿去卡牌工坊升級卡。）'],
  [/打倒的話，經驗和金錢加倍，還會多掉素材，有時掉裝備。/g, '打倒的話，金錢加倍、多掉素材，還一定會掉卡。'],
  // a boss above your level: no levels on screen any more
  [/（(.+?) Lv\d+，比你高 \d+ 級，會很辛苦。\n?附近的洞窟是挑戰區，可以先去練等、刷裝備。還是要打嗎？）/g, '（$1看起來很強，會很辛苦。\n可以先去附近洞窟的挑戰區多拿幾張卡、把卡升級。還是要打嗎？）'],
  // the elder's first lessons
  [/狀態、技能編排、背包都在裡面/g, '狀態、牌組、背包都在裡面'], [/用過之後要「冷卻」幾次行動才能再用；冷卻的時候就用普通攻擊，不花MP，還會回復MP。/g, '每回合 3 能量、抽 5 張，出完牌按「結束」。']);
// battle lines that come from the core (EVT.MESSAGE) go through BPK.msg already; the warning that pops over a charging monster too
{ const _w = BPK.warnK; if (typeof _w === 'function') BPK.warnK = function (t, ...a) { return _w.call(this, KD.fixTxt(t), ...a); }; }
/* ---------- 霜之女王 / 熔岩巨人: the card game's answers ---------- */
COND.v14on = c => KD.on(c.core);
{ const _b = KD.block; KD.block = (core, u, n) => { _b(core, u, n); if (KD.on(core) && u && u.hero && u.data && u.data.frost12 && n > 0) EFFECT_TYPES.frost12.exec(core, { clear: 1, why: 'guard' }, { owner: u }, [u]); }; }
{ const M = DEF.mechanics.b12_frostQueen; if (M) { const _m = M.make; M.make = u => { const r = _m(u); (r.triggers = r.triggers || []).push(
    { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', element: '火', hasPower: 1, v14on: 1 }, limit: { perAction: 1 }, prio: 3, effects: [{ type: 'frost12', clear: 1, why: 'fire', target: 'all_enemies' }] }); return r; }; } }
{ const _x = EFFECT_TYPES.frost12.exec; EFFECT_TYPES.frost12.exec = function (core, ef, ctx, tg) { if (ef && ef.why === 'fire' && KD.on(core)) { for (const t of tg || []) if (t && t.hero && t.data.frost12) { t.data.frost12 = 0; core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { key: null, text: '火焰融化了身上的冰霜！' } }); } return; } return _x.call(this, core, ef, ctx, tg); }; }
{ const M = DEF.mechanics.b12_lavaGiant; if (M) { const _m = M.make; M.make = u => { const r = _m(u); (r.triggers = r.triggers || []).push(
    { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', element: '水', hasPower: 1, ownerAlive: 1, v14on: 1 }, limit: { perAction: 1 }, prio: 3,
      effects: [{ type: 'status', status: 'cooled12', target: 'self', dur: 3 }, { type: 'message', target: 'self', text: '水打在熔岩甲上，冒出大量蒸氣——熔岩甲裂開了！' }] }); return r; }; } }
/* ---------- 強化魔物：【堅硬】受到的傷害 −30%，【飛快】每回合開始獲得格擋（最大 HP 的 12%） ---------- */
if (typeof CHAMP12 !== 'undefined') { CHAMP12.hard.d = '受到的傷害 −30%'; CHAMP12.swift.d = '動作很快：每回合獲得格擋'; CHAMP12.rage.d = '攻擊 +30%；HP 一半以下再 +20%'; CHAMP12.thorn.d = '被物理攻擊打中時 30% 反擊'; }
{ const _h = KD.hit; KD.hit = function (core, a, t, base, o = {}) { if (t && t.data && t.data.champ12 === 'hard' && a && a.hero) o = { ...o, mul: (o.mul || 1) * 0.7 }; return _h.call(this, core, a, t, base, o); }; }
{ const _st = BPK.startTurnK; BPK.startTurnK = function () { _st.call(this); const core = this.core; for (const f of core.alive('B')) if (f.data && f.data.champ12 === 'swift') KD.block(core, f, Math.max(3, Math.round(f.max.hp * 0.12))); this.syncK(); }; }
/* ---------- more old wording (rewards, the smith, the inn) ---------- */
// 天賦之書 turns into gold (用不到的道具): the line that hands it over must not read 「得到了！」 after the old rule takes the word out
KD.TXT.unshift([/得到了天賦之書(?:×\d+)?！強化費用永久半價！/g, '以後升級卡的費用永久半價！'], [/得到了天賦之書(?:×\d+)?！/g, '得到了一份謝禮！'], [/和天賦之書(?:×\d+)?/g, ''],
  [/這是師父留下的天賦之書，送給你吧。以後強化的費用，我只收一半！/g, '這是師父留下的一點心意，送給你吧。以後升級卡的費用，我只收一半！']);
KD.TXT.push([/以後帶素材來，峽谷和沼澤的裝備我都能打了。/g, '以後帶素材來，我幫你把卡升級。'], [/可以在背包裡裝備。/g, ''], [/恢復HP、MP並記錄/g, '恢復HP並記錄'],
  [/名匠遺作（魔導士：名匠遺杖）或 強化費用永久半價/g, '任務卡「名匠遺作」或 卡牌升級永久半價'], [/強化費用永久半價/g, '卡牌升級永久半價']);
// the smith kept his master's last work: card upgrades at half price (the RPG gave half-price 強化)
{ const _up = KD.upPrice; KD.upPrice = (st = Game.st) => { const p = _up(st); return st && st.flags && st.flags.q3res === 'keep' ? Math.max(5, Math.round(p / 10) * 5) : p; }; }
/* ---------- 頭目・菁英的強度（自動試玩：會挑卡、升級的牌組，Lv30 以後的頭目幾乎打不到主角） ----------
   卡牌的數字不會隨等級變大，但牌組會越來越強：頭目和菁英的 HP、傷害在 Lv20 以後隨地區等級往上加。
   另外拿掉 RPG 時代為了「防禦指令・會心」調低的數字（熔岩巨人、魔人維克托），卡牌戰鬥裡他們的機制沒有那麼難。 */
// per boss: bring each one's ordinary blow near the same curve (about 14 at Lv18 → 21 at Lv43); RPG-era tunes made 霜之女王 (×1.25) and 影將 hit 2〜3× harder than the rest, 九頭蛇・溝鼠王 far softer
KD.BOSS14 = { banditBoss: { dmg: 0.82 }, crystalGolem: { dmg: 1.13 }, silverWyrm: { dmg: 1.35 }, hydra: { dmg: 1.5 }, ratKing: { dmg: 1.3 }, harvestGolem: { dmg: 1.38 },
  frostQueen: { hp: 0.85, dmg: 0.42 }, lavaGiant: { hp: 1.1, dmg: 1.0 }, victorDemon: { hp: 1.0, dmg: 1.5 }, shadowGeneral: { dmg: 0.62 } };
KD.bossK = (u) => { const lv = u.lv || 1, T = KD.BOSS14[u.sp || (u.data && u.data.sp)] || {};
  if (u.boss) return { hp: (1.1 + Math.max(0, lv - 20) * 0.018) * (T.hp || 1), dmg: (1.1 + Math.max(0, lv - 15) * 0.025) * (T.dmg || 1) };
  if (u.elite || (u.data && u.data.elite)) return { hp: 1 + Math.max(0, lv - 20) * 0.012, dmg: 1 + Math.max(0, lv - 15) * 0.02 }; return null; };
{ const _sc = KD.scale; KD.scale = (core, u) => { const first = u && u.side === 'B' && !(u.data && u.data.k14s); _sc(core, u); if (!first) return; const k = KD.bossK(u); if (!k || k.hp === 1) return;
    const r = u.res.hp / Math.max(1, u.max.hp); u.max.hp = Math.max(1, Math.round(u.max.hp * k.hp)); u.res.hp = Math.max(1, Math.round(u.max.hp * r)); }; }
// 蓄力大招: kept at full strength — with each boss's ordinary blow evened out (KD.BOSS14) the released one is about 1.5〜2× that, the biggest hit of the fight
KD.CHG14 = 1;
{ const _d = BR.damage; BR.damage = function (core, src, tgt, skill, o = {}) { const r = _d.call(this, core, src, tgt, skill, o); if (!KD.on(core) || !tgt || !tgt.hero || !src || src.hero || !r) return r; const k = KD.bossK(src), D = skill && (skill.charge != null ? skill : DEF.skills[skill.id || skill]);
    const m = (k ? k.dmg : 1) * (D && D.charge ? KD.CHG14 : 1); return m !== 1 ? { ...r, amount: Math.max(1, Math.round(r.amount * m)) } : r; }; }
/* ---------- 魔人維克托：模仿你上一回合最強的那張攻擊卡（×0.8）；頭上的意圖會顯示數字 ----------
   RPG 的模仿看的是技能 id（o_／u_ 開頭），卡牌的技能是 k14_ 開頭，所以卡牌戰鬥裡他從來不模仿。 */
{ const T = DEF.skills.m_demonClaw || DEF.skills.attack;
  defPut('effects', 'mimic14_e', { type: 'mimic14', target: 'target' });
  defPut('skills', 'm_mimic14', { ...T, id: 'm_mimic14', name: '模仿', desc: '', power: 1, target: 'enemy', noHitRoll: true, hits: null, charge: false, costs: [], cooldown: 0, prio: 0, effects: ['mimic14_e'], after: [], mods: [], tags: ['skill', 'monster_skill', 'phys'], override: true });
  EFFECT_TYPES.mimic14 = { exec(core, ef, ctx, tg) { const u = ctx && ctx.owner, n = core.data.mimicN14 || 0; for (const t of tg || []) if (t && t.hero && core.isUp(t) && n > 0) core.dealDamage(u, t, n, { kind: 'hit', skill: 'm_mimic14', el: '一般', cat: '物', tags: ['mimic14'] }); } }; }
{ const _rc = BPK.runCard; BPK.runCard = function (c, ctx) { const r = _rc.call(this, c, ctx), C = KD.CARDS[c.id]; if (C && C.type === 'atk' && this.dealt > ((this.turnBest14 && this.turnBest14.dealt) || 0)) this.turnBest14 = { name: KD.name(c), dealt: this.dealt }; return r; };
  const _et = BPK.endTurnK; BPK.endTurnK = function (...a) { this.core.data.heroBest14 = this.turnBest14 || null; this.turnBest14 = null; return _et.apply(this, a); }; }
{ const _v = B12_SCRIPT.victorDemon; B12_SCRIPT.victorDemon = function (core, u) { if (!KD.on(core)) return _v(core, u); const B = core.data.heroBest14, t = core.units.find(q => q.hero && !q.down);
    if (B && B.dealt >= 6 && t && u.data.mimicR14 !== core.round - 1 && core.rng.chance(0.75)) { u.data.mimicR14 = core.round; core.data.mimicN14 = Math.max(1, Math.round(B.dealt * 0.8));
      b12Say(core, u, '魔人維克托冷笑著，擺出了跟你一樣的架勢……（他要模仿「' + B.name + '」！）'); return { type: 'skill', skill: 'm_mimic14', targets: [t.id] }; }
    return null; }; }
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { if (cmd && cmd.skill === 'm_mimic14' && core && core.data) { const n = core.data.mimicN14 || 0, H = core.byId.H; return { k: H && n >= H.max.hp * 0.25 ? 'heavy' : 'atk', t: String(n) }; } return _io(core, u, cmd); }; }
/* ---------- 蓄力中的魔物：頭上也顯示這一擊的預估傷害（原本只寫「蓄力中」，卡牌戰鬥要知道該疊多少格擋） ---------- */
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); const core = this.core; if (!this.k14 || !core || (typeof FXT13 !== 'undefined' && FXT13.on)) return; const H = core.byId.H; if (!H) return;
    for (const v of this.foes()) { const u = core.byId[v.id]; if (!u || v.gone || v.alpha < 0.5 || !v.st.charging) continue; const S = (u.statuses || []).find(s => s.id === 'charging'), D = S && S.data && DEF.skills[S.data.skill]; if (!D || !D.power) continue;
      let n = 0; try { const hits = D.hits ? Math.round((D.hits[0] + D.hits[1]) / 2) : 1; n = BR.damage(core, u, H, D, { preview: true, noCrit: true }).amount * hits; } catch (e) { continue; } if (!n) continue;
      const iw = 11, h0 = KD.hitsN ? KD.hitsN(D) : 1, t = '蓄力 ' + (h0 > 1 ? Math.round(n / h0) + '×' + h0 : n), img = INT_PX14.heavy || INT_PX14.atk, col = INT_COL14.heavy, w = 9 + 2 + Math.ceil(Font.width(t, 7)) + 3, X = Math.round(clamp(v.x + v.off.x - w / 2, 17, W - w - 2)), Y = Math.round(v.foot - v.bbh - 15 + v.sink * (v.sink < 0 ? 1 : 0)); // v14.21: the same size as the other intents
      KD.pan(x, X - 2, Y, w + 4, 11, '#ff9a40'); if (img) { x.imageSmoothingEnabled = false; x.drawImage(img, X, Y + 1, 9, 9); } Font.draw(x, t, X + 11, Y + 5 - 8, col, UIC.textSh, 7); } }; }
/* ---------- 影將的反擊架勢、銀鱗水龍的逆鱗：卡牌戰鬥裡每張卡都是一次行動，原本「每次行動反擊一次」會變成每張攻擊卡都被反擊 → 每回合最多反擊一次 ---------- */
{ const C = EFFECT_TYPES.counter; if (C) { const _x = C.exec; C.exec = function (core, ef, ctx, ...a) { const u = ctx && ctx.owner;
    if (KD.on(core) && u && ef && (ef.why === 'stance12' || ef.why === 'scale12')) { if (u.data.cnt14 === core.round) return; u.data.cnt14 = core.round; } return _x.call(this, core, ef, ctx, ...a); }; } }
