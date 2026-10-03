/* ===================== v10 階段二：附魔・鐵匠（寶珠、附魔）・技能畫面 =====================
   Plan items 18 / 19: monsters drop 附魔石 of their element (wild 5%, elites 40%, bosses always an 上級 stone); the smith
   enchants a weapon with one element. An enchanted weapon's normal attacks and no-element skills take that element, deal
   +6% (上級 +12%) and can add its effect: 火 灼傷 / 水 潮濕 / 雷 麻痺 / 草 纏繞 / 毒 中毒 / 岩 物防-1, with a burst of that
   element on the hit. Smith menu: 打造 / 強化 / 寶珠（鑲嵌・拆卸・融合）/ 附魔 / 重鑄詞綴 / 分解 (武器繼承 is gone with the
   weapon skills). 選單→技能 lists the class skill, the weapon's active orbs (with evolution), the passives and the orb bag. */

const EN_EL = ['火', '水', '雷', '草', '毒', '岩'];
const EN_KEY = { 火: 'Fire', 水: 'Water', 雷: 'Bolt', 草: 'Leaf', 毒: 'Venom', 岩: 'Rock' };
const EN_NAME = { 火: '火焰', 水: '流水', 雷: '雷鳴', 草: '翠綠', 毒: '劇毒', 岩: '岩石' };
const EN_EFF = { 火: ['brn', 10, 18, '灼傷'], 水: ['wet', 30, 50, '潮濕'], 雷: ['par', 8, 15, '麻痺'], 草: ['tangle', 30, 50, '纏繞'], 毒: ['psn', 12, 22, '中毒'], 岩: ['fdef', 8, 15, '物防-1'] };
for (const t of EN_EL) { const E = EN_EFF[t];
  ITEMS['en' + EN_KEY[t]] = { n: EN_NAME[t] + '附魔石', cat: '魔物素材', use: 'enchant', price: 400, en: [t, 1], d: '在鐵匠舖讓武器附上「' + t + '」屬性。攻擊有' + E[1] + '%機率' + E[3] + '，傷害+6%。' };
  ITEMS['en' + EN_KEY[t] + '2'] = { n: '上級' + EN_NAME[t] + '附魔石', cat: '魔物素材', use: 'enchant', price: 1200, en: [t, 2], d: '在鐵匠舖讓武器附上強力的「' + t + '」屬性。攻擊有' + E[2] + '%機率' + E[3] + '，傷害+12%。' }; }
const FAM_EL = { plant: '草', construct: '岩', undead: '毒', spirit: '水', dragon: '火', aquatic: '水', insect: '毒', ooze: '水', beast: null, bird: null, human: null };
const SP_EL = {};
function monsterElem(sp) {
  if (SP_EL[sp] !== undefined) return SP_EL[sp]; const S = SPECIES[sp]; if (!S) return null; const cnt = {};
  for (const L of S.learn || []) { const m = MOVES[Array.isArray(L) ? L[1] : L]; if (m && EN_EL.includes(m.t)) cnt[m.t] = (cnt[m.t] || 0) + 1; }
  let best = null, n = 0; for (const t in cnt) if (cnt[t] > n) { n = cnt[t]; best = t; } return (SP_EL[sp] = best || FAM_EL[S.fam] || null);
}
// stats: the enchant replaces the weapon's element
const gearEn = g => g && g.en && EN_EFF[g.en.t] ? g.en : null;
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st), w = mainWeapon(st), E = gearEn(w); if (E) { s.welem = E.t; s.enT = E.t; s.enLv = E.lv; } return s; }; }
{ const _sm = skillMove; skillMove = function (id, st = Game.st) { const m = _sm(id, st); if (id === 'attack') { const E = gearEn(mainWeapon(st)); if (E) return { ...m, t: E.t, en: E.lv }; } return m; }; }
const EN_FX = { 火: ['flame', '#ff8030'], 水: ['bub', '#80c8ff'], 雷: ['bolt', '#ffe060'], 草: ['dot', '#70d060'], 毒: ['dot', '#c070e0'], 岩: ['dot', '#b09070'] };
function enBurst(b, t, el) { const C = b.center(t), [k, c] = EN_FX[el]; for (let i = 0; i < 7; i++) { const a = Math.random() * 7, d = 6 + Math.random() * 14; if (k === 'bolt') { b.spawn({ k: 'bolt', pts: [[C.x + rnd(-14, 14), C.y - 26], [C.x + rnd(-6, 6), C.y - 8], [C.x + rnd(-10, 10), C.y + 6]], w: 2, life: 8 }); break; }
    b.spawn(k === 'flame' ? { k: 'flame', x: C.x + Math.cos(a) * d, y: C.y + Math.sin(a) * d, vy: -0.8, s: 3, life: 16 } : k === 'bub' ? { k: 'bub', x: C.x + Math.cos(a) * d, y: C.y + Math.sin(a) * d, vy: -0.6, r: 2 + Math.random() * 2, c, life: 18 } : { k: 'dot', x: C.x + Math.cos(a) * d, y: C.y + Math.sin(a) * d, vx: Math.cos(a) * 1.2, vy: Math.sin(a) * 1.2 - 0.4, s: 2, c, life: 16 }); } }

