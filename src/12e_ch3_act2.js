/* ===================== v12.75 第三章正篇・第三批：沉月礁、海淵神殿、深海騎士歐托（〈曙光冒險-第三章正篇企劃〉主線 4〜5） =====================
   旗標 ch3m：5 往沉月礁／6 打倒幽靈船長／7 敲響潮音貝（沉月礁的潮水退了）／8 進了海淵神殿／9 打倒歐托、拿回一半的潮汐之珠／10 向珂拉村長報告（深潮城：第四批）。
   潮水：地圖字元 ~ ＝水退了才走得過（漲潮是海水）、^ ＝漲潮時浮起來的木板（退潮時是深坑）。沉月礁用 flags.tideLow14（敲響潮音貝之後一直退潮），
   海淵神殿用 flags.tide14（潮水機關切換：0 漲潮・1 退潮）。 */

/* ---------- monsters (Codex task AL part 3 has their pictures) ---------- */
const REEF14 = { // key: [name, base (rig & fallback art), look, role, moves, material, dex]
  moonStar14: ['月砂海星', ['pebble', 'flower'], [30, 1.2, 1.2], 'mage', ['m6_lunarTide', 'm_moonBeam', 'm6_regen', 'm_waterBomb'], 'deepPearl14', '月圓的晚上會爬上礁石的海星。身上的砂在月光下會發亮。'],
  fishman14: ['魚人戰士', ['lizardman'], [150, 1.1, 1.0], 'phys', ['m_spearThrust', 'm_tidalCrush', 'm_spearRush', 'm_scaleGuard'], 'tideScaleM14', '拿著珊瑚長矛、背著龜殼盾的魚人。一直守在沉月礁，不讓人靠近。'],
  coralGolem14: ['珊瑚魔像', ['crystalGolem', 'golem'], [-60, 1.2, 1.1], 'tank', ['m_golemFist', 'm_stoneWall', 'm_rockfall', 'm6_crystalClaw'], 'coralBranch14', '珊瑚和礁石堆成的魔像。胸口的光，聽說是被潮將的力量點亮的。'],
  inkOctopus14: ['墨影章魚', ['bogLeech'], [-120, 1.1, 0.8], 'mage', ['m_whiskerLash', 'm6_smokeBomb', 'm_waterBomb', 'm_hex'], 'deepPearl14', '眼睛周圍有白色花紋的章魚。一受驚就噴出墨汁，躲進黑影裡。'],
  drownKnight14: ['溺甲騎士', ['rustSoldier'], [170, 0.9, 0.9], 'phys', ['m_darkSlash', 'm_tidalCrush', 'm_scaleGuard', 'm_rend'], 'tideScaleM14', '沉在神殿裡的騎士。生鏽的鎧甲上長滿藤壺，頭盔裡只剩一點藍光。'],
  tideSpirit14: ['潮靈', ['mistWisp'], [-20, 1.2, 1.1], 'mage', ['m_whirlpool', 'm_waterBomb', 'm6_dew', 'm_chillMist'], 'deepPearl14', '神殿的潮水凝成的小精靈。水位一變，牠們就會跟著跑出來。'],
  anglerfish14: ['深淵鮟鱇', ['moonFish'], [-160, 0.8, 0.6], 'fast', ['m_bite', 'm_frostFang', 'm_tidalCrush', 'm_hex'], 'tideScaleM14', '頭上掛著一盞小燈的大嘴魚。在黑暗的水裡，那盞燈是牠最好的誘餌。'],
};
const GHOSTCAP14 = 'ghostCaptain14', OTTO14 = 'otto14';
for (const k in REEF14) { const [n, bases, look, role, moves, mat, dex] = REEF14[k], b = pickBase14(bases), B = SPECIES[b] || {};
  islePut14(k, n, b, look, B.fam || 'aquatic', moves, mat, dex, { exp: Math.round((B.exp || 100) * 1.5), gold: Math.max(18, B.gold || 18) }); if (SPECIES[k]) MON_PANEL[k] = LATE_PANEL13(role, SEA_MUL13); }
islePut14(GHOSTCAP14, '幽靈船長', 'wraithGeneral', [140, 0.8, 1.1], 'undead', ['m_darkSlash', 'm_soulSip', 'm_wail', 'm_hex'], 'deepPearl14',
  '二十年前沉在沉月礁的船的船長。潮將的力量把他叫醒以後，他就一直站在礁上，看著霧角群島的方向。', { elite: 1, exp: 820, gold: 0 });
{ const P = { ...(MON_PANEL.fallenStar || ch2Panel(44, 'phys', 'elite')) }; for (const [s, m] of Object.entries({ hp: 1.45, atk: 1.05, def: 1.0, spa: 1.2 })) if (P[s]) P[s] = Math.round(P[s] * m); MON_PANEL[GHOSTCAP14] = P; }
ELITE_TEXT[GHOSTCAP14] = ['（礁石上的破船裡，亮起了一盞綠色的燈……）', '幽靈船長：「……誰？離那個貝殼遠一點！」'];
if (typeof STORY_ELITES12 !== 'undefined') STORY_ELITES12.push(GHOSTCAP14);
if (typeof CHIBI_FLOAT !== 'undefined') for (const k of ['tideSpirit14', 'anglerfish14', GHOSTCAP14]) CHIBI_FLOAT.add(k);
if (typeof BOSS_MAT !== 'undefined') { BOSS_MAT[GHOSTCAP14] = 'deepPearl14'; BOSS_MAT[OTTO14] = 'tideScaleM14'; }
Object.assign(RARE14, { moonStar14: ['starDust', 0.08], coralGolem14: ['riftShard', 0.05], tideSpirit14: ['starShard', 0.04] });

