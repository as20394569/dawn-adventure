// 元素反應: marks, 蒸發 ×2, 爆炸 spreads, 感電 stops (boss: 虛弱・易傷), break −1, skills mark only empty monsters, multi-hit re-marks
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const run = async (cfg, steps) => {
    await g.ev(([s, cfg, steps]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'mg'; K.decks = {}; KD.deck(st); K.wk16 = {};
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutBreak = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__on = 0;
      const T = window.__T = []; let i = 0, pend = null; const F = b => b.core.alive('B'), foe = b => F(b)[0], H = b => b.core.byId.H;
      const play = (b, id, ti = 0, up = 0) => { b.energy = 9; b.hand.unshift({ id, up }); const C = KD.CARDS[id], f = F(b); return { cmd: b.playK(0, C.tg === 'enemy' && f[ti] ? f[ti].id : null) }; };
      const endT = b => { KD.block(b.core, H(b), 9999); H(b).res.hp = H(b).max.hp; return { k: 'end' }; };
      const big = b => { for (const u of b.core.side('B')) { u.max.hp = 99999; u.res.hp = 99999; u.data.wk16 = ['打']; u.res.brk = u.max.brk; } };
      const dmgTo = (b, m, id) => b.core.log.slice(m).filter(e => e.type === 'DAMAGE' && e.src === 'H' && (!id || e.tgts[0] === id)).map(e => e.payload.amount);
      const S = steps.map(x => eval('(' + x + ')'));
      G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } pend = null; }
        const q = S[i++]; if (!q) { for (const u of b.core.side('B')) u.res.hp = 1; return { k: 'end' }; } pend = q.c; return q.f(b); };
      const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [save, cfg, steps]);
    for (let i = 0; i < 6000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(1); return 'in'; }); if (s === 'out') break; }
    g.log((await g.ev(() => window.__T)).join('\n'));
    for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  };
  await run({ sp: 'curlySheep', lv: 20, kind: 'wild', extra: [['fieldMice', 20], ['wildBoar', 20]] }, [
    `{ f: b => { big(b); return play(b, 'mg_fire', 0); }, c: b => (foe(b).data.mk16 === '火' ? 'PASS' : 'FAIL') + ' 火球留下火印：' + foe(b).data.mk16 }`,
    `{ f: b => { window.__m = b.core.log.length; window.__brk = foe(b).res.brk; return play(b, 'mg_frost', 0); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (d[0] === 12 && !foe(b).data.mk16 && foe(b).res.brk === window.__brk - 1 ? 'PASS' : 'FAIL') + ' 蒸發：冰霜箭 6 → ' + d.join(',') + '（want 12），印記 ' + foe(b).data.mk16 + '，破防值 ' + window.__brk + '→' + foe(b).res.brk; } }`,
    `{ f: b => play(b, 'mg_fire', 1), c: b => 'mark 1' }`,
    `{ f: b => { window.__m = b.core.log.length; window.__ids = F(b).map(u => u.id); return play(b, 'mg_thunder', 1); }, c: b => { const per = window.__ids.map(id => dmgTo(b, window.__m, id).reduce((a, c) => a + c, 0)); return (per[1] === 16 && per[0] === 16 && per[2] === 16 ? 'PASS' : 'FAIL') + ' 爆炸：落雷 16 打中火印 → 每隻 ' + per.join(','); } }`,
    `{ f: b => play(b, 'mg_frost', 2), c: b => 'mark 水' }`,
    `{ f: b => play(b, 'mg_thunder', 2), c: b => { const u = F(b)[2]; return (b.core.hasStatus(u, 'flinch') ? 'PASS' : 'FAIL') + ' 感電：退縮（這回合不能行動）' + b.core.hasStatus(u, 'flinch'); } }`,
    `{ f: b => endT(b), c: b => { const u = F(b)[2]; const can = b.core.log.filter(e => e.type === 'ACTION_CANCEL' && e.src === u.id).length; return (can >= 1 ? 'PASS' : 'FAIL') + ' 感電的魔物行動被取消 ' + can; } }`,
    `{ f: b => play(b, 'mg_ember'), c: b => (F(b).every(u => u.data.mk16 === '火') ? 'PASS' : 'FAIL') + ' 火花：全體火印 ' + F(b).map(u => u.data.mk16).join(',') }`,
    `{ f: b => play(b, 'mg_slow', 0), c: b => (foe(b).data.mk16 === '火' ? 'PASS' : 'FAIL') + ' 遲滯咒（水，技能）不蓋掉火印：' + foe(b).data.mk16 }`,
    `{ f: b => { window.__m = b.core.log.length; return play(b, 'q_tide'); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (F(b).every(u => u.data.mk16 === '水') ? 'PASS' : 'FAIL') + ' 潮鳴貝殼（水，全體 2 下）：第一下蒸發 ' + d.join(',') + '，之後留下水印 ' + F(b).map(u => u.data.mk16).join(','); } }`,
  ]);
  await run({ sp: 'banditBoss', lv: 18, kind: 'boss', id: 'banditBoss' }, [
    `{ f: b => { big(b); return play(b, 'mg_frost', 0); }, c: b => 'mark' }`,
    `{ f: b => { const u = b.core.alive('B').find(x => x.boss) || foe(b); window.__b = u.id; return play(b, 'mg_thunder', b.core.alive('B').indexOf(u)); }, c: b => { const u = b.core.byId[window.__b]; return (stkK(u, 'weak15') >= 2 && stkK(u, 'vuln15') >= 2 && !b.core.hasStatus(u, 'flinch') ? 'PASS' : 'FAIL') + ' 頭目感電：虛弱 ' + stkK(u, 'weak15') + '、易傷 ' + stkK(u, 'vuln15') + '（不會定身）'; } }`,
  ]);
};
