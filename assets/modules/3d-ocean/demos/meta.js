export const meta={
  "slug": "3d-ocean",
  "effect": "fluid-wave-sheet",
  "impl": "wave-sheet.js",
  "name": "3D Ocean",
  "zh": "流动水面",
  "category": "fluid-gas",
  "tagline": "A persistent water sheet carries ripples and a reflected form.",
  "camera": [
    7,
    4.8,
    9
  ],
  "target": [
    0,
    0.65,
    0
  ],
  "schema": [
    {
      "key": "distortion",
      "label": "波纹幅度 Distortion",
      "min": 0.15,
      "max": 3,
      "step": 0.05,
      "default": 1.2
    },
    {
      "key": "roughness",
      "label": "水面粗糙度 Roughness",
      "min": 0.08,
      "max": 0.8,
      "step": 0.01,
      "default": 0.3
    },
    {
      "key": "frequency",
      "label": "波纹频率 Frequency",
      "min": 0.5,
      "max": 2.8,
      "step": 0.05,
      "default": 1.2
    },
    {
      "key": "sun",
      "label": "光照方位 Sun",
      "min": -3.1,
      "max": 3.1,
      "step": 0.05,
      "default": 0.8
    },
    {
      "key": "color",
      "label": "水体色 Color",
      "type": "color",
      "default": "#315e6c"
    },
    {
      "key": "speed",
      "label": "时间速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.35
    }
  ],
  "looks": [
    {
      "id": "teal",
      "title": "Deep teal / 深青水面",
      "hint": "A cool reflecting pool.",
      "params": {}
    },
    {
      "id": "still",
      "title": "Still pool / 静水",
      "hint": "Quieter dark-blue water.",
      "params": {
        "distortion": 0.3,
        "speed": 0.12,
        "color": "#1a364e"
      }
    },
    {
      "id": "copper",
      "title": "Copper light / 暖光水面",
      "hint": "A warmer specular direction.",
      "params": {
        "sun": 2.3,
        "color": "#3b696e",
        "distortion": 2.2
      }
    }
  ],
  "fitZh": "水面、反射池、轻量海面外观。",
  "limitZh": "解析波面与平面反射近似，不是 CFD、海洋谱波、焦散或完整折射。",
  "limit": "Analytic waves and planar reflection, not CFD, spectral-ocean simulation or full refraction/caustics."
};
