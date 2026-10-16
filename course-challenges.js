/* LOUBKARTING — handcrafted hazards, no dependencies or external assets.
 * Distances are proportional to each existing track, preserving career save keys.
 */
(function (root) {
  "use strict";
  const catalog = [
    {
      name:"LES GORGES ROUGES",
      tagline:"Ravins, éboulis et premier saut optionnel",
      signature:"L'épingle au-dessus du vide",
      features:[
        {type:"oil",at:.17,length:92,lane:-35,width:80},
        {type:"bridge",at:.34,length:155,width:63},
        {type:"rock",at:.48,length:38,lane:48,width:45},
        {type:"ramp",at:.635,length:44,lane:-48,width:72},
        {type:"gap",at:.657,length:76,lane:-49,width:106},
        {type:"oil",at:.86,length:65,lane:46,width:70}
      ]
    },
    {
      name:"LE PONT DU CHAOS",
      tagline:"Deux ponts suspendus et un saut obligatoire",
      signature:"Le grand saut entre les falaises",
      features:[
        {type:"bridge",at:.17,length:180,width:58},
        {type:"oil",at:.275,length:72,lane:0,width:110},
        {type:"ramp",at:.378,length:52,lane:0,width:204},
        {type:"gap",at:.398,length:67,lane:0,width:218},
        {type:"bridge",at:.64,length:170,width:53},
        {type:"rock",at:.79,length:36,lane:-54,width:48}
      ]
    },
    {
      name:"LA MINE NOIRE",
      tagline:"Wagonnets, débris et huile dans les galeries",
      signature:"Le wagonnet au sortir du tunnel",
      features:[
        {type:"oil",at:.14,length:115,lane:0,width:170},
        {type:"rock",at:.29,length:38,lane:-43,width:54},
        {type:"cart",at:.405,length:48,lane:0,width:63},
        {type:"oil",at:.59,length:88,lane:48,width:82},
        {type:"cart",at:.73,length:45,lane:0,width:63},
        {type:"ramp",at:.84,length:45,lane:40,width:74},
        {type:"gap",at:.859,length:64,lane:40,width:115}
      ]
    },
    {
      name:"LE SOMMET DES TITANS",
      tagline:"Verglas, descente vertigineuse et duel final",
      signature:"La descente glacée du Bouquetin",
      features:[
        {type:"ice",at:.15,length:165,lane:0,width:216},
        {type:"rock",at:.30,length:36,lane:48,width:56},
        {type:"ice",at:.39,length:135,lane:-28,width:160},
        {type:"ramp",at:.47,length:50,lane:0,width:215},
        {type:"gap",at:.489,length:74,lane:0,width:218},
        {type:"ice",at:.66,length:170,lane:0,width:210},
        {type:"bridge",at:.79,length:205,width:59},
        {type:"oil",at:.89,length:66,lane:0,width:85}
      ]
    }
  ];
  function wrapDistance(a,b,total) {
    let delta=a-b;
    if(delta>total/2)delta-=total;
    if(delta< -total/2)delta+=total;
    return delta;
  }
  function build(zone,race,total,at) {
    const definition=zone===0?catalog[race]:null;
    return {
      name:definition?definition.name:"",
      tagline:definition?definition.tagline:"",
      signature:definition?definition.signature:"",
      features:definition?definition.features.map((f,i)=>({
        ...f,id:race+"-"+i,s:f.at*total,center:at(f.at*total)
      })):[]
    };
  }
  function inspect(design,s,lane,time,total) {
    const result={bridge:null,gap:null,oil:null,ice:null,ramp:null,rock:null,cart:null};
    for(const f of design.features){
      if(Math.abs(wrapDistance(s,f.s,total))>f.length/2)continue;
      if(f.type==="bridge"){result.bridge=f;continue;}
      const obstacleLane=f.type==="cart"?Math.sin(time*1.28+f.at*31)*83:(f.lane||0);
      const width=f.width||50;
      if(Math.abs(lane-obstacleLane)>width/2)continue;
      result[f.type]=f;
    }
    return result;
  }
  function draw(ctx,design,at,project,time,roadHalf) {
    const TAU=Math.PI*2;
    function quadrilateral(f,left,right,color,z=0,stroke=null){
      const a=at(f.s-f.length/2),b=at(f.s+f.length/2);
      const p=[project(a.x+a.nx*left,a.y+a.ny*left,z),project(a.x+a.nx*right,a.y+a.ny*right,z),
        project(b.x+b.nx*right,b.y+b.ny*right,z),project(b.x+b.nx*left,b.y+b.ny*left,z)];
      ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));
      ctx.closePath();ctx.fillStyle=color;ctx.fill();
      if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}
    }
    for(const f of design.features){
      if(f.type==="bridge"){
        quadrilateral(f,f.width,roadHalf+34,"#06121f",0,"#dd9f5b");
        quadrilateral(f,-roadHalf-34,-f.width,"#06121f",0,"#dd9f5b");
        quadrilateral(f,-f.width,f.width,"#6b6353",0,"#f4be63");
        const s1=at(f.s-f.length/2),s2=at(f.s+f.length/2);
        for(const p of [s1,s2]){
          const l=project(p.x+p.nx*f.width,p.y+p.ny*f.width,0);
          const r=project(p.x-p.nx*f.width,p.y-p.ny*f.width,0);
          ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(r.x,r.y);
          ctx.strokeStyle="#e4aa61";ctx.lineWidth=4;ctx.stroke();
        }
      }else if(f.type==="oil"){
        quadrilateral(f,(f.lane||0)-f.width/2,(f.lane||0)+f.width/2,"#0b101acc",1,"#424c68");
      }else if(f.type==="ice"){
        quadrilateral(f,(f.lane||0)-f.width/2,(f.lane||0)+f.width/2,"#9cdef3a8",2,"#d8fcff");
      }else if(f.type==="gap"){
        quadrilateral(f,(f.lane||0)-f.width/2,(f.lane||0)+f.width/2,"#030913",2,"#dd6747");
      }else if(f.type==="ramp"){
        quadrilateral(f,(f.lane||0)-f.width/2,(f.lane||0)+f.width/2,"#a46c3b",4,"#ffca6f");
        const start=at(f.s-f.length*.20),finish=at(f.s+f.length*.32);
        for(let i=-1;i<=1;i++){
          const side=(f.lane||0)+i*f.width*.30;
          const a=project(start.x+start.nx*side,start.y+start.ny*side,5);
          const b=project(finish.x+finish.nx*side,finish.y+finish.ny*side,8);
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.lineWidth=3;ctx.strokeStyle="#ffe9a0";ctx.stroke();
        }
      }else if(f.type==="rock"){
        const p=at(f.s),sp=project(p.x+p.nx*f.lane,p.y+p.ny*f.lane,18);
        ctx.fillStyle="#8c9189";ctx.beginPath();ctx.ellipse(sp.x,sp.y,24,15,-.2,0,TAU);ctx.fill();
        ctx.fillStyle="#c6b9a0";ctx.beginPath();ctx.ellipse(sp.x-5,sp.y-9,14,8,-.2,0,TAU);ctx.fill();
      }else if(f.type==="cart"){
        const p=at(f.s),lane=Math.sin(time*1.28+f.at*31)*83;
        const sp=project(p.x+p.nx*lane,p.y+p.ny*lane,17);
        ctx.fillStyle="#332820";ctx.fillRect(sp.x-23,sp.y-10,46,22);
        ctx.fillStyle="#d5a45d";ctx.fillRect(sp.x-20,sp.y-20,40,13);
        ctx.strokeStyle="#ffcf70";ctx.lineWidth=3;ctx.strokeRect(sp.x-22,sp.y-20,44,30);
      }
    }
  }
  root.LKCourseChallenges={catalog,build,inspect,draw,wrapDistance};
})(typeof window==="object"?window:globalThis);
