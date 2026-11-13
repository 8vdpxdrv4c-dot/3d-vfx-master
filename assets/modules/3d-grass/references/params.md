# 3D Grass parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 草叶数量 Density | 0.25–1.5 | 0.05 | 1 |
| height | 草叶高度 Height | 0.3–1.4 | 0.02 | 0.75 |
| wind | 风动幅度 Wind | 0–1.3 | 0.02 | 0.4 |
| spread | 草场宽度 Spread | 3–6 | 0.1 | 5.3 |
| color | 草尖色 Color | color | — | #a4c363 |
| speed | 风速 Speed | 0–1.2 | 0.02 | 0.55 |

## Three looks

### Spring field / 春草

A green field with restrained motion.

```json
{}
```

### Golden meadow / 金色草甸

Warm tips under a stronger breeze.

```json
{
  "color": "#d8be76",
  "wind": 0.8,
  "height": 1.1
}
```

### Quiet green / 苔绿色

Short, quiet blades.

```json
{
  "color": "#75a393",
  "wind": 0.12,
  "height": 0.48
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Instanced analytic blade bending, not botanical growth or aerodynamics.

The standard scene path returns false from render(ctx); the host renders normally.
