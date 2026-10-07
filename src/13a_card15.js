/* ===================== 卡牌 Roguelike 試玩版（v13.0 demo） =====================
   RPG 版封存在 git 標籤 rpg-final-v12.85。這個檔案只在 window.CARD_DEMO 時接管遊戲（試玩版的網頁會設定），RPG 版照舊。
   戰鬥沿用 BV2 核心和戰鬥畫面（魔物圖、特效、跳字、魔物下一步），卡牌的數值是固定值（不用 RPG 的攻防公式）：
   · 每回合 3 能量、抽 5 張；格擋擋傷害，自己的回合開始時消失；魔物的格擋在牠行動前消失
   · 劍意：每打出一張攻擊牌 +1；滿 3 層時下一張攻擊牌傷害 ×2，然後歸零
   · 破防：受到傷害 +50%；虛弱：造成傷害 −25%（兩者每回合結束 −1）；流血：回合結束失去 N HP，然後 N−1；力量：每段傷害 +N */
const C15 = { HP: 70, EN: 3, DRAW: 5, HAND_MAX: 10 };
EVT.CARD15 = 'CARD15'; EVT_SET.add('CARD15');
for (const k of ['card15', 'card15end', 'mon15']) EFFECT_TYPES[k] = EFFECT_TYPES[k] || { exec() {} }; // filled in below (registered first so the effect table accepts them)
const c15On = core => !!(core && core.data && (core.data.card15 || core.data.v14));
/* ---------- statuses ---------- */
defPut('statuses', 'blk15', { tags: ['buff'], duration: 'battle', stack: 'add', max: 999, metadata: { n: '格擋' } });
defPut('statuses', 'str15', { tags: ['buff'], duration: 'battle', stack: 'add', max: 99, metadata: { n: '力量' } });
defPut('statuses', 'weak15', { tags: ['debuff'], duration: 'battle', stack: 'add', max: 99, metadata: { n: '虛弱' } });
defPut('statuses', 'vuln15', { tags: ['debuff'], duration: 'battle', stack: 'add', max: 99, metadata: { n: '破防' } });
defPut('statuses', 'bleed15', { tags: ['debuff'], duration: 'battle', stack: 'add', max: 99, metadata: { n: '流血' } });
defPut('statuses', 'chg15', { tags: ['buff'], duration: 'battle', stack: 'none', metadata: { n: '蓄力' } });
for (const [k, n] of [['pwCtr15', '格擋反擊'], ['pwGuard15', '迎擊架勢'], ['pwMaster15', '劍聖之心']]) defPut('statuses', k, { tags: ['buff'], duration: 'battle', stack: 'add', max: 99, metadata: { n } });
if (typeof BUFF12 !== 'undefined') Object.assign(BUFF12, { blk15: { n: '格擋', k: 'def', tip: '擋下傷害', stacks: 1 }, str15: { n: '力量', k: 'atk', tip: '每段傷害增加', stacks: 1 },
  weak15: { n: '虛弱', k: 'deb', tip: '造成傷害 −25%', stacks: 1 }, vuln15: { n: '破防', k: 'deb', tip: '受到傷害 +50%', stacks: 1 }, bleed15: { n: '流血', k: 'deb', tip: '回合結束扣血', stacks: 1 },
  chg15: { n: '蓄力', k: 'atk', tip: '下回合大招' }, pwCtr15: { n: '格擋反擊', k: 'ctr', tip: '擋下攻擊就反擊' }, pwGuard15: { n: '迎擊架勢', k: 'def', tip: '每回合得到格擋' }, pwMaster15: { n: '劍聖之心', k: 'atk', tip: '三張攻擊：抽牌＋能量' } });
const stk15 = (u, id) => { const s = u && u.statuses.find(q => q.id === id); return s ? s.stacks : 0; };
function setStk15(core, u, id, n) { const s = u.statuses.find(q => q.id === id); if (n <= 0) { if (s) core.removeStatus(u, id, 'expire'); return; } if (s) s.stacks = n; else core.applyStatus(u, u, id, { delta: n, quiet: true }); }
// damage numbers: base + 力量, 虛弱 ×0.75, 破防 ×1.5
function dmg15(a, t, base, mul = 1) { let d = base + stk15(a, 'str15'); if (stk15(a, 'weak15')) d *= 0.75; if (t && stk15(t, 'vuln15')) d *= 1.5; return Math.max(0, Math.floor(d * mul)); }
function hit15(core, a, t, base, o = {}) { if (!core.isUp(t) || !core.isUp(a)) return 0; const sk = core.data.skill15 || null;
  core.emit(EVT.HIT, { src: a, tgts: [t], payload: { skill: sk, hitIndex: o.i || 0, hits: o.n || 1 } });
  const e = core.dealDamage(a, t, dmg15(a, t, base, (o.mul || 1) * (a.hero && core.data.si2 ? 2 : 1)), { kind: 'hit', skill: sk, n: o.i || 0, min: 0, crit: !!(a.hero && core.data.si2) });
  return e && !e.cancelled ? e.payload.amount || 0 : 0; }
function block15(core, u, n) { if (n > 0 && core.isUp(u)) core.applyStatus(u, u, 'blk15', { delta: n }); }
// 格擋 absorbs hits (not bleeding); a fully blocked hit can be answered by 格擋反擊
{ const _dd = BattleCore.prototype.dealDamage; BattleCore.prototype.dealDamage = function (src, tgt, amount, info = {}) {
    if (!c15On(this) || !tgt || info.kind !== 'hit') return _dd.call(this, src, tgt, amount, info);
    let a = Math.max(0, Math.floor(amount)); const b = stk15(tgt, 'blk15');
    if (b > 0 && a > 0) { const ab = Math.min(b, a); a -= ab; setStk15(this, tgt, 'blk15', b - ab); this.emit(EVT.CARD15, { src, tgts: [tgt], payload: { k: 'block', n: ab } });
      if (!a && tgt.hero && src && !src.hero && stk15(tgt, 'pwCtr15') && this.isUp(src)) { this.emit(EVT.CARD15, { src: tgt, tgts: [src], payload: { k: 'counter' } }); _dd.call(this, tgt, src, stk15(tgt, 'pwCtr15'), { kind: 'counter', min: 1 }); } }
    if (tgt.data.chgHit15 != null && stk15(tgt, 'chg15')) { tgt.data.chgHit15 += a; if (tgt.data.chgHit15 >= (tgt.data.chgNeed15 || 20)) { this.removeStatus(tgt, 'chg15', 'break'); this.emit(EVT.CARD15, { src, tgts: [tgt], payload: { k: 'break' } }); } }
    if (!a) return null; return _dd.call(this, src, tgt, a, { ...info, min: 0 }); }; }
// a monster's 格擋 goes away when it acts; the end of the round: bleeding, then 破防／虛弱 −1
{ const _ex = BattleCore.prototype.execute; BattleCore.prototype.execute = function (cmd) { if (c15On(this)) { const u = this.byId[cmd.actor]; if (u && !u.hero && stk15(u, 'blk15')) this.removeStatus(u, 'blk15', 'expire'); } return _ex.call(this, cmd); }; }
{ const _re = BattleCore.prototype.roundEnd; BattleCore.prototype.roundEnd = function () { if (c15On(this)) for (const u of this.units) { if (!this.isUp(u)) continue;
      const bl = stk15(u, 'bleed15'); if (bl) { this.dealDamage(null, u, bl, { kind: 'dot', cat: 'fixed', min: 1 }); if (this.isUp(u)) setStk15(this, u, 'bleed15', bl - 1); }
      for (const k of ['vuln15', 'weak15']) { const n = stk15(u, k); if (n) setStk15(this, u, k, n - 1); } }
    return _re.call(this); }; }

