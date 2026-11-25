import './fonts.css';
import './style.css';
import { experience, skillGroups, cases } from './data';
import { initAudio } from './audio';

const star = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="m50 0 10 35 35-20-20 35 25 10-38 8-12 32-10-32L0 60l34-12L15 15l29 20z" fill="currentColor"/></svg>';
const tags = (items:string[]) => items.map(s=>`<span>${s}</span>`).join('');
const wave = Array.from({length:45},(_,i)=>`<i style="--h:${18+Math.abs(Math.sin(i*1.77)*Math.cos(i*.13))*82}%;--i:${i}"></i>`).join('');
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<div class="opening" aria-hidden="true"><span>THINK.</span><span>BUILD.</span><span>BECOME.</span><button id="skip-intro" tabindex="-1">SKIP INTRO</button></div>
<header class="header">
  <a class="brand" href="#top" aria-label="Kunal Maurya home"><span>KM<span class="brand-dot">.</span></span></a>
  <nav class="desktop-nav" aria-label="Main navigation"><a href="#work">Selected work</a><a href="#profile">The person</a><a href="#experience">Experience</a><a href="#contact">Get in touch</a></nav>
  <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="menu"><span>MENU</span><i></i><i></i></button>
</header>
<dialog id="menu" class="menu" aria-label="Portfolio directory"><div class="menu-top"><span>KUNAL MAURYA / DIRECTORY</span><button id="close-menu" aria-label="Close navigation">CLOSE ×</button></div><nav aria-label="Expanded navigation"><a href="#work">Selected work<span>Explore the systems</span></a><a href="#profile">The person<span>Behind the code</span></a><a href="#experience">Experience<span>The journey so far</span></a><a href="#toolkit">Toolkit<span>Tools of the trade</span></a><a href="#contact">Make contact<span>Start a conversation</span></a></nav><p>REASONING IS ONLY THE BEGINNING.</p></dialog>
<main id="main">
<section class="hero" id="top" aria-labelledby="hero-name">
  <div class="hero-meta"><span><b class="square"></b> PERSONAL DOSSIER / 2026</span><span>NEW DELHI, INDIA <span class="clock" id="local-time"></span></span></div>
  <div class="hero-type"><p class="eyebrow hero-eyebrow">THE PERSON BEHIND THE SYSTEMS</p><h1 id="hero-name"><span class="name-first">KUNAL</span><span class="name-last">MAURYA<span class="name-period">.</span></span></h1></div>
  <div class="hero-art" aria-hidden="true">
    <div class="art-orbit"></div><div class="art-cross cross-a">+</div><div class="art-cross cross-b">+</div>
    <svg class="signal-mask" viewBox="0 0 650 680" fill="none">
      <defs><pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="#111"/></pattern><pattern id="lines" width="7" height="7" patternTransform="rotate(35)" patternUnits="userSpaceOnUse"><path d="M0 0V7" stroke="#f4f3eb" stroke-width="1"/></pattern></defs>
      <path class="mask-shadow" d="m135 145 365-90 91 356-217 214-283-92z" fill="url(#dots)"/>
      <path d="m106 171 310-93 151 240-73 252-269 52-142-230z" fill="#111"/>
      <path d="m120 155 297-98 95 57-277 104-69 191-83-17z" fill="#f4f3eb" stroke="#111" stroke-width="3"/>
      <path d="m176 204 256-90 95 224-76 217-216 52-120-215z" fill="#ed1834"/>
      <path d="m176 204 85-30-65 227 39 206-120-215z" fill="#b80b25"/>
      <path d="m241 232 182-58 69 156-119-37-141 55z" fill="#111"/>
      <path d="m230 352 138-45 127 38-38 79-95-46-127 52-51-34z" fill="#f4f3eb"/>
      <path d="m246 362 104-33-33 48-72 28zM391 329l81 28-18 35-56-25z" fill="#111"/>
      <path d="m316 418 42-24 24 81-48 28z" fill="#111"/>
      <path d="m251 496 77 30 102-55-48 78-105 28z" fill="#111"/>
      <path d="m277 577 105-28 48-78 27-47 38-79-3-15-69-156 9-60 95 224-76 217-216 52z" fill="url(#lines)" opacity=".5"/>
      <path d="m85 327 122-84-45 95 74-27-53 85-111 36 48-73-45 1zM480 157l69-44-20 78 59-10-39 63-69 5 32-55z" fill="#111"/>
      <path d="m100 479 74 17-9 11-90 9zM462 589l92-76 26 7-107 88z" fill="#ed1834"/>
      <path d="m212 105 63-61M481 71l18-37M584 288l47-4M104 578l-40 28" stroke="#111" stroke-width="3"/>
      <circle cx="369" cy="354" r="197" stroke="#111" stroke-dasharray="3 10" opacity=".35"/>
    </svg>
    <div class="art-label"><span>HUMAN INTENT.</span><strong>AGENTIC EXECUTION.</strong></div><span class="art-caption">ORIGINAL SIGNAL MASK / KM</span>
  </div>
  <div class="hero-bottom"><div class="hero-description"><span class="hero-star">${star}</span><div><h2>AGENTIC AI &<br>LLM ENGINEER</h2><p>I build agents that move<br>from reasoning to real work.</p></div></div><a class="cut-button" href="#work">EXPLORE MY WORK <span class="button-plus">+</span></a><span class="scroll-note">SCROLL TO DISCOVER<span>↓</span></span></div>
