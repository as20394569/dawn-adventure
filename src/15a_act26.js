/* ===================== 即時動作戰鬥 試玩版（只在 window.ACT_DEMO 的試玩連結裡開） =====================
   玩家 2026-10-14：試玩玩家大多玩到 Lv20 左右就不玩了（沒有動力、不知道為什麼要玩，是玩法的問題）→ 選「核心玩法重做」：
   C 即時動作（在大地圖上直接打）、停下來自動攻擊、看得到的魔物群、先做小原型（另一個連結，正式版不動）。
   這個原型：
   · 地圖「試煉草原」（act26）：下面是泡泡姆・嘟嘟菇，中段電電蜂和菁英狂牙狼，最上面圍起來的空地是頭目磨石魔像。
   · 主角在地圖上自由走（不再一格一格），方向鍵移動；放開方向鍵就自動打最近的魔物（劍：近身斬，法杖：魔力彈）。
   · A・B 放技能（有冷卻、花 MP）：劍＝裂風斬（往前衝刺斬，衝刺時不會受傷）・旋風斬（打一圈）；
     法杖＝火球（爆炸範圍）・冰霜新星（打一圈＋凍住）。
   · 魔物出招前地上會先出現紅色範圍（跳撲、孢子爆、毒針、衝撞、頭目的重擊・落石），看到就跑開。
   · 一般魔物被打到會中斷出招、往後退；菁英和頭目不會被打斷。
   · 打倒拿經驗升級（升級回滿血），菁英・頭目掉寶箱；倒下會回到營地重來。沒有存檔。 */
const ACT26 = { on: () => typeof window !== 'undefined' && !!window.ACT_DEMO };
// ---------- 試玩地圖（只有試玩連結才加，正式版的地圖清單不變） ----------
if (ACT26.on()) { const W0 = 26, H0 = 52, g = []; for (let y = 0; y < H0; y++) g.push(Array(W0).fill('.'));
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < W0 && y < H0) g[y][x] = c; }, rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
  rect(0, 0, W0 - 1, 1, 'T'); rect(0, H0 - 2, W0 - 1, H0 - 1, 'T'); rect(0, 0, 1, H0 - 1, 'T'); rect(W0 - 2, 0, W0 - 1, H0 - 1, 'T');
  rect(2, 13, W0 - 3, 14, 'T'); rect(11, 13, 14, 14, ':'); // 頭目空地的樹牆，中間留入口
  for (let y = 15; y <= 49; y++) { set(12, y, ':'); set(13, y, ':'); }
  for (let y = 3; y <= 11; y++) for (let x = 3; x <= 22; x++) if ((x * 3 + y * 5) % 11 === 0) set(x, y, ',');
  for (const [x, y] of [[4, 18], [19, 26], [5, 29], [20, 36], [4, 40], [17, 44], [7, 34], [21, 17], [3, 4], [21, 9]]) rect(x, y, x + 1, y + 1, 'T');
  for (const [x, y] of [[9, 22], [16, 24], [8, 38], [17, 40], [6, 45], [19, 31], [16, 19], [9, 30], [6, 7], [19, 5], [8, 10], [17, 11]]) set(x, y, 'o');
  rect(3, 42, 5, 44, '#'); rect(18, 46, 21, 48, '#'); rect(15, 28, 17, 30, '#'); rect(4, 24, 6, 26, '#');
  for (let i = 0; i < 46; i++) { const x = 2 + (i * 7) % 22, y = 15 + (i * 13) % 34; if (g[y][x] === '.') set(x, y, i % 2 ? 'f' : 'y'); }
  set(10, 47, 'S');
  MAPS.act26 = { name: '試煉草原', outdoor: true, border: 'T', rows: g.map(r => r.join('')), music: MAPS.route && MAPS.route.music, npcs: [], items: [], elites: [], triggers: [], encounters: [] }; }
// ---------- 魔物 ----------
const AMON26 = {
  slime: { ai: 'hop', sc: 0.5, spd: 0.45, r: 7, range: 44, wind: 38, pow: 1.0, cd: 80 },
  mush: { ai: 'burst', sc: 0.5, spd: 0.28, r: 7, range: 24, wind: 50, pow: 1.15, cd: 95, aoe: 26 },
  bee: { ai: 'shoot', sc: 0.5, spd: 0.8, r: 6, range: 78, keep: 50, wind: 30, pow: 0.9, cd: 85 },
  pebble: { ai: 'hop', sc: 0.45, spd: 0.55, r: 6, range: 40, wind: 32, pow: 0.9, cd: 75 },
  wolf: { ai: 'wolf', sc: 0.72, spd: 0.95, r: 10, range: 80, wind: 40, pow: 1.4, cd: 70, elite: 1 },
  millGolem: { ai: 'boss', sc: 0.82, spd: 0.38, r: 16, range: 140, wind: 56, pow: 1.7, cd: 60, boss: 1 } };
const SPAWN26 = [['slime', 2, 8, 44, 'a'], ['slime', 2, 16, 42, 'a'], ['slime', 3, 6, 37, 'a'], ['mush', 2, 18, 38, 'a'], ['slime', 3, 15, 34, 'a'], ['mush', 3, 8, 32, 'a'],
  ['bee', 3, 6, 27, 'b'], ['bee', 3, 17, 22, 'b'], ['mush', 3, 9, 20, 'b'], ['bee', 4, 6, 17, 'b'], ['slime', 4, 16, 28, 'b'], ['wolf', 5, 19, 21, 'e'], ['millGolem', 7, 12, 6, 'boss']];
const SKILL26 = { 劍: [{ id: 'dash', n: '裂風斬', cd: 140, mp: 4 }, { id: 'spin', n: '旋風斬', cd: 300, mp: 7 }], 法杖: [{ id: 'fireball', n: '火球', cd: 110, mp: 5 }, { id: 'nova', n: '冰霜新星', cd: 360, mp: 8 }] };
function mkAct26(sp, lv, tx, ty, zone) { const D = AMON26[sp], kind = D.boss ? 'boss' : D.elite ? 'elite' : 'wild', f = makeFoe(sp, lv, kind), S = f.stats, mul = D.boss ? 12 : D.elite ? 9 : 1.7;
  const e = new Entity({ x: tx, y: ty, dir: 'down' }); Object.assign(e, { act26: 1, sp, lv, zone, D, n: f.n, kind, maxhp: Math.round(f.maxhp * mul), atk: S.atk, def: S.def, spa: S.spa, mdef: S.spd,
    cx: tx * 16 + 8, cy: ty * 16 + 12, homeX: tx * 16 + 8, homeY: ty * 16 + 12, st: 'idle', t: 0, cd: 40 + Math.random() * 60, flash: 0, frz: 0, slow: 0, kx: 0, ky: 0, hz: 0, spawn: [sp, lv, tx, ty, zone] });
  e.hp = e.maxhp; e.px = e.cx - 8; e.py = e.cy - 15; return e; }
