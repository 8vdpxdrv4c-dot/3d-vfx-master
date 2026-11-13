export const meta={
  "slug": "3d-galaxy",
  "effect": "particles-spiral-cluster",
  "impl": "spiral-cluster.js",
  "name": "3D Galaxy",
  "zh": "螺旋星系",
  "category": "particles",
  "tagline": "A luminous core sits inside an authored field of spiral arms.",
  "camera": [
    6,
    5,
    9
  ],
  "target": [
    0,
    1.1,
    0
  ],
  "topology": [
    "density",
    "arms"
  ],
  "schema": [
    {
      "key": "density",
      "label": "星点数量 Density",
      "min": 0.25,
      "max": 1.6,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "arms",
      "label": "旋臂数量 Arms",
      "min": 2,
      "max": 8,
      "step": 1,
      "default": 4
    },
    {
      "key": "twist",
      "label": "旋臂卷曲 Twist",
      "min": 0.2,
      "max": 1.8,
      "step": 0.02,
      "default": 0.9
    },
    {
      "key": "thickness",
      "label": "盘面厚度 Thickness",
      "min": 0.03,
      "max": 0.6,
      "step": 0.01,
      "default": 0.18
    },
    {
      "key": "color",
      "label": "外缘色 Color",
      "type": "color",
      "default": "#8daaca"
    },
    {
      "key": "spin",
      "label": "自转速度 Spin",
      "min": 0,
      "max": 0.4,
      "step": 0.01,
      "default": 0.04
    }
  ],
  "looks": [
    {
      "id": "spiral",
      "title": "Spiral blue / 蓝色旋臂",
      "hint": "A warm core with cool outer stars.",
      "params": {}
    },
    {
      "id": "violet",
      "title": "Violet whirl / 紫色旋涡",
      "hint": "Six tighter arms.",
      "params": {
        "color": "#b7a1d0",
        "arms": 6,
        "twist": 1.4
      }
    },
    {
      "id": "barred",
      "title": "Quiet barred / 舒展旋臂",
      "hint": "An open two-arm composition.",
      "params": {
        "color": "#dab792",
        "arms": 2,
        "twist": 0.4,
        "density": 0.6
      }
    }
  ],
  "fitZh": "螺旋星系外观、星点背景和天文风格视觉。",
  "limitZh": "程序化点云，不是实测星表、N 体动力学或银河结构重建。",
  "limit": "An authored point field, not a measured catalog, N-body simulation or reconstruction of a real galaxy."
};
