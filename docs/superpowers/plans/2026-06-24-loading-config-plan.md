# Loading Screen 环境变量可配置化 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让用户通过 `.env` 文件中的 `VITE_LOADING_*` 环境变量自定义 app 启动时的全局 loading 画面（标题、Logo、动画样式、副标题）。

**Architecture:** Vite 插件 `vite:inject-app-loading` 在 `transformIndexHtml` 阶段将 loading HTML 注入到 `index.html` 的 `<body>` 中。插件的 `viteInjectAppLoadingPlugin(isBuild, env)` 已经接收 `env` 参数。本计划扩展它：从 `env` 中读取 `VITE_LOADING_*` 变量，替换 `default-loading.html` 模板中的 `%VITE_LOADING_*%` 占位符；Logo 和副标题为空时不渲染对应 DOM 元素。

**Tech Stack:** TypeScript, Vite Plugin API, CSS animation

**其他 app：** `web-antdv-next`、`web-ele`、`web-naive`、`web-tdesign` 的 `.env.development` 可同样添加注释，但不在本次计划范围内。

---

### Task 1: 更新 default-loading.html 模板

**Files:**
- Modify: `internal/vite-config/src/plugins/inject-app-loading/default-loading.html`

**Interfaces:**
- Consumes: 无
- Produces: 供 Task 3 解析：`%VITE_LOADING_TITLE%`、`%VITE_LOADING_LOGO%`、`%VITE_LOADING_ANIMATION%`、`%VITE_LOADING_DESCRIPTION%` 占位符；CSS class 名 `loading-logo`、`loading-description`、`loading-animation-dots`、`loading-animation-spinner`、`loading-animation-none`

- [ ] **Step 1: 写入完整的 default-loading.html**

将原有静态 HTML 改写为带占位符的模板，保留 bounce 动画作为默认，新增 dots、spinner、none 三种动画，新增 Logo 和副标题区域（占位符由插件在 Task 3 替换）。

