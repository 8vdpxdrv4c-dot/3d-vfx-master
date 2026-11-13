# Machined Light parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| roughness | 表面粗糙度 Roughness | 0.07–0.9 | 0.01 | 0.24 |
| brush | 拉丝强度 Brush | 0–1 | 0.01 | 0.55 |
| patina | 氧化覆盖 Patina | 0–1 | 0.01 | 0.12 |
| color | 金属色 Tint | color | — | #c8ab75 |
| spin | 转台速度 Spin | 0–1 | 0.01 | 0.12 |

## Looks

### Brass Assembly / 黄铜

Warm rings, a dark core and fine radial marks.

```json
{
  "variant": 0,
  "color": "#c6a569",
  "roughness": 0.25,
  "patina": 0.07
}
```

### Titanium Stack / 钛银

A satin stack with narrow polished shoulders.

```json
{
  "variant": 1,
  "color": "#aebdc6",
  "roughness": 0.19,
  "brush": 0.8,
  "patina": 0
}
```

### Aged Copper / 古铜

A broad ring with restrained oxidation.

```json
{
  "variant": 2,
  "color": "#bf7954",
  "roughness": 0.39,
  "patina": 0.65
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. An authored PBR study with generated maps and studio cards; not measured spectral metal data.



