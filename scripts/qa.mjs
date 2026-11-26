import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const runtime = process.env.CODEX_NODE_MODULES || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1123-915-0_26.1123.915.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
let playwright;
try { playwright = require('playwright'); } catch { playwright = createRequire(path.join(runtime, 'package.json'))('playwright'); }
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5173/';
const browser = await playwright.chromium.launch({
  executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
});
const results = [];
const diagnostics = [];
const accessibility = [];
const viewports = [];
const performance = [];
let scrollTrace = null;
let currentTest = 'initialization';

async function check(name, work) {
  currentTest = name;
  const started = Date.now();
  try {
    const detail = await work();
    results.push({ name, status: 'passed', durationMs: Date.now() - started, ...(detail ? { detail } : {}) });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'failed', durationMs: Date.now() - started, error: error.stack || String(error) });
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

async function makeContext(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...options });
  await context.addInitScript(() => {
    window.__qaLongTasks = [];
    window.__qaLayoutShifts = [];
    window.__qaLCP = null;
    try {
      new PerformanceObserver(list => window.__qaLongTasks.push(...list.getEntries().map(entry => ({ duration: entry.duration, startTime: entry.startTime })))).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver(list => window.__qaLayoutShifts.push(...list.getEntries().filter(entry => !entry.hadRecentInput).map(entry => entry.value))).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => {
        const entry = list.getEntries().at(-1);
        if (entry) window.__qaLCP = { startTimeMs: entry.startTime, renderTimeMs: entry.renderTime, loadTimeMs: entry.loadTime, size: entry.size, element: entry.element ? `${entry.element.tagName.toLowerCase()}${entry.element.id ? '#' + entry.element.id : ''}` : null };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch { /* Performance entry support varies by browser. */ }
  });
  context.on('page', page => {
    page.setDefaultTimeout(8000);
    page.on('pageerror', error => diagnostics.push({ type: 'pageerror', test: currentTest, url: page.url(), message: error.message }));
    page.on('console', message => {
      if (message.type() === 'error') diagnostics.push({ type: 'console', test: currentTest, url: page.url(), message: message.text() });
    });
    page.on('requestfailed', request => {
      // A reload/intentional navigation can cancel the previous in-flight Vite request.
      if (request.failure()?.errorText === 'net::ERR_ABORTED') return;
      diagnostics.push({ type: 'requestfailed', test: currentTest, url: request.url(), message: request.failure()?.errorText });
    });
    page.on('response', response => {
      if (response.status() >= 400) diagnostics.push({ type: 'http', test: currentTest, url: response.url(), status: response.status() });
    });
  });
  return context;
}

async function load(page) {
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.querySelector('.opening')?.classList.contains('finished'));
  await page.waitForFunction(() => document.querySelector('#audio-player')?.dataset.configReady === 'true');
  await page.waitForTimeout(1100);
}

async function revealAll(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const stride = Math.max(240, Math.round(page.viewportSize().height * 0.65));
  for (let y = 0; y <= height; y += stride) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(850);
}

async function waitForScrollSettled(page) {
  await page.evaluate(() => new Promise(resolve => {
    let previous = scrollY;
    let stableFrames = 0;
    const started = performance.now();
    const frame = () => {
      const current = scrollY;
      stableFrames = Math.abs(current - previous) < 0.5 ? stableFrames + 1 : 0;
      previous = current;
      const elapsed = performance.now() - started;
      if ((elapsed > 200 && stableFrames >= 8) || elapsed > 3000) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }));
}

async function runAxe(page, name) {
  if (!await page.evaluate(() => Boolean(window.axe))) await page.addScriptTag({ content: axeSource });
  const audit = await page.evaluate(async () => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
    return {
      violations: result.violations.map(rule => ({ id: rule.id, impact: rule.impact, help: rule.help, helpUrl: rule.helpUrl, nodes: rule.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })),
      incomplete: result.incomplete.map(rule => ({ id: rule.id, help: rule.help, count: rule.nodes.length })),
      passes: result.passes.length,
    };
  });
  accessibility.push({ name, ...audit });
  assert.equal(audit.violations.length, 0, `${name}: ${audit.violations.map(rule => `${rule.id} (${rule.nodes.length} nodes)`).join(', ')}`);
  return { passedRules: audit.passes, manualReviewRules: audit.incomplete.length };
}

