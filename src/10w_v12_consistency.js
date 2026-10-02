/* ===================== v12.0.1 技能名稱・說明・特效一致（玩家：「技能名稱敘述 特效盡量保持一致」） =====================
   A full pass over every hero skill (40 class skills, 10 signature skills, 134 weapon skills):
   1) the generic cast + finisher played around each skill's own effect now follows the skill. v12's ids (o_, sig_, u_) had lost
      the per-skill styles of their templates, so every physical skill ended with the same white slash line (also on punches,
      shield rams, thrusts and shots). Class / signature skills get their template's style back; weapon skills, whose own
      effect already has its impact, get a cast that fits the weapon (blade gleam, chi, rune, none for guns) and no finisher.
   2) names, descriptions and effects that disagreed are aligned (the list is in the design log).
   3) a few effects that did not show what the name says get their own: 裂風斬, 烈焰漩渦, 怒濤, 雷神槌, 墮星突, 潮鳴突. */
CASTS.none = () => 0;
// ---------- 1) cast + finisher ----------
const O12_STYLE = {
  o_flameVortex: ['aura', 'firestorm', 'fire', 'fire'], o_tidalRage: ['rune', 'splash', 'water', 'water'], o_thorHammer: ['sky', 'none', 'volt', null],
  o_galeCut: ['dash', 'gust', 'wind', 'wind'], sig_ranger: ['dash', 'none', 'shadow', 'slash'], sig_dragoon: ['none', 'none', 'steel', null],
};
for (const id in DEF.skills) if (/^(o_|sig_)/.test(id)) { const tpl = DEF.skills[id].metadata && DEF.skills[id].metadata.tpl; const st = O12_STYLE[id] || SKILL_STYLE[tpl]; if (st) SKILL_STYLE[id] = st; }
for (const id in DEF.skills) if (id.startsWith('u_')) {
  const k = id.slice(2), G = GEAR[k], D = DEF.skills[id]; if (!G) continue;
  let pal = ELEM_PAL[D.el] || 'steel'; if (W12[k] && typeof w12Spec === 'function') { const S = w12Spec(k); PAL['w12_' + k] = [S.col[0], S.col[1]]; pal = 'w12_' + k; }
  const cast = G.kind === '拳套' ? 'focus' : G.kind === '火槍' ? 'none' : (D.cat !== '物' || ['法杖', '魔導書', '樂器'].includes(G.kind)) ? 'rune' : 'draw';
  SKILL_STYLE[id] = [cast, D.power ? 'none' : null, pal, null];
}
// ---------- 2) names and descriptions ----------
{ const set = (id, d, n) => { const D = DEF.skills[id], M = MOVES[id]; if (!D) return bvErr('v12', 'consistency: no skill ' + id); if (d) { D.desc = d; if (M) M.d = d; } if (n) { D.name = n; if (M) M.n = n; } };
  // class skills
  set('o_galeCut', '搶先衝上前斬出一道裂風，削減護盾。');
  set('o_thornBind', '纏著荊棘的草屬性斬擊，容易會心。', '荊棘斬'); // the name said 縛 but it never bound anything
  set('o_bolt', '落雷攻擊全體，10%麻痺。');
  set('o_fireShot', '火屬性魔法彈，20%灼傷。');
  set('o_rockBreak', '砸碎盔甲：削減護盾，對手物防−1。');
  set('o_bloodMoon', '血色的一斬，回復造成傷害 30% 的 HP。');
  set('o_steelCleaver', '能斬斷鋼鐵的一刀。對破防的對手威力 ×1.5。');
  set('o_allOut', '捨身的一劈，威力極大，但自己也會受到反傷。');
  set('o_bladeRain', '4 段連續斬擊。'); // it said 2～5 段; it is always 4
  set('o_cloudPierce', '穿雲般的突刺，無視 40% 物防。');
  set('o_assassinMark', '瞄準要害的一擊。對 HP 低於 30% 的對手威力 ×2.2。');
  set('o_flameVortex', '捲起火焰漩渦攻擊全體，20%灼傷。');
  set('o_starfall', '召喚隕石攻擊全體，20%灼傷。');
  set('o_tidalRage', '掀起滔天大浪攻擊全體。');
  set('o_chainLightning', '在對手之間跳躍的閃電，攻擊全體，20%麻痺。');
  set('o_thorHammer', '從天而降的雷槌，攻擊全體，30%麻痺。');
  set('o_verdantWind', '草葉風暴攻擊全體。');
  set('o_steamCannon', '噴出高壓蒸汽，攻擊全體。');
  set('o_combustion', '引爆火焰攻擊全體；對灼傷的對手威力 ×1.8（會消耗灼傷）。');
  set('o_mend', '回復最大 HP 的 50%。');
  set('o_holyWard', '回復最大 HP 的 35%，並展開護盾。');
  // weapon skills: the first part came from the archetype and sometimes contradicted the name (時計突 said 居合斬, 星爆砲擊 said 隕石…)
  const W = { woodSword: '兩段連續打擊', riftSword: '一閃斬開空間，無視部分物防', harvestScythe: '鐮刀迴旋一圈，攻擊全體', chronoLance: '搶先的突刺，容易會心',
    wyrmFang: '閃身突刺，容易會心', iceDagger: '閃身突刺，容易會心', riftDagger: '撕開空間突刺，容易會心', duneFang: '閃身突刺，容易會心', stingerDagger: '連續刺擊', wolfFang2: '連續撕咬',
    crescentAxe: '新月般的迴旋斬，攻擊全體', hatchet: '劈開盔甲，降低物防，削減護盾', rockAxe: '劈開盔甲，降低物防，削減護盾', chiFist: '放出氣功波', tigerClaw: '連續爪擊',
    starFist: '兩段流星般的重拳，穿透部分物防', forestHarp: '草木和弦的音波攻擊全體', iceHarp: '冰冷的琴音攻擊全體', corkGun: '連射兩發軟木塞', brassPistol: '兩段射擊',
    steamRifle: '噴出蒸汽彈，攻擊全體', gearRepeater: '連續射擊', boltCannon: '雷管砲彈在敵陣炸開，攻擊全體，30%麻痺', frostMusket: '霜火彈在敵陣炸開，攻擊全體',
    starBlaster: '星爆砲彈攻擊全體，20%灼傷', thornStaff: '荊棘纏住對手，容易會心', tideStaff: '水之魔法彈', dawnStaff: '捲起晨曦光炎攻擊全體，20%灼傷', fangWand: '帶著狼嚎的魔力彈',
    deathTome: '吸取靈魂的魔力彈', hydraStaff: '蛇毒魔力彈', witchTome: '毒霧籠罩全體', sandTome: '沙暴席捲全體' };
  for (const k in W) { const id = 'u_' + k, D = DEF.skills[id]; if (!D || !W12[k]) { bvErr('v12', 'consistency: no weapon skill ' + k); continue; } const a = W12_ARCH_D[W12[k][1]];
    if (!a || !D.desc.includes(a)) { bvErr('v12', 'consistency: ' + k + ' text'); continue; } set(id, D.desc.replace(a, W[k])); }
  // the ten boss weapons: say every effect they have
  set('u_quakeAxe', '劈開地面的重擊：削減護盾，50%讓對手退縮，對手物防−1。');
  set('u_tideRapier', '搶先的突刺，削減護盾，讓對手潮濕。');
  set('u_wolfTwin', '亂舞般的 5 段連續斬擊，30%中毒。');
  set('u_coreStaff', '熔核在敵陣連爆，攻擊全體；對灼傷的對手威力大增（會消耗灼傷），30%灼傷。');
  set('u_fallenLance', '如流星墜落般的突刺，會心率加倍。');
  set('u_frostTome', '冰霜之花在敵陣綻放，攻擊全體，對手速度−1。');
  set('u_gearRifle', '連續發射 5 發的彈幕；特技累積+1層。');
  set('u_boneGreatsword', '龍骨巨劍的重斬，回復造成傷害 20% 的 HP。');
}
// ---------- 3) effects that now show what the name says ----------
HERO_PK.hammer = (x, p, a) => { x.globalAlpha = Math.min(1, a * 1.6); x.save(); x.translate(p.x, p.y); x.rotate(p.rot || 0); const c = p.c || '#fff070';
  x.fillStyle = '#10121e'; x.fillRect(-3, -2, 6, 24); x.fillRect(-14, -16, 28, 16); x.fillStyle = '#8a6a3a'; x.fillRect(-2, -1, 4, 22);
  x.fillStyle = c; x.fillRect(-13, -15, 26, 14); x.fillStyle = '#ffffff'; x.fillRect(-13, -15, 26, 3); x.fillStyle = 'rgba(16,18,30,0.35)'; x.fillRect(-13, -5, 26, 4); x.restore(); };
