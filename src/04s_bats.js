/* ===================== v20.7 bats are bats (playtest: 坑道蝠 looked like a bird and dropped feathers) =====================
   - Codex redraws 坑道蝠 / 洞窟飛影 / 水晶蝠 as bat chibis (task I → art/battle/chibi/mineBat_*, caveBat_*, crystalBat_*).
   - Bats drop 蝙蝠翼膜 instead of 羽毛, and use bat moves (吸血・超音波・尖嘯・俯衝) instead of 啄擊／羽毛旋風.
   - 蝙蝠翼膜 has a use: the smith makes 夜翼斗篷 (a light cloak with evasion) from it. */
Object.assign(ITEMS, { batWing: { n: '蝙蝠翼膜', mat: 1, price: 0, sell: 18, cat: '魔物素材', d: '蝙蝠薄薄的翼膜，又輕又韌。可以做成斗篷。' } });
Object.assign(SPECIES.mineBat, { mat: 'batWing', learn: [[1, 'm_leechBite'], [1, 'm_screech'], [1, 'm_sonic'], [1, 'm_dive']] });
Object.assign(SPECIES.caveBat, { mat: 'batWing', learn: [[1, 'm_dive'], [1, 'm_leechBite'], [1, 'm_sonic'], [10, 'm_lullaby']] });
Object.assign(SPECIES.crystalBat, { learn: [[1, 'm_dive'], [1, 'm_sonic'], [1, 'm_leechBite']] });
Object.assign(GEAR, { batCloak: { n: '夜翼斗篷', slot: 'body', t: 3, st: { def: 4, spd: 4, spe: 3 }, sp: { eva: 5 }, d: '用蝙蝠翼膜縫成的輕薄斗篷。在黑暗裡幾乎看不見。', kind: '輕裝', look: 'batCloak' } });
BODY_LOOKS.batCloak = ['cloak', { X: '#3a2e48', x: '#241c30', Y: '#5a4a70', Z: '#1a1420', z: '#b8a0d8', W: '#c8c0d8', D: '#6a5a88', d: '#3a2e48' }];
RECIPES.push({ out: 'batCloak', mats: { batWing: 4, crystal: 1 }, gold: 900 });
