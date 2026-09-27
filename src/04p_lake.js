/* ===================== v19 NEW AREA: 銀月湖畔 (Lv15–19) + new monsters (lake & Rift) =====================
   Reached from the north-east pocket of 迷霧森林. Monsters: 月光水精・蘆葦鉗蟹・暮光蛾・湖蜥戰士; elites 蜥人隊長 and
   (after collecting 3 失落的劍譜) 流浪的魔劍士; hidden boss 銀鱗水龍 (offer 月露×3 at the moon altar on the island).
   Battle art: Codex frame strips (art/battle/pxanim). Until a strip exists, a recoloured placeholder is used. */
const NEW_MOVES = {
  m_moonBeam: { n: '月光射線', t: '一般', cat: '特', pow: 70, acc: 95, pp: 10, d: '把月光凝成一道光線射出。' },
  m_pinch: { n: '巨鉗夾擊', t: '一般', cat: '物', pow: 55, acc: 95, pp: 20, d: '用大鉗子狠狠夾住。' },
  m_crabHammer: { n: '鉗錘重擊', t: '水', cat: '物', pow: 115, acc: 100, pp: 5, charge: 1, chargeMsg: '高高舉起了巨大的鉗子！', warn: '（下一擊非常沉重……防禦，或趁現在破防！）', d: '蓄力後用大鉗子砸下。' },
  m_moonDust: { n: '暮光鱗粉', t: '一般', cat: '特', pow: 50, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 40 }, d: '撒下閃著月光的鱗粉。有時會降低速度。' },
  m_spearThrust: { n: '骨矛刺', t: '一般', cat: '物', pow: 60, acc: 95, pp: 20, crit: 1, d: '用骨矛快速刺擊。容易會心。' },
  m_spearRush: { n: '突進連刺', t: '一般', cat: '物', pow: 85, acc: 90, pp: 10, d: '衝上前連續刺擊。' },
  m_tidalSpear: { n: '潮汐之矛', t: '水', cat: '物', pow: 125, acc: 100, pp: 5, charge: 1, chargeMsg: '把長矛插進水中，湖水開始旋轉！', warn: '（湖水聚集在矛尖上……）', d: '蓄力後擲出纏著湖水的長矛。' },
  m_moonSlash: { n: '月影斬', t: '一般', cat: '物', pow: 80, acc: 95, pp: 10, d: '劍光像月影一樣劃過。' },
  m_arcaneBolt: { n: '魔導彈', t: '一般', cat: '特', pow: 75, acc: 95, pp: 10, d: '從劍尖射出的魔力彈。' },
  m_blinkStrike: { n: '瞬步斬', t: '一般', cat: '物', pow: 50, acc: 100, pp: 15, prio: 1, d: '一瞬間逼近斬擊。必定先出手。' },
  m_eclipse: { n: '月蝕', t: '一般', cat: '特', pow: 140, acc: 100, pp: 5, charge: 1, chargeMsg: '劍身吸走了周圍的光……', warn: '（四周暗了下來。下一擊是魔劍士的奧義！）', d: '魔劍士的奧義。吞噬光芒的一斬。' },
  m_tidalWave: { n: '怒濤', t: '水', cat: '特', pow: 80, acc: 95, pp: 10, d: '掀起一道巨浪。' },
  m_wyrmBite: { n: '龍牙', t: '一般', cat: '物', pow: 85, acc: 95, pp: 10, eff: { flinch: 1, p: 20 }, d: '用銳利的龍牙咬住。' },
  m_moonTide: { n: '月潮', t: '水', cat: '特', pow: 130, acc: 100, pp: 5, charge: 1, chargeMsg: '月光照在湖面上，湖水被高高吸起！', warn: '（整座湖都在牠的身後……！）', d: '引來月之潮汐的大招。' },
  m_voidGaze: { n: '虛空凝視', t: '一般', cat: '變', acc: 90, pp: 15, stat: { who: 'foe', def: -1, spd: -1 }, d: '被虛空之眼注視，身體變得脆弱。降低物防和魔防。' },
  m_voidBeam: { n: '虛空光線', t: '一般', cat: '特', pow: 85, acc: 95, pp: 10, d: '從瞳孔射出的虛無之光。' },
  m_riftCleave: { n: '裂界斬', t: '一般', cat: '物', pow: 90, acc: 95, pp: 10, d: '連空間都能劈開的斬擊。' },
  m_riftCharge: { n: '裂界突擊', t: '一般', cat: '物', pow: 150, acc: 100, pp: 5, charge: 1, chargeMsg: '鎧甲的縫隙透出刺眼的紫光！', warn: '（空間開始扭曲……）', d: '撕開空間衝鋒的大招。' },
  m_gateBeam: { n: '門扉之光', t: '一般', cat: '特', pow: 100, acc: 95, pp: 10, d: '從胸口的門扉射出強光。' },
  m_gateCrush: { n: '守門重拳', t: '岩', cat: '物', pow: 100, acc: 95, pp: 10, d: '石之巨拳砸下。' },
  m_gateJudgment: { n: '異界審判', t: '一般', cat: '特', pow: 170, acc: 100, pp: 5, charge: 1, chargeMsg: '胸口的門扉緩緩打開……', warn: '（門的另一邊是無盡的光。下一擊將會毀滅一切！）', d: '打開異界之門的審判。' },
};
Object.assign(MOVES, NEW_MOVES);
const NEW_MOVE_CLS = { m_moonBeam: 'bolt', m_pinch: 'strike', m_crabHammer: 'charge', m_moonDust: 'powder', m_spearThrust: 'pierce', m_spearRush: 'pierce', m_tidalSpear: 'charge', m_moonSlash: 'slash', m_arcaneBolt: 'bolt', m_blinkStrike: 'slash', m_eclipse: 'charge',
  m_tidalWave: 'area', m_wyrmBite: 'bite', m_moonTide: 'charge', m_voidGaze: 'debuff', m_voidBeam: 'bolt', m_riftCleave: 'slash', m_riftCharge: 'charge', m_gateBeam: 'bolt', m_gateCrush: 'strike', m_gateJudgment: 'charge' };
