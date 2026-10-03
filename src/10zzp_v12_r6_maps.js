/* ===================== v12.0.6 第六輪：套用大地圖（資料在 10zzp_v12_r6_mapdata.js，由 tools/bigmap_specs.py 產生） =====================
   - 野外地圖只往右／往下加大，原本的座標都不變；別張地圖進到右邊／下邊邊緣的座標跟著移到新的邊緣。
   - 每張大地圖：新的魔物出沒區（看得見的魔物，10zzn）、地標（第一次走到顯示名字）、洞窟（入口用洞口，最深處是洞窟之主）、
     旅人營地（休息、買東西、用素材換東西、一句情報）。
   - 舊存檔的探索紀錄跟著新地圖的大小搬過去。 */
const LANDMARK12 = {}, CAVE12 = {}, CAMP_IDS12 = new Set(['camp6_moki', 'camp6_karl', 'camp6_gavin', 'camp6_lottie', 'camp6_flora']);
(function () {
  for (const id in BIGMAP12) {
    const S = BIGMAP12[id], d = MAPS[id]; if (!d) continue;
    const padR = S.w - S.oldW, padB = S.h - S.oldH;
    d.rows = S.rows; d.big12 = { oldW: S.oldW, oldH: S.oldH };
    d.items = (d.items || []).concat(S.items || []);
    const gm = g => ({ ...g, mat: g.mat || (GATHER_KINDS[g.kind] || [])[1] });
    d.gathers = (d.gathers || []).concat((S.gathers || []).map(gm));
    d.signs = Object.assign(d.signs || {}, S.signs || {});
    d.npcs = (d.npcs || []).concat(S.npcs || []);
    if (S.zones) d.encounters = S.zones.concat(d.encounters || []);
    if (S.landmarks) LANDMARK12[id] = S.landmarks;
    for (const m in MAPS) { const o = MAPS[m], fix = t => { if (!t || t[0] !== id) return; if (padR && t[1] === S.oldW - 1) t[1] = S.w - 1; if (padB && t[2] === S.oldH - 1) t[2] = S.h - 1; };
      for (const w of o.edgeWarps || []) fix(w.to); if (o.northWarp) fix(o.northWarp.to); if (o.southWarp) fix(o.southWarp.to); if (o.exit) fix(o.exit.to); for (const b of o.buildings || []) fix(b.to); }
    const C = S.cave;
    if (C) {
      const pool = d.gearPool || [], i = Object.keys(BIGMAP12).indexOf(id);
      CAVE12[C.id] = { field: id, name: C.name };
      MAPS[C.id] = { name: C.name, type: '洞窟', music: 'ruins', border: 'R', popup: 1, battleBg: C.bg || 'ruins', roam12: 1, theme: C.theme || undefined, rows: C.rows, exit: C.exit,
        gearPool: pool, items: C.items, gathers: C.gathers.map(gm), encounters: C.zones,
        elites: [{ id: C.id + '_lord', sp: C.lord.sp, lv: C.lord.lv, x: C.lord.x, y: C.lord.y, dir: 'down', sight: 2, drop: pool[i % Math.max(1, pool.length)] }] };
      if (pool.length) LOOT[C.lord.sp] = pool.slice(0, 4);
      ELITE_TEXT[C.id + '_lord'] = ELITE_TEXT[C.lord.sp] || ['……！'];
      if (typeof EXPLORE !== 'undefined') EXPLORE[C.id] = C.name;
      const door = 'cave12_' + id; d.npcs.push({ id: door, x: S.caveDoor.x, y: S.caveDoor.y, dir: 'down', look: 'caveDoor', name: C.name });
      Events[door] = function* (ow) { if (yield* yesNo(C.name + '的入口。裡面黑漆漆的……要進去嗎？')) yield* ow.warp(C.id, C.ex, C.rows.length - 2, 'up'); };
    }
    for (const n of S.npcs || []) (CAMP_IDS12.has(n.id) ? NPC_ROLES.商店 : (NPC_ROLES.事件 || NPC_ROLES.情報)).push(n.id);
    if (C) (NPC_ROLES.事件 || NPC_ROLES.情報).push('cave12_' + id);
    delete mapCache[id];
  }
})();

CH2_PROPS.waterwheel = spriteFrom(['................', '.....kkkkkk.....', '...kkDrrrrDkk...', '..kDrkkrrkkrDk..', '..krk.krrk.krk..', '.kDrk..kk..krDk.', '.krrkkkkkkkkrrk.', '.krrrrkRRkrrrrk.',
  '.krrrrkRRkrrrrk.', '.krrkkkkkkkkrrk.', '.kDrk..kk..krDk.', '..krk.krrk.krk..', '..kDrkkrrkkrDk..', '.BBkkDrrrrDkkBB.', 'BbBbBkkkkkkBbBbB', 'bBbBbBbBbBbBbBbB'],
  { k: '#3a2a1e', r: '#a07a40', D: '#6a4a28', R: '#d8b070', B: '#4a90d0', b: '#8ad0f0' });
