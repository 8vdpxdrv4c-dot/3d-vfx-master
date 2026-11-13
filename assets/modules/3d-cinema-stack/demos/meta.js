export const meta={
  "slug": "3d-cinema-stack",
  "effect": "post-cinema-stack",
  "name": "Cinema Stack",
  "zh": "电影后期效果组合",
  "category": "postprocessing",
  "sourceId": "batch02-13",
  "tagline": "A restrained glow, lens offset and film finish from one output owner.",
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
      "key": "glow",
      "label": "辉光 Glow",
      "min": 0,
      "max": 2,
      "step": 0.02,
      "default": 0.65
    },
    {
      "key": "exposure",
      "label": "曝光 Exposure",
      "min": 0.4,
      "max": 1.8,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "chromatic",
      "label": "色差 Chromatic",
      "min": 0,
      "max": 0.014,
      "step": 0.0005,
      "default": 0.0025
    },
    {
      "key": "vignette",
      "label": "暗角 Vignette",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.35
    },
    {
      "key": "grain",
      "label": "颗粒 Grain",
      "min": 0,
      "max": 0.09,
      "step": 0.002,
      "default": 0.018
    }
  ],
  "looks": [
    {
      "id": "warm",
      "title": "Warm Editorial / 暖调",
      "hint": "Controlled warm highlights and a gentle lens finish.",
      "params": {
        "color": "#d99b68",
        "glow": 0.55,
        "exposure": 1.12,
        "chromatic": 0.0015,
        "vignette": 0.3
      }
    },
    {
      "id": "precision",
      "title": "Cold Precision / 冷调",
      "hint": "A crisp blue-green material study.",
      "params": {
        "color": "#77b9c5",
        "glow": 0.3,
        "exposure": 0.95,
        "grain": 0.008,
        "chromatic": 0
      }
    },
    {
      "id": "night",
      "title": "Night Cinema / 夜景",
      "hint": "Tighter exposure and broader, low-key glow.",
      "params": {
        "color": "#b3a0d9",
        "glow": 1.05,
        "exposure": 0.82,
        "vignette": 0.55,
        "chromatic": 0.004
      }
    }
  ],
  "fit": "A single-owner WebGL post chain for glow, exposure, chromatic offset, vignette and grain.",
  "limit": "A lightweight artistic lens stack; no depth of field, film emulation calibration or spectral lens simulation. Integrate into an existing composer rather than nesting output transforms."
};
