# 组合与扩展

## 雨幕 + 极光：共享场景的两层

分别导出 3d-rain、3d-aurora，保留两个资源命名空间。使用同一套 Three.js 导入、scene、renderer 和宿主相机，给每个模块独立 params。

```js
rain.create(ctx, rainParams);
aurora.create(ctx, auroraParams);
function frame(dt) {
  rain.update(dt, rainParams, ctx);
  aurora.update(dt, auroraParams, ctx);
  renderer.render(scene, camera);
}
function unmount() {
  rain.dispose();
  aurora.dispose();
}
```

两个入口都包含展示用构图。制作目标场景时检查并移除不需要的底座或示例主体，统一世界尺度、天空位置和粒子范围；不要把两套完整演示布景直接重叠后当作成品。先验证清楚的水体/地面/天空关系，再调整透明排序、对比度和运动。

## 玻璃产品 + 辉光：一个输出所有者

玻璃入口可提供材料和几何参考。辉光入口同时包含演示物体与镜头链；仅需后期时，提取 3d-bloom 的 demos/lib/lens-pass.js：

```js
import {makeLensPass} from './modules/bloom/demos/lib/lens-pass.js';
const lens = makeLensPass(ctx, 'glow');
function frame(dt) {
  glass.update(dt, glassParams, ctx);
  lens.configure({
    quality: ctx.lowEnd ? 'low' : 'high',
    strength: 0.5, radius: 1, threshold: 1.1, exposure: 1
  });
  lens.render(ctx);
}
function unmount() {
  lens.dispose();
  glass.dispose();
}
```

这一示例由 lens 输出全帧，避免再执行一次宿主场景绘制。玻璃与透射的可见性依赖环境、背景与厚度，检查清晰轮廓和背景透射，不能只增加曝光来替代材质调优。

## 空间导览 + 场景材质

由导览控制相机，把木纹、金属或纸材质应用到导览中的目标对象。材料模块常包含展示几何；按目标网格适配 UV、尺度和映射，不重复创建演示主体。进入自由环视时解除导览相机控制；返回时再明确切换所有权。

## 排水喷水 + 其他效果

3d-drain-spout 是全帧光线步进，拥有内部场景、光照和镜头。它不会向宿主深度缓冲写入对应的管道或水束几何。可用于独立演示、分屏、画中画或场景段落切换；需要与实体三维对象发生遮挡或交互时，另行改造成几何/粒子/材质实现，不能仅把该四边形设为透明。

保留 Spout / @P_Malin 归属；本次用户输入没有附着色器许可声明。统一技能的名称和其余模块的许可不改变该来源。

## 夕阳户外环境：3d-skybox-sunset 是最终输出所有者

需要夕阳、日落、黄昏、逆光或金色时刻户外环境时，应用 3d-skybox-sunset，默认 `sunset-outdoor` 预设。它把天空盒、平行光、PMREM 环境与暖雾挂到宿主 scene，并接管最终输出：

```js
import {create, update, render, dispose} from './modules/3d-skybox-sunset/demos/effects/sky-glow-module.js';
create({renderer, scene, captureEnvironment: true}, {...defaults, ...look.params});
function frame(dt) {
  subject.update(dt, subjectParams, ctx); // 场景层效果照常更新
  update(dt, look.params);
  render(scene, camera);                  // 替代 renderer.render，不再叠加其它后期链
}
function unmount() { dispose(); }        // 恢复 scene.environment / fog / 灯光组
```

天空与前景几何写入同一个 HDR target 的深度，因此前景能遮挡太阳并衰减 lens flare，不需要额外阴影贴图。由于 bloom → 星芒 → 曝光 → flare → AgX → FXAA 已包含在内，不要再串联 3d-bloom、3d-cinema-stack 或 3d-depth-of-field 的后期输出，也不要在 render 之后再次调用 renderer.render。若宿主已有必须保留的后期链，改为只取 sky-glow.js 的天空网格与光照部分，由宿主做最终输出。需要多个独立夕阳环境时直接用实例工厂 `createSkyGlowEffect()`，单实例适配器只有一个实例。

## 下雨天气：3d-rain-streaks 是纯场景层

需要下雨、雨丝、可调雨点大小或地面水花时，应用 3d-rain-streaks，默认 `night-rain` 预设。它只往宿主 `scene` 挂两个 `InstancedBufferGeometry` 网格，不提供 `render()`，也不修改背景、雾、相机或色调映射：

