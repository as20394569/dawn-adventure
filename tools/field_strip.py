"""Codex elite/boss chibis art/battle/field/<key>_<dir><n>.png (32×32) -> art/battle/fieldpx/<key>.png strip:
down1 down2 up1 up2 left1 left2 right1 right2 (right falls back to mirrored left)"""
import os, glob, re
from PIL import Image, ImageOps
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'battle')
keys = sorted({re.match(r'(.+?)_(down|up|left|right)\d\.png$', os.path.basename(f)).group(1) for f in glob.glob(os.path.join(ROOT, 'field', '*_*[12].png')) if re.match(r'(.+?)_(down|up|left|right)\d\.png$', os.path.basename(f))})
def despeck(im):
    import numpy as np, cv2
    a = np.array(im); m = (a[:, :, 3] > 0).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 2:
        big = st[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] < max(4, big * 0.02): a[lab == i] = 0
    return Image.fromarray(a, 'RGBA')
os.makedirs(os.path.join(ROOT, 'fieldpx'), exist_ok=True)
for k in keys:
    fr = []
    for d in ['down', 'up', 'left', 'right']:
        for n in (1, 2):
            p = os.path.join(ROOT, 'field', f'{k}_{d}{n}.png')
            if os.path.exists(p): im = Image.open(p).convert('RGBA')
            elif d == 'right': im = ImageOps.mirror(Image.open(os.path.join(ROOT, 'field', f'{k}_left{n}.png')).convert('RGBA'))
            else: im = fr[-1]
            if im.size != (32, 32): im = im.resize((32, 32), Image.NEAREST)
            fr.append(despeck(im))
    s = Image.new('RGBA', (32 * 8, 32))
    for i, im in enumerate(fr): s.alpha_composite(im, (i * 32, 0))
    s.save(os.path.join(ROOT, 'fieldpx', k + '.png')); print(k)
