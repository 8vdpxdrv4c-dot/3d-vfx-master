---
name: 3d-vfx-master
description: >-
  构建、组合和调优基于 Three.js 的交互式 3D 可视化与网页特效。
  当用户要求3Dfans特效大师、增加3D特效、真实火焰、物体燃烧后、烧焦、焦黑、灰烬、余烬、焚毁溶解、逼真海水、写实海洋、粒子天气、程序化材质、能量管流、自然场景、
  夕阳、日落、黄昏、逆光、金色时刻、户外环境、天空盒、太阳光晕、日晕、镜头光晕、
  下雨、雨天、降雨、雨丝、雨点大小、地面水花、斜雨、暴雨、细雨、逆光雨、粒子天气、
  GPU火焰、体积火焰、体积烟雾、流体火焰、WebGPU火焰、燃烧、营火、等离子、卡通火焰、
  滚动叙事或镜头后期时使用。按需复用内置 39 个效果模块和 122 套预设；逼真海水先让用户选择水效再执行，
  需要夕阳户外环境时应用 3d-skybox-sunset 天空盒特效，需要下雨天气时应用 3d-rain-streaks 雨丝与水花特效，
  需要GPU体积火焰或流体火焰时应用 3d-webgpu-volume-fire（必须WebGPU+安全上下文），
  支持扩展同契约效果、实时参数、离线 Demo、生命周期接入和性能降级。
---

# 3Dfans特效大师

这是一个统一技能，内置 39 个效果模块、122 套预设。模块是本技能的资源，不需逐个安装；入口只有这一份 SKILL.md。根据用户的画面和项目要求选型、接入、组合或扩展效果。

## 逼真海水：先选效果，再执行

用户说“需要做逼真的海水”“真实海水”“写实海洋”等时，先读取 [逼真海水选型与接入](references/realistic-water.md)，提供 [五种水效预览页](assets/modules/3d-ultra-water/preview.html)，并展示深海涌浪、岸边碎浪、清澈浅海、夕阳海面、水下视角五种选择，各用一句话解释观感。预览是选型参考，不代表用户已选定。需要轻量静水或反射池时，同时提供已有 ocean 模块。

用可用的提问工具收集选择，或在回复中列出选项；**等待用户明确选择后才生成、导出或修改项目**。等待期间只做项目与设备的只读检查，不以超时或推荐项代替用户选择。用户已明确指定水效或先前已选定时，直接沿用该选择，无需重复询问。本次规则只针对逼真海水需求，不给其它特效添加确认步骤。

收到预览页生成的 `3d-vfx-water-selection` 参数包或完整指令，即视为用户已选定；沿用其中的 look、params 和 camera，不再询问水效类型，不重置为默认预设。将参数包保存后用 `python scripts/import_water_selection.py --selection-file <选择文件> --out <新目录>` 导出；详见上述选型参考。用户未改动的参数也要保留，视角由导出元数据恢复。

## 从需求到模块

先从当前项目判断主体、效果角色、交互方式与目标设备，保留用户选定的技术栈和视觉方向。有现成项目时优先融入其相机、光照、场景与构建方式；独立演示可直接复用内置 Demo。

按需查阅 [效果目录](references/effect-catalog.md)，或运行相对本技能根目录的命令：

```bash
python scripts/toolkit.py search "烟雾和火花"
python scripts/toolkit.py search "玻璃"
python scripts/toolkit.py show 3d-cube-waterflow
python scripts/toolkit.py search "夕阳户外"
python scripts/toolkit.py search "下雨"
```

只读取选中模块的 module-guide.md、references/params.md 和相关效果代码。完整参数、预设及资源路径见 [机器可读目录](references/effect-catalog.json)。不要一次加载全部模块说明。

