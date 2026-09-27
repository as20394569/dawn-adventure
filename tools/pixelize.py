"""Turn Codex's painted sprites (art/battle/<key>_raw.png) into game pixel art (art/battle/px/<key>.png).
1 sprite pixel = 1 screen pixel in the game. Height targets keep sizes consistent on the battle stage."""
import sys, os
from PIL import Image, ImageFilter
import numpy as np
ROOT = os.path.join(os.path.dirname(__file__), '..', 'art', 'battle')
HEIGHT = {'hero': 72, 'wolf': 74, 'bandit': 86}
DEFAULT_H, BIG_H = 78, 90
def pixelize(key, h=None, colors=40):
    im = Image.open(os.path.join(ROOT, key + '_raw.png')).convert('RGBA')
    a = np.array(im)[:, :, 3]; ys, xs = np.nonzero(a > 40); im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    h = h or HEIGHT.get(key, DEFAULT_H); w = max(1, round(im.width * h / im.height))
    # premultiplied downscale so transparent edges do not bleed dark
    arr = np.array(im).astype(np.float32); al = arr[:, :, 3:4] / 255; arr[:, :, :3] *= al
    pm = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA').resize((w, h), Image.BOX)
    out = np.array(pm).astype(np.float32); A = out[:, :, 3:4] / 255
    rgb = np.where(A > 0.01, out[:, :, :3] / np.maximum(A, 0.01), 0).clip(0, 255)
    alpha = (out[:, :, 3] > 110)
    rgbimg = Image.fromarray(rgb.astype(np.uint8), 'RGB').filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=2))
    q = rgbimg.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    q = np.array(q)
    res = np.zeros((h + 2, w + 2, 4), np.uint8); res[1:-1, 1:-1, :3] = q; res[1:-1, 1:-1, 3] = alpha * 255
    # 1px outline: dark version of the neighbouring colour
    m = res[:, :, 3] > 0; H2, W2 = m.shape
    for y in range(H2):
        for x in range(W2):
            if m[y, x]: continue
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < H2 and 0 <= xx < W2 and m[yy, xx]:
                    c = res[yy, xx, :3].astype(int); res[y, x, :3] = (c * 0.28 + [8, 6, 14]).clip(0, 255); res[y, x, 3] = 255; break
    os.makedirs(os.path.join(ROOT, 'px'), exist_ok=True)
    Image.fromarray(res, 'RGBA').save(os.path.join(ROOT, 'px', key + '.png'))
    return res.shape
if __name__ == '__main__':
    keys = sys.argv[1:] or [f[:-8] for f in os.listdir(ROOT) if f.endswith('_raw.png')]
    for k in keys: print(k, pixelize(k))
