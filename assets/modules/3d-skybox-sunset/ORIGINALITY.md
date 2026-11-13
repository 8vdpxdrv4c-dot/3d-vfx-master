# 来源

2026-11-11 从用户提供的 `C:\Users\yaoja\Desktop\extracted-sky-glow-standalone.html`（65,727 字节，SHA-256 `c4992ebc1ad0af4fca76fc06c3312b5dbf5e96e61ea36dffb968f8094163eff1`）提取。该文件本身是用户从「几猫3A大作」HTML 中拆出的单文件聊天舞台版，页面注释写明：着色器文本、TUNE 数值、bloom 核与阈值、flare、曝光、AgX/ACES 混合、调色板均逐字复制自原游戏 HTML（bundled IIFE，Three.js r180），视觉实现归属原「几猫3A大作」。

本模块保留的内容：`SALTLINE_SKY` 片元/顶点（Ug / Ng / H6 / V6）、噪声纹理生成、天空材质与天空盒网格、PMREM 环境捕获、太阳方向与调色板常量、后期链的 J6 / K6 / Q6 / eA / tA / nA / iA 着色器，以及原页 `g`（POST_TUNE）与 `Mn` / `en` 数值。着色器文本由脚本按原页常量声明逐字提取，未重写公式。

有意不纳入：`Y6` AO、`$6` 体积光轴、`X6`/`q6` 深度降采样、`Z6` 合成、`j6` 运动模糊。它们依赖港区几何、阴影贴图与 reversed-Z 比较，原页注释亦说明纯天空不可复现。太阳遮挡改用模块自建 HDR 目标的 `DepthTexture` 供 `eA` 的 12 抽样读取，行为等价。

相对原页的四处适配：H6 增加四个倍率 uniform（uAureole / uCloudCover / uCloudSpeed / uSunDisk）；太阳方位、调色板、光强、雾、曝光收敛为实时参数；生命周期改为宿主提供 renderer/scene/camera 的 create/update/render/setSize/dispose；运行期 Three.js 使用技能内置的 r160 离线副本（原页用 unpkg r180）。

新增内容仅限：统一生命周期适配器 `sky-glow-module.js`、`meta.js` 与预设、独立演示页面、参数与接入文档、来源记录。演示布景（地面与剪影盒）为验证光照与遮挡而写，不属于提取内容。

预览图 `preview.png` 为本模块在本机无头 Chromium 的实际渲染截图，非生成图片。输入文件未附独立许可证，不因统一封装而改标原创或 MIT。Three.js r160 与 OrbitControls 为 MIT，完整条款见 `demos/vendor/THREE-MIT.txt`。
