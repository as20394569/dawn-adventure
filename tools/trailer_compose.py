# 宣傳影片 第 2 步：把錄好的畫面接成直式影片（1080×1920，30fps，約 28 秒，適合 App Store 預覽 15〜30 秒）。
# 用法：python3 tools/trailer_compose.py <錄影資料夾> <輸出.mp4>
import sys, os, glob, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
W, H, SC = 1080, 1920, 5                      # game 176×256 → 880×1280
GX, GY = (W - 176 * SC) // 2, 470
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
SEGS = [  # (scene, [(from, to), ...], caption line 1, caption line 2)
    ('intro', [(70, 230)], '放學路上，', '掉進了異世界'),
    ('boss', [(180, 320)], '看懂預告，', '擋下頭目的大招'),
    ('battle', [(70, 200)], '每種武器，', '一棵技能樹'),
    ('lord', [(150, 290)], '破關之後，', '挑戰 30 層裂界深淵'),
    ('fish', [(8, 120)], '釣魚、做菜，', '收集 24 種魚'),
    ('tmap', [(0, 50), (100, 140)], '照著藏寶圖，', '挖出 16 個寶藏'),
    ('title', [(0, 75)], '曙光冒險', '異世界冒險 RPG'),
]
XF = 6  # crossfade frames between scenes

def bg():
    im = Image.new('RGB', (W, H), (13, 16, 32)); d = ImageDraw.Draw(im)
    for y in range(0, H, 48): d.line([(0, y), (W, y)], fill=(18, 22, 50))
    for x in range(0, W, 48): d.line([(x, 0), (x, H)], fill=(18, 22, 50))
    top = Image.new('RGB', (W, 700), (110, 231, 210)); m = Image.linear_gradient('L').resize((W, 700)).point(lambda v: int((255 - v) * 0.16))
    im.paste(top, (0, 0), m)
    # frame around the game
    d.rounded_rectangle([GX - 14, GY - 14, GX + 176 * SC + 13, GY + 256 * SC + 13], radius=34, fill=(42, 49, 80))
    d.rounded_rectangle([GX - 8, GY - 8, GX + 176 * SC + 7, GY + 256 * SC + 7], radius=28, fill=(110, 231, 210))
    f = ImageFont.truetype(FONT, 34); t = '曙光冒險｜異世界冒險 RPG'; w = d.textlength(t, font=f); d.text(((W - w) / 2, GY + 256 * SC + 52), t, font=f, fill=(138, 147, 179))
    return im

def caption(l1, l2, end=False):
    c = Image.new('RGBA', (W, GY), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    f1 = ImageFont.truetype(FONT, 104 if end else 86); f2 = ImageFont.truetype(FONT, 64 if end else 86)
    d.rounded_rectangle([W / 2 - 50, 92, W / 2 + 50, 102], radius=4, fill=(110, 231, 210))
    for i, (t, f, col) in enumerate([(l1, f1, (238, 241, 248)), (l2, f2, (110, 231, 210))]):
        w = d.textlength(t, font=f); y = 140 + i * (118 if not end else 128)
        d.text(((W - w) / 2 + 4, y + 6), t, font=f, fill=(5, 6, 12, 255)); d.text(((W - w) / 2, y), t, font=f, fill=col + (255,))
    return c

def frames(scene, ranges):
    L = sorted(glob.glob(os.path.join(SRC, scene, '*.png'))); out = []
    for a, b in ranges: out += L[a:b]
    return out

BG = bg(); tmp = OUT + '.frames'; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
seq = []  # list of (game image path, caption image, alpha of caption)
for scene, ranges, l1, l2 in SEGS:
    cap = caption(l1, l2, scene == 'title'); F = frames(scene, ranges)
    for i, p in enumerate(F): seq.append((p, cap, min(1, i / 8), scene))
n = 0; prev = None; fade = 0
def game(p): return Image.open(p).convert('RGB').resize((176, 256), Image.NEAREST).resize((176 * SC, 256 * SC), Image.NEAREST)
for k, (p, cap, a, scene) in enumerate(seq):
    im = BG.copy(); g = game(p)
    # crossfade at a scene start: blend the previous scene's last frame in
    if k and seq[k - 1][3] != scene: prev = (game(seq[k - 1][0]), seq[k - 1][1]); fade = XF
    if prev and fade > 0: g = Image.blend(g, prev[0], fade / (XF + 1)); fade -= 1
    im.paste(g, (GX, GY))
    if a < 1: c2 = cap.copy(); c2.putalpha(c2.getchannel('A').point(lambda v: int(v * a))); im.paste(c2, (0, 0), c2)
    else: im.paste(cap, (0, 0), cap)
    im.save(os.path.join(tmp, '%05d.png' % n)); n += 1
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', OUT], check=True)
shutil.rmtree(tmp); print('frames', n, 'seconds', round(n / 30, 1), OUT)