if (typeof PORTRAIT_PROPS !== 'undefined') PORTRAIT_PROPS.add('waterwheel');
Events.wheel6 = function* () { yield* say('大水車慢慢地轉著，把河水一勺一勺送進麥田。'); };
for (let i = 1; i <= 3; i++) Events['mill6_' + i] = function* () { yield* say('風車在丘頂上慢慢地轉著，發出嘎吱嘎吱的聲音。'); };

/* ---------- 新魔物的能力：跟同一張地圖的現有魔物對齊（等級換算＋角色），洞窟之主再乘菁英倍率 ---------- */
(function () {
  const KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'], EL = [1.35, 1.15, 1.05, 1.15, 1.05, 1.05];
  const refsOf = id => { const R = new Map(); for (const z of (MAPS[id] && MAPS[id].encounters) || []) for (const [sp, lo, hi] of z.table) if (!M6_KEYS.has(sp) && MON_PANEL[sp] && SPECIES[sp] && !SPECIES[sp].elite) R.set(sp, MON_PANEL[sp]); return [...R.values()]; };
  const calib = (sp, lv, refs, role, elite) => { if (!refs.length) return; const P = { lv }, R = CH2_ROLE[role] || CH2_ROLE.bal;
    KEYS.forEach((k, i) => { const m = refs.reduce((a, r) => a + r[k] * (lv + 10) / (r.lv + 10), 0) / refs.length; P[k] = Math.max(1, Math.round(m * R[i] * (elite ? EL[i] : 1))); });
    P.crit = elite ? 8 : 5; if (role === 'fast') P.eva = 6; MON_PANEL[sp] = P;
    const ex = refs.map(r => SPECIES[Object.keys(MON_PANEL).find(k => MON_PANEL[k] === r)] || {}), e = ex.reduce((a, q) => a + (q.exp || 0), 0) / ex.length, gd = ex.reduce((a, q) => a + (q.gold || 0), 0) / ex.length;
    if (e) SPECIES[sp].exp = Math.round(e * (elite ? 2.3 : 1)); if (!elite && gd) SPECIES[sp].gold = Math.round(gd); };
  const ROLE = Object.fromEntries(M6_MON.map(m => [m[0], m[4]]));
  for (const id in BIGMAP12) { const S = BIGMAP12[id], refs = refsOf(id);
    for (const z of S.zones || []) for (const [sp, lo, hi] of z.table) if (M6_KEYS.has(sp)) calib(sp, MON_PANEL[sp].lv, refs, ROLE[sp]);
    if (S.cave) { for (const z of S.cave.zones) for (const [sp] of z.table) if (M6_KEYS.has(sp) && !BIGMAP12[id].zones.some(q => q.table.some(t => t[0] === sp))) calib(sp, MON_PANEL[sp].lv, refs, ROLE[sp]);
      calib(S.cave.lord.sp, S.cave.lord.lv, refs, ROLE[S.cave.lord.sp], 1); } }
})();

/* ---------- 舊存檔的探索紀錄 ---------- */
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    const st = this.st, d = MAPS[id], B = d && d.big12;
    if (B && st && st.vis && st.vis[id] && st.vis[id].length === B.oldW * B.oldH) { const o = st.vis[id], W = d.rows[0].length, H = d.rows.length; let s = '';
      for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) s += xx < B.oldW && yy < B.oldH ? o[yy * B.oldW + xx] : '0'; st.vis[id] = s; }
    return _ld.call(this, id, x, y, dir, silent);
  }; }

/* ---------- 地標：第一次走到附近顯示名字 ---------- */
const landmarkSeen12 = (id, n, st = Game.st) => !!((st.lm12 || {})[id + ':' + n]);
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () {
    _os.call(this); const L = LANDMARK12[this.map.id]; if (!L) return; const st = this.st, p = this.p;
    for (const l of L) if (Math.max(Math.abs(p.x - l.x), Math.abs(p.y - l.y)) <= (l.r || 2) && !landmarkSeen12(this.map.id, l.n, st)) {
      (st.lm12 || (st.lm12 = {}))[this.map.id + ':' + l.n] = 1; this.popup = { name: '地標：' + l.n, t: 0 }; Sound.sfx('item'); break; }
  }; }
// 地圖畫面：收集進度多一項「地標」
{ const _mp = mapProgress12; mapProgress12 = function (id, st = Game.st) { const r = _mp(id, st), L = LANDMARK12[id]; if (L) r[0] += '　地標 ' + L.filter(l => landmarkSeen12(id, l.n, st)).length + '／' + L.length; return r; }; }

