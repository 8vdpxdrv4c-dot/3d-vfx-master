# Fiber Sheet parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| fiber | 纤维强度 Fiber | 0–1 | 0.01 | 0.55 |
| curl | 卷角幅度 Curl | 0–1.5 | 0.01 | 0.55 |
| thickness | 纸层厚度 Thickness | 0.002–0.06 | 0.002 | 0.018 |
| roughness | 粗糙度 Roughness | 0.25–1 | 0.01 | 0.85 |
| color | 纸张色 Color | color | — | #dfd2b3 |
| speed | 呼吸速度 Speed | 0–1 | 0.01 | 0.18 |

## Looks

### Ivory Fold / 象牙

A floating sheet with a folded upper corner.

```json
{
  "variant": 0,
  "color": "#e3d7bb",
  "curl": 0.45
}
```

### Kraft Roll / 牛皮纸

Warm fibers and a stronger edge curl.

```json
{
  "variant": 1,
  "color": "#aa7e4e",
  "curl": 0.85
}
```

### Dyed Paper / 靛纸

A pale edge around a dense blue face.

```json
{
  "variant": 2,
  "color": "#61889b",
  "curl": 0.65,
  "fiber": 0.8
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. A layered procedural paper illustration. No fiber mechanics or physically solved transmission.



