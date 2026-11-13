# 3D Iridescent Bubbles parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 气泡数量 Density | 0.3–1.5 | 0.05 | 1 |
| film | 膜厚 Film | 180–850 | 5 | 420 |
| roughness | 粗糙度 Roughness | 0.02–0.35 | 0.01 | 0.06 |
| drift | 漂浮幅度 Drift | 0–0.7 | 0.01 | 0.2 |
| color | 气泡底色 Color | color | — | #d9edf0 |
| speed | 时间速度 Speed | 0–1 | 0.02 | 0.35 |

## Three looks

### Pearl shells / 珍珠壳

Fine colored reflections.

```json
{}
```

### Golden film / 金色薄膜

A thicker warm interference finish.

```json
{
  "film": 730,
  "color": "#ead6bd",
  "roughness": 0.1
}
```

### Cold droplets / 冷色液滴

Fewer blue-tinted shells.

```json
{
  "film": 250,
  "color": "#c2dfed",
  "density": 0.5
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Three.js iridescent materials and authored drift; no membrane dynamics, bursting or collisions.

The standard scene path returns false from render(ctx); the host renders normally.
