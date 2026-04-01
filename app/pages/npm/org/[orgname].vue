<script setup lang="ts">
import type { UnifiedSearchResult } from "~/composables/useSearch";
import type { NpmPackage } from "~/types/npm";

const route = useRoute();
const { t } = useI18n();
const { getOrgPackages, getPackage } = useNpm();

const orgname = route.params.orgname as string;

if (!orgname) {
  throw createError({ statusCode: 404, message: t("common.notFound") });
}

const pageSize = 30;
const page = ref(1);
const filter = ref("");

const {
  data: names,
  pending: namesPending,
  error: namesError,
} = await useAsyncData(
  `npm-org-names-${orgname}`,
  () => getOrgPackages(orgname).then((map) => Object.keys(map).reverse()),
  { watch: [() => route.params.orgname], lazy: true },
);

const filteredNames = computed(() => {
  const all = names.value ?? [];
  if (!filter.value) return all;
  const q = filter.value.toLowerCase();
  return all.filter((name) => name.toLowerCase().includes(q));
});

const paginatedNames = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredNames.value.slice(start, start + pageSize);
});

const total = computed(() => filteredNames.value.length);

const { data: packages, pending: pkgsPending } = await useAsyncData(
  computed(() => `npm-org-pkgs-${orgname}-${page.value}-${filter.value}`),
  async () => {
    if (!paginatedNames.value.length) return [];
    const responses = await Promise.all(
      paginatedNames.value.map((name) => getPackage(name).catch(() => null)),
    );
    return responses
      .filter((pkg): pkg is NpmPackage => pkg !== null)
      .map((pkg) => ({
        source: "npm" as const,
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        url: `/npm/package/${pkg.name}`,
        keywords: pkg.keywords,
        license: pkg.license,
      }));
  },
  { watch: [paginatedNames], lazy: true },
);

watch(filter, () => {
  page.value = 1;
});
</script>

<template>
  <UContainer class="py-8">
    <!-- Org header -->
    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">@{{ orgname }}</h1>
        <p class="text-muted">
          {{ t("org.packages") }}
          <span v-if="total > 0" class="ml-1 text-sm">({{ total }})</span>
        </p>
      </div>
      <UInput
        v-model="filter"
        :placeholder="t('org.filterPlaceholder')"
        icon="i-lucide-search"
        class="w-64"
        clearable
      />
    </div>

    <!-- Error -->
    <UAlert
      v-if="namesError"
      color="error"
      icon="i-lucide-circle-alert"
      :title="t('common.error')"
    />

    <!-- Package list -->
    <NpmGrid
      v-else
      :packages="packages ?? []"
      :loading="namesPending || pkgsPending"
      :empty-text="t('org.noPackages')"
      :max-keywords="5"
    />

    <!-- Pagination -->
    <div v-if="total > pageSize" class="border-default mt-6 flex justify-end border-t px-4 pt-4">
      <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" />
    </div>
  </UContainer>
</template>
