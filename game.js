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
  {name:"CITADINE 91",bodyType:"city",price:0,summary:"Citadine française agile : une vraie petite battante.",color:"#d8d9c6",dark:"#777e8c",accent:"#fff1a7",speed:335,accel:286,steering:2.74,armor:1.12},
  {name:"RS ÉCLIPSE",bodyType:"rs",price:900,summary:"Compacte sportive, vivacité et répondant.",color:"#e85b55",dark:"#87262c",accent:"#f5cfaa",speed:378,accel:322,steering:2.69,armor:1.03},
  {name:"KAZE AWD",bodyType:"rally",price:2600,summary:"Berline de rallye japonaise, quatre roues motrices.",color:"#55c6d4",dark:"#286280",accent:"#e9ffff",speed:401,accel:341,steering:2.62,armor:1.13},
  {name:"VORTEX V12",bodyType:"gt",price:6500,summary:"Supercar à moteur central, puissance brutale.",color:"#f6b450",dark:"#975027",accent:"#fef3c6",speed:442,accel:368,steering:2.35,armor:.93},
  {name:"APEX FORMULA",bodyType:"formula",price:13000,summary:"Monoplace radicale. Nécessaire pour la finale mondiale.",color:"#ebdcc0",dark:"#32557c",accent:"#4fe9e4",speed:485,accel:405,steering:2.89,armor:.76}
];
const PAINTS=[{"id":"factory","name":"Origine","color":null},{"id":"red","name":"Rouge","color":"#ee515a"},{"id":"blue","name":"Bleu","color":"#4b93f1"},{"id":"turquoise","name":"Turquoise","color":"#39c6b8"},{"id":"green","name":"Vert","color":"#78c960"},{"id":"yellow","name":"Jaune","color":"#f5d14b"},{"id":"orange","name":"Orange","color":"#f19a42"},{"id":"purple","name":"Violet","color":"#9f80f0"},{"id":"white","name":"Blanc","color":"#eaeef0"},{"id":"black","name":"Noir","color":"#333a48"}];
function validPaint(id){return PAINTS.some(p=>p.id===id);}
function shadePaint(hex){return "#"+[1,3,5].map((i,n)=>Math.round(parseInt(hex.slice(i,i+2),16)*.38+[15,19,30][n]*.62).toString(16).padStart(2,"0")).join("");}
const ZONES = [
  {name:"ALPES",region:"EUROPE / MONTAGNE",status:"ready",boss:"LE BOUQUETIN",bossColor:"#d9b067",races:["COL DES BRUMES","ÉPINGLE DES CIMES","CRÊTE DU TONNERRE","ASCENSION ROYALE"]},
  {name:"LITTORAL",region:"OCÉANIE / PLAGE",status:"ready",boss:"SIRÈNE DU CAP",bossColor:"#79e5d8",races:["BAIE D'AZUR","CORNICHE DES EMBRUNS","CAP SOLAIRE","COURONNE DES MARÉES"]},
  {name:"GRAND NORD",region:"AMÉRIQUE DU NORD / NEIGE",status:"planned",boss:"LE BLIZZARD",races:["SENTIER BLANC","LAC GELÉ","COL DU NORD","TEMPÊTE ROYALE"]},
  {name:"SAHARA",region:"AFRIQUE / DÉSERT",status:"planned",boss:"LE SCORPION",races:["DUNES ROUGES","OASIS MIRAGE","GORGE DES SABLES","SOLEIL NOIR"]},
  {name:"AMAZONIE",region:"AMÉRIQUE DU SUD / FORÊT",status:"planned",boss:"LE JAGUAR",races:["ROUTE CANOPÉE","FLEUVE VERT","PISTE TROPICALE","ROI DE LA JUNGLE"]}
];
const WORLD_GP = [
  "RIVIERA GP","ARDENNES GP","LOMBARDIA GP","SUZUKA SPIRIT",
  "SILVER COAST GP","BRAZIL HEIGHTS","EIFEL RING",
  "LONE STAR GP","DESERT TWILIGHT","GRAND FINAL"
];
const WEAPONS = {
  dart:{name:"DARD IONIQUE",cost:1,cooldown:.42},
  pulse:{name:"ONDE EMP",cost:2,cooldown:2.5},
  mine:{name:"PIÈGE MAGNÉTIQUE",cost:1,cooldown:1.1}
};
let selectedWeapon="dart";
const rivals = [
  {name:"REX",color:"#bc8bff",dark:"#664699",accent:"#eee1ff"},
  {name:"NOVA",color:"#73a9ff",dark:"#34558f",accent:"#e7f1ff"}
];
const trackDefs=[
{name:"NEON CANYON",sky:["#12263a","#132b32","#0c1925"],edge:"#318f9a",anchors:[[-840,-430],[-510,-725],[-25,-800],[520,-702],[846,-413],[916,-55],[750,214],[483,168],[251,345],[285,640],[-33,814],[-485,746],[-770,445],[-922,-20]]},
{name:"COASTLINE RUSH",sky:["#15374a","#194d56","#102a3b"],edge:"#d2a460",anchors:[[-800,-580],[-340,-800],[235,-775],[825,-480],[922,-95],[585,140],[675,510],[365,830],[-155,770],[-430,500],[-360,160],[-735,260],[-960,-45],[-935,-360]]}
];
const COURSE_LAYOUTS = [
  [
    [[-870,-370],[-760,-690],[-310,-850],[140,-820],[620,-660],[780,-280],[570,0],[860,180],[890,550],[520,850],[-80,780],[-430,480],[-720,370],[-940,-40]],
    [[-950,-380],[-600,-690],[-220,-570],[0,-850],[420,-780],[780,-500],[900,-100],[550,80],[770,370],[350,730],[-130,900],[-590,670],[-780,300],[-860,-80]],
    [[-840,-410],[-740,-800],[-180,-870],[300,-700],[650,-830],[950,-420],[650,-220],[850,90],[660,490],[380,500],[230,860],[-410,770],[-900,480],[-970,0]]
  ],
  [
    [[-770,-650],[-170,-840],[330,-780],[880,-620],[750,-170],[950,190],[650,500],[210,420],[250,810],[-300,800],[-650,520],[-460,90],[-930,180],[-930,-390]],
    [[-970,-550],[-420,-800],[70,-610],[400,-850],[880,-650],[930,-180],[650,50],[820,420],[520,780],[20,850],[-470,700],[-750,340],[-480,0],[-1000,-130]],
    [[-900,-550],[-400,-900],[180,-830],[650,-670],[950,-310],[580,-40],[850,190],[760,610],[330,850],[-250,780],[-700,520],[-890,160],[-590,-160],[-990,-220]]
  ]
];
let trackId=0,raceIndex=0;
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
const TRANSPORTS={trailer:{label:"REMORQUE",price:320},boat:{label:"BATEAU",price:1600},plane:{label:"AVION",price:5000}};
const ENTRY_FEES=[[0,120,240,360],[0,200,340,480]];
const KO_REWARD=240;
function loadProgress(){
  let raw={};try{raw=JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")||{};}catch(e){}
  const lvl=k=>clamp(Math.floor(Number(raw[k])||0),0,3),credit=Number(raw.credits);
  const cleared=Array.isArray(raw.cleared)?raw.cleared.filter(x=>typeof x==="string"&&/^[0-4]:[0-3]$/.test(x)).slice(0,20):[];
  const owned=Array.isArray(raw.ownedCars)?raw.ownedCars.filter(x=>Number.isInteger(x)&&x>=0&&x<specs.length):[0];
  if(!owned.includes(0))owned.unshift(0);
  const zone=clamp(Math.floor(Number(raw.zone ?? raw.track)||0),0,ZONES.length-1);
  const race=clamp(Math.floor(Number(raw.race)||0),0,3);
  const car=clamp(Math.floor(Number(raw.selectedCar)||0),0,specs.length-1);
  const weapon=typeof raw.weapon==="string"&&WEAPONS[raw.weapon]?raw.weapon:"dart";
  // Migration: unlocked races and routes from v0.3 stay accessible for returning players.
  const oldSaves=!Array.isArray(raw.transports)&&!Array.isArray(raw.paidEntries);
  const transports=Array.isArray(raw.transports)?raw.transports.filter(k=>Object.hasOwn(TRANSPORTS,k)):[];
  if(oldSaves&&cleared.some(k=>k.startsWith("0:")&&k!=="0:0")&&!transports.includes("trailer"))transports.push("trailer");
  if(oldSaves&&(cleared.some(k=>k.startsWith("1:"))||(zone===1&&cleared.includes("0:3")))&&!transports.includes("boat"))transports.push("boat");
  const paintColors={};
  const savedPaint=raw.paintColors&&typeof raw.paintColors==="object"&&!Array.isArray(raw.paintColors)?raw.paintColors:{};
  for(const [key,id] of Object.entries(savedPaint)){
    const i=Number(key);
    if(Number.isInteger(i)&&i>=0&&i<specs.length&&owned.includes(i)&&validPaint(id))paintColors[i]=id;
  }
  const paidEntries=Array.isArray(raw.paidEntries)?raw.paidEntries.filter(x=>typeof x==="string"&&/^[01]:[1-3]$/.test(x)):[];
  if(oldSaves)for(const k of cleared)if(/^[01]:[1-3]$/.test(k)&&!paidEntries.includes(k))paidEntries.push(k);
  return {credits:Number.isFinite(credit)?clamp(Math.floor(credit),0,100000000):0,
    engine:lvl("engine"),armor:lvl("armor"),nitro:lvl("nitro"),track:zone,zone,race,
    ownedCars:[...new Set(owned)],selectedCar:owned.includes(car)?car:0,weapon,paintColors,
    cleared:[...new Set(cleared)],transports:[...new Set(transports)],paidEntries:[...new Set(paidEntries)]};
}
let progress=loadProgress();
function saveProgress(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(progress));}catch(e){}}
function costOf(k){return upgrades[k].base*(1+progress[k]);}

