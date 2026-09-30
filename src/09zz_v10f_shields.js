/* ===================== v10.5 盾牌（副手） =====================
   Player: 「守護者這個職業有奇怪，這遊戲沒有盾牌」 → a new off-hand slot 副手 with shields.
   - Anyone holding a one-handed weapon (劍・斧・短刀, or nothing) can carry a shield; a two-handed weapon takes it off.
   - A shield gives 物防・魔防・HP and 格擋: a chance to take 40% less damage from a foe's hit. Higher tiers add effects.
   - 守護者 with a shield: 格擋 +10% and 聖盾衝擊 +20% power.
   - Sources: the item shop sells the two cheapest, the smith forges tiers 1–7 (tab 防具), four bosses drop their own.
   - Shields have no orb socket (the player picked 「防禦＋格擋」). Battle doll: the shield on the left arm (Codex art, task X;
     until then a drawn shape in the shield's colours). */
const ONE_HAND = new Set(['劍', '斧', '短刀']);
const SHIELDS = { // key: [name, tier, {st}, block%, {sp}, fx, colours [rim, face, emblem], text]
  woodShield: ['木製圓盾', 1, { def: 2, spd: 1, hp: 2 }, 8, {}, null, ['#6a4a2a', '#b07a44', '#e0b070'], '木板釘成的圓盾。新手的第一面盾。'],
  ironBuckler: ['鐵製小盾', 2, { def: 3, spd: 2, hp: 3 }, 10, {}, null, ['#4a5060', '#9aa4b4', '#d8e0ea'], '套在手臂上的小圓盾，輕巧好用。'],
  knightShield: ['騎士團鳶盾', 3, { def: 5, spd: 3, hp: 4 }, 12, {}, null, ['#2a3a70', '#4a70c0', '#f0d060'], '王都騎士團的制式鳶盾，畫著金色紋章。'],
  crystalShield: ['水晶盾', 4, { def: 6, spd: 5, hp: 5 }, 13, {}, null, ['#2a6a8a', '#80d0f0', '#e8fbff'], '用地下水道的水晶磨成的盾，透著藍光。'],
  brassShield: ['黃銅齒輪盾', 5, { def: 8, spd: 6, hp: 6 }, 14, {}, null, ['#6a4a1a', '#d0a040', '#fff0b0'], '王都工坊打的塔盾，盾心嵌著會轉的齒輪。'],
  frostShield: ['冰晶鏡盾', 6, { def: 9, spd: 9, hp: 7 }, 15, {}, null, ['#3a5a9a', '#a8d8ff', '#ffffff'], '霜語村的匠人用冰晶鍛成的鏡盾。'],
  starShield: ['星辰聖盾', 7, { def: 11, spd: 10, hp: 8 }, 16, {}, ['guardHeal'], ['#3a2a6a', '#e8c860', '#fff8d0'], '閃著星光的聖盾。防禦時會治癒持有者。'],
  // bosses
  golemShield: ['古岩龜甲盾', 3, { def: 7, spd: 3, hp: 6 }, 15, {}, ['thorns'], ['#4a4438', '#8a8070', '#d09050'], '古岩魔像的背甲做成的盾，打上去的人會被反震。', 'golem'],
  wyrmShield: ['銀鱗龍盾', 5, { def: 8, spd: 8, hp: 7 }, 16, {}, ['regen'], ['#3a5a7a', '#c8d8e8', '#80e0ff'], '銀鱗水龍的鱗片疊成的盾，會慢慢治好傷口。', 'silverWyrm'],
  lavaShield: ['熔核巨盾', 6, { def: 11, spd: 7, hp: 9 }, 16, {}, ['thorns'], ['#2a1a1a', '#5a3a30', '#ff8a30'], '熔岩巨人的核心還在盾裡燃燒。', 'lavaGiant'],
  shadowShield: ['影將黑盾', 7, { def: 12, spd: 11, hp: 9 }, 18, {}, ['endure'], ['#1a1424', '#4a3a60', '#b060e0'], '影將莫爾德的黑盾。持有者不會輕易倒下。', 'shadowGeneral'],
};
for (const k in SHIELDS) { const [n, t, st, block, sp, fx, , d, boss] = SHIELDS[k];
  GEAR[k] = { n, slot: 'shield', kind: '盾', t, st: { ...st }, sp: { block, ...sp }, d, ...(fx ? { fx } : {}), ...(t <= 2 && !boss ? { price: [0, 500, 1300][t] } : {}) };
  if (boss && LOOT[boss]) { LOOT[boss].push(k); BP_RARE.add(k); }
  if (!GEAR_RECIPE[k]) { const P = TIER_POOL[clamp(t, 1, 7)], P2 = TIER_POOL[Math.max(1, t - 1)], h = hashK(k), a = P[h % P.length], b = P2[(h >>> 5) % P2.length], m = { [a]: 2 + Math.floor(t / 2) }; if (b && b !== a) m[b] = 1 + Math.floor(t / 3); m.stone = (m.stone || 0) + 1 + Math.floor(t / 3);
    GEAR_RECIPE[k] = { mats: m, gold: Math.round(bpGold(t) * 1.1 / 10) * 10 }; } }