/* ---------- 劍士的卡 ---------- [名字, 種類, 稀有度, 費用, 特效, 目標, 數值, 升級數值, 說明, 手牌上的短字, 效果] */
const CARD15 = {};
function card15(id, n, type, rar, cost, fx, tg, b, u, desc, short, run, o = {}) { CARD15[id] = { id, n, type, rar, cost, fx, tg, b, u, desc, short, run, ...o }; }
const A15 = (cb, core, tg, v, n = 1, o = {}) => { let tot = 0; for (let i = 0; i < n; i++) for (const t of (tg.length ? tg : core.foesOf(cb.Hu())).slice()) tot += hit15(core, cb.Hu(), t, v, { i, n, ...o }); return tot; };
const ALL15 = (cb, core) => core.foesOf(cb.Hu()).slice();
card15('strike', '斬擊', 'atk', 'start', 1, 'slash', 'enemy', { d: 6 }, { d: 9 }, v => '造成 ' + v.d + ' 傷害。', v => ['傷害 ' + v.d], (cb, core, tg, v) => A15(cb, core, tg, v.d));
card15('defend', '防禦', 'skl', 'start', 1, 't11_osHold', 'self', { b: 5 }, { b: 8 }, v => '獲得 ' + v.b + ' 格擋。', v => ['格擋 ' + v.b], (cb, core, tg, v) => block15(core, cb.Hu(), v.b));
card15('break', '斷甲斬', 'atk', 'start', 2, 't11_sdBreak', 'enemy', { d: 8, x: 2 }, { d: 10, x: 3 }, v => '造成 ' + v.d + ' 傷害，破防 ' + v.x + '。', v => ['傷害 ' + v.d, '破防 ' + v.x], (cb, core, tg, v) => { A15(cb, core, tg, v.d); for (const t of tg) core.applyStatus(cb.Hu(), t, 'vuln15', { delta: v.x }); });
card15('twin', '疾風二連', 'atk', 'C', 1, 't11_sdTwin', 'enemy', { d: 3 }, { d: 4 }, v => '造成 ' + v.d + ' 傷害 2 次。', v => [v.d + ' ×2'], (cb, core, tg, v) => A15(cb, core, tg, v.d, 2));
card15('gap', '破綻突', 'atk', 'C', 1, 't11_sdGap', 'enemy', { d: 7 }, { d: 9 }, v => '造成 ' + v.d + ' 傷害；對破防的敵人傷害加倍。', v => ['傷害 ' + v.d, '破防加倍'], (cb, core, tg, v) => A15(cb, core, tg, v.d, 1, { mul: tg[0] && stk15(tg[0], 'vuln15') ? 2 : 1 }));
card15('whirl', '旋刃', 'atk', 'C', 1, 't11_sdWhirl', 'all', { d: 5 }, { d: 7 }, v => '對全體造成 ' + v.d + ' 傷害。', v => ['全體 ' + v.d], (cb, core, tg, v) => A15(cb, core, ALL15(cb, core), v.d));
card15('bash', '盾撞', 'atk', 'C', 1, 't11_osBash', 'enemy', { d: 5, b: 5 }, { d: 7, b: 7 }, v => '造成 ' + v.d + ' 傷害，獲得 ' + v.b + ' 格擋。', v => ['傷害 ' + v.d, '格擋 ' + v.b], (cb, core, tg, v) => { A15(cb, core, tg, v.d); block15(core, cb.Hu(), v.b); });
card15('hold', '堅守', 'skl', 'C', 1, 't11_osHold', 'self', { b: 8 }, { b: 11 }, v => '獲得 ' + v.b + ' 格擋；下回合多抽 1 張。', v => ['格擋 ' + v.b, '下回合抽1'], (cb, core, tg, v) => { block15(core, cb.Hu(), v.b); cb.nextDraw++; });
card15('stance', '架勢', 'skl', 'C', 1, 't11_osCounter', 'self', { b: 7 }, { b: 10 }, v => '獲得 ' + v.b + ' 格擋，劍意 +1。', v => ['格擋 ' + v.b, '劍意 +1'], (cb, core, tg, v) => { block15(core, cb.Hu(), v.b); cb.addSi(1); });
card15('qi', '劍氣', 'atk', 'C', 0, 'slash', 'enemy', { d: 3 }, { d: 5 }, v => '造成 ' + v.d + ' 傷害。', v => ['傷害 ' + v.d], (cb, core, tg, v) => A15(cb, core, tg, v.d));
card15('breath', '調息', 'skl', 'C', 0, 't11_sdEye', 'self', { c: 1 }, { c: 2 }, v => '抽 ' + v.c + ' 張，劍意 +1。', v => ['抽 ' + v.c, '劍意 +1'], (cb, core, tg, v) => { cb.drawN(v.c); cb.addSi(1); });
card15('moon', '雙月斬', 'atk', 'C', 1, 't11_dsMoon', 'enemy', { d: 4, x: 1 }, { d: 5, x: 2 }, v => '造成 ' + v.d + ' 傷害 2 次，每次流血 ' + v.x + '。', v => [v.d + ' ×2', '流血 ' + v.x + '×2'], (cb, core, tg, v) => { for (let i = 0; i < 2; i++) { A15(cb, core, tg, v.d, 1, { i, n: 2 }); for (const t of tg) if (core.isUp(t)) core.applyStatus(cb.Hu(), t, 'bleed15', { delta: v.x }); } });
card15('eye', '心眼', 'skl', 'C', 0, 't11_sdEye', 'self', { x: 2 }, { x: 3 }, v => '劍意 +' + v.x + '。消耗。', v => ['劍意 +' + v.x, '消耗'], (cb, core, tg, v) => cb.addSi(v.x), { exhaust: 1 });
card15('cleave', '斬鐵', 'atk', 'C', 2, 't11_zjSwallow', 'enemy', { d: 14 }, { d: 18 }, v => '造成 ' + v.d + ' 傷害。', v => ['傷害 ' + v.d], (cb, core, tg, v) => A15(cb, core, tg, v.d));
card15('shield', '舉盾', 'skl', 'C', 2, 't11_osHold', 'self', { b: 12 }, { b: 16 }, v => '獲得 ' + v.b + ' 格擋。', v => ['格擋 ' + v.b], (cb, core, tg, v) => block15(core, cb.Hu(), v.b));
card15('flow', '流光連斬', 'atk', 'U', 2, 't11_sdFlow', 'enemy', { d: 2, x: 2 }, { d: 3, x: 3 }, v => '造成 ' + v.d + ' 傷害 5 次；對流血的敵人每次 +' + v.x + '。', v => [v.d + ' ×5', '流血 +' + v.x], (cb, core, tg, v) => { for (let i = 0; i < 5; i++) for (const t of tg) A15(cb, core, [t], v.d + (stk15(t, 'bleed15') ? v.x : 0), 1, { i, n: 5 }); });
card15('frenzy', '狂刃', 'pow', 'U', 1, 't11_sdFrenzy', 'self', { x: 2 }, { x: 3 }, v => '能力：力量 +' + v.x + '。', v => ['力量 +' + v.x], (cb, core, tg, v) => core.applyStatus(cb.Hu(), cb.Hu(), 'str15', { delta: v.x }));
card15('counter', '格擋反擊', 'pow', 'U', 1, 't11_osCounter', 'self', { x: 5 }, { x: 7 }, v => '能力：格擋完全擋下攻擊時，反擊 ' + v.x + ' 傷害。', v => ['擋下反擊', v.x + ''], (cb, core, tg, v) => core.applyStatus(cb.Hu(), cb.Hu(), 'pwCtr15', { delta: v.x }));
card15('wind', '劍風', 'atk', 'U', 1, 'sp11_10_1', 'all', { d: 4, x: 1 }, { d: 6, x: 2 }, v => '對全體造成 ' + v.d + ' 傷害，虛弱 ' + v.x + '。', v => ['全體 ' + v.d, '虛弱 ' + v.x], (cb, core, tg, v) => { const L = ALL15(cb, core); A15(cb, core, L, v.d); for (const t of L) if (core.isUp(t)) core.applyStatus(cb.Hu(), t, 'weak15', { delta: v.x }); });
card15('wall', '鐵壁衝陣', 'atk', 'U', 2, 't11_ogShield', 'all', { d: 8, b: 8 }, { d: 11, b: 11 }, v => '對全體造成 ' + v.d + ' 傷害，獲得 ' + v.b + ' 格擋。', v => ['全體 ' + v.d, '格擋 ' + v.b], (cb, core, tg, v) => { A15(cb, core, ALL15(cb, core), v.d); block15(core, cb.Hu(), v.b); });
card15('dawn', '晨曦之刃', 'atk', 'U', 2, 't11_cmDawn', 'enemy', { d: 12 }, { d: 16 }, v => '造成 ' + v.d + ' 傷害，回復傷害的 30% HP。', v => ['傷害 ' + v.d, '吸血30%'], (cb, core, tg, v) => { const t = A15(cb, core, tg, v.d), h = Math.floor(t * 0.3); if (h > 0) core.heal(cb.Hu(), cb.Hu(), h, {}); });
card15('guard', '迎擊架勢', 'pow', 'U', 1, 't11_osHold', 'self', { x: 3 }, { x: 5 }, v => '能力：每回合開始獲得 ' + v.x + ' 格擋。', v => ['每回合', '格擋 ' + v.x], (cb, core, tg, v) => core.applyStatus(cb.Hu(), cb.Hu(), 'pwGuard15', { delta: v.x }));
card15('star', '雙星十字', 'atk', 'U', 1, 't11_dsStar', 'enemy', { d: 6 }, { d: 8 }, v => '造成 ' + v.d + ' 傷害；敵人破防時再打一次。', v => ['傷害 ' + v.d, '破防再一次'], (cb, core, tg, v) => { A15(cb, core, tg, v.d); if (tg[0] && core.isUp(tg[0]) && stk15(tg[0], 'vuln15')) A15(cb, core, tg, v.d, 1, { i: 1, n: 2 }); });
card15('sky', '一刀天斷', 'atk', 'R', 3, 't11_zjSky', 'enemy', { d: 32 }, { d: 42 }, v => '造成 ' + v.d + ' 傷害。', v => ['傷害 ' + v.d], (cb, core, tg, v) => A15(cb, core, tg, v.d));
card15('meteor', '崩星劍', 'atk', 'R', 2, 't11_sdMeteor', 'enemy', { d: 24 }, { d: 30 }, v => '造成 ' + v.d + ' 傷害；對破防的敵人 ×1.5。消耗。', v => ['傷害 ' + v.d, '消耗'], (cb, core, tg, v) => A15(cb, core, tg, v.d, 1, { mul: tg[0] && stk15(tg[0], 'vuln15') ? 1.5 : 1 }), { exhaust: 1 });
card15('thousand', '破曉千斬', 'atk', 'R', 3, 't11_ogSword', 'enemy', { d: 4 }, { d: 5 }, v => '造成 ' + v.d + ' 傷害 6 次，之後劍意直接滿。', v => [v.d + ' ×6', '劍意全滿'], (cb, core, tg, v) => { A15(cb, core, tg, v.d, 6); cb.fillSi = 1; });
card15('master', '劍聖之心', 'pow', 'R', 2, 't11_dsDance', 'self', { x: 1 }, { x: 1 }, v => '能力：每打出 3 張攻擊牌，抽 1 張、能量 +1。', v => ['攻擊3張', '抽1・能量1'], (cb, core, tg, v) => core.applyStatus(cb.Hu(), cb.Hu(), 'pwMaster15', { delta: 1 }), { upCost: 1 });
const CARD_POOL15 = Object.keys(CARD15).filter(k => CARD15[k].rar !== 'start');
const cardCost15 = c => (c.up && CARD15[c.id].upCost != null ? CARD15[c.id].upCost : CARD15[c.id].cost);
const cardVal15 = c => (c.up ? CARD15[c.id].u : CARD15[c.id].b);
const cardName15 = c => CARD15[c.id].n + (c.up ? '+' : '');
// one battle skill per card (the battle screen plays its FX and the core runs the card)
for (const id in CARD15) { const C = CARD15[id], T = DEF.skills.t_sdBreak;
  defPut('skills', 'c15_' + id, { ...T, id: 'c15_' + id, name: C.n, desc: '', power: 0, target: C.tg === 'all' ? 'all_enemies' : C.tg, noHitRoll: true, costs: [], cooldown: 0, hits: null, charge: false, prio: 0,
    effects: ['card15_play'], after: [], mods: [], fx: C.fx, tags: ['skill', C.type === 'atk' ? 'phys' : 'support'], metadata: { card15: id }, override: true }); }
