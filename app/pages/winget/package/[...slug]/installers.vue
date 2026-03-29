<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";

import type { WingetInstallerData } from "~/types/winget";

const packageName = inject<string>("wingetPackageName")!;
const displayVersion = inject<Ref<string>>("wingetDisplayVersion")!;
const { t } = useI18n();
const { getInstallers } = useWinget();

const table = useTemplateRef("table");

const {
  data: installers,
  pending,
  error,
} = await useAsyncData<WingetInstallerData[]>(
  `winget-installers-${packageName}-${displayVersion.value}`,
  () => getInstallers(packageName, displayVersion.value),
  { watch: [displayVersion], lazy: true },
);

function extractFilename(url: string): string {
  return new URL(url).pathname.split("/").pop() ?? url;
}

const columns: TableColumn<WingetInstallerData>[] = [
  {
    accessorKey: "InstallerUrl",
    header: t("package.installers"),
  },
  {
    accessorKey: "InstallerLocale",
    header: "Locale",
  },
  {
    id: "download",
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 20,
});
</script>

<template>
  <div class="py-4">
    <div v-if="pending" class="space-y-2">
      <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      icon="i-lucide-circle-alert"
      :title="t('common.error')"
    />

    <div v-else-if="installers?.length" class="space-y-4">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        :data="installers"
        :columns="columns"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        class="flex-1"
      >
        <template #InstallerUrl-cell="{ row }">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <span class="block truncate font-mono text-sm">
                {{ row.original.InstallerUrl ? extractFilename(row.original.InstallerUrl) : "N/A" }}
              </span>
              <p v-if="row.original.InstallerSha256" class="text-muted mt-1 truncate text-xs">
                SHA256: {{ row.original.InstallerSha256 }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <UBadge
                :label="row.original.Architecture ?? 'N/A'"
                variant="subtle"
                size="sm"
                color="neutral"
              />
              <UBadge
                v-if="row.original.InstallerType"
                :label="row.original.InstallerType"
                variant="subtle"
                size="sm"
                color="neutral"
              />
              <UBadge
                v-if="row.original.Scope"
                :label="row.original.Scope"
                variant="subtle"
                size="sm"
                color="neutral"
              />
              <UBadge
                v-if="row.original.Platform"
                :label="row.original.Platform"
                variant="subtle"
                size="sm"
                color="neutral"
              />
            </div>
          </div>
        </template>
        <template #download-cell="{ row }">
          <UButton
            v-if="row.original.InstallerUrl"
            :to="row.original.InstallerUrl"
            target="_blank"
            icon="i-lucide-download"
            variant="ghost"
            size="sm"
          />
        </template>
        <template #InstallerLocale-cell="{ row }">
          <span v-if="row.original.InstallerLocale" class="text-muted text-xs">{{
            row.original.InstallerLocale
          }}</span>
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

    <p v-else class="text-muted py-8 text-center">
      {{ t("package.noDependencies") }}
    </p>
  </div>
</template>
