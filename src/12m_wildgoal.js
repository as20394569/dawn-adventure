/* ===================== v12.92 想打怪的理由：每日懸賞板＋稀有掉落保底（玩家：「我想要的是增加戰鬥意願」→ 不想打怪的原因選「打完拿不到想要的」「沒有打怪的目標」→ 兩個方向、四題都選推薦，2026-10-09） =====================
   一、每日懸賞（城鎮的告示板：萌芽鎮、王都、潮鳴港）
     · 遊戲裡每過一天換一批 3 張：①打倒某種魔物 ×N ②打倒某個種族 ×N ③在某張地圖打贏 N 場。目標從你去過、等級合適的地方挑。
     · 不用接，貼出來就開始算；完成了在任何一個城鎮的告示板領獎（金錢＋素材／藥水）。做完沒領的會留到領為止。
   二、稀有掉落保底
     · 每種野生魔物原本就有自己的稀有裝備（2%，金・虹）。現在每打倒一隻就 +1，到 30 一定掉，掉了重新算。
     · 名牌下排一個金色「★18/30」；圖鑑的掉落欄寫保底進度。 */
const WG13 = { pity: 30, n: 3 };
const wgSt13 = (st = Game.st) => st.wb13 || (st.wb13 = { day: -1, list: [] });
const wgRng13 = seed => () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >>> 8) / 16777216; };
// the wild species of the places you've been, near your level
function wgPool13(st) { const lv = st.lv || 1, maps = Object.keys(st.vis || {}).filter(id => MAPS[id] && (MAPS[id].encounters || []).length && !(typeof isChallenge13 === 'function' && isChallenge13(id)) && id !== 'rift');
  const P = [], all = []; for (const id of maps) for (const e of MAPS[id].encounters) for (const r of e.table || []) { const [sp, lo, hi, w] = r, S = SPECIES[sp]; if (!S || !w || S.rare || S.boss) continue;
      const o = { sp, map: id, lo, hi }; all.push(o); if (hi >= lv - 8 && lo <= lv + 3) P.push(o); }
  return P.length ? P : all; }
const wgGoldPer13 = (st, sp, lv) => Math.max(20, Math.round(((SPECIES[sp] || {}).gold || 30) * lv * (typeof V81_GOLD === 'function' ? V81_GOLD(st.lv || 1) : 1)));
const wgPot13 = st => (st.lv || 1) >= 30 ? 'megaPotion' : 'superPotion';
function wgMake13(st, day, keep) { const pool = wgPool13(st); if (!pool.length) return []; const R = wgRng13(day * 7919 + (st.lv || 1) * 31 + 17), pick = L => L[Math.floor(R() * L.length) % L.length], out = keep.slice(), used = new Set(keep.map(b => b.t));
  for (const t of ['sp', 'fam', 'map']) { if (out.length >= WG13.n) break; if (used.has(t)) continue;
    if (t === 'sp') { const o = pick(pool), lv = Math.round((o.lo + o.hi) / 2), need = 4 + Math.floor(R() * 3), mat = SPECIES[o.sp].mat;
      out.push({ t, sp: o.sp, map: o.map, need, got: 0, rw: { gold: Math.round(wgGoldPer13(st, o.sp, lv) * need * 0.8 / 10) * 10, items: mat && ITEMS[mat] ? { [mat]: 2 } : {} } }); }
    if (t === 'fam') { const fams = [...new Set(pool.map(o => SPECIES[o.sp].fam).filter(f => FAMILIES[f]))]; if (!fams.length) continue; const fam = pick(fams), need = 6 + Math.floor(R() * 3), L = pool.filter(o => SPECIES[o.sp].fam === fam), lv = Math.round(L.reduce((a, o) => a + (o.lo + o.hi) / 2, 0) / L.length);
      out.push({ t, fam, need, got: 0, rw: { gold: Math.round(wgGoldPer13(st, L[0].sp, lv) * need * 0.7 / 10) * 10, items: { [wgPot13(st)]: 1 } } }); }
    if (t === 'map') { const maps = [...new Set(pool.map(o => o.map))], map = pick(maps), need = 5 + Math.floor(R() * 2), L = pool.filter(o => o.map === map), o = pick(L), lv = Math.round((o.lo + o.hi) / 2), mat = SPECIES[o.sp].mat;
      out.push({ t, map, need, got: 0, rw: { gold: Math.round(wgGoldPer13(st, o.sp, lv) * need * 1.0 / 10) * 10, items: mat && ITEMS[mat] ? { [mat]: 2 } : {} } }); } }
  return out; }
