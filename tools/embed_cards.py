"""v14.2 卡牌插圖：art/battle/cards/<id>.png（48×32，Codex 任務 AQ）→ src/14f_card_art.js（data URI，遊戲啟動時載入）"""
import os, base64, glob, json, sys
import hashlib, io
from PIL import Image
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build', 'pngcache')
os.makedirs(CACHE, exist_ok=True)
def _small(raw):
    """lossless re-encode: exact palette PNG when the image has <=256 RGBA colours, else optimised RGBA; pixels are verified"""
    h = hashlib.sha1(raw).hexdigest(); cp = os.path.join(CACHE, h + '.png')
    if os.path.exists(cp): return open(cp, 'rb').read()
    im = Image.open(io.BytesIO(raw)).convert('RGBA'); px = [p if p[3] else (0, 0, 0, 0) for p in im.getdata()]
    best = raw; cols = sorted(set(px))
    outs = []
    b = io.BytesIO(); c = Image.new('RGBA', im.size); c.putdata(px); c.save(b, 'PNG', optimize=True); outs.append(b.getvalue())
    if len(cols) <= 256:
        idx = {q: i for i, q in enumerate(cols)}; P = Image.new('P', im.size); P.putdata([idx[q] for q in px])
        pal = []
        for q in cols: pal += q[:3]
        P.putpalette(pal + [0] * (768 - len(pal))); b = io.BytesIO(); P.save(b, 'PNG', optimize=True, transparency=bytes(q[3] for q in cols)); outs.append(b.getvalue())
    for o in outs:
        if len(o) < len(best) and [q if q[3] else (0, 0, 0, 0) for q in Image.open(io.BytesIO(o)).convert('RGBA').getdata()] == px: best = o
    open(cp, 'wb').write(best); return best
def b64png(f): return 'data:image/png;base64,' + base64.b64encode(_small(open(f, 'rb').read())).decode()
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
files = sorted(glob.glob(os.path.join(root, 'art', 'battle', 'cards', '*.png')))
src = {os.path.splitext(os.path.basename(f))[0]: b64png(f) for f in files}
out = ('/* ===================== v14.2 卡牌插圖（Codex 任務 AQ；tools/embed_cards.py 產生，不要手改） ===================== */\n'
       'KD.ART_SRC = ' + json.dumps(src, separators=(',', ':')) + ';\n'
       'KD.ART = {}; for (const k in KD.ART_SRC) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = KD.ART_SRC[k]; KD.ART[k] = im; }\n')
open(os.path.join(root, 'src', '14f_card_art.js'), 'w').write(out)
print('cards', len(src), 'KB', len(out) // 1024)
