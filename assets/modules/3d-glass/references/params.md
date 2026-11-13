# 3D Glass parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| roughness | 粗糙度 Roughness | 0.02–0.65 | 0.01 | 0.08 |
| thickness | 光学厚度 Thickness | 0.1–3 | 0.05 | 1.3 |
| ior | 折射率 IOR | 1.05–2 | 0.01 | 1.5 |
| transmission | 透射比例 Transmission | 0.2–1 | 0.01 | 0.98 |
| color | 玻璃色 Color | color | — | #d4edf0 |
| spin | 旋转速度 Spin | 0–0.5 | 0.01 | 0.1 |

## Three looks

### Optical clear / 清澈玻璃

A polished cool knot.

```json
{}
```

### Frosted blue / 磨砂蓝

Soft transmitted light.

```json
{
  "roughness": 0.34,
  "color": "#95b6ca",
  "thickness": 1.8
}
```

### Amber crystal / 琥珀晶体

Warm, thicker glass.

```json
{
  "color": "#e5c99a",
  "ior": 1.8,
  "thickness": 2.2
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Three.js physical-material screen-space transmission, not full volumetric ray tracing.

The standard scene path returns false from render(ctx); the host renders normally.
