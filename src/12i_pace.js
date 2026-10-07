/* ===================== v12.79 戰鬥 C：野外戰少一點、精一點 =====================
   · 一般遇敵機率 ×0.75，野外經驗值 +20%（每走一步拿到的經驗差不多，戰鬥少四分之一）
   · 強化魔物（v12.0.8b）原本只在地圖上看得見的魔物身上（4%），現在隨機遇敵也會出現：Lv8 以後 6%
   · 成就：強化魔物獵人（打倒 30 隻）
   v12.84：戰鬥評價（S／A／B、連續 S 加成、成就「完美戰鬥」）依玩家要求取消 */
const PACE14 = { enc: 0.75, exp: 1.2, champ: 0.06, champLv: 8 };
for (const id in MAPS) for (const e of MAPS[id].encounters || []) if (e && typeof e.rate === 'number' && !e.pace14) { e.rate = Math.round(e.rate * PACE14.enc * 1000) / 1000; e.pace14 = 1; }
if (typeof mapCache !== 'undefined') for (const k in mapCache) delete mapCache[k];
// random encounters can be a 強化魔物 too (the first monster of the group)
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    const st = this.st; if (cfg && cfg.kind === 'wild' && !cfg.roam12 && !cfg.champ12 && !cfg.wxMon && !cfg.id && typeof CHAMP_KEYS12 !== 'undefined' && st && st.lv >= PACE14.champLv && !(SPECIES[cfg.sp] || {}).rare && chance(PACE14.champ)) cfg = { ...cfg, champ12: pick(CHAMP_KEYS12) };
    return yield* _bs.call(this, cfg, ...a); }; }
// wild battles: EXP ×1.2 (there are a quarter fewer of them)
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const cfg = this.cfg || {};
    if (cfg.kind !== 'wild' || this.paced14) return yield* _ge.call(this, a); this.paced14 = 1; return yield* _ge.call(this, Math.max(1, Math.floor(a * PACE14.exp))); }; }
ACHIEVEMENTS.push({ id: 'champ_30', n: '強化魔物獵人', d: '打倒 30 隻強化魔物。', cat: '戰鬥', ok: st => (st.champ12N || 0) >= 30 });
if (typeof GROW12 !== 'undefined') GROW12.push(['強化魔物', '強化魔物（名字前面有詞綴、身上發光）隨機遇敵也會出現，獎勵加倍。']);
