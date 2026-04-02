<script setup lang="ts">
import type { UnifiedSearchResult } from "~/composables/useSearch";

const route = useRoute();
const { t } = useI18n();
const { searchPackages } = useNpm();

const username = route.params.username as string;

if (!username) {
  throw createError({ statusCode: 404, message: t("common.notFound") });
}

const pageSize = 30;
const page = ref(1);
const filter = ref("");

// Fetch all packages maintained by this user (supports CORS)
const {
  data: allPackages,
  pending: namesPending,
  error: namesError,
} = await useAsyncData(
  `npm-user-${username}`,
  async () => {
    const results: UnifiedSearchResult[] = [];
    let from = 0;
    const size = 250;
    while (true) {
      const data = await searchPackages(`maintainer:${username}`, size, from);
      const items = data.objects
        .filter((o) => o.package.maintainers?.some((m) => m.username === username))
        .map((o) => ({
          source: "npm" as const,
          name: o.package.name,
          description: o.package.description,
          version: o.package.version,
          url: `/npm/package/${o.package.name}`,
          keywords: o.package.keywords,
          license: o.package.license,
          lastPublish: o.package.date,
          downloads: o.downloads?.monthly,
        }));
      results.push(...items);
      if (data.objects.length < size) break;
      from += size;
    }
    return results;
  },
  { watch: [() => route.params.username], lazy: true },
);

const filteredPackages = computed(() => {
  const all = allPackages.value ?? [];
  if (!filter.value) return all;
  const q = filter.value.toLowerCase();
  return all.filter((p) => p.name.toLowerCase().includes(q));
});

const total = computed(() => filteredPackages.value.length);
const paginatedPackages = computed(() =>
  filteredPackages.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);

watch(filter, () => {
  page.value = 1;
});
</script>

<template>
  <UContainer class="py-8">
    <!-- User header -->
    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">{{ username }}</h1>
        <p class="text-muted">
          {{ t("user.packages") }}
          <span v-if="total > 0" class="ml-1 text-sm">({{ total }})</span>
        </p>
      </div>
      <UInput
        v-model="filter"
        :placeholder="t('user.filterPlaceholder')"
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
      :packages="paginatedPackages"
      :loading="namesPending"
      :empty-text="t('user.noPackages')"
      :max-keywords="5"
    />

    <!-- Pagination -->
    <div v-if="total > pageSize" class="border-default mt-6 flex justify-end border-t px-4 pt-4">
      <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" />
    </div>
  </UContainer>
</template>
