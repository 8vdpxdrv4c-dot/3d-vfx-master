export const meta={
  "slug": "3d-metal-material",
  "effect": "shader-metal-material",
  "name": "Machined Light",
  "zh": "PBR 金属材质",
  "category": "shaders",
  "sourceId": "batch02-05",
  "tagline": "A machined object shaped by the reflections it holds.",
  "camera": [
    6.5,
    3.6,
    8
  ],
  "target": [
    0,
    1.2,
    0
  ],
  "schema": [
    {
      "key": "roughness",
      "label": "表面粗糙度 Roughness",
      "min": 0.07,
      "max": 0.9,
      "step": 0.01,
      "default": 0.24
    },
    {
      "key": "brush",
      "label": "拉丝强度 Brush",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.55
    },
    {
      "key": "patina",
      "label": "氧化覆盖 Patina",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.12
    },
    {
      "key": "color",
      "label": "金属色 Tint",
      "type": "color",
      "default": "#c8ab75"
    },
    {
      "key": "spin",
      "label": "转台速度 Spin",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.12
    }
  ],
  "looks": [
    {
      "id": "brass",
      "title": "Brass Assembly / 黄铜",
      "hint": "Warm rings, a dark core and fine radial marks.",
      "params": {
        "variant": 0,
        "color": "#c6a569",
        "roughness": 0.25,
        "patina": 0.07
      }
    },
    {
      "id": "titanium",
      "title": "Titanium Stack / 钛银",
      "hint": "A satin stack with narrow polished shoulders.",
      "params": {
        "variant": 1,
        "color": "#aebdc6",
        "roughness": 0.19,
        "brush": 0.8,
        "patina": 0
      }
    },
    {
      "id": "copper",
      "title": "Aged Copper / 古铜",
      "hint": "A broad ring with restrained oxidation.",
      "params": {
        "variant": 2,
        "color": "#bf7954",
        "roughness": 0.39,
        "patina": 0.65
      }
    }
  ],
  "fit": "Machined parts, metals, product turntables and finish comparisons.",
  "limit": "An authored PBR study with generated maps and studio cards; not measured spectral metal data."
};