function raceKey(z,r){return z+":"+r;}
function hasTransport(k){return progress.transports.includes(k);}
function zoneUnlocked(z){return z===0||(z===1&&progress.cleared.includes(raceKey(0,3))&&hasTransport("boat"));}
function raceQualified(z,r){
  return !!ZONES[z]&&ZONES[z].status==="ready"&&zoneUnlocked(z)&&
    (r===0||progress.cleared.includes(raceKey(z,r-1)));
}
function travelAllowed(z,r){return (z!==0||r===0||hasTransport("trailer"))&&(z!==1||hasTransport("boat"));}
function raceAccessible(z,r){return raceQualified(z,r)&&travelAllowed(z,r);}
function entryFee(z,r){return (ENTRY_FEES[z]&&ENTRY_FEES[z][r])||0;}
function entryPaid(z,r){return entryFee(z,r)===0||progress.paidEntries.includes(raceKey(z,r));}
function raceUnlocked(z,r){return raceAccessible(z,r)&&entryPaid(z,r);}
function isBoss(){return raceIndex===3;}
function activeZone(){return ZONES[trackId];}
function buyTransport(key){
  if(!TRANSPORTS[key]||hasTransport(key))return;
  if(key==="boat"&&(!hasTransport("trailer")||!progress.cleared.includes(raceKey(0,3)))){
    $("garageFeedback").textContent="BATS LE BOUQUETIN AVANT DE PRENDRE LE BATEAU.";return;
  }
  if(key==="plane"){ $("garageFeedback").textContent="L'AVION SERA DISPONIBLE LORS DE L'OUVERTURE DU GRAND NORD.";return; }
  const t=TRANSPORTS[key];
  if(progress.credits<t.price){$("garageFeedback").textContent="CRÉDITS INSUFFISANTS POUR "+t.label;return;}
  progress.credits-=t.price;progress.transports.push(key);
  saveProgress();refreshGarage();redrawCareer();
  $("garageFeedback").textContent=t.label+" ACHETÉ"+(key==="trailer"?"E":"")+" !";
  if(sound.enabled)sound.effect("pickup");
}
function buyRaceEntry(){
  if(!raceAccessible(trackId,raceIndex)||entryPaid(trackId,raceIndex))return;
  const fee=entryFee(trackId,raceIndex);
  if(progress.credits<fee){$("careerMessage").textContent="GAGNE ENCORE "+(fee-progress.credits)+" CR POUR T'INSCRIRE.";return;}
  progress.credits-=fee;progress.paidEntries.push(raceKey(trackId,raceIndex));
  saveProgress();refreshGarage();redrawCareer();
  $("careerMessage").textContent="INSCRIPTION PAYÉE · BONNE COURSE !";
}
// The career runs as six real navigable views instead of one scrolling dashboard.
const CAREER_SCREENS=["race","world","dealer","garage","travel"];
const PRIMARY_SCREENS=["race","world","dealer","garage"];
const SCREEN_TITLES={
  race:"Course",world:"Monde",dealer:"Voitures",garage:"Atelier",travel:"Transport"
};
let currentScreen="race",screenHistory=[],showroomPreview=progress.selectedCar;
let thumbsNeedRedraw=true,previewFrameDue=0;
const draftPaint={};
function currentPaint(index){
  return progress.ownedCars.includes(index)?(progress.paintColors[index]||"factory"):(draftPaint[index]||"factory");
}
function carWithPaint(index){
  const car=specs[index],paint=PAINTS.find(p=>p.id===currentPaint(index));
  return paint&&paint.color?{...car,color:paint.color,dark:shadePaint(paint.color)}:car;
}
function updatePaintPicker(context,index){
  const choice=currentPaint(index);
  $(context+"PaintName").textContent=PAINTS.find(p=>p.id===choice)?.name||"Origine";
  $(context+"PaintOptions").innerHTML=PAINTS.map(p=>
    '<button type="button" class="paint-swatch'+(p.id===choice?' active':'')+(p.id==="factory"?' factory':'')+
    '" data-paint="'+p.id+'" aria-label="'+p.name+'" aria-pressed="'+(p.id===choice)+
    '" title="'+p.name+'"'+(p.color?' style="--paint-swatch:'+p.color+'"':'')+'></button>').join("");
}
function choosePaint(id,context){
  if(!validPaint(id)||(context!=="dealer"&&context!=="garage"))return;
  const index=context==="dealer"?showroomPreview:selected;
  if(progress.ownedCars.includes(index)){
    progress.paintColors[index]=id;
    saveProgress();
    if(player&&player.isPlayer&&index===selected){
      const painted=carWithPaint(index);
      player.style.color=painted.color;player.style.dark=painted.dark;
    }
  }else if(context==="dealer"){draftPaint[index]=id;}
  else return;
  thumbsNeedRedraw=true;
  previewFrameDue=0;
  if(context==="garage")$("garageFeedback").textContent="Peinture appliquée gratuitement";
  refreshCareerDisplays();
}
function listenPaint(context){
  $(context+"PaintOptions").addEventListener("click",e=>{
    const button=e.target.closest("button[data-paint]");
    if(button)choosePaint(button.dataset.paint,context);
  });
}
function openCareerScreen(name,back=false){
  if(!CAREER_SCREENS.includes(name))return;
  if(!back&&currentScreen!==name&&state==="menu")screenHistory.push(currentScreen);
  currentScreen=name;
  const menu=$("menu");
  menu.dataset.screen=name;
  menu.dataset.region=trackId===1?"coast":"mountain";
  for(const id of CAREER_SCREENS){
    const screen=$("screen-"+id),visible=id===name;
    screen.classList.toggle("hidden",!visible);
    screen.classList.toggle("active-screen",visible);
  }
  document.querySelectorAll("[data-screen]").forEach(btn=>{
    btn.classList.toggle("active",btn.dataset.screen===name);
    btn.setAttribute("aria-current",btn.dataset.screen===name?"page":"false");
  });
  $("screenEyebrow").textContent=SCREEN_TITLES[name];
  $("screenIndex").textContent=String(PRIMARY_SCREENS.indexOf(name)+1).padStart(2,"0")+" / 04";
  $("backBtn").classList.toggle("hidden",PRIMARY_SCREENS.includes(name));
  $("careerPage").scrollTop=0;
  refreshCareerDisplays();
}
function goBackCareer(){
  const prev=screenHistory.pop();
  openCareerScreen(prev&&CAREER_SCREENS.includes(prev)?prev:"race",true);
}
function previewDealerCar(index){
  if(!Number.isInteger(index)||index<0||index>=specs.length)return;
  showroomPreview=index;
  const spec=carWithPaint(index),hero=$("showroomCar");
  hero.dataset.carStyle=spec.bodyType;
  $("showroomCarName").textContent=spec.name;
  $("showroomCarClass").textContent=spec.summary;
  $("showroomSpeed").textContent=String(Math.round(spec.speed*.7))+" KM/H";
  $("showroomAccel").textContent=String(spec.accel);
  $("showroomGrip").textContent=spec.steering.toFixed(2);
  $("showroomSpeedBar").style.width=Math.round(clamp(spec.speed/510,0,1)*100)+"%";
  $("showroomAccelBar").style.width=Math.round(clamp(spec.accel/450,0,1)*100)+"%";
  $("showroomGripBar").style.width=Math.round(clamp(spec.steering/3.1,0,1)*100)+"%";
  document.querySelectorAll("[data-car]").forEach(btn=>btn.classList.toggle("previewed",Number(btn.dataset.car)===index));
  const owned=progress.ownedCars.includes(index),active=index===selected;
  $("dealerCheckoutName").textContent=spec.name;
  $("dealerCheckoutNote").textContent=owned?active?"Équipée":"Déjà achetée":
    spec.price.toLocaleString("fr-FR")+" CR";
  $("dealerBuyBtn").disabled=active||(!owned&&progress.credits<spec.price);
  $("dealerBuyBtn").textContent=active?"Équipée ✓":
    owned?"Équiper":"Acheter · "+spec.price.toLocaleString("fr-FR")+" CR";
  updatePaintPicker("dealer",index);
  updatePaintPicker("garage",selected);
}
// Dedicated 3D-style vehicle presentation, independent from the racing camera.
function drawCareerVehicles(time){
  if(state!=="menu"||time<previewFrameDue||!window.LKVehicleRenderer)return;
  previewFrameDue=time+.07;
  const artist=window.LKVehicleRenderer;
  if(currentScreen==="garage"){
    artist.preview($("garageCarCanvas"),carWithPaint(selected),{angle:-.51+Math.sin(time*.35)*.18,time});
    return;
  }
  if(currentScreen!=="dealer")return;
  const showcase=$("showroomCarCanvas");
  if(showcase)artist.preview(showcase,carWithPaint(showroomPreview),{angle:-.53+Math.sin(time*.42)*.22,time});
  if(thumbsNeedRedraw){
    document.querySelectorAll("[data-car]").forEach(btn=>{
      const index=Number(btn.dataset.car),view=btn.querySelector("canvas.car-thumb");
      if(view&&specs[index])artist.preview(view,carWithPaint(index),{tiny:true,angle:-.38});
    });
    thumbsNeedRedraw=false;
  }
}
function refreshCareerDisplays(){
  const zone=activeZone(),car=specs[selected],isAccessible=raceAccessible(trackId,raceIndex);
  $("sidebarCar").textContent=car.name;
  $("sidebarZone").textContent=zone.name+" · "+zone.region;
  $("worldRegionTitle").textContent=zone.name;
  $("worldRegionInfo").textContent=zone.region;
  $("worldBossInfo").textContent="Boss : "+zone.boss;
  $("workshopCarName").textContent=car.name;
  $("briefRaceNo").textContent=String(raceIndex+1).padStart(2,"0")+" / 04";
  $("briefRegion").textContent=zone.name;
  $("briefRace").textContent=zone.races[raceIndex];
  $("briefBoss").textContent="Boss : "+zone.boss;
  $("briefCar").textContent=car.name;
  $("briefWeapon").textContent=WEAPONS[selectedWeapon].name;
  const fee=entryFee(trackId,raceIndex),paid=entryPaid(trackId,raceIndex);
  const travelInstruction=!travelAllowed(trackId,raceIndex)?
    (trackId===0?"Remorque requise.":"Bateau requis."):
    !raceQualified(trackId,raceIndex)?"Termine la course précédente.":
    !paid?"Inscription : "+fee+" CR":"Prêt à partir.";
  $("travelInstruction").textContent=travelInstruction;
  $("briefAccess").textContent=raceUnlocked(trackId,raceIndex)?"Prêt":
    !isAccessible?"Bloqué":fee+" CR";
  $("briefAccessAction").textContent=raceUnlocked(trackId,raceIndex)?"✓":"Voir →";
  $("launchMessage").textContent=raceUnlocked(trackId,raceIndex)?"":
    !raceQualified(trackId,raceIndex)?"Termine la course précédente.":
    !travelAllowed(trackId,raceIndex)?"Transport requis → Monde":
    "Inscription à payer → Transport";
  const carPreview=Number.isInteger(showroomPreview)?showroomPreview:selected;
  previewDealerCar(carPreview);
}