```html
<style data-app-loading="inject-css">
  html {
    /* same as ant-design-vue/dist/reset.css setting, avoid the title line-height changed */
    line-height: 1.15;
  }

  .loading {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #f4f7f9;
  }

  .loading.hidden {
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
    transition: all 0.8s ease-out;
  }

  .dark .loading {
    background: #0d0d10;
  }

  .title {
    margin-top: 66px;
    font-size: 28px;
    font-weight: 600;
    color: rgb(0 0 0 / 85%);
  }

  .dark .title {
    color: #fff;
  }

  /* ===== Logo ===== */
  .loading-logo {
    display: block;
    max-width: 120px;
    max-height: 120px;
    margin-bottom: 20px;
  }

  /* ===== 副标题 ===== */
  .loading-description {
    margin-top: 12px;
    font-size: 14px;
    color: rgb(0 0 0 / 45%);
  }
  .dark .loading-description {
    color: rgb(255 255 255 / 45%);
  }

  /* ===== 动画：bounce（默认） ===== */
  .loader {
    position: relative;
    width: 48px;
    height: 48px;
  }

  .loader::before {
    position: absolute;
    top: 60px;
    left: 0;
    width: 48px;
    height: 5px;
    content: '';
    background: hsl(var(--primary, 210 100% 50%) / 50%);
    border-radius: 50%;
    animation: shadow-ani 0.5s linear infinite;
  }

  .loader::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: '';
    background: hsl(var(--primary, 210 100% 50%));
    border-radius: 4px;
    animation: jump-ani 0.5s linear infinite;
  }

  @keyframes jump-ani {
    15% { border-bottom-right-radius: 3px; }
    25% { transform: translateY(9px) rotate(22.5deg); }
    50% { border-bottom-right-radius: 40px; transform: translateY(18px) scale(1, 0.9) rotate(45deg); }
    75% { transform: translateY(9px) rotate(67.5deg); }
    100% { transform: translateY(0) rotate(90deg); }
  }

  @keyframes shadow-ani {
    0%, 100% { transform: scale(1, 1); }
    50% { transform: scale(1.2, 1); }
  }

  /* ===== 动画：dots（四角圆点旋转） ===== */
  .loading-animation-dots {
    position: relative;
    box-sizing: border-box;
    display: inline-block;
    width: 48px;
    height: 48px;
    margin-top: 30px;
    font-size: 32px;
    transform: rotate(45deg);
    animation: rotate-ani 1.2s infinite linear;
  }

  .loading-animation-dots i {
    position: absolute;
    display: block;
    width: 20px;
    height: 20px;
    background-color: hsl(var(--primary, 210 100% 50%));
    border-radius: 100%;
    opacity: 0.3;
    transform: scale(0.75);
    transform-origin: 50% 50%;
    animation: spin-move-ani 1s infinite linear alternate;
  }

  .loading-animation-dots i:nth-child(1) { top: 0; left: 0; }
  .loading-animation-dots i:nth-child(2) { top: 0; right: 0; animation-delay: 0.4s; }
  .loading-animation-dots i:nth-child(3) { right: 0; bottom: 0; animation-delay: 0.8s; }
  .loading-animation-dots i:nth-child(4) { bottom: 0; left: 0; animation-delay: 1.2s; }

  @keyframes rotate-ani {
    to { transform: rotate(405deg); }
  }

  @keyframes spin-move-ani {
    to { opacity: 1; }
  }

  /* ===== 动画：spinner（旋转圆环） ===== */
  .loading-animation-spinner {
    position: relative;
    width: 48px;
    height: 48px;
    border: 5px solid hsl(var(--primary, 210 100% 50%) / 20%);
    border-top-color: hsl(var(--primary, 210 100% 50%));
    border-radius: 50%;
    animation: spinner-rotate 0.8s linear infinite;
    box-sizing: border-box;
  }

  @keyframes spinner-rotate {
    to { transform: rotate(360deg); }
  }

  /* ===== 无动画 ===== */
  .loading-animation-none {
    display: none;
  }
</style>
<div class="loading" id="__app-loading__">
  <!-- Logo（由插件动态替换，空值时不渲染） -->
  %VITE_LOADING_LOGO%

  <!-- 动画区域：CSS class 由占位符控制 -->
  <div class="loader loading-animation-%VITE_LOADING_ANIMATION%"></div>

  <!-- 标题 -->
  <div class="title">%VITE_LOADING_TITLE%</div>

  <!-- 副标题（由插件动态替换，空值时不渲染） -->
  %VITE_LOADING_DESCRIPTION%
</div>
```

- [ ] **Step 2: 验证模板语法正确**

Run: `node -e "const fs=require('fs');const h=fs.readFileSync('internal/vite-config/src/plugins/inject-app-loading/default-loading.html','utf8');console.log('Has TITLE:',h.includes('%VITE_LOADING_TITLE%'));console.log('Has LOGO:',h.includes('%VITE_LOADING_LOGO%'));console.log('Has ANIMATION:',h.includes('%VITE_LOADING_ANIMATION%'));console.log('Has DESC:',h.includes('%VITE_LOADING_DESCRIPTION%'))"`
Expected: 全部 4 个占位符输出 `true`

- [ ] **Step 3: 提交**

```bash
git add internal/vite-config/src/plugins/inject-app-loading/default-loading.html
git commit -m "feat: update loading template with env-var placeholders and multiple animation styles
  - Add %VITE_LOADING_TITLE% / %VITE_LOADING_LOGO% / %VITE_LOADING_ANIMATION% / %VITE_LOADING_DESCRIPTION% placeholders
  - Add dots, spinner, none animation CSS
  - Add logo and description styling
  - Keep existing bounce animation as default
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: 更新 .env 文件注释

**Files:**
- Modify: `apps/web-antd/.env.development`
- Modify: `apps/web-antd/.env.production`

**Interfaces:**
- Consumes: 无
- Produces: 用户可见的文档注释

- [ ] **Step 1: 更新 `.env.development`**

在文件末尾追加 `VITE_LOADING_*` 变量说明注释（现有文件末尾是 `VITE_INJECT_APP_LOADING=true` 和 `VITE_DEVTOOLS=false`）：

```bash
# 是否注入全局loading
VITE_INJECT_APP_LOADING=true

