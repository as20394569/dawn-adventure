/* ===================== v12.0.1 早期的新魔物（玩家決定：野狼・溪谷小鱷・樹樁怪・小野豬） =====================
   They give the early gear the materials its name asks for: 灰狼皮 (狼王 gear), 水道鱷皮 (鱷鱗甲・鱷皮長靴), the new 木材 (wooden
   weapons and instruments) and 野豬獠牙 (野豬戰斧). Same pattern as the chapter-1 monsters (09za): stats from ch1Panel by level and
   role, moves from their elder kin; their battle pictures are Codex task AE (art/battle/chibi). */
ITEMS.wood = { n: '木材', mat: 1, price: 0, sell: 40, cat: '魔物素材', d: '樹樁怪身上掉下來的木頭。乾燥又結實，適合做木製的武器和樂器。' };
// [key, name, family, level, role, moves, material, look [base, hue, sat, light], dex]
const V12_MON = [
  ['meadowWolf', '野狼', 'beast', 7, 'fast', ['m_bite', 'm_howl', 'm_pounce', 'm_rend'], 'wolfPelt', ['wolf', 25, 0.55, 1.15], '晨霧道路上成群出沒的灰褐色野狼。狼王出現之後，牠們也變得大膽起來。'],
  ['creekCroc', '溪谷小鱷', 'aquatic', 10, 'tank', ['m_jaw', 'm_tailSlam', 'm_mudShot', 'm_scaleGuard'], 'crocHide', ['croc', 40, 0.8, 1.15], '躲在碧溪谷淺灘的小鱷魚。個子不大，咬合力卻一點也不輸大人。'],
  ['stumpling', '樹樁怪', 'plant', 4, 'tank', ['m_branchSlam', 'm_rootBind', 'm_mossArmor', 'm_tailSlam'], 'wood', ['rotTreant', 35, 1.1, 1.25], '被砍倒的樹留下的樹樁，吸了瘴氣以後長出腳走了起來。'],
  ['piglet', '小野豬', 'beast', 5, 'phys', ['m_tuskCharge', 'm_bite', 'm_scurry', 'm_warCry'], 'boarTusk', ['wildBoar', 15, 0.8, 1.2], '風車丘陵的小野豬。橫衝直撞的樣子跟長大的暴走野豬一模一樣。'],
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