for (const k in NEW_MOVE_CLS) { const c = NEW_MOVE_CLS[k]; (MON_CLASS[c] || (MON_CLASS[c] = [])).push(k); MOVES[k].cls = c; MOVES[k].fx = k; MOVES[k].foe = 1; }

Object.assign(SPECIES, {
  moonSprite: { n: '月光水精', fam: 'aquatic', base: [70, 40, 62, 88, 84, 70], exp: 118, gold: 24, mat: 'moonDew', trait: 'healer', learn: [[1, 'm_bubbleSpit'], [1, 'm_lullaby'], [1, 'm_moonBeam'], [17, 'm_waterBomb']], dex: '月光照在湖面時才會出現的水之精靈。會唱歌讓人睡著。' },
  reedCrab: { n: '蘆葦鉗蟹', fam: 'aquatic', base: [78, 90, 96, 40, 60, 42], exp: 120, gold: 25, mat: 'lizardScale', learn: [[1, 'm_pinch'], [1, 'm_scaleGuard'], [1, 'm_bubbleSpit'], [16, 'm_crabHammer']], dex: '背上長滿蘆葦的大鉗蟹。舉起鉗子的時候要小心。' },
  duskMoth: { n: '暮光蛾', fam: 'insect', base: [66, 50, 58, 82, 76, 84], exp: 116, gold: 24, mat: 'mothDust', learn: [[1, 'm_moonDust'], [1, 'm_sleepPollen'], [1, 'm_poisonSpore'], [16, 'm_featherGust']], dex: '黃昏時在湖邊飛舞的大蛾。鱗粉會讓人動作變慢。' },
  lizardman: { n: '湖蜥戰士', fam: 'beast', base: [80, 92, 72, 40, 58, 74], exp: 124, gold: 28, mat: 'lizardScale', learn: [[1, 'm_spearThrust'], [1, 'm_warCry'], [1, 'm_tailSlam'], [17, 'm_spearRush']], dex: '住在湖畔蘆葦叢裡的蜥蜴人。手持骨矛，成群狩獵。' },
  lizardChief: { n: '蜥人隊長', fam: 'beast', elite: 1, drop: 'reedBoots', base: [92, 104, 84, 50, 70, 82], exp: 260, gold: 60, learn: [[1, 'm_spearRush'], [1, 'm_warCry'], [1, 'm_spearThrust'], [1, 'm_tidalSpear']], dex: '湖蜥戰士的隊長。會把湖水纏在矛上擲出。' },
  rogueBlade: { n: '流浪的魔劍士', fam: 'human', elite: 1, drop: 'eclipseBlade', base: [90, 96, 78, 96, 80, 92], exp: 300, gold: 0, learn: [[1, 'm_moonSlash'], [1, 'm_arcaneBolt'], [1, 'm_blinkStrike'], [1, 'm_eclipse']], dex: '在湖畔流浪的劍士。據說是失傳的「魔劍」流派最後的傳人。' },
  silverWyrm: { n: '銀鱗水龍', fam: 'aquatic', boss: 1, drop: 'wyrmMail', base: [100, 92, 88, 100, 90, 70], exp: 420, gold: 0, learn: [[1, 'm_tidalWave'], [1, 'm_wyrmBite'], [1, 'm_waterBomb'], [1, 'm_moonTide']], dex: '沉睡在銀月湖底的水龍。只在月圓之夜回應祭壇的呼喚。' },
  voidEye: { n: '虛空之眼', fam: 'spirit', base: [72, 40, 66, 96, 90, 80], exp: 130, gold: 30, mat: 'riftShard', learn: [[1, 'm_voidGaze'], [1, 'm_voidBeam'], [1, 'm_hex'], [1, 'm_soulSip']], dex: '在異界迴廊裡飄浮的巨大眼球。被它盯著會渾身發冷。' },
  riftKnight: { n: '裂界騎士', fam: 'construct', base: [88, 100, 100, 50, 74, 60], exp: 140, gold: 32, mat: 'riftShard', learn: [[1, 'm_riftCleave'], [1, 'm_stoneWall'], [1, 'm_darkSlash'], [22, 'm_riftCharge']], dex: '沒有主人的古代鎧甲。在迴廊裡永遠地巡邏著。' },
  gatekeeper: { n: '異界守門者', fam: 'construct', boss: 1, drop: 'gateKey', base: [110, 100, 100, 104, 96, 72], exp: 700, gold: 0, learn: [[1, 'm_gateBeam'], [1, 'm_gateCrush'], [1, 'm_dominate'], [1, 'm_gateJudgment']], dex: '守護異界之門的巨人。胸口的門扉通往初代勇者來的世界。' },
});
Object.assign(MON_PANEL, {
  moonSprite: { lv: 17, hp: 50, atk: 18, def: 24, spa: 33, spd: 31, spe: 26, eva: 6 },
  reedCrab: { lv: 17, hp: 54, atk: 33, def: 36, spa: 16, spd: 24, spe: 16 },
  duskMoth: { lv: 17, hp: 46, atk: 20, def: 22, spa: 31, spd: 28, spe: 31, eva: 8 },
  lizardman: { lv: 17, hp: 55, atk: 34, def: 27, spa: 16, spd: 22, spe: 28, crit: 8 },
  lizardChief: { lv: 18, hp: 68, atk: 38, def: 31, spa: 20, spd: 27, spe: 30, crit: 10 },
  rogueBlade: { lv: 20, hp: 72, atk: 38, def: 30, spa: 38, spd: 31, spe: 36, crit: 10, hit: 5 },
  silverWyrm: { lv: 20, hp: 100, atk: 33, def: 32, spa: 31, spd: 34, spe: 26, crit: 8 },
  voidEye: { lv: 24, hp: 62, atk: 22, def: 30, spa: 42, spd: 40, spe: 34, eva: 6 },
  riftKnight: { lv: 24, hp: 74, atk: 44, def: 44, spa: 22, spd: 32, spe: 26 },
  gatekeeper: { lv: 30, hp: 260, atk: 50, def: 50, spa: 52, spd: 48, spe: 34, crit: 8, hit: 5 },
});
// placeholder look (recolour of an existing monster) until the Codex strip exists; pxVariant uses the ART colour shift
const PLACEHOLDER = { moonSprite: ['ghostLamp', 190, 1, 1.15], reedCrab: ['croc', 110, 1, 0.9], duskMoth: ['bee', 250, 0.8, 0.9], lizardman: ['bandit', 90, 0.9, 1], lizardChief: ['lizardman', 190, 1.2, 0.85],
  rogueBlade: ['bandit', 220, 0.8, 0.8], silverWyrm: ['croc', 180, 0.4, 1.35], voidEye: ['ghostLamp', 270, 1.2, 0.8], riftKnight: ['boneKnight', 260, 1.2, 0.8], gatekeeper: ['golem', 240, 0.6, 1.1] };
