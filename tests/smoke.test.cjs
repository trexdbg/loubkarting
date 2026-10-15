"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const noop = () => {};
const debugSource = source.replace(
  "resetRace();setMenu();requestAnimationFrame(frame);",
  "window.__test={player:()=>player,at:trackAt,length:()=>TRACK_LENGTH,state:()=>state,progress:()=>progress,track:()=>trackId};\nresetRace();setMenu();requestAnimationFrame(frame);"
);
assert.notEqual(debugSource, source, "test instrumentation anchor exists");

function harness(priorStorage = {}) {
  const data = {...priorStorage};
  const elements = {};
  const globalListeners = {};
  const gradient = {addColorStop: noop};
  const drawing = new Proxy({createLinearGradient:()=>gradient},{
    get(o,k){return k in o?o[k]:noop;},
    set(o,k,v){o[k]=v;return true;}
  });
  function el(id) {
    return elements[id] ||= {
      id, dataset:{}, textContent:"", innerHTML:"", value:"normal", disabled:false,
      width:200,height:145,style:{},classList:{add:noop,remove:noop,toggle:noop},
      listeners:{},getContext:()=>drawing,
      addEventListener(k,fn){this.listeners[k]=fn;},
      setPointerCapture:noop
    };
  }
  const cars=[0,1,2].map(n=>{const x=el("car"+n);x.dataset.car=n;return x;});
  const tracks=[0,1].map(n=>{const x=el("track"+n);x.dataset.track=n;return x;});
  const upgrades=["engine","armor","nitro"].map(n=>{const x=el("upgrade"+n);x.dataset.upgrade=n;return x;});
  const controls=["gas","brake","left","right","fire","nitro"].map(n=>{const x=el("control"+n);x.dataset.control=n;return x;});
  const doc={
    getElementById:el,
    querySelector(sel) {
      const m=sel.match(/^\[data-upgrade="([^"]+)"\]$/);
      return m?upgrades.find(x=>x.dataset.upgrade===m[1]):null;
    },
    querySelectorAll(q){
      return q==="[data-car]"?cars:
        q==="[data-track]"?tracks:
        q==="[data-upgrade]"?upgrades:
        q==="[data-control]"?controls:[];
    },
    addEventListener(k,fn){globalListeners[k]=fn;}
  };
  const win={innerWidth:1200,innerHeight:720,devicePixelRatio:1,addEventListener:noop,AudioContext:null};
  const storage={getItem:k=>data[k]??null,setItem(k,v){data[k]=String(v);}};
  let callback,now=0;
  const sandbox={
    document:doc,window:win,localStorage:storage,
    requestAnimationFrame:fn=>callback=fn,console,
    Math,Number,JSON,String,Array,Object,Set,Map,Date,Infinity,NaN,
  };
  vm.runInNewContext(debugSource,sandbox,{filename:"game.js",timeout:5000});
  function advance(frames=1) {
    for(let i=0;i<frames;i++){now+=16.6667;callback(now);}
  }
  function key(code,down=true){
    const name=down?"keydown":"keyup";
    globalListeners[name]({code,repeat:false,preventDefault:noop});
  }
  function race() {el("startBtn").listeners.click();advance(230);assert.equal(win.__test.state(),"race");}
  function finishByDrivingSimulation() {
    let d=300,limit=Math.ceil(win.__test.length()*3/26)+10;
    for(let i=0;i<limit&&win.__test.state()==="race";i++){
      d+=26;
      const at=win.__test.at(d),p=win.__test.player();
      p.x=at.x;p.y=at.y;p.angle=Math.atan2(at.dy,at.dx);p.speed=0;p.hp=100;
      advance();
    }
    assert.equal(win.__test.state(),"finish");
  }
  return {data,el,cars,tracks,upgrades,controls,win,key,race,advance,finishByDrivingSimulation};
}

test("game menu has all referenced DOM elements",()=>{
  const ids=[...source.matchAll(/\$\("([^"]+)"\)/g)].map(m=>m[1]);
  for(const id of new Set(ids))assert.ok(html.includes('id="'+id+'"'),"Missing DOM element "+id);
});

test("loads menu and switches track while preserving selected track",()=>{
  const h=harness();
  assert.equal(h.win.__test.state(),"menu");
  assert.equal(h.win.__test.track(),0);
  assert.ok(h.win.__test.length()>4000);
  h.tracks[1].listeners.click();
  assert.equal(h.win.__test.track(),1);
  assert.match(h.el("trackName").textContent,/COASTLINE RUSH/);
  assert.equal(JSON.parse(h.data.loubkarting_progress_v2).track,1);
  h.tracks[0].listeners.click();
  assert.equal(h.win.__test.track(),0);
});

test("accelerates, shoots and pauses/resumes with keyboard",()=>{
  const h=harness();h.race();
  h.key("ArrowUp");h.key("Space");h.advance(65);
  assert.ok(Number(h.el("speed").textContent)>0);
  assert.ok(Number(h.el("ammo").textContent)<5);
  h.key("Space",false);h.key("ArrowUp",false);
  h.key("KeyP");assert.equal(h.win.__test.state(),"paused");
  h.el("resumeBtn").listeners.click();assert.equal(h.win.__test.state(),"race");
});

test("awards race credits, buys upgrade and restores from local storage",()=>{
  const h=harness();h.tracks[1].listeners.click();h.race();h.finishByDrivingSimulation();
  const prize=h.win.__test.progress().credits;
  assert.ok(prize>=180);
  assert.match(h.el("resultStats").innerHTML,/GAIN/);
  assert.ok(Number(h.data.loubkarting_best_v2_1)>0);
  h.el("menuBtn").listeners.click();
  h.upgrades[0].listeners.click();
  assert.equal(h.win.__test.progress().engine,1);
  assert.equal(h.win.__test.progress().credits,prize-200);
  const saved=harness(h.data);
  assert.equal(saved.win.__test.track(),1);
  assert.equal(saved.win.__test.progress().engine,1);
  assert.equal(saved.win.__test.progress().credits,prize-200);
});

test("damaged and corrupted save data cannot break loading",()=>{
  const h=harness({loubkarting_progress_v2:'{"credits":-900,"engine":777,"armor":-2,"nitro":"oops","track":9}'});
  assert.equal(h.win.__test.progress().credits,0);
  assert.equal(h.win.__test.progress().engine,3);
  assert.equal(h.win.__test.progress().armor,0);
  assert.equal(h.win.__test.progress().nitro,0);
  assert.equal(h.win.__test.track(),1);
  assert.equal(h.upgrades[0].disabled,true);
  assert.doesNotThrow(()=>harness({loubkarting_progress_v2:"{broken"}));
});