SP_NAMES.block = '格擋';
for (const a of ['def', 'spd', 'hp', 'resist']) if (AFFIX_TABLE[a]) AFFIX_TABLE[a].slots.push('shield');
// the 副手 row right under 武器 (keys re-added in order)
{ const rest = Object.entries(EQUIP_SLOTS).filter(([k]) => k !== 'weapon'); for (const [k] of rest) delete EQUIP_SLOTS[k]; EQUIP_SLOTS.shield = '副手'; for (const [k, v] of rest) EQUIP_SLOTS[k] = v; }
// the item shop sells the two cheapest (shops otherwise sell no gear since v7)
if (typeof SHOP_LIST !== 'undefined') for (const k of ['woodShield', 'ironBuckler']) if (!SHOP_LIST.includes(k)) SHOP_LIST.push(k);
// no orb socket in a shield
{ const _os = orbSlots; orbSlots = function (g) { return g && GEAR[g.b] && GEAR[g.b].slot === 'shield' ? 0 : _os(g); }; }

/* ---------- the one-hand rule ---------- */
const shieldOk = (st = Game.st) => { const w = gearBy(st.equip && st.equip.weapon, st); return !w || ONE_HAND.has(GEAR[w.b].kind); };
const shieldOn = (st = Game.st) => { const g = gearBy(st.equip && st.equip.shield, st); return g && shieldOk(st) ? g : null; };
function shieldFix(st = Game.st) { if (st && st.equip && st.equip.shield && !shieldOk(st)) { st.equip.shield = null; return true; } return false; }
{ const _ep = equipPick; equipPick = function* (sl) {
    const st = Game.st; if (sl === 'shield' && !shieldOk(st)) { Sound.sfx('bump'); yield* say('雙手武器不能配盾。\n（劍、斧、短刀才能拿盾）'); return; }
    yield* _ep.call(this, sl); if (shieldFix(st)) { clampHP(); yield* say('雙手武器不能配盾，盾卸下了。'); } }; }
{ const _so = startOverworld; startOverworld = function (...a) { shieldFix(Game.st); return _so.apply(this, a); }; }

