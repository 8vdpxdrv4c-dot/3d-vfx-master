# Turning Leaves parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 叶片数量 Density | 0.2–1.5 | 0.05 | 1 |
| wind | 横向风 Wind | 0–2.5 | 0.05 | 0.7 |
| fall | 下落速率 Fall | 0.1–2 | 0.05 | 0.65 |
| tumble | 翻转幅度 Tumble | 0–2 | 0.05 | 0.8 |
| color | 叶片底色 Color | color | — | #d68f36 |
| speed | 时间速度 Speed | 0–1.5 | 0.05 | 0.55 |

## Looks

### Amber Drift / 琥珀

Copper leaves tumble across a quiet stage.

```json
{
  "color": "#d69238",
  "wind": 0.65,
  "tumble": 0.8
}
```

### Olive Breeze / 橄榄

Longer green leaves in a crosswind.

```json
{
  "color": "#899a55",
  "wind": 1.3,
  "variant": 1
}
```

### Crimson Spiral / 绯红

Broad leaves trace a loose spiral.

```json
{
  "color": "#b54e42",
  "wind": 0.9,
  "tumble": 1.4,
  "variant": 2
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Analytic looping trajectories; no aerodynamic or leaf collision solver.



