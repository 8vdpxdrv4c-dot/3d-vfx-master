# 参数与调用

variant: small / large（重建）；scale: 0.1–10，默认 2（等比缩放，重建）；speed: 0–2，默认 1，0 暂停。

```js
import * as fire from './demos/effects/realistic-fire.js';
const params=Object.fromEntries(fire.guiSchema.map(s=>[s.key,s.default]));
const ctx={scene,camera,renderer};
fire.create(ctx,params);
// 宿主帧循环：
fire.update(dt,params,ctx);
renderer.render(scene,camera); // 或宿主统一 composer.render()
// 卸载：fire.dispose();
```

多实例（独立持有状态）：

```js
import {createFireEffect} from './demos/lib/fire-runtime.js';
const fire=createFireEffect({scene,renderer},{variant:'large'});
const id=fire.addFire(new THREE.Vector3(0,0,0),2,'campfire');
fire.update(dt); // dt 为秒，暂停时不调用或传 0
fire.hideFire(id,2); // 停止发射并在模拟时间两秒内渐隐移除，无 GSAP
fire.removeFire(id); // 立即清理单个实例，重复移除安全
fire.dispose(); // 清理所有实例，可重复调用
```

factory 支持 number 或 Vector3 的 scale（沿用原逻辑只使用 x）。帧推进由宿主负责，过大的 dt 应由宿主分步或限幅，避免切回后台后粒子跳变。
