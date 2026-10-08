// draw card faces large: env IDS (comma list, id or id+ for upgraded), SIZES (wxh list), K (zoom), OUT
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2400, height: 2400 } }); await p.goto('file:///home/claude/dawn/dist/test.html'); await p.waitForTimeout(700);
  const ids = (process.env.IDS || 'mg_frost').split(','), sizes = (process.env.SIZES || '30x56,38x54,60x110').split(',').map(s => s.split('x').map(Number)), K = +(process.env.K || 8);
  if (process.env.PRE) await p.evaluate(src => (new Function(src))(), process.env.PRE);
  const url = await p.evaluate(([ids, sizes, K, opt]) => { const pad = 6, colW = sizes.reduce((a, [w]) => a + w + pad, pad), rowH = Math.max(...sizes.map(([, h]) => h)) + pad;
    const c = document.createElement('canvas'); c.width = colW * K; c.height = (rowH * ids.length + pad) * K; const x = c.getContext('2d'); x.fillStyle = '#05060a'; x.fillRect(0, 0, c.width, c.height); x.scale(K, K); x.imageSmoothingEnabled = false;
    ids.forEach((id0, r) => { const up = /\+$/.test(id0) ? 1 : 0, id = id0.replace(/\+$/, ''); let X = pad; for (const [w, h] of sizes) { KD.drawCard(x, { id, up }, X, pad + r * rowH, w, h, JSON.parse(opt)); X += w + pad; } });
    return c.toDataURL(); }, [ids, sizes, K, process.env.OPT || '{}']);
  require('fs').writeFileSync(process.env.OUT, Buffer.from(url.split(',')[1], 'base64')); await b.close(); })();
