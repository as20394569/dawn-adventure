/* ===================== v12.0.8d 第八輪（四）：委託重做（玩家在〈第八輪提案〉第二步 G 勾「照這樣做」） =====================
   委託人、故事、獎勵都不變，只改「要做什麼」：送貨・懸賞・調查・護送・夜晚限定・天氣限定・收集不同的東西・打倒強化魔物。
   懸賞魔物 8 隻：接下委託後才出現在地圖上的大一號魔物（原本魔物的圖換一個顏色），強度跟菁英一樣。
   舊存檔裡「進行中」的這 24 個委託會取消（進遊戲時說明），可以重新接。 */

/* ---------- key items ---------- */
const QI12 = {
  potionBox12: ['一箱傷藥', '旅店老闆娘託你送去晨霧道路營地的傷藥。交給莫奇。'],
  mokiHerb12: ['莫奇的藥草', '莫奇用傷藥換來的藥草。拿回去給旅店老闆娘。'],
  magnifier12: ['村長的放大鏡', '村長借你的放大鏡。拿來看地下水道的水晶簇。'],
  smokeTorch12: ['燻蝙蝠的火把', '老礦工給的火把。拿來燻走礦坑裡的蝙蝠窩。'],
  glowHerb12: ['發光的魔力草', '晚上採的魔力草，還在發著光。'],
  nightDew12: ['夜晚的月露', '晚上採的月露，比白天的更清澈。'],
  fogMoss12: ['霧裡的沼苔', '起霧的時候採的沼苔，藥效特別好。'],
  featherBird12: ['啾啾鳥的羽毛', '藍色的小羽毛。'], featherCrow12: ['稻草鴉的羽毛', '黑得發亮的羽毛。'], featherOwl12: ['夜梟的羽毛', '軟軟的、帶著斑點的羽毛。'],
  cake12: ['蜂蜜蛋糕', '旅店老闆做的蜂蜜蛋糕。送去給金穗平原帳篷裡的洛蒂。'],
};
for (const k in QI12) ITEMS[k] = { n: QI12[k][0], key: 1, cat: '重要物品', price: 0, d: QI12[k][1] };

/* ---------- bounty monsters: a recoloured, bigger copy of the original, elite strength ---------- */
const BOUNTY12 = { // key: [name, base, look [hue, sat, light], role, level, map, near [x, y], commission]
  bty12_bee: ['蜂王電電蜂', 'bee', [40, 1.3, 0.85], 'fast', 13, 'route', [18, 5], 'c2'],
  bty12_mush: ['毒孢菇王', 'thornMush', [-60, 1.2, 0.8], 'mage', 15, 'forest', [12, 26], 'c7'],
  bty12_wraith: ['怨靈之母', 'wraith', [150, 1.1, 0.7], 'mage', 23, 'catacomb', [10, 11], 'c12'],
  bty12_lizard: ['斷尾湖蜥', 'lizardman', [-40, 1.1, 0.8], 'phys', 20, 'lake', [11, 27], 'c17'],
  bty12_treant: ['千年樹妖', 'rotTreant', [30, 0.8, 0.75], 'tank', 23, 'swamp', [19, 7], 'c21'],
  bty12_sludge: ['巨大汙泥姆', 'sludge', [100, 1.0, 0.8], 'tank', 27, 'capSewer', [11, 12], 'c24'],
  bty12_wolf: ['白牙雪狼', 'snowWolf', [0, 0.3, 1.25], 'fast', 32, 'frostField', [20, 10], 'c29'],
  bty12_salamander: ['熔岩火蜥', 'fireSalamander', [-20, 1.3, 0.75], 'mage', 36, 'emberPass', [20, 12], 'c33'],
};
const BOUNTY_LOOK12 = { n: '懸賞', c: '#ff9a3a' };
for (const k in BOUNTY12) { const [n, b, look, role, lv] = BOUNTY12[k], B = SPECIES[b]; if (!B) continue;
  SPECIES[k] = { ...B, n, elite: 1, rare: 0, exp: 90 + 5 * lv, gold: 0, dex: '懸賞告示上的魔物。比一般的' + B.n + '大上一號，也兇得多。' };
  MON_PANEL[k] = typeof ch1Panel === 'function' ? ch1Panel(lv, role, 'elite') : { ...MON_PANEL[b], lv };
  HD_RIG_OF[k] = chibiOwn(b) ? b : (HD_RIG_OF[b] || b); if (ART[b]) ART[k] = artRecolor(ART[b], look[0], look[1], look[2]); else if (ART[HD_RIG_OF[k]]) ART[k] = ART[HD_RIG_OF[k]];
  if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[k] = HD_RIG_OF[k];
  const E = DEF.enemies[b]; defPut('enemies', k, { tags: ['foe', 'fam:' + (B.fam || 'beast')], skills: E ? E.skills.slice() : ['m_tackle'], fam: B.fam, trait: null, profile: E ? E.profile : 'brute', script: null, metadata: { n } });
  ELITE_TEXT[k] = ['懸賞魔物「' + n + '」！']; }
