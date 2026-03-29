<script setup lang="ts">
const { t } = useI18n();

const searchTerm = ref("");
const source = ref<"npm" | "winget">("npm");

const sourceItems = computed(() => [
  { label: "NPM", value: "npm" as const, icon: "i-simple-icons-npm" },
  { label: "Winget", value: "winget" as const, icon: "i-lucide-package" },
]);

function handleSearch() {
  if (searchTerm.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchTerm.value.trim())}&source=${source.value}`);
  }
}

useSeoMeta({
  title: () => t("home.title"),
  description: () => t("home.subtitle"),
});
</script>

<template>
  <UPage>
    <UPageHero :title="t('home.title')" :description="t('home.subtitle')">
      <template #default>
        <UContainer class="max-w-2xl">
          <UForm @submit="handleSearch">
            <UFieldGroup class="w-full">
              <USelectMenu
                v-model="source"
                :items="sourceItems"
                value-key="value"
                :ui="{ base: 'w-28 shrink-0' }"
              />
              <UInput
                v-model="searchTerm"
                :placeholder="t('home.searchPlaceholder')"
                icon="i-lucide-search"
                size="lg"
                class="flex-1"
                @keydown.enter="handleSearch"
              />
            </UFieldGroup>
          </UForm>
        </UContainer>
      </template>
    </UPageHero>
  </UPage>
</template>
