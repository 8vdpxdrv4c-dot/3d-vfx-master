export const meta={
  "slug": "3d-scroll-scenes",
  "effect": "motion-scroll-scenes",
  "name": "Scroll Chapters",
  "zh": "滚动驱动三维场景",
  "category": "motion",
  "sourceId": "batch02-12",
  "tagline": "Native scroll conducts a small three-dimensional story.",
  "camera": [
    7,
    4.2,
    9
  ],
  "target": [
    0,
    1,
    0
  ],
  "cameraOwner": true,
  "schema": [
    {
      "key": "progress",
      "label": "叙事进度 Progress",
      "min": 0,
      "max": 1,
      "step": 0.001,
      "default": 0.32
    },
    {
      "key": "follow",
      "label": "镜头跟随 Follow",
      "type": "boolean",
      "default": true
    },
    {
      "key": "spacing",
      "label": "章节间距 Spacing",
      "min": 0.8,
      "max": 2,
      "step": 0.02,
      "default": 1.25
    },
    {
      "key": "reveal",
      "label": "入场幅度 Reveal",
      "min": 0,
      "max": 2,
      "step": 0.02,
      "default": 0.7
    },
    {
      "key": "color",
      "label": "章节色 Color",
      "type": "color",
      "default": "#a9ba93"
    }
  ],
  "looks": [
    {
      "id": "orbit",
      "title": "Orbital Chapters / 轨道",
      "hint": "Three objects form a measured orbital sequence.",
      "params": {
        "variant": 0,
        "color": "#a9c4b9",
        "progress": 0.32
      }
    },
    {
      "id": "vertical",
      "title": "Vertical Chapters / 纵向",
      "hint": "A tiered ascent through sculptural forms.",
      "params": {
        "variant": 1,
        "color": "#cca875",
        "progress": 0.55
      }
    },
    {
      "id": "ribbon",
      "title": "Ribbon Chapters / 丝带",
      "hint": "A diagonal ribbon carries the story.",
      "params": {
        "variant": 2,
        "color": "#9bb3d8",
        "progress": 0.65
      }
    }
  ],
  "fit": "Web product stories, scroll progress adapters and camera-led presentations.",
  "limit": "Native scroll-to-progress mapping and authored transforms. No GSAP/Lenis dependency; not a complete website or a physics simulation."
};
