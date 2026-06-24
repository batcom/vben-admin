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