function redrawCareer(){
  const zone=activeZone();
  $("zoneSubtitle").textContent=zone.name+" · "+zone.region;
  $("careerProgress").textContent=progress.cleared.length+" / 20 ÉPREUVES";
  $("zoneStatus0").textContent=progress.cleared.includes(raceKey(0,3))?"Terminé":"Ouvert";
  $("zoneStatus1").textContent=zoneUnlocked(1)?"Ouvert":
    progress.cleared.includes(raceKey(0,3))?"Bateau requis":"Verrouillé";
  document.querySelectorAll("[data-zone]").forEach(btn=>{
    const z=Number(btn.dataset.zone),available=z<ZONES.length&&ZONES[z].status==="ready"&&zoneUnlocked(z);
    btn.disabled=!available;
    btn.classList.toggle("active",z===trackId);
    btn.classList.toggle("locked",!available);
    btn.classList.toggle("soon",z>=2);
  });
  document.querySelectorAll("[data-race]").forEach(btn=>{
    const r=Number(btn.dataset.race),qualified=raceQualified(trackId,r);
    const travel=travelAllowed(trackId,r),available=qualified&&travel;
    const finished=progress.cleared.includes(raceKey(trackId,r));
    $("raceName"+r).textContent=zone.races[r];
    const fee=entryFee(trackId,r);
    $("raceStatus"+r).textContent=finished?"Terminé ✓":
      !qualified?"Verrouillé":!travel?"Transport requis":
      !entryPaid(trackId,r)?fee+" CR":"Ouvert";
    btn.disabled=!available;btn.classList.toggle("active",r===raceIndex);btn.classList.toggle("locked",!available);
  });
  $("ownedCount").textContent=progress.ownedCars.length+" / 5";
  document.querySelectorAll("[data-car]").forEach(btn=>{
    const c=Number(btn.dataset.car),owned=progress.ownedCars.includes(c);
    btn.classList.toggle("active",c===selected);
    btn.classList.toggle("locked",!owned);
    btn.classList.toggle("affordable",!owned&&progress.credits>=specs[c].price);
    $("carCost"+c).textContent=owned?(c===selected?"SÉLECTIONNÉE":"POSSÉDÉE"):specs[c].price.toLocaleString("fr-FR")+" CR";
  });
  $("carDetails").textContent=specs[selected].summary;
  document.querySelectorAll("[data-weapon]").forEach(btn=>btn.classList.toggle("active",btn.dataset.weapon===selectedWeapon));
  $("hudWeapon").textContent=WEAPONS[selectedWeapon].name;
  $("transportStatus").textContent=progress.transports.length+" / 3";
  document.querySelectorAll("[data-transport]").forEach(btn=>{
    const key=btn.dataset.transport,t=TRANSPORTS[key],owned=hasTransport(key);
    const ready=key==="trailer"||(key==="boat"&&hasTransport("trailer")&&progress.cleared.includes(raceKey(0,3)));
    btn.disabled=owned||key==="plane"||!ready||progress.credits<t.price;
    btn.classList.toggle("transport-owned",owned);
    $(key+"Cost").textContent=owned?"ACQUIS ✓":key==="plane"?"BIENTÔT":t.price.toLocaleString("fr-FR")+" CR";
  });
  const accessible=raceAccessible(trackId,raceIndex),fee=entryFee(trackId,raceIndex);
  const paid=entryPaid(trackId,raceIndex);
  $("entryStatus").textContent=!accessible?"Non accessible":
    fee===0?"Gratuit":paid?"Payée ✓":fee+" CR";
  $("unlockRaceBtn").classList.toggle("hidden",!accessible||paid);
  $("unlockRaceBtn").disabled=progress.credits<fee;
  $("unlockRaceBtn").textContent="Payer "+fee+" CR";
  $("startBtn").disabled=!raceUnlocked(trackId,raceIndex)||!progress.ownedCars.includes(selected);
  $("careerMessage").textContent=!accessible?"Transport ou qualification requis":
    !paid?"Inscription : "+fee+" CR":
    raceIndex===3?"Finale : termine premier":
    "Podium pour avancer";
  refreshCareerDisplays();
}
function buyOrSelectCar(index){
  if(!Number.isInteger(index)||index<0||index>=specs.length)return;
  previewDealerCar(index);
  const spec=specs[index];
  if(!progress.ownedCars.includes(index)){
    if(progress.credits<spec.price){
      $("garageFeedback").textContent="Il manque "+(spec.price-progress.credits).toLocaleString("fr-FR")+" CR pour "+spec.name+".";
      return;
    }
    progress.credits-=spec.price;progress.ownedCars.push(index);
    progress.paintColors[index]=draftPaint[index]||"factory";
    delete draftPaint[index];
    $("garageFeedback").textContent=spec.name+" achetée !";
  }else{$("garageFeedback").textContent=spec.name+" sélectionnée.";}
  selected=index;progress.selectedCar=index;saveProgress();refreshGarage();redrawCareer();
  if(state==="menu")player=makeCar(300,0,carWithPaint(selected),"YOU",true);
}

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
  progress.credits-=price;progress[k]++;saveProgress();refreshGarage();redrawCareer();
  $("garageFeedback").textContent=upgrades[k].label+" amélioré au niveau "+progress[k]+" !";
  if(sound.enabled)sound.effect("pickup");
}
function rebuildTrack(id,round=0){
  trackId=clamp(Math.floor(Number(id)||0),0,trackDefs.length-1);
  raceIndex=clamp(Math.floor(Number(round)||0),0,3);
  const base=raceIndex===0?trackDefs[trackId].anchors:COURSE_LAYOUTS[trackId][raceIndex-1];
  anchors=base.map(([x,y])=>[x,y]);
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
  for(let i=0;i<22;i++){
    const p=trackAt(420+(i+.38)*TRACK_LENGTH/22),lane=((i*7)%5-2)*29;
    pickups.push({x:p.x+p.nx*lane,y:p.y+p.ny*lane,kind:"gold",value:i%5===0?65:40,cooldown:0,phase:i*.8});
  }
}
rebuildTrack(zoneUnlocked(progress.zone)?progress.zone:0,progress.race);
if(!raceAccessible(trackId,raceIndex))rebuildTrack(trackId,0);
progress.zone=trackId;progress.track=trackId;progress.race=raceIndex;
let W=1280,H=720,dpr=1,zoom=.86;
let cam={x:0,y:0},cameraIso={x:0,y:0};
let state="menu",countdown=0,elapsed=0,selected=progress.selectedCar,difficulty="normal";
selectedWeapon=progress.weapon;
let player,ais=[],rockets=[],mines=[],particles=[],keys=new Set(),touch=new Set(),lastTime=0,hudTicker=0,toastTimeout=0;
let raceGold=0,raceKOs=0;
let lastLap=1,shockCooldown=0,finishOrder=null;

