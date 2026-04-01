<script setup lang="ts">
import { hasProtocol, joinURL } from "ufo";

import type { NpmPackageFull } from "~/types/npm";

const route = useRoute();
const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);
const { data: metadata } = useNuxtData<NpmPackageFull>(`npm-metadata-${packageName}`);

const pkg = computed(() => {
  if (!metadata.value) return undefined;
  const ver = version ?? metadata.value["dist-tags"]?.latest;
  return ver ? metadata.value.versions?.[ver] : undefined;
});

const props = defineProps<{
  href?: string;
  target?: string;
}>();

const href = computed(() => {
  const raw = props.href ?? "";
  if (!raw || hasProtocol(raw) || raw.startsWith("/") || raw.startsWith("#")) return raw;

  const repoUrl = pkg.value?.repository?.url;
  if (!repoUrl) return raw;
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) return raw;

  return joinURL(`https://cdn.jsdelivr.net/gh/${match[1]}/${match[2]}/`, raw);
});

const isExternal = computed(() => hasProtocol(href.value));
</script>

<template>
  <NuxtLink :href="href" :target="isExternal ? '_blank' : target">
    <slot />
  </NuxtLink>
</template>
