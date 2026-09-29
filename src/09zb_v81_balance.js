/* ===================== v8.1 balance pass: fit the old content to the v7 / v7.1 hero =====================
   Player request: "adjust the monsters, gear and talents to fit the v7.1 / v8 changes".
   Measured with tools/v120.js (4 classes, crafted tier gear 紫+2, talents spent, auto attributes):
   chapter 1 was fine, but from 銀月湖畔 on the monsters were tuned for the old (v6) hero — chapter-2 bosses took
   20–80 turns to kill while killing the hero in 3–4 hits. Two fixes:
   1) gear — every weapon's strongest active reaches a power floor that rises with the tier, so a new tier is
      always an upgrade (e.g. 齒輪魔杖, 黃銅發條劍 and 霜嶺長槍 were weaker than the tier before);
   2) monsters — per-species HP / attack multipliers (table below) bring every wild monster, elite and boss to the
      same feel as chapter 1: wild ≈ 2–3 turns, elite ≈ 6 turns, boss ≈ 11 turns (final bosses a little more),
      and the hero survives ≈ 8 / 5.5 / 5 of their hits. */

/* ---------- 1) weapon skill power floor per tier ---------- */
const WPOW_FLOOR = t => Math.round(0.9 * (70 + 15 * (t - 1)));
for (const k in WSK) { const G = GEAR[k]; if (!G || !G.t) continue; let best = 0, bid = null;
  for (const id of WSK[k].a) { const m = MOVES[id]; if (!m || !m.pow) continue; const v = m.pow * (m.hits || 1); if (v > best) { best = v; bid = id; } }
  const tgt = WPOW_FLOOR(G.t); if (bid && best < tgt - 4) MOVES[bid].pow = Math.ceil(tgt / (MOVES[bid].hits || 1)); }

/* ---------- 2) monster multipliers [HP, attack] (v8.1, from tools/v120.js; chapter-1 content (below Lv17) is only ever made easier) ---------- */
const V81_MON = {"rockRhino":[0.71,1.0],"duneWorm":[0.57,1.0],"golem":[1.0,1.25],"reedCrab":[0.62,1.0],"mudSlime":[1.0,1.3],"bogToad":[0.68,1.0],"rotTreant":[0.68,1.0],"bogWitch":[1.0,0.73],"hydra":[0.2,0.82],"boneHound":[1.0,0.71],"runeGolem":[0.24,1.0],"boneKnight":[0.71,1.0],"voidEye":[1.0,0.6],"riftKnight":[0.46,0.49],"gatekeeper":[0.72,0.68],"greyWolf":[0.52,1.0],"roadBandit":[0.38,1.0],"hornBeetle":[0.3,1.0],"plainsHawk":[0.54,1.0],"blackFeather":[0.45,1.0],"sewerRat":[0.5,1.0],"sludge":[0.27,1.0],"rustSpider":[0.41,1.0],"sewerCroc":[0.24,1.0],"ratKing":[0.17,1.0],"scarecrow":[0.32,1.0],"fieldBee":[0.51,1.5],"wildBoar":[0.37,1.0],"windSprite":[0.5,0.5],"boarKing":[0.51,1.0],"harvestGolem":[0.16,1.0],"clockSoldier":[0.41,1.0],"gearSprite":[0.54,1.0],"towerBat":[0.64,1.0],"hollowArmor":[0.3,1.0],"clockKnight":[0.52,1.0],"clockColossus":[0.2,0.8],"snowWolf":[0.51,1.0],"frostSprite":[0.51,0.56],"yeti":[0.26,1.0],"iceOwl":[0.5,1.0],"snowBear":[0.38,1.0],"iceBat":[0.51,1.0],"frostSlime":[0.3,1.0],"iceGolem":[0.23,1.0],"frostWraith":[0.47,0.69],"frostLich":[0.57,0.65],"frostQueen":[0.24,0.66],"magmaSlime":[1.0,1.48],"volcanoHawk":[1.5,1.0],"youngDragon":[1.43,0.8],"magmaGolem":[1.0,0.68],"hellHound":[1.5,1.0],"lavaGiant":[0.59,0.72],"duskKnight":[1.0,0.53],"shadowMage":[1.0,0.46],"sentinel":[0.54,1.0],"voidHound":[1.0,0.74],"nightmare":[1.0,0.55],"duskCaptain":[1.36,0.62],"victorDemon":[0.57,0.74],"shadowGeneral":[0.51,0.62],"starSpirit":[1.0,0.45],"angelStatue":[0.49,0.71],"cometBird":[1.0,0.7],"abyssEye":[1.0,0.41],"starGuardian":[0.43,0.72]};
for (const sp in V81_MON) { const P = MON_PANEL[sp]; if (!P) continue; const [h, a] = V81_MON[sp];
  P.hp = Math.max(1, Math.round(P.hp * h)); if (a !== 1) { P.atk = Math.max(1, Math.round(P.atk * a)); P.spa = Math.max(1, Math.round(P.spa * a)); } }
// 熔岩巨人: 大噴發 burned the hero half the time, and burn halves physical attack — physical classes lost 4/4 in the probe
MOVES.m_eruption.eff = { st: 'brn', p: 30 };

/* ---------- 3) money: chapter-2 monsters paid 2–3.5× an inn night per battle, so gold stopped mattering again ----------
   Wild / elite gold now tapers from Lv18 (×0.965 per level, at least ×0.4): about 1.2–1.5 inn nights per battle. */
const V81_GOLD = lv => lv < 18 ? 1 : Math.max(0.4, 1 - (lv - 18) * 0.035);
{ const _vic = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const F = this.F, sp = F && SPECIES[F.sp], g0 = sp ? sp.gold : 0, m = F && !F.boss ? V81_GOLD(F.lv) : 1;
    if (sp && m < 1) sp.gold = g0 * m;
    try { return yield* _vic.call(this); } finally { if (sp) sp.gold = g0; }
  };
}
