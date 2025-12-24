<template>
  <q-form class="design-form">
    <div class="design-form__row">
      <div class="theme-title-wrapper">
        <h4 class="text-lg font-semibold text-brand-base">Тема</h4>
        <p class="text-sm text-brand-secondary">Выберите тему</p>
      </div>
      <div class="design-form__col design-form__inputs">
        <q-toggle
          v-model="isSystemTheme"
          size="32px"
          label="Системная"
          left-label
          @update:model-value="handleThemeSelect"
        />
        <q-select
          v-model="currentTheme"
          :options="themes"
          :disable="isSystemTheme"
          class="base-selector design-form__col"
          :style="{ 'min-width': ny ? '48%' : '50%' }"
          label="Тема"
          input-debounce="300"
          fill-input
          map-options
          dense
          @update:model-value="handleThemeSelect"
        />
      </div>
    </div>
    <div class="design-form__row">
      <div class="theme-title-wrapper">
        <h4 class="text-lg font-semibold text-brand-base">Просмотр задачи</h4>
        <p class="text-sm text-brand-secondary">
          Выберите как открывать задачи
        </p>
      </div>
      <q-select
        v-model="currentOpenIssue"
        :options="ISSUE_OPEN"
        class="base-selector design-form__col"
        label="Просмотр задачи"
        input-debounce="300"
        fill-input
        map-options
        dense
        @update:model-value="handleThemeSelect"
      />
    </div>
    <div class="design-form__row">
      <div class="theme-title-wrapper">
        <h4 class="text-lg font-semibold text-brand-base">Автосохранение</h4>
        <p class="text-sm text-brand-secondary">
          Автосохранение изменений в редакторе
        </p>
      </div>
      <q-select
        v-model="currentAutoSave"
        :options="ISSUE_AUTO_SAVE"
        class="base-selector design-form__col"
        label="Автосохранение"
        input-debounce="300"
        fill-input
        map-options
        dense
        @update:model-value="handleThemeSelect"
      />
    </div>

    <div v-if="ny" class="design-form__row">
      <div class="theme-title-wrapper">
        <h4 class="text-lg font-semibold text-brand-base">Осадки</h4>
        <p class="text-sm text-brand-secondary">Осадки в новогодней теме</p>
      </div>
      <div class="design-form__col design-form__inputs">
        <q-select
          v-model="currentSnowEnable"
          :options="TURN_ON_OFF"
          class="base-selector design-form__col"
          style="min-width: 48%;"
          label="Осадки"
          input-debounce="300"
          fill-input
          map-options
          dense
          @update:model-value="({ value }) => setSnow(value)"
        />
        <q-select
          v-model="currentSnowDensity"
          :options="SNOW_DENSITY"
          class="base-selector design-form__col"
          style="min-width: 48%;"
          label="Плотность осадков"
          input-debounce="300"
          fill-input
          map-options
          dense
          @update:model-value="({ value }) => setSnowDensity(value)"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { useDesignSettings } from '../composables/design-profile-settings/useDesignSettings';

const {
  themes,
  currentTheme,
  isSystemTheme,
  handleThemeSelect,
  currentOpenIssue,
  ISSUE_OPEN,
  currentAutoSave,
  ISSUE_AUTO_SAVE,
  ny,
  currentSnowEnable,
  TURN_ON_OFF,
  setSnow,
  SNOW_DENSITY,
  currentSnowDensity,
  setSnowDensity,
} = useDesignSettings();
</script>

<style scoped lang="scss">
.design-form {
  display: flex;
  flex-direction: column;

  &__row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  &__col {
    min-width: 50%;
    margin: 0.375em 0;
  }

  &__inputs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
}

@media screen and (width < 600px) {
  .design-form {
    gap: 16px;

    &__row {
      flex-direction: column;
      gap: 0;
    }
  }
}
</style>
