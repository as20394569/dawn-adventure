// mechanics check of the 90 tree skills: damage multipliers (exact, preview damage) and the skills' own effects (battle runs)
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 's21.save.json'), 'utf8');
  g.log(await g.ev(s => {
    const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; startOverworld(); st.lv = 40; st.flags.dual11 = 1;
    const out = [], ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (info != null ? '  — ' + info : ''));
    const T = tr11(st); const mk = (b, q = 3) => { GEAR11_GLAM = false; const x = makeGear(b, q); GEAR11_GLAM = true; return x; };
    const equip = kind => { let w, off = null;
      if (kind === '雙刀') { w = mk(BASE11.weapon.短刀[4]); off = mk(BASE11.weapon.短刀[3]); } else if (kind === '雙劍') { w = mk(BASE11.weapon.劍[4]); off = mk(BASE11.weapon.劍[3]); }
      else if (kind === '雙盾') { w = mk(BASE11.shield[4]); off = mk(BASE11.shield[3]); } else w = mk(BASE11.weapon[kind][4]);
      st.equip.weapon = w.u; st.equip.shield = off ? off.u : null; };
    const setLv = (lvOf = () => 1) => { T.lv = {}; for (const kind of TREE_KINDS11) for (const r of TREE11[kind].sk) T.lv['t_' + r[1]] = lvOf(r[1]); };
    const build = (kind, seed = 5, rounds = 1, foeKind = 'elite') => { equip(kind); const S = heroStats(st); st.hp = S.hp; st.mp = S.mp;
      const c = BB.build({ sp: 'rockRhino', lv: 30, kind: foeKind, id: 'rockRhino', seed, maxRounds: rounds }, JSON.parse(JSON.stringify(st)));
      const H = c.byId.H, F = c.units.find(u => u.side === 'B'); return { c, H, F }; };
    const V0 = BR.VARIANCE; BR.VARIANCE = [100, 100];
    /* ===== A: multipliers (preview damage: no crit, no variance) ===== */
    setLv();
    const pv = (c, H, F, id) => BR.damage(c, H, F, DEF.skills[id], { preview: true }).amount;
    const ratio = (kind, id, on, abs) => { const { c, H, F } = build(kind); H.lv = 500; H.stats.atk = H.stats.spa = 3000; F.stats.def = F.stats.spd = 600; F.max.hp = F.res.hp = 100000; H.max.hp = H.res.hp = 1000;
      const ctl = H.data.attackSkill || 'attack'; const a0 = pv(c, H, F, 't_' + id), b0 = pv(c, H, F, ctl); on(c, H, F); const a1 = pv(c, H, F, 't_' + id), b1 = pv(c, H, F, ctl); return abs ? a1 / a0 : (a1 / a0) / (b1 / b0); };
    const st_ = (who, id, o = {}) => (c, H, F) => c.applyStatus(H, who === 'F' ? F : H, id, o);
    const hpF = v => (c, H, F) => { F.res.hp = Math.floor(F.max.hp * v); }, hpH = v => (c, H, F) => { H.res.hp = Math.floor(H.max.hp * v); };
    const both = (...fs) => (c, H, F) => fs.forEach(f => f(c, H, F));
    const A = [
      ['劍', 'sdGap', '對手物防下降時 ×1.5', st_('F', 'stage_def', { delta: -1, dur: 3 }), 1.5],
      ['劍', 'sdMeteor', '對破防 ×1.5', st_('F', 'broken'), 1.5],
      ['短刀', 'dgRot', '對中毒 ×1.4', st_('F', 'psn'), 1.4],
      ['短刀', 'dgReap', 'HP 一半以下 ×1.5', hpF(0.45), 1.5],
      ['斧', 'axFury', '自己 HP 一半 ×1.3', hpH(0.45), 1.3],
      ['斧', 'axFury', '自己 HP 剩 20% ×1.6', hpH(0.15), 1.6],
      ['斧', 'axCastle', '對破防 ×1.5', st_('F', 'broken'), 1.5],
      ['長槍', 'spBreak', '對蓄力中 ×1.5', st_('F', 'charging', { data: {} }), 1.5],
      ['長槍', 'spSpiral', '對破防再 +30%', st_('F', 'broken'), 1.3],
      ['法杖', 'stImpact', '對蓄力中 ×1.5', st_('F', 'charging', { data: {} }), 1.5],
      ['魔導書', 'tmForbid', '對手 2 項能力下降 +30%', both(st_('F', 'stage_def', { delta: -1, dur: 3 }), st_('F', 'stage_spe', { delta: -1, dur: 3 })), 1.3],
      ['樂器', 'inEcho', '對手中毒時 ×1.4', st_('F', 'psn'), 1.4],
      ['樂器', 'inEcho', '對手能力下降時 ×1.4', st_('F', 'stage_atk', { delta: -1, dur: 3 }), 1.4],
      ['雙刀', 'ddFang', 'HP 30% 以下 ×2', hpF(0.25), 2],
      ['雙劍', 'dsStar', '對破防 ×1.3', st_('F', 'broken'), 1.3],
      ['雙劍', 'dsPhantom', '3 次會心後 +30%', st_('H', 'phantom11', { delta: 3 }), 1.3],
      ['雙盾', 'shCrash', '對破防 ×1.5', st_('F', 'broken'), 1.5],
      ['雙盾', 'shRam', '2 層盾勢 +50%', st_('H', 'bulk11', { delta: 2 }), 1.5],
      ['短刀', 'dgQuick', '掠影步之後 +30%（蓄勢）', st_('H', 'nextPow11'), 1.3, 1],
    ];
    for (const [kind, id, what, on, want, abs] of A) { const r = ratio(kind, id, on, abs); ok('倍率 ' + DEF.skills['t_' + id].name + '：' + what, Math.abs(r - want) < 0.03, '實測 ×' + r.toFixed(3)); }
    // pierce
    for (const [kind, id, p] of [['長槍', 'spPierce', 0.3], ['長槍', 'spTriple', 0.3], ['長槍', 'spThousand', 0.3], ['長槍', 'spSpiral', 0.5], ['拳套', 'fsThrough', 0.4], ['火槍', 'gnAp', 0.4]]) {
      const { c, H, F } = build(kind); H.lv = 500; H.stats.atk = 600; F.stats.def = 600; const sk = DEF.skills['t_' + id], a = pv(c, H, F, 't_' + id), pd = sk.pierceDef; sk.pierceDef = 0; const b = pv(c, H, F, 't_' + id); sk.pierceDef = pd;
      ok('無視物防 ' + sk.name + ' ' + p * 100 + '%', Math.abs(a / b - 1 / (1 - p)) < 0.03, '實測 ×' + (a / b).toFixed(3) + '（應 ×' + (1 / (1 - p)).toFixed(3) + '）'); }
    // skill level: damage skills +10% per level
    { const { c, H, F } = build('劍'); H.lv = 500; const a = pv(c, H, F, 't_sdBreak'); setLv(k => k === 'sdBreak' ? 5 : 1); const B = build('劍'); B.H.lv = 500; const b = pv(B.c, B.H, B.F, 't_sdBreak'); setLv();
      ok('招式等級：Lv5 傷害 ×1.4', Math.abs(b / a - 1.4) < 0.03, '實測 ×' + (b / a).toFixed(3)); }
    /* ===== B: effects, real battle runs ===== */
    const D0 = BAI.decide;
    const fight = (kind, id, o = {}) => { const { c, H, F } = build(kind, o.seed || 5, o.rounds || 1, o.foeKind || 'elite'); H.stats.spe = 999; H.stats.crit = 0; H.res.mp = H.max.mp = 999; if (o.mp != null) H.res.mp = o.mp; F.max.hp = F.res.hp = 100000; if (o.setup) o.setup(c, H, F);
      let n = 0, did = 0; BAI.decide = function (core, u, oo) { if (u.hero) { const sid = (o.seq ? o.seq[n++] : null) || 't_' + id; if (!did && o.pre) { did = 1; o.pre(core, H, F); } if (!o.seq) n++; return { type: 'skill', skill: sid, targets: [DEF.skills[sid].target === 'self' ? H.id : F.id] }; } return o.foeAct ? D0.call(this, core, u, oo) : { type: 'wait' }; };
      try { c.start(true); } finally { BAI.decide = D0; } return { c, H, F, log: c.log.filter(e => !e.cancelled) }; };
    const hitsOf = (r, id) => r.log.filter(e => e.type === EVT.HIT && e.src === 'H' && e.payload.skill === 't_' + id).length;
    const HITS = { sdTwin: 2, sdFlow: 5, dgVenom: 2, dgRot: 4, dgBloom: 5, spTriple: 3, spThousand: 6, fsTriple: 3, fsKick: 3, fsStorm: 8, stArrows: 3, tmChain: 3, gnRapid: 2, gnSpray: 3, gnBarrage: 6, ddSpin: 4, ddCross: 2, ddDance: 7, ddGale: 12, ddFang: 2, dsMoon: 2, dsWhirl: 2, dsPhantom: 6, dsStar: 2 };
    const kindOf = id => TREE_KINDS11.find(k => TREE11[k].sk.some(r => r[1] === id));
    const badHits = []; for (const id in HITS) { const r = fight(kindOf(id), id); const n = hitsOf(r, id); if (n !== HITS[id]) badHits.push(DEF.skills['t_' + id].name + ' ' + n + '/' + HITS[id]); }
    ok('段數（' + Object.keys(HITS).length + ' 招多段，疾風百刃比對手快時 12 段）', !badHits.length, badHits.join('、'));
    // v12.5 護盾：「削 N 格」→ 對魔物護盾的倍率（劈山 ×2、碎盾擊 ×3 …）
    const WPRE = (c, H, F) => { H.stats.crit = 0; wardOpen12(c, F, F, { pct: 50, abs: 1, turns: 9 }); };
    const chipOf = r => Math.max(0, ...r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.tgts[0] === r.F.id && e.payload.wardMul).map(e => e.payload.wardMul));
    { const base = chipOf(fight('劍', 'sdBreak', { pre: WPRE })); const bad = []; for (const [id, n] of [['axSplit', 2], ['axCrush', 3], ['spBreak', 2], ['gnAp', 2], ['shRam', 2], ['sdGap', 2], ['fsStorm', 2]]) { const v = chipOf(fight(kindOf(id), id, { pre: WPRE })); if (v !== n) bad.push(DEF.skills['t_' + id].name + ' ×' + v + '/×' + n); }
      ok('破盾倍率（劈山・破陣槍・貫通彈・盾突・破綻突・狂嵐拳 ×2、碎盾擊 ×3）', !bad.length && base === 1, bad.join('、') + '（普通招式 ×' + base + '）'); }
    const stApplied = (r, sid, who = 'F') => r.log.filter(e => e.type === EVT.STATUS_APPLY && e.payload.status === sid && e.tgts[0] === (who === 'F' ? r.F.id : 'H')).length;
    const rate = (id, sid, seeds = 40) => { let n = 0; for (let s = 1; s <= seeds; s++) if (stApplied(fight(kindOf(id), id, { seed: s }), sid)) n++; return n / seeds; };
    { const v = rate('dgVenom', 'psn'); ok('淬刃 每段 30% 中毒（兩段至少一次約 51%）', v > 0.3 && v < 0.75, Math.round(v * 100) + '%'); }
    { const v = rate('dgNeedle', 'par'); ok('麻痺針 60% 麻痺', v > 0.4 && v < 0.8, Math.round(v * 100) + '%'); }
    { const v = rate('gnPara', 'par'); ok('麻痺彈 60% 麻痺', v > 0.4 && v < 0.8, Math.round(v * 100) + '%'); }
    { const v = rate('ddDance', 'psn'); ok('燕舞亂刃 每段 10% 中毒（七段至少一次約 52%）', v > 0.3 && v < 0.75, Math.round(v * 100) + '%'); }
    { const v = rate('axQuake', 'flinch'); ok('震地擊 30% 退縮', v > 0.12 && v < 0.5, Math.round(v * 100) + '%'); }
    { const r = fight('拳套', 'fsShell', { rounds: 2 }); const cr = stApplied(r, 'crack11'), dot = r.log.filter(e => e.type === EVT.DAMAGE && e.tgts[0] === r.F.id && e.payload.skill == null && e.root && String(e.root).includes('crack')).length;
      const dots = r.log.filter(e => e.type === EVT.DAMAGE && e.tgts[0] === r.F.id && !String(e.payload.skill || '').startsWith('t_')).map(e => e.payload.amount); ok('碎殼掌 裂甲（物防 −1 階、每回合 3%，菁英照算）', cr > 0 && dots.includes(3000), '裂甲 ' + cr + ' 次，回合末傷害 ' + JSON.stringify(dots.slice(0, 3)) + '（最大 HP 100000）'); }
    { const r = fight('短刀', 'dgBloom', { pre: (c, H, F) => { c.applyStatus(H, F, 'psn', {}); } }); const extra = r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.tgts[0] === r.F.id).length - 5, gone = !r.c.hasStatus(r.F, 'psn');
      ok('千刃毒華 引爆中毒：追加傷害並消除', extra >= 1 && gone, '追加 ' + extra + ' 次，中毒' + (gone ? '已消除' : '還在')); }
    { const a = fight('法杖', 'stFinale', { mp: 60 }), b = fight('法杖', 'stFinale', { mp: 20 }); const dmg = r => r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.payload.skill === 't_stFinale').reduce((x, e) => x + e.payload.amount, 0);
      const pay = r => r.log.filter(e => e.type === EVT.COST_PAY && e.src === 'H').map(e => JSON.stringify(e.payload)).join(' '); ok('魔力終曲 用掉全部 MP、MP 越多越痛', dmg(a) > dmg(b) * 2, 'MP60 → ' + dmg(a) + '、MP20 → ' + dmg(b) + '，付出 ' + pay(a) + ' / ' + pay(b)); }
    const mpGain = (r, id) => r.log.filter(e => e.type === EVT.RESOURCE_CHANGE && e.payload.res === 'mp' && e.tgts[0] === 'H' && e.payload.change > 0 && e.payload.why && !/regen|round/.test(String(e.payload.why))).reduce((x, e) => x + e.payload.change, 0); const mpWhy = r => r.log.filter(e => e.type === EVT.RESOURCE_CHANGE && e.payload.res === 'mp' && e.tgts[0] === 'H').map(e => e.payload.why + ':' + e.payload.change).join(' ');
    { const r = fight('拳套', 'fsTriple', { mp: 10 }); ok('三連拳 每段回 2 MP', mpGain(r) === 6, '+' + mpGain(r) + '（' + mpWhy(r) + '）'); }
    { const r = fight('法杖', 'stArrows', { mp: 10 }); ok('魔力箭 回 4 MP', mpGain(r) === 4, '+' + mpGain(r)); }
    { const r = fight('魔導書', 'tmDrain', { mp: 10 }); const d = r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.payload.skill === 't_tmDrain').reduce((x, e) => x + e.payload.amount, 0); ok('吸魔咒 回復傷害 25% 的 MP', Math.abs(mpGain(r) - Math.floor(d * 0.25)) <= 1, '傷害 ' + d + '，回 MP ' + mpGain(r)); }
    { const r = fight('斧', 'axBlood', { rounds: 2, seq: ['t_axBlood', 't_axSplit'], setup: (c, H) => { H.res.hp = Math.floor(H.max.hp / 2); } }); const h = r.log.filter(e => e.type === EVT.HEAL && e.tgts[0] === 'H' && e.payload.kind === 'drain').length; ok('狂戰之血 攻擊回血', h > 0, '回血 ' + h + ' 次'); }
    const counters = r => r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.tgts[0] === r.F.id && !String(e.payload.skill || '').startsWith('t_')).length;
    for (const [id, what] of [['spGuard', '迴槍架勢 被打反擊'], ['dsParry', '架劍 被打反擊'], ['shFort', '不落要塞 被打反擊']]) { const r = fight(kindOf(id), id, { foeAct: 1, rounds: 1 }); const foeHit = r.log.filter(e => e.type === EVT.DAMAGE && e.tgts[0] === 'H' && e.src === r.F.id).length; ok(what, counters(r) > 0 || !foeHit, '對手打中 ' + foeHit + ' 次、反擊 ' + counters(r) + ' 次'); }
    { const r = fight('雙劍', 'dsDance', { rounds: 2, seq: ['t_dsDance', 't_dsMoon'] }); const f = r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.payload.skill == null || (e.type === EVT.DAMAGE && e.src === 'H' && (e.tags || []).includes('follow'))).length; ok('雙劍舞陣 攻擊後副手追加一斬', f > 0, '追加 ' + f + ' 次'); }
    { const r = fight('魔導書', 'tmStop', { foeAct: 1, rounds: 2, foeKind: 'elite' }); const acts = r.log.filter(e => e.type === EVT.SKILL_USE && e.src === r.F.id).length; ok('時之停滯 菁英跳過下一次行動', acts <= 1, '兩回合裡對手行動 ' + acts + ' 次'); }
    { const r = fight('短刀', 'dgStitch', { foeAct: 1, rounds: 1 }); const acts = r.log.filter(e => e.type === EVT.SKILL_USE && e.src === r.F.id).length; ok('影縫 這回合不能行動', acts === 0, '對手行動 ' + acts + ' 次'); }
    { const r = fight('雙盾', 'shStance', { foeAct: 1, rounds: 3, seq: ['t_shStance', 't_shBash', 't_shBash'] }); const s = r.c.statusOf(r.H, 'bulk11'); ok('雙盾架勢 被打得到盾勢', !!s && s.stacks >= 1, '盾勢 ' + (s ? s.stacks : 0) + ' 層'); }
    { const dq = o => { const r = fight('拳套', 'fsQi', { setup: (c, H) => { H.stats.atk = 300; H.stats.spa = o; } }); return r.log.filter(e => e.type === EVT.DAMAGE && e.src === 'H' && e.payload.skill === 't_fsQi').map(e => e.payload.amount + e.payload.cat).join(','); };
      const hi = dq(1200), lo = dq(50); ok('氣勁彈（實戰）用物攻和魔攻較高的一項', parseInt(hi) > parseInt(lo) * 2 && /特/.test(hi) && /物/.test(lo), '魔攻高 ' + hi + '／魔攻低 ' + lo); }
    { // weapon traits that touch 破防
      const withTrait = (kind, f) => { T.lv[kind + ':trait'] = 1; try { return f(); } finally { delete T.lv[kind + ':trait']; } };
      const atkMul = () => { const { H } = build('斧'); return chipOf(fight('斧', 'x', { seq: [H.data.attackSkill || 'attack'], pre: WPRE })); };
      const a0 = atkMul(), a1 = withTrait('斧', atkMul);
      ok('斧的特性：普通攻擊對護盾 ×1.5', a0 === 1 && a1 === 1.5, '沒特性 ×' + a0 + '、有特性 ×' + a1);
      const CRIT = (c, H, F) => { WPRE(c, H, F); H.stats.crit = 100; }, s1 = withTrait('劍', () => chipOf(fight('劍', 'sdBreak', { pre: CRIT }))), s0 = chipOf(fight('劍', 'sdBreak', { pre: CRIT }));
      ok('劍的特性：會心對護盾 ×2 → ×3', s0 === 2 && s1 === 3, '沒特性 ×' + s0 + '、有特性 ×' + s1);
      // 長槍的特性（打部位 +30%）在 tools/s3check.js
    }
    BR.VARIANCE = V0;
    return out.join('\n') + '\n\n' + out.filter(x => x.startsWith('PASS')).length + '/' + out.length + ' PASS';
  }, save));
};