# 以下 VITE_LOADING_* 变量用于自定义 app 启动时的全局 loading 画面
# VITE_LOADING_TITLE     - 标题文字（默认 = VITE_APP_TITLE）
# VITE_LOADING_LOGO      - Logo 图片 URL（可选，设了才显示在标题上方）
# VITE_LOADING_ANIMATION - 动画样式: bounce | dots | spinner | none（默认 bounce）
# VITE_LOADING_DESCRIPTION - 副标题文字（可选）

# 是否打开 devtools，true 为打开，false 为关闭
VITE_DEVTOOLS=false
```

- [ ] **Step 2: 更新 `.env.production`**

在文件末尾追加同样注释：

```bash
# 是否注入全局loading
VITE_INJECT_APP_LOADING=true

# VITE_LOADING_TITLE     - 标题文字（默认 = VITE_APP_TITLE）
# VITE_LOADING_LOGO      - Logo 图片 URL（可选）
# VITE_LOADING_ANIMATION - 动画样式: bounce | dots | spinner | none（默认 bounce）
# VITE_LOADING_DESCRIPTION - 副标题文字（可选）

# 打包后是否生成dist.zip
VITE_ARCHIVER=true
```

- [ ] **Step 3: 提交**

```bash
git add apps/web-antd/.env.development apps/web-antd/.env.production
git commit -m "docs: add VITE_LOADING_* env var comments to .env files
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 更新插件逻辑 — 解析 env 变量并替换占位符

**Files:**
- Modify: `internal/vite-config/src/plugins/inject-app-loading/index.ts`

**Interfaces:**
- Consumes: 从 Task 1 生成的模板中的 `%VITE_LOADING_TITLE%`、`%VITE_LOADING_LOGO%`、`%VITE_LOADING_ANIMATION%`、`%VITE_LOADING_DESCRIPTION%` 占位符
- Produces: 完整的 loading HTML 字符串注入到 `index.html` 的 `<body>` 中

- [ ] **Step 1: 读取当前插件代码**

```bash
cat -n internal/vite-config/src/plugins/inject-app-loading/index.ts
```
确认当前行号和内容。

- [ ] **Step 2: 写入新的插件逻辑**

将原有的 `viteInjectAppLoadingPlugin` 函数体从读取模板 → 返回插件的流程，中间插入 env 变量解析 + 占位符替换步骤。

```typescript
import type { PluginOption } from 'vite';

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPackageJSON } from '@vben/node-utils';

/**
 * 用于生成将loading样式注入到项目中
 * 为多app提供loading样式，无需在每个 app -> index.html单独引入
 */
async function viteInjectAppLoadingPlugin(
  isBuild: boolean,
  env: Record<string, any> = {},
  loadingTemplate = 'loading.html',
): Promise<PluginOption | undefined> {
  const loadingHtml = await getLoadingRawByHtmlTemplate(loadingTemplate);

  if (!loadingHtml) {
    return;
  }

  const { version } = await readPackageJSON(process.cwd());
  const envRaw = isBuild ? 'prod' : 'dev';
  const cacheName = `'${env.VITE_APP_NAMESPACE}-${version}-${envRaw}-preferences-theme'`;

  // 获取缓存的主题
  // 保证黑暗主题下，刷新页面时，loading也是黑暗主题
  const injectScript = `
  <script data-app-loading="inject-js">
  var theme = localStorage.getItem(${cacheName});
  document.documentElement.classList.toggle('dark', /dark/.test(theme));
