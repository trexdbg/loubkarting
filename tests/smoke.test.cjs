"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","game.js"),"utf8");
const challenges=fs.readFileSync(path.join(__dirname,"..","course-challenges.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const noop=()=>{};
const debugSource=source.replace("resetRace();setMenu();requestAnimationFrame(frame);",
"window.__test={player:()=>player,at:trackAt,length:()=>TRACK_LENGTH,state:()=>state,progress:()=>progress,track:()=>trackId,race:()=>raceIndex,selected:()=>selected,weapon:()=>selectedWeapon,ais:()=>ais,screen:()=>currentScreen,mines:()=>mines,pickups:()=>pickups,goldEarned:()=>raceGold,knockouts:()=>raceKOs,shoot,damageOpponent,updatePickups,raceUnlocked,raceAccessible,finish:endRace,position,course:()=>courseChallenge,coursePreviewDetails,drawCoursePreview,updatePlayer,updateAI,courseHazardAt,elapsed:()=>elapsed,updateRockets,rockets:()=>rockets};\nresetRace();setMenu();requestAnimationFrame(frame);");
assert.notEqual(debugSource,source,"Debug instrumentation anchor should exist.");

function harness(initial={}){
  const saved={...initial},elements={},listeners={},gradient={addColorStop:noop};
  const draw=new Proxy({createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
  function el(id){
    if(elements[id])return elements[id];
    const classes=new Set();
    return elements[id]={id,dataset:{},style:{},textContent:"",innerHTML:"",value:"normal",disabled:false,
      width:200,height:145,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),
      toggle(k,on){if(on===undefined)on=!classes.has(k);if(on)classes.add(k);else classes.delete(k);return on;}},events:{},attributes:{},
      setAttribute(k,v){this.attributes[k]=v;},
      addEventListener(k,fn){this.events[k]=fn;},getContext:()=>draw,setPointerCapture:noop};
  }
  function group(key,ids){return ids.map(n=>{const x=el(key+n);x.dataset[key]=String(n);return x;});}
  const groups={
    "[data-car]":group("car",[0,1,2,3,4]),
    "[data-zone]":group("zone",[0,1,2,3,4,5]),
    "[data-race]":group("race",[0,1,2,3]),
    "[data-weapon]":group("weapon",["dart","pulse","mine"]),
    "[data-upgrade]":group("upgrade",["engine","armor","nitro"]),
    "[data-transport]":group("transport",["trailer","boat","plane"]),
    "[data-screen]":group("screen",["race","world","dealer","garage"]),
    "[data-go]":[...html.matchAll(/data-go="([^"]+)"/g)].map((match,i)=>{
      const node=el("go"+i);node.dataset.go=match[1];return node;
    }),
    "[data-control]":group("control",["gas","brake","left","right","fire","nitro"])
  };
  const doc={
    getElementById:el,querySelectorAll:q=>groups[q]||[],
    querySelector:q=>groups["[data-upgrade]"].find(x=>q==='[data-upgrade="'+x.dataset.upgrade+'"]')||null,
    addEventListener:(k,fn)=>listeners[k]=fn
  };
  const win={innerWidth:1100,innerHeight:710,devicePixelRatio:1,addEventListener:noop,AudioContext:null};
  let animation,clock=0;
  const locals={getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=String(v)};
  const sandbox={document:doc,window:win,localStorage:locals,requestAnimationFrame:fn=>animation=fn,console};
  vm.runInNewContext(challenges,sandbox,{filename:"course-challenges.js",timeout:5000});
  vm.runInNewContext(debugSource,sandbox,{filename:"game.js",timeout:5000});
  function advance(n=1){for(let i=0;i<n;i++){clock+=16.667;animation(clock);}}
  function start(){
    el("startBtn").events.click();advance(230);
    assert.equal(win.__test.state(),"race","Race must start after countdown");
  }
  function winInstant(){
    const p=win.__test.player();p.progress=160+3*win.__test.length()+100;
    for(const a of win.__test.ais())a.progress=0;
    win.__test.finish();
    assert.equal(win.__test.state(),"finish");
  }
  function playFullRace(){
    let dist=300,limit=Math.ceil(win.__test.length()*3/27)+10;
    for(let i=0;i<limit&&win.__test.state()==="race";i++){
      dist+=27;const at=win.__test.at(dist),p=win.__test.player();
      p.x=at.x;p.y=at.y;p.angle=Math.atan2(at.dy,at.dx);p.speed=0;p.hp=100;p.invulnerable=10;
      advance();
    }
    assert.equal(win.__test.state(),"finish","Three laps end normally");
  }
  return {el,groups,saved,listeners,win,advance,start,winInstant,playFullRace};
}

