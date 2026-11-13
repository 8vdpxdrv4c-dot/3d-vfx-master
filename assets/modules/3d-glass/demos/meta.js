export const meta={
  "slug": "3d-glass",
  "effect": "materials-clear-volume",
  "impl": "clear-volume.js",
  "name": "3D Glass",
  "zh": "透射玻璃",
  "category": "materials",
  "tagline": "A clear sculptural form with a visible optical thickness.",
  "camera": [
    6,
    3.8,
    8
  ],
  "target": [
    0,
    1.6,
    0
  ],
  "schema": [
    {
      "key": "roughness",
      "label": "粗糙度 Roughness",
      "min": 0.02,
      "max": 0.65,
      "step": 0.01,
      "default": 0.08
    },
    {
      "key": "thickness",
      "label": "光学厚度 Thickness",
      "min": 0.1,
      "max": 3,
      "step": 0.05,
      "default": 1.3
    },
    {
      "key": "ior",
      "label": "折射率 IOR",
      "min": 1.05,
      "max": 2,
      "step": 0.01,
      "default": 1.5
    },
    {
      "key": "transmission",
      "label": "透射比例 Transmission",
      "min": 0.2,
      "max": 1,
      "step": 0.01,
      "default": 0.98
    },
    {
      "key": "color",
      "label": "玻璃色 Color",
      "type": "color",
      "default": "#d4edf0"
    },
    {
      "key": "spin",
      "label": "旋转速度 Spin",
      "min": 0,
      "max": 0.5,
      "step": 0.01,
      "default": 0.1
    }
  ],
  "looks": [
    {
      "id": "clear",
      "title": "Optical clear / 清澈玻璃",
      "hint": "A polished cool knot.",
      "params": {}
    },
    {
      "id": "frosted",
      "title": "Frosted blue / 磨砂蓝",
      "hint": "Soft transmitted light.",
      "params": {
        "roughness": 0.34,
        "color": "#95b6ca",
        "thickness": 1.8
      }
    },
    {
      "id": "amber",
      "title": "Amber crystal / 琥珀晶体",
      "hint": "Warm, thicker glass.",
      "params": {
        "color": "#e5c99a",
        "ior": 1.8,
        "thickness": 2.2
      }
    }
  ],
  "fitZh": "玻璃材质、透明产品和厚度对比。",
  "limitZh": "使用 Three.js 标准物理材质的屏幕空间透射，不是完整体积光线追踪。",
  "limit": "Three.js physical-material screen-space transmission, not full volumetric ray tracing."
};
