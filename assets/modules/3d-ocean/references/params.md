# 3D Ocean parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| distortion | 波纹幅度 Distortion | 0.15–3 | 0.05 | 1.2 |
| roughness | 水面粗糙度 Roughness | 0.08–0.8 | 0.01 | 0.3 |
| frequency | 波纹频率 Frequency | 0.5–2.8 | 0.05 | 1.2 |
| sun | 光照方位 Sun | -3.1–3.1 | 0.05 | 0.8 |
| color | 水体色 Color | color | — | #315e6c |
| speed | 时间速度 Speed | 0–1 | 0.01 | 0.35 |

## Three looks

### Deep teal / 深青水面

A cool reflecting pool.

```json
{}
```

### Still pool / 静水

Quieter dark-blue water.

```json
{
  "distortion": 0.3,
  "speed": 0.12,
  "color": "#1a364e"
}
```

### Copper light / 暖光水面

A warmer specular direction.

```json
{
  "sun": 2.3,
  "color": "#3b696e",
  "distortion": 2.2
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Analytic waves and planar reflection, not CFD, spectral-ocean simulation or full refraction/caustics.

This effect has a render(ctx) hook. Call it instead of rendering the host scene twice. It preserves the host render target, tone mapping, autoClear and XR state. Reuse its passes inside an existing host pipeline rather than nesting output transforms.
