export const meta={
  "name": "GPU 体积火焰（WebGPU 流体模拟）",
  "slug": "3d-webgpu-volume-fire",
  "effect": "webgpu-volume-fire",
  "effectId": "webgpu-volume-fire",
  "category": "particles",
  "family": "particles",
  "render_role": "isolated-viewport",
  "requirement": "webgpu",
  "tagline": "在 GPU 上跑三维流体求解（半拉格朗日平流 + curlNoise 湍流 + 浮力 + Jacobi 压力投影），再用体积光线步进渲染火焰与烟。移植自 three.js 官方 webgpu_volume_fire 示例。",
  "camera": [14, 5.5, 4.4],
  "target": [0, 3.6, 0],
  "cameraOwner": true,
  "looks": [
    {
      "id": "classic",
      "title": "经典营火（官方默认）",
      "params": {
        "simSpeed": 1.2,
        "turbulence": 3.2,
        "fireLifespan": 1.3,
        "smokeLifespan": 3.5,
        "fireStartColor": "#ffe68c",
        "fireMidColor": "#ff7305",
        "fireEndColor": "#ff0000",
        "fireHue": 0,
        "exposure": 2,
        "raymarchSteps": 16,
        "resolution": 1,
        "bloom": true,
        "bloomStrength": 0.1,
        "glowSpread": 5,
        "saturation": 1.1
      }
    },
    {
      "id": "blue-plasma",
      "title": "蓝色等离子",
      "params": {
        "simSpeed": 1.6,
        "turbulence": 4.2,
        "fireLifespan": 1.0,
        "smokeLifespan": 2.2,
        "fireStartColor": "#e8fbff",
        "fireMidColor": "#38a6ff",
        "fireEndColor": "#1a12b8",
        "fireHue": 0,
        "exposure": 2.2,
        "raymarchSteps": 20,
        "resolution": 0.8,
        "bloom": true,
        "bloomStrength": 0.35,
        "bloomRadius": 0.9,
        "glowSpread": 4.4,
        "saturation": 1.35
      }
    },
    {
      "id": "toxic-green",
      "title": "毒雾绿焰",
      "params": {
        "simSpeed": 1.0,
        "turbulence": 3.6,
        "fireLifespan": 1.6,
        "smokeLifespan": 6,
        "fireStartColor": "#f2ffb8",
        "fireMidColor": "#7dff3c",
        "fireEndColor": "#0b6b1e",
        "fireHue": 0,
        "exposure": 2.1,
        "raymarchSteps": 18,
        "resolution": 0.85,
        "bloom": true,
        "bloomStrength": 0.28,
        "glowSpread": 4.8,
        "saturation": 1.25
      }
    },
    {
      "id": "dense-smoke",
      "title": "浓烟与烈焰",
      "params": {
        "simSpeed": 1.0,
        "turbulence": 2.4,
        "fireLifespan": 1.8,
        "smokeLifespan": 60,
        "emitDensity": 9,
        "emitTemperature": 6.4,
        "exposure": 2,
        "raymarchSteps": 18,
        "resolution": 0.8,
        "bloom": true,
        "bloomStrength": 0.14,
        "glowSpread": 4.6,
        "shadowAbsorption": 3.2,
        "saturation": 1.0
      }
    },
    {
      "id": "stylized-cartoon",
      "title": "卡通分层",
      "params": {
        "simSpeed": 1.4,
        "turbulence": 2.8,
        "fireLifespan": 1.2,
        "smokeLifespan": 2.5,
        "fireStartColor": "#fff8b0",
        "fireMidColor": "#ff9a2e",
        "fireEndColor": "#d1240a",
        "exposure": 1.7,
        "raymarchSteps": 14,
        "resolution": 0.7,
        "denoise": true,
        "denoiseStrength": 0.85,
        "bloom": false,
        "glowSpread": 3.2,
        "saturation": 1.5,
        "multiScattering": 0.35,
        "powderStrength": 0.3
      }
    }
  ],
  "schema": [
    {
      "key": "simSpeed",
      "label": "模拟速度",
      "min": 0,
      "max": 2,
      "step": 0.01,
      "default": 1.2
    },
    {
      "key": "turbulence",
      "label": "湍流强度",
      "min": 0,
      "max": 5,
      "step": 0.05,
      "default": 3.2
    },
    {
      "key": "fireLifespan",
      "label": "火焰寿命 秒",
      "min": 0.5,
      "max": 10,
      "step": 0.1,
      "default": 1.3
    },
    {
      "key": "smokeLifespan",
      "label": "烟雾寿命 秒",
      "min": 1,
      "max": 100,
      "step": 0.5,
      "default": 3.5
    },
    {
      "key": "fireStartColor",
      "label": "火焰中心色",
      "type": "color",
      "default": "#ffe68c"
    },
    {
      "key": "fireMidColor",
      "label": "火焰中段色",
      "type": "color",
      "default": "#ff7305"
    },
    {
      "key": "fireEndColor",
      "label": "火焰边缘色",
      "type": "color",
      "default": "#ff0000"
    },
    {
      "key": "fireHue",
      "label": "色相旋转 度",
      "min": 0,
      "max": 360,
      "step": 1,
      "default": 0
    },
    {
      "key": "glowSpread",
      "label": "火光扩散",
      "min": 1,
      "max": 5,
      "step": 0.1,
      "default": 5
    },
    {
      "key": "saturation",
      "label": "饱和度",
      "min": 0,
      "max": 2,
      "step": 0.05,
      "default": 1.1
    },
    {
      "key": "exposure",
      "label": "曝光",
      "min": 0.1,
      "max": 2,
      "step": 0.05,
      "default": 2
    },
    {
      "key": "raymarchSteps",
      "label": "体积步进次数",
      "min": 4,
      "max": 42,
      "step": 1,
      "default": 16
    },
    {
      "key": "resolution",
      "label": "体积分辨率",
      "min": 0.1,
      "max": 1,
      "step": 0.05,
      "default": 1
    },
    {
      "key": "denoise",
      "label": "降噪",
      "type": "boolean",
      "default": true
    },
    {
      "key": "bloom",
      "label": "辉光",
      "type": "boolean",
      "default": true
    },
    {
      "key": "bloomStrength",
      "label": "辉光强度",
      "min": 0,
      "max": 3,
      "step": 0.01,
      "default": 0.1
    },
    {
      "key": "emitTemperature",
      "label": "温度注入速率",
      "min": 0,
      "max": 8,
      "step": 0.1,
      "default": 5.5
    },
    {
      "key": "emitDensity",
      "label": "密度注入速率",
      "min": 0,
      "max": 20,
      "step": 0.1,
      "default": 7
    },
    {
      "key": "buoyancy",
      "label": "浮力（上升）",
      "min": 0,
      "max": 10,
      "step": 0.1,
      "default": 3
    },
    {
      "key": "velocityDamping",
      "label": "速度阻尼",
      "min": 0,
      "max": 2,
      "step": 0.01,
      "default": 0.25
    },
    {
      "key": "phaseAsymmetry",
      "label": "相位非对称 g",
      "min": -0.99,
      "max": 0.99,
      "step": 0.01,
      "default": 0
    },
    {
      "key": "powderStrength",
      "label": "粉状效应",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.59
    },
    {
      "key": "multiScattering",
      "label": "多层散射",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 1
    },
    {
      "key": "shadowAbsorption",
      "label": "自阴影吸收",
      "min": 0,
      "max": 10,
      "step": 0.1,
      "default": 2
    },
    {
      "key": "shadowAmbient",
      "label": "阴影环境光",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "default": 0.5
    },
    {
      "key": "lightSmoke",
      "label": "照亮烟雾强度",
      "min": 0,
      "max": 2,
      "step": 0.001,
      "default": 2
    },
    {
      "key": "keyLightIntensity",
      "label": "主光强度",
      "min": 0,
      "max": 1500,
      "step": 1,
      "default": 1000
    },
    {
      "key": "animateEmitter",
      "label": "发射体自转",
      "type": "boolean",
      "default": true
    }
  ],
  "limitZh": "需要 WebGPU 与安全上下文（https 或 localhost）。无适配器时本模块返回 null，请改用 3d-realistic-fire（WebGL 粒子火焰）作为降级。默认 100×100×200 网格、2 次 Jacobi 迭代；低端设备把 raymarchSteps 降到 8~12、resolution 降到 0.6，或把网格降到 64×64×128。",
  "limit": "Requires WebGPU and a secure context (https or localhost). Returns null without an adapter; fall back to 3d-realistic-fire (WebGL particle fire). Default grid 100x100x200 with 2 Jacobi iterations; on weak GPUs lower raymarchSteps to 8-12, resolution to 0.6, or the grid to 64x64x128."
};
