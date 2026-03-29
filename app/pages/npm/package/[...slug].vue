<script setup lang="ts">
import type { NpmPackage } from "~/types/npm";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getPackage, getPackageVersion, getDownloads, getDistTags } = useNpm();

const slug = route.params.slug as string[];
const { packageName, version, isScoped } = usePackageSlug(slug);

if (!packageName || (isScoped && slug.length < 2) || (!isScoped && slug.length < 1)) {
  throw createError({ statusCode: 404, message: t("common.notFound") });
}

const dataKey = computed(() => `npm-${packageName}-${version ?? "latest"}`);

const {
  data: pkg,
  pending,
  error,
} = await useAsyncData<NpmPackage>(dataKey, () =>
  version ? getPackageVersion(packageName, version) : getPackage(packageName),
);

const { data: downloads } = await useAsyncData(
  computed(() => `npm-downloads-${packageName}`),
  () => getDownloads(packageName, "last-month"),
  { lazy: true },
);

const { data: distTags } = await useAsyncData(
  computed(() => `npm-disttags-${packageName}`),
  () => getDistTags(packageName),
  { lazy: true },
);

// Provide package data to child routes
provide("npmPkg", pkg);
provide("npmPackageName", packageName);
provide("npmVersion", version);
provide("npmDistTags", distTags);

const authorName = computed(() => {
  if (!pkg.value?.author) return undefined;
  if (typeof pkg.value.author === "string") return pkg.value.author;
  return pkg.value.author.name || pkg.value.author.email;
});

const authorUrl = computed(() => {
  if (typeof pkg.value?.author === "object" && pkg.value.author?.url) {
    return pkg.value.author.url;
  }
  return undefined;
});

useSeoMeta({
  title: () => (pkg.value ? `${pkg.value.name} - Funish` : packageName),
  description: () => pkg.value?.description ?? "",
});

// Tab navigation via route
const basePath = computed(() => `/npm/package/${slug.join("/")}`);

const npmTabs = computed(() => [
  { label: t("package.tab.readme"), value: "" },
  { label: t("package.tab.versions"), value: "versions" },
  { label: t("package.tab.dependencies"), value: "dependencies" },
  { label: t("package.tab.files"), value: "files" },
]);

const tabNames = ["", "versions", "dependencies", "files"] as const;

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
    <template v-if="pending">
      <div class="space-y-6">
        <USkeleton class="h-8 w-64" />
        <USkeleton class="h-5 w-full max-w-2xl" />
        <USkeleton class="h-4 w-96" />
        <USeparator />
        <USkeleton class="h-64 w-full" />
      </div>
    </template>

    <!-- 404 -->
    <template v-else-if="error || !pkg">
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
        source="npm"
        :name="pkg.name"
        :description="pkg.description"
        :version="pkg.version"
        :license="pkg.license"
        :homepage="pkg.homepage"
        :repository="pkg.repository?.url?.replace('git+', '').replace('.git', '')"
        :bugs="pkg.bugs?.url"
        :author="authorName"
        :author-url="authorUrl"
        :maintainers="pkg.maintainers"
        :downloads="downloads?.downloads"
        :dist-tags="distTags"
        :keywords="pkg.keywords"
        :size="pkg.dist?.unpackedSize"
        :file-count="pkg.dist?.fileCount"
      />

      <div class="mt-4">
        <UTabs :model-value="activeTab" :items="npmTabs" @update:model-value="onTabChange">
          <template #content>
            <NuxtPage />
          </template>
        </UTabs>
      </div>
    </template>
  </UContainer>
</template>
