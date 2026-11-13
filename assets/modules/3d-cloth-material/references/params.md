# Woven Form parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| fold | 褶皱深度 Fold | 0–1.2 | 0.01 | 0.48 |
| weave | 织纹尺度 Weave | 0.4–2.4 | 0.05 | 1 |
| sheen | 柔光 Sheen | 0–1 | 0.01 | 0.7 |
| roughness | 粗糙度 Roughness | 0.15–1 | 0.01 | 0.75 |
| color | 染色 Color | color | — | #b6a797 |
| speed | 摆动速度 Speed | 0–1.5 | 0.01 | 0.4 |

## Looks

### Linen Screen / 亚麻

A suspended panel with soft, irregular folds.

```json
{
  "variant": 0,
  "color": "#b8aa96",
  "sheen": 0.35,
  "roughness": 0.85,
  "fold": 0.42
}
```

### Satin Ribbon / 缎带

A narrow, twisting ribbon in cool light.

```json
{
  "variant": 1,
  "color": "#60868d",
  "sheen": 1,
  "roughness": 0.27,
  "fold": 0.75
}
```

### Canvas Drape / 帆布

A heavy folded sheet over a low support.

```json
{
  "variant": 2,
  "color": "#b67a50",
  "sheen": 0.3,
  "roughness": 0.93,
  "fold": 0.6
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Parametric folds with procedural weave. No cloth collision, stress or textile measurement claim.



