/* ===================== v12.39 第三章 序章「東方的海」（破關後，推薦 Lv44〜50） =====================
   國王「需要你的時候，我會再派莉婭去找你」——破關後去見國王，莉婭帶回東方港町「潮鳴港」的急報：
   海上起了一場不散的霧，出海的船一艘也沒回來，霧裡聽得到歌聲。
   潮鳴港 → 港務長瑪蓮 → 珊瑚海岸的老漁夫巴特（海蠟耳塞）→ 沉船灣深處的霧笛魔女「賽蓮」→ 霧散了，船回來了 → 序章完。
   旗標 st.flags.ch3：1 國王・莉婭說明／2 到了潮鳴港（莉婭）／3 瑪蓮說明／4 拿到耳塞／5 打倒賽蓮／6 完成。 */
const ch3 = (st = Game.st) => (st && st.flags && st.flags.ch3) || 0;
const setCh3 = n => { const f = Game.st.flags; f.ch3 = Math.max(f.ch3 || 0, n); };

/* ---------- items ---------- */
Object.assign(ITEMS, {
  earplug13: { n: '海蠟耳塞', key: 1, price: 0, sell: 0, cat: '重要物品', d: '老漁夫巴特用海蠟捏的耳塞。帶在身上，被催眠時有 70% 會擋下來。' },
  tideScale13: { n: '潮將的鱗片', key: 1, price: 0, sell: 0, cat: '重要物品', d: '霧笛魔女留下的一片藍黑色鱗片。冰冷，摸起來像深海的水。' },
});
GATHER_KINDS.shell13 = ['貝殼堆', 'moonDew', [1, 2], [['crystal', 0.15]]]; GATHER_IMG.shell13 = GATHER_IMG.crystal;
PV('earplug13', v => ({ triggers: [{ on: EVT.STATUS_APPLY, phase: 'PRE', role: 'tgt', cond: { statusIs: 'slp' }, chance: 0.7, effects: [{ type: 'cancel', why: 'earplug13' }, { type: 'message', target: 'self', text: '海蠟耳塞擋住了歌聲！' }] }] }), { n: '海蠟耳塞' });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (st && st.bag && st.bag.earplug13) s.passives.push({ key: 'earplug13', v: 1, src: 'other' }); return s; }; }
// the reward: 潮鳴貝殼 (trait 潮音: water damage taken −25%)
GEAR.tideShell13 = { n: '潮鳴貝殼', slot: 'acc', t: 7, st: { hp: 30, spd: 6, def: 4, atk: 4, spa: 4 }, sp: {}, fx: ['tide13'], trait: 'tide13', kind: '飾品', d: '潮鳴港的港務長送的大貝殼。貼在耳邊，聽得到很遠很遠的浪聲。', look: (GEAR.qHeroCrest || {}).look };
PV('fx.tide13', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 0 }, effects: [{ type: 'heal', target: 'self', pct: 0.03, kind: 'regen', quiet: 1 }] }, { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.02, kind: 'regen', quiet: 1 }] }] }), { n: '潮音' }); // v12.76: 水傷害 −25% → 回合結束回 HP
ACC_TRAIT.tide13 = ['潮音', '回合結束回復 3% HP（打頭目時 2%）', ['潮鳴貝殼']]; if (typeof SPECIALS !== 'undefined') SPECIALS.tide13 = { n: '潮音', d: '回合結束回復 3% HP（打頭目時 2%）。', cat: '回復' };
if (typeof BP_RARE !== 'undefined') BP_RARE.add('tideShell13');

