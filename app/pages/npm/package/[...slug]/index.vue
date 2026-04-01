<script setup lang="ts">
const packageName = inject<string>("npmPackageName")!;
const pkg = inject<Ref>("npmPkg")!;
const version = computed(() => pkg.value?.version ?? "latest");

const { t } = useI18n();
const { getReadme } = useJsdelivr();

const {
  data: readme,
  pending,
  error,
} = await useAsyncData(
  `npm-readme-${packageName}-${version.value}`,
  async () => {
    // Prefer readme from npm metadata (already fetched by parent), fallback to jsdelivr
    if (pkg.value?.readme) return pkg.value.readme;
    return getReadme(packageName, version.value);
  },
  { watch: [version], lazy: true },
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
