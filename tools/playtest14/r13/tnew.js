// 2026-10-08 class abilities + changed cards: 連擊, 詠唱, 雙星十字, 時之加速, old abilities gone
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const runBattle = async (cls, steps) => {
    await g.ev(([s, cls, steps]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = cls; K.decks = {}; KD.deck(st);
      startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__on = 0;
      const T = window.__T = []; let i = 0, pend = null; const foe = b => b.core.alive('B')[0], H = b => b.core.byId.H;
      const prep = b => { for (const u of b.core.side('B')) { u.statuses = u.statuses.filter(q => q.id !== 'blk15'); u.max.hp = Math.max(u.max.hp, 99999); u.res.hp = Math.max(u.res.hp, 99999); } };
      const play = (b, id, up = 0) => { b.hand.unshift({ id, up }); const C = KD.CARDS[id], f = b.core.alive('B'); return { cmd: b.playK(0, C.tg === 'enemy' && f[0] ? f[0].id : null) }; };
      const shivs = b => b.hand.filter(c => c.id === 'tk_shiv').length;
      const hits = (b, m) => b.core.log.slice(m).filter(e => e.type === 'DAMAGE' && e.src === 'H').map(e => e.payload.amount);
      const endT = b => { KD.block(b.core, H(b), 9999); return { k: 'end' }; };
      const S = {
        rg: [
          { f: b => { prep(b); window.__h0 = b.hand.length; b.energy = 9; return play(b, 'rg_defend'); }, c: b => (window.__h0 === 5 ? 'PASS' : 'FAIL') + ' 盜賊第一回合手牌 ' + window.__h0 + '（want 5，先手拿掉了）' },
          { f: b => play(b, 'rg_defend'), c: b => (b.chainN === 2 && shivs(b) === 0 ? 'PASS' : 'FAIL') + ' 第 2 張後：連擊 ' + b.chainN + '，飛刀 ' + shivs(b) },
          { f: b => play(b, 'rg_defend'), c: b => (shivs(b) === 1 ? 'PASS' : 'FAIL') + ' 第 3 張後得到飛刀：' + shivs(b) + '（want 1）' },
          { f: b => { window.__m = b.core.log.length; const i = b.hand.findIndex(c => c.id === 'tk_shiv'); const f = b.core.alive('B'); return { cmd: b.playK(i, f[0].id) }; }, c: b => { const d = hits(b, window.__m); return (d.length === 1 && d[0] === 4 && shivs(b) === 0 ? 'PASS' : 'FAIL') + ' 飛刀打出 ' + d.join(',') + '（want 4），算第 4 張：連擊 ' + b.chainN; } },
          { f: b => play(b, 'rg_defend'), c: b => 'card5' },
          { f: b => play(b, 'rg_defend'), c: b => (shivs(b) === 1 ? 'PASS' : 'FAIL') + ' 第 6 張（含飛刀）後再得到飛刀：' + shivs(b) },
          { f: b => endT(b), c: b => (b.chainN === 0 && b.hand.length === 5 ? 'PASS' : 'FAIL') + ' 下一回合連擊歸零 ' + b.chainN + '，手牌 ' + b.hand.length + '（飛刀被棄掉，want 5）' },
        ],
        mg: [
          { f: b => { prep(b); window.__h0 = b.hand.length; return play(b, 'mg_shield'); }, c: b => (b.hand.length === window.__h0 ? 'PASS' : 'FAIL') + ' 法師第一張技能卡不再抽牌：手牌 ' + window.__h0 + '→' + b.hand.length },
          { f: b => { window.__e = b.energy; return endT(b); }, c: b => (b.energy === 3 ? 'PASS' : 'FAIL') + ' 法師不再留能量（詠唱改成元素反應）：剩 ' + window.__e + ' → 下回合 ' + b.energy },
          { f: b => { b.energy = 0; return endT(b); }, c: b => (b.energy === 3 ? 'PASS' : 'FAIL') + ' 詠唱：用完 → ' + b.energy + '（want 3）' },
          { f: b => { window.__h0 = b.hand.length; window.__e = b.energy; return play(b, 'mg_haste'); }, c: b => (b.energy === window.__e - 1 + 2 && b.hand.length === window.__h0 + 1 ? 'PASS' : 'FAIL') + ' 時之加速：能量 ' + window.__e + '→' + b.energy + '、手牌 ' + window.__h0 + '→' + b.hand.length },
        ],
        sw: [
          { f: b => { prep(b); b.si = 0; b.energy = 9; window.__m = b.core.log.length; return play(b, 'sw_star'); }, c: b => { const d = hits(b, window.__m); return (d.length === 2 && d.every(x => x === 5) ? 'PASS' : 'FAIL') + ' 雙星十字（沒易傷）：' + d.join(',') + '（want 5,5）'; } },
          { f: b => { prep(b); b.si = 0; KD.add(b.core, H(b), foe(b), 'vuln15', 3); window.__m = b.core.log.length; return play(b, 'sw_star'); }, c: b => { const d = hits(b, window.__m); return (d.length === 3 ? 'PASS' : 'FAIL') + ' 雙星十字（易傷）：' + d.join(',') + '（want 3 次）'; } },
          { f: b => { prep(b); b.si = 0; for (const u of b.core.side('B')) u.statuses = u.statuses.filter(q => q.id !== 'vuln15'); window.__m = b.core.log.length; return play(b, 'sw_twin'); }, c: b => { const d = hits(b, window.__m); return (d.join(',') === '4,4' ? 'PASS' : 'FAIL') + ' 疾風二連 ' + d.join(','); } },
          { f: b => { prep(b); b.si = 0; window.__m = b.core.log.length; return play(b, 'nt_rapid'); }, c: b => { const d = hits(b, window.__m); return (d.join(',') === '3,3' ? 'PASS' : 'FAIL') + ' 速射 ' + d.join(','); } },
          { f: b => { prep(b); b.si = 0; window.__m = b.core.log.length; return play(b, 'nt_pierce'); }, c: b => { const d = hits(b, window.__m); return (d.join(',') === '8' ? 'PASS' : 'FAIL') + ' 穿甲刺 ' + d.join(','); } },
          { f: b => { prep(b); b.si = 0; window.__b0 = stkK(H(b), 'blk15'); return play(b, 'sw_shield'); }, c: b => { const d = stkK(H(b), 'blk15') - window.__b0; return (d === 15 ? 'PASS' : 'FAIL') + ' 舉盾 格擋 +' + d; } },
        ] };
      const L = S[cls];
      G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message); } pend = null; }
        const q = L[i++]; if (!q) { for (const u of b.core.side('B')) u.res.hp = 1; return { k: 'end' }; } pend = q.c; return q.f(b); };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 30, kind: 'wild' })); }, [save, cls]);
    for (let i = 0; i < 5000; i++) { const s = await g.ev(() => { const b = __game.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; const H = b.core && b.core.byId.H; if (H && H.res.hp < 20) H.res.hp = 40; __game.step(1); return 'in'; }); if (s === 'out') break; }
    g.log((await g.ev(() => window.__T)).join('\n'));
    for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  };
  for (const c of ['rg', 'mg', 'sw']) await runBattle(c);
  g.log(await g.ev(() => ['rg', 'mg'].map(k => KD.CLASSES[k].n + '「' + KD.CLASSES[k].ab + '」' + KD.CLASSES[k].abd).join('\n')));
};
