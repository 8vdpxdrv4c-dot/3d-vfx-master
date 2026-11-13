export const meta={
  "slug": "3d-burn-dissolve",
  "effect": "burn-dissolve",
  "impl": "burn-dissolve-module.js",
  "name": "Burn Dissolve",
  "zh": "烧焦溶解与灰烬",
  "category": "vfx",
  "family": "vfx",
  "tagline": "物体燃烧后的焦黑、余烬边缘、噪声溶解与飘起灰烬。",
  "camera": [
    32,
    23,
    52
  ],
  "target": [
    0,
    10,
    0
  ],
  "cameraOwner": false,
  "schema": [
    {
      "key": "progress",
      "label": "焚毁进度",
      "min": 0,
      "max": 1.1,
      "step": 0.001,
      "default": 0.5
    },
    {
      "key": "ashIntensity",
      "label": "灰烬亮度",
      "min": 0,
      "max": 2,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "edgeWidth",
      "label": "余烬边宽",
      "min": 0.002,
      "max": 0.12,
      "step": 0.002,
      "default": 0.022
    },
    {
      "key": "charWidth",
      "label": "焦黑范围",
      "min": 0.02,
      "max": 0.5,
      "step": 0.01,
      "default": 0.22
    },
    {
      "key": "charStrength",
      "label": "焦黑强度",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.85
    },
    {
      "key": "color",
      "label": "余烬颜色",
      "type": "color",
      "default": "#ff6b22"
    }
  ],
  "looks": [
    {
      "id": "ignition",
      "title": "初燃焦痕",
      "hint": "局部焦黑与细窄余烬边缘。",
      "params": {
        "progress": 0.28,
        "ashIntensity": 0.6,
        "edgeWidth": 0.014,
        "charWidth": 0.18,
        "charStrength": 0.85,
        "color": "#ff6b22"
      }
    },
    {
      "id": "burning",
      "title": "焚毁溶解",
      "hint": "噪声孔洞、焦黑过渡和橙红余烬。",
      "params": {
        "progress": 0.5,
        "ashIntensity": 1,
        "edgeWidth": 0.022,
        "charWidth": 0.22,
        "charStrength": 0.85,
        "color": "#ff6b22"
      }
    },
    {
      "id": "ashes",
      "title": "燃后灰烬",
      "hint": "大部分主体消散，残留焦黑碎片与飘灰。",
      "params": {
        "progress": 0.78,
        "ashIntensity": 0.8,
        "edgeWidth": 0.008,
        "charWidth": 0.35,
        "charStrength": 1,
        "color": "#c44819"
      }
    }
  ],
  "fitZh": "物体燃烧后、烧焦、灰烬、余烬、焚毁消散与建筑火灾叙事。",
  "limitZh": "艺术化表面着色与粒子，不模拟热传导、火焰体积、真实熔化或化学燃烧；阴影仍采用完整模型。",
  "source_kind": "user-supplied",
  "attribution": "用户海晏堂项目；Simplex noise: Ashima Arts / Stefan Gustavson (MIT)",
  "render_role": "scene-layer",
  "topology": [],
  "batch": "haiyantang-burn-20261031",
  "keywords": [
    "物体燃烧后",
    "燃烧后的物体",
    "燃烧后的时候",
    "燃烧后",
    "烧焦",
    "焦黑",
    "灰烬",
    "烧焦灰烬",
    "余烬",
    "焚毁",
    "焚毁溶解",
    "烧毁",
    "燃烧溶解",
    "大火烧焦溶解",
    "burn",
    "burnt",
    "charred",
    "ash",
    "ashes",
    "embers",
    "burn dissolve"
  ],
  "resource_dir": "assets/modules/3d-burn-dissolve",
  "guide": "assets/modules/3d-burn-dissolve/module-guide.md",
  "demo": "assets/modules/3d-burn-dissolve/demos/index.html",
  "preview": "assets/modules/3d-burn-dissolve/preview.png",
  "effect_path": "assets/modules/3d-burn-dissolve/demos/effects/burn-dissolve-module.js"
};
