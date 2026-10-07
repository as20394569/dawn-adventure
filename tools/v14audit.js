// v14 底層檢查（玩家：「遊戲底層沒問題嗎？傷害計算、血量那些」）
// A. 每張攻擊卡（未升級／升級）實際打出的傷害 = 卡上寫的數字（沒有力量、虛弱、易傷、格擋時）
// B. 力量・虛弱・易傷・格擋的算法（主角打魔物）
// C. 魔物頭上的預估傷害 = 實際挨的傷害（一般魔物・菁英・頭目，各種地區）
// D. 魔物血量換算：有限、≥1、只換算一次；召喚出來的也換算
// E. 主角血量：戰鬥開始的最大 HP = 狀態畫面的最大 HP；戰鬥後的 HP 回寫正確
// F. 毒・燃燒：回合結束扣多少、格擋擋不擋、免疫的種族
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 'n16.save.json'), 'utf8');
  const out = [], ok = (n, c, info) => out.push((c ? 'PASS ' : 'FAIL ') + n + (info ? '  — ' + info : ''));
  // ---------- A + B: cards ----------
  for (const cls of (process.env.SKIPA ? [] : ['sw', 'rg', 'mg', 'bk'])) {
    await g.ev(([s, cls]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = cls; K.decks = {}; KD.deck(st); st.boost = {};
      startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      const ids = Object.keys(KD.CARDS).filter(id => !KD.CARDS[id].hidden && KD.CARDS[id].type === 'atk' && (KD.CARDS[id].cls === cls || (cls === 'sw' && KD.CARDS[id].cls === 'nt')));
      const jobs = []; for (const id of ids) for (const up of [0, 1]) jobs.push({ id, up }); // plain
      for (const st2 of ['str', 'weak', 'vuln', 'weakvuln', 'blk', 'strMulti']) jobs.push({ id: st2 === 'strMulti' ? (cls === 'sw' ? 'sw_twin' : cls === 'rg' ? 'rg_twin' : cls === 'mg' ? 'mg_arrows' : 'bk_triple') : (cls + '_' + ({ sw: 'strike', rg: 'stab', mg: 'bolt', bk: 'chop' })[cls]), up: 0, cond: st2 });
      window.__jobs = jobs; window.__res = []; window.__cur = null; window.__mark = 0;
      const clean = (core, u) => { u.statuses = u.statuses.filter(q => q.id === 'charging'); };
      G.Game.autoPlay = b => { const core = b.core, H = core.byId.H, F = core.alive('B')[0];
        if (window.__cur) { const L = core.log.slice(window.__mark), d = L.filter(e => e.type === 'DAMAGE' && e.src === 'H' && e.tgts[0] === F.id).map(e => e.payload.amount), blk = L.filter(e => e.type === 'CARD15' && e.payload.k === 'block' && e.tgts[0] === F.id).reduce((a, e) => a + e.payload.n, 0);
          window.__res.push({ ...window.__cur, d, blk, blkLeft: stkK(F, 'blk15') }); window.__cur = null; }
        const job = window.__jobs.shift(); if (!job) { for (const u of core.alive('B')) u.res.hp = 1; return { k: 'end' }; }
        H.res.hp = H.max.hp; clean(core, H); F.max.hp = 99999; F.res.hp = 99999; clean(core, F); for (const k in F.stats) {} b.energy = 9; b.si = 0; b.twice = 0; b.dupNext = 0; b.fb = 0; b.phantomUsed = 1; b.atkN = 0; b.cardsN = 0; b.sklN = 0;
        if (job.cond === 'str' || job.cond === 'strMulti') KD.add(core, H, H, 'str15', 2); if (job.cond === 'weak' || job.cond === 'weakvuln') KD.add(core, F, H, 'weak15', 2); if (job.cond === 'vuln' || job.cond === 'weakvuln') KD.add(core, H, F, 'vuln15', 2); if (job.cond === 'blk') KD.block(core, F, 5);
        window.__mark = core.log.length; window.__cur = job; b.hand.unshift({ id: job.id, up: job.up }); return { cmd: b.playK(0, F.id) }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 30, kind: 'wild', extra: 0 })); }, [save, cls]);
    for (let i = 0; i < 30000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__res.length) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length) G.press('b', 2, 2); else G.step(4); return null; }); if (s) break; }
    const R = await g.ev(() => window.__res.map(r => ({ ...r, desc: KD.desc({ id: r.id, up: r.up }), n: KD.name({ id: r.id, up: r.up }) })));
    const bad = [], cond = [];
    for (const r of R) { const tot = r.d.reduce((a, b) => a + b, 0) + (r.blk || 0);
      if (r.cond) { const base = r.cond === 'strMulti' ? null : 6; cond.push(r.cond + ':' + r.n + '=' + r.d.join('+') + (r.blk ? ' (擋' + r.blk + ')' : '')); continue; }
      const m = r.desc.match(/造成 (\d+) 傷害(?: (\d+) 次)?/); if (!m) continue; const exp = +m[1] * (+(m[2] || 1)); if (/全體|隨機|再加上|格擋|依|每有|HP|毒|燃燒|消耗|手牌|張|力量/.test(r.desc.replace(/造成 \d+ 傷害(?: \d+ 次)?/, '')) && tot !== exp) { cond.push('?' + r.n + ' 實際' + tot + ' 卡上' + exp); continue; }
      if (tot !== exp) bad.push(r.n + ' 實際 ' + r.d.join('+') + ' ≠ 卡上 ' + exp); }
    ok(cls + '：攻擊卡實際傷害＝卡上的數字（' + R.filter(r => !r.cond).length + ' 張次）', !bad.length, bad.slice(0, 12).join('；'));
    out.push('     狀態：' + cond.filter(c => !c.startsWith('?')).join('　')); const q = cond.filter(c => c.startsWith('?')); if (q.length) out.push('     有條件的卡（人工看）：' + q.join('；'));
  }
  // ---------- C + E: monsters' intents vs what lands; HP bookkeeping ----------
  const fights = JSON.parse(process.env.FIGHTS || 'null') || await g.ev(() => { const L = []; for (const map of ['route', 'windHills', 'jadeCreek', 'forest', 'canyon', 'lake', 'swamp', 'northRoad', 'goldPlains', 'frostField', 'emberPass', 'duskFort1', 'coralCoast13', 'sunkenReef14']) { const E = MAPS[map].encounters || []; const seen = new Set(); for (const e of E) for (const r of e.table) if (!seen.has(r[0]) && !(SPECIES[r[0]] || {}).rare) { seen.add(r[0]); } const sp = [...seen]; for (let i = 0; i < sp.length; i += 3) L.push({ sp: sp[i], lv: E[0].table[0][1], kind: 'wild', extra: sp.slice(i + 1, i + 3).map(q => [q, E[0].table[0][1]]), map }); }
    for (const id of ['millGolem', 'blackCatfish', 'croc', 'mossGiant', 'rockRhino', 'stagLord', 'wraithGeneral', 'boarKing', 'frostLich', 'youngDragon']) if (SPECIES[id]) L.push({ sp: id, lv: SPECIES[id].lv || 20, kind: 'elite', id });
    for (const id of ['banditBoss', 'golem', 'ratKing', 'harvestGolem', 'clockColossus', 'frostQueen', 'lavaGiant', 'victorDemon', 'shadowGeneral']) if (SPECIES[id]) L.push({ sp: id, lv: ({ banditBoss: 18, golem: 19, ratKing: 30, harvestGolem: 31, clockColossus: 35, frostQueen: 38, lavaGiant: 40, victorDemon: 41, shadowGeneral: 43 })[id], kind: 'boss', id });
    return L; });
  const RB = parseInt(process.env.ROUNDS || '7', 10); let rows = [], hpBad = [], scaleBad = [];
  for (const [fi, cfg] of fights.entries()) {
    await g.ev(([s, cfg, fi, RB]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'sw'; KD.deck(st); st.boost = { vit: 1 }; st.hp = KD.maxHp(st) - 7;
      if (cfg.map) st.map = cfg.map; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; window.__b = null; window.__exp = {}; window.__rows = []; window.__info = { st0: st.hp, max0: KD.maxHp(st) };
      let seed = 900 + fi * 37; Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      G.Game.autoPlay = b => { const core = b.core, H = core.byId.H, R = core.round;
        if (!window.__info.hb) { window.__info.hb = { max: H.max.hp, hp: H.res.hp }; }
        // the previous round: what each monster did to the hero
        for (const id in window.__exp) { const E = window.__exp[id]; if (E.R !== R - 1) continue; const L = core.log.slice(E.mark), dm = L.filter(e => e.type === 'DAMAGE' && e.src === id && e.tgts[0] === 'H' && e.payload.kind === 'hit'), ab = L.filter(e => e.type === 'CARD15' && e.payload.k === 'block' && e.src === id && e.tgts[0] === 'H').reduce((a, e) => a + e.payload.n, 0);
          const got = dm.reduce((a, e) => a + e.payload.amount, 0) + ab; const used = L.filter(e => e.type === 'SKILL_USE' && e.src === id).map(e => e.payload.skill).join('+'); window.__rows.push({ sp: E.sp, R: E.R, skill: E.skill, exp: E.n, got, hits: dm.length, per: dm.map(e => e.payload.amount + (e.payload.notes ? '[' + e.payload.notes + ']' : '')).join('/'), crit: dm.some(e => e.payload.crit), miss: L.filter(e => /MISS|EVADE|CANCEL/.test(e.type) && (e.src === id)).map(e => e.type).join(','), t: E.t, vu: E.vu, k: E.k, used, ctx: E.ctx, ctx2: 'H' + BR.stage(core, H, 'def') + '/' + BR.stage(core, H, 'spd') });
          delete window.__exp[id]; }
        if (R > RB) { H.res.hp = H.max.hp; for (const u of core.alive('B')) { u.res.hp = 0; u.down = true; } return { k: 'end' }; }
        H.max.hp = Math.max(H.max.hp, 9999); H.res.hp = 9999; H.statuses = H.statuses.filter(q => q.id !== 'blk15'); const vu = R % 3 === 2; if (vu) KD.add(core, null, H, 'vuln15', 1);
        for (const u of core.alive('B')) { u.res.hp = Math.max(u.res.hp, Math.round(u.max.hp * 0.6)); // keep them alive and out of their last phase most of the time
          const c = core.plan && core.plan[u.id]; let I = null; try { I = intentOf14(core, u, c); } catch (e) {}
          let n = null; if (core.hasStatus(u, 'charging')) { const S = u.statuses.find(s => s.id === 'charging'), D = S && S.data && DEF.skills[S.data.skill]; if (D && D.power) { const h = KD.hitsN(D); n = BR.damage(core, u, H, D, { preview: true, noCrit: true }).amount * h; } }
          else if (I && (I.k === 'atk' || I.k === 'heavy' || I.k === 'steal') && /^\d/.test(I.t)) { const m = I.t.match(/^(\d+)(?:×(\d+))?/); n = +m[1] * (+(m[2] || 1)); }
          window.__exp[u.id] = { R, mark: core.log.length, n, sp: u.sp, skill: c && c.skill, t: I && I.t, vu, k: I && I.k, ctx: 'H' + BR.stage(core, H, 'def') + '/' + BR.stage(core, H, 'spd') + ' U' + u.statuses.map(q => q.id + q.stacks).join(',') }; }
        return { k: 'end' }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: cfg.sp, lv: cfg.lv, kind: cfg.kind, id: cfg.id, extra: cfg.extra || 0 })); }, [save, cfg, fi, RB]);
    for (let i = 0; i < 20000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name === 'Battle') { window.__b = b; const c = b.core; if (c && !window.__info.scaled) { window.__info.scaled = 1; window.__info.hp = c.side('B').map(u => [u.sp, u.max.hp, u.data && u.data.k14s]); } }
        if (b.constructor.name !== 'Battle' && window.__b) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length) G.press('b', 2, 2); else G.step(4); return null; }); if (s) break; }
    const r = await g.ev(() => { const c = window.__b && window.__b.core, st = __game.Game.st; const all = c ? c.units.filter(u => u.side === 'B').map(u => ({ sp: u.sp, max: u.max.hp, k: !!(u.data && u.data.k14s), minion: !!u.minion })) : [];
      // scale twice = same
      let idem = true; if (c) for (const u of c.units) if (u.side === 'B') { const m = u.max.hp; KD.scale(c, u); if (u.max.hp !== m) idem = false; }
      return { rows: window.__rows, info: window.__info, all, idem, stHp: st.hp, stMax: KD.maxHp(st), hEnd: c ? c.byId.H.res.hp : null, out: c && c.result && c.result.outcome }; });
    rows = rows.concat(r.rows.map(x => ({ ...x, kind: cfg.kind }))); if (process.env.DBG) g.log(fi, cfg.sp, cfg.kind, 'rows', r.rows.length, 'out', r.out, JSON.stringify(r.info).slice(0, 200));
    if (r.info.hb && r.info.hb.max !== r.info.max0) hpBad.push(cfg.sp + ' 戰鬥最大HP ' + r.info.hb.max + '≠' + r.info.max0); if (r.info.hb && r.info.hb.hp !== r.info.st0) hpBad.push(cfg.sp + ' 開戰HP ' + r.info.hb.hp + '≠' + r.info.st0);
    for (const u of r.all) if (!(u.max >= 1) || !isFinite(u.max) || !u.k) scaleBad.push(u.sp + ' ' + u.max + (u.k ? '' : ' 沒換算') + (u.minion ? '(召喚)' : ''));
    if (!r.idem) scaleBad.push(cfg.sp + ' 換算兩次會變');
  }
  const act = rows.filter(x => x.exp != null), eq = act.filter(x => x.got === x.exp), miss = act.filter(x => x.got === 0 && x.exp > 0), off = act.filter(x => x.got !== x.exp && x.got !== 0);
  ok('魔物：頭上的預估傷害＝實際挨的（' + act.length + ' 次攻擊；其中 ' + act.filter(x => x.vu).length + ' 次主角易傷）', !off.length, off.slice(0, +(process.env.NOFF || 14)).map(x => x.kind[0] + ':' + x.sp + '/' + x.skill + '→' + x.used + ' 寫' + x.t + '(' + x.exp + ') 實際' + x.got + '=' + x.per + (x.crit ? '(會心)' : '') + (process.env.DBG ? ' ' + x.ctx + '→' + x.ctx2 : '')).join('\n   '));
  if (miss.length) out.push('     落空（寫了傷害但沒打中）：' + miss.length + ' 次　' + miss.slice(0, 8).map(x => x.sp + '/' + x.skill + '→' + x.used + ' ' + x.miss + (process.env.DBG ? ' ' + x.ctx : '')).join('、'));
  const surprise = rows.filter(x => x.exp == null && x.got > 0 && x.k !== 'hide'); ok('魔物：沒寫傷害的行動不會打到主角', !surprise.length, surprise.slice(0, 10).map(x => x.kind[0] + ':' + x.sp + '/' + x.skill + ' 寫「' + x.t + '」打了' + x.got).join('；'));
  ok('魔物血量：有限、≥1、都換算過、換算只算一次', !scaleBad.length, scaleBad.slice(0, 10).join('；'));
  ok('主角血量：戰鬥開始的最大 HP 和 HP＝地圖上的', !hpBad.length, hpBad.slice(0, 6).join('；'));
  // ---------- F: poison / burn / immunity ----------
  out.push(await g.ev(s => { const G = __game, R = []; G.Game.st = JSON.parse(s); const st = G.Game.st; KD.migrate(st);
    const core = BB.build({ sp: 'runeGolem', lv: 20, kind: 'wild', extra: [['wraith', 20], ['marshWisp', 20]] }, JSON.parse(s)); const H = core.byId.H, [a, b, c] = core.side('B');
    KD.add(core, H, a, 'pois14', 5); KD.add(core, H, b, 'pois14', 5); KD.add(core, H, c, 'burn14', 5); KD.add(core, H, a, 'burn14', 3); KD.block(core, a, 10); KD.add(core, a, H, 'pois14', 4); KD.block(core, H, 10);
    const hp0 = [a, b, c, H].map(u => u.res.hp); core.roundEnd(); const hp1 = [a, b, c, H].map(u => u.res.hp);
    return '     毒／燃燒（構造體 runeGolem 毒5＋燒3、不死 wraith 毒5、精靈 marshWisp 燒5、主角毒4＋格擋10）：扣 ' + hp0.map((h, i) => h - hp1[i]).join('/') + '，之後毒 ' + [a, b, H].map(u => stkK(u, 'pois14')).join('/') + '、燒 ' + [a, c].map(u => stkK(u, 'burn14')).join('/') + '、格擋 ' + stkK(a, 'blk15') + '/' + stkK(H, 'blk15'); }, save));
  g.log(out.join('\n'));
};
