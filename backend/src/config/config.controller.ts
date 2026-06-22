import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma.service';

const CONFIG_KEYS = [
  'site_name', 'site_description', 'site_logo_url', 'site_default_avatar', 'site_icp',
  'copyright_company', 'copyright_date', 'copyright_enable', 'copyright_icp', 'copyright_site_link',
  'login_show_code_login', 'login_show_forget_password', 'login_show_qrcode_login',
  'login_show_register', 'login_show_remember_me', 'login_show_role_selector',
  'login_show_slider_captcha', 'login_show_third_party',
  'application',
];

@Controller('config')
export class ConfigController {
  constructor(private prisma: PrismaService) {}

  @Get('site')
  @Public()
  async getSiteConfig() {
    const rows = await this.prisma.sys_config.findMany({
      where: { key: { in: CONFIG_KEYS } },
    });

    const map: Record<string, any> = {};
    for (const row of rows) {
      let val = row.value;
      // Parse JSON string type values
      if (row.type === 'json' || row.type === 'object') {
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch { /* keep as-is */ }
        }
      }
      map[row.key] = val;
    }

    // Build application name from application JSON or fallback
    const appConfig = map.application || {};
    const siteName = map.site_name || appConfig?.name || 'Vben Admin';

    return {
      site: {
        name: siteName,
        description: map.site_description || '',
        logoUrl: map.site_logo_url || '',
        defaultAvatar: map.site_default_avatar || '',
        icp: map.site_icp || '',
      },
      copyright: {
        enable: map.copyright_enable !== false,
        companyName: map.copyright_company || siteName,
        date: map.copyright_date || new Date().getFullYear().toString(),
        icp: map.copyright_icp || '',
        companySiteLink: map.copyright_site_link || '',
      },
      login: {
        showCodeLogin: map.login_show_code_login !== false,
        showForgetPassword: map.login_show_forget_password !== false,
        showQrcodeLogin: map.login_show_qrcode_login !== false,
        showRegister: map.login_show_register !== false,
        showRememberMe: map.login_show_remember_me !== false,
        showRoleSelector: map.login_show_role_selector === true,
        showSliderCaptcha: map.login_show_slider_captcha !== false,
        showThirdPartyLogin: map.login_show_third_party === true,
      },
    };
  }
}
