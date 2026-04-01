<script setup lang="ts">
import type { WingetLocaleData, WingetVersionData } from "~/types/winget";

const route = useRoute();
const router = useRouter();
const { t, locale: userLocale } = useI18n();
const { getVersions, getLocales, getLocale } = useWinget();

const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);

if (!packageName) {
  throw createError({ statusCode: 404, message: t("common.notFound") });
}

// Fetch versions first
const {
  data: versions,
  pending: versionsPending,
  error,
} = await useAsyncData<WingetVersionData[]>(
  computed(() => `winget-versions-${packageName}`),
  () => getVersions(packageName),
  { lazy: true },
);

// Determine the display version (from URL param or latest semver from versions list)
const displayVersion = computed(() => {
  if (!versions.value?.length) return "";
  // If URL specifies a version, validate it exists
  if (version && versions.value.some((v) => v.PackageVersion === version)) return version;
  const semver = versions.value.find((v) => /^\d/.test(v.PackageVersion));
  return semver?.PackageVersion ?? versions.value[0]!.PackageVersion;
});

// Fetch locale for the display version to get full package info
const { data: locale } = await useAsyncData<WingetLocaleData | undefined>(
  computed(() => `winget-locale-${packageName}-${displayVersion.value}`),
  async () => {
    if (!displayVersion.value) return undefined;
    const locales = await getLocales(packageName, displayVersion.value);
    if (!locales.length) return undefined;
    const available = locales.map((l) => l.PackageLocale);
    // Prefer user's locale, fallback to en-US
    const preferred = userLocale.value === "zh_cn" ? "zh-CN" : "en-US";
    const target = available.includes(preferred) ? preferred : available[0];
    return getLocale(packageName, displayVersion.value, target);
  },
  { lazy: true },
);

// Provide data to child routes
provide("wingetPackageName", packageName);
provide("wingetDisplayVersion", displayVersion);
provide("wingetVersions", versions);
provide("wingetLocale", locale);

useSeoMeta({
  title: () =>
    locale.value
      ? `${locale.value.PackageName ?? packageName} - Funish`
      : `${packageName} - Funish`,
  description: () => locale.value?.ShortDescription ?? "",
});

// Tab navigation via route
const basePath = computed(() => `/winget/package/${slug.join("/")}`);

const wingetTabs = computed(() => [
  { label: t("package.tab.description"), value: "" },
  { label: t("package.tab.versions"), value: "versions" },
  { label: t("package.tab.installers"), value: "installers" },
]);

const tabNames = ["", "versions", "installers"] as const;

const activeTab = computed(() => {
  const path = route.path;
  for (const tab of tabNames) {
    if (tab && path.endsWith(`/${tab}`)) return tab;
  }
  return "";
});

function onTabChange(value: string | number) {
  const v = String(value);
  router.push(v ? `${basePath.value}/${v}` : basePath.value);
}
</script>

<template>
  <UContainer class="py-8">
    <!-- Loading skeleton -->
    <template v-if="versionsPending">
      <div class="space-y-6">
        <USkeleton class="h-8 w-64" />
        <USkeleton class="h-5 w-full max-w-2xl" />
        <USkeleton class="h-4 w-96" />
        <USeparator />
        <USkeleton class="h-64 w-full" />
      </div>
    </template>

    <!-- 404 -->
    <template v-else-if="error || !versions?.length">
      <UEmpty
        icon="i-lucide-package-x"
        :title="t('common.notFound')"
        :description="packageName"
        :actions="[{ label: t('common.back'), variant: 'outline', to: '/' }]"
      />
    </template>

    <!-- Package detail -->
    <template v-else>
      <PackageHero
        source="winget"
        :name="locale?.PackageName ?? packageName"
        :identifier="packageName"
        :description="locale?.ShortDescription"
        :version="displayVersion"
        :homepage="locale?.PackageUrl"
        :author="locale?.Publisher"
        :license="locale?.License"
        :keywords="locale?.Tags"
      />

      <div class="mt-4">
        <UTabs :model-value="activeTab" :items="wingetTabs" @update:model-value="onTabChange">
          <template #content>
            <NuxtPage />
          </template>
        </UTabs>
      </div>
    </template>
  </UContainer>
</template>
