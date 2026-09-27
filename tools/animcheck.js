// Animation stability check: node tools/play.js tools/animcheck.js [species...]
// For every monster (and the hero) it renders 48 idle frames and measures, per frame, the sprite silhouette:
//   foot   = lowest opaque row (must stay put: drift ≤ 1px)
//   cx     = horizontal centre of mass (idle sway ≤ 2px)
//   size   = silhouette area change (≤ 25%)
//   flip   = frame looks more like the MIRROR of frame 0 than frame 0 itself (must be 0 — facing must never change)
// It also writes onion-skin sheets to build/anim/<species>.png (all idle frames overlaid) so drift is visible at a glance.
module.exports = async (g) => {
  require('fs').mkdirSync('build/anim', { recursive: true });
  const only = process.argv.slice(3); const species = only.length ? only : await g.ev(() => Object.keys(SPECIES));
  const start = sp => g.ev(sp => { const G = __game; G.newGameState('測'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); applyStartClass('swordsman'); st.lv = 30; const s = G.heroStats(); st.hp = s.hp; st.mp = s.mp; st.map = 'route'; st.x = 10; st.y = 20; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.run(ow.battleScript({ sp, lv: 20, kind: SPECIES[sp].boss ? 'boss' : SPECIES[sp].elite ? 'elite' : 'wild' })); G.Game.autoPlay = null; }, sp);
  const waitIdle = async () => { for (let i = 0; i < 800; i++) { const ok = await g.ev(() => { const b = __game.Game.scene; return b.constructor.name === 'Battle' && __game.UI.stack.some(w => w.items); }); if (ok) return true; await g.ev(() => __game.UI.stack.some(w => w.lines && w.state === 'end') ? __game.press('a', 2, 2) : __game.step(2)); } return false; };
  // silhouette of one actor = pixels that change when that actor is hidden
  const measure = (who) => g.ev(who => {
    const G = __game, b = G.Game.scene, cv = document.getElementById('screen'), S = cv.width / 176;
    const box = who === 'foe' ? [24, 40, 152, b.constructor.name === 'Battle' ? 175 : 175] : [0, 110, 176, 205];
    b.shake = 0; b.fx = []; G.Game.shake = 0; const grab = () => { G.step(0); const x = cv.getContext('2d'); return x.getImageData(Math.round(box[0] * S), Math.round(box[1] * S), Math.round((box[2] - box[0]) * S), Math.round((box[3] - box[1]) * S)); };
    const a = grab(); const keep = who === 'foe' ? b.alphaF : b.heroX; if (who === 'foe') b.alphaF = 0; else b.heroX = -400; const bg = grab(); if (who === 'foe') b.alphaF = keep; else b.heroX = keep;
    const w = a.width, h = a.height, m = new Uint8Array(w * h); let n = 0, sx = 0, foot = -1, top = h, l = w, r = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, d = Math.abs(a.data[i] - bg.data[i]) + Math.abs(a.data[i + 1] - bg.data[i + 1]) + Math.abs(a.data[i + 2] - bg.data[i + 2]); if (d > 30) { m[y * w + x] = 1; n++; sx += x; if (y > foot) foot = y; if (y < top) top = y; if (x < l) l = x; if (x > r) r = x; } }
    return { S, w, h, n, cx: n ? sx / n / S : 0, foot: foot / S, top: top / S, l: l / S, r: r / S, mask: Array.from(m).join('') };
  }, who);
  const iou = (A, B, w, mirror) => { let i = 0, u = 0; const h = A.length / w; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = A[y * w + x] === '1', bx = mirror ? w - 1 - x : x, bb = B[y * w + bx] === '1'; if (a && bb) i++; if (a || bb) u++; } return u ? i / u : 1; };
  const report = [];
  const run = async (name, who) => {
    const F = []; for (let k = 0; k < 48; k++) { await g.ev(() => __game.step(1)); F.push(await measure(who)); }
    const f0 = F[0]; let footD = 0, cxD = 0, sizeD = 0, flips = 0;
    // mirror check around the silhouette's own centre: shift frame 0 so both are centred before comparing
    for (const f of F) { footD = Math.max(footD, Math.abs(f.foot - f0.foot)); cxD = Math.max(cxD, Math.abs(f.cx - f0.cx)); sizeD = Math.max(sizeD, Math.abs(f.n - f0.n) / Math.max(1, f0.n)); const same = iou(f0.mask, f.mask, f0.w, false), mir = iou(f0.mask, f.mask, f0.w, true); if (mir > same + 0.1) flips++; }
    const ok = footD <= 1 && cxD <= 2 && sizeD <= 0.25 && flips === 0;
    report.push((ok ? 'OK  ' : 'FAIL') + ' ' + name.padEnd(14) + ' foot±' + footD.toFixed(1) + 'px  cx±' + cxD.toFixed(1) + 'px  size±' + Math.round(sizeD * 100) + '%  flips ' + flips);
    // onion skin: overlay every 6th frame's silhouette in a different colour
    await g.ev(([F, name]) => { const f0 = F[0], c = document.createElement('canvas'); c.width = f0.w; c.height = f0.h; const x = c.getContext('2d'), id = x.createImageData(f0.w, f0.h); const cols = [[255, 80, 80], [80, 200, 255], [120, 255, 120], [255, 220, 80], [220, 120, 255], [255, 255, 255], [255, 150, 60], [60, 255, 220]];
      F.filter((_, i) => i % 6 === 0).forEach((f, k) => { const [R, G2, B] = cols[k % cols.length]; for (let i = 0; i < f.mask.length; i++) if (f.mask[i] === '1') { id.data[i * 4] = Math.min(255, id.data[i * 4] + R / 3); id.data[i * 4 + 1] = Math.min(255, id.data[i * 4 + 1] + G2 / 3); id.data[i * 4 + 2] = Math.min(255, id.data[i * 4 + 2] + B / 3); id.data[i * 4 + 3] = 255; } });
      x.putImageData(id, 0, 0); window.__onion = c.toDataURL(); }, [F, name]);
    const d = await g.ev(() => window.__onion); require('fs').writeFileSync('build/anim/' + name + '.png', Buffer.from(d.split(',')[1], 'base64'));
  };
  for (const sp of species) { await start(sp); if (!(await waitIdle())) { report.push('SKIP ' + sp + ' (no idle state)'); continue; } await run(sp, 'foe'); if (sp === species[0]) await run('hero', 'hero'); }
  g.log(report.join('\n')); g.log(report.filter(r => r.startsWith('FAIL')).length ? 'ANIMCHECK: FAIL' : 'ANIMCHECK: PASS');
};