// the battle picture: the base chibi with the hue turned
{ const _ci = chibiImage; chibiImage = function (k) { if (!BOUNTY12[k]) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k]; const b = BOUNTY12[k][1], src = _ci(b); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const [dh, ks, kl] = BOUNTY12[k][2], c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]), [r, g, bb] = hex2rgb(hsl2hex(h + dh, Math.min(1, s * ks), Math.min(1, l * kl))); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }

/* ---------- the commissions, remade ---------- */
const COM12 = {
  c1: { d: '把一箱傷藥送到晨霧道路的營地給莫奇，帶回莫奇換的藥草。', need: { mokiHerb12: 1 }, give: 'potionBox12', talk: ['晨霧道路的營地，莫奇那邊的傷藥用完了。', '能幫我把這箱傷藥送過去嗎？他會用藥草跟我們換，記得帶回來。'], thanks: '莫奇的藥草！這下客人受傷也不怕了。' },
  c2: { d: '打倒道路北邊的懸賞魔物「蜂王電電蜂」。', bounty: 'bty12_bee', talk: ['道路北邊出現了一隻好大的電電蜂……大家都叫牠「蜂王」。', '能幫我打倒牠嗎？'] },
  c3: { d: '帶著村長的放大鏡，去看地下水道的 3 處水晶簇。', inv: 'sewer', look: 'crystal', give: 'magnifier12', talk: ['地下水道的水晶，說不定和魔王的封印有關。', '帶著我的放大鏡，去看看水道裡的 3 處水晶簇吧。'],
    found: ['用放大鏡看了看水晶簇……\n水晶裡面，有一道細細的黑色裂痕。', '這裡的水晶簇……發著微弱的光，像在呼吸一樣。', '最後一處水晶簇。光芒跟封印的紋路好像是同一種顏色。'] },
  c5: { d: '晚上在萌芽鎮的菜園旁守著，趕走來偷吃菜的嘟嘟菇×3。', garden: 3, talk: ['嘟嘟菇都是晚上才來偷吃菜的！', '晚上幫我在菜園旁邊守著，趕走 3 隻吧。'] },
  c6: { d: '帶來晚上採的、還在發光的魔力草×3。', need: { glowHerb12: 3 }, talk: ['我在研究會發光的草！', '晚上採的魔力草還會發光——幫我帶 3 株來。'] },
  c7: { d: '打倒迷霧森林深處的懸賞魔物「毒孢菇王」。', bounty: 'bty12_mush', talk: ['森林深處有一朵特別大的毒孢菇，孢子就是從牠身上來的。', '大家叫牠「毒孢菇王」。請你打倒牠。'] },
  c9: { d: '陪鐵匠的學徒小寶走到廢棄礦坑的入口挖礦。', escort: { look: 'kid', name: '學徒小寶', map: 'mine' }, talk: ['我的學徒小寶想去礦坑挖礦，可是路上有魔物……', '你能陪他走到廢棄礦坑的入口嗎？'], thanks: '小寶說你一路上很照顧他。謝謝你！' },
  c10: { d: '用老礦工給的火把，燻走礦坑裡的 3 個蝙蝠窩。', inv: 'mine', look: 'nest', give: 'smokeTorch12', talk: ['坑道蝠在礦坑裡築了好幾個窩。', '這支火把給你，幫我把 3 個蝙蝠窩燻走吧。'],
    found: ['用火把燻了燻蝙蝠窩——\n坑道蝠吱吱叫著飛走了！', '又燻走了一個窩。煙嗆得眼睛好痛。', '最後一個窩也燻走了！'] },
  c12: { d: '打倒地下墓穴的懸賞魔物「怨靈之母」。', bounty: 'bty12_wraith', talk: ['地下墓穴最深處，有一個「怨靈之母」。', '只要打倒牠，其他的怨靈就會安息了。'] },
  c15: { d: '收集 3 種不同的羽毛：啾啾鳥、稻草鴉、夜梟。', need: { featherBird12: 1, featherCrow12: 1, featherOwl12: 1 }, talk: ['我想用魔物的羽毛做髮飾！', '要 3 種不一樣的：啾啾鳥、稻草鴉，還有晚上才出來的夜梟！'] },
  c16: { d: '帶來晚上採的月露×5。', need: { nightDew12: 5 }, talk: ['我在找晚上採的月露。白天的不行，要夜晚的。', '能幫我帶 5 個來嗎？'] },
  c17: { d: '打倒撕破漁網的懸賞魔物「斷尾湖蜥」。', bounty: 'bty12_lizard', talk: ['有一隻斷了尾巴的湖蜥，一直來撕破我的漁網！', '牠在銀月湖畔，舊碼頭附近。拜託你了。'] },
  c18: { d: '沙塵暴時才出現的沙塵蠍，打倒 2 隻。', kill: ['dustScorpion', 2], talk: ['蠍尾針……要沙塵暴的時候才有的那種。', '沙塵暴時出來的沙塵蠍，能幫我打倒 2 隻嗎？'] },
  c19: { d: '陪信差露卡穿過落日峽谷，走到商隊營地。', escort: { look: 'courier', name: '信差露卡', map: 'canyon', npc: 'camp6_karl', reward: 1 }, talk: ['我要把信送到落日峽谷的商隊營地，可是鷹妖一直在附近盤旋……', '你能陪我走一趟嗎？'] },
  c20: { d: '帶來起霧時採的沼苔×3。', need: { fogMoss12: 3 }, talk: ['起霧的時候採的沼苔，藥效特別好。', '幫我在起霧的時候採 3 份沼苔吧。'] },
  c21: { d: '打倒擋住燈塔路的懸賞魔物「千年樹妖」。', bounty: 'bty12_treant', talk: ['有一棵「千年樹妖」擋在往燈塔的路上。', '請你打倒牠，讓燈塔的路通了吧。'] },
  c23: { d: '把北方街道上 3 個黑羽的記號塗掉。', inv: 'northRoad', look: 'mark', talk: ['黑羽盜賊團在北方街道上畫了記號，跟同夥通報路上的獵物。', '幫我把 3 個記號塗掉。'],
    found: ['地上畫著一根黑色羽毛的記號。\n用泥土把它塗掉了。', '又一個黑羽的記號。塗掉了。', '最後一個記號也塗掉了。'] },
  c24: { d: '打倒堵住排水口的懸賞魔物「巨大汙泥姆」。', bounty: 'bty12_sludge', talk: ['水道的排水口被一隻巨大的汙泥姆堵住了。', '請你打倒牠，水才流得出去。'] },
  c26: { d: '把做好的蜂蜜蛋糕送到金穗平原的帳篷給洛蒂。', give: 'cake12', deliverTo: 'camp6_lottie', talk: ['我做了一個蜂蜜蛋糕，想送給金穗平原帳篷裡的洛蒂。', '能幫我送過去嗎？'], thanks: '洛蒂收到了？太好了！' },
  c27: { d: '晚上跟著稻草人，找出讓它們動起來的 3 塊黑色結晶。', inv: 'goldPlains', look: 'shard', night: 1, talk: ['麥田的稻草人晚上會自己動起來……', '晚上跟著稻草人，找出讓它們動起來的東西吧。聽說有 3 塊黑色的結晶。'],
    found: ['稻草人腳下埋著一塊黑色結晶。\n挖出來的瞬間，稻草人「啪」地倒了下來。', '又找到一塊黑色結晶。冷冰冰的，摸起來會麻。', '最後一塊！麥田裡的稻草人都不動了。'] },
  c29: { d: '打倒帶頭的懸賞魔物「白牙雪狼」。', bounty: 'bty12_wolf', talk: ['雪原的狼群有一隻帶頭的白牙雪狼。', '只要打倒牠，狼群就會散了。'] },
  c31: { d: '在冰晶洞窟裡找到 3 個迷路的亡魂，跟它們說話。', inv: 'iceCave', look: 'ghost', talk: ['冰晶洞窟裡，有 3 個迷路的亡魂。', '去跟它們說說話，告訴它們可以安息了。'],
    found: ['「……好冷。我在找回家的路……」\n告訴它可以安息了。亡魂輕輕地消失了。', '「家人……還在等我嗎？」\n亡魂聽完，笑了一下，消失了。', '「謝謝你……來找我。」\n最後一個亡魂也安息了。'] },
  c33: { d: '打倒赤焰山道的懸賞魔物「熔岩火蜥」。', bounty: 'bty12_salamander', talk: ['赤焰山道有一隻特別大的熔岩火蜥。', '牠的鱗片是最好的材料……能幫我打倒牠嗎？'] },
  c35: { d: '打倒 3 隻強化魔物（哪裡的都可以）。', champ: 3, talk: ['想成為公會認可的冒險者？', '去打倒 3 隻強化魔物吧，哪裡的都可以。'] },
};
for (const k in COM12) { const c = COMMISSIONS[k], R = COM12[k]; if (!c) continue; delete c.need; delete c.kill; delete c.key; delete c.deliver;
  c.d = R.d; if (R.need) c.need = R.need; if (R.kill) c.kill = R.kill; c.c12 = R;
  if (R.talk) COM_TALK[k] = R.talk; if (R.thanks) COM_THANKS[k] = R.thanks; }
