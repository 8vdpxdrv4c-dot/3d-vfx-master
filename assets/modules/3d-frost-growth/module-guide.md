> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Crystal Field

Dendritic lines spread; faceted crystals rise, separate and settle. Copy this package's authored modules when installing. The research repository was a topic reference; its implementation and assets are not included.

## What this skill does

- Frost spreads, crystal studies and controllable frozen-surface transitions.
- Ships 3 looks, 6 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

Frost spreads, crystal studies and controllable frozen-surface transitions.

### Not for

Authored branching and rigid fragment motion. No dendrite diffusion, fracture mechanics, thermal or refraction solver.

## Package layout

```text
3d-frost-growth/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/vfx-frost-growth.js
    lib/{core,dispose,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Direction |
| --- | --- | --- |
| Dendrite / 枝晶 | vfx-frost-growth.js | A planar frost field with a small crystal center. |
| Ice Crown / 冰冠 | vfx-frost-growth.js | A raised ring of faceted crystals. |
| Fracture Study / 碎裂 | vfx-frost-growth.js | Crystals part into authored faceted pieces. |

## Agent workflow

1. Choose a look from demos/meta.js. Apply its overrides after guiSchema defaults.
2. Copy demos/effects/vfx-frost-growth.js and demos/lib/core.js, retaining relative imports. For a complete preview copy the other lib files, vendor, CSS and importmap too. All visual assets are generated in memory.
3. Wire the lifecycle:

```js
import * as effect from './effects/vfx-frost-growth.js';
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

4. Expose the 6 controls below. Mutate the same params object. Only topology keys density rebuild the owned group; other controls update buffers, textures, uniforms or transforms.
5. Set ctx.lowEnd=true and DPR ≤1 on weak devices. Clamp density where exposed; the module reduces geometry, instance or render-target budgets. Measure the target device before promising a frame rate.
6. Start from the near-black scene, studio reflection cards and ACES Filmic setup in demos/lib/setup.js.





## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| growth | 结霜进度 Growth | 0–1 | 0.01 | 0.82 |
| density | 晶体密度 Density | 0.25–1.4 | 0.05 | 1 |
| height | 冰晶高度 Height | 0.2–2 | 0.02 | 1 |
| fracture | 破碎程度 Fracture | 0–1 | 0.01 | 0 |
| color | 晶体色 Color | color | — | #a9d9e2 |
| speed | 呼吸速度 Speed | 0–1 | 0.01 | 0.2 |

Look values and tuning: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-frost-growth
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

Keep the owned group and resource lifetime intact. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Preserve pause/reduced-motion behavior. Do not add outside assets without recording their source and permission. Authored branching and rigid fragment motion. No dendrite diffusion, fracture mechanics, thermal or refraction solver.

## Optional Chinese notes · 中文摘要

**冰霜生长与破碎**：效果代码、几何与纹理由本次独立重写。含 3 套预设、6 个中英参数与离线预览。

适合：可控结霜、冰晶生长与碎裂展示。

限制：分枝与碎块运动均为预设，不代表扩散、断裂力学、热学或完整折射求解。

按 create → update → dispose 接入，复制 effect 与 core.js；安装提示见 [references/install-prompt.md](references/install-prompt.md)。
