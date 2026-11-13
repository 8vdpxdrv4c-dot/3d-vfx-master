export const meta={
  "slug": "3d-sparks",
  "effect": "particles-machining-sparks",
  "impl": "machining-sparks.js",
  "name": "3D Sparks",
  "zh": "工业火花",
  "category": "particles",
  "tagline": "Warm fragments follow restrained ballistic arcs.",
  "camera": [
    7,
    4.6,
    9
  ],
  "target": [
    0,
    1.6,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "density",
      "label": "粒子数量 Density",
      "min": 0.2,
      "max": 1.8,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "height",
      "label": "抛射高度 Height",
      "min": 0.6,
      "max": 4.2,
      "step": 0.05,
      "default": 2.5
    },
    {
      "key": "spread",
      "label": "横向扩散 Spread",
      "min": 0.25,
      "max": 2.2,
      "step": 0.05,
      "default": 0.8
    },
    {
      "key": "size",
      "label": "火花尺寸 Size",
      "min": 0.012,
      "max": 0.1,
      "step": 0.002,
      "default": 0.035
    },
    {
      "key": "color",
      "label": "火花色 Color",
      "type": "color",
      "default": "#ffc477"
    },
    {
      "key": "speed",
      "label": "时间速度 Speed",
      "min": 0,
      "max": 1.8,
      "step": 0.02,
      "default": 0.7
    }
  ],
  "looks": [
    {
      "id": "copper",
      "title": "Copper cascade / 铜色火花",
      "hint": "Tight warm arcs.",
      "params": {}
    },
    {
      "id": "machining",
      "title": "Cool machining / 冷色加工",
      "hint": "Fine blue fragments.",
      "params": {
        "color": "#8bd9f1",
        "height": 1.7,
        "spread": 1.1,
        "size": 0.025
      }
    },
    {
      "id": "embers",
      "title": "Floating embers / 漂浮余烬",
      "hint": "Slow, broadly scattered fragments.",
      "params": {
        "color": "#ff7950",
        "speed": 0.15,
        "height": 3.5,
        "spread": 1.5
      }
    }
  ],
  "fitZh": "加工火花、工业能量和克制的余烬效果。",
  "limitZh": "预设抛物线，不含燃烧、热传导或碰撞求解。",
  "limit": "Authored ballistic paths; no combustion, thermal transport or collision solver."
};
