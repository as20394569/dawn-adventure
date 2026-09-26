import sys
from PIL import Image
names=sys.argv[2:]; ims=[Image.open(f'build/{n}.png').convert('RGB') for n in names]; ims=[im.resize((im.width*2,im.height*2),Image.NEAREST) if im.width<300 else im for im in ims]
w,h=ims[0].size; cols=min(4,len(ims)); rows=(len(ims)+cols-1)//cols
out=Image.new('RGB',(w*cols+8*(cols-1),h*rows+8*(rows-1)),(40,40,40))
for i,im in enumerate(ims): out.paste(im,((i%cols)*(w+8),(i//cols)*(h+8)))
out.save('build/'+sys.argv[1]+'.png')
