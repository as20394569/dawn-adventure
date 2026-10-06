/* ===================== v12.37 王都競技場（玩家 2026-10-06：「追加大量新內容」「做你認為好的遊戲內容與改動」） =====================
   王都冒險者公會的「競技場主持人」。五個級別，每級連戰（場與場之間回復 30% HP・MP），輸了不會昏倒也不扣錢。
   銅 Lv22 魔物群 → 銀 Lv28 菁英（不能用道具）→ 金 Lv34 第一章頭目 → 白金 Lv40 第二章頭目 → 傳說 Lv48 五連戰（破關後）。
   首次通關：金錢・專屬飾品・稱號；之後再通關：金錢＋對手的素材。 */
const ARENA13 = [
  { id: 'bronze', n: '銅級', lv: 22, gold: 3000, again: 800, acc: 'arenaBronze13', title: 'arena13bronze',
    fights: [{ sp: 'greyWolf', n: '灰鬃狼與林道貂', extra: ['forestMarten'] }, { sp: 'roadBandit', n: '街道盜賊與夜盜鴉', extra: ['thiefCrow'] }, { sp: 'roadBandit', n: '街道盜賊團', extra: ['roadBandit', 'thiefCrow'] }] },
  { id: 'silver', n: '銀級', lv: 28, gold: 6000, again: 1500, acc: 'arenaSilver13', title: 'arena13silver', noItems: 1,
    fights: [{ sp: 'boneKnight', kind: 'elite' }, { sp: 'bogWitch', kind: 'elite' }, { sp: 'blackFeather', kind: 'elite' }] },
  { id: 'gold', n: '金級', lv: 34, gold: 10000, again: 2500, acc: 'arenaGold13', title: 'arena13gold',
    fights: [{ sp: 'banditBoss', kind: 'boss' }, { sp: 'crystalGolem', kind: 'boss' }, { sp: 'hydra', kind: 'boss' }] },
  { id: 'plat', n: '白金級', lv: 40, gold: 15000, again: 4000, acc: 'arenaPlat13', title: 'arena13plat',
    fights: [{ sp: 'harvestGolem', kind: 'boss' }, { sp: 'clockColossus', kind: 'boss' }, { sp: 'frostQueen', kind: 'boss' }] },
  { id: 'legend', n: '傳說級', lv: 48, gold: 30000, again: 8000, acc: 'arenaLegend13', title: 'arena13legend', late: 1,
    fights: [{ sp: 'silverWyrm', kind: 'boss' }, { sp: 'lavaGiant', kind: 'boss' }, { sp: 'victorDemon', kind: 'boss' }, { sp: 'shadowGeneral', kind: 'boss' }, { sp: 'starGuardian', kind: 'boss' }] },
];
const arenaSt = (st = Game.st) => { const A = st.arena13 || (st.arena13 = { clr: {} }); A.clr = A.clr || {}; return A; };
const arenaOpen13 = (R, st = Game.st) => { const i = ARENA13.indexOf(R); if (i > 0 && !arenaSt(st).clr[ARENA13[i - 1].id]) return false; if (R.late && (st.flags.ch2 || 0) < 10) return false; return true; };
const arenaFoeName13 = f => f.n || SPECIES[f.sp].n;
const arenaRec13 = R => R.lv + (R.id === 'bronze' ? 2 : 3); // the level we suggest: the opponents' level plus a little

