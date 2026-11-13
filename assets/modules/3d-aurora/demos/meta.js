export const meta={
  "slug": "3d-aurora",
  "effect": "lighting-polar-ribbons",
  "impl": "polar-ribbons.js",
  "name": "3D Aurora",
  "zh": "极光幕帘",
  "category": "lighting",
  "tagline": "Layered curtains carry fine bands of atmospheric light.",
  "camera": [
    8,
    4.2,
    10
  ],
  "target": [
    0,
    1.9,
    0
  ],
  "schema": [
    {
      "key": "height",
      "label": "幕帘高度 Height",
      "min": 1,
      "max": 4.5,
      "step": 0.05,
      "default": 2.7
    },
    {
      "key": "wave",
      "label": "折叠幅度 Wave",
      "min": 0.1,
      "max": 2,
      "step": 0.02,
      "default": 0.8
    },
    {
      "key": "opacity",
      "label": "光幕强度 Opacity",
      "min": 0.1,
      "max": 1,
      "step": 0.01,
      "default": 0.65
    },
    {
      "key": "color",
      "label": "主光色 Color",
      "type": "color",
      "default": "#58c693"
    },
    {
      "key": "highlight",
      "label": "边缘色 Highlight",
      "type": "color",
      "default": "#a68bc9"
    },
    {
      "key": "speed",
      "label": "演化速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.22
    }
  ],
  "looks": [
    {
      "id": "emerald",
      "title": "Emerald veil / 翡翠幕帘",
      "hint": "Green curtains with violet edges.",
      "params": {
        "variant": 0
      }
    },
    {
      "id": "rose",
      "title": "Solar rose / 玫瑰光幕",
      "hint": "Warm magenta bands.",
      "params": {
        "variant": 1,
        "color": "#dc83a9",
        "highlight": "#e8bd87"
      }
    },
    {
      "id": "arctic",
      "title": "Arctic blue / 北极蓝",
      "hint": "Cool folded blue ribbons.",
      "params": {
        "variant": 2,
        "color": "#699ee0",
        "highlight": "#7ee1cc"
      }
    }
  ],
  "fitZh": "极光外观、天空气氛和柔和发光幕帘。",
  "limitZh": "有边界的发光网格，不是磁层、电离层或大气辐射模拟。",
  "limit": "Bounded emissive geometry, not a magnetosphere or atmospheric transport model."
};
