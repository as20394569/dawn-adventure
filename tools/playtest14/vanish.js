// hunt "monsters disappear mid-battle": every 2 frames compare the core (alive foes) with what the scene draws
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8'), MAPS_ = (process.env.MAPS || 'route').split(','), N = +(process.env.N || 3), CLS = (process.env.CLS || 'sw').split(','), KIND = process.env.KIND || 'wild', SP = process.env.SP, TANK = process.env.TANK !== '0', SHOTS = +(process.env.SHOTS || 3);
  let shots = 0; const all = [];
  const SNAPS = process.env.SNAP ? JSON.parse(fs.readFileSync(process.env.SNAP, 'utf8')).filter(x => !process.env.ONLY || process.env.ONLY.split(',').includes(x.id)) : null; const jobs = []; if (SNAPS) SNAPS.forEach((sn, k) => jobs.push([sn.cls, '-', k, sn])); else for (const cls of CLS) for (const MAP of MAPS_) for (let k = +(process.env.K0 || 0); k < N; k++) jobs.push([cls, MAP, k, null]);
  for (const [cls, MAP, k, sn] of jobs) {
    const info = await g.ev(([s, k, KIND, cls, SP, MAP, sn]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; G.Game.noV14 = false;
      let seed = 5000 + k * 97 + MAP.length * 13; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; Math.random = R;
      if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = cls; K.decks = {}; const D = KD.deck(st);
      if (sn) { K.hpPlus = sn.hpPlus || 0; K.decks[cls] = sn.deck.map(x => ({ id: x.replace('+', ''), up: /\+$/.test(x) ? 1 : 0 })); } else for (let i = 0; i < 8; i++) { const o = KD.offer(cls, i < 3 ? 'wild' : 'catch', 3, R); if (o.length) D.push({ id: o[0], up: 0 }); }
      st.hp = KD.maxHp(st); if (MAP !== '-') st.map = MAP; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      const ow = G.Game.scene, encs = ow.map.d.encounters || []; let cfg;
      if (sn) cfg = { sp: sn.sp || sn.id, lv: sn.lv, kind: sn.kind, id: sn.id }; else if (KIND === 'wild') { const enc = encs[k % Math.max(1, encs.length)]; if (!enc) return null; const r1 = rollEnc(enc), r2 = rollEnc(enc), r3 = rollEnc(enc); const n = k % 3; cfg = { sp: r1[0], lv: r1[1], kind: 'wild', extra: n ? [[r2[0], r2[1]], [r3[0], r3[1]]].slice(0, n) : 0 }; }
      else { const L = SP.split(','); const sp = L[k % L.length]; cfg = { sp, lv: SPECIES[sp].lv || st.lv, kind: KIND, id: sp }; }
      window.__fight = cfg; window.__bad = []; window.__n = 0; window.__cnt = {}; window.__dead = {}; window.__mx = {}; window.__TR = !!(typeof process === 'undefined' && 0); window.__TRo = []; window.__TRl = '';
      G.Game.autoPlay = () => null; ow.run(ow.battleScript(cfg)); return JSON.stringify(cfg); }, [save, k, KIND, cls, SP, MAP, sn]);
    if (!info) { all.push(cls + ' ' + MAP + ' no encounters'); continue; }
    if (process.env.TRACE) await g.ev(() => { window.__TR = true; }); if (process.env.KS) await g.ev(() => { window.__KS = {}; window.__KSd = {}; });
    for (let i = 0; i < 300; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle')) break; await g.ev(() => { if (__game.UI.stack.some(x => x.lines)) __game.press('a', 2, 2); else __game.step(4); }); }
    let r = null, shotNow = false;
    for (let i = 0; i < +(process.env.ITER || 9000); i++) {
      r = await g.ev(([TANK]) => { const G = __game, b = G.Game.scene;
        if (b.constructor.name === 'Battle') { window.__b = b; const c = b.core;
          if (TANK && c && c.byId.H && !b.__tank) { b.__tank = 1; c.byId.H.max.hp = 900; c.byId.H.res.hp = 900; }
          if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length && c.result) G.press('b', 2, 2); else G.step(+(window.__STEP || 2));
          window.__n++; let shot = false;
          if (c && !c.result && b.t > 90 && !b.cover) for (const u of c.units) { if (u.side === 'B' && !c.isUp(u)) { const v = b.views[u.id]; window.__dead = window.__dead || {}; if (!(u.id in window.__dead)) window.__dead[u.id] = b.t; if (v && !v.gone && v.alpha > 0.2 && b.t - window.__dead[u.id] > 400 && !window.__bad.some(x => x.key === u.id + ':ghost')) { window.__bad.push({ key: u.id + ':ghost', sp: u.sp, R: c.round }); shot = true; } }
            if (u.side !== 'B' || !c.isUp(u)) continue; const v = b.views[u.id]; const why = [];
            if (!v) why.push('noView'); else { if (v.gone) why.push('gone'); if (v.alpha < 0.35) why.push('alpha' + v.alpha.toFixed(2)); if (v.A && v.A.state === 'faint') why.push('faint');
              if (v.sink > (v.bbh || 48) * 0.8 && !(v.st && v.st.dive14)) why.push('sink' + Math.round(v.sink)); const X = v.x + v.off.x; if (X < -10 || X > 330) why.push('x' + Math.round(X)); if (Math.abs(v.off.y) > 60) why.push('offy' + Math.round(v.off.y));
              if (v.img && window.__n % 15 === 0) { try { const im = v.img, cx = im.getContext && im.getContext('2d'); if (cx) { const d = cx.getImageData(0, 0, im.width, im.height).data; let n = 0; for (let q = 3; q < d.length; q += 16) if (d[q] > 40) n++; if (n < 8) why.push('emptyImg'); } } catch (e) {} } }
            const kk = u.id + ':' + why.map(w => w.replace(/[\d.-]+$/, '')).join('|'); if (!why.length) { for (const q in window.__cnt) if (q.startsWith(u.id + ':')) delete window.__cnt[q]; } if (why.length && (window.__cnt[kk] = (window.__cnt[kk] || 0) + 1, window.__mx = window.__mx || {}, window.__mx[kk] = Math.max(window.__mx[kk] || 0, window.__cnt[kk])) === 25) { const key = u.id + ':' + why.join('|'); if (!window.__bad.some(x => x.key === key)) { window.__bad.push({ key, sp: u.sp || (u.data && u.data.sp), hp: u.res.hp, R: c.round, A: v && v.A && v.A.state, last: c.log.slice(-6).map(e => e.type + (e.payload && e.payload.skill ? ':' + e.payload.skill : '') + (e.payload && e.payload.status ? ':' + e.payload.status : '')).join(' ') }); shot = true; } } }
          if (window.__TR) { const line = c.round + ' ' + c.units.filter(u => u.side === 'B').map(u => { const v = b.views[u.id]; return u.id + (c.isUp(u) ? '' : 'x') + ':' + (v ? (v.gone ? 'G' : '') + v.alpha.toFixed(1) : '-'); }).join(' ') + ' ev=' + b.cur + '/' + c.log.length + ':' + ((c.log[b.cur - 1] || {}).type || '') + ':' + (((c.log[b.cur - 1] || {}).payload || {}).skill || '') + ' ui=' + __game.UI.stack.map(w => w.constructor.name).join() ; if (line !== window.__TRl) { window.__TRl = line; window.__TRo.push(b.t + ' ' + line); } }
          if (0) {}
          if (window.__KS) { for (const u of c.units) if (u.side === 'B' && !c.isUp(u) && !window.__KS[u.id]) window.__KS[u.id] = b.t; for (const id in window.__KS) { const d = b.t - window.__KS[id]; if ([2, 20, 40, 60, 80].includes(d) && !window.__KSd[id + d]) { window.__KSd[id + d] = 1; return { ks: id + '_' + d }; } } }
          return shot ? { shot: 1 } : null; }
        const c = window.__b && window.__b.core; return { out: c && c.result ? c.result.outcome : '?', R: c ? c.round : 0, bad: window.__bad.map(x => ({ ...x, maxFrames: (window.__mx || {})[x.key.replace(/[\d.-]+$/, '')] * (+(window.__STEP || 2)) })), tr: window.__TRo }; }, [TANK]);
      if (r && r.ks) { if (shots < SHOTS) { shots++; await g.shot('ks_' + r.ks); } r = null; continue; }
      if (r && r.shot) { if (shots < SHOTS) { shots++; await g.shot('bug_' + shots); g.log('SHOT bug_' + shots); } r = null; continue; }
      if (r) break; }
    if (!r) r = { out: 'stuck', bad: await g.ev(() => window.__bad) };
    all.push(cls + ' ' + MAP + ' ' + info + ' → ' + r.out + ' R' + r.R + (process.env.TRACE && r.tr ? '\n   TR ' + r.tr.join('\n   TR ') : '') + (r.bad.length ? '\n   BAD ' + r.bad.map(x => JSON.stringify(x)).join('\n   BAD ') : ''));
  }
  g.log(all.join('\n'));
};