/* ---------- monsters: the shore and the cave (recoloured Q-version pictures) ---------- */
const SEA13 = { // key: [name, base, [hue, sat ×, light ×], role, panel level, dex]
  tideShrimp13: ['潮汐蝦兵', 'creekShrimp', [-20, 1.3, 1.0], 'phys', 46, '在潮池裡排隊巡邏的大蝦。鉗子一夾就能把貝殼夾碎。'],
  coralTurtle13: ['珊瑚甲龜', 'mossTurtle', [-110, 1.2, 1.05], 'tank', 46, '背上長滿珊瑚的海龜。慢吞吞的，殼卻硬得像礁岩。'],
  fogOwl13: ['海霧鴞', 'barnOwl', [170, 0.5, 1.1], 'fast', 46, '霧起來以後才飛到海邊的貓頭鷹。翅膀拍起來沒有一點聲音。'],
  surfCrab13: ['浪花蟹', 'reedCrab', [-40, 1.3, 1.0], 'phys', 46, '浪打上來的時候才會從沙裡跳出來的螃蟹。'],
  drownSailor13: ['溺亡水手', 'fallenSoldier', [170, 0.9, 0.85], 'phys', 48, '很久很久以前沉在灣裡的船員。被歌聲叫醒，又拿起了生鏽的魚叉。'],
  mistWraith13: ['霧之怨靈', 'wraith', [160, 0.6, 1.15], 'mage', 48, '在霧裡飄來飄去的怨靈。靠近的時候，耳邊會響起好幾個人的低語。'],
  deepEel13: ['深海鰻', 'mireEel', [150, 1.1, 0.8], 'fast', 48, '從灣底的深溝游上來的大鰻魚。身上的花紋在黑暗裡會發光。'],
};
const SIREN13 = 'siren13', SEA_MUL13 = 0.95; // v12.65: the shore and the cove ×0.95 (fair gear T7 q3 at the map's level won only 4/12 in 沉船灣)
for (const k in SEA13) { const [n, b, look, role, plv, dex] = SEA13[k], B = SPECIES[b]; if (!B) { if (typeof bvErr === 'function') bvErr('ch3', 'base ' + b); continue; }
  SPECIES[k] = { ...B, n, elite: 0, boss: 0, rare: 0, exp: Math.round((B.exp || 40) * 1.4), gold: Math.max(3, B.gold || 3), dex, ch3: 1 };
  MON_PANEL[k] = LATE_PANEL13(role, SEA_MUL13); HD_RIG_OF[k] = (BATTLE_PXC[b] || chibiOwn(b)) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[k] = HD_RIG_OF[k];
  if (ART[b]) ART[k] = artRecolor(ART[b], look[0], look[1], look[2]); else if (ART[HD_RIG_OF[k]]) ART[k] = ART[HD_RIG_OF[k]];
  const E = DEF.enemies[b]; defPut('enemies', k, { tags: ['foe', 'fam:' + (B.fam || 'beast')], skills: E ? E.skills.slice() : ['m_tackle'], fam: B.fam, trait: null, profile: E ? E.profile : 'brute', script: null, metadata: { n } }); }
// 霧笛魔女「賽蓮」: the swamp witch's picture, sea-coloured
{ const b = 'bogWitch', B = SPECIES[b];
  SPECIES[SIREN13] = { ...B, n: '霧笛魔女「賽蓮」', boss: 1, elite: 0, fam: 'spirit', exp: 2800, gold: 0, drop: null, ch3: 1, learn: [], dex: '在沉船灣唱歌的魔女。她的歌讓霧不會散，也讓聽到的人沉沉睡去。她說，自己是在替「潮將」看守這片海。' };
  { const P = MON_PANEL.frostQueen || ch2Panel(40, 'mage', 'boss'); MON_PANEL[SIREN13] = { ...P, hp: Math.round(P.hp * 0.9), spa: Math.round(P.spa * 0.9) }; } HD_RIG_OF[SIREN13] = (BATTLE_PXC[b] || chibiOwn(b)) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[SIREN13] = HD_RIG_OF[SIREN13];
  if (ART[b]) ART[SIREN13] = artRecolor(ART[b], 150, 1.1, 1.0); }
const SEA_LOOK13 = k => k === SIREN13 ? [150, 1.1, 1.0] : SEA13[k] && SEA13[k][2];
{ const _ci = chibiImage; chibiImage = function (k) { const L = SEA_LOOK13(k); if (!L || chibiOwn(k)) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k]; const src = _ci(k === SIREN13 ? 'bogWitch' : SEA13[k][1]); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const [dh, ks, kl] = L, c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]), [r, g, bb] = hex2rgb(hsl2hex(h + dh, Math.min(1, s * ks), Math.min(1, l * kl))); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }
// her songs
Object.assign(MOVES, {
  m13_songWave: { n: '怒濤之歌', t: '水', cat: '特', pow: 90, acc: 100, pp: 10, foe: 1, cls: 'area', d: '唱出的高音化成一道巨浪打過來。' },
  m13_mistSong: { n: '霧之歌', t: '一般', cat: '變', pow: 0, acc: 85, pp: 10, foe: 1, cls: 'sound', st: 'slp', d: '在霧裡響起的歌聲，讓聽到的人睡著。' },
  m13_drownCall: { n: '溺者的呼喚', t: '一般', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'buff', d: '呼喚沉在灣底的水手，叫一個溺亡水手出來。' },
  m13_denseFog: { n: '濃霧', t: '一般', cat: '變', pow: 0, acc: null, pp: 3, foe: 1, cls: 'guard', smoke: 3, d: '讓霧變得更濃。3 回合內比較難被打中。' },
  m13_maelstrom: { n: '渦潮葬送', t: '水', cat: '特', pow: 150, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '把四周的海水捲成了巨大的漩渦！', warn: '（渦潮要來了！防禦！）', d: '蓄力一回合，把對手捲進漩渦沉到海底。' },
});
EFFECT_TYPES.drownCall13 = { exec(core, ef, ctx) { const u = ctx.owner; EFFECT_TYPES.summon.exec(core, { sp: 'drownSailor13', count: 1, kind: 'minion', maxSide: 3, lv: Math.max(30, (u.lv || 50) - 6) }, ctx); } };
{ const PIC = { m13_songWave: 'm_tidalWave', m13_mistSong: 'm_lullaby', m13_drownCall: 'm9_call12', m13_denseFog: 'm6_smokeBomb', m13_maelstrom: 'm_whirlpool' };
  for (const id in PIC) { if (MFX[PIC[id]]) { MFX[id] = MFX[PIC[id]]; MOVES[id].fx = id; } else if (typeof bvErr === 'function') bvErr('ch3', 'fx ' + PIC[id]);
    const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); if (id === 'm13_drownCall') { d.target = 'self'; d.noHitRoll = true; d.effects = [{ type: 'drownCall13', target: 'self' }]; }
    d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); defPut('skills', id, { ...d, override: true });
    if (MON_CLASS[MOVES[id].cls] && !MON_CLASS[MOVES[id].cls].includes(id)) MON_CLASS[MOVES[id].cls].push(id); } }
