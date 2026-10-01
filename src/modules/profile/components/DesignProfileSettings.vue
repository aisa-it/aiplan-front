<template>
  <v-form class="flex flex-col py-6">
    <ProfileSettingsRow title="Тема" description="Выберите тему">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span>Системная</span>
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
          label="Тема"
          :items="THEME_OPTIONS"
          :disabled="isSystemTheme || saving"
          @update:model-value="updateDesignSettings"
        />
      </div>
    </ProfileSettingsRow>

    <ProfileSettingsRow
      title="Просмотр задачи"
      description="Выберите как открывать задачи"
    >
      <v-select
        v-model="currentOpenIssue"
        label="Просмотр задачи"
        :items="ISSUE_OPEN_OPTIONS"
        :disabled="saving"
        @update:model-value="updateDesignSettings"
      />
    </ProfileSettingsRow>

    <ProfileSettingsRow
      title="Автосохранение"
      description="Автосохранение изменений в редакторе"
    >
      <v-select
        v-model="currentAutoSave"
        label="Автосохранение"
        :items="ISSUE_AUTO_SAVE_OPTIONS"
        :disabled="saving"
        @update:model-value="updateDesignSettings"
      />
    </ProfileSettingsRow>

    <ProfileSettingsRow
      v-if="ny"
      title="Осадки"
      description="Осадки в новогодней теме"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <v-select
          v-model="currentSnowEnable"
          label="Осадки"
          :items="SNOW_OPTIONS"
          @update:model-value="setSnow"
        />
        <v-select
          v-model="currentSnowDensity"
          label="Плотность осадков"
          :items="SNOW_DENSITY_OPTIONS"
          @update:model-value="setSnowDensity"
        />
      </div>
    </ProfileSettingsRow>
  </v-form>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { storeToRefs } from 'pinia';

import ProfileSettingsRow from './general-settings/ProfileSettingsRow.vue';

import { useUtilsStore } from '@/stores/utils-store.ts';
import { useDesignSettings } from '../composables/design-profile-settings/useDesignSettings';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const { ny } = storeToRefs(useUtilsStore());

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
</script>
