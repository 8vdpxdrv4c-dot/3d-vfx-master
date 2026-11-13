> 3Dfans特效大师 · 内部效果模块。随统一技能使用，无需另行安装。

# Drain Spout · 排水管喷水

Adapt the supplied **Spout — @P_Malin** shader with a reusable Three.js r160 lifecycle. Retain its attribution. The attachment contains no shader license declaration; do not label this shader original, MIT, or commercially cleared. See [source notes](references/source-notes.md) for provenance and the adaptation boundary.

## Delivery and looks

The offline demo contains three looks: Classic channel / 经典排水, Gentle outflow / 柔和出水, Strong discharge / 强劲排水. It has six live controls, pointer/touch orbit, wheel zoom, retained view after pointer release, pause/reset, a real low-power shader branch and responsive layout.

适合：排水管出水、抛物线水束、渠道涟漪和折射水体的艺术化展示。

限制：全屏距离场光线步进，水束与涟漪为解析近似；没有 CFD、体积守恒、真实流量或碰撞求解。不可与宿主三维场景做逐物体深度遮挡。

## Integration

Copy demos/effects/fluid-drain-spout.js, demos/lib/{spout-shaders,dispose}.js and demos/meta.js with relative paths intact. Resolve `three` to r160 or a compatible installation. The full demo also needs gui.js, lil-gui, CSS and local vendor files. Serve through HTTP; WebGL 2 is required.

```js
import * as spout from "./effects/fluid-drain-spout.js";
const params = Object.fromEntries(spout.guiSchema.map(s => [s.key, s.default]));
const ctx = {renderer, lowEnd: false};
spout.create(ctx, params);
function frame(dt) {
  spout.update(dt, params, ctx);
  spout.render(ctx);
}
// Optional retained normalized orbit coordinates and distance multiplier:
spout.setView(0.2, 0.8, 1);
// Unmount / switch effect:
spout.dispose();
```

Exports: id, title, category, guiSchema, create, update, dispose, render, setView, seek, stats. `render(ctx)` owns this full frame; it uses a private orthographic quad and does not mutate the host scene or perspective camera. It restores autoClear and XR flags, respects the current render target and viewport, and performs the supplied shader’s exposure/tonemapping once. Do not render it as a transparent 3D mesh or append another output transform unintentionally.

Mutate params in place and call update(0, params) for immediate edits. `speed` scales subsequent time increments; it does not instantly reshape a frozen frame. seek(seconds) provides deterministic sampling. dispose is idempotent. To switch quality, recreate with ctx.lowEnd, then restore seek/setView if continuity is wanted.

## Parameters

| key | 中英名称 | 范围 | step | 默认值 |
| --- | --- | --- | --- | --- |
| flow | 出水速度 Flow | 0.65–1.7 | 0.025 | 1 |
| radius | 出水半径 Radius | 0.18–0.45 | 0.01 | 0.4 |
| height | 管口高度 Height | 1.3–2.6 | 0.05 | 2 |
| ripple | 波纹幅度 Ripple | 0.005–0.05 | 0.001 | 0.025 |
| exposure | 画面曝光 Exposure | 0.7–2.3 | 0.05 | 1.5 |
| speed | 动画速度 Speed | 0–1.8 | 0.05 | 1 |

Read [params.md](references/params.md) for units, presets and low-power behavior. Use [install-prompt.md](references/install-prompt.md) when installing into another project.

## Preview and acceptance

Open demos/index.html through a static HTTP server. `?still` starts paused; `?low&still` also selects the 16-step reduced shader and smaller drawing buffer. Standard mode uses 32 steps and at most 850 drawing-buffer pixels horizontally; low mode caps at 560. Pixel ratio is one; the canvas scales to the viewport in CSS. The provided demo caps animation drawing at 30/20 fps; actual device throughput is not guaranteed. Hidden/offscreen/reduced-motion handling is wired in demos/main.js.

Verify all looks, every visible parameter, time motion, retained orbit after release, low/standard switching, resize, mobile overflow, repeat create/dispose and host-state preservation. Shader compile failures must show the error panel. Effects are analytic artistic approximations; do not report measured discharge, physical pressure, conservation, CFD or production performance without separate evidence.
