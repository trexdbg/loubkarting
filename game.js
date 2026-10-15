(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const canvas = $("game"), ctx = canvas.getContext("2d", {alpha:false});
const mapCanvas = $("minimap"), mctx = mapCanvas.getContext("2d");
const TAU = Math.PI * 2, ROAD_HALF = 106, FINISH = 160, LAPS = 3;
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const mod = (n,m) => ((n % m)+m)%m;
const lerp = (a,b,t) => a+(b-a)*t;
const hypot = Math.hypot;
const specs = [
  {name:"VIPER GT", color:"#ed6555", dark:"#8f2830", accent:"#ffdb87", speed:373, accel:320, steering:2.48, armor:1},
  {name:"PHANTOM", color:"#59dbdd", dark:"#207b9c", accent:"#d9f9ff", speed:395, accel:305, steering:2.75, armor:0.85},
  {name:"BRUISER", color:"#f4c95a", dark:"#97612d", accent:"#fff1b3", speed:346, accel:285, steering:2.28, armor:1.27}
];
const rivals = [
  {name:"REX",color:"#bc8bff",dark:"#664699",accent:"#eee1ff"},
  {name:"NOVA",color:"#73a9ff",dark:"#34558f",accent:"#e7f1ff"},
  {name:"K.O.",color:"#f6945b",dark:"#965026",accent:"#fff1cd"},
  {name:"BYTE",color:"#8fe8a6",dark:"#3e9b64",accent:"#edffe9"}
];
const trackDefs=[
{name:"NEON CANYON",sky:["#12263a","#132b32","#0c1925"],edge:"#318f9a",anchors:[[-840,-430],[-510,-725],[-25,-800],[520,-702],[846,-413],[916,-55],[750,214],[483,168],[251,345],[285,640],[-33,814],[-485,746],[-770,445],[-922,-20]]},
{name:"COASTLINE RUSH",sky:["#15374a","#194d56","#102a3b"],edge:"#d2a460",anchors:[[-800,-580],[-340,-800],[235,-775],[825,-480],[922,-95],[585,140],[675,510],[365,830],[-155,770],[-430,500],[-360,160],[-735,260],[-960,-45],[-935,-360]]}
];
let trackId=0;
let anchors = [
  [-840,-430],[-510,-725],[-25,-800],[520,-702],[846,-413],
  [916,-55],[750,214],[483,168],[251,345],[285,640],
  [-33,814],[-485,746],[-770,445],[-922,-20]
];
let points = [];
function catmull(a,b,c,d,t) {
  const t2=t*t,t3=t2*t;
  return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);
}
for(let i=0;i<anchors.length;i++){
  for(let j=0;j<16;j++){
    const t=j/16,n=anchors.length;
    const p0=anchors[mod(i-1,n)],p1=anchors[i],p2=anchors[(i+1)%n],p3=anchors[(i+2)%n];
    points.push({x:catmull(p0[0],p1[0],p2[0],p3[0],t),y:catmull(p0[1],p1[1],p2[1],p3[1],t)});
  }
}
let lengths=[],cumulative=[0];
for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length];
  const len=hypot(b.x-a.x,b.y-a.y);
  lengths.push(len); cumulative.push(cumulative[i]+len);
}
let TRACK_LENGTH=cumulative[cumulative.length-1];
let bounds={minX:-1050,maxX:1090,minY:-975,maxY:1000};
function trackAt(distance){
  const s=mod(distance,TRACK_LENGTH);
  let lo=0,hi=points.length;
  while(lo<hi){const mid=(lo+hi)>>1;if(cumulative[mid+1]<=s)lo=mid+1;else hi=mid;}
  const i=lo,a=points[i],b=points[(i+1)%points.length];
  const t=clamp((s-cumulative[i])/lengths[i],0,1);
  const dx=(b.x-a.x)/lengths[i],dy=(b.y-a.y)/lengths[i];
  return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),dx,dy,nx:-dy,ny:dx,s};
}
function closestTrack(x,y){
  let best=Infinity,result=null;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y;
    const t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(lengths[i]*lengths[i]),0,1);
    const px=a.x+dx*t,py=a.y+dy*t,dist2=(x-px)**2+(y-py)**2;
    if(dist2<best){best=dist2;result={x:px,y:py,dist:Math.sqrt(dist2),s:cumulative[i]+lengths[i]*t};}
  }
  return result;
}
let seed=99172;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
let scenery=[];
for(let i=0;i<380;i++){
  const x=(rnd()-.5)*3100,y=(rnd()-.5)*2900;
  if(closestTrack(x,y).dist<ROAD_HALF+80)continue;
  scenery.push({x,y,size:10+rnd()*22,kind:rnd(),phase:rnd()*TAU});
}
let pickups=[];
for(let i=0;i<14;i++){
  const p=trackAt(235+i*TRACK_LENGTH/14),lane=(i%3-1)*47;
  pickups.push({x:p.x+p.nx*lane,y:p.y+p.ny*lane,kind:i%3===0?"repair":i%3===1?"ammo":"nitro",cooldown:0,phase:i*.57});
}

