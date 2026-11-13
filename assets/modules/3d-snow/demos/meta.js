export const meta={
  "slug": "3d-snow",
  "effect": "particles-snow-orbit",
  "impl": "snow-orbit.js",
  "name": "3D Snow",
  "zh": "飘雪空间",
  "category": "particles",
  "tagline": "Soft flakes drift through the depth of the scene.",
  "camera": [
    7,
    4.5,
    9
  ],
  "target": [
    0,
    1.7,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "density",
      "label": "雪片数量 Density",
      "min": 0.2,
      "max": 1.6,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "size",
      "label": "雪片尺寸 Size",
      "min": 0.025,
      "max": 0.17,
      "step": 0.005,
      "default": 0.065
    },
    {
      "key": "wind",
      "label": "横向风 Wind",
      "min": 0,
      "max": 2.5,
      "step": 0.05,
      "default": 0.45
    },
    {
      "key": "fall",
      "label": "下落速率 Fall",
      "min": 0.1,
      "max": 1,
      "step": 0.02,
      "default": 0.4
    },
    {
      "key": "opacity",
      "label": "雪片强度 Opacity",
      "min": 0.15,
      "max": 1,
      "step": 0.01,
      "default": 0.75
    },
    {
      "key": "speed",
      "label": "时间速度 Speed",
      "min": 0,
      "max": 1.2,
      "step": 0.02,
      "default": 0.5
    }
  ],
  "looks": [
    {
      "id": "blue",
      "title": "Blue hour / 蓝调时刻",
      "hint": "Small softly lit flakes.",
      "params": {}
    },
    {
      "id": "quiet",
      "title": "Quiet snowfall / 静雪",
      "hint": "Larger, slower flakes.",
      "params": {
        "size": 0.12,
        "density": 0.4,
        "wind": 0.1,
        "speed": 0.18
      }
    },
    {
      "id": "crosswind",
      "title": "Crosswind / 横风",
      "hint": "A denser slanted field.",
      "params": {
        "density": 1.3,
        "wind": 2.1,
        "size": 0.045,
        "speed": 0.8
      }
    }
  ],
  "fitZh": "冬季空间、景深雪片与天气背景。",
  "limitZh": "解析漂移与生成的雪片形状，不模拟堆积、融化或流体风场。",
  "limit": "Analytic drift and generated flake shapes; no accumulation, melting or fluid wind solver."
};