Object.assign(FX, {
  // 裂風斬: dash in and cut a crescent of wind (it used to be a thrust)
  *o12_galeCut(U, T, u) { yield* this.lunge(u, 20, 2); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 24, ang: 0.5, c: '#f0fff8', c2: '#9ae8c0', w: 6, life: 14 });
    for (let i = 0; i < 3; i++) this.spawn({ k: 'arc', x: T.x, y: T.y + i * 6 - 6, r: 14 + i * 6, a0: i, c: i % 2 ? '#9ae8c0' : '#f0fff8', life: 14 }); this.star(T.x + 16, T.y - 10, '#ffffff', 8); yield* wait(12); },
  // 烈焰漩渦: flames spiral in around the enemies (it used to be a row of flame pillars)
  *o12_flameVortex(U, T) { Sound.sfx('fire'); const cx = T.x, cy = T.y + 10;
    for (let i = 0; i < 28; i++) { const st = i * 0.55, R = 46 - (i % 7) * 3, p = this.spawn({ k: 'flame', x: cx, y: cy, s: rnd(3, 5), life: 20 }); p.upd = q => { const a = st + q.t * 0.28, rr = Math.max(4, R - q.t * 1.8); q.x = cx + Math.cos(a) * rr; q.y = cy + Math.sin(a) * rr * 0.45 - q.t * 0.5; }; if (i % 4 === 3) yield* wait(2); }
    this.spawn({ k: 'glow', x: cx, y: T.y, r: 36, c: '#ff8a30', life: 18 }); this.spawn({ k: 'ring', x: cx, y: cy, r0: 8, r1: 44, c: '#ffd070', w: 2, life: 14, fl: 0.45 }); yield* wait(14); },
  // 怒濤: a wave sweeps across the enemies (it used to be one geyser)
  *o12_tidalRage(U, T) { Sound.sfx('water');
    for (let k = 0; k < 3; k++) { for (let i = 0; i < 14; i++) { const h0 = 18 + Math.sin(i * 0.7 + k) * 8; this.spawn({ k: 'circ', x: -8 + i * 6, y: T.y + 26, vx: 4.2, vy: -h0 / 9, g: 0.22, r: rnd(2, 4), c: k % 2 ? '#e8fbff' : '#58c0f8', life: 26 }); } yield* wait(4); }
    yield* wait(6); this.shake = Math.max(this.shake, 8); this.spawn({ k: 'ring', x: T.x, y: T.y + 14, r0: 10, r1: 64, c: '#9ae0ff', w: 3, life: 16, fl: 0.4 }); yield* wait(12); },
  // 雷神槌: a hammer of lightning comes down from the sky (it used to be the holy pillar of 天罰)
  *o12_thorHammer(U, T) { Sound.sfx('charge'); this.spawn({ k: 'flash', c: '#0a0c24', a: 0.55, life: 34 });
    const hm = this.spawn({ k: 'hammer', x: T.x, y: -30, rot: -0.6, c: '#fff070', life: 22 }); hm.upd = q => { const t = Math.min(1, q.t / 9); q.y = lerp(-30, T.y - 4, t * t); q.rot = lerp(-0.6, 0.12, t); };
    yield* wait(9); Sound.sfx('thunder'); const pts = []; let x0 = T.x; for (let y = -4; y < T.y; y += 8) { pts.push([x0, y]); x0 += rnd(-6, 6); } pts.push([T.x, T.y]);
    this.spawn({ k: 'bolt', pts, w: 4, life: 12 }); this.spawn({ k: 'flash', c: '#fff8a0', a: 0.5, life: 8 }); this.spawn({ k: 'ring', x: T.x, y: T.y + 14, r0: 6, r1: 54, c: '#fff070', w: 3, life: 14, fl: 0.4 });
    this.sparks(T.x, T.y, 14, ['#fff8a0', '#ffffff'], 3, 16, 0.08); this.shake = Math.max(this.shake, 12); yield* wait(14); },
  // 墮星突: a star falls onto the target as the spear goes in (it used to draw a red bar from the spear to the monster)
  *o12_fallenStar(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'line', x1: T.x - 38, y1: T.y - 90, x2: T.x, y2: T.y, c: '#ffe68a', w: 3, grow: 6, life: 14 });
    const s = this.spawn({ k: 'star', x: T.x - 38, y: T.y - 90, c: '#ffffff', life: 12 }); s.upd = q => { const t = Math.min(1, q.t / 6); q.x = lerp(T.x - 38, T.x, t); q.y = lerp(T.y - 90, T.y, t); };
    yield* this.lunge(u, 22, 2); Sound.sfx('slash'); const a = Math.atan2(T.y - U.y, T.x - U.x), ca = Math.cos(a), sa = Math.sin(a);
    for (const [c, w] of [['#ffb040', 5], ['#fff8d0', 2]]) this.spawn({ k: 'line', x1: T.x - ca * 28, y1: T.y - sa * 28, x2: T.x + ca * 8, y2: T.y + sa * 8, c, w, grow: 2, life: 12 });
    this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30, c: '#ffe68a', w: 2, life: 12 }); this.sparks(T.x, T.y, 12, ['#ffe68a', '#ffffff'], 3, 16, 0.08); this.shake = Math.max(this.shake, 10); yield* wait(12); },
});
// 潮鳴突: the thrust is a short streak at the target, not a bar from the rapier (same problem as 鐵劍突進)
FX.tideThrust = function* (U, T, u) {
  yield* this.lunge(u, 12, 3); Sound.sfx('slash'); const a = Math.atan2(T.y - U.y, T.x - U.x), ca = Math.cos(a), sa = Math.sin(a);
  for (const [c, w] of [['#3c9cf0', 4], ['#e8f8ff', 2]]) this.spawn({ k: 'line', x1: T.x - ca * 28, y1: T.y - sa * 28, x2: T.x + ca * 6, y2: T.y + sa * 6, c, w, grow: 3, life: 10 }); yield* wait(3);
  Sound.sfx('water'); this.star(T.x, T.y, '#e8f8ff', 8);
  for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y + 4, r0: 4 + i * 4, r1: 24 + i * 8, fl: 0.45, c: i ? '#88c8ff' : '#e8f8ff', w: 2, life: 14 + i * 3 });
  for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; this.spawn({ k: 'dot', x: T.x + Math.cos(b) * 6, y: T.y + Math.sin(b) * 4, vx: Math.cos(b) * 1.8, vy: Math.sin(b) * 1.2 - 1.4, g: 0.14, s: 2, c: i % 2 ? '#58a8f8' : '#e8f8ff', life: 20 }); }
  for (let i = 0; i < 5; i++) this.spawn({ k: 'bub', x: T.x + rnd(-12, 12), y: T.y + rnd(0, 10), vy: -0.6, r: rnd(2, 3), c: '#c8ecff', life: 22 });
  yield* wait(12);
};
for (const [id, fx] of [['o_galeCut', 'o12_galeCut'], ['o_flameVortex', 'o12_flameVortex'], ['o_tidalRage', 'o12_tidalRage'], ['o_thorHammer', 'o12_thorHammer'], ['u_fallenLance', 'o12_fallenStar']]) {
  if (!DEF.skills[id]) { bvErr('v12', 'consistency fx ' + id); continue; } DEF.skills[id].fx = fx; if (MOVES[id]) MOVES[id].fx = fx; }
