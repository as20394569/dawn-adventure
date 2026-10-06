/* ===================== v12.38 公會的懸賞（玩家 2026-10-06：「追加大量新內容」） =====================
   冒險者公會的「賞金獵人蓋爾」貼出 8 張新的懸賞：換了顏色、更大更兇的菁英，各有一招自己的招牌技。
   去過那個地方才會出現在名單上；接下後魔物出現在地圖上，打倒後回去報告領賞（金錢＋屬性果實）。全部完成：稱號「賞金獵人」。 */
const BOUNTY13 = { // key: [name, base, look [hue, sat ×, light ×], role, level, map, signature move, reward item]
  bty13_ape: ['山猿大王', 'mountainApe', [12, 1.5, 1.0], 'phys', 24, 'maplePass', 'm13_apeQuake', 'powerFruit'],
  bty13_knight: ['無頭騎士長', 'headlessKnight', [-30, 1.3, 0.8], 'phys', 27, 'oldField', 'm13_hellLance', 'vitFruit'],
  bty13_pumpkin: ['南瓜燈大王', 'pumpkinLantern', [-150, 1.1, 0.85], 'tank', 29, 'goldPlains', 'm13_pumpkinBomb', 'wisdomFruit'],
  bty13_scorp: ['黑鉗毒蠍王', 'sandScorpion', [0, 0.4, 0.55], 'phys', 30, 'canyon', 'm13_doomSting', 'dexFruit'],
  bty13_moth: ['霜月蛾后', 'frostMoth', [-160, 1.4, 1.0], 'mage', 34, 'frostField', 'm13_moonPowder', 'agiFruit'],
  bty13_yeti: ['雪山巨人', 'yeti', [0, 2.2, 0.9], 'tank', 36, 'iceCave', 'm13_bigAvalanche', 'powerFruit'],
  bty13_obsidian: ['黑曜熔核', 'obsidianChunk', [-40, 2.5, 1.15], 'tank', 38, 'emberPass', 'm13_coreBurst', 'wisdomFruit'],
  bty13_general: ['亡國將軍', 'fallenSoldier', [60, 1.2, 0.9], 'phys', 44, 'heroTomb', 'm13_warOrder', 'luckClover'],
};
// the signature moves (each borrows the picture of the move it grew from)
Object.assign(MOVES, {
  m13_apeQuake: { n: '山崩投石', t: '岩', cat: '物', pow: 85, acc: 90, pp: 10, foe: 1, cls: 'proj', eff: { flinch: 1, p: 30 }, d: '舉起一大塊山岩砸過來。30% 讓對手退縮。' },
  m13_hellLance: { n: '冥府突擊', t: '一般', cat: '物', pow: 100, acc: 95, pp: 10, foe: 1, cls: 'pierce', pierceDef: 0.3, d: '騎著看不見的馬直衝過來，無視 30% 物防。' },
  m13_pumpkinBomb: { n: '鬼火南瓜彈', t: '火', cat: '特', pow: 85, acc: 95, pp: 10, foe: 1, cls: 'bolt', eff: { st: 'brn', p: 30 }, d: '丟出燒著鬼火的南瓜。30% 讓對手燒傷。' },
  m13_doomSting: { n: '斷魂毒針', t: '毒', cat: '物', pow: 70, acc: 95, pp: 10, foe: 1, cls: 'pierce', eff: { st: 'psn', p: 50 }, vsSt: { st: 'psn', m: 1.5 }, d: '尾巴的毒針一刺。50% 讓對手中毒；對已經中毒的對手威力 ×1.5。' },
  m13_moonPowder: { n: '月下冰鱗粉', t: '水', cat: '特', pow: 70, acc: 90, pp: 10, foe: 1, cls: 'powder', eff: { st: 'slp', p: 25 }, d: '在月光下灑出冰冷的鱗粉。25% 讓對手睡著。' },
  m13_bigAvalanche: { ...(MOVES.m_avalanche || {}), n: '萬丈雪崩', t: '岩', cat: '物', pow: 160, acc: 90, pp: 5, foe: 1, cls: 'charge', charge: true, d: '蓄力一回合，把整面雪坡推過來。' },
  m13_coreBurst: { n: '熔核爆裂', t: '火', cat: '特', pow: 120, acc: 95, pp: 5, foe: 1, cls: 'bolt', recoil: 0.2, d: '讓體內的熔核爆開。自己也會受到造成傷害 20% 的反作用。' },
  m13_warOrder: { n: '亡國軍令', t: '一般', cat: '變', pow: 0, acc: null, pp: 10, foe: 1, cls: 'buff', stat: { atk: 2, spe: 1, who: 'self' }, d: '舉起斷劍發出號令。自己的物攻 +2、速度 +1。' },
});
{ const PIC = { m13_apeQuake: 'm_boulder', m13_hellLance: 'm7_deathCharge', m13_pumpkinBomb: 'm7_pumpkinFire', m13_doomSting: 'm_deathStinger', m13_moonPowder: 'm6_icePowder', m13_bigAvalanche: 'm_avalanche', m13_coreBurst: 'm_overheat', m13_warOrder: 'm_deathCry' };
  for (const id in PIC) { if (MFX[PIC[id]]) { MFX[id] = MFX[PIC[id]]; MOVES[id].fx = id; } else if (typeof bvErr === 'function') bvErr('bty13', 'fx ' + PIC[id]);
    const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef));
    defPut('skills', id, { ...d, override: true });
    if (MON_CLASS[MOVES[id].cls] && !MON_CLASS[MOVES[id].cls].includes(id)) MON_CLASS[MOVES[id].cls].push(id); } }

