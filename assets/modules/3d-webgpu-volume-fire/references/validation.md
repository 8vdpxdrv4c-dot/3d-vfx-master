# 验证记录 · 3d-webgpu-volume-fire

## 2026-11-12 首次集成验证

环境：Windows 11，Chrome 157.0.6533.100（64-bit），NVIDIA 适配器，无头 + `--enable-unsafe-webgpu --enable-features=Vulkan`。

`node references/verify.mjs`：

| 检查项 | 结果 |
| --- | --- |
| WebGPU 初始化成功 | PASS（`navigator.gpu` 返回 NVIDIA 适配器） |
| 有可见火焰（非全黑且暖色占比足够） | PASS（max=0.891，暖色占比 1.88%） |
| 渲染循环持续推进 | PASS（首屏后 21 帧） |
| simSpeed=0 冻结后画面仍非黑 | PASS（mean=0.0796） |
| emitTemperature=0 后热区显著下降 | PASS（暖色 0.0188 → 0.0135） |
| 预设 blue-plasma 改变画面 | PASS（直方图距离 0.0098） |
| turbulence 热更新生效 | PASS（getParams().turbulence=5.5） |
| 复制提示词含模块/参数/代码/约束 | PASS（3431 字符，含 28 项参数 JSON） |

截图：`preview.png` 通过 `UPDATE_PREVIEW=1 node references/verify.mjs` 生成，82,780 字节。

## 约束与边界

- 必须 WebGPU + 安全上下文（https / localhost）；`file://` 双击会失败。
- 无 WebGPU 时 Demo 显示能力提示面板，不创建 GPU 资源；`createVolumeFireEffect()` 抛 `WEBGPU_UNAVAILABLE`。
- 体积渲染对屏幕中部区域敏感；`verify.mjs` 的 `VIEW_CLIP` 已避开 HUD 与右下参数面板。
- 预热需要时间：流体求解在首帧后约 20 帧才达到稳定发光状态。
