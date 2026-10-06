/* ===================== v12.52 冰鏡洞窟 =====================
   霜語雪原北邊（20,1）的洞窟。踩上冰面（地圖字元 I）會一路滑到撞到東西才停；滑到普通地面就停在那裡。
   冰的房間用程式產生再驗證：出口 11 步、角落的寶箱 13 步就到得了，而且任何停得下來的地方都走得回入口（不會卡死）。
   深處是頭目「冰鏡魔像」（水晶魔像換成冰藍色，數值用收穫魔像的頭目數值），招牌技「冰晶崩落」蓄力。獎勵：飾品「冰鏡護符」。 */
const MIRROR13 = 'mirrorGolem13';
{ const b = 'crystalGolem', B = SPECIES[b];
  if (B) { SPECIES[MIRROR13] = { ...B, n: '冰鏡魔像', boss: 1, elite: 0, rare: 0, exp: 2400, gold: 0, drop: null, learn: [], dex: '冰鏡洞窟最深處的魔像。全身的冰像鏡子一樣，映出來的不是你的臉，而是你的影子。' };
    { const P = MON_PANEL.harvestGolem || ch2Panel(28, 'tank', 'boss'); MON_PANEL[MIRROR13] = { ...P }; }
    HD_RIG_OF[MIRROR13] = chibiOwn(b) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[MIRROR13] = HD_RIG_OF[MIRROR13];
    if (ART[b]) ART[MIRROR13] = artRecolor(ART[b], -70, 0.8, 1.15); } else if (typeof bvErr === 'function') bvErr('ice13', 'base crystalGolem'); }
{ const _ci = chibiImage; chibiImage = function (k) { if (k !== MIRROR13) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k]; const src = _ci('crystalGolem'); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]), [r, g, bb] = hex2rgb(hsl2hex(h - 70, Math.min(1, s * 0.8), Math.min(1, l * 1.15))); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }
Object.assign(MOVES, {
  m13_iceFall: { n: '冰晶崩落', t: '水', cat: '物', pow: 150, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '洞頂的冰柱一根一根亮了起來……', warn: '（冰晶崩落要來了！防禦！）', d: '蓄力一回合，讓洞頂的冰柱全部落下來。' },
  m13_mirrorWall: { n: '冰鏡', t: '一般', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'buff', stat: { def: 1, spd: 1, who: 'self' }, d: '把身上的冰磨得像鏡子一樣。自己的物防 +1、魔防 +1。' },
  m13_shardBurst: { n: '碎冰飛散', t: '水', cat: '物', pow: 70, acc: 95, pp: 10, foe: 1, cls: 'area', d: '把身上的碎冰往四周彈出去。' },
});
{ const PIC = { m13_iceFall: 'm_avalanche', m13_mirrorWall: 'm_frostNova', m13_shardBurst: 'm_frostNova' };
  for (const id in PIC) { if (MFX[PIC[id]]) { MFX[id] = MFX[PIC[id]]; MOVES[id].fx = id; } else if (typeof bvErr === 'function') bvErr('ice13', 'fx ' + PIC[id]);
    const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef));
    defPut('skills', id, { ...d, override: true }); if (MON_CLASS[MOVES[id].cls] && !MON_CLASS[MOVES[id].cls].includes(id)) MON_CLASS[MOVES[id].cls].push(id); } }
{ const E = DEF.enemies.crystalGolem; defPut('enemies', MIRROR13, { tags: ['foe', 'fam:' + ((SPECIES.crystalGolem || {}).fam || 'construct')], skills: (E ? E.skills.slice(0, 3) : ['m_tackle']).concat(['m13_shardBurst', 'm13_mirrorWall', 'm13_iceFall']), fam: (SPECIES.crystalGolem || {}).fam, trait: null, profile: 'brute', script: null, metadata: { n: '冰鏡魔像' } }); }
// 冰晶崩落 on rounds 4, 8, 12 …; 冰鏡 when it gets below half once
B12_SCRIPT[MIRROR13] = function (core, u) { const half = u.res.hp <= u.max.hp * 0.5;
  if (core.round >= 4 && core.round % 4 === 0) return b12Charge(core, u, 'm13_iceFall');
  if (half && !u.data.mirror13) { u.data.mirror13 = 1; return { type: 'skill', skill: 'm13_mirrorWall', targets: [u.id] }; }
  const E = DEF.enemies[MIRROR13]; return b12Pick(core, u, E.skills.filter(id => id !== 'm13_iceFall' && id !== 'm13_mirrorWall')); };
GEAR.mirrorCharm13 = { n: '冰鏡護符', slot: 'acc', t: 5, st: { hp: 18, def: 4, spd: 6, spe: 2 }, sp: {}, fx: ['elemGuard'], trait: 'elemGuard', kind: '飾品', d: '冰鏡魔像身上剝下來的一片冰。不會融化，摸起來也不冷。', look: (GEAR.qHeroCrest || {}).look };
if (ACC_TRAIT.elemGuard) ACC_TRAIT.elemGuard[2] = (ACC_TRAIT.elemGuard[2] || []).concat(['冰鏡護符']); if (typeof BP_RARE !== 'undefined') BP_RARE.add('mirrorCharm13');

