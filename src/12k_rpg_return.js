/* ===================== v12.86 回到 RPG（玩家：「移除所有卡牌化資料 重新改回正統RPG」，2026-10-09） =====================
   卡牌版（v13～v14.33）整個拿掉，遊戲回到封存的 RPG 版 v12.85；卡牌版的程式封存在 git 標籤 card-final-v14.33。
   用卡牌版玩過的存檔（有 st.k14）：當時沒穿在身上的裝備和 MP・強化類道具被換成了金幣（等級、穿著的裝備都還在）。
   玩家選「補發一套符合等級的裝備」：第一次讀到這種存檔時，送一套藍色的武器・頭・身體・腳（跟身上同一種武器、同一類防具，
   放在背包、不自動換上），當時換到的金幣照留。 */
const RPG_BACK12 = {
  tier: lv => clamp(Math.ceil((lv || 1) / 7), 1, 7), // Lv1–7 → 第 1 階 … Lv43 以上 → 第 7 階
  kindOn(st, slot) { const g = gearBy(st.equip && st.equip[slot], st); return g && GEAR[g.b] ? GEAR[g.b].kind : null; },
  pick(slot, T, kind) { const ok = (k, strict) => { const B = GEAR[k]; return B.slot === slot && B.t <= T && (!kind || B.kind === kind) && (!strict || (B.price && !B.fx && !B.lord12)); };
    for (const strict of [true, false]) { const L = Object.keys(GEAR).filter(k => ok(k, strict)); if (L.length) { const t = Math.max(...L.map(k => GEAR[k].t)); return pick(L.filter(k => GEAR[k].t === t)); } }
    return null; },
  give(st) { const T = this.tier(st.lv), out = [];
    for (const slot of ['weapon', 'head', 'body', 'feet']) { const kind = this.kindOn(st, slot === 'weapon' ? 'weapon' : 'body') || this.kindOn(st, slot);
      let b = this.pick(slot, T, kind) || this.pick(slot, T, null); if (!b) continue; if (slot === 'weapon' && typeof classGear === 'function') b = classGear(b, st); if (!GEAR[b]) continue;
      out.push(gearName(makeGear(b, 1))); }
    return out; } };
function* rpgBackNote12(names) { yield* wait(30);
  yield* say('【系統更新】遊戲回到原本的 RPG 版了！\n卡牌、牌組都拿掉了，等級和裝備重新有用。');
  yield* say('卡牌版時沒穿在身上的裝備被換成了金幣（金幣照留）。\n補發一套符合等級的裝備，放在背包裡：');
  yield* say(names.join('\n')); }
{ const _so = startOverworld; startOverworld = function () { const st = Game.st, need = !!(st && st.k14 && !(st.flags && st.flags.rpgBack12)); let names = [];
    if (need) { st.flags = st.flags || {}; st.flags.rpgBack12 = 1; try { names = RPG_BACK12.give(st); } catch (e) { console.error(e); } }
    const ow = _so(); if (need && names.length) { const prev = ow.script; ow.script = null; ow.run((function* () { if (prev) yield* prev; yield* rpgBackNote12(names); })()); }
    return ow; }; }
