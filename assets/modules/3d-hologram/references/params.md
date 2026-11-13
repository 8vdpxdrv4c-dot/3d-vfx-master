# 3D Hologram parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| opacity | 投影透明度 Opacity | 0.1–0.9 | 0.01 | 0.45 |
| lines | 扫描线密度 Lines | 8–100 | 1 | 42 |
| glow | 边缘亮度 Glow | 0.3–3 | 0.05 | 1.3 |
| scale | 模型尺度 Scale | 0.6–1.4 | 0.02 | 1 |
| color | 投影色 Color | color | — | #6fcbd4 |
| speed | 演化速度 Speed | 0–1 | 0.01 | 0.3 |

## Three looks

### Cyan shell / 青色投影

A knot-shaped scanned shell.

```json
{
  "variant": 0
}
```

### Amber facets / 琥珀切面

A faceted warm projection.

```json
{
  "variant": 1,
  "color": "#edbb78"
}
```

### Violet sphere / 紫色球壳

A smooth round silhouette.

```json
{
  "variant": 2,
  "color": "#b19bdd",
  "scale": 1.15
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. A luminous mesh shell, not physical holography or a volumetric display.

The standard scene path returns false from render(ctx); the host renders normally.