/* ---------- 深海騎士 歐托 (boss, Lv58) ---------- */
Object.assign(MOVES, {
  m14_halberd: { n: '潮戟突刺', t: '水', cat: '物', pow: 95, acc: 100, pp: 10, foe: 1, cls: 'pierce', d: '用長戟往前一刺，戟尖帶著海水。' },
  m14_abyssWave: { n: '深淵怒濤', t: '水', cat: '特', pow: 80, acc: 100, pp: 10, foe: 1, cls: 'area', d: '從神殿深處捲起一道大浪，打全體。' },
  m14_vortexWall: { n: '渦流護壁', t: '水', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'guard', d: '讓海水繞著全身轉，物防・魔防提升。' },
  m14_judgment: { n: '海淵裁決', t: '水', cat: '物', pow: 160, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '高高舉起長戟，神殿的海水全被吸了起來！', warn: '（整片海水要壓下來了！防禦！）', d: '蓄力一回合，把整片海水壓下來。' },
  m14_callTide: { n: '喚潮', t: '一般', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'buff', d: '呼喚神殿的潮水，叫一隻潮靈出來。' },
});
EFFECT_TYPES.callTide14 = { exec(core, ef, ctx) { const u = ctx.owner; EFFECT_TYPES.summon.exec(core, { sp: 'tideSpirit14', count: 1, kind: 'minion', maxSide: 3, lv: Math.max(40, (u.lv || 58) - 4) }, ctx); } };
{ const PIC = { m14_halberd: 'm_tidalSpear', m14_abyssWave: 'm_tidalWave', m14_vortexWall: 'm_iceMirror', m14_judgment: 'm_moonTide', m14_callTide: 'm9_call12' };
  for (const id in PIC) { if (MFX[PIC[id]]) { MFX[id] = MFX[PIC[id]]; MOVES[id].fx = id; } else if (typeof bvErr === 'function') bvErr('ch3c', 'fx ' + PIC[id]);
    const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] });
    if (id === 'm14_callTide') { d.target = 'self'; d.noHitRoll = true; d.effects = [{ type: 'callTide14', target: 'self' }]; }
    if (id === 'm14_vortexWall') { d.target = 'self'; d.noHitRoll = true; d.effects = [{ type: 'stage', target: 'self', stats: { def: 1, spd: 1 }, dur: 3 }]; }
    d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); defPut('skills', id, { ...d, override: true });
    if (MON_CLASS[MOVES[id].cls] && !MON_CLASS[MOVES[id].cls].includes(id)) MON_CLASS[MOVES[id].cls].push(id); } }
{ const b = 'shadowGeneral', B = SPECIES[b] || SPECIES.boneKnight;
  SPECIES[OTTO14] = { ...B, n: '深海騎士 歐托', fam: 'undead', boss: 1, elite: 0, exp: 3600, gold: 0, drop: null, ch3: 1, mat: 'tideScaleM14', learn: ['m14_halberd', 'm14_abyssWave', 'm14_vortexWall', 'm14_judgment', 'm14_callTide'].map(m => [1, m]),
    dex: '守護海淵神殿的騎士。五百年前和曙光軍作戰時沉進了海底，被潮將撿了回去。他說，他只是在遵守最後一道命令。' };
  { const P = MON_PANEL.shadowGeneral || ch2Panel(44, 'phys', 'boss'); MON_PANEL[OTTO14] = { ...P, hp: Math.round(P.hp * 0.95) }; }
  HD_RIG_OF[OTTO14] = (BATTLE_PXC[b] || chibiOwn(b)) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[OTTO14] = HD_RIG_OF[OTTO14]; if (ART[b]) ART[OTTO14] = artRecolor(ART[b], 180, 1.1, 1.0);
  ISLE_LOOK14[OTTO14] = [HD_RIG_OF[OTTO14], [180, 1.1, 1.0]]; }
