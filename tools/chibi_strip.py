"""Battle chibis (Q版): art/battle/chibi/<key>_<state><n>.png (Codex, 32×32 or 48×48) -> art/battle/chibipx/<key>.png (+.json)
Falls back to the field walkers art/battle/field/<key>_down1/2.png when no battle set exists yet.
Frames are scaled ×2 with nearest neighbour (same pixel density as the hero's paper doll), padded by 1px."""
import os, glob, re, json
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'battle')
SCALE = 2
BIG = {'golem', 'crystalGolem', 'banditBoss', 'mossGiant', 'boneKnight', 'silverWyrm', 'gatekeeper', 'rockRhino', 'duneWorm', 'hydra'}  # bosses / giants: 32px walkers are shown ×3
ORDER = ['idle', 'attack', 'cast', 'hurt', 'defend', 'rage']
def frames_for(k):
    fr = {}
    for f in glob.glob(os.path.join(ROOT, 'chibi', k + '_*.png')):
        m = re.match(re.escape(k) + r'_([a-z]+)(\d+)\.png$', os.path.basename(f))
        if m and m.group(1) in ORDER: fr.setdefault(m.group(1), []).append((int(m.group(2)), f))
    if 'idle' in fr: return {s: [f for _, f in sorted(v)] for s, v in fr.items()}
    d1, d2 = os.path.join(ROOT, 'field', k + '_down1.png'), os.path.join(ROOT, 'field', k + '_down2.png')
    if os.path.exists(d1) and os.path.exists(d2): return {'idle': [d1, d2], 'attack': [d2, d1, d2], 'hurt': [d1]}
    return None
keys = sorted({re.match(r'(.+?)_[a-z]+\d+\.png$', os.path.basename(f)).group(1) for f in glob.glob(os.path.join(ROOT, 'chibi', '*.png')) + glob.glob(os.path.join(ROOT, 'field', '*_down1.png')) if re.match(r'(.+?)_[a-z]+\d+\.png$', os.path.basename(f))})
os.makedirs(os.path.join(ROOT, 'chibipx'), exist_ok=True)
for k in keys:
    F = frames_for(k)
    if not F: continue
    seq = [(s, f) for s in ORDER if s in F for f in F[s]]
    ims = [Image.open(f).convert('RGBA') for _, f in seq]
    w = max(i.width for i in ims); h = max(i.height for i in ims)
    sc = 3 if k in BIG and w <= 32 else SCALE
    fw, fh = w * sc + 2, h * sc + 2
    strip = Image.new('RGBA', (fw * len(ims), fh))
    for i, im in enumerate(ims):
        big = im.resize((im.width * sc, im.height * sc), Image.NEAREST)
        strip.alpha_composite(big, (i * fw + 1 + (w * sc - big.width) // 2, 1 + h * sc - big.height))
    strip.save(os.path.join(ROOT, 'chibipx', k + '.png'))
    meta = {'w': fw, 'h': fh, 'frames': {}}
    for i, (s, _) in enumerate(seq): meta['frames'].setdefault(s, []).append(i)
    json.dump(meta, open(os.path.join(ROOT, 'chibipx', k + '.json'), 'w'))
    print(k, {s: len(v) for s, v in meta['frames'].items()}, (fw, fh))
