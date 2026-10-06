/* ===================== v12.78 戰鬥 B：新異常（流血・暈眩・沉默）＋各樹的接招 =====================
   玩家 2026-10-07：「拿掉屬性後異常狀態不多了吧？」→ 主角能上的異常補回來，而且都不帶屬性；每棵樹「先鋪後收」：
   · 流血：牠每次行動完扣最大 HP 5%（菁英・頭目 1.5%），3 次行動。劍・雙劍上，流光連斬・幻影連斬吃。短刀的千刃亂舞也會引爆。
   · 暈眩：跳過下一次行動（菁英・頭目改成延後）。斧的碎盾擊、拳套的震山擊、雙盾擊、盾撞。看到頭上是重擊就打暈牠。
   · 沉默：2 次行動只能用最弱的招（菁英・頭目 1 次、打斷不了蓄力）。法杖的魔力衝擊；擋下補血、強化、上異常。
   · 拳套：震山擊對裂甲 ×1.3（碎殼掌先上裂甲）；法杖：魔力槍對魔防下降 ×1.4（魔力風暴先降魔防）。 */
Object.assign(COND, {
  ownerBig14: (c, v) => !!c.owner && !!(c.owner.boss || c.owner.elite) === !!v,
  tgtSpdDown14: (c, v) => !!c.tgt && (((c.core.statusOf(c.tgt, 'stage_spd') || {}).stacks || 0) < 0) === !!v,
});
defPut('statuses', 'bleed14', { tags: ['debuff', 'dot'], duration: 'owner_actions', durDefault: 3, tick: 'owner_action_end', stack: 'refresh', metadata: { n: '流血' }, mods: [],
  triggers: [{ key: 'bleed14a', on: EVT.ACTION_END, phase: 'POST', role: 'src', cond: { ownerAlive: 1, ownerBig14: 0 }, effects: [{ type: 'damage', target: 'self', pctMax: 0.05, kind: 'dot', tags: ['dot'] }] },
    { key: 'bleed14b', on: EVT.ACTION_END, phase: 'POST', role: 'src', cond: { ownerAlive: 1, ownerBig14: 1 }, effects: [{ type: 'damage', target: 'self', pctMax: 0.015, kind: 'dot', tags: ['dot'] }] }] });
defPut('statuses', 'stun14', { tags: ['debuff'], duration: 'next_action', stack: 'none', metadata: { n: '暈眩' }, blockAction: (core, u) => { core.removeStatus(u, 'stun14', 'used'); return 'stun14'; } });
defPut('statuses', 'silence14', { tags: ['debuff'], duration: 'owner_actions', durDefault: 2, tick: 'owner_action_end', stack: 'refresh', metadata: { n: '沉默' }, mods: [], triggers: [] });
CANCEL_TXT.stun14 = '頭昏眼花，無法行動！';
Object.assign(STATUS_INFO, { bleed: ['血', '#d03848'], stun: ['暈', '#d8a820'], silence: ['默', '#8a64d0'] }); // the text badge if the icon is missing
Object.assign(BADGE_OF, { bleed14: 'bleed', stun14: 'stun', silence14: 'silence' }); // v12.79: Codex task AO icons
if (typeof BUFF12 !== 'undefined') Object.assign(BUFF12, { bleed14: { n: '流血', k: 'deb', tip: '每次行動扣血' }, stun14: { n: '暈眩', k: 'deb', tip: '跳過下一次行動' }, silence14: { n: '沉默', k: 'deb', tip: '只能用最弱的招' },
  fly14: { n: '高飛', k: 'spd', tip: '物理 40% 落空・下一下 ×1.3' }, dive14: { n: '潛水', k: 'def', tip: '單體攻擊只剩 40%' }, cguard14: { n: '架盾', k: 'def', tip: '受傷 −50%' }, rise14: { n: '倒地', k: 'deb', tip: '下回合會站起來' } });