defPut('enemies', SIREN13, { tags: ['foe', 'fam:spirit'], skills: ['m13_songWave', 'm_chillMist', 'm13_mistSong', 'm13_drownCall', 'm13_denseFog', 'm13_maelstrom'], fam: 'spirit', trait: null, profile: 'trick', script: null, metadata: { n: '霧笛魔女「賽蓮」' } });
B12_SCRIPT[SIREN13] = function (core, u) { const hero = core.units.find(q => q.hero && !q.down), minions = core.alive(u.side).filter(q => q !== u && q.minion).length, half = u.res.hp <= u.max.hp * 0.5, calls = u.data.calls13 || 0;
  if (!u.data.fog13 && half) { u.data.fog13 = 1; return { type: 'skill', skill: 'm13_denseFog', targets: [u.id] }; }
  if (core.round >= 4 && core.round % 4 === 0) return b12Charge(core, u, 'm13_maelstrom'); // 渦潮葬送: charged on rounds 4, 8, 12 …
  if (minions < 1 && ((calls === 0 && core.round >= 3) || (calls === 1 && half))) { u.data.calls13 = calls + 1; return { type: 'skill', skill: 'm13_drownCall', targets: [u.id] }; } // two sailors at most: one early, one after half HP
  if (hero && !core.hasStatus(hero, 'slp') && core.round % 4 === 2) return { type: 'skill', skill: 'm13_mistSong', targets: [hero.id] }; // 霧之歌 on rounds 2, 6, 10 … (never right before the whirlpool lands)
  return b12Pick(core, u, ['m13_songWave', 'm13_songWave', 'm_chillMist']); };
defPut('mechanics', 'b12_' + SIREN13, { make: u => ({ triggers: [{ on: EVT.SUMMON, phase: 'POST', cond: { ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'message', target: 'self', text: '（灣底的水手被歌聲叫醒了……）' }] }] }) });

