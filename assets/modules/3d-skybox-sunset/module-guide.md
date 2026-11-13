# 夕阳天空盒与太阳光晕

检索 `3d-skybox-sunset`；效果 id `skybox-sunset`。

**路由规则：用户需要「夕阳 / 日落 / 黄昏 / 逆光 / 金色时刻 / 户外自然环境 / 天空盒带太阳」时，优先应用本模块**，不要只用纯色背景、渐变 CSS 或普通 HDR 贴图代替。它一次性提供天空盒、太阳圆盘与日晕、镜头光晕/辉光、匹配的暖色平行光、PMREM 环境与暖雾，是「夕阳户外环境」的默认落地方案。用户明确指定了别的天空方案时沿用其选择。

预设：`sunset-outdoor` 夕阳户外（默认，等同原页方位）、`golden-hour` 金色时刻、`coastal-dusk` 落日海岸、`thin-cloud` 薄云黄昏。

```powershell
python scripts/toolkit.py export 3d-skybox-sunset --look sunset-outdoor --out /path/to/new/sunset-demo
python scripts/toolkit.py export 3d-skybox-sunset --look coastal-dusk --set flare=0.32 --out /path/to/new/dusk-demo
```

导出后启动本地静态服务器，打开 `demos/index.html`。运行依赖全部随包提供（Three.js r160、OrbitControls），无 CDN。默认构图与提取源一致，是纯天空（无地面与前景几何）；左侧面板可实时调整太阳方位、调色板、云量、日晕、光晕与曝光。「遮挡示例」按钮会显示地面、剪影与遮挡块，演示太阳被前景挡住时镜头光晕自动衰减，同时可观察平行光与 PMREM 环境对实体的作用。隐藏页面自动暂停。

## 提取内容与边界

着色器文本逐字来自用户提供的 `extracted-sky-glow-standalone.html`（源自「几猫3A大作」）：

- `SALTLINE_SKY`：晴空渐变、云层与云隙、云底受光、地平线暖光、太阳圆盘、Mie 日晕（aureole）；
- 后期链：6 级 bloom 降采样/升采样（含 Karis 平均）、横向星芒、镜头污渍、曝光自适应、太阳 12 抽样可见度、镜头光晕 flare（veiling glare / 衍射尖峰 / ghosts / halo）、AgX 与 ACES 混合调色、分离色调、暗角、FXAA / 锐化 / 颗粒 / 抖动；
- 方向光颜色与强度、天空调色板、PMREM 环境捕获。

**未纳入**依赖港区几何与阴影贴图的通道：AO、体积光轴、深度降采样、合成、运动模糊。原页本身也说明纯天空无法复现这些通道。太阳遮挡改用本模块自建 HDR 目标的深度纹理，行为等价但不要求宿主提供阴影贴图或 reversed-Z。

相对原页只做了四处有意的适配：H6 增加 `uAureole / uCloudCover / uCloudSpeed / uSunDisk` 四个倍率 uniform；太阳方位/调色板/曝光等收敛为实时参数；宿主提供 renderer/scene/camera 与渲染循环；运行期 Three.js 使用技能内置的 r160。详见 [ORIGINALITY.md](ORIGINALITY.md)。

## 接入

推荐直接使用多实例工厂 `createSkyGlowEffect`；需要统一生命周期时用 `demos/effects/sky-glow-module.js` 的 `create/update/render/dispose` 适配器（单实例）。完整参数与调用见 [references/params.md](references/params.md)。

```js
import { createSkyGlowEffect } from './effects/sky-glow.js';

const sky = createSkyGlowEffect({ renderer, scene, params: preset });
sky.setSize(w, h);            // drawing buffer 的物理像素尺寸
// 每帧：
sky.update(dt, params);
sky.render(scene, camera);    // 最终输出，替代 renderer.render(scene, camera)
// 卸载：
sky.dispose();
```

**渲染所有权**：`sky.render()` 把场景先渲到 HalfFloat HDR 目标，再经后期链输出到屏幕，它是最终输出所有者。不要与 `3d-bloom` / `3d-cinema-stack` / `3d-depth-of-field` 等 postprocess 模块直接串联，也不要在它之后再次色调映射。它与 Ultra Water 的隔离视口同样需要先确定唯一输出所有者。相机仍归宿主，本模块不驱动相机、不创建 canvas。

**光照一致性**：本模块自带 `DirectionalLight`（默认 intensity 9）与 PMREM 环境。r160 请设置 `renderer.useLegacyLights = false`（等价于 r180 的物理光照），否则强度 9 会过曝。模块会把 `scene.environment` / `scene.fog` 改为夕阳环境，`dispose()` 会恢复宿主原值。宿主若另有环境光或太阳光，需自行避免重复。

**性能**：后期链含 6 级 bloom、5 次升采样、2 次星芒、1 次曝光、1 次调色与 1 次 FXAA。低功耗设备可降低 DPR、`setSize` 的分辨率，或把 `bloom` 设为 0（此时跳过 bloom / 星芒通道）；`captureEnvironment: false` 可省去 PMREM。改变太阳方位时环境贴图最多每 300 ms 重捕一次。

## 适用边界

程序化天空与艺术化后期，不模拟真实大气散射、太阳光谱或云物理；太阳光晕是屏幕空间 flare，不是体积光。原页已说明体积光轴与接触 AO 依赖场景深度，本模块不复现。

## 验证与预览

`preview.png` 为无头 Chrome + SwiftShader 的真实渲染截图。可复跑脚本 [references/verify.mjs](references/verify.mjs) 会检查 shader 编译、太阳/日晕高亮、预设差异、参数生效、遮挡衰减、resize 与资源释放，16 项结果见 [references/validation.md](references/validation.md)：

```powershell
node assets/modules/3d-skybox-sunset/references/verify.mjs
```

其它机器设置 `PLAYWRIGHT_CORE` 与 `CHROME_PATH` 后执行。该脚本默认把截图写到系统临时目录，**不会改动 `preview.png`**，因此复跑不会破坏 `toolkit.py verify` 的清单校验；确需刷新交付预览时加 `--update-preview`（或 `UPDATE_PREVIEW=1`），然后重建 `references/package-manifest.json`。