// ---------- 畫圖：從戰鬥圖（Q 版）切出各動作，縮小 ----------
const AFR26 = {};
function actFrames26(sp, sc) { const k = sp + sc; if (AFR26[k]) return AFR26[k]; const b = typeof chibiBase === 'function' && chibiBase(sp), M = b && BATTLE_PXC_META[b], im = b && chibiImage(sp);
  if (!M || !im || im.ok === false || im.complete === false || !(im.width > 0)) { const r = typeof roamImg12 === 'function' ? roamImg12(sp) : null; return r ? { idle: [r.c], attack: [r.c], hurt: [r.c], cast: [r.c], w: r.c.width, h: r.c.height, tmp: 1 } : null; }
  const w = Math.max(1, Math.round(M.w * sc)), h = Math.max(1, Math.round(M.h * sc)), cut = i => { const c = mkCanvas(w, h), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, i * M.w, 0, M.w, M.h, 0, 0, w, h); return c; };
  const F = M.frames, o = { w, h }; for (const s of ['idle', 'attack', 'hurt', 'cast']) o[s] = (F[s] || F.attack || F.idle).map(cut); return (AFR26[k] = o); }
const WHT26 = new WeakMap();
function whiteOf26(c, col) { let m = WHT26.get(c); if (!m) WHT26.set(c, m = {}); if (m[col]) return m[col]; const o = mkCanvas(c.width, c.height), x = o.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.fillRect(0, 0, o.width, o.height); return (m[col] = o); }
// ---------- 開始 ----------
function act26Alloc(st, kind) { if (!st.attr || typeof attrAvail !== 'function') return; const ks = kind === '法杖' ? ['int', 'int', 'vit', 'dex'] : ['str', 'str', 'vit', 'agi']; let n = attrAvail(st), i = 0; while (n-- > 0) { const k = ks[i++ % ks.length]; st.attr[k] = (st.attr[k] || 0) + 1; } }
function act26Start(kind) {
  Game.st = newGameState('勇者'); const st = Game.st; st.lv = 3; st.exp = expForLevel(3); st.map = 'act26'; st.x = 12; st.y = 47; st.dir = 'up'; st.status = null; st.clock = 300; st.dnHalf9 = 1; st.wx = {};
  Object.assign(st.flags, { woke: 1, tutInert11: 1, tutPart11: 1, tutWard12: 1 }); Game.settings.questHud = false;
  const w = makeGear(BASE11.weapon[kind][0], 2); st.equip.weapon = w.u; for (const sl of ['head', 'body', 'feet']) { const k = BASE11.armor[kind === '法杖' ? '法衣' : '輕裝'][sl][0]; if (k) st.equip[sl] = makeGear(k, 2).u; }
  act26Alloc(st, kind); const S = heroStats(st); st.hp = S.hp; st.mp = S.mp;
  startOverworld(); const ow = Game.scene; UI.clear(); ow.script = null; act26Init(ow, kind); }
function act26Init(ow, kind) { ow.npcs = []; ow.items = []; ow.boss = null; ow.popup = null;
  ow.act26 = { kind, mons: SPAWN26.map(s => mkAct26(...s)), tele: [], proj: [], fx: [], nums: [], chests: [], cd: { atk: 20, a: 0, b: 0 }, iframe: 0, calm: 0, t: 0, stop: 0, shake: 0, dash: null, bossOn: 0, won: 0, zoneDead: {}, hint: 300, S: heroStats(ow.st), kills: 0 };
  ow.p.px = 12 * 16; ow.p.py = 47 * 16; ow.p.dir = 'up'; act26Ents(ow); }
const GROUND26 = { act26g: 1, px: 0, py: -1e6, x: 0, y: 0 }, TOP26 = { act26t: 1, px: 0, py: 1e6, x: 0, y: 0 };
function act26Ents(ow) { ow.elites = [GROUND26, ...ow.act26.mons.filter(e => !e.gone), TOP26]; }
// ---------- 小工具 ----------
const A26 = {
  heroPt: ow => [ow.p.px + 8, ow.p.py + 12],
  free(ow, cx, cy, r) { for (const [dx, dy] of [[-r, -r * 0.5], [r, -r * 0.5], [-r, r * 0.4], [r, r * 0.4]]) if (ow.solidAt(Math.floor((cx + dx) / 16), Math.floor((cy + dy) / 16))) return false; return true; },
  num(A, x, y, s, c, big) { A.nums.push({ x, y, s: String(s), c, t: 0, big }); },
  near(ow, A, range) { const [hx, hy] = A26.heroPt(ow); let best = null, bd = range; for (const e of A.mons) { if (e.dead || e.gone) continue; const d = Math.hypot(e.cx - hx, e.cy - 4 - (hy - 4)) - e.D.r * 0.6; if (d < bd) { bd = d; best = e; } } return best; },
  faceTo(ow, tx, ty) { const [hx, hy] = A26.heroPt(ow), dx = tx - hx, dy = ty - hy; ow.p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); ow.st.dir = ow.p.dir; },
};
// 主角打魔物
function act26HitFoe(ow, A, e, pow, magic, o = {}) { if (e.dead) return 0; const S = A.S, Atk = magic ? S.spa : S.atk, Def = (e.def + e.mdef) / 2; // 物理・魔法都用魔物兩種防禦的平均（劍和法杖差不多強）
  let d = Math.max(1, (Atk * pow * 1.3 - Def * 0.5) * (0.9 + Math.random() * 0.2)); const crit = Math.random() * 100 < (S.crit || 5); if (crit) d *= 1.6; d = Math.round(d);
  e.hp -= d; e.flash = 7; const [hx, hy] = A26.heroPt(ow), ang = Math.atan2(e.cy - hy, e.cx - hx), kb = (o.kb || 2.4) * (e.D.boss ? 0 : e.D.elite ? 0.3 : 1); e.kx += Math.cos(ang) * kb; e.ky += Math.sin(ang) * kb;
  if (!e.D.boss && !e.D.elite && (e.st === 'wind' || e.st === 'chase' || e.st === 'idle')) { if (e.st === 'wind') { A.tele = A.tele.filter(T => T.owner !== e); A26.num(A, e.cx, e.cy - 30, '打斷', '#8ad8ff'); } e.st = 'hurt'; e.t = 0; }
  if (e.st === 'idle') e.st = 'chase';
  A26.num(A, e.cx + (Math.random() * 8 - 4), e.cy - e.D.r - 14, d, crit ? '#ffb040' : '#ffffff', crit); Sound.sfx(crit ? 'crit' : 'hit'); if (crit) A.stop = Math.max(A.stop, 3);
  A.fx.push({ k: 'spark', x: e.cx, y: e.cy - e.D.r, t: 0, life: 12, c: magic ? '#a8e0ff' : '#fff2c0' });
  if (e.hp <= 0) act26Kill(ow, A, e); return d; }
