# Survey Reveal parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 扫描进度 Progress | 0–1 | 0.01 | 0.58 |
| band | 扫描带宽 Band | 0.03–0.7 | 0.01 | 0.28 |
| glow | 线框强度 Glow | 0.2–3 | 0.05 | 1.35 |
| color | 扫描色 Color | color | — | #75d8b0 |
| speed | 扫描速度 Speed | 0–0.4 | 0.005 | 0.045 |
| spin | 模型旋转 Spin | 0–0.5 | 0.01 | 0.08 |

## Looks

### Radial / 径向

A radial cage surveys the gimbal.

```json
{
  "variant": 0,
  "color": "#76dcb8"
}
```

### Vertical / 竖向

A plane builds the object from the base.

```json
{
  "variant": 1,
  "color": "#b3c5ed",
  "progress": 0.7
}
```

### Oblique / 斜向

An oblique band traverses topology.

```json
{
  "variant": 2,
  "color": "#e4b46f",
  "progress": 0.58
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. A geometric reveal mask and temporary wire overlay; not CT, tomography or measurement data.



