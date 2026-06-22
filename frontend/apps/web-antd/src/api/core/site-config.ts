import { requestClient } from '#/api/request';

export interface SiteConfig {
  site: {
    name: string;
    description: string;
    logoUrl: string;
    defaultAvatar: string;
    icp: string;
  };
  copyright: {
    enable: boolean;
    companyName: string;
    date: string;
    icp: string;
    companySiteLink: string;
  };
  login: {
    showCodeLogin: boolean;
    showForgetPassword: boolean;
    showQrcodeLogin: boolean;
    showRegister: boolean;
    showRememberMe: boolean;
    showRoleSelector: boolean;
    showSliderCaptcha: boolean;
    showThirdPartyLogin: boolean;
  };
}

export async function getSiteConfigApi(): Promise<SiteConfig> {
  return requestClient.get('/config/site');
}
