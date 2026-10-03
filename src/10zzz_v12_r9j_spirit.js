/* ===================== v12.0.9j 鬥志（開場職業資源 +1）修正（玩家 2026-10-04「鬥志的開場資源+1沒有效果」） =====================
   - 遊俠沒有資源條，以前是「第一次命中多 1 層獵印」，看起來像沒效果 → 改成開場時每隻魔物身上就有 1 層獵印。
   - 異界勇者：以前是「每種魔物看破至少 1」，有天賦「預讀」時兩個重疊等於沒效果 → 改成每種魔物看破 +1（在預讀之後算）。
   - 魔導士：以前加武器屬性的咒印，已經有同屬性咒印（例如天賦「迅咒」的雷咒印＋雷屬性武器）時沒效果 → 改成加一個還沒有的屬性。
   - 裝備說明照目前的職業寫出實際效果（例如「開場劍意 +1」）。 */
Object.assign(EFFECT_TYPES, {
  spirit_marks9: { exec(core, ef, ctx) { const u = ctx.owner; for (const f of core.foesOf(u)) if (core.isUp(f)) core.applyStatus(u, f, 'hunt_mark', { quiet: true }); } },
  spirit_insight9: { exec(core, ef, ctx) { const u = ctx.owner, I = u.data.insight || (u.data.insight = {}), mx = BV12.insightMax(core, u);
    for (const f of core.foesOf(u)) { const k = BV12.insightKey(core, u, f); I[k] = Math.min(mx, (I[k] || 0) + 1); } } },
  spirit_sigil9: { exec(core, ef, ctx) { const u = ctx.owner, L = u.data.sigils || []; const el = [u.data.welem, '火', '水', '雷', '草'].find(e => e && ['火', '水', '雷', '草'].includes(e) && !L.includes(e));
    if (el) EFFECT_TYPES.sigil_add.exec(core, { type: 'sigil_add', el }, ctx); } },
});
{ const R = res => [{ on: EVT.BATTLE_START, phase: 'POST', prio: -10, effects: [{ type: 'resource', target: 'self', res, amount: 1, why: 'start' }] }], S = type => [{ on: EVT.BATTLE_START, phase: 'POST', prio: -10, effects: [{ type }] }];
  const T = { swordsman: R('ki'), guardian: R('stance'), bard: R('beat'), monk: R('chi'), dragoon: R('dragon'), spellblade: R('rune'),
    mage: S('spirit_sigil9'), otherworlder: S('spirit_insight9'), ranger: S('spirit_marks9'),
    machinist: [{ on: EVT.BATTLE_START, phase: 'POST', prio: -10, effects: [{ type: 'status', target: 'self', status: 'turret', delta: 1 }] }] };
  DEF.passives.faSpirit.make = (v, u) => ({ triggers: T[u && u.cls] || [] }); }
const SPIRIT_TXT9 = { swordsman: '開場劍意 +1', guardian: '開場守勢 +1', bard: '開場樂章 +1', monk: '開場氣 +1', dragoon: '開場龍血 +1', spellblade: '開場魔紋 +1',
  mage: '開場多 1 個咒印（武器屬性，已經有就換別的屬性）', otherworlder: '開場每種魔物看破 +1', ranger: '開場時每隻魔物身上有 1 層獵印', machinist: '開場砲台多 1 發彈藥' };
FA9.f_spirit[4] = () => { const c = Game.st && Game.st.cls ? clsV7(Game.st.cls) : null; return SPIRIT_TXT9[c] || '開場職業資源 +1'; };
