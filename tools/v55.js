// export: hero back doll (no weapon), every weapon's current in-hand pixels (16x22 box at doll (12,1)), weapon data for the Codex spec
module.exports = async (g) => {
  const out = await g.ev(() => {
    const W = Object.keys(GEAR).filter(k => GEAR[k].slot === 'weapon'), base = { head: null, body: 'uniform', feet: 'school', weapon: null };
    const nat = L => { const big = heroBattleImgLook(0, L), c = mkCanvas(28, 24); c.getContext('2d').drawImage(big, 0, 0, 28, 24); return c; };
    const doll = nat(base), items = [];
    for (const k of W) { const L = { ...base, weapon: GEAR[k].look }, c = nat(L), box = mkCanvas(16, 22), bx = box.getContext('2d');
      // weapon-only pixels: differ from the empty-handed doll
      const a = c.getContext('2d').getImageData(0, 0, 28, 24).data, b = doll.getContext('2d').getImageData(0, 0, 28, 24).data, o = bx.createImageData(16, 22);
      for (let y = 0; y < 22; y++) for (let x = 0; x < 16; x++) { const i = ((y + 1) * 28 + (x + 12)) * 4, j = (y * 16 + x) * 4; if (a[i + 3] && (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3])) { o.data[j] = a[i]; o.data[j + 1] = a[i + 1]; o.data[j + 2] = a[i + 2]; o.data[j + 3] = 255; } }
      bx.putImageData(o, 0, 0);
      items.push({ key: k, n: GEAR[k].n, type: GEAR[k].look[0], pal: WPN_PAL[GEAR[k].look[1]] || {}, tier: GEAR[k].t, kind: GEAR[k].kind, d: GEAR[k].d || '', cur: box.toDataURL(), withHero: c.toDataURL() }); }
    return JSON.stringify({ doll: doll.toDataURL(), items });
  });
  require('fs').writeFileSync('build/weapons_export.json', out); g.log('ok', out.length);
};
