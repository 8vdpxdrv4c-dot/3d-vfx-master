# 来源与许可

本包封装为一个技能，不改变内部模块的作者归属和许可范围。

- 33 个独立实现模块沿用各自 LICENSE.txt 与 ORIGINALITY.md。统一入口、检索/导出工具与导航文档是本次封装内容。
- Three.js 0.160.0、OrbitControls 与 lil-gui 0.19.2 为内置 MIT 运行依赖，原文件和许可随所用模块保留。3d-webgpu-volume-fire 额外内置 three.js r188dev 的 `three.core.js` / `three.tsl.js` / `three.webgpu.js` 及 8 个 addon，均为 MIT，与旧模块的 0.160.0 隔离。
- 排水喷水模块采用用户提供的 Spout / @P_Malin 着色器，保留署名。输入未附着色器许可证声明；不得把该着色器改标为原创、MIT 或已获商用授权。
- 预览图片来自此前本地真实渲染；纹理和场景素材采用各模块记录的程序化生成方式。此次封装没有下载外部素材。

喷水具体说明：[source-notes.md](../assets/modules/3d-drain-spout/references/source-notes.md)；该模块 [LICENSE.txt](../assets/modules/3d-drain-spout/LICENSE.txt)。

## 封装变更

效果实现与供应商文件仍逐字节保留。安装后的循环打磨更新了自有预览 main.js、GUI helper，并新增动画调度 helper；这些变更不改变第三方效果或依赖的署名与许可。34 个旧 SKILL.md 转为无技能 frontmatter 的 module-guide.md；预览导航和页面标题改为统一技能及模块说明。原包验证 JSON 明确标记为历史证据。源包路径/指纹及本次目标文件指纹见 [source-audit.json](source-audit.json)（初始打包时的历史快照，记录 34 模块 / 103 预设；2026-11-12 移除四季场景切换、程序化行星、流动熔岩后，其中对应 target 已不存在，仅作来源追溯证据，不参与检索、导出或完整性校验）。
原来的 34 包目录及旧合集压缩包仍保留，未改名为大师技能或覆盖其内容。

新增立方体清透流水来自本地自有工程，保留透射水体、重力飞溅与局部波包算法，只适配依赖路径和统一预设入口。来源指纹见 [waterflow-integration-origin.json](waterflow-integration-origin.json)，模块说明见 [ORIGINALITY.md](../assets/modules/3d-cube-waterflow/ORIGINALITY.md)。新增模块不使用 Spout 着色器。

真实火焰（2026-10-29）：新增用户指定 threeEditor Fire / Fire2、Photons 与三张贴图，来源与权属记录见 [模块记录](../assets/modules/3d-realistic-fire/ORIGINALITY.md)。本次新模块的验证不沿用旧模块记录。

Ultra Water（2026-10-30）：来自用户指定 [8vdpxdrv4c-dot/Ultra-Water](https://github.com/8vdpxdrv4c-dot/Ultra-Water)，上游 Humpalumps，© 2026 Humpalumps，MIT。保留原始 FFT、海岸、海面和水下代码及第三方声明，改写预设与演示编排并新增隔离视口适配。与旧模块的 Three.js 版本隔离；本地依赖为 Three.js 0.186.1 / lil-gui 0.21.0。来源与指纹见 [模块记录](../assets/modules/3d-ultra-water/source.json)，授权与衍生范围见 [ORIGINALITY.md](../assets/modules/3d-ultra-water/ORIGINALITY.md)。

烧焦溶解与灰烬（2026-10-31）：来自用户海晏堂工程，保留噪声署名和 Three.js MIT 许可，未将用户项目改标 MIT；[来源说明](../assets/modules/3d-burn-dissolve/ORIGINALITY.md)。

夕阳天空盒与太阳光晕（2026-11-11）：提取自用户提供的 `extracted-sky-glow-standalone.html`（「几猫3A大作」提取页），逐字保留 SALTLINE_SKY 天空着色器与镜头光晕后期着色器，仅加入四个可控 uniform；省略依赖港区几何、阴影贴图与 reversed-Z 深度的 AO、体积光轴、合成与运动模糊通道。输入未附独立许可证声明，不因统一封装改标原创或 MIT；离线 Three.js 0.160.0 / OrbitControls 为 MIT。来源指纹见 [source.json](../assets/modules/3d-skybox-sunset/source.json)，逐字复制与适配清单见 [ORIGINALITY.md](../assets/modules/3d-skybox-sunset/ORIGINALITY.md)，许可见 [LICENSE.txt](../assets/modules/3d-skybox-sunset/LICENSE.txt)。

雨丝与水花（2026-11-12）：来自用户在对话中内联提供的「几猫 · 雨效独立演示（可调雨点大小）」单文件 HTML。逐字保留 `makeRainGeometry` / `makeSplashGeometry`、四段着色器 `RAIN_VERT` / `RAIN_FRAG` / `SPLASH_VERT` / `SPLASH_FRAG` 及 `RAIN_COUNT=9000` / `SPLASH_COUNT=1200` / `RAIN_BOX=(26,15,26)`；只做实例化、参数映射、可选演示布景拆分与离线依赖替换，没有改写着色器算法、没有省略渲染通道。输入未附整体许可证声明，不改标原创或 MIT；离线 Three.js 0.160.0 / OrbitControls 为 MIT。指纹见 [source.json](../assets/modules/3d-rain-streaks/source.json)，逐字复制清单见 [ORIGINALITY.md](../assets/modules/3d-rain-streaks/ORIGINALITY.md)，许可见 [LICENSE.txt](../assets/modules/3d-rain-streaks/LICENSE.txt)。

GPU 体积火焰（2026-11-12）：移植自 three.js 官方 MIT 示例 `webgpu_volume_fire`，保留其 WebGPU 流体求解 compute kernel、体积光线步进着色器、`VolumeNodeMaterial` + `RenderPipeline` 节点图与 bloom 后期链，没有改写数学也没有省略通道；离线 vendor 构建 `three.core.js` / `three.tsl.js` / `three.webgpu.js` 与 8 个 addon 取自同一 dev 快照（`REVISION='188dev'`），均为 MIT。封装层只做单实例闭包、参数映射、异步初始化包装与 CDN → 离线 vendor 替换。指纹与依赖清单见 [DEPENDENCIES.json](../assets/modules/3d-webgpu-volume-fire/DEPENDENCIES.json)，逐字移植范围见 [ORIGINALITY.md](../assets/modules/3d-webgpu-volume-fire/ORIGINALITY.md)，许可见 [LICENSE.txt](../assets/modules/3d-webgpu-volume-fire/LICENSE.txt)。
