// 熟練・覺醒: xp counts on the deck card, awakening after a win, and the awakened mage cards
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const run = async (cfg, steps, deck) => {
    await g.ev(([s, cfg, steps, deck]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'mg'; K.decks = {}; if (deck) K.decks.mg = deck; KD.deck(st); K.wk16 = {};
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutBreak = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__on = 0;
      const T = window.__T = []; let i = 0, pend = null; const F = b => b.core.alive('B'), foe = b => F(b)[0], H = b => b.core.byId.H;
      const play = (b, id, ti = 0, aw = 1, up = 0) => { b.energy = 9; b.hand.unshift({ id, up, aw }); const C = KD.CARDS[id], f = F(b); return { cmd: b.playK(0, C.tg === 'enemy' && f[ti] ? f[ti].id : null) }; };
      const endT = b => { KD.block(b.core, H(b), 9999); H(b).res.hp = H(b).max.hp; return { k: 'end' }; };
      const big = b => { for (const u of b.core.side('B')) { u.max.hp = 99999; u.res.hp = 99999; u.data.wk16 = ['打']; } };
      const dmgTo = (b, m, id) => b.core.log.slice(m).filter(e => e.type === 'DAMAGE' && e.src === 'H' && (!id || e.tgts[0] === id)).map(e => e.payload.amount);
      const S = steps.map(x => eval('(' + x + ')'));
      G.Game.autoPlay = b => { window.__on = 1; if (pend) { try { T.push(pend(b)); } catch (e) { T.push('ERR ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } pend = null; }
        const q = S[i++]; if (!q) { for (const u of b.core.side('B')) u.res.hp = 1; b.energy = 9; b.hand.unshift({ id: 'mg_storm', up: 1 }); return { cmd: b.playK(0, null) }; } pend = q.c; return q.f(b); };
      const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [save, cfg, steps, deck]);
    for (let i = 0; i < 8000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__on) return 'out'; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(1); return 'in'; }); if (s === 'out') break; }
    g.log((await g.ev(() => window.__T)).join('\n'));
    for (let i = 0; i < 3000; i++) { const s = await g.ev(() => { const G = __game; if (G.Game.scene.constructor.name === 'Overworld' && !G.UI.stack.length && !G.Game.scene.script) return 'ok'; G.press('a'); G.step(1); return 'w'; }); if (s === 'ok') break; }
  };
  // 1. xp on the deck card, awakening after the win
  const deck = []; for (let i = 0; i < 10; i++) deck.push({ id: 'mg_fire', up: 0, xp: 19 });
  await run({ sp: 'curlySheep', lv: 20, kind: 'wild' }, [
    `{ f: b => { big(b); b.energy = 9; const i = b.hand.findIndex(c => c.id === 'mg_fire'); window.__src = b.hand[i].src16; return { cmd: b.playK(i, foe(b).id) }; }, c: b => (window.__src && window.__src.xp === 20 ? 'PASS' : 'FAIL') + ' 打出後牌組裡那張的熟練 19→' + (window.__src && window.__src.xp) }`,
  ], deck);
  g.log(await g.ev(() => 'dbg ' + JSON.stringify({ hp: __game.Game.st.hp, n: KD.state(__game.Game.st).decks.mg.length, xp: KD.state(__game.Game.st).decks.mg.map(c => c.xp).join(','), cls: KD.state(__game.Game.st).cls })));
  g.log(await g.ev(() => { const D = KD.state(__game.Game.st).decks.mg; const a = D.filter(c => c.aw).length; return (a === 1 ? 'PASS' : 'FAIL') + ' 打贏後覺醒 ' + a + ' 張：' + D.filter(c => c.aw).map(KD.name).join('') + '，說明：' + KD.desc(D.find(c => c.aw) || D[0]); }));
  // 2. awakened cards
  await run({ sp: 'curlySheep', lv: 20, kind: 'wild', extra: [['fieldMice', 20]] }, [
    `{ f: b => { big(b); return play(b, 'mg_frost', 0, 0); }, c: b => 'mark 水' }`,
    `{ f: b => { window.__m = b.core.log.length; return play(b, 'mg_fire', 0); }, c: b => (stkK(foe(b), 'burn14') === 2 + 3 ? 'PASS' : 'FAIL') + ' 火球★ 反應時再燃燒 3：燃燒 ' + stkK(foe(b), 'burn14') + '（want 5）' }`,
    `{ f: b => play(b, 'mg_frost', 0, 0), c: b => 'mark 水' }`,
    `{ f: b => { window.__m = b.core.log.length; return play(b, 'mg_bolt', 0); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (foe(b).data.mk16 === '水' && d[0] === 6 ? 'PASS' : 'FAIL') + ' 魔力彈★ 變成上一張的元素（水）：' + foe(b).data.mk16 + ' 傷害 ' + d.join(','); } }`,
    `{ f: b => { b.hand = b.hand.filter(c => c.id !== 'mg_fire'); window.__h = b.hand.length; window.__e = b.energy = 9; return play(b, 'mg_frost', 1, 1); }, c: b => 'frost on 1 (sets 水 mark)' }`,
    `{ f: b => play(b, 'mg_fire', 1, 0), c: b => 'fire on 1 → 蒸發' }`,
    `{ f: b => { b.energy = 5; window.__e = 5; return play(b, 'mg_ember', 0); }, c: b => (b.energy === 9 ? 'PASS' : 'FAIL') + ' 火花★ 費用 0：能量 9→' + b.energy }`,
    `{ f: b => { b.energy = 9; window.__m = b.core.log.length; return play(b, 'mg_thunder', 0); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return (d[0] === 24 ? 'PASS' : 'FAIL') + ' 落雷★ 反應時 +8：' + d.join(',') + '（want 24）'; } }`,
    `{ f: b => { for (const u of F(b)) u.data.mk16 = '火'; window.__m = b.core.log.length; window.__r = b.core.data.rxN16 || 0; return play(b, 'mg_chain', 0); }, c: b => { const n = b.core.log.slice(window.__m).filter(e => e.type === 'DAMAGE' && e.src === 'H' && !(e.tags || []).includes('rx16')).length; const rx = (b.core.data.rxN16 || 0) - window.__r; return (n >= 4 + rx && rx >= 1 ? 'PASS' : 'FAIL') + ' 連鎖閃電★ 反應 ' + rx + ' 次 → 打了 ' + n + ' 次以上'; } }`,
    `{ f: b => { for (const u of F(b)) u.data.mk16 = null; return play(b, 'mg_icewall', 0); }, c: b => (F(b).every(u => u.data.mk16 === '水') ? 'PASS' : 'FAIL') + ' 冰牆★ 全體水印 ' + F(b).map(u => u.data.mk16).join(',') }`,
    `{ f: b => { window.__m = b.core.log.length; return play(b, 'mg_arrows', 0); }, c: b => { const n = dmgTo(b, window.__m, foe(b).id).length; return (n === 4 ? 'PASS' : 'FAIL') + ' 魔力箭★ 打 ' + n + ' 次'; } }`,
    `{ f: b => { const u = foe(b); setStk15(b.core, u, 'burn14', 0); KD.add(b.core, H(b), u, 'burn14', 6); return play(b, 'mg_combust', 0); }, c: b => (stkK(foe(b), 'burn14') === 3 ? 'PASS' : 'FAIL') + ' 引爆★ 燃燒 6 → ' + stkK(foe(b), 'burn14') + '（want 3）' }`,
    `{ f: b => { const u = foe(b); u.res.brk = u.max.brk; b.core.removeStatus(u, 'brkx16'); return play(b, 'mg_stop', 0); }, c: b => (KD.isBroken(b.core, foe(b)) ? 'PASS' : 'FAIL') + ' 時之停滯★ 讓牠破防' }`,
    `{ f: b => { window.__m = b.core.log.length; return play(b, 'mg_lance', 0); }, c: b => { const d = dmgTo(b, window.__m, foe(b).id); return 'INFO 魔力槍★ 對破防中 13：' + d.join(',') + '（破防 ×1.5、★ ×2、易傷？）'; } }`,
    `{ f: b => { b.energy = 1; return play(b, 'mg_haste', 0); }, c: b => (b.energy === 9 - 1 + 3 ? 'PASS' : 'FAIL') + ' 時之加速★ 能量 +3：9→' + b.energy + '（花 1）' }`,
    `{ f: b => play(b, 'mg_static', 0), c: b => (stkK(H(b), 'pwStaticA16') === 3 ? 'PASS' : 'FAIL') + ' 靜電場★ ' + stkK(H(b), 'pwStaticA16') }`,
    `{ f: b => { window.__m = b.core.log.length; return play(b, 'mg_fire', 1, 0); }, c: b => { const n = b.core.log.slice(window.__m).filter(e => e.type === 'DAMAGE' && e.src === 'H').length; return (n >= 2 ? 'PASS' : 'FAIL') + ' 靜電場★ 火球（攻擊）也觸發電擊：' + n + ' 次傷害'; } }`,
    `{ f: b => play(b, 'mg_meteor', 0), c: b => (stkK(H(b), 'chgM14') === 40 ? 'PASS' : 'FAIL') + ' 隕石術★ ' + stkK(H(b), 'chgM14') + '（want 40）' }`,
  ]);
  // 3. 不死鳥★
  await run({ sp: 'fieldMice', lv: 20, kind: 'wild' }, [
    `{ f: b => { for (const u of b.core.side('B')) { u.max.hp = 999; u.res.hp = 999; } return play(b, 'mg_phoenix', 0); }, c: b => 'phoenix' }`,
    `{ f: b => { window.__fh = foe(b).res.hp; H(b).res.hp = 1; for (const s of H(b).statuses) if (s.id === 'blk15') s.stacks = 0; H(b).statuses = H(b).statuses.filter(s => s.id !== 'blk15'); window.__noheal = 1; b.core.dealDamage(foe(b), H(b), 50, { kind: 'hit', cat: '物', tags: [] }); return { k: 'end' }; }, c: b => { const lost = window.__fh - foe(b).res.hp; return (lost >= 20 && H(b).res.hp > 1 ? 'PASS' : 'FAIL') + ' 不死鳥★ 復活時全體 20：魔物少了 ' + lost + '，主角 HP ' + H(b).res.hp; } }`,
  ]);
};
