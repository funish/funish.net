<script setup lang="ts">
import type { NpmDownloadPoint, NpmPackage, NpmPackageFull } from "~/types/npm";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getFullMetadata, getDownloads } = useNpm();

const slug = route.params.slug as string[];
const { packageName, version, isScoped } = usePackageSlug(slug);

if (!packageName || (isScoped && slug.length < 2) || (!isScoped && slug.length < 1)) {
  throw createError({ statusCode: 404, message: t("common.notFound") });
}

// Single full metadata fetch — contains all versions, dist-tags, readme, etc.
const {
  data: metadata,
  pending,
  error,
} = await useAsyncData<NpmPackageFull>(
  `npm-metadata-${packageName}`,
  () => getFullMetadata(packageName),
  { lazy: true },
);

// Derive current version's package data from full metadata
const pkg = computed<NpmPackage | undefined>(() => {
  if (!metadata.value) return undefined;
  const ver = version ?? metadata.value["dist-tags"]?.latest;
  return ver ? metadata.value.versions?.[ver] : undefined;
});

const distTags = computed(() => metadata.value?.["dist-tags"] ?? {});

const { data: downloads } = await useAsyncData<NpmDownloadPoint>(
  computed(() => `npm-downloads-${packageName}`),
  () => getDownloads(packageName, "last-month"),
  { lazy: true },
);

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