// 斬／刃／閃 skills draw their lines as fat white-edged blades (09r). A line that starts at the hero (the iai stance line, a dash
// trail) is not a blade: as a blade it was the white bar on the hero's weapon (player: 「部分劍技能發動時武器會有白條」).
{ const sp = Battle.prototype.spawn; Battle.prototype.spawn = function (p) { const r = sp.call(this, p);
    if (r && r.sl && r.k === 'line' && this.views && this.views.H) { const C = this.center(this.views.H); if (Math.hypot((r.x1 || 0) - C.x, (r.y1 || 0) - C.y) < 34) r.sl = 0; }
    return r; }; }

/* ---------- monster moves: descriptions say what the move does; effects that fit the name ---------- */
// a sentence for the effects a description leaves out (from the move's own data, so it cannot drift)
{ const SN = { atk: '物攻', def: '物防', spa: '魔攻', spd: '魔防', spe: '速度' }, STN = { brn: '灼傷', psn: '中毒', par: '麻痺', slp: '睡著', flinch: '退縮' };
  const STKW = { brn: /灼傷|燒傷/, psn: /中毒/, par: /麻痺/, slp: /睡|催眠/, flinch: /退縮|畏縮/ };
  const often = ch => ch == null || ch >= 1 ? '' : ch >= 0.5 ? '常常' : '有時會';
  for (const id in DEF.skills) { const D = DEF.skills[id]; if (!D.tags.includes('monster_skill')) continue; const d = D.desc || '', add = [];
    for (const ef of (D.effects || []).concat(D.after || []).map(effGet).filter(Boolean)) {
      if (ef.type === 'status' && STN[ef.status] && !STKW[ef.status].test(d)) add.push(often(ef.chance) + (ef.status === 'flinch' ? '讓對手退縮' : ef.status === 'slp' ? '讓對手睡著' : '讓對手' + STN[ef.status]));
      if (ef.type === 'stage' && ef.stats) { const self = ef.target === 'self', ks = Object.keys(ef.stats).filter(k => SN[k] && !d.includes(SN[k])); if (!ks.length) continue;
        const up = ef.stats[ks[0]] > 0, big = Math.abs(ef.stats[ks[0]]) >= 2 ? '大幅' : '', names = ks.map(k => SN[k]).join('和');
        if (!up && ks.length === 1 && ks[0] === 'spe' && /變慢/.test(d)) continue;
        add.push(self ? big + '提升' + names : often(ef.chance) + big + '降低對手的' + names); }
      if (ef.type === 'heal' && ef.ofCast && !/吸/.test(d)) add.push('吸取造成傷害的 ' + Math.round(ef.ofCast * 100) + '% HP'); }
    if (D.prio && !/先/.test(d)) add.push('必定先出手');
    if (add.length) { const s = (d && !/[。！]$/.test(d) ? d + '。' : d) + add.join('，') + '。'; D.desc = s; if (MOVES[id]) MOVES[id].d = s; } } }

