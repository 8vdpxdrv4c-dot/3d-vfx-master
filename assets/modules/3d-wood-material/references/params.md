# Grain Atelier parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| grain | 纹理频率 Grain | 3–18 | 0.2 | 9 |
| knot | 节疤扰动 Knot | 0–1 | 0.01 | 0.5 |
| roughness | 粗糙度 Roughness | 0.15–1 | 0.01 | 0.46 |
| finish | 涂层 Finish | 0–1 | 0.01 | 0.45 |
| color | 木材底色 Color | color | — | #bd8d57 |
| spin | 旋转速度 Spin | 0–0.6 | 0.01 | 0.09 |

## Looks

### Oak Vessel / 橡木

A turned vessel with readable end grain.

```json
{
  "variant": 0,
  "color": "#ba8f5a",
  "grain": 9,
  "knot": 0.25
}
```

### Walnut Blocks / 胡桃木

Cross-cut blocks in a compact composition.

```json
{
  "variant": 1,
  "color": "#79513a",
  "grain": 12,
  "knot": 0.65
}
```

### Cedar Arc / 雪松

A rising bent-laminate arc.

```json
{
  "variant": 2,
  "color": "#bf7753",
  "grain": 7,
  "knot": 0.4
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Generated appearance maps; not species identification or measured wood optics.



