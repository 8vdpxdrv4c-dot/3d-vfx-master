# 来源

2026-10-29 经用户要求，从本地 threeEditor 项目 src/editor/js/Fire.js、Fire2.js、libs/photons.module.js 与 images/ember.png、base_flame.png、bright_flame.png 整理。source/ 保留两份原始火焰代码。

适配部分：贴图 URL 相对当前模块解析；移除 Vue renderer.value 与全局 GSAP 依赖；宿主 dt 驱动；共享场景一次渲染；生命周期资源释放。没有将原火焰、粒子库或贴图标为原创。随包 Three.js r160 来自本技能已有离线资源，附原许可。
