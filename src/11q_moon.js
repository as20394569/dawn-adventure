/* ===================== v12.50 月影神殿 =====================
   銀月湖畔北邊的石門只在晚上打開。大廳四座刻著月相的石燈，照「新月→上弦→滿月→下弦」點亮，內門就會打開；
   深處是頭目「月光精靈王」（招牌技「月蝕」要蓄力，有預告）。獎勵：飾品「月影耳飾」、3000 G、成就「月影神殿」。 */
const MOONK13 = 'moonKing13';
{ const b = 'moonSprite', B = SPECIES[b];
  if (B) { SPECIES[MOONK13] = { ...B, n: '月光精靈王', boss: 1, elite: 0, rare: 0, exp: 1400, gold: 0, drop: null, learn: [], dex: '住在月影神殿深處的精靈之王。五百年來，一直在等能照著月亮的一生點燈的人。' };
    { const P = MON_PANEL.silverWyrm || ch2Panel(20, 'mage', 'boss'); MON_PANEL[MOONK13] = { ...P, hp: Math.round(P.hp * 1.1), atk: Math.round(P.atk * 0.8), spa: Math.round(P.spa * 1.1) }; }
    HD_RIG_OF[MOONK13] = (BATTLE_PXC[b] || chibiOwn(b)) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[MOONK13] = HD_RIG_OF[MOONK13]; // (the lake's own boss 銀鱗水龍, a little stronger in magic: the raw ch2Panel is about twice the tuned bosses)
    if (ART[b]) ART[MOONK13] = artRecolor(ART[b], -165, 0.9, 1.12); } else if (typeof bvErr === 'function') bvErr('moon13', 'base moonSprite'); }
{ const _ci = chibiImage; chibiImage = function (k) { if (k !== MOONK13) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k]; const src = _ci('moonSprite'); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]), [r, g, bb] = hex2rgb(hsl2hex(h - 165, Math.min(1, s * 0.9), Math.min(1, l * 1.12))); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }
Object.assign(MOVES, {
  m13_eclipse: { n: '月蝕', t: '一般', cat: '特', pow: 140, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '月亮被黑影一點一點吞掉了……', warn: '（月蝕要來了！防禦！）', d: '蓄力一回合，讓月光全部消失，再一口氣落下。' },
  m13_moonRain: { n: '月光雨', t: '水', cat: '特', pow: 75, acc: 100, pp: 10, foe: 1, cls: 'area', d: '冷冷的月光像雨一樣灑下來。' },
  m13_moonVeil: { n: '月之紗', t: '一般', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'buff', stat: { spa: 1, spd: 1, who: 'self' }, d: '披上一層月光的薄紗。自己的魔攻 +1、魔防 +1。' },
});
{ const PIC = { m13_eclipse: 'm_eclipse', m13_moonRain: 'm_starfall', m13_moonVeil: 'm6_moonlight' };
  for (const id in PIC) { if (MFX[PIC[id]]) { MFX[id] = MFX[PIC[id]]; MOVES[id].fx = id; } else if (typeof bvErr === 'function') bvErr('moon13', 'fx ' + PIC[id]);
    const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef));
    defPut('skills', id, { ...d, override: true }); if (MON_CLASS[MOVES[id].cls] && !MON_CLASS[MOVES[id].cls].includes(id)) MON_CLASS[MOVES[id].cls].push(id); } }
defPut('enemies', MOONK13, { tags: ['foe', 'fam:aquatic'], skills: ['m13_moonRain', 'm_moonBeam', 'm_lullaby', 'm13_moonVeil', 'm13_eclipse'], fam: 'aquatic', trait: null, profile: 'trick', script: null, metadata: { n: '月光精靈王' } });
// 月蝕 on rounds 3, 7, 11 …; the lullaby on rounds 1, 5, 9 … (never just before 月蝕)
B12_SCRIPT[MOONK13] = function (core, u) { const hero = core.units.find(q => q.hero && !q.down);
  if (core.round >= 3 && core.round % 4 === 3) return b12Charge(core, u, 'm13_eclipse');
  if (hero && !core.hasStatus(hero, 'slp') && core.round % 4 === 1) return { type: 'skill', skill: 'm_lullaby', targets: [hero.id] };
  return b12Pick(core, u, ['m13_moonRain', 'm13_moonRain', 'm_moonBeam', 'm13_moonVeil']); };

