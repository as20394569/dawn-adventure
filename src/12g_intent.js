/* ===================== v12.77 戰鬥 A：看得到魔物的下一步・種族習性（玩家 2026-10-07：「如果你是玩家你會覺得戰鬥過於單調嗎？」→ A、B、C 照建議做） =====================
   1. 下一步：引擎本來就是回合開始時魔物先決定（core.plan）、主角再選。現在把它畫在每隻魔物頭上：
      攻擊（預估傷害；超過最大 HP 1/4 是橘色的「重擊」）・強化・削弱・異常・補血・架盾・逃跑・召喚・高飛・潛水・偷竊；精靈看不出來（？）。
   2. 種族習性（只有一般的野生魔物；菁英・頭目照自己的劇本，召喚出來的不算）：
      獸族 群獵（同伴倒下，物攻 +1 階）・蟲族 孵化（HP 40% 以下叫出一隻，一場一次）・植物 扎根（一回合沒被打到就回 10% HP）
      飛禽 高飛（那回合物理攻擊 40% 落空，下一下俯衝 ×1.3）・軟泥 分裂（一下被打掉 35% 以上 HP 就分裂，一場一次）
      水棲 潛水（那回合單體攻擊只剩 40%，浮上來那一下 ×1.15）・構造體 架盾（每 4 次行動一次，受到的傷害 −50%）
      人類 順手牽羊（偷錢後下一回合逃跑；逃掉就拿不回來）・不死 不死身（第一次倒下留 1 HP 躺一回合再站起來，30% HP；會心打倒就不會）
      精靈 虛影（下一步看不出來，物理攻擊 20% 穿過去）・龍 龍息（最強的招會蓄力）。 */

/* ---------- 種族習性：資料 ---------- */
const FAM_TRAIT14 = { beast: '群獵', insect: '孵化', plant: '扎根', bird: '高飛', ooze: '分裂', aquatic: '潛水', construct: '架盾', human: '順手牽羊', undead: '不死身', spirit: '虛影', dragon: '龍息' };
const FAM_TRAIT_D14 = { beast: '同伴倒下時，物攻 +1 階', insect: 'HP 40% 以下時孵出一隻同伴（一場一次）', plant: '一回合沒被打到，回合結束回 10% HP', bird: '飛上天的那回合物理攻擊 40% 落空，下一下俯衝 ×1.3',
  ooze: '一下被打掉 35% 以上的 HP 就分裂出一隻（一場一次）', aquatic: '潛水的那回合單體攻擊只剩 40% 傷害，浮上來那一下 ×1.15', construct: '每 4 次行動架一次盾：受到的傷害 −50%', human: '偷走金錢後下一回合逃跑（逃掉就拿不回來）',
  undead: '第一次倒下會躺一回合再站起來（30% HP）；被會心打倒就不會', spirit: '下一步看不出來；物理攻擊 20% 穿過去', dragon: '最強的招會先蓄力' };
