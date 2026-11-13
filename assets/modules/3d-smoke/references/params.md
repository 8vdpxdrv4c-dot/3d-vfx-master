# 3D Smoke parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 浓密度 Density | 0.2–1.7 | 0.05 | 1 |
| spread | 扩散幅度 Spread | 0.25–2.5 | 0.05 | 1 |
| height | 烟柱高度 Height | 2–6 | 0.05 | 4.5 |
| opacity | 不透明度 Opacity | 0.08–0.9 | 0.01 | 0.5 |
| color | 烟色 Color | color | — | #b3bac2 |
| speed | 升腾速度 Speed | 0–1.8 | 0.02 | 0.65 |

## Three looks

### Industrial stack / 工业烟柱

A soft grey column with a narrow base.

```json
{}
```

### Wide atmosphere / 大气扩散

A wider, quieter plume.

```json
{
  "spread": 2.1,
  "opacity": 0.3,
  "speed": 0.25
}
```

### Dense column / 致密烟柱

A taller concentrated stream.

```json
{
  "spread": 0.55,
  "height": 5,
  "opacity": 0.72,
  "speed": 1.1
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Analytic soft particles, not CFD, volumetric caches or dispersion prediction.

The standard scene path returns false from render(ctx); the host renders normally.