function act26Kill(ow, A, e) { e.dead = 1; e.deadT = 0; e.hp = 0; A.tele = A.tele.filter(T => T.owner !== e); A.kills++; const st = ow.st;
  const exp = Math.round((e.D.boss ? 90 : e.D.elite ? 34 : 6) * e.lv), gold = e.lv * (e.D.boss ? 40 : e.D.elite ? 15 : 3); st.gold = (st.gold || 0) + gold;
  A26.num(A, e.cx, e.cy - 24, '+' + exp + ' EXP', '#c8f080'); A.fx.push({ k: 'burst', x: e.cx, y: e.cy - e.D.r, t: 0, life: 20, r: e.D.r + 10 }); Sound.sfx(e.D.boss || e.D.elite ? 'bladeHitSuper' : 'hitSuper'); A.stop = Math.max(A.stop, e.D.boss ? 14 : 4);
  if (e.D.elite || e.D.boss) A.chests.push({ x: e.cx, y: e.cy, q: e.D.boss ? 4 : 3, t: 0, open: 0 });
  if (e.D.boss) { A.won = 1; A.shake = 20; }
  act26Exp(ow, A, exp); }
function act26Exp(ow, A, n) { const st = ow.st; st.exp = (st.exp || 0) + n; let up = 0; while (st.lv < 99 && st.exp >= expForLevel(st.lv + 1)) { st.lv++; up++; }
  if (up) { act26Alloc(st, A.kind); A.S = heroStats(st); st.hp = A.S.hp; st.mp = A.S.mp; const [hx, hy] = A26.heroPt(ow); A26.num(A, hx, hy - 34, 'LEVEL UP!', '#ffe070', 1); A.fx.push({ k: 'ring', x: hx, y: hy, t: 0, life: 26, r: 30, c: '#ffe070' }); Sound.sfx('statUp'); } }
// 魔物打主角
function act26HitHero(ow, A, e, pow) { if (A.iframe > 0 || A.dash || A.won) return; const st = ow.st, S = A.S, rnd9 = 0.9 + Math.random() * 0.2; let d = Math.max(1, Math.round((e.atk * pow * 1.15 - (S.def || 0) * 0.45) * rnd9));
  if (e.D.boss || e.D.elite) { const lvk = clamp(1 + 0.06 * (e.lv - st.lv), 0.7, 1.5); d = Math.max(1, Math.round(S.hp * (e.D.boss ? 0.27 : 0.2) * (pow / e.D.pow) * lvk * rnd9)); } // 菁英・頭目：一下約主角血量的 2〜3 成（躲不掉也撐得了幾下）
  st.hp = Math.max(0, st.hp - d); A.iframe = 48; A.shake = Math.max(A.shake, e.D.boss ? 10 : 5); A.calm = 0; const [hx, hy] = A26.heroPt(ow); A26.num(A, hx, hy - 26, d, '#ff6a5a', d >= S.hp * 0.25); Sound.sfx('heavy'); Game.flash = 0.18; Game.flashColor = '#ff3020'; }
// 判定：主角在不在紅色範圍裡
function teleHit26(T, hx, hy) { if (T.shape === 'circle') return Math.hypot(hx - T.x, hy - T.y) <= T.r + 3;
  const ux = Math.cos(T.ang), uy = Math.sin(T.ang), px = hx - T.x, py = hy - T.y, along = px * ux + py * uy, side = Math.abs(-px * uy + py * ux); return along >= -4 && along <= T.len + 4 && side <= T.w / 2 + 3; }
