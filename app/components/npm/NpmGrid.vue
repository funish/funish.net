<script setup lang="ts">
import type { UnifiedSearchResult } from "~/composables/useSearch";

defineProps<{
  packages: UnifiedSearchResult[];
  loading?: boolean;
  emptyText?: string;
  maxKeywords?: number;
}>();

const { t } = useI18n();
</script>

<template>
  <div>
    <template v-if="loading">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="border-muted rounded-lg border p-4">
          <USkeleton class="h-5 w-36" />
          <USkeleton class="mt-2 h-4 w-full" />
          <USkeleton class="mt-1 h-3 w-24" />
        </div>
      </div>
    </template>

    <template v-else-if="packages.length > 0">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SearchPackageCard
          v-for="(pkg, i) in packages"
          :key="i"
          :item="pkg"
          :max-keywords="maxKeywords"
        />
      </div>
    </template>

    <p v-else class="text-muted py-12 text-center">
      {{ emptyText || t("common.noResults") }}
    </p>
  </div>
</template>
