/* ===================== v19.2 battle side of the skill / talent rework (04q) ===================== */
// 破盾 skills and the 碎盾之心 talent: extra shield chip on the first hit of a move
// ailment resistance (鋼鐵意志)
// timers
// existing saves: talents changed → refund every talent point once
function talentRefund(st) { if (!st || (st.talV || 1) >= TALENT_VERSION) return false; let n = 0; for (const k in st.tal || {}) n += st.tal[k] || 0; st.tal = {}; st.tp = (st.tp || 0) + n; st.talV = TALENT_VERSION; return n > 0; }
{ const _so = startOverworld; startOverworld = function (...a) { const r = _so.apply(this, a); const st = Game.st; if (st && !st.talV) { const had = talentRefund(st); if (had && r && r.run) r.run((function* () { yield* wait(1); /* v12.0.3: old-save notice removed (the rules it described are gone) */ })()); else st.talV = TALENT_VERSION; } return r; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.talV = TALENT_VERSION; return st; }; }
