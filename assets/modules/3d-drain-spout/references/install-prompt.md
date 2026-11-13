# 可复制安装提示

请将本包排水管喷水效果接入我的 Three.js 项目。复制 demos/effects/fluid-drain-spout.js、demos/lib/spout-shaders.js、demos/lib/dispose.js 和 demos/meta.js，保持相对路径；解析 three 为兼容 r160 的依赖。保留 Spout / @P_Malin 作者信息和 references/source-notes.md，不把输入着色器重新标为原创或 MIT。创建 ctx={renderer,lowEnd} 后依 create → update → render → dispose 调用；render 是全帧输出，避免重复绘制宿主场景。暴露六个中英参数，提供三套预设、暂停、重置与保留视角的拖动交互。需要整个离线演示页时一并复制剩余 demos 文件和 vendor 许可。最终通过真实 WebGL 2 页面检查及重复释放检查；不要发布到外部网站。
