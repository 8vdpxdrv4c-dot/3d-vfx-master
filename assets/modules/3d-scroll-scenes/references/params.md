# Scroll Chapters parameters

Generated from the exact module guiSchema. Scene units are illustrative.

| key | Label | Range / options | Step | Default |
| --- | --- | --- | --- | --- |
| progress | 叙事进度 Progress | 0–1 | 0.001 | 0.32 |
| follow | 镜头跟随 Follow | boolean | — | true |
| spacing | 章节间距 Spacing | 0.8–2 | 0.02 | 1.25 |
| reveal | 入场幅度 Reveal | 0–2 | 0.02 | 0.7 |
| color | 章节色 Color | color | — | #a9ba93 |

## Looks

### Orbital Chapters / 轨道

Three objects form a measured orbital sequence.

```json
{
  "variant": 0,
  "color": "#a9c4b9",
  "progress": 0.32
}
```

### Vertical Chapters / 纵向

A tiered ascent through sculptural forms.

```json
{
  "variant": 1,
  "color": "#cca875",
  "progress": 0.55
}
```

### Ribbon Chapters / 丝带

A diagonal ribbon carries the story.

```json
{
  "variant": 2,
  "color": "#9bb3d8",
  "progress": 0.65
}
```

## Tuning and boundaries

Start from the first look. Vary one control at a time. Zero speed/spin freezes that automatic motion; the preview Pause freezes all updates. ?low selects the reduced budget. Native scroll-to-progress mapping and authored transforms. No GSAP/Lenis dependency; not a complete website or a physics simulation.

This module can own the camera. It saves the host pose and controls state, disables OrbitControls during route following, and restores them on dispose. Hand off with mode/follow; avoid simultaneous camera writers.

