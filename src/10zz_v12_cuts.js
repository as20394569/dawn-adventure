/* ===================== v12.0.1 內容調整（玩家 2026-10-03 的清單，選項都已確認） =====================
   3. 取消異界之門（異界迴廊）：門只剩劇情的樣子，進不去了；迴廊的魔物資料先保留不刪。
   4. 取消 Break（破防）：魔物不再有破防盾；「削減護盾」改成「30% 讓對手物防−1」，「對破防的對手」改成「對物防下降的對手」。
   5. 菁英、頭目再戰不掉藥水（第一次打倒照舊）。
   6. 破關後：二周目和星見神殿先關閉，結局後顯示「第三章製作中」，可以繼續自由探索、做委託和支線。 */

/* ---------- 3. 異界之門／異界迴廊 ---------- */
Overworld.prototype.riftEntry = function* () { yield* say('異界之門靜靜地沉睡著。門的另一邊，只看得到一片黑雲……'); };
{ const n = (MAPS.ruins.npcs || []).find(q => q.id === 'warden'); if (n) n.show = st => !!st.flags.golem && (st.bag.riftToken || 0) > 0; } // stays only while badges are left to trade
{ const _w = Events.warden; Events.warden = function* (ow) { yield* _w.call(this, ow); }; /* v12.0.3: the warden's own line now says the door is closed */ }
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); for (let i = L.length - 1; i >= 0; i--) if (L[i].n === '異界迴廊') L.splice(i, 1); }; }

/* ---------- 6. after the ending: no 二周目, no 星見神殿 ---------- */
const STAR_MAP12 = Object.keys(MAPS).find(m => (MAPS[m].npcs || []).some(n => n.id === 'starGate'));
if (STAR_MAP12) { const n = MAPS[STAR_MAP12].npcs.find(q => q.id === 'starGate'); n.show = () => false; }
{ const _ql = questList; questList = function (st = Game.st) { const L = _ql(st);
    for (let i = L.length - 1; i >= 0; i--) if (L[i].n === '星見神殿') L.splice(i, 1);
    const M = L.find(q => q.main); if (M && M.done && /星之門/.test(M.t || '')) M.t = '完成：曙光鐘再次響起了。（第三章製作中）';
    return L; }; }
// saves standing inside a closed place go back to its door
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    if (id === 'rift') return _ld.call(this, 'ruins', 7, 2, 'down', silent);
    if (id === 'starShrine' && STAR_MAP12) { const g = MAPS[STAR_MAP12].npcs.find(q => q.id === 'starGate'); return _ld.call(this, STAR_MAP12, g.x, g.y + 1, 'down', silent); }
    return _ld.call(this, id, x, y, dir, silent); }; }
// titles / achievements that can't be earned any more (迴廊・破防・二周目・星見神殿)
const RETIRED12 = ['breaker', 'riftwalker', 'gatebreaker', 'again', 'starSeer', 'rift10', 'riftClear', 'break30', 'ng', 'starGuardian'];
for (const L of [TITLES, ACHIEVEMENTS]) for (let i = L.length - 1; i >= 0; i--) if (RETIRED12.includes(L[i].id) && !(L === ACHIEVEMENTS && L[i].id === 'golem')) L.splice(i, 1);
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st; if (st && st.title && RETIRED12.includes(st.title)) st.title = null; return _u.apply(this, a); }; }

/* ---------- 4. Break ---------- */
DEF.resources.brk.appliesTo = () => false; // no shield gauge on any monster
DEF.mechanics.breakGauge.triggers = [];
COND.tgtBroken = (c, v) => !!c.tgt && (BR.stage(c.core, c.tgt, 'def') < 0) === !!v; // 「對破防的對手」→「對物防下降的對手」
// every 「削減護盾」 now has a 30% chance to lower the target's 物防 by 1 (the equipment / talent chips keep their own chance and always lower it)
EFFECT_TYPES.break_chip.exec = function (core, ef, ctx, tg) {
  for (const t of tg) { if (!t || !core.isUp(t) || t.side === (ctx.owner && ctx.owner.side)) continue; const own = ef.why === 'breaker' || ef.why === 'shieldChip';
    if (ef.why === 'smash' || (ef.why === 'shieldHit' && skLowersDef(ctx.skill)) || (!own && !core.rng.chance(0.3))) continue; core.applyStatus(ctx.owner, t, 'stage_def', { delta: -1, dur: 3, secondary: true }); } };
