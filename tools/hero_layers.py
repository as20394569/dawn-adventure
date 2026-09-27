"""Battle hero chibi paper doll (Codex task H): art/battle/hero/**/<layer>_<pose>.png -> art/hero/px/<layer>.png strips + meta.json
Every layer is a 7-pose strip (40x48 per pose unless the manifest says otherwise). Key colours are kept as drawn; the game
recolours them with the equipped item's palette (07r_herochibi.js)."""
import os, glob, re, json, sys
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'art', 'battle', 'hero'); OUT = os.path.join(ROOT, 'art', 'hero', 'px')
POSES = ['idle1', 'idle2', 'attack1', 'attack2', 'cast1', 'hurt1', 'guard1']
LAYERS = {'base': ['base'], 'head': ['cap', 'helm', 'hood'], 'deco': ['feather', 'horns'], 'body': ['tunic', 'mail', 'plate', 'robe', 'cloak'], 'feet': ['boots'], 'weapon': ['sword', 'dagger', 'axe', 'staff', 'tome']}
files = [f for f in glob.glob(os.path.join(SRC, '**', '*.png'), recursive=True) if 'preview' not in os.path.basename(f)]
man = {}
mp = os.path.join(SRC, 'manifest.json')
if os.path.exists(mp): man = json.load(open(mp, encoding='utf-8'))
def find(group, name, pose):
    pat = re.compile(r'(^|[_/\\-])' + re.escape(name) + r'[_-]' + pose + r'\.png$')
    c = [f for f in files if pat.search(f.replace(SRC, ''))]
    c.sort(key=lambda f: (group not in f.replace(SRC, ''), len(f)))
    return c[0] if c else None
os.makedirs(OUT, exist_ok=True)
meta = {'poses': POSES, 'layers': {}, 'manifest': man}
cw = ch = None
for group, names in LAYERS.items():
    for name in names:
        fr = [find(group, name, p) for p in POSES]
        if not any(fr): continue
        ims = [Image.open(f).convert('RGBA') if f else None for f in fr]
        w = max(i.width for i in ims if i); h = max(i.height for i in ims if i); cw, ch = w, h
        strip = Image.new('RGBA', (w * len(POSES), h))
        for k, im in enumerate(ims):
            if im: strip.alpha_composite(im, (k * w, 0))
        strip.save(os.path.join(OUT, name + '.png'))
        meta['layers'][name] = {'group': group, 'w': w, 'h': h, 'missing': [POSES[k] for k, f in enumerate(fr) if not f]}
meta['w'], meta['h'] = cw, ch
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), ensure_ascii=False)
print('hero layers', {k: v['group'] for k, v in meta['layers'].items()}, 'size', cw, ch, 'missing', {k: v['missing'] for k, v in meta['layers'].items() if v['missing']})
