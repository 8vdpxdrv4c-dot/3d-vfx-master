# Assembly House parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 建造进度 Progress | 0–1 | 0.01 | 0.76 |
| lift | 入场高度 Lift | 0–5 | 0.05 | 1.8 |
| stagger | 层次错峰 Stagger | 0.05–0.8 | 0.01 | 0.28 |
| speed | 循环速度 Speed | 0–1 | 0.01 | 0.13 |
| accent | 构件颜色 Accent | color | — | #c8a475 |

## Looks

### Courtyard / 庭院

An open colonnade, roof ribs and sun fins.

```json
{
  "variant": 0,
  "progress": 0.88,
  "accent": "#c7a67b"
}
```

### Terraces / 叠台

Stepped floors with copper rails.

```json
{
  "variant": 1,
  "progress": 0.82,
  "accent": "#a9c0bb"
}
```

### Atrium / 中庭

An airy frame with a raised canopy.

```json
{
  "variant": 2,
  "progress": 0.9,
  "accent": "#c98664"
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. An authored architectural assembly illustration, not structural analysis or a historically reconstructed building.