// texts
const BRK_TXT = [
  [/【破盾】額外削減\d點護盾/g, '30% 讓對手物防−1'], [/每一下都能削減護盾/g, '每一下都有 30% 機率讓對手物防−1'], [/（會心也能削減護盾）/g, ''],
  [/連斬能削減護盾/g, '連斬有機率降低物防'], [/削減護盾的砲擊/g, '有機率降低物防的砲擊'], [/額外削減(對手)?1點護盾/g, '讓對手物防−1'],
  [/對有護盾的魔物多削 1 格破防盾/g, '30% 讓對手物防 −1'], [/多削 1 格破防盾/g, '讓對手物防 −1'], [/、破防盾 −1/g, ''], [/削減護盾/g, '30% 讓對手物防−1'],
  [/對破防中的魔物/g, '對物防下降的魔物'], [/對破防的對手/g, '對物防下降的對手'], [/攻擊破防中的魔物/g, '攻擊物防下降的魔物'], [/破防中的(魔物|對手)/g, '物防下降的$1'],
  [/防禦，或趁現在破防！/g, '快防禦！'], [/，或用弱點、會心打破護盾來打斷蓄力/g, ''], [/趁牠破防時一口氣打倒牠吧/g, '準備好回復，一口氣打倒牠吧'], [/、護盾\+1/g, ''],
];
// a skill that already lowers 物防 doesn't get the extra 30% line (text and effect)
const brkDedupe = s => { if (!s.includes('30% 讓對手物防−1')) return s; const rest = s.replace('30% 讓對手物防−1', '');
  if (/降低(對手的)?物防|對手物防[−-]1/.test(rest)) s = s.replace(/[，、；]?30% 讓對手物防−1(?=[，、；。])/, '').replace(/30% 讓對手物防−1[，、；]?/, '').replace('：，', '：').replace('，，', '，'); return s; };
const brkFix = s => { if (typeof s !== 'string' || !/護盾|破防|破盾/.test(s)) return s; for (const [a, b] of BRK_TXT) s = s.replace(a, b); return brkDedupe(s); };
const skLowersDef = sk => { if (!sk) return false; if (sk._lowDef12 !== undefined) return sk._lowDef12; const effs = [...(sk.effects || []), ...(sk.after || [])].map(e => typeof e === 'string' ? DEF.effects[e] : e).filter(Boolean);
  return (sk._lowDef12 = effs.some(e => (e.type === 'stage' && e.stats && e.stats.def < 0 && e.target !== 'self') || (e.type === 'status' && e.status === 'stage_def' && e.target !== 'self'))); };
const brkFixObj = (o, keys) => { for (const k of keys) if (typeof o[k] === 'string') o[k] = brkFix(o[k]); };
const brkFixDeep = (o, d = 0, seen = new Set()) => { if (!o || typeof o !== 'object' || d > 3 || seen.has(o)) return; seen.add(o); for (const k in o) { const v = o[k]; if (typeof v === 'string') o[k] = brkFix(v); else if (v && typeof v === 'object') brkFixDeep(v, d + 1, seen); } };
for (const T of [DEF.skills, DEF.mechanics, DEF.talents || {}, typeof SPECIALS !== 'undefined' ? SPECIALS : {}, typeof ACC_TRAIT !== 'undefined' ? ACC_TRAIT : {}]) brkFixDeep(T);
for (const id in DEF.skills) brkFixObj(DEF.skills[id], ['desc']);
for (const id in MOVES) brkFixObj(MOVES[id], ['d']);
for (const id in DEF.talents || {}) brkFixObj(DEF.talents[id], ['desc', 'd', 'name']);
for (const id in DEF.passives || {}) if (DEF.passives[id].metadata) brkFixObj(DEF.passives[id].metadata, ['desc', 'd']);
for (const T of [ITEMS, GEAR]) for (const id in T) brkFixObj(T[id], ['d']);
for (const T of [typeof SPECIALS !== 'undefined' ? SPECIALS : {}, typeof ORB_A !== 'undefined' ? ORB_A : {}, typeof ORB_P !== 'undefined' ? ORB_P : {}, typeof WKIND12 !== 'undefined' ? WKIND12 : {}, typeof CLS12 !== 'undefined' ? CLS12 : {}])
  for (const id in T) brkFixObj(T[id], ['d', 'rule', 'limit', 'n']);
if (typeof DIFFS !== 'undefined') for (const D of DIFFS) brkFixObj(D, ['d']);
if (typeof BATTLE_HELP !== 'undefined') for (const P of BATTLE_HELP) P[1] = P[1].filter(t => !/^破防：/.test(t)).map(brkFix);
if (typeof HEAVY_TIP !== 'undefined') for (const k in HEAVY_TIP) HEAVY_TIP[k] = brkFix(HEAVY_TIP[k]);
for (const id in MOVES) for (const k of ['warn', 'chargeMsg']) if (typeof MOVES[id][k] === 'string') MOVES[id][k] = brkFix(MOVES[id][k]);

/* 5. rematches give no potions: see 10o_v12_rewards (the drop itself checks cfg.rematch) */