/* ---------- 地圖 ---------- */
MAPS.mirrorCave13 = { name: '冰鏡洞窟', music: 'ice', border: 'R', battleBg: 'iceCave', theme: 'ice', encAll: 1, popup: 1, type: '迷宮', ice13: 1,
  rows: ['RRRRRRRRRRRRRRRRR', 'RRRRRRsssssRRRRRR', 'RRRRRRsssssRRRRRR', 'RRRRRRRRsRRRRRRRR',
    'RRRRRRRRsRRRRRRRR', 'RsIIIRIRIIIRRIIIR', 'RIIIIIIIIIIRIIIIR', 'RIIIIRIIRIIIIIIIR', 'RsIIIIIIRIIIIIIRR', 'RIIIIIIRIIIIIIIIR', 'RIIIIIIsIIRIIIIIR', 'RIIIRIIIIsIIIIIIR', 'RIIIIIIIIIIIIIRIR', 'RIIIIIIIIIIIIIIIR', 'RIIIsIIIIIIIRIIIR', 'RRRRRRRRsRRRRRRRR',
    'RRRRRRRSssRRRRRRR', 'RRRRRRRsssRRRRRRR'],
  signs: { '7,16': '腳下是光滑的冰。\n踩上去會一直滑到撞到東西為止；\n滑到普通的地面就會停下來。' },
  exit: { x: 8, y: 17, to: ['frostField', 20, 2] },
  boss: { sp: MIRROR13, lv: 32, x: 7, y: 1, flag: 'mirror13', ev: 'mirrorBoss13' },
  npcs: [], items: [{ id: 'mc13a', x: 1, y: 5, item: 'tpBook', n: 1 }, { id: 'mc13b', x: 4, y: 14, gold: 5000 }],
  encounters: [{ y0: 0, y1: 99, rate: 0.05, table: [['frostSprite', 30, 32, 35], ['iceOwl', 30, 32, 35], ['snowWolf', 30, 32, 30]] }] };
if (typeof MAP_TYPES !== 'undefined') MAP_TYPES.mirrorCave13 = '迷宮'; EXPLORE.mirrorCave13 = '冰鏡洞窟';
if (typeof BATTLE2_MAPS !== 'undefined') BATTLE2_MAPS.add('mirrorCave13');
MAPS.frostField.npcs.push({ id: 'mirrorDoor13', x: 20, y: 1, dir: 'down', look: 'caveDoor', name: '冰鏡洞窟' }); delete mapCache.frostField;
if (typeof MAP_G !== 'undefined') MAP_G = null;

/* ---------- 冰面：畫法和滑動 ---------- */
const ICE_TILE13 = [0, 1, 2].map(v => { const c = mkCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#9fd3ea'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#b8e2f2'; x.fillRect(0, 0, 16, 7); x.fillStyle = '#8ac4de'; x.fillRect(0, 14, 16, 2);
  x.fillStyle = '#e8f8ff'; if (v === 0) { x.fillRect(3, 3, 3, 1); x.fillRect(4, 4, 1, 1); } else if (v === 1) { x.fillRect(10, 5, 2, 1); x.fillRect(5, 10, 1, 1); } else { x.fillRect(8, 2, 3, 1); x.fillRect(12, 9, 1, 2); }
  x.fillStyle = '#7fb8d4'; if (v === 2) { x.fillRect(2, 11, 4, 1); x.fillRect(6, 12, 2, 1); } return c; });
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) { if (c !== 'I') return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    x.drawImage(ICE_TILE13[hash2(tx, ty) % 3], sx, sy); if ((this.t + tx * 7 + ty * 13) % 140 < 6) { x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(sx + 7, sy + 5, 2, 2); } }; }
// a finished step on ice keeps going the same way; a step onto plain ground stops
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function (...a) { const r = _os.apply(this, a), p = this.p; if (this.map && this.map.d.ice13 && p) p.slide13 = this.tileAt(p.x, p.y) === 'I' ? p.dir : null; return r; }; }
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const p = this.p;
    if (p && p.slide13 && !p.moving && !this.script && !UI.stack.length && this.map && this.map.d.ice13) { const x0 = p.x, y0 = p.y; this.tryMove(p.slide13, true);
      if (!p.moving && p.x === x0 && p.y === y0) p.slide13 = null; else { this.t++; return; } }
    else if (p && p.slide13 && this.map && !this.map.d.ice13) p.slide13 = null;
    return _u.apply(this, a); }; }

/* ---------- 事件 ---------- */
Object.assign(Events, {
  *mirrorDoor13(ow) { if (yield* yesNo('冰鏡洞窟。洞口的冰像鏡子一樣，映出了你的樣子。\n要進去嗎？（建議 Lv30 以上）')) yield* ow.warp('mirrorCave13', 8, 16, 'up'); },
  *mirrorBoss13(ow) { const st = Game.st, f = st.flags; if (f.mirror13) return;
    yield* sayAll(['洞窟最深處，一尊冰做的魔像靜靜地站著。', '冰面上映出了你的影子……影子先動了。', '冰鏡魔像醒過來了！']);
    const res = yield* ow.battleScript({ sp: MIRROR13, lv: MAPS.mirrorCave13.boss.lv, kind: 'boss', id: MIRROR13 }); if (res !== 'win') return;
    f.mirror13 = 1; ow.boss = null; st.money += 4000;
    yield* say('魔像碎成了一地的冰。其中一片，像鏡子一樣亮。');
    const g = makeGear('mirrorCharm13', 4); Sound.jingle('item'); yield* itemGet('得到了' + gearName(g) + '和 4000 G！'); ow.load('mirrorCave13', ow.p.x, ow.p.y, ow.p.dir, true); },
});
(NPC_ROLES.事件 || NPC_ROLES.情報).push('mirrorDoor13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.mirrorDoor13 = '霜語雪原・北邊';
ACHIEVEMENTS.push({ id: 'mirror13', n: '冰鏡洞窟', d: '打倒冰鏡洞窟的冰鏡魔像。', cat: '戰鬥', ok: st => !!st.flags.mirror13 });
