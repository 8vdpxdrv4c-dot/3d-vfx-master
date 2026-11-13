export const meta={
  "slug": "3d-hologram",
  "effect": "shader-holo-vessel",
  "impl": "holo-vessel.js",
  "name": "3D Hologram",
  "zh": "全息投影",
  "category": "shaders",
  "tagline": "A scanned shell with a clean luminous silhouette.",
  "camera": [
    6,
    3.8,
    8
  ],
  "target": [
    0,
    1.65,
    0
  ],
  "schema": [
    {
      "key": "opacity",
      "label": "投影透明度 Opacity",
      "min": 0.1,
      "max": 0.9,
      "step": 0.01,
      "default": 0.45
    },
    {
      "key": "lines",
      "label": "扫描线密度 Lines",
      "min": 8,
      "max": 100,
      "step": 1,
      "default": 42
    },
    {
      "key": "glow",
      "label": "边缘亮度 Glow",
      "min": 0.3,
      "max": 3,
      "step": 0.05,
      "default": 1.3
    },
    {
      "key": "scale",
      "label": "模型尺度 Scale",
      "min": 0.6,
      "max": 1.4,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "color",
      "label": "投影色 Color",
      "type": "color",
      "default": "#6fcbd4"
    },
    {
      "key": "speed",
      "label": "演化速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.3
    }
  ],
  "looks": [
    {
      "id": "cyan",
      "title": "Cyan shell / 青色投影",
      "hint": "A knot-shaped scanned shell.",
      "params": {
        "variant": 0
      }
    },
    {
      "id": "amber",
      "title": "Amber facets / 琥珀切面",
      "hint": "A faceted warm projection.",
      "params": {
        "variant": 1,
        "color": "#edbb78"
      }
    },
    {
      "id": "violet",
      "title": "Violet sphere / 紫色球壳",
      "hint": "A smooth round silhouette.",
      "params": {
        "variant": 2,
        "color": "#b19bdd",
        "scale": 1.15
      }
    }
  ],
  "fitZh": "展品投影、数字孪生风格模型和模型轮廓展示。",
  "limitZh": "透明发光网格，不是光学全息或体积显示设备模拟。",
  "limit": "A luminous mesh shell, not physical holography or a volumetric display."
};
