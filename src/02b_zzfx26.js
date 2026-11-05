/* ===================== v12.156 戰鬥音效改用 ZzFX 重做（8-bit 晶片音色） =====================
   ZzFX - Zuper Zmall Zound Zynth v1.4.0 — MIT License — Copyright (c) 2019 Frank Force
   https://github.com/KilledByAPixel/ZzFX
   下面的 zzG26 改寫自 ZzFXMicro：只產生取樣，不自己開 AudioContext，聲音送進遊戲原本的音效匯流排（跟著音效開關、壓縮器）。
   戰鬥用到的音效名稱照舊（hit、blade、fire…），改成 ZzFX 的參數；表裡沒有的（選單、走路、天氣）維持原本的聲音。 */
function zzG26(volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0, release = .1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0, pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0, bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0, filter = 0) {
  const sampleRate = 44100, PI2 = Math.PI * 2, abs = Math.abs, sign = v => v < 0 ? -1 : 1;
  let startSlide = slide *= 500 * PI2 / sampleRate / sampleRate,
    startFrequency = frequency *= (1 + randomness * 2 * Math.random() - randomness) * PI2 / sampleRate,
    modOffset = 0, repeat = 0, crush = 0, jump = 1, length, b, t = 0, i = 0, s = 0, f;
  const quality = 2, w = PI2 * abs(filter) * 2 / sampleRate, cos = Math.cos(w), alpha = Math.sin(w) / 2 / quality,
    a0 = 1 + alpha, a1 = -2 * cos / a0, a2 = (1 - alpha) / a0, b0 = (1 + sign(filter) * cos) / 2 / a0, b1 = -(sign(filter) + cos) / a0, b2 = b0;
  let x2 = 0, x1 = 0, y2 = 0, y1 = 0;
  attack = attack * sampleRate || 9; decay *= sampleRate; sustain *= sampleRate; release *= sampleRate; delay *= sampleRate;
  deltaSlide *= 500 * PI2 / sampleRate ** 3; modulation *= PI2 / sampleRate; pitchJump *= PI2 / sampleRate; pitchJumpTime *= sampleRate; repeatTime = repeatTime * sampleRate | 0;
  length = attack + decay + sustain + release + delay | 0; b = new Float32Array(length);
  for (; i < length; b[i++] = s * volume) {
    if (!(++crush % (bitCrush * 100 | 0))) {
      s = shape ? shape > 1 ? shape > 2 ? shape > 3 ? shape > 4 ? (t / PI2 % 1 < shapeCurve / 2) * 2 - 1 : Math.sin(t ** 3) : Math.max(Math.min(Math.tan(t), 1), -1) : 1 - (2 * t / PI2 % 2 + 2) % 2 : 1 - 4 * abs(Math.round(t / PI2) - t / PI2) : Math.sin(t);
      s = (repeatTime ? 1 - tremolo + tremolo * Math.sin(PI2 * i / repeatTime) : 1) * (shape > 4 ? s : sign(s) * abs(s) ** shapeCurve) *
        (i < attack ? i / attack : i < attack + decay ? 1 - ((i - attack) / decay) * (1 - sustainVolume) : i < attack + decay + sustain ? sustainVolume : i < length - delay ? (length - i - delay) / release * sustainVolume : 0);
      s = delay ? s / 2 + (delay > i ? 0 : (i < length - delay ? 1 : (length - i) / delay) * b[i - delay | 0] / 2 / volume) : s;
      if (filter) s = y1 = b2 * x2 + b1 * (x2 = x1) + b0 * (x1 = s) - a2 * y2 - a1 * (y2 = y1);
    }
    f = (frequency += slide += deltaSlide) * Math.cos(modulation * modOffset++);
    t += f + f * noise * (i * i * PI2 % 2 - 1);
    if (jump && ++jump > pitchJumpTime) { frequency += pitchJump; startFrequency += pitchJump; jump = 0; }
    if (repeatTime && !(++repeat % repeatTime)) { frequency = startFrequency; slide = startSlide; jump ||= 1; }
  }
  return b;
}

