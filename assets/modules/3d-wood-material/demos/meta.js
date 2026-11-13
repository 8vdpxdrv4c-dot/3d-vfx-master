export const meta={
  "slug": "3d-wood-material",
  "effect": "shader-wood-material",
  "name": "Grain Atelier",
  "zh": "程序化木纹材质",
  "category": "shaders",
  "sourceId": "batch02-07",
  "tagline": "Grain follows the face, the cut and the turned silhouette.",
  "camera": [
    6,
    3.8,
    7.5
  ],
  "target": [
    0,
    1.2,
    0
  ],
  "schema": [
    {
      "key": "grain",
      "label": "纹理频率 Grain",
      "min": 3,
      "max": 18,
      "step": 0.2,
      "default": 9
    },
    {
      "key": "knot",
      "label": "节疤扰动 Knot",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.5
    },
    {
      "key": "roughness",
      "label": "粗糙度 Roughness",
      "min": 0.15,
      "max": 1,
      "step": 0.01,
      "default": 0.46
    },
    {
      "key": "finish",
      "label": "涂层 Finish",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.45
    },
    {
      "key": "color",
      "label": "木材底色 Color",
      "type": "color",
      "default": "#bd8d57"
    },
    {
      "key": "spin",
      "label": "旋转速度 Spin",
      "min": 0,
      "max": 0.6,
      "step": 0.01,
      "default": 0.09
    }
  ],
  "looks": [
    {
      "id": "oak",
      "title": "Oak Vessel / 橡木",
      "hint": "A turned vessel with readable end grain.",
      "params": {
        "variant": 0,
        "color": "#ba8f5a",
        "grain": 9,
        "knot": 0.25
      }
    },
    {
      "id": "walnut",
      "title": "Walnut Blocks / 胡桃木",
      "hint": "Cross-cut blocks in a compact composition.",
      "params": {
        "variant": 1,
        "color": "#79513a",
        "grain": 12,
        "knot": 0.65
      }
    },
    {
      "id": "cedar",
      "title": "Cedar Arc / 雪松",
      "hint": "A rising bent-laminate arc.",
      "params": {
        "variant": 2,
        "color": "#bf7753",
        "grain": 7,
        "knot": 0.4
      }
    }
  ],
  "fit": "Wood finishes, material inspection and procedural product forms.",
  "limit": "Generated appearance maps; not species identification or measured wood optics."
};