try {
  for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768], [768, 1024], [390, 844]]) {
    await check(`Layout and assets ${width} × ${height}`, async () => {
      const context = await makeContext({ viewport: { width, height } });
      const page = await context.newPage();
      try {
        await load(page);
        // Freeze startup measurements before scripted scrolling can introduce new LCP candidates.
        const startup = await page.evaluate(() => ({
          lcp: window.__qaLCP,
          cls: window.__qaLayoutShifts.reduce((sum, value) => sum + value, 0),
          longTasks: [...window.__qaLongTasks],
        }));
        await revealAll(page);
        const layout = await page.evaluate(() => ({
          width: innerWidth, height: innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src),
          visibleSections: [...document.querySelectorAll('main > section')].length,
          fonts: document.fonts.status,
          hiddenReveals: [...document.querySelectorAll('.reveal')].filter(element => !element.classList.contains('visible') || Number(getComputedStyle(element).opacity) < 0.99).map(element => ({ tag: element.tagName, section: element.closest('section')?.id, classes: element.className })),
        }));
        viewports.push(layout);
        assert.ok(layout.scrollWidth <= layout.clientWidth + 1, `Horizontal overflow: ${layout.scrollWidth} > ${layout.clientWidth}`);
        assert.deepEqual(layout.brokenImages, []);
        assert.equal(layout.fonts, 'loaded');
        assert.equal(layout.visibleSections, 7);
        assert.deepEqual(layout.hiddenReveals, [], 'Every reveal must become visible after progressive scrolling');
        performance.push(await page.evaluate(initial => ({
          viewport: `${innerWidth}×${innerHeight}`,
          navigation: performance.getEntriesByType('navigation').map(entry => ({ domContentLoadedMs: entry.domContentLoadedEventEnd, transferBytes: entry.transferSize })),
          largestContentfulPaint: initial.lcp,
          resources: performance.getEntriesByType('resource').map(entry => ({ name: new URL(entry.name).pathname, type: entry.initiatorType, transferredBytes: entry.transferSize, encodedBytes: entry.encodedBodySize, decodedBytes: entry.decodedBodySize, durationMs: entry.duration })),
          resourceTransferBytes: performance.getEntriesByType('resource').reduce((total, entry) => total + entry.transferSize, 0),
          longTasks: initial.longTasks,
          cumulativeLayoutShift: initial.cls,
          postScrollCumulativeLayoutShift: window.__qaLayoutShifts.reduce((sum, value) => sum + value, 0),
        }), startup));
        return layout;
      } finally { await context.close(); }
    });
  }

  const context = await makeContext();
  const page = await context.newPage();
  await load(page);
  await check('All internal hash links resolve', async () => {
    const links = await page.locator('a[href^="#"]').evaluateAll(anchors => anchors.map(anchor => ({ href: anchor.getAttribute('href'), exists: Boolean(document.getElementById(anchor.getAttribute('href').slice(1))) })));
    assert.ok(links.length > 5);
    assert.deepEqual(links.filter(link => !link.exists), []);
    return { checked: links.length };
  });
  await check('Desktop navigation follows every section link', async () => {
    for (const link of await page.locator('.desktop-nav a').all()) {
      const hash = await link.getAttribute('href');
      await link.click();
      await page.waitForFunction(value => location.hash === value, hash);
      await waitForScrollSettled(page);
      const y = await page.locator(hash).evaluate(element => element.getBoundingClientRect().top);
      assert.ok(y >= -2 && y < page.viewportSize().height - 40, `${hash} target top ${y}; section start should be visible after scrolling settles`);
    }
  });
  await check('Navigation dialog Escape and focus return', async () => {
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('#menu').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    assert.equal(await page.locator('#menu').evaluate(dialog => dialog.open), false);
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.menu-toggle')), true);
  });
  await check('Expanded navigation link and close button', async () => {
    await page.locator('.menu-toggle').click();
    await page.locator('#menu a[href="#toolkit"]').click();
    await page.waitForFunction(() => location.hash === '#toolkit' && !document.querySelector('#menu').open);
    await page.locator('.menu-toggle').click();
    await page.locator('#close-menu').click();
    assert.equal(await page.locator('#menu').evaluate(dialog => dialog.open), false);
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.menu-toggle')), true);
  });

  for (const [selector, prefix, label] of [['[data-role]', 'role', 'Experience'], ['[data-skill]', 'skill', 'Skills']]) {
    await check(`${label} tabs click and keyboard`, async () => {
      const tabs = page.locator(selector);
      const count = await tabs.count();
      const selected = async index => {
        assert.equal(await tabs.nth(index).getAttribute('aria-selected'), 'true');
        assert.equal(await tabs.nth(index).getAttribute('tabindex'), '0');
        assert.equal(await page.locator(`#${prefix}-panel-${index}`).isVisible(), true);
        assert.equal(await page.locator(`[id^="${prefix}-panel-"]:not([hidden])`).count(), 1);
      };
      for (let index = 0; index < count; index++) { await tabs.nth(index).click(); await selected(index); }
      await tabs.last().focus();
      for (const [key, index] of [['Home', 0], ['ArrowDown', 1], ['ArrowUp', 0], ['End', count - 1], ['ArrowRight', 0], ['ArrowLeft', count - 1]]) {
        await page.keyboard.press(key);
        await selected(index);
        assert.equal(await tabs.nth(index).evaluate(element => document.activeElement === element), true);
      }
      return { tabs: count, keyboardKeys: 6 };
    });
  }
  await check('All three project case files and focus return', async () => {
    for (const [index, id] of ['crosssense', 'sentinel', 'youtube'].entries()) {
      const button = page.locator(`[data-case="${id}"]`);
      await button.click();
      assert.equal(await page.locator('#case-dialog').evaluate(dialog => dialog.open), true);
      assert.ok((await page.locator('#case-title').textContent()).trim().length > 5);
      assert.ok((await page.locator('#case-content').textContent()).includes('THE ENGINEERING'));
      const repository = page.locator('#case-content a[href^="https://github.com/"]');
      assert.equal(await repository.count(), 1, 'Each new CV project has a supplied public repository');
      const repositoryPath = new URL(await repository.getAttribute('href')).pathname.replace(/\/$/, '');
      assert.equal(repositoryPath, {
        crosssense: '/kunalmaurya-17-24/CrossSense',
        sentinel: '/kunalmaurya-17-24/autonomous-sql-analyst-langgraph-crewai',
        youtube: '/kunalmaurya-17-24/YouTube-Multimodal-RAG-Pipeline',
      }[id]);
      if (id === 'crosssense') {
        const text = await page.locator('#case-content').innerText();
        assert.match(text, /36/);
        assert.match(text, /synthetic/i, 'CrossSense must disclose its synthetic proof-of-concept dataset');
      }
      if (index === 0) await page.keyboard.press('Escape');
      else if (index === 1) await page.locator('.case-close').click();
      else await page.mouse.click(2, 2);
      await page.waitForTimeout(80);
      assert.equal(await page.locator('#case-dialog').evaluate(dialog => dialog.open), false);
      assert.equal(await button.evaluate(element => document.activeElement === element), true);
    }
  });
  await check('External destination syntax and safe new-tab links', async () => {
    const links = await page.locator('a[href^="https://"]').evaluateAll(anchors => anchors.map(anchor => ({ href: anchor.href, target: anchor.target, rel: anchor.rel })));
    assert.ok(links.length >= 5);
    for (const link of links) {
      const url = new URL(link.href);
      assert.equal(url.protocol, 'https:');
      assert.ok(url.hostname.includes('.'));
      if (link.target === '_blank') assert.ok(link.rel.split(/\s+/).includes('noopener'), `${link.href} requires noopener`);
    }
    assert.equal(await page.locator('a[href^="mailto:"]').getAttribute('href'), 'mailto:kunalmaurya.mait@gmail.com');
    return { checked: links.length, destinations: links.map(link => link.href), remoteAvailability: 'Not requested by this local suite' };
  });
  await check('Resume HTTP response and real browser download', async () => {
    const link = page.locator('a[download]');
    const href = await link.getAttribute('href');
    const response = await context.request.get(new URL(href, baseURL).href);
    assert.equal(response.status(), 200);
    const bytes = await response.body();
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    assert.deepEqual(bytes, await readFile('public/Kunal-Maurya-Resume.pdf'), 'Download must serve the current public CV asset');
    const pending = page.waitForEvent('download');
    await link.click();
    const download = await pending;
    assert.match(download.suggestedFilename(), /Kunal.*Resume.*\.pdf/i);
    assert.equal(await download.failure(), null);
    return { bytes: bytes.length, filename: download.suggestedFilename() };
  });
  await check('New CV facts replace superseded resume content', async () => {
    const roles = await page.locator('[data-role]').allTextContents();
    assert.equal(roles.length, 3);
    assert.ok(roles.some(role => role.includes('Ethara AI')));
    assert.ok(roles.some(role => role.includes('Chirpn')));
    assert.ok(roles.some(role => role.includes('FrugalX')));
    const experienceText = await page.locator('#experience').textContent();
    assert.match(experienceText, /LLM Post[ -]Training Expert/i);
    assert.match(experienceText, /Python AI Intern/i);
    assert.doesNotMatch(experienceText, /PRESENT|Infits|70%|sub-second/i);
    const education = await page.locator('.education').textContent();
    assert.match(education, /Guru Gobind Singh Indraprastha University/);
    assert.match(education, /7\.47/);
    assert.doesNotMatch(education, /Maharaja Agrasen|MAIT/);
    const projectNames = await page.locator('[data-case]').evaluateAll(buttons => buttons.map(button => button.dataset.case));
    assert.deepEqual(projectNames, ['crosssense', 'sentinel', 'youtube']);
    const pageText = await page.locator('main').textContent();
    assert.doesNotMatch(pageText, /ATS Resume Tailoring Agent|80% less manual|100% LaTeX compilation/i);
    const headings = await page.locator('h1,h2,h3,h4').allTextContents();
    assert.deepEqual(headings.filter(text => /^\s*(?:summary|about me)\s*$/i.test(text)), [], 'No summary/about-me heading should be restored');
    return { employmentRecords: 3, projects: projectNames, university: 'Guru Gobind Singh Indraprastha University', cgpa: '7.47/10' };
  });
  await check('MP3 playlist selection, wrapping and no autoplay', async () => {
    await page.locator('#audio-expand').click();
    assert.equal(await page.locator('#audio-settings').isVisible(), true);
    const tracks = await page.locator('#audio-track-select option').evaluateAll(options => options.map(option => ({ id: option.value, label: option.textContent })));
    assert.deepEqual(tracks.map(track => track.id), ['life-will-change', 'last-surprise']);
    assert.match(tracks[0].label, /Life Will Change/);
    assert.match(tracks[1].label, /Last Surprise/);
    assert.equal(await page.locator('#audio-player').getAttribute('data-source'), 'file');
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('#audio-media').count(), 0, 'No media should be created before explicit Play');
    const selected = async id => {
      await page.waitForFunction(value => document.querySelector('#audio-player').dataset.track === value, id);
      assert.equal(await page.locator('#audio-track-select').inputValue(), id);
      assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
      assert.equal(await page.locator('#audio-media').count(), 0);
    };
    await page.locator('#audio-prev').click();
    await selected('last-surprise');
    await page.locator('#audio-next').click();
    await selected('life-will-change');
    await page.locator('#audio-track-select').selectOption('last-surprise');
    await selected('last-surprise');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'last-surprise');
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('#audio-media').count(), 0);
    return { tracks, persistedSelection: 'last-surprise', initialPlayback: 'off' };
  });
  await check('Real MP3 decoding, controls, preferences and background pause', async () => {
    const playAndInspect = async expectedFile => {
      await page.locator('#audio-toggle').click();
      await page.waitForFunction(() => {
        const audio = document.querySelector('#audio-media');
        return document.querySelector('#audio-player').dataset.playing === 'true' && audio instanceof HTMLAudioElement && !audio.paused && audio.readyState >= 2 && audio.currentTime > 0;
      }, null, { timeout: 20000 });
      const state = await page.locator('#audio-media').evaluate(audio => ({ source: decodeURIComponent(new URL(audio.currentSrc).pathname), duration: audio.duration, currentTime: audio.currentTime, error: audio.error?.code ?? null }));
      assert.ok(state.source.endsWith(expectedFile), state.source);
      assert.ok(Number.isFinite(state.duration) && state.duration > 30, 'A real full track must decode');
      assert.equal(state.error, null);
      const initialTime = state.currentTime;
      await page.waitForFunction(time => document.querySelector('#audio-media').currentTime > time + 0.15, initialTime);
      assert.equal(await page.locator('[data-audio-icon]').textContent(), 'Ⅱ');
      return state;
    };
    const lastSurprise = await playAndInspect('Persona 5 - Last Surprise.mp3');
    await page.locator('#audio-expand').click();
    await page.locator('#audio-volume').fill('41');
    await page.locator('#audio-volume').dispatchEvent('input');
    await page.waitForFunction(() => Math.abs(document.querySelector('#audio-media').volume - 0.41) < 0.015);
    await page.locator('#audio-mute').click();
    assert.equal(await page.locator('#audio-mute').getAttribute('aria-label'), 'Unmute music');
    assert.equal(await page.locator('[data-mute-label]').textContent(), 'UNMUTE');
    await page.waitForFunction(() => document.querySelector('#audio-media').volume < 0.005);
    await page.locator('#audio-mute').click();
    assert.equal(await page.locator('#audio-mute').getAttribute('aria-label'), 'Mute music');
    await page.waitForFunction(() => Math.abs(document.querySelector('#audio-media').volume - 0.41) < 0.015);
    await page.locator('#audio-toggle').click();
    await page.waitForFunction(() => document.querySelector('#audio-media').paused);
    assert.equal(await page.locator('[data-audio-icon]').textContent(), '▶');
    await page.locator('#audio-track-select').selectOption('life-will-change');
    assert.equal(await page.locator('#audio-media').count(), 0, 'Paused selection should not preload another file');
    const lifeWillChange = await playAndInspect('Persona 5 - Life Will Change (中英歌詞).mp3');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForFunction(() => document.querySelector('#audio-media').paused);
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('#audio-status').textContent(), 'Paused in background');
    await page.locator('#audio-mute').click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#audio-player')?.dataset.configReady === 'true');
    assert.equal(await page.locator('#audio-volume').inputValue(), '41');
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'life-will-change');
    assert.equal(await page.locator('#audio-mute').getAttribute('aria-label'), 'Unmute music');
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('#audio-media').count(), 0);
    return { lastSurprise, lifeWillChange, persistedVolume: 41, persistedMute: true, reloadPlayback: 'off' };
  });
  await check('Axe expanded music controls WCAG 2.2 AA', async () => {
    await page.locator('#audio-expand').click();
    try { return await runAxe(page, 'desktop-audio-settings'); }
    finally { await page.locator('#audio-expand').click(); }
  });
  await check('Decorative motion pause control', async () => {
    await page.locator('#motion-toggle').click();
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.ticker > div').evaluate(element => getComputedStyle(element).animationPlayState), 'paused');
    await page.locator('#motion-toggle').click();
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'false');
  });
  await check('Education details and clipboard action', async () => {
    const details = page.locator('.education details');
    await details.locator('summary').click();
    assert.equal(await details.evaluate(element => element.open), true);
    await details.locator('summary').press('Enter');
    assert.equal(await details.evaluate(element => element.open), false);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#copy-email').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'kunalmaurya.mait@gmail.com');
    assert.equal(await page.locator('#toast').textContent(), 'EMAIL COPIED');
  });
  await revealAll(page);
  await check('Axe desktop page WCAG 2.2 AA', () => runAxe(page, 'desktop-page'));
  await page.locator('.menu-toggle').click();
  await page.waitForTimeout(450);
  await check('Axe expanded navigation WCAG 2.2 AA', () => runAxe(page, 'desktop-menu'));
  await page.keyboard.press('Escape');
  await page.locator('[data-case="crosssense"]').click();
  await page.waitForTimeout(400);
  await check('Axe case dialog WCAG 2.2 AA', () => runAxe(page, 'desktop-case'));
  await page.keyboard.press('Escape');
  if (process.env.QA_TRACE !== '0') await check('Brief scroll performance trace', async () => {
    const cdp = await context.newCDPSession(page);
    const completed = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
    await cdp.send('Tracing.start', { categories: 'toplevel,devtools.timeline,blink.user_timing', transferMode: 'ReturnAsStream' });
    const elapsedMs = await page.evaluate(async () => {
      const started = performance.now();
      const original = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      const distance = document.documentElement.scrollHeight - innerHeight;
      for (let frame = 0; frame <= 90; frame++) {
        scrollTo(0, distance * frame / 90);
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = original;
      return performance.now() - started;
    });
    await cdp.send('Tracing.end');
    const { stream } = await completed;
    let content = '';
    while (true) {
      const chunk = await cdp.send('IO.read', { handle: stream });
      content += chunk.base64Encoded ? Buffer.from(chunk.data, 'base64').toString('utf8') : chunk.data;
      if (chunk.eof) break;
    }
    await cdp.send('IO.close', { handle: stream });
    await cdp.detach();
    const trace = JSON.parse(content);
    const renderer = trace.traceEvents.find(event => event.name === 'thread_name' && event.args?.name === 'CrRendererMain');
    const rendererEvents = renderer ? trace.traceEvents.filter(event => event.pid === renderer.pid && event.tid === renderer.tid && event.ph === 'X') : [];
    const tasks = rendererEvents.filter(event => /RunTask/.test(event.name));
    scrollTrace = {
      file: 'docs/performance-scroll-trace.json', elapsedMs, traceBytes: Buffer.byteLength(content),
      rendererIdentified: Boolean(renderer),
      rendererTasksOver50ms: tasks.filter(event => event.dur / 1000 > 50).map(event => ({ durationMs: event.dur / 1000, name: event.name })),
      longestRendererTaskMs: tasks.length ? Math.max(...tasks.map(event => event.dur / 1000)) : null,
      layoutEvents: rendererEvents.filter(event => event.name === 'Layout').length,
      paintEvents: rendererEvents.filter(event => event.name === 'Paint').length,
    };
    await writeFile(scrollTrace.file, content);
    return scrollTrace;
  });
  await context.close();

  const mobileContext = await makeContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await mobileContext.newPage();
  await load(mobile);
  await revealAll(mobile);
  await check('Axe mobile page WCAG 2.2 AA', () => runAxe(mobile, 'mobile-page'));
  await check('Mobile touch navigation and project dialog', async () => {
    await mobile.locator('.menu-toggle').tap();
    await mobile.locator('#menu a[href="#work"]').tap();
    await mobile.waitForFunction(() => location.hash === '#work' && !document.querySelector('#menu').open);
    await mobile.locator('[data-case="crosssense"]').tap();
    assert.equal(await mobile.locator('#case-dialog').evaluate(dialog => dialog.open), true);
    await mobile.locator('.case-close').tap();
    assert.equal(await mobile.locator('#case-dialog').evaluate(dialog => dialog.open), false);
    await mobile.locator('#audio-expand').tap();
    assert.equal(await mobile.locator('#audio-settings').isVisible(), true);
  });
  await check('Axe mobile music controls WCAG 2.2 AA', () => runAxe(mobile, 'mobile-audio-settings'));
  await mobileContext.close();

  await check('Reduced motion removes decorative animation and preserves content', async () => {
    const reducedContext = await makeContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const reduced = await reducedContext.newPage();
    try {
      await load(reduced);
      const state = await reduced.evaluate(() => ({
        running: document.getAnimations().filter(animation => animation.playState === 'running').map(animation => animation.animationName || animation.constructor.name),
        hiddenReveals: [...document.querySelectorAll('.reveal')].filter(element => Number(getComputedStyle(element).opacity) < 1).length,
        heroTransform: getComputedStyle(document.querySelector('.hero-art')).transform,
        introDisplay: getComputedStyle(document.querySelector('.opening')).display,
      }));
      assert.deepEqual(state.running, []);
      assert.equal(state.hiddenReveals, 0);
      assert.equal(state.heroTransform, 'none');
      assert.equal(state.introDisplay, 'none');
      await reduced.locator('.menu-toggle').click();
      await reduced.keyboard.press('Escape');
      await reduced.locator('[data-case="crosssense"]').click();
      await reduced.keyboard.press('Escape');
      return state;
    } finally { await reducedContext.close(); }
  });
  await check('Denied localStorage and sessionStorage remain functional', async () => {
    const deniedContext = await makeContext();
    await deniedContext.addInitScript(() => {
      for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, { configurable: true, get() { throw new DOMException('Storage denied for QA', 'SecurityError'); } });
    });
    const denied = await deniedContext.newPage();
    try {
      await load(denied);
      assert.equal(await denied.locator('h1').innerText(), 'KUNAL\nMAURYA.');
      await denied.locator('.menu-toggle').click();
      await denied.keyboard.press('Escape');
      await denied.locator('#audio-toggle').click();
      await denied.waitForFunction(() => document.querySelector('#audio-player').dataset.playing === 'true');
      await denied.locator('#audio-toggle').click();
      await denied.locator('[data-skill="1"]').click();
      assert.equal(await denied.locator('[data-skill="1"]').getAttribute('aria-selected'), 'true');
    } finally { await deniedContext.close(); }
  });
  await check('Console, uncaught errors, HTTP failures and broken requests', async () => assert.deepEqual(diagnostics, []));
} catch (error) {
  results.push({ name: 'QA runner completion', status: 'failed', error: error.stack || String(error) });
} finally {
  const browserVersion = browser.version();
  await browser.close();
  await mkdir('docs', { recursive: true });
  const failures = results.filter(result => result.status === 'failed');
  const report = {
    generatedAt: new Date().toISOString(), baseURL, browser: `Microsoft Edge / Chromium ${browserVersion}`,
    summary: { passed: results.length - failures.length, failed: failures.length, total: results.length },
    results, viewports, accessibility, performance, scrollTrace, diagnostics,
    limitations: [
      'Automated checks use real Chromium-based Microsoft Edge. Safari, Firefox and physical mobile devices were not available and are not claimed as tested.',
      'Axe detects a subset of accessibility problems; incomplete rules require manual visual review. No full WCAG certification is claimed.',
      'External GitHub, LinkedIn and certificate URLs are checked for valid destination syntax and safe new-tab attributes. Remote availability and source-content verification are outside this local regression suite.',
      'Performance timings are local observations, not Lighthouse scores or representative field measurements.',
      'Both configured MP3 files are tested for browser decoding, advancing playback time and control behavior; headless execution does not constitute a human listening review or verification of distribution rights.',
    ],
  };
  await writeFile('docs/qa-results.json', JSON.stringify(report, null, 2) + '\n');
  const markdown = [
    '# Browser QA results', '',
    `Run: ${report.generatedAt}. Target: ${baseURL}. Browser: ${report.browser}.`, '',
    `**${report.summary.passed} passed; ${report.summary.failed} failed; ${report.summary.total} checks.**`, '',
    '| Check | Result |', '| --- | --- |',
    ...results.map(result => `| ${result.name.replaceAll('|', '/')} | ${result.status === 'passed' ? 'PASS' : 'FAIL'} |`), '',
    '## Viewport checks', '', '| Viewport | Document width | Result |', '| --- | --- | --- |',
    ...viewports.map(viewport => `| ${viewport.width} × ${viewport.height} | ${viewport.scrollWidth} | ${viewport.scrollWidth <= viewport.clientWidth + 1 ? 'No horizontal overflow' : 'Overflow detected'} |`), '',
    '## Accessibility', '',
    ...accessibility.map(audit => `- ${audit.name}: ${audit.violations.length} detected violations, ${audit.passes} passing rules, ${audit.incomplete.length} rules requiring manual review.`), '',
    '## Local performance observations', '',
    'These are real local browser measurements, not Lighthouse scores. Startup LCP/CLS/long tasks are frozen before scripted scrolling; LCP may identify opening typography, and its element is included in the JSON. Cold browser contexts were used for each viewport; the local server and operating system may still cache files.', '',
    '| Viewport | LCP | CLS | Resource transfer | Long tasks |', '| --- | --- | --- | --- | --- |',
    ...performance.map(sample => `| ${sample.viewport} | ${sample.largestContentfulPaint ? Math.round(sample.largestContentfulPaint.startTimeMs) + ' ms' : 'Not reported'} | ${sample.cumulativeLayoutShift.toFixed(4)} | ${(sample.resourceTransferBytes / 1024).toFixed(1)} KiB | ${sample.longTasks.length} |`), '',
    ...(scrollTrace ? [`A ${Math.round(scrollTrace.elapsedMs)} ms scroll trace was captured at \`${scrollTrace.file}\`. Renderer main-thread identification: ${scrollTrace.rendererIdentified ? 'available' : 'unavailable'}. Longest observed renderer task: ${scrollTrace.longestRendererTaskMs === null ? 'not reported' : scrollTrace.longestRendererTaskMs.toFixed(1) + ' ms'}; tasks over 50 ms: ${scrollTrace.rendererTasksOver50ms.length}.`, ''] : []),
    ...(failures.length ? ['## Failures requiring attention', '', ...failures.map(failure => `- **${failure.name}:** ${(failure.error || '').split('\n')[0]}`), ''] : []),
    '## Scope and limitations', '', ...report.limitations.map(limitation => `- ${limitation}`), '',
    'Re-run with `npm run test:browser`. Set `BASE_URL` to a production preview URL to test the built output. Set `BROWSER_PATH` or `CODEX_NODE_MODULES` to use a different installed browser/runtime. Detailed rule failures, network diagnostics and local performance observations are in `docs/qa-results.json`.', '',
  ].join('\n');
  await writeFile('docs/qa-results.md', markdown);
  console.log(JSON.stringify({ summary: report.summary, results: 'docs/qa-results.json' }));
  if (failures.length) process.exitCode = 1;
}
