/* ===================== v12.0.7 第七輪：日夜系統（玩家在〈第七輪提案〉全部勾「照這樣做」，2026-10-03） =====================
   - 時間照走路步數走：在野外和城鎮的戶外走一步＝時間前進一格；一天 2400 步（早晨 300、白天 1000、黃昏 300、夜晚 800）。
     室內、洞窟、迷宮時間不動、也不變暗。新遊戲從早晨開始；舊存檔從白天開始。
   - 旅店：「睡到早上」或「休息到晚上」；回家、營地休息睡到早上。
   - 畫面：野外和城鎮依時間變色（早晨金、黃昏橘、夜晚暗藍），主角身邊一圈微光；窗戶、路燈、營火、魔力草、月露草、
     鬼火會亮；看得見的魔物晚上身上有微光、眼睛發光。戰鬥背景有夜晚版（星空、月亮）。
   - 夜行魔物 13 種（每張野外地圖 1 種）；夜晚偏多的魔物變多、白天的生物（鳥、蜂、蝶）晚上不出現。
   - NPC 作息：道具店、雜貨店、鐘錶店晚上打烊；小孩和攤販回家；守夜人巴特、夜市商人露娜、觀星的艾溫晚上才出現。
   - 夜晚限定：魔力草、月露草多採 1 個；古戰場的亡靈行軍、老兵杜克的夜晚對話；
     支線「守夜人的燈」「麥田的稻草人」「北境的極光」。 */
const DN12 = { LEN: 2400, day: 300, dusk: 1300, night: 1600 };
const DN_NAME12 = { dawn: '早晨', day: '白天', dusk: '黃昏', night: '夜晚' };
const dnClock12 = (st = Game.st) => (st && st.clock != null ? st.clock : DN12.day) % DN12.LEN;
const dnPhase12 = (st = Game.st) => { const c = dnClock12(st); return c < DN12.day ? 'dawn' : c < DN12.dusk ? 'day' : c < DN12.night ? 'dusk' : 'night'; };
const dnOut12 = id => !!(id && MAPS[id] && MAPS[id].outdoor);
const dnNight12 = (st = Game.st) => !!st && dnOut12(st.map) && dnPhase12(st) === 'night';
const dnDay12 = (st = Game.st) => (st && st.day) || 1;
// the label next to the weather (09zv / 09zn) and in the menu header
function dnHudTag(st = Game.st) { return st && dnOut12(st.map) ? '・' + DN_NAME12[dnPhase12(st)] : ''; }
function dnMenuLoc12(x, st, X, Y, right) {
  const nm = MAPS[st.map] ? MAPS[st.map].name || '' : '', tag = '第' + dnDay12(st) + '天・' + DN_NAME12[dnPhase12(st)], tag2 = DN_NAME12[dnPhase12(st)];
  const nx = Font.draw(x, nm, X, Y, UIC.muted, UIC.textSh, 9), room = right - nx - 4;
  const t = Font.width(' ' + tag, 8) <= room ? ' ' + tag : Font.width(' ' + tag2, 8) <= room ? ' ' + tag2 : '';
  if (t) Font.draw(x, t, nx, Y + 1, dnPhase12(st) === 'night' ? '#9ab8ff' : '#e8c890', UIC.textSh, 8);
}
function dnSleep12(mode, st = Game.st) {
  const c = dnClock12(st);
  if (mode === 'night') { if (c >= DN12.night) st.day = dnDay12(st) + 1; st.clock = DN12.night; }
  else { st.day = dnDay12(st) + 1; st.clock = 0; }
  Game.dnBanner = { k: mode === 'night' ? 'night' : 'dawn', t: 0 };
}
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.clock = 60; st.day = 1; } return st; }; }

/* ---------- 時間前進（只在戶外走路） ---------- */
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () {
    const st = this.st;
    if (st && dnOut12(st.map) && !this.script) {
      if (st.clock == null) { st.clock = DN12.day; st.day = st.day || 1; }
      const was = dnPhase12(st); st.clock++; if (st.clock >= DN12.LEN) { st.clock = 0; st.day = dnDay12(st) + 1; }
      const now = dnPhase12(st); if (now !== was) this.dnChange12(was, now);
    }
    _os.call(this);
    if (st && !this.script) this.dnStep12();
  }; }
Overworld.prototype.dnChange12 = function (was, now) {
  dnTables12(now);
  if (now === 'night' || now === 'dawn') Game.dnBanner = { k: now, t: 0 };
  const p = this.p;
  // the monsters out of sight change with the time of day
  if (this.roam12) for (const e of this.roam12.list) { if (e.rare || e.wxm || e.scare12 || e.chase || !e.enc) continue; if (Math.abs(e.x - p.x) + Math.abs(e.y - p.y) <= 7) continue;
    const row = rollEnc(e.enc); const img = roamImg12(row[0]); if (!img) continue; e.sp = row[0]; e.lv = rnd(row[1], row[2]); e.img = img; e.aggro = chance(0.5) && e.lv >= (this.st.lv || 1) - 2; }
  this.dnNpcs12();
};
// NPCs that keep hours: rebuilt when the time of day changes (only the ones not right next to you)
Overworld.prototype.dnNpcs12 = function () {
  const st = this.st, p = this.p, defs = this.map.d.npcs || [];
  const want = defs.filter(n => !n.show || n.show(st)), have = new Map(this.npcs.map(e => [e.id, e]));
  const out = []; for (const n of want) { const e = have.get(n.id); out.push(e || new Entity({ ...n, frames: npcFrames(n.look) })); }
  for (const e of this.npcs) if (!want.some(n => n.id === e.id) && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) <= 2) out.push(e); // someone you are talking to stays
  this.npcs = out;
};

/* ---------- 旅店：睡到早上／休息到晚上；回家、營地：睡到早上 ---------- */
{ const _hr = healRitual; healRitual = function* (text) {
    const m = Game.dnRestMode; Game.dnRestMode = null;
    if (!m) return yield* _hr(text);
    yield* fadeOut(10); dnSleep12(m); healHero(); const fr = Sound.jingle('heal'); yield* wait(Math.max(40, fr)); yield* fadeIn(10); if (text) yield* say(text);
  }; }
function* dnInnAsk12() { const r = yield* ask('要休息到什麼時候？', ['睡到早上', '休息到晚上'], { cancel: false }); Game.dnRestMode = r === 1 ? 'night' : 'morning'; }
const dnInnWrap12 = fn => function* (...a) {
  const _yn = yesNo; let asked = false;
  yesNo = function* (t, o) { const r = yield* _yn(t, o); if (!asked && /^歡迎來到/.test(t)) { asked = true; yesNo = _yn; if (r) yield* dnInnAsk12(); } return r; };
  const _say = say; say = function* (t, o) { if (Game.dnInnNight12 && typeof t === 'string' && t.startsWith('早安！')) t = '天已經黑了。' + t.slice(3); return yield* _say(t, o); };
  try { const r = yield* fn.apply(this, a); return r; } finally { yesNo = _yn; say = _say; Game.dnRestMode = null; Game.dnInnNight12 = false; }
};
{ const _h = Events.healer; Events.healer = dnInnWrap12(_h); }
{ const _ci = ch2Inn; ch2Inn = dnInnWrap12(_ci); }
{ const _hr2 = healRitual; healRitual = function* (text) { if (Game.dnRestMode) Game.dnInnNight12 = Game.dnRestMode === 'night'; return yield* _hr2(text); }; }
{ const _pr = paidRest; paidRest = function* (...a) { Game.dnRestMode = 'morning'; try { return yield* _pr(...a); } finally { Game.dnRestMode = null; } }; }

