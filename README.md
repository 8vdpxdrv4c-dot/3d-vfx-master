# 3Dfans 特效大师

一个面向 Three.js 的交互式 3D 可视化与网页特效技能，包含 39 个效果模块和 122 套预设。

## 安装

### Codex

```powershell
git clone https://github.com/8vdpxdrv4c-dot/3d-vfx-master.git "$HOME/.codex/skills/3d-vfx-master"
```

重启 Codex 后即可使用 `$3d-vfx-master`。

### 其它支持 Agent Skills 的工具

```sh
git clone https://github.com/8vdpxdrv4c-dot/3d-vfx-master.git ~/.agents/skills/3d-vfx-master
```

## 使用

阅读 [`SKILL.md`](SKILL.md) 查看效果选择、接入流程和组合约定。需要查询或导出效果时，在技能目录运行：

```sh
python scripts/toolkit.py search "烟雾和火花"
python scripts/toolkit.py export 3d-skybox-sunset --look sunset-outdoor --out ./sunset-demo
python scripts/toolkit.py verify
```

## 来源与许可

技能集合采用 MIT 许可，第三方模块仍受各自许可和署名条款约束。部分用户提供的素材未附独立许可证声明；来源、署名和已知许可边界见 [`references/sources-and-licenses.md`](references/sources-and-licenses.md) 及模块目录中的 `LICENSE.txt`、`ORIGINALITY.md`。公开仓库不改变这些组件各自的许可范围。