// 沉默: a silenced monster only uses its weakest damaging move (a charge it already started still goes off)
{ const _d = BAI.decide; BAI.decide = function (core, u, o = {}) { if (u.hero || !core.hasStatus(u, 'silence14') || core.hasStatus(u, 'charging')) return _d.call(this, core, u, o);
    const H = core.foesOf(u)[0], dm = u.skills.filter(id => DEF.skills[id] && DEF.skills[id].power && !DEF.skills[id].charge).sort((a, b) => DEF.skills[a].power - DEF.skills[b].power);
    const id = dm[0] || (DEF.skills.m_tackle ? 'm_tackle' : null); return id ? { type: 'skill', skill: id, targets: H ? [H.id] : [] } : { type: 'wait' }; }; }

/* ---------- 各樹的接招 ---------- */
const STUN14 = p => [{ type: 'status', status: 'stun14', chance: p, secondary: true, cond: { tgtAlive: 1, tgtBig: 0 } }, { type: 'status', status: 'delay', chance: p, secondary: true, cond: { tgtAlive: 1, tgtBig: 1 } }];
const SIL14 = p => [{ type: 'status', status: 'silence14', chance: p, secondary: true, dur: 2, cond: { tgtAlive: 1, tgtBig: 0 } }, { type: 'status', status: 'silence14', chance: p, secondary: true, dur: 1, cond: { tgtAlive: 1, tgtBig: 1 } }];
function combo14(id, o) { const D = DEF.skills[id]; if (!D) { bvErr('v12.78', 'skill ' + id); return; } let k = 0; const reg = ef => effRegister('skill:' + id + '#b' + (k++), ef);
  if (o.dropStatus) D.effects = D.effects.filter(e => (effGet(e) || {}).status !== o.dropStatus);
  if (o.addEffects) D.effects = D.effects.concat(o.addEffects.map(reg));
  if (o.addAfter) D.after = (D.after || []).concat(o.addAfter.map(reg));
  if (o.mods) D.mods = (D.mods || []).concat(o.mods);
  if (o.desc) { D.desc = o.desc; if (MOVES[id]) MOVES[id].d = o.desc; const T = treeOf11(id); if (T) { const r = TREE11[T[0]].sk.find(r => 't_' + r[1] === id); if (r) r[8] = o.desc; } } }
combo14('t_sdTwin', { addEffects: [{ type: 'status', status: 'bleed14', chance: 0.3, secondary: true, cond: { tgtAlive: 1 } }], desc: '兩段快斬，每段 30% 流血；自己速度 +1。' });
combo14('t_sdFlow', { mods: [MUL11(1.3, { tgtStatus: 'bleed14' })], desc: '五段連斬；對流血的對手每段 ×1.3，會心的那段對護盾傷害再 ×1.5。' });
combo14('t_dsMoon', { addEffects: [{ type: 'status', status: 'bleed14', chance: 0.25, secondary: true, cond: { tgtAlive: 1 } }], desc: '兩把劍交叉斬，會心率 +15%，每段 25% 流血。' });
combo14('t_dsPhantom', { mods: [MUL11(1.25, { tgtStatus: 'bleed14' })], desc: '六段連斬；每次會心，後面每段威力 +10%；對流血的對手每段 ×1.25。' });
combo14('t_axCrush', { addEffects: STUN14(0.4), desc: '對護盾傷害 ×3，40% 暈眩（菁英・頭目：延後）。' });
combo14('t_fsThrough', { dropStatus: 'flinch', addEffects: STUN14(0.5), mods: [MUL11(1.3, { tgtStatus: 'crack11' })], desc: '用肩膀整個人撞上去，無視 40% 物防，50% 暈眩（菁英・頭目：延後）；對裂甲的對手威力 ×1.3。' });
combo14('t_stImpact', { dropStatus: 'flinch', addEffects: SIL14(0.4), desc: '40% 沉默（2 次行動只能用最弱的招；菁英・頭目 1 次）；對蓄力中的對手威力 ×1.5。' });
combo14('t_stLance', { mods: [MUL11(1.4, { tgtSpdDown14: 1 })], desc: '魔力凝成的長槍，50% 讓對手魔防 −1；對魔防下降的對手威力 ×1.4。' });
combo14('t_shBash', { dropStatus: 'flinch', addEffects: STUN14(0.35), desc: '用兩面盾砸，35% 暈眩（菁英・頭目：延後）。' });
combo14('t_osBash', { dropStatus: 'flinch', addEffects: STUN14(0.35), desc: '用盾撞過去（攻擊力加上物防的 70%），35% 暈眩（菁英・頭目：延後）。' });
combo14('t_dgBloom', { addAfter: [{ type: 'damage', target: 'cast_targets', power: 40, cond: { tgtStatus: 'bleed14', tgtAlive: 1 }, kind: 'burst11' }, { type: 'remove_status', target: 'cast_targets', status: 'bleed14', why: 'burst11' }],
  desc: '五段亂斬；最後引爆對手身上的中毒、麻痺、灼傷、流血，每一種追加威力 40 的傷害並消除。' });
