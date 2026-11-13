# 移除报告：四季场景切换 / 程序化行星 / 流动熔岩

日期：2026-11-12。范围：`C://Users//yaoja//.codex//skills//3d-vfx-master`（唯一实体；用户级安装路径为指向它的 junction，无需另行同步）。

## 1. 任务

按用户要求删除三个特效及其 demo 页：`3d-four-seasons`（四季场景切换）、`3d-planet`（程序化行星）、`3d-lava`（3D Lava 流动熔岩），并同步机器目录、人类目录、技能入口、首页、代理描述、搜索用例、来源说明与完整性清单。

## 2. 删除方式与备份

未做硬删除。三个模块目录（共 76 个文件）整体移出技能包，存入离线备份：

```
C:\Users\yaoja\.workbuddy-ai\3d-vfx-master.removed-20261112
```

备份内 `removal-inventory.json` 记录每个文件的原始路径。备份位于 `.workbuddy-ai/` 下但不在 `skills/` 中，不会被当作技能加载。恢复方式：把 `assets/modules/<slug>` 从备份移回源项目，再按本报告第 4 节反向恢复引用并重建清单。

## 3. 被移除文件清单（76）

### `3d-four-seasons` — 24 文件

- `assets/modules/3d-four-seasons/DEPENDENCIES.json`
- `assets/modules/3d-four-seasons/LICENSE.txt`
- `assets/modules/3d-four-seasons/ORIGINALITY.md`
- `assets/modules/3d-four-seasons/assets/README.md`
- `assets/modules/3d-four-seasons/assets/preview.webp`
- `assets/modules/3d-four-seasons/demos/effects/motion-four-seasons.js`
- `assets/modules/3d-four-seasons/demos/index.html`
- `assets/modules/3d-four-seasons/demos/lib/core.js`
- `assets/modules/3d-four-seasons/demos/lib/dispose.js`
- `assets/modules/3d-four-seasons/demos/lib/frame-driver.js`
- `assets/modules/3d-four-seasons/demos/lib/gui.js`
- `assets/modules/3d-four-seasons/demos/lib/scroll-driver.js`
- `assets/modules/3d-four-seasons/demos/lib/setup.js`
- `assets/modules/3d-four-seasons/demos/main.js`
- `assets/modules/3d-four-seasons/demos/meta.js`
- `assets/modules/3d-four-seasons/demos/styles.css`
- `assets/modules/3d-four-seasons/demos/vendor/LIL-GUI-MIT.txt`
- `assets/modules/3d-four-seasons/demos/vendor/THREE-MIT.txt`
- `assets/modules/3d-four-seasons/demos/vendor/addons/controls/OrbitControls.js`
- `assets/modules/3d-four-seasons/demos/vendor/lil-gui.esm.js`
- `assets/modules/3d-four-seasons/demos/vendor/three.module.js`
- `assets/modules/3d-four-seasons/module-guide.md`
- `assets/modules/3d-four-seasons/references/install-prompt.md`
- `assets/modules/3d-four-seasons/references/params.md`

### `3d-planet` — 26 文件

- `assets/modules/3d-planet/DEPENDENCIES.json`
- `assets/modules/3d-planet/LICENSE.txt`
- `assets/modules/3d-planet/ORIGINALITY.md`
- `assets/modules/3d-planet/assets/README.md`
- `assets/modules/3d-planet/assets/preview.webp`
- `assets/modules/3d-planet/demos/effects/shader-terra-orb.js`
- `assets/modules/3d-planet/demos/index.html`
- `assets/modules/3d-planet/demos/lib/cloud-tools.js`
- `assets/modules/3d-planet/demos/lib/core.js`
- `assets/modules/3d-planet/demos/lib/dispose.js`
- `assets/modules/3d-planet/demos/lib/frame-driver.js`
- `assets/modules/3d-planet/demos/lib/gui.js`
- `assets/modules/3d-planet/demos/lib/lens-pass.js`
- `assets/modules/3d-planet/demos/lib/scroll-driver.js`
- `assets/modules/3d-planet/demos/lib/setup.js`
- `assets/modules/3d-planet/demos/main.js`
- `assets/modules/3d-planet/demos/meta.js`
- `assets/modules/3d-planet/demos/styles.css`
- `assets/modules/3d-planet/demos/vendor/LIL-GUI-MIT.txt`
- `assets/modules/3d-planet/demos/vendor/THREE-MIT.txt`
- `assets/modules/3d-planet/demos/vendor/addons/controls/OrbitControls.js`
- `assets/modules/3d-planet/demos/vendor/lil-gui.esm.js`
- `assets/modules/3d-planet/demos/vendor/three.module.js`
- `assets/modules/3d-planet/module-guide.md`
- `assets/modules/3d-planet/references/install-prompt.md`
- `assets/modules/3d-planet/references/params.md`

### `3d-lava` — 26 文件