test("required game elements exist in HTML",()=>{
  const ids=[...new Set([...source.matchAll(/\$\("([^"]+)"\)/g)].map(m=>m[1]))];
  for(const id of ids)assert.ok(html.includes('id="'+id+'"'),"Missing #"+id);
  assert.equal((html.match(/data-car="\d"/g)||[]).length,5);
  assert.equal((html.match(/data-zone="\d"/g)||[]).length,5);
  assert.equal((html.match(/data-race="\d"/g)||[]).length,4);
});

test("all HTML panels and wrappers have balanced markup",()=>{
  const stack=[],voids=new Set(["meta","link","img","input","br","hr","source","area","base","col","embed","param","track","wbr","path","rect","circle","stop","line","polyline","polygon","ellipse"]);
  for(const match of html.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi)){
    const tag=match[1].toLowerCase();
    if(voids.has(tag)||match[0].endsWith("/>"))continue;
    if(match[0].startsWith("</"))assert.equal(stack.pop(),tag,"Unbalanced HTML at "+match.index);
    else stack.push(tag);
  }
  assert.equal(stack.length,0,"HTML has unclosed elements");
  assert.ok(!html.includes('id="screen-home"'));
});
test("race-first layout shows four primary tabs and hides inactive sections",()=>{
  const h=harness();
  assert.equal(h.win.__test.screen(),"race");
  assert.equal(h.el("screen-race").classList.contains("active-screen"),true);
  const primary=["race","world","dealer","garage"];
  assert.equal((html.match(/class="nav-tab[^"]*" data-screen="/g)||[]).length,4);
  for(const name of ["world","dealer","garage"]){
    const btn=h.groups["[data-screen]"].find(b=>b.dataset.screen===name);
    assert.ok(btn);btn.events.click();
    assert.equal(h.win.__test.screen(),name);
    assert.equal(h.el("screen-"+name).classList.contains("active-screen"),true);
    assert.equal(h.el("screen-race").classList.contains("hidden"),true);
    assert.equal(btn.attributes["aria-current"],"page");
  }
  h.el("backBtn").events.click();
  assert.equal(h.win.__test.screen(),"dealer");
  assert.ok(!html.includes('data-screen="home"'));
  assert.ok(!html.includes('data-screen="travel"'));
});
test("contextual links navigate without cluttering the main tabs",()=>{
  const h=harness();
  for(const target of ["world","dealer","garage","travel","race"]){
    const button=h.groups["[data-go]"].find(b=>b.dataset.go===target);
    assert.ok(button);
    button.events.click();
    assert.equal(h.win.__test.screen(),target);
  }
});

test("showroom previews unaffordable vehicles without buying them",()=>{
  const h=harness();
  const car=h.groups["[data-car]"][4];
  car.events.click();
  assert.equal(h.win.__test.selected(),0);
  assert.equal(h.win.__test.progress().credits,0);
  assert.equal(h.el("showroomCarName").textContent,"APEX FORMULA");
  assert.equal(h.el("showroomCar").dataset.carStyle,"formula");
  assert.equal(car.classList.contains("previewed"),true);
  assert.match(h.el("dealerCheckoutNote").textContent,/CR/);
  assert.equal(h.el("dealerBuyBtn").disabled,true);
  h.groups["[data-screen]"][2].events.click();
  assert.equal(h.win.__test.screen(),"dealer");
});

test("mountain opens first; later worlds need their bosses and transports",()=>{
  const h=harness();
  assert.equal(h.win.__test.track(),0);
  assert.equal(h.win.__test.race(),0);
  assert.equal(h.groups["[data-zone]"][0].disabled,false);
  assert.equal(h.groups["[data-zone]"][1].disabled,true);
  for(let i=2;i<5;i++)assert.equal(h.groups["[data-zone]"][i].disabled,true);
  assert.equal(h.groups["[data-race]"][1].disabled,true);
  assert.equal(h.win.__test.progress().ownedCars.join(","),"0");
});

test("three opponents include a permanent, dominant regional boss",()=>{
  const h=harness(),a=h.win.__test.ais();
  assert.equal(a.length,3);
  assert.equal(a[2].name,"LE BOUQUETIN");
  assert.equal(a[2].isBoss,true);
  assert.ok(a[2].cruise>a[1].cruise);
  assert.ok(a[2].hp>a[1].hp);
});
test("remorque, droits d'inscription et bateau conditionnent la progression",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:6000,cleared:[],transports:[],paidEntries:[]})});
  const lengths=[];
  for(let round=0;round<4;round++){
    if(round===1){
      assert.equal(h.groups["[data-race]"][1].disabled,true);
      h.groups["[data-transport]"][0].events.click();
      assert.equal(h.win.__test.progress().transports.includes("trailer"),true);
    }
    if(round){
      h.groups["[data-race]"][round].events.click();
      assert.equal(h.win.__test.race(),round);
      assert.equal(h.el("startBtn").disabled,true);
      h.el("unlockRaceBtn").events.click();
      assert.equal(h.win.__test.raceUnlocked(0,round),true);
    }
    lengths.push(Math.round(h.win.__test.length()));
    assert.equal(h.win.__test.ais().length,3);
    assert.equal(h.win.__test.ais()[2].name,"LE BOUQUETIN");
    h.start();h.winInstant();
    assert.ok(h.win.__test.progress().cleared.includes("0:"+round));
    h.el("menuBtn").events.click();
  }
  assert.ok(new Set(lengths).size>=3);
  assert.equal(h.groups["[data-zone]"][1].disabled,true,"Boat required after the boss");
  h.groups["[data-transport]"][1].events.click();
  assert.equal(h.groups["[data-zone]"][1].disabled,false);
  h.groups["[data-zone]"][1].events.click();
  assert.equal(h.win.__test.track(),1);
  assert.equal(h.win.__test.ais()[2].name,"SIRÈNE DU CAP");
});

