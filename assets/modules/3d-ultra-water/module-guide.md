# 逼真海水 · Ultra Water

MIT 衍生适配，原作者 © 2026 Humpalumps。来源：[用户指定仓库](https://github.com/8vdpxdrv4c-dot/Ultra-Water)，指纹与实际依赖版本见 [source.json](source.json)。FFT、海面、泡沫、海岸、天空与水下算法保留上游实现；新增五种完整预设、中文选择、暂停/重置、隐藏标签暂停和统一视口生命周期适配。

## 使用前

遵循根 SKILL.md 的“先选水效，再执行”。预设与参数见 demos/meta.js 和 demos/effects/ultra-water.js 的 guiSchema。Five looks: open-ocean、breakers、lagoon、golden-hour、underwater。WebGL2 和 EXT_color_buffer_float 必需；不支持时解释设备限制并让用户选择轻量 ocean 方案，不静默替换。

## 独立演示

用户选型优先打开 [五种水效预览页](preview.html)：五张实渲卡片与单一实时视口，支持切换、暂停、重置、27 个参数与全屏。五种效果分别保留设置；选择时带上完整参数与当前视角。`preview.html#lagoon` 等链接直达对应效果，分享链接还可携带参数。可发送宿主用原生发送接口，本地浏览器明确使用完整指令复制。该页随模块完整导出。原始参数演示仍位于 demos/。

参数定义统一位于 `demos/parameters.js`，由预览页、效果适配器、渲染控制器和目录共同使用，控制器也校验范围。收到完整选择包后按根技能的 import_water_selection.py 导入；导出元数据中的 initialCamera 由 Demo 启动时恢复。所有可调值进入 params，view 是第五种效果选择，不把调参当作新增预设。

```powershell
python -m http.server 4387
# 打开 http://127.0.0.1:4387/demos/
```

离线依赖为 Three.js 0.186.1、lil-gui 0.21.0，保留 vendor/ 全目录和许可。不要复用其它模块内的 Three.js 0.160.0。预设切换同时改变视角、风速、浪强和清澈度；高级参数仍可使用原面板。暂停保持可转动视角，重置恢复当前预设；reduced-motion 初始暂停，隐藏标签停止绘制。移动设备沿用上游低分辨率、低反射与关闭 bloom 的配置。

## 接入契约：独立视口

```js
import * as water from './demos/effects/ultra-water.js';
// container 为具有明确宽高的空 div。iframe 加载相同来源的 demos/index.html。
const params = {view:'Lagoon',windSpeed:5,waveScale:0.55,clarity:2,speed:1};
water.create({container}, params);
// 参数变化后：
water.update(0, params);
water.setPaused(true);
// 卸载；可重复调用：
water.dispose();
```

适配器导出 id/title/category/guiSchema/create/update/render/dispose。**这是 isolated-viewport，不是共享 Three.js 场景层**：子视口拥有 scene、camera、renderer、时间与最终输出，update 的 dt 不驱动子视口时钟；render 返回视口是否存在，不绘制宿主场景。ctx.container 必需，ctx.scene/camera/renderer 不使用。独立页面可直接打开 Demo；跨模块同屏用独立视口或画中画。若要求物体与海水共用深度，应以该模块的完整管线为基础改造，而不是把这个适配器当 mesh 插入宿主。

dispose 导航至 about:blank 并移除 iframe，子文档 pagehide 释放控制器、GUI、renderer 和 WebGL 上下文，整个文档持有的 GPU 资源随上下文释放。不是供外部共享 renderer 使用的资源管理器。

## 验收

五种预设分别检查着色器、相机与水面；检查暂停/重置、移动布局、参数变化与重复挂载卸载。实际验证记录见 [validation.json](validation.json)。未验证的设备性能不作保证。完整交付许可及第三方说明。
