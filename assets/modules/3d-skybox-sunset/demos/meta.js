export const meta={
  "slug": "3d-skybox-sunset",
  "effect": "skybox-sunset",
  "impl": "sky-glow-module.js",
  "name": "Sunset Skybox & Sun Glow",
  "zh": "夕阳天空盒与太阳光晕",
  "category": "environment",
  "family": "environment",
  "tagline": "程序化夕阳天空盒、太阳圆盘与日晕、镜头光晕与暖色平行光环境。",
  "camera": [
    -9,
    1.7,
    -3.3
  ],
  "target": [
    36,
    9,
    13
  ],
  "cameraOwner": false,
  "schema": [
    {
      "key": "sunElevation",
      "label": "太阳高度角 °",
      "min": -2,
      "max": 45,
      "step": 0.5,
      "default": 13
    },
    {
      "key": "sunAzimuth",
      "label": "太阳方位角 °",
      "min": 0,
      "max": 360,
      "step": 1,
      "default": 70
    },
    {
      "key": "sunColor",
      "label": "太阳颜色",
      "type": "color",
      "default": "#ffddad"
    },
    {
      "key": "sunIntensity",
      "label": "平行光强度",
      "min": 0,
      "max": 20,
      "step": 0.1,
      "default": 9
    },
    {
      "key": "horizonColor",
      "label": "向太阳地平线色",
      "type": "color",
      "default": "#fac391"
    },
    {
      "key": "zenithColor",
      "label": "天顶冷色",
      "type": "color",
      "default": "#425165"
    },
    {
      "key": "awayColor",
      "label": "背光地平线色",
      "type": "color",
      "default": "#708295"
    },
    {
      "key": "cloudCover",
      "label": "云量倍率",
      "min": 0,
      "max": 1.6,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "cloudSpeed",
      "label": "云流动速度",
      "min": 0,
      "max": 3,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "aureole",
      "label": "日晕强度",
      "min": 0,
      "max": 3,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "sunDisk",
      "label": "太阳圆盘亮度",
      "min": 0,
      "max": 2,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "flare",
      "label": "镜头光晕",
      "min": 0,
      "max": 0.5,
      "step": 0.005,
      "default": 0.16
    },
    {
      "key": "bloom",
      "label": "辉光混合",
      "min": 0,
      "max": 0.3,
      "step": 0.005,
      "default": 0.065
    },
    {
      "key": "exposure",
      "label": "曝光",
      "min": 0.4,
      "max": 2,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "agxMix",
      "label": "AgX 混合",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.25
    },
    {
      "key": "fogDensity",
      "label": "场景雾浓度",
      "min": 0,
      "max": 0.02,
      "step": 0.0005,
      "default": 0.0035
    }
  ],
  "looks": [
    {
      "id": "sunset-outdoor",
      "title": "夕阳户外（默认）",
      "hint": "原页方位：低太阳、火烧地平线、云隙透光、镜头光晕与暖色平行光。",
      "params": {
        "sunElevation": 13,
        "sunAzimuth": 70,
        "sunColor": "#ffddad",
        "sunIntensity": 9,
        "horizonColor": "#fac391",
        "zenithColor": "#425165",
        "awayColor": "#708295",
        "cloudCover": 1,
        "cloudSpeed": 1,
        "aureole": 1,
        "sunDisk": 1,
        "flare": 0.16,
        "bloom": 0.065,
        "exposure": 1,
        "agxMix": 0.25,
        "fogDensity": 0.0035
      }
    },
    {
      "id": "golden-hour",
      "title": "金色时刻",
      "hint": "太阳略高、云量减少、暖金色天空，适合产品或建筑户外展示。",
      "params": {
        "sunElevation": 24,
        "sunAzimuth": 78,
        "sunColor": "#ffe6bd",
        "sunIntensity": 10,
        "horizonColor": "#ffd09a",
        "zenithColor": "#4a5c76",
        "awayColor": "#7d8ca0",
        "cloudCover": 0.62,
        "cloudSpeed": 0.7,
        "aureole": 0.85,
        "sunDisk": 1,
        "flare": 0.11,
        "bloom": 0.05,
        "exposure": 1.05,
        "agxMix": 0.3,
        "fogDensity": 0.0025
      }
    },
    {
      "id": "coastal-dusk",
      "title": "落日海岸",
      "hint": "太阳贴近地平线，日晕与光晕最强，厚云层与暖雾。",
      "params": {
        "sunElevation": 4.5,
        "sunAzimuth": 68,
        "sunColor": "#ffc98a",
        "sunIntensity": 7,
        "horizonColor": "#ff9e57",
        "zenithColor": "#35415a",
        "awayColor": "#5f7189",
        "cloudCover": 1.25,
        "cloudSpeed": 0.85,
        "aureole": 1.6,
        "sunDisk": 1.15,
        "flare": 0.26,
        "bloom": 0.09,
        "exposure": 0.95,
        "agxMix": 0.2,
        "fogDensity": 0.006
      }
    },
    {
      "id": "thin-cloud",
      "title": "薄云黄昏",
      "hint": "薄云、冷天顶、克制光晕，适合以主体为主的户外场景。",
      "params": {
        "sunElevation": 16,
        "sunAzimuth": 100,
        "sunColor": "#ffd9a6",
        "sunIntensity": 8,
        "horizonColor": "#e8a878",
        "zenithColor": "#4a5b78",
        "awayColor": "#7c8ba0",
        "cloudCover": 0.35,
        "cloudSpeed": 1.4,
        "aureole": 0.7,
        "sunDisk": 0.9,
        "flare": 0.09,
        "bloom": 0.045,
        "exposure": 1.02,
        "agxMix": 0.35,
        "fogDensity": 0.002
      }
    }
  ],
  "fitZh": "夕阳、日落、黄昏、逆光、金色时刻、户外环境、天空盒、太阳光晕、日晕与镜头光晕。",
  "limitZh": "程序化天空与艺术化后期，不含依赖场景深度的 AO、体积光轴与运动模糊；不模拟真实大气散射或太阳光谱。",
  "limit": "Procedural sky and artistic post chain; no depth-dependent AO, volumetric shafts or motion blur, no physically measured atmospheric scattering.",
  "source_kind": "user-supplied",
  "attribution": "用户提供「几猫3A大作」提取页 extracted-sky-glow-standalone.html（原始视觉实现归属该 HTML，输入未附独立许可证）；离线 Three.js r160 为 MIT。",
  "render_role": "postprocess",
  "topology": [
    "skybox",
    "sun-light",
    "pmrem-environment",
    "lens-flare"
  ],
  "batch": "sky-glow-20261111",
  "keywords": [
    "夕阳",
    "日落",
    "黄昏",
    "户外环境",
    "户外",
    "天空盒",
    "天空",
    "太阳",
    "太阳光晕",
    "日晕",
    "光晕",
    "镜头光晕",
    "逆光",
    "金色时刻",
    "夕阳海面",
    "skybox",
    "sky",
    "sun",
    "sun glow",
    "aureole",
    "lens flare",
    "sunset",
    "dusk",
    "golden hour",
    "outdoor environment",
    "environment map"
  ],
  "resource_dir": "assets/modules/3d-skybox-sunset",
  "guide": "assets/modules/3d-skybox-sunset/module-guide.md",
  "demo": "assets/modules/3d-skybox-sunset/demos/index.html",
  "preview": "assets/modules/3d-skybox-sunset/preview.png",
  "effect_path": "assets/modules/3d-skybox-sunset/demos/effects/sky-glow-module.js"
};
