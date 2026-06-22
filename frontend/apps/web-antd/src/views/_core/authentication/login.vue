<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, markRaw, onMounted, ref } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';
import type { SiteConfig } from '#/api/core/site-config';
import { getSiteConfigApi } from '#/api/core/site-config';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const siteConfig = ref<SiteConfig | null>(null);

onMounted(async () => {
  try {
    siteConfig.value = await getSiteConfigApi();
  } catch {
    // fall back to defaults
  }
});

const MOCK_USER_OPTIONS: BasicOption[] = [
  { label: 'Super', value: 'vben' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'jack' },
];

const formSchema = computed((): VbenFormSchema[] => {
  const schemas: VbenFormSchema[] = [];
  const cfg = siteConfig.value?.login;

  // Role selector — only for dev
  if (cfg?.showRoleSelector) {
    schemas.push({
      component: 'VbenSelect',
      componentProps: {
        options: MOCK_USER_OPTIONS,
        placeholder: $t('authentication.selectAccount'),
      },
      fieldName: 'selectAccount',
      label: $t('authentication.selectAccount'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.selectAccount') })
        .optional()
        .default('vben'),
    });
  }

  schemas.push({
    component: 'VbenInput',
    componentProps: {
      placeholder: $t('authentication.usernameTip'),
    },
    dependencies: cfg?.showRoleSelector
      ? {
          trigger(values, form) {
            if (values.selectAccount) {
              const findUser = MOCK_USER_OPTIONS.find(
                (item) => item.value === values.selectAccount,
              );
              if (findUser) {
                form.setValues({
                  password: '123456',
                  username: findUser.value,
                });
              }
            }
          },
          triggerFields: ['selectAccount'],
        }
      : undefined,
    fieldName: 'username',
    label: $t('authentication.username'),
    rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
  });

  schemas.push({
    component: 'VbenInputPassword',
    componentProps: {
      placeholder: $t('authentication.password'),
    },
    fieldName: 'password',
    label: $t('authentication.password'),
    rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
  });

  // Slider captcha — controlled by config
  if (cfg?.showSliderCaptcha) {
    schemas.push({
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    });
  }

  return schemas;
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="siteConfig?.login?.showCodeLogin ?? true"
    :show-forget-password="siteConfig?.login?.showForgetPassword ?? true"
    :show-qrcode-login="siteConfig?.login?.showQrcodeLogin ?? true"
    :show-register="siteConfig?.login?.showRegister ?? true"
    :show-remember-me="siteConfig?.login?.showRememberMe ?? true"
    :show-third-party-login="siteConfig?.login?.showThirdPartyLogin ?? false"
    @submit="authStore.authLogin"
  />
</template>