const ST14 = (id, n, o) => defPut('statuses', id, { tags: o.tags || ['buff'], duration: o.dur || 'owner_actions', durDefault: o.durDefault || 1, stack: 'refresh', metadata: { n }, mods: o.mods || [], triggers: [], ...(o.tick ? { tick: o.tick } : {}), ...(o.clearAt ? { clearAt: o.clearAt } : {}), ...(o.block ? { blockAction: o.block } : {}) });
Object.assign(COND, {
  single14: c => !!c.skill && c.skill.target !== 'all_enemies',
  unhit14: c => !!c.owner && c.owner.data.hitR14 !== c.core.round,
  bigHit14: c => !!c.ev && !!c.owner && c.ev.payload.amount >= c.owner.max.hp * 0.35 && c.owner.res.hp > 0,
});
ST14('fly14', '高飛', { durDefault: 2, tick: 'owner_action_end', mods: [{ stage: 'defender', who: 'defender', accAdd: -40, cond: { cat: '物' } }, { stage: 'skill', who: 'attacker', mul: 1.3, cond: { hasPower: 1 } }] });
ST14('dive14', '潛水', { durDefault: 2, tick: 'owner_action_end', mods: [{ stage: 'final', who: 'defender', mul: 0.4, cond: { single14: 1, hasPower: 1 } }, { stage: 'skill', who: 'attacker', mul: 1.15, cond: { hasPower: 1 } }] });
ST14('cguard14', '架盾', { dur: 'until_own_action', clearAt: 'owner_action_start', mods: [{ stage: 'final', who: 'defender', mul: 0.5, cond: { hasPower: 1 } }] });
ST14('rise14', '倒地', { tags: ['debuff'], dur: 'battle', block: () => 'rise14' });
CANCEL_TXT.rise14 = '倒在地上，動也不動……';
// the actions (prio: they happen before the hero's hit, so what the icon promised is true for the whole round)
{ const mk = (id, n, d, eff, x = {}) => { MOVES[id] = { n, t: '一般', cat: x.pow ? '物' : '變', pow: x.pow || 0, acc: x.pow ? 100 : null, pp: 10, foe: 1, cls: x.pow ? 'strike' : 'buff', d, fx: x.fx };
    const D = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); if (!x.pow) { D.target = 'self'; D.noHitRoll = true; D.effects = []; D.tags = D.tags.filter(t => t !== 'damage'); }
    D.effects = (x.pow ? D.effects : []).concat(eff).map((ef, i) => effRegister('skill:' + id + '#x' + i, ef)); D.after = (D.after || []).map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); D.cooldown = 0; D.prio = x.prio ? 1 : 0;
    defPut('skills', id, { ...D, override: true }); };
  mk('f14_fly', '高飛', '飛到高空：這回合物理攻擊容易落空，下一下俯衝 ×1.3。', [{ type: 'status', target: 'self', status: 'fly14', dur: 2 }], { prio: 1, fx: MFX.m_featherGust ? 'm_featherGust' : undefined });
  mk('f14_dive', '潛水', '潛進水裡：這回合單體攻擊只剩 40%，浮上來那一下 ×1.15。', [{ type: 'status', target: 'self', status: 'dive14', dur: 2 }], { prio: 1, fx: MFX.m_dive ? 'm_dive' : undefined });
  mk('f14_guard', '架盾', '架起防禦：到下次行動前受到的傷害 −50%。', [{ type: 'status', target: 'self', status: 'cguard14' }], { prio: 1, fx: MFX.m_stoneWall ? 'm_stoneWall' : undefined });
  mk('f14_steal', '順手牽羊', '撞過來順手偷走錢。', [{ type: 'steal14' }], { pow: 30, fx: MFX.m_dirtyKick ? 'm_dirtyKick' : undefined }); }