// palettes for recolouring a borrowed effect (dark, mid, light)
const MX_PAL = { ice: ['#2a5a8a', '#8ad0f0', '#eaffff'], snow: ['#7a88a0', '#d8e4f0', '#ffffff'], metal: ['#4a4e58', '#9aa2b0', '#e8ecf4'], gold: ['#8a6a20', '#ffd860', '#fffbe0'],
  moon: ['#4a5a8a', '#c8d8ff', '#ffffff'], void: ['#2a1048', '#9a50e0', '#e8c8ff'], witch: ['#1a4a1a', '#60d060', '#d0ffc0'], stone: ['#4a3a2a', '#9a8a70', '#e8dcc0'], crab: ['#7a2018', '#d04a30', '#ffb090'] };
function mxRecolor(base, pal) { return function* (U, T, u, t) { const B = this, L = B.spawn;
    const map = c => { if (typeof c !== 'string' || c[0] !== '#' || c.length !== 7 || c === MOL) return c; const [r, g, b] = hex2rgb(c), l = (0.3 * r + 0.59 * g + 0.11 * b) / 255; return l < 0.33 ? pal[0] : l < 0.66 ? pal[1] : pal[2]; };
    B.spawn = function (p) { if (p) for (const f of ['c', 'c2', 'gum', 'hl']) if (p[f]) p[f] = map(p[f]); return L.call(B, p); };
    try { yield* base.call(B, U, T, u, t); } finally { delete B.spawn; } }; }