/* ---------- stats: 格擋 (+ 守護者 bonus), 聖盾衝擊 with a shield ---------- */
{ const _hs = heroStats; heroStats = function (st = Game.st) {
    const s = _hs(st), g = shieldOn(st); s.block = 0;
    if (g) { s.block = gearStats(g).sp.block || 0; if (clsV7(st.cls) === 'guardian') s.block += 10; s.block = Math.min(45, s.block); }
    return s; }; }
{ const _sm = sigMod; sigMod = function (o, st = Game.st) { _sm(o, st); if (o.pow && clsV7(st.cls) === 'guardian' && shieldOn(st)) o.pow = Math.round(o.pow * 1.2); }; }
if (SIG.guardian) SIG.guardian.d = '盾擊後展開護盾。持盾更強。';
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv);
    if (r && r.dmg > 0 && t && t.hero && u && !u.hero && t.stats && t.stats.block > 0 && chance(t.stats.block / 100)) {
      r.dmg = Math.max(1, Math.floor(r.dmg * 0.6)); r.blocked = true; const C = this.center(t); Sound.sfx('shield');
      this.spawn({ k: 'hex', x: C.x - 8, y: C.y, r0: 6, r1: 16, c: '#e8f4ff', life: 12 }); this.spawn({ k: 'txt', s: '格擋', x: C.x - 26, y: C.y - 24, c: '#e8f4ff', sh: '#203050', life: 30, vy: -0.4, fade: 1 }); }
    return r; }; }

/* ---------- looks: the shield on the left arm of the battle doll, and its icon ---------- */
const SHIELD_PX = {};
function shieldSprite(k) { // Codex art (SHIELD_PX_ROWS, 10×12) or a drawn heater shield in the shield's colours
  if (SHIELD_PX[k]) return SHIELD_PX[k]; const R = typeof SHIELD_PX_ROWS !== 'undefined' && SHIELD_PX_ROWS[k]; let c;
  if (R) { const [cols, rows] = R, pal = {}; cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h); c = spriteFrom(rows, pal); }
  else { const S = SHIELDS[k]; if (!S) return null; const [rim, face, emb] = S[6], o = '#1a1424';
    const rows = ['.oooooooo.', 'orrrrrrrro', 'orffffffro', 'orffeeffro', 'orfeeeefro', 'orffeeffro', 'orffeeffro', 'orffffffro', '.orffffro.', '.orrffrro.', '..orrrro..', '...oooo...'];
    c = spriteFrom(rows, { o, r: rim, f: face, e: emb }); }
  c.ok = true; return (SHIELD_PX[k] = c);
}
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) {
    const L = _hl(st, over), eq = { ...(st.equip || {}), ...over }, g = gearBy(eq.shield, st), w = gearBy(eq.weapon, st);
    if (g && (!w || ONE_HAND.has(GEAR[w.b].kind))) L.skey = g.b; return L; }; }
{ const _hb = heroBattleImgLook, cache = {}; heroBattleImgLook = function (frame, L) {
    const im = L && L.skey && shieldSprite(L.skey); if (!im) return _hb(frame, L);
    const key = frame + lookKey(L); if (cache[key]) return cache[key];
    const base = _hb(frame, { ...L, skey: undefined }), c = mkCanvas(base.width, base.height), x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0); x.drawImage(im, 0, (11 - (frame ? 1 : 0)) * 3, im.width * 3, im.height * 3); // left hand ≈ doll (2,17)
    return (cache[key] = c); }; }
for (const k in SHIELDS) Object.defineProperty(ARMOR_PX, k + '_icon', { configurable: true, enumerable: true, get: () => shieldSprite(k) });
// 守護者 starts with a wooden shield; a 守護者 save from before v10.5 gets one once
{ const _as = applyStartClass; applyStartClass = function (k) { _as(k); const st = Game.st; if (k === 'guardian' && st && !st.equip.shield) { const g = makeGear('woodShield', 1); if (shieldOk(st)) st.equip.shield = g.u; } }; }
{ const _so = startOverworld; startOverworld = function (...a) {
    const st = Game.st, give = st && !st.flags.shieldGift && clsV7(st.cls) === 'guardian' && !(st.gear || []).some(g => GEAR[g.b] && GEAR[g.b].slot === 'shield');
    if (st) st.flags.shieldGift = 1; let g = null; if (give) { g = makeGear('woodShield', 1); if (shieldOk(st)) st.equip.shield = g.u; }
    const ow = _so.apply(this, a);
    if (g && ow && ow.run) ow.run((function* () { yield* wait(30); Sound.jingle('item'); yield* say('【新裝備：盾牌】守護者拿到了「木製圓盾」！\n（劍、斧、短刀可以配盾，會提高防禦和格擋）'); })());
    return ow; }; }