/* ---------- smith: one menu for both smiths ---------- */
function* smithMenu(f) {
  while (true) {
    const r0 = yield* ask('要做什麼？', ['打造', '強化' + (f && f.smithDisc ? '（半價）' : ''), '重鑄詞綴', '分解', '離開']), r = r0 >= 2 ? r0 + 2 : r0; // v12: 寶珠・附魔 cancelled
    if (r === 0) yield* craftScreen(); else if (r === 1) yield* enhanceFlow(); else if (r === 2) yield* orbSmithFlow(); else if (r === 3) yield* enchantFlow(); else if (r === 4) yield* reforgeFlow(); else if (r === 5) yield* salvageFlow(); else break;
  }
}
const gearTier = g => (GEAR[g.b] && GEAR[g.b].t) || 1;
function orbLine(o) { const D = orbDef(o), a = isActiveOrb(o); return (a ? '◆' : '◇') + orbName(o) + (a ? (orbStage(o) < 2 ? '（進化 ' + Math.min(o.x || 0, evoAt(o)) + '/' + evoAt(o) + '）' : '（最終）') : ''); }
// v10 (Codex task U): orb rows show the orb's icon instead of the ◆／◇ glyph when the icon exists
function drawOrbLine(x, o, X, Y, col, extra = '') { const ic = typeof orbIcon === 'function' ? orbIcon(o.k) : null;
  if (!ic) return Font.draw(x, orbLine(o) + extra, X, Y, col, UIC.textSh, 10); x.drawImage(ic, X - 1, Y + 1); return Font.draw(x, orbLine(o).slice(1) + extra, X + 13, Y, col, UIC.textSh, 10); }
function orbInfo(o) { if (isActiveOrb(o)) { const m = MOVES['o_' + o.k], D = ORB_A[o.k]; return (m.cat === '變' ? '輔助' : m.cat === '物' ? '物理' : '魔法') + (m.t !== '一般' ? '・' + m.t : '') + (D.pow ? '・威力' + D.pow : '') + '・MP' + D.mp + '　' + D.d + (o.e.length ? '　進化：' + o.e.map((b, s) => (b === 'A' ? '強攻' : '附加') + evoOptText(o, s, b)).join('、') : ''); }
  return '被動：' + orbFxText(o); }
