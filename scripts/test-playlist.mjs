import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const runtime = process.env.CODEX_NODE_MODULES || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1123-915-0_26.1123.915.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
let playwright;
try { playwright = require('playwright'); } catch { playwright = createRequire(path.join(runtime, 'package.json'))('playwright'); }
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5173/';
const browser = await playwright.chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const results = [];
const decoded = [];
const pageErrors = [];
let context;
let page;

async function check(name, work) {
  try { const detail = await work(); results.push({ name, status: 'passed', ...(detail ? { detail } : {}) }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'failed', error: error.stack || String(error) }); console.log(`FAIL ${name}: ${error.message}`); }
}
async function fresh() {
  await context?.close();
  context = await browser.newContext();
  await context.addInitScript(() => {
    window.__playlistContexts = [];
    const Original = window.AudioContext;
    window.AudioContext = class extends Original { constructor(...args) { super(...args); window.__playlistContexts.push(this); } };
  });
  page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  page.setDefaultTimeout(12000);
}
async function load() {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#audio-player')?.dataset.configReady === 'true');
  await page.waitForFunction(() => document.querySelector('.opening')?.classList.contains('finished'));
}
async function settings() {
  if (!await page.locator('#audio-settings').isVisible()) await page.locator('#audio-expand').click();
}
async function playing() {
  await page.waitForFunction(() => {
    const media = document.querySelector('#audio-media');
    return document.querySelector('#audio-player').dataset.playing === 'true' && media && !media.paused && !media.error && media.readyState >= 3 && media.currentTime > 0.2 && Number.isFinite(media.duration);
  }, null, { timeout: 15000 });
}
async function verifyDecoded(expectedTitle, filename) {
  await playing();
  const before = await page.locator('#audio-media').evaluate(media => media.currentTime);
  await page.waitForTimeout(450);
  const detail = await page.locator('#audio-media').evaluate(media => ({ src: decodeURIComponent(media.currentSrc), durationSeconds: media.duration, currentTime: media.currentTime, readyState: media.readyState, volume: media.volume, error: media.error?.message || null }));
  assert.ok(detail.src.endsWith(filename));
  assert.ok(detail.durationSeconds > 30);
  assert.ok(detail.currentTime > before + 0.2);
  assert.equal(detail.error, null);
  assert.equal(await page.locator('#audio-title').textContent(), `${expectedTitle} / Persona 5`);
  decoded.push({ title: expectedTitle, ...detail });
  return detail;
}