</section>
<div class="ticker-frame"><div class="ticker" aria-hidden="true"><div>${Array(4).fill('<span>THINK BEYOND THE PROMPT</span><b>✦</b><span>BUILD WHAT COMES NEXT</span><b>✦</b>').join('')}</div></div><button id="motion-toggle" aria-pressed="false" aria-label="Pause decorative motion">PAUSE MOTION Ⅱ</button></div>
<section class="work section-pad" id="work" aria-labelledby="work-title">
 <div class="section-heading reveal"><div><p class="eyebrow">IDEAS, PUT TO WORK</p><h2 id="work-title">SELECTED<span class="outline-text"> WORK</span></h2></div><p>A few systems I’ve helped<br>bring to life.</p></div>
 <article class="featured-project reveal">
   <div class="project-art document-art" aria-label="Conceptual diagram of the resume agent workflow"><span class="art-kicker">INPUT / REASON / REFINE</span><div class="doc-sheet doc-back"><b>JOB DESCRIPTION</b><i></i><i></i><i></i><span>KEYWORDS EXTRACTED</span></div><div class="doc-sheet doc-front"><b>RESUME<span>_</span></b><i></i><i></i><i></i><div class="doc-node">LANG<br>GRAPH</div><em>STRUCTURE VALIDATED ✓</em></div><span class="diagram-caption">CONCEPTUAL WORKFLOW</span><div class="result-stamp">80%<span>LESS MANUAL<br>CUSTOMIZATION</span></div></div>
   <div class="project-copy"><p class="eyebrow">PERSONAL PROJECT / AI AUTOMATION</p><h3>THE RIGHT WORDS.<br><span>LESS BUSYWORK.</span></h3><p class="project-name">ATS Resume Tailoring Agent</p><p>An autonomous workflow that turns a job description into a tailored, structurally validated LaTeX resume.</p><div class="tags">${tags(['Python','LangGraph','FastAPI','Docker'])}</div><button class="text-button" data-case="ats">OPEN CASE FILE <span>+</span></button></div>
 </article>
 <div class="work-pair">
 <article class="project-small reveal"><div class="project-art qa-art"><span class="art-kicker">CHIRPN / PROFESSIONAL WORK</span><div class="qa-window"><div><span>QA_AGENT.RUN</span><b>● ● ●</b></div><p><span>✓</span> CONTEXT LOADED</p><p><span>✓</span> TESTS GENERATED</p><p><span>✓</span> CROSS-BROWSER CHECK</p><strong>10+ MIN <s> </s><span>&lt;4 MIN</span></strong></div><span class="diagram-caption">CONCEPTUAL EXECUTION VIEW</span><span class="qa-spark">${star}</span></div><div class="small-copy"><p class="eyebrow">AI + DEVELOPER TOOLS</p><h3>MAKE QUALITY<br>AUTOMATIC.</h3><p>AI-powered QA Agent · Chirpn</p><button class="text-button" data-case="qa">OPEN CASE FILE <span>+</span></button></div></article>
 <article class="project-small reveal"><div class="project-art audio-art"><span class="art-kicker">FRUGALX / PROFESSIONAL WORK</span><span class="sound-word">LISTEN<br><i>CLOSER.</i></span><div class="sound-wave">${wave}</div><span class="audio-search">“Find meaning in the noise.”</span><span class="diagram-caption">CONCEPTUAL AUDIO INDEX</span></div><div class="small-copy"><p class="eyebrow">LOCAL INFERENCE + SEMANTIC SEARCH</p><h3>SMALL FOOTPRINT.<br>DEEPER SIGNAL.</h3><p>Local Audio Intelligence · FrugalX</p><button class="text-button" data-case="audio">OPEN CASE FILE <span>+</span></button></div></article>
 </div>
 <p class="work-note">Professional work is attributed to the respective employers. Results are reported in my resume; visuals are original conceptual diagrams.</p>
