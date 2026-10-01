/* ===================== v19 TACTICS: difficulty, break shields, smarter monster AI, phases, pressure effects =====================
   Player feedback: monster skills had no weight, some fights could be won with a fixed formula.
   - Break: elites / bosses / rares carry shield points. Weakness hits and critical hits chip them; at 0 the monster is BROKEN:
     it loses its next action (and a charged attack is cancelled) and takes more damage until the end of the next turn.
   - AI: killer instinct, reads a defending hero (uses the turn to buff / charge instead), dispels hero buffs, re-applies cured
     ailments, personality per species, HP phases for elites and bosses, frenzy (extra action every other turn) at the last phase.
   - Pressure: red name banner + screen dim before strong monster skills, hit-stop, shake and red flash scaled by damage taken,
     big damage numbers, a countdown + danger ring while a monster is charging. */
const DIFF = [
  { n: '普通', d: '標準的冒險。', hp: 1, pow: 1, brk: 0, ai: 0, drop: 0 },
  { n: '困難', d: '魔物HP+20%、攻擊+15%，更聰明、護盾+1。掉落品質稍微提升。', hp: 1.2, pow: 1.15, brk: 1, ai: 1, drop: 0.5 },
  { n: '異界', d: '魔物HP+40%、攻擊+30%，最聰明、護盾+1。掉落品質提升。', hp: 1.4, pow: 1.3, brk: 1, ai: 2, drop: 1 },
];
const diffOf = (st = Game.st) => DIFF[(st && st.diff) || 0];
const ngOf = (st = Game.st) => (st && st.ng) || 0;
const NG_LV = 8; // New Game+: monsters +8 Lv per cycle
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) {
    const ng = ngOf(), D = diffOf(); const f = _mf(sp, lv + ng * NG_LV, kind), s = f.stats;
    const kh = D.hp * (1 + 0.25 * ng), kp = D.pow * (1 + 0.1 * ng);
    if (kh !== 1) { s.hp = Math.round(s.hp * kh); f.hp = f.maxhp = s.hp; } if (kp !== 1) for (const k of ['atk', 'spa']) s[k] = Math.round(s[k] * kp);
    return f;
  };
}

/* ---------- AI personalities: brute (damage first) / trick (ailments, debuffs) / guard (buffs, heals, counters) ---------- */
const AI_PROFILE = { mush: 'trick', thornMush: 'trick', flower: 'trick', bee: 'trick', caveSpider: 'trick', duskMoth: 'trick', ghostLamp: 'trick', wraith: 'trick', frog: 'trick', moonSprite: 'trick', voidEye: 'trick',
  pebble: 'guard', mossGiant: 'guard', croc: 'guard', thunderBeetle: 'guard', slime: 'guard', reedCrab: 'guard', riftKnight: 'guard', boneKnight: 'guard', crystalGolem: 'guard' };
const aiProfile = F => AI_PROFILE[F.sp] || (HD_RIG_OF && HD_RIG_OF[F.sp] && AI_PROFILE[HD_RIG_OF[F.sp]]) || 'brute';

/* ---------- a monster-only move for smart foes: wipe the hero's buffs ---------- */
MOVES.m_dominate = { n: '威壓', t: '一般', cat: '變', pp: 10, dispel: 1, cls: 'debuff', fx: 'm_dominate', foe: 1, d: '散發壓倒性的氣勢，消除對手所有的能力提升。' };
if (MON_CLASS.debuff && !MON_CLASS.debuff.includes('m_dominate')) MON_CLASS.debuff.push('m_dominate');
MFX.m_dominate = function* (U, T, u) {
  Sound.sfx('quake'); this.shake = 16;
  for (let i = 0; i < 3; i++) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 10, r1: 70, c: '#801028', life: 18 }); mSpawn(this, 'mjag', { x: T.x, y: T.y, r0: 30, r1: 6, c: '#ff4060', life: 14 }); yield* wait(7); }
  yield* wait(10);
};

/* ---------- break shields ---------- */


/* ---------- telegraph before monster skills ---------- */

// extra signature moves unlocked at phase 1 (bosses / elites without a scripted fight)
const PHASE_MOVES = { wolf: 'm_rend', croc: 'm_tailSlam', flower: 'm_thornRain', mossGiant: 'm_rootCrush', boneKnight: 'm_darkSlash' };

/* ---------- AI ---------- */

/* ---------- timers, frenzy flag, break recovery ---------- */

/* ---------- drawing: shields / weakness on the nameplate, charge countdown, banner, dim, damage numbers ---------- */
function drawShieldBadge(x, X, Y, n, broken, flash) {
  const c = broken ? '#ff5a5a' : flash ? '#ffffff' : '#9ab8e8';
  x.fillStyle = '#10141f'; x.fillRect(X, Y, 13, 14); x.fillRect(X + 1, Y + 14, 11, 1); x.fillRect(X + 3, Y + 15, 7, 1);
  x.fillStyle = c; x.fillRect(X + 1, Y + 1, 11, 11); x.fillRect(X + 2, Y + 12, 9, 1); x.fillRect(X + 4, Y + 13, 5, 1);
  x.fillStyle = broken ? '#5a1018' : '#2a3a5a'; x.fillRect(X + 2, Y + 2, 9, 9); x.fillRect(X + 3, Y + 11, 7, 1);
  Font.drawC(x, broken ? '×' : String(n), X + 7, Y - 1, broken ? '#ffd0d0' : '#ffffff', '#000000', 9);
}

/* ---------- v19 gear specials (04n) + class passives (04o) in battle ---------- */
