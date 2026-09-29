/* ===================== v26 武器繼承 (request: weapons get replaced too fast — let a favourite weapon take over another weapon's power) =====================
   At the smith: pick the weapon to keep, then any other weapon as the donor. The kept weapon keeps its name, look, element,
   skills, passive and 特技, and takes over the donor's base stats, quality, roll, affixes (and a 虹 special); the higher
   enhancement of the two stays. The donor is used up. A donor of the other kind of power (物攻 ↔ 魔攻) is converted, so a
   strong axe can feed a favourite staff. g.sb = the base whose numbers the weapon now uses. */
const weaponMainStat = b => { const s = (GEAR[b] || {}).st || {}; return (s.spa || 0) > (s.atk || 0) ? 'spa' : 'atk'; };
{ const _gs = gearStats; gearStats = function (g) {
    if (!g || !g.sb || !GEAR[g.sb] || g.sb === g.b) return _gs(g);
    const o = _gs({ ...g, b: g.sb }), mine = weaponMainStat(g.b), theirs = weaponMainStat(g.sb);
    if (mine !== theirs) { const a = o.st.atk || 0, s = o.st.spa || 0; o.st.atk = s; o.st.spa = a; if (!o.st.atk) delete o.st.atk; if (!o.st.spa) delete o.st.spa; }
    o.fx = [...(GEAR[g.b].fx || []), ...(g.x ? [g.x] : [])]; return o;
  };
}
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const L = _gi(g, wrapW); if (g && g.sb && GEAR[g.sb] && g.sb !== g.b) L.splice(1, 0, ['【繼承】能力來自「' + GEAR[g.sb].n + '」', '#c8b0ff', 10, 0]); return L; }; }
const inheritCost = d => Math.round(((GEAR[d.sb || d.b] || {}).t || 1) * 120 + (d.q || 1) * 80 + (d.e || 0) * 60);
function inheritResult(t, d) { return { ...t, sb: d.sb || d.b, q: d.q, r: d.r, a: (d.a || []).map(a => a.slice()), x: d.x, e: Math.max(t.e || 0, d.e || 0) }; }
const mainStatTxt = g => { const k = weaponMainStat(g.b), v = gearStats(g).st[k] || 0; return (k === 'spa' ? '魔攻' : '物攻') + v; };
function* inheritFlow() {
  const st = Game.st, weapons = () => gearSort().filter(g => GEAR[g.b].slot === 'weapon');
  if (!st.flags.inhTut) { st.flags.inhTut = 1; yield* sayAll(['喜歡的武器捨不得換掉？那就讓它繼承別把武器的力量吧。', '留下來的武器，名字、外觀和技能都不變；能力、品質和詞綴會換成素材武器的。', '素材武器會熔掉消失。物攻和魔攻的武器也能互相繼承，我會幫你換算。']); }
  while (true) {
    const tgt = yield* gearPicker('繼承：要留下哪一把？', weapons, (x, g, Y) => { Font.draw(x, '這把的名字、外觀、技能會保留', 12, Y, UIC.accent, UIC.textSh, 10); });
    if (!tgt) return;
    if (!weapons().some(g => g !== tgt && !isEquipped(g))) { yield* say('沒有其他可以當素材的武器。（裝備中的武器不能當素材）'); continue; }
    const don = yield* gearPicker('繼承：吸收哪一把的能力？', () => weapons().filter(g => g !== tgt && !isEquipped(g)), (x, g, Y) => {
      const after = inheritResult(tgt, g), c = inheritCost(g);
      Font.draw(x, gearShort(tgt) + '：' + mainStatTxt(tgt) + ' → ' + mainStatTxt(after), 12, Y, UIC.accent, UIC.textSh, 9);
      Font.draw(x, '品質：' + qName(tgt.q) + ' → ' + qName(g.q) + '　詞綴' + (g.a || []).length + '條', 12, Y + 12, UIC.text, UIC.textSh, 9);
      Font.drawR(x, c + ' G', 164, Y + 26, st.money >= c ? UIC.warm : UIC.bad, UIC.textSh, 10); });
    if (!don) continue;
    const c = inheritCost(don); if (st.money < c) { yield* say('錢不夠喔。'); continue; }
    if (!(yield* yesNo('要把「' + gearShort(don) + '」的能力繼承給「' + gearShort(tgt) + '」嗎？\n（' + gearShort(don) + '會消失・' + c + ' G）'))) continue;
    st.money -= c; Object.assign(tgt, inheritResult(tgt, don)); if (!tgt.x) delete tgt.x;
    st.gear = st.gear.filter(g => g !== don); if (st.sub && st.sub.u === don.u) st.sub = null; clampHP();
    Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle('levelup'); yield* itemGet(gearName(tgt) + '繼承了新的力量！（' + mainStatTxt(tgt) + '）');
  }
}
