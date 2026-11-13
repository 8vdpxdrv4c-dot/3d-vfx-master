export const meta={
  "slug": "3d-cloth-material",
  "effect": "shader-cloth-material",
  "name": "Woven Form",
  "zh": "真实织物材质",
  "category": "shaders",
  "sourceId": "batch02-04",
  "tagline": "Light catches the weave before it catches the fold.",
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
      "key": "fold",
      "label": "褶皱深度 Fold",
      "min": 0,
      "max": 1.2,
      "step": 0.01,
      "default": 0.48
    },
    {
      "key": "weave",
      "label": "织纹尺度 Weave",
      "min": 0.4,
      "max": 2.4,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "sheen",
      "label": "柔光 Sheen",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.7
    },
    {
      "key": "roughness",
      "label": "粗糙度 Roughness",
      "min": 0.15,
      "max": 1,
      "step": 0.01,
      "default": 0.75
    },
    {
      "key": "color",
      "label": "染色 Color",
      "type": "color",
      "default": "#b6a797"
    },
    {
      "key": "speed",
      "label": "摆动速度 Speed",
      "min": 0,
      "max": 1.5,
      "step": 0.01,
      "default": 0.4
    }
  ],
  "looks": [
    {
      "id": "linen",
      "title": "Linen Screen / 亚麻",
      "hint": "A suspended panel with soft, irregular folds.",
      "params": {
        "variant": 0,
        "color": "#b8aa96",
        "sheen": 0.35,
        "roughness": 0.85,
        "fold": 0.42
      }
    },
    {
      "id": "satin",
      "title": "Satin Ribbon / 缎带",
      "hint": "A narrow, twisting ribbon in cool light.",
      "params": {
        "variant": 1,
        "color": "#60868d",
        "sheen": 1,
        "roughness": 0.27,
        "fold": 0.75
      }
    },
    {
      "id": "canvas",
      "title": "Canvas Drape / 帆布",
      "hint": "A heavy folded sheet over a low support.",
      "params": {
        "variant": 2,
        "color": "#b67a50",
        "sheen": 0.3,
        "roughness": 0.93,
        "fold": 0.6
      }
    }
  ],
  "fit": "Product material studies, banners and decorative drapes.",
  "limit": "Parametric folds with procedural weave. No cloth collision, stress or textile measurement claim."
};
