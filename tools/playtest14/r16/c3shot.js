const fs = require('fs');
module.exports = async (g) => {
  await g.step(30);
  const d = await g.ev(() => {
    const cards = [{ id: 'sw_strike', g16: 1 }, { id: 'sw_defend', up: 1, g16: 1 }, { id: 'sw_break' }, { id: 'sw_stance' }, { id: 'rg_venom' }, { id: 'lg_gren' }, { id: 'mg_fire' }, { id: 'bk_rage' in KD.CARDS ? 'bk_rage' : 'sw_cleave' }];
    const ids = Object.keys(KD.CARDS); const multi = ids.find(id => /×/.test((KD.CARDS[id].short(KD.val({ id })) || [])[0] || '')); if (multi) cards.push({ id: multi });
    const rows = [[35, 68], [35, 60], [33, 52], [38, 54]], Wd = 4 + 9 * 40 + 4, Hd = 4 + rows.reduce((a, r) => a + r[1] + 14, 0) + 134 + 14 + 90;
    const cv = document.createElement('canvas'); cv.width = Wd; cv.height = Hd; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#16121e'; x.fillRect(0, 0, Wd, Hd);
    let Y = 6; for (const [cw, ch] of rows) { Font.draw(x, cw + '×' + ch, 4, Y - 6, '#ffe0a0', '#000', 8); cards.forEach((c, i) => KD.drawCard(x, c, 6 + i * (cw + 5), Y + 6, cw, ch, { dim: i === 7, on: i === 3 })); Y += ch + 14; }
    Font.draw(x, '50×78 / 60×86', 4, Y - 6, '#ffe0a0', '#000', 8); [{ id: 'sw_break' }, { id: 'sw_defend', up: 1, g16: 1 }, { id: 'sw_stance' }, { id: 'lg_gren' }, { id: 'rg_venom' }].forEach((c, i) => KD.drawCard(x, c, 6 + i * 58, Y + 6, 54, 120, {}));
    KD.drawCard(x, { id: 'lg_gren' }, 6 + 5 * 58, Y + 6, 60, 86, {}); Y += 134;
    // a hand of 7, overlapping, third picked
    const hand = ['sw_strike', 'sw_defend', 'sw_flow', 'sw_break', 'sw_cleave', 'mg_fire', 'sw_stance'].map(id => ({ id })); const n = hand.length, cw = 35, ch = 68, span = 176 - 8 - cw, st = Math.min(cw + 2, span / (n - 1)), sel = 2;
    x.fillStyle = 'rgba(10,8,20,0.92)'; x.fillRect(0, Y, 176, 84); const order = [...Array(n).keys()].filter(i => i !== sel).concat([sel]);
    for (const i of order) { const X = Math.round(4 + i * st), l0 = i === sel + 1 ? cw - st : 0, r0 = i === n - 1 || i === sel ? cw : st; KD.drawCard(x, hand[i], X, Y + 12 - (i === sel ? 10 : 0), cw, ch, { on: i === sel, visX0: i === sel ? 0 : Math.max(0, Math.min(l0, cw - 14)), vis: i === sel ? cw : Math.max(14, r0 - l0) }); }
    const big = document.createElement('canvas'); big.width = Wd * 4; big.height = Hd * 4; const bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(cv, 0, 0, Wd * 4, Hd * 4); return big.toDataURL(); });
  fs.writeFileSync(process.env.OUT, Buffer.from(d.split(',')[1], 'base64'));
};
