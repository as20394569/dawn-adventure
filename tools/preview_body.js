const c=document.getElementById('c'),x=c.getContext('2d');x.imageSmoothingEnabled=false;
x.fillStyle='#8c8';x.fillRect(0,0,480,320);
for(const [di,d] of ['down','up','left','right'].entries())for(let f=0;f<4;f++){x.drawImage(Hero.frames[d][f],8+f*20+di*90,8);}
for(const [di,d] of ['down','up','left','right'].entries()){const im=Hero.frames[d][0]; x.drawImage(im,0,0,16,22,20+di*60,40,48,66);}
const hb=buildShaded(ART.heroBack,64,1); x.drawImage(hb,0,0,64,64,260,120,128,128); x.drawImage(hb,300,40);
const npc=npcFrames('mom'); x.drawImage(npc.down[0],20,130); x.drawImage(npcFrames('elder').down[0],40,130);
