# 夕阳天空盒：无头渲染验证记录

结论：**16 项检查全部通过**。模块在离线 Three.js r160 上完整编译并渲染，天空盒、太阳圆盘、Mie 日晕、镜头光晕、HDR bloom/星芒、AgX 调色、平行光、PMREM 环境与暖雾均生效；无 shader 编译错误、运行时异常或资源加载失败。

Demo 默认构图与提取源一致，是**纯天空（无地面与前景几何）**；「遮挡示例」按钮才显示地面、剪影与遮挡块。带前景布景的早期版本同样通过 16 项，本文数值以最终的纯天空版本为准。

## 与原页的视觉对照

用无头 Chrome 联网打开用户提供的 `extracted-sky-glow-standalone.html`（unpkg Three.js r180）截图，与本模块预览并排比对：

- 云层的大块形态、顶部冷蓝与右上暖橙云边、中央云隙开口、太阳圆盘位置、从太阳发散的云隙光、地平线暖橙渐变与下方灰蓝过渡**几乎逐像素一致**，说明逐字保留的着色器与 r160 适配没有丢失视觉特征。
- 可观察到的差异仅来自调试 UI 浮层（原页的启动日志与说明文字，模块预览已隐藏）和 r180 → r160 + `useLegacyLights=false` 带来的轻微曝光差别。
- 原页明确写「默认纯天空（无港区几何）」，因此模块不再把演示地面与剪影放进默认画面；这也让暖色像素占比从带布景时的 0.277 提升到 0.413。
- 对照用的原页截图为本地临时文件，不随技能包分发（原页是用户提供的输入，不复制进包）。

## 环境与复跑

- Windows 11，Chrome（headless） + ANGLE SwiftShader 软件 WebGL2；`playwright-core` 驱动。
- 视口 960×600，内置静态 HTTP 服务（ES module + importmap 需要 http，不能用 `file://`）；resize 测试改为 800×520。
- 模块自带离线 Three.js 0.160.0 / OrbitControls，未访问任何 CDN。
- 复跑（结果打印为 JSON；**默认只把截图写到系统临时目录，不改动交付物**）：

```powershell
node assets/modules/3d-skybox-sunset/references/verify.mjs
# 其它机器：设置 PLAYWRIGHT_CORE=<playwright-core 路径>、CHROME_PATH=<浏览器路径> 后执行
# 确需刷新模块根 preview.png 时：加 --update-preview（或 UPDATE_PREVIEW=1），之后重建 package-manifest.json
```

`preview.png` 受技能根目录 `references/package-manifest.json` 的 SHA-256 约束。早期脚本每次复跑都覆写它，会让 `toolkit.py verify` 报 sha256 mismatch；2026-11-11 起默认写临时文件，只有显式开关才更新交付预览。

脚本在渲染循环内 hook `effect.render`，紧接着用 `gl.readPixels` 读默认帧缓冲，因此不要求 `preserveDrawingBuffer`。统计步长为每 3 像素采样一次；亮度为 `0.2126R + 0.7152G + 0.0722B`，暖色像素定义为 `R>G+8 && G>B+4 && R>110`，高亮为亮度 > 200。

## 检查项

| # | 检查 | 结果 |
| --- | --- | --- |
| 1 | 页面加载并渲染 ≥ 3 帧 | 通过 |
| 2 | 画面非全黑（mean 109.58，blackRatio 0） | 通过 |
| 3 | 存在太阳/日晕高亮像素（max 254，brightRatio 0.0460） | 通过 |
| 4 | 画面呈暖色调（warmRatio 0.4134） | 通过 |
| 5 | 中心太阳区域比全图更亮（186.95 vs 109.58） | 通过 |
| 6 | `sunset-outdoor` → `coastal-dusk` 画面变化 | 通过 |
| 7 | `coastal-dusk` → `thin-cloud` 画面变化 | 通过 |
| 8 | 关闭日晕/太阳盘/flare/bloom 后高亮下降 | 通过 |
| 9 | 前景遮挡（同时显示布景）使太阳区域亮度/高亮下降 | 通过 |
| 10 | resize 后 RT 尺寸同步且画面有效 | 通过 |
| 11 | 无运行时异常（`window.__skyErrors` 为空） | 通过 |
| 12 | PMREM 环境 / 雾 / 天空网格已挂载 | 通过 |
| 13 | 无页面级 JS 异常 | 通过 |
| 14 | 无资源加载失败 | 通过 |
| 15 | 无 shader 编译 / WebGL 错误 | 通过 |
| 16 | 预览图生成（真实截图 > 20 KB；默认写临时目录） | 通过 |

