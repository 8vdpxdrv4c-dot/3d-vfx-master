> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# 3D Liquid Metal

A mercury-like pool of procedural liquid metal morphs continuously, while a central blob pulses and satellite droplets bead and orbit. Install the shipped implementation rather than any outside fluid effect. The lifecycle contract follows the collection standard.

## What this skill does

- Creates 液态金属 with a displaced pool surface, a morphing central mass and instanced orbiting droplets — no downloaded models, images or shader modules.
- Ships three looks (水银池 / 流金 / 铬爆裂), 6 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

Mercury or liquid-metal product intros, T-1000 style morphing backgrounds, high-gloss metallic hero animations, dark studio presentations.

### Not for

Real fluid dynamics, SPH simulation, or measured surface-tension physics. The pool and blob use procedural displacement — not a true incompressible solver.

## Package layout

```text
3d-liquid-metal/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/fluid-liquid-metal.js
    lib/{core,dispose,cloud-tools,lens-pass,setup,gui,frame-driver,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | 中文 | Visual direction |
| --- | --- | --- |
| Mercury pool / 水银池 | 经典银白水银 | Active ripple, orbiting droplets, silver-white color. |
| Gold flow / 流金 | 慢流熔金 | Warm gold, low viscosity, fewer droplets, slower speed. |
| Chrome burst / 铬爆裂 | 铬飞溅 | High-speed chrome with tight surface tension and max droplets. |

## Agent workflow

1. Choose a look from `demos/meta.js`. Apply its `params` overrides after guiSchema defaults.
2. Copy `demos/effects/fluid-liquid-metal.js` and `demos/lib/core.js`, retaining relative imports. For a full offline preview copy the remaining lib files, vendor, CSS and importmap.
3. Wire the lifecycle:

```js
import * as effect from './effects/fluid-liquid-metal.js';
const params = Object.fromEntries(effect.guiSchema.map(s => [s.key, s.default]));
const lowEnd = (navigator.hardwareConcurrency || 4) <= 4 || /Mobi|Android/i.test(navigator.userAgent);
if (lowEnd && 'droplets' in params) params.droplets = Math.min(params.droplets, 10);
const ctx = { scene, camera, renderer, controls, clock, lowEnd };
effect.create(ctx, params);
function tick(dt) {
  effect.update(dt, params, ctx);
  if (!effect.render(ctx)) renderer.render(scene, camera);
}
// On unmount:
effect.dispose();
```

4. Expose the 6 controls. Mutate the same `params` object — `droplets` is a topology param and triggers a `create` rebuild when changed.
5. Use `ctx.lowEnd=true`, DPR ≤ 1 and reduced droplets on weak devices. Frame rate must be measured on the actual target.
6. Keep the dark backdrop, ACES exposure and studio reflection cards from `demos/lib/setup.js`. Pause offscreen/hidden work, respect reduced-motion.

`render(ctx)` returns false; the host renders normally.

## Param tables

| key | Label | Range | Step | Default |
| --- | --- | --- | --- | --- |
| viscosity | 粘性流速 Viscosity | 0.05–1.0 | 0.01 | 0.38 |
| tension | 表面张力 Tension | 0.1–2.0 | 0.05 | 0.85 |
| roughness | 表面粗糙度 Roughness | 0.0–0.35 | 0.01 | 0.04 |
| droplets | 液滴数量 Droplets | 0–60 | 1 | 18 |
| color | 金属色 Color | color | — | #c8ccd0 |
| speed | 流动速度 Speed | 0–1 | 0.01 | 0.32 |

Details and preset values: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-liquid-metal
python -m http.server 4200
# http://127.0.0.1:4200/demos/
```

Three.js 0.160.0 and lil-gui 0.19.2 are local and pinned. Use HTTP, not file://. `?low` selects reduced budgets; `?still` starts paused.

## Quality bar / acceptance

- [ ] All three looks render with no console or shader errors.
- [ ] `viscosity`, `tension` and `color` each produce visible pixel changes while time is held fixed.
- [ ] Repeated create/update/dispose stabilizes geometry and texture counts; host objects are preserved.
- [ ] `dispose()` is idempotent and any temporary renderer state is restored.
- [ ] Low-power rendering and mobile controls remain usable.

## Do / Don't

Reuse this package's modules, not a renamed copy of an outside effect. Keep dependency notices with vendored libraries. Do not introduce new images, models or shader sources without recording their source and permission.

## Optional Chinese notes · 中文摘要

**液态金属**：独立编写效果代码与程序化素材，沿用统一生命周期接口。

适合：水银特效、液态金属动效、产品展示金属液体背景。

限制：程序化变形曲面和实例化液滴，不是真实流体力学或 SPH 模拟。

按 create → update → dispose 接入。安装提示：[references/install-prompt.md](references/install-prompt.md)。