/* ---------- 月影耳飾 ---------- */
GEAR.moonEar13 = { n: '月影耳飾', slot: 'acc', t: 4, st: { hp: 12, spa: 4, spd: 4, spe: 3 }, sp: {}, fx: ['meditate'], trait: 'meditate', kind: '飾品', d: '月光精靈王留下的耳飾。戴著的時候，心裡總是很安靜。', look: (GEAR.qHeroCrest || {}).look };
if (ACC_TRAIT.meditate) ACC_TRAIT.meditate[2] = (ACC_TRAIT.meditate[2] || []).concat(['月影耳飾']); if (typeof BP_RARE !== 'undefined') BP_RARE.add('moonEar13');

/* ---------- 地圖 ---------- */
MAPS.moonTemple13 = { name: '月影神殿', music: 'star', border: 'R', battleBg: 'star', encAll: 1, popup: 1, type: '迷宮',
  rows: ['RRRRRRRRRRRRRRRRR', 'RRRRRRsssssRRRRRR', 'RRRRRsssssssRRRRR', 'RRRRRsssssssRRRRR', 'RRRRRRRRsRRRRRRRR', 'RRsssssssssssssRR', 'RRsssssssssssssRR', 'RRsssssssssssssRR', 'RRsssRRRsRRRsssRR',
    'RRsssRRRsRRRsssRR', 'RRsssssssssssssRR', 'RRsssssssssssssRR', 'RRsssssssssssssRR', 'RRRRRRRsssRRRRRRR', 'RRRRRRRsssRRRRRRR', 'RRRRRRRsssRRRRRRR'],
  exit: { x: 8, y: 15, to: ['lake', 36, 2] },
  boss: { sp: MOONK13, lv: 23, x: 7, y: 2, flag: 'moonKing13', ev: 'moonKing13' },
  npcs: [{ id: 'moonDoor13', x: 8, y: 4, dir: 'down', look: 'starGate', name: '內門', show: st => !st.flags.moonDoor13 }, { id: 'moonRiddle13', x: 8, y: 11, dir: 'down', look: 'loreStone', name: '石碑' }],
  items: [{ id: 'mt13a', x: 2, y: 5, item: 'elixir', n: 1 }, { id: 'mt13b', x: 14, y: 12, gold: 2000 }],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['moonSprite', 20, 22, 35], ['duskMoth', 20, 22, 35], ['marshWisp', 20, 22, 30]] }] };
// the four lanterns: [x, y, phase]; one unlit and one lit version each
const MOON_LAMPS13 = [[13, 11, 0], [3, 6, 1], [13, 6, 2], [3, 11, 3]], MOON_PH13 = ['新月', '上弦月', '滿月', '下弦月'];
const moonSeq13 = (st = Game.st) => st.moonSeq13 || (st.moonSeq13 = []);
MOON_LAMPS13.forEach(([x, y, ph], i) => { MAPS.moonTemple13.npcs.push({ id: 'moonLamp13_' + i, x, y, dir: 'down', look: 'lamp', name: '石燈', show: st => !st.flags.moonDoor13 && !moonSeq13(st).includes(ph) },
  { id: 'moonLampLit13_' + i, x, y, dir: 'down', look: 'lampLit', name: '石燈', show: st => !!st.flags.moonDoor13 || moonSeq13(st).includes(ph) }); });
if (typeof MAP_TYPES !== 'undefined') MAP_TYPES.moonTemple13 = '迷宮'; EXPLORE.moonTemple13 = '月影神殿';
if (typeof BATTLE2_MAPS !== 'undefined') BATTLE2_MAPS.add('moonTemple13');
MAPS.lake.npcs.push({ id: 'moonGate13', x: 36, y: 1, dir: 'down', look: 'starGate', name: '刻著滿月的石門' }); delete mapCache.lake;
if (typeof MAP_G !== 'undefined') MAP_G = null;

