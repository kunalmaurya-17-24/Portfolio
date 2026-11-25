import {createRequire} from 'node:module';
const {chromium}=createRequire('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1123-915-0_26.1123.915.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/package.json')('playwright');
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:5173/');await p.waitForTimeout(2200);
const h=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<h;y+=500){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await p.waitForTimeout(150)}
await p.waitForTimeout(1000);await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>({unrevealed:[...document.querySelectorAll('.reveal:not(.visible)')].map(x=>x.className),names:[...document.querySelectorAll('.hero h1>span')].map(x=>({cls:x.className,clip:getComputedStyle(x).clipPath,opacity:getComputedStyle(x).opacity,rect:x.getBoundingClientRect().toJSON(),animations:x.getAnimations().map(a=>({time:a.currentTime,state:a.playState,timing:a.effect.getComputedTiming()}))}))})));
await p.screenshot({path:'docs/screenshots/return-to-top.png'});await p.screenshot({path:'docs/screenshots/debug-full.png',fullPage:true});await b.close();
