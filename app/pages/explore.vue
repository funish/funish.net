<script setup lang="ts">
import simpleIcons from "@iconify-json/simple-icons/icons.json";

const { t } = useI18n();
const { search } = useSearch();

const { data: npmTrending, pending: npmPending } = await useAsyncData(
  "explore-npm",
  () => search({ query: "popularity:>0.5", source: "npm", size: 30, sort: "popularity" }),
  { lazy: true },
);

// Random brand names from simple-icons as Winget search keywords
const allBrandNames = Object.keys((simpleIcons as any).icons).filter(
  (n) => /^[a-z]/.test(n) && n.length > 3 && n.length < 20,
);

const { data: wingetPopular, pending: wingetPending } = await useAsyncData(
  "explore-winget",
  async () => {
    const seen = new Set<string>();
    const results: UnifiedSearchResult[] = [];

    const shuffled = [...allBrandNames].sort(() => Math.random() - 0.5);
    const batchSize = 2;

    for (let i = 0; i < shuffled.length && results.length < 30; i += batchSize) {
      const batch = shuffled.slice(i, i + batchSize);
      const responses = await Promise.all(
        batch.map((kw) => search({ query: kw, source: "winget", size: 3 })),
      );

      for (const res of responses) {
        for (const item of res.results) {
          if (!seen.has(item.name) && results.length < 30) {
            seen.add(item.name);
            results.push(item);
          }
        }
      }
    }

    return { results, total: results.length };
  },
  { lazy: true },
);

useSeoMeta({
  title: () => t("explore.title"),
});
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold">{{ t("explore.title") }}</h1>

    <!-- NPM Trending -->
    <section class="mt-10">
      <h2 class="mb-4 text-xl font-semibold">
        {{ t("explore.npm") }}
      </h2>
      <NpmGrid
        :packages="npmTrending?.results ?? []"
        :loading="npmPending"
        :empty-text="t('org.noPackages')"
        :max-keywords="5"
      />
    </section>

    <USeparator class="my-10" />

    <!-- Winget Popular -->
    <section>
      <h2 class="mb-4 text-xl font-semibold">
        {{ t("explore.winget") }}
      </h2>
      <NpmGrid
        :packages="wingetPopular?.results ?? []"
        :loading="wingetPending"
        :empty-text="t('org.noPackages')"
        :max-keywords="5"
      />
    </section>
  </UContainer>
</template>
