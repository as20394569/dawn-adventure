/* ===================== v25 異界迴廊 difficulty (playtest: too easy because the rift gear came in too high a quality) =====================
   Chests: 紫 early, 紅 from 8F, 金 only 14F+ (see riftChest). Badge shop: 紫 ticket. Foes never fall far below the hero's level
   (riftLv) and are a little tougher; rift bosses roll the elite loot table (fewer 金). */
const RIFT_TOUGH = { hp: 1.15, pow: 1.1, bossHp: 1.1 };
const inRift = () => !!(Game.ow && Game.ow.map && Game.ow.map.id === 'rift');
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) {
    const f = _mf(sp, lv, kind); if (!inRift()) return f; const s = f.stats, kh = RIFT_TOUGH.hp * (kind === 'boss' ? RIFT_TOUGH.bossHp : 1);
    s.hp = Math.round(s.hp * kh); f.hp = f.maxhp = s.hp; for (const k of ['atk', 'spa']) s[k] = Math.round(s[k] * RIFT_TOUGH.pow); return f;
  };
  const _rq = rollLootQuality; rollLootQuality = function (boss) { return _rq(inRift() ? false : boss); };
}
