# 3D Sparks parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 粒子数量 Density | 0.2–1.8 | 0.05 | 1 |
| height | 抛射高度 Height | 0.6–4.2 | 0.05 | 2.5 |
| spread | 横向扩散 Spread | 0.25–2.2 | 0.05 | 0.8 |
| size | 火花尺寸 Size | 0.012–0.1 | 0.002 | 0.035 |
| color | 火花色 Color | color | — | #ffc477 |
| speed | 时间速度 Speed | 0–1.8 | 0.02 | 0.7 |

## Three looks

### Copper cascade / 铜色火花

Tight warm arcs.

```json
{}
```

### Cool machining / 冷色加工

Fine blue fragments.

```json
{
  "color": "#8bd9f1",
  "height": 1.7,
  "spread": 1.1,
  "size": 0.025
}
```

### Floating embers / 漂浮余烬

Slow, broadly scattered fragments.

```json
{
  "color": "#ff7950",
  "speed": 0.15,
  "height": 3.5,
  "spread": 1.5
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Authored ballistic paths; no combustion, thermal transport or collision solver.

The standard scene path returns false from render(ctx); the host renders normally.
