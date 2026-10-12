/* ===================== v12.142 前期地圖加礦脈 =====================
   玩家 2026-10-12：「金屬前期獲取困難」→ 選「前期地圖加礦脈」。
   查到：Lv2〜11 的六張野外地圖（晨霧道路・風鈴牧草地・風車丘陵・碧溪谷・霧沼小徑・迷霧森林）沒有任何金屬來源（只有 Lv10 的鼴鼠穴有一個礦脈），
   要到 Lv12 以後的落日峽谷・晨霧洞・廢棄礦坑才拿得到硬石；可是劍・斧・重甲・盾打造時主要吃金屬。
   現在這六張各加 1〜2 個礦脈（硬石 1〜2 個，10% 多一個水晶碎片，跟其他礦脈一樣），共 9 個：
   位置用程式挑的：周圍 8 格都能走（不會擋路）、在地圖的主要區域、離 NPC・道具・其他採集點最遠。
   碧溪谷原本那個「硬石」採集點補上礦脈的外觀（原本沒寫種類）。素材說明（從哪裡拿）也把新的礦脈排在最前面。 */
const ORE20 = { route: [[8, 14], [25, 15]], meadow15: [[12, 3]], windHills: [[22, 33], [39, 15]], jadeCreek: [[12, 20]], marsh15: [[4, 8]], forest: [[8, 5], [26, 18]] };
{ for (const id in ORE20) { const d = MAPS[id]; if (!d) { bvErr('ore20', 'map ' + id); continue; } d.gathers = d.gathers || [];
    ORE20[id].forEach(([x, y], i) => { if (d.rows[y] && SOLID.has(d.rows[y][x])) { bvErr('ore20', id + ' solid ' + x + ',' + y); return; } d.gathers.push({ id: 'gore20_' + id + '_' + i, x, y, kind: 'ore', mat: 'stone' }); }); }
  const jc = MAPS.jadeCreek && (MAPS.jadeCreek.gathers || []).find(g => g.mat === 'stone' && !g.kind); if (jc) jc.kind = 'ore';
  if (typeof MAT_SRC !== 'undefined') { const L = MAT_SRC.stone || (MAT_SRC.stone = []), early = ['晨霧道路', '風車丘陵', '碧溪谷', '迷霧森林'].map(n => '採集・' + n);
    MAT_SRC.stone = early.concat(L.filter(t => !early.includes(t))); } }
