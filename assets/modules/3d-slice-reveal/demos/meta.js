export const meta={
  "slug": "3d-slice-reveal",
  "effect": "shader-solid-section",
  "impl": "solid-section.js",
  "name": "3D Slice Reveal",
  "zh": "切面显现",
  "category": "shaders",
  "tagline": "One plane reveals the surface in a deliberate progression.",
  "camera": [
    6,
    4.2,
    8
  ],
  "target": [
    0,
    1.5,
    0
  ],
  "schema": [
    {
      "key": "progress",
      "label": "剖切进度 Progress",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.6
    },
    {
      "key": "tilt",
      "label": "剖面倾角 Tilt",
      "min": -0.7,
      "max": 0.7,
      "step": 0.02,
      "default": 0.08
    },
    {
      "key": "animate",
      "label": "自动扫描 Animate",
      "type": "boolean",
      "default": true
    },
    {
      "key": "speed",
      "label": "扫描速度 Speed",
      "min": 0,
      "max": 0.7,
      "step": 0.01,
      "default": 0.18
    },
    {
      "key": "color",
      "label": "模型色 Color",
      "type": "color",
      "default": "#89c5cb"
    }
  ],
  "looks": [
    {
      "id": "cyan",
      "title": "Cyan section / 青色剖切",
      "hint": "A slowly rising reveal.",
      "params": {
        "variant": 0
      }
    },
    {
      "id": "static",
      "title": "Static sphere / 静态球截面",
      "hint": "A fixed section through a sphere.",
      "params": {
        "variant": 1,
        "animate": false,
        "progress": 0.56
      }
    },
    {
      "id": "amber",
      "title": "Amber facets / 琥珀切面",
      "hint": "A warm faceted surface.",
      "params": {
        "variant": 2,
        "color": "#dcbc8d",
        "speed": 0.13
      }
    }
  ],
  "fitZh": "产品剖切、渐进显现和结构外观观察。",
  "limitZh": "裁剪网格表面，截面不自动封口；不代表真实内部结构或 CT 数据。",
  "limit": "Surface clipping with open cut edges, not internal volumetric structure or CT data."
};
