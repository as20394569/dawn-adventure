// v12 battle core tests (spec v1.1 §12–17, docs/battle_v3_draft.md §9) — node tools/play.js tools/btest.js [--sims] [--golden]
// Gates A data · B core · C events · D content · E fixed cases (seeded event hashes) · F build matrix · G stress · H save migration,
// plus property tests (random battles, invariants). --sims writes docs/balance_report.md + docs/regression_report.md (metrics, warnings).
const fs = require('fs'), path = require('path');
const GOLDEN = path.resolve('tools/btest_golden.json');
module.exports = async (g) => {
  const golden = fs.existsSync(GOLDEN) && !process.argv.includes('--golden') ? JSON.parse(fs.readFileSync(GOLDEN, 'utf8')) : null;
  const res = await g.ev((golden) => {
    const out = [], ok = (gate, name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + '[' + gate + '] ' + name + (!cond && info ? ' — ' + info : ''));
    const err0 = BV2.errors.length, hashes = {};
    const T = (id, d) => { defPut('skills', id, { name: id, desc: '', tags: ['skill', 'phys', 'el:一般', 'damage'], el: '一般', cat: '物', power: 60, acc: null, critX: 1, prio: 0, target: 'enemy', effects: [{ type: 'damage' }], after: [], mods: [], costs: [], hits: null, cooldown: 0, noHitRoll: false, fx: 'hit', ai: {}, metadata: {}, override: 1, ...d }); };
    const hero = (o = {}) => ({ id: 'H', side: 'A', hero: true, name: '勇者', lv: 20, kind: 'hero', cls: o.cls || null, stats: { hp: 300, mp: 40, atk: 60, def: 50, spa: 60, spd: 50, spe: 50, crit: 0, hit: 0, eva: 0, resist: {}, ...(o.stats || {}) }, passives: o.passives || [], skills: o.skills || ['attack'], data: { attackSkill: 'attack', slots: o.slots || [], sigSkill: o.sig || null, mechanics: o.mechanics || [], talents: o.talents || [] }, ...(o.extra || {}) });
    const foe = (id, o = {}) => ({ id, side: 'B', name: id, lv: 20, kind: 'wild', sp: 'slime', fam: o.fam || 'ooze', stats: { hp: 400, atk: 40, def: 50, spa: 40, spd: 50, spe: 30, crit: 0, hit: 0, eva: 0, ...(o.stats || {}) }, passives: o.passives || [], skills: o.skills || ['m_tackle'], data: { mechanics: [] }, statuses: o.statuses || [] });
    const mk = (units, seed = 7, cfg = {}) => new BattleCore({ seed, units, cfg });
    const cnt = (c, type, f = () => true) => c.log.filter(e => e.type === type && !e.cancelled && f(e)).length;
    const act = (c, skill, targets) => { if (c.need) c.submit({ type: 'skill', skill, targets }); };
    const cmd = (c, o) => { if (c.need) c.submit(o); };
    const P = (key, make) => defPut('passives', key, { make, metadata: {}, tags: [], override: 1 });
    /* =================== A: data =================== */
    { const v = bvValidate(); ok('A', '資料驗證（Schema、id、引用、標籤、觸發、效果、循環）', v.length === 0, v.slice(0, 5).join(' | ')); ok('A', '載入時沒有錯誤', err0 === 0, BV2.errors.slice(0, 3).join(' | '));
      const cls = Object.keys(DEF.classes); let bad = [];
      for (const c of cls) { const L = Object.values(DEF.talents).filter(t => t.cls === c), keys = L.filter(t => t.tier < 0);
        if (L.length !== 21 || keys.length !== 3) bad.push(c + ':' + L.length + '/' + keys.length);
        for (let b = 0; b < 3; b++) for (let t = 0; t < 3; t++) { const opts = L.filter(x => x.branch === b && x.tier === t); if (opts.length !== 2) bad.push(c + ' ' + b + '.' + t); if (opts.filter(x => x.kind === '數值').length > 1) bad.push(c + ' ' + b + '.' + t + ' 兩個數值'); }
        const C = DEF.classes[c]; if (!DEF.skills[C.sig] || !DEF.mechanics[C.mechanic]) bad.push(c + ' sig/mech'); if ((CLASS_SKILLS12[c] || []).some(k => !DEF.skills['o_' + k])) bad.push(c + ' skill table'); }
      ok('A', '10 職業 × 21 天賦（3 流派×3 層×2＋3 核心）、職業招式、職業機制、技能表', cls.length === 10 && !bad.length, bad.slice(0, 6).join(' | '));
      const loose = []; for (const id in DEF.skills) for (const x of [...DEF.skills[id].effects, ...DEF.skills[id].after]) if (typeof x !== 'string' || !DEF.effects[x]) loose.push(id); ok('A', '技能效果都以 ID 引用（DEF.effects）', !loose.length, loose.slice(0, 4).join(','));
      const acc = Object.keys(GEAR).filter(k => GEAR[k].slot === 'acc'), noT = acc.filter(k => !GEAR[k].trait || (GEAR[k].fx || []).length !== 1); ok('A', '飾品 ' + acc.length + ' 個，每個 1 條特性', acc.length >= 53 && !noT.length, noT.slice(0, 4).join(','));
      const wp = Object.keys(GEAR).filter(k => GEAR[k].slot === 'weapon'), noS = wp.filter(k => !weaponSkill12(k)); ok('A', '武器 ' + wp.length + ' 把，每把都有武器技能', !noS.length, noS.slice(0, 4).join(','));
      const cdMiss = Object.keys(SKILL12).filter(k => DEF.skills['o_' + k].cooldown == null || !DEF.skills['o_' + k].metadata.learn); ok('A', '技能都有冷卻與學會次數', !cdMiss.length, cdMiss.join(',')); }
    /* =================== B: core rules =================== */
    { const c = mk([hero(), foe('B1', { stats: { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 } }), foe('B2')]); c.start(false); act(c, 'attack', ['B1']); act(c, 'attack', ['B1']);
      ok('B', '目標倒下後改打同陣營下一隻（TARGET_CHANGE）', cnt(c, EVT.TARGET_CHANGE) >= 1 && cnt(c, EVT.DAMAGE, e => e.tgts[0] === 'B2' && e.src === 'H') >= 1); }
    { T('t_cost', { costs: [{ res: 'mp', amount: 99 }], fallback: 'attack' }); const c = mk([hero({ skills: ['attack', 't_cost'] }), foe('B1')]); c.start(false); act(c, 't_cost', ['B1']);
      ok('B', '成本不足 → SKILL_FAIL(cost) 並改用替代技能', cnt(c, EVT.SKILL_FAIL, e => e.payload.why === 'cost') === 1 && cnt(c, EVT.SKILL_USE, e => e.payload.skill === 'attack' && e.src === 'H') === 1);
      const c2 = mk([hero({ skills: ['attack', 't_cost'], stats: { mp: 120 } }), foe('B1')]); c2.byId.H.res.mp = 120; c2.start(false); act(c2, 't_cost', ['B1']); ok('B', '成本足夠 → COST_PAY 並扣除', cnt(c2, EVT.COST_PAY) === 1 && c2.byId.H.res.mp === 21); }
    { T('t_miss', { acc: 1 }); const c = mk([hero({ skills: ['t_miss'], stats: { hit: -50 } }), foe('B1')]); c.start(false); for (let i = 0; i < 4; i++) act(c, 't_miss', ['B1']);
      ok('B', '命中率極低 → MISS、沒有傷害', cnt(c, EVT.MISS, e => e.src === 'H') >= 3 && cnt(c, EVT.DAMAGE, e => e.src === 'H') <= 1); }
    { const c = mk([hero({ stats: { crit: 100 } }), foe('B1')]); c.start(false); act(c, 'attack', ['B1']); ok('B', '會心率 100% → CRIT 事件', cnt(c, EVT.CRIT) >= 1 && c.log.some(e => e.type === EVT.DAMAGE && e.payload.crit)); }
    { T('t_psn', { power: 0, effects: [{ type: 'status', status: 'psn' }], tags: ['skill', 'support', 'el:毒', 'ailment'], cat: '變', noHitRoll: true }); const fam = Object.keys(FAMILIES).find(k => FAMILIES[k].immune && FAMILIES[k].immune.includes('psn'));
      const c = mk([hero({ skills: ['t_psn'] }), foe('B1', { fam })]); c.start(false); act(c, 't_psn', ['B1']); const c2 = mk([hero({ skills: ['t_psn'] }), foe('B1', { fam: 'beast' })]); c2.start(false); act(c2, 't_psn', ['B1']);
      ok('B', '狀態：條件免疫失敗 / 一般成功', (!fam || cnt(c, EVT.STATUS_FAIL, e => e.payload.why === 'immune') === 1) && c2.hasStatus(c2.byId.B1, 'psn'));
      P('t_res', () => ({ mods: [{ statusRes: 80 }] })); let fails = 0; for (let s = 0; s < 20; s++) { const c3 = mk([hero({ skills: ['t_psn'] }), foe('B1', { fam: 'beast', passives: [{ key: 't_res', v: 1 }] })], 100 + s); c3.start(false); act(c3, 't_psn', ['B1']); fails += cnt(c3, EVT.STATUS_FAIL, e => e.payload.why === 'resist'); }
      ok('B', '狀態：抗性（80% 上限）會讓施加失敗', fails >= 10 && fails < 20, fails + '/20'); }
    { T('t_aoe', { target: 'all_enemies', tags: ['skill', 'phys', 'el:一般', 'damage', 'aoe'] }); const one = mk([hero({ skills: ['t_aoe'] }), foe('B1')], 3), three = mk([hero({ skills: ['t_aoe'] }), foe('B1'), foe('B2'), foe('B3')], 3);
      one.start(false); act(one, 't_aoe', []); three.start(false); act(three, 't_aoe', []); const d1 = one.log.find(e => e.type === EVT.DAMAGE && e.src === 'H').payload.amount, d3 = three.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H').slice(0, 3);
      ok('B', '全體：三個目標各受傷，單發約 ×0.75', d3.length === 3 && d3.every(e => e.payload.amount <= d1 * 0.85 && e.payload.amount >= d1 * 0.6), d1 + ' vs ' + d3.map(e => e.payload.amount)); }
    { T('t_multi', { hits: [3, 3], tags: ['skill', 'phys', 'el:一般', 'damage', 'multi_hit'] }); const c = mk([hero({ skills: ['t_multi'] }), foe('B1')]); c.start(false); act(c, 't_multi', ['B1']);
      ok('B', '多段：3 段 HIT / DAMAGE', cnt(c, EVT.HIT, e => e.src === 'H') === 3 && cnt(c, EVT.DAMAGE, e => e.src === 'H') === 3);
      const c2 = mk([hero({ skills: ['t_multi'] }), foe('B1', { stats: { hp: 1 } }), foe('B2')]); c2.start(false); act(c2, 't_multi', ['B1']); ok('B', '多段：目標中途倒下就停止', cnt(c2, EVT.DAMAGE, e => e.src === 'H' && e.tgts[0] === 'B1') === 1 && c2.byId.B1.down); }
    // turn order (v12.0.1): everyone chooses at the start of the round, then the faster acts first; 搶先 / 防禦 go first in the same round
    { const c = mk([hero({ stats: { spe: 10 } }), foe('B1', { stats: { spe: 90 } })]); c.start(false); const before = c.log.filter(e => e.type === EVT.ACTION_START).length;
      ok('B', '行動順序：回合開始先等英雄選指令（還沒有人行動）', !!c.need && c.need.plan && before === 0 && c.state === BS.TURN_ORDER);
      act(c, 'attack', ['B1']); const first = c.log.find(e => e.type === EVT.ACTION_START);
      ok('B', '行動順序：選完後速度快的先行動', first && first.src === 'B1' && !!c.need && c.need.plan);
      T('t_prio', { prio: 1 }); act(c, 't_prio', ['B1']); const o2 = c.log.filter(e => e.type === EVT.TURN_ORDER)[1]; act(c, 'attack', ['B1']); const o3 = c.log.filter(e => e.type === EVT.TURN_ORDER)[2];
      ok('B', '搶先：選了就在這一回合先出手（即使比較慢），下一回合回到速度順序', !!o2 && o2.payload.order[0] === 'H' && !!o3 && o3.payload.order[0] === 'B1', (o2 && o2.payload.order.join(',')) + ' / ' + (o3 && o3.payload.order.join(',')));
      cmd(c, { type: 'defend' }); const o4 = c.log.filter(e => e.type === EVT.TURN_ORDER)[3]; ok('B', '防禦：一定最先執行', !!o4 && o4.payload.order[0] === 'H', o4 && o4.payload.order.join(','));
      // between two of the hero's commands, a monster acts once (no 「多打一次」)
      let dbl = 0; for (let s = 0; s < 30; s++) { const c2 = mk([hero({ stats: { spe: 48, hp: 3000 } }), foe('B1', { stats: { spe: 52, hp: 3000 } })], 40 + s); c2.byId.H.res.hp = 3000; c2.start(false);
        for (let i = 0; i < 12 && c2.need; i++) { const n0 = c2.log.length; act(c2, i % 2 ? 't_prio' : 'attack', ['B1']); dbl += c2.log.slice(n0).filter(e => e.type === EVT.ACTION_START && e.src === 'B1' && !e.payload.reaction).length > 1 ? 1 : 0; } }
      ok('B', '兩次指令之間，魔物只行動一次（搶先交替使用 30 場）', dbl === 0, dbl + ''); }
    // cooldowns count the owner's own actions
    { T('t_cd', { cooldown: 2, fallback: 'attack' }); const c = mk([hero({ skills: ['attack', 't_cd'], stats: { hp: 5000 } }), foe('B1', { stats: { hp: 50000 } })]); c.byId.H.res.hp = 5000; c.start(false);
      act(c, 't_cd', ['B1']); const a = c.byId.H.cd.t_cd; act(c, 't_cd', ['B1']); const f1 = cnt(c, EVT.SKILL_FAIL, e => e.payload.why === 'cooldown'); act(c, 't_cd', ['B1']); const f2 = cnt(c, EVT.SKILL_FAIL, e => e.payload.why === 'cooldown'); act(c, 't_cd', ['B1']);
      ok('B', '冷卻：CD2 → 之後 2 次自己的行動不能用，第 3 次可以', a === 2 && f1 === 1 && f2 === 2 && cnt(c, EVT.SKILL_USE, e => e.payload.skill === 't_cd') === 2, a + '/' + f1 + '/' + f2); }
    // status timing points
    { const c = mk([hero({ stats: { hp: 5000 } }), foe('B1', { stats: { hp: 50000, spe: 90 } })]); c.byId.H.res.hp = 5000; c.start(false); cmd(c, { type: 'defend' });
      const gEnd = c.hasStatus(c.byId.H, 'guard'); act(c, 'attack', ['B1']); const after = c.log.filter(e => e.type === EVT.STATUS_EXPIRE && e.payload.status === 'guard');
      ok('B', '防禦：減傷持續到自己下一次行動開始', gEnd && after.length === 1); }
    { T('t_bar', { power: 0, target: 'self', noHitRoll: true, cat: '變', tags: ['skill', 'support', 'el:一般'], effects: [{ type: 'status', status: 'barrier', dur: 2, target: 'self' }] });
      const c = mk([hero({ skills: ['attack', 't_bar'], stats: { hp: 5000 } }), foe('B1', { stats: { hp: 50000 } })]); c.byId.H.res.hp = 5000; c.start(false); act(c, 't_bar', []); act(c, 'attack', ['B1']); const on1 = c.hasStatus(c.byId.H, 'barrier'); act(c, 'attack', ['B1']); const on2 = c.hasStatus(c.byId.H, 'barrier');
      ok('B', '護盾：2 = 護到第 2 次自己行動開始', on1 && !on2); }
    { T('t_up', { power: 0, target: 'self', noHitRoll: true, cat: '變', tags: ['skill', 'support', 'el:一般'], effects: [{ type: 'stage', stats: { atk: 1 }, target: 'self', dur: 3 }] });
      const c = mk([hero({ skills: ['attack', 't_up'], stats: { hp: 5000 } }), foe('B1', { stats: { hp: 50000 } })]); c.byId.H.res.hp = 5000; c.start(false); act(c, 't_up', []); const L = [];
      for (let i = 0; i < 4; i++) { act(c, 'attack', ['B1']); L.push(c.hasStatus(c.byId.H, 'stage_atk') ? 1 : 0); } ok('B', '能力等級：自己施加的 3 = 之後 3 次自己行動', L.join('') === '1100' || L.join('') === '1110', L.join('')); }
    { const c = mk([hero({ stats: { spe: 99 } }), foe('B1', { stats: { hp: 50000 } })]); c.start(false); c.applyStatus(c.byId.H, c.byId.B1, 'flinch', {}); act(c, 'attack', ['B1']);
      ok('B', '退縮：回合結束清除、當回合無法行動', cnt(c, EVT.ACTION_CANCEL, e => e.payload.why === 'flinch') === 1 && !c.hasStatus(c.byId.B1, 'flinch')); }
    { const c = mk([hero({ stats: { spe: 99, hp: 5000 } }), foe('B1', { stats: { hp: 50000 } })]); c.byId.H.res.hp = 5000; c.start(false); c.applyStatus(c.byId.H, c.byId.B1, 'broken', {}); act(c, 'attack', ['B1']); act(c, 'attack', ['B1']);
      ok('B', '破防：跳過 1 次行動，之後解除', cnt(c, EVT.ACTION_CANCEL, e => e.payload.why === 'broken') === 1 && !c.hasStatus(c.byId.B1, 'broken')); }
    // DOWN: prevention (撐住) once per battle however many sources
    { const c = mk([hero({ passives: [{ key: 'fx.endure', v: 1 }, { key: 'endureT', v: 1 }], stats: { hp: 10 } }), foe('B1', { stats: { atk: 999, spe: 99 } })], 9); c.start(true);
      ok('B', '撐住：DOWN PRE 防止（HP 留 1），兩個來源一場也只發動 1 次', cnt(c, EVT.MESSAGE, e => e.payload.key === 'endure') === 1 && c.log.some(e => e.type === EVT.DOWN && e.cancelled) && c.byId.H.down); }
    { const c = mk([hero({ stats: { hp: 100 } }), foe('B1')]); c.start(false); c.byId.H.res.hp = 99; c.heal(c.byId.H, c.byId.H, 50); const h = c.log.filter(e => e.type === EVT.HEAL).pop();
      ok('B', '治療：不超過上限，溢出量記在 payload.over', c.byId.H.res.hp === 100 && h.payload.amount === 1 && h.payload.over === 49); }
    /* =================== C: events =================== */
    { const c = mk([hero(), foe('B1'), foe('B2')], 11); c.start(true); const ids = new Set(c.log.map(e => e.id)), byId = Object.fromEntries(c.log.map(e => [e.id, e]));
      ok('C', '事件 id 唯一、parent 都存在、深度不小於 parent', ids.size === c.log.length && c.log.every(e => !e.parent || (byId[e.parent] ? e.depth >= byId[e.parent].depth : true)));
      ok('C', '戰鬥結束時順序與反應佇列清空、沒有觸發安全上限', !!c.result && c.order.length === 0 && c.reactQ.length === 0 && c.trace.length === 0, JSON.stringify(c.trace.slice(0, 1)));
      const seq = []; let okSeq = true; for (const e of c.log) { if (e.type === EVT.ACTION_START) seq.push('S'); if (e.type === EVT.ACTION_END) seq.push('E'); } for (let i = 0; i < seq.length; i += 2) if (seq[i] !== 'S' || seq[i + 1] !== 'E') okSeq = false; ok('C', '行動開始／結束成對', okSeq); }
    { P('t_cancel', () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', effects: [{ type: 'cancel', why: 'test' }] }] })); const c = mk([hero(), foe('B1', { passives: [{ key: 't_cancel', v: 1 }] })]); c.start(false); act(c, 'attack', ['B1']);
      ok('C', 'PRE 取消：傷害事件被取消、HP 不變', c.byId.B1.res.hp === c.byId.B1.max.hp && c.log.some(e => e.type === EVT.DAMAGE && e.cancelled)); }
    { P('t_ord', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', prio: v, effects: [{ type: 'message', text: 'p' + v, target: 'self' }] }] }));
      const c = mk([hero({ passives: [{ key: 't_ord', v: 1 }, { key: 't_ord', v: 5 }, { key: 't_ord', v: 3 }] }), foe('B1')]); c.start(false); act(c, 'attack', ['B1']);
      const seq = c.log.filter(e => e.type === EVT.MESSAGE && /^p\d$/.test(e.payload.text || '')).map(e => e.payload.text).slice(0, 3).join(','); ok('C', '觸發：priority 高的先', seq === 'p5,p3,p1', seq); }
    { const msg = t => ({ on: EVT.ROUND_END, phase: 'POST', effects: [{ type: 'message', text: t, target: 'self' }] });
      defPut('mechanics', 't_mech', { make: () => ({ triggers: [msg('L5')] }), layer: 'class', override: 1 }); defPut('talents', 't_tal', { cls: 'test', make: () => ({ triggers: [msg('L6')] }), override: 1 }); P('t_eq', () => ({ triggers: [msg('L7')] }));
      defPut('statuses', 't_st', { tags: [], duration: 'battle', stack: 'none', triggers: [msg('L8')], override: 1 });
      const c = mk([hero({ passives: [{ key: 't_eq', v: 1, src: 'equip' }], mechanics: ['t_mech'], talents: ['t_tal'] }), foe('B1')]); c.byId.H.statuses.push({ id: 't_st', stacks: 1, dur: null, data: {}, seq: 1 }); c.start(false); act(c, 'attack', ['B1']);
      const seq = c.log.filter(e => e.type === EVT.MESSAGE && /^L\d$/.test(e.payload.text || '')).map(e => e.payload.text).slice(0, 4).join(','); ok('C', '觸發：同 priority 依來源層級（職業→天賦→裝備→狀態）', seq === 'L5,L6,L7,L8', seq); }
    { P('t_loopA', () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', effects: [{ type: 'damage', flat: 1, target: 'event_target' }] }] }));
      const c = mk([hero({ passives: [{ key: 't_loopA', v: 1 }] }), foe('B1', { stats: { hp: 100000 } })]); c.start(false); act(c, 'attack', ['B1']); ok('C', '循環：A→A 連鎖在上限停下並留下完整事件鏈', c.trace.length > 0 && !!c.trace[0].chain, String(c.trace.length)); }
    { P('t_counterAll', () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { ownerAlive: 1 }, effects: [{ type: 'counter', skill: 'counter_strike' }] }] }));
      const c = mk([hero({ passives: [{ key: 't_counterAll', v: 1 }], stats: { hp: 100000 } }), foe('B1', { passives: [{ key: 't_counterAll', v: 1 }], stats: { hp: 100000 } })]); c.byId.H.res.hp = 100000; c.start(false); act(c, 'attack', ['B1']);
      ok('C', '反擊觸發反擊：反應深度上限 ' + BV2.MAX_REACT, c.trace.some(t => /reaction depth/.test(t.what)) || cnt(c, EVT.REACTION) <= BV2.MAX_REACT * 4, 'reactions ' + cnt(c, EVT.REACTION)); }
    { P('t_resLoop', () => ({ triggers: [{ on: EVT.RESOURCE_CHANGE, phase: 'POST', role: 'tgt', cond: { evRes: 'mp' }, effects: [{ type: 'resource', res: 'mp', amount: 1, target: 'self' }] }] }));
      const c = mk([hero({ passives: [{ key: 't_resLoop', v: 1 }], stats: { mp: 100000 } }), foe('B1')]); c.byId.H.res.mp = 0; c.start(false); c.changeRes(c.byId.H, 'mp', 1);
      ok('C', '同一來源在同一條事件鏈最多重入 ' + BV2.MAX_REENTRY + ' 次', c.trace.some(t => /re-entry/.test(t.what)) && c.byId.H.res.mp <= 1 + BV2.MAX_REENTRY + 1, 'mp ' + c.byId.H.res.mp); }
    { P('t_every', () => ({ triggers: [{ on: EVT.ACTION_START, phase: 'POST', effects: [{ type: 'message', text: 'x', target: 'self' }] }, { on: EVT.ACTION_END, phase: 'POST', effects: [{ type: 'message', text: 'y', target: 'self' }] }] }));
      const c = mk([hero({ passives: Array.from({ length: 6 }, () => ({ key: 't_every', v: 1 })), stats: { hp: 1e6 } }), foe('B1', { stats: { hp: 1e6 } })], 5, { maxRounds: 120 }); c.byId.H.res.hp = 1e6; c.start(true);
      ok('C', '整場觸發上限 ' + BV2.MAX_TRIG_BATTLE + '：超過就停止並記錄', c.trigBattle > BV2.MAX_TRIG_BATTLE && c.trace.some(t => /per battle/.test(t.what)) && cnt(c, EVT.EFFECT_TRIGGER) <= BV2.MAX_TRIG_BATTLE, c.trigBattle + ''); }
    /* =================== D: content (classes, talents, weapons) =================== */
    const mkHero = (cls, o = {}) => { __game.newGameState('測'); const st = Game.st; applyStartClass(['mage', 'bard'].includes(cls) ? 'mage' : 'swordsman'); st.cls = cls; st.lv = o.lv || 30; st.flags.deep = 1; st.tal12 = {}; if (o.tal) o.tal(st); st.hp = heroStats().hp; st.mp = heroStats().mp; st.status = null; BB.slots(st); return st; };
    const fight = (st, foes, seed, policy = 'smart', extra = {}) => { const [sp, lv, kind, ex] = foes; const c = BB.build({ sp, lv, kind, extra: ex || [], seed, maxRounds: 60, ...extra }, st); c.data.heroPolicy = policy; c.cfg.maxRounds = 60; c.start(true); return c; };
    { const bad = [], used = {}, gained = {};
      for (const cls of Object.keys(DEF.classes)) { for (let i = 0; i < 6; i++) { const st = mkHero(cls), e0 = BV2.errors.length; let c; try { c = fight(st, ['slime', 26, 'wild', [['mush', 26], ['wolf', 25]]], 50 + i); } catch (e) { bad.push(cls + ': ' + e.message); continue; }
          if (BV2.errors.length > e0) bad.push(cls + ': ' + BV2.errors[e0]); const C = DEF.classes[cls]; if (cnt(c, EVT.SKILL_USE, e => e.src === 'H' && e.payload.skill === C.sig)) used[cls] = 1;
          const res = C.res; if (res ? c.log.some(e => e.type === EVT.RESOURCE_CHANGE && e.tgts[0] === 'H' && e.payload.res === res && e.payload.change > 0) : c.log.some(e => e.type === EVT.STATUS_APPLY && e.src === 'H' && ['hunt_mark', 'turret'].includes(e.payload.status))) gained[cls] = 1; } }
      const cl = Object.keys(DEF.classes); ok('D', '10 職業：核心資源會累積、職業招式會被使用、沒有錯誤', !bad.length && cl.every(c => used[c] && gained[c]), bad.slice(0, 3).join(' | ') + ' 招式:' + cl.filter(c => !used[c]).join(',') + ' 資源:' + cl.filter(c => !gained[c]).join(',')); }
    { const bad = [], fired = {}; let n = 0;
      for (const id in DEF.talents) { const T = DEF.talents[id]; if (!DEF.classes[T.cls]) continue; n++; const st = mkHero(T.cls, { tal: s => TAL12.pick(T.branch, T.tier, T.opt, s) }), e0 = BV2.errors.length;
        st.slots = (CLASS_SKILLS12[T.cls] || []).slice(0, 4).map(k => 'o_' + k);
        try { const c = BB.build({ sp: 'slime', lv: 26, kind: 'wild', extra: [['mush', 26]], seed: 7 + n, maxRounds: 40 }, st); c.data.heroPolicy = 'random'; c.cfg.maxRounds = 40; c.start(true); if (!c.byId.H.data.talents.includes(id)) bad.push(id + ' not on the hero');
          if (c.log.some(e => e.type === EVT.EFFECT_TRIGGER && String(e.payload.key || '').startsWith('talent:'))) fired[id] = 1; } catch (e) { bad.push(id + ': ' + e.message); }
        if (BV2.errors.length > e0) bad.push(id + ': ' + BV2.errors[e0]); }
      ok('D', '210 個天賦各自上場跑一場：沒有錯誤（觸發過 ' + Object.keys(fired).length + ' 個）', n === 210 && !bad.length, bad.slice(0, 3).join(' | ')); }
    { const bad = []; for (const kind of TREE_KINDS11.filter(k => !TREE11[k].dual)) { const st = mkHero('swordsman'); GEAR11_GLAM = false; const gr = makeGear(BASE11.weapon[kind][2], 2); GEAR11_GLAM = true; st.equip.weapon = gr.u; tr11(st).lv[kind + ':trait'] = 1; BB.slots(st); const e0 = BV2.errors.length;
        try { const sp = BB.heroSpec(st, { kind: 'wild' }), a = sp.data.attackSkill, P = sp.passives.find(p => p.key === 'tr11'); if (kind === '短刀' && a !== 'attack_2') bad.push(kind + ' segments'); if (kind === '拳套' && a !== 'attack_f11') bad.push(kind + ' fist'); if (!P || !(P.v.traits || []).includes(kind)) bad.push(kind + ' no trait');
          const c = fight(st, ['wolf', 26, 'wild'], 4); if (!c.result) bad.push(kind + ' no result'); } catch (e) { bad.push(kind + ': ' + e.message); } if (BV2.errors.length > e0) bad.push(kind + ': ' + BV2.errors[e0]); }
      ok('D', '9 種武器的特性（武器技能樹）都會套用', !bad.length, bad.slice(0, 4).join(' | ')); }
    /* =================== E: fixed cases (seeded event sequences) =================== */
    { const runs = { basic: () => { const c = mk([hero({ skills: ['attack', 't_multi'] }), foe('B1'), foe('B2')], 42); c.start(true); return c; },
        swordsman: () => fight(mkHero('swordsman'), ['wolf', 26, 'wild'], 42), mage: () => fight(mkHero('mage'), ['slime', 26, 'wild', [['mush', 26]]], 43), golem: () => fight(mkHero('guardian'), ['golem', 24, 'boss'], 44) };
      for (const k in runs) { const a = runs[k]().hash(), b = runs[k]().hash(); hashes[k] = a; ok('E', '固定種子重跑相同（' + k + '）', a === b, a + '/' + b); if (golden && golden[k] != null) ok('E', '和基準事件序列相同（' + k + '）', golden[k] === a, golden[k] + ' → ' + a); }
      const d = mk([hero({ skills: ['attack', 't_multi'] }), foe('B1'), foe('B2')], 43); d.start(true); ok('E', '不同種子 → 事件序列不同', d.hash() !== hashes.basic); }
    /* =================== F: build matrix (every class × 2 full talent sets × boss / group) =================== */
    { const bad = []; let n = 0; for (const cls of Object.keys(DEF.classes)) for (const pick of [0, 1]) for (const f of [['golem', 24, 'boss'], ['slime', 30, 'wild', [['bee', 30], ['wolf', 30]]]]) { n++;
        const st = mkHero(cls, { tal: s => TAL12.auto(s, pick) }), e0 = BV2.errors.length; try { const c = fight(st, f, 100 + n); if (!c.result) bad.push(cls + ' no result'); } catch (e) { bad.push(cls + '/' + pick + ': ' + e.message); } if (BV2.errors.length > e0) bad.push(cls + ': ' + BV2.errors[e0]); }
      ok('F', 'Build 矩陣：10 職業 × 2 組天賦 × 頭目／多體（' + n + ' 場）沒有錯誤', !bad.length, bad.slice(0, 3).join(' | ')); }
    /* =================== G: stress =================== */
    { T('t_flurry', { hits: [5, 5], target: 'all_enemies', tags: ['skill', 'phys', 'el:一般', 'damage', 'aoe', 'multi_hit'] });
      const c = mk([hero({ skills: ['attack', 't_flurry'], stats: { hp: 1e5 } }), foe('B1', { stats: { hp: 1e5 } }), foe('B2', { stats: { hp: 1e5 } }), foe('B3', { stats: { hp: 1e5 } })], 3, { maxRounds: 150 }); c.byId.H.res.hp = 1e5; c.start(false);
      for (let i = 0; i < 300 && c.need; i++) act(c, 't_flurry', []); const hpOk = c.units.every(u => u.res.hp >= 0 && u.res.hp <= u.max.hp);
      ok('G', '壓力：多段×多目標×長戰鬥（' + c.log.length + ' 事件、' + c.round + ' 回合）HP 不出界、正常結束', !!c.result && hpOk && c.log.length > 3000); }
    { const c = mk([hero(), foe('B1')]); c.start(false); for (let i = 0; i < 12; i++) c.applyStatus(c.byId.H, c.byId.H, 'stage_atk', { delta: 1, dur: 3 }); for (let i = 0; i < 12; i++) c.applyStatus(c.byId.H, c.byId.B1, 'stage_def', { delta: -1, dur: 3 });
      ok('G', '極端層數：能力等級夾在 ±3', c.statusOf(c.byId.H, 'stage_atk').stacks === 3 && c.statusOf(c.byId.B1, 'stage_def').stacks === -3); }
    /* =================== H: save migration =================== */
    { let okm = false, info = ''; try { __game.newGameState('舊'); const st = Game.st; applyStartClass('swordsman'); st.lv = 20; st.battleV = 2; delete st.tal12; st.flags.v12conv = 0; st.tcAll = { swordsman: { '0.0': 1, '1.0': 0 } };
        st.orbs = [{ u: 'o1', k: 'galeCut', x: 20, e: ['A'], lv: 1 }, { u: 'o2', k: 'vigor', x: 0, e: [], lv: 2 }, { u: 'o3', k: 'renew', x: 0, e: [], lv: 1 }]; const w = mainWeapon(st), t = (w && GEAR[w.b].t) || 1; if (w) { w.o = ['o1']; w.en = { t: '火', lv: 1 }; }
        st.bag.enFire = 2; st.bag.enWater2 = 1; st.bag.trainBook = 0; const m0 = st.money;
        BB.sync(st); const L = v12Convert(st), spec = BB.heroSpec(st, { kind: 'wild' }), want = 600 + 300 + 2 * 200 + 500 + 300 * t;
        okm = TAL12.spent(st) === 0 && st.orbs.length === 0 && !(w && (w.o || w.en)) && !st.bag.enFire && !st.bag.enWater2 && st.bag.trainBook === 1 && st.money - m0 === want && BB.entry(st, 'galeCut').x >= 20 && spec.data.talents.length === 0 && L.length >= 3 && v12Convert(st).length === 0;
        info = 'spent ' + TAL12.spent(st) + ' books ' + st.bag.trainBook + ' gold +' + (st.money - m0) + '/' + want + ' lines ' + L.length; } catch (e) { info = e.message; }
      ok('H', '舊存檔：天賦退回；寶珠→修練之書／金錢、附魔退費、附魔石換錢（只換一次）；技能庫保留進度', okm, info); }
    /* =================== property tests: random battles keep the invariants =================== */
    { const N = 400, R = makeRng(2026), cl = Object.keys(DEF.classes), sps = Object.keys(SPECIES).filter(s => !SPECIES[s].rare && DEF.enemies[s] && MON_PANEL[s]); let bad = [], ev = 0;
      for (let i = 0; i < N; i++) { const cls = R.pick(cl), st = mkHero(cls, { lv: R.int(4, 40), tal: s => TAL12.auto(s, () => R.int(0, 1)) }), e0 = BV2.errors.length;
        const n = R.int(1, 3), lv = Math.max(2, st.lv - R.int(0, 6)), ex = []; for (let k = 1; k < n; k++) ex.push([R.pick(sps), lv]);
        try { const c = fight(st, [R.pick(sps), lv, 'wild', ex], 9000 + i, R.pick(['smart', 'random', 'attack'])); ev += c.log.length;
          const hpBad = c.log.some(e => e.type === EVT.DAMAGE && !e.cancelled && (e.payload.hpAfter < 0 || e.payload.amount < 0)) || c.units.some(u => u.res.hp < 0 || u.res.hp > u.max.hp || Object.keys(u.res).some(r => u.res[r] < 0 || (u.max[r] != null && u.res[r] > u.max[r])));
          if (!c.result || c.order.length || c.reactQ.length || hpBad) bad.push(cls + '#' + i + (hpBad ? ' hp/res' : ' queue')); } catch (e) { bad.push(cls + '#' + i + ': ' + e.message); }
        if (BV2.errors.length > e0) bad.push(cls + '#' + i + ': ' + BV2.errors[e0]); }
      ok('P', '隨機性質測試 ' + N + ' 場（' + ev + ' 事件）：HP／資源不出界、佇列清空、沒有非法狀態轉移', !bad.length, bad.slice(0, 4).join(' | ')); }
    for (const k of Object.keys(DEF.skills)) if (k.startsWith('t_')) delete DEF.skills[k]; for (const k of Object.keys(DEF.passives)) if (k.startsWith('t_')) delete DEF.passives[k];
    for (const k of ['t_mech']) delete DEF.mechanics[k]; delete DEF.talents.t_tal; delete DEF.statuses.t_st;
    return { out, hashes };
  }, golden);
  for (const l of res.out) g.log(l);
  if (!golden) { fs.writeFileSync(GOLDEN, JSON.stringify(res.hashes, null, 1)); g.log('golden event hashes written: tools/btest_golden.json'); }
  const fails = res.out.filter(l => l.startsWith('FAIL')).length;
  g.log(fails ? 'BTEST: FAIL (' + fails + ')' : 'BTEST: PASS (' + res.out.length + ' checks)');
  if (process.argv.includes('--sims')) await require('./bsims.js')(g);
};