/* ---------- v10.5 (player): an elite beaten before gives 70% less EXP (not announced) ---------- */
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const F = this.F, st = Game.st, key = this.cfg.id || (F && F.sp);
    this._eliteAgain = !!(F && F.elite && !F.boss && key && st.kills && st.kills[key] > 0); return yield* _v.call(this); }; }
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { yield* _ge.call(this, this._eliteAgain ? Math.max(1, Math.floor(a * 0.3)) : a); }; }

/* ---------- v10.5 聖盾衝擊 redone (player: 「特效不符合盾牌＋衝撞」): the shield rushes in front of the hero and slams ---------- */
const HOLY_SHIELD = spriteFrom(['...oooooo...', '..oggggggo..', '.oggwwwwggo.', 'ogwwwccwwwgo', 'ogwwwccwwwgo', 'ogwccccccwgo', 'ogwccccccwgo', 'ogwwwccwwwgo', '.ogwwccwwgo.', '.ogwwccwwgo.', '..ogwwwwgo..', '...oggggo...', '....oggo....', '.....oo.....'],
  { o: '#3a2a10', g: '#e8b840', w: '#e8f4ff', c: '#ffd860' });
function scaled2(c) { const o = mkCanvas(c.width * 2, c.height * 2), x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, o.width, o.height); return o; }
FX.shieldCharge = function* (U, T, u, t) {
  const g = shieldOn(Game.st), big = scaled2(g ? shieldSprite(g.b) : HOLY_SHIELD), F = 7;
  Sound.sfx('shield'); this.spawn({ k: 'glow', x: U.x, y: U.y - 6, r: 18, c: '#ffe8a0', life: 10 }); yield* wait(5);
  this.spawn({ k: 'img', img: big, x: U.x + 4, y: U.y - 8, life: F + 5, upd: p => { const k = Math.min(1, p.t / F); p.x = lerp(U.x + 4, T.x - 6, k); p.y = lerp(U.y - 8, T.y + 4, k); if (p.t % 2 === 0) this.spawn({ k: 'dot', x: p.x + rnd(-8, 8), y: p.y + rnd(-8, 8), c: '#fff4c0', s: 2, life: 8 }); } });
  for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x - 8 + i * 8, y1: U.y + 2 - i * 3, x2: T.x - 12 + i * 8, y2: T.y + 8 - i * 3, c: 'rgba(255,240,200,0.55)', w: 1, grow: 4, life: 9 });
  yield* this.lunge(u, 20, 4); Sound.sfx('heavy');
  this.spawn({ k: 'flash', c: '#fff0c0', a: 0.3, life: 6 }); this.spawn({ k: 'ring', x: T.x, y: T.y + 2, r0: 4, r1: 34, c: '#ffd860', w: 3, life: 12 }); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 6, r1: 22, c: '#fff4c0', life: 12 });
  this.sparks(T.x, T.y, 14, ['#ffffff', '#ffe8a0', '#e8b840'], 3, 16, 0.1); this.star(T.x, T.y, '#ffffff', 8);
  if (t) yield* this.shakeB(t, 8, 3); else yield* wait(8);
  this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 10, r1: 22, c: '#bfe6ff', life: 18 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 16, c: '#bfe6ff', life: 14 }); yield* wait(6);
};
if (MOVES.sig_guardian) MOVES.sig_guardian.fx = 'shieldCharge';
// weapons say quietly whether they are one- or two-handed (player: 「明確分類雙手與單手，但不用太明顯」)
const handTag = B => B && B.slot === 'weapon' && B.kind ? (ONE_HAND.has(B.kind) ? '（單手）' : '（雙手）') : '';
