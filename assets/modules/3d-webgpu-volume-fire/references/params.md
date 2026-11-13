# 参数与接入约定 · 3d-webgpu-volume-fire

## 唯一状态源

Demo 每帧以 `window.__volumeFireDemo.params` 调用 `fire.setParams()` / 内部 `applyParams()`。**在浏览器控制台或自动化里改参数，要改这个对象，而不是调一次 `setParams()` 就以为生效**——适配器的 `update(dt, params)` 会逐键比较差异，只把变化的键下发给实例，所以外部改 `params` 后下一帧仍会被采纳；反过来，直接 `fire.setParams()` 一次而不改 `params`，下一次 `update()` 不会覆盖它（因为适配器只在检测到差异时下发），但 demo 的 HUD 读数会与真实 uniform 不一致，验收时以 `fire.getParams()` 为准。

## 28 个 schema 参数

| key | 范围 | 默认 | 作用 |
| --- | --- | --- | --- |
| `simSpeed` | 0 – 4 | 1.2 | 模拟时间倍率。0 冻结流体，画面保持当前帧不黑屏 |
| `turbulence` | 0 – 8 | 3.2 | curlNoise 湍流强度，越大火舌越碎 |
| `fireLifespan` | 0.2 – 4 | 1.3 | 火焰区存活时间，越长火柱越高 |
| `smokeLifespan` | 0.5 – 8 | 3.5 | 烟区存活时间 |
| `fireStartColor` | 颜色 | `#ffe68c` | 黑体色带中心（最热） |
| `fireMidColor` | 颜色 | `#ff7305` | 中段 |
| `fireEndColor` | 颜色 | `#ff0000` | 边缘（最冷） |
| `fireHue` | -180 – 180 | 0 | 在色带上做色相旋转，蓝色等离子靠它 |
| `glowSpread` | 0 – 12 | 5 | bloom 扩散半径 |
| `saturation` | 0 – 2 | 1.1 | 最终调色饱和度 |
| `exposure` | 0.1 – 6 | 2 | 最终曝光 |
| `raymarchSteps` | 4 – 64 | 16 | 体积光线步进步数，性能主开关 |
| `resolution` | 0.3 – 1 | 1 | 内部渲染分辨率倍率，性能主开关 |
| `denoise` | 0 – 1 | 0.35 | 体积降噪混合量 |
| `bloom` | bool | true | 是否启用 bloom 后期 |
| `bloomStrength` | 0 – 1 | 0.1 | bloom 强度 |
| `emitTemperature` | 0 – 3 | 1 | 发射源温度。0 → 火焰熄灭 |
| `emitDensity` | 0 – 3 | 1 | 发射源密度，越大越浓 |
| `buoyancy` | 0 – 4 | 1.2 | 浮力，越大火舌上冲越快 |
| `velocityDamping` | 0 – 1 | 0.98 | 速度阻尼 |
| `phaseAsymmetry` | -1 – 1 | 0.4 | 相位函数前后向不对称，逆光看火更亮 |
| `powderStrength` | 0 – 2 | 1 | powder 项，增强边缘体积感 |
| `multiScattering` | 0 – 2 | 1 | 多重散射近似系数 |
| `shadowAbsorption` | 0 – 8 | 2 | 自阴影吸收 |
| `shadowAmbient` | 0 – 1 | 0.15 | 自阴影环境项 |
| `lightSmoke` | 0 – 2 | 1 | 烟受光照程度 |
| `keyLightIntensity` | 0 – 8 | 2.4 | 主光强度 |
| `animateEmitter` | bool | true | 发射源是否随时间抖动 |

构建期参数（不走 schema，直接传给 `createVolumeFire()`）：`gridX` / `gridY` / `gridZ`，默认 `100×100×200`（约 200 万体素）。改网格尺寸要重新初始化，不能在运行中切换。

## 5 套预设

| id | 场景 |
| --- | --- |
| `classic` | 经典营火，官方默认参数 |
| `blue-plasma` | 蓝色等离子，高 simSpeed + 色相旋转 |
| `toxic-green` | 毒绿火焰，用于科幻/魔法 |
| `dense-smoke` | 浓烟为主，火焰压低、烟寿命拉长 |
| `stylized-cartoon` | 卡通化：低步数、高饱和、bloom 加强 |

## 生命周期

```js
await createVolumeFireEffect({ container, size }, params); // 异步：等 WebGPU 设备就绪
fire.update(dt);        // 推进流体 + 渲染
fire.setParams({ ... }); // 热更新，只下发变化的键
fire.setSize(w, h);      // resize
fire.dispose();          // 释放 GPU 资源（compute pipeline、纹理、RenderPipeline）
```

- `update()` 在内部累加固定步长的模拟，帧率无关。
- `simSpeed = 0` 时只跳过模拟累加，仍然渲染最后一帧，用于截图验收。
- 容器尺寸为 0 时不要调用 `setSize()`，会得到 0 尺寸的 render target。

## 性能与降级

| 目标设备 | 建议 |
| --- | --- |
| 桌面独显 | 默认参数即可（`raymarchSteps 16`、`resolution 1`） |
| 集显 / 轻薄本 | `raymarchSteps 10`、`resolution 0.7`，或降 `gridY` 到 128 |
| 移动端 WebGPU | `raymarchSteps 8`、`resolution 0.6`，关闭 `bloom` |
| 无 WebGPU | 抛 `WEBGPU_UNAVAILABLE`，降级 `3d-realistic-fire` |

## 「复制提示词」约定

`demos/index.html` 的「复制提示词」按钮调用 `buildPrompt()`，输出五段式 Markdown：效果与模块 / 调好的参数 / 代码使用方式 / 必须注意的约束 / 验收。同一函数挂在 `window.__volumeFireDemo.buildPrompt()`。

自动化读取方式：

```js
const md = await page.evaluate(() => window.__volumeFireDemo.buildPrompt());
```

模板结构见 [prompt-template.md](prompt-template.md)。