const MX = {
  *curse(U, T, u, t, mark) { Sound.sfx('poison'); mSpawn(this, 'mcurse', { x: T.x, y: T.y, r0: 30, r1: 8, c: MC.dark, c2: MC.dark2, life: 26 }); if (mark) mSpawn(this, 'mrune', { x: T.x, y: T.y - 4, s: 6, c: '#d060ff', life: 26 });
    for (const d of [-5, 5]) mSpawn(this, 'mglint', { x: U.x + d, y: U.y - 8, c: '#c060ff', life: 12 }); yield* wait(16); mRise(this, T.x, T.y + 8, 5, () => ({ k: 'mpuff', r: 3, c: '#6a3a8a' })); yield* wait(12); },
  *gaze(U, T, pal, after) { Sound.sfx('buzz'); for (const d of [-5, 5]) mSpawn(this, 'mglint', { x: U.x + d, y: U.y - 6, c: pal[2], life: 16 }); yield* wait(6);
    mSpawn(this, 'mbeam', { x1: U.x, y1: U.y - 4, x2: T.x, y2: T.y, w: 1.5, c: pal[1], c2: pal[2], grow: 6, life: 16 }); yield* wait(8); if (after) after.call(this); yield* wait(14); },
  *pincer(U, T, u, t, pal) { yield* this.lunge(u, 16, 3); Sound.sfx('hit'); for (const s of [-1, 1]) mSpawn(this, 'mgouge', { x: T.x + s * 12, y: T.y, ang: s < 0 ? 0 : Math.PI, len: 24, w: 7, c: pal[1], c2: pal[2], bend: -5 * s, grow: 4, life: 14 });
    yield* wait(6); mImpact(this, T, pal[2], 16); this.shake = 8; yield* wait(12); },
  *spearRush(U, T, u) { yield* this.lunge(u, 20, 3); const a = Math.atan2(T.y - U.y, T.x - U.x);
    for (let i = 0; i < 3; i++) { Sound.sfx('slash'); const ox = [-8, 6, 0][i], oy = [-4, 4, 0][i]; mSpawn(this, 'mgouge', { x: T.x + ox - Math.cos(a) * 6, y: T.y + oy - Math.sin(a) * 6, ang: a, len: 24, w: 4, c: MC.bone, c2: '#ffffff', bend: 1, grow: 3, life: 10 }); yield* wait(4); }
    mImpact(this, T, '#e8e0cc', 18); yield* wait(10); },
  *throwSpear(U, T) { Sound.sfx('slash'); mProj(this, U, T, () => ({ k: 'mknife', c: '#d8e8f0', vr: 0 }), 1, 0, 12); for (let i = 0; i < 6; i++) mProj(this, U, T, () => ({ k: 'mdrop', r: 1.8, c: MC.water2 }), 1, 0, 12 + i);
    yield* wait(13); Sound.sfx('water'); this.shake = 10; mImpact(this, T, MC.water2, 24); for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; mSpawn(this, 'mdrop', { x: T.x, y: T.y, vx: Math.cos(an) * 2.2, vy: Math.sin(an) * 2 - 1, g: 0.15, r: 2, c: MC.water, life: 22 }); } yield* wait(14); },
  *blink(U, T, u) { Sound.sfx('wind'); mSpawn(this, 'mpuff', { x: U.x, y: U.y, r: 8, c: '#c8c8d8', op: 0.7, life: 14 }); yield* this.lunge(u, 30, 1); Sound.sfx('slash');
    mSpawn(this, 'mgouge', { x: T.x, y: T.y, ang: 0.7, len: 38, w: 6, c: '#c8d0ff', c2: '#ffffff', grow: 2, life: 12 }); mSpawn(this, 'mpuff', { x: T.x + 10, y: T.y + 10, r: 6, c: '#c8c8d8', op: 0.6, life: 14 }); yield* wait(14); },
  *wave(U, T) { Sound.sfx('water'); for (let k = 0; k < 3; k++) { for (let i = 0; i < 12; i++) mSpawn(this, 'mdrop', { x: -6 + i * 6, y: T.y + 26, vx: 4.2, vy: -(16 + Math.sin(i + k) * 6) / 9, g: 0.2, r: 2.4, c: k % 2 ? MC.water2 : MC.water, life: 26 }); yield* wait(4); }
    yield* wait(6); mImpact(this, T, MC.water2, 30); for (let i = 0; i < 4; i++) mSpawn(this, 'mbubble', { x: T.x + rnd(-20, 20), y: T.y + rnd(0, 16), r: 3, c: MC.water, life: 20 }); this.shake = 10; yield* wait(12); },
  *featherRain(U, T) { Sound.sfx('wind'); for (let i = 0; i < 14; i++) { const X = T.x + rnd(-28, 28), ty = T.y + rnd(-8, 14), p = mSpawn(this, i % 3 ? 'mfeather' : 'mknife', { x: X, y: -10, c: '#2a2a3a', rot: 1.57, life: 16 }); p.upd = q => { q.y = lerp(-10, ty, Math.min(1, q.t / 9)); }; if (i % 3 === 2) yield* wait(2); }
    yield* wait(8); this.shake = 12; mImpact(this, T, '#8a8aa0', 26); yield* wait(12); },
  *speedUp(U, pal) { Sound.sfx('wind'); for (let i = 0; i < 6; i++) mSpawn(this, 'mpuff', { x: U.x + (i % 2 ? 14 : -14) + rnd(-3, 3), y: U.y + 20 - i * 6, r: 4, c: pal[1], op: 0.6, life: 14 + i * 2 }); yield* wait(6);
    Sound.sfx('statUp'); mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 34, r1: 10, c: pal[2], n: 12, life: 16 }); yield* wait(16); },
  *slimeCoat(U) { Sound.sfx('water'); for (let i = 0; i < 6; i++) mSpawn(this, 'mglob', { x: U.x + rnd(-16, 16), y: U.y - 10, vy: 0.6, r: 2.5, c: '#7ac0a0', life: 20 }); yield* wait(6);
    const p = mSpawn(this, 'mbubble', { x: U.x, y: U.y + 4, r: 8, c: '#7ac0a0', life: 24 }); p.upd = q => { q.r = 8 + Math.min(1, q.t / 10) * 18; }; Sound.sfx('statUp'); yield* wait(20); },
  *iceMirror(U) { Sound.sfx('statUp'); for (let i = 0; i < 6; i++) { const an = i * 1.047; mSpawn(this, 'mshard', { x: U.x + Math.cos(an) * 30, y: U.y + Math.sin(an) * 26, vx: -Math.cos(an) * 1.5, vy: -Math.sin(an) * 1.3, r: 5, c: '#bfe8ff', vr: 0, life: 18 }); }
    mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 32, r1: 12, c: '#eaffff', n: 6, life: 18 }); for (const d of [-10, 10]) mSpawn(this, 'mglint', { x: U.x + d, y: U.y - 12, c: '#ffffff', life: 14 }); yield* wait(20); },
  *starfall(U, T) { Sound.sfx('charge'); for (let i = 0; i < 7; i++) { const X = T.x + rnd(-30, 30), ty = T.y + rnd(-6, 14), p = mSpawn(this, i % 2 ? 'mglint' : 'mrock', { x: X, y: -12, r: 4, c: '#ffd860', life: 16 }); p.upd = q => { q.y = lerp(-12, ty, Math.min(1, q.t / 9)); q.x = X - (1 - Math.min(1, q.t / 9)) * 16; }; yield* wait(3); }
    yield* wait(6); Sound.sfx('quake'); this.shake = 14; mImpact(this, T, '#fff0a0', 30); mSpawn(this, 'mflash', { c: '#403000', life: 10 }); yield* wait(12); },
  *leafStorm(U, T, u, t, cols, kind) { Sound.sfx('wind'); for (let i = 0; i < 20; i++) { const st = i * 0.6, R = 44 - (i % 5) * 4, p = mSpawn(this, kind || 'mleaf', { x: T.x, y: T.y, c: cols[i % cols.length], life: 22 }); p.upd = q => { const a = st + q.t * 0.3, rr = Math.max(6, R - q.t * 1.4); q.x = T.x + Math.cos(a) * rr; q.y = T.y + 6 + Math.sin(a) * rr * 0.5; }; if (i % 5 === 4) yield* wait(2); }
    yield* wait(10); this.shake = 10; mImpact(this, T, cols[0], 28); yield* wait(12); },
  *whirlpool(U, T) { Sound.sfx('water'); for (let i = 0; i < 16; i++) { const st = i * 0.7, R = 40 - (i % 4) * 4, p = mSpawn(this, 'mbubble', { x: T.x, y: T.y, r: 2.5 + (i % 3), c: i % 2 ? MC.water : MC.water2, life: 22 }); p.upd = q => { const a = st + q.t * 0.35, rr = Math.max(4, R - q.t * 1.6); q.x = T.x + Math.cos(a) * rr; q.y = T.y + 12 + Math.sin(a) * rr * 0.4; }; if (i % 4 === 3) yield* wait(2); }
    yield* wait(10); mImpact(this, T, MC.water2, 22); yield* wait(10); },
  *frostNova(U, T) { Sound.sfx('wind'); mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 8, r1: 46, c: '#bfe8ff', n: 16, life: 16 }); yield* wait(8);
    for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; mSpawn(this, 'mshard', { x: T.x, y: T.y, vx: Math.cos(an) * 2.4, vy: Math.sin(an) * 2, r: 3.5, c: i % 2 ? '#8ad0f0' : '#eaffff', life: 18 }); }
    mRise(this, T.x, T.y + 8, 5, () => ({ k: 'mpuff', r: 4, c: '#dff4ff' })); this.shake = 8; yield* wait(16); },
  *bearHug(U, T, u) { yield* this.lunge(u, 22, 4); Sound.sfx('hitSuper'); for (const s of [-1, 1]) mSpawn(this, 'mgouge', { x: T.x + s * 14, y: T.y, ang: 1.57, len: 34, w: 8, c: '#7a5030', c2: '#c09060', bend: 8 * s, grow: 5, life: 18 });
    this.shake = 14; yield* wait(8); mImpact(this, T, '#f0d0a0', 26); yield* wait(12); },
  *steam(U, T) { Sound.sfx('water'); for (let i = 0; i < 10; i++) { mSpawn(this, 'mpuff', { x: T.x + rnd(-24, 24), y: T.y + rnd(-8, 16), vy: -0.5, r: 6 + rnd(0, 4), c: '#f0f4f8', op: 0.75, life: 24 }); if (i % 3 === 2) yield* wait(2); }
    for (let i = 0; i < 6; i++) mSpawn(this, 'mdrop', { x: T.x + rnd(-14, 14), y: T.y - 6, vy: 1, r: 1.8, c: MC.water2, life: 16 }); yield* wait(16); },
  *swarmRush(U, T, u, t, c) { Sound.sfx('buzz'); mProj(this, U, T, () => ({ k: 'mglob', r: 2, c, wob: 6 }), 14, 1, 14); yield* wait(22); Sound.sfx('hit');
    for (let i = 0; i < 3; i++) { mSpawn(this, 'mfang', { x: T.x + rnd(-12, 12), y: T.y + rnd(-8, 8), w: 14, life: 10 }); yield* wait(3); } yield* wait(8); },
  *crabHammer(U, T, u) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 10, r1: 40, c: '#d04a30', life: 14 }); yield* wait(8); yield* this.lunge(u, 26, 4); Sound.sfx('quake'); this.shake = 18;
    mSpawn(this, 'mjag', { x: T.x, y: T.y, r0: 8, r1: 44, c: '#ffb090', n: 14, life: 16 }); mSpawn(this, 'mcrack', { x: T.x, y: T.y + 28, n: 5, life: 28 });
    for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + (i - 4.5) * 0.3; mSpawn(this, 'mdrop', { x: T.x, y: T.y + 10, vx: Math.cos(an) * 2.4, vy: Math.sin(an) * 2.4, g: 0.16, r: 2, c: MC.water2, life: 22 }); } yield* wait(16); },
};
{ const W = (f, ...a) => function* (U, T, u, t) { yield* f.call(this, U, T, u, t, ...a); }, P = MX_PAL;
  const FIX = {
    m_hex: W(MX.curse), m_curseMark: W(MX.curse, true), m_voidGaze: function* (U, T) { yield* MX.gaze.call(this, U, T, P.void, function () { mSpawn(this, 'mcurse', { x: T.x, y: T.y, r0: 26, r1: 8, c: MC.dark, c2: MC.dark2, life: 22 }); }); },
    m_frozenGaze: function* (U, T) { yield* MX.gaze.call(this, U, T, P.ice, function () { for (let i = 0; i < 6; i++) { const an = i * 1.047; mSpawn(this, 'mshard', { x: T.x + Math.cos(an) * 16, y: T.y + Math.sin(an) * 12, r: 3.5, c: '#bfe8ff', vr: 0, life: 20 }); } }); },
    m_timeWarp: function* (U, T) { Sound.sfx('tick'); mSpawn(this, 'mrune', { x: T.x, y: T.y, s: 10, c: '#a0d8ff', life: 30 }); for (let i = 0; i < 3; i++) { mSpawn(this, 'mjag', { x: T.x, y: T.y, r0: 40, r1: 10, c: '#c8ecff', n: 12, life: 18, rot: i }); yield* wait(6); } yield* wait(12); },
    m_pinch: W(MX.pincer, P.crab), m_pincerSnap: W(MX.pincer, ['#6a4a20', '#c8a050', '#f0d890']), m_crabHammer: W(MX.crabHammer),
    m_spearRush: W(MX.spearRush), m_tidalSpear: W(MX.throwSpear), m_blinkStrike: W(MX.blink), m_tidalWave: W(MX.wave), m_featherStorm: W(MX.featherRain),
    m_scurry: function* (U) { yield* MX.speedUp.call(this, U, ['#4a3a30', '#9a8a7a', '#e0d0c0']); }, m_overclock: function* (U) { yield* MX.speedUp.call(this, U, P.metal); },
    m_slimeCoat: W(MX.slimeCoat), m_iceMirror: W(MX.iceMirror), m_starfall: W(MX.starfall), m_whirlpool: W(MX.whirlpool), m_frostNova: W(MX.frostNova), m_bearHug: W(MX.bearHug),
    m_steamBurst: W(MX.steam), m_ratSwarm: W(MX.swarmRush, '#5a5048'), m_diveBomb: MFX.m_dive,
    m_mapleStorm: W(MX.leafStorm, ['#e04a20', '#ff9a30', '#c02818']), m_millStorm: W(MX.leafStorm, ['#e8e0d0', '#9aa0b0', '#3a3a4a'], 'mfeather'),
    // borrowed effects in the right colours
    m_iceShard: mxRecolor(MFX.m_crystalShard, P.ice), m_avalanche: mxRecolor(MFX.m_rockfall, P.snow), m_iceFist: mxRecolor(MFX.m_golemFist, P.ice), m_frostFang: mxRecolor(MFX.m_bite, P.ice),
    m_gearCrush: mxRecolor(MFX.m_golemFist, P.metal), m_millGrind: mxRecolor(MFX.m_golemFist, P.stone), m_gearShot: mxRecolor(MFX.m_pebbleToss, P.metal), m_coinToss: mxRecolor(MFX.m_pebbleToss, P.gold),
    m_holyRay: mxRecolor(MFX.m_runeBeam, P.gold), m_moonBeam: mxRecolor(MFX.m_prismRay, P.moon), m_voidBeam: mxRecolor(MFX.m_prismRay, P.void), m_witchBolt: mxRecolor(MFX.m_runeBeam, P.witch),
  };
  for (const id in FIX) { if (!FIX[id] || !DEF.skills[id]) { bvErr('v12', 'consistency mfx ' + id); continue; } MFX[id] = FIX[id]; DEF.skills[id].fx = id; if (MOVES[id]) MOVES[id].fx = id; } }