test("qualified finish sends player to logistics instead of bypassing a toll",()=>{
  const h=harness();h.start();h.winInstant();
  h.el("nextBtn").events.click();
  assert.equal(h.win.__test.race(),1);
  assert.equal(h.win.__test.state(),"menu");
  assert.equal(h.el("startBtn").disabled,true);
  h.groups["[data-transport]"][0].events.click();
  assert.equal(h.el("startBtn").disabled,true);
  h.el("unlockRaceBtn").events.click();
  assert.equal(h.el("startBtn").disabled,false);
});
test("gold bars and destroying an opponent award credits on finishing",()=>{
  const h=harness();h.start();
  const gold=h.win.__test.pickups().find(p=>p.kind==="gold");
  const p=h.win.__test.player();p.x=gold.x;p.y=gold.y;
  h.win.__test.updatePickups(.016);
  assert.match(h.el("eventToast").textContent,/LINGOT/);
  const opponent=h.win.__test.ais()[0];
  h.win.__test.damageOpponent(opponent,500,1);
  h.win.__test.damageOpponent(opponent,500,1);
  assert.ok(opponent.fall,"Enemy destruction has a fall animation");
  assert.equal(opponent.destroyed,undefined,"Defeated AI are not permanently eliminated");
  h.winInstant();
  assert.match(h.el("resultStats").innerHTML,/DESTRUCTIONS/);
  assert.match(h.el("resultStats").innerHTML,/LINGOTS/);
  assert.ok(h.win.__test.goldEarned()>=gold.value);
  assert.equal(h.win.__test.knockouts(),1);
  assert.equal(h.win.__test.progress().credits,730+h.win.__test.goldEarned()+240);
});

test("race results return to the actual mechanical workshop",()=>{
  const h=harness();
  h.groups["[data-screen]"][0].events.click();
  h.start();h.winInstant();
  h.el("menuBtn").events.click();
  assert.equal(h.win.__test.state(),"menu");
  assert.equal(h.win.__test.screen(),"garage");
  assert.equal(h.el("screen-garage").classList.contains("active-screen"),true);
  h.groups["[data-screen]"][0].events.click();
  assert.equal(h.win.__test.screen(),"race");
});
test("after a race the next-step transition opens the travel screen if payment is due",()=>{
  const h=harness();h.start();h.winInstant();
  h.el("nextBtn").events.click();
  assert.equal(h.win.__test.screen(),"travel");
  assert.match(h.el("travelInstruction").textContent,/Remorque/);
  h.groups["[data-transport]"][0].events.click();
  h.el("unlockRaceBtn").events.click();
  h.groups["[data-screen]"][0].events.click();
  assert.equal(h.win.__test.screen(),"race");
  assert.equal(h.el("startBtn").disabled,false);
});

test("race naturally ends after three laps and saves best time",()=>{
  const h=harness();h.start();h.playFullRace();
  assert.ok(Number(h.saved.loubkarting_best_v3_0_0)>0);
  assert.match(h.el("resultStats").innerHTML,/TOTAL GAGNÉ/);
});

test("credits buy actual vehicles and improvements and survive reload",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:30000,ownedCars:[0]})});
  for(let i=1;i<=4;i++){
    h.groups["[data-car]"][i].events.click();
    assert.equal(h.el("showroomCarName").textContent,["","RS ÉCLIPSE","KAZE AWD","VORTEX V12","APEX FORMULA"][i]);
    h.el("dealerBuyBtn").events.click();
  }
  assert.equal(h.win.__test.selected(),4);
  assert.equal(h.win.__test.progress().ownedCars.length,5);
  assert.equal(h.win.__test.progress().credits,7000);
  h.groups["[data-upgrade]"][0].events.click();
  assert.equal(h.win.__test.progress().engine,1);
  const restored=harness(h.saved);
  assert.equal(restored.win.__test.selected(),4);
  assert.equal(restored.win.__test.progress().engine,1);
  assert.equal(restored.win.__test.progress().credits,6800);
});

test("dealership separates selection from an explicit purchase",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:2000,ownedCars:[0]})});
  h.groups["[data-screen]"][2].events.click();
  h.groups["[data-car]"][1].events.click();
  assert.equal(h.win.__test.selected(),0);
  assert.equal(h.win.__test.progress().credits,2000);
  assert.equal(h.el("dealerBuyBtn").disabled,false);
  assert.match(h.el("dealerBuyBtn").textContent,/900/);
  h.el("dealerBuyBtn").events.click();
  assert.equal(h.win.__test.selected(),1);
  assert.equal(h.win.__test.progress().credits,1100);
  assert.equal(h.el("dealerBuyBtn").disabled,true);
  h.groups["[data-car]"][0].events.click();
  assert.match(h.el("dealerBuyBtn").textContent,/Équiper/);
  h.el("dealerBuyBtn").events.click();
  assert.equal(h.win.__test.selected(),0);
  assert.equal(h.win.__test.progress().credits,1100);
});
test("ion dart, EMP and mine consume the correct ammunition",()=>{
  const h=harness();
  h.start();const player=h.win.__test.player();
  h.win.__test.shoot(player);
  assert.equal(player.ammo,4);
  h.el("menuBtn").events.click();
  h.groups["[data-weapon]"][1].events.click();
  h.start();
  const p=h.win.__test.player();h.win.__test.shoot(p);
  assert.equal(p.ammo,3);
  assert.equal(h.win.__test.weapon(),"pulse");
  h.el("menuBtn").events.click();
  h.groups["[data-weapon]"][2].events.click();
  h.start();
  const q=h.win.__test.player();h.win.__test.shoot(q);
  assert.equal(q.ammo,4);
  assert.equal(h.win.__test.mines().length,1);
});