for (const k in BOUNTY13) { const [n, b, look, role, lv, , sig] = BOUNTY13[k], B = SPECIES[b]; if (!B) { if (typeof bvErr === 'function') bvErr('bty13', 'base ' + b); continue; }
  SPECIES[k] = { ...B, n, elite: 1, rare: 0, exp: 90 + 6 * lv, gold: 0, dex: '公會懸賞單上的魔物。比一般的' + B.n + '大上一號，還會一招「' + MOVES[sig].n + '」。', bty13: 1 };
  MON_PANEL[k] = typeof ch2Panel === 'function' ? ch2Panel(lv, role, 'elite') : { ...MON_PANEL[b], lv };
  HD_RIG_OF[k] = (BATTLE_PXC[b] || chibiOwn(b)) ? b : (HD_RIG_OF[b] || b); if (ART[b]) ART[k] = artRecolor(ART[b], look[0], look[1], look[2]); else if (ART[HD_RIG_OF[k]]) ART[k] = ART[HD_RIG_OF[k]];
  if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[k] = HD_RIG_OF[k];
  const E = DEF.enemies[b]; defPut('enemies', k, { tags: ['foe', 'fam:' + (B.fam || 'beast')], skills: (E ? E.skills.slice() : ['m_tackle']).concat([sig]), fam: B.fam, trait: null, profile: E ? E.profile : 'brute', script: null, metadata: { n } });
  ELITE_TEXT[k] = ['懸賞魔物「' + n + '」！']; }
{ const _ci = chibiImage; chibiImage = function (k) { if (!BOUNTY13[k]) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k]; const src = _ci(BOUNTY13[k][1]); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const [dh, ks, kl] = BOUNTY13[k][2], c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]), [r, g, bb] = hex2rgb(hsl2hex(h + dh, Math.min(1, s * ks), Math.min(1, l * kl))); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }
// the signature move comes out from the second round, then every third
BAI.SCRIPT.bty13 = (core, u) => { const sig = BOUNTY13[u.sp] && BOUNTY13[u.sp][6]; if (!sig || !DEF.skills[sig] || core.round < 2 || core.round - (u.data.sig13 ?? -9) < 3 || core.onCooldown(u, sig)) return null;
  const t = core.units.find(q => q.hero && !q.down); u.data.sig13 = core.round; return { type: 'skill', skill: sig, targets: DEF.skills[sig].target === 'self' ? [u.id] : t ? [t.id] : [] }; };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (s && BOUNTY13[sp] && !s.data.script) s.data.script = 'bty13'; return s; }; }

