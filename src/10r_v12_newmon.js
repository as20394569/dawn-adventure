/* ===================== v12.0.1 早期的新魔物（玩家決定：野狼・溪谷小鱷・樹樁怪・小野豬） =====================
   They give the early gear the materials its name asks for: 灰狼皮 (狼王 gear), 水道鱷皮 (鱷鱗甲・鱷皮長靴), the new 木材 (wooden
   weapons and instruments) and 野豬獠牙 (野豬戰斧). Same pattern as the chapter-1 monsters (09za): stats from ch1Panel by level and
   role, their own moves and effects (below); their battle pictures are Codex task AF (front view, art/battle/chibi). */
/* ---------- their own moves (player: 「新魔物請 codex 重畫然後你重新設計招式與特效」) ----------
   Each one has its own effect in the monster's colours: the wolf's tan fur and amber eyes, the croc's olive hide and creek
   water, the stump's bark and tree rings, the piglet's brown bristles, white tusks and mud. */
Object.assign(MOVES, {
  m12_wolfNip: { n: '疾咬', t: '一般', cat: '物', pow: 40, acc: 100, pp: 25, prio: 1, d: '一眨眼就撲上來咬一口。必定先出手。' },
  m12_wolfClaw: { n: '撕爪', t: '一般', cat: '物', pow: 55, acc: 95, pp: 20, eff: { stat: { def: -1 }, p: 30 }, d: '用爪子撕開護具。有時降低對手的物防。' },
  m12_wolfCall: { n: '呼伴長嚎', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 1, spe: 1 }, d: '長嚎呼喚同伴，草叢裡亮起好幾對眼睛。提升物攻和速度。' },
  m12_wolfHunt: { n: '圍獵', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, d: '繞著獵物轉一圈，從背後撲咬。' },
  m12_crocSnap: { n: '小顎咬', t: '一般', cat: '物', pow: 55, acc: 100, pp: 20, eff: { flinch: 1, p: 20 }, d: '用小小的嘴喀嚓咬下。有時讓對手退縮。' },
  m12_crocSplash: { n: '水花甩尾', t: '水', cat: '物', pow: 55, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 30 }, d: '甩尾巴打起一片水花。有時降低對手的速度。' },
  m12_crocShoal: { n: '躲進淺灘', t: '水', cat: '變', pp: 10, stat: { who: 'self', def: 1, spd: 1 }, d: '縮進淺灘的水裡。提升物防和魔防。' },
  m12_crocRoll: { n: '死亡翻滾', t: '一般', cat: '物', pow: 25, acc: 90, pp: 10, hits: [2, 3], d: '咬住對手在水裡打滾。連續攻擊 2～3 次。' },
  m12_stumpBump: { n: '年輪撞擊', t: '草', cat: '物', pow: 45, acc: 100, pp: 20, eff: { flinch: 1, p: 20 }, d: '用結實的樹樁身體撞過來。有時讓對手退縮。' },
  m12_stumpRoot: { n: '樹根絆腳', t: '草', cat: '物', pow: 35, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 50 }, d: '從腳下伸出樹根把對手絆倒。常常降低對手的速度。' },
  m12_stumpSprout: { n: '發芽', t: '草', cat: '變', pp: 10, heal: 0.25, d: '頭頂的嫩芽長出新葉。回復一些體力。' },
  m12_stumpChips: { n: '木屑飛濺', t: '一般', cat: '物', pow: 50, acc: 100, pp: 15, d: '抖動身體，把木屑像石子一樣噴出去。' },
  m12_pigTusk: { n: '小獠牙', t: '一般', cat: '物', pow: 50, acc: 100, pp: 20, eff: { flinch: 1, p: 20 }, d: '用剛長出來的小獠牙往上頂。有時讓對手退縮。' },
  m12_pigSnort: { n: '哼哼威嚇', t: '一般', cat: '物', pow: 35, acc: 100, pp: 15, eff: { stat: { atk: -1 }, p: 100 }, d: '用鼻子噴氣再頂一下。降低對手的物攻。' },
  m12_pigMud: { n: '泥巴打滾', t: '一般', cat: '變', pp: 10, stat: { who: 'self', def: 1 }, d: '在泥巴裡打滾，身上裹了一層硬泥。提升物防。' },
  m12_pigRush: { n: '橫衝直撞', t: '一般', cat: '物', pow: 75, acc: 85, pp: 10, d: '低著頭一路衝過來。威力大，但常常撞歪。' },
});
for (const [k, c] of [['m12_wolfNip', 'bite'], ['m12_wolfClaw', 'claw'], ['m12_wolfCall', 'buff'], ['m12_wolfHunt', 'bite'], ['m12_crocSnap', 'bite'], ['m12_crocSplash', 'strike'],
  ['m12_crocShoal', 'guard'], ['m12_crocRoll', 'bite'], ['m12_stumpBump', 'strike'], ['m12_stumpRoot', 'strike'], ['m12_stumpSprout', 'buff'], ['m12_stumpChips', 'proj'],
  ['m12_pigTusk', 'pierce'], ['m12_pigSnort', 'debuff'], ['m12_pigMud', 'guard'], ['m12_pigRush', 'strike']]) {
  Object.assign(MOVES[k], { cls: c, fx: k, foe: 1 }); (MON_CLASS[c] || (MON_CLASS[c] = [])).push(k);
  if (k === 'm12_crocRoll') MOVES[k].hitFx = 'm12h_crocRoll';
  // made after bvFinalize (10m): give the effects their ids the same way (spec §4)
  const D = defPut('skills', k, skillFromMove(k, MOVES[k], { kind: 'skill', extraTags: ['monster_skill'] }));
  D.cooldown = 0; // monster moves: no cooldown (10m)
  D.effects = D.effects.map((ef, i) => effRegister('skill:' + k + '#e' + i, ef)); D.after = D.after.map((ef, i) => effRegister('skill:' + k + '#a' + i, ef));
}
// tree rings: three filled circles, bark / sapwood / bark, opening out
MON_PK.m12rings = (x, p, a) => { const R = lerp(p.r0 || 6, p.r1 || 30, Math.min(1, p.t / p.life * 1.6)); x.globalAlpha = a; for (let i = 3; i >= 1; i--) mCirc(x, p.x, p.y, R * i / 3, i % 2 ? (p.c || '#a07a4a') : (p.c2 || '#e8c890')); };
{ const FUR = '#c09a64', FUR2 = '#f0d8a8', AMBER = '#f0b040', TOOTH = '#f8f4e0', CROC = '#6a8a3a', CROC2 = '#c8d070', CREEK = '#4aa0c0', CREEK2 = '#8ad0d8',
    BARK = '#8a6038', BARK2 = '#c8a070', SPROUT = '#8ac040', MUD = '#6a4a28', TUSK = '#f4efe0', DUST = '#a08a6a';
  function* crocRoll(B, T, i) { Sound.sfx('water'); for (let k = 0; k < 3; k++) mSpawn(B, 'mgouge', { x: T.x, y: T.y + 4, ang: (i * 3 + k) * 1.05, len: 40, w: 6, c: k % 2 ? CREEK : CROC, c2: k % 2 ? CREEK2 : CROC2, bend: 12, grow: 5, life: 14 });
    for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2 + i; mSpawn(B, 'mdrop', { x: T.x, y: T.y, vx: Math.cos(an) * 2.2, vy: Math.sin(an) * 2 - 0.8, g: 0.16, r: 1.8, c: CREEK2, life: 18 }); }
    B.shake = 6; yield* wait(12); }
  FX.m12h_crocRoll = function* (U, T, u, i) { yield* crocRoll(this, T, i || 1); };
  Object.assign(MFX, {
    // 野狼
    *m12_wolfNip(U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 4; i++) mSpawn(this, 'mpuff', { x: lerp(U.x, T.x, i / 4), y: lerp(U.y, T.y, i / 4) + 10, r: 3, c: '#c8b08a', op: 0.6, life: 12 + i * 2 });
      yield* this.lunge(u, 24, 2); Sound.sfx('hit'); mSpawn(this, 'mfang', { x: T.x, y: T.y, w: 22, c: TOOTH, gum: '#6a4a2a', life: 14 }); yield* wait(8); mSpawn(this, 'mglint', { x: T.x + 9, y: T.y - 9, c: AMBER, life: 10 }); yield* wait(8); },
    *m12_wolfClaw(U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('slash'); mClaw(this, T, FUR, 1, 3, 30, 5); yield* wait(6); mDebris(this, T.x, T.y, 4, '#9aa0ac', 'mshard', 1.8, 2.5);
      for (let i = 0; i < 4; i++) mSpawn(this, 'mfeather', { x: T.x + rnd(-10, 10), y: T.y + rnd(-6, 6), vy: 0.5, vx: rnd(-5, 5) / 10, c: FUR2, life: 24 }); yield* wait(14); },
    *m12_wolfCall(U) { Sound.cry(7, 0.9, 1.4); for (let i = 0; i < 3; i++) { mSpawn(this, 'mjag', { x: U.x, y: U.y - 14, r0: 6, r1: 40, c: '#e0b060', n: 12, life: 18, fl: 0.6, rot: i * 0.4 }); yield* wait(6); }
      for (const [dx, dy] of [[-46, 8], [46, 4], [-32, -18], [36, -20]]) for (const e of [-3, 3]) mSpawn(this, 'mglint', { x: U.x + dx + e, y: U.y + dy, c: AMBER, life: 24 });
      Sound.sfx('statUp'); mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 16, r1: 40, c: '#d09040', life: 18 }); yield* wait(20); },
    *m12_wolfHunt(U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; mSpawn(this, 'mpuff', { x: T.x + Math.cos(an) * 30, y: T.y + 14 + Math.sin(an) * 10, r: 3, c: '#b8a080', op: 0.7, life: 16 }); if (i % 2) yield* wait(2); }
      yield* this.lunge(u, 22, 3); Sound.sfx('slash'); for (const ang of [0.8, 2.34]) mSpawn(this, 'mgouge', { x: T.x, y: T.y, ang, len: 34, w: 6, c: FUR, c2: FUR2, life: 14 }); yield* wait(6);
      Sound.sfx('hitSuper'); mSpawn(this, 'mfang', { x: T.x, y: T.y, w: 30, c: TOOTH, gum: '#6a4a2a', life: 16 }); this.shake = 8; yield* wait(14); },
    // 溪谷小鱷
    *m12_crocSnap(U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('hit'); mSpawn(this, 'mfang', { x: T.x, y: T.y, w: 34, c: TOOTH, gum: '#4a6a2a', life: 16 });
      for (let i = 0; i < 5; i++) mSpawn(this, 'mdrop', { x: T.x + rnd(-14, 14), y: T.y - 4, vx: rnd(-12, 12) / 10, vy: -1.2 - Math.random(), g: 0.18, r: 1.8, c: CREEK2, life: 18 }); yield* wait(10); mImpact(this, T, CROC2, 14); yield* wait(8); },
    *m12_crocSplash(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('water'); mProj(this, U, T, i => ({ k: 'mdrop', r: 2.4, c: i % 2 ? CREEK2 : CREEK, arc: 20 + i * 2 }), 7, 1, 14); yield* wait(16);
      mSpawn(this, 'mgouge', { x: T.x, y: T.y + 6, ang: 0.1, len: 44, w: 7, c: CROC, c2: CROC2, bend: 8, life: 14 }); for (let i = 0; i < 3; i++) mSpawn(this, 'mbubble', { x: T.x + (i - 1) * 14, y: T.y + 22, r: 3 + i, c: CREEK, life: 22 }); yield* wait(16); },
    *m12_crocShoal(U) { Sound.sfx('water'); for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; mSpawn(this, 'mdrop', { x: U.x + Math.cos(an) * 30, y: U.y + 20 + Math.sin(an) * 8, vy: -1.6 - Math.random(), g: 0.12, r: 2, c: CREEK2, life: 20 }); }
      yield* wait(8); const p = mSpawn(this, 'mbubble', { x: U.x, y: U.y + 4, r: 8, c: CREEK, life: 26 }); p.upd = q => { q.r = 8 + Math.min(1, q.t / 10) * 20; }; Sound.sfx('statUp'); yield* wait(22); },
    *m12_crocRoll(U, T, u) { yield* this.lunge(u, 18, 3); Sound.sfx('hitSuper'); mSpawn(this, 'mfang', { x: T.x, y: T.y, w: 36, c: TOOTH, gum: '#4a6a2a', life: 14 }); yield* wait(6); yield* crocRoll(this, T, 0); },
    // 樹樁怪
    *m12_stumpBump(U, T, u) { yield* this.lunge(u, 18, 4); Sound.sfx('hit'); mSpawn(this, 'm12rings', { x: T.x, y: T.y, r0: 6, r1: 30, c: '#a07a4a', c2: '#e8c890', life: 16 }); mDebris(this, T.x, T.y, 4, BARK2, 'mshard', 1.8, 2.2); this.shake = 6; yield* wait(16); },
    *m12_stumpRoot(U, T) { Sound.sfx('leaf'); mSpawn(this, 'mcrack', { x: T.x, y: T.y + 26, n: 3, c: '#4a3420', life: 26 });
      for (let i = 0; i < 3; i++) { mSpawn(this, 'mthorn', { x1: T.x + (i - 1) * 16, y1: T.y + 28, x2: T.x - (i - 1) * 10, y2: T.y + 8, w: 3, c: '#7a5634', c2: '#b08a5a', grow: 8, life: 22 }); yield* wait(3); }
      mRise(this, T.x, T.y + 22, 4, () => ({ k: 'mpuff', r: 3, c: DUST })); yield* wait(18); },
    *m12_stumpSprout(U) { Sound.sfx('heal'); for (const o of [-6, 6]) mSpawn(this, 'mthorn', { x1: U.x, y1: U.y - 14, x2: U.x + o * 2, y2: U.y - 32, w: 2.5, c: '#4a8a2a', c2: SPROUT, grow: 10, life: 28 }); yield* wait(6);
      for (let i = 0; i < 5; i++) mSpawn(this, 'mleaf', { x: U.x + rnd(-14, 14), y: U.y - 20, vy: -0.4, vx: rnd(-4, 4) / 10, c: SPROUT, life: 26 }); mRise(this, U.x, U.y + 10, 6, () => ({ k: 'mglob', r: 2, c: '#b8e070' })); yield* wait(22); },
    *m12_stumpChips(U, T, u) { yield* this.lunge(u, 6, 2); Sound.sfx('rock'); mProj(this, U, T, i => ({ k: 'mshard', r: 2.5 + (i % 3), c: i % 2 ? BARK2 : BARK, vr: 0.6, seed: i + 1, wob: 4 }), 9, 1, 12); yield* wait(20);
      Sound.sfx('hit'); mImpact(this, T, BARK2, 16); mDebris(this, T.x, T.y, 5, BARK2, 'mshard', 1.6, 2); yield* wait(10); },
    // 小野豬
    *m12_pigTusk(U, T, u) { yield* this.lunge(u, 18, 3); Sound.sfx('hit'); for (const o of [-6, 6]) mSpawn(this, 'mgouge', { x: T.x + o, y: T.y + 6, ang: -1.57 + o / 30, len: 18, w: 4, c: TUSK, c2: '#ffffff', bend: o / 3, life: 12 }); mImpact(this, T, '#e8d8b8', 14); yield* wait(14); },
    *m12_pigSnort(U, T, u) { Sound.cry(11, 0.7, 0.6); mSpawn(this, 'manger', { x: U.x + 12, y: U.y - 16, c: '#ff5040', life: 22 }); for (const o of [-4, 4]) mProj(this, { x: U.x + o, y: U.y + 4 }, T, () => ({ k: 'mpuff', r: 4, c: '#e8e0d0', op: 0.7 }), 2, 3, 14); yield* wait(18);
      yield* this.lunge(u, 8, 2); Sound.sfx('hit'); mImpact(this, T, '#f0e0c0', 12); for (let i = 0; i < 3; i++) mSpawn(this, 'mdrop', { x: T.x + (i - 1) * 10, y: T.y - 16, vy: 1.2, r: 2, c: '#9aa0c0', life: 18 }); yield* wait(12); },
    *m12_pigMud(U) { Sound.sfx('water'); for (let i = 0; i < 8; i++) { const an = -Math.PI / 2 + (i - 3.5) * 0.4; mSpawn(this, 'mglob', { x: U.x, y: U.y + 16, vx: Math.cos(an) * 2, vy: Math.sin(an) * 2.2, g: 0.2, r: 2.5, c: MUD, life: 22 }); } yield* wait(10);
      for (let i = 0; i < 5; i++) mSpawn(this, 'mdrop', { x: U.x + rnd(-14, 14), y: U.y + rnd(-10, 6), vy: 0.6, r: 1.8, c: '#5a3a1e', life: 20 }); Sound.sfx('statUp'); mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 34, r1: 12, c: '#8a6a40', n: 16, life: 18 }); yield* wait(18); },
    *m12_pigRush(U, T, u) { Sound.sfx('run'); for (let i = 0; i < 6; i++) mSpawn(this, 'mpuff', { x: U.x + rnd(-10, 10), y: U.y + 20, vx: rnd(-8, 8) / 10, vy: -0.3, r: 4, c: DUST, op: 0.75, life: 20 }); yield* wait(6);
      yield* this.lunge(u, 34, 4); Sound.sfx('hitSuper'); this.shake = 14; mSpawn(this, 'mjag', { x: T.x, y: T.y, r0: 6, r1: 34, c: '#e8c890', n: 12, life: 14 }); mDebris(this, T.x, T.y + 20, 6, '#7a5a38', 'mrock', 2.2, 3);
      for (let i = 0; i < 5; i++) mSpawn(this, 'mpuff', { x: T.x + rnd(-24, 24), y: T.y + 22, r: 5, c: '#9a8468', op: 0.7, life: 22 }); yield* wait(16); },
  }); }
