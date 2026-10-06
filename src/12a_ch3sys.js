/* ===================== v12.70 第三章正篇・第一批：等級上限 Lv60、T8 裝備（〈曙光冒險-第三章正篇企劃〉） =====================
   - 等級上限 50 → 60（07b 的 LV_MAX13）。鍛冶上限 Lv52 起到 T8（09n smithRank）。
   - T8 底裝 19 件（r9w 的 WNAME11／ANAME11／SNAME11／NEW11，數值照 T1〜T7 的成長延伸一格）。打造另外要：武器 星之碎片×1、防具 星塵×2、盾 裂界碎片×1。
   - 外觀先借 T7；武器的圖換成海的顏色（藍綠）。 */
// the T8 shield's drawn look (the Codex shield art has no T8 picture yet)
if (typeof SHIELDS !== 'undefined') SHIELDS.tideShield13 = ['潮紋大盾', 8, {}, 17, {}, null, ['#123a5a', '#2f78a8', '#a8f0ff'], ''];
// sea-coloured T8 weapons: the T7 picture with the hue turned toward blue-green
const T8W13 = ['tideSword13', 'waveDagger13', 'surgeAxe13', 'tridentSpear13', 'coralFist13', 'deepStaff13', 'tideTome13', 'merHarp13', 'vortexGun13'];
function seaTint13(im) { const c = mkCanvas(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]); if (s < 0.12) continue; const [r, g, b] = hex2rgb(hsl2hex(185 + (h % 40) - 20, Math.min(1, s * 1.1), l)); d[i] = r; d[i + 1] = g; d[i + 2] = b; }
  x.putImageData(id, 0, 0); c.ok = true; return c; }
if (typeof WEAPON_PX !== 'undefined') for (const k of T8W13) { const src = WEAPON_PX[k]; if (!src) continue;
  const done = () => { try { WEAPON_PX[k] = seaTint13(src); } catch (e) { } };
  if (src.ok || (src.complete && src.naturalWidth) || src.getContext) done(); else src.addEventListener('load', () => setTimeout(done, 0)); }
