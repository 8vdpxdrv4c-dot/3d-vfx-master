# 立方体清透流水

属于 3Dfans特效大师的内部场景模块，效果 id 为 `cube-water-stream`，检索 slug 为 `3d-cube-waterflow`。

优先用于透明立方储水箱、金属出水管、清透连续水流、重力飞溅和落水涟漪。包含平稳、充沛、涓细三套预设，以及出水量、喷射力度、水位、扰动和颜色五个参数。

完整页面：[demos/index.html](demos/index.html)；参数和接入：[references/params.md](references/params.md)；来源：[ORIGINALITY.md](ORIGINALITY.md)；许可：[LICENSE.txt](LICENSE.txt)。

从技能根目录导出到尚不存在的目录：

```bash
python scripts/toolkit.py export 3d-cube-waterflow --out /path/to/new/water-demo
python scripts/toolkit.py export 3d-cube-waterflow --look gentle --set color=#006aff --out /path/to/new/blue-water
```

导出后用本地 HTTP 服务打开 demos/。所有运行依赖随包提供，无 CDN、下载模型或图片。预览保留近景、环视、颜色、暂停、重置和标注；`?low` 强制低功耗，`?still` 暂停，`?color=006aff` 指定颜色。导出的初始预设及覆盖参数由 demos/meta.js 决定，重置恢复这份导出配置。

这是场景几何层，可与宿主共用场景深度；宿主负责一次最终渲染、相机、灯光和环境反射。适度缩放整组几何或改造局部坐标，不要把依赖的相对路径平铺到其他模块目录。该模块使用模块级单实例状态；先 dispose 再 create，多实例需改造成工厂。

水体采用 MeshPhysicalMaterial 透射、IOR 1.333、程序化波面法线和连续水束；重力水滴落入池面时触发局部波包，关水后残余涟漪逐渐衰减。低功耗使用较低网格细分、DPR 与 100 个水滴槽位，普通模式 200 个。材质透射需要有可透视的池底、背景和环境光；黑背景与高饱和深色会改变清透感。

水位是独立展示参数，流量与喷射力度是相对视觉量，不用于压力、体积、湍流或真实流体计算。没有储水体自动排空或水量守恒求解。

可复跑验证：[WebGL / 生命周期](qa/check.html)、[390 × 844 布局与低功耗](qa/mobile.html)。当前整合版本的实测记录由技能根目录 references/validation.md 索引。
