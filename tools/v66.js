// runtime check: every damage-related gear special / affix changes calcDamage (and the skill preview) as described
module.exports = async (g) => {
  const out = await g.ev(() => {
    const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.lv = 30; applyStartClass('swordsman'); st.hp = heroStats().hp; st.mp = heroStats().mp;
    const RND = Math.random; Math.random = () => 0.5;
    const b = new Battle({ sp: 'golem', lv: 30, kind: 'wild', bg: 'field' }); const H = b.H, F = b.F, rows = [];
    const phys = { ...MOVES.slash }, mag = { ...MOVES.fireBolt || MOVES.magicBolt };
    const dmg = (mv) => { Math.random = () => 0.5; return b.calcDamage(H, F, mv).dmg; };
    const test = (name, setup, undo, mv, expect) => { const d0 = dmg(mv); setup(); const d1 = dmg(mv); undo(); rows.push(name + ': ' + d0 + ' -> ' + d1 + ' (x' + (d1 / d0).toFixed(2) + ', expect ' + expect + ')'); };
    const fx = H.stats.fx;
    test('pierce', () => fx.pierce = 1, () => delete fx.pierce, phys, '>1 (def -30%)');
    test('lastStand@50%hp', () => { fx.lastStand = 1; H.hp = Math.round(H.maxhp / 2); }, () => { delete fx.lastStand; H.hp = H.maxhp; }, phys, '~1.25');
    test('arcaneSurge', () => { fx.arcaneSurge = 1; H.mp = H.maxmp; }, () => delete fx.arcaneSurge, mag, '~1.15');
    test('predator foe<30%', () => { fx.predator = 1; F.hp = Math.round(F.maxhp * 0.2); }, () => { delete fx.predator; F.hp = F.maxhp; }, phys, '~1.3');
    test('spellblade(gear)', () => fx.spellblade = 1, () => delete fx.spellblade, phys, '>1');
    test('elem affix +10', () => H.stats.elem = (H.stats.elem || 0) + 10, () => H.stats.elem -= 10, mag, '~1.10');
    test('vs affix +20 (construct)', () => H.stats.vs = [[F.fam, 20]], () => H.stats.vs = [], phys, '~1.2');
    test('crit affix +100', () => H.stats.crit += 100, () => H.stats.crit -= 100, phys, '~1.5 (always crit)');
    // estimateDamage (skill preview) sees them too
    const e0 = b.estimateDamage ? b.estimateDamage('powerSlash') : 0; fx.predator = 1; F.hp = Math.round(F.maxhp * 0.2); const e1 = b.estimateDamage ? b.estimateDamage('powerSlash') : 0; delete fx.predator; F.hp = F.maxhp;
    rows.push('preview predator: ' + e0 + ' -> ' + e1);
    Math.random = RND; return rows.join('\n');
  });
  g.log(out);
};
