export const meta={
  "slug": "3d-rain",
  "effect": "particles-rain-volume",
  "impl": "rain-volume.js",
  "name": "3D Rain",
  "zh": "夜景雨幕",
  "category": "particles",
  "tagline": "Fine streaks pass through a three-dimensional stage.",
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
      "label": "雨滴数量 Density",
      "min": 0.2,
      "max": 1.6,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "wind",
      "label": "横向风 Wind",
      "min": -1.2,
      "max": 1.2,
      "step": 0.05,
      "default": 0.1
    },
    {
      "key": "length",
      "label": "雨线长度 Length",
      "min": 0.12,
      "max": 0.75,
      "step": 0.01,
      "default": 0.38
    },
    {
      "key": "width",
      "label": "雨线宽度 Width",
      "min": 0.006,
      "max": 0.045,
      "step": 0.001,
      "default": 0.014
    },
    {
      "key": "opacity",
      "label": "可见强度 Opacity",
      "min": 0.15,
      "max": 0.9,
      "step": 0.01,
      "default": 0.55
    },
    {
      "key": "speed",
      "label": "下落速度 Speed",
      "min": 0,
      "max": 1.4,
      "step": 0.02,
      "default": 0.55
    }
  ],
  "looks": [
    {
      "id": "night",
      "title": "Night rainfall / 夜雨",
      "hint": "Fine, nearly vertical streaks.",
      "params": {}
    },
    {
      "id": "driving",
      "title": "Driving rain / 斜雨",
      "hint": "Heavier wind-driven rainfall.",
      "params": {
        "wind": 0.8,
        "density": 1.35,
        "length": 0.5,
        "speed": 0.8
      }
    },
    {
      "id": "drizzle",
      "title": "Light drizzle / 细雨",
      "hint": "Sparse, restrained rain.",
      "params": {
        "density": 0.35,
        "length": 0.2,
        "opacity": 0.4,
        "speed": 0.25
      }
    }
  ],
  "fitZh": "夜雨、场景天气和可调雨线。",
  "limitZh": "循环雨滴体积，不提供风场、积水、雨滴碰撞或湿面求解。",
  "limit": "Looping streak particles; no accumulation, droplet collision or wet-surface simulation."
};
