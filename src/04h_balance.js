/* ===================== BALANCE: global difficulty knobs (tune with tools/balance.js) ===================== */
// Monster toughness/power by rank (applied on top of MON_PANEL in makeFoe). Rares keep their own panel.
const BALANCE = {
  exp: 0.5,                 // global exp multiplier
  expOver: 0.3,             // −30% exp per level the hero is ABOVE the monster (min 10%)
  expUnder: 0.1,            // +10% exp per level the hero is BELOW the monster (max +50%)
  hp: { wild: 1.35, elite: 1.6, boss: 2.0, rare: 1 },
  pow: { wild: 1.25, elite: 1.22, boss: 1.2, rare: 1 },
  def: { wild: 1.1, elite: 1.15, boss: 1.1, rare: 1 },
  // level curve: gear/class/talents make the hero grow faster than a monster's panel scaling,
  // so monsters above Lv8 gain extra HP/defence and a little extra power per level
  curveFrom: 8, curveHP: 0.06, curveDef: 0.03, curvePow: 0.012,
};
const lvCurve = (lv, k) => 1 + Math.max(0, lv - BALANCE.curveFrom) * BALANCE[k];
function expScale(heroLv, foeLv) { const d = heroLv - foeLv; const m = d <= 0 ? 1 + Math.min(0.5, -d * BALANCE.expUnder) : Math.max(0.1, 1 - d * BALANCE.expOver); return m * BALANCE.exp; }

/* ---- area level table (the one place to move difficulty bands) ---- */
// shift every wild row of a map by N levels; elites/bosses/rares are set explicitly
const AREA_LV_SHIFT = { route: 1, forest: 2, mine: 2, ruins: 2, sewer: 2, catacomb: 2 };
for (const id in AREA_LV_SHIFT) for (const e of MAPS[id].encounters || []) for (const r of e.table) { r[1] += AREA_LV_SHIFT[id]; r[2] += AREA_LV_SHIFT[id]; }
const ELITE_LV = { wolf: 9, flower: 12, croc: 13, mossGiant: 14, thug1: 15, thug2: 14, boneKnight: 23 };
for (const id in MAPS) for (const e of MAPS[id].elites || []) if (ELITE_LV[e.id]) e.lv = ELITE_LV[e.id];
MAPS.ruins.boss.lv = 15; MAPS.mine.boss.lv = 16; MAPS.sewer.boss.lv = 19;
const RARE_LV = { route: [5, 9], forest: [11, 13], mine: [13, 15], sewer: [16, 18], ruins: [14, 16], catacomb: [20, 22] };
for (const id in RARE_LV) if (MAPS[id].rare) { MAPS[id].rare[1] = RARE_LV[id][0]; MAPS[id].rare[2] = RARE_LV[id][1]; }
const CARAVAN_FIGHTS = [['fox', 11], ['bee', 11], ['wolf', 10]];
// per-monster touch-ups found by the simulator
Object.assign(MON_PANEL.crystalGolem, { hp: 100 }); Object.assign(MON_PANEL.croc, { hp: 40, atk: 20, def: 19 }); Object.assign(MON_PANEL.boneKnight, { hp: 50, atk: 30 });
Object.assign(MON_PANEL.mineBat, { hp: 40 }); Object.assign(MON_PANEL.bandit, { hp: 46, def: 19 }); Object.assign(MON_PANEL.caveSpider, { hp: 40 }); Object.assign(MON_PANEL.wraith, { spa: 29 });
Object.assign(MON_PANEL.banditBoss, { hp: 80 }); Object.assign(MON_PANEL.mossGiant, { hp: 42 }); MOVES.m_axeSpin.pow = 100;
// rares: tough skin but not hopeless — a matched-level player needs about 3 hits before they flee
Object.assign(MON_PANEL.goldSlime, { def: 14, spd: 14 }); Object.assign(MON_PANEL.gemSlime, { def: 28, spd: 28 }); Object.assign(MON_PANEL.goldSkeleton, { def: 26, spd: 26 }); Object.assign(MON_PANEL.paleWraith, { def: 30, spd: 30 });
BALANCE.gangKnife = 0.045;
Object.assign(MON_PANEL.golem, { hp: 90 }); // v19: shorter story-boss fight (break + AI make it tougher already) // bandit henchmen knives: % of hero max HP per turn