/* ---------- v12.0.1 斬擊痕 (player: 「裂風斬的斬擊特效沒有扁平菱形斬擊痕 而且距離魔物有點距離 其他類似的也要修正」) ----------
   A crescent ('cres') was drawn as an arc around its point, so the cut sat r px beside the monster; and the flat-diamond blade
   style (09r) only knew straight lines. Now a crescent always passes through its point, and in a cutting skill it is a curved
   blade: thick in the middle, pointed ends, white core and a faint after-image, sweeping in like the straight cuts.
   Cutting skills are found from the skill itself too (class skills of the slash class, weapon skills whose motion is a cut),
   not only from 斬／刃／閃 in the name: 燕翔, 雙牙連擊, 捨身劈, 斷罪十字, 古王裁決, 獵刀切… */
{ const CUT = new Set(['slash', 'slash2', 'cross', 'heavy', 'crescentCut', 'iai', 'multi', 'sweep']);
  for (const id in DEF.skills) { const D = DEF.skills[id];
    if (/^(o_|sig_)/.test(id) && D.tags.includes('cls:slash')) SLASH_NAMES.add(D.name);
    if (id.startsWith('u_') && W12[id.slice(2)] && CUT.has(w12Spec(id.slice(2)).mv)) SLASH_NAMES.add(D.name);
    if (id.startsWith('u_') && !W12[id.slice(2)] && D.tags.includes('cls:slash')) SLASH_NAMES.add(D.name); } }