| 画面需求 | 优先查找 |
| --- | --- |
| 物体燃烧后、烧焦、焦黑、灰烬、余烬、焚毁溶解、烧毁消散 | burn-dissolve；优先读取 [烧焦溶解模块](assets/modules/3d-burn-dissolve/module-guide.md)，需要可见火苗时组合 realistic-fire |
| 真实火焰、篝火、火炬、燃烧 | realistic-fire；优先读取 [真实火焰模块](assets/modules/3d-realistic-fire/module-guide.md) |
| GPU 体积火焰、体积烟雾、流体火焰、WebGPU 火焰、等离子、卡通火焰、营火浓烟 | webgpu-volume-fire；读取 [GPU 体积火焰模块](assets/modules/3d-webgpu-volume-fire/module-guide.md)，默认应用 classic 预设。无 WebGPU 时降级 realistic-fire |
| 逼真海水、写实海洋、碎浪、浅海、海底焦散、水下 | ultra-water；先执行上述选型流程，再读取 [模块说明](assets/modules/3d-ultra-water/module-guide.md) |
| 夕阳、日落、黄昏、逆光、金色时刻、户外环境、天空盒、太阳光晕、日晕、镜头光晕 | 3d-skybox-sunset；读取 [夕阳天空盒模块](assets/modules/3d-skybox-sunset/module-guide.md)，默认应用 sunset-outdoor 预设 |
| 下雨、雨天、降雨、雨丝、雨点大小可调、地面水花、斜雨、暴雨、细雨、逆光雨 | 3d-rain-streaks；读取 [雨丝与水花模块](assets/modules/3d-rain-streaks/module-guide.md)，默认应用 night-rain 预设 |
| 烟雾、火花、飘雪、星系、其它粒子天气 | particles；smoke、sparks、snow、galaxy |
| 立方体、清透水流、管口出水、飞溅涟漪 | cube-waterflow（场景几何，可共用深度） |
| 水面、排水喷水 | ocean、drain-spout |
| 玻璃、虹彩、布、金属、纸、木纹 | materials；cloth、metal、paper、wood |
| 液态金属、水银流动、液态汞、金属液体 | liquid-metal；读取 [液态金属模块](assets/modules/3d-liquid-metal/module-guide.md) |
| 极光、全息、光束、能量 | aurora、hologram、light-shafts、plasma、lightning |
| 管流、飞线、生长、导览、滚动 | pipe-flow、data-trails、architecture、tour、scroll |
| 剖切、扫描、辉光、景深、电影质感 | slice、wireframe、bloom、depth-of-field、cinema |

## 夕阳户外环境：应用天空盒特效

在制作或修改 3D/网页视觉效果时，用户提到“夕阳”“日落”“黄昏”“逆光”“金色时刻”“户外环境”“天空盒”“太阳光晕”“日晕”“镜头光晕”，或需要为户外场景补一套暖色低角度日光环境时，**应用 `3d-skybox-sunset` 天空盒特效**，读取 [模块说明](assets/modules/3d-skybox-sunset/module-guide.md) 与 [参数表](assets/modules/3d-skybox-sunset/references/params.md)。默认用 `sunset-outdoor` 预设（提取页原始数值），需要更强日晕用 `coastal-dusk`、主体优先用 `thin-cloud`、产品/建筑展示用 `golden-hour`。

该模块同时提供程序化天空盒、太阳圆盘与 Mie 日晕、镜头光晕、HDR bloom/星芒、AgX 调色、平行光、PMREM 环境与暖雾；接入时用 `createSkyGlowEffect()` 或统一契约适配器，由 `render(scene, camera)` 输出最终画面。用户只要一个静态天空背景、且项目已有自己的后期链时，按模块说明改用纯天空网格模式，不要抢占渲染所有权。普通文本里出现“夕阳”“黄昏”等词不自动生成特效；逼真海水选型流程中的“夕阳海面”水效选项仍先按上述海水规则处理，选定后再决定是否需要本天空盒。

## 下雨天气：应用雨丝与水花特效

在制作或修改 3D/网页视觉效果时，用户提到“下雨”“雨天”“降雨”“雨丝”“雨点大小”“地面水花”“斜雨”“暴雨”“细雨”“逆光雨”，或需要为户外场景补一套可调雨量的降水天气时，**应用 `3d-rain-streaks` 雨丝与水花特效**，读取 [模块说明](assets/modules/3d-rain-streaks/module-guide.md) 与 [参数表](assets/modules/3d-rain-streaks/references/params.md)。默认用 `night-rain` 预设（用户提供页面的原始数值）；细雨用 `drizzle`、暴雨斜雨用 `downpour`、夕阳/逆光暖雨用 `sunset-rain`。

该模块逐字保留用户提供的四段雨丝/水花着色器，只做参数化与生命周期封装：往宿主 `scene` 挂两个 `InstancedBufferGeometry` 网格，是**场景层**，不接管 `renderer.render`，也不修改背景、雾、相机或色调映射。宿主照常调用自己的 `renderer.render(scene, camera)`；与 3d-skybox-sunset 组合时由天空盒的 `render(scene, camera)` 统一输出，并把两边太阳方位对齐（用 `sunset-rain` 预设）。已有 `3d-rain`（夜景雨幕）用于均匀、无地面水花的老式循环雨幕，两者按需求二选一，不要默认叠加。实例池容量沿用用户原始常量（雨丝 9000 / 水花 1200），schema 与预设不超过该容量。普通文本里出现“下雨”等词不自动生成特效。

## 燃烧后与灰烬路由

在制作或修改 3D/网页视觉效果的语境中，用户提到“物体燃烧后”“烧焦”“灰烬”“余烬”“焚毁溶解”等时，优先使用 `3d-burn-dissolve`，复用其中 `createBurnDissolveEffect()`，不要只替换成普通烟雾或火花。仅描述可见火苗、篝火、火炬时使用 realistic-fire；同时需要火苗与物体烧毁时组合两者。普通文本中出现这些词不自动生成特效。