try {
  await fresh();
  let mp3Requests = 0;
  page.on('request', request => { if (request.url().includes('.mp3')) mp3Requests++; });
  await load();
  await check('Two supplied tracks, correct labels and no initial audio downloads', async () => {
    assert.deepEqual(await page.locator('#audio-track-select option').allTextContents(), ['Life Will Change', 'Last Surprise']);
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'life-will-change');
    assert.equal(await page.locator('#audio-track-position').textContent(), '01 / 02');
    assert.equal(await page.locator('audio').count(), 0);
    assert.equal(await page.evaluate(() => window.__playlistContexts.length), 0);
    assert.equal(mp3Requests, 0);
  });
  await settings();
  await check('Paused selection and previous/next wrap remain silent', async () => {
    await page.locator('#audio-prev').click();
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'last-surprise');
    await page.locator('#audio-next').click();
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'life-will-change');
    await page.locator('#audio-track-select').selectOption('last-surprise');
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('audio').count(), 0);
    assert.equal(mp3Requests, 0);
    await page.locator('#audio-track-select').selectOption('life-will-change');
  });
  await check('Life Will Change MP3 decodes and playback time advances', async () => {
    await page.locator('#audio-toggle').click();
    return verifyDecoded('Life Will Change', 'Persona 5 - Life Will Change (中英歌詞).mp3');
  });
  await check('Playing track switch decodes Last Surprise and retires old media', async () => {
    await page.locator('#audio-next').click();
    const detail = await verifyDecoded('Last Surprise', 'Persona 5 - Last Surprise.mp3');
    await page.waitForTimeout(260);
    assert.equal(await page.locator('audio').count(), 1);
    return detail;
  });
  await check('Mute, unmute and volume affect actual media', async () => {
    await page.locator('#audio-volume').fill('43');
    await page.locator('#audio-volume').dispatchEvent('input');
    await page.waitForTimeout(230);
    assert.ok(Math.abs(await page.locator('#audio-media').evaluate(media => media.volume) - .43) < .01);
    await page.locator('#audio-mute').click();
    await page.waitForTimeout(230);
    assert.ok(await page.locator('#audio-media').evaluate(media => media.volume < .001));
    await page.locator('#audio-mute').click();
    await page.waitForTimeout(230);
    assert.ok(Math.abs(await page.locator('#audio-media').evaluate(media => media.volume) - .43) < .01);
  });
  await check('Rapid playing selections leave exactly the latest track running', async () => {
    await page.evaluate(() => {
      const select = document.querySelector('#audio-track-select');
      for (const id of ['life-will-change', 'last-surprise', 'life-will-change', 'last-surprise', 'life-will-change']) {
        select.value = id;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await playing();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#audio-player').getAttribute('data-track'), 'life-will-change');
    assert.equal(await page.locator('audio').count(), 1);
    assert.ok(await page.locator('#audio-media').evaluate(media => decodeURIComponent(media.currentSrc).includes('Life Will Change')));
  });
  await check('Cancelling an in-flight track switch stays paused', async () => {
    await page.evaluate(() => { document.querySelector('#audio-next').click(); document.querySelector('#audio-toggle').click(); });
    await page.waitForTimeout(350);
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('#audio-media').evaluate(media => media.paused), true);
    assert.equal(await page.locator('#audio-status').textContent(), 'Paused');
  });
  await check('Selected track, volume and mute persist without autoplay', async () => {
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'last-surprise');
    await page.locator('#audio-mute').click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#audio-player').dataset.configReady === 'true');
    assert.equal(await page.locator('#audio-track-select').inputValue(), 'last-surprise');
    assert.equal(await page.locator('#audio-volume').inputValue(), '43');
    assert.equal(await page.locator('#audio-mute').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('audio').count(), 0);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('km-audio-preferences')));
    assert.equal(stored.trackId, 'last-surprise');
    assert.equal(stored.volume, .43);
    assert.equal(stored.muted, true);
  });
  await check('Backgrounding pauses media immediately and never resumes automatically', async () => {
    await page.locator('#audio-toggle').click();
    await playing();
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.locator('#audio-media').evaluate(media => media.paused), true);
    assert.equal(await page.locator('#audio-status').textContent(), 'Paused in background');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
  });
  await check('Invalid playlist safely uses the optional original fallback', async () => {
    await fresh();
    await page.route('**/audio/track.json', route => route.fulfill({ json: { tracks: [{ id: 'unsafe', src: 'javascript:alert(1)', title: 'Rejected source' }] } }));
    await load();
    assert.equal(await page.locator('#audio-player').getAttribute('data-source'), 'original');
    assert.equal(await page.locator('#audio-title').textContent(), 'After Hours / Original instrumental');
    assert.equal(await page.locator('audio').count(), 0);
    await page.locator('#audio-toggle').click();
    await page.waitForFunction(() => document.querySelector('#audio-player').dataset.playing === 'true');
    assert.equal(await page.evaluate(() => window.__playlistContexts[0].state), 'running');
    await page.locator('#audio-toggle').click();
  });
  await check('Invalid audio file produces a retryable status without ghost playback', async () => {
    await fresh();
    await page.route('**/audio/track.json', route => route.fulfill({ json: { tracks: [{ id: 'decode-test', src: 'audio/invalid-test.mp3', title: 'Decode test', artist: 'QA fixture' }] } }));
    await page.route('**/audio/invalid-test.mp3', route => route.fulfill({ contentType: 'audio/mpeg', body: 'Invalid audio fixture' }));
    await load();
    await page.locator('#audio-toggle').click();
    await page.waitForFunction(() => document.querySelector('#audio-status').textContent === 'Audio unavailable · try again');
    assert.equal(await page.locator('#audio-toggle').isEnabled(), true);
    assert.equal(await page.locator('#audio-player').getAttribute('data-playing'), 'false');
    assert.equal(await page.locator('audio').count(), 0);
  });
  await check('No uncaught page errors during playlist stress and failure handling', async () => assert.deepEqual(pageErrors, []));
} finally {
  await context?.close();
  const browserVersion = browser.version();
  await browser.close();
  await mkdir('docs', { recursive: true });
  const report = { generatedAt: new Date().toISOString(), baseURL, browser: `Microsoft Edge / Chromium ${browserVersion}`, summary: { passed: results.filter(result => result.status === 'passed').length, failed: results.filter(result => result.status === 'failed').length, total: results.length }, results, decoded, pageErrors, limitation: 'Headless browser tests prove decoding and media-time progression, not a human listening review or music licensing provenance.' };
  await writeFile('docs/playlist-test-results.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary));
  if (report.summary.failed) process.exitCode = 1;
}
