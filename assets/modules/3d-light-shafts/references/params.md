# 3D Light Shafts parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| angle | 光锥角度 Angle | 0.12–0.52 | 0.01 | 0.25 |
| spread | 灯位间距 Spread | 0.8–3 | 0.05 | 1.9 |
| opacity | 光束强度 Opacity | 0.08–0.75 | 0.01 | 0.28 |
| intensity | 灯光强度 Intensity | 8–65 | 1 | 30 |
| color | 光束色 Color | color | — | #b0d4de |
| speed | 摆动速度 Speed | 0–0.7 | 0.01 | 0.08 |

## Three looks

### Cold stage / 冷光舞台

A restrained arrangement of cool beams.

```json
{}
```

### Amber theatre / 琥珀剧场

Warmer, more concentrated light.

```json
{
  "color": "#dfbc88",
  "opacity": 0.45,
  "intensity": 48,
  "spread": 1.4
}
```

### Wide softbox / 宽幅柔光

Broader, paler cones.

```json
{
  "color": "#bdcde5",
  "angle": 0.43,
  "spread": 2.5,
  "opacity": 0.2
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Transparent beam geometry aligned with SpotLights, not full volumetric scattering or shadow transport.

The standard scene path returns false from render(ctx); the host renders normally.
