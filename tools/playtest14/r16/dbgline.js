const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 630 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(400);
  await p.evaluate((s) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; const K = KD.state(st); K.catchup = 0; K.cls = 'mg'; K.decks = {}; KD.deck(st);
    st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; for (const k in st.bag) if (ITEMS[k] && /重生/.test(ITEMS[k].n)) delete st.bag[k]; startOverworld(); delete st.k14.g16msg; G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
    window.__shotReady = 0; G.Game.autoPlay = b => { window.__shotReady = 1; return { k: 'hold' }; };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'wolf', lv: 20, kind: 'wild', noCard: 1, extra: [] })); }, save);
  for (let i = 0; i < 80; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => window.__shotReady)) break; }
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const out = []; const P = CanvasRenderingContext2D.prototype, Y0 = +((H - 38).toFixed(0)); const hit = (y, h, w) => w > 60 && y <= Y0 + 1 && y + h >= Y0 - 1 && h < 6;
    const o = { fr: P.fillRect, sr: P.strokeRect };
    P.fillRect = function (x, y, w, h) { if (hit(y, h, w)) out.push(['fill', x, y, w, h, this.fillStyle, new Error().stack.split('\n').slice(2, 6).join(' | ')]); return o.fr.call(this, x, y, w, h); };
    P.strokeRect = function (x, y, w, h) { if (hit(y, 1, w) || hit(y + h, 1, w)) out.push(['stroke', x, y, w, h, this.strokeStyle, new Error().stack.split('\n').slice(2, 6).join(' | ')]); return o.sr.call(this, x, y, w, h); };
    window.__dbgOut = out; window.__dbgRestore = () => { P.fillRect = o.fr; P.strokeRect = o.sr; }; return [H, Y0]; });
  await p.waitForTimeout(100); const out = await p.evaluate(() => { window.__dbgRestore(); return window.__dbgOut.slice(0, 12); });
  console.log(JSON.stringify(r)); for (const l of out) console.log(JSON.stringify(l).slice(0, 600)); await b.close(); })();
