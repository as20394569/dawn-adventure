/* ===================== v12 收尾：文字對齊新規則、裝備詳情、職業卡、職業機制的戰鬥特效 =====================
   The pre-release check (docs_design_log v12.0.0): texts that still described orbs / enchanting / 先制, gear pages without the v12
   weapon rules, and class mechanics with no picture (turret, 獵印, 元素爆發, 元素奔流, 魔劍解放, multi-segment attacks, 聖域, 看破). */

/* ---------- skill texts that did not match the v12 data ---------- */
{ const T = { // ORB_A / UNIQUE_W keys → text
    galeCut: '搶先突進，削減護盾。', dawnFlash: '搶先的居合斬，容易會心。', arcaneShot: '純粹的魔力彈（屬性跟著武器）。',
    sonicBoom: '音波衝擊，有機率讓對手退縮。', warCry: '提升自己的物攻（物攻+2、物防−1）。', ironWall: '物防、魔防各+2。',
    shieldRam: '連人帶盾撞過去，削減護盾，有機率讓對手退縮。', combustion: '對灼傷的對手威力大增（會消耗灼傷）。', smokeVeil: '3次行動內迴避提升。',
    tideRapier: '搶先的水之突刺，讓對手潮濕。', coreStaff: '對灼傷的對手威力大增（會消耗灼傷），有機率灼傷。' };
  for (const k in T) { const id = (typeof UNIQUE_W !== 'undefined' && UNIQUE_W[k] ? 'u_' : 'o_') + k;
    if (MOVES[id]) MOVES[id].d = T[k]; if (DEF.skills[id]) DEF.skills[id].desc = T[k];
    if (typeof ORB_A !== 'undefined' && ORB_A[k]) ORB_A[k].d = T[k]; if (typeof UNIQUE_W !== 'undefined' && UNIQUE_W[k]) UNIQUE_W[k].skill[4] = T[k]; } }

/* ---------- gear pages: no orb slots / enchant; a weapon shows its v12 skill, 特技, 被動, kind rule and unique rule ---------- */
orbSlots = function () { return 0; }; // gearEn already returns null: EN_EFF is empty since 10m
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) {
    const L = _gi(g, wrapW), G = g && GEAR[g.b]; if (!G || G.slot !== 'weapon') return L;
    let s = L.findIndex(l => l[0] === '【武器】');
    if (s >= 0) { let e = s + 1; while (e < L.length && L[e][3] > 0) e++; L.splice(s, e - s); } else { s = L.findIndex(l => l[0] === '' && l[2] === 6); if (s < 0) s = L.length; }
    const X = [], add = (t, c, sz, ind) => { for (const l of Font.wrap(t, wrapW - ind, sz)) X.push([l, c, sz, ind]); }, S = WSK[g.b], st = Game.st;
    X.push(['【武器】', UIC.accent, 10, 0]);
    const id = typeof weaponSkill12 === 'function' && weaponSkill12(g.b), D = id && DEF.skills[id];
    if (D) { const e = st && BB.lib(st)[BB.libKey(id)], N = BB.learnN(id);
      add('技能「' + D.name + '」' + (D.cooldown ? '冷卻' + D.cooldown : '無冷卻') + '・' + (e && e.learned ? '已學會' : '用' + N + '次學會' + (e && e.x ? '（' + e.x + '/' + N + '）' : '')), '#c8f0ff', 10, 4);
      add((MOVES[id] && MOVES[id].d) || D.desc || '', UIC.muted, 9, 10); }
    if (S && S.s) add('特技「' + S.s.n + '」' + wspecText(S.s), '#ffd860', 10, 4);
    if (S && S.p && S.p.n && typeof wpassText === 'function') add('被動「' + S.p.n + '」' + wpassText(S.p), UIC.warm, 10, 4);
    const K = WKIND12[G.kind]; if (K) add(G.kind + '：' + K.d, '#b8e0a0', 10, 4);
    const U = UNIQ12[g.b]; if (U) add('專屬：' + U.d, '#ffb0e0', 10, 4);
    L.splice(s, 0, ...X); return L;
  }; }

