<script setup lang="ts">
import type { WingetLocaleData, WingetVersionData } from "~/types/winget";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getVersions, getLocale } = useWinget();

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
);

// Determine the display version (from URL param or latest semver from versions list)
const displayVersion = computed(() => {
  if (version) return version;
  if (!versions.value?.length) return "";
  const semver = versions.value.find((v) => /^\d/.test(v.PackageVersion));
  return semver?.PackageVersion ?? versions.value[0]!.PackageVersion;
});

// Fetch locale for the display version to get full package info
const { data: locale } = await useAsyncData<WingetLocaleData>(
  computed(() => `winget-locale-${packageName}-${displayVersion.value}`),
  () => getLocale(packageName, displayVersion.value),
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
      <div class="flex flex-col items-center justify-center py-24">
        <UIcon name="i-lucide-package-x" class="text-muted size-16" />
        <h2 class="mt-4 text-xl font-semibold">{{ t("common.notFound") }}</h2>
        <p class="text-muted mt-2">{{ packageName }}</p>
        <UButton class="mt-4" :label="t('common.back')" variant="outline" to="/" />
      </div>
    </template>

    <!-- Package detail -->
    <template v-else>
      <PackageHero
        source="winget"
        :name="locale?.PackageName ?? packageName"
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