const comOn12 = (k, st = Game.st) => { const s = comState(k, st); return !!(s && s.s === 'on'); };
// old saves: an accepted (unfinished) remade commission is cancelled once, with a notice
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st, L = [];
    if (st && !st.v8q) { st.v8q = 1; for (const k in COM12) { const s = comState(k, st); if (s && s.s === 'on') { delete st.com[k]; L.push(COMMISSIONS[k].n); } } }
    const ow = _so.apply(this, a);
    if (L.length && ow && ow.run) ow.run((function* () { yield* wait(20); yield* sayAll(['（委託更新了！）', '有些委託要做的事改了，進行中的這幾個已經取消：' + L.join('、') + '。', '可以再去找委託人重新接。']); })());
    return ow; }; }
// progress for the new kinds
{ const _cp = comProgress; comProgress = function (id, st = Game.st) { const c = COMMISSIONS[id], R = c && c.c12, s = comState(id, st) || {};
    if (!R || R.need || R.kill) return _cp(id, st);
    if (R.bounty) return { cur: s.b12 ? 1 : 0, max: 1, ready: !!s.b12 };
    if (R.inv) { const n = (s.f12 || []).length; return { cur: n, max: 3, ready: n >= 3 }; }
    if (R.escort) return { cur: s.e12 ? 1 : 0, max: 1, ready: !!s.e12 && !R.escort.reward };
    if (R.garden) { const n = Math.min(R.garden, s.g12 || 0); return { cur: n, max: R.garden, ready: n >= R.garden }; }
    if (R.deliverTo) return { cur: s.d12 ? 1 : 0, max: 1, ready: !!s.d12 };
    if (R.champ) { const n = Math.min(R.champ, (st.champ12N || 0) - (s.c0 || 0)); return { cur: n, max: R.champ, ready: n >= R.champ }; }
    return _cp(id, st); }; }
{ const _ct = comTargets; comTargets = function (c, st = Game.st) { const R = c && c.c12; if (!R || R.need || R.kill) return _ct(c, st); const id = Object.keys(COMMISSIONS).find(q => COMMISSIONS[q] === c), p = comProgress(id, st), on = !!comState(id, st);
    const where = R.bounty ? [MAPS[BOUNTY12[R.bounty][5]].name] : R.inv ? [MAPS[R.inv].name + (R.night ? '（晚上）' : '')] : R.garden ? ['萌芽鎮的菜園（晚上）'] : R.escort ? [MAPS[R.escort.map].name] : R.deliverTo ? ['金穗平原的帳篷'] : R.champ ? ['野外、迷宮'] : [];
    const label = R.bounty ? '打倒' + BOUNTY12[R.bounty][0] : R.inv ? { crystal: '看水晶簇', nest: '燻走蝙蝠窩', mark: '塗掉黑羽記號', shard: '找出黑色結晶', ghost: '跟迷路的亡魂說話' }[R.look] : R.garden ? '趕走嘟嘟菇' : R.escort ? '陪' + R.escort.name + '走到' + MAPS[R.escort.map].name : R.deliverTo ? '把蛋糕交給洛蒂' : R.champ ? '打倒強化魔物' : '完成';
    return [{ label, have: on ? p.cur : 0, need: p.max, where }]; }; }
