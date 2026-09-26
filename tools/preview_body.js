const c=document.getElementById('c'),x=c.getContext('2d');x.imageSmoothingEnabled=false;
c.width=480;c.height=320;c.style.width='960px';c.style.height='640px';
x.fillStyle='#d8e8c8';x.fillRect(0,0,480,320);
const names=['heroBack','golem','fox','bee','wolf','flower'];
names.forEach((n,i)=>{const im=buildShaded(ART[n],64,1); x.drawImage(im,0,0,64,64,(i%3)*160+8,Math.floor(i/3)*160+8,128,128);});
