export const meta={
  "slug": "3d-drain-spout",
  "effect": "fluid-drain-spout",
  "name": "Drain Spout",
  "zh": "排水管喷水",
  "category": "fluid-gas",
  "batch": "provided1",
  "tagline": "A curved water jet leaves a metal pipe and meets a rippling drainage channel.",
  "camera": [
    6,
    3.4,
    8
  ],
  "target": [
    1,
    0.9,
    0
  ],
  "cameraOwner": false,
  "schema": [
    {
      "key": "flow",
      "label": "出水速度 Flow",
      "min": 0.65,
      "max": 1.7,
      "step": 0.025,
      "default": 1
    },
    {
      "key": "radius",
      "label": "出水半径 Radius",
      "min": 0.18,
      "max": 0.45,
      "step": 0.01,
      "default": 0.4
    },
    {
      "key": "height",
      "label": "管口高度 Height",
      "min": 1.3,
      "max": 2.6,
      "step": 0.05,
      "default": 2
    },
    {
      "key": "ripple",
      "label": "波纹幅度 Ripple",
      "min": 0.005,
      "max": 0.05,
      "step": 0.001,
      "default": 0.025
    },
    {
      "key": "exposure",
      "label": "画面曝光 Exposure",
      "min": 0.7,
      "max": 2.3,
      "step": 0.05,
      "default": 1.5
    },
    {
      "key": "speed",
      "label": "动画速度 Speed",
      "min": 0,
      "max": 1.8,
      "step": 0.05,
      "default": 1
    }
  ],
  "looks": [
    {
      "id": "channel",
      "title": "Classic channel / 经典排水",
      "hint": "A broad translucent jet over a masonry channel.",
      "params": {}
    },
    {
      "id": "gentle",
      "title": "Gentle outflow / 柔和出水",
      "hint": "A narrower, slower stream with restrained ripples.",
      "params": {
        "flow": 0.8,
        "radius": 0.23,
        "height": 1.65,
        "ripple": 0.012,
        "exposure": 1.3,
        "speed": 0.65
      }
    },
    {
      "id": "surge",
      "title": "Strong discharge / 强劲排水",
      "hint": "A longer falling arc and a more active impact surface.",
      "params": {
        "flow": 1.35,
        "radius": 0.38,
        "height": 2.3,
        "ripple": 0.042,
        "exposure": 1.65,
        "speed": 1.25
      }
    }
  ],
  "fitZh": "排水管出水、抛物线水束、渠道涟漪和折射水体的艺术化展示。",
  "limitZh": "全屏距离场光线步进，水束与涟漪为解析近似；没有 CFD、体积守恒、真实流量或碰撞求解。不可与宿主三维场景做逐物体深度遮挡。",
  "attribution": "Spout — @P_Malin; user-supplied shader adapted for Three.js.",
  "licenseStatus": "The supplied shader has no license declaration in the attachment; original rights are retained."
};