ITEMS.wood = { n: '木材', mat: 1, price: 0, sell: 40, cat: '魔物素材', d: '樹樁怪身上掉下來的木頭。乾燥又結實，適合做木製的武器和樂器。' };
// [key, name, family, level, role, moves, material, look [base, hue, sat, light], dex]
const V12_MON = [
  ['meadowWolf', '野狼', 'beast', 7, 'fast', ['m12_wolfNip', 'm12_wolfClaw', 'm12_wolfCall', 'm12_wolfHunt'], 'wolfPelt', ['wolf', 25, 0.55, 1.15], '晨霧道路上成群出沒的灰褐色野狼。狼王出現之後，牠們也變得大膽起來。'],
  ['creekCroc', '溪谷小鱷', 'aquatic', 10, 'tank', ['m12_crocSnap', 'm12_crocSplash', 'm12_crocShoal', 'm12_crocRoll'], 'crocHide', ['croc', 40, 0.8, 1.15], '躲在碧溪谷淺灘的小鱷魚。個子不大，咬合力卻一點也不輸大人。'],
  ['stumpling', '樹樁怪', 'plant', 4, 'tank', ['m12_stumpBump', 'm12_stumpRoot', 'm12_stumpSprout', 'm12_stumpChips'], 'wood', ['rotTreant', 35, 1.1, 1.25], '被砍倒的樹留下的樹樁，吸了瘴氣以後長出腳走了起來。'],
  ['piglet', '小野豬', 'beast', 5, 'phys', ['m12_pigTusk', 'm12_pigSnort', 'm12_pigMud', 'm12_pigRush'], 'boarTusk', ['wildBoar', 15, 0.8, 1.2], '風車丘陵的小野豬。橫衝直撞的樣子跟長大的暴走野豬一模一樣。'],
];
for (const [k, n, fam, lv, role, moves, mat, look, dex] of V12_MON) {
  const R = CH2_ROLE[role], ok = moves.filter(m => MOVES[m]); if (ok.length < moves.length) bvErr('v12', k + ' moves ' + moves.filter(m => !MOVES[m]).join(','));
  SPECIES[k] = { n, fam, base: R.map(v => Math.round(v * 60)), exp: 45 + 3 * lv, gold: Math.round(lv * 1.6), learn: ok.map((m, i) => [i === 3 ? lv + 1 : 1, m]), dex, mat };
  MON_PANEL[k] = ch1Panel(lv, role, 'wild');
  const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF_PENDING[k] = b; HD_RIG_OF[k] = b; if (ART[b]) ART[k] = artRecolor(ART[b], dh, ks, kl);
  CH2_KEYS.add(k);
  // the v12 core's enemy entry (10h registered the others before this file)
  defPut('enemies', k, { tags: ['foe', 'fam:' + fam], skills: ok.filter(id => DEF.skills[id]), fam, trait: null, profile: typeof aiProfile === 'function' ? aiProfile({ sp: k }) : 'brute', script: null, metadata: { n } });
}
// where they live (level ranges as decided; weights like their neighbours)
{ const put = (map, i, row) => { const z = MAPS[map] && MAPS[map].encounters && MAPS[map].encounters[i]; if (z && !z.table.some(t => t[0] === row[0])) z.table.push(row); };
  put('route', 0, ['stumpling', 2, 4, 15]); put('route', 1, ['stumpling', 4, 6, 15]); put('route', 1, ['meadowWolf', 5, 6, 15]); put('route', 2, ['meadowWolf', 7, 9, 18]);
  put('forest', 0, ['stumpling', 11, 13, 12]); put('forest', 1, ['stumpling', 11, 13, 12]);
  put('windHills', 0, ['piglet', 6, 7, 25]); put('windHills', 1, ['piglet', 4, 5, 25]);
  for (let i = 0; i < 3; i++) put('jadeCreek', i, ['creekCroc', i ? 8 : 10, i ? 9 : 11, 25]); }