/* ---------- maps ---------- */
const CH3_ROWS = {
  harbor13: ['TTTTTTTTTTTTTTTTTTTT', 'T..................T', 'T..................T', 'T..................T', 'T..................T', 'T...:.....:.....:..T', 'T:::::::::::::::::::', 'T.........:........T', 'T..S......:....f...T', 'T...f.....:........T', 'T.........:........T', 'To........:......o.T',
    'WWWWWWWWWW=WWWWWWWWW', 'WWWWWWWWWW=WWWWWWWWW', 'WWWWWWWWWW=WWWWWWWWW', 'WWWWWWWWWW=WWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWW'],
  coralCoast13: ['TTTTTTTTTTTTTTTTWWWWWWWW', 'TT....,....T....,WWWWWWW', 'T.......o.......,,WWWWWW', ':::::::.........,,WWWWWW', 'T......:....T...,,,WWWWW', 'TT.....:.......o.,,WWWWW', 'T##....:.........,,,WWWW', 'T##....:....WW....,,WWWW',
    'T......:...WWWW...,,WWWW', 'TT.....:...WWW....,,,WWW', 'T......::.........,,WWWW', 'T.o.....:...T.....,,WWWW', 'T.......:..........,WWWW', 'TT##....:......o...,WWWW', 'T###....:..........,,WWW', 'T.......:....##....,,WWW', 'T..T....::...##.....,WWW', 'T........:..........,WWW',
    'TT.......:.....WW...,WWW', 'T.....o..:....WWWW..,WWW', 'T........:.....WW...,,WW', 'T.##.....:..........,,WW', 'T.##.....:.....o....,,WW', 'TT.......::.........,WWW', 'T..........:........,WWW', 'T....T.....:....T...,WWW', 'T..........:........,WWW', 'T.o........:.....##.,WWW',
    'T..........:.....##.,WWW', 'TT.........:........,WWW', 'TTT........:.......,,WWW', 'TTTT.......:.......,WWWW', 'TTTTT.....::......,,WWWW', 'TTTTTT....:.......,WWWWW', 'TTTTTTT...:......,,WWWWW', 'TTTTTTTTTTTTTTTTTTWWWWWW'],
  wreckCove13: ['RRRRRRRRRRRRRRRRRRRR', 'RRRRRRRsssssRRRRRRRR', 'RRRRRsssssssssRRRRRR', 'RRRRssWWsssssWWsRRRR', 'RRRRsssssssssssssRRR', 'RRRRRsssssssssssRRRR', 'RRRRRRRRsssRRRRRRRRR', 'RRsssssssssssssssRRR', 'RRssWWWWssssWWWWssRR',
    'RRssWWWWssssWWWWssRR', 'RRsssssssssssssssssR', 'RRRRsRRRRssRRRRRsRRR', 'RRRRsRRRRssRRRRRsRRR', 'RRsssssRRssRRsssssRR', 'RRsWWssRRssRRssWWsRR', 'RRsWWssssssssssWWsRR', 'RRssssRRRRRRRRssssRR', 'RRRssRRRRRRRRRRssRRR', 'RRRsssssssssssssssRR',
    'RRRssWWWsssssWWWssRR', 'RRRssWWWsssssWWWssRR', 'RRRsssssssssssssssRR', 'RRRRRRRRsssRRRRRRRRR', 'RRRRRRRRsssRRRRRRRRR', 'RRRRRRRRRsssRRRRRRRR', 'RRRRRRRRRRsRRRRRRRRR'],
};
for (const id in CH3_ROWS) { const R = CH3_ROWS[id]; if (R.some(r => r.length !== R[0].length) && typeof bvErr === 'function') bvErr('ch3', 'rows ' + id); }
const LATE_GEAR13 = () => { const S = new Set(); for (const m of ['emberPass', 'lavaTunnel', 'duskFort1', 'duskFort2', 'iceCave', 'frostField']) for (const k of (MAPS[m] && MAPS[m].gearPool) || []) if (GEAR[k]) S.add(k); return [...S]; };
MAPS.harbor13 = { name: '潮鳴港', music: 'lake', outdoor: 1, border: 'T', popup: 1, theme: 'beach13', rows: CH3_ROWS.harbor13, type: '城鎮',
  buildings: [{ kind: 'seaInn13', x: 2, y: 1, w: 5, h: 4, door: 2, to: ['seaInn13', 4, 6], sign: 1, signAs: 'inn' }, { kind: 'seaShop13', x: 8, y: 1, w: 5, h: 4, door: 2, to: ['seaShop13', 4, 6], sign: 1, signAs: 'shop' }, { kind: 'seaHouse13', x: 14, y: 1, w: 5, h: 4, door: 2, to: ['harborOffice13', 4, 6] }],
  signs: { '3,8': '「潮鳴港」\n海風帶著鹽味的東方港町。\n→ 珊瑚海岸（建議Lv44以上）' },
  edgeWarps: [{ dir: 'right', at: [6], to: ['coralCoast13', 0, 3, 'right'] }],
  npcs: [
    { id: 'coachH13', x: 2, y: 7, dir: 'down', look: 'coachman', name: '馬車夫' },
    { id: 'liaPort13', x: 12, y: 7, dir: 'down', look: 'knightLia', name: '見習騎士莉婭', show: st => ch3(st) >= 1 },
    { id: 'seaKid13', x: 10, y: 15, dir: 'down', look: 'seaKid13', name: '小澪', show: st => !st.flags.siren13 },
    { id: 'seaKidHappy13', x: 9, y: 10, dir: 'right', look: 'seaKid13', name: '小澪', show: st => !!st.flags.siren13 },
    { id: 'seaDad13', x: 11, y: 10, dir: 'left', look: 'sailor13', name: '漁夫托馬', show: st => !!st.flags.siren13 },
    { id: 'sailor13', x: 6, y: 9, dir: 'right', look: 'sailor13', name: '水手', walk: 1 },
    { id: 'seaGran13', x: 15, y: 9, dir: 'down', look: 'old', name: '老婆婆' },
  ],
  encounters: [], items: [{ id: 'hb1', x: 18, y: 10, item: 'megaEther', n: 1 }] };
