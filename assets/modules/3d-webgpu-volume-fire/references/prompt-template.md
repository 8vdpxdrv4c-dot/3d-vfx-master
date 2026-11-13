# 「复制提示词」输出模板（全部模块通用）

唯一的真源是 `assets/shared/demo-chrome.js` 里的 `buildPrompt()`。所有 demo 页右上角的「复制提示词」按钮都走这一份，**不要为单个模块再写第二份模板**。

目的：另一个 agent（或另一个会话）拿到这段文本后，直接把效果挂进**已有项目场景**，不重调参、不重写算法、不附带演示页的调试层。

## 输出结构

~~~md
把「{模块中文名}」这个效果应用到当前项目场景里，只加效果本身。

- 模块：`{slug}`（3d-vfx-master 技能自带，接入方式看 `assets/modules/{slug}/module-guide.md`）
- 预设：`{lookId}`（{lookTitle}）
- 依赖与限制：{meta.limitZh}

参数（原样使用，不要重新调）：

```json
{ ...当前预设的完整参数快照... }
```

落地要求：

1. 只挂效果：保留项目原有的场景、模型、相机、灯光、交互与页面布局；不要搬运 demo 的示例场景、地面、底座和测试几何体。
2. 不带调试层：不要参数面板 / lil-gui / HUD / 状态栏 / 帧率读数 / `window.__*` 调试钩子 / 截图与验收接口。
3. 不带多余描述：不要标题、说明文案、徽标、操作提示、页脚、署名；页面上除效果外不新增任何可见元素。
4. 不重写算法：按模块既有实现挂载，参数只走它已有的 uniform / 材质属性 / 节点属性；卸载时按模块约定 dispose。

验收：项目原场景照常渲染，效果可见且跟随项目交互，控制台无报错。
~~~

## 字段来源

| 段落 | 取值 |
| --- | --- |
| 模块中文名 | `meta.zh` → 缺省用 `meta.name` |
| `slug` | URL 里的 `/modules/<slug>/` → 缺省用 `meta.slug` |
| 预设 id / 标题 | `[data-look][aria-pressed="true"]` → `#look` 当前值 → `meta.looks[0]` |
| 参数快照 | 页面 `getParams()` / `params` → 缺省用 `schema` 默认值叠加当前预设 |
| 依赖与限制 | `meta.limitZh` |

参数按 `meta.schema` 的键序输出，同一预设每次复制的结果稳定可比。

## 与演示页的关系

- 统一头部、按钮样式、提示词内容都在 `assets/shared/`，页面只引一行 script。
- 页面若自带旧的复制按钮或 `buildPrompt()`，应删掉或转发到 `window.__vfxDemoChrome.buildPrompt()`，不要保留第二份文案。
- 改文案后至少跑一遍 `references/verify.mjs`，并在浏览器里点一次按钮确认复制成功。
