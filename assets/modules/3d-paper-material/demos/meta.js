export const meta={
  "slug": "3d-paper-material",
  "effect": "shader-paper-material",
  "name": "Fiber Sheet",
  "zh": "纤维纸张材质",
  "category": "shaders",
  "sourceId": "batch02-06",
  "tagline": "A paper edge has thickness, fibers and an uneven story.",
  "camera": [
    5,
    3.1,
    7.4
  ],
  "target": [
    0,
    1.5,
    0
  ],
  "schema": [
    {
      "key": "fiber",
      "label": "纤维强度 Fiber",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.55
    },
    {
      "key": "curl",
      "label": "卷角幅度 Curl",
      "min": 0,
      "max": 1.5,
      "step": 0.01,
      "default": 0.55
    },
    {
      "key": "thickness",
      "label": "纸层厚度 Thickness",
      "min": 0.002,
      "max": 0.06,
      "step": 0.002,
      "default": 0.018
    },
    {
      "key": "roughness",
      "label": "粗糙度 Roughness",
      "min": 0.25,
      "max": 1,
      "step": 0.01,
      "default": 0.85
    },
    {
      "key": "color",
      "label": "纸张色 Color",
      "type": "color",
      "default": "#dfd2b3"
    },
    {
      "key": "speed",
      "label": "呼吸速度 Speed",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.18
    }
  ],
  "looks": [
    {
      "id": "ivory",
      "title": "Ivory Fold / 象牙",
      "hint": "A floating sheet with a folded upper corner.",
      "params": {
        "variant": 0,
        "color": "#e3d7bb",
        "curl": 0.45
      }
    },
    {
      "id": "kraft",
      "title": "Kraft Roll / 牛皮纸",
      "hint": "Warm fibers and a stronger edge curl.",
      "params": {
        "variant": 1,
        "color": "#aa7e4e",
        "curl": 0.85
      }
    },
    {
      "id": "indigo",
      "title": "Dyed Paper / 靛纸",
      "hint": "A pale edge around a dense blue face.",
      "params": {
        "variant": 2,
        "color": "#61889b",
        "curl": 0.65,
        "fiber": 0.8
      }
    }
  ],
  "fit": "Paper, packaging, stationery and close material inspection.",
  "limit": "A layered procedural paper illustration. No fiber mechanics or physically solved transmission."
};
