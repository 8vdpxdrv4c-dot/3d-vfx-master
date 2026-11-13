# 来源与原创性说明 · 3d-webgpu-volume-fire

## 来源

- 上游示例：three.js 官方示例 `webgpu_volume_fire`
  - 页面：https://threejs.org/examples/#webgpu_volume_fire
  - 源码：`https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_volume_fire.html`
  - 抓取快照 SHA-256：`854ad2186b746de95709b0e539eac3ade6315928870a3bce84a41e1277f3d1fb`
- 离线 vendor 来源：见 `DEPENDENCIES.json`。

## 保留（逐字/等价）

- compute kernel 序列：半拉格朗日平流 `advectVelocity` / `advectSmoke` / `calculateCurl` / `addBuoyancy` / `jacobiPressure` / `subtractPressureGradient`；
- 流体参数化：`windX`、`dt`、`density`、`time`、`iterations` 等；
- 体渲染 TSL 节点：温度→黑体色、密度吸收、相位函数、powder 项、多重散射近似、体素 box 步进；
- 后期链：`GaussianBlurNode` + `BloomNode`；
- 示例布景：主相机、地面 Mesh、PMREM 环境、茶壶 DragControls、灯光。

## 封装层改动

- 全局变量 → 单实例闭包；`dispose()` 释放 compute pipeline、RenderPipeline、纹理、场景对象；
- 调试面板数值 → `meta.js` 的 28 项 schema，只写已有 uniform / node 属性；
- `renderer.init()` → 异步 `init()` / `isReady()`；
- CDN importmap → 模块内 `vendor/`；
- Demo 新增：预设下拉、「复制提示词」、参数面板、暂停/继续、`window.__volumeFireDemo` 验收接口。

## 未做

- 没有改写流体求解或体积渲染的数学；
- 没有省略任何渲染通道或后期环节；
- 没有引入 WebGL 替代渲染路径。