// accepting: hand over the item / start the escort / note the count; finishing: take the tools back
function* comInit12() { const st = Game.st;
  for (const k in COM12) { const s = comState(k, st), R = COM12[k]; if (!s) continue;
    if (s.s === 'on' && !s.i12) { s.i12 = 1;
      if (R.give) { st.bag[R.give] = 1; Sound.sfx('item'); yield* say('得到了「' + ITEMS[R.give].n + '」。'); }
      if (R.champ) s.c0 = st.champ12N || 0;
      if (R.escort) { st.esc12 = { k, look: R.escort.look, name: R.escort.name }; if (Game.ow && Game.ow.fol12Make) Game.ow.fol12Make(); yield* say(R.escort.name + '跟在你後面了。'); }
      if (R.bounty) yield* say('（懸賞魔物出現在' + MAPS[BOUNTY12[R.bounty][5]].name + '了）'); }
    if (s.s === 'done' && !s.x12) { s.x12 = 1; for (const t of ['magnifier12', 'smokeTorch12', 'potionBox12', 'cake12']) if (R.give === t) delete st.bag[t]; } } }
{ const _nc = npcCommission; npcCommission = function (id, ow, ent) { const g = _nc(id, ow, ent); if (!g) return g; return (function* () { const r = yield* g; yield* comInit12(); return r; })(); }; }

