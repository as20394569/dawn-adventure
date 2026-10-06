/* ===================== v12.30 練等・刷寶，變強再打主線（玩家 2026-10-06：「線上RPG…主線的等級跨度很大所以玩家可以在很多地圖練等刷寶物然後變強很多後再攻略主線」） =====================
   問了之後四項都要：
   1. 放寬多練的經驗：比魔物高 1〜2 級經驗照拿，之後每高 1 級 −15%，最少 30%（原本高 1 級 70%、高 2 級 40%、高 3 級只剩 10%）。
   2. 刷寶：每種野外魔物有一件自己的「稀有掉落」（從牠出沒地圖的裝備裡挑一件對得上牠的），打倒時 2% 掉、品質是金色（15% 虹色）；
      挑戰區 ×2、強化魔物 ×3。圖鑑・遭遇卡寫出來，可以照著刷。
   3. 主線等級跨度拉大：主線頭目比原本高 2〜4 級（前期 +2、中期 +3〜4、最後三隻 +3），路上沒打夠的要靠挑戰區練等；
      等級比頭目低 3 級以上去打，會先問要不要回去練。
   4. 挑戰區：每個區域旁邊的洞窟（13 個）魔物和菁英 +4 級（比外面高 3〜5 級；後期的雪洞・黑曜石洞 +6，給最後的頭目練等），裝備掉落 ×2、稀有掉落 ×2；第一次進去會說明。 */
// 1. EXP for out-levelling
expScale = function (heroLv, foeLv) { const d = heroLv - foeLv; const m = d <= 0 ? 1 + Math.min(0.5, -d * BALANCE.expUnder) : d <= 2 ? 1 : Math.max(0.3, 1 - 0.15 * (d - 2)); return m * BALANCE.exp; };
// 3. the main bosses stand further apart
const BOSS_UP13 = { banditBoss: 2, duneWorm: 2, golem: 2, crystalGolem: 3, silverWyrm: 3, hydra: 3, ratKing: 3, harvestGolem: 3, clockColossus: 4, frostQueen: 4, lavaGiant: 3, victorDemon: 3, shadowGeneral: 3 };
// 4. the caves become challenge zones
const CAVE_UP13 = 4, CAVE_UP_LATE13 = { cave6_frostField: 6, cave6_emberPass: 6 }, isChallenge13 = id => /^cave6_/.test(id || ''); // 後期最後兩個洞窟 +6：最後三個頭目 Lv40〜43 要有地方練
{ for (const id in MAPS) { const d = MAPS[id];
    if (d.boss && BOSS_UP13[d.boss.sp] && !d.boss.up13) { d.boss.lv += BOSS_UP13[d.boss.sp]; d.boss.up13 = 1; }
    if (isChallenge13(id) && !d.up13) { d.up13 = 1; const u = CAVE_UP_LATE13[id] || CAVE_UP13; for (const e of d.encounters || []) for (const r of e.table || []) { r[1] += u; r[2] += u; } for (const e of d.elites || []) e.lv += u; } }
  for (const s of FOE_SPOTS) { if (s.kind === 'boss' && MAPS[s.map] && MAPS[s.map].boss && MAPS[s.map].boss.sp === s.sp) s.lv = MAPS[s.map].boss.lv; else if (isChallenge13(s.map)) { const e = (MAPS[s.map].elites || []).find(q => q.sp === s.sp); if (e) s.lv = e.lv; } } }
const caveLv13 = id => { let lo = 99, hi = 0; for (const e of MAPS[id].encounters || []) for (const r of e.table || []) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2]); } return [lo, hi]; };
// the wild gear drop is doubled in a challenge zone (07b reads this)
const dropMul13 = () => isChallenge13(Game.ow && Game.ow.map && Game.ow.map.id) ? 2 : 1;
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a); const id = this.map && this.map.id, st = this.st || Game.st;
    if (isChallenge13(id) && st && !(st.flags.ch13 || {})[id]) { (st.flags.ch13 || (st.flags.ch13 = {}))[id] = 1; const [lo, hi] = caveLv13(id);
      const go = (function* () { yield* say('（挑戰區「' + MAPS[id].name + '」：魔物 Lv' + lo + '〜' + hi + '，比外面強。打倒牠們掉裝備和稀有掉落的機率都加倍，很適合練等、刷寶。）'); })();
      if (this.script) { const s0 = this.script; this.script = (function* () { yield* s0; yield* go; })(); } else this.run(go); } }; }