defPut('enemies', OTTO14, { tags: ['foe', 'fam:undead'], skills: ['m14_halberd', 'm14_abyssWave', 'm14_vortexWall', 'm14_judgment', 'm14_callTide'], fam: 'undead', trait: null, profile: 'brute', script: null, metadata: { n: '深海騎士 歐托' } });
B12_SCRIPT[OTTO14] = function (core, u) { const half = u.res.hp <= u.max.hp * 0.5, minions = core.alive(u.side).filter(q => q !== u && q.minion).length, calls = u.data.calls14 || 0;
  if (core.round >= 3 && core.round % 4 === 3) return b12Charge(core, u, 'm14_judgment'); // 海淵裁決: charged on rounds 3, 7, 11 …
  if (minions < 1 && ((calls === 0 && core.round >= 2) || (calls === 1 && half))) { u.data.calls14 = calls + 1; return { type: 'skill', skill: 'm14_callTide', targets: [u.id] }; }
  if (half && !u.data.wall14) { u.data.wall14 = 1; return { type: 'skill', skill: 'm14_vortexWall', targets: [u.id] }; }
  return b12Pick(core, u, half ? ['m14_abyssWave', 'm14_halberd', 'm14_abyssWave'] : ['m14_halberd', 'm14_halberd', 'm14_abyssWave']); };
defPut('mechanics', 'b12_' + OTTO14, { make: u => ({ triggers: [{ on: EVT.SUMMON, phase: 'POST', cond: { ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'message', target: 'self', text: '（神殿的潮水湧了上來……）' }] }] }) });
// the ghost captain: 幽靈砲擊 (the lantern blazes) every third action — borrowed from the siren's whirlpool picture? no: his own lantern = 冥燈
Object.assign(MOVES, { m14_ghostLamp: { n: '冥燈砲擊', t: '一般', cat: '特', pow: 140, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '舉起了綠色的燈，燈火越燒越旺！', warn: '（燈火要轟出來了！防禦！）', d: '蓄力一回合，把冥燈的鬼火整團轟出去。' } });
{ const id = 'm14_ghostLamp', src = MFX.m_wispFire ? 'm_wispFire' : MFX.m_soulSip ? 'm_soulSip' : null; if (src) { MFX[id] = mxRecolor(MFX[src], MX_PAL.witch); MOVES[id].fx = id; }
  const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); defPut('skills', id, { ...d, override: true });
  if (MON_CLASS.charge && !MON_CLASS.charge.includes(id)) MON_CLASS.charge.push(id); SPECIES[GHOSTCAP14].learn.push([1, id]); DEF.enemies[GHOSTCAP14].skills.push(id); }
BAI.SCRIPT.b14_ghostCap = function (core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1; if (d.cd <= 0 && DEF.skills.m14_ghostLamp) { d.cd = 3; return b12Charge(core, u, 'm14_ghostLamp'); } return b12Pick(core, u, ['m_darkSlash', 'm_soulSip', 'm_darkSlash', 'm_wail']); };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (s && sp === GHOSTCAP14) s.data.script = 'b14_ghostCap'; return s; }; }

/* ---------- props: the 潮音貝 and the temple's 潮水機關 ---------- */
const CONCH14_IMG = pxArt14(16, 16, (put, rect) => { rect(2, 11, 13, 14, '#6a6a78'); rect(3, 10, 12, 10, '#8a8a98');
  const C = [[7, 2], [8, 2], [6, 3], [9, 3], [5, 4], [10, 4], [4, 5], [11, 5], [4, 6], [11, 6], [4, 7], [12, 7], [5, 8], [12, 8], [6, 9], [11, 9]]; for (const [x, y] of C) put(x, y, '#f0c8d0');
  rect(5, 4, 10, 8, '#f8dce0'); rect(6, 5, 9, 7, '#e8a0b0'); put(7, 6, '#c86a80'); put(8, 5, '#c86a80'); put(9, 6, '#ffffff'); rect(10, 7, 13, 9, '#f0c8d0'); put(13, 8, '#e8a0b0'); }, '#2a1418');
const LEVER14_IMG = low => pxArt14(16, 22, (put, rect) => { rect(3, 14, 12, 21, '#3a5a6a'); rect(4, 15, 11, 20, '#5a8a9a'); rect(5, 17, 10, 18, low ? '#6ee7d2' : '#3a6a7a');
  const top = low ? 14 : 4; rect(7, top, 8, 14, '#8a6a40'); rect(5, top - 2, 10, top, '#c8a060'); put(7, top - 1, '#fff0c0'); rect(6, 12, 9, 13, '#2a3a4a'); }, '#0a1418');
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'conch14') return propFrames(CONCH14_IMG, 6); if (look === 'lever14') { const c = LEVER14_IMG(!!((Game.st || {}).flags || {}).tide14), a = [c, c, c, c]; return { down: a, up: a, left: a, right: a }; } return _nf(look); }; }
if (typeof PORTRAIT_PROPS !== 'undefined') { PORTRAIT_PROPS.add('conch14'); PORTRAIT_PROPS.add('lever14'); }