// today's board (finished-but-unclaimed ones stay until claimed)
function wgToday13(st = Game.st) { const S = wgSt13(st), day = typeof dnDay12 === 'function' ? dnDay12(st) : (st.day || 1);
  if (S.day !== day) { const keep = S.list.filter(b => b.got >= b.need && !b.paid); S.list = wgMake13(st, day, keep); S.day = day; }
  return S.list; }
const wgName13 = b => b.t === 'sp' ? '打倒' + SPECIES[b.sp].n + ' ×' + b.need : b.t === 'fam' ? '打倒' + FAMILIES[b.fam].n + '的魔物 ×' + b.need : '在' + MAPS[b.map].name + '打贏 ' + b.need + ' 場';
const wgWhere13 = b => b.t === 'sp' ? '出沒：' + MAPS[b.map].name : b.t === 'fam' ? '哪裡的' + FAMILIES[b.fam].n + '都算' : '只要是這張地圖的戰鬥都算';
// counting
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this); const st = Game.st; if (!st || !(st.hp > 0)) return r;
    const L = (this.defeated ? this.defeated() : []).filter(v => !v.elite && !v.boss), kind = (this.cfg && this.cfg.kind) || 'wild', map = Game.ow && Game.ow.map && Game.ow.map.id;
    if (st.wb13 && st.wb13.list) { const fin = [];
      for (const b of wgToday13(st)) { if (b.paid || b.got >= b.need) continue; const g0 = b.got;
        if (b.t === 'sp') b.got = Math.min(b.need, b.got + L.filter(v => v.sp === b.sp).length);
        else if (b.t === 'fam') b.got = Math.min(b.need, b.got + L.filter(v => (SPECIES[v.sp] || {}).fam === b.fam).length);
        else if (b.t === 'map' && kind === 'wild' && map === b.map && L.length) b.got = Math.min(b.need, b.got + 1);
        if (b.got >= b.need && g0 < b.need) fin.push(b); }
      for (const b of fin) { Sound.jingle('item'); yield* this.msg('懸賞「' + wgName13(b) + '」完成了！回城鎮的告示板領獎。', { hold: 40 }); } }
    // 稀有掉落保底
    const mul = (typeof dropMul13 === 'function' ? dropMul13() : 1) * (this.cfg && this.cfg.champ12 ? 3 : 1), P = st.rp13 || (st.rp13 = {});
    for (const v of L) { if (v.minion) continue; const k = typeof rareOf13 === 'function' ? rareOf13(v.sp) : null; if (!k) continue; const n = (P[v.sp] || 0) + 1, sure = n >= WG13.pity;
      if (!sure && !chance(0.02 * mul)) { P[v.sp] = n; continue; } P[v.sp] = 0;
      this.focus = v; const g = makeGear(k, chance(RARE13.rainbow) ? 5 : 4); Sound.jingle('item'); yield* this.lootShow(g, v.n + '掉落了稀有裝備！' + (sure ? '（保底）' : '')); }
    return r; }; }
RARE13.rate = 0; // the old 2% roll (10zzz_v12_u9_grind) is done above, with the 保底
// the plate: ★n/30
{ const _sg = KB12.signs; KB12.signs = function (v, short) { const L = _sg.call(this, v, short); if (!v || v.hero || !short || v.elite || v.boss || v.minion) return L;
    const u = this.core && this.core.byId[v.id]; if (u && (u.elite || u.boss)) return L; const k = typeof rareOf13 === 'function' ? rareOf13(v.sp) : null; if (!k) return L;
    const n = ((Game.st && Game.st.rp13) || {})[v.sp] || 0; L.push(['★' + n + '/' + WG13.pity, '#ffd860', 'rgba(70,50,8,0.92)']); return L; }; }
