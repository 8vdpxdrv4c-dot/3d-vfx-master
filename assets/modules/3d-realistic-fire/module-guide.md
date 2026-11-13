# 真实火焰（项目粒子火焰）

用户要求真实火焰、写实燃烧、篝火、火炬或火灾时，优先复用本模块。slug `3d-realistic-fire`，效果 id `realistic-fire`。小火与大火来自 threeEditor 的 Fire.js / Fire2.js；保留三层粒子、原始帧图、发射参数与插值曲线。是动画贴图粒子模拟的真实感外观，不是燃烧物理求解。

完整离线预览：[demos/index.html](demos/index.html)。参数与宿主接入：[references/params.md](references/params.md)。原始代码在 source/；可复用实现为 demos/lib/fire-runtime.js 和 demos/effects/realistic-fire.js。来源见 [ORIGINALITY.md](ORIGINALITY.md)，权限记录见 [LICENSE.txt](LICENSE.txt)。

```powershell
python scripts/toolkit.py search "真实火焰"
python scripts/toolkit.py export 3d-realistic-fire --look large --out /path/to/new/fire-demo
```

导出目录通过 HTTP 打开 demos/index.html。保留 lib/、textures/ 和 vendor/ 相对位置；Vite 等已有项目使用宿主唯一的 `three`，不再引入随包另一份 Three.js。

仅支持 WebGLRenderer；Photons 使用 ShaderMaterial，不能直接用于 WebGPURenderer。WebGPU 项目需要明确提供 WebGL 独立视口或移植材质，不能把简化发光体当作本效果。需要真火焰时不要默认替换成 lava、plasma 或只有 sparks 的效果。

宿主推进 dt 并只渲染一次 scene。不要调用原文件的 PhotonsManager.render；它逐粒子系统额外绘制，会破坏统一后期与深度关系。适配器把粒子 owner 加到宿主 scene、保留深度测试，卸载释放自己创建的几何、材质、贴图和光源。无编辑器路径、Vue renderer.value 或全局 GSAP 依赖。默认关闭点光源阴影；需要时由项目按预算开启。

通用模块使用单实例；多个火点使用 createFireEffect 工厂和 addFire。缩放/预设变化会重建，位置是创建时的世界坐标；需要移动火源时显式增加位置更新逻辑。性能主要随火点数量增加，低性能设备优先减少火点、阴影和 DPR。
