export const meta={
  "slug": "3d-falling-leaves",
  "effect": "particles-falling-leaves",
  "name": "Turning Leaves",
  "zh": "空间落叶",
  "category": "particles",
  "sourceId": "batch02-02",
  "tagline": "Every leaf has a front, an edge and a turning back.",
  "camera": [
    7,
    4.6,
    8
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
      "label": "叶片数量 Density",
      "min": 0.2,
      "max": 1.5,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "wind",
      "label": "横向风 Wind",
      "min": 0,
      "max": 2.5,
      "step": 0.05,
      "default": 0.7
    },
    {
      "key": "fall",
      "label": "下落速率 Fall",
      "min": 0.1,
      "max": 2,
      "step": 0.05,
      "default": 0.65
    },
    {
      "key": "tumble",
      "label": "翻转幅度 Tumble",
      "min": 0,
      "max": 2,
      "step": 0.05,
      "default": 0.8
    },
    {
      "key": "color",
      "label": "叶片底色 Color",
      "type": "color",
      "default": "#d68f36"
    },
    {
      "key": "speed",
      "label": "时间速度 Speed",
      "min": 0,
      "max": 1.5,
      "step": 0.05,
      "default": 0.55
    }
  ],
  "looks": [
    {
      "id": "amber",
      "title": "Amber Drift / 琥珀",
      "hint": "Copper leaves tumble across a quiet stage.",
      "params": {
        "color": "#d69238",
        "wind": 0.65,
        "tumble": 0.8
      }
    },
    {
      "id": "olive",
      "title": "Olive Breeze / 橄榄",
      "hint": "Longer green leaves in a crosswind.",
      "params": {
        "color": "#899a55",
        "wind": 1.3,
        "variant": 1
      }
    },
    {
      "id": "crimson",
      "title": "Crimson Spiral / 绯红",
      "hint": "Broad leaves trace a loose spiral.",
      "params": {
        "color": "#b54e42",
        "wind": 0.9,
        "tumble": 1.4,
        "variant": 2
      }
    }
  ],
  "fit": "Seasonal inserts, nature loops and spatial particle backgrounds.",
  "limit": "Analytic looping trajectories; no aerodynamic or leaf collision solver."
};