MAPS.seaInn13 = CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnnB', 'BnCCCCCCnB', 'nnnnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'seaInnkeeper13', x: 4, y: 2, dir: 'down', look: 'woman2', name: '海鷗旅店' }, { id: 'seaInnGuest13', x: 8, y: 5, dir: 'left', look: 'man', name: '商人' }], { name: '海鷗旅店', music: 'lake', back: ['harbor13', 4, 5], type: '室內' });
MAPS.seaShop13 = CH2_ROOM(['xxxxxxxxxx', 'xhhxwwxhhx', 'nnnnnnnnnn', 'CCCnnnnVVn', 'nnnnnnnVVn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'seaClerk13', x: 1, y: 2, dir: 'down', look: 'merchant', name: '潮鳴港商店' }], { name: '潮鳴港商店', music: 'lake', back: ['harbor13', 10, 5], type: '室內' });
MAPS.harborOffice13 = CH2_ROOM(['xxxxxxxxxx', 'xkkxwwxkkx', 'nnnnnnnnKK', 'CCCCCnnnnn', 'nnnnnnnQQn', 'nnnnnnnQQn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'harborMaster13', x: 2, y: 2, dir: 'down', look: 'harborMaster13', name: '港務長瑪蓮' }, { id: 'harborClerk13', x: 6, y: 4, dir: 'right', look: 'sailor13', name: '港務所的水手' }], { name: '港務所', music: 'lake', back: ['harbor13', 16, 5], type: '室內' });
MAPS.coralCoast13 = { name: '珊瑚海岸', music: 'lake', outdoor: 1, border: 'T', battleBg: 'beach13', popup: 1, theme: 'beach13', fog13: 1, rows: CH3_ROWS.coralCoast13, type: '野外',
  edgeWarps: [{ dir: 'left', at: [3], to: ['harbor13', 19, 6, 'left'] }],
  signs: {}, npcs: [
    { id: 'fisher13', x: 15, y: 10, dir: 'left', look: 'fisher13', name: '老漁夫巴特' },
    { id: 'wreckDoor13', x: 10, y: 34, dir: 'down', look: 'caveDoor', name: '沉船灣' },
  ],
  items: [{ id: 'cc1', x: 4, y: 1, item: 'elixir', n: 1 }, { id: 'cc2', x: 1, y: 20, gold: 6000 }, { id: 'cc3', x: 16, y: 26, item: 'megaEther', n: 2 }, { id: 'cc4', x: 19, y: 9, item: 'megaPotion', n: 2 }, { id: 'cc5', x: 4, y: 30, item: 'attrReset', n: 1 }],
  gathers: [{ id: 'gcc1', x: 13, y: 3, kind: 'shell13', mat: 'moonDew' }, { id: 'gcc2', x: 5, y: 31, kind: 'shell13', mat: 'moonDew' }, { id: 'gcc3', x: 3, y: 15, kind: 'mana', mat: 'manaHerb' }],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['tideShrimp13', 45, 47, 25], ['coralTurtle13', 45, 47, 25], ['fogOwl13', 45, 47, 25], ['surfCrab13', 45, 47, 25]] }] };
MAPS.coralCoast13.gearPool = LATE_GEAR13();
MAPS.wreckCove13 = { name: '沉船灣', music: 'ruins', border: 'R', battleBg: 'seacave13', encAll: 1, popup: 1, theme: 'seacave13', rows: CH3_ROWS.wreckCove13, type: '迷宮',
  exit: { x: 10, y: 25, to: ['coralCoast13', 10, 33] },
  boss: { sp: SIREN13, lv: 50, x: 9, y: 2, flag: 'siren13', ev: 'sirenBoss13' },
  npcs: [{ id: 'mast13a', x: 5, y: 4, dir: 'down', look: 'mast13', name: '斷掉的桅杆' }, { id: 'mast13b', x: 14, y: 4, dir: 'down', look: 'mast13', name: '斷掉的桅杆' }, { id: 'mast13c', x: 3, y: 10, dir: 'down', look: 'mast13', name: '斷掉的桅杆' }, { id: 'mast13d', x: 16, y: 18, dir: 'down', look: 'mast13', name: '斷掉的桅杆' }],
  items: [{ id: 'wc1', x: 2, y: 13, item: 'megaPotion', n: 2 }, { id: 'wc2', x: 17, y: 13, item: 'elixir', n: 1 }, { id: 'wc3', x: 3, y: 21, gold: 8000 }, { id: 'wc4', x: 16, y: 21, item: 'megaEther', n: 2 }, { id: 'wc5', x: 2, y: 7, item: 'talentReset', n: 1 }],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['drownSailor13', 47, 49, 35], ['mistWraith13', 47, 49, 35], ['deepEel13', 48, 49, 30]] }] };
MAPS.wreckCove13.gearPool = LATE_GEAR13();
if (typeof MAP_TYPES !== 'undefined') Object.assign(MAP_TYPES, { harbor13: '城鎮', coralCoast13: '野外', wreckCove13: '迷宮' });
Object.assign(EXPLORE, { harbor13: '潮鳴港', coralCoast13: '珊瑚海岸', wreckCove13: '沉船灣' });
if (typeof BATTLE2_MAPS !== 'undefined') { BATTLE2_MAPS.add('coralCoast13'); BATTLE2_MAPS.add('wreckCove13'); }
if (typeof COACH9 !== 'undefined') COACH9.harbor13 = 'coachH13';
if (typeof MAP_G !== 'undefined') MAP_G = null;

/* ---------- the carriage gets a new stop ---------- */
{ const _cc = ch2Coach; ch2Coach = function* (ow, here) { const st = Game.st;
    if (ch3(st) < 1) return yield* _cc.call(this, ow, here);
    const r = yield* ask('要去哪裡呢？（車資 200 G）', [here === 'harbor13' ? '王都艾爾德蘭' : '潮鳴港（東方的港町）', '其他地方', '不用了']); if (r < 0 || r === 2) return;
    if (r === 1) return yield* _cc.call(this, ow, here);
    if (!(yield* coachPay13(st))) return; Sound.sfx('run'); yield* fadeOut(20);
    if (here === 'harbor13') ow.load('capital', 5, 27, 'down'); else ow.load('harbor13', 3, 7, 'right'); yield* wait(10); yield* fadeIn(20);
    if (here !== 'harbor13') yield* ch3Arrive(ow); }; }
