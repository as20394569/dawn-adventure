"""v12.0.1 smooth high-resolution status icons (player: 「狀態圖示太過像素 有時看不出來」). The files in art/ui/icons_hd are now Codex task AD
art; this script drew the first version and keeps the key list (HD_ICONS) — running it again would overwrite the Codex icons.
Each icon is drawn as vector shapes at 256 px (4× supersampling) and reduced to 64 × 64 → art/ui/icons_hd/icon_<key>.png.
The game draws them smoothly into the 14 px layout slot, so on a phone they are 42–84 real pixels with no pixel grid.
Tile colour = group (debuff red-violet, buff blue, stat up warm, stat down cool); one bold glyph with a dark outline."""
import os, math
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'ui', 'icons_hd')
S, OUT = 256, 64
INK = (16, 18, 30, 255)
TILES = {'debuff': ((112, 38, 76), (52, 18, 38)), 'buff': ((40, 74, 132), (18, 36, 74)), 'up': ((128, 74, 26), (70, 38, 12)), 'down': ((36, 58, 108), (16, 28, 64))}

def rgba(h, a=255):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

def tile(group):
    top, bot = TILES[group]; im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    grad = Image.new('RGBA', (S, S)); g = ImageDraw.Draw(grad)
    for y in range(S):
        k = y / (S - 1); g.line([(0, y), (S, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * k) for i in range(3)) + (255,))
    m = Image.new('L', (S, S), 0); ImageDraw.Draw(m).rounded_rectangle([8, 8, S - 9, S - 9], 48, fill=255)
    d = ImageDraw.Draw(im); d.rounded_rectangle([8, 8, S - 9, S - 9], 48, fill=INK)
    inner = Image.new('L', (S, S), 0); ImageDraw.Draw(inner).rounded_rectangle([20, 20, S - 21, S - 21], 38, fill=255)
    im.paste(grad, (0, 0), inner)
    rim = Image.new('L', (S, S), 0); ImageDraw.Draw(rim).rounded_rectangle([20, 20, S - 21, S - 21], 38, outline=255, width=6)
    hi = tuple(min(255, c + 70) for c in top) + (150,); im.paste(Image.new('RGBA', (S, S), hi), (0, 0), rim)
    return im

class Glyph:
    """draw coloured shapes on a layer; finish() adds a dark outline around everything drawn"""
    def __init__(self): self.im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); self.d = ImageDraw.Draw(self.im)
    def poly(self, pts, c): self.d.polygon([tuple(p) for p in pts], fill=rgba(c) if isinstance(c, str) else c)
    def circ(self, x, y, r, c): self.d.ellipse([x - r, y - r, x + r, y + r], fill=rgba(c) if isinstance(c, str) else c)
    def line(self, pts, c, w): self.d.line([tuple(p) for p in pts], fill=rgba(c), width=w, joint='curve'); [self.circ(p[0], p[1], w / 2 - 1, c) for p in (pts[0], pts[-1])]
    def arc(self, box, a0, a1, c, w): self.d.arc(box, a0, a1, fill=rgba(c), width=w)
    def rect(self, box, c, r=0): self.d.rounded_rectangle(box, r, fill=rgba(c))
    def finish(self, w=12):
        a = self.im.split()[3].point(lambda v: 255 if v > 40 else 0); o = a.filter(ImageFilter.MaxFilter(w * 2 + 1))
        base = Image.new('RGBA', (S, S), (0, 0, 0, 0)); base.paste(Image.new('RGBA', (S, S), INK), (0, 0), o); base.alpha_composite(self.im); return base

def arrow(G, cx, cy, up, sz, c):
    h, w = sz, sz * 0.8; s = -1 if up else 1
    tip = (cx, cy + s * h / 2); G.poly([tip, (cx - w / 2, cy + s * h / 2 - s * h * 0.5), (cx - w * 0.22, cy + s * h / 2 - s * h * 0.5), (cx - w * 0.22, cy - s * h / 2), (cx + w * 0.22, cy - s * h / 2), (cx + w * 0.22, cy + s * h / 2 - s * h * 0.5), (cx + w / 2, cy + s * h / 2 - s * h * 0.5)], c)
    G.poly([(cx - w * 0.12, cy - s * h / 2 + s * 8), (cx - w * 0.12 + 10, cy - s * h / 2 + s * 8), (cx - w * 0.12 + 10, cy + s * h * 0.05), (cx - w * 0.12, cy + s * h * 0.05)], (255, 255, 255, 110))