// ---------- 每一格 ----------
function act26Tick(ow, A) { const st = ow.st, p = ow.p; A.t++; if (A.hint > 0) A.hint -= A.kills ? 3 : 1;
  if (A.won && !A.wonShown && A.t > 0) { A.wonT = (A.wonT || 0) + 1; if (A.wonT > 150) { A.wonShown = 1; ow.run(act26Clear(ow)); return; } }
  if (Input.pressed('start')) { Input.consume('start'); ow.run(act26Menu(ow)); return; }
  for (const k in A.cd) if (A.cd[k] > 0) A.cd[k]--; if (A.iframe > 0) A.iframe--;
  if (A.t % 50 === 0) st.mp = Math.min(A.S.mp, (st.mp || 0) + 1);
  A.calm++; if (A.calm > 150 && A.t % 18 === 0 && st.hp < A.S.hp) st.hp++;
  // 移動
  const [hx0, hy0] = A26.heroPt(ow); let moved = false;
  if (A.dash) { const D = A.dash; D.t++; const sp = D.len / D.dur; for (let k = 0; k < 3; k++) { const nx = p.px + 8 + D.ux * sp / 3, ny = p.py + 12 + D.uy * sp / 3; if (A26.free(ow, nx, ny, 5)) { p.px += D.ux * sp / 3; p.py += D.uy * sp / 3; } }
    const [hx, hy] = A26.heroPt(ow); for (const e of A.mons) if (!e.dead && !D.hit.has(e) && Math.hypot(e.cx - hx, e.cy - 4 - hy) < e.D.r + 14) { D.hit.add(e); act26HitFoe(ow, A, e, 1.8, false, { kb: 4 }); }
    A.fx.push({ k: 'trail', x: hx, y: hy - 6, t: 0, life: 10 }); moved = true; if (D.t >= D.dur) A.dash = null; }
  else { const d = Input.dir(); if (d) { const [dx, dy] = DIRS[d], spd = 1.3; p.dir = d; st.dir = d;
      const nx = p.px + dx * spd, ny = p.py + dy * spd; if (A26.free(ow, nx + 8, p.py + 12, 5)) p.px = nx; if (A26.free(ow, p.px + 8, ny + 12, 5)) p.py = ny; moved = true; } }
  if (moved && !A.dash) { p.moving = true; p.prog = (p.prog || 0) + 1.3; if (p.prog >= 16) { p.prog -= 16; p.foot ^= 1; } } else { p.moving = false; p.prog = 0; }
  // 推開重疊的魔物（不會卡在一起）
  { const [hx, hy] = A26.heroPt(ow); for (const e of A.mons) { if (e.dead) continue; const dx = hx - e.cx, dy = hy - e.cy, d = Math.hypot(dx, dy), m = e.D.r + 4; if (d < m && d > 0.01) { const push = (m - d) * 0.5; const nx = p.px + dx / d * push, ny = p.py + dy / d * push; if (A26.free(ow, nx + 8, ny + 12, 5)) { p.px = nx; p.py = ny; } } } }
  p.x = Math.floor((p.px + 8) / 16); p.y = Math.floor((p.py + 12) / 16); st.x = p.x; st.y = p.y;
  // 自動攻擊（停下來才打）
  if (!moved && !A.dash && A.cd.atk <= 0 && !A.won) { const staff = A.kind === '法杖', e = A26.near(ow, A, staff ? 104 : 24);
    if (e) { A26.faceTo(ow, e.cx, e.cy - 6); const [hx, hy] = A26.heroPt(ow);
      if (staff) { const a = Math.atan2(e.cy - 8 - (hy - 8), e.cx - hx); A.proj.push({ hero: 1, x: hx, y: hy - 8, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2, r: 3, pow: 1.0, magic: 1, life: 60, tgt: e, k: 'orb' }); A.cd.atk = 40; Sound.sfx('mana'); }
      else { const a = Math.atan2(e.cy - 6 - (hy - 6), e.cx - hx); A.fx.push({ k: 'slash', x: hx, y: hy - 6, a, t: 0, life: 9 }); A.cd.atk = 30; Sound.sfx('slash');
        for (const f of A.mons) { if (f.dead) continue; const da = Math.atan2(f.cy - 6 - (hy - 6), f.cx - hx), dd = Math.hypot(f.cx - hx, f.cy - 6 - (hy - 6)); let diff = Math.abs(da - a); if (diff > Math.PI) diff = 2 * Math.PI - diff; if (dd <= 26 + f.D.r * 0.6 && diff < 1.3) act26HitFoe(ow, A, f, 1.0, false); } } } }
  // 技能
  for (const [key, i] of [['a', 0], ['b', 1]]) if (Input.pressed(key)) { Input.consume(key); act26Skill(ow, A, i); }
  // 魔物
  for (const e of A.mons) act26Foe(ow, A, e);
  for (let i = 0; i < A.mons.length; i++) for (let j = i + 1; j < A.mons.length; j++) { const a = A.mons[i], b = A.mons[j]; if (a.dead || b.dead) continue; const dx = b.cx - a.cx, dy = b.cy - a.cy, d = Math.hypot(dx, dy) || 0.01, m = (a.D.r + b.D.r) * 0.8; if (d < m) { const k = (m - d) / 2 / d; if (!a.D.boss) { a.cx -= dx * k; a.cy -= dy * k; } if (!b.D.boss) { b.cx += dx * k; b.cy += dy * k; } } }
  // 紅色範圍
  for (const T of A.tele) { T.t++; if (T.t === T.dur) { const [hx, hy] = A26.heroPt(ow); if (T.dmg && teleHit26(T, hx, hy - 4)) act26HitHero(ow, A, T.owner, T.pow); if (T.fire) T.fire(T); if (T.shake) A.shake = Math.max(A.shake, T.shake); A.fx.push({ k: 'puff', x: T.x + (T.shape === 'circle' ? 0 : Math.cos(T.ang) * T.len / 2), y: T.y + (T.shape === 'circle' ? 0 : Math.sin(T.ang) * T.len / 2), t: 0, life: 14, r: T.r || 14 }); } }
  A.tele = A.tele.filter(T => T.t < T.dur);
  // 飛行物
  for (const P of A.proj) { P.life--; if (P.tgt && !P.tgt.dead) { const a = Math.atan2(P.tgt.cy - 8 - P.y, P.tgt.cx - P.x), s = Math.hypot(P.vx, P.vy); P.vx += (Math.cos(a) * s - P.vx) * 0.12; P.vy += (Math.sin(a) * s - P.vy) * 0.12; }
    P.x += P.vx; P.y += P.vy; if (ow.solidAt(Math.floor(P.x / 16), Math.floor((P.y + 6) / 16)) && !P.fly) P.life = 0;
    if (P.hero) { for (const e of A.mons) if (!e.dead && Math.hypot(e.cx - P.x, e.cy - e.D.r * 0.8 - P.y) < e.D.r + P.r) { if (P.boom) act26Boom(ow, A, P); else act26HitFoe(ow, A, e, P.pow, P.magic); P.life = 0; break; } if (P.life <= 0 && P.boom && !P.boomed) act26Boom(ow, A, P); }
    else { const [hx, hy] = A26.heroPt(ow); if (Math.hypot(hx - P.x, hy - 6 - P.y) < P.r + 4) { act26HitHero(ow, A, P.owner, P.pow); P.life = 0; } } }
  A.proj = A.proj.filter(P => P.life > 0);
  // 寶箱
  for (const C of A.chests) { C.t++; const [hx, hy] = A26.heroPt(ow); if (!C.open && C.t > 30 && Math.hypot(hx - C.x, hy - C.y) < 14) { C.open = 1; act26Loot(ow, A, C); } }
  // 重生（一區清空、主角走遠之後）
  for (const z of ['a', 'b']) { const L = A.mons.filter(e => e.zone === z); if (L.every(e => e.dead)) { A.zoneDead[z] = (A.zoneDead[z] || 0) + 1; const [, hy] = A26.heroPt(ow), zy = z === 'a' ? 40 * 16 : 23 * 16; if (A.zoneDead[z] > 900 && Math.abs(hy - zy) > 150) { A.mons = A.mons.filter(e => e.zone !== z); for (const s of SPAWN26) if (s[4] === z) A.mons.push(mkAct26(...s)); A.zoneDead[z] = 0; } } else A.zoneDead[z] = 0; }
  for (const e of A.mons) if (e.dead) { e.deadT++; if (e.deadT > 30) e.gone = 1; }
  for (const F of A.fx) F.t++; A.fx = A.fx.filter(F => F.t < F.life); for (const N of A.nums) N.t++; A.nums = A.nums.filter(N => N.t < 44);
  if (A.shake > 0) { A.shake--; ow.camDX = (Math.random() - 0.5) * Math.min(6, A.shake); ow.camDY = (Math.random() - 0.5) * Math.min(6, A.shake); } else { ow.camDX = 0; ow.camDY = 0; }
  ow.hideHero = A.iframe > 0 && (A.t >> 2) % 2 === 1;
  if (st.hp <= 0) { ow.hideHero = false; ow.run(act26Die(ow)); }
  act26Ents(ow); }
function act26Boom(ow, A, P) { P.boomed = 1; A.fx.push({ k: 'boom', x: P.x, y: P.y, t: 0, life: 18, r: 24 }); A.shake = Math.max(A.shake, 4); Sound.sfx('fire'); for (const e of A.mons) if (!e.dead && Math.hypot(e.cx - P.x, e.cy - e.D.r * 0.8 - P.y) < 24 + e.D.r * 0.6) act26HitFoe(ow, A, e, 2.0, true, { kb: 3.5 }); }
function act26Skill(ow, A, i) { const K = SKILL26[A.kind][i], st = ow.st, [hx, hy] = A26.heroPt(ow), cdk = i ? 'b' : 'a';
  if (A.cd[cdk] > 0 || A.dash || A.won) { Sound.sfx('cancel'); return; } if ((st.mp || 0) < K.mp) { A26.num(A, hx, hy - 30, 'MP不足', '#8ab8ff'); Sound.sfx('cancel'); return; }
  st.mp -= K.mp; A.cd[cdk] = K.cd; const e = A26.near(ow, A, 120); let a; if (e) { a = Math.atan2(e.cy - 6 - (hy - 6), e.cx - hx); A26.faceTo(ow, e.cx, e.cy); } else { const [dx, dy] = DIRS[ow.p.dir]; a = Math.atan2(dy, dx); }
  if (K.id === 'dash') { A.dash = { ux: Math.cos(a), uy: Math.sin(a), len: 56, dur: 9, t: 0, hit: new Set() }; Sound.sfx('blade'); }
  if (K.id === 'spin') { A.fx.push({ k: 'spin', x: hx, y: hy - 6, t: 0, life: 18, r: 36 }); Sound.sfx('bladeBig'); for (const f of A.mons) if (!f.dead && Math.hypot(f.cx - hx, f.cy - 6 - (hy - 6)) < 36 + f.D.r * 0.6) act26HitFoe(ow, A, f, 1.5, false, { kb: 6 }); }
  if (K.id === 'fireball') { A.proj.push({ hero: 1, x: hx, y: hy - 8, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, r: 5, pow: 2.0, magic: 1, life: 50, tgt: e, boom: 1, k: 'fire' }); Sound.sfx('fire'); }
  if (K.id === 'nova') { A.fx.push({ k: 'nova', x: hx, y: hy - 4, t: 0, life: 22, r: 46 }); Sound.sfx('water'); for (const f of A.mons) if (!f.dead && Math.hypot(f.cx - hx, f.cy - 4 - hy) < 46 + f.D.r * 0.6) { act26HitFoe(ow, A, f, 1.2, true, { kb: 3 }); if (f.D.boss || f.D.elite) f.slow = 120; else { f.frz = 110; A.tele = A.tele.filter(T => T.owner !== f); if (!f.dead) f.st = 'chase'; } } } }
