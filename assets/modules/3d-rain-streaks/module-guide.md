# 雨丝与水花 · 3d-rain-streaks

**路由规则：用户需要「下雨 / 雨天 / 降雨 / 雨丝 / 雨点大小可调 / 地面水花 / 斜雨 / 暴雨 / 细雨 / 逆光雨」时，优先应用本模块**，默认使用 `night-rain` 预设。已有 `3d-rain`（夜景雨幕）仍用于均匀、无地面积水反馈的老式循环雨幕；本模块来自另一份用户代码，多了实例化雨丝的太阳前向散射、地面水花冠冕、雨点大小倍率与更宽的风速调节。

## 来源与保真边界

2026-11-12 用户在对话中提供「几猫 · 雨效独立演示（可调雨点大小）」单文件 HTML。本模块**逐字保留**其中的 `makeRainGeometry` / `makeSplashGeometry`、四段着色器 `RAIN_VERT` / `RAIN_FRAG` / `SPLASH_VERT` / `SPLASH_FRAG`、`RAIN_COUNT=9000` / `SPLASH_COUNT=1200` / `RAIN_BOX=(26,15,26)`、两组 uniforms 初值、材质与 renderOrder 配置，以及雨量/尺寸的指数平滑和 `updatePix()` / `updateWind()` 逻辑。

封装层只把全局状态收进实例、把 11 个可调数值映射到已有 uniform、把演示布景拆成可选的 `createRainStage()`。**没有改写着色器算法，没有新增计算通道**。逐字复制与适配清单见 [ORIGINALITY.md](ORIGINALITY.md)，输入未附独立许可证声明，见 [LICENSE.txt](LICENSE.txt)。离线 Three.js 0.160.0 与 OrbitControls 为 MIT，见 [DEPENDENCIES.json](DEPENDENCIES.json)。

原页使用 unpkg Three.js 0.180.0；本模块改用技能包内置的 0.160.0 离线副本，Demo 中设置 `renderer.useLegacyLights = false` 以接近 r180 的物理光照表现。

## 目录

| 路径 | 用途 |
| --- | --- |
| `demos/effects/rain-streaks.js` | 核心实例工厂 `createRainStreaksEffect()` 与可选演示布景 `createRainStage()` |
| `demos/effects/rain-streaks-module.js` | 统一生命周期契约适配器（单实例） |
| `demos/meta.js` | guiSchema（11 项）与 4 套预设 |
| `demos/index.html` | 离线可运行 Demo（原页 HUD 与控制面板） |
| `demos/vendor/` | Three.js r160、OrbitControls、MIT 许可 |
| `references/params.md` | 参数、状态源与接入约定 |
| `references/install-prompt.md` | 中英文接入提示词 |
| `references/verify.mjs` | 可复跑无头渲染验证 |
| `references/validation.md` | 实测验证记录 |
| `preview.png` | 真实浏览器渲染截图 |

## 接入

本效果是**场景层**，只往宿主 `scene` 挂两个 `InstancedBufferGeometry` 网格，不接管 `renderer.render`，也不修改场景雾、背景、相机或色调映射。宿主照常渲染自己的画面或后期链。

```js
import { createRainStreaksEffect } from './modules/3d-rain-streaks/demos/effects/rain-streaks.js';

const rain = createRainStreaksEffect({
  renderer, camera, scene,
  params: { rain: 0.6, dropSize: 1.2, windSpeed: 3.0 }
});

// 主循环
rain.update(dt, params);   // params 为唯一状态源
renderer.render(scene, camera);

// 卸载
rain.dispose();
```

统一契约适配器用于只需单实例的场景：

```js
import { create, update, dispose } from './modules/3d-rain-streaks/demos/effects/rain-streaks-module.js';

create({ renderer, scene, camera, includeStage: false }, look.params);
update(dt, params);
dispose();
```

`includeStage: true` 会额外挂上原页的地面噪声贴图、网格、箱体、圆柱与三盏灯；**正式项目中通常保持 false**，由宿主提供自己的地面与光照。水花固定生成在 `y = 0` 平面；若宿主地面不在该高度，需要平移 `rain.group` 或自行调整水花生成面。

宿主 `camera` 或 `renderer` 更换时调用 `setCamera()` / `setRenderer()`；resize 时 `setSize()` 会重新计算 `uPix`（雨丝的像素级最小宽度）。同一页面要放多套独立雨场时直接用实例工厂，重复 import 同一适配器不会产生第二个实例。

## 预设

| id | 观感 |
| --- | --- |
| `night-rain` | 原页默认值：60% 雨量、1.00× 雨点、风速 3.0、9000 雨丝 + 1200 水花 |
| `drizzle` | 稀疏细雨，雨点 0.62×，水花 450，时间倍率 0.85 |
| `downpour` | 满雨量、1.55× 粗雨点、风速 6.5，雨丝与水花都开到实例池上限 9000 / 1200 |
| `sunset-rain` | 低角度逆光、雨丝受光 3.4；方位角保持 205°（贴近原页 211°），让太阳留在视线前方、前向散射继续点亮雨丝 |

四套预设的 `rainDrops` / `splashDrops` 均不超过用户原始实例池容量（9000 / 1200）；这两项是 `instanceCount` 而非重建几何，传入更大值会被截断。调整暴雨强度请用 `rain`、`dropSize`、`windSpeed`、`fallSpeed`。

## 与其它模块的组合

- **与 `3d-skybox-sunset`**：天空盒是最终输出所有者，负责 HDR 与整条后期链；本模块只作为场景层加入同一个 `scene`，由 `render(scene, camera)` 一并绘制。用 `sunset-rain` 预设并把两边太阳方位调成一致，能得到一致的逆光雨丝。不要在本模块后额外串 `3d-bloom` 等后期链。
- **与 `3d-rain`**：两者都是同一场景内的雨幕层，叠加会显著增加 overdraw 与亮度；按需求二选一，不要默认同时启用。
- **与 `3d-snow` / 其它粒子模块**：共享场景时统一世界尺度与粒子范围，检查透明排序（`renderOrder` 890 / 900）。

## 参数与验证

11 个参数、状态源约定、暂停与固定相位截图方法见 [params.md](references/params.md)。

`references/verify.mjs` 用无头浏览器 + SwiftShader 做真实渲染检查，默认把截图写入系统临时目录，**不会改动 `preview.png`**，因此复跑不会破坏 `package-manifest.json` 的 SHA-256 自检；确需刷新交付预览时加 `--update-preview`（或 `UPDATE_PREVIEW=1`），之后必须重建清单。

```bash
node references/verify.mjs
node references/verify.mjs --update-preview
```

## 边界

实例化解析雨丝与程序化水花冠冕，不模拟真实液滴碰撞、积水深度、湿面反射或流体风场；雨丝亮度是 Henyey-Greenstein 风格相位函数的艺术化近似，不是大气光学测量值。性能数据只报告实测设备帧率。
