// v9.4 audio smoke test: every song plays, every sfx fires, battle music picks by area / final boss
module.exports = async (g) => {
  const songs = await g.ev(() => { Game.settings.music = true; Game.settings.sfx = true; Sound.init(); return Object.keys(SONG_DEFS).filter(k => !SONG_DEFS[k].once && !['victory'].includes(k)); });
  const bad = [];
  for (const k of songs) { await g.ev(k => Sound.play(k), k); await new Promise(r => setTimeout(r, 120)); const c = await g.ev(() => Sound.current); if (c !== k) bad.push(k + '→' + c); }
  await g.ev(() => { for (const n of ['hit', 'hitSuper', 'hitWeak', 'crit', 'heavy', 'foeDown', 'bossDown', 'shield', 'encounter', 'slash', 'fire', 'thunder', 'rock', 'quake', 'charge', 'water', 'wind', 'levelUp']) Sound.sfx(n); });
  await new Promise(r => setTimeout(r, 400));
  const pick = await g.ev(() => { __game.newGameState('小晨'); const st = Game.st; const r = [];
    st.map = 'goldPlains'; __battleCfg = { sp: 'slime' }; Sound.play('battle'); r.push(Sound.current);
    st.map = 'route'; __battleCfg = { sp: 'slime' }; Sound.play('battle'); r.push(Sound.current);
    __battleCfg = { sp: 'shadowGeneral' }; Sound.play('boss'); r.push(Sound.current);
    __battleCfg = { sp: 'ratKing' }; Sound.play('boss'); r.push(Sound.current);
    r.push(MAPS.starShrine.music, MAPS.forest.music, MAPS.inn.music); return r.join(','); });
  g.log('audio ready ' + await g.ev(() => Sound.ready) + ' | songs ' + songs.length + ' bad ' + (bad.join(' ') || 'none') + ' | pick ' + pick);
};
