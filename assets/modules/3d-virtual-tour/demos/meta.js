export const meta={
  "slug": "3d-virtual-tour",
  "effect": "motion-virtual-tour",
  "name": "Quiet Museum",
  "zh": "三维空间导览",
  "category": "motion",
  "sourceId": "batch02-08",
  "tagline": "A route through an open museum, with one camera owner.",
  "camera": [
    9,
    7,
    11
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
      "label": "路线位置 Progress",
      "min": 0,
      "max": 1,
      "step": 0.001,
      "default": 0
    },
    {
      "key": "mode",
      "label": "相机模式 Mode",
      "options": [
        "tour",
        "orbit"
      ],
      "default": "tour"
    },
    {
      "key": "speed",
      "label": "巡游速度 Speed",
      "min": 0,
      "max": 0.2,
      "step": 0.001,
      "default": 0.018
    },
    {
      "key": "height",
      "label": "视点高度 Height",
      "min": 0.7,
      "max": 2.7,
      "step": 0.01,
      "default": 1.55
    },
    {
      "key": "accent",
      "label": "展品颜色 Accent",
      "type": "color",
      "default": "#bca16d"
    }
  ],
  "looks": [
    {
      "id": "arrival",
      "title": "Arrival / 入馆",
      "hint": "Approach the open hall and its first exhibit.",
      "params": {
        "route": 0,
        "progress": 0
      }
    },
    {
      "id": "gallery",
      "title": "Gallery / 展廊",
      "hint": "Move between open-sided exhibition bays.",
      "params": {
        "route": 1,
        "progress": 0.34
      }
    },
    {
      "id": "overview",
      "title": "Overview / 俯览",
      "hint": "A slower aerial route around the canopy.",
      "params": {
        "route": 2,
        "progress": 0.52,
        "height": 2.1
      }
    }
  ],
  "fit": "Editable museum and showroom walkthroughs, route navigation and orbit handoff.",
  "limit": "Authored obstacle-free routes through a fictional procedural museum; no collision/navigation mesh solver."
};