test("old successful races retain their access after economy migration",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({
    zone:1,race:0,cleared:["0:0","0:1","0:2","0:3","1:0"],credits:10
  })});
  assert.equal(h.win.__test.track(),1);
  assert.ok(h.win.__test.progress().transports.includes("trailer"));
  assert.ok(h.win.__test.progress().transports.includes("boat"));
  assert.ok(h.win.__test.progress().paidEntries.includes("0:1"));
});
test("invalid save is repaired without crashing",()=>{
  const bad=harness({loubkarting_progress_v2:JSON.stringify({
    credits:-900,engine:777,armor:-2,nitro:"oops",zone:6,race:3,
    ownedCars:[],selectedCar:4,weapon:"explosive"
  })});
  assert.equal(bad.win.__test.progress().credits,0);
  assert.equal(bad.win.__test.progress().engine,3);
  assert.equal(bad.win.__test.selected(),0);
  assert.equal(bad.win.__test.track(),0);
  assert.equal(bad.win.__test.race(),0);
  assert.equal(bad.win.__test.weapon(),"dart");
  assert.doesNotThrow(()=>harness({loubkarting_progress_v2:"{broken"}));
});

test("paint selected before purchase persists and updates garage and races at no cost",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:2200,ownedCars:[0]})});
  h.groups["[data-car]"][1].events.click();
  h.el("dealerPaintOptions").events.click({target:{closest:()=>({dataset:{paint:"blue"}})}});
  assert.equal(h.el("dealerPaintName").textContent,"Bleu");
  assert.equal(h.win.__test.progress().paintColors[1],undefined);
  h.el("dealerBuyBtn").events.click();
  assert.equal(h.win.__test.progress().credits,1300);
  assert.equal(h.win.__test.progress().paintColors[1],"blue");
  assert.equal(h.win.__test.player().style.color,"#4b93f1");
  h.el("garagePaintOptions").events.click({target:{closest:()=>({dataset:{paint:"green"}})}});
  assert.equal(h.el("garagePaintName").textContent,"Vert");
  assert.equal(h.win.__test.progress().paintColors[1],"green");
  assert.equal(h.win.__test.player().style.color,"#78c960");
  assert.equal(h.win.__test.progress().credits,1300);
  const restored=harness(h.saved);
  assert.equal(restored.win.__test.progress().paintColors[1],"green");
  restored.start();
  assert.equal(restored.win.__test.player().style.color,"#78c960");
});
test("factory paint can be restored and unknown saved paints are ignored",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({ownedCars:[0],paintColors:{"0":"blue","1":"red","9":"black"}})});
  assert.equal(h.win.__test.player().style.color,"#4b93f1");
  assert.equal(h.win.__test.progress().paintColors[1],undefined);
  h.el("garagePaintOptions").events.click({target:{closest:()=>({dataset:{paint:"factory"}})}});
  assert.equal(h.win.__test.progress().paintColors[0],"factory");
  assert.equal(h.win.__test.player().style.color,"#d8d9c6");
});