/* ---------- the prizes ---------- */
const ARENA_ACC13 = { // key: [name, tier, stats, trait, description]
  arenaBronze13: ['鬥士護腕', 4, { atk: 3, def: 3, hp: 6 }, 'fervor', '競技場銅級的獎品。皮革上烙著一面小小的盾。'],
  arenaSilver13: ['銀翼徽章', 5, { spe: 4, hp: 8, spd: 2 }, 'swift', '競技場銀級的獎品。銀色的翅膀，據說戴上的人腳步會變輕。'],
  arenaGold13: ['金獅之牙', 6, { atk: 5, spa: 5, hp: 10 }, 'hunter', '競技場金級的獎品。用金線綁著一顆獅子的牙。'],
  arenaPlat13: ['白金之心', 7, { hp: 25, def: 6, spd: 6, atk: 3, spa: 3 }, 'endure', '競技場白金級的獎品。心形的白金墜子，摸起來總是溫的。'],
  arenaLegend13: ['冠軍之證', 7, { hp: 25, atk: 7, spa: 7, def: 4, spd: 4 }, 'arenaChamp13', '只有打完傳說級的人才拿得到的證明。背面刻著歷代冠軍的名字——最後一行是你的。'],
};
PV('fx.arenaChamp13', v => ({ triggers: [{ on: EVT.DOWN, phase: 'POST', role: null, cond: { srcIsOwner: 1 }, limit: { perBattle: 3 }, effects: [{ type: 'stage', target: 'self', stats: { atk: 1, spa: 1 } }] }] }), { n: '冠軍' });
ACC_TRAIT.arenaChamp13 = ['冠軍', '每打倒一個敵人，物攻・魔攻 +1 階 3 回合（每場最多 3 次）', []];
if (typeof SPECIALS !== 'undefined') SPECIALS.arenaChamp13 = { n: '冠軍', d: '每打倒一個敵人，物攻・魔攻 +1 階 3 回合（每場最多 3 次）。', cat: '攻擊' };
{ const look = (GEAR.qHeroCrest || {}).look; for (const k in ARENA_ACC13) { const [n, t, st, tr, d] = ARENA_ACC13[k];
    GEAR[k] = { n, slot: 'acc', t, st: { ...st }, sp: {}, fx: [tr], trait: tr, kind: '飾品', d, look };
    if (ACC_TRAIT[tr]) ACC_TRAIT[tr][2] = (ACC_TRAIT[tr][2] || []).concat([n]); if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); } }
TITLES.push(
  { id: 'arena13bronze', n: '銅級鬥士', d: '通過競技場銅級。', st: { hp: 5 }, ok: st => !!arenaSt(st).clr.bronze },
  { id: 'arena13silver', n: '銀級鬥士', d: '通過競技場銀級。', st: { spe: 2, def: 1 }, ok: st => !!arenaSt(st).clr.silver },
  { id: 'arena13gold', n: '金級鬥士', d: '通過競技場金級。', st: { atk: 2, spa: 2 }, ok: st => !!arenaSt(st).clr.gold },
  { id: 'arena13plat', n: '白金鬥士', d: '通過競技場白金級。', st: { atk: 2, spa: 2, def: 2, spd: 2 }, ok: st => !!arenaSt(st).clr.plat },
  { id: 'arena13legend', n: '競技場傳說', d: '通過競技場傳說級。', st: { atk: 3, spa: 3, def: 3, spd: 3, hp: 10 }, ok: st => !!arenaSt(st).clr.legend });
ACHIEVEMENTS.push(
  { id: 'arena13_gold', n: '黃金的歡呼聲', d: '通過王都競技場的金級。', cat: '戰鬥', ok: st => !!arenaSt(st).clr.gold },
  { id: 'arena13_legend', n: '傳說的誕生', d: '通過王都競技場的傳說級。', cat: '戰鬥', ok: st => !!arenaSt(st).clr.legend });

/* ---------- arena rules inside the battle ---------- */
let ARENA_ON13 = null; // the rank being fought (null outside the arena)
{ const _bg = bagScreen; bagScreen = function* (mode, ...a) { if (mode === 'battle' && ARENA_ON13 && ARENA_ON13.noItems) { const b = Game.scene; if (b && b.msg) yield* b.msg('競技場的規則：' + ARENA_ON13.n + '不能使用道具！'); return null; } return yield* _bg.call(this, mode, ...a); }; }
{ const _ab = Battle.prototype.anyBoss; Battle.prototype.anyBoss = function () { return !!ARENA_ON13 || _ab.call(this); }; }
{ const _bf = battleBgFor; battleBgFor = function (ow, cfg) { return ARENA_ON13 ? 'arena13' : _bf(ow, cfg); }; }
// a loss in the arena: no whiteout, no lost gold — the host's people carry you back to the hall
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { if (!ARENA_ON13) return yield* _wo.apply(this, a);
    this.camDY = 0; this.bossGlow = 0; Sound.stop(); UI.clear(); healHero(); this.load(this.map.id, this.p.x, this.p.y, this.p.dir, true); yield* fadeIn(20); }; }