- `assets/modules/3d-lava/DEPENDENCIES.json`
- `assets/modules/3d-lava/LICENSE.txt`
- `assets/modules/3d-lava/ORIGINALITY.md`
- `assets/modules/3d-lava/assets/README.md`
- `assets/modules/3d-lava/assets/preview.webp`
- `assets/modules/3d-lava/demos/effects/fluid-thermal-crust.js`
- `assets/modules/3d-lava/demos/index.html`
- `assets/modules/3d-lava/demos/lib/cloud-tools.js`
- `assets/modules/3d-lava/demos/lib/core.js`
- `assets/modules/3d-lava/demos/lib/dispose.js`
- `assets/modules/3d-lava/demos/lib/frame-driver.js`
- `assets/modules/3d-lava/demos/lib/gui.js`
- `assets/modules/3d-lava/demos/lib/lens-pass.js`
- `assets/modules/3d-lava/demos/lib/scroll-driver.js`
- `assets/modules/3d-lava/demos/lib/setup.js`
- `assets/modules/3d-lava/demos/main.js`
- `assets/modules/3d-lava/demos/meta.js`
- `assets/modules/3d-lava/demos/styles.css`
- `assets/modules/3d-lava/demos/vendor/LIL-GUI-MIT.txt`
- `assets/modules/3d-lava/demos/vendor/THREE-MIT.txt`
- `assets/modules/3d-lava/demos/vendor/addons/controls/OrbitControls.js`
- `assets/modules/3d-lava/demos/vendor/lil-gui.esm.js`
- `assets/modules/3d-lava/demos/vendor/three.module.js`
- `assets/modules/3d-lava/module-guide.md`
- `assets/modules/3d-lava/references/install-prompt.md`
- `assets/modules/3d-lava/references/params.md`

## 4. 活跃引用同步（15 处编辑）

| 文件 | 变更 |
| --- | --- |
| `references/effect-catalog.json` | 删除 3 条模块记录：41 → 38 模块、127 → 117 预设 |
| `references/effect-catalog.md` | 删除 3 行表格、计数改为 38 / 117 |
| `SKILL.md` | 两处 41/127 → 38/117；需求表移除「熔岩 / lava」路由；独立实现 35 → 32 |
| `index.html` | Hero、说明、卡片分母、来源筛选、note 中的 41/127/35 → 38/117/32 |
| `agents/openai.yaml` | short_description 41/127 → 38/117 |
| `references/sources-and-licenses.md` | 独立实现 35 → 32；标注 `source-audit.json` 为初始打包历史快照 |
| `references/testing/round-02-search-cases.json` | 删除「四季场景」用例、从全量结果移除 3 个 slug：22 → 21 用例 |
| `references/package-manifest.json` | 按最终文件集重建，1128 → 1052 项（加入本报告后 1053 项） |

## 5. 计数变化

| 指标 | 变更前 | 变更后 |
| --- | ---: | ---: |
| 效果模块 | 41 | 38 |
| 预设 | 127 | 117 |
| 独立实现模块 | 35 | 32 |
| 用户指定代码模块 | 6 | 6 |
| 清单条目 | 1128 | 1053 |

## 6. 历史证据保留（有意不删）

以下文件仍含三个 slug，但均为初始打包 / 十轮验证时期的历史快照，不被检索、导出、首页或完整性校验读取，故保留以维持审计链：

- `references/source-audit.json`
- `references/evidence/initial-packaging-source-audit.json`
- `references/evidence/mobile-validation.json`
- `references/evidence/structural-validation.json`
- `references/evidence/validation-report.json`
- `references/testing/round-05-webgl.json`
- `references/testing/round-08-mobile.json`
- `references/testing/round-08-mobile-first.json`
- `references/testing/round-10-webgl.json`
- `references/testing/round-10-mobile.json`
- `references/testing/round-10-portable-checks.json`

`distribution/` 内的历史发布包与 CLI 产物同样未改动，且本来就被排除在完整性清单之外。

## 7. 验证结果

| 检查 | 结果 |
| --- | --- |
| `toolkit.py verify` | `pass: true`，1053 项，`errors: []` |
| 检索「熔岩」「行星」「四季」 | 均为 `[]`；检索「夕阳」仍命中 `3d-skybox-sunset` |
| `show 3d-lava` / `export 3d-lava` | 均返回 `Unknown module: 3d-lava`（rc=1），符合预期 |
| `export 3d-rain-streaks --look night-rain` | 成功，导出 19 个文件 |
| 目录资源路径 | 38 个模块的 resource_dir / guide / demo / preview / effect_path 全部存在，缺失 0 |
| 活跃文件残留引用 | 0；只剩第 6 节列出的历史证据 |
| 模块 JS 语法 | 380 个文件，失败 0（node --input-type=module --check） |
| 首页无头验收 | 14/14 通过：38 张卡片、38 张预览图全部加载、筛选 32/6、三个关键词空态、「夕阳」仍命中、无 console error / 404 |

## 8. 备注

- 安装路径 `C://Users//yaoja//.workbuddy-ai//skills//3d-vfx-master` 是 junction，指向本报告所改的源项目；无需再同步第二份文件。
- 旧离线备份 `C://Users//yaoja//.workbuddy-ai//3d-vfx-master.backup-20261112` 不参与加载，本次未改动，其中仍保留三个模块的旧副本。
- 三个模块均为 `independent`，故用户指定代码模块数保持 6 不变。