// ---------- 魔物的行動 ----------
function act26Foe(ow, A, e) { if (e.dead) return; const D = e.D, [hx, hy] = A26.heroPt(ow), dx = hx - e.cx, dy = hy - e.cy, dist = Math.hypot(dx, dy);
  if (e.flash > 0) e.flash--; if (e.slow > 0) e.slow--;
  const mv = (vx, vy) => { const nx = e.cx + vx, ny = e.cy + vy, r = D.r * 0.6; if (A26.free(ow, nx, e.cy, r)) e.cx = nx; if (A26.free(ow, e.cx, ny, r)) e.cy = ny; };
  if (Math.abs(e.kx) + Math.abs(e.ky) > 0.05) { mv(e.kx, e.ky); e.kx *= 0.72; e.ky *= 0.72; }
  e.px = e.cx - 8; e.py = e.cy - 15; e.x = Math.floor(e.cx / 16); e.y = Math.floor(e.cy / 16);
  if (e.frz > 0) { e.frz--; return; }
  const spd = D.spd * (e.slow > 0 ? 0.5 : 1) * (e.rage ? 1.35 : 1); e.t++; if (e.cd > 0) e.cd -= e.slow > 0 ? 0.5 : 1;
  if (e.st !== 'idle' && e.st !== 'home') A.calm = 0;
  const towards = (s, keep) => { if (dist < 0.1) return; let k = s / dist; if (keep && dist < keep) k = -k * 0.8; else if (keep && dist < keep + 10) return; mv(dx * k, dy * k); };
  const tele = o => { const T = { owner: e, t: 0, dmg: 1, pow: D.pow, ...o }; A.tele.push(T); return T; };
  if (e.st === 'idle') { if (D.boss) { if (hy < 12 * 16 + 6 && hy > 2 * 16) { e.st = 'chase'; A.bossOn = 1; A.bossT = 0; Sound.sfx('quake'); A.shake = 16; } return; }
    if (e.t % 90 === 0) { e.wa = Math.random() * Math.PI * 2; e.wt = 30; } if (e.wt > 0) { e.wt--; mv(Math.cos(e.wa) * spd * 0.6, Math.sin(e.wa) * spd * 0.6); if (Math.hypot(e.cx - e.homeX, e.cy - e.homeY) > 40) e.wa += Math.PI; }
    if (dist < (D.elite ? 100 : 84)) { e.st = 'chase'; e.t = 0; A26.num(A, e.cx, e.cy - D.r - 22, '!', '#ffd84a'); } return; }
  if (e.st === 'home') { const hd = Math.hypot(e.homeX - e.cx, e.homeY - e.cy); if (hd < 4) { e.st = 'idle'; e.hp = e.maxhp; return; } mv((e.homeX - e.cx) / hd * spd * 1.6, (e.homeY - e.cy) / hd * spd * 1.6); return; }
  if (e.st === 'hurt') { if (e.t > 12) { e.st = 'chase'; e.t = 0; } return; }
  if (e.st === 'chase') {
    if (!D.boss && (dist > 220 || Math.hypot(e.cx - e.homeX, e.cy - e.homeY) > 230)) { e.st = 'home'; return; }
    if (D.elite && !e.rage && e.hp < e.maxhp * 0.5) { e.rage = 1; A26.num(A, e.cx, e.cy - 40, '狂暴！', '#ff6a5a', 1); Sound.sfx('exclaim'); }
    if (D.boss && !e.ph2 && e.hp < e.maxhp * 0.5) { e.ph2 = 1; e.rage = 1; A26.num(A, e.cx, e.cy - 56, '暴走！', '#ff6a5a', 1); A.shake = 18; Sound.sfx('quake'); for (const k of [-1, 1]) { const m = mkAct26('pebble', 4, Math.floor((e.cx + k * 40) / 16), Math.floor((e.cy + 20) / 16), 'boss'); m.st = 'chase'; A.mons.push(m); } }
    if (e.cd <= 0 && dist <= D.range) { act26Attack(ow, A, e, dx, dy, dist, tele); return; }
    if (D.ai === 'shoot') towards(spd, D.keep); else if (D.ai === 'burst') { if (dist > 18) towards(spd); } else if (D.boss) { if (dist > 40) towards(spd); } else towards(spd, D.ai === 'wolf' ? 0 : 0); return; }
  if (e.st === 'wind') { if (e.t >= e.windT) { e.st = e.after || 'rec'; e.t = 0; } return; }
  if (e.st === 'hop') { const k = Math.min(1, e.t / 14); e.cx = e.hx0 + (e.hx1 - e.hx0) * k; e.cy = e.hy0 + (e.hy1 - e.hy0) * k; e.hz = Math.sin(k * Math.PI) * 14; if (k >= 1) { e.hz = 0; e.st = 'rec'; e.t = 0; } return; }
  if (e.st === 'charge') { const C = e.ch; for (let k = 0; k < 3; k++) mv(C.ux * C.sp / 3, C.uy * C.sp / 3); if (!C.hit && Math.hypot(hx - e.cx, hy - e.cy) < D.r + 6) { C.hit = 1; act26HitHero(ow, A, e, D.pow * 1.1); } if (e.t >= C.dur) { e.st = 'rec'; e.t = 0; } return; }
  if (e.st === 'rec') { if (e.t > (D.boss ? 26 : 34)) { e.st = 'chase'; e.t = 0; } return; } }
