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
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}>();

const src = computed(() => {
  const raw = props.src ?? "";
  if (!raw || hasProtocol(raw) || raw.startsWith("/")) return raw;

  const repoUrl = pkg.value?.repository?.url;
  if (!repoUrl) return raw;
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) return raw;

  return joinURL(`https://cdn.jsdelivr.net/gh/${match[1]}/${match[2]}/`, raw);
});
</script>

<template>
  <img :src="src" :alt="alt" :width="width" :height="height" />
</template>