/* ---------- 夜行魔物 13 種（Codex 任務 AJ；畫好之前用換色版） ---------- */
const M7_MOVES = {
  m7_shadowClaw: { n: '影爪', t: '一般', cat: '物', pow: 45, acc: 100, pp: 15, prio: 1, d: '從暗處撲過來抓。搶先出手。', cls: 'strike', mfx: mxRecolor(MFX.m_claw, ['#1a1028', '#6a4a9a', '#f0d870']) },
  m7_nocturne: { n: '夜曲', t: '一般', cat: '變', acc: 75, pp: 10, st: 'slp', d: '用翅膀奏出夜曲。讓對手睡著。', cls: 'debuff', mfx: mxRecolor(MFX.m_lullaby, ['#1a3a1a', '#8ad05a', '#e8ffd0']) },
  m7_stoneSmash: { n: '圓石砸', t: '岩', cat: '物', pow: 60, acc: 95, pp: 15, eff: { flinch: 1, p: 20 }, d: '抱著發光的圓石砸下來。有時讓對手退縮。', cls: 'strike', mfx: mxRecolor(MFX.m_boulder, ['#3a4a5a', '#a8c8e0', '#f0fbff']) },
  m7_rootTrip: { n: '樹根絆', t: '草', cat: '物', pow: 45, acc: 100, pp: 15, eff: { stat: { spe: -1 }, p: 60 }, d: '伸出樹根絆住對手。常常降低對手的速度。', cls: 'strike', fx: 'm_rootBind' },
  m7_quicksand: { n: '流沙拖曳', t: '岩', cat: '特', pow: 55, acc: 95, pp: 10, eff: { stat: { spe: -1 }, p: 100 }, d: '讓對手腳下的沙變成流沙，把對手往下拖。降低對手的速度。', cls: 'bolt', mfx: mxRecolor(MFX.m_sandTomb, ['#6a4a20', '#d8b070', '#f8e8c0']) },
  m7_moonBubble: { n: '月光水彈', t: '水', cat: '特', pow: 60, acc: 100, pp: 15, d: '吐出一顆帶著月光的水彈。', cls: 'bolt', mfx: mxRecolor(MFX.m_waterBomb, ['#3a4a8a', '#c8d8ff', '#ffffff']) },
  m7_lureLight: { n: '迷途之光', t: '一般', cat: '變', pp: 10, smoke: 2, d: '燈籠的綠光忽明忽暗，讓人看不清牠在哪裡。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { yield* M6FX.cloud.call(this, U, ['#1a4a2a', '#60e090', '#d0ffe0']); } },
  m7_illusion: { n: '幻術', t: '一般', cat: '特', pow: 50, acc: 100, pp: 15, eff: { stat: { atk: -1 }, p: 30 }, d: '頭上的楓葉一亮，變出幻影騙過對手。有時降低對手的物攻。', cls: 'bolt', mfx: mxRecolor(MFX.m_mapleStorm, ['#6a2a10', '#e8742a', '#ffd090']) },
  m7_deathCharge: { n: '亡騎衝鋒', t: '一般', cat: '物', pow: 95, acc: 90, pp: 5, charge: 1, chargeMsg: '把頭盔夾在腋下，舉起了劍……', warn: '（這一擊很重！先防禦！）', d: '舉起劍蓄力一回合，下一回合衝過來重擊。', cls: 'charge', mfx: mxRecolor(MFX.m_spearRush, ['#1a2a5a', '#6aa0ff', '#e0f0ff']) },
  m7_pilfer: { n: '偷襲', t: '一般', cat: '物', pow: 40, acc: 100, pp: 15, d: '俯衝下來啄一口，順便叼走一點金錢。打倒牠就能拿回來。', cls: 'strike', mfx: mxRecolor(MFX.m_diveBomb, ['#14141c', '#4a4a5a', '#f0d870']) },
  m7_pumpkinFire: { n: '南瓜火', t: '火', cat: '特', pow: 60, acc: 100, pp: 15, eff: { st: 'brn', p: 20 }, d: '從刻出來的嘴裡噴出南瓜裡的火。有時讓對手灼傷。', cls: 'bolt', mfx: mxRecolor(MFX.m_flameBreath, ['#6a2a08', '#f08a20', '#ffe080']) },
  m7_aurora: { n: '極光', t: '水', cat: '特', pow: 60, acc: 100, pp: 10, drain: 0.5, d: '放出一道極光打向對手。回復造成傷害一半的 HP。', cls: 'bolt', mfx: mxRecolor(MFX.m_prismRay, ['#2a1a6a', '#60f0b0', '#e0d0ff']) },
  m7_emberDive: { n: '餘燼俯衝', t: '火', cat: '物', pow: 65, acc: 95, pp: 15, d: '帶著火星俯衝下來。', cls: 'strike', mfx: mxRecolor(MFX.m_diveBomb, ['#3a0a0a', '#e8501a', '#ffd070']) },
};
for (const k in M7_MOVES) { const m = M7_MOVES[k], { mfx, ...mv } = m; MOVES[k] = { ...mv, foe: 1 }; if (mfx) { MFX[k] = mfx; MOVES[k].fx = k; } (MON_CLASS[m.cls] || (MON_CLASS[m.cls] = [])).push(k);
  const D = defPut('skills', k, skillFromMove(k, MOVES[k], { kind: 'skill', extraTags: ['monster_skill'] })); D.cooldown = 0;
  if (k === 'm7_pilfer') D.effects.push({ type: 'steal_gold', pct: 0.03, min: 20 });
  D.effects = D.effects.map((ef, i) => effRegister('skill:' + k + '#e' + i, ef)); D.after = D.after.map((ef, i) => effRegister('skill:' + k + '#a' + i, ef)); }
// [key, name, family, role, moves (signature first), material, placeholder look, dex, map]
const M7_MON = [
  ['nightCat', '夜影貓', 'beast', 'fast', ['m7_shadowClaw', 'm_bite', 'm_scurry', 'm_pounce'], 'hareFur', ['fox', 250, 0.15, 0.4], '只在晚上出來散步的黑貓。黑暗裡只看得到那雙金色的眼睛。', 'route'],
  ['nightCricket', '夜啼蟋蟀', 'insect', 'mage', ['m7_nocturne', 'm_buzzShock', 'm_bite', 'm_screech'], 'stinger', ['mireFly', 90, 0.8, 0.9], '晚上在丘陵的草叢裡唱歌的大蟋蟀。聽著聽著就會想睡。', 'windHills'],
  ['nightOtter', '夜遊水獺', 'aquatic', 'phys', ['m7_stoneSmash', 'm_bubbleSpit', 'm_tailSlam', 'm_bite'], 'frogSkin', ['hornHare', 20, 0.5, 0.6], '晚上抱著發光的圓石在溪邊遊蕩的水獺。那顆石頭是牠的寶貝。', 'jadeCreek'],
  ['nightTreant', '夜遊樹精', 'plant', 'tank', ['m7_rootTrip', 'm_branchSlam', 'm_leafDart', 'm_rootLeech'], 'rotWood', ['flower', 100, 0.5, 0.6], '晚上才會拔出根來走路的小樹。早上會若無其事地站回原地。', 'forest'],
  ['sandSkull', '流沙骸骨', 'undead', 'tank', ['m7_quicksand', 'm_boneClub', 'm_rattle', 'm_sandBlast'], 'boneShard', ['fallenSoldier', 30, 0.3, 1.3], '半埋在沙裡的骸骨。晚上沙子變冷，牠就會爬出來。', 'canyon'],
  ['moonFish', '月鱗魚', 'aquatic', 'mage', ['m7_moonBubble', 'm_bubbleSpit', 'm_waterBomb', 'm_moonBeam'], 'moonDew', ['moonSprite', 0, 0.2, 1.3], '鱗片會反射月光的魚。月亮越圓，跳得越高。', 'lake'],
  ['lanternBog', '提燈沼怪', 'spirit', 'mage', ['m7_lureLight', 'm_ghostFire', 'm_hex', 'm_mudBomb'], 'ectoplasm', ['ghostLamp', 90, 0.8, 0.9], '提著綠色燈籠的沼澤怪。會把迷路的人往泥沼裡帶。', 'swamp'],
  ['mapleTanuki', '楓林狸', 'beast', 'mage', ['m7_illusion', 'm_bite', 'm_taunt', 'm_roll'], 'wolfPelt', ['fox', 30, 0.5, 0.6], '頭上頂著楓葉的狸貓。會變出幻影騙過路的旅人。', 'maplePass'],
  ['headlessKnight', '無頭騎士', 'undead', 'phys', ['m7_deathCharge', 'm_darkSlash', 'm_boneShield', 'm_wail'], 'ectoplasm', ['boneKnight', 200, 0.6, 1.0], '抱著自己頭盔的騎士亡靈。每天晚上都在古戰場上巡邏。', 'oldField'],
  ['thiefCrow', '夜盜鴉', 'bird', 'fast', ['m7_pilfer', 'm_peck', 'm_dive', 'm_featherGust'], 'feather', ['bird', 0, 0.1, 0.35], '戴著黑眼罩的烏鴉。專挑晚上趕路的旅人下手。', 'northRoad'],
  ['pumpkinLantern', '南瓜燈怪', 'plant', 'mage', ['m7_pumpkinFire', 'm_vineLash', 'm_seedBomb', 'm_emberSpit'], 'wheat', ['mush', 30, 1.0, 1.1], '刻著笑臉的南瓜，裡面的火整晚都不會熄。', 'goldPlains'],
  ['auroraSprite', '極光精', 'spirit', 'mage', ['m7_aurora', 'm_iceShard', 'm_chillMist', 'm_moonDust'], 'iceCrystal', ['gustSprite', 140, 0.9, 1.2], '從極光裡落下來的精靈。天亮之前就會回到天上。', 'frostField'],
  ['emberBat', '餘燼蝙蝠', 'bird', 'fast', ['m7_emberDive', 'm_bite', 'm_screech', 'm_emberSpit'], 'batWing', ['caveBat', 10, 1.0, 0.8], '翅膀上有餘燼紋路的蝙蝠。飛過的地方會留下火星。', 'emberPass'],
];
const M7_KEYS = new Set(), M7_OF_MAP = {};
const zoneLv12 = z => { let lo = 99, hi = 0; for (const r of z.table) if (!r.night12) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2]); } return [lo, hi]; };
for (const [k, n, fam, role, moves, mat, look, dex, map] of M7_MON) {
  const zs = (MAPS[map] && MAPS[map].encounters) || []; let lv = 0; for (const z of zs) lv = Math.max(lv, zoneLv12(z)[1]); if (!lv) lv = 10;
  const ok = moves.filter(m => MOVES[m]); if (ok.length < moves.length) bvErr('v12.7', k + ' moves ' + moves.filter(m => !MOVES[m]).join(','));
  SPECIES[k] = { n, fam, base: CH2_ROLE[role].map(v => Math.round(v * 60)), exp: 45 + 3 * lv, gold: Math.round(lv * 1.6), learn: ok.map((m, i) => [i === 3 ? lv + 1 : 1, m]), dex: dex + '（只在晚上出現）', mat, night12: map };
  MON_PANEL[k] = ch1Panel(lv, role, 'wild');
  const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF[k] = HD_RIG_OF[b] || b; if (ART[b]) ART[k] = artRecolor(ART[b], dh, ks, kl);
  CH2_KEYS.add(k); M7_KEYS.add(k); M7_OF_MAP[map] = k;
  defPut('enemies', k, { tags: ['foe', 'fam:' + fam], skills: ok.filter(id => DEF.skills[id]), fam, trait: null, profile: typeof aiProfile === 'function' ? aiProfile({ sp: k }) : 'brute', script: null, metadata: { n } });
  // every zone of the map gets the night monster (weight 0 by day, so the 圖鑑 and the quest helper still know where it lives)
  for (const z of zs) { const [lo, hi] = zoneLv12(z); const row = [k, lo, hi, 0]; row.night12 = 1; z.table.push(row); }
}
// abilities lined up with the map's other monsters (same rule as the 第六輪 monsters)
(function () {
  const KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  for (const [k, , , role, , , , , map] of M7_MON) {
    const refs = []; for (const z of (MAPS[map] && MAPS[map].encounters) || []) for (const [sp] of z.table) if (!M7_KEYS.has(sp) && !(typeof M6_KEYS !== 'undefined' && M6_KEYS.has(sp)) && MON_PANEL[sp] && SPECIES[sp] && !SPECIES[sp].elite && !refs.some(r => r[0] === sp)) refs.push([sp, MON_PANEL[sp]]);
    if (!refs.length) continue; const lv = MON_PANEL[k].lv, P = { lv }, R = CH2_ROLE[role] || CH2_ROLE.bal;
    KEYS.forEach((q, i) => { const m = refs.reduce((a, [, r]) => a + r[q] * (lv + 10) / (r.lv + 10), 0) / refs.length; P[q] = Math.max(1, Math.round(m * R[i])); });
    P.crit = 5; if (role === 'fast') P.eva = 6; MON_PANEL[k] = P;
    const e = refs.reduce((a, [sp]) => a + (SPECIES[sp].exp || 0), 0) / refs.length, g = refs.reduce((a, [sp]) => a + (SPECIES[sp].gold || 0), 0) / refs.length;
    if (e) SPECIES[k].exp = Math.round(e * 1.1); if (g) SPECIES[k].gold = Math.round(g * 1.1);
  }
})();
// time-of-day weights: day-only creatures sleep at night, night creatures come out (≈ a quarter of the monsters at night)
const DAY_ONLY12 = new Set(['bird', 'bee', 'harpy', 'mapleButterfly', 'plainsHawk', 'fieldBee', 'volcanoHawk']);
const NIGHT_LEAN12 = new Set(['nightBird', 'fireflySwarm', 'moonSprite', 'duskMoth', 'marshWisp', 'battleWisp', 'bladeGhost', 'fallenSoldier', 'barnOwl', 'scarecrow', 'iceOwl']);
function dnTables12(ph = dnPhase12()) {
  for (const id in MAPS) { if (!dnOut12(id)) continue; for (const z of MAPS[id].encounters || []) {
    for (const r of z.table) if (r.w0 === undefined) r.w0 = r[3];
    let tot = 0; for (const r of z.table) if (!r.night12) { r[3] = ph === 'night' && DAY_ONLY12.has(r[0]) ? 0 : ph === 'night' && NIGHT_LEAN12.has(r[0]) ? r.w0 * 2 : r.w0; tot += r[3]; }
    for (const r of z.table) if (r.night12) r[3] = ph === 'night' ? Math.round(tot * 0.33) : ph === 'dawn' || ph === 'dusk' ? Math.round(tot * 0.09) : 0;
    // the 0-weight rows go last so a roll of exactly 0 can never land on them
    z.table.sort((a, b) => (b[3] > 0) - (a[3] > 0));
  } }
  Game.dnTablesFor = ph;
}
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) {
    const st = this.st; if (Game.dnTablesFor !== dnPhase12(st)) dnTables12(dnPhase12(st));
    _ld.call(this, id, ...a); this.dnLoad12();
  }; }

