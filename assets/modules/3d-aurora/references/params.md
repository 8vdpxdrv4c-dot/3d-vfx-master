# 3D Aurora parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| height | 幕帘高度 Height | 1–4.5 | 0.05 | 2.7 |
| wave | 折叠幅度 Wave | 0.1–2 | 0.02 | 0.8 |
| opacity | 光幕强度 Opacity | 0.1–1 | 0.01 | 0.65 |
| color | 主光色 Color | color | — | #58c693 |
| highlight | 边缘色 Highlight | color | — | #a68bc9 |
| speed | 演化速度 Speed | 0–1 | 0.01 | 0.22 |

## Three looks

### Emerald veil / 翡翠幕帘

Green curtains with violet edges.

```json
{
  "variant": 0
}
```

### Solar rose / 玫瑰光幕

Warm magenta bands.

```json
{
  "variant": 1,
  "color": "#dc83a9",
  "highlight": "#e8bd87"
}
```

### Arctic blue / 北极蓝

Cool folded blue ribbons.

```json
{
  "variant": 2,
  "color": "#699ee0",
  "highlight": "#7ee1cc"
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Bounded emissive geometry, not a magnetosphere or atmospheric transport model.

The standard scene path returns false from render(ctx); the host renders normally.
