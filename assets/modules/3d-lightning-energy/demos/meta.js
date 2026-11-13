export const meta={
  "slug": "3d-lightning-energy",
  "effect": "vfx-lightning-energy",
  "name": "Arc Chamber",
  "zh": "闪电能量组合特效",
  "category": "vfx",
  "sourceId": "batch02-09",
  "tagline": "A current bridges engineered electrodes in a quiet arc chamber.",
  "camera": [
    7,
    4.6,
    9
  ],
  "target": [
    0,
    1.5,
    0
  ],
  "topology": [
    "branches"
  ],
  "schema": [
    {
      "key": "energy",
      "label": "发光强度 Energy",
      "min": 0.2,
      "max": 3,
      "step": 0.05,
      "default": 1.35
    },
    {
      "key": "branches",
      "label": "支路数量 Branches",
      "min": 2,
      "max": 16,
      "step": 1,
      "default": 8
    },
    {
      "key": "reach",
      "label": "弧线张幅 Reach",
      "min": 0.3,
      "max": 2,
      "step": 0.02,
      "default": 1
    },
    {
      "key": "width",
      "label": "弧线宽度 Width",
      "min": 0.015,
      "max": 0.12,
      "step": 0.002,
      "default": 0.045
    },
    {
      "key": "color",
      "label": "电弧色 Color",
      "type": "color",
      "default": "#84c5ff"
    },
    {
      "key": "speed",
      "label": "演化速度 Speed",
      "min": 0,
      "max": 1.5,
      "step": 0.02,
      "default": 0.65
    }
  ],
  "looks": [
    {
      "id": "bridge",
      "title": "Electrode Bridge / 电极桥",
      "hint": "White-blue filaments span two dark terminals.",
      "params": {
        "variant": 0,
        "color": "#8ccaff",
        "reach": 1
      }
    },
    {
      "id": "coil",
      "title": "Orbital Coil / 环形线圈",
      "hint": "An orbital cage around a suspended core.",
      "params": {
        "variant": 1,
        "color": "#90d9ce",
        "reach": 1.2
      }
    },
    {
      "id": "array",
      "title": "Branch Array / 支路阵列",
      "hint": "A controlled fan of branching channels.",
      "params": {
        "variant": 2,
        "color": "#b4a6ed",
        "branches": 12,
        "reach": 1.45
      }
    }
  ],
  "fit": "Industrial energy diagrams, hero loops and restrained electric effects.",
  "limit": "Illustrative emissive ribbons, not an electrical field or plasma simulation. Brightness varies continuously; no strobe or impact-frame flashes."
};
