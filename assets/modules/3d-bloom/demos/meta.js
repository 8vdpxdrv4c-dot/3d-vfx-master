export const meta={
  "slug": "3d-bloom",
  "effect": "post-soft-glow",
  "impl": "soft-glow.js",
  "name": "3D Bloom",
  "zh": "电影辉光",
  "category": "postprocessing",
  "tagline": "A localized halo with one clear output owner.",
  "camera": [
    6.5,
    3.8,
    8
  ],
  "target": [
    0,
    1.4,
    0
  ],
  "schema": [
    {
      "key": "quality",
      "label": "质量 Quality",
      "options": [
        "low",
        "mid",
        "high",
        "cinematic"
      ],
      "default": "high"
    },
    {
      "key": "strength",
      "label": "辉光强度 Strength",
      "min": 0,
      "max": 2,
      "step": 0.02,
      "default": 0.8
    },
    {
      "key": "radius",
      "label": "扩散半径 Radius",
      "min": 0.2,
      "max": 2.5,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "threshold",
      "label": "亮部阈值 Threshold",
      "min": 0.2,
      "max": 2,
      "step": 0.02,
      "default": 0.9
    },
    {
      "key": "exposure",
      "label": "曝光 Exposure",
      "min": 0.5,
      "max": 1.6,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "color",
      "label": "发光色 Color",
      "type": "color",
      "default": "#7ac9d1"
    }
  ],
  "looks": [
    {
      "id": "cyan",
      "title": "Cyan studio / 青色摄影棚",
      "hint": "A controlled cool halo.",
      "params": {}
    },
    {
      "id": "amber",
      "title": "Amber accent / 琥珀点缀",
      "hint": "Warm localized emission.",
      "params": {
        "color": "#efb271",
        "strength": 0.5,
        "radius": 0.7,
        "threshold": 1.15
      }
    },
    {
      "id": "violet",
      "title": "Violet halo / 紫色光晕",
      "hint": "A wider luminous silhouette.",
      "params": {
        "color": "#b29bd9",
        "strength": 1.3,
        "radius": 1.8
      }
    }
  ],
  "fitZh": "发光产品、亮部溢出与可控柔光。",
  "limitZh": "艺术化亮部提取和模糊，不是经标定的镜头散射；不要叠加宿主输出变换。",
  "limit": "Artistic thresholded glow, not calibrated optical scatter. Avoid nested output transforms."
};
