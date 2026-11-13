# 3D Depth of Field parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| quality | 质量 Quality | low / mid / high / cinematic | — | high |
| focus | 对焦距离 Focus | 5–19 | 0.1 | 10 |
| aperture | 光圈系数 Aperture | 0.00003–0.0018 | 0.00003 | 0.00045 |
| blur | 模糊上限 Blur | 0.003–0.07 | 0.001 | 0.035 |
| color | 主体色 Color | color | — | #7aafb9 |

## Three looks

### Middle focus / 中景对焦

A central group stays legible.

```json
{}
```

### Near focus / 近景对焦

Front objects receive the sharpness.

```json
{
  "focus": 7.5,
  "aperture": 0.0009,
  "color": "#d8ad77"
}
```

### Deep focus / 深景观察

A subtler lens finish through depth.

```json
{
  "focus": 12,
  "aperture": 0.00008,
  "blur": 0.009
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. A depth-texture lens approximation, not optical ray tracing; transparent-depth limitations apply.

This effect has a render(ctx) hook. Call it instead of rendering the host scene twice. It preserves the host render target, tone mapping, autoClear and XR state. Reuse its passes inside an existing host pipeline rather than nesting output transforms.
