// export back-view doll data for armor overlays
module.exports = async (g) => {
  const out = await g.ev(() => {
    const base = { head: null, body: 'uniform', feet: 'school', weapon: null };
    const up = (L, f) => heroFramesLook(L).up[f];
    const px = c => Array.from(c.getContext('2d').getImageData(0, 0, 16, 22).data);
    const rowsDiff = (a, b) => { const r = []; for (let y = 0; y < 22; y++) { let d = 0; for (let x = 0; x < 16; x++) { const i = (y * 16 + x) * 4; if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) d++; } if (d) r.push(y); } return r; };
    const f0 = px(up(base, 0)), f1 = px(up(base, 1));
    const res = { stepDiffRows: rowsDiff(f0, f1) };
    const probe = { head: GEAR.knightHelm.look, body: 'royal', feet: 'knight' };
    for (const s of ['head', 'body', 'feet']) { const L = { ...base, [s]: probe[s] }; res[s + 'Rows0'] = rowsDiff(f0, px(up(L, 0))); res[s + 'Rows1'] = rowsDiff(f1, px(up(L, 1))); }
    // all armor items: current back view (frame 0/1) + front view (down 0)
    const items = [];
    for (const k of Object.keys(GEAR)) { const G = GEAR[k]; if (!['head', 'body', 'feet'].includes(G.slot) || !G.look) continue; const L = { ...base, [G.slot]: G.look };
      const pal = G.slot === 'head' ? (HEAD_PAL[G.look[1]] || {}) : G.slot === 'body' ? ((BODY_LOOKS[G.look] || [])[1] || {}) : (FEET_PAL[G.look] || {}); items.push({ key: k, slot: G.slot, n: G.n, t: G.t, d: G.d || '', look: G.look, pal, shape: G.slot === 'body' ? (BODY_LOOKS[G.look] || ['tunic'])[0] : G.slot === 'head' ? G.look[0] + (G.look[2] ? '+' + G.look[2] : '') : 'boots', back0: up(L, 0).toDataURL(), back1: up(L, 1).toDataURL(), front: heroFramesLook(L).down[0].toDataURL() }); }
    const acc = Object.keys(GEAR).filter(k => GEAR[k].slot === 'acc').map(k => ({ key: k, n: GEAR[k].n, t: GEAR[k].t, d: GEAR[k].d || '' }));
    const bare = { ...base, body: 'uniform' };
    res.base0 = up(base, 0).toDataURL(); res.base1 = up(base, 1).toDataURL(); res.items = items; res.acc = acc;
    return JSON.stringify(res);
  });
  require('fs').writeFileSync('build/armor_export.json', out); const o = JSON.parse(out); g.log('stepDiff', o.stepDiffRows, 'head', o.headRows0, o.headRows1, 'body', o.bodyRows0, o.bodyRows1, 'feet', o.feetRows0, o.feetRows1, 'items', o.items.length, 'acc', o.acc.length);
};
