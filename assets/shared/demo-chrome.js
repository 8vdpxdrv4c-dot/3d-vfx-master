/*
 * 3d-vfx-master 统一 Demo Chrome
 *
 * 给每个模块 demo 页提供同一套头部与「复制提示词」按钮：
 *   左：← 全部效果（回技能目录）
 *   中：3Dfans特效大师 / 模块中文名
 *   右：复制提示词（生成可直接丢给其它 agent 的「只应用效果」提示词）
 *
 * 用法：在 demos/index.html 的 </body> 前引一次
 *   <script type="module" src="../../../shared/demo-chrome.js"></script>
 * 导出副本由 exporter.py 把 ../../../shared/ 重写成 ./shared/ 并复制本目录。
 *
 * 设计要点：
 *   - 页面已有 <header> 时，直接改写它的内容（不叠加第二层头部）；
 *   - 页面没有 <header> 时（全屏 demo），注入固定头部，并把常见浮层下移；
 *   - 在 iframe / ?gallery / ?embed 里不注入，避免和外层导航重复。
 */

const HEADER_H = 72;
const CSS_URL = new URL('./demo-chrome.css', import.meta.url).href;
const IS_EMBEDDED =
  window.self !== window.top || /[?&](gallery|embed)(=|&|$)/.test(location.search);

