> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# 3D Slice Reveal

One plane reveals the surface in a deliberate progression. Install the shipped new implementation rather than the earlier external effect module. The slug and lifecycle contract are retained for compatibility.

## What this skill does

- Creates 切面显现 with generated geometry or procedural surfaces, without downloaded models, images or shader modules.
- Ships three looks, 5 primary controls, offline dependencies and a standalone preview.
- Exports id, title, category, guiSchema, create, update, dispose, plus optional render and diagnostic stats.

### Good fit

Product films, dark studio presentations and reusable Three.js shaders effects.

### Not for

Surface clipping with open cut edges, not internal volumetric structure or CT data.

## Package layout

```text
3d-slice-reveal/
  module-guide.md / LICENSE.txt / ORIGINALITY.md / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/shader-solid-section.js
    lib/{core,dispose,cloud-tools,lens-pass,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Visual direction |
| --- | --- | --- |
| Cyan section / 青色剖切 | shader-solid-section.js | A slowly rising reveal. |
| Static sphere / 静态球截面 | shader-solid-section.js | A fixed section through a sphere. |
| Amber facets / 琥珀切面 | shader-solid-section.js | A warm faceted surface. |

## Agent workflow

1. Read demos/meta.js for look overrides and guiSchema for defaults.
2. Copy the effect module plus lib/core.js, lib/cloud-tools.js and lib/lens-pass.js, retaining relative imports. The shared helpers are authored collection infrastructure. For an entire offline preview also copy the remaining lib files, vendor, CSS and importmap.
3. Wire the lifecycle:

```js
import * as effect from './effects/shader-solid-section.js';
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

4. Expose the 5 primary controls. Mutate the same params object. Existing geometry, uniforms, materials or render targets are updated in place.
5. Use ctx.lowEnd=true, DPR ≤1 and the reduced scene/instance/render-target budget on weak devices. Frame rate must be measured on the actual target.
6. Keep the dark backdrop, controlled ACES exposure and studio reflection cards from demos/lib/setup.js. Pause offscreen/hidden work and respect reduced motion.

The standard scene path returns false from render(ctx); the host renders normally.

## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 剖切进度 Progress | 0–1 | 0.01 | 0.6 |
| tilt | 剖面倾角 Tilt | -0.7–0.7 | 0.02 | 0.08 |
| animate | 自动扫描 Animate | boolean | — | true |
| speed | 扫描速度 Speed | 0–0.7 | 0.01 | 0.18 |
| color | 模型色 Color | color | — | #89c5cb |

Details and preset values: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-slice-reveal
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

Reuse this package's new modules, not a renamed copy of an outside effect. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Do not introduce new images, models or shader sources without recording their source and permission. Surface clipping with open cut edges, not internal volumetric structure or CT data.

## Optional Chinese notes · 中文摘要

**切面显现**：本次独立重写效果代码和程序化素材，保留原主题与生命周期接口，采用新的内部函数及效果文件名。

适合：产品剖切、渐进显现和结构外观观察。

限制：裁剪网格表面，截面不自动封口；不代表真实内部结构或 CT 数据。

按 create → update → dispose 接入。安装提示：[references/install-prompt.md](references/install-prompt.md)。