/* ---------- the tide tiles ---------- */
const tideLow14 = (ow = Game.ow) => { const d = ow && ow.map && ow.map.d, f = (Game.st || {}).flags || {}; return d && d.tide14 === 'reef' ? !!f.tideLow14 : !!f.tide14; };
{ const _sa = Overworld.prototype.solidAt; Overworld.prototype.solidAt = function (x, y) { if (this.map && this.map.d.tide14) { const c = this.tileAt(x, y); if (c === '~') return !tideLow14(this); if (c === '^') return tideLow14(this); } return _sa.call(this, x, y); }; }
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) {
    if (!this.map || !this.map.d.tide14 || (c !== '~' && c !== '^')) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    const low = tideLow14(this), reef = this.map.d.tide14 === 'reef', t = this.t || 0;
    if (c === '~') { if (!low) return _dt.call(this, x, 'W', tx, ty, sx, sy, f, f2); _dt.call(this, x, reef ? '.' : 's', tx, ty, sx, sy, f, f2); x.fillStyle = 'rgba(60,120,140,0.28)'; x.fillRect(sx, sy, 16, 16); x.fillStyle = 'rgba(200,240,250,0.5)'; if ((tx + ty) % 3 === 0) x.fillRect(sx + 4, sy + 9, 3, 1); return; }
    if (low) { x.fillStyle = '#04080c'; x.fillRect(sx, sy, 16, 16); x.fillStyle = '#0c1a22'; x.fillRect(sx + 1, sy, 14, 3); x.fillStyle = '#5a4428'; x.fillRect(sx + 3, sy + 11, 10, 2); return; }
    _dt.call(this, x, 'W', tx, ty, sx, sy, f, f2); const bob = Math.round(Math.sin((t + tx * 13 + ty * 7) / 18)); x.fillStyle = '#5a3418'; x.fillRect(sx + 1, sy + 2 + bob, 14, 12); x.fillStyle = '#b07840'; x.fillRect(sx + 2, sy + 3 + bob, 12, 10);
    x.fillStyle = '#7a4c24'; x.fillRect(sx + 2, sy + 6 + bob, 12, 1); x.fillRect(sx + 2, sy + 10 + bob, 12, 1); }; }

/* ---------- maps ---------- */
const CH3C_ROWS = {
  sunkenReef14: ['WWWWWWWWWW:WWWWWWWWWWWWW', 'WWWWWWWWW.:.WWWWWWWWWWWW', 'WWWWWWW#..:..#WWWWWWWWWW', 'WWWWWW##..:..##WWWWWWWWW', 'WWWWWW....:....WWWWWWWWW', 'WWWWWWWo..:..o.WWWWWWWWW', 'WWWWWWWWW.:.WWWWWWWWWWWW', 'WWWWWWWWWW:WWWWWWWWWWWWW',
    'WWWWWWWWWW:WWWWWWWWWWWWW', 'WWWWWWWW..:...WWWWWWWWWW', 'WWWWWW#...:....#WWWWWWWW', 'WWW~~~....:.....~~~~WWWW', 'WWW~WW##..:...##WWW~WWWW', 'WW...WW...:....WWW...WWW', 'WW.#.WW..o:o..WWW..#..WW', 'WW...WWW..:..WWWW.....WW',
    'WWWWWWWWo.:.oWWWWWWWWWWW', 'WWWWWWWWW...WWWWWWWWWWWW', 'WWWWWWWWW...WWWWWWWWWWWW', 'WWWWWWWWWWW~WWWWWWWWWWWW', 'WWWWWWWWWWW~WWWWWWWWWWWW', 'WWWWWWWWWWW~~~WWWWWWWWWW', 'WWWWWWWWWWWWW~WWWWWWWWWW', 'WWWWWWWWWW...~..WWWWWWWW',
    'WWWWWWWW#.......#WWWWWWW', 'WWWWWWW##..o.o..##WWWWWW', 'WWWWWWWW.........WWWWWWW', 'WWWWWWWWW.......WWWWWWWW', 'WWWWWWWWWWWWWWWWWWWWWWWW'],
  abyssTemple14a: ['RRRRRRRRRRRRRRRRRR', 'RRsssRRRRRRRRRsssRR'.slice(0, 18), 'RRsssRRRRRRRRRsssR', 'RRs~sRRRRRRRRRs^sR', 'RRR~RRRRRRRRRRR^RR', 'RRR~RRRRRRRRRRR^RR', 'RRR~~~~sssss^^^^RR', 'RRRRRRRsssssRRRRRR',
    'RRRRRRRsssssRRRRRR', 'RRRRRRRsWsWsRRRRRR', 'RRRRRRRsssssRRRRRR', 'RRRRRRRRRsRRRRRRRR', 'RRRRRRRRRsRRRRRRRR', 'RRRRRRsssssssRRRRR', 'RRRRRRsWsssWsRRRRR', 'RRRRRRsssssssRRRRR', 'RRRRRRRRRsRRRRRRRR', 'RRRRRRRRRsRRRRRRRR', 'RRRRRRRRRsRRRRRRRR'],
  abyssTemple14b: ['RRRRRRRRRRRRRRRRRR', 'RRRRRRsssssRRRRRRR', 'RRRRRRsssssRRRRRRR', 'RRRRRRsssssRRRRRRR', 'RRRRRRRR~RRRRRRRRR', 'RRRRRRRR~RRRRRRRRR', 'RRRRRsss~sssRRRRRR', 'RRRRRsssssssRRRRRR',
    'RRRRRsssssssRRRRRR', 'RRRRRRRR^RRRRRRRRR', 'RRRRRRRR^RRRRRRRRR', 'RRRRRRRR^RRRRRRRRR', 'RRRsssssssssssRRRR', 'RRRsWWssssssWsRRRR', 'RRRsssssssssssRRRR', 'RRRRRRsRRRRRRRRRRR', 'RRRRRRsRRRRRRRRRRR', 'RRRRsssssRRRRRRRRR', 'RRRRsssssRRRRRRRRR', 'RRRRRRRRRRRRRRRRRR'],
};
for (const id in CH3C_ROWS) { const R = CH3C_ROWS[id]; if (R.some(r => r.length !== R[0].length) && typeof bvErr === 'function') bvErr('ch3c', 'rows ' + id); }
MAPS.sunkenReef14 = { name: '沉月礁', music: 'lake', outdoor: 1, border: 'W', battleBg: 'beach13', popup: 1, theme: 'beach13', tide14: 'reef', moon14: 1, rows: CH3C_ROWS.sunkenReef14, type: '野外',
  edgeWarps: [{ dir: 'up', at: [10], to: ['mistcapeCoast14', 10, 35, 'up'] }],
  signs: {}, elites: [{ id: GHOSTCAP14, sp: GHOSTCAP14, lv: 56, x: 10, y: 17, dir: 'up', sight: 2 }],
  npcs: [{ id: 'conch14', x: 10, y: 18, dir: 'down', look: 'conch14', name: '潮音貝' }, { id: 'templeDoor14', x: 12, y: 27, dir: 'down', look: 'caveDoor', name: '海淵神殿' }],
  items: [{ id: 'sr1', x: 3, y: 13, item: 'elixir', n: 2 }, { id: 'sr2', x: 20, y: 13, item: 'riftShard', n: 2 }, { id: 'sr3', x: 18, y: 15, gold: 12000 }, { id: 'sr4', x: 9, y: 26, item: 'megaEther', n: 2 }, { id: 'sr5', x: 7, y: 4, item: 'wisdomFruit', n: 1 }],
  gathers: [{ id: 'gsr1', x: 13, y: 4, kind: 'star', mat: 'starDust' }, { id: 'gsr2', x: 2, y: 15, kind: 'coral14', mat: 'coralBranch14' }, { id: 'gsr3', x: 20, y: 14, kind: 'star', mat: 'starDust' }, { id: 'gsr4', x: 15, y: 26, kind: 'coral14', mat: 'coralBranch14' }],
  encounters: [{ y0: 0, y1: 99, rate: 0.09, table: [['moonStar14', 53, 55, 25], ['fishman14', 53, 55, 25], ['coralGolem14', 54, 56, 25], ['inkOctopus14', 54, 56, 25]] }] };