## 接入与制作

内置资源位于 assets/modules/<模块 slug>/。需要完整可运行 Demo 时，可导出一份到新目录：

```bash
python scripts/toolkit.py export 3d-cube-waterflow --look steady --out /path/to/project/water-demo
python scripts/toolkit.py export 3d-skybox-sunset --look sunset-outdoor --out /path/to/project/sunset-demo
python scripts/toolkit.py export 3d-rain-streaks --look night-rain --out /path/to/project/rain-demo
python scripts/toolkit.py export 3d-webgpu-volume-fire --look classic --out /path/to/project/volfire-demo
```

导出工具保留相对依赖、预设、预览和许可，目标目录必须不存在。它不安装额外 Skill，也不修改项目配置。需要在已有项目内精简接入时，读取 [接入约定](references/integration.md) 后只复制完整依赖闭包，保留模块命名空间。

每个模块 demo 页（`assets/modules/<slug>/demos/index.html`）共用同一套头部，右上角有「复制提示词」按钮：它按当前预设生成一段「只把效果挂进项目场景」的提示词（模块 slug、接入文档路径、参数快照，以及“不带调试层 / 不带多余描述 / 不重写算法”四条硬要求）。自动化读取用 `window.__vfxDemoChrome.buildPrompt()`；样式与文案的唯一真源是 `assets/shared/demo-chrome.js` 与 `demo-chrome.css`，不要逐页另写。

通用契约为 id、title、category、guiSchema、create、update、dispose。部分模块另外拥有 render、相机或滚动驱动；3d-skybox-sunset 另提供 render、setSize、attach、detach、setParams、refreshEnvironment。3d-webgpu-volume-fire 因 WebGPU 异步初始化，create 返回 Promise 或提供 isReady()，由 `render()` 或 `update()` 自动推进模拟与渲染，拥有独立 renderer。用 guiSchema 建默认参数，再应用目录中的 look.params；让表单、预设与实际参数共享一个状态来源。

在目标项目中调整颜色、构图、表面、几何与运动，让效果服务于主体。模块中的底座、雕塑、示例锚点等是演示布景，组合时按项目需要保留或移除。新效果可沿用该生命周期契约和已有工具；不要求每个需求都套用最接近的预设。

## 组合的关键约定

- 独立导入的模块使用独立 params。内部 helper 路径可能同名而实现不同，保持各模块目录，避免平铺覆盖。
- 多数效果是场景层；辉光、景深、电影后期和水面反射有渲染职责。确定一个最终输出所有者，避免重复渲染、重复色调映射或把多条后期链直接相套。
- 3d-skybox-sunset 自带完整 HDR → bloom/星芒 → 曝光 → flare → AgX/FXAA → 屏幕输出链，是最终输出所有者；不要再串接 3d-bloom、3d-cinema-stack、3d-depth-of-field 的后期链，也不要在其 render 之后再次调用 renderer.render。需要它的天空与光照但由宿主后期输出时，按模块说明关闭其最终链。
- 3d-rain-streaks 是纯场景层，只往 scene 挂雨丝/水花两组网格，没有 `render()`；不要为它增加第二次 `renderer.render`。与 3d-skybox-sunset 同场时由天空盒的 `render(scene, camera)` 统一输出；不要与 `3d-rain` 默认叠加两套雨幕。
- 3d-webgpu-volume-fire 是 isolated-viewport，自己拥有 WebGPU renderer 与 RenderPipeline，不要与 `3d-skybox-sunset`、`3d-cinema-stack` 或 `3d-bloom` 的后期链串联，也不要在 `effect.update()` 之后再调用宿主 `renderer.render()`。无 WebGPU 时直接报错或降级到 `3d-realistic-fire`，不要静默渲染黑屏。
- 排水喷水是全帧距离场着色器，不能当作透明三维网格与其他对象共享深度；需要同屏时可采用独立视口、画中画或场景切换。
- Ultra Water 自带 Three.js 0.186.1 和完整输出管线，默认以隔离视口接入，见模块说明；不能直接并入旧模块的 Three.js 0.160.0 场景或共享深度。
- 空间导览与滚动场景会驱动相机，避免 OrbitControls 与它们同时争夺相机；卸载时恢复宿主状态。
- 现有模块大多使用模块级单实例状态。同一效果需多实例时，先改造为实例工厂；重复 import 同一 URL 不会产生独立实例。3d-skybox-sunset 的 `createSkyGlowEffect()` 已是实例工厂，单实例契约由 sky-glow-module.js 适配。

组合示例、渲染所有权和修改点见 [组合指南](references/composition.md)。

