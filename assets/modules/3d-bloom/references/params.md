# 3D Bloom parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| quality | 质量 Quality | low / mid / high / cinematic | — | high |
| strength | 辉光强度 Strength | 0–2 | 0.02 | 0.8 |
| radius | 扩散半径 Radius | 0.2–2.5 | 0.02 | 1 |
| threshold | 亮部阈值 Threshold | 0.2–2 | 0.02 | 0.9 |
| exposure | 曝光 Exposure | 0.5–1.6 | 0.02 | 1 |
| color | 发光色 Color | color | — | #7ac9d1 |

## Three looks

### Cyan studio / 青色摄影棚

A controlled cool halo.

```json
{}
```

### Amber accent / 琥珀点缀

Warm localized emission.

```json
{
  "color": "#efb271",
  "strength": 0.5,
  "radius": 0.7,
  "threshold": 1.15
}
```

### Violet halo / 紫色光晕

A wider luminous silhouette.

```json
{
  "color": "#b29bd9",
  "strength": 1.3,
  "radius": 1.8
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Artistic thresholded glow, not calibrated optical scatter. Avoid nested output transforms.

This effect has a render(ctx) hook. Call it instead of rendering the host scene twice. It preserves the host render target, tone mapping, autoClear and XR state. Reuse its passes inside an existing host pipeline rather than nesting output transforms.
