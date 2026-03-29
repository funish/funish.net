<script setup lang="ts">
import type { UnifiedSearchResult } from "~/composables/useSearch";

const { t } = useI18n();
const { search } = useSearch();

const { data: npmTrending, pending: npmPending } = await useAsyncData(
  "explore-npm",
  () => search({ query: "popularity:>0.5", source: "npm", size: 30, sort: "popularity" }),
  { lazy: true },
);

const wingetKeywords = [
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "Meta",
  "Nvidia",
  "Intel",
  "Adobe",
  "Oracle",
  "Tencent",
  "Alibaba",
  "ByteDance",
  "Huawei",
  "Samsung",
  "Spotify",
  "Telegram",
  "Discord",
  "Slack",
  "Zoom",
  "VLC",
  "Docker",
  "Cloudflare",
  "Vercel",
  "TailwindCSS",
  "NodeJS",
  "Python",
  "Git",
  "7-Zip",
  "Sublime Text",
  "Epic Games",
];

const { data: wingetPopular, pending: wingetPending } = await useAsyncData(
  "explore-winget",
  async () => {
    const responses = await Promise.all(
      wingetKeywords.map((kw) => search({ query: kw, source: "winget", size: 5 })),
    );

    const seen = new Set<string>();
    const results: UnifiedSearchResult[] = [];

    for (const res of responses) {
      for (const item of res.results) {
        if (!seen.has(item.name) && results.length < 30) {
          seen.add(item.name);
          results.push(item);
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