const SAVE_KEY="loubkarting_progress_v2";
const upgrades={engine:{label:"MOTEUR",base:200},armor:{label:"BLINDAGE",base:200},nitro:{label:"NITRO",base:200}};
function loadProgress(){
  let raw={};try{raw=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")||{};}catch(e){}
  const lvl=k=>clamp(Math.floor(Number(raw[k])||0),0,3),credit=Number(raw.credits);
  return {credits:Number.isFinite(credit)?clamp(Math.floor(credit),0,100000000):0,
    engine:lvl("engine"),armor:lvl("armor"),nitro:lvl("nitro"),
    track:clamp(Math.floor(Number(raw.track)||0),0,trackDefs.length-1)};
}
let progress=loadProgress();
function saveProgress(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(progress));}catch(e){}}
function costOf(k){return upgrades[k].base*(1+progress[k]);}
function refreshGarage(){
  $("credits").textContent=progress.credits.toLocaleString("fr-FR");
  for(const key of Object.keys(upgrades)){
    const level=progress[key],maxed=level>=3,btn=document.querySelector('[data-upgrade="'+key+'"]');
    $(key+"Level").textContent="NIV. "+level+" / 3";
    $(key+"Cost").textContent=maxed?"MAX":costOf(key)+" CR";
    if(btn){btn.disabled=maxed||progress.credits<costOf(key);btn.classList.toggle("maxed",maxed);}
  }
}
function buyUpgrade(k){
  if(!upgrades[k]||progress[k]>=3||progress.credits<costOf(k))return;
  const price=costOf(k);
  progress.credits-=price;progress[k]++;saveProgress();refreshGarage();
  $("garageFeedback").textContent=upgrades[k].label+" amélioré au niveau "+progress[k]+" !";
  if(sound.enabled)sound.effect("pickup");
}
function rebuildTrack(id){
  trackId=clamp(Math.floor(Number(id)||0),0,trackDefs.length-1);
  anchors=trackDefs[trackId].anchors;
  points=[];lengths=[];cumulative=[0];scenery=[];pickups=[];
  for(let i=0;i<anchors.length;i++)for(let j=0;j<16;j++){
    const t=j/16,n=anchors.length;
    const p0=anchors[mod(i-1,n)],p1=anchors[i],p2=anchors[(i+1)%n],p3=anchors[(i+2)%n];
    points.push({x:catmull(p0[0],p1[0],p2[0],p3[0],t),y:catmull(p0[1],p1[1],p2[1],p3[1],t)});
  }
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],len=hypot(b.x-a.x,b.y-a.y);
    lengths.push(len);cumulative.push(cumulative[i]+len);
  }
  TRACK_LENGTH=cumulative[cumulative.length-1];
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  bounds={minX:Math.min(...xs)-130,maxX:Math.max(...xs)+130,minY:Math.min(...ys)-130,maxY:Math.max(...ys)+130};
  seed=99172+trackId*7949;
  for(let i=0;i<430;i++){
    const x=lerp(bounds.minX-380,bounds.maxX+380,rnd()),y=lerp(bounds.minY-380,bounds.maxY+380,rnd());
    if(closestTrack(x,y).dist<ROAD_HALF+75)continue;
    scenery.push({x,y,size:10+rnd()*22,kind:rnd(),phase:rnd()*TAU});
  }
  for(let i=0;i<14;i++){
    const p=trackAt(235+i*TRACK_LENGTH/14),lane=(i%3-1)*47;
    pickups.push({x:p.x+p.nx*lane,y:p.y+p.ny*lane,kind:i%3===0?"repair":i%3===1?"ammo":"nitro",cooldown:0,phase:i*.57});
  }
}
rebuildTrack(progress.track);
let W=1280,H=720,dpr=1,zoom=.86;
let cam={x:0,y:0},cameraIso={x:0,y:0};
let state="menu",countdown=0,elapsed=0,selected=0,difficulty="normal";
let player,ais=[],rockets=[],particles=[],keys=new Set(),touch=new Set(),lastTime=0,hudTicker=0,toastTimeout=0;
let lastLap=1,shockCooldown=0,finishOrder=null;

function resize(){
  W=Math.max(320,window.innerWidth);H=Math.max(450,window.innerHeight);
  dpr=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  canvas.style.width=W+"px";canvas.style.height=H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  zoom=W<680?.85:W<1000?.91:.97;
  if(H<550)zoom*=.91;
}
window.addEventListener("resize",resize);resize();
function iso(x,y){return {x:(x-y)*.70710678,y:(x+y)*.397};}
function screen(x,y,z=0){
  const p=iso(x,y);
  return {x:W*.53+(p.x-cameraIso.x)*zoom,y:H*.53+(p.y-cameraIso.y)*zoom-z*zoom};
}
function worldPolygon(verts,color,stroke){
  if(!verts.length)return;
  ctx.beginPath();
  let p=screen(verts[0][0],verts[0][1]);
  ctx.moveTo(p.x,p.y);
  for(let i=1;i<verts.length;i++){p=screen(verts[i][0],verts[i][1]);ctx.lineTo(p.x,p.y);}
  ctx.closePath();ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}