// the intent icon: a stunned monster shows 「暈眩」, a silenced one keeps its (weak) attack
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { if (u && core.hasStatus(u, 'stun14')) return { k: 'down', t: '暈眩' }; return _io(core, u, cmd); }; }
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(q => q[0] === '魔物的下一步'); if (P) P[1].push('異常：流血（每次行動扣血）・暈眩（跳過下一次行動，菁英・頭目延後）・沉默（只能用最弱的招）。看到重擊就打暈牠，看到補血・強化就讓牠沉默。'); }
if (typeof GROW12 !== 'undefined') GROW12.push(['接招', '每棵技能樹都有「先鋪後收」：劍・雙劍先上流血，流光連斬・幻影連斬吃流血；斧・拳套・盾能打暈；法杖能讓魔物沉默，魔力槍吃魔防下降；拳套的震山擊吃裂甲；短刀吃中毒，千刃亂舞一次引爆。']);
// the new statuses on screen: a little pixel animation and one line (state, not names of moves)
{ const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) {
    const id = P && P.status; if (!t || P.failed || P.cleared || !['bleed14', 'stun14', 'silence14', 'fly14', 'dive14', 'cguard14'].includes(id)) return yield* _ap.call(this, e, s, t, P);
    t.st[id] = P.stacks ?? 1; const C = this.center(t), head = { x: C.x, y: Math.round(t.foot - t.bbh) };
    if (id === 'bleed14') { Sound.sfx('slash'); for (let i = 0; i < 6; i++) this.spawn({ k: 'p13px', x: C.x + rnd(-8, 8), y: C.y + rnd(-10, 4), vx: rnd(-10, 10) / 10, vy: -rnd(4, 14) / 10, g: 0.14, s: 2, cols: ['#ff6a6a', '#d03848', '#7a1020'], o: '#2a0408', life: 22, delay: i }); yield* this.msg(t.n + '流血了！', { hold: 18 }); }
    if (id === 'stun14') { Sound.sfx('hit'); for (let i = 0; i < 3; i++) { const p = PX13.spr(this, PXI.dizzy, head, { sc: 2, life: 30 }); p.upd = q => { const an = q.t * 0.25 + i * 2.09; q.x = head.x + Math.cos(an) * 12; q.y = head.y - 4 + Math.sin(an) * 4; }; } yield* wait(10); yield* this.msg(t.n + '暈頭轉向了！（跳過下一次行動）', { hold: 22 }); }
    if (id === 'silence14') { Sound.sfx('statDown'); const c = ['#c8a0ff', '#ffffff', '#1a0838']; PX13.line(this, { x: head.x - 7, y: head.y + 4 }, { x: head.x + 7, y: head.y + 14 }, c, 3, 26); PX13.line(this, { x: head.x + 7, y: head.y + 4 }, { x: head.x - 7, y: head.y + 14 }, c, 3, 26, { delay: 3 }); yield* wait(8);
      yield* this.msg(t.n + '被沉默了！（只能用最弱的招）', { hold: 22 }); }
    if (id === 'fly14') yield* this.msg(t.n + '飛上了高空！', { hold: 16 });
    if (id === 'dive14') yield* this.msg(t.n + '潛進了水裡！', { hold: 16 });
    if (id === 'cguard14') yield* this.msg(t.n + '架起了防禦！', { hold: 16 }); }; }
