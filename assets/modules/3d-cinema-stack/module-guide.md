> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Cinema Stack

A restrained glow, lens offset and film finish from one output owner. Copy this package's authored modules when installing. The research repository was a topic reference; its implementation and assets are not included.

## What this skill does

- A single-owner WebGL post chain for glow, exposure, chromatic offset, vignette and grain.
- Ships 3 looks, 6 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

A single-owner WebGL post chain for glow, exposure, chromatic offset, vignette and grain.

### Not for

A lightweight artistic lens stack; no depth of field, film emulation calibration or spectral lens simulation. Integrate into an existing composer rather than nesting output transforms.

## Package layout

```text
3d-cinema-stack/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/post-cinema-stack.js
    lib/{core,dispose,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Direction |
| --- | --- | --- |
| Warm Editorial / 暖调 | post-cinema-stack.js | Controlled warm highlights and a gentle lens finish. |
| Cold Precision / 冷调 | post-cinema-stack.js | A crisp blue-green material study. |
| Night Cinema / 夜景 | post-cinema-stack.js | Tighter exposure and broader, low-key glow. |

## Agent workflow

1. Choose a look from demos/meta.js. Apply its overrides after guiSchema defaults.
2. Copy demos/effects/post-cinema-stack.js and demos/lib/core.js, retaining relative imports. For a complete preview copy the other lib files, vendor, CSS and importmap too. All visual assets are generated in memory.
3. Wire the lifecycle:

```js
import * as effect from './effects/post-cinema-stack.js';
const params = Object.fromEntries(effect.guiSchema.map(s => [s.key, s.default]));
const lowEnd = (navigator.hardwareConcurrency || 4) <= 4 || /Mobi|Android/i.test(navigator.userAgent);
if (lowEnd && 'density' in params) params.density = Math.min(params.density, 0.55);
if (lowEnd && 'quality' in params) params.quality = 'low';
const ctx = { scene, camera, renderer, controls, clock, lowEnd };
effect.create(ctx, params);
function tick(dt) {
  effect.update(dt, params, ctx);
  if (!effect.render(ctx)) renderer.render(scene, camera);
}
// Before changing look or unloading:
effect.dispose();
```

4. Expose the 6 controls below. Mutate the same params object. Controls operate on the existing scene.
5. Set ctx.lowEnd=true and DPR ≤1 on weak devices. Clamp density where exposed; the module reduces geometry, instance or render-target budgets. Measure the target device before promising a frame rate.
6. Start from the near-black scene, studio reflection cards and ACES Filmic setup in demos/lib/setup.js.


This module owns three render targets and one output transform. render(ctx) restores the host render target, tone mapping, autoClear and XR state. Integrate into an existing host composer rather than nesting output transforms. Quality low/mid/high/cinematic changes blur resolution and iterations; ctx.lowEnd forces low.


## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| quality | 质量 Quality | low / mid / high / cinematic | — | high |
| glow | 辉光 Glow | 0–2 | 0.02 | 0.65 |
| exposure | 曝光 Exposure | 0.4–1.8 | 0.02 | 1 |
| chromatic | 色差 Chromatic | 0–0.014 | 0.0005 | 0.0025 |
| vignette | 暗角 Vignette | 0–1 | 0.01 | 0.35 |
| grain | 颗粒 Grain | 0–0.09 | 0.002 | 0.018 |

Look values and tuning: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-cinema-stack
python -m http.server 4190
# http://127.0.0.1:4190/demos/
```

Local Three.js 0.160.0 and lil-gui 0.19.2 are pinned. HTTP is required for ES modules; no CDN or file:// dependency. ?low selects reduced budgets; ?still starts paused. The preview pauses hidden/offscreen work and respects reduced motion.

## Quality bar / acceptance

- [ ] Every look renders without shader or console errors.
- [ ] At least two real controls visibly change the effect with time held fixed.
- [ ] Repeated create/update/dispose stabilizes geometry/texture counts and preserves unrelated host content.
- [ ] dispose() is idempotent and the low-power variant keeps the intended subject.
- [ ] Desktop and narrow mobile layouts remain operable.

## Do / Don't

Keep the owned group and resource lifetime intact. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Preserve pause/reduced-motion behavior. Do not add outside assets without recording their source and permission. A lightweight artistic lens stack; no depth of field, film emulation calibration or spectral lens simulation. Integrate into an existing composer rather than nesting output transforms.

## Optional Chinese notes · 中文摘要

**电影后期效果组合**：效果代码、几何与纹理由本次独立重写。含 3 套预设、6 个中英参数与离线预览。

适合：统一管理辉光、曝光、色差、暗角和颗粒的 WebGL 后期链。

限制：轻量艺术化镜头效果，不含景深、经标定的胶片仿真或光谱镜头模拟；不应套叠宿主已有输出变换。

按 create → update → dispose 接入，复制 effect 与 core.js；安装提示见 [references/install-prompt.md](references/install-prompt.md)。
