# 3D Galaxy parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 星点数量 Density | 0.25–1.6 | 0.05 | 1 |
| arms | 旋臂数量 Arms | 2–8 | 1 | 4 |
| twist | 旋臂卷曲 Twist | 0.2–1.8 | 0.02 | 0.9 |
| thickness | 盘面厚度 Thickness | 0.03–0.6 | 0.01 | 0.18 |
| color | 外缘色 Color | color | — | #8daaca |
| spin | 自转速度 Spin | 0–0.4 | 0.01 | 0.04 |

## Three looks

### Spiral blue / 蓝色旋臂

A warm core with cool outer stars.

```json
{}
```

### Violet whirl / 紫色旋涡

Six tighter arms.

```json
{
  "color": "#b7a1d0",
  "arms": 6,
  "twist": 1.4
}
```

### Quiet barred / 舒展旋臂

An open two-arm composition.

```json
{
  "color": "#dab792",
  "arms": 2,
  "twist": 0.4,
  "density": 0.6
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. An authored point field, not a measured catalog, N-body simulation or reconstruction of a real galaxy.

The standard scene path returns false from render(ctx); the host renders normally.
