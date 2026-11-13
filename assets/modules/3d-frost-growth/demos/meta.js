export const meta={
  "slug": "3d-frost-growth",
  "effect": "vfx-frost-growth",
  "name": "Crystal Field",
  "zh": "冰霜生长与破碎",
  "category": "vfx",
  "sourceId": "batch02-10",
  "tagline": "Dendritic lines spread; faceted crystals rise, separate and settle.",
  "camera": [
    6,
    5.5,
    8
  ],
  "target": [
    0,
    0.8,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "growth",
      "label": "结霜进度 Growth",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.82
    },
    {
      "key": "density",
      "label": "晶体密度 Density",
      "min": 0.25,
      "max": 1.4,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "height",
      "label": "冰晶高度 Height",
      "min": 0.2,
      "max": 2,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "fracture",
      "label": "破碎程度 Fracture",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0
    },
    {
      "key": "color",
      "label": "晶体色 Color",
      "type": "color",
      "default": "#a9d9e2"
    },
    {
      "key": "speed",
      "label": "呼吸速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.2
    }
  ],
  "looks": [
    {
      "id": "dendrite",
      "title": "Dendrite / 枝晶",
      "hint": "A planar frost field with a small crystal center.",
      "params": {
        "variant": 0,
        "height": 0.7,
        "growth": 0.88
      }
    },
    {
      "id": "crown",
      "title": "Ice Crown / 冰冠",
      "hint": "A raised ring of faceted crystals.",
      "params": {
        "variant": 1,
        "height": 1.4,
        "growth": 0.95
      }
    },
    {
      "id": "fracture",
      "title": "Fracture Study / 碎裂",
      "hint": "Crystals part into authored faceted pieces.",
      "params": {
        "variant": 2,
        "height": 1.1,
        "fracture": 0.72,
        "growth": 1
      }
    }
  ],
  "fit": "Frost spreads, crystal studies and controllable frozen-surface transitions.",
  "limit": "Authored branching and rigid fragment motion. No dendrite diffusion, fracture mechanics, thermal or refraction solver."
};
