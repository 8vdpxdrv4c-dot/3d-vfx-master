export const meta={
  "slug": "3d-plasma",
  "effect": "vfx-plasma-stream",
  "impl": "plasma-stream.js",
  "name": "3D Plasma",
  "zh": "等离子尾流",
  "category": "vfx",
  "tagline": "A narrow layered wake carries luminous filaments.",
  "camera": [
    7,
    3.7,
    9
  ],
  "target": [
    0,
    1.4,
    0
  ],
  "schema": [
    {
      "key": "width",
      "label": "尾流半径 Width",
      "min": 0.35,
      "max": 1.6,
      "step": 0.02,
      "default": 0.85
    },
    {
      "key": "glow",
      "label": "发光强度 Glow",
      "min": 0.25,
      "max": 2.8,
      "step": 0.05,
      "default": 1.4
    },
    {
      "key": "opacity",
      "label": "壳层透明度 Opacity",
      "min": 0.1,
      "max": 0.9,
      "step": 0.01,
      "default": 0.55
    },
    {
      "key": "flow",
      "label": "流速 Flow",
      "min": 0.2,
      "max": 2,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "color",
      "label": "尾流色 Color",
      "type": "color",
      "default": "#6da9e2"
    },
    {
      "key": "speed",
      "label": "时间速度 Speed",
      "min": 0,
      "max": 1.4,
      "step": 0.02,
      "default": 0.65
    }
  ],
  "looks": [
    {
      "id": "hot",
      "title": "Thermal wake / 热尾流",
      "hint": "A bright head and fine trailing filaments.",
      "params": {}
    },
    {
      "id": "quiet",
      "title": "Quiet wake / 平静尾流",
      "hint": "A softer low-intensity stream.",
      "params": {
        "glow": 0.65,
        "opacity": 0.35,
        "flow": 0.55
      }
    },
    {
      "id": "dense",
      "title": "Dense energy / 致密能量",
      "hint": "A concentrated cool luminous wake.",
      "params": {
        "glow": 2.2,
        "opacity": 0.8,
        "flow": 1.5,
        "color": "#8eabed"
      }
    }
  ],
  "fitZh": "能源、推进尾流与抽象等离子外观。",
  "limitZh": "解析发光壳层，不求解带电粒子、电磁流体或再入气动热。",
  "limit": "An authored emissive wake, not charged-particle dynamics or magnetohydrodynamics."
};
