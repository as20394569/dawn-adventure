/* ===================== v20.5 longer main story + moderate difficulty (playtest: chapter 1 was cleared in ~1 hour) =====================
   The ruins door is sealed: collect 三枚古印 from the forest (苔石巨人), the mine (鐵斧格倫) and the canyon (岩角犀).
   Existing areas become part of the main path (≈3–4 h instead of 1 h). Main-path bosses +15% HP, 古岩魔像 Lv17, wild monsters +1–2 Lv. */
Object.assign(ITEMS, {
  sealForest: { n: '森林之印', key: 1, price: 0, sell: 0, cat: '重要物品', d: '苔石巨人守護的古印。刻著樹葉的紋路。' },
  sealMine: { n: '礦坑之印', key: 1, price: 0, sell: 0, cat: '重要物品', d: '鐵斧格倫從礦坑深處挖出來的古印。刻著鐵鎚的紋路。' },
  sealCanyon: { n: '峽谷之印', key: 1, price: 0, sell: 0, cat: '重要物品', d: '岩角犀守護的古印。刻著夕陽的紋路。' },
});
const SEALS = [['mossGiant', 'sealForest', '迷霧森林・苔石巨人', ['forest', 4, 17]], ['bandit', 'sealMine', '廢棄礦坑・鐵斧格倫', ['mine', 9, 2]], ['rockRhino', 'sealCanyon', '落日峽谷・岩角犀', ['canyon', 19, 11]]];
const sealCount = (st = Game.st) => SEALS.filter(([, it]) => st.flags['got_' + it]).length;
function sealSync(st = Game.st) { // the guardian's first defeat hands over its seal (also works for saves made before this update)
  const got = []; if (!st) return got;
  for (const [fl, it] of SEALS) if (st.flags[fl] && !st.flags['got_' + it]) { st.flags['got_' + it] = 1; st.bag[it] = 1; got.push(it); }
  return got;
}
// difficulty: main-path guardians and bosses
Object.assign(MON_PANEL.golem, { hp: 104 }); Object.assign(MON_PANEL.banditBoss, { hp: 92 }); Object.assign(MON_PANEL.mossGiant, { hp: 48 });
Object.assign(MON_PANEL.croc, { hp: 46 }); Object.assign(MON_PANEL.rockRhino, { hp: 74 });
MAPS.ruins.boss.lv = 17;
{ const up = (m, rows) => (MAPS[m].encounters || []).forEach((e, i) => { const d = rows[i] || 0; if (d) for (const r of e.table) { r[1] += d; r[2] += d; } });
  up('ruins', [1]); // (04h already shifts route +1, forest/mine/ruins +2) → ruins wild 15–17 around the Lv17 golem
  MAPS.forest.elites.find(e => e.id === 'mossGiant').lv = 14; MAPS.canyon.elites.find(e => e.id === 'rockRhino').lv = 15;
}
// recommended levels on the signs
Object.assign(MAPS.route.signs, {
  '2,24': '「← 迷霧森林」\n樹林深處據說藏著古老的秘密。\n（建議Lv11以上）',
  '15,3': '「↑ 古岩遺跡」\n遺跡的大門被古老的封印鎖住了。\n（建議Lv16以上）',
  '19,28': '「→ 廢棄礦坑」\n礦脈枯竭後就沒人進去了。最近常有可疑人物出入。\n（建議Lv12以上）',
});
// the sealed door
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) {
    const m = this.map, p = this.p, st = this.st, [dx, dy] = DIRS[d], nx = p.x + dx, ny = p.y + dy;
    if (m.id === 'route' && d === 'up' && ny < 0 && m.d.northWarp && m.d.northWarp.x.includes(nx) && !st.flags.golem && sealCount(st) < 3) { p.dir = d; st.dir = d; Sound.sfx('bump'); this.run(sealDoor(this)); return; }
    return _tm.call(this, d, run);
  };
}
function* sealDoor(ow) {
  const st = ow.st, f = st.flags, n = sealCount(st);
  if (!f.qSeal) {
    f.qSeal = 1; f.mineOpen = 1;
    yield* sayAll(['遺跡的大門上刻著三個凹槽，發出微弱的光……', '門上的古文字寫著：「集齊森林、礦坑、峽谷的三枚古印之人，方可進入。」']);
    yield* say('守衛：「三枚古印分別被森林的苔石巨人、礦坑的盜賊頭目、峽谷的岩角犀守著。」\n「礦坑的入口已經被盜賊拆開了，從道路東邊就能進去。」');
    yield* say('（主線任務更新了：集齊三枚古印。）'); return;
  }
  yield* say('大門的封印還沒解開。（古印 ' + n + '/3）\n' + SEALS.filter(([, it]) => !st.flags['got_' + it]).map(([, it, where]) => '・' + ITEMS[it].n + '：' + where).join('\n'));
}
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a); const got = sealSync(this.st); if (got.length) Game.sealMsg = (Game.sealMsg || []).concat(got); }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () {
    if (Game.sealMsg && !this.script && Game.scene === this) { const got = Game.sealMsg; Game.sealMsg = null; const st = this.st;
      this.run((function* () { for (const it of got) { Sound.jingle('item'); yield* itemGet(st.name + '得到了「' + ITEMS[it].n + '」！'); } const n = sealCount(st); if (!st.flags.golem) yield* say(n >= 3 ? '三枚古印都到手了！遺跡的大門應該打得開了。' : '古印 ' + n + '/3。遺跡的大門還需要其他的古印。'); })()); }
    return _up.call(this);
  };
}
{ const _so = startOverworld; startOverworld = function (...a) { sealSync(Game.st); return _so.apply(this, a); }; }
// quest log + map markers
{ const _eq = extraQuests; extraQuests = function (st, L) {
    _eq(st, L); const f = st.flags; const main = L.find(q => q.n === '曙光的冒險者'); if (!main || f.golem || !f.license) return;
    const n = sealCount(st); if (n >= 3) { main.t = '三枚古印都集齊了。到晨霧道路的北邊，打開古岩遺跡的大門，平息暴走的魔像。'; return; }
    main.t = '古岩遺跡的大門被封印鎖住了。集齊三枚古印（' + n + '/3）：' + SEALS.map(([, it, where]) => (f['got_' + it] ? '✓' : '・') + ITEMS[it].n + '（' + where + '）').join('、');
  };
}
{ const _qm = questMarks; questMarks = function (st = Game.st) {
    const M = _qm(st), f = st.flags; if (!f.license || f.golem || sealCount(st) >= 3) return M;
    const out = M.filter(([m, x, y]) => !(m === 'ruins' && x === 7 && y === 3));
    for (const [, it, , mk] of SEALS) if (!f['got_' + it] && !out.some(q => q[0] === mk[0] && q[1] === mk[1] && q[2] === mk[2])) out.push(mk);
    return out;
  };
}