/* ---------- 狀態→技能一覽: the class passive and the accessory traits (passive orbs are gone) ---------- */
drawPassiveInfo = function (x, st, X, Y, w) {
  const C = CLASSES[st.cls], Z = st.cls && CLS12[clsV7(st.cls)], k = mainWKey(st);
  const L = [['職業　' + (C ? C.n : '—') + (Z ? '「' + Z.passive[0] + '」' : ''), UIC.warm, 10]];
  if (Z) L.push([Z.passive[1], UIC.text, 9]);
  const tr = equippedGear(st).map(g => GEAR[g.b] && GEAR[g.b].trait && ACC_TRAIT[GEAR[g.b].trait]).filter(Boolean).map(T => T[0]);
  L.push(['飾品特性：' + (tr.length ? tr.join('・') : '（沒有）'), tr.length ? UIC.text : UIC.muted, 9]);
  if (k && WSK[k]) L.push(['特技「' + WSK[k].s.n + '」普通攻擊' + wsN(WSK[k].s, st) + '層發動', '#ffd860', 9]);
  const n = typeof tpSpent === 'function' ? tpSpent(st) : 0; L.push(['天賦：已投入' + n + '／' + TP_CAP + '點', n ? '#c9cfe4' : UIC.muted, 9]);
  L.forEach(([t, col, z0], i) => { let z = z0; while (z > 7 && Font.width(t, z) > w) z--; Font.draw(x, t, X, Y + i * 15 + (i ? 1 : 0), col, UIC.textSh, z); });
};

/* ---------- class cards: v12 passive, 擅長武器, core resource, signature skill ---------- */
{ const _cc = classCard; classCard = function (k) { const c = _cc(k), Z = CLS12[clsV7(k)]; if (!Z) return c;
    c.text = '職業被動「' + Z.passive[0] + '」：' + Z.passive[1]; c.w = Z.aff[0] === '*' ? ['全部武器'] : Z.aff;
    c.res12 = Z.res ? RES12_NAME(Z.res) : Z.turret ? '砲台' : '獵印'; c.sig12 = (DEF.skills[Z.sig] || {}).name || '';
    const T = TAL12_TREE[clsV7(k)]; if (T && T.br) c.br = T.br; return c; }; }

/* ---------- status badges for the v12 statuses (smooth HD icons, v12.0.1; text badges if the strips are missing) ---------- */
Object.assign(BADGE_OF, { guard: 'wall', frenzy: 'rage', mirror: 'aegis', airborne: 'air', delay: 'delay', first_next: 'first', elem_burst: 'burst', evade_up: 'after', overdrive: 'overdrive', first_strike: 'initiative', sure_crit: 'focus', turret: 'turret', hunt_mark: 'mark' });
for (const [k, n, c] of [['first', '搶', '#2a9aa4'], ['burst', '爆', '#8a4ad0'], ['overdrive', '載', '#d0641e'], ['initiative', '機', '#b08a20'], ['turret', '砲', '#66788a'],
  ['mark', '印', '#c84848'], ['wall', '防', '#6a7a90'], ['rage', '怒', '#c03030'], ['aegis', '鏡', '#3a98b0'], ['air', '空', '#4a88c8'], ['delay', '延', '#707884'], ['focus', '集', '#c89a30'], ['after', '影', '#5a78c0']]) if (!STATUS_INFO[k]) STATUS_INFO[k] = [n, c];
// 獵印 and the turret's ammo show their count on the badge
{ const _b = Battle.prototype.badges; Battle.prototype.badges = function (v) { return _b.call(this, v).map(b => b === 'mark' && v.st.hunt_mark > 0 ? 'mark#' + v.st.hunt_mark : b === 'turret' && v.st.turret > 0 ? 'turret#' + v.st.turret : b); }; }
{ const _br = badgeRow; badgeRow = function (x, list, X, Y) {
    for (const b of list) { if (!b) continue; const [k, n] = String(b).split('#'), icon = iconOk(k);
      _br(x, [k], X, Y); if (n) { const cx = X + (icon ? ICON_SZ : 16) - 3; x.fillStyle = '#10121e'; x.fillRect(cx - 2, Y + 5, 7, 8); Font.drawC(x, n, cx + 1, Y + 2, '#ffffff', null, 7); }
      X += icon ? ICON_SZ + 2 : 18; } }; }

