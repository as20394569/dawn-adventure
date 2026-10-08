const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const run = async (cfg, steps, deck, cls = 'mg') => {
    await g.ev(([s, cfg, steps, deck, cls]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = cls; K.decks = {}; if (deck) K.decks[cls] = deck; K.g16 = 1; KD.deck(st); K.wk16 = {};
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutBreak = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__on = 0;
      const T = window.__T = []; let i = 0, pend = null; const F = b => b.core.alive('B'), foe = b => F(b)[0], H = b => b.core.byId.H;
      const play = (b, id, ti = 0, aw = 1, up = 0, keepE) => { if (!keepE) b.energy = 9; b.hand.unshift({ id, up, aw: id.startsWith('mg_') ? aw : 0 }); const C = KD.CARDS[id], f = F(b); return { cmd: b.playK(0, C.tg === 'enemy' && f[ti] ? f[ti].id : null) }; };
      const endT = b => { KD.block(b.core, H(b), 9999); H(b).res.hp = H(b).max.hp; return { k: 'end' }; };
      const big = b => { for (const u of b.core.side('B')) { u.max.hp = 99999; u.res.hp = 99999; u.data.wk16 = ['打']; } };
      const dmgTo = (b, m, id) => b.core.log.slice(m).filter(e => e.type === 'DAMAGE' && e.src === 'H' && (!id || e.tgts[0] === id)).map(e => e.payload.amount);
      const S = steps.map(x => eval('(' + x + ')'));
      G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } pend = null; }
        const q = S[i++]; if (!q) { for (const u of b.core.side('B')) u.res.hp = 1; b.energy = 9; b.hand.unshift({ id: 'mg_storm', up: 1 }); return { cmd: b.playK(0, null) }; } pend = q.c; return q.f(b); };
      const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [save, cfg, steps, deck, cls]);
    for (let i = 0; i < 8000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(1); return 'in'; }); if (s === 'out') break; }
    g.log((await g.ev(() => window.__T)).join('\n'));
    for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  };

  // 劍士：看破
  await run({ sp: 'curlySheep', lv: 20, kind: 'wild' }, [
    `{ f: b => { big(b); for (const u of b.core.side('B')) u.data.wk16 = []; KD.block(b.core, H(b), 30); b.core.dealDamage(foe(b), H(b), 8, { kind: 'hit', cat: '物', tags: [] }); b.core.dealDamage(foe(b), H(b), 8, { kind: 'hit', cat: '物', tags: [] }); window.__si = b.si; window.__m = b.core.log.length; window.__brk = foe(b).res.brk; return play(b, 'sw_cleave', 0); },
       c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (window.__si === 2 && d[0] === 14 + 8 && b.si === 0 && window.__brk - foe(b).res.brk === 2 ? 'PASS' : 'FAIL') + ' 看破：擋下 2 下 → 看破 ' + window.__si + '；斬鐵 14 → ' + d.join(',') + '（want 22）、破防值 −' + (window.__brk - foe(b).res.brk) + '、之後看破 ' + b.si; } }`,
    `{ f: b => { H(b).statuses = H(b).statuses.filter(s => s.id !== 'blk15'); KD.block(b.core, H(b), 3); window.__s0 = b.si; b.core.dealDamage(foe(b), H(b), 8, { kind: 'hit', cat: '物', tags: [] }); return play(b, 'sw_stance', 0); }, c: b => (window.__s0 === 0 && b.si === 1 ? 'PASS' : 'FAIL') + ' 沒擋完不加；架勢 看破 +1 → ' + b.si }`,
    `{ f: b => { b.si = 3; window.__m = b.core.log.length; return play(b, 'sw_tsubame', 0); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (d[0] === 4 + 12 && b.si === 1 ? 'PASS' : 'FAIL') + ' 燕返 用掉 3 層：' + d.join(',') + '（第一下 want 16；第二下破防中）、自己的看破 +1 → ' + b.si; } }`,
  ], [{ id: 'sw_stance' }, { id: 'sw_breath' }], 'sw');
  // 盜賊：影・影縛
  await run({ sp: 'curlySheep', lv: 20, kind: 'wild' }, [
    `{ f: b => { big(b); for (const u of b.core.side('B')) u.data.wk16 = []; window.__brk = foe(b).res.brk; return play(b, 'rg_rot', 0); }, c: b => (foe(b).data.sh16 === 4 ? 'PASS' : 'FAIL') + ' 蝕毒連斬 4 下 → 影 ' + foe(b).data.sh16 }`,
    `{ f: b => play(b, 'tk_shiv', 0), c: b => (foe(b).data.sh16 === 0 && b.core.hasStatus(foe(b), 'flinch') && window.__brk - foe(b).res.brk === 2 ? 'PASS' : 'FAIL') + ' 飛刀第 5 下 → 影縛：不能行動 ' + !!b.core.hasStatus(foe(b), 'flinch') + '、破防值 −' + (window.__brk - foe(b).res.brk) }`,
    `{ f: b => play(b, 'rg_rot', 0), c: b => (foe(b).data.sh16 === 4 ? 'PASS' : 'FAIL') + ' 同回合再疊 → ' + foe(b).data.sh16 }`,
    `{ f: b => play(b, 'rg_stab', 0), c: b => (foe(b).data.sh16 === 5 ? 'PASS' : 'FAIL') + ' 一回合最多一次影縛：影停在 ' + foe(b).data.sh16 }`,
  ], [{ id: 'rg_venom' }, { id: 'rg_prep' }], 'rg');
  // 盜賊：頭目的影縛
  await run({ sp: 'golem', lv: 20, kind: 'boss', id: 'golem' }, [
    `{ f: b => { big(b); for (const u of b.core.side('B')) u.data.wk16 = []; return play(b, 'rg_dance', 0); }, c: b => (!stkK(foe(b), 'vuln15') && !b.core.hasStatus(foe(b), 'flinch') && (b.core.data.shN16 || 0) >= 1 ? 'PASS' : 'FAIL') + ' 頭目影縛：只扣破防值（易傷 ' + stkK(foe(b), 'vuln15') + '、影縛 ' + (b.core.data.shN16 || 0) + ' 次）' }`,
  ], [{ id: 'rg_venom' }], 'rg');
  // 狂戰士：怒氣・狂化
  await run({ sp: 'curlySheep', lv: 20, kind: 'wild' }, [
    `{ f: b => { big(b); for (const u of b.core.side('B')) u.data.wk16 = []; H(b).statuses = H(b).statuses.filter(s => s.id !== 'blk15'); for (let i = 0; i < 3; i++) b.core.dealDamage(foe(b), H(b), 3, { kind: 'hit', cat: '物', tags: [] }); KD.block(b.core, H(b), 50); b.core.dealDamage(foe(b), H(b), 3, { kind: 'hit', cat: '物', tags: [] }); window.__r = b.rage16; return play(b, 'bk_roar', 0); },
       c: b => (window.__r === 3 && b.rage16 === 4 ? 'PASS' : 'FAIL') + ' 怒氣：挨 3 下（擋掉的不算）→ ' + window.__r + '，狂吼扣血 → ' + b.rage16 }`,
    `{ f: b => { H(b).statuses = H(b).statuses.filter(s => s.id !== 'blk15'); b.core.dealDamage(foe(b), H(b), 3, { kind: 'hit', cat: '物', tags: [] }); window.__r = b.rage16; b.startTurnK(); window.__e = b.energy; window.__m = b.core.log.length; return play(b, 'bk_fury', 0, 1, 0, true); },
       c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (window.__r === 5 && b.kz16 === 1 && b.rage16 === 0 && window.__e === 4 && d[0] === Math.floor((7 + 2) * 1.5) ? 'PASS' : 'FAIL') + ' 怒氣 5 → 狂化：能量 ' + window.__e + '、怒濤劈（7＋力量 2）→ ' + d.join(',') + '（want 13）'; } }`,
    `{ f: b => { b.endTurnK(); window.__m = b.core.log.length; return play(b, 'bk_fury', 0); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (b.kz16 === 0 && d[0] === 9 ? 'PASS' : 'FAIL') + ' 回合結束狂化消失：' + d.join(','); } }`,
  ], [{ id: 'bk_roar' }, { id: 'bk_brace' }], 'bk');
};
