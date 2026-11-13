# 3D Slice Reveal parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 剖切进度 Progress | 0–1 | 0.01 | 0.6 |
| tilt | 剖面倾角 Tilt | -0.7–0.7 | 0.02 | 0.08 |
| animate | 自动扫描 Animate | boolean | — | true |
| speed | 扫描速度 Speed | 0–0.7 | 0.01 | 0.18 |
| color | 模型色 Color | color | — | #89c5cb |

## Three looks

### Cyan section / 青色剖切

A slowly rising reveal.

```json
{
  "variant": 0
}
```

### Static sphere / 静态球截面

A fixed section through a sphere.

```json
{
  "variant": 1,
  "animate": false,
  "progress": 0.56
}
```

### Amber facets / 琥珀切面

A warm faceted surface.

```json
{
  "variant": 2,
  "color": "#dcbc8d",
  "speed": 0.13
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Surface clipping with open cut edges, not internal volumetric structure or CT data.

The standard scene path returns false from render(ctx); the host renders normally.
