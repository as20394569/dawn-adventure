// 弱點破防: gauge sizes, weakness hits, break → no action, ×1.5 through the next turn, refill (+inc), 劍意 ×2 −2, 劈山 −2
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const run = async (cls, cfg, steps) => {
    await g.ev(([s, cls, cfg, steps]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = cls; K.decks = {}; KD.deck(st); K.wk16 = {};
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__on = 0;
      const T = window.__T = []; let i = 0, pend = null; const foe = b => b.core.alive('B')[0], H = b => b.core.byId.H;
      const play = (b, id, up = 0) => { b.energy = 9; b.hand.unshift({ id, up }); const C = KD.CARDS[id], f = b.core.alive('B'); return { cmd: b.playK(0, C.tg === 'enemy' && f[0] ? f[0].id : null) }; };
      const endT = b => { KD.block(b.core, H(b), 9999); H(b).res.hp = H(b).max.hp; return { k: 'end' }; };
      const big = b => { for (const u of b.core.side('B')) { u.max.hp = 99999; u.res.hp = 99999; } };
      const cardOf = (b, want) => { const W = foe(b).data.wk16; const pool = { sw: ['sw_strike', 'sw_gap', 'sw_bash'], bk: ['bk_chop'] }[cls]; return pool.find(id => (KD.atOf(id) === W.find(x => KD.PHYS.includes(x))) === want); };
      const dmg = (b, m) => b.core.log.slice(m).filter(e => e.type === 'DAMAGE' && e.src === 'H').map(e => e.payload.amount);
      const S = steps.map(x => eval('(' + x + ')'));
      G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message + ' ' + e.stack.split('\n')[1]); } pend = null; }
        const q = S[i++]; if (!q) { for (const u of b.core.side('B')) u.res.hp = 1; return { k: 'end' }; } pend = q.c; return q.f(b); };
      const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [save, cls, cfg, steps]);
    for (let i = 0; i < 6000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(1); return 'in'; }); if (s === 'out') break; }
    g.log((await g.ev(() => window.__T)).join('\n'));
    for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  };
  if (!process.env.ONLYBOSS) {
  // 1. wild: gauge 3, a weakness hit −1 and found, a non-weakness hit nothing, break, 破防 through the next turn, refill to 3
  await run('sw', { sp: 'curlySheep', lv: 20, kind: 'wild' }, [
    `{ f: b => { big(b); const u = foe(b); window.__w = u.data.wk16.join(''); window.__no = cardOf(b, false); window.__yes = cardOf(b, true); b.si = 0; return play(b, window.__no); }, c: b => { const u = foe(b); return (u.max.brk === 3 && u.res.brk === 3 ? 'PASS' : 'FAIL') + ' 一般魔物破防值 ' + u.res.brk + '/' + u.max.brk + '，弱點 ' + window.__w + '，打 ' + KD.atOf(window.__no) + '（不是弱點）不扣'; } }`,
    `{ f: b => { b.si = 0; return play(b, window.__yes); }, c: b => { const u = foe(b); return (u.res.brk === 2 && KD.wkSeen(u.sp).length === 1 ? 'PASS' : 'FAIL') + ' 打中弱點 ' + KD.atOf(window.__yes) + '：' + u.res.brk + '，圖鑑記下 ' + KD.wkSeen(u.sp).join(''); } }`,
    `{ f: b => { b.si = 0; return play(b, window.__yes); }, c: b => 'x' }`,
    `{ f: b => { b.si = 0; return play(b, window.__yes); }, c: b => { const u = foe(b); return (b.core.hasStatus(u, 'broken') ? 'PASS' : 'FAIL') + ' 第三下破防：broken ' + b.core.hasStatus(u, 'broken') + '，意圖 ' + JSON.stringify(intentOf14(b.core, u, b.core.plan && b.core.plan[u.id])); } }`,
    `{ f: b => { window.__hp = H(b).res.hp; window.__acts = b.core.log.filter(e => e.src === foe(b).id && e.type === 'SKILL_USE').length; return endT(b); }, c: b => { const u = foe(b); const can = b.core.log.filter(e => e.type === 'ACTION_CANCEL' && e.payload && e.payload.why === 'broken').length; return (can === 1 && b.core.hasStatus(u, 'brkx16') ? 'PASS' : 'FAIL') + ' 破防的回合行動被取消（' + can + ' 次），下回合仍是破防 ' + b.core.hasStatus(u, 'brkx16'); } }`,
    `{ f: b => { b.si = 0; window.__m = b.core.log.length; return play(b, 'sw_strike'); }, c: b => { const d = dmg(b, window.__m); return (d[0] === 9 ? 'PASS' : 'FAIL') + ' 破防中斬擊 6 → ' + d.join(',') + '（want 9）'; } }`,
    `{ f: b => endT(b), c: b => { const u = foe(b); return (!b.core.hasStatus(u, 'brkx16') && u.res.brk === 3 && u.max.brk === 3 ? 'PASS' : 'FAIL') + ' 你的回合結束後回滿：' + u.res.brk + '/' + u.max.brk; } }`,
    `{ f: b => { b.si = 3; return play(b, window.__no); }, c: b => { const u = foe(b); return (u.res.brk === 1 ? 'PASS' : 'FAIL') + ' 劍意 ×2（不是弱點）−2：' + u.res.brk; } }`,
  ]);
  // 2. elite: gauge 5, +1 after a break; 劈山 −2 (not a weakness)
  await run('bk', { sp: 'wolf', lv: 20, kind: 'elite', id: 'wolf' }, [
    `{ f: b => { big(b); window.__w = foe(b).data.wk16.join(''); return play(b, 'bk_split'); }, c: b => { const u = foe(b); const w = foe(b).data.wk16.includes('打'); return (u.max.brk === 5 && u.res.brk === 5 - 2 - (w ? 1 : 0) ? 'PASS' : 'FAIL') + ' 菁英 5，劈山 −2' + (w ? '（打也是弱點 −1）' : '') + '：' + u.res.brk + '，弱點 ' + window.__w; } }`,
    `{ f: b => play(b, 'bk_crush'), c: b => { const u = foe(b); return (b.core.hasStatus(u, 'broken') ? 'PASS' : 'FAIL') + ' 碎盾擊 −3 → 破防'; } }`,
    `{ f: b => endT(b), c: b => 'monster turn' }`,
    `{ f: b => endT(b), c: b => { const u = foe(b); return (u.max.brk === 6 && u.res.brk === 6 ? 'PASS' : 'FAIL') + ' 菁英破防後 +1：' + u.res.brk + '/' + u.max.brk; } }`,
  ]);
  }
  // 3. boss gauge 8
  await run('sw', { sp: 'banditBoss', lv: 18, kind: 'boss', id: 'banditBoss' }, [
    `{ f: b => { big(b); return endT(b); }, c: b => { const u = b.core.alive('B').find(x => x.boss) || foe(b); return (u.max.brk === 8 ? 'PASS' : 'FAIL') + ' 頭目破防值 ' + u.max.brk + '，弱點 ' + u.data.wk16.join(''); } }`,
  ]);
};
