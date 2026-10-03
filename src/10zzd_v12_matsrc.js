/* ===================== v12.0.2 素材來源：關閉區域的素材改到開放地區＋來源提示重新整理 =====================
   1) 裂界碎片、星之碎片、星塵只在關閉的異界迴廊、星見神殿拿得到，用到它們的 28 件裝備做不出來（星辰護符、委託獎勵的
      星之羅盤・冒險王之證也是）。玩家沒有偏好 → 推薦做法：改到開放地區（2026-10-03）。
      裂界碎片：古岩遺跡、地下水道的魔物；星之碎片、星塵：冰晶洞窟、曙光鐘塔的魔物（一般魔物 20%，跟原本的素材分開算），
      冰晶洞窟的一個採集點改成星塵（原本的「星塵」採集：偶爾多一顆星之碎片）。
   2) MAT_SRC (09u) was counted before later files added monsters, so 角兔毛（角兔）, 赤鹿角（赤角鹿・楓林鹿王）and 木材（樹樁怪）had no
      source and the smith's 「還缺：…」 said nothing about where to find them. Counted again here, after every map is in; closed places
      (異界迴廊・星見神殿) are left out so the hint never points at a door that doesn't open. */
const MAT2_12 = { skeleton: 'riftShard', ghostLamp: 'riftShard', drownedSoul: 'riftShard', crystalPebble: 'riftShard',
  iceBat: 'starShard', iceGolem: 'starShard', gearSprite: 'starShard', towerBat: 'starShard',
  frostWraith: 'starDust', frostSlime: 'starDust', clockSoldier: 'starDust', hollowArmor: 'starDust' };
for (const k in MAT2_12) if (!SPECIES[k]) { console.warn('mat2: no species', k); delete MAT2_12[k]; }
{ const g = (MAPS.iceCave.gathers || []).find(q => q.id === 'gic2'); if (g) Object.assign(g, { kind: 'star', mat: 'starDust' }); }
Object.assign(ITEMS.riftShard, { d: '異界裂縫留下的碎片，會自己發出微光。古岩遺跡和地下水道的魔物身上偶爾找得到。' });
Object.assign(ITEMS.starShard, { d: '流星掉下來的碎片。冰晶洞窟和曙光鐘塔的魔物偶爾會帶著。' });
Object.assign(ITEMS.starDust, { d: '閃閃發亮的粉末。冰晶洞窟的採集點和曙光鐘塔的魔物身上找得到。' });
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* (...a) { const r = yield* _v.apply(this, a), st = Game.st;
    for (const v of this.defeated()) { if (v.elite || v.boss || v.minion) continue; const m = MAT2_12[v.sp]; if (!m || !ITEMS[m] || !chance(0.2)) continue;
      st.bag[m] = (st.bag[m] || 0) + 1; yield* this.msg('得到了素材「' + ITEMS[m].n + '」！', { hold: 30 }); }
    return r; }; }
{ const CLOSED = ['rift', 'starShrine'], mapN = m => (MAPS[m] && MAPS[m].name || m).replace(/ \d+F$/, '');
  for (const k in MAT_SRC) delete MAT_SRC[k];
  const add = (k, t) => { (MAT_SRC[k] = MAT_SRC[k] || []).includes(t) || MAT_SRC[k].push(t); }, spOf = s => SPECIES[s] && SPECIES[s].mat ? SPECIES[s] : null;
  for (const m in MAPS) { if (CLOSED.includes(m)) continue; const d = MAPS[m];
    for (const e of d.encounters || []) for (const r of e.table || []) { const sp = spOf(r[0]); if (sp) add(sp.mat, sp.n + '・' + mapN(m)); if (MAT2_12[r[0]]) add(MAT2_12[r[0]], SPECIES[r[0]].n + '・' + mapN(m)); }
    for (const e of d.elites || []) { const sp = spOf(e.sp); if (sp) add(sp.mat, sp.n + '・' + mapN(m)); }
    if (d.boss) { const sp = spOf(d.boss.sp); if (sp) add(sp.mat, sp.n + '・' + mapN(m)); }
    for (const g of d.gathers || []) if (g.mat) add(g.mat, '採集・' + mapN(m)); } }
