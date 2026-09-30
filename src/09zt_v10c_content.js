/* ===================== v10 階段三 B：新精英・專屬技武器・裝備特效調整 =====================
   Plan items 10 / 12:
   - 5 new elites roam the areas that had none (地下水道・古岩遺跡・王都地下水道・熔岩坑道・星見神殿): a wild encounter
     there can turn into one (7%, the card lets you retreat); beaten, they return after 200 steps.
   - 10 new weapons, each with an 專屬技 of its own (a skill of the weapon, on top of the orb slots). The new elites give
     their blueprint on the first kill; the other five join boss loot (再戰).
   - Gear effects that made bosses easy were toned down (07_battle / 07j): 連擊 25→20%, 荊棘 25→20% (bosses 12%),
     堅守回復 15→10%, 再生 6→4.5% (bosses 3%), 亡者守護 3→2 turns, 狂熱 max 3→2, 背水 max +50→+35%, 獵殺 +30→+20%,
     吸血 capped at 15% in total. */
Object.assign(SPECIALS.double || {}, { d: '物理攻擊後有20%機率追加一次50%傷害的攻擊。' });
Object.assign(SPECIALS.thorns || {}, { d: '受到攻擊時反彈20%傷害（頭目12%）。' });
Object.assign(SPECIALS.guardHeal || {}, { d: '防禦時回復10%最大HP。' });
Object.assign(SPECIALS.regen || {}, { d: '每回合結束時回復4.5%最大HP（頭目戰3%）。' });
Object.assign(SPECIALS.deathWard || {}, { d: '每場戰鬥一次：回合結束時HP低於30%，獲得2回合護盾。' });
Object.assign(SPECIALS.fervor || {}, { d: '每次攻擊後物攻（魔法攻擊則是魔攻）提升1階，最多2次。' });
Object.assign(SPECIALS.lastStand || {}, { d: 'HP越低傷害越高，最多+35%。' });
Object.assign(SPECIALS.predator || {}, { d: '對HP低於30%的對手傷害+20%。' });

