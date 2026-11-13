# 接入提示词

## 中文

把 `3d-rain-streaks`（雨丝与水花）接入当前 Three.js 项目：

1. 复制 `demos/effects/rain-streaks.js`、`demos/effects/rain-streaks-module.js`、`demos/meta.js` 与 `demos/vendor/` 的完整依赖闭包，保留模块目录与命名空间。
2. 默认使用 `night-rain` 预设（用户提供页面的原始数值）；需要细雨 / 暴雨 / 逆光暖雨时改用 `drizzle` / `downpour` / `sunset-rain`。
3. 用 `createRainStreaksEffect({ renderer, camera, scene, params })` 创建效果，主循环调用 `effect.update(dt, params)`，由宿主自己的 `renderer.render(scene, camera)` 或已有后期链输出。本模块是场景层，不接管渲染所有权，不要额外为它调用一次渲染。
4. 正式项目通常不要挂 `createRainStage()` 演示布景；由项目自己的地面、灯光与阴影承接雨丝与水花。水花生成在 `y = 0`，地面不在该高度时平移 `effect.group` 或设 `splashDrops = 0`。
5. 让表单、预设与实际参数共享同一个状态对象；resize 时调用 `setSize()`，卸载时调用 `dispose()`。
6. 保留 [LICENSE.txt](../LICENSE.txt)、[ORIGINALITY.md](../ORIGINALITY.md) 与 [DEPENDENCIES.json](../DEPENDENCIES.json) 随交付一起提供：输入代码未附独立许可证声明，不改标原创或 MIT；Three.js r160 与 OrbitControls 为 MIT。
7. 若同场景还有 `3d-skybox-sunset`，由天空盒的 `render(scene, camera)` 统一输出，太阳方位与 `sunset-rain` 预设对齐；不要再串联 bloom / cinema / DOF 后期链。避免与 `3d-rain` 同时启用两套雨幕。

## English

Integrate `3d-rain-streaks` (rain streaks and ground splashes) into the current Three.js project:

1. Copy the complete dependency closure of `demos/effects/rain-streaks.js`, `demos/effects/rain-streaks-module.js`, `demos/meta.js` and `demos/vendor/`, preserving the module directory and namespace.
2. Use the `night-rain` look by default (the exact values from the user-supplied page); switch to `drizzle`, `downpour` or `sunset-rain` as needed.
3. Create with `createRainStreaksEffect({ renderer, camera, scene, params })`, call `effect.update(dt, params)` in the loop, and let the host's own `renderer.render(scene, camera)` or existing post chain produce the final image. This is a scene layer; it does not own rendering and must not add a second render call.
4. Skip `createRainStage()` in production projects. Splashes are generated on `y = 0`; move `effect.group` or set `splashDrops = 0` when the host ground is elsewhere.
5. Share one state object across GUI, looks and live params; call `setSize()` on resize and `dispose()` on teardown.
6. Ship [LICENSE.txt](../LICENSE.txt), [ORIGINALITY.md](../ORIGINALITY.md) and [DEPENDENCIES.json](../DEPENDENCIES.json): the input code carried no standalone license, so do not relabel it as original work or MIT. Three.js r160 and OrbitControls are MIT.
7. When combined with `3d-skybox-sunset`, let the skybox `render(scene, camera)` be the sole final output, align the sun direction with `sunset-rain`, and do not stack bloom / cinema / DOF chains. Avoid running `3d-rain` and this module at the same time.
