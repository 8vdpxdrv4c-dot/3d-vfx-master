# 实测验证记录 · 3d-rain-streaks

日期：2026-11-12。环境：本机 Chromium headless（SwiftShader 软件渲染，无 GPU 假设），视口 960×600，静态 HTTP 服务（ES module + importmap 需要 http 而非 `file://`）。命令：

```bash
cd assets/modules/3d-rain-streaks/references
node verify.mjs                 # 只验证，截图写系统临时目录
node verify.mjs --update-preview  # 同时刷新模块根 preview.png
```

## 结果

20 项检查全部通过（`pass: true`），四类错误均为 0：`pageErrors=[]`、`consoleErrors=[]`、`failedRequests=[]`、`shaderErrors=[]`。预览图为 Demo 的真实渲染截图，113,101 字节，SHA-256 `f1ce893c4cc502b740d8f011b31702f8b57377afa3277e6d4ca686ad56866b63`。

| 类别 | 检查 | 实测 |
| --- | --- | --- |
| 启动 | 页面加载并渲染 ≥3 帧、画面非全黑、存在雨丝/水花高亮像素 | 4 帧；mean 17.84、max 253、lit 0.093 |
| uniform | 雨量/尺寸/风速同步、uPix 为正、实例数正确、网格挂在宿主 scene | `uRain=0.6`、`uSize=1`、`uVel=[-2.6,-9.4,1.1]`、`uPix=0.0019245`、9000/1200 |
| 细雨 | 参数进 uniform 且与基准帧有像素差分 | `uRain=0.28`、`uSize=0.62`、5000/450、changed 0.0053 |
| 暴雨 | 同上 | `uRain=1`、`uSize=1.55`、`velY=-13.2`、changed 0.1388 |
| 逆光暖雨 | 前向散射仍点亮雨丝 | `sunDir=[-0.419,0.122,-0.9]`、max 255、lit 0.0518、changed 0.1017 |
| 雨量归零 | 雨丝被着色器剔除 | `uRain=0`、splash=0、max 253→202、changed 0.0047 |
| 雨点大小 | 倍率精确生效并改变画面 | `uSize=2.2`、mean 17.84→18.67 |
| 风速/实例数 | 直接映射 | `uVel=[-6.07,-9.4,2.57]`、4200/300 |
| resize | 尺寸同步且画面有效 | 800×520，mean 17.62 |
| 预览 | 截图生成 | 隐藏 HUD/控制面板后取帧 |

## 判据说明

雨丝是稀疏细线，全画面均值与亮像素比例会被演示布景主导。因此预设切换、雨量归零等检查采用**确定性状态断言**（uniform 与 `instanceCount` 的精确值）配合**与冻结基准帧的逐像素差分**（亮度差 >12 的像素占比）；基线像素留在页面内，不参与序列化。所有对比都在 `freeze(12.34)` 固定时间相位下进行，画面唯一变量是雨效参数。

## 本轮发现并修复的问题

1. `settle()` 原先只把 `rainCurrent` 设为旧的 `rainTarget`，外部直接改 `params` 后、宿主尚未执行 `update()` 时读数滞后一帧以上；改为 `settle(values?)`，可传入最新参数对象一次收敛。修复后 `uSize` 精确为 2.2、雨量归零即时生效。
2. `sunset-rain` 预设原先把太阳方位角设为 68°（相机背后），`wPhase()` 前向散射消失，画面 `litRatio=0`、`max=74`，几乎全黑；改回 205°（贴近原页 211°）后 max 255、lit 0.0518，雨丝重新被点亮。
3. guiSchema 与预设曾给出 14000 雨丝 / 2400 水花，超出用户原始常量 `RAIN_COUNT=9000` / `SPLASH_COUNT=1200`，实际会被截断；把上限与预设收敛到容量内，并在 params.md、module-guide.md、ORIGINALITY.md 说明。
4. Demo 缺 favicon 导致一条 console 404；补 `<link rel="icon" href="data:,">` 后 console 错误清零。

以上改动只在封装层（状态同步、预设数值、schema、Demo 编排），**四段着色器与两组几何未改动**；指纹见 [source.json](../source.json)。

## 复跑保护

`verify.mjs` 默认把截图写入系统临时目录，不覆盖交付 `preview.png`；只有显式 `--update-preview` 或 `UPDATE_PREVIEW=1` 才刷新交付图，之后必须重建 `references/package-manifest.json`，否则技能包 SHA-256 自检会失败。本次交付预览由一次 `--update-preview` 生成，之后所有复跑均未改动它。