// the gear that waited for them (counts unchanged, see 10q)
Object.assign(RECIPE_FIX12, {
  fangDagger: ['wolfPelt'], wolfNecklace: ['wolfPelt'], fangWand: ['wolfPelt', 'stone'], wolfMantle: ['wolfPelt', 'hareFur'], hunterLeather: ['wolfPelt', 'frogSkin'], hunterOath: ['wolfPelt', 'feather'],
  scaleArmor: ['crocHide', 'stone'], crocBoots: ['crocHide'],
  woodSword: ['wood'], practiceWand: ['wood'], apprenticeStaff: ['wood', 'stone'], primerTome: ['wood', 'hareFur'], woodFlute: ['wood', 'feather'], corkGun: ['wood', 'stone'],
  hatchet: ['stone', 'wood'], trainSpear: ['wood'], travelLute: ['wood', 'frogSkin'], oakStaff: ['wood', 'leaf'], boarAxe: ['boarTusk', 'stone'] });
for (const k of ['fangDagger', 'wolfNecklace', 'fangWand', 'wolfMantle', 'hunterLeather', 'hunterOath', 'scaleArmor', 'crocBoots', 'woodSword', 'practiceWand', 'apprenticeStaff', 'primerTome', 'woodFlute', 'corkGun', 'hatchet', 'trainSpear', 'travelLute', 'oakStaff', 'boarAxe']) {
  const R = GEAR_RECIPE[k]; if (!R) continue; const counts = Object.values(R.mats), keys = RECIPE_FIX12[k], m = {};
  counts.forEach((n, i) => { const id = keys[Math.min(i, keys.length - 1)]; m[id] = (m[id] || 0) + n; }); R.mats = m; }
