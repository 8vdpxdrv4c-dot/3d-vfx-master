export const meta={
  "slug": "3d-wireframe-scan",
  "effect": "shader-wireframe-scan",
  "name": "Survey Reveal",
  "zh": "线框扫描显现",
  "category": "shaders",
  "sourceId": "batch02-11",
  "tagline": "A wire cage leads the visible surface through a moving survey.",
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
      "key": "progress",
      "label": "扫描进度 Progress",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.58
    },
    {
      "key": "band",
      "label": "扫描带宽 Band",
      "min": 0.03,
      "max": 0.7,
      "step": 0.01,
      "default": 0.28
    },
    {
      "key": "glow",
      "label": "线框强度 Glow",
      "min": 0.2,
      "max": 3,
      "step": 0.05,
      "default": 1.35
    },
    {
      "key": "color",
      "label": "扫描色 Color",
      "type": "color",
      "default": "#75d8b0"
    },
    {
      "key": "speed",
      "label": "扫描速度 Speed",
      "min": 0,
      "max": 0.4,
      "step": 0.005,
      "default": 0.045
    },
    {
      "key": "spin",
      "label": "模型旋转 Spin",
      "min": 0,
      "max": 0.5,
      "step": 0.01,
      "default": 0.08
    }
  ],
  "looks": [
    {
      "id": "radial",
      "title": "Radial / 径向",
      "hint": "A radial cage surveys the gimbal.",
      "params": {
        "variant": 0,
        "color": "#76dcb8"
      }
    },
    {
      "id": "vertical",
      "title": "Vertical / 竖向",
      "hint": "A plane builds the object from the base.",
      "params": {
        "variant": 1,
        "color": "#b3c5ed",
        "progress": 0.7
      }
    },
    {
      "id": "diagonal",
      "title": "Oblique / 斜向",
      "hint": "An oblique band traverses topology.",
      "params": {
        "variant": 2,
        "color": "#e4b46f",
        "progress": 0.58
      }
    }
  ],
  "fit": "Model entrances, topology inspection and scan/reveal motion.",
  "limit": "A geometric reveal mask and temporary wire overlay; not CT, tomography or measurement data."
};