/* ---------- state: none → on (accepted, on the map) → down (beaten, report) → done ---------- */
const bty13St = (st = Game.st) => st.bty13 || (st.bty13 = {});
// listed once you have been to the place (tracked from v12.38 on) or are close to its level
const bty13Seen = (k, st = Game.st) => !!((st.seen13 && st.seen13[BOUNTY13[k][5]]) || (st.vis && st.vis[BOUNTY13[k][5]]) || (st.lv || 1) >= BOUNTY13[k][4] - 4);
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) { const r = _ld.call(this, id, ...a); if (this.st && MAPS[id]) (this.st.seen13 || (this.st.seen13 = {}))[id] = 1; return r; }; }
const bty13Gold = k => BOUNTY13[k][4] * 150;
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) { const r = _ld.call(this, id, ...a), st = this.st; if (!st) return r; const S = bty13St(st);
    for (const b in BOUNTY13) { const [, , , , lv, map] = BOUNTY13[b]; if (map !== id || S[b] !== 'on' || this.elites.some(e => e.bounty13 === b)) continue;
      const M = MAPS[map], P = spot12('bty13:' + b, map, { near: [Math.floor(M.rows[0].length / 2), Math.floor(M.rows.length / 2)] })[0]; if (!P) continue; const img = roamBig12(b) || roamImg12(b); if (!img) continue;
      const e = new Entity({ roam: 1, sp: b, lv, x: P[0], y: P[1], dir: 'down', img, bounty13: b, aggro: false }); e.home = [P[0], P[1], 'down']; e.timer = rnd(30, 90); e.px = e.x * 16; e.py = e.y * 16;
      if (!(e.x === this.p.x && e.y === this.p.y)) { this.elites.push(e); if (this.roam12) this.roam12.list.push(e); else this.roam12 = { map: id, list: [e] }; } }
    return r; }; }
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, ...a) {
    if (!e.bounty13) return yield* _rf.call(this, e, ...a); const st = this.st, b = e.bounty13, [n, , , , lv] = BOUNTY13[b], p = this.p; e.chase = 0;
    p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; st.dir = p.dir; Sound.sfx('exclaim'); yield* say('懸賞魔物「' + n + '」！');
    const res = yield* this.battleScript({ sp: b, lv, kind: 'elite', solo: 1, bounty12: 1 });
    if (res === 'win') { this.roamDrop12(e); bty13St(st)[b] = 'down'; Sound.jingle('item'); yield* say('打倒了懸賞魔物「' + n + '」！\n回王都的冒險者公會，找蓋爾報告吧。'); }
    else if (this.elites.includes(e)) { e.calmUntil = (st.steps || 0) + ROAM12.CALM; e.moving = false; } }; }
{ const _nap = Overworld.prototype.roamNap12; Overworld.prototype.roamNap12 = function (list, now) { return _nap.call(this, list.filter(e => !e.bounty13), now); }; }

