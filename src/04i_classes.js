/* ===================== CLASSES v2: chosen at the opening, each with its own skill line ===================== */
// New hero skills that fill out the class lines (VFX in 07e_herofx.js — hero materials only)
Object.assign(MOVES, {
  voltSlash: { n: '雷光斬', t: '雷', cat: '物', pow: 55, acc: 95, pp: 20, eff: { st: 'par', p: 10 }, d: '讓劍身帶雷斬擊。有時會讓對手麻痺。對潮濕的對手會感電。' },
  tideSlash: { n: '流水斬', t: '水', cat: '物', pow: 60, acc: 100, pp: 20, d: '如流水般連綿的斬擊。會讓對手全身濕透。' },
  magicBolt: { n: '魔彈', t: '一般', cat: '特', pow: 40, acc: 100, pp: 35, d: '把魔力凝成光彈射出。最基本的魔法。' },
  fireBolt: { n: '火球術', t: '火', cat: '特', pow: 45, acc: 100, pp: 25, eff: { st: 'brn', p: 10 }, d: '射出一顆火球。有時會造成灼傷。' },
  leafStorm: { n: '翠葉風暴', t: '草', cat: '特', pow: 60, acc: 95, pp: 15, d: '捲起鋒利的葉片風暴。會讓對手被藤蔓纏住。' },
  flameWave: { n: '炎浪', t: '火', cat: '特', pow: 75, acc: 95, pp: 10, eff: { st: 'brn', p: 20 }, d: '掀起一道橫掃的火焰巨浪。有時會造成灼傷。' },
  aquaBurst: { n: '激流', t: '水', cat: '特', pow: 80, acc: 90, pp: 10, d: '從地面噴出巨大的水柱。' },
  ironWill: { n: '鐵壁', t: '一般', cat: '變', pp: 15, stat: { who: 'self', def: 1, spd: 1 }, d: '穩住架勢，提升物防和魔防。' },
});
const HERO_META2 = { voltSlash: ['slash', 'voltSlash'], tideSlash: ['slash', 'tideSlash'], magicBolt: ['bolt', 'magicBolt'], fireBolt: ['bolt', 'fireBolt'], leafStorm: ['area', 'leafStorm'], aquaBurst: ['area', 'aquaBurst'], flameWave: ['area', 'flameWave'], ironWill: ['buff', 'ironWill'] };
Object.assign(CLASSES.guardian.st, { atk: 2 }); CLASSES.paladin.st.atk = 4;
for (const k in HERO_META2) { MOVES[k].cls = HERO_META2[k][0]; MOVES[k].fx = HERO_META2[k][1]; }

// Starting kit & skills per base class (the ceremony at the elder's house)
const CLASS_START = {
  swordsman: { moves: ['slash', 'flameSlash', 'powerSlash'], gear: ['woodSword', 'guardBadge'], tag: '近身劍術', bars: { 物攻: 4, 魔攻: 1, 防禦: 3, HP: 3 }, pitch: '用劍斬開一切。火、雷、水、草四種屬性劍技樣樣精通，專打魔物的弱點。' },
  mage: { moves: ['magicBolt', 'fireBolt', 'manaBurst'], gear: ['practiceWand', 'guardBadge'], tag: '四系魔法', bars: { 物攻: 1, 魔攻: 5, 防禦: 2, HP: 2 }, pitch: '操控魔力的術士。四系魔法威力強大，還能用護盾和治癒保護自己。' },
  guardian: { moves: ['slash', 'guardStrike', 'ironWill'], gear: ['woodSword', 'guardBadge', 'clothCap'], tag: '堅守反擊', bars: { 物攻: 3, 魔攻: 1, 防禦: 5, HP: 5 }, pitch: '站在最前線的守護者。又硬又耐打，還會治癒自己，適合想穩穩前進的人。' },
};
// Level-up skill line per BASE class (advanced classes keep their base line and add their own class skills)
const CLASS_LINE = {
  swordsman: [[7, 'focus'], [9, 'voltSlash'], [11, 'gale'], [13, 'leafBlade'], [15, 'tideSlash'], [17, 'blaze'], [20, 'armorBreak']],
  mage: [[7, 'aquaBlade'], [9, 'thunder'], [11, 'heal'], [13, 'leafStorm'], [15, 'flameWave'], [17, 'aquaBurst'], [19, 'barrier']],
  guardian: [[7, 'flameSlash'], [9, 'voltSlash'], [11, 'heal'], [13, 'tideSlash'], [15, 'leafBlade'], [17, 'barrier'], [20, 'armorBreak']],
};
const baseClassOf = cls => { const C = CLASSES[cls]; if (!C) return null; return C.from || (cls === 'otherworlder' ? 'swordsman' : cls); };
function classLine(cls) { return CLASS_LINE[baseClassOf(cls)] || null; }
Object.assign(GEAR, { practiceWand: { n: '練習魔杖', slot: 'weapon', t: 1, st: { spa: 3 }, spr: 'woodSword', kind: '法杖', d: '村長年輕時用過的樺木魔杖。杖頭刻著新芽紋章。' } });