def drop(G, cx, cy, r, c, c2):
    G.poly([(cx, cy - r * 1.9), (cx - r * 0.86, cy - r * 0.5), (cx + r * 0.86, cy - r * 0.5)], c); G.circ(cx, cy, r, c)
    G.circ(cx + r * 0.18, cy + r * 0.2, r * 0.72, c2); G.circ(cx - r * 0.38, cy - r * 0.25, r * 0.22, '#ffffff')

def star(G, cx, cy, r1, r2, n, c, rot=-90):
    pts = []
    for i in range(n * 2):
        a = math.radians(rot + i * 180 / n); r = r1 if i % 2 == 0 else r2; pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    G.poly(pts, c)

def heater(G, cx, cy, w, h, c, c2):
    G.poly([(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2), (cx - w / 2, cy)], c)
    G.poly([(cx, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2)], c2)

def sword(G, x0, y0, x1, y1, w=26):
    G.line([(x0, y0), (x1, y1)], '#e8eef6', w); dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); ux, uy = dx / L, dy / L
    gx, gy = x0 + ux * 34, y0 + uy * 34; G.line([(gx - uy * 34, gy + ux * 34), (gx + uy * 34, gy - ux * 34)], '#d8a040', 18); G.line([(x0, y0), (x0 + ux * 26, y0 + uy * 26)], '#8a5a2a', 18)
    G.line([(x0 + ux * 50, y0 + uy * 50), (x1 - ux * 8, y1 - uy * 8)], '#ffffff', 6)

def gear(G, cx, cy, r, c, c2, teeth=8):
    for i in range(teeth):
        a = math.radians(i * 360 / teeth); G.d.polygon([(cx + math.cos(a + d) * rr, cy + math.sin(a + d) * rr) for d, rr in ((-0.22, r * 0.8), (-0.14, r * 1.18), (0.14, r * 1.18), (0.22, r * 0.8))], fill=rgba(c))
    G.circ(cx, cy, r * 0.88, c); G.circ(cx, cy, r * 0.62, c2); G.circ(cx, cy, r * 0.3, '#3a2a1a')

def bolt(G, cx, cy, s, c):
    G.poly([(cx + 10 * s, cy - 60 * s), (cx - 40 * s, cy + 8 * s), (cx - 4 * s, cy + 8 * s), (cx - 16 * s, cy + 62 * s), (cx + 40 * s, cy - 10 * s), (cx + 4 * s, cy - 10 * s)], c)

def boot(G, cx, cy, c, c2):
    G.poly([(cx - 34, cy - 50), (cx + 6, cy - 50), (cx + 6, cy + 4), (cx + 46, cy + 18), (cx + 46, cy + 42), (cx - 34, cy + 42)], c)
    G.rect([cx - 34, cy + 26, cx + 46, cy + 42], c2, 6)
    for i, (dx, dy) in enumerate(((-58, -46), (-66, -24), (-60, -2))): G.d.ellipse([cx - 34 + dx, cy + dy - 9, cx - 30 + dx + 38, cy + dy + 9], fill=rgba('#ffffff'))

