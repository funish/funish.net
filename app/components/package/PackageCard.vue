<script setup lang="ts">
import type { UnifiedSearchResult } from "~/composables/useSearch";

defineProps<{
  item: UnifiedSearchResult;
  maxKeywords?: number;
}>();

const { t } = useI18n();
</script>

<template>
  <NuxtLink
    :to="item.url"
    class="border-muted hover:bg-elevated block rounded-lg border p-4 transition-colors"
  >
    <!-- Top: name + version -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2">
        <UBadge :label="item.source" color="neutral" variant="subtle" size="sm" />
        <span class="truncate font-mono text-sm font-semibold">{{ item.name }}</span>
      </div>
      <span v-if="item.downloads" class="text-muted shrink-0 text-xs">
        {{ formatNumber(item.downloads)
        }}<span class="text-muted/60">{{ t("common.perMonth") }}</span>
      </span>
    </div>

    <!-- Description -->
    <p class="text-muted mt-1 line-clamp-1 text-sm">
      {{ item.description }}
    </p>

    <!-- Keywords (NPM only) -->
    <div v-if="item.keywords?.length" class="mt-1.5 flex flex-wrap gap-1">
      <UBadge
        v-for="kw in maxKeywords ? item.keywords?.slice(0, maxKeywords) : item.keywords"
        :key="kw"
        :label="kw"
        variant="outline"
        color="neutral"
        size="sm"
      />
    </div>

    <!-- Bottom meta -->
    <div class="text-muted mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
      <span
        v-if="item.authorUrl"
        class="hover:text-default cursor-pointer hover:underline"
        @click.stop="navigateTo(item.authorUrl!, { external: true })"
      >
        {{ item.author }}
      </span>
      <span v-else-if="item.author">{{ item.author }}</span>
      <span v-else-if="item.publisher">{{ item.publisher }}</span>

      <template v-if="item.author || item.authorUrl || item.publisher">
        <span class="text-muted/40">&middot;</span>
      </template>

      <span class="font-mono">{{ item.version }}</span>

      <template v-if="item.lastPublish">
        <span class="text-muted/40">&middot;</span>
        <span>{{ formatRelativeTime(item.lastPublish, t) }}</span>
      </template>

      <template v-if="item.license">
        <span class="text-muted/40">&middot;</span>
        <span>{{ item.license }}</span>
      </template>
    </div>
  </NuxtLink>
</template>
