# App Loading Screen 环境变量可配置化

**日期**: 2026-06-24
**状态**: 已批准

## 背景

当前项目启动时，`vite:inject-app-loading` 插件会在 Vue app 挂载前注入一个全局 loading 画面，默认显示 "Vben Admin" 文字加跳跃动画。用户希望能够通过配置自定义这个 loading，而不需要修改 `loading.html` 模板文件。

## 当前机制

```
.env 的 VITE_APP_TITLE ("Vben Admin")
  → Vite HTML transform 替换 %VITE_APP_TITLE%
  → default-loading.html 中的 <div class="title">%VITE_APP_TITLE%</div>
  → 渲染出 "Vben Admin"
```

插件工作流程：
1. `viteInjectAppLoadingPlugin(isBuild, env)` 被调用
2. 查找 `{appRoot}/loading.html`，存在则使用它；否则使用默认模板 `default-loading.html`
3. 插件在 `transformIndexHtml` 阶段将 loading HTML + 主题检测脚本注入到 `<body>` 后
4. Vue app 挂载后，`unmountGlobalLoading()` 通过 CSS transition 隐藏并移除 loading 元素

## 改动范围

### 1. 新增环境变量

在 `.env.development`（及各 app 的 `.env.production`）中生效：

| 变量 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `VITE_LOADING_TITLE` | string | `VITE_APP_TITLE` | 标题文字 |
| `VITE_LOADING_LOGO` | string | (空) | Logo 图片 URL，设置后显示在标题上方 |
| `VITE_LOADING_ANIMATION` | `bounce` \| `dots` \| `spinner` \| `none` | `bounce` | 动画样式 |
| `VITE_LOADING_DESCRIPTION` | string | (空) | 副标题，显示在标题下方 |

### 2. 修改文件

#### 2.1 `internal/vite-config/src/plugins/inject-app-loading/default-loading.html`

将静态 HTML/CSS 改为模板格式，使用 `%VITE_LOADING_*%` 占位：

```html
<style data-app-loading="inject-css">
  /* 原有样式保留 */
  /* ... */

  /* 新增 dots 动画（复用 default-loading-antd.html 的 4 个圆点旋转动画） */
  .loading-animation-dots { ... }

  /* 新增 spinner 动画 */
  .loading-animation-spinner { ... }

  /* 隐藏型（none） */
  .loading-animation-none { display: none; }

  /* Logo */
  .loading-logo {
    display: block;
    max-width: 120px;
    max-height: 120px;
    margin-bottom: 20px;
  }

  /* 副标题 */
  .loading-description {
    margin-top: 12px;
    font-size: 14px;
    color: rgb(0 0 0 / 45%);
  }
  .dark .loading-description {
    color: rgb(255 255 255 / 45%);
  }
</style>
<div class="loading" id="__app-loading__">
  <!-- Logo（由插件条件性插入，为空时整块不存在） -->
  %VITE_LOADING_LOGO%

  <!-- 动画区域 -->
  <div class="loader loading-animation-%VITE_LOADING_ANIMATION%"></div>

  <!-- 标题 -->
  <div class="title">%VITE_LOADING_TITLE%</div>

  <!-- 副标题（由插件条件性插入，为空时整块不存在） -->
  %VITE_LOADING_DESCRIPTION%
</div>
```

涉及的 CSS 改动：
- 保留现有 `.loader::before/::after` bounce 动画作为默认
- 新增 `.loading-animation-dots`——复用 `default-loading-antd.html` 中的 4 个圆点旋转动画
- 新增 `.loading-animation-spinner`——简单 CSS 旋转圆环
- 新增 `.loading-animation-none`——隐藏
- Logo 和副标题由插件条件性插入：env var 为空时不渲染对应 DOM 元素，无需 CSS 隐藏

#### 2.2 `internal/vite-config/src/plugins/inject-app-loading/index.ts`

插件逻辑调整：补充环境变量的默认值解析。

```typescript
async function viteInjectAppLoadingPlugin(
  isBuild: boolean,
  env: Record<string, any> = {},
  loadingTemplate = 'loading.html',
): Promise<PluginOption | undefined> {
  // 解析 loading 配置（从 env 读取，使用默认值兜底）
  const loadingConfig = {
    title: env.VITE_LOADING_TITLE || env.VITE_APP_TITLE || 'Vben Admin',
    logo: env.VITE_LOADING_LOGO || '',
    animation: env.VITE_LOADING_ANIMATION || 'bounce',
    description: env.VITE_LOADING_DESCRIPTION || '',
  };

  const loadingHtml = await getLoadingRawByHtmlTemplate(loadingTemplate);
  // 替换 loadingHtml 中的 %VITE_LOADING_*% 占位符
  // Logo 和 副标题为空时替换为空字符串（不渲染对应 DOM）
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
  // ...
}
```

**关键设计决策**：`VITE_LOADING_TITLE` 为空时回退到 `VITE_APP_TITLE`，保持完全向后兼容——不改任何 `.env`，显示效果和现在一模一样。

#### 2.3 `apps/web-antd/.env.development`

在文件末尾添加注释，说明可用的 `VITE_LOADING_*` 变量。

### 3. 优先级规则

| 优先级 | 机制 | 说明 |
|---|---|---|
| 最高 | 自定义 `loading.html` | 放在 app 根目录，与 `index.html` 同级。存在时完全覆盖 env var 配置，env 变量不生效 |
| 默认 | `VITE_LOADING_*` env var + 默认模板 | 从 `.env` 读取，插件动态替换 |

## 向后兼容

- 不修改 `.env` → 显示效果完全不变（`VITE_LOADING_TITLE` 回退到 `VITE_APP_TITLE`，动画默认 `bounce`）
- 已有 `loading.html` → 仍然完全覆盖，不受 env var 影响
- 已有 `VITE_APP_TITLE` → 继续正常工作

## 不涉及的范围

- 不修改  `unmountGlobalLoading()` 逻辑
- 不修改 env 加载链路 (`loadAndConvertEnv` / `env.ts`)
- 不修改 `ApplicationPluginOptions` 类型
- 不修改 `application.ts` 配置入口