/* ---------- 專屬技 weapons ---------- */
const UNIQUE_W = {
  quakeAxe: { n: '裂地戰斧', kind: '斧', t: 4, st: { atk: 15 }, sp: { crit: 3 }, d: '遺跡守衛背上的巨斧。一斧下去，地面跟著裂開。', skill: ['裂地斬', 'shieldBash', 92, 6, '劈開地面的重擊，降低對手物防。', ['fdef-1']] },
  tideRapier: { n: '潮鳴細劍', kind: '劍', t: 4, st: { atk: 13 }, sp: { hit: 5 }, elem: '水', d: '劍身會發出潮水聲的細劍。', skill: ['潮鳴突', 'gale', 62, 4, '先制的水之突刺，讓對手潮濕。', ['wet']] },
  wolfTwin: { n: '狼王雙刃', kind: '短刀', t: 5, st: { atk: 15 }, sp: { crit: 5 }, d: '瘴氣狼王的獠牙打成的雙刃。', skill: ['狼牙亂舞', 'bladeDance', 26, 6, '亂舞般的連續斬擊。', ['psn:30']] },
  coreStaff: { n: '熔核魔杖', kind: '法杖', t: 6, st: { spa: 19 }, sp: {}, elem: '火', d: '杖頭嵌著還在發燙的熔岩核心。', skill: ['熔核爆', 'combust', 82, 7, '對異常狀態的對手威力大增，有機率灼傷。', ['brn:30']] },
  fallenLance: { n: '墮星長槍', kind: '長槍', t: 7, st: { atk: 22 }, sp: { crit: 4 }, d: '從天空墜落的星辰鍛成的長槍。', skill: ['墮星突', 'dragonLance', 96, 8, '穿透一切的突刺，會心率加倍。', ['crit']] },
  thunderFist: { n: '雷鳴拳套', kind: '拳套', t: 5, st: { atk: 13, spe: 4 }, sp: { crit: 3 }, elem: '雷', d: '時計巨像的線圈做成的拳套，打出去會劈啪作響。', skill: ['雷鳴掌', 'taser', 66, 5, '雷電之掌，有機率麻痺。', ['par:25']] },
  frostTome: { n: '霜華魔導書', kind: '魔導書', t: 6, st: { spa: 18, mp: 10 }, sp: {}, elem: '水', d: '霜之女王的冰花夾在書頁之間。', skill: ['霜華詠唱', 'aquaBurst', 86, 8, '冰霜之浪，降低對手速度。', ['fspe-1']] },
  gearRifle: { n: '機巧火槍', kind: '火槍', t: 6, st: { atk: 19 }, sp: { hit: 6 }, d: '熔岩巨人的裝甲片改造的連發火槍。', skill: ['連裝彈', 'fullBurst', 24, 7, '連續發射的彈幕。', ['spec+1']] },
  boneGreatsword: { n: '龍骨巨劍', kind: '劍', t: 7, st: { atk: 24 }, sp: { crit: 4 }, d: '影將莫爾德佩帶的古龍骨大劍。', skill: ['龍骨斬', 'eclipseSlash', 104, 8, '吞噬光芒的一斬，吸取生命。', ['drain:20']] },
  moonHarp: { n: '月光豎琴', kind: '樂器', t: 5, st: { spa: 14, mp: 16 }, sp: {}, d: '銀鱗水龍守護的湖底豎琴。', skill: ['月光奏鳴', 'healSong', 0, 7, '回復HP並消除異常狀態，展開護盾。', ['shield:1']] },
};
for (const k in UNIQUE_W) { const U = UNIQUE_W[k], [sn, tpl, pow, mp, sd, eff] = U.skill;
  GEAR[k] = { n: U.n, slot: 'weapon', t: U.t, st: U.st, sp: U.sp, kind: U.kind, d: U.d + '（專屬技「' + sn + '」）', ...(U.elem ? { elem: U.elem } : {}), skill: 'u_' + k };
  MOVES['u_' + k] = { ...MOVES[tpl], n: sn, d: sd, uniq: k, ws: 1, ueff: eff, ...(pow ? { pow } : {}) }; SKILL_MP['u_' + k] = mp;
  const tm = Object.keys(WSK).find(q => GEAR[q] && GEAR[q].kind === U.kind && GEAR[q].t === U.t) || Object.keys(WSK).find(q => GEAR[q] && GEAR[q].kind === U.kind);
  if (tm) { WSK[k] = { a: [], p: { k: 'hpP', v: 0, n: '' }, s: { ...WSK[tm].s } }; if (GEAR[tm].look) GEAR[k].look = GEAR[tm].look; } BP_RARE.add(k);
  const t = U.t, P = TIER_POOL[t] || TIER_POOL[7]; GEAR_RECIPE[k] = { mats: { [P[hashK(k) % P.length]]: 2 + Math.floor(t / 2), [(TIER_POOL[t - 1] || P)[hashK(k) >> 4 & 3] || P[0]]: 1 + Math.floor(t / 3) }, gold: Math.round(bpGold(t) * 1.3 / 10) * 10 }; }