// 圖鑑：保底進度
{ const _fd = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _fd(sp, key, kind); if (kind && kind !== 'wild') return L; const n = ((Game.st && Game.st.rp13) || {})[sp] || 0;
    return L.map(t => typeof t === 'string' && t.startsWith('稀有：') ? t.replace('（金・虹，2%）', '') + '　保底 ' + n + '/' + WG13.pity : t); }; }
/* ---------- 告示板 ---------- */
function* wgBoard13(ow) { const st = Game.st;
  while (true) { const L = wgToday13(st), day = st.wb13.day;
    const opts = L.map(b => ({ t: wgName13(b), r: b.paid ? '已領' : b.got >= b.need ? '可以領！' : b.got + '/' + b.need, col: b.paid ? UIC.dis : b.got >= b.need ? UIC.warm : UIC.text }));
    if (!L.length) { yield* say('今天沒有懸賞。'); return; }
    const r = yield* ask('每日懸賞（第 ' + day + ' 天）\n不用接，貼出來就開始算；過一天換新的。', opts.concat(['離開'])); if (r < 0 || r >= L.length) return;
    const b = L[r];
    if (b.paid) { yield* say('這張已經領過了。明天會貼新的。'); continue; }
    if (b.got >= b.need) { b.paid = 1; Sound.jingle('item'); yield* say('懸賞「' + wgName13(b) + '」完成！'); yield* giveReward(b.rw); continue; }
    yield* say(wgName13(b) + '（' + b.got + '/' + b.need + '）\n' + wgWhere13(b) + '\n獎勵：' + rewardText(b.rw)); } }
{ Events.board = function* (ow) { const st = Game.st, L = wgToday13(st), ready = L.filter(b => !b.paid && b.got >= b.need).length;
    const r = yield* ask('「' + ((ow && ow.map && ow.map.d && ow.map.d.name) || '城鎮') + '的告示板」', ['每日懸賞' + (ready ? '（' + ready + ' 張可以領）' : ''), '鎮民的委託', '離開']);
    if (r === 0) return yield* wgBoard13(ow); if (r === 1) return yield* wgCom13(); }; }
// the town's commissions (the old board's list, without its 萌芽鎮 title)
function* wgCom13() { const st = Game.st;
  while (true) { const ids = Object.keys(COMMISSIONS).filter(k => COMMISSIONS[k].open(st) && COM_GIVER[k]); if (!ids.length) { yield* say('現在沒有鎮民的委託。'); return; }
    const opts = ids.map(k => { const s = comState(k, st), p = comProgress(k, st); return { t: COMMISSIONS[k].n, r: !s ? '未接' : s.s === 'done' ? '完成' : p.ready ? '可回報' : '進行中', col: !s ? UIC.accent : s.s === 'done' ? UIC.dis : p.ready ? UIC.warm : UIC.text }; });
    const r = yield* ask('鎮民的請求。直接去找委託人就能接下。', opts.concat(['離開'])); if (r < 0 || r >= ids.length) return;
    const k = ids[r], c = COMMISSIONS[k], g = COM_GIVER[k]; yield* say('委託人：' + c.from + '（' + (NPC_WHERE[g] || '？') + '）\n' + c.d); yield* comHintSay(c); yield* say('報酬：' + rewardText(c.reward)); } }
// 潮鳴港 gets a board too (萌芽鎮、王都 already have one)
if (MAPS.harbor13 && Array.isArray(MAPS.harbor13.rows)) { const R = MAPS.harbor13.rows, y = 8, x = 5; if (R[y] && R[y][x] === '.') { R[y] = R[y].slice(0, x) + 'N' + R[y].slice(x + 1); if (typeof mapCache !== 'undefined') delete mapCache.harbor13; } }
// 任務清單
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); if (!st.wb13) return; const B = wgToday13(st); if (!B.length) return;
    L.push({ n: '每日懸賞', t: B.map(b => wgName13(b) + '（' + (b.paid ? '已領' : b.got >= b.need ? '可以領' : b.got + '/' + b.need) + '）').join('、') + '。城鎮的告示板領獎，每天換新的。', done: false, rw: '金錢・素材・藥水' }); }; }
// the board starts counting from the first time you see it (or the first battle after this update)
{ const _ow = startOverworld; startOverworld = function () { const r = _ow.apply(this, arguments); try { if (Game.st) wgToday13(Game.st); } catch (e) { console.error(e); } return r; }; }
