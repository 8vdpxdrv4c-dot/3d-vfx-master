# 参数与接入约定 · 3d-rain-streaks

## guiSchema 参数（11 项）

| key | 默认 | 范围 | 作用 | 映射到的原始代码 |
| --- | --- | --- | --- | --- |
| `rain` | 0.6 | 0–1 | 雨量（着色器内按 seed 剔除雨丝，水花同步增减） | `uRain`、`rainTarget`、原页 `setRain()` |
| `dropSize` | 1.0 | 0.3–2.5 | 雨点大小倍率，同时放大雨丝长度、宽度与水花冠冕 | `uSize`、`sizeTarget`、原页 `setSize()` |
| `windSpeed` | 3.0 | 0–8 | 横向风速，改变雨丝倾角 | `uVel.x/z = -2.6·s/3, 1.1·s/3`（原页 `updateWind()`） |
| `fallSpeed` | 9.4 | 3–18 | 竖直下落速度 | `uVel.y = -fallSpeed`（原页固定 `-9.4`） |
| `sunAzimuth` | 211 | 0–360 | 太阳方位角（度） | `uSunDir`；211° / 18.9° 还原原页 `sun.position(-12,8,-20)` 方向 |
| `sunElevation` | 18.9 | 2–70 | 太阳高度角（度） | `uSunDir`；同时同步可选演示布景的平行光位置 |
| `sunIntensity` | 2.4 | 0–5 | 雨丝受光强度 | `uSunCol = vec3(1.0,0.72,0.42) × sunIntensity`（原页 2.4） |
| `ambIntensity` | 1.0 | 0–3 | 环境补光强度 | `uAmb = vec3(0.10,0.13,0.18) × ambIntensity` |
| `rainDrops` | 9000 | 1000–9000 | 实际绘制的雨丝实例数（容量 9000，超出部分截断） | `rainMesh.geometry.instanceCount` |
| `splashDrops` | 1200 | 0–1200 | 实际绘制的水花实例数（容量 1200） | `splashMesh.geometry.instanceCount` |
| `speed` | 1.0 | 0–2 | 时间倍率；0 为暂停 | `clock.time += dt × speed` |

`rainDrops` / `splashDrops` 只调整 `instanceCount`，不重建 geometry，没有「拓扑重建」开销。这两个上限**就是用户原始常量** `RAIN_COUNT = 9000` / `SPLASH_COUNT = 1200`（逐字保留，未扩容）；schema 与预设均不超过容量，传入更大的数值会被截断到容量。需要更多实例时改 `RAIN_COUNT` / `SPLASH_COUNT` 常量并重新创建效果。

## 唯一状态源

宿主每帧把**同一个完整参数对象**传给 `update(dt, params)`，该对象就是唯一状态源。修改参数时直接改这个对象（或调用预设切换并把它写回同一个对象），不要只调用一次 `setParams()`——后者会被下一帧的完整 `params` 覆盖。Demo 的 `window.__rainDemo.params` 就是这个对象。

```js
const params = { ...defaults, ...meta.looks[0].params };
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  effect.update(dt, params);      // 每帧完整传入
  renderer.render(scene, camera);
}
// 改参数
params.rain = 0.9;
```

雨量与雨点大小采用原页的指数平滑（`dt × 1.5` / `dt × 6`），因此改动后约 0.5–1 秒才完全到位；自动化验收或生成截图时可调用 `settle()` 立即收敛，并用 `setTime(t)` 固定时间相位得到可复现画面。Demo 的 `window.__rainDemo.freeze(12.34)` 同时完成这三件事。

## 生命周期

| 方法 | 说明 |
| --- | --- |
| `createRainStreaksEffect({renderer, camera, scene, params})` | 创建独立实例；`scene` 存在时默认自动挂载 |
| `attach(scene)` / `detach()` | 挂到 / 移出宿主场景 |
| `update(dt, params)` | 推进时间、平滑雨量/尺寸、同步 uniforms 与 `uPix` |
| `setSize(w, h)` / `setCamera(camera)` / `setRenderer(renderer)` | 重算 `uPix = 2·tan(fov/2) / drawingBufferHeight` |
| `setStage(stage)` | 让太阳参数同步驱动可选演示布景的平行光 |
| `setTime(t)` / `settle(values?)` | 固定相位 / 立即完成平滑；`settle(params)` 可在外部直接改参数后一次收敛 |
| `dispose()` | 移出场景、释放两组几何与材质 |

**渲染所有权**：本模块是场景层，不提供 `render()`，不修改 `scene.background` / `scene.fog` / 相机 / 色调映射。宿主照常调用 `renderer.render(scene, camera)` 或自己的后期链。与 `3d-skybox-sunset` 组合时由天空盒的 `render(scene, camera)` 统一输出，本模块不需要额外渲染调用。

## 性能降级

优先降低 `rainDrops`、`splashDrops`（最直接的 overdraw 来源），其次把 `renderer.setPixelRatio()` 限制到 1，再考虑 `dropSize`。两组网格都是 `depthWrite:false` 的 additive 透明层，重叠时会显著增加填充率；移动设备建议从 `drizzle` 预设起步。水花只在地面 `y=0` 生成，若宿主无地面或地面不在该高度，设 `splashDrops = 0` 关闭。

## 导出

```bash
python scripts/toolkit.py export 3d-rain-streaks --look night-rain --out /path/to/project/rain-demo
python scripts/toolkit.py export 3d-rain-streaks --look downpour --set dropSize=1.8 --out /path/to/project/storm-demo
python scripts/toolkit.py show 3d-rain-streaks
python scripts/toolkit.py search "下雨"
```

导出工具会校验该模块 `demos/meta.js` 的格式，并按 `package-manifest.json` 做模块完整性检查。
