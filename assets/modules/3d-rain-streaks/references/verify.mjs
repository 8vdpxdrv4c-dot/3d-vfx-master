/**
 * 3d-rain-streaks 无头渲染验证（可复跑）。
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
 * 本模块是场景层、没有自己的 render()，因此在渲染循环内 hook renderer.render 后用
 * gl.readPixels 读默认帧缓冲，不要求 preserveDrawingBuffer。
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
const DEMO = '/assets/modules/3d-rain-streaks/demos/index.html';
const PREVIEW = path.join(MODULE, 'preview.png');
const UPDATE_PREVIEW = process.argv.includes('--update-preview') || process.env.UPDATE_PREVIEW === '1';
const SHOT = UPDATE_PREVIEW ? PREVIEW : path.join(os.tmpdir(), `rain-streaks-verify-${process.pid}.png`);

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
  await page.waitForFunction(() => window.__probe !== null, null, { timeout: 20000 });
  return page.evaluate(() => window.__probe);
}
async function waitFrames(page, count = 8) {
  const start = await page.evaluate(() => window.__rainDemo.frames);
  await page.waitForFunction((n) => window.__rainDemo.frames >= n, start + count, { timeout: 20000 });
}
/**
 * 与冻结基准帧逐像素比较。雨丝是稀疏细线，全画面均值/亮像素比例会被演示布景主导，
 * 差分能直接量化「雨丝是否真的消失或变形」，且基线像素留在页面内不参与序列化。
 */
