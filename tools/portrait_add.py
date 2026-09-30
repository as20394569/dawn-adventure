"""Add new Codex original portraits (art-work/<task>/<key>_raw.png) to the game: the 288×288 dialogue image
(art/battle/portraits_hd, same crop as portrait_hd.py) and a 32×32 fallback (art/battle/portraits, ≤32 colours) that the
portrait lookup keys on. Usage: python3 tools/portrait_add.py <raw dir> [key …]"""
import sys, os, glob
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from portrait_hd import hd
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def small(im):
    s = im.resize((32, 32), Image.Resampling.LANCZOS); a = np.array(s); a[:, :, 3] = np.where(a[:, :, 3] >= 128, 255, 0); a[a[:, :, 3] == 0] = 0
    m = a[:, :, 3] > 0; rgb = a[:, :, :3][m]
    q = Image.fromarray(rgb.reshape(1, -1, 3)).quantize(colors=32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    a[:, :, :3][m] = np.array(q.convert('RGB')).reshape(-1, 3); return Image.fromarray(a)
if __name__ == '__main__':
    src, keys = sys.argv[1], set(sys.argv[2:])
    for f in sorted(glob.glob(os.path.join(src, '*_raw.png'))):
        k = os.path.basename(f)[:-8]
        if keys and k not in keys: continue
        im = hd(f); im.save(os.path.join(root, 'art', 'battle', 'portraits_hd', k + '.png')); small(im).save(os.path.join(root, 'art', 'battle', 'portraits', k + '.png')); print(k, end=' ')
    print()
