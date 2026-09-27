"""Combined preview GIF of several animated strips: python3 tools/anim_sheet_gif.py out.gif key ..."""
import sys, json
from PIL import Image
out, keys = sys.argv[1], sys.argv[2:]
S = [(Image.open(f'art/battle/pxanim/{k}.png'), json.load(open(f'art/battle/pxanim/{k}.json'))) for k in keys]
seq = lambda m: m['frames']['idle'] * 2 + m['frames'].get('attack', []) + m['frames'].get('hurt', []) * 2 + m['frames']['idle'][:2]
L = max(len(seq(m)) for _, m in S); W = sum(m['w'] + 6 for _, m in S); H = max(m['h'] for _, m in S) + 6
frames = []
for t in range(L):
    c = Image.new('RGBA', (W, H), (70, 110, 70, 255)); x = 0
    for im, m in S:
        q = seq(m); f = q[t % len(q)]; c.alpha_composite(im.crop((f * m['w'], 0, (f + 1) * m['w'], m['h'])), (x + 3, H - 3 - m['h'])); x += m['w'] + 6
    frames.append(c.convert('RGB').resize((W * 3, H * 3), Image.NEAREST))
frames[0].save(out, save_all=True, append_images=frames[1:], duration=180, loop=0)