Events.coachH13 = function* (ow) { yield* ch2Coach(ow, 'harbor13'); };

/* ---------- the story ---------- */
{ const _k = Events.king; Events.king = function* (ow) { const st = Game.st, f = st.flags;
    if ((f.ch2 || 0) < 10 || ch3(st) >= 1) { if (ch3(st) >= 1 && ch3(st) < 6) { yield* say('國王：「東方的事……就拜託你了。潮鳴港在王都的東邊，搭馬車就能到。」'); return; } return yield* _k.call(this, ow); }
    yield* sayAll(['國王：「勇者，你來得正好。」', '國王：「我說過，需要你的時候會派莉婭去找你——結果她自己先跑回來了。」']);
    Sound.sfx('door'); yield* sayAll(['莉婭：「陛下！還有……你也在啊，太好了！」', '莉婭：「我剛從東方的港町『潮鳴港』回來。那裡……出事了。」', '莉婭：「十天前，海上起了一場霧。到現在都沒有散。」',
      '莉婭：「出海的漁船、商船……一艘也沒有回來。」', '莉婭：「而且港口的人說，霧最濃的晚上，會從海的那一邊傳來歌聲。」']);
    yield* sayAll(['國王：「……東方的海。影將莫爾德消失前，說過剩下的三將在『東方的海、南方的沙漠、天空之上』。」', '國王：「如果這場霧是四將的手筆……普通的騎士去了也只會迷路。」',
      '國王：「勇者，能請你走一趟潮鳴港嗎？王都的馬車夫會送你過去。」', '莉婭：「我也一起去！港務長瑪蓮是我的朋友，她會跟你說明的。」']);
    setCh3(1); Sound.jingle('item'); yield* say('（第三章 序章「東方的海」開始了！）\n（王都的馬車可以去「潮鳴港」了）'); saveGame(); }; }
function* ch3Arrive(ow) { const st = Game.st; if (ch3(st) >= 2) return;
  setCh3(2); yield* sayAll(['……馬車停在了海邊的港町。', '空氣又濕又冷。港口外面，白色的霧像牆一樣立在海上，一動也不動。', '碼頭上停著幾艘船，卻一個出海的人也沒有。']);
  yield* say('莉婭：「這裡就是潮鳴港。港務所在最右邊那棟藍屋頂的房子，瑪蓮在裡面。」'); }