defPut('skills', 'c15_end', { ...DEF.skills.t_sdBreak, id: 'c15_end', name: '結束回合', desc: '', power: 0, target: 'self', noHitRoll: true, costs: [], cooldown: 0, hits: null, charge: false, effects: ['card15_end'], after: [], mods: [], fx: null, tags: ['skill', 'support'], metadata: {}, override: true });
defPut('effects', 'card15_play', { type: 'card15' }); defPut('effects', 'card15_end', { type: 'card15end' });
EFFECT_TYPES.card15 = { exec(core, ef, ctx) { const cb = core.data.cb, c = core.data.cardNow; if (!cb || !c) return; const C = CARD15[c.id], tg = (ctx.targets || []).filter(t => core.isUp(t));
    core.data.skill15 = 'c15_' + c.id; core.data.si2 = C.type === 'atk' && cb.si >= 3;
    C.run(cb, core, tg, cardVal15(c));
    if (C.type === 'atk') { if (core.data.si2) cb.si = 0; else cb.addSi(1); if (cb.fillSi) { cb.si = 3; cb.fillSi = 0; } cb.atkN++; if (stk15(cb.Hu(), 'pwMaster15') && cb.atkN % 3 === 0) { cb.drawN(1); cb.energy++; core.emit(EVT.CARD15, { src: cb.Hu(), tgts: [cb.Hu()], payload: { k: 'relic', s: '劍聖之心' } }); } }
    core.data.si2 = false; cb.cardsN++;
    if (cb.has('feather') && cb.cardsN === 3) { cb.drawN(1); core.emit(EVT.CARD15, { src: cb.Hu(), tgts: [cb.Hu()], payload: { k: 'relic', s: '迅雷羽毛' } }); }
    if (!core.ended()) core.extraTurn(cb.Hu(), 'card15'); } };
EFFECT_TYPES.card15end = { exec(core) { const cb = core.data.cb; if (!cb) return; const H = cb.Hu();
    if (cb.has('crest') && !stk15(H, 'blk15')) { block15(core, H, 4); core.emit(EVT.CARD15, { src: H, tgts: [H], payload: { k: 'relic', s: '騎士盾徽' } }); } } };

/* ---------- 魔物（試玩版：第一章的魔物，固定的行動順序） ---------- [名字, 種類, 數值, 選項] */
const MON15 = {
  slime: { hp: [13, 15], m: [['撞擊', 'atk', 6], ['黏液', 'atk', 3, { weak: 1 }]] },
  meadowWolf: { hp: [17, 19], m: [['咬', 'atk', 5], ['撲咬', 'atk', 3, { hits: 2 }]] },
  bee: { hp: [9, 11], m: [['螫', 'atk', 3, { hits: 2 }]] },
  mush: { hp: [15, 17], m: [['孢子', 'debuff', 0, { weak: 2 }], ['撞', 'atk', 7]] },
  fox: { hp: [19, 21], m: [['火球', 'atk', 8], ['蓄火', 'buff', 0, { str: 2 }]] },
  frog: { hp: [14, 16], m: [['毒舌', 'atk', 4, { bleed: 2 }], ['跳躍', 'block', 0, { blk: 6 }]] },
  thunderBeetle: { hp: [25, 27], m: [['硬殼', 'block', 0, { blk: 8 }], ['衝撞', 'atk', 11]] },
  pebble: { hp: [11, 13], m: [['滾撞', 'atk', 5], ['堅硬', 'block', 0, { blk: 6 }]] },
  bandit: { hp: [46, 46], kind: 'elite', m: [['連刺', 'atk', 4, { hits: 3 }], ['搶劫', 'atk', 10], ['威嚇', 'buff', 0, { str: 3 }]] },
  mossGiant: { hp: [64, 64], kind: 'elite', m: [['重擊', 'atk', 16], ['苔盾', 'block', 0, { blk: 12 }], ['根縛', 'atk', 6, { weak: 2 }]] },
  banditBoss: { hp: [130, 130], kind: 'boss', m: [['劈砍', 'atk', 12], ['旋斧', 'atk', 7, { hits: 2 }], ['戰吼', 'buff', 0, { str: 3, blk: 10 }], ['蓄力', 'charge', 0], ['斷頭斧', 'atk', 32, { needChg: 1 }]] },
};
for (const sp in MON15) { const E = (DEF.enemies && DEF.enemies[sp]) || {}, sk = (E.skills || []).map(id => DEF.skills[id]).filter(Boolean);
  const atkFx = (sk.find(D => D.power > 0) || {}).fx || 'm_tackle', selfFx = (sk.find(D => D.target === 'self') || {}).fx || (typeof MFX !== 'undefined' && MFX.m_warCry ? 'm_warCry' : atkFx);
  MON15[sp].m.forEach(([n, k, d, o = {}], i) => { const id = 'm15_' + sp + '_' + i, self = ['buff', 'block', 'charge'].includes(k);
    defPut('skills', id, { ...DEF.skills.t_sdBreak, id, name: n, desc: '', power: 0, target: self ? 'self' : 'enemy', noHitRoll: true, costs: [], cooldown: 0, hits: null, charge: false, prio: 0,
      effects: ['mv15_' + sp + '_' + i], after: [], mods: [], fx: self ? selfFx : atkFx, foe: 1, tags: ['skill', 'monster_skill'], metadata: {}, override: true });
    defPut('effects', 'mv15_' + sp + '_' + i, { type: 'mon15', mv: { n, k, d, ...o } }); }); }