/* ---------- NPC 作息 ---------- */
const DAY_NPC12 = { town: ['kid', 'peddler', 'farmer', 'auntie'], capital: ['capKid'], frostVillage: ['frostKid'] };
const CLOSED12 = { shop: '道具店', capShop: '王都道具店', frostShop: '雜貨店', clockShop: '鐘錶店' };
for (const m in DAY_NPC12) for (const n of MAPS[m].npcs || []) if (DAY_NPC12[m].includes(n.id)) { const s0 = n.show; n.show = st => (!s0 || s0(st)) && dnPhase12(st) !== 'night'; }
{ const _ed = Overworld.prototype.enterDoor; Overworld.prototype.enterDoor = function* (b, dx, dy) {
    const to = b.to && b.to[0], st = this.st;
    if (CLOSED12[to] && dnPhase12(st) === 'night') {
      const story = to === 'clockShop' && STORY_MARKS.clockmaker && STORY_MARKS.clockmaker(st);
      if (!story) { Sound.sfx('bump'); yield* say('（' + CLOSED12[to] + '的門上掛著「今天打烊了」的牌子。明天早上再來吧。）'); return; }
      yield* say('（門上掛著「今天打烊了」……裡面還亮著燈。敲了敲門，艾德探出頭來：「這麼晚了？……進來吧。」）');
    }
    return yield* _ed.call(this, b, dx, dy);
  }; }

