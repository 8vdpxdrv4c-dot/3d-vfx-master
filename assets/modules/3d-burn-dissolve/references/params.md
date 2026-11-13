# 参数与接入

## 多实例工厂（推荐）

```js
import { createBurnDissolveEffect } from './effects/burn-dissolve.js';
const burn = createBurnDissolveEffect({origin: new THREE.Vector3(), scale: 1});
mesh.material = burn.patchMaterial(mesh.material);
// 可选：sampleWorldSurface() 由宿主提供，返回世界坐标 Vector3。
const ash = burn.createAsh(4000, {samplePosition: () => sampleWorldSurface()});
scene.add(ash);
// 已有渲染循环内调用，time 是绝对秒数。
burn.update(time, {progress: 0.5, ashIntensity: 1, pixelRatio: renderer.getPixelRatio()});
burn.reset();
// 卸载时调用：恢复材质 hook、移除并释放灰烬；不释放宿主模型和材质。
burn.dispose();
```

复制 effects/burn-dissolve.js 与 effects/noise.js；使用宿主 r160 Three.js。不同效果实例使用独立材质，材质数组逐项 patchMaterial；同一实例重复 patch 无额外注入。无灰烬时省略 createAsh。默认粒子在 22 单位立方体随机采样，实际接入应提供表面采样器。

origin 是模型底部世界坐标；scale=模型高度/22。材质和粒子共享这个阈值场。进度、余烬色与时间保存在 effect.uniforms，各实例互相独立。

| 参数 | 范围/默认 | 行为 |
| --- | --- | --- |
| progress | 0–1.1 / 0.5 | 0 完整，1.1 全消失；可反向拖动 |
| ashIntensity | 0–2 / 1 | 灰烬亮度，0 隐去粒子 |
| edgeWidth | .002–.12 / .022 | 发光余烬边宽，uniforms.hyBurnEdgeWidth |
| charWidth | .02–.5 / .22 | 焦黑过渡范围，uniforms.hyBurnCharWidth |
| charStrength | 0–1 / .85 | 焦黑程度，uniforms.hyBurnCharStrength |
| color | #RRGGBB | 适配器与演示会乘 4 作为 HDR；工厂直接接收 THREE.Color，uniforms.uEdgeCol |

## 单实例契约适配器

`create(ctx, params)` 接收 ctx.scene、ctx.target（Mesh/Group）、可选 origin/scale/samplePosition/particleCount/pixelRatio；target 应使用独立标准/物理材质。提供 samplePosition 才创建灰烬。
`update(dt, params, ctx)` 接收增量秒数，参数来自 guiSchema 与所选 look；与工厂 update 的绝对时间含义不同。
`dispose()` 恢复材质并释放灰烬，可重复调用。多对象独立时间线用工厂，不重复调用单例适配器来保留多个效果。
