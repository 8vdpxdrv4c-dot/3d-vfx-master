export const meta={
  "slug": "3d-depth-of-field",
  "effect": "post-focus-lens",
  "impl": "focus-lens.js",
  "name": "3D Depth of Field",
  "zh": "镜头景深",
  "category": "postprocessing",
  "tagline": "Depth defines which forms carry the focus.",
  "camera": [
    6.5,
    4,
    9
  ],
  "target": [
    0,
    1.1,
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
      "key": "focus",
      "label": "对焦距离 Focus",
      "min": 5,
      "max": 19,
      "step": 0.1,
      "default": 10
    },
    {
      "key": "aperture",
      "label": "光圈系数 Aperture",
      "min": 0.00003,
      "max": 0.0018,
      "step": 0.00003,
      "default": 0.00045
    },
    {
      "key": "blur",
      "label": "模糊上限 Blur",
      "min": 0.003,
      "max": 0.07,
      "step": 0.001,
      "default": 0.035
    },
    {
      "key": "color",
      "label": "主体色 Color",
      "type": "color",
      "default": "#7aafb9"
    }
  ],
  "looks": [
    {
      "id": "middle",
      "title": "Middle focus / 中景对焦",
      "hint": "A central group stays legible.",
      "params": {}
    },
    {
      "id": "near",
      "title": "Near focus / 近景对焦",
      "hint": "Front objects receive the sharpness.",
      "params": {
        "focus": 7.5,
        "aperture": 0.0009,
        "color": "#d8ad77"
      }
    },
    {
      "id": "deep",
      "title": "Deep focus / 深景观察",
      "hint": "A subtler lens finish through depth.",
      "params": {
        "focus": 12,
        "aperture": 0.00008,
        "blur": 0.009
      }
    }
  ],
  "fitZh": "产品对焦、深度层次和镜头示意。",
  "limitZh": "深度纹理驱动的轻量散景近似，不是光学镜头追迹；透明物体深度存在常见限制。",
  "limit": "A depth-texture lens approximation, not optical ray tracing; transparent-depth limitations apply."
};
