# 实现与来源

本模块来自当前工作区本地制作并优化的 3d-cube-waterflow 工程。立方体、管道、连续水束、水面、重力水滴与局部波包均由本地程序化代码构建；没有引入外部模型、贴图、音频或 Spout 着色器。

整合保留优化后的效果算法；cube-water-stream.js 只改依赖相对路径，water-dynamics.js 原字节保留。Demo 主入口改为读取统一 meta.js 的预设，保证 toolkit 的 --look / --set 和重置一致。共用本技能原有自有 setup、dispose、core、frame-driver 工具。源文件、目标文件和适配指纹见技能根目录 references/waterflow-integration-origin.json。

本地自有实现沿用 [MIT 许可](LICENSE.txt)。Three.js 0.160.0 与 OrbitControls 使用其原 MIT 许可，版本、供应商文件指纹和来源见 [DEPENDENCIES.json](DEPENDENCIES.json) 与 demos/vendor/THREE-MIT.txt。独立实现记录不改变第三方依赖的版权；其他模块的 Spout 归属和许可记录保持原样。