test("Alpine tracks have individual scripted hazards and unique set pieces",()=>{
  const h=harness(),engine=h.win.LKCourseChallenges;
  assert.equal(engine.catalog.length,20);
  assert.equal(new Set(engine.catalog.map(c=>c.signature)).size,20);
  assert.ok(engine.catalog.every(c=>c.features.length>=5));
  assert.ok(engine.catalog[0].features.some(f=>f.type==="bridge"));
  assert.ok(engine.catalog[1].features.filter(f=>f.type==="bridge").length>=2);
  assert.ok(engine.catalog[1].features.some(f=>f.type==="gap"));
  assert.ok(engine.catalog[2].features.some(f=>f.type==="cart"));
  assert.ok(engine.catalog[3].features.some(f=>f.type==="ice"));
  assert.match(html,/course-challenges\.js/);
  assert.match(h.el("briefHazards").textContent,/Ravins/);
});
test("narrow bridges penalize driving on the edge but retain a center path",()=>{
  const h=harness();h.start();
  const bridge=h.win.__test.course().features.find(f=>f.type==="bridge");
  const p=h.win.__test.player(),at=h.win.__test.at(bridge.s);
  p.x=at.x+at.nx*86;p.y=at.y+at.ny*86;p.speed=90;
  h.win.__test.updatePlayer(.016);
  assert.ok(p.hp<100,"Bridge edges must cause a fall");
  assert.ok(p.invulnerable>0,"Respawn must be protected");
  assert.match(h.el("eventToast").textContent,/CHUTE/);
  assert.ok(p.fall,"The fall must animate before teleporting");
  h.advance(82);
  assert.equal(p.fall,null,"Respawn should finish after the fall animation");
  assert.ok(Math.hypot(p.x-at.x,p.y-at.y)>100,"Respawn must return to an earlier checkpoint");
});
test("oil lowers steering grip, and ramp launches the vehicle",()=>{
  const h=harness();h.start();
  const p=h.win.__test.player(),hazards=h.win.__test.course().features;
  const oil=hazards.find(f=>f.type==="oil"),atOil=h.win.__test.at(oil.s);
  p.x=atOil.x+atOil.nx*oil.lane;p.y=atOil.y+atOil.ny*oil.lane;p.speed=140;
  h.win.__test.updatePlayer(.016);
  assert.ok(p.roadGrip<.5,"Oil must change car physics");
  const ramp=hazards.find(f=>f.type==="ramp"),atRamp=h.win.__test.at(ramp.s);
  p.x=atRamp.x+atRamp.nx*ramp.lane;p.y=atRamp.y+atRamp.ny*ramp.lane;
  p.speed=215;p.airZ=0;p.airV=0;
  h.win.__test.updatePlayer(.016);
  assert.ok(p.airZ>0,"Ramp must launch car into air");
  assert.ok(p.airV>0);
});
test("missing a jump triggers checkpoint respawn and time penalty",()=>{
  const h=harness();h.start();
  const p=h.win.__test.player(),gap=h.win.__test.course().features.find(f=>f.type==="gap");
  const at=h.win.__test.at(gap.s);
  p.x=at.x+at.nx*gap.lane;p.y=at.y+at.ny*gap.lane;p.airZ=0;p.airV=0;p.speed=75;
  h.win.__test.updatePlayer(.016);
  assert.ok(p.hp<100);
  assert.match(h.el("eventToast").textContent,/SAUT MANQUÉ/);
});

test("destroyed player respawns in the same race with three-second penalty",()=>{
  const h=harness();h.start();
  const p=h.win.__test.player();
  const before=h.el("timer").textContent;
  p.hp=0;
  const start=h.win.__test.state();
  h.advance(1);
  assert.ok(p.fall,"Destroyed car should visibly fall before respawn");
  assert.ok(h.el("eventToast").textContent.includes("+3 S"));
  h.advance(82);
  assert.equal(start,"race");
  assert.equal(h.win.__test.state(),"race","Destruction must not end the race");
  assert.equal(p.hp,100,"Respawn restores all armor");
  assert.ok(p.spawnPhase>=0,"Respawn has a materialization phase");
  assert.ok(p.invulnerable>0,"Spawn protection prevents immediate re-destruction");
  assert.ok(h.win.__test.player().progress>=0);
  const t=h.el("timer").textContent;
  assert.notEqual(t,before);
  assert.ok(Number(t.slice(3))>=3,"Timer includes the three-second penalty");
});

test("a lethal bridge fall charges only three seconds, and the race keeps going",()=>{
  const h=harness();h.start();
  const bridge=h.win.__test.course().features.find(f=>f.type==="bridge");
  const at=h.win.__test.at(bridge.s),p=h.win.__test.player();
  p.x=at.x+at.nx*86;p.y=at.y+at.ny*86;p.hp=1;p.speed=90;
  const before=h.win.__test.elapsed();
  h.win.__test.updatePlayer(.016);
  assert.equal(h.win.__test.state(),"race");
  assert.equal(p.hp,0,"Car is damaged until the fall animation ends");
  assert.ok(p.fall,"Fatal bridge falls are animated");
  assert.equal(h.win.__test.elapsed()-before,3,"Fatal falls must not accumulate the ordinary 2 s");
  assert.ok(h.el("eventToast").textContent.includes("+3 S"));
  h.advance(80);
  assert.equal(p.hp,100);
});
test("a non-lethal bridge fall still has the original two-second penalty",()=>{
  const h=harness();h.start();
  const bridge=h.win.__test.course().features.find(f=>f.type==="bridge");
  const at=h.win.__test.at(bridge.s),p=h.win.__test.player();
  p.x=at.x+at.nx*86;p.y=at.y+at.ny*86;p.hp=90;p.speed=90;
  const before=h.win.__test.elapsed();
  h.win.__test.updatePlayer(.016);
  assert.equal(h.win.__test.state(),"race");
  assert.ok(p.hp>0&&p.hp<90);
  assert.ok(Math.abs(h.win.__test.elapsed()-before-2)<1e-9);
});
test("lethal rocket destroys and repairs the player without losing the race",()=>{
  const h=harness();h.start();
  const p=h.win.__test.player(),boss=h.win.__test.ais()[2];
  p.hp=5;
  h.win.__test.rockets().push({x:p.x-5,y:p.y,angle:0,ttl:1,owner:boss,target:null,isPlayer:false});
  h.win.__test.updateRockets(.001);
  assert.equal(p.hp,0);
  const before=h.win.__test.elapsed();
  h.advance(1);
  assert.equal(h.win.__test.state(),"race");
  assert.ok(p.fall,"Lethal rockets initiate the fall animation");
  assert.ok(h.win.__test.elapsed()>=before+3);
  h.advance(80);
  assert.equal(p.hp,100);
  assert.ok(p.invulnerable>0);
  h.win.__test.rockets().push({x:p.x-5,y:p.y,angle:0,ttl:1,owner:boss,target:null,isPlayer:false});
  h.win.__test.updateRockets(.001);
  assert.equal(p.hp,100,"Spawn immunity prevents immediate follow-up rocket damage");
});