function resize(){
  W=Math.max(320,window.innerWidth);H=Math.max(450,window.innerHeight);
  dpr=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  canvas.style.width=W+"px";canvas.style.height=H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  zoom=W<680?.85:W<1000?.91:.97;
  if(H<550)zoom*=.91;
  thumbsNeedRedraw=true;
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
  if(trackId===1){
    worldPolygon([[930,-1900],[2200,-1900],[2200,1900],[990,1900],[1060,700],[1020,-260]],"#b89967");
    worldPolygon([[1130,-1900],[2400,-1900],[2400,1900],[1190,1900],[1260,700],[1205,-260]],"#287d89");
    for(let yy=-1650;yy<1750;yy+=115){
      lineWorld(1230+Math.sin(yy*.013)*22,yy,1310+Math.sin(yy*.013)*22,yy+32,"#d0f2d861",2*zoom);
      lineWorld(1380,yy+35,1420,yy+56,"#9fd0d459",1.6*zoom);
    }
  }
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
    }else if(trackId===1){
      ctx.strokeStyle="#8e6648";ctx.lineWidth=Math.max(2,size*.18);ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x-size*.19,p.y-size*.6,p.x+size*.05,p.y-size*1.25);ctx.stroke();
      const cx=p.x+size*.05,cy=p.y-size*1.25;
      ctx.strokeStyle="#46a493";ctx.lineWidth=Math.max(2,size*.20);
      for(let k=0;k<6;k++){
        const a=k*TAU/6+s.phase,ex=cx+Math.cos(a)*size*.85,ey=cy+Math.sin(a)*size*.45;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo((cx+ex)*.5,cy-size*.48,ex,ey+size*.17);ctx.stroke();
      }
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
    if(p.kind==="gold"){
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.sin(t*1.5+p.phase)*.09);
      const w=21*zoom,h=12*zoom;
      ctx.shadowColor="#fbe26e";ctx.shadowBlur=15*zoom;
      ctx.fillStyle="#9b5919";
      ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(0,h*.47);ctx.lineTo(w,0);ctx.lineTo(w,-h*.5);
      ctx.lineTo(-w,-h*.5);ctx.closePath();ctx.fill();
      ctx.fillStyle="#ffe078";
      ctx.beginPath();ctx.moveTo(-w,-h*.5);ctx.lineTo(-w*.62,-h*1.48);ctx.lineTo(w*.65,-h*1.48);
      ctx.lineTo(w,-h*.5);ctx.closePath();ctx.fill();
      ctx.fillStyle="#cf952b";
      ctx.beginPath();ctx.moveTo(w,-h*.5);ctx.lineTo(w*.65,-h*1.48);ctx.lineTo(w*.65,-h*.7);
      ctx.lineTo(w,h*.1);ctx.closePath();ctx.fill();
      ctx.fillStyle="#92611d";ctx.shadowBlur=0;ctx.font="900 "+Math.round(11*zoom)+"px Arial";
      ctx.textAlign="center";ctx.fillText("CR",0,-h*.65);
      ctx.restore();continue;
    }
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

