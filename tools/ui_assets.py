"""Codex status icons / status FX (art/ui/icons, art/ui/fx) -> game-ready pixel strips in art/ui/px
icons: 17 icons, each ICON×ICON px, one strip (order in ICONS) ; fx: one strip per effect, FX×FX px per frame"""
import os, glob, json
import numpy as np
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'ui')
ICONS = ['psn', 'par', 'slp', 'brn', 'wet', 'shield', 'tangle', 'atk_up', 'atk_down', 'def_up', 'def_down', 'spa_up', 'spa_down', 'spd_up', 'spd_down', 'spe_up', 'spe_down',
         'rage', 'smoke', 'mark', 'focus', 'crit', 'wall', 'static', 'after', 'ench', 'aegis', 'frozen', 'parry',
         'first', 'burst', 'overdrive', 'initiative', 'turret']  # v23: Codex task J, v12: task AC — native 14x14 pixel art in art/ui/icons14
ICON, FX = 14, 64
def shrink(im, s):
    im = im.convert('RGBA'); a = np.array(im).astype(np.float32); al = a[:, :, 3:4] / 255; a[:, :, :3] *= al
    p = np.array(Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA').resize((s, s), Image.BOX)).astype(np.float32); A = p[:, :, 3:4] / 255
    rgb = np.where(A > 0.01, p[:, :, :3] / np.maximum(A, 0.01), 0).clip(0, 255)
    return Image.fromarray(np.dstack([rgb, np.where(p[:, :, 3] > 90, 255, 0)]).astype(np.uint8), 'RGBA')
os.makedirs(os.path.join(ROOT, 'px'), exist_ok=True)
strip = Image.new('RGBA', (ICON * len(ICONS), ICON))
for i, k in enumerate(ICONS):
    nat = os.path.join(ROOT, 'icons14', 'icon_' + k + '.png')
    im = Image.open(nat).convert('RGBA') if os.path.exists(nat) else shrink(Image.open(os.path.join(ROOT, 'icons', 'icon_' + k + '.png')), ICON)
    strip.alpha_composite(im if im.size == (ICON, ICON) else shrink(im, ICON), (i * ICON, 0))
strip.save(os.path.join(ROOT, 'px', 'icons.png'))
import re
kinds = sorted({re.match(r'fx_(.+?)\d+\.png$', os.path.basename(f)).group(1) for f in glob.glob(os.path.join(ROOT, 'fx', 'fx_*.png'))})
for k in kinds:
    fr = sorted(glob.glob(os.path.join(ROOT, 'fx', 'fx_' + k + '[0-9].png')))
    s = Image.new('RGBA', (FX * len(fr), FX))
    for i, f in enumerate(fr): s.alpha_composite(shrink(Image.open(f), FX), (i * FX, 0))
    s.save(os.path.join(ROOT, 'px', 'fx_' + k + '.png')); print(k, len(fr))
json.dump({'icons': ICONS, 'icon': ICON, 'fx': FX}, open(os.path.join(ROOT, 'px', 'meta.json'), 'w'))