// where the new things come from (the quest page and the hints)
{ const W = { mokiHerb12: ['晨霧道路的營地（莫奇）'], glowHerb12: ['晚上採集魔力草'], nightDew12: ['晚上採集月露'], fogMoss12: ['起霧的時候採集沼苔'], featherBird12: ['打倒啾啾鳥'], featherCrow12: ['打倒稻草鴉'], featherOwl12: ['打倒夜梟（晚上）'] };
  const _is = itemSources; itemSources = function (k, ...a) { return W[k] || _is(k, ...a); }; }
/* ---------- 送貨：莫奇・洛蒂（營地的人被找上時先處理） ---------- */
function* campDeliver12(npc) { const st = Game.st;
  if (npc === 'camp6_moki') { const s = comState('c1', st); if (s && s.s === 'on' && st.bag.potionBox12) { delete st.bag.potionBox12; st.bag.mokiHerb12 = 1; Sound.jingle('item');
      yield* sayAll(['莫奇：「喔！是旅店的傷藥！正好用完了。」', '莫奇：「這些藥草你帶回去給老闆娘吧，說好的交換。」']); yield* say('得到了「莫奇的藥草」。'); return true; } }
  if (npc === 'camp6_lottie') { const s = comState('c26', st); if (s && s.s === 'on' && st.bag.cake12) { delete st.bag.cake12; s.d12 = 1; Sound.jingle('item');
      yield* sayAll(['洛蒂：「哇，是旅店的蜂蜜蛋糕！」', '洛蒂：「好香……幫我跟老闆說謝謝！」']); yield* say('把蜂蜜蛋糕交給了洛蒂。回旅店報告吧。'); return true; } }
  return false; }
for (const npc of ['camp6_moki', 'camp6_lottie']) { const _e = Events[npc]; Events[npc] = function* (ow, ...a) { if (yield* campDeliver12(npc)) return; return _e ? yield* _e.call(this, ow, ...a) : undefined; }; }

/* ---------- 夜晚・天氣限定的採集、不同的羽毛 ---------- */
{ const _dg = doGather; doGather = function (kind, st = Game.st) { const r = _dg(kind, st), night = dnNight12(st), add = (it, why) => { st.bag[it] = (st.bag[it] || 0) + 1; r.text += '、' + ITEMS[it].n + '×1' + why; };
    if (kind === 'mana' && night && comOn12('c6', st)) add('glowHerb12', '');
    if (kind === 'dew' && night && comOn12('c16', st)) add('nightDew12', '');
    if (kind === 'moss' && wx12(st) === 'fog' && comOn12('c20', st)) add('fogMoss12', '');
    return r; }; }
const FEATHER12 = { bird: 'featherBird12', strawCrow: 'featherCrow12', nightBird: 'featherOwl12' };
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this); const st = Game.st;
    if (comOn12('c15', st)) for (const v of this.defeated()) { const f = FEATHER12[v.sp]; if (f && !st.bag[f]) { st.bag[f] = 1; Sound.sfx('item'); yield* this.msg('撿到了「' + ITEMS[f].n + '」！（小芽的收藏）', { hold: 30 }); } }
    return r; }; }