test("AI also visibly fall from a bridge then return without losing their race",()=>{
  const h=harness();h.start();
  const bridge=h.win.__test.course().features.find(f=>f.type==="bridge");
  const a=h.win.__test.ais()[0],originalHp=a.hp;
  a.progress=bridge.s-8;a.lane=88;a.airZ=0;a.airV=0;
  h.win.__test.updateAI(.08);
  assert.ok(a.fall,"AI crossing outside the bridge must animate a fall");
  assert.equal(a.finished,false);
  const frozen=a.progress;
  h.advance(24);
  assert.ok(a.fall&&a.airZ<0,"Falling car descends below the track");
  assert.equal(a.progress,frozen,"AI cannot keep racing while falling");
  h.advance(65);
  assert.equal(a.fall,null,"AI respawns on the road");
  assert.ok(a.hp<originalHp&&a.hp>0,"AI loses armor but is not eliminated");
  assert.ok(a.invulnerable>0,"AI return with brief collision protection");
  assert.equal(a.finished,false);
});
test("AI return after missing a jump, not teleport instantly",()=>{
  const h=harness();h.start();
  const gap=h.win.__test.course().features.find(f=>f.type==="gap");
  const a=h.win.__test.ais()[1];
  a.progress=gap.s-8;a.lane=gap.lane;a.airZ=0;a.airV=0;
  h.win.__test.updateAI(.06);
  assert.ok(a.fall);
  h.advance(85);
  assert.equal(a.fall,null);
  assert.equal(a.finished,false);
});
test("an airborne player who leaves the road has a cinematic fall and returns",()=>{
  const h=harness();h.start();
  const p=h.win.__test.player(),at=h.win.__test.at(950);
  p.x=at.x+at.nx*142;p.y=at.y+at.ny*142;
  p.speed=120;p.airZ=67;p.airV=90;
  const before=h.win.__test.elapsed();
  h.win.__test.updatePlayer(.016);
  assert.ok(p.fall);
  assert.ok(h.el("eventToast").textContent.includes("HORS PISTE"));
  assert.ok(Math.abs(h.win.__test.elapsed()-before-2)<1e-8);
  h.advance(85);
  assert.equal(p.fall,null);
  assert.equal(h.win.__test.state(),"race");
});
test("destroyed enemies return and can only give one destruction bonus each",()=>{
  const h=harness();h.start();
  const ai=h.win.__test.ais()[0],baseHp=ai.hp;
  h.win.__test.damageOpponent(ai,500,1);
  assert.ok(ai.fall);
  assert.equal(h.win.__test.knockouts(),1);
  h.advance(84);
  assert.equal(ai.fall,null);
  assert.equal(ai.hp,baseHp);
  assert.equal(ai.finished,false);
  ai.invulnerable=0;
  h.win.__test.damageOpponent(ai,500,1);
  assert.ok(ai.fall);
  assert.equal(h.win.__test.knockouts(),1,"Respawned AI must not grant unlimited credits");
});

test("a rival who crossed first cannot be overtaken in the result by distance overshoot",()=>{
  const h=harness();h.start();
  const a=h.win.__test.ais()[2],p=h.win.__test.player();
  const finish=160+3*h.win.__test.length();
  // Let the boss cross normally, recording the fact that its race is finished.
  a.progress=finish-2;a.lane=0;a.stun=0;
  h.advance(1);
  assert.equal(a.finished,true,"Boss must actually finish before the player");
  p.progress=finish+120;
  for(const other of h.win.__test.ais().slice(0,2))other.progress=0;
  assert.ok(p.progress>a.progress,"Old bug: player's distance overtakes parked finisher");
  assert.equal(h.win.__test.position(),2,"First finisher must remain ahead");
  h.win.__test.finish();
  assert.match(h.el("resultStats").innerHTML,/2 \/ 4/);
  assert.equal(h.el("dialogTitle").textContent,"2E PLACE !");
  assert.match(h.el("resultStats").innerHTML,/360 CR/);
  assert.equal(h.win.__test.progress().credits,640+h.win.__test.goldEarned(),"Second-place prize plus first podium bonus and gold collected");
});