// One shared procedural polygon mesh powers the track, the showroom and the thumbnails.
function drawCar(car,t){
  const visual=window.LKVehicleRenderer;
  if(!visual)return;
  visual.draw(ctx,{
    project:(f,r,z)=>bodyPoint(car,f,r,z),zoom,
    type:car.style.bodyType,color:car.style.color,dark:car.style.dark,accent:car.style.accent,
    boosting:car.boosting&&Math.abs(car.speed)>60,hitFlash:car.hitFlash,time:t
  });
  const z=car.style.bodyType==="rally"?57:car.style.bodyType==="formula"?51:48;
  const label=bodyPoint(car,0,0,z);
  ctx.save();
  ctx.font="800 "+Math.max(9,Math.round(11*zoom))+"px Inter,Arial";
  ctx.textAlign="center";ctx.shadowColor="#030712";ctx.shadowBlur=5;
  ctx.fillStyle=car.isPlayer?"#fff3a5":"#e0e5f4";
  ctx.fillText(car.isPlayer?"YOU":car.name,label.x,label.y-3);
  ctx.restore();
}
function drawMines(t){
  for(const m of mines){
    const p=screen(m.x,m.y,5),pulse=1+Math.sin(t*6)*.15;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(t*.7+m.phase);
    ctx.shadowColor="#9ce7f3";ctx.shadowBlur=13;
    ctx.fillStyle="#162d40";ctx.strokeStyle="#6cf0d9";ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<6;i++){const a=i*TAU/6,r=12*zoom*pulse;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle="#e5e4b0";ctx.beginPath();ctx.arc(0,0,3.3*zoom,0,TAU);ctx.fill();
    ctx.restore();
  }
}
function drawPulse(x,y,r){
  const p=screen(x,y,3);
  ctx.save();ctx.strokeStyle="#74f3f5a0";ctx.lineWidth=4*zoom;
  ctx.beginPath();ctx.ellipse(p.x,p.y,r*zoom,r*.51*zoom,0,0,TAU);ctx.stroke();ctx.restore();
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
  const toRender=[player,...ais].filter(c=>c&&!c.destroyed).sort((a,b)=>iso(a.x,a.y).y-iso(b.x,b.y).y);
  for(const car of toRender)drawCar(car,t);
  drawMines(t);drawRockets();drawParticles();
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
  raceGold=0;raceKOs=0;
  rockets=[];mines=[];particles=[];elapsed=0;countdown=3.4;lastLap=1;shockCooldown=0;finishOrder=null;hudTicker=0;
  $("trackName").textContent=activeZone().name+" // "+activeZone().races[raceIndex]+" "+(isBoss()?"★ BOSS":"");
  pickups.forEach(p=>p.cooldown=0);
  player=makeCar(300,5,carWithPaint(selected),specs[selected].name,true);
  const lanes=[-34,35,0],starts=[500,430,365];
  const multipliers={easy:.80,normal:1,hard:1.12};
  const rates=[254,270,313],difficultyRate=(multipliers[difficulty]||1)*(1+raceIndex*.015);
  const region=activeZone();
  ais=[...rivals,{name:region.boss,color:region.bossColor||"#f3b968",dark:"#583c37",accent:"#fff0ca",bodyType:"gt"}].map((r,i)=>{
    const boss=i===2;
    const a=makeCar(starts[i],lanes[i],r,r.name);
    a.isBoss=boss;
    a.hp=boss?180:115;
    a.cruise=(rates[i]+raceIndex*(boss?6:4))*difficultyRate;
    a.phase=i*1.8;
    a.attackTimer=(boss?1.2:3.3)+rnd()*(boss?1.4:2.8);
    a.speed=a.cruise;
    return a;
  });
  cam.x=player.x;cam.y=player.y;
  setHud();drawMinimap();
}
function setMenu(){
  state="menu";$("menu").classList.remove("hidden");$("raceOverlay").classList.add("hidden");
  $("countdown").classList.add("hidden");$("hud").classList.add("hidden");$("controlsHint").classList.remove("hidden");
  $("pauseBtn").style.visibility="hidden";$("nextBtn").classList.add("hidden");
  keys.clear();touch.clear();updateBest();refreshGarage();redrawCareer();
  screenHistory=[];openCareerScreen("race",true);
}
function beginRace(){
  if(!raceUnlocked(trackId,raceIndex)||!progress.ownedCars.includes(selected))return;
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
    if(!ai.destroyed&&hypot(player.x-ai.x,player.y-ai.y)<44){
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
    if(a.finished||a.destroyed)continue;
    a.hitFlash=Math.max(0,a.hitFlash-dt);a.stun=Math.max(0,a.stun-dt);
    a.attackTimer-=dt;
    const pace=a.cruise*(a.stun>0?.52:1)*(1+Math.sin(elapsed*.34+a.phase)*.023);
    a.speed=pace;a.progress+=pace*dt;
    const p=trackAt(a.progress),lane=a.lane+Math.sin(elapsed*.5+a.phase)*9;
    a.x=p.x+p.nx*lane;a.y=p.y+p.ny*lane;a.angle=Math.atan2(p.dy,p.dx);
    a.boosting=a.stun<=0&&Math.sin(elapsed*.34+a.phase)>0.97;
    if(a.progress>=FINISH+TRACK_LENGTH*LAPS){a.finished=true;if(finishOrder===null)finishOrder=a.name;}
    if(a.attackTimer<=0&&hypot(player.x-a.x,player.y-a.y)<(a.isBoss?560:420)&&state==="race"){
      if(rnd()<(a.isBoss?.92:.63))shoot(a);
      a.attackTimer=(a.isBoss?2.7:4.4)+rnd()*(a.isBoss?1.4:3.4);
    }
  }
}
function targetFor(owner){
  const enemies=owner.isPlayer?ais:[player];
  let target=null,best=Infinity;
  for(const e of enemies){
    if(e.finished||e.destroyed)continue;
    const dx=e.x-owner.x,dy=e.y-owner.y,d=hypot(dx,dy),f=dx*Math.cos(owner.angle)+dy*Math.sin(owner.angle);
    if(d<540&&d<best&&(owner.isPlayer?f/d>.03:true)){target=e;best=d;}
  }
  return target;
}
function shoot(owner){
  if(owner.fireCooldown>0)return;
  const weapon=owner.isPlayer?WEAPONS[selectedWeapon]:WEAPONS.dart;
  if(owner.isPlayer&&owner.ammo<weapon.cost){
    owner.fireCooldown=.4;setToast("MUNITIONS INSUFFISANTES");return;
  }
  owner.fireCooldown=owner.isPlayer?weapon.cooldown:1.3;
  if(owner.isPlayer){owner.ammo-=weapon.cost;sound.effect("fire");}
  if(owner.isPlayer&&selectedWeapon==="pulse"){
    let hits=0;
    for(const ai of ais)if(!ai.finished&&!ai.destroyed&&hypot(owner.x-ai.x,owner.y-ai.y)<215){
      damageOpponent(ai,28,2.65);ai.hitFlash=.34;spawnFX(ai.x,ai.y,"#8fefff",13);hits++;
    }
    spawnFX(owner.x,owner.y,"#9af0f5",30);
    setToast(hits?"ONDE EMP · "+hits+" PILOTE(S) TOUCHÉ(S)":"ONDE EMP · ZONE DÉGAGÉE");
    return;
  }
  if(owner.isPlayer&&selectedWeapon==="mine"){
    const x=owner.x-Math.cos(owner.angle)*55,y=owner.y-Math.sin(owner.angle)*55;
    mines.push({x,y,ttl:16,phase:rnd()*TAU});
    if(mines.length>8)mines.shift();
    setToast("PIÈGE MAGNÉTIQUE POSÉ");
    return;
  }
  const t=targetFor(owner),angle=t?Math.atan2(t.y-owner.y,t.x-owner.x):owner.angle;
  rockets.push({x:owner.x+Math.cos(angle)*38,y:owner.y+Math.sin(angle)*38,angle,ttl:1.35,isPlayer:owner.isPlayer,owner,target:t});
}
function rotateToward(a,b,max){
  let d=mod(b-a+Math.PI,TAU)-Math.PI;
  return a+clamp(d,-max,max);
}
function destroyOpponent(ai){
  if(ai.destroyed)return;
  ai.destroyed=true;ai.finished=true;ai.hp=0;ai.progress=-100000000;
  raceKOs++;
  spawnFX(ai.x,ai.y,ai.isBoss?"#ffe1a0":"#f6ad6c",38);
  setToast("DESTRUCTION : "+ai.name+"  +"+KO_REWARD+" CR");
  if(sound.enabled)sound.effect("hit");
}
function damageOpponent(ai,amount,stun){
  if(ai.destroyed||ai.finished)return;
  ai.hp=Math.max(0,ai.hp-amount*(ai.isBoss?.75:1));
  ai.hitFlash=.25;ai.stun=Math.max(ai.stun,stun);
  if(ai.hp<=0)destroyOpponent(ai);
}
function updateRockets(dt){
  for(let i=rockets.length-1;i>=0;i--){
    const r=rockets[i];r.ttl-=dt;
    if(r.target&&!r.target.finished&&!r.target.destroyed&&r.target.hp>0){
      const desired=Math.atan2(r.target.y-r.y,r.target.x-r.x);
      r.angle=rotateToward(r.angle,desired,3.2*dt);
    }
    const mx=Math.cos(r.angle),my=Math.sin(r.angle);
    r.x+=mx*670*dt;r.y+=my*670*dt;
    let hit=null;
    for(const c of r.isPlayer?ais:[player]){
      if(c===r.owner||c.finished||c.destroyed)continue;
      if(hypot(r.x-c.x,r.y-c.y)<40){hit=c;break;}
    }
    if(hit){
      spawnFX(hit.x,hit.y,r.isPlayer?"#f8dc69":"#f77d65",24);
      hit.hitFlash=.24;
      if(hit.isPlayer){
        hit.hp=Math.max(0,hit.hp-(r.owner.isBoss?30:23)/hit.style.armor);
        hit.speed*=.72;setToast("TOUCHÉ !");sound.effect("hit");
      }else damageOpponent(hit,44,1.9);
    }
    if(hit||r.ttl<=0)rockets.splice(i,1);
  }
}
function updateMines(dt){
  for(let i=mines.length-1;i>=0;i--){
    const mine=mines[i];mine.ttl-=dt;
    let hit=false;
    for(const ai of ais)if(!ai.finished&&!ai.destroyed&&hypot(ai.x-mine.x,ai.y-mine.y)<48){
      damageOpponent(ai,85,3);ai.hitFlash=.42;
      spawnFX(mine.x,mine.y,"#78f0ed",26);
      setToast("PIÈGE ACTIVÉ !");hit=true;break;
    }
    if(hit||mine.ttl<=0)mines.splice(i,1);
  }
}

