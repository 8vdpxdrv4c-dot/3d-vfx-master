# 模块接入约定

## 资源与运行

assets/modules/ 中的 36 个目录是内部资源，每个目录含 demos、module-guide.md、参数说明及许可。它们不含独立的 SKILL.md，也不需要再次安装。

静态预览通过 HTTP 打开根目录 index.html；该页链接全部效果的独立 Demo。Three.js 0.160.0、lil-gui 0.19.2 和所需 OrbitControls 已本地内置，演示不依赖网络纹理或 CDN。模块文档分别注明 WebGL 要求。

导出完整 Demo：

```bash
python scripts/toolkit.py export 3d-rain --out /path/to/new/rain-demo
```

目标目录必须不存在；工具复制完整模块资源，保留来源和依赖许可。它不会启动服务、安装库、改写宿主路由或上传文件。导出后的 demos/index.html 可独立通过 HTTP 预览。

## 场景层接入

以下示例中的路径对应保留命名空间的导出模块；ctx 使用宿主现有的 scene、camera、renderer、controls、clock 和 lowEnd。

```js
import * as rain from './modules/rain/demos/effects/particles-rain-volume.js';
const params = Object.fromEntries(rain.guiSchema.map(s => [s.key, s.default]));
const ctx = {scene, camera, renderer, controls, clock, lowEnd: false};
rain.create(ctx, params);

function frame(dt) {
  rain.update(dt, params, ctx);
  if (!rain.render?.(ctx)) renderer.render(scene, camera);
}

// 参数变化后可立即刷新：
params.wind = 0.7;
rain.update(0, params, ctx);

// 切换场景或组件卸载：
rain.dispose();
```

只复制效果文件不一定够：读取其相对 imports。前 20 个模块使用 core、cloud-tools、lens-pass 等；后 13 个使用自己的基础设施；喷水还导入 demos/meta.js 和 spout-shaders.js。完整导出最容易保持闭包，精简时据实际 imports 决定。

立方体清透流水 `3d-cube-waterflow` 使用真实场景几何和透射水材质，可共享宿主深度。其效果依赖 `water-dynamics.js` 与 `lib/dispose.js` / `lib/core.js`；页面另需 `meta.js`、setup 和 frame-driver。宿主只负责一次最终渲染。具体接入与视觉参数见 [模块说明](../assets/modules/3d-cube-waterflow/module-guide.md)。

guiSchema 是参数定义来源，目录 JSON 中的 schema 和 looks 便于检索；运行时以模块导出的 guiSchema 为准。原有 topology 参数会重建 owned group，其他参数通常直接更新 uniforms 或变换。重建时保持宿主对象不受影响。

## 渲染和相机

目录中的 render_role 标明 scene-layer、postprocess、reflection-surface 或 fullscreen。标准场景层由宿主绘制；render(ctx) 返回 true 的效果已负责绘制，不再重复 renderer.render(scene, camera)。

后期模块的入口包含演示主体；只需要辉光/景深处理时，可提取相应 lib/lens-pass.js，分别调用 configure 与 render，并由宿主统一管理目标、输出转换和释放。Cinema Stack 有自己的专用链，不能把另一条完整后期入口机械地套在其后。

3d-ocean 为水面反射拥有一次额外场景绘制，排水喷水在私有正交场景中画全帧。3d-virtual-tour 与 3d-scroll-scenes 拥有相机行为。读取这些模块的 guide 后再与宿主相机/后期集成。

## 预算与清理

ctx.lowEnd、density、quality 等降级项有各自范围，遵循所选模块的参数表。使用较低 DPR、可见性控制和较少实例/采样；保留使对象可辨认的轮廓与表面。不要凭模块数或成功编译推断设备帧率。

卸载时释放效果、GUI、控制器、观察器与自建渲染目标。效果只处置自己的节点和资源；不要清空宿主 scene 来掩盖泄漏，也不要释放宿主共享环境纹理。切换后验证主相机、渲染目标、色调映射和播放状态仍正确。

## 指定导出预设和参数

```bash
python scripts/toolkit.py export 3d-smoke --look ambient --set opacity=0.4 --out /path/to/new/ambient-smoke
```

可重复 --set key=value，或用 --params-file 指向 JSON 对象文件（支持 UTF-8 BOM）。参数依据 guiSchema 检查类型、范围、颜色和枚举；未知字段在写目录前拒绝。选择的预设成为导出 Demo 的初始预设，其他预设保留。安装副本的源模块不受修改。

## 本地完整性自检

```powershell
python scripts/toolkit.py verify
```

安装后或复制到新电脑后先运行自检，按随包 `package-manifest.json` 校验文件是否缺失或改变；导出前也会检查所用模块。校验失败先恢复已审核的技能包，保留现有导出目录。此清单用于发现意外修改，不是发布者数字签名。Python 仅使用标准库，不向外部服务发送内容。

真实火焰 `3d-realistic-fire` 为共享深度的 WebGL 场景层，包含完整贴图和 Photons 库。需要真实火焰时优先读取其 [模块说明](../assets/modules/3d-realistic-fire/module-guide.md)，宿主一次渲染，不再调用原始 Manager.render。