/* ---------- 路燈、營火（新的小擺設） ---------- */
CH2_PROPS.lamppost12 = spriteFrom(['.......kk.......', '......kMMk......', '.....kMMMMk.....', '.....kLllLk.....', '.....kLllLk.....', '.....kLLLLk.....', '......kMMk......', '.......kk.......',
  '......kPpk......', '......kPpk......', '......kPpk......', '......kPpk......', '......kPpk......', '.....kPPppk.....', '....kPPPpppk....', '....kkkkkkkk....'],
  { k: '#1e1a1e', M: '#4a4a56', L: '#e8b84a', l: '#fff0b0', P: '#3a3440', p: '#6a6070' });
CH2_PROPS.lampOff12 = spriteFrom(['.......kk.......', '......kMMk......', '.....kMMMMk.....', '.....kLllLk.....', '.....kLllLk.....', '.....kLLLLk.....', '......kMMk......', '.......kk.......',
  '......kPpk......', '......kPpk......', '......kPpk......', '......kPpk......', '......kPpk......', '.....kPPppk.....', '....kPPPpppk....', '....kkkkkkkk....'],
  { k: '#1e1a1e', M: '#4a4a56', L: '#3a3a44', l: '#5a5a66', P: '#3a3440', p: '#6a6070' });
CH2_PROPS.campfire12 = spriteFrom(['................', '................', '................', '................', '................', '................', '.......ff.......', '......fFFf......',
  '.....fFyyFf.....', '.....fFyyFf.....', '......fFFf......', '...kWWkkkkWWk...', '..kWwwWkkWwwWk..', '..kkWWkkkkWWkk..', '...kkkkkkkkkk...', '................'],
  { k: '#2a1a12', W: '#7a4a2a', w: '#a8703a', f: '#e8501a', F: '#f8a030', y: '#fff0a0' });
if (typeof PORTRAIT_PROPS !== 'undefined') for (const k of ['lamppost12', 'lampOff12', 'campfire12']) PORTRAIT_PROPS.add(k);
const LAMPS12 = { town: [[4, 7], [17, 7], [9, 13], [12, 22]], capital: [[12, 7], [15, 13], [12, 18], [15, 24]], frostVillage: [[8, 5], [10, 10], [17, 10]] };
const ROUTE_LAMPS12 = [[9, 7], [12, 20], [9, 36]];
const lampsLit12 = st => ROUTE_LAMPS12.filter((_, i) => (st.flags.lamp12 || {})[i]).length;
for (const m in LAMPS12) LAMPS12[m].forEach(([x, y], i) => { const id = 'lamp12_' + m + '_' + i; MAPS[m].npcs.push({ id, x, y, dir: 'down', look: 'lamppost12', name: '路燈' }); Events[id] = function* () { yield* say(dnPhase12() === 'night' ? '路燈亮著，照亮了附近的路。' : '路燈。天黑了才會點亮。'); }; });
ROUTE_LAMPS12.forEach(([x, y], i) => { const id = 'lampR12_' + i;
  MAPS.route.npcs.push({ id, x, y, dir: 'down', look: 'lampOff12', name: '熄掉的路燈', show: st => !(st.flags.lamp12 || {})[i] });
  MAPS.route.npcs.push({ id: id + 'on', x, y, dir: 'down', look: 'lamppost12', name: '路燈', show: st => !!(st.flags.lamp12 || {})[i] });
  Events[id] = function* (ow) { const st = Game.st, f = st.flags;
    if (f.watch12 !== 1) { yield* say('熄掉的路燈。燈芯好像被風吹熄了。'); return; }
    if (dnPhase12(st) !== 'night') { yield* say('熄掉的路燈。巴特說要晚上點亮，等天黑了再來吧。'); return; }
    (f.lamp12 = f.lamp12 || {})[i] = 1; Sound.sfx('fire'); if (ow) ow.dnNpcs12(); yield* say('點亮了路燈！（' + lampsLit12(st) + '／3）' + (lampsLit12(st) >= 3 ? '\n三盞都亮了。回去告訴守夜人巴特吧。' : '')); };
  Events[id + 'on'] = function* () { yield* say('路燈亮著。巴特說，有燈的路，迷路的人就找得到回家的方向。'); }; });
// a campfire next to every 旅人營地
const CAMPFIRES12 = [];
for (const id in BIGMAP12) for (const n of BIGMAP12[id].npcs || []) if (/^camp6_/.test(n.id)) {
  const d = MAPS[id], busy = (x, y) => (d.npcs || []).some(q => q.x === x && q.y === y) || (d.items || []).some(q => q.x === x && q.y === y) || (d.gathers || []).some(q => q.x === x && q.y === y);
  const spot = [[1, 0], [-1, 0], [1, 1], [-1, 1], [0, 1]].map(([dx, dy]) => [n.x + dx, n.y + dy]).find(([x, y]) => d.rows[y] && '.,'.includes(d.rows[y][x]) && !busy(x, y));
  if (!spot) continue; const fid = 'campfire12_' + id; d.npcs.push({ id: fid, x: spot[0], y: spot[1], dir: 'down', look: 'campfire12', name: '營火' }); CAMPFIRES12.push(fid);
  Events[fid] = function* () { yield* say('營火劈啪作響。坐在旁邊，身體暖了起來。'); };
}