Object.assign(Events, {
  *liaPort13(ow) { const n = ch3();
    if (n <= 2) { yield* say('莉婭：「港務所在最右邊那棟藍屋頂的房子。瑪蓮會跟你說明的。」'); return; }
    if (n === 3) { yield* say('莉婭：「珊瑚海岸在港口的東邊。老漁夫巴特每天都在海邊……說是在等兒子的船。」'); return; }
    if (n === 4) { yield* say('莉婭：「沉船灣……以前的人說，那裡是船的墳場。小心一點。」\n（珊瑚海岸的最南端）'); return; }
    if (n === 5) { yield* say('莉婭：「霧散了！船一艘一艘回來了……快去港務所告訴瑪蓮吧！」'); return; }
    yield* sayAll(['莉婭：「潮將……在海的另一邊。」', '莉婭：「要渡海的話，得要一艘穿得過暴風的船。我會去問問看王都的造船匠。」', '莉婭：「下一次——我們一起出海吧！」']); },
  *harborMaster13(ow) { const st = Game.st, n = ch3(st);
    if (n <= 0) { yield* say('港務長瑪蓮：「港口現在不開放出海。抱歉了。」'); return; }
    if (n <= 2) { setCh3(3);
      yield* sayAll(['港務長瑪蓮：「你就是王都的勇者？莉婭跟我說了好多你的事。」', '瑪蓮：「……就像你看到的，港口被霧封住了。」', '瑪蓮：「十天前的晚上，霧從沉船灣那邊慢慢飄過來。出海的十二艘船，一艘都沒有回來。」',
        '瑪蓮：「漁夫們說，霧最濃的時候，會聽到女人在唱歌。聽著聽著，就會想睡覺……」', '瑪蓮：「沉船灣在珊瑚海岸的最南端。那裡以前是船的墳場，五百年前的沉船到現在都還擱在海蝕洞裡。」',
        '瑪蓮：「去之前，先找海邊的老漁夫巴特吧。他年輕的時候進過沉船灣，也聽過那首歌。」']);
      yield* say('（到珊瑚海岸找老漁夫巴特）'); return; }
    if (n === 3) { yield* say('瑪蓮：「老漁夫巴特在珊瑚海岸的潮池旁邊。他的兒子托馬……也在那十二艘船上。」'); return; }
    if (n === 4) { yield* say('瑪蓮：「沉船灣在珊瑚海岸的最南端。拜託你了。」'); return; }
    if (n === 5) { setCh3(6); const g = 20000; st.money += g; const sh = makeGear('tideShell13', 4);
      yield* sayAll(['瑪蓮：「……霧散了。剛剛，第一艘船進港了！」', '瑪蓮：「船上的人都睡得好熟，像是做了很長的夢。大家都平安……全部都平安！」', '瑪蓮：「謝謝你。潮鳴港欠你一個大人情。」']);
      Sound.jingle('item'); yield* itemGet('得到了謝禮 ' + g + ' G！'); yield* itemGet('得到了' + gearName(sh) + '！');
      yield* sayAll(['瑪蓮：「……可是，那片鱗片。」', '瑪蓮：「藍黑色的鱗……老一輩的人說，那是住在東方深海的『潮將』的鱗片。」', '瑪蓮：「魔女說她是在替潮將『看守』這片海……那就表示，潮將還在海的另一邊。」']);
      yield* ch3Card(ow); saveGame(); return; }
    yield* say('瑪蓮：「港口又熱鬧起來了。等你準備好渡海，隨時來找我。」'); },
  *harborClerk13() { yield* say(ch3() >= 5 ? '水手：「船都回來了！今天晚上整個港口都要喝個痛快！」' : '水手：「港務長從霧起來那天就沒睡好覺。……我們這些人，也只能每天望著海。」'); },
  *fisher13(ow) { const st = Game.st, n = ch3(st);
    if (n < 3) { yield* say('老漁夫巴特：「……霧還沒散。我兒子的船，還在那片霧裡。」'); return; }
    if (n === 3) { setCh3(4); st.bag.earplug13 = 1;
      yield* sayAll(['老漁夫巴特：「瑪蓮叫你來的？……沉船灣啊。」', '巴特：「四十年前，我跟著老爸的船在霧裡迷了路，被浪推進了沉船灣。」', '巴特：「那時候我聽到了歌。好聽得不得了……聽著聽著，眼皮就重得抬不起來。」',
        '巴特：「老爸用海蠟塞住我的耳朵，我們才划得出來。」', '巴特：「拿去吧。這是我照著老爸的做法捏的。」']);
      Sound.jingle('item'); yield* itemGet(st.name + '得到了「海蠟耳塞」！\n（帶在身上，被催眠時有 70% 會擋下來）');
      yield* say('巴特：「沉船灣在海岸的最南端。……要是看到托馬，跟他說老爸在等他回來吃飯。」'); return; }
    if (n === 4) { yield* say('巴特：「沉船灣在海岸的最南端。耳塞別弄丟了。」'); return; }
    yield* say(st.flags.siren13 ? '巴特：「托馬回來了。……你看，那小子一回來就說肚子餓。」' : '巴特：「……」'); },
  *wreckDoor13(ow) { const n = ch3();
    if (n < 3) { yield* say('霧太濃了，洞口裡面什麼也看不見……\n（先去潮鳴港問問看吧）'); return; }
    if (yield* yesNo('沉船灣的入口。潮濕的風從洞裡吹出來，隱約聽得到……歌聲？\n要進去嗎？')) yield* ow.warp('wreckCove13', 10, 24, 'up'); },
  *mast13a() { yield* say('斷掉的桅杆。帆上的紋章已經褪得看不出來了。'); }, *mast13b() { yield* say('斷掉的桅杆。上面掛著一個生鏽的鈴鐺。'); },
  *mast13c() { yield* say('斷掉的桅杆。船身刻著「曙光軍・第七艦」……五百年前的船？'); }, *mast13d() { yield* say('斷掉的桅杆。旁邊的木板上，有人用刀刻了很多條線，像在數日子。'); },
  *sirenBoss13(ow) { const st = Game.st, f = st.flags; if (f.siren13) return;
    yield* sayAll(['擱淺的大船上，坐著一個藍色頭髮的女人。她正對著霧，輕輕地唱著歌。', '霧笛魔女「賽蓮」：「……又一個迷路的小船？」', '賽蓮：「不對……你身上有曙光的味道。是你打倒了莫爾德？」', '賽蓮：「潮將大人說過，這片海誰也不許過來。——就睡在這裡吧，跟那些水手一樣。」']);
    if (!st.bag.earplug13) yield* say('（耳朵裡什麼也沒塞……她的歌聲會讓人很容易睡著）');
    const res = yield* ow.battleScript({ sp: SIREN13, lv: MAPS.wreckCove13.boss.lv, kind: 'boss', id: SIREN13 });
    if (res !== 'win') return;
    f.siren13 = 1; ow.boss = null; setCh3(5); st.bag.tideScale13 = 1;
    yield* sayAll(['賽蓮：「……我的歌……停了……」', '賽蓮：「沒關係……你們的船，留在霧裡也沒有用……」', '賽蓮：「潮將大人……已經在海的另一邊……集結好了……」', '賽蓮化成了泡沫，消失在海水裡。只留下一片藍黑色的鱗片。']);
    yield* itemGet(st.name + '得到了「潮將的鱗片」！');
    yield* sayAll(['洞外的霧，像被風吹開一樣，慢慢散了。', '遠方的海面上，一艘、兩艘……漁船的帆出現了。', '（回潮鳴港，向港務長瑪蓮報告吧）']); ow.load('wreckCove13', ow.p.x, ow.p.y, ow.p.dir, true); saveGame(); },
  *seaKid13() { yield* say(ch3() >= 3 ? '小澪：「爸爸說好要帶海星回來給我的。……我在這裡等他。」' : '小澪：「爸爸的船還沒回來。霧好討厭……」'); },
  *seaKidHappy13() { yield* say('小澪：「爸爸回來了！還帶了好大一顆海星！謝謝你，勇者大哥哥！」'); },
  *seaDad13() { yield* sayAll(['漁夫托馬：「我們在霧裡一直聽到歌……醒來的時候，船已經漂回港口外面了。」', '托馬：「聽說是你救了我們？……老爸那邊，我會好好去報平安的。謝謝你！」']); },
  *sailor13() { yield* say(ch3() >= 5 ? '水手：「今晚的魚一定很肥！霧散了，海也笑了！」' : '水手：「霧裡會聽到歌？……我才不信。我只是不想出海而已。」'); },
  *seaGran13() { yield* say(ch3() >= 5 ? '老婆婆：「海神保佑……不，是勇者保佑。」' : '老婆婆：「五百年前，曙光軍也是從這個港口出海的。……那一次，回來的船也很少。」'); },
  *seaInnkeeper13() { yield* ch2Inn('海鷗旅店', { map: 'seaInn13', x: 4, y: 4, dir: 'up' }); },
  *seaInnGuest13() { yield* say(ch3() >= 5 ? '商人：「船可以開了！我的貨終於能運到東邊的島上了。」' : '商人：「本來要搭船去東方的島……被霧困在這裡十天了。」'); },
  *seaClerk13() { yield* shopFlow(SEA_SHOP13); },
});
const SEA_SHOP13 = ['superPotion', 'megaPotion', 'megaEther', 'elixir', 'antidote', 'awakening', 'parlyzHeal', 'burnHeal', 'returnWing'].filter(k => ITEMS[k] || GEAR[k]);
// the chapter card
function* ch3Card(ow) { Sound.stop(); UI.clear(); const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; yield* fadeOut(30); UI.push(box); Game.fade = 0;
  for (const s of ['第三章「東方的海」\n—— 序章 完 ——', '霧散了。\n但在海的另一邊，「潮將」正在集結。', '曙光的旅程，還沒有結束。\n\n（港務長瑪蓮在等你。準備好就去港務所吧）']) yield* say(s, { style: 'dark', y: 98 });
  UI.remove(box); ow.load(ow.map.id, ow.p.x, ow.p.y, ow.p.dir, true); yield* fadeIn(30); }
