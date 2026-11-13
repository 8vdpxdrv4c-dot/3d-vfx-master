export const meta={
  "slug": "3d-liquid-metal",
  "effect": "fluid-liquid-metal",
  "impl": "fluid-liquid-metal.js",
  "name": "3D Liquid Metal",
  "zh": "液态金属",
  "category": "materials",
  "tagline": "A mercury-like pool morphs, droplets bead and orbit a central shifting mass.",
  "camera": [6.5, 4.8, 8.0],
  "target": [0, 0.8, 0],
  "topology": ["droplets"],
  "schema": [
    {"key":"viscosity","label":"粘性流速 Viscosity","min":0.05,"max":1.0,"step":0.01,"default":0.38},
    {"key":"tension","label":"表面张力 Tension","min":0.1,"max":2.0,"step":0.05,"default":0.85},
    {"key":"roughness","label":"表面粗糙度 Roughness","min":0.0,"max":0.35,"step":0.01,"default":0.04},
    {"key":"droplets","label":"液滴数量 Droplets","min":0,"max":60,"step":1,"default":18},
    {"key":"color","label":"金属色 Color","type":"color","default":"#c8ccd0"},
    {"key":"speed","label":"流动速度 Speed","min":0,"max":1,"step":0.01,"default":0.32}
  ],
  "looks": [
    {
      "id": "mercury",
      "title": "Mercury pool / 水银池",
      "hint": "Classic silver-white mercury with active ripple and orbiting droplets.",
      "params": {}
    },
    {
      "id": "gold-flow",
      "title": "Gold flow / 流金",
      "hint": "Warm gold tone, slower viscous flow, fewer droplets.",
      "params": {
        "color": "#d4a435",
        "viscosity": 0.22,
        "tension": 0.55,
        "roughness": 0.08,
        "droplets": 8,
        "speed": 0.18
      }
    },
    {
      "id": "chrome-burst",
      "title": "Chrome burst / 铬爆裂",
      "hint": "High-speed chrome splatter with maximum droplets and tight surface tension.",
      "params": {
        "color": "#e0e4e8",
        "viscosity": 0.82,
        "tension": 1.6,
        "roughness": 0.02,
        "droplets": 52,
        "speed": 0.75
      }
    }
  ],
  "fitZh": "水银特效、液态金属动效、产品展示金属液体背景。",
  "limitZh": "程序化变形曲面和粒子，不是真实流体力学或 SPH 模拟。",
  "limit": "Procedural morphing surface and instanced droplets, not real fluid dynamics or SPH simulation."
};