/* ---------- 晚上才出現的 NPC ---------- */
const NIGHT_NPC12 = [
  ['town', { id: 'nightWatch12', x: 9, y: 8, dir: 'down', look: 'man', name: '守夜人巴特' }],
  ['capital', { id: 'nightMarket12', x: 16, y: 12, dir: 'down', look: 'woman2', name: '夜市商人露娜' }],
  ['frostVillage', { id: 'stargazer12', x: 17, y: 4, dir: 'down', look: 'old', name: '觀星的艾溫' }],
];
for (const [m, n] of NIGHT_NPC12) MAPS[m].npcs.push({ ...n, show: st => dnPhase12(st) === 'night' });
Events.nightWatch12 = function* () { const st = Game.st, f = st.flags;
  if (!f.watch12) { yield* sayAll(['巴特：「晚安。我是萌芽鎮的守夜人巴特。每天晚上都提著燈在鎮上巡邏。」', '巴特：「晨霧道路上的路燈，最近有三盞被風吹熄了。我的腿不好，走不了那麼遠……」', '巴特：「你晚上經過的時候，能幫我把它們點亮嗎？就在大路旁邊。」']); f.watch12 = 1; return; }
  if (f.watch12 === 1) { const n = lampsLit12(st); if (n < 3) { yield* say('巴特：「還有' + (3 - n) + '盞沒亮。晚上去晨霧道路，路燈就在大路旁邊。」'); return; }
    f.watch12 = 2; st.bag.superPotion = (st.bag.superPotion || 0) + 3; st.money += 1000; yield* sayAll(['巴特：「都亮了！從鎮口就看得到那一排光。」', '巴特：「謝謝你。有燈的路，迷路的人就找得到回家的方向。」']); yield* itemGet(st.name + '得到了好傷藥×3和1000 G！'); return; }
  yield* say(pick(['巴特：「今晚也很安靜。路燈都好好地亮著。」', '巴特：「晚上的晨霧道路有黑貓出沒。別看牠小，爪子可快了。」', '巴特：「睡不著的時候，我就數數天上的星星。」']));
};
const NIGHT_MARKET12 = ['trainBook', 'megaPotion', 'megaEther', 'elixir', 'talentReset'];
Events.nightMarket12 = function* () { const st = Game.st; yield* say('露娜：「歡迎光臨夜市！白天買不到的好東西，只有晚上才有喔。……價錢嘛，晚上嘛，稍微貴一點。」');
  const keep = {}, L = NIGHT_MARKET12.filter(k => ITEMS[k]); for (const k of L) { keep[k] = ITEMS[k].price; ITEMS[k].price = Math.round(ITEMS[k].price * 1.25 / 10) * 10; }
  try { yield* shopFlow(L); } finally { for (const k in keep) ITEMS[k].price = keep[k]; } };
Events.stargazer12 = function* () { const st = Game.st, f = st.flags;
  if (!f.aurora12) { yield* sayAll(['艾溫：「……噓。你看，今晚的星星特別清楚。」', '艾溫：「我在霜語村看了五十年的星星。運氣好的晚上，北邊的天空會出現極光。」', '艾溫：「霜語雪原的雪丘上看得最清楚。年輕人，有空去看看吧。看過的人，都說心裡會暖起來。」']); f.aurora12 = 1; return; }
  if (f.aurora12 === 1) { yield* say('艾溫：「極光要晚上才看得到。去霜語雪原的雪丘吧。」'); return; }
  yield* say(pick(['艾溫：「你看到了吧？……那就是北境的極光。」', '艾溫：「極光每晚都會來。累了的時候，再去看看吧。」']));
};
NPC_ROLES.任務.push('nightWatch12', 'stargazer12'); NPC_ROLES.商店.push('nightMarket12');
for (const m in LAMPS12) LAMPS12[m].forEach((_, i) => (NPC_ROLES.事件 || NPC_ROLES.情報).push('lamp12_' + m + '_' + i));
ROUTE_LAMPS12.forEach((_, i) => (NPC_ROLES.事件 || NPC_ROLES.情報).push('lampR12_' + i, 'lampR12_' + i + 'on'));
for (const id of CAMPFIRES12) (NPC_ROLES.事件 || NPC_ROLES.情報).push(id);
for (const m of ['town', 'capital', 'frostVillage', 'route', 'canyon', 'maplePass', 'goldPlains', 'emberPass']) if (typeof mapCache !== 'undefined') delete mapCache[m];

/* ---------- 夜晚限定：採集、事件、支線 ---------- */
{ const _dg = doGather; doGather = function (kind, st = Game.st) { const r = _dg(kind, st);
    if ((kind === 'mana' || kind === 'dew') && dnNight12(st)) { const m = GATHER_KINDS[kind][1]; st.bag[m] = (st.bag[m] || 0) + 1; r.text += '（夜晚＋' + ITEMS[m].n + '×1）'; }
    return r; }; }
{ const _dk = Events.oldDuke; if (_dk) Events.oldDuke = function* (ow) { const st = Game.st, E = evOf(st);
    if (dnPhase12(st) === 'night' && E.dukeNight12 !== dnDay12(st)) { E.dukeNight12 = dnDay12(st);
      yield* sayAll(['……你也看到了吧。丘上那一排藍色的影子。', '每到晚上，他們就會排好隊伍，從丘上走過去。跟三十年前一樣。', '我不怕。他們只是還在守著這裡。……我也是。']); }
    return yield* _dk(ow); }; }
// 麥田的稻草人：晚上，一群稻草人在麥田迷路裡走動
const SCARE12 = { map: 'goldPlains', x: 30, y: 12 };
Overworld.prototype.dnLoad12 = function () {
  const st = this.st, id = st.map;
  if (id === SCARE12.map && dnPhase12(st) === 'night' && !st.flags.scare12done && this.roam12 && !this.roam12.list.some(e => e.scare12)) {
    const z = (MAPS[id].encounters || []).find(q => q.table.some(r => r[0] === 'scarecrow')) || (MAPS[id].encounters || [])[0], [lo, hi] = z ? zoneLv12(z) : [28, 30];
    let spot = null; for (let r = 0; r < 4 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) if (this.roamFree12(SCARE12.x + dx, SCARE12.y + dy)) spot = [SCARE12.x + dx, SCARE12.y + dy];
    const img = roamImg12('scarecrow');
    if (spot && img) { const e = new Entity({ roam: 1, sp: 'scarecrow', lv: hi, enc: { table: [['scarecrow', lo, hi, 1]] }, pack: 3, x: spot[0], y: spot[1], dir: 'down', img, aggro: false, scare12: 1 });
      e.home = [spot[0], spot[1], 'down']; e.timer = 60; this.roam12.list.push(e); this.elites.push(e);
      if (!st.flags.scare12) { st.flags.scare12 = 1; this.run(say('（麥田那邊……好像有什麼在動。是稻草人？稻草人在走路？）')); } }
  }
};
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, ...a) {
    yield* _rf.call(this, e, ...a);
    if (e.scare12 && !this.elites.includes(e)) { const st = this.st; st.flags.scare12done = 1; st.bag.trainBook = (st.bag.trainBook || 0) + 1; st.bag.wheat = (st.bag.wheat || 0) + 5; Sound.jingle('item');
      yield* say('打倒了走進麥田的稻草人！它們身上掉出了一本被麥穗夾住的書。'); yield* itemGet(st.name + '得到了修練之書和金麥穗×5！'); }
  }; }