for (const id of ['f14_fly', 'f14_dive', 'f14_guard', 'f14_steal']) { const src = MOVES[id].fx; if (src && MFX[src]) { MFX[id] = MFX[src]; MOVES[id].fx = id; } else delete MOVES[id].fx; }
const msg14 = (core, u, text) => core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: null, text } });
Object.assign(EFFECT_TYPES, {
  steal14: { exec(core, ef, ctx) { const u = ctx.owner, before = core.data.stolen || 0; EFFECT_TYPES.steal_gold.exec(core, { pct: 0.04, min: Math.max(20, u.lv * 6) }, ctx, core.foesOf(u)); const g = (core.data.stolen || 0) - before;
    if (g > 0) { u.data.stole14 = (u.data.stole14 || 0) + g; msg14(core, u, u.name + '偷走了 ' + g + ' G！（在牠逃跑前打倒牠就拿得回來）'); } } },
  mark14: { exec(core, ef, ctx) { ctx.owner.data.hitR14 = core.round; } },
  hatch14: { exec(core, ef, ctx) { const u = ctx.owner; if (u.data.hatch14) return; u.data.hatch14 = 1; const n0 = core.alive(u.side).length;
    EFFECT_TYPES.summon.exec(core, { sp: u.sp, count: 1, kind: 'minion', maxSide: 3, lv: Math.max(1, u.lv - 5) }, ctx); if (core.alive(u.side).length > n0) msg14(core, u, '（' + u.name + '的身上孵出了一隻同伴！）'); } },
  split14: { exec(core, ef, ctx) { const u = ctx.owner; if (u.data.split14 || !core.isUp(u)) return; u.data.split14 = 1; const n0 = core.alive(u.side).length;
    EFFECT_TYPES.summon.exec(core, { sp: u.sp, count: 1, kind: 'minion', maxSide: 3, lv: Math.max(1, u.lv - 2) }, ctx); if (core.alive(u.side).length > n0) msg14(core, u, '（' + u.name + '被打得分裂成兩團！）'); } },
  fall14: { exec(core, ef, ctx) { const u = ctx.owner; u.data.rise14 = 1; core.applyStatus(u, u, 'rise14', { quiet: true }); msg14(core, u, '（' + u.name + '倒下了……可是好像還在動。）'); } },
  rise14: { exec(core, ef, ctx) { const u = ctx.owner; if (!core.hasStatus(u, 'rise14') || !core.isUp(u)) return; core.removeStatus(u, 'rise14', 'rise'); const need = Math.max(0, Math.round(u.max.hp * 0.3) - u.res.hp);
    msg14(core, u, '……' + u.name + '又站了起來！'); if (need > 0) EFFECT_TYPES.heal.exec(core, { type: 'heal', pct: need / u.max.hp, kind: 'regen', quiet: 1 }, ctx, [u]); } },
  thiefGone14: { exec(core, ef, ctx) { const u = ctx.owner; if (!u.data.stole14) return; core.data.stolen = Math.max(0, (core.data.stolen || 0) - u.data.stole14); msg14(core, null, '（' + u.name + '帶著 ' + u.data.stole14 + ' G 逃走了……）'); u.data.stole14 = 0; } },
});
// the family mechanics (one per family; keys keep the trigger counters apart)
defPut('mechanics', 'fam14_beast', { triggers: [{ key: 'f14beast', on: EVT.DOWN, phase: 'POST', cond: { tgtSide: 'ally', ownerAlive: 1 }, limit: { perBattle: 2 }, effects: [{ type: 'stage', target: 'self', stats: { atk: 1 } }, { type: 'message', target: 'self', text: '（同伴倒下了，牠的眼神變得兇狠！）' }] }] });
defPut('mechanics', 'fam14_insect', { triggers: [{ key: 'f14ins', on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.4, ownerAlive: 1, dataNot: ['hatch14', 1] }, effects: [{ type: 'hatch14' }] }] });
defPut('mechanics', 'fam14_plant', { triggers: [{ key: 'f14plHit', on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { hasPower: 1 }, effects: [{ type: 'mark14' }] },
  { key: 'f14plHeal', on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, unhit14: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.1, kind: 'regen' }] }] });
defPut('mechanics', 'fam14_ooze', { triggers: [{ key: 'f14ooze', on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { bigHit14: 1, dataNot: ['split14', 1] }, effects: [{ type: 'split14' }] }] });
defPut('mechanics', 'fam14_undead', { triggers: [{ key: 'f14undFall', on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { wouldKill: 1, tgtHpAbove1: 1, crit: 0, dataNot: ['rise14', 1] }, effects: [{ type: 'modify', leaveOne: 1, note: 'undying' }, { type: 'fall14' }] },
  { key: 'f14undRise', on: EVT.ROUND_START, phase: 'POST', cond: { ownerAlive: 1, ownerHasStatus: 'rise14' }, effects: [{ type: 'rise14' }] }] });
