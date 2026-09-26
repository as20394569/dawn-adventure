module.exports = async (g) => {
  g.log(await g.ev(async () => {
    Sound.init(); const errs = [];
    for (const k of Object.keys(SONG_DEFS)) { try { Sound.play(k); } catch (e) { errs.push(k + ':' + e.message); } }
    for (const k of ['cursor','select','cancel','menu','bump','door','jump','land','step','grass','exclaim','encounter','hit','hitSuper','hitWeak','crit','statUp','statDown','heal','faint','run','item','poison','save','slash','fire','water','thunder','leaf','rock','wind','buzz','quake','charge','tick']) { try { Sound.sfx(k); } catch (e) { errs.push(k + ':' + e.message); } }
    try { Sound.cry(3); Sound.jingle('levelup'); Sound.expStart(); Sound.expStep(0.5); Sound.expStop(); } catch (e) { errs.push('misc:' + e.message); }
    await new Promise(r => setTimeout(r, 600));
    return 'audio ready=' + Sound.ready + ' errors=' + JSON.stringify(errs);
  }));
};
