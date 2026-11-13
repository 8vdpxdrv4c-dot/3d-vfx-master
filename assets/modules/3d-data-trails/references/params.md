# 3D Data Trails parameters

Generated from the module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| density | 连接数量 Density | 0.3–1.5 | 0.05 | 1 |
| height | 弧线高度 Height | 0.3–3 | 0.05 | 1.4 |
| opacity | 飞线强度 Opacity | 0.1–0.9 | 0.01 | 0.45 |
| size | 流点尺寸 Size | 0.02–0.13 | 0.005 | 0.055 |
| color | 数据色 Color | color | — | #9ccbd6 |
| speed | 传输速度 Speed | 0–1.5 | 0.02 | 0.45 |

## Three looks

### Blue network / 蓝色网络

Arcs connect an abstract ring of nodes.

```json
{}
```

### Low latency / 低延迟

Lower, faster violet routes.

```json
{
  "color": "#b2a1dc",
  "height": 0.7,
  "speed": 1.1
}
```

### High arcs / 高弧线

Elevated slower amber connections.

```json
{
  "color": "#dbb584",
  "height": 2.5,
  "speed": 0.2,
  "density": 0.6
}
```

## Tuning and limits

Start from the first look, vary one parameter at a time and compare at a fixed camera. Zero speed/spin freezes that motion; the preview Pause parks all effect updates and continuous redraws. Illustrative anchors and routes; no live network data or geographic-distance claims.

The standard scene path returns false from render(ctx); the host renders normally.
