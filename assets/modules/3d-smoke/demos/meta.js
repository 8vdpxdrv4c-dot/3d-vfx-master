export const meta={
  "slug": "3d-smoke",
  "effect": "particles-plume-field",
  "impl": "plume-field.js",
  "name": "3D Smoke",
  "zh": "工业烟雾",
  "category": "particles",
  "tagline": "A quiet rising column, shaped by a widening air field.",
  "camera": [
    7,
    4.2,
    9
  ],
  "target": [
    0,
    2.2,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "density",
      "label": "浓密度 Density",
      "min": 0.2,
      "max": 1.7,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "spread",
      "label": "扩散幅度 Spread",
      "min": 0.25,
      "max": 2.5,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "height",
      "label": "烟柱高度 Height",
      "min": 2,
      "max": 6,
      "step": 0.05,
      "default": 4.5
    },
    {
      "key": "opacity",
      "label": "不透明度 Opacity",
      "min": 0.08,
      "max": 0.9,
      "step": 0.01,
      "default": 0.5
    },
    {
      "key": "color",
      "label": "烟色 Color",
      "type": "color",
      "default": "#b3bac2"
    },
    {
      "key": "speed",
      "label": "升腾速度 Speed",
      "min": 0,
      "max": 1.8,
      "step": 0.02,
      "default": 0.65
    }
  ],
  "looks": [
    {
      "id": "stack",
      "title": "Industrial stack / 工业烟柱",
      "hint": "A soft grey column with a narrow base.",
      "params": {}
    },
    {
      "id": "ambient",
      "title": "Wide atmosphere / 大气扩散",
      "hint": "A wider, quieter plume.",
      "params": {
        "spread": 2.1,
        "opacity": 0.3,
        "speed": 0.25
      }
    },
    {
      "id": "column",
      "title": "Dense column / 致密烟柱",
      "hint": "A taller concentrated stream.",
      "params": {
        "spread": 0.55,
        "height": 5,
        "opacity": 0.72,
        "speed": 1.1
      }
    }
  ],
  "fitZh": "产品片、工业环境和可控烟柱。",
  "limitZh": "软粒子和解析流场示意，不是 CFD、体积缓存或真实烟气扩散预测。",
  "limit": "Analytic soft particles, not CFD, volumetric caches or dispersion prediction."
};
