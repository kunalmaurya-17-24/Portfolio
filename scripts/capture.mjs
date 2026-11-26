import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const runtime = process.env.CODEX_NODE_MODULES || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1123-915-0_26.1123.915.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
let playwright;
try { playwright = createRequire(import.meta.url)('playwright'); } catch { playwright = createRequire(path.join(runtime,'package.json'))('playwright'); }
const pass = process.argv[2] || 'final';
const dir=path.resolve('docs/screenshots',pass);await mkdir(dir,{recursive:true});
const browser=await playwright.chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const sizes=[[1920,1080],[1440,900],[1366,768],[768,1024],[390,844]];
const report=[];
for(const [width,height] of sizes){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2100);
 await page.screenshot({path:path.join(dir,`${width}x${height}-hero.png`)});
 const pageHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<pageHeight;y+=Math.round(height*.65)){await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(130);}
 await page.waitForTimeout(1000);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);
 await page.screenshot({path:path.join(dir,`${width}x${height}-full.png`),fullPage:true});
 const layout=await page.evaluate(()=>({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,fonts:document.fonts.status,unrevealed:document.querySelectorAll('.reveal:not(.visible)').length}));
 report.push({width,viewportHeight:height,...layout,errors});
 if(width===1440){await page.locator('#work').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:path.join(dir,'desktop-work.png')});await page.locator('#experience').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:path.join(dir,'desktop-experience.png')});}
 if(width===390){await page.locator('[data-case="crosssense"]').click();await page.locator('#case-dialog[open]').waitFor();await page.waitForTimeout(700);await page.screenshot({path:path.join(dir,'mobile-case.png')});await page.keyboard.press('Escape');await page.locator('.menu-toggle').click();await page.locator('#menu[open]').waitFor();await page.waitForTimeout(700);await page.screenshot({path:path.join(dir,'mobile-menu.png')});await page.keyboard.press('Escape');}
 if(width===1440||width===390){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.locator('#audio-expand').click();await page.waitForFunction(()=>document.querySelector('#audio-player').dataset.configReady==='true');await page.waitForTimeout(300);await page.screenshot({path:path.join(dir,width===390?'mobile-audio.png':'desktop-audio.png')});}
 await page.close();
}
await browser.close();await writeFile(path.join(dir,'layout-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({dir,report},null,2));
