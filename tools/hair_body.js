const names = Object.keys(HAIR);
const c = document.getElementById('c'); const RH = 150; c.width = 640; c.height = RH * names.length + 10; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
x.fillStyle = '#8fc47a'; x.fillRect(0, 0, c.width, c.height);
function buildSet(head) {
  const rows = {}; for (const d of ['down', 'up', 'left']) rows[d] = head[d].concat(HERO_ROWS[d].slice(13));
  const b = (dir, legs, bob) => { const body = rows[dir]; const L = LEGS[legs]; const out = new Array(22).fill('................'); const off = bob ? -1 : 0; for (let i = 0; i < body.length; i++) if (i + off >= 0) out[i + off] = body[i]; const ls = 18 + off; for (let i = 0; i < L.length; i++) if (ls + i < 22) out[ls + i] = L[i]; return spriteFrom(out.slice(0, 22), HERO_PAL); };
  const f = {}; for (const d of ['down', 'up']) f[d] = [b(d, 'stand', 0), b(d, 'stepL', 1), b(d, 'stand', 0), b(d, 'stepR', 1)];
  f.left = [b('left', 'sideStand', 0), b('left', 'sideStepA', 1), b('left', 'sideStand', 0), b('left', 'sideStepB', 1)]; f.right = f.left.map(flipCanvas);
  return f;
}
const orig = Hero.frames.up;
names.forEach((n, i) => {
  const H = HAIR[n]; for (const d of ['down', 'up', 'left']) H[d].forEach((r, j) => { if (r.length !== 16) console.error('LEN', n, d, j, r, r.length); });
  const f = buildSet(H); const y = 6 + i * RH;
  Font.draw(x, n, 4, y - 2, '#fff', '#333');
  ['down', 'left', 'right', 'up'].forEach((d, k) => x.drawImage(f[d][0], 0, 0, 16, 22, 4 + k * 84, y + 14, 80, 110));
  // walk frames small
  ['down', 'up'].forEach((d, k) => f[d].forEach((fr, q) => x.drawImage(fr, 0, 0, 16, 22, 4 + q * 34 + k * 140, y + 126 - 0, 16 * 1, 22 * 1)));
  Hero.frames.up = f.up; for (const kk in heroBattleCache) delete heroBattleCache[kk];
  x.drawImage(heroBattleImg(0, 'woodSword'), 346, y + 14, 144, 138);
  x.drawImage(heroBattleImg(1, 'ironSword'), 494, y + 14, 144, 138);
});
Hero.frames.up = orig;
