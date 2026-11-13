# Params — 液态金属 · 3D Liquid Metal

Full parameter reference for `fluid-liquid-metal.js`. All values are driven by the shared `params` object; changes take effect on the next `update()` call. Only `droplets` is a topology parameter — changing it triggers a full `create()` rebuild.

## Parameters

### viscosity · 粘性流速
- Range: 0.05 – 1.0, step 0.01, default 0.38
- Controls the amplitude of the procedural displacement on both the pool surface and the central blob. Higher values produce wilder, more turbulent ripples. Lower values give a syrupy, slow-creeping surface.

### tension · 表面张力
- Range: 0.1 – 2.0, step 0.05, default 0.85
- Spatial frequency of the wave pattern. Low values produce broad, lazy swells; high values give tight micro-ripples with visible surface texture.

### roughness · 表面粗糙度
- Range: 0.0 – 0.35, step 0.01, default 0.04
- PBR roughness of the MeshPhysicalMaterial on all surfaces. At 0.0 the surface is mirror-like; at 0.35 it reads as brushed or matte metal.

### droplets · 液滴数量  *(topology)*
- Range: 0 – 60, step 1, default 18
- Number of orbiting droplet instances. Changing this value triggers a full scene rebuild. On low-end devices the count is automatically halved.

### color · 金属色
- Type: color, default #c8ccd0 (silver-white)
- Base color applied to pool, blob and all droplets simultaneously. Works well across grey, gold and copper tones.

### speed · 流动速度
- Range: 0 – 1, step 0.01, default 0.32
- Global time multiplier for all animations — pool ripple, blob morph and droplet orbit. Set to 0 to freeze the scene.

## Look presets

| Look id | Notable overrides |
| --- | --- |
| mercury | defaults |
| gold-flow | color #d4a435, viscosity 0.22, tension 0.55, roughness 0.08, droplets 8, speed 0.18 |
| chrome-burst | color #e0e4e8, viscosity 0.82, tension 1.6, roughness 0.02, droplets 52, speed 0.75 |