NPC_ROLES.任務.push('harborMaster13', 'fisher13', 'liaPort13'); NPC_ROLES.回復.push('seaInnkeeper13'); NPC_ROLES.商店.push('seaClerk13'); NPC_ROLES.情報.push('harborClerk13', 'seaKid13', 'seaKidHappy13', 'seaDad13', 'sailor13', 'seaGran13', 'seaInnGuest13', 'wreckDoor13', 'coachH13', 'mast13a', 'mast13b', 'mast13c', 'mast13d');
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { harborMaster13: '潮鳴港・港務所', fisher13: '珊瑚海岸', liaPort13: '潮鳴港', seaInnkeeper13: '潮鳴港・海鷗旅店', seaClerk13: '潮鳴港・商店' });

/* ---------- the quest log and the trophies ---------- */
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const n = ch3(st); if (!n) return;
    const T = { 1: '【推薦Lv44〜】東方的港町被濃霧困住了。搭王都的馬車去潮鳴港，找港務長瑪蓮。', 2: '【推薦Lv44〜】到潮鳴港的港務所，找港務長瑪蓮。', 3: '到潮鳴港東邊的珊瑚海岸，找老漁夫巴特。',
      4: '穿過珊瑚海岸，到最南端的沉船灣，找出霧和歌聲的源頭。（建議Lv47以上）', 5: '霧散了。回潮鳴港，向港務長瑪蓮報告。', 6: '完成：潮鳴港的霧散了。……「潮將」在海的另一邊。' };
    L.push({ n: '第三章 序章「東方的海」', t: T[Math.min(6, n)], done: n >= 6, rw: '潮鳴貝殼・20000 G', cat: '主線' }); }; }
ACHIEVEMENTS.push({ id: 'ch3_fog', n: '霧散之港', d: '讓潮鳴港的霧散去。', cat: '探索', ok: st => ch3(st) >= 6 });