MAPS.sunkenReef14.gearPool = LATE_GEAR13();
const TEMPLE_ENC14 = [{ y0: 0, y1: 99, rate: 0.07, table: [['drownKnight14', 55, 57, 35], ['tideSpirit14', 55, 57, 35], ['anglerfish14', 55, 57, 30]] }];
MAPS.abyssTemple14a = { name: '海淵神殿・上層', music: 'ruins', border: 'R', battleBg: 'seacave13', encAll: 1, popup: 1, theme: 'seacave13', tide14: 'temple', rows: CH3C_ROWS.abyssTemple14a, type: '迷宮',
  exit: { x: 9, y: 18, to: ['sunkenReef14', 12, 26] },
  npcs: [{ id: 'leverA14', x: 9, y: 14, dir: 'down', look: 'lever14', name: '潮水機關' }, { id: 'stairsA14', x: 3, y: 1, dir: 'down', look: 'caveDoor', name: '往下的階梯' }],
  items: [{ id: 'at1', x: 15, y: 1, item: 'elixir', n: 2 }, { id: 'at2', x: 16, y: 2, item: 'starShard', n: 1 }, { id: 'at3', x: 11, y: 13, gold: 10000 }],
  encounters: TEMPLE_ENC14 };
MAPS.abyssTemple14b = { name: '海淵神殿・下層', music: 'ruins', border: 'R', battleBg: 'seacave13', encAll: 1, popup: 1, theme: 'seacave13', tide14: 'temple', rows: CH3C_ROWS.abyssTemple14b, type: '迷宮',
  boss: { sp: OTTO14, lv: 58, x: 8, y: 2, flag: OTTO14, ev: 'ottoBoss14' },
  npcs: [{ id: 'stairsB14', x: 5, y: 17, dir: 'down', look: 'caveDoor', name: '往上的階梯' }, { id: 'leverB14', x: 13, y: 14, dir: 'down', look: 'lever14', name: '潮水機關' }, { id: 'leverC14', x: 11, y: 7, dir: 'down', look: 'lever14', name: '潮水機關' }],
  items: [{ id: 'bt1', x: 3, y: 12, item: 'megaPotion', n: 3 }, { id: 'bt2', x: 5, y: 8, item: 'powerFruit', n: 1 }, { id: 'bt3', x: 10, y: 1, item: 'megaEther', n: 2 }],
  encounters: TEMPLE_ENC14 };