function* orbPicker(title, getList, note) {
  let idx = 0; const VIS = 8;
  const scr = { draw(x) { screenBG(x); headerBar(x, title); Font.drawR(x, Game.st.money + ' G', W - 6, 3, UIC.warm, UIC.textSh, 10); const L = getList();
    drawWin(x, 4, 22, 168, VIS * 16 + 8, 'menu'); if (!L.length) Font.draw(x, '（沒有可以選的寶珠）', 14, 28, UIC.muted, UIC.textSh, 10);
    const top = Math.max(0, Math.min(idx - 3, L.length - VIS)); L.slice(top, top + VIS).forEach((o, i) => { const Y = 26 + i * 16; if (top + i === idx) selBar(x, 6, Y - 1, 164, 15); drawOrbLine(x, o, 12, Y - 1, isActiveOrb(o) ? '#c8f0ff' : UIC.warm); const h = orbHost(o); if (h) Font.drawR(x, '鑲在' + GEAR[h.b].n.slice(0, 5), 166, Y, UIC.muted, UIC.textSh, 8); });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < L.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 16 + 3);
    const Y0 = 22 + VIS * 16 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); const o = L[idx]; if (o) drawFitText(x, orbInfo(o), 10, Y0 + 4, 152, 252 - Y0 - 22, 10); if (note) Font.draw(x, note, 10, 238, UIC.muted, UIC.textSh, 8); } };
  UI.push(scr); let res = null;
  while (true) { const L = getList(); if (Input.repeat('up') && idx > 0) { idx--; Sound.sfx('cursor'); } if (Input.repeat('down') && idx < L.length - 1) { idx++; Sound.sfx('cursor'); }
    if (Input.pressed('a') && L[idx]) { Input.consume('a'); Sound.sfx('select'); res = L[idx]; break; } if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); return res;
}
function* orbSmithFlow() {
  const st = Game.st;
  while (true) {
    const r = yield* ask('寶珠要怎麼處理？', ['鑲嵌', '拆卸', '融合', '返回']); if (r < 0 || r === 3) return;
    if (r === 0) {
      const g = yield* gearPicker('選擇要鑲嵌的裝備', () => gearSort().filter(g => orbSlots(g) > (g.o || []).length), (x, g, Y) => Font.draw(x, '寶珠孔 ' + (g.o || []).length + '/' + orbSlots(g) + '（' + (orbSlotKind(g) === 'a' ? '主動技能' : '被動') + '）', 12, Y, UIC.accent, UIC.textSh, 10));
      if (!g) continue; const kind = orbSlotKind(g), have = gearOrbs(g).map(o => o.k), cost = st.flags.orbFree ? 100 * gearTier(g) : 0; // the first one is free
      const o = yield* orbPicker('鑲進「' + GEAR[g.b].n + '」', () => orbList(st).filter(o => !orbHost(o) && (kind === 'a') === isActiveOrb(o) && !have.includes(o.k)), '費用 ' + cost + ' G');
      if (!o) continue; if (st.money < cost) { yield* say('錢不夠喔。（需要' + cost + ' G）'); continue; }
      if (!(yield* yesNo('花' + cost + ' G，把「' + orbName(o) + '」鑲進' + GEAR[g.b].n + '？'))) continue;
      st.money -= cost; st.flags.orbFree = 1; g.o = (g.o || []).concat(o.u); Sound.sfx('rock'); yield* say('鑲好了！' + (kind === 'a' ? '裝備這把武器時，戰鬥中就能使用「' + orbName(o) + '」。' : '裝備這件裝備時，「' + orbName(o) + '」的效果就會發揮。'));
    } else if (r === 1) {
      const g = yield* gearPicker('選擇要拆寶珠的裝備', () => gearSort().filter(g => (g.o || []).length), (x, g, Y) => Font.draw(x, gearOrbs(g).map(orbName).join('・'), 12, Y, UIC.accent, UIC.textSh, 10));
      if (!g) continue; const o = yield* orbPicker('從「' + GEAR[g.b].n + '」拆下', () => gearOrbs(g)); if (!o) continue;
      g.o = (g.o || []).filter(u => u !== o.u); Sound.sfx('cancel'); yield* say('拆下了「' + orbName(o) + '」。（寶珠不會損壞，可以鑲到別的裝備上）');
    } else {
      const o = yield* orbPicker('選擇要強化的寶珠', () => orbList(st).filter(o => orbList(st).some(p => p !== o && p.k === o.k && !orbHost(p)) && (isActiveOrb(o) ? orbStage(BB.entry(st, o.k)) < 2 : (o.lv || 1) < 3)), '用一顆相同的寶珠融合');
      if (!o) continue; const food = orbList(st).find(p => p !== o && p.k === o.k && !orbHost(p)); if (!food) continue;
      if (!(yield* yesNo('消耗一顆「' + orbDef(food).n + '」，' + (isActiveOrb(o) ? '讓進化進度+12？' : '讓等級+1？')))) continue;
      st.orbs = orbList(st).filter(p => p !== food); if (isActiveOrb(o)) { BB.libAdd(st, o.k, 12); BB.mirror(st, o.k); } else o.lv = Math.min(3, (o.lv || 1) + 1); // v11: progress lives in the skill library
      Sound.sfx('statUp'); yield* say('融合成功！' + (isActiveOrb(o) ? (orbPending(o) ? '「' + orbName(o) + '」可以進化了！' : '') : '「' + orbName(o) + '」') );
      if (isActiveOrb(o) && orbPending(BB.entry(st, o.k))) yield* orbEvolveFlow(BB.entry(st, o.k));
    }
  }
}
function* enchantFlow() {
  const st = Game.st, stones = () => Object.keys(ITEMS).filter(k => ITEMS[k].en && st.bag[k] > 0);
  if (!stones().length) { yield* say('附魔要用「附魔石」。打倒魔物有時候會掉，菁英和頭目比較容易拿到。'); return; }
  const g = yield* gearPicker('選擇要附魔的武器', () => gearSort().filter(g => GEAR[g.b].slot === 'weapon'), (x, g, Y) => Font.draw(x, gearEn(g) ? '目前：' + (g.en.lv > 1 ? '上級' : '') + g.en.t + '屬性附魔' : '尚未附魔', 12, Y, UIC.accent, UIC.textSh, 10));
  if (!g) return; const L = stones(), r = yield* choose(L.map(k => ({ t: ITEMS[k].n, r: '×' + st.bag[k] })).concat({ t: '返回' }), { title: '附魔石' }); if (r < 0 || r >= L.length) return;
  const k = L[r], [el, lv] = ITEMS[k].en, cost = 300 * gearTier(g) * lv;
  if (st.money < cost) { yield* say('附魔要' + cost + ' G。錢不夠喔。'); return; }
  if (!(yield* yesNo('花' + cost + ' G，讓「' + GEAR[g.b].n + '」附上' + (lv > 1 ? '上級' : '') + el + '屬性？' + (gearEn(g) ? '（原本的附魔會消失）' : '')))) return;
  st.money -= cost; st.bag[k]--; if (!st.bag[k]) delete st.bag[k]; g.en = { t: el, lv }; Sound.sfx(el === '火' ? 'fire' : el === '水' ? 'water' : el === '雷' ? 'thunder' : 'charge');
  yield* say('附魔完成！「' + GEAR[g.b].n + '」的普通攻擊和無屬性技能變成' + el + '屬性，攻擊時有機率' + EN_EFF[el][3] + '。');
}

