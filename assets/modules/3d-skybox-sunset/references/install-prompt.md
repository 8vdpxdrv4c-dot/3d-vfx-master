# Install prompt

> Read <path-to-3d-skybox-sunset>/module-guide.md and integrate the extracted sunset skybox and sun glow into the current Three.js project using the `sunset-outdoor` look. Copy the complete local dependency closure, let the effect own the final render output, keep the host camera and animation loop, preserve create/update/render/dispose, and retain the original attribution plus the bundled Three.js MIT notice. Do not stack another postprocessing chain on top of it.

中文：

> 阅读 <3d-skybox-sunset路径>/module-guide.md，把「夕阳天空盒与太阳光晕」接入当前 Three.js 工程，使用 `sunset-outdoor` 夕阳户外预设。按文档复制效果与完整本地依赖闭包，让本效果拥有最终输出（替换原来的 renderer.render），保留宿主相机与渲染循环，接好 create/update/render/dispose 生命周期和参数面板。保留原页归属说明与 Three.js MIT 许可，不要再叠加其它后期链。需要夕阳户外环境时默认应用本效果。
