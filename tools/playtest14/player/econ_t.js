// gold per wild fight vs the price unit (gW), at each region's level; hero kept at the region's level
const fs = require('fs');
module.exports = async (g) => { const save = fs.readFileSync(process.env.SAVE, 'utf8');
  g.log(await g.ev(s => { const G = __game, out = [];
    for (const [map, n] of [['windHills', 8], ['jadeCreek', 8], ['forest', 8], ['lake', 8], ['goldPlains', 8], ['frostField', 8], ['emberPass', 6]]) {
      const encs = MAPS[map].encounters || []; let tot = 0, gear = 0, base = 0, lvS = 0;
      for (let k = 0; k < n; k++) { G.Game.st = JSON.parse(s); const st = G.Game.st; const enc = encs[k % encs.length]; const r = rollEnc(enc); st.lv = r[1]; st.exp = expForLevel(r[1]); const m0 = st.money; lvS += r[1];
        st.map = map; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.autoPlay = () => null; const ow = G.Game.scene; window.__gg = 0;
        const _ls = BPK.lootShow; BPK.lootShow = function* (gg, head) { window.__gg += KD.gearGold(gg); yield* _ls.call(this, gg, head); };
        ow.run(ow.battleScript({ sp: r[0], lv: r[1], kind: 'wild', extra: 0 }));
        for (let i = 0; i < 3000; i++) { const sc = G.Game.scene; if (sc.constructor.name === 'Battle' && sc.core && sc.core.byId.H && !sc.__t) { sc.__t = 1; sc.core.byId.H.max.hp = 999; sc.core.byId.H.res.hp = 999; }
          if (sc.constructor.name !== 'Battle' && i > 50 && !G.UI.stack.length) break; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length) G.press('b', 2, 2); else G.step(6); }
        BPK.lootShow = _ls; tot += st.money - m0; gear += window.__gg; }
      const lv = Math.round(lvS / n); out.push(map + ' Lv' + lv + ' gW ' + KD.gW(lv) + ' | gold/fight ' + Math.round(tot / n) + ' (' + (tot / n / KD.gW(lv)).toFixed(1) + '× gW), of which gear ' + Math.round(gear / n) + ' | common card ' + KD.price('C', { lv }) + ' upgrade ' + KD.upPrice({ lv, k14: {} , flags: {} })); }
    return out.join('\n'); }, save)); };
