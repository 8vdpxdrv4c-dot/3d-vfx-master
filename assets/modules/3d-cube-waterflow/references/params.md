# 参数与宿主接入

| 参数 | 范围 / 默认 | 作用 |
| --- | --- | --- |
| flow | 0–1.5 / 1 | 水束粗细、发射密度；0 立即停水并停止新波包，已有涟漪衰减 |
| pressure | 0.55–1.65 / 1 | 相对喷射力度与落点，不是压力单位 |
| level | 0.55–0.9 / 0.74 | 立方储水体的独立显示水位 |
| waves | 0.1–1.5 / 0.65 | 水面扰动与落点波纹 |
| color | #RRGGBB / #68ccdc | 水体吸收色与高光基色 |

精确的三套预设见 [meta.js](../demos/meta.js)，页面直接使用其中初始 look。不要分别维护表单和渲染参数。

```js
import * as water from './demos/effects/cube-water-stream.js';
const params = Object.fromEntries(water.guiSchema.map(s => [s.key, s.default]));
water.create(ctx, params); // ctx.scene，ctx.lowEnd；宿主提供渲染和环境光
water.update(dt, params, ctx); // dt 单位为秒；暂停时参数变化用 0 更新
// 宿主 animation loop 统一 renderer.render(scene, camera)
water.dispose(); // 离开页面 / 更换效果时释放自有几何、材质和纹理
```

模块不写宿主相机、不接管 render。`stats()` 提供水滴槽位、活跃水滴和涟漪事件供检查，`anchors()` 提供立方体、管口、水束标注位置。页面演示灯光和环境见 [setup.js](../demos/lib/setup.js) 与 [main.js](../demos/main.js)。避免在透射水体前叠加强 bloom，水体 metalness 与 emissive 为 0。
