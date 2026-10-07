// interactive driver: one browser kept open; HTTP commands step the game like a player (taps on the canvas, keys), screenshots of the whole phone screen
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1, hasTouch: false });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + path.resolve(process.argv[2] || '/home/claude/dawn/dist/test.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { __game.Game.paused = true; });
  const cvsRect = () => p.evaluate(() => { const c = document.querySelector('canvas#screen') || document.querySelector('canvas'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cw: c.width, ch: c.height, W: typeof W !== 'undefined' ? W : 176 }; });
  const step = n => p.evaluate(n => __game.step(n), n);
  const srv = http.createServer(async (req, res) => { const u = new URL(req.url, 'http://x'), q = Object.fromEntries(u.searchParams); let body = ''; for await (const c of req) body += c;
    try { let out = null;
      if (u.pathname === '/ev') out = await p.evaluate(src => { const f = new Function('return (' + src + ')'); const v = f(); return typeof v === 'function' ? v() : v; }, body);
      else if (u.pathname === '/step') out = await step(+q.n || 1);
      else if (u.pathname === '/tap') { const r = await cvsRect(), sc = r.w / r.W; await p.mouse.click(r.x + (+q.x) * sc, r.y + (+q.y) * sc); await step(+q.after || 8); out = 'tapped'; }
      else if (u.pathname === '/key') { await p.evaluate(([k, n]) => { const G = __game; G.Input.set(k, true); G.step(n); G.Input.set(k, false); G.step(1); }, [q.k, +q.n || 2]); await step(+q.after || 6); out = 'key'; }
      else if (u.pathname === '/shot') { await step(0); await p.screenshot({ path: path.join(OUT, (q.name || 's') + '.png') }); out = q.name; }
      else if (u.pathname === '/rect') out = await cvsRect();
      else if (u.pathname === '/errs') { out = errs.splice(0); }
      else if (u.pathname === '/quit') { res.end('bye'); await b.close(); process.exit(0); }
      res.end(JSON.stringify(out));
    } catch (e) { res.end('ERR ' + e.message); } });
  srv.listen(+(process.env.PORT || 9333), '127.0.0.1', () => console.log('ready'));
})();
