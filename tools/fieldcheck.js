// Field (walking) appearance lock: node tools/play.js tools/fieldcheck.js
// The battle-art task must NOT change anything seen while walking around. This check fingerprints every
// sprite the field uses and compares it with tools/field_golden.json (made from the original game):
//   - hero walking frames (4 directions x 4 frames) for every class and several equipment sets
//   - every NPC look (all frames)
//   - every monster's field mini sprite (sizes 16 / 24 / 36)
// It also lists which original files were modified (git) and fails if field files were touched.
// Any difference => FIELDCHECK: FAIL. Never regenerate the golden file to make it pass.
// (Only the project owner may run it with --update, and only when the field art is meant to change.)
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
module.exports = async (g) => {
  const cur = await g.ev(() => {
    const G = __game, out = {};
    const hash = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; } return c.width + 'x' + c.height + ':' + h.toString(16); };
    const frames = f => ['down', 'up', 'left', 'right'].map(d => f[d].map(hash).join(',')).join('|');
    // hero: each class start + each class with a sample of gear
    for (const k in CLASS_START) {
      G.newGameState('測'); applyStartClass(k); out['hero/' + k] = frames(heroFramesLook(heroLookOf(G.Game.st)));
    }
    const kinds = {}; for (const id in GEAR) { const s = GEAR[id].slot; (kinds[s] = kinds[s] || []).push(id); }
    for (const s in kinds) kinds[s].slice(0, 12).forEach(id => { G.newGameState('測'); const st = G.Game.st; try { const sl = s === 'acc' ? 'acc1' : s; st.equip[sl] = makeGear(id, 1, 1).u; out['hero/gear/' + id] = frames(heroFramesLook(heroLookOf(st))); } catch (e) { out['hero/gear/' + id] = 'ERR ' + e.message; } });
    for (const look in LOOKS) { const f = npcFrames(look); out['npc/' + look] = Array.isArray(f) ? f.map(hash).join(',') : frames(f); }
    for (const sp in SPECIES) if (ART[sp]) for (const sz of [16, 24, 36]) out['mini/' + sp + '/' + sz] = hash(monsterMini(sp, sz).c);
    return out;
  });
  const file = path.resolve('tools/field_golden.json');
  if (process.argv.includes('--update')) { fs.writeFileSync(file, JSON.stringify(cur, null, 0)); g.log('golden written: ' + Object.keys(cur).length + ' entries'); return; }
  const gold = JSON.parse(fs.readFileSync(file, 'utf8')); const bad = [];
  for (const k in gold) if (cur[k] !== gold[k]) bad.push(k + (cur[k] === undefined ? ' (missing)' : ' (changed)'));
  g.log('field sprites checked: ' + Object.keys(gold).length + ', changed: ' + bad.length); bad.slice(0, 40).forEach(b => g.log('  CHANGED ' + b));
  // which original files were modified since the baseline commit
  let files = []; try { const base = execSync('git rev-list --max-parents=0 HEAD').toString().trim().split('\n').pop(); files = execSync('git diff --name-only --diff-filter=MD ' + base).toString().trim().split('\n').filter(Boolean); } catch (e) { g.log('(git not available, file check skipped)'); }
  const FIELD = /^src\/(0[0-3]_|03_art|04j_paperdoll|06_|08_main)/, TOOLS = /^tools\/(fieldcheck|animcheck|field_golden|play)/;
  const forbidden = files.filter(f => FIELD.test(f) || TOOLS.test(f));
  if (files.length) g.log('modified original files: ' + files.join(', ')); forbidden.forEach(f => g.log('  FORBIDDEN ' + f + ' (field art / check tools must not change)'));
  g.log(bad.length || forbidden.length ? 'FIELDCHECK: FAIL' : 'FIELDCHECK: PASS');
};
