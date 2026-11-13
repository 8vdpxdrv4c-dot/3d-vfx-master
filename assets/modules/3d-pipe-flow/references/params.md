# 3D Pipe Flow parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 流点数量 Density | 0.2–1.5 | 0.05 | 1 |
| radius | 管道半径 Radius | 0.08–0.33 | 0.01 | 0.17 |
| spacing | 流点间距 Spacing | 0.5–2 | 0.05 | 1 |
| opacity | 管壁透明度 Opacity | 0.1–0.65 | 0.01 | 0.26 |
| color | 流体色 Color | color | — | #86d5d3 |
| speed | 流速 Speed | 0–1.2 | 0.02 | 0.35 |

## Three looks

### Cooling line / 冷却管线

A cool directional route.

```json
{}
```

### Energy feed / 能量输送

Warm faster packets.

```json
{
  "color": "#eab478",
  "speed": 0.8,
  "spacing": 1.4
}
```

### Gentle circulation / 缓流

A slower sparse route.

```json
{
  "color": "#9ed4b1",
  "speed": 0.15,
  "density": 0.45,
  "radius": 0.25
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Authored packet motion, not pressure, flow rate, turbulence or a pipe-network solver.

The standard scene path returns false from render(ctx); the host renders normally.
