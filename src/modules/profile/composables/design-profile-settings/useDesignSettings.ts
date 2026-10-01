import { ref, watch, type Ref } from 'vue';

import { useUserStore } from '@/stores/user-store';

import {
  ISSUE_AUTO_SAVE_OPTIONS,
  ISSUE_OPEN_OPTIONS,
  SNOW_DENSITY_OPTIONS,
  SNOW_OPTIONS,
  THEME_OPTIONS,
  type SnowState,
  type ThemeName,
} from '../../configs/design-settings.config';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const DEFAULT_SNOW_DENSITY = 170;

export function useDesignSettings(user: Ref<DtoUser>) {
  const userStore = useUserStore();

  const currentTheme = ref<ThemeName>('light');
  const isSystemTheme = ref(false);
  const currentOpenIssue = ref(false);
  const currentAutoSave = ref(false);
  const currentSnowEnable = ref<SnowState>(
    localStorage.getItem('snow') === 'disable' ? 'disable' : 'enable',
  );
  const currentSnowDensity = ref(
    SNOW_DENSITY_OPTIONS.some(
      ({ value }) => value === Number(localStorage.getItem('snowDensity')),
    )
      ? Number(localStorage.getItem('snowDensity'))
      : DEFAULT_SNOW_DENSITY,
  );
  const saving = ref(false);

  const syncUserSettings = (value: DtoUser) => {
    currentTheme.value = value.theme?.dark ? 'dark' : 'light';
    isSystemTheme.value = value.theme?.system ?? false;
    currentOpenIssue.value = value.theme?.open_in_new ?? false;
    currentAutoSave.value = value.view_props?.autoSave ?? false;
  };

  const updateDesignSettings = async () => {
    saving.value = true;

    try {
      await userStore.updateCurrentUser({
        theme: {
          ...user.value.theme,
          dark: currentTheme.value === 'dark',
          contrast: user.value.theme?.contrast ?? false,
          open_in_new: currentOpenIssue.value,
          system: isSystemTheme.value,
        },
        view_props: {
          ...user.value.view_props,
          autoSave: currentAutoSave.value,
        },
      });

      // TODO: показать уведомление SUCCESS_UPDATE_DATA после переноса системы уведомлений.
    } catch (error) {
      void error;
      syncUserSettings(user.value);
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      saving.value = false;
    }
  };

  const setSnow = (value: SnowState) => {
    localStorage.setItem('snow', value);
    location.reload();
  };

  const setSnowDensity = (value: number) => {
    localStorage.setItem('snowDensity', String(value));
    location.reload();
  };

  watch(user, syncUserSettings, { immediate: true });

  return {
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
  };
}
