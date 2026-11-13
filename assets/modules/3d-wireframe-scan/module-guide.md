> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Survey Reveal

A wire cage leads the visible surface through a moving survey. Copy this package's authored modules when installing. The research repository was a topic reference; its implementation and assets are not included.

## What this skill does

- Model entrances, topology inspection and scan/reveal motion.
- Ships 3 looks, 6 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

Model entrances, topology inspection and scan/reveal motion.

### Not for

A geometric reveal mask and temporary wire overlay; not CT, tomography or measurement data.

## Package layout

```text
3d-wireframe-scan/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/shader-wireframe-scan.js
    lib/{core,dispose,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Direction |
| --- | --- | --- |
| Radial / 径向 | shader-wireframe-scan.js | A radial cage surveys the gimbal. |
| Vertical / 竖向 | shader-wireframe-scan.js | A plane builds the object from the base. |
| Oblique / 斜向 | shader-wireframe-scan.js | An oblique band traverses topology. |

## Agent workflow

1. Choose a look from demos/meta.js. Apply its overrides after guiSchema defaults.
2. Copy demos/effects/shader-wireframe-scan.js and demos/lib/core.js, retaining relative imports. For a complete preview copy the other lib files, vendor, CSS and importmap too. All visual assets are generated in memory.
3. Wire the lifecycle:

```js
import * as effect from './effects/shader-wireframe-scan.js';
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





## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 扫描进度 Progress | 0–1 | 0.01 | 0.58 |
| band | 扫描带宽 Band | 0.03–0.7 | 0.01 | 0.28 |
| glow | 线框强度 Glow | 0.2–3 | 0.05 | 1.35 |
| color | 扫描色 Color | color | — | #75d8b0 |
| speed | 扫描速度 Speed | 0–0.4 | 0.005 | 0.045 |
| spin | 模型旋转 Spin | 0–0.5 | 0.01 | 0.08 |

Look values and tuning: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-wireframe-scan
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

Keep the owned group and resource lifetime intact. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Preserve pause/reduced-motion behavior. Do not add outside assets without recording their source and permission. A geometric reveal mask and temporary wire overlay; not CT, tomography or measurement data.

## Optional Chinese notes · 中文摘要

**线框扫描显现**：效果代码、几何与纹理由本次独立重写。含 3 套预设、6 个中英参数与离线预览。

适合：模型入场、线框观察和扫描显现。

限制：几何遮罩与临时线框，不代表 CT、断层成像或测量数据。

按 create → update → dispose 接入，复制 effect 与 core.js；安装提示见 [references/install-prompt.md](references/install-prompt.md)。
