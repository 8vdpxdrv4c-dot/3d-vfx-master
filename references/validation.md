# 当前验证记录

新增清透水流的整合检查见 [整合验证](testing/waterflow-integration/validation.md)：覆盖安装后的检索、带参数导出、三套预设、透明水体、飞溅 / 涟漪、生命周期和移动布局。旧 34 个模块的运行文件与此前交付版本保持一致。

此前 34 个模块、103 套预设的十轮验证及全量回归保留为历史记录，见 [十轮报告](testing/validation-report.md) 和 [当时的发布摘要](evidence/ten-round-release-summary.json)。新增模块没有冒充重新跑完那十轮。

当前结构校验见 [packaging-validation.json](packaging-validation.json)，来源审计见 [source-audit.json](source-audit.json)，交付文件指纹见 [package-manifest.json](package-manifest.json)。


真实火焰（2026-10-29）：新增用户指定 threeEditor Fire / Fire2、Photons 与三张贴图，来源与权属记录见 [模块记录](../assets/modules/3d-realistic-fire/ORIGINALITY.md)。本次新模块的验证不沿用旧模块记录。

真实火焰实测：本机 Chromium headless / SwiftShader，1100×760。小火、大火均渲染无 JS / WebGL 错误；三火点共九层粒子；中间实例移除、dt 驱动渐隐、重复 dispose 通过；移除后场景对象数 3→3，几何数 2→2，纹理数 0→0。仅验证该环境，不推断真实设备帧率。详细结果见 assets/modules/3d-realistic-fire/qa/validation.json。

烧焦溶解与灰烬（2026-10-31）：工厂已在本机 Chromium headless / SwiftShader、1280×800 验证标准/物理材质、InstancedMesh、原石材/扫描线组合、多实例隔离、重置和资源释放，并检查完整/燃烧中/全消失三个画面。技能整合的离线预设与导出验证见 [模块 QA](../assets/modules/3d-burn-dissolve/qa/validation.json)。不推断其他设备帧率。

雨丝与水花（2026-11-12）：本机 Chromium headless / SwiftShader、960×600，20 项检查全部通过，页面异常、控制台错误、资源失败与 shader/WebGL 错误均为 0。覆盖四套预设的参数生效与逐像素差分、雨量归零剔除、雨点大小倍率、风速/实例数、resize 与预览截图。实测记录见 [模块验证记录](../assets/modules/3d-rain-streaks/references/validation.md)，全包静态与集成复测见 [核对报告](audit-2026-11-12.md)。不推断其它设备帧率。

GPU 体积火焰（2026-11-12）：本机 Chrome 157 无头 / NVIDIA WebGPU 适配器、960×600，8 项检查全部通过，页面异常、控制台错误与资源失败均为 0。覆盖 WebGPU 初始化、可见火焰、模拟推进、simSpeed=0 冻结、emitTemperature=0 热区下降、预设切换、参数热更新与「复制提示词」内容。实测记录见 [模块验证记录](../assets/modules/3d-webgpu-volume-fire/references/validation.md)。不推断其它设备帧率或无 WebGPU 环境。
