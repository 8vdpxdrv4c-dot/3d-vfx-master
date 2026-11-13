export const meta={
  "slug": "3d-data-trails",
  "effect": "motion-orbit-links",
  "impl": "orbit-links.js",
  "name": "3D Data Trails",
  "zh": "数据飞线",
  "category": "motion",
  "tagline": "Small packets connect a measured set of spatial anchors.",
  "camera": [
    7,
    4.6,
    9
  ],
  "target": [
    0,
    1.1,
    0
  ],
  "topology": [
    "density"
  ],
  "schema": [
    {
      "key": "density",
      "label": "连接数量 Density",
      "min": 0.3,
      "max": 1.5,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "height",
      "label": "弧线高度 Height",
      "min": 0.3,
      "max": 3,
      "step": 0.05,
      "default": 1.4
    },
    {
      "key": "opacity",
      "label": "飞线强度 Opacity",
      "min": 0.1,
      "max": 0.9,
      "step": 0.01,
      "default": 0.45
    },
    {
      "key": "size",
      "label": "流点尺寸 Size",
      "min": 0.02,
      "max": 0.13,
      "step": 0.005,
      "default": 0.055
    },
    {
      "key": "color",
      "label": "数据色 Color",
      "type": "color",
      "default": "#9ccbd6"
    },
    {
      "key": "speed",
      "label": "传输速度 Speed",
      "min": 0,
      "max": 1.5,
      "step": 0.02,
      "default": 0.45
    }
  ],
  "looks": [
    {
      "id": "blue",
      "title": "Blue network / 蓝色网络",
      "hint": "Arcs connect an abstract ring of nodes.",
      "params": {}
    },
    {
      "id": "fast",
      "title": "Low latency / 低延迟",
      "hint": "Lower, faster violet routes.",
      "params": {
        "color": "#b2a1dc",
        "height": 0.7,
        "speed": 1.1
      }
    },
    {
      "id": "high",
      "title": "High arcs / 高弧线",
      "hint": "Elevated slower amber connections.",
      "params": {
        "color": "#dbb584",
        "height": 2.5,
        "speed": 0.2,
        "density": 0.6
      }
    }
  ],
  "fitZh": "数据连接、网络示意和通路展示。",
  "limitZh": "示例锚点和预设路径，不接入真实网络指标，也不代表实际地理距离。",
  "limit": "Illustrative anchors and routes; no live network data or geographic-distance claims."
};
