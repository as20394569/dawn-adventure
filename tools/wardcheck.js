// v12.5 護盾：主角護盾（量・吸收・回合）、魔物護盾（蓄力・HP 門檻・每 4 回合、破盾倍率、打破→破防）、裝備・晶石・技能的護盾
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 's21.save.json'), 'utf8');
  g.log(await g.ev(s => {
    const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; startOverworld(); st.lv = 30;
    const out = [], ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (info != null ? '  — ' + info : ''));
    const T = tr11(st); T.lv = {}; T.eq = {};
    const mk = (b, q = 3) => { GEAR11_GLAM = false; const x = makeGear(b, q); GEAR11_GLAM = true; return x; };
    const equip = (kind, shield) => { st.equip.weapon = mk(BASE11.weapon[kind][4]).u; st.equip.shield = shield ? mk(BASE11.shield[shield - 1]).u : null; };
    const build = (o = {}) => { equip(o.kind || '劍', o.shield); if (o.setup0) o.setup0(); const S = heroStats(st); st.hp = S.hp; st.mp = S.mp;
      const c = BB.build({ sp: o.sp || 'rockRhino', lv: o.lv || 20, kind: o.foeKind || 'elite', id: o.sp || 'rockRhino', seed: o.seed || 5, maxRounds: o.rounds || 1 }, JSON.parse(JSON.stringify(st)));
      return { c, H: c.byId.H, F: c.units.find(u => u.side === 'B') }; };
    const V0 = BR.VARIANCE; BR.VARIANCE = [100, 100]; const D0 = BAI.decide;
    const fight = (o = {}) => { const r = build(o), { c, H, F } = r; H.stats.spe = o.slow ? 1 : 999; H.stats.crit = 0; H.res.mp = H.max.mp = 999; if (o.setup) o.setup(c, H, F);
      let n = 0; BAI.decide = function (core, u, oo) { if (u.hero) { const x = o.heroDo ? o.heroDo(core, u, n++) : null; return x || { type: 'skill', skill: H.data.attackSkill || 'attack', targets: [F.id] }; } return o.foeDo ? o.foeDo(core, u, oo) : { type: 'wait' }; };
      try { c.start(true); } finally { BAI.decide = D0; } r.log = c.log.filter(e => !e.cancelled); return r; };
    const ward = (c, u) => wardOf12(c, u);
    /* ===== 主角 ===== */
    { const { c, H, F } = build(); wardOpen12(c, H, H, { ...WARD12.hero }); const d = ward(c, H); ok('主角護盾：最大 HP 20%', d && d.amt === Math.round(H.max.hp * 0.2), d && d.amt + '／' + H.max.hp);
      const hp = H.res.hp; c.dealDamage(F, H, 40, { kind: 'hit' }); ok('吸收 50%：40 傷害 → 扣 20 血、護盾 −20', H.res.hp === hp - 20 && d.amt === Math.round(H.max.hp * 0.2) - 20, (hp - H.res.hp) + '／' + d.amt); }
    { const { c, H, F } = build(); wardOpen12(c, H, H, { ...WARD12.hero }); const d = ward(c, H), a0 = d.amt, hp = H.res.hp; c.dealDamage(F, H, a0 * 4, { kind: 'hit' });
      ok('護盾打穿：吸收用完就消失，其他扣血', !ward(c, H) && hp - H.res.hp === a0 * 4 - a0, (hp - H.res.hp) + ' vs ' + (a0 * 3)); }
    { const r = fight({ rounds: 3, foeDo: (core, u) => ({ type: 'skill', skill: u.skills.find(id => DEF.skills[id] && DEF.skills[id].power && !DEF.skills[id].charge) || 'attack', targets: ['H'] }),
        heroDo: (core, u, n) => n === 0 ? { type: 'skill', skill: 't_bar12x', targets: ['H'] } : null,
        setup: (c, H, F) => { defPut('skills', 't_bar12x', { ...DEF.skills.attack, id: 't_bar12x', power: 0, target: 'self', noHitRoll: true, cat: '變', tags: ['skill', 'support'], effects: [effRegister('t_bar12x#e', { type: 'ward12', target: 'self', pct: 0.2, abs: 0.5, turns: 1 })], after: [], costs: [], cooldown: 0, override: 1 }); H.skills.push('t_bar12x'); F.stats.spe = 1; } });
      const ex = r.log.filter(e => e.type === EVT.STATUS_EXPIRE && e.payload.status === 'barrier'), ap = r.log.find(e => e.type === EVT.STATUS_APPLY && e.payload.status === 'barrier');
      ok('1 回合：對手打過後，到主角下一次行動開始消失', ap && ex.length === 1 && ex[0].round === 2, ex.map(e => 'R' + e.round).join(',')); }
    /* ===== 魔物：蓄力 ===== */
    const chargeFoe = (o = {}) => fight({ rounds: 2, ...o, foeDo: (core, u) => { const id = u.skills.find(x => DEF.skills[x] && DEF.skills[x].charge); return id ? { type: 'skill', skill: id, targets: ['H'] } : { type: 'wait' }; } });
    { const r = chargeFoe({ setup: (c, H, F) => { H.stats.atk = 1; } }); const ap = r.log.find(e => e.type === EVT.STATUS_APPLY && e.payload.status === 'barrier' && e.tgts[0] === r.F.id);
      ok('菁英蓄力時張開護盾（最大 HP 12%）', ap && Math.abs(ap.payload.data.max - Math.round(r.F.max.hp * 0.12)) <= 1, ap && ap.payload.data.amt + '／' + r.F.max.hp);
      const hit = r.log.find(e => e.type === EVT.DAMAGE && e.src === 'H' && e.payload.ward > 0); ok('打在護盾上不扣血', hit && hit.payload.amount === 0, hit && JSON.stringify({ a: hit.payload.amount, w: hit.payload.ward })); }
    { const { c, H, F } = build(); const id = F.skills.find(x => DEF.skills[x] && DEF.skills[x].charge); c.applyStatus(F, F, 'charging', { data: { skill: id, targets: ['H'] } }); const a0 = ward(c, F) ? ward(c, F).amt : 0;
      c.dealDamage(H, F, a0 + 5, { kind: 'hit' }); ok('打破護盾 → 破防＋打斷蓄力', a0 > 0 && c.hasStatus(F, 'broken') && !c.hasStatus(F, 'charging') && !ward(c, F), a0 + (c.hasStatus(F, 'broken') ? ' 破防' : '') + (c.hasStatus(F, 'charging') ? ' 還在蓄力' : '')); }
    /* 破盾倍率 */
    { const { c, H, F } = build(); wardOpen12(c, F, F, { pct: 0.5, abs: 1, turns: 1 }); const d = ward(c, F), a0 = d.amt;
      c.dealDamage(H, F, 10, { kind: 'hit' }); const n1 = a0 - d.amt; c.dealDamage(H, F, 10, { kind: 'hit', mult: 2 }); const n2 = a0 - n1 - d.amt; c.dealDamage(H, F, 10, { kind: 'hit', mult: 2, crit: true }); const n3 = a0 - n1 - n2 - d.amt;
      c.dealDamage(H, F, 10, { kind: 'hit', skill: 't_axCrush' }); const n4 = a0 - n1 - n2 - n3 - d.amt;
      ok('對護盾倍率：普通 ×1、弱點 ×2、弱點＋會心 ×4、碎盾擊 ×3', Math.round(n1) === 10 && Math.round(n2) === 20 && Math.round(n3) === 40 && Math.round(n4) === 30, [n1, n2, n3, n4].map(Math.round).join('／')); }
    { const { c, H, F } = build(); wardOpen12(c, F, F, { pct: 0.5, abs: 1, turns: 1 }); const d = ward(c, F), a0 = d.amt; c.dealDamage(H, F, 10, { kind: 'hit', mult: 2, crit: true, skill: 't_axCrush' });
      ok('倍率最多 ×5', Math.round(a0 - d.amt) === 50, Math.round(a0 - d.amt)); }
    { const { c, H, F } = build(); wardOpen12(c, F, F, { pct: 0.1, abs: 1, turns: 1 }); const a0 = ward(c, F).amt, hp = F.res.hp; c.dealDamage(H, F, a0 + 30, { kind: 'hit' });
      ok('打穿魔物護盾：多的傷害扣血、破防', F.res.hp === hp - 30 && c.hasStatus(F, 'broken'), (hp - F.res.hp) + (c.hasStatus(F, 'broken') ? ' 破防' : '')); }
    /* HP 門檻・每 4 回合 */
    { const { c, H, F } = build({ sp: 'golem', foeKind: 'boss', lv: 17 }); c.dealDamage(H, F, Math.ceil(F.max.hp * 0.31), { kind: 'hit' }); const d = ward(c, F);
      ok('頭目 HP 掉到 70% → 張開護盾 12%', d && d.why === 'hp' && Math.abs(d.amt - Math.round(F.max.hp * 0.12)) <= 1, d && d.amt); }
    { const r = fight({ rounds: 5, sp: 'golem', foeKind: 'boss', lv: 17, foeDo: () => ({ type: 'wait' }), setup: (c, H, F) => { H.stats.atk = 1; } }); const ap = r.log.filter(e => e.type === EVT.STATUS_APPLY && e.payload.status === 'barrier' && e.tgts[0] === r.F.id);
      ok('每 4 回合張開一次（8%）', ap.length >= 1 && ap[0].round === 4 && ap[0].payload.data.why === 'every', ap.map(e => 'R' + e.round + ':' + e.payload.data.why).join(',')); }
    /* 魔物護盾的時間：主角至少有一次行動 */
    { const r = chargeFoe({ slow: 1, setup: (c, H, F) => { H.stats.atk = 1; } }); const hits = r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.payload.ward > 0);
      ok('主角比較慢也打得到護盾', hits.length >= 1, hits.length + ' 下'); }
    /* ===== 裝備・晶石・技能 ===== */
    { const { c, H } = build({ shield: 3 }); c.start(false); const d = ward(c, H); ok('盾牌 T3：開場護盾 12%', d && Math.abs(d.amt - Math.round(H.max.hp * 0.12)) <= 1, d && d.amt + '／' + H.max.hp);
      T.lv['cm:cmOpen'] = 1; const b = build({ shield: 3 }); b.c.start(false); const d2 = ward(b.c, b.H); delete T.lv['cm:cmOpen']; ok('先盾＋盾牌：27%', d2 && Math.abs(d2.amt - Math.round(b.H.max.hp * 0.27)) <= 1, d2 && d2.amt); }
    { const { c, H, F } = build({ setup0: () => { gearBy(st.equip.weapon, st).en11 = { wbrk: 4 }; } }); wardOpen12(c, F, F, { pct: 0.5, abs: 1, turns: 1 }); const d = ward(c, F), a0 = d.amt; c.dealDamage(H, F, 10, { kind: 'hit' });
      gearBy(st.equip.weapon, st).en11 = {}; ok('賦予「破盾 +20%」', Math.round(a0 - d.amt) === 12, Math.round(a0 - d.amt)); }
    { const { c, H } = build({ setup0: () => { const g = mk(BASE11.armor['重甲'].body[3]); g.en11 = { ward: 5 }; st.equip.body = g.u; } }); wardOpen12(c, H, H, { ...WARD12.hero });
      ok('賦予「護盾量 +15%」', Math.abs(ward(c, H).amt - Math.round(H.max.hp * 0.23)) <= 1, ward(c, H).amt + '／' + H.max.hp); st.equip.body = null; }
    { const g = mk(BASE11.armor['重甲'].head[3]); g.a = [['f_wardGuard', 15]]; st.equip.head = g.u;
      const r = fight({ rounds: 1, heroDo: () => ({ type: 'defend' }) }); st.equip.head = null; const ap = r.log.find(e => e.type === EVT.STATUS_APPLY && e.payload.status === 'barrier' && e.tgts[0] === 'H');
      ok('盾衛：防禦時張開護盾 15%', ap && Math.abs(ap.payload.data.amt - Math.round(r.H.max.hp * 0.15)) <= 1, ap && ap.payload.data.amt); }
    { T.lv['t_stWall'] = 3; const { c, H, F } = build({ kind: '法杖' }); c.exec([DEF.skills.t_stWall.effects[0]], { owner: H, src: H, skill: DEF.skills.t_stWall, tgt: H }); const d = ward(c, H); delete T.lv['t_stWall'];
      const hp = H.res.hp; c.dealDamage(F, H, 20, { kind: 'hit', cat: '特' }); const m = hp - H.res.hp; c.dealDamage(F, H, 20, { kind: 'hit', cat: '物' }); const p = hp - m - H.res.hp;
      ok('法力屏障 Lv3：31%、魔法全吸收、物理一半、2 回合', d && Math.abs(d.max - Math.round(H.max.hp * 0.31)) <= 1 && d.turns === 2 && m === 0 && p === 10, d && (d.max + '／' + H.max.hp + ' 魔' + m + ' 物' + p + ' ' + d.turns + '回')); }
    { const { c, H } = build(); c.applyStatus(H, H, 'barrier', { dur: 3 }); const d = ward(c, H); ok('舊的「3 回合護盾」→ 2 回合、20%', d && d.turns === 2 && Math.abs(d.amt - Math.round(H.max.hp * 0.2)) <= 1, d && d.turns + '／' + d.amt); }
    /* ===== 異常狀態 3 回合（v269） ===== */
    for (const id of ['psn', 'brn', 'par']) { const r = fight({ rounds: 6, sp: 'wolf', setup: (c, H, F) => { H.stats.atk = 0; F.max.hp = F.res.hp = 99999; c.applyStatus(H, F, id, {}); } });
      const ex = r.log.find(e => e.type === EVT.STATUS_EXPIRE && e.payload.status === id && e.tgts[0] === r.F.id), dots = r.log.filter(e => e.type === EVT.DAMAGE && e.payload.kind === 'dot' && e.tgts[0] === r.F.id).length;
      ok(DEF.statuses[id].metadata.n + '：3 回合後自動消除' + (id === 'par' ? '' : '（扣 3 次）'), ex && ex.round === 3 && (id === 'par' || dots === 3), (ex ? 'R' + ex.round : '沒消') + ' 扣' + dots); }
    { st.status = 'psn'; const b = build(); const s = b.c.statusOf(b.H, 'psn'); st.status = null; ok('舊存檔帶著中毒進戰鬥：也只剩 3 回合', s && s.dur === 3, s && s.dur); }
    { const b = build(); b.c.applyStatus(b.F, b.H, 'psn', {}); b.c.finish('win'); BB.apply(b.c, st); ok('戰鬥結束時異常消除', st.status == null, st.status); }
    BR.VARIANCE = V0;
    return out.join('\n') + '\n\n' + out.filter(x => x.startsWith('PASS')).length + '/' + out.length + ' PASS';
  }, save));
};
