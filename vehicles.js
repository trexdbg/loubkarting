(function(global){
"use strict";
/* LoubKarting vehicle studio — lightweight hand-built 3D polygon meshes.
   Shared by the in-race isometric view and all showroom canvases. */
const MODELS={
 city:{rear:-35,front:34,half:20,body:17,roof:35,roofRear:-17,roofFront:8,glassRear:-27,glassFront:18,wheelRear:-23,wheelFront:20,wheel:9},
 rs:{rear:-39,front:39,half:22,body:16,roof:31,roofRear:-12,roofFront:9,glassRear:-25,glassFront:20,wheelRear:-25,wheelFront:26,wheel:10,spoiler:31},
 rally:{rear:-43,front:43,half:23,body:19,roof:37,roofRear:-14,roofFront:12,glassRear:-27,glassFront:23,wheelRear:-28,wheelFront:28,wheel:11,spoiler:43},
 gt:{rear:-48,front:49,half:23,body:14,roof:27,roofRear:-14,roofFront:12,glassRear:-35,glassFront:28,wheelRear:-32,wheelFront:31,wheel:11,spoiler:33},
 formula:{rear:-51,front:57,half:13,body:10,roof:21,roofRear:-15,roofFront:5,glassRear:-19,glassFront:15,wheelRear:-33,wheelFront:31,wheel:12,spoiler:34}
};
const ccache=Object.create(null);
function shade(hex,amount){
 const key=hex+":"+amount;
 if(ccache[key])return ccache[key];
 if(!/^#[0-9a-f]{6}$/i.test(hex))return hex;
 const factor=1+amount;
 const n=[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*factor))));
 return ccache[key]="#"+n.map(x=>x.toString(16).padStart(2,"0")).join("");
}
function draw(ctx,options){
 const {project,zoom=1,type="city",color="#e9e5d6",dark="#4e6476",accent="#ffe7a5",boosting=false,hitFlash=0}=options;
 const m=MODELS[type]||MODELS.city;
 const F=m.front,R=m.rear,W=m.half,B=m.body;
 function poly(vertices,paint,line){
   if(!vertices||vertices.length<3)return;
   ctx.beginPath();vertices.forEach((v,i)=>{const p=project(v[0],v[1],v[2]);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});
   ctx.closePath();ctx.fillStyle=paint;ctx.fill();
   if(line){ctx.strokeStyle=line;ctx.lineWidth=Math.max(.45,.55*zoom);ctx.lineJoin="round";ctx.stroke();}
 }
 function strip(a,b,c,d,paint){poly([a,b,c,d],paint);}
 function line(a,b,paint,width=1){
   const p=project(...a),q=project(...b);
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.lineWidth=Math.max(.6,width*zoom);ctx.strokeStyle=paint;ctx.stroke();
 }
 function roundedShadow(){
   const pts=[];for(let i=0;i<24;i++){
     const a=i*Math.PI/12;pts.push([Math.cos(a)*(Math.abs(F-R)*.59)+3,Math.sin(a)*(W+12),.5]);
   }
   poly(pts,"#02070e88");
   const glow=[];for(let i=0;i<24;i++){
     const a=i*Math.PI/12;glow.push([Math.cos(a)*(Math.abs(F-R)*.47),Math.sin(a)*(W+7),.8]);
   }
   poly(glow,type==="formula"?"#63e7dd15":"#f9c96d10");
 }
 function wheel(f,side){
   const sign=side,wy=side*(W+(type==="formula"?10:4)),wr=m.wheel;
   const rw=type==="formula"?8:7,low=3,high=wr+6;
   const x0=f-wr,x1=f+wr,y0=wy-rw,y1=wy+rw;
   // Deep rubber sidewalls, broad exposed top tread and metallic hubs.
   poly([[x0,y0,low],[x1,y0,low],[x1,y0,high],[x0,y0,high]],"#080d16");
   poly([[x0,y1,low],[x1,y1,low],[x1,y1,high],[x0,y1,high]],"#0b111b");
   poly([[x0,y0,high],[x1,y0,high],[x1,y1,high],[x0,y1,high]],"#17212c","#030810");
   strip([f-3,y0,high+.3],[f+3,y0,high+.3],[f+3,y1,high+.3],[f-3,y1,high+.3],"#303b48");
   const out=wy+sign*(rw+.4),inner=wy+sign*(rw+.7);
   poly([[f-5,out,low+3],[f+5,out,low+3],[f+6,out,high-3],[f-6,out,high-3]],"#4b5a67");
   poly([[f-3,inner,low+5],[f+3,inner,low+5],[f+4,inner,high-5],[f-4,inner,high-5]],"#9ba9af");
   line([f,inner,low+6],[f,inner,high-6],"#273544",1.1);
 }
 roundedShadow();
 if(boosting){
   const phase=(options.time||0)*31;
   const length=16+6*Math.sin(phase);
   for(const side of type==="formula"?[-4,4]:[-9,9]){
     poly([[R-4,side-3,11],[R-4,side+3,11],[R-length,side,9]],"#39dffa9c");
     poly([[R-5,side-1.5,12],[R-5,side+1.5,12],[R-length*.68,side,11]],"#fdf8b3df");
   }
 }
 // The four fully articulated-looking tyres stay visible outside each bodyshell.
 for(const f of [m.wheelRear,m.wheelFront])for(const side of [-1,1])wheel(f,side);
 if(type==="formula"){
   // Formula car: exposed suspension, narrow nose, carbon sidepods and raised aero.
   poly([[R+5,-15,8],[7,-12,9],[F-7,-5,8],[F,-3,7],[F,3,7],[F-7,5,8],[7,12,9],[R+5,15,8]],dark);
   poly([[R+6,-10,11],[-15,-12,13],[10,-6,13],[F-6,-3,10],[F,0,9],[F-6,3,10],[10,6,13],[-15,12,13],[R+6,10,11]],color,"#192b37");
   poly([[-25,-19,10],[-2,-20,10],[8,-12,14],[-24,-12,14]],shade(color,-.16));
   poly([[-25,19,10],[-2,20,10],[8,12,14],[-24,12,14]],shade(color,-.25));
   poly([[6,-3,15],[F-2,-2,12],[F,0,11],[F-2,2,12],[6,3,15]],accent);
   poly([[-26,-9,18],[-10,-10,18],[8,-6,17],[12,0,17],[8,6,17],[-10,10,18],[-26,9,18]],"#102739");
   poly([[-20,-5,19],[-9,-6,19],[-3,0,22],[-9,6,19],[-20,5,19]],"#294c5b");
   poly([[-9,-7,23],[0,-5,23],[6,0,25],[0,5,23],[-9,7,23]],"#070f1a");
   // Sculpted halo safety bar and suspended air intake.
   line([-14,-7,25],[-7,0,29],shade(color,.45),2.9);
   line([-7,0,29],[-14,7,25],shade(color,.45),2.9);
   line([-7,0,29],[2,0,24],"#1a293b",2.2);
   poly([[F-13,-30,8],[F-5,-30,8],[F-5,30,8],[F-13,30,8]],"#1c2c3b");
   poly([[F-12,-29,10],[F-7,-29,10],[F-7,29,10],[F-12,29,10]],accent);
   for(const side of [-1,1]){
     poly([[F-15,side*29,5],[F-3,side*29,5],[F-3,side*32,15],[F-15,side*32,15]],"#142332");
     line([m.wheelFront-13,side*12,11],[m.wheelFront,side*(W+7),8],"#a6b8be",1.8);
   }
   for(const side of [-1,1])poly([[R+3,side*13,11],[R+8,side*13,11],[R+8,side*13,31],[R+3,side*13,31]],"#202a36");
   poly([[R-3,-30,30],[R+5,-30,30],[R+5,30,30],[R-3,30,30]],dark);
   poly([[R-3,-30,34],[R+4,-30,34],[R+4,30,34],[R-3,30,34]],accent);
   poly([[R-4,-32,26],[R+5,-32,26],[R+5,-32,37],[R-4,-32,37]],"#182331");
   poly([[R-4,32,26],[R+5,32,26],[R+5,32,37],[R-4,32,37]],"#182331");
 }else{
   // Three-dimensional chassis with a genuinely different hard-surface profile per class.
   const nose=type==="gt"?11:type==="city"?8:6;
   const shoulder=type==="gt"?4:0;
   const foot=[[R,-W*.77],[R+6,-W],[F-nose,-W+shoulder],[F,-W*.61],[F,W*.61],[F-nose,W-shoulder],[R+6,W],[R,W*.77]];
   const sideFaces=[];
   for(let i=0;i<foot.length;i++){
     const j=(i+1)%foot.length,a=foot[i],b=foot[j];
     const face=[[a[0],a[1],6],[b[0],b[1],6],[b[0],b[1],B],[a[0],a[1],B]];
     const cy=(project(a[0],a[1],6).y+project(b[0],b[1],6).y)*.5;
     sideFaces.push({face,cy,idx:i});
   }
   sideFaces.sort((a,b)=>a.cy-b.cy);
   for(const part of sideFaces){
     const tone=part.idx===2||part.idx===3||part.idx===4?-.28:-.42;
     poly(part.face,shade(color,tone),"#16233189");
   }
   poly(foot.map(p=>[p[0],p[1],B]),shade(color,.07),"#11213180");
   // Side sills and wheel arches; coloured racing belt follows the shoulder.
   for(const side of [-1,1]){
     const edge=side*W;
     poly([[R+9,edge,9],[F-13,edge,9],[F-10,edge,B-3],[R+9,edge,B-3]],shade(dark,-.25));
     strip([R+9,edge*1.003,B-4],[F-13,edge*.99,B-4],[F-13,edge*.99,B-2],[R+9,edge*1.003,B-2],accent);
   }
   const canopyHalf=W*(type==="city"?.78:type==="rally"?.77:type==="gt"?.70:.73);
   const roofHalf=W*(type==="city"?.68:type==="rally"?.64:.62);
   const r0=m.glassRear,r1=m.roofRear,r2=m.roofFront,r3=m.glassFront,z=m.roof;
   // Metallic buttresses supporting the cabin.
   poly([[r0,-canopyHalf,B],[r1,-roofHalf,z],[r2,-roofHalf,z],[r3,-canopyHalf,B]],shade(color,-.21));
   poly([[r0,canopyHalf,B],[r1,roofHalf,z],[r2,roofHalf,z],[r3,canopyHalf,B]],shade(color,-.36));
   // Dark smoked rear glass, panoramic windshield, and side glass.
   poly([[r0,-canopyHalf,B+1],[r1,-roofHalf,z-1],[r1,roofHalf,z-1],[r0,canopyHalf,B+1]],"#122b3b");
   poly([[r2,-roofHalf,z-1],[r3,-canopyHalf,B+1],[r3,canopyHalf,B+1],[r2,roofHalf,z-1]],"#17394b");
   for(const side of [-1,1]){
     const glassY=side*(roofHalf-1),lowY=side*(canopyHalf-.8);
     poly([[r0+2,lowY,B+1],[r1+2,glassY,z-2],[r2-2,glassY,z-2],[r3-3,lowY,B+1]],"#1c3b4d");
     // Individual A/B/C pillars, with a thin blue reflection.
     line([r1+1,glassY,z-1],[r0+1,lowY,B+1],shade(color,-.10),1.7);
     line([r2-1,glassY,z-1],[r3-2,lowY,B+1],shade(color,-.10),2.1);
     if(type==="city"||type==="rally")line([r1+(r2-r1)*.44,glassY,z-1],[r0+(r3-r0)*.44,lowY,B+1],"#b3c8d755",1.2);
   }
   poly([[r1,-roofHalf,z],[r2,-roofHalf,z],[r2,roofHalf,z],[r1,roofHalf,z]],shade(color,.24),"#ccecf535");
   poly([[r2-2,-roofHalf+3,z+.15],[r3-7,-canopyHalf+3,B+1.3],[r3-13,-canopyHalf+8,B+1.4],[r2-7,-roofHalf+8,z+.2]],"#aeeff344");
   poly([[r1+3,-roofHalf+3,z+.15],[r2-2,-roofHalf+3,z+.15],[r2-2,-roofHalf+5,z+.15],[r1+3,-roofHalf+5,z+.15]],"#ffffff5c");
   // Front hood facets and rear deck.
   poly([[r3,-W*.65,B+.2],[F-nose,-W*.68,B+.7],[F-3,-W*.47,B+.3],[F-3,W*.47,B+.3],[F-nose,W*.68,B+.7],[r3,W*.65,B+.2]],shade(color,.21));
   poly([[R+4,-W*.7,B+.2],[r0,-canopyHalf,B+.25],[r0,canopyHalf,B+.25],[R+4,W*.7,B+.2]],shade(color,.10));
   for(const side of [-1,1]){
     // Mirror blocks and front air intakes are physical 3D parts.
     poly([[r3-2,side*(W*.76),B+1],[r3+3,side*(W+1),B+2],[r3-2,side*(W+3),B+4],[r3-7,side*(W*.76),B+3]],"#182b3b");
     poly([[F-5,side*(W*.55),B-5],[F-.8,side*(W*.43),B-5],[F-.8,side*(W*.25),B-5],[F-5,side*(W*.40),B-5]],"#152537");
   }
   // Sharply modelled headlamp assemblies, grille and rear LED clusters.
   poly([[F-3,-W*.38,B-3],[F,-W*.34,B-3],[F,W*.34,B-3],[F-3,W*.38,B-3]],"#101820");
   for(const side of [-1,1]){
     const a=side*W*.78,b=side*W*.43;
     poly([[F-nose+1,a,B+.18],[F-2,b,B+.20],[F-4,b,B-3],[F-nose-1,a,B-2]],type==="gt"?"#9ce7fd":"#fff3ba");
     poly([[R+.7,side*W*.70,B-2],[R+4,side*W*.47,B-2],[R+4,side*W*.47,B+1],[R+.7,side*W*.70,B+1]],"#ff5d63");
   }
   // Race-inspired aero details differentiating each model beyond paint.
   if(type==="city"){
     poly([[F-19,-6,B+.5],[F-11,-6,B+.5],[F-11,6,B+.5],[F-19,6,B+.5]],shade(color,-.16));
     for(const side of [-1,1])strip([R+2,side*(W*.78),B+.5],[R+2,side*(W*.42),B+.5],[R+5,side*(W*.42),B+.5],[R+5,side*(W*.78),B+.5],accent);
     poly([[R-2,-W*.86,B],[R+4,-W*.86,B],[R+4,W*.86,B],[R-2,W*.86,B]],shade(dark,-.12));
   }else if(type==="rs"){
     for(const side of [-1,1])poly([[F-24,side*W*.50,B+1],[F-10,side*W*.42,B+1],[F-8,side*W*.27,B+1],[F-22,side*W*.34,B+1]],shade(dark,-.22));
     strip([R+3,-W*.96,B+1],[R+7,-W*.96,B+1],[R+7,W*.96,B+1],[R+3,W*.96,B+1],shade(dark,-.25));
   }else if(type==="rally"){
     poly([[F-25,-9,B+2],[F-13,-9,B+3],[F-10,9,B+3],[F-25,9,B+2]],shade(dark,-.35));
     poly([[F-21,-6,B+3],[F-16,-6,B+5],[F-16,6,B+5],[F-21,6,B+3]],"#132334");
     strip([r1+4,-7,z+.4],[r2-3,-7,z+.4],[r2-3,7,z+.4],[r1+4,7,z+.4],accent);
     for(const side of [-1,1]){
       poly([[F-4,side*W*.35,B+3],[F-1,side*W*.35,B+3],[F-1,side*W*.61,B+3],[F-4,side*W*.61,B+3]],"#ffedd0");
     }
   }else if(type==="gt"){
     for(const side of [-1,1]){
       poly([[R+13,side*(W*.88),B+.5],[R+26,side*(W*.72),B+.5],[R+27,side*(W*.49),B+.5],[R+14,side*(W*.61),B+.5]],"#0d2b3e");
       poly([[F-17,side*W*.59,B+1.3],[F-7,side*W*.45,B+1.3],[F-8,side*W*.32,B+1.3],[F-18,side*W*.38,B+1.3]],accent);
     }
     poly([[R,-W*.84,B-3],[R+5,-W*.84,B-3],[R+5,W*.84,B-3],[R,W*.84,B-3]],"#182332");
   }
   if(m.spoiler){
     const q=R+4,h=m.spoiler,width=W+(type==="rally"?8:5);
     for(const side of [-1,1])poly([[q-2,side*(W*.69),B],[q+1,side*(W*.69),B],[q+1,side*(W*.69),h],[q-2,side*(W*.69),h]],shade(dark,-.15));
     poly([[q-8,-width,h-3],[q+3,-width,h-3],[q+3,width,h-3],[q-8,width,h-3]],shade(dark,-.27));
     poly([[q-8,-width,h],[q+3,-width,h],[q+3,width,h],[q-8,width,h]],type==="rally"?"#eef2e5":shade(color,-.18));
     for(const side of [-1,1])poly([[q-8,side*width,h-7],[q+3,side*width,h-7],[q+3,side*width,h+2],[q-8,side*width,h+2]],"#142536");
   }
 }
 if(hitFlash>0){
   const intensity=Math.min(.65,hitFlash*.8);
   ctx.save();ctx.globalAlpha=intensity;
   poly([[R,-W,B+2],[F-8,-W,B+2],[F,0,B+2],[F-8,W,B+2],[R,W,B+2]],"#ffffff");
   ctx.restore();
 }
}
function preview(canvas,spec,opts={}){
 if(!canvas||!spec)return;
 const rect=canvas.getBoundingClientRect();
 const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
 if(w<2||h<2)return;
 const dpr=Math.min(2,global.devicePixelRatio||1);
 const rw=Math.round(w*dpr),rh=Math.round(h*dpr);
 if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;}
 const ctx=canvas.getContext("2d");
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const tiny=!!opts.tiny,type=spec.bodyType||"city";
 const scale=Math.min(w/(tiny?135:146),h/(tiny?100:91))*(tiny?1.08:1.06);
 const angle=(opts.angle??-.36),co=Math.cos(angle),si=Math.sin(angle);
 const cx=w*(tiny?.51:.50),cy=h*(tiny?.68:.68);
 function project(f,r,z){
   const x=f*co-r*si,y=f*si+r*co;
   return {x:cx+(x-y)*.70710678*scale,y:cy+(x+y)*.397*scale-z*scale};
 }
 draw(ctx,{project,zoom:Math.max(.45,scale*.85),type,color:spec.color,dark:spec.dark,accent:spec.accent,time:opts.time||0});
}
global.LKVehicleRenderer={draw,preview,MODELS};
})(window);