/* ---------- the machinist's turret: a small brass turret to the right of the hero ---------- */
const TURRET_PAL = { a: '#10121e', b: '#f6d27a', c: '#d39a46', d: '#8a5a2a', e: '#e6ecf4', f: '#9aa8b8', g: '#56606e', h: '#6dff9a', i: '#2c6a44', j: '#fff6c0', k: '#ffa040' };
const TURRET_BODY = ['....abbcccdafga.....', '....abcchcdaaa......', '....acccccdda.......', '.....adddddda.......', '......aagfgaa.......', '.....a.agfga.a......', '....ag.agfga.ga.....', '...aga.agfga..aga...', '...aaa.aaaaa..aaa...'];
const TURRET_ROWS = { // 20×16, drawn at 2×: the fallback while the Codex sprite (UI_PX.turret_*) is loading
  idle1: ['....................', '................aa..', '...............aeea.', '..............aefga.', '.............aefga..', '......aaaa..aefga...', '.....abbbcaaefga....', ...TURRET_BODY],
  fire1: ['................kjk.', '...............kjjk.', '..............aajk..', '.............aeea...', '............aefga...', '......aaaa.aefga....', '.....abbbcaefga.....', '....abbcccdfga......', ...TURRET_BODY.slice(1)] };
TURRET_ROWS.idle2 = TURRET_ROWS.idle1.map(r => r.replace(/h/g, 'i'));
const TURRET_IMG = {};
function turretImg(k) { const A = UI_PX['turret_' + k]; if (A && A.ok) return A; // Codex task AC (art/ui/px/turret_*.png)
  if (TURRET_IMG[k]) return TURRET_IMG[k];
  const c = document.createElement('canvas'); c.width = 20; c.height = 16; const x = c.getContext('2d');
  TURRET_ROWS[k].forEach((r, y) => { for (let i = 0; i < 20; i++) { const ch = r[i]; if (ch && ch !== '.' && TURRET_PAL[ch]) { x.fillStyle = TURRET_PAL[ch]; x.fillRect(i, y, 1, 1); } } });
  return TURRET_IMG[k] = c; }