</section>
<section class="profile section-pad" id="profile" aria-labelledby="profile-title"><div class="profile-top reveal"><p class="eyebrow">THE HUMAN IN THE LOOP</p><span class="profile-star">${star}</span></div><h2 class="reveal" id="profile-title">CURIOUS MIND.<br><span>PRACTICAL</span> INSTINCT.</h2><div class="profile-bottom reveal"><span class="profile-tag">BEHIND THE SYSTEMS<br>IS A PERSON.</span><div><p>I’m Kunal, an Agentic AI & LLM Engineer based in New Delhi. My work connects language models, orchestration, and backend engineering to turn complex workflows into useful systems.</p><p>From evaluating model behavior to building local inference engines and automated QA, I work across the space between a promising idea and a reliable implementation.</p><a class="text-button" href="/Kunal-Maurya-Resume.pdf" target="_blank" rel="noopener">READ MY RESUME <span>+</span></a></div></div></section>
<section class="experience section-pad" id="experience" aria-labelledby="experience-title"><div class="section-heading reveal"><div><p class="eyebrow">BUILT THROUGH EXPERIENCE</p><h2 id="experience-title">THE JOURNEY<span class="red">.</span></h2></div><span class="section-side-note">SELECT A CHAPTER</span></div><div class="experience-layout"><div class="role-menu" role="tablist" aria-label="Experience" aria-orientation="vertical">${experience.map((e,i)=>`<button role="tab" id="role-${i}" aria-controls="role-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-role="${i}"><span>${e.company}</span><small>${e.role}</small><b>+</b></button>`).join('')}</div><div class="role-panels">${experience.map((e,i)=>`<article role="tabpanel" id="role-panel-${i}" aria-labelledby="role-${i}" tabindex="0" ${i?'hidden':''}><p class="eyebrow">${e.date}</p><h3>${e.role}</h3><p class="role-focus">${e.focus}</p><ul>${e.points.map(p=>`<li>${p}</li>`).join('')}</ul><div class="tags">${tags(e.tags)}</div></article>`).join('')}</div></div></section>
<section class="toolkit section-pad" id="toolkit" aria-labelledby="toolkit-title"><div class="section-heading reveal"><div><p class="eyebrow">THE ABILITY MENU</p><h2 id="toolkit-title">MY TOOLKIT<span class="red">.</span></h2></div><p>The right tool.<br>For the real problem.</p></div><div class="toolkit-layout"><div class="skill-menu" role="tablist" aria-label="Technical skill categories" aria-orientation="vertical">${skillGroups.map((g,i)=>`<button role="tab" aria-selected="${!i}" tabindex="${i?-1:0}" id="skill-${i}" aria-controls="skill-panel-${i}" data-skill="${i}">${g.name}<span>+</span></button>`).join('')}</div><div class="skill-panels">${skillGroups.map((g,i)=>`<div id="skill-panel-${i}" role="tabpanel" aria-labelledby="skill-${i}" tabindex="0" ${i?'hidden':''}><p class="eyebrow">${g.label}</p><p>${g.text}</p><div class="skill-cloud">${g.skills.map(s=>`<span>${s}</span>`).join('')}</div></div>`).join('')}</div></div></section>
<section class="education section-pad" aria-labelledby="education-title"><div class="education-main reveal"><p class="eyebrow">FOUNDATIONS & FORWARD MOTION</p><h2 id="education-title">ALWAYS<br><span class="outline-text">LEARNING.</span></h2><p class="degree">B.Tech · Computer Science & Technology</p><p>Maharaja Agrasen Institute of Technology<br>GGSIPU, Delhi · 2022–2026</p><details><summary>Relevant coursework <span>+</span></summary><p>Data Structures & Algorithms, Machine Learning, Deep Learning, NLP, Computer Vision, DBMS, Operating Systems.</p></details></div><div class="credentials reveal"><p class="eyebrow">CREDENTIALS & MILESTONES</p><a href="https://drive.google.com/file/d/1ZrvLxznH8EJylWBG4Q7gAXqxLEty_HUD/view?usp=sharing" target="_blank" rel="noopener noreferrer"><span>Claude 101<small>ANTHROPIC</small></span><b>+</b></a><a href="https://drive.google.com/file/d/1KaWO3WTsqk2FLBfPz_pkFx75kcdXLWur/view?usp=sharing" target="_blank" rel="noopener noreferrer"><span>AI Fluency: Framework & Foundations<small>ANTHROPIC</small></span><b>+</b></a><div><span>Google Arcade · Champion milestone<small>WINTER 2024</small></span><b>✦</b></div><a href="https://drive.google.com/file/d/1MBAD279i0uMgeCCdjK3-fU3XyGhb6AeY/view?usp=sharing" target="_blank" rel="noopener noreferrer"><span>Autonomous Agent Job Simulation<small>DATACOM / FORAGE · SIMULATION</small></span><b>+</b></a></div></section>
<section class="contact section-pad" id="contact" aria-labelledby="contact-title"><div class="contact-top"><p class="eyebrow">NEXT CHAPTER / YOUR MOVE</p><a href="#top">BACK TO TOP ↑</a></div><h2 class="reveal" id="contact-title">LET’S MAKE<br><span>SOMETHING</span> MATTER<span class="contact-star">${star}</span></h2><a class="email" href="mailto:kunalmaurya.mait@gmail.com">kunalmaurya.mait@gmail.com</a><div class="contact-bottom"><div><a href="https://github.com/kunalmaurya-17-24" target="_blank" rel="noopener noreferrer">GITHUB +</a><a href="https://www.linkedin.com/in/kunal-maurya-a58035304/" target="_blank" rel="noopener noreferrer">LINKEDIN +</a><a href="/Kunal-Maurya-Resume.pdf" download>DOWNLOAD RESUME +</a></div><button id="copy-email">COPY EMAIL +</button></div></section>
</main>
<footer><span>© ${new Date().getFullYear()} KUNAL MAURYA</span><span>HUMAN INTENT. AGENTIC EXECUTION.</span><span>DESIGNED TO THINK DIFFERENTLY.</span></footer>
<aside class="audio-player" id="audio-player" aria-label="Background music player"><button id="audio-toggle" aria-label="Play background music" aria-pressed="false"><span class="play-symbol" data-audio-icon aria-hidden="true">▶</span></button><div class="audio-track"><span id="audio-title">AFTER HOURS</span><span id="audio-status" aria-live="polite" aria-atomic="true">ORIGINAL INSTRUMENTAL · SOUND OFF</span></div><div class="equalizer" aria-hidden="true"><i></i><i></i><i></i><i></i></div><button id="audio-expand" aria-label="Show sound settings" aria-expanded="false" aria-controls="audio-settings">♫</button><div class="audio-settings" id="audio-settings" hidden><label for="audio-volume">VOLUME</label><input type="range" id="audio-volume" min="0" max="100" value="30"><button id="audio-mute" aria-label="Mute background music" aria-pressed="false"><span data-mute-label>MUTE</span></button><p>Original instrumental.<br>Playback starts only when you press play.</p></div></aside>
<dialog class="case-dialog" id="case-dialog" aria-labelledby="case-title"><button class="case-close" aria-label="Close case file">CLOSE ×</button><div id="case-content"></div></dialog>
<div class="toast" role="status" id="toast"></div>
`;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const art = document.querySelector<HTMLElement>('.hero-art')!;
const hero = document.querySelector<HTMLElement>('.hero')!;
document.querySelectorAll<HTMLElement>('.name-first,.name-last,.signal-mask').forEach(element=>element.addEventListener('animationend',()=>element.classList.add('entrance-complete'),{once:true}));
const audioSettings = document.querySelector<HTMLElement>('#audio-settings')!;
audioSettings.prepend(document.querySelector('.audio-track')!);
const intro = document.querySelector<HTMLElement>('.opening')!;
let visited = false;
try { visited = sessionStorage.getItem('visited') === '1'; } catch { /* Storage is optional. */ }
const closeIntro = () => { intro.classList.add('finished'); intro.setAttribute('aria-hidden','true'); document.querySelector<HTMLButtonElement>('#skip-intro')!.tabIndex=-1; document.body.classList.add('entered'); };
if (reduce.matches || visited) closeIntro();
else { intro.removeAttribute('aria-hidden'); document.querySelector('#skip-intro')!.removeAttribute('tabindex'); setTimeout(closeIntro,850); }
document.querySelector('#skip-intro')!.addEventListener('click',closeIntro);
try { sessionStorage.setItem('visited','1'); } catch { /* Private modes can deny storage. */ }

const menu = document.querySelector<HTMLDialogElement>('#menu')!;
const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
function closeMenu(){ menu.close(); menuButton.setAttribute('aria-expanded','false'); document.body.classList.remove('modal-open'); }
menuButton.addEventListener('click',()=>{menu.showModal();menuButton.setAttribute('aria-expanded','true');document.body.classList.add('modal-open');});
document.querySelector('#close-menu')!.addEventListener('click',closeMenu);
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
menu.addEventListener('close',()=>{menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('modal-open');});

function wireTabs(selector:string,prefix:string){
 const buttons = [...document.querySelectorAll<HTMLButtonElement>(selector)];
 const activate = (index:number,focus=false)=>{buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;document.querySelector<HTMLElement>(`#${prefix}-panel-${i}`)!.hidden=i!==index;});if(focus)buttons[index].focus();};
 buttons.forEach((b,i)=>{b.addEventListener('click',()=>activate(i));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(i+1)%buttons.length;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=buttons.length-1;else return;e.preventDefault();activate(n,true);});});
}
wireTabs('[data-role]','role');wireTabs('[data-skill]','skill');

