export const meta={
  "slug": "3d-rain-streaks",
  "effect": "rain-streaks-splashes",
  "impl": "rain-streaks-module.js",
  "name": "Rain Streaks & Splashes",
  "zh": "雨丝与水花",
  "category": "particles",
  "family": "particles",
  "tagline": "可调雨点大小的实例化雨丝、地面水花与低角度阳光前向散射。",
  "camera": [
    0,
    3.5,
    8
  ],
  "target": [
    0,
    1.2,
    0
  ],
  "cameraOwner": false,
  "schema": [
    {
      "key": "rain",
      "label": "雨量",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.6
    },
    {
      "key": "dropSize",
      "label": "雨点大小倍率",
      "min": 0.3,
      "max": 2.5,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "windSpeed",
      "label": "风速",
      "min": 0,
      "max": 8,
      "step": 0.1,
      "default": 3
    },
    {
      "key": "fallSpeed",
      "label": "下落速度",
      "min": 3,
      "max": 18,
      "step": 0.1,
      "default": 9.4
    },
    {
      "key": "sunAzimuth",
      "label": "太阳方位角 °",
      "min": 0,
      "max": 360,
      "step": 1,
      "default": 211
    },
    {
      "key": "sunElevation",
      "label": "太阳高度角 °",
      "min": 2,
      "max": 70,
      "step": 0.5,
      "default": 18.9
    },
    {
      "key": "sunIntensity",
      "label": "雨丝受光强度",
      "min": 0,
      "max": 5,
      "step": 0.05,
      "default": 2.4
    },
    {
      "key": "ambIntensity",
      "label": "环境补光强度",
      "min": 0,
      "max": 3,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "rainDrops",
      "label": "雨丝数量",
      "min": 1000,
      "max": 9000,
      "step": 100,
      "default": 9000
    },
    {
      "key": "splashDrops",
      "label": "水花数量",
      "min": 0,
      "max": 1200,
      "step": 50,
      "default": 1200
    },
    {
      "key": "speed",
      "label": "时间倍率（0 暂停）",
      "min": 0,
      "max": 2,
      "step": 0.05,
      "default": 1
    }
  ],
  "looks": [
    {
      "id": "night-rain",
      "title": "夜雨（原页默认）",
      "hint": "用户提供页面的原始数值：60% 雨量、1.00× 雨点、风速 3.0、9000 雨丝 + 1200 水花。",
      "params": {
        "rain": 0.6,
        "dropSize": 1,
        "windSpeed": 3,
        "fallSpeed": 9.4,
        "sunAzimuth": 211,
        "sunElevation": 18.9,
        "sunIntensity": 2.4,
        "ambIntensity": 1,
        "rainDrops": 9000,
        "splashDrops": 1200,
        "speed": 1
      }
    },
    {
      "id": "drizzle",
      "title": "细雨",
      "hint": "稀疏、细短、几乎垂直的雨丝，水花很少，适合安静的近景。",
      "params": {
        "rain": 0.28,
        "dropSize": 0.62,
        "windSpeed": 0.9,
        "fallSpeed": 7.2,
        "sunAzimuth": 211,
        "sunElevation": 18.9,
        "sunIntensity": 2.1,
        "ambIntensity": 1,
        "rainDrops": 5000,
        "splashDrops": 450,
        "speed": 0.85
      }
    },
    {
      "id": "downpour",
      "title": "暴雨斜雨",
      "hint": "满雨量、粗雨点、强侧风与更快下落，水花密集。",
      "params": {
        "rain": 1,
        "dropSize": 1.55,
        "windSpeed": 6.5,
        "fallSpeed": 13.2,
        "sunAzimuth": 205,
        "sunElevation": 25,
        "sunIntensity": 2,
        "ambIntensity": 1.15,
        "rainDrops": 9000,
        "splashDrops": 1200,
        "speed": 1.25
      }
    },
    {
      "id": "sunset-rain",
      "title": "逆光暖雨",
      "hint": "保持太阳位于视线前方（方位角贴近原页 211°）并压低高度角，让前向散射把雨丝点亮；可与 3d-skybox-sunset 组合成夕阳雨天。",
      "params": {
        "rain": 0.72,
        "dropSize": 1.2,
        "windSpeed": 2.4,
        "fallSpeed": 9.4,
        "sunAzimuth": 205,
        "sunElevation": 7,
        "sunIntensity": 3.4,
        "ambIntensity": 0.85,
        "rainDrops": 9000,
        "splashDrops": 1200,
        "speed": 1
      }
    }
  ],
  "fitZh": "下雨、雨天、雨丝、雨点大小可调、地面水花、斜风骤雨、细雨与逆光暖雨等场景天气。",
  "limitZh": "实例化解析雨丝与程序化水花，不模拟真实液滴碰撞、积水深度、湿面反射或流体风场；水花按地面 y=0 生成。实例池容量沿用用户原始常量：雨丝上限 9000、水花上限 1200，超出部分会被截断。",
  "limit": "Analytic instanced streaks and procedural ground splashes; no droplet collision, puddle depth, wet-surface reflection or fluid wind solver.",
  "source_kind": "user-supplied",
  "attribution": "用户在 2026-11-12 对话中提供的「几猫 · 雨效独立演示（可调雨点大小）」单文件代码；原始雨丝/水花着色器归属该输入，输入未附独立许可证声明；离线 Three.js r160 为 MIT。",
  "render_role": "scene-layer",
  "topology": [
    "instanced-streaks",
    "ground-splash",
    "directional-scattering"
  ],
  "batch": "rain-streaks-20261112",
  "keywords": [
    "下雨",
    "雨天",
    "降雨",
    "雨丝",
    "雨点",
    "雨点大小",
    "雨滴",
    "雨量",
    "水花",
    "溅水",
    "积水",
    "斜雨",
    "暴雨",
    "细雨",
    "逆光雨",
    "夕阳雨天",
    "风速",
    "天气",
    "rain",
    "rain streaks",
    "raindrop size",
    "splash",
    "drizzle",
    "downpour",
    "backlit rain"
  ],
  "resource_dir": "assets/modules/3d-rain-streaks",
  "guide": "assets/modules/3d-rain-streaks/module-guide.md",
  "demo": "assets/modules/3d-rain-streaks/demos/index.html",
  "preview": "assets/modules/3d-rain-streaks/preview.png",
  "effect_path": "assets/modules/3d-rain-streaks/demos/effects/rain-streaks-module.js"
};
