import sys
from PIL import Image
# sheet.py out.png name1 name2 ... (canvas crops, 4 per row); name:full keeps the whole phone screen
d = '/tmp/claude-0/-home-claude--/1ac51525-de24-5872-9bf6-4fc024f0c0db/scratchpad/pp/shots/'
ims = []
for n in sys.argv[2:]:
    full = n.endswith(':full'); n = n.replace(':full', '')
    im = Image.open(d + n + '.png').convert('RGB')
    if im.size == (352, 512): full = True
    ims.append(im if full else im.crop((16, 63, 374, 584)))
cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
w = max(i.width for i in ims); h = max(i.height for i in ims)
out = Image.new('RGB', (w * cols + 4 * (cols - 1), h * rows + 4 * (rows - 1)), (255, 0, 255))
for k, im in enumerate(ims): out.paste(im, ((k % cols) * (w + 4), (k // cols) * (h + 4)))
out.save(sys.argv[1])