function bladeArc(x, cx, cy, r, a0, a1, w) { const N = 16, o = [], i = [];
  for (let k = 0; k <= N; k++) { const t = k / N, th = lerp(a0, a1, t), hw = w / 2 * Math.sin(Math.PI * t); o.push([cx + Math.cos(th) * (r + hw), cy + Math.sin(th) * (r + hw)]); i.push([cx + Math.cos(th) * (r - hw), cy + Math.sin(th) * (r - hw)]); }
  x.beginPath(); o.forEach(([X, Y], k) => k ? x.lineTo(X, Y) : x.moveTo(X, Y)); for (let k = i.length - 1; k >= 0; k--) x.lineTo(i[k][0], i[k][1]); x.closePath(); x.fill(); }
{ const _dp = drawParticle; drawParticle = function (x, p) {
    if (p.k !== 'cres' || p.hidden) return _dp(x, p);
    const a = 1 - p.t / p.life, r = p.r || 18, ang = p.ang || 0, cx = p.x - Math.cos(ang) * r, cy = p.y - Math.sin(ang) * r; // the arc's middle is on (p.x, p.y)
    x.save();
    if (p.sl) { const g = Math.min(1, p.t / 3), sp = 1.15 * g, w = Math.max(5, (p.w || 6) * 1.6), A = Math.min(1, a * 1.6);
      x.fillStyle = p.c2 || p.c; x.globalAlpha = A * 0.3; bladeArc(x, cx - Math.cos(ang) * w * 0.9, cy - Math.sin(ang) * w * 0.9, r, ang - sp, ang + sp, w * 0.7); // after-image
      x.globalAlpha = A; bladeArc(x, cx, cy, r, ang - sp, ang + sp, w);
      x.fillStyle = '#ffffff'; x.globalAlpha = Math.min(1, A * 1.3); bladeArc(x, cx, cy, r, ang - sp * 0.85, ang + sp * 0.85, Math.max(1.2, w * 0.36)); }
    else { x.globalAlpha = Math.min(1, a * 2); x.lineCap = 'round'; x.strokeStyle = p.c2; x.lineWidth = p.w || 6; x.beginPath(); x.arc(cx, cy, r, ang - 1.15, ang + 1.15); x.stroke();
      x.strokeStyle = p.c; x.lineWidth = Math.max(1, (p.w || 6) / 3); x.beginPath(); x.arc(cx, cy, r - 1, ang - 1.0, ang + 1.0); x.stroke(); }
    x.restore(); x.globalAlpha = 1; }; }