/* ---------- the host ---------- */
function* arenaRun13(ow, R) { const st = Game.st, A = arenaSt(st), first = !A.clr[R.id], N = R.fights.length; let won = 0;
  yield* sayAll(['好！' + R.n + '挑戰，' + N + '連戰！', '每場之間會幫你回復一點體力和魔力。' + (R.noItems ? '\n這一級的規則：不能使用道具！' : ''), '觀眾都在等了——上場吧！']);
  ARENA_ON13 = R;
  try {
    for (let i = 0; i < N; i++) { const f = R.fights[i], kind = f.kind || 'wild';
      Sound.sfx('charge'); yield* say('第' + (i + 1) + '戰：' + arenaFoeName13(f) + '！' + (i === N - 1 ? '\n（最後一戰！）' : ''));
      const res = yield* ow.battleScript({ sp: f.sp, lv: R.lv, kind, id: f.sp, rematch: kind !== 'wild', noMats: 1, noCard: 1, roam12: 1, arena13: R.id, extra: (f.extra || []).map(s => [s, R.lv]) });
      if (res !== 'win') { ARENA_ON13 = null; healHero(); yield* sayAll(['……很可惜！' + R.n + '挑戰失敗。（打贏了 ' + won + '／' + N + ' 場）', '別灰心，休息好了再來挑戰吧！（體力和魔力都恢復了）']); return; }
      won++;
      if (i < N - 1) { const S = heroStats(st); st.hp = Math.min(S.hp, st.hp + Math.ceil(S.hp * 0.3)); st.mp = Math.min(S.mp, (st.mp || 0) + Math.ceil(S.mp * 0.3)); Sound.sfx('heal'); yield* say('觀眾的歡呼聲！（HP・MP 回復了 30%）'); } }
  } finally { ARENA_ON13 = null; }
  healHero(); A.clr[R.id] = (A.clr[R.id] || 0) + 1; Sound.jingle('levelup');
  if (first) { st.money += R.gold; const g = makeGear(R.acc, R.id === 'legend' ? 5 : 4);
    yield* sayAll(['勝負已分！' + R.n + '，通過！', '觀眾全都站起來了！（體力和魔力都恢復了）']);
    yield* itemGet('得到了獎金 ' + R.gold + ' G！'); yield* itemGet('得到了' + gearName(g) + '！');
    const T = TITLES.find(t => t.id === R.title); if (T) yield* say('得到了稱號「' + T.n + '」！\n（可以在「稱號」裡裝備）');
    const nx = ARENA13[ARENA13.indexOf(R) + 1]; if (nx) yield* say(nx.late && (st.flags.ch2 || 0) < 10 ? '……再上去的「傳說級」，只有讓王都的鐘再次響起的人才能挑戰喔。' : '下一級「' + nx.n + '」開放了！（對手 Lv' + nx.lv + '）'); }
  else { st.money += R.again; const got = {}; for (const f of R.fights) { const m = SPECIES[f.sp] && SPECIES[f.sp].mat; if (m && ITEMS[m]) { const n = (f.kind === 'boss' ? 2 : 1); st.bag[m] = (st.bag[m] || 0) + n; got[m] = (got[m] || 0) + n; } }
    yield* say(R.n + '，再次通過！（體力和魔力都恢復了）'); yield* itemGet('得到了獎金 ' + R.again + ' G！' + (Object.keys(got).length ? '\n' + Object.keys(got).map(k => ITEMS[k].n + '×' + got[k]).join('・') : '')); }
}
Object.assign(Events, {
  *arenaHost(ow) { const st = Game.st, A = arenaSt(st);
    if (!st.flags.arena13Met) { st.flags.arena13Met = 1; yield* sayAll(['歡迎來到王都競技場！我是主持人。', '公會的地下就是競技場。銅、銀、金、白金……一級一級往上打，第一次通過每一級都有獎品和稱號！', '在競技場倒下也不用擔心，我們會把你抬出來——錢一毛都不會少。']); }
    while (true) { const opts = ARENA13.map(R => { const c = A.clr[R.id], open = arenaOpen13(R, st);
        return !open ? R.n + (R.late && ARENA13.slice(0, -1).every(q => A.clr[q.id]) ? '　破關後開放' : '　未開放') : R.n + '　對手 Lv' + R.lv + (c ? '　✓' : ''); });
      const r = yield* ask('要挑戰哪一級？', [...opts, '規則說明', '不了']); if (r < 0 || r === opts.length + 1) return;
      if (r === opts.length) { yield* sayAll(['每一級都是連戰。場與場之間會回復 30% 的 HP・MP，不能逃跑。', '輸了就是挑戰失敗——不會昏倒，也不會掉錢。', '第一次通過：獎金、專屬飾品和稱號。之後再通過：獎金和對手的素材。', '銀級不能用道具。傳說級只有讓王都的鐘再次響起的人才能挑戰。']); continue; }
      const R = ARENA13[r]; if (!arenaOpen13(R, st)) { yield* say(R.late && ARENA13.slice(0, -1).every(q => A.clr[q.id]) ? '傳說級……只有讓王都的鐘再次響起的人才能挑戰喔。' : '先通過前一級吧！'); continue; }
      const foes = R.fights.map(arenaFoeName13).join('、');
      yield* say(R.n + '：對手 Lv' + R.lv + '（建議 Lv' + arenaRec13(R) + '）\n' + foes);
      if (!(yield* yesNo((R.noItems ? '規則：這一級不能使用道具。\n' : '') + '要挑戰' + R.n + '嗎？'))) continue;
      yield* arenaRun13(ow, R); return; } },
});
MAPS.guild.npcs.push({ id: 'arenaHost', x: 6, y: 2, dir: 'down', look: 'soldier', name: '競技場主持人' });
delete mapCache.guild;
NPC_ROLES.任務.push('arenaHost'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.arenaHost = '王都・冒險者公會';
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const A = arenaSt(st); if (!st.flags.arena13Met) return; const done = ARENA13.filter(R => A.clr[R.id]).length;
    const nx = ARENA13.find(R => !A.clr[R.id]);
    L.push({ n: '王都競技場', t: !nx ? '完成：通過了所有級別，成為競技場的傳說！（之後也能再挑戰）' : '冒險者公會的競技場。目前通過 ' + done + '／' + ARENA13.length + ' 級，下一級：' + nx.n + '（對手 Lv' + nx.lv + '）' + (nx.late && (st.flags.ch2 || 0) < 10 ? '——破關後開放。' : '。'),
      done: !nx, rw: '獎金・專屬飾品・稱號', cat: '支線' }); }; }

