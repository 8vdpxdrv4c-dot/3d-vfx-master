# Quiet Museum parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 路线位置 Progress | 0–1 | 0.001 | 0 |
| mode | 相机模式 Mode | tour / orbit | — | tour |
| speed | 巡游速度 Speed | 0–0.2 | 0.001 | 0.018 |
| height | 视点高度 Height | 0.7–2.7 | 0.01 | 1.55 |
| accent | 展品颜色 Accent | color | — | #bca16d |

## Looks

### Arrival / 入馆

Approach the open hall and its first exhibit.

```json
{
  "route": 0,
  "progress": 0
}
```

### Gallery / 展廊

Move between open-sided exhibition bays.

```json
{
  "route": 1,
  "progress": 0.34
}
```

### Overview / 俯览

A slower aerial route around the canopy.

```json
{
  "route": 2,
  "progress": 0.52,
  "height": 2.1
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Authored obstacle-free routes through a fictional procedural museum; no collision/navigation mesh solver.

This module can own the camera. It saves the host pose and controls state, disables OrbitControls during route following, and restores them on dispose. Hand off with mode/follow; avoid simultaneous camera writers.