/* ---------- 旅人營地 ---------- */
const CAMP12 = {
  camp6_moki: { name: '莫奇', hi: '喲，旅人！在這裡歇歇腳吧。', stock: ['potion', 'superPotion', 'ether', 'antidote', 'parlyzHeal', 'awakening'],
    trade: [['gel', 3, 'superPotion', 1], ['hareFur', 3, 'ether', 1], ['moonDew', 2, 'manaPotion', 1], ['wood', 3, 'returnWing', 1]],
    tip: '溪的東邊有一個長滿霧的窪地，從北邊的小崖跳下去就到了。窪地南邊還有個洞窟，聽說裡面住著一隻會發光的大傢伙。' },
  camp6_karl: { name: '卡爾', hi: '商隊今天在這裡紮營。要什麼儘管說。', stock: ['superPotion', 'manaPotion', 'antidote', 'parlyzHeal', 'burnHeal', 'returnWing'],
    trade: [['lizardScale', 3, 'superPotion', 2], ['sandCrystal', 3, 'hiEther', 1], ['scorpTail', 3, 'superPotion', 3]],
    tip: '東邊的岩柱林底下有一段斷崖，跳下去就是乾河床。風蝕洞在最東南邊，裡面的石像鬼會捲起砂暴。' },
  camp6_gavin: { name: '蓋文', hi: '關道上的獵人小屋，歡迎進來烤烤火。', stock: ['superPotion', 'megaPotion', 'manaPotion', 'awakening', 'smoke', 'returnWing'],
    trade: [['stagHorn', 3, 'megaPotion', 1], ['boneShard', 3, 'hiEther', 1], ['ectoplasm', 2, 'elixir', 1]],
    tip: '東邊的台地往下跳很快，要上去得走最東邊的坡。舊隧道就在台地底下，聽說有一隻把隧道撞塌的大甲蟲。' },
  camp6_lottie: { name: '洛蒂', hi: '我是旅行藥師洛蒂。受傷了就來這裡休息吧。', stock: ['megaPotion', 'hiEther', 'antidote', 'parlyzHeal', 'awakening', 'burnHeal', 'elixir'],
    trade: [['wheat', 3, 'megaPotion', 1], ['honey', 2, 'hiEther', 1], ['banditCloth', 3, 'elixir', 1]],
    tip: '麥田的田埂像迷宮一樣，最裡面有人藏了東西。還有，舊穀倉的地窖最近一直有沙沙的怪聲。' },
  camp6_flora: { name: '芙蘿', hi: '歡迎來到溫泉小屋！泡一下溫泉，什麼疲勞都消了。', stock: ['megaPotion', 'megaEther', 'elixir', 'burnHeal', 'returnWing'],
    trade: [['magmaStone', 3, 'megaEther', 1], ['snowPelt', 3, 'elixir', 1], ['iceCrystal', 2, 'megaPotion', 1]],
    tip: '熔岩河只有兩座石橋能過。東邊黑曜石坡底下有個洞，熱得跟爐子一樣，最裡面好像有什麼在噴熔岩。' },
};
for (const k in CAMP12) Events[k] = function* (ow) {
  const C = CAMP12[k], st = Game.st; yield* say(C.name + '：「' + C.hi + '」');
  while (true) {
    const r = yield* ask('要做什麼？', ['休息', '買東西', '換東西', '聊天', '離開']);
    if (r === 0) yield* healRitual('在營火旁休息了一下。體力完全恢復了！');
    else if (r === 1) yield* shopFlow(C.stock.filter(i => ITEMS[i]));
    else if (r === 2) {
      const T = C.trade.filter(t => ITEMS[t[0]] && ITEMS[t[2]]), opts = T.map(t => ITEMS[t[0]].n + '×' + t[1] + ' → ' + ITEMS[t[2]].n + '×' + t[3] + '（有' + (st.bag[t[0]] || 0) + '）').concat(['不換了']);
      const c = yield* ask('用素材換東西：', opts); if (c < 0 || c >= T.length) continue; const t = T[c];
      if ((st.bag[t[0]] || 0) < t[1]) { yield* say(C.name + '：「' + ITEMS[t[0]].n + '不夠喔。」'); continue; }
      st.bag[t[0]] -= t[1]; st.bag[t[2]] = (st.bag[t[2]] || 0) + t[3]; Sound.jingle('item'); yield* say('換到了' + ITEMS[t[2]].n + '×' + t[3] + '！');
    }
    else if (r === 3) yield* say(C.name + '：「' + C.tip + '」');
    else break;
  }
};