```js
import {createRainStreaksEffect} from './modules/3d-rain-streaks/demos/effects/rain-streaks.js';
const rain = createRainStreaksEffect({renderer, camera, scene, params});
function frame(dt) {
  rain.update(dt, params);          // params 是唯一状态源
  renderer.render(scene, camera);   // 宿主照常输出
}
function unmount() { rain.dispose(); }
```

与 3d-skybox-sunset 组合成夕阳雨天时，把上面这行 `renderer.render` 换成天空盒的 `render(scene, camera)`：天空盒仍是唯一最终输出所有者，雨丝与水花网格随同一个 scene 一起被绘制，不需要额外渲染调用，也不要再串联 bloom / cinema / DOF。用 `sunset-rain` 预设，并把两边太阳方位角对齐；该预设保持方位角贴近原页 211°，若把太阳转到相机背后，`wPhase()` 的前向散射会消失、雨丝几乎不再发亮。`3d-rain`（老式循环雨幕）与本模块按需求二选一，不要默认叠加；两组网格的 `renderOrder` 为 890 / 900，与透明粒子同场时检查排序。实例池上限沿用用户原始常量 9000 / 1200，不要通过传更大的 `rainDrops` 强行扩容。

## 新模块与多实例

新效果沿用 create(ctx, params)、update(dt, params, ctx)、dispose() 和 guiSchema；有渲染职责时明确提供 render(ctx)，文档说明控制范围、效果边界和降级项。默认风格可沿用现有 Demo，也可根据项目需要调整。

3d-webgpu-volume-fire 因 WebGPU 异步初始化，提供 `createVolumeFireEffect()`（异步，返回已就绪实例）和模块级单实例适配器 `create()`（返回 Promise）。它自己拥有 WebGPU renderer 与 `RenderPipeline`，属于 isolated-viewport，不要与 3d-skybox-sunset 或 3d-bloom 的后期链串联，也不要在 `effect.update()` 之后再调用宿主 `renderer.render()`。

当前入口多为模块级单实例。同一模块需要两个独立烟柱时，优先将其内部 group、instance、time 等状态封装进实例工厂，每个实例独立创建、更新和释放。复制模块并更改 query 参数 import 并不是通用的实例管理方式。

## GPU 体积火焰：isolated-viewport 与 WebGPU 前提

需要 GPU 体积火焰、体积烟雾、流体火焰或 WebGPU 真实火焰时，应用 3d-webgpu-volume-fire，默认 `classic` 预设。它移植自 three.js 官方示例，使用 WebGPU compute shader 跑三维流体求解（平流 + curlNoise 湍流 + 浮力 + Jacobi 压力投影），再用体积光线步进渲染火焰与烟：

```js
import { createVolumeFireEffect } from './modules/3d-webgpu-volume-fire/demos/effects/volume-fire-module.js';
const fire = await createVolumeFireEffect({ container, size: [w, h] }, look.params);
function frame(dt) { fire.update(dt); }
function unmount() { fire.dispose(); }
```

- **必须 WebGPU + 安全上下文**：https 或 localhost，不能用 `file://` 双击打开。
- 该模块自己创建 WebGPU renderer、compute pipeline 与 RenderPipeline，属于 isolated-viewport；**不要**与 3d-skybox-sunset、3d-bloom、3d-cinema-stack 的后期链串联，也不要在 `fire.update()` 之后再调用宿主 `renderer.render()`。
- 无 WebGPU 时抛出 `WEBGPU_UNAVAILABLE`；宿主应降级到 `3d-realistic-fire`（WebGL 2 粒子火焰），而不是静默黑屏。
- 默认网格 100×100×200（约 200 万体素），低端设备降 `raymarchSteps` / `resolution`。



可以直接导出两个组合工程，然后按需求调参或扩展：

```powershell
python scripts/toolkit.py scaffold aurora-rain --out <新目录>
python scripts/toolkit.py scaffold glass-bloom --out <新目录>
```

`aurora-rain` 共享场景、相机和一次最终渲染；`glass-bloom` 由玻璃场景与辉光镜头链统一输出。每个导出都含两个模块的源码、许可、运行页面及组合说明。这是两个经测试的起点；其它模块组合仍需按本文件检查渲染所有权、相机所有权和资源释放。
