<script setup lang="ts">
const props = defineProps<{
  source: "npm" | "winget";
  name: string;
  description?: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: string;
  bugs?: string;
  author?: string;
  authorUrl?: string;
  maintainers?: { name: string; email: string }[];
  downloads?: number;
  lastPublish?: string;
  distTags?: Record<string, string>;
  keywords?: string[];
  identifier?: string;
  size?: number;
  fileCount?: number;
}>();

const { t } = useI18n();

// Parse scoped npm package name (e.g. "@vue/core" -> { scope: "vue", rest: "core" })
const scopeInfo = computed(() => {
  if (props.source !== "npm" || !props.name.startsWith("@")) return null;
  const slashIndex = props.name.indexOf("/");
  if (slashIndex === -1) return null;
  return { scope: props.name.slice(1, slashIndex), rest: props.name.slice(slashIndex + 1) };
});

const { copy, copied } = useClipboard();
const readmeLoading = ref(false);

async function copyReadme() {
  if (props.source !== "npm" || readmeLoading.value) return;
  readmeLoading.value = true;
  try {
    const { getReadme } = useJsdelivr();
    const readme = await getReadme(props.name, props.version);
    if (readme) await copy(readme);
  } catch {
    // ignore
  } finally {
    readmeLoading.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Name + tags + links -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="font-mono text-2xl font-bold">
          <template v-if="scopeInfo">
            <NuxtLink :to="`/npm/org/${scopeInfo.scope}`" class="hover:text-primary hover:underline"
              >@{{ scopeInfo.scope }}/</NuxtLink
            >{{ scopeInfo.rest }}
          </template>
          <template v-else>{{ name }}</template>
        </h1>
        <UBadge v-if="distTags?.latest" :label="`v${version}`" variant="subtle" color="primary" />
        <UBadge
          v-for="tag in Object.keys(distTags || {}).filter((t) => t !== 'latest')"
          :key="tag"
          :label="tag"
          variant="subtle"
          color="neutral"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          v-if="homepage"
          :to="homepage"
          target="_blank"
          :label="t('package.homepage')"
          icon="i-lucide-external-link"
          variant="outline"
          size="sm"
        />
        <UButton
          v-if="repository"
          :to="repository"
          target="_blank"
          :label="t('package.repository')"
          icon="i-lucide-github"
          variant="outline"
          size="sm"
        />
        <UButton
          v-if="bugs"
          :to="bugs"
          target="_blank"
          :label="t('package.issues')"
          icon="i-lucide-circle-alert"
          variant="outline"
          size="sm"
        />
        <UButton
          v-if="source === 'npm'"
          :label="copied ? t('package.copied') : t('package.copyReadme')"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :loading="readmeLoading"
          variant="outline"
          size="sm"
          @click="copyReadme"
        />
      </div>
    </div>

    <!-- Description -->
    <p v-if="description" class="text-muted text-lg">
      {{ description }}
    </p>

    <!-- Meta info row -->
    <div class="text-muted flex flex-wrap items-center gap-4 text-sm">
      <span v-if="author">
        {{ t("package.author") }}:
        <NuxtLink v-if="authorUrl" :to="authorUrl" class="text-default hover:underline">
          {{ author }}
        </NuxtLink>
        <span v-else class="text-default">{{ author }}</span>
      </span>
      <span v-if="maintainers?.length">
        {{ t("package.maintainers") }}:
        <template v-for="(m, i) in maintainers" :key="m.name">
          <NuxtLink :to="`/npm/user/${m.name}`" class="text-default hover:underline">{{
            m.name
          }}</NuxtLink
          ><span v-if="i < maintainers.length - 1">, </span>
        </template>
      </span>
      <span v-if="license">
        {{ t("package.license") }}:
        <span class="text-default">{{ license }}</span>
      </span>
      <span v-if="lastPublish">
        {{ t("package.lastPublish") }}:
        <span class="text-default">{{ formatRelativeTime(lastPublish, t) }}</span>
      </span>
      <span v-if="downloads">
        {{ t("package.downloads") }}:
        <span class="text-default">{{ formatNumber(downloads) }}/{{ t("package.monthly") }}</span>
      </span>
      <span v-if="size">
        {{ t("package.size") }}:
        <span class="text-default">{{ formatFileSize(size) }}</span>
      </span>
      <span v-if="fileCount">
        {{ t("package.files_count") }}:
        <span class="text-default">{{ fileCount }}</span>
      </span>
    </div>

    <!-- Install command (NPM only) -->
    <ProseCodeGroup v-if="source === 'npm'">
      <ProsePre filename="npm" :code="installCommand(name, 'npm')">{{
        installCommand(name, "npm")
      }}</ProsePre>
      <ProsePre filename="pnpm" :code="installCommand(name, 'pnpm')">{{
        installCommand(name, "pnpm")
      }}</ProsePre>
      <ProsePre filename="yarn" :code="installCommand(name, 'yarn')">{{
        installCommand(name, "yarn")
      }}</ProsePre>
      <ProsePre filename="bun" :code="installCommand(name, 'bun')">{{
        installCommand(name, "bun")
      }}</ProsePre>
    </ProseCodeGroup>

    <!-- Install command (Winget) -->
    <ProseCodeGroup v-else-if="source === 'winget'">
      <ProsePre
        icon="i-lucide-package"
        filename="winget"
        :code="`winget install --id ${identifier ?? name}`"
        >{{ `winget install --id ${identifier ?? name}` }}</ProsePre
      >
    </ProseCodeGroup>

    <!-- Keywords -->
    <div v-if="keywords?.length" class="flex flex-wrap gap-1">
      <UBadge
        v-for="kw in keywords.slice(0, 15)"
        :key="kw"
        :label="kw"
        variant="outline"
        color="neutral"
      />
    </div>

    <USeparator />
  </div>
</template>