/* ---------- Class ceremony screen ---------- */
function* classSelectScreen() {
  const keys = ['swordsman', 'mage', 'guardian']; let i = 0, t = 0;
  const scr = { draw(x) {
    t++; const k = keys[i], C = CLASSES[k], S = CLASS_START[k];
    x.fillStyle = '#0a0c18'; x.fillRect(0, 0, W, H);
    const col = { swordsman: '#ff9a50', mage: '#b080ff', guardian: '#6ec8ff' }[k];
    const g = x.createRadialGradient(W / 2, 74, 4, W / 2, 74, 70); const [r, gg, b] = hex2rgb(col); g.addColorStop(0, `rgba(${r},${gg},${b},0.45)`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); x.fillStyle = g; x.fillRect(0, 0, W, 150);
    for (let n = 0; n < 10; n++) { const a = t / 40 + n * 0.63, R = 40 + Math.sin(t / 30 + n) * 6; x.fillStyle = n % 2 ? col : '#ffffff'; x.fillRect(Math.round(W / 2 + Math.cos(a) * R), Math.round(74 + Math.sin(a) * R * 0.5), 2, 2); }
    headerBar(x, '覺醒的儀式'); Font.drawR(x, (i + 1) + '/3', W - 6, 2, UIC.muted, UIC.textSh);
    const bob = Math.round(Math.sin(t / 20) * 2), fr = heroFramesLook({ head: k === 'guardian' ? GEAR.clothCap.look : null, body: 'uniform', feet: 'school', weapon: GEAR[S.gear[0]].look }).down[0]; x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(W / 2 - 14, 106, 18, 5, 0, 0, 7); x.fill(); x.drawImage(fr, 0, 0, 16, 22, W / 2 - 14 - 24, 36 + bob, 48, 66);
    { const ex = W / 2 + 34, ey = 70 - bob; x.save(); x.lineCap = 'round'; x.strokeStyle = '#10121e'; x.fillStyle = '#10121e'; x.lineWidth = 6;
      const glyph = (c, w) => { x.strokeStyle = c; x.lineWidth = w; if (k === 'swordsman') { x.beginPath(); x.moveTo(ex - 10, ey + 14); x.lineTo(ex + 10, ey - 14); x.moveTo(ex - 10, ey - 2); x.lineTo(ex + 2, ey + 8); x.stroke(); } else if (k === 'mage') { x.beginPath(); x.moveTo(ex - 8, ey + 16); x.lineTo(ex + 4, ey - 6); x.stroke(); x.beginPath(); x.arc(ex + 6, ey - 10, 5, 0, 7); x.stroke(); } else { x.beginPath(); x.moveTo(ex - 11, ey - 12); x.lineTo(ex + 11, ey - 12); x.lineTo(ex + 11, ey + 2); x.lineTo(ex, ey + 14); x.lineTo(ex - 11, ey + 2); x.closePath(); x.stroke(); } };
      glyph('#10121e', 6); glyph(col, 3); glyph('#ffffff', 1); x.restore(); }
    Font.drawC(x, '◀', 14, 64, i > 0 ? UIC.text : UIC.dis, UIC.textSh); Font.drawC(x, '▶', W - 14, 64, i < 2 ? UIC.text : UIC.dis, UIC.textSh);
    drawWin(x, 4, 118, 168, 134, 'menu');
    Font.draw(x, C.n, 12, 120, col, UIC.textSh); Font.drawR(x, S.tag, 164, 122, UIC.muted, UIC.textSh, 10);
    Font.wrap(S.pitch, 152, 11).slice(0, 3).forEach((l, n) => Font.draw(x, l, 12, 138 + n * 13, UIC.text, UIC.textSh, 11));
    Object.entries(S.bars).forEach(([nm, v], n) => { const X = 12 + (n % 2) * 80, Y = 180 + Math.floor(n / 2) * 13; Font.draw(x, nm, X, Y, UIC.muted, UIC.textSh, 10); for (let q = 0; q < 5; q++) { x.fillStyle = q < v ? col : '#2a3050'; x.fillRect(X + 30 + q * 8, Y + 5, 6, 4); } });
    Font.draw(x, '起始技能', 12, 208, UIC.accent, UIC.textSh, 10); Font.draw(x, S.moves.map(m => MOVES[m].n).join('・'), 12, 221, UIC.text, UIC.textSh, 11);
    Font.drawR(x, 'A：選擇　◀▶：切換', 164, 238, UIC.muted, UIC.textSh, 9);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left') && i > 0) { i--; Sound.sfx('cursor'); } if (Input.repeat('right') && i < 2) { i++; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); const k = keys[i]; UI.remove(scr); if (yield* yesNo('要走上「' + CLASSES[k].n + '」的道路嗎？\n（之後在Lv14可以進階）')) return k; UI.push(scr); }
    yield;
  }
}
function applyStartClass(k) {
  const st = Game.st, S = CLASS_START[k]; st.cls = k;
  st.moves = S.moves.map(id => ({ id, pp: MOVES[id].pp }));
  for (const [l, id] of CLASS_LINE[k]) if (l <= st.lv && st.moves.length < 4 && !st.moves.some(m => m.id === id)) st.moves.push({ id, pp: MOVES[id].pp });
  const acc = ['acc1', 'acc2']; for (const b of S.gear) { const g = makeGear(b, 1, 1), sl = GEAR[b].slot === 'acc' ? acc.shift() : GEAR[b].slot; st.equip[sl] = g.u; }
  st.hp = heroStats(st).hp;
}
