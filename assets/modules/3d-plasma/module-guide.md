> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# 3D Plasma

A narrow layered wake carries luminous filaments. Install the shipped new implementation rather than the earlier external effect module. The slug and lifecycle contract are retained for compatibility.

## What this skill does

- Creates 等离子尾流 with generated geometry or procedural surfaces, without downloaded models, images or shader modules.
- Ships three looks, 6 primary controls, offline dependencies and a standalone preview.
- Exports id, title, category, guiSchema, create, update, dispose, plus optional render and diagnostic stats.

### Good fit

Product films, dark studio presentations and reusable Three.js vfx effects.

### Not for

An authored emissive wake, not charged-particle dynamics or magnetohydrodynamics.

## Package layout

```text
3d-plasma/
  module-guide.md / LICENSE.txt / ORIGINALITY.md / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/vfx-plasma-stream.js
    lib/{core,dispose,cloud-tools,lens-pass,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Visual direction |
| --- | --- | --- |
| Thermal wake / 热尾流 | vfx-plasma-stream.js | A bright head and fine trailing filaments. |
| Quiet wake / 平静尾流 | vfx-plasma-stream.js | A softer low-intensity stream. |
| Dense energy / 致密能量 | vfx-plasma-stream.js | A concentrated cool luminous wake. |

## Agent workflow

1. Read demos/meta.js for look overrides and guiSchema for defaults.
2. Copy the effect module plus lib/core.js, lib/cloud-tools.js and lib/lens-pass.js, retaining relative imports. The shared helpers are authored collection infrastructure. For an entire offline preview also copy the remaining lib files, vendor, CSS and importmap.
3. Wire the lifecycle:

```js
import * as effect from './effects/vfx-plasma-stream.js';
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

The standard scene path returns false from render(ctx); the host renders normally.

## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| width | 尾流半径 Width | 0.35–1.6 | 0.02 | 0.85 |
| glow | 发光强度 Glow | 0.25–2.8 | 0.05 | 1.4 |
| opacity | 壳层透明度 Opacity | 0.1–0.9 | 0.01 | 0.55 |
| flow | 流速 Flow | 0.2–2 | 0.02 | 1 |
| color | 尾流色 Color | color | — | #6da9e2 |
| speed | 时间速度 Speed | 0–1.4 | 0.02 | 0.65 |

Details and preset values: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-plasma
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

Reuse this package's new modules, not a renamed copy of an outside effect. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Do not introduce new images, models or shader sources without recording their source and permission. An authored emissive wake, not charged-particle dynamics or magnetohydrodynamics.

## Optional Chinese notes · 中文摘要

**等离子尾流**：本次独立重写效果代码和程序化素材，保留原主题与生命周期接口，采用新的内部函数及效果文件名。

适合：能源、推进尾流与抽象等离子外观。

限制：解析发光壳层，不求解带电粒子、电磁流体或再入气动热。

按 create → update → dispose 接入。安装提示：[references/install-prompt.md](references/install-prompt.md)。
