export const meta={
  "slug": "3d-iridescent-bubbles",
  "effect": "materials-prism-bubbles",
  "impl": "prism-bubbles.js",
  "name": "3D Iridescent Bubbles",
  "zh": "虹彩气泡",
  "category": "materials",
  "tagline": "Thin-film color crosses a drifting cluster of shells.",
  "camera": [
    6,
    4.2,
    8
  ],
  "target": [
    0,
    1.8,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "density",
      "label": "气泡数量 Density",
      "min": 0.3,
      "max": 1.5,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "film",
      "label": "膜厚 Film",
      "min": 180,
      "max": 850,
      "step": 5,
      "default": 420
    },
    {
      "key": "roughness",
      "label": "粗糙度 Roughness",
      "min": 0.02,
      "max": 0.35,
      "step": 0.01,
      "default": 0.06
    },
    {
      "key": "drift",
      "label": "漂浮幅度 Drift",
      "min": 0,
      "max": 0.7,
      "step": 0.01,
      "default": 0.2
    },
    {
      "key": "color",
      "label": "气泡底色 Color",
      "type": "color",
      "default": "#d9edf0"
    },
    {
      "key": "speed",
      "label": "时间速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.02,
      "default": 0.35
    }
  ],
  "looks": [
    {
      "id": "pearl",
      "title": "Pearl shells / 珍珠壳",
      "hint": "Fine colored reflections.",
      "params": {}
    },
    {
      "id": "gold",
      "title": "Golden film / 金色薄膜",
      "hint": "A thicker warm interference finish.",
      "params": {
        "film": 730,
        "color": "#ead6bd",
        "roughness": 0.1
      }
    },
    {
      "id": "cold",
      "title": "Cold droplets / 冷色液滴",
      "hint": "Fewer blue-tinted shells.",
      "params": {
        "film": 250,
        "color": "#c2dfed",
        "density": 0.5
      }
    }
  ],
  "fitZh": "泡泡、薄膜外观和虹彩材质展示。",
  "limitZh": "Three.js 虹彩材质与预设漂移，不提供液膜动力学、破裂或碰撞。",
  "limit": "Three.js iridescent materials and authored drift; no membrane dynamics, bursting or collisions."
};
