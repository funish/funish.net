<script setup lang="ts">
import type { NpmPackageFull } from "~/types/npm";

const route = useRoute();
const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);
const currentVersion = version ?? "latest";

const { data: metadata } = useNuxtData<NpmPackageFull>(`npm-metadata-${packageName}`);

const { t } = useI18n();
const { getReadme } = useJsdelivr();

const {
  data: readme,
  pending,
  error,
} = await useAsyncData(
  `npm-readme-${packageName}-${currentVersion}`,
  async () => {
    // Prefer readme from full metadata (already fetched by parent)
    if (version) {
      const verReadme = metadata.value?.versions?.[version]?.readme;
      if (verReadme) return verReadme;
    } else if (metadata.value?.readme) {
      return metadata.value.readme;
    }
    // Fallback to jsdelivr
    return getReadme(packageName, currentVersion);
  },
  { lazy: true },
);
</script>

<template>
  <div class="py-4">
    <template v-if="pending">
      <div class="space-y-3">
        <USkeleton class="h-6 w-48" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-5/6" />
      </div>
    </template>

    <template v-else-if="error || !readme">
      <p class="text-muted">
        {{ t("package.noReadme") }}
      </p>
    </template>

    <template v-else>
      <div class="[&_img]:inline! [&_img]:w-auto!">
        <MDC :value="readme" />
      </div>
    </template>
  </div>
</template>