EFFECT_TYPES.mon15 = { exec(core, ef, ctx) { const u = ctx.owner, mv = ef.mv, H = core.byId.H; if (!core.isUp(u)) return;
    if (mv.needChg && !stk15(u, 'chg15')) { core.emit(EVT.CARD15, { src: u, tgts: [u], payload: { k: 'fizzle', s: mv.n } }); return; }
    if (mv.needChg) core.removeStatus(u, 'chg15', 'used');
    if (mv.k === 'atk') for (let i = 0; i < (mv.hits || 1); i++) hit15(core, u, H, mv.d, { i, n: mv.hits || 1 });
    if (mv.k === 'charge') { u.data.chgHit15 = 0; u.data.chgNeed15 = 20; core.applyStatus(u, u, 'chg15', {}); }
    if (mv.blk) block15(core, u, mv.blk); if (mv.str) core.applyStatus(u, u, 'str15', { delta: mv.str });
    if (core.isUp(H)) { if (mv.weak) core.applyStatus(u, H, 'weak15', { delta: mv.weak + 1 }); if (mv.bleed) core.applyStatus(u, H, 'bleed15', { delta: mv.bleed }); if (mv.vuln) core.applyStatus(u, H, 'vuln15', { delta: mv.vuln + 1 }); } } };
// the monsters follow their pattern (planned at the start of the round, shown over their heads)
{ const _d = BAI.decide; BAI.decide = function (core, u, o) { if (!c15On(core) || !u.data.pat15) return _d.call(this, core, u, o);
    const L = u.data.pat15, id = L[(u.data.pi15 || 0) % L.length]; u.data.pi15 = (u.data.pi15 || 0) + 1; return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'self' ? [] : ['H'] }; }; }
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { if (!(core && core.data && core.data.card15)) return _io(core, u, cmd); if (!cmd || !u || !core.isUp(u) || cmd.type !== 'skill') return null;
    const D = DEF.skills[cmd.skill], ef = D && (typeof D.effects[0] === 'string' ? DEF.effects[D.effects[0]] : D.effects[0]), mv = ef && ef.mv; if (!mv) return null; const H = core.byId.H;
    if (mv.needChg && !stk15(u, 'chg15')) return { k: 'down', t: '打斷了' };
    if (mv.k === 'atk') { const n = dmg15(u, H, mv.d), h = mv.hits || 1; return { k: n * h >= 15 ? 'heavy' : 'atk', t: n + (h > 1 ? '×' + h : '') + (mv.weak ? '+虛弱' : mv.bleed ? '+流血' : '') }; }
    if (mv.k === 'charge') return { k: 'heavy', t: '蓄力' }; if (mv.k === 'block') return { k: 'guard', t: '格擋 ' + mv.blk }; if (mv.k === 'debuff') return { k: 'debuff', t: '虛弱' };
    return { k: 'buff', t: mv.str ? '力量 +' + mv.str : '強化' }; }; }

/* ---------- 戰鬥畫面（沿用 Battle，只換掉指令、訊息、下方的介面） ---------- */
const shuffle15 = (a, rng) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function heroSpec15(run) { return { id: 'H', side: 'A', hero: true, name: Game.st.name || '小晨', lv: 1, kind: 'hero', stats: { hp: run.maxHp, mp: 0, atk: 1, def: 1, spa: 1, spd: 1, spe: 999, crit: 0, hit: 0, eva: 0, resist: {}, wkind: '劍' },
  hp: run.hp, mp: 0, passives: [], skills: Object.keys(CARD15).map(k => 'c15_' + k).concat(['c15_end']), data: { mechanics: [], attackSkill: 'c15_strike', attackName: '斬擊', attackFx: 'slash', slots: [], skillNames: {} } }; }
function monSpec15(sp, i, rng) { const M = MON15[sp], hp = M.hp[0] + Math.floor(rng() * (M.hp[1] - M.hp[0] + 1));
  return { id: 'F' + i, side: 'B', name: (SPECIES[sp] && SPECIES[sp].n) || sp, sp, fam: (SPECIES[sp] || {}).fam || null, lv: 1, kind: 'wild', look15: M.kind || 'wild', /* the RPG's boss systems (shields, parts, break) stay off: the core sees every monster as a plain one */ stats: { hp, mp: 0, atk: 1, def: 1, spa: 1, spd: 1, spe: 1, crit: 0, hit: 0, eva: 0, resist: {} },
    hp, passives: [], skills: M.m.map((_, j) => 'm15_' + sp + '_' + j), data: { mechanics: [], pat15: M.m.map((_, j) => 'm15_' + sp + '_' + j), pi15: sp === 'banditBoss' ? 0 : Math.floor(rng() * M.m.length) } }; }
