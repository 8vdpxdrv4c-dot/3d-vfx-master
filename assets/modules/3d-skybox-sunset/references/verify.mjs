/**
 * 3d-skybox-sunset 无头渲染验证（可复跑，不产出临时图片文件之外的依赖）。
 *
 *   node references/verify.mjs                    # 只验证，预览截图写入系统临时目录
 *   node references/verify.mjs --update-preview  # 同时刷新模块根 preview.png
 *
 * 默认不覆盖 preview.png：该文件受 references/package-manifest.json 的 SHA-256 约束，
 * 每次复跑都重写会让技能包完整性自检失败。确需更新交付预览时显式加 --update-preview，
 * 然后重建 package-manifest.json（或设置 UPDATE_PREVIEW=1 等价生效）。
 *
 * 依赖 playwright-core 与本机 Chrome/Chromium：
 *   PLAYWRIGHT_CORE=<playwright-core 模块目录或包名>  （默认依次尝试 playwright-core 与本机 WorkBuddy 托管副本）
 *   CHROME_PATH=<浏览器可执行文件>                    （默认探测 Chrome / Edge 常见安装位置）
 *
 * 用 SwiftShader 软件渲染，内置静态 HTTP 服务（ES module + importmap 需要 http 而非 file://）。
 * 在渲染循环内 hook effect.render 后用 gl.readPixels 读默认帧缓冲，因此不要求 preserveDrawingBuffer。
 * 结束把干净预览图写到临时目录（或指定的 preview.png），并把 JSON 报告打印到 stdout。
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
const DEMO = '/assets/modules/3d-skybox-sunset/demos/index.html';
const PREVIEW = path.join(MODULE, 'preview.png');
const UPDATE_PREVIEW = process.argv.includes('--update-preview') || process.env.UPDATE_PREVIEW === '1';
const SHOT = UPDATE_PREVIEW ? PREVIEW : path.join(os.tmpdir(), `sky-glow-verify-${process.pid}.png`);

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
function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/markdown', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(ROOT, '.' + rel);
  if (!file.toLowerCase().startsWith(ROOT.toLowerCase())) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('not found: ' + rel); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

const report = { checks: [], pageErrors: [], consoleErrors: [], shaderErrors: [], failedRequests: [], stats: {} };
const check = (name, pass, detail) => { report.checks.push({ name, pass: !!pass, detail }); };

async function probe(page) {
  await page.evaluate(() => { window.__probe = null; window.__probeRequested = true; });
  await page.waitForFunction(() => window.__probe !== null, null, { timeout: 15000 });
  return page.evaluate(() => window.__probe);
}
async function waitFrames(page, count = 8) {
  const start = await page.evaluate(() => window.__skyDemo.frames);
  await page.waitForFunction((n) => window.__skyDemo.frames >= n, start + count, { timeout: 15000 });
}

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const PORT = server.address().port;
let browser;
try {
  const chromium = loadPlaywright();
  const exe = findBrowser();
  browser = await chromium.launch({
    ...(exe ? { executablePath: exe } : {}),
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--no-sandbox', '--disable-gpu-sandbox', '--hide-scrollbars', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => report.pageErrors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error') report.consoleErrors.push(m.text()); });
  page.on('requestfailed', (r) => report.failedRequests.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));

  await page.goto(`http://127.0.0.1:${PORT}${DEMO}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__skyReady === true && window.__skyDemo?.frames >= 3, null, { timeout: 30000 });
  check('页面加载并渲染至少 3 帧', true, await page.evaluate(() => window.__skyDemo.frames + ' frames'));

  // 渲染循环内读默认帧缓冲，避开 preserveDrawingBuffer 限制。
  await page.evaluate(() => {
    const d = window.__skyDemo;
    const gl = d.renderer.getContext();
    const orig = d.effect.render.bind(d.effect);
    d.effect.render = (scene, camera) => {
      orig(scene, camera);
      if (!window.__probeRequested) return;
      window.__probeRequested = false;
      const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      const px = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let sum = 0, max = 0, bright = 0, warm = 0, n = 0, black = 0, cSum = 0, cN = 0, cMax = 0;
      const x0 = w * 0.34 | 0, x1 = w * 0.66 | 0, y0 = h * 0.34 | 0, y1 = h * 0.66 | 0;
      for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
        const i = (y * w + x) * 4, r = px[i], g = px[i + 1], b = px[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        sum += lum; if (lum > max) max = lum;
        if (lum > 200) bright++;
        if (r > g + 8 && g > b + 4 && r > 110) warm++;
        if (r + g + b < 12) black++;
        n++;
        if (x >= x0 && x < x1 && y >= y0 && y < y1) { cSum += lum; cN++; if (lum > cMax) cMax = lum; }
      }
      window.__probe = {
        w, h, mean: +(sum / n).toFixed(2), max: Math.round(max),
        brightRatio: +(bright / n).toFixed(4), warmRatio: +(warm / n).toFixed(4),
        blackRatio: +(black / n).toFixed(4),
        centerMean: +(cSum / cN).toFixed(2), centerMax: Math.round(cMax)
      };
    };
  });

  await waitFrames(page, 8);
  const base = await probe(page);
  report.stats['sunset-outdoor'] = base;
  check('画面非全黑', base.mean > 12 && base.blackRatio < 0.8, JSON.stringify(base));
  check('存在高亮太阳/日晕像素', base.max > 235 && base.brightRatio > 0.002, `max=${base.max} bright=${base.brightRatio}`);
  check('画面呈暖色调', base.warmRatio > 0.12, `warmRatio=${base.warmRatio}`);
  check('中心太阳区域比全图更亮', base.centerMean > base.mean, `center=${base.centerMean} mean=${base.mean}`);

  await page.evaluate(() => window.__skyDemo.preset('coastal-dusk'));
  await waitFrames(page, 8);
  report.stats['coastal-dusk'] = await probe(page);
  await page.evaluate(() => window.__skyDemo.preset('thin-cloud'));
  await waitFrames(page, 8);
  report.stats['thin-cloud'] = await probe(page);
  const a = base, b = report.stats['coastal-dusk'], c = report.stats['thin-cloud'];
  const differs = (p, q) => Math.abs(p.mean - q.mean) > 1.5 || Math.abs(p.warmRatio - q.warmRatio) > 0.02 || Math.abs(p.centerMean - q.centerMean) > 3;
  check('预设切换改变画面（sunset vs coastal-dusk）', differs(a, b), `mean ${a.mean}→${b.mean}, warm ${a.warmRatio}→${b.warmRatio}`);
  check('预设切换改变画面（coastal-dusk vs thin-cloud）', differs(b, c), `mean ${b.mean}→${c.mean}, warm ${b.warmRatio}→${c.warmRatio}`);

  await page.evaluate(() => window.__skyDemo.preset('sunset-outdoor'));
  await waitFrames(page, 8);
  const restored = await probe(page);
  // Demo 每帧以 window.__skyDemo.params 为唯一状态源；改它而非 setParams（后者会被下一帧覆盖）。
  await page.evaluate(() => Object.assign(window.__skyDemo.params, { sunDisk: 0, aureole: 0, flare: 0, bloom: 0 }));
  await waitFrames(page, 8);
  report.stats['no-glow'] = await probe(page);
  const g0 = report.stats['no-glow'];
  check('关闭日晕/太阳盘/flare 后高亮像素减少', g0.brightRatio < restored.brightRatio * 0.8 || g0.centerMean < restored.centerMean - 4,
    `bright ${restored.brightRatio}→${g0.brightRatio}, center ${restored.centerMean}→${g0.centerMean}`);
  await page.evaluate(() => window.__skyDemo.preset('sunset-outdoor'));
  await waitFrames(page, 8);

  const beforeOcc = await probe(page);
  await page.evaluate(() => document.getElementById('occluder').click());
  await waitFrames(page, 16);
  report.stats['occluded'] = await probe(page);
  const occ = report.stats['occluded'];
  check('遮挡物使太阳区域亮度/高亮下降', occ.centerMax < beforeOcc.centerMax || occ.brightRatio < beforeOcc.brightRatio * 0.9 || occ.centerMean < beforeOcc.centerMean - 2,
    `centerMax ${beforeOcc.centerMax}→${occ.centerMax}, bright ${beforeOcc.brightRatio}→${occ.brightRatio}`);
  await page.evaluate(() => document.getElementById('occluder').click());

  await page.setViewportSize({ width: 800, height: 520 });
  await waitFrames(page, 6);
  report.stats['resized'] = await probe(page);
  check('resize 后尺寸同步且画面有效', report.stats['resized'].w === 800 && report.stats['resized'].h === 520 && report.stats['resized'].mean > 12,
    JSON.stringify(report.stats['resized']));
  await page.setViewportSize({ width: 960, height: 600 });
  await waitFrames(page, 6);

  const runtime = await page.evaluate(() => ({ errors: window.__skyErrors.slice(), frames: window.__skyDemo.frames,
    env: !!window.__skyDemo.scene.environment, fog: !!window.__skyDemo.scene.fog,
    sky: !!window.__skyDemo.effect.skyMesh.parent, uSunDir: window.__skyDemo.effect.uniforms.uSunDir.value.toArray() }));
  report.runtime = runtime;
  check('无运行时异常', runtime.errors.length === 0, runtime.errors.join(' | ') || 'clean');
  check('PMREM 环境 / 雾 / 天空网格已挂载', runtime.env && runtime.fog && runtime.sky, JSON.stringify({ env: runtime.env, fog: runtime.fog, sky: runtime.sky }));
  check('无页面级 JS 异常', report.pageErrors.length === 0, report.pageErrors.join(' | ') || 'clean');
  check('无资源加载失败', report.failedRequests.length === 0, report.failedRequests.join(' | ') || 'clean');
  report.shaderErrors = report.consoleErrors.filter((t) => /shader|compile|WebGL|GL_INVALID|THREE/i.test(t));
  check('无 shader 编译 / WebGL 错误', report.shaderErrors.length === 0, report.shaderErrors.slice(0, 3).join(' | ') || 'clean');

  await page.addStyleTag({ content: 'aside,#hint,#diag{display:none!important}' });
  await waitFrames(page, 5);
  await page.screenshot({ path: SHOT });
  report.preview = { path: SHOT, bytes: fs.statSync(SHOT).size, updatedDeliverable: UPDATE_PREVIEW };
  check('预览图已生成', report.preview.bytes > 20000,
    `${report.preview.bytes} bytes · ${UPDATE_PREVIEW ? '已刷新 preview.png，请重建清单' : '临时文件，未改动交付物'}`);

  report.pass = report.checks.every((x) => x.pass);
} catch (err) {
  report.pass = false;
  report.fatal = String(err && (err.stack || err));
} finally {
  if (browser) await browser.close();
  server.close();
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.pass ? 0 : 1;