MAPS.abyssTemple14a.gearPool = LATE_GEAR13(); MAPS.abyssTemple14b.gearPool = LATE_GEAR13();
// the coast's south end now leads on to the reef (after the report to the chief)
MAPS.mistcapeCoast14.edgeWarps.push({ dir: 'down', at: [10], to: ['sunkenReef14', 10, 0, 'down'], need: 'reefOpen14', msg: '……前面的礁石被潮水淹著。' });
if (typeof mapCache !== 'undefined') delete mapCache.mistcapeCoast14;
if (typeof MAP_TYPES !== 'undefined') Object.assign(MAP_TYPES, { sunkenReef14: '野外', abyssTemple14a: '迷宮', abyssTemple14b: '迷宮' });
Object.assign(EXPLORE, { sunkenReef14: '沉月礁', abyssTemple14a: '海淵神殿', abyssTemple14b: '海淵神殿・下層' });
if (typeof BATTLE2_MAPS !== 'undefined') for (const k of ['sunkenReef14', 'abyssTemple14a', 'abyssTemple14b']) BATTLE2_MAPS.add(k);
if (typeof FISH_WATER13 !== 'undefined') FISH_WATER13.sunkenReef14 = 'sea';
if (typeof FOE_SPOTS !== 'undefined') { FOE_SPOTS.push({ sp: GHOSTCAP14, lv: 56, map: 'sunkenReef14', kind: 'elite', key: GHOSTCAP14 }, { sp: OTTO14, lv: 58, map: 'abyssTemple14b', kind: 'boss', key: OTTO14 }); FOE_SPOTS.sort((a, b) => a.lv - b.lv); }
// the floors' stairs (people) join the map graph
{ const _mg = mapGraph; let done14 = null; mapGraph = function () { const G = _mg(); if (G === done14) return G; done14 = G;
    (G.abyssTemple14a = G.abyssTemple14a || {}).abyssTemple14b = { x: 3, y: 1, npc: 'stairsA14' }; (G.abyssTemple14b = G.abyssTemple14b || {}).abyssTemple14a = { x: 5, y: 17, npc: 'stairsB14' };
    (G.sunkenReef14 = G.sunkenReef14 || {}).abyssTemple14a = { x: 12, y: 27, npc: 'templeDoor14' }; (G.abyssTemple14a = G.abyssTemple14a || {}).sunkenReef14 = { x: 9, y: 18 }; return G; }; }
if (typeof MAP_G !== 'undefined') MAP_G = null;
if (typeof SPK_INDEX !== 'undefined') SPK_INDEX = null;
// the reef under a pale moon: a soft blue night tint, the moon's reflection glinting on the water
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); if (!this.map || !this.map.d.moon14) return; const t = this.t || 0;
    x.fillStyle = 'rgba(30,40,90,0.22)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { const px = (i * 47 + 13) % W, py = (i * 71 + 29) % (H - 70); if ((t + i * 23) % 90 < 50) { x.fillStyle = 'rgba(230,240,255,0.7)'; x.fillRect(px, py, 2, 1); } } }; }

/* ---------- the story ---------- */
function* tideToggle14(ow, id) { const f = Game.st.flags, low = !f.tide14;
  if (!(yield* yesNo('古老的潮水機關。拉動石柱上的長柄，神殿的水位就會' + (low ? '下降' : '上升') + '。\n要拉嗎？'))) return;
  Sound.sfx('quake'); for (let i = 0; i < 16; i++) { ow.camDY = (i % 2 ? 2 : -2) * (1 - i / 16); yield; } ow.camDY = 0; f.tide14 = low ? 1 : 0;
  ow.load(ow.map.id, ow.p.x, ow.p.y, ow.p.dir, true); Sound.sfx(low ? 'water' : 'wind');
  yield* say(low ? '轟隆隆……神殿的水位降下去了。\n（淹在水裡的路露了出來，浮在水上的木板沉到了深坑底）' : '轟隆隆……海水從牆縫湧了進來，水位升上來了。\n（木板浮上來了，低處的路又淹回水裡）'); }
