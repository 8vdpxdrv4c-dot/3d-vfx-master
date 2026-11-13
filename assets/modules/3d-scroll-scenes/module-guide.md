> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Scroll Chapters

Native scroll conducts a small three-dimensional story. Copy this package's authored modules when installing. The research repository was a topic reference; its implementation and assets are not included.

## What this skill does

- Web product stories, scroll progress adapters and camera-led presentations.
- Ships 3 looks, 5 bilingual controls and a self-contained offline preview.
- Exports id/title/category/guiSchema/create/update/dispose and render(ctx), which returns false for standard scenes.

### Good fit

Web product stories, scroll progress adapters and camera-led presentations.

### Not for

Native scroll-to-progress mapping and authored transforms. No GSAP/Lenis dependency; not a complete website or a physics simulation.

## Package layout

```text
3d-scroll-scenes/
  module-guide.md / ORIGINALITY.md / LICENSE.txt / DEPENDENCIES.json
  references/{params,install-prompt}.md
  assets/{README.md,preview.webp}
  demos/
    index.html / main.js / meta.js / styles.css
    effects/motion-scroll-scenes.js
    lib/{core,dispose,setup,gui,scroll-driver}.js
    vendor/{three.module.js,lil-gui.esm.js,THREE-MIT.txt,LIL-GUI-MIT.txt}
    vendor/addons/controls/OrbitControls.js
```

## Modes / Looks

| Look | Module | Direction |
| --- | --- | --- |
| Orbital Chapters / 轨道 | motion-scroll-scenes.js | Three objects form a measured orbital sequence. |
| Vertical Chapters / 纵向 | motion-scroll-scenes.js | A tiered ascent through sculptural forms. |
| Ribbon Chapters / 丝带 | motion-scroll-scenes.js | A diagonal ribbon carries the story. |

## Agent workflow

1. Choose a look from demos/meta.js. Apply its overrides after guiSchema defaults.
2. Copy demos/effects/motion-scroll-scenes.js and demos/lib/core.js, retaining relative imports. For a complete preview copy the other lib files, vendor, CSS and importmap too. All visual assets are generated in memory.
3. Wire the lifecycle:

```js
import * as effect from './effects/motion-scroll-scenes.js';
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

This module can own the camera. It saves the host pose and controls state, disables OrbitControls during route following, and restores them on dispose. Hand off with mode/follow; avoid simultaneous camera writers.

For native scroll, copy demos/lib/scroll-driver.js. Call createScrollDriver(window, value => { params.progress = value; }); and call its returned disconnect function on unmount. A scroll container can replace window; the host owns its layout.

## Param tables (from guiSchema)

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 叙事进度 Progress | 0–1 | 0.001 | 0.32 |
| follow | 镜头跟随 Follow | boolean | — | true |
| spacing | 章节间距 Spacing | 0.8–2 | 0.02 | 1.25 |
| reveal | 入场幅度 Reveal | 0–2 | 0.02 | 0.7 |
| color | 章节色 Color | color | — | #a9ba93 |

Look values and tuning: [references/params.md](references/params.md).

## Open the demo

```bash
cd /path/to/3d-scroll-scenes
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

Keep the owned group and resource lifetime intact. Keep [dependency notices](ORIGINALITY.md) with vendored libraries. Preserve pause/reduced-motion behavior. Do not add outside assets without recording their source and permission. Native scroll-to-progress mapping and authored transforms. No GSAP/Lenis dependency; not a complete website or a physics simulation.

## Optional Chinese notes · 中文摘要

**滚动驱动三维场景**：效果代码、几何与纹理由本次独立重写。含 3 套预设、5 个中英参数与离线预览。

适合：网页三维叙事、原生滚动进度接入和章节镜头运动。

限制：原生滚动映射与预设变换，不依赖 GSAP/Lenis，不包含整站业务或物理系统。

按 create → update → dispose 接入，复制 effect 与 core.js；安装提示见 [references/install-prompt.md](references/install-prompt.md)。