/* ---------- gear pages: weapons list the 特技, the orb slots and the enchant ---------- */
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) {
    let L = _gi(g, wrapW); const s = L.findIndex(l => l[0] === '【武器技能】'); if (s >= 0) { let e = s + 1; while (e < L.length && L[e][3] > 0) e++; L.splice(s, e - s); }
    const X = [], add = (t, c, sz, ind) => { for (const l of Font.wrap(t, wrapW - ind, sz)) X.push([l, c, sz, ind]); }, S = WSK[g.b];
    if (S) { X.push(['【武器】', UIC.accent, 10, 0]); add('特技「' + S.s.n + '」' + wspecText(S.s), '#ffd860', 10, 4); }
    const n = orbSlots(g); if (n) { X.push(['【寶珠孔 ' + (g.o || []).length + '/' + n + '】（' + (orbSlotKind(g) === 'a' ? '主動技能' : '被動') + '）', UIC.accent, 10, 0]); for (const o of gearOrbs(g)) add(orbLine(o), isActiveOrb(o) ? '#c8f0ff' : UIC.warm, 10, 4); }
    const E = gearEn(g); if (E) add((E.lv > 1 ? '上級' : '') + E.t + '屬性附魔：攻擊' + (E.lv > 1 ? EN_EFF[E.t][2] : EN_EFF[E.t][1]) + '%機率' + EN_EFF[E.t][3], '#ff9ad0', 10, 0);
    const i = L.findIndex(l => l[0] === '' && l[2] === 6); L.splice(i < 0 ? L.length : i, 0, ...X); return L;
  }; }

/* ---------- 選單→技能 ---------- */
// 狀態→技能一覽 passive box
drawPassiveInfo = function (x, st, X, Y, w, big) {
  const C = CLASSES[st.cls], S = CLASS_SIG[clsV7(st.cls)], P = passiveOrbs(st), k = mainWKey(st);
  const L = [['職業　' + (C ? C.n : '—') + (S ? '「' + S[0] + '」' : ''), UIC.warm, 11]];
  L.push(['被動寶珠：' + (P.length ? P.map(orbName).join('・') : '（沒有）'), P.length ? UIC.text : UIC.muted, 9]);
  if (k) L.push(['特技「' + WSK[k].s.n + '」普通攻擊' + wsN(WSK[k].s, st) + '層發動', '#ffd860', 9]);
  const n = typeof tpSpent === 'function' ? tpSpent(st) : 0; L.push(['天賦：已投入' + n + '／' + TP_CAP + '點', n ? '#c9cfe4' : UIC.muted, 9]);
  L.forEach(([t, col, z0], i) => { let z = z0; while (z > 7 && Font.width(t, z) > w) z--; Font.draw(x, t, X, Y + i * 15 + (i ? 1 : 0), col, UIC.textSh, z); });
};

/* ---------- the battle skill pop-up: class skill + the weapon's orbs ---------- */
