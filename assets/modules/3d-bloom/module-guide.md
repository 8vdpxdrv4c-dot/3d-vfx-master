> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# 3D Bloom

A localized halo with one clear output owner. Install the shipped new implementation rather than the earlier external effect module. The slug and lifecycle contract are retained for compatibility.

## What this skill does

- Creates 电影辉光 with generated geometry or procedural surfaces, without downloaded models, images or shader modules.
- Ships three looks, 6 primary controls, offline dependencies and a standalone preview.
- Exports id, title, category, guiSchema, create, update, dispose, plus optional render and diagnostic stats.

### Good fit

Product films, dark studio presentations and reusable Three.js postprocessing effects.

### Not for

Artistic thresholded glow, not calibrated optical scatter. Avoid nested output transforms.

## Package layout

```text
3d-bloom/
  module-guide.md / LICENSE.txt / ORIGINALITY.md / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/post-soft-glow.js
    lib/{core,dispose,cloud-tools,lens-pass,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Visual direction |
| --- | --- | --- |
| Cyan studio / 青色摄影棚 | post-soft-glow.js | A controlled cool halo. |
| Amber accent / 琥珀点缀 | post-soft-glow.js | Warm localized emission. |
| Violet halo / 紫色光晕 | post-soft-glow.js | A wider luminous silhouette. |

## Agent workflow

1. Read demos/meta.js for look overrides and guiSchema for defaults.
2. Copy the effect module plus lib/core.js, lib/cloud-tools.js and lib/lens-pass.js, retaining relative imports. The shared helpers are authored collection infrastructure. For an entire offline preview also copy the remaining lib files, vendor, CSS and importmap.
3. Wire the lifecycle:

```js
import * as effect from './effects/post-soft-glow.js';
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
| quality | 质量 Quality | low / mid / high / cinematic | — | high |
| strength | 辉光强度 Strength | 0–2 | 0.02 | 0.8 |
| radius | 扩散半径 Radius | 0.2–2.5 | 0.02 | 1 |
| threshold | 亮部阈值 Threshold | 0.2–2 | 0.02 | 0.9 |
| exposure | 曝光 Exposure | 0.5–1.6 | 0.02 | 1 |
| color | 发光色 Color | color | — | #7ac9d1 |

Details and preset values: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-bloom
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

Reuse this package's new modules, not a renamed copy of an outside effect. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Do not introduce new images, models or shader sources without recording their source and permission. Artistic thresholded glow, not calibrated optical scatter. Avoid nested output transforms.

## Optional Chinese notes · 中文摘要

**电影辉光**：本次独立重写效果代码和程序化素材，保留原主题与生命周期接口，采用新的内部函数及效果文件名。

适合：发光产品、亮部溢出与可控柔光。

限制：艺术化亮部提取和模糊，不是经标定的镜头散射；不要叠加宿主输出变换。

按 create → update → dispose 接入。安装提示：[references/install-prompt.md](references/install-prompt.md)。