function act26Attack(ow, A, e, dx, dy, dist, tele) { const D = e.D, w = Math.round(D.wind * (e.rage ? 0.8 : 1)), a = Math.atan2(dy, dx); e.cd = D.cd * (e.rage ? 0.75 : 1); e.st = 'wind'; e.t = 0; e.windT = w; e.after = 'rec';
  const [hx, hy] = A26.heroPt(ow);
  if (D.ai === 'hop') { const L = Math.min(dist, D.range), tx = e.cx + Math.cos(a) * L, ty = e.cy + Math.sin(a) * L; tele({ shape: 'circle', x: tx, y: ty, r: 13, dur: w + 14, dmg: 1 }); e.after = 'hop'; e.hx0 = e.cx; e.hy0 = e.cy; e.hx1 = tx; e.hy1 = ty; }
  if (D.ai === 'burst') tele({ shape: 'circle', x: e.cx, y: e.cy, r: D.aoe, dur: w });
  if (D.ai === 'shoot') tele({ shape: 'rect', x: e.cx, y: e.cy - 10, ang: Math.atan2(hy - 6 - (e.cy - 10), hx - e.cx), len: 90, w: 6, dur: w, dmg: 0, fire: T => A.proj.push({ owner: e, x: T.x, y: T.y, vx: Math.cos(T.ang) * 2.8, vy: Math.sin(T.ang) * 2.8, r: 3, pow: D.pow, life: 60, k: 'sting' }) });
  if (D.ai === 'wolf') { if (dist < 30) tele({ shape: 'circle', x: e.cx + Math.cos(a) * 14, y: e.cy + Math.sin(a) * 14, r: 18, dur: Math.round(w * 0.7) });
    else { const len = 96; tele({ shape: 'rect', x: e.cx, y: e.cy, ang: a, len, w: 18, dur: w, dmg: 0 }); e.after = 'charge'; e.ch = { ux: Math.cos(a), uy: Math.sin(a), sp: 4.4, dur: Math.round(len / 4.4), hit: 0 }; } }
  if (D.ai === 'boss') { const pat = (e.pat = ((e.pat || 0) + 1) % 3);
    if (pat === 1 || dist < 44) { tele({ shape: 'circle', x: e.cx, y: e.cy, r: e.ph2 ? 54 : 46, dur: w, shake: 12 }); }
    else if (pat === 2) { for (let k = 0; k < (e.ph2 ? 5 : 3); k++) { const ox = k ? (Math.random() - 0.5) * 70 : 0, oy = k ? (Math.random() - 0.5) * 50 : 0; tele({ shape: 'circle', x: hx + ox, y: hy + oy, r: 15, dur: w + 6 + k * 4, pow: D.pow * 0.85, shake: 4 }); } e.windT = Math.round(w * 0.6); }
    else { const len = 130; tele({ shape: 'rect', x: e.cx, y: e.cy, ang: a, len, w: 28, dur: w, dmg: 0 }); e.after = 'charge'; e.ch = { ux: Math.cos(a), uy: Math.sin(a), sp: 3.4, dur: Math.round(len / 3.4), hit: 0 }; } }
  Sound.sfx(D.boss ? 'charge' : 'tick'); }
// ---------- 寶箱・倒下・選單 ----------
function act26Loot(ow, A, C) { const st = ow.st, kd = A.kind, pool = C.q >= 4 ? [BASE11.weapon[kd][1], BASE11.weapon[kd][2]] : [BASE11.weapon[kd][1]], k = pool[Math.floor(Math.random() * pool.length)], g = makeGear(k, C.q);
  const S0 = heroStats(st); st.equip.weapon = g.u; A.S = heroStats(st); const up = A.S.atk - S0.atk + A.S.spa - S0.spa; dollLast.k = null;
  const col = (GQ[C.q] && GQ[C.q][1]) || '#ffd84a'; A26.num(A, C.x, C.y - 30, gearName(g), col, 1); A.fx.push({ k: 'beam', x: C.x, y: C.y, t: 0, life: 60, c: col }); Sound.sfx('item');
  if (up > 0) A26.num(A, C.x, C.y - 44, '裝上了！攻擊 +' + up, '#c8f080'); }
function* act26Die(ow) { const A = ow.act26, st = ow.st; Sound.sfx('heavy'); yield* fadeOut(30, '#200808'); yield* say('……倒下了。回到營地重新出發。');
  st.hp = A.S.hp; st.mp = A.S.mp; ow.p.px = 12 * 16; ow.p.py = 47 * 16; ow.p.dir = 'up'; A.tele = []; A.proj = []; A.dash = null; A.iframe = 60; A.bossOn = 0;
  for (const e of A.mons) if (!e.dead) { e.cx = e.homeX; e.cy = e.homeY; e.hp = e.maxhp; e.st = 'idle'; e.rage = 0; e.ph2 = e.ph2 && e.D.boss ? 0 : e.ph2; }
  A.mons = A.mons.filter(e => !(e.zone === 'boss' && e.sp === 'pebble')); act26Ents(ow); yield* fadeIn(24); }
function* act26Clear(ow) { const A = ow.act26; yield* say('打倒了磨石魔像！\n即時動作戰鬥的試玩到這裡。用了 ' + Math.round(A.t / 60) + ' 秒、打倒 ' + A.kills + ' 隻魔物。');
  const r = yield* choose(['用劍再玩一次', '用法杖再玩一次', '繼續在草原走走'], { cancel: true }); if (r === 0 || r === 1) { yield* fadeOut(20); act26Start(r ? '法杖' : '劍'); Game.sys.push(fadeIn(20)); } }
function* act26Menu(ow) { const A = ow.act26, r = yield* choose(['繼續', '玩法說明', '換成' + (A.kind === '劍' ? '法杖' : '劍') + '重新開始', '重新開始'], { cancel: true });
  if (r === 1) yield* say('方向鍵移動。放開方向鍵、站著不動時，會自動攻擊最近的魔物。\nA・B 放技能（有冷卻、要 MP）。\n地上出現紅色範圍＝魔物要出招了，跑出去就不會受傷。');
  if (r === 2 || r === 3) { yield* fadeOut(20); act26Start(r === 2 ? (A.kind === '劍' ? '法杖' : '劍') : A.kind); Game.sys.push(fadeIn(20)); } }
// ---------- 掛上：更新・畫面・標題 ----------
// 頭目戰開始後，空地的入口封起來（光牆），打贏或倒下才打開
{ const _sa = Overworld.prototype.solidAt; Overworld.prototype.solidAt = function (x, y) { const A = this.act26; if (A && A.bossOn && !A.won && (y === 13 || y === 14) && x >= 11 && x <= 14) return true; return _sa.call(this, x, y); }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () { const A = this.act26; if (!A) return _up.call(this);
    this.t++; for (const k in this.anim) if (--this.anim[k] <= 0) delete this.anim[k]; if (this.popup) { this.popup.t++; if (this.popup.t > 170) this.popup = null; }
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; return; }
    if (A.stop > 0) { A.stop--; return; } act26Tick(this, A); }; }
{ const _dm = Overworld.prototype.drawMon; Overworld.prototype.drawMon = function (x, e, camX, camY) { const A = this.act26; if (!A || !(e.act26 || e.act26g || e.act26t)) return _dm.call(this, x, e, camX, camY);
    if (e.act26g) return act26DrawGround(this, A, x, camX, camY); if (e.act26t) return act26DrawTop(this, A, x, camX, camY); return act26DrawFoe(this, A, x, e, camX, camY); }; }