async function diffAgainstBaseline(page) {
  return page.evaluate(() => {
    const a = window.__probeBaseline, b = window.__probePixels;
    if (!a || !b || a.length !== b.length) return { changedRatio: -1, meanDelta: -1 };
    let changed = 0, total = 0, sumDelta = 0;
    for (let i = 0; i < a.length; i += 4) {
      const la = 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2];
      const lb = 0.2126 * b[i] + 0.7152 * b[i + 1] + 0.0722 * b[i + 2];
      const d = Math.abs(la - lb);
      sumDelta += d;
      if (d > 12) changed++;
      total++;
    }
    return { changedRatio: +(changed / total).toFixed(4), meanDelta: +(sumDelta / total).toFixed(2) };
  });
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

  await page.goto(`http://127.0.0.1:${PORT}${DEMO}`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => window.__rainReady === true && window.__rainDemo?.frames >= 3, null, { timeout: 40000 });
  check('页面加载并渲染至少 3 帧', true, await page.evaluate(() => window.__rainDemo.frames + ' frames'));

  // 场景层效果没有自己的 render；hook 宿主 renderer.render 后在默认帧缓冲上取像素。
  await page.evaluate(() => {
    const d = window.__rainDemo;
    const gl = d.renderer.getContext();
    const orig = d.renderer.render.bind(d.renderer);
    d.renderer.render = (scene, camera) => {
      orig(scene, camera);
      if (!window.__probeRequested) return;
      window.__probeRequested = false;
      const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      const px = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let sum = 0, max = 0, lit = 0, bright = 0, black = 0, n = 0, cSum = 0, cN = 0, cMax = 0;
      const x0 = w * 0.34 | 0, x1 = w * 0.66 | 0, y0 = h * 0.34 | 0, y1 = h * 0.66 | 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, r = px[i], g = px[i + 1], b = px[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        sum += lum; if (lum > max) max = lum;
        if (lum > 55) lit++;
        if (lum > 140) bright++;
        if (r + g + b < 12) black++;
        n++;
        if (x >= x0 && x < x1 && y >= y0 && y < y1) { cSum += lum; cN++; if (lum > cMax) cMax = lum; }
      }
      window.__probe = {
        w, h, mean: +(sum / n).toFixed(2), max: Math.round(max),
        litRatio: +(lit / n).toFixed(4), brightRatio: +(bright / n).toFixed(4),
        blackRatio: +(black / n).toFixed(4),
        centerMean: +(cSum / cN).toFixed(2), centerMax: Math.round(cMax)
      };
      window.__probePixels = px;
    };
  });

  // 固定时间相位，让各预设的对比可复现
  await page.evaluate(() => window.__rainDemo.freeze(12.34));
  await waitFrames(page, 6);
  const base = await probe(page);
  await page.evaluate(() => { window.__probeBaseline = window.__probePixels; });
  report.stats['night-rain'] = base;
  check('画面非全黑', base.mean > 6 && base.blackRatio < 0.9, JSON.stringify(base));
  check('存在雨丝/水花高亮像素', base.max > 120 && base.litRatio > 0.002, `max=${base.max} lit=${base.litRatio}`);

  const uniformState = await page.evaluate(() => ({
    uRain: window.__rainDemo.effect.rainUniforms.uRain.value,
    uSize: window.__rainDemo.effect.rainUniforms.uSize.value,
    uVel: window.__rainDemo.effect.rainUniforms.uVel.value.toArray(),
    uPix: window.__rainDemo.effect.rainUniforms.uPix.value,
    counts: window.__rainDemo.effect.counts,
    attached: !!window.__rainDemo.effect.rainMesh.parent,
    renderRole: 'scene-layer'
  }));
  report.runtimeUniforms = uniformState;
  check('雨量/尺寸/风速已同步到 uniform', Math.abs(uniformState.uRain - 0.6) < 0.01 && Math.abs(uniformState.uSize - 1) < 0.01 && Math.abs(uniformState.uVel[1] + 9.4) < 0.01, JSON.stringify(uniformState));
  check('雨丝网格挂在宿主场景且实例数正确', uniformState.attached && uniformState.counts.rain === 9000 && uniformState.counts.splash === 1200, JSON.stringify(uniformState.counts));
  check('uPix 为正的像素宽度系数', uniformState.uPix > 0, `uPix=${uniformState.uPix}`);

  // 确定性状态快照：参数是否真的进了 uniform / instanceCount，不受布景亮度干扰
  const snap = () => page.evaluate(() => {
    const d = window.__rainDemo, e = d.effect;
    return {
      look: d.look,
      rain: +e.rainUniforms.uRain.value.toFixed(3),
      size: +e.rainUniforms.uSize.value.toFixed(3),
      velY: +e.rainUniforms.uVel.value.y.toFixed(2),
      sunDir: e.rainUniforms.uSunDir.value.toArray().map((v) => +v.toFixed(3)),
      counts: e.counts
    };
  });
  report.snapshots = {};

  await page.evaluate(() => { window.__rainDemo.preset('drizzle'); window.__rainDemo.freeze(12.34); });
  await waitFrames(page, 6);
  report.stats['drizzle'] = await probe(page);
  const b = report.stats['drizzle'], drizzle = await snap(), drizzleDiff = await diffAgainstBaseline(page);
  report.snapshots.drizzle = { ...drizzle, diff: drizzleDiff };
  check('细雨预设参数生效且画面改变',
    drizzle.rain === 0.28 && drizzle.size === 0.62 && drizzle.counts.rain === 5000 && drizzle.counts.splash === 450 && drizzleDiff.changedRatio > 0.004,
    `uRain=${drizzle.rain} uSize=${drizzle.size} counts=${drizzle.counts.rain}/${drizzle.counts.splash} changed=${drizzleDiff.changedRatio}`);

  await page.evaluate(() => { window.__rainDemo.preset('downpour'); window.__rainDemo.freeze(12.34); });
  await waitFrames(page, 6);
  report.stats['downpour'] = await probe(page);
  const c = report.stats['downpour'], downpour = await snap(), downpourDiff = await diffAgainstBaseline(page);
  report.snapshots.downpour = { ...downpour, diff: downpourDiff };
  check('暴雨预设参数生效且画面改变',
    downpour.rain === 1 && downpour.size === 1.55 && Math.abs(downpour.velY + 13.2) < 0.01 && downpourDiff.changedRatio > 0.004,
    `uRain=${downpour.rain} uSize=${downpour.size} velY=${downpour.velY} changed=${downpourDiff.changedRatio}`);

  await page.evaluate(() => { window.__rainDemo.preset('sunset-rain'); window.__rainDemo.freeze(12.34); });
  await waitFrames(page, 6);
  report.stats['sunset-rain'] = await probe(page);
  const s = report.stats['sunset-rain'], sunset = await snap(), sunsetDiff = await diffAgainstBaseline(page);
  report.snapshots['sunset-rain'] = { ...sunset, diff: sunsetDiff };
  check('逆光暖雨参数生效且雨丝仍被点亮',
    Math.abs(sunset.rain - 0.72) < 0.01 && sunset.sunDir[2] < -0.7 && s.max > 120 && s.litRatio > 0.01 && sunsetDiff.changedRatio > 0.004,
    `uRain=${sunset.rain} sunDir=${sunset.sunDir} max=${s.max} lit=${s.litRatio} changed=${sunsetDiff.changedRatio}`);

  const differs = (p, q) => Math.abs(p.mean - q.mean) > 0.15 || Math.abs(p.litRatio - q.litRatio) > 0.002 || Math.abs(p.max - q.max) > 20;
  check('相邻预设画面确有差异（细雨 vs 暴雨）', differs(b, c), `mean ${b.mean}→${c.mean}, max ${b.max}→${c.max}`);
  check('相邻预设画面确有差异（暴雨 vs 逆光暖雨）', differs(c, s), `mean ${c.mean}→${s.mean}, max ${c.max}→${s.max}`);

  // 关闭雨量：雨丝被着色器剔除，确定性断言 + 与冻结基准帧的逐像素差分
  await page.evaluate(() => { window.__rainDemo.preset('night-rain'); Object.assign(window.__rainDemo.params, { rain: 0, splashDrops: 0 }); window.__rainDemo.freeze(12.34); });
  await waitFrames(page, 6);
  report.stats['no-rain'] = await probe(page);
  const off = report.stats['no-rain'], offSnap = await snap(), offDiff = await diffAgainstBaseline(page);
  report.snapshots['no-rain'] = { ...offSnap, diff: offDiff };
  check('雨量归零后雨丝被剔除',
    offSnap.rain === 0 && offSnap.counts.splash === 0 && off.max < base.max - 20 && offDiff.changedRatio > 0.004,
    `uRain=${offSnap.rain} splash=${offSnap.counts.splash} max ${base.max}→${off.max} changed=${offDiff.changedRatio}`);

  // 雨点大小倍率：数值同步且画面变化
  await page.evaluate(() => { window.__rainDemo.preset('night-rain'); Object.assign(window.__rainDemo.params, { dropSize: 2.2 }); window.__rainDemo.effect.settle(); window.__rainDemo.freeze(12.34); });
  await waitFrames(page, 6);
  report.stats['large-drops'] = await probe(page);
  const big = report.stats['large-drops'];
  const sizeNow = await page.evaluate(() => window.__rainDemo.effect.rainUniforms.uSize.value);
  check('雨点大小倍率生效', Math.abs(sizeNow - 2.2) < 0.01 && (Math.abs(big.mean - base.mean) > 0.2 || Math.abs(big.litRatio - base.litRatio) > 0.001),
    `uSize=${sizeNow}, mean ${base.mean}→${big.mean}, lit ${base.litRatio}→${big.litRatio}`);

  // 风速与实例数参数
  const windState = await page.evaluate(() => {
    const d = window.__rainDemo;
    Object.assign(d.params, { windSpeed: 7, rainDrops: 4200, splashDrops: 300 });
    d.effect.update(0.016, d.params);
    return { vel: d.effect.rainUniforms.uVel.value.toArray(), counts: d.effect.counts };
  });
  check('风速/实例数参数直接生效', Math.abs(windState.vel[0] + 2.6 * 7 / 3) < 0.01 && windState.counts.rain === 4200 && windState.counts.splash === 300,
    JSON.stringify(windState));

  await page.evaluate(() => { window.__rainDemo.preset('night-rain'); window.__rainDemo.freeze(12.34); });
  await page.setViewportSize({ width: 800, height: 520 });
  await waitFrames(page, 6);
  report.stats['resized'] = await probe(page);
  check('resize 后尺寸同步且画面有效', report.stats['resized'].w === 800 && report.stats['resized'].h === 520 && report.stats['resized'].mean > 6,
    JSON.stringify(report.stats['resized']));
  await page.setViewportSize({ width: 960, height: 600 });
  await waitFrames(page, 6);

  const runtime = await page.evaluate(() => ({
    errors: window.__rainErrors.slice(), frames: window.__rainDemo.frames,
    look: window.__rainDemo.look, sceneChildren: window.__rainDemo.scene.children.length,
    skyAttached: !!window.__rainDemo.effect.rainMesh.parent
  }));
  report.runtime = runtime;
  check('无运行时异常', runtime.errors.length === 0, runtime.errors.join(' | ') || 'clean');
  check('无页面级 JS 异常', report.pageErrors.length === 0, report.pageErrors.join(' | ') || 'clean');
  check('无资源加载失败', report.failedRequests.length === 0, report.failedRequests.join(' | ') || 'clean');
  report.shaderErrors = report.consoleErrors.filter((t) => /shader|compile|WebGL|GL_INVALID|THREE/i.test(t));
  check('无 shader 编译 / WebGL 错误', report.shaderErrors.length === 0, report.shaderErrors.slice(0, 3).join(' | ') || 'clean');

  await page.addStyleTag({ content: '#hud,#hint,#controls{display:none!important}' });
  await waitFrames(page, 4);
  await page.screenshot({ path: SHOT });
  report.preview = { path: SHOT, bytes: fs.statSync(SHOT).size, updatedDeliverable: UPDATE_PREVIEW };
  check('预览图已生成', report.preview.bytes > 15000,
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
