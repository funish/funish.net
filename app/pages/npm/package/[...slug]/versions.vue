<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";

import type { NpmPackageFull } from "~/types/npm";

const pkg = inject<Ref>("npmPkg")!;
const packageName = inject<string>("npmPackageName")!;
const currentVersion = inject<string | null>("npmVersion")!;

const { t } = useI18n();
const { getFullMetadata } = useNpm();

const table = useTemplateRef("table");

const { data: metadata } = await useAsyncData<NpmPackageFull>(
  `npm-metadata-${packageName}`,
  () => getFullMetadata(packageName),
  { lazy: true },
);

const distTags = computed(() => metadata.value?.["dist-tags"] ?? {});

type VersionRow = {
  version: string;
  date: string;
  isCurrent: boolean;
  tags: string[];
};

const data = computed<VersionRow[]>(() => {
  if (!metadata.value?.time) return [];
  const skip = new Set(["created", "modified"]);
  return Object.entries(metadata.value.time)
    .filter(([key]) => !skip.has(key))
    .map(([version, date]) => ({
      version,
      date,
      isCurrent: version === (currentVersion ?? pkg.value?.version),
      tags: Object.entries(distTags.value)
        .filter(([, v]) => v === version)
        .map(([tag]) => tag),
    }))
    .reverse();
});

const columns: TableColumn<VersionRow>[] = [
  {
    accessorKey: "version",
    header: t("package.version"),
  },
  {
    accessorKey: "date",
    header: t("package.lastPublish"),
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 20,
});
</script>

<template>
  <div class="py-4">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="data"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #version-cell="{ row }">
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/npm/package/${packageName}/v/${row.original.version}`"
            class="font-mono hover:underline"
          >
            {{ row.original.version }}
          </NuxtLink>
          <UBadge
            v-if="row.original.isCurrent"
            :label="t('package.current')"
            color="primary"
            variant="subtle"
          />
          <UBadge
            v-for="tag in row.original.tags"
            :key="tag"
            :label="tag"
            :color="tag === 'latest' ? 'primary' : 'neutral'"
            variant="subtle"
          />
        </div>
      </template>
      <template #date-cell="{ row }">
        <span class="text-muted">{{ formatRelativeTime(row.original.date, t) }}</span>
      </template>
    </UTable>

    <div class="border-default flex justify-end border-t px-4 pt-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>
