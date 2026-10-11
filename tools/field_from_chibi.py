"""v12.130 魔物在地圖上的樣子跟戰鬥中不一樣（玩家：「部分魔物野外跟戰鬥中形象不符」）：
Codex AV/AU 重畫了戰鬥 Q 版，但地圖上走動的 32×32 小人還是舊設計、或借別隻魔物的圖。
這支把戰鬥 Q 版的待機圖（idle1/idle2）縮成 32×32（取每格中心的像素，保持像素銳利），寫成 art/battle/field/<key>_<dir><n>.png；
四個方向先都用正面（之後 Codex 畫四方向再換掉）。用法：python3 tools/field_from_chibi.py key1 key2 …"""
import os, sys
from PIL import Image
import numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'battle')
def nn(im, n=32):
    a = np.array(im.convert('RGBA')); h, w = a.shape[:2]
    if (h, w) == (n, n): return im.convert('RGBA')
    ys = (np.arange(n) * h / n + h / n / 2).astype(int); xs = (np.arange(n) * w / n + w / n / 2).astype(int)
    return Image.fromarray(a[ys][:, xs], 'RGBA')
done = []
for k in sys.argv[1:]:
    p1 = os.path.join(ROOT, 'chibi', k + '_idle1.png')
    if not os.path.exists(p1): continue
    f1 = nn(Image.open(p1))
    # v12.131 玩家「頭跟身體連接不合」：idle2 是上半身往上 1 格、腳不動，縮小後頭和身體會錯開 → 第二格改成整隻往上 1 格（頭身一起動）
    f2 = Image.new('RGBA', f1.size); f2.alpha_composite(f1.crop((0, 1, f1.width, f1.height)), (0, 0))
    for d in ['down', 'up', 'left', 'right']:
        f1.save(os.path.join(ROOT, 'field', f'{k}_{d}1.png')); f2.save(os.path.join(ROOT, 'field', f'{k}_{d}2.png'))
    done.append(k)
print(len(done), ' '.join(done))