defPut('mechanics', 'fam14_spirit', { mods: [{ stage: 'defender', who: 'defender', accAdd: -20, cond: { cat: '物' } }], triggers: [] });
defPut('mechanics', 'fam14_human', { triggers: [{ key: 'f14thief', on: EVT.ESCAPE, phase: 'POST', role: 'tgt', whenDown: 1, effects: [{ type: 'thiefGone14' }] }] });
// who gets them: wild monsters only (not elites, bosses, summons, scripted units)
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s || kind !== 'wild' || s.data.script || (typeof window !== 'undefined' && window.NOFAM14)) return s;
    const fam = (SPECIES[sp] || {}).fam; if (!FAM_TRAIT14[fam]) return s;
    // v12.79: species that already have their own trick (v12.0.8b 招牌行為) of the same kind keep only that one: 分裂（史萊姆）・裝死（骷髏）・縮殼（烏龜・蝸牛）
    if (typeof BEH_OF12 !== 'undefined' && ['split', 'fake', 'shell'].includes(BEH_OF12[sp])) return s; s.data.fam14 = fam; const mech = s.data.mechanics || (s.data.mechanics = []);
    if (DEF.mechanics['fam14_' + fam] && !mech.includes('fam14_' + fam)) mech.push('fam14_' + fam);
    if (fam === 'dragon') { const b = huntBest11(s.skills), cid = b && huntClone11(b); if (cid) s.skills[s.skills.indexOf(b)] = cid; }
    return s; }; }
// the patterns that are actions (飛禽・水棲・構造體・人類): the n-th decision of the unit
{ const _d = BAI.decide; BAI.decide = function (core, u, o = {}) { const f = !u.hero && u.data.fam14;
    if (!f || o.extra || core.hasStatus(u, 'charging') || core.hasStatus(u, 'rise14')) return _d.call(this, core, u, o);
    const n = u.data.n14 = (u.data.n14 || 0) + 1, H = core.foesOf(u)[0], best = () => { const b = huntBest11(u.skills.filter(id => DEF.skills[id] && !DEF.skills[id].charge)); return b ? { type: 'skill', skill: b, targets: H ? [H.id] : [] } : null; };
    if (f === 'bird') { if (core.hasStatus(u, 'fly14')) return best() || _d.call(this, core, u, o); if (n % 4 === 2) return { type: 'skill', skill: 'f14_fly', targets: [u.id] }; }
    if (f === 'aquatic') { if (core.hasStatus(u, 'dive14')) return best() || _d.call(this, core, u, o); if (n % 4 === 2) return { type: 'skill', skill: 'f14_dive', targets: [u.id] }; }
    if (f === 'construct' && n % 4 === 3) return { type: 'skill', skill: 'f14_guard', targets: [u.id] };
    if (f === 'human') { if (u.data.stole14) return { type: 'flee' }; if (n === 2 && core.data.gold && core.data.gold() > 0 && !u.rare) return { type: 'skill', skill: 'f14_steal', targets: H ? [H.id] : [] }; }
    return _d.call(this, core, u, o); }; }