/* ---------- 地圖上的位置：懸賞魔物、調查點、菜園 ---------- */
// a reachable floor tile near (x, y) (or, with wall = true, the n tiles next to walls spread as far apart as possible)
function spotsOf12(id, o = {}) { const d = MAPS[id]; if (!d) return []; const rows = d.rows, H = rows.length, Wd = rows[0].length, solid = (x, y) => x < 0 || y < 0 || x >= Wd || y >= H || SOLID.has(rows[y][x]) || rows[y][x] === 'L';
  const taken = new Set([...(d.npcs || []), ...(d.items || []), ...(d.gathers || []), ...(d.elites || [])].map(q => tk12(q.x, q.y)).concat(Object.keys(d.signs || {})));
  if (d.exit) taken.add(tk12(d.exit.x, d.exit.y)); for (const b of d.buildings || []) for (let y = b.y; y < b.y + (b.h || 1); y++) for (let x = b.x; x < b.x + (b.w || 1); x++) taken.add(tk12(x, y));
  // the biggest open area
  const seen = new Map(); let best = null, bestN = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) { if (seen.has(tk12(x, y)) || solid(x, y)) continue; const L = [[x, y]], q = [[x, y]]; seen.set(tk12(x, y), 1);
    while (q.length) { const [a, b] = q.shift(); for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const nx = a + dx, ny = b + dy; if (solid(nx, ny) || seen.has(tk12(nx, ny))) continue; seen.set(tk12(nx, ny), 1); L.push([nx, ny]); q.push([nx, ny]); } }
    if (L.length > bestN) { bestN = L.length; best = L; } }
  const ok = best.filter(([x, y]) => !taken.has(tk12(x, y)) && !(LANDMARK12[id] || []).some(l => l.x === x && l.y === y) && (!o.inRows || (y >= o.inRows[0] && y <= o.inRows[1])));
  if (o.near) { const [nx, ny] = o.near, S = ok.slice().sort((a, b) => Math.abs(a[0] - nx) + Math.abs(a[1] - ny) - Math.abs(b[0] - nx) - Math.abs(b[1] - ny)); if (!o.n) return [S[0]];
    const out = []; for (const t of S) { if (out.every(q => Math.abs(q[0] - t[0]) + Math.abs(q[1] - t[1]) >= 2)) out.push(t); if (out.length >= o.n) break; } return out; }
  const wall = ok.filter(([x, y]) => [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([dx, dy]) => solid(x + dx, y + dy)).length >= 2), P = wall.length >= o.n ? wall : ok, out = [P[Math.floor(P.length / 2)]];
  while (out.length < (o.n || 3)) { let far = null, fd = -1; for (const t of P) { const dd = Math.min(...out.map(q => Math.abs(q[0] - t[0]) + Math.abs(q[1] - t[1]))); if (dd > fd) { fd = dd; far = t; } } out.push(far); }
  return out; }
const SPOT12 = {}; const spot12 = (key, id, o) => SPOT12[key] || (SPOT12[key] = spotsOf12(id, o));
const invSpots12 = k => spot12('inv:' + k, COM12[k].inv, { n: 3, inRows: COM12[k].inv === 'goldPlains' ? [0, 26] : null });
const bountySpot12 = b => spot12('bty:' + b, BOUNTY12[b][5], { near: BOUNTY12[b][6] })[0];
const gardenSpots12 = () => spot12('garden', 'town', { n: 3, near: [8, 20] });

/* ---------- 懸賞魔物：接下委託後才在地圖上出現；打倒後回去報告 ---------- */
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) { const r = _ld.call(this, id, ...a), st = this.st; if (!st) return r;
    for (const b in BOUNTY12) { const [n, base, , , lv, map, , k] = BOUNTY12[b], s = comState(k, st); if (map !== id || !s || s.s !== 'on' || s.b12) continue;
      if (this.elites.some(e => e.bounty12 === b)) continue; const P = bountySpot12(b); if (!P) continue; const img = roamBig12(b) || roamImg12(b); if (!img) continue;
      const e = new Entity({ roam: 1, sp: b, lv, x: P[0], y: P[1], dir: 'down', img, bounty12: b, aggro: false }); e.home = [P[0], P[1], 'down']; e.timer = rnd(30, 90); e.px = e.x * 16; e.py = e.y * 16;
      if (!(e.x === this.p.x && e.y === this.p.y)) { this.elites.push(e); if (this.roam12) this.roam12.list.push(e); else this.roam12 = { map: id, list: [e] }; } }
    return r; }; }
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, ...a) {
    if (!e.bounty12) return yield* _rf.call(this, e, ...a); const st = this.st, [n, , , , lv, , , k] = BOUNTY12[e.bounty12], p = this.p; e.chase = 0;
    p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; st.dir = p.dir; Sound.sfx('exclaim'); yield* say('懸賞魔物「' + n + '」！');
    const res = yield* this.battleScript({ sp: e.bounty12, lv, kind: 'elite', solo: 1, bounty12: 1 });
    if (res === 'win') { this.roamDrop12(e); const s = comState(k, st); if (s) s.b12 = 1; Sound.jingle('item'); yield* say('打倒了懸賞魔物「' + n + '」！\n回去跟委託人報告吧。'); }
    else if (this.elites.includes(e)) { e.calmUntil = (st.steps || 0) + ROAM12.CALM; e.moving = false; } }; }
// a bounty is never a champion and never sleeps
{ const _nap = Overworld.prototype.roamNap12; Overworld.prototype.roamNap12 = function (list, now) { return _nap.call(this, list.filter(e => !e.bounty12 && !e.garden12), now); }; }