def draw(key):
    G = Glyph(); c = 128
    if key == 'psn': drop(G, c, c + 22, 58, '#7a2aa8', '#b060e8'); G.circ(c + 62, c - 52, 16, '#c890ff'); G.circ(c + 40, c - 80, 10, '#c890ff'); G.circ(c - 14, c + 22, 12, '#3a1050'); G.circ(c + 22, c + 22, 12, '#3a1050'); G.rect([c - 16, c + 46, c + 24, c + 56], '#3a1050', 4)
    elif key == 'par': bolt(G, c, c, 1.45, '#ffd028'); G.poly([(c + 14, c - 82), (c - 30, c - 4), (c - 14, c - 4), (c + 20, c - 60)], '#fff6b0')
    elif key == 'slp':
        G.circ(c - 8, c + 10, 70, '#f4e9a8'); G.circ(c + 28, c - 22, 58, (0, 0, 0, 0))
        G.circ(c + 64, c - 62, 18, '#bfe0ff'); G.circ(c + 86, c - 96, 11, '#bfe0ff')
    elif key == 'brn':
        G.poly([(c, c - 92), (c + 30, c - 40), (c + 58, c - 62), (c + 66, c + 6), (c + 52, c + 60), (c, c + 78), (c - 52, c + 60), (c - 66, c + 6), (c - 50, c - 44), (c - 30, c - 18)], '#ff5a1e')
        G.poly([(c + 4, c - 34), (c + 34, c + 6), (c + 34, c + 46), (c, c + 66), (c - 34, c + 46), (c - 30, c + 4)], '#ffb030'); G.poly([(c + 2, c + 6), (c + 18, c + 36), (c, c + 58), (c - 18, c + 36)], '#fff2a0')
    elif key == 'wet': drop(G, c, c + 26, 64, '#1c64c8', '#4ea8f8')
    elif key == 'tangle':
        G.arc([c - 70, c - 70, c + 40, c + 40], 30, 340, '#2f8a3a', 30); G.arc([c - 30, c - 30, c + 74, c + 74], 200, 150, '#58c058', 30)
        G.d.ellipse([c + 30, c - 92, c + 92, c - 52], fill=rgba('#7ee070')); G.d.ellipse([c - 96, c + 50, c - 40, c + 86], fill=rgba('#7ee070'))
    elif key == 'frozen':
        G.d.regular_polygon((c, c, 92), 6, rotation=30, fill=rgba('#5ab8e8')); G.d.regular_polygon((c, c, 70), 6, rotation=30, fill=rgba('#9ae0fa'))
        for a in (0, 60, 120): r = math.radians(a); G.line([(c - math.cos(r) * 62, c - math.sin(r) * 62), (c + math.cos(r) * 62, c + math.sin(r) * 62)], '#ffffff', 16)
    elif key == 'mark':
        G.arc([c - 76, c - 76, c + 76, c + 76], 0, 360, '#ff4a4a', 22)
        for a in (0, 90, 180, 270): r = math.radians(a); G.line([(c + math.cos(r) * 40, c + math.sin(r) * 40), (c + math.cos(r) * 98, c + math.sin(r) * 98)], '#ff4a4a', 20)
        G.circ(c, c, 18, '#ffd0d0')
    elif key == 'delay':
        G.d.ellipse([c - 98, c + 26, c + 90, c + 74], fill=rgba('#a8b0bc')); G.line([(c + 70, c + 40), (c + 92, c - 10)], '#a8b0bc', 16); G.line([(c + 52, c + 40), (c + 62, c - 6)], '#a8b0bc', 14)
        G.circ(c - 14, c - 4, 62, '#c09060'); G.arc([c - 56, c - 46, c + 28, c + 38], 0, 300, '#7a5230', 14); G.arc([c - 34, c - 24, c + 6, c + 16], 90, 360, '#7a5230', 12)
    elif key == 'shield':
        G.circ(c, c, 90, '#3a8ae8'); G.circ(c, c, 72, '#6ab8ff'); G.arc([c - 54, c - 54, c + 54, c + 54], 0, 360, '#d8f0ff', 10)
        star(G, c, c, 34, 14, 4, '#ffffff', -90); G.arc([c - 80, c - 80, c + 80, c + 80], 200, 250, '#ffffff', 10)
    elif key == 'wall':
        G.poly([(c - 70, c - 84), (c + 70, c - 84), (c + 70, c + 10), (c, c + 96), (c - 70, c + 10)], '#aab4c4'); G.poly([(c, c - 84), (c + 70, c - 84), (c + 70, c + 10), (c, c + 96)], '#7c8698')
        G.rect([c - 12, c - 84, c + 12, c + 80], '#d8e0ea'); G.rect([c - 70, c - 30, c + 70, c - 8], '#d8e0ea')
    elif key == 'smoke':
        for x, y, r, col in ((c - 48, c + 24, 46, '#8c949e'), (c + 44, c + 26, 48, '#8c949e'), (c - 6, c - 22, 58, '#b4bcc6'), (c - 60, c - 30, 32, '#c8d0d8'), (c + 54, c - 34, 34, '#c8d0d8'), (c, c + 40, 44, '#a4acb6')): G.circ(x, y, r, col)
    elif key == 'focus':
        G.poly([(c - 98, c), (c - 50, c - 52), (c + 50, c - 52), (c + 98, c), (c + 50, c + 52), (c - 50, c + 52)], '#fff4c8'); G.circ(c, c, 40, '#e8a020'); G.circ(c, c, 20, '#3a2008'); G.circ(c - 10, c - 12, 8, '#ffffff')
        for a in (-60, -90, -120): r = math.radians(a); G.line([(c + math.cos(r) * 70, c + math.sin(r) * 70), (c + math.cos(r) * 100, c + math.sin(r) * 100)], '#ffd860', 12)
    elif key == 'after':
        for k, al in ((2, 70), (1, 140), (0, 255)):
            dx = -k * 34; col = (150, 230, 255, al)
            G.circ(c + 36 + dx, c - 60, 20, col); G.d.line([(c + 30 + dx, c - 36), (c + 4 + dx, c + 22)], fill=col, width=26); G.d.line([(c + 4 + dx, c + 22), (c + 34 + dx, c + 84)], fill=col, width=22); G.d.line([(c + 4 + dx, c + 22), (c - 30 + dx, c + 66)], fill=col, width=22); G.d.line([(c + 24 + dx, c - 20), (c + 64 + dx, c + 6)], fill=col, width=18); G.d.line([(c + 24 + dx, c - 20), (c - 14 + dx, c - 6)], fill=col, width=18)
    elif key == 'first':
        for dx, col in ((-36, '#2aa0b4'), (30, '#7ef0ff')): G.poly([(c - 40 + dx, c - 72), (c + 10 + dx, c - 72), (c + 64 + dx, c), (c + 10 + dx, c + 72), (c - 40 + dx, c + 72), (c + 14 + dx, c)], col)
        G.line([(c - 100, c - 30), (c - 76, c - 30)], '#ffffff', 10); G.line([(c - 104, c + 30), (c - 80, c + 30)], '#ffffff', 10)
    elif key == 'burst':
        G.circ(c, c + 10, 34, '#fff6c8'); star(G, c, c + 10, 70, 24, 8, '#e8c8ff', -90); G.circ(c, c + 10, 26, '#ffffff')
        for (x, y), col in zip(((c - 64, c - 58), (c + 64, c - 58), (c, c + 84)), ('#ff5a30', '#3c90f0', '#ffd030')): G.circ(x, y, 32, col); G.circ(x - 9, y - 10, 9, '#ffffff')
    elif key == 'overdrive': gear(G, c, c + 4, 78, '#d89a40', '#a86a20'); bolt(G, c + 4, c + 4, 1.05, '#ff3a20'); G.poly([(c + 12, c - 56), (c - 22, c), (c - 8, c), (c + 18, c - 40)], '#ffd0a0')
    elif key == 'initiative':
        G.rect([c - 74, c - 96, c + 74, c - 76], '#c88a20', 6); G.rect([c - 74, c + 76, c + 74, c + 96], '#c88a20', 6)
        G.poly([(c - 56, c - 76), (c + 56, c - 76), (c + 8, c), (c + 56, c + 76), (c - 56, c + 76), (c - 8, c)], '#ffe090'); G.poly([(c - 30, c + 76), (c + 30, c + 76), (c, c + 36)], '#e8a830'); G.poly([(c - 34, c - 60), (c + 34, c - 60), (c, c - 20)], '#e8a830')
        G.line([(c + 70, c - 40), (c + 100, c - 92)], '#e8eef6', 16); G.line([(c + 58, c - 46), (c + 84, c - 30)], '#d8a040', 10)
    elif key == 'turret':
        G.line([(c - 20, c + 30), (c - 70, c + 96)], '#56606e', 16); G.line([(c + 10, c + 30), (c + 60, c + 96)], '#56606e', 16); G.line([(c - 5, c + 30), (c - 5, c + 96)], '#56606e', 16)
        G.line([(c + 6, c - 10), (c + 92, c - 82)], '#c8d0dc', 32); G.line([(c + 30, c - 30), (c + 86, c - 76)], '#ffffff', 8); G.rect([c + 76, c - 98, c + 104, c - 64], '#8090a0', 6)
        G.circ(c - 8, c + 6, 54, '#d8a048'); G.circ(c - 18, c - 6, 36, '#f6d27a'); G.circ(c - 30, c + 20, 10, '#6dff9a')
    elif key == 'rage':
        for a in (45, 135, 225, 315):  # the anger mark: four thick arcs bowing toward the centre
            r = math.radians(a); ox, oy = c + math.cos(r) * 92, c + math.sin(r) * 92; G.arc([ox - 58, oy - 58, ox + 58, oy + 58], a + 180 - 34, a + 180 + 34, '#ff3a3a', 24)
    elif key == 'aegis':
        G.poly([(c - 30, c - 96), (c + 72, c - 60), (c + 30, c + 96), (c - 72, c + 60)], '#bfe8f4'); G.poly([(c - 30, c - 96), (c + 72, c - 60), (c + 30, c + 96)], '#88c8e0')
        G.line([(c - 40, c + 30), (c + 10, c - 50)], '#ffffff', 14); G.line([(c - 10, c + 50), (c + 30, c - 14)], '#ffffff', 8)
        G.line([(c - 100, c + 94), (c - 40, c + 40), (c - 100, c + 10)], '#ffe060', 14)
    elif key == 'air':
        for i in range(4): G.d.ellipse([c - 92 + i * 6, c - 30 + i * 26 - 18, c + 30 - i * 18, c - 30 + i * 26 + 18], fill=rgba('#ffffff' if i % 2 == 0 else '#d8ecff'))
        G.d.ellipse([c - 30, c - 68, c + 40, c + 6], fill=rgba('#ffffff')); arrow(G, c + 62, c - 8, True, 118, '#7ad0ff')
    elif key.endswith('_up') or key.endswith('_down'):
        st, up = key.rsplit('_', 1)[0], key.endswith('_up'); bx, by = c - 22, c + 14
        if st == 'atk': sword(G, bx - 54, by + 62, bx + 50, by - 62, 24)
        elif st == 'def': heater(G, bx, by, 112, 140, '#b8c2d0', '#8892a4'); G.rect([bx - 8, by - 70, bx + 8, by + 56], '#e8eef6')
        elif st == 'spa': G.line([(bx - 50, by + 70), (bx + 20, by - 10)], '#a0703a', 16); star(G, bx + 26, by - 30, 50, 22, 5, '#c890ff'); G.circ(bx + 26, by - 30, 14, '#ffffff')
        elif st == 'spd': G.circ(bx, by, 64, '#7a5ad8'); G.circ(bx, by, 46, rgba('#000000', 0)); G.d.ellipse([bx - 46, by - 46, bx + 46, by + 46], fill=(0, 0, 0, 0)); G.arc([bx - 58, by - 58, bx + 58, by + 58], 0, 360, '#c8b0ff', 18); [G.circ(bx + math.cos(math.radians(a)) * 58, by + math.sin(math.radians(a)) * 58, 10, '#ffffff') for a in range(0, 360, 60)]; star(G, bx, by, 26, 10, 4, '#e8dcff')
        elif st == 'spe': boot(G, bx + 10, by + 4, '#c07840', '#7a4820')
        arrow(G, c + 64, c - 30, up, 104, '#a8f060' if up else '#86a2d4')
    return G.finish()

