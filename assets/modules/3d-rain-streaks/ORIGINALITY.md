# 来源与逐字复制清单 · 3d-rain-streaks

## 输入

- 日期：2026-11-12
- 形式：用户在对话中以 `@long-text` 内联提供的完整单文件 HTML，标题「几猫 · 雨效独立演示（可调雨点大小）」；**没有附独立文件，也没有附整体许可证声明**。
- 原页依赖：unpkg `three@0.180.0` + `OrbitControls`；本模块改用技能包内置的 Three.js `0.160.0` 离线副本。
- 版权归属：雨丝 / 水花着色器与场景实现归属该输入页面作者；本包只做提取、参数化、生命周期封装与离线演示编排，不改标原创或 MIT。

## 逐字保留的标识符与代码块

| 类别 | 标识符 / 片段 |
| --- | --- |
| 几何体 | `makeRainGeometry(count)`、`makeSplashGeometry(count)` |
| 着色器常量 | `RAIN_VERT`、`RAIN_FRAG`、`SPLASH_VERT`、`SPLASH_FRAG`（含原页 `★ 新增：uSize` 注释与 `wPhase` / `sHash` 辅助函数） |
| 系统常量 | `RAIN_COUNT = 9000`、`SPLASH_COUNT = 1200`、`RAIN_BOX = (26, 15, 26)` |
| uniforms 初值 | `rainUniforms`（`uTime/uRain/uPix/uSize/uVel/uBox/uSunDir/uSunCol/uAmb`）、`splashUniforms`（`uTime/uRain/uSize/uSunDir/uSunCol/uAmb`） |
| 材质与网格 | 两组 `ShaderMaterial` 的 `transparent/depthWrite/blending/side`，`renderOrder = 900 / 890`、`frustumCulled = false`、`matrixAutoUpdate = false` |
| 控制器逻辑 | `updatePix()` 的 `2·tan(fov·π/360)/drawingBufferHeight`、`updateWind()` 的 `-2.6·s/3, -9.4, 1.1·s/3`、雨量与尺寸的指数平滑 `dt × 1.5` / `dt × 6` |
| 演示布景（第 5 节） | 512×512 噪声 CanvasTexture（18000 点、repeat 16、anisotropy 8）、80×80 地面与 GridHelper、7 个箱体及 EdgesGeometry、6 根圆柱、HemisphereLight / DirectionalLight ×2 与 2048 阴影配置 |
| 主循环与 UI | HUD / hint / 三个滑杆 / 暂停按钮的 HTML 与 CSS、fps 统计、`renderer` 的 ACES + exposure 1.1 + PCFSoftShadowMap 配置 |

四段着色器文本的 SHA-256 指纹见 [source.json](source.json)，可用于检测后续是否被意外改写。

## 封装层做的改动（不涉及着色器算法）

1. 把原页的模块级 `state`、`rainUniforms`、`splashUniforms`、两个 mesh 收进 `createRainStreaksEffect()` 返回的实例；该工厂可创建多套独立雨场，`rain-streaks-module.js` 提供技能约定的单实例生命周期适配器。
2. 新增 11 个可调参数（`rain`、`dropSize`、`windSpeed`、`fallSpeed`、`sunAzimuth`、`sunElevation`、`sunIntensity`、`ambIntensity`、`rainDrops`、`splashDrops`、`speed`），全部映射到**原页已存在的 uniform**、`instanceCount` 或时间推进，没有向着色器注入新代码、没有新增计算通道。
   - `fallSpeed` 把原页硬编码的 `uVel.y = -9.4` 变成可调值。
   - `sunAzimuth` / `sunElevation` 用球面角重算 `uSunDir`；默认 211° / 18.9° 还原原页 `sun.position(-12,8,-20).normalize()`。
   - `sunIntensity` / `ambIntensity` 只缩放原页的 `uSunCol` / `uAmb` 基色。
   - `rainDrops` / `splashDrops` 只改 `geometry.instanceCount`，不重建 seed 缓冲。
3. 把第 5 节散落的 `scene.add(...)` 收进 `createRainStage()` 返回的 `Group`，并增加 `setSunDirection()` / `dispose()`；正式接入时可完全不创建布景。
4. Demo 的 importmap 从 CDN 改为离线 vendor；`renderer.useLegacyLights = false` 以在 r160 上贴近 r180 的物理光照；三个滑杆改为以 `window.__rainDemo.params` 为唯一状态源，并新增预设下拉与可复现截图的 `freeze()`。
5. 增加 `setTime()` / `settle(values?)`，仅用于验收与截图稳定，不改变正常播放行为；`settle(params)` 可在外部直接改参数对象后、宿主尚未执行 `update()` 时一次收敛雨量/尺寸平滑。6. `rainDrops` / `splashDrops` 的上限收敛到用户原始 seed 容量 9000 / 1200，不扩容、不重建几何，只是让 guiSchema 与预设不再给出会被截断的数值。

## 省略的内容

- 原页没有深度依赖通道，因此本模块**没有省略任何渲染通道**；四段着色器与两组几何全部保留。
- 未保留原页的 unpkg CDN importmap（改为离线依赖）与内联 `<script>` 里的模块级全局变量（改为实例状态）。
- 演示布景是可选资源，正式接入项目中通常不复制。

## 预览与许可

`preview.png` 是本模块 Demo 在本机无头 Chromium（SwiftShader）中的真实渲染截图，不是生成图片、也不是原页的宣传图。验证脚本默认只把截图写入系统临时目录，不会覆盖交付预览，以免破坏 `package-manifest.json` 的 SHA-256 自检。

许可说明见 [LICENSE.txt](LICENSE.txt)，第三方依赖记录见 [DEPENDENCIES.json](DEPENDENCIES.json)。
