# 3D Rain parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 雨滴数量 Density | 0.2–1.6 | 0.05 | 1 |
| wind | 横向风 Wind | -1.2–1.2 | 0.05 | 0.1 |
| length | 雨线长度 Length | 0.12–0.75 | 0.01 | 0.38 |
| width | 雨线宽度 Width | 0.006–0.045 | 0.001 | 0.014 |
| opacity | 可见强度 Opacity | 0.15–0.9 | 0.01 | 0.55 |
| speed | 下落速度 Speed | 0–1.4 | 0.02 | 0.55 |

## Three looks

### Night rainfall / 夜雨

Fine, nearly vertical streaks.

```json
{}
```

### Driving rain / 斜雨

Heavier wind-driven rainfall.

```json
{
  "wind": 0.8,
  "density": 1.35,
  "length": 0.5,
  "speed": 0.8
}
```

### Light drizzle / 细雨

Sparse, restrained rain.

```json
{
  "density": 0.35,
  "length": 0.2,
  "opacity": 0.4,
  "speed": 0.25
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Looping streak particles; no accumulation, droplet collision or wet-surface simulation.

The standard scene path returns false from render(ctx); the host renders normally.