/* ---------- 下一步：魔物頭上的圖示 ---------- */
// v12.85: native 11px pixel icons in the game's own style (the smooth Codex AO icons did not fit — player)
const INT_PAL14 = {"w": "#f4f4fa", "s": "#b0b8d0", "g": "#7c84a0", "y": "#ffe070", "Y": "#d09a28", "n": "#b07040", "N": "#6a3c20", "o": "#ffb050", "O": "#e0602a", "r": "#ff5a48", "R": "#a82828", "G": "#7ae868", "E": "#2e9a40", "L": "#d0ffc0", "b": "#7ab8ff", "B": "#3a68d0", "c": "#d0f4ff", "p": "#c890ff", "P": "#7040b8", "q": "#e8d0ff", "d": "#c8cce0", "D": "#8a90a8", "m": "#f4ecd8", "M": "#c0ae88", "T": "#9ad048", "U": "#5a8a28"};
const INT_PX14 = {
  atk: PXS([".........k.", "........kwk", ".......kwsk", "......kwsk.", "...k.kwsk..", "..kYkwsk...", "...kYkk....", "..knkYk....", ".knk.k.....", "kYk........", ".k........."], INT_PAL14),
  heavy: PXS(["..k......k.", ".krk....kok", "krkrk..koOk", ".krk..koOk.", "..kk.koOk..", "..kYkoOk...", "...kYkk....", "..knkYk....", ".knk.k.....", "kYk........", ".k........."], INT_PAL14),
  buff: PXS([".....k.....", "....kLk....", "...kLGGk...", "..kLGGGEk..", ".kLGGGGEEk.", "..kkLGEkk..", "...kLGEk...", "...kLGEk...", "...kLGEk...", "...kEEEk...", "....kkk...."], INT_PAL14),
  debuff: PXS(["....kkk....", "...kqpPk...", "...kqpPk...", "...kqpPk...", "..kkqpPkk..", ".kqpppppPk.", "..kqpppPk..", "...kqpPk...", "....kPk....", ".....k.....", "..........."], INT_PAL14),
  ail: PXS([".....k.....", "....kTk....", "....kTk....", "...kTTTk...", "..kTTTTTk..", ".kTwTTTTTk.", ".kTwTTTTUk.", ".kTTTTTTUk.", "..kTTTTUk..", "...kUUUk...", "....kkk...."], INT_PAL14),
  heal: PXS(["....kkk....", "...kGGGk...", "...kGLGk...", ".kkkGGGkkk.", "kGGGGLGGGGk", "kGLLLLLLLGk", "kGGGGLGGGEk", "kEEEGGGEEEk", ".kkkGGEkkk.", "...kEEEk...", "....kkk...."], INT_PAL14),
  guard: PXS(["..kkkkkkk..", ".kYYYYYYYk.", ".kYbbcbBYk.", ".kYbbcbBYk.", ".kYcccccYk.", ".kYbbcbBYk.", "..kYbcBYk..", "..kYbcBYk..", "...kYbYk...", "....kYk....", ".....k....."], INT_PAL14),
  flee: PXS(["...........", "......k....", ".....kyk...", ".k..kkyyk..", "kdkkyyyyyk.", ".k.kyyyyyyk", "kdkkyyyyYk.", ".k..kkyYk..", ".....kYk...", "......k....", "..........."], INT_PAL14),
  summon: PXS(["....kkk....", "...kmmmk...", "..kmmmmmk..", ".kmmmmmmMk.", ".kmmmmmmMk.", "kmNmmmNmmMk", "kmmNmNmNmMk", "kmmmNmmmNMk", ".kmmmmmmMk.", "..kMMMMMk..", "...kkkkk..."], INT_PAL14),
  hide: PXS(["...kkkk....", "..kddddk...", ".kddkkddk..", "..kk.kddk..", "....kddk...", "...kddk....", "...kddk....", "....kk.....", "...kddk....", "...kddk....", "....kk....."], INT_PAL14),
  fly: PXS([".k.......k.", "kck.....kck", "kcck...kcck", "kcbck.kcbck", "kccbckcbcck", ".kcccbccck.", "..kccbcck..", "...kcbck...", "....kbk....", ".....k.....", "..........."], INT_PAL14),
  dive: PXS(["...........", "..kk...kk..", ".kbbk.kbbk.", "kbccbkbccbk", ".kkkbbbkkk.", "..kkkkkkk..", ".kBBk.kBBk.", "kBbbBkBbbBk", ".kkkBBBkkk.", "....kkk....", "..........."], INT_PAL14),
  steal: PXS(["....k.k....", "...kNkNk...", "....kNk....", "...kYYYk...", "..kYyyYYk..", ".kYyYYYYYk.", ".kYYYyYYYk.", ".kYYyYyYOk.", ".kYYYyYOOk.", "..kOOOOOk..", "...kkkkk..."], INT_PAL14),
  down: PXS(["..k........", ".kyk...k...", "kyyyk.kyk..", ".kyk.kyyyk.", "..kk..kyk..", "..kyk..k...", ".kyyyk.k...", "..kyk.kyk..", "...k.kyyyk.", "......kyk..", ".......k..."], INT_PAL14),
};
const INT_COL14 = { atk: '#ffffff', heavy: '#ffb050', buff: '#9af08a', debuff: '#d8b0ff', ail: '#c8f080', heal: '#8af0a0', guard: '#a8c8ff', flee: '#ffe080', summon: '#f0d8a0', hide: '#c8cce0', fly: '#9ae0ff', dive: '#8ad0ff', steal: '#ffd060', down: '#b0b0c0' };
const AIL_N14 = { psn: '毒', par: '麻痺', slp: '睡眠', brn: '灼傷', frozen: '凍結', bleed14: '流血', stun14: '暈眩', silence14: '沉默' }; // 退縮 is a small chance on many attacks: left out so the labels stay short
// what a planned command means for the hero
function intentOf14(core, u, cmd) {
  if (!cmd || !u || !core.isUp(u)) return null; if (core.hasStatus(u, 'rise14')) return { k: 'down', t: '倒地' };
  if (u.data.fam14 === 'spirit') return { k: 'hide', t: '' };
  if (cmd.type === 'flee') return { k: 'flee', t: u.data.stole14 ? '帶錢逃跑' : '逃跑' };
  if (cmd.type === 'defend') return { k: 'guard', t: '防禦' };
  if (cmd.type !== 'skill') return null; const D = DEF.skills[cmd.skill]; if (!D) return null;
  if (cmd.skill === 'f14_fly') return { k: 'fly', t: '高飛' }; if (cmd.skill === 'f14_dive') return { k: 'dive', t: '潛水' }; if (cmd.skill === 'f14_guard') return { k: 'guard', t: '架盾' };
  const E = (D.effects || []).concat(D.after || []).map(e => (typeof e === 'string' ? DEF.effects[e] : e) || {}), H = core.byId.H;
  if (D.charge && !core.hasStatus(u, 'charging')) return { k: 'heavy', t: '蓄力' };
  if (D.power && H && (cmd.targets || []).includes(H.id) || (D.power && D.target === 'all_enemies')) {
    let n = 0; try { const hits = D.hits ? Math.round((D.hits[0] + D.hits[1]) / 2) : 1; n = BR.damage(core, u, H, D, { preview: true, noCrit: true }).amount * hits; } catch (e) { n = 0; }
    const ail = E.find(e => e.type === 'status' && AIL_N14[e.status] && e.target !== 'self'); if (cmd.skill === 'f14_steal') return { k: 'steal', t: '偷錢 ' + n };
    return { k: n >= H.max.hp * 0.25 ? 'heavy' : 'atk', t: String(n) + (ail ? '+' + AIL_N14[ail.status] : '') }; }
  if (E.some(e => e.type === 'summon' || e.type === 'callTide14')) return { k: 'summon', t: '召喚' };
  if (E.some(e => e.type === 'heal')) return { k: 'heal', t: '補血' };
  const ail = E.find(e => e.type === 'status' && AIL_N14[e.status] && e.target !== 'self'); if (ail) return { k: 'ail', t: AIL_N14[ail.status] };
  if (E.some(e => e.type === 'stage' && e.stats && Object.values(e.stats).some(v => v < 0) && e.target !== 'self')) return { k: 'debuff', t: '削弱' };
  if (E.some(e => e.type === 'status' && /guard|wall|shield|barrier|ward/i.test(e.status || '')) || E.some(e => e.type === 'ward12')) return { k: 'guard', t: '架盾' };
  return { k: 'buff', t: '強化' };
}
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); const core = this.core; if (!core || !core.plan || (typeof FXT13 !== 'undefined' && FXT13.on)) return;
    for (const v of this.foes()) { const u = core.byId[v.id]; if (!u || v.gone || v.alpha < 0.5 || v.st.charging) continue; const I = intentOf14(core, u, core.plan[v.id] || (core.hasStatus(u, 'rise14') ? {} : null)); if (!I) continue;
      const iw = 9; // v12.85: pixel icons; v14.21: drawn 9×9 (were 11), the words 7 size centred, the box 11 high (was 13)
      const img = INT_PX14[I.k] || INT_PX14.atk, col = INT_COL14[I.k], tw = I.t ? Math.ceil(Font.width(I.t, 7)) + 3 : 0, w = iw + 2 + tw, X = Math.round(clamp(v.x + v.off.x - w / 2, 17, W - w - 2)), Y = Math.round(v.foot - v.bbh - 15 + v.sink * (v.sink < 0 ? 1 : 0));
      x.fillStyle = 'rgba(8,6,18,0.78)'; x.fillRect(X - 1, Y, w + 2, 11); x.fillStyle = I.k === 'heavy' ? '#ff9a40' : 'rgba(255,255,255,0.18)'; x.fillRect(X - 1, Y + 10, w + 2, 1);
      if (img) { x.imageSmoothingEnabled = false; x.drawImage(img, X, Y + 1, 9, 9); } if (I.t) Font.draw(x, I.t, X + iw + 2, Y + 5 - 8, col, UIC.textSh, 7); } }; }
