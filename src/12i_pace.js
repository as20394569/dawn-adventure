/* ===================== v12.79 戰鬥 C：野外戰少一點、精一點 =====================
   · 一般遇敵機率 ×0.75，野外經驗值 +20%（每走一步拿到的經驗差不多，戰鬥少四分之一）
   · 強化魔物（v12.0.8b）原本只在地圖上看得見的魔物身上（4%），現在隨機遇敵也會出現：Lv8 以後 6%
   · 戰鬥評價（野外）：S＝回合數 ≤ 魔物數＋1 且受傷 ≤ 最大 HP 20%（經驗 +30%）・A＝回合數 ≤ 魔物數×2＋1 且受傷 ≤ 50%（+15%）・B 沒有加成；
     連續 S 每次再 +5%（最多 +25%），A 以下歸零。成就：完美戰鬥（連續 10 次 S）・強化魔物獵人（打倒 30 隻） */
const PACE14 = { enc: 0.75, exp: 1.2, champ: 0.06, champLv: 8, S: 0.3, A: 0.15, streak: 0.05, streakMax: 0.25 };
for (const id in MAPS) for (const e of MAPS[id].encounters || []) if (e && typeof e.rate === 'number' && !e.pace14) { e.rate = Math.round(e.rate * PACE14.enc * 1000) / 1000; e.pace14 = 1; }
if (typeof mapCache !== 'undefined') for (const k in mapCache) delete mapCache[k];
// random encounters can be a 強化魔物 too (the first monster of the group)
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    const st = this.st; if (cfg && cfg.kind === 'wild' && !cfg.roam12 && !cfg.champ12 && !cfg.wxMon && !cfg.id && typeof CHAMP_KEYS12 !== 'undefined' && st && st.lv >= PACE14.champLv && !(SPECIES[cfg.sp] || {}).rare && chance(PACE14.champ)) cfg = { ...cfg, champ12: pick(CHAMP_KEYS12) };
    return yield* _bs.call(this, cfg, ...a); }; }
// the rating (wild battles only), shown just before the EXP
function rate14(b) { const core = b.core, H = core && core.byId.H; if (!H) return null; const foes = core.units.filter(u => u.side === 'B' && !u.minion).length || 1, R = core.round || 1;
  const taken = core.log.filter(e => e.type === EVT.DAMAGE && !e.cancelled && e.tgts[0] === H.id).reduce((s, e) => s + (e.payload.amount || 0), 0), pct = taken / Math.max(1, H.max.hp);
  const g = R <= foes + 1 && pct <= 0.2 ? 'S' : R <= foes * 2 + 1 && pct <= 0.5 ? 'A' : 'B'; return { g, R, pct }; }
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const st = Game.st, cfg = this.cfg || {};
    if (cfg.kind !== 'wild' || this.rated14 || !st) return yield* _ge.call(this, a); this.rated14 = 1; const r = rate14(this); if (!r) return yield* _ge.call(this, a);
    let bonus = 0; if (r.g === 'S') { st.rateStreak14 = (st.rateStreak14 || 0) + 1; bonus = PACE14.S + Math.min(PACE14.streakMax, PACE14.streak * (st.rateStreak14 - 1)); } else { st.rateStreak14 = 0; if (r.g === 'A') bonus = PACE14.A; }
    st.rateBest14 = Math.max(st.rateBest14 || 0, st.rateStreak14 || 0); this.rate14 = r;
    yield* this.msg('評價 ' + r.g + '（' + r.R + ' 回合・受傷 ' + Math.round(r.pct * 100) + '%）' + (bonus ? '：經驗值 +' + Math.round(bonus * 100) + '%' : '') + (r.g === 'S' && st.rateStreak14 > 1 ? '（連續 S ×' + st.rateStreak14 + '）' : ''), { hold: 40 });
    return yield* _ge.call(this, Math.max(1, Math.floor(a * PACE14.exp * (1 + bonus)))); }; }
ACHIEVEMENTS.push({ id: 'rate_s10', n: '完美戰鬥', d: '野外戰鬥連續 10 次拿到評價 S。', cat: '戰鬥', ok: st => (st.rateBest14 || 0) >= 10 },
  { id: 'champ_30', n: '強化魔物獵人', d: '打倒 30 隻強化魔物。', cat: '戰鬥', ok: st => (st.champ12N || 0) >= 30 });
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(q => q[0] === '魔物的下一步'); if (P) P[1].push('野外戰鬥的評價：S＝回合數不超過魔物數＋1、受傷不到 20%（經驗 +30%，連續 S 再加）；A＝回合數不超過魔物數×2＋1、受傷不到 50%（+15%）。'); }
if (typeof GROW12 !== 'undefined') GROW12.push(['戰鬥評價', '野外戰鬥打完會給評價：打得快又沒怎麼受傷是 S（經驗 +30%，連續 S 每次再 +5%，最多 +25%），A 是 +15%。強化魔物（名字前面有詞綴、身上發光）隨機遇敵也會出現，獎勵加倍。']);
