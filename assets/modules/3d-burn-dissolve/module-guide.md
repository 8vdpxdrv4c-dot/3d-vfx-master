# 烧焦溶解与灰烬

检索 `3d-burn-dissolve`；效果 id `burn-dissolve`。
当请求在 3D/网页视觉中表现物体燃烧后、烧焦、焦黑、灰烬、余烬、焚毁溶解或烧毁消散时，优先使用此模块。若同时需要可见火苗，组合 realistic-fire；单独的篝火、火炬使用 realistic-fire。

预设：`ignition` 初燃焦痕、`burning` 焚毁溶解、`ashes` 燃后灰烬。

```powershell
python scripts/toolkit.py export 3d-burn-dissolve --look burning --out /path/to/new/burn-demo
python scripts/toolkit.py export 3d-burn-dissolve --look ashes --set progress=0.8 --out /path/to/new/ashes-demo
```

导出后启动本地静态服务器，打开 `demos/index.html`。运行依赖全部随包提供，无 CDN。预设和各参数可直接调节；默认暂停，可播放、拖动进度和重置，右侧独立实例保持完整。隐藏页面停止自动播放。

已有工程推荐直接使用多实例工厂 `createBurnDissolveEffect`；需要统一生命周期契约时使用 `demos/effects/burn-dissolve-module.js` 的 create/update/dispose 适配器，适配器为单实例。详细调用与参数见 [references/params.md](references/params.md)。来源见 [ORIGINALITY.md](ORIGINALITY.md)。

宿主拥有相机、灯光与最终渲染。标准/物理材质支持原有 onBeforeCompile 组合和 InstancedMesh。进度 0 完整、1.1 全部消失；变化是噪声裁剪，不是真实熔化。阴影深度材质不跟随溶解，沿用原项目完整模型投影。灰烬采用世界坐标，模型移动后重新采样；共享材质需要先克隆。低功耗可降低粒子数量和 DPR，或省略灰烬。