/* ---------- 賞金獵人蓋爾 ---------- */
Object.assign(Events, {
  *bountyBoard13(ow) { const st = Game.st, S = bty13St(st);
    if (!st.flags.bty13Met) { st.flags.bty13Met = 1; yield* sayAll(['我是賞金獵人蓋爾。公會的懸賞單，現在歸我管。', '這幾張是最近才貼出來的——都是比一般魔物大上一號、還會一招拿手絕活的傢伙。', '你去過的地方、或是你夠格對付的傢伙，我才會把懸賞交給你。接下以後，牠就會在那附近出沒。']); }
    // report first
    for (const b in BOUNTY13) if (S[b] === 'down') { const [n, , , , , , , item] = BOUNTY13[b], g = bty13Gold(b); S[b] = 'done'; st.money += g; st.bag[item] = (st.bag[item] || 0) + 1; Sound.jingle('item');
      yield* say('「' + n + '」的懸賞完成了！幹得好。'); yield* itemGet('得到了賞金 ' + g + ' G 和' + ITEMS[item].n + '！');
      if (Object.keys(BOUNTY13).every(k => S[k] === 'done')) yield* sayAll(['……全部的懸賞都被你解決了。', '你就是貨真價實的賞金獵人了。（得到了稱號「賞金獵人」）']); }
    while (true) { const keys = Object.keys(BOUNTY13);
      const opts = keys.map(k => { const [n, , , , lv, map] = BOUNTY13[k], s = S[k]; if (!bty13Seen(k, st)) return { t: '？？？', r: '還沒開放', col: UIC.dis };
        return { t: n + '　Lv' + lv, r: s === 'done' ? '完成' : s === 'on' ? MAPS[map].name : '未接', col: s === 'done' ? UIC.dis : s === 'on' ? UIC.warm : UIC.accent }; });
      const r = yield* ask('要看哪一張懸賞？', opts.concat(['離開'])); if (r < 0 || r >= keys.length) return;
      const k = keys[r], [n, , , , lv, map, sig, item] = BOUNTY13[k];
      if (!bty13Seen(k, st)) { yield* say('這張懸賞還不能給你。去過那個地方，或是再變強一點再來吧。'); continue; }
      if (S[k] === 'done') { yield* say('「' + n + '」已經解決了。'); continue; }
      yield* say('懸賞「' + n + '」Lv' + lv + '\n出沒：' + MAPS[map].name + '　招牌技「' + MOVES[sig].n + '」');
      if (S[k] === 'on') { yield* say(MOVES[sig].n + '：' + MOVES[sig].d); continue; }
      if (yield* yesNo('賞金 ' + bty13Gold(k) + ' G＋' + ITEMS[item].n + '。\n要接下這張懸賞嗎？')) { S[k] = 'on'; Sound.sfx('item'); yield* say('「' + n + '」會在' + MAPS[map].name + '出沒。小心牠的「' + MOVES[sig].n + '」。'); } } },
});
MAPS.guild.npcs.push({ id: 'bountyBoard13', x: 8, y: 6, dir: 'left', look: 'traveler', name: '賞金獵人蓋爾' });
delete mapCache.guild;
NPC_ROLES.任務.push('bountyBoard13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.bountyBoard13 = '王都・冒險者公會';
TITLES.push({ id: 'bty13all', n: '賞金獵人', d: '完成蓋爾的 8 張懸賞。', st: { atk: 2, spa: 2, crit: 2 }, ok: st => Object.keys(BOUNTY13).every(k => bty13St(st)[k] === 'done') });
ACHIEVEMENTS.push({ id: 'bty13_all', n: '懸賞全數討伐', d: '完成冒險者公會蓋爾的 8 張懸賞。', cat: '戰鬥', ok: st => Object.keys(BOUNTY13).every(k => bty13St(st)[k] === 'done') });
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); if (!st.flags.bty13Met) return; const S = bty13St(st), keys = Object.keys(BOUNTY13), done = keys.filter(k => S[k] === 'done').length;
    const on = keys.filter(k => S[k] === 'on' || S[k] === 'down').map(k => BOUNTY13[k][0] + (S[k] === 'down' ? '（回報）' : '（' + MAPS[BOUNTY13[k][5]].name + '）'));
    L.push({ n: '公會的懸賞', t: done === keys.length ? '完成：8 張懸賞全部解決了。' : '賞金獵人蓋爾的懸賞，完成 ' + done + '／' + keys.length + '。' + (on.length ? '進行中：' + on.join('、') + '。' : ''), done: done === keys.length, rw: '賞金・屬性果實・稱號「賞金獵人」', cat: '支線' }); }; }
// on the map they get the same orange 懸賞 ring and label as the first eight
{ const _wp = owWorldPost; owWorldPost = function (ow, x) { const L = (ow.elites || []).filter(e => e.roam && e.bounty13 && e.img), keep = L.map(e => e.img);
    for (const e of L) e.img = { ...e.img, big: 0 }; try { _wp(ow, x); } finally { L.forEach((e, i) => { e.img = keep[i]; }); }
    if (L.length) champDraw12(ow, x, L.map(e => Object.assign(Object.create(e), { bounty12: 1 }))); }; }
