export const meta={
  "slug": "3d-grass",
  "effect": "vegetation-meadow-wind",
  "impl": "meadow-wind.js",
  "name": "3D Grass",
  "zh": "风动草地",
  "category": "vegetation",
  "tagline": "Tapered blades share one continuous wind signal.",
  "camera": [
    7,
    4.7,
    8.5
  ],
  "target": [
    0,
    0.35,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "density",
      "label": "草叶数量 Density",
      "min": 0.25,
      "max": 1.5,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "height",
      "label": "草叶高度 Height",
      "min": 0.3,
      "max": 1.4,
      "step": 0.02,
      "default": 0.75
    },
    {
      "key": "wind",
      "label": "风动幅度 Wind",
      "min": 0,
      "max": 1.3,
      "step": 0.02,
      "default": 0.4
    },
    {
      "key": "spread",
      "label": "草场宽度 Spread",
      "min": 3,
      "max": 6,
      "step": 0.1,
      "default": 5.3
    },
    {
      "key": "color",
      "label": "草尖色 Color",
      "type": "color",
      "default": "#a4c363"
    },
    {
      "key": "speed",
      "label": "风速 Speed",
      "min": 0,
      "max": 1.2,
      "step": 0.02,
      "default": 0.55
    }
  ],
  "looks": [
    {
      "id": "spring",
      "title": "Spring field / 春草",
      "hint": "A green field with restrained motion.",
      "params": {}
    },
    {
      "id": "gold",
      "title": "Golden meadow / 金色草甸",
      "hint": "Warm tips under a stronger breeze.",
      "params": {
        "color": "#d8be76",
        "wind": 0.8,
        "height": 1.1
      }
    },
    {
      "id": "moss",
      "title": "Quiet green / 苔绿色",
      "hint": "Short, quiet blades.",
      "params": {
        "color": "#75a393",
        "wind": 0.12,
        "height": 0.48
      }
    }
  ],
  "fitZh": "草坪、草甸外观和轻量风动背景。",
  "limitZh": "实例化草叶的解析弯曲，不是植物生长、生态或空气动力学求解。",
  "limit": "Instanced analytic blade bending, not botanical growth or aerodynamics."
};
