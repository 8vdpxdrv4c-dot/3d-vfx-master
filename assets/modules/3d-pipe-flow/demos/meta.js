export const meta={
  "slug": "3d-pipe-flow",
  "effect": "pipe-luminous-current",
  "impl": "luminous-current.js",
  "name": "3D Pipe Flow",
  "zh": "管道流动",
  "category": "motion",
  "tagline": "Packets follow one readable tubular route.",
  "camera": [
    7,
    4.3,
    9
  ],
  "target": [
    0,
    1.4,
    0
  ],
  "topology": [
    "density",
    "radius"
  ],
  "schema": [
    {
      "key": "density",
      "label": "流点数量 Density",
      "min": 0.2,
      "max": 1.5,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "radius",
      "label": "管道半径 Radius",
      "min": 0.08,
      "max": 0.33,
      "step": 0.01,
      "default": 0.17
    },
    {
      "key": "spacing",
      "label": "流点间距 Spacing",
      "min": 0.5,
      "max": 2,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "opacity",
      "label": "管壁透明度 Opacity",
      "min": 0.1,
      "max": 0.65,
      "step": 0.01,
      "default": 0.26
    },
    {
      "key": "color",
      "label": "流体色 Color",
      "type": "color",
      "default": "#86d5d3"
    },
    {
      "key": "speed",
      "label": "流速 Speed",
      "min": 0,
      "max": 1.2,
      "step": 0.02,
      "default": 0.35
    }
  ],
  "looks": [
    {
      "id": "cool",
      "title": "Cooling line / 冷却管线",
      "hint": "A cool directional route.",
      "params": {}
    },
    {
      "id": "energy",
      "title": "Energy feed / 能量输送",
      "hint": "Warm faster packets.",
      "params": {
        "color": "#eab478",
        "speed": 0.8,
        "spacing": 1.4
      }
    },
    {
      "id": "circulate",
      "title": "Gentle circulation / 缓流",
      "hint": "A slower sparse route.",
      "params": {
        "color": "#9ed4b1",
        "speed": 0.15,
        "density": 0.45,
        "radius": 0.25
      }
    }
  ],
  "fitZh": "管线路径、方向提示和工业流向示意。",
  "limitZh": "管内预设路径上的点与方向标识，不求解压力、流量、湍流或管网。",
  "limit": "Authored packet motion, not pressure, flow rate, turbulence or a pipe-network solver."
};
