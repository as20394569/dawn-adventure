const fs = require('fs');
module.exports = async (g) => { const s = fs.readFileSync(process.env.SAVE, 'utf8');
  g.log(await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld();
    const out = []; const woodK = Object.keys(MATCAT11).filter(k => MATCAT11[k] === '木料'); for (const k of woodK) delete st.bag[k]; st.bag.fish13_shrimp = 2;
    out.push('rice can (no wood): ' + canCook13('dish13_rice', st) + ' need ' + DISH13.dish13_rice[1].map(([g, n]) => foodName13(g) + '×' + n + '（有 ' + foodHave13(g, st) + '）').join('、'));
    st.bag[woodK[0]] = 2; st.bag[woodK[1]] = 2; out.push('rice can (4 wood): ' + canCook13('dish13_rice', st)); cookTake13('dish13_rice', st);
    out.push('after cook: shrimp ' + (st.bag.fish13_shrimp || 0) + ' wood ' + woodK.slice(0, 2).map(k => st.bag[k] || 0).join('/') + ' | desc: ' + ITEMS.dish13_rice.d + ' | ' + DISH13.dish13_soup[4]);
    return out.join('\n'); }, s)); };
