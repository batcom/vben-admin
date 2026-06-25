import { preferences, updatePreferences } from '@vben/preferences';

import { getSiteConfigApi } from '#/api/core/site-config';

let loading = false;

/**
 * 从后端加载站点配置，更新到 preferences 中。
 * 所有绑定 preferences.app.name / preferences.copyright.* 的组件会 reactively 更新。
 */
export async function refreshSiteConfig() {
  if (loading) {
    return;
  }
  loading = true;
  try {
    const config = await getSiteConfigApi();

    // 更新后台左上角标题 + 浏览器标签动态标题
    if (config.site.name) {
      updatePreferences({ app: { name: config.site.name } });
    }

    // 更新 Logo
    if (config.site.logoUrl) {
      updatePreferences({ logo: { source: config.site.logoUrl } });
    }

    // 更新登录页版权信息（公司名、链接、备案号等）
    if (config.copyright) {
      updatePreferences({
        copyright: {
          companyName:
            config.copyright.companyName || preferences.copyright.companyName,
          companySiteLink:
            config.copyright.companySiteLink ||
            preferences.copyright.companySiteLink,
          date: config.copyright.date || preferences.copyright.date,
          icp: config.copyright.icp || preferences.copyright.icp,
          enable: config.copyright.enable,
        },
      });
    }

    return config;
  } catch {
    // 接口不可用时保持默认值
  } finally {
    loading = false;
  }
}