/* ---------- 事件 ---------- */
Object.assign(Events, {
  *moonGate13(ow) { const night = typeof dnPhase12 === 'function' && dnPhase12() === 'night';
    if (!night) { yield* say('石門上刻著一輪滿月。門縫裡透出冷冷的風。\n……也許要等月亮出來。'); return; }
    if (!Game.st.flags.moonOpen13) { Game.st.flags.moonOpen13 = 1; Sound.sfx('charge'); yield* say('月光照在石門上，門無聲地打開了。'); }
    if (yield* yesNo('月影神殿。要進去嗎？（建議 Lv22 以上）')) yield* ow.warp('moonTemple13', 8, 14, 'up'); },
  *moonRiddle13() { const st = Game.st; if (st.flags.moonDoor13) { yield* say('「月亮會記得點燈的人。」'); return; }
    yield* say('石碑上刻著：\n「月亮從無到有，再從圓到缺。\n照著月亮的一生點燈吧。」'); },
  *moonDoor13() { yield* say('刻著月亮的門。不管怎麼推都推不動。\n（大廳的四座石燈好像有關係……）'); },
  *moonKing13(ow) { const st = Game.st, f = st.flags; if (f.moonKing13) return;
    yield* sayAll(['神殿深處，一團淡金色的光慢慢浮了起來。', '月光精靈王：「……點燈的人，是你嗎？」', '月光精靈王：「五百年來，沒有人照著月亮的一生點過燈。」', '月光精靈王：「讓我看看，你的光能不能撐過月蝕。」']);
    const res = yield* ow.battleScript({ sp: MOONK13, lv: MAPS.moonTemple13.boss.lv, kind: 'boss', id: MOONK13 }); if (res !== 'win') return;
    f.moonKing13 = 1; ow.boss = null; st.money += 3000;
    yield* sayAll(['月光精靈王：「……很好。」', '月光精靈王：「月亮會記得你。帶著這個吧——在沒有月亮的晚上，它也會發光。」']);
    const g = makeGear('moonEar13', 4); Sound.jingle('item'); yield* itemGet('得到了' + gearName(g) + '和 3000 G！'); ow.load('moonTemple13', ow.p.x, ow.p.y, ow.p.dir, true); },
});
MOON_LAMPS13.forEach(([x, y, ph], i) => {
  Events['moonLamp13_' + i] = function* (ow) { const st = Game.st, S = moonSeq13(st);
    yield* say('刻著「' + MOON_PH13[ph] + '」的石燈。'); if (!(yield* yesNo('要點燈嗎？'))) return;
    if (ph !== S.length) { st.moonSeq13 = []; Sound.sfx('bump'); yield* say('燈火亮了一下……又一下子全熄了。\n（順序好像不對）'); ow.load('moonTemple13', ow.p.x, ow.p.y, ow.p.dir, true); return; }
    S.push(ph); Sound.sfx('heal'); ow.load('moonTemple13', ow.p.x, ow.p.y, ow.p.dir, true);
    if (S.length < 4) { yield* say('石燈點亮了。（' + S.length + '／4）'); return; }
    st.flags.moonDoor13 = 1; Sound.sfx('charge'); yield* sayAll(['四座石燈都亮了。月光從天井照下來，落在內門上……', '內門慢慢打開了。']); ow.load('moonTemple13', ow.p.x, ow.p.y, ow.p.dir, true); };
  Events['moonLampLit13_' + i] = function* () { yield* say('刻著「' + MOON_PH13[ph] + '」的石燈。燈火靜靜地燒著。'); }; });
// the hermit on the lake shore tells you about the door (once, from Lv18)
{ const _h = Events.hermit; if (_h) Events.hermit = function* (...a) { const st = Game.st; if (st && !st.flags.moonHint13 && (st.lv || 1) >= 18 && !st.flags.moonKing13) { st.flags.moonHint13 = 1; yield* sayAll(['隱士：「湖的北邊有一扇刻著滿月的石門。」', '隱士：「月亮升起來的晚上，我看過它打開。……裡面有光。」']); return; } return yield* _h.apply(this, a); }; }
(NPC_ROLES.事件 || NPC_ROLES.情報).push('moonGate13', 'moonRiddle13', 'moonDoor13', ...MOON_LAMPS13.flatMap((_, i) => ['moonLamp13_' + i, 'moonLampLit13_' + i]));
if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.moonGate13 = '銀月湖畔・北邊';
ACHIEVEMENTS.push({ id: 'moon13', n: '月影神殿', d: '打倒月影神殿的月光精靈王。', cat: '戰鬥', ok: st => !!st.flags.moonKing13 });