/* ---------- 調查點 ---------- */
const invActive12 = (k, st = Game.st) => { const R = COM12[k]; return comOn12(k, st) && (!R.night || phase12(st) === 'night'); };
function invHere12(ow) { const out = []; for (const k in COM12) { const R = COM12[k]; if (!R.inv || R.inv !== ow.map.id || !invActive12(k, ow.st)) continue; const s = comState(k, ow.st), f = s.f12 || [];
    invSpots12(k).forEach((q, i) => { if (q && !f.includes(i)) out.push({ k, i, x: q[0], y: q[1], R }); }); } return out; }
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const p = this.p, [dx, dy] = DIRS[p.dir];
    for (const v of invHere12(this)) if ((v.x === p.x + dx && v.y === p.y + dy) || (v.x === p.x && v.y === p.y)) { const st = this.st, s = comState(v.k, st), R = v.R;
      this.run((function* () { if (R.give && !st.bag[R.give]) { yield* say('需要「' + ITEMS[R.give].n + '」。'); return; }
        const f = s.f12 || (s.f12 = []); f.push(v.i); Sound.sfx(R.look === 'nest' ? 'fire' : R.look === 'ghost' ? 'charge' : 'item'); yield* say(R.found[Math.min(f.length, 3) - 1]);
        yield* say(f.length >= 3 ? '（' + COMMISSIONS[v.k].n + '：完成了！回去跟委託人報告吧）' : '（' + COMMISSIONS[v.k].n + '：' + f.length + '／3）'); })()); return true; }
    return _in.call(this); }; }
function invDraw12(ow, x) { const L = invHere12(ow); if (!L.length) return; const t = ow.t;
  for (const v of L) { const [sx, sy, z] = scr12(ow, v.x * 16 + 8, v.y * 16 + 8); if (sx < -20 || sy < -30 || sx > W + 20 || sy > H + 20) continue; x.save(); x.translate(Math.round(sx), Math.round(sy)); x.scale(z, z);
    const px = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    if (v.R.look === 'crystal') { px('#2a6a8a', -5, 0, 4, 6); px('#7ad8ff', -4, -4, 3, 8); px('#2a6a8a', 1, -2, 4, 8); px('#bff0ff', 2, -6, 2, 9); if ((t >> 3) % 6 === v.i) px('#ffffff', 2, -6, 2, 2); }
    if (v.R.look === 'nest') { px('#2a2018', -6, -2, 12, 7); px('#4a3a28', -5, -3, 10, 4); for (let i = 0; i < 3; i++) { const a = t / 9 + i * 2.1; px('#1a1a24', Math.round(Math.cos(a) * 8) - 1, Math.round(Math.sin(a) * 4) - 8, 3, 1); } }
    if (v.R.look === 'mark') { px('#101014', -1, -5, 2, 11); px('#101014', -4, -3, 3, 2); px('#101014', 1, -2, 3, 2); px('#101014', -4, 0, 3, 2); px('#101014', 1, 2, 3, 2); }
    if (v.R.look === 'shard') { x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(160,80,255,' + (0.25 + 0.15 * Math.sin(t / 10 + v.i)).toFixed(2) + ')'; x.beginPath(); x.arc(0, 0, 8, 0, 7); x.fill(); x.globalCompositeOperation = 'source-over'; px('#2a1a3a', -2, -5, 4, 9); px('#6a3aa0', -1, -4, 2, 6); }
    if (v.R.look === 'ghost') { const g = dnGhost12(); if (g) { x.globalAlpha = 0.55 + 0.15 * Math.sin(t / 15 + v.i); x.drawImage(g, -g.width / 2, -g.height + 6 - Math.round(2 * Math.sin(t / 20 + v.i))); } }
    x.restore(); } }

/* ---------- 菜園的嘟嘟菇（晚上） ---------- */
Overworld.prototype.garden12 = function () { const st = this.st, s = comState('c5', st); if (this.map.id !== 'town') return;
  const want = s && s.s === 'on' && phase12(st) === 'night' ? Math.max(0, COM12.c5.garden - (s.g12 || 0)) : 0, cur = this.elites.filter(e => e.garden12);
  if (!want) { for (const e of cur) this.roamDrop12(e); return; }
  if (cur.length >= want) return; const P = gardenSpots12(), img = roamImg12('mush'); if (!img) return; this.roam12 = this.roam12 || { map: 'town', list: [] };
  for (const q of P) { if (this.elites.filter(e => e.garden12).length >= want) break; if (!q || this.elites.some(e => e.x === q[0] && e.y === q[1]) || (q[0] === this.p.x && q[1] === this.p.y)) continue;
    const e = new Entity({ roam: 1, sp: 'mush', lv: 4, x: q[0], y: q[1], dir: 'down', img, garden12: 1, aggro: false }); e.home = [q[0], q[1], 'down']; e.timer = rnd(20, 80); e.px = e.x * 16; e.py = e.y * 16; this.elites.push(e); this.roam12.list.push(e); } };
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { const r = _ld.apply(this, a); this.garden12(); return r; }; }
{ const _ch = Overworld.prototype.dnChange12; Overworld.prototype.dnChange12 = function (...a) { _ch.apply(this, a); this.garden12(); }; }
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, ...a) { this._garden12 = !!e.garden12; const s = comState('c5', this.st), n0 = (s && s.g12) || 0;
    try { yield* _rf.call(this, e, ...a); } finally { this._garden12 = false; }
    if (e.garden12 && s && (s.g12 || 0) > n0) yield* say(s.g12 >= COM12.c5.garden ? '趕走了所有的嘟嘟菇！菜園安全了。\n（回去跟菜園大嬸報告吧）' : '趕走了嘟嘟菇！（' + s.g12 + '／' + COM12.c5.garden + '）'); }; }
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { if (cfg && this._garden12) { cfg = { ...cfg, garden12: 1 }; this._garden12 = false; } return yield* _bs.call(this, cfg, ...a); }; }
// counted when the battle is won, before the map comes back (so the garden does not refill)
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { if (this.cfg && this.cfg.garden12) { const s = comState('c5'); if (s) s.g12 = (s.g12 || 0) + 1; } return yield* _v.call(this); }; }

