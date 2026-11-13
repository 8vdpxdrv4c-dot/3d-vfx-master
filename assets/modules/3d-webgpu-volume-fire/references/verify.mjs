/**
 * 3d-webgpu-volume-fire 无头验证（可复跑）。
 *
 *   node references/verify.mjs                    # 只验证，预览截图写入系统临时目录
 *   node references/verify.mjs --update-preview  # 同时刷新模块根 preview.png
 *
 * 默认不覆盖 preview.png：该文件受 references/package-manifest.json 的 SHA-256 约束，
 * 每次复跑都重写会让技能包完整性自检失败。确需更新交付预览时显式加 --update-preview，
 * 然后重建 package-manifest.json（或设置 UPDATE_PREVIEW=1 等价生效）。
 *
 * 依赖 playwright-core 与本机 Chrome/Chromium：
 *   PLAYWRIGHT_CORE=<playwright-core 模块目录或包名>
 *   CHROME_PATH=<浏览器可执行文件>
 *
 * 三条与其它模块不同的约束：
 *   1. WebGPU 只在安全上下文可用 —— 必须经内置 HTTP 服务打开，file:// 与 about:blank 都不行；
 *   2. 无头 Chrome 需要 --enable-unsafe-webgpu 才会暴露 navigator.gpu；
 *   3. 本模块自己拥有 WebGPU renderer 与 RenderPipeline，且画布未开 preserveDrawingBuffer，
 *      drawImage(canvas) 拿到的是空帧。因此像素统计一律走页面截图 + PNG 解码（pngjs），
 *      不能 hook renderer.render，也不能 gl.readPixels。
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MODULE = path.resolve(HERE, '..');
const ROOT = path.resolve(HERE, '../../../..');
const DEMO = '/assets/modules/3d-webgpu-volume-fire/demos/index.html';
const PREVIEW = path.join(MODULE, 'preview.png');
const UPDATE_PREVIEW = process.argv.includes('--update-preview') || process.env.UPDATE_PREVIEW === '1';
const SHOT = UPDATE_PREVIEW ? PREVIEW : path.join(os.tmpdir(), `volume-fire-verify-${process.pid}.png`);
const VIEW = { width: 960, height: 600 };
// 只取画面中部，避开左上 HUD、右下参数面板与底部提示条
const VIEW_CLIP = { x: 40, y: 90, width: 880, height: 400 };

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_CORE,
    'playwright-core',
    'C:/Users/yaoja/.workbuddy-ai/binaries/node/workspace/node_modules/playwright-core'
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { return require(candidate).chromium; } catch (_) { /* 继续尝试 */ }
  }
  throw new Error('找不到 playwright-core，请设置 PLAYWRIGHT_CORE 或先安装该包');
}
function loadPng() {
  const candidates = [
    process.env.PNGJS,
    'pngjs',
    'C:/Users/yaoja/.workbuddy-ai/binaries/node/workspace/node_modules/pngjs'
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { return require(candidate).PNG; } catch (_) { /* 继续尝试 */ }
  }
  throw new Error('找不到 pngjs，请设置 PNGJS 或在托管 node workspace 中 npm install pngjs');
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript',
  '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/markdown',
  '.png': 'image/png', '.webp': 'image/webp'
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(ROOT, '.' + rel);
  const norm = (s) => s.replace(/\\/g, '/').toLowerCase();
  if (!norm(file).startsWith(norm(ROOT))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('not found: ' + rel); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

const report = { checks: [], pageErrors: [], consoleErrors: [], shaderErrors: [], failedRequests: [], stats: {} };
const check = (name, pass, detail) => { report.checks.push({ name, pass: !!pass, detail }); };

/**
 * 截图像素统计。用 page.screenshot 的 PNG buffer，避开 WebGPU 画布 drawImage 为空的问题。
 * 只统计画布区域（扣掉左上 HUD 与右下参数面板），避免 UI 文本污染火焰判据。
 */
async function shotStats(page, png, clip) {
  const buf = await page.screenshot({ clip: clip || VIEW_CLIP });
  const img = png.sync.read(buf);
  const d = img.data;
  let sum = 0, max = 0, lit = 0, black = 0, warm = 0;
  const n = img.width * img.height;
  const hist = new Array(16).fill(0);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const v = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    sum += v;
    if (v > max) max = v;
    if (v > 0.25) lit++;
    if (v < 0.02) black++;
    if (r > g + 12 && g >= b && r > 90) warm++;
    hist[Math.min(15, Math.floor(v * 16))]++;
  }
  return {
    mean: +(sum / n).toFixed(4), max: +max.toFixed(4),
    litRatio: +(lit / n).toFixed(4), blackRatio: +(black / n).toFixed(4),
    warmRatio: +(warm / n).toFixed(4), hist
  };
}

/** 与基准直方图做分布差分，返回 0..1 的分布偏移量。 */
function histDistance(a, b) {
  const n = a.hist.reduce((x, y) => x + y, 0);
  let l1 = 0;
  for (let i = 0; i < 16; i++) l1 += Math.abs(a.hist[i] - b.hist[i]);
  return +(l1 / (2 * n)).toFixed(4);
}

async function waitFrames(page, count) {
  const start = await page.evaluate(() => window.__volumeFireDemo.frames);
  await page.waitForFunction((n) => window.__volumeFireDemo.frames >= n, start + count, { timeout: 40000 });
}

(async () => {
  const browserPath = findBrowser();
  if (!browserPath) throw new Error('找不到 Chrome / Edge，可设置 CHROME_PATH');
  const chromium = loadPlaywright();
  const png = loadPng();

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}${DEMO}`;

  const browser = await chromium.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 1 });

  page.on('pageerror', (e) => report.pageErrors.push(String(e).slice(0, 400)));
  page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text().slice(0, 400)); });
  page.on('requestfailed', (r) => report.failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) report.failedRequests.push(`${r.status()} ${r.url()}`); });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__volumeFireDemo, null, { timeout: 60000 });

  const boot = await page.evaluate(() => {
    const d = window.__volumeFireDemo;
    return { ok: !!d.ok, reason: d.reason || null, looks: d.meta.looks.map((l) => l.id), schema: d.meta.schema.length };
  });
  report.stats.boot = boot;
  check('WebGPU 初始化成功', boot.ok, boot.reason || 'ok');
  if (!boot.ok) {
    await finish({ browser, page });
    return;
  }

  await waitFrames(page, 20);
  const f0 = await page.evaluate(() => window.__volumeFireDemo.frames);
  const s0 = await shotStats(page, png);
  report.stats.baseFrame = s0;
  check('有可见火焰（非全黑且暖色占比足够）', s0.max > 0.35 && s0.warmRatio > 0.002,
    `max=${s0.max} warmRatio=${s0.warmRatio} litRatio=${s0.litRatio}`);
  check('渲染循环持续推进', f0 >= 20, `frames=${f0}`);

  // 1. simSpeed=0 冻结，但画面不黑
  await page.evaluate(() => { window.__volumeFireDemo.setParam('simSpeed', 0); });
  await waitFrames(page, 6);
  const sFreeze = await shotStats(page, png);
  report.stats.freeze = sFreeze;
  check('simSpeed=0 冻结后画面仍非黑', sFreeze.mean > 0.01 && sFreeze.max > 0.3,
    `mean=${sFreeze.mean} max=${sFreeze.max}`);
  await page.evaluate(() => { window.__volumeFireDemo.setParam('simSpeed', 1.2); });

  // 2. emitTemperature=0 熄灭
  await page.evaluate(() => { window.__volumeFireDemo.setParam('emitTemperature', 0); });
  await page.evaluate(() => window.__volumeFireDemo.effect.setParams({ emitTemperature: 0 }));
  await waitFrames(page, 60);
  const sOff = await shotStats(page, png);
  report.stats.emitOff = sOff;
  check('emitTemperature=0 后热区显著下降', sOff.warmRatio < s0.warmRatio * 0.75 || sOff.warmRatio < 0.008,
    `warm ${s0.warmRatio} -> ${sOff.warmRatio}, max ${s0.max} -> ${sOff.max}`);
  await page.evaluate(() => window.__volumeFireDemo.setParam('emitTemperature', 1));
  await page.evaluate(() => window.__volumeFireDemo.effect.setParams({ emitTemperature: 1 }));
  await waitFrames(page, 45);

  // 3. 预设切换改变画面
  const before = await shotStats(page, png);
  await page.evaluate(() => window.__volumeFireDemo.preset('blue-plasma'));
  await waitFrames(page, 45);
  const after = await shotStats(page, png);
  report.stats.presetSwitch = { before, after };
  const dist = histDistance(before, after);
  report.stats.presetDistance = dist;
  check('预设 blue-plasma 改变画面', dist > 0.006 || Math.abs(after.warmRatio - before.warmRatio) > 0.001,
    `histDistance=${dist}, mean ${before.mean} -> ${after.mean}, warm ${before.warmRatio} -> ${after.warmRatio}`);

  // 4. 参数热更新下发到实例
  const applied = await page.evaluate(() => {
    window.__volumeFireDemo.setParam('turbulence', 5.5);
    window.__volumeFireDemo.effect.setParams({ turbulence: 5.5 });
    return window.__volumeFireDemo.effect.getParams().turbulence;
  });
  check('turbulence 热更新生效', Math.abs(applied - 5.5) < 1e-6, `getParams().turbulence=${applied}`);

  // 5. 提示词包含调好的参数
  const prompt = await page.evaluate(() => window.__volumeFireDemo.buildPrompt());
  const promptOk = typeof prompt === 'string'
    && prompt.includes('3d-webgpu-volume-fire')
    && prompt.includes('## 2. 调好的参数')
    && prompt.includes('"turbulence"')
    && prompt.includes('createVolumeFireEffect')
    && prompt.includes('WebGPU');
  report.stats.promptLength = prompt.length;
  check('复制提示词含模块/参数/代码/约束', promptOk, `len=${prompt.length}`);

  await page.evaluate(() => window.__volumeFireDemo.preset('classic'));
  await waitFrames(page, 40);

  await page.screenshot({ path: SHOT });
  report.stats.screenshot = UPDATE_PREVIEW ? PREVIEW : SHOT;

  await finish({ browser, page });
})().catch(async (e) => {
  report.pageErrors.push('FATAL ' + String(e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e));
  await finish(null);
});

async function finish(ctx) {
  if (ctx) { try { await ctx.browser.close(); } catch (_) {} }
  try { server.close(); } catch (_) {}

  const failed = report.checks.filter((c) => !c.pass);
  const out = {
    module: '3d-webgpu-volume-fire',
    pass: failed.length === 0 && report.pageErrors.length === 0,
    checks: report.checks.length,
    failed: failed.length,
    errors: failed.map((c) => `${c.name} :: ${c.detail}`),
    pageErrors: report.pageErrors,
    consoleErrors: report.consoleErrors,
    failedRequests: report.failedRequests,
    stats: report.stats
  };
  console.log(JSON.stringify(out, null, 2));
  if (report.checks.length) {
    for (const c of report.checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name} :: ${c.detail}`);
  }
  process.exit(out.pass ? 0 : 1);
}
