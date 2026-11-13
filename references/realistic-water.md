# 逼真海水选型

触发：逼真的海水、真实海水、写实海洋、FFT 海浪、真实海岸和水下效果。先向用户展示下表并等待选择；不自动替用户选择。已明确指定效果时直接映射预设。

## 先提供可视参考

向用户提供 [五种水效预览页](../assets/modules/3d-ultra-water/preview.html)。从技能根目录用本地 HTTP 服务打开 `/assets/modules/3d-ultra-water/preview.html`，通过可用预览工具展示；导出完整模块时预览页和参考图一并携带，位于导出目录的 `preview.html`。不要用 file:// 运行 ES 模块。

预览支持五张真实渲染参考图、单一实时视口切换、暂停、重置、全屏和 27 个可调参数（视角 view 另计）。海浪、岸边浪花、水体、光照与水下效果分组控制，共享 `demos/parameters.js` 中的 schema。每种效果分别在本机保存设置；切换或刷新不丢失调整。“重置视角”只重置镜头，“恢复当前效果默认参数”重置当前效果的参数和视角。岸边参数需海岸在画面内才可见，水下参数需水下视角才可见。

URL 的 `#open-ocean` 等可直达对应水效；“复制含参数的预览链接”还在 hash 中携带 params 和 camera，可跨页面恢复。载入时校验类型、枚举、范围与相机坐标。只读预览或点击卡片不代表已委托制作。

选择按钮会生成包含 `$3d-vfx-master`、模块 slug、look、完整 params 和 camera 的指令。存在宿主 `window.openai.sendFollowUpMessage` 时请求发送到当前对话；宿主可能要求确认，不能仅凭函数返回宣称技能已经执行。当前本地浏览器没有发送接口时，按钮明确显示“复制效果和参数”，用户粘贴到对话后接续；不把复制描述为发送成功。也可下载包含完整信息的 JSON 参数包。禁止自造未获支持的 Codex 深链或静默启动额外模型进程。

## 接收预览页参数

收到 `format: 3d-vfx-water-selection`、`version: 1` 的参数包，且目标是 `3d-vfx-master / 3d-ultra-water` 时，用户已选定效果。保留完整 params 与 camera，不再询问效果、不用默认值覆盖已选参数。保存完整 JSON 后运行：

```powershell
python scripts/import_water_selection.py --selection-file <完整选择文件.json> --out <新的输出目录>
```

导入器先校验全部字段，再导出预设与参数，把 camera 写入 `demos/meta.js` 的 initialCamera。原始 Demo 启动时自动恢复视角。预览页默认读取导出的全部预设参数，可继续调节。单独用 toolkit 的 `--params-file` 时，输入只能是包内 params 对象，不能把整个参数包直接当作 params。

无法运行实时预览时，可展示模块 `assets/looks/` 下对应 JPG 实渲图；不得把静态图描述为实时水面。参考图不能替代用户确认。

| 选项 | 观感 | 模块 / look |
| --- | --- | --- |
| 深海涌浪 | 开阔海面、远处涌浪、反射高光 | 3d-ultra-water / open-ocean |
| 岸边碎浪 | 浅滩破浪、白色泡沫、沙滩冲刷 | 3d-ultra-water / breakers |
| 清澈浅海 | 青绿浅水、海床、阳光焦散 | 3d-ultra-water / lagoon |
| 夕阳海面 | 暖色夕照、闪烁波光 | 3d-ultra-water / golden-hour |
| 水下视角 | 水下光束、水面折射、悬浮颗粒 | 3d-ultra-water / underwater |
| 轻量静水（按需补充） | 简单水纹与反射池，适合轻量展示 | 3d-ocean；读取其 meta.js 选 look |

问法示例：“你想做哪种水效果：深海涌浪、岸边碎浪、清澈浅海、夕阳海面，还是水下视角？选定后我再制作。”用户要求其它水效时按其描述配置，不强制限于五项。

选定后读取 [模块说明](../assets/modules/3d-ultra-water/module-guide.md)。导出示例：

```powershell
python scripts/toolkit.py export 3d-ultra-water --look lagoon --out <新的项目目录>
```

保留完整 demos/、LICENSE.txt、THIRD_PARTY_NOTICES.md 和 source.json。该模块已携带本地依赖，用 HTTP 打开 demos/index.html，无需 npm 安装。用户选择的是海水观感，不必向用户解释着色器或渲染管线；这些限制用于内部接入判断。

能力边界：FFT 频谱海浪和海岸高度场近似，不是 CFD；没有真正卷成管状的浪、连续船尾尾流或漂浮物之间的碰撞。不沿用上游宣传的帧率，目标设备实测后再报告。