function esc(text) {
  return String(text == null ? '' : text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function addCss() {
  if (document.querySelector('link[data-vfx-chrome]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  link.dataset.vfxChrome = '';
  document.head.appendChild(link);
}

/* ---------- 路径 ---------- */

function detectSlug(meta) {
  const m = location.pathname.match(/\/modules\/([^/]+)\/demos\//);
  if (m) return m[1];
  if (meta && meta.slug) return meta.slug;
  return '';
}

function homeHref() {
  /* 源项目：/assets/modules/<slug>/demos/index.html → 四级回根
     导出副本：/<out>/demos/index.html → 一级回根 */
  return /\/modules\/[^/]+\/demos\//.test(location.pathname)
    ? '../../../../index.html'
    : '../index.html';
}

function titleName() {
  const raw = (document.title || '').split(/[·|｜]/)[0].trim();
  return raw;
}

async function loadMeta() {
  try {
    const mod = await import(new URL('./meta.js', document.baseURI).href);
    return mod.meta || mod.default || null;
  } catch (error) {
    console.warn('[demo-chrome] 读取 meta.js 失败：', error && error.message);
    return null;
  }
}

/* ---------- 头部 ---------- */

/* 页面自带的页头：文档顺序里第一个、且位于页面骨架顶层的 header（排除面板/弹层里的 header） */
function findHeader() {
  for (const node of document.querySelectorAll('header')) {
    if (node.classList.contains('vfx-unified')) return node;
    const parent = node.parentElement;
    const atTop = parent === document.body || (parent && parent.parentElement === document.body);
    if (!atTop) continue;
    if (node.closest('main, section, article, aside, form, nav, dialog')) continue;
    return node;
  }
  return null;
}

function mountHeader(name) {
  let header = findHeader();
  let fixed = false;
  if (!header) {
    header = document.createElement('header');
    document.body.insertBefore(header, document.body.firstChild);
    fixed = true;
    document.body.classList.add('vfx-chrome-fixed');
  }
  header.className = 'vfx-unified' + (fixed ? ' vfx-unified--fixed' : '');
  header.innerHTML =
    '<a class="vfx-back" href="' + homeHref() + '">← 全部效果</a>' +
    '<span class="vfx-title"><b>3Dfans特效大师</b><i>' + esc(name) + '</i></span>' +
    '<button class="vfx-copy" type="button" data-vfx-copy>复制提示词</button>';
  return header;
}

function setName(name) {
  const slot = document.querySelector('header.vfx-unified .vfx-title i');
  if (slot && name) slot.textContent = name;
}

/* 导出副本里没有技能目录：链接打不开就把「全部效果」隐藏（保留占位，标题仍居中） */
async function dropDeadHomeLink() {
  const link = document.querySelector('header.vfx-unified .vfx-back');
  if (!link) return;
  let alive = false;
  try {
    const response = await fetch(link.getAttribute('href'), { method: 'HEAD' });
    alive = response.ok;
  } catch (_) {}
  if (alive) return;
  link.removeAttribute('href');
  link.setAttribute('aria-hidden', 'true');
  link.tabIndex = -1;
  link.style.visibility = 'hidden';
}

/* ---------- 取当前预设与参数 ---------- */

function findApi(slug) {
  const camel = String(slug || '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const candidates = [
    window.__vfxDemo,
    camel && window['__' + camel + 'Demo'],
    window.__volumeFireDemo,
    window.__skyDemo,
    window.__rainDemo,
    window.__burnDemo,
    window.__demo
  ];
  return candidates.find((x) => x && typeof x === 'object') || null;
}

function resolveLook(meta, api) {
  const looks = (meta && meta.looks) || [];
  let id = (api && (api.lookId || api.look || api.currentLook)) || '';
  if (!id) {
    const pressed = document.querySelector('[data-look][aria-pressed="true"]');
    if (pressed) id = pressed.dataset.look;
  }
  if (!id) {
    const select = document.querySelector('#look, select[name="look"]');
    if (select && select.value) id = select.value;
  }
  if (!id && looks.length) id = looks[0].id;
  const look = looks.find((l) => l.id === id) || looks[0] || null;
  return { id: (look && look.id) || id || 'default', title: look && look.title, params: (look && look.params) || {} };
}

function resolveParams(meta, look, api) {
  let values = null;
  if (api) {
    try {
      if (typeof api.getParams === 'function') values = api.getParams();
      else if (api.params && typeof api.params === 'object') values = api.params;
    } catch (_) {}
  }
  const defaults = {};
  for (const field of (meta && meta.schema) || []) defaults[field.key] = field.default;
  const merged = { ...defaults, ...look.params, ...(values || {}) };
  const keys = ((meta && meta.schema) || []).map((s) => s.key).filter((k) => k in merged);
  const rest = Object.keys(merged).filter((k) => !keys.includes(k) && !k.startsWith('_'));
  const out = {};
  for (const key of keys.concat(rest)) out[key] = merged[key];
  return out;
}

/* ---------- 提示词 ---------- */

function buildPrompt({ slug, meta, look, params }) {
  const name = (meta && (meta.zh || meta.name)) || titleName();
  const lines = [];
  lines.push('把「' + name + '」这个效果应用到当前项目场景里，只加效果本身。');
  lines.push('');
  lines.push('- 模块：`' + slug + '`（3d-vfx-master 技能自带，接入方式看 `assets/modules/' + slug + '/module-guide.md`）');
  lines.push('- 预设：`' + look.id + '`' + (look.title && look.title !== look.id ? '（' + look.title + '）' : ''));
  if (meta && meta.limitZh) lines.push('- 依赖与限制：' + meta.limitZh);
  lines.push('');
  lines.push('参数（原样使用，不要重新调）：');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(params, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('落地要求：');
  lines.push('');
  lines.push('1. 只挂效果：保留项目原有的场景、模型、相机、灯光、交互与页面布局；不要搬运 demo 的示例场景、地面、底座和测试几何体。');
  lines.push('2. 不带调试层：不要参数面板 / lil-gui / HUD / 状态栏 / 帧率读数 / `window.__*` 调试钩子 / 截图与验收接口。');
  lines.push('3. 不带多余描述：不要标题、说明文案、徽标、操作提示、页脚、署名；页面上除效果外不新增任何可见元素。');
  lines.push('4. 不重写算法：按模块既有实现挂载，参数只走它已有的 uniform / 材质属性 / 节点属性；卸载时按模块约定 dispose。');
  lines.push('');
  lines.push('验收：项目原场景照常渲染，效果可见且跟随项目交互，控制台无报错。');
  return lines.join('\n');
}

/* ---------- 复制 ---------- */

let toastTimer = 0;
function toast(text, tone) {
  let el = document.querySelector('.vfx-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'vfx-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.dataset.tone = tone || 'ok';
  el.dataset.on = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.dataset.on = 'false'; }, 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {}
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) {}
  area.remove();
  return ok;
}

/* 浏览器不允许写剪贴板时，把文本摊开让用户自己复制 */
function showFallback(text) {
  let box = document.querySelector('.vfx-fallback');
  if (!box) {
    box = document.createElement('div');
    box.className = 'vfx-fallback';
    box.innerHTML =
      '<div class="vfx-fallback-card">' +
      '<header><b>提示词</b><span>浏览器拒绝了自动复制，按 Ctrl/Cmd + C 手动复制</span></header>' +
      '<textarea readonly spellcheck="false"></textarea>' +
      '<footer><button type="button" data-vfx-close>关闭</button></footer>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', (event) => {
      if (event.target === box || event.target.closest('[data-vfx-close]')) box.dataset.on = 'false';
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && box.dataset.on === 'true') box.dataset.on = 'false';
    });
  }
  const area = box.querySelector('textarea');
  area.value = text;
  box.dataset.on = 'true';
  area.focus();
  area.select();
  area.scrollTop = 0;
}

/* ---------- 启动 ---------- */

async function init() {
  if (IS_EMBEDDED) return;
  addCss();
  mountHeader(titleName());
  dropDeadHomeLink();

  const meta = await loadMeta();
  const slug = detectSlug(meta);
  if (meta && (meta.zh || meta.name)) setName(meta.zh || meta.name);

  const button = document.querySelector('[data-vfx-copy]');
  if (!button) return;
  button.addEventListener('click', async () => {
    const api = findApi(slug);
    const look = resolveLook(meta, api);
    const params = resolveParams(meta, look, api);
    const text = buildPrompt({ slug, meta, look, params });
    const ok = await copyText(text);
    if (!ok) {
      button.dataset.state = 'error';
      button.textContent = '手动复制';
      toast('浏览器拒绝了自动复制，已展开文本', 'error');
      showFallback(text);
      setTimeout(() => {
        delete button.dataset.state;
        button.textContent = '复制提示词';
      }, 1800);
      return;
    }
    button.dataset.state = 'done';
    button.textContent = '已复制';
    toast('提示词已复制 · 粘贴给任意 agent 即可应用该效果');
    setTimeout(() => {
      delete button.dataset.state;
      button.textContent = '复制提示词';
    }, 1800);
  });

  /* 供自动化验证使用 */
  window.__vfxDemoChrome = {
    slug,
    meta,
    headerHeight: HEADER_H,
    buildPrompt() {
      const api = findApi(slug);
      const look = resolveLook(meta, api);
      return buildPrompt({ slug, meta, look, params: resolveParams(meta, look, api) });
    }
  };
}

init();
