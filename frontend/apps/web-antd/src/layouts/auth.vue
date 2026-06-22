<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';
import type { SiteConfig } from '#/api/core/site-config';
import { getSiteConfigApi } from '#/api/core/site-config';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
const logoDark = computed(() => preferences.logo.sourceDark);

const siteConfig = ref<SiteConfig | null>(null);

onMounted(async () => {
  try {
    siteConfig.value = await getSiteConfigApi();
  } catch {
    // fall back to preferences defaults
  }
});

const displayName = computed(() => {
  if (siteConfig.value?.site?.name) return siteConfig.value.site.name;
  return appName.value;
});

const displayLogo = computed(() => {
  if (siteConfig.value?.site?.logoUrl) return siteConfig.value.site.logoUrl;
  return logo.value;
});
</script>

<template>
  <AuthPageLayout
    :app-name="displayName"
    :logo="displayLogo"
    :logo-dark="logoDark"
    :page-description="siteConfig?.site?.description || $t('authentication.pageDesc')"
    :page-title="displayName"
  >
  </AuthPageLayout>
</template>
