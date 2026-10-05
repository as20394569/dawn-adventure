# python3 z2.py tag out.png key1 key2 ...  (every other frame from 2, 1.5x, 8 cols; one block per key)
import sys, glob
from PIL import Image, ImageDraw
tag, out = sys.argv[1], sys.argv[2]; blocks = []
for key in sys.argv[3:]:
    fs = sorted(glob.glob(f'{tag}/_{key}/*.png'))[2::2][:16]
    if not fs: continue
    ims = [Image.open(f).convert('RGB').crop((0, 90, 352, 420)).resize((264, 247), Image.NEAREST) for f in fs]
    cols = 8; rows = (len(ims) + cols - 1) // cols; B = Image.new('RGB', (cols * 266, rows * 249 + 16), (50, 0, 50)); d = ImageDraw.Draw(B); d.text((4, 2), key, fill=(255, 255, 0))
    for i, im in enumerate(ims): B.paste(im, ((i % cols) * 266, 16 + (i // cols) * 249))
    blocks.append(B)
S = Image.new('RGB', (max(b.width for b in blocks), sum(b.height + 6 for b in blocks)), (0, 0, 0)); y = 0
for b in blocks: S.paste(b, (0, y)); y += b.height + 6
S.save(out); print(out, S.size)
