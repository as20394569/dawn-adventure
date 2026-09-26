import sys
from PIL import Image
names=sys.argv[2:]; ims=[Image.open(f'build/{n}.png') for n in names]
w,h=ims[0].size; cols=2; rows=(len(ims)+1)//2
out=Image.new('RGB',(w*cols,h*rows),(40,40,40))
for i,im in enumerate(ims): out.paste(im,((i%cols)*w,(i//cols)*h))
out.save('build/'+sys.argv[1]+'.png')
