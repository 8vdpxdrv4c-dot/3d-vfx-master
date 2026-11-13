> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Machined Light

A machined object shaped by the reflections it holds. Copy this package's authored modules when installing. The research repository was a topic reference; its implementation and assets are not included.

## What this skill does

- Machined parts, metals, product turntables and finish comparisons.
- Ships 3 looks, 5 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

Machined parts, metals, product turntables and finish comparisons.

### Not for

An authored PBR study with generated maps and studio cards; not measured spectral metal data.

## Package layout

```text
3d-metal-material/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/shader-metal-material.js
    lib/{core,dispose,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Direction |
| --- | --- | --- |
| Brass Assembly / 黄铜 | shader-metal-material.js | Warm rings, a dark core and fine radial marks. |
| Titanium Stack / 钛银 | shader-metal-material.js | A satin stack with narrow polished shoulders. |
| Aged Copper / 古铜 | shader-metal-material.js | A broad ring with restrained oxidation. |

## Agent workflow

1. Choose a look from demos/meta.js. Apply its overrides after guiSchema defaults.
2. Copy demos/effects/shader-metal-material.js and demos/lib/core.js, retaining relative imports. For a complete preview copy the other lib files, vendor, CSS and importmap too. All visual assets are generated in memory.
3. Wire the lifecycle:

```js
import * as effect from './effects/shader-metal-material.js';
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

4. Expose the 5 controls below. Mutate the same params object. Controls operate on the existing scene.
5. Set ctx.lowEnd=true and DPR ≤1 on weak devices. Clamp density where exposed; the module reduces geometry, instance or render-target budgets. Measure the target device before promising a frame rate.
6. Start from the near-black scene, studio reflection cards and ACES Filmic setup in demos/lib/setup.js.





## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| roughness | 表面粗糙度 Roughness | 0.07–0.9 | 0.01 | 0.24 |
| brush | 拉丝强度 Brush | 0–1 | 0.01 | 0.55 |
| patina | 氧化覆盖 Patina | 0–1 | 0.01 | 0.12 |
| color | 金属色 Tint | color | — | #c8ab75 |
| spin | 转台速度 Spin | 0–1 | 0.01 | 0.12 |

Look values and tuning: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-metal-material
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

Keep the owned group and resource lifetime intact. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Preserve pause/reduced-motion behavior. Do not add outside assets without recording their source and permission. An authored PBR study with generated maps and studio cards; not measured spectral metal data.

## Optional Chinese notes · 中文摘要

**PBR 金属材质**：效果代码、几何与纹理由本次独立重写。含 3 套预设、5 个中英参数与离线预览。

适合：工业金属、拉丝与氧化对比、机械零件转台。

限制：生成贴图和摄影棚反射的 PBR 外观研究，不是实测光谱材质。

按 create → update → dispose 接入，复制 effect 与 core.js；安装提示见 [references/install-prompt.md](references/install-prompt.md)。
