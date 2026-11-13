# Crystal Field parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| growth | 结霜进度 Growth | 0–1 | 0.01 | 0.82 |
| density | 晶体密度 Density | 0.25–1.4 | 0.05 | 1 |
| height | 冰晶高度 Height | 0.2–2 | 0.02 | 1 |
| fracture | 破碎程度 Fracture | 0–1 | 0.01 | 0 |
| color | 晶体色 Color | color | — | #a9d9e2 |
| speed | 呼吸速度 Speed | 0–1 | 0.01 | 0.2 |

## Looks

### Dendrite / 枝晶

A planar frost field with a small crystal center.

```json
{
  "variant": 0,
  "height": 0.7,
  "growth": 0.88
}
```

### Ice Crown / 冰冠

A raised ring of faceted crystals.

```json
{
  "variant": 1,
  "height": 1.4,
  "growth": 0.95
}
```

### Fracture Study / 碎裂

Crystals part into authored faceted pieces.

```json
{
  "variant": 2,
  "height": 1.1,
  "fracture": 0.72,
  "growth": 1
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Authored branching and rigid fragment motion. No dendrite diffusion, fracture mechanics, thermal or refraction solver.