for (const [boss, k] of [['clockColossus', 'thunderFist'], ['frostQueen', 'frostTome'], ['lavaGiant', 'gearRifle'], ['shadowGeneral', 'boneGreatsword'], ['silverWyrm', 'moonHarp']]) { LOOT[boss] = LOOT[boss] || []; if (!LOOT[boss].includes(k)) LOOT[boss].push(k); }
// the weapon's skill joins the list after the class skill
{ const _wl = wsList; wsList = function (st = Game.st) { const L = _wl(st), w = mainWeapon(st), s = w && GEAR[w.b] && GEAR[w.b].skill; if (s && MOVES[s]) L.splice(sigId(st) ? 1 : 0, 0, s); return L; }; }
learnedSkills = function (st = Game.st) { return wsList(st); }; usableSkills = function (st = Game.st) { return wsList(st); }; summarySkills = function (st = Game.st) { return wsList(st); };
{ const _sm = skillMove; skillMove = function (id, st = Game.st) { const b = MOVES[id]; if (b && b.uniq) return { ...b }; return _sm(id, st); }; }
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    const b = MOVES[id]; if (!u || !u.hero || !b || !b.uniq) return yield* _um.call(this, u, t, id);
    const fhp = t ? t.hp : 0, r = yield* _um.call(this, u, t, id); if (u.hp <= 0 || this._castId !== id) return r; const dealt = t ? Math.max(0, fhp - t.hp) : 0;
    if (t && t !== u && dealt > 0) evoFlash(this, t, 'B'); for (const c of b.ueff || []) yield* evoApply(this, u, t, c, dealt, b); return r;
  }; }
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const L = _gi(g, wrapW), G = GEAR[g.b]; if (!G || !G.skill || !MOVES[G.skill]) return L; const m = MOVES[G.skill];
    const i = L.findIndex(l => l[0] === '【武器】'); const X = Font.wrap('專屬技「' + m.n + '」' + (m.pow ? '威力' + m.pow + '・' : '') + 'MP' + SKILL_MP[G.skill] + '　' + m.d, wrapW - 4, 10).map(l => [l, '#ffb0e0', 10, 4]);
    L.splice(i < 0 ? L.length : i + 1, 0, ...X); return L; }; }

/* ---------- roaming elites ---------- */
const ROAM = {
  sewer: ['crystalCroc', '晶甲巨鱷', 'aquatic', 19, 'tank', ['m_tailSlam', 'm_crabHammer', 'm_bite', 'm_goo'], ['croc', 170, 0.9, 1.2], '在地下水道深處長大的巨鱷，背上長滿了水晶。', 'tideRapier', ['aquaEdge', 'prism'], ['……水面下有什麼東西在發光。', '晶甲巨鱷從水裡浮了上來！']],
  ruins: ['ruinWarden', '遺跡守衛', 'construct', 18, 'tank', ['m_golemFist', 'm_quake', 'm_stoneWall', 'm_rumble'], ['golem', -40, 0.7, 0.9], '守護遺跡入口的小型魔像。背上插著一把巨斧。', 'quakeAxe', ['focusMind', 'bulwark'], ['石柱之間的石像動了起來……', '遺跡守衛擋住了去路！']],
  capSewer: ['miasmaWolf', '瘴氣狼王', 'beast', 27, 'fast', ['m_bite', 'm_rend', 'm_howl', 'm_pounce'], ['wolf', 95, 0.9, 0.9], '吸了下水道的瘴氣而變異的狼王，眼睛發著綠光。', 'wolfTwin', ['songOfValor', 'haste'], ['黑暗中有一雙綠色的眼睛……', '瘴氣狼王撲了過來！']],
  lavaTunnel: ['lavaKnight', '熔岩騎士', 'undead', 37, 'phys', ['m_darkSlash', 'm_axeSpin', 'm_rend', 'm_soulSip'], ['boneKnight', 20, 1.2, 1.1], '死後仍在熔岩中巡邏的騎士。鎧甲縫隙透出火光。', 'coreStaff', ['flameVortex', 'lastStand'], ['熔岩裡站起了一個燃燒的身影……', '熔岩騎士舉起了劍！']],
  starShrine: ['fallenStar', '墮星騎士', 'human', 44, 'phys', ['m_riftCharge', 'm_darkSlash', 'm_eclipse', 'm_soulSip'], ['riftKnight', 230, 0.8, 1.1], '被星之門的力量吞噬的騎士。已經分不清敵我。', 'fallenLance', ['thorHammer', 'shadowStep'], ['星光突然暗了下來……', '墮星騎士從星之門的方向走來！']],
};
for (const map in ROAM) { const [k, n, fam, lv, role, moves, look, dex, drop, orbs, lines] = ROAM[map];
  SPECIES[k] = { n, fam, base: CH2_ROLE[role].map(v => Math.round(v * 80)), exp: Math.round((5 * lv + 28) * 2.3), gold: 0, learn: moves.map(m => [1, m]), dex, elite: 1, drop };
  MON_PANEL[k] = ch2Panel(lv, role, 'elite'); const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF[k] = HD_RIG_OF[b] || b; const base = ART[b] ? b : PLACEHOLDER[b] && PLACEHOLDER[b][0]; if (ART[base]) ART[k] = artRecolor(ART[base], dh, ks, kl);
  ORB_DROP[k] = orbs; LOOT[k] = [drop]; BOSS_MAT[k] = BOSS_MAT[b] || null; ELITE_TEXT[k] = lines; FOE_SPOTS.push({ sp: k, lv, map, kind: 'elite', key: k, roam: 1 }); }
