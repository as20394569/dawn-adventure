// 商店截圖 第 2 步：上方加標語帶、放進框裡，輸出 iOS 6.7 吋（1290×2796）和 Android（1080×1920）。用法：node tools/store_compose.js <截圖資料夾> <輸出資料夾>
// compose store screenshots: caption band on top + the game screen in a frame (no gamepad)
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright'); const fs = require('fs'); const path = require('path');
const DIR = process.argv[2], OUT = process.argv[3];
const SHOTS = [
  ['01', 's1', ['放學路上，', '掉進了異世界']],
  ['02', 's2', ['看懂預告，', '擋下頭目的大招']],
  ['03', 's3', ['10 個職業，', '各有自己的戰法']],
  ['04', 's4', ['天賦每層', '二選一']],
  ['05', 's5', ['用素材打造、', '強化自己的裝備']],
  ['06', 's6', ['繞遠路，', '就有收穫']],
];
const FORMATS = [ // [name, css w, css h, dsf, image width, caption font, band height]
  ['ios-6.7', 430, 932, 3, 400, 46, 318],
  ['android', 360, 640, 3, 296, 34, 196],
];
const html = (img, L, F) => { const [, w, h, , iw, fz, band] = F, ih = Math.round(iw * 256 / 176), top = band, side = (w - iw) / 2;
  return `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#0d1020}
  body{position:relative;font-family:"Noto Sans CJK TC","Noto Sans CJK HK",sans-serif;
    background-image:linear-gradient(180deg,rgba(110,231,210,.16),rgba(110,231,210,0) 46%),
      repeating-linear-gradient(0deg,transparent 0 15px,#121632 15px 16px),repeating-linear-gradient(90deg,transparent 0 15px,#121632 15px 16px)}
  .cap{position:absolute;left:0;right:0;top:0;height:${band}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(fz * 0.12)}px}
  .bar{width:${Math.round(fz * 1.1)}px;height:${Math.max(3, Math.round(fz * 0.1))}px;background:#6ee7d2;border-radius:2px;margin-bottom:${Math.round(fz * 0.32)}px}
  .l{font-weight:900;font-size:${fz}px;line-height:1.22;letter-spacing:.04em;color:#eef1f8;text-shadow:0 3px 0 #05060c,0 0 18px rgba(0,0,0,.6);white-space:nowrap}
  .l.b{color:#6ee7d2}
  .shot{position:absolute;left:${side}px;top:${top}px;width:${iw}px;height:${ih}px;border-radius:${Math.round(iw * 0.035)}px;overflow:hidden;
    box-shadow:0 0 0 3px #2a3150,0 0 0 5px rgba(110,231,210,.55),0 18px 40px rgba(0,0,0,.65)}
  .shot img{width:100%;height:100%;display:block;object-fit:cover;object-position:top}
  </style><div class="cap"><div class="bar"></div>${L.map((t, i) => `<div class="l${i === L.length - 1 && L.length > 1 ? ' b' : ''}">${t}</div>`).join('')}</div>
  <div class="shot"><img src="${img}"></div>`; };
(async () => { const b = await chromium.launch();
  for (const F of FORMATS) { const [name, w, h, dsf] = F; const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf }); fs.mkdirSync(path.join(OUT, name), { recursive: true });
    for (const [n, s, L] of SHOTS) { const f = path.join(DIR, '_' + name + n + '.html'); fs.writeFileSync(f, html(s + '.png', L, F)); await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(OUT, name, n + '.png') }); fs.unlinkSync(f); }
    await p.close(); }
  await b.close(); })();
