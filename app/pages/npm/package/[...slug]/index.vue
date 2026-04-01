<script setup lang="ts">
import type { MDCParserResult } from "@nuxtjs/mdc";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";

import { NpmReadmeImg, NpmReadmeA } from "#components";
import type { NpmPackageFull } from "~/types/npm";

const route = useRoute();
const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);
const currentVersion = version ?? "latest";

const { data: metadata } = useNuxtData<NpmPackageFull>(`npm-metadata-${packageName}`);

const { t } = useI18n();
const { getReadme } = useJsdelivr();

const {
  data: parsed,
  pending,
  error,
} = await useAsyncData<MDCParserResult>(
  `npm-readme-${packageName}-${currentVersion}`,
  async () => {
    let content: string | null | undefined;
    if (version) {
      content = metadata.value?.versions?.[version]?.readme;
    }
    if (!content) {
      content = metadata.value?.readme;
    }
    if (!content) {
      content = await getReadme(packageName, currentVersion);
    }
    return await parseMarkdown(content ?? "");
  },
  { lazy: true },
);

const readmeComponents = {
  img: NpmReadmeImg,
  a: NpmReadmeA,
};
</script>

<template>
  <template v-if="pending">
    <div class="space-y-3">
      <USkeleton class="h-6 w-48" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-3/4" />
      <USkeleton class="h-4 w-5/6" />
    </div>
  </template>

  <template v-else-if="error || !parsed?.body">
    <p class="text-muted">
      {{ t("package.noReadme") }}
    </p>
  </template>

  <template v-else>
    <div class="[&_img]:inline! [&_img]:w-auto!">
      <MDCRenderer :body="parsed.body" :data="parsed.data" :components="readmeComponents" />
    </div>
  </template>
</template>
