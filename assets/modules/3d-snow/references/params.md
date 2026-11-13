# 3D Snow parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 雪片数量 Density | 0.2–1.6 | 0.05 | 1 |
| size | 雪片尺寸 Size | 0.025–0.17 | 0.005 | 0.065 |
| wind | 横向风 Wind | 0–2.5 | 0.05 | 0.45 |
| fall | 下落速率 Fall | 0.1–1 | 0.02 | 0.4 |
| opacity | 雪片强度 Opacity | 0.15–1 | 0.01 | 0.75 |
| speed | 时间速度 Speed | 0–1.2 | 0.02 | 0.5 |

## Three looks

### Blue hour / 蓝调时刻

Small softly lit flakes.

```json
{}
```

### Quiet snowfall / 静雪

Larger, slower flakes.

```json
{
  "size": 0.12,
  "density": 0.4,
  "wind": 0.1,
  "speed": 0.18
}
```

### Crosswind / 横风

A denser slanted field.

```json
{
  "density": 1.3,
  "wind": 2.1,
  "size": 0.045,
  "speed": 0.8
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Analytic drift and generated flake shapes; no accumulation, melting or fluid wind solver.

The standard scene path returns false from render(ctx); the host renders normally.