// 北境的極光
const AURORA12 = { map: 'frostField', x: 30, y: 14, see: 9, r: 3 };
Overworld.prototype.dnStep12 = function () {
  const st = this.st, p = this.p, f = st.flags;
  if (st.map === AURORA12.map && dnPhase12(st) === 'night' && Math.abs(p.x - AURORA12.x) + Math.abs(p.y - AURORA12.y) <= AURORA12.r && f.aurora12 >= 1 && st.auroraNight12 !== dnDay12(st)) {
    st.auroraNight12 = dnDay12(st); st.auroraUntil = (st.steps || 0) + 200; const first = f.aurora12 === 1; f.aurora12 = 2; Sound.sfx('levelUp');
    this.run(sayAll([first ? '……北邊的天空，綠色和紫色的光像布簾一樣慢慢飄動。這就是艾溫說的極光。' : '今晚的極光也很美。', '【極光的祝福】接下來200步，戰鬥經驗值+20%！']));
  }
};
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    if (!cfg) return yield* _bs.call(this, cfg, ...a); const st = this.st;
    let c = { ...cfg, dn: dnOut12(st.map) ? dnPhase12(st) : null };
    if (st.auroraUntil > (st.steps || 0) && cfg.kind === 'wild') c.aevExp = (c.aevExp || 1) * 1.2;
    return yield* _bs.call(this, c, ...a);
  }; }
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const f = st.flags;
    if (f.watch12) L.push({ n: '守夜人的燈', t: f.watch12 >= 2 ? '完成：晨霧道路的路燈都亮了。' : lampsLit12(st) >= 3 ? '三盞路燈都點亮了。回萌芽鎮告訴守夜人巴特吧（晚上才在）。' : '萌芽鎮的守夜人巴特拜託你：晚上把晨霧道路上熄掉的路燈點亮（' + lampsLit12(st) + '／3）。', done: f.watch12 >= 2, rw: '好傷藥×3、1000 G' });
    if (f.scare12) L.push({ n: '麥田的稻草人', t: f.scare12done ? '完成：打倒了晚上走進麥田的稻草人。' : '晚上，金穗平原的麥田迷路裡有一群稻草人在走動。去打倒它們吧（晚上才會出現）。', done: !!f.scare12done, rw: '修練之書、金麥穗×5' });
    if (f.aurora12) L.push({ n: '北境的極光', t: f.aurora12 >= 2 ? '完成：在霜語雪原的雪丘看到了極光。之後每天晚上去看，都能得到極光的祝福。' : '觀星的艾溫說，晚上在霜語雪原的雪丘看得到極光。', done: f.aurora12 >= 2, rw: '極光的祝福（200步內戰鬥經驗值+20%，每晚一次）' });
  }; }

