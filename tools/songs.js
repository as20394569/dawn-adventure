module.exports = async (g) => {
  g.log(await g.ev(() => Object.keys(SONG_DEFS).map(k => { const c = compileSong(SONG_DEFS[k]); return k + ': ' + c.chans.map(ch => (ch.end * SONG_DEFS[k].bpm / 15).toFixed(1) + '(L' + (ch.loopT * SONG_DEFS[k].bpm / 15).toFixed(0) + ')').join(' '); }).join('\n')));
};
