/* ===================== v9.4 更多背景音樂・更有魄力的戰鬥音 =====================
   Playtest: "玩家背景音效不錯，希望多新增不同類型的；戰鬥時希望有魄力一點音效".
   - 15 new tracks so areas stop sharing 晨霧道路 / 古岩遺跡 music: 森林・湖畔・星見神殿・平原・峽谷・洞窟・墓穴・沼澤・鐘塔・冰窟・要塞・異界・旅店,
     plus 第二章一般戰鬥 and the 最終決戰 with 暗影將軍. (星見神殿 and 碧溪谷 pointed at a 'lake' track that never existed — they were silent.)
   - Battle songs use the heavier kick / snare (def.heavy) and a sawtooth layer on the bass.
   - Sound effects (02_audio): compressor + crunch send, sub-bass drops on hits, the music ducks for a moment on big hits,
     new sounds for 重擊 on you, a foe going down, and a boss going down. */
(() => {
  const P = (duty, vol, notes, o) => Object.assign({ k: 'p', duty, vol, notes }, o);
  const T = (vol, notes, o) => Object.assign({ k: 't', vol, notes }, o);
  const N = (vol, notes) => ({ k: 'n', vol, notes });
  const Q = (vol, notes, o) => Object.assign({ k: 'sine', vol, notes, env: 'pl' }, o); // bell / harp
  const SAW = (vol, notes) => ({ k: 'sawtooth', vol, notes });
  const S = SONG_DEFS; let ch;

  ch = 'Em C Am B Em C D B'; // 迷霧森林: hushed, thin lead with echo
  S.forest = { bpm: 92, echo: 0.33, ch: [
    P(.125, .11, 'L B4.4 E5.4 G5.6 F#5.2 | E5.8 G5.4 C6.4 | B5.6 A5.2 E5.8 | D#5.12 r.4 | G5.4 B5.4 E6.6 D6.2 | C6.4 B5.4 G5.8 | A5.4 F#5.4 D5.4 F#5.4 | B4.8 D#5.4 F#5.4', { vib: 1, e: 1 }),
    P(.25, .04, 'L ' + arpLine(ch, [0, 1, 2, 1, 2, 1, 0, 2], 4, 2), { e: 1 }),
    T(.18, 'L ' + bassLine(ch, 'h')),
    N(.12, 'L ' + drumLine('k.....h...k.h...', 8))] };

  ch = 'F C Dm Bb F C Bb C'; // 湖畔・碧溪谷: calm, harp arpeggios
  S.lake = { bpm: 84, echo: 0.36, ch: [
    P(.25, .09, 'L A5.6 G5.2 F5.8 | G5.4 E5.4 C5.8 | D5.4 F5.4 A5.6 G5.2 | F5.12 r.4 | C6.6 Bb5.2 A5.8 | G5.4 A5.2 G5.2 E5.8 | D5.4 F5.4 Bb5.6 A5.2 | G5.12 r.4', { vib: 1 }),
    Q(.07, 'L ' + arpLine(ch, [0, 1, 2, 3, 4, 3, 2, 1], 4, 2), { e: 1 }),
    T(.17, 'L ' + bassLine(ch, 'w'))] };

  ch = 'Dmaj7 Em7 Gmaj7 A Dmaj7 Bm7 Gmaj7 A'; // 星見神殿: slow bells
  S.star = { bpm: 72, echo: 0.42, ch: [
    Q(.12, 'L F#6.4 A6.4 C#6.8 | B5.4 D6.4 G6.8 | F#6.6 E6.2 D6.8 | C#6.4 E6.4 A5.8 | F#6.4 A6.4 D7.8 | C#7.6 B6.2 F#6.8 | G6.4 F#6.4 D6.8 | E6.12 r.4', { e: 1 }),
    T(.08, 'L ' + arpLine(ch, [0, 1, 2, 3], 3, 4)),
    T(.15, 'L ' + bassLine(ch, 'w'))] };

  ch = 'G D Em C G D C D Em Bm C G Am D G G'; // 平原・丘陵・楓紅關道: bright, pastoral
  S.plains = { bpm: 112, ch: [
    P(.5, .11, 'L D5.4 G5.4 B5.6 A5.2 | A5.4 F#5.4 D5.8 | E5.4 G5.4 B5.4 E6.4 | D6.6 C6.2 G5.8 | B5.4 D6.4 G6.6 F#6.2 | E6.4 D6.4 A5.8 | G5.4 A5.4 B5.4 C6.4 | D6.12 r.4 | B5.6 C6.2 B5.4 G5.4 | F#5.6 G5.2 F#5.4 D5.4 | E5.4 G5.4 C6.6 B5.2 | B5.8 G5.8 | A5.4 C6.4 E6.6 D6.2 | C6.4 A5.4 F#5.4 A5.4 | G5.4 B5.4 D6.4 B5.4 | G5.12 r.4'),
    P(.125, .05, 'L ' + arpLine(ch, [0, 1, 2, 1], 4, 2)),
    T(.2, 'L ' + bassLine(ch, 'q')),
    N(.22, 'L ' + drumLine('k...h.h.k.k.h.h.', 16))] };

  ch = 'Dm Dm C C Bb Bb A A Dm F C G Bb Gm A A'; // 落日峽谷: western gallop
  S.canyon = { bpm: 124, echo: 0.24, ch: [
    P(.25, .11, 'L D5.4 A5.8 F5.2 E5.2 | D5.12 A4.4 | C5.4 G5.8 E5.2 D5.2 | C5.12 G4.4 | Bb4.4 F5.8 D5.2 C5.2 | Bb4.8 D5.4 F5.4 | E5.4 A5.4 C#6.4 E6.4 | A5.12 r.4 | D6.6 C6.2 A5.8 | F5.4 A5.4 C6.8 | G5.6 E5.2 C5.8 | D5.4 G5.4 B5.8 | Bb5.6 A5.2 F5.8 | G5.4 Bb5.4 D6.8 | C#6.4 A5.4 E5.4 G5.4 | A5.12 r.4', { vib: 1.2, e: 1 }),
    P(.125, .045, 'L ' + arpLine(ch, [0, 2, 1, 2], 4, 2)),
    T(.22, 'L ' + bassLine(ch, 'pump')),
    N(.25, 'L ' + drumLine('k..hk.h.k..hk.hs', 16))] };

  ch = 'Dm Bb Gm A Dm Bb Gm A'; // 地下水道・礦坑: water drips
  S.cave = { bpm: 88, echo: 0.34, ch: [
    Q(.12, 'L D6.2 r.6 A5.2 r.6 | F6.2 r.6 D6.2 r.2 Bb5.4 | G5.2 r.6 Bb5.2 r.6 | C#6.2 r.2 E6.2 r.2 A5.8 | F5.4 E5.4 D5.4 A5.4 | F5.8 D5.8 | G5.4 A5.4 Bb5.4 D6.4 | C#6.12 r.4', { e: 1 }),
    P(.125, .04, 'L ' + arpLine(ch, [0, 2], 3, 8)),
    T(.18, 'L ' + bassLine(ch, 'w')),
    N(.1, 'L ' + drumLine('k.........h.....', 8))] };

  ch = 'Cm Cm Ab Ab Fm G Cm G'; // 墓穴・勇者之墓・古戰場: solemn
  S.crypt = { bpm: 70, echo: 0.4, ch: [
    P(.25, .1, 'L C5.8 Eb5.4 G5.4 | F5.6 Eb5.2 D5.8 | C5.8 Eb5.4 Ab5.4 | G5.16 | F5.4 Ab5.4 C6.8 | B5.8 D6.4 G5.4 | Eb5.6 D5.2 C5.8 | B4.8 D5.8', { vib: 1, e: 1 }),
    P(.5, .045, 'L ' + arpLine(ch, [0, 1, 2, 1], 3, 4)),
    T(.2, 'L ' + bassLine(ch, 'w')),
    N(.1, 'L ' + drumLine('k.......t.......', 8))] };

  ch = 'Em F Em F Dm Eb Dm E'; // 幽光沼澤: eerie
  S.swamp = { bpm: 96, echo: 0.3, ch: [
    P(.125, .1, 'L E5.4 G5.2 F#5.2 E5.8 | F5.4 A5.2 G5.2 F5.8 | B5.6 A#5.2 B5.8 | C6.6 B5.2 A5.8 | D5.4 F5.4 A5.6 G#5.2 | G5.6 F5.2 Eb5.8 | D5.4 F5.4 A5.4 C6.4 | B5.4 G#5.4 E5.8', { vib: 1.5, e: 1 }),
    P(.25, .045, 'L ' + arpLine(ch, [0, 2, 1, 2], 4, 2)),
    T(.18, 'L ' + bassLine(ch, 'h')),
    N(.14, 'L ' + drumLine('k..h..k.....h...', 8))] };

  ch = 'Am E Am E F C Dm E'; // 曙光鐘塔: clockwork
  S.tower = { bpm: 132, ch: [
    P(.25, .11, 'L A5.2 r.2 E5.2 r.2 A5.2 r.2 C6.2 B5.2 | G#5.2 r.2 E5.2 r.2 B5.4 G#5.4 | A5.2 r.2 C6.2 r.2 E6.2 r.2 D6.2 C6.2 | B5.8 E5.8 | F5.2 A5.2 C6.2 F6.2 E6.4 C6.4 | G5.2 C6.2 E6.2 G6.2 F6.4 E6.4 | D6.2 C6.2 A5.2 F5.2 D5.4 F5.4 | E5.4 G#5.4 B5.4 D6.4'),
    P(.125, .04, 'L ' + arpLine(ch, [0, 1, 2, 1], 4, 1)),
    T(.2, 'L ' + bassLine(ch, 'q')),
    N(.2, 'L ' + drumLine('k.h.o.h.k.h.o.h.', 8))] };

  ch = 'Bm G D A Bm G Em F#'; // 冰晶洞窟: crystal
  S.ice = { bpm: 80, echo: 0.38, ch: [
    P(.125, .09, 'L F#5.8 B5.4 D6.4 | D6.6 C#6.2 B5.8 | A5.8 F#5.8 | E5.6 F#5.2 A5.8 | B5.4 D6.4 F#6.8 | G6.6 F#6.2 D6.8 | E6.4 D6.4 B5.4 G5.4 | A#5.12 r.4', { vib: 1, e: 1 }),
    Q(.06, 'L ' + arpLine(ch, [0, 1, 2, 3, 4, 3, 2, 1], 5, 2), { e: 1 }),
    T(.16, 'L ' + bassLine(ch, 'w'))] };

  ch = 'Gm Gm Eb D Gm Gm Cm D Eb F D Gm Cm D Gm D'; // 黯滅要塞: dark march
  S.fortress = { bpm: 108, heavy: 1, ch: [
    P(.5, .11, 'L G4.4 G4.2 G4.2 Bb4.4 D5.4 | G5.6 F5.2 D5.8 | Eb5.4 Eb5.2 Eb5.2 G5.4 Bb5.4 | A5.12 F#5.4 | G5.4 G5.2 G5.2 Bb5.4 D6.4 | G6.6 F6.2 D6.8 | Eb6.6 D6.2 C6.4 G5.4 | F#5.12 r.4 | G5.6 Bb5.2 Eb6.8 | F6.6 Eb6.2 C6.8 | D6.4 C6.4 A5.4 F#5.4 | G5.12 r.4 | C6.4 Eb6.4 G6.6 F6.2 | F#6.4 A6.4 D6.8 | Bb5.4 A5.4 G5.4 Bb5.4 | A5.8 F#5.4 D5.4'),
    P(.25, .05, 'L ' + arpLine(ch, [0, 2, 0, 2], 3, 2)),
    T(.22, 'L ' + bassLine(ch, 'e8')),
    N(.3, 'L ' + drumLine('k...s...k.k.s.ss', 16))] };

  ch = 'Cm Db Cm Db Bbm C Bbm C'; // 異界迴廊: strange
  S.rift = { bpm: 100, echo: 0.3, ch: [
    SAW(.045, 'L C5.2 G5.2 Eb5.2 C6.2 G5.8 | Db5.2 Ab5.2 F5.2 Db6.2 Ab5.8 | G5.4 Eb6.4 D6.8 | C6.4 Ab5.4 F5.8 | Bb4.2 F5.2 Db5.2 Bb5.2 F5.8 | C5.2 G5.2 E5.2 C6.2 G5.8 | F5.4 Db6.4 C6.8 | B5.4 G5.4 E5.8'),
    P(.25, .04, 'L ' + arpLine(ch, [0, 1, 2, 3, 2, 1], 4, 1), { e: 1 }),
    T(.2, 'L ' + bassLine(ch, 'h')),
    N(.16, 'L ' + drumLine('k.....k...h.k...', 8))] };

  ch = 'C Am F G C Am Dm G'; // 旅店: lullaby
  S.inn = { bpm: 76, echo: 0.3, ch: [
    T(.15, 'L E5.6 D5.2 C5.8 | E5.4 A5.4 G5.8 | F5.6 E5.2 D5.4 C5.4 | D5.12 r.4 | E5.6 G5.2 C6.8 | B5.4 A5.4 E5.8 | F5.4 A5.4 D5.4 F5.4 | D5.8 B4.8', { vib: 1 }),
    Q(.07, 'L ' + arpLine(ch, [0, 1, 2, 1], 4, 4), { e: 1 }),
    T(.13, 'L ' + bassLine(ch, 'w'))] };

  ch = 'Cm Cm Ab Bb Cm Cm Ab G Fm Fm Cm Cm Ab Bb G G'; // 第二章一般戰鬥
  { const bass = 'C2.2 r.2 C2.2 r.2 C2.2 r.2 Bb1.2 B1.2 L ' + bassLine(ch, 'e8');
    S.battle2 = { bpm: 172, heavy: 1, ch: [
      P(.5, .12, 'C5.2 r.2 C5.2 r.2 C5.2 r.2 Bb4.2 B4.2 L C5.2 Eb5.2 G5.2 C6.2 Eb6.4 D6.4 | C6.2 G5.2 Eb5.2 G5.2 C6.8 | Ab5.4 C6.4 Eb6.6 C6.2 | D6.4 Bb5.4 F5.4 D6.4 | G6.4 F6.2 Eb6.2 D6.4 C6.4 | Eb6.2 D6.2 C6.2 Bb5.2 C6.8 | Ab5.2 C6.2 Eb6.2 Ab6.2 G6.4 Eb6.4 | D6.8 B5.4 G5.4 | F5.4 Ab5.4 C6.6 Bb5.2 | Ab5.4 G5.4 F5.8 | G5.4 C6.4 Eb6.6 D6.2 | C6.12 r.4 | Eb6.4 C6.4 Ab5.4 C6.4 | F6.4 D6.4 Bb5.4 D6.4 | G6.4 F6.4 D6.4 B5.4 | G5.2 B5.2 D6.2 F6.2 G6.8'),
      P(.25, .05, 'r.16 L ' + arpLine(ch, [0, 1, 2, 1], 4, 1)),
      T(.24, bass), SAW(.035, bass),
      N(.38, drumLine('k.k.k.k.s.s.ssss', 1) + ' L ' + drumLine('k.hsk.hsk.hsk.hs', 16))] }; }

  ch = 'Fm Db Eb C Fm Db Bbm C Db Eb Fm Fm Bbm C Fm C'; // 最終決戰・暗影將軍
  { const bass = 'F2.4 r.4 F2.4 r.4 | F2.2 F2 F2 F2 E2.2 E2 E2 E2 L ' + bassLine(ch, 'e8');
    S.final = { bpm: 184, heavy: 1, ch: [
      P(.5, .12, 'F4.4 r.4 F4.4 r.4 | F4.2 Ab4 C5 F5 Ab5 C6 E6 F6 L F5.4 Ab5.4 C6.6 Bb5.2 | Ab5.4 F5.4 Db6.8 | Eb6.4 Db6.2 C6.2 Bb5.4 G5.4 | E6.8 C6.4 G5.4 | F6.6 Eb6.2 C6.4 Ab5.4 | Db6.4 F6.4 Ab6.8 | Bb6.4 Ab6.2 F6.2 Db6.4 Bb5.4 | C6.4 E6.4 G6.4 Bb6.4 | Ab6.6 F6.2 Db6.8 | G6.6 Eb6.2 Bb5.8 | C6.4 F6.4 Ab6.4 G6.4 | F6.12 r.4 | Db6.4 F6.4 Bb6.6 Ab6.2 | G6.4 E6.4 C6.4 G5.4 | Ab5.4 C6.4 F6.4 Ab6.4 | G6.2 F6.2 E6.2 D6.2 C6.8'),
      P(.25, .055, 'r.16 r.16 L ' + arpLine(ch, [0, 2, 1, 2, 0, 2, 3, 2], 4, 1)),
      T(.26, bass), SAW(.04, bass),
      N(.42, drumLine('k...k...k...k...', 1) + ' ' + drumLine('k.k.k.k.s.s.ssss', 1) + ' L ' + drumLine('c.hsk.hsk.hsksss', 1) + ' ' + drumLine('k.hsk.hsk.hsk.hs', 15))] }; }

  // the old battle / elite / boss tracks: heavier drums and a gritty bass layer
  for (const k of ['battle', 'elite', 'boss']) { const d = S[k]; d.heavy = 1; const b = d.ch.find(c => c.k === 't'); if (b) d.ch.push(SAW(.035, b.notes)); }

  const AREA = { forest: 'forest', lake: 'lake', jadeCreek: 'lake', starShrine: 'star', goldPlains: 'plains', windHills: 'plains', maplePass: 'plains', canyon: 'canyon',
    sewer: 'cave', mine: 'cave', capSewer: 'cave', catacomb: 'crypt', heroTomb: 'crypt', oldField: 'crypt', swamp: 'swamp', clockTower1: 'tower', clockTower2: 'tower',
    iceCave: 'ice', lavaTunnel: 'volcano', duskFort1: 'fortress', duskFort2: 'fortress', rift: 'rift', inn: 'inn', capInn: 'inn', frostInn: 'inn' };
  for (const k in AREA) if (MAPS[k]) MAPS[k].music = AREA[k];
})();
// battle music by area: 第二章 areas get their own battle theme, 暗影將軍 gets the final one
const BATTLE2_MAPS = new Set(['northRoad', 'maplePass', 'oldField', 'heroTomb', 'capSewer', 'goldPlains', 'clockTower1', 'clockTower2', 'frostField', 'iceCave', 'emberPass', 'lavaTunnel', 'duskFort1', 'duskFort2', 'starShrine', 'rift']);
const FINAL_SONG = { shadowGeneral: 'final' };
let __battleCfg = null;
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { __battleCfg = cfg; return yield* _bs.call(this, cfg, ...a); }; }
{ const _pl = Sound.play; Sound.play = function (name) {
    if ((name === 'battle' || name === 'boss') && __battleCfg) { const c = __battleCfg; __battleCfg = null;
      if (name === 'boss' && FINAL_SONG[c.sp]) name = FINAL_SONG[c.sp];
      else if (name === 'battle' && Game.st && BATTLE2_MAPS.has(Game.st.map)) name = 'battle2'; }
    return _pl.call(this, name); }; }
