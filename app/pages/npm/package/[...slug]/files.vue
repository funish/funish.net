<script setup lang="ts">
import type { TreeItem } from "@nuxt/ui";

import type { JsdelivrFileNode, JsdelivrFileList } from "~/types/npm";

const pkg = inject<Ref>("npmPkg")!;
const packageName = inject<string>("npmPackageName")!;
const version = computed(() => pkg.value?.version ?? "latest");

const { t } = useI18n();
const { getFiles, getFileContent } = useJsdelivr();

const selectedPath = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const fileLoading = ref(false);
const fileError = ref(false);

const binaryExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".svg",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".wasm",
  ".bin",
  ".dat",
]);

function toTreeItems(nodes: JsdelivrFileNode[], parentPath = ""): TreeItem[] {
  return nodes
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((node) => {
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      const isDir = node.type === "directory";

      const item: TreeItem = {
        label: node.name,
        defaultExpanded: false,
      };

      if (isDir && node.files?.length) {
        item.children = toTreeItems(node.files, currentPath);
      } else if (!isDir) {
        item.onSelect = () => {
          selectedPath.value = currentPath;
          loadFileContent(currentPath);
        };
      }

      return item;
    });
}

async function loadFileContent(path: string) {
  const ext = path.includes(".") ? `.${path.split(".").pop()!}` : "";
  if (binaryExtensions.has(ext)) {
    fileContent.value = null;
    fileError.value = false;
    return;
  }

  fileLoading.value = true;
  fileError.value = false;
  try {
    fileContent.value = await getFileContent(packageName, version.value, path);
  } catch {
    fileError.value = true;
    fileContent.value = null;
  } finally {
    fileLoading.value = false;
  }
}

const {
  data: fileList,
  pending,
  error,
} = await useAsyncData<JsdelivrFileList>(
  `files-${packageName}-${version.value}`,
  () => getFiles(packageName, version.value),
  { lazy: true },
);

const treeItems = computed(() => {
  if (!fileList.value?.files) return [];
  return toTreeItems(fileList.value.files);
});

const isBinaryFile = computed(() => {
  if (!selectedPath.value) return false;
  const ext = selectedPath.value.includes(".") ? `.${selectedPath.value.split(".").pop()!}` : "";
  return binaryExtensions.has(ext);
});
</script>

<template>
  <div class="py-4">
    <template v-if="pending">
      <div class="space-y-2">
        <USkeleton v-for="i in 10" :key="i" class="h-5 w-full" />
      </div>
    </template>

    <template v-else-if="error">
      <UAlert color="error" icon="i-lucide-circle-alert" :title="t('common.error')" />
    </template>

    <template v-else>
      <div class="border-muted flex flex-col overflow-hidden rounded-lg border sm:flex-row">
        <!-- File tree -->
        <div
          class="bg-muted/30 sm:border-muted max-h-80 shrink-0 overflow-auto p-2 sm:max-h-150 sm:w-70 sm:border-r"
        >
          <UTree v-if="treeItems.length" :items="treeItems" class="w-full">
            <template #item-leading="{ item }">
              <ProseCodeIcon
                v-if="!item.children?.length"
                :filename="item.label"
                class="size-4 shrink-0"
              />
            </template>
          </UTree>
        </div>

        <!-- File preview -->
        <div
          class="max-h-150 min-w-0 flex-1 overflow-auto [&>div]:my-0! [&>div]:rounded-none! [&>div]:border-0!"
        >
          <template v-if="fileLoading">
            <div class="flex h-full min-h-48 items-center justify-center">
              <UIcon name="i-lucide-loader-2" class="text-muted size-6 animate-spin" />
            </div>
          </template>

          <template v-else-if="fileError">
            <div class="flex h-full min-h-48 items-center justify-center">
              <p class="text-error text-sm">{{ t("package.fetchFileError") }}</p>
            </div>
          </template>

          <template v-else-if="isBinaryFile">
            <div class="text-muted flex h-full min-h-48 flex-col items-center justify-center gap-2">
              <UIcon name="i-lucide-file-x" class="size-8" />
              <p class="text-sm">{{ t("package.binaryFile") }}</p>
            </div>
          </template>

          <template v-else-if="fileContent !== null">
            <ProsePre
              :filename="selectedPath ?? ''"
              :language="selectedPath?.includes('.') ? selectedPath.split('.').pop() : undefined"
              :code="fileContent"
              :ui="{
                header: 'rounded-none',
                base: 'rounded-none',
              }"
            >
              {{ fileContent }}
            </ProsePre>
          </template>

          <template v-else>
            <div class="text-muted flex h-full min-h-48 flex-col items-center justify-center gap-2">
              <UIcon name="i-lucide-file-search" class="size-8" />
              <p class="text-sm">{{ t("package.selectFile") }}</p>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
