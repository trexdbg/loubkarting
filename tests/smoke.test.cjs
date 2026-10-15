"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","game.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const noop=()=>{};
const debugSource=source.replace("resetRace();setMenu();requestAnimationFrame(frame);",
"window.__test={player:()=>player,at:trackAt,length:()=>TRACK_LENGTH,state:()=>state,progress:()=>progress,track:()=>trackId,race:()=>raceIndex,selected:()=>selected,weapon:()=>selectedWeapon,ais:()=>ais,mines:()=>mines,shoot,finish:endRace};\nresetRace();setMenu();requestAnimationFrame(frame);");
assert.notEqual(debugSource,source,"Debug instrumentation anchor should exist.");

function harness(initial={}){
  const saved={...initial},elements={},listeners={},gradient={addColorStop:noop};
  const draw=new Proxy({createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
  function el(id){
    return elements[id] ||= {id,dataset:{},style:{},textContent:"",innerHTML:"",value:"normal",disabled:false,
      width:200,height:145,classList:{add:noop,remove:noop,toggle:noop},events:{},
      addEventListener(k,fn){this.events[k]=fn;},getContext:()=>draw,setPointerCapture:noop};
  }
  function group(key,ids){return ids.map(n=>{const x=el(key+n);x.dataset[key]=String(n);return x;});}
  const groups={
    "[data-car]":group("car",[0,1,2,3,4]),
    "[data-zone]":group("zone",[0,1,2,3,4,5]),
    "[data-race]":group("race",[0,1,2,3]),
    "[data-weapon]":group("weapon",["dart","pulse","mine"]),
    "[data-upgrade]":group("upgrade",["engine","armor","nitro"]),
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
      p.x=at.x;p.y=at.y;p.angle=Math.atan2(at.dy,at.dx);p.speed=0;p.hp=100;
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
  assert.equal((html.match(/data-zone="\d"/g)||[]).length,6);
  assert.equal((html.match(/data-race="\d"/g)||[]).length,4);
});

test("mountain opens first; beach and planned worlds stay locked",()=>{
  const h=harness();
  assert.equal(h.win.__test.track(),0);
  assert.equal(h.win.__test.race(),0);
  assert.equal(h.groups["[data-zone]"][0].disabled,false);
  assert.equal(h.groups["[data-zone]"][1].disabled,true);
  for(let i=2;i<6;i++)assert.equal(h.groups["[data-zone]"][i].disabled,true);
  assert.equal(h.groups["[data-race]"][1].disabled,true);
  assert.equal(h.win.__test.progress().ownedCars.join(","),"0");
});

test("all four mountain events grant progress and beach unlocks at boss victory",()=>{
  const h=harness(),lengths=[];
  for(let round=0;round<4;round++){
    if(round)h.groups["[data-race]"][round].events.click();
    assert.equal(h.win.__test.race(),round);
    lengths.push(Math.round(h.win.__test.length()));
    h.start();h.winInstant();
    assert.ok(h.win.__test.progress().cleared.includes("0:"+round));
    h.el("menuBtn").events.click();
  }
  assert.ok(new Set(lengths).size>=3,"Track variants must change geometry");
  assert.equal(h.groups["[data-zone]"][1].disabled,false);
  h.groups["[data-zone]"][1].events.click();
  assert.equal(h.win.__test.track(),1);
  assert.equal(h.win.__test.race(),0);
  assert.equal(h.groups["[data-race]"][1].disabled,true);
  assert.match(h.el("trackName").textContent,/LITTORAL/);
});

test("race naturally ends after three laps and saves best time",()=>{
  const h=harness();h.start();h.playFullRace();
  assert.ok(Number(h.saved.loubkarting_best_v3_0_0)>0);
  assert.match(h.el("resultStats").innerHTML,/GAIN/);
});

test("credits buy actual vehicles and improvements and survive reload",()=>{
  const h=harness({loubkarting_progress_v2:JSON.stringify({credits:30000,ownedCars:[0]})});
  h.groups["[data-car]"][1].events.click();
  h.groups["[data-car]"][2].events.click();
  h.groups["[data-car]"][3].events.click();
  h.groups["[data-car]"][4].events.click();
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
