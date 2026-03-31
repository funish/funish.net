<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";

import type { WingetVersionData } from "~/types/winget";

const packageName = inject<string>("wingetPackageName")!;
const displayVersion = inject<Ref<string>>("wingetDisplayVersion")!;
const versions = inject<Ref<WingetVersionData[] | undefined>>("wingetVersions")!;
const { t } = useI18n();

const table = useTemplateRef("table");

const data = computed(() => versions.value ?? []);

const columns: TableColumn<WingetVersionData>[] = [
  {
    accessorKey: "PackageVersion",
    header: t("package.version"),
  },
  {
    accessorKey: "DefaultLocale",
    header: "Locale",
  },
  {
    accessorKey: "Channel",
    header: "Channel",
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
      <template #PackageVersion-cell="{ row }">
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/winget/package/${packageName}/v/${row.original.PackageVersion}`"
            class="font-mono hover:underline"
          >
            {{ row.original.PackageVersion }}
          </NuxtLink>
          <UBadge
            v-if="row.original.PackageVersion === unref(displayVersion)"
            :label="t('package.current')"
            color="primary"
            variant="subtle"
          />
        </div>
      </template>
      <template #DefaultLocale-cell="{ row }">
        <span class="text-muted">{{ row.original.DefaultLocale }}</span>
      </template>
      <template #Channel-cell="{ row }">
        <span class="text-muted">{{ row.original.Channel || "-" }}</span>
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