GROUP = {k: 'debuff' for k in ['psn', 'par', 'slp', 'brn', 'wet', 'tangle', 'frozen', 'mark', 'delay']}
GROUP.update({k: 'buff' for k in ['shield', 'wall', 'smoke', 'focus', 'after', 'first', 'burst', 'overdrive', 'initiative', 'turret', 'rage', 'aegis', 'air']})
STATS = [s + d for s in ['atk_', 'def_', 'spa_', 'spd_', 'spe_'] for d in ['up', 'down']]
for k in STATS: GROUP[k] = 'up' if k.endswith('up') else 'down'
HD_ICONS = list(GROUP)

if __name__ == '__main__':
    os.makedirs(ROOT, exist_ok=True); ims = []
    for k in HD_ICONS:
        im = tile(GROUP[k]); im.alpha_composite(draw(k)); im = im.resize((OUT, OUT), Image.LANCZOS); im.save(os.path.join(ROOT, 'icon_' + k + '.png')); ims.append(im)
    n = len(ims); pv = Image.new('RGBA', (n * 68, 132), (24, 26, 40, 255))
    for i, im in enumerate(ims): pv.alpha_composite(im, (i * 68 + 2, 2)); pv.alpha_composite(im.resize((28, 28), Image.LANCZOS), (i * 68 + 20, 70)); pv.alpha_composite(im.resize((20, 20), Image.LANCZOS), (i * 68 + 24, 104))
    pv.save(os.path.join(ROOT, 'preview_hd.png')); print('hd icons', n)