test("the podium counts every AI that already finished even if it stopped moving",()=>{
  const h=harness();h.start();
  const p=h.win.__test.player(),finish=160+3*h.win.__test.length();
  p.progress=finish+90;
  h.win.__test.ais().forEach(a=>{a.finished=true;a.progress=finish+5;});
  assert.equal(h.win.__test.position(),4);
  h.win.__test.finish();
  assert.equal(h.el("dialogTitle").textContent,"4E PLACE !");
  assert.match(h.el("resultStats").innerHTML,/4 \/ 4/);
  assert.equal(h.win.__test.progress().credits,230+h.win.__test.goldEarned(),"Fourth place gets no first qualification");
  assert.equal(h.win.__test.progress().cleared.includes("0:0"),false);
});

test("second in a regional boss final is not incorrectly counted as boss victory",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({
    credits:5000,transports:["trailer"],paidEntries:["0:1","0:2","0:3"],
    cleared:["0:0","0:1","0:2"],zone:0,race:3
  })});
  h.start();
  const finish=160+3*h.win.__test.length(),p=h.win.__test.player();
  const boss=h.win.__test.ais()[2];
  boss.finished=true;boss.progress=finish+1;
  h.win.__test.ais().slice(0,2).forEach(a=>a.progress=0);
  p.progress=finish+200;
  h.win.__test.finish();
  assert.equal(h.el("dialogTitle").textContent,"2E PLACE !");
  assert.match(h.el("dialogDetail").textContent,/Termine premier/);
  assert.equal(h.win.__test.progress().cleared.includes("0:3"),false);
  assert.equal(h.win.__test.progress().credits,5360);
});

