# 效果模块目录

统一技能：3Dfans特效大师。39 个内部模块，122 套预设，只有根目录 SKILL.md 是技能入口。下面链接均为本技能内部资源。参数和预设按需读取，不必加载全部说明。需要夕阳、日落、黄昏、户外环境时应用 3d-skybox-sunset 天空盒特效，默认 sunset-outdoor 预设；需要下雨、雨丝、雨点大小可调或地面水花时应用 3d-rain-streaks，默认 night-rain 预设；需要 GPU 体积火焰、流体火焰或 WebGPU 真实火焰时应用 3d-webgpu-volume-fire，默认 classic 预设。

| 模块 | 效果 | 分类 | 预设 | 参数 | 渲染职责 | 来源 |
| --- | --- | --- | ---: | ---: | --- | --- |
| 3d-smoke | [工业烟雾](../assets/modules/3d-smoke/module-guide.md) | particles | 3 | 6 | scene-layer | 独立实现 |
| 3d-sparks | [工业火花](../assets/modules/3d-sparks/module-guide.md) | particles | 3 | 6 | scene-layer | 独立实现 |
| 3d-hologram | [全息投影](../assets/modules/3d-hologram/module-guide.md) | shaders | 3 | 6 | scene-layer | 独立实现 |
| 3d-aurora | [极光幕帘](../assets/modules/3d-aurora/module-guide.md) | lighting | 3 | 6 | scene-layer | 独立实现 |
| 3d-plasma | [等离子尾流](../assets/modules/3d-plasma/module-guide.md) | vfx | 3 | 6 | scene-layer | 独立实现 |
| 3d-rain | [夜景雨幕](../assets/modules/3d-rain/module-guide.md) | particles | 3 | 6 | scene-layer | 独立实现 |
| 3d-snow | [飘雪空间](../assets/modules/3d-snow/module-guide.md) | particles | 3 | 6 | scene-layer | 独立实现 |
| 3d-grass | [风动草地](../assets/modules/3d-grass/module-guide.md) | vegetation | 3 | 6 | scene-layer | 独立实现 |
| 3d-bloom | [电影辉光](../assets/modules/3d-bloom/module-guide.md) | postprocessing | 3 | 6 | postprocess | 独立实现 |
| 3d-depth-of-field | [镜头景深](../assets/modules/3d-depth-of-field/module-guide.md) | postprocessing | 3 | 5 | postprocess | 独立实现 |
| 3d-glass | [透射玻璃](../assets/modules/3d-glass/module-guide.md) | materials | 3 | 6 | scene-layer | 独立实现 |
| 3d-iridescent-bubbles | [虹彩气泡](../assets/modules/3d-iridescent-bubbles/module-guide.md) | materials | 3 | 6 | scene-layer | 独立实现 |
| 3d-pipe-flow | [管道流动](../assets/modules/3d-pipe-flow/module-guide.md) | motion | 3 | 6 | scene-layer | 独立实现 |
| 3d-data-trails | [数据飞线](../assets/modules/3d-data-trails/module-guide.md) | motion | 3 | 6 | scene-layer | 独立实现 |
| 3d-slice-reveal | [切面显现](../assets/modules/3d-slice-reveal/module-guide.md) | shaders | 3 | 5 | scene-layer | 独立实现 |
| 3d-ocean | [流动水面](../assets/modules/3d-ocean/module-guide.md) | fluid-gas | 3 | 6 | reflection-surface | 独立实现 |
| 3d-light-shafts | [空间光束](../assets/modules/3d-light-shafts/module-guide.md) | lighting | 3 | 6 | scene-layer | 独立实现 |
| 3d-galaxy | [螺旋星系](../assets/modules/3d-galaxy/module-guide.md) | particles | 3 | 6 | scene-layer | 独立实现 |
| 3d-architecture-growth | [建筑逐件生长](../assets/modules/3d-architecture-growth/module-guide.md) | motion | 3 | 5 | scene-layer | 独立实现 |
| 3d-falling-leaves | [空间落叶](../assets/modules/3d-falling-leaves/module-guide.md) | particles | 3 | 6 | scene-layer | 独立实现 |
| 3d-cloth-material | [真实织物材质](../assets/modules/3d-cloth-material/module-guide.md) | materials | 3 | 6 | scene-layer | 独立实现 |
| 3d-metal-material | [PBR 金属材质](../assets/modules/3d-metal-material/module-guide.md) | materials | 3 | 5 | scene-layer | 独立实现 |
| 3d-paper-material | [纤维纸张材质](../assets/modules/3d-paper-material/module-guide.md) | materials | 3 | 6 | scene-layer | 独立实现 |
| 3d-wood-material | [程序化木纹材质](../assets/modules/3d-wood-material/module-guide.md) | materials | 3 | 6 | scene-layer | 独立实现 |
| 3d-virtual-tour | [三维空间导览](../assets/modules/3d-virtual-tour/module-guide.md) | motion | 3 | 5 | scene-layer | 独立实现 |
| 3d-lightning-energy | [闪电能量组合特效](../assets/modules/3d-lightning-energy/module-guide.md) | vfx | 3 | 6 | scene-layer | 独立实现 |
| 3d-frost-growth | [冰霜生长与破碎](../assets/modules/3d-frost-growth/module-guide.md) | vfx | 3 | 6 | scene-layer | 独立实现 |
| 3d-wireframe-scan | [线框扫描显现](../assets/modules/3d-wireframe-scan/module-guide.md) | shaders | 3 | 6 | scene-layer | 独立实现 |
| 3d-scroll-scenes | [滚动驱动三维场景](../assets/modules/3d-scroll-scenes/module-guide.md) | motion | 3 | 5 | scene-layer | 独立实现 |
| 3d-cinema-stack | [电影后期效果组合](../assets/modules/3d-cinema-stack/module-guide.md) | postprocessing | 3 | 6 | postprocess | 独立实现 |
| 3d-drain-spout | [排水管喷水](../assets/modules/3d-drain-spout/module-guide.md) | fluid-gas | 3 | 6 | fullscreen | 用户代码 / @P_Malin |
| 3d-cube-waterflow | [立方体清透流水](../assets/modules/3d-cube-waterflow/module-guide.md) | fluid-gas | 3 | 5 | scene-layer | 独立实现 |
| 3d-liquid-metal | [液态金属](../assets/modules/3d-liquid-metal/module-guide.md) | materials | 3 | 6 | scene-layer | 独立实现 |
| 3d-realistic-fire | [真实火焰](../assets/modules/3d-realistic-fire/module-guide.md) | particles | 2 | 3 | scene-layer | 用户提供项目 |
| 3d-ultra-water | [逼真海水](../assets/modules/3d-ultra-water/module-guide.md) | fluid-gas | 5 | 28 | isolated-viewport | Ultra Water / Humpalumps · MIT |
| 3d-burn-dissolve | [烧焦溶解与灰烬](../assets/modules/3d-burn-dissolve/module-guide.md) | vfx | 3 | 6 | scene-layer | 用户海晏堂项目 |
| 3d-skybox-sunset | [夕阳天空盒与太阳光晕](../assets/modules/3d-skybox-sunset/module-guide.md) | environment | 4 | 16 | postprocess | 用户提供提取页 |
| 3d-rain-streaks | [雨丝与水花](../assets/modules/3d-rain-streaks/module-guide.md) | particles | 4 | 11 | scene-layer | 用户提供代码 |
| 3d-webgpu-volume-fire | [GPU 体积火焰](../assets/modules/3d-webgpu-volume-fire/module-guide.md) | particles | 5 | 28 | isolated-viewport | three.js 官方示例 MIT |

分类 family 用于统一目录，category 保留原模块实现标签。机器目录另含 cameraOwner、schema、looks、完整资源路径及检索词。
