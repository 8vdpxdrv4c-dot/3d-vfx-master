export const meta={
  "slug": "3d-light-shafts",
  "effect": "lighting-shaft-cones",
  "impl": "shaft-cones.js",
  "name": "3D Light Shafts",
  "zh": "空间光束",
  "category": "lighting",
  "tagline": "Soft cones connect visible emitters to an anchored stage.",
  "camera": [
    7,
    4.6,
    9
  ],
  "target": [
    0,
    1.6,
    0
  ],
  "schema": [
    {
      "key": "angle",
      "label": "光锥角度 Angle",
      "min": 0.12,
      "max": 0.52,
      "step": 0.01,
      "default": 0.25
    },
    {
      "key": "spread",
      "label": "灯位间距 Spread",
      "min": 0.8,
      "max": 3,
      "step": 0.05,
      "default": 1.9
    },
    {
      "key": "opacity",
      "label": "光束强度 Opacity",
      "min": 0.08,
      "max": 0.75,
      "step": 0.01,
      "default": 0.28
    },
    {
      "key": "intensity",
      "label": "灯光强度 Intensity",
      "min": 8,
      "max": 65,
      "step": 1,
      "default": 30
    },
    {
      "key": "color",
      "label": "光束色 Color",
      "type": "color",
      "default": "#b0d4de"
    },
    {
      "key": "speed",
      "label": "摆动速度 Speed",
      "min": 0,
      "max": 0.7,
      "step": 0.01,
      "default": 0.08
    }
  ],
  "looks": [
    {
      "id": "cold",
      "title": "Cold stage / 冷光舞台",
      "hint": "A restrained arrangement of cool beams.",
      "params": {}
    },
    {
      "id": "theatre",
      "title": "Amber theatre / 琥珀剧场",
      "hint": "Warmer, more concentrated light.",
      "params": {
        "color": "#dfbc88",
        "opacity": 0.45,
        "intensity": 48,
        "spread": 1.4
      }
    },
    {
      "id": "soft",
      "title": "Wide softbox / 宽幅柔光",
      "hint": "Broader, paler cones.",
      "params": {
        "color": "#bdcde5",
        "angle": 0.43,
        "spread": 2.5,
        "opacity": 0.2
      }
    }
  ],
  "fitZh": "舞台光锥、空间深度和摄影棚气氛。",
  "limitZh": "透明光锥与真实 SpotLight 对齐，不提供完整体积散射或体积遮挡阴影求解。",
  "limit": "Transparent beam geometry aligned with SpotLights, not full volumetric scattering or shadow transport."
};
