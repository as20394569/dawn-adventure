"""Dialogue portraits from Codex's original large images (player: 「原始大圖直接拿來用」).
The 32×32 portraits were shrunk from these with nearest-neighbour, which made the faces speckled. Here the same crop as
Codex's process.py (alpha ≥180, bbox, trim to the last broad torso row, shoulders on the bottom edge) is resized with a
proper filter to N×N and reduced to ≤52 colours so it can be embedded as palette rows (no base64)."""
import sys, os, glob
import numpy as np
from PIL import Image
N = int(os.environ.get('PORTRAIT_N', 128))
def hd(path, n=N):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    a[:, :, 3] = np.where(a[:, :, 3] >= 180, 255, 0); a[a[:, :, 3] == 0] = 0; im = Image.fromarray(a); im = im.crop(im.getbbox())
    rows = np.count_nonzero(np.array(im)[:, :, 3], axis=1); start = int(im.height * .8)
    wide = np.flatnonzero(rows[start:] >= max(rows[start:]) * .7) + start; im = im.crop((0, 0, im.width, int(wide[-1]) + 1))
    sc = min(n * 30 / 32 / im.width, n * 31 / 32 / im.height)
    q = im.convert('RGBa').resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.Resampling.LANCZOS).convert('RGBA')
    out = Image.new('RGBA', (n, n)); out.alpha_composite(q, ((n - q.width) // 2, n - q.height))
    a = np.array(out); mask = a[:, :, 3] >= 128; rgb = a[:, :, :3][mask]
    pal_im = Image.fromarray(rgb.reshape(1, -1, 3)).quantize(colors=52, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    a[:, :, :3][mask] = np.array(pal_im.convert('RGB')).reshape(-1, 3); a[:, :, 3] = np.where(mask, 255, 0); a[~mask] = 0
    return Image.fromarray(a)
if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, '**', '*_raw.png'), recursive=True)):
        k = os.path.basename(f)[:-8]
        if k == 'knightLia' and 'knightLia-redo' not in f: continue  # the redo replaces the first Lia
        hd(f).save(os.path.join(dst, k + '.png')); print(k, end=' ')
