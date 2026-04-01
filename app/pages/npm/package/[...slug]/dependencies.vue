<script setup lang="ts">
import type { NpmPackage, NpmPackageFull } from "~/types/npm";

const route = useRoute();
const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);
const { data: metadata } = useNuxtData<NpmPackageFull>(`npm-metadata-${packageName}`);
const pkg = computed<NpmPackage | undefined>(() => {
  if (!metadata.value) return undefined;
  const ver = version ?? metadata.value["dist-tags"]?.latest;
  return ver ? metadata.value.versions?.[ver] : undefined;
});
const { t } = useI18n();

interface DepGroup {
  label: string;
  deps: Record<string, string>;
}

const groups = computed<DepGroup[]>(() => {
  const result: DepGroup[] = [];
  if (pkg.value?.dependencies && Object.keys(pkg.value.dependencies).length > 0) {
    result.push({ label: t("package.dependencies"), deps: pkg.value.dependencies });
  }
  if (pkg.value?.peerDependencies && Object.keys(pkg.value.peerDependencies).length > 0) {
    result.push({ label: t("package.peerDependencies"), deps: pkg.value.peerDependencies });
  }
  if (pkg.value?.devDependencies && Object.keys(pkg.value.devDependencies).length > 0) {
    result.push({ label: t("package.devDependencies"), deps: pkg.value.devDependencies });
  }
  return result;
});
</script>

<template>
  <div v-if="groups.length === 0" class="text-muted">
    {{ t("package.noDependencies") }}
  </div>
  <div v-else class="space-y-6">
    <div v-for="group in groups" :key="group.label">
      <h4 class="mb-3 font-semibold">{{ group.label }}</h4>
      <div class="flex flex-wrap gap-2">
        <NuxtLink v-for="(version, name) in group.deps" :key="name" :to="`/npm/package/${name}`">
          <UBadge :label="`${name}@${version}`" variant="outline" color="neutral" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