/* ---------- the stage: a sunlit colosseum ---------- */
{ const _bb = buildBattleBG; buildBattleBG = function (kind) { if (kind !== 'arena13') return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(1313);
    const grad = (y0, y1, stops) => { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
    const curve = X => Math.round(Math.pow((X - W / 2) / (W / 2), 2) * 9); // the far stands bow toward us at the edges
    grad(0, 46, [[0, '#6cb4ea'], [1, '#cfe8f6']]);
    x.fillStyle = '#ffffff'; for (const [a, b, w] of [[14, 10, 24], [100, 6, 30], [140, 18, 18]]) { x.fillRect(a, b, w, 2); x.fillRect(a + 4, b - 1, w - 9, 1); }
    // tiers of stands, crowd dots on each
    const TIER = [['#b8a888', '#9a8a6c'], ['#c4b494', '#a49474'], ['#b0a080', '#94846a'], ['#bcac8c', '#9c8c70']], CROWD = ['#e05a4a', '#4a7ad0', '#f0d060', '#f4f0e0', '#5ab060', '#c070c0', '#e8a060', '#6a4a3a'];
    for (let t = 0; t < 4; t++) { const y0 = 20 + t * 11; for (let X = 0; X < W; X++) { const y = y0 + curve(X); x.fillStyle = TIER[t][0]; x.fillRect(X, y, 1, 9); x.fillStyle = TIER[t][1]; x.fillRect(X, y + 9, 1, 2); }
      for (let X = 1; X < W - 1; X += 2) { if (r() < 0.12) continue; const y = y0 + curve(X) + 2 + (r() < 0.5 ? 0 : 1); x.fillStyle = CROWD[Math.floor(r() * CROWD.length)]; x.fillRect(X, y + 2, 1, 3); x.fillStyle = r() < 0.5 ? '#f0c8a0' : '#c89068'; x.fillRect(X, y + 1, 1, 1); } }
    // the parapet with its poles and pennants
    for (let X = 0; X < W; X++) { const y = 18 + curve(X); x.fillStyle = '#8a7a60'; x.fillRect(X, y, 1, 2); }
    for (const X of [10, 46, 88, 130, 166]) { const y = 18 + curve(X); x.fillStyle = '#5a4a3a'; x.fillRect(X, y - 12, 1, 12); const col = X % 4 ? '#d04040' : '#3a6ac0'; x.fillStyle = col; x.fillRect(X + 1, y - 12, 6, 2); x.fillRect(X + 1, y - 10, 4, 1); x.fillRect(X + 1, y - 9, 2, 1); }
    // the arena wall: pale stone with dark arches, banners between them
    for (let X = 0; X < W; X++) { const y = 64 + curve(X); x.fillStyle = '#d8cbb0'; x.fillRect(X, y, 1, 16); x.fillStyle = '#ece2cc'; x.fillRect(X, y, 1, 1); x.fillStyle = '#a89878'; x.fillRect(X, y + 15, 1, 1); }
    for (let X = 4; X < W - 6; X += 22) { const y = 64 + curve(X + 5); x.fillStyle = '#3a3028'; x.fillRect(X + 1, y + 6, 9, 9); x.fillRect(X + 2, y + 5, 7, 1); x.fillRect(X + 3, y + 4, 5, 1); x.fillStyle = '#5a4a3a'; x.fillRect(X + 1, y + 14, 9, 1); }
    for (let X = 15; X < W - 4; X += 22) { const y = 64 + curve(X + 2), col = (X / 22 | 0) % 2 ? '#c03838' : '#2e5ab0'; x.fillStyle = col; x.fillRect(X, y + 2, 5, 9); x.fillStyle = '#f0d060'; x.fillRect(X, y + 2, 5, 1); x.fillRect(X + 2, y + 5, 1, 3); x.fillStyle = col; x.fillRect(X, y + 11, 2, 1); x.fillRect(X + 3, y + 11, 2, 1); }
    // sand floor: warm near, a raked ring in the middle, a shadow under the wall
    const top = 80; for (let y = top - 6; y < BH; y++) { const t = (y - top) / (BH - top), a = hex2rgb('#e8cc94'), b = hex2rgb('#b88c58'); x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; for (let X = 0; X < W; X++) if (y >= 80 + curve(X)) x.fillRect(X, y, 1, 1); }
    for (let X = 0; X < W; X++) { const y = 80 + curve(X); x.fillStyle = 'rgba(90,60,30,0.35)'; x.fillRect(X, y, 1, 3); x.fillStyle = 'rgba(90,60,30,0.18)'; x.fillRect(X, y + 3, 1, 3); }
    x.strokeStyle = 'rgba(255,240,210,0.35)'; x.lineWidth = 1; x.beginPath(); x.ellipse(92, 150, 78, 34, 0, 0, Math.PI * 2); x.stroke(); x.strokeStyle = 'rgba(140,100,60,0.25)'; x.beginPath(); x.ellipse(92, 151, 74, 31, 0, 0, Math.PI * 2); x.stroke();
    for (let i = 0; i < 140; i++) { const py = 86 + Math.floor(r() * (BH - 88)), px = Math.floor(r() * W); x.fillStyle = r() < 0.5 ? '#f4dcaa' : '#a07848'; x.fillRect(px, py, py > 160 ? 2 : 1, 1); }
    for (let i = 0; i < 9; i++) { const py = 96 + i * 13, w = 10 + Math.floor(r() * 18), px = Math.floor(r() * (W - w)); x.fillStyle = 'rgba(150,110,70,0.25)'; x.fillRect(px, py, w, 1); }
    return c; }; }