// 2. every wild species' own rare drop
const RARE13 = { rate: 0.02, rainbow: 0.15 }, RARE_OF13 = {};
function rareOf13(sp) { if (sp in RARE_OF13) return RARE_OF13[sp]; let home = null; for (const id in MAPS) { if (isChallenge13(id) || id === 'rift') continue; if ((MAPS[id].encounters || []).some(e => (e.table || []).some(r => r[0] === sp)) && (MAPS[id].gearPool || []).length) { home = id; break; } }
  if (!home) { for (const id in MAPS) if ((MAPS[id].encounters || []).some(e => (e.table || []).some(r => r[0] === sp)) && (MAPS[id].gearPool || []).length) { home = id; break; } }
  const L = home ? MAPS[home].gearPool.filter(k => GEAR[k] && (typeof dropFits12 !== 'function' || dropFits12(k, sp))) : [];
  // an item named after this very monster (狼 → 狼牙頸鍊, 鳥 → 羽…) is its rare drop when there is one
  const S = SPECIES[sp], own = S && typeof DROP_THEME12 !== 'undefined' ? L.filter(k => DROP_THEME12.some(([rx, ok]) => rx.test(dropNames12(k)) && ok(S))) : [], P = own.length ? own : L;
  let h = 0; for (const c of sp) h = (h * 31 + c.charCodeAt(0)) >>> 0; return RARE_OF13[sp] = P.length ? P[h % P.length] : null; }
const rareName13 = k => { if (!k || !GEAR[k]) return ''; const b = typeof base11Of === 'function' ? base11Of(k) : k; return GEAR[b].n + (b !== k ? '（' + GEAR[k].n + '的樣子）' : ''); };
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this); const st = Game.st; if (!st || !(st.hp > 0)) return r;
    const L = this.defeated ? this.defeated() : []; const mul = dropMul13() * (this.cfg && this.cfg.champ12 ? 3 : 1);
    for (const v of L) { if (v.elite || v.boss || v.minion) continue; const k = rareOf13(v.sp); if (!k || !chance(RARE13.rate * mul)) continue;
      this.focus = v; const g = makeGear(k, chance(RARE13.rainbow) ? 5 : 4); Sound.jingle('item'); yield* this.lootShow(g, v.n + '掉落了稀有裝備！'); }
    return r; }; }
{ const _fd = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _fd(sp, key, kind); if (kind && kind !== 'wild') return L; const k = rareOf13(sp); if (k) L.push('稀有：' + rareName13(k) + '（金・虹，2%）'); return L; }; }
// 3. a main boss well above you: go back and train first?
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { const st = this.st || Game.st;
    if (cfg && cfg.kind === 'boss' && !cfg.rematch && !Game.retrying13 && BOSS_UP13[cfg.sp] && st && cfg.lv - (st.lv || 1) >= 3) { // (v12.56: not again on 再挑戰)
      const n = cfg.lv - st.lv; if (!(yield* yesNo('（' + ((SPECIES[cfg.sp] || {}).n || '頭目') + ' Lv' + cfg.lv + '，比你高 ' + n + ' 級，會很辛苦。\n附近的洞窟是挑戰區，可以先去練等、刷裝備。還是要打嗎？）'))) return 'run'; }
    return yield* _bs.call(this, cfg, ...a); }; }
if (typeof GROW12 !== 'undefined') GROW12.push(['練等與刷寶', '主線頭目比路上的魔物高 2〜4 級，打之前可以先練等。各區域旁邊的洞窟是「挑戰區」：魔物高 3〜5 級，掉裝備・稀有掉落的機率加倍。比魔物高 1〜2 級經驗照拿，再高就慢慢變少（最少 30%）。每種野外魔物都有自己的稀有掉落（金色或虹色，2%），圖鑑和遭遇時都看得到。']);
