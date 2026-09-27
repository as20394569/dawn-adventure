"""Frame animations drawn with Codex: art/battle/anim/<key>_<state><n>.png  ->  art/battle/pxanim/<key>.png (+ .json)
- every frame of one character is scaled by the SAME factor (no size popping)
- frames are aligned on the feet: bottom row + centre of the lowest 12% of the silhouette match idle1
  (AI-edited frames can drift a few pixels; this keeps the anchor fixed, like the animcheck rule)
- output: one horizontal strip + a json with the frame order per state
Usage: python3 tools/pixelize_anim.py [key ...]"""
import sys, os, re, json, glob
import numpy as np
from PIL import Image, ImageFilter
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'battle')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixelize import HEIGHT, DEFAULT_H, MAX_W
ORDER = ['idle', 'attack', 'cast', 'hurt', 'defend']
BATTLE_SCALE = 0.78  # v19: actors drawn smaller so skill effects have room (player feedback)

def load(path):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    # checkerboard / white backgrounds are not expected, but treat near-transparent as empty
    return im, a[:, :, 3] > 40

def foot(mask):
    ys, xs = np.nonzero(mask); bot = ys.max(); top = ys.min(); band = ys >= bot - max(2, int((bot - top) * 0.12))
    return bot, xs[band].mean()

def despeck(m):
    # drop tiny detached specks (AI debris / dust) — keep blobs >= 3% of the largest one
    import cv2
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    if n <= 2: return m
    big = st[1:, cv2.CC_STAT_AREA].max(); keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= max(12, big * 0.03)
    return keep[lab]

def process(key, colors=40):
    files = sorted(glob.glob(os.path.join(ROOT, 'anim', key + '_*.png')))
    frames = {}
    for f in files:
        m = re.match(re.escape(key) + r'_([a-z]+)(\d+)\.png$', os.path.basename(f))
        if m and m.group(1) in ORDER: frames.setdefault(m.group(1), []).append((int(m.group(2)), f))
    if 'idle' not in frames: print(key, 'no idle frames'); return
    seq = [(st, n, f) for st in ORDER if st in frames for n, f in sorted(frames[st])]
    ims = [load(f) for _, _, f in seq]
    # align every frame's feet to idle1
    b0, c0 = foot(ims[0][1]); aligned = []
    for im, mk in ims:
        b, c = foot(mk); dx, dy = int(round(c0 - c)), int(b0 - b)
        can = Image.new('RGBA', im.size, (0, 0, 0, 0)); can.alpha_composite(im, (0, 0)) if (dx, dy) == (0, 0) else can.paste(im, (dx, dy), im)
        aligned.append(can)
    # union box over all frames, one scale for all
    boxes = [np.array(a)[:, :, 3] > 40 for a in aligned]; U = np.any(boxes, axis=0); ys, xs = np.nonzero(U)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    m0 = boxes[0]; ys0, _ = np.nonzero(m0); h0 = ys0.max() - ys0.min() + 1          # idle1's own height sets the scale
    H = HEIGHT.get(key, DEFAULT_H) * BATTLE_SCALE; k = H / h0
    W2 = max(1, round((box[2] - box[0]) * k)); H2 = max(1, round((box[3] - box[1]) * k))
    LIM = int((MAX_W + 20) * BATTLE_SCALE)
    if W2 > LIM: k *= LIM / W2; W2 = LIM; H2 = max(1, round((box[3] - box[1]) * k))
    outs = []
    for im in aligned:
        c = im.crop(box); arr = np.array(c).astype(np.float32); al = arr[:, :, 3:4] / 255; arr[:, :, :3] *= al
        pm = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA').resize((W2, H2), Image.BOX)
        o = np.array(pm).astype(np.float32); A = o[:, :, 3:4] / 255
        rgb = np.where(A > 0.01, o[:, :, :3] / np.maximum(A, 0.01), 0).clip(0, 255)
        outs.append((Image.fromarray(rgb.astype(np.uint8), 'RGB').filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=2)), despeck(o[:, :, 3] > 110)))
    # one shared palette for all frames (no colour flicker between frames)
    strip = Image.new('RGB', (W2 * len(outs), H2))
    for i, (rgb, _) in enumerate(outs): strip.paste(rgb, (i * W2, 0))
    q = np.array(strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB'))
    res = np.zeros((H2 + 2, (W2 + 2) * len(outs), 4), np.uint8)
    for i, (_, al) in enumerate(outs):
        x0 = i * (W2 + 2) + 1; res[1:-1, x0:x0 + W2, :3] = q[:, i * W2:(i + 1) * W2]; res[1:-1, x0:x0 + W2, 3] = al * 255
    # 1px dark outline per frame
    m = res[:, :, 3] > 0; Hh, Ww = m.shape; out = res.copy()
    for y in range(Hh):
        for x in range(Ww):
            if m[y, x]: continue
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < Hh and 0 <= xx < Ww and m[yy, xx] and (xx // (W2 + 2)) == (x // (W2 + 2)):
                    c = res[yy, xx, :3].astype(int); out[y, x, :3] = (c * 0.28 + [8, 6, 14]).clip(0, 255); out[y, x, 3] = 255; break
    os.makedirs(os.path.join(ROOT, 'pxanim'), exist_ok=True)
    Image.fromarray(out, 'RGBA').save(os.path.join(ROOT, 'pxanim', key + '.png'))
    meta = {'w': W2 + 2, 'h': H2 + 2, 'frames': {}}
    for i, (st, n, _) in enumerate(seq): meta['frames'].setdefault(st, []).append(i)
    json.dump(meta, open(os.path.join(ROOT, 'pxanim', key + '.json'), 'w'))
    # preview gif (idle loop, 4x)
    fr = [Image.fromarray(out[:, i * (W2 + 2):(i + 1) * (W2 + 2)], 'RGBA') for i in range(len(seq))]
    def flat(im):
        bg = Image.new('RGBA', im.size, (70, 110, 70, 255)); bg.alpha_composite(im); return bg.convert('RGB').resize((im.width * 4, im.height * 4), Image.NEAREST)
    idle = [flat(fr[i]) for i in meta['frames']['idle']]
    allf = [flat(f) for f in fr]
    idle[0].save(os.path.join(ROOT, 'pxanim', key + '_idle.gif'), save_all=True, append_images=idle[1:], duration=160, loop=0)
    allf[0].save(os.path.join(ROOT, 'pxanim', key + '_all.gif'), save_all=True, append_images=allf[1:], duration=220, loop=0)
    print(key, 'frames', {s: len(v) for s, v in meta['frames'].items()}, 'size', (W2 + 2, H2 + 2))

if __name__ == '__main__':
    keys = sys.argv[1:] or sorted({re.match(r'(.+?)_[a-z]+\d+\.png$', os.path.basename(f)).group(1) for f in glob.glob(os.path.join(ROOT, 'anim', '*_*.png')) if re.match(r'(.+?)_[a-z]+\d+\.png$', os.path.basename(f))})
    for k in keys: process(k)