/* ---------- 畫面：世界層的顏色與燈光（08a 在世界層畫完、介面畫之前呼叫 owWorldPost） ---------- */
const DN_KEYS12 = [[0, [92, 100, 168], 0.85], [150, [255, 214, 180], 0.2], [300, [255, 255, 255], 0], [1300, [255, 255, 255], 0], [1450, [255, 182, 134], 0.3], [1600, [108, 104, 172], 0.9], [1700, [74, 86, 156], 1], [2300, [74, 86, 156], 1], [2400, [92, 100, 168], 0.85]];
function dnTint12(c) { for (let i = 0; i < DN_KEYS12.length - 1; i++) { const [c0, a, L0] = DN_KEYS12[i], [c1, b, L1] = DN_KEYS12[i + 1]; if (c >= c0 && c <= c1) { const t = (c - c0) / Math.max(1, c1 - c0); return [a.map((v, j) => Math.round(v + (b[j] - v) * t)), L0 + (L1 - L0) * t]; } } return [[255, 255, 255], 0]; }
const DN_CV12 = { c: null };
const EYES12 = {};
function dnEyes12(sp) { // two glints where the eyes are (the brightest highlight pixels next to dark ones, in a level pair), or null
  if (sp in EYES12) return EYES12[sp];
  let out = null;
  try { const b = typeof chibiBase === 'function' && chibiBase(sp), im = b && chibiImage(sp), M = b && BATTLE_PXC_META[b];
    if (im && M) { const c = mkCanvas(M.w, M.h), g = c.getContext('2d'); g.drawImage(im, M.frames.idle[0] * M.w, 0, M.w, M.h, 0, 0, M.w, M.h); const d = g.getImageData(0, 0, M.w, M.h).data;
      const L = (x, y) => { if (x < 0 || y < 0 || x >= M.w || y >= M.h) return -1; const i = (y * M.w + x) * 4; return d[i + 3] ? 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2] : -1; };
      let top = M.h, bot = 0, l = M.w, r = 0; for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) if (L(x, y) >= 0) { top = Math.min(top, y); bot = Math.max(bot, y); l = Math.min(l, x); r = Math.max(r, x); }
      const cx = (l + r) / 2, hgt = bot - top, cand = [];
      for (let y = top + Math.round(hgt * 0.08); y < top + Math.round(hgt * 0.7); y++) for (let x = l + 2; x < r - 1; x++) { const v = L(x, y); if (v < 200) continue; if ([[-2, 0], [2, 0], [0, 2], [0, -2], [-2, 2], [2, 2]].some(([a, bb]) => { const q = L(x + a, y + bb); return q >= 0 && q < 70; })) cand.push([x, y]); }
      const cl = []; for (const [x, y] of cand) { const k = cl.find(q => Math.abs(q[0] - x) <= 4 && Math.abs(q[1] - y) <= 4); if (k) { k[0] = (k[0] * k[2] + x) / (k[2] + 1); k[1] = (k[1] * k[2] + y) / (k[2] + 1); k[2]++; } else cl.push([x, y, 1]); }
      let best = null, bs = 1e9; for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) { const A = cl[i], B = cl[j], dx = Math.abs(A[0] - B[0]), dy = Math.abs(A[1] - B[1]), mid = (A[0] + B[0]) / 2;
        if (dy > 4 || dx < 6 || dx > Math.max(14, (r - l) * 0.6)) continue; const s = Math.abs(mid - cx) * 2 + dy + (A[1] + B[1]) / 2 * 0.05; if (Math.abs(mid - cx) <= Math.max(5, (r - l) * 0.14) && s < bs) { bs = s; best = [A, B]; } }
      if (best) out = { pts: best.map(q => [q[0] / 2, q[1] / 2]), w: M.w / 2, h: M.h / 2 };
    } } catch (e) { out = null; }
  return EYES12[sp] = out;
}
function dnGhost12() { if (DN_CV12.ghost !== undefined) return DN_CV12.ghost; const im = roamImg12('fallenSoldier'); if (!im) return null;
  const c = mkCanvas(im.c.width, im.c.height), g = c.getContext('2d'); g.drawImage(im.c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(120,170,255,0.75)'; g.fillRect(0, 0, c.width, c.height); return DN_CV12.ghost = c; }
// the weather layer is drawn after the dark: dim it at night so fog and snow do not glow
{ const _wo = wxOverlay; wxOverlay = function (x, k, t, w, h) { const st = Game.st, ph = st && dnOut12(st.map) ? dnPhase12(st) : 'day';
    if (ph === 'day' || !(Game.scene instanceof Overworld)) return _wo(x, k, t, w, h); x.save(); x.globalAlpha = ph === 'night' ? 0.4 : 0.7; try { _wo(x, k, t, w, h); } finally { x.restore(); } }; }
const GLOW12 = { marshWisp: [124, 255, 160], battleWisp: [140, 190, 255], mistWisp: [200, 210, 255], lanternBog: [110, 255, 140], pumpkinLantern: [255, 170, 60], auroraSprite: [150, 255, 210], emberBat: [255, 110, 40], fireflySwarm: [220, 255, 120], moonFish: [210, 225, 255], thornMush: [210, 140, 255] };
function owWorldPost(ow, x) {
  const st = ow.st; if (!st || !ow.map || !dnOut12(st.map)) return;
  const [col, Lt] = dnTint12(dnClock12(st)); if (col[0] >= 254 && col[1] >= 254 && col[2] >= 254) return;
  const z = ow._zc ? ZOOM_F : 1, S = (wx, wy) => { let sx = wx - ow.camX, sy = wy - ow.camY; if (ow._zc) { sx = ow._zc[0] + (sx - ow._zc[0]) * z; sy = ow._zc[1] + (sy - ow._zc[1]) * z; } return [sx, sy]; };
  const lights = [], warm = [], spots = [];
  const add = (wx, wy, r, a, w) => { const [sx, sy] = S(wx, wy); if (sx < -r * z - 20 || sy < -r * z - 20 || sx > W + r * z + 20 || sy > H + r * z + 20) return; lights.push([sx, sy, r * z, a]); if (w) warm.push([sx, sy, r * z * 0.8, w]); };
  const night = dnPhase12(st) === 'night', fl = 0.9 + 0.1 * Math.sin(ow.t * 0.31) * Math.sin(ow.t * 0.17);
  if (!ow.hideHero) add(ow.p.px + 8, ow.p.py + 6, 32, 0.7 * Lt);
  for (const { b } of ow.map.bimgs || []) { const winCols = []; for (let i = 0; i < b.w; i++) if (i !== b.door && (b.w <= 4 ? i === (b.door === 0 ? b.w - 1 : 0) || i === b.w - 1 && b.door !== b.w - 1 : (i === 1 || i === b.w - 2))) winCols.push(i);
    const wy = b.y * 16 + b.h * 16 - 34; for (const i of winCols) { add(b.x * 16 + i * 16 + 8, wy + 12, 16, 0.6 * Lt, [255, 200, 110, 0.16 * Lt]); spots.push([b.x * 16 + i * 16 + 4, wy + 5, 8, 10]); } }
  for (const n of ow.npcs) { if (n.look === 'lamppost12') { add(n.px + 8, n.py + 4, 30, 0.9 * Lt, [255, 210, 120, 0.26 * Lt]); spots.push([n.px + 6, n.py + 2, 4, 3, 1]); }
    else if (n.look === 'campfire12') add(n.px + 8, n.py + 12, 36 * fl, 0.95 * Lt, [255, 150, 60, 0.3 * Lt * fl]);
    else if (/^camp6_|^nightWatch12$/.test(n.id)) add(n.px + 8, n.py + 10, 18, 0.5 * Lt, n.id === 'nightWatch12' ? [255, 210, 120, 0.2 * Lt] : null); }
  for (const it of ow.items) if (it.gather && (it.kind === 'mana' || it.kind === 'dew')) add(it.px + 8, it.py + 10, 16, 0.65 * Lt, [120, 190, 255, 0.25 * Lt]);
  const eyes = [];
  for (const e of ow.elites) { const g = GLOW12[e.sp]; add(e.px + 8, e.py + 6, g ? 26 : e.roam ? 13 : 18, (g ? 0.8 : 0.4) * Lt, g ? [...g, 0.28 * Lt] : null);
    if (e.roam && e.img && e.img.big && Lt > 0.4) { const E = dnEyes12(e.sp); if (E) { const im = e.dir === 'right' ? e.img.flip : e.img.c, cx = Math.round(e.px) + 8, foot = Math.round(e.py) + 15, hop = e.moving ? Math.round(Math.sin(Math.min(1, e.prog / 16) * Math.PI) * 3) : (Math.floor((ow.t + e.x * 13) / 20) % 4 === 0 ? 1 : 0);
      const ox = cx - (im.width >> 1), oy = foot - im.height - hop; for (const [px, py] of E.pts) eyes.push(S(ox + (e.dir === 'right' ? im.width - 1 - px : px), oy + py)); } } }
  if (ow.boss) add(ow.boss.px + 8, ow.boss.py + 8, 24, 0.5 * Lt);
  // the darkness, with the lights cut out of it
  const cw = W * 2, ch = H * 2; if (!DN_CV12.c || DN_CV12.c.width !== cw) DN_CV12.c = mkCanvas(cw, ch);
  const c = DN_CV12.c, g = c.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgb(' + col.join(',') + ')'; g.fillRect(0, 0, W, H);
  for (const [sx, sy, r, a] of lights) { if (a <= 0.01) continue; const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r); gr.addColorStop(0, 'rgba(255,255,255,' + Math.min(1, a).toFixed(3) + ')'); gr.addColorStop(0.55, 'rgba(255,255,255,' + (a * 0.45).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(sx - r, sy - r, r * 2, r * 2); }
  x.save(); x.globalCompositeOperation = 'multiply'; x.imageSmoothingEnabled = true; x.drawImage(c, 0, 0, W, H);
  x.globalCompositeOperation = 'lighter';
  for (const [sx, sy, r, w] of warm) { const gr = x.createRadialGradient(sx, sy, 0, sx, sy, r); gr.addColorStop(0, 'rgba(' + w[0] + ',' + w[1] + ',' + w[2] + ',' + w[3].toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + w[0] + ',' + w[1] + ',' + w[2] + ',0)'); x.fillStyle = gr; x.fillRect(sx - r, sy - r, r * 2, r * 2); }
  x.restore(); x.imageSmoothingEnabled = false;
  // lit windows and lamp glass, glowing eyes
  if (Lt > 0.05) { x.save(); x.globalAlpha = Math.min(1, Lt * 1.1);
    for (const [wx, wy, w, h, lamp] of spots) { const [sx, sy] = S(wx, wy); x.fillStyle = lamp ? '#fff0a8' : '#f8c868'; x.fillRect(Math.round(sx), Math.round(sy), Math.round(w * z), Math.round(h * z)); if (!lamp) { x.fillStyle = 'rgba(120,60,20,0.55)'; x.fillRect(Math.round(sx + w * z / 2 - 0.5), Math.round(sy), 1, Math.round(h * z)); x.fillRect(Math.round(sx), Math.round(sy + h * z / 2), Math.round(w * z), 1); } }
    if (Lt > 0.4) for (const [sx, sy] of eyes) { x.fillStyle = 'rgba(255,240,150,0.35)'; x.fillRect(Math.round(sx - 1), Math.round(sy - 1), 3, 3); x.fillStyle = '#fff8c0'; x.fillRect(Math.round(sx), Math.round(sy), Math.max(1, Math.round(z)), Math.max(1, Math.round(z))); }
    x.restore(); }
  if (night) dnNightFx12(ow, x, S, z);
}
function dnNightFx12(ow, x, S, z) {
  const st = ow.st, t = ow.t;
  // 古戰場：亡靈的隊伍從英靈之丘走過
  if (st.map === 'oldField') { const c = dnGhost12(); if (c) { x.save(); for (let i = 0; i < 5; i++) { const wx = 18 * 16 + ((t * 0.35 + i * 34) % (19 * 16)), wy = 17 * 16 + (i % 2) * 6 + 12, [sx, sy] = S(wx, wy); if (sx < -30 || sx > W + 30 || sy < -40 || sy > H + 20) continue;
      x.globalAlpha = 0.45 + 0.15 * Math.sin(t * 0.05 + i); x.drawImage(c, Math.round(sx - c.width * z / 2), Math.round(sy - c.height * z - 2 * Math.sin(t * 0.08 + i)), Math.round(c.width * z), Math.round(c.height * z)); } x.restore(); } }
  // 霜語雪原：雪丘附近的極光
  if (st.map === AURORA12.map) { const p = ow.p, d = Math.abs(p.x - AURORA12.x) + Math.abs(p.y - AURORA12.y); if (d <= AURORA12.see) { const a = 0.55 * (1 - d / (AURORA12.see + 2)); x.save(); x.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) { const base = 18 + k * 14; x.beginPath(); for (let X = 0; X <= W; X += 4) { const Y = base + Math.sin(X / 23 + t / 40 + k * 1.7) * 9 + Math.sin(X / 9 + t / 25) * 3; X ? x.lineTo(X, Y) : x.moveTo(X, Y); }
        for (let X = W; X >= 0; X -= 4) { const Y = base + 26 + Math.sin(X / 23 + t / 40 + k * 1.7) * 9; x.lineTo(X, Y); } x.closePath();
        const gr = x.createLinearGradient(0, base - 10, 0, base + 36); const c0 = k === 1 ? '170,110,255' : '90,255,170'; gr.addColorStop(0, 'rgba(' + c0 + ',0)'); gr.addColorStop(0.4, 'rgba(' + c0 + ',' + (a * 0.55).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + c0 + ',0)'); x.fillStyle = gr; x.fill(); }
      x.restore(); } }
}

/* ---------- 天色的提示（夜晚、早晨開始時） ---------- */
{ const _d = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    _d.call(this, x); const B = Game.dnBanner; if (!B || UI.stack.length || this.popup || Game.wxBanner || (Game.toastQ && Game.toastQ.length)) return;
    B.t++; if (B.t > 150) { Game.dnBanner = null; return; } if (!dnOut12(this.st.map)) return;
    const a = B.t < 10 ? B.t / 10 : B.t > 130 ? (150 - B.t) / 20 : 1, s1 = B.k === 'night' ? '天黑了' : '天亮了・第' + dnDay12(this.st) + '天', s2 = B.k === 'night' ? '夜行魔物出沒、路燈亮起' : '早晨', w = Math.max(Font.width(s1, 10), Font.width(s2, 9)) + 20;
    x.globalAlpha = a; drawPanel(x, (W - w) / 2, 22, w, 30, null); Font.drawC(x, s1, W / 2, 23, B.k === 'night' ? '#9ab8ff' : '#ffd890', UIC.textSh, 10); Font.drawC(x, s2, W / 2, 36, UIC.text, UIC.textSh, 9); x.globalAlpha = 1;
  }; }
