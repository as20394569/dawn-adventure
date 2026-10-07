// v14 卡組職業：卡牌資料、每張卡實際打一次（沒有錯誤、沒有卡住）
const fs = require('fs'), path = require('path');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE || path.join(__dirname, '..', 'pt', 'n16.save.json'), 'utf8');
  g.log(await g.ev(() => { const out = [], ok = (n, c, i) => out.push((c ? 'PASS ' : 'FAIL ') + n + (i != null ? '  — ' + i : ''));
    const bad = []; for (const id in KD.CARDS) { const C = KD.CARDS[id]; try { const a = C.desc(C.b), b = C.desc(C.u), s = C.short(C.b); if (!a || !b || !Array.isArray(s) || s.length > 2) bad.push(id + ':text'); } catch (e) { bad.push(id + ':' + e.message); }
      if (!DEF.skills['k14_' + id]) bad.push(id + ':skill'); if (!(FX[C.fx] || (typeof Battle.prototype[C.fx] === 'function'))) bad.push(id + ':fx ' + C.fx); }
    ok('每張卡：說明、手牌短字、技能、特效都在', !bad.length, bad.join(' '));
    for (const k of KD.CLS_ORDER) { const n = Object.keys(KD.CARDS).filter(id => KD.CARDS[id].cls === k && !KD.CARDS[id].hidden && KD.CARDS[id].rar !== 'T').length; ok(KD.CLASSES[k].n + '的卡 ≥ 25 張', n >= 25, n); }
    ok('每個主線頭目都有傳說卡', ['banditBoss', 'duneWorm', 'golem', 'crystalGolem', 'silverWyrm', 'hydra', 'ratKing', 'harvestGolem', 'clockColossus', 'frostQueen', 'lavaGiant', 'victorDemon', 'shadowGeneral'].every(s => KD.BOSS_CARD[s]));
    ok('三選一：三張不重複', [0, 1, 2, 3, 4].every(i => { const L = KD.offer(KD.CLS_ORDER[i % 4], ['wild', 'elite', 'boss', 'catch'][i % 4]); return L.length === 3 && new Set(L).size === 3; }));
    ok('換算：Lv25 一般魔物 HP 約 45、傷害約 10', Math.abs(KD.tab(KD.HP_TGT, 25) - 45) < 2 && Math.abs(KD.tab(KD.DMG_TGT, 25) - 10.5) < 1);
    return out.join('\n'); }));
  // play every card once
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; KD.migrate(st); KD.state(st).catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    const ids = Object.keys(KD.CARDS).filter(id => !KD.CARDS[id].hidden); window.__left = ids.slice(); window.__played = 0;
    G.Game.autoPlay = b => { const core = b.core, H = core.byId.H; H.res.hp = H.max.hp; for (const u of core.side('B')) if (core.isUp(u)) { u.max.hp = Math.max(u.max.hp, 99999); u.res.hp = u.max.hp; } b.energy = 9;
      const id = window.__left.shift(); if (!id) { for (const u of core.side('B')) u.res.hp = 1; return { k: 'end' }; } b.hand.unshift({ id, up: window.__played % 2 }); window.__played++; const C = KD.CARDS[id], f = core.alive('B');
      return { cmd: b.playK(0, C.tg === 'enemy' && f[0] ? f[0].id : null) }; };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 30, kind: 'wild', extra: [['fieldMice', 30]] })); }, save);
  for (let i = 0; i < 20000; i++) { const s = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__played > 0) return 'out'; if (b.core && b.core.result) window.__res = { o: b.core.result.outcome, r: b.core.round, hp: b.core.byId.H.res.hp, foes: b.core.side('B').map(u => u.res.hp + (u.down ? 'D' : '')).join() }; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length && b.core && b.core.result) G.press('b', 2, 2); else G.step(6); return null; }); if (s) break; }
  g.log(await g.ev(() => (window.__left.length ? 'FAIL ' : 'PASS ') + '每張卡都打出去了（' + window.__played + ' 張）' + (window.__left.length ? '  — 剩 ' + window.__left.slice(0, 5).join(',') + ' 結果 ' + JSON.stringify(window.__res) : '')));
};