class CardBattle15 extends Battle {
  constructor(run, foes, kind) {
    const rng = run.rng, core = new BattleCore({ seed: Math.floor(rng() * 1e9), units: [], env: {}, envMods: [], envTrigs: [], cfg: { kind } });
    core.data.card15 = true; core.addUnit(heroSpec15(run), true); foes.forEach((sp, i) => core.addUnit(monSpec15(sp, i + 1, rng), true)); BB.nameFoes(core);
    const _b = BB.build; BB.build = () => core; try { super({ sp: foes[0], lv: 1, kind, bg: run.bg || 'field' }); } finally { BB.build = _b; }
    for (const u of core.side('B')) { const k = MON15[u.sp].kind; const v = this.views[u.id]; if (v && k) { v.boss = k === 'boss'; v.elite = k === 'elite'; } } this.layout(true);
    this.run15 = run; core.data.cb = this; this.deck = shuffle15(run.deck.map(c => ({ ...c })), rng); this.hand = []; this.disc = []; this.exh = []; this.energy = 0; this.si = 0; this.nextDraw = 0; this.atkN = 0; this.cardsN = 0; this.turnR = 0; this.sel = -1; this.tgtMode = 0; this.tap15 = null; this.fillSi = 0;
    const H = core.byId.H; if (this.has('fang')) this.si = 1; if (this.has('whet')) H.statuses.push({ id: 'str15', stacks: 1, dur: null, src: null, at: 0, atAct: 0, seq: ++core.stSeq, data: {} });
    if (run.potStr15) H.statuses.push({ id: 'str15', stacks: run.potStr15, dur: null, src: null, at: 0, atAct: 0, seq: ++core.stSeq, data: {} });
  }
  Hu() { return this.core.byId.H; }
  has(r) { return this.run15.relics.includes(r); }
  addSi(n) { this.si = Math.min(3, this.si + n); }
  drawN(n) { for (let i = 0; i < n; i++) { if (this.hand.length >= C15.HAND_MAX) break; if (!this.deck.length) { if (!this.disc.length) break; this.deck = shuffle15(this.disc, this.run15.rng); this.disc = []; } this.hand.push(this.deck.pop()); } }
  *msg(text, o = {}) { const s = String(text); if (/^（/.test(s) || s.length > 22) return; this.note15 = { s, t: 0 }; yield* wait(4); }
  *announce(text) { } // the card's own picture says it
  startTurn() { const core = this.core, H = this.Hu(); this.energy = C15.EN; this.cardsN = 0; this.tgtMode = 0; this.sel = -1;
    if (stk15(H, 'blk15')) H.statuses = H.statuses.filter(s => s.id !== 'blk15');
    const g = stk15(H, 'pwGuard15'); if (g) block15(core, H, g);
    this.drawN(C15.DRAW + this.nextDraw + (this.turnR === 1 && this.has('seed') ? 2 : 0)); this.nextDraw = 0; this.sync(); }
  playable(c) { return cardCost15(c) <= this.energy; }
  *command() {
    if (this.turnR !== this.core.round) { this.turnR = this.core.round; this.startTurn(); yield* this.play(); }
    if (this.core.result) return { type: 'skill', skill: 'c15_end', targets: [] };
    while (true) {
      this.idle = true; yield; const tp = this.tap15; this.tap15 = null; const n = this.hand.length;
      if (Input.pressed('left')) { this.sel = this.tgtMode ? this.sel : (this.sel <= 0 ? n - 1 : this.sel - 1); if (this.tgtMode) this.cycleTgt(-1); Sound.sfx('cursor'); }
      if (Input.pressed('right')) { this.sel = this.tgtMode ? this.sel : (this.sel + 1) % Math.max(1, n); if (this.tgtMode) this.cycleTgt(1); Sound.sfx('cursor'); }
      let act = null;
      if (tp) act = tp; else if (Input.pressed('a')) act = this.tgtMode ? { k: 'tgt', id: this.tgtId } : this.sel >= 0 ? { k: 'card', i: this.sel } : null; else if (Input.pressed('b')) act = this.tgtMode || this.sel >= 0 ? { k: 'back' } : null; else if (Input.pressed('start')) act = { k: 'end' };
      if (!act) continue;
      if (act.k === 'back') { this.tgtMode = 0; this.sel = -1; continue; }
      if (act.k === 'end') { this.idle = false; this.disc.push(...this.hand); this.hand = []; this.sel = -1; this.core.data.cardNow = null; return { type: 'skill', skill: 'c15_end', targets: [] }; }
      if (act.k === 'pot') { yield* this.usePot(act.i); continue; }
      if (act.k === 'card') { if (this.sel !== act.i) { this.sel = act.i; this.tgtMode = 0; Sound.sfx('cursor'); continue; }
        const c = this.hand[act.i]; if (!c) continue; if (!this.playable(c)) { this.note15 = { s: '能量不夠', t: 0 }; Sound.sfx('buzz'); continue; }
        const C = CARD15[c.id], foes = this.core.alive('B');
        if (C.tg === 'enemy' && foes.length > 1) { this.tgtMode = 1; this.tgtId = (this.focus && foes.some(f => f.id === this.focus.id)) ? this.focus.id : foes[0].id; continue; }
        return this.playCard(act.i, C.tg === 'enemy' ? foes[0].id : null); }
      if (act.k === 'tgt' && this.tgtMode && this.sel >= 0) { this.tgtMode = 0; return this.playCard(this.sel, act.id); }
    }
  }
  cycleTgt(d) { const L = this.core.alive('B'); const i = L.findIndex(f => f.id === this.tgtId); this.tgtId = L[(i + d + L.length) % L.length].id; this.focus = this.views[this.tgtId]; }
  playCard(i, tgt) { const c = this.hand[i], C = CARD15[c.id]; this.energy -= cardCost15(c); this.hand.splice(i, 1); this.sel = -1; this.idle = false;
    if (C.exhaust) this.exh.push(c); else if (C.type !== 'pow') this.disc.push(c); this.core.data.cardNow = c; Sound.sfx('select');
    return { type: 'skill', skill: 'c15_' + c.id, targets: tgt ? [tgt] : [] }; }
  *usePot(i) { const run = this.run15, p = run.pots[i]; if (!p) return; run.pots.splice(i, 1); const core = this.core, H = this.Hu(); Sound.sfx('heal');
    if (p === 'heal') core.heal(H, H, 20, {}); if (p === 'str') { core.applyStatus(H, H, 'str15', { delta: 2 }); } if (p === 'blk') block15(core, H, 12); yield* this.play(); }
  *finish() { const R0 = this.core.result, r = R0 && typeof R0 === 'object' ? R0.outcome : R0, H = this.Hu(); this.run15.hp = Math.max(0, H.res.hp); yield* wait(r === 'win' ? 30 : 50); this.result = r; this.done15 = true; }
  /* ----- drawing: the hero box becomes HP・格擋・能量・劍意; the hand of cards along the bottom ----- */
  drawBoxH(x) { const H = this.H, run = this.run15; if (!H) return; const Y = 178;
    x.fillStyle = 'rgba(10,8,20,0.55)'; x.fillRect(0, Y - 2, W, 17); x.fillStyle = 'rgba(10,8,20,0.88)'; x.fillRect(0, 202, W, H0_15 - 202);
    // energy
    const en = this.energy; x.fillStyle = '#2a1c08'; x.beginPath(); x.arc(11, Y + 7, 9, 0, 7); x.fill(); x.fillStyle = en ? '#ffb030' : '#6a5030'; x.beginPath(); x.arc(11, Y + 7, 7.5, 0, 7); x.fill(); Font.drawC(x, String(en), 11, Y - 2, '#1a0c00', null, 11);
    // HP (number inside the bar) + 格擋
    const hp = Math.max(0, Math.round(H.hp)), mh = H.maxhp, bx = 23, bw = 58; x.fillStyle = '#301018'; x.fillRect(bx, Y + 1, bw, 11); x.fillStyle = '#c83838'; x.fillRect(bx, Y + 1, Math.round(bw * hp / mh), 11);
    Font.drawC(x, hp + '/' + mh, bx + bw / 2, Y - 2, '#fff4f4', '#000', 9); const b = H.st.blk15 || 0; if (b) { x.fillStyle = '#2a50b0'; x.fillRect(bx + bw + 2, Y + 1, 16, 11); x.fillStyle = '#9ec8ff'; x.fillRect(bx + bw + 2, Y + 1, 16, 1); Font.drawC(x, String(b), bx + bw + 10, Y - 2, '#ffffff', '#000', 9); }
    // 劍意 (3 pips)
    for (let i = 0; i < 3; i++) { x.fillStyle = i < this.si ? (this.si >= 3 ? '#ffe070' : '#ff9a40') : '#3a3048'; x.fillRect(102 + i * 6, Y + 1, 4, 11); } Font.drawC(x, '劍意', 110, Y + 9, this.si >= 3 ? '#ffe070' : '#a898b8', '#000', 6);
    // piles + end turn
    Font.draw(x, '牌庫' + this.deck.length, 2, H0_15 - 10, '#a8a0c0', '#000', 7); Font.drawR(x, '棄牌' + this.disc.length, W - 2, H0_15 - 10, '#a8a0c0', '#000', 7);
    const my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle; x.fillStyle = my ? '#c86030' : '#4a3a40'; x.fillRect(144, Y, 30, 14); Font.drawC(x, '結束', 159, Y + 1, '#fff4e0', '#000', 9);
    if (my) touchRegion(144, Y, 30, 14, () => { this.tap15 = { k: 'end' }; });
    // potions
    run.pots.forEach((p, i) => { const X = 124 + i * 9; x.fillStyle = POT15[p].c; x.fillRect(X, Y + 2, 7, 9); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(X + 1, Y + 3, 2, 2); if (my) touchRegion(X - 1, Y, 9, 13, () => { this.tap15 = { k: 'pot', i }; this.note15 = { s: POT15[p].n, t: 0 }; }); });
  }
  draw(x) { super.draw(x); this.drawHand15(x); if (this.note15 && this.note15.t++ < 70) { const s = this.note15.s, w = Math.min(W - 8, Font.width(s, 9) + 12); x.globalAlpha = Math.min(1, (70 - this.note15.t) / 15); x.fillStyle = 'rgba(10,8,20,0.85)'; x.fillRect((W - w) / 2, 114, w, 14); Font.drawC(x, s, W / 2, 115, '#fff4d8', '#000', 9); x.globalAlpha = 1; } }
  drawHand15(x) { const n = this.hand.length, cw = 32, ch = 46, Y = 205, my = this.core.need && this.core.need.unit && this.core.need.unit.hero && this.idle;
    const span = W - 8 - cw, step = n > 1 ? Math.min(cw + 2, span / (n - 1)) : 0, X0 = Math.round((W - (step * (n - 1) + cw)) / 2);
    const order = [...Array(n).keys()].filter(i => i !== this.sel).concat(this.sel >= 0 && this.sel < n ? [this.sel] : []);
    for (const i of order) { const c = this.hand[i], X = Math.round(X0 + i * step), up = i === this.sel ? 10 : 0; drawCard15(x, c, X, Y - up, cw, ch, { dim: !this.playable(c), on: i === this.sel });
      if (my) touchRegion(X, Y - up, i === n - 1 || i === this.sel ? cw : Math.ceil(step), ch, () => { this.tap15 = { k: 'card', i }; }); }
    if (this.sel >= 0 && this.hand[this.sel]) { const c = this.hand[this.sel], C = CARD15[c.id], v = cardVal15(c); x.fillStyle = 'rgba(12,8,24,0.92)'; x.fillRect(14, 128, W - 28, 44); x.fillStyle = TYPE15[C.type].c; x.fillRect(14, 128, W - 28, 1);
      Font.draw(x, cardName15(c) + '　' + TYPE15[C.type].n + '・' + cardCost15(c) + ' 能量', 18, 129, '#fff0d0', '#000', 9); wrap15(C.desc(v), W - 36, 8).forEach((L, k) => Font.draw(x, L, 18, 141 + k * 10, '#e8e4f4', '#000', 8));
      Font.drawR(x, this.tgtMode ? '點魔物出牌' : '再點一次出牌', W - 18, 161, '#a8e0ff', '#000', 7); }
    if (this.tgtMode && my) for (const f of this.foes()) { const C = this.center(f); if (f.id === this.tgtId) { x.strokeStyle = '#ffe070'; x.lineWidth = 1; x.strokeRect(C.x - 20, C.y - 22, 40, 44); } touchRegion(C.x - 24, C.y - 30, 48, 60, () => { this.tap15 = { k: 'tgt', id: f.id }; }); }
  }
}
const H0_15 = H;
const TYPE15 = { atk: { n: '攻擊', c: '#d05038', bg: '#3a1a1c' }, skl: { n: '技能', c: '#4a80d8', bg: '#16203a' }, pow: { n: '能力', c: '#d8a830', bg: '#33280c' } };
const RAR15 = { start: '#8a8a9a', C: '#c0c8d8', U: '#58b8ff', R: '#ffb040' };
const POT15 = { heal: { n: '回復藥：回 20 HP', c: '#e05050' }, str: { n: '力量藥水：這場戰鬥力量 +2', c: '#ff9a30' }, blk: { n: '鐵壁藥水：12 格擋', c: '#5a8ae0' } };
function wrap15(s, w, sz) { const out = []; let cur = ''; for (const ch of s) { if (Font.width(cur + ch, sz) > w) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; }
function drawCard15(x, c, X, Y, w, h, o = {}) { const C = CARD15[c.id], T = TYPE15[C.type], v = cardVal15(c), big = w >= 44;
  x.fillStyle = '#0c0814'; x.fillRect(X - 1, Y - 1, w + 2, h + 2); x.fillStyle = T.bg; x.fillRect(X, Y, w, h); x.fillStyle = o.on ? '#ffe070' : T.c; x.fillRect(X, Y, w, 1); x.fillRect(X, Y + h - 1, w, 1); x.fillRect(X, Y, 1, h); x.fillRect(X + w - 1, Y, 1, h);
  x.fillStyle = RAR15[C.rar]; x.fillRect(X + w - 4, Y + 2, 2, 2);
  // cost
  x.fillStyle = '#0c0814'; x.beginPath(); x.arc(X + 5, Y + 5, 5, 0, 7); x.fill(); x.fillStyle = o.dim ? '#6a5a40' : '#ffb030'; x.beginPath(); x.arc(X + 5, Y + 5, 4, 0, 7); x.fill(); Font.drawC(x, String(cardCost15(c)), X + 5, Y - 3, '#1a0c00', null, 8);
  const ns = cardName15(c); let fz = big ? 9 : 8; while (fz > 6 && Font.width(ns, fz) > w - 4) fz--; Font.drawC(x, ns, X + w / 2, Y + (big ? 11 : 9), c.up ? '#a8ffa0' : '#fff4e0', '#000', fz);
  const L = C.short(v); L.forEach((s, k) => { let z = big ? 9 : 7; while (z > 6 && Font.width(s, z) > w - 3) z--; Font.drawC(x, s, X + w / 2, Y + (big ? 26 : 20) + k * (big ? 11 : 9), '#e8e4f4', '#000', z); });
  Font.drawC(x, T.n, X + w / 2, Y + h - (big ? 12 : 10), T.c, '#000', 7);
  if (o.dim) { x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(X, Y, w, h); } }
// battle handlers: no "再行動" line for each card; 格擋・反擊・打斷 pops; the hero's turn has no command menu
{ const HD = Battle.prototype.handlers, _ex = HD.EXTRA_ACTION; HD.EXTRA_ACTION = function* (e, s, t, P) { if (P && P.why === 'card15') return; if (_ex) yield* _ex.call(this, e, s, t, P); };
  HD.CARD15 = function* (e, s, t, P) { if (!t) return;
    if (P.k === 'block') { Sound.sfx('shield'); this.popNum(t, '擋 ' + P.n, '#9ec8ff', null, { small: true }); }
    else if (P.k === 'counter') { Sound.sfx('exclaim'); this.popNum(s, '反擊！', '#ffe070', null, { big: true }); yield* wait(6); }
    else if (P.k === 'break') { Sound.sfx('rock'); this.shake = Math.max(this.shake, 8); this.popNum(t, '打斷了！', '#ffe070', null, { big: true }); yield* wait(12); }
    else if (P.k === 'fizzle') { this.popNum(s, P.s + '失敗！', '#c8c8d8', null, { big: true }); yield* wait(16); }
    else if (P.k === 'relic') { Sound.sfx('cursor'); this.popNum(t, P.s, '#ffd060', null, { small: true }); } }; }

/* ---------- 一趟遠征：地圖、獎勵、營火、寶箱 ---------- */
const RELIC15 = { amulet: ['萌芽鎮護符', '戰鬥結束回 6 HP'], fang: ['狼牙項鍊', '戰鬥開始時劍意 +1'], whet: ['磨刀石', '戰鬥開始時力量 +1'], seed: ['古樹之種', '第一回合多抽 2 張'], crest: ['騎士盾徽', '回合結束沒有格擋時，得到 4 格擋'], feather: ['迅雷羽毛', '每回合打出第 3 張牌時抽 1 張'] };
const ENC15 = { easy: [['slime', 'slime'], ['meadowWolf'], ['bee', 'bee'], ['pebble', 'slime']], mid: [['mush', 'slime'], ['fox'], ['frog', 'frog'], ['meadowWolf', 'bee'], ['thunderBeetle'], ['pebble', 'pebble', 'mush']], hard: [['thunderBeetle', 'bee'], ['fox', 'meadowWolf'], ['frog', 'mush', 'slime'], ['fox', 'frog']], elite: [['bandit'], ['mossGiant']], boss: [['banditBoss']] };
const NODE15 = { fight: { n: '戰', c: '#c8c0b0' }, elite: { n: '菁', c: '#ff7050' }, camp: { n: '火', c: '#ffb040' }, chest: { n: '寶', c: '#ffe070' }, boss: { n: '王', c: '#ff4040' } };
function newRun15(seed) { const rng = makeRng(seed >>> 0), R = () => rng.next();
  const deck = []; for (let i = 0; i < 5; i++) deck.push({ id: 'strike' }); for (let i = 0; i < 4; i++) deck.push({ id: 'defend' }); deck.push({ id: 'break' });
  // 9 floors, 3 lanes; floor 9 = the boss
  const plan = ['fight', 'fight', ['fight', 'chest'], ['fight', 'elite'], 'camp', ['fight', 'elite', 'chest'], ['fight', 'fight', 'chest'], 'camp', 'boss'], map = [];
  plan.forEach((p, f) => { const lanes = f === 8 ? [1] : [0, 1, 2]; map.push(lanes.map(l => ({ f, l, k: Array.isArray(p) ? p[Math.floor(R() * p.length)] : p, x: f === 8 ? 88 : 36 + l * 52 + Math.round((R() - 0.5) * 12), y: 236 - f * 24, to: [] }))); });
  for (let f = 0; f < 8; f++) for (const n of map[f]) { const nx = map[f + 1]; if (nx.length === 1) n.to = [0]; else n.to = [n.l - 1, n.l, n.l + 1].filter(l => l >= 0 && l < 3 && (l === n.l || R() < 0.55)); if (!n.to.length) n.to = [n.l]; }
  for (let f = 1; f < 8; f++) map[f].forEach((n, i) => { if (!map[f - 1].some(p => p.to.includes(i))) map[f - 1][i].to.push(i); });
  return { rng: R, maxHp: C15.HP, hp: C15.HP, deck, relics: ['amulet'], pots: [], map, pos: null, floor: -1, won: 0 }; }
function rewardCards15(run, n = 3, elite) { const out = [], pool = CARD_POOL15.slice(); while (out.length < n && pool.length) { const r = run.rng(), want = r < (elite ? 0.12 : 0.05) ? 'R' : r < (elite ? 0.5 : 0.35) ? 'U' : 'C'; let L = pool.filter(k => CARD15[k].rar === want); if (!L.length) L = pool; const k = L[Math.floor(run.rng() * L.length)]; out.push({ id: k }); pool.splice(pool.indexOf(k), 1); } return out; }
class CardRun15 {
  constructor(seed) { this.run = newRun15(seed || ((Date.now() & 0x7fffffff) ^ 0x5bd1e995)); this.t = 0; this.mode = 'map'; this.bg = buildBattleBG('field'); this.ui = null; this.busy = false; }
  enter() { UI.clear(); }
  update() { this.t++; this.keys(); }
  // the run's flow runs as a global coroutine (the battle scene takes over the screen while fighting)
  go(g) { if (this.busy) return; this.busy = true; const self = this; Game.sys.push((function* () { try { yield* g; } finally { self.busy = false; } })()); }
  keys() { const U = this.ui;
    if (!U) { if ((this.mode === 'over' || this.mode === 'win') && Input.pressed('a')) { Input.consume('a'); Game.setScene(new CardRun15()); return; } if (this.mode === 'map' && !this.busy && Input.pressed('a')) { const nx = this.next(); if (nx.length) this.pick(nx[0]); } return; }
    if (U.k === 'reward') { if (Input.pressed('left')) U.sel = (U.sel <= 0 ? U.cards.length - 1 : U.sel - 1); if (Input.pressed('right')) U.sel = (U.sel + 1) % U.cards.length; if (Input.pressed('a') && U.sel >= 0) U.done = U.sel; if (Input.pressed('b')) U.done = -1; }
    else if (U.k === 'camp') { if (Input.pressed('a')) U.done = 'rest'; }
    else if (U.k === 'relics') { if (Input.pressed('a') || Input.pressed('b')) this.ui = null; }
    else if (U.k === 'deck') { if (Input.pressed('b')) { if (U.up) U.done = -1; else this.ui = null; } } }
  next() { const R = this.run; if (R.floor < 0) return R.map[0].map((_, i) => i); return R.map[R.floor][R.pos].to; }
  pick(i) { if (this.busy || this.mode !== 'map') return; this.go(this.enterNode(i)); }
  *enterNode(i) { const R = this.run; R.floor++; R.pos = i; const node = R.map[R.floor][i]; Sound.sfx('select');
    if (node.k === 'fight' || node.k === 'elite' || node.k === 'boss') { const tier = node.k !== 'fight' ? node.k : R.floor < 2 ? 'easy' : R.floor < 5 ? 'mid' : 'hard', L = ENC15[tier], foes = L[Math.floor(R.rng() * L.length)];
      const res = yield* this.battle(foes, node.k === 'fight' ? 'wild' : node.k); if (res !== 'win') { this.mode = 'over'; return; }
      if (R.relics.includes('amulet')) R.hp = Math.min(R.maxHp, R.hp + 6);
      if (node.k === 'boss') { this.mode = 'win'; return; }
      if (node.k === 'elite') yield* this.relicGet();
      if (R.rng() < (node.k === 'elite' ? 0.6 : 0.35) && R.pots.length < 2) { const p = ['heal', 'str', 'blk'][Math.floor(R.rng() * 3)]; R.pots.push(p); yield* this.say('得到了' + POT15[p].n.split('：')[0] + '！'); }
      yield* this.cardReward(rewardCards15(R, 3, node.k === 'elite')); }
    else if (node.k === 'chest') yield* this.relicGet();
    else if (node.k === 'camp') yield* this.camp();
    this.mode = 'map'; }
  *battle(foes, kind) { const R = this.run; Sound.play(kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : 'battle'); yield* battleTransition(kind === 'wild' ? 'wild' : kind);
    const b = new CardBattle15(R, foes, kind); Game.setScene(b); while (!b.done15) yield; Game.trans = null; Game.setScene(this); Game.fade = 1; yield* tween(14, t => Game.fade = 1 - t); Game.fade = 0; Sound.play('title'); return b.result; }
  *say(s) { this.ui = { k: 'say', s }; this.tapOk = false; yield* wait(10); Input.consume('a', 'b'); while (!(Input.pressed('a') || this.tapOk)) yield; this.tapOk = false; this.ui = null; }
  *relicGet() { const R = this.run, L = Object.keys(RELIC15).filter(k => !R.relics.includes(k)); if (!L.length) return; const k = L[Math.floor(R.rng() * L.length)]; R.relics.push(k); Sound.sfx('levelup'); yield* this.say('得到了遺物「' + RELIC15[k][0] + '」：' + RELIC15[k][1]); }
  *cardReward(cards) { this.ui = { k: 'reward', cards, sel: -1 }; Input.consume('a', 'b'); while (true) { yield; const U = this.ui; if (U.done != null) { if (U.done >= 0) this.run.deck.push(U.cards[U.done]); Sound.sfx('select'); this.ui = null; return; } } }
  *camp() { this.ui = { k: 'camp' }; while (true) { yield; const U = this.ui; if (U.done === 'rest') { const R = this.run; R.hp = Math.min(R.maxHp, R.hp + Math.round(R.maxHp * 0.3)); Sound.sfx('heal'); this.ui = null; yield* this.say('在營火旁休息，回復了 HP。'); return; }
      if (U.done === 'up') { this.ui = { k: 'deck', up: 1, scroll: 0 }; while (this.ui && this.ui.k === 'deck' && this.ui.done == null) yield; const d = this.ui && this.ui.done; this.ui = null; if (d != null && d >= 0) { this.run.deck[d].up = 1; Sound.sfx('levelup'); yield* this.say('「' + CARD15[this.run.deck[d].id].n + '」升級了！'); return; } this.ui = { k: 'camp' }; } } }
  draw(x) { const R = this.run; x.fillStyle = '#0c0a16'; x.fillRect(0, 0, W, H); x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(8,6,18,0.72)'; x.fillRect(0, 0, W, H);
    // top bar
    x.fillStyle = 'rgba(10,8,20,0.9)'; x.fillRect(0, 0, W, 14); Font.draw(x, 'HP ' + R.hp + '/' + R.maxHp, 3, -1, '#ff9a9a', '#000', 9); Font.draw(x, '牌組 ' + R.deck.length, 66, -1, '#e8e4f4', '#000', 9);
    touchRegion(62, 0, 40, 14, () => { if (!this.ui && !this.busy) this.ui = { k: 'deck', view: 1, scroll: 0 }; });
    R.relics.forEach((k, i) => { x.fillStyle = '#ffd060'; x.fillRect(110 + i * 9, 3, 7, 7); x.fillStyle = '#6a4a10'; x.fillRect(112 + i * 9, 5, 3, 3); });
    touchRegion(108, 0, 68, 14, () => { if (!this.ui && !this.busy) this.ui = { k: 'relics' }; });
    if (this.mode === 'map' || this.mode === 'over' || this.mode === 'win') this.drawMap(x);
    if (this.mode === 'over' || this.mode === 'win') this.drawEnd(x);
    if (this.ui) this.drawUI(x); }
  drawMap(x) { const R = this.run, nx = this.mode === 'map' && !this.busy ? this.next() : [];
    for (let f = 0; f < R.map.length - 1; f++) for (const n of R.map[f]) for (const j of n.to) { const m = R.map[f + 1][j]; x.strokeStyle = 'rgba(200,190,170,0.35)'; x.lineWidth = 1; x.setLineDash([2, 2]); x.beginPath(); x.moveTo(n.x, n.y - 5); x.lineTo(m.x, m.y + 5); x.stroke(); x.setLineDash([]); }
    R.map.forEach((row, f) => row.forEach((n, i) => { const Nd = NODE15[n.k], done = f < R.floor || (f === R.floor && i === R.pos), avail = f === R.floor + 1 && nx.includes(i), here = f === R.floor && i === R.pos, big = n.k === 'boss';
      const r = big ? 10 : 7, pulse = avail ? 1 + Math.sin(this.t / 6) * 0.15 : 1; x.fillStyle = here ? '#ffe070' : done ? '#5a5060' : '#1a1424'; x.beginPath(); x.arc(n.x, n.y, r * pulse + 1.5, 0, 7); x.fill();
      x.fillStyle = done && !here ? '#2a2430' : '#2a2038'; x.beginPath(); x.arc(n.x, n.y, r * pulse, 0, 7); x.fill(); Font.drawC(x, Nd.n, n.x, n.y - (big ? 8 : 6), done && !here ? '#8a8090' : Nd.c, '#000', big ? 12 : 9);
      if (avail) touchRegion(n.x - 11, n.y - 11, 22, 22, () => this.pick(i)); }));
    if (this.mode === 'map' && !this.busy && !this.ui) Font.drawC(x, this.run.floor < 0 ? '選擇路線出發（點閃爍的地點）' : '選下一個地點', W / 2, 18, '#e8e0c8', '#000', 8); }
  drawEnd(x) { const win = this.mode === 'win'; x.fillStyle = 'rgba(8,6,18,0.85)'; x.fillRect(16, 84, W - 32, 80); Font.drawC(x, win ? '討伐成功！' : '倒下了……', W / 2, 92, win ? '#ffe070' : '#ff8080', '#000', 14);
    Font.drawC(x, win ? '試玩版通關。謝謝遊玩！' : '到達第 ' + (this.run.floor + 1) + ' 層', W / 2, 114, '#e8e4f4', '#000', 9); Font.drawC(x, '牌組 ' + this.run.deck.length + ' 張・遺物 ' + this.run.relics.length + ' 個', W / 2, 128, '#a8a0c0', '#000', 8);
    x.fillStyle = '#c86030'; x.fillRect(W / 2 - 34, 144, 68, 14); Font.drawC(x, '再挑戰一次', W / 2, 145, '#fff4e0', '#000', 9); const again = () => { Game.setScene(new CardRun15()); };
    touchRegion(W / 2 - 34, 144, 68, 14, again); }
  drawUI(x) { const U = this.ui;
    if (U.k === 'say') { x.fillStyle = 'rgba(10,8,20,0.94)'; x.fillRect(8, 100, W - 16, 52); x.fillStyle = '#c8a050'; x.fillRect(8, 100, W - 16, 1); wrap15(U.s, W - 28, 9).forEach((L, k) => Font.draw(x, L, 14, 104 + k * 12, '#fff4e0', '#000', 9)); Font.drawR(x, '▼', W - 14, 140, '#c8a050', null, 8); touchRegion(0, 0, W, H, () => { this.tapOk = true; }); return; }
    if (U.k === 'reward') { x.fillStyle = 'rgba(8,6,18,0.9)'; x.fillRect(0, 40, W, 170); Font.drawC(x, '選一張卡加入牌組', W / 2, 46, '#ffe0a0', '#000', 10);
      U.cards.forEach((c, i) => { const X = 6 + i * 56, Y = 66; drawCard15(x, c, X, Y, 52, 72, { on: U.sel === i }); touchRegion(X, Y, 52, 72, () => { if (U.sel === i) U.done = i; else U.sel = i; }); });
      if (U.sel >= 0) { const c = U.cards[U.sel]; wrap15(cardName15(c) + '：' + CARD15[c.id].desc(cardVal15(c)), W - 20, 8).forEach((L, k) => Font.draw(x, L, 10, 144 + k * 10, '#e8e4f4', '#000', 8)); Font.drawC(x, '再點一次加入', W / 2, 168, '#a8e0ff', '#000', 8); }
      x.fillStyle = '#4a3a50'; x.fillRect(W / 2 - 24, 186, 48, 14); Font.drawC(x, '跳過', W / 2, 187, '#e8e4f4', '#000', 9); touchRegion(W / 2 - 24, 186, 48, 14, () => { U.done = -1; });
      return; }
    if (U.k === 'camp') { x.fillStyle = 'rgba(8,6,18,0.9)'; x.fillRect(16, 90, W - 32, 76); Font.drawC(x, '營火', W / 2, 94, '#ffb040', '#000', 11);
      const bt = (s, d, Y, fn) => { x.fillStyle = '#3a2a40'; x.fillRect(28, Y, W - 56, 18); Font.drawC(x, s, W / 2, Y + 1, '#fff4e0', '#000', 9); Font.drawC(x, d, W / 2, Y + 10, '#a8a0c0', '#000', 7); touchRegion(28, Y, W - 56, 18, fn); };
      bt('休息', '回復 ' + Math.round(this.run.maxHp * 0.3) + ' HP', 114, () => { U.done = 'rest'; }); bt('鍛鍊', '升級一張卡', 138, () => { U.done = 'up'; });
      return; }
    if (U.k === 'relics') { x.fillStyle = 'rgba(8,6,18,0.94)'; x.fillRect(8, 30, W - 16, 20 + this.run.relics.length * 22); Font.drawC(x, '遺物', W / 2, 32, '#ffd060', '#000', 10);
      this.run.relics.forEach((k, i) => { Font.draw(x, RELIC15[k][0], 14, 48 + i * 22, '#ffd060', '#000', 9); Font.draw(x, RELIC15[k][1], 14, 58 + i * 22, '#e8e4f4', '#000', 7); });
      touchRegion(0, 0, W, H, () => { this.ui = null; }); return; }
    if (U.k === 'deck') { const D = this.run.deck, cw = 38, ch = 54, cols = 4, rows = Math.ceil(D.length / cols), vis = 3; x.fillStyle = 'rgba(8,6,18,0.95)'; x.fillRect(0, 16, W, H - 16);
      Font.drawC(x, U.up ? '選一張卡升級' : '牌組（' + D.length + ' 張）', W / 2, 18, '#ffe0a0', '#000', 10);
      for (let k = 0; k < D.length; k++) { const r = Math.floor(k / cols) - U.scroll; if (r < 0 || r >= vis) continue; const X = 6 + (k % cols) * (cw + 4), Y = 34 + r * (ch + 6), c = D[k]; drawCard15(x, c, X, Y, cw, ch, { on: U.sel === k, dim: U.up && c.up });
        touchRegion(X, Y, cw, ch, () => { if (U.up && !c.up) { if (U.sel === k) U.done = k; else U.sel = k; } else U.sel = k; }); }
      if (U.sel != null && D[U.sel]) { const c = D[U.sel], v = cardVal15(U.up ? { ...c, up: 1 } : c); wrap15((U.up ? '升級後：' : '') + cardName15(U.up ? { ...c, up: 1 } : c) + '：' + CARD15[c.id].desc(v), W - 16, 8).forEach((L, k) => Font.draw(x, L, 8, 214 + k * 10, '#e8e4f4', '#000', 8)); }
      if (U.scroll > 0) { Font.drawC(x, '▲', W / 2, 26, '#c8a050', null, 8); touchRegion(0, 18, W, 14, () => { U.scroll--; }); }
      if (U.scroll + vis < rows) { Font.drawC(x, '▼', W / 2, 196, '#c8a050', null, 8); touchRegion(0, 196, W, 14, () => { U.scroll++; }); }
      x.fillStyle = '#4a3a50'; x.fillRect(W - 46, H - 16, 42, 14); Font.drawC(x, U.up ? '取消' : '關閉', W - 25, H - 15, '#e8e4f4', '#000', 9); touchRegion(W - 46, H - 16, 42, 14, () => { if (U.up) U.done = -1; else this.ui = null; });
      return; } }
}
class CardTitle15 {
  constructor() { this.t = 0; this.bg = buildBattleBG('field'); }
  enter() { UI.clear(); }
  update() { this.t++; if (Input.pressed('a') || this.go) { Input.consume('a'); Sound.init(); Sound.sfx('select'); Game.setScene(new CardRun15()); } }
  draw(x) { x.fillStyle = '#0c0a16'; x.fillRect(0, 0, W, H); x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(8,6,18,0.6)'; x.fillRect(0, 0, W, H); if (!this.logo) this.logo = makeLogo('曙光冒險', 3); x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), 30);
    Font.drawC(x, '～卡牌試玩版～', W / 2, 78, '#ffe0a0', '#3a1428', 11); ['一幕 9 層、劍士一個職業', '每回合 3 能量、抽 5 張', '打倒鐵斧格倫就通關'].forEach((s, i) => Font.drawC(x, s, W / 2, 112 + i * 14, '#e8e4f4', '#000', 9));
    if (Math.floor(this.t / 30) % 2 === 0) Font.drawC(x, '點一下開始', W / 2, 200, '#ffffff', '#1a1024', 10); touchRegion(0, 0, W, H, () => { this.go = 1; }); Font.drawR(x, 'demo v13.0', W - 3, H - 13, '#b890b0', null); }
}
function startCardDemo15() { const st = newGameState('小晨'); st.card15 = 1; Game.st = st; try { const g = makeGear('ironSword', 2); g.u = ++st.gid; st.gear.push(g); st.equip.weapon = g.u; } catch (e) { } Game.setScene(new CardTitle15()); }
// the demo page: the RPG's title / town / field never show (the game's boot can run after this file — the artifact's runtime calls it later — so the switch also catches it then)
if (typeof window !== 'undefined' && window.CARD_DEMO) { const _ss = Game.setScene;
  Game.setScene = function (s) { if (s && (s instanceof TitleScene || s instanceof IntroScene || s instanceof Overworld)) { if (!Game.st || !Game.st.card15) { const st = newGameState('小晨'); st.card15 = 1; Game.st = st; try { const g = makeGear('ironSword', 2); g.u = ++st.gid; st.gear.push(g); st.equip.weapon = g.u; } catch (e) { } } s = new CardTitle15(); } return _ss.call(this, s); };
  startCardDemo15(); }
// the demo is played by touch: the on-screen pad stays hidden on its screens too (as in battle)
{ const _sp = syncPadVisibility; syncPadVisibility = function () { if (window.CARD_DEMO) { const on = document.body.classList.contains('battle'); if (!on) { document.body.classList.add('battle'); requestAnimationFrame(() => { fitScreen(); setTimeout(fitScreen, 60); }); } return; } return _sp(); }; }
