# 参数与接入

## 多实例工厂（推荐）

```js
import { createSkyGlowEffect, DEFAULT_PARAMS } from './effects/sky-glow.js';

const sky = createSkyGlowEffect({
  renderer,                   // 必填，PMREM 与后期链需要
  scene,                      // 传入即自动 attach；也可稍后 sky.attach(scene)
  params: DEFAULT_PARAMS,     // 或所选 look.params
  captureEnvironment: true    // 生成 PMREM，赋给 scene.environment
});

sky.setSize(renderer.getDrawingBufferSize(new THREE.Vector2()).x,
            renderer.getDrawingBufferSize(new THREE.Vector2()).y);

function frame(dt) {
  sky.update(dt, { sunElevation: 11, flare: 0.2 });  // 只传变化项即可
  sky.render(scene, camera);                          // 替代 renderer.render
}
sky.refreshEnvironment(true);   // 强制重捕环境（切预设后可省略，会自动节流重捕）
sky.detach();                   // 从场景移除并恢复 environment / fog
sky.dispose();                  // 释放 RT、材质、噪声纹理、PMREM
```

`sky.render()` 每次调用会保存并恢复宿主的 `autoClear / toneMapping / toneMappingExposure / outputColorSpace / clearColor / renderTarget`，不留下全局副作用。宿主拥有相机：本模块不创建相机、不接 OrbitControls、不驱动动画循环。

`sky.params` 是当前参数对象（引用），`sky.uniforms` 是天空着色器 uniform，`sky.sun` 是随太阳方位移动的 `DirectionalLight`，`sky.environment` 是 PMREM 纹理。

## 单实例契约适配器

`create(ctx, params)` 的 ctx 需含 `renderer`、`scene`，可选 `size:[w,h]`、`captureEnvironment`。
`update(dt, params, ctx)` 接收增量秒数；`render(scene, camera)` 输出最终画面；`setSize(w,h)`；`dispose()`。
适配器为模块级单实例，重复 `create` 会先释放旧实例；多天空盒请直接使用工厂。

## 参数表

范围/默认值与 `meta.schema`、各 look.params 一致。颜色为 sRGB 十六进制，模块内部按 Three.js 色彩管理转为线性值。

| 参数 | 范围 / 默认 | 行为 |
| --- | --- | --- |
| sunElevation | −2–45° / 13° | 太阳高度角；原页方位 `(0.916,0.225,0.331)` 对应 13° |
| sunAzimuth | 0–360° / 70° | 太阳方位角，0° 指向 +Z，90° 指向 +X |
| sunColor | #ffddad | 太阳颜色；作用于天空日晕、flare 与 DirectionalLight |
| sunIntensity | 0–20 / 9 | 平行光强度；r160 需 `useLegacyLights=false` |
| horizonColor | #fac391 | 朝向太阳的地平线暖色 `uHor` |
| zenithColor | #425165 | 天顶冷色 `uZen`（原页晴空渐变另有固定混合） |
| awayColor | #708295 | 背光方向地平线色 `uHorAway`，也用于暖雾基色 |
| cloudCover | 0–1.6 / 1 | 云层覆盖率倍率；0 为纯晴空 |
| cloudSpeed | 0–3 / 1 | 云层漂移速度，内部以累积时间实现，改变时不跳变 |
| aureole | 0–3 / 1 | 太阳周围 Mie 日晕强度 |
| sunDisk | 0–2 / 1 | 太阳圆盘亮度倍率 |
| flare | 0–0.5 / 0.16 | 屏幕空间镜头光晕强度，受太阳可见度调制 |
| bloom | 0–0.3 / 0.065 | 辉光混合量；设 0 会跳过 bloom 与星芒通道 |
| exposure | 0.4–2 / 1 | 手动曝光，与自适应曝光相乘 |
| agxMix | 0–1 / 0.25 | 0 为 ACES，1 为 AgX（高光滚降更柔和） |
| fogDensity | 0–0.02 / 0.0035 | `FogExp2` 浓度，0 关闭雾感 |

固定后期常量 `POST_TUNE`（bloomMix .62、dirt .1、streak .03、key .12、adaptTau 1.5、ca .0013、vignette .3、grain .02、sharpen .3、lookPower 1.18、lookSat 1.22）保持原页数值，不在 guiSchema 暴露；需要修改可在 `sky-glow.js` 中调整 `POST_TUNE`。

## 预设

| id | 标题 | 特征 |
| --- | --- | --- |
| sunset-outdoor | 夕阳户外（默认） | 完全等同原页方位与 TUNE，作为夕阳户外环境的默认落地 |
| golden-hour | 金色时刻 | 太阳抬高至 24°、少云、暖金、光晕更轻 |
| coastal-dusk | 落日海岸 | 4.5° 低太阳、厚云、日晕/flare/bloom 最强、暖雾更浓 |
| thin-cloud | 薄云黄昏 | 云量 0.35、冷天顶、克制光晕，突出主体 |

## 唯一状态源

`update(dt, params)` 会把传入的参数合并进当前状态。若宿主每帧都传同一个完整 `params` 对象，就该对象作为唯一状态源：改参数时修改它（或调用预设切换），不要只调用一次 `setParams()`——后者会被下一帧的完整 `params` 覆盖。这与技能「表单、预设与实际参数共享一个状态来源」的约定一致。若每帧只传变化项，则 `setParams()` 可以正常使用。

## 验证与预览

无头渲染复跑脚本为 [references/verify.mjs](verify.mjs)，检查项与实测数值见 [validation.md](validation.md)：

```powershell
node assets/modules/3d-skybox-sunset/references/verify.mjs
```

需要 `playwright-core` 与本机 Chrome/Chromium，可用 `PLAYWRIGHT_CORE`、`CHROME_PATH` 指定路径。`preview.png` 是该脚本在 SwiftShader 上真实渲染并隐藏调试面板后的截图。默认复跑只把截图写系统临时目录、不覆盖交付物；加 `--update-preview` 才刷新 `preview.png`，此时需同步重建清单。

## 依赖与许可

复制 `demos/effects/sky-glow.js`、`demos/effects/sky-glow-module.js`、`demos/meta.js` 与 `demos/vendor/`（Three.js r160 + OrbitControls + MIT 许可）。离线运行，不使用 CDN。视觉实现归属用户提供原页，详见 [ORIGINALITY.md](../ORIGINALITY.md)。