const ZZ26 = (() => {
  // 小工具：f 是 Hz，d 是秒；回傳 ZzFX 參數陣列
  const zS = (f0, f1, d) => (f1 - f0) / d / 500;                                                         // 在 d 秒內從 f0 滑到 f1
  const B = (f, d, v, duty = 1, f1 = f, r = 0) => [v, r, f, .002, d * .5, d * .5, 5, duty, zS(f, f1, d)];  // 方波「嗶」（duty 1＝50%、.5＝25%、.25＝12.5%）
  const Tr = (f, d, v, f1 = f) => [v, 0, f, .002, d * .4, d * .6, 1, 1, zS(f, f1, d)];                     // 三角波
  const Th = (f0, f1, d, v) => [v, 0, f0, 0, d * .1, d * .9, 0, 1, zS(f0, f1, d)];                          // 低音「咚」
  const N = (d, v, cr, flt = 0, att = 0) => [v, 0, 400, att, d * .08, Math.max(.005, d * .92 - att), 4, 1, 0, 0, 0, 0, 0, 0, 0, cr, 0, 1, 0, 0, flt]; // 噪音；cr 越大越低沉粗糙，flt 正＝高通、負＝低通
  const W = (f0, f1, d, v, att = .3, flt = 0, nz = 3, r = .08) => [v, r, f0, d * att, 0, d * (1 - att), 0, 1, zS(f0, f1, d), 0, 0, 0, 0, nz, 0, 0, 0, 1, 0, 0, flt]; // 「咻」：音色從 f0 掃到 f1
  const R = (t, f, d, v) => [[t, [v, 0, f, 0, 0, d, 1, 1]], [t, [v * .5, 0, f * 2.76, 0, 0, d * .6, 0, 1]]]; // 金屬「鏘」（兩個泛音）
  const snap = (t, v) => [t, N(.025, v, .02, 2500)];                                                      // 打中瞬間的「啪」
  const S = {
    // ── 一般打擊 ──
    hit: { L: [snap(0, .6), [0, N(.16, .9, .15, -3200)], [0, Th(150, 45, .2, 1.4)]], d: [.6, .08] },
    hitSuper: { L: [snap(0, .8), [0, N(.3, 1.1, .2, -6000)], [0, Th(200, 32, .38, 1.8)], [0, B(1100, .14, .3, 1, 240)], [.08, N(.6, .4, .6, -900)]], d: [.35, .2] },
    hitWeak: { L: [[0, N(.1, .5, .3, -1000)], [0, Th(110, 60, .1, .6)]] },
    crit: { L: [...R(.01, 1900, .45, .35), [.01, B(2637, .12, .18, .5)], [0, N(.12, .5, .03, 3000)], [.03, Th(90, 30, .3, 1)]], d: [.3, .25] },
    heavy: { L: [[.02, N(.5, 1.1, .5, -1800)], [.02, Th(120, 26, .55, 1.7)]], d: [.3, .3] },
    foeDown: { L: [[0, B(700, .5, .3, 1, 60)], [0, N(.6, 1, .4, -2400)], [0, Th(130, 30, .5, 1.4)]] },
    bossDown: { L: [...[0, 1, 2, 3].flatMap(i => [[i * .22, N(.5, 1.1, .4, -3000)], [i * .22, Th(150, 28, .5, 1.6)]]), [.9, N(1.6, .8, .8, -600, .1)], [0, B(900, 1.2, .25, 1, 50)]], d: [.2, 1.4] },
    shield: { L: [...R(0, 1300, .3, .3), snap(0, .5), [0, Th(120, 60, .12, .7)]] },
    statUp: { L: [0, 1, 2, 3].map(i => [i * .06, B(520 * 1.26 ** i, .06, .35, .5, 560 * 1.26 ** i)]) },
    statDown: { L: [0, 1, 2, 3].map(i => [i * .06, B(1000 / 1.26 ** i, .06, .35, .5, 950 / 1.26 ** i)]) },
    heal: { L: [0, 1, 2, 3, 4].map(i => [i * .05, Tr(880 * 1.19 ** i, .07, .6, 900 * 1.19 ** i)]) },
    faint: { L: [[0, B(900, .7, .35, 1, 60)]] },
    run: { L: [0, 1, 2].map(i => [i * .09, N(.05, .4, .08, 1500)]) },
    poison: { L: [0, 1, 2].map(i => [i * .07, B(300 + i * 60, .08, .4, .5, 200)]) },
    encounter: { L: [...[0, 1, 2, 3, 4, 5].map(i => [i * .05, B(400 + i * 180, .05, .25, .5, 500 + i * 180)]), [.04, W(800, 6000, .3, .6, .3, 600)], snap(.32, .7), [.32, Th(160, 40, .3, 1.4)]] },
    slash: { L: [[0, W(700, 5200, .16, 1, .3, 600)], snap(.1, .45)] },
    // ── 劍：揮刀「咻——唰」、連斬短版、收尾大刀；打中是脆的切裂聲 ──
    blade: { L: [[0, W(1100, 5600, .14, 1.3, .35, 800, 3, .12)], [.03, W(5000, 9000, .09, .35, .3, 4000)], snap(.085, .4), [.085, N(.08, .9, .04, 1500)]] },
    bladeQ: { L: [[0, W(1600, 6400, .09, 1, .28, 900, 3, .15)], snap(.05, .3), [.05, N(.06, .7, .04, 1800)]] },
    bladeBig: { L: [[0, W(600, 4800, .26, 1.4, .35, 500)], [.03, W(4000, 9000, .2, .35, .35, 4000)], snap(.14, .6), [.14, N(.2, 1, .06, 1200)], [.14, Th(150, 45, .18, .9)]], d: [.5, .2] },
    bladeHit: { L: [snap(0, .6), [0, N(.09, .6, .03, 1300)], [.01, N(.12, .5, .15, -2200)], [0, Th(170, 60, .12, .9)]], d: [.6, .08] },
    bladeHitSuper: { L: [snap(0, .8), [0, N(.14, .8, .03, 1100)], [.01, N(.26, .8, .2, -4200)], [0, Th(200, 34, .32, 1.6)]], d: [.35, .2] },
    bladeHitWeak: { L: [[0, N(.08, .4, .04, 1000)], [0, Th(110, 60, .08, .5)]] },
    // ── 長槍：細長尖的「咻」＋扎進去的「嚓」 ──
    spThrust: { L: [[0, W(900, 4400, .12, 1.2, .3, 900, 1.5, .1)], [.06, W(5200, 8800, .06, .35, .3, 4000, 1.5)], snap(.11, .4)] },
    spThrustQ: { L: [[0, W(1300, 5400, .08, .9, .25, 1000, 1.5, .12)], snap(.07, .3)] },
    spThrustBig: { L: [[0, W(600, 4200, .22, 1.3, .3, 600, 1.6)], [.08, W(4200, 9000, .12, .4, .4, 4000, 1.5)], snap(.2, .6), [.2, Th(140, 50, .16, .8)]] },
    spHit: { L: [snap(0, .65), [0, N(.06, .6, .02, 2400)], [.01, N(.1, .4, .12, -2600)], [0, Th(190, 80, .08, .7)]], d: [.6, .08] },
    spHitSuper: { L: [snap(0, .85), [0, N(.1, .8, .02, 1800)], [.01, N(.22, .8, .15, -4000)], [0, Th(220, 40, .28, 1.5)]], d: [.35, .2] },
    spHitWeak: { L: [[0, N(.05, .4, .02, 2000)], [0, Th(140, 80, .06, .4)]] },
    // ── 短刀・雙刀：短短的「噗嗤」 ──
    dgHit: { L: [snap(0, .5), [0, N(.07, .55, .04, 1400)], [.02, N(.05, .35, .15, -1400)], [0, Th(160, 90, .06, .6)]], d: [.7, .05] },
    dgHitSuper: { L: [snap(0, .7), [0, N(.12, .7, .03, 1200)], [.02, N(.16, .55, .2, -2200)], [0, Th(180, 50, .18, 1.2)]], d: [.4, .15] },
    // ── 斧：又低又重的「呼——」，打中「轟咔」 ──
    axSwing: { L: [[0, W(240, 1400, .3, 1.3, .4, 0, 3, .1)], [.1, Th(90, 50, .2, .45)]] },
    axHit: { L: [snap(0, .6), [0, N(.3, 1.1, .4, -1600)], [0, Th(110, 30, .4, 1.8)], [.02, N(.12, .5, .15, 900)]], d: [.45, .15] },
    axHitSuper: { L: [snap(0, .8), [0, N(.5, 1.2, .5, -2000)], [0, Th(100, 24, .6, 2)], ...[0, 1, 2].map(i => [.05 + i * .06, N(.08, .45, .12, 1400)])], d: [.3, .3] },
    axHitWeak: { L: [[0, N(.14, .6, .35, -900)], [0, Th(100, 50, .16, .9)]] },
    // ── 拳套：很短的「咻」，打中紮實的「啪碰」 ──
    fsSwing: { L: [[0, W(700, 2600, .06, 1, .25, 500, 3, .1)]] },
    fsHit: { L: [snap(0, .7), [0, N(.05, .55, .08, 900)], [0, Th(180, 55, .1, 1.6)], [.005, N(.08, .4, .2, -1200)]], d: [.6, .06] },
    fsHitSuper: { L: [snap(0, .9), [0, N(.08, .75, .06, 700)], [0, Th(200, 36, .24, 2)], [.02, N(.3, .6, .4, -1600)]], d: [.35, .18] },
    fsHitWeak: { L: [snap(0, .4), [0, Th(150, 70, .07, .8)]] },
    fsQi: { L: [[0, Tr(220, .16, .6, 880)], [0, W(400, 3000, .2, 1, .25, 300)]] },
    // ── 法杖：往上的晶瑩音、魔力彈「咻嗚」、打中「嗡——啵」 ──
    stCast: { L: [...[0, 1, 2, 3].flatMap(i => R(i * .04, 880 * 1.26 ** i, .25, .2)), [0, W(2000, 6000, .3, .5, .33, 1500, 2)]] },
    stBolt: { L: [[0, Tr(1600, .12, .5, 600)], [0, W(2400, 900, .12, .9, .15, 500, 2)]] },
    stHit: { L: [...R(0, 660, .3, .35), [0, N(.16, .6, .06, 600)], [0, Th(160, 60, .14, 1)]], d: [.6, .08] },
    stHitSuper: { L: [...R(0, 520, .5, .45), ...R(.02, 780, .4, .25), [0, N(.4, .8, .08, 300)], [0, Th(170, 34, .32, 1.6)]], d: [.35, .2] },
    stHitWeak: { L: [...R(0, 880, .15, .2), [0, N(.08, .4, .05, 900)]] },
    // ── 盾：厚的「呼」、金屬「鏘咚」 ──
    shSwing: { L: [[0, W(300, 1600, .2, 1.2, .3, 0)]] },
    shHit: { L: [...R(0, 620, .3, .4), ...R(0, 1480, .2, .2), [0, N(.1, .6, .04, 800)], [0, Th(140, 45, .2, 1.5)]], d: [.5, .1] },
    shHitSuper: { L: [...R(0, 520, .5, .45), ...R(0, 1300, .35, .25), [0, N(.3, .8, .3, -3000)], [0, Th(130, 30, .4, 1.9)]], d: [.35, .22] },
    shHitWeak: { L: [...R(0, 700, .18, .2), [0, Th(120, 60, .1, .8)]] },
    shGuard: { L: [...R(0, 900, .25, .3), [0, N(.08, .45, .03, 1500)]] },
    // ── 移動 ──
    dashStep: { L: [[0, W(500, 2600, .14, .9, .2, 400)], [.02, N(.04, .15, .02, 3000)]] },
    leapLand: { L: [[0, N(.14, .7, .3, -900)], [0, Th(120, 40, .2, 1.2)]] },
    blink: { L: [[0, W(3000, 900, .1, .8, .1, 600, 2)]] },
    // ── 元素・技能 ──
    fire: { L: [[0, W(250, 1800, .5, 1, .15, 0, 4)], [0, N(.45, .5, .25, -2200, .04)], [0, Th(95, 40, .35, .8)], ...[.07, .13, .2, .26, .33, .41].map(t => [t, N(.02, .35, .02, 4000)])] },
    water: { L: [...[0, 1, 2, 3].map(i => [i * .06, Tr(500 + i * 90, .06, .6, 1200 + i * 90)]), [.1, N(.2, .3, .05, -1200)]] },
    thunder: { L: [[0, N(.05, .85, .02, 2200)], [.01, N(.12, .6, .06, 600)], [.04, N(1.5, .85, .9, -900, .05)], [.4, N(1.1, .5, 1.2, -420, .15)], [.03, Th(62, 30, .7, .9)]], d: [.45, .4] },
    mana: { L: [[0, Tr(520, .22, .4, 1500)], [.03, [.2, 0, 780, .002, .08, .14, 0, 1, zS(780, 2250, .22)]], ...[0, 1, 2].map(i => [.12 + i * .045, B(2400 + i * 420, .05, .14, .5, 2600 + i * 420)])] },
    arcane: { L: [[0, N(.14, .55, .05, 700)], ...R(0, 1180, .22, .25), [0, Th(140, 55, .16, .9)]] },
    leaf: { L: [0, 1, 2, 3, 4].map(i => [i * .05, N(.05, .3, .02, 5000)]) },
    rock: { L: [0, 1, 2].flatMap(i => [[i * .11, N(.2, .9, .3, -1000)], [i * .11, Th(130, 40, .18, 1.1)]]) },
    wind: { L: [[0, W(500, 3000, .5, .8, .4, 300, 3)]] },
    buzz: { L: [[0, [.3, 0, 180, .01, .3, .09, 2, 1, zS(180, 200, .4)]]] },
    quake: { L: [[0, N(1.1, 1, .9, -500)], [0, Th(60, 26, 1, 1.7)], [0, Tr(55, .9, .7, 28)]], d: [.4, .6] },
    charge: { L: [[0, [.25, 0, 100, .05, .55, .2, 5, .25, zS(100, 900, .8)]], [0, [.12, 0, 55, .05, .55, .2, 2, 1, zS(55, 110, .8)]], [0, W(300, 3000, .8, .35, .8, 0, 3)]] },
  };
  const K = .45; // 整體音量（跟原本的音效差不多大聲）
  function play(name) {
    const def = S[name], ac = Sound.ac, bus = Sound.sfxBus; if (!def || !ac || !bus) return false;
    const T = ac.currentTime + .005;
    for (const [t, p] of def.L) {
      const s = zzG26(...p); if (!s.length) continue;
      const buf = ac.createBuffer(1, s.length, 44100); buf.getChannelData(0).set(s);
      const src = ac.createBufferSource(), g = ac.createGain(); g.gain.value = K; src.buffer = buf; src.connect(g); g.connect(bus); src.start(T + t);
    }
    if (def.d && Sound.duck) Sound.duck(def.d[0], def.d[1]);
    return true;
  }
  return { on: true, S, play };
})();
{ const _sf = Sound.sfx; Sound.sfx = function (n, ...a) { if (ZZ26.on && ZZ26.S[n]) { if (!Sound.ac || !Game.settings.sfx) return; if (ZZ26.play(n)) return; } return _sf.call(this, n, ...a); }; }