## 像素统计

| 场景 | mean | max | brightRatio | warmRatio | centerMean | centerMax |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| sunset-outdoor（默认，纯天空） | 109.58 | 254 | 0.0460 | 0.4134 | 186.95 | 254 |
| coastal-dusk | 96.46 | 254 | 0.0394 | 0.3796 | 182.72 | 254 |
| thin-cloud | 106.19 | 254 | 0.0464 | 0.3089 | 147.07 | 219 |
| 关闭日晕/太阳盘/flare/bloom | 104.87 | 229 | 0.0344 | 0.3798 | 168.13 | 229 |
| 前景遮挡太阳（含布景） | 83.88 | 226 | 0.0158 | 0.2499 | 137.46 | 226 |
| resize 800×520 | 110.25 | 254 | 0.0470 | 0.4213 | 187.36 | 254 |

关键观察：太阳方向的 `centerMean` 明显高于全图，说明日晕与镜头光晕落在太阳附近；关闭光晕参数后 `centerMax` 从 254 降到 229、`brightRatio` 从 0.0460 降到 0.0344，说明四个 uniform 真正接到了 shader；开启遮挡后 `brightRatio` 降到 0.0158、`centerMean` 降到 137.46，说明用模块自建 HDR target 的 `DepthTexture` 替代原页深度通道后，太阳可见度与 flare 衰减仍然成立。运行约 100 帧后未发现资源或状态泄漏报错。

## 集成验收

除模块自身外，还用无头浏览器验证了两处集成（10 项检查）：

- 技能首页 `index.html` 加载出 40 张卡片，`3d-skybox-sunset` 卡片的 `environment` 分类、`user-supplied` 来源、`POSTPROCESS` 角色与 4 预设 / 16 参数标记正确；滚动触发懒加载后预览图 `naturalWidth=960` 正常显示；搜索「夕阳」只命中该模块，`environment` 分类筛选命中 1 张，`user-supplied` 筛选命中 5 张。
- 用 `toolkit.py export --look sunset-outdoor --set flare=0.22` 导出的独立副本可脱离技能包运行：`__skyReady` 为真、初始预设为 `sunset-outdoor`、PMREM 环境与天空网格挂载成功、无 console / 页面错误，说明 vendor 依赖闭包完整。
- 验收中发现首页有一处既有的 404：`3d-liquid-metal` 目录声明的 `assets/preview.webp` 实际缺失（上一轮添加该模块时的遗漏）。已按其 `assets/README.md` 的约定，用真实浏览器截取该模块 3D 视口并 4:3 居中裁剪生成 WebP（去掉叠在画面上下的工具栏与 HUD），首页 40 张卡片现在都有有效预览。

## 接入注意

- Demo 每帧以 `window.__skyDemo.params` 为唯一状态源并调用 `effect.update(dt, params)`。外部若直接调用 `effect.setParams({...})`，下一帧会被该状态源覆盖；自动化改参数应修改 `params` 对象或调用 `preset(id)`。这与技能「表单、预设与实际参数共享一个状态来源」的约定一致。
- `preview.png` 是无头 Chrome + SwiftShader 的真实渲染截图（隐藏调试面板后截取），不是设计稿或合成图。软件渲染与 GPU 设备可能有轻微差异。
- 本次验证只覆盖本模块的独立 Demo。与 3d-bloom / 3d-cinema-stack / 3d-depth-of-field 等后期链的组合未在验证范围内，按 [组合指南](../../../../references/composition.md) 由本模块独占最终输出。
- 验证的是运行正确性与参数可达性，未测量帧率；性能以目标设备的实测为准。

## 2026-11-11 复测

技能包整体核对时再次执行 `verify.mjs`，**16/16 通过**，`pageErrors` / `consoleErrors` / `shaderErrors` / `failedRequests` 全为 0。默认预设 `mean=109.58`、`warmRatio=0.4129`、`centerMean=186.96`、`max=254`，与首轮记录一致（云层动画带来小数级波动）。预设切换、`sunDisk/aureole/flare/bloom` 关闭、前景遮挡衰减、resize 800×520 四项均复现。

复测发现并修复了脚本的一个副作用：早期版本每次运行都把截图写进模块根 `preview.png`，而该文件受 `package-manifest.json` 的 SHA-256 约束，结果**每次测试都会让技能包完整性自检失败**。现在默认截图写系统临时目录，仅 `--update-preview`（或 `UPDATE_PREVIEW=1`）才刷新交付预览；刷新后需重建清单。修复后复跑验证不再改动任何交付文件。