Object.assign(Events, {
  *reefPath14(ow) { if (Game.st.flags.reefOpen14) return; yield* say(ch3m() >= 4 ? '往南是沉月礁。礁石之間的路被不退的潮水淹著，現在還過不去。\n（回貝殼村問問珂拉村長吧）' : '……前面的礁石被潮水淹著。'); yield* ow.walkEntity(ow.p, 'up', 1); },
  *conch14(ow) { const st = Game.st, f = st.flags;
    if (!f[GHOSTCAP14]) { const e = (ow.elites || []).find(q => q.id === GHOSTCAP14); if (e) { yield* ow.eliteTalk(e); return; } }
    if (f.tideLow14) { yield* say('潮音貝。貼在耳邊，聽得到很遠很遠的潮聲。'); return; }
    yield* say('礁石上放著一個大得不得了的海螺。殼上刻著和潮汐之珠一樣的花紋。');
    if (!(yield* yesNo('要吹響潮音貝嗎？'))) return;
    Sound.sfx('charge'); yield* wait(20); Sound.sfx('quake'); for (let i = 0; i < 24; i++) { ow.camDY = (i % 2 ? 3 : -3) * (1 - i / 24); yield; } ow.camDY = 0;
    yield* sayAll(['——嗚……………', '低沉的螺聲傳遍了整片海。', '海水像被什麼東西拉走一樣，慢慢、慢慢地退了下去。']);
    f.tideLow14 = 1; setCh3m(7); ow.load(ow.map.id, ow.p.x, ow.p.y, ow.p.dir, true); Sound.jingle('item');
    yield* sayAll(['礁石之間露出了沙洲。最南邊的礁石上，有一座半埋在沙裡的神殿。', '莉婭的聲音從遠處的船上傳來：「看到了！南邊有一座建築物！」', '（沉月礁的潮水退了。前往南邊的海淵神殿吧）']); saveGame(); },
  *eliteWin_ghostCaptain14(ow) { setCh3m(6);
    yield* sayAll(['幽靈船長：「……好劍法。跟那小子年輕的時候一樣不要命。」', '幽靈船長：「海鷗號的葛雷……那小子，還活著嗎？」', '幽靈船長：「二十年前，我的船在這片礁上沉了。是他把最後一艘救生艇划了出去……」', '幽靈船長：「去吧。潮音貝就在後面。吹響它，海就會退。」', '綠色的燈火一閃，船長的身影消失在礁石的影子裡。']);
    yield* say('（吹響潮音貝吧）'); saveGame(); },
  *templeDoor14(ow) { if (!(Game.st.flags || {}).tideLow14) { yield* say('潮水淹著，靠近不了。'); return; }
    if (yield* yesNo('半埋在沙裡的神殿。入口的石門上，刻著拿長戟的騎士。\n要進去嗎？')) { yield* ow.warp('abyssTemple14a', 9, 17, 'up');
      if (ch3m() < 8) { setCh3m(8); yield* sayAll(['神殿裡很潮濕。牆上爬滿了海草，腳下的水一下漲、一下退。', '（拉動「潮水機關」，水位就會升降。淹著的路、浮著的木板……找出往下的路吧）']); } } },
  *leverA14(ow) { yield* tideToggle14(ow, 'leverA14'); }, *leverB14(ow) { yield* tideToggle14(ow, 'leverB14'); }, *leverC14(ow) { yield* tideToggle14(ow, 'leverC14'); },
  *stairsA14(ow) { if (yield* yesNo('往下的階梯。下面傳來很大的水聲。\n要下去嗎？')) yield* ow.warp('abyssTemple14b', 6, 18, 'up'); },
  *stairsB14(ow) { if (yield* yesNo('往上的階梯。要回上層嗎？')) yield* ow.warp('abyssTemple14a', 3, 2, 'down'); },
  *ottoBoss14(ow) { const st = Game.st, f = st.flags; if (f[OTTO14]) return;
    yield* sayAll(['神殿的最深處，一個穿著深藍鎧甲的騎士，拄著長戟站在台座前面。', '台座上，放著半顆發著藍光的珠子。', '深海騎士 歐托：「……曙光的人。五百年了，你們又來了。」', '歐托：「我的主人命令我守住這顆珠子，直到潮將大人回來。」', '歐托：「我不恨你們。只是——命令就是命令。」']);
    const res = yield* ow.battleScript({ sp: OTTO14, lv: MAPS.abyssTemple14b.boss.lv, kind: 'boss', id: OTTO14 });
    if (res !== 'win') return;
    f[OTTO14] = 1; ow.boss = null; setCh3m(9); st.bag.tidePearlHalf14 = 1; st.bag.starShard = (st.bag.starShard || 0) + 2;
    yield* sayAll(['歐托：「……原來如此。你的劍裡，有那個人的光。」', '歐托：「五百年前……我們也曾經想守住這片海。」', '歐托：「潮將塔拉薩大人……在『深潮城』。這片海底下的城。」', '歐托：「拿走吧。另一半的珠子，在她手上。」', '騎士的鎧甲化成了泡沫，沉回神殿的水裡。']);
    Sound.jingle('item'); yield* itemGet(st.name + '得到了「潮汐之珠（半）」！'); yield* itemGet('在台座下面找到了「星之碎片」×2！');
    yield* sayAll(['神殿開始搖晃，海水從四面八方湧了進來——', '……回過神來，已經被浪推回了礁石上。', '（回貝殼村，向珂拉村長報告吧）']);
    yield* fadeOut(20); ow.load('sunkenReef14', 12, 26, 'down'); yield* wait(10); yield* fadeIn(20); saveGame(); },
});
Object.assign(ITEMS, { tidePearlHalf14: { n: '潮汐之珠（半）', key: 1, price: 0, sell: 0, cat: '重要物品', d: '貝殼村供奉的潮汐之珠的一半。發著淡淡的藍光，貼在耳邊聽得到潮聲。' } });
NPC_ROLES.情報.push('conch14', 'templeDoor14', 'leverA14', 'leverB14', 'leverC14', 'stairsA14', 'stairsB14');
// the chief, Lia and the village after the reef and the temple
{ const _ck = Events.chief14; Events.chief14 = function* (ow) { const st = Game.st, n = ch3m(st);
    if (n === 4) { yield* _ck.call(this, ow); st.flags.reefOpen14 = 1; return; }
    if (n === 5 || n === 6 || n === 7 || n === 8) { st.flags.reefOpen14 = 1; yield* say(n <= 6 ? '珂拉村長：「潮音貝……傳說它在沉月礁正中間的礁石上。路就在霧角海岸的最南端。」' : '珂拉村長：「海退了？……一百年來，我第一次看到沉月礁整片露出來。」'); return; }
    if (n === 9) { setCh3m(10); const g = 25000;
      yield* sayAll(['珂拉村長：「這是……潮汐之珠！雖然只有一半……」', '珂拉：「你們看，海水退了一點。村子前面的石階，露出來一階了。」', '莉婭：「歐托說，另一半在潮將手上。在海底下的『深潮城』。」', '珂拉：「深潮城……傳說五百年前沉進海裡的城。」',
        '珂拉：「勇者大人，貝殼村的大家，會把你們的名字一直記下去。」']);
      st.money += g; Sound.jingle('item'); yield* itemGet('得到了謝禮 ' + g + ' G！');
      yield* sayAll(['……那天晚上，海的遠方亮起了一道藍光。', '一座城的尖塔，從海面上慢慢升了起來。', '（深潮城：第三章的下一次更新開放）']); saveGame(); return; }
    if (n >= 10) { yield* say('珂拉村長：「深潮城……潮將就在那裡。一定要平安回來。」\n（深潮城：第三章的下一次更新開放）'); return; }
    yield* _ck.call(this, ow); }; }
{ const _lv = Events.liaVillage14; Events.liaVillage14 = function* (ow) { const n = ch3m(); if (n < 5) return yield* _lv.call(this, ow);
    yield* say(n <= 6 ? '莉婭：「沉月礁在霧角海岸的最南邊。……潮音貝，到底長什麼樣子呢？」' : n <= 8 ? '莉婭：「海淵神殿……我在船上等你。千萬小心！」' : n === 9 ? '莉婭：「快回去告訴村長吧！」' : '莉婭：「深潮城浮起來了……潮將就在那裡。」'); }; }
{ const _sb = Events.shellBoy14; Events.shellBoy14 = function* (ow) { if (ch3m() >= 9) { yield* say('少年：「哥哥的船在沉月礁找到了！人都平安……謝謝你！」'); return; } yield* _sb.call(this, ow); }; }
// the quest log
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const n = ch3m(st); if (n < 5) return; const q = L.find(x => x.n === '第三章「東方的海」'); if (!q) return;
    const T = { 5: '【推薦Lv53〜】穿過霧角海岸的最南端，到沉月礁找出「潮音貝」。', 6: '吹響沉月礁正中間的潮音貝。', 7: '沉月礁的潮水退了。進入南邊的海淵神殿。（建議Lv55以上）',
      8: '往下走到海淵神殿・下層的最深處。（拉動潮水機關，讓水位升降）', 9: '拿回了一半的潮汐之珠。回貝殼村，向珂拉村長報告。', 10: '完成：拿回了一半的潮汐之珠。（深潮城：下一次更新開放）' };
    Object.assign(q, { t: T[Math.min(10, n)], done: n >= 10, rw: n >= 9 ? '25000 G・星之碎片' : '' }); }; }
// inside the temple's lower floor the arrow points at the deepest room (the boss), not just 「就在這裡」
{ const _qg = questGuide; questGuide = function (q, st = Game.st, ow = Game.ow) { const G = _qg(q, st, ow);
    if (q && q.n === '第三章「東方的海」' && ch3m(st) === 8 && st.map === 'abyssTemple14b' && ow && ow.p && !(st.flags || {})[OTTO14]) return { text: '往神殿的最深處走', arrow: dirArrow(8 - ow.p.x, 2 - ow.p.y), D: G ? G.D : { map: 'abyssTemple14b' } }; return G; }; }
ACHIEVEMENTS.push({ id: 'ch3_tide', n: '退潮之聲', d: '吹響沉月礁的潮音貝。', cat: '探索', ok: st => !!(st.flags || {}).tideLow14 }, { id: 'ch3_otto', n: '深海的騎士', d: '打倒深海騎士歐托。', cat: '戰鬥', ok: st => !!(st.flags || {})[OTTO14] });
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { conch14: '沉月礁' });