// 高飛 floats the monster up, 潛水 sinks it (the image is clipped at its feet) with a ripple
{ const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) { for (const v of this.foes()) { if (v.A && v.A.state === 'faint') continue; const want = v.st.fly14 ? -20 : v.st.dive14 ? Math.round((v.bbh || 48) * 0.7) : 0;
      if (v.sink !== want && (v.st.fly14 || v.st.dive14 || v.lift14)) { v.sink += Math.sign(want - v.sink) * Math.min(3, Math.abs(want - v.sink)); v.lift14 = v.sink !== 0 ? 1 : 0; } }
    _dr.call(this, x); for (const v of this.foes()) if (v.st.dive14 && !v.gone) { const t = this.t || 0; for (let i = 0; i < 3; i++) { const r = 8 + ((t / 2 + i * 7) % 20); x.fillStyle = 'rgba(200,235,255,' + (0.6 - r / 40).toFixed(2) + ')'; x.fillRect(Math.round(v.x - r), Math.round(v.foot - 1), 2 * r, 1); } } }; }
// the first battle that shows them: one line of help
{ const H = Battle.prototype.handlers, _rs = H.ROUND_START; H.ROUND_START = function* (e, ...a) { yield* _rs.call(this, e, ...a); const f = (Game.st || {}).flags || {};
    if (!f.tutIntent14 && e.payload.round === 1 && !(typeof FXT13 !== 'undefined' && FXT13.on)) { f.tutIntent14 = 1; yield* this.msg('（魔物頭上的圖示是牠這回合要做的事。數字是預估傷害，橘色是重擊——這時候按「防禦」最划算。）', { hold: 90 }); } }; }