function polyFromSample(s,fl,rl,fw,rw){
  return [s.x+s.dx*fl+s.nx*rl,s.y+s.dy*fl+s.ny*rl,
          s.x+s.dx*fw+s.nx*rw,s.y+s.dy*fw+s.ny*rw];
}
function lineWorld(ax,ay,bx,by,color,width=2){
  const a=screen(ax,ay),b=screen(bx,by);
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function drawBackdrop(t){
  const grd=ctx.createLinearGradient(0,0,0,H);
  const sky=trackDefs[trackId].sky;grd.addColorStop(0,sky[0]);grd.addColorStop(.55,sky[1]);grd.addColorStop(1,sky[2]);
  ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  const spacing=160;
  ctx.strokeStyle="#a7f5ed0b";ctx.lineWidth=1;
  for(let n=-15;n<=15;n+=1){
    const a=screen(n*spacing,-2500),b=screen(n*spacing,2500);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    const c=screen(-2500,n*spacing),d=screen(2500,n*spacing);
    ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke();
  }
  for(const s of scenery){
    const p=screen(s.x,s.y),size=s.size*zoom;
    if(p.x<-70||p.x>W+70||p.y<-70||p.y>H+70)continue;
    ctx.fillStyle="#020a12aa";ctx.beginPath();ctx.ellipse(p.x+4,p.y+4,size*.7,size*.29,-.2,0,TAU);ctx.fill();
    if(s.kind<.64){
      ctx.fillStyle=trackId===0?(s.kind<.32?"#28475a":"#345d62"):(s.kind<.32?"#546d75":"#3b7085");
      ctx.beginPath();ctx.moveTo(p.x-size*.82,p.y);ctx.lineTo(p.x-size*.25,p.y-size*.42);
      ctx.lineTo(p.x+size*.45,p.y-size*.32);ctx.lineTo(p.x+size*.75,p.y+size*.16);
      ctx.lineTo(p.x+size*.1,p.y+size*.32);ctx.closePath();ctx.fill();
      ctx.fillStyle=trackId===0?"#496b75":"#7ba5a5";ctx.beginPath();ctx.moveTo(p.x-size*.25,p.y-size*.42);ctx.lineTo(p.x+size*.45,p.y-size*.32);
      ctx.lineTo(p.x+size*.2,p.y-size*.63);ctx.closePath();ctx.fill();
    }else{
      ctx.fillStyle=trackId===0?"#174f52":"#356b77";ctx.fillRect(p.x-size*.17,p.y-size*.8,size*.35,size*.8);
      ctx.fillStyle=trackId===0?"#2a7777":"#51a4a1";ctx.beginPath();ctx.moveTo(p.x,p.y-size*1.45);ctx.lineTo(p.x-size*.7,p.y-size*.52);
      ctx.lineTo(p.x+size*.7,p.y-size*.52);ctx.closePath();ctx.fill();
      ctx.fillStyle="#46b0a27d";ctx.fillRect(p.x-size*.1,p.y-size*1.25,size*.2,size*.4);
    }
    if(s.kind>.88){ctx.fillStyle="#9efeed88";ctx.fillRect(p.x-size*.1,p.y-size*1.25,2,4);}
  }
}
function traceEdge(offset){
  ctx.beginPath();
  for(let i=0;i<points.length;i++){
    const prev=points[(i-1+points.length)%points.length],next=points[(i+1)%points.length],p=points[i];
    const dx=next.x-prev.x,dy=next.y-prev.y,inv=1/hypot(dx,dy);
    const sp=screen(p.x-dy*inv*offset,p.y+dx*inv*offset);
    if(i===0)ctx.moveTo(sp.x,sp.y);else ctx.lineTo(sp.x,sp.y);
  }
  ctx.closePath();
}
function roadRing(half,color){
  ctx.beginPath();
  const left=[],right=[];
  for(let i=0;i<points.length;i++){
    const prev=points[mod(i-1,points.length)],next=points[(i+1)%points.length],p=points[i];
    const dx=next.x-prev.x,dy=next.y-prev.y,inv=1/hypot(dx,dy),nx=-dy*inv,ny=dx*inv;
    left.push(screen(p.x+nx*half,p.y+ny*half));
    right.push(screen(p.x-nx*half,p.y-ny*half));
  }
  left.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  for(let i=right.length-1;i>=0;i--)ctx.lineTo(right[i].x,right[i].y);
  ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
function drawTrack(t){
  ctx.save();
  roadRing(ROAD_HALF+32,"#071322");
  roadRing(ROAD_HALF+17,trackDefs[trackId].edge);
  roadRing(ROAD_HALF+13,"#1a2834");
  roadRing(ROAD_HALF,"#353e4b");
  roadRing(ROAD_HALF-7,"#2b3542");
  // alternating kerbs
  for(let d=0,i=0;d<TRACK_LENGTH;d+=36,i++){
    const a=trackAt(d),b=trackAt(d+27),col=i%2?"#f1a461":"#dce5dd";
    lineWorld(a.x+a.nx*ROAD_HALF,a.y+a.ny*ROAD_HALF,b.x+b.nx*ROAD_HALF,b.y+b.ny*ROAD_HALF,col,5*zoom);
    lineWorld(a.x-a.nx*ROAD_HALF,a.y-a.ny*ROAD_HALF,b.x-b.nx*ROAD_HALF,b.y-b.ny*ROAD_HALF,col,5*zoom);
  }
  // guiding markers
  for(let d=0;d<TRACK_LENGTH;d+=90){
    const p=trackAt(d),q=trackAt(d+37);
    lineWorld(p.x,p.y,q.x,q.y,"#d7d1a340",2.5*zoom);
  }
  // slight grunge/street patches
  for(let i=0;i<40;i++){
    const p=trackAt(i*TRACK_LENGTH/40+30),s=screen(p.x+p.nx*55,p.y+p.ny*55);
    ctx.fillStyle="#060f1b22";ctx.fillRect(s.x-4,s.y-2,8*zoom,2*zoom);
  }
  // finish line checkerboard
  const line=trackAt(FINISH);
  for(let j=-10;j<10;j++){
    const r0=j*ROAD_HALF/10,r1=(j+1)*ROAD_HALF/10;
    for(let k=0;k<2;k++){
      worldPolygon([
        [line.x+line.nx*r0+line.dx*(k?0:-13),line.y+line.ny*r0+line.dy*(k?0:-13)],
        [line.x+line.nx*r1+line.dx*(k?0:-13),line.y+line.ny*r1+line.dy*(k?0:-13)],
        [line.x+line.nx*r1+line.dx*(k?13:0),line.y+line.ny*r1+line.dy*(k?13:0)],
        [line.x+line.nx*r0+line.dx*(k?13:0),line.y+line.ny*r0+line.dy*(k?13:0)]
      ],(j+k)%2===0?"#eef0dd":"#161f2e");
    }
  }
  // trackside luminous beacon towers
  for(let i=0;i<14;i++){
    const p=trackAt(FINISH+i*TRACK_LENGTH/14),x=p.x+p.nx*(ROAD_HALF+42),y=p.y+p.ny*(ROAD_HALF+42),sp=screen(x,y);
    ctx.strokeStyle="#44f7e1aa";ctx.lineWidth=2*zoom;
    ctx.beginPath();ctx.moveTo(sp.x,sp.y);ctx.lineTo(sp.x,sp.y-29*zoom);ctx.stroke();
    ctx.fillStyle=i%2?"#ffe46c":(trackId===0?"#60e7e2":"#ffc783");ctx.beginPath();ctx.arc(sp.x,sp.y-31*zoom,3.5*zoom,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function drawPickups(t){
  for(const p of pickups){
    if(p.cooldown>0)continue;
    const s=screen(p.x,p.y,13+Math.sin(t*3+p.phase)*4),r=12*zoom;
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(t*1.7+p.phase);
    const color=p.kind==="repair"?"#7eefa3":p.kind==="ammo"?"#ffa96b":"#64d9ff";
    ctx.shadowColor=color;ctx.shadowBlur=15*zoom;
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r,0);ctx.lineTo(0,r);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle="#102a37";ctx.font="900 "+Math.round(13*zoom)+"px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(p.kind==="repair"?"＋":p.kind==="ammo"?"➤":"⚡",0,0);ctx.restore();
  }
}
function bodyPoint(car,f,r,z=0){
  const fx=Math.cos(car.angle),fy=Math.sin(car.angle),rx=-fy,ry=fx;
  return screen(car.x+fx*f+rx*r,car.y+fy*f+ry*r,z);
}
function carPolygon(car,coords,color){
  const pts=coords.map(p=>bodyPoint(car,p[0],p[1],p[2]||0));
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
function drawCar(car,t){
  const c=car.style,scale=zoom;
  const shadow=screen(car.x+9,car.y+12);
  ctx.save();ctx.fillStyle="#02060dc0";ctx.beginPath();ctx.ellipse(shadow.x,shadow.y,34*scale,13*scale,0,0,TAU);ctx.fill();
  if(car.boosting&&Math.abs(car.speed)>50){
    const p=bodyPoint(car,-38,0,5),q=bodyPoint(car,-64-Math.sin(t*27)*13,0,6);
    ctx.strokeStyle="#50e9ff";ctx.lineWidth=9*scale;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
    ctx.strokeStyle="#f7edac";ctx.lineWidth=3*scale;ctx.stroke();
  }
  for(const fx of [-20,21])for(const side of [-1,1]){
    carPolygon(car,[[fx-8,side*22,4],[fx+8,side*22,4],[fx+8,side*29,5],[fx-8,side*29,5]],"#0c1320");
  }
  carPolygon(car,[[-33,-19,9],[23,-19,9],[35,-11,9],[35,11,9],[23,19,9],[-33,19,9]],c.dark);
  carPolygon(car,[[-27,-17,14],[18,-17,14],[28,-9,14],[28,9,14],[18,17,14],[-27,17,14]],c.color);
  carPolygon(car,[[-13,-14,17],[6,-14,22],[11,-9,23],[11,9,23],[6,14,22],[-13,14,17]],"#15263a");
  carPolygon(car,[[-13,-13,18],[-9,-13,24],[-9,13,24],[-13,13,18]],"#bbf1ef");
  carPolygon(car,[[9,-10,23],[16,-8,18],[16,8,18],[9,10,23]],"#8fd0dd");
  carPolygon(car,[[-31,-18,17],[-26,-18,17],[-26,18,17],[-31,18,17]],c.accent);
  carPolygon(car,[[23,-15,16],[30,-10,16],[30,-5,16],[23,-9,16]],"#fff3c6");
  carPolygon(car,[[23,9,16],[30,5,16],[30,10,16],[23,15,16]],"#fff3c6");
  if(car.hitFlash>0)carPolygon(car,[[-30,-21,19],[24,-21,19],[32,0,19],[24,21,19],[-30,21,19]],"#ffffffaa");
  const name=bodyPoint(car,0,0,40);
  ctx.textAlign="center";ctx.font="800 "+Math.max(9,Math.round(11*zoom))+"px Inter,Arial";
  ctx.shadowColor="#030712";ctx.shadowBlur=5;ctx.fillStyle=car.isPlayer?"#fff3a5":"#e0e5f4";
  ctx.fillText(car.isPlayer?"YOU":car.name,name.x,name.y-2);
  ctx.restore();
}
function drawRockets(){
  for(const r of rockets){
    const p=screen(r.x,r.y,10),dx=Math.cos(r.angle)*8,dy=Math.sin(r.angle)*8;
    ctx.save();ctx.shadowBlur=15;ctx.shadowColor=r.isPlayer?"#fff05a":"#ff725d";
    ctx.fillStyle=r.isPlayer?"#f7e15a":"#ff7966";
    ctx.beginPath();ctx.arc(p.x,p.y,5*zoom,0,TAU);ctx.fill();
    ctx.strokeStyle=r.isPlayer?"#ffeeac":"#ffaf97";ctx.lineWidth=3*zoom;
    const back=screen(r.x-dx*3,r.y-dy*3,10);
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(back.x,back.y);ctx.stroke();ctx.restore();
  }
}
function drawParticles(){
  for(const p of particles){
    const sp=screen(p.x,p.y,p.z);
    ctx.globalAlpha=Math.max(0,p.life/p.max);
    ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(sp.x,sp.y,Math.max(.5,p.r*zoom),0,TAU);ctx.fill();
  }ctx.globalAlpha=1;
}
function draw(t){
  cameraIso=iso(cam.x,cam.y);
  drawBackdrop(t);drawTrack(t);drawPickups(t);
  const toRender=[player,...ais].filter(Boolean).sort((a,b)=>iso(a.x,a.y).y-iso(b.x,b.y).y);
  for(const car of toRender)drawCar(car,t);
  drawRockets();drawParticles();
}
function spawnFX(x,y,color,count=12){
  for(let i=0;i<count;i++){
    const angle=rnd()*TAU,speed=30+rnd()*145;
    particles.push({x,y,z:5,dx:Math.cos(angle)*speed,dy:Math.sin(angle)*speed,dz:25+rnd()*70,life:.35+rnd()*.45,max:.8,r:1.5+rnd()*4,color});
  }
  if(particles.length>160)particles.splice(0,particles.length-160);
}
function makeCar(s,lane,style,name,isPlayer=false){
  const p=trackAt(s);
  const enhanced=isPlayer?{...style,speed:style.speed*(1+progress.engine*.065),accel:style.accel*(1+progress.engine*.025),armor:style.armor+progress.armor*.19}:style;
  return {x:p.x+p.nx*lane,y:p.y+p.ny*lane,angle:Math.atan2(p.dy,p.dx),speed:0,progress:s,lastRaw:mod(s,TRACK_LENGTH),
    lane,style:enhanced,name,isPlayer,hp:100,maxNitro:isPlayer?100+progress.nitro*20:100,nitro:isPlayer?100+progress.nitro*20:100,ammo:5,fireCooldown:0,hitFlash:0,stun:0,boosting:false,finished:false};
}
function resetRace(){
  rockets=[];particles=[];elapsed=0;countdown=3.4;lastLap=1;shockCooldown=0;finishOrder=null;hudTicker=0;
  $("trackName").textContent=trackDefs[trackId].name+" // CIRCUIT "+String(trackId+1).padStart(2,"0");
  pickups.forEach(p=>p.cooldown=0);
  player=makeCar(300,5,specs[selected],specs[selected].name,true);
  const lanes=[-35,40,-20,46],starts=[490,445,400,355];
  const multipliers={easy:.80,normal:1,hard:1.12};
  const rates=[265,274,254,280],difficultyRate=multipliers[difficulty]||1;
  ais=rivals.map((r,i)=>{
    const a=makeCar(starts[i],lanes[i],r,r.name);
    a.cruise=rates[i]*difficultyRate;a.phase=i*1.8;a.attackTimer=3+rnd()*4;a.speed=a.cruise;
    return a;
  });
  cam.x=player.x;cam.y=player.y;
  setHud();drawMinimap();
}
function setMenu(){
  state="menu";$("menu").classList.remove("hidden");$("raceOverlay").classList.add("hidden");
  $("countdown").classList.add("hidden");$("hud").classList.add("hidden");$("controlsHint").classList.remove("hidden");
  $("pauseBtn").style.visibility="hidden";
  keys.clear();touch.clear();updateBest();refreshGarage();
}
function beginRace(){
  resetRace();state="countdown";$("menu").classList.add("hidden");$("raceOverlay").classList.add("hidden");
  $("hud").classList.remove("hidden");$("pauseBtn").style.visibility="visible";
  $("countdown").classList.remove("hidden");$("controlsHint").classList.remove("hidden");
  if(sound.enabled)sound.start();
}
function setToast(message){
  const el=$("eventToast");el.textContent=message;el.classList.add("visible");toastTimeout=1.6;
}
function updateProgress(){
  const n=closestTrack(player.x,player.y);
  let delta=n.s-player.lastRaw;
  if(delta>TRACK_LENGTH*.5)delta-=TRACK_LENGTH;
  if(delta<-TRACK_LENGTH*.5)delta+=TRACK_LENGTH;
  player.progress+=delta;player.lastRaw=n.s;
  const lap=clamp(Math.floor((player.progress-FINISH)/TRACK_LENGTH)+1,1,LAPS);
  if(lap>lastLap){lastLap=lap;setToast("TOUR "+lap+" / "+LAPS+" !");}
  if(player.progress>=FINISH+TRACK_LENGTH*LAPS){player.finished=true;endRace();}
  return n;
}
function updatePlayer(dt){
  const gas=pressed("gas"),brake=pressed("brake"),left=pressed("left"),right=pressed("right"),nitro=pressed("nitro");
  player.fireCooldown=Math.max(0,player.fireCooldown-dt);
  player.hitFlash=Math.max(0,player.hitFlash-dt);
  if(gas)player.speed+=player.style.accel*dt;
  else if(player.speed>0)player.speed=Math.max(0,player.speed-125*dt);
  else if(player.speed<0)player.speed=Math.min(0,player.speed+110*dt);
  if(brake)player.speed-=540*dt;
  let maxSpeed=player.style.speed;
  player.boosting=nitro&&player.nitro>0&&player.speed>65;
  if(player.boosting){maxSpeed*=1.46;player.nitro=Math.max(0,player.nitro-(29-progress.nitro*2)*dt);player.speed+=520*dt;
    if(rnd()<.37)spawnFX(player.x-Math.cos(player.angle)*35,player.y-Math.sin(player.angle)*35,"#60e8f7",1);
  }else{player.nitro=Math.min(player.maxNitro,player.nitro+(7+progress.nitro*2)*dt);}
  player.speed=clamp(player.speed,-95,maxSpeed);
  const steer=(right?1:0)-(left?1:0);
  if(steer!==0&&Math.abs(player.speed)>12){
    const turn=player.style.steering*(.38+.67*Math.min(1,Math.abs(player.speed)/270));
    player.angle+=steer*turn*dt*(player.speed<0?-1:1);
    if(Math.abs(player.speed)>260)player.speed*=1-.06*dt;
  }
  player.x+=Math.cos(player.angle)*player.speed*dt;
  player.y+=Math.sin(player.angle)*player.speed*dt;
  const closest=updateProgress();
  if(closest.dist>ROAD_HALF-17){
    const dx=player.x-closest.x,dy=player.y-closest.y,len=Math.max(1,closest.dist);
    player.x=closest.x+dx/len*(ROAD_HALF-17);
    player.y=closest.y+dy/len*(ROAD_HALF-17);
    if(Math.abs(player.speed)>90&&shockCooldown<=0){spawnFX(player.x,player.y,"#f8bc68",9);player.hp=Math.max(0,player.hp-4/player.style.armor);shockCooldown=.5;}
    player.speed*=.81;
  }
  for(const ai of ais){
    if(hypot(player.x-ai.x,player.y-ai.y)<44){
      const angle=Math.atan2(player.y-ai.y,player.x-ai.x);
      player.x+=Math.cos(angle)*150*dt;player.y+=Math.sin(angle)*150*dt;
      player.speed*=.97;
      if(shockCooldown<=0){player.hp=Math.max(0,player.hp-5/player.style.armor);shockCooldown=.65;spawnFX(player.x,player.y,"#f8bb66",9);}
    }
  }
  if(pressed("fire"))shoot(player);
  if(player.hp<=0){player.hp=0;endRace(true);}
}
function updateAI(dt){
  for(const a of ais){
    if(a.finished)continue;
    a.hitFlash=Math.max(0,a.hitFlash-dt);a.stun=Math.max(0,a.stun-dt);
    a.attackTimer-=dt;
    const pace=a.cruise*(a.stun>0?.52:1)*(1+Math.sin(elapsed*.34+a.phase)*.023);
    a.speed=pace;a.progress+=pace*dt;
    const p=trackAt(a.progress),lane=a.lane+Math.sin(elapsed*.5+a.phase)*9;
    a.x=p.x+p.nx*lane;a.y=p.y+p.ny*lane;a.angle=Math.atan2(p.dy,p.dx);
    a.boosting=a.stun<=0&&Math.sin(elapsed*.34+a.phase)>0.97;
    if(a.progress>=FINISH+TRACK_LENGTH*LAPS){a.finished=true;if(finishOrder===null)finishOrder=a.name;}
    if(a.attackTimer<=0&&hypot(player.x-a.x,player.y-a.y)<430&&state==="race"){
      if(Math.random()<.7)shoot(a);
      a.attackTimer=3.8+rnd()*3.4;
    }
  }
}
function targetFor(owner){
  const enemies=owner.isPlayer?ais:[player];
  let target=null,best=Infinity;
  for(const e of enemies){
    if(e.finished)continue;
    const dx=e.x-owner.x,dy=e.y-owner.y,d=hypot(dx,dy),f=dx*Math.cos(owner.angle)+dy*Math.sin(owner.angle);
    if(d<540&&d<best&&(owner.isPlayer?f/d>.03:true)){target=e;best=d;}
  }
  return target;
}
function shoot(owner){
  if(owner.fireCooldown>0)return;
  if(owner.isPlayer&&owner.ammo<=0){owner.fireCooldown=.35;setToast("PLUS DE MISSILES !");return;}
  owner.fireCooldown=owner.isPlayer?.42:1.3;
  if(owner.isPlayer){owner.ammo--;sound.effect("fire");}
  const t=targetFor(owner),angle=t?Math.atan2(t.y-owner.y,t.x-owner.x):owner.angle;
  rockets.push({x:owner.x+Math.cos(angle)*38,y:owner.y+Math.sin(angle)*38,angle,ttl:1.35,isPlayer:owner.isPlayer,owner,target:t});
}
function rotateToward(a,b,max){
  let d=mod(b-a+Math.PI,TAU)-Math.PI;
  return a+clamp(d,-max,max);
}
function updateRockets(dt){
  for(let i=rockets.length-1;i>=0;i--){
    const r=rockets[i];r.ttl-=dt;
    if(r.target&&!r.target.finished&&r.target.hp>0){
      const desired=Math.atan2(r.target.y-r.y,r.target.x-r.x);
      r.angle=rotateToward(r.angle,desired,3.2*dt);
    }
    const mx=Math.cos(r.angle),my=Math.sin(r.angle);
    r.x+=mx*670*dt;r.y+=my*670*dt;
    let hit=null;
    for(const c of r.isPlayer?ais:[player]){
      if(c===r.owner||c.finished)continue;
      if(hypot(r.x-c.x,r.y-c.y)<40){hit=c;break;}
    }
    if(hit){
      spawnFX(hit.x,hit.y,r.isPlayer?"#f8dc69":"#f77d65",24);hit.hitFlash=.24;
      if(hit.isPlayer){hit.hp=Math.max(0,hit.hp-23/hit.style.armor);hit.speed*=.72;setToast("TOUCHÉ !");sound.effect("hit");}
      else{hit.stun=2.2;if(r.isPlayer)setToast("IMPACT !");}
    }
    if(hit||r.ttl<=0)rockets.splice(i,1);
  }
}
function updatePickups(dt){
  for(const p of pickups){
    if(p.cooldown>0){p.cooldown=Math.max(0,p.cooldown-dt);continue;}
    if(hypot(player.x-p.x,player.y-p.y)<41){
      p.cooldown=19;spawnFX(p.x,p.y,"#85f8e7",13);
      if(p.kind==="repair"){player.hp=clamp(player.hp+30,0,100);setToast("RÉPARATION +30");}
      if(p.kind==="ammo"){player.ammo=Math.min(12,player.ammo+3);setToast("MISSILES +3");}
      if(p.kind==="nitro"){player.nitro=clamp(player.nitro+40,0,player.maxNitro);setToast("NITRO +40");}
      sound.effect("pickup");
    }
  }
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.dx*dt;p.y+=p.dy*dt;p.z+=p.dz*dt;p.dz-=210*dt;p.life-=dt;
    if(p.life<=0)particles.splice(i,1);
  }
}
function update(dt){
  if(state==="countdown"){
    countdown-=dt;
    if(countdown>0){$("countdown").textContent=Math.ceil(countdown);$("countdown").classList.remove("hidden");}
    else{state="race";$("countdown").classList.add("hidden");setToast("GO !");sound.effect("go");}
  }else if(state==="race"){
    elapsed+=dt;shockCooldown=Math.max(0,shockCooldown-dt);
    updatePlayer(dt);
    if(state==="race"){updateAI(dt);updateRockets(dt);updatePickups(dt);}
    if(toastTimeout>0){toastTimeout-=dt;if(toastTimeout<=0)$("eventToast").classList.remove("visible");}
    hudTicker-=dt;if(hudTicker<=0){hudTicker=.09;setHud();drawMinimap();}
  }
  updateParticles(dt);
  if(player){cam.x+=((player.x+Math.cos(player.angle)*90)-cam.x)*Math.min(1,dt*4.8);
             cam.y+=((player.y+Math.sin(player.angle)*90)-cam.y)*Math.min(1,dt*4.8);}
}
function position(){return 1+ais.filter(a=>a.progress>player.progress).length;}
function formatTime(s){
  const m=Math.floor(s/60),sec=Math.floor(s%60),tenth=Math.floor(s*10)%10;
  return String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")+"."+tenth;
}
function setHud(){
  if(!player)return;
  $("position").textContent=position();$("lap").textContent=clamp(Math.floor((player.progress-FINISH)/TRACK_LENGTH)+1,1,LAPS);
  $("timer").textContent=formatTime(elapsed);$("ammo").textContent=player.ammo;
  $("speed").textContent=Math.floor(Math.abs(player.speed)*.70);
  $("hpLabel").textContent=Math.round(player.hp)+"%";$("nitroLabel").textContent=Math.round(player.nitro/player.maxNitro*100)+"%";
  $("hpFill").style.width=player.hp+"%";$("nitroFill").style.width=player.nitro/player.maxNitro*100+"%";
}
function drawMinimap(){
  const w=mapCanvas.width,h=mapCanvas.height;
  mctx.clearRect(0,0,w,h);mctx.fillStyle="#091623";mctx.fillRect(0,0,w,h);
  const conv=(x,y)=>({x:9+(x-bounds.minX)/(bounds.maxX-bounds.minX)*(w-18),y:8+(y-bounds.minY)/(bounds.maxY-bounds.minY)*(h-16)});
  mctx.beginPath();points.forEach((p,i)=>{const s=conv(p.x,p.y);i?mctx.lineTo(s.x,s.y):mctx.moveTo(s.x,s.y);});
  mctx.closePath();mctx.strokeStyle="#536778";mctx.lineWidth=10;mctx.lineJoin="round";mctx.stroke();
  mctx.strokeStyle="#d0cfc1";mctx.lineWidth=2;mctx.stroke();
  for(const ai of ais){const s=conv(ai.x,ai.y);mctx.fillStyle=ai.style.color;mctx.beginPath();mctx.arc(s.x,s.y,4,0,TAU);mctx.fill();}
  if(player){const s=conv(player.x,player.y);mctx.fillStyle="#fbe763";mctx.beginPath();mctx.arc(s.x,s.y,5.7,0,TAU);mctx.fill();mctx.strokeStyle="#0a0a0a";mctx.lineWidth=1;mctx.stroke();}
  mctx.fillStyle="#d0dcec";mctx.font="bold 10px Arial";mctx.fillText("CIRCUIT "+String(trackId+1).padStart(2,"0"),8,12);
}
function endRace(destroyed=false){
  if(state!=="race")return;
  state="finish";sound.effect(destroyed?"hit":"finish");
  const rank=position(),title=destroyed?"ÉLIMINÉ !":rank===1?"VICTOIRE !":"ARRIVÉE !";
  const prize=destroyed?75:[450,360,290,230,180][rank-1];
  progress.credits+=prize;saveProgress();
  $("dialogEyebrow").textContent=destroyed?"TON BOLIDE EST HORS COURSE":"COURSE TERMINÉE";
  $("dialogTitle").textContent=title;
  $("dialogDetail").textContent=destroyed?"Retente ta chance et améliore ton bolide au garage.":"Retourne au garage pour améliorer ton bolide.";
  $("resultStats").innerHTML='<div class="result-grid"><div><span>POSITION</span><b>'+rank+' / 5</b></div><div><span>TEMPS</span><b>'+formatTime(elapsed)+'</b></div><div><span>GAIN</span><b>+'+prize+' CR</b></div></div>';
  $("resumeBtn").classList.add("hidden");$("againBtn").classList.remove("hidden");
  $("raceOverlay").classList.remove("hidden");
  if(!destroyed){
    const key="loubkarting_best_v2_"+trackId;
    try{const old=Number(localStorage.getItem(key)||0);if(!old||elapsed<old)localStorage.setItem(key,String(elapsed));}catch(e){}
  }
}
function updateBest(){
  let best=0;try{
    best=Number(localStorage.getItem("loubkarting_best_v2_"+trackId)||0);
    if(!best&&trackId===0)best=Number(localStorage.getItem("loubkarting_best_v1")||0);
  }catch(e){}
  $("bestTime").textContent=best>0?formatTime(best):"--:--.-";
}
function pause(){
  if(state==="race"||state==="countdown"){
    window._lkWasCountdown=state==="countdown";state="paused";
    $("dialogEyebrow").textContent="COURSE INTERROMPUE";
    $("dialogTitle").textContent="PAUSE";
    $("dialogDetail").textContent="Prêt à reprendre la bataille ?";
    $("resultStats").innerHTML="";
    $("resumeBtn").classList.remove("hidden");$("againBtn").classList.add("hidden");
    $("raceOverlay").classList.remove("hidden");$("countdown").classList.add("hidden");
    keys.clear();touch.clear();
  }else if(state==="paused"){
    state=window._lkWasCountdown?"countdown":"race";$("raceOverlay").classList.add("hidden");
  }
}
function pressed(name){return keys.has(name)||touch.has(name);}
const keyMap={ArrowUp:"gas",KeyW:"gas",KeyZ:"gas",ArrowDown:"brake",KeyS:"brake",ArrowLeft:"left",KeyA:"left",KeyQ:"left",ArrowRight:"right",KeyD:"right",Space:"fire",KeyJ:"fire",ShiftLeft:"nitro",ShiftRight:"nitro",KeyK:"nitro"};
document.addEventListener("keydown",e=>{
  if(keyMap[e.code]){e.preventDefault();keys.add(keyMap[e.code]);}
  if(e.repeat)return;
  if(e.code==="KeyP"||e.code==="Escape"){e.preventDefault();pause();}
  if(e.code==="KeyR"&&state!=="menu"){e.preventDefault();beginRace();}
  if(e.code==="Enter"&&state==="menu"){e.preventDefault();beginRace();}
});
document.addEventListener("keyup",e=>{if(keyMap[e.code]){e.preventDefault();keys.delete(keyMap[e.code]);}});
window.addEventListener("blur",()=>{keys.clear();touch.clear();if(state==="race")pause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state==="race")pause();});
document.querySelectorAll("[data-control]").forEach(btn=>{
  const c=btn.dataset.control;
  btn.addEventListener("pointerdown",e=>{e.preventDefault();touch.add(c);btn.classList.add("pressed");try{btn.setPointerCapture(e.pointerId);}catch(ex){}});
  const up=e=>{e.preventDefault();touch.delete(c);btn.classList.remove("pressed");};
  btn.addEventListener("pointerup",up);btn.addEventListener("pointercancel",up);btn.addEventListener("lostpointercapture",up);
});
document.querySelectorAll("[data-car]").forEach(btn=>btn.addEventListener("click",()=>{
  selected=Number(btn.dataset.car);
  document.querySelectorAll("[data-car]").forEach(b=>b.classList.toggle("active",b===btn));
  if(state==="menu"){player=makeCar(300,0,specs[selected],"YOU",true);}
}));

document.querySelectorAll("[data-track]").forEach(btn=>btn.addEventListener("click",()=>{
  const id=Number(btn.dataset.track);
  if(!Number.isInteger(id)||id<0||id>=trackDefs.length)return;
  rebuildTrack(id);progress.track=id;saveProgress();
  document.querySelectorAll("[data-track]").forEach(b=>b.classList.toggle("active",b===btn));
  $("garageFeedback").textContent="";
  resetRace();updateBest();
}));
document.querySelectorAll("[data-upgrade]").forEach(btn=>btn.addEventListener("click",()=>buyUpgrade(btn.dataset.upgrade)));
$("difficulty").addEventListener("change",e=>difficulty=e.target.value);
$("startBtn").addEventListener("click",beginRace);
$("againBtn").addEventListener("click",beginRace);
$("resumeBtn").addEventListener("click",pause);
$("menuBtn").addEventListener("click",()=>{resetRace();setMenu();});
$("pauseBtn").addEventListener("click",pause);
$("pauseBtn").style.visibility="hidden";

const sound={
  enabled:false,ctx:null,interval:null,step:0,
  setup(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return false;
    if(!this.ctx)this.ctx=new Audio();
    if(this.ctx.state==="suspended")this.ctx.resume();
    return true;
  },
  tone(freq,duration,type="sawtooth",vol=.025,when=0){
    if(!this.ctx||!this.enabled)return;
    const t=this.ctx.currentTime+when,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(freq,t);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),t+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+duration+.02);
  },
  start(){
    if(!this.enabled||!this.setup()||this.interval)return;
    const notes=[82.41,82.41,110,82.41,123.47,110,98,73.42,82.41,82.41,146.83,123.47,110,98,73.42,61.74];
    this.interval=setInterval(()=>{
      if(state!=="race"&&state!=="countdown")return;
      const f=notes[this.step%notes.length],n=this.step++;
      this.tone(f,.18,"sawtooth",.021);
      if(n%2===0)this.tone(f*2,.09,"square",.008);
      if(n%4===0)this.tone(55,.13,"triangle",.037);
    },200);
  },
  effect(kind){
    if(!this.enabled||!this.setup())return;
    if(kind==="fire"){this.tone(210,.09,"sawtooth",.04);this.tone(93,.15,"square",.018,.07);}
    if(kind==="hit"){this.tone(62,.26,"sawtooth",.052);}
    if(kind==="pickup"){this.tone(440,.1,"triangle",.042);this.tone(660,.16,"triangle",.028,.09);}
    if(kind==="go"||kind==="finish"){this.tone(330,.15,"square",.023);this.tone(440,.13,"square",.026,.16);this.tone(660,.32,"sawtooth",.024,.32);}
  },
  toggle(){
    this.enabled=!this.enabled;
    $("soundText").textContent=this.enabled?"ON":"OFF";
    if(this.enabled)this.start();
    else{if(this.interval){clearInterval(this.interval);this.interval=null;}if(this.ctx)this.ctx.suspend();}
  }
};
$("soundBtn").addEventListener("click",()=>sound.toggle());

function frame(now){
  const dt=Math.min(.036,Math.max(0,(now-lastTime)/1000||0));lastTime=now;
  update(dt);draw(now/1000);requestAnimationFrame(frame);
}
document.querySelectorAll("[data-track]").forEach(btn=>btn.classList.toggle("active",Number(btn.dataset.track)===trackId));
resetRace();setMenu();requestAnimationFrame(frame);
})();
