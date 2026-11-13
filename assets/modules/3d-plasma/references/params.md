# 3D Plasma parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| width | 尾流半径 Width | 0.35–1.6 | 0.02 | 0.85 |
| glow | 发光强度 Glow | 0.25–2.8 | 0.05 | 1.4 |
| opacity | 壳层透明度 Opacity | 0.1–0.9 | 0.01 | 0.55 |
| flow | 流速 Flow | 0.2–2 | 0.02 | 1 |
| color | 尾流色 Color | color | — | #6da9e2 |
| speed | 时间速度 Speed | 0–1.4 | 0.02 | 0.65 |

## Three looks

### Thermal wake / 热尾流

A bright head and fine trailing filaments.

```json
{}
```

### Quiet wake / 平静尾流

A softer low-intensity stream.

```json
{
  "glow": 0.65,
  "opacity": 0.35,
  "flow": 0.55
}
```

### Dense energy / 致密能量

A concentrated cool luminous wake.

```json
{
  "glow": 2.2,
  "opacity": 0.8,
  "flow": 1.5,
  "color": "#8eabed"
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. An authored emissive wake, not charged-particle dynamics or magnetohydrodynamics.

The standard scene path returns false from render(ctx); the host renders normally.
