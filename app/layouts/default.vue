<script setup lang="ts">
const { t, setLocale, locale: i18nLocale } = useI18n();

const navItems = computed(() => [
  { label: t("nav.home"), to: "/" },
  { label: t("nav.explore"), to: "/explore" },
]);

function toggleLocale() {
  setLocale(i18nLocale.value === "en" ? "zh_cn" : "en");
}

const footerItems = computed(() => [
  { label: "Nexus", to: "https://nexus.funish.net", target: "_blank" },
]);
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <UHeader :ui="{ container: 'max-w-7xl' }">
      <template #title>
        <span class="text-lg font-bold">Funish</span>
      </template>

      <UNavigationMenu :items="navItems" />

      <template #right>
        <UButton
          icon="i-lucide-search"
          variant="ghost"
          :aria-label="t('nav.search')"
          to="/search"
        />
        <UButton
          icon="i-lucide-languages"
          variant="ghost"
          :aria-label="t('nav.switchLocale')"
          @click="toggleLocale"
        />
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <USeparator />

    <UFooter :ui="{ container: 'max-w-7xl' }">
      <template #left>
        <span class="text-muted text-sm"> &copy; {{ new Date().getFullYear() }} Funish </span>
      </template>

      <UNavigationMenu :items="footerItems" variant="link" />

      <template #right>
        <UButton
          to="https://github.com/funish"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </div>
</template>
