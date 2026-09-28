module.exports = async (api) => {
  const r = await api.ev(() => {
    const W = Object.entries(GEAR).filter(([k, g]) => g.slot === 'weapon').map(([k, g]) => [k, g.n, g.kind, g.t, g.elem || '', JSON.stringify(g.st), JSON.stringify(g.sp || {}), (g.fx || []).join('+'), g.price || ''].join('|'));
    const heroIds = new Set(); for (const c in SKILL_TREES) for (const n of SKILL_TREES[c]) heroIds.add(n[0]);
    const M = [...heroIds].map(id => { const m = MOVES[id]; if (!m) return id + ' MISSING'; const ex = Object.keys(m).filter(k => !['n', 'pow', 'cat', 't', 'acc', 'fx', 'd', 'pp', 'eff', 'prio'].includes(k)).map(k => k + '=' + JSON.stringify(m[k])).join(' '); return [id, m.n, m.cat, m.t, m.pow || 0, SKILL_MP[id], m.fx, JSON.stringify(m.eff || ''), ex, (m.d || '').slice(0, 40)].join('|'); });
    const mats = Object.entries(ITEMS).filter(([k, i]) => i.mat).map(([k, i]) => k + ':' + i.n + ':' + (i.price || ''));
    const cls = Object.entries(CLASSES).map(([k, c]) => k + '|' + c.n + '|t' + c.tier + '|' + (c.from || '') + '|' + JSON.stringify(c.st));
    const trees = Object.entries(SKILL_TREES).map(([k, t]) => k + ': ' + t.map(n => n[0]).join(','));
    return { W, M, mats, cls, trees, kinds: WEAPON_KINDS && Object.keys(WEAPON_KINDS).length, lvcap: typeof MAX_LV !== 'undefined' ? MAX_LV : '?', attrs: typeof ATTR_BASE !== 'undefined' ? ATTR_BASE : '', scale: Object.keys(SKILL_SCALE || {}).length };
  });
  const fs = require('fs'); fs.writeFileSync('/tmp/claude-0/-home-claude/1ac51525-de24-5872-9bf6-4fc024f0c0db/scratchpad/dump.json', JSON.stringify(r, null, 1));
  console.log(r.W.length, r.M.length, r.mats.length, r.kinds, r.lvcap, JSON.stringify(r.attrs));
};
