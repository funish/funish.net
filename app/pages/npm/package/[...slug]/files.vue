<script setup lang="ts">
import type { TreeItem } from "@nuxt/ui";
import { bundledLanguages } from "shiki";

import type { JsdelivrFileNode, JsdelivrFileList, NpmPackage, NpmPackageFull } from "~/types/npm";

const route = useRoute();
const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);
const { data: metadata } = useNuxtData<NpmPackageFull>(`npm-metadata-${packageName}`);
const pkg = computed<NpmPackage | undefined>(() => {
  if (!metadata.value) return undefined;
  const ver = version ?? metadata.value["dist-tags"]?.latest;
  return ver ? metadata.value.versions?.[ver] : undefined;
});
const currentVersion = computed(() => pkg.value?.version ?? "latest");

const { t } = useI18n();
const { getFiles, getFileContent } = useJsdelivr();

const selectedPath = ref<string | null>(null);
const fileContent = ref<string | null>(null);
const fileLoading = ref(false);
const fileError = ref(false);

const textFileWhitelist = new Set([
  ".env",
  ".gitignore",
  ".editorconfig",
  ".npmrc",
  ".nvmrc",
  ".dockerignore",
  "license",
  "changelog",
  "notice",
  "authors",
  "makefile",
]);

function isCodeFile(path: string): boolean {
  const filename = path.includes("/") ? path.split("/").pop()! : path;
  if (textFileWhitelist.has(filename.toLowerCase())) return true;
  const ext = path.includes(".") ? path.split(".").pop()! : "";
  return !!ext && ext in bundledLanguages;
}

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
  if (!isCodeFile(path)) {
    fileContent.value = null;
    fileError.value = false;
    return;
  }

  fileLoading.value = true;
  fileError.value = false;
  try {
    fileContent.value = await getFileContent(packageName, currentVersion.value, path);
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
  `files-${packageName}-${currentVersion.value}`,
  () => getFiles(packageName, currentVersion.value),
  { lazy: true },
);

const treeItems = computed(() => {
  if (!fileList.value?.files) return [];
  return toTreeItems(fileList.value.files);
});

const isBinaryFile = computed(() => {
  return selectedPath.value ? !isCodeFile(selectedPath.value) : false;
});

const mdcContent = computed(() => {
  if (!fileContent.value || !selectedPath.value) return "";
  const ext = selectedPath.value.includes(".") ? selectedPath.value.split(".").pop()! : "text";
  const filename = selectedPath.value.split("/").pop()!;
  const fence = fileContent.value.includes("```") ? "````" : "```";
  return `${fence}${ext} [${filename}]\n${fileContent.value}\n${fence}`;
});
</script>

<template>
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
          <MDC
            :key="selectedPath ?? ''"
            :value="mdcContent"
            tag="div"
            class="[&>div]:my-0! [&>div]:rounded-none! [&>div]:border-0!"
          />
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
</template>
