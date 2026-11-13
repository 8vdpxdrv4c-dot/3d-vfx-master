> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Arc Chamber

A current bridges engineered electrodes in a quiet arc chamber. Copy this package's authored modules when installing. The research repository was a topic reference; its implementation and assets are not included.

## What this skill does

- Industrial energy diagrams, hero loops and restrained electric effects.
- Ships 3 looks, 6 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

Industrial energy diagrams, hero loops and restrained electric effects.

### Not for

Illustrative emissive ribbons, not an electrical field or plasma simulation. Brightness varies continuously; no strobe or impact-frame flashes.

## Package layout

```text
3d-lightning-energy/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/vfx-lightning-energy.js
    lib/{core,dispose,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Direction |
| --- | --- | --- |
| Electrode Bridge / 电极桥 | vfx-lightning-energy.js | White-blue filaments span two dark terminals. |
| Orbital Coil / 环形线圈 | vfx-lightning-energy.js | An orbital cage around a suspended core. |
| Branch Array / 支路阵列 | vfx-lightning-energy.js | A controlled fan of branching channels. |

## Agent workflow

1. Choose a look from demos/meta.js. Apply its overrides after guiSchema defaults.
2. Copy demos/effects/vfx-lightning-energy.js and demos/lib/core.js, retaining relative imports. For a complete preview copy the other lib files, vendor, CSS and importmap too. All visual assets are generated in memory.
3. Wire the lifecycle:

```js
import * as effect from './effects/vfx-lightning-energy.js';
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

4. Expose the 6 controls below. Mutate the same params object. Only topology keys branches rebuild the owned group; other controls update buffers, textures, uniforms or transforms.
5. Set ctx.lowEnd=true and DPR ≤1 on weak devices. Clamp density where exposed; the module reduces geometry, instance or render-target budgets. Measure the target device before promising a frame rate.
6. Start from the near-black scene, studio reflection cards and ACES Filmic setup in demos/lib/setup.js.





## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| energy | 发光强度 Energy | 0.2–3 | 0.05 | 1.35 |
| branches | 支路数量 Branches | 2–16 | 1 | 8 |
| reach | 弧线张幅 Reach | 0.3–2 | 0.02 | 1 |
| width | 弧线宽度 Width | 0.015–0.12 | 0.002 | 0.045 |
| color | 电弧色 Color | color | — | #84c5ff |
| speed | 演化速度 Speed | 0–1.5 | 0.02 | 0.65 |

Look values and tuning: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-lightning-energy
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

Keep the owned group and resource lifetime intact. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Preserve pause/reduced-motion behavior. Do not add outside assets without recording their source and permission. Illustrative emissive ribbons, not an electrical field or plasma simulation. Brightness varies continuously; no strobe or impact-frame flashes.

## Optional Chinese notes · 中文摘要

**闪电能量组合特效**：效果代码、几何与纹理由本次独立重写。含 3 套预设、6 个中英参数与离线预览。

适合：工业电弧、能源示意和克制的电能视觉效果。

限制：发光带几何示意，不模拟电场或等离子体；亮度连续变化，不含频闪或冲击闪帧。

按 create → update → dispose 接入，复制 effect 与 core.js；安装提示见 [references/install-prompt.md](references/install-prompt.md)。