</script>
`;

  // 从环境变量读取 loading 配置
  const loadingConfig = {
    title: env.VITE_LOADING_TITLE || env.VITE_APP_TITLE || 'Vben Admin',
    logo: env.VITE_LOADING_LOGO || '',
    animation: env.VITE_LOADING_ANIMATION || 'bounce',
    description: env.VITE_LOADING_DESCRIPTION || '',
  };

  // 替换模板中的占位符
  const processedHtml = loadingHtml
    .replace(/%VITE_LOADING_TITLE%/g, loadingConfig.title)
    .replace(
      /%VITE_LOADING_LOGO%/g,
      loadingConfig.logo
        ? `<img class="loading-logo" src="${loadingConfig.logo}" alt="logo" />`
        : '',
    )
    .replace(/%VITE_LOADING_ANIMATION%/g, loadingConfig.animation)
    .replace(
      /%VITE_LOADING_DESCRIPTION%/g,
      loadingConfig.description
        ? `<div class="loading-description">${loadingConfig.description}</div>`
        : '',
    );

  return {
    enforce: 'pre',
    name: 'vite:inject-app-loading',
    transformIndexHtml: {
      handler(html) {
        const re = /<body\s*>/;
        html = html.replace(re, `<body>${injectScript}${processedHtml}`);
        return html;
      },
      order: 'pre',
    },
  };
}

/**
 * 用于获取loading的html模板
 */
async function getLoadingRawByHtmlTemplate(loadingTemplate: string) {
  // 支持在app内自定义loading模板，模版参考default-loading.html即可
  let appLoadingPath = join(process.cwd(), loadingTemplate);

  if (!fs.existsSync(appLoadingPath)) {
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    appLoadingPath = join(__dirname, './default-loading.html');
  }

  return await fsp.readFile(appLoadingPath, 'utf8');
}

export { viteInjectAppLoadingPlugin };
```

与原文相比的改动：
1. 读取 `loadingHtml` 后移动 `injectScript` 构造（为了语义清晰，加载模板和注入脚本无依赖，可交换顺序）
2. 新增 `loadingConfig` 对象，从 `env.VITE_LOADING_*` 读取值
3. 新增 `processedHtml`，对 `loadingHtml` 字符串做 4 次 `.replace()` 替换占位符
4. `transformIndexHtml.handler` 中引用 `processedHtml` 而非 `loadingHtml`

- [ ] **Step 3: 验证 TypeScript 无语法错误**

Run: `npx --no-install tsc --noEmit --strict internal/vite-config/src/plugins/inject-app-loading/index.ts 2>&1 | head -20`
Expected: 无输出（编译通过）或只有无关的类型定义错误（`tsc --noEmit` 没有项目配置文件时会报找不到模块，确认无语法错误即可）

- [ ] **Step 4: 提交**

```bash
git add internal/vite-config/src/plugins/inject-app-loading/index.ts
git commit -m "feat: load VITE_LOADING_* env vars and replace template placeholders
  - Parse VITE_LOADING_TITLE / VITE_LOADING_LOGO / VITE_LOADING_ANIMATION / VITE_LOADING_DESCRIPTION
  - Conditionally render logo and description HTML only when set
  - Fallback VITE_LOADING_TITLE to VITE_APP_TITLE for backward compatibility
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: 端到端验证

- [ ] **Step 1: 启动 dev server**

```bash
cd frontend
pnpm dev
```

- [ ] **Step 2: 打开浏览器访问 `http://localhost:5666`**

观察 loading 画面。不改 `.env` 预期和之前完全一致："Vben Admin" + bounce 动画。

- [ ] **Step 3: 修改 `.env.development` 添加新变量**

```bash
cat >> apps/web-antd/.env.development <<'EOF'
VITE_LOADING_TITLE=My Custom Title
VITE_LOADING_ANIMATION=dots
VITE_LOADING_DESCRIPTION=Please wait...
EOF
```

重启 dev server（或等待 HMR 重新加载，但 `transformIndexHtml` 可能需要重启），刷新页面。预期：
- 标题显示 "My Custom Title"
- 动画变为四角圆点旋转
- 标题下方显示 "Please wait..."

- [ ] **Step 4: 改 Logo 测试**

```bash
# 找一个测试图片放到 public 目录
cp /path/to/test-logo.png apps/web-antd/public/test-logo.png
# 修改 .env
# VITE_LOADING_LOGO=/test-logo.png
```

重启，刷新。预期：Logo 图片显示在标题上方。

- [ ] **Step 5: 改动画为 spinner**

`.env` 中 `VITE_LOADING_ANIMATION=spinner` → 刷新后显示旋转圆环动画。

- [ ] **Step 6: 测试 none**

`.env` 中 `VITE_LOADING_ANIMATION=none` → 刷新后无动画区域。

- [ ] **Step 7: 清理测试修改**

```bash
git checkout apps/web-antd/.env.development apps/web-antd/.env.production
```

- [ ] **Step 8: 恢复 .env 注释**

重新在 `.env.development` 和 `.env.production` 中添加注释（Task 2 的修改会被 `checkout` 重置），然后提交.
