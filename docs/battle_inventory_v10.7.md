# Battle mechanics inventory (v10.7.3, before the engine rewrite)

Collected from src/ so nothing is lost when the battle engine is rebuilt to the core spec (docs/spec_*.txt).
File:line references are as of commit c6920cf.

## 0. Structural notes
- Battle.prototype.main (07_battle:183) is not wrapped; the loop does `for (let [who,a] of order)`.
- 07h replaces drawBoxF/drawBoxH/intro/chooseAction wholesale; chooseMove chain 07_:243 → 07h:64 → 09l:242 → 09zp:169, outer 08p:83.
- order() is a generator-iterable (09zz_v10h_turns) that sets _phase/_acted.
- Globals reassigned by later files: heroStats, skillMove, skillMP, hitChance, critRate, makeFoe, talentSum/applyTalents/tcPicked/tpSpent, wsList/learnedSkills, giveReward, lootHint, Overworld.prototype.battleScript (06:238; 08j, 09c, 09zm, 09zs, 09zt, 09zv), talentScreen.
- The hero battler's hp/mp/status are getters/setters on Game.st (07_:87).
- 08o:141 estimateDamage temporarily replaces Math.random and calls calcDamage on the live battle (UI preview).
- Foe moves with `hits` (m_swarm) are ignored: extraHits only runs for the hero (07_:325).

## 1. Flow
- Constructor 07_:83-100: cfg, kind (wild/elite/boss), F (makeFoe), H {hero,n,lv,stats,maxhp,moves,stages,wet,sleepT}, bg, sprites, disp, fx, turn, phase2, fistCD, bb (bandit boss steal), cg (crystal golem mirror).
- main 07_:183-217: intro → loop { turn++; chooseAction; foeChoose; order; defending; actions: move / defend (+12% maxMP, guardHeal) / item / mirror / steal / foeHeal / flee / run; death checks after each action } → frenzy second foe action every other turn → endTurn.
- order 07_:256: run 7 > item 6 > defend 5 > move prio; foe 'swift' +0.5; fx.first on turn 1; speed (effSpe); tie 50%.
- foeChoose 07_:263-283 + tacAI 07j:163-177 (AI_PROFILE, smart) + 09zr FAM_TECH/FOE_NEW: flee, bandit axeSpin/steal, crystal golem mirror/pool, healer, golem phase 2 + fist, weighted pool.
- useMove 07_:295-377; statChange 378 (±3, timed); inflict 389 (IMMUNE 07_:9); endTurn 395-413; bossPhase2 414 (07j checkPhase/PHASE_MOVES/telegraph); tryRun 420; useItemAct 426; foeFaint 440; heroFaint 447; victory 452; gainExp 466 (levelUp 478, learnMove 492); end 511.
- Allies 09zh (Glen / Lia lines, allyUp/allyMore).
- Break 07j: brkMax boss 5 / elite 3 / rare 2 (+DIFF, ng, rematch); weakness/crit chip; broken = 2 turns, no action, dmg ×1.25 boss / ×1.35 other; breaker 35%; shieldChip 07o:31.
- battleScript 06:238-250 (music, transition, lose → whiteout 06:255, homeWarp); packScript 06:211; eliteTalk 06:230.

## 2. Wrapper chains
- useMove: 07j, 07o (timed buffs, shieldChip, statusRes), 07v (mpSave, spells), 07w (class-tree conditions, aura), 07k (multi-hit), 07s (heavy-hit tutorial), 09l (weapon specials wc), 09ze (combo, resonance, sig), 09zk (T9), 09zq (sigAfter, sigTwice, sigSt), 09zo (orb after-effects), 09zp (enchant procs), 09zv (weather), 09zz_v10f (block), 09zz_v10g (sgp), 09zz_v10h (phase).
- calcDamage order: base → 07j (break, SPECIALS) → 07o → 07v → 07w → 07s → 08o (SKILL_SCALE) → 09l → 09ze → 09zk → 09zq → 09zp → 09zv → 09e → 09zz_v10f (block).
- victory (inner → outer): base 07_:452; 09n:66 mats; 09zo:209 orb; 09zp:22 enchant stone; 09zv:90 weather stone; 09zb:28 gold V81_GOLD; 08h:49 dex milestones; 08j:89 area events; 09zz_v10f:102 elite rematch flag; 09zk:115 winHeal (before base).
- gainExp: 08j:88 area mult; 09zz_v10f:104 repeat elite ×0.3. lootShow: 07u:17, 09n:56, 09y:92.

