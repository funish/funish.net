<script setup lang="ts">
import type { WingetLocaleData, WingetVersionData } from "~/types/winget";

const route = useRoute();
const slug = route.params.slug as string[];
const { packageName, version } = usePackageSlug(slug);

const { data: versions } = useNuxtData<WingetVersionData[]>(`winget-versions-${packageName}`);

const displayVersion = computed(() => {
  if (!versions.value?.length) return "";
  if (version && versions.value.some((v) => v.PackageVersion === version)) return version;
  const semver = versions.value.find((v) => /^\d/.test(v.PackageVersion));
  return semver?.PackageVersion ?? versions.value[0]!.PackageVersion;
});

const { data: locale } = useNuxtData<WingetLocaleData | undefined>(
  `winget-locale-${packageName}-${displayVersion.value}`,
);

const { t } = useI18n();
</script>

<template>
  <template v-if="!locale">
    <div class="space-y-3">
      <USkeleton class="h-6 w-48" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-3/4" />
    </div>
  </template>

  <div v-else class="space-y-6">
    <!-- Full description -->
    <div v-if="locale.Description">
      <p class="text-muted whitespace-pre-wrap">{{ locale.Description }}</p>
    </div>

    <!-- Publisher info -->
    <div
      v-if="locale.Publisher || locale.PublisherUrl || locale.PublisherSupportUrl || locale.Author"
      class="space-y-2"
    >
      <h3 class="font-semibold">{{ t("package.author") }}</h3>
      <div class="text-muted space-y-1 text-sm">
        <p v-if="locale.Publisher">
          {{ t("package.publisher") }}:
          <span class="text-default">{{ locale.Publisher }}</span>
        </p>
        <p v-if="locale.Author && locale.Author !== locale.Publisher">
          {{ t("package.author") }}: <span class="text-default">{{ locale.Author }}</span>
        </p>
        <p v-if="locale.Copyright">
          {{ locale.Copyright }}
        </p>
      </div>
    </div>

    <!-- Links -->
    <div class="flex flex-wrap gap-3 text-sm">
      <span v-if="locale.PackageUrl">
        <ULink :to="locale.PackageUrl" target="_blank" class="text-primary hover:underline">
          {{ t("package.homepage") }}
        </ULink>
      </span>
      <span v-if="locale.PublisherUrl">
        <ULink :to="locale.PublisherUrl" target="_blank" class="text-primary hover:underline">
          {{ t("package.publisher") }}
        </ULink>
      </span>
      <span v-if="locale.PublisherSupportUrl">
        <ULink
          :to="locale.PublisherSupportUrl"
          target="_blank"
          class="text-primary hover:underline"
        >
          {{ t("package.support") }}
        </ULink>
      </span>
      <span v-if="locale.License">
        {{ t("package.license") }}:
        <span v-if="locale.LicenseUrl">
          <ULink :to="locale.LicenseUrl" target="_blank" class="text-primary hover:underline">{{
            locale.License
          }}</ULink>
        </span>
        <span v-else class="text-default">{{ locale.License }}</span>
      </span>
      <span v-if="locale.PrivacyUrl">
        <ULink :to="locale.PrivacyUrl" target="_blank" class="text-primary hover:underline">
          {{ t("package.privacy") }}
        </ULink>
      </span>
      <span v-if="locale.PurchaseUrl">
        <ULink :to="locale.PurchaseUrl" target="_blank" class="text-primary hover:underline">
          {{ t("package.purchase") }}
        </ULink>
      </span>
    </div>

    <!-- Tags -->
    <div v-if="locale.Tags?.length">
      <h3 class="mb-2 font-semibold">{{ t("package.tags") }}</h3>
      <div class="flex flex-wrap gap-1">
        <UBadge
          v-for="tag in locale.Tags"
          :key="tag"
          :label="tag"
          variant="outline"
          color="neutral"
        />
      </div>
    </div>

    <!-- Release notes -->
    <div v-if="locale.ReleaseNotes">
      <h3 class="mb-2 font-semibold">{{ t("package.releaseNotes") }}</h3>
      <MDC :value="locale.ReleaseNotes" class="[&_img]:inline! [&_img]:w-auto!" />
    </div>

    <!-- Documentation links -->
    <div v-if="locale.Documentations?.length">
      <h3 class="mb-2 font-semibold">{{ t("package.documentation") }}</h3>
      <div class="space-y-1">
        <UButton
          v-for="doc in locale.Documentations"
          :key="doc.DocumentUrl"
          :label="doc.DocumentLabel"
          :to="doc.DocumentUrl"
          target="_blank"
          variant="link"
        />
      </div>
    </div>

    <!-- Installation notes -->
    <div v-if="locale.InstallationNotes">
      <h3 class="mb-2 font-semibold">{{ t("package.installationNotes") }}</h3>
      <MDC :value="locale.InstallationNotes" class="[&_img]:inline! [&_img]:w-auto!" />
    </div>
  </div>
</template>
