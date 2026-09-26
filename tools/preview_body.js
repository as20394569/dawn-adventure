const c=document.getElementById('c'),x=c.getContext('2d');x.imageSmoothingEnabled=false;
x.fillStyle='#8cc878';x.fillRect(0,0,480,320);
x.drawImage(heroBattleImg(0,'woodSword'),10,10); x.drawImage(heroBattleImg(1,'woodSword'),90,10); x.drawImage(heroBattleImg(0,'ironSword'),170,10); x.drawImage(heroBattleImg(0,null),250,10);
x.drawImage(Hero.frames.up[0],340,40);
