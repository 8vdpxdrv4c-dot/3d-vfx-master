# 排水管喷水参数 / Drain Spout parameters

| key | 中英名称 | 范围 | step | 默认值 |
| --- | --- | --- | --- | --- |
| flow | 出水速度 Flow | 0.65–1.7 | 0.025 | 1 |
| radius | 出水半径 Radius | 0.18–0.45 | 0.01 | 0.4 |
| height | 管口高度 Height | 1.3–2.6 | 0.05 | 2 |
| ripple | 波纹幅度 Ripple | 0.005–0.05 | 0.001 | 0.025 |
| exposure | 画面曝光 Exposure | 0.7–2.3 | 0.05 | 1.5 |
| speed | 动画速度 Speed | 0–1.8 | 0.05 | 1 |

flow 是示意场景中的水平出水速度；height 和 radius 使用该示意场景的相对长度。它们不是校准的现实 m/s 或 m。ripple 为距离场表面的扰动幅度；exposure 为最终色调映射前的曝光系数；speed 是动画时间倍率。内部加速度沿用输入代码的 -1 场景单位，涟漪中心随 sqrt(2 × height) × flow 联动。该关系用于视觉轨迹，不构成完整流体模型。

## Looks

### Classic channel / 经典排水

A broad translucent jet over a masonry channel.

```json
{
  "flow": 1,
  "radius": 0.4,
  "height": 2,
  "ripple": 0.025,
  "exposure": 1.5,
  "speed": 1
}
```

### Gentle outflow / 柔和出水

A narrower, slower stream with restrained ripples.

```json
{
  "flow": 0.8,
  "radius": 0.23,
  "height": 1.65,
  "ripple": 0.012,
  "exposure": 1.3,
  "speed": 0.65
}
```

### Strong discharge / 强劲排水

A longer falling arc and a more active impact surface.

```json
{
  "flow": 1.35,
  "radius": 0.38,
  "height": 2.3,
  "ripple": 0.042,
  "exposure": 1.65,
  "speed": 1.25
}
```

## Rendering and controls

The low-power branch uses 16 march steps and omits the supplied high-quality AO/double-sided transparency branches. It retains the water surface, pipe, channel and reflection cues. Standard uses 32 steps. The demo caps resolution and uses a generated masonry texture instead of remote iChannel0 images.

Drag coordinates are normalized; releasing a pointer keeps the last view. Reset restores the first look, time zero and view. View resets only the view. Quality changes preserve time, look, parameters, pause state and view. Page visibility and intersection control rendering; reduced motion starts paused. This full-frame shader does not merge into another scene’s depth buffer.
