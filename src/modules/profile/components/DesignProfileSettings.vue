<template>
  <v-form class="flex flex-col py-6">
    <ProfileSettingsRow
      :title="t('common.fields.language')"
      :description="t('profile.design.language.description')"
    >
      <!-- lang у названий языков — чтобы скринридер читал «English» по-английски (WCAG 3.1.2) -->
      <v-select
        v-model="currentLocale"
        :label="t('common.fields.language')"
        :items="LOCALE_OPTIONS"
        :item-props="(item) => ({ lang: item.value })"
      >
        <template #selection="{ item }">
          <span :lang="item.value">{{ item.title }}</span>
        </template>
      </v-select>
    </ProfileSettingsRow>

    <ProfileSettingsRow
      :title="t('common.fields.theme')"
      :description="t('profile.design.theme.description')"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span>{{ t('profile.design.theme.system') }}</span>
          <v-switch
            v-model="isSystemTheme"
            color="primary"
            hide-details
            :disabled="saving"
            @update:model-value="updateDesignSettings"
          />
        </div>

        <v-select
          v-model="currentTheme"
          class="min-w-0 flex-1"
          :label="t('common.fields.theme')"
          :items="themeOptions"
          :disabled="isSystemTheme || saving"
          @update:model-value="updateDesignSettings"
        />
      </div>
    </ProfileSettingsRow>

    <ProfileSettingsRow
      :title="t('profile.design.issueOpen.title')"
      :description="t('profile.design.issueOpen.description')"
    >
      <v-select
        v-model="currentOpenIssue"
        :label="t('profile.design.issueOpen.label')"
        :items="issueOpenOptions"
        :disabled="saving"
        @update:model-value="updateDesignSettings"
      />
    </ProfileSettingsRow>

    <ProfileSettingsRow
      :title="t('profile.design.autoSave.title')"
      :description="t('profile.design.autoSave.description')"
    >
      <v-select
        v-model="currentAutoSave"
        :label="t('profile.design.autoSave.label')"
        :items="issueAutoSaveOptions"
        :disabled="saving"
        @update:model-value="updateDesignSettings"
      />
    </ProfileSettingsRow>

    <ProfileSettingsRow
      v-if="ny"
      :title="t('profile.design.snow.title')"
      :description="t('profile.design.snow.description')"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <v-select
          v-model="currentSnowEnable"
          :label="t('profile.design.snow.label')"
          :items="snowOptions"
          @update:model-value="setSnow"
        />
        <v-select
          v-model="currentSnowDensity"
          :label="t('profile.design.snow.densityLabel')"
          :items="snowDensityOptions"
          @update:model-value="setSnowDensity"
        />
      </div>
    </ProfileSettingsRow>
  </v-form>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import ProfileSettingsRow from './general-settings/ProfileSettingsRow.vue';

import { useUtilsStore } from '@/stores/utils-store.ts';
import { i18n, LOCALE_OPTIONS, setLocale, type AppLocale } from '@/i18n';
import { useTranslatedOptions } from '@/i18n/useTranslatedOptions';
import { useDesignSettings } from '../composables/design-profile-settings/useDesignSettings';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const { t } = useI18n();
const { ny } = storeToRefs(useUtilsStore());

const currentLocale = computed<AppLocale>({
  get: () => i18n.global.locale.value,
  set: (locale) => void setLocale(locale),
});

const {
  currentAutoSave,
  currentOpenIssue,
  currentSnowDensity,
  currentSnowEnable,
  currentTheme,
  isSystemTheme,
  ISSUE_AUTO_SAVE_OPTIONS,
  ISSUE_OPEN_OPTIONS,
  saving,
  setSnow,
  setSnowDensity,
  SNOW_DENSITY_OPTIONS,
  SNOW_OPTIONS,
  THEME_OPTIONS,
  updateDesignSettings,
} = useDesignSettings(toRef(props, 'user'));

const themeOptions = useTranslatedOptions(THEME_OPTIONS);
const issueOpenOptions = useTranslatedOptions(ISSUE_OPEN_OPTIONS);
const issueAutoSaveOptions = useTranslatedOptions(ISSUE_AUTO_SAVE_OPTIONS);
const snowOptions = useTranslatedOptions(SNOW_OPTIONS);
const snowDensityOptions = useTranslatedOptions(SNOW_DENSITY_OPTIONS);
</script>