## 交互与验收

保留用户的视角与播放选择。参数修改应对应可观察的画面变化；区分时间倍率、拓扑重建和即时 uniform。提供清晰的预设、重置、暂停及必要的触摸操作，尊重 reduced-motion，暂停隐藏或离屏的绘制。

在实际目标浏览器中检查主体、关键近景、重要参数与组合关系。检查重复创建和释放、纹理/几何资源、宿主场景及渲染状态，确认移动布局和真实的降级路径。先用这些观察修正具体问题，再决定是否需要更多检查。原模块已有验证记录，此前十轮验证、新增清透水流的整合验证、可复跑检查和适用范围见 [验证说明](references/validation.md)；夕阳天空盒的独立无头渲染验证见 [模块验证记录](assets/modules/3d-skybox-sunset/references/validation.md)；全包静态核对、模块 JS 语法与运行时复测的实测数据见 [技能包核对报告](references/audit-2026-11-11.md)；雨丝与水花的独立无头渲染验证见 [模块验证记录](assets/modules/3d-rain-streaks/references/validation.md)；GPU 体积火焰的 WebGPU 无头验证见 [模块验证记录](assets/modules/3d-webgpu-volume-fire/references/validation.md)，2026-11-12 全包复测见 [核对报告](references/audit-2026-11-12.md)。它们不替代对新组合的实际验收。

内置效果主要是可调艺术化可视化，不把程序化材质、解析粒子、轨迹、水面或天体外观描述为真实测量、CFD、N 体或完整光学求解。仅报告实测的设备性能。

## 来源与交付

逼真海水为 Ultra Water / Humpalumps 的 MIT 衍生适配，连同版权、第三方声明、本地依赖许可及来源指纹交付，见其模块记录。

33 个独立实现模块沿用其许可；真实火焰保留用户提供项目代码、Photons 与贴图的来源（输入未附独立许可），详见其模块记录；排水喷水保留用户提供的 Spout / @P_Malin 署名，其输入未附着色器许可证声明，不因统一封装而改标原创或 MIT。夕阳天空盒提取自用户提供的「几猫3A大作」提取页，逐字保留 SALTLINE_SKY 与光晕着色器，输入未附独立许可证，来源指纹见其 [ORIGINALITY.md](assets/modules/3d-skybox-sunset/ORIGINALITY.md)；雨丝与水花提取自用户 2026-11-12 提供的「几猫 · 雨效独立演示（可调雨点大小）」单文件代码，逐字保留四段雨丝/水花着色器与实例常量，输入未附独立许可证，指纹见其 [ORIGINALITY.md](assets/modules/3d-rain-streaks/ORIGINALITY.md)；GPU 体积火焰移植自 three.js 官方 MIT 示例 `webgpu_volume_fire`，离线 vendor 来自同一 dev 快照，指纹见其 [ORIGINALITY.md](assets/modules/3d-webgpu-volume-fire/ORIGINALITY.md) 与 [DEPENDENCIES.json](assets/modules/3d-webgpu-volume-fire/DEPENDENCIES.json)；离线 Three.js r160 为 MIT。复用时连同相应许可和来源记录一起交付，详见 [来源与许可](references/sources-and-licenses.md)。

交付可运行页面、所需源码、参数/安装说明及实际验证结果。当前包在本地保存，网站发布不属于本次封装操作。

## 指定导出预设和参数

```bash
python scripts/toolkit.py export 3d-smoke --look ambient --set opacity=0.4 --out /path/to/new/ambient-smoke
```

可重复 --set key=value，或用 --params-file 指向 JSON 对象文件（支持 UTF-8 BOM）。参数依据 guiSchema 检查类型、范围、颜色和枚举；未知字段在写目录前拒绝。选择的预设成为导出 Demo 的初始预设，其他预设保留。安装副本的源模块不受修改。

## 已验证的组合起点

可以直接导出两个组合工程，然后按需求调参或扩展：

```powershell
python scripts/toolkit.py scaffold aurora-rain --out <新目录>
python scripts/toolkit.py scaffold glass-bloom --out <新目录>
```

`aurora-rain` 共享场景、相机和一次最终渲染；`glass-bloom` 由玻璃场景与辉光镜头链统一输出。每个导出都含两个模块的源码、许可、运行页面及组合说明。这是两个经测试的起点；其它模块组合仍需按本文件检查渲染所有权、相机所有权和资源释放。

## 本地完整性自检

```powershell
python scripts/toolkit.py verify
```

安装后或复制到新电脑后先运行自检，按随包 `package-manifest.json` 校验文件是否缺失或改变；导出前也会检查所用模块。校验失败先恢复已审核的技能包，保留现有导出目录。此清单用于发现意外修改，不是发布者数字签名。Python 仅使用标准库，不向外部服务发送内容。
