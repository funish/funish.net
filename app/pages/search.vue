<script setup lang="ts">
import type { FetchError } from "ofetch";

import type { SearchSource, NpmSort } from "~/composables/useSearch";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { search } = useSearch();
const { checkOrgExists } = useNpm();

const query = ref((route.query.q as string) || "");
const source = useLocalStorage<SearchSource>(
  "search-source",
  (route.query.source as SearchSource) || "npm",
);
const sort = useLocalStorage<NpmSort | "best">(
  "search-sort",
  (route.query.sort as NpmSort) || "best",
);
const filter = useLocalStorage<string>("search-filter", (route.query.filter as string) || "all");
const page = computed(() => Number(route.query.page) || 1);
const pageSize = 20;
const maxPage = 250;

const searchText = computed(() => {
  const q = query.value.trim();
  if (!q) return "";
  if (source.value !== "npm" || filter.value === "all") return q;
  return `${filter.value}:${q}`;
});

const results = ref<Awaited<ReturnType<typeof search>>["results"]>([]);
const total = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);

const totalPages = computed(() => Math.min(Math.ceil(total.value / pageSize), maxPage));

const sourceItems = computed(() => [
  { label: t("search.npm"), value: "npm" as const, icon: "i-vscode-icons-file-type-npm" },
  { label: t("search.winget"), value: "winget" as const, icon: "i-lucide-package" },
]);

const sortItems = computed(() => [
  { label: t("search.sort.bestMatch"), value: "best" as const },
  { label: t("search.sort.quality"), value: "quality" as const },
  { label: t("search.sort.popularity"), value: "popularity" as const },
  { label: t("search.sort.maintenance"), value: "maintenance" as const },
]);

const filterItems = computed(() => [
  { label: t("search.filter.all"), value: "all" },
  { label: t("search.filter.author"), value: "author" },
  { label: t("search.filter.maintainer"), value: "maintainer" },
  { label: t("search.filter.keywords"), value: "keywords" },
  { label: t("search.filter.scope"), value: "scope" },
]);

// Org suggestion: check if query is a valid org name
const orgSuggestion = ref<{ name: string; packageCount: number } | null>(null);
const checkingOrg = ref(false);

function isValidOrgCandidate(term: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/.test(term) && !term.includes("@") && !term.includes("/");
}

async function checkOrg(term: string) {
  if (source.value !== "npm" || !isValidOrgCandidate(term)) {
    orgSuggestion.value = null;
    return;
  }

  checkingOrg.value = true;
  try {
    const count = await checkOrgExists(term);
    orgSuggestion.value = count > 0 ? { name: term, packageCount: count } : null;
  } catch {
    orgSuggestion.value = null;
  } finally {
    checkingOrg.value = false;
  }
}

async function doSearch() {
  const q = query.value.trim();
  if (!q || q.length < 2) {
    results.value = [];
    total.value = 0;
    orgSuggestion.value = null;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const data = await search({
      query: searchText.value,
      source: source.value,
      size: pageSize,
      from: (page.value - 1) * pageSize,
      sort: source.value === "npm" && sort.value !== "best" ? sort.value : undefined,
    });
    results.value = data.results;
    total.value = data.total;
  } catch (err: unknown) {
    const fetchErr = err as FetchError<{ error?: string }>;
    error.value = fetchErr?.data?.error || t("common.error");
    results.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }

  checkOrg(query.value.trim());
}

function buildQueryParams(): Record<string, string> {
  const params: Record<string, string> = { q: query.value, source: source.value };
  if (sort.value !== "best") params.sort = sort.value;
  if (filter.value !== "all") params.filter = filter.value;
  return params;
}

// Debounced: sync params on input change (resets page to 1)
watchDebounced(
  [query, source, sort, filter],
  () => {
    router.replace({ query: buildQueryParams() });
  },
  { debounce: 300 },
);

// Search on route change (initial load, back/forward, pagination)
watch(() => route.query, doSearch, { immediate: true });

// Pagination link function
function pageTo(p: number) {
  return {
    query: { ...buildQueryParams(), ...(p > 1 ? { page: String(p) } : {}) },
  };
}

useSeoMeta({
  title: () => (query.value ? t("search.searchFor", { query: query.value }) : t("nav.search")),
});
</script>

<template>
  <UContainer class="py-4 sm:py-8">
    <!-- Search bar -->
    <div class="flex flex-col gap-2 sm:flex-row">
      <UFieldGroup class="w-full">
        <USelectMenu
          v-model="source"
          :items="sourceItems"
          value-key="value"
          :ui="{ base: 'w-28 shrink-0' }"
        />

        <UInput
          v-model="query"
          :placeholder="t('search.placeholder')"
          icon="i-lucide-search"
          size="lg"
          class="flex-1"
          @keydown.enter="doSearch"
        />
      </UFieldGroup>

      <USelectMenu
        v-if="source === 'npm'"
        v-model="filter"
        :items="filterItems"
        value-key="value"
        class="w-full sm:w-32 sm:shrink-0"
      />
    </div>

    <!-- Org suggestion card -->
    <div v-if="orgSuggestion && !loading" class="mt-4">
      <NuxtLink
        :to="`/npm/org/${orgSuggestion.name}`"
        class="border-primary/30 bg-primary/5 hover:bg-primary/10 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
      >
        <UIcon name="i-lucide-building-2" class="text-primary size-5" />
        <div class="flex-1">
          <span class="font-medium">@{{ orgSuggestion.name }}</span>
          <span class="text-muted ml-2 text-sm">
            {{ t("search.suggestion.orgExists", { org: orgSuggestion.name }) }}
          </span>
        </div>
        <UIcon name="i-lucide-arrow-right" class="text-muted size-4" />
      </NuxtLink>
    </div>

    <!-- Results info + sort -->
    <div v-if="query && !error" class="mt-4 flex items-center justify-between text-sm">
      <span v-if="!error" class="text-muted">
        <template v-if="loading">{{ t("common.loading") }}</template>
        <template v-else>{{ t("search.results", { count: total }) }}</template>
      </span>

      <USelectMenu
        v-if="source === 'npm'"
        v-model="sort"
        :items="sortItems"
        value-key="value"
        :placeholder="t('search.sort.bestMatch')"
        :ui="{ base: 'w-44 shrink-0' }"
      />
    </div>

    <!-- Results list -->
    <div class="mt-6 space-y-3">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="border-muted rounded-lg border p-4">
          <USkeleton class="h-5 w-48" />
          <USkeleton class="mt-2 h-4 w-full" />
          <USkeleton class="mt-1 h-3 w-32" />
        </div>
      </template>

      <template v-else-if="results.length > 0">
        <PackageCard v-for="(item, i) in results" :key="i" :item="item" />
      </template>

      <UAlert v-else-if="error" color="error" icon="i-lucide-circle-alert" :title="error" />

      <div v-else-if="query && !loading" class="text-muted py-16 text-center">
        {{ t("search.noResults") }}
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <UPagination
        :page="page"
        :total="totalPages * pageSize"
        :items-per-page="pageSize"
        :to="pageTo"
      />
    </div>
  </UContainer>
</template>
