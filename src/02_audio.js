/* ===================== AUDIO: chiptune sequencer + sfx ===================== */
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const PC_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteMidi(n) { const m = n.match(/^([A-G])([#b]?)(\d)$/); let pc = NOTE_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 12 * (+m[3] + 1) + pc; }
const midiName = m => PC_NAME[m % 12] + (Math.floor(m / 12) - 1);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function chordTones(name) {
  const m = name.match(/^([A-G][#b]?)(m7|maj7|m|7|dim)?$/); if (!m) throw new Error('chord ' + name);
  const root = noteMidi(m[1] + '0') - 12; const q = m[2] || '';
  const iv = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6] }[q];
  return { root: ((root % 12) + 12) % 12, iv };
}
// build an arpeggio line: one chord per bar (16 sixteenths)
function arpLine(chords, pat, oct, len) {
  const out = [];
  for (const c of chords.split(/\s+/).filter(Boolean)) {
    const { root, iv } = chordTones(c); const base = 12 * (oct + 1) + root;
    for (let i = 0, k = 0; i < 16; i += len, k++) { const idx = pat[k % pat.length]; const n = base + iv[idx % iv.length] + 12 * Math.floor(idx / iv.length); out.push(midiName(n) + '.' + len); }
  }
  return out.join(' ');
}
function bassLine(chords, style, oct = 2) {
  const out = [];
  for (const c of chords.split(/\s+/).filter(Boolean)) {
    const { root, iv } = chordTones(c); const r = 12 * (oct + 1) + root, f = r + 7;
    const R = midiName(r), F = midiName(f), O = midiName(r + 12);
    if (style === 'q') out.push(`${R}.4 ${R}.4 ${F}.4 ${R}.4`);
    else if (style === 'h') out.push(`${R}.8 ${F}.8`);
    else if (style === 'w') out.push(`${R}.16`);
    else if (style === 'e8') out.push(`${R}.2 ${O}.2 ${R}.2 ${O}.2 ${R}.2 ${O}.2 ${F}.2 ${O}.2`);
    else if (style === 'walk') out.push(`${R}.4 ${midiName(r + iv[1])}.4 ${F}.4 ${midiName(r + iv[1])}.4`);
    else if (style === 'pump') out.push(`${R}.2 ${R}.2 r.2 ${R}.2 ${F}.2 r.2 ${R}.2 ${O}.2`);
  }
  return out.join(' ');
}
function drumLine(pattern, bars) { const one = pattern.replace(/\s/g, '').split('').map(c => (c === '.' ? 'r' : c) + '.1').join(' '); return Array(bars).fill(one).join(' '); }

const SONG_DEFS = (() => {
  const P = (duty, vol, notes) => ({ k: 'p', duty, vol, notes });
  const T = (vol, notes) => ({ k: 't', vol, notes });
  const N = (vol, notes) => ({ k: 'n', vol, notes });
  const S = {};
  let ch;
  ch = 'C G Am Em F C F G Am F C G Am F D G';
  S.title = { bpm: 120, ch: [
    P(.5, .13, 'L E5.4 G5 C6.6 B5.2 | D6.4 B5 G5.8 | A5.4 C6 E6.6 D6.2 | B5.12 G5.4 | A5.4 C6 F6.6 E6.2 | E6.4 D6 C6 G5 | A5.4 B5 C6 D6 | D6.8 r.4 G5.2 G5 | C6.6 B5.2 A5.4 E5 | F5.4 A5 C6.8 | E6.6 D6.2 C6.4 G5 | B5.4 D6 G6.8 | E6.6 D6.2 C6.4 A5 | F6.6 E6.2 D6.4 C6 | D6.4 F#6 A6 F#6 | G6.8 F6.4 D6'),
    P(.25, .06, 'L ' + arpLine(ch, [0, 1, 2, 3, 2, 1, 2, 1], 4, 2)),
    T(.2, 'L ' + bassLine(ch, 'q')),
    N(.35, 'L ' + drumLine('k...h...s...h.h.', 16))] };
  ch = 'G C G D Em C D G C D Bm Em Am D G G';
  S.town = { bpm: 100, ch: [
    P(.25, .12, 'L B4.4 D5 G5.6 F#5.2 | E5.4 C5 E5.8 | D5.4 B4 G4 B4 | A4.12 r.4 | G4.4 B4 E5.6 D5.2 | C5.4 E5 G5.6 E5.2 | F#5.4 E5 D5 C5 | B4.12 r.4 | E5.6 F#5.2 G5.4 E5 | F#5.6 E5.2 D5.8 | D5.4 F#5 B5.6 A5.2 | G5.8 E5 | C5.4 E5 A5.6 G5.2 | F#5.4 A5 D6 C6 | B5.6 A5.2 G5.4 D5 | G5.12 r.4'),
    P(.125, .06, 'L ' + arpLine(ch, [0, 2, 1, 2], 4, 2)),
    T(.2, 'L ' + bassLine(ch, 'walk')),
    N(.18, 'L ' + drumLine('k.h.h.h.k.h.h.h.', 16))] };
  ch = 'D A Bm G D A G A Bm G D A Bm G E A';
  S.route = { bpm: 136, ch: [
    P(.5, .12, 'L A4.2 D5 F#5.4 A5 F#5.2 D5 | E5.4 C#5.2 E5 A5.8 | B5.4 A5.2 F#5 D5.4 F#5 | G5.6 F#5.2 E5.8 | A4.2 D5 F#5.4 A5 D6 | C#6.4 B5.2 A5 E5.8 | G5.4 B5 D6 B5 | A5.8 E5.4 C#5 | D5.4 F#5 B5.6 A5.2 | G5.4 B5 D6.6 B5.2 | A5.4 F#5 D5 F#5 | E5.6 F#5.2 G5.4 A5 | B5.6 C#6.2 D6.4 B5 | G5.4 A5 B5 D6 | E6.4 D6 B5 G#5 | A5.8 C#6.4 E6'),
    P(.25, .055, 'L ' + arpLine(ch, [0, 1, 2, 1], 4, 2)),
    T(.22, 'L ' + bassLine(ch, 'pump')),
    N(.32, 'L ' + drumLine('k.h.s.h.k.k.s.h.', 16))] };
  ch = 'Am Am F G Am Am F E Dm Dm Am Am F G E E';
  S.battle = { bpm: 168, ch: [
    P(.5, .12, 'A6.1 G#6 G6 F#6 F6 E6 D#6 D6 C#6 C6 B5 A#5 A5.4 L A5.2 A5 E5 A5 C6.4 B5 | A5.2 G5 A5 C6 E6.8 | F6.4 E6.2 D6 C6.4 A5 | B5.4 G5.2 B5 D6.8 | A5.2 A5 E5 A5 C6.4 E6 | D6.2 C6 B5 C6 A5.8 | F5.4 A5 C6 F6 | E6.8 G#5.4 B5 | D6.6 C6.2 A5.4 F5 | D5.4 F5 A5 D6 | C6.6 B5.2 A5.4 E5 | A5.4 C6 E6.8 | F6.4 E6 D6 C6 | D6.4 C6 B5 D6 | E6.4 B5 G#5 B5 | E5.2 G#5 B5 E6 G#6.8'),
    P(.25, .05, 'r.16 L ' + arpLine(ch, [0, 1, 2, 1], 4, 1)),
    T(.24, 'A2.2 r.2 A2.2 r.2 A2.2 r.2 E2.2 G#2.2 L ' + bassLine(ch, 'e8')),
    N(.36, drumLine('k...k...k...s.s.', 1) + ' L ' + drumLine('k.h.s.h.k.k.s.h.', 16))] };
  ch = 'Em C D B Em C Am B C D Em Em Am B Em B';
  S.elite = { bpm: 176, ch: [
    P(.5, .12, 'B5.2 E6 B5 E6 B5 E6 F#6 G6 L E5.2 G5 B5 E6 D6.4 B5 | C6.4 G5 E5 G5 | F#5.2 A5 D6 F#6 E6.4 D6 | D#6.8 B5 | E6.4 D6.2 B5 G5.4 B5 | C6.4 E6 G6.8 | A6.4 G6.2 E6 C6.4 A5 | B5.4 D#6 F#6 B6 | G6.6 E6.2 C6.4 E6 | F#6.6 D6.2 A5.4 D6 | E6.4 B5 G5 B5 | E6.8 r.4 E6.2 F#6 | G6.4 F#6.2 E6 C6.4 E6 | F#6.4 E6.2 D#6 B5.8 | E6.4 G6 B6 G6 | F#6.4 D#6 B5 D#6'),
    P(.125, .06, 'r.16 L ' + arpLine(ch, [0, 1, 2, 3], 4, 1)),
    T(.24, 'E2.2 E2 E2 E2 E2 E2 D#2 D2 L ' + bassLine(ch, 'e8')),
    N(.36, drumLine('k.k.k.k.s.s.ssss', 1) + ' L ' + drumLine('k.hks.h.k.hks.hs', 16))] };
  ch = 'Dm Dm Bb C Dm Dm Gm A Bb C Dm Dm Gm A Dm A';
  S.boss = { bpm: 180, ch: [
    P(.5, .12, 'r.16 | A4.2 C#5 E5 A5 C#6 E6 G6 A6 L D5.2 D5 D6.4 C6.2 A5 F5.4 | G5.2 A5 C6 A5 D6.8 | F6.4 D6 Bb5 F5 | G5.4 C6 E6.8 | F6.2 E6 D6.4 A5 F5 | D5.4 F5 A5 D6 | G6.4 F6.2 D6 Bb5.4 G5 | A5.4 C#6 E6 A6 | Bb5.6 C6.2 D6.4 F6 | E6.6 D6.2 C6.4 G5 | A5.4 D6 F6 A6 | G6.2 F6 E6 F6 D6.8 | Bb6.4 A6.2 G6 D6.4 Bb5 | C#6.4 E6 A6 G6 | F6.4 E6 D6 A5 | A5.2 C#6 E6 G6 A6.8'),
    P(.25, .06, 'r.16 r.16 L ' + arpLine(ch, [0, 2, 1, 2, 0, 2, 3, 2], 4, 1).replace(/\.1/g, '.1')),
    T(.26, 'D2.4 r.4 D2.4 r.4 | D2.2 D2 D2 D2 C#2.2 C#2 C#2 C#2 L ' + bassLine(ch, 'e8')),
    N(.4, drumLine('k...k...k...k...', 1) + ' ' + drumLine('k.k.k.k.s.s.ssss', 1) + ' L ' + drumLine('k.hsk.hsk.hsksss', 1) + ' ' + drumLine('k.hsk.hsk.hsk.hs', 15))] };
  ch = 'Am F Am E Am F Dm E';
  S.ruins = { bpm: 84, ch: [
    P(.125, .11, 'L E5.8 C5.4 A4 | F5.8 A5.4 C6 | B5.6 A5.2 E5.8 | G#5.12 r.4 | A5.8 E5.4 C5 | D5.8 F5.4 A5 | F5.6 E5.2 D5.8 | E5.12 r.4'),
    P(.25, .045, 'L ' + arpLine(ch, [0, 1, 2, 1], 4, 2)),
    T(.2, 'L ' + bassLine(ch, 'w')),
    N(.12, 'L ' + drumLine('k.......h.......', 8))] };
  S.victory = { bpm: 150, ch: [
    P(.5, .13, 'G5.2 G5 G5 G5 C6.8 | E6.4 D6.2 E6 G6.8 L E6.4 C6 G5 C6 | A5.4 C6 F6.8 | D6.4 B5 G5 B5 | C6.12 r.4'),
    P(.25, .07, 'E5.2 E5 E5 E5 E5.8 | G5.4 F5.2 G5 B5.8 L ' + arpLine('C F G C', [0, 1, 2, 1], 4, 2)),
    T(.22, 'C3.2 C3 C3 C3 C3.8 | C3.4 G2 C3.8 L ' + bassLine('C F G C', 'q')),
    N(.3, drumLine('k.k.k.k.k...s...', 1) + ' ' + drumLine('k...s...k.s.s.s.', 1) + ' L ' + drumLine('k...s...k...s...', 4))] };
  S.heal = { bpm: 120, once: true, ch: [P(.5, .13, 'C5.2 E5 G5 C6.4 r.2 G5.2 C6.8'), P(.25, .07, 'E4.2 G4 C5 E5.4 r.2 E5.2 E5.8'), T(.2, 'C3.8 G2.2 r.2 C3.8')] };
  S.levelup = { bpm: 150, once: true, ch: [P(.5, .13, 'G5.2 A5 B5 D6 r.1 B5.1 D6.8'), P(.25, .07, 'D5.2 F#5 G5 B5 r.1 G5.1 B5.8'), T(.2, 'G3.4 D3.4 G3.8')] };
  S.item = { bpm: 130, once: true, ch: [P(.5, .13, 'C6.2 G5 C6 E6 D6.4 G6.8'), P(.25, .07, 'E5.2 E5 E5 G5 F5.4 B5.8'), T(.2, 'C3.4 C3.4 G2.4 C3.8')] };
  S.lose = { bpm: 90, once: true, ch: [P(.5, .12, 'E5.4 D#5 D5 C#5.12'), P(.25, .06, 'C5.4 B4 A#4 A4.12'), T(.2, 'A2.8 E2.8 A1.8')] };
  return S;
})();

function compileSong(def) {
  const sp16 = 60 / def.bpm / 4;
  const chans = def.ch.map(c => {
    const ev = []; let t = 0, len = 4, loopT = 0;
    for (const tok of c.notes.split(/\s+/)) {
      if (!tok || tok === '|') continue;
      if (tok === 'L') { loopT = t; continue; }
      const m = tok.match(/^([A-G][#b]?\d|r|k|s|h|o)(?:\.(\d+))?$/); if (!m) { console.warn('bad token', tok); continue; }
      if (m[2]) len = +m[2];
      const d = len * sp16;
      if (m[1] !== 'r') ev.push({ t, d, n: m[1] });
      t += d;
    }
    return { ...c, ev, end: t, loopT };
  });
  return { def, chans, end: Math.max(...chans.map(c => c.end)) };
}

const Sound = (() => {
  let ac = null, master, musG, sfxG, noiseBuf, waves = {};
  const compiled = {}; let cur = null, curName = null, resumeName = null, timer = null;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
    musG = ac.createGain(); musG.gain.value = Game.settings.music ? 0.6 : 0; musG.connect(master);
    sfxG = ac.createGain(); sfxG.gain.value = Game.settings.sfx ? 0.75 : 0; sfxG.connect(master);
    for (const d of [0.125, 0.25, 0.5]) {
      const n = 48, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) re[k] = 2 * Math.sin(Math.PI * k * d) / (Math.PI * k);
      waves[d] = ac.createPeriodicWave(re, im);
    }
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    timer = setInterval(tick, 25);
    if (resumeName) { const n = resumeName; resumeName = null; play(n); }
  }
  function applySettings() { if (!ac) return; musG.gain.value = Game.settings.music ? 0.6 : 0; sfxG.gain.value = Game.settings.sfx ? 0.75 : 0; }
  function tone(dest, t, d, f, kind, duty, vol, gate = 0.92) {
    const o = ac.createOscillator(); if (kind === 'p') o.setPeriodicWave(waves[duty] || waves[0.5]); else o.type = kind === 't' ? 'triangle' : kind;
    o.frequency.setValueAtTime(f, t); const g = ac.createGain(); const e = t + d * gate;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.linearRampToValueAtTime(vol * 0.72, t + Math.min(0.12, d * 0.5)); g.gain.setValueAtTime(vol * 0.72, Math.max(t + 0.01, e - 0.02)); g.gain.linearRampToValueAtTime(0, e);
    o.connect(g); g.connect(dest); o.start(t); o.stop(e + 0.02);
  }
  function drum(dest, t, n, vol) {
    if (n === 'k') {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      const g = ac.createGain(); g.gain.setValueAtTime(vol * 1.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.18); return;
    }
    const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); const g = ac.createGain();
    let dur = 0.05;
    if (n === 's') { f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.7; dur = 0.13; vol *= 1.1; }
    else if (n === 'h') { f.type = 'highpass'; f.frequency.value = 7000; dur = 0.035; vol *= 0.5; }
    else { f.type = 'highpass'; f.frequency.value = 6000; dur = 0.16; vol *= 0.45; }
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.01);
  }
  function tick() {
    if (!ac || !cur) return;
    const horizon = ac.currentTime + 0.18;
    for (const c of cur.state) {
      while (true) {
        if (c.i >= c.ch.ev.length) { if (cur.once) break; c.i = c.ch.ev.findIndex(e => e.t >= c.ch.loopT); if (c.i < 0) break; c.off += cur.song.end - c.ch.loopT; if (cur.song.end - c.ch.loopT <= 0) break; }
        const e = c.ch.ev[c.i]; const t = cur.t0 + c.off + e.t;
        if (t > horizon) break;
        if (t >= ac.currentTime - 0.05) {
          if (c.ch.k === 'n') drum(cur.bus, t, e.n, c.ch.vol);
          else tone(cur.bus, t, e.d, mtof(noteMidi(e.n)), c.ch.k, c.ch.duty, c.ch.vol);
        }
        c.i++;
      }
    }
    if (cur.once && ac.currentTime > cur.t0 + cur.song.end + 0.1) { const cb = cur.onEnd; stopCur(); if (cb) cb(); }
  }
  function stopCur(fadeT = 0.08) { if (cur && ac) { const b = cur.bus; b.gain.setTargetAtTime(0, ac.currentTime, fadeT / 3); setTimeout(() => { try { b.disconnect(); } catch (e) { } }, 600); } cur = null; }
  function start(name, once, onEnd) {
    const def = SONG_DEFS[name]; if (!def) return;
    if (!compiled[name]) compiled[name] = compileSong(def);
    const bus = ac.createGain(); bus.gain.value = 1; bus.connect(musG);
    const song = compiled[name];
    cur = { name, song, bus, t0: ac.currentTime + 0.06, once: once || def.once, onEnd, state: song.chans.map(ch => ({ ch, i: 0, off: 0 })) };
    tick();
  }
  function play(name) {
    if (curName === name && cur && cur.name === name) return;
    curName = name;
    if (!ac) { resumeName = name; return; }
    stopCur(); if (name) start(name);
  }
  function stop() { curName = null; stopCur(0.3); }
  function jingle(name) { // returns duration in frames
    if (!SONG_DEFS[name]) return 0; if (!compiled[name]) compiled[name] = compileSong(SONG_DEFS[name]);
    const dur = compiled[name].end;
    if (!ac) return Math.ceil(dur * 60);
    const back = curName; stopCur(0.02);
    start(name, true, () => { if (curName === back && back) start(back); });
    return Math.ceil(dur * 60) + 8;
  }
  // ---- SFX ----
  function sweep(f0, f1, dur, kind = 'p', duty = 0.5, vol = 0.18, t = 0) {
    if (!ac) return; const T = ac.currentTime + t; const o = ac.createOscillator();
    if (kind === 'p') o.setPeriodicWave(waves[duty]); else o.type = kind;
    o.frequency.setValueAtTime(f0, T); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), T + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, T); g.gain.linearRampToValueAtTime(vol * 0.8, T + dur * 0.7); g.gain.linearRampToValueAtTime(0, T + dur);
    o.connect(g); g.connect(sfxG); o.start(T); o.stop(T + dur + 0.02);
  }
  function noise(dur, vol = 0.25, ftype = 'lowpass', f0 = 3000, f1 = null, t = 0) {
    if (!ac) return; const T = ac.currentTime + t; const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = ftype; f.frequency.setValueAtTime(f0, T); if (f1) f.frequency.exponentialRampToValueAtTime(f1, T + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, T); g.gain.exponentialRampToValueAtTime(0.001, T + dur); s.connect(f); f.connect(g); g.connect(sfxG); s.start(T, Math.random() * 0.4); s.stop(T + dur + 0.02);
  }
  let lastBump = 0;
  const SFX = {
    cursor: () => sweep(1400, 1400, 0.03, 'p', 0.5, 0.08),
    select: () => { sweep(990, 990, 0.04, 'p', 0.5, 0.1); sweep(1480, 1480, 0.06, 'p', 0.5, 0.1, 0.04); },
    cancel: () => sweep(700, 420, 0.07, 'p', 0.5, 0.1),
    menu: () => { sweep(660, 660, 0.03, 'p', .25, .1); sweep(990, 990, .05, 'p', .25, .1, .03); },
    bump: () => { if (!ac || ac.currentTime - lastBump < 0.28) return; lastBump = ac.currentTime; sweep(110, 70, 0.09, 'triangle', 0.5, 0.35); },
    door: () => { noise(0.18, 0.2, 'bandpass', 900, 300); sweep(300, 180, 0.15, 'triangle', .5, .2, 0.02); },
    jump: () => sweep(260, 780, 0.14, 'p', 0.25, 0.12),
    land: () => noise(0.06, 0.18, 'lowpass', 800),
    step: () => noise(0.03, 0.05, 'highpass', 3000),
    grass: () => noise(0.07, 0.07, 'bandpass', 4000),
    exclaim: () => { sweep(1320, 1320, 0.05, 'p', .5, .12); sweep(1760, 1760, 0.08, 'p', .5, .12, 0.06); },
    encounter: () => { for (let i = 0; i < 6; i++) sweep(400 + i * 180, 500 + i * 180, 0.05, 'p', .25, .09, i * 0.05); },
    hit: () => { noise(0.14, 0.4, 'lowpass', 2400, 400); sweep(160, 60, 0.12, 'triangle', .5, .35); },
    hitSuper: () => { noise(0.24, 0.5, 'lowpass', 5000, 300); sweep(220, 50, 0.2, 'triangle', .5, .45); sweep(900, 300, 0.12, 'p', .5, .08, 0.02); },
    hitWeak: () => { noise(0.08, 0.2, 'lowpass', 1200, 400); },
    crit: () => { sweep(1800, 2400, 0.08, 'p', .125, .1); },
    statUp: () => { [0, 1, 2, 3].forEach(i => sweep(520 * Math.pow(1.26, i), 560 * Math.pow(1.26, i), 0.06, 'p', .25, .1, i * 0.06)); },
    statDown: () => { [0, 1, 2, 3].forEach(i => sweep(1000 / Math.pow(1.26, i), 950 / Math.pow(1.26, i), 0.06, 'p', .25, .1, i * 0.06)); },
    heal: () => { [0, 1, 2, 3, 4].forEach(i => sweep(880 * Math.pow(1.19, i), 900 * Math.pow(1.19, i), 0.07, 'triangle', .5, .2, i * 0.05)); },
    faint: () => sweep(900, 60, 0.7, 'p', .5, .14),
    run: () => { [0, 1, 2].forEach(i => noise(0.05, 0.15, 'bandpass', 1500, null, i * 0.09)); },
    item: () => { sweep(1200, 1200, 0.05, 'p', .5, .1); sweep(1600, 1600, 0.08, 'p', .5, .1, .06); },
    // v20.6 level up on the SFX bus (the levelup jingle rides the music bus, so it was silent with 背景音樂 off): G major arpeggio + shimmer
    levelUp: () => { const n = [784, 988, 1175, 1568]; n.forEach((f, i) => { sweep(f, f, 0.09, 'p', .25, .13, i * 0.07); sweep(f / 2, f / 2, 0.09, 'triangle', .5, .12, i * 0.07); });
      sweep(1568, 1568, 0.42, 'p', .5, .1, 0.3); sweep(1976, 1976, 0.36, 'p', .25, .06, 0.34); [0, 1, 2, 3, 4, 5].forEach(i => sweep(2400 + i * 180, 2600 + i * 180, 0.04, 'p', .5, .05, 0.34 + i * 0.05)); },
    poison: () => { [0, 1, 2].forEach(i => sweep(300 + i * 60, 200, 0.08, 'p', .25, .12, i * 0.07)); },
    save: () => { [0, 1, 2].forEach(i => sweep(660 * Math.pow(1.335, i), 660 * Math.pow(1.335, i), 0.09, 'p', .5, .1, i * 0.09)); },
    slash: () => { noise(0.12, 0.35, 'highpass', 2000, 6000); },
    fire: () => { noise(0.4, 0.3, 'bandpass', 600, 2400); },
    water: () => { [0, 1, 2, 3].forEach(i => sweep(500 + i * 90, 1200 + i * 90, 0.06, 'triangle', .5, .15, i * 0.06)); noise(0.2, .15, 'bandpass', 1200, 500, .1); },
    thunder: () => { noise(0.5, 0.45, 'lowpass', 8000, 200); sweep(80, 40, 0.4, 'sawtooth', .5, .12); },
    leaf: () => { [0, 1, 2, 3, 4].forEach(i => noise(0.05, 0.15, 'highpass', 5000, null, i * 0.05)); },
    rock: () => { [0, 1, 2].forEach(i => { noise(0.18, 0.4, 'lowpass', 900, 200, i * 0.12); sweep(120, 50, 0.15, 'triangle', .5, .3, i * .12); }); },
    wind: () => noise(0.5, 0.25, 'bandpass', 500, 3000),
    buzz: () => sweep(180, 200, 0.4, 'sawtooth', .5, .08),
    quake: () => { noise(0.9, 0.5, 'lowpass', 400, 60); sweep(60, 30, 0.8, 'triangle', .5, .4); },
    charge: () => sweep(100, 900, 0.8, 'p', .125, .1),
    tick: () => sweep(1500, 1500, 0.02, 'p', .5, .05),
  };
  function sfx(name) { if (!ac || !Game.settings.sfx) return; const f = SFX[name]; if (f) f(); }
  function cry(seed, pitch = 1, len = 1) {
    if (!ac || !Game.settings.sfx) return; const r = srand(seed * 7919 + 13);
    const base = (220 + r() * 500) * pitch, dur = (0.35 + r() * 0.3) * len;
    const T = ac.currentTime; const o = ac.createOscillator(); o.setPeriodicWave(waves[[0.125, 0.25, 0.5][Math.floor(r() * 3)]]);
    o.frequency.setValueAtTime(base, T); o.frequency.linearRampToValueAtTime(base * (1.2 + r() * 0.8), T + dur * 0.3); o.frequency.linearRampToValueAtTime(base * (0.5 + r() * 0.4), T + dur);
    const lfo = ac.createOscillator(); lfo.frequency.value = 18 + r() * 20; const lg = ac.createGain(); lg.gain.value = base * 0.08; lfo.connect(lg); lg.connect(o.frequency);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0, T); g.gain.linearRampToValueAtTime(0.17, T + 0.02); g.gain.linearRampToValueAtTime(0.12, T + dur * 0.7); g.gain.linearRampToValueAtTime(0, T + dur);
    o.connect(g); g.connect(sfxG); o.start(T); o.stop(T + dur + 0.02); lfo.start(T); lfo.stop(T + dur + 0.02);
    noise(dur * 0.6, 0.08, 'bandpass', base * 3, base * 1.5);
  }
  let expOsc = null;
  function expStart() { if (!ac || !Game.settings.sfx) return; expStop(); const o = ac.createOscillator(); o.setPeriodicWave(waves[0.5]); o.frequency.value = 500; const g = ac.createGain(); g.gain.value = 0.05; o.connect(g); g.connect(sfxG); o.start(); expOsc = { o, g, f: 500 }; }
  function expStep(t) { if (expOsc) expOsc.o.frequency.setValueAtTime(500 + t * 1200, ac.currentTime); }
  function expStop() { if (expOsc) { try { expOsc.o.stop(); } catch (e) { } expOsc = null; } }
  function setPaused(h) { if (!ac) return; try { if (h) ac.suspend(); else ac.resume(); } catch (e) { } }
  return { init, setPaused, play, stop, jingle, sfx, cry, applySettings, expStart, expStep, expStop, get ready() { return !!ac; }, get current() { return curName; } };
})();