FOE_SPOTS.sort((a, b) => a.lv - b.lv);
for (const sp in ORB_DROP) ORB_DROP[sp].forEach((k, i) => { if (!ORB_SRC[k]) ORB_SRC[k] = []; const t = SPECIES[sp].n + (i === 0 ? '（首殺）' : ''); if (!ORB_SRC[k].includes(t)) ORB_SRC[k].push(t); });
const ROAM_BACK = 200;
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    const st = this.st, R = cfg && cfg.kind === 'wild' && ROAM[st.map]; const down = st.roamDown || (st.roamDown = {});
    if (R && (Game.forceRoam || chance(0.07)) && (down[R[0]] === undefined || (st.steps || 0) - down[R[0]] >= ROAM_BACK)) {
      Game.forceRoam = 0; const [k, , , lv] = R, again = down[R[0]] !== undefined, L = again ? lv + 3 : lv; Sound.sfx('exclaim'); this.p.excl = 30; yield* sayAll(again ? [SPECIES[k].n + '又出現了！看起來比上次更兇猛……'] : ELITE_TEXT[k]);
      if (!(yield* askFight(k, L, k, 'elite', again ? '再戰' : '出沒'))) { yield* say('悄悄地退開了。'); return 'run'; }
      const res = yield* _bs.call(this, { sp: k, lv: L, kind: 'elite', id: k, rematch: again, drop: again ? null : R[8] }, ...a); if (res === 'win') down[k] = st.steps || 0; return res;
    }
    return yield* _bs.call(this, cfg, ...a);
  }; }

/* ---------- class balance with orbs on 異界 (tools/v143 probe) ---------- */
Object.assign(CLASS_SIG, {
  ranger: ['獵人直覺', [['speP', 8], ['eva', 4], ['hpP', 10], ['critDmg', 15], ['atkP', 6]]],
  monk: ['氣', [['atkUp', 20], ['atkMp', 2], ['hpP', 12], ['defP', 8], ['atkP', 6]]],
  spellblade: ['魔劍', [['elem', 10], ['actUp', 10], ['atkP', 4], ['spaP', 4], ['hpP', 6]]],
});
// v9's extra toughness for chapter-2 bosses was tuned for 普通; with 異界 as the base it goes almost away
Object.assign(V9_TOUGH, { boss: 1.0, elite: 1.0 });

// Codex task T: the unique weapons' own sprites (palette rows → canvas, same 16×22 format as WEAPON_PX)
for (const k in (typeof WEAPON_PX_ROWS !== 'undefined' ? WEAPON_PX_ROWS : {})) { const [cols, rows] = WEAPON_PX_ROWS[k], pal = {}; cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h); const c = spriteFrom(rows, pal); c.ok = true; WEAPON_PX[k] = c; }
