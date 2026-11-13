> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# 3D Ocean

A persistent water sheet carries ripples and a reflected form. Install the shipped new implementation rather than the earlier external effect module. The slug and lifecycle contract are retained for compatibility.

## What this skill does

- Creates 流动水面 with generated geometry or procedural surfaces, without downloaded models, images or shader modules.
- Ships three looks, 6 primary controls, offline dependencies and a standalone preview.
- Exports id, title, category, guiSchema, create, update, dispose, plus optional render and diagnostic stats.

### Good fit

Product films, dark studio presentations and reusable Three.js fluid-gas effects.

### Not for

Analytic waves and planar reflection, not CFD, spectral-ocean simulation or full refraction/caustics.

## Package layout

```text
3d-ocean/
  module-guide.md / LICENSE.txt / ORIGINALITY.md / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/fluid-wave-sheet.js
    lib/{core,dispose,cloud-tools,lens-pass,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Visual direction |
| --- | --- | --- |
| Deep teal / 深青水面 | fluid-wave-sheet.js | A cool reflecting pool. |
| Still pool / 静水 | fluid-wave-sheet.js | Quieter dark-blue water. |
| Copper light / 暖光水面 | fluid-wave-sheet.js | A warmer specular direction. |

## Agent workflow

1. Read demos/meta.js for look overrides and guiSchema for defaults.
2. Copy the effect module plus lib/core.js, lib/cloud-tools.js and lib/lens-pass.js, retaining relative imports. The shared helpers are authored collection infrastructure. For an entire offline preview also copy the remaining lib files, vendor, CSS and importmap.
3. Wire the lifecycle:

```js
import * as effect from './effects/fluid-wave-sheet.js';
const params = Object.fromEntries(effect.guiSchema.map(x => [x.key, x.default]));
// Apply one demos/meta.js look over these defaults if desired.
const lowEnd = (navigator.hardwareConcurrency || 4) <= 4 || /Mobi|Android/i.test(navigator.userAgent);
if (lowEnd && 'density' in params) params.density = Math.min(params.density, 0.55);
if (lowEnd && 'quality' in params) params.quality = 'low';
const ctx = {scene, camera, renderer, controls, clock, lowEnd};
effect.create(ctx, params);
function tick(dt) {
  effect.update(dt, params, ctx);
  if (!effect.render(ctx)) renderer.render(scene, camera);
}
// On look switch or unmount:
effect.dispose();
```

4. Expose the 6 primary controls. Mutate the same params object. Existing geometry, uniforms, materials or render targets are updated in place.
5. Use ctx.lowEnd=true, DPR ≤1 and the reduced scene/instance/render-target budget on weak devices. Frame rate must be measured on the actual target.
6. Keep the dark backdrop, controlled ACES exposure and studio reflection cards from demos/lib/setup.js. Pause offscreen/hidden work and respect reduced motion.

This effect has a render(ctx) hook. Call it instead of rendering the host scene twice. It preserves the host render target, tone mapping, autoClear and XR state. Reuse its passes inside an existing host pipeline rather than nesting output transforms.

## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| distortion | 波纹幅度 Distortion | 0.15–3 | 0.05 | 1.2 |
| roughness | 水面粗糙度 Roughness | 0.08–0.8 | 0.01 | 0.3 |
| frequency | 波纹频率 Frequency | 0.5–2.8 | 0.05 | 1.2 |
| sun | 光照方位 Sun | -3.1–3.1 | 0.05 | 0.8 |
| color | 水体色 Color | color | — | #315e6c |
| speed | 时间速度 Speed | 0–1 | 0.01 | 0.35 |

Details and preset values: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-ocean
python -m http.server 4200
# http://127.0.0.1:4200/demos/
```

Three.js 0.160.0 and lil-gui 0.19.2 are local and pinned. Use HTTP, not file://. ?low selects reduced budgets and ?still starts paused.

## Quality bar / acceptance

- [ ] All three looks render with no console or shader errors.
- [ ] Two real parameters change the rendered pixels while time is held fixed.
- [ ] Repeated create/update/dispose stabilizes geometry/texture counts and preserves unrelated host objects.
- [ ] dispose() is idempotent and any temporary renderer state is restored.
- [ ] Low-power rendering and mobile controls remain usable.

## Do / Don't

Reuse this package's new modules, not a renamed copy of an outside effect. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Do not introduce new images, models or shader sources without recording their source and permission. Analytic waves and planar reflection, not CFD, spectral-ocean simulation or full refraction/caustics.

## Optional Chinese notes · 中文摘要

**流动水面**：本次独立重写效果代码和程序化素材，保留原主题与生命周期接口，采用新的内部函数及效果文件名。

适合：水面、反射池、轻量海面外观。

限制：解析波面与平面反射近似，不是 CFD、海洋谱波、焦散或完整折射。

按 create → update → dispose 接入。安装提示：[references/install-prompt.md](references/install-prompt.md)。
