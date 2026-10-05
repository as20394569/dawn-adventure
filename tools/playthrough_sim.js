// 完整走一輪（經驗・金錢・素材的流量）：照地圖等級順序前進，每張地圖第一次經過打掉 K 成的魔物，打得到的菁英・頭目就打。
// 輸出：每隻菁英・頭目到達時的等級（和牠的等級比）、到那裡為止的戰鬥數、要補練幾場；每個打造階級的錢・點數夠不夠。
module.exports = async (g) => {
  await g.step(20);
  const K = +(process.env.K || 0.6), SIDE = !!process.env.SIDE, RUNS = +(process.env.RUNS || 20), EXPM = +(process.env.EXPM || 1);
  await g.ev(a => { window.__GV = a[0]; window.__CP = a[1]; window.__LOWX = a[2]; window.__VM = a[3]; window.__TP = a[4]; }, [+(process.env.GV || 0.8), +(process.env.CP || 15), +(process.env.LOWX || 0), +(process.env.VM || 1), +(process.env.TP || 0)]);
  const res = await g.ev(([K, SIDE, RUNS, EXPM]) => {
    const st0 = Game.st; const out = { spots: {}, tiers: {}, runs: RUNS };
    const mainMaps = Object.keys(MAPS).filter(id => { const d = MAPS[id]; return (d.encounters || []).length && !/^rift|starShrine/.test(id) && (SIDE || !/^cave6_/.test(id)); });
    const lvRange = id => { let lo = 99, hi = 0; for (const e of MAPS[id].encounters) for (const r of e.table || []) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2]); } return [lo, hi]; };
    const roamN = id => { const d = MAPS[id]; let grass = 0; (d.rows || []).forEach(r => { for (const c of r) if (c === '#') grass++; }); const enc = d.encounters, rate = enc.reduce((a, e) => a + e.rate, 0) / enc.length; return grass ? Math.max(3, Math.min(18, Math.round(grass * rate / 1.5 * (d.roamMul12 || 1)))) : 7; };
    const GV = +(window.__GV || 0.8), gatherPts = id => { let p = 0; for (const n of MAPS[id].gathers || []) { const K0 = GATHER_KINDS[n.kind]; if (!K0 || !MATCAT11[K0[1]]) continue; p += (K0[2][0] + K0[2][1]) / 2 * (matVal12(K0[1]) + (+(window.__TP || 0))); } return p * GV; };
    const maps = []; for (const id of mainMaps) { const E = MAPS[id].encounters, n = roamN(id); E.forEach((e, i) => { let lo = 99, hi = 0; for (const r of e.table || []) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2]); } maps.push({ id, enc: e, lv: [lo, hi], n: n / E.length, gp: i === 0 ? gatherPts(id) : 0 }); }); }
    maps.sort((a, b) => a.lv[0] - b.lv[0] || a.lv[1] - b.lv[1]);
    const spots = FOE_SPOTS.filter(s => !/^rift|starShrine/.test(s.map)).slice().sort((a, b) => a.lv - b.lv);
    const expNeed = lv => expForLevel(lv + 1);
    for (let run = 0; run < RUNS; run++) {
      let L = 1, exp = expForLevel(1), gold = 300, pts = 0, battles = 0, tierDone = 1; const done = new Set();
      const CP = +(window.__CP || 12), VM = +(window.__VM || 1), TP = +(window.__TP || 0), LX = +(window.__LOWX ?? 0), lowx = l => LX ? (l < 15 ? LX : l < 19 ? LX + (1 - LX) * (l - 14) / 5 : 1) : (typeof expLow13 === 'function' ? expLow13(l) : 1);
      const gain = x => { exp += x; while (L < 50 && exp >= expNeed(L)) L++; };
      const wild = (id, enc0) => { const d = MAPS[id], enc = enc0 || pick(d.encounters), row = rollEnc(enc); if (!row) return; const sp = SPECIES[row[0]]; if (!sp) return;
        const pack = L >= 8 && chance(0.12) ? rnd(2, 3) : 1, champ = L >= 8 && pack === 1 && chance(0.04);
        let e = 0, gg = 0, mp = 0; for (let i = 0; i < pack; i++) { const lv = rnd(row[1], row[2]); e += Math.max(1, Math.floor((sp.exp || 10) * lv / 5 * (pack > 1 ? 1.25 : 1) * expScale(L, lv))); gg += Math.floor((sp.gold || 0) * lv * V81_GOLD(lv)); mp += sp.mat && MATCAT11[sp.mat] ? matVal12(sp.mat) + TP : 0; }
        e = Math.max(1, Math.round(e * ROAM_EXP12 * lowx(L))); if (champ) { e *= 2; gg *= 2; mp *= 3; } gain(e * EXPM); gold += gg; pts += mp * VM; battles++; };
      const boss = s => { const sp = SPECIES[s.sp] || {}; const e = Math.max(1, Math.floor((sp.exp || 10) * s.lv / 5 * 1.5 * expScale(L, s.lv))); const O = out.spots[s.sp + '@' + s.map] || (out.spots[s.sp + '@' + s.map] = { n: sp.n || s.sp, lv: s.lv, kind: s.kind, map: s.map, arr: 0, bat: 0, need: 0 });
        O.arr += L; O.bat += battles;
        // how many more battles on this map to be at the monster's level − 1
        let need = 0; const sv = [L, exp, gold, pts, battles]; while (L < s.lv - 1 && need < 300) { wild(s.map in MAPS && (MAPS[s.map].encounters || []).length ? s.map : maps.filter(m => m.lv[0] <= s.lv).slice(-1)[0].id); need++; } [L, exp, gold, pts, battles] = sv; O.need += need;
        gain(e * EXPM * lowx(L)); gold += s.kind === 'boss' ? 1000 : Math.floor((sp.gold || 0) * s.lv); pts += 2 * VM * (sp.mat && MATCAT11[sp.mat] ? matVal12(sp.mat) + TP : 0); };
      const craftCheck = () => { const t = Math.min(7, 2 + Math.floor(Math.max(0, L - 4) / 6)); while (tierDone < t) { tierDone++; const T = out.tiers[tierDone] || (out.tiers[tierDone] = { lv: 0, gold: 0, pts: 0, okG: 0, okP: 0, n: 0, pcs: 0 }); const cg = 500 * tierDone, cp = 75 * tierDone;
          T.lv += L; T.gold += gold; T.pts += pts; T.n++; if (gold >= cg) T.okG++; if (pts >= cp) T.okP++; let pcs = 0; while (pcs < 5 && pts >= CP * tierDone && gold >= 100 * tierDone) { pts -= CP * tierDone; gold -= 100 * tierDone; pcs++; } T.pcs += pcs; } };
      for (const m of maps) {
        const fights = Math.round(m.n * K); for (let i = 0; i < fights; i++) { wild(m.id, m.enc); craftCheck(); } pts += m.gp * VM;
        // elites/bosses unlocked by now (their level within reach of this map's top level)
        for (const s of spots) { if (done.has(s)) continue; if (s.lv <= m.lv[1] + 1) { boss(s); done.add(s); craftCheck(); } }
      }
      for (const s of spots) if (!done.has(s)) { boss(s); done.add(s); }
      out.final = (out.final || 0) + L; out.totalBattles = (out.totalBattles || 0) + battles;
    }
    Game.st = st0; return out; }, [K, SIDE, RUNS, EXPM]);
  const R = res.runs, rows = Object.values(res.spots).sort((a, b) => a.lv - b.lv);
  g.log('K=' + K + ' SIDE=' + SIDE + ' EXPM=' + EXPM + '  總戰鬥 ' + Math.round(res.totalBattles / R) + '  最後等級 ' + (res.final / R).toFixed(1));
  for (const o of rows) g.log((o.kind === 'boss' ? '頭' : '菁') + ' ' + o.n + ' Lv' + o.lv + ' | 到達 Lv' + (o.arr / R).toFixed(1) + ' (差 ' + (o.arr / R - o.lv).toFixed(1) + ') | 已打 ' + Math.round(o.bat / R) + ' 場 | 要補練 ' + (o.need / R).toFixed(1) + ' 場');
  for (const t in res.tiers) { const T = res.tiers[t]; g.log('T' + t + ' 打造時 Lv' + (T.lv / T.n).toFixed(1) + ' 錢 ' + Math.round(T.gold / T.n) + '/' + 500 * t + ' 點數 ' + Math.round(T.pts / T.n) + '/' + 75 * t + '（全套 5 件） → 打得起 ' + (T.pcs / T.n).toFixed(1) + ' 件'); }
};
