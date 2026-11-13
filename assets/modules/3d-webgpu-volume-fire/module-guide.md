# GPU 体积火焰 · 3d-webgpu-volume-fire

**路由规则：用户需要「GPU 火焰 / 体积火焰 / 体积烟雾 / 流体火焰 / 真实火焰燃烧（需要物理级体积感）/ WebGPU 火焰」时，优先应用本模块**，默认使用 `classic` 预设。

与现有 `3d-realistic-fire` 的分工：

| 场景 | 选哪个 |
| --- | --- |
| 只要「有火焰」，跑在 WebGL 2 上、要低开销、要兼容老设备 | `3d-realistic-fire`（广告牌粒子火焰） |
| 要体积感、要烟与火连续过渡、要 GPU 流体平流与湍流、可接受 WebGPU 要求 | 本模块 |

本模块**必须有 WebGPU**。宿主环境不满足时 `createVolumeFireEffect()` 会抛出 `code === 'WEBGPU_UNAVAILABLE'` 的错误，应降级到 `3d-realistic-fire`，而不是渲染黑屏。

## 来源与保真边界

移植自 three.js 官方示例 `webgpu_volume_fire`（快照 SHA-256 `854ad2186b…f3d1fb`）。三维流体求解的 compute kernel（半拉格朗日平流 / curlNoise 湍流 / 浮力 / Jacobi 压力投影 / 散度消除）、体积光线步进着色器、`VolumeNodeMaterial` + `RenderPipeline` 节点图与 bloom 后期链**均按上游保留**，没有改写数学，也没有省略通道。

封装层只做四件事：把全局状态收进单实例闭包、把参数映射到已有 uniform 与节点属性、把 `renderer.init()` 的异步初始化包装成 Promise、把 CDN importmap 换成模块内离线 `vendor/`。详见 [LICENSE.txt](LICENSE.txt) 与 [DEPENDENCIES.json](DEPENDENCIES.json)。

## 目录

| 路径 | 用途 |
| --- | --- |
| `demos/effects/volume-fire.js` | 核心实例工厂 `createVolumeFire()`、`probeWebGPU()`、`DEFAULT_PARAMS` |
| `demos/effects/volume-fire-module.js` | 统一生命周期契约适配器（单实例，异步就绪） |
| `demos/meta.js` | guiSchema（28 项）与 5 套预设 |
| `demos/index.html` | 离线 Demo：参数面板、预设、**复制提示词**、验收接口 |
| `demos/vendor/` | three r188dev WebGPU/TSL 构建 + 8 个 addon + MIT 许可（约 3.9 MB） |
| `references/params.md` | 参数、状态源、接入与验收约定 |
| `references/prompt-template.md` | 「复制提示词」输出的模板与字段说明 |
| `references/verify.mjs` | 可复跑无头验证（WebGPU） |
| `references/validation.md` | 实测验证记录 |
| `preview.png` | 真实浏览器渲染截图 |

## 接入

### 方式一：等就绪（推荐）

```js
import { createVolumeFireEffect } from './modules/3d-webgpu-volume-fire/demos/effects/volume-fire-module.js';

const fire = await createVolumeFireEffect(
  { container, size: [w, h] },
  { simSpeed: 1.2, turbulence: 3.2, exposure: 2 }
);

function frame(dt) {
  fire.update(dt);
  fire.setSize(w, h);
}

function unmount() { fire.dispose(); }
```

### 方式二：同步入口 + 轮询

```js
import { create, update, isReady, dispose } from './modules/3d-webgpu-volume-fire/demos/effects/volume-fire-module.js';

const handle = create({ container }, look.params).catch(err => {
  if (err.code === 'WEBGPU_UNAVAILABLE') fallbackToRealisticFire();
});

if (isReady()) update(dt, params);
```

## 运行前提（关键）

1. **必须 WebGPU**：Chrome / Edge 113+，`navigator.gpu` 可用。
2. **必须是安全上下文**：`https://` 或 `http://localhost` / `http://127.0.0.1`。**`file://` 双击打开会失败**，因为 `isSecureContext` 为 false，`navigator.gpu` 直接不存在。
3. `about:blank`、`data:` URL 同样不是安全上下文。
4. 依赖版本必须成套：`three.core.js` / `three.tsl.js` / `three.webgpu.js` 来自同一提交（`REVISION = '188dev'`），不能与其它 three 版本混用。

## 演示页的「复制提示词」

所有 demo 页共用统一头部（`assets/shared/demo-chrome.js` / `demo-chrome.css`），右上角固定一个「复制提示词」按钮，输出一段可直接贴给其它 agent 的「应用提示词」：

- 模块 slug 与接入文档路径、当前预设 id；
- 当前预设的完整参数快照（JSON）；
- 四条落地要求：只挂效果、不带调试层、不带多余描述、不重写算法；
- 一条验收线：原场景照常渲染、效果可见、控制台无报错。

同一内容也暴露在 `window.__vfxDemoChrome.buildPrompt()`（本页 `window.__volumeFireDemo.buildPrompt()` 已转发到这里），便于自动化读取。模板见 [references/prompt-template.md](references/prompt-template.md)。

## 组合注意

- 本模块接管自己的容器与渲染循环（`render_role = isolated-viewport`），**不要**与 `3d-skybox-sunset`、`3d-cinema-stack` 等「最终输出所有者」串联在同一个 canvas 上；要同框出现时，用两个 canvas 或把它渲染到纹理再由宿主合成。
- 与 `3d-rain-streaks` 可共存：雨是场景层，粒子挂在宿主 scene 上；火焰自己管渲染循环，两者互不拦截 `renderer.render`。
- 火焰自带 PMREM 环境与地面接收光照，宿主不需要额外补光。
