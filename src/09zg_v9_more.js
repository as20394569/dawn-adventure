/* ===================== v9.0 (cont.) early gear sets, 莉婭 at the fortress ===================== */
// sets you can already wear in the first acts (so the system shows up early); hunter pieces move from 灰狼 to 獵人
{ const wolf = GEAR_SETS.find(S => S.n === '灰狼'); if (wolf) for (const k of ['hunterCap', 'hunterLeather']) wolf.keys.delete(k); if (wolf && GEAR.wolfMantle) wolf.keys.add('wolfMantle');
  for (const [n, keys, b2, b3, b4] of [
    ['旅人', ['clothCap', 'leather', 'travelBoots', 'qTravelCharm', 'swiftFeather'], [['hpP', 5]], [['speP', 5]], [['eva', 3]]],
    ['獵人', ['hunterCap', 'hunterLeather', 'hunterBoots', 'hunterOath', 'qHunterEye', 'huntKnife'], [['crit', 3]], [['speP', 5]], [['bigUp', 8]]],
    ['騎士團', ['knightHelm', 'chainMail', 'knightGreaves', 'knightSword'], [['defP', 5]], [['hpP', 5]], [['actUp', 8]]],
    ['古岩遺跡', ['boneHelm', 'stoneMail', 'ruinMail', 'boneSaber', 'ruinStaff', 'ectoLantern', 'ancientGreaves', 'runeMantle'], [['spdP', 5]], [['elemRes', 6]], [['spcUp', 12]]],
    ['銀月湖畔', ['lakeStaff', 'lakeBoots', 'crabMail', 'moonCharm', 'moonPendant', 'reedBoots', 'reedHat'], [['mpP', 8]], [['spaP', 5]], [['mpRegen', 2]]],
  ]) GEAR_SETS.push({ n, keys: new Set(keys.filter(k => GEAR[k] && !setOf(k))), b: { 2: b2, 3: b3, 4: b4 } });
}

/* ---------- 莉婭 waits at the fortress gate (a heal point and her story) ---------- */
MAPS.duskFort1.npcs = MAPS.duskFort1.npcs || [];
MAPS.duskFort1.npcs.push({ id: 'liaFort', x: 12, y: 23, dir: 'left', look: 'knightLia', name: '見習騎士莉婭', show: st => (st.flags.ch2 || 0) >= 7 && (st.flags.ch2 || 0) < 9 }); delete mapCache.duskFort1;
NPC_ROLES.任務.push('liaFort'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.liaFort = '黯滅要塞';
Events.liaFort = function* () {
  const st = Game.st, f = st.flags;
  if (!f.liaFort1) {
    f.liaFort1 = 1;
    yield* sayAll(['莉婭：「……終於追上你了。」', '莉婭：「國王陛下命令我守住這裡——勇者的退路，由我來保護。」', '莉婭：「還有……要塞裡有一個穿著騎士團鎧甲的人。」',
      '莉婭：「五年前在北境失蹤的騎士團長……是我的父親。」', '莉婭：「如果真的是他……拜託你，讓他解脫吧。」']);
  } else yield* say(f.duskCaptain ? '莉婭：「……父親終於可以休息了。謝謝你。」' : '莉婭：「受傷了就回來。我會一直在這裡。」');
  yield* healRitual('莉婭用騎士團的急救包幫你包紮，體力完全恢復了！');
};
STORY_MARKS.liaFort = st => !st.flags.liaFort1 ? '!' : null;