/* ---------- 說明 ---------- */
famText = function (sp) { const S = SPECIES[sp] || {}, F = FAMILIES[S.fam] || {}, beh = typeof BEH_OF12 !== 'undefined' ? BEH_OF12[sp] : null, own = beh && ['split', 'fake', 'shell'].includes(beh);
  const tr = S.boss || S.elite ? '' : (own ? '' : FAM_TRAIT14[S.fam] ? '・' + FAM_TRAIT14[S.fam] : '') + (beh && typeof BEH_N12 !== 'undefined' ? '・' + BEH_N12[beh] : '');
  return (F.n || '') + tr + (F.immune && F.immune.length ? '　不會' + F.immune.map(q => IMM_N14[q] || q).join('・') : ''); };
dexWeak11 = function (sp) { return famText(sp) || '—'; };
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.unshift(['魔物的下一步', ['每隻魔物頭上的圖示，是牠這回合要做的事：劍＝攻擊（數字是預估傷害，橘色是重擊，最好防禦）、綠箭頭＝強化、紫箭頭＝削弱、毒滴＝異常、十字＝補血、盾＝架盾、黃箭頭＝逃跑。',
  '種族習性：' + Object.keys(FAM_TRAIT14).filter(k => FAMILIES[k]).map(k => FAMILIES[k].n + '「' + FAM_TRAIT14[k] + '」' + FAM_TRAIT_D14[k]).join('；') + '。（菁英・頭目照自己的打法）']]);
if (typeof GROW12 !== 'undefined') GROW12.push(['魔物的下一步', '戰鬥中魔物頭上會顯示牠這回合要做的事和預估傷害。橘色的重擊就防禦；要逃跑的小偷、會分裂的軟泥、躲起來的鳥和魚，先處理誰都不一樣。每個種族都有自己的習性，看圖鑑的種族欄。']);