test("pre-race briefing shows a real circuit map with start and hazard legend",()=>{
  const h=harness(),info=h.win.__test.coursePreviewDetails();
  assert.match(html,/id="coursePreviewMap"/);
  assert.match(html,/CARTE DU CIRCUIT/);
  assert.ok(info.pointCount>=200,"Map must use sampled racing-track geometry");
  assert.equal(info.zone,0);
  assert.equal(info.race,0);
  assert.ok(info.hazards.length>=5);
  assert.ok(info.labels.includes("PONTS"));
  assert.ok(info.labels.includes("SAUTS"));
  assert.ok(Number.isFinite(info.start.x)&&Number.isFinite(info.start.y));
  assert.equal(h.el("coursePreviewMap").attributes["aria-label"].includes("LES GORGES ROUGES"),true);
  assert.match(h.el("courseMapFeatures").textContent,/PONTS/);
});
test("the briefing map updates with the selected Alpine race, including ice",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({
    credits:6000,transports:["trailer"],paidEntries:["0:1","0:2","0:3"],
    cleared:["0:0","0:1","0:2"],zone:0,race:3
  })});
  let info=h.win.__test.coursePreviewDetails();
  assert.equal(info.race,3);
  assert.ok(info.labels.includes("VERGLAS"));
  assert.match(h.el("courseMapFeatures").textContent,/VERGLAS/);
  assert.match(h.el("coursePreviewMap").attributes["aria-label"],/SOMMET DES TITANS/);
  const point=h.win.__test.at(160);
  assert.ok(Math.hypot(point.x-info.start.x,point.y-info.start.y)<.001);
  h.groups["[data-race]"][1].events.click();
  info=h.win.__test.coursePreviewDetails();
  assert.equal(info.race,1);
  assert.ok(info.hazards.filter(f=>f.type==="bridge").length>=2);
  assert.ok(!info.labels.includes("VERGLAS"));
  assert.match(h.el("coursePreviewMap").attributes["aria-label"],/PONT DU CHAOS/);
});
test("coastal courses display their own track instead of reusing the Alps map",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({
    credits:6000,transports:["trailer","boat"],
    cleared:["0:0","0:1","0:2","0:3"],zone:1,race:0
  })});
  const info=h.win.__test.coursePreviewDetails();
  assert.equal(info.zone,1);
  assert.equal(info.race,0);
  assert.ok(info.hazards.length>=5,"Coastal world now features real terrain dangers");
  assert.match(h.el("courseMapFeatures").textContent,/EAU|SABLE|PONTS/);
  assert.match(h.el("coursePreviewMap").attributes["aria-label"],/BAIE D'AZUR/);
});
test("map preview remains accessible and scales for mobile layouts",()=>{
  const styles=fs.readFileSync(path.join(__dirname,"..","style.css"),"utf8");
  assert.match(styles,/#menu #coursePreviewMap\{[^}]*width:100%/);
  assert.match(styles,/#menu \.course-map-scene\{[^}]*min-width:0/);
  assert.match(html,/role="img" aria-label="Tracé du circuit/);
});

test("twenty unique tracks cover five playable worlds and their permanent bosses",()=>{
  const cleared=Array.from({length:5},(_,z)=>Array.from({length:4},(_,i)=>z+":"+i)).flat();
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:65000,transports:["trailer","boat","plane"],cleared,paidEntries:cleared,zone:0,race:0})});
  const actual=new Set();
  const bosses=["LE BOUQUETIN","SIRÈNE DU CAP","LE BLIZZARD","LE SCORPION","LE JAGUAR"];
  for(let z=0;z<5;z++){
    const zoneBtn=h.groups["[data-zone]"][z];
    assert.equal(zoneBtn.disabled,false,"World "+z+" should be selectable");
    zoneBtn.events.click();
    assert.equal(h.win.__test.track(),z);
    assert.equal(h.win.__test.ais()[2].name,bosses[z]);
    for(let i=0;i<4;i++){
      if(i)h.groups["[data-race]"][i].events.click();
      const map=h.win.__test.coursePreviewDetails();
      assert.equal(map.zone,z);
      assert.equal(map.race,i);
      assert.ok(map.pointCount>100);
      assert.ok(map.hazards.length>=5,"Every course needs distinctive obstacles");
      const courseName=h.el("briefRace").textContent;
      assert.ok(!actual.has(courseName),"Course names should be unique");
      actual.add(courseName);
    }
  }
  assert.equal(actual.size,20);
  assert.equal(h.el("careerProgress").textContent,"20 / 20 ÉPREUVES");
});
test("aviation only unlocks after the coastal boss; the same plane serves later worlds",()=>{
  const all=(max)=>Array.from({length:max},(_,z)=>Array.from({length:4},(_,i)=>z+":"+i)).flat();
  const previous=all(2);
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:8000,transports:["trailer","boat"],cleared:previous,zone:1,race:3})});
  assert.equal(h.groups["[data-zone]"][2].disabled,true);
  assert.equal(h.groups["[data-transport]"][2].disabled,false);
  h.groups["[data-transport]"][2].events.click();
  assert.ok(h.win.__test.progress().transports.includes("plane"));
  assert.equal(h.win.__test.progress().credits,3000);
  assert.equal(h.groups["[data-zone]"][2].disabled,false);
  assert.equal(h.groups["[data-zone]"][3].disabled,true,"Desert still needs northern boss");
  h.groups["[data-zone]"][2].events.click();
  assert.equal(h.win.__test.track(),2);
  assert.equal(h.win.__test.ais()[2].name,"LE BLIZZARD");
  assert.equal(h.win.__test.raceUnlocked(2,0),true);
});
test("Sahara and Amazonia unlock in order after regional championships",()=>{
  const group=z=>Array.from({length:4},(_,i)=>z+":"+i);
  const firstThree=[...group(0),...group(1),...group(2)];
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:10000,transports:["trailer","boat","plane"],cleared:firstThree,zone:3,race:0})});
  assert.equal(h.win.__test.track(),3);
  assert.equal(h.win.__test.ais()[2].name,"LE SCORPION");
  assert.equal(h.groups["[data-zone]"][4].disabled,true);
  const unlock=h.win.__test.progress();
  unlock.cleared.push(...group(3));
  // Unlock state is derived from the cleared races, not stale button CSS.
  h.groups["[data-zone]"][4].events.click();
  assert.equal(h.win.__test.track(),4);
  assert.equal(h.win.__test.ais()[2].name,"LE JAGUAR");
  assert.equal(h.win.__test.raceUnlocked(4,0),true);
});
test("paid races in the new worlds are saved and never charged twice",()=>{
  const group=z=>Array.from({length:4},(_,i)=>z+":"+i);
  const saved=JSON.stringify({credits:10000,transports:["trailer","boat","plane"],cleared:[...group(0),...group(1),"2:0"],zone:2,race:1});
  const h=harness({loubkarting_progress_v2:saved});
  assert.equal(h.el("startBtn").disabled,true);
  const old=h.win.__test.progress().credits;
  h.el("unlockRaceBtn").events.click();
  assert.equal(h.win.__test.raceUnlocked(2,1),true);
  assert.equal(h.win.__test.progress().credits,old-260);
  assert.ok(h.win.__test.progress().paidEntries.includes("2:1"));
  const again=harness(h.saved);
  assert.equal(again.win.__test.progress().paidEntries.includes("2:1"),true);
  assert.equal(again.el("startBtn").disabled,false);
});
test("new biome features expose snow, shifting sand, water, mud and fallen logs",()=>{
  const cleared=Array.from({length:5},(_,z)=>Array.from({length:4},(_,i)=>z+":"+i)).flat();
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:10000,transports:["trailer","boat","plane"],cleared,paidEntries:cleared,zone:0,race:0})});
  for(const [zone,type] of [[1,"water"],[2,"ice"],[3,"sand"],[4,"mud"]]){
    h.groups["[data-zone]"][zone].events.click();
    const f=h.win.__test.course().features.find(v=>v.type===type);
    assert.ok(f,"Biome "+zone+" needs "+type);
    const detected=h.win.__test.courseHazardAt(f.s,f.lane||0);
    assert.equal(detected[type].id,f.id);
    assert.ok(h.win.__test.coursePreviewDetails().labels.length>=2);
  }
  assert.ok(h.win.__test.course().features.some(v=>v.type==="log"));
});
test("new saves preserve old career status and world 0 race identifiers",()=>{
  const saved=JSON.stringify({credits:1200,transports:["trailer","boat"],cleared:["0:0","0:1","0:2","0:3"],paidEntries:["0:1","0:2","0:3"],zone:1,race:0});
  const h=harness({loubkarting_progress_v2:saved});
  assert.equal(h.win.__test.track(),1);
  assert.equal(h.el("briefRace").textContent,"BAIE D'AZUR");
  assert.equal(h.win.__test.progress().cleared.length,4);
  assert.equal(h.win.__test.progress().paidEntries.length,3);
});