function act26DrawGround(ow, A, x, camX, camY) {
  if (A.bossOn && !A.won) { const X = 11 * 16 - camX, Y = 13 * 16 + 10 - camY, a = 0.5 + 0.3 * Math.sin(A.t * 0.15); x.save(); x.fillStyle = 'rgba(255,120,90,' + a * 0.35 + ')'; x.fillRect(X, Y - 12, 64, 16); x.fillStyle = 'rgba(255,200,170,' + a + ')'; x.fillRect(X, Y, 64, 1); x.fillRect(X, Y - 12, 64, 1); x.restore(); }
  for (const T of A.tele) { const k = Math.min(1, T.t / T.dur), X = T.x - camX, Y = T.y - camY; x.save(); x.translate(X, Y);
    const pulse = 0.5 + 0.5 * Math.sin(T.t * 0.4);
    if (T.shape === 'circle') { x.fillStyle = 'rgba(255,50,30,0.16)'; x.beginPath(); x.arc(0, 0, T.r, 0, 7); x.fill(); x.fillStyle = 'rgba(255,70,40,' + (0.22 + 0.12 * k) + ')'; x.beginPath(); x.arc(0, 0, T.r * k, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,130,100,' + (0.6 + 0.3 * pulse) + ')'; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, T.r, 0, 7); x.stroke(); }
    else { x.rotate(T.ang); x.fillStyle = 'rgba(255,50,30,0.16)'; x.fillRect(0, -T.w / 2, T.len, T.w); x.fillStyle = 'rgba(255,70,40,' + (0.22 + 0.12 * k) + ')'; x.fillRect(0, -T.w / 2, T.len * k, T.w); x.strokeStyle = 'rgba(255,130,100,' + (0.6 + 0.3 * pulse) + ')'; x.lineWidth = 1; x.strokeRect(0, -T.w / 2, T.len, T.w); }
    x.restore(); }
  for (const C of A.chests) { const X = Math.round(C.x - camX), Y = Math.round(C.y - camY), col = (GQ[C.q] && GQ[C.q][1]) || '#ffd84a';
    if (!C.open) { const b = Math.sin(C.t * 0.15) * 1.5; x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(X, Y + 2, 8, 3, 0, 0, 7); x.fill(); x.fillStyle = '#6a3a1a'; x.fillRect(X - 7, Y - 9 + b, 14, 10); x.fillStyle = '#a8642a'; x.fillRect(X - 7, Y - 12 + b, 14, 4); x.fillStyle = col; x.fillRect(X - 1, Y - 9 + b, 2, 3); x.fillRect(X - 7, Y - 9 + b, 14, 1);
      x.save(); x.globalAlpha = 0.25 + 0.15 * Math.sin(C.t * 0.2); x.fillStyle = col; x.fillRect(X - 3, Y - 40, 6, 30); x.restore(); } } }
function act26DrawFoe(ow, A, x, e, camX, camY) { const D = e.D, F = actFrames26(e.sp, D.sc); if (!F) return; const X = Math.round(e.cx - camX), Y = Math.round(e.cy - camY);
  const s = e.st, fps = s === 'chase' ? 8 : 14, list = e.dead || e.flash > 3 || s === 'hurt' ? F.hurt : s === 'wind' ? (F.cast && F.cast.length ? F.cast : F.attack).slice(0, 1) : s === 'hop' || s === 'charge' ? F.attack : F.idle, fr = list[Math.floor((A.t + e.cx) / fps) % list.length] || F.idle[0];
  const [hx] = A26.heroPt(ow), flip = hx > e.cx; x.save(); if (e.dead) x.globalAlpha = Math.max(0, 1 - e.deadT / 30);
  x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.ellipse(X, Y + 1, D.r + 3, (D.r + 3) * 0.35, 0, 0, 7); x.fill();
  const dx = X - Math.round(F.w / 2), dy = Y - F.h + Math.round(F.h * 0.12) - Math.round(e.hz || 0) + (s === 'wind' ? Math.round(Math.sin(e.t * 0.9)) : 0);
  const img = e.flash > 0 ? whiteOf26(fr, '#ffffff') : e.frz > 0 ? whiteOf26(fr, 'rgba(150,210,255,0.6)') : fr;
  x.imageSmoothingEnabled = false; if (flip) { x.translate(dx * 2 + F.w, 0); x.scale(-1, 1); } x.drawImage(img, dx, dy); if (e.frz > 0) x.drawImage(whiteOf26(fr, 'rgba(160,220,255,0.55)'), dx, dy);
  x.restore();
  if (!e.dead && !D.boss && (e.hp < e.maxhp || D.elite)) { const w = D.elite ? 30 : 18, bx = X - w / 2, by = dy - 5; x.fillStyle = 'rgba(10,10,20,0.75)'; x.fillRect(bx - 1, by - 1, w + 2, 4); x.fillStyle = D.elite ? '#ff9a40' : '#ff5a4a'; x.fillRect(bx, by, Math.max(0, Math.round(w * e.hp / e.maxhp)), 2);
    if (D.elite) Font.drawC(x, e.n, X, by - 9, '#ffd8a0', '#000', 7); } }
function act26DrawTop(ow, A, x, camX, camY) {
  for (const P of A.proj) { const X = P.x - camX, Y = P.y - camY; x.save();
    if (P.k === 'sting') { x.strokeStyle = '#fff07a'; x.lineWidth = 2; x.beginPath(); x.moveTo(X, Y); x.lineTo(X - P.vx * 2, Y - P.vy * 2); x.stroke(); }
    else { const fire = P.k === 'fire', g = x.createRadialGradient(X, Y, 0, X, Y, P.r * 2.2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, fire ? '#ffb040' : '#8ad8ff'); g.addColorStop(1, fire ? 'rgba(255,80,20,0)' : 'rgba(80,140,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(X, Y, P.r * 2.2, 0, 7); x.fill(); }
    x.restore(); }
  for (const F of A.fx) { const k = F.t / F.life, X = F.x - camX, Y = F.y - camY; x.save();
    if (F.k === 'slash') { x.translate(X, Y); x.rotate(F.a); x.globalAlpha = 1 - k; x.strokeStyle = '#ffffff'; x.lineWidth = 3 - 2 * k; x.beginPath(); x.arc(4, 0, 15, -1.1 + k * 0.6, 1.1 - k * 0.2); x.stroke(); x.strokeStyle = 'rgba(200,230,255,0.6)'; x.lineWidth = 1; x.beginPath(); x.arc(2, 0, 19, -0.9, 0.9); x.stroke(); }
    if (F.k === 'spin') { x.translate(X, Y); x.rotate(k * 8); x.globalAlpha = 1 - k; x.strokeStyle = '#ffffff'; x.lineWidth = 3; x.beginPath(); x.arc(0, 0, F.r * (0.6 + 0.4 * k), 0, 4.2); x.stroke(); x.strokeStyle = 'rgba(180,220,255,0.7)'; x.lineWidth = 1; x.beginPath(); x.arc(0, 0, F.r * (0.5 + 0.5 * k), 1, 5.5); x.stroke(); }
    if (F.k === 'trail') { x.globalAlpha = 0.6 * (1 - k); x.fillStyle = '#c8f0ff'; x.beginPath(); x.ellipse(X, Y, 7, 4, 0, 0, 7); x.fill(); }
    if (F.k === 'spark') { x.globalAlpha = 1 - k; x.strokeStyle = F.c; x.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const a = i * 1.05 + F.x, r0 = 3 + k * 4, r1 = 6 + k * 10; x.beginPath(); x.moveTo(X + Math.cos(a) * r0, Y + Math.sin(a) * r0); x.lineTo(X + Math.cos(a) * r1, Y + Math.sin(a) * r1); x.stroke(); } }
    if (F.k === 'burst' || F.k === 'puff') { x.globalAlpha = (1 - k) * (F.k === 'puff' ? 0.5 : 0.9); x.fillStyle = F.k === 'puff' ? '#e8d8c0' : '#fff2c0'; for (let i = 0; i < 8; i++) { const a = i * 0.785 + F.r, r = F.r * (0.3 + 0.7 * k); x.beginPath(); x.arc(X + Math.cos(a) * r, Y + Math.sin(a) * r * 0.6, 2.5 * (1 - k) + 1, 0, 7); x.fill(); } }
    if (F.k === 'boom') { const g = x.createRadialGradient(X, Y, 0, X, Y, F.r * (0.5 + k)); g.addColorStop(0, 'rgba(255,255,220,' + (1 - k) + ')'); g.addColorStop(0.5, 'rgba(255,140,40,' + 0.8 * (1 - k) + ')'); g.addColorStop(1, 'rgba(255,60,20,0)'); x.fillStyle = g; x.beginPath(); x.arc(X, Y, F.r * (0.5 + k), 0, 7); x.fill(); }
    if (F.k === 'nova') { x.globalAlpha = 1 - k; x.strokeStyle = '#bfe8ff'; x.lineWidth = 3 * (1 - k) + 1; x.beginPath(); x.ellipse(X, Y, F.r * k, F.r * k * 0.6, 0, 0, 7); x.stroke(); x.fillStyle = 'rgba(160,220,255,' + 0.25 * (1 - k) + ')'; x.beginPath(); x.ellipse(X, Y, F.r * k, F.r * k * 0.6, 0, 0, 7); x.fill(); }
    if (F.k === 'ring') { x.globalAlpha = 1 - k; x.strokeStyle = F.c; x.lineWidth = 2; x.beginPath(); x.ellipse(X, Y, F.r * k, F.r * k * 0.5, 0, 0, 7); x.stroke(); }
    if (F.k === 'beam') { x.globalAlpha = Math.min(1, (1 - k) * 1.5) * 0.7; const g = x.createLinearGradient(0, Y - 70, 0, Y); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, F.c); x.fillStyle = g; x.fillRect(X - 5, Y - 70, 10, 70); }
    x.restore(); }
  for (const N of A.nums) { const k = N.t / 44, X = N.x - camX, Y = N.y - camY - Math.min(10, N.t * 0.6); x.save(); x.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; Font.drawC(x, N.s, X, Y, N.c, '#1a1020', N.big ? 9 : 7); x.restore(); } }
// HUD：左上血條，右下技能，頭目大血條
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); const A = this.act26; if (!A || Game.trans) return; const st = this.st, S = A.S;
    KB12.panel(x, 3, 3, 84, 30, { r: 4 }); Font.draw(x, 'Lv' + st.lv, 7, 3, '#ffe8a0', UIC.textSh, 9); Font.drawR(x, st.gold ? st.gold + 'G' : '', 84, 4, '#ffd870', UIC.textSh, 7);
    const hr = clamp(st.hp / S.hp, 0, 1); KB12.bar(x, 7, 14, 76, 7, hr, KB12.hpCols(hr), null, Math.ceil(st.hp) + '/' + S.hp); KB12.bar(x, 7, 23, 76, 4, clamp((st.mp || 0) / S.mp, 0, 1), ['#3a6ad8', '#7ab8ff']);
    const e0 = expForLevel(st.lv), e1 = expForLevel(st.lv + 1); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(7, 29, 76, 2); x.fillStyle = '#c8f080'; x.fillRect(7, 29, Math.round(76 * clamp((st.exp - e0) / (e1 - e0), 0, 1)), 2);
    SKILL26[A.kind].forEach((K, i) => { const X = W - 46, Y = H - 52 + i * 22, cd = A.cd[i ? 'b' : 'a'], ok = cd <= 0 && (st.mp || 0) >= K.mp; KB12.panel(x, X, Y, 43, 19, { r: 5, rim: ok ? '#ffd870' : 'rgba(255,255,255,0.15)', lw: ok ? 0.9 : 0.6 });
      if (cd > 0) { x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(X + 1, Y + 1, Math.round(41 * cd / K.cd), 17); }
      Font.drawC(x, i ? 'B' : 'A', X + 7, Y + 4, ok ? '#ffd870' : '#8890a0', UIC.textSh, 8); Font.draw(x, K.n, X + 13, Y + 1, ok ? '#ffffff' : '#9098a8', UIC.textSh, 7); Font.draw(x, 'MP' + K.mp, X + 13, Y + 9, '#8ab8ff', null, 6); });
    const B = A.mons.find(e => e.D.boss && !e.dead); if (A.bossOn && B) { const w = 120, X = (W - w) / 2; KB12.panel(x, X - 4, 36, w + 8, 18, { r: 4, rim: '#ff6b7a', lw: 0.9 }); Font.drawC(x, B.n + (B.ph2 ? '・暴走' : ''), W / 2, 36, '#ffd8d8', UIC.textSh, 7); KB12.bar(x, X, 46, w, 5, clamp(B.hp / B.maxhp, 0, 1), ['#c82838', '#ff6070']); }
    if (A.hint > 0) { x.save(); x.globalAlpha = Math.min(1, A.hint / 40); KB12.panel(x, 12, H - 92, W - 24, 30, { r: 5 }); Font.drawC(x, '方向鍵移動・停下來自動攻擊', W / 2, H - 90, '#ffffff', UIC.textSh, 8); Font.drawC(x, 'A・B 放技能・紅色範圍要躲開', W / 2, H - 78, '#ffd870', UIC.textSh, 8); x.restore(); } }; }
if (ACT26.on()) { const _tm = TitleScene.prototype.menu; TitleScene.prototype.menu = function* () {
    const r = yield* choose(['即時戰鬥試玩・劍', '即時戰鬥試玩・法杖'], { x: 30, y: 160, w: 116, cancel: true }); if (r < 0) { this.stage = 'press'; return; }
    yield* fadeOut(20); act26Start(r === 1 ? '法杖' : '劍'); Game.sys.push(fadeIn(20)); };
  saveGame = function () { return true; }; }