/* ---------- 護送：跟在後面走的人 ---------- */
Overworld.prototype.fol12Make = function () { const E = this.st && this.st.esc12; if (!E) { this.fol12 = null; return; } const p = this.p, [dx, dy] = DIRS[p.dir || 'down'];
  const f = new Entity({ id: 'fol12', x: p.x - dx, y: p.y - dy, dir: p.dir, look: E.look, frames: npcFrames(E.look) }); f.px = f.x * 16; f.py = f.y * 16; this.fol12 = f; };
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { const r = _ld.apply(this, a); this.fol12Make(); return r; }; }
{ const _sm = Overworld.prototype.startMove; Overworld.prototype.startMove = function (e, nx, ny, speed) { const f = this.fol12;
    if (f && e === this.p && !(nx === e.x && ny === e.y)) { const ox = e.x, oy = e.y; if (!(f.x === ox && f.y === oy)) { f.dir = ox > f.x ? 'right' : ox < f.x ? 'left' : oy < f.y ? 'up' : 'down'; _sm.call(this, f, ox, oy, speed); } }
    return _sm.call(this, e, nx, ny, speed); }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () { _up.call(this); if (this.fol12 && this.fol12.moving) this.updateMove(this.fol12); }; }
{ const _dc = Overworld.prototype.drawChar; Overworld.prototype.drawChar = function (x, e, frames, camX, camY) { const f = this.fol12;
    if (f && e === this.p && f.py <= e.py) _dc.call(this, x, f, f.frames, camX, camY); _dc.call(this, x, e, frames, camX, camY);
    if (f && e === this.p && f.py > e.py) _dc.call(this, x, f, f.frames, camX, camY); }; }
// hide 露卡 at her post while she walks with you
for (const n of MAPS.canyon.npcs || []) if (n.id === 'courier') { const sh = n.show; n.show = st => !(st.esc12 && st.esc12.k === 'c19') && (!sh || sh(st)); }
// arriving
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () { _os.call(this); const st = this.st, E = st && st.esc12; if (!E || this.script) return; const R = COM12[E.k] && COM12[E.k].escort; if (!R || this.map.id !== R.map) return;
    if (R.npc) { const n = this.npcs.find(q => q.id === R.npc); if (!n || Math.abs(n.x - this.p.x) + Math.abs(n.y - this.p.y) > 3) return; }
    const ow = this, k = E.k, s = comState(k, st);
    this.run((function* () { if (k === 'c9') yield* sayAll(['學徒小寶：「到了！我來挖挖看——」', '（叮叮噹噹……）', '小寶挖到了好幾塊硬石！\n「我先回去了！你也回去跟師傅說一聲喔！」']);
      if (k === 'c19') yield* sayAll(['露卡：「到了到了！卡爾大叔，信送到了！」', '卡爾：「辛苦了。路上沒被鷹妖抓走吧？」', '露卡：「有人陪我嘛！……這是說好的報酬，謝謝你！」']);
      st.esc12 = null; ow.fol12 = null; if (s) { s.e12 = 1; if (R.reward) { s.s = 'done'; Sound.sfx('select'); yield* say('完成了委託「' + COMMISSIONS[k].n + '」！'); yield* giveReward(COMMISSIONS[k].reward); } } })()); }; }

/* ---------- drawing ---------- */
{ const _wp = owWorldPost; owWorldPost = function (ow, x) { _wp(ow, x); invDraw12(ow, x); }; }