function updatePickups(dt){
  for(const p of pickups){
    if(p.cooldown>0){p.cooldown=Math.max(0,p.cooldown-dt);continue;}
    if(hypot(player.x-p.x,player.y-p.y)<41){
      p.cooldown=p.kind==="gold"?3600:19;
      spawnFX(p.x,p.y,p.kind==="gold"?"#f7d456":"#85f8e7",13);
      if(p.kind==="gold"){raceGold+=p.value;setToast("LINGOT +"+p.value+" CR");}
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
    if(state==="race"){updateAI(dt);updateRockets(dt);updateMines(dt);updatePickups(dt);}
    if(toastTimeout>0){toastTimeout-=dt;if(toastTimeout<=0)$("eventToast").classList.remove("visible");}
    hudTicker-=dt;if(hudTicker<=0){hudTicker=.09;setHud();drawMinimap();}
  }
  updateParticles(dt);
  if(player){cam.x+=((player.x+Math.cos(player.angle)*90)-cam.x)*Math.min(1,dt*4.8);
             cam.y+=((player.y+Math.sin(player.angle)*90)-cam.y)*Math.min(1,dt*4.8);}
}
function position(){return 1+ais.filter(a=>!a.destroyed&&a.progress>player.progress).length;}
function formatTime(s){
  const m=Math.floor(s/60),sec=Math.floor(s%60),tenth=Math.floor(s*10)%10;
  return String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")+"."+tenth;
}
function setHud(){
  if(!player)return;
  $("position").textContent=position();$("lap").textContent=clamp(Math.floor((player.progress-FINISH)/TRACK_LENGTH)+1,1,LAPS);
  $("timer").textContent=formatTime(elapsed);$("ammo").textContent=player.ammo;
  $("raceGold").textContent=raceGold;$("raceKOs").textContent=raceKOs;
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
  for(const ai of ais.filter(a=>!a.destroyed)){const s=conv(ai.x,ai.y);mctx.fillStyle=ai.style.color;mctx.beginPath();mctx.arc(s.x,s.y,4,0,TAU);mctx.fill();}
  if(player){const s=conv(player.x,player.y);mctx.fillStyle="#fbe763";mctx.beginPath();mctx.arc(s.x,s.y,5.7,0,TAU);mctx.fill();mctx.strokeStyle="#0a0a0a";mctx.lineWidth=1;mctx.stroke();}
  mctx.fillStyle="#d0dcec";mctx.font="bold 10px Arial";mctx.fillText("CIRCUIT "+String(trackId+1).padStart(2,"0"),8,12);
}
function endRace(destroyed=false){
  if(state!=="race")return;
  state="finish";sound.effect(destroyed?"hit":"finish");
  const rank=position(),boss=isBoss(),victory=!destroyed&&rank===1,qualified=!destroyed&&(boss?victory:rank<=3);
  const wasCleared=progress.cleared.includes(raceKey(trackId,raceIndex));
  const placement=destroyed?75:[450,360,290,230][rank-1];
  const firstTimeBonus=qualified&&!wasCleared?(boss?850:280):0;
  const knockoutBonus=raceKOs*KO_REWARD,prize=placement+firstTimeBonus+knockoutBonus+raceGold;
  progress.credits+=prize;
  if(qualified&&!wasCleared)progress.cleared.push(raceKey(trackId,raceIndex));
  saveProgress();
  $("dialogEyebrow").textContent=destroyed?"TON BOLIDE EST HORS COURSE":boss?"DUEL CONTRE LE BOSS":"ÉPREUVE TERMINÉE";
  $("dialogTitle").textContent=destroyed?"ÉLIMINÉ !":victory?"VICTOIRE !":"ARRIVÉE !";
  let detail=destroyed?"Tu conserves les lingots et tes primes de destruction.":qualified?
    boss?"BOSS VAINCU · "+activeZone().boss+" !": "Résultat validé ! Prépare le transport et les droits de la prochaine course.":
    boss?"Termine premier pour décrocher le titre régional.":"Termine dans les trois premiers pour progresser.";
  if(qualified&&boss&&trackId===0)detail+=" Achète le BATEAU pour rejoindre la côte.";
  $("dialogDetail").textContent=detail;
  $("resultStats").innerHTML='<div class="result-grid">'+
    '<div><span>CLASSEMENT</span><b>'+rank+' / 4</b></div>'+
    '<div><span>COURSE</span><b>'+placement+' CR</b></div>'+
    '<div><span>LINGOTS</span><b>+'+raceGold+' CR</b></div>'+
    '<div><span>DESTRUCTIONS</span><b>'+raceKOs+' × '+KO_REWARD+'</b></div>'+
    '<div><span>1re QUALIF.</span><b>+'+firstTimeBonus+'</b></div>'+
    '<div><span>TOTAL GAGNÉ</span><b>+'+prize+' CR</b></div></div>';
  $("resumeBtn").classList.add("hidden");$("againBtn").classList.remove("hidden");
  const hasNext=qualified&&(raceIndex<3||(trackId===0&&boss));
  $("nextBtn").classList.toggle("hidden",!hasNext);
  $("nextBtn").innerHTML='ÉPREUVE SUIVANTE / LOGISTIQUE <span>↗</span>';
  $("raceOverlay").classList.remove("hidden");
  if(!destroyed){
    const key="loubkarting_best_v3_"+trackId+"_"+raceIndex;
    try{const old=Number(localStorage.getItem(key)||0);if(!old||elapsed<old)localStorage.setItem(key,String(elapsed));}catch(e){}
  }
}
function updateBest(){
  let best=0;
  try{
    best=Number(localStorage.getItem("loubkarting_best_v3_"+trackId+"_"+raceIndex)||0);
    if(!best&&raceIndex===0){
      best=Number(localStorage.getItem("loubkarting_best_v2_"+trackId)||0);
      if(!best&&trackId===0)best=Number(localStorage.getItem("loubkarting_best_v1")||0);
    }
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
    $("resumeBtn").classList.remove("hidden");$("againBtn").classList.add("hidden");$("nextBtn").classList.add("hidden");
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
  if(e.code==="KeyP"||e.code==="Escape"){
    e.preventDefault();if(state==="menu"&&currentScreen!=="race")goBackCareer();else pause();
  }
  if(e.code==="KeyR"&&state!=="menu"){e.preventDefault();beginRace();}
  if(e.code==="Enter"&&state==="menu"&&currentScreen==="race"){e.preventDefault();beginRace();}
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
document.querySelectorAll("[data-screen]").forEach(btn=>btn.addEventListener("click",()=>openCareerScreen(btn.dataset.screen)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>openCareerScreen(btn.dataset.go)));
$("backBtn").addEventListener("click",goBackCareer);
document.querySelectorAll("[data-car]").forEach(btn=>btn.addEventListener("click",()=>previewDealerCar(Number(btn.dataset.car))));
$("dealerBuyBtn").addEventListener("click",()=>buyOrSelectCar(showroomPreview));
listenPaint("dealer");listenPaint("garage");
document.querySelectorAll("[data-transport]").forEach(btn=>btn.addEventListener("click",()=>buyTransport(btn.dataset.transport)));
$("unlockRaceBtn").addEventListener("click",buyRaceEntry);
document.querySelectorAll("[data-upgrade]").forEach(btn=>btn.addEventListener("click",()=>buyUpgrade(btn.dataset.upgrade)));
document.querySelectorAll("[data-zone]").forEach(btn=>btn.addEventListener("click",()=>{
  const z=Number(btn.dataset.zone);
  if(z>=ZONES.length||!zoneUnlocked(z)||ZONES[z].status!=="ready")return;
  rebuildTrack(z,0);progress.zone=z;progress.track=z;progress.race=0;saveProgress();
  $("garageFeedback").textContent="";
  resetRace();updateBest();redrawCareer();
}));
document.querySelectorAll("[data-race]").forEach(btn=>btn.addEventListener("click",()=>{
  const r=Number(btn.dataset.race);
  if(!raceAccessible(trackId,r))return;
  rebuildTrack(trackId,r);progress.race=r;saveProgress();
  resetRace();updateBest();redrawCareer();openCareerScreen("race");
}));
document.querySelectorAll("[data-weapon]").forEach(btn=>btn.addEventListener("click",()=>{
  if(!WEAPONS[btn.dataset.weapon])return;
  selectedWeapon=btn.dataset.weapon;progress.weapon=selectedWeapon;
  saveProgress();redrawCareer();
}));
$("difficulty").addEventListener("change",e=>difficulty=e.target.value);
$("startBtn").addEventListener("click",beginRace);
$("againBtn").addEventListener("click",beginRace);
$("nextBtn").addEventListener("click",()=>{
  if(state!=="finish")return;
  if(raceIndex<3&&progress.cleared.includes(raceKey(trackId,raceIndex))){
    rebuildTrack(trackId,raceIndex+1);
  }else if(trackId===0&&raceIndex===3&&progress.cleared.includes(raceKey(0,3))){
    rebuildTrack(1,0);
  }else return;
  progress.zone=trackId;progress.track=trackId;progress.race=raceIndex;saveProgress();
  redrawCareer();
  resetRace();setMenu();
  openCareerScreen(raceUnlocked(trackId,raceIndex)?"race":"travel");
});
$("resumeBtn").addEventListener("click",pause);
$("menuBtn").addEventListener("click",()=>{resetRace();setMenu();openCareerScreen("garage");});
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
  update(dt);draw(now/1000);drawCareerVehicles(now/1000);requestAnimationFrame(frame);
}
document.querySelectorAll("[data-car]").forEach(btn=>btn.classList.toggle("active",Number(btn.dataset.car)===selected));
resetRace();setMenu();requestAnimationFrame(frame);
})();
