const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 700, height: 1000 } });
  p.on('console', m => console.log(m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file:///home/claude/dawn/tools/preview.html'); await p.waitForTimeout(300);
  const d = await p.evaluate(() => document.getElementById('c').toDataURL()); require('fs').writeFileSync('/home/claude/dawn/build/mon3x.png', Buffer.from(d.split(',')[1], 'base64')); await b.close(); })();
