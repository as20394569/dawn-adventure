"""Video (e.g. Seedance image-to-video) -> animation frames for the sprite pipeline.
  python3 tools/video2sprite.py <video.mp4> <key> <state> [frames=4] [start=0] [end=clip length, seconds]
Picks `frames` evenly spaced frames (for a loop the last frame is not repeated), removes the flat background
(colour sampled from the four corners, e.g. solid green / white / grey), and writes art/battle/anim/<key>_<state><n>.png.
Then run tools/pixelize_anim.py <key> to build the pixel sprite strip (shared scale, feet aligned, shared palette).
Tips for the video prompt: fixed camera, no zoom, plain solid background, character stays in place, loopable motion."""
import sys, os
import numpy as np, cv2
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'battle', 'anim')

def key_out(rgb, tol=38):
    h, w, _ = rgb.shape; s = max(4, min(h, w) // 40)
    corners = np.concatenate([rgb[:s, :s].reshape(-1, 3), rgb[:s, -s:].reshape(-1, 3), rgb[-s:, :s].reshape(-1, 3), rgb[-s:, -s:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    d = np.sqrt(((rgb.astype(np.float32) - bg) ** 2).sum(-1))
    alpha = np.clip((d - tol) / tol, 0, 1)
    # keep only the largest connected blob (+ anything touching it) so stray specks vanish
    m = (alpha > 0.5).astype(np.uint8); n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); keep = np.zeros(n, bool); keep[big] = True
        keep[1:] |= stats[1:, cv2.CC_STAT_AREA] > stats[big, cv2.CC_STAT_AREA] * 0.02   # effects / detached parts that are big enough
        alpha = alpha * keep[lab]
    # remove the background colour cast from semi-transparent edge pixels
    a = alpha[..., None]; fg = np.where(a > 0.02, (rgb - (1 - a) * bg) / np.maximum(a, 0.02), rgb)
    return np.dstack([fg.clip(0, 255), alpha * 255]).astype(np.uint8)

def main():
    path, key, state = sys.argv[1:4]; n = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS) or 24; total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    t0 = float(sys.argv[5]) if len(sys.argv) > 5 else 0; t1 = float(sys.argv[6]) if len(sys.argv) > 6 else total / fps
    loop = state == 'idle'; idx = [int((t0 + (t1 - t0) * i / (n if loop else max(1, n - 1))) * fps) for i in range(n)]
    os.makedirs(ROOT, exist_ok=True)
    for i, fi in enumerate(idx):
        cap.set(cv2.CAP_PROP_POS_FRAMES, min(fi, total - 1)); ok, fr = cap.read()
        if not ok: print('could not read frame', fi); continue
        rgba = key_out(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB))
        out = os.path.join(ROOT, f'{key}_{state}{i + 1}.png'); Image.fromarray(rgba, 'RGBA').save(out); print('wrote', out)

if __name__ == '__main__': main()