// 'arc': HERO_PK.arc (07v, a sweeping blade arc with a0..a1) took every arc, so the plain arcs without a1 (wind gusts, storm
// swirls, crescent particles of the weapon skills) were never drawn. Plain arcs draw again; in a cutting skill a partial sweep
// is a curved blade whose middle crosses the target (it ran around the target at radius r). Full rings (迴旋斬) stay rings.
{ const _dp = drawParticle; drawParticle = function (x, p) {
    if (p.k !== 'arc' || p.hidden) return _dp(x, p);
    const a = 1 - p.t / p.life;
    if (p.a1 == null) { x.save(); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, (p.a0 || 0) + p.t * 0.25, (p.a0 || 0) + p.t * 0.25 + 2.2); x.stroke(); x.restore(); x.globalAlpha = 1; return; }
    if (!p.sl || Math.abs(p.a1 - p.a0) >= 4) return _dp(x, p);
    const k = Math.min(1, p.t / (p.grow || 5)), d = p.a1 >= p.a0 ? 1 : -1, head = p.a0 + (p.a1 - p.a0) * k, tl = Math.max(p.tail || 1.8, Math.abs(p.a1 - p.a0));
    const from = d > 0 ? Math.max(p.a0, head - tl) : head, to = d > 0 ? head : Math.min(p.a0, head + tl); if (to - from < 0.02) return;
    const sq = p.sq || 0.6, rot = p.rot || 0, cr = Math.cos(rot), sr = Math.sin(rot), mid = (p.a0 + p.a1) / 2;
    const E = (th, dr = 0) => { const lx = (p.r + dr) * Math.cos(th), ly = (p.r + dr) * sq * Math.sin(th); return [lx * cr - ly * sr, lx * sr + ly * cr]; };
    const [mx, my] = E(mid), ox = p.x - mx, oy = p.y - my; // shift so the middle of the sweep is on the target
    const blade = (f, t2, w, dx = 0, dy = 0) => { const N = 18, o = [], i = []; for (let n = 0; n <= N; n++) { const u = n / N, th = lerp(f, t2, u), hw = w / 2 * Math.sin(Math.PI * u), A = E(th, hw), B = E(th, -hw); o.push([A[0] + ox + dx, A[1] + oy + dy]); i.push([B[0] + ox + dx, B[1] + oy + dy]); }
      x.beginPath(); o.forEach(([X, Y], n) => n ? x.lineTo(X, Y) : x.moveTo(X, Y)); for (let n = i.length - 1; n >= 0; n--) x.lineTo(i[n][0], i[n][1]); x.closePath(); x.fill(); };
    const w = Math.max(5, (p.w || 4) * 1.6), A = Math.min(1, a * 1.6), [nx, ny] = E(mid, 1), ux = nx - mx, uy = ny - my;
    x.save(); x.fillStyle = p.c; x.globalAlpha = A * 0.3; blade(from, to, w * 0.7, -ux * w * 0.9, -uy * w * 0.9);
    x.globalAlpha = A; blade(from, to, w); x.fillStyle = '#ffffff'; x.globalAlpha = Math.min(1, A * 1.3); const pad = (to - from) * 0.08; blade(from + pad, to - pad, Math.max(1.2, w * 0.36)); x.restore(); x.globalAlpha = 1; }; }

/* ---------- v12.0.1 每招技能標出吃哪一項屬性（玩家：「可以」，接在屬性面板說明之後） ----------
   Read from the skill's own attrScale modifier, so the tag can never disagree with the damage. Shown in the battle skill box,
   the menus' skill info, the weapon details, and (with the exact current multiplier) in the ⓘ power formula. */
function skillAttr(id) { const D = DEF.skills[id]; if (!D) return null; for (const m of D.mods || []) if (m.mul && m.mul.f === 'attrScale') return { k: m.mul.v[0], r: m.mul.v[1] }; return null; }
function skillAttrTag(id) { const a = skillAttr(id); return a ? ATTR_NAMES[a.k] + '加成' : ''; }
{ const _si = BB.skillInfo; BB.skillInfo = function (st, id) { const t = _si.call(this, st, id), tag = skillAttrTag(id); if (!tag) return t; const i = t.indexOf('　'); return i < 0 ? t + '・' + tag : t.slice(0, i) + '・' + tag + t.slice(i); }; }
{ const _pf = powFormula; powFormula = function (id, st = Game.st) { const t = _pf(id, st), a = skillAttr(id); if (!a || !st) return t;
    const v = (heroAttr(st) || {})[a.k] || 0, over = Math.max(0, v - 10), mul = 1 + over * a.r / 100, L = t.split('\n');
    L[0] += '　' + ATTR_NAMES[a.k] + v + (over ? '：×' + mul.toFixed(2) : '：超過10起每點+' + a.r + '%');
    return L.join('\n'); }; }

/* ---------- v12.0.1 技能冷卻（玩家：「普通攻擊幾乎用不到 應該要給技能加上冷卻時間」→ 選了「依威力 1～3」＋「普攻回 MP」） ----------
   Every damaging class / weapon skill has a cooldown by its total power (power × hits): ≤65 → 1, 66–95 → 2, ≥96 → 3; a longer
   cooldown it already had stays. Support skills, class signature moves (they spend their own resource) and weapon specials keep
   theirs. The learn counts do not change. Basic attacks restore 12% of max MP (ATK_MP12 in 10k). */
{ const hitsAvg = D => D.hits ? (D.hits[0] + D.hits[1]) / 2 : 1;
  for (const id in DEF.skills) { if (!/^(o_|u_)/.test(id)) continue; const D = DEF.skills[id]; if (!(D.power > 0)) continue;
    const tot = D.power * hitsAvg(D), cd = tot >= 96 ? 3 : tot >= 66 ? 2 : 1; if ((D.cooldown || 0) < cd) D.cooldown = cd; }
  const AD = '用主武器攻擊。不消耗 MP，命中時回復最大 MP 的 12%；每次攻擊都會累積特技。';
  for (const id of ['attack', 'attack_m', 'attack_2', 'attack_3']) if (DEF.skills[id]) DEF.skills[id].desc = AD; MOVES.attack.d = AD; }
