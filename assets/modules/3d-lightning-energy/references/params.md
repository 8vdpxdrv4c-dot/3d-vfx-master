# Arc Chamber parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| energy | 发光强度 Energy | 0.2–3 | 0.05 | 1.35 |
| branches | 支路数量 Branches | 2–16 | 1 | 8 |
| reach | 弧线张幅 Reach | 0.3–2 | 0.02 | 1 |
| width | 弧线宽度 Width | 0.015–0.12 | 0.002 | 0.045 |
| color | 电弧色 Color | color | — | #84c5ff |
| speed | 演化速度 Speed | 0–1.5 | 0.02 | 0.65 |

## Looks

### Electrode Bridge / 电极桥

White-blue filaments span two dark terminals.

```json
{
  "variant": 0,
  "color": "#8ccaff",
  "reach": 1
}
```

### Orbital Coil / 环形线圈

An orbital cage around a suspended core.

```json
{
  "variant": 1,
  "color": "#90d9ce",
  "reach": 1.2
}
```

### Branch Array / 支路阵列

A controlled fan of branching channels.

```json
{
  "variant": 2,
  "color": "#b4a6ed",
  "branches": 12,
  "reach": 1.45
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Illustrative emissive ribbons, not an electrical field or plasma simulation. Brightness varies continuously; no strobe or impact-frame flashes.



