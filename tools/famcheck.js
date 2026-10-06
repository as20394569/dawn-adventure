// v12.77 種族習性＋魔物的下一步：每個種族打幾場，確認習性真的發動、下一步的圖示判斷得出來 — SAVE=… node tools/play.js tools/famcheck.js
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 's21.save.json'), 'utf8');
  g.log(await g.ev(s => {
    const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; startOverworld(); st.money = 5000;
    const out = [], ok = (name, cond, info) => out.push((cond ? 'PASS ' : 'FAIL ') + name + (info != null ? '  — ' + info : ''));
    const wild = new Set(); for (const id in MAPS) for (const e of MAPS[id].encounters || []) for (const r of e.table || []) wild.add(r[0]);
    const pick = fam => [...wild].filter(sp => SPECIES[sp] && SPECIES[sp].fam === fam && !SPECIES[sp].boss && !SPECIES[sp].elite && !SPECIES[sp].rare)[0];
    const texts = c => c.log.filter(e => e.type === EVT.MESSAGE).map(e => e.payload.text || '').join('|');
    const used = (c, id) => c.log.filter(e => e.type === EVT.SKILL_USE && e.payload.skill === id).length;
    const run = (fam, n = 2, seed = 7, o = {}) => { const sp = o.sp || pick(fam); if (!sp) return null; const S = JSON.parse(JSON.stringify(st)); S.hp = heroStats(st).hp;
      const c = BB.build({ sp, lv: o.lv || 30, kind: 'wild', extra: Array.from({ length: n - 1 }, () => [sp, o.lv || 30]), seed, maxRounds: o.rounds || 12 }, S); c.data.heroPolicy = 'smart';
      const H = c.byId.H; if (o.weak) { H.stats.atk = Math.round(H.stats.atk * o.weak); H.stats.spa = Math.round(H.stats.spa * o.weak); } H.max.hp = H.res.hp = 99999; if (o.setup) o.setup(c);
      c.start(true); return { c, sp }; };
    const seeds = [3, 7, 11, 19, 23];
    const any = (fam, f, o) => { for (const sd of seeds) { const r = run(fam, o && o.n || 2, sd, o); if (r && f(r.c)) return r; } return run(fam, o && o.n || 2, 99, o); };
    const fams = ['beast', 'insect', 'plant', 'bird', 'ooze', 'aquatic', 'construct', 'human', 'undead', 'spirit'];
    ok('每個種族都有野生魔物', fams.every(pick), fams.filter(f => !pick(f)).join(','));
    { const r = any('beast', c => /同伴倒下了/.test(texts(c)), { n: 3 }); ok('獸族 群獵：同伴倒下時物攻 +1', r && /同伴倒下了/.test(texts(r.c)), r && r.sp); }
    { const r = any('insect', c => /孵出了/.test(texts(c)), { weak: 0.3, n: 1, setup: c => { const F = c.units.find(u => u.side === 'B'); F.res.hp = Math.floor(F.max.hp * 0.45); } }); ok('蟲族 孵化：HP 一半以下孵出一隻', r && /孵出了/.test(texts(r.c)) && r.c.units.filter(u => u.side === 'B').length === 2, r && r.sp); }
    { const healed = c => c.log.some(e => e.type === EVT.HEAL && c.byId[e.tgts[0]] && c.byId[e.tgts[0]].side === 'B'); const r = any('plant', healed, { weak: 0.3, n: 2, setup: c => { for (const F of c.units.filter(u => u.side === 'B')) F.res.hp = Math.floor(F.max.hp * 0.6); } }); ok('植物 扎根：沒被打到的回 HP', r && healed(r.c), r && r.sp); }
    { const r = any('bird', c => used(c, 'f14_fly') > 0, { weak: 0.3, n: 1 }); const fly = r && r.c.log.some(e => e.type === EVT.STATUS_APPLY && e.payload.status === 'fly14'); ok('飛禽 高飛：飛上天（fly14）', r && used(r.c, 'f14_fly') > 0 && fly, r && r.sp); }
    { const r = any('ooze', c => /分裂/.test(texts(c)), { n: 1, setup: c => { const F = c.units.find(u => u.side === 'B'); F.max.hp = F.res.hp = 1000; c.byId.H.stats.atk *= 25; c.byId.H.stats.spa *= 25; c.byId.H.stats.crit = 0; } }); ok('軟泥 分裂：一下打掉 30% 以上就分裂', r && /分裂/.test(texts(r.c)), r && r.sp); }
    { const r = any('aquatic', c => used(c, 'f14_dive') > 0, { weak: 0.3, n: 1 }); ok('水棲 潛水', r && used(r.c, 'f14_dive') > 0, r && r.sp); }
    { const r = any('construct', c => used(c, 'f14_guard') > 0, { weak: 0.3, n: 1 }); ok('構造體 架盾（每 3 次行動）', r && used(r.c, 'f14_guard') > 0, r && r.sp); }
    { const r = any('human', c => used(c, 'f14_steal') > 0, { weak: 0.2, n: 1 }); const tx = r && texts(r.c); ok('人類 順手牽羊：偷錢、下一回合逃跑或被打倒', r && used(r.c, 'f14_steal') > 0 && /偷走了/.test(tx) && (r.c.units.some(u => u.side === 'B' && (u.fled || u.down))), r && r.sp + ' ' + (tx || '').slice(0, 80)); }
    { const r = any('undead', c => /還在動/.test(texts(c)), { n: 1, setup: c => { c.byId.H.stats.crit = 0; const F = c.units.find(u => u.side === 'B'); F.res.hp = 5; } }); const tx = r && texts(r.c); ok('不死 不死身：第一次倒下留 1 HP，躺一回合', r && /還在動/.test(tx), r && r.sp + ' ' + (tx || '').slice(0, 90)); }
    { const r = run('spirit', 1, 5); ok('精靈 虛影：有習性、下一步看不出來', r && r.c.units.find(u => u.side === 'B').data.mechanics.includes('fam14_spirit') && intentOf14(r.c, r.c.units.find(u => u.side === 'B'), { type: 'skill', skill: 'm_tackle' }).k === 'hide'); }
    { const S = JSON.parse(JSON.stringify(st)), c = BB.build({ sp: 'rockRhino', lv: 30, kind: 'elite', id: 'rockRhino', seed: 3, maxRounds: 2 }, S); ok('菁英沒有種族習性', !c.units.find(u => u.side === 'B').data.fam14); }
    // 下一步：開打前規劃好的每一隻都判斷得出圖示
    { const bad = []; for (const fam of fams.concat(['dragon'])) { const sp = pick(fam); if (!sp) continue; const S = JSON.parse(JSON.stringify(st)), c = BB.build({ sp, lv: 30, kind: 'wild', extra: [[sp, 30]], seed: 4, maxRounds: 3 }, S);
        for (let r = 0; r < 3; r++) { c.planRound(); for (const u of c.alive('B')) { const I = intentOf14(c, u, c.plan[u.id]); if (!I && c.plan[u.id]) bad.push(sp + ':' + JSON.stringify(c.plan[u.id])); } c.plan = {}; c.round++; } }
      ok('下一步：每個計畫都判斷得出圖示', !bad.length, bad.slice(0, 3).join(' | ')); }
    { const S = JSON.parse(JSON.stringify(st)), c = BB.build({ sp: pick('beast'), lv: 30, kind: 'wild', seed: 4, maxRounds: 3 }, S); c.planRound(); const u = c.alive('B')[0], I = intentOf14(c, u, { type: 'skill', skill: u.skills.find(id => DEF.skills[id] && DEF.skills[id].power) || 'm_tackle', targets: ['H'] });
      ok('下一步：攻擊有預估傷害', I && /^\d+/.test(I.t) && (I.k === 'atk' || I.k === 'heavy'), JSON.stringify(I)); }
    // v12.78 暈眩・沉默（一般魔物）
    { const S = JSON.parse(JSON.stringify(st)), c = BB.build({ sp: pick('beast'), lv: 20, kind: 'wild', seed: 6, maxRounds: 1 }, S); c.data.heroPolicy = 'smart'; const F = c.units.find(u => u.side === 'B'); c.byId.H.stats.spe = 999; c.applyStatus(c.byId.H, F, 'stun14', {}); c.start(true);
      ok('暈眩：跳過下一次行動', c.log.some(e => e.type === EVT.ACTION_CANCEL && e.payload.why === 'stun14')); }
    { const sp = [...wild].find(q => SPECIES[q] && !SPECIES[q].boss && (DEF.enemies[q] || {}).skills && DEF.enemies[q].skills.filter(id => DEF.skills[id] && DEF.skills[id].power).length >= 2), S = JSON.parse(JSON.stringify(st)), c = BB.build({ sp, lv: 20, kind: 'wild', seed: 6, maxRounds: 2 }, S), F = c.units.find(u => u.side === 'B');
      c.applyStatus(c.byId.H, F, 'silence14', {}); const pw = F.skills.filter(id => DEF.skills[id] && DEF.skills[id].power && !DEF.skills[id].charge).map(id => DEF.skills[id].power), cmd = BAI.decide(c, F);
      ok('沉默：只用最弱的招', cmd.type === 'skill' && DEF.skills[cmd.skill].power === Math.min(...pw), sp + ' ' + cmd.skill); }
    ok('沒有錯誤', !BV2.errors.length, BV2.errors.slice(-3).join(' | '));
    return out.join('\n') + '\n' + out.filter(l => l.startsWith('PASS')).length + '/' + out.length + ' PASS';
  }, save));
};