Battle.prototype.turretPos = function () { return { x: this.center(this.H).x + 40 + Math.round(this.H.off.x), y: HERO_FOOT - 16 }; }; // a step behind the hero, clear of the gauges
Battle.prototype.drawTurret = function (x) {
  const n = this.H && this.H.st.turret; if (!(n > 0) && !(this._turGone > 0)) return; const P = this.turretPos();
  let dy = 0; if (this._turDrop > 0) { const k = this._turDrop / 12; dy = -Math.round(k * k * 28); this._turDrop--; }
  if (this._turGone > 0) { x.globalAlpha = this._turGone / 14; this._turGone--; }
  const fr = this._turFire > 0 ? 'fire1' : Math.floor(this.t / 24) % 2 ? 'idle2' : 'idle1'; if (this._turFire > 0) this._turFire--;
  const im = turretImg(fr), rec = this._turFire > 0 ? -1 : 0; if (!im || (im.complete === false)) { x.globalAlpha = 1; return; }
  x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(P.x, P.y, 15, 3, 0, 0, 7); x.fill();
  x.imageSmoothingEnabled = false; x.drawImage(im, P.x - 20 + rec, P.y - 32 + dy, 40, 32); x.globalAlpha = 1;
};
Battle.prototype.turretMuzzle = function () { const P = this.turretPos(); return { x: P.x + 15, y: P.y - 29 }; };
// 元素爆發: three sigil orbs circle the mage while the next magic skill is boosted
Battle.prototype.drawBurstAura = function (x) {
  if (!this.H || !this.H.st.elem_burst) return; const C = this.center(this.H), t = this.t;
  const g = x.createRadialGradient(C.x, C.y, 4, C.x, C.y, 34); g.addColorStop(0, 'rgba(190,120,255,' + (0.16 + 0.08 * Math.sin(t / 8)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(190,120,255,0)'); x.fillStyle = g; x.fillRect(C.x - 34, C.y - 34, 68, 68);
  ['#ff7a30', '#3c9cf0', '#f8d030'].forEach((c, i) => { const a = t / 14 + i * Math.PI * 2 / 3, px = Math.round(C.x + Math.cos(a) * 24), py = Math.round(C.y + 6 + Math.sin(a) * 8);
    x.fillStyle = '#10121e'; x.fillRect(px - 2, py - 2, 5, 5); x.fillStyle = c; x.fillRect(px - 1, py - 1, 3, 3); x.fillStyle = '#ffffff'; x.fillRect(px - 1, py - 1, 1, 1); });
};
{ const _do = Battle.prototype.drawOverlay; Battle.prototype.drawOverlay = function (x) { this.drawBurstAura(x); this.drawTurret(x); _do.call(this, x); }; }
// a single shot (the turret_shot skill, if it is ever played as a skill)
FX.gunShot = function* (U, T) { const M = this.turretMuzzle ? this.turretMuzzle() : { x: U.x + 8, y: U.y - 8 }; yield* turretShotFx(this, M, T); };
function* turretShotFx(b, M, C) { b._turFire = 8; Sound.sfx('crit'); b.spawn({ k: 'glow', x: M.x, y: M.y, r: 10, c: '#fff0a0', life: 6 }); b.star(M.x, M.y, '#fff8d0', 6);
  b.spawn({ k: 'line', x1: M.x, y1: M.y, x2: C.x, y2: C.y, c: '#ffe080', w: 2, grow: 2, life: 7 }); b.spawn({ k: 'line', x1: M.x, y1: M.y, x2: C.x, y2: C.y, c: '#ffffff', w: 1, grow: 2, life: 5 });
  yield* wait(3); b.spawn({ k: 'ring', x: C.x, y: C.y, r0: 2, r1: 12, c: '#fff0a0', w: 2, life: 8 }); b.sparks(C.x, C.y, 7, ['#fff0a0', '#ffffff', '#e0a840'], 2.2, 12); }

/* ---------- 元素奔流: a gathering of the remembered elements, then one bolt per sigil in that element's colour ---------- */
FX.sigilGather = function* (U) { const els = []; this.peek(q => { if (q.type === EVT.HIT && q.payload.skill === 'sig_mage' && q.payload.el) els.push(q.payload.el); if (q.type === EVT.ACTION_END) return true; });
  Sound.sfx('charge'); (els.length ? els : ['一般']).forEach((el, i) => { const c = (FX_EL_COL[el] || ['#c890ff'])[0]; this.spawn({ k: 'maura', x: U.x + (i - (els.length - 1) / 2) * 12, y: U.y - 10, r0: 18, r1: 4, c, life: 14 }); });
  yield* wait(12); };
function* sigilBolt(b, U, C, el, i) { const [c, h, d] = FX_EL_COL[el] || ['#c890ff', '#f8f0ff', '#7040c0'], x0 = U.x + (i % 2 ? 8 : -6), y0 = U.y - 14;
  if (el === '雷') { Sound.sfx('thunder'); const pts = []; let px = x0, py = y0; for (let k = 0; k <= 6; k++) { pts.push([Math.round(px), Math.round(py)]); px = lerp(x0, C.x, (k + 1) / 7) + rnd(-6, 6); py = lerp(y0, C.y, (k + 1) / 7); } b.spawn({ k: 'bolt', pts, life: 10 }); yield* wait(4); }
  else { Sound.sfx(el === '火' ? 'fire' : el === '水' ? 'water' : el === '草' ? 'leaf' : 'buzz'); const F = 7, p = b.spawn({ k: 'glow', x: x0, y: y0, r: 9, c, life: F + 2 });
    for (let k = 1; k <= F; k++) { p.x = lerp(x0, C.x, k / F); p.y = lerp(y0, C.y, k / F) - Math.sin(k / F * Math.PI) * 8; b.spawn({ k: 'dot', x: p.x + rnd(-3, 3), y: p.y + rnd(-3, 3), c: k % 2 ? c : h, s: 2, life: 10 }); yield; } }
  b.spawn({ k: 'glow', x: C.x, y: C.y, r: 18, c, life: 10 }); b.spawn({ k: 'ring', x: C.x, y: C.y, r0: 3, r1: 18, c: h, w: 2, life: 10 }); fxBurst(b, C.x, C.y, 8, [c, h, d], 2.2, 14, 0.05); yield* wait(3); }
if (DEF.skills.sig_mage) DEF.skills.sig_mage.fx = 'sigilGather';
// 魔劍解放: every extra hit (one per 魔紋) is a violet rune slash
FX.runeSlashHit = function* (U, T, u, i) { Sound.sfx('slash'); const o = (i % 2 ? 1 : -1) * 6;
  this.spawn({ k: 'line', x1: T.x - 18 * (i % 2 ? -1 : 1), y1: T.y - 18 + o, x2: T.x + 16 * (i % 2 ? -1 : 1), y2: T.y + 14 + o, c: '#b070ff', w: 5, grow: 3, life: 12 });
  this.spawn({ k: 'line', x1: T.x - 18 * (i % 2 ? -1 : 1), y1: T.y - 18 + o, x2: T.x + 16 * (i % 2 ? -1 : 1), y2: T.y + 14 + o, c: '#f4e8ff', w: 2, grow: 3, life: 10 });
  this.spawn({ k: 'hex', x: T.x, y: T.y + o, r0: 4, r1: 16, c: '#d8a8ff', life: 12 }); yield* wait(6); };
if (DEF.skills.sig_spellblade) DEF.skills.sig_spellblade.hitFx = 'runeSlashHit';
// a basic attack with 2 / 3 segments: one swing (or punch) per segment
function* segSwing(b, s, C, i, kind) { yield* b.lunge(s, 6, 2);
  if (kind === '拳套') { Sound.sfx('hit'); const ox = [-8, 8, 0][i % 3], oy = [-4, 4, -8][i % 3]; b.spawn({ k: 'ring', x: C.x + ox, y: C.y + oy, r0: 2, r1: 12, c: '#ffc040', w: 2, life: 8 }); b.star(C.x + ox, C.y + oy, '#ffffff', 8); }
  else { Sound.sfx('slash'); const f = i % 2 ? -1 : 1; b.spawn({ k: 'line', x1: C.x - 16 * f, y1: C.y - 16, x2: C.x + 14 * f, y2: C.y + 14, c: '#e8f4ff', w: 3, grow: 3, life: 10 }); b.star(C.x, C.y, '#ffffff', 8); }
  yield* wait(4); }

/* ---------- the battle log handlers for the class mechanics ---------- */
{ const H = Battle.prototype.handlers;
  const _hit = H.HIT; H.HIT = function* (e, s, t, P) { const D = DEF.skills[P.skill];
    if (t && s && D && P.skill === 'sig_mage' && P.el) { yield* sigilBolt(this, this.center(s), this.center(t), P.el, P.hitIndex || 0); return; }
    if (t && s && D && P.hitIndex > 0) { const C = this.center(t);
      if (s.hero && D.tags.includes('basic')) { yield* segSwing(this, s, C, P.hitIndex, this._thKind || (typeof mainWKey === 'function' && GEAR[mainWKey()] ? GEAR[mainWKey()].kind : '')); return; }
      if (D.hitFx && FX[D.hitFx]) { yield* FX[D.hitFx].call(this, this.center(s), C, s, P.hitIndex); return; } }
    yield* _hit.call(this, e, s, t, P); };
  const _use = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { const D = DEF.skills[P.skill];
    // 聖域: 聖盾衝擊 heals and shields instead of charging in
    if (s && s.hero && P.skill === 'sig_guardian' && this.core.rule(this.core.byId.H, 'sanctuary')) { this.cast = { id: P.cast, D, s, hits: 0, total: 0, said: {} };
      yield* this.announce(s.n + '使用了' + this.skillName(P.skill, s.id) + '！'); yield* wait(6); const C = this.center(s); Sound.sfx('charge');
      this.spawn({ k: 'ring', x: C.x, y: C.y + 18, r0: 34, r1: 6, c: '#ffe8a0', w: 2, life: 14, fl: 0.4 }); yield* FX.heal.call(this, C); return; }
    // 元素爆發: the boosted magic skill flashes as it starts
    if (s && s.hero && D && D.cat === '特' && D.power && s.st.elem_burst) { const C = this.center(s); Sound.sfx('hitSuper'); this.spawn({ k: 'flash', c: '#d8b0ff', a: 0.35, life: 8 });
      for (const [i, c] of ['#ff7a30', '#3c9cf0', '#f8d030'].entries()) this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4 + i * 4, r1: 34 + i * 6, c, w: 2, life: 14 });
      this.popNum(s, '元素爆發！', '#e8c8ff', null, { big: true, dy: -24 }); yield* wait(10); }
    yield* _use.call(this, e, s, t, P); };
  const _dmg = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (t && P.kind === 'turret') yield* turretShotFx(this, this.turretMuzzle(), this.center(t));
    else if (t && P.kind === 'detonate') { const C = this.center(t); Sound.sfx('hitSuper'); this.spawn({ k: 'flash', c: '#ff6050', a: 0.3, life: 8 });
      this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4, r1: 36, c: '#ff5a4a', w: 3, life: 14 }); this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 2, r1: 22, c: '#ffd0a0', w: 2, life: 10 });
      this.spawn({ k: 'glow', x: C.x, y: C.y, r: 30, c: '#ff4030', life: 14 }); fxBurst(this, C.x, C.y, 18, ['#ff5a4a', '#ffd0a0', '#801818'], 3, 18, 0.06); this.shake = Math.max(this.shake, 8); yield* wait(10); }
    yield* _dmg.call(this, e, s, t, P); };
  const _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) { const id = P.status, was = t && t.st[id];
    yield* _ap.call(this, e, s, t, P); if (!t || P.failed) return; const C = this.center(t);
    if (id === 'turret' && P.delta > 0) { if (!(was > 0)) { this._turDrop = 12; Sound.sfx('rock'); yield* wait(12); const T = this.turretPos(); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 22, c: '#d8c8a0', w: 2, life: 12, fl: 0.3 }); fxBurst(this, T.x, T.y - 4, 8, ['#d8c8a0', '#a08060'], 1.6, 14, 0.08);
        yield* this.msg(t.n + '設置了砲台！（彈藥 ' + P.stacks + '）', { hold: 22 }); }
      else { const T = this.turretMuzzle(); Sound.sfx('charge'); this.sparks(T.x - 10, T.y + 14, 8, ['#fff0a0', '#ffd060'], 1.6, 14); yield* this.msg('砲台補滿了彈藥！（' + P.stacks + '）', { hold: 20 }); } }
    else if (id === 'turret' && P.cleared) this._turGone = 14;
    else if (id === 'hunt_mark' && P.delta > 0) this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 16, r1: 4, c: '#ff6a6a', w: 2, life: 10 });
    else if (id === 'elem_burst' && !was) { Sound.sfx('charge'); for (const [i, c] of ['#ff7a30', '#3c9cf0', '#f8d030'].entries()) this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 30 - i * 6, r1: 4, c, w: 2, life: 14 });
      yield* wait(8); yield* this.msg('咒印集齊了！下一個魔法技能「元素爆發」！', { hold: 22 }); } };
  const _gone = H.statusGone; H.statusGone = function* (e, s, t, P, expire) { if (t && P.status === 'turret') this._turGone = 14; yield* _gone.call(this, e, s, t, P, expire); };
  // 看破: a small number over the monster instead of a message box
  const _msg = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { if (P.key === 'insight' && t) { Sound.sfx('cursor'); this.popNum(t, '看破' + P.n, '#a8e8ff', null, { small: true, dy: -14 }); yield* wait(4); return; } yield* _msg.call(this, e, s, t, P); };
}
