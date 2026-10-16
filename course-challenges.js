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
,
    {
      name:"BAIE D'AZUR",tagline:"Jetées battues par les marées",signature:"Le saut au-dessus de la jetée",
      features:[{type:"water",at:0.12,length:135,lane:0,width:185},{type:"sand",at:0.26,length:135,lane:-25,width:125},{type:"bridge",at:0.44,length:155,width:61},{type:"ramp",at:0.68,length:50,lane:-42,width:92},{type:"gap",at:0.7,length:70,lane:-42,width:108},{type:"water",at:0.87,length:120,lane:30,width:130}]
    },
    {
      name:"CORNICHE DES EMBRUNS",tagline:"Corniche glissante et rochers marins",signature:"Le virage de la vague",
      features:[{type:"oil",at:0.13,length:60,lane:45,width:85},{type:"sand",at:0.32,length:165,lane:0,width:195},{type:"rock",at:0.54,length:33,lane:-44,width:47},{type:"bridge",at:0.66,length:145,width:64},{type:"water",at:0.85,length:165,lane:0,width:180}]
    },
    {
      name:"CAP SOLAIRE",tagline:"Plage, rampe de jetée et passage étroit",signature:"La rampe des surfeurs",
      features:[{type:"sand",at:0.14,length:160,lane:0,width:190},{type:"water",at:0.33,length:115,lane:32,width:155},{type:"ramp",at:0.5,length:52,lane:0,width:208},{type:"gap",at:0.52,length:70,lane:0,width:218},{type:"bridge",at:0.7,length:170,width:56},{type:"oil",at:0.88,length:72,lane:-30,width:90}]
    },
    {
      name:"COURONNE DES MARÉES",tagline:"Finale littorale sous les embruns",signature:"Le double pont dans les vagues",
      features:[{type:"water",at:0.11,length:175,lane:0,width:210},{type:"bridge",at:0.26,length:165,width:58},{type:"water",at:0.39,length:170,lane:0,width:190},{type:"ramp",at:0.52,length:51,lane:0,width:205},{type:"gap",at:0.54,length:75,lane:0,width:217},{type:"bridge",at:0.74,length:170,width:58},{type:"oil",at:0.89,length:65,lane:45,width:85}]
    },
    {
      name:"SENTIER BLANC",tagline:"Verglas, roches gelées et passerelle",signature:"Le pont de givre",
      features:[{type:"ice",at:0.12,length:230,lane:0,width:210},{type:"rock",at:0.27,length:40,lane:43,width:52},{type:"ice",at:0.43,length:160,lane:-20,width:175},{type:"bridge",at:0.61,length:180,width:59},{type:"ice",at:0.81,length:185,lane:0,width:210}]
    },
    {
      name:"LAC GELÉ",tagline:"Lac traversé sur une fine couche de glace",signature:"Le grand saut de glace",
      features:[{type:"ice",at:0.12,length:260,lane:0,width:220},{type:"ice",at:0.3,length:210,lane:0,width:215},{type:"ramp",at:0.47,length:48,lane:0,width:212},{type:"gap",at:0.49,length:66,lane:0,width:218},{type:"ice",at:0.61,length:195,lane:0,width:220},{type:"rock",at:0.77,length:40,lane:-45,width:50},{type:"ice",at:0.89,length:140,lane:40,width:125}]
    },
    {
      name:"COL DU NORD",tagline:"Épingles gelées et souffle polaire",signature:"Le grand pont de neige",
      features:[{type:"ice",at:0.14,length:200,lane:0,width:205},{type:"ice",at:0.33,length:175,lane:-35,width:145},{type:"bridge",at:0.47,length:175,width:55},{type:"rock",at:0.63,length:38,lane:44,width:48},{type:"ramp",at:0.76,length:50,lane:-38,width:90},{type:"gap",at:0.78,length:64,lane:-38,width:120}]
    },
    {
      name:"TEMPÊTE ROYALE",tagline:"Finale polaire : glace et précipices",signature:"La traversée blanche du Blizzard",
      features:[{type:"ice",at:0.11,length:210,lane:0,width:215},{type:"ice",at:0.31,length:180,lane:0,width:200},{type:"bridge",at:0.49,length:185,width:52},{type:"ice",at:0.64,length:155,lane:10,width:185},{type:"ramp",at:0.77,length:49,lane:0,width:215},{type:"gap",at:0.79,length:70,lane:0,width:218},{type:"rock",at:0.91,length:33,lane:-40,width:50}]
    },
    {
      name:"DUNES ROUGES",tagline:"Sable profond et rochers affleurants",signature:"Le bond par-dessus la dune",
      features:[{type:"sand",at:0.11,length:240,lane:0,width:210},{type:"sand",at:0.3,length:175,lane:35,width:145},{type:"rock",at:0.43,length:42,lane:-45,width:54},{type:"ramp",at:0.55,length:55,lane:0,width:215},{type:"gap",at:0.57,length:68,lane:0,width:218},{type:"sand",at:0.73,length:205,lane:0,width:215},{type:"sand",at:0.88,length:130,lane:-30,width:155}]
    },
    {
      name:"OASIS MIRAGE",tagline:"Sables mouvants au bord d'une oasis",signature:"La traversée de l'oasis",
      features:[{type:"sand",at:0.14,length:190,lane:0,width:195},{type:"water",at:0.27,length:125,lane:40,width:115},{type:"sand",at:0.44,length:220,lane:0,width:210},{type:"rock",at:0.59,length:41,lane:-42,width:48},{type:"bridge",at:0.72,length:180,width:61},{type:"sand",at:0.87,length:150,lane:0,width:190}]
    },
    {
      name:"GORGE DES SABLES",tagline:"Falaise désertique et gorge profonde",signature:"Le canyon sans garde-fou",
      features:[{type:"sand",at:0.12,length:190,lane:0,width:205},{type:"bridge",at:0.26,length:180,width:54},{type:"ramp",at:0.46,length:47,lane:0,width:211},{type:"gap",at:0.48,length:75,lane:0,width:218},{type:"rock",at:0.63,length:41,lane:43,width:52},{type:"sand",at:0.81,length:210,lane:-15,width:175}]
    },
    {
      name:"SOLEIL NOIR",tagline:"Finale du désert dans la tempête",signature:"Le saut dans la tempête rouge",
      features:[{type:"sand",at:0.13,length:240,lane:0,width:213},{type:"sand",at:0.34,length:210,lane:0,width:190},{type:"bridge",at:0.5,length:175,width:53},{type:"sand",at:0.65,length:150,lane:-32,width:145},{type:"ramp",at:0.77,length:48,lane:0,width:211},{type:"gap",at:0.79,length:71,lane:0,width:218},{type:"rock",at:0.91,length:38,lane:-41,width:51}]
    },
    {
      name:"ROUTE CANOPÉE",tagline:"Boue et troncs sous la canopée",signature:"Le tronc couché du Jaguar",
      features:[{type:"mud",at:0.13,length:200,lane:0,width:205},{type:"log",at:0.27,length:34,lane:-40,width:52},{type:"mud",at:0.41,length:170,lane:30,width:155},{type:"log",at:0.58,length:37,lane:45,width:53},{type:"mud",at:0.71,length:170,lane:0,width:210},{type:"bridge",at:0.85,length:178,width:60}]
    },
    {
      name:"FLEUVE VERT",tagline:"Gués, ponts en bois et rivière",signature:"Le saut de la rivière",
      features:[{type:"water",at:0.18,length:145,lane:0,width:195},{type:"bridge",at:0.3,length:168,width:57},{type:"mud",at:0.49,length:200,lane:0,width:213},{type:"ramp",at:0.61,length:53,lane:0,width:208},{type:"gap",at:0.63,length:68,lane:0,width:218},{type:"log",at:0.84,length:37,lane:-38,width:53}]
    },
    {
      name:"PISTE TROPICALE",tagline:"Ornières, pluie et embuscades",signature:"Le tunnel vert",
      features:[{type:"mud",at:0.11,length:210,lane:0,width:210},{type:"log",at:0.28,length:40,lane:43,width:50},{type:"mud",at:0.42,length:170,lane:-33,width:145},{type:"log",at:0.57,length:36,lane:-42,width:51},{type:"mud",at:0.71,length:160,lane:0,width:215},{type:"water",at:0.83,length:125,lane:35,width:143},{type:"bridge",at:0.92,length:140,width:58}]
    },
    {
      name:"ROI DE LA JUNGLE",tagline:"Finale humide sur les ponts de la forêt",signature:"Le grand saut au-dessus du fleuve",
      features:[{type:"mud",at:0.11,length:180,lane:0,width:205},{type:"log",at:0.25,length:38,lane:-40,width:51},{type:"bridge",at:0.39,length:168,width:57},{type:"water",at:0.56,length:145,lane:0,width:210},{type:"ramp",at:0.7,length:49,lane:0,width:212},{type:"gap",at:0.72,length:77,lane:0,width:218},{type:"log",at:0.89,length:40,lane:44,width:50}]
    }
  ];
  function wrapDistance(a,b,total) {
    let delta=a-b;
    if(delta>total/2)delta-=total;
    if(delta< -total/2)delta+=total;
    return delta;
  }
  function build(zone,race,total,at) {
    const definition=catalog[zone*4+race]||null;
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
    const result={bridge:null,gap:null,oil:null,ice:null,ramp:null,rock:null,cart:null,water:null,sand:null,mud:null,log:null};
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
      }else if(f.type==="water"||f.type==="sand"||f.type==="mud"){
        const fill={water:"#6dbbe3aa",sand:"#c59b5399",mud:"#483e2caa"}[f.type];
        const border={water:"#b7f5fa",sand:"#edcf8b",mud:"#94714b"}[f.type];
        quadrilateral(f,(f.lane||0)-f.width/2,(f.lane||0)+f.width/2,fill,1,border);
      }else if(f.type==="log"){
        const p=at(f.s),sp=project(p.x+p.nx*(f.lane||0),p.y+p.ny*(f.lane||0),15);
        ctx.save();ctx.translate(sp.x,sp.y);
        ctx.rotate(.24);ctx.fillStyle="#593b25";ctx.fillRect(-26,-9,52,18);
        ctx.fillStyle="#97714b";ctx.fillRect(-25,-9,50,6);
        ctx.fillStyle="#c5a177";ctx.beginPath();ctx.ellipse(24,0,6,9,0,0,TAU);ctx.fill();ctx.restore();
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