function artRecolor(A, dh, ks, kl) { const tr = v => { if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) { const [h, s, l] = rgb2hsl(...hex2rgb(v)); return hsl2hex(h + dh, clamp(s * ks, 0, 1), clamp(l * kl, 0, 1)); } if (Array.isArray(v)) return v.map(tr); if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = tr(v[k]); return o; } return v; }; return tr(A); }
for (const k in PLACEHOLDER) { const [b, dh, ks, kl] = PLACEHOLDER[k], base = ART[b] ? b : PLACEHOLDER[b][0]; ART[k] = artRecolor(ART[base], dh, ks, kl); }
const HD_RIG_OF_PENDING = {}; // resolved in 07m once the sprite strips are known

/* ---------- the map ---------- */
MAPS.lake = {
  name: '銀月湖畔', music: 'route', outdoor: 1, border: 'T', battleBg: 'lake', popup: 1,
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTT',
    'TTTT.................T',
    'T.............o..####T',
    'T.####...........####T',
    'T.####.....WWW...####T',
    'T.####..WWWWWWWWW....T',
    'T.####.WWWWWWWWWWW...T',
    'T.####WWWWWWWWWWWWW..T',
    'T....WWWWW,,,,,WWWWWfT',
    'T....WWWWW,,,,,WWWWW.T',
    'T....WWWWW,,,,,WWWWW.T',
    'TTT..WWWWWWW=WWWWWWW.T',
    '...:.WWWWWWW=WWWWWWTTT',
    '...:..WWWWWW=WWWWWWTTT',
    'T.S:...WWWWW=WWWWW.TTT',
    'T..:y...WWWW=WWWW..TTT',
    'Ty.:.......W=W.....TTT',
    'T::::::::::::...f....T',
    'T.######..........o..T',
    'T.######.......#####.T',
    'T.######.b.....#####.T',
    'T.######.......#####.T',
    'T.######TTTT...#####.T',
    'T.......TTTT...#####.T',
    'T.......TTTT.........T',
    'TTTTTTTTTTTTTTTTTTTTTT',
  ],
  edgeWarps: [{ dir: 'left', at: [12, 13], to: ['forest', 20, 3, 'left'] }],
  signs: { '2,14': '「銀月湖畔」\n月圓之夜，湖心的祭壇會發出光芒。\n（魔物很強，建議Lv15以上）' },
  npcs: [{ id: 'hermit', x: 5, y: 15, dir: 'down', look: 'old', name: '湖畔隱士' }, { id: 'altar', x: 12, y: 9, dir: 'down', name: '月之祭壇' }],
  elites: [
    { id: 'lizardChief', sp: 'lizardChief', lv: 18, x: 17, y: 20, dir: 'left', sight: 3 },
    { id: 'rogueBlade', sp: 'rogueBlade', lv: 20, x: 20, y: 9, dir: 'left', sight: 1, show: st => (st.bag.swordPage || 0) >= 3 || st.flags.rogueMet },
  ],
  boss: { sp: 'silverWyrm', lv: 20, x: 11, y: 8, flag: 'wyrm', ev: 'wyrmBoss' },
  items: [
    { id: 'l1', x: 4, y: 1, item: 'hiEther' }, { id: 'l2', x: 20, y: 17, item: 'moonBlade', q: 2 }, { id: 'l3', x: 1, y: 24, gold: 1500 }, { id: 'l4', x: 14, y: 9, item: 'swordPage' },
    { id: 'l5', x: 20, y: 1, item: 'elixir' }, { id: 'l6', x: 18, y: 24, item: 'lakeTome', q: 2 },
  ],
  gathers: [{ id: 'gl1', x: 10, y: 8, kind: 'dew', mat: 'moonDew' }, { id: 'gl2', x: 15, y: 16, kind: 'dew', mat: 'moonDew' }, { id: 'gl3', x: 1, y: 8, kind: 'mana', mat: 'manaHerb' }, { id: 'gl4', x: 5, y: 24, kind: 'herb', mat: 'herb' }],
  gearPool: ['moonBlade', 'lakeStaff', 'moonDagger', 'reedHat', 'crabMail', 'lakeBoots', 'moonPendant', 'lakeTome'],
  rare: ['moonFox', 17, 19],
  encounters: [{ y0: 0, y1: 99, rate: 0.12, table: [['moonSprite', 15, 18, 25], ['reedCrab', 15, 18, 25], ['duskMoth', 15, 18, 25], ['lizardman', 16, 19, 25]] }],
};
MAP_TYPES.lake = '野外'; MAPS.lake.type = '野外'; EXPLORE.lake = '銀月湖畔';
GATHER_KINDS.dew = ['月露草', 'moonDew', [1, 2], [['manaHerb', 0.2]]]; GATHER_IMG.dew = GATHER_IMG.mana;
Object.assign(ELITE_TEXT, { lizardChief: ['嘶嘶——！', '蜥人隊長舉起了纏著湖水的長矛！'], rogueBlade: ['……你身上帶著劍譜的氣息。', '想繼承魔劍之道，就先讓我看看你的劍。'] });
{ // forest: open the north-east pocket toward the lake
  const R = MAPS.forest.rows; R[3] = R[3].slice(0, 21) + '.';
  MAPS.forest.edgeWarps.push({ dir: 'right', at: [3], to: ['lake', 0, 12, 'right'] });
  MAPS.forest.signs = MAPS.forest.signs || {}; R[5] = R[5].slice(0, 20) + 'S' + R[5].slice(21); MAPS.forest.signs['20,5'] = '「→ 銀月湖畔」\n湖邊的魔物很強，建議Lv15以上。';
}
Object.assign(COMMISSIONS, {
  c16: { n: '月露收集', from: '湖畔隱士', d: '想用月露調製藥水。請帶來月露×5。（銀月湖畔的月露草）', need: { moonDew: 5 }, reward: { gold: 1800, items: { hiEther: 2 } }, open: st => st.vis && st.vis.lake },
  c17: { n: '湖蜥的騷動', from: '萌芽鎮的漁夫', d: '湖蜥戰士把漁網都弄壞了。接下委託後，擊敗湖蜥戰士×4。', kill: ['lizardman', 4], reward: { gold: 2200, items: { tpBook: 1 } }, open: st => st.vis && st.vis.lake },
});