## 3. Statuses and battler fields
- status psn/brn/par/slp (one at a time; slp 1–3 turns, hero sleepT persists); brn halves physical attack; sources: move eff, weapon special 60%, poisonEdge, sigSt, orb codes, enchant, venomous; statusRes; aura counter.
- Fields: stages ±3 (25%/step, timed), wet, tangle, shield (×0.6), defending (×0.5), flinched, charging, broken, brk/brkMax, phase/frenzy, enchT, critNext, wc, sgp, combo, chi, turret, heals, mirror, steals, fistCD, aura, smoke/rage/mark timers, clones; transient flags _lastHit, _sigTwice, _estimating, _eliteAgain, _phase, _acted, _shieldHold.

## 4. Damage
- Base 07_:284: crit (critRate, ×1.5), stages (crit ignores bad ones), pierce, brn, floor(floor(floor(2*lv/5+2)*pow*A/D)/50)+2, famMult 1.5/0.6, rnd 85–100%, FOE_POWER 1.15, HERO_POWER 1.45, elem/fireUp/boltUp/rage/arcaneSurge/lastStand/vs[fam]/resist. hitChance acc+hit−eva clamp 5..100.
- After calc in useMove: shield ×0.6, defend ×0.5, combo, steam ×1.3, crystal golem, mirror reflect.
- Talent keys: dmgUp actUp spcUp atkUp subUp critDmg crit eva hit weakUp bigUp pierceT drain mpRegen mpSave magCrit elemRes statusRes guardPlus counter rage venomous assassin shadowStep spellblade endureT shieldChip healUp chargeCut combo* specStart openShield winHeal allyUp allyMore atkMp fireUp boltUp type:* kind:*; fx first regen double thorns guardHeal lastStand freeCast stormMark arcaneSurge fervor pierce wisdom fortune cleave predator breaker poisonEdge swift manaSiphon deathWard mpGuard endure spellblade; sig* keys (09zq).
- Sources: 09m, 09zk, 09zq, 07w, 09ze, 09l, 09zo (ORB_A/ORB_P/SIG), 09zp, 09zb/09zi, 04h.

## 5. Resources
HP, MP (defend +12%, regen, mpSave), 招式點 sgp (max 5, cost 3), 特技 wc (layers by basic hits), combo (max 3), chi (max 5), turret, brk, frenzy/phase.

## 6. Enemies
makeFoe 07_:23 (+07j DIFF/ng, 09zr, 09a/09e ch2, 07m, 09zt roaming, 09zv weather monsters 25%); AI foeChoose + tacAI; scripted m_* moves (axeSpin, rockfall, quake, boulder, prismRay, crystalSpark, swarm…); MFX 09d; bosses golem, banditBoss, crystalGolem, boneKnight, silverWyrm, gatekeeper, youngDragon, rift bosses, mimic; elites 08e (respawn 250 steps, rematch Lv+3).

## 7. Rewards
wins/dex; bandit refund; exp (×1.5 elite/boss, wisdom, pack, expScale, area, rainbow, repeat elite ×0.3); gold (boss 1000, V81_GOLD, fortune, area, pack); materials (50% + 35%, elite/boss extras); gear (first kill blueprint + ticket, LOOT_Q rolls, rematch 35%, wild 8/16%); orbs (elite 30% / boss 45%); enchant stones (boss always 上級, elite 40%, wild 5%, weather 20%); dex milestones; achievements polled in overworld.

## 8. Randomness
All Math.random/chance/rnd/pick sites listed in the agent report (07_, 07j, 07o, 07v, 07w, 07k, 09l, 09zq, 09zo, 09zp, 09zh, 09zv, 09zz_v10f, 04n, 06, 08o). Route all through one seedable RNG.

## 9. UI coupling
Battle draws its own UI (07h boxes and commands, msg TextBox, animHP, learnMove window, lootShow, 07j pops/telegraph, 07i art, 09zv overlay, tutorials). Menus that read/write battle data: useItem, loadout, chooseMove chain, estimateDamage, talent/skill screens. Battle writes Game.st directly.
