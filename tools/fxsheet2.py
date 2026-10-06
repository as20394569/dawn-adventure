# python3 tools/fxsheet2.py <dir> out.png key [from] [to] [cols]  (STEP=n env: every n-th frame) — full-size frames, cropped to the battle field
import sys, glob
from PIL import Image, ImageDraw
tag, out, key = sys.argv[1], sys.argv[2], sys.argv[3]
a = int(sys.argv[4]) if len(sys.argv) > 4 else 0; b = int(sys.argv[5]) if len(sys.argv) > 5 else 99; cols = int(sys.argv[6]) if len(sys.argv) > 6 else 6
import os
fs = sorted(glob.glob(f'{tag}/_{key}/*.png'))[a:b:int(os.environ.get('STEP', '1'))]
ims = [Image.open(f).convert('RGB').crop((0, 60, 352, 420)) for f in fs]
rows = (len(ims) + cols - 1) // cols; B = Image.new('RGB', (cols * 354, rows * 362 + 16), (50, 0, 50)); d = ImageDraw.Draw(B); d.text((4, 2), key, fill=(255, 255, 0))
for i, im in enumerate(ims): B.paste(im, ((i % cols) * 354, 16 + (i // cols) * 362)); d.text(((i % cols) * 354 + 4, 18 + (i // cols) * 362), str(a + i * int(os.environ.get('STEP', '1'))), fill=(255, 255, 0))
B.save(out); print(out, B.size, len(ims))
