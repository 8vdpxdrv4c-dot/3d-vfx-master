export const meta={
  "slug": "3d-architecture-growth",
  "effect": "motion-architecture-growth",
  "name": "Assembly House",
  "zh": "建筑逐件生长",
  "category": "motion",
  "sourceId": "batch02-01",
  "tagline": "A building assembled in measured layers.",
  "camera": [
    8,
    6,
    9
  ],
  "target": [
    0,
    1.2,
    0
  ],
  "schema": [
    {
      "key": "progress",
      "label": "建造进度 Progress",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.76
    },
    {
      "key": "lift",
      "label": "入场高度 Lift",
      "min": 0,
      "max": 5,
      "step": 0.05,
      "default": 1.8
    },
    {
      "key": "stagger",
      "label": "层次错峰 Stagger",
      "min": 0.05,
      "max": 0.8,
      "step": 0.01,
      "default": 0.28
    },
    {
      "key": "speed",
      "label": "循环速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.13
    },
    {
      "key": "accent",
      "label": "构件颜色 Accent",
      "type": "color",
      "default": "#c8a475"
    }
  ],
  "looks": [
    {
      "id": "courtyard",
      "title": "Courtyard / 庭院",
      "hint": "An open colonnade, roof ribs and sun fins.",
      "params": {
        "variant": 0,
        "progress": 0.88,
        "accent": "#c7a67b"
      }
    },
    {
      "id": "terraces",
      "title": "Terraces / 叠台",
      "hint": "Stepped floors with copper rails.",
      "params": {
        "variant": 1,
        "progress": 0.82,
        "accent": "#a9c0bb"
      }
    },
    {
      "id": "atrium",
      "title": "Atrium / 中庭",
      "hint": "An airy frame with a raised canopy.",
      "params": {
        "variant": 2,
        "progress": 0.9,
        "accent": "#c98664"
      }
    }
  ],
  "limit": "An authored architectural assembly illustration, not structural analysis or a historically reconstructed building.",
  "fit": "Architecture reveals, procedural building intros and editable assembly timelines."
};
