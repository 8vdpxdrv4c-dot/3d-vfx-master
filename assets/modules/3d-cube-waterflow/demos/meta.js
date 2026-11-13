export const meta={
  "slug": "3d-cube-waterflow",
  "effect": "cube-water-stream",
  "impl": "cube-water-stream.js",
  "name": "Clear Cube Waterflow",
  "zh": "立方体清透流水",
  "category": "fluid-gas",
  "tagline": "透明立方储水体、金属管口、清透水束与自然落水涟漪。",
  "camera": [
    6.5,
    4.5,
    7.5
  ],
  "target": [
    0.1,
    1.05,
    0
  ],
  "cameraOwner": false,
  "schema": [
    {
      "key": "flow",
      "label": "出水量",
      "min": 0,
      "max": 1.5,
      "step": 0.05,
      "default": 1,
      "hint": "改变水束粗细与飞溅数量",
      "unit": "×"
    },
    {
      "key": "pressure",
      "label": "喷射力度",
      "min": 0.55,
      "max": 1.65,
      "step": 0.05,
      "default": 1,
      "hint": "改变水束向外延伸的距离",
      "unit": "×"
    },
    {
      "key": "level",
      "label": "立方体水位",
      "min": 0.55,
      "max": 0.9,
      "step": 0.01,
      "default": 0.74,
      "hint": "独立调整储水体中的展示水位",
      "unit": "%"
    },
    {
      "key": "waves",
      "label": "水面扰动",
      "min": 0.1,
      "max": 1.5,
      "step": 0.05,
      "default": 0.65,
      "hint": "改变水面波纹和落水涟漪",
      "unit": "×"
    },
    {
      "key": "color",
      "label": "水体颜色",
      "type": "color",
      "default": "#68ccdc"
    }
  ],
  "looks": [
    {
      "id": "steady",
      "title": "Steady flow / 平稳出水",
      "shortTitle": "平稳",
      "hint": "清透连续水束与克制飞溅。",
      "params": {
        "flow": 1,
        "pressure": 1,
        "level": 0.74,
        "waves": 0.65,
        "color": "#68ccdc"
      }
    },
    {
      "id": "full",
      "title": "Full flow / 充沛出水",
      "shortTitle": "充沛",
      "hint": "更粗水束、更远射程和更强扰动。",
      "params": {
        "flow": 1.45,
        "pressure": 1.3,
        "level": 0.88,
        "waves": 1.15,
        "color": "#68ccdc"
      }
    },
    {
      "id": "gentle",
      "title": "Gentle flow / 涓细水流",
      "shortTitle": "涓细",
      "hint": "低流量、轻飞溅与柔和涟漪。",
      "params": {
        "flow": 0.35,
        "pressure": 0.65,
        "level": 0.62,
        "waves": 0.25,
        "color": "#9dbfed"
      }
    }
  ],
  "fitZh": "立方储水箱、管道出水、透明水流、飞溅与池面涟漪的交互展示。",
  "limitZh": "解析水束、重力水滴和局部波包构成的艺术化可视化；不是 CFD。水位独立调节，不模拟储水体排空和质量守恒。"
};