const caseDialog = document.querySelector<HTMLDialogElement>('#case-dialog')!;
document.querySelectorAll<HTMLButtonElement>('[data-case]').forEach(b=>{b.setAttribute('aria-label',`Open ${cases.find(c=>c.id===b.dataset.case)!.name} case file`);b.addEventListener('click',()=>{
 const c=cases.find(c=>c.id===b.dataset.case)!;
 document.querySelector('#case-content')!.innerHTML=`<p class="eyebrow">${c.type}</p><h2 id="case-title">${c.name}</h2><p class="case-intro">${c.intro}</p><div class="tags">${tags(c.stack)}</div><h3>THE CHALLENGE</h3><p>${c.problem}</p><h3>THE ENGINEERING</h3><p>${c.approach}</p><h3>THE RESULT</h3><p>${c.result}</p>${c.url?`<a class="cut-button" href="${c.url}" target="_blank" rel="noopener noreferrer">VIEW ON GITHUB <span>+</span></a>`:'<p class="case-disclosure">Employer-owned work. Implementation described from professional experience; no public repository is supplied.</p>'}`;
 caseDialog.showModal();document.body.classList.add('modal-open');
});});
document.querySelector('.case-close')!.addEventListener('click',()=>caseDialog.close());
caseDialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
caseDialog.addEventListener('click',e=>{if(e.target===caseDialog){const r=caseDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)caseDialog.close();}});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.desktop-nav a').forEach(a=>{if(a.getAttribute('href')===`#${e.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}),{rootMargin:'-20% 0px -65% 0px'});
document.querySelectorAll('main section[id]').forEach(e=>navObserver.observe(e));
let ticking=false, scrollFrame=0, pointerFrame=0, pointerX=0, pointerY=0, motionPaused=false;
function updateScroll(){const y=window.scrollY;if(!reduce.matches&&!motionPaused)art.style.setProperty('--scroll',String(Math.min(y,950)));ticking=false;}
function onScroll(){if(!ticking){scrollFrame=requestAnimationFrame(updateScroll);ticking=true;}}
window.addEventListener('scroll',onScroll,{passive:true});
function onPointer(e:PointerEvent){if(reduce.matches||!finePointer.matches||motionPaused)return;pointerX=(e.clientX/window.innerWidth-.5)*10;pointerY=(e.clientY/window.innerHeight-.5)*8;if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{art.style.setProperty('--pointer-x',`${pointerX}px`);art.style.setProperty('--pointer-y',`${pointerY}px`);pointerFrame=0;});}
hero.addEventListener('pointermove',onPointer);
hero.addEventListener('pointerleave',()=>{art.style.setProperty('--pointer-x','0px');art.style.setProperty('--pointer-y','0px');});
const motionToggle=document.querySelector<HTMLButtonElement>('#motion-toggle')!;
motionToggle.addEventListener('click',()=>{motionPaused=!motionPaused;document.body.classList.toggle('motion-paused',motionPaused);motionToggle.setAttribute('aria-pressed',String(motionPaused));motionToggle.setAttribute('aria-label',motionPaused?'Resume decorative motion':'Pause decorative motion');motionToggle.textContent=motionPaused?'RESUME MOTION ▶':'PAUSE MOTION Ⅱ';art.style.setProperty('--scroll','0');art.style.setProperty('--pointer-x','0px');art.style.setProperty('--pointer-y','0px');});
const clock=document.querySelector('#local-time')!;
function tick(){clock.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date())+' IST';}tick();const clockInterval=setInterval(tick,60000);
document.querySelector('#copy-email')!.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('kunalmaurya.mait@gmail.com');document.querySelector('#toast')!.textContent='EMAIL COPIED';setTimeout(()=>document.querySelector('#toast')!.textContent='',2500);}catch{document.querySelector('#toast')!.textContent='kunalmaurya.mait@gmail.com';}});
document.querySelector('#audio-expand')!.addEventListener('click',()=>{const p=document.querySelector<HTMLElement>('#audio-settings')!;p.hidden=!p.hidden;document.querySelector('#audio-expand')!.setAttribute('aria-expanded',String(!p.hidden));});
const disposeAudio=initAudio();
function dispose(){observer.disconnect();navObserver.disconnect();clearInterval(clockInterval);cancelAnimationFrame(scrollFrame);cancelAnimationFrame(pointerFrame);window.removeEventListener('scroll',onScroll);hero.removeEventListener('pointermove',onPointer);disposeAudio();}
if(import.meta.hot)import.meta.hot.dispose(dispose);
