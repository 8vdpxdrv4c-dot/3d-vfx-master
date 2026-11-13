> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# 3D Snow

Soft flakes drift through the depth of the scene. Install the shipped new implementation rather than the earlier external effect module. The slug and lifecycle contract are retained for compatibility.

## What this skill does

- Creates 飘雪空间 with generated geometry or procedural surfaces, without downloaded models, images or shader modules.
- Ships three looks, 6 primary controls, offline dependencies and a standalone preview.
- Exports id, title, category, guiSchema, create, update, dispose, plus optional render and diagnostic stats.

### Good fit

Product films, dark studio presentations and reusable Three.js particles effects.

### Not for

Analytic drift and generated flake shapes; no accumulation, melting or fluid wind solver.

## Package layout

```text
3d-snow/
  module-guide.md / LICENSE.txt / ORIGINALITY.md / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/particles-snow-orbit.js
    lib/{core,dispose,cloud-tools,lens-pass,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Visual direction |
| --- | --- | --- |
| Blue hour / 蓝调时刻 | particles-snow-orbit.js | Small softly lit flakes. |
| Quiet snowfall / 静雪 | particles-snow-orbit.js | Larger, slower flakes. |
| Crosswind / 横风 | particles-snow-orbit.js | A denser slanted field. |

## Agent workflow

1. Read demos/meta.js for look overrides and guiSchema for defaults.
2. Copy the effect module plus lib/core.js, lib/cloud-tools.js and lib/lens-pass.js, retaining relative imports. The shared helpers are authored collection infrastructure. For an entire offline preview also copy the remaining lib files, vendor, CSS and importmap.
3. Wire the lifecycle:

```js
import * as effect from './effects/particles-snow-orbit.js';
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

4. Expose the 6 primary controls. Mutate the same params object. Only topology controls density rebuild the owned group.
5. Use ctx.lowEnd=true, DPR ≤1 and the reduced scene/instance/render-target budget on weak devices. Frame rate must be measured on the actual target.
6. Keep the dark backdrop, controlled ACES exposure and studio reflection cards from demos/lib/setup.js. Pause offscreen/hidden work and respect reduced motion.

The standard scene path returns false from render(ctx); the host renders normally.

## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 雪片数量 Density | 0.2–1.6 | 0.05 | 1 |
| size | 雪片尺寸 Size | 0.025–0.17 | 0.005 | 0.065 |
| wind | 横向风 Wind | 0–2.5 | 0.05 | 0.45 |
| fall | 下落速率 Fall | 0.1–1 | 0.02 | 0.4 |
| opacity | 雪片强度 Opacity | 0.15–1 | 0.01 | 0.75 |
| speed | 时间速度 Speed | 0–1.2 | 0.02 | 0.5 |

Details and preset values: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-snow
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

Reuse this package's new modules, not a renamed copy of an outside effect. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Do not introduce new images, models or shader sources without recording their source and permission. Analytic drift and generated flake shapes; no accumulation, melting or fluid wind solver.

## Optional Chinese notes · 中文摘要

**飘雪空间**：本次独立重写效果代码和程序化素材，保留原主题与生命周期接口，采用新的内部函数及效果文件名。

适合：冬季空间、景深雪片与天气背景。

限制：解析漂移与生成的雪片形状，不模拟堆积、融化或流体风场。

按 create → update → dispose 接入。安装提示：[references/install-prompt.md](references/install-prompt.md)。