// the weather icon: a moon instead of the sun on clear nights
{ const _wi = wxIcon; wxIcon = function (x, k, X, Y) { if (k === 'clear' && Game.st && dnOut12(Game.st.map) && dnPhase12() === 'night') { x.fillStyle = '#e8ecff'; x.fillRect(X + 3, Y + 2, 5, 7); x.fillRect(X + 2, Y + 3, 1, 5); x.fillStyle = 'rgba(10,14,28,1)'; x.fillRect(X + 5, Y + 2, 3, 5); return; } return _wi(x, k, X, Y); }; }

/* ---------- 戰鬥：夜晚的背景、角色光線 ---------- */
const DN_BATTLE12 = { dawn: [255, 226, 200], dusk: [255, 196, 156], night: [128, 140, 204] };
function dnStage12(src, ph) {
  const c = mkCanvas(src.width, src.height), g = c.getContext('2d'); g.drawImage(src, 0, 0);
  if (ph === 'night') { // stars and the moon only where the picture is open sky (the brightest part of the upper stage)
    let d = null; try { d = g.getImageData(0, 0, c.width, Math.round(c.height * 0.42)).data; } catch (e) { d = null; }
    const lum = (x, y) => { if (!d) return 0; const i = (Math.round(y) * c.width + Math.round(x)) * 4; return 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; };
    g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(' + DN_BATTLE12.night.join(',') + ')'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over';
    const D = c.width / W; let seed = 7; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 90; i++) { const sx = r() * c.width, sy = r() * c.height * 0.4; if (lum(sx, sy) < 140) continue; g.fillStyle = 'rgba(255,255,236,' + (0.55 + r() * 0.45).toFixed(2) + ')'; const s = Math.max(1, Math.round(D * (r() < 0.2 ? 1.6 : 1))); g.fillRect(Math.round(sx), Math.round(sy), s, s); }
    const mx = c.width * 0.84, my = c.height * 0.3, mr = 7 * D; if (lum(mx, my) > 150) { const gr = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3); gr.addColorStop(0, 'rgba(230,236,255,0.35)'); gr.addColorStop(1, 'rgba(230,236,255,0)'); g.fillStyle = gr; g.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
      g.fillStyle = '#f4f2e0'; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill(); g.fillStyle = 'rgba(200,196,170,0.6)'; g.beginPath(); g.arc(mx - mr * 0.3, my + mr * 0.2, mr * 0.25, 0, 7); g.fill(); }
  } else { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(' + DN_BATTLE12[ph].join(',') + ')'; g.fillRect(0, 0, c.width, c.height); }
  return c;
}
{ const _sf = hd2dStageFor; hd2dStageFor = function (b) { const s = _sf(b), ph = b.cfg && b.cfg.dn; if (!ph || ph === 'day') return s; const S = b.hd2d;
    if (S.dnSrc !== s || S.dnPh !== ph) { S.dnStage = dnStage12(s, ph); S.dnSrc = s; S.dnPh = ph; } return S.dnStage; }; }
{ const _la = hd2dLightActor; hd2dLightActor = function (cv, L) { _la(cv, L); const b = Game.scene, ph = b && b.cfg && b.cfg.dn; if (!ph || ph === 'day') return;
    const x = cv.getContext('2d'); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = ph === 'night' ? 'rgba(36,48,110,0.26)' : ph === 'dusk' ? 'rgba(255,130,60,0.12)' : 'rgba(255,200,140,0.08)'; x.fillRect(0, 0, cv.width, cv.height); x.restore(); }; }
{ const _sh = hd2dShafts; hd2dShafts = function (b, x) { if (b.cfg && b.cfg.dn === 'night') return; return _sh(b, x); }; }
