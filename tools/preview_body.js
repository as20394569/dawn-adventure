const c=document.getElementById('c');c.width=720;c.height=400;c.style.width='1440px';c.style.height='800px';const x=c.getContext('2d');x.imageSmoothingEnabled=false;
x.fillStyle='#9ad880';x.fillRect(0,0,720,400);
const names=Object.keys(ART);
names.forEach((n,i)=>{ const N=n==='golem'?28:24; const sm=buildShaded(ART[n],N,N/64); x.drawImage(sm,0,0,N,N,(i%6)*120+4,Math.floor(i/6)*110+4,N*3,N*3); x.drawImage(sm,(i%6)*120+95,Math.floor(i/6)*110+80); });
x.drawImage(heroBattleImg(0,'woodSword'),620,260);
